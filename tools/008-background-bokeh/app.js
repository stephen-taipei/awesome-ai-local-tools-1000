/**
 * AI Background Bokeh
 * Tool #008 - Awesome AI Local Tools
 *
 * Create depth-of-field bokeh effects using MiDaS depth estimation
 * 100% local processing with Transformers.js
 */

import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.2/dist/transformers.min.js';

// Configure environment
env.useBrowserCache = true;
env.allowLocalModels = false;

// Translations
const translations = {
    'zh-TW': {
        title: 'AI 背景虛化景深',
        subtitle: '模擬專業相機景深效果，可調整焦點與虛化程度',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        modelNotLoaded: '模型未載入',
        modelLoading: '正在載入模型...',
        modelReady: '模型已就緒',
        loadModel: '載入模型',
        downloading: '正在下載模型...',
        downloadNote: '首次載入約 40MB，之後會快取',
        uploadText: '點擊或拖放圖片到這裡',
        uploadHint: '支援 JPG、PNG、WebP 格式',
        tabResult: '效果預覽',
        tabDepth: '深度圖',
        tabOriginal: '原圖',
        clickToFocus: '點擊圖片選擇對焦點',
        bokehSettings: '虛化設定',
        blurAmount: '虛化強度',
        focusRange: '對焦範圍',
        gradientSmooth: '漸變平滑度',
        bokehShape: '光斑形狀',
        focusMode: '對焦模式',
        modePoint: '點擊對焦',
        modeForeground: '前景對焦',
        modeBackground: '背景對焦',
        presets: '快速預設',
        presetPortrait: '人像',
        presetMacro: '微距',
        presetCinematic: '電影',
        presetTiltshift: '移軸',
        applyEffect: '套用效果',
        newImage: '選擇新圖片',
        download: '下載結果',
        processing: '正在處理中...',
        estimatingDepth: '正在估計深度...',
        applyingBokeh: '正在套用虛化效果...',
        tryExamples: '試試範例圖片',
        examplePortrait: '人像',
        exampleNature: '自然',
        exampleStreet: '街景',
        exampleFlower: '花卉',
        howItWorks: '如何運作？',
        depthEstimation: '深度估計',
        depthEstimationDesc: 'AI 分析圖片中每個像素的深度距離',
        focusSelect: '焦點選擇',
        focusSelectDesc: '點擊選擇對焦位置，保持清晰區域',
        bokehEffect: '散景效果',
        bokehEffectDesc: '根據深度差異套用漸變虛化效果',
        proResult: '專業成果',
        proResultDesc: '模擬大光圈相機的淺景深效果',
        techSpecs: '技術規格',
        specModel: 'AI 模型',
        specSize: '模型大小',
        specInput: '輸入尺寸',
        specOutput: '輸出格式',
        specRuntime: '執行環境',
        backToHome: '返回首頁',
        toolNumber: '工具 #008',
        copyright: 'Awesome AI Local Tools © 2024'
    },
    'en': {
        title: 'AI Background Bokeh',
        subtitle: 'Create professional depth-of-field effects',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        modelNotLoaded: 'Model not loaded',
        modelLoading: 'Loading model...',
        modelReady: 'Model ready',
        loadModel: 'Load Model',
        downloading: 'Downloading model...',
        downloadNote: 'First load ~40MB, cached afterwards',
        uploadText: 'Click or drag image here',
        uploadHint: 'Supports JPG, PNG, WebP formats',
        tabResult: 'Result',
        tabDepth: 'Depth Map',
        tabOriginal: 'Original',
        clickToFocus: 'Click on image to set focus point',
        bokehSettings: 'Bokeh Settings',
        blurAmount: 'Blur Amount',
        focusRange: 'Focus Range',
        gradientSmooth: 'Gradient Smoothness',
        bokehShape: 'Bokeh Shape',
        focusMode: 'Focus Mode',
        modePoint: 'Click Focus',
        modeForeground: 'Foreground',
        modeBackground: 'Background',
        presets: 'Quick Presets',
        presetPortrait: 'Portrait',
        presetMacro: 'Macro',
        presetCinematic: 'Cinematic',
        presetTiltshift: 'Tilt-shift',
        applyEffect: 'Apply Effect',
        newImage: 'New Image',
        download: 'Download',
        processing: 'Processing...',
        estimatingDepth: 'Estimating depth...',
        applyingBokeh: 'Applying bokeh effect...',
        tryExamples: 'Try Example Images',
        examplePortrait: 'Portrait',
        exampleNature: 'Nature',
        exampleStreet: 'Street',
        exampleFlower: 'Flower',
        howItWorks: 'How It Works?',
        depthEstimation: 'Depth Estimation',
        depthEstimationDesc: 'AI analyzes depth distance of each pixel',
        focusSelect: 'Focus Selection',
        focusSelectDesc: 'Click to select focus point and keep area sharp',
        bokehEffect: 'Bokeh Effect',
        bokehEffectDesc: 'Apply gradient blur based on depth difference',
        proResult: 'Professional Result',
        proResultDesc: 'Simulate shallow depth-of-field like a large aperture camera',
        techSpecs: 'Technical Specs',
        specModel: 'AI Model',
        specSize: 'Model Size',
        specInput: 'Input Size',
        specOutput: 'Output Format',
        specRuntime: 'Runtime',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #008',
        copyright: 'Awesome AI Local Tools © 2024'
    }
};

// State
let currentLang = 'zh-TW';
let depthEstimator = null;
let isModelLoading = false;
let originalImage = null;
let depthMap = null;
let focusPoint = { x: 0.5, y: 0.5 };
let focusDepth = 0.5;
let blurAmount = 15;
let focusRange = 20;
let gradientSmooth = 50;
let bokehShape = 'circle';
let focusMode = 'point';

// DOM Elements
const langZhBtn = document.getElementById('lang-zh');
const langEnBtn = document.getElementById('lang-en');
const statusIndicator = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');
const loadModelBtn = document.getElementById('loadModelBtn');
const progressContainer = document.getElementById('progressContainer');
const progressText = document.getElementById('progressText');
const progressPercent = document.getElementById('progressPercent');
const progressFill = document.getElementById('progressFill');
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const editorArea = document.getElementById('editorArea');
const resultCanvas = document.getElementById('resultCanvas');
const depthCanvas = document.getElementById('depthCanvas');
const originalCanvas = document.getElementById('originalCanvas');
const previewBox = document.getElementById('previewBox');
const focusIndicator = document.getElementById('focusIndicator');
const processingOverlay = document.getElementById('processingOverlay');
const processingText = document.getElementById('processingText');
const previewHint = document.getElementById('previewHint');
const examplesSection = document.getElementById('examplesSection');
const blurSlider = document.getElementById('blurSlider');
const blurValue = document.getElementById('blurValue');
const focusRangeSlider = document.getElementById('focusRangeSlider');
const focusRangeValue = document.getElementById('focusRangeValue');
const gradientSlider = document.getElementById('gradientSlider');
const gradientValue = document.getElementById('gradientValue');
const applyBtn = document.getElementById('applyBtn');
const resetBtn = document.getElementById('resetBtn');
const downloadBtn = document.getElementById('downloadBtn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initLanguage();
    initEventListeners();
});

function initLanguage() {
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && translations[savedLang]) {
        currentLang = savedLang;
    }
    updateLanguage();
}

function updateLanguage() {
    const t = translations[currentLang];

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) {
            el.textContent = t[key];
        }
    });

    if (currentLang === 'zh-TW') {
        langZhBtn.classList.add('active');
        langEnBtn.classList.remove('active');
    } else {
        langEnBtn.classList.add('active');
        langZhBtn.classList.remove('active');
    }

    localStorage.setItem('preferredLanguage', currentLang);
}

function initEventListeners() {
    // Language switcher
    langZhBtn.addEventListener('click', () => {
        currentLang = 'zh-TW';
        updateLanguage();
    });

    langEnBtn.addEventListener('click', () => {
        currentLang = 'en';
        updateLanguage();
    });

    // Model loading
    loadModelBtn.addEventListener('click', loadModel);

    // File upload
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    fileInput.addEventListener('change', handleFileSelect);

    // Preview tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            showTab(btn.dataset.tab);
        });
    });

    // Focus point click
    previewBox.addEventListener('click', handleFocusClick);

    // Controls
    blurSlider.addEventListener('input', (e) => {
        blurAmount = parseInt(e.target.value);
        blurValue.textContent = `${blurAmount}px`;
    });

    focusRangeSlider.addEventListener('input', (e) => {
        focusRange = parseInt(e.target.value);
        focusRangeValue.textContent = `${focusRange}%`;
    });

    gradientSlider.addEventListener('input', (e) => {
        gradientSmooth = parseInt(e.target.value);
        gradientValue.textContent = `${gradientSmooth}%`;
    });

    // Shape buttons
    document.querySelectorAll('.shape-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.shape-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            bokehShape = btn.dataset.shape;
        });
    });

    // Mode buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            focusMode = btn.dataset.mode;
            updateFocusMode();
        });
    });

    // Preset buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => applyPreset(btn.dataset.preset));
    });

    // Action buttons
    applyBtn.addEventListener('click', applyBokehEffect);
    resetBtn.addEventListener('click', resetToUpload);
    downloadBtn.addEventListener('click', downloadResult);

    // Example buttons
    document.querySelectorAll('.example-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const url = btn.getAttribute('data-url');
            if (url) {
                loadExampleImage(url);
            }
        });
    });
}

async function loadModel() {
    if (isModelLoading || depthEstimator) return;

    isModelLoading = true;
    const t = translations[currentLang];

    loadModelBtn.disabled = true;
    loadModelBtn.style.display = 'none';
    statusIndicator.className = 'status-indicator loading';
    statusText.textContent = t.modelLoading;
    progressContainer.style.display = 'block';

    try {
        depthEstimator = await pipeline('depth-estimation', 'Xenova/depth-anything-small-hf', {
            progress_callback: (progress) => {
                if (progress.status === 'downloading' || progress.status === 'progress') {
                    const percent = progress.progress ? Math.round(progress.progress) : 0;
                    progressFill.style.width = `${percent}%`;
                    progressPercent.textContent = `${percent}%`;
                    progressText.textContent = progress.file ?
                        `${t.downloading} (${progress.file})` : t.downloading;
                }
            }
        });

        statusIndicator.className = 'status-indicator ready';
        statusText.textContent = t.modelReady;
        progressContainer.style.display = 'none';
        uploadArea.style.display = 'block';
        examplesSection.style.display = 'block';

    } catch (error) {
        console.error('Error loading model:', error);
        statusIndicator.className = 'status-indicator';
        statusText.textContent = `Error: ${error.message}`;
        loadModelBtn.disabled = false;
        loadModelBtn.style.display = 'inline-flex';
        progressContainer.style.display = 'none';
    }

    isModelLoading = false;
}

function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

async function processFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        loadImage(e.target.result);
    };
    reader.readAsDataURL(file);
}

async function loadExampleImage(url) {
    if (!depthEstimator) {
        await loadModel();
    }
    loadImage(url);
}

async function loadImage(imageSource) {
    const t = translations[currentLang];

    uploadArea.style.display = 'none';
    examplesSection.style.display = 'none';
    editorArea.style.display = 'block';
    processingOverlay.style.display = 'flex';
    processingText.textContent = t.estimatingDepth;

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = async () => {
        originalImage = img;

        // Set canvas sizes
        const maxSize = 800;
        let width = img.width;
        let height = img.height;

        if (width > maxSize || height > maxSize) {
            const ratio = Math.min(maxSize / width, maxSize / height);
            width *= ratio;
            height *= ratio;
        }

        resultCanvas.width = width;
        resultCanvas.height = height;
        depthCanvas.width = width;
        depthCanvas.height = height;
        originalCanvas.width = width;
        originalCanvas.height = height;

        // Draw original
        const origCtx = originalCanvas.getContext('2d');
        origCtx.drawImage(img, 0, 0, width, height);

        // Copy to result initially
        const resultCtx = resultCanvas.getContext('2d');
        resultCtx.drawImage(img, 0, 0, width, height);

        try {
            // Estimate depth
            const result = await depthEstimator(imageSource);
            depthMap = result.depth;

            // Draw depth map
            renderDepthMap();

            // Set initial focus based on mode
            updateFocusMode();

            processingOverlay.style.display = 'none';
            focusIndicator.style.display = 'block';
            updateFocusIndicator();

        } catch (error) {
            console.error('Depth estimation error:', error);
            processingOverlay.style.display = 'none';
            alert('Error estimating depth: ' + error.message);
        }
    };

    img.onerror = () => {
        processingOverlay.style.display = 'none';
        alert('Failed to load image');
    };

    img.src = imageSource;
}

function renderDepthMap() {
    if (!depthMap) return;

    const ctx = depthCanvas.getContext('2d');
    const width = depthCanvas.width;
    const height = depthCanvas.height;

    // Create image from depth tensor
    const depthData = depthMap.data;
    const depthWidth = depthMap.width;
    const depthHeight = depthMap.height;

    const imageData = ctx.createImageData(width, height);

    // Find min/max for normalization
    let min = Infinity, max = -Infinity;
    for (let i = 0; i < depthData.length; i++) {
        if (depthData[i] < min) min = depthData[i];
        if (depthData[i] > max) max = depthData[i];
    }

    // Render depth with color gradient
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const sx = Math.floor((x / width) * depthWidth);
            const sy = Math.floor((y / height) * depthHeight);
            const si = sy * depthWidth + sx;

            const depth = (depthData[si] - min) / (max - min);
            const i = (y * width + x) * 4;

            // Color gradient: near (warm) to far (cool)
            const r = Math.round(255 * (1 - depth));
            const g = Math.round(100 + 100 * depth);
            const b = Math.round(255 * depth);

            imageData.data[i] = r;
            imageData.data[i + 1] = g;
            imageData.data[i + 2] = b;
            imageData.data[i + 3] = 255;
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

function handleFocusClick(e) {
    if (!depthMap || focusMode !== 'point') return;

    const rect = previewBox.getBoundingClientRect();
    const canvas = document.querySelector('.preview-box canvas:not([style*="display: none"])');
    if (!canvas) return;

    const canvasRect = canvas.getBoundingClientRect();

    focusPoint.x = (e.clientX - canvasRect.left) / canvasRect.width;
    focusPoint.y = (e.clientY - canvasRect.top) / canvasRect.height;

    // Get depth at focus point
    const depthWidth = depthMap.width;
    const depthHeight = depthMap.height;
    const dx = Math.floor(focusPoint.x * depthWidth);
    const dy = Math.floor(focusPoint.y * depthHeight);
    const depthIndex = dy * depthWidth + dx;

    // Normalize depth
    const depthData = depthMap.data;
    let min = Infinity, max = -Infinity;
    for (let i = 0; i < depthData.length; i++) {
        if (depthData[i] < min) min = depthData[i];
        if (depthData[i] > max) max = depthData[i];
    }
    focusDepth = (depthData[depthIndex] - min) / (max - min);

    updateFocusIndicator();
}

function updateFocusIndicator() {
    const canvas = resultCanvas;
    const rect = canvas.getBoundingClientRect();
    const boxRect = previewBox.getBoundingClientRect();

    const x = rect.left - boxRect.left + focusPoint.x * rect.width;
    const y = rect.top - boxRect.top + focusPoint.y * rect.height;

    focusIndicator.style.left = `${x}px`;
    focusIndicator.style.top = `${y}px`;
}

function updateFocusMode() {
    if (!depthMap) return;

    const depthData = depthMap.data;
    let min = Infinity, max = -Infinity;
    for (let i = 0; i < depthData.length; i++) {
        if (depthData[i] < min) min = depthData[i];
        if (depthData[i] > max) max = depthData[i];
    }

    switch (focusMode) {
        case 'foreground':
            focusDepth = 0.2; // Near
            focusPoint = { x: 0.5, y: 0.5 };
            break;
        case 'background':
            focusDepth = 0.8; // Far
            focusPoint = { x: 0.5, y: 0.5 };
            break;
        case 'point':
        default:
            // Keep current focus point
            break;
    }

    focusIndicator.style.display = focusMode === 'point' ? 'block' : 'none';
    previewHint.style.display = focusMode === 'point' ? 'block' : 'none';
}

function applyPreset(preset) {
    switch (preset) {
        case 'portrait':
            blurAmount = 15;
            focusRange = 25;
            gradientSmooth = 60;
            break;
        case 'macro':
            blurAmount = 25;
            focusRange = 10;
            gradientSmooth = 30;
            break;
        case 'cinematic':
            blurAmount = 12;
            focusRange = 35;
            gradientSmooth = 70;
            break;
        case 'tiltshift':
            blurAmount = 20;
            focusRange = 15;
            gradientSmooth = 20;
            break;
    }

    blurSlider.value = blurAmount;
    blurValue.textContent = `${blurAmount}px`;
    focusRangeSlider.value = focusRange;
    focusRangeValue.textContent = `${focusRange}%`;
    gradientSlider.value = gradientSmooth;
    gradientValue.textContent = `${gradientSmooth}%`;
}

async function applyBokehEffect() {
    if (!originalImage || !depthMap) return;

    const t = translations[currentLang];
    processingOverlay.style.display = 'flex';
    processingText.textContent = t.applyingBokeh;

    // Use setTimeout to allow UI update
    await new Promise(resolve => setTimeout(resolve, 50));

    const width = resultCanvas.width;
    const height = resultCanvas.height;
    const ctx = resultCanvas.getContext('2d');

    // Draw original
    ctx.drawImage(originalImage, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;

    // Get depth data
    const depthData = depthMap.data;
    const depthWidth = depthMap.width;
    const depthHeight = depthMap.height;

    // Normalize depth
    let min = Infinity, max = -Infinity;
    for (let i = 0; i < depthData.length; i++) {
        if (depthData[i] < min) min = depthData[i];
        if (depthData[i] > max) max = depthData[i];
    }

    // Create blur map based on depth difference from focus
    const blurMap = new Float32Array(width * height);
    const focusRangeNorm = focusRange / 100;
    const smoothness = gradientSmooth / 100;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const sx = Math.floor((x / width) * depthWidth);
            const sy = Math.floor((y / height) * depthHeight);
            const si = sy * depthWidth + sx;

            const depth = (depthData[si] - min) / (max - min);
            let depthDiff = Math.abs(depth - focusDepth);

            // Apply focus range
            depthDiff = Math.max(0, depthDiff - focusRangeNorm);

            // Apply smoothness
            const blur = depthDiff * (1 + smoothness);

            blurMap[y * width + x] = Math.min(1, blur);
        }
    }

    // Apply variable blur (simplified for performance)
    const output = new Uint8ClampedArray(pixels.length);
    const maxBlur = blurAmount;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            const blurLevel = blurMap[y * width + x];
            const radius = Math.floor(blurLevel * maxBlur);

            if (radius <= 0) {
                output[i] = pixels[i];
                output[i + 1] = pixels[i + 1];
                output[i + 2] = pixels[i + 2];
                output[i + 3] = pixels[i + 3];
                continue;
            }

            // Box blur for simplicity
            let r = 0, g = 0, b = 0, count = 0;

            for (let dy = -radius; dy <= radius; dy++) {
                for (let dx = -radius; dx <= radius; dx++) {
                    const nx = x + dx;
                    const ny = y + dy;

                    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                        // Circle shape check
                        if (bokehShape === 'circle' && dx * dx + dy * dy > radius * radius) continue;

                        const ni = (ny * width + nx) * 4;
                        r += pixels[ni];
                        g += pixels[ni + 1];
                        b += pixels[ni + 2];
                        count++;
                    }
                }
            }

            output[i] = Math.round(r / count);
            output[i + 1] = Math.round(g / count);
            output[i + 2] = Math.round(b / count);
            output[i + 3] = 255;
        }
    }

    // Put result
    const resultData = new ImageData(output, width, height);
    ctx.putImageData(resultData, 0, 0);

    processingOverlay.style.display = 'none';
}

function showTab(tab) {
    resultCanvas.style.display = tab === 'result' ? 'block' : 'none';
    depthCanvas.style.display = tab === 'depth' ? 'block' : 'none';
    originalCanvas.style.display = tab === 'original' ? 'block' : 'none';

    focusIndicator.style.display = (tab === 'result' && focusMode === 'point') ? 'block' : 'none';
    previewHint.style.display = (tab === 'result' && focusMode === 'point') ? 'block' : 'none';
}

function resetToUpload() {
    originalImage = null;
    depthMap = null;
    focusPoint = { x: 0.5, y: 0.5 };
    focusDepth = 0.5;
    fileInput.value = '';

    editorArea.style.display = 'none';
    uploadArea.style.display = 'block';
    examplesSection.style.display = 'block';
    focusIndicator.style.display = 'none';
}

function downloadResult() {
    const link = document.createElement('a');
    link.download = `bokeh-effect-${Date.now()}.png`;
    link.href = resultCanvas.toDataURL('image/png');
    link.click();
}
