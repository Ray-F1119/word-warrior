/**
 * antiCheat.js — Anti-Guessing Detection System
 */
const AntiCheat = {
    lastAnswerTime: 0,
    fastAnswerStreak: 0,
    cooldownActive: false,
    cooldownEndTime: 0,

    /** Reset state for new round */
    reset() {
        this.lastAnswerTime = 0;
        this.fastAnswerStreak = 0;
        this.cooldownActive = false;
        this.cooldownEndTime = 0;
    },

    /** Call at the start of each new question to reset the per-question clock */
    resetQuestionTimer() {
        this.lastAnswerTime = Date.now();
        this.fastAnswerStreak = 0;
    },


    /**
     * Check if an answer attempt is valid
     * @returns {{ valid: boolean, reason?: string, cooldownMs?: number }}
     */
    checkAnswer() {
        const now = Date.now();

        // Check cooldown
        if (this.cooldownActive) {
            const remaining = this.cooldownEndTime - now;
            if (remaining > 0) {
                return {
                    valid: false,
                    reason: 'cooldown',
                    cooldownMs: remaining
                };
            }
            this.cooldownActive = false;
            this.fastAnswerStreak = 0;
        }

        // Speed check
        const elapsed = now - this.lastAnswerTime;
        this.lastAnswerTime = now;

        if (this.lastAnswerTime > 0 && elapsed < 500) {
            this.fastAnswerStreak++;
            // Spam detection: 3 fast answers → cooldown
            if (this.fastAnswerStreak >= 3) {
                this.cooldownActive = true;
                this.cooldownEndTime = now + 3000;
                return {
                    valid: false,
                    reason: 'spam',
                    cooldownMs: 3000
                };
            }
            return {
                valid: false,
                reason: 'too_fast'
            };
        }

        // Reset fast streak if answer was at normal speed
        if (elapsed >= 500) {
            this.fastAnswerStreak = 0;
        }

        return { valid: true };
    },

    /**
     * Check if speed bonus (headshot) should trigger
     * @param {number} answerTimeMs — time taken to answer
     * @returns {boolean}
     */
    isHeadshot(answerTimeMs) {
        return answerTimeMs > 500 && answerTimeMs < 2000;
    },

    /** Get remaining cooldown seconds */
    getCooldownRemaining() {
        if (!this.cooldownActive) return 0;
        return Math.max(0, Math.ceil((this.cooldownEndTime - Date.now()) / 1000));
    }
};
