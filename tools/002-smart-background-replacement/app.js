/**
 * Smart Background Replacement - Tool #002
 * Awesome AI Local Tools
 *
 * Uses RMBG-1.4 for background removal and Canvas API for compositing
 */

// ========================================
// Internationalization (i18n)
// ========================================

const translations = {
    'zh-TW': {
        title: '智慧背景替換',
        subtitle: '移除原背景後，以 AI 生成或用戶上傳的背景替換',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        modelNotLoaded: '模型未載入',
        modelLoading: '模型載入中...',
        modelReady: '模型已就緒',
        modelError: '模型載入失敗',
        loadModel: '載入模型',
        downloading: '正在下載模型...',
        progressNote: '首次載入需下載約 176MB，之後會快取至本地',
        uploadText: '拖放圖片到此處或點擊上傳',
        uploadHint: '支援 PNG、JPG、WebP (最大 4096x4096)',
        original: '原圖',
        result: '替換結果',
        processing: '正在處理中...',
        download: '下載圖片',
        uploadAnother: '上傳其他圖片',
        colorBg: '純色背景',
        imageBg: '圖片背景',
        transparent: '透明',
        uploadBg: '上傳背景圖',
        howItWorks: '如何運作？',
        aiModel: 'AI 模型',
        aiModelDesc: '使用 RMBG-1.4 深度學習模型移除背景，再進行合成',
        customBg: '自定義背景',
        customBgDesc: '支援純色、預設場景或上傳自己的圖片作為背景',
        privacy: '隱私保護',
        privacyDesc: '所有處理在瀏覽器本地完成，圖片不會上傳至任何伺服器',
        techSpecs: '技術規格',
        specModel: 'AI 模型',
        specFormat: '模型格式',
        specSize: '模型大小',
        specRuntime: '推論引擎',
        specAccel: '加速方式',
        backToHome: '返回首頁',
        toolNumber: '工具 #002',
        sourceCode: '原始碼',
        copyright: 'Awesome AI Local Tools © 2024',
        errorFileType: '請上傳 PNG、JPG 或 WebP 格式的圖片',
        errorFileSize: '圖片尺寸不能超過 4096x4096',
        errorProcessing: '處理圖片時發生錯誤，請重試',
        webgpu: 'WebGPU (GPU 加速)',
        wasm: 'WebAssembly (CPU)',
        webgl: 'WebGL',
        detecting: '偵測中...'
    },
    'en': {
        title: 'Smart Background Replacement',
        subtitle: 'Replace image backgrounds locally in your browser with AI',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        modelNotLoaded: 'Model not loaded',
        modelLoading: 'Loading model...',
        modelReady: 'Model ready',
        modelError: 'Model loading failed',
        loadModel: 'Load Model',
        downloading: 'Downloading model...',
        progressNote: 'First load requires ~176MB download, cached locally afterwards',
        uploadText: 'Drag & drop image here or click to upload',
        uploadHint: 'Supports PNG, JPG, WebP (max 4096x4096)',
        original: 'Original',
        result: 'Result',
        processing: 'Processing...',
        download: 'Download Result',
        uploadAnother: 'Upload Another',
        colorBg: 'Solid Color',
        imageBg: 'Image Background',
        transparent: 'Transparent',
        uploadBg: 'Upload Background',
        howItWorks: 'How It Works',
        aiModel: 'AI Model',
        aiModelDesc: 'Uses RMBG-1.4 deep learning model for background removal and compositing',
        customBg: 'Custom Background',
        customBgDesc: 'Supports solid colors, preset scenes, or custom uploaded images',
        privacy: 'Privacy',
        privacyDesc: 'All processing done locally in browser, images never uploaded to any server',
        techSpecs: 'Technical Specs',
        specModel: 'AI Model',
        specFormat: 'Model Format',
        specSize: 'Model Size',
        specRuntime: 'Inference Engine',
        specAccel: 'Acceleration',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #002',
        sourceCode: 'Source Code',
        copyright: 'Awesome AI Local Tools © 2024',
        errorFileType: 'Please upload PNG, JPG, or WebP images',
        errorFileSize: 'Image dimensions cannot exceed 4096x4096',
        errorProcessing: 'Error processing image, please try again',
        webgpu: 'WebGPU (GPU Accelerated)',
        wasm: 'WebAssembly (CPU)',
        webgl: 'WebGL',
        detecting: 'Detecting...'
    }
};

let currentLang = 'zh-TW';

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });

    // Update active button
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`lang-${lang === 'zh-TW' ? 'zh' : 'en'}`).classList.add('active');

    // Update HTML lang attribute
    document.documentElement.lang = lang === 'zh-TW' ? 'zh-TW' : 'en';
}

function t(key) {
    return translations[currentLang][key] || key;
}

// ========================================
// Application State
// ========================================

const state = {
    model: null,
    processor: null,
    isModelLoaded: false,
    isProcessing: false,
    currentImageData: null,
    foregroundImage: null, // Image with transparency
    bgType: 'transparent', // 'transparent', 'color', 'image'
    bgColor: '#ffffff',
    bgImage: null,
    resultBlob: null
};

// ========================================
// DOM Elements
// ========================================

const elements = {
    loadModelBtn: document.getElementById('loadModelBtn'),
    statusIndicator: document.getElementById('statusIndicator'),
    statusText: document.getElementById('statusText'),
    progressContainer: document.getElementById('progressContainer'),
    progressFill: document.getElementById('progressFill'),
    progressPercent: document.getElementById('progressPercent'),
    progressText: document.getElementById('progressText'),
    uploadArea: document.getElementById('uploadArea'),
    fileInput: document.getElementById('fileInput'),
    previewArea: document.getElementById('previewArea'),
    originalImage: document.getElementById('originalImage'),
    resultImage: document.getElementById('resultImage'),
    processingOverlay: document.getElementById('processingOverlay'),
    downloadBtn: document.getElementById('downloadBtn'),
    resetBtn: document.getElementById('resetBtn'),
    accelerationMethod: document.getElementById('accelerationMethod'),
    // Background options
    bgColorPicker: document.getElementById('bgColorPicker'),
    bgColorValue: document.getElementById('bgColorValue'),
    transparentBgBtn: document.getElementById('transparentBgBtn'),
    bgFileInput: document.getElementById('bgFileInput'),
    presetBgGrid: document.getElementById('presetBgGrid')
};

// ========================================
// Utility Functions
// ========================================

async function detectAcceleration() {
    elements.accelerationMethod.textContent = t('detecting');

    // Check WebGPU support
    if (navigator.gpu) {
        try {
            const adapter = await navigator.gpu.requestAdapter();
            if (adapter) {
                elements.accelerationMethod.textContent = t('webgpu');
                return 'webgpu';
            }
        } catch (e) {
            console.log('WebGPU not available:', e);
        }
    }

    // Check WebGL support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (gl) {
        elements.accelerationMethod.textContent = t('webgl');
        return 'webgl';
    }

    // Fallback to WASM
    elements.accelerationMethod.textContent = t('wasm');
    return 'wasm';
}

function updateProgress(progress) {
    const percent = Math.round(progress * 100);
    elements.progressFill.style.width = `${percent}%`;
    elements.progressPercent.textContent = `${percent}%`;
}

function setModelStatus(status) {
    elements.statusIndicator.className = 'status-indicator';

    switch (status) {
        case 'loading':
            elements.statusIndicator.classList.add('loading');
            elements.statusText.textContent = t('modelLoading');
            elements.loadModelBtn.style.display = 'none';
            break;
        case 'ready':
            elements.statusIndicator.classList.add('ready');
            elements.statusText.textContent = t('modelReady');
            elements.loadModelBtn.style.display = 'none';
            elements.uploadArea.classList.remove('disabled');
            break;
        case 'error':
            elements.statusIndicator.classList.add('error');
            elements.statusText.textContent = t('modelError');
            elements.loadModelBtn.style.display = 'inline-flex';
            elements.loadModelBtn.textContent = t('loadModel');
            break;
        default:
            elements.statusText.textContent = t('modelNotLoaded');
            elements.loadModelBtn.style.display = 'inline-flex';
    }
}

// ========================================
// Model Loading
// ========================================

async function loadModel() {
    if (state.isModelLoaded) return;

    setModelStatus('loading');
    elements.progressContainer.style.display = 'block';
    elements.uploadArea.classList.add('disabled');

    try {
        // Dynamically import Transformers.js
        const { AutoModel, AutoProcessor, env, RawImage } = await import(
            'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.2'
        );

        // Configure environment
        env.allowLocalModels = false;
        env.useBrowserCache = true;

        // Store RawImage for later use
        window.RawImage = RawImage;

        // Detect best acceleration method
        const accel = await detectAcceleration();

        // Load model and processor with progress tracking
        const modelId = 'briaai/RMBG-1.4';

        // Load processor
        state.processor = await AutoProcessor.from_pretrained(modelId, {
            progress_callback: (progress) => {
                if (progress.status === 'progress') {
                    updateProgress(progress.progress / 100 * 0.3); // 30% for processor
                }
            }
        });

        // Load model
        state.model = await AutoModel.from_pretrained(modelId, {
            device: accel === 'webgpu' ? 'webgpu' : 'wasm',
            progress_callback: (progress) => {
                if (progress.status === 'progress') {
                    updateProgress(0.3 + (progress.progress / 100 * 0.7)); // 70% for model
                }
            }
        });

        state.isModelLoaded = true;
        elements.progressContainer.style.display = 'none';
        setModelStatus('ready');

        console.log('Model loaded successfully');

    } catch (error) {
        console.error('Error loading model:', error);
        elements.progressContainer.style.display = 'none';
        setModelStatus('error');
        alert(t('modelError') + '\n\n' + error.message);
    }
}

// ========================================
// Image Processing
// ========================================

async function processImage(imageFile) {
    if (!state.isModelLoaded || state.isProcessing) return;

    state.isProcessing = true;
    elements.processingOverlay.style.display = 'flex';
    elements.resultImage.style.display = 'none';
    elements.downloadBtn.disabled = true;

    try {
        // Read image
        const imageUrl = URL.createObjectURL(imageFile);
        elements.originalImage.src = imageUrl;

        // Show preview area
        elements.uploadArea.style.display = 'none';
        elements.previewArea.style.display = 'block';

        // Load and process image using RawImage
        const image = await window.RawImage.fromURL(imageUrl);

        // Check dimensions
        if (image.width > 4096 || image.height > 4096) {
            throw new Error(t('errorFileSize'));
        }

        // Preprocess
        const processedInputs = await state.processor(image);

        // Run inference
        const startTime = performance.now();
        const { output } = await state.model(processedInputs);
        const inferenceTime = performance.now() - startTime;
        console.log(`Inference time: ${inferenceTime.toFixed(0)}ms`);

        // Post-process output
        const maskData = output[0][0].data;
        const maskWidth = output[0][0].dims[1];
        const maskHeight = output[0][0].dims[0];

        // Create canvas for mask resizing
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = maskWidth;
        maskCanvas.height = maskHeight;
        const maskCtx = maskCanvas.getContext('2d');

        // Create ImageData from mask
        const maskImageData = maskCtx.createImageData(maskWidth, maskHeight);
        for (let i = 0; i < maskData.length; i++) {
            const val = Math.round(maskData[i] * 255);
            maskImageData.data[i * 4] = val;
            maskImageData.data[i * 4 + 1] = val;
            maskImageData.data[i * 4 + 2] = val;
            maskImageData.data[i * 4 + 3] = 255;
        }
        maskCtx.putImageData(maskImageData, 0, 0);

        // Create output canvas at original size
        const outputCanvas = document.createElement('canvas');
        outputCanvas.width = image.width;
        outputCanvas.height = image.height;
        const outputCtx = outputCanvas.getContext('2d');

        // Draw original image
        const originalCanvas = document.createElement('canvas');
        originalCanvas.width = image.width;
        originalCanvas.height = image.height;
        const originalCtx = originalCanvas.getContext('2d');

        // Convert RawImage to canvas
        const originalImageData = originalCtx.createImageData(image.width, image.height);
        for (let i = 0; i < image.data.length; i++) {
            originalImageData.data[i] = image.data[i];
        }
        originalCtx.putImageData(originalImageData, 0, 0);

        // Draw original to output
        outputCtx.drawImage(originalCanvas, 0, 0);

        // Draw resized mask to get alpha channel
        const resizedMaskCanvas = document.createElement('canvas');
        resizedMaskCanvas.width = image.width;
        resizedMaskCanvas.height = image.height;
        const resizedMaskCtx = resizedMaskCanvas.getContext('2d');
        resizedMaskCtx.drawImage(maskCanvas, 0, 0, image.width, image.height);
        const resizedMaskData = resizedMaskCtx.getImageData(0, 0, image.width, image.height);

        // Apply mask as alpha channel
        const outputImageData = outputCtx.getImageData(0, 0, image.width, image.height);
        for (let i = 0; i < outputImageData.data.length / 4; i++) {
            outputImageData.data[i * 4 + 3] = resizedMaskData.data[i * 4]; // Use red channel as alpha
        }
        outputCtx.putImageData(outputImageData, 0, 0);

        // Store foreground image for later compositing
        state.foregroundImage = outputCanvas;

        // Initial composite (transparent)
        updateComposite();

        // Cleanup
        URL.revokeObjectURL(imageUrl);

    } catch (error) {
        console.error('Error processing image:', error);
        alert(t('errorProcessing') + '\n\n' + error.message);
        resetUI();
    } finally {
        state.isProcessing = false;
        elements.processingOverlay.style.display = 'none';
    }
}

function updateComposite() {
    if (!state.foregroundImage) return;

    const width = state.foregroundImage.width;
    const height = state.foregroundImage.height;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // 1. Draw Background
    if (state.bgType === 'color') {
        ctx.fillStyle = state.bgColor;
        ctx.fillRect(0, 0, width, height);
    } else if (state.bgType === 'image' && state.bgImage) {
        // Draw image covering the canvas (like object-fit: cover)
        const bgRatio = state.bgImage.width / state.bgImage.height;
        const canvasRatio = width / height;

        let drawWidth, drawHeight, offsetX, offsetY;

        if (bgRatio > canvasRatio) {
            drawHeight = height;
            drawWidth = height * bgRatio;
            offsetX = (width - drawWidth) / 2;
            offsetY = 0;
        } else {
            drawWidth = width;
            drawHeight = width / bgRatio;
            offsetX = 0;
            offsetY = (height - drawHeight) / 2;
        }

        ctx.drawImage(state.bgImage, offsetX, offsetY, drawWidth, drawHeight);
    }
    // 'transparent' needs no action, canvas is transparent by default

    // 2. Draw Foreground
    ctx.drawImage(state.foregroundImage, 0, 0);

    // 3. Update result image
    canvas.toBlob((blob) => {
        state.resultBlob = blob;
        const resultUrl = URL.createObjectURL(blob);
        elements.resultImage.src = resultUrl;
        elements.resultImage.style.display = 'block';
        elements.downloadBtn.disabled = false;
    }, 'image/png');
}

function downloadResult() {
    if (!state.resultBlob) return;

    const link = document.createElement('a');
    link.href = URL.createObjectURL(state.resultBlob);
    link.download = `background-replaced-${Date.now()}.png`;
    link.click();
    URL.revokeObjectURL(link.href);
}

function resetUI() {
    elements.uploadArea.style.display = 'block';
    elements.previewArea.style.display = 'none';
    elements.resultImage.style.display = 'none';
    elements.processingOverlay.style.display = 'flex';
    elements.downloadBtn.disabled = true;
    elements.fileInput.value = '';
    state.resultBlob = null;
    state.foregroundImage = null;
    state.bgImage = null;
    state.bgType = 'transparent';
    elements.bgColorPicker.value = '#ffffff';
    elements.bgColorValue.textContent = '#FFFFFF';
}

// ========================================
// Event Handlers
// ========================================

function handleFileSelect(file) {
    if (!file) return;

    // Check file type
    const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        alert(t('errorFileType'));
        return;
    }

    processImage(file);
}

function initEventListeners() {
    // Language switcher
    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    // Load model button
    elements.loadModelBtn.addEventListener('click', loadModel);

    // Upload area click
    elements.uploadArea.addEventListener('click', () => {
        if (!state.isModelLoaded) {
            loadModel();
            return;
        }
        if (!elements.uploadArea.classList.contains('disabled')) {
            elements.fileInput.click();
        }
    });

    // File input change
    elements.fileInput.addEventListener('change', (e) => {
        handleFileSelect(e.target.files[0]);
    });

    // Drag and drop
    elements.uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (state.isModelLoaded) {
            elements.uploadArea.classList.add('dragover');
        }
    });

    elements.uploadArea.addEventListener('dragleave', () => {
        elements.uploadArea.classList.remove('dragover');
    });

    elements.uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.uploadArea.classList.remove('dragover');
        if (state.isModelLoaded && e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    });

    // Background Options

    // Transparent
    elements.transparentBgBtn.addEventListener('click', () => {
        state.bgType = 'transparent';
        updateComposite();
    });

    // Color Picker
    elements.bgColorPicker.addEventListener('input', (e) => {
        state.bgColor = e.target.value;
        state.bgType = 'color';
        elements.bgColorValue.textContent = state.bgColor.toUpperCase();
        updateComposite();
    });

    // Background Image Upload
    elements.bgFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const img = new Image();
            img.onload = () => {
                state.bgImage = img;
                state.bgType = 'image';
                updateComposite();
            };
            img.src = URL.createObjectURL(file);
        }
    });

    // Download button
    elements.downloadBtn.addEventListener('click', downloadResult);

    // Reset button
    elements.resetBtn.addEventListener('click', resetUI);
}

// ========================================
// Initialization
// ========================================

async function init() {
    // Set initial language based on browser preference
    const browserLang = navigator.language;
    if (browserLang.startsWith('zh')) {
        setLanguage('zh-TW');
    } else {
        setLanguage('en');
    }

    // Initialize event listeners
    initEventListeners();

    // Detect acceleration method
    await detectAcceleration();

    // Set upload area as disabled until model is loaded
    elements.uploadArea.classList.add('disabled');

    // Load presets (placeholder)
    const presetColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff', '#ff00ff', '#000000', '#ffffff'];
    presetColors.forEach(color => {
         // Could add quick color presets here
    });

    console.log('Smart Background Replacement initialized');
}

// Start app
init();
