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
        performanceDesc: '可用時使用 WebGPU，否則使用 WASM；速度依裝置及圖片而異',
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
        performanceDesc: 'Uses WebGPU when available, otherwise WASM; speed depends on the device and image',
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
    resultBlob: null,
    inputUrl: null,
    outputUrl: null,
    jobId: 0,
    isModelLoading: false
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
    if (navigator.gpu) {
        try {
            if (await navigator.gpu.requestAdapter()) {
                elements.accelerationMethod.textContent = t('webgpu');
                return 'webgpu';
            }
        } catch { /* Fall back to the runtime actually used. */ }
    }
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
    if (state.isModelLoaded || state.isModelLoading) return;
    state.isModelLoading = true;
    setModelStatus('loading');
    elements.progressContainer.style.display = 'block';
    elements.uploadArea.classList.add('disabled');
    try {
        const { AutoModel, AutoProcessor, env, RawImage } = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.2');
        env.allowLocalModels = false;
        env.useBrowserCache = true;
        if (!globalThis.crossOriginIsolated) env.backends.onnx.wasm.numThreads = 1;
        window.RawImage = RawImage;
        const modelId = 'briaai/RMBG-1.4';
        state.processor = await AutoProcessor.from_pretrained(modelId);
        let device = await detectAcceleration();
        const options = {
            dtype: 'fp32',
            progress_callback: progress => {
                if (progress.status === 'progress' && Number.isFinite(progress.progress)) updateProgress(Math.max(0, Math.min(1, progress.progress / 100)));
            }
        };
        try { state.model = await AutoModel.from_pretrained(modelId, { ...options, device }); }
        catch (error) {
            if (device !== 'webgpu') throw error;
            device = 'wasm';
            state.model = await AutoModel.from_pretrained(modelId, { ...options, device });
        }
        elements.accelerationMethod.textContent = t(device);
        state.isModelLoaded = true;
        setModelStatus('ready');
    } catch (error) {
        state.processor = null;
        state.isModelLoaded = false;
        setModelStatus('error');
        alert(t('modelError') + '\n\n' + error.message);
    } finally {
        state.isModelLoading = false;
        elements.progressContainer.style.display = 'none';
    }
}

// ========================================
// Image Processing
// ========================================

async function processImage(imageFile) {
    if (!state.isModelLoaded || state.isProcessing) return;
    const job = ++state.jobId;
    state.isProcessing = true;
    state.resultBlob = null;
    for (const key of ['inputUrl', 'outputUrl']) {
        if (state[key]) URL.revokeObjectURL(state[key]);
        state[key] = null;
    }
    elements.processingOverlay.style.display = 'flex';
    elements.resultImage.style.display = 'none';
    elements.downloadBtn.disabled = true;
    elements.previewArea.setAttribute('aria-busy', 'true');
    try {
        if (imageFile.size > 20 * 1024 * 1024) throw new Error('Maximum file size: 20 MiB.');
        state.inputUrl = URL.createObjectURL(imageFile);
        elements.originalImage.src = state.inputUrl;
        elements.uploadArea.style.display = 'none';
        elements.previewArea.style.display = 'block';
        const image = await window.RawImage.fromURL(state.inputUrl);
        if (job !== state.jobId) return;
        if (image.width > 4096 || image.height > 4096) throw new Error(t('errorFileSize'));
        const rgba = ImageCore.toRGBA(image.data, image.width, image.height, image.channels);
        const inputs = await state.processor(image);
        if (job !== state.jobId) return;
        const { output } = await state.model(inputs);
        if (job !== state.jobId) return;
        const mask = output[0][0];
        const maskHeight = mask.dims[0], maskWidth = mask.dims[1];
        if (!Number.isInteger(maskWidth) || !Number.isInteger(maskHeight) || maskWidth < 1 || maskHeight < 1 || maskWidth * maskHeight > 4096 * 4096 || mask.data.length !== maskWidth * maskHeight) throw new Error('Unexpected model mask shape.');
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = maskWidth; maskCanvas.height = maskHeight;
        const maskContext = maskCanvas.getContext('2d');
        const maskPixels = maskContext.createImageData(maskWidth, maskHeight);
        for (let i = 0; i < mask.data.length; i++) {
            const value = mask.data[i];
            if (!Number.isFinite(value)) throw new Error('Invalid model mask value.');
            maskPixels.data[i * 4] = Math.round(Math.max(0, Math.min(1, value)) * 255);
            maskPixels.data[i * 4 + 3] = 255;
        }
        maskContext.putImageData(maskPixels, 0, 0);
        const canvas = document.createElement('canvas');
        canvas.width = image.width; canvas.height = image.height;
        const context = canvas.getContext('2d');
        context.drawImage(maskCanvas, 0, 0, image.width, image.height);
        const resizedMask = context.getImageData(0, 0, image.width, image.height);
        context.putImageData(new ImageData(ImageCore.applyMask(rgba, resizedMask.data), image.width, image.height), 0, 0);
        const blob = await new Promise((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('PNG export failed.')), 'image/png'));
        if (job !== state.jobId) return;
        state.resultBlob = blob;
        state.outputUrl = URL.createObjectURL(blob);
        elements.resultImage.src = state.outputUrl;
        elements.resultImage.style.display = 'block';
        elements.downloadBtn.disabled = false;
    } catch (error) {
        if (job === state.jobId) {
            alert(t('errorProcessing') + '\n\n' + error.message);
            resetUI();
        }
    } finally {
        state.isProcessing = false;
        elements.processingOverlay.style.display = 'none';
        elements.previewArea.setAttribute('aria-busy', 'false');
    }
}

function downloadResult() {
    if (!state.resultBlob || state.isProcessing) return;
    const link = document.createElement('a');
    const url = URL.createObjectURL(state.resultBlob);
    link.href = url;
    link.download = 'background-removed.png';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function resetUI() {
    state.jobId++;
    for (const key of ['inputUrl', 'outputUrl']) {
        if (state[key]) URL.revokeObjectURL(state[key]);
        state[key] = null;
    }
    elements.originalImage.removeAttribute('src');
    elements.resultImage.removeAttribute('src');
    elements.uploadArea.style.display = 'block';
    elements.previewArea.style.display = 'none';
    elements.resultImage.style.display = 'none';
    elements.processingOverlay.style.display = 'none';
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

window.addEventListener('pagehide', resetUI);
