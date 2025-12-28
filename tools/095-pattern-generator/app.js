/**
 * Tool #095: Pattern Generator
 * Generate seamless patterns and textures
 */
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const pattern = document.getElementById('pattern');
    const size = document.getElementById('size');
    const sizeVal = document.getElementById('sizeVal');
    const color1 = document.getElementById('color1');
    const color2 = document.getElementById('color2');
    const rotation = document.getElementById('rotation');
    const rotVal = document.getElementById('rotVal');
    const widthInput = document.getElementById('width');
    const heightInput = document.getElementById('height');
    const randomBtn = document.getElementById('randomBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const downloadTileBtn = document.getElementById('downloadTileBtn');

    let tileCanvas = document.createElement('canvas');
    let tileCtx = tileCanvas.getContext('2d');

    // Event listeners
    [pattern, size, color1, color2, rotation, widthInput, heightInput].forEach(el => {
        el.addEventListener('input', generatePattern);
        el.addEventListener('change', generatePattern);
    });
    size.addEventListener('input', () => { sizeVal.textContent = size.value; });
    rotation.addEventListener('input', () => { rotVal.textContent = rotation.value; });
    randomBtn.addEventListener('click', randomize);
    downloadBtn.addEventListener('click', download);
    downloadTileBtn.addEventListener('click', downloadTile);

    // Initial generation
    generatePattern();

    function generatePattern() {
        const w = parseInt(widthInput.value);
        const h = parseInt(heightInput.value);
        const s = parseInt(size.value);
        const c1 = color1.value;
        const c2 = color2.value;
        const rot = parseInt(rotation.value) * Math.PI / 180;
        const type = pattern.value;

        canvas.width = w;
        canvas.height = h;

        // Generate tile
        generateTile(type, s, c1, c2);

        // Fill canvas with rotated pattern
        ctx.fillStyle = c2;
        ctx.fillRect(0, 0, w, h);

        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.rotate(rot);
        ctx.translate(-w / 2, -h / 2);

        const pat = ctx.createPattern(tileCanvas, 'repeat');
        ctx.fillStyle = pat;
        ctx.fillRect(-w, -h, w * 3, h * 3);
        ctx.restore();
    }

    function generateTile(type, s, c1, c2) {
        tileCanvas.width = s * 2;
        tileCanvas.height = s * 2;
        tileCtx.fillStyle = c2;
        tileCtx.fillRect(0, 0, tileCanvas.width, tileCanvas.height);
        tileCtx.fillStyle = c1;

        switch (type) {
            case 'stripes':
                tileCanvas.width = s;
                tileCanvas.height = s;
                tileCtx.fillStyle = c2;
                tileCtx.fillRect(0, 0, s, s);
                tileCtx.fillStyle = c1;
                tileCtx.fillRect(0, 0, s / 2, s);
                break;

            case 'dots':
                const dotR = s / 4;
                tileCtx.beginPath();
                tileCtx.arc(s / 2, s / 2, dotR, 0, Math.PI * 2);
                tileCtx.arc(s * 1.5, s * 1.5, dotR, 0, Math.PI * 2);
                tileCtx.fill();
                break;

            case 'checkers':
                tileCtx.fillRect(0, 0, s, s);
                tileCtx.fillRect(s, s, s, s);
                break;

            case 'triangles':
                tileCtx.beginPath();
                tileCtx.moveTo(s, 0);
                tileCtx.lineTo(s * 2, s);
                tileCtx.lineTo(0, s);
                tileCtx.closePath();
                tileCtx.fill();
                tileCtx.beginPath();
                tileCtx.moveTo(s, s * 2);
                tileCtx.lineTo(0, s);
                tileCtx.lineTo(s * 2, s);
                tileCtx.closePath();
                tileCtx.fill();
                break;

            case 'hexagons':
                drawHexPattern(tileCtx, s, c1, c2);
                break;

            case 'waves':
                tileCanvas.width = s * 2;
                tileCanvas.height = s;
                tileCtx.fillStyle = c2;
                tileCtx.fillRect(0, 0, tileCanvas.width, tileCanvas.height);
                tileCtx.strokeStyle = c1;
                tileCtx.lineWidth = s / 5;
                tileCtx.beginPath();
                for (let x = 0; x <= s * 2; x += 2) {
                    const y = Math.sin(x / s * Math.PI * 2) * s / 4 + s / 2;
                    x === 0 ? tileCtx.moveTo(x, y) : tileCtx.lineTo(x, y);
                }
                tileCtx.stroke();
                break;

            case 'zigzag':
                tileCanvas.height = s;
                tileCtx.fillStyle = c2;
                tileCtx.fillRect(0, 0, tileCanvas.width, tileCanvas.height);
                tileCtx.strokeStyle = c1;
                tileCtx.lineWidth = s / 5;
                tileCtx.beginPath();
                tileCtx.moveTo(0, s / 2);
                tileCtx.lineTo(s / 2, 0);
                tileCtx.lineTo(s, s / 2);
                tileCtx.lineTo(s * 1.5, 0);
                tileCtx.lineTo(s * 2, s / 2);
                tileCtx.stroke();
                break;

            case 'diamonds':
                tileCtx.beginPath();
                tileCtx.moveTo(s, 0);
                tileCtx.lineTo(s * 2, s);
                tileCtx.lineTo(s, s * 2);
                tileCtx.lineTo(0, s);
                tileCtx.closePath();
                tileCtx.fill();
                break;

            case 'noise':
                const imageData = tileCtx.createImageData(s * 2, s * 2);
                const c1Rgb = hexToRgb(c1);
                const c2Rgb = hexToRgb(c2);
                for (let i = 0; i < imageData.data.length; i += 4) {
                    const t = Math.random();
                    imageData.data[i] = c1Rgb.r * t + c2Rgb.r * (1 - t);
                    imageData.data[i + 1] = c1Rgb.g * t + c2Rgb.g * (1 - t);
                    imageData.data[i + 2] = c1Rgb.b * t + c2Rgb.b * (1 - t);
                    imageData.data[i + 3] = 255;
                }
                tileCtx.putImageData(imageData, 0, 0);
                break;
        }
    }

    function drawHexPattern(ctx, s, c1, c2) {
        const h = s * Math.sqrt(3) / 2;
        tileCanvas.width = s * 3;
        tileCanvas.height = h * 2;
        ctx.fillStyle = c2;
        ctx.fillRect(0, 0, tileCanvas.width, tileCanvas.height);
        ctx.fillStyle = c1;

        function drawHex(cx, cy, r) {
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = Math.PI / 3 * i - Math.PI / 6;
                const x = cx + r * Math.cos(angle);
                const y = cy + r * Math.sin(angle);
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
        }

        drawHex(s, h, s * 0.4);
        drawHex(s * 2.5, h, s * 0.4);
    }

    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    function randomize() {
        const patterns = ['stripes', 'dots', 'checkers', 'triangles', 'hexagons', 'waves', 'zigzag', 'diamonds', 'noise'];
        pattern.value = patterns[Math.floor(Math.random() * patterns.length)];
        size.value = Math.floor(Math.random() * 70) + 20;
        sizeVal.textContent = size.value;
        color1.value = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        color2.value = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        rotation.value = Math.floor(Math.random() * 360);
        rotVal.textContent = rotation.value;
        generatePattern();
    }

    function download() {
        const link = document.createElement('a');
        link.download = 'pattern.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    function downloadTile() {
        const link = document.createElement('a');
        link.download = 'pattern-tile.png';
        link.href = tileCanvas.toDataURL('image/png');
        link.click();
    }
});
