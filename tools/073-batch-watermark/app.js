/**
 * Tool #073: Batch Watermark
 */
document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const imageInput = document.getElementById('imageInput');
    const controls = document.getElementById('controls');
    const previewGrid = document.getElementById('previewGrid');
    const watermarkText = document.getElementById('watermarkText');
    const position = document.getElementById('position');
    const fontSize = document.getElementById('fontSize');
    const textColor = document.getElementById('textColor');
    const opacity = document.getElementById('opacity');
    const processBtn = document.getElementById('processBtn');

    let images = [];

    [watermarkText, position, fontSize, textColor, opacity].forEach(el => el.addEventListener('input', updatePreview));

    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => { e.preventDefault(); dropZone.classList.remove('dragover'); handleFiles(e.dataTransfer.files); });
    imageInput.addEventListener('change', (e) => handleFiles(e.target.files));
    processBtn.addEventListener('click', processAndDownload);

    function handleFiles(files) {
        images = [];
        Array.from(files).filter(f => f.type.startsWith('image/')).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    images.push({ file, img });
                    updatePreview();
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
        controls.style.display = 'flex';
    }

    function updatePreview() {
        previewGrid.innerHTML = '';
        images.forEach((item, index) => {
            const canvas = createWatermarkedCanvas(item.img);
            const div = document.createElement('div');
            div.className = 'preview-item';
            div.appendChild(canvas);
            previewGrid.appendChild(div);
        });
    }

    function createWatermarkedCanvas(img) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const text = watermarkText.value || '© 2024';
        const size = parseInt(fontSize.value);
        const color = textColor.value;
        const alpha = parseInt(opacity.value) / 100;

        ctx.font = `${size}px Arial`;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;

        const metrics = ctx.measureText(text);
        const padding = 20;
        let x, y;

        switch (position.value) {
            case 'topLeft': x = padding; y = size + padding; break;
            case 'topRight': x = canvas.width - metrics.width - padding; y = size + padding; break;
            case 'bottomLeft': x = padding; y = canvas.height - padding; break;
            case 'bottomRight': x = canvas.width - metrics.width - padding; y = canvas.height - padding; break;
            case 'center': x = (canvas.width - metrics.width) / 2; y = canvas.height / 2; break;
        }

        ctx.strokeText(text, x, y);
        ctx.fillText(text, x, y);
        ctx.globalAlpha = 1;

        return canvas;
    }

    async function processAndDownload() {
        for (let i = 0; i < images.length; i++) {
            const canvas = createWatermarkedCanvas(images[i].img);
            const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.9));
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `watermarked_${images[i].file.name}`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
            await new Promise(r => setTimeout(r, 200));
        }
    }
});
