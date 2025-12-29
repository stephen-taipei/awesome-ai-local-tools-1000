/**
 * Title Generator - Tool #103
 */

const translations = {
    'zh-TW': {
        title: 'AI 標題生成',
        subtitle: '生成吸引人的標題，提升點擊率',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        topicLabel: '主題內容',
        topicPlaceholder: '輸入您的文章主題或內容概要...',
        typeLabel: '標題類型',
        typeBlog: '部落格',
        typeNews: '新聞',
        typeMarketing: '行銷',
        typeYoutube: 'YouTube',
        typeAcademic: '學術',
        countLabel: '生成數量',
        generateBtn: '生成標題',
        generating: '生成中...',
        outputTitle: '生成的標題',
        copyBtn: '複製',
        copied: '已複製',
        howItWorks: '功能特色',
        feature1: '多種類型',
        feature1Desc: '支援部落格、新聞、行銷等多種標題類型',
        feature2: '提升點擊',
        feature2Desc: '生成吸引人的標題，提高點擊率',
        feature3: '隱私保護',
        feature3Desc: '所有處理在瀏覽器本地完成',
        feature4: '批量生成',
        feature4Desc: '一次生成多個標題供選擇',
        backToHome: '返回首頁',
        toolNumber: '工具 #103',
        copyright: 'Awesome AI Local Tools © 2024',
        errorNoTopic: '請輸入主題內容'
    },
    'en': {
        title: 'Title Generator',
        subtitle: 'Generate catchy titles to boost clicks',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        topicLabel: 'Topic Content',
        topicPlaceholder: 'Enter your article topic or summary...',
        typeLabel: 'Title Type',
        typeBlog: 'Blog',
        typeNews: 'News',
        typeMarketing: 'Marketing',
        typeYoutube: 'YouTube',
        typeAcademic: 'Academic',
        countLabel: 'Count',
        generateBtn: 'Generate Titles',
        generating: 'Generating...',
        outputTitle: 'Generated Titles',
        copyBtn: 'Copy',
        copied: 'Copied',
        howItWorks: 'Features',
        feature1: 'Multiple Types',
        feature1Desc: 'Support blog, news, marketing and more',
        feature2: 'Boost Clicks',
        feature2Desc: 'Generate catchy titles to increase CTR',
        feature3: 'Privacy Protected',
        feature3Desc: 'All processing done locally',
        feature4: 'Batch Generation',
        feature4Desc: 'Generate multiple titles at once',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #103',
        copyright: 'Awesome AI Local Tools © 2024',
        errorNoTopic: 'Please enter topic content'
    }
};

let currentLang = 'zh-TW';

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

const titlePatterns = {
    'zh-TW': {
        blog: [
            '關於{topic}，你必須知道的{n}件事',
            '{topic}完整指南：從入門到精通',
            '為什麼{topic}如此重要？專家這樣說',
            '{topic}的{n}個秘訣，讓你脫穎而出',
            '深度解析：{topic}的未來趨勢',
            '{year}年最完整的{topic}攻略',
            '{topic}入門教學：新手必讀',
            '如何掌握{topic}？{n}個實用技巧',
            '{topic}常見問題全解答',
            '專家推薦：{topic}最佳實踐'
        ],
        news: [
            '快訊：{topic}最新發展動態',
            '{topic}重大突破！業界反應熱烈',
            '獨家：{topic}內幕消息曝光',
            '{topic}引發關注，專家解讀',
            '最新報告：{topic}市場分析',
            '{topic}政策更新，影響深遠'
        ],
        marketing: [
            '限時優惠！{topic}省下{n}%',
            '{topic}讓你的業績翻倍成長',
            '為什麼頂尖企業都選擇{topic}',
            '{topic}：改變遊戲規則的解決方案',
            '別錯過！{topic}限量搶購中',
            '{topic}助你領先競爭對手'
        ],
        youtube: [
            '{topic}挑戰！結果讓人驚訝',
            '我試了{topic}，這是我的真實感受',
            '{topic}開箱評測｜值得買嗎？',
            '{n}分鐘學會{topic}',
            '{topic}Vlog｜完整紀錄',
            '你不知道的{topic}冷知識'
        ],
        academic: [
            '{topic}之研究：方法與發現',
            '論{topic}的理論架構',
            '{topic}：文獻回顧與分析',
            '{topic}實證研究',
            '探討{topic}的發展與挑戰'
        ]
    },
    'en': {
        blog: [
            '{n} Things You Must Know About {topic}',
            'The Complete Guide to {topic}',
            'Why {topic} Matters: Expert Insights',
            '{n} {topic} Tips to Stand Out',
            'Deep Dive: The Future of {topic}',
            'The Ultimate {year} {topic} Guide',
            '{topic} 101: A Beginner\'s Guide',
            'How to Master {topic}: {n} Tips',
            '{topic} FAQ: All Questions Answered',
            'Expert Picks: Best {topic} Practices'
        ],
        news: [
            'Breaking: Latest {topic} Developments',
            'Major {topic} Breakthrough Announced',
            'Exclusive: {topic} Insider Report',
            '{topic} Sparks Attention, Experts Weigh In',
            'New Report: {topic} Market Analysis',
            '{topic} Policy Update: Major Impact'
        ],
        marketing: [
            'Limited Time: Save {n}% on {topic}',
            'Double Your Results with {topic}',
            'Why Top Companies Choose {topic}',
            '{topic}: The Game-Changing Solution',
            'Don\'t Miss Out: {topic} Sale',
            '{topic}: Stay Ahead of Competition'
        ],
        youtube: [
            '{topic} Challenge! Shocking Results',
            'I Tried {topic}: My Honest Review',
            '{topic} Unboxing Review | Worth It?',
            'Learn {topic} in {n} Minutes',
            '{topic} Vlog | Full Documentary',
            '{topic} Facts You Didn\'t Know'
        ],
        academic: [
            'A Study of {topic}: Methods and Findings',
            'On the Theoretical Framework of {topic}',
            '{topic}: Literature Review and Analysis',
            'Empirical Research on {topic}',
            'Exploring {topic}: Development and Challenges'
        ]
    }
};

function generateTitles(topic, type, count) {
    const patterns = titlePatterns[currentLang][type];
    const titles = [];
    const year = new Date().getFullYear();

    for (let i = 0; i < count; i++) {
        let pattern = patterns[i % patterns.length];
        const n = Math.floor(Math.random() * 8) + 3;
        let title = pattern
            .replace('{topic}', topic)
            .replace('{n}', n)
            .replace('{year}', year);
        titles.push(title);
    }

    return [...new Set(titles)].slice(0, count);
}

function init() {
    const browserLang = navigator.language;
    setLanguage(browserLang.startsWith('zh') ? 'zh-TW' : 'en');

    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    document.getElementById('generateBtn').addEventListener('click', () => {
        const topic = document.getElementById('topicInput').value.trim();
        const type = document.getElementById('typeSelect').value;
        const count = parseInt(document.getElementById('countSelect').value);

        if (!topic) {
            alert(t('errorNoTopic'));
            return;
        }

        const btn = document.getElementById('generateBtn');
        btn.disabled = true;
        btn.querySelector('span').textContent = t('generating');

        setTimeout(() => {
            const titles = generateTitles(topic, type, count);
            const listEl = document.getElementById('titlesList');
            listEl.innerHTML = titles.map((title, i) => `
                <div class="title-item">
                    <span class="title-number">${i + 1}</span>
                    <span class="title-text">${title}</span>
                    <button class="title-copy" data-title="${title}">${t('copyBtn')}</button>
                </div>
            `).join('');

            document.getElementById('outputSection').style.display = 'block';
            btn.disabled = false;
            btn.querySelector('span').textContent = t('generateBtn');

            listEl.querySelectorAll('.title-copy').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const title = e.target.dataset.title;
                    navigator.clipboard.writeText(title).then(() => {
                        e.target.textContent = t('copied');
                        setTimeout(() => e.target.textContent = t('copyBtn'), 2000);
                    });
                });
            });
        }, 600);
    });
}

init();
