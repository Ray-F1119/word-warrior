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
    },

    /**
     * Export save data as a compact Base64 code
     * @returns {string} save code
     */
    exportCode() {
        try {
            const raw = localStorage.getItem(this.SAVE_KEY);
            if (!raw) return '';
            // Compress: btoa of JSON string
            return btoa(unescape(encodeURIComponent(raw)));
        } catch (e) {
            console.warn('Export failed:', e);
            return '';
        }
    },

    /**
     * Import save data from a Base64 save code
     * @param {string} code
     * @returns {boolean} success
     */
    importCode(code) {
        try {
            const json = decodeURIComponent(escape(atob(code.trim())));
            const data = JSON.parse(json);
            if (data.version !== this.VERSION) {
                console.warn('Import version mismatch');
                return false;
            }
            localStorage.setItem(this.SAVE_KEY, json);
            return true;
        } catch (e) {
            console.warn('Import failed:', e);
            return false;
        }
    }
};

