/**
 * AI Virtual Makeup - Tool #046
 * Awesome AI Local Tools
 *
 * Uses MediaPipe Face Landmarker for virtual makeup application
 */

// ========================================
// Internationalization (i18n)
// ========================================

const translations = {
    'zh-TW': {
        title: '虛擬化妝',
        subtitle: 'AI 智慧人臉試妝，口紅、眼影、腮紅',
        modelNotLoaded: '模型未載入',
        modelLoading: '模型載入中...',
        modelReady: '模型已就緒',
        modelError: '模型載入失敗',
        loadModel: '載入模型',
        uploadText: '拖放圖片到此處或點擊上傳',
        uploadHint: '支援 PNG, JPG, WebP',
        processing: '處理中...',
        lips: '唇彩',
        cheeks: '腮紅',
        brows: '眉毛',
        lipstickColor: '口紅顏色',
        blushColor: '腮紅顏色',
        browColor: '眉毛顏色',
        intensity: '濃度',
        reset: '重置',
        download: '下載',
        howItWorks: '如何運作？',
        howItWorksDesc: '使用 MediaPipe Face Landmarker 偵測五官位置，並在相應區域（嘴唇、臉頰、眉毛）繪製半透明色彩層。',
        toolNumber: '工具 #046',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        errorFileType: '請上傳 PNG、JPG 或 WebP 格式的圖片',
        errorProcessing: '處理圖片時發生錯誤'
    },
    'en': {
        title: 'Virtual Makeup',
        subtitle: 'AI Virtual Makeup for Lips, Cheeks, and Brows',
        modelNotLoaded: 'Model not loaded',
        modelLoading: 'Loading model...',
        modelReady: 'Model ready',
        modelError: 'Model loading failed',
        loadModel: 'Load Model',
        uploadText: 'Drag & drop image here or click to upload',
        uploadHint: 'Supports PNG, JPG, WebP',
        processing: 'Processing...',
        lips: 'Lips',
        cheeks: 'Cheeks',
        brows: 'Brows',
        lipstickColor: 'Lipstick Color',
        blushColor: 'Blush Color',
        browColor: 'Brow Color',
        intensity: 'Intensity',
        reset: 'Reset',
        download: 'Download',
        howItWorks: 'How It Works',
        howItWorksDesc: 'Uses MediaPipe Face Landmarker to detect facial features and applies translucent color layers to lips, cheeks, and eyebrows.',
        toolNumber: 'Tool #046',
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
    landmarker: null,
    isModelLoaded: false,
    isProcessing: false,
    currentImage: null,
    landmarks: null,
    settings: {
        lips: { color: null, intensity: 0.5 },
        cheeks: { color: null, intensity: 0.3 },
        brows: { color: null, intensity: 0.5 }
    }
};

const PALETTES = {
    lips: ['#9b2335', '#c2185b', '#e91e63', '#f48fb1', '#ffc107', '#ff5722', '#795548', '#3e2723', '#212121', '#b71c1c'],
    cheeks: ['#f48fb1', '#f06292', '#e91e63', '#d81b60', '#ff8a80', '#ff5252', '#ffab91', '#ff7043', '#ffcc80', '#ffb74d'],
    brows: ['#212121', '#424242', '#616161', '#795548', '#5d4037', '#4e342e', '#3e2723', '#8d6e63', '#a1887f', '#d7ccc8']
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
    tabs: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),
    resetBtn: document.getElementById('resetBtn'),
    downloadBtn: document.getElementById('downloadBtn'),
    sliders: {
        lips: document.getElementById('lipsIntensitySlider'),
        cheeks: document.getElementById('cheeksIntensitySlider'),
        brows: document.getElementById('browsIntensitySlider')
    },
    values: {
        lips: document.getElementById('lipsIntensityValue'),
        cheeks: document.getElementById('cheeksIntensityValue'),
        brows: document.getElementById('browsIntensityValue')
    },
    palettes: {
        lips: document.getElementById('lipsPalette'),
        cheeks: document.getElementById('cheeksPalette'),
        brows: document.getElementById('browsPalette')
    }
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
            outputFaceBlendshapes: true,
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

    // Show preview area
    elements.uploadArea.style.display = 'none';
    elements.previewArea.style.display = 'block';
    elements.controlsArea.style.display = 'flex';
    elements.downloadBtn.disabled = false;

    // Detect face
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
            state.landmarks = results.faceLandmarks[0];
        } else {
            alert('No face detected.');
            state.landmarks = null;
        }

    } catch (error) {
        console.error('Error in face detection:', error);
        alert(t('errorProcessing'));
    } finally {
        state.isProcessing = false;
        elements.processingOverlay.style.display = 'none';
    }
}

function renderImage() {
    if (!state.currentImage) return;

    const canvas = elements.outputCanvas;
    canvas.width = state.currentImage.width;
    canvas.height = state.currentImage.height;
    const ctx = canvas.getContext('2d');

    // Draw original image
    ctx.drawImage(state.currentImage, 0, 0);

    if (state.landmarks) {
        // Draw makeup
        drawLips(ctx, state.landmarks);
        drawCheeks(ctx, state.landmarks);
        drawBrows(ctx, state.landmarks);
    }
}

// MediaPipe Face Mesh Indices
const INDICES = {
    lips: [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291], // Outer lips
    leftCheek: [205, 187, 147, 123, 117, 111, 116, 203, 205], // Approx cheek area
    rightCheek: [425, 411, 376, 352, 346, 340, 345, 423, 425],
    leftEyebrow: [70, 63, 105, 66, 107, 55, 65, 52, 53, 46],
    rightEyebrow: [336, 296, 334, 293, 300, 276, 283, 282, 295, 285]
};

// More accurate cheek indices could be derived or just simple oval around cheekbones (e.g., 234 and 454 are outer face, 116/345 are under eyes)
// Let's use simple circles/ovals for cheeks based on landmarks

function drawLips(ctx, landmarks) {
    const settings = state.settings.lips;
    if (!settings.color) return;

    ctx.save();
    ctx.globalAlpha = settings.intensity;
    ctx.fillStyle = settings.color;
    ctx.globalCompositeOperation = 'multiply'; // Multiply blends better for lipstick

    drawPath(ctx, landmarks, INDICES.lips, true);

    // Optional: Subtract inner lips (mouth opening) if needed?
    // Inner lips: 78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 415, 310, 311, 312, 13, 82, 81, 80, 191, 78
    // If mouth is open, we shouldn't paint teeth.

    const innerLips = [78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95, 78];
    ctx.globalCompositeOperation = 'destination-out';
    drawPath(ctx, landmarks, innerLips, true);

    ctx.restore();
}

function drawCheeks(ctx, landmarks) {
    const settings = state.settings.cheeks;
    if (!settings.color) return;

    ctx.save();
    ctx.globalAlpha = settings.intensity;
    ctx.fillStyle = settings.color;
    ctx.filter = 'blur(20px)'; // Heavy blur for blush
    ctx.globalCompositeOperation = 'multiply';

    // Left Cheek (approx center around 116 or 123)
    const leftCheekCenter = landmarks[123];
    // Right Cheek (approx center around 352)
    const rightCheekCenter = landmarks[352];

    const radius = distance(landmarks[234], landmarks[454]) * 0.1; // 10% of face width

    ctx.beginPath();
    ctx.arc(leftCheekCenter.x * ctx.canvas.width, leftCheekCenter.y * ctx.canvas.height, radius, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(rightCheekCenter.x * ctx.canvas.width, rightCheekCenter.y * ctx.canvas.height, radius, 0, 2 * Math.PI);
    ctx.fill();

    ctx.restore();
}

function drawBrows(ctx, landmarks) {
    const settings = state.settings.brows;
    if (!settings.color) return;

    ctx.save();
    ctx.globalAlpha = settings.intensity;
    ctx.fillStyle = settings.color;
    ctx.globalCompositeOperation = 'multiply'; // or darken

    drawPath(ctx, landmarks, INDICES.leftEyebrow, true);
    drawPath(ctx, landmarks, INDICES.rightEyebrow, true);

    ctx.restore();
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

function distance(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

// ========================================
// UI Initialization
// ========================================

function initPalettes() {
    Object.keys(PALETTES).forEach(type => {
        const container = elements.palettes[type];
        PALETTES[type].forEach(color => {
            const div = document.createElement('div');
            div.className = 'color-swatch';
            div.style.backgroundColor = color;
            div.addEventListener('click', () => {
                selectColor(type, color, div);
            });
            container.appendChild(div);
        });
    });
}

function selectColor(type, color, element) {
    state.settings[type].color = color;

    // Update active class in this palette
    const container = elements.palettes[type];
    container.querySelectorAll('.color-swatch').forEach(el => el.classList.remove('active'));
    if (element) element.classList.add('active');
    else {
        // If element is null (e.g. reset), remove all active
    }

    renderImage();
}

function initEventListeners() {
    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    elements.loadModelBtn.addEventListener('click', loadModel);

    // Tab switching
    elements.tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            elements.tabs.forEach(t => t.classList.remove('active'));
            elements.tabContents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(`${tab.dataset.tab}-tab`).classList.add('active');
        });
    });

    elements.uploadArea.addEventListener('click', () => elements.fileInput.click());
    elements.fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) handleImageUpload(e.target.files[0]);
    });

    // Sliders
    Object.keys(elements.sliders).forEach(key => {
        elements.sliders[key].addEventListener('input', (e) => {
            state.settings[key].intensity = parseInt(e.target.value) / 100;
            elements.values[key].textContent = `${e.target.value}%`;
            requestAnimationFrame(renderImage);
        });
    });

    elements.resetBtn.addEventListener('click', () => {
        state.settings.lips = { color: null, intensity: 0.5 };
        state.settings.cheeks = { color: null, intensity: 0.3 };
        state.settings.brows = { color: null, intensity: 0.5 };

        // Reset UI
        document.querySelectorAll('.color-swatch').forEach(el => el.classList.remove('active'));

        elements.sliders.lips.value = 50; elements.values.lips.textContent = '50%';
        elements.sliders.cheeks.value = 30; elements.values.cheeks.textContent = '30%';
        elements.sliders.brows.value = 50; elements.values.brows.textContent = '50%';

        renderImage();
    });

    elements.downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'makeup-result.png';
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

    initPalettes();
    initEventListeners();
}

init();
