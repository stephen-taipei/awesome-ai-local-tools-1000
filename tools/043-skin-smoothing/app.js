/**
 * Tool #043: Smart Skin Smoothing | 智慧磨皮
 * Texture-preserving skin smoothing technology
 * 100% local processing
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const imageInput = document.getElementById('imageInput');
    const originalCanvas = document.getElementById('originalCanvas');
    const outputCanvas = document.getElementById('outputCanvas');
    const originalCtx = originalCanvas.getContext('2d');
    const outputCtx = outputCanvas.getContext('2d');

    const modeButtons = document.querySelectorAll('.mode-btn');
    const intensitySlider = document.getElementById('intensitySlider');
    const textureSlider = document.getElementById('textureSlider');
    const rangeSlider = document.getElementById('rangeSlider');
    const sharpnessSlider = document.getElementById('sharpnessSlider');

    const intensityValue = document.getElementById('intensityValue');
    const textureValue = document.getElementById('textureValue');
    const rangeValue = document.getElementById('rangeValue');
    const sharpnessValue = document.getElementById('sharpnessValue');

    const downloadBtn = document.getElementById('downloadBtn');
    const resetBtn = document.getElementById('resetBtn');
    const controlsSection = document.getElementById('controlsSection');
    const previewSection = document.getElementById('previewSection');
    const actionButtons = document.getElementById('actionButtons');

    // State
    let originalImage = null;
    let originalImageData = null;
    let currentMode = 'smart';
    let processingTimeout = null;

    // Mode presets
    const modePresets = {
        natural: { intensity: 30, texture: 85, range: 40, sharpness: 40 },
        smart: { intensity: 50, texture: 70, range: 50, sharpness: 30 },
        strong: { intensity: 80, texture: 40, range: 60, sharpness: 20 },
        pore: { intensity: 60, texture: 50, range: 45, sharpness: 50 }
    };

    // Event Listeners
    imageInput.addEventListener('change', handleImageUpload);

    modeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            modeButtons.forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            currentMode = e.currentTarget.dataset.mode;
            applyModePreset(currentMode);
        });
    });

    const sliders = [intensitySlider, textureSlider, rangeSlider, sharpnessSlider];
    sliders.forEach(slider => {
        slider.addEventListener('input', () => {
            updateValueDisplays();
            debouncedProcess();
        });
    });

    downloadBtn.addEventListener('click', downloadImage);
    resetBtn.addEventListener('click', resetAll);

    // Functions
    function handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            originalImage = new Image();
            originalImage.onload = () => {
                // Set canvas dimensions
                const maxWidth = 600;
                const maxHeight = 600;
                let width = originalImage.width;
                let height = originalImage.height;

                if (width > maxWidth) {
                    height = (maxWidth / width) * height;
                    width = maxWidth;
                }
                if (height > maxHeight) {
                    width = (maxHeight / height) * width;
                    height = maxHeight;
                }

                originalCanvas.width = width;
                originalCanvas.height = height;
                outputCanvas.width = width;
                outputCanvas.height = height;

                originalCtx.drawImage(originalImage, 0, 0, width, height);
                originalImageData = originalCtx.getImageData(0, 0, width, height);

                controlsSection.style.display = 'block';
                previewSection.style.display = 'flex';
                actionButtons.style.display = 'flex';

                processImage();
            };
            originalImage.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }

    function applyModePreset(mode) {
        const preset = modePresets[mode];
        intensitySlider.value = preset.intensity;
        textureSlider.value = preset.texture;
        rangeSlider.value = preset.range;
        sharpnessSlider.value = preset.sharpness;
        updateValueDisplays();
        processImage();
    }

    function updateValueDisplays() {
        intensityValue.textContent = `${intensitySlider.value}%`;
        textureValue.textContent = `${textureSlider.value}%`;
        rangeValue.textContent = `${rangeSlider.value}%`;
        sharpnessValue.textContent = `${sharpnessSlider.value}%`;
    }

    function debouncedProcess() {
        if (processingTimeout) clearTimeout(processingTimeout);
        processingTimeout = setTimeout(processImage, 50);
    }

    function processImage() {
        if (!originalImageData) return;

        const intensity = intensitySlider.value / 100;
        const texturePreserve = textureSlider.value / 100;
        const skinRange = rangeSlider.value / 100;
        const sharpness = sharpnessSlider.value / 100;

        // Create working copy
        const imageData = new ImageData(
            new Uint8ClampedArray(originalImageData.data),
            originalImageData.width,
            originalImageData.height
        );

        // Create skin mask
        const skinMask = createSkinMask(imageData, skinRange);

        // Apply bilateral-like smoothing
        applySmartSmoothing(imageData, skinMask, intensity, texturePreserve);

        // Apply edge sharpening
        if (sharpness > 0) {
            applyEdgeSharpening(imageData, skinMask, sharpness);
        }

        outputCtx.putImageData(imageData, 0, 0);
    }

    function createSkinMask(imageData, sensitivity) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        const mask = new Float32Array(width * height);

        const threshold = 0.3 + sensitivity * 0.4;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];

                // Enhanced skin detection
                const skinScore = getSkinProbability(r, g, b);
                mask[y * width + x] = skinScore > threshold ? skinScore : 0;
            }
        }

        // Smooth the mask to avoid harsh edges
        return smoothMask(mask, width, height);
    }

    function getSkinProbability(r, g, b) {
        // YCbCr-based skin detection
        const y = 0.299 * r + 0.587 * g + 0.114 * b;
        const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
        const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

        // Skin color ranges in YCbCr
        const cbMin = 77, cbMax = 127;
        const crMin = 133, crMax = 173;
        const yMin = 80;

        if (y > yMin && cb >= cbMin && cb <= cbMax && cr >= crMin && cr <= crMax) {
            // Calculate how centered in the range (higher = more likely skin)
            const cbCenter = (cbMax + cbMin) / 2;
            const crCenter = (crMax + crMin) / 2;
            const cbDist = 1 - Math.abs(cb - cbCenter) / ((cbMax - cbMin) / 2);
            const crDist = 1 - Math.abs(cr - crCenter) / ((crMax - crMin) / 2);
            return Math.min(1, (cbDist + crDist) / 2 + 0.3);
        }

        // RGB-based fallback
        if (r > 95 && g > 40 && b > 20 && r > g && r > b && Math.abs(r - g) > 15) {
            return 0.6;
        }

        return 0;
    }

    function smoothMask(mask, width, height) {
        const smoothed = new Float32Array(mask.length);
        const radius = 2;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let sum = 0, count = 0;
                for (let dy = -radius; dy <= radius; dy++) {
                    for (let dx = -radius; dx <= radius; dx++) {
                        const nx = x + dx, ny = y + dy;
                        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                            sum += mask[ny * width + nx];
                            count++;
                        }
                    }
                }
                smoothed[y * width + x] = sum / count;
            }
        }
        return smoothed;
    }

    function applySmartSmoothing(imageData, skinMask, intensity, texturePreserve) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        const original = new Uint8ClampedArray(data);

        const blurRadius = Math.ceil(intensity * 8) + 1;
        const sigmaColor = 30 + (1 - texturePreserve) * 50;

        // Bilateral filter approximation
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                const skinWeight = skinMask[y * width + x];

                if (skinWeight < 0.1) continue; // Skip non-skin areas

                const centerR = original[idx];
                const centerG = original[idx + 1];
                const centerB = original[idx + 2];

                let sumR = 0, sumG = 0, sumB = 0, totalWeight = 0;

                for (let dy = -blurRadius; dy <= blurRadius; dy++) {
                    for (let dx = -blurRadius; dx <= blurRadius; dx++) {
                        const nx = x + dx, ny = y + dy;
                        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;

                        const nidx = (ny * width + nx) * 4;
                        const nr = original[nidx];
                        const ng = original[nidx + 1];
                        const nb = original[nidx + 2];

                        // Spatial weight (Gaussian)
                        const spatialDist = Math.sqrt(dx * dx + dy * dy);
                        const spatialWeight = Math.exp(-spatialDist * spatialDist / (2 * blurRadius * blurRadius));

                        // Color similarity weight
                        const colorDist = Math.sqrt(
                            (nr - centerR) ** 2 +
                            (ng - centerG) ** 2 +
                            (nb - centerB) ** 2
                        );
                        const colorWeight = Math.exp(-colorDist * colorDist / (2 * sigmaColor * sigmaColor));

                        const weight = spatialWeight * colorWeight;
                        sumR += nr * weight;
                        sumG += ng * weight;
                        sumB += nb * weight;
                        totalWeight += weight;
                    }
                }

                if (totalWeight > 0) {
                    const blendAmount = skinWeight * intensity;
                    data[idx] = centerR + (sumR / totalWeight - centerR) * blendAmount;
                    data[idx + 1] = centerG + (sumG / totalWeight - centerG) * blendAmount;
                    data[idx + 2] = centerB + (sumB / totalWeight - centerB) * blendAmount;
                }
            }
        }
    }

    function applyEdgeSharpening(imageData, skinMask, amount) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        const original = new Uint8ClampedArray(data);

        // Unsharp mask
        const sharpenAmount = amount * 0.5;

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = (y * width + x) * 4;
                const skinWeight = skinMask[y * width + x];

                // Only sharpen edges near skin (preserve facial features)
                if (skinWeight < 0.3) continue;

                for (let c = 0; c < 3; c++) {
                    // Laplacian kernel
                    const center = original[idx + c];
                    const top = original[((y - 1) * width + x) * 4 + c];
                    const bottom = original[((y + 1) * width + x) * 4 + c];
                    const left = original[(y * width + x - 1) * 4 + c];
                    const right = original[(y * width + x + 1) * 4 + c];

                    const laplacian = 4 * center - top - bottom - left - right;

                    // Apply sharpening
                    const sharpened = center + laplacian * sharpenAmount * (1 - skinWeight * 0.5);
                    data[idx + c] = Math.max(0, Math.min(255, sharpened));
                }
            }
        }
    }

    function downloadImage() {
        const link = document.createElement('a');
        link.download = `skin-smoothing-${Date.now()}.png`;
        link.href = outputCanvas.toDataURL('image/png');
        link.click();
    }

    function resetAll() {
        document.querySelector('[data-mode="smart"]').click();
    }
});
