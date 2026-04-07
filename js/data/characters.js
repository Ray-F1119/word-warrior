/**
 * characters.js — Chinese Character Database
 * 人教版/部编版 一年级上册 生字表
 * Each entry: { char, pinyin, meaning, strokes, similar[], category }
 */
const CHARACTER_DB = {
    "1_up": {
        name: "一年级上册",
        level: 1,
        characters: [
            // ---- 数字 ----
            { char: "一", pinyin: "yī", meaning: "one", strokes: 1, similar: ["二", "三", "十"], category: "数字" },
            { char: "二", pinyin: "èr", meaning: "two", strokes: 2, similar: ["一", "三", "工"], category: "数字" },
            { char: "三", pinyin: "sān", meaning: "three", strokes: 3, similar: ["一", "二", "王"], category: "数字" },
            { char: "四", pinyin: "sì", meaning: "four", strokes: 5, similar: ["西", "回", "田"], category: "数字" },
            { char: "五", pinyin: "wǔ", meaning: "five", strokes: 4, similar: ["互", "正", "王"], category: "数字" },
            { char: "六", pinyin: "liù", meaning: "six", strokes: 4, similar: ["八", "入", "大"], category: "数字" },
            { char: "七", pinyin: "qī", meaning: "seven", strokes: 2, similar: ["十", "九", "匕"], category: "数字" },
            { char: "八", pinyin: "bā", meaning: "eight", strokes: 2, similar: ["人", "入", "六"], category: "数字" },
            { char: "九", pinyin: "jiǔ", meaning: "nine", strokes: 2, similar: ["几", "丸", "七"], category: "数字" },
            { char: "十", pinyin: "shí", meaning: "ten", strokes: 2, similar: ["一", "七", "干"], category: "数字" },

            // ---- 人/身体 ----
            { char: "人", pinyin: "rén", meaning: "person", strokes: 2, similar: ["入", "八", "个"], category: "人" },
            { char: "大", pinyin: "dà", meaning: "big", strokes: 3, similar: ["太", "犬", "天", "夫"], category: "形容词" },
            { char: "天", pinyin: "tiān", meaning: "sky", strokes: 4, similar: ["大", "太", "夫"], category: "自然" },
            { char: "口", pinyin: "kǒu", meaning: "mouth", strokes: 3, similar: ["日", "目", "田"], category: "身体" },
            { char: "目", pinyin: "mù", meaning: "eye", strokes: 5, similar: ["口", "日", "田", "自"], category: "身体" },
            { char: "耳", pinyin: "ěr", meaning: "ear", strokes: 6, similar: ["目", "自", "手"], category: "身体" },
            { char: "手", pinyin: "shǒu", meaning: "hand", strokes: 4, similar: ["毛", "牛", "耳"], category: "身体" },
            { char: "足", pinyin: "zú", meaning: "foot", strokes: 7, similar: ["走", "是", "正"], category: "身体" },

            // ---- 自然 ----
            { char: "日", pinyin: "rì", meaning: "sun/day", strokes: 4, similar: ["目", "口", "白", "田"], category: "自然" },
            { char: "月", pinyin: "yuè", meaning: "moon", strokes: 4, similar: ["目", "用", "日"], category: "自然" },
            { char: "水", pinyin: "shuǐ", meaning: "water", strokes: 4, similar: ["火", "木", "永"], category: "自然" },
            { char: "火", pinyin: "huǒ", meaning: "fire", strokes: 4, similar: ["水", "大", "灭"], category: "自然" },
            { char: "山", pinyin: "shān", meaning: "mountain", strokes: 3, similar: ["出", "土", "上"], category: "自然" },
            { char: "石", pinyin: "shí", meaning: "stone", strokes: 5, similar: ["右", "左", "百"], category: "自然" },
            { char: "田", pinyin: "tián", meaning: "field", strokes: 5, similar: ["目", "口", "日", "由"], category: "自然" },
            { char: "土", pinyin: "tǔ", meaning: "earth", strokes: 3, similar: ["上", "下", "山", "王"], category: "自然" },
            { char: "云", pinyin: "yún", meaning: "cloud", strokes: 4, similar: ["去", "会", "元"], category: "自然" },
            { char: "雨", pinyin: "yǔ", meaning: "rain", strokes: 8, similar: ["雪", "电", "两"], category: "自然" },
            { char: "风", pinyin: "fēng", meaning: "wind", strokes: 4, similar: ["凤", "几", "飞"], category: "自然" },
            { char: "花", pinyin: "huā", meaning: "flower", strokes: 7, similar: ["化", "草", "华"], category: "自然" },

            // ---- 方位/基础 ----
            { char: "上", pinyin: "shàng", meaning: "up", strokes: 3, similar: ["下", "土", "山"], category: "方位" },
            { char: "下", pinyin: "xià", meaning: "down", strokes: 3, similar: ["上", "不", "土"], category: "方位" },
            { char: "左", pinyin: "zuǒ", meaning: "left", strokes: 5, similar: ["右", "石", "在"], category: "方位" },
            { char: "右", pinyin: "yòu", meaning: "right", strokes: 5, similar: ["左", "石", "有"], category: "方位" },
            { char: "中", pinyin: "zhōng", meaning: "middle", strokes: 4, similar: ["口", "日", "申"], category: "方位" },
            { char: "里", pinyin: "lǐ", meaning: "inside", strokes: 7, similar: ["理", "里", "果"], category: "方位" },

            // ---- 动物 ----
            { char: "虫", pinyin: "chóng", meaning: "insect", strokes: 6, similar: ["中", "虹", "蛇"], category: "动物" },
            { char: "鸟", pinyin: "niǎo", meaning: "bird", strokes: 5, similar: ["马", "鱼", "乌"], category: "动物" },
            { char: "鱼", pinyin: "yú", meaning: "fish", strokes: 8, similar: ["鸟", "马", "角"], category: "动物" },
            { char: "马", pinyin: "mǎ", meaning: "horse", strokes: 3, similar: ["鸟", "鱼", "妈"], category: "动物" },
            { char: "牛", pinyin: "niú", meaning: "cow", strokes: 4, similar: ["午", "手", "生"], category: "动物" },
            { char: "羊", pinyin: "yáng", meaning: "sheep", strokes: 6, similar: ["半", "米", "美"], category: "动物" },
            { char: "犬", pinyin: "quǎn", meaning: "dog", strokes: 4, similar: ["大", "太", "天"], category: "动物" },

            // ---- 植物/食物 ----
            { char: "木", pinyin: "mù", meaning: "wood", strokes: 4, similar: ["本", "不", "大", "水"], category: "植物" },
            { char: "禾", pinyin: "hé", meaning: "grain", strokes: 5, similar: ["木", "本", "和"], category: "植物" },
            { char: "竹", pinyin: "zhú", meaning: "bamboo", strokes: 6, similar: ["竿", "笔", "禾"], category: "植物" },
            { char: "米", pinyin: "mǐ", meaning: "rice", strokes: 6, similar: ["来", "木", "羊"], category: "食物" },
            { char: "果", pinyin: "guǒ", meaning: "fruit", strokes: 8, similar: ["里", "课", "木"], category: "食物" },

            // ---- 常用字 ----
            { char: "个", pinyin: "gè", meaning: "measure word", strokes: 3, similar: ["人", "入", "不"], category: "常用" },
            { char: "了", pinyin: "le", meaning: "particle", strokes: 2, similar: ["子", "几", "力"], category: "常用" },
            { char: "不", pinyin: "bù", meaning: "not", strokes: 4, similar: ["木", "下", "本"], category: "常用" },
            { char: "在", pinyin: "zài", meaning: "at/in", strokes: 6, similar: ["左", "右", "有"], category: "常用" },
            { char: "有", pinyin: "yǒu", meaning: "have", strokes: 6, similar: ["右", "在", "友"], category: "常用" },
            { char: "来", pinyin: "lái", meaning: "come", strokes: 7, similar: ["米", "去", "朱"], category: "常用" },
            { char: "去", pinyin: "qù", meaning: "go", strokes: 5, similar: ["来", "云", "法"], category: "常用" },
            { char: "子", pinyin: "zǐ", meaning: "child", strokes: 3, similar: ["了", "字", "学"], category: "常用" },
            { char: "小", pinyin: "xiǎo", meaning: "small", strokes: 3, similar: ["大", "少", "尖"], category: "形容词" },
            { char: "少", pinyin: "shǎo", meaning: "few", strokes: 4, similar: ["小", "多", "沙"], category: "形容词" },
            { char: "多", pinyin: "duō", meaning: "many", strokes: 6, similar: ["少", "夕", "外"], category: "形容词" },
            { char: "白", pinyin: "bái", meaning: "white", strokes: 5, similar: ["日", "目", "百", "自"], category: "颜色" },
            { char: "正", pinyin: "zhèng", meaning: "correct", strokes: 5, similar: ["五", "止", "足"], category: "常用" },
            { char: "长", pinyin: "cháng", meaning: "long", strokes: 4, similar: ["太", "大", "头"], category: "形容词" },

            // ---- 动作 ----
            { char: "出", pinyin: "chū", meaning: "go out", strokes: 5, similar: ["山", "入", "击"], category: "动作" },
            { char: "见", pinyin: "jiàn", meaning: "see", strokes: 4, similar: ["贝", "几", "儿"], category: "动作" },
            { char: "走", pinyin: "zǒu", meaning: "walk", strokes: 7, similar: ["足", "是", "起"], category: "动作" },
            { char: "飞", pinyin: "fēi", meaning: "fly", strokes: 3, similar: ["风", "几", "九"], category: "动作" },
            { char: "打", pinyin: "dǎ", meaning: "hit", strokes: 5, similar: ["找", "把", "手"], category: "动作" },
            { char: "开", pinyin: "kāi", meaning: "open", strokes: 4, similar: ["关", "升", "井"], category: "动作" },
            { char: "关", pinyin: "guān", meaning: "close", strokes: 6, similar: ["开", "共", "美"], category: "动作" },
            { char: "问", pinyin: "wèn", meaning: "ask", strokes: 6, similar: ["门", "间", "闻"], category: "动作" },

            // ---- 家人 ----
            { char: "爸", pinyin: "bà", meaning: "father", strokes: 8, similar: ["妈", "父", "色"], category: "家人" },
            { char: "妈", pinyin: "mā", meaning: "mother", strokes: 6, similar: ["爸", "马", "女"], category: "家人" },
            { char: "女", pinyin: "nǚ", meaning: "female", strokes: 3, similar: ["妈", "子", "好"], category: "人" },

            // ---- 颜色 ----
            { char: "红", pinyin: "hóng", meaning: "red", strokes: 6, similar: ["绿", "蓝", "工"], category: "颜色" },
            { char: "绿", pinyin: "lǜ", meaning: "green", strokes: 11, similar: ["红", "蓝", "录"], category: "颜色" },
            { char: "蓝", pinyin: "lán", meaning: "blue", strokes: 13, similar: ["红", "绿", "篮"], category: "颜色" },

            // ---- 学校 ----
            { char: "书", pinyin: "shū", meaning: "book", strokes: 4, similar: ["画", "写", "本"], category: "学习" },
            { char: "本", pinyin: "běn", meaning: "book/root", strokes: 5, similar: ["木", "不", "书"], category: "学习" },
            { char: "学", pinyin: "xué", meaning: "study", strokes: 8, similar: ["字", "子", "写"], category: "学习" },
            { char: "字", pinyin: "zì", meaning: "character", strokes: 6, similar: ["学", "子", "存"], category: "学习" },
            { char: "文", pinyin: "wén", meaning: "writing", strokes: 4, similar: ["六", "交", "方"], category: "学习" },

            // ---- 其他常用 ----
            { char: "头", pinyin: "tóu", meaning: "head", strokes: 5, similar: ["大", "太", "买"], category: "身体" },
            { char: "太", pinyin: "tài", meaning: "too/very", strokes: 4, similar: ["大", "犬", "天"], category: "形容词" },
            { char: "好", pinyin: "hǎo", meaning: "good", strokes: 6, similar: ["女", "妈", "子"], category: "形容词" },
            { char: "先", pinyin: "xiān", meaning: "first", strokes: 6, similar: ["生", "见", "元"], category: "常用" },
            { char: "生", pinyin: "shēng", meaning: "born/life", strokes: 5, similar: ["牛", "先", "王"], category: "常用" },
            { char: "回", pinyin: "huí", meaning: "return", strokes: 6, similar: ["四", "口", "国"], category: "动作" },
            { char: "门", pinyin: "mén", meaning: "door", strokes: 3, similar: ["问", "间", "闻"], category: "常用" },
            { char: "力", pinyin: "lì", meaning: "power", strokes: 2, similar: ["了", "刀", "九"], category: "常用" },
            { char: "方", pinyin: "fāng", meaning: "square", strokes: 4, similar: ["万", "文", "放"], category: "常用" },
        ]
    }
};

/**
 * Get characters for a given semester
 * @param {string} semester - e.g. "1_up"
 * @returns {Array} character list
 */
function getCharacters(semester) {
    const db = CHARACTER_DB[semester];
    return db ? db.characters : [];
}

/**
 * Get distractor characters (similar-looking) for a given character
 * @param {object} charObj — character entry
 * @param {number} count — number of distractors needed
 * @param {string} semester — current semester
 * @returns {Array} distractor character objects
 */
function getDistractors(charObj, count, semester) {
    const allChars = getCharacters(semester);
    const distractors = [];

    // First, try to use the similar[] array
    for (const sim of charObj.similar) {
        if (distractors.length >= count) break;
        const found = allChars.find(c => c.char === sim);
        if (found && found.char !== charObj.char) {
            distractors.push(found);
        }
    }

    // If not enough, add random chars from same semester
    if (distractors.length < count) {
        const remaining = allChars.filter(c =>
            c.char !== charObj.char &&
            !distractors.some(d => d.char === c.char)
        );
        const shuffled = remaining.sort(() => Math.random() - 0.5);
        for (const c of shuffled) {
            if (distractors.length >= count) break;
            distractors.push(c);
        }
    }

    return distractors;
}
