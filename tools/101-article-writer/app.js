/**
 * Article Writer - Tool #101
 * Awesome AI Local Tools
 *
 * Local article generation with customizable styles
 */

// ========================================
// Internationalization (i18n)
// ========================================

const translations = {
    'zh-TW': {
        title: 'AI 文章撰寫',
        subtitle: '智能文章生成，本地處理保護隱私',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        topicLabel: '文章主題',
        topicPlaceholder: '輸入您想撰寫的主題...',
        styleLabel: '文章風格',
        styleFormal: '正式',
        styleCasual: '輕鬆',
        styleProfessional: '專業',
        styleCreative: '創意',
        styleAcademic: '學術',
        lengthLabel: '文章長度',
        lengthShort: '短篇 (300字)',
        lengthMedium: '中篇 (600字)',
        lengthLong: '長篇 (1000字)',
        keywordsLabel: '關鍵字 (選填)',
        keywordsPlaceholder: '用逗號分隔關鍵字...',
        outlineLabel: '大綱要點 (選填)',
        outlinePlaceholder: '每行一個要點...',
        generateBtn: '生成文章',
        generating: '生成中...',
        outputTitle: '生成結果',
        copyBtn: '複製',
        downloadBtn: '下載',
        copied: '已複製！',
        charCount: '字數',
        wordCount: '詞數',
        readTime: '閱讀時間',
        minutes: '分鐘',
        howItWorks: '功能特色',
        feature1: '多種風格',
        feature1Desc: '支援正式、輕鬆、專業等多種寫作風格',
        feature2: '關鍵字優化',
        feature2Desc: '可指定關鍵字，優化SEO效果',
        feature3: '隱私保護',
        feature3Desc: '所有處理在瀏覽器本地完成',
        feature4: '即時生成',
        feature4Desc: '快速生成高品質文章內容',
        backToHome: '返回首頁',
        toolNumber: '工具 #101',
        copyright: 'Awesome AI Local Tools © 2024',
        errorNoTopic: '請輸入文章主題'
    },
    'en': {
        title: 'Article Writer',
        subtitle: 'AI-powered article generation, processed locally',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        topicLabel: 'Article Topic',
        topicPlaceholder: 'Enter your topic...',
        styleLabel: 'Writing Style',
        styleFormal: 'Formal',
        styleCasual: 'Casual',
        styleProfessional: 'Professional',
        styleCreative: 'Creative',
        styleAcademic: 'Academic',
        lengthLabel: 'Article Length',
        lengthShort: 'Short (300 words)',
        lengthMedium: 'Medium (600 words)',
        lengthLong: 'Long (1000 words)',
        keywordsLabel: 'Keywords (optional)',
        keywordsPlaceholder: 'Separate keywords with commas...',
        outlineLabel: 'Outline Points (optional)',
        outlinePlaceholder: 'One point per line...',
        generateBtn: 'Generate Article',
        generating: 'Generating...',
        outputTitle: 'Generated Result',
        copyBtn: 'Copy',
        downloadBtn: 'Download',
        copied: 'Copied!',
        charCount: 'Characters',
        wordCount: 'Words',
        readTime: 'Read Time',
        minutes: 'min',
        howItWorks: 'Features',
        feature1: 'Multiple Styles',
        feature1Desc: 'Support formal, casual, professional and more styles',
        feature2: 'Keyword Optimization',
        feature2Desc: 'Specify keywords for SEO optimization',
        feature3: 'Privacy Protected',
        feature3Desc: 'All processing done locally in browser',
        feature4: 'Instant Generation',
        feature4Desc: 'Quickly generate high-quality content',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #101',
        copyright: 'Awesome AI Local Tools © 2024',
        errorNoTopic: 'Please enter an article topic'
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

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`lang-${lang === 'zh-TW' ? 'zh' : 'en'}`).classList.add('active');
    document.documentElement.lang = lang === 'zh-TW' ? 'zh-TW' : 'en';
}

function t(key) {
    return translations[currentLang][key] || key;
}

// ========================================
// Article Templates
// ========================================

const articleTemplates = {
    'zh-TW': {
        formal: {
            intro: ['本文旨在探討', '隨著社會的發展，', '在當今時代，', '眾所周知，'],
            body: ['首先，', '其次，', '此外，', '值得注意的是，', '從另一個角度來看，'],
            conclusion: ['綜上所述，', '總而言之，', '由此可見，', '展望未來，']
        },
        casual: {
            intro: ['說到', '你知道嗎？', '最近大家都在討論', '今天想跟大家聊聊'],
            body: ['說實話，', '有趣的是，', '不過呢，', '其實，', '我覺得，'],
            conclusion: ['所以啊，', '總之呢，', '希望這篇文章對你有幫助！', '下次見囉！']
        },
        professional: {
            intro: ['根據最新研究顯示，', '在業界中，', '從專業角度分析，', '數據表明，'],
            body: ['研究指出，', '實務經驗顯示，', '具體而言，', '進一步分析，', '關鍵因素包括，'],
            conclusion: ['基於以上分析，', '我們建議，', '未來發展趨勢將，', '持續關注此議題將有助於，']
        },
        creative: {
            intro: ['想像一下，', '讓我們開始一段旅程，', '在某個平行宇宙中，', '故事要從這裡說起，'],
            body: ['突然間，', '令人驚喜的是，', '這時候，', '轉折發生了，', '與此同時，'],
            conclusion: ['最後，', '故事的結局是，', '這告訴我們，', '也許，這就是答案。']
        },
        academic: {
            intro: ['本研究旨在探討', '學術界對此議題', '根據文獻回顧，', '本文採用'],
            body: ['研究方法包括', '數據分析顯示', '理論框架指出', '實證結果表明', '比較分析發現'],
            conclusion: ['研究結論顯示', '本研究的貢獻在於', '未來研究方向', '研究限制與建議']
        }
    },
    'en': {
        formal: {
            intro: ['This article aims to explore', 'With the development of society,', 'In today\'s era,', 'As is well known,'],
            body: ['Firstly,', 'Secondly,', 'Furthermore,', 'It is worth noting that,', 'From another perspective,'],
            conclusion: ['In summary,', 'In conclusion,', 'It is evident that,', 'Looking ahead,']
        },
        casual: {
            intro: ['Speaking of', 'Did you know?', 'Everyone\'s been talking about', 'Today I want to chat about'],
            body: ['Honestly,', 'Interestingly,', 'However,', 'Actually,', 'I think,'],
            conclusion: ['So,', 'Anyway,', 'Hope this helps!', 'See you next time!']
        },
        professional: {
            intro: ['According to recent research,', 'In the industry,', 'From a professional perspective,', 'Data indicates,'],
            body: ['Studies show,', 'Practical experience demonstrates,', 'Specifically,', 'Further analysis reveals,', 'Key factors include,'],
            conclusion: ['Based on the above analysis,', 'We recommend,', 'Future trends will,', 'Continued focus on this topic will help,']
        },
        creative: {
            intro: ['Imagine,', 'Let\'s begin a journey,', 'In a parallel universe,', 'The story begins here,'],
            body: ['Suddenly,', 'Surprisingly,', 'At this moment,', 'A twist occurred,', 'Meanwhile,'],
            conclusion: ['Finally,', 'The story ends with,', 'This teaches us,', 'Perhaps, this is the answer.']
        },
        academic: {
            intro: ['This study aims to investigate', 'Academic discourse on this topic', 'According to literature review,', 'This paper employs'],
            body: ['Research methods include', 'Data analysis shows', 'Theoretical framework suggests', 'Empirical results indicate', 'Comparative analysis reveals'],
            conclusion: ['Research findings demonstrate', 'This study contributes to', 'Future research directions', 'Limitations and recommendations']
        }
    }
};

// ========================================
// Article Generation
// ========================================

function generateArticle(topic, style, length, keywords, outline) {
    const templates = articleTemplates[currentLang][style];
    const targetLength = length === 'short' ? 300 : length === 'medium' ? 600 : 1000;

    let article = '';
    const paragraphs = [];

    // Generate title
    const title = generateTitle(topic, style);
    article += title + '\n\n';

    // Generate introduction
    const intro = generateParagraph(templates.intro, topic, keywords, targetLength * 0.2);
    paragraphs.push(intro);

    // Generate body paragraphs based on outline or auto-generate
    const bodyPoints = outline ? outline.split('\n').filter(p => p.trim()) : generateAutoOutline(topic, style);
    const bodyLength = targetLength * 0.6 / bodyPoints.length;

    bodyPoints.forEach((point, index) => {
        const connector = templates.body[index % templates.body.length];
        const para = generateParagraph([connector], point.trim(), keywords, bodyLength);
        paragraphs.push(para);
    });

    // Generate conclusion
    const conclusion = generateParagraph(templates.conclusion, topic, keywords, targetLength * 0.2);
    paragraphs.push(conclusion);

    article += paragraphs.join('\n\n');

    return article;
}

function generateTitle(topic, style) {
    const titlePrefixes = {
        'zh-TW': {
            formal: ['論', '淺談', '關於', '探討'],
            casual: ['聊聊', '說說', '關於', ''],
            professional: ['深度解析：', '專業觀點：', '', '全面了解'],
            creative: ['', '奇妙的', '探索', '發現'],
            academic: ['研究：', '論', '探討', '分析']
        },
        'en': {
            formal: ['On ', 'Regarding ', 'About ', 'Exploring '],
            casual: ['Let\'s Talk About ', 'About ', '', 'My Thoughts on '],
            professional: ['Deep Dive: ', 'Professional Insights: ', '', 'Understanding '],
            creative: ['', 'The Amazing ', 'Discovering ', 'Exploring '],
            academic: ['Study: ', 'On ', 'Analysis of ', 'Research: ']
        }
    };

    const prefix = titlePrefixes[currentLang][style][Math.floor(Math.random() * titlePrefixes[currentLang][style].length)];
    return prefix + topic;
}

function generateAutoOutline(topic, style) {
    const outlines = {
        'zh-TW': [
            `${topic}的定義與背景`,
            `${topic}的重要性`,
            `${topic}的應用與實踐`,
            `${topic}的挑戰與機遇`
        ],
        'en': [
            `Definition and background of ${topic}`,
            `Importance of ${topic}`,
            `Applications and practices of ${topic}`,
            `Challenges and opportunities of ${topic}`
        ]
    };

    return outlines[currentLang];
}

function generateParagraph(starters, topic, keywords, targetLength) {
    const starter = starters[Math.floor(Math.random() * starters.length)];

    // Generate content based on topic and keywords
    const sentences = generateSentences(topic, keywords, targetLength);

    return starter + sentences;
}

function generateSentences(topic, keywords, targetLength) {
    const keywordList = keywords ? keywords.split(',').map(k => k.trim()).filter(k => k) : [];

    const sentenceTemplates = {
        'zh-TW': [
            `${topic}是一個值得深入探討的議題。`,
            `這個概念在現代社會中扮演著重要角色。`,
            `許多專家對此提出了不同的見解。`,
            `從實際應用的角度來看，這具有重要意義。`,
            `人們對此的理解正在不斷深化。`,
            `這不僅影響著個人，也影響著整個社會。`,
            `隨著時代的發展，這個議題變得越來越重要。`,
            `我們需要從多個角度來審視這個問題。`,
            `實踐證明，正確的方法能帶來顯著的效果。`,
            `這個領域的發展前景非常廣闘。`
        ],
        'en': [
            `${topic} is a topic worthy of in-depth exploration.`,
            `This concept plays an important role in modern society.`,
            `Many experts have offered different perspectives on this.`,
            `From a practical standpoint, this holds significant importance.`,
            `People's understanding of this is constantly deepening.`,
            `This affects not only individuals but also society as a whole.`,
            `With the development of the times, this topic becomes increasingly important.`,
            `We need to examine this issue from multiple angles.`,
            `Practice has proven that the right approach can yield significant results.`,
            `The development prospects in this field are very broad.`
        ]
    };

    const templates = sentenceTemplates[currentLang];
    let result = '';
    let currentLength = 0;

    // Shuffle templates
    const shuffled = [...templates].sort(() => Math.random() - 0.5);

    for (const sentence of shuffled) {
        if (currentLength >= targetLength) break;
        result += sentence + ' ';
        currentLength += sentence.length;
    }

    // Insert keywords naturally
    if (keywordList.length > 0) {
        keywordList.forEach(keyword => {
            if (!result.includes(keyword)) {
                const insertSentence = currentLang === 'zh-TW'
                    ? `${keyword}在這個過程中起著關鍵作用。`
                    : `${keyword} plays a key role in this process.`;
                result += insertSentence + ' ';
            }
        });
    }

    return result.trim();
}

// ========================================
// UI Functions
// ========================================

function updateStats(text) {
    const charCount = text.length;
    const wordCount = currentLang === 'zh-TW'
        ? text.replace(/\s/g, '').length
        : text.split(/\s+/).filter(w => w).length;
    const readTime = Math.ceil(wordCount / (currentLang === 'zh-TW' ? 400 : 200));

    document.getElementById('outputStats').innerHTML = `
        <span>${t('charCount')}: ${charCount}</span>
        <span>${t('wordCount')}: ${wordCount}</span>
        <span>${t('readTime')}: ${readTime} ${t('minutes')}</span>
    `;
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        const copyBtn = document.getElementById('copyBtn');
        const originalText = copyBtn.textContent;
        copyBtn.textContent = t('copied');
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    });
}

function downloadArticle(text, topic) {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${topic.substring(0, 20)}-article.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

// ========================================
// Event Handlers
// ========================================

function initEventListeners() {
    // Language switcher
    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    // Generate button
    document.getElementById('generateBtn').addEventListener('click', () => {
        const topic = document.getElementById('topicInput').value.trim();
        const style = document.getElementById('styleSelect').value;
        const length = document.getElementById('lengthSelect').value;
        const keywords = document.getElementById('keywordsInput').value.trim();
        const outline = document.getElementById('outlineInput').value.trim();

        if (!topic) {
            alert(t('errorNoTopic'));
            return;
        }

        const btn = document.getElementById('generateBtn');
        btn.disabled = true;
        btn.querySelector('span').textContent = t('generating');

        // Simulate processing delay
        setTimeout(() => {
            const article = generateArticle(topic, style, length, keywords, outline);

            document.getElementById('outputContent').textContent = article;
            document.getElementById('outputSection').style.display = 'block';
            updateStats(article);

            btn.disabled = false;
            btn.querySelector('span').textContent = t('generateBtn');

            // Scroll to output
            document.getElementById('outputSection').scrollIntoView({ behavior: 'smooth' });
        }, 800);
    });

    // Copy button
    document.getElementById('copyBtn').addEventListener('click', () => {
        const text = document.getElementById('outputContent').textContent;
        copyToClipboard(text);
    });

    // Download button
    document.getElementById('downloadBtn').addEventListener('click', () => {
        const text = document.getElementById('outputContent').textContent;
        const topic = document.getElementById('topicInput').value.trim();
        downloadArticle(text, topic);
    });
}

// ========================================
// Initialization
// ========================================

function init() {
    const browserLang = navigator.language;
    if (browserLang.startsWith('zh')) {
        setLanguage('zh-TW');
    } else {
        setLanguage('en');
    }

    initEventListeners();
    console.log('Article Writer initialized');
}

init();
