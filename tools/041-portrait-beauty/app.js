/**
 * AI Portrait Beauty
 * Tool #041 - Awesome AI Local Tools
 *
 * Smart beauty using OpenCV.js (Bilateral Filter, Edge Detection)
 */

const translations = {
    'zh-TW': {
        title: 'AI 人像美化',
        subtitle: '智慧美顏，包含磨皮、美白、瘦臉等功能',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        uploadText: '點擊或拖放圖片到這裡',
        uploadHint: '支援 JPG、PNG、WebP 格式',
        beautySettings: '美顏設定',
        smoothing: '磨皮程度',
        whitening: '美白程度',
        sharpening: '清晰度',
        slimming: '瘦臉 (即將推出)',
        compare: '按住對比',
        reset: '重設',
        download: '下載結果',
        newImage: '選擇新圖片',
        originalSize: '原始尺寸',
        useCases: '使用場景',
        useCaseSelfie: '自拍美化',
        useCaseProfile: '個人頭像優化',
        useCasePhoto: '人像攝影後製',
        backToHome: '返回首頁',
        toolNumber: '工具 #041',
        copyright: 'Awesome AI Local Tools © 2024'
    },
    'en': {
        title: 'AI Portrait Beauty',
        subtitle: 'Smart beauty for smoothing, whitening, and more',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        uploadText: 'Click or drag image here',
        uploadHint: 'Supports JPG, PNG, WebP formats',
        beautySettings: 'Beauty Settings',
        smoothing: 'Smoothing',
        whitening: 'Whitening',
        sharpening: 'Sharpening',
        slimming: 'Face Slimming (Coming Soon)',
        compare: 'Hold to Compare',
        reset: 'Reset',
        download: 'Download',
        newImage: 'New Image',
        originalSize: 'Original Size',
        useCases: 'Use Cases',
        useCaseSelfie: 'Selfie Beauty',
        useCaseProfile: 'Profile Enhancement',
        useCasePhoto: 'Portrait Post-processing',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #041',
        copyright: 'Awesome AI Local Tools © 2024'
    }
};

let currentLang = 'zh-TW';
let originalMat = null;
let processedMat = null;
let canvas;
let ctx;
let isOpenCvReady = false;

// State
let state = {
    smoothing: 50,
    whitening: 30,
    sharpening: 20
};

// Global callback for OpenCV
window.onOpenCvReady = function() {
    console.log('OpenCV.js is ready');
    isOpenCvReady = true;
};

document.addEventListener('DOMContentLoaded', () => {
    initLanguage();
    initEventListeners();
    canvas = document.getElementById('previewCanvas');
    ctx = canvas.getContext('2d');
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
        if (t[key]) el.textContent = t[key];
    });

    const langZhBtn = document.getElementById('lang-zh');
    const langEnBtn = document.getElementById('lang-en');

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
    document.getElementById('lang-zh').addEventListener('click', () => { currentLang = 'zh-TW'; updateLanguage(); });
    document.getElementById('lang-en').addEventListener('click', () => { currentLang = 'en'; updateLanguage(); });

    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('dragover'); });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        if (e.dataTransfer.files.length) processFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', (e) => { if (e.target.files.length) processFile(e.target.files[0]); });

    // Sliders
    const bindSlider = (id, prop) => {
        const slider = document.getElementById(id + 'Slider');
        const valueDisplay = document.getElementById(id + 'Value');
        slider.addEventListener('input', (e) => {
            state[prop] = parseInt(e.target.value);
            valueDisplay.textContent = state[prop] + '%';
        });
        slider.addEventListener('change', applyFilters); // Apply on release for heavy ops
    };

    bindSlider('smoothing', 'smoothing');
    bindSlider('whitening', 'whitening');
    bindSlider('sharpening', 'sharpening');

    // Compare Button
    const compareBtn = document.getElementById('compareBtn');
    compareBtn.addEventListener('mousedown', showOriginal);
    compareBtn.addEventListener('touchstart', showOriginal);
    compareBtn.addEventListener('mouseup', showProcessed);
    compareBtn.addEventListener('touchend', showProcessed);
    compareBtn.addEventListener('mouseleave', showProcessed);

    document.getElementById('resetBtn').addEventListener('click', resetControls);
    document.getElementById('downloadBtn').addEventListener('click', downloadResult);
    document.getElementById('newImageBtn').addEventListener('click', () => location.reload());
}

function processFile(file) {
    if (!isOpenCvReady) {
        alert('OpenCV is loading, please wait...');
        return;
    }
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => loadImage(e.target.result);
    reader.readAsDataURL(file);
}

function loadImage(src) {
    const img = new Image();
    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        document.getElementById('originalSize').textContent = `${img.width} x ${img.height}`;

        originalMat = cv.imread(canvas);
        processedMat = new cv.Mat();

        document.getElementById('uploadArea').style.display = 'none';
        document.getElementById('editorArea').style.display = 'block';

        applyFilters();
    };
    img.src = src;
}

function applyFilters() {
    if (!originalMat) return;

    // Show loading?

    // Start with a clone
    let tempMat = originalMat.clone();

    // 1. Smoothing (Bilateral Filter)
    // d: diameter of pixel neighborhood
    // sigmaColor: filter sigma in color space
    // sigmaSpace: filter sigma in coordinate space
    if (state.smoothing > 0) {
        let d = Math.max(1, Math.round(state.smoothing / 5)); // 1-20
        let sigmaColor = state.smoothing * 2;
        let sigmaSpace = state.smoothing / 2;

        // Downscale for speed if image is huge?
        // For now, full res. Bilateral is slow.
        let smoothed = new cv.Mat();
        cv.cvtColor(tempMat, tempMat, cv.COLOR_RGBA2RGB); // Bilateral needs RGB
        cv.bilateralFilter(tempMat, smoothed, 9, sigmaColor, sigmaSpace, cv.BORDER_DEFAULT);

        // Convert back to RGBA
        cv.cvtColor(smoothed, smoothed, cv.COLOR_RGB2RGBA);

        // Blend based on smoothing amount? No, bilateral strength is controlled by sigma
        tempMat.delete();
        tempMat = smoothed;
    }

    // 2. Whitening (Brightness/Beta)
    if (state.whitening > 0) {
        // Simple brightness increase
        // beta: 0-100
        let beta = state.whitening;
        tempMat.convertTo(tempMat, -1, 1, beta);
    }

    // 3. Sharpening (Unsharp Mask)
    if (state.sharpening > 0) {
        let blurred = new cv.Mat();
        let ksize = new cv.Size(0, 0);
        cv.GaussianBlur(tempMat, blurred, ksize, 3);
        cv.addWeighted(tempMat, 1.5 + (state.sharpening / 100), blurred, -0.5 - (state.sharpening / 100), 0, tempMat);
        blurred.delete();
    }

    processedMat.delete();
    processedMat = tempMat;

    cv.imshow('previewCanvas', processedMat);
}

function showOriginal() {
    if (originalMat) {
        cv.imshow('previewCanvas', originalMat);
    }
}

function showProcessed() {
    if (processedMat) {
        cv.imshow('previewCanvas', processedMat);
    }
}

function resetControls() {
    state = {
        smoothing: 50,
        whitening: 30,
        sharpening: 20
    };

    document.getElementById('smoothingSlider').value = 50;
    document.getElementById('smoothingValue').textContent = '50%';

    document.getElementById('whiteningSlider').value = 30;
    document.getElementById('whiteningValue').textContent = '30%';

    document.getElementById('sharpeningSlider').value = 20;
    document.getElementById('sharpeningValue').textContent = '20%';

    applyFilters();
}

function downloadResult() {
    const link = document.createElement('a');
    link.download = `beauty-portrait-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}
