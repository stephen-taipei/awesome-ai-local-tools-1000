/**
 * Tool #082: Pixel Art
 */
document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('imageInput');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const controls = document.getElementById('controls');
    const previewContainer = document.getElementById('previewContainer');
    const pixelSize = document.getElementById('pixelSize');
    const colorCount = document.getElementById('colorCount');
    const sizeVal = document.getElementById('sizeVal');
    const colorVal = document.getElementById('colorVal');
    const downloadBtn = document.getElementById('downloadBtn');

    let originalImage = null;

    imageInput.addEventListener('change', handleUpload);
    pixelSize.addEventListener('input', () => { sizeVal.textContent = pixelSize.value + 'px'; applyEffect(); });
    colorCount.addEventListener('input', () => { colorVal.textContent = colorCount.value; applyEffect(); });
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
        const size = parseInt(pixelSize.value);
        const colors = parseInt(colorCount.value);
        const w = originalImage.width, h = originalImage.height;

        // Scale down
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = Math.ceil(w / size);
        tempCanvas.height = Math.ceil(h / size);
        tempCtx.drawImage(originalImage, 0, 0, tempCanvas.width, tempCanvas.height);

        // Get pixel data and quantize colors
        const imgData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const data = imgData.data;

        const step = Math.floor(256 / Math.pow(colors, 1/3));
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.round(data[i] / step) * step;
            data[i + 1] = Math.round(data[i + 1] / step) * step;
            data[i + 2] = Math.round(data[i + 2] / step) * step;
        }
        tempCtx.putImageData(imgData, 0, 0);

        // Scale up with nearest neighbor
        canvas.width = w;
        canvas.height = h;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(tempCanvas, 0, 0, w, h);
    }

    function download() {
        const link = document.createElement('a');
        link.download = 'pixel-art.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }
});
