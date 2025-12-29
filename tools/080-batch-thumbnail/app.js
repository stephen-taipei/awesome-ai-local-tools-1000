/**
 * Tool #080: Batch Thumbnail
 */
document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const imageInput = document.getElementById('imageInput');
    const controls = document.getElementById('controls');
    const presets = document.getElementById('presets');
    const previewGrid = document.getElementById('previewGrid');
    const thumbWidth = document.getElementById('thumbWidth');
    const thumbHeight = document.getElementById('thumbHeight');
    const fitMode = document.getElementById('fitMode');
    const processBtn = document.getElementById('processBtn');

    let images = [];

    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            thumbWidth.value = btn.dataset.w;
            thumbHeight.value = btn.dataset.h;
            updatePreview();
        });
    });

    [thumbWidth, thumbHeight, fitMode].forEach(el => el.addEventListener('change', updatePreview));

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
                img.onload = () => { images.push({ file, img }); updatePreview(); };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
        controls.style.display = 'flex';
        presets.style.display = 'flex';
        processBtn.style.display = 'inline-block';
    }

    function createThumbnail(img) {
        const tw = parseInt(thumbWidth.value);
        const th = parseInt(thumbHeight.value);
        const mode = fitMode.value;

        const canvas = document.createElement('canvas');
        canvas.width = tw;
        canvas.height = th;
        const ctx = canvas.getContext('2d');

        let sx = 0, sy = 0, sw = img.width, sh = img.height;
        let dx = 0, dy = 0, dw = tw, dh = th;

        if (mode === 'cover') {
            const scale = Math.max(tw / img.width, th / img.height);
            sw = tw / scale;
            sh = th / scale;
            sx = (img.width - sw) / 2;
            sy = (img.height - sh) / 2;
        } else if (mode === 'contain') {
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, tw, th);
            const scale = Math.min(tw / img.width, th / img.height);
            dw = img.width * scale;
            dh = img.height * scale;
            dx = (tw - dw) / 2;
            dy = (th - dh) / 2;
        }

        ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
        return canvas;
    }

    function updatePreview() {
        previewGrid.innerHTML = '';
        const tw = parseInt(thumbWidth.value);
        const th = parseInt(thumbHeight.value);

        images.forEach((item) => {
            const canvas = createThumbnail(item.img);
            const div = document.createElement('div');
            div.className = 'preview-item';
            div.appendChild(canvas);
            div.innerHTML += `<div class="info">${tw}×${th}</div>`;
            previewGrid.appendChild(div);
        });
    }

    async function processAndDownload() {
        for (let i = 0; i < images.length; i++) {
            const canvas = createThumbnail(images[i].img);
            const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.9));
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `thumb_${images[i].file.name}`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
            await new Promise(r => setTimeout(r, 200));
        }
    }
});
