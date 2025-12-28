/**
 * Tool #065: ICO Generator
 * Create favicon and icon files from images
 */
document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const imageInput = document.getElementById('imageInput');
    const previewSection = document.getElementById('previewSection');
    const sourceCanvas = document.getElementById('sourceCanvas');
    const sizeGrid = document.getElementById('sizeGrid');
    const downloadSection = document.getElementById('downloadSection');
    const downloadBtn = document.getElementById('downloadBtn');

    const sizes = [16, 24, 32, 48, 64, 128, 256];
    let sourceImage = null;
    let sizeCanvases = {};

    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => { e.preventDefault(); dropZone.classList.remove('dragover'); handleFile(e.dataTransfer.files[0]); });
    imageInput.addEventListener('change', (e) => handleFile(e.target.files[0]));
    downloadBtn.addEventListener('click', downloadICO);

    function handleFile(file) {
        if (!file || !file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                sourceImage = img;
                displaySource(img);
                generateSizes(img);
                previewSection.style.display = 'flex';
                downloadSection.style.display = 'block';
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function displaySource(img) {
        const ctx = sourceCanvas.getContext('2d');
        const maxSize = 200;
        let w = img.width, h = img.height;
        if (w > maxSize || h > maxSize) {
            const scale = Math.min(maxSize / w, maxSize / h);
            w = Math.floor(w * scale);
            h = Math.floor(h * scale);
        }
        sourceCanvas.width = w;
        sourceCanvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);
    }

    function generateSizes(img) {
        sizeGrid.innerHTML = '';
        sizeCanvases = {};

        sizes.forEach(size => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = size;
            canvas.height = size;

            // Scale image to fit square
            const scale = Math.min(size / img.width, size / img.height);
            const w = img.width * scale;
            const h = img.height * scale;
            const x = (size - w) / 2;
            const y = (size - h) / 2;

            ctx.drawImage(img, x, y, w, h);
            sizeCanvases[size] = canvas;

            const div = document.createElement('div');
            div.className = 'size-item';
            div.innerHTML = `
                <canvas width="${size}" height="${size}" style="width:${Math.min(size, 64)}px;height:${Math.min(size, 64)}px;"></canvas>
                <label>
                    <input type="checkbox" value="${size}" checked>
                    ${size}×${size}
                </label>
            `;

            const displayCanvas = div.querySelector('canvas');
            const displayCtx = displayCanvas.getContext('2d');
            displayCtx.drawImage(canvas, 0, 0);

            sizeGrid.appendChild(div);
        });
    }

    function downloadICO() {
        const selectedSizes = Array.from(sizeGrid.querySelectorAll('input[type="checkbox"]:checked'))
            .map(cb => parseInt(cb.value));

        if (selectedSizes.length === 0) {
            alert('Please select at least one size | 請至少選擇一個尺寸');
            return;
        }

        // Since browser-based ICO generation is complex, we'll create a multi-file download
        // or generate individual PNGs
        if (selectedSizes.length === 1) {
            // Single file download
            const size = selectedSizes[0];
            const canvas = sizeCanvases[size];
            downloadPNG(canvas, `favicon-${size}x${size}.png`);
        } else {
            // Try to create ICO file
            try {
                createICO(selectedSizes);
            } catch (e) {
                // Fallback: download as individual PNGs
                selectedSizes.forEach((size, index) => {
                    setTimeout(() => {
                        const canvas = sizeCanvases[size];
                        downloadPNG(canvas, `favicon-${size}x${size}.png`);
                    }, index * 200);
                });
            }
        }
    }

    function downloadPNG(canvas, filename) {
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    function createICO(sizes) {
        // ICO file format implementation
        const images = sizes.map(size => {
            const canvas = sizeCanvases[size];
            const ctx = canvas.getContext('2d');
            const imageData = ctx.getImageData(0, 0, size, size);
            return { size, data: imageData };
        });

        // ICO header
        const headerSize = 6 + (16 * images.length);
        let dataOffset = headerSize;
        const imageBlobs = [];

        images.forEach(img => {
            const pngData = sizeCanvases[img.size].toDataURL('image/png');
            const base64 = pngData.split(',')[1];
            const binary = atob(base64);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }
            imageBlobs.push(bytes);
        });

        // Calculate total size
        let totalSize = headerSize;
        imageBlobs.forEach(blob => totalSize += blob.length);

        const buffer = new ArrayBuffer(totalSize);
        const view = new DataView(buffer);

        // ICO header
        view.setUint16(0, 0, true); // Reserved
        view.setUint16(2, 1, true); // Type: 1 = ICO
        view.setUint16(4, images.length, true); // Number of images

        // Image directory
        let offset = headerSize;
        images.forEach((img, i) => {
            const dirOffset = 6 + (i * 16);
            view.setUint8(dirOffset, img.size < 256 ? img.size : 0); // Width
            view.setUint8(dirOffset + 1, img.size < 256 ? img.size : 0); // Height
            view.setUint8(dirOffset + 2, 0); // Color palette
            view.setUint8(dirOffset + 3, 0); // Reserved
            view.setUint16(dirOffset + 4, 1, true); // Color planes
            view.setUint16(dirOffset + 6, 32, true); // Bits per pixel
            view.setUint32(dirOffset + 8, imageBlobs[i].length, true); // Size
            view.setUint32(dirOffset + 12, offset, true); // Offset

            offset += imageBlobs[i].length;
        });

        // Image data
        offset = headerSize;
        imageBlobs.forEach(blob => {
            const uint8View = new Uint8Array(buffer, offset, blob.length);
            uint8View.set(blob);
            offset += blob.length;
        });

        // Download
        const blob = new Blob([buffer], { type: 'image/x-icon' });
        const link = document.createElement('a');
        link.download = 'favicon.ico';
        link.href = URL.createObjectURL(blob);
        link.click();
    }
});
