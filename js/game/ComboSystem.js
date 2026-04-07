/**
 * ComboSystem.js — Combo Tracking & Effects
 */
const ComboSystem = {
    /** Reset for new round */
    reset() {
        gameState.round.combo = 0;
        gameState.round.bestCombo = 0;
        this.render();
    },

    /** Increment combo on correct answer */
    increment() {
        gameState.round.combo++;
        if (gameState.round.combo > gameState.round.bestCombo) {
            gameState.round.bestCombo = gameState.round.combo;
        }
        this.render();
        this.checkMilestone();
    },

    /** Break combo on wrong answer */
    break() {
        if (gameState.round.combo > 0) {
            gameState.round.combo = 0;
            this.render();
        }
    },

    /** Get current combo multiplier */
    getMultiplier() {
        if (gameState.round.combo >= 10) return 3;
        if (gameState.round.combo >= 5) return 2;
        if (gameState.round.combo >= 3) return 1.5;
        return 1;
    },

    /** Check and trigger combo milestones */
    checkMilestone() {
        const combo = gameState.round.combo;
        if (combo === 3) {
            this.showEffect('🔥 连杀！', 'combo-3');
        } else if (combo === 5) {
            this.showEffect('💥 超神！', 'combo-5');
            // Heal 1 HP at 5 combo
            HealthSystem.heal(1);
        } else if (combo === 10) {
            this.showEffect('⚡ 大杀特杀！', 'combo-10');
        }
    },

    /** Show combo effect text */
    showEffect(text, className) {
        const layer = document.getElementById('effects-layer');
        if (!layer) return;

        const el = document.createElement('div');
        el.className = `effect-text effect-combo anim-combo-pop ${className || ''}`;
        el.textContent = text;
        layer.appendChild(el);

        // Screen shake for bigger combos
        const game = document.getElementById('screen-game');
        if (game && gameState.round.combo >= 5) {
            game.classList.add('anim-shake');
            setTimeout(() => game.classList.remove('anim-shake'), 400);
        }

        setTimeout(() => {
            el.classList.remove('anim-combo-pop');
            el.classList.add('anim-combo-fly');
            setTimeout(() => el.remove(), 800);
        }, 600);
    },

    /** Show headshot effect */
    showHeadshot() {
        const layer = document.getElementById('effects-layer');
        if (!layer) return;
        const el = document.createElement('div');
        el.className = 'effect-text effect-headshot anim-score-pop';
        el.textContent = '🎯 爆头！';
        el.style.top = '40%';
        el.style.left = '50%';
        el.style.transform = 'translate(-50%, -50%)';
        layer.appendChild(el);
        setTimeout(() => el.remove(), 800);
    },

    /** Show score popup */
    showScorePopup(points) {
        const layer = document.getElementById('effects-layer');
        if (!layer) return;
        const el = document.createElement('div');
        el.className = 'effect-text effect-score anim-score-pop';
        el.textContent = `+${points}`;
        el.style.top = '55%';
        el.style.right = '20%';
        layer.appendChild(el);
        setTimeout(() => el.remove(), 800);
    },

    /** Render combo display */
    render() {
        const val = document.getElementById('combo-value');
        if (!val) return;
        val.textContent = `x${gameState.round.combo}`;

        // Color based on combo level
        val.classList.remove('hot', 'fire');
        if (gameState.round.combo >= 10) {
            val.classList.add('fire');
        } else if (gameState.round.combo >= 3) {
            val.classList.add('hot');
        }
    }
};
