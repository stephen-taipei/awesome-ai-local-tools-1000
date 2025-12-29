/**
 * Tool #090: Double Exposure
 * Create double exposure photo effects
 */
document.addEventListener('DOMContentLoaded', () => {
    const imageInput1 = document.getElementById('imageInput1');
    const imageInput2 = document.getElementById('imageInput2');
    const thumb1 = document.getElementById('thumb1');
    const thumb2 = document.getElementById('thumb2');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const controls = document.getElementById('controls');
    const previewContainer = document.getElementById('previewContainer');
    const blendMode = document.getElementById('blendMode');
    const opacity = document.getElementById('opacity');
    const opacityVal = document.getElementById('opacityVal');
    const contrast = document.getElementById('contrast');
    const contrastVal = document.getElementById('contrastVal');
    const downloadBtn = document.getElementById('downloadBtn');

    let image1 = null;
    let image2 = null;

    // Event listeners
    imageInput1.addEventListener('change', (e) => handleUpload(e, 1));
    imageInput2.addEventListener('change', (e) => handleUpload(e, 2));
    blendMode.addEventListener('change', applyEffect);
    opacity.addEventListener('input', () => { opacityVal.textContent = opacity.value + '%'; applyEffect(); });
    contrast.addEventListener('input', () => { contrastVal.textContent = contrast.value + '%'; applyEffect(); });
    downloadBtn.addEventListener('click', download);

    // Drag and drop
    ['dropZone1', 'dropZone2'].forEach((id, idx) => {
        const zone = document.getElementById(id);
        zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.style.borderColor = '#ffaf7b'; });
        zone.addEventListener('dragleave', () => { zone.style.borderColor = '#d76d77'; });
        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.style.borderColor = '#d76d77';
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                loadImage(file, idx + 1);
            }
        });
    });

    function handleUpload(e, num) {
        const file = e.target.files[0];
        if (file) loadImage(file, num);
    }

    function loadImage(file, num) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                if (num === 1) {
                    image1 = img;
                    thumb1.src = ev.target.result;
                    thumb1.style.display = 'block';
                } else {
                    image2 = img;
                    thumb2.src = ev.target.result;
                    thumb2.style.display = 'block';
                }
                checkAndApply();
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    }

    function checkAndApply() {
        if (image1 && image2) {
            controls.style.display = 'flex';
            previewContainer.style.display = 'flex';
            applyEffect();
        }
    }

    function applyEffect() {
        if (!image1 || !image2) return;

        // Use image1 dimensions
        const w = image1.width;
        const h = image1.height;
        canvas.width = w;
        canvas.height = h;

        const mode = blendMode.value;
        const alpha = parseInt(opacity.value) / 100;
        const contrastVal = parseInt(contrast.value) / 100;

        // Draw base image
        ctx.drawImage(image1, 0, 0);

        // Convert base to grayscale with contrast for classic effect
        const baseData = ctx.getImageData(0, 0, w, h);
        for (let i = 0; i < baseData.data.length; i += 4) {
            let gray = 0.299 * baseData.data[i] + 0.587 * baseData.data[i + 1] + 0.114 * baseData.data[i + 2];
            gray = ((gray - 128) * contrastVal) + 128;
            gray = Math.min(255, Math.max(0, gray));
            baseData.data[i] = gray;
            baseData.data[i + 1] = gray;
            baseData.data[i + 2] = gray;
        }
        ctx.putImageData(baseData, 0, 0);

        // Draw overlay with blend mode
        ctx.globalCompositeOperation = mode;
        ctx.globalAlpha = alpha;

        // Scale image2 to cover
        const scale = Math.max(w / image2.width, h / image2.height);
        const sw = image2.width * scale;
        const sh = image2.height * scale;
        const sx = (w - sw) / 2;
        const sy = (h - sh) / 2;

        ctx.drawImage(image2, sx, sy, sw, sh);

        // Reset
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;

        // Add slight vignette
        addVignette(ctx, w, h);
    }

    function addVignette(ctx, w, h) {
        const gradient = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w, h) * 0.7);
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, 'rgba(0,0,0,0.4)');

        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
        ctx.globalCompositeOperation = 'source-over';
    }

    function download() {
        const link = document.createElement('a');
        link.download = 'double-exposure.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }
});
