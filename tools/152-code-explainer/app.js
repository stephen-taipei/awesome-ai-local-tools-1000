/**
 * Code Explainer - Tool #152
 */
const languagePatterns = {
    javascript: {
        patterns: [/\bfunction\b/, /\bconst\b/, /\blet\b/, /\bvar\b/, /=>/],
        name: 'JavaScript'
    },
    typescript: {
        patterns: [/:\s*\w+\s*[=;]/, /interface\s+\w+/, /type\s+\w+\s*=/, /<\w+>/],
        name: 'TypeScript'
    },
    python: {
        patterns: [/\bdef\s+\w+\(/, /\bclass\s+\w+:/, /\bimport\s+\w+/, /\bself\./],
        name: 'Python'
    },
    java: {
        patterns: [/\bpublic\s+class\b/, /\bprivate\s+\w+/, /\bSystem\.out\./],
        name: 'Java'
    },
    csharp: {
        patterns: [/\bnamespace\s+\w+/, /\busing\s+System/, /\bConsole\.Write/],
        name: 'C#'
    },
    go: {
        patterns: [/\bfunc\s+\w+\(/, /\bpackage\s+\w+/, /\bfmt\./],
        name: 'Go'
    },
    html: {
        patterns: [/<html/, /<div/, /<\/\w+>/],
        name: 'HTML'
    },
    css: {
        patterns: [/\{[\s\S]*?:[\s\S]*?;[\s\S]*?\}/, /@media/, /\.[\w-]+\s*\{/],
        name: 'CSS'
    },
    sql: {
        patterns: [/\bSELECT\b/i, /\bFROM\b/i, /\bWHERE\b/i, /\bINSERT\b/i],
        name: 'SQL'
    }
};

const codeElements = {
    functions: { pattern: /(?:function\s+(\w+)|(\w+)\s*=\s*(?:async\s*)?\(|def\s+(\w+)|func\s+(\w+))/g, label: '函數', type: 'function' },
    classes: { pattern: /(?:class\s+(\w+)|interface\s+(\w+)|struct\s+(\w+))/g, label: '類別', type: 'class' },
    variables: { pattern: /(?:const|let|var|val)\s+(\w+)/g, label: '變數', type: 'variable' },
    imports: { pattern: /(?:import\s+[\w{}\s,*]+from|require\(|import\s+\w+)/g, label: '匯入', type: 'import' },
    asyncOps: { pattern: /(?:async|await|Promise|\.then\(|\.catch\()/g, label: '非同步', type: 'async' },
    loops: { pattern: /(?:for\s*\(|while\s*\(|\.forEach\(|\.map\(|\.filter\()/g, label: '迴圈', type: 'loop' },
    conditions: { pattern: /(?:if\s*\(|else\s*{|switch\s*\(|case\s+)/g, label: '條件', type: 'condition' },
    errorHandling: { pattern: /(?:try\s*{|catch\s*\(|throw\s+|except\s*:)/g, label: '錯誤處理', type: 'error' }
};

function detectLanguage(code) {
    let maxScore = 0;
    let detected = 'Unknown';

    for (const [lang, info] of Object.entries(languagePatterns)) {
        const score = info.patterns.filter(p => p.test(code)).length;
        if (score > maxScore) {
            maxScore = score;
            detected = info.name;
        }
    }
    return detected;
}

function calculateComplexity(code) {
    const lines = code.split('\n').length;
    const conditions = (code.match(/if|else|switch|case|\?|&&|\|\|/g) || []).length;
    const loops = (code.match(/for|while|do|\.forEach|\.map|\.filter|\.reduce/g) || []).length;
    const nesting = Math.max(...code.split('\n').map(line => (line.match(/^\s*/)[0].length / 2)));

    const score = conditions * 2 + loops * 3 + Math.min(nesting, 5) * 2;

    if (score <= 5) return { level: '低', class: 'low' };
    if (score <= 15) return { level: '中', class: 'medium' };
    return { level: '高', class: 'high' };
}

function findElements(code) {
    const found = [];

    for (const [key, config] of Object.entries(codeElements)) {
        const matches = code.match(config.pattern);
        if (matches && matches.length > 0) {
            found.push({ label: config.label, count: matches.length, type: config.type });
        }
    }

    return found;
}

function analyzeStructure(code) {
    const structures = [];

    // Check for classes
    if (/class\s+\w+/.test(code)) {
        structures.push('定義了類別結構，使用物件導向設計模式');
    }

    // Check for functions
    const funcMatches = code.match(/(?:function\s+\w+|def\s+\w+|func\s+\w+)/g);
    if (funcMatches) {
        structures.push(`包含 ${funcMatches.length} 個函數定義`);
    }

    // Check for async patterns
    if (/async|await|Promise|\.then\(/.test(code)) {
        structures.push('使用非同步程式設計處理異步操作');
    }

    // Check for error handling
    if (/try\s*{|catch\s*\(|except/.test(code)) {
        structures.push('包含錯誤處理機制');
    }

    // Check for API calls
    if (/fetch\(|axios|http\.|request\(/.test(code)) {
        structures.push('進行 API 或網路請求');
    }

    // Check for DOM manipulation
    if (/document\.|getElementById|querySelector|addEventListener/.test(code)) {
        structures.push('操作 DOM 元素');
    }

    // Check for data structures
    if (/\[\]|Array|List|map|filter|reduce/.test(code)) {
        structures.push('使用陣列或集合資料結構');
    }

    return structures.length > 0 ? structures : ['基本程式碼結構'];
}

function generateExplanation(code, lang) {
    const explanations = [];

    // Overall purpose
    if (/function\s+\w+|def\s+\w+/.test(code)) {
        const funcName = code.match(/(?:function|def)\s+(\w+)/)?.[1] || 'unknown';
        explanations.push(`此程式碼定義了 "${funcName}" 功能`);
    }

    if (/class\s+(\w+)/.test(code)) {
        const className = code.match(/class\s+(\w+)/)?.[1];
        explanations.push(`建立了 "${className}" 類別，封裝相關的資料與方法`);
    }

    // Logic patterns
    if (/return\s+/.test(code)) {
        explanations.push('函數會回傳計算結果');
    }

    if (/console\.log|print\(|System\.out/.test(code)) {
        explanations.push('包含除錯或輸出語句');
    }

    if (/\.map\(|\.filter\(|\.reduce\(/.test(code)) {
        explanations.push('使用函數式程式設計處理資料轉換');
    }

    if (/if\s*\(.*\)\s*{/.test(code)) {
        explanations.push('根據條件執行不同邏輯分支');
    }

    if (/for\s*\(|while\s*\(|\.forEach/.test(code)) {
        explanations.push('使用迴圈遍歷資料');
    }

    return explanations.length > 0 ? explanations : ['執行基本程式邏輯'];
}

function explainCode(code) {
    const language = detectLanguage(code);
    const lineCount = code.split('\n').filter(l => l.trim()).length;
    const complexity = calculateComplexity(code);
    const elements = findElements(code);
    const structure = analyzeStructure(code);
    const explanation = generateExplanation(code, language);

    return { language, lineCount, complexity, elements, structure, explanation };
}

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    document.getElementById('explainBtn').addEventListener('click', () => {
        const code = document.getElementById('codeInput').value;
        if (!code.trim()) return;

        const result = explainCode(code);

        document.getElementById('resultSection').style.display = 'block';
        document.getElementById('langDetected').textContent = result.language;
        document.getElementById('lineCount').textContent = result.lineCount;
        document.getElementById('complexity').textContent = result.complexity.level;
        document.getElementById('complexity').className = `card-value ${result.complexity.class}`;

        document.getElementById('structureAnalysis').innerHTML = result.structure.map(s => `<p>• ${s}</p>`).join('');

        document.getElementById('elementsFound').innerHTML = result.elements.map(e =>
            `<span class="element-tag ${e.type}">${e.label} (${e.count})</span>`
        ).join('');

        document.getElementById('functionalExplanation').innerHTML = result.explanation.map(e => `<p>• ${e}</p>`).join('');
    });

    document.querySelectorAll('.example-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('codeInput').value = btn.dataset.code;
            document.getElementById('explainBtn').click();
        });
    });
}
init();
