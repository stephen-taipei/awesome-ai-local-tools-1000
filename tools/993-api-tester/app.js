// API Tester - Tool #993
// Test REST API endpoints in the browser

(function() {
    'use strict';

    // DOM Elements
    const methodSelect = document.getElementById('method');
    const urlInput = document.getElementById('url');
    const sendBtn = document.getElementById('send-btn');
    const bodyInput = document.getElementById('body-input');

    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const resTabBtns = document.querySelectorAll('.res-tab-btn');
    const resTabContents = document.querySelectorAll('.res-tab-content');

    const headersList = document.getElementById('headers-list');
    const addHeaderBtn = document.getElementById('add-header');

    const authType = document.getElementById('auth-type');
    const authBearer = document.getElementById('auth-bearer');
    const authBasic = document.getElementById('auth-basic');
    const authApikey = document.getElementById('auth-apikey');

    const responseSection = document.getElementById('response-section');
    const statusBadge = document.getElementById('status-badge');
    const timeBadge = document.getElementById('time-badge');
    const sizeBadge = document.getElementById('size-badge');
    const responseBody = document.getElementById('response-body');
    const responseHeaders = document.getElementById('response-headers');
    const copyResponseBtn = document.getElementById('copy-response');
    const loading = document.getElementById('loading');

    let lastResponse = '';

    // ========== Method Color ==========

    methodSelect.addEventListener('change', updateMethodColor);

    function updateMethodColor() {
        const method = methodSelect.value.toLowerCase();
        methodSelect.className = `px-4 py-2 border border-gray-300 rounded-lg font-medium text-white method-${method}`;
    }

    // ========== Tabs ==========

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => {
                b.classList.remove('border-indigo-600', 'text-indigo-600');
                b.classList.add('border-transparent', 'text-gray-500');
            });
            btn.classList.remove('border-transparent', 'text-gray-500');
            btn.classList.add('border-indigo-600', 'text-indigo-600');

            const tabId = btn.dataset.tab + '-tab';
            tabContents.forEach(content => {
                content.classList.toggle('hidden', content.id !== tabId);
            });
        });
    });

    resTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            resTabBtns.forEach(b => {
                b.classList.remove('border-indigo-600', 'text-indigo-600');
                b.classList.add('border-transparent', 'text-gray-500');
            });
            btn.classList.remove('border-transparent', 'text-gray-500');
            btn.classList.add('border-indigo-600', 'text-indigo-600');

            const tabId = btn.dataset.tab + '-tab';
            resTabContents.forEach(content => {
                content.classList.toggle('hidden', content.id !== tabId);
            });
        });
    });

    // ========== Headers ==========

    addHeaderBtn.addEventListener('click', () => addHeaderRow());

    function addHeaderRow(key = '', value = '') {
        const row = document.createElement('div');
        row.className = 'header-row flex gap-2 items-center';
        row.innerHTML = `
            <input type="text" class="header-key flex-1 px-3 py-2 border border-gray-300 rounded text-sm" placeholder="Header name" value="${escapeHtml(key)}">
            <input type="text" class="header-value flex-1 px-3 py-2 border border-gray-300 rounded text-sm" placeholder="Header value" value="${escapeHtml(value)}">
            <button class="remove-header p-2 text-red-400 hover:text-red-600">
                <i class="fas fa-times"></i>
            </button>
        `;
        headersList.appendChild(row);

        row.querySelector('.remove-header').addEventListener('click', () => row.remove());
    }

    // Initial remove button
    document.querySelector('.remove-header').addEventListener('click', function() {
        this.closest('.header-row').remove();
    });

    // ========== Auth ==========

    authType.addEventListener('change', () => {
        authBearer.classList.add('hidden');
        authBasic.classList.add('hidden');
        authApikey.classList.add('hidden');

        switch (authType.value) {
            case 'bearer':
                authBearer.classList.remove('hidden');
                break;
            case 'basic':
                authBasic.classList.remove('hidden');
                break;
            case 'api-key':
                authApikey.classList.remove('hidden');
                break;
        }
    });

    // ========== Send Request ==========

    sendBtn.addEventListener('click', sendRequest);
    urlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendRequest();
    });

    async function sendRequest() {
        const url = urlInput.value.trim();
        if (!url) {
            showNotification('Please enter a URL', 'warning');
            return;
        }

        // Prepare headers
        const headers = {};
        headersList.querySelectorAll('.header-row').forEach(row => {
            const key = row.querySelector('.header-key').value.trim();
            const value = row.querySelector('.header-value').value.trim();
            if (key) headers[key] = value;
        });

        // Add auth headers
        switch (authType.value) {
            case 'bearer':
                const token = document.getElementById('bearer-token').value.trim();
                if (token) headers['Authorization'] = `Bearer ${token}`;
                break;
            case 'basic':
                const user = document.getElementById('basic-user').value;
                const pass = document.getElementById('basic-pass').value;
                if (user) headers['Authorization'] = `Basic ${btoa(user + ':' + pass)}`;
                break;
            case 'api-key':
                const keyName = document.getElementById('apikey-name').value.trim() || 'X-API-Key';
                const keyValue = document.getElementById('apikey-value').value.trim();
                if (keyValue) headers[keyName] = keyValue;
                break;
        }

        // Prepare request options
        const method = methodSelect.value;
        const options = {
            method,
            headers,
            mode: 'cors'
        };

        // Add body for non-GET requests
        if (method !== 'GET' && method !== 'DELETE') {
            const bodyType = document.querySelector('input[name="body-type"]:checked').value;
            const body = bodyInput.value.trim();

            if (body) {
                if (bodyType === 'json') {
                    options.body = body;
                    if (!headers['Content-Type']) {
                        headers['Content-Type'] = 'application/json';
                    }
                } else if (bodyType === 'form') {
                    const formData = new FormData();
                    // Parse simple key=value format
                    body.split('\n').forEach(line => {
                        const [key, ...rest] = line.split('=');
                        if (key) formData.append(key.trim(), rest.join('=').trim());
                    });
                    options.body = formData;
                    delete headers['Content-Type']; // Let browser set it
                } else {
                    options.body = body;
                }
            }
        }

        // Show loading
        loading.classList.remove('hidden');
        responseSection.classList.add('hidden');

        const startTime = performance.now();

        try {
            const response = await fetch(url, options);
            const endTime = performance.now();
            const duration = Math.round(endTime - startTime);

            // Get response text
            const text = await response.text();
            lastResponse = text;

            // Try to parse as JSON
            let displayBody;
            try {
                const json = JSON.parse(text);
                displayBody = JSON.stringify(json, null, 2);
                responseBody.innerHTML = Prism.highlight(displayBody, Prism.languages.json, 'json');
            } catch (e) {
                displayBody = text;
                responseBody.textContent = text;
            }

            // Update status badge
            const isSuccess = response.status >= 200 && response.status < 300;
            statusBadge.textContent = `${response.status} ${response.statusText}`;
            statusBadge.className = `px-2 py-1 rounded text-xs font-medium ${isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`;

            // Update timing
            timeBadge.textContent = `${duration} ms`;
            sizeBadge.textContent = formatBytes(new Blob([text]).size);

            // Display response headers
            responseHeaders.innerHTML = '';
            response.headers.forEach((value, key) => {
                const row = document.createElement('div');
                row.className = 'py-2 grid grid-cols-2 gap-4';
                row.innerHTML = `
                    <span class="font-mono text-sm text-indigo-600">${escapeHtml(key)}</span>
                    <span class="font-mono text-sm text-gray-700">${escapeHtml(value)}</span>
                `;
                responseHeaders.appendChild(row);
            });

            responseSection.classList.remove('hidden');
            showNotification('Request completed', 'success');

        } catch (error) {
            responseSection.classList.remove('hidden');
            statusBadge.textContent = 'Error';
            statusBadge.className = 'px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700';
            timeBadge.textContent = '';
            sizeBadge.textContent = '';

            responseBody.innerHTML = `<code class="text-red-400">${escapeHtml(error.message)}</code>`;
            responseHeaders.innerHTML = '';

            showNotification('Request failed: ' + error.message, 'error');
        } finally {
            loading.classList.add('hidden');
        }
    }

    // ========== Copy Response ==========

    copyResponseBtn.addEventListener('click', async () => {
        if (!lastResponse) {
            showNotification('Nothing to copy', 'warning');
            return;
        }
        try {
            await navigator.clipboard.writeText(lastResponse);
            showNotification('Copied', 'success');
        } catch (e) {
            showNotification('Failed to copy', 'error');
        }
    });

    // ========== Utility ==========

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function formatBytes(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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
