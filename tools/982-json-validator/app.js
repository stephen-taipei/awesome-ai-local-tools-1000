// JSON Validator & Formatter - Tool #982
// Validate, format, and explore JSON data locally in the browser

(function() {
    'use strict';

    // DOM Elements
    const jsonInput = document.getElementById('json-input');
    const formattedOutput = document.getElementById('formatted-output');
    const treeOutput = document.getElementById('tree-output');
    const statsOutput = document.getElementById('stats-output');
    const validationStatus = document.getElementById('validation-status');
    const lineNumbers = document.getElementById('line-numbers');
    const charCount = document.getElementById('char-count');
    const lineCount = document.getElementById('line-count');
    const jsonPath = document.getElementById('json-path');

    const validateBtn = document.getElementById('validate-btn');
    const formatBtn = document.getElementById('format-btn');
    const minifyBtn = document.getElementById('minify-btn');
    const copyBtn = document.getElementById('copy-btn');
    const clearBtn = document.getElementById('clear-btn');
    const sampleBtn = document.getElementById('sample-btn');

    const indentSize = document.getElementById('indent-size');
    const sortKeys = document.getElementById('sort-keys');
    const autoValidate = document.getElementById('auto-validate');
    const tabBtns = document.querySelectorAll('.tab-btn');

    let currentTab = 'formatted';
    let parsedJSON = null;
    let validationTimeout = null;

    // Update line numbers
    function updateLineNumbers() {
        const lines = jsonInput.value.split('\n');
        const nums = lines.map((_, i) => i + 1).join('\n');
        lineNumbers.textContent = nums;
        charCount.textContent = jsonInput.value.length.toLocaleString();
        lineCount.textContent = lines.length;
    }

    // Sync scroll between line numbers and textarea
    jsonInput.addEventListener('scroll', () => {
        lineNumbers.style.transform = `translateY(-${jsonInput.scrollTop}px)`;
    });

    // Get indent string
    function getIndent() {
        const value = indentSize.value;
        return value === 'tab' ? '\t' : ' '.repeat(parseInt(value));
    }

    // Sort object keys recursively
    function sortObjectKeys(obj) {
        if (Array.isArray(obj)) {
            return obj.map(sortObjectKeys);
        } else if (obj !== null && typeof obj === 'object') {
            return Object.keys(obj)
                .sort()
                .reduce((acc, key) => {
                    acc[key] = sortObjectKeys(obj[key]);
                    return acc;
                }, {});
        }
        return obj;
    }

    // Validate JSON
    function validateJSON(showStatus = true) {
        const input = jsonInput.value.trim();

        if (!input) {
            if (showStatus) {
                updateStatus('info', 'Paste or type JSON to validate');
            }
            parsedJSON = null;
            return null;
        }

        try {
            const parsed = JSON.parse(input);
            parsedJSON = parsed;
            if (showStatus) {
                updateStatus('success', 'Valid JSON');
            }
            return parsed;
        } catch (e) {
            parsedJSON = null;
            if (showStatus) {
                const match = e.message.match(/position (\d+)/);
                const position = match ? parseInt(match[1]) : null;
                let errorInfo = e.message;

                if (position !== null) {
                    const lines = input.substring(0, position).split('\n');
                    const line = lines.length;
                    const col = lines[lines.length - 1].length + 1;
                    errorInfo = `Error at line ${line}, column ${col}: ${e.message}`;
                }

                updateStatus('error', errorInfo);
            }
            return null;
        }
    }

    // Update validation status
    function updateStatus(type, message) {
        const icons = {
            success: '<i class="fas fa-check-circle text-green-500"></i>',
            error: '<i class="fas fa-times-circle text-red-500"></i>',
            info: '<i class="fas fa-info-circle text-gray-400"></i>'
        };

        const bgColors = {
            success: 'bg-green-50 border-green-200',
            error: 'bg-red-50 border-red-200',
            info: 'bg-gray-100 border-gray-200'
        };

        const textColors = {
            success: 'text-green-700',
            error: 'text-red-700',
            info: 'text-gray-500'
        };

        validationStatus.className = `mb-4 p-4 rounded-lg border ${bgColors[type]}`;
        validationStatus.innerHTML = `
            <div class="flex items-center gap-2">
                ${icons[type]}
                <span class="${textColors[type]}">${message}</span>
            </div>
        `;
    }

    // Format JSON with syntax highlighting
    function formatJSON(data) {
        const indent = getIndent();
        const formatted = JSON.stringify(data, null, indent);
        return highlightJSON(formatted);
    }

    // Syntax highlight JSON
    function highlightJSON(json) {
        return json
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
            .replace(/: "([^"]*)"/g, ': <span class="json-string">"$1"</span>')
            .replace(/: (-?\d+\.?\d*)/g, ': <span class="json-number">$1</span>')
            .replace(/: (true|false)/g, ': <span class="json-boolean">$1</span>')
            .replace(/: (null)/g, ': <span class="json-null">$1</span>')
            .replace(/([{}[\]])/g, '<span class="json-bracket">$1</span>')
            .replace(/,$/gm, '<span class="json-comma">,</span>');
    }

    // Create tree view
    function createTreeView(data, path = '$', depth = 0) {
        const indent = '  '.repeat(depth);
        let html = '';

        if (Array.isArray(data)) {
            html += `<div class="tree-node" data-path="${path}">`;
            html += `<span class="tree-toggle" onclick="toggleNode(this)">-</span>`;
            html += `<span class="json-bracket">[</span>`;
            html += `<span class="text-gray-500 text-xs ml-2">${data.length} items</span>`;
            html += `<div class="tree-children ml-4">`;
            data.forEach((item, index) => {
                html += `<div class="tree-node" data-path="${path}[${index}]">`;
                html += `<span class="text-gray-500">${index}:</span> `;
                if (typeof item === 'object' && item !== null) {
                    html += createTreeView(item, `${path}[${index}]`, depth + 1);
                } else {
                    html += formatValue(item);
                }
                html += '</div>';
            });
            html += '</div>';
            html += `<span class="json-bracket">]</span></div>`;
        } else if (typeof data === 'object' && data !== null) {
            const keys = Object.keys(data);
            html += `<div class="tree-node" data-path="${path}">`;
            html += `<span class="tree-toggle" onclick="toggleNode(this)">-</span>`;
            html += `<span class="json-bracket">{</span>`;
            html += `<span class="text-gray-500 text-xs ml-2">${keys.length} keys</span>`;
            html += `<div class="tree-children ml-4">`;
            keys.forEach(key => {
                html += `<div class="tree-node" data-path="${path}.${key}">`;
                html += `<span class="json-key">"${key}"</span>: `;
                if (typeof data[key] === 'object' && data[key] !== null) {
                    html += createTreeView(data[key], `${path}.${key}`, depth + 1);
                } else {
                    html += formatValue(data[key]);
                }
                html += '</div>';
            });
            html += '</div>';
            html += `<span class="json-bracket">}</span></div>`;
        } else {
            html += formatValue(data);
        }

        return html;
    }

    // Format a single value
    function formatValue(value) {
        if (typeof value === 'string') {
            return `<span class="json-string">"${escapeHtml(value)}"</span>`;
        } else if (typeof value === 'number') {
            return `<span class="json-number">${value}</span>`;
        } else if (typeof value === 'boolean') {
            return `<span class="json-boolean">${value}</span>`;
        } else if (value === null) {
            return `<span class="json-null">null</span>`;
        }
        return String(value);
    }

    // Escape HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Toggle tree node
    window.toggleNode = function(toggle) {
        const children = toggle.parentElement.querySelector('.tree-children');
        if (children) {
            const isHidden = children.style.display === 'none';
            children.style.display = isHidden ? 'block' : 'none';
            toggle.textContent = isHidden ? '-' : '+';
        }
    };

    // Calculate JSON statistics
    function calculateStats(data, stats = { objects: 0, arrays: 0, strings: 0, numbers: 0, booleans: 0, nulls: 0, depth: 0, keys: new Set() }) {
        if (Array.isArray(data)) {
            stats.arrays++;
            data.forEach(item => calculateStats(item, stats));
        } else if (typeof data === 'object' && data !== null) {
            stats.objects++;
            Object.keys(data).forEach(key => {
                stats.keys.add(key);
                calculateStats(data[key], stats);
            });
        } else if (typeof data === 'string') {
            stats.strings++;
        } else if (typeof data === 'number') {
            stats.numbers++;
        } else if (typeof data === 'boolean') {
            stats.booleans++;
        } else if (data === null) {
            stats.nulls++;
        }
        return stats;
    }

    function getMaxDepth(data, currentDepth = 0) {
        if (Array.isArray(data)) {
            return Math.max(currentDepth, ...data.map(item => getMaxDepth(item, currentDepth + 1)));
        } else if (typeof data === 'object' && data !== null) {
            const values = Object.values(data);
            if (values.length === 0) return currentDepth;
            return Math.max(currentDepth, ...values.map(item => getMaxDepth(item, currentDepth + 1)));
        }
        return currentDepth;
    }

    // Render stats
    function renderStats(data) {
        const stats = calculateStats(data);
        const depth = getMaxDepth(data);
        const totalElements = stats.objects + stats.arrays + stats.strings + stats.numbers + stats.booleans + stats.nulls;

        const statsGrid = statsOutput.querySelector('.grid');
        statsGrid.innerHTML = `
            <div class="bg-gray-800 p-4 rounded-lg">
                <div class="text-2xl font-bold text-indigo-400">${totalElements}</div>
                <div class="text-gray-400 text-sm">Total Elements</div>
            </div>
            <div class="bg-gray-800 p-4 rounded-lg">
                <div class="text-2xl font-bold text-blue-400">${stats.objects}</div>
                <div class="text-gray-400 text-sm">Objects</div>
            </div>
            <div class="bg-gray-800 p-4 rounded-lg">
                <div class="text-2xl font-bold text-green-400">${stats.arrays}</div>
                <div class="text-gray-400 text-sm">Arrays</div>
            </div>
            <div class="bg-gray-800 p-4 rounded-lg">
                <div class="text-2xl font-bold text-yellow-400">${stats.strings}</div>
                <div class="text-gray-400 text-sm">Strings</div>
            </div>
            <div class="bg-gray-800 p-4 rounded-lg">
                <div class="text-2xl font-bold text-purple-400">${stats.numbers}</div>
                <div class="text-gray-400 text-sm">Numbers</div>
            </div>
            <div class="bg-gray-800 p-4 rounded-lg">
                <div class="text-2xl font-bold text-pink-400">${stats.booleans}</div>
                <div class="text-gray-400 text-sm">Booleans</div>
            </div>
            <div class="bg-gray-800 p-4 rounded-lg">
                <div class="text-2xl font-bold text-gray-400">${stats.nulls}</div>
                <div class="text-gray-400 text-sm">Nulls</div>
            </div>
            <div class="bg-gray-800 p-4 rounded-lg">
                <div class="text-2xl font-bold text-orange-400">${depth}</div>
                <div class="text-gray-400 text-sm">Max Depth</div>
            </div>
            <div class="bg-gray-800 p-4 rounded-lg col-span-2">
                <div class="text-2xl font-bold text-cyan-400">${stats.keys.size}</div>
                <div class="text-gray-400 text-sm">Unique Keys</div>
            </div>
        `;
    }

    // Switch tabs
    function switchTab(tab) {
        currentTab = tab;
        tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        formattedOutput.classList.toggle('hidden', tab !== 'formatted');
        treeOutput.classList.toggle('hidden', tab !== 'tree');
        statsOutput.classList.toggle('hidden', tab !== 'stats');

        if (parsedJSON !== null) {
            if (tab === 'tree') {
                treeOutput.innerHTML = createTreeView(parsedJSON);
            } else if (tab === 'stats') {
                renderStats(parsedJSON);
            }
        }
    }

    // Format and display
    function formatAndDisplay() {
        const parsed = validateJSON();
        if (parsed === null) {
            formattedOutput.textContent = '// Invalid JSON or empty input';
            formattedOutput.className = 'p-4 text-gray-400 font-mono text-sm whitespace-pre-wrap';
            return;
        }

        let data = parsed;
        if (sortKeys.checked) {
            data = sortObjectKeys(data);
        }

        formattedOutput.innerHTML = formatJSON(data);
        formattedOutput.className = 'p-4 text-gray-100 font-mono text-sm whitespace-pre-wrap';

        // Update tree and stats if on those tabs
        if (currentTab === 'tree') {
            treeOutput.innerHTML = createTreeView(data);
        } else if (currentTab === 'stats') {
            renderStats(data);
        }
    }

    // Minify JSON
    function minifyJSON() {
        const parsed = validateJSON();
        if (parsed === null) return;

        jsonInput.value = JSON.stringify(parsed);
        updateLineNumbers();
        formatAndDisplay();
        showNotification('JSON minified', 'success');
    }

    // Copy output
    async function copyOutput() {
        if (parsedJSON === null) {
            showNotification('Nothing to copy', 'warning');
            return;
        }

        let data = parsedJSON;
        if (sortKeys.checked) {
            data = sortObjectKeys(data);
        }

        const indent = getIndent();
        const text = JSON.stringify(data, null, indent);

        try {
            await navigator.clipboard.writeText(text);
            copyBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Copied!';
            setTimeout(() => {
                copyBtn.innerHTML = '<i class="fas fa-copy mr-2"></i>Copy';
            }, 2000);
            showNotification('Copied to clipboard', 'success');
        } catch (err) {
            showNotification('Failed to copy', 'error');
        }
    }

    // Clear input
    function clearInput() {
        jsonInput.value = '';
        formattedOutput.textContent = '// Formatted JSON will appear here...';
        formattedOutput.className = 'p-4 text-gray-400 font-mono text-sm whitespace-pre-wrap';
        treeOutput.innerHTML = '';
        statsOutput.querySelector('.grid').innerHTML = '';
        updateLineNumbers();
        updateStatus('info', 'Paste or type JSON to validate');
        parsedJSON = null;
    }

    // Load sample JSON
    function loadSample() {
        const sample = {
            "name": "Awesome AI Local Tools",
            "version": "2.0.0",
            "description": "1000+ AI tools running locally in your browser",
            "features": [
                "Privacy-first",
                "No backend required",
                "Works offline",
                "Open source"
            ],
            "stats": {
                "tools": 1000,
                "categories": 10,
                "languages": 14
            },
            "technologies": {
                "frontend": ["React", "TypeScript", "Tailwind CSS"],
                "ai": {
                    "engines": ["ONNX Runtime Web", "TensorFlow.js", "MediaPipe"],
                    "acceleration": ["WebGPU", "WASM"]
                }
            },
            "isActive": true,
            "lastUpdate": null
        };

        jsonInput.value = JSON.stringify(sample, null, 2);
        updateLineNumbers();
        formatAndDisplay();
        showNotification('Sample loaded', 'info');
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
    validateBtn.addEventListener('click', () => {
        validateJSON(true);
        formatAndDisplay();
    });
    formatBtn.addEventListener('click', formatAndDisplay);
    minifyBtn.addEventListener('click', minifyJSON);
    copyBtn.addEventListener('click', copyOutput);
    clearBtn.addEventListener('click', clearInput);
    sampleBtn.addEventListener('click', loadSample);

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Auto-validate on input
    jsonInput.addEventListener('input', () => {
        updateLineNumbers();

        if (autoValidate.checked) {
            clearTimeout(validationTimeout);
            validationTimeout = setTimeout(() => {
                formatAndDisplay();
            }, 300);
        }
    });

    // Handle keyboard shortcuts
    jsonInput.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            formatAndDisplay();
        }
    });

    // Track clicks on tree nodes for path display
    treeOutput.addEventListener('click', (e) => {
        const node = e.target.closest('.tree-node');
        if (node && node.dataset.path) {
            jsonPath.classList.remove('hidden');
            jsonPath.querySelector('code').textContent = node.dataset.path;
        }
    });

    // Initialize
    updateLineNumbers();

})();
