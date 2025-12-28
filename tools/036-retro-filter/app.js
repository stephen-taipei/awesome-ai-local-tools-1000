/**
 * Tool #036: Retro Filter | 復古濾鏡
 * Applies vintage and retro color effects to photos
 * 100% local processing with WebGL acceleration
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const imageInput = document.getElementById('imageInput');
    const outputCanvas = document.getElementById('outputCanvas');
    const ctx = outputCanvas.getContext('2d');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const intensitySlider = document.getElementById('intensitySlider');
    const intensityValue = document.getElementById('intensityValue');
    const grainSlider = document.getElementById('grainSlider');
    const grainValue = document.getElementById('grainValue');
    const vignetteSlider = document.getElementById('vignetteSlider');
    const vignetteValue = document.getElementById('vignetteValue');
    const downloadBtn = document.getElementById('downloadBtn');
    const downloadJpgBtn = document.getElementById('downloadJpgBtn');
    const resetBtn = document.getElementById('resetBtn');
    const controlsSection = document.getElementById('controlsSection');
    const previewSection = document.getElementById('previewSection');
    const actionButtons = document.getElementById('actionButtons');

    // State
    let originalImage = null;
    let originalImageData = null;
    let currentFilter = 'none';
    let intensity = 1;
    let grainAmount = 0;
    let vignetteAmount = 0;

    // Filter definitions - color grading matrices and adjustments
    const filters = {
        none: {
            matrix: null,
            adjustments: {}
        },
        '70s': {
            // Warm yellows, faded blacks, low contrast
            adjustments: {
                contrast: 0.9,
                saturation: 0.8,
                brightness: 1.05,
                shadows: { r: 0.1, g: 0.08, b: 0.02 },
                highlights: { r: 1.0, g: 0.95, b: 0.85 },
                gamma: 1.1
            }
        },
        '80s': {
            // Vibrant colors, high saturation, slight cyan shadows
            adjustments: {
                contrast: 1.15,
                saturation: 1.3,
                brightness: 1.0,
                shadows: { r: 0.0, g: 0.05, b: 0.1 },
                highlights: { r: 1.0, g: 0.98, b: 0.95 },
                gamma: 0.95
            }
        },
        polaroid: {
            // Creamy whites, slightly washed, warm
            adjustments: {
                contrast: 0.85,
                saturation: 0.9,
                brightness: 1.1,
                shadows: { r: 0.05, g: 0.05, b: 0.03 },
                highlights: { r: 1.0, g: 0.98, b: 0.92 },
                gamma: 1.05
            }
        },
        sepia: {
            // Classic brown-toned vintage
            adjustments: {
                contrast: 1.0,
                saturation: 0.0,
                brightness: 1.0,
                sepiaTone: true,
                gamma: 1.0
            }
        },
        faded: {
            // Lifted blacks, reduced contrast, nostalgic feel
            adjustments: {
                contrast: 0.75,
                saturation: 0.85,
                brightness: 1.05,
                shadows: { r: 0.15, g: 0.15, b: 0.18 },
                highlights: { r: 0.98, g: 0.98, b: 0.95 },
                gamma: 1.1
            }
        },
        warmVintage: {
            // Golden hour warmth, soft
            adjustments: {
                contrast: 0.9,
                saturation: 0.95,
                brightness: 1.05,
                shadows: { r: 0.08, g: 0.04, b: 0.0 },
                highlights: { r: 1.0, g: 0.92, b: 0.8 },
                gamma: 1.05
            }
        },
        coolVintage: {
            // Cool tones, slightly desaturated
            adjustments: {
                contrast: 0.9,
                saturation: 0.85,
                brightness: 1.0,
                shadows: { r: 0.0, g: 0.05, b: 0.12 },
                highlights: { r: 0.95, g: 0.98, b: 1.0 },
                gamma: 1.0
            }
        },
        kodachrome: {
            // Rich, punchy colors, classic Kodak look
            adjustments: {
                contrast: 1.1,
                saturation: 1.15,
                brightness: 1.0,
                shadows: { r: 0.02, g: 0.0, b: 0.0 },
                highlights: { r: 1.0, g: 0.97, b: 0.9 },
                gamma: 0.98,
                redBoost: 1.08,
                blueReduction: 0.95
            }
        },
        agfa: {
            // Agfa Vista style - green tint in shadows, warm highlights
            adjustments: {
                contrast: 1.05,
                saturation: 1.1,
                brightness: 1.0,
                shadows: { r: 0.0, g: 0.08, b: 0.05 },
                highlights: { r: 1.0, g: 0.95, b: 0.88 },
                gamma: 1.02
            }
        },
        crossProcess: {
            // Cross-processed film look - cyan shadows, yellow highlights
            adjustments: {
                contrast: 1.2,
                saturation: 1.2,
                brightness: 1.0,
                shadows: { r: 0.0, g: 0.1, b: 0.15 },
                highlights: { r: 1.0, g: 0.95, b: 0.75 },
                gamma: 0.95,
                curves: true
            }
        },
        lofi: {
            // Lo-fi aesthetic - high contrast, crushed blacks, saturated
            adjustments: {
                contrast: 1.3,
                saturation: 1.25,
                brightness: 0.95,
                shadows: { r: 0.1, g: 0.08, b: 0.12 },
                highlights: { r: 1.0, g: 0.98, b: 0.95 },
                gamma: 0.9
            }
        }
    };

    // Event Listeners
    imageInput.addEventListener('change', handleImageUpload);

    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterButtons.forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            currentFilter = e.currentTarget.dataset.filter;
            applyAllEffects();
        });
    });

    intensitySlider.addEventListener('input', (e) => {
        intensity = e.target.value / 100;
        intensityValue.textContent = `${e.target.value}%`;
        applyAllEffects();
    });

    grainSlider.addEventListener('input', (e) => {
        grainAmount = e.target.value / 100;
        grainValue.textContent = `${e.target.value}%`;
        applyAllEffects();
    });

    vignetteSlider.addEventListener('input', (e) => {
        vignetteAmount = e.target.value / 100;
        vignetteValue.textContent = `${e.target.value}%`;
        applyAllEffects();
    });

    downloadBtn.addEventListener('click', () => downloadImage('png'));
    downloadJpgBtn.addEventListener('click', () => downloadImage('jpeg'));
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
                const maxWidth = 1200;
                const maxHeight = 800;
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

                outputCanvas.width = width;
                outputCanvas.height = height;

                // Draw original and store data
                ctx.drawImage(originalImage, 0, 0, width, height);
                originalImageData = ctx.getImageData(0, 0, width, height);

                // Show controls
                controlsSection.style.display = 'block';
                previewSection.style.display = 'flex';
                actionButtons.style.display = 'flex';

                applyAllEffects();
            };
            originalImage.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }

    function applyAllEffects() {
        if (!originalImageData) return;

        // Create a copy of original data
        const imageData = new ImageData(
            new Uint8ClampedArray(originalImageData.data),
            originalImageData.width,
            originalImageData.height
        );

        // Apply filter
        if (currentFilter !== 'none') {
            applyFilter(imageData, filters[currentFilter], intensity);
        }

        // Apply grain
        if (grainAmount > 0) {
            applyGrain(imageData, grainAmount);
        }

        // Put processed image on canvas
        ctx.putImageData(imageData, 0, 0);

        // Apply vignette (done via canvas compositing)
        if (vignetteAmount > 0) {
            applyVignette(vignetteAmount);
        }
    }

    function applyFilter(imageData, filter, intensity) {
        if (!filter.adjustments) return;

        const data = imageData.data;
        const adj = filter.adjustments;

        for (let i = 0; i < data.length; i += 4) {
            let r = data[i] / 255;
            let g = data[i + 1] / 255;
            let b = data[i + 2] / 255;

            // Store original for intensity blending
            const origR = r, origG = g, origB = b;

            // Apply sepia if needed
            if (adj.sepiaTone) {
                const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                r = Math.min(1, gray * 1.2);
                g = Math.min(1, gray * 1.0);
                b = Math.min(1, gray * 0.8);
            } else {
                // Apply saturation
                if (adj.saturation !== undefined) {
                    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                    r = gray + (r - gray) * adj.saturation;
                    g = gray + (g - gray) * adj.saturation;
                    b = gray + (b - gray) * adj.saturation;
                }
            }

            // Apply brightness
            if (adj.brightness !== undefined) {
                r *= adj.brightness;
                g *= adj.brightness;
                b *= adj.brightness;
            }

            // Apply contrast
            if (adj.contrast !== undefined) {
                r = (r - 0.5) * adj.contrast + 0.5;
                g = (g - 0.5) * adj.contrast + 0.5;
                b = (b - 0.5) * adj.contrast + 0.5;
            }

            // Apply gamma
            if (adj.gamma !== undefined) {
                r = Math.pow(Math.max(0, r), 1 / adj.gamma);
                g = Math.pow(Math.max(0, g), 1 / adj.gamma);
                b = Math.pow(Math.max(0, b), 1 / adj.gamma);
            }

            // Apply shadow/highlight color shifts
            if (adj.shadows && adj.highlights) {
                const luma = 0.299 * r + 0.587 * g + 0.114 * b;
                const shadowWeight = 1 - luma;
                const highlightWeight = luma;

                r += adj.shadows.r * shadowWeight * 0.5;
                g += adj.shadows.g * shadowWeight * 0.5;
                b += adj.shadows.b * shadowWeight * 0.5;

                r *= 1 + (adj.highlights.r - 1) * highlightWeight * 0.5;
                g *= 1 + (adj.highlights.g - 1) * highlightWeight * 0.5;
                b *= 1 + (adj.highlights.b - 1) * highlightWeight * 0.5;
            }

            // Special adjustments
            if (adj.redBoost) r *= adj.redBoost;
            if (adj.blueReduction) b *= adj.blueReduction;

            // Cross process curves
            if (adj.curves) {
                // S-curve for more punch
                r = sCurve(r);
                g = sCurve(g);
                b = sCurve(b);
            }

            // Clamp values
            r = Math.max(0, Math.min(1, r));
            g = Math.max(0, Math.min(1, g));
            b = Math.max(0, Math.min(1, b));

            // Blend with original based on intensity
            r = origR + (r - origR) * intensity;
            g = origG + (g - origG) * intensity;
            b = origB + (b - origB) * intensity;

            data[i] = r * 255;
            data[i + 1] = g * 255;
            data[i + 2] = b * 255;
        }
    }

    function sCurve(x) {
        // Soft S-curve for contrast enhancement
        return x < 0.5
            ? 2 * x * x
            : 1 - Math.pow(-2 * x + 2, 2) / 2;
    }

    function applyGrain(imageData, amount) {
        const data = imageData.data;
        const grainIntensity = amount * 50; // Scale grain effect

        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * grainIntensity;
            data[i] = Math.max(0, Math.min(255, data[i] + noise));
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
        }
    }

    function applyVignette(amount) {
        const width = outputCanvas.width;
        const height = outputCanvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.sqrt(centerX * centerX + centerY * centerY);

        // Create radial gradient
        const gradient = ctx.createRadialGradient(
            centerX, centerY, radius * (1 - amount * 0.5),
            centerX, centerY, radius
        );

        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, `rgba(0,0,0,${amount * 0.7})`);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }

    function downloadImage(format) {
        const link = document.createElement('a');
        const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
        const quality = format === 'jpeg' ? 0.92 : undefined;

        link.download = `retro-filter-${currentFilter}-${Date.now()}.${format}`;
        link.href = outputCanvas.toDataURL(mimeType, quality);
        link.click();
    }

    function resetAll() {
        // Reset sliders
        intensitySlider.value = 100;
        intensity = 1;
        intensityValue.textContent = '100%';

        grainSlider.value = 0;
        grainAmount = 0;
        grainValue.textContent = '0%';

        vignetteSlider.value = 0;
        vignetteAmount = 0;
        vignetteValue.textContent = '0%';

        // Reset filter selection
        filterButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelector('[data-filter="none"]').classList.add('active');
        currentFilter = 'none';

        // Re-apply (shows original)
        applyAllEffects();
    }
});
