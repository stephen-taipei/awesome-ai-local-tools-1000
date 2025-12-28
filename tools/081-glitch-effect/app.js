/**
 * Tool #081: Glitch Effect
 */
document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('imageInput');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const controls = document.getElementById('controls');
    const previewContainer = document.getElementById('previewContainer');
    const intensity = document.getElementById('intensity');
    const rgbSplit = document.getElementById('rgbSplit');
    const scanLines = document.getElementById('scanLines');
    const randomizeBtn = document.getElementById('randomize');
    const downloadBtn = document.getElementById('downloadBtn');

    let originalImage = null;

    imageInput.addEventListener('change', handleUpload);
    [intensity, rgbSplit, scanLines].forEach(el => el.addEventListener('input', applyEffect));
    randomizeBtn.addEventListener('click', randomize);
    downloadBtn.addEventListener('click', download);

    function handleUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                originalImage = img;
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
        ctx.drawImage(originalImage, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const w = canvas.width, h = canvas.height;
        const intensityVal = parseInt(intensity.value);
        const rgbVal = parseInt(rgbSplit.value);
        const scanVal = parseInt(scanLines.value);

        // Glitch slices
        for (let i = 0; i < intensityVal; i++) {
            const y = Math.floor(Math.random() * h);
            const sliceH = Math.floor(Math.random() * 20) + 5;
            const offset = (Math.random() - 0.5) * 50;

            const sliceData = ctx.getImageData(0, y, w, sliceH);
            ctx.putImageData(sliceData, offset, y);
        }

        // RGB split
        if (rgbVal > 0) {
            const imgData = ctx.getImageData(0, 0, w, h);
            const result = new Uint8ClampedArray(imgData.data);

            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    const i = (y * w + x) * 4;
                    const rOffset = Math.min(w - 1, x + rgbVal);
                    const bOffset = Math.max(0, x - rgbVal);
                    result[i] = imgData.data[(y * w + rOffset) * 4];
                    result[i + 2] = imgData.data[(y * w + bOffset) * 4 + 2];
                }
            }
            imgData.data.set(result);
            ctx.putImageData(imgData, 0, 0);
        }

        // Scan lines
        if (scanVal > 0) {
            ctx.fillStyle = `rgba(0,0,0,${scanVal / 20})`;
            for (let y = 0; y < h; y += 2) {
                ctx.fillRect(0, y, w, 1);
            }
        }
    }

    function randomize() {
        intensity.value = Math.floor(Math.random() * 50) + 1;
        rgbSplit.value = Math.floor(Math.random() * 30);
        scanLines.value = Math.floor(Math.random() * 10);
        applyEffect();
    }

    function download() {
        const link = document.createElement('a');
        link.download = 'glitch-effect.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }
});
