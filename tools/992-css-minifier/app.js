// CSS Minifier - Tool #992
// Minify and beautify CSS locally

(function() {
    'use strict';

    // DOM Elements
    const cssInput = document.getElementById('css-input');
    const cssOutput = document.getElementById('css-output');
    const processBtn = document.getElementById('process-btn');
    const pasteBtn = document.getElementById('paste-btn');
    const sampleBtn = document.getElementById('sample-btn');
    const uploadBtn = document.getElementById('upload-btn');
    const fileInput = document.getElementById('file-input');
    const clearBtn = document.getElementById('clear-btn');
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');

    const modeSelect = document.getElementById('mode-select');
    const minifyOptions = document.getElementById('minify-options');
    const beautifyOptions = document.getElementById('beautify-options');
    const removeComments = document.getElementById('remove-comments');
    const removeEmpty = document.getElementById('remove-empty');
    const shortenColors = document.getElementById('shorten-colors');
    const shortenZeros = document.getElementById('shorten-zeros');
    const indentSize = document.getElementById('indent-size');

    const stats = document.getElementById('stats');
    const statOriginal = document.getElementById('stat-original');
    const statOutput = document.getElementById('stat-output');
    const statSaved = document.getElementById('stat-saved');
    const statRules = document.getElementById('stat-rules');

    // Sample CSS
    const sampleCSS = `/* Main Styles */
body {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    margin: 0;
    padding: 0;
    background-color: #ffffff;
    color: #333333;
    line-height: 1.6;
}

/* Header */
.header {
    background-color: #4f46e5;
    padding: 20px 40px;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
}

.header h1 {
    margin: 0;
    padding: 0;
    color: #ffffff;
    font-size: 24px;
    font-weight: 600;
}

/* Navigation */
.nav {
    display: flex;
    gap: 20px;
}

.nav a {
    color: #ffffff;
    text-decoration: none;
    opacity: 0.8;
    transition: opacity 0.2s ease;
}

.nav a:hover {
    opacity: 1.0;
}

/* Container */
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0px 20px;
}

/* Card */
.card {
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
    padding: 24px;
    margin-bottom: 20px;
}

/* Empty rule - will be removed */
.empty {
}

/* Button */
.button {
    display: inline-block;
    padding: 10px 20px;
    background-color: #4f46e5;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s ease;
}

.button:hover {
    background-color: #4338ca;
}

/* Footer */
.footer {
    background-color: #1f2937;
    color: #9ca3af;
    padding: 40px 0px;
    margin-top: 60px;
}`;

    let outputCSS = '';

    // ========== Event Listeners ==========

    modeSelect.addEventListener('change', () => {
        const isMinify = modeSelect.value === 'minify';
        minifyOptions.classList.toggle('hidden', !isMinify);
        beautifyOptions.classList.toggle('hidden', isMinify);
    });

    processBtn.addEventListener('click', processCSS);

    pasteBtn.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            cssInput.value = text;
            showNotification('Pasted', 'success');
        } catch (e) {
            showNotification('Failed to paste', 'error');
        }
    });

    sampleBtn.addEventListener('click', () => {
        cssInput.value = sampleCSS;
        showNotification('Sample loaded', 'success');
    });

    uploadBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                cssInput.value = ev.target.result;
                showNotification('File loaded', 'success');
            };
            reader.readAsText(file);
        }
    });

    clearBtn.addEventListener('click', () => {
        cssInput.value = '';
        cssOutput.innerHTML = '<code class="text-gray-400">Output will appear here...</code>';
        stats.classList.add('hidden');
        outputCSS = '';
        showNotification('Cleared', 'success');
    });

    copyBtn.addEventListener('click', async () => {
        if (!outputCSS) {
            showNotification('Nothing to copy', 'warning');
            return;
        }
        try {
            await navigator.clipboard.writeText(outputCSS);
            showNotification('Copied', 'success');
        } catch (e) {
            showNotification('Failed to copy', 'error');
        }
    });

    downloadBtn.addEventListener('click', () => {
        if (!outputCSS) {
            showNotification('Nothing to download', 'warning');
            return;
        }
        const suffix = modeSelect.value === 'minify' ? '.min' : '';
        const blob = new Blob([outputCSS], { type: 'text/css' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `styles${suffix}.css`;
        a.click();
        URL.revokeObjectURL(url);
        showNotification('Downloaded', 'success');
    });

    // ========== Process CSS ==========

    function processCSS() {
        const input = cssInput.value.trim();
        if (!input) {
            showNotification('Please enter CSS', 'warning');
            return;
        }

        try {
            if (modeSelect.value === 'minify') {
                outputCSS = minifyCSS(input);
            } else {
                outputCSS = beautifyCSS(input);
            }

            // Display with syntax highlighting
            cssOutput.innerHTML = Prism.highlight(outputCSS, Prism.languages.css, 'css');

            // Update stats
            updateStats(input, outputCSS);

            showNotification(modeSelect.value === 'minify' ? 'Minified' : 'Beautified', 'success');
        } catch (e) {
            showNotification('Error: ' + e.message, 'error');
        }
    }

    function minifyCSS(css) {
        let result = css;

        // Remove comments if enabled
        if (removeComments.checked) {
            result = result.replace(/\/\*[\s\S]*?\*\//g, '');
        }

        // Remove whitespace around key characters
        result = result
            .replace(/\s+/g, ' ')
            .replace(/\s*{\s*/g, '{')
            .replace(/\s*}\s*/g, '}')
            .replace(/\s*;\s*/g, ';')
            .replace(/\s*:\s*/g, ':')
            .replace(/\s*,\s*/g, ',')
            .replace(/;\}/g, '}');

        // Remove last semicolon before closing brace
        result = result.replace(/;}/g, '}');

        // Remove empty rules if enabled
        if (removeEmpty.checked) {
            result = result.replace(/[^{}]+\{\s*\}/g, '');
        }

        // Shorten colors if enabled
        if (shortenColors.checked) {
            // #ffffff -> #fff
            result = result.replace(/#([0-9a-fA-F])\1([0-9a-fA-F])\2([0-9a-fA-F])\3/g, '#$1$2$3');
        }

        // Shorten zeros if enabled
        if (shortenZeros.checked) {
            // 0.5 -> .5
            result = result.replace(/(:|\s)0+\.(\d+)/g, '$1.$2');
            // 0px -> 0
            result = result.replace(/(:|\s)0(px|em|rem|%|pt|pc|in|cm|mm|ex|ch|vw|vh|vmin|vmax)/g, '$10');
            // Remove leading zeros: rgba(0, 0, 0, 0.5) -> rgba(0,0,0,.5)
        }

        // Trim
        result = result.trim();

        return result;
    }

    function beautifyCSS(css) {
        const indent = getIndent();
        let result = css;

        // First, normalize (minify)
        result = result
            .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments for processing
            .replace(/\s+/g, ' ')
            .replace(/\s*{\s*/g, '{')
            .replace(/\s*}\s*/g, '}')
            .replace(/\s*;\s*/g, ';')
            .replace(/\s*:\s*/g, ':')
            .replace(/\s*,\s*/g, ', ')
            .trim();

        // Add newlines and indentation
        let formatted = '';
        let indentLevel = 0;
        let inMedia = false;

        for (let i = 0; i < result.length; i++) {
            const char = result[i];

            if (char === '{') {
                formatted += ' {\n';
                indentLevel++;
                formatted += indent.repeat(indentLevel);
            } else if (char === '}') {
                indentLevel--;
                formatted = formatted.trimEnd();
                formatted += '\n' + indent.repeat(indentLevel) + '}\n';
                if (indentLevel === 0) {
                    formatted += '\n';
                } else {
                    formatted += indent.repeat(indentLevel);
                }
            } else if (char === ';') {
                formatted += ';\n' + indent.repeat(indentLevel);
            } else {
                formatted += char;
            }
        }

        // Clean up extra whitespace
        formatted = formatted
            .replace(/\n\s*\n\s*\n/g, '\n\n')
            .replace(/{\s+}/g, '{}')
            .replace(/\n\s+\n/g, '\n\n')
            .trim();

        return formatted;
    }

    function getIndent() {
        const value = indentSize.value;
        if (value === 'tab') return '\t';
        return ' '.repeat(parseInt(value));
    }

    function updateStats(original, output) {
        stats.classList.remove('hidden');

        const originalSize = new Blob([original]).size;
        const outputSize = new Blob([output]).size;
        const change = ((outputSize - originalSize) / originalSize * 100).toFixed(1);

        statOriginal.textContent = formatBytes(originalSize);
        statOutput.textContent = formatBytes(outputSize);

        if (change < 0) {
            statSaved.textContent = `${Math.abs(change)}% smaller`;
            statSaved.className = 'text-2xl font-bold text-green-600';
        } else if (change > 0) {
            statSaved.textContent = `${change}% larger`;
            statSaved.className = 'text-2xl font-bold text-red-600';
        } else {
            statSaved.textContent = 'Same size';
            statSaved.className = 'text-2xl font-bold text-gray-600';
        }

        // Count rules
        const ruleCount = (output.match(/\{/g) || []).length;
        statRules.textContent = ruleCount;
    }

    function formatBytes(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    // ========== Utility ==========

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

})();
