/**
 * Text Polish - Tool #144
 * Polish and improve text
 */

let currentLang = 'zh-TW';

const i18n = {
    'zh-TW': {
        title: '文字潤飾',
        subtitle: '優化文字表達，提升寫作品質',
        inputLabel: '輸入文字',
        placeholder: '輸入要潤飾的文字...',
        polishBtn: '潤飾文字',
        original: '原始文字',
        polished: '潤飾後',
        improvements: '改善項目',
        copy: '複製結果',
        copied: '已複製！',
        formal: '正式書面',
        casual: '輕鬆口語',
        concise: '簡潔精練',
        elaborate: '詳細豐富',
        redundancy: '移除贅詞',
        clarity: '提升清晰',
        tone: '調整語氣',
        vocabulary: '優化用詞'
    },
    'en': {
        title: 'Text Polish',
        subtitle: 'Polish and improve your text',
        inputLabel: 'Enter text',
        placeholder: 'Enter text to polish...',
        polishBtn: 'Polish Text',
        original: 'Original',
        polished: 'Polished',
        improvements: 'Improvements',
        copy: 'Copy Result',
        copied: 'Copied!',
        formal: 'Formal',
        casual: 'Casual',
        concise: 'Concise',
        elaborate: 'Elaborate',
        redundancy: 'Removed redundancy',
        clarity: 'Improved clarity',
        tone: 'Adjusted tone',
        vocabulary: 'Enhanced vocabulary'
    }
};

// Polishing rules
const polishRules = {
    zh: {
        redundancy: [
            { pattern: /非常非常/g, replacement: '非常', improvement: '移除重複詞' },
            { pattern: /很多很多/g, replacement: '許多', improvement: '移除重複詞' },
            { pattern: /真的真的/g, replacement: '確實', improvement: '移除重複詞' },
            { pattern: /的話的話/g, replacement: '的話', improvement: '移除重複' },
            { pattern: /這個東西/g, replacement: '這', improvement: '簡化表達' },
            { pattern: /那個東西/g, replacement: '那', improvement: '簡化表達' },
            { pattern: /進行.*工作/g, replacement: match => match.replace('進行', '').replace('工作', ''), improvement: '簡化表達' }
        ],
        formal: [
            { pattern: /超級/g, replacement: '非常', improvement: '正式化用詞' },
            { pattern: /超棒/g, replacement: '出色', improvement: '正式化用詞' },
            { pattern: /超讚/g, replacement: '優秀', improvement: '正式化用詞' },
            { pattern: /好用/g, replacement: '實用', improvement: '正式化用詞' }
        ],
        casual: [
            { pattern: /非常/g, replacement: '超', improvement: '口語化用詞' },
            { pattern: /優秀/g, replacement: '超棒', improvement: '口語化用詞' }
        ],
        concise: [
            { pattern: /我個人認為/g, replacement: '我認為', improvement: '簡化表達' },
            { pattern: /基本上來說/g, replacement: '', improvement: '移除贅詞' },
            { pattern: /總而言之/g, replacement: '總之', improvement: '簡化表達' }
        ]
    },
    en: {
        redundancy: [
            { pattern: /really really/gi, replacement: 'truly', improvement: 'Removed repetition' },
            { pattern: /very very/gi, replacement: 'extremely', improvement: 'Removed repetition' },
            { pattern: /a lot very much/gi, replacement: 'greatly', improvement: 'Removed redundancy' },
            { pattern: /the thing is/gi, replacement: 'it is', improvement: 'Simplified expression' },
            { pattern: /in order to/gi, replacement: 'to', improvement: 'Simplified phrase' }
        ],
        formal: [
            { pattern: /\bgonna\b/gi, replacement: 'going to', improvement: 'Formalized' },
            { pattern: /\bwanna\b/gi, replacement: 'want to', improvement: 'Formalized' },
            { pattern: /\bgotta\b/gi, replacement: 'have to', improvement: 'Formalized' },
            { pattern: /\bkinda\b/gi, replacement: 'somewhat', improvement: 'Formalized' }
        ],
        casual: [
            { pattern: /\bgoing to\b/gi, replacement: 'gonna', improvement: 'Made casual' },
            { pattern: /\bwant to\b/gi, replacement: 'wanna', improvement: 'Made casual' }
        ],
        concise: [
            { pattern: /\bin my opinion\b/gi, replacement: '', improvement: 'Removed filler' },
            { pattern: /\bbasically\b/gi, replacement: '', improvement: 'Removed filler' },
            { pattern: /\bactually\b/gi, replacement: '', improvement: 'Removed filler' }
        ]
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

function polishText(text, style) {
    const lang = detectLanguage(text);
    const rules = polishRules[lang];
    const improvements = [];
    let polished = text;

    // Apply redundancy rules (always)
    rules.redundancy.forEach(rule => {
        if (rule.pattern.test(polished)) {
            improvements.push({ type: 'redundancy', text: rule.improvement });
            polished = polished.replace(rule.pattern, typeof rule.replacement === 'function' ? rule.replacement : rule.replacement);
        }
    });

    // Apply style-specific rules
    if (rules[style]) {
        rules[style].forEach(rule => {
            if (rule.pattern.test(polished)) {
                improvements.push({ type: 'tone', text: rule.improvement });
                polished = polished.replace(rule.pattern, rule.replacement);
            }
        });
    }

    // Clean up extra spaces
    polished = polished.replace(/\s+/g, ' ').trim();

    // Add generic improvements based on changes
    if (polished !== text) {
        if (!improvements.some(i => i.type === 'clarity')) {
            improvements.push({ type: 'clarity', text: t('clarity') });
        }
    }

    return {
        original: text,
        polished,
        improvements: [...new Set(improvements.map(i => i.text))]
    };
}

function displayResults(result) {
    document.getElementById('resultSection').style.display = 'block';
    document.getElementById('originalText').textContent = result.original;
    document.getElementById('polishedText').textContent = result.polished;

    const improvementsHTML = result.improvements.map(imp => `
        <span class="improvement-tag">
            <span class="improvement-icon">✨</span>
            ${imp}
        </span>
    `).join('');
    document.getElementById('improvementsList').innerHTML = improvementsHTML || '<span style="color: var(--text-secondary)">文字已經很好，無需修改</span>';
}

function init() {
    setLanguage(navigator.language.startsWith('zh') ? 'zh-TW' : 'en');

    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    document.getElementById('polishBtn').addEventListener('click', () => {
        const text = document.getElementById('textInput').value.trim();
        if (!text) return;

        const style = document.getElementById('styleSelect').value;
        const result = polishText(text, style);
        displayResults(result);
    });

    document.getElementById('copyBtn').addEventListener('click', () => {
        const text = document.getElementById('polishedText').textContent;
        navigator.clipboard.writeText(text).then(() => {
            const btn = document.getElementById('copyBtn');
            btn.textContent = t('copied');
            setTimeout(() => btn.textContent = t('copy'), 2000);
        });
    });

    document.querySelectorAll('.example-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('textInput').value = btn.dataset.text;
            document.getElementById('polishBtn').click();
        });
    });
}

init();
