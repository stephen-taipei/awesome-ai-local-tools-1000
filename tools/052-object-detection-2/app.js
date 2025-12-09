/**
 * AI Object Detection
 * Tool #052 - Awesome AI Local Tools
 *
 * Uses YOLOv8 for object detection with bounding boxes
 * 100% local processing with Transformers.js
 */

import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.2/dist/transformers.min.js';

// Configure environment
env.useBrowserCache = true;
env.allowLocalModels = false;

// COCO class names for YOLOv8
const COCO_CLASSES = [
    'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat',
    'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat',
    'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe', 'backpack',
    'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee', 'skis', 'snowboard', 'sports ball',
    'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket',
    'bottle', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple',
    'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair',
    'couch', 'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse',
    'remote', 'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink', 'refrigerator',
    'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier', 'toothbrush'
];

// Color palette for bounding boxes
const COLORS = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e'
];

// Translations
const translations = {
    'zh-TW': {
        title: 'AI 物件偵測',
        subtitle: '智能偵測圖片中的物件，標示位置與類別',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        modelNotLoaded: '模型未載入',
        modelLoading: '正在載入模型...',
        modelReady: '模型已就緒',
        loadModel: '載入模型',
        downloading: '正在下載模型...',
        downloadNote: '首次載入約 12MB，之後會快取',
        uploadText: '點擊或拖放圖片到這裡',
        uploadHint: '支援 JPG、PNG、WebP 格式',
        detectedObjects: '偵測到的物件',
        processing: '正在偵測中...',
        inferenceTime: '偵測耗時',
        settings: '設定',
        confidenceThreshold: '信心度門檻',
        maxDetections: '最大偵測數量',
        tryExamples: '試試範例圖片',
        exampleStreet: '街景',
        exampleCat: '貓咪',
        exampleDog: '狗狗',
        exampleCar: '汽車',
        exampleFood: '食物',
        supportedObjects: '支援偵測類別',
        categoriesDesc: '本模型可偵測 COCO 資料集中的 80 種常見物件類別：',
        catPerson: '人物',
        catVehicle: '交通工具',
        catAnimal: '動物',
        catFurniture: '家具',
        catElectronics: '電子產品',
        catFood: '食物',
        catSports: '運動用品',
        catKitchen: '廚房用品',
        howItWorks: '如何運作？',
        aiModel: 'AI 模型',
        aiModelDesc: '使用 YOLOv8 輕量模型，快速精確偵測物件',
        boundingBox: '邊界框',
        boundingBoxDesc: '精確標示每個物件的位置與範圍',
        multiClass: '多類別',
        multiClassDesc: '支援 80 種 COCO 標準物件類別',
        realtime: '即時偵測',
        realtimeDesc: '高效能推理，毫秒級回應速度',
        techSpecs: '技術規格',
        specModel: '模型',
        specSize: '模型大小',
        specClasses: '類別數',
        specInput: '輸入尺寸',
        specRuntime: '執行環境',
        backToHome: '返回首頁',
        toolNumber: '工具 #052',
        copyright: 'Awesome AI Local Tools © 2024',
        reset: '重新選擇',
        download: '下載結果',
        noObjects: '未偵測到物件',
        noObjectsHint: '嘗試使用其他圖片或降低信心度門檻'
    },
    'en': {
        title: 'AI Object Detection',
        subtitle: 'Detect multiple objects with bounding boxes',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        modelNotLoaded: 'Model not loaded',
        modelLoading: 'Loading model...',
        modelReady: 'Model ready',
        loadModel: 'Load Model',
        downloading: 'Downloading model...',
        downloadNote: 'First load ~12MB, cached afterwards',
        uploadText: 'Click or drag image here',
        uploadHint: 'Supports JPG, PNG, WebP formats',
        detectedObjects: 'Detected Objects',
        processing: 'Detecting...',
        inferenceTime: 'Inference Time',
        settings: 'Settings',
        confidenceThreshold: 'Confidence Threshold',
        maxDetections: 'Max Detections',
        tryExamples: 'Try Example Images',
        exampleStreet: 'Street',
        exampleCat: 'Cat',
        exampleDog: 'Dog',
        exampleCar: 'Car',
        exampleFood: 'Food',
        supportedObjects: 'Supported Categories',
        categoriesDesc: 'This model detects 80 common COCO dataset categories:',
        catPerson: 'People',
        catVehicle: 'Vehicles',
        catAnimal: 'Animals',
        catFurniture: 'Furniture',
        catElectronics: 'Electronics',
        catFood: 'Food',
        catSports: 'Sports',
        catKitchen: 'Kitchen',
        howItWorks: 'How It Works?',
        aiModel: 'AI Model',
        aiModelDesc: 'Uses YOLOv8 nano model for fast and accurate detection',
        boundingBox: 'Bounding Box',
        boundingBoxDesc: 'Precisely marks the location and extent of each object',
        multiClass: 'Multi-Class',
        multiClassDesc: 'Supports 80 standard COCO object categories',
        realtime: 'Real-time',
        realtimeDesc: 'High-performance inference with millisecond response',
        techSpecs: 'Technical Specs',
        specModel: 'Model',
        specSize: 'Model Size',
        specClasses: 'Classes',
        specInput: 'Input Size',
        specRuntime: 'Runtime',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #052',
        copyright: 'Awesome AI Local Tools © 2024',
        reset: 'Choose Another',
        download: 'Download Result',
        noObjects: 'No objects detected',
        noObjectsHint: 'Try another image or lower the confidence threshold'
    }
};

// State
let currentLang = 'zh-TW';
let detector = null;
let isModelLoading = false;
let currentImage = null;
let detectionResults = [];
let confidenceThreshold = 0.5;
let maxDetections = 50;

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
const resultArea = document.getElementById('resultArea');
const detectionCanvas = document.getElementById('detectionCanvas');
const processingOverlay = document.getElementById('processingOverlay');
const resultsList = document.getElementById('resultsList');
const objectCount = document.getElementById('objectCount');
const inferenceStats = document.getElementById('inferenceStats');
const inferenceTime = document.getElementById('inferenceTime');
const resetBtn = document.getElementById('resetBtn');
const downloadBtn = document.getElementById('downloadBtn');
const settingsPanel = document.getElementById('settingsPanel');
const examplesSection = document.getElementById('examplesSection');
const confidenceSlider = document.getElementById('confidenceSlider');
const confidenceValue = document.getElementById('confidenceValue');
const maxDetectionsSlider = document.getElementById('maxDetectionsSlider');
const maxDetectionsValue = document.getElementById('maxDetectionsValue');

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

    // Reset button
    resetBtn.addEventListener('click', resetToUpload);

    // Download button
    downloadBtn.addEventListener('click', downloadResult);

    // Settings sliders
    confidenceSlider.addEventListener('input', (e) => {
        confidenceThreshold = parseInt(e.target.value) / 100;
        confidenceValue.textContent = `${e.target.value}%`;
        if (currentImage && detectionResults.length > 0) {
            renderDetections();
        }
    });

    maxDetectionsSlider.addEventListener('input', (e) => {
        maxDetections = parseInt(e.target.value);
        maxDetectionsValue.textContent = e.target.value;
        if (currentImage && detectionResults.length > 0) {
            renderDetections();
        }
    });

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
    if (isModelLoading || detector) return;

    isModelLoading = true;
    const t = translations[currentLang];

    loadModelBtn.disabled = true;
    loadModelBtn.style.display = 'none';
    statusIndicator.className = 'status-indicator loading';
    statusText.textContent = t.modelLoading;
    progressContainer.style.display = 'block';

    try {
        detector = await pipeline('object-detection', 'Xenova/yolos-tiny', {
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
        settingsPanel.style.display = 'block';
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

function processFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        detectObjects(e.target.result);
    };
    reader.readAsDataURL(file);
}

async function loadExampleImage(url) {
    if (!detector) {
        await loadModel();
    }
    detectObjects(url);
}

async function detectObjects(imageSource) {
    if (!detector) return;

    const t = translations[currentLang];

    // Show result area
    uploadArea.style.display = 'none';
    resultArea.style.display = 'block';
    processingOverlay.style.display = 'flex';
    resultsList.innerHTML = '';
    objectCount.textContent = '0';
    downloadBtn.disabled = true;

    // Load image
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = async () => {
        currentImage = img;

        // Setup canvas
        const ctx = detectionCanvas.getContext('2d');
        detectionCanvas.width = img.width;
        detectionCanvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        try {
            // Run detection
            const startTime = performance.now();
            const results = await detector(imageSource, {
                threshold: 0.1,
                percentage: true
            });
            const endTime = performance.now();
            const time = Math.round(endTime - startTime);

            // Store results
            detectionResults = results;

            // Hide processing overlay
            processingOverlay.style.display = 'none';

            // Show inference stats
            inferenceStats.style.display = 'flex';
            inferenceTime.textContent = `${time}ms`;

            // Render detections
            renderDetections();

            // Enable download
            downloadBtn.disabled = false;

        } catch (error) {
            console.error('Detection error:', error);
            processingOverlay.style.display = 'none';
            resultsList.innerHTML = `<p style="color: var(--error-color); padding: 1rem;">Error: ${error.message}</p>`;
        }
    };

    img.onerror = () => {
        console.error('Failed to load image');
        processingOverlay.style.display = 'none';
        resultsList.innerHTML = `<p style="color: var(--error-color); padding: 1rem;">Failed to load image</p>`;
    };

    img.src = imageSource;
}

function renderDetections() {
    if (!currentImage) return;

    const t = translations[currentLang];
    const ctx = detectionCanvas.getContext('2d');
    const width = currentImage.width;
    const height = currentImage.height;

    // Redraw original image
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(currentImage, 0, 0);

    // Filter results by confidence
    const filtered = detectionResults
        .filter(d => d.score >= confidenceThreshold)
        .slice(0, maxDetections);

    // Update count
    objectCount.textContent = filtered.length.toString();

    // Clear results list
    resultsList.innerHTML = '';

    if (filtered.length === 0) {
        resultsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔍</div>
                <p>${t.noObjects}</p>
                <p style="font-size: 0.75rem; margin-top: 0.5rem;">${t.noObjectsHint}</p>
            </div>
        `;
        return;
    }

    // Draw bounding boxes and add to list
    filtered.forEach((detection, index) => {
        const color = COLORS[index % COLORS.length];
        const box = detection.box;

        // Convert percentage to pixels
        const x = box.xmin * width;
        const y = box.ymin * height;
        const w = (box.xmax - box.xmin) * width;
        const h = (box.ymax - box.ymin) * height;

        // Draw box
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, w, h);

        // Draw label background
        const label = detection.label;
        const score = Math.round(detection.score * 100);
        const text = `${label} ${score}%`;
        ctx.font = 'bold 14px sans-serif';
        const textMetrics = ctx.measureText(text);
        const textWidth = textMetrics.width + 10;
        const textHeight = 22;

        ctx.fillStyle = color;
        ctx.fillRect(x, y - textHeight, textWidth, textHeight);

        // Draw label text
        ctx.fillStyle = 'white';
        ctx.fillText(text, x + 5, y - 6);

        // Add to results list
        const item = document.createElement('div');
        item.className = 'detection-item';
        item.innerHTML = `
            <div class="detection-color" style="background: ${color};"></div>
            <div class="detection-info">
                <div class="detection-label">${label}</div>
                <div class="detection-confidence">${t.confidence || 'Confidence'}</div>
            </div>
            <div class="detection-score">${score}%</div>
        `;

        // Highlight on hover
        item.addEventListener('mouseenter', () => {
            highlightBox(index, filtered);
        });
        item.addEventListener('mouseleave', () => {
            renderDetections();
        });

        resultsList.appendChild(item);
    });
}

function highlightBox(highlightIndex, detections) {
    if (!currentImage) return;

    const ctx = detectionCanvas.getContext('2d');
    const width = currentImage.width;
    const height = currentImage.height;

    // Redraw with highlighted box
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(currentImage, 0, 0);

    detections.forEach((detection, index) => {
        const isHighlighted = index === highlightIndex;
        const color = COLORS[index % COLORS.length];
        const box = detection.box;

        const x = box.xmin * width;
        const y = box.ymin * height;
        const w = (box.xmax - box.xmin) * width;
        const h = (box.ymax - box.ymin) * height;

        // Draw box (thicker if highlighted)
        ctx.strokeStyle = color;
        ctx.lineWidth = isHighlighted ? 5 : 3;
        ctx.strokeRect(x, y, w, h);

        // If highlighted, add semi-transparent fill
        if (isHighlighted) {
            ctx.fillStyle = color + '33';
            ctx.fillRect(x, y, w, h);
        }

        // Draw label
        const label = detection.label;
        const score = Math.round(detection.score * 100);
        const text = `${label} ${score}%`;
        ctx.font = `bold ${isHighlighted ? 16 : 14}px sans-serif`;
        const textMetrics = ctx.measureText(text);
        const textWidth = textMetrics.width + 10;
        const textHeight = isHighlighted ? 26 : 22;

        ctx.fillStyle = color;
        ctx.fillRect(x, y - textHeight, textWidth, textHeight);

        ctx.fillStyle = 'white';
        ctx.fillText(text, x + 5, y - (isHighlighted ? 7 : 6));
    });

    // Update list items
    document.querySelectorAll('.detection-item').forEach((item, i) => {
        item.classList.toggle('highlighted', i === highlightIndex);
    });
}

function downloadResult() {
    if (!detectionCanvas) return;

    const link = document.createElement('a');
    link.download = `object-detection-${Date.now()}.png`;
    link.href = detectionCanvas.toDataURL('image/png');
    link.click();
}

function resetToUpload() {
    currentImage = null;
    detectionResults = [];
    fileInput.value = '';

    resultArea.style.display = 'none';
    uploadArea.style.display = 'block';
    resultsList.innerHTML = '';
    objectCount.textContent = '0';
    inferenceStats.style.display = 'none';
    downloadBtn.disabled = true;
}
