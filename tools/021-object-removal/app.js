/**
 * Object Removal - Tool #021
 * Simple Inpainting using a basic algorithm for the demo.
 * Ideally this should use LaMa or a similar ONNX model.
 * For this implementation, we use a simple region filling algorithm (telea-like or patch-based placeholder)
 * to demonstrate the UI flow and functionality.
 */

const translations = {
    'zh-TW': {
        title: '物件移除',
        subtitle: '智慧移除圖片中不需要的物件，自動填補背景',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        uploadText: '拖放圖片到此處或點擊上傳',
        uploadHint: '支援 PNG、JPG、WebP',
        brushSize: '筆刷大小:',
        undo: '復原',
        clearMask: '清除選區',
        uploadAnother: '重新上傳',
        removeObject: '移除物件',
        download: '下載圖片',
        processing: '處理中...',
        techSpecs: '技術規格',
        specTech: '技術核心',
        specSpeed: '處理速度',
        speedDesc: '約 1-3 秒',
        specPrivacy: '隱私保護',
        localProcessing: '100% 本地運算',
        backToHome: '返回首頁',
        toolNumber: '工具 #021',
        errorFileType: '請上傳圖片檔案'
    },
    'en': {
        title: 'Object Removal',
        subtitle: 'Intelligently remove unwanted objects and fill background',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        uploadText: 'Drag & drop image here or click to upload',
        uploadHint: 'Supports PNG, JPG, WebP',
        brushSize: 'Brush Size:',
        undo: 'Undo',
        clearMask: 'Clear Mask',
        uploadAnother: 'Upload Another',
        removeObject: 'Remove Object',
        download: 'Download',
        processing: 'Processing...',
        techSpecs: 'Technical Specs',
        specTech: 'Core Tech',
        specSpeed: 'Speed',
        speedDesc: '~ 1-3 seconds',
        specPrivacy: 'Privacy',
        localProcessing: '100% Local Processing',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #021',
        errorFileType: 'Please upload an image file'
    }
};

let currentLang = 'zh-TW';
let image = null;
let canvas, ctx;
let maskCanvas, maskCtx;
let isDrawing = false;
let brushSize = 20;
let history = [];

// DOM Elements
const elements = {
    uploadArea: document.getElementById('uploadArea'),
    fileInput: document.getElementById('fileInput'),
    editorArea: document.getElementById('editorArea'),
    mainCanvas: document.getElementById('mainCanvas'),
    brushSizeInput: document.getElementById('brushSize'),
    brushSizeVal: document.getElementById('brushSizeVal'),
    undoBtn: document.getElementById('undoBtn'),
    clearMaskBtn: document.getElementById('clearMaskBtn'),
    processBtn: document.getElementById('processBtn'),
    resetBtn: document.getElementById('resetBtn'),
    downloadBtn: document.getElementById('downloadBtn')
};

function handleFileSelect(file) {
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
        alert(translations[currentLang].errorFileType);
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        image = new Image();
        image.onload = () => {
            initCanvas();
            elements.uploadArea.style.display = 'none';
            elements.editorArea.style.display = 'block';
        };
        image.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function initCanvas() {
    canvas = elements.mainCanvas;
    ctx = canvas.getContext('2d');

    // Create an offscreen canvas for the mask
    maskCanvas = document.createElement('canvas');
    maskCtx = maskCanvas.getContext('2d');

    // Resize logic (limit max dimension)
    const maxDim = 800;
    let w = image.width;
    let h = image.height;
    if (w > maxDim || h > maxDim) {
        if (w > h) {
            h = Math.round(h * (maxDim / w));
            w = maxDim;
        } else {
            w = Math.round(w * (maxDim / h));
            h = maxDim;
        }
    }

    canvas.width = w;
    canvas.height = h;
    maskCanvas.width = w;
    maskCanvas.height = h;

    render();
    saveHistory();
}

function render() {
    // Draw image
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Draw mask overlay
    ctx.globalAlpha = 0.5;
    ctx.drawImage(maskCanvas, 0, 0);
    ctx.globalAlpha = 1.0;
}

function saveHistory() {
    if (history.length > 10) history.shift();
    history.push(maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height));
}

function undo() {
    if (history.length > 1) {
        history.pop(); // Remove current state
        const prev = history[history.length - 1];
        maskCtx.putImageData(prev, 0, 0);
        render();
    } else {
        // Clear if only initial state left
        maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
        render();
    }
}

// Simple Inpainting Algorithm (Placeholder for complex AI)
// This basically averages neighbors to fill the hole.
function simpleInpaint(imgData, maskData) {
    const w = imgData.width;
    const h = imgData.height;
    const data = imgData.data;
    const mask = maskData.data;

    // Identify mask pixels
    const maskIndices = [];
    for (let i = 0; i < mask.length; i += 4) {
        if (mask[i + 3] > 0) { // If alpha > 0
            maskIndices.push(i);
        }
    }

    if (maskIndices.length === 0) return;

    // Multi-pass diffusion
    for (let pass = 0; pass < 20; pass++) {
        for (let idx of maskIndices) {
            let rSum = 0, gSum = 0, bSum = 0, count = 0;
            const x = (idx / 4) % w;
            const y = Math.floor((idx / 4) / w);

            // Check neighbors
            const neighbors = [
                {dx: -1, dy: 0}, {dx: 1, dy: 0},
                {dx: 0, dy: -1}, {dx: 0, dy: 1},
                {dx: -1, dy: -1}, {dx: 1, dy: -1},
                {dx: -1, dy: 1}, {dx: 1, dy: 1}
            ];

            for (let n of neighbors) {
                const nx = x + n.dx;
                const ny = y + n.dy;
                if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
                    const nIdx = (ny * w + nx) * 4;
                    // Ideally check if neighbor is not masked, but for diffusion we just use current values
                    rSum += data[nIdx];
                    gSum += data[nIdx + 1];
                    bSum += data[nIdx + 2];
                    count++;
                }
            }

            if (count > 0) {
                data[idx] = rSum / count;
                data[idx + 1] = gSum / count;
                data[idx + 2] = bSum / count;
                data[idx + 3] = 255;
            }
        }
    }
}

function processRemoval() {
    elements.processBtn.textContent = translations[currentLang].processing;
    elements.processBtn.disabled = true;

    // Allow UI update
    setTimeout(() => {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const maskData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);

        // Perform inpainting
        simpleInpaint(imgData, maskData);

        // Update canvas
        ctx.putImageData(imgData, 0, 0);

        // Clear mask
        maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);

        // Update image source for next operations
        const newImg = new Image();
        newImg.onload = () => {
            image = newImg;
            render();
            elements.processBtn.textContent = translations[currentLang].removeObject;
            elements.processBtn.disabled = false;
            elements.downloadBtn.style.display = 'inline-block';
        };
        newImg.src = canvas.toDataURL();
    }, 100);
}

function setupEventListeners() {
    // Upload
    elements.uploadArea.addEventListener('click', () => elements.fileInput.click());
    elements.fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) handleFileSelect(e.target.files[0]);
    });

    // Drag & Drop
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

    // Brush Controls
    elements.brushSizeInput.addEventListener('input', (e) => {
        brushSize = parseInt(e.target.value);
        elements.brushSizeVal.textContent = brushSize + 'px';
    });

    elements.undoBtn.addEventListener('click', undo);
    elements.clearMaskBtn.addEventListener('click', () => {
        maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
        render();
        saveHistory();
    });

    // Drawing
    elements.mainCanvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        draw(e);
    });
    elements.mainCanvas.addEventListener('mousemove', (e) => {
        if (isDrawing) draw(e);
    });
    elements.mainCanvas.addEventListener('mouseup', () => {
        if (isDrawing) {
            isDrawing = false;
            saveHistory();
        }
    });
    elements.mainCanvas.addEventListener('mouseout', () => {
        if (isDrawing) {
            isDrawing = false;
            saveHistory();
        }
    });

    function draw(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        maskCtx.lineCap = 'round';
        maskCtx.lineJoin = 'round';
        maskCtx.lineWidth = brushSize;
        maskCtx.strokeStyle = 'rgba(255, 0, 0, 0.5)'; // Red mask

        if (!isDrawing) return;

        maskCtx.beginPath();
        // Simple dot if just clicked, normally we need prevX/Y for lines
        // But for dense mousemove events, this works ok-ish or we track state
        // Let's implement better tracking
        maskCtx.moveTo(lastX, lastY);
        maskCtx.lineTo(x, y);
        maskCtx.stroke();

        lastX = x;
        lastY = y;

        render();
    }

    let lastX = 0;
    let lastY = 0;
    elements.mainCanvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        lastX = (e.clientX - rect.left) * scaleX;
        lastY = (e.clientY - rect.top) * scaleY;
    });

    // Process & Download
    elements.processBtn.addEventListener('click', processRemoval);
    elements.resetBtn.addEventListener('click', () => {
        elements.editorArea.style.display = 'none';
        elements.uploadArea.style.display = 'block';
        elements.fileInput.value = '';
        elements.downloadBtn.style.display = 'none';
        image = null;
        history = [];
    });
    elements.downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = `object-removed-${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
    });

    // Language
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
