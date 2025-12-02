/**
 * AI Background Blur - Tool #003
 * Awesome AI Local Tools
 *
 * Uses MediaPipe Image Segmenter for real-time background blur
 * All processing happens locally in the browser
 */

// ========================================
// Internationalization (i18n)
// ========================================

const translations = {
    'zh-TW': {
        title: 'AI 背景模糊工具',
        subtitle: '智慧偵測主體，即時模糊背景',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        modelNotLoaded: '模型未載入',
        modelLoading: '模型載入中...',
        modelReady: '模型已就緒',
        modelError: '模型載入失敗',
        loadModel: '載入模型',
        modeImage: '📷 圖片模式',
        modeCamera: '🎥 攝像頭模式',
        uploadText: '拖放圖片到此處或點擊上傳',
        uploadHint: '支援 PNG、JPG、WebP',
        startCamera: '開啟攝像頭',
        stopCamera: '關閉攝像頭',
        capture: '擷取畫面',
        original: '原圖',
        result: '模糊結果',
        processing: '正在處理中...',
        blurLevel: '模糊程度：',
        download: '下載結果',
        uploadAnother: '上傳其他圖片',
        fps: 'FPS: ',
        latency: '延遲: ',
        howItWorks: '如何運作？',
        aiModel: 'AI 模型',
        aiModelDesc: '使用 MediaPipe Selfie Segmentation 即時分離前景與背景',
        realtime: '即時處理',
        realtimeDesc: '支援 30+ FPS 即時處理，流暢的視訊效果',
        adjustable: '可調整',
        adjustableDesc: '模糊程度可自由調整，從輕微到強烈',
        lightweight: '超輕量',
        lightweightDesc: '模型僅 256KB，載入快速',
        techSpecs: '技術規格',
        specModel: 'AI 模型',
        specFormat: '模型格式',
        specSize: '模型大小',
        specFps: '處理速度',
        specRuntime: '推論引擎',
        backToHome: '返回首頁',
        toolNumber: '工具 #003',
        sourceCode: '原始碼',
        copyright: 'Awesome AI Local Tools © 2024',
        errorFileType: '請上傳 PNG、JPG 或 WebP 格式的圖片',
        errorCamera: '無法存取攝像頭',
        errorProcessing: '處理圖片時發生錯誤'
    },
    'en': {
        title: 'AI Background Blur',
        subtitle: 'Smart subject detection, real-time background blur',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        modelNotLoaded: 'Model not loaded',
        modelLoading: 'Loading model...',
        modelReady: 'Model ready',
        modelError: 'Model loading failed',
        loadModel: 'Load Model',
        modeImage: '📷 Image Mode',
        modeCamera: '🎥 Camera Mode',
        uploadText: 'Drag & drop image here or click to upload',
        uploadHint: 'Supports PNG, JPG, WebP',
        startCamera: 'Start Camera',
        stopCamera: 'Stop Camera',
        capture: 'Capture',
        original: 'Original',
        result: 'Blurred Result',
        processing: 'Processing...',
        blurLevel: 'Blur Level:',
        download: 'Download Result',
        uploadAnother: 'Upload Another',
        fps: 'FPS: ',
        latency: 'Latency: ',
        howItWorks: 'How It Works',
        aiModel: 'AI Model',
        aiModelDesc: 'Uses MediaPipe Selfie Segmentation for real-time foreground-background separation',
        realtime: 'Real-time',
        realtimeDesc: 'Supports 30+ FPS real-time processing for smooth video effects',
        adjustable: 'Adjustable',
        adjustableDesc: 'Blur intensity can be freely adjusted from subtle to strong',
        lightweight: 'Lightweight',
        lightweightDesc: 'Model only 256KB, loads quickly',
        techSpecs: 'Technical Specs',
        specModel: 'AI Model',
        specFormat: 'Model Format',
        specSize: 'Model Size',
        specFps: 'Processing Speed',
        specRuntime: 'Inference Engine',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #003',
        sourceCode: 'Source Code',
        copyright: 'Awesome AI Local Tools © 2024',
        errorFileType: 'Please upload PNG, JPG, or WebP images',
        errorCamera: 'Cannot access camera',
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
    document.documentElement.lang = lang === 'zh-TW' ? 'zh-TW' : 'en';
}

function t(key) {
    return translations[currentLang][key] || key;
}

// ========================================
// Application State
// ========================================

const state = {
    segmenter: null,
    isModelLoaded: false,
    isProcessing: false,
    currentMode: 'image', // 'image' or 'camera'
    blurAmount: 15,
    cameraStream: null,
    animationId: null,
    lastFrameTime: 0,
    frameCount: 0,
    fps: 0
};

// ========================================
// DOM Elements
// ========================================

const elements = {
    loadModelBtn: document.getElementById('loadModelBtn'),
    statusIndicator: document.getElementById('statusIndicator'),
    statusText: document.getElementById('statusText'),
    modeSelector: document.getElementById('modeSelector'),
    modeImage: document.getElementById('modeImage'),
    modeCamera: document.getElementById('modeCamera'),
    uploadArea: document.getElementById('uploadArea'),
    fileInput: document.getElementById('fileInput'),
    cameraArea: document.getElementById('cameraArea'),
    videoInput: document.getElementById('videoInput'),
    outputCanvas: document.getElementById('outputCanvas'),
    startCameraBtn: document.getElementById('startCameraBtn'),
    stopCameraBtn: document.getElementById('stopCameraBtn'),
    captureBtn: document.getElementById('captureBtn'),
    previewArea: document.getElementById('previewArea'),
    originalImage: document.getElementById('originalImage'),
    resultCanvas: document.getElementById('resultCanvas'),
    processingOverlay: document.getElementById('processingOverlay'),
    blurSlider: document.getElementById('blurSlider'),
    blurValue: document.getElementById('blurValue'),
    downloadBtn: document.getElementById('downloadBtn'),
    resetBtn: document.getElementById('resetBtn'),
    stats: document.getElementById('stats'),
    fpsValue: document.getElementById('fpsValue'),
    latencyValue: document.getElementById('latencyValue')
};

// ========================================
// Model Loading
// ========================================

async function loadModel() {
    if (state.isModelLoaded) return;

    setModelStatus('loading');

    try {
        // Import MediaPipe Tasks Vision
        const { ImageSegmenter, FilesetResolver } = await import(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14'
        );

        // Initialize fileset
        const vision = await FilesetResolver.forVisionTasks(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
        );

        // Create Image Segmenter
        state.segmenter = await ImageSegmenter.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite',
                delegate: 'GPU'
            },
            runningMode: 'IMAGE',
            outputCategoryMask: true,
            outputConfidenceMasks: false
        });

        state.isModelLoaded = true;
        setModelStatus('ready');
        elements.modeSelector.style.display = 'flex';
        showMode('image');

        console.log('MediaPipe Selfie Segmenter loaded successfully');

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

// ========================================
// Mode Switching
// ========================================

function showMode(mode) {
    state.currentMode = mode;

    // Update mode buttons
    elements.modeImage.classList.toggle('active', mode === 'image');
    elements.modeCamera.classList.toggle('active', mode === 'camera');

    // Show/hide areas
    elements.uploadArea.style.display = mode === 'image' ? 'block' : 'none';
    elements.cameraArea.style.display = mode === 'camera' ? 'block' : 'none';
    elements.previewArea.style.display = 'none';
    elements.stats.style.display = 'none';

    // Stop camera if switching away
    if (mode !== 'camera' && state.cameraStream) {
        stopCamera();
    }
}

// ========================================
// Image Processing
// ========================================

async function processImage(imageSource) {
    if (!state.isModelLoaded || state.isProcessing) return;

    state.isProcessing = true;
    elements.processingOverlay.style.display = 'flex';
    elements.downloadBtn.disabled = true;

    try {
        // Create image element if needed
        let img;
        if (imageSource instanceof HTMLImageElement) {
            img = imageSource;
        } else {
            img = new Image();
            img.src = URL.createObjectURL(imageSource);
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });
        }

        // Show preview area
        elements.uploadArea.style.display = 'none';
        elements.previewArea.style.display = 'block';
        elements.originalImage.src = img.src;

        // Set up canvas
        const canvas = elements.resultCanvas;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        // Run segmentation
        const startTime = performance.now();

        // Set running mode to IMAGE
        await state.segmenter.setOptions({ runningMode: 'IMAGE' });

        const result = state.segmenter.segment(img);
        const inferenceTime = performance.now() - startTime;

        elements.latencyValue.textContent = `${inferenceTime.toFixed(0)}ms`;

        // Apply blur effect
        applyBlurEffect(ctx, img, result.categoryMask, state.blurAmount);

        // Clean up
        result.close();

        elements.processingOverlay.style.display = 'none';
        elements.downloadBtn.disabled = false;

    } catch (error) {
        console.error('Error processing image:', error);
        alert(t('errorProcessing') + '\n\n' + error.message);
        resetImageUI();
    } finally {
        state.isProcessing = false;
    }
}

function applyBlurEffect(ctx, img, mask, blurAmount) {
    const width = img.width;
    const height = img.height;

    // Draw original image
    ctx.drawImage(img, 0, 0);

    // Get mask data
    const maskData = mask.getAsUint8Array();

    // Create temporary canvases
    const blurCanvas = document.createElement('canvas');
    blurCanvas.width = width;
    blurCanvas.height = height;
    const blurCtx = blurCanvas.getContext('2d');

    // Draw blurred version
    blurCtx.filter = `blur(${blurAmount}px)`;
    blurCtx.drawImage(img, 0, 0);
    blurCtx.filter = 'none';

    // Get image data
    const originalData = ctx.getImageData(0, 0, width, height);
    const blurredData = blurCtx.getImageData(0, 0, width, height);

    // Blend based on mask
    const maskWidth = mask.width;
    const maskHeight = mask.height;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Map to mask coordinates
            const maskX = Math.floor(x * maskWidth / width);
            const maskY = Math.floor(y * maskHeight / height);
            const maskIdx = maskY * maskWidth + maskX;

            // Get mask value (0 = background, 1 = person)
            const maskValue = maskData[maskIdx] / 255;

            const idx = (y * width + x) * 4;

            // Blend: show original for person, blurred for background
            originalData.data[idx] = originalData.data[idx] * maskValue + blurredData.data[idx] * (1 - maskValue);
            originalData.data[idx + 1] = originalData.data[idx + 1] * maskValue + blurredData.data[idx + 1] * (1 - maskValue);
            originalData.data[idx + 2] = originalData.data[idx + 2] * maskValue + blurredData.data[idx + 2] * (1 - maskValue);
        }
    }

    ctx.putImageData(originalData, 0, 0);
}

// ========================================
// Camera Processing
// ========================================

async function startCamera() {
    try {
        state.cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480, facingMode: 'user' }
        });

        elements.videoInput.srcObject = state.cameraStream;
        await elements.videoInput.play();

        // Set canvas size
        elements.outputCanvas.width = elements.videoInput.videoWidth;
        elements.outputCanvas.height = elements.videoInput.videoHeight;

        // Update UI
        elements.startCameraBtn.style.display = 'none';
        elements.stopCameraBtn.style.display = 'inline-flex';
        elements.captureBtn.style.display = 'inline-flex';
        elements.stats.style.display = 'flex';

        // Set running mode to VIDEO
        await state.segmenter.setOptions({ runningMode: 'VIDEO' });

        // Start processing loop
        state.lastFrameTime = performance.now();
        processVideoFrame();

    } catch (error) {
        console.error('Error starting camera:', error);
        alert(t('errorCamera') + '\n\n' + error.message);
    }
}

function stopCamera() {
    if (state.animationId) {
        cancelAnimationFrame(state.animationId);
        state.animationId = null;
    }

    if (state.cameraStream) {
        state.cameraStream.getTracks().forEach(track => track.stop());
        state.cameraStream = null;
    }

    elements.videoInput.srcObject = null;
    elements.startCameraBtn.style.display = 'inline-flex';
    elements.stopCameraBtn.style.display = 'none';
    elements.captureBtn.style.display = 'none';
    elements.stats.style.display = 'none';

    // Clear canvas
    const ctx = elements.outputCanvas.getContext('2d');
    ctx.clearRect(0, 0, elements.outputCanvas.width, elements.outputCanvas.height);
}

function processVideoFrame() {
    if (!state.cameraStream) return;

    const startTime = performance.now();

    const video = elements.videoInput;
    const canvas = elements.outputCanvas;
    const ctx = canvas.getContext('2d');

    // Run segmentation
    const result = state.segmenter.segmentForVideo(video, startTime);

    if (result.categoryMask) {
        // Apply blur effect
        applyBlurEffectVideo(ctx, video, result.categoryMask, state.blurAmount);
        result.close();
    } else {
        // Just draw video if no mask
        ctx.drawImage(video, 0, 0);
    }

    // Calculate FPS
    const frameTime = performance.now() - startTime;
    state.frameCount++;

    if (performance.now() - state.lastFrameTime >= 1000) {
        state.fps = state.frameCount;
        state.frameCount = 0;
        state.lastFrameTime = performance.now();
        elements.fpsValue.textContent = state.fps;
    }

    elements.latencyValue.textContent = `${frameTime.toFixed(0)}ms`;

    // Continue loop
    state.animationId = requestAnimationFrame(processVideoFrame);
}

function applyBlurEffectVideo(ctx, video, mask, blurAmount) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    // Draw video frame
    ctx.drawImage(video, 0, 0);

    // Get mask data
    const maskData = mask.getAsUint8Array();

    // Create temporary canvas for blur
    const blurCanvas = document.createElement('canvas');
    blurCanvas.width = width;
    blurCanvas.height = height;
    const blurCtx = blurCanvas.getContext('2d');

    // Draw blurred version
    blurCtx.filter = `blur(${blurAmount}px)`;
    blurCtx.drawImage(video, 0, 0);
    blurCtx.filter = 'none';

    // Get image data
    const originalData = ctx.getImageData(0, 0, width, height);
    const blurredData = blurCtx.getImageData(0, 0, width, height);

    // Blend based on mask
    const maskWidth = mask.width;
    const maskHeight = mask.height;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const maskX = Math.floor(x * maskWidth / width);
            const maskY = Math.floor(y * maskHeight / height);
            const maskIdx = maskY * maskWidth + maskX;

            const maskValue = maskData[maskIdx] / 255;
            const idx = (y * width + x) * 4;

            originalData.data[idx] = originalData.data[idx] * maskValue + blurredData.data[idx] * (1 - maskValue);
            originalData.data[idx + 1] = originalData.data[idx + 1] * maskValue + blurredData.data[idx + 1] * (1 - maskValue);
            originalData.data[idx + 2] = originalData.data[idx + 2] * maskValue + blurredData.data[idx + 2] * (1 - maskValue);
        }
    }

    ctx.putImageData(originalData, 0, 0);
}

function captureFrame() {
    const canvas = elements.outputCanvas;
    canvas.toBlob((blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `background-blur-capture-${Date.now()}.png`;
        link.click();
        URL.revokeObjectURL(link.href);
    }, 'image/png');
}

// ========================================
// UI Helpers
// ========================================

function downloadResult() {
    const canvas = elements.resultCanvas;
    canvas.toBlob((blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `background-blur-${Date.now()}.png`;
        link.click();
        URL.revokeObjectURL(link.href);
    }, 'image/png');
}

function resetImageUI() {
    elements.uploadArea.style.display = 'block';
    elements.previewArea.style.display = 'none';
    elements.processingOverlay.style.display = 'flex';
    elements.downloadBtn.disabled = true;
    elements.fileInput.value = '';
}

function updateBlurAmount() {
    state.blurAmount = parseInt(elements.blurSlider.value);
    elements.blurValue.textContent = `${state.blurAmount}px`;

    // Re-process current image if in preview mode
    if (elements.previewArea.style.display !== 'none' && elements.originalImage.src) {
        processImage(elements.originalImage);
    }
}

// ========================================
// Event Handlers
// ========================================

function handleFileSelect(file) {
    if (!file) return;

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

    // Mode switcher
    elements.modeImage.addEventListener('click', () => showMode('image'));
    elements.modeCamera.addEventListener('click', () => showMode('camera'));

    // Upload area
    elements.uploadArea.addEventListener('click', () => elements.fileInput.click());

    elements.fileInput.addEventListener('change', (e) => {
        handleFileSelect(e.target.files[0]);
    });

    // Drag and drop
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
        if (e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    });

    // Camera controls
    elements.startCameraBtn.addEventListener('click', startCamera);
    elements.stopCameraBtn.addEventListener('click', stopCamera);
    elements.captureBtn.addEventListener('click', captureFrame);

    // Blur slider
    elements.blurSlider.addEventListener('input', updateBlurAmount);

    // Actions
    elements.downloadBtn.addEventListener('click', downloadResult);
    elements.resetBtn.addEventListener('click', resetImageUI);
}

// ========================================
// Initialization
// ========================================

function init() {
    // Set initial language
    const browserLang = navigator.language;
    if (browserLang.startsWith('zh')) {
        setLanguage('zh-TW');
    } else {
        setLanguage('en');
    }

    // Initialize event listeners
    initEventListeners();

    // Set initial blur value display
    elements.blurValue.textContent = `${state.blurAmount}px`;

    console.log('AI Background Blur Tool initialized');
}

init();
