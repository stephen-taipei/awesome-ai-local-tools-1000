/**
 * Tool #062: JPG Converter
 * Convert images to JPG format with quality control
 */
document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const imageInput = document.getElementById('imageInput');
    const options = document.getElementById('options');
    const converterSection = document.getElementById('converterSection');
    const previewGrid = document.getElementById('previewGrid');
    const downloadAllBtn = document.getElementById('downloadAll');
    const qualitySlider = document.getElementById('quality');
    const qualityValue = document.getElementById('qualityValue');
    const backgroundSelect = document.getElementById('background');

    let originalFiles = [];
    let convertedImages = [];

    qualitySlider.addEventListener('input', () => {
        qualityValue.textContent = qualitySlider.value + '%';
    });

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

    qualitySlider.addEventListener('change', reconvertAll);
    backgroundSelect.addEventListener('change', reconvertAll);
    downloadAllBtn.addEventListener('click', downloadAll);

    function handleFiles(files) {
        if (files.length === 0) return;

        options.style.display = 'flex';
        converterSection.style.display = 'block';
        previewGrid.innerHTML = '';
        originalFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
        convertedImages = [];

        originalFiles.forEach((file, index) => {
            convertToJPG(file, index);
        });
    }

    function convertToJPG(file, index) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;

                // Fill background (JPG doesn't support transparency)
                ctx.fillStyle = backgroundSelect.value;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);

                const quality = parseInt(qualitySlider.value) / 100;
                const jpgDataUrl = canvas.toDataURL('image/jpeg', quality);
                const originalName = file.name.replace(/\.[^/.]+$/, '');
                const jpgName = `${originalName}.jpg`;

                convertedImages[index] = {
                    name: jpgName,
                    dataUrl: jpgDataUrl,
                    originalSize: file.size
                };

                displayPreview(jpgDataUrl, jpgName, file.size, index);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function displayPreview(dataUrl, name, originalSize, index) {
        const base64Length = dataUrl.split(',')[1].length;
        const newSize = Math.round(base64Length * 0.75);
        const savings = Math.max(0, originalSize - newSize);
        const savingsPercent = originalSize > 0 ? Math.round((savings / originalSize) * 100) : 0;

        const existingItem = previewGrid.querySelector(`[data-index="${index}"]`);
        if (existingItem) {
            existingItem.remove();
        }

        const div = document.createElement('div');
        div.className = 'preview-item';
        div.dataset.index = index;
        div.innerHTML = `
            <img src="${dataUrl}" alt="${name}">
            <div class="file-info">
                <div style="font-weight:bold;color:#333;margin-bottom:5px;">${name}</div>
                <div>Original: ${formatSize(originalSize)}</div>
                <div>JPG: ${formatSize(newSize)}</div>
                ${savingsPercent > 0 ? `<div style="color:#27ae60;">Saved: ${savingsPercent}%</div>` : ''}
            </div>
            <button class="download-btn" onclick="downloadSingle(${index})">Download | 下載</button>
        `;
        previewGrid.appendChild(div);
    }

    function reconvertAll() {
        if (originalFiles.length === 0) return;
        previewGrid.innerHTML = '';
        convertedImages = [];
        originalFiles.forEach((file, index) => {
            convertToJPG(file, index);
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
