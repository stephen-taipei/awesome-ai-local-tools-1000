/**
 * Code Translator - Tool #154
 */
const translations = {
    'javascript-python': [
        { from: /function\s+(\w+)\s*\(([^)]*)\)\s*\{/g, to: 'def $1($2):' },
        { from: /const\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>\s*\{/g, to: 'def $1($2):' },
        { from: /const\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>\s*([^;{]+);?/g, to: 'def $1($2):\n    return $3' },
        { from: /\bconst\s+/g, to: '' },
        { from: /\blet\s+/g, to: '' },
        { from: /\bvar\s+/g, to: '' },
        { from: /\}/g, to: '' },
        { from: /\{/g, to: '' },
        { from: /;$/gm, to: '' },
        { from: /console\.log\(/g, to: 'print(' },
        { from: /===|==/g, to: '==' },
        { from: /!==|!=/g, to: '!=' },
        { from: /\|\|/g, to: ' or ' },
        { from: /&&/g, to: ' and ' },
        { from: /!/g, to: 'not ' },
        { from: /true/g, to: 'True' },
        { from: /false/g, to: 'False' },
        { from: /null|undefined/g, to: 'None' },
        { from: /\.length/g, to: '.__len__()' },
        { from: /\.push\(/g, to: '.append(' },
        { from: /\.forEach\(\s*\((\w+)\)\s*=>\s*/g, to: 'for $1 in ' },
        { from: /for\s*\(\s*let\s+(\w+)\s*=\s*0;\s*\1\s*<\s*([^;]+);\s*\1\+\+\s*\)/g, to: 'for $1 in range($2)' },
        { from: /`([^`]*)\$\{([^}]+)\}([^`]*)`/g, to: "f'$1{$2}$3'" },
        { from: /return\s+/g, to: 'return ' },
        { from: /else\s+if/g, to: 'elif' },
        { from: /if\s*\(([^)]+)\)/g, to: 'if $1:' },
        { from: /else/g, to: 'else:' },
        { from: /while\s*\(([^)]+)\)/g, to: 'while $1:' },
        { from: /try\s*/g, to: 'try:' },
        { from: /catch\s*\(\s*(\w+)\s*\)/g, to: 'except Exception as $1:' },
        { from: /throw\s+new\s+Error\(/g, to: 'raise Exception(' },
        { from: /new\s+(\w+)\(/g, to: '$1(' },
    ],
    'python-javascript': [
        { from: /def\s+(\w+)\s*\(([^)]*)\):/g, to: 'function $1($2) {' },
        { from: /print\(/g, to: 'console.log(' },
        { from: /\bTrue\b/g, to: 'true' },
        { from: /\bFalse\b/g, to: 'false' },
        { from: /\bNone\b/g, to: 'null' },
        { from: /\bor\b/g, to: '||' },
        { from: /\band\b/g, to: '&&' },
        { from: /\bnot\s+/g, to: '!' },
        { from: /\.append\(/g, to: '.push(' },
        { from: /for\s+(\w+)\s+in\s+range\(([^)]+)\):/g, to: 'for (let $1 = 0; $1 < $2; $1++) {' },
        { from: /for\s+(\w+)\s+in\s+(\w+):/g, to: 'for (const $1 of $2) {' },
        { from: /f['"]([^'"]*)\{([^}]+)\}([^'"]*)['"]/g, to: '`$1${$2}$3`' },
        { from: /elif\s+([^:]+):/g, to: '} else if ($1) {' },
        { from: /if\s+([^:]+):/g, to: 'if ($1) {' },
        { from: /else:/g, to: '} else {' },
        { from: /while\s+([^:]+):/g, to: 'while ($1) {' },
        { from: /try:/g, to: 'try {' },
        { from: /except\s+Exception\s+as\s+(\w+):/g, to: '} catch ($1) {' },
        { from: /except:/g, to: '} catch (error) {' },
        { from: /raise\s+Exception\(/g, to: 'throw new Error(' },
        { from: /class\s+(\w+):/g, to: 'class $1 {' },
        { from: /def\s+__init__\s*\(self,?\s*([^)]*)\):/g, to: 'constructor($1) {' },
        { from: /self\./g, to: 'this.' },
    ],
    'javascript-typescript': [
        { from: /function\s+(\w+)\s*\(([^)]*)\)/g, to: 'function $1($2): void' },
        { from: /const\s+(\w+)\s*=/g, to: 'const $1: any =' },
        { from: /let\s+(\w+)\s*=/g, to: 'let $1: any =' },
        { from: /\(([^)]*)\)\s*=>/g, to: '($1): any =>' },
    ],
    'typescript-javascript': [
        { from: /:\s*\w+(\[\])?(\s*[=,)\{])/g, to: '$2' },
        { from: /<\w+>/g, to: '' },
        { from: /interface\s+\w+\s*\{[^}]*\}/g, to: '' },
        { from: /type\s+\w+\s*=\s*[^;]+;/g, to: '' },
        { from: /\bprivate\s+/g, to: '' },
        { from: /\bpublic\s+/g, to: '' },
        { from: /\bprotected\s+/g, to: '' },
        { from: /\breadonly\s+/g, to: '' },
        { from: /as\s+\w+/g, to: '' },
    ],
    'javascript-java': [
        { from: /function\s+(\w+)\s*\(([^)]*)\)\s*\{/g, to: 'public void $1($2) {' },
        { from: /const\s+(\w+)\s*=\s*([^;]+);/g, to: 'Object $1 = $2;' },
        { from: /let\s+(\w+)\s*=\s*([^;]+);/g, to: 'Object $1 = $2;' },
        { from: /console\.log\(/g, to: 'System.out.println(' },
        { from: /true/g, to: 'true' },
        { from: /false/g, to: 'false' },
        { from: /null/g, to: 'null' },
        { from: /\.length/g, to: '.length()' },
        { from: /\.push\(/g, to: '.add(' },
        { from: /`([^`]*)\$\{([^}]+)\}([^`]*)`/g, to: '"$1" + $2 + "$3"' },
    ],
    'java-javascript': [
        { from: /public\s+\w+\s+(\w+)\s*\(([^)]*)\)\s*\{/g, to: 'function $1($2) {' },
        { from: /private\s+\w+\s+(\w+)\s*\(([^)]*)\)\s*\{/g, to: 'function $1($2) {' },
        { from: /System\.out\.println\(/g, to: 'console.log(' },
        { from: /\bString\s+/g, to: 'let ' },
        { from: /\bint\s+/g, to: 'let ' },
        { from: /\bdouble\s+/g, to: 'let ' },
        { from: /\bboolean\s+/g, to: 'let ' },
        { from: /\bObject\s+/g, to: 'let ' },
        { from: /\.length\(\)/g, to: '.length' },
        { from: /\.add\(/g, to: '.push(' },
    ],
    'python-typescript': [
        { from: /def\s+(\w+)\s*\(([^)]*)\):/g, to: 'function $1($2): void {' },
        { from: /print\(/g, to: 'console.log(' },
        { from: /\bTrue\b/g, to: 'true' },
        { from: /\bFalse\b/g, to: 'false' },
        { from: /\bNone\b/g, to: 'null' },
    ],
    'typescript-python': [
        { from: /function\s+(\w+)\s*\([^)]*\):\s*\w+\s*\{/g, to: 'def $1():' },
        { from: /console\.log\(/g, to: 'print(' },
        { from: /\btrue\b/g, to: 'True' },
        { from: /\bfalse\b/g, to: 'False' },
        { from: /\bnull\b/g, to: 'None' },
    ],
    'python-java': [
        { from: /def\s+(\w+)\s*\(([^)]*)\):/g, to: 'public void $1($2) {' },
        { from: /print\(/g, to: 'System.out.println(' },
        { from: /\bTrue\b/g, to: 'true' },
        { from: /\bFalse\b/g, to: 'false' },
        { from: /\bNone\b/g, to: 'null' },
    ],
    'java-python': [
        { from: /public\s+\w+\s+(\w+)\s*\(([^)]*)\)\s*\{/g, to: 'def $1($2):' },
        { from: /System\.out\.println\(/g, to: 'print(' },
        { from: /\btrue\b/g, to: 'True' },
        { from: /\bfalse\b/g, to: 'False' },
        { from: /\bnull\b/g, to: 'None' },
    ],
    'java-typescript': [
        { from: /public\s+\w+\s+(\w+)\s*\(([^)]*)\)\s*\{/g, to: 'function $1($2): void {' },
        { from: /System\.out\.println\(/g, to: 'console.log(' },
        { from: /\bString\s+/g, to: 'let ' },
        { from: /\bint\s+/g, to: 'let ' },
    ],
    'typescript-java': [
        { from: /function\s+(\w+)\s*\([^)]*\):\s*\w+\s*\{/g, to: 'public void $1() {' },
        { from: /console\.log\(/g, to: 'System.out.println(' },
    ],
};

function translateCode(code, sourceLang, targetLang) {
    if (sourceLang === targetLang) return code;

    const key = `${sourceLang}-${targetLang}`;
    const rules = translations[key];

    if (!rules) {
        return `// Translation from ${sourceLang} to ${targetLang} not fully supported\n// Basic syntax adjustments applied\n\n${code}`;
    }

    let result = code;
    for (const rule of rules) {
        result = result.replace(rule.from, rule.to);
    }

    // Clean up extra whitespace
    result = result.replace(/\n{3,}/g, '\n\n').trim();

    // Add closing braces for Python -> other languages
    if (sourceLang === 'python' && targetLang !== 'python') {
        const lines = result.split('\n');
        const indentStack = [];
        const output = [];

        for (const line of lines) {
            const indent = line.match(/^\s*/)[0].length;
            while (indentStack.length > 0 && indentStack[indentStack.length - 1] >= indent) {
                indentStack.pop();
                output.push(' '.repeat(indent) + '}');
            }
            output.push(line);
            if (line.trim().endsWith('{')) {
                indentStack.push(indent);
            }
        }
        while (indentStack.length > 0) {
            indentStack.pop();
            output.push('}');
        }
        result = output.join('\n');
    }

    return result;
}

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    document.getElementById('swapBtn').addEventListener('click', () => {
        const source = document.getElementById('sourceLang');
        const target = document.getElementById('targetLang');
        const temp = source.value;
        source.value = target.value;
        target.value = temp;
    });

    document.getElementById('translateBtn').addEventListener('click', () => {
        const sourceCode = document.getElementById('sourceCode').value;
        const sourceLang = document.getElementById('sourceLang').value;
        const targetLang = document.getElementById('targetLang').value;

        if (!sourceCode.trim()) return;

        const result = translateCode(sourceCode, sourceLang, targetLang);
        document.getElementById('targetCode').textContent = result;
    });

    document.getElementById('copyBtn').addEventListener('click', () => {
        const code = document.getElementById('targetCode').textContent;
        navigator.clipboard.writeText(code).then(() => {
            document.getElementById('copyBtn').textContent = '已複製!';
            setTimeout(() => document.getElementById('copyBtn').textContent = '複製', 2000);
        });
    });

    document.querySelectorAll('.example-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('sourceLang').value = btn.dataset.source;
            document.getElementById('targetLang').value = btn.dataset.target;
            document.getElementById('sourceCode').value = btn.dataset.code;
            document.getElementById('translateBtn').click();
        });
    });
}
init();
