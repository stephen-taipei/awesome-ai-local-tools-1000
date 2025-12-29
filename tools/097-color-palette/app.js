/**
 * Tool #097: Color Palette
 * Extract color palettes from images
 */
document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('imageInput');
    const dropZone = document.getElementById('dropZone');
    const imagePreview = document.getElementById('imagePreview');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const controls = document.getElementById('controls');
    const previewContainer = document.getElementById('previewContainer');
    const palette = document.getElementById('palette');
    const palettePreview = document.getElementById('palettePreview');
    const colorCount = document.getElementById('colorCount');
    const algorithm = document.getElementById('algorithm');
    const extractBtn = document.getElementById('extractBtn');
    const exportBtn = document.getElementById('exportBtn');

    let originalImage = null;
    let extractedColors = [];

    // Event listeners
    imageInput.addEventListener('change', handleUpload);
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.style.borderColor = '#3f5efb'; });
    dropZone.addEventListener('dragleave', () => { dropZone.style.borderColor = '#fc466b'; });
    dropZone.addEventListener('drop', handleDrop);
    extractBtn.addEventListener('click', extractColors);
    exportBtn.addEventListener('click', exportCSS);
    colorCount.addEventListener('change', extractColors);
    algorithm.addEventListener('change', extractColors);

    function handleDrop(e) {
        e.preventDefault();
        dropZone.style.borderColor = '#fc466b';
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
                imagePreview.src = ev.target.result;
                imagePreview.style.display = 'block';

                // Scale down for processing
                const maxSize = 200;
                const scale = Math.min(maxSize / img.width, maxSize / img.height);
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                controls.style.display = 'flex';
                extractColors();
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    }

    function extractColors() {
        if (!originalImage) return;

        const count = parseInt(colorCount.value);
        const algo = algorithm.value;

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = [];

        for (let i = 0; i < imageData.data.length; i += 4) {
            if (imageData.data[i + 3] > 128) { // Skip transparent
                pixels.push([
                    imageData.data[i],
                    imageData.data[i + 1],
                    imageData.data[i + 2]
                ]);
            }
        }

        if (algo === 'kmeans') {
            extractedColors = kMeansQuantize(pixels, count);
        } else if (algo === 'frequency') {
            extractedColors = frequencyQuantize(pixels, count);
        } else {
            extractedColors = vibrantQuantize(pixels, count);
        }

        renderPalette();
    }

    function kMeansQuantize(pixels, k) {
        // Initialize centroids randomly
        let centroids = [];
        for (let i = 0; i < k; i++) {
            centroids.push(pixels[Math.floor(Math.random() * pixels.length)].slice());
        }

        // Iterate
        for (let iter = 0; iter < 10; iter++) {
            const clusters = Array(k).fill().map(() => []);

            // Assign pixels to nearest centroid
            pixels.forEach(pixel => {
                let minDist = Infinity;
                let nearest = 0;
                centroids.forEach((c, i) => {
                    const dist = colorDistance(pixel, c);
                    if (dist < minDist) {
                        minDist = dist;
                        nearest = i;
                    }
                });
                clusters[nearest].push(pixel);
            });

            // Update centroids
            centroids = clusters.map((cluster, i) => {
                if (cluster.length === 0) return centroids[i];
                return [
                    Math.round(cluster.reduce((s, p) => s + p[0], 0) / cluster.length),
                    Math.round(cluster.reduce((s, p) => s + p[1], 0) / cluster.length),
                    Math.round(cluster.reduce((s, p) => s + p[2], 0) / cluster.length)
                ];
            });
        }

        return centroids.map(c => ({ r: c[0], g: c[1], b: c[2] }));
    }

    function frequencyQuantize(pixels, count) {
        const colorMap = {};

        pixels.forEach(([r, g, b]) => {
            // Reduce color space
            const key = `${Math.round(r / 16) * 16},${Math.round(g / 16) * 16},${Math.round(b / 16) * 16}`;
            colorMap[key] = (colorMap[key] || 0) + 1;
        });

        const sorted = Object.entries(colorMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, count);

        return sorted.map(([key]) => {
            const [r, g, b] = key.split(',').map(Number);
            return { r, g, b };
        });
    }

    function vibrantQuantize(pixels, count) {
        // Sort by saturation and select diverse colors
        const withSat = pixels.map(([r, g, b]) => {
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const sat = max === 0 ? 0 : (max - min) / max;
            const lum = (max + min) / 2;
            return { r, g, b, sat, lum };
        });

        // Sort by saturation * luminance
        withSat.sort((a, b) => (b.sat * b.lum) - (a.sat * a.lum));

        // Select diverse colors
        const selected = [withSat[0]];
        for (const pixel of withSat) {
            if (selected.length >= count) break;
            const isDifferent = selected.every(s =>
                colorDistance([pixel.r, pixel.g, pixel.b], [s.r, s.g, s.b]) > 50
            );
            if (isDifferent) selected.push(pixel);
        }

        return selected.map(({ r, g, b }) => ({ r, g, b }));
    }

    function colorDistance(c1, c2) {
        return Math.sqrt(
            Math.pow(c1[0] - c2[0], 2) +
            Math.pow(c1[1] - c2[1], 2) +
            Math.pow(c1[2] - c2[2], 2)
        );
    }

    function rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
    }

    function renderPalette() {
        palette.innerHTML = '';
        palettePreview.innerHTML = '';
        previewContainer.style.display = 'flex';

        extractedColors.forEach(color => {
            const hex = rgbToHex(color.r, color.g, color.b);

            // Preview strip
            const strip = document.createElement('div');
            strip.style.background = hex;
            palettePreview.appendChild(strip);

            // Color card
            const card = document.createElement('div');
            card.className = 'color-card';
            card.innerHTML = `
                <div class="color-swatch" style="background:${hex}"></div>
                <div class="color-info">
                    <div class="hex">${hex.toUpperCase()}</div>
                    <div class="rgb">RGB(${color.r}, ${color.g}, ${color.b})</div>
                </div>
            `;
            card.addEventListener('click', () => {
                navigator.clipboard.writeText(hex);
                card.querySelector('.hex').textContent = 'Copied!';
                setTimeout(() => {
                    card.querySelector('.hex').textContent = hex.toUpperCase();
                }, 1000);
            });
            palette.appendChild(card);
        });
    }

    function exportCSS() {
        const css = `:root {\n${extractedColors.map((c, i) =>
            `  --color-${i + 1}: ${rgbToHex(c.r, c.g, c.b)};`
        ).join('\n')}\n}`;

        navigator.clipboard.writeText(css).then(() => {
            exportBtn.textContent = 'Copied!';
            setTimeout(() => {
                exportBtn.textContent = 'Export CSS | 匯出';
            }, 2000);
        });
    }
});
