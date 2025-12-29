/**
 * Tool #098: Image Stats
 * Analyze image statistics and properties
 */
document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('imageInput');
    const dropZone = document.getElementById('dropZone');
    const imagePreview = document.getElementById('imagePreview');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const previewContainer = document.getElementById('previewContainer');
    const statsGrid = document.getElementById('statsGrid');

    // Event listeners
    imageInput.addEventListener('change', handleUpload);
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.style.borderColor = '#96c93d'; });
    dropZone.addEventListener('dragleave', () => { dropZone.style.borderColor = '#00b09b'; });
    dropZone.addEventListener('drop', handleDrop);

    function handleDrop(e) {
        e.preventDefault();
        dropZone.style.borderColor = '#00b09b';
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
                const stats = calculateStats(imageData, img, file);
                displayStats(stats);
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    }

    function calculateStats(imageData, img, file) {
        const data = imageData.data;
        const pixels = data.length / 4;

        // Channel statistics
        const channels = { r: [], g: [], b: [], a: [] };
        let transparentPixels = 0;

        for (let i = 0; i < data.length; i += 4) {
            channels.r.push(data[i]);
            channels.g.push(data[i + 1]);
            channels.b.push(data[i + 2]);
            channels.a.push(data[i + 3]);
            if (data[i + 3] < 255) transparentPixels++;
        }

        const calcChannelStats = (arr) => {
            const sum = arr.reduce((a, b) => a + b, 0);
            const mean = sum / arr.length;
            const sorted = [...arr].sort((a, b) => a - b);
            const median = sorted[Math.floor(sorted.length / 2)];
            const min = sorted[0];
            const max = sorted[sorted.length - 1];
            const variance = arr.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / arr.length;
            const stdDev = Math.sqrt(variance);
            return { mean, median, min, max, stdDev };
        };

        const rStats = calcChannelStats(channels.r);
        const gStats = calcChannelStats(channels.g);
        const bStats = calcChannelStats(channels.b);

        // Luminance
        const luminance = [];
        for (let i = 0; i < pixels; i++) {
            luminance.push(0.299 * channels.r[i] + 0.587 * channels.g[i] + 0.114 * channels.b[i]);
        }
        const lumStats = calcChannelStats(luminance);

        // Color uniqueness
        const colorSet = new Set();
        for (let i = 0; i < pixels; i++) {
            colorSet.add(`${channels.r[i]},${channels.g[i]},${channels.b[i]}`);
        }

        // Aspect ratio
        const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
        const divisor = gcd(img.width, img.height);
        const aspectRatio = `${img.width / divisor}:${img.height / divisor}`;

        return {
            file: {
                name: file.name,
                size: formatBytes(file.size),
                type: file.type
            },
            dimensions: {
                width: img.width,
                height: img.height,
                pixels: pixels.toLocaleString(),
                megapixels: (pixels / 1000000).toFixed(2),
                aspectRatio
            },
            channels: {
                red: rStats,
                green: gStats,
                blue: bStats
            },
            luminance: lumStats,
            colors: {
                unique: colorSet.size.toLocaleString(),
                hasTransparency: transparentPixels > 0,
                transparentPixels: transparentPixels.toLocaleString(),
                transparentPercent: ((transparentPixels / pixels) * 100).toFixed(2)
            }
        };
    }

    function formatBytes(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }

    function displayStats(stats) {
        statsGrid.style.display = 'grid';
        statsGrid.innerHTML = `
            <div class="stat-card">
                <h3>File Info | 檔案資訊</h3>
                <div class="stat-row"><span class="stat-label">Name</span><span class="stat-value">${stats.file.name}</span></div>
                <div class="stat-row"><span class="stat-label">Size</span><span class="stat-value">${stats.file.size}</span></div>
                <div class="stat-row"><span class="stat-label">Type</span><span class="stat-value">${stats.file.type}</span></div>
            </div>

            <div class="stat-card">
                <h3>Dimensions | 尺寸</h3>
                <div class="stat-row"><span class="stat-label">Width</span><span class="stat-value">${stats.dimensions.width} px</span></div>
                <div class="stat-row"><span class="stat-label">Height</span><span class="stat-value">${stats.dimensions.height} px</span></div>
                <div class="stat-row"><span class="stat-label">Aspect Ratio</span><span class="stat-value">${stats.dimensions.aspectRatio}</span></div>
                <div class="stat-row"><span class="stat-label">Total Pixels</span><span class="stat-value">${stats.dimensions.pixels}</span></div>
                <div class="stat-row"><span class="stat-label">Megapixels</span><span class="stat-value">${stats.dimensions.megapixels} MP</span></div>
            </div>

            <div class="stat-card">
                <h3>Color Channels | 色彩通道</h3>
                <div class="channel-bars">
                    <div class="channel-bar">
                        <div class="bar" style="background:linear-gradient(to top, #ff0000 ${stats.channels.red.mean/2.55}%, transparent ${stats.channels.red.mean/2.55}%); background-color: #ffcccc;">
                            <span>${Math.round(stats.channels.red.mean)}</span>
                        </div>
                        <div style="margin-top:5px;font-size:12px;">Red</div>
                    </div>
                    <div class="channel-bar">
                        <div class="bar" style="background:linear-gradient(to top, #00ff00 ${stats.channels.green.mean/2.55}%, transparent ${stats.channels.green.mean/2.55}%); background-color: #ccffcc;">
                            <span>${Math.round(stats.channels.green.mean)}</span>
                        </div>
                        <div style="margin-top:5px;font-size:12px;">Green</div>
                    </div>
                    <div class="channel-bar">
                        <div class="bar" style="background:linear-gradient(to top, #0000ff ${stats.channels.blue.mean/2.55}%, transparent ${stats.channels.blue.mean/2.55}%); background-color: #ccccff;">
                            <span>${Math.round(stats.channels.blue.mean)}</span>
                        </div>
                        <div style="margin-top:5px;font-size:12px;">Blue</div>
                    </div>
                </div>
            </div>

            <div class="stat-card">
                <h3>Luminance | 亮度</h3>
                <div class="stat-row"><span class="stat-label">Mean</span><span class="stat-value">${stats.luminance.mean.toFixed(2)}</span></div>
                <div class="stat-row"><span class="stat-label">Median</span><span class="stat-value">${stats.luminance.median}</span></div>
                <div class="stat-row"><span class="stat-label">Min</span><span class="stat-value">${stats.luminance.min}</span></div>
                <div class="stat-row"><span class="stat-label">Max</span><span class="stat-value">${stats.luminance.max}</span></div>
                <div class="stat-row"><span class="stat-label">Std Dev</span><span class="stat-value">${stats.luminance.stdDev.toFixed(2)}</span></div>
                <div class="color-bar" style="background:linear-gradient(to right, black, white); opacity:0.8;"></div>
            </div>

            <div class="stat-card">
                <h3>Color Info | 色彩資訊</h3>
                <div class="stat-row"><span class="stat-label">Unique Colors</span><span class="stat-value">${stats.colors.unique}</span></div>
                <div class="stat-row"><span class="stat-label">Has Transparency</span><span class="stat-value">${stats.colors.hasTransparency ? 'Yes' : 'No'}</span></div>
                <div class="stat-row"><span class="stat-label">Transparent Pixels</span><span class="stat-value">${stats.colors.transparentPixels}</span></div>
                <div class="stat-row"><span class="stat-label">Transparency %</span><span class="stat-value">${stats.colors.transparentPercent}%</span></div>
            </div>

            <div class="stat-card">
                <h3>Channel Details | 通道詳情</h3>
                <div class="stat-row"><span class="stat-label">Red Range</span><span class="stat-value">${stats.channels.red.min} - ${stats.channels.red.max}</span></div>
                <div class="stat-row"><span class="stat-label">Green Range</span><span class="stat-value">${stats.channels.green.min} - ${stats.channels.green.max}</span></div>
                <div class="stat-row"><span class="stat-label">Blue Range</span><span class="stat-value">${stats.channels.blue.min} - ${stats.channels.blue.max}</span></div>
                <div class="stat-row"><span class="stat-label">Red Std Dev</span><span class="stat-value">${stats.channels.red.stdDev.toFixed(2)}</span></div>
                <div class="stat-row"><span class="stat-label">Green Std Dev</span><span class="stat-value">${stats.channels.green.stdDev.toFixed(2)}</span></div>
                <div class="stat-row"><span class="stat-label">Blue Std Dev</span><span class="stat-value">${stats.channels.blue.stdDev.toFixed(2)}</span></div>
            </div>
        `;
    }
});
