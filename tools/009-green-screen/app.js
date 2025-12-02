/**
 * AI Green Screen - Chroma Key Background Removal
 * Tool #009 - Uses HSV color space for real-time chroma keying
 */

// Translations
const translations = {
    zh: {
        title: 'AI 綠幕去背',
        subtitle: '專業級色度鍵去背，支援綠幕、藍幕等任意顏色',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        uploadText: '點擊或拖放圖片到這裡',
        uploadHint: '支援 JPG、PNG、WebP 格式',
        tabResult: '去背結果',
        tabOriginal: '原圖',
        tabMask: '遮罩',
        chromaSettings: '色度鍵設定',
        keyColor: '去背顏色',
        presetGreen: '綠幕',
        presetBlue: '藍幕',
        presetCustom: '自訂',
        pickColor: '吸取',
        pickColorHint: '點擊圖片吸取顏色',
        tolerance: '色彩容差',
        softness: '邊緣柔化',
        spillSuppression: '色彩溢出抑制',
        edgeRefinement: '邊緣細化',
        presets: '快速預設',
        presetStudio: '攝影棚',
        presetOutdoor: '戶外',
        presetLowlight: '低光源',
        presetSharp: '銳利',
        bgPreview: '背景預覽',
        bgCheckerboard: '透明',
        bgWhite: '白色',
        bgBlack: '黑色',
        bgCustom: '自訂',
        applyEffect: '套用效果',
        newImage: '選擇新圖片',
        download: '下載結果',
        processing: '正在處理中...',
        howItWorks: '如何運作？',
        colorAnalysis: '顏色分析',
        colorAnalysisDesc: '將圖片轉換為 HSV 色彩空間進行精確分析',
        chromaKey: '色度鍵',
        chromaKeyDesc: '根據設定的顏色和容差建立透明遮罩',
        edgeProcess: '邊緣處理',
        edgeProcessDesc: '柔化邊緣並抑制顏色溢出',
        proResult: '專業成果',
        proResultDesc: '輸出帶透明通道的高品質 PNG 圖片',
        techSpecs: '技術規格',
        specMethod: '處理方式',
        specMethodValue: 'HSV 色度鍵演算法',
        specRealtime: '即時處理',
        specRealtimeValue: '是',
        specInput: '輸入格式',
        specOutput: '輸出格式',
        backToHome: '返回首頁',
        toolNumber: '工具 #009',
        copyright: 'Awesome AI Local Tools © 2024'
    },
    en: {
        title: 'AI Green Screen',
        subtitle: 'Professional chroma key removal for green, blue, or any color screen',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        uploadText: 'Click or drag and drop image here',
        uploadHint: 'Supports JPG, PNG, WebP formats',
        tabResult: 'Result',
        tabOriginal: 'Original',
        tabMask: 'Mask',
        chromaSettings: 'Chroma Key Settings',
        keyColor: 'Key Color',
        presetGreen: 'Green',
        presetBlue: 'Blue',
        presetCustom: 'Custom',
        pickColor: 'Pick',
        pickColorHint: 'Click image to pick color',
        tolerance: 'Tolerance',
        softness: 'Softness',
        spillSuppression: 'Spill Suppression',
        edgeRefinement: 'Edge Refinement',
        presets: 'Quick Presets',
        presetStudio: 'Studio',
        presetOutdoor: 'Outdoor',
        presetLowlight: 'Low Light',
        presetSharp: 'Sharp',
        bgPreview: 'Background Preview',
        bgCheckerboard: 'Transparent',
        bgWhite: 'White',
        bgBlack: 'Black',
        bgCustom: 'Custom',
        applyEffect: 'Apply Effect',
        newImage: 'New Image',
        download: 'Download',
        processing: 'Processing...',
        howItWorks: 'How It Works',
        colorAnalysis: 'Color Analysis',
        colorAnalysisDesc: 'Convert image to HSV color space for precise analysis',
        chromaKey: 'Chroma Key',
        chromaKeyDesc: 'Create transparency mask based on color and tolerance',
        edgeProcess: 'Edge Processing',
        edgeProcessDesc: 'Soften edges and suppress color spill',
        proResult: 'Pro Result',
        proResultDesc: 'Output high-quality PNG with alpha channel',
        techSpecs: 'Technical Specs',
        specMethod: 'Method',
        specMethodValue: 'HSV Chroma Key Algorithm',
        specRealtime: 'Real-time',
        specRealtimeValue: 'Yes',
        specInput: 'Input Format',
        specOutput: 'Output Format',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #009',
        copyright: 'Awesome AI Local Tools © 2024'
    }
};

// State
let currentLang = 'zh';
let originalImage = null;
let isPickingColor = false;
let currentSettings = {
    keyColor: { h: 120, s: 100, v: 100 }, // Green
    tolerance: 30,
    softness: 10,
    spillSuppression: 50,
    edgeRefinement: 2
};
let currentBgMode = 'checkerboard';
let customBgColor = '#808080';

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const editorArea = document.getElementById('editorArea');
const resultCanvas = document.getElementById('resultCanvas');
const originalCanvas = document.getElementById('originalCanvas');
const maskCanvas = document.getElementById('maskCanvas');
const processingOverlay = document.getElementById('processingOverlay');

// Sliders
const toleranceSlider = document.getElementById('toleranceSlider');
const softnessSlider = document.getElementById('softnessSlider');
const spillSlider = document.getElementById('spillSlider');
const edgeSlider = document.getElementById('edgeSlider');
const toleranceValue = document.getElementById('toleranceValue');
const softnessValue = document.getElementById('softnessValue');
const spillValue = document.getElementById('spillValue');
const edgeValue = document.getElementById('edgeValue');

// Buttons
const applyBtn = document.getElementById('applyBtn');
const resetBtn = document.getElementById('resetBtn');
const downloadBtn = document.getElementById('downloadBtn');
const pickColorBtn = document.getElementById('pickColorBtn');
const colorInput = document.getElementById('colorInput');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initLanguage();
    initUpload();
    initControls();
    initTabs();
});

// Language handling
function initLanguage() {
    const langZh = document.getElementById('lang-zh');
    const langEn = document.getElementById('lang-en');

    langZh.addEventListener('click', () => switchLanguage('zh'));
    langEn.addEventListener('click', () => switchLanguage('en'));

    applyTranslations();
}

function switchLanguage(lang) {
    currentLang = lang;
    document.getElementById('lang-zh').classList.toggle('active', lang === 'zh');
    document.getElementById('lang-en').classList.toggle('active', lang === 'en');
    applyTranslations();
}

function applyTranslations() {
    const t = translations[currentLang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) {
            el.textContent = t[key];
        }
    });
}

// Upload handling
function initUpload() {
    uploadArea.addEventListener('click', () => fileInput.click());

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    resetBtn.addEventListener('click', resetEditor);
}

function handleFile(file) {
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
        alert('請選擇 JPG、PNG 或 WebP 格式的圖片');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            originalImage = img;
            showEditor();
            drawOriginal();
            applyChromaKey();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function showEditor() {
    uploadArea.style.display = 'none';
    editorArea.style.display = 'block';
}

function resetEditor() {
    uploadArea.style.display = 'flex';
    editorArea.style.display = 'none';
    originalImage = null;
    fileInput.value = '';
    isPickingColor = false;
    document.getElementById('pickColorHint').style.display = 'none';
}

// Draw original image
function drawOriginal() {
    const ctx = originalCanvas.getContext('2d');
    originalCanvas.width = originalImage.width;
    originalCanvas.height = originalImage.height;
    ctx.drawImage(originalImage, 0, 0);

    // Initialize result and mask canvas sizes
    resultCanvas.width = originalImage.width;
    resultCanvas.height = originalImage.height;
    maskCanvas.width = originalImage.width;
    maskCanvas.height = originalImage.height;
}

// Controls
function initControls() {
    // Sliders
    toleranceSlider.addEventListener('input', (e) => {
        currentSettings.tolerance = parseInt(e.target.value);
        toleranceValue.textContent = e.target.value;
    });

    softnessSlider.addEventListener('input', (e) => {
        currentSettings.softness = parseInt(e.target.value);
        softnessValue.textContent = e.target.value;
    });

    spillSlider.addEventListener('input', (e) => {
        currentSettings.spillSuppression = parseInt(e.target.value);
        spillValue.textContent = e.target.value + '%';
    });

    edgeSlider.addEventListener('input', (e) => {
        currentSettings.edgeRefinement = parseInt(e.target.value);
        edgeValue.textContent = e.target.value + 'px';
    });

    // Color presets
    document.querySelectorAll('.color-preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.color-preset-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const preset = btn.dataset.preset;
            if (preset === 'green') {
                currentSettings.keyColor = { h: 120, s: 100, v: 100 };
                colorInput.value = '#00ff00';
            } else if (preset === 'blue') {
                currentSettings.keyColor = { h: 240, s: 100, v: 100 };
                colorInput.value = '#0000ff';
            }
        });
    });

    // Custom color input
    colorInput.addEventListener('input', (e) => {
        const hex = e.target.value;
        const rgb = hexToRgb(hex);
        currentSettings.keyColor = rgbToHsv(rgb.r, rgb.g, rgb.b);

        // Activate custom preset
        document.querySelectorAll('.color-preset-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('[data-preset="custom"]').classList.add('active');
    });

    // Color picker (eyedropper)
    pickColorBtn.addEventListener('click', () => {
        isPickingColor = !isPickingColor;
        pickColorBtn.classList.toggle('active', isPickingColor);
        document.getElementById('pickColorHint').style.display = isPickingColor ? 'block' : 'none';

        if (isPickingColor) {
            resultCanvas.style.cursor = 'crosshair';
            originalCanvas.style.cursor = 'crosshair';
        } else {
            resultCanvas.style.cursor = 'default';
            originalCanvas.style.cursor = 'default';
        }
    });

    // Click on canvas to pick color
    const handleCanvasClick = (e) => {
        if (!isPickingColor || !originalImage) return;

        const canvas = e.target;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = Math.floor((e.clientX - rect.left) * scaleX);
        const y = Math.floor((e.clientY - rect.top) * scaleY);

        const ctx = originalCanvas.getContext('2d');
        const pixel = ctx.getImageData(x, y, 1, 1).data;

        currentSettings.keyColor = rgbToHsv(pixel[0], pixel[1], pixel[2]);
        colorInput.value = rgbToHex(pixel[0], pixel[1], pixel[2]);

        // Activate custom preset
        document.querySelectorAll('.color-preset-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('[data-preset="custom"]').classList.add('active');

        // Disable picking mode
        isPickingColor = false;
        pickColorBtn.classList.remove('active');
        document.getElementById('pickColorHint').style.display = 'none';
        resultCanvas.style.cursor = 'default';
        originalCanvas.style.cursor = 'default';

        // Auto apply
        applyChromaKey();
    };

    resultCanvas.addEventListener('click', handleCanvasClick);
    originalCanvas.addEventListener('click', handleCanvasClick);

    // Quick presets
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const preset = btn.dataset.preset;
            applyQuickPreset(preset);
        });
    });

    // Background preview modes
    document.querySelectorAll('.bg-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.bg-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentBgMode = btn.dataset.bg;

            if (currentBgMode === 'custom') {
                document.getElementById('customBgColor').click();
            } else {
                updateBackgroundPreview();
            }
        });
    });

    document.getElementById('customBgColor').addEventListener('input', (e) => {
        customBgColor = e.target.value;
        currentBgMode = 'custom';
        document.querySelectorAll('.bg-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('[data-bg="custom"]').classList.add('active');
        updateBackgroundPreview();
    });

    // Apply button
    applyBtn.addEventListener('click', applyChromaKey);

    // Download button
    downloadBtn.addEventListener('click', downloadResult);
}

function applyQuickPreset(preset) {
    switch (preset) {
        case 'studio':
            currentSettings.tolerance = 35;
            currentSettings.softness = 8;
            currentSettings.spillSuppression = 60;
            currentSettings.edgeRefinement = 2;
            break;
        case 'outdoor':
            currentSettings.tolerance = 45;
            currentSettings.softness = 15;
            currentSettings.spillSuppression = 40;
            currentSettings.edgeRefinement = 3;
            break;
        case 'lowlight':
            currentSettings.tolerance = 50;
            currentSettings.softness = 20;
            currentSettings.spillSuppression = 30;
            currentSettings.edgeRefinement = 4;
            break;
        case 'sharp':
            currentSettings.tolerance = 25;
            currentSettings.softness = 3;
            currentSettings.spillSuppression = 70;
            currentSettings.edgeRefinement = 1;
            break;
    }

    // Update UI
    toleranceSlider.value = currentSettings.tolerance;
    toleranceValue.textContent = currentSettings.tolerance;
    softnessSlider.value = currentSettings.softness;
    softnessValue.textContent = currentSettings.softness;
    spillSlider.value = currentSettings.spillSuppression;
    spillValue.textContent = currentSettings.spillSuppression + '%';
    edgeSlider.value = currentSettings.edgeRefinement;
    edgeValue.textContent = currentSettings.edgeRefinement + 'px';

    // Apply
    if (originalImage) {
        applyChromaKey();
    }
}

// Tabs
function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const tab = btn.dataset.tab;
            resultCanvas.style.display = tab === 'result' ? 'block' : 'none';
            originalCanvas.style.display = tab === 'original' ? 'block' : 'none';
            maskCanvas.style.display = tab === 'mask' ? 'block' : 'none';
        });
    });
}

// Chroma Key Algorithm
function applyChromaKey() {
    if (!originalImage) return;

    processingOverlay.style.display = 'flex';

    // Use setTimeout to allow UI to update
    setTimeout(() => {
        const srcCtx = originalCanvas.getContext('2d');
        const srcData = srcCtx.getImageData(0, 0, originalCanvas.width, originalCanvas.height);

        const resultCtx = resultCanvas.getContext('2d');
        const maskCtx = maskCanvas.getContext('2d');

        const resultData = resultCtx.createImageData(originalCanvas.width, originalCanvas.height);
        const maskData = maskCtx.createImageData(originalCanvas.width, originalCanvas.height);

        const keyHue = currentSettings.keyColor.h;
        const tolerance = currentSettings.tolerance;
        const softness = currentSettings.softness;
        const spillSuppression = currentSettings.spillSuppression / 100;

        // Process each pixel
        for (let i = 0; i < srcData.data.length; i += 4) {
            const r = srcData.data[i];
            const g = srcData.data[i + 1];
            const b = srcData.data[i + 2];
            const a = srcData.data[i + 3];

            const hsv = rgbToHsv(r, g, b);

            // Calculate hue difference (circular)
            let hueDiff = Math.abs(hsv.h - keyHue);
            if (hueDiff > 180) hueDiff = 360 - hueDiff;

            // Calculate saturation factor (less saturated colors are less affected)
            const satFactor = hsv.s / 100;

            // Effective difference considering saturation
            const effectiveDiff = hueDiff / (satFactor + 0.1);

            // Calculate alpha based on tolerance and softness
            let alpha;
            if (effectiveDiff < tolerance - softness) {
                alpha = 0; // Fully transparent
            } else if (effectiveDiff > tolerance + softness) {
                alpha = 255; // Fully opaque
            } else {
                // Smooth transition
                alpha = Math.round(((effectiveDiff - (tolerance - softness)) / (softness * 2)) * 255);
            }

            // Apply spill suppression (remove color cast from edges)
            let finalR = r, finalG = g, finalB = b;
            if (alpha > 0 && alpha < 255 && spillSuppression > 0) {
                // Desaturate pixels near the key color
                const spillAmount = (1 - alpha / 255) * spillSuppression;
                const gray = (r + g + b) / 3;
                finalR = Math.round(r + (gray - r) * spillAmount);
                finalG = Math.round(g + (gray - g) * spillAmount);
                finalB = Math.round(b + (gray - b) * spillAmount);
            }

            // Set result pixel
            resultData.data[i] = finalR;
            resultData.data[i + 1] = finalG;
            resultData.data[i + 2] = finalB;
            resultData.data[i + 3] = alpha;

            // Set mask pixel (grayscale representation of alpha)
            maskData.data[i] = alpha;
            maskData.data[i + 1] = alpha;
            maskData.data[i + 2] = alpha;
            maskData.data[i + 3] = 255;
        }

        // Apply edge refinement (simple erosion/dilation)
        if (currentSettings.edgeRefinement > 0) {
            refineEdges(resultData, currentSettings.edgeRefinement);
        }

        resultCtx.putImageData(resultData, 0, 0);
        maskCtx.putImageData(maskData, 0, 0);

        updateBackgroundPreview();
        processingOverlay.style.display = 'none';
    }, 50);
}

// Edge refinement using morphological operations
function refineEdges(imageData, radius) {
    const width = Math.sqrt(imageData.data.length / 4);
    const height = imageData.data.length / 4 / width;
    const alphaChannel = new Uint8Array(width * height);

    // Extract alpha channel
    for (let i = 0; i < alphaChannel.length; i++) {
        alphaChannel[i] = imageData.data[i * 4 + 3];
    }

    // Apply blur to alpha channel for smoother edges
    const blurred = gaussianBlur(alphaChannel, width, height, radius);

    // Apply back to image data
    for (let i = 0; i < blurred.length; i++) {
        imageData.data[i * 4 + 3] = blurred[i];
    }
}

// Simple gaussian blur for alpha channel
function gaussianBlur(data, width, height, radius) {
    const result = new Uint8Array(data.length);
    const kernel = createGaussianKernel(radius);
    const kSize = radius * 2 + 1;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let sum = 0;
            let weightSum = 0;

            for (let ky = -radius; ky <= radius; ky++) {
                for (let kx = -radius; kx <= radius; kx++) {
                    const px = Math.min(Math.max(x + kx, 0), width - 1);
                    const py = Math.min(Math.max(y + ky, 0), height - 1);
                    const weight = kernel[(ky + radius) * kSize + (kx + radius)];
                    sum += data[py * width + px] * weight;
                    weightSum += weight;
                }
            }

            result[y * width + x] = Math.round(sum / weightSum);
        }
    }

    return result;
}

function createGaussianKernel(radius) {
    const size = radius * 2 + 1;
    const kernel = new Float32Array(size * size);
    const sigma = radius / 2;
    let sum = 0;

    for (let y = -radius; y <= radius; y++) {
        for (let x = -radius; x <= radius; x++) {
            const value = Math.exp(-(x * x + y * y) / (2 * sigma * sigma));
            kernel[(y + radius) * size + (x + radius)] = value;
            sum += value;
        }
    }

    // Normalize
    for (let i = 0; i < kernel.length; i++) {
        kernel[i] /= sum;
    }

    return kernel;
}

// Update background preview
function updateBackgroundPreview() {
    const previewBox = document.getElementById('previewBox');

    switch (currentBgMode) {
        case 'checkerboard':
            previewBox.style.background = `
                linear-gradient(45deg, #ccc 25%, transparent 25%),
                linear-gradient(-45deg, #ccc 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, #ccc 75%),
                linear-gradient(-45deg, transparent 75%, #ccc 75%)
            `;
            previewBox.style.backgroundSize = '20px 20px';
            previewBox.style.backgroundPosition = '0 0, 0 10px, 10px -10px, -10px 0px';
            previewBox.style.backgroundColor = '#fff';
            break;
        case 'white':
            previewBox.style.background = '#ffffff';
            previewBox.style.backgroundSize = 'auto';
            break;
        case 'black':
            previewBox.style.background = '#000000';
            previewBox.style.backgroundSize = 'auto';
            break;
        case 'custom':
            previewBox.style.background = customBgColor;
            previewBox.style.backgroundSize = 'auto';
            break;
    }
}

// Download result
function downloadResult() {
    if (!originalImage) return;

    const link = document.createElement('a');
    link.download = 'green-screen-result.png';
    link.href = resultCanvas.toDataURL('image/png');
    link.click();
}

// Color conversion utilities
function rgbToHsv(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;

    let h, s, v;
    v = max * 100;
    s = max === 0 ? 0 : (d / max) * 100;

    if (d === 0) {
        h = 0;
    } else if (max === r) {
        h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
    } else if (max === g) {
        h = ((b - r) / d + 2) * 60;
    } else {
        h = ((r - g) / d + 4) * 60;
    }

    return { h, s, v };
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}
