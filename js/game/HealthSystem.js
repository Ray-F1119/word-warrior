/**
 * HealthSystem.js — Player HP Management
 */
const HealthSystem = {
    /** Reset HP for new round */
    reset() {
        gameState.round.hp = gameState.round.maxHp;
        this.renderHP();
    },

    /** Take 1 damage */
    takeDamage() {
        if (gameState.round.hp <= 0) return;
        gameState.round.hp--;
        this.renderHP();
        this.playDamageEffect();
        return gameState.round.hp <= 0;
    },

    /** Heal 1 HP (from combo reward) */
    heal(amount) {
        gameState.round.hp = Math.min(gameState.round.hp + amount, gameState.round.maxHp);
        this.renderHP();
    },

    /** Render HP hearts */
    renderHP() {
        const container = document.getElementById('hud-hp');
        if (!container) return;
        container.innerHTML = '';
        for (let i = 0; i < gameState.round.maxHp; i++) {
            const heart = document.createElement('span');
            heart.className = 'heart';
            if (i < gameState.round.hp) {
                heart.textContent = '❤️';
            } else {
                heart.textContent = '🖤';
                heart.classList.add('lost');
            }
            container.appendChild(heart);
        }
    },

    /** Play damage visual effect */
    playDamageEffect() {
        const gameScreen = document.getElementById('screen-game');
        if (!gameScreen) return;
        gameScreen.classList.add('anim-damage');
        setTimeout(() => gameScreen.classList.remove('anim-damage'), 400);

        // Animate the lost heart
        const hearts = document.querySelectorAll('#hud-hp .heart.lost');
        if (hearts.length > 0) {
            const lastLost = hearts[hearts.length - 1];
            lastLost.classList.add('anim-heart-lost');
        }
    },

    /** Check if player is dead */
    isDead() {
        return gameState.round.hp <= 0;
    }
};
