/**
 * Tool #079: Batch Metadata
 */
document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const imageInput = document.getElementById('imageInput');
    const fileList = document.getElementById('fileList');
    const stripBtn = document.getElementById('stripBtn');
    const exportBtn = document.getElementById('exportBtn');

    let images = [];

    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => { e.preventDefault(); dropZone.classList.remove('dragover'); handleFiles(e.dataTransfer.files); });
    imageInput.addEventListener('change', (e) => handleFiles(e.target.files));
    stripBtn.addEventListener('click', stripMetadata);
    exportBtn.addEventListener('click', exportCSV);

    function handleFiles(files) {
        images = [];
        fileList.innerHTML = '';

        Array.from(files).filter(f => f.type.startsWith('image/')).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const metadata = extractMetadata(file, img);
                    images.push({ file, img, src: e.target.result, metadata });
                    displayFile(file, e.target.result, metadata);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });

        stripBtn.style.display = 'inline-block';
        exportBtn.style.display = 'inline-block';
    }

    function extractMetadata(file, img) {
        return {
            name: file.name,
            type: file.type,
            size: formatSize(file.size),
            width: img.width,
            height: img.height,
            aspectRatio: (img.width / img.height).toFixed(2),
            lastModified: new Date(file.lastModified).toLocaleString(),
            megapixels: ((img.width * img.height) / 1000000).toFixed(2) + ' MP'
        };
    }

    function displayFile(file, src, metadata) {
        const div = document.createElement('div');
        div.className = 'file-item';
        div.innerHTML = `
            <div class="file-header">
                <img src="${src}" alt="${file.name}">
                <h4>${file.name}</h4>
            </div>
            <div class="metadata-grid">
                <div class="metadata-item"><label>Type | 類型</label><span>${metadata.type}</span></div>
                <div class="metadata-item"><label>Size | 大小</label><span>${metadata.size}</span></div>
                <div class="metadata-item"><label>Dimensions | 尺寸</label><span>${metadata.width} × ${metadata.height}</span></div>
                <div class="metadata-item"><label>Aspect Ratio | 比例</label><span>${metadata.aspectRatio}</span></div>
                <div class="metadata-item"><label>Resolution | 解析度</label><span>${metadata.megapixels}</span></div>
                <div class="metadata-item"><label>Modified | 修改時間</label><span>${metadata.lastModified}</span></div>
            </div>
        `;
        fileList.appendChild(div);
    }

    async function stripMetadata() {
        for (let i = 0; i < images.length; i++) {
            const item = images[i];
            const canvas = document.createElement('canvas');
            canvas.width = item.img.width;
            canvas.height = item.img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(item.img, 0, 0);

            const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.95));
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `clean_${item.file.name}`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
            await new Promise(r => setTimeout(r, 200));
        }
    }

    function exportCSV() {
        let csv = 'Name,Type,Size,Width,Height,Aspect Ratio,Megapixels,Last Modified\n';
        images.forEach(item => {
            const m = item.metadata;
            csv += `"${m.name}","${m.type}","${m.size}",${m.width},${m.height},${m.aspectRatio},${m.megapixels},"${m.lastModified}"\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'image-metadata.csv';
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    }

    function formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
});
