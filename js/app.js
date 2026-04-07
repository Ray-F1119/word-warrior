/**
 * app.js — App Entry Point, Unified State, Screen Routing
 * 识字大作战 (Word Warrior) v1.0 MVP
 */

// ==================== UNIFIED GAME STATE ====================
const gameState = {
    screen: 'menu',
    player: {
        name: 'Player',
        gold: 0,
        totalScore: 0,
        equippedWeapon: 'basic_pistol',
        equippedSkin: 'default',
        rank: 'bronze'
    },
    inventory: {
        weapons: ['basic_pistol'],
        skins: ['default']
    },
    round: {
        active: false,
        timeRemaining: 480,
        roundDuration: 480,
        score: 0,
        combo: 0,
        bestCombo: 0,
        hp: 5,
        maxHp: 5,
        enemiesDefeated: 0,
        correctCount: 0,
        wrongCount: 0,
        consecutiveWrong: 0,
        answeredChars: [],
        semester: '1_up'
    },
    mastery: {},
    settings: {
        semester: '1_up',
        roundTime: 480,
        soundOn: true,
        tutorialDone: false
    },
    stats: {
        totalRounds: 0,
        totalCorrect: 0,
        totalWrong: 0,
        bestCombo: 0,
        bestAccuracy: 0
    }
};

// ==================== RANK SYSTEM ====================
const RANKS = [
    { id: 'bronze', name: '青铜', icon: '🥉', minScore: 0 },
    { id: 'silver', name: '白银', icon: '⚪', minScore: 5000 },
    { id: 'gold', name: '黄金', icon: '🥇', minScore: 15000 },
    { id: 'platinum', name: '铂金', icon: '💎', minScore: 35000 },
    { id: 'diamond', name: '钻石', icon: '💠', minScore: 70000 },
    { id: 'master', name: '大师', icon: '👑', minScore: 120000 },
    { id: 'legend', name: '传说', icon: '🏆', minScore: 200000 }
];

function getRank(totalScore) {
    let rank = RANKS[0];
    for (const r of RANKS) {
        if (totalScore >= r.minScore) rank = r;
    }
    return rank;
}

// ==================== SCREEN ROUTING ====================
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById('screen-' + screenId);
    if (target) {
        target.classList.add('active');
        gameState.screen = screenId;
    }
}

function showOverlay(overlayId) {
    const el = document.getElementById('overlay-' + overlayId);
    if (el) el.classList.add('active');
}

function hideOverlay(overlayId) {
    const el = document.getElementById('overlay-' + overlayId);
    if (el) el.classList.remove('active');
}

// ==================== SAVE / LOAD ====================
function saveGame() {
    Storage.save(gameState);
}

function loadGame() {
    const data = Storage.load();
    if (data) {
        Object.assign(gameState.player, data.player || {});
        // Validate inventory arrays — corrupt save must not crash the shop
        if (data.inventory) {
            gameState.inventory.weapons = Array.isArray(data.inventory.weapons)
                ? data.inventory.weapons : ['basic_pistol'];
            gameState.inventory.skins = Array.isArray(data.inventory.skins)
                ? data.inventory.skins : ['default'];
        }
        Object.assign(gameState.mastery, data.mastery || {});
        Object.assign(gameState.settings, data.settings || {});
        Object.assign(gameState.stats, data.stats || {});
    }
}


// ==================== UI UPDATES ====================
function updateMenuUI() {
    const rank = getRank(gameState.player.totalScore);
    gameState.player.rank = rank.id;

    const setTextById = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    };

    setTextById('menu-rank', `${rank.icon} ${rank.name}`);
    setTextById('menu-gold', gameState.player.gold);
    setTextById('menu-total-rounds', gameState.stats.totalRounds);
    setTextById('menu-best-combo', gameState.stats.bestCombo);

    const totalAnswers = gameState.stats.totalCorrect + gameState.stats.totalWrong;
    const accuracy = totalAnswers > 0
        ? Math.round((gameState.stats.totalCorrect / totalAnswers) * 100)
        : 0;
    setTextById('menu-accuracy', accuracy + '%');
}

function updateShopGold() {
    const el = document.getElementById('shop-gold');
    if (el) el.textContent = gameState.player.gold;
}

// ==================== DIFFICULTY SELECTION ====================
let selectedSemester = '1_up';
let selectedTime = 480;

function initDifficultyScreen() {
    // Semester cards
    document.querySelectorAll('.difficulty-card:not(.locked)').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.difficulty-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedSemester = card.dataset.semester;
        });
    });

    // Time buttons
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedTime = parseInt(btn.dataset.time);
        });
    });

    // Default selection
    const defaultCard = document.querySelector('.difficulty-card[data-semester="1_up"]');
    if (defaultCard) defaultCard.classList.add('selected');
}

// ==================== TUTORIAL ====================
const TUTORIAL_STEPS = [
    {
        emoji: '⚔️',
        text: '欢迎来到<b>识字大作战</b>！\n在这里，认字就是你的战斗力！'
    },
    {
        emoji: '👾',
        text: '敌人出现了！\n看到汉字，<b>选对读音</b>就能开枪命中！'
    },
    {
        emoji: '❤️',
        text: '答错了会<b>掉血</b>！\n你有5条命，要小心哦！'
    },
    {
        emoji: '🔥',
        text: '连续答对就能触发<b>连杀</b>！\n连杀越多奖励越大！'
    },
    {
        emoji: '💰',
        text: '打完一局可以获得<b>金币</b>，\n用金币买更酷的武器和皮肤！'
    },
    {
        emoji: '🚀',
        text: '准备好了吗？\n<b>开始你的识字大作战吧！</b>'
    }
];

let tutorialStep = 0;

function showTutorial() {
    tutorialStep = 0;
    showScreen('tutorial');
    renderTutorialStep();
}

function renderTutorialStep() {
    const step = TUTORIAL_STEPS[tutorialStep];
    const content = document.getElementById('tutorial-content');
    const progress = document.getElementById('tutorial-progress');
    const nextBtn = document.getElementById('btn-tutorial-next');

    content.innerHTML = `
        <div class="tutorial-emoji">${step.emoji}</div>
        <div class="tutorial-text">${step.text.replace(/\n/g, '<br>')}</div>
    `;
    content.classList.add('anim-fade-in-scale');
    setTimeout(() => content.classList.remove('anim-fade-in-scale'), 400);

    // Progress dots
    progress.innerHTML = TUTORIAL_STEPS.map((_, i) =>
        `<div class="tutorial-dot ${i <= tutorialStep ? 'active' : ''}"></div>`
    ).join('');

    nextBtn.textContent = tutorialStep === TUTORIAL_STEPS.length - 1 ? '出发！🚀' : '下一步 →';
}

function nextTutorialStep() {
    tutorialStep++;
    if (tutorialStep >= TUTORIAL_STEPS.length) {
        gameState.settings.tutorialDone = true;
        saveGame();
        showScreen('difficulty');
    } else {
        renderTutorialStep();
    }
}

// ==================== SETTINGS ====================
function initSettings() {
    const soundBtn = document.getElementById('toggle-sound');
    if (soundBtn) {
        soundBtn.textContent = gameState.settings.soundOn ? '开' : '关';
        soundBtn.classList.toggle('off', !gameState.settings.soundOn);
    }
}

function toggleSound() {
    gameState.settings.soundOn = !gameState.settings.soundOn;
    const btn = document.getElementById('toggle-sound');
    if (btn) {
        btn.textContent = gameState.settings.soundOn ? '开' : '关';
        btn.classList.toggle('off', !gameState.settings.soundOn);
    }
    saveGame();
}

// ==================== EVENT BINDINGS ====================
function bindEvents() {
    // Menu
    document.getElementById('btn-start-game')?.addEventListener('click', () => {
        if (!gameState.settings.tutorialDone) {
            showTutorial();
        } else {
            showScreen('difficulty');
        }
    });
    document.getElementById('btn-shop')?.addEventListener('click', () => {
        showScreen('shop');
        if (typeof ShopSystem !== 'undefined') {
            ShopSystem.init();          // one-time tab binding
            ShopSystem.open('weapons');
        }
    });
    document.getElementById('btn-inventory')?.addEventListener('click', () => {
        showScreen('shop');
        if (typeof ShopSystem !== 'undefined') {
            ShopSystem.init();
            ShopSystem.open('weapons'); // show owned items
        }
    });
    document.getElementById('btn-settings')?.addEventListener('click', () => {
        showOverlay('settings');
    });

    // Difficulty
    document.getElementById('btn-confirm-start')?.addEventListener('click', () => {
        gameState.round.semester = selectedSemester;
        gameState.round.roundDuration = selectedTime;
        gameState.round.timeRemaining = selectedTime;
        gameState.settings.semester = selectedSemester;
        gameState.settings.roundTime = selectedTime;
        showScreen('game');
        if (typeof GameEngine !== 'undefined') GameEngine.startRound();
    });
    document.getElementById('btn-back-menu')?.addEventListener('click', () => {
        showScreen('menu');
    });

    // Results
    document.getElementById('btn-play-again')?.addEventListener('click', () => {
        showScreen('difficulty');
    });
    document.getElementById('btn-to-shop')?.addEventListener('click', () => {
        showScreen('shop');
        if (typeof ShopSystem !== 'undefined') {
            ShopSystem.init();
            ShopSystem.open('weapons');
        }
    });
    document.getElementById('btn-to-menu')?.addEventListener('click', () => {
        showScreen('menu');
        updateMenuUI();
    });

    // Shop
    document.getElementById('btn-shop-back')?.addEventListener('click', () => {
        showScreen('menu');
        updateMenuUI();
    });

    // Tutorial
    document.getElementById('btn-tutorial-next')?.addEventListener('click', nextTutorialStep);
    document.getElementById('btn-tutorial-skip')?.addEventListener('click', () => {
        gameState.settings.tutorialDone = true;
        saveGame();
        showScreen('difficulty');
    });

    // Settings
    document.getElementById('toggle-sound')?.addEventListener('click', toggleSound);
    document.getElementById('btn-close-settings')?.addEventListener('click', () => {
        hideOverlay('settings');
    });
    document.getElementById('btn-reset-save')?.addEventListener('click', () => {
        if (confirm('确定要清除所有数据吗？这不可恢复！')) {
            Storage.clear();
            location.reload();
        }
    });

    // Save code export/import
    document.getElementById('btn-export-save')?.addEventListener('click', () => {
        saveGame(); // ensure latest state
        const code = Storage.exportCode();
        if (!code) {
            alert('没有存档可导出！');
            return;
        }
        const display = document.getElementById('save-code-display');
        if (display) {
            display.style.display = 'block';
            display.textContent = code;
        }
        // Copy to clipboard
        if (navigator.clipboard) {
            navigator.clipboard.writeText(code).then(() => {
                const btn = document.getElementById('btn-export-save');
                if (btn) {
                    btn.textContent = '✅ 已复制！';
                    setTimeout(() => btn.textContent = '📤 导出存档码', 2000);
                }
            });
        }
    });

    document.getElementById('btn-import-save')?.addEventListener('click', () => {
        const code = prompt('粘贴你的存档码：');
        if (!code) return;
        const ok = Storage.importCode(code);
        if (ok) {
            alert('✅ 导入成功！游戏将重新加载');
            location.reload();
        } else {
            alert('❌ 存档码无效，请检查后重试');
        }
    });
}

// ==================== INITIALIZATION ====================
function init() {
    loadGame();
    initDifficultyScreen();
    initSettings();
    bindEvents();
    updateMenuUI();
    showScreen('menu');
    console.log('🎮 识字大作战 v1.0 MVP loaded');
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', init);
