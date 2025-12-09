/**
 * Auto Color Correction - Tool #018
 * Uses Histogram Equalization and Auto White Balance logic (Canvas API)
 */

const translations = {
    'zh-TW': {
        title: '自動色彩校正',
        subtitle: '自動分析並校正圖片色彩平衡、曝光',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        uploadText: '拖放圖片到此處或點擊上傳',
        uploadHint: '支援 PNG、JPG、WebP',
        original: '原圖',
        corrected: '校正後',
        autoCorrect: '一鍵自動校正',
        fineTune: '微調',
        temperature: '色溫',
        tint: '色調',
        brightness: '亮度',
        uploadAnother: '重新上傳',
        download: '下載圖片',
        techSpecs: '技術規格',
        specTech: '技術核心',
        specSpeed: '處理速度',
        specPrivacy: '隱私保護',
        realTime: '即時 (Real-time)',
        localProcessing: '100% 本地運算',
        backToHome: '返回首頁',
        toolNumber: '工具 #018',
        errorFileType: '請上傳圖片檔案'
    },
    'en': {
        title: 'Auto Color Correction',
        subtitle: 'Automatically analyze and correct color balance and exposure',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        uploadText: 'Drag & drop image here or click to upload',
        uploadHint: 'Supports PNG, JPG, WebP',
        original: 'Original',
        corrected: 'Corrected',
        autoCorrect: 'One-Click Auto Correct',
        fineTune: 'Fine Tune',
        temperature: 'Temperature',
        tint: 'Tint',
        brightness: 'Brightness',
        uploadAnother: 'Upload Another',
        download: 'Download',
        techSpecs: 'Technical Specs',
        specTech: 'Core Tech',
        specSpeed: 'Speed',
        specPrivacy: 'Privacy',
        realTime: 'Real-time',
        localProcessing: '100% Local Processing',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #018',
        errorFileType: 'Please upload an image file'
    }
};

let currentLang = 'zh-TW';
let originalImage = null;

// DOM Elements
const elements = {
    uploadArea: document.getElementById('uploadArea'),
    fileInput: document.getElementById('fileInput'),
    editorArea: document.getElementById('editorArea'),
    originalCanvas: document.getElementById('originalCanvas'),
    correctedCanvas: document.getElementById('correctedCanvas'),
    autoCorrectBtn: document.getElementById('autoCorrectBtn'),
    resetBtn: document.getElementById('resetBtn'),
    downloadBtn: document.getElementById('downloadBtn'),
    controls: {
        temperature: document.getElementById('temperature'),
        tint: document.getElementById('tint'),
        brightness: document.getElementById('brightness')
    }
};

let adjustmentState = {
    autoApplied: false,
    autoParams: { r: 1, g: 1, b: 1, brightness: 0 },
    manualParams: { temp: 0, tint: 0, brightness: 0 }
};

function handleFileSelect(file) {
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
        alert(translations[currentLang].errorFileType);
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        originalImage = new Image();
        originalImage.onload = () => {
            // Resize logic
            const maxWidth = 800; // Smaller for side-by-side
            let width = originalImage.width;
            let height = originalImage.height;
            if (width > maxWidth) {
                const ratio = maxWidth / width;
                width *= ratio;
                height *= ratio;
            }

            elements.originalCanvas.width = width;
            elements.originalCanvas.height = height;
            elements.correctedCanvas.width = width;
            elements.correctedCanvas.height = height;

            const ctx = elements.originalCanvas.getContext('2d');
            ctx.drawImage(originalImage, 0, 0, width, height);

            // Draw initial corrected (same as original)
            const ctx2 = elements.correctedCanvas.getContext('2d');
            ctx2.drawImage(originalImage, 0, 0, width, height);

            elements.uploadArea.style.display = 'none';
            elements.editorArea.style.display = 'block';

            // Reset state
            adjustmentState = {
                autoApplied: false,
                autoParams: { r: 1, g: 1, b: 1, brightness: 0 },
                manualParams: { temp: 0, tint: 0, brightness: 0 }
            };
            resetControls();
        };
        originalImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function resetControls() {
    elements.controls.temperature.value = 0;
    elements.controls.tint.value = 0;
    elements.controls.brightness.value = 0;
}

function analyzeImage(imageData) {
    // Simple Gray World Assumption for Auto White Balance
    let rSum = 0, gSum = 0, bSum = 0;
    const data = imageData.data;
    const totalPixels = data.length / 4;

    for (let i = 0; i < data.length; i += 4) {
        rSum += data[i];
        gSum += data[i + 1];
        bSum += data[i + 2];
    }

    const rAvg = rSum / totalPixels;
    const gAvg = gSum / totalPixels;
    const bAvg = bSum / totalPixels;

    // Target average (neutral gray)
    const gray = (rAvg + gAvg + bAvg) / 3;

    // Calculate scaling factors
    const rScale = gray / rAvg;
    const gScale = gray / gAvg;
    const bScale = gray / bAvg;

    // Simple brightness correction (if image is too dark/bright)
    let brightnessOffset = 0;
    if (gray < 80) brightnessOffset = 20; // boost dark images
    if (gray > 200) brightnessOffset = -20; // darken bright images

    return { r: rScale, g: gScale, b: bScale, brightness: brightnessOffset };
}

function applyCorrections() {
    const ctx = elements.originalCanvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, elements.originalCanvas.width, elements.originalCanvas.height);
    const data = imageData.data;

    // Auto Params
    const ar = adjustmentState.autoApplied ? adjustmentState.autoParams.r : 1;
    const ag = adjustmentState.autoApplied ? adjustmentState.autoParams.g : 1;
    const ab = adjustmentState.autoApplied ? adjustmentState.autoParams.b : 1;
    const aBright = adjustmentState.autoApplied ? adjustmentState.autoParams.brightness : 0;

    // Manual Params
    // Temperature: warm (R+, B-) vs cool (R-, B+)
    const temp = parseInt(elements.controls.temperature.value);
    const rTemp = temp > 0 ? 1 + temp/100 : 1;
    const bTemp = temp < 0 ? 1 - temp/100 : 1; // negative temp means more blue
    // Actually standard wb: warm adds red/yellow, cool adds blue
    // Simplified:
    const rMult = 1 + (temp / 200);
    const bMult = 1 - (temp / 200);

    // Tint: Green vs Magenta (G+, G-)
    const tint = parseInt(elements.controls.tint.value);
    const gMult = 1 + (tint / 200);

    // Brightness
    const bright = parseInt(elements.controls.brightness.value) + aBright;

    for (let i = 0; i < data.length; i += 4) {
        // Apply Auto
        let r = data[i] * ar;
        let g = data[i+1] * ag;
        let b = data[i+2] * ab;

        // Apply Manual Temp/Tint
        r *= rMult;
        g *= gMult;
        b *= bMult;

        // Apply Brightness
        r += bright;
        g += bright;
        b += bright;

        data[i] = Math.min(255, Math.max(0, r));
        data[i+1] = Math.min(255, Math.max(0, g));
        data[i+2] = Math.min(255, Math.max(0, b));
    }

    const ctxCorrected = elements.correctedCanvas.getContext('2d');
    ctxCorrected.putImageData(imageData, 0, 0);
}

function setupEventListeners() {
    elements.uploadArea.addEventListener('click', () => elements.fileInput.click());
    elements.fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) handleFileSelect(e.target.files[0]);
    });

    elements.uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.uploadArea.classList.add('dragover');
    });
    elements.uploadArea.addEventListener('dragleave', () => elements.uploadArea.classList.remove('dragover'));
    elements.uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.uploadArea.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) handleFileSelect(e.dataTransfer.files[0]);
    });

    elements.autoCorrectBtn.addEventListener('click', () => {
        if (!adjustmentState.autoApplied) {
            const ctx = elements.originalCanvas.getContext('2d');
            const imageData = ctx.getImageData(0, 0, elements.originalCanvas.width, elements.originalCanvas.height);
            adjustmentState.autoParams = analyzeImage(imageData);
            adjustmentState.autoApplied = true;
            elements.autoCorrectBtn.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)'; // Greenish
            applyCorrections();
        } else {
            adjustmentState.autoApplied = false;
            elements.autoCorrectBtn.style.background = '';
            applyCorrections();
        }
    });

    Object.values(elements.controls).forEach(input => {
        input.addEventListener('input', applyCorrections);
    });

    elements.resetBtn.addEventListener('click', () => {
        elements.editorArea.style.display = 'none';
        elements.uploadArea.style.display = 'block';
        elements.fileInput.value = '';
        originalImage = null;
    });

    elements.downloadBtn.addEventListener('click', () => {
        elements.correctedCanvas.toBlob((blob) => {
            const link = document.createElement('a');
            link.download = `color-corrected-${Date.now()}.png`;
            link.href = URL.createObjectURL(blob);
            link.click();
        }, 'image/png');
    });

    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));
}

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(lang === 'zh-TW' ? 'lang-zh' : 'lang-en').classList.add('active');

    const t = translations[lang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.textContent = t[key];
    });
}

setupEventListeners();
