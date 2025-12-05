// Code Formatter - Tool #981
// Multi-language code formatter running entirely in the browser

(function() {
    'use strict';

    // DOM Elements
    const inputCode = document.getElementById('input-code');
    const outputCode = document.getElementById('output-code');
    const formatBtn = document.getElementById('format-btn');
    const copyBtn = document.getElementById('copy-btn');
    const pasteBtn = document.getElementById('paste-btn');
    const clearBtn = document.getElementById('clear-btn');
    const languageBtns = document.querySelectorAll('.language-btn');
    const indentSize = document.getElementById('indent-size');
    const quoteStyle = document.getElementById('quote-style');
    const semicolons = document.getElementById('semicolons');
    const trailingComma = document.getElementById('trailing-comma');

    let currentLanguage = 'javascript';

    // Language button handling
    languageBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            languageBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentLanguage = btn.dataset.lang;
            updateOutputLanguage();
            if (inputCode.value.trim()) {
                formatCode();
            }
        });
    });

    // Update output code highlighting class
    function updateOutputLanguage() {
        const langClass = currentLanguage === 'html' ? 'markup' : currentLanguage;
        outputCode.className = `language-${langClass} p-4 block`;
    }

    // Get formatting options
    function getOptions() {
        const indent = indentSize.value;
        return {
            indent_size: indent === 'tab' ? 1 : parseInt(indent),
            indent_char: indent === 'tab' ? '\t' : ' ',
            indent_with_tabs: indent === 'tab',
            end_with_newline: true,
            preserve_newlines: true,
            max_preserve_newlines: 2,
            wrap_line_length: 0,
            brace_style: 'collapse,preserve-inline',
            // JavaScript/TypeScript specific
            space_after_anon_function: true,
            space_after_named_function: false,
            jslint_happy: false,
            // HTML specific
            indent_inner_html: true,
            indent_handlebars: true,
            extra_liners: ['head', 'body', '/html'],
            // CSS specific
            selector_separator_newline: true,
            newline_between_rules: true
        };
    }

    // Format JSON with custom handling
    function formatJSON(code) {
        try {
            const parsed = JSON.parse(code);
            const indent = indentSize.value;
            const indentStr = indent === 'tab' ? '\t' : ' '.repeat(parseInt(indent));
            return JSON.stringify(parsed, null, indentStr);
        } catch (e) {
            throw new Error('Invalid JSON: ' + e.message);
        }
    }

    // Format SQL (basic formatting)
    function formatSQL(code) {
        const keywords = [
            'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'INSERT', 'INTO', 'VALUES',
            'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE', 'DROP', 'ALTER',
            'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'ON', 'GROUP BY',
            'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'AS', 'DISTINCT',
            'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
            'NULL', 'NOT', 'IN', 'LIKE', 'BETWEEN', 'EXISTS', 'PRIMARY KEY',
            'FOREIGN KEY', 'REFERENCES', 'INDEX', 'UNIQUE', 'DEFAULT', 'AUTO_INCREMENT'
        ];

        const indent = indentSize.value === 'tab' ? '\t' : ' '.repeat(parseInt(indentSize.value));

        // Normalize whitespace
        let formatted = code.replace(/\s+/g, ' ').trim();

        // Uppercase keywords
        keywords.forEach(keyword => {
            const regex = new RegExp('\\b' + keyword.replace(' ', '\\s+') + '\\b', 'gi');
            formatted = formatted.replace(regex, keyword);
        });

        // Add newlines before major keywords
        const newlineKeywords = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'JOIN', 'LEFT JOIN',
            'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN', 'GROUP BY', 'ORDER BY', 'HAVING',
            'LIMIT', 'UNION', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE'];

        newlineKeywords.forEach(keyword => {
            const regex = new RegExp('\\s+(' + keyword + ')\\b', 'g');
            formatted = formatted.replace(regex, '\n$1');
        });

        // Indent sub-clauses
        formatted = formatted.split('\n').map((line, index) => {
            const trimmed = line.trim();
            if (index === 0) return trimmed;
            if (/^(AND|OR|ON|SET|VALUES)/.test(trimmed)) {
                return indent + trimmed;
            }
            return trimmed;
        }).join('\n');

        return formatted;
    }

    // Apply quote style transformation for JS/TS
    function applyQuoteStyle(code) {
        const style = quoteStyle.value;
        if (style === 'single') {
            // Convert double quotes to single (avoiding escaped quotes and template literals)
            return code.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, (match, content) => {
                // Don't convert if it contains unescaped single quotes
                if (content.includes("'") && !content.includes("\\'")) {
                    return match;
                }
                return "'" + content.replace(/\\"/g, '"').replace(/'/g, "\\'") + "'";
            });
        } else {
            // Convert single quotes to double
            return code.replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, (match, content) => {
                if (content.includes('"') && !content.includes('\\"')) {
                    return match;
                }
                return '"' + content.replace(/\\'/g, "'").replace(/"/g, '\\"') + '"';
            });
        }
    }

    // Apply semicolon rules for JS/TS
    function applySemicolonRules(code, addSemicolons) {
        if (addSemicolons) {
            // Add semicolons where missing (simplified)
            const lines = code.split('\n');
            return lines.map(line => {
                const trimmed = line.trimEnd();
                if (!trimmed) return line;
                // Skip lines that shouldn't have semicolons
                if (/[{},;:\[\]]$/.test(trimmed) ||
                    /^(if|else|for|while|switch|try|catch|finally|function|class|\/\/|\/\*|\*)/.test(trimmed.trim()) ||
                    /=>$/.test(trimmed)) {
                    return line;
                }
                // Add semicolon if missing
                if (!/;$/.test(trimmed) && /[a-zA-Z0-9_\)\]\"\'\`]$/.test(trimmed)) {
                    return trimmed + ';';
                }
                return line;
            }).join('\n');
        }
        return code;
    }

    // Main format function
    function formatCode() {
        const code = inputCode.value;
        if (!code.trim()) {
            outputCode.textContent = '// Formatted code will appear here...';
            outputCode.className = 'language-javascript p-4 block text-gray-400';
            return;
        }

        try {
            let formatted;
            const options = getOptions();

            switch (currentLanguage) {
                case 'javascript':
                case 'typescript':
                    formatted = js_beautify(code, options);
                    formatted = applyQuoteStyle(formatted);
                    formatted = applySemicolonRules(formatted, semicolons.checked);
                    break;
                case 'html':
                    formatted = html_beautify(code, options);
                    break;
                case 'css':
                    formatted = css_beautify(code, options);
                    break;
                case 'json':
                    formatted = formatJSON(code);
                    break;
                case 'sql':
                    formatted = formatSQL(code);
                    break;
                default:
                    formatted = js_beautify(code, options);
            }

            // Apply trailing comma for JS/TS/JSON
            if (trailingComma.checked && ['javascript', 'typescript', 'json'].includes(currentLanguage)) {
                // Add trailing commas to arrays and objects (simplified)
                formatted = formatted.replace(/([^\s,])\n(\s*[\]\}])/g, '$1,\n$2');
            }

            outputCode.textContent = formatted;
            updateOutputLanguage();
            Prism.highlightElement(outputCode);

            showNotification('Code formatted successfully!', 'success');
        } catch (error) {
            outputCode.textContent = '// Error: ' + error.message;
            outputCode.className = 'language-javascript p-4 block text-red-400';
            showNotification('Format error: ' + error.message, 'error');
        }
    }

    // Copy to clipboard
    async function copyToClipboard() {
        const text = outputCode.textContent;
        if (!text || text.startsWith('//')) {
            showNotification('Nothing to copy', 'warning');
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            copyBtn.innerHTML = '<i class="fas fa-check mr-1"></i> Copied!';
            setTimeout(() => {
                copyBtn.innerHTML = '<i class="fas fa-copy mr-1"></i> Copy';
            }, 2000);
            showNotification('Copied to clipboard!', 'success');
        } catch (err) {
            showNotification('Failed to copy', 'error');
        }
    }

    // Paste from clipboard
    async function pasteFromClipboard() {
        try {
            const text = await navigator.clipboard.readText();
            inputCode.value = text;
            showNotification('Pasted from clipboard', 'success');
        } catch (err) {
            showNotification('Failed to paste. Please use Ctrl+V', 'warning');
        }
    }

    // Clear input
    function clearInput() {
        inputCode.value = '';
        outputCode.textContent = '// Formatted code will appear here...';
        outputCode.className = 'language-javascript p-4 block text-gray-400';
        showNotification('Cleared', 'success');
    }

    // Show notification
    function showNotification(message, type = 'info') {
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };

        const notification = document.createElement('div');
        notification.className = `fixed bottom-4 right-4 ${colors[type]} text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity duration-300`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    // Event listeners
    formatBtn.addEventListener('click', formatCode);
    copyBtn.addEventListener('click', copyToClipboard);
    pasteBtn.addEventListener('click', pasteFromClipboard);
    clearBtn.addEventListener('click', clearInput);

    // Format on Enter with Ctrl/Cmd
    inputCode.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            formatCode();
        }
    });

    // Auto-format on paste (optional, delayed)
    inputCode.addEventListener('paste', () => {
        setTimeout(() => {
            // Auto-detect language from content
            const code = inputCode.value;
            if (code.trim().startsWith('{') || code.trim().startsWith('[')) {
                try {
                    JSON.parse(code);
                    document.querySelector('[data-lang="json"]').click();
                } catch (e) {}
            } else if (/<[^>]+>/.test(code) && !/<script/.test(code)) {
                document.querySelector('[data-lang="html"]').click();
            } else if (/^(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)\b/i.test(code.trim())) {
                document.querySelector('[data-lang="sql"]').click();
            }
        }, 100);
    });

    // Sample code button (for demo)
    const sampleCodes = {
        javascript: `function calculateSum(arr){const result=arr.reduce((acc,val)=>{return acc+val},0);return result}const numbers=[1,2,3,4,5];console.log("Sum:",calculateSum(numbers));`,
        typescript: `interface User{name:string;age:number;email?:string}function greet(user:User):string{return \`Hello, \${user.name}!\`}const user:User={name:"John",age:30};console.log(greet(user));`,
        html: `<!DOCTYPE html><html><head><title>Test</title></head><body><div class="container"><h1>Hello World</h1><p>This is a test.</p></div></body></html>`,
        css: `.container{display:flex;flex-direction:column;align-items:center;padding:20px;margin:0 auto}.title{font-size:24px;color:#333;font-weight:bold}`,
        json: `{"name":"John","age":30,"city":"New York","hobbies":["reading","gaming","coding"],"address":{"street":"123 Main St","zip":"10001"}}`,
        sql: `SELECT u.id,u.name,u.email,COUNT(o.id) as order_count FROM users u LEFT JOIN orders o ON u.id=o.user_id WHERE u.active=1 AND u.created_at>'2023-01-01' GROUP BY u.id ORDER BY order_count DESC LIMIT 10`
    };

    // Add sample button to UI
    const sampleBtn = document.createElement('button');
    sampleBtn.className = 'px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors';
    sampleBtn.innerHTML = '<i class="fas fa-flask mr-1"></i> Sample';
    sampleBtn.addEventListener('click', () => {
        inputCode.value = sampleCodes[currentLanguage] || sampleCodes.javascript;
        showNotification('Sample code loaded', 'info');
    });
    document.querySelector('#paste-btn').parentElement.insertBefore(sampleBtn, document.querySelector('#paste-btn'));

})();
