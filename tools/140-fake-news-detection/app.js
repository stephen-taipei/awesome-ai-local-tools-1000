/**
 * Fake News Detection - Tool #140
 * Detect potential fake news indicators
 */

let currentLang = 'zh-TW';

const i18n = {
    'zh-TW': {
        title: '假新聞檢測',
        subtitle: '分析文字中的可疑新聞指標',
        inputLabel: '輸入新聞文字',
        placeholder: '貼上要檢測的新聞內容...',
        analyzeBtn: '分析可信度',
        result: '分析結果',
        credibility: '可信度',
        credible: '可能可信',
        suspicious: '需要查核',
        unreliable: '高度可疑',
        credibleDesc: '未發現明顯可疑指標',
        suspiciousDesc: '發現一些可疑特徵，建議查證',
        unreliableDesc: '發現多項假新聞特徵，請謹慎對待',
        emotionalLang: '情緒化語言',
        clickbait: '聳動標題',
        urgency: '緊迫感製造',
        sourceCredibility: '來源引用',
        low: '低',
        medium: '中',
        high: '高',
        flags: '可疑特徵',
        tips: '查核建議',
        tip1: '搜尋其他可靠新聞來源是否有相同報導',
        tip2: '查證文中提到的機構或專家是否存在',
        tip3: '使用事實查核網站（如 MyGoPen、台灣事實查核中心）',
        tip4: '檢查發布日期，確認是否為舊聞',
        tip5: '注意是否有明確的消息來源'
    },
    'en': {
        title: 'Fake News Detection',
        subtitle: 'Analyze potential misinformation indicators',
        inputLabel: 'Enter news text',
        placeholder: 'Paste news content to analyze...',
        analyzeBtn: 'Analyze Credibility',
        result: 'Analysis Result',
        credibility: 'Credibility',
        credible: 'Likely Credible',
        suspicious: 'Needs Verification',
        unreliable: 'Highly Suspicious',
        credibleDesc: 'No obvious suspicious indicators found',
        suspiciousDesc: 'Some suspicious features found, verify recommended',
        unreliableDesc: 'Multiple fake news indicators found, use caution',
        emotionalLang: 'Emotional Language',
        clickbait: 'Clickbait',
        urgency: 'Urgency Tactics',
        sourceCredibility: 'Source Citation',
        low: 'Low',
        medium: 'Medium',
        high: 'High',
        flags: 'Suspicious Features',
        tips: 'Verification Tips',
        tip1: 'Search for the same story in reputable news sources',
        tip2: 'Verify organizations or experts mentioned actually exist',
        tip3: 'Use fact-checking websites (Snopes, PolitiFact, etc.)',
        tip4: 'Check the publication date for old recycled stories',
        tip5: 'Look for clear attribution of sources'
    }
};

// Detection patterns
const patterns = {
    zh: {
        emotional: ['震驚', '驚人', '恐怖', '可怕', '不敢相信', '太誇張', '竟然', '居然', '驚爆', '爆料', '獨家', '內幕', '真相', '揭露', '揭密'],
        clickbait: ['必看', '必讀', '錯過可惜', '錯過後悔', '分享給', '轉發', '不轉不是', '99%的人', '你不知道', '原來', '竟然是這樣'],
        urgency: ['立即', '馬上', '趕快', '緊急', '即將刪除', '限時', '倒數', '最後機會', '不要錯過', '立刻分享'],
        exaggeration: ['100%', '絕對', '史上最', '全球首', '前所未有', '世界第一', '奇蹟', '神奇', '秘密', '秘方'],
        credibleSources: ['根據', '研究', '調查', '報告', '發布', '期刊', '論文', '教授', '博士', '專家', '機構', '政府', '官方']
    },
    en: {
        emotional: ['shocking', 'unbelievable', 'terrifying', 'outrageous', 'explosive', 'bombshell', 'stunning', 'horrifying', 'devastating'],
        clickbait: ['you won\'t believe', 'what happens next', 'will shock you', 'doctors hate', 'one weird trick', 'they don\'t want you to know', 'before it\'s deleted'],
        urgency: ['share now', 'act fast', 'limited time', 'breaking', 'urgent', 'immediately', 'before it\'s too late', 'share before'],
        exaggeration: ['100%', 'absolutely', 'guaranteed', 'miracle', 'cure', 'secret', 'exposed', 'banned', 'censored'],
        credibleSources: ['according to', 'study', 'research', 'published', 'journal', 'professor', 'expert', 'university', 'official', 'government']
    }
};

// Flag descriptions
const flagDescriptions = {
    zh: {
        emotional: '使用情緒化、煽動性語言',
        clickbait: '使用誘導點擊的標題手法',
        urgency: '製造緊迫感要求立即行動',
        exaggeration: '使用誇大絕對化的表達',
        noSource: '缺乏可信的消息來源',
        allCaps: '過度使用大寫字母強調'
    },
    en: {
        emotional: 'Uses emotional, sensational language',
        clickbait: 'Uses clickbait headline tactics',
        urgency: 'Creates urgency to share/act immediately',
        exaggeration: 'Uses exaggerated absolute claims',
        noSource: 'Lacks credible source citations',
        allCaps: 'Excessive use of ALL CAPS for emphasis'
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

function analyzeNews(text) {
    const lang = detectLanguage(text);
    const p = patterns[lang];
    const lower = text.toLowerCase();

    const indicators = {
        emotionalLang: { count: 0, matches: [] },
        clickbait: { count: 0, matches: [] },
        urgency: { count: 0, matches: [] },
        exaggeration: { count: 0, matches: [] },
        sourceCredibility: { count: 0, matches: [] }
    };

    const flags = [];

    // Check emotional language
    p.emotional.forEach(word => {
        if (lower.includes(word.toLowerCase())) {
            indicators.emotionalLang.count++;
            indicators.emotionalLang.matches.push(word);
        }
    });
    if (indicators.emotionalLang.count >= 2) {
        flags.push({ type: 'emotional', text: flagDescriptions[lang].emotional });
    }

    // Check clickbait
    p.clickbait.forEach(phrase => {
        if (lower.includes(phrase.toLowerCase())) {
            indicators.clickbait.count++;
            indicators.clickbait.matches.push(phrase);
        }
    });
    if (indicators.clickbait.count >= 1) {
        flags.push({ type: 'clickbait', text: flagDescriptions[lang].clickbait });
    }

    // Check urgency
    p.urgency.forEach(word => {
        if (lower.includes(word.toLowerCase())) {
            indicators.urgency.count++;
            indicators.urgency.matches.push(word);
        }
    });
    if (indicators.urgency.count >= 2) {
        flags.push({ type: 'urgency', text: flagDescriptions[lang].urgency });
    }

    // Check exaggeration
    p.exaggeration.forEach(word => {
        if (lower.includes(word.toLowerCase())) {
            indicators.exaggeration.count++;
            indicators.exaggeration.matches.push(word);
        }
    });
    if (indicators.exaggeration.count >= 2) {
        flags.push({ type: 'exaggeration', text: flagDescriptions[lang].exaggeration });
    }

    // Check source credibility
    p.credibleSources.forEach(word => {
        if (lower.includes(word.toLowerCase())) {
            indicators.sourceCredibility.count++;
            indicators.sourceCredibility.matches.push(word);
        }
    });
    if (indicators.sourceCredibility.count === 0) {
        flags.push({ type: 'noSource', text: flagDescriptions[lang].noSource });
    }

    // Check ALL CAPS usage (for English)
    if (lang === 'en') {
        const capsWords = text.match(/\b[A-Z]{4,}\b/g) || [];
        if (capsWords.length >= 3) {
            flags.push({ type: 'allCaps', text: flagDescriptions[lang].allCaps });
        }
    }

    // Check for excessive exclamation/question marks
    const excessivePunctuation = (text.match(/[!?]{2,}/g) || []).length;
    if (excessivePunctuation >= 2) {
        indicators.emotionalLang.count += 2;
    }

    // Calculate credibility score (100 = most credible, 0 = least credible)
    let score = 100;
    score -= indicators.emotionalLang.count * 8;
    score -= indicators.clickbait.count * 15;
    score -= indicators.urgency.count * 10;
    score -= indicators.exaggeration.count * 8;
    if (indicators.sourceCredibility.count === 0) score -= 15;
    else if (indicators.sourceCredibility.count >= 3) score += 10;

    score = Math.max(0, Math.min(100, score));

    // Determine verdict
    let verdict;
    if (score >= 70) verdict = 'credible';
    else if (score >= 40) verdict = 'suspicious';
    else verdict = 'unreliable';

    // Get indicator levels
    const getLevel = (count, thresholds) => {
        if (count >= thresholds.high) return 'high';
        if (count >= thresholds.medium) return 'medium';
        return 'low';
    };

    const indicatorLevels = {
        emotionalLang: { level: getLevel(indicators.emotionalLang.count, { medium: 2, high: 4 }), icon: '🎭' },
        clickbait: { level: getLevel(indicators.clickbait.count, { medium: 1, high: 2 }), icon: '📢' },
        urgency: { level: getLevel(indicators.urgency.count, { medium: 2, high: 3 }), icon: '⚡' },
        sourceCredibility: {
            level: indicators.sourceCredibility.count === 0 ? 'high' : indicators.sourceCredibility.count < 2 ? 'medium' : 'low',
            icon: '🔍',
            inverted: true
        }
    };

    return {
        score,
        verdict,
        indicators: indicatorLevels,
        flags,
        lang
    };
}

function displayResults(result) {
    document.getElementById('resultSection').style.display = 'block';

    // Gauge animation
    const angle = (100 - result.score) * 2.4; // Convert score to degrees (0-240)
    const gaugeFill = document.getElementById('gaugeFill');
    gaugeFill.style.clipPath = `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.sin(angle * Math.PI / 180)}% ${50 - 50 * Math.cos(angle * Math.PI / 180)}%)`;

    const gaugeValue = document.getElementById('gaugeValue');
    gaugeValue.textContent = result.score;
    gaugeValue.className = `gauge-value ${result.verdict}`;

    // Verdict
    const verdictEl = document.getElementById('verdict');
    const icons = { credible: '✅', suspicious: '⚠️', unreliable: '🚨' };
    verdictEl.className = `verdict ${result.verdict}`;
    verdictEl.innerHTML = `
        <div class="verdict-icon">${icons[result.verdict]}</div>
        <div class="verdict-text">${t(result.verdict)}</div>
        <div class="verdict-desc">${t(result.verdict + 'Desc')}</div>
    `;

    // Indicators
    const indicatorsHTML = Object.entries(result.indicators).map(([key, data]) => `
        <div class="indicator-card">
            <div class="indicator-icon ${data.inverted ? (data.level === 'low' ? 'high' : data.level === 'high' ? 'low' : 'medium') : data.level}">${data.icon}</div>
            <div class="indicator-content">
                <div class="indicator-name">${t(key)}</div>
                <div class="indicator-level ${data.level}">${t(data.level)}</div>
            </div>
        </div>
    `).join('');
    document.getElementById('indicatorsGrid').innerHTML = indicatorsHTML;

    // Flags
    const flagsSection = document.getElementById('flagsSection');
    if (result.flags.length > 0) {
        flagsSection.style.display = 'block';
        const flagsHTML = result.flags.map(flag => `
            <div class="flag-item">
                <span class="flag-icon">🚩</span>
                <span>${flag.text}</span>
            </div>
        `).join('');
        document.getElementById('flagsList').innerHTML = flagsHTML;
    } else {
        flagsSection.style.display = 'none';
    }

    // Tips
    const tips = [t('tip1'), t('tip2'), t('tip3'), t('tip4'), t('tip5')];
    const tipsHTML = tips.map(tip => `
        <div class="tip-item">
            <span class="tip-icon">💡</span>
            <span>${tip}</span>
        </div>
    `).join('');
    document.getElementById('tipsList').innerHTML = tipsHTML;
}

function init() {
    setLanguage(navigator.language.startsWith('zh') ? 'zh-TW' : 'en');

    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    document.getElementById('analyzeBtn').addEventListener('click', () => {
        const text = document.getElementById('textInput').value.trim();
        if (!text) return;

        const result = analyzeNews(text);
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
