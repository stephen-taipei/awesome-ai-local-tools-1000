/**
 * Sarcasm Detection - Tool #138
 * Detect sarcasm and irony in text
 */

let currentLang = 'zh-TW';

const i18n = {
    'zh-TW': {
        title: '諷刺檢測',
        subtitle: '識別文字中的諷刺與反諷',
        inputLabel: '輸入文字',
        placeholder: '輸入要檢測諷刺的文字...',
        detectBtn: '檢測諷刺',
        result: '檢測結果',
        sarcasmIndex: '諷刺指數',
        indicators: '檢測指標',
        highlighted: '標記文本',
        detected: '偵測到',
        notDetected: '未偵測',
        sarcastic: '疑似諷刺',
        sincere: '真誠表達',
        uncertain: '無法確定',
        sarcasticDesc: '文字可能含有諷刺或反諷意味',
        sincereDesc: '文字看起來是真誠的表達',
        uncertainDesc: '無法確定是否為諷刺',
        exaggeration: '誇張用語',
        contradiction: '矛盾表達',
        intensifier: '強調語氣',
        punctuation: '特殊標點',
        positiveNegative: '正負對比',
        rhetorical: '反問句式'
    },
    'en': {
        title: 'Sarcasm Detection',
        subtitle: 'Detect sarcasm and irony in text',
        inputLabel: 'Enter text',
        placeholder: 'Enter text to detect sarcasm...',
        detectBtn: 'Detect Sarcasm',
        result: 'Detection Result',
        sarcasmIndex: 'Sarcasm Index',
        indicators: 'Detection Indicators',
        highlighted: 'Highlighted Text',
        detected: 'Detected',
        notDetected: 'Not detected',
        sarcastic: 'Likely Sarcastic',
        sincere: 'Sincere',
        uncertain: 'Uncertain',
        sarcasticDesc: 'The text may contain sarcasm or irony',
        sincereDesc: 'The text appears to be sincere',
        uncertainDesc: 'Cannot determine if sarcastic',
        exaggeration: 'Exaggeration',
        contradiction: 'Contradiction',
        intensifier: 'Intensifiers',
        punctuation: 'Special Punctuation',
        positiveNegative: 'Pos/Neg Contrast',
        rhetorical: 'Rhetorical Question'
    }
};

// Sarcasm indicators
const sarcasmPatterns = {
    zh: {
        exaggeration: ['太', '超', '真是', '簡直', '非常', '極度', '完全', '百分之百', '絕對', '史上最'],
        intensifier: ['真', '好', '真的', '確實', '當然', '肯定', '一定', '絕對'],
        contradiction: ['但是', '可是', '不過', '然而', '卻', '偏偏', '居然', '竟然'],
        positive: ['聰明', '厲害', '棒', '優秀', '完美', '最佳', '典範', '榜樣', '了不起', '高明'],
        negative: ['差', '爛', '糟', '蠢', '笨', '失敗', '遲到', '不會', '答不出', '做不到'],
        rhetorical: ['嗎', '吧', '呢', '難道', '何必', '怎麼'],
        punctuation: ['...', '。。。', '？？', '！！', '～', '呵呵', '哈哈', '嘻嘻']
    },
    en: {
        exaggeration: ['so', 'such', 'absolutely', 'totally', 'completely', 'definitely', 'obviously', 'clearly', 'just', 'really', 'ever', 'best', 'worst', 'always', 'never'],
        intensifier: ['very', 'really', 'truly', 'certainly', 'surely', 'indeed', 'of course'],
        contradiction: ['but', 'however', 'yet', 'although', 'though', 'still', 'except'],
        positive: ['love', 'great', 'wonderful', 'amazing', 'fantastic', 'perfect', 'brilliant', 'genius', 'smart', 'favorite'],
        negative: ['hate', 'terrible', 'awful', 'boring', 'stupid', 'fail', 'worst', 'annoying'],
        rhetorical: ['right', 'huh', 'eh', 'yeah right', 'sure'],
        punctuation: ['...', '???', '!!!', '~', 'lol', 'haha', 'wow']
    }
};

// Common sarcastic phrases
const sarcasticPhrases = {
    zh: [
        '真是太好了', '太棒了', '真聰明', '真厲害', '辛苦了', '謝謝你', '真準時', '真有效率',
        '什麼都會', '無所不能', '太完美', '典範', '榜樣'
    ],
    en: [
        'oh great', 'just great', 'how wonderful', 'what a surprise', 'thanks a lot',
        'yeah right', 'sure thing', 'no kidding', 'you think', 'wow really',
        'my favorite', 'love it', 'so helpful', 'genius move'
    ]
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

function detectSarcasm(text) {
    const lang = detectLanguage(text);
    const patterns = sarcasmPatterns[lang];
    const phrases = sarcasticPhrases[lang];
    const lower = text.toLowerCase();

    const indicators = {
        exaggeration: { detected: false, matches: [] },
        intensifier: { detected: false, matches: [] },
        contradiction: { detected: false, matches: [] },
        positiveNegative: { detected: false, matches: [] },
        rhetorical: { detected: false, matches: [] },
        punctuation: { detected: false, matches: [] }
    };

    // Check exaggeration
    patterns.exaggeration.forEach(word => {
        if (lower.includes(word.toLowerCase())) {
            indicators.exaggeration.detected = true;
            indicators.exaggeration.matches.push(word);
        }
    });

    // Check intensifiers
    patterns.intensifier.forEach(word => {
        if (lower.includes(word.toLowerCase())) {
            indicators.intensifier.detected = true;
            indicators.intensifier.matches.push(word);
        }
    });

    // Check contradiction
    patterns.contradiction.forEach(word => {
        if (lower.includes(word.toLowerCase())) {
            indicators.contradiction.detected = true;
            indicators.contradiction.matches.push(word);
        }
    });

    // Check positive + negative contrast
    const hasPositive = patterns.positive.some(w => lower.includes(w.toLowerCase()));
    const hasNegative = patterns.negative.some(w => lower.includes(w.toLowerCase()));
    if (hasPositive && hasNegative) {
        indicators.positiveNegative.detected = true;
        indicators.positiveNegative.matches = ['正負對比'];
    }

    // Positive + negative context (sarcasm pattern)
    const posMatches = patterns.positive.filter(w => lower.includes(w.toLowerCase()));
    const negMatches = patterns.negative.filter(w => lower.includes(w.toLowerCase()));
    if (posMatches.length > 0 && negMatches.length > 0) {
        indicators.positiveNegative.detected = true;
        indicators.positiveNegative.matches = [...posMatches, ...negMatches];
    }

    // Check rhetorical
    patterns.rhetorical.forEach(word => {
        if (lower.includes(word.toLowerCase())) {
            indicators.rhetorical.detected = true;
            indicators.rhetorical.matches.push(word);
        }
    });

    // Check punctuation
    patterns.punctuation.forEach(p => {
        if (text.includes(p)) {
            indicators.punctuation.detected = true;
            indicators.punctuation.matches.push(p);
        }
    });

    // Check sarcastic phrases
    let phraseScore = 0;
    const matchedPhrases = [];
    phrases.forEach(phrase => {
        if (lower.includes(phrase.toLowerCase())) {
            phraseScore += 30;
            matchedPhrases.push(phrase);
        }
    });

    // Calculate sarcasm score
    let score = phraseScore;
    if (indicators.exaggeration.detected) score += 15;
    if (indicators.intensifier.detected) score += 10;
    if (indicators.contradiction.detected) score += 20;
    if (indicators.positiveNegative.detected) score += 25;
    if (indicators.rhetorical.detected) score += 10;
    if (indicators.punctuation.detected) score += 10;

    // Check for classic sarcasm pattern: positive word + negative context
    const exaggeratedPositive = indicators.exaggeration.detected &&
        patterns.positive.some(w => lower.includes(w.toLowerCase()));
    if (exaggeratedPositive && (hasNegative || indicators.contradiction.detected)) {
        score += 20;
    }

    score = Math.min(score, 100);

    // Determine verdict
    let verdict = 'uncertain';
    if (score >= 50) verdict = 'sarcastic';
    else if (score < 25) verdict = 'sincere';

    return {
        score,
        verdict,
        indicators,
        matchedPhrases,
        lang
    };
}

function highlightSarcasm(text, result) {
    let highlighted = text;
    const patterns = sarcasmPatterns[result.lang];

    // Highlight matched phrases first
    result.matchedPhrases.forEach(phrase => {
        const regex = new RegExp(`(${phrase})`, 'gi');
        highlighted = highlighted.replace(regex, '<span class="highlight-sarcasm">$1</span>');
    });

    // Highlight exaggeration + positive combos
    patterns.exaggeration.forEach(word => {
        patterns.positive.forEach(pos => {
            const combo = new RegExp(`(${word}[^。.!?]*${pos})`, 'gi');
            highlighted = highlighted.replace(combo, '<span class="highlight-sarcasm">$1</span>');
        });
    });

    return highlighted;
}

function displayResults(result) {
    document.getElementById('resultSection').style.display = 'block';

    // Meter
    const meterFill = document.getElementById('meterFill');
    meterFill.style.width = `${result.score}%`;
    document.getElementById('meterValue').textContent = `${result.score}%`;

    // Verdict
    const verdictEl = document.getElementById('verdict');
    verdictEl.className = `verdict ${result.verdict}`;
    const icons = { sarcastic: '🎭', sincere: '😊', uncertain: '🤔' };
    verdictEl.innerHTML = `
        <div class="verdict-icon">${icons[result.verdict]}</div>
        <div class="verdict-text">${t(result.verdict)}</div>
        <div class="verdict-desc">${t(result.verdict + 'Desc')}</div>
    `;

    // Indicators
    const indicatorKeys = ['exaggeration', 'contradiction', 'intensifier', 'punctuation', 'positiveNegative', 'rhetorical'];
    const indicatorsHTML = indicatorKeys.map(key => {
        const ind = result.indicators[key];
        const statusClass = ind.detected ? 'detected' : 'not-detected';
        return `
            <div class="indicator-item">
                <div class="indicator-icon ${statusClass}">${ind.detected ? '✓' : '✗'}</div>
                <div class="indicator-label">${t(key)}</div>
                <div class="indicator-status ${statusClass}">${ind.detected ? t('detected') : t('notDetected')}</div>
            </div>
        `;
    }).join('');
    document.getElementById('indicatorsList').innerHTML = indicatorsHTML;

    // Highlighted text
    const text = document.getElementById('textInput').value;
    document.getElementById('highlightedText').innerHTML = highlightSarcasm(text, result);
}

function init() {
    setLanguage(navigator.language.startsWith('zh') ? 'zh-TW' : 'en');

    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    document.getElementById('detectBtn').addEventListener('click', () => {
        const text = document.getElementById('textInput').value.trim();
        if (!text) return;

        const result = detectSarcasm(text);
        displayResults(result);
    });

    document.querySelectorAll('.example-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('textInput').value = btn.dataset.text;
            document.getElementById('detectBtn').click();
        });
    });
}

init();
