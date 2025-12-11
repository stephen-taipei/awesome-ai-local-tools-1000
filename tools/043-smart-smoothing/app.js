/**
 * Smart Smoothing
 * Tool #043 - Awesome AI Local Tools
 *
 * Advanced smoothing preserving texture using OpenCV.js
 */

const translations = {
    'zh-TW': {
        title: '智慧磨皮',
        subtitle: '保留皮膚紋理的智慧磨皮，讓肌膚看起來自然無瑕',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        uploadText: '點擊或拖放圖片到這裡',
        uploadHint: '支援 JPG、PNG、WebP 格式',
        settings: '磨皮設定',
        strength: '磨皮強度',
        strengthHelp: '控制模糊程度，數值越高皮膚越光滑',
        texture: '紋理保留',
        textureHelp: '控制細節保留程度，避免過度模糊',
        compare: '按住對比',
        reset: '重設',
        download: '下載結果',
        newImage: '選擇新圖片',
        originalSize: '原始尺寸',
        useCases: '使用場景',
        useCasePortrait: '人像攝影',
        useCaseMakeup: '美妝展示',
        useCaseRestore: '老照片修飾',
        backToHome: '返回首頁',
        toolNumber: '工具 #043',
        copyright: 'Awesome AI Local Tools © 2024'
    },
    'en': {
        title: 'Smart Smoothing',
        subtitle: 'Intelligent skin smoothing preserving texture',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        uploadText: 'Click or drag image here',
        uploadHint: 'Supports JPG, PNG, WebP formats',
        settings: 'Smoothing Settings',
        strength: 'Smoothing Strength',
        strengthHelp: 'Controls blur amount, higher means smoother skin',
        texture: 'Texture Preservation',
        textureHelp: 'Controls detail preservation to avoid plastic look',
        compare: 'Hold to Compare',
        reset: 'Reset',
        download: 'Download',
        newImage: 'New Image',
        originalSize: 'Original Size',
        useCases: 'Use Cases',
        useCasePortrait: 'Portrait Photography',
        useCaseMakeup: 'Makeup Showcase',
        useCaseRestore: 'Old Photo Restoration',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #043',
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
    strength: 50,
    texture: 70
};

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

    const bindSlider = (id, prop) => {
        const slider = document.getElementById(id + 'Slider');
        const valueDisplay = document.getElementById(id + 'Value');
        slider.addEventListener('input', (e) => {
            state[prop] = parseInt(e.target.value);
            valueDisplay.textContent = state[prop] + '%';
        });
        slider.addEventListener('change', applyFilters);
    };

    bindSlider('strength', 'strength');
    bindSlider('texture', 'texture');

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

    let tempMat = originalMat.clone();
    cv.cvtColor(tempMat, tempMat, cv.COLOR_RGBA2RGB);

    if (state.strength > 0) {
        // High Pass Skin Smoothing Logic
        // 1. Bilateral Blur to get base skin
        // 2. High Pass to get texture
        // 3. Blend based on texture slider

        let blurAmount = Math.max(1, Math.round(state.strength / 4));
        let sigmaColor = state.strength;
        let sigmaSpace = state.strength / 3;

        let smoothed = new cv.Mat();
        // Bilateral filter preserves edges but smooths flat areas (skin)
        cv.bilateralFilter(tempMat, smoothed, 9, sigmaColor, sigmaSpace, cv.BORDER_DEFAULT);

        // Texture preservation logic:
        // Mix original and smoothed based on edge detection or simple blending?
        // Let's use simple blending weighted by the "Texture" slider.
        // If Texture is 100%, we want more of the original details back.
        // Actually, "Smart Smoothing" usually means "smooth skin but keep edges".
        // The texture slider here will control opacity of the smoothed version vs original.

        // But we want to smooth skin ONLY.
        // A simple approach:
        // High Pass = Original - GaussianBlur(Original)
        // Result = Smoothed + High Pass * TextureFactor

        // Let's try:
        // Base = Bilateral Smoothed
        // Detail = Original - Bilateral Smoothed (High freq)
        // Result = Base + Detail * (Texture / 100)

        // Calculate Detail
        let detail = new cv.Mat();
        cv.subtract(tempMat, smoothed, detail);

        // Scale Detail
        let scaledDetail = new cv.Mat();
        let textureScale = state.texture / 100.0;

        // cv.scaleAdd(detail, textureScale, smoothed, final); ? No scaleAdd in JS binding usually convenient
        // Using addWeighted: dst = src1*alpha + src2*beta + gamma
        // Result = Smoothed * 1.0 + Detail * TextureScale

        let result = new cv.Mat();
        cv.addWeighted(smoothed, 1.0, detail, textureScale, 0, result);

        cv.cvtColor(result, result, cv.COLOR_RGB2RGBA);

        if (processedMat) processedMat.delete();
        processedMat = result;

        smoothed.delete();
        detail.delete();
        scaledDetail.delete(); // unused
    } else {
        if (processedMat) processedMat.delete();
        processedMat = originalMat.clone();
    }

    tempMat.delete();
    cv.imshow('previewCanvas', processedMat);
}

function showOriginal() {
    if (originalMat) cv.imshow('previewCanvas', originalMat);
}

function showProcessed() {
    if (processedMat) cv.imshow('previewCanvas', processedMat);
}

function resetControls() {
    state = {
        strength: 50,
        texture: 70
    };
    document.getElementById('strengthSlider').value = 50;
    document.getElementById('strengthValue').textContent = '50%';
    document.getElementById('textureSlider').value = 70;
    document.getElementById('textureValue').textContent = '70%';
    applyFilters();
}

function downloadResult() {
    const link = document.createElement('a');
    link.download = `smart-smooth-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}
