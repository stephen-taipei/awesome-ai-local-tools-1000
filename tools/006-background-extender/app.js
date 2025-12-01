/**
 * AI Background Extender
 * Tool #006 - Awesome AI Local Tools
 *
 * Smart background extension using edge sampling techniques
 * 100% local processing with Canvas API
 */

// Translations
const translations = {
    'zh-TW': {
        title: 'AI 背景延伸器',
        subtitle: '智慧延伸圖片背景，擴展畫布尺寸',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        uploadText: '點擊或拖放圖片到這裡',
        uploadHint: '支援 JPG、PNG、WebP 格式',
        extendSettings: '延伸設定',
        extendAmount: '延伸距離 (像素)',
        extendMode: '延伸模式',
        modeMirror: '鏡像',
        modeRepeat: '重複',
        modeStretch: '拉伸',
        modeColor: '純色',
        fillColor: '填充顏色',
        sampleFromEdge: '從邊緣取色',
        blendAmount: '混合程度',
        quickActions: '快速操作',
        expandAll: '四邊延伸',
        undo: '復原',
        reset: '重設',
        download: '下載結果',
        newImage: '選擇新圖片',
        originalSize: '原始尺寸',
        currentSize: '目前尺寸',
        tryExamples: '試試範例圖片',
        exampleMountain: '山景',
        examplePortrait: '人像',
        exampleBeach: '海灘',
        exampleForest: '森林',
        howItWorks: '如何運作？',
        mirrorMode: '鏡像模式',
        mirrorModeDesc: '鏡像翻轉邊緣像素，適合對稱背景',
        repeatMode: '重複模式',
        repeatModeDesc: '重複邊緣圖案，適合紋理背景',
        stretchMode: '拉伸模式',
        stretchModeDesc: '漸變拉伸邊緣顏色，適合漸層背景',
        colorMode: '純色模式',
        colorModeDesc: '使用指定顏色填充，可從邊緣取色',
        useCases: '使用場景',
        useCaseSocial: '社群媒體比例調整',
        useCaseWallpaper: '桌布尺寸擴展',
        useCaseVideo: '影片背景延伸',
        useCasePrint: '列印邊距擴展',
        techSpecs: '技術規格',
        specMethod: '延伸方法',
        specMethodValue: '智慧邊緣取樣',
        specModes: '支援模式',
        specMax: '最大延伸',
        specFormats: '支援格式',
        specRuntime: '執行環境',
        backToHome: '返回首頁',
        toolNumber: '工具 #006',
        copyright: 'Awesome AI Local Tools © 2024'
    },
    'en': {
        title: 'AI Background Extender',
        subtitle: 'Intelligently extend image backgrounds',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        uploadText: 'Click or drag image here',
        uploadHint: 'Supports JPG, PNG, WebP formats',
        extendSettings: 'Extension Settings',
        extendAmount: 'Extension Amount (px)',
        extendMode: 'Extension Mode',
        modeMirror: 'Mirror',
        modeRepeat: 'Repeat',
        modeStretch: 'Stretch',
        modeColor: 'Solid',
        fillColor: 'Fill Color',
        sampleFromEdge: 'Sample from Edge',
        blendAmount: 'Blend Amount',
        quickActions: 'Quick Actions',
        expandAll: 'Expand All',
        undo: 'Undo',
        reset: 'Reset',
        download: 'Download',
        newImage: 'New Image',
        originalSize: 'Original',
        currentSize: 'Current',
        tryExamples: 'Try Example Images',
        exampleMountain: 'Mountain',
        examplePortrait: 'Portrait',
        exampleBeach: 'Beach',
        exampleForest: 'Forest',
        howItWorks: 'How It Works?',
        mirrorMode: 'Mirror Mode',
        mirrorModeDesc: 'Mirror edge pixels for symmetric backgrounds',
        repeatMode: 'Repeat Mode',
        repeatModeDesc: 'Repeat edge patterns for textured backgrounds',
        stretchMode: 'Stretch Mode',
        stretchModeDesc: 'Gradient stretch for smooth backgrounds',
        colorMode: 'Solid Color',
        colorModeDesc: 'Fill with specified color, can sample from edge',
        useCases: 'Use Cases',
        useCaseSocial: 'Social media ratio adjustment',
        useCaseWallpaper: 'Wallpaper size expansion',
        useCaseVideo: 'Video background extension',
        useCasePrint: 'Print margin expansion',
        techSpecs: 'Technical Specs',
        specMethod: 'Method',
        specMethodValue: 'Smart Edge Sampling',
        specModes: 'Modes',
        specMax: 'Max Extension',
        specFormats: 'Formats',
        specRuntime: 'Runtime',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #006',
        copyright: 'Awesome AI Local Tools © 2024'
    }
};

// State
let currentLang = 'zh-TW';
let originalImage = null;
let currentImageData = null;
let historyStack = [];
let extendMode = 'mirror';
let extendAmount = 100;
let blendAmount = 50;
let fillColor = '#ffffff';

// DOM Elements
const langZhBtn = document.getElementById('lang-zh');
const langEnBtn = document.getElementById('lang-en');
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const editorArea = document.getElementById('editorArea');
const previewCanvas = document.getElementById('previewCanvas');
const ctx = previewCanvas.getContext('2d');
const originalSizeEl = document.getElementById('originalSize');
const currentSizeEl = document.getElementById('currentSize');
const extendAmountSlider = document.getElementById('extendAmountSlider');
const extendAmountInput = document.getElementById('extendAmountInput');
const blendAmountSlider = document.getElementById('blendAmountSlider');
const blendAmountValue = document.getElementById('blendAmountValue');
const colorPickerGroup = document.getElementById('colorPickerGroup');
const fillColorInput = document.getElementById('fillColor');
const sampleColorBtn = document.getElementById('sampleColorBtn');
const undoBtn = document.getElementById('undoBtn');
const resetBtn = document.getElementById('resetBtn');
const downloadBtn = document.getElementById('downloadBtn');
const newImageBtn = document.getElementById('newImageBtn');
const examplesSection = document.getElementById('examplesSection');

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

    // File upload
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    fileInput.addEventListener('change', handleFileSelect);

    // Extend amount
    extendAmountSlider.addEventListener('input', (e) => {
        extendAmount = parseInt(e.target.value);
        extendAmountInput.value = extendAmount;
    });

    extendAmountInput.addEventListener('change', (e) => {
        extendAmount = Math.min(1000, Math.max(10, parseInt(e.target.value) || 100));
        extendAmountSlider.value = Math.min(500, extendAmount);
        extendAmountInput.value = extendAmount;
    });

    // Blend amount
    blendAmountSlider.addEventListener('input', (e) => {
        blendAmount = parseInt(e.target.value);
        blendAmountValue.textContent = `${blendAmount}%`;
    });

    // Mode buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            extendMode = btn.getAttribute('data-mode');

            // Show/hide color picker
            colorPickerGroup.style.display = extendMode === 'color' ? 'block' : 'none';
            document.getElementById('blendGroup').style.display = extendMode === 'color' ? 'none' : 'block';
        });
    });

    // Fill color
    fillColorInput.addEventListener('input', (e) => {
        fillColor = e.target.value;
    });

    // Sample color from edge
    sampleColorBtn.addEventListener('click', sampleEdgeColor);

    // Expand buttons
    document.getElementById('expandTop').addEventListener('click', () => expandDirection('top'));
    document.getElementById('expandRight').addEventListener('click', () => expandDirection('right'));
    document.getElementById('expandBottom').addEventListener('click', () => expandDirection('bottom'));
    document.getElementById('expandLeft').addEventListener('click', () => expandDirection('left'));

    // Quick actions
    document.getElementById('expandAllBtn').addEventListener('click', expandAll);
    document.getElementById('expand16x9Btn').addEventListener('click', () => expandToRatio(16, 9));
    document.getElementById('expand1x1Btn').addEventListener('click', () => expandToRatio(1, 1));
    document.getElementById('expand4x3Btn').addEventListener('click', () => expandToRatio(4, 3));

    // Action buttons
    undoBtn.addEventListener('click', undo);
    resetBtn.addEventListener('click', reset);
    downloadBtn.addEventListener('click', downloadResult);
    newImageBtn.addEventListener('click', selectNewImage);

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
        loadImage(e.target.result);
    };
    reader.readAsDataURL(file);
}

function loadExampleImage(url) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
        // Create a canvas to convert to data URL
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(img, 0, 0);
        loadImage(tempCanvas.toDataURL('image/png'));
    };
    img.onerror = () => {
        console.error('Failed to load example image');
    };
    img.src = url;
}

function loadImage(dataUrl) {
    const img = new Image();
    img.onload = () => {
        originalImage = img;
        historyStack = [];

        // Set canvas size
        previewCanvas.width = img.width;
        previewCanvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Save current state
        currentImageData = ctx.getImageData(0, 0, previewCanvas.width, previewCanvas.height);

        // Update UI
        updateSizeDisplay();
        uploadArea.style.display = 'none';
        editorArea.style.display = 'block';
        examplesSection.style.display = 'none';
        undoBtn.disabled = true;
    };
    img.src = dataUrl;
}

function updateSizeDisplay() {
    if (originalImage) {
        originalSizeEl.textContent = `${originalImage.width} × ${originalImage.height}`;
    }
    currentSizeEl.textContent = `${previewCanvas.width} × ${previewCanvas.height}`;
}

function saveToHistory() {
    historyStack.push({
        width: previewCanvas.width,
        height: previewCanvas.height,
        data: ctx.getImageData(0, 0, previewCanvas.width, previewCanvas.height)
    });
    undoBtn.disabled = false;
}

function expandDirection(direction) {
    if (!currentImageData) return;

    saveToHistory();

    const oldWidth = previewCanvas.width;
    const oldHeight = previewCanvas.height;
    const amount = extendAmount;

    // Calculate new dimensions
    let newWidth = oldWidth;
    let newHeight = oldHeight;
    let offsetX = 0;
    let offsetY = 0;

    switch (direction) {
        case 'top':
            newHeight = oldHeight + amount;
            offsetY = amount;
            break;
        case 'bottom':
            newHeight = oldHeight + amount;
            break;
        case 'left':
            newWidth = oldWidth + amount;
            offsetX = amount;
            break;
        case 'right':
            newWidth = oldWidth + amount;
            break;
    }

    // Create temporary canvas with old content
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = oldWidth;
    tempCanvas.height = oldHeight;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.putImageData(currentImageData, 0, 0);

    // Resize main canvas
    previewCanvas.width = newWidth;
    previewCanvas.height = newHeight;

    // Fill extended area
    fillExtendedArea(direction, tempCanvas, offsetX, offsetY, amount);

    // Draw original image
    ctx.drawImage(tempCanvas, offsetX, offsetY);

    // Update current image data
    currentImageData = ctx.getImageData(0, 0, previewCanvas.width, previewCanvas.height);
    updateSizeDisplay();
}

function fillExtendedArea(direction, sourceCanvas, offsetX, offsetY, amount) {
    const sourceCtx = sourceCanvas.getContext('2d');
    const oldWidth = sourceCanvas.width;
    const oldHeight = sourceCanvas.height;
    const blend = blendAmount / 100;

    switch (extendMode) {
        case 'mirror':
            fillMirror(direction, sourceCanvas, offsetX, offsetY, amount, blend);
            break;
        case 'repeat':
            fillRepeat(direction, sourceCanvas, offsetX, offsetY, amount);
            break;
        case 'stretch':
            fillStretch(direction, sourceCanvas, offsetX, offsetY, amount, blend);
            break;
        case 'color':
            fillSolidColor(direction, amount, offsetX, offsetY, oldWidth, oldHeight, blend);
            break;
    }
}

function fillMirror(direction, sourceCanvas, offsetX, offsetY, amount, blend) {
    const oldWidth = sourceCanvas.width;
    const oldHeight = sourceCanvas.height;

    ctx.save();

    switch (direction) {
        case 'top':
            // Flip and draw top portion
            ctx.translate(offsetX, amount);
            ctx.scale(1, -1);
            ctx.drawImage(sourceCanvas, 0, 0, oldWidth, Math.min(amount, oldHeight), 0, 0, oldWidth, amount);
            break;
        case 'bottom':
            ctx.translate(offsetX, oldHeight + offsetY);
            ctx.scale(1, -1);
            ctx.drawImage(sourceCanvas, 0, Math.max(0, oldHeight - amount), oldWidth, Math.min(amount, oldHeight), 0, 0, oldWidth, amount);
            break;
        case 'left':
            ctx.translate(amount, offsetY);
            ctx.scale(-1, 1);
            ctx.drawImage(sourceCanvas, 0, 0, Math.min(amount, oldWidth), oldHeight, 0, 0, amount, oldHeight);
            break;
        case 'right':
            ctx.translate(oldWidth + offsetX, offsetY);
            ctx.scale(-1, 1);
            ctx.drawImage(sourceCanvas, Math.max(0, oldWidth - amount), 0, Math.min(amount, oldWidth), oldHeight, 0, 0, amount, oldHeight);
            break;
    }

    ctx.restore();

    // Apply blend gradient
    applyBlendGradient(direction, offsetX, offsetY, amount, oldWidth, oldHeight, blend);
}

function fillRepeat(direction, sourceCanvas, offsetX, offsetY, amount) {
    const oldWidth = sourceCanvas.width;
    const oldHeight = sourceCanvas.height;
    const sampleSize = 50; // Sample strip width

    switch (direction) {
        case 'top':
            for (let y = 0; y < amount; y += sampleSize) {
                const h = Math.min(sampleSize, amount - y);
                ctx.drawImage(sourceCanvas, 0, 0, oldWidth, sampleSize, offsetX, y, oldWidth, h);
            }
            break;
        case 'bottom':
            for (let y = 0; y < amount; y += sampleSize) {
                const h = Math.min(sampleSize, amount - y);
                ctx.drawImage(sourceCanvas, 0, oldHeight - sampleSize, oldWidth, sampleSize, offsetX, oldHeight + offsetY + y, oldWidth, h);
            }
            break;
        case 'left':
            for (let x = 0; x < amount; x += sampleSize) {
                const w = Math.min(sampleSize, amount - x);
                ctx.drawImage(sourceCanvas, 0, 0, sampleSize, oldHeight, x, offsetY, w, oldHeight);
            }
            break;
        case 'right':
            for (let x = 0; x < amount; x += sampleSize) {
                const w = Math.min(sampleSize, amount - x);
                ctx.drawImage(sourceCanvas, oldWidth - sampleSize, 0, sampleSize, oldHeight, oldWidth + offsetX + x, offsetY, w, oldHeight);
            }
            break;
    }
}

function fillStretch(direction, sourceCanvas, offsetX, offsetY, amount, blend) {
    const oldWidth = sourceCanvas.width;
    const oldHeight = sourceCanvas.height;
    const sourceCtx = sourceCanvas.getContext('2d');

    switch (direction) {
        case 'top':
            // Sample top row and stretch
            const topRow = sourceCtx.getImageData(0, 0, oldWidth, 1);
            for (let y = 0; y < amount; y++) {
                const alpha = blend * (1 - y / amount);
                ctx.globalAlpha = 1;
                ctx.putImageData(topRow, offsetX, y);
            }
            ctx.globalAlpha = 1;
            break;
        case 'bottom':
            const bottomRow = sourceCtx.getImageData(0, oldHeight - 1, oldWidth, 1);
            for (let y = 0; y < amount; y++) {
                ctx.putImageData(bottomRow, offsetX, oldHeight + offsetY + y);
            }
            break;
        case 'left':
            const leftCol = sourceCtx.getImageData(0, 0, 1, oldHeight);
            for (let x = 0; x < amount; x++) {
                ctx.putImageData(leftCol, x, offsetY);
            }
            break;
        case 'right':
            const rightCol = sourceCtx.getImageData(oldWidth - 1, 0, 1, oldHeight);
            for (let x = 0; x < amount; x++) {
                ctx.putImageData(rightCol, oldWidth + offsetX + x, offsetY);
            }
            break;
    }

    // Apply gradient fade
    applyBlendGradient(direction, offsetX, offsetY, amount, oldWidth, oldHeight, blend);
}

function fillSolidColor(direction, amount, offsetX, offsetY, oldWidth, oldHeight, blend) {
    ctx.fillStyle = fillColor;

    switch (direction) {
        case 'top':
            ctx.fillRect(offsetX, 0, oldWidth, amount);
            break;
        case 'bottom':
            ctx.fillRect(offsetX, oldHeight + offsetY, oldWidth, amount);
            break;
        case 'left':
            ctx.fillRect(0, offsetY, amount, oldHeight);
            break;
        case 'right':
            ctx.fillRect(oldWidth + offsetX, offsetY, amount, oldHeight);
            break;
    }
}

function applyBlendGradient(direction, offsetX, offsetY, amount, oldWidth, oldHeight, blend) {
    if (blend <= 0) return;

    const gradientLength = Math.min(amount * blend, amount);
    let gradient;

    ctx.globalCompositeOperation = 'destination-in';

    switch (direction) {
        case 'top':
            gradient = ctx.createLinearGradient(0, 0, 0, gradientLength);
            gradient.addColorStop(0, 'rgba(255,255,255,0)');
            gradient.addColorStop(1, 'rgba(255,255,255,1)');
            ctx.fillStyle = gradient;
            ctx.fillRect(offsetX, 0, oldWidth, gradientLength);
            break;
        case 'bottom':
            gradient = ctx.createLinearGradient(0, oldHeight + offsetY + amount, 0, oldHeight + offsetY + amount - gradientLength);
            gradient.addColorStop(0, 'rgba(255,255,255,0)');
            gradient.addColorStop(1, 'rgba(255,255,255,1)');
            ctx.fillStyle = gradient;
            ctx.fillRect(offsetX, oldHeight + offsetY + amount - gradientLength, oldWidth, gradientLength);
            break;
        case 'left':
            gradient = ctx.createLinearGradient(0, 0, gradientLength, 0);
            gradient.addColorStop(0, 'rgba(255,255,255,0)');
            gradient.addColorStop(1, 'rgba(255,255,255,1)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, offsetY, gradientLength, oldHeight);
            break;
        case 'right':
            gradient = ctx.createLinearGradient(oldWidth + offsetX + amount, 0, oldWidth + offsetX + amount - gradientLength, 0);
            gradient.addColorStop(0, 'rgba(255,255,255,0)');
            gradient.addColorStop(1, 'rgba(255,255,255,1)');
            ctx.fillStyle = gradient;
            ctx.fillRect(oldWidth + offsetX + amount - gradientLength, offsetY, gradientLength, oldHeight);
            break;
    }

    ctx.globalCompositeOperation = 'source-over';
}

function expandAll() {
    expandDirection('top');
    expandDirection('right');
    expandDirection('bottom');
    expandDirection('left');
}

function expandToRatio(ratioW, ratioH) {
    if (!currentImageData) return;

    const currentWidth = previewCanvas.width;
    const currentHeight = previewCanvas.height;
    const currentRatio = currentWidth / currentHeight;
    const targetRatio = ratioW / ratioH;

    if (Math.abs(currentRatio - targetRatio) < 0.01) return; // Already at ratio

    if (currentRatio < targetRatio) {
        // Need to expand width
        const targetWidth = Math.round(currentHeight * targetRatio);
        const totalExpand = targetWidth - currentWidth;
        const expandEach = Math.round(totalExpand / 2);

        extendAmount = expandEach;
        expandDirection('left');
        extendAmount = totalExpand - expandEach;
        expandDirection('right');
        extendAmount = 100; // Reset
    } else {
        // Need to expand height
        const targetHeight = Math.round(currentWidth / targetRatio);
        const totalExpand = targetHeight - currentHeight;
        const expandEach = Math.round(totalExpand / 2);

        extendAmount = expandEach;
        expandDirection('top');
        extendAmount = totalExpand - expandEach;
        expandDirection('bottom');
        extendAmount = 100; // Reset
    }
}

function sampleEdgeColor() {
    if (!currentImageData) return;

    const width = previewCanvas.width;
    const height = previewCanvas.height;
    const data = currentImageData.data;

    // Sample colors from all edges
    let r = 0, g = 0, b = 0, count = 0;

    // Top edge
    for (let x = 0; x < width; x++) {
        const i = x * 4;
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count++;
    }

    // Bottom edge
    for (let x = 0; x < width; x++) {
        const i = ((height - 1) * width + x) * 4;
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count++;
    }

    // Left edge
    for (let y = 0; y < height; y++) {
        const i = (y * width) * 4;
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count++;
    }

    // Right edge
    for (let y = 0; y < height; y++) {
        const i = (y * width + width - 1) * 4;
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count++;
    }

    // Average
    r = Math.round(r / count);
    g = Math.round(g / count);
    b = Math.round(b / count);

    // Convert to hex
    fillColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    fillColorInput.value = fillColor;
}

function undo() {
    if (historyStack.length === 0) return;

    const previous = historyStack.pop();
    previewCanvas.width = previous.width;
    previewCanvas.height = previous.height;
    ctx.putImageData(previous.data, 0, 0);
    currentImageData = ctx.getImageData(0, 0, previewCanvas.width, previewCanvas.height);

    updateSizeDisplay();
    undoBtn.disabled = historyStack.length === 0;
}

function reset() {
    if (!originalImage) return;

    historyStack = [];
    previewCanvas.width = originalImage.width;
    previewCanvas.height = originalImage.height;
    ctx.drawImage(originalImage, 0, 0);
    currentImageData = ctx.getImageData(0, 0, previewCanvas.width, previewCanvas.height);

    updateSizeDisplay();
    undoBtn.disabled = true;
}

function downloadResult() {
    const link = document.createElement('a');
    link.download = `extended-background-${Date.now()}.png`;
    link.href = previewCanvas.toDataURL('image/png');
    link.click();
}

function selectNewImage() {
    originalImage = null;
    currentImageData = null;
    historyStack = [];
    fileInput.value = '';

    editorArea.style.display = 'none';
    uploadArea.style.display = 'block';
    examplesSection.style.display = 'block';
}
