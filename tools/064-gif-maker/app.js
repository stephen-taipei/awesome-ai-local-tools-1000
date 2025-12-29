/**
 * Tool #064: GIF Maker
 * Create animated GIFs from multiple images
 */
document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const imageInput = document.getElementById('imageInput');
    const framesContainer = document.getElementById('framesContainer');
    const controls = document.getElementById('controls');
    const delaySlider = document.getElementById('delay');
    const delayValue = document.getElementById('delayValue');
    const sizeSelect = document.getElementById('size');
    const loopSelect = document.getElementById('loop');
    const previewBtn = document.getElementById('previewBtn');
    const createBtn = document.getElementById('createBtn');
    const clearBtn = document.getElementById('clearBtn');
    const previewSection = document.getElementById('previewSection');
    const gifPreview = document.getElementById('gifPreview');
    const downloadBtn = document.getElementById('downloadBtn');

    let frames = [];
    let gifBlob = null;

    delaySlider.addEventListener('input', () => {
        delayValue.textContent = delaySlider.value + 'ms';
    });

    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => { e.preventDefault(); dropZone.classList.remove('dragover'); handleFiles(e.dataTransfer.files); });
    imageInput.addEventListener('change', (e) => handleFiles(e.target.files));

    previewBtn.addEventListener('click', createPreview);
    createBtn.addEventListener('click', createGIF);
    clearBtn.addEventListener('click', clearAll);
    downloadBtn.addEventListener('click', downloadGIF);

    function handleFiles(files) {
        Array.from(files).forEach(file => {
            if (!file.type.startsWith('image/')) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    frames.push({ img, src: e.target.result });
                    updateFramesDisplay();
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    function updateFramesDisplay() {
        if (frames.length === 0) {
            framesContainer.innerHTML = '<p class="empty-hint">No frames added yet | 尚未添加幀</p>';
            controls.style.display = 'none';
            previewBtn.style.display = 'none';
            createBtn.style.display = 'none';
            clearBtn.style.display = 'none';
            previewSection.style.display = 'none';
            return;
        }

        framesContainer.innerHTML = '';
        frames.forEach((frame, index) => {
            const div = document.createElement('div');
            div.className = 'frame-item';
            div.draggable = true;
            div.dataset.index = index;
            div.innerHTML = `
                <img src="${frame.src}" alt="Frame ${index + 1}">
                <span class="frame-number">${index + 1}</span>
                <button class="remove-btn" onclick="removeFrame(${index})">×</button>
            `;
            framesContainer.appendChild(div);
        });

        controls.style.display = 'flex';
        previewBtn.style.display = 'inline-block';
        createBtn.style.display = 'inline-block';
        clearBtn.style.display = 'inline-block';

        // Add drag and drop reordering
        enableDragReorder();
    }

    function enableDragReorder() {
        const items = framesContainer.querySelectorAll('.frame-item');
        items.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', item.dataset.index);
                item.style.opacity = '0.5';
            });
            item.addEventListener('dragend', () => {
                item.style.opacity = '1';
            });
            item.addEventListener('dragover', (e) => e.preventDefault());
            item.addEventListener('drop', (e) => {
                e.preventDefault();
                const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                const toIndex = parseInt(item.dataset.index);
                if (fromIndex !== toIndex) {
                    const temp = frames[fromIndex];
                    frames.splice(fromIndex, 1);
                    frames.splice(toIndex, 0, temp);
                    updateFramesDisplay();
                }
            });
        });
    }

    window.removeFrame = function(index) {
        frames.splice(index, 1);
        updateFramesDisplay();
    };

    function clearAll() {
        frames = [];
        gifBlob = null;
        updateFramesDisplay();
    }

    function createPreview() {
        // Simple animated preview using CSS
        let currentFrame = 0;
        const delay = parseInt(delaySlider.value);

        previewSection.style.display = 'block';
        downloadBtn.style.display = 'none';

        function animate() {
            if (frames.length === 0) return;
            gifPreview.src = frames[currentFrame].src;
            currentFrame = (currentFrame + 1) % frames.length;
            setTimeout(animate, delay);
        }
        animate();
    }

    function createGIF() {
        if (frames.length < 2) {
            alert('Please add at least 2 frames | 請至少添加 2 幀');
            return;
        }

        const delay = parseInt(delaySlider.value);
        const targetSize = sizeSelect.value === 'original' ? null : parseInt(sizeSelect.value);
        const loop = parseInt(loopSelect.value);

        // Calculate dimensions
        let width = frames[0].img.width;
        let height = frames[0].img.height;

        if (targetSize) {
            const scale = Math.min(targetSize / width, targetSize / height);
            width = Math.floor(width * scale);
            height = Math.floor(height * scale);
        }

        // Use gif.js library if available, otherwise use canvas-based approach
        if (typeof GIF !== 'undefined') {
            createGIFWithLibrary(width, height, delay, loop);
        } else {
            createGIFManual(width, height, delay);
        }
    }

    function createGIFWithLibrary(width, height, delay, loop) {
        const gif = new GIF({
            workers: 2,
            quality: 10,
            width: width,
            height: height,
            repeat: loop
        });

        frames.forEach(frame => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(frame.img, 0, 0, width, height);
            gif.addFrame(canvas, { delay: delay });
        });

        gif.on('finished', (blob) => {
            gifBlob = blob;
            gifPreview.src = URL.createObjectURL(blob);
            previewSection.style.display = 'block';
            downloadBtn.style.display = 'inline-block';
        });

        gif.render();
    }

    function createGIFManual(width, height, delay) {
        // Fallback: Create an animated preview and offer frame download
        previewSection.style.display = 'block';
        downloadBtn.style.display = 'none';

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;

        let currentFrame = 0;
        function animate() {
            ctx.drawImage(frames[currentFrame].img, 0, 0, width, height);
            gifPreview.src = canvas.toDataURL();
            currentFrame = (currentFrame + 1) % frames.length;
            setTimeout(animate, delay);
        }
        animate();

        // Show message about GIF library
        alert('GIF library not loaded. Showing animated preview. | GIF 庫未加載，顯示動態預覽。');
    }

    function downloadGIF() {
        if (!gifBlob) return;
        const link = document.createElement('a');
        link.download = 'animated.gif';
        link.href = URL.createObjectURL(gifBlob);
        link.click();
    }
});
