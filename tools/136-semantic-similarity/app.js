/**
 * Semantic Similarity - Tool #136
 * Compare semantic similarity between texts
 */

let currentLang = 'zh-TW';

const i18n = {
    'zh-TW': {
        title: '語義相似度',
        subtitle: '比較兩段文字的語義相似程度',
        textA: '文字 A',
        textB: '文字 B',
        placeholderA: '輸入第一段文字...',
        placeholderB: '輸入第二段文字...',
        compareBtn: '計算相似度',
        result: '分析結果',
        similarity: '相似度',
        lexicalSim: '詞彙相似',
        structureSim: '結構相似',
        lengthSim: '長度相似',
        commonWords: '共同詞彙',
        veryHigh: '極高相似',
        high: '高度相似',
        medium: '中度相似',
        low: '低度相似',
        veryLow: '極低相似'
    },
    'en': {
        title: 'Semantic Similarity',
        subtitle: 'Compare semantic similarity between texts',
        textA: 'Text A',
        textB: 'Text B',
        placeholderA: 'Enter first text...',
        placeholderB: 'Enter second text...',
        compareBtn: 'Calculate Similarity',
        result: 'Analysis Result',
        similarity: 'Similarity',
        lexicalSim: 'Lexical',
        structureSim: 'Structure',
        lengthSim: 'Length',
        commonWords: 'Common Words',
        veryHigh: 'Very High',
        high: 'High',
        medium: 'Medium',
        low: 'Low',
        veryLow: 'Very Low'
    }
};

const stopWords = {
    zh: new Set(['的', '了', '是', '在', '和', '與', '有', '也', '這', '那', '都', '而', '及', '為', '以', '到', '從', '就', '被', '對', '能', '會', '可以', '可能', '還', '很', '更', '最', '但', '如果', '因為', '所以']),
    en: new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'and', 'but', 'if', 'or', 'this', 'that', 'these', 'those', 'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'him', 'his', 'she', 'her', 'it', 'its', 'they', 'them', 'their'])
};

// Synonyms for semantic matching
const synonyms = {
    zh: {
        '人工智慧': ['AI', '機器智能', '智能'],
        '機器學習': ['ML', '學習演算法'],
        '深度學習': ['深層學習', 'DL'],
        '醫療': ['醫學', '醫生', '健康'],
        '疾病': ['病', '症狀', '病症'],
        '識別': ['檢測', '偵測', '認出'],
        '幫助': ['協助', '輔助', '支援'],
        '準確': ['精確', '正確', '精準']
    },
    en: {
        'quick': ['fast', 'rapid', 'swift', 'speedy'],
        'big': ['large', 'huge', 'enormous', 'giant'],
        'small': ['little', 'tiny', 'miniature'],
        'good': ['great', 'excellent', 'wonderful'],
        'bad': ['poor', 'terrible', 'awful'],
        'jump': ['leap', 'hop', 'bounce'],
        'lazy': ['sleepy', 'idle', 'inactive'],
        'ai': ['artificial intelligence', 'machine intelligence'],
        'doctor': ['physician', 'medical professional']
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

function tokenize(text, lang) {
    if (lang === 'zh') {
        return text.match(/[\u4e00-\u9fff]+|[a-zA-Z]+/g) || [];
    } else {
        return text.toLowerCase().match(/[a-zA-Z]+/g) || [];
    }
}

function removeStopWords(words, lang) {
    const stops = stopWords[lang];
    return words.filter(w => !stops.has(w.toLowerCase()) && w.length > 1);
}

function expandSynonyms(words, lang) {
    const expanded = new Set(words.map(w => w.toLowerCase()));
    const langSynonyms = synonyms[lang];

    words.forEach(word => {
        const lower = word.toLowerCase();
        // Check if word has synonyms
        if (langSynonyms[lower]) {
            langSynonyms[lower].forEach(syn => expanded.add(syn.toLowerCase()));
        }
        // Check if word is a synonym of something
        Object.entries(langSynonyms).forEach(([key, syns]) => {
            if (syns.map(s => s.toLowerCase()).includes(lower)) {
                expanded.add(key.toLowerCase());
                syns.forEach(syn => expanded.add(syn.toLowerCase()));
            }
        });
    });

    return expanded;
}

function jaccardSimilarity(set1, set2) {
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return union.size === 0 ? 0 : intersection.size / union.size;
}

function cosineSimilarity(words1, words2) {
    const freq1 = {};
    const freq2 = {};
    const allWords = new Set([...words1, ...words2]);

    words1.forEach(w => freq1[w] = (freq1[w] || 0) + 1);
    words2.forEach(w => freq2[w] = (freq2[w] || 0) + 1);

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    allWords.forEach(word => {
        const v1 = freq1[word] || 0;
        const v2 = freq2[word] || 0;
        dotProduct += v1 * v2;
        norm1 += v1 * v1;
        norm2 += v2 * v2;
    });

    const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
    return denominator === 0 ? 0 : dotProduct / denominator;
}

function calculateSimilarity(textA, textB) {
    const lang = detectLanguage(textA + textB);

    const wordsA = tokenize(textA, lang);
    const wordsB = tokenize(textB, lang);

    const filteredA = removeStopWords(wordsA, lang);
    const filteredB = removeStopWords(wordsB, lang);

    // Expand with synonyms
    const expandedA = expandSynonyms(filteredA, lang);
    const expandedB = expandSynonyms(filteredB, lang);

    // Calculate different similarity metrics
    const lexicalSim = jaccardSimilarity(
        new Set(filteredA.map(w => w.toLowerCase())),
        new Set(filteredB.map(w => w.toLowerCase()))
    );

    const semanticSim = jaccardSimilarity(expandedA, expandedB);
    const cosineSim = cosineSimilarity(filteredA.map(w => w.toLowerCase()), filteredB.map(w => w.toLowerCase()));

    // Length similarity
    const lenA = textA.length;
    const lenB = textB.length;
    const lengthSim = 1 - Math.abs(lenA - lenB) / Math.max(lenA, lenB, 1);

    // Structure similarity (sentence count, word count ratio)
    const sentA = textA.split(/[。.!?！？]/).filter(s => s.trim()).length;
    const sentB = textB.split(/[。.!?！？]/).filter(s => s.trim()).length;
    const structureSim = sentA && sentB ? 1 - Math.abs(sentA - sentB) / Math.max(sentA, sentB) : 0.5;

    // Overall similarity (weighted average)
    const overallSim = (
        semanticSim * 0.4 +
        cosineSim * 0.3 +
        lexicalSim * 0.15 +
        lengthSim * 0.1 +
        structureSim * 0.05
    );

    // Find common words
    const setA = new Set(filteredA.map(w => w.toLowerCase()));
    const setB = new Set(filteredB.map(w => w.toLowerCase()));
    const commonWords = [...setA].filter(w => setB.has(w));

    return {
        overall: Math.round(overallSim * 100),
        lexical: Math.round(lexicalSim * 100),
        structure: Math.round(structureSim * 100),
        length: Math.round(lengthSim * 100),
        commonWords: commonWords
    };
}

function getSimilarityLabel(score) {
    if (score >= 80) return t('veryHigh');
    if (score >= 60) return t('high');
    if (score >= 40) return t('medium');
    if (score >= 20) return t('low');
    return t('veryLow');
}

function displayResults(result) {
    document.getElementById('resultSection').style.display = 'block';

    // Animate circle
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (result.overall / 100) * circumference;
    const circle = document.getElementById('scoreCircle');
    circle.style.strokeDashoffset = offset;

    // Update score value with color
    const scoreValue = document.getElementById('scoreValue');
    scoreValue.textContent = `${result.overall}%`;

    // Update score label
    document.getElementById('scoreLabel').textContent = getSimilarityLabel(result.overall);

    // Metrics
    document.getElementById('metricsGrid').innerHTML = `
        <div class="metric-card">
            <div class="metric-value">${result.lexical}%</div>
            <div class="metric-label">${t('lexicalSim')}</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${result.structure}%</div>
            <div class="metric-label">${t('structureSim')}</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${result.length}%</div>
            <div class="metric-label">${t('lengthSim')}</div>
        </div>
    `;

    // Common words
    const commonHTML = result.commonWords.length > 0
        ? result.commonWords.map(w => `<span class="common-word">${w}</span>`).join('')
        : `<span style="color: var(--text-secondary)">無共同詞彙</span>`;
    document.getElementById('commonWords').innerHTML = commonHTML;
}

function init() {
    setLanguage(navigator.language.startsWith('zh') ? 'zh-TW' : 'en');

    // Add SVG gradient
    const svg = document.querySelector('.score-circle svg');
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
        <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#10b981"/>
            <stop offset="100%" stop-color="#06b6d4"/>
        </linearGradient>
    `;
    svg.insertBefore(defs, svg.firstChild);

    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    document.getElementById('compareBtn').addEventListener('click', () => {
        const textA = document.getElementById('textA').value.trim();
        const textB = document.getElementById('textB').value.trim();
        if (!textA || !textB) return;

        const result = calculateSimilarity(textA, textB);
        displayResults(result);
    });

    document.querySelectorAll('.example-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('textA').value = btn.dataset.textA;
            document.getElementById('textB').value = btn.dataset.textB;
            document.getElementById('compareBtn').click();
        });
    });
}

init();
