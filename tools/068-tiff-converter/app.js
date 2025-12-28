/**
 * Tool #068: TIFF Converter
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
        Array.from(files).filter(f => f.type.startsWith('image/')).forEach((file, index) => convertToTIFF(file, index));
    }

    function convertToTIFF(file, index) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                // Create TIFF-like structure (simplified)
                const tiffData = createSimpleTIFF(canvas);
                const blob = new Blob([tiffData], { type: 'image/tiff' });
                const url = URL.createObjectURL(blob);
                const originalName = file.name.replace(/\.[^/.]+$/, '');

                convertedImages[index] = { name: `${originalName}.tiff`, url, blob, originalSize: file.size, previewUrl: canvas.toDataURL() };
                displayPreview(canvas.toDataURL(), `${originalName}.tiff`, file.size, blob.size, index);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function createSimpleTIFF(canvas) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const w = canvas.width, h = canvas.height;
        const pixels = imageData.data;

        // Simplified TIFF structure (uncompressed RGB)
        const stripSize = w * h * 3;
        const ifdOffset = 8;
        const stripOffset = ifdOffset + 2 + 12 * 12 + 4;
        const fileSize = stripOffset + stripSize;

        const buffer = new ArrayBuffer(fileSize);
        const view = new DataView(buffer);

        // TIFF Header
        view.setUint16(0, 0x4949, false); // Little endian
        view.setUint16(2, 42, true);      // TIFF magic
        view.setUint32(4, ifdOffset, true); // IFD offset

        let offset = ifdOffset;
        const numEntries = 12;
        view.setUint16(offset, numEntries, true);
        offset += 2;

        // IFD entries
        const entries = [
            [256, 3, 1, w],           // ImageWidth
            [257, 3, 1, h],           // ImageLength
            [258, 3, 3, 0],           // BitsPerSample (8,8,8 - stored later)
            [259, 3, 1, 1],           // Compression (none)
            [262, 3, 1, 2],           // PhotometricInterpretation (RGB)
            [273, 4, 1, stripOffset], // StripOffsets
            [277, 3, 1, 3],           // SamplesPerPixel
            [278, 3, 1, h],           // RowsPerStrip
            [279, 4, 1, stripSize],   // StripByteCounts
            [282, 5, 1, 0],           // XResolution
            [283, 5, 1, 0],           // YResolution
            [284, 3, 1, 1]            // PlanarConfiguration
        ];

        entries.forEach(([tag, type, count, value]) => {
            view.setUint16(offset, tag, true);
            view.setUint16(offset + 2, type, true);
            view.setUint32(offset + 4, count, true);
            view.setUint32(offset + 8, value, true);
            offset += 12;
        });

        view.setUint32(offset, 0, true); // Next IFD (none)

        // Pixel data (RGB, no alpha)
        offset = stripOffset;
        for (let i = 0; i < pixels.length; i += 4) {
            view.setUint8(offset++, pixels[i]);     // R
            view.setUint8(offset++, pixels[i + 1]); // G
            view.setUint8(offset++, pixels[i + 2]); // B
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
                <div>TIFF: ${formatSize(newSize)}</div>
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
