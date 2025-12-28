/**
 * Code Formatter - Tool #157
 */
function getIndent(size) {
    if (size === 'tab') return '\t';
    return ' '.repeat(parseInt(size));
}

function formatJSON(code, indent) {
    try {
        const obj = JSON.parse(code);
        return JSON.stringify(obj, null, indent === 'tab' ? '\t' : parseInt(indent));
    } catch (e) {
        return '// JSON 解析錯誤: ' + e.message;
    }
}

function formatJS(code, indent) {
    const ind = getIndent(indent);
    let result = '';
    let level = 0;
    let inString = false;
    let stringChar = '';
    let i = 0;

    // Simple tokenization and formatting
    while (i < code.length) {
        const char = code[i];
        const nextChar = code[i + 1] || '';

        // Handle strings
        if ((char === '"' || char === "'" || char === '`') && code[i - 1] !== '\\') {
            if (!inString) {
                inString = true;
                stringChar = char;
            } else if (char === stringChar) {
                inString = false;
            }
            result += char;
            i++;
            continue;
        }

        if (inString) {
            result += char;
            i++;
            continue;
        }

        // Handle brackets
        if (char === '{' || char === '[') {
            result += char + '\n' + ind.repeat(++level);
            i++;
            continue;
        }

        if (char === '}' || char === ']') {
            result = result.trimEnd() + '\n' + ind.repeat(--level) + char;
            i++;
            continue;
        }

        // Handle semicolons
        if (char === ';') {
            result += ';\n' + ind.repeat(level);
            i++;
            continue;
        }

        // Handle commas
        if (char === ',') {
            result += ',\n' + ind.repeat(level);
            i++;
            continue;
        }

        // Skip extra whitespace
        if (/\s/.test(char)) {
            if (result.length > 0 && !/\s/.test(result[result.length - 1])) {
                result += ' ';
            }
            i++;
            continue;
        }

        result += char;
        i++;
    }

    // Clean up
    result = result.replace(/\n\s*\n/g, '\n');
    result = result.replace(/\{\s*\n\s*\}/g, '{}');
    result = result.replace(/\[\s*\n\s*\]/g, '[]');

    return result.trim();
}

function formatHTML(code, indent) {
    const ind = getIndent(indent);
    let result = '';
    let level = 0;

    // Simple HTML formatting
    const tokens = code.split(/(<[^>]+>)/g).filter(t => t.trim());

    for (const token of tokens) {
        if (token.startsWith('</')) {
            level = Math.max(0, level - 1);
            result += ind.repeat(level) + token + '\n';
        } else if (token.startsWith('<') && !token.endsWith('/>') && !token.startsWith('<!')) {
            result += ind.repeat(level) + token + '\n';
            if (!/<(br|hr|img|input|meta|link|area|base|col|embed|param|source|track|wbr)/i.test(token)) {
                level++;
            }
        } else if (token.startsWith('<')) {
            result += ind.repeat(level) + token + '\n';
        } else {
            const text = token.trim();
            if (text) {
                result += ind.repeat(level) + text + '\n';
            }
        }
    }

    return result.trim();
}

function formatCSS(code, indent) {
    const ind = getIndent(indent);
    let result = code;

    // Format CSS
    result = result.replace(/\s*\{\s*/g, ' {\n' + ind);
    result = result.replace(/\s*\}\s*/g, '\n}\n\n');
    result = result.replace(/;\s*/g, ';\n' + ind);
    result = result.replace(new RegExp(ind + '}', 'g'), '}');
    result = result.replace(/\n\n+/g, '\n\n');

    return result.trim();
}

function minifyJS(code) {
    let result = code;
    // Remove comments
    result = result.replace(/\/\*[\s\S]*?\*\//g, '');
    result = result.replace(/\/\/[^\n]*/g, '');
    // Remove whitespace
    result = result.replace(/\s+/g, ' ');
    result = result.replace(/\s*([{}\[\]();,:])\s*/g, '$1');
    result = result.replace(/\s*([=+\-*/<>!&|])\s*/g, '$1');
    return result.trim();
}

function minifyJSON(code) {
    try {
        return JSON.stringify(JSON.parse(code));
    } catch (e) {
        return code;
    }
}

function minifyCSS(code) {
    let result = code;
    result = result.replace(/\/\*[\s\S]*?\*\//g, '');
    result = result.replace(/\s+/g, ' ');
    result = result.replace(/\s*([{};:,])\s*/g, '$1');
    return result.trim();
}

function minifyHTML(code) {
    let result = code;
    result = result.replace(/<!--[\s\S]*?-->/g, '');
    result = result.replace(/>\s+</g, '><');
    result = result.replace(/\s+/g, ' ');
    return result.trim();
}

function formatCode(code, lang, indent) {
    switch (lang) {
        case 'json': return formatJSON(code, indent);
        case 'javascript': return formatJS(code, indent);
        case 'html': return formatHTML(code, indent);
        case 'css': return formatCSS(code, indent);
        default: return code;
    }
}

function minifyCode(code, lang) {
    switch (lang) {
        case 'json': return minifyJSON(code);
        case 'javascript': return minifyJS(code);
        case 'html': return minifyHTML(code);
        case 'css': return minifyCSS(code);
        default: return code.replace(/\s+/g, ' ').trim();
    }
}

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    document.getElementById('formatBtn').addEventListener('click', () => {
        const code = document.getElementById('inputCode').value;
        const lang = document.getElementById('langSelect').value;
        const indent = document.getElementById('indentSelect').value;

        if (!code.trim()) return;

        const result = formatCode(code, lang, indent);
        document.getElementById('outputCode').textContent = result;
    });

    document.getElementById('minifyBtn').addEventListener('click', () => {
        const code = document.getElementById('inputCode').value;
        const lang = document.getElementById('langSelect').value;

        if (!code.trim()) return;

        const result = minifyCode(code, lang);
        document.getElementById('outputCode').textContent = result;
    });

    document.getElementById('copyBtn').addEventListener('click', () => {
        const code = document.getElementById('outputCode').textContent;
        navigator.clipboard.writeText(code).then(() => {
            document.getElementById('copyBtn').textContent = '已複製!';
            setTimeout(() => document.getElementById('copyBtn').textContent = '複製', 2000);
        });
    });
}
init();
