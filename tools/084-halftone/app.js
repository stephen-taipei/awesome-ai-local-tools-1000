/**
 * Tool #084: Halftone Effect
 * Create halftone dot pattern effects
 */
document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('imageInput');
    const dropZone = document.getElementById('dropZone');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const controls = document.getElementById('controls');
    const previewContainer = document.getElementById('previewContainer');
    const dotSize = document.getElementById('dotSize');
    const dotVal = document.getElementById('dotVal');
    const spacing = document.getElementById('spacing');
    const spacingVal = document.getElementById('spacingVal');
    const styleSelect = document.getElementById('style');
    const colorMode = document.getElementById('colorMode');
    const downloadBtn = document.getElementById('downloadBtn');

    let originalImage = null;
    let tempCanvas = document.createElement('canvas');
    let tempCtx = tempCanvas.getContext('2d');

    // Event listeners
    imageInput.addEventListener('change', handleUpload);
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.style.borderColor = '#feca57'; });
    dropZone.addEventListener('dragleave', () => { dropZone.style.borderColor = '#ff6b6b'; });
    dropZone.addEventListener('drop', handleDrop);
    dotSize.addEventListener('input', () => { dotVal.textContent = dotSize.value; applyEffect(); });
    spacing.addEventListener('input', () => { spacingVal.textContent = spacing.value; applyEffect(); });
    styleSelect.addEventListener('change', applyEffect);
    colorMode.addEventListener('change', applyEffect);
    downloadBtn.addEventListener('click', download);

    function handleDrop(e) {
        e.preventDefault();
        dropZone.style.borderColor = '#ff6b6b';
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
                tempCanvas.width = img.width;
                tempCanvas.height = img.height;
                tempCtx.drawImage(img, 0, 0);
                canvas.width = img.width;
                canvas.height = img.height;
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

        const dot = parseInt(dotSize.value);
        const space = parseInt(spacing.value);
        const style = styleSelect.value;
        const mode = colorMode.value;
        const w = canvas.width, h = canvas.height;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);

        const imageData = tempCtx.getImageData(0, 0, w, h);
        const data = imageData.data;

        if (mode === 'cmyk') {
            // CMYK halftone with angle offset
            const angles = [15, 75, 0, 45]; // C, M, Y, K
            const colors = ['cyan', 'magenta', 'yellow', 'black'];

            colors.forEach((color, idx) => {
                ctx.globalCompositeOperation = idx === 0 ? 'source-over' : 'multiply';
                drawHalftoneLayer(data, w, h, space, dot, style, color, angles[idx]);
            });
            ctx.globalCompositeOperation = 'source-over';
        } else if (mode === 'rgb') {
            for (let y = 0; y < h; y += space) {
                for (let x = 0; x < w; x += space) {
                    const i = (Math.floor(y) * w + Math.floor(x)) * 4;
                    const r = data[i], g = data[i + 1], b = data[i + 2];

                    ctx.fillStyle = `rgb(${r},${g},${b})`;
                    const brightness = (r + g + b) / 3 / 255;
                    const size = dot * (1 - brightness);
                    drawShape(ctx, x, y, size, style);
                }
            }
        } else {
            // Black and white
            for (let y = 0; y < h; y += space) {
                for (let x = 0; x < w; x += space) {
                    const i = (Math.floor(y) * w + Math.floor(x)) * 4;
                    const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3 / 255;
                    const size = dot * (1 - brightness);

                    ctx.fillStyle = '#000000';
                    drawShape(ctx, x, y, size, style);
                }
            }
        }
    }

    function drawHalftoneLayer(data, w, h, space, dot, style, color, angle) {
        const rad = angle * Math.PI / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        for (let y = -h; y < h * 2; y += space) {
            for (let x = -w; x < w * 2; x += space) {
                const rx = x * cos - y * sin;
                const ry = x * sin + y * cos;

                if (rx >= 0 && rx < w && ry >= 0 && ry < h) {
                    const i = (Math.floor(ry) * w + Math.floor(rx)) * 4;
                    const r = data[i], g = data[i + 1], b = data[i + 2];

                    let value;
                    switch (color) {
                        case 'cyan': value = 1 - r / 255; break;
                        case 'magenta': value = 1 - g / 255; break;
                        case 'yellow': value = 1 - b / 255; break;
                        case 'black': value = 1 - (r + g + b) / 3 / 255; break;
                    }

                    const size = dot * value;
                    ctx.fillStyle = color === 'black' ? '#000' : color;
                    drawShape(ctx, rx, ry, size, style);
                }
            }
        }
    }

    function drawShape(ctx, x, y, size, style) {
        if (size < 0.5) return;

        ctx.beginPath();
        switch (style) {
            case 'circles':
                ctx.arc(x, y, size / 2, 0, Math.PI * 2);
                break;
            case 'squares':
                ctx.rect(x - size / 2, y - size / 2, size, size);
                break;
            case 'diamonds':
                ctx.moveTo(x, y - size / 2);
                ctx.lineTo(x + size / 2, y);
                ctx.lineTo(x, y + size / 2);
                ctx.lineTo(x - size / 2, y);
                ctx.closePath();
                break;
        }
        ctx.fill();
    }

    function download() {
        const link = document.createElement('a');
        link.download = 'halftone-effect.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }
});
