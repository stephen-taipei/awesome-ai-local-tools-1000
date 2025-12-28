/**
 * Keyword Extraction - Tool #132
 * Extract keywords using TF-IDF algorithm
 */

let currentLang = 'zh-TW';

const i18n = {
    'zh-TW': {
        title: '關鍵字提取',
        subtitle: '自動提取文章關鍵字',
        inputLabel: '輸入文章',
        placeholder: '貼上要提取關鍵字的文章...',
        count: '關鍵字數量',
        minLength: '最小詞長',
        extractBtn: '提取關鍵字',
        result: '提取結果',
        copy: '複製',
        list: '關鍵字列表',
        words: '個',
        chars: '字',
        totalWords: '總詞數',
        keywords: '關鍵字'
    },
    'en': {
        title: 'Keyword Extraction',
        subtitle: 'Extract keywords automatically',
        inputLabel: 'Enter text',
        placeholder: 'Paste text to extract keywords...',
        count: 'Number of keywords',
        minLength: 'Minimum length',
        extractBtn: 'Extract Keywords',
        result: 'Extraction Result',
        copy: 'Copy',
        list: 'Keyword List',
        words: '',
        chars: 'chars',
        totalWords: 'Total words',
        keywords: 'Keywords'
    }
};

// Stop words
const stopWords = {
    zh: ['的', '了', '是', '在', '我', '有', '和', '就', '不', '人', '都', '一', '一個', '上', '也', '很', '到', '說', '要', '去', '你', '會', '著', '沒有', '看', '好', '自己', '這', '那', '來', '他', '她', '它', '們', '為', '以', '及', '等', '與', '或', '但', '而', '如果', '因為', '所以', '雖然', '可以', '這個', '那個', '什麼', '怎麼', '為什麼'],
    en: ['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'and', 'but', 'if', 'or', 'because', 'until', 'while', 'this', 'that', 'these', 'those', 'am', 'it', 'its', 'he', 'she', 'they', 'them', 'his', 'her', 'their', 'my', 'your', 'our', 'what', 'which', 'who', 'whom', 'i', 'you', 'we']
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
    document.querySelectorAll('.form-group label')[0].textContent = t('inputLabel');
    document.getElementById('textInput').placeholder = t('placeholder');
    document.getElementById('extractBtn').textContent = t('extractBtn');
    document.querySelector('.result-header h3').textContent = t('result');
    document.getElementById('copyBtn').textContent = t('copy');
    document.querySelector('.keywords-list h4').textContent = t('list');
}

function detectLanguage(text) {
    return /[\u4e00-\u9fff]/.test(text) ? 'zh' : 'en';
}

function tokenize(text, lang) {
    if (lang === 'zh') {
        // Simple Chinese tokenization (character-based with some bigrams)
        const chars = text.replace(/[^\u4e00-\u9fff]/g, '');
        const tokens = [];

        // Single characters
        for (const char of chars) {
            tokens.push(char);
        }

        // Bigrams
        for (let i = 0; i < chars.length - 1; i++) {
            tokens.push(chars[i] + chars[i + 1]);
        }

        return tokens;
    } else {
        // English tokenization
        return text.toLowerCase()
            .replace(/[^a-z\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 0);
    }
}

function extractKeywords(text, count, minLength) {
    const lang = detectLanguage(text);
    const tokens = tokenize(text, lang);
    const stops = stopWords[lang];

    // Count word frequencies
    const wordFreq = {};
    tokens.forEach(word => {
        if (word.length >= minLength && !stops.includes(word.toLowerCase())) {
            wordFreq[word] = (wordFreq[word] || 0) + 1;
        }
    });

    // Sort by frequency
    const sorted = Object.entries(wordFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, count);

    // Calculate relative scores
    const maxFreq = sorted[0]?.[1] || 1;
    return sorted.map(([word, freq]) => ({
        word,
        freq,
        score: Math.round((freq / maxFreq) * 100)
    }));
}

function getSizeClass(score) {
    if (score >= 80) return 'size-5';
    if (score >= 60) return 'size-4';
    if (score >= 40) return 'size-3';
    if (score >= 20) return 'size-2';
    return 'size-1';
}

function displayResults(keywords, totalWords) {
    document.getElementById('resultSection').style.display = 'block';

    // Word cloud
    const cloudHTML = keywords.map(kw =>
        `<span class="keyword-cloud-item ${getSizeClass(kw.score)}">${kw.word}</span>`
    ).join('');
    document.getElementById('keywordsCloud').innerHTML = cloudHTML;

    // Keyword list
    const listHTML = keywords.map(kw =>
        `<div class="keyword-item">
            <span class="keyword-text">${kw.word}</span>
            <span class="keyword-score">${kw.freq}x (${kw.score}%)</span>
        </div>`
    ).join('');
    document.getElementById('keywordsList').innerHTML = listHTML;

    // Stats
    document.getElementById('stats').innerHTML = `
        <span>${t('totalWords')}: ${totalWords}</span>
        <span>${t('keywords')}: ${keywords.length}</span>
    `;
}

function init() {
    setLanguage(navigator.language.startsWith('zh') ? 'zh-TW' : 'en');

    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    document.getElementById('extractBtn').addEventListener('click', () => {
        const text = document.getElementById('textInput').value.trim();
        if (!text) return;

        const count = parseInt(document.getElementById('countSelect').value);
        const minLength = parseInt(document.getElementById('minLengthSelect').value);

        const lang = detectLanguage(text);
        const tokens = tokenize(text, lang);
        const keywords = extractKeywords(text, count, minLength);

        displayResults(keywords, tokens.length);
    });

    document.getElementById('copyBtn').addEventListener('click', () => {
        const keywords = Array.from(document.querySelectorAll('.keyword-text'))
            .map(el => el.textContent)
            .join(', ');
        navigator.clipboard.writeText(keywords);
    });
}

init();
