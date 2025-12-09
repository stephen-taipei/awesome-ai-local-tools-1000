/**
 * AI Scene Recognition - Tool #053
 * Awesome AI Local Tools
 *
 * Uses MobileNet (via Transformers.js or TFLite) to classify scenes.
 */

// ========================================
// Internationalization (i18n)
// ========================================

const translations = {
    'zh-TW': {
        title: '場景識別',
        subtitle: '智慧識別圖片場景（室內/室外、海灘/山林等）',
        modelNotLoaded: '模型未載入',
        modelLoading: '模型載入中...',
        modelReady: '模型已就緒',
        modelError: '模型載入失敗',
        loadModel: '載入模型',
        uploadText: '拖放圖片到此處或點擊上傳',
        uploadHint: '支援 PNG, JPG, WebP',
        processing: '分析中...',
        detectionResults: '識別結果',
        howItWorks: '如何運作？',
        howItWorksDesc: '使用 ResNet-50 深度學習模型分析圖片特徵，識別出最可能的場景類別。',
        toolNumber: '工具 #053',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        errorFileType: '請上傳 PNG、JPG 或 WebP 格式的圖片',
        errorProcessing: '處理圖片時發生錯誤'
    },
    'en': {
        title: 'Scene Recognition',
        subtitle: 'Identify scenes (indoor/outdoor, beach/mountain, etc.)',
        modelNotLoaded: 'Model not loaded',
        modelLoading: 'Loading model...',
        modelReady: 'Model ready',
        modelError: 'Model loading failed',
        loadModel: 'Load Model',
        uploadText: 'Drag & drop image here or click to upload',
        uploadHint: 'Supports PNG, JPG, WebP',
        processing: 'Analyzing...',
        detectionResults: 'Results',
        howItWorks: 'How It Works',
        howItWorksDesc: 'Uses ResNet-50 deep learning model to analyze image features and identify the most likely scene categories.',
        toolNumber: 'Tool #053',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        errorFileType: 'Please upload PNG, JPG, or WebP images',
        errorProcessing: 'Error processing image'
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
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`lang-${lang === 'zh-TW' ? 'zh' : 'en'}`).classList.add('active');
}

function t(key) {
    return translations[currentLang][key] || key;
}

// ========================================
// Application State
// ========================================

const state = {
    classifier: null,
    isModelLoaded: false,
    isProcessing: false,
    currentImage: null
};

// ========================================
// DOM Elements
// ========================================

const elements = {
    loadModelBtn: document.getElementById('loadModelBtn'),
    statusIndicator: document.getElementById('statusIndicator'),
    statusText: document.getElementById('statusText'),
    resultsArea: document.getElementById('resultsArea'),
    resultsList: document.getElementById('resultsList'),
    uploadArea: document.getElementById('uploadArea'),
    fileInput: document.getElementById('fileInput'),
    previewArea: document.getElementById('previewArea'),
    previewImage: document.getElementById('previewImage'),
    processingOverlay: document.getElementById('processingOverlay')
};

// ========================================
// Model Loading
// ========================================

async function loadModel() {
    if (state.isModelLoaded) return;

    setModelStatus('loading');

    try {
        const { pipeline, env } = await import(
            'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.6.0'
        );

        env.allowLocalModels = false;
        env.useBrowserCache = true;

        // Use ResNet-50 or MobileNet for classification
        // 'Xenova/resnet-50' is good.
        // For scene specific, 'Xenova/mit-b0' (SegFormer) is for segmentation.
        // There is 'Xenova/vit-base-patch16-224' (Vision Transformer) or 'Xenova/resnet-50'.
        // ResNet-50 trained on ImageNet has many scene classes (seashore, valley, etc).

        state.classifier = await pipeline('image-classification', 'Xenova/resnet-50');

        state.isModelLoaded = true;
        setModelStatus('ready');
        console.log('Classifier loaded');

    } catch (error) {
        console.error('Error loading model:', error);
        setModelStatus('error');
        alert(t('modelError') + '\n\n' + error.message);
    }
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
            elements.uploadArea.style.pointerEvents = 'auto';
            elements.uploadArea.style.opacity = '1';
            break;
        case 'error':
            elements.statusIndicator.classList.add('error');
            elements.statusText.textContent = t('modelError');
            elements.loadModelBtn.style.display = 'block';
            break;
        default:
            elements.statusText.textContent = t('modelNotLoaded');
            elements.loadModelBtn.style.display = 'block';
            elements.uploadArea.style.pointerEvents = 'none';
            elements.uploadArea.style.opacity = '0.5';
    }
}

// ========================================
// Image Processing
// ========================================

async function handleImageUpload(file) {
    if (!state.isModelLoaded) return;

    const url = URL.createObjectURL(file);
    elements.previewImage.src = url;

    // Show preview area
    elements.uploadArea.style.display = 'none';
    elements.previewArea.style.display = 'block';
    elements.resultsArea.style.display = 'none'; // Hide until processed

    // Wait for image load
    await new Promise(r => elements.previewImage.onload = r);

    state.currentImage = elements.previewImage;
    processScene();
}

async function processScene() {
    if (!state.currentImage) return;

    state.isProcessing = true;
    elements.processingOverlay.style.display = 'flex';

    try {
        const results = await state.classifier(state.currentImage.src, { topk: 5 });
        displayResults(results);
    } catch (error) {
        console.error('Error processing:', error);
        alert(t('errorProcessing'));
    } finally {
        state.isProcessing = false;
        elements.processingOverlay.style.display = 'none';
    }
}

function displayResults(results) {
    elements.resultsList.innerHTML = '';
    elements.resultsArea.style.display = 'block';
    elements.controlsArea.scrollTop = 0; // Scroll to top to see results if needed? No, controls panel is fixed height.

    // Translate ImageNet labels if possible, otherwise use English.
    // For now, we display label as is.

    results.forEach(item => {
        const percent = (item.score * 100).toFixed(1);

        const div = document.createElement('div');
        div.className = 'result-item';
        div.innerHTML = `
            <div class="result-header">
                <span class="result-label">${item.label}</span>
                <span class="result-score">${percent}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${percent}%"></div>
            </div>
        `;
        elements.resultsList.appendChild(div);
    });
}

// ========================================
// Event Handlers
// ========================================

function initEventListeners() {
    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    elements.loadModelBtn.addEventListener('click', loadModel);

    elements.uploadArea.addEventListener('click', () => elements.fileInput.click());
    elements.fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) handleImageUpload(e.target.files[0]);
    });

    // Drag & Drop
    elements.uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.uploadArea.classList.add('dragover');
    });
    elements.uploadArea.addEventListener('dragleave', () => {
        elements.uploadArea.classList.remove('dragover');
    });
    elements.uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.uploadArea.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) handleImageUpload(e.dataTransfer.files[0]);
    });
}

async function init() {
    const browserLang = navigator.language;
    if (browserLang.startsWith('zh')) setLanguage('zh-TW');
    else setLanguage('en');

    initEventListeners();
}

init();
