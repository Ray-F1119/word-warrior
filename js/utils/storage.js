/**
 * storage.js — localStorage Save/Load System
 */
const Storage = {
    SAVE_KEY: 'word_warrior_save',
    VERSION: 1,

    /** Save gameState to localStorage */
    save(state) {
        try {
            const data = {
                version: this.VERSION,
                timestamp: Date.now(),
                player: state.player,
                inventory: state.inventory,
                mastery: state.mastery,
                settings: state.settings,
                stats: state.stats
            };
            localStorage.setItem(this.SAVE_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn('Save failed:', e);
        }
    },

    /** Load saved data, returns null if no save or invalid */
    load() {
        try {
            const raw = localStorage.getItem(this.SAVE_KEY);
            if (!raw) return null;
            const data = JSON.parse(raw);
            if (data.version !== this.VERSION) {
                console.warn('Save version mismatch, resetting');
                return null;
            }
            return data;
        } catch (e) {
            console.warn('Load failed:', e);
            return null;
        }
    },

    /** Clear all saved data */
    clear() {
        localStorage.removeItem(this.SAVE_KEY);
    },

    /** Check if a save exists */
    hasSave() {
        return !!localStorage.getItem(this.SAVE_KEY);
    }
};
