/**
 * Tool #059: Depth Estimation
 * Generates depth maps from images using edge and gradient analysis
 */
document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('imageInput');
    const originalCanvas = document.getElementById('originalCanvas');
    const depthCanvas = document.getElementById('depthCanvas');
    const ctxOriginal = originalCanvas.getContext('2d');
    const ctxDepth = depthCanvas.getContext('2d');
    const controls = document.getElementById('controls');
    const previewContainer = document.getElementById('previewContainer');
    const depthInfo = document.getElementById('depthInfo');
    const infoGrid = document.getElementById('infoGrid');
    const colormapSelect = document.getElementById('colormap');
    const contrastSlider = document.getElementById('contrast');
    const invertCheckbox = document.getElementById('invert');
    const downloadBtn = document.getElementById('downloadBtn');

    let originalImageData = null;
    let depthData = null;

    // Colormaps
    const colormaps = {
        magma: [[0,0,4],[28,16,68],[79,18,123],[129,37,129],[181,54,122],[229,80,100],[251,135,97],[254,194,135],[252,253,191]],
        viridis: [[68,1,84],[72,40,120],[62,73,137],[49,104,142],[38,130,142],[31,158,137],[53,183,121],[109,205,89],[180,222,44],[253,231,37]],
        plasma: [[13,8,135],[75,3,161],[126,3,168],[168,34,150],[203,70,121],[229,107,93],[248,148,65],[253,195,40],[240,249,33]],
        inferno: [[0,0,4],[40,11,84],[101,21,110],[159,42,99],[212,72,66],[245,125,21],[250,193,39],[252,255,164]],
        grayscale: [[0,0,0],[128,128,128],[255,255,255]],
        rainbow: [[148,0,211],[75,0,130],[0,0,255],[0,255,0],[255,255,0],[255,127,0],[255,0,0]]
    };

    imageInput.addEventListener('change', handleImageUpload);
    colormapSelect.addEventListener('change', applyColormap);
    contrastSlider.addEventListener('input', applyColormap);
    invertCheckbox.addEventListener('change', applyColormap);
    downloadBtn.addEventListener('click', downloadDepthMap);

    function handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const maxSize = 500;
                let w = img.width, h = img.height;
                if (w > maxSize || h > maxSize) {
                    const scale = Math.min(maxSize / w, maxSize / h);
                    w = Math.floor(w * scale);
                    h = Math.floor(h * scale);
                }

                originalCanvas.width = w;
                originalCanvas.height = h;
                depthCanvas.width = w;
                depthCanvas.height = h;

                ctxOriginal.drawImage(img, 0, 0, w, h);
                originalImageData = ctxOriginal.getImageData(0, 0, w, h);

                controls.style.display = 'flex';
                previewContainer.style.display = 'flex';
                depthInfo.style.display = 'block';

                estimateDepth();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }

    function estimateDepth() {
        const w = originalImageData.width;
        const h = originalImageData.height;
        const data = originalImageData.data;

        // Convert to grayscale
        const gray = new Float32Array(w * h);
        for (let i = 0; i < w * h; i++) {
            const idx = i * 4;
            gray[i] = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
        }

        // Calculate gradients (Sobel-like)
        const gradients = new Float32Array(w * h);
        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
                const idx = y * w + x;
                const gx = gray[idx + 1] - gray[idx - 1];
                const gy = gray[idx + w] - gray[idx - w];
                gradients[idx] = Math.sqrt(gx * gx + gy * gy);
            }
        }

        // Blur gradients for smoother depth
        const blurred = blur(gradients, w, h, 5);

        // Combine multiple cues for depth estimation
        depthData = new Float32Array(w * h);
        let minDepth = Infinity, maxDepth = -Infinity;

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const idx = y * w + x;

                // Cue 1: Vertical position (higher = further)
                const verticalCue = y / h;

                // Cue 2: Edge density (more edges = closer/more detail)
                const edgeCue = blurred[idx] / 255;

                // Cue 3: Local brightness (darker often further in scenes)
                const brightCue = gray[idx] / 255;

                // Cue 4: Texture frequency (more texture = closer)
                let texture = 0;
                if (x > 0 && y > 0 && x < w - 1 && y < h - 1) {
                    texture = Math.abs(gray[idx] - gray[idx - 1]) +
                              Math.abs(gray[idx] - gray[idx + 1]) +
                              Math.abs(gray[idx] - gray[idx - w]) +
                              Math.abs(gray[idx] - gray[idx + w]);
                    texture /= 1020; // Normalize
                }

                // Combine cues with weights
                depthData[idx] = verticalCue * 0.3 + edgeCue * 0.25 +
                                 (1 - brightCue) * 0.2 + texture * 0.25;

                if (depthData[idx] < minDepth) minDepth = depthData[idx];
                if (depthData[idx] > maxDepth) maxDepth = depthData[idx];
            }
        }

        // Normalize depth to 0-1
        const range = maxDepth - minDepth || 1;
        for (let i = 0; i < depthData.length; i++) {
            depthData[i] = (depthData[i] - minDepth) / range;
        }

        // Apply multi-scale refinement
        depthData = refineDepth(depthData, w, h);

        applyColormap();
        updateInfo();
    }

    function blur(data, w, h, radius) {
        const result = new Float32Array(data.length);
        const kernelSize = radius * 2 + 1;

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                let sum = 0, count = 0;
                for (let ky = -radius; ky <= radius; ky++) {
                    for (let kx = -radius; kx <= radius; kx++) {
                        const ny = y + ky, nx = x + kx;
                        if (ny >= 0 && ny < h && nx >= 0 && nx < w) {
                            sum += data[ny * w + nx];
                            count++;
                        }
                    }
                }
                result[y * w + x] = sum / count;
            }
        }
        return result;
    }

    function refineDepth(depth, w, h) {
        // Apply bilateral-like filtering to preserve edges
        const refined = new Float32Array(depth.length);
        const radius = 3;
        const sigmaSpatial = 2;
        const sigmaRange = 0.1;

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const idx = y * w + x;
                const centerVal = depth[idx];
                let sum = 0, weightSum = 0;

                for (let ky = -radius; ky <= radius; ky++) {
                    for (let kx = -radius; kx <= radius; kx++) {
                        const ny = y + ky, nx = x + kx;
                        if (ny >= 0 && ny < h && nx >= 0 && nx < w) {
                            const nidx = ny * w + nx;
                            const spatialDist = Math.sqrt(kx * kx + ky * ky);
                            const rangeDist = Math.abs(depth[nidx] - centerVal);
                            const weight = Math.exp(-spatialDist * spatialDist / (2 * sigmaSpatial * sigmaSpatial)) *
                                          Math.exp(-rangeDist * rangeDist / (2 * sigmaRange * sigmaRange));
                            sum += depth[nidx] * weight;
                            weightSum += weight;
                        }
                    }
                }
                refined[idx] = weightSum > 0 ? sum / weightSum : centerVal;
            }
        }
        return refined;
    }

    function applyColormap() {
        if (!depthData) return;

        const w = depthCanvas.width;
        const h = depthCanvas.height;
        const imageData = ctxDepth.createImageData(w, h);
        const colormap = colormaps[colormapSelect.value];
        const contrast = parseFloat(contrastSlider.value);
        const invert = invertCheckbox.checked;

        for (let i = 0; i < depthData.length; i++) {
            let val = depthData[i];

            // Apply contrast
            val = ((val - 0.5) * contrast) + 0.5;
            val = Math.max(0, Math.min(1, val));

            // Invert if needed
            if (invert) val = 1 - val;

            // Map to colormap
            const color = interpolateColormap(colormap, val);
            const idx = i * 4;
            imageData.data[idx] = color[0];
            imageData.data[idx + 1] = color[1];
            imageData.data[idx + 2] = color[2];
            imageData.data[idx + 3] = 255;
        }

        ctxDepth.putImageData(imageData, 0, 0);
    }

    function interpolateColormap(colormap, t) {
        const n = colormap.length - 1;
        const idx = t * n;
        const i = Math.floor(idx);
        const f = idx - i;

        if (i >= n) return colormap[n];
        if (i < 0) return colormap[0];

        const c1 = colormap[i];
        const c2 = colormap[i + 1];

        return [
            Math.round(c1[0] + (c2[0] - c1[0]) * f),
            Math.round(c1[1] + (c2[1] - c1[1]) * f),
            Math.round(c1[2] + (c2[2] - c1[2]) * f)
        ];
    }

    function updateInfo() {
        if (!depthData) return;

        // Calculate statistics
        let min = 1, max = 0, sum = 0;
        const histogram = new Array(10).fill(0);

        for (let i = 0; i < depthData.length; i++) {
            const val = depthData[i];
            if (val < min) min = val;
            if (val > max) max = val;
            sum += val;
            histogram[Math.min(9, Math.floor(val * 10))]++;
        }

        const mean = sum / depthData.length;

        // Find dominant depth region
        const maxBin = histogram.indexOf(Math.max(...histogram));
        const dominantRange = `${maxBin * 10}%-${(maxBin + 1) * 10}%`;

        // Calculate variance
        let variance = 0;
        for (let i = 0; i < depthData.length; i++) {
            variance += Math.pow(depthData[i] - mean, 2);
        }
        variance /= depthData.length;
        const stdDev = Math.sqrt(variance);

        infoGrid.innerHTML = `
            <div class="info-item">
                <div class="info-value">${Math.round(mean * 100)}%</div>
                <div class="info-label">Mean Depth | 平均深度</div>
            </div>
            <div class="info-item">
                <div class="info-value">${Math.round(min * 100)}% - ${Math.round(max * 100)}%</div>
                <div class="info-label">Depth Range | 深度範圍</div>
            </div>
            <div class="info-item">
                <div class="info-value">${dominantRange}</div>
                <div class="info-label">Dominant | 主要深度</div>
            </div>
            <div class="info-item">
                <div class="info-value">${(stdDev * 100).toFixed(1)}%</div>
                <div class="info-label">Variation | 變化程度</div>
            </div>
        `;
    }

    function downloadDepthMap() {
        const link = document.createElement('a');
        link.download = 'depth-map.png';
        link.href = depthCanvas.toDataURL('image/png');
        link.click();
    }
});
