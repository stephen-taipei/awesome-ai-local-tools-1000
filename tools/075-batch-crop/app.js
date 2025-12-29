/**
 * Tool #075: Batch Crop
 */
document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const imageInput = document.getElementById('imageInput');
    const controls = document.getElementById('controls');
    const previewGrid = document.getElementById('previewGrid');
    const aspectRatio = document.getElementById('aspectRatio');
    const customW = document.getElementById('customW');
    const customH = document.getElementById('customH');
    const customSep = document.getElementById('customSep');
    const cropPosition = document.getElementById('cropPosition');
    const processBtn = document.getElementById('processBtn');

    let images = [];

    aspectRatio.addEventListener('change', () => {
        const custom = aspectRatio.value === 'custom';
        customW.style.display = customH.style.display = customSep.style.display = custom ? 'inline' : 'none';
        updatePreview();
    });
    [customW, customH, cropPosition].forEach(el => el.addEventListener('change', updatePreview));

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
    }

    function getAspectRatio() {
        if (aspectRatio.value === 'custom') {
            return [parseInt(customW.value) || 1, parseInt(customH.value) || 1];
        }
        return aspectRatio.value.split(':').map(Number);
    }

    function cropImage(img) {
        const [rw, rh] = getAspectRatio();
        const targetRatio = rw / rh;
        const imgRatio = img.width / img.height;

        let cropW, cropH, cropX, cropY;
        if (imgRatio > targetRatio) {
            cropH = img.height;
            cropW = img.height * targetRatio;
            cropX = (img.width - cropW) / 2;
            cropY = 0;
        } else {
            cropW = img.width;
            cropH = img.width / targetRatio;
            cropX = 0;
            const pos = cropPosition.value;
            if (pos === 'top') cropY = 0;
            else if (pos === 'bottom') cropY = img.height - cropH;
            else cropY = (img.height - cropH) / 2;
        }

        const canvas = document.createElement('canvas');
        canvas.width = cropW;
        canvas.height = cropH;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
        return canvas;
    }

    function updatePreview() {
        previewGrid.innerHTML = '';
        images.forEach((item) => {
            const canvas = cropImage(item.img);
            const div = document.createElement('div');
            div.className = 'preview-item';
            const preview = document.createElement('canvas');
            preview.width = 150;
            preview.height = 100;
            preview.getContext('2d').drawImage(canvas, 0, 0, 150, 100);
            div.appendChild(preview);
            previewGrid.appendChild(div);
        });
    }

    async function processAndDownload() {
        for (let i = 0; i < images.length; i++) {
            const canvas = cropImage(images[i].img);
            const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.9));
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `cropped_${images[i].file.name}`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
            await new Promise(r => setTimeout(r, 200));
        }
    }
});
