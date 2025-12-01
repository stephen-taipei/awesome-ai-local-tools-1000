/**
 * AI Background Remover - Tool #001
 * Awesome AI Local Tools
 *
 * Uses Transformers.js with RMBG-1.4 model for background removal
 * All processing happens locally in the browser
 */

// ========================================
// Internationalization (i18n)
// ========================================

const translations = {
    'zh-TW': {
        title: 'AI 背景移除器',
        subtitle: '完全在瀏覽器本地執行，資料不外傳',
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
        result: '去背結果',
        processing: '正在處理中...',
        download: '下載去背圖片',
        uploadAnother: '上傳其他圖片',
        howItWorks: '如何運作？',
        aiModel: 'AI 模型',
        aiModelDesc: '使用 RMBG-1.4 深度學習模型，精確分離前景與背景',
        privacy: '隱私保護',
        privacyDesc: '所有處理在瀏覽器本地完成，圖片不會上傳至任何伺服器',
        performance: '高效能',
        performanceDesc: '支援 WebGPU 加速，處理速度可達 2-5 秒/張',
        cache: '離線快取',
        cacheDesc: '模型下載後自動快取，下次使用無需重新下載',
        techSpecs: '技術規格',
        specModel: 'AI 模型',
        specFormat: '模型格式',
        specSize: '模型大小',
        specRuntime: '推論引擎',
        specAccel: '加速方式',
        backToHome: '返回首頁',
        toolNumber: '工具 #001',
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
        title: 'AI Background Remover',
        subtitle: 'Runs entirely in your browser, data never leaves your device',
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
        howItWorks: 'How It Works',
        aiModel: 'AI Model',
        aiModelDesc: 'Uses RMBG-1.4 deep learning model for precise foreground-background separation',
        privacy: 'Privacy',
        privacyDesc: 'All processing done locally in browser, images never uploaded to any server',
        performance: 'Performance',
        performanceDesc: 'Supports WebGPU acceleration, processing in 2-5 seconds per image',
        cache: 'Offline Cache',
        cacheDesc: 'Model cached locally after download, no re-download needed',
        techSpecs: 'Technical Specs',
        specModel: 'AI Model',
        specFormat: 'Model Format',
        specSize: 'Model Size',
        specRuntime: 'Inference Engine',
        specAccel: 'Acceleration',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #001',
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
    accelerationMethod: document.getElementById('accelerationMethod')
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

        // Convert to blob and display
        outputCanvas.toBlob((blob) => {
            state.resultBlob = blob;
            const resultUrl = URL.createObjectURL(blob);
            elements.resultImage.src = resultUrl;
            elements.resultImage.style.display = 'block';
            elements.processingOverlay.style.display = 'none';
            elements.downloadBtn.disabled = false;
        }, 'image/png');

        // Cleanup
        URL.revokeObjectURL(imageUrl);

    } catch (error) {
        console.error('Error processing image:', error);
        alert(t('errorProcessing') + '\n\n' + error.message);
        resetUI();
    } finally {
        state.isProcessing = false;
    }
}

function downloadResult() {
    if (!state.resultBlob) return;

    const link = document.createElement('a');
    link.href = URL.createObjectURL(state.resultBlob);
    link.download = `background-removed-${Date.now()}.png`;
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

    console.log('AI Background Remover initialized');
}

// Start app
init();
