/**
 * Tool #088: Sketch Effect
 * Transform photos into pencil sketch style
 */
document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('imageInput');
    const dropZone = document.getElementById('dropZone');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const controls = document.getElementById('controls');
    const previewContainer = document.getElementById('previewContainer');
    const styleSelect = document.getElementById('style');
    const lineStrength = document.getElementById('lineStrength');
    const lineVal = document.getElementById('lineVal');
    const brightness = document.getElementById('brightness');
    const brightVal = document.getElementById('brightVal');
    const downloadBtn = document.getElementById('downloadBtn');

    let originalImage = null;
    let tempCanvas = document.createElement('canvas');
    let tempCtx = tempCanvas.getContext('2d');

    // Event listeners
    imageInput.addEventListener('change', handleUpload);
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.style.borderColor = '#000'; });
    dropZone.addEventListener('dragleave', () => { dropZone.style.borderColor = '#434343'; });
    dropZone.addEventListener('drop', handleDrop);
    styleSelect.addEventListener('change', applyEffect);
    lineStrength.addEventListener('input', () => { lineVal.textContent = lineStrength.value; applyEffect(); });
    brightness.addEventListener('input', () => { brightVal.textContent = brightness.value; applyEffect(); });
    downloadBtn.addEventListener('click', download);

    function handleDrop(e) {
        e.preventDefault();
        dropZone.style.borderColor = '#434343';
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
        const style = styleSelect.value;
        const lineStr = parseInt(lineStrength.value) / 50;
        const bright = parseInt(brightness.value) / 50;

        // Draw original
        tempCtx.drawImage(originalImage, 0, 0);
        const srcData = tempCtx.getImageData(0, 0, w, h);

        if (style === 'color') {
            applyColorPencil(srcData, ctx, w, h, lineStr, bright);
        } else if (style === 'charcoal') {
            applyCharcoal(srcData, ctx, w, h, lineStr, bright);
        } else {
            applyPencilSketch(srcData, ctx, w, h, lineStr, bright);
        }
    }

    function applyPencilSketch(srcData, ctx, w, h, lineStr, bright) {
        // Convert to grayscale
        const gray = new Uint8ClampedArray(w * h);
        for (let i = 0; i < srcData.data.length; i += 4) {
            gray[i / 4] = 0.299 * srcData.data[i] + 0.587 * srcData.data[i + 1] + 0.114 * srcData.data[i + 2];
        }

        // Invert
        const inverted = gray.map(v => 255 - v);

        // Blur inverted
        const blurred = gaussianBlur(inverted, w, h, 5);

        // Color dodge blend
        const result = ctx.createImageData(w, h);
        for (let i = 0; i < gray.length; i++) {
            const base = gray[i];
            const blend = blurred[i];

            let val;
            if (blend === 255) {
                val = 255;
            } else {
                val = Math.min(255, (base * 255) / (255 - blend));
            }

            // Adjust contrast and brightness
            val = Math.min(255, Math.max(0, (val - 128) * lineStr + 128 + (bright - 1) * 50));

            result.data[i * 4] = val;
            result.data[i * 4 + 1] = val;
            result.data[i * 4 + 2] = val;
            result.data[i * 4 + 3] = 255;
        }

        ctx.putImageData(result, 0, 0);

        // Add paper texture
        addPaperTexture(ctx, w, h);
    }

    function applyCharcoal(srcData, ctx, w, h, lineStr, bright) {
        // Convert to grayscale
        const gray = new Uint8ClampedArray(w * h);
        for (let i = 0; i < srcData.data.length; i += 4) {
            gray[i / 4] = 0.299 * srcData.data[i] + 0.587 * srcData.data[i + 1] + 0.114 * srcData.data[i + 2];
        }

        // Edge detection
        const edges = sobelEdgeDetection(gray, w, h);

        // Create charcoal effect
        const result = ctx.createImageData(w, h);
        for (let i = 0; i < gray.length; i++) {
            const edge = Math.min(255, edges[i] * lineStr * 2);
            const base = gray[i];

            // Darker, more contrast
            let val = 255 - edge;
            val = Math.min(255, Math.max(0, (val - 128) * 1.5 + 128 + (bright - 1) * 30));

            result.data[i * 4] = val;
            result.data[i * 4 + 1] = val;
            result.data[i * 4 + 2] = val;
            result.data[i * 4 + 3] = 255;
        }

        ctx.putImageData(result, 0, 0);
        addPaperTexture(ctx, w, h, 0.15);
    }

    function applyColorPencil(srcData, ctx, w, h, lineStr, bright) {
        // Edge detection on grayscale
        const gray = new Uint8ClampedArray(w * h);
        for (let i = 0; i < srcData.data.length; i += 4) {
            gray[i / 4] = 0.299 * srcData.data[i] + 0.587 * srcData.data[i + 1] + 0.114 * srcData.data[i + 2];
        }

        const edges = sobelEdgeDetection(gray, w, h);

        // Blend edges with color
        const result = ctx.createImageData(w, h);
        for (let i = 0; i < gray.length; i++) {
            const edge = Math.min(1, edges[i] / 100 * lineStr);
            const idx = i * 4;

            // Soften and lighten colors
            let r = srcData.data[idx] * bright;
            let g = srcData.data[idx + 1] * bright;
            let b = srcData.data[idx + 2] * bright;

            // Apply edge darkening
            r = Math.min(255, Math.max(0, r * (1 - edge * 0.8)));
            g = Math.min(255, Math.max(0, g * (1 - edge * 0.8)));
            b = Math.min(255, Math.max(0, b * (1 - edge * 0.8)));

            result.data[idx] = r;
            result.data[idx + 1] = g;
            result.data[idx + 2] = b;
            result.data[idx + 3] = 255;
        }

        ctx.putImageData(result, 0, 0);
        addPaperTexture(ctx, w, h, 0.05);
    }

    function sobelEdgeDetection(gray, w, h) {
        const edges = new Float32Array(w * h);
        const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
        const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
                let gx = 0, gy = 0;

                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const i = (y + ky) * w + (x + kx);
                        const ki = (ky + 1) * 3 + (kx + 1);
                        gx += gray[i] * sobelX[ki];
                        gy += gray[i] * sobelY[ki];
                    }
                }

                edges[y * w + x] = Math.sqrt(gx * gx + gy * gy);
            }
        }

        return edges;
    }

    function gaussianBlur(data, w, h, radius) {
        const result = new Uint8ClampedArray(data.length);
        const kernel = [];
        const sigma = radius / 2;

        // Generate kernel
        let sum = 0;
        for (let i = -radius; i <= radius; i++) {
            const val = Math.exp(-(i * i) / (2 * sigma * sigma));
            kernel.push(val);
            sum += val;
        }
        kernel.forEach((v, i) => kernel[i] = v / sum);

        // Horizontal pass
        const temp = new Float32Array(data.length);
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                let val = 0;
                for (let k = -radius; k <= radius; k++) {
                    const px = Math.min(w - 1, Math.max(0, x + k));
                    val += data[y * w + px] * kernel[k + radius];
                }
                temp[y * w + x] = val;
            }
        }

        // Vertical pass
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                let val = 0;
                for (let k = -radius; k <= radius; k++) {
                    const py = Math.min(h - 1, Math.max(0, y + k));
                    val += temp[py * w + x] * kernel[k + radius];
                }
                result[y * w + x] = val;
            }
        }

        return result;
    }

    function addPaperTexture(ctx, w, h, alpha = 0.1) {
        const imageData = ctx.getImageData(0, 0, w, h);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * 30 * alpha;
            data[i] = Math.min(255, Math.max(0, data[i] + noise));
            data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
            data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
        }

        ctx.putImageData(imageData, 0, 0);
    }

    function download() {
        const link = document.createElement('a');
        link.download = 'sketch-effect.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }
});
