主判断：这对文件已经能支撑一个“概念上可讲通”的产品，但还不算“可稳做、可稳玩、可稳学”的版本。最大问题有 4 个：没有真正的间隔复习机制、惩罚和经济都偏重、装备成长会稀释练习量、对 Replit Agent 来说范围过大且有多处歧义。

**1. Game Design Coherence**
- `Critical` 装备成长和学习目标在互相打架。武器升级直接提升伤害，而敌人只需 3-5 次正确答案就能击杀，这会让后期每个敌人需要的题目数下降，实际减少识字练习量。建议把武器升级改成“容错、视觉反馈、特殊回合奖励”，不要直接减少答题次数。([replit_prompt.md:108](d:/Data/Replit/word-warrior/replit_prompt.md#L108), [replit_prompt.md:200](d:/Data/Replit/word-warrior/replit_prompt.md#L200), [game_design_doc.md:26](d:/Data/Replit/word-warrior/game_design_doc.md#L26), [game_design_doc.md:91](d:/Data/Replit/word-warrior/game_design_doc.md#L91))
- `Warning` 惩罚叠得太多，不像 7-8 岁儿童的节奏。答错会掉血、卡壳、空袭、局后减金币、还要承担耐久修理，负反馈太密，容易从“想赢”变成“怕错”。建议局内只保留 1 个强惩罚，其余改成提示、减分或错题回放。([replit_prompt.md:154](d:/Data/Replit/word-warrior/replit_prompt.md#L154), [replit_prompt.md:159](d:/Data/Replit/word-warrior/replit_prompt.md#L159), [game_design_doc.md:65](d:/Data/Replit/word-warrior/game_design_doc.md#L65), [game_design_doc.md:97](d:/Data/Replit/word-warrior/game_design_doc.md#L97))
- `Warning` 20 分钟单局偏长，且“被淘汰后观战”在单人网页游戏里不自洽。这个年龄段更适合 5-8 分钟一局，失败后立即进入复盘或下一轮。([replit_prompt.md:17](d:/Data/Replit/word-warrior/replit_prompt.md#L17), [replit_prompt.md:157](d:/Data/Replit/word-warrior/replit_prompt.md#L157), [game_design_doc.md:17](d:/Data/Replit/word-warrior/game_design_doc.md#L17))
- `Warning` 经济数值明显会过快膨胀。示例一局就有 930 金币，步枪只要 500，日常任务再送 300-500 和宝箱，玩家几局内就能越级买到高伤武器，数值会快速失衡。建议先做一张“每 10 局金币流入/流出表”，再定价。([replit_prompt.md:176](d:/Data/Replit/word-warrior/replit_prompt.md#L176), [replit_prompt.md:200](d:/Data/Replit/word-warrior/replit_prompt.md#L200), [replit_prompt.md:252](d:/Data/Replit/word-warrior/replit_prompt.md#L252))
- `Suggestion` 缺少几个闭环补件：新手引导、暂停/继续、Boss 规则、成就规则。GDD 提了错字本 Boss 和成就，但 prompt 里没有把玩法讲完整。([replit_prompt.md:50](d:/Data/Replit/word-warrior/replit_prompt.md#L50), [replit_prompt.md:315](d:/Data/Replit/word-warrior/replit_prompt.md#L315), [game_design_doc.md:107](d:/Data/Replit/word-warrior/game_design_doc.md#L107), [game_design_doc.md:108](d:/Data/Replit/word-warrior/game_design_doc.md#L108))

**2. Educational Effectiveness**
- `Critical` 现在没有真正的 spaced repetition。存档里有 `characterMastery` 和 `wrongBook`，但没有任何“何时重现、重现频率、如何从新字变成熟字”的规则。这个缺口会直接让它更像答题游戏，不像识字训练系统。建议加入 `new / learning / review / mastered` 四状态和基于答对率、时间间隔、错误次数的调度。([replit_prompt.md:302](d:/Data/Replit/word-warrior/replit_prompt.md#L302), [replit_prompt.md:315](d:/Data/Replit/word-warrior/replit_prompt.md#L315))
- `Critical` 防蒙猜机制主要是在“罚快”，不是在“防猜”。0.5 秒不计分、连续快答强制冷却，只能压制乱点，不能阻止孩子靠排除法或熟悉按钮位置猜题；“准确率波动大就切题型”也缺少学习依据。建议把重点改成“错题强制回看 + 错项复现 + 干扰项自适应变难”。([replit_prompt.md:276](d:/Data/Replit/word-warrior/replit_prompt.md#L276), [game_design_doc.md:113](d:/Data/Replit/word-warrior/game_design_doc.md#L113))
- `Warning` 4 种题型都偏识别型，缺少真正的主动提取和语境阅读。对中文识字来说，只做单字识别不够，至少要补 1 种“词语/句子语境选字”或“看义写字/拼部件”题型。([replit_prompt.md:122](d:/Data/Replit/word-warrior/replit_prompt.md#L122), [game_design_doc.md:47](d:/Data/Replit/word-warrior/game_design_doc.md#L47))
- `Warning` “游戏优先”现在压过了“学习优先”。抽箱、卖物、武器、段位都很强，但学习目标没有被同等强度绑定，确实有变成纯娱乐壳的风险。建议把高级奖励改成“掌握度门槛解锁”，不是单纯按局内分数发。([replit_prompt.md:188](d:/Data/Replit/word-warrior/replit_prompt.md#L188), [replit_prompt.md:260](d:/Data/Replit/word-warrior/replit_prompt.md#L260), [replit_prompt.md:378](d:/Data/Replit/word-warrior/replit_prompt.md#L378))

**3. Technical Feasibility**
- `Critical` 对 Replit Agent 来说，这个 prompt 一次性要求太多。多页面、动画、音频、家长面板、每日任务、商店、抽箱、6 学期真实字库、形近字干扰、错题系统，全都要求首轮完成，极容易产出“看起来全有、实际上都很浅”的代码。建议改成 MVP/Phase 2/Phase 3。([replit_prompt.md:23](d:/Data/Replit/word-warrior/replit_prompt.md#L23), [replit_prompt.md:208](d:/Data/Replit/word-warrior/replit_prompt.md#L208), [replit_prompt.md:321](d:/Data/Replit/word-warrior/replit_prompt.md#L321))
- `Warning` 有几块需求对 vanilla HTML/CSS/JS 不是做不到，而是“没说清 fallback”。比如 `Enemy AI behavior`、笔顺动画、语音播放、趋势图、家长密码页。建议明确默认实现：敌人走脚本而非 AI、图表用 canvas、语音优先 Web Speech API、笔顺先做静态演示。([replit_prompt.md:40](d:/Data/Replit/word-warrior/replit_prompt.md#L40), [replit_prompt.md:280](d:/Data/Replit/word-warrior/replit_prompt.md#L280), [replit_prompt.md:323](d:/Data/Replit/word-warrior/replit_prompt.md#L323))
- `Suggestion` `localStorage` 存状态完全够用，字库和掌握度数据量也不大；不够的是资源管理，不是存档。建议给存档加 `version` 字段，并把音频/图片当静态资源，不要塞进存档。([replit_prompt.md:284](d:/Data/Replit/word-warrior/replit_prompt.md#L284))
- `Warning` 移动端性能和音频权限会出问题。粒子、屏幕震动、连续音效、Google Fonts、长局时长叠加在手机浏览器上，容易掉帧；而且音频常常要首击解锁。建议限制粒子数量、复用 DOM、首屏先做音频解锁。([replit_prompt.md:347](d:/Data/Replit/word-warrior/replit_prompt.md#L347), [replit_prompt.md:380](d:/Data/Replit/word-warrior/replit_prompt.md#L380))

**4. Missing Or Weak Areas**
- `Critical` 缺新手教程和儿童友好失败保护。7-8 岁用户需要第一局有人带着学“怎么射击、怎么答题、答错会怎样”，否则高刺激界面会先压过规则理解。([replit_prompt.md:67](d:/Data/Replit/word-warrior/replit_prompt.md#L67), [replit_prompt.md:150](d:/Data/Replit/word-warrior/replit_prompt.md#L150))
- `Warning` 没有定义“掌握一个字”的标准，也没有明确学期解锁逻辑。只写了按学期分档和段位映射，但没说何时升级、何时复习、何时切换到下一批字。([replit_prompt.md:213](d:/Data/Replit/word-warrior/replit_prompt.md#L213), [replit_prompt.md:260](d:/Data/Replit/word-warrior/replit_prompt.md#L260))
- `Warning` 家长面板里“调整难度/添加自定义字”很容易把复杂度炸开，但没有对应的 UX 约束、校验和数据格式。建议首版只保留“选学期、开关音效、查看薄弱字”。([replit_prompt.md:323](d:/Data/Replit/word-warrior/replit_prompt.md#L323))
- `Suggestion` 题材上最好准备一个低暴力皮肤。当前“军事暗色系 + 吃鸡 + 空袭 + 枪械”对部分家长会有阻力，尤其目标年龄是 7-8 岁。建议默认外观改成“机器人训练场/怪物闯关”，保留战斗节奏但弱化真实枪战语义。([replit_prompt.md:335](d:/Data/Replit/word-warrior/replit_prompt.md#L335), [game_design_doc.md:125](d:/Data/Replit/word-warrior/game_design_doc.md#L125))

**5. Prompt Quality (for Replit Agent)**
- `Critical` 细节很多，但“可执行优先级”不清楚。Agent 不知道哪些是必须做对的，哪些可以先占位，结果很可能是全都做一点、没有一块做透。建议把 prompt 改成：`MVP 必做`、`可延后`、`禁止偷工减料项`。([replit_prompt.md:11](d:/Data/Replit/word-warrior/replit_prompt.md#L11))
- `Warning` 有多处会导致实现跑偏的歧义：`20-minute per round`、`visually stunning`、`special skill (shield/airstrike)`、`enemy AI behavior`、`REAL textbook characters`、`Boss mode` 只在存档注释里出现。建议全部改成可验收语句。([replit_prompt.md:17](d:/Data/Replit/word-warrior/replit_prompt.md#L17), [replit_prompt.md:40](d:/Data/Replit/word-warrior/replit_prompt.md#L40), [replit_prompt.md:142](d:/Data/Replit/word-warrior/replit_prompt.md#L142), [replit_prompt.md:315](d:/Data/Replit/word-warrior/replit_prompt.md#L315))
- `Warning` 结构上缺一个统一状态模型。现在 `GameEngine / QuizSystem / screens / storage / analytics` 都可能各管一套状态，Replit Agent 很容易写出重复和串不起来的逻辑。建议在 prompt 里明确一个中心 `gameState`。([replit_prompt.md:33](d:/Data/Replit/word-warrior/replit_prompt.md#L33), [replit_prompt.md:67](d:/Data/Replit/word-warrior/replit_prompt.md#L67), [replit_prompt.md:284](d:/Data/Replit/word-warrior/replit_prompt.md#L284))
- `Suggestion` 最该补的是“构建顺序”和“验收标准”。最实用的写法是：
1. 先做菜单、存档、1 个可玩的对局。
2. 再做结果页、金币、商店。
3. 再做每日任务、家长面板。
4. 最后扩展字库、动画、Boss、成就。
- `Suggestion` 最好把真实字表作为独立附件给 Agent，不要让它自己编。否则字表准确性、形近字映射、学期划分都会变成高风险幻觉点。([replit_prompt.md:230](d:/Data/Replit/word-warrior/replit_prompt.md#L230), [replit_prompt.md:242](d:/Data/Replit/word-warrior/replit_prompt.md#L242))

如果你要下一步直接推进，我的建议不是先写代码，而是先改这两份文档：优先补 `spaced repetition 规则`、`经济表`、`MVP 范围`、`统一状态模型`。这 4 个补完后，Replit Agent 产出可用原型的概率会高很多。