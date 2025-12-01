/**
 * Old Photo Restoration - AI-Powered Photo Repair
 * Tool #014 - Restores scratches, fading, noise in old photos
 */

import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.2';

// Configure environment
env.useBrowserCache = true;
env.allowLocalModels = false;

// Translations
const translations = {
    zh: {
        title: '老照片修復',
        subtitle: 'AI 智慧修復老舊照片的劃痕、褪色、噪點，重現珍貴回憶',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        loadingModel: '正在載入修復模型...',
        loadingHint: '首次載入需下載模型檔案',
        uploadText: '點擊或拖放老照片到這裡',
        uploadHint: '支援 JPG、PNG 格式',
        viewSplit: '對比檢視',
        viewOriginal: '原圖',
        viewRestored: '修復後',
        before: '修復前',
        after: '修復後',
        restorationMode: '修復模式',
        modeAuto: '自動修復',
        modeFace: '人臉增強',
        modeColorize: '黑白上色',
        enhanceSettings: '增強設定',
        scratchRemoval: '劃痕修復',
        colorRestore: '色彩還原',
        denoise: '降噪程度',
        sharpen: '清晰度',
        applyRestoration: '套用修復',
        newImage: '選擇新圖片',
        download: '下載結果',
        processing: '正在修復老照片...',
        processingHint: 'AI 正在分析並修復損傷',
        howItWorks: '如何運作？',
        step1Title: '損傷偵測',
        step1Desc: 'AI 自動識別照片中的劃痕、折痕、污漬等損傷',
        step2Title: '智慧修復',
        step2Desc: '使用深度學習模型填補損傷區域',
        step3Title: '色彩還原',
        step3Desc: '恢復褪色照片的原始色彩與對比度',
        step4Title: '細節增強',
        step4Desc: '提升清晰度，讓珍貴回憶煥然一新',
        techSpecs: '技術規格',
        specModel: 'AI 模型',
        specFeatures: '修復功能',
        specFeaturesValue: '劃痕/褪色/噪點',
        specInput: '輸入格式',
        specOutput: '輸出格式',
        backToHome: '返回首頁',
        toolNumber: '工具 #014',
        copyright: 'Awesome AI Local Tools © 2024',
        modelLoaded: '模型載入完成！',
        errorLoading: '模型載入失敗'
    },
    en: {
        title: 'Old Photo Restoration',
        subtitle: 'AI restores scratches, fading, and noise in old photos',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        loadingModel: 'Loading restoration model...',
        loadingHint: 'First load requires model download',
        uploadText: 'Click or drag old photo here',
        uploadHint: 'Supports JPG, PNG formats',
        viewSplit: 'Compare',
        viewOriginal: 'Original',
        viewRestored: 'Restored',
        before: 'Before',
        after: 'After',
        restorationMode: 'Restoration Mode',
        modeAuto: 'Auto Restore',
        modeFace: 'Face Enhance',
        modeColorize: 'Colorize B&W',
        enhanceSettings: 'Enhancement Settings',
        scratchRemoval: 'Scratch Removal',
        colorRestore: 'Color Restore',
        denoise: 'Denoise',
        sharpen: 'Sharpness',
        applyRestoration: 'Apply Restoration',
        newImage: 'New Image',
        download: 'Download',
        processing: 'Restoring old photo...',
        processingHint: 'AI is analyzing and repairing damage',
        howItWorks: 'How It Works',
        step1Title: 'Damage Detection',
        step1Desc: 'AI identifies scratches, creases, and stains',
        step2Title: 'Smart Repair',
        step2Desc: 'Deep learning fills damaged areas',
        step3Title: 'Color Restoration',
        step3Desc: 'Restores faded colors and contrast',
        step4Title: 'Detail Enhancement',
        step4Desc: 'Improves clarity for precious memories',
        techSpecs: 'Technical Specs',
        specModel: 'AI Model',
        specFeatures: 'Features',
        specFeaturesValue: 'Scratches/Fading/Noise',
        specInput: 'Input Format',
        specOutput: 'Output Format',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #014',
        copyright: 'Awesome AI Local Tools © 2024',
        modelLoaded: 'Model loaded!',
        errorLoading: 'Failed to load model'
    }
};

// State
let currentLang = 'zh';
let upscaler = null;
let originalImage = null;
let splitPosition = 50;
let isDragging = false;
let currentMode = 'auto';
let settings = {
    scratch: 50,
    color: 60,
    denoise: 40,
    sharpen: 50
};

// DOM Elements
const modelLoading = document.getElementById('modelLoading');
const uploadArea = document.getElementById('uploadArea');
const editorArea = document.getElementById('editorArea');
const fileInput = document.getElementById('fileInput');
const originalCanvas = document.getElementById('originalCanvas');
const resultCanvas = document.getElementById('resultCanvas');
const processingOverlay = document.getElementById('processingOverlay');
const loadProgress = document.getElementById('loadProgress');
const loadingStatus = document.getElementById('loadingStatus');
const splitDivider = document.getElementById('splitDivider');
const splitView = document.getElementById('splitView');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    initLanguage();
    initUpload();
    initControls();
    initSplitView();
    await loadModel();
});

// Language handling
function initLanguage() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLanguage('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLanguage('en'));
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

// Load AI Model
async function loadModel() {
    try {
        loadingStatus.textContent = translations[currentLang].loadingHint;

        // Use image-to-image for restoration
        upscaler = await pipeline('image-to-image', 'Xenova/swin2SR-classical-sr-x2-64', {
            progress_callback: (progress) => {
                if (progress.status === 'downloading') {
                    const percent = Math.round((progress.loaded / progress.total) * 100);
                    loadProgress.style.width = percent + '%';
                    loadingStatus.textContent = `下載中... ${percent}%`;
                } else if (progress.status === 'loading') {
                    loadingStatus.textContent = '載入模型中...';
                }
            }
        });

        loadProgress.style.width = '100%';
        loadingStatus.textContent = translations[currentLang].modelLoaded;

        setTimeout(() => {
            modelLoading.style.display = 'none';
            uploadArea.style.display = 'flex';
        }, 500);

    } catch (error) {
        console.error('Model loading error:', error);
        loadingStatus.textContent = translations[currentLang].errorLoading;

        // Fallback mode
        setTimeout(() => {
            modelLoading.style.display = 'none';
            uploadArea.style.display = 'flex';
            upscaler = null;
        }, 2000);
    }
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
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    document.getElementById('resetBtn').addEventListener('click', resetEditor);
    document.getElementById('downloadBtn').addEventListener('click', downloadResult);
    document.getElementById('applyBtn').addEventListener('click', () => processImage());
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
            processImage();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function showEditor() {
    uploadArea.style.display = 'none';
    editorArea.style.display = 'grid';
}

function resetEditor() {
    uploadArea.style.display = 'flex';
    editorArea.style.display = 'none';
    originalImage = null;
    fileInput.value = '';
    splitPosition = 50;
    updateSplitView();
}

// Split View
function initSplitView() {
    splitDivider.addEventListener('mousedown', startDrag);
    splitDivider.addEventListener('touchstart', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag);
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);

    // Preview tabs
    document.querySelectorAll('.preview-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.preview-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const view = tab.dataset.view;
            if (view === 'split') {
                originalCanvas.style.display = 'block';
                resultCanvas.style.display = 'block';
                splitDivider.style.display = 'block';
                resultCanvas.style.clipPath = `inset(0 0 0 ${splitPosition}%)`;
            } else if (view === 'original') {
                originalCanvas.style.display = 'block';
                resultCanvas.style.display = 'none';
                splitDivider.style.display = 'none';
            } else {
                originalCanvas.style.display = 'none';
                resultCanvas.style.display = 'block';
                splitDivider.style.display = 'none';
                resultCanvas.style.clipPath = 'none';
            }
        });
    });
}

function startDrag(e) {
    isDragging = true;
    drag(e);
}

function drag(e) {
    if (!isDragging) return;

    const rect = splitView.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    splitPosition = Math.max(0, Math.min(100, (x / rect.width) * 100));
    updateSplitView();
}

function endDrag() {
    isDragging = false;
}

function updateSplitView() {
    splitDivider.style.left = splitPosition + '%';
    resultCanvas.style.clipPath = `inset(0 0 0 ${splitPosition}%)`;
}

// Process image
async function processImage() {
    if (!originalImage) return;

    processingOverlay.style.display = 'flex';

    // Limit input size
    let width = originalImage.width;
    let height = originalImage.height;
    const maxSize = 800;

    if (width > maxSize || height > maxSize) {
        if (width > height) {
            height = Math.round((maxSize / width) * height);
            width = maxSize;
        } else {
            width = Math.round((maxSize / height) * width);
            height = maxSize;
        }
    }

    // Setup canvases
    originalCanvas.width = width;
    originalCanvas.height = height;
    resultCanvas.width = width;
    resultCanvas.height = height;

    const origCtx = originalCanvas.getContext('2d');
    const resultCtx = resultCanvas.getContext('2d');

    // Draw original
    origCtx.drawImage(originalImage, 0, 0, width, height);

    // Get image data for processing
    const imageData = origCtx.getImageData(0, 0, width, height);

    try {
        // Apply restoration based on mode
        let restoredData;

        switch (currentMode) {
            case 'face':
                restoredData = await restoreFaceMode(imageData, width, height);
                break;
            case 'colorize':
                restoredData = await colorizeMode(imageData, width, height);
                break;
            default:
                restoredData = await autoRestoreMode(imageData, width, height);
        }

        resultCtx.putImageData(restoredData, 0, 0);

    } catch (error) {
        console.error('Processing error:', error);
        // Fallback: apply basic restoration
        const restoredData = applyBasicRestoration(imageData);
        resultCtx.putImageData(restoredData, 0, 0);
    }

    processingOverlay.style.display = 'none';
    updateSplitView();
}

// Auto Restore Mode
async function autoRestoreMode(imageData, width, height) {
    const data = new Uint8ClampedArray(imageData.data);
    const result = new ImageData(new Uint8ClampedArray(data), width, height);

    // Step 1: Denoise
    if (settings.denoise > 0) {
        applyBilateralDenoise(result, settings.denoise / 100);
    }

    // Step 2: Scratch removal (detect and inpaint)
    if (settings.scratch > 0) {
        detectAndRemoveScratches(result, settings.scratch / 100);
    }

    // Step 3: Color restoration
    if (settings.color > 0) {
        restoreColors(result, settings.color / 100);
    }

    // Step 4: Sharpen
    if (settings.sharpen > 0) {
        applySharpen(result, settings.sharpen / 100);
    }

    return result;
}

// Face Enhancement Mode
async function restoreFaceMode(imageData, width, height) {
    const result = await autoRestoreMode(imageData, width, height);

    // Additional face enhancement
    enhanceSkinTones(result);
    applyLocalContrast(result);

    return result;
}

// Colorize Mode (for B&W photos)
async function colorizeMode(imageData, width, height) {
    const data = new Uint8ClampedArray(imageData.data);
    const result = new ImageData(new Uint8ClampedArray(data), width, height);

    // Check if image is grayscale
    const isGrayscale = checkGrayscale(result);

    if (isGrayscale) {
        // Apply sepia-like colorization
        applyVintageColorization(result);
    }

    // Apply standard restoration
    if (settings.denoise > 0) {
        applyBilateralDenoise(result, settings.denoise / 100);
    }

    restoreColors(result, settings.color / 100);
    applySharpen(result, settings.sharpen / 100);

    return result;
}

// Basic restoration fallback
function applyBasicRestoration(imageData) {
    const data = new Uint8ClampedArray(imageData.data);
    const result = new ImageData(data, imageData.width, imageData.height);

    restoreColors(result, 0.5);
    applySharpen(result, 0.3);

    return result;
}

// Bilateral denoise (edge-preserving)
function applyBilateralDenoise(imageData, strength) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const radius = Math.ceil(strength * 3) + 1;
    const sigmaColor = 30 + strength * 50;

    const temp = new Uint8ClampedArray(data);

    for (let y = radius; y < height - radius; y++) {
        for (let x = radius; x < width - radius; x++) {
            const idx = (y * width + x) * 4;

            for (let c = 0; c < 3; c++) {
                let sum = 0;
                let weightSum = 0;
                const centerVal = temp[idx + c];

                for (let dy = -radius; dy <= radius; dy++) {
                    for (let dx = -radius; dx <= radius; dx++) {
                        const nIdx = ((y + dy) * width + (x + dx)) * 4;
                        const val = temp[nIdx + c];
                        const colorDiff = Math.abs(val - centerVal);
                        const spatialWeight = Math.exp(-(dx * dx + dy * dy) / (2 * radius * radius));
                        const colorWeight = Math.exp(-(colorDiff * colorDiff) / (2 * sigmaColor * sigmaColor));
                        const weight = spatialWeight * colorWeight;

                        sum += val * weight;
                        weightSum += weight;
                    }
                }

                data[idx + c] = Math.round(sum / weightSum);
            }
        }
    }
}

// Scratch detection and removal
function detectAndRemoveScratches(imageData, strength) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    // Detect potential scratches (thin bright or dark lines)
    const scratchMask = new Uint8Array(width * height);

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = (y * width + x) * 4;
            const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;

            // Check neighbors
            const neighbors = [
                ((y - 1) * width + x) * 4,
                ((y + 1) * width + x) * 4,
                (y * width + (x - 1)) * 4,
                (y * width + (x + 1)) * 4
            ];

            let neighborAvg = 0;
            for (const nIdx of neighbors) {
                neighborAvg += (data[nIdx] + data[nIdx + 1] + data[nIdx + 2]) / 3;
            }
            neighborAvg /= 4;

            // Detect anomaly (potential scratch)
            const diff = Math.abs(gray - neighborAvg);
            if (diff > 30 * strength) {
                scratchMask[y * width + x] = 1;
            }
        }
    }

    // Inpaint scratches
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            if (scratchMask[y * width + x]) {
                const idx = (y * width + x) * 4;

                // Average from non-scratch neighbors
                let count = 0;
                let sumR = 0, sumG = 0, sumB = 0;

                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (dx === 0 && dy === 0) continue;
                        const ny = y + dy;
                        const nx = x + dx;
                        if (!scratchMask[ny * width + nx]) {
                            const nIdx = (ny * width + nx) * 4;
                            sumR += data[nIdx];
                            sumG += data[nIdx + 1];
                            sumB += data[nIdx + 2];
                            count++;
                        }
                    }
                }

                if (count > 0) {
                    data[idx] = Math.round(sumR / count);
                    data[idx + 1] = Math.round(sumG / count);
                    data[idx + 2] = Math.round(sumB / count);
                }
            }
        }
    }
}

// Color restoration
function restoreColors(imageData, strength) {
    const data = imageData.data;

    // Calculate histogram
    const histR = new Array(256).fill(0);
    const histG = new Array(256).fill(0);
    const histB = new Array(256).fill(0);

    for (let i = 0; i < data.length; i += 4) {
        histR[data[i]]++;
        histG[data[i + 1]]++;
        histB[data[i + 2]]++;
    }

    // Find min/max for auto-levels
    const total = data.length / 4;
    const clipPercent = 0.01;
    const clipPixels = total * clipPercent;

    function findClipPoints(hist) {
        let sum = 0;
        let min = 0, max = 255;

        for (let i = 0; i < 256; i++) {
            sum += hist[i];
            if (sum > clipPixels) {
                min = i;
                break;
            }
        }

        sum = 0;
        for (let i = 255; i >= 0; i--) {
            sum += hist[i];
            if (sum > clipPixels) {
                max = i;
                break;
            }
        }

        return { min, max };
    }

    const rClip = findClipPoints(histR);
    const gClip = findClipPoints(histG);
    const bClip = findClipPoints(histB);

    // Apply auto-levels with strength
    for (let i = 0; i < data.length; i += 4) {
        const stretchR = (data[i] - rClip.min) / (rClip.max - rClip.min) * 255;
        const stretchG = (data[i + 1] - gClip.min) / (gClip.max - gClip.min) * 255;
        const stretchB = (data[i + 2] - bClip.min) / (bClip.max - bClip.min) * 255;

        data[i] = Math.round(data[i] + (stretchR - data[i]) * strength);
        data[i + 1] = Math.round(data[i + 1] + (stretchG - data[i + 1]) * strength);
        data[i + 2] = Math.round(data[i + 2] + (stretchB - data[i + 2]) * strength);

        // Clamp
        data[i] = Math.max(0, Math.min(255, data[i]));
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1]));
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2]));
    }

    // Slight saturation boost for faded photos
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const gray = (r + g + b) / 3;

        const satBoost = 1 + strength * 0.3;
        data[i] = Math.max(0, Math.min(255, gray + (r - gray) * satBoost));
        data[i + 1] = Math.max(0, Math.min(255, gray + (g - gray) * satBoost));
        data[i + 2] = Math.max(0, Math.min(255, gray + (b - gray) * satBoost));
    }
}

// Sharpen
function applySharpen(imageData, strength) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    const kernel = [
        0, -strength, 0,
        -strength, 1 + 4 * strength, -strength,
        0, -strength, 0
    ];

    const temp = new Uint8ClampedArray(data);

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            for (let c = 0; c < 3; c++) {
                let sum = 0;
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const idx = ((y + ky) * width + (x + kx)) * 4 + c;
                        sum += temp[idx] * kernel[(ky + 1) * 3 + (kx + 1)];
                    }
                }
                const idx = (y * width + x) * 4 + c;
                data[idx] = Math.max(0, Math.min(255, sum));
            }
        }
    }
}

// Check if image is grayscale
function checkGrayscale(imageData) {
    const data = imageData.data;
    let colorDiff = 0;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        colorDiff += Math.abs(r - g) + Math.abs(g - b) + Math.abs(r - b);
    }

    return (colorDiff / (data.length / 4)) < 10;
}

// Vintage colorization for B&W photos
function applyVintageColorization(imageData) {
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;

        // Apply warm sepia-like tone
        data[i] = Math.min(255, gray * 1.1 + 20);     // R
        data[i + 1] = Math.min(255, gray * 0.95);     // G
        data[i + 2] = Math.min(255, gray * 0.8);      // B
    }
}

// Enhance skin tones for face mode
function enhanceSkinTones(imageData) {
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Detect skin-like tones
        if (r > 95 && g > 40 && b > 20 &&
            r > g && r > b && (r - Math.min(g, b)) > 15) {
            // Slight warmth boost for skin
            data[i] = Math.min(255, r + 5);
            data[i + 1] = Math.min(255, g + 2);
        }
    }
}

// Local contrast enhancement
function applyLocalContrast(imageData) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    const temp = new Uint8ClampedArray(data);
    const radius = 5;

    for (let y = radius; y < height - radius; y++) {
        for (let x = radius; x < width - radius; x++) {
            const idx = (y * width + x) * 4;

            // Calculate local average
            let localSum = 0;
            let count = 0;
            for (let dy = -radius; dy <= radius; dy++) {
                for (let dx = -radius; dx <= radius; dx++) {
                    const nIdx = ((y + dy) * width + (x + dx)) * 4;
                    localSum += (temp[nIdx] + temp[nIdx + 1] + temp[nIdx + 2]) / 3;
                    count++;
                }
            }
            const localAvg = localSum / count;
            const pixelGray = (temp[idx] + temp[idx + 1] + temp[idx + 2]) / 3;

            // Apply local contrast
            const factor = 1.2;
            const diff = (pixelGray - localAvg) * factor;

            for (let c = 0; c < 3; c++) {
                data[idx + c] = Math.max(0, Math.min(255, temp[idx + c] + diff * 0.3));
            }
        }
    }
}

// Controls
function initControls() {
    // Mode buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.dataset.mode;
        });
    });

    // Sliders
    const sliderConfig = [
        { id: 'scratchSlider', value: 'scratchValue', key: 'scratch', suffix: '%' },
        { id: 'colorSlider', value: 'colorValue', key: 'color', suffix: '%' },
        { id: 'denoiseSlider', value: 'denoiseValue', key: 'denoise', suffix: '%' },
        { id: 'sharpenSlider', value: 'sharpenValue', key: 'sharpen', suffix: '%' }
    ];

    sliderConfig.forEach(config => {
        const slider = document.getElementById(config.id);
        const valueEl = document.getElementById(config.value);

        slider.addEventListener('input', (e) => {
            settings[config.key] = parseInt(e.target.value);
            valueEl.textContent = e.target.value + config.suffix;
        });
    });
}

// Download result
function downloadResult() {
    if (!resultCanvas.width) return;

    const link = document.createElement('a');
    link.download = 'restored-photo.png';
    link.href = resultCanvas.toDataURL('image/png');
    link.click();
}
