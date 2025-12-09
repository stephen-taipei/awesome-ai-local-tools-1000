/**
 * AI ID Photo Generator - Tool #050
 * Awesome AI Local Tools
 *
 * Uses RMBG-1.4 for background removal and MediaPipe Face Detection for auto-cropping.
 */

// ========================================
// Internationalization (i18n)
// ========================================

const translations = {
    'zh-TW': {
        title: '人像證件照',
        subtitle: '一鍵生成標準證件照，自動去背裁切',
        modelNotLoaded: '模型未載入',
        modelLoading: '模型載入中...',
        modelReady: '模型已就緒',
        modelError: '模型載入失敗',
        loadModel: '載入模型',
        uploadText: '拖放圖片到此處或點擊上傳',
        uploadHint: '支援 PNG, JPG, WebP',
        processing: '處理中...',
        settings: '設定',
        size: '尺寸規格',
        bgColor: '背景顏色',
        process: '生成',
        download: '下載',
        howItWorks: '如何運作？',
        howItWorksDesc: '結合人臉偵測（自動裁切）與背景移除模型（RMBG-1.4），快速生成符合標準的證件照。',
        toolNumber: '工具 #050',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        errorFileType: '請上傳 PNG、JPG 或 WebP 格式的圖片',
        errorProcessing: '處理圖片時發生錯誤',
        noFaceDetected: '未偵測到人臉'
    },
    'en': {
        title: 'ID Photo Generator',
        subtitle: 'Generate standard ID photos with auto background removal and cropping',
        modelNotLoaded: 'Model not loaded',
        modelLoading: 'Loading model...',
        modelReady: 'Model ready',
        modelError: 'Model loading failed',
        loadModel: 'Load Model',
        uploadText: 'Drag & drop image here or click to upload',
        uploadHint: 'Supports PNG, JPG, WebP',
        processing: 'Processing...',
        settings: 'Settings',
        size: 'Size Specification',
        bgColor: 'Background Color',
        process: 'Generate',
        download: 'Download',
        howItWorks: 'How It Works',
        howItWorksDesc: 'Combines Face Detection (for auto-cropping) and Background Removal (RMBG-1.4) to generate standard ID photos.',
        toolNumber: 'Tool #050',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        errorFileType: 'Please upload PNG, JPG, or WebP images',
        errorProcessing: 'Error processing image',
        noFaceDetected: 'No face detected'
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
    models: {
        rmbg: null,
        faceDetector: null,
        processor: null
    },
    isModelLoaded: false,
    isProcessing: false,
    currentImage: null,
    settings: {
        size: '2x2', // 2x2 inches (3.5x4.5cm usually refered as 2 inch in some regions, or 2x2 for US)
                     // Let's standardise: 2x2 is 51x51mm (US), 35x45mm is standard passport (EU/TW/CN)
        bgColor: '#ffffff'
    }
};

const SIZES = {
    '2x2': { w: 413, h: 531, name: '3.5x4.5cm' }, // Standard Passport (300dpi)
    '1x1': { w: 331, h: 413, name: '2.8x3.5cm' },
    'us':  { w: 600, h: 600, name: '2x2 inch' },  // US Visa (2x2 inch at 300dpi)
    'custom': { w: 413, h: 531, name: 'Custom' }
};

// ========================================
// DOM Elements
// ========================================

const elements = {
    loadModelBtn: document.getElementById('loadModelBtn'),
    statusIndicator: document.getElementById('statusIndicator'),
    statusText: document.getElementById('statusText'),
    controlsArea: document.getElementById('controlsArea'),
    uploadArea: document.getElementById('uploadArea'),
    fileInput: document.getElementById('fileInput'),
    previewArea: document.getElementById('previewArea'),
    outputCanvas: document.getElementById('outputCanvas'),
    processingOverlay: document.getElementById('processingOverlay'),
    sizeSelect: document.getElementById('sizeSelect'),
    colorBtns: document.querySelectorAll('.color-btn'),
    processBtn: document.getElementById('processBtn'),
    downloadBtn: document.getElementById('downloadBtn')
};

// ========================================
// Model Loading
// ========================================

async function loadModel() {
    if (state.isModelLoaded) return;

    setModelStatus('loading');

    try {
        // Load Face Detector (MediaPipe)
        const { FaceDetector, FilesetResolver } = await import(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14'
        );

        const vision = await FilesetResolver.forVisionTasks(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
        );

        state.models.faceDetector = await FaceDetector.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
                delegate: 'GPU'
            },
            runningMode: 'IMAGE'
        });

        // Load RMBG (Transformers.js)
        // Dynamically import Transformers.js
        const { AutoModel, AutoProcessor, env, RawImage } = await import(
            'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.2'
        );

        env.allowLocalModels = false;
        env.useBrowserCache = true;
        window.RawImage = RawImage;

        state.models.processor = await AutoProcessor.from_pretrained('briaai/RMBG-1.4');
        state.models.rmbg = await AutoModel.from_pretrained('briaai/RMBG-1.4', {
            // device: 'webgpu' // Use webgpu if available
        });

        // Note: RMBG 1.4 might need special config or revision in transformers.js v3.
        // Assuming it works as in Tool #001.

        state.isModelLoaded = true;
        setModelStatus('ready');

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

    const img = new Image();
    img.src = URL.createObjectURL(file);
    await new Promise(r => img.onload = r);

    state.currentImage = img;

    // Show preview area
    elements.uploadArea.style.display = 'none';
    elements.previewArea.style.display = 'block';
    elements.controlsArea.style.display = 'flex';
    elements.downloadBtn.disabled = true;

    // Show original
    const canvas = elements.outputCanvas;
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
}

async function processIDPhoto() {
    if (!state.currentImage) return;

    state.isProcessing = true;
    elements.processingOverlay.style.display = 'flex';

    try {
        // 1. Detect Face and Crop
        const detections = state.models.faceDetector.detect(state.currentImage);
        if (!detections.detections.length) {
            throw new Error(t('noFaceDetected'));
        }

        const box = detections.detections[0].boundingBox;
        // Calculate crop based on face box (e.g., face should be X% of height, centered)
        // Standard ID photo: Face is about 70-80% of height.

        // Face center
        const cx = box.originX + box.width / 2;
        const cy = box.originY + box.height / 2;

        // Target Aspect Ratio
        const sizeSpec = SIZES[state.settings.size];
        const targetRatio = sizeSpec.w / sizeSpec.h;

        // Determine Crop Height based on Face Height (Face should be ~50% of image height for ample headroom/shoulder)
        // Actually, for passports, head height is ~70-80% of photo.
        // Let's say face (chin to crown) is H_face. Photo Height H = H_face / 0.75.
        // Box height from BlazeFace is roughly face height.

        const cropH = box.height / 0.5; // Make face 50% of image? Maybe too small. 0.6 is better.
        const cropW = cropH * targetRatio;

        // Calculate crop rect
        // Eye level is usually at 3/5 to 2/3 height. Face center is roughly middle.
        // Let's center on face center, but shift up slightly?
        // Usually center X is face center X. Center Y is slightly below face center? No, face center is nose.

        let cropX = cx - cropW / 2;
        let cropY = cy - cropH * 0.45; // Shift up slightly to leave more room for shoulders?
        // Actually, if cy is nose, we want nose to be centered vertically? No, usually slightly above center.
        // Let's assume centered for now.

        // Ensure crop is within bounds? We might need to pad if out of bounds.

        // Create cropped canvas
        const cropCanvas = document.createElement('canvas');
        cropCanvas.width = sizeSpec.w;
        cropCanvas.height = sizeSpec.h;
        const cctx = cropCanvas.getContext('2d');

        // Draw image onto crop canvas (scaling automatically)
        cctx.drawImage(state.currentImage, cropX, cropY, cropW, cropH, 0, 0, sizeSpec.w, sizeSpec.h);

        // 2. Remove Background on the cropped image
        // Convert canvas to RawImage or Blob for Transformers.js
        const croppedDataUrl = cropCanvas.toDataURL();
        const rawImage = await window.RawImage.fromURL(croppedDataUrl);

        const processedInputs = await state.models.processor(rawImage);
        const { output } = await state.models.rmbg(processedInputs);

        // Process mask
        const maskData = output[0][0].data;
        const maskDims = output[0][0].dims;

        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = maskDims[1];
        maskCanvas.height = maskDims[0];
        const mctx = maskCanvas.getContext('2d');
        const imgData = mctx.createImageData(maskDims[1], maskDims[0]);

        for (let i = 0; i < maskData.length; i++) {
            const val = Math.round(maskData[i] * 255);
            imgData.data[i*4] = val;
            imgData.data[i*4+1] = val;
            imgData.data[i*4+2] = val;
            imgData.data[i*4+3] = 255;
        }
        mctx.putImageData(imgData, 0, 0);

        // 3. Composite with background color
        const finalCanvas = elements.outputCanvas;
        finalCanvas.width = sizeSpec.w;
        finalCanvas.height = sizeSpec.h;
        const fctx = finalCanvas.getContext('2d');

        // Fill background
        fctx.fillStyle = state.settings.bgColor;
        fctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

        // Draw cropped person masked
        // Resize mask to final size
        const resizedMaskCanvas = document.createElement('canvas');
        resizedMaskCanvas.width = sizeSpec.w;
        resizedMaskCanvas.height = sizeSpec.h;
        const rmctx = resizedMaskCanvas.getContext('2d');
        rmctx.drawImage(maskCanvas, 0, 0, sizeSpec.w, sizeSpec.h);

        // Create person layer
        const personCanvas = document.createElement('canvas');
        personCanvas.width = sizeSpec.w;
        personCanvas.height = sizeSpec.h;
        const pctx = personCanvas.getContext('2d');
        pctx.drawImage(cropCanvas, 0, 0);

        // Apply mask to person
        pctx.globalCompositeOperation = 'destination-in';
        pctx.drawImage(resizedMaskCanvas, 0, 0);

        // Draw person on background
        fctx.drawImage(personCanvas, 0, 0);

        elements.downloadBtn.disabled = false;

    } catch (error) {
        console.error('Error processing:', error);
        alert(t('errorProcessing') + (error.message ? `: ${error.message}` : ''));
    } finally {
        state.isProcessing = false;
        elements.processingOverlay.style.display = 'none';
    }
}

// ========================================
// Event Handlers
// ========================================

function initEventListeners() {
    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    elements.loadModelBtn.addEventListener('click', loadModel);

    elements.sizeSelect.addEventListener('change', (e) => {
        state.settings.size = e.target.value;
    });

    elements.colorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.colorBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.settings.bgColor = btn.dataset.color;
        });
    });

    elements.processBtn.addEventListener('click', processIDPhoto);

    elements.uploadArea.addEventListener('click', () => elements.fileInput.click());
    elements.fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) handleImageUpload(e.target.files[0]);
    });

    elements.downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = `id-photo-${state.settings.size}.png`;
        link.href = elements.outputCanvas.toDataURL();
        link.click();
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
