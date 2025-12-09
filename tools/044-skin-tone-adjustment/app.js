/**
 * AI Skin Tone Adjustment - Tool #044
 * Awesome AI Local Tools
 *
 * Uses MediaPipe Face Landmarker for skin segmentation and adjustment
 */

// ========================================
// Internationalization (i18n)
// ========================================

const translations = {
    'zh-TW': {
        title: '膚色調整',
        subtitle: '智慧調整膚色，美白或健康小麥色',
        modelNotLoaded: '模型未載入',
        modelLoading: '模型載入中...',
        modelReady: '模型已就緒',
        modelError: '模型載入失敗',
        loadModel: '載入模型',
        uploadText: '拖放圖片到此處或點擊上傳',
        uploadHint: '支援 PNG, JPG, WebP',
        processing: '處理中...',
        adjustments: '調整選項',
        brightness: '美白 (亮度)',
        warmth: '色溫 (冷/暖)',
        saturation: '飽和度',
        reset: '重置',
        download: '下載',
        howItWorks: '如何運作？',
        howItWorksDesc: '使用 MediaPipe Face Landmarker 偵測臉部區域，並針對皮膚區域進行色彩調整，保留眼睛與嘴唇的原色。',
        toolNumber: '工具 #044',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        errorFileType: '請上傳 PNG、JPG 或 WebP 格式的圖片',
        errorProcessing: '處理圖片時發生錯誤',
        noFaceDetected: '未偵測到人臉，請使用清晰的正面人像照片'
    },
    'en': {
        title: 'Skin Tone Adjustment',
        subtitle: 'Intelligent skin tone adjustment, whitening or healthy tan',
        modelNotLoaded: 'Model not loaded',
        modelLoading: 'Loading model...',
        modelReady: 'Model ready',
        modelError: 'Model loading failed',
        loadModel: 'Load Model',
        uploadText: 'Drag & drop image here or click to upload',
        uploadHint: 'Supports PNG, JPG, WebP',
        processing: 'Processing...',
        adjustments: 'Adjustments',
        brightness: 'Whitening (Brightness)',
        warmth: 'Tone (Warmth)',
        saturation: 'Saturation',
        reset: 'Reset',
        download: 'Download',
        howItWorks: 'How It Works',
        howItWorksDesc: 'Uses MediaPipe Face Landmarker to detect face areas and applies color adjustments to the skin while preserving eyes and lips.',
        toolNumber: 'Tool #044',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        errorFileType: 'Please upload PNG, JPG, or WebP images',
        errorProcessing: 'Error processing image',
        noFaceDetected: 'No face detected. Please use a clear portrait photo.'
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
    landmarker: null,
    isModelLoaded: false,
    isProcessing: false,
    currentImage: null,
    faceMask: null,
    settings: {
        brightness: 0,
        warmth: 0,
        saturation: 0
    }
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
    sliders: {
        brightness: document.getElementById('brightnessSlider'),
        warmth: document.getElementById('warmthSlider'),
        saturation: document.getElementById('saturationSlider')
    },
    values: {
        brightness: document.getElementById('brightnessValue'),
        warmth: document.getElementById('warmthValue'),
        saturation: document.getElementById('saturationValue')
    },
    resetBtn: document.getElementById('resetBtn'),
    downloadBtn: document.getElementById('downloadBtn')
};

// ========================================
// Model Loading
// ========================================

async function loadModel() {
    if (state.isModelLoaded) return;

    setModelStatus('loading');

    try {
        const { FaceLandmarker, FilesetResolver } = await import(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14'
        );

        const vision = await FilesetResolver.forVisionTasks(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
        );

        state.landmarker = await FaceLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
                delegate: 'GPU'
            },
            outputFaceBlendshapes: false,
            runningMode: 'IMAGE',
            numFaces: 1
        });

        state.isModelLoaded = true;
        setModelStatus('ready');
        console.log('Face Landmarker loaded successfully');

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
    state.settings = { brightness: 0, warmth: 0, saturation: 0 };
    updateSliders();

    // Show preview area
    elements.uploadArea.style.display = 'none';
    elements.previewArea.style.display = 'block';
    elements.controlsArea.style.display = 'flex';
    elements.downloadBtn.disabled = false;

    // Detect face and create mask
    await processFaceDetection();

    // Initial render
    renderImage();
}

async function processFaceDetection() {
    state.isProcessing = true;
    elements.processingOverlay.style.display = 'flex';

    try {
        const results = state.landmarker.detect(state.currentImage);

        if (results.faceLandmarks.length > 0) {
            // Create mask from landmarks
            state.faceMask = createFaceMask(results.faceLandmarks[0], state.currentImage.width, state.currentImage.height);
        } else {
            alert(t('noFaceDetected'));
            state.faceMask = null;
        }

    } catch (error) {
        console.error('Error in face detection:', error);
        alert(t('errorProcessing'));
    } finally {
        state.isProcessing = false;
        elements.processingOverlay.style.display = 'none';
    }
}

function createFaceMask(landmarks, width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);

    // Draw face oval
    ctx.fillStyle = 'white';
    ctx.beginPath();
    // FaceOval indices: 10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109
    // MediaPipe Face Mesh indices are complex. We'll use the face oval contour.
    // Actually, FaceLandmarker.FACE_LANDMARKS_FACE_OVAL is available in some versions, but we might need to rely on specific indices.
    // Standard MediaPipe Face Mesh oval indices:
    const faceOvalIndices = [
        10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109
    ];

    drawPath(ctx, landmarks, faceOvalIndices, true);

    // Exclude eyes and lips
    ctx.globalCompositeOperation = 'destination-out';

    // Left Eye
    const leftEyeIndices = [33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7];
    drawPath(ctx, landmarks, leftEyeIndices, true);

    // Right Eye
    const rightEyeIndices = [362, 398, 384, 385, 386, 387, 388, 466, 263, 249, 390, 373, 374, 380, 381, 382];
    drawPath(ctx, landmarks, rightEyeIndices, true);

    // Lips
    const lipsIndices = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291]; // Outer lips
    drawPath(ctx, landmarks, lipsIndices, true);

    // Soften mask edges
    ctx.filter = 'blur(10px)'; // Blur to feather edges

    return canvas;
}

function drawPath(ctx, landmarks, indices, closePath) {
    if (indices.length === 0) return;

    ctx.beginPath();
    const firstPoint = landmarks[indices[0]];
    ctx.moveTo(firstPoint.x * ctx.canvas.width, firstPoint.y * ctx.canvas.height);

    for (let i = 1; i < indices.length; i++) {
        const point = landmarks[indices[i]];
        ctx.lineTo(point.x * ctx.canvas.width, point.y * ctx.canvas.height);
    }

    if (closePath) ctx.closePath();
    ctx.fill();
}

function renderImage() {
    if (!state.currentImage) return;

    const canvas = elements.outputCanvas;
    canvas.width = state.currentImage.width;
    canvas.height = state.currentImage.height;
    const ctx = canvas.getContext('2d');

    // Draw original image
    ctx.drawImage(state.currentImage, 0, 0);

    if (state.faceMask) {
        // Create an adjusted version of the image
        const adjustedCanvas = document.createElement('canvas');
        adjustedCanvas.width = canvas.width;
        adjustedCanvas.height = canvas.height;
        const actx = adjustedCanvas.getContext('2d');

        actx.drawImage(state.currentImage, 0, 0);

        // Get image data
        const imageData = actx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Apply adjustments
        const brightness = state.settings.brightness;
        const warmth = state.settings.warmth;
        const saturation = state.settings.saturation;

        for (let i = 0; i < data.length; i += 4) {
            // Apply Brightness
            if (brightness !== 0) {
                data[i] += brightness;     // R
                data[i+1] += brightness;   // G
                data[i+2] += brightness;   // B
            }

            // Apply Warmth (Adjust R and B)
            if (warmth !== 0) {
                data[i] += warmth;       // R increases for warmth
                data[i+2] -= warmth;     // B decreases for warmth
            }

            // Apply Saturation
            if (saturation !== 0) {
                const gray = 0.2989 * data[i] + 0.5870 * data[i+1] + 0.1140 * data[i+2];
                data[i] = -gray * (saturation / 100) + data[i] * (1 + saturation / 100);
                data[i+1] = -gray * (saturation / 100) + data[i+1] * (1 + saturation / 100);
                data[i+2] = -gray * (saturation / 100) + data[i+2] * (1 + saturation / 100);
            }
        }
        actx.putImageData(imageData, 0, 0);

        // Apply mask
        const maskCanvas = state.faceMask;

        // We want to overlay the adjusted image onto the original ONLY where the mask is white
        // Use globalCompositeOperation

        // Draw the adjusted image over the original
        ctx.save();
        ctx.drawImage(maskCanvas, 0, 0); // Draw mask

        // Use 'source-in' to keep adjusted image only where mask is
        ctx.globalCompositeOperation = 'source-in';
        ctx.drawImage(adjustedCanvas, 0, 0);

        // Now we have the adjusted skin on a transparent background

        // Wait, we need to blend this ON TOP of the original image
        // Let's redo:
        // 1. Draw original image (done)
        // 2. Create a temporary canvas with: Adjusted Image masked by Face Mask

        ctx.restore();

        // Correct approach for blending:
        // 1. Draw mask on temp canvas
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tctx = tempCanvas.getContext('2d');

        tctx.drawImage(maskCanvas, 0, 0);
        tctx.globalCompositeOperation = 'source-in';
        tctx.drawImage(adjustedCanvas, 0, 0);

        // 2. Draw temp canvas onto main canvas
        ctx.drawImage(tempCanvas, 0, 0);
    }
}

function updateSliders() {
    elements.sliders.brightness.value = state.settings.brightness;
    elements.sliders.warmth.value = state.settings.warmth;
    elements.sliders.saturation.value = state.settings.saturation;

    elements.values.brightness.textContent = state.settings.brightness;
    elements.values.warmth.textContent = state.settings.warmth;
    elements.values.saturation.textContent = state.settings.saturation;
}

// ========================================
// Event Handlers
// ========================================

function initEventListeners() {
    // Language
    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    // Model Loading
    elements.loadModelBtn.addEventListener('click', loadModel);

    // Upload
    elements.uploadArea.addEventListener('click', () => elements.fileInput.click());
    elements.fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) handleImageUpload(e.target.files[0]);
    });

    // Sliders
    Object.keys(elements.sliders).forEach(key => {
        elements.sliders[key].addEventListener('input', (e) => {
            state.settings[key] = parseInt(e.target.value);
            elements.values[key].textContent = state.settings[key];
            requestAnimationFrame(renderImage);
        });
    });

    // Buttons
    elements.resetBtn.addEventListener('click', () => {
        state.settings = { brightness: 0, warmth: 0, saturation: 0 };
        updateSliders();
        renderImage();
    });

    elements.downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'skin-tone-adjusted.png';
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

// ========================================
// Init
// ========================================

async function init() {
    const browserLang = navigator.language;
    if (browserLang.startsWith('zh')) setLanguage('zh-TW');
    else setLanguage('en');

    initEventListeners();

    // Auto load model if possible or wait for user
    // We'll wait for user click to save resources
}

init();
