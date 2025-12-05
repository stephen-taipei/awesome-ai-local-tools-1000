// URL Encoder/Decoder - Tool #987
// Encode and decode URLs locally in the browser

(function() {
    'use strict';

    // DOM Elements - Encode Mode
    const decodedInput = document.getElementById('decoded-input');
    const encodedInput = document.getElementById('encoded-input');
    const encodeType = document.getElementById('encode-type');
    const autoConvert = document.getElementById('auto-convert');
    const pasteDecodedBtn = document.getElementById('paste-decoded-btn');
    const copyDecodedBtn = document.getElementById('copy-decoded-btn');
    const pasteEncodedBtn = document.getElementById('paste-encoded-btn');
    const copyEncodedBtn = document.getElementById('copy-encoded-btn');
    const clearBtn = document.getElementById('clear-btn');

    // DOM Elements - Parse Mode
    const urlToParse = document.getElementById('url-to-parse');
    const parseUrlBtn = document.getElementById('parse-url-btn');
    const parsedResult = document.getElementById('parsed-result');
    const urlComponents = document.getElementById('url-components');
    const queryParams = document.getElementById('query-params');
    const paramsTable = document.getElementById('params-table');

    // DOM Elements - Builder Mode
    const builderParams = document.getElementById('builder-params');
    const addParamBtn = document.getElementById('add-param-btn');
    const baseUrl = document.getElementById('base-url');
    const queryOutput = document.getElementById('query-output');
    const copyQueryBtn = document.getElementById('copy-query-btn');

    // Mode buttons
    const modeBtns = document.querySelectorAll('.mode-btn');
    const encodeMode = document.getElementById('encode-mode');
    const parseMode = document.getElementById('parse-mode');
    const builderMode = document.getElementById('builder-mode');

    let debounceTimeout = null;

    // ========== Mode Switching ==========

    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const mode = btn.dataset.mode;
            encodeMode.classList.toggle('hidden', mode !== 'encode');
            parseMode.classList.toggle('hidden', mode !== 'parse');
            builderMode.classList.toggle('hidden', mode !== 'builder');
        });
    });

    // ========== Encode/Decode Functions ==========

    function encode(text) {
        const type = encodeType.value;
        try {
            switch (type) {
                case 'component':
                    return encodeURIComponent(text);
                case 'uri':
                    return encodeURI(text);
                case 'escape':
                    return escape(text);
                default:
                    return encodeURIComponent(text);
            }
        } catch (e) {
            return text;
        }
    }

    function decode(text) {
        const type = encodeType.value;
        try {
            switch (type) {
                case 'component':
                    return decodeURIComponent(text);
                case 'uri':
                    return decodeURI(text);
                case 'escape':
                    return unescape(text);
                default:
                    return decodeURIComponent(text);
            }
        } catch (e) {
            // Try alternate decode methods on error
            try {
                return decodeURIComponent(text);
            } catch (e2) {
                try {
                    return decodeURI(text);
                } catch (e3) {
                    return text;
                }
            }
        }
    }

    function encodeFromDecoded() {
        encodedInput.value = encode(decodedInput.value);
    }

    function decodeFromEncoded() {
        decodedInput.value = decode(encodedInput.value);
    }

    // Event listeners for encode mode
    decodedInput.addEventListener('input', () => {
        if (autoConvert.checked) {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(encodeFromDecoded, 150);
        }
    });

    encodedInput.addEventListener('input', () => {
        if (autoConvert.checked) {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(decodeFromEncoded, 150);
        }
    });

    encodeType.addEventListener('change', () => {
        if (decodedInput.value) {
            encodeFromDecoded();
        }
    });

    pasteDecodedBtn.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            decodedInput.value = text;
            if (autoConvert.checked) encodeFromDecoded();
            showNotification('Pasted', 'success');
        } catch (e) {
            showNotification('Failed to paste', 'error');
        }
    });

    copyDecodedBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(decodedInput.value);
            showNotification('Copied', 'success');
        } catch (e) {
            showNotification('Failed to copy', 'error');
        }
    });

    pasteEncodedBtn.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            encodedInput.value = text;
            if (autoConvert.checked) decodeFromEncoded();
            showNotification('Pasted', 'success');
        } catch (e) {
            showNotification('Failed to paste', 'error');
        }
    });

    copyEncodedBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(encodedInput.value);
            showNotification('Copied', 'success');
        } catch (e) {
            showNotification('Failed to copy', 'error');
        }
    });

    clearBtn.addEventListener('click', () => {
        decodedInput.value = '';
        encodedInput.value = '';
        showNotification('Cleared', 'success');
    });

    // ========== URL Parser ==========

    parseUrlBtn.addEventListener('click', () => {
        parseUrl(urlToParse.value);
    });

    urlToParse.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            parseUrl(urlToParse.value);
        }
    });

    function parseUrl(urlString) {
        if (!urlString.trim()) {
            showNotification('Please enter a URL', 'warning');
            return;
        }

        try {
            // Add protocol if missing
            if (!urlString.match(/^[a-zA-Z]+:\/\//)) {
                urlString = 'https://' + urlString;
            }

            const url = new URL(urlString);

            // Show components
            parsedResult.classList.remove('hidden');
            urlComponents.innerHTML = `
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    ${createComponent('Protocol', url.protocol.replace(':', ''))}
                    ${createComponent('Host', url.host)}
                    ${createComponent('Hostname', url.hostname)}
                    ${createComponent('Port', url.port || '(default)')}
                    ${createComponent('Pathname', url.pathname)}
                    ${createComponent('Search', url.search || '(none)')}
                    ${createComponent('Hash', url.hash || '(none)')}
                    ${createComponent('Origin', url.origin)}
                </div>
            `;

            // Show query parameters
            if (url.searchParams.toString()) {
                queryParams.classList.remove('hidden');
                paramsTable.innerHTML = '';

                url.searchParams.forEach((value, key) => {
                    const row = document.createElement('tr');
                    row.className = 'param-row border-b border-gray-100';
                    row.innerHTML = `
                        <td class="py-2 px-3 font-mono text-indigo-600">${escapeHtml(key)}</td>
                        <td class="py-2 px-3 font-mono">${escapeHtml(value)}</td>
                        <td class="py-2 px-3">
                            <button class="copy-param-btn text-gray-400 hover:text-indigo-600" data-value="${escapeHtml(value)}">
                                <i class="fas fa-copy"></i>
                            </button>
                        </td>
                    `;
                    paramsTable.appendChild(row);
                });

                // Add copy listeners
                paramsTable.querySelectorAll('.copy-param-btn').forEach(btn => {
                    btn.addEventListener('click', async () => {
                        try {
                            await navigator.clipboard.writeText(btn.dataset.value);
                            showNotification('Copied', 'success');
                        } catch (e) {}
                    });
                });
            } else {
                queryParams.classList.add('hidden');
            }

            showNotification('URL parsed', 'success');
        } catch (e) {
            showNotification('Invalid URL: ' + e.message, 'error');
            parsedResult.classList.add('hidden');
            queryParams.classList.add('hidden');
        }
    }

    function createComponent(label, value) {
        return `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span class="text-gray-500 text-sm">${label}</span>
                <span class="font-mono text-sm text-gray-800">${escapeHtml(value)}</span>
            </div>
        `;
    }

    // ========== Query Builder ==========

    let paramCount = 0;

    function addParamRow(key = '', value = '') {
        paramCount++;
        const row = document.createElement('div');
        row.className = 'param-row flex gap-2 items-center';
        row.dataset.id = paramCount;
        row.innerHTML = `
            <input type="text" class="param-key flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Key" value="${escapeHtml(key)}">
            <span class="text-gray-400">=</span>
            <input type="text" class="param-value flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Value" value="${escapeHtml(value)}">
            <button class="remove-param-btn p-2 text-red-400 hover:text-red-600 transition-colors">
                <i class="fas fa-times"></i>
            </button>
        `;

        builderParams.appendChild(row);

        // Add event listeners
        row.querySelector('.param-key').addEventListener('input', updateQueryOutput);
        row.querySelector('.param-value').addEventListener('input', updateQueryOutput);
        row.querySelector('.remove-param-btn').addEventListener('click', () => {
            row.remove();
            updateQueryOutput();
        });

        updateQueryOutput();
    }

    function updateQueryOutput() {
        const params = new URLSearchParams();
        const rows = builderParams.querySelectorAll('.param-row');

        rows.forEach(row => {
            const key = row.querySelector('.param-key').value.trim();
            const value = row.querySelector('.param-value').value;
            if (key) {
                params.append(key, value);
            }
        });

        const queryString = params.toString();
        const base = baseUrl.value.trim();

        if (!queryString) {
            queryOutput.innerHTML = '<span class="text-gray-400">Query string will appear here...</span>';
            return;
        }

        if (base) {
            const separator = base.includes('?') ? '&' : '?';
            queryOutput.textContent = base + separator + queryString;
        } else {
            queryOutput.textContent = '?' + queryString;
        }
    }

    addParamBtn.addEventListener('click', () => addParamRow());
    baseUrl.addEventListener('input', updateQueryOutput);

    copyQueryBtn.addEventListener('click', async () => {
        const text = queryOutput.textContent;
        if (!text || text.includes('will appear')) {
            showNotification('Nothing to copy', 'warning');
            return;
        }
        try {
            await navigator.clipboard.writeText(text);
            showNotification('Copied', 'success');
        } catch (e) {
            showNotification('Failed to copy', 'error');
        }
    });

    // Initialize with 2 empty param rows
    addParamRow();
    addParamRow();

    // ========== Utility Functions ==========

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

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
