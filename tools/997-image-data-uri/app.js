// Image to Data URI - Tool #997
// Convert images to Base64 Data URI format

(function() {
    'use strict';

    // DOM Elements
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const dropContent = document.getElementById('drop-content');
    const previewContent = document.getElementById('preview-content');
    const previewImage = document.getElementById('preview-image');
    const changeBtn = document.getElementById('change-btn');

    const imageInfo = document.getElementById('image-info');
    const infoFilename = document.getElementById('info-filename');
    const infoType = document.getElementById('info-type');
    const infoSize = document.getElementById('info-size');
    const infoDimensions = document.getElementById('info-dimensions');

    const outputOptions = document.getElementById('output-options');
    const outputSection = document.getElementById('output-section');
    const output = document.getElementById('output');
    const outputSize = document.getElementById('output-size');
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');

    const decodeInput = document.getElementById('decode-input');
    const decodeBtn = document.getElementById('decode-btn');
    const decodeResult = document.getElementById('decode-result');
    const decodedImage = document.getElementById('decoded-image');
    const downloadDecoded = document.getElementById('download-decoded');

    let currentDataUri = '';
    let currentMimeType = '';
    let currentFilename = '';

    // ========== Drag & Drop ==========

    dropZone.addEventListener('click', () => fileInput.click());
    changeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
    });

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    // ========== Handle File ==========

    function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            showNotification('Please select an image file', 'error');
            return;
        }

        currentFilename = file.name;
        currentMimeType = file.type;

        const reader = new FileReader();
        reader.onload = (e) => {
            currentDataUri = e.target.result;

            // Show preview
            previewImage.src = currentDataUri;
            dropContent.classList.add('hidden');
            previewContent.classList.remove('hidden');

            // Get image dimensions
            const img = new Image();
            img.onload = () => {
                infoDimensions.textContent = `${img.width} × ${img.height}`;
            };
            img.src = currentDataUri;

            // Show info
            imageInfo.classList.remove('hidden');
            infoFilename.textContent = file.name;
            infoType.textContent = file.type;
            infoSize.textContent = formatBytes(file.size);

            // Show output
            outputOptions.classList.remove('hidden');
            outputSection.classList.remove('hidden');
            updateOutput();

            showNotification('Image loaded', 'success');
        };
        reader.readAsDataURL(file);
    }

    // ========== Output Format ==========

    document.querySelectorAll('input[name="output-format"]').forEach(radio => {
        radio.addEventListener('change', updateOutput);
    });

    function updateOutput() {
        const format = document.querySelector('input[name="output-format"]:checked').value;
        let result = '';

        switch (format) {
            case 'datauri':
                result = currentDataUri;
                break;
            case 'base64':
                result = currentDataUri.split(',')[1];
                break;
            case 'css':
                result = `.element {\n  background-image: url('${currentDataUri}');\n  background-repeat: no-repeat;\n  background-size: contain;\n}`;
                break;
            case 'html':
                result = `<img src="${currentDataUri}" alt="${escapeHtml(currentFilename)}" />`;
                break;
        }

        output.value = result;
        outputSize.textContent = `${formatBytes(result.length)} (${((result.length / currentDataUri.split(',')[1].length) * 100).toFixed(0)}% of base64)`;
    }

    // ========== Copy & Download ==========

    copyBtn.addEventListener('click', async () => {
        if (!output.value) {
            showNotification('Nothing to copy', 'warning');
            return;
        }
        try {
            await navigator.clipboard.writeText(output.value);
            showNotification('Copied to clipboard', 'success');
        } catch (e) {
            showNotification('Failed to copy', 'error');
        }
    });

    downloadBtn.addEventListener('click', () => {
        if (!output.value) {
            showNotification('Nothing to download', 'warning');
            return;
        }
        const format = document.querySelector('input[name="output-format"]:checked').value;
        let ext = 'txt';
        if (format === 'css') ext = 'css';
        if (format === 'html') ext = 'html';

        const blob = new Blob([output.value], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentFilename.split('.')[0]}-datauri.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
        showNotification('Downloaded', 'success');
    });

    // ========== Decode Data URI ==========

    decodeBtn.addEventListener('click', () => {
        const input = decodeInput.value.trim();
        if (!input) {
            showNotification('Please paste a Data URI', 'warning');
            return;
        }

        // Validate Data URI format
        if (!input.startsWith('data:image/')) {
            showNotification('Invalid image Data URI format', 'error');
            return;
        }

        try {
            decodedImage.src = input;
            decodeResult.classList.remove('hidden');
            showNotification('Image decoded', 'success');
        } catch (e) {
            showNotification('Failed to decode: ' + e.message, 'error');
        }
    });

    downloadDecoded.addEventListener('click', () => {
        const dataUri = decodedImage.src;
        if (!dataUri || !dataUri.startsWith('data:')) {
            showNotification('No image to download', 'warning');
            return;
        }

        // Extract mime type and extension
        const mimeMatch = dataUri.match(/data:image\/([^;]+)/);
        const ext = mimeMatch ? mimeMatch[1].replace('+xml', '') : 'png';

        // Convert to blob and download
        fetch(dataUri)
            .then(res => res.blob())
            .then(blob => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `decoded-image.${ext}`;
                a.click();
                URL.revokeObjectURL(url);
                showNotification('Downloaded', 'success');
            });
    });

    // ========== Utility Functions ==========

    function formatBytes(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

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
