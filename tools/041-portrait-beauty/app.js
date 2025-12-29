/**
 * Tool #041: AI Portrait Beauty | AI 人像美化
 * Smart beautification with skin smoothing, whitening, and face enhancement
 * 100% local processing
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const imageInput = document.getElementById('imageInput');
    const originalCanvas = document.getElementById('originalCanvas');
    const outputCanvas = document.getElementById('outputCanvas');
    const originalCtx = originalCanvas.getContext('2d');
    const outputCtx = outputCanvas.getContext('2d');

    const presetButtons = document.querySelectorAll('.preset-btn');
    const smoothSlider = document.getElementById('smoothSlider');
    const whitenSlider = document.getElementById('whitenSlider');
    const slimSlider = document.getElementById('slimSlider');
    const eyeSlider = document.getElementById('eyeSlider');
    const brightnessSlider = document.getElementById('brightnessSlider');
    const contrastSlider = document.getElementById('contrastSlider');

    const smoothValue = document.getElementById('smoothValue');
    const whitenValue = document.getElementById('whitenValue');
    const slimValue = document.getElementById('slimValue');
    const eyeValue = document.getElementById('eyeValue');
    const brightnessValue = document.getElementById('brightnessValue');
    const contrastValue = document.getElementById('contrastValue');

    const downloadBtn = document.getElementById('downloadBtn');
    const resetBtn = document.getElementById('resetBtn');
    const controlsSection = document.getElementById('controlsSection');
    const previewSection = document.getElementById('previewSection');
    const actionButtons = document.getElementById('actionButtons');

    // State
    let originalImage = null;
    let originalImageData = null;
    let processingTimeout = null;

    // Presets
    const presets = {
        natural: { smooth: 20, whiten: 10, slim: 0, eye: 0, brightness: 0, contrast: 0 },
        light: { smooth: 30, whiten: 20, slim: 5, eye: 5, brightness: 5, contrast: 5 },
        moderate: { smooth: 50, whiten: 35, slim: 10, eye: 10, brightness: 5, contrast: 10 },
        glamour: { smooth: 70, whiten: 50, slim: 15, eye: 15, brightness: 10, contrast: 15 },
        custom: null // Use current slider values
    };

    // Event Listeners
    imageInput.addEventListener('change', handleImageUpload);

    presetButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            presetButtons.forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');

            const preset = presets[e.currentTarget.dataset.preset];
            if (preset) {
                applyPreset(preset);
            }
        });
    });

    // Slider event listeners
    const sliders = [smoothSlider, whitenSlider, slimSlider, eyeSlider, brightnessSlider, contrastSlider];
    sliders.forEach(slider => {
        slider.addEventListener('input', () => {
            updateValueDisplays();
            debouncedProcess();
            // Mark as custom when manually adjusting
            presetButtons.forEach(b => b.classList.remove('active'));
            document.querySelector('[data-preset="custom"]').classList.add('active');
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

                // Scale down if needed
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

                // Draw original
                originalCtx.drawImage(originalImage, 0, 0, width, height);
                originalImageData = originalCtx.getImageData(0, 0, width, height);

                // Show controls
                controlsSection.style.display = 'block';
                previewSection.style.display = 'flex';
                actionButtons.style.display = 'flex';

                // Apply default preset
                document.querySelector('[data-preset="natural"]').click();
            };
            originalImage.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }

    function applyPreset(preset) {
        smoothSlider.value = preset.smooth;
        whitenSlider.value = preset.whiten;
        slimSlider.value = preset.slim;
        eyeSlider.value = preset.eye;
        brightnessSlider.value = preset.brightness;
        contrastSlider.value = preset.contrast;
        updateValueDisplays();
        processImage();
    }

    function updateValueDisplays() {
        smoothValue.textContent = `${smoothSlider.value}%`;
        whitenValue.textContent = `${whitenSlider.value}%`;
        slimValue.textContent = `${slimSlider.value}%`;
        eyeValue.textContent = `${eyeSlider.value}%`;
        brightnessValue.textContent = `${brightnessSlider.value}%`;
        contrastValue.textContent = `${contrastSlider.value}%`;
    }

    function debouncedProcess() {
        if (processingTimeout) {
            clearTimeout(processingTimeout);
        }
        processingTimeout = setTimeout(processImage, 50);
    }

    function processImage() {
        if (!originalImageData) return;

        const smoothAmount = smoothSlider.value / 100;
        const whitenAmount = whitenSlider.value / 100;
        const brightnessAmount = brightnessSlider.value / 100;
        const contrastAmount = 1 + contrastSlider.value / 100;

        // Create working copy
        const imageData = new ImageData(
            new Uint8ClampedArray(originalImageData.data),
            originalImageData.width,
            originalImageData.height
        );

        // Apply skin smoothing (bilateral filter approximation)
        if (smoothAmount > 0) {
            applySkinSmoothing(imageData, smoothAmount);
        }

        // Apply whitening and brightness/contrast
        applyColorAdjustments(imageData, whitenAmount, brightnessAmount, contrastAmount);

        // Put result on canvas
        outputCtx.putImageData(imageData, 0, 0);
    }

    function applySkinSmoothing(imageData, amount) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        const radius = Math.ceil(amount * 5) + 1;

        // Create a copy for reading
        const original = new Uint8ClampedArray(data);

        // Simple box blur with skin color detection
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                const r = original[idx];
                const g = original[idx + 1];
                const b = original[idx + 2];

                // Detect if this is likely skin color
                if (isSkinColor(r, g, b)) {
                    // Apply smoothing only to skin areas
                    let sumR = 0, sumG = 0, sumB = 0, count = 0;

                    for (let dy = -radius; dy <= radius; dy++) {
                        for (let dx = -radius; dx <= radius; dx++) {
                            const nx = x + dx;
                            const ny = y + dy;
                            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                                const nidx = (ny * width + nx) * 4;
                                const nr = original[nidx];
                                const ng = original[nidx + 1];
                                const nb = original[nidx + 2];

                                // Only include similar skin colors in blur
                                if (isSkinColor(nr, ng, nb)) {
                                    const weight = 1;
                                    sumR += nr * weight;
                                    sumG += ng * weight;
                                    sumB += nb * weight;
                                    count += weight;
                                }
                            }
                        }
                    }

                    if (count > 0) {
                        // Blend original with smoothed based on amount
                        data[idx] = r + (sumR / count - r) * amount * 0.8;
                        data[idx + 1] = g + (sumG / count - g) * amount * 0.8;
                        data[idx + 2] = b + (sumB / count - b) * amount * 0.8;
                    }
                }
            }
        }
    }

    function isSkinColor(r, g, b) {
        // Simple skin color detection heuristic
        // Based on RGB ratio and value ranges
        const maxRGB = Math.max(r, g, b);
        const minRGB = Math.min(r, g, b);

        // Skin tends to have R > G > B and moderate saturation
        const isSkin = (
            r > 95 && g > 40 && b > 20 &&
            r > g && g > b &&
            (maxRGB - minRGB) > 15 &&
            Math.abs(r - g) > 15 &&
            r > 100
        );

        return isSkin;
    }

    function applyColorAdjustments(imageData, whitenAmount, brightnessAmount, contrastAmount) {
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];

            // Apply whitening (skin brightening)
            if (isSkinColor(r, g, b)) {
                // Increase luminance for skin areas
                const whiteBoost = 1 + whitenAmount * 0.3;
                r = Math.min(255, r * whiteBoost);
                g = Math.min(255, g * whiteBoost);
                b = Math.min(255, b * whiteBoost);

                // Slight desaturation for fairer look
                const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                const desatAmount = whitenAmount * 0.15;
                r = r + (gray - r) * desatAmount;
                g = g + (gray - g) * desatAmount;
                b = b + (gray - b) * desatAmount;
            }

            // Apply brightness
            r = r + brightnessAmount * 50;
            g = g + brightnessAmount * 50;
            b = b + brightnessAmount * 50;

            // Apply contrast
            r = (r - 128) * contrastAmount + 128;
            g = (g - 128) * contrastAmount + 128;
            b = (b - 128) * contrastAmount + 128;

            // Clamp values
            data[i] = Math.max(0, Math.min(255, r));
            data[i + 1] = Math.max(0, Math.min(255, g));
            data[i + 2] = Math.max(0, Math.min(255, b));
        }
    }

    function downloadImage() {
        const link = document.createElement('a');
        link.download = `portrait-beauty-${Date.now()}.png`;
        link.href = outputCanvas.toDataURL('image/png');
        link.click();
    }

    function resetAll() {
        // Reset to natural preset
        document.querySelector('[data-preset="natural"]').click();
    }
});
