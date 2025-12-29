/**
 * Tool #100: Image Info
 * View comprehensive image information
 */
document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('imageInput');
    const dropZone = document.getElementById('dropZone');
    const imagePreview = document.getElementById('imagePreview');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const previewContainer = document.getElementById('previewContainer');
    const infoGrid = document.getElementById('infoGrid');

    // Event listeners
    imageInput.addEventListener('change', handleUpload);
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.style.borderColor = '#ff6a00'; });
    dropZone.addEventListener('dragleave', () => { dropZone.style.borderColor = '#ee0979'; });
    dropZone.addEventListener('drop', handleDrop);

    function handleDrop(e) {
        e.preventDefault();
        dropZone.style.borderColor = '#ee0979';
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            analyzeImage(file);
        }
    }

    function handleUpload(e) {
        const file = e.target.files[0];
        if (file) analyzeImage(file);
    }

    function analyzeImage(file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                imagePreview.src = ev.target.result;
                previewContainer.style.display = 'flex';

                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                const imageData = ctx.getImageData(0, 0, img.width, img.height);
                const info = gatherInfo(imageData, img, file);
                displayInfo(info);
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    }

    function gatherInfo(imageData, img, file) {
        const data = imageData.data;
        const pixels = data.length / 4;

        // Basic info
        const extension = file.name.split('.').pop().toUpperCase();
        const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
        const divisor = gcd(img.width, img.height);
        const aspectRatio = `${img.width / divisor}:${img.height / divisor}`;

        // Color analysis
        let rSum = 0, gSum = 0, bSum = 0;
        let transparentPixels = 0;
        let minBrightness = 255, maxBrightness = 0;
        const colorMap = new Map();

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
            rSum += r; gSum += g; bSum += b;

            if (a < 255) transparentPixels++;

            const brightness = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
            minBrightness = Math.min(minBrightness, brightness);
            maxBrightness = Math.max(maxBrightness, brightness);

            // Count colors (reduced)
            const colorKey = `${Math.round(r/16)*16},${Math.round(g/16)*16},${Math.round(b/16)*16}`;
            colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1);
        }

        const avgR = Math.round(rSum / pixels);
        const avgG = Math.round(gSum / pixels);
        const avgB = Math.round(bSum / pixels);
        const avgColor = rgbToHex(avgR, avgG, avgB);
        const avgBrightness = Math.round((avgR + avgG + avgB) / 3);

        // Find dominant color
        let maxCount = 0;
        let dominantColor = [0, 0, 0];
        colorMap.forEach((count, key) => {
            if (count > maxCount) {
                maxCount = count;
                dominantColor = key.split(',').map(Number);
            }
        });

        // Quality estimates
        const hasTransparency = transparentPixels > 0;
        const isHighRes = img.width >= 1920 || img.height >= 1080;
        const is4K = img.width >= 3840 || img.height >= 2160;
        const uniqueColors = colorMap.size;
        const colorDepth = uniqueColors > 1000 ? '24-bit (True Color)' : uniqueColors > 256 ? '16-bit' : '8-bit';

        // Print quality (300 DPI)
        const printWidth300 = (img.width / 300).toFixed(2);
        const printHeight300 = (img.height / 300).toFixed(2);

        // Web quality (72 DPI)
        const printWidth72 = (img.width / 72).toFixed(2);
        const printHeight72 = (img.height / 72).toFixed(2);

        // Memory usage
        const memoryBytes = img.width * img.height * 4;
        const memoryMB = (memoryBytes / (1024 * 1024)).toFixed(2);

        return {
            basic: {
                fileName: file.name,
                fileSize: formatBytes(file.size),
                fileType: file.type,
                extension,
                lastModified: new Date(file.lastModified).toLocaleString()
            },
            dimensions: {
                width: img.width,
                height: img.height,
                aspectRatio,
                totalPixels: pixels.toLocaleString(),
                megapixels: (pixels / 1000000).toFixed(2) + ' MP'
            },
            quality: {
                isHighRes,
                is4K,
                colorDepth,
                uniqueColors: uniqueColors.toLocaleString() + '+',
                contrastRange: maxBrightness - minBrightness
            },
            colors: {
                avgColor,
                avgR, avgG, avgB,
                avgBrightness,
                dominantColor: rgbToHex(...dominantColor),
                hasTransparency,
                transparentPercent: ((transparentPixels / pixels) * 100).toFixed(2) + '%'
            },
            print: {
                width300dpi: printWidth300 + ' inches',
                height300dpi: printHeight300 + ' inches',
                width72dpi: printWidth72 + ' inches',
                height72dpi: printHeight72 + ' inches'
            },
            technical: {
                memoryUsage: memoryMB + ' MB',
                bitsPerPixel: '32 (RGBA)',
                channels: '4 (Red, Green, Blue, Alpha)'
            }
        };
    }

    function formatBytes(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }

    function rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
    }

    function displayInfo(info) {
        infoGrid.style.display = 'grid';
        infoGrid.innerHTML = `
            <div class="info-card">
                <h3>File Information | 檔案資訊</h3>
                <div class="info-row"><span class="info-label">File Name</span><span class="info-value">${info.basic.fileName}</span></div>
                <div class="info-row"><span class="info-label">File Size</span><span class="info-value">${info.basic.fileSize}</span></div>
                <div class="info-row"><span class="info-label">Format</span><span class="info-value"><span class="badge badge-info">${info.basic.extension}</span></span></div>
                <div class="info-row"><span class="info-label">MIME Type</span><span class="info-value">${info.basic.fileType}</span></div>
                <div class="info-row"><span class="info-label">Last Modified</span><span class="info-value">${info.basic.lastModified}</span></div>
            </div>

            <div class="info-card">
                <h3>Dimensions | 尺寸資訊</h3>
                <div class="info-row"><span class="info-label">Width</span><span class="info-value">${info.dimensions.width} px</span></div>
                <div class="info-row"><span class="info-label">Height</span><span class="info-value">${info.dimensions.height} px</span></div>
                <div class="info-row"><span class="info-label">Aspect Ratio</span><span class="info-value">${info.dimensions.aspectRatio}</span></div>
                <div class="info-row"><span class="info-label">Total Pixels</span><span class="info-value">${info.dimensions.totalPixels}</span></div>
                <div class="info-row"><span class="info-label">Resolution</span><span class="info-value">${info.dimensions.megapixels}</span></div>
            </div>

            <div class="info-card">
                <h3>Quality Analysis | 品質分析</h3>
                <div class="info-row"><span class="info-label">Resolution Grade</span><span class="info-value">
                    ${info.quality.is4K ? '<span class="badge badge-good">4K+</span>' :
                      info.quality.isHighRes ? '<span class="badge badge-good">HD</span>' :
                      '<span class="badge badge-warning">SD</span>'}
                </span></div>
                <div class="info-row"><span class="info-label">Color Depth</span><span class="info-value">${info.quality.colorDepth}</span></div>
                <div class="info-row"><span class="info-label">Unique Colors</span><span class="info-value">${info.quality.uniqueColors}</span></div>
                <div class="info-row"><span class="info-label">Contrast Range</span><span class="info-value">${info.quality.contrastRange}/255</span></div>
                <div class="quality-bar"><div class="quality-fill" style="width:${info.quality.contrastRange/2.55}%;background:linear-gradient(90deg,#ee0979,#ff6a00);"></div></div>
            </div>

            <div class="info-card">
                <h3>Color Information | 色彩資訊</h3>
                <div class="info-row"><span class="info-label">Average Color</span><span class="info-value"><span class="color-preview" style="background:${info.colors.avgColor}"></span>${info.colors.avgColor}</span></div>
                <div class="info-row"><span class="info-label">Dominant Color</span><span class="info-value"><span class="color-preview" style="background:${info.colors.dominantColor}"></span>${info.colors.dominantColor}</span></div>
                <div class="info-row"><span class="info-label">Avg Brightness</span><span class="info-value">${info.colors.avgBrightness}/255</span></div>
                <div class="info-row"><span class="info-label">Has Transparency</span><span class="info-value">${info.colors.hasTransparency ? '<span class="badge badge-info">Yes</span>' : 'No'}</span></div>
                <div class="info-row"><span class="info-label">Transparent Pixels</span><span class="info-value">${info.colors.transparentPercent}</span></div>
            </div>

            <div class="info-card">
                <h3>Print Size | 列印尺寸</h3>
                <div class="info-row"><span class="info-label">@ 300 DPI (Print)</span><span class="info-value">${info.print.width300dpi} x ${info.print.height300dpi}</span></div>
                <div class="info-row"><span class="info-label">@ 72 DPI (Screen)</span><span class="info-value">${info.print.width72dpi} x ${info.print.height72dpi}</span></div>
            </div>

            <div class="info-card">
                <h3>Technical Details | 技術細節</h3>
                <div class="info-row"><span class="info-label">Memory Usage</span><span class="info-value">${info.technical.memoryUsage}</span></div>
                <div class="info-row"><span class="info-label">Bits Per Pixel</span><span class="info-value">${info.technical.bitsPerPixel}</span></div>
                <div class="info-row"><span class="info-label">Channels</span><span class="info-value">${info.technical.channels}</span></div>
            </div>
        `;
    }
});
