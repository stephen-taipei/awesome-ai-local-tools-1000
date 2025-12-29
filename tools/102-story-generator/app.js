/**
 * Story Generator - Tool #102
 * Awesome AI Local Tools
 */

const translations = {
    'zh-TW': {
        title: 'AI 故事生成',
        subtitle: '創意故事生成器，激發無限想像',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        genreLabel: '故事類型',
        genreFantasy: '奇幻',
        genreScifi: '科幻',
        genreRomance: '愛情',
        genreMystery: '懸疑',
        genreAdventure: '冒險',
        genreHorror: '恐怖',
        settingLabel: '故事背景',
        settingPlaceholder: '例如：中世紀城堡、未來都市...',
        characterLabel: '主角描述',
        characterPlaceholder: '描述您的主角...',
        plotLabel: '故事情節提示',
        plotPlaceholder: '輸入故事的關鍵情節或轉折...',
        toneLabel: '敘事風格',
        toneDramatic: '戲劇性',
        toneHumorous: '幽默',
        toneDark: '黑暗',
        toneLighthearted: '輕鬆',
        lengthLabel: '故事長度',
        generateBtn: '生成故事',
        generating: '生成中...',
        outputTitle: '您的故事',
        copyBtn: '複製',
        downloadBtn: '下載',
        copied: '已複製！',
        charCount: '字數',
        howItWorks: '功能特色',
        feature1: '多種類型',
        feature1Desc: '奇幻、科幻、愛情、懸疑等多種故事類型',
        feature2: '角色塑造',
        feature2Desc: '自定義主角特性，打造獨特角色',
        feature3: '隱私保護',
        feature3Desc: '所有處理在瀏覽器本地完成',
        feature4: '創意無限',
        feature4Desc: 'AI 協助激發創作靈感',
        backToHome: '返回首頁',
        toolNumber: '工具 #102',
        copyright: 'Awesome AI Local Tools © 2024'
    },
    'en': {
        title: 'Story Generator',
        subtitle: 'Creative story generator, spark your imagination',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        genreLabel: 'Genre',
        genreFantasy: 'Fantasy',
        genreScifi: 'Sci-Fi',
        genreRomance: 'Romance',
        genreMystery: 'Mystery',
        genreAdventure: 'Adventure',
        genreHorror: 'Horror',
        settingLabel: 'Story Setting',
        settingPlaceholder: 'e.g., Medieval castle, Future city...',
        characterLabel: 'Main Character',
        characterPlaceholder: 'Describe your protagonist...',
        plotLabel: 'Plot Hints',
        plotPlaceholder: 'Enter key plot points or twists...',
        toneLabel: 'Narrative Style',
        toneDramatic: 'Dramatic',
        toneHumorous: 'Humorous',
        toneDark: 'Dark',
        toneLighthearted: 'Lighthearted',
        lengthLabel: 'Story Length',
        generateBtn: 'Generate Story',
        generating: 'Generating...',
        outputTitle: 'Your Story',
        copyBtn: 'Copy',
        downloadBtn: 'Download',
        copied: 'Copied!',
        charCount: 'Characters',
        howItWorks: 'Features',
        feature1: 'Multiple Genres',
        feature1Desc: 'Fantasy, Sci-Fi, Romance, Mystery and more',
        feature2: 'Character Creation',
        feature2Desc: 'Customize protagonist traits for unique characters',
        feature3: 'Privacy Protected',
        feature3Desc: 'All processing done locally in browser',
        feature4: 'Unlimited Creativity',
        feature4Desc: 'AI helps spark creative inspiration',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #102',
        copyright: 'Awesome AI Local Tools © 2024'
    }
};

let currentLang = 'zh-TW';

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[lang][key]) {
            el.placeholder = translations[lang][key];
        }
    });
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`lang-${lang === 'zh-TW' ? 'zh' : 'en'}`).classList.add('active');
}

function t(key) {
    return translations[currentLang][key] || key;
}

const storyElements = {
    'zh-TW': {
        fantasy: {
            openings: ['在遙遠的王國裡，', '傳說中有一片被遺忘的土地，', '當月光灑落在古老的森林時，'],
            conflicts: ['一場黑暗的力量正在覺醒', '一個古老的預言即將實現', '命運的齒輪開始轉動'],
            endings: ['從此，和平重新降臨這片土地。', '英雄的傳說永遠流傳。', '新的時代就此展開。']
        },
        scifi: {
            openings: ['西元2150年，', '在銀河系的邊緣，', '當人類終於實現星際旅行，'],
            conflicts: ['一個神秘的信號從未知星系傳來', '人工智能開始質疑自己的存在', '時空裂縫出現了'],
            endings: ['宇宙的秘密終於揭曉。', '人類邁向了新的紀元。', '星辰之間，希望永存。']
        },
        romance: {
            openings: ['那是一個春天的午後，', '在繁忙的城市裡，', '命運讓兩個陌生人相遇，'],
            conflicts: ['然而，現實的阻礙橫在他們之間', '一個誤會讓一切變得複雜', '過去的傷痛難以釋懷'],
            endings: ['愛情終於戰勝了一切。', '他們相視而笑，手牽著手。', '幸福，原來一直都在身邊。']
        },
        mystery: {
            openings: ['那是一個暴風雨的夜晚，', '當所有人都認為案件已經結案，', '一封神秘的信寄到了偵探手中，'],
            conflicts: ['每個人都有不可告人的秘密', '真相比想像中更加複雜', '時間正在一分一秒流逝'],
            endings: ['真相終於大白。', '正義得到了伸張。', '謎團解開的瞬間，一切都清晰了。']
        },
        adventure: {
            openings: ['探險隊踏上了未知的旅程，', '地圖上標記著一個神秘的X，', '這將是一場改變命運的冒險，'],
            conflicts: ['危險潛伏在每個角落', '團隊的信任面臨考驗', '時間和敵人都在追趕'],
            endings: ['寶藏終於被發現了。', '這次冒險讓每個人都成長了。', '新的冒險正在召喚。']
        },
        horror: {
            openings: ['午夜時分，詭異的事情開始發生，', '那棟被廢棄的房子有著不為人知的秘密，', '當迷霧籠罩整個小鎮，'],
            conflicts: ['恐懼開始蔓延', '沒有人能夠逃離這個噩夢', '黑暗中的某些東西正在注視著'],
            endings: ['黎明終於來臨。', '噩夢結束了，但陰影永遠留在心中。', '有些恐懼，永遠無法忘記。']
        }
    },
    'en': {
        fantasy: {
            openings: ['In a distant kingdom,', 'Legend speaks of a forgotten land,', 'When moonlight fell upon the ancient forest,'],
            conflicts: ['a dark power was awakening', 'an ancient prophecy was about to be fulfilled', 'the wheels of fate began to turn'],
            endings: ['Peace returned to the land once more.', 'The hero\'s legend lived on forever.', 'A new era had begun.']
        },
        scifi: {
            openings: ['In the year 2150,', 'At the edge of the galaxy,', 'When humanity finally achieved interstellar travel,'],
            conflicts: ['a mysterious signal arrived from an unknown system', 'artificial intelligence began questioning its existence', 'a rift in spacetime appeared'],
            endings: ['The secrets of the universe were finally revealed.', 'Humanity stepped into a new era.', 'Among the stars, hope endures.']
        },
        romance: {
            openings: ['It was a spring afternoon,', 'In the bustling city,', 'Fate brought two strangers together,'],
            conflicts: ['However, reality stood between them', 'A misunderstanding complicated everything', 'Past wounds were hard to heal'],
            endings: ['Love conquered all in the end.', 'They smiled at each other, hand in hand.', 'Happiness had been there all along.']
        },
        mystery: {
            openings: ['It was a stormy night,', 'When everyone thought the case was closed,', 'A mysterious letter arrived at the detective\'s office,'],
            conflicts: ['Everyone had secrets to hide', 'The truth was more complex than imagined', 'Time was running out'],
            endings: ['The truth was finally revealed.', 'Justice was served.', 'The moment the mystery unraveled, everything became clear.']
        },
        adventure: {
            openings: ['The expedition set off on an unknown journey,', 'The map marked a mysterious X,', 'This would be a life-changing adventure,'],
            conflicts: ['Danger lurked around every corner', 'The team\'s trust was being tested', 'Time and enemies were closing in'],
            endings: ['The treasure was finally found.', 'This adventure helped everyone grow.', 'A new adventure was calling.']
        },
        horror: {
            openings: ['At midnight, strange things began to happen,', 'The abandoned house held secrets unknown,', 'When fog engulfed the entire town,'],
            conflicts: ['Fear began to spread', 'No one could escape this nightmare', 'Something in the darkness was watching'],
            endings: ['Dawn finally came.', 'The nightmare ended, but shadows remained in their hearts.', 'Some fears can never be forgotten.']
        }
    }
};

function generateStory(genre, setting, character, plot, tone, length) {
    const elements = storyElements[currentLang][genre];
    const lengthMultiplier = length === 'short' ? 1 : length === 'medium' ? 2 : 3;

    let story = '';

    // Title
    const titles = {
        'zh-TW': [`《${setting || '未知之地'}的傳說》`, `《${character || '英雄'}的故事》`],
        'en': [`The Legend of ${setting || 'Unknown Land'}`, `The Story of ${character || 'Hero'}`]
    };
    story += titles[currentLang][Math.floor(Math.random() * titles[currentLang].length)] + '\n\n';

    // Opening
    story += elements.openings[Math.floor(Math.random() * elements.openings.length)];

    if (setting) {
        story += currentLang === 'zh-TW' ? `在${setting}這個地方，` : `in ${setting}, `;
    }

    if (character) {
        story += currentLang === 'zh-TW' ? `${character}的故事就此展開。` : `the story of ${character} began.`;
    } else {
        story += currentLang === 'zh-TW' ? '一段不平凡的故事就此展開。' : 'an extraordinary story began.';
    }
    story += '\n\n';

    // Body paragraphs
    for (let i = 0; i < lengthMultiplier; i++) {
        const bodyTemplates = {
            'zh-TW': [
                '時間一天天過去，',
                '隨著事情的發展，',
                '在這個過程中，',
                '然而，命運總是充滿意外。'
            ],
            'en': [
                'Days passed by,',
                'As events unfolded,',
                'During this time,',
                'However, fate is always full of surprises.'
            ]
        };

        story += bodyTemplates[currentLang][i % bodyTemplates[currentLang].length] + ' ';
        story += elements.conflicts[Math.floor(Math.random() * elements.conflicts.length)] + '。\n\n';
    }

    // Plot integration
    if (plot) {
        story += currentLang === 'zh-TW' ? `就在這時，${plot}。這個轉折改變了一切。\n\n` : `Just then, ${plot}. This turn of events changed everything.\n\n`;
    }

    // Ending
    story += elements.endings[Math.floor(Math.random() * elements.endings.length)];

    return story;
}

function init() {
    const browserLang = navigator.language;
    setLanguage(browserLang.startsWith('zh') ? 'zh-TW' : 'en');

    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    document.getElementById('generateBtn').addEventListener('click', () => {
        const genre = document.getElementById('genreSelect').value;
        const setting = document.getElementById('settingInput').value.trim();
        const character = document.getElementById('characterInput').value.trim();
        const plot = document.getElementById('plotInput').value.trim();
        const tone = document.getElementById('toneSelect').value;
        const length = document.getElementById('lengthSelect').value;

        const btn = document.getElementById('generateBtn');
        btn.disabled = true;
        btn.querySelector('span').textContent = t('generating');

        setTimeout(() => {
            const story = generateStory(genre, setting, character, plot, tone, length);
            document.getElementById('outputContent').textContent = story;
            document.getElementById('outputSection').style.display = 'block';
            document.getElementById('outputStats').innerHTML = `<span>${t('charCount')}: ${story.length}</span>`;

            btn.disabled = false;
            btn.querySelector('span').textContent = t('generateBtn');
            document.getElementById('outputSection').scrollIntoView({ behavior: 'smooth' });
        }, 800);
    });

    document.getElementById('copyBtn').addEventListener('click', () => {
        const text = document.getElementById('outputContent').textContent;
        navigator.clipboard.writeText(text).then(() => {
            const btn = document.getElementById('copyBtn');
            btn.textContent = t('copied');
            setTimeout(() => btn.textContent = t('copyBtn'), 2000);
        });
    });

    document.getElementById('downloadBtn').addEventListener('click', () => {
        const text = document.getElementById('outputContent').textContent;
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'story.txt';
        a.click();
        URL.revokeObjectURL(url);
    });
}

init();
