/**
 * Tool #093: Sprite Sheet Generator
 * Create sprite sheets from multiple images
 */
document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('imageInput');
    const dropZone = document.getElementById('dropZone');
    const frameList = document.getElementById('frameList');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const controls = document.getElementById('controls');
    const previewContainer = document.getElementById('previewContainer');
    const infoBox = document.getElementById('infoBox');
    const cols = document.getElementById('cols');
    const frameW = document.getElementById('frameW');
    const frameH = document.getElementById('frameH');
    const padding = document.getElementById('padding');
    const generateBtn = document.getElementById('generateBtn');
    const clearBtn = document.getElementById('clearBtn');
    const downloadBtn = document.getElementById('downloadBtn');

    let frames = [];

    // Event listeners
    imageInput.addEventListener('change', handleUpload);
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.style.borderColor = '#2575fc'; });
    dropZone.addEventListener('dragleave', () => { dropZone.style.borderColor = '#6a11cb'; });
    dropZone.addEventListener('drop', handleDrop);
    generateBtn.addEventListener('click', generateSpriteSheet);
    clearBtn.addEventListener('click', clearFrames);
    downloadBtn.addEventListener('click', download);
    [cols, frameW, frameH, padding].forEach(el => el.addEventListener('change', generateSpriteSheet));

    function handleDrop(e) {
        e.preventDefault();
        dropZone.style.borderColor = '#6a11cb';
        const files = Array.from(e.dataTransfer.files)
            .filter(f => f.type.startsWith('image/'))
            .sort((a, b) => a.name.localeCompare(b.name));
        loadImages(files);
    }

    function handleUpload(e) {
        const files = Array.from(e.target.files).sort((a, b) => a.name.localeCompare(b.name));
        loadImages(files);
    }

    function loadImages(files) {
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const img = new Image();
                img.onload = () => {
                    frames.push({ img, name: file.name });
                    updateFrameList();
                    if (frames.length >= 1) {
                        controls.style.display = 'flex';
                        previewContainer.style.display = 'flex';
                        // Auto-detect frame size from first image
                        if (frames.length === 1) {
                            frameW.value = img.width;
                            frameH.value = img.height;
                        }
                        generateSpriteSheet();
                    }
                };
                img.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    function updateFrameList() {
        frameList.innerHTML = '';
        frames.forEach((frame, idx) => {
            const item = document.createElement('div');
            item.className = 'frame-item';
            item.draggable = true;
            item.dataset.index = idx;

            const img = document.createElement('img');
            img.src = frame.img.src;
            img.title = frame.name;

            const order = document.createElement('span');
            order.className = 'order';
            order.textContent = idx + 1;

            item.appendChild(img);
            item.appendChild(order);
            frameList.appendChild(item);

            // Drag and drop reordering
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', idx);
            });
            item.addEventListener('dragover', (e) => e.preventDefault());
            item.addEventListener('drop', (e) => {
                e.preventDefault();
                const fromIdx = parseInt(e.dataTransfer.getData('text/plain'));
                const toIdx = idx;
                if (fromIdx !== toIdx) {
                    const [moved] = frames.splice(fromIdx, 1);
                    frames.splice(toIdx, 0, moved);
                    updateFrameList();
                    generateSpriteSheet();
                }
            });
        });
    }

    function generateSpriteSheet() {
        if (frames.length === 0) return;

        const numCols = parseInt(cols.value);
        const fW = parseInt(frameW.value);
        const fH = parseInt(frameH.value);
        const pad = parseInt(padding.value);

        const numRows = Math.ceil(frames.length / numCols);

        canvas.width = numCols * fW + (numCols + 1) * pad;
        canvas.height = numRows * fH + (numRows + 1) * pad;

        // Clear with transparency
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw frames
        frames.forEach((frame, idx) => {
            const col = idx % numCols;
            const row = Math.floor(idx / numCols);
            const x = pad + col * (fW + pad);
            const y = pad + row * (fH + pad);

            // Scale and center image in frame
            const img = frame.img;
            const scale = Math.min(fW / img.width, fH / img.height);
            const sw = img.width * scale;
            const sh = img.height * scale;
            const sx = x + (fW - sw) / 2;
            const sy = y + (fH - sh) / 2;

            ctx.drawImage(img, sx, sy, sw, sh);
        });

        // Update info
        infoBox.innerHTML = `
<strong>Sprite Sheet Info:</strong>
Total frames: ${frames.length}
Grid: ${numCols} x ${numRows}
Frame size: ${fW} x ${fH}
Sheet size: ${canvas.width} x ${canvas.height}
Padding: ${pad}px

<strong>CSS Example:</strong>
.sprite {
    width: ${fW}px;
    height: ${fH}px;
    background: url('sprite-sheet.png');
    background-position: -${pad}px -${pad}px;
}

<strong>Animation keyframes:</strong>
@keyframes play {
    ${frames.map((_, i) => {
        const col = i % numCols;
        const row = Math.floor(i / numCols);
        const percent = Math.round(i / frames.length * 100);
        return `${percent}% { background-position: -${pad + col * (fW + pad)}px -${pad + row * (fH + pad)}px; }`;
    }).join('\n    ')}
}
        `;
    }

    function clearFrames() {
        frames = [];
        frameList.innerHTML = '';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        infoBox.innerHTML = '';
        controls.style.display = 'none';
        previewContainer.style.display = 'none';
    }

    function download() {
        const link = document.createElement('a');
        link.download = 'sprite-sheet.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }
});
