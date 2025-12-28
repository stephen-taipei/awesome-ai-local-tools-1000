/**
 * Tool #083: ASCII Art
 * Convert images to ASCII character art
 */
document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('imageInput');
    const dropZone = document.getElementById('dropZone');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const controls = document.getElementById('controls');
    const previewContainer = document.getElementById('previewContainer');
    const asciiOutput = document.getElementById('asciiOutput');
    const widthSlider = document.getElementById('width');
    const widthVal = document.getElementById('widthVal');
    const charsetSelect = document.getElementById('charset');
    const invertCheck = document.getElementById('invert');
    const coloredCheck = document.getElementById('colored');
    const downloadBtn = document.getElementById('downloadBtn');
    const downloadImgBtn = document.getElementById('downloadImgBtn');

    const charsets = {
        standard: ' .:-=+*#%@',
        blocks: ' ░▒▓█',
        detailed: ' .\'`^",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$'
    };

    let originalImage = null;

    // Event listeners
    imageInput.addEventListener('change', handleUpload);
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.style.borderColor = '#38ef7d'; });
    dropZone.addEventListener('dragleave', () => { dropZone.style.borderColor = '#11998e'; });
    dropZone.addEventListener('drop', handleDrop);
    widthSlider.addEventListener('input', () => { widthVal.textContent = widthSlider.value; generateAscii(); });
    charsetSelect.addEventListener('change', generateAscii);
    invertCheck.addEventListener('change', generateAscii);
    coloredCheck.addEventListener('change', generateAscii);
    downloadBtn.addEventListener('click', downloadTxt);
    downloadImgBtn.addEventListener('click', downloadImage);

    function handleDrop(e) {
        e.preventDefault();
        dropZone.style.borderColor = '#11998e';
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
                controls.style.display = 'flex';
                previewContainer.style.display = 'flex';
                generateAscii();
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    }

    function generateAscii() {
        if (!originalImage) return;

        const targetWidth = parseInt(widthSlider.value);
        const aspectRatio = originalImage.height / originalImage.width;
        const targetHeight = Math.floor(targetWidth * aspectRatio * 0.5); // 0.5 for character aspect ratio

        canvas.width = targetWidth;
        canvas.height = targetHeight;
        ctx.drawImage(originalImage, 0, 0, targetWidth, targetHeight);

        const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
        const data = imageData.data;
        const charset = charsets[charsetSelect.value];
        const invert = invertCheck.checked;
        const colored = coloredCheck.checked;

        let ascii = '';

        if (colored) {
            asciiOutput.innerHTML = '';
            for (let y = 0; y < targetHeight; y++) {
                for (let x = 0; x < targetWidth; x++) {
                    const i = (y * targetWidth + x) * 4;
                    const r = data[i], g = data[i + 1], b = data[i + 2];
                    let brightness = (r + g + b) / 3;
                    if (invert) brightness = 255 - brightness;
                    const charIndex = Math.floor((brightness / 255) * (charset.length - 1));
                    const char = charset[charIndex];
                    const span = document.createElement('span');
                    span.style.color = `rgb(${r},${g},${b})`;
                    span.textContent = char;
                    asciiOutput.appendChild(span);
                }
                asciiOutput.appendChild(document.createTextNode('\n'));
            }
        } else {
            for (let y = 0; y < targetHeight; y++) {
                for (let x = 0; x < targetWidth; x++) {
                    const i = (y * targetWidth + x) * 4;
                    let brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
                    if (invert) brightness = 255 - brightness;
                    const charIndex = Math.floor((brightness / 255) * (charset.length - 1));
                    ascii += charset[charIndex];
                }
                ascii += '\n';
            }
            asciiOutput.textContent = ascii;
        }
    }

    function downloadTxt() {
        const text = asciiOutput.textContent;
        const blob = new Blob([text], { type: 'text/plain' });
        const link = document.createElement('a');
        link.download = 'ascii-art.txt';
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
    }

    function downloadImage() {
        const fontSize = 10;
        const lineHeight = fontSize;
        const lines = asciiOutput.textContent.split('\n');
        const maxWidth = Math.max(...lines.map(l => l.length));

        const imgCanvas = document.createElement('canvas');
        imgCanvas.width = maxWidth * fontSize * 0.6;
        imgCanvas.height = lines.length * lineHeight;
        const imgCtx = imgCanvas.getContext('2d');

        imgCtx.fillStyle = '#1a1a2e';
        imgCtx.fillRect(0, 0, imgCanvas.width, imgCanvas.height);
        imgCtx.font = `${fontSize}px monospace`;
        imgCtx.fillStyle = '#11998e';

        lines.forEach((line, i) => {
            imgCtx.fillText(line, 0, (i + 1) * lineHeight);
        });

        const link = document.createElement('a');
        link.download = 'ascii-art.png';
        link.href = imgCanvas.toDataURL('image/png');
        link.click();
    }
});
