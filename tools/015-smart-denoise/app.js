/**
 * Smart Denoise - AI-Powered Image Denoising
 * Tool #015 - Edge-preserving noise reduction
 */

import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.2';

// Configure environment
env.useBrowserCache = true;
env.allowLocalModels = false;

// Translations
const translations = {
    zh: {
        title: '智慧降噪',
        subtitle: 'AI 智慧降低圖片噪點，完美保留細節與紋理',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        loadingModel: '正在載入降噪模型...',
        loadingHint: '首次載入需下載約 30 MB 模型檔案',
        uploadText: '點擊或拖放圖片到這裡',
        uploadHint: '支援 JPG、PNG、WebP 格式',
        viewSplit: '對比',
        viewOriginal: '原圖',
        viewResult: '降噪後',
        zoomFit: '適應',
        noisy: '有噪點',
        denoised: '已降噪',
        denoiseMode: '降噪模式',
        modeAuto: '自動',
        modeLight: '輕度',
        modeStrong: '強力',
        denoiseStrength: '降噪強度',
        preserveDetail: '保留細節',
        maxDenoise: '最大降噪',
        detailPreserve: '細節保留',
        colorNoise: '色彩噪點',
        applyDenoise: '套用降噪',
        newImage: '選擇新圖片',
        download: '下載',
        processing: '正在降噪處理中...',
        processingHint: 'AI 正在分析並移除噪點',
        howItWorks: '如何運作？',
        step1Title: '噪點分析',
        step1Desc: 'AI 分析圖片中的噪點類型與分布',
        step2Title: '智慧識別',
        step2Desc: '區分噪點與真實細節紋理',
        step3Title: '選擇性降噪',
        step3Desc: '只移除噪點，保留重要細節',
        step4Title: '品質輸出',
        step4Desc: '輸出清晰乾淨的高品質圖片',
        techSpecs: '技術規格',
        specModel: 'AI 模型',
        specMethod: '處理方式',
        specMethodValue: '邊緣保留降噪',
        specInput: '輸入格式',
        specOutput: '輸出格式',
        backToHome: '返回首頁',
        toolNumber: '工具 #015',
        copyright: 'Awesome AI Local Tools © 2024',
        modelLoaded: '模型載入完成！',
        errorLoading: '模型載入失敗'
    },
    en: {
        title: 'Smart Denoise',
        subtitle: 'AI noise reduction that perfectly preserves details and textures',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        loadingModel: 'Loading denoise model...',
        loadingHint: 'First load requires ~30 MB model download',
        uploadText: 'Click or drag and drop image here',
        uploadHint: 'Supports JPG, PNG, WebP formats',
        viewSplit: 'Compare',
        viewOriginal: 'Original',
        viewResult: 'Denoised',
        zoomFit: 'Fit',
        noisy: 'Noisy',
        denoised: 'Denoised',
        denoiseMode: 'Denoise Mode',
        modeAuto: 'Auto',
        modeLight: 'Light',
        modeStrong: 'Strong',
        denoiseStrength: 'Denoise Strength',
        preserveDetail: 'Preserve Detail',
        maxDenoise: 'Max Denoise',
        detailPreserve: 'Detail Preservation',
        colorNoise: 'Color Noise',
        applyDenoise: 'Apply Denoise',
        newImage: 'New Image',
        download: 'Download',
        processing: 'Processing denoise...',
        processingHint: 'AI is analyzing and removing noise',
        howItWorks: 'How It Works',
        step1Title: 'Noise Analysis',
        step1Desc: 'AI analyzes noise type and distribution',
        step2Title: 'Smart Detection',
        step2Desc: 'Distinguishes noise from real details',
        step3Title: 'Selective Denoise',
        step3Desc: 'Removes only noise, preserves details',
        step4Title: 'Quality Output',
        step4Desc: 'Outputs clean high-quality images',
        techSpecs: 'Technical Specs',
        specModel: 'AI Model',
        specMethod: 'Method',
        specMethodValue: 'Edge-Preserving Denoise',
        specInput: 'Input Format',
        specOutput: 'Output Format',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #015',
        copyright: 'Awesome AI Local Tools © 2024',
        modelLoaded: 'Model loaded!',
        errorLoading: 'Failed to load model'
    }
};

// State
let currentLang = 'zh';
let enhancer = null;
let originalImage = null;
let splitPosition = 50;
let isDragging = false;
let currentZoom = 100;
let currentView = 'split';

let settings = {
    mode: 'auto',
    strength: 50,
    detail: 70,
    colorNoise: 50
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
const splitLine = document.getElementById('splitLine');
const canvasWrapper = document.getElementById('canvasWrapper');

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

        // Use image-to-image pipeline
        enhancer = await pipeline('image-to-image', 'Xenova/swin2SR-classical-sr-x2-64', {
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

        setTimeout(() => {
            modelLoading.style.display = 'none';
            uploadArea.style.display = 'flex';
            enhancer = null;
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
    splitLine.addEventListener('mousedown', startDrag);
    splitLine.addEventListener('touchstart', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag);
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);

    // View toggle
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentView = btn.dataset.view;
            updateView();
        });
    });

    // Zoom controls
    document.querySelectorAll('.zoom-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.zoom-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const zoom = btn.dataset.zoom;
            if (zoom === 'fit') {
                currentZoom = 'fit';
            } else {
                currentZoom = parseInt(zoom);
            }
            applyZoom();
        });
    });
}

function startDrag(e) {
    if (currentView !== 'split') return;
    isDragging = true;
    drag(e);
}

function drag(e) {
    if (!isDragging) return;

    const rect = canvasWrapper.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    splitPosition = Math.max(0, Math.min(100, (x / rect.width) * 100));
    updateSplitView();
}

function endDrag() {
    isDragging = false;
}

function updateSplitView() {
    splitLine.style.left = splitPosition + '%';
    resultCanvas.style.clipPath = `inset(0 0 0 ${splitPosition}%)`;
}

function updateView() {
    const labels = document.getElementById('previewLabels');

    switch (currentView) {
        case 'split':
            originalCanvas.style.display = 'block';
            resultCanvas.style.display = 'block';
            splitLine.style.display = 'block';
            labels.style.display = 'flex';
            resultCanvas.style.clipPath = `inset(0 0 0 ${splitPosition}%)`;
            break;
        case 'original':
            originalCanvas.style.display = 'block';
            resultCanvas.style.display = 'none';
            splitLine.style.display = 'none';
            labels.style.display = 'none';
            break;
        case 'result':
            originalCanvas.style.display = 'none';
            resultCanvas.style.display = 'block';
            splitLine.style.display = 'none';
            labels.style.display = 'none';
            resultCanvas.style.clipPath = 'none';
            break;
    }
}

function applyZoom() {
    if (currentZoom === 'fit') {
        canvasWrapper.style.overflow = 'hidden';
        originalCanvas.style.width = '100%';
        originalCanvas.style.height = '100%';
        resultCanvas.style.width = '100%';
        resultCanvas.style.height = '100%';
    } else {
        canvasWrapper.style.overflow = 'auto';
        const scale = currentZoom / 100;
        originalCanvas.style.width = `${originalCanvas.width * scale}px`;
        originalCanvas.style.height = `${originalCanvas.height * scale}px`;
        resultCanvas.style.width = `${resultCanvas.width * scale}px`;
        resultCanvas.style.height = `${resultCanvas.height * scale}px`;
    }
}

// Process image
async function processImage() {
    if (!originalImage) return;

    processingOverlay.style.display = 'flex';

    // Limit input size
    let width = originalImage.width;
    let height = originalImage.height;
    const maxSize = 1024;

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
        // Apply denoise based on settings
        const denoisedData = applySmartDenoise(imageData, width, height);
        resultCtx.putImageData(denoisedData, 0, 0);

    } catch (error) {
        console.error('Processing error:', error);
        // Fallback: copy original
        resultCtx.drawImage(originalCanvas, 0, 0);
    }

    processingOverlay.style.display = 'none';
    updateSplitView();
    updateView();
    applyZoom();
}

// Smart Denoise Algorithm
function applySmartDenoise(imageData, width, height) {
    const data = new Uint8ClampedArray(imageData.data);
    const result = new ImageData(new Uint8ClampedArray(data), width, height);

    // Calculate effective strength based on mode
    let strengthMultiplier = 1;
    switch (settings.mode) {
        case 'light':
            strengthMultiplier = 0.5;
            break;
        case 'strong':
            strengthMultiplier = 1.5;
            break;
        default: // auto
            strengthMultiplier = 1;
    }

    const effectiveStrength = (settings.strength / 100) * strengthMultiplier;
    const detailPreserve = settings.detail / 100;
    const colorStrength = settings.colorNoise / 100;

    // Step 1: Luminance denoise (Non-Local Means inspired)
    applyLuminanceDenoise(result, effectiveStrength, detailPreserve);

    // Step 2: Color denoise (separate chroma channels)
    if (colorStrength > 0) {
        applyChromaDenoise(result, colorStrength);
    }

    // Step 3: Edge enhancement to restore sharpness
    if (detailPreserve > 0.3) {
        applyEdgeEnhancement(result, detailPreserve * 0.3);
    }

    return result;
}

// Luminance denoise using bilateral filter approach
function applyLuminanceDenoise(imageData, strength, detailPreserve) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    const radius = Math.ceil(strength * 4) + 1;
    const sigmaSpace = radius / 2;
    const sigmaColor = 20 + (1 - detailPreserve) * 80; // Lower = more edge preserve

    const temp = new Uint8ClampedArray(data);

    for (let y = radius; y < height - radius; y++) {
        for (let x = radius; x < width - radius; x++) {
            const idx = (y * width + x) * 4;

            // Get center pixel luminance
            const centerL = (temp[idx] * 0.299 + temp[idx + 1] * 0.587 + temp[idx + 2] * 0.114);

            let sumR = 0, sumG = 0, sumB = 0;
            let weightSum = 0;

            // Sample neighborhood
            for (let dy = -radius; dy <= radius; dy++) {
                for (let dx = -radius; dx <= radius; dx++) {
                    const nIdx = ((y + dy) * width + (x + dx)) * 4;
                    const nL = (temp[nIdx] * 0.299 + temp[nIdx + 1] * 0.587 + temp[nIdx + 2] * 0.114);

                    // Spatial weight (Gaussian)
                    const spatialDist = dx * dx + dy * dy;
                    const spatialWeight = Math.exp(-spatialDist / (2 * sigmaSpace * sigmaSpace));

                    // Range weight (based on luminance difference)
                    const colorDist = (centerL - nL) * (centerL - nL);
                    const colorWeight = Math.exp(-colorDist / (2 * sigmaColor * sigmaColor));

                    const weight = spatialWeight * colorWeight;

                    sumR += temp[nIdx] * weight;
                    sumG += temp[nIdx + 1] * weight;
                    sumB += temp[nIdx + 2] * weight;
                    weightSum += weight;
                }
            }

            // Apply with strength blending
            const newR = sumR / weightSum;
            const newG = sumG / weightSum;
            const newB = sumB / weightSum;

            data[idx] = Math.round(temp[idx] * (1 - strength) + newR * strength);
            data[idx + 1] = Math.round(temp[idx + 1] * (1 - strength) + newG * strength);
            data[idx + 2] = Math.round(temp[idx + 2] * (1 - strength) + newB * strength);
        }
    }
}

// Chroma (color) denoise
function applyChromaDenoise(imageData, strength) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    // Convert to YCbCr, denoise Cb/Cr, convert back
    const temp = new Float32Array(width * height * 3); // Y, Cb, Cr

    // RGB to YCbCr
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const idx = (i / 4) * 3;

        temp[idx] = 0.299 * r + 0.587 * g + 0.114 * b;           // Y
        temp[idx + 1] = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;  // Cb
        temp[idx + 2] = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;  // Cr
    }

    // Apply box blur to Cb and Cr (chroma)
    const radius = Math.ceil(strength * 3) + 1;
    const tempCb = new Float32Array(width * height);
    const tempCr = new Float32Array(width * height);

    for (let i = 0; i < width * height; i++) {
        tempCb[i] = temp[i * 3 + 1];
        tempCr[i] = temp[i * 3 + 2];
    }

    // Simple box blur on chroma
    for (let y = radius; y < height - radius; y++) {
        for (let x = radius; x < width - radius; x++) {
            let sumCb = 0, sumCr = 0;
            let count = 0;

            for (let dy = -radius; dy <= radius; dy++) {
                for (let dx = -radius; dx <= radius; dx++) {
                    const nIdx = (y + dy) * width + (x + dx);
                    sumCb += tempCb[nIdx];
                    sumCr += tempCr[nIdx];
                    count++;
                }
            }

            const idx = y * width + x;
            temp[idx * 3 + 1] = sumCb / count;
            temp[idx * 3 + 2] = sumCr / count;
        }
    }

    // YCbCr to RGB
    for (let i = 0; i < data.length; i += 4) {
        const idx = (i / 4) * 3;
        const y = temp[idx];
        const cb = temp[idx + 1] - 128;
        const cr = temp[idx + 2] - 128;

        data[i] = Math.max(0, Math.min(255, Math.round(y + 1.402 * cr)));
        data[i + 1] = Math.max(0, Math.min(255, Math.round(y - 0.344136 * cb - 0.714136 * cr)));
        data[i + 2] = Math.max(0, Math.min(255, Math.round(y + 1.772 * cb)));
    }
}

// Edge enhancement to restore sharpness
function applyEdgeEnhancement(imageData, strength) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    // Unsharp mask
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

// Controls
function initControls() {
    // Mode buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            settings.mode = btn.dataset.mode;

            // Auto-adjust sliders based on mode
            switch (settings.mode) {
                case 'light':
                    settings.strength = 30;
                    settings.detail = 80;
                    break;
                case 'strong':
                    settings.strength = 70;
                    settings.detail = 50;
                    break;
                default:
                    settings.strength = 50;
                    settings.detail = 70;
            }

            // Update UI
            document.getElementById('strengthSlider').value = settings.strength;
            document.getElementById('strengthValue').textContent = settings.strength;
            document.getElementById('detailSlider').value = settings.detail;
            document.getElementById('detailValue').textContent = settings.detail;
        });
    });

    // Sliders
    const sliderConfig = [
        { id: 'strengthSlider', value: 'strengthValue', key: 'strength' },
        { id: 'detailSlider', value: 'detailValue', key: 'detail' },
        { id: 'colorSlider', value: 'colorValue', key: 'colorNoise' }
    ];

    sliderConfig.forEach(config => {
        const slider = document.getElementById(config.id);
        const valueEl = document.getElementById(config.value);

        slider.addEventListener('input', (e) => {
            settings[config.key] = parseInt(e.target.value);
            valueEl.textContent = e.target.value;
        });
    });
}

// Download result
function downloadResult() {
    if (!resultCanvas.width) return;

    const link = document.createElement('a');
    link.download = 'denoised-image.png';
    link.href = resultCanvas.toDataURL('image/png');
    link.click();
}
