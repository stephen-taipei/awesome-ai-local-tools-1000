/**
 * Tool #089: Neon Glow
 * Add neon glow effects to images
 */
document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('imageInput');
    const dropZone = document.getElementById('dropZone');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const controls = document.getElementById('controls');
    const previewContainer = document.getElementById('previewContainer');
    const intensity = document.getElementById('intensity');
    const intensityVal = document.getElementById('intensityVal');
    const glowSize = document.getElementById('glowSize');
    const sizeVal = document.getElementById('sizeVal');
    const color1 = document.getElementById('color1');
    const color2 = document.getElementById('color2');
    const edgesOnly = document.getElementById('edgesOnly');
    const downloadBtn = document.getElementById('downloadBtn');

    let originalImage = null;
    let tempCanvas = document.createElement('canvas');
    let tempCtx = tempCanvas.getContext('2d');

    // Event listeners
    imageInput.addEventListener('change', handleUpload);
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.style.borderColor = '#00ffff'; });
    dropZone.addEventListener('dragleave', () => { dropZone.style.borderColor = '#ff00ff'; });
    dropZone.addEventListener('drop', handleDrop);
    intensity.addEventListener('input', () => { intensityVal.textContent = intensity.value; applyEffect(); });
    glowSize.addEventListener('input', () => { sizeVal.textContent = glowSize.value; applyEffect(); });
    color1.addEventListener('input', applyEffect);
    color2.addEventListener('input', applyEffect);
    edgesOnly.addEventListener('change', applyEffect);
    downloadBtn.addEventListener('click', download);

    function handleDrop(e) {
        e.preventDefault();
        dropZone.style.borderColor = '#ff00ff';
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
        const glowIntensity = parseInt(intensity.value) / 100;
        const glow = parseInt(glowSize.value);
        const c1 = hexToRgb(color1.value);
        const c2 = hexToRgb(color2.value);
        const onlyEdges = edgesOnly.checked;

        // Draw original
        tempCtx.drawImage(originalImage, 0, 0);
        const srcData = tempCtx.getImageData(0, 0, w, h);

        // Dark background
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, w, h);

        // Detect edges
        const edges = detectEdges(srcData.data, w, h);

        // Create glow layers
        const glowCanvas = document.createElement('canvas');
        glowCanvas.width = w;
        glowCanvas.height = h;
        const glowCtx = glowCanvas.getContext('2d');

        // Draw edges with gradient color
        const glowData = glowCtx.createImageData(w, h);
        for (let i = 0; i < edges.length; i++) {
            const edgeVal = edges[i];
            if (edgeVal > 20) {
                const idx = i * 4;
                const t = (i % w) / w; // gradient based on x position
                const r = c1.r * (1 - t) + c2.r * t;
                const g = c1.g * (1 - t) + c2.g * t;
                const b = c1.b * (1 - t) + c2.b * t;

                glowData.data[idx] = r;
                glowData.data[idx + 1] = g;
                glowData.data[idx + 2] = b;
                glowData.data[idx + 3] = Math.min(255, edgeVal * 2);
            }
        }
        glowCtx.putImageData(glowData, 0, 0);

        // Apply multiple blur layers for glow effect
        ctx.globalCompositeOperation = 'screen';

        for (let i = 3; i >= 0; i--) {
            ctx.filter = `blur(${glow * (i + 1) / 2}px)`;
            ctx.globalAlpha = glowIntensity * (0.3 + i * 0.1);
            ctx.drawImage(glowCanvas, 0, 0);
        }

        ctx.filter = 'none';
        ctx.globalAlpha = 1;

        // Draw sharp edges
        ctx.globalCompositeOperation = 'screen';
        ctx.drawImage(glowCanvas, 0, 0);

        // Optionally draw original image
        if (!onlyEdges) {
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 0.3;
            ctx.drawImage(originalImage, 0, 0);
            ctx.globalAlpha = 1;
        }

        ctx.globalCompositeOperation = 'source-over';

        // Add scan lines for cyberpunk effect
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        for (let y = 0; y < h; y += 3) {
            ctx.fillRect(0, y, w, 1);
        }
    }

    function detectEdges(data, w, h) {
        const edges = new Float32Array(w * h);
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

    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 255, g: 0, b: 255 };
    }

    function download() {
        const link = document.createElement('a');
        link.download = 'neon-glow.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }
});
