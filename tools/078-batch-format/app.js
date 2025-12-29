/**
 * Tool #078: Batch Format Conversion
 */
document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const imageInput = document.getElementById('imageInput');
    const controls = document.getElementById('controls');
    const previewGrid = document.getElementById('previewGrid');
    const outputFormat = document.getElementById('outputFormat');
    const quality = document.getElementById('quality');
    const processBtn = document.getElementById('processBtn');

    let images = [];

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
                img.onload = () => { images.push({ file, img, src: e.target.result }); updatePreview(); };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
        controls.style.display = 'flex';
    }

    function updatePreview() {
        previewGrid.innerHTML = '';
        const format = outputFormat.value;
        const ext = format === 'jpeg' ? 'jpg' : format;

        images.forEach((item) => {
            const newName = item.file.name.replace(/\.[^/.]+$/, '') + '.' + ext;
            const div = document.createElement('div');
            div.className = 'preview-item';
            div.innerHTML = `
                <img src="${item.src}" alt="Preview">
                <div class="info">${item.file.name.substring(0, 15)}...</div>
                <div class="info">→ ${newName}</div>
            `;
            previewGrid.appendChild(div);
        });
    }

    [outputFormat, quality].forEach(el => el.addEventListener('change', updatePreview));

    async function processAndDownload() {
        const format = outputFormat.value;
        const qual = parseFloat(quality.value);
        const mimeType = `image/${format}`;
        const ext = format === 'jpeg' ? 'jpg' : format;

        for (let i = 0; i < images.length; i++) {
            const item = images[i];
            const canvas = document.createElement('canvas');
            canvas.width = item.img.width;
            canvas.height = item.img.height;
            const ctx = canvas.getContext('2d');

            if (format === 'jpeg') {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            ctx.drawImage(item.img, 0, 0);

            const blob = await new Promise(r => canvas.toBlob(r, mimeType, qual));
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = item.file.name.replace(/\.[^/.]+$/, '') + '.' + ext;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
            await new Promise(r => setTimeout(r, 200));
        }
    }
});
