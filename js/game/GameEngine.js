/**
 * GameEngine.js — Main Game Loop, Timer, Enemy Spawning, Round Management
 */
const GameEngine = {
    timerInterval: null,
    enemyHP: 0,
    enemyMaxHP: 3,
    enemyLevel: 1,
    answersLocked: false,

    // Enemy sprites cycle
    ENEMY_SPRITES: ['👾', '🤖', '👹', '💀', '👽', '🦹', '🧟', '🐉', '👻', '🎃'],
    ENEMY_NAMES: [
        '入侵者', '暗影兵', '铁甲怪', '骷髅王', '星际人',
        '暗黑骑', '亡灵兵', '火龙兽', '幽灵怪', '南瓜头'
    ],

    /** Start a new round */
    startRound() {
        // Reset round state
        gameState.round.active = true;
        gameState.round.score = 0;
        gameState.round.combo = 0;
        gameState.round.bestCombo = 0;
        gameState.round.hp = gameState.round.maxHp;
        gameState.round.enemiesDefeated = 0;
        gameState.round.correctCount = 0;
        gameState.round.wrongCount = 0;
        gameState.round.consecutiveWrong = 0;
        gameState.round.answeredChars = [];
        gameState.round.timeRemaining = gameState.round.roundDuration;

        this.enemyLevel = 1;
        this.answersLocked = false;

        // Reset subsystems
        HealthSystem.reset();
        ComboSystem.reset();
        QuizSystem.reset();
        AntiCheat.reset();

        // Start
        this._spawnEnemy();
        this._nextQuestion();
        this._startTimer();
        this._updateHUD();
    },

    /** Start countdown timer */
    _startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            if (!gameState.round.active) return;
            gameState.round.timeRemaining--;
            this._updateTimer();

            if (gameState.round.timeRemaining <= 0) {
                this.endRound('timeout');
            }
        }, 1000);
    },

    /** Update timer display */
    _updateTimer() {
        const el = document.getElementById('hud-timer');
        if (!el) return;
        const t = gameState.round.timeRemaining;
        const min = Math.floor(t / 60);
        const sec = t % 60;
        el.textContent = `⏱️ ${min}:${sec.toString().padStart(2, '0')}`;

        // Warning when < 60 seconds
        el.classList.toggle('warning', t < 60);
        if (t < 60) el.classList.add('anim-timer-warning');
        else el.classList.remove('anim-timer-warning');
    },

    /** Spawn a new enemy */
    _spawnEnemy() {
        this.enemyMaxHP = Math.min(3 + Math.floor(this.enemyLevel / 3), 8);
        this.enemyHP = this.enemyMaxHP;

        const idx = (this.enemyLevel - 1) % this.ENEMY_SPRITES.length;
        const sprite = document.getElementById('enemy-sprite');
        const name = document.getElementById('enemy-name');

        if (sprite) {
            sprite.textContent = this.ENEMY_SPRITES[idx];
            sprite.classList.add('anim-enemy-enter');
            setTimeout(() => sprite.classList.remove('anim-enemy-enter'), 500);
        }
        if (name) {
            name.textContent = `${this.ENEMY_NAMES[idx]} Lv.${this.enemyLevel}`;
        }

        this._updateEnemyHP();
    },

    /** Update enemy HP bar */
    _updateEnemyHP() {
        const fill = document.getElementById('enemy-hp-fill');
        if (fill) {
            const pct = (this.enemyHP / this.enemyMaxHP) * 100;
            fill.style.width = `${pct}%`;
        }
    },

    /** Generate and display next question */
    _nextQuestion() {
        const q = QuizSystem.generateQuestion();
        if (!q) return;

        const charEl = document.getElementById('question-char');
        const typeEl = document.getElementById('question-type');
        const grid = document.getElementById('answer-grid');

        if (charEl) {
            charEl.textContent = q.display;
            // Larger font for single characters
            charEl.style.fontSize = q.type === 'pinyin_to_char' ? '2.2rem' : '3.5rem';
        }
        if (typeEl) typeEl.textContent = q.prompt;

        if (grid) {
            grid.innerHTML = '';
            q.options.forEach((opt, i) => {
                const btn = document.createElement('button');
                btn.className = 'answer-btn';
                btn.dataset.index = i;
                btn.textContent = opt;
                // Larger font for character options
                if (q.type === 'pinyin_to_char') {
                    btn.style.fontSize = '2rem';
                }
                btn.addEventListener('click', () => this._handleAnswer(i));
                grid.appendChild(btn);
            });
        }

        this.answersLocked = false;
    },

    /** Handle player answer */
    _handleAnswer(index) {
        if (this.answersLocked || !gameState.round.active) return;

        // Anti-cheat check
        const check = AntiCheat.checkAnswer();
        if (!check.valid) {
            if (check.reason === 'too_fast') {
                this._showFloatingText('太快了! 再看看!', 'var(--warning)');
                return;
            }
            if (check.reason === 'spam' || check.reason === 'cooldown') {
                this._showCooldown(check.cooldownMs);
                return;
            }
        }

        this.answersLocked = true;
        const result = QuizSystem.validateAnswer(index);
        const btns = document.querySelectorAll('.answer-btn');

        if (result.correct) {
            this._onCorrectAnswer(index, result, btns);
        } else {
            this._onWrongAnswer(index, btns);
        }
    },

    /** Handle correct answer */
    _onCorrectAnswer(index, result, btns) {
        gameState.round.correctCount++;
        gameState.round.consecutiveWrong = 0;

        // Visual feedback
        btns[index].classList.add('correct');

        // Bullet animation
        this._fireBullet();

        // Scoring
        let points = 100;
        if (result.isHeadshot) {
            points = Math.floor(points * 1.5);
            ComboSystem.showHeadshot();
        }
        points = Math.floor(points * ComboSystem.getMultiplier());
        gameState.round.score += points;
        ComboSystem.showScorePopup(points);

        // Combo
        ComboSystem.increment();

        // Damage enemy
        this.enemyHP--;
        this._updateEnemyHP();

        // Enemy hit animation
        const sprite = document.getElementById('enemy-sprite');
        if (sprite) {
            sprite.classList.add('anim-enemy-hit');
            setTimeout(() => sprite.classList.remove('anim-enemy-hit'), 300);
        }

        // Check enemy death
        if (this.enemyHP <= 0) {
            gameState.round.enemiesDefeated++;
            this.enemyLevel++;
            // Death animation then spawn new
            if (sprite) {
                sprite.classList.add('anim-enemy-death');
                this._spawnParticles();
                setTimeout(() => {
                    sprite.classList.remove('anim-enemy-death');
                    this._spawnEnemy();
                    this._nextQuestion();
                }, 600);
                this._updateHUD();
                return;
            }
        }

        this._updateHUD();
        // Next question after brief delay
        setTimeout(() => this._nextQuestion(), 400);
    },

    /** Handle wrong answer */
    _onWrongAnswer(index, btns) {
        gameState.round.wrongCount++;
        gameState.round.consecutiveWrong++;

        // Visual feedback
        btns[index].classList.add('wrong');
        // Show correct answer
        const correctIdx = QuizSystem.currentQuestion?.correctIndex;
        if (correctIdx !== undefined && btns[correctIdx]) {
            btns[correctIdx].classList.add('correct');
        }

        // Combo break
        ComboSystem.break();

        // Take damage
        const isDead = HealthSystem.takeDamage();

        // Enemy shoots animation
        const sprite = document.getElementById('enemy-sprite');
        if (sprite) {
            sprite.classList.add('anim-pulse');
            setTimeout(() => sprite.classList.remove('anim-pulse'), 300);
        }

        // Mercy rule: 3 wrong in a row → show correct answer details
        if (gameState.round.consecutiveWrong >= 3) {
            this._showMercy(QuizSystem.currentQuestion?.charObj);
            gameState.round.consecutiveWrong = 0;
            return;
        }

        if (isDead) {
            setTimeout(() => this.endRound('death'), 800);
            return;
        }

        this._updateHUD();
        setTimeout(() => this._nextQuestion(), 800);
    },

    /** Show mercy popup (learning moment) */
    _showMercy(charObj) {
        if (!charObj) return;
        const gameHud = document.querySelector('.game-hud');
        if (!gameHud) return;

        const popup = document.createElement('div');
        popup.className = 'mercy-popup anim-fade-in-scale';
        popup.innerHTML = `
            <div class="mercy-char">${charObj.char}</div>
            <div class="mercy-pinyin">${charObj.pinyin}</div>
            <div class="mercy-meaning">${charObj.meaning}</div>
        `;
        gameHud.appendChild(popup);

        setTimeout(() => {
            popup.remove();
            if (HealthSystem.isDead()) {
                this.endRound('death');
            } else {
                this._nextQuestion();
            }
        }, 3000);
    },

    /** Fire bullet animation */
    _fireBullet() {
        const layer = document.getElementById('effects-layer');
        if (!layer) return;
        const bullet = document.createElement('div');
        bullet.className = 'effect-bullet anim-bullet';
        bullet.style.left = '50%';
        bullet.style.bottom = '40%';
        layer.appendChild(bullet);
        setTimeout(() => bullet.remove(), 300);
    },

    /** Spawn particles on enemy death */
    _spawnParticles() {
        const layer = document.getElementById('effects-layer');
        if (!layer) return;
        const colors = ['#e94560', '#f5c518', '#00ff88', '#00d4ff', '#a855f7'];
        for (let i = 0; i < 12; i++) {
            const p = document.createElement('div');
            p.className = 'effect-particle';
            p.style.background = colors[i % colors.length];
            p.style.left = '50%';
            p.style.top = '35%';
            p.style.setProperty('--px', `${(Math.random() - 0.5) * 200}px`);
            p.style.setProperty('--py', `${(Math.random() - 0.5) * 200}px`);
            p.style.animation = `particleBurst 0.6s ease-out forwards`;
            p.style.animationDelay = `${Math.random() * 0.1}s`;
            layer.appendChild(p);
            setTimeout(() => p.remove(), 700);
        }
    },

    /** Show floating text */
    _showFloatingText(text, color) {
        const layer = document.getElementById('effects-layer');
        if (!layer) return;
        const el = document.createElement('div');
        el.className = 'effect-text anim-score-pop';
        el.textContent = text;
        el.style.color = color || 'var(--warning)';
        el.style.top = '30%';
        el.style.left = '50%';
        el.style.transform = 'translateX(-50%)';
        el.style.fontSize = '1rem';
        layer.appendChild(el);
        setTimeout(() => el.remove(), 1200);
    },

    /** Show anti-cheat cooldown */
    _showCooldown(ms) {
        const gameHud = document.querySelector('.game-hud');
        if (!gameHud) return;

        let overlay = document.querySelector('.anticheat-overlay');
        if (overlay) overlay.remove();

        overlay = document.createElement('div');
        overlay.className = 'anticheat-overlay anim-fade-in-scale';
        overlay.innerHTML = `
            <div class="anticheat-text">⚠️ 别着急，仔细看题！</div>
            <div class="anticheat-timer">${Math.ceil(ms / 1000)}</div>
        `;
        gameHud.appendChild(overlay);

        const interval = setInterval(() => {
            const remaining = AntiCheat.getCooldownRemaining();
            const timer = overlay.querySelector('.anticheat-timer');
            if (timer) timer.textContent = remaining;
            if (remaining <= 0) {
                clearInterval(interval);
                overlay.remove();
            }
        }, 500);
    },

    /** Update HUD displays */
    _updateHUD() {
        const scoreEl = document.getElementById('hud-score');
        if (scoreEl) scoreEl.textContent = `💰 ${gameState.round.score}`;

        const accEl = document.getElementById('accuracy-value');
        const total = gameState.round.correctCount + gameState.round.wrongCount;
        if (accEl) {
            accEl.textContent = total > 0
                ? Math.round((gameState.round.correctCount / total) * 100) + '%'
                : '0%';
        }
    },

    /** End the round */
    endRound(reason) {
        gameState.round.active = false;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        // Update global stats
        gameState.stats.totalRounds++;
        gameState.stats.totalCorrect += gameState.round.correctCount;
        gameState.stats.totalWrong += gameState.round.wrongCount;
        if (gameState.round.bestCombo > gameState.stats.bestCombo) {
            gameState.stats.bestCombo = gameState.round.bestCombo;
        }
        const total = gameState.round.correctCount + gameState.round.wrongCount;
        const accuracy = total > 0 ? Math.round((gameState.round.correctCount / total) * 100) : 0;
        if (accuracy > gameState.stats.bestAccuracy) {
            gameState.stats.bestAccuracy = accuracy;
        }

        // Track mastery round count
        for (const charKey of gameState.round.answeredChars) {
            if (gameState.mastery[charKey]) {
                gameState.mastery[charKey].roundsSeen =
                    (gameState.mastery[charKey].roundsSeen || 0) + 1;
            }
        }

        // Calculate rewards
        const rewards = Economy.calculateRewards();
        gameState.player.gold += rewards.total;
        gameState.player.totalScore += gameState.round.score;

        // Show results
        this._showResults(reason, rewards);
        saveGame();
    },

    /** Display results screen */
    _showResults(reason, rewards) {
        const titleEl = document.getElementById('results-title');
        if (titleEl) {
            titleEl.textContent = reason === 'death'
                ? '💀 阵亡了！' : '🏆 战斗结束！';
        }

        const total = gameState.round.correctCount + gameState.round.wrongCount;
        const accuracy = total > 0 ? Math.round((gameState.round.correctCount / total) * 100) : 0;
        const elapsed = gameState.round.roundDuration - gameState.round.timeRemaining;
        const min = Math.floor(elapsed / 60);
        const sec = elapsed % 60;

        const setText = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };

        setText('result-enemies', gameState.round.enemiesDefeated);
        setText('result-combo', `x${gameState.round.bestCombo}`);
        setText('result-accuracy', `${accuracy}%`);
        setText('result-time', `${min}:${sec.toString().padStart(2, '0')}`);

        setText('reward-base', `+${rewards.base}`);
        setText('reward-combo', `+${rewards.combo}`);
        setText('reward-accuracy', `+${rewards.accuracy}`);
        setText('reward-total', `+${rewards.total} 💰`);

        showScreen('results');
    }
};
