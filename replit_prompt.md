# 🎮 识字大作战 (Word Warrior) — Replit Agent 提示词 v2

> **使用方法**：将「提示词开始」到「提示词结束」之间的内容整段复制，粘贴到 Replit Agent。

---

## 提示词开始 👇

---

Build a web-based Chinese literacy battle royale game called **"识字大作战"** (Word Warrior).

**Tech stack:** HTML + CSS + vanilla JavaScript. No frameworks. Mobile-friendly. Visually polished with animations.

**Target user:** 7-8 year old child (grade 1-2). The game must feel like a REAL GAME, NOT an educational app.

---

## 🏗️ BUILD IN THIS ORDER (MVP → Phase 2 → Phase 3)

### ✅ MVP (Build this FIRST — must be fully playable)
1. Main menu screen (select difficulty = semester)
2. Core game screen (quiz-shooting gameplay, 1 round = 5-10 minutes)
3. Results screen (score, accuracy, gold earned)
4. Basic shop (buy weapons with gold)
5. Save/load to localStorage
6. Character database (1年级上册 only, ~100 chars with real 人教版 data)
7. Tutorial (first-time player walkthrough)

### 📦 Phase 2 (add after MVP works)
- Loot box / gacha system
- Full 6-semester character database
- Daily missions
- Rank / season system
- Equipment inventory & selling
- Wrong-character Boss mode

### 🚀 Phase 3 (polish)
- Parent dashboard
- Advanced quiz types (audio, image-based)
- Achievements
- More animations & sound effects

**CRITICAL: Do NOT try to build everything at once. Get MVP working first.**

---

## 📁 PROJECT STRUCTURE

```
/
├── index.html
├── css/
│   ├── main.css
│   ├── game.css
│   └── animations.css
├── js/
│   ├── app.js              # Entry point, screen routing, unified gameState
│   ├── game/
│   │   ├── GameEngine.js   # Game loop, timer, scoring
│   │   ├── QuizSystem.js   # Question generation, validation, spaced repetition
│   │   ├── ComboSystem.js  # Combo tracking & effects
│   │   └── HealthSystem.js # Player HP & damage
│   ├── meta/
│   │   ├── Economy.js      # Gold coins, buying
│   │   ├── ShopSystem.js   # Equipment shop
│   │   └── Inventory.js    # Weapon/skin storage
│   ├── data/
│   │   └── characters.js   # Character database
│   └── utils/
│       ├── storage.js      # localStorage save/load
│       └── antiCheat.js    # Anti-guessing rules
└── assets/
    └── sounds/             # Simple sound effects
```

---

## 🧠 UNIFIED STATE MODEL (Critical — all modules read/write from this)

```javascript
const gameState = {
  screen: "menu",  // menu | game | results | shop | tutorial
  player: {
    name: "Player",
    gold: 0,
    totalScore: 0,
    equippedWeapon: "basic_pistol",
    rank: "bronze"
  },
  inventory: {
    weapons: ["basic_pistol"],
    skins: ["default"]
  },
  round: {
    active: false,
    timeRemaining: 0,
    score: 0,
    combo: 0,
    hp: 5,
    enemiesDefeated: 0,
    correctCount: 0,
    wrongCount: 0,
    answeredChars: []
  },
  mastery: {
    // "大": { correct: 5, wrong: 1, lastSeen: "2026-04-06", state: "learning" }
    // states: new → learning → review → mastered
  },
  settings: {
    semester: "1_up",
    soundOn: true,
    tutorialDone: false
  }
};
```

---

## 🎮 GAME SCREEN

**Layout:**
```
┌─────────────────────────────────────┐
│  ❤️❤️❤️❤️❤️    ⏱️ 7:32    💰 450   │  ← HP, Timer, Score
│                                     │
│        👾 ENEMY SPRITE              │  ← Animated enemy
│        HP: ████░░                   │
│                                     │
│   ┌───────────────────────────┐     │
│   │  "选择正确的读音: 大"     │     │  ← Question
│   └───────────────────────────┘     │
│                                     │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐  │  ← 4 options
│  │ dà  │ │ tài │ │ quǎn│ │ tiān│  │    (形近字 distractor)
│  └─────┘ └─────┘ └─────┘ └─────┘  │
│                                     │
│  🔥 COMBO: x3     🎯 85%           │  ← Stats bar
└─────────────────────────────────────┘
```

**Gameplay:**
1. One enemy appears. Needs 3-5 correct answers to defeat.
2. Question shows a Chinese character. Player picks the correct pinyin from 4 options.
3. ✅ Correct = bullet hits enemy, +score, combo+1
4. ❌ Wrong = enemy shoots back, lose 1 HP
5. Defeat enemy → next enemy (slightly harder)
6. Round ends: timer=0 OR HP=0
7. **Round length: default 8 minutes** (configurable: 5/8/10 min in settings)
8. Difficulty increases within a round: start with easier chars, add harder ones

---

## 📝 QUIZ SYSTEM (MVP: 2 types only)

**MVP question types (alternate randomly):**

| Type | Display | Player action |
|------|---------|--------------|
| 看字选音 | Show character "大" → pick pinyin from 4 options | Select dà (not tài/quǎn/tiān) |
| 看拼音选字 | Show pinyin "dà" → pick character from 4 options | Select 大 (not 太/犬/天) |

**Distractor rules (CRITICAL — do NOT use random characters):**
- Always use visually similar characters as wrong options (形近字)
- Example: 大 → distractors are 太, 犬, 天, 夫
- Randomize option positions every question
- Each character entry in the database MUST have a `similar` array

**Phase 2 additions (NOT in MVP):** audio-based questions, image-based questions, stroke count confirmation

---

## 📚 SPACED REPETITION (Simple but mandatory)

Each character has a mastery state:

```
new → learning → review → mastered
```

**Rules:**
- `new`: Never seen. Introduced 5 new chars per round.
- `learning`: Seen but < 3 consecutive correct. Appears frequently (every 2-3 questions).
- `review`: 3+ consecutive correct. Appears less often (every 8-10 questions).
- `mastered`: 5+ consecutive correct across 2+ different rounds. Rarely appears (1 per round as reinforcement).
- **Wrong answer on any state → reset to `learning`**

**Question selection per round:** 60% learning, 25% review, 10% new, 5% mastered

---

## 🔥 COMBO SYSTEM

| Streak | Name | Effect | Visual |
|--------|------|--------|--------|
| 3 correct | "连杀!" | Next hit does x2 damage | Orange flash + text popup |
| 5 correct | "超神!" | Gain 1 HP shield | Red flash + screen shake |
| 10 correct | "GODLIKE!" | Gold doubled for this round | Gold particle burst |
| < 2 sec answer | "爆头!" | +50% score for that question | Yellow "HEADSHOT" text |
| Combo broken | — | Reset to 0 | Brief grey flash |

---

## ⚔️ PUNISHMENT (Simplified — only 2 levels in MVP)

| Trigger | Effect | Visual |
|---------|--------|--------|
| Wrong answer | Lose 1 HP (out of 5), enemy shoots at you | Red screen flash, hit sound |
| 3 wrong in a row | **Wrong-char review popup**: show correct answer with pinyin for 3 seconds, then continue | Educational moment, not extra punishment |
| HP = 0 | Round ends → go to results | "Game Over" animation |

**NO additional penalties in MVP.** No weapon jamming, no airstrikes, no gold deduction, no durability. Keep it simple and fun. These can be added in Phase 2 as optional "hard mode".

---

## 💰 ECONOMY (Rebalanced)

**Gold earning per round:**
```
Base:           +100 gold (everyone gets this for completing)
Per enemy:      +20 gold × enemies defeated
Accuracy bonus: +50 if accuracy > 80%
Combo bonus:    +10 × best combo streak
```

Example: 5 enemies, 85% accuracy, best combo 4 = 100 + 100 + 50 + 40 = **290 gold**

**Shop prices (balanced for ~10 rounds to afford mid-tier):**

| Item | Price | Effect |
|------|-------|--------|
| Basic Pistol | Free (default) | Standard |
| Rifle | 2,000 gold | Cool shooting animation + sound |
| Sniper | 5,000 gold | "Headshot" bonus increased to +75% |
| Rocket Launcher | 10,000 gold | Screen shake on kill + explosion effect |
| Skins (5 options) | 1,000-5,000 gold | Purely cosmetic character outfits |

**IMPORTANT: Weapons do NOT reduce the number of questions needed to kill enemies.** They only provide visual upgrades, sound effects, and minor score bonuses. This ensures learning volume stays constant regardless of equipment.

---

## 🛡️ ANTI-GUESSING

| Rule | Trigger | Response |
|------|---------|----------|
| Too fast | Answer in < 0.5 sec | Don't count. Show "太快了! 再看看!" |
| Spam clicking | 3 answers < 1 sec each | Force 3-second cooldown for next 20 sec |
| Mercy rule | 5 wrong in a row | Show mini-tutorial: reveal correct char, pinyin, meaning. No punishment. |

---

## 📊 CHARACTER DATABASE (characters.js)

**MVP: Include only 一年级上册 (semester 1). Populate with REAL characters from the standard 人教版/部编版 textbook.**

```javascript
const CHARACTER_DB = {
  "1_up": {
    name: "一年级上册",
    level: 1,
    characters: [
      {
        char: "一", pinyin: "yī", meaning: "one",
        strokes: 1,
        similar: ["二", "三"],
        category: "数字"
      },
      {
        char: "大", pinyin: "dà", meaning: "big",
        strokes: 3,
        similar: ["太", "犬", "天", "夫"],
        category: "形容词"
      },
      {
        char: "人", pinyin: "rén", meaning: "person",
        strokes: 2,
        similar: ["入", "八", "个"],
        category: "名词"
      },
      // Include at minimum 80 characters for 1年级上册
      // Each MUST have: char, pinyin, meaning, strokes, similar[], category
      // The "similar" array is CRITICAL for anti-guessing distractors
    ]
  }
  // Phase 2: add "1_down", "2_up", "2_down", "3_up", "3_down"
};
```

**If you cannot find the exact textbook list, use the most common 100 Chinese characters for grade 1 with accurate pinyin and proper similar-looking character mappings.**

---

## 🎓 TUTORIAL (First-time only)

When `settings.tutorialDone === false`, show an interactive tutorial:
1. "Welcome! This is Word Warrior! 欢迎来到识字大作战!" (with character animation)
2. "See this character? Pick the right pinyin to SHOOT!" (highlight question + options)
3. "Correct! You hit the enemy! 答对了!" (show bullet animation)
4. "Oops! Wrong answer = you take damage!" (show HP drop)
5. "Get combos for bonus rewards! 连杀获得奖励!" (show combo counter)
6. "Ready? Let's go!" → Start first real round

After tutorial, set `settings.tutorialDone = true`.

---

## 🎨 VISUAL DESIGN

1. **Color palette:** Dark theme with neon accents
   - Background: #1a1a2e
   - Action: #e94560
   - Accent: #0f3460
   - Gold: #f5c518
   - Success: #00ff88
   - Danger: #ff4444

2. **Typography:**
   - Google Fonts: "Press Start 2P" for UI labels
   - Chinese characters: "Noto Sans SC" at **minimum 56px** (must be readable for children)
   - Answer buttons text: minimum 36px

3. **Animations (CSS transitions + requestAnimationFrame):**
   - Bullet flying on correct answer (CSS transform)
   - Enemy flinch on damage
   - Screen flash on wrong answer
   - Combo text popup with scale-in animation
   - Simple particle burst on enemy defeat (< 20 particles, reuse DOM nodes)

4. **Sound:** Use Web Audio API. On mobile, require a user tap to unlock audio context first. Keep sounds short (< 1 sec). Minimum sounds: shoot, hit, wrong, combo_up, victory, defeat.

5. **Mobile-first:** All touch targets ≥ 48px. Works in both portrait and landscape. No hover-only interactions.

---

## 🗃️ SAVE SYSTEM

Save `gameState` to localStorage on: round end, purchase, settings change.
Load on app start. Add a `version: 1` field for future migration.

---

## ⚠️ IMPLEMENTATION RULES

1. Get MVP working FIRST before adding Phase 2 features
2. The game must be FUN — if it feels like homework, you failed
3. Character database accuracy is critical — use real data
4. Every module reads/writes from the unified `gameState` — no separate state stores
5. Test the flow: Menu → Tutorial (first time) → Select semester → Play → Results → Shop → Play again
6. Keep animations performant: use CSS transforms, limit particles, reuse DOM
7. Enemy behavior is simple scripted progression (not AI): each enemy has a name, HP, and sprite style

---

## 提示词结束 ☝️

---

## Codex 审阅修订记录

本 v2 版本基于 Codex (xhigh reasoning) 独立审阅修订：

| # | 原问题 | 修改 |
|---|--------|------|
| C1 | 武器升级减少答题量，损害学习 | 武器改为纯视觉+微量分数加成，不影响答题量 |
| C2 | 无间隔复习 | 新增 new→learning→review→mastered 四状态调度 |
| C3 | 范围太大，Agent 会做浅 | 改为 MVP/Phase2/Phase3 分阶段构建 |
| C4 | 无新手教程 | 新增 Tutorial 系统 |
| W1 | 惩罚太密，7-8岁压力大 | 简化为只有掉血+错字回看，删除卡壳/空袭/扣金/磨损 |
| W2 | 20分钟偏长 | 改为默认8分钟，可选5/8/10 |
| W3 | 经济膨胀太快 | 重新定价：步枪2000→狙击5000→火箭10000 |
| W4 | 答题模式过复杂 | 用户要求：MVP只保留2种基础模式，多模态放Phase 2 |
| W5 | 缺统一状态模型 | 新增 unified gameState |
| W6 | 家长面板过复杂 | 移入Phase 3 |
| S1 | 字表应独立提供 | 提示Agent用真实字表，不要自行编造 |
