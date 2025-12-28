/**
 * Bug Detector - Tool #156
 */
const bugPatterns = [
    // Syntax issues
    { pattern: /=\s*=\s*=/g, type: 'error', message: '無效的比較運算符 ===' },
    { pattern: /[^=!<>]=(?!=)/g, checkContext: true, type: 'warning', message: '可能是賦值而非比較' },
    { pattern: /\(\s*\)/g, type: 'info', message: '空的括號表達式' },

    // Common bugs
    { pattern: /if\s*\([^)]*=[^=][^)]*\)/g, type: 'warning', message: 'if 條件中可能誤用賦值運算符' },
    { pattern: /typeof\s+\w+\s*===?\s*['"]undefined['"]/g, type: 'info', message: '建議使用 === undefined 或 void 0' },
    { pattern: /\.length\s*===?\s*0/g, type: 'info', message: '可考慮使用 !array.length 簡化' },
    { pattern: /parseInt\s*\([^,)]+\)/g, type: 'warning', message: 'parseInt 缺少進制參數，建議加入 10' },
    { pattern: /isNaN\s*\(/g, type: 'warning', message: '建議使用 Number.isNaN() 更精確' },
    { pattern: /new\s+Boolean|new\s+String|new\s+Number/g, type: 'error', message: '避免使用包裝物件，直接使用原始值' },

    // Potential runtime errors
    { pattern: /\w+\.\w+\.\w+\(/g, type: 'info', message: '多層屬性訪問，注意 null/undefined 檢查' },
    { pattern: /JSON\.parse\s*\([^)]+\)(?!\s*catch)/g, type: 'warning', message: 'JSON.parse 可能拋出異常，需要 try-catch' },
    { pattern: /localStorage\./g, type: 'info', message: 'localStorage 可能在隱私模式下拋出異常' },
    { pattern: /document\.getElementById\([^)]+\)\.\w+/g, type: 'warning', message: 'getElementById 可能返回 null' },

    // Async issues
    { pattern: /async\s+function[^{]*\{[^}]*return\s+[^}]*(?!await)/g, type: 'info', message: 'async 函數中可能缺少 await' },
    { pattern: /new\s+Promise\([^)]*\)[^.]*(?!\.)/g, type: 'info', message: 'Promise 未處理，可能缺少 .then() 或 await' },
    { pattern: /\.then\([^)]*\)(?!\s*\.\s*catch)/g, type: 'warning', message: 'Promise 鏈缺少 .catch() 錯誤處理' },

    // Memory leaks
    { pattern: /addEventListener\s*\([^)]+\)(?!.*removeEventListener)/g, type: 'info', message: '添加事件監聽器，確保適時移除避免記憶體洩漏' },
    { pattern: /setInterval\s*\(/g, type: 'info', message: '使用 setInterval，確保適時清除' },

    // Security issues
    { pattern: /innerHTML\s*=\s*[^'"`\s]+/g, type: 'error', message: 'innerHTML 使用變數可能導致 XSS 攻擊' },
    { pattern: /eval\s*\(/g, type: 'error', message: 'eval() 有嚴重安全風險' },
    { pattern: /new\s+Function\s*\(/g, type: 'error', message: 'new Function() 類似 eval，有安全風險' },
    { pattern: /document\.write\s*\(/g, type: 'error', message: 'document.write 有安全與性能問題' },

    // Logic issues
    { pattern: /return\s*;\s*\S/g, type: 'warning', message: 'return 後有無法執行的程式碼' },
    { pattern: /throw\s+[^;]+;\s*\S/g, type: 'warning', message: 'throw 後有無法執行的程式碼' },
    { pattern: /switch\s*\([^)]+\)\s*\{[^}]*case[^:]+:[^}]*(?!break|return|throw)/g, type: 'warning', message: 'switch case 可能缺少 break' },
    { pattern: /\bfor\s*\([^)]*;\s*;\s*[^)]*\)/g, type: 'warning', message: '可能是無限迴圈 (空的條件)' },
    { pattern: /while\s*\(\s*true\s*\)/g, type: 'warning', message: '無限迴圈，確保有適當的退出條件' },

    // Type coercion issues
    { pattern: /\+\s*['"]['"]\s*\+/g, type: 'info', message: '空字串連接，可能是無意的類型轉換' },
    { pattern: /!\s*!/g, type: 'info', message: '雙重否定，可使用 Boolean() 更清晰' },
];

function detectBugs(code) {
    const bugs = [];
    const lines = code.split('\n');

    for (const rule of bugPatterns) {
        let match;
        const regex = new RegExp(rule.pattern.source, rule.pattern.flags);

        while ((match = regex.exec(code)) !== null) {
            // Find line number
            const beforeMatch = code.substring(0, match.index);
            const lineNumber = beforeMatch.split('\n').length;
            const lineContent = lines[lineNumber - 1]?.trim() || '';

            bugs.push({
                type: rule.type,
                message: rule.message,
                line: lineNumber,
                code: lineContent.substring(0, 60) + (lineContent.length > 60 ? '...' : '')
            });
        }
    }

    // Check for unbalanced brackets
    const brackets = { '(': 0, '[': 0, '{': 0 };
    const closingMap = { ')': '(', ']': '[', '}': '{' };

    for (let i = 0; i < code.length; i++) {
        const char = code[i];
        if (brackets[char] !== undefined) brackets[char]++;
        if (closingMap[char]) brackets[closingMap[char]]--;
    }

    if (brackets['('] !== 0) bugs.push({ type: 'error', message: '括號 () 不匹配', line: '-', code: '' });
    if (brackets['['] !== 0) bugs.push({ type: 'error', message: '方括號 [] 不匹配', line: '-', code: '' });
    if (brackets['{'] !== 0) bugs.push({ type: 'error', message: '大括號 {} 不匹配', line: '-', code: '' });

    // Sort by severity
    const severity = { error: 0, warning: 1, info: 2 };
    bugs.sort((a, b) => severity[a.type] - severity[b.type]);

    return bugs;
}

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    document.getElementById('detectBtn').addEventListener('click', () => {
        const code = document.getElementById('codeInput').value;
        if (!code.trim()) return;

        const bugs = detectBugs(code);

        document.getElementById('resultSection').style.display = 'block';

        const errorCount = bugs.filter(b => b.type === 'error').length;
        const warningCount = bugs.filter(b => b.type === 'warning').length;
        const infoCount = bugs.filter(b => b.type === 'info').length;

        document.getElementById('errorCount').textContent = errorCount;
        document.getElementById('warningCount').textContent = warningCount;
        document.getElementById('infoCount').textContent = infoCount;

        document.getElementById('bugsList').innerHTML = bugs.length > 0
            ? bugs.map(bug => `
                <div class="bug-item ${bug.type}">
                    <div class="bug-header">
                        <span class="bug-type">${bug.type === 'error' ? '錯誤' : bug.type === 'warning' ? '警告' : '提示'}</span>
                        ${bug.line !== '-' ? `<span class="bug-line">第 ${bug.line} 行</span>` : ''}
                    </div>
                    <div class="bug-message">${bug.message}</div>
                    ${bug.code ? `<div class="bug-code">${bug.code}</div>` : ''}
                </div>
            `).join('')
            : '<p style="color: var(--success-color); text-align: center; padding: 2rem;">未發現潛在問題</p>';
    });
}
init();
