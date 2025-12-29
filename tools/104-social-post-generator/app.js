/**
 * Social Post Generator - Tool #104
 */

const translations = {
    'zh-TW': {
        title: '社群貼文生成',
        subtitle: '快速生成各平台社群貼文',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        platformLabel: '社群平台',
        topicLabel: '貼文主題',
        topicPlaceholder: '輸入貼文主題或產品...',
        toneLabel: '語調風格',
        hashtagLabel: '包含 Hashtag',
        generateBtn: '生成貼文',
        outputTitle: '生成的貼文',
        copied: '已複製！',
        charLimit: '字元限制',
        errorNoTopic: '請輸入貼文主題'
    },
    'en': {
        title: 'Social Post Generator',
        subtitle: 'Generate posts for all platforms',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        platformLabel: 'Platform',
        topicLabel: 'Post Topic',
        topicPlaceholder: 'Enter topic or product...',
        toneLabel: 'Tone',
        hashtagLabel: 'Include Hashtags',
        generateBtn: 'Generate Post',
        outputTitle: 'Generated Post',
        copied: 'Copied!',
        charLimit: 'Character limit',
        errorNoTopic: 'Please enter a topic'
    }
};

let currentLang = 'zh-TW';
let currentPlatform = 'facebook';

const platformLimits = {
    facebook: 63206,
    instagram: 2200,
    twitter: 280,
    linkedin: 3000,
    threads: 500
};

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) el.textContent = translations[lang][key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[lang][key]) el.placeholder = translations[lang][key];
    });
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`lang-${lang === 'zh-TW' ? 'zh' : 'en'}`).classList.add('active');
}

function t(key) { return translations[currentLang][key] || key; }

const postTemplates = {
    'zh-TW': {
        professional: [
            '分享一個關於{topic}的專業見解...\n\n在當今競爭激烈的環境中，{topic}已成為不可或缺的要素。讓我們一起探討如何有效運用{topic}來提升價值。',
            '深入探討{topic}的重要性...\n\n根據最新研究，掌握{topic}的企業平均獲得30%的效率提升。你準備好迎接這個變革了嗎？'
        ],
        casual: [
            '最近一直在研究{topic}，發現真的很有趣！\n\n你們有沒有試過呢？歡迎留言分享你的經驗～',
            '今天來聊聊{topic}吧！\n\n說實話，自從開始接觸{topic}後，生活真的改變很多呢～'
        ],
        humorous: [
            '當你以為已經了解{topic}，結果發現還有更多...\n\n人生就是這樣，永遠學不完啊！',
            '{topic}的日常：\n週一：這個很簡單\n週五：我到底在幹嘛'
        ],
        inspiring: [
            '每一個關於{topic}的小進步，都是邁向成功的一大步。\n\n不要害怕開始，害怕的應該是從未開始。',
            '相信自己能夠掌握{topic}。\n\n成功不是終點，失敗也不是終結。重要的是繼續前進的勇氣。'
        ],
        promotional: [
            '限時優惠！{topic}特惠活動進行中！\n\n把握機會，讓{topic}為你的生活帶來改變！詳情請私訊了解更多。',
            '你還在等什麼？{topic}限量開放中！\n\n已有超過1000人體驗{topic}的美好，現在輪到你了！'
        ]
    },
    'en': {
        professional: [
            'Sharing professional insights about {topic}...\n\nIn today\'s competitive landscape, {topic} has become essential. Let\'s explore how to effectively leverage {topic} to add value.',
            'Deep diving into the importance of {topic}...\n\nRecent studies show companies mastering {topic} see 30% efficiency gains. Are you ready for this change?'
        ],
        casual: [
            'Been exploring {topic} lately and it\'s fascinating!\n\nHave you tried it? Drop your experience in the comments~',
            'Let\'s talk about {topic} today!\n\nHonestly, since I started with {topic}, things have changed so much~'
        ],
        humorous: [
            'When you think you understand {topic}, then find there\'s more...\n\nLife is a never-ending lesson!',
            '{topic} daily life:\nMonday: This is easy\nFriday: What am I even doing'
        ],
        inspiring: [
            'Every small progress in {topic} is a big step towards success.\n\nDon\'t fear starting. Fear never starting at all.',
            'Believe you can master {topic}.\n\nSuccess is not final, failure is not fatal. What counts is the courage to continue.'
        ],
        promotional: [
            'Limited offer! Special {topic} promotion now!\n\nSeize the opportunity and let {topic} transform your life! DM for details.',
            'What are you waiting for? {topic} limited availability!\n\nOver 1000 people have experienced {topic}. Now it\'s your turn!'
        ]
    }
};

const hashtags = {
    'zh-TW': ['分享', '推薦', '必看', '生活', '成長', '學習', '日常', '心得'],
    'en': ['share', 'recommended', 'mustsee', 'life', 'growth', 'learning', 'daily', 'thoughts']
};

function generatePost(topic, platform, tone, includeHashtags) {
    const templates = postTemplates[currentLang][tone];
    let post = templates[Math.floor(Math.random() * templates.length)].replace(/{topic}/g, topic);

    if (includeHashtags) {
        const tags = hashtags[currentLang];
        const selectedTags = [];
        for (let i = 0; i < 5; i++) {
            const tag = tags[Math.floor(Math.random() * tags.length)];
            if (!selectedTags.includes(tag)) selectedTags.push(tag);
        }
        selectedTags.push(topic.replace(/\s/g, ''));
        post += '\n\n' + selectedTags.map(t => `#${t}`).join(' ');
    }

    const limit = platformLimits[platform];
    if (post.length > limit) {
        post = post.substring(0, limit - 3) + '...';
    }

    return post;
}

function init() {
    setLanguage(navigator.language.startsWith('zh') ? 'zh-TW' : 'en');

    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    document.querySelectorAll('.platform-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.platform-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentPlatform = btn.dataset.platform;
        });
    });

    const generate = () => {
        const topic = document.getElementById('topicInput').value.trim();
        const tone = document.getElementById('toneSelect').value;
        const includeHashtags = document.getElementById('hashtagToggle').checked;

        if (!topic) {
            alert(t('errorNoTopic'));
            return;
        }

        const post = generatePost(topic, currentPlatform, tone, includeHashtags);
        document.getElementById('outputContent').textContent = post;
        document.getElementById('charCount').textContent = `${post.length} / ${platformLimits[currentPlatform]} ${t('charLimit')}`;
        document.getElementById('outputSection').style.display = 'block';
    };

    document.getElementById('generateBtn').addEventListener('click', generate);
    document.getElementById('regenerateBtn').addEventListener('click', generate);

    document.getElementById('copyBtn').addEventListener('click', () => {
        const text = document.getElementById('outputContent').textContent;
        navigator.clipboard.writeText(text).then(() => {
            const btn = document.getElementById('copyBtn');
            btn.textContent = t('copied');
            setTimeout(() => btn.textContent = '複製', 2000);
        });
    });
}

init();
