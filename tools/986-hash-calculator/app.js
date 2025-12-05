// Hash Calculator - Tool #986
// Calculate various hashes locally in the browser

(function() {
    'use strict';

    // DOM Elements
    const textInput = document.getElementById('text-input');
    const hashBtn = document.getElementById('hash-btn');
    const pasteBtn = document.getElementById('paste-btn');
    const clearBtn = document.getElementById('clear-btn');
    const autoHash = document.getElementById('auto-hash');
    const copyBtns = document.querySelectorAll('.copy-btn');

    const fileInput = document.getElementById('file-input');
    const fileDropZone = document.getElementById('file-drop-zone');
    const selectFileBtn = document.getElementById('select-file-btn');
    const fileInfo = document.getElementById('file-info');
    const fileName = document.getElementById('file-name');
    const fileSize = document.getElementById('file-size');
    const fileProgress = document.getElementById('file-progress');

    const hash1Input = document.getElementById('hash1-input');
    const hash2Input = document.getElementById('hash2-input');
    const compareBtn = document.getElementById('compare-btn');
    const compareResult = document.getElementById('compare-result');

    const modeBtns = document.querySelectorAll('.mode-btn');
    const textMode = document.getElementById('text-mode');
    const fileMode = document.getElementById('file-mode');
    const compareMode = document.getElementById('compare-mode');

    // Hash output elements
    const outputs = {
        md5: document.getElementById('md5-output'),
        sha1: document.getElementById('sha1-output'),
        sha256: document.getElementById('sha256-output'),
        sha384: document.getElementById('sha384-output'),
        sha512: document.getElementById('sha512-output')
    };

    // Current hash values
    const hashValues = {
        md5: '',
        sha1: '',
        sha256: '',
        sha384: '',
        sha512: ''
    };

    let debounceTimeout = null;

    // ========== Mode Switching ==========

    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const mode = btn.dataset.mode;
            textMode.classList.toggle('hidden', mode !== 'text');
            fileMode.classList.toggle('hidden', mode !== 'file');
            compareMode.classList.toggle('hidden', mode !== 'compare');
        });
    });

    // ========== Hash Functions ==========

    // Convert ArrayBuffer to hex string
    function bufferToHex(buffer) {
        return Array.from(new Uint8Array(buffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    // Calculate hash using Web Crypto API
    async function calculateHash(data, algorithm) {
        const encoder = new TextEncoder();
        const dataBuffer = typeof data === 'string' ? encoder.encode(data) : data;
        const hashBuffer = await crypto.subtle.digest(algorithm, dataBuffer);
        return bufferToHex(hashBuffer);
    }

    // Calculate MD5 using CryptoJS (Web Crypto doesn't support MD5)
    function calculateMD5(data) {
        if (typeof data === 'string') {
            return CryptoJS.MD5(data).toString();
        } else {
            // For ArrayBuffer, convert to WordArray
            const wordArray = CryptoJS.lib.WordArray.create(data);
            return CryptoJS.MD5(wordArray).toString();
        }
    }

    // Calculate all hashes for text
    async function calculateTextHashes(text) {
        if (!text) {
            Object.keys(outputs).forEach(key => {
                outputs[key].innerHTML = '<span class="text-gray-400">—</span>';
                hashValues[key] = '';
            });
            return;
        }

        try {
            // Calculate all hashes in parallel
            const [sha1, sha256, sha384, sha512] = await Promise.all([
                calculateHash(text, 'SHA-1'),
                calculateHash(text, 'SHA-256'),
                calculateHash(text, 'SHA-384'),
                calculateHash(text, 'SHA-512')
            ]);

            const md5 = calculateMD5(text);

            // Update outputs
            hashValues.md5 = md5;
            hashValues.sha1 = sha1;
            hashValues.sha256 = sha256;
            hashValues.sha384 = sha384;
            hashValues.sha512 = sha512;

            outputs.md5.textContent = md5;
            outputs.sha1.textContent = sha1;
            outputs.sha256.textContent = sha256;
            outputs.sha384.textContent = sha384;
            outputs.sha512.textContent = sha512;

        } catch (error) {
            showNotification('Error calculating hash: ' + error.message, 'error');
        }
    }

    // Calculate all hashes for file
    async function calculateFileHashes(file) {
        fileProgress.classList.remove('hidden');

        try {
            const arrayBuffer = await file.arrayBuffer();

            // Calculate all hashes
            const [sha1, sha256, sha384, sha512] = await Promise.all([
                calculateHash(arrayBuffer, 'SHA-1'),
                calculateHash(arrayBuffer, 'SHA-256'),
                calculateHash(arrayBuffer, 'SHA-384'),
                calculateHash(arrayBuffer, 'SHA-512')
            ]);

            const md5 = calculateMD5(arrayBuffer);

            // Update outputs
            hashValues.md5 = md5;
            hashValues.sha1 = sha1;
            hashValues.sha256 = sha256;
            hashValues.sha384 = sha384;
            hashValues.sha512 = sha512;

            outputs.md5.textContent = md5;
            outputs.sha1.textContent = sha1;
            outputs.sha256.textContent = sha256;
            outputs.sha384.textContent = sha384;
            outputs.sha512.textContent = sha512;

            showNotification('Hashes calculated', 'success');
        } catch (error) {
            showNotification('Error processing file: ' + error.message, 'error');
        } finally {
            fileProgress.classList.add('hidden');
        }
    }

    // ========== Event Listeners - Text Mode ==========

    hashBtn.addEventListener('click', () => {
        calculateTextHashes(textInput.value);
    });

    textInput.addEventListener('input', () => {
        if (autoHash.checked) {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                calculateTextHashes(textInput.value);
            }, 300);
        }
    });

    pasteBtn.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            textInput.value = text;
            if (autoHash.checked) {
                calculateTextHashes(text);
            }
            showNotification('Pasted from clipboard', 'success');
        } catch (e) {
            showNotification('Failed to paste', 'warning');
        }
    });

    clearBtn.addEventListener('click', () => {
        textInput.value = '';
        Object.keys(outputs).forEach(key => {
            outputs[key].innerHTML = '<span class="text-gray-400">—</span>';
            hashValues[key] = '';
        });
        showNotification('Cleared', 'success');
    });

    // Copy buttons
    copyBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const hashType = btn.dataset.hash;
            const value = hashValues[hashType];

            if (!value) {
                showNotification('No hash to copy', 'warning');
                return;
            }

            try {
                await navigator.clipboard.writeText(value);
                btn.innerHTML = '<i class="fas fa-check mr-1"></i>Copied';
                setTimeout(() => {
                    btn.innerHTML = '<i class="fas fa-copy mr-1"></i>Copy';
                }, 1000);
                showNotification('Copied to clipboard', 'success');
            } catch (e) {
                showNotification('Failed to copy', 'error');
            }
        });
    });

    // ========== Event Listeners - File Mode ==========

    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
        return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    }

    function handleFile(file) {
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);
        fileInfo.classList.remove('hidden');

        calculateFileHashes(file);
    }

    selectFileBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
        if (e.target.files[0]) handleFile(e.target.files[0]);
    });

    // Drag and drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        fileDropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        fileDropZone.addEventListener(eventName, () => {
            fileDropZone.classList.add('dragover');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        fileDropZone.addEventListener(eventName, () => {
            fileDropZone.classList.remove('dragover');
        });
    });

    fileDropZone.addEventListener('drop', (e) => {
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    });

    // ========== Event Listeners - Compare Mode ==========

    compareBtn.addEventListener('click', () => {
        const hash1 = hash1Input.value.trim().toLowerCase();
        const hash2 = hash2Input.value.trim().toLowerCase();

        if (!hash1 || !hash2) {
            showNotification('Please enter both hashes', 'warning');
            return;
        }

        compareResult.classList.remove('hidden');

        if (hash1 === hash2) {
            compareResult.className = 'mt-4 p-4 rounded-lg bg-green-50 border border-green-200';
            compareResult.innerHTML = `
                <div class="flex items-center gap-2 text-green-700">
                    <i class="fas fa-check-circle text-2xl"></i>
                    <div>
                        <div class="font-medium">Hashes Match!</div>
                        <div class="text-sm">The two hash values are identical.</div>
                    </div>
                </div>
            `;
        } else {
            compareResult.className = 'mt-4 p-4 rounded-lg bg-red-50 border border-red-200';
            compareResult.innerHTML = `
                <div class="flex items-center gap-2 text-red-700">
                    <i class="fas fa-times-circle text-2xl"></i>
                    <div>
                        <div class="font-medium">Hashes Do Not Match</div>
                        <div class="text-sm">The two hash values are different.</div>
                    </div>
                </div>
            `;
        }
    });

    // Auto-compare on input
    [hash1Input, hash2Input].forEach(input => {
        input.addEventListener('input', () => {
            compareResult.classList.add('hidden');
        });
    });

    // ========== Utility Functions ==========

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

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            if (!textMode.classList.contains('hidden')) {
                calculateTextHashes(textInput.value);
            }
        }
    });

})();
