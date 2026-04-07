/**
 * Economy.js — Gold Calculation & Balance Management
 */
const Economy = {
    /**
     * Calculate round rewards based on performance
     * @returns {{ base, enemy, combo, accuracy, total }}
     */
    calculateRewards() {
        const round = gameState.round;
        const total = round.correctCount + round.wrongCount;
        const acc = total > 0 ? round.correctCount / total : 0;

        const base = 100;
        const enemy = round.enemiesDefeated * 20;
        const combo = round.bestCombo * 10;
        const accuracy = acc >= 0.8 ? 50 : 0;

        return {
            base,
            enemy,
            combo: combo,
            accuracy,
            total: base + enemy + combo + accuracy
        };
    }
};
