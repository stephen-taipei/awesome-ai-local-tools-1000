/**
 * Tool #074: Batch Compress
 */
document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const imageInput = document.getElementById('imageInput');
    const controls = document.getElementById('controls');
    const previewGrid = document.getElementById('previewGrid');
    const statsBar = document.getElementById('statsBar');
    const quality = document.getElementById('quality');
    const qualityValue = document.getElementById('qualityValue');
    const maxSize = document.getElementById('maxSize');
    const processBtn = document.getElementById('processBtn');

    let images = [];
    let compressed = [];

    quality.addEventListener('input', () => { qualityValue.textContent = quality.value + '%'; updatePreview(); });
    maxSize.addEventListener('change', updatePreview);

    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => { e.preventDefault(); dropZone.classList.remove('dragover'); handleFiles(e.dataTransfer.files); });
    imageInput.addEventListener('change', (e) => handleFiles(e.target.files));
    processBtn.addEventListener('click', processAndDownload);

    function handleFiles(files) {
        images = [];
        Array.from(files).filter(f => f.type.startsWith('image/')).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    images.push({ file, img, originalSize: file.size });
                    updatePreview();
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
        controls.style.display = 'flex';
    }

    function updatePreview() {
        previewGrid.innerHTML = '';
        compressed = [];
        let totalOriginal = 0, totalCompressed = 0;

        images.forEach((item, index) => {
            const canvas = compressImage(item.img);
            canvas.toBlob(blob => {
                compressed[index] = { blob, name: item.file.name };
                totalOriginal += item.originalSize;
                totalCompressed += blob.size;

                const div = document.createElement('div');
                div.className = 'preview-item';
                div.innerHTML = `
                    <img src="${canvas.toDataURL()}" alt="Compressed">
                    <div class="info">${item.file.name.substring(0, 15)}...</div>
                    <div class="info">${formatSize(item.originalSize)} → ${formatSize(blob.size)}</div>
                    <div class="savings">-${Math.round((1 - blob.size / item.originalSize) * 100)}%</div>
                `;
                previewGrid.appendChild(div);

                if (compressed.filter(Boolean).length === images.length) {
                    const savings = Math.round((1 - totalCompressed / totalOriginal) * 100);
                    statsBar.innerHTML = `Total: ${formatSize(totalOriginal)} → ${formatSize(totalCompressed)} (Saved ${savings}%)`;
                    statsBar.style.display = 'block';
                }
            }, 'image/jpeg', parseInt(quality.value) / 100);
        });
    }

    function compressImage(img) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        let w = img.width, h = img.height;
        const max = parseInt(maxSize.value);
        if (max > 0 && (w > max || h > max)) {
            const scale = Math.min(max / w, max / h);
            w = Math.round(w * scale);
            h = Math.round(h * scale);
        }
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);
        return canvas;
    }

    async function processAndDownload() {
        for (let i = 0; i < compressed.length; i++) {
            if (!compressed[i]) continue;
            const url = URL.createObjectURL(compressed[i].blob);
            const link = document.createElement('a');
            link.download = `compressed_${compressed[i].name}`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
            await new Promise(r => setTimeout(r, 200));
        }
    }

    function formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
});
