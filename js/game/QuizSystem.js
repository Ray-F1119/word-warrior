/**
 * QuizSystem.js — Question Generation + Spaced Repetition + Validation
 */
const QuizSystem = {
    currentQuestion: null,
    questionStartTime: 0,
    questionCount: 0,
    recentChars: [],          // ring buffer — last 5 chars asked
    RECENT_WINDOW: 5,         // how many to exclude

    /** Reset for new round */
    reset() {
        this.currentQuestion = null;
        this.questionStartTime = 0;
        this.questionCount = 0;
        this.recentChars = [];
    },

    /**
     * Generate next question
     * @returns {{ type, char, pinyin, meaning, options, correctIndex }}
     */
    generateQuestion() {
        const semester = gameState.round.semester;
        const chars = getCharacters(semester);
        if (chars.length === 0) return null;

        // Select character based on spaced repetition
        const selected = this._selectCharacter(chars);
        if (!selected) return null;

        // Alternate question types
        const type = this.questionCount % 2 === 0 ? 'char_to_pinyin' : 'pinyin_to_char';
        this.questionCount++;

        let question;
        if (type === 'char_to_pinyin') {
            question = this._makeCharToPinyin(selected, semester);
        } else {
            question = this._makePinyinToChar(selected, semester);
        }

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
     * Select character based on spaced repetition
     * Priority: learning (60%) > review (25%) > new (10%) > mastered (5%)
     */
    _selectCharacter(allChars) {
        const mastery = gameState.mastery;
        const buckets = { new: [], learning: [], review: [], mastered: [] };

        for (const c of allChars) {
            const state = mastery[c.char]?.state || 'new';
            buckets[state].push(c);
        }

        // Weighted random bucket selection
        const roll = Math.random();
        let bucket;
        if (roll < 0.60 && buckets.learning.length > 0) {
            bucket = buckets.learning;
        } else if (roll < 0.85 && buckets.review.length > 0) {
            bucket = buckets.review;
        } else if (roll < 0.95 && buckets.new.length > 0) {
            bucket = buckets.new;
        } else if (buckets.mastered.length > 0) {
            bucket = buckets.mastered;
        } else {
            // Fallback: pick from any available bucket
            bucket = buckets.learning.length > 0 ? buckets.learning :
                buckets.new.length > 0 ? buckets.new :
                    buckets.review.length > 0 ? buckets.review :
                        allChars;
        }

        // Introduce max 5 new chars per round
        if (bucket === buckets.new) {
            const newIntroduced = gameState.round.answeredChars.filter(c =>
                mastery[c]?.state === 'learning' && (mastery[c]?.correct || 0) <= 1
            ).length;
            if (newIntroduced >= 5 && buckets.learning.length > 0) {
                bucket = buckets.learning;
            }
        }

        // Recent-window exclusion: prefer chars NOT seen in the last RECENT_WINDOW questions
        const recent = new Set(this.recentChars);
        const freshCandidates = bucket.filter(c => !recent.has(c.char));
        const candidates = freshCandidates.length > 0 ? freshCandidates : bucket;

        const chosen = candidates[Math.floor(Math.random() * candidates.length)];

        // Push into ring buffer
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
