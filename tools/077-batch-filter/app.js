/**
 * Tool #077: Batch Filter
 */
document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const imageInput = document.getElementById('imageInput');
    const filters = document.getElementById('filters');
    const previewGrid = document.getElementById('previewGrid');
    const processBtn = document.getElementById('processBtn');
    const filterBtns = document.querySelectorAll('.filter-btn');

    let images = [];
    let currentFilter = 'none';

    filterBtns.forEach(btn => btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        updatePreview();
    }));

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
        filters.style.display = 'flex';
        processBtn.style.display = 'inline-block';
    }

    function applyFilter(img) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width; canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        if (currentFilter === 'none') return canvas;

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            let r = data[i], g = data[i+1], b = data[i+2];
            switch (currentFilter) {
                case 'grayscale':
                    const gray = 0.299*r + 0.587*g + 0.114*b;
                    r = g = b = gray;
                    break;
                case 'sepia':
                    r = Math.min(255, r*0.393 + g*0.769 + b*0.189);
                    g = Math.min(255, r*0.349 + g*0.686 + b*0.168);
                    b = Math.min(255, r*0.272 + g*0.534 + b*0.131);
                    break;
                case 'invert':
                    r = 255 - r; g = 255 - g; b = 255 - b;
                    break;
                case 'brightness':
                    r = Math.min(255, r * 1.3);
                    g = Math.min(255, g * 1.3);
                    b = Math.min(255, b * 1.3);
                    break;
                case 'contrast':
                    const factor = 1.5;
                    r = Math.min(255, Math.max(0, (r - 128) * factor + 128));
                    g = Math.min(255, Math.max(0, (g - 128) * factor + 128));
                    b = Math.min(255, Math.max(0, (b - 128) * factor + 128));
                    break;
                case 'vintage':
                    r = Math.min(255, r * 1.1 + 20);
                    g = Math.min(255, g * 0.9);
                    b = Math.min(255, b * 0.8);
                    break;
            }
            data[i] = r; data[i+1] = g; data[i+2] = b;
        }

        if (currentFilter === 'blur') {
            // Simple box blur
            const temp = new Uint8ClampedArray(data);
            const w = canvas.width, h = canvas.height;
            for (let y = 1; y < h - 1; y++) {
                for (let x = 1; x < w - 1; x++) {
                    for (let c = 0; c < 3; c++) {
                        let sum = 0;
                        for (let dy = -1; dy <= 1; dy++) {
                            for (let dx = -1; dx <= 1; dx++) {
                                sum += temp[((y + dy) * w + (x + dx)) * 4 + c];
                            }
                        }
                        data[(y * w + x) * 4 + c] = sum / 9;
                    }
                }
            }
        }

        ctx.putImageData(imageData, 0, 0);
        return canvas;
    }

    function updatePreview() {
        previewGrid.innerHTML = '';
        images.forEach((item) => {
            const canvas = applyFilter(item.img);
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
            const canvas = applyFilter(images[i].img);
            const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.9));
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `${currentFilter}_${images[i].file.name}`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
            await new Promise(r => setTimeout(r, 200));
        }
    }
});
