/**
 * AI Background Color Fill - Tool #004
 * Awesome AI Local Tools
 *
 * Remove background and fill with solid colors or gradients
 * Uses lightweight segmentation model via Transformers.js
 */

// ========================================
// Internationalization (i18n)
// ========================================

const translations = {
    'zh-TW': {
        title: 'AI 背景顏色填充',
        subtitle: '移除背景，填充純色或漸層色彩',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        modelNotLoaded: '模型未載入',
        modelLoading: '模型載入中...',
        modelReady: '模型已就緒',
        modelError: '模型載入失敗',
        loadModel: '載入模型',
        downloading: '正在下載模型...',
        progressNote: '首次載入需下載約 4.7MB，之後會快取至本地',
        uploadText: '拖放圖片到此處或點擊上傳',
        uploadHint: '支援 PNG、JPG、WebP',
        original: '原圖',
        result: '填充結果',
        processing: '正在處理中...',
        backgroundSettings: '背景設定',
        fillMode: '填充模式：',
        solid: '純色',
        gradient: '漸層',
        selectColor: '選擇顏色：',
        colorStart: '起始顏色：',
        colorEnd: '結束顏色：',
        direction: '方向：',
        presets: '預設漸層：',
        download: '下載結果',
        downloadTransparent: '下載透明背景',
        uploadAnother: '上傳其他圖片',
        howItWorks: '如何運作？',
        aiModel: 'AI 模型',
        aiModelDesc: '使用輕量級 U2-Net 模型精確分離前景與背景',
        colorFill: '顏色填充',
        colorFillDesc: '支援純色、漸層等多種背景填充方式',
        fast: '快速處理',
        fastDesc: '模型僅 4.7MB，載入快速，即時預覽',
        privacy: '隱私保護',
        privacyDesc: '所有處理在本地完成，圖片不上傳',
        techSpecs: '技術規格',
        specModel: 'AI 模型',
        specFormat: '模型格式',
        specSize: '模型大小',
        specRuntime: '推論引擎',
        backToHome: '返回首頁',
        toolNumber: '工具 #004',
        sourceCode: '原始碼',
        copyright: 'Awesome AI Local Tools © 2024',
        errorFileType: '請上傳 PNG、JPG 或 WebP 格式的圖片',
        errorProcessing: '處理圖片時發生錯誤'
    },
    'en': {
        title: 'AI Background Color Fill',
        subtitle: 'Remove background and fill with solid colors or gradients',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        modelNotLoaded: 'Model not loaded',
        modelLoading: 'Loading model...',
        modelReady: 'Model ready',
        modelError: 'Model loading failed',
        loadModel: 'Load Model',
        downloading: 'Downloading model...',
        progressNote: 'First load requires ~4.7MB download, cached locally afterwards',
        uploadText: 'Drag & drop image here or click to upload',
        uploadHint: 'Supports PNG, JPG, WebP',
        original: 'Original',
        result: 'Result',
        processing: 'Processing...',
        backgroundSettings: 'Background Settings',
        fillMode: 'Fill Mode:',
        solid: 'Solid',
        gradient: 'Gradient',
        selectColor: 'Select Color:',
        colorStart: 'Start Color:',
        colorEnd: 'End Color:',
        direction: 'Direction:',
        presets: 'Preset Gradients:',
        download: 'Download Result',
        downloadTransparent: 'Download Transparent',
        uploadAnother: 'Upload Another',
        howItWorks: 'How It Works',
        aiModel: 'AI Model',
        aiModelDesc: 'Uses lightweight U2-Net model for precise foreground-background separation',
        colorFill: 'Color Fill',
        colorFillDesc: 'Supports solid colors, gradients, and more fill options',
        fast: 'Fast Processing',
        fastDesc: 'Model only 4.7MB, quick loading with instant preview',
        privacy: 'Privacy',
        privacyDesc: 'All processing done locally, images never uploaded',
        techSpecs: 'Technical Specs',
        specModel: 'AI Model',
        specFormat: 'Model Format',
        specSize: 'Model Size',
        specRuntime: 'Inference Engine',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #004',
        sourceCode: 'Source Code',
        copyright: 'Awesome AI Local Tools © 2024',
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
    maskData: null,
    originalImage: null,
    fillMode: 'solid',
    solidColor: '#ffffff',
    gradientStart: '#667eea',
    gradientEnd: '#764ba2',
    gradientDirection: 'to bottom'
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
    uploadArea: document.getElementById('uploadArea'),
    fileInput: document.getElementById('fileInput'),
    editorArea: document.getElementById('editorArea'),
    originalImage: document.getElementById('originalImage'),
    resultCanvas: document.getElementById('resultCanvas'),
    processingOverlay: document.getElementById('processingOverlay'),
    modeSolid: document.getElementById('modeSolid'),
    modeGradient: document.getElementById('modeGradient'),
    solidControls: document.getElementById('solidControls'),
    gradientControls: document.getElementById('gradientControls'),
    solidColor: document.getElementById('solidColor'),
    solidColorHex: document.getElementById('solidColorHex'),
    gradientStart: document.getElementById('gradientStart'),
    gradientEnd: document.getElementById('gradientEnd'),
    downloadBtn: document.getElementById('downloadBtn'),
    downloadTransparentBtn: document.getElementById('downloadTransparentBtn'),
    resetBtn: document.getElementById('resetBtn')
};

// ========================================
// Model Loading
// ========================================

async function loadModel() {
    if (state.isModelLoaded) return;

    setModelStatus('loading');
    elements.progressContainer.style.display = 'block';

    try {
        const { AutoModel, AutoProcessor, env } = await import(
            'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.2'
        );

        env.allowLocalModels = false;
        env.useBrowserCache = true;

        // Use a lightweight background removal model
        const modelId = 'briaai/RMBG-1.4';

        // Load processor
        state.processor = await AutoProcessor.from_pretrained(modelId, {
            progress_callback: (progress) => {
                if (progress.status === 'progress') {
                    updateProgress(progress.progress / 100 * 0.3);
                }
            }
        });

        // Load model
        state.model = await AutoModel.from_pretrained(modelId, {
            device: 'wasm',
            progress_callback: (progress) => {
                if (progress.status === 'progress') {
                    updateProgress(0.3 + progress.progress / 100 * 0.7);
                }
            }
        });

        // Store RawImage for later use
        const { RawImage } = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.2');
        window.RawImage = RawImage;

        state.isModelLoaded = true;
        elements.progressContainer.style.display = 'none';
        setModelStatus('ready');
        elements.uploadArea.style.display = 'block';

        console.log('Model loaded successfully');

    } catch (error) {
        console.error('Error loading model:', error);
        elements.progressContainer.style.display = 'none';
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

function updateProgress(progress) {
    const percent = Math.round(progress * 100);
    elements.progressFill.style.width = `${percent}%`;
    elements.progressPercent.textContent = `${percent}%`;
}

// ========================================
// Image Processing
// ========================================

async function processImage(file) {
    if (!state.isModelLoaded || state.isProcessing) return;

    state.isProcessing = true;
    elements.processingOverlay.style.display = 'flex';
    elements.downloadBtn.disabled = true;
    elements.downloadTransparentBtn.disabled = true;

    try {
        // Load image
        const imageUrl = URL.createObjectURL(file);
        const img = new Image();
        img.src = imageUrl;
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
        });

        state.originalImage = img;
        elements.originalImage.src = imageUrl;

        // Show editor
        elements.uploadArea.style.display = 'none';
        elements.editorArea.style.display = 'flex';

        // Load using RawImage
        const rawImage = await window.RawImage.fromURL(imageUrl);

        // Process
        const processedInputs = await state.processor(rawImage);
        const { output } = await state.model(processedInputs);

        // Extract mask data
        const maskData = output[0][0].data;
        const maskWidth = output[0][0].dims[1];
        const maskHeight = output[0][0].dims[0];

        // Store mask for re-rendering
        state.maskData = {
            data: maskData,
            width: maskWidth,
            height: maskHeight
        };

        // Render with current settings
        renderResult();

        elements.processingOverlay.style.display = 'none';
        elements.downloadBtn.disabled = false;
        elements.downloadTransparentBtn.disabled = false;

        URL.revokeObjectURL(imageUrl);

    } catch (error) {
        console.error('Error processing image:', error);
        alert(t('errorProcessing') + '\n\n' + error.message);
        resetUI();
    } finally {
        state.isProcessing = false;
    }
}

function renderResult() {
    if (!state.maskData || !state.originalImage) return;

    const img = state.originalImage;
    const canvas = elements.resultCanvas;
    const ctx = canvas.getContext('2d');

    canvas.width = img.width;
    canvas.height = img.height;

    // Draw background based on fill mode
    if (state.fillMode === 'solid') {
        ctx.fillStyle = state.solidColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
        // Gradient
        let gradient;
        if (state.gradientDirection === 'circle') {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = Math.max(canvas.width, canvas.height) / 2;
            gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        } else {
            const coords = getGradientCoords(state.gradientDirection, canvas.width, canvas.height);
            gradient = ctx.createLinearGradient(coords.x1, coords.y1, coords.x2, coords.y2);
        }
        gradient.addColorStop(0, state.gradientStart);
        gradient.addColorStop(1, state.gradientEnd);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw original image
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = img.width;
    tempCanvas.height = img.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(img, 0, 0);

    // Get image data
    const imageData = tempCtx.getImageData(0, 0, img.width, img.height);

    // Resize mask to image size
    const { data: maskData, width: maskWidth, height: maskHeight } = state.maskData;

    // Apply mask
    for (let y = 0; y < img.height; y++) {
        for (let x = 0; x < img.width; x++) {
            const maskX = Math.floor(x * maskWidth / img.width);
            const maskY = Math.floor(y * maskHeight / img.height);
            const maskIdx = maskY * maskWidth + maskX;
            const maskValue = maskData[maskIdx];

            if (maskValue > 0.5) {
                // Foreground - copy original pixel
                const idx = (y * img.width + x) * 4;
                const bgData = ctx.getImageData(x, y, 1, 1).data;

                // Blend with alpha
                const alpha = maskValue;
                const invAlpha = 1 - alpha;

                ctx.fillStyle = `rgba(${imageData.data[idx]}, ${imageData.data[idx + 1]}, ${imageData.data[idx + 2]}, ${alpha})`;
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }

    // Alternative: Use composition for better performance
    renderResultOptimized();
}

function renderResultOptimized() {
    if (!state.maskData || !state.originalImage) return;

    const img = state.originalImage;
    const canvas = elements.resultCanvas;
    const ctx = canvas.getContext('2d');

    canvas.width = img.width;
    canvas.height = img.height;

    // Create mask canvas at image size
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = img.width;
    maskCanvas.height = img.height;
    const maskCtx = maskCanvas.getContext('2d');

    // Draw mask
    const { data: maskData, width: maskWidth, height: maskHeight } = state.maskData;
    const maskImageData = maskCtx.createImageData(maskWidth, maskHeight);

    for (let i = 0; i < maskData.length; i++) {
        const val = Math.round(maskData[i] * 255);
        maskImageData.data[i * 4] = val;
        maskImageData.data[i * 4 + 1] = val;
        maskImageData.data[i * 4 + 2] = val;
        maskImageData.data[i * 4 + 3] = 255;
    }

    // Create temp canvas for mask at original size
    const tempMask = document.createElement('canvas');
    tempMask.width = maskWidth;
    tempMask.height = maskHeight;
    const tempMaskCtx = tempMask.getContext('2d');
    tempMaskCtx.putImageData(maskImageData, 0, 0);

    // Draw resized mask
    maskCtx.drawImage(tempMask, 0, 0, img.width, img.height);

    // Draw background
    if (state.fillMode === 'solid') {
        ctx.fillStyle = state.solidColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
        let gradient;
        if (state.gradientDirection === 'circle') {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = Math.max(canvas.width, canvas.height) * 0.7;
            gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        } else {
            const coords = getGradientCoords(state.gradientDirection, canvas.width, canvas.height);
            gradient = ctx.createLinearGradient(coords.x1, coords.y1, coords.x2, coords.y2);
        }
        gradient.addColorStop(0, state.gradientStart);
        gradient.addColorStop(1, state.gradientEnd);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Get mask data for alpha
    const resizedMaskData = maskCtx.getImageData(0, 0, img.width, img.height);

    // Create foreground with alpha
    const fgCanvas = document.createElement('canvas');
    fgCanvas.width = img.width;
    fgCanvas.height = img.height;
    const fgCtx = fgCanvas.getContext('2d');
    fgCtx.drawImage(img, 0, 0);

    const fgData = fgCtx.getImageData(0, 0, img.width, img.height);

    // Apply mask as alpha
    for (let i = 0; i < fgData.data.length / 4; i++) {
        fgData.data[i * 4 + 3] = resizedMaskData.data[i * 4]; // Use red channel as alpha
    }

    fgCtx.putImageData(fgData, 0, 0);

    // Composite foreground over background
    ctx.drawImage(fgCanvas, 0, 0);
}

function getGradientCoords(direction, width, height) {
    switch (direction) {
        case 'to right':
            return { x1: 0, y1: 0, x2: width, y2: 0 };
        case 'to bottom':
            return { x1: 0, y1: 0, x2: 0, y2: height };
        case 'to bottom right':
            return { x1: 0, y1: 0, x2: width, y2: height };
        case 'to bottom left':
            return { x1: width, y1: 0, x2: 0, y2: height };
        default:
            return { x1: 0, y1: 0, x2: 0, y2: height };
    }
}

// ========================================
// Download Functions
// ========================================

function downloadResult() {
    const canvas = elements.resultCanvas;
    canvas.toBlob((blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `background-fill-${Date.now()}.png`;
        link.click();
        URL.revokeObjectURL(link.href);
    }, 'image/png');
}

function downloadTransparent() {
    if (!state.maskData || !state.originalImage) return;

    const img = state.originalImage;
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');

    // Draw original
    ctx.drawImage(img, 0, 0);

    // Create mask at image size
    const { data: maskData, width: maskWidth, height: maskHeight } = state.maskData;

    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = maskWidth;
    maskCanvas.height = maskHeight;
    const maskCtx = maskCanvas.getContext('2d');

    const maskImageData = maskCtx.createImageData(maskWidth, maskHeight);
    for (let i = 0; i < maskData.length; i++) {
        const val = Math.round(maskData[i] * 255);
        maskImageData.data[i * 4] = val;
        maskImageData.data[i * 4 + 1] = val;
        maskImageData.data[i * 4 + 2] = val;
        maskImageData.data[i * 4 + 3] = 255;
    }
    maskCtx.putImageData(maskImageData, 0, 0);

    // Resize mask
    const resizedMask = document.createElement('canvas');
    resizedMask.width = img.width;
    resizedMask.height = img.height;
    const resizedCtx = resizedMask.getContext('2d');
    resizedCtx.drawImage(maskCanvas, 0, 0, img.width, img.height);

    const resizedMaskData = resizedCtx.getImageData(0, 0, img.width, img.height);

    // Apply mask as alpha
    const imageData = ctx.getImageData(0, 0, img.width, img.height);
    for (let i = 0; i < imageData.data.length / 4; i++) {
        imageData.data[i * 4 + 3] = resizedMaskData.data[i * 4];
    }
    ctx.putImageData(imageData, 0, 0);

    // Download
    canvas.toBlob((blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `transparent-${Date.now()}.png`;
        link.click();
        URL.revokeObjectURL(link.href);
    }, 'image/png');
}

// ========================================
// UI Functions
// ========================================

function setFillMode(mode) {
    state.fillMode = mode;

    elements.modeSolid.classList.toggle('active', mode === 'solid');
    elements.modeGradient.classList.toggle('active', mode === 'gradient');
    elements.solidControls.style.display = mode === 'solid' ? 'block' : 'none';
    elements.gradientControls.style.display = mode === 'gradient' ? 'block' : 'none';

    if (state.maskData) {
        renderResultOptimized();
    }
}

function resetUI() {
    elements.uploadArea.style.display = 'block';
    elements.editorArea.style.display = 'none';
    elements.processingOverlay.style.display = 'flex';
    elements.downloadBtn.disabled = true;
    elements.downloadTransparentBtn.disabled = true;
    elements.fileInput.value = '';
    state.maskData = null;
    state.originalImage = null;
}

// ========================================
// Event Handlers
// ========================================

function initEventListeners() {
    // Language
    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    // Model loading
    elements.loadModelBtn.addEventListener('click', loadModel);

    // Upload
    elements.uploadArea.addEventListener('click', () => elements.fileInput.click());

    elements.fileInput.addEventListener('change', (e) => {
        if (e.target.files[0]) {
            const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
            if (!validTypes.includes(e.target.files[0].type)) {
                alert(t('errorFileType'));
                return;
            }
            processImage(e.target.files[0]);
        }
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
        if (e.dataTransfer.files[0]) {
            const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
            if (!validTypes.includes(e.dataTransfer.files[0].type)) {
                alert(t('errorFileType'));
                return;
            }
            processImage(e.dataTransfer.files[0]);
        }
    });

    // Fill mode
    elements.modeSolid.addEventListener('click', () => setFillMode('solid'));
    elements.modeGradient.addEventListener('click', () => setFillMode('gradient'));

    // Solid color
    elements.solidColor.addEventListener('input', (e) => {
        state.solidColor = e.target.value;
        elements.solidColorHex.value = e.target.value;
        if (state.maskData) renderResultOptimized();
    });

    elements.solidColorHex.addEventListener('input', (e) => {
        const hex = e.target.value;
        if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
            state.solidColor = hex;
            elements.solidColor.value = hex;
            if (state.maskData) renderResultOptimized();
        }
    });

    // Preset colors
    document.querySelectorAll('.preset-color').forEach(btn => {
        btn.addEventListener('click', () => {
            const color = btn.dataset.color;
            state.solidColor = color;
            elements.solidColor.value = color;
            elements.solidColorHex.value = color;
            if (state.maskData) renderResultOptimized();
        });
    });

    // Gradient colors
    elements.gradientStart.addEventListener('input', (e) => {
        state.gradientStart = e.target.value;
        if (state.maskData) renderResultOptimized();
    });

    elements.gradientEnd.addEventListener('input', (e) => {
        state.gradientEnd = e.target.value;
        if (state.maskData) renderResultOptimized();
    });

    // Gradient direction
    document.querySelectorAll('.dir-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.dir-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.gradientDirection = btn.dataset.dir;
            if (state.maskData) renderResultOptimized();
        });
    });

    // Preset gradients
    document.querySelectorAll('.preset-gradient').forEach(btn => {
        btn.addEventListener('click', () => {
            state.gradientStart = btn.dataset.start;
            state.gradientEnd = btn.dataset.end;
            elements.gradientStart.value = btn.dataset.start;
            elements.gradientEnd.value = btn.dataset.end;
            if (state.maskData) renderResultOptimized();
        });
    });

    // Actions
    elements.downloadBtn.addEventListener('click', downloadResult);
    elements.downloadTransparentBtn.addEventListener('click', downloadTransparent);
    elements.resetBtn.addEventListener('click', resetUI);
}

// ========================================
// Initialization
// ========================================

function init() {
    const browserLang = navigator.language;
    if (browserLang.startsWith('zh')) {
        setLanguage('zh-TW');
    } else {
        setLanguage('en');
    }

    initEventListeners();
    console.log('AI Background Color Fill initialized');
}

init();
