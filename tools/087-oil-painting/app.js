/**
 * Tool #087: Oil Painting Effect
 * Transform photos into oil painting style
 */
document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('imageInput');
    const dropZone = document.getElementById('dropZone');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const controls = document.getElementById('controls');
    const previewContainer = document.getElementById('previewContainer');
    const loading = document.getElementById('loading');
    const brushSize = document.getElementById('brushSize');
    const brushVal = document.getElementById('brushVal');
    const intensity = document.getElementById('intensity');
    const intensityVal = document.getElementById('intensityVal');
    const detail = document.getElementById('detail');
    const detailVal = document.getElementById('detailVal');
    const downloadBtn = document.getElementById('downloadBtn');

    let originalImage = null;
    let tempCanvas = document.createElement('canvas');
    let tempCtx = tempCanvas.getContext('2d');

    // Event listeners
    imageInput.addEventListener('change', handleUpload);
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.style.borderColor = '#4b134f'; });
    dropZone.addEventListener('dragleave', () => { dropZone.style.borderColor = '#c94b4b'; });
    dropZone.addEventListener('drop', handleDrop);
    brushSize.addEventListener('input', () => { brushVal.textContent = brushSize.value; });
    brushSize.addEventListener('change', applyEffect);
    intensity.addEventListener('input', () => { intensityVal.textContent = intensity.value; });
    intensity.addEventListener('change', applyEffect);
    detail.addEventListener('input', () => { detailVal.textContent = detail.value; });
    detail.addEventListener('change', applyEffect);
    downloadBtn.addEventListener('click', download);

    function handleDrop(e) {
        e.preventDefault();
        dropZone.style.borderColor = '#c94b4b';
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
                // Limit size for performance
                const maxSize = 800;
                let w = img.width, h = img.height;
                if (w > maxSize || h > maxSize) {
                    const ratio = Math.min(maxSize / w, maxSize / h);
                    w = Math.floor(w * ratio);
                    h = Math.floor(h * ratio);
                }
                canvas.width = w;
                canvas.height = h;
                tempCanvas.width = w;
                tempCanvas.height = h;
                tempCtx.drawImage(img, 0, 0, w, h);
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
        loading.style.display = 'block';

        setTimeout(() => {
            const w = canvas.width, h = canvas.height;
            const radius = parseInt(brushSize.value);
            const levels = parseInt(intensity.value);

            const srcData = tempCtx.getImageData(0, 0, w, h);
            const dstData = ctx.createImageData(w, h);

            oilPaintingFilter(srcData.data, dstData.data, w, h, radius, levels);

            ctx.putImageData(dstData, 0, 0);

            // Apply canvas texture overlay
            addCanvasTexture(ctx, w, h, parseInt(detail.value));

            loading.style.display = 'none';
        }, 50);
    }

    function oilPaintingFilter(src, dst, w, h, radius, levels) {
        const intensityCount = new Array(levels).fill(0);
        const sumR = new Array(levels).fill(0);
        const sumG = new Array(levels).fill(0);
        const sumB = new Array(levels).fill(0);

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                // Reset arrays
                for (let i = 0; i < levels; i++) {
                    intensityCount[i] = 0;
                    sumR[i] = 0;
                    sumG[i] = 0;
                    sumB[i] = 0;
                }

                // Sample neighborhood
                for (let ky = -radius; ky <= radius; ky++) {
                    for (let kx = -radius; kx <= radius; kx++) {
                        const px = Math.min(w - 1, Math.max(0, x + kx));
                        const py = Math.min(h - 1, Math.max(0, y + ky));
                        const i = (py * w + px) * 4;

                        const r = src[i], g = src[i + 1], b = src[i + 2];
                        const curIntensity = Math.floor((r + g + b) / 3 * levels / 256);
                        const safeIntensity = Math.min(levels - 1, curIntensity);

                        intensityCount[safeIntensity]++;
                        sumR[safeIntensity] += r;
                        sumG[safeIntensity] += g;
                        sumB[safeIntensity] += b;
                    }
                }

                // Find most common intensity
                let maxCount = 0;
                let maxIndex = 0;
                for (let i = 0; i < levels; i++) {
                    if (intensityCount[i] > maxCount) {
                        maxCount = intensityCount[i];
                        maxIndex = i;
                    }
                }

                const dstI = (y * w + x) * 4;
                if (maxCount > 0) {
                    dst[dstI] = sumR[maxIndex] / maxCount;
                    dst[dstI + 1] = sumG[maxIndex] / maxCount;
                    dst[dstI + 2] = sumB[maxIndex] / maxCount;
                } else {
                    const srcI = (y * w + x) * 4;
                    dst[dstI] = src[srcI];
                    dst[dstI + 1] = src[srcI + 1];
                    dst[dstI + 2] = src[srcI + 2];
                }
                dst[dstI + 3] = 255;
            }
        }
    }

    function addCanvasTexture(ctx, w, h, strength) {
        const imageData = ctx.getImageData(0, 0, w, h);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * strength * 3;
            data[i] = Math.min(255, Math.max(0, data[i] + noise));
            data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
            data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
        }

        ctx.putImageData(imageData, 0, 0);

        // Add brush stroke pattern
        ctx.globalCompositeOperation = 'overlay';
        ctx.globalAlpha = strength / 30;

        for (let i = 0; i < w * h / 500; i++) {
            const x = Math.random() * w;
            const y = Math.random() * h;
            const len = Math.random() * 20 + 10;
            const angle = Math.random() * Math.PI * 2;

            ctx.strokeStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.3)';
            ctx.lineWidth = Math.random() * 2 + 0.5;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
            ctx.stroke();
        }

        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
    }

    function download() {
        const link = document.createElement('a');
        link.download = 'oil-painting.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }
});
