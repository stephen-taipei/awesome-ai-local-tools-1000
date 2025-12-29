/**
 * Tool #069: Base64 Encoder/Decoder
 */
document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const imageInput = document.getElementById('imageInput');
    const mainSection = document.getElementById('mainSection');
    const previewImage = document.getElementById('previewImage');
    const base64Output = document.getElementById('base64Output');
    const base64Input = document.getElementById('base64Input');
    const stats = document.getElementById('stats');
    const formatRadios = document.querySelectorAll('input[name="format"]');

    let currentDataUrl = '';
    let currentMimeType = '';
    let originalSize = 0;

    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => { e.preventDefault(); dropZone.classList.remove('dragover'); handleFile(e.dataTransfer.files[0]); });
    imageInput.addEventListener('change', (e) => handleFile(e.target.files[0]));
    formatRadios.forEach(r => r.addEventListener('change', updateOutput));
    document.getElementById('copyBtn').addEventListener('click', copyOutput);
    document.getElementById('downloadBtn').addEventListener('click', downloadText);
    document.getElementById('decodeBtn').addEventListener('click', decodeBase64);

    function handleFile(file) {
        if (!file || !file.type.startsWith('image/')) return;
        originalSize = file.size;
        currentMimeType = file.type;

        const reader = new FileReader();
        reader.onload = (e) => {
            currentDataUrl = e.target.result;
            previewImage.src = currentDataUrl;
            mainSection.style.display = 'flex';
            updateOutput();
            updateStats();
        };
        reader.readAsDataURL(file);
    }

    function updateOutput() {
        const format = document.querySelector('input[name="format"]:checked').value;
        const base64 = currentDataUrl.split(',')[1] || currentDataUrl;

        switch (format) {
            case 'dataurl':
                base64Output.value = currentDataUrl;
                break;
            case 'raw':
                base64Output.value = base64;
                break;
            case 'css':
                base64Output.value = `background-image: url('${currentDataUrl}');`;
                break;
            case 'html':
                base64Output.value = `<img src="${currentDataUrl}" alt="Image">`;
                break;
        }
    }

    function updateStats() {
        const base64 = currentDataUrl.split(',')[1] || '';
        const base64Size = base64.length;
        const decodedSize = Math.round(base64Size * 0.75);
        const overhead = base64Size - originalSize;
        const overheadPercent = originalSize > 0 ? ((overhead / originalSize) * 100).toFixed(1) : 0;

        // Extract dimensions from image
        const img = new Image();
        img.onload = () => {
            stats.innerHTML = `
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-value">${img.width}×${img.height}</div>
                        <div class="stat-label">Dimensions | 尺寸</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${formatSize(originalSize)}</div>
                        <div class="stat-label">Original Size | 原始大小</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${formatSize(base64Size)}</div>
                        <div class="stat-label">Base64 Size</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">+${overheadPercent}%</div>
                        <div class="stat-label">Size Increase | 增加</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${currentMimeType.split('/')[1].toUpperCase()}</div>
                        <div class="stat-label">Format | 格式</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${base64.length.toLocaleString()}</div>
                        <div class="stat-label">Characters | 字符數</div>
                    </div>
                </div>
            `;
        };
        img.src = currentDataUrl;
    }

    function copyOutput() {
        base64Output.select();
        document.execCommand('copy');
        alert('Copied to clipboard! | 已複製到剪貼簿!');
    }

    function downloadText() {
        const blob = new Blob([base64Output.value], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'base64-image.txt';
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    }

    function decodeBase64() {
        let input = base64Input.value.trim();
        if (!input) {
            alert('Please paste a Base64 string | 請貼上 Base64 字串');
            return;
        }

        // Try to detect and fix format
        if (!input.startsWith('data:')) {
            // Try to guess mime type from content
            if (input.startsWith('/9j/')) {
                input = 'data:image/jpeg;base64,' + input;
            } else if (input.startsWith('iVBOR')) {
                input = 'data:image/png;base64,' + input;
            } else if (input.startsWith('R0lGOD')) {
                input = 'data:image/gif;base64,' + input;
            } else if (input.startsWith('UklGR')) {
                input = 'data:image/webp;base64,' + input;
            } else {
                input = 'data:image/png;base64,' + input;
            }
        }

        try {
            currentDataUrl = input;
            previewImage.src = input;
            mainSection.style.display = 'flex';

            // Get base64 and calculate size
            const base64 = input.split(',')[1] || input;
            originalSize = Math.round(base64.length * 0.75);
            currentMimeType = input.match(/data:([^;]+)/)?.[1] || 'image/unknown';

            updateOutput();
            updateStats();
        } catch (e) {
            alert('Invalid Base64 string | 無效的 Base64 字串');
        }
    }

    function formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
});
