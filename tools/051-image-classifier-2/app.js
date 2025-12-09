/**
 * AI Image Classifier
 * Tool #051 - Awesome AI Local Tools
 *
 * Uses MobileNetV2 for image classification into 1000+ ImageNet categories
 * 100% local processing with Transformers.js
 */

import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.2/dist/transformers.min.js';

// Configure environment
env.useBrowserCache = true;
env.allowLocalModels = false;

// Translations
const translations = {
    'zh-TW': {
        title: 'AI 圖像分類器',
        subtitle: '智能識別圖片中的物體，支援 1000+ 類別',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        modelNotLoaded: '模型未載入',
        modelLoading: '正在載入模型...',
        modelReady: '模型已就緒',
        loadModel: '載入模型',
        downloading: '正在下載模型...',
        downloadNote: '首次載入約 15MB，之後會快取',
        uploadText: '點擊或拖放圖片到這裡',
        uploadHint: '支援 JPG、PNG、WebP 格式',
        topPrediction: '最佳預測',
        confidence: '信心度',
        otherPredictions: '其他可能',
        processing: '正在識別中...',
        inferenceTime: '識別耗時',
        tryExamples: '試試範例圖片',
        exampleCat: '貓咪',
        exampleDog: '狗狗',
        exampleCar: '汽車',
        exampleFood: '食物',
        exampleFlower: '花卉',
        categories: '支援類別',
        categoriesDesc: '本模型可識別 ImageNet 資料集中的 1000+ 種類別，包括：',
        animals: '動物',
        vehicles: '交通工具',
        food: '食物',
        plants: '植物',
        objects: '日常物品',
        scenes: '場景',
        howItWorks: '如何運作？',
        aiModel: 'AI 模型',
        aiModelDesc: '使用 MobileNetV2 輕量級模型，平衡效能與準確度',
        fastInference: '快速識別',
        fastInferenceDesc: '毫秒級推理速度，即時獲得分類結果',
        multiCategory: '多類別',
        multiCategoryDesc: '支援 1000+ 種 ImageNet 標準類別',
        localProcess: '本地處理',
        localProcessDesc: '所有運算在您的設備上完成，保護隱私',
        techSpecs: '技術規格',
        specModel: '模型',
        specSize: '模型大小',
        specCategories: '類別數',
        specInput: '輸入尺寸',
        specRuntime: '執行環境',
        backToHome: '返回首頁',
        toolNumber: '工具 #051',
        copyright: 'Awesome AI Local Tools © 2024',
        reset: '重新選擇'
    },
    'en': {
        title: 'AI Image Classifier',
        subtitle: 'Intelligent object recognition with 1000+ categories',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        modelNotLoaded: 'Model not loaded',
        modelLoading: 'Loading model...',
        modelReady: 'Model ready',
        loadModel: 'Load Model',
        downloading: 'Downloading model...',
        downloadNote: 'First load ~15MB, cached afterwards',
        uploadText: 'Click or drag image here',
        uploadHint: 'Supports JPG, PNG, WebP formats',
        topPrediction: 'Top Prediction',
        confidence: 'Confidence',
        otherPredictions: 'Other Possibilities',
        processing: 'Classifying...',
        inferenceTime: 'Inference Time',
        tryExamples: 'Try Example Images',
        exampleCat: 'Cat',
        exampleDog: 'Dog',
        exampleCar: 'Car',
        exampleFood: 'Food',
        exampleFlower: 'Flower',
        categories: 'Supported Categories',
        categoriesDesc: 'This model recognizes 1000+ ImageNet categories, including:',
        animals: 'Animals',
        vehicles: 'Vehicles',
        food: 'Food',
        plants: 'Plants',
        objects: 'Objects',
        scenes: 'Scenes',
        howItWorks: 'How It Works?',
        aiModel: 'AI Model',
        aiModelDesc: 'Uses MobileNetV2 lightweight model, balancing performance and accuracy',
        fastInference: 'Fast Inference',
        fastInferenceDesc: 'Millisecond-level inference for instant classification',
        multiCategory: 'Multi-Category',
        multiCategoryDesc: 'Supports 1000+ standard ImageNet categories',
        localProcess: 'Local Processing',
        localProcessDesc: 'All computation done on your device, protecting privacy',
        techSpecs: 'Technical Specs',
        specModel: 'Model',
        specSize: 'Model Size',
        specCategories: 'Categories',
        specInput: 'Input Size',
        specRuntime: 'Runtime',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #051',
        copyright: 'Awesome AI Local Tools © 2024',
        reset: 'Choose Another'
    }
};

// State
let currentLang = 'zh-TW';
let classifier = null;
let isModelLoading = false;
let currentImageUrl = null;

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
const progressNote = document.getElementById('progressNote');
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const resultArea = document.getElementById('resultArea');
const previewImage = document.getElementById('previewImage');
const processingOverlay = document.getElementById('processingOverlay');
const predictionsContent = document.getElementById('predictionsContent');
const resetBtn = document.getElementById('resetBtn');

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

    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) {
            el.textContent = t[key];
        }
    });

    // Update active button
    if (currentLang === 'zh-TW') {
        langZhBtn.classList.add('active');
        langEnBtn.classList.remove('active');
    } else {
        langEnBtn.classList.add('active');
        langZhBtn.classList.remove('active');
    }

    // Save preference
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

    // Reset button
    resetBtn.addEventListener('click', resetToUpload);

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
    if (isModelLoading || classifier) return;

    isModelLoading = true;
    const t = translations[currentLang];

    // Update UI
    loadModelBtn.disabled = true;
    loadModelBtn.style.display = 'none';
    statusIndicator.className = 'status-indicator loading';
    statusText.textContent = t.modelLoading;
    progressContainer.style.display = 'block';

    try {
        // Load the image classification pipeline
        classifier = await pipeline('image-classification', 'Xenova/mobilenet_v2_1.0_224', {
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

        // Model loaded successfully
        statusIndicator.className = 'status-indicator ready';
        statusText.textContent = t.modelReady;
        progressContainer.style.display = 'none';
        uploadArea.style.display = 'block';

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

function processFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }

    const url = URL.createObjectURL(file);
    classifyImage(url);
}

async function loadExampleImage(url) {
    if (!classifier) {
        await loadModel();
    }
    classifyImage(url);
}

async function classifyImage(imageUrl) {
    if (!classifier) return;

    currentImageUrl = imageUrl;
    const t = translations[currentLang];

    // Show result area
    uploadArea.style.display = 'none';
    resultArea.style.display = 'block';

    // Display image
    previewImage.src = imageUrl;

    // Show processing overlay
    processingOverlay.style.display = 'flex';
    predictionsContent.innerHTML = '';

    try {
        // Run classification
        const startTime = performance.now();
        const results = await classifier(imageUrl, { topk: 5 });
        const endTime = performance.now();
        const inferenceTime = Math.round(endTime - startTime);

        // Hide processing overlay
        processingOverlay.style.display = 'none';

        // Display results
        displayResults(results, inferenceTime);

    } catch (error) {
        console.error('Classification error:', error);
        processingOverlay.style.display = 'none';
        predictionsContent.innerHTML = `<p style="color: var(--error-color);">Error: ${error.message}</p>`;
    }
}

function displayResults(results, inferenceTime) {
    const t = translations[currentLang];

    if (!results || results.length === 0) {
        predictionsContent.innerHTML = '<p>No predictions available</p>';
        return;
    }

    // Format label for display
    const formatLabel = (label) => {
        // Remove underscores and capitalize words
        return label.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
    };

    // Top prediction
    const top = results[0];
    const topScore = Math.round(top.score * 100);

    let html = `
        <div class="top-prediction">
            <div class="top-label">${formatLabel(top.label)}</div>
            <div class="top-confidence">
                <span>${t.confidence}:</span>
                <span>${topScore}%</span>
            </div>
        </div>
    `;

    // Other predictions
    if (results.length > 1) {
        html += `<h3>${t.otherPredictions}</h3>`;
        html += '<div class="predictions-list">';

        results.slice(1).forEach((pred, index) => {
            const score = Math.round(pred.score * 100);
            html += `
                <div class="prediction-item">
                    <div class="prediction-rank">${index + 2}</div>
                    <div class="prediction-info">
                        <div class="prediction-label">${formatLabel(pred.label)}</div>
                        <div class="prediction-bar-container">
                            <div class="prediction-bar" style="width: ${score}%"></div>
                        </div>
                    </div>
                    <div class="prediction-score">${score}%</div>
                </div>
            `;
        });

        html += '</div>';
    }

    // Inference stats
    html += `
        <div class="inference-stats">
            <span>${t.inferenceTime}:</span>
            <span>${inferenceTime}ms</span>
        </div>
    `;

    predictionsContent.innerHTML = html;
}

function resetToUpload() {
    // Clean up
    if (currentImageUrl && currentImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(currentImageUrl);
    }
    currentImageUrl = null;
    fileInput.value = '';

    // Reset UI
    resultArea.style.display = 'none';
    uploadArea.style.display = 'block';
    predictionsContent.innerHTML = '';
    previewImage.src = '';
}
