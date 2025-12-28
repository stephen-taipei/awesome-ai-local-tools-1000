/**
 * Tool #086: Cartoon Effect
 * Transform photos into cartoon style
 */
document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('imageInput');
    const dropZone = document.getElementById('dropZone');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const controls = document.getElementById('controls');
    const previewContainer = document.getElementById('previewContainer');
    const edgeStrength = document.getElementById('edgeStrength');
    const edgeVal = document.getElementById('edgeVal');
    const colorLevels = document.getElementById('colorLevels');
    const colorVal = document.getElementById('colorVal');
    const blur = document.getElementById('blur');
    const blurVal = document.getElementById('blurVal');
    const downloadBtn = document.getElementById('downloadBtn');

    let originalImage = null;
    let tempCanvas = document.createElement('canvas');
    let tempCtx = tempCanvas.getContext('2d');

    // Event listeners
    imageInput.addEventListener('change', handleUpload);
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.style.borderColor = '#ff5858'; });
    dropZone.addEventListener('dragleave', () => { dropZone.style.borderColor = '#f857a6'; });
    dropZone.addEventListener('drop', handleDrop);
    edgeStrength.addEventListener('input', () => { edgeVal.textContent = edgeStrength.value; applyEffect(); });
    colorLevels.addEventListener('input', () => { colorVal.textContent = colorLevels.value; applyEffect(); });
    blur.addEventListener('input', () => { blurVal.textContent = blur.value; applyEffect(); });
    downloadBtn.addEventListener('click', download);

    function handleDrop(e) {
        e.preventDefault();
        dropZone.style.borderColor = '#f857a6';
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            loadImage(file);
        }
    }

    function handleUpload(e) {
        const file = e.target.files[0];
        if (file) loadImage(file);
    }

    function loadImage(file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                originalImage = img;
                canvas.width = img.width;
                canvas.height = img.height;
                tempCanvas.width = img.width;
                tempCanvas.height = img.height;
                controls.style.display = 'flex';
                previewContainer.style.display = 'flex';
                applyEffect();
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    }

    function applyEffect() {
        if (!originalImage) return;

        const w = canvas.width, h = canvas.height;
        const levels = parseInt(colorLevels.value);
        const edgeStr = parseInt(edgeStrength.value) / 100;
        const blurAmount = parseInt(blur.value);

        // Draw with blur for smoothing
        tempCtx.filter = `blur(${blurAmount}px)`;
        tempCtx.drawImage(originalImage, 0, 0);
        tempCtx.filter = 'none';

        // Quantize colors
        const imageData = tempCtx.getImageData(0, 0, w, h);
        const data = imageData.data;

        const step = Math.floor(256 / levels);
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.round(data[i] / step) * step;
            data[i + 1] = Math.round(data[i + 1] / step) * step;
            data[i + 2] = Math.round(data[i + 2] / step) * step;
        }

        ctx.putImageData(imageData, 0, 0);

        // Edge detection for outlines
        if (edgeStr > 0) {
            tempCtx.drawImage(originalImage, 0, 0);
            const edgeData = tempCtx.getImageData(0, 0, w, h);
            const edges = detectEdges(edgeData.data, w, h);

            // Overlay edges
            const resultData = ctx.getImageData(0, 0, w, h);
            for (let i = 0; i < edges.length; i++) {
                if (edges[i] > 30) {
                    const idx = i * 4;
                    const alpha = Math.min(1, edges[i] / 100) * edgeStr;
                    resultData.data[idx] = resultData.data[idx] * (1 - alpha);
                    resultData.data[idx + 1] = resultData.data[idx + 1] * (1 - alpha);
                    resultData.data[idx + 2] = resultData.data[idx + 2] * (1 - alpha);
                }
            }
            ctx.putImageData(resultData, 0, 0);
        }

        // Enhance saturation
        enhanceSaturation(ctx, w, h, 1.2);
    }

    function detectEdges(data, w, h) {
        const edges = new Float32Array(w * h);

        // Sobel operator
        const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
        const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
                let gx = 0, gy = 0;

                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const i = ((y + ky) * w + (x + kx)) * 4;
                        const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
                        const ki = (ky + 1) * 3 + (kx + 1);
                        gx += gray * sobelX[ki];
                        gy += gray * sobelY[ki];
                    }
                }

                edges[y * w + x] = Math.sqrt(gx * gx + gy * gy);
            }
        }

        return edges;
    }

    function enhanceSaturation(ctx, w, h, amount) {
        const imageData = ctx.getImageData(0, 0, w, h);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i + 1], b = data[i + 2];
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;

            data[i] = Math.min(255, gray + (r - gray) * amount);
            data[i + 1] = Math.min(255, gray + (g - gray) * amount);
            data[i + 2] = Math.min(255, gray + (b - gray) * amount);
        }

        ctx.putImageData(imageData, 0, 0);
    }

    function download() {
        const link = document.createElement('a');
        link.download = 'cartoon-effect.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }
});
