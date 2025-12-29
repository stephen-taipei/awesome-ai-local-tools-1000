/**
 * Grammar Checker - Tool #141
 * Check grammar errors in text
 */

let currentLang = 'zh-TW';

const i18n = {
    'zh-TW': {
        title: '文法檢查',
        subtitle: '自動檢測文章中的文法錯誤',
        inputLabel: '輸入文字',
        placeholder: '輸入要檢查文法的文字...',
        checkBtn: '檢查文法',
        errorsFound: '發現問題',
        suggestions: '改善建議',
        grammarScore: '文法評分',
        correctedText: '標記文本',
        errorList: '問題列表',
        error: '錯誤',
        warning: '建議',
        info: '提示'
    },
    'en': {
        title: 'Grammar Checker',
        subtitle: 'Detect grammar errors in text',
        inputLabel: 'Enter text',
        placeholder: 'Enter text to check grammar...',
        checkBtn: 'Check Grammar',
        errorsFound: 'Issues Found',
        suggestions: 'Suggestions',
        grammarScore: 'Grammar Score',
        correctedText: 'Highlighted Text',
        errorList: 'Issue List',
        error: 'Error',
        warning: 'Warning',
        info: 'Info'
    }
};

// Grammar rules
const grammarRules = {
    zh: [
        { pattern: /去到了/g, replacement: '去了', type: 'error', explanation: '「去到了」是冗餘表達，應簡化為「去了」' },
        { pattern: /非常的/g, replacement: '非常', type: 'warning', explanation: '「非常的」中的「的」是贅詞' },
        { pattern: /應該要/g, replacement: '應該', type: 'warning', explanation: '「應該要」可簡化為「應該」' },
        { pattern: /可以能夠/g, replacement: '能夠', type: 'error', explanation: '「可以能夠」是重複表達' },
        { pattern: /進行.*的工作/g, replacement: '進行工作', type: 'warning', explanation: '表達可以更簡潔' },
        { pattern: /的的/g, replacement: '的', type: 'error', explanation: '重複使用「的」' },
        { pattern: /了了/g, replacement: '了', type: 'error', explanation: '重複使用「了」' },
        { pattern: /正在.*中/g, replacement: match => match.replace('正在', '').replace('中', ''), type: 'warning', explanation: '「正在...中」可簡化' },
        { pattern: /開始進行/g, replacement: '開始', type: 'warning', explanation: '「開始進行」可簡化為「開始」' },
        { pattern: /作為.*來說/g, replacement: match => match.replace('來說', ''), type: 'warning', explanation: '可省略「來說」' }
    ],
    en: [
        { pattern: /\b(she|he|it)\s+don't\b/gi, replacement: match => match.replace(/don't/i, "doesn't"), type: 'error', explanation: 'Third person singular requires "doesn\'t" not "don\'t"' },
        { pattern: /\b(I|we|they|you)\s+doesn't\b/gi, replacement: match => match.replace(/doesn't/i, "don't"), type: 'error', explanation: 'Use "don\'t" with I/we/they/you' },
        { pattern: /\b(he|she|it)\s+go\b(?!\s+to)/gi, replacement: match => match.replace(/\bgo\b/i, 'goes'), type: 'error', explanation: 'Third person singular requires "goes" not "go"' },
        { pattern: /\bam\s+agree\b/gi, replacement: 'agree', type: 'error', explanation: '"Agree" is not used with "am". Just say "I agree"' },
        { pattern: /\btheir\s+(going|coming|doing|being)\b/gi, replacement: match => match.replace(/their/i, "they're"), type: 'error', explanation: 'Use "they\'re" (they are) not "their" (possessive)' },
        { pattern: /\byour\s+the\b/gi, replacement: "you're the", type: 'error', explanation: 'Use "you\'re" (you are) not "your" (possessive)' },
        { pattern: /\bits\s+a\b/gi, replacement: "it's a", type: 'warning', explanation: 'Check if you mean "it\'s" (it is) or "its" (possessive)' },
        { pattern: /\bcould\s+of\b/gi, replacement: 'could have', type: 'error', explanation: '"Could of" is incorrect. Use "could have"' },
        { pattern: /\bshould\s+of\b/gi, replacement: 'should have', type: 'error', explanation: '"Should of" is incorrect. Use "should have"' },
        { pattern: /\bwould\s+of\b/gi, replacement: 'would have', type: 'error', explanation: '"Would of" is incorrect. Use "would have"' },
        { pattern: /\balot\b/gi, replacement: 'a lot', type: 'error', explanation: '"Alot" is not a word. Use "a lot" (two words)' },
        { pattern: /\binfact\b/gi, replacement: 'in fact', type: 'error', explanation: '"Infact" should be "in fact" (two words)' }
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

function checkGrammar(text) {
    const lang = detectLanguage(text);
    const rules = grammarRules[lang];
    const errors = [];
    let highlightedText = text;

    rules.forEach(rule => {
        let match;
        const regex = new RegExp(rule.pattern.source, rule.pattern.flags);

        while ((match = regex.exec(text)) !== null) {
            const original = match[0];
            let suggestion;

            if (typeof rule.replacement === 'function') {
                suggestion = rule.replacement(original);
            } else {
                suggestion = rule.replacement;
            }

            if (original !== suggestion) {
                errors.push({
                    original,
                    suggestion,
                    type: rule.type,
                    explanation: rule.explanation,
                    index: match.index
                });
            }
        }
    });

    // Sort by position (reverse order for replacement)
    errors.sort((a, b) => b.index - a.index);

    // Create highlighted text
    errors.forEach(error => {
        const before = highlightedText.substring(0, error.index);
        const after = highlightedText.substring(error.index + error.original.length);
        const highlightClass = error.type === 'error' ? 'error-highlight' : 'warning-highlight';
        highlightedText = before + `<span class="${highlightClass}" title="${error.explanation}">${error.original}</span>` + after;
    });

    // Sort back by position for display
    errors.sort((a, b) => a.index - b.index);

    // Calculate score
    const words = lang === 'zh'
        ? (text.match(/[\u4e00-\u9fff]/g) || []).length
        : (text.match(/[a-zA-Z]+/g) || []).length;

    const errorCount = errors.filter(e => e.type === 'error').length;
    const warningCount = errors.filter(e => e.type === 'warning').length;

    let score = 100 - (errorCount * 10) - (warningCount * 5);
    score = Math.max(0, Math.min(100, score));

    return {
        errors,
        highlightedText,
        score,
        errorCount,
        warningCount,
        suggestionCount: errors.length
    };
}

function displayResults(result) {
    document.getElementById('resultSection').style.display = 'block';

    // Summary
    document.getElementById('errorCount').textContent = result.errorCount + result.warningCount;
    document.getElementById('suggestionCount').textContent = result.suggestionCount;

    const scoreEl = document.getElementById('scoreValue');
    scoreEl.textContent = result.score;
    scoreEl.className = 'score-value';
    if (result.score < 60) scoreEl.classList.add('low');
    else if (result.score < 80) scoreEl.classList.add('medium');

    // Highlighted text
    document.getElementById('correctedText').innerHTML = result.highlightedText;

    // Error list
    const errorsSection = document.getElementById('errorsSection');
    if (result.errors.length > 0) {
        errorsSection.style.display = 'block';
        const errorsHTML = result.errors.map(error => `
            <div class="error-item ${error.type}">
                <div class="error-header">
                    <span class="error-type ${error.type}">${t(error.type)}</span>
                </div>
                <div class="error-original">
                    <del>${error.original}</del>
                </div>
                <div class="error-suggestion">
                    <span class="suggestion-arrow">→</span>
                    <span class="suggestion-text">${error.suggestion}</span>
                </div>
                <div class="error-explanation">${error.explanation}</div>
            </div>
        `).join('');
        document.getElementById('errorsList').innerHTML = errorsHTML;
    } else {
        errorsSection.style.display = 'none';
    }
}

function init() {
    setLanguage(navigator.language.startsWith('zh') ? 'zh-TW' : 'en');

    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    document.getElementById('checkBtn').addEventListener('click', () => {
        const text = document.getElementById('textInput').value.trim();
        if (!text) return;

        const result = checkGrammar(text);
        displayResults(result);
    });

    document.querySelectorAll('.example-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('textInput').value = btn.dataset.text;
            document.getElementById('checkBtn').click();
        });
    });
}

init();
