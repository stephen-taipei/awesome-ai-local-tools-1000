/**
 * Sentiment Analysis - Tool #131
 * Analyze text sentiment (positive/neutral/negative)
 */

let currentLang = 'zh-TW';

const i18n = {
    'zh-TW': {
        title: '情感分析器',
        subtitle: '分析文字的情感傾向',
        inputLabel: '輸入文字',
        placeholder: '輸入要分析的文字...',
        analyzeBtn: '分析情感',
        result: '分析結果',
        positive: '正面',
        neutral: '中性',
        negative: '負面',
        keywords: '情感關鍵詞',
        examples: '試試這些範例',
        positiveEx: '正面範例',
        neutralEx: '中性範例',
        negativeEx: '負面範例'
    },
    'en': {
        title: 'Sentiment Analysis',
        subtitle: 'Analyze text sentiment',
        inputLabel: 'Enter text',
        placeholder: 'Enter text to analyze...',
        analyzeBtn: 'Analyze Sentiment',
        result: 'Analysis Result',
        positive: 'Positive',
        neutral: 'Neutral',
        negative: 'Negative',
        keywords: 'Sentiment Keywords',
        examples: 'Try these examples',
        positiveEx: 'Positive example',
        neutralEx: 'Neutral example',
        negativeEx: 'Negative example'
    }
};

// Sentiment lexicons
const sentimentLexicon = {
    zh: {
        positive: ['好', '棒', '讚', '優秀', '開心', '快樂', '愉快', '滿意', '喜歡', '愛', '美好', '精彩', '完美', '優質', '舒服', '方便', '推薦', '感謝', '幸福', '成功', '傑出', '真好', '超棒', '不錯'],
        negative: ['差', '爛', '糟', '失望', '難過', '生氣', '討厭', '痛苦', '煩', '壞', '糟糕', '可惜', '遺憾', '不好', '可怕', '恐怖', '噁心', '無聊', '浪費', '後悔', '慘', '太差', '很爛', '不滿']
    },
    en: {
        positive: ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'happy', 'pleased', 'satisfied', 'recommend', 'best', 'perfect', 'awesome', 'beautiful', 'enjoy', 'like', 'nice', 'brilliant'],
        negative: ['bad', 'terrible', 'horrible', 'awful', 'hate', 'disappointed', 'angry', 'sad', 'poor', 'worst', 'waste', 'boring', 'annoying', 'frustrating', 'useless', 'fail', 'ugly', 'disgusting', 'regret']
    }
};

function t(key) {
    return i18n[currentLang][key] || key;
}

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`lang-${lang === 'zh-TW' ? 'zh' : 'en'}`).classList.add('active');
    updateUI();
}

function updateUI() {
    document.querySelector('.header h1').textContent = t('title');
    document.querySelector('.subtitle').textContent = t('subtitle');
    document.querySelector('.form-group label').textContent = t('inputLabel');
    document.getElementById('textInput').placeholder = t('placeholder');
    document.getElementById('analyzeBtn').textContent = t('analyzeBtn');
    document.querySelector('.result-section h3').textContent = t('result');
    document.querySelector('.keywords-section h4').textContent = t('keywords');
    document.querySelector('.examples-section h3').textContent = t('examples');
}

function detectLanguage(text) {
    return /[\u4e00-\u9fff]/.test(text) ? 'zh' : 'en';
}

function analyzeSentiment(text) {
    const lang = detectLanguage(text);
    const lexicon = sentimentLexicon[lang];
    const lowerText = text.toLowerCase();

    let positiveCount = 0;
    let negativeCount = 0;
    const foundKeywords = { positive: [], negative: [] };

    // Count positive words
    lexicon.positive.forEach(word => {
        if (lowerText.includes(word.toLowerCase())) {
            positiveCount++;
            if (!foundKeywords.positive.includes(word)) {
                foundKeywords.positive.push(word);
            }
        }
    });

    // Count negative words
    lexicon.negative.forEach(word => {
        if (lowerText.includes(word.toLowerCase())) {
            negativeCount++;
            if (!foundKeywords.negative.includes(word)) {
                foundKeywords.negative.push(word);
            }
        }
    });

    // Calculate scores
    const total = positiveCount + negativeCount || 1;
    let positiveScore = (positiveCount / total) * 100;
    let negativeScore = (negativeCount / total) * 100;
    let neutralScore = 100 - positiveScore - negativeScore;

    // If no sentiment words found, default to neutral
    if (positiveCount === 0 && negativeCount === 0) {
        positiveScore = 20;
        negativeScore = 20;
        neutralScore = 60;
    }

    // Determine overall sentiment
    let sentiment, icon;
    if (positiveScore > negativeScore + 10) {
        sentiment = 'positive';
        icon = '😊';
    } else if (negativeScore > positiveScore + 10) {
        sentiment = 'negative';
        icon = '😠';
    } else {
        sentiment = 'neutral';
        icon = '😐';
    }

    return {
        sentiment,
        icon,
        scores: {
            positive: Math.round(positiveScore),
            neutral: Math.round(neutralScore),
            negative: Math.round(negativeScore)
        },
        keywords: foundKeywords
    };
}

function displayResults(result) {
    const resultSection = document.getElementById('resultSection');
    resultSection.style.display = 'block';

    // Update sentiment display
    document.getElementById('sentimentIcon').textContent = result.icon;
    const labelEl = document.getElementById('sentimentLabel');
    labelEl.textContent = t(result.sentiment);
    labelEl.className = `sentiment-label ${result.sentiment}`;

    // Update score bars
    document.getElementById('positiveBar').style.width = `${result.scores.positive}%`;
    document.getElementById('positiveScore').textContent = `${result.scores.positive}%`;

    document.getElementById('neutralBar').style.width = `${result.scores.neutral}%`;
    document.getElementById('neutralScore').textContent = `${result.scores.neutral}%`;

    document.getElementById('negativeBar').style.width = `${result.scores.negative}%`;
    document.getElementById('negativeScore').textContent = `${result.scores.negative}%`;

    // Update keywords
    const keywordsDisplay = document.getElementById('keywordsDisplay');
    let keywordsHTML = '';

    result.keywords.positive.forEach(kw => {
        keywordsHTML += `<span class="keyword-tag positive">${kw}</span>`;
    });
    result.keywords.negative.forEach(kw => {
        keywordsHTML += `<span class="keyword-tag negative">${kw}</span>`;
    });

    keywordsDisplay.innerHTML = keywordsHTML || '<span style="color: var(--text-secondary)">未檢測到情感關鍵詞</span>';
}

function init() {
    setLanguage(navigator.language.startsWith('zh') ? 'zh-TW' : 'en');

    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    document.getElementById('analyzeBtn').addEventListener('click', () => {
        const text = document.getElementById('textInput').value.trim();
        if (!text) return;

        const result = analyzeSentiment(text);
        displayResults(result);
    });

    // Example buttons
    document.querySelectorAll('.example-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('textInput').value = btn.dataset.text;
            document.getElementById('analyzeBtn').click();
        });
    });
}

init();
