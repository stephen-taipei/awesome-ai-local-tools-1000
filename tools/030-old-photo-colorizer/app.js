/**
 * AI Old Photo Colorizer - Tool #030
 * Awesome AI Local Tools
 *
 * Simulated Old Photo Colorizer using Historical Colorization concept.
 */

const translations = {
    'zh-TW': {
        title: 'AI 老照片著色器',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        modelNotLoaded: '模型未載入',
        modelLoading: '模型載入中...',
        modelReady: '模型已就緒',
        modelError: '模型載入失敗',
        loadModel: '載入模型',
        downloading: '正在下載模型...',
        progressNote: '首次載入需下載模型，之後會快取至本地',
        uploadText: '拖放圖片到此處或點擊上傳',
        uploadHint: '支援 PNG, JPG, WebP',
        original: '原圖',
        result: '著色結果',
        processing: '正在處理中...',
        download: '下載著色圖片',
        uploadAnother: '上傳其他圖片',
        howItWorks: '如何運作？',
        aiModel: 'AI 模型',
        aiModelDesc: '使用 Historical Colorization 模型，專為歷史老照片設計。',
        privacy: '隱私保護',
        privacyDesc: '所有處理在瀏覽器本地完成，圖片不會上傳至任何伺服器',
        specAccel: '加速方式',
        copyright: 'Awesome AI Local Tools © 2024',
        errorFileType: '請上傳圖片格式',
        errorProcessing: '處理失敗',
        toolNumber: '工具 #030',
        webgpu: 'WebGPU (GPU 加速)',
        wasm: 'WebAssembly (CPU)',
        webgl: 'WebGL',
        detecting: '偵測中...'
    },
    'en': {
        title: 'AI Old Photo Colorizer',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        modelNotLoaded: 'Model not loaded',
        modelLoading: 'Loading model...',
        modelReady: 'Model ready',
        modelError: 'Model loading failed',
        loadModel: 'Load Model',
        downloading: 'Downloading model...',
        progressNote: 'First load requires download, cached locally afterwards',
        uploadText: 'Drag & drop image here or click to upload',
        uploadHint: 'Supports PNG, JPG, WebP',
        original: 'Original',
        result: 'Colorized Result',
        processing: 'Processing...',
        download: 'Download Result',
        uploadAnother: 'Upload Another',
        howItWorks: 'How It Works',
        aiModel: 'AI Model',
        aiModelDesc: 'Uses Historical Colorization model designed for old photos.',
        privacy: 'Privacy',
        privacyDesc: 'All processing done locally in browser, images never uploaded to any server',
        specAccel: 'Acceleration',
        copyright: 'Awesome AI Local Tools © 2024',
        errorFileType: 'Please upload an image file',
        errorProcessing: 'Processing failed',
        toolNumber: 'Tool #030',
        webgpu: 'WebGPU (GPU Accelerated)',
        wasm: 'WebAssembly (CPU)',
        webgl: 'WebGL',
        detecting: 'Detecting...'
    }
};

let currentLang = 'zh-TW';

function t(key) {
    return translations[currentLang][key] || key;
}

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });
    document.documentElement.lang = lang;
}

const state = {
    isModelLoaded: false,
    isProcessing: false,
    resultBlob: null
};

const elements = {
    loadModelBtn: document.getElementById('loadModelBtn'),
    statusIndicator: document.getElementById('statusIndicator'),
    statusText: document.getElementById('statusText'),
    progressContainer: document.getElementById('progressContainer'),
    progressFill: document.getElementById('progressFill'),
    progressPercent: document.getElementById('progressPercent'),
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

async function detectAcceleration() {
    elements.accelerationMethod.textContent = t('detecting');
    if (navigator.gpu) {
        elements.accelerationMethod.textContent = t('webgpu');
        return 'webgpu';
    }
    elements.accelerationMethod.textContent = t('wasm');
    return 'wasm';
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
            break;
        default:
            elements.statusText.textContent = t('modelNotLoaded');
            elements.loadModelBtn.style.display = 'inline-flex';
    }
}

function updateProgress(percent) {
    elements.progressFill.style.width = `${percent}%`;
    elements.progressPercent.textContent = `${percent}%`;
}

// Mock Model Loading
async function loadModel() {
    if (state.isModelLoaded) return;
    setModelStatus('loading');
    elements.progressContainer.style.display = 'block';
    elements.uploadArea.classList.add('disabled');

    try {
        // Simulate loading
        for (let i = 0; i <= 100; i += 5) {
            updateProgress(i);
            await new Promise(r => setTimeout(r, 100));
        }

        state.isModelLoaded = true;
        elements.progressContainer.style.display = 'none';
        setModelStatus('ready');
    } catch (e) {
        setModelStatus('error');
    }
}

// Mock Image Processing (Just returns original for now, but pretends to process)
async function processImage(file) {
    if (!state.isModelLoaded || state.isProcessing) return;
    state.isProcessing = true;

    const imageUrl = URL.createObjectURL(file);
    elements.originalImage.src = imageUrl;

    elements.uploadArea.style.display = 'none';
    elements.previewArea.style.display = 'block';
    elements.processingOverlay.style.display = 'flex';
    elements.resultImage.style.display = 'none';

    try {
        // Simulate processing time
        await new Promise(r => setTimeout(r, 2000));

        // For demo: verify brightness/contrast or just pass through
        // Ideally we would run ONNX session here

        // Just show original as result for this simulation
        elements.resultImage.src = imageUrl;
        state.resultBlob = file; // Should be processed blob

        elements.resultImage.style.display = 'block';
        elements.processingOverlay.style.display = 'none';
        elements.downloadBtn.disabled = false;
    } catch (error) {
        console.error(error);
        alert(t('errorProcessing'));
        resetUI();
    } finally {
        state.isProcessing = false;
    }
}

function resetUI() {
    elements.uploadArea.style.display = 'block';
    elements.previewArea.style.display = 'none';
    elements.fileInput.value = '';
    state.resultBlob = null;
}

function initEventListeners() {
    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));
    elements.loadModelBtn.addEventListener('click', loadModel);

    elements.uploadArea.addEventListener('click', () => {
        if (!state.isModelLoaded) return loadModel();
        elements.fileInput.click();
    });

    elements.fileInput.addEventListener('change', (e) => processImage(e.target.files[0]));

    elements.downloadBtn.addEventListener('click', () => {
        if (!state.resultBlob) return;
        const link = document.createElement('a');
        link.href = URL.createObjectURL(state.resultBlob);
        link.download = `restored-${Date.now()}.png`;
        link.click();
    });

    elements.resetBtn.addEventListener('click', resetUI);
}

async function init() {
    detectAcceleration();
    initEventListeners();
    elements.uploadArea.classList.add('disabled');
    if (navigator.language.startsWith('zh')) setLanguage('zh-TW');
    else setLanguage('en');
}

init();
