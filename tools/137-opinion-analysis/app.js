/**
 * Opinion Analysis - Tool #137
 * Analyze opinions and viewpoints in text
 */

let currentLang = 'zh-TW';

const i18n = {
    'zh-TW': {
        title: '觀點分析',
        subtitle: '分析文字中的觀點與立場',
        inputLabel: '輸入文字',
        placeholder: '輸入要分析觀點的文字...',
        analyzeBtn: '分析觀點',
        result: '分析結果',
        opinions: '識別的觀點',
        aspects: '面向分析',
        highlighted: '標記文本',
        positive: '正面',
        negative: '負面',
        neutral: '中性',
        positiveOp: '正面觀點',
        negativeOp: '負面觀點',
        totalOp: '總觀點數',
        aspect: '面向',
        confidence: '信心度'
    },
    'en': {
        title: 'Opinion Analysis',
        subtitle: 'Analyze opinions and viewpoints in text',
        inputLabel: 'Enter text',
        placeholder: 'Enter text to analyze opinions...',
        analyzeBtn: 'Analyze Opinions',
        result: 'Analysis Result',
        opinions: 'Identified Opinions',
        aspects: 'Aspect Analysis',
        highlighted: 'Highlighted Text',
        positive: 'Positive',
        negative: 'Negative',
        neutral: 'Neutral',
        positiveOp: 'Positive Opinions',
        negativeOp: 'Negative Opinions',
        totalOp: 'Total Opinions',
        aspect: 'Aspect',
        confidence: 'Confidence'
    }
};

// Opinion markers
const opinionMarkers = {
    zh: {
        subjective: ['我認為', '我覺得', '我想', '我個人', '依我看', '在我看來', '以我的觀點', '我的意見', '應該', '可能', '也許', '似乎', '看起來', '感覺', '希望', '相信', '推測'],
        positive: ['好', '棒', '讚', '優秀', '出色', '精彩', '美味', '舒適', '值得', '推薦', '滿意', '喜歡', '開心', '完美', '驚艷', '很棒', '不錯', '優質', '高品質', '划算', '合理'],
        negative: ['差', '糟', '爛', '失望', '不滿', '可惜', '遺憾', '不好', '太貴', '偏高', '卡頓', '問題', '缺點', '不足', '麻煩', '難用', '討厭', '不推薦', '浪費', '後悔']
    },
    en: {
        subjective: ['I think', 'I believe', 'I feel', 'In my opinion', 'I would say', 'personally', 'seems', 'appears', 'probably', 'might', 'could be', 'should', 'would recommend', 'I find'],
        positive: ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'superb', 'perfect', 'stunning', 'beautiful', 'recommend', 'love', 'enjoy', 'best', 'outstanding', 'incredible'],
        negative: ['bad', 'poor', 'terrible', 'awful', 'disappointing', 'predictable', 'boring', 'worst', 'hate', 'dislike', 'overpriced', 'waste', 'regret', 'unfortunately', 'problem']
    }
};

// Aspect categories
const aspectCategories = {
    zh: {
        '品質': ['品質', '質量', '效果', '性能', '表現'],
        '價格': ['價格', '價位', '價錢', '費用', '划算', '便宜', '貴'],
        '服務': ['服務', '態度', '人員', '客服'],
        '外觀': ['外觀', '設計', '顏色', '螢幕', '顯示'],
        '體驗': ['體驗', '使用', '操作', '感覺', '感受'],
        '功能': ['功能', '拍照', '電池', '續航', '系統']
    },
    en: {
        'Quality': ['quality', 'performance', 'effect', 'result'],
        'Price': ['price', 'cost', 'value', 'expensive', 'cheap', 'affordable'],
        'Service': ['service', 'staff', 'support', 'customer'],
        'Design': ['design', 'look', 'appearance', 'visual', 'screen'],
        'Experience': ['experience', 'feel', 'use', 'easy', 'comfortable'],
        'Features': ['feature', 'function', 'battery', 'camera', 'system']
    }
};

function t(key) {
    return i18n[currentLang][key] || key;
}

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`lang-${lang === 'zh-TW' ? 'zh' : 'en'}`).classList.add('active');
}

function detectLanguage(text) {
    return /[\u4e00-\u9fff]/.test(text) ? 'zh' : 'en';
}

function splitSentences(text, lang) {
    if (lang === 'zh') {
        return text.split(/[。！？，；]/).filter(s => s.trim().length > 2);
    } else {
        return text.split(/[.!?,;]/).filter(s => s.trim().length > 2);
    }
}

function analyzeOpinion(sentence, lang) {
    const markers = opinionMarkers[lang];
    const lower = sentence.toLowerCase();

    // Check if sentence is subjective
    const isSubjective = markers.subjective.some(m => lower.includes(m.toLowerCase()));

    // Count sentiment words
    let positiveCount = 0;
    let negativeCount = 0;
    const positiveWords = [];
    const negativeWords = [];

    markers.positive.forEach(word => {
        if (lower.includes(word.toLowerCase())) {
            positiveCount++;
            positiveWords.push(word);
        }
    });

    markers.negative.forEach(word => {
        if (lower.includes(word.toLowerCase())) {
            negativeCount++;
            negativeWords.push(word);
        }
    });

    // Determine sentiment
    let sentiment = 'neutral';
    if (positiveCount > negativeCount) sentiment = 'positive';
    else if (negativeCount > positiveCount) sentiment = 'negative';

    // Check for negation (simple)
    const negations = lang === 'zh' ? ['不', '沒', '無', '非'] : ['not', "n't", 'no', 'never'];
    const hasNegation = negations.some(n => lower.includes(n));
    if (hasNegation && (positiveCount > 0 || negativeCount > 0)) {
        sentiment = sentiment === 'positive' ? 'negative' : (sentiment === 'negative' ? 'positive' : 'neutral');
    }

    const isOpinion = isSubjective || positiveCount > 0 || negativeCount > 0;

    return {
        text: sentence.trim(),
        isOpinion,
        sentiment,
        positiveWords,
        negativeWords,
        confidence: Math.min((positiveCount + negativeCount + (isSubjective ? 1 : 0)) * 20, 100)
    };
}

function extractAspects(text, lang) {
    const categories = aspectCategories[lang];
    const aspects = [];

    Object.entries(categories).forEach(([aspect, keywords]) => {
        const matches = keywords.filter(kw => text.toLowerCase().includes(kw.toLowerCase()));
        if (matches.length > 0) {
            // Determine sentiment for this aspect
            const contextStart = Math.max(0, text.toLowerCase().indexOf(matches[0].toLowerCase()) - 30);
            const contextEnd = Math.min(text.length, contextStart + 80);
            const context = text.slice(contextStart, contextEnd);

            const analysis = analyzeOpinion(context, lang);

            aspects.push({
                name: aspect,
                keywords: matches,
                sentiment: analysis.sentiment
            });
        }
    });

    return aspects;
}

function highlightText(text, opinions, lang) {
    let result = text;
    const markers = opinionMarkers[lang];

    // Highlight positive words
    markers.positive.forEach(word => {
        const regex = new RegExp(`(${word})`, 'gi');
        result = result.replace(regex, '<span class="highlight-positive">$1</span>');
    });

    // Highlight negative words
    markers.negative.forEach(word => {
        const regex = new RegExp(`(${word})`, 'gi');
        result = result.replace(regex, '<span class="highlight-negative">$1</span>');
    });

    // Highlight subjective markers
    markers.subjective.forEach(marker => {
        const regex = new RegExp(`(${marker})`, 'gi');
        result = result.replace(regex, '<span class="highlight-opinion">$1</span>');
    });

    return result;
}

function analyzeText(text) {
    const lang = detectLanguage(text);
    const sentences = splitSentences(text, lang);

    const opinions = sentences.map(s => analyzeOpinion(s, lang)).filter(o => o.isOpinion);
    const aspects = extractAspects(text, lang);

    const positiveCount = opinions.filter(o => o.sentiment === 'positive').length;
    const negativeCount = opinions.filter(o => o.sentiment === 'negative').length;

    return {
        opinions,
        aspects,
        summary: {
            total: opinions.length,
            positive: positiveCount,
            negative: negativeCount,
            neutral: opinions.length - positiveCount - negativeCount
        },
        highlightedText: highlightText(text, opinions, lang),
        lang
    };
}

function displayResults(result) {
    document.getElementById('resultSection').style.display = 'block';

    // Summary cards
    document.getElementById('summaryCards').innerHTML = `
        <div class="summary-card">
            <div class="summary-value positive">${result.summary.positive}</div>
            <div class="summary-label">${t('positiveOp')}</div>
        </div>
        <div class="summary-card">
            <div class="summary-value negative">${result.summary.negative}</div>
            <div class="summary-label">${t('negativeOp')}</div>
        </div>
        <div class="summary-card">
            <div class="summary-value neutral">${result.summary.total}</div>
            <div class="summary-label">${t('totalOp')}</div>
        </div>
    `;

    // Opinions list
    const opinionsHTML = result.opinions.map(op => `
        <div class="opinion-item ${op.sentiment}">
            <div class="opinion-text">${op.text}</div>
            <div class="opinion-meta">
                <span class="opinion-sentiment ${op.sentiment}">${t(op.sentiment)}</span>
                <span>${t('confidence')}: ${op.confidence}%</span>
            </div>
        </div>
    `).join('');
    document.getElementById('opinionsList').innerHTML = opinionsHTML || `<p style="color: var(--text-secondary)">未識別到明確觀點</p>`;

    // Aspects
    const aspectsHTML = result.aspects.map(asp => `
        <div class="aspect-card">
            <div class="aspect-name">
                <span class="aspect-sentiment ${asp.sentiment}"></span>
                ${asp.name}
            </div>
            <div class="aspect-keywords">
                ${asp.keywords.map(kw => `<span class="aspect-keyword">${kw}</span>`).join('')}
            </div>
        </div>
    `).join('');
    document.getElementById('aspectsGrid').innerHTML = aspectsHTML || `<p style="color: var(--text-secondary)">未識別到特定面向</p>`;

    // Highlighted text
    document.getElementById('highlightedText').innerHTML = result.highlightedText;
}

function init() {
    setLanguage(navigator.language.startsWith('zh') ? 'zh-TW' : 'en');

    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    document.getElementById('analyzeBtn').addEventListener('click', () => {
        const text = document.getElementById('textInput').value.trim();
        if (!text) return;

        const result = analyzeText(text);
        displayResults(result);
    });

    document.querySelectorAll('.example-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('textInput').value = btn.dataset.text;
            document.getElementById('analyzeBtn').click();
        });
    });
}

init();
