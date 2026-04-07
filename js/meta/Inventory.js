/**
 * Inventory.js — Equipment & Skin Storage
 */
const Inventory = {
    /** Check if player owns a weapon */
    hasWeapon(id) {
        return gameState.inventory.weapons.includes(id);
    },

    /** Check if player owns a skin */
    hasSkin(id) {
        return gameState.inventory.skins.includes(id);
    },

    /** Add weapon to inventory */
    addWeapon(id) {
        if (!this.hasWeapon(id)) {
            gameState.inventory.weapons.push(id);
        }
    },

    /** Add skin to inventory */
    addSkin(id) {
        if (!this.hasSkin(id)) {
            gameState.inventory.skins.push(id);
        }
    },

    /** Equip weapon */
    equipWeapon(id) {
        if (this.hasWeapon(id)) {
            gameState.player.equippedWeapon = id;
        }
    },

    /** Equip skin */
    equipSkin(id) {
        if (this.hasSkin(id)) {
            gameState.player.equippedSkin = id;
        }
    }
};
