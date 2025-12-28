/**
 * Tool #067: BMP Converter
 */
document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const imageInput = document.getElementById('imageInput');
    const converterSection = document.getElementById('converterSection');
    const previewGrid = document.getElementById('previewGrid');

    let convertedImages = [];

    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => { e.preventDefault(); dropZone.classList.remove('dragover'); handleFiles(e.dataTransfer.files); });
    imageInput.addEventListener('change', (e) => handleFiles(e.target.files));
    document.getElementById('downloadAll').addEventListener('click', downloadAll);

    function handleFiles(files) {
        if (files.length === 0) return;
        converterSection.style.display = 'block';
        previewGrid.innerHTML = '';
        convertedImages = [];
        Array.from(files).filter(f => f.type.startsWith('image/')).forEach((file, index) => convertToBMP(file, index));
    }

    function convertToBMP(file, index) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, img.width, img.height);
                ctx.drawImage(img, 0, 0);

                // Create BMP
                const bmpData = canvasToBMP(canvas);
                const blob = new Blob([bmpData], { type: 'image/bmp' });
                const url = URL.createObjectURL(blob);
                const originalName = file.name.replace(/\.[^/.]+$/, '');

                convertedImages[index] = { name: `${originalName}.bmp`, url, blob, originalSize: file.size };
                displayPreview(canvas.toDataURL(), `${originalName}.bmp`, file.size, blob.size, index);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function canvasToBMP(canvas) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const w = canvas.width, h = canvas.height;

        // BMP file structure
        const rowSize = Math.floor((24 * w + 31) / 32) * 4;
        const pixelArraySize = rowSize * h;
        const fileSize = 54 + pixelArraySize;

        const buffer = new ArrayBuffer(fileSize);
        const view = new DataView(buffer);

        // BMP Header
        view.setUint8(0, 0x42); // 'B'
        view.setUint8(1, 0x4D); // 'M'
        view.setUint32(2, fileSize, true);
        view.setUint32(10, 54, true); // Pixel data offset

        // DIB Header
        view.setUint32(14, 40, true); // DIB header size
        view.setInt32(18, w, true);
        view.setInt32(22, -h, true); // Negative for top-down
        view.setUint16(26, 1, true); // Planes
        view.setUint16(28, 24, true); // Bits per pixel
        view.setUint32(34, pixelArraySize, true);

        // Pixel data
        const data = imageData.data;
        let offset = 54;
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const i = (y * w + x) * 4;
                view.setUint8(offset++, data[i + 2]); // B
                view.setUint8(offset++, data[i + 1]); // G
                view.setUint8(offset++, data[i]);     // R
            }
            // Row padding
            while (offset % 4 !== 54 % 4) {
                view.setUint8(offset++, 0);
            }
        }

        return buffer;
    }

    function displayPreview(previewUrl, name, originalSize, newSize, index) {
        const div = document.createElement('div');
        div.className = 'preview-item';
        div.innerHTML = `
            <img src="${previewUrl}" alt="${name}">
            <div class="file-info">
                <div style="font-weight:bold;color:#333;margin-bottom:5px;">${name}</div>
                <div>Original: ${formatSize(originalSize)}</div>
                <div>BMP: ${formatSize(newSize)}</div>
            </div>
            <button class="download-btn" onclick="downloadSingle(${index})">Download</button>
        `;
        previewGrid.appendChild(div);
    }

    window.downloadSingle = function(index) {
        const img = convertedImages[index];
        if (!img) return;
        const link = document.createElement('a');
        link.download = img.name;
        link.href = img.url;
        link.click();
    };

    function downloadAll() {
        convertedImages.forEach((img, i) => {
            if (img) setTimeout(() => window.downloadSingle(i), i * 200);
        });
    }

    function formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
});
