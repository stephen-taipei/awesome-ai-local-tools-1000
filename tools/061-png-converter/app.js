/**
 * Tool #061: PNG Converter
 * Convert images to PNG format
 */
document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const imageInput = document.getElementById('imageInput');
    const options = document.getElementById('options');
    const converterSection = document.getElementById('converterSection');
    const previewGrid = document.getElementById('previewGrid');
    const downloadAllBtn = document.getElementById('downloadAll');
    const backgroundSelect = document.getElementById('background');

    let convertedImages = [];

    // Drag and drop handlers
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });

    imageInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    backgroundSelect.addEventListener('change', () => {
        if (convertedImages.length > 0) {
            reconvertAll();
        }
    });

    downloadAllBtn.addEventListener('click', downloadAll);

    function handleFiles(files) {
        if (files.length === 0) return;

        options.style.display = 'flex';
        converterSection.style.display = 'block';
        previewGrid.innerHTML = '';
        convertedImages = [];

        Array.from(files).forEach((file, index) => {
            if (!file.type.startsWith('image/')) return;
            convertToPNG(file, index);
        });
    }

    function convertToPNG(file, index) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;

                // Handle background
                const bg = backgroundSelect.value;
                if (bg !== 'transparent') {
                    ctx.fillStyle = bg;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }

                ctx.drawImage(img, 0, 0);

                const pngDataUrl = canvas.toDataURL('image/png');
                const originalName = file.name.replace(/\.[^/.]+$/, '');
                const pngName = `${originalName}.png`;

                convertedImages[index] = {
                    name: pngName,
                    dataUrl: pngDataUrl,
                    originalSize: file.size,
                    originalFile: file
                };

                displayPreview(pngDataUrl, pngName, file.size, index);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function displayPreview(dataUrl, name, originalSize, index) {
        // Calculate new size from data URL
        const base64Length = dataUrl.split(',')[1].length;
        const newSize = Math.round(base64Length * 0.75);

        const div = document.createElement('div');
        div.className = 'preview-item';
        div.dataset.index = index;
        div.innerHTML = `
            <img src="${dataUrl}" alt="${name}">
            <div class="file-info">
                <div style="font-weight:bold;color:#333;margin-bottom:5px;">${name}</div>
                <div>Original: ${formatSize(originalSize)}</div>
                <div>PNG: ${formatSize(newSize)}</div>
            </div>
            <button class="download-btn" onclick="downloadSingle(${index})">Download | 下載</button>
        `;
        previewGrid.appendChild(div);
    }

    function reconvertAll() {
        previewGrid.innerHTML = '';
        const images = [...convertedImages];
        convertedImages = [];
        images.forEach((img, index) => {
            if (img) {
                convertToPNG(img.originalFile, index);
            }
        });
    }

    window.downloadSingle = function(index) {
        const img = convertedImages[index];
        if (!img) return;
        const link = document.createElement('a');
        link.download = img.name;
        link.href = img.dataUrl;
        link.click();
    };

    function downloadAll() {
        convertedImages.forEach((img, index) => {
            if (img) {
                setTimeout(() => {
                    window.downloadSingle(index);
                }, index * 200);
            }
        });
    }

    function formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
});
