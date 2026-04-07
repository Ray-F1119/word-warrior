/**
 * QuizSystem.js — Question Generation + Spaced Repetition + Validation
 */
const QuizSystem = {
    currentQuestion: null,
    questionStartTime: 0,
    questionCount: 0,
    lastChar: null,           // hard anti-repeat: always block last char
    recentChars: [],          // ring buffer — last N chars asked
    RECENT_WINDOW: 8,         // how many to exclude (increased from 5)
    lastType: null,           // track last question type to avoid patterns

    /** Reset for new round */
    reset() {
        this.currentQuestion = null;
        this.questionStartTime = 0;
        this.questionCount = 0;
        this.lastChar = null;
        this.recentChars = [];
        this.lastType = null;
    },

    /**
     * Generate next question
     * @returns {{ type, char, pinyin, meaning, options, correctIndex }}
     */
    generateQuestion() {
        const semester = gameState.round.semester;
        const chars = getCharacters(semester);
        if (chars.length === 0) return null;

        // Select character based on spaced repetition (with anti-repeat)
        const selected = this._selectCharacter(chars);
        if (!selected) return null;

        // Weighted random question type (70/30 bias away from last type)
        let type;
        if (!this.lastType) {
            type = Math.random() < 0.5 ? 'char_to_pinyin' : 'pinyin_to_char';
        } else {
            // 70% chance of switching type, 30% same type
            const switchType = Math.random() < 0.7;
            if (switchType) {
                type = this.lastType === 'char_to_pinyin' ? 'pinyin_to_char' : 'char_to_pinyin';
            } else {
                type = this.lastType;
            }
        }
        this.lastType = type;
        this.questionCount++;

        let question;
        if (type === 'char_to_pinyin') {
            question = this._makeCharToPinyin(selected, semester);
        } else {
            question = this._makePinyinToChar(selected, semester);
        }

        // Track last char for hard anti-repeat
        this.lastChar = selected.char;

        this.currentQuestion = question;
        this.questionStartTime = Date.now();
        return question;
    },

    /** Generate 看字选音 question */
    _makeCharToPinyin(charObj, semester) {
        const distractors = getDistractors(charObj, 3, semester);
        const options = [
            { text: charObj.pinyin, correct: true },
            ...distractors.map(d => ({ text: d.pinyin, correct: false }))
        ];

        // Ensure no duplicate pinyin
        const unique = [];
        const seen = new Set();
        for (const opt of options) {
            if (!seen.has(opt.text)) {
                seen.add(opt.text);
                unique.push(opt);
            }
        }
        // Fill if we lost options due to duplicates
        while (unique.length < 4) {
            const allChars = getCharacters(semester);
            const extra = allChars[Math.floor(Math.random() * allChars.length)];
            if (!seen.has(extra.pinyin) && extra.char !== charObj.char) {
                seen.add(extra.pinyin);
                unique.push({ text: extra.pinyin, correct: false });
            }
        }

        // Shuffle
        this._shuffle(unique);
        const correctIndex = unique.findIndex(o => o.correct);

        return {
            type: 'char_to_pinyin',
            display: charObj.char,
            prompt: '选择正确的读音',
            charObj: charObj,
            options: unique.map(o => o.text),
            correctIndex: correctIndex,
            correctAnswer: charObj.pinyin
        };
    },

    /** Generate 看拼音选字 question */
    _makePinyinToChar(charObj, semester) {
        const distractors = getDistractors(charObj, 3, semester);
        const options = [
            { text: charObj.char, correct: true },
            ...distractors.map(d => ({ text: d.char, correct: false }))
        ];

        // Ensure no duplicates
        const unique = [];
        const seen = new Set();
        for (const opt of options) {
            if (!seen.has(opt.text)) {
                seen.add(opt.text);
                unique.push(opt);
            }
        }
        while (unique.length < 4) {
            const allChars = getCharacters(semester);
            const extra = allChars[Math.floor(Math.random() * allChars.length)];
            if (!seen.has(extra.char) && extra.char !== charObj.char) {
                seen.add(extra.char);
                unique.push({ text: extra.char, correct: false });
            }
        }

        this._shuffle(unique);
        const correctIndex = unique.findIndex(o => o.correct);

        return {
            type: 'pinyin_to_char',
            display: charObj.pinyin,
            prompt: '选择正确的汉字',
            charObj: charObj,
            options: unique.map(o => o.text),
            correctIndex: correctIndex,
            correctAnswer: charObj.char
        };
    },

    /**
     * Select character based on spaced repetition + anti-repeat
     * Priority: learning (50%) > new (20%) > review (20%) > mastered (10%)
     * Hard rule: NEVER pick the same char as lastChar
     */
    _selectCharacter(allChars) {
        const mastery = gameState.mastery;
        const buckets = { new: [], learning: [], review: [], mastered: [] };

        for (const c of allChars) {
            const state = mastery[c.char]?.state || 'new';
            buckets[state].push(c);
        }

        // Build a priority-ordered list of buckets to try
        const roll = Math.random();
        let bucketOrder;
        if (roll < 0.50) {
            bucketOrder = ['learning', 'new', 'review', 'mastered'];
        } else if (roll < 0.70) {
            bucketOrder = ['new', 'learning', 'review', 'mastered'];
        } else if (roll < 0.90) {
            bucketOrder = ['review', 'learning', 'new', 'mastered'];
        } else {
            bucketOrder = ['mastered', 'review', 'learning', 'new'];
        }

        // Introduce max 8 new chars per round
        const newIntroduced = gameState.round.answeredChars.filter(c =>
            mastery[c]?.state === 'learning' && (mastery[c]?.correct || 0) <= 1
        ).length;
        const newCapped = newIntroduced >= 8;

        // Build exclusion set: lastChar (hard block) + recentChars (soft)
        const hardBlock = this.lastChar;
        const recent = new Set(this.recentChars);

        // Try each bucket in priority order, looking for fresh candidates
        for (const bucketName of bucketOrder) {
            if (newCapped && bucketName === 'new') continue;
            const bucket = buckets[bucketName];
            if (bucket.length === 0) continue;

            // Filter: exclude hard-blocked last char AND recent window
            const fresh = bucket.filter(c => c.char !== hardBlock && !recent.has(c.char));
            if (fresh.length > 0) {
                return this._pickAndTrack(fresh);
            }

            // Softer: exclude only hard-blocked last char
            const nonRepeat = bucket.filter(c => c.char !== hardBlock);
            if (nonRepeat.length > 0) {
                return this._pickAndTrack(nonRepeat);
            }
        }

        // Ultimate fallback: pick any char that isn't the last one
        const any = allChars.filter(c => c.char !== hardBlock);
        if (any.length > 0) return this._pickAndTrack(any);

        // Only 1 char in the entire DB — no choice
        return this._pickAndTrack(allChars);
    },

    /** Pick random from candidates and update ring buffer */
    _pickAndTrack(candidates) {
        const chosen = candidates[Math.floor(Math.random() * candidates.length)];
        this.recentChars.push(chosen.char);
        if (this.recentChars.length > this.RECENT_WINDOW) {
            this.recentChars.shift();
        }
        return chosen;
    },

    /**
     * Validate answer and update mastery
     * @param {number} selectedIndex — index of the option selected
     * @returns {{ correct: boolean, answerTime: number, isHeadshot: boolean }}
     */
    validateAnswer(selectedIndex) {
        if (!this.currentQuestion) return { correct: false, answerTime: 0, isHeadshot: false };

        const answerTime = Date.now() - this.questionStartTime;
        const correct = selectedIndex === this.currentQuestion.correctIndex;
        const charKey = this.currentQuestion.charObj.char;
        const isHeadshot = correct && AntiCheat.isHeadshot(answerTime);

        // Track answered characters
        if (!gameState.round.answeredChars.includes(charKey)) {
            gameState.round.answeredChars.push(charKey);
        }

        // Update mastery
        this._updateMastery(charKey, correct);

        return { correct, answerTime, isHeadshot };
    },

    /** Update character mastery state */
    _updateMastery(charKey, correct) {
        if (!gameState.mastery[charKey]) {
            gameState.mastery[charKey] = {
                correct: 0,
                wrong: 0,
                consecutive: 0,
                roundsSeen: 1,
                lastSeen: new Date().toISOString().slice(0, 10),
                state: 'new'
            };
        }

        const m = gameState.mastery[charKey];

        if (correct) {
            m.correct++;
            m.consecutive++;

            // State transitions
            if (m.state === 'new') {
                m.state = 'learning';
            } else if (m.state === 'learning' && m.consecutive >= 3) {
                m.state = 'review';
            } else if (m.state === 'review' && m.consecutive >= 5 && m.roundsSeen >= 2) {
                m.state = 'mastered';
            }
        } else {
            m.wrong++;
            m.consecutive = 0;
            // Wrong → reset to learning
            if (m.state !== 'new') {
                m.state = 'learning';
            }
        }

        m.lastSeen = new Date().toISOString().slice(0, 10);
    },

    /** Shuffle array in place */
    _shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }
};
