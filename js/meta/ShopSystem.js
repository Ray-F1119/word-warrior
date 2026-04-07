/**
 * ShopSystem.js — Weapon & Skin Shop (v1.1 — fixed tab event accumulation)
 */
const ShopSystem = {
    ITEMS: {
        weapons: [
            {
                id: 'basic_pistol', name: '基础手枪', icon: '🔫',
                desc: '新手标配', price: 0, effect: '标准射击'
            },
            {
                id: 'rifle', name: '突击步枪', icon: '🎯',
                desc: '酷炫射击动画', price: 2000, effect: '彩色弹道 + 射击音效'
            },
            {
                id: 'sniper', name: '狙击枪', icon: '🔭',
                desc: '爆头加成提升至 +75%', price: 5000, effect: '"爆头" 加成 → +75%'
            },
            {
                id: 'rocket', name: '火箭炮', icon: '🚀',
                desc: '击杀敌人时屏幕震动 + 爆炸特效', price: 10000, effect: '击杀震屏 + 烟花特效'
            }
        ],
        skins: [
            {
                id: 'default', name: '默认战士', icon: '🧑',
                desc: '标准形象', price: 0
            },
            {
                id: 'ninja', name: '忍者', icon: '🥷',
                desc: '暗影战士', price: 1000
            },
            {
                id: 'astronaut', name: '太空人', icon: '🧑‍🚀',
                desc: '星际探索者', price: 2000
            },
            {
                id: 'robot', name: '机器人', icon: '🤖',
                desc: '钢铁战士', price: 3000
            },
            {
                id: 'dragon', name: '龙骑士', icon: '🐲',
                desc: '传说级战士', price: 5000
            }
        ]
    },

    currentTab: 'weapons',
    _tabBound: false,

    /** One-time initialization of tab clicks — call once on page load */
    init() {
        if (this._tabBound) return;
        this._tabBound = true;
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentTab = btn.dataset.tab;
                this.renderItems();
            });
        });
    },

    /** Called from app: open shop on a specific tab */
    open(tab) {
        this.currentTab = tab || 'weapons';
        // Sync tab button UI
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === this.currentTab);
        });
        this.renderItems();
    },

    /** Full render entry point (legacy compat) */
    render() {
        this.open(this.currentTab);
    },

    /** Render just the item grid for currentTab */
    renderItems() {
        const grid = document.getElementById('shop-grid');
        if (!grid) return;

        const items = this.ITEMS[this.currentTab];
        grid.innerHTML = '';

        // Show player total gold above grid
        updateShopGold();

        items.forEach(item => {
            const owned = this.currentTab === 'weapons'
                ? Inventory.hasWeapon(item.id)
                : Inventory.hasSkin(item.id);
            const equipped = this.currentTab === 'weapons'
                ? gameState.player.equippedWeapon === item.id
                : gameState.player.equippedSkin === item.id;
            const canAfford = gameState.player.gold >= item.price;

            const el = document.createElement('div');
            el.className = `shop-item ${owned ? 'owned' : ''} ${equipped ? 'equipped' : ''}`;

            // Price label
            let priceLabel;
            if (equipped) {
                priceLabel = '<span style="color:var(--accent-gold)">✅ 已装备</span>';
            } else if (owned) {
                priceLabel = '<span style="color:var(--accent-green)">点击装备</span>';
            } else if (item.price === 0) {
                priceLabel = '<span class="free">免费获取</span>';
            } else {
                priceLabel = `<span style="color:${canAfford ? 'var(--accent-gold)' : 'var(--text-muted)'}">💰 ${item.price}</span>`;
            }

            el.innerHTML = `
                <div class="shop-item-icon">${item.icon}</div>
                <div class="shop-item-info">
                    <div class="shop-item-name">${item.name}</div>
                    <div class="shop-item-desc">${item.desc}</div>
                </div>
                <div class="shop-item-price">${priceLabel}</div>
            `;

            el.addEventListener('click', () => {
                if (equipped) return; // already equipped, do nothing
                if (owned) {
                    this._equip(item);
                } else {
                    this._buy(item, canAfford);
                }
            });

            // Visual affordance: not-affordable should look muted but still show
            if (!owned && !canAfford && item.price > 0) {
                el.style.opacity = '0.6';
            }

            grid.appendChild(el);
        });
    },

    /** Buy an item */
    _buy(item, canAfford) {
        if (!canAfford) {
            // Show brief floating message instead of blocking alert
            const grid = document.getElementById('shop-grid');
            if (grid) {
                const msg = document.createElement('div');
                msg.style.cssText = `
                    position:fixed; top:50%; left:50%; transform:translate(-50%,-50%);
                    background:var(--bg-card); border:2px solid var(--danger);
                    border-radius:12px; padding:16px 24px; color:var(--danger);
                    font-weight:700; font-size:1rem; z-index:200;
                    animation: fadeInScale 0.2s ease;
                `;
                msg.textContent = `金币不够！还差 ${item.price - gameState.player.gold} 💰`;
                document.body.appendChild(msg);
                setTimeout(() => msg.remove(), 1800);
            }
            return;
        }

        gameState.player.gold -= item.price;
        if (this.currentTab === 'weapons') {
            Inventory.addWeapon(item.id);
            Inventory.equipWeapon(item.id);
        } else {
            Inventory.addSkin(item.id);
            Inventory.equipSkin(item.id);
        }

        saveGame();
        this.renderItems();
    },

    /** Equip an owned item */
    _equip(item) {
        if (this.currentTab === 'weapons') {
            Inventory.equipWeapon(item.id);
        } else {
            Inventory.equipSkin(item.id);
        }
        saveGame();
        this.renderItems();
    }
};
