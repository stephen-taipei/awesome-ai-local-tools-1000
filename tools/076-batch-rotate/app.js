/**
 * Tool #076: Batch Rotate
 */
document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const imageInput = document.getElementById('imageInput');
    const controls = document.getElementById('controls');
    const previewGrid = document.getElementById('previewGrid');
    const processBtn = document.getElementById('processBtn');

    let images = [];
    let rotation = 0;
    let flipH = false, flipV = false;

    document.getElementById('rotateLeft').addEventListener('click', () => { rotation = (rotation - 90) % 360; updatePreview(); });
    document.getElementById('rotateRight').addEventListener('click', () => { rotation = (rotation + 90) % 360; updatePreview(); });
    document.getElementById('rotate180').addEventListener('click', () => { rotation = (rotation + 180) % 360; updatePreview(); });
    document.getElementById('flipH').addEventListener('click', () => { flipH = !flipH; updatePreview(); });
    document.getElementById('flipV').addEventListener('click', () => { flipV = !flipV; updatePreview(); });

    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => { e.preventDefault(); dropZone.classList.remove('dragover'); handleFiles(e.dataTransfer.files); });
    imageInput.addEventListener('change', (e) => handleFiles(e.target.files));
    processBtn.addEventListener('click', processAndDownload);

    function handleFiles(files) {
        images = [];
        rotation = 0; flipH = false; flipV = false;
        Array.from(files).filter(f => f.type.startsWith('image/')).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => { images.push({ file, img }); updatePreview(); };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
        controls.style.display = 'flex';
    }

    function transformImage(img) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const rad = rotation * Math.PI / 180;
        const sin = Math.abs(Math.sin(rad)), cos = Math.abs(Math.cos(rad));
        canvas.width = img.width * cos + img.height * sin;
        canvas.height = img.width * sin + img.height * cos;
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(rad);
        ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        return canvas;
    }

    function updatePreview() {
        previewGrid.innerHTML = '';
        images.forEach((item) => {
            const canvas = transformImage(item.img);
            const div = document.createElement('div');
            div.className = 'preview-item';
            const preview = document.createElement('canvas');
            preview.width = 150; preview.height = 100;
            const scale = Math.min(150 / canvas.width, 100 / canvas.height);
            const pw = canvas.width * scale, ph = canvas.height * scale;
            preview.getContext('2d').drawImage(canvas, (150 - pw) / 2, (100 - ph) / 2, pw, ph);
            div.appendChild(preview);
            previewGrid.appendChild(div);
        });
    }

    async function processAndDownload() {
        for (let i = 0; i < images.length; i++) {
            const canvas = transformImage(images[i].img);
            const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.9));
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `rotated_${images[i].file.name}`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
            await new Promise(r => setTimeout(r, 200));
        }
    }
});
