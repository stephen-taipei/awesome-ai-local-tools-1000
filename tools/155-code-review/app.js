/**
 * Code Review - Tool #155
 */
const reviewRules = [
    { pattern: /console\.log\(/g, type: 'warning', message: '發現 console.log 語句，生產環境中應移除', deduct: 2 },
    { pattern: /debugger;/g, type: 'error', message: '發現 debugger 語句，應移除', deduct: 5 },
    { pattern: /\bvar\s+/g, type: 'warning', message: '使用 var 宣告，建議改用 const 或 let', deduct: 3 },
    { pattern: /eval\s*\(/g, type: 'error', message: '使用 eval() 有安全風險', deduct: 10 },
    { pattern: /innerHTML\s*=/g, type: 'warning', message: '使用 innerHTML 可能有 XSS 風險', deduct: 5 },
    { pattern: /document\.write\(/g, type: 'error', message: 'document.write() 不建議使用', deduct: 5 },
    { pattern: /==(?!=)/g, type: 'info', message: '使用 == 進行比較，建議使用 ===', deduct: 1 },
    { pattern: /!=(?!=)/g, type: 'info', message: '使用 != 進行比較，建議使用 !==', deduct: 1 },
    { pattern: /function\s*\([^)]*\)\s*\{[^}]{500,}\}/g, type: 'warning', message: '函數過長，建議拆分成較小的函數', deduct: 5 },
    { pattern: /if\s*\([^)]+\)\s*\{[^}]*if\s*\([^)]+\)\s*\{[^}]*if/g, type: 'warning', message: '嵌套層級過深，建議重構', deduct: 5 },
    { pattern: /TODO|FIXME|HACK|XXX/gi, type: 'info', message: '發現待辦註解，需要處理', deduct: 1 },
    { pattern: /catch\s*\(\s*\w*\s*\)\s*\{\s*\}/g, type: 'warning', message: '空的 catch 區塊，應處理錯誤', deduct: 5 },
    { pattern: /new\s+Array\(\)/g, type: 'info', message: '建議使用 [] 代替 new Array()', deduct: 1 },
    { pattern: /new\s+Object\(\)/g, type: 'info', message: '建議使用 {} 代替 new Object()', deduct: 1 },
    { pattern: /password\s*=\s*['"][^'"]+['"]/gi, type: 'error', message: '疑似硬編碼密碼，應使用環境變數', deduct: 15 },
    { pattern: /api[_-]?key\s*=\s*['"][^'"]+['"]/gi, type: 'error', message: '疑似硬編碼 API 金鑰，應使用環境變數', deduct: 15 },
    { pattern: /\.then\([^)]*\)(?!\.catch)/g, type: 'warning', message: 'Promise 缺少 catch 處理', deduct: 3 },
    { pattern: /async\s+function[^{]*\{(?![^}]*try)/g, type: 'info', message: 'async 函數建議加入 try-catch', deduct: 2 },
    { pattern: /setTimeout\s*\([^,]+,\s*0\s*\)/g, type: 'info', message: 'setTimeout 0 可考慮使用 queueMicrotask', deduct: 1 },
    { pattern: /\.bind\(this\)/g, type: 'info', message: '可考慮使用箭頭函數代替 bind', deduct: 1 },
    { pattern: /for\s*\(\s*\w+\s+in\s+/g, type: 'warning', message: 'for...in 遍歷陣列可能有問題，建議使用 for...of', deduct: 2 },
    { pattern: /\.forEach\([^)]*\)\s*;?\s*return/g, type: 'warning', message: 'forEach 中的 return 不會終止迴圈', deduct: 3 },
];

const suggestions = {
    'console': '移除所有除錯用的 console 語句',
    'var': '將 var 替換為 const 或 let，提升作用域安全性',
    'security': '審查所有使用者輸入，防止注入攻擊',
    'error': '確保所有錯誤都有適當的處理機制',
    'async': '為 async 函數添加適當的錯誤處理',
    'complexity': '重構複雜函數，提高可讀性與可維護性',
    'secrets': '將敏感資訊移至環境變數或秘密管理系統',
    'modern': '使用現代 JavaScript 語法提升程式碼品質',
};

function reviewCode(code) {
    const issues = [];
    let score = 100;

    for (const rule of reviewRules) {
        const matches = code.match(rule.pattern);
        if (matches) {
            issues.push({
                type: rule.type,
                message: rule.message,
                count: matches.length
            });
            score -= rule.deduct * Math.min(matches.length, 3);
        }
    }

    // Check code metrics
    const lines = code.split('\n');
    const lineCount = lines.length;

    if (lineCount > 200) {
        issues.push({ type: 'warning', message: `檔案有 ${lineCount} 行，考慮拆分模組`, count: 1 });
        score -= 5;
    }

    // Check for comments ratio
    const commentLines = lines.filter(l => l.trim().startsWith('//') || l.trim().startsWith('/*') || l.trim().startsWith('*')).length;
    const commentRatio = commentLines / lineCount;
    if (commentRatio < 0.05 && lineCount > 20) {
        issues.push({ type: 'info', message: '註解較少，建議添加適當的說明', count: 1 });
        score -= 2;
    }

    // Generate suggestions based on issues
    const suggestionList = [];
    const issueTypes = new Set(issues.map(i => i.message));

    if (issueTypes.size > 0) {
        if (issues.some(i => i.message.includes('console'))) suggestionList.push(suggestions.console);
        if (issues.some(i => i.message.includes('var'))) suggestionList.push(suggestions.var);
        if (issues.some(i => i.message.includes('安全') || i.message.includes('XSS'))) suggestionList.push(suggestions.security);
        if (issues.some(i => i.message.includes('catch') || i.message.includes('錯誤'))) suggestionList.push(suggestions.error);
        if (issues.some(i => i.message.includes('async'))) suggestionList.push(suggestions.async);
        if (issues.some(i => i.message.includes('嵌套') || i.message.includes('過長'))) suggestionList.push(suggestions.complexity);
        if (issues.some(i => i.message.includes('硬編碼'))) suggestionList.push(suggestions.secrets);
    }

    if (suggestionList.length === 0) {
        suggestionList.push('程式碼品質良好，繼續保持！');
    }

    return {
        score: Math.max(0, Math.min(100, score)),
        issues,
        suggestions: suggestionList
    };
}

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    document.getElementById('reviewBtn').addEventListener('click', () => {
        const code = document.getElementById('codeInput').value;
        if (!code.trim()) return;

        const result = reviewCode(code);

        document.getElementById('resultSection').style.display = 'block';

        const scoreCircle = document.getElementById('scoreCircle');
        const scoreValue = document.getElementById('scoreValue');
        scoreValue.textContent = result.score;

        scoreCircle.className = 'score-circle';
        if (result.score >= 80) scoreCircle.classList.add('good');
        else if (result.score >= 50) scoreCircle.classList.add('medium');
        else scoreCircle.classList.add('poor');

        document.getElementById('issuesList').innerHTML = result.issues.length > 0
            ? result.issues.map(issue => `
                <div class="issue-item ${issue.type}">
                    <div class="issue-type">${issue.type === 'error' ? '錯誤' : issue.type === 'warning' ? '警告' : '建議'}</div>
                    <div class="issue-message">${issue.message}${issue.count > 1 ? ` (${issue.count} 處)` : ''}</div>
                </div>
            `).join('')
            : '<p style="color: var(--success-color);">未發現問題</p>';

        document.getElementById('suggestionsList').innerHTML = result.suggestions.map(s =>
            `<div class="suggestion-item">${s}</div>`
        ).join('');
    });
}
init();
