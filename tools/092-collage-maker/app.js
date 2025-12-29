/**
 * Tool #092: Collage Maker
 * Create photo collages with various layouts
 */
document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('imageInput');
    const dropZone = document.getElementById('dropZone');
    const thumbnails = document.getElementById('thumbnails');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const controls = document.getElementById('controls');
    const previewContainer = document.getElementById('previewContainer');
    const layout = document.getElementById('layout');
    const gap = document.getElementById('gap');
    const gapVal = document.getElementById('gapVal');
    const radius = document.getElementById('radius');
    const radiusVal = document.getElementById('radiusVal');
    const bgColor = document.getElementById('bgColor');
    const generateBtn = document.getElementById('generateBtn');
    const downloadBtn = document.getElementById('downloadBtn');

    let images = [];

    // Event listeners
    imageInput.addEventListener('change', handleUpload);
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.style.borderColor = '#fee140'; });
    dropZone.addEventListener('dragleave', () => { dropZone.style.borderColor = '#fa709a'; });
    dropZone.addEventListener('drop', handleDrop);
    gap.addEventListener('input', () => { gapVal.textContent = gap.value; generateCollage(); });
    radius.addEventListener('input', () => { radiusVal.textContent = radius.value; generateCollage(); });
    bgColor.addEventListener('input', generateCollage);
    layout.addEventListener('change', generateCollage);
    generateBtn.addEventListener('click', generateCollage);
    downloadBtn.addEventListener('click', download);

    function handleDrop(e) {
        e.preventDefault();
        dropZone.style.borderColor = '#fa709a';
        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        loadImages(files);
    }

    function handleUpload(e) {
        const files = Array.from(e.target.files);
        loadImages(files);
    }

    function loadImages(files) {
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const img = new Image();
                img.onload = () => {
                    images.push(img);
                    updateThumbnails();
                    if (images.length >= 2) {
                        controls.style.display = 'flex';
                        previewContainer.style.display = 'flex';
                        generateCollage();
                    }
                };
                img.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    function updateThumbnails() {
        thumbnails.innerHTML = '';
        images.forEach((img, idx) => {
            const item = document.createElement('div');
            item.className = 'thumb-item';

            const thumb = document.createElement('img');
            thumb.src = img.src;

            const remove = document.createElement('button');
            remove.className = 'remove';
            remove.textContent = 'x';
            remove.addEventListener('click', () => {
                images.splice(idx, 1);
                updateThumbnails();
                if (images.length >= 2) generateCollage();
            });

            item.appendChild(thumb);
            item.appendChild(remove);
            thumbnails.appendChild(item);
        });
    }

    function generateCollage() {
        if (images.length < 2) return;

        const layoutType = layout.value;
        const gapSize = parseInt(gap.value);
        const cornerRadius = parseInt(radius.value);
        const bg = bgColor.value;

        const canvasSize = 800;
        canvas.width = canvasSize;
        canvas.height = canvasSize;

        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, canvasSize, canvasSize);

        const slots = getLayoutSlots(layoutType, canvasSize, gapSize, images.length);

        slots.forEach((slot, idx) => {
            if (idx < images.length) {
                drawImageInSlot(images[idx], slot, cornerRadius);
            }
        });
    }

    function getLayoutSlots(type, size, gap, count) {
        const slots = [];

        switch (type) {
            case 'grid2x2': {
                const cellSize = (size - gap * 3) / 2;
                for (let r = 0; r < 2; r++) {
                    for (let c = 0; c < 2; c++) {
                        slots.push({
                            x: gap + c * (cellSize + gap),
                            y: gap + r * (cellSize + gap),
                            w: cellSize,
                            h: cellSize
                        });
                    }
                }
                break;
            }
            case 'grid3x3': {
                const cellSize = (size - gap * 4) / 3;
                for (let r = 0; r < 3; r++) {
                    for (let c = 0; c < 3; c++) {
                        slots.push({
                            x: gap + c * (cellSize + gap),
                            y: gap + r * (cellSize + gap),
                            w: cellSize,
                            h: cellSize
                        });
                    }
                }
                break;
            }
            case 'horizontal': {
                const cellW = (size - gap * (count + 1)) / count;
                const cellH = size - gap * 2;
                for (let i = 0; i < count; i++) {
                    slots.push({
                        x: gap + i * (cellW + gap),
                        y: gap,
                        w: cellW,
                        h: cellH
                    });
                }
                break;
            }
            case 'vertical': {
                const cellW = size - gap * 2;
                const cellH = (size - gap * (count + 1)) / count;
                for (let i = 0; i < count; i++) {
                    slots.push({
                        x: gap,
                        y: gap + i * (cellH + gap),
                        w: cellW,
                        h: cellH
                    });
                }
                break;
            }
            case 'featured': {
                const bigW = (size - gap * 3) * 0.6;
                const bigH = size - gap * 2;
                slots.push({ x: gap, y: gap, w: bigW, h: bigH });

                const smallW = size - bigW - gap * 3;
                const smallCount = Math.min(count - 1, 3);
                const smallH = (bigH - gap * (smallCount - 1)) / smallCount;
                for (let i = 0; i < smallCount; i++) {
                    slots.push({
                        x: bigW + gap * 2,
                        y: gap + i * (smallH + gap),
                        w: smallW,
                        h: smallH
                    });
                }
                break;
            }
            case 'mosaic': {
                // Creative mosaic layout
                const half = (size - gap * 3) / 2;
                slots.push({ x: gap, y: gap, w: half, h: half });
                slots.push({ x: half + gap * 2, y: gap, w: half, h: half / 2 - gap / 2 });
                slots.push({ x: half + gap * 2, y: gap + half / 2 + gap / 2, w: half, h: half / 2 - gap / 2 });
                slots.push({ x: gap, y: half + gap * 2, w: half / 2 - gap / 2, h: half });
                slots.push({ x: gap + half / 2 + gap / 2, y: half + gap * 2, w: half / 2 - gap / 2, h: half });
                slots.push({ x: half + gap * 2, y: half + gap * 2, w: half, h: half });
                break;
            }
        }

        return slots;
    }

    function drawImageInSlot(img, slot, radius) {
        const { x, y, w, h } = slot;

        // Calculate cover dimensions
        const imgRatio = img.width / img.height;
        const slotRatio = w / h;

        let sx, sy, sw, sh;
        if (imgRatio > slotRatio) {
            sh = img.height;
            sw = sh * slotRatio;
            sx = (img.width - sw) / 2;
            sy = 0;
        } else {
            sw = img.width;
            sh = sw / slotRatio;
            sx = 0;
            sy = (img.height - sh) / 2;
        }

        // Draw with rounded corners
        ctx.save();
        ctx.beginPath();
        roundRect(ctx, x, y, w, h, radius);
        ctx.clip();
        ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
        ctx.restore();
    }

    function roundRect(ctx, x, y, w, h, r) {
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
    }

    function download() {
        const link = document.createElement('a');
        link.download = 'collage.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }
});
