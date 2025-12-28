/**
 * Tool #054: Color Analysis | 顏色分析
 * Extract color palette and analyze color distribution
 * 100% local processing
 */

document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('imageInput');
    const previewCanvas = document.getElementById('previewCanvas');
    const ctx = previewCanvas.getContext('2d');
    const resultsSection = document.getElementById('resultsSection');
    const colorPalette = document.getElementById('colorPalette');
    const statsGrid = document.getElementById('statsGrid');
    const exportBtn = document.getElementById('exportBtn');

    let extractedColors = [];

    imageInput.addEventListener('change', handleImageUpload);
    exportBtn.addEventListener('click', exportPalette);

    function handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                // Resize for display
                const maxWidth = 600;
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = (maxWidth / width) * height;
                    width = maxWidth;
                }

                previewCanvas.width = width;
                previewCanvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                resultsSection.style.display = 'block';
                analyzeColors();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }

    function analyzeColors() {
        const imageData = ctx.getImageData(0, 0, previewCanvas.width, previewCanvas.height);
        const data = imageData.data;

        // Extract colors using k-means clustering
        extractedColors = extractDominantColors(data, 8);
        displayColorPalette(extractedColors);

        // Calculate histograms
        const histograms = calculateHistograms(data);
        displayHistograms(histograms);

        // Calculate statistics
        const stats = calculateColorStats(data);
        displayStats(stats);
    }

    function extractDominantColors(data, k) {
        // Sample pixels for faster processing
        const sampleSize = Math.min(10000, data.length / 4);
        const step = Math.floor(data.length / 4 / sampleSize);
        const pixels = [];

        for (let i = 0; i < data.length; i += step * 4) {
            pixels.push([data[i], data[i + 1], data[i + 2]]);
        }

        // K-means clustering
        let centroids = initializeCentroids(pixels, k);
        const maxIterations = 10;

        for (let iter = 0; iter < maxIterations; iter++) {
            const clusters = Array(k).fill(null).map(() => []);

            // Assign pixels to nearest centroid
            for (const pixel of pixels) {
                let minDist = Infinity;
                let nearestIdx = 0;

                for (let i = 0; i < centroids.length; i++) {
                    const dist = colorDistance(pixel, centroids[i]);
                    if (dist < minDist) {
                        minDist = dist;
                        nearestIdx = i;
                    }
                }

                clusters[nearestIdx].push(pixel);
            }

            // Update centroids
            for (let i = 0; i < k; i++) {
                if (clusters[i].length > 0) {
                    centroids[i] = [
                        Math.round(clusters[i].reduce((s, p) => s + p[0], 0) / clusters[i].length),
                        Math.round(clusters[i].reduce((s, p) => s + p[1], 0) / clusters[i].length),
                        Math.round(clusters[i].reduce((s, p) => s + p[2], 0) / clusters[i].length)
                    ];
                }
            }
        }

        // Count pixels in each cluster
        const clusterCounts = Array(k).fill(0);
        for (const pixel of pixels) {
            let minDist = Infinity;
            let nearestIdx = 0;

            for (let i = 0; i < centroids.length; i++) {
                const dist = colorDistance(pixel, centroids[i]);
                if (dist < minDist) {
                    minDist = dist;
                    nearestIdx = i;
                }
            }

            clusterCounts[nearestIdx]++;
        }

        // Return colors with percentages, sorted by frequency
        return centroids.map((c, i) => ({
            rgb: c,
            hex: rgbToHex(c[0], c[1], c[2]),
            percent: (clusterCounts[i] / pixels.length * 100).toFixed(1)
        })).sort((a, b) => b.percent - a.percent);
    }

    function initializeCentroids(pixels, k) {
        // K-means++ initialization
        const centroids = [pixels[Math.floor(Math.random() * pixels.length)]];

        while (centroids.length < k) {
            const distances = pixels.map(p => {
                let minDist = Infinity;
                for (const c of centroids) {
                    minDist = Math.min(minDist, colorDistance(p, c));
                }
                return minDist * minDist;
            });

            const totalDist = distances.reduce((a, b) => a + b, 0);
            let random = Math.random() * totalDist;

            for (let i = 0; i < pixels.length; i++) {
                random -= distances[i];
                if (random <= 0) {
                    centroids.push(pixels[i]);
                    break;
                }
            }
        }

        return centroids;
    }

    function colorDistance(c1, c2) {
        return Math.sqrt(
            Math.pow(c1[0] - c2[0], 2) +
            Math.pow(c1[1] - c2[1], 2) +
            Math.pow(c1[2] - c2[2], 2)
        );
    }

    function rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
    }

    function displayColorPalette(colors) {
        colorPalette.innerHTML = colors.map(color => `
            <div class="color-card">
                <div class="color-swatch" style="background-color: ${color.hex}"></div>
                <div class="color-info">
                    <div class="hex">${color.hex}</div>
                    <div class="rgb">RGB(${color.rgb.join(', ')})</div>
                    <div class="percent">${color.percent}%</div>
                </div>
            </div>
        `).join('');
    }

    function calculateHistograms(data) {
        const red = new Array(256).fill(0);
        const green = new Array(256).fill(0);
        const blue = new Array(256).fill(0);

        for (let i = 0; i < data.length; i += 4) {
            red[data[i]]++;
            green[data[i + 1]]++;
            blue[data[i + 2]]++;
        }

        return { red, green, blue };
    }

    function displayHistograms(histograms) {
        const channels = ['red', 'green', 'blue'];
        const colors = { red: '#e74c3c', green: '#27ae60', blue: '#3498db' };

        channels.forEach(channel => {
            const container = document.getElementById(`${channel}Histogram`);
            const hist = histograms[channel];
            const max = Math.max(...hist);

            // Reduce to 32 bins for display
            const bins = 32;
            const binSize = 256 / bins;
            const binnedHist = [];

            for (let i = 0; i < bins; i++) {
                let sum = 0;
                for (let j = 0; j < binSize; j++) {
                    sum += hist[i * binSize + j];
                }
                binnedHist.push(sum);
            }

            const binMax = Math.max(...binnedHist);

            container.innerHTML = binnedHist.map(val => {
                const height = (val / binMax * 100).toFixed(1);
                return `<div class="bar" style="height: ${height}%; background: ${colors[channel]}"></div>`;
            }).join('');
        });
    }

    function calculateColorStats(data) {
        let totalR = 0, totalG = 0, totalB = 0;
        let minL = 255, maxL = 0;
        let saturationSum = 0;

        const pixelCount = data.length / 4;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i + 1], b = data[i + 2];

            totalR += r;
            totalG += g;
            totalB += b;

            // Luminance
            const l = 0.299 * r + 0.587 * g + 0.114 * b;
            minL = Math.min(minL, l);
            maxL = Math.max(maxL, l);

            // Saturation
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const saturation = max === 0 ? 0 : (max - min) / max;
            saturationSum += saturation;
        }

        return {
            avgBrightness: Math.round((totalR + totalG + totalB) / (3 * pixelCount)),
            contrast: Math.round(maxL - minL),
            avgSaturation: Math.round(saturationSum / pixelCount * 100),
            dominantChannel: totalR > totalG && totalR > totalB ? 'Red' :
                           totalG > totalB ? 'Green' : 'Blue'
        };
    }

    function displayStats(stats) {
        statsGrid.innerHTML = `
            <div class="stat-card">
                <div class="stat-value">${stats.avgBrightness}</div>
                <div class="stat-label">Avg Brightness | 平均亮度</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.contrast}</div>
                <div class="stat-label">Contrast | 對比度</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.avgSaturation}%</div>
                <div class="stat-label">Avg Saturation | 平均飽和度</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.dominantChannel}</div>
                <div class="stat-label">Dominant | 主色調</div>
            </div>
        `;
    }

    function exportPalette() {
        const paletteData = extractedColors.map(c => ({
            hex: c.hex,
            rgb: `rgb(${c.rgb.join(', ')})`,
            percentage: `${c.percent}%`
        }));

        const blob = new Blob([JSON.stringify(paletteData, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.download = `color-palette-${Date.now()}.json`;
        link.href = URL.createObjectURL(blob);
        link.click();
    }
});
