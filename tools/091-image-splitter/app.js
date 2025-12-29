/**
 * Tool #091: Image Splitter
 * Split images into grid tiles
 */
document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('imageInput');
    const dropZone = document.getElementById('dropZone');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const controls = document.getElementById('controls');
    const previewContainer = document.getElementById('previewContainer');
    const gridPreview = document.getElementById('gridPreview');
    const cols = document.getElementById('cols');
    const rows = document.getElementById('rows');
    const splitBtn = document.getElementById('splitBtn');
    const downloadAllBtn = document.getElementById('downloadAllBtn');

    let originalImage = null;
    let tiles = [];

    // Event listeners
    imageInput.addEventListener('change', handleUpload);
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.style.borderColor = '#00f2fe'; });
    dropZone.addEventListener('dragleave', () => { dropZone.style.borderColor = '#4facfe'; });
    dropZone.addEventListener('drop', handleDrop);
    splitBtn.addEventListener('click', splitImage);
    downloadAllBtn.addEventListener('click', downloadAll);
    cols.addEventListener('change', updatePreview);
    rows.addEventListener('change', updatePreview);

    function handleDrop(e) {
        e.preventDefault();
        dropZone.style.borderColor = '#4facfe';
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            loadImage(file);
        }
    }

    function handleUpload(e) {
        const file = e.target.files[0];
        if (file) loadImage(file);
    }

    function loadImage(file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                originalImage = img;
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                controls.style.display = 'flex';
                previewContainer.style.display = 'flex';
                updatePreview();
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    }

    function updatePreview() {
        if (!originalImage) return;

        const numCols = parseInt(cols.value);
        const numRows = parseInt(rows.value);
        const w = originalImage.width;
        const h = originalImage.height;

        // Draw grid lines on preview
        ctx.drawImage(originalImage, 0, 0);
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
        ctx.lineWidth = 2;

        const tileW = w / numCols;
        const tileH = h / numRows;

        for (let i = 1; i < numCols; i++) {
            ctx.beginPath();
            ctx.moveTo(i * tileW, 0);
            ctx.lineTo(i * tileW, h);
            ctx.stroke();
        }

        for (let i = 1; i < numRows; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i * tileH);
            ctx.lineTo(w, i * tileH);
            ctx.stroke();
        }

        // Show grid placeholder
        gridPreview.innerHTML = '';
        gridPreview.style.gridTemplateColumns = `repeat(${numCols}, 1fr)`;

        for (let r = 0; r < numRows; r++) {
            for (let c = 0; c < numCols; c++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.textContent = `${r * numCols + c + 1}`;
                gridPreview.appendChild(cell);
            }
        }
    }

    function splitImage() {
        if (!originalImage) return;

        const numCols = parseInt(cols.value);
        const numRows = parseInt(rows.value);
        const w = originalImage.width;
        const h = originalImage.height;
        const tileW = Math.floor(w / numCols);
        const tileH = Math.floor(h / numRows);

        tiles = [];
        gridPreview.innerHTML = '';
        gridPreview.style.gridTemplateColumns = `repeat(${numCols}, 1fr)`;

        for (let r = 0; r < numRows; r++) {
            for (let c = 0; c < numCols; c++) {
                const tileCanvas = document.createElement('canvas');
                tileCanvas.width = tileW;
                tileCanvas.height = tileH;
                const tileCtx = tileCanvas.getContext('2d');

                tileCtx.drawImage(
                    originalImage,
                    c * tileW, r * tileH, tileW, tileH,
                    0, 0, tileW, tileH
                );

                tiles.push({
                    canvas: tileCanvas,
                    row: r,
                    col: c
                });

                // Add to preview
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.style.padding = '0';
                cell.style.cursor = 'pointer';

                const preview = document.createElement('canvas');
                preview.width = tileW;
                preview.height = tileH;
                preview.getContext('2d').drawImage(tileCanvas, 0, 0);
                preview.style.width = '100%';
                preview.style.height = 'auto';
                preview.title = `Click to download tile ${r * numCols + c + 1}`;

                preview.addEventListener('click', () => {
                    const link = document.createElement('a');
                    link.download = `tile-${r + 1}-${c + 1}.png`;
                    link.href = tileCanvas.toDataURL('image/png');
                    link.click();
                });

                cell.appendChild(preview);
                gridPreview.appendChild(cell);
            }
        }
    }

    async function downloadAll() {
        if (tiles.length === 0) {
            splitImage();
        }

        // Simple approach: download each file with a delay
        // For a real ZIP, we'd need JSZip library
        const downloadWithDelay = async (index) => {
            if (index >= tiles.length) return;

            const tile = tiles[index];
            const link = document.createElement('a');
            link.download = `tile-${tile.row + 1}-${tile.col + 1}.png`;
            link.href = tile.canvas.toDataURL('image/png');
            link.click();

            await new Promise(resolve => setTimeout(resolve, 200));
            downloadWithDelay(index + 1);
        };

        // Create a simple combined download info
        const info = `Image Split Info\n================\nOriginal size: ${originalImage.width} x ${originalImage.height}\nGrid: ${cols.value} x ${rows.value}\nTile size: ${Math.floor(originalImage.width / cols.value)} x ${Math.floor(originalImage.height / rows.value)}\nTotal tiles: ${tiles.length}`;

        console.log(info);
        downloadWithDelay(0);
    }
});
