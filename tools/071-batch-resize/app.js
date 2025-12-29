/**
 * Tool #071: Batch Resize
 */
document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const imageInput = document.getElementById('imageInput');
    const controls = document.getElementById('controls');
    const previewSection = document.getElementById('previewSection');
    const previewGrid = document.getElementById('previewGrid');
    const progressFill = document.getElementById('progressFill');
    const resizeMode = document.getElementById('resizeMode');
    const widthGroup = document.getElementById('widthGroup');
    const heightGroup = document.getElementById('heightGroup');
    const percentGroup = document.getElementById('percentGroup');
    const targetWidth = document.getElementById('targetWidth');
    const targetHeight = document.getElementById('targetHeight');
    const percentage = document.getElementById('percentage');
    const keepAspect = document.getElementById('keepAspect');
    const processBtn = document.getElementById('processBtn');

    let images = [];

    resizeMode.addEventListener('change', updateControlsVisibility);
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => { e.preventDefault(); dropZone.classList.remove('dragover'); handleFiles(e.dataTransfer.files); });
    imageInput.addEventListener('change', (e) => handleFiles(e.target.files));
    processBtn.addEventListener('click', processAndDownload);

    function updateControlsVisibility() {
        const mode = resizeMode.value;
        widthGroup.style.display = ['dimensions', 'maxWidth'].includes(mode) ? 'flex' : 'none';
        heightGroup.style.display = ['dimensions', 'maxHeight'].includes(mode) ? 'flex' : 'none';
        percentGroup.style.display = mode === 'percentage' ? 'flex' : 'none';
    }

    function handleFiles(files) {
        images = [];
        Array.from(files).filter(f => f.type.startsWith('image/')).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    images.push({ file, img, src: e.target.result, width: img.width, height: img.height });
                    updatePreview();
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
        controls.style.display = 'flex';
        previewSection.style.display = 'block';
    }

    function updatePreview() {
        previewGrid.innerHTML = '';
        images.forEach((item, index) => {
            const newDims = calculateNewDimensions(item.width, item.height);
            const div = document.createElement('div');
            div.className = 'preview-item';
            div.innerHTML = `
                <img src="${item.src}" alt="Image ${index + 1}">
                <div class="info">
                    <div>${item.file.name.substring(0, 15)}...</div>
                    <div>${item.width}×${item.height} → ${newDims.width}×${newDims.height}</div>
                </div>
            `;
            previewGrid.appendChild(div);
        });
    }

    function calculateNewDimensions(origWidth, origHeight) {
        const mode = resizeMode.value;
        let newWidth, newHeight;

        switch (mode) {
            case 'dimensions':
                newWidth = parseInt(targetWidth.value);
                newHeight = parseInt(targetHeight.value);
                if (keepAspect.checked) {
                    const ratio = Math.min(newWidth / origWidth, newHeight / origHeight);
                    newWidth = Math.round(origWidth * ratio);
                    newHeight = Math.round(origHeight * ratio);
                }
                break;
            case 'percentage':
                const scale = parseInt(percentage.value) / 100;
                newWidth = Math.round(origWidth * scale);
                newHeight = Math.round(origHeight * scale);
                break;
            case 'maxWidth':
                newWidth = Math.min(origWidth, parseInt(targetWidth.value));
                newHeight = Math.round(origHeight * (newWidth / origWidth));
                break;
            case 'maxHeight':
                newHeight = Math.min(origHeight, parseInt(targetHeight.value));
                newWidth = Math.round(origWidth * (newHeight / origHeight));
                break;
        }

        return { width: newWidth, height: newHeight };
    }

    async function processAndDownload() {
        progressFill.style.width = '0%';

        for (let i = 0; i < images.length; i++) {
            const item = images[i];
            const dims = calculateNewDimensions(item.width, item.height);

            const canvas = document.createElement('canvas');
            canvas.width = dims.width;
            canvas.height = dims.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(item.img, 0, 0, dims.width, dims.height);

            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `resized_${item.file.name}`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);

            progressFill.style.width = `${((i + 1) / images.length) * 100}%`;
            await new Promise(r => setTimeout(r, 200));
        }
    }
});
