/**
 * Readability Analysis - Tool #139
 * Analyze text readability and complexity
 */

let currentLang = 'zh-TW';

const i18n = {
    'zh-TW': {
        title: '可讀性分析',
        subtitle: '分析文章的閱讀難度與複雜度',
        inputLabel: '輸入文字',
        placeholder: '輸入要分析可讀性的文字...',
        analyzeBtn: '分析可讀性',
        result: '分析結果',
        readabilityScore: '可讀性分數',
        easy: '容易閱讀',
        medium: '中等難度',
        hard: '較難閱讀',
        sentenceLength: '平均句長',
        wordLength: '平均詞長',
        complexWords: '複雜詞比例',
        sentenceVariety: '句長變化',
        suggestions: '改善建議',
        stats: '文本統計',
        characters: '字元數',
        words: '詞彙數',
        sentences: '句子數',
        paragraphs: '段落數',
        charsPerWord: '字/詞',
        wordsPerSent: '詞/句',
        suggestion1: '考慮將長句拆分為較短的句子',
        suggestion2: '使用更簡單的詞彙替代專業術語',
        suggestion3: '增加段落間的分隔以提高可讀性',
        suggestion4: '句子長度變化過小，可增加變化度',
        suggestion5: '文本結構良好，可讀性佳',
        gradeLevel: '適合年級'
    },
    'en': {
        title: 'Readability Analysis',
        subtitle: 'Analyze text readability and complexity',
        inputLabel: 'Enter text',
        placeholder: 'Enter text to analyze readability...',
        analyzeBtn: 'Analyze Readability',
        result: 'Analysis Result',
        readabilityScore: 'Readability Score',
        easy: 'Easy to Read',
        medium: 'Moderate',
        hard: 'Difficult',
        sentenceLength: 'Avg Sentence Length',
        wordLength: 'Avg Word Length',
        complexWords: 'Complex Words',
        sentenceVariety: 'Sentence Variety',
        suggestions: 'Suggestions',
        stats: 'Text Statistics',
        characters: 'Characters',
        words: 'Words',
        sentences: 'Sentences',
        paragraphs: 'Paragraphs',
        charsPerWord: 'chars/word',
        wordsPerSent: 'words/sent',
        suggestion1: 'Consider breaking long sentences into shorter ones',
        suggestion2: 'Use simpler vocabulary instead of complex terms',
        suggestion3: 'Add more paragraph breaks to improve readability',
        suggestion4: 'Vary sentence length for better flow',
        suggestion5: 'Good structure, text is readable',
        gradeLevel: 'Grade Level'
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

function countSyllables(word) {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
}

function analyzeReadability(text) {
    const lang = detectLanguage(text);

    // Basic stats
    const characters = text.replace(/\s/g, '').length;
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim()).length || 1;

    let words, sentences, avgWordLength, avgSentenceLength, complexWordRatio;

    if (lang === 'zh') {
        // Chinese text analysis
        const zhChars = text.match(/[\u4e00-\u9fff]/g) || [];
        words = zhChars.length;
        sentences = text.split(/[。！？；]/).filter(s => s.trim().length > 0).length || 1;
        avgWordLength = 2; // Chinese characters are roughly equivalent
        avgSentenceLength = words / sentences;

        // Complex words: words with more than 2 characters in sequence or technical terms
        const complexPatterns = text.match(/[\u4e00-\u9fff]{4,}/g) || [];
        complexWordRatio = words > 0 ? (complexPatterns.length * 4) / words : 0;

    } else {
        // English text analysis
        const wordList = text.match(/[a-zA-Z]+/g) || [];
        words = wordList.length;
        sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length || 1;

        const totalWordLength = wordList.reduce((sum, w) => sum + w.length, 0);
        avgWordLength = words > 0 ? totalWordLength / words : 0;
        avgSentenceLength = words / sentences;

        // Complex words: 3+ syllables
        const complexWords = wordList.filter(w => countSyllables(w) >= 3).length;
        complexWordRatio = words > 0 ? complexWords / words : 0;
    }

    // Sentence variety (standard deviation of sentence lengths)
    const sentenceTexts = lang === 'zh'
        ? text.split(/[。！？；]/).filter(s => s.trim())
        : text.split(/[.!?]+/).filter(s => s.trim());

    const sentenceLengths = sentenceTexts.map(s => {
        if (lang === 'zh') {
            return (s.match(/[\u4e00-\u9fff]/g) || []).length;
        } else {
            return (s.match(/[a-zA-Z]+/g) || []).length;
        }
    });

    const meanLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length || 0;
    const variance = sentenceLengths.reduce((sum, len) => sum + Math.pow(len - meanLength, 2), 0) / sentenceLengths.length;
    const sentenceVariety = Math.sqrt(variance);

    // Calculate readability score (0-100, higher = easier)
    let score;
    if (lang === 'zh') {
        // Chinese readability: based on sentence length and character complexity
        score = 100 - (avgSentenceLength * 2) - (complexWordRatio * 50);
    } else {
        // Flesch Reading Ease (modified)
        score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * (avgWordLength / 5));
    }

    score = Math.max(0, Math.min(100, Math.round(score)));

    // Determine level
    let level;
    if (score >= 70) level = 'easy';
    else if (score >= 40) level = 'medium';
    else level = 'hard';

    // Generate suggestions
    const suggestions = [];
    if (avgSentenceLength > (lang === 'zh' ? 25 : 20)) {
        suggestions.push({ icon: '✂️', text: t('suggestion1') });
    }
    if (complexWordRatio > 0.15) {
        suggestions.push({ icon: '📖', text: t('suggestion2') });
    }
    if (paragraphs === 1 && sentences > 5) {
        suggestions.push({ icon: '📝', text: t('suggestion3') });
    }
    if (sentenceVariety < 3) {
        suggestions.push({ icon: '🔄', text: t('suggestion4') });
    }
    if (suggestions.length === 0) {
        suggestions.push({ icon: '✅', text: t('suggestion5') });
    }

    return {
        score,
        level,
        lang,
        metrics: {
            sentenceLength: { value: avgSentenceLength.toFixed(1), level: avgSentenceLength > 20 ? 'hard' : avgSentenceLength > 12 ? 'medium' : 'easy' },
            wordLength: { value: avgWordLength.toFixed(1), level: avgWordLength > 6 ? 'hard' : avgWordLength > 4.5 ? 'medium' : 'easy' },
            complexWords: { value: (complexWordRatio * 100).toFixed(0) + '%', level: complexWordRatio > 0.2 ? 'hard' : complexWordRatio > 0.1 ? 'medium' : 'easy' },
            sentenceVariety: { value: sentenceVariety.toFixed(1), level: sentenceVariety < 3 ? 'hard' : sentenceVariety < 6 ? 'medium' : 'easy' }
        },
        stats: {
            characters,
            words,
            sentences,
            paragraphs
        },
        suggestions
    };
}

function displayResults(result) {
    document.getElementById('resultSection').style.display = 'block';

    // Score display
    const scoreNumber = document.getElementById('scoreNumber');
    scoreNumber.textContent = result.score;
    scoreNumber.className = `score-number ${result.level}`;

    const levelBadge = document.getElementById('levelBadge');
    levelBadge.className = `level-badge ${result.level}`;
    document.getElementById('levelText').textContent = t(result.level);

    // Metrics grid
    const metricsHTML = Object.entries(result.metrics).map(([key, data]) => `
        <div class="metric-card">
            <div class="metric-header">
                <span class="metric-name">${t(key)}</span>
                <span class="metric-value">${data.value}</span>
            </div>
            <div class="metric-bar">
                <div class="metric-fill ${data.level}" style="width: ${data.level === 'easy' ? '33' : data.level === 'medium' ? '66' : '100'}%"></div>
            </div>
        </div>
    `).join('');
    document.getElementById('metricsGrid').innerHTML = metricsHTML;

    // Suggestions
    const suggestionsHTML = result.suggestions.map(s => `
        <div class="suggestion-item">
            <span class="suggestion-icon">${s.icon}</span>
            <span class="suggestion-text">${s.text}</span>
        </div>
    `).join('');
    document.getElementById('suggestionsList').innerHTML = suggestionsHTML;

    // Stats
    document.getElementById('statsGrid').innerHTML = `
        <div class="stat-item">
            <div class="stat-value">${result.stats.characters}</div>
            <div class="stat-label">${t('characters')}</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${result.stats.words}</div>
            <div class="stat-label">${t('words')}</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${result.stats.sentences}</div>
            <div class="stat-label">${t('sentences')}</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${result.stats.paragraphs}</div>
            <div class="stat-label">${t('paragraphs')}</div>
        </div>
    `;
}

function init() {
    setLanguage(navigator.language.startsWith('zh') ? 'zh-TW' : 'en');

    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    document.getElementById('analyzeBtn').addEventListener('click', () => {
        const text = document.getElementById('textInput').value.trim();
        if (!text) return;

        const result = analyzeReadability(text);
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
