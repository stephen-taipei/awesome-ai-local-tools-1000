/**
 * AI ID Photo Background - Tool #005
 * Awesome AI Local Tools
 *
 * Create professional ID photos with standard background colors
 * Uses portrait segmentation for precise background replacement
 */

// ========================================
// Internationalization (i18n)
// ========================================

const translations = {
    'zh-TW': {
        title: 'AI 證件照背景',
        subtitle: '一鍵製作標準證件照，白/藍/紅背景',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        modelNotLoaded: '模型未載入',
        modelLoading: '模型載入中...',
        modelReady: '模型已就緒',
        loadModel: '載入模型',
        downloading: '正在下載模型...',
        uploadText: '上傳您的照片',
        uploadHint: '建議使用正面免冠照片，光線均勻',
        original: '原圖',
        result: '證件照',
        processing: '正在處理中...',
        backgroundColor: '背景顏色',
        white: '白色',
        blue: '藍色',
        red: '紅色',
        green: '綠色',
        gray: '淺灰',
        customColor: '自訂顏色：',
        photoSize: '照片尺寸',
        size1inch: '1寸',
        size2inch: '2寸',
        sizeSmall2inch: '小2寸',
        sizePassport: '護照',
        sizeVisa: '簽證',
        sizeSquare: '正方形',
        outputQuality: '輸出品質',
        qualityWeb: '網頁用',
        qualityPrint: '列印用',
        qualityHD: '高清',
        download: '下載證件照',
        downloadSheet: '下載排版照片',
        uploadAnother: '上傳其他照片',
        sizeReference: '常見證件照尺寸參考',
        sizeName: '名稱',
        sizeDimensions: '尺寸 (mm)',
        sizeUsage: '用途',
        usage1inch: '身分證、學生證',
        usage2inch: '護照、簽證',
        usagePassport: '護照申請',
        howItWorks: '如何運作？',
        aiModel: 'AI 模型',
        aiModelDesc: '使用專業人像分割模型，精確分離人物與背景',
        standardColors: '標準背景',
        standardColorsDesc: '提供白、藍、紅等標準證件照背景色',
        standardSizes: '標準尺寸',
        standardSizesDesc: '內建多種常見證件照尺寸，一鍵裁切',
        printReady: '列印就緒',
        printReadyDesc: '支援高解析度輸出，可直接列印使用',
        backToHome: '返回首頁',
        toolNumber: '工具 #005',
        copyright: 'Awesome AI Local Tools © 2024',
        errorFileType: '請上傳 PNG、JPG 或 WebP 格式的圖片',
        errorProcessing: '處理圖片時發生錯誤'
    },
    'en': {
        title: 'AI ID Photo Background',
        subtitle: 'Create professional ID photos with standard backgrounds',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        modelNotLoaded: 'Model not loaded',
        modelLoading: 'Loading model...',
        modelReady: 'Model ready',
        loadModel: 'Load Model',
        downloading: 'Downloading model...',
        uploadText: 'Upload your photo',
        uploadHint: 'Use a front-facing photo with even lighting',
        original: 'Original',
        result: 'ID Photo',
        processing: 'Processing...',
        backgroundColor: 'Background Color',
        white: 'White',
        blue: 'Blue',
        red: 'Red',
        green: 'Green',
        gray: 'Gray',
        customColor: 'Custom Color:',
        photoSize: 'Photo Size',
        size1inch: '1 inch',
        size2inch: '2 inch',
        sizeSmall2inch: 'Small 2"',
        sizePassport: 'Passport',
        sizeVisa: 'Visa',
        sizeSquare: 'Square',
        outputQuality: 'Output Quality',
        qualityWeb: 'Web',
        qualityPrint: 'Print',
        qualityHD: 'HD',
        download: 'Download ID Photo',
        downloadSheet: 'Download Photo Sheet',
        uploadAnother: 'Upload Another',
        sizeReference: 'Common ID Photo Sizes',
        sizeName: 'Name',
        sizeDimensions: 'Size (mm)',
        sizeUsage: 'Usage',
        usage1inch: 'ID cards, student cards',
        usage2inch: 'Passport, visa',
        usagePassport: 'Passport application',
        howItWorks: 'How It Works',
        aiModel: 'AI Model',
        aiModelDesc: 'Uses professional portrait segmentation for precise background separation',
        standardColors: 'Standard Colors',
        standardColorsDesc: 'Provides white, blue, red standard ID photo backgrounds',
        standardSizes: 'Standard Sizes',
        standardSizesDesc: 'Built-in common ID photo sizes for one-click cropping',
        printReady: 'Print Ready',
        printReadyDesc: 'Supports high-resolution output for direct printing',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #005',
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
    backgroundColor: '#ffffff',
    photoWidth: 295,
    photoHeight: 413,
    outputDpi: 300
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
    customColor: document.getElementById('customColor'),
    downloadBtn: document.getElementById('downloadBtn'),
    downloadSheetBtn: document.getElementById('downloadSheetBtn'),
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
        const { AutoModel, AutoProcessor, env, RawImage } = await import(
            'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.2'
        );

        env.allowLocalModels = false;
        env.useBrowserCache = true;

        window.RawImage = RawImage;

        const modelId = 'briaai/RMBG-1.4';

        state.processor = await AutoProcessor.from_pretrained(modelId, {
            progress_callback: (progress) => {
                if (progress.status === 'progress') {
                    updateProgress(progress.progress / 100 * 0.3);
                }
            }
        });

        state.model = await AutoModel.from_pretrained(modelId, {
            device: 'wasm',
            progress_callback: (progress) => {
                if (progress.status === 'progress') {
                    updateProgress(0.3 + progress.progress / 100 * 0.7);
                }
            }
        });

        state.isModelLoaded = true;
        elements.progressContainer.style.display = 'none';
        setModelStatus('ready');
        elements.uploadArea.style.display = 'block';

    } catch (error) {
        console.error('Error loading model:', error);
        elements.progressContainer.style.display = 'none';
        setModelStatus('error');
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
    elements.downloadSheetBtn.disabled = true;

    try {
        const imageUrl = URL.createObjectURL(file);
        const img = new Image();
        img.src = imageUrl;
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
        });

        state.originalImage = img;
        elements.originalImage.src = imageUrl;

        elements.uploadArea.style.display = 'none';
        elements.editorArea.style.display = 'flex';

        const rawImage = await window.RawImage.fromURL(imageUrl);
        const processedInputs = await state.processor(rawImage);
        const { output } = await state.model(processedInputs);

        const maskData = output[0][0].data;
        const maskWidth = output[0][0].dims[1];
        const maskHeight = output[0][0].dims[0];

        state.maskData = {
            data: maskData,
            width: maskWidth,
            height: maskHeight
        };

        renderResult();

        elements.processingOverlay.style.display = 'none';
        elements.downloadBtn.disabled = false;
        elements.downloadSheetBtn.disabled = false;

        URL.revokeObjectURL(imageUrl);

    } catch (error) {
        console.error('Error processing image:', error);
        alert(t('errorProcessing'));
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

    // Set canvas to target size
    canvas.width = state.photoWidth;
    canvas.height = state.photoHeight;

    // Fill background
    ctx.fillStyle = state.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate crop and scale to fit
    const imgAspect = img.width / img.height;
    const canvasAspect = canvas.width / canvas.height;

    let srcX, srcY, srcW, srcH;

    if (imgAspect > canvasAspect) {
        // Image is wider - crop sides
        srcH = img.height;
        srcW = img.height * canvasAspect;
        srcX = (img.width - srcW) / 2;
        srcY = 0;
    } else {
        // Image is taller - crop top/bottom (favor top for head)
        srcW = img.width;
        srcH = img.width / canvasAspect;
        srcX = 0;
        srcY = img.height * 0.1; // Slight offset to include more of the head
        if (srcY + srcH > img.height) {
            srcY = img.height - srcH;
        }
    }

    // Create mask at original image size
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

    // Resize mask to original image size
    const fullMaskCanvas = document.createElement('canvas');
    fullMaskCanvas.width = img.width;
    fullMaskCanvas.height = img.height;
    const fullMaskCtx = fullMaskCanvas.getContext('2d');
    fullMaskCtx.drawImage(maskCanvas, 0, 0, img.width, img.height);

    // Create foreground with alpha
    const fgCanvas = document.createElement('canvas');
    fgCanvas.width = img.width;
    fgCanvas.height = img.height;
    const fgCtx = fgCanvas.getContext('2d');
    fgCtx.drawImage(img, 0, 0);

    const fgData = fgCtx.getImageData(0, 0, img.width, img.height);
    const maskFullData = fullMaskCtx.getImageData(0, 0, img.width, img.height);

    for (let i = 0; i < fgData.data.length / 4; i++) {
        fgData.data[i * 4 + 3] = maskFullData.data[i * 4];
    }
    fgCtx.putImageData(fgData, 0, 0);

    // Draw cropped foreground onto result
    ctx.drawImage(
        fgCanvas,
        srcX, srcY, srcW, srcH,
        0, 0, canvas.width, canvas.height
    );
}

// ========================================
// Download Functions
// ========================================

function downloadResult() {
    const canvas = elements.resultCanvas;
    canvas.toBlob((blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `id-photo-${Date.now()}.png`;
        link.click();
        URL.revokeObjectURL(link.href);
    }, 'image/png');
}

function downloadSheet() {
    // Create a sheet with multiple photos for printing
    const canvas = elements.resultCanvas;
    const sheetCanvas = document.createElement('canvas');

    // Standard 4x6 inch print at selected DPI
    const dpi = state.outputDpi;
    sheetCanvas.width = 6 * dpi;
    sheetCanvas.height = 4 * dpi;

    const sheetCtx = sheetCanvas.getContext('2d');

    // White background
    sheetCtx.fillStyle = '#ffffff';
    sheetCtx.fillRect(0, 0, sheetCanvas.width, sheetCanvas.height);

    // Calculate how many photos fit
    const photoWidthPx = state.photoWidth * dpi / 300;
    const photoHeightPx = state.photoHeight * dpi / 300;
    const padding = 10;

    const cols = Math.floor((sheetCanvas.width - padding) / (photoWidthPx + padding));
    const rows = Math.floor((sheetCanvas.height - padding) / (photoHeightPx + padding));

    // Draw photos in grid
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const x = padding + col * (photoWidthPx + padding);
            const y = padding + row * (photoHeightPx + padding);
            sheetCtx.drawImage(canvas, x, y, photoWidthPx, photoHeightPx);
        }
    }

    // Download
    sheetCanvas.toBlob((blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `id-photo-sheet-${Date.now()}.png`;
        link.click();
        URL.revokeObjectURL(link.href);
    }, 'image/png');
}

// ========================================
// UI Functions
// ========================================

function resetUI() {
    elements.uploadArea.style.display = 'block';
    elements.editorArea.style.display = 'none';
    elements.processingOverlay.style.display = 'flex';
    elements.downloadBtn.disabled = true;
    elements.downloadSheetBtn.disabled = true;
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

    // Model
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
            processImage(e.dataTransfer.files[0]);
        }
    });

    // Color buttons
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.backgroundColor = btn.dataset.color;
            elements.customColor.value = btn.dataset.color;
            if (state.maskData) renderResult();
        });
    });

    // Custom color
    elements.customColor.addEventListener('input', (e) => {
        state.backgroundColor = e.target.value;
        document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
        if (state.maskData) renderResult();
    });

    // Size buttons
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.photoWidth = parseInt(btn.dataset.width);
            state.photoHeight = parseInt(btn.dataset.height);
            if (state.maskData) renderResult();
        });
    });

    // Quality buttons
    document.querySelectorAll('.quality-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.quality-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.outputDpi = parseInt(btn.dataset.dpi);
        });
    });

    // Actions
    elements.downloadBtn.addEventListener('click', downloadResult);
    elements.downloadSheetBtn.addEventListener('click', downloadSheet);
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
    console.log('AI ID Photo Background initialized');
}

init();
