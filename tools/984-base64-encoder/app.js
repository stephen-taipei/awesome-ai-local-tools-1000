// Base64 Encoder/Decoder - Tool #984
// Encode and decode Base64 locally in the browser

(function() {
    'use strict';

    // DOM Elements - Text Mode
    const plainText = document.getElementById('plain-text');
    const base64Text = document.getElementById('base64-text');
    const encodeBtn = document.getElementById('encode-btn');
    const decodeBtn = document.getElementById('decode-btn');
    const pasteTextBtn = document.getElementById('paste-text-btn');
    const clearTextBtn = document.getElementById('clear-text-btn');
    const copyBase64Btn = document.getElementById('copy-base64-btn');
    const urlSafe = document.getElementById('url-safe');
    const lineWrap = document.getElementById('line-wrap');

    // DOM Elements - File Mode
    const fileInput = document.getElementById('file-input');
    const fileDropZone = document.getElementById('file-drop-zone');
    const selectFileBtn = document.getElementById('select-file-btn');
    const fileInfo = document.getElementById('file-info');
    const fileName = document.getElementById('file-name');
    const fileSize = document.getElementById('file-size');
    const removeFileBtn = document.getElementById('remove-file-btn');
    const fileBase64Output = document.getElementById('file-base64-output');
    const copyFileBase64Btn = document.getElementById('copy-file-base64-btn');
    const decodeBase64Input = document.getElementById('decode-base64-input');
    const decodeFilename = document.getElementById('decode-filename');
    const decodeFileBtn = document.getElementById('decode-file-btn');

    // DOM Elements - Image Mode
    const imageInput = document.getElementById('image-input');
    const imageDropZone = document.getElementById('image-drop-zone');
    const selectImageBtn = document.getElementById('select-image-btn');
    const imagePreview = document.getElementById('image-preview');
    const previewImg = document.getElementById('preview-img');
    const dataUriOutput = document.getElementById('data-uri-output');
    const copyDataUriBtn = document.getElementById('copy-data-uri-btn');
    const includeMime = document.getElementById('include-mime');

    // Mode buttons
    const modeBtns = document.querySelectorAll('.mode-btn');
    const textMode = document.getElementById('text-mode');
    const fileMode = document.getElementById('file-mode');
    const imageMode = document.getElementById('image-mode');

    // Mode switching
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const mode = btn.dataset.mode;
            textMode.classList.toggle('hidden', mode !== 'text');
            fileMode.classList.toggle('hidden', mode !== 'file');
            imageMode.classList.toggle('hidden', mode !== 'image');
        });
    });

    // ========== Text Mode ==========

    // Encode text to Base64
    function encodeText() {
        const text = plainText.value;
        if (!text) {
            showNotification('Please enter text to encode', 'warning');
            return;
        }

        try {
            // Encode to UTF-8 then to Base64
            const utf8Bytes = new TextEncoder().encode(text);
            let base64 = btoa(String.fromCharCode(...utf8Bytes));

            // URL safe encoding
            if (urlSafe.checked) {
                base64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
            }

            // Line wrap
            if (lineWrap.checked) {
                base64 = base64.match(/.{1,76}/g).join('\n');
            }

            base64Text.value = base64;
            showNotification('Encoded successfully', 'success');
        } catch (e) {
            showNotification('Encoding error: ' + e.message, 'error');
        }
    }

    // Decode Base64 to text
    function decodeText() {
        let base64 = base64Text.value.trim();
        if (!base64) {
            showNotification('Please enter Base64 to decode', 'warning');
            return;
        }

        try {
            // Remove line breaks
            base64 = base64.replace(/\s/g, '');

            // Convert URL-safe back to standard
            base64 = base64.replace(/-/g, '+').replace(/_/g, '/');

            // Add padding if needed
            while (base64.length % 4) {
                base64 += '=';
            }

            // Decode
            const binaryString = atob(base64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const text = new TextDecoder().decode(bytes);

            plainText.value = text;
            showNotification('Decoded successfully', 'success');
        } catch (e) {
            showNotification('Invalid Base64 string', 'error');
        }
    }

    encodeBtn.addEventListener('click', encodeText);
    decodeBtn.addEventListener('click', decodeText);

    pasteTextBtn.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            plainText.value = text;
            showNotification('Pasted from clipboard', 'success');
        } catch (e) {
            showNotification('Failed to paste', 'warning');
        }
    });

    clearTextBtn.addEventListener('click', () => {
        plainText.value = '';
        base64Text.value = '';
        showNotification('Cleared', 'success');
    });

    copyBase64Btn.addEventListener('click', async () => {
        if (!base64Text.value) {
            showNotification('Nothing to copy', 'warning');
            return;
        }
        try {
            await navigator.clipboard.writeText(base64Text.value);
            showNotification('Copied to clipboard', 'success');
        } catch (e) {
            showNotification('Failed to copy', 'error');
        }
    });

    // Auto-encode on input (optional)
    plainText.addEventListener('input', () => {
        if (plainText.value) {
            encodeText();
        }
    });

    // ========== File Mode ==========

    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }

    function handleFile(file) {
        if (file.size > 10 * 1024 * 1024) {
            showNotification('File too large (max 10MB)', 'error');
            return;
        }

        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);
        fileInfo.classList.remove('hidden');

        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target.result.split(',')[1];
            fileBase64Output.value = base64;
            showNotification('File encoded', 'success');
        };
        reader.readAsDataURL(file);
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

    removeFileBtn.addEventListener('click', () => {
        fileInput.value = '';
        fileInfo.classList.add('hidden');
        fileBase64Output.value = '';
    });

    copyFileBase64Btn.addEventListener('click', async () => {
        if (!fileBase64Output.value) {
            showNotification('Nothing to copy', 'warning');
            return;
        }
        try {
            await navigator.clipboard.writeText(fileBase64Output.value);
            showNotification('Copied to clipboard', 'success');
        } catch (e) {
            showNotification('Failed to copy', 'error');
        }
    });

    // Decode Base64 to file and download
    decodeFileBtn.addEventListener('click', () => {
        let base64 = decodeBase64Input.value.trim();
        const filename = decodeFilename.value.trim() || 'download';

        if (!base64) {
            showNotification('Please enter Base64 data', 'warning');
            return;
        }

        try {
            // Remove data URI prefix if present
            if (base64.includes(',')) {
                base64 = base64.split(',')[1];
            }

            // Remove whitespace
            base64 = base64.replace(/\s/g, '');

            // Decode
            const binaryString = atob(base64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            // Detect MIME type from filename
            const ext = filename.split('.').pop().toLowerCase();
            const mimeTypes = {
                'pdf': 'application/pdf',
                'png': 'image/png',
                'jpg': 'image/jpeg',
                'jpeg': 'image/jpeg',
                'gif': 'image/gif',
                'webp': 'image/webp',
                'zip': 'application/zip',
                'txt': 'text/plain',
                'json': 'application/json',
                'html': 'text/html',
                'css': 'text/css',
                'js': 'application/javascript'
            };
            const mimeType = mimeTypes[ext] || 'application/octet-stream';

            const blob = new Blob([bytes], { type: mimeType });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();

            URL.revokeObjectURL(url);
            showNotification('File downloaded', 'success');
        } catch (e) {
            showNotification('Invalid Base64 data', 'error');
        }
    });

    // ========== Image Mode ==========

    function handleImage(file) {
        if (!file.type.startsWith('image/')) {
            showNotification('Please select an image file', 'error');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            showNotification('Image too large (max 10MB)', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUri = e.target.result;
            previewImg.src = dataUri;
            imagePreview.classList.remove('hidden');

            if (includeMime.checked) {
                dataUriOutput.value = dataUri;
            } else {
                dataUriOutput.value = dataUri.split(',')[1];
            }

            showNotification('Image encoded', 'success');
        };
        reader.readAsDataURL(file);
    }

    selectImageBtn.addEventListener('click', () => imageInput.click());
    imageInput.addEventListener('change', (e) => {
        if (e.target.files[0]) handleImage(e.target.files[0]);
    });

    // Drag and drop for images
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        imageDropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        imageDropZone.addEventListener(eventName, () => {
            imageDropZone.classList.add('dragover');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        imageDropZone.addEventListener(eventName, () => {
            imageDropZone.classList.remove('dragover');
        });
    });

    imageDropZone.addEventListener('drop', (e) => {
        const file = e.dataTransfer.files[0];
        if (file) handleImage(file);
    });

    includeMime.addEventListener('change', () => {
        if (dataUriOutput.value) {
            const currentValue = dataUriOutput.value;
            if (includeMime.checked) {
                if (!currentValue.startsWith('data:')) {
                    // We need the original data URI - re-read the image
                    if (previewImg.src) {
                        dataUriOutput.value = previewImg.src;
                    }
                }
            } else {
                if (currentValue.includes(',')) {
                    dataUriOutput.value = currentValue.split(',')[1];
                }
            }
        }
    });

    copyDataUriBtn.addEventListener('click', async () => {
        if (!dataUriOutput.value) {
            showNotification('Nothing to copy', 'warning');
            return;
        }
        try {
            await navigator.clipboard.writeText(dataUriOutput.value);
            showNotification('Copied to clipboard', 'success');
        } catch (e) {
            showNotification('Failed to copy', 'error');
        }
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
                encodeText();
            }
        }
    });

})();
