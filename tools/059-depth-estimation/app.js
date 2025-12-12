/**
 * Depth Estimation
 * Tool #059 - Awesome AI Local Tools
 *
 * Estimate depth using Depth Anything / MiDaS via Transformers.js
 */

const translations = {
    'zh-TW': {
        title: '深度估計',
        subtitle: '從單張圖片估計深度資訊，生成深度圖',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        modelNotLoaded: '模型未載入',
        loadModel: '載入模型',
        loading: '載入中...',
        ready: '模型已就緒',
        original: '原圖',
        depthMap: '深度圖',
        process: '生成深度圖',
        download: '下載',
        useCases: '使用場景',
        useCase3D: '3D 重建輔助',
        useCaseBokeh: '人像景深模擬',
        useCaseAR: 'AR 特效遮擋',
        backToHome: '返回首頁',
        toolNumber: '工具 #059',
        copyright: 'Awesome AI Local Tools © 2024'
    },
    'en': {
        title: 'Depth Estimation',
        subtitle: 'Estimate depth map from single image locally',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        modelNotLoaded: 'Model not loaded',
        loadModel: 'Load Model',
        loading: 'Loading...',
        ready: 'Model ready',
        original: 'Original',
        depthMap: 'Depth Map',
        process: 'Generate Depth',
        download: 'Download',
        useCases: 'Use Cases',
        useCase3D: '3D Reconstruction',
        useCaseBokeh: 'Bokeh Simulation',
        useCaseAR: 'AR Occlusion',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #059',
        copyright: 'Awesome AI Local Tools © 2024'
    }
};

let currentLang = 'zh-TW';
let processor, model;

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

    document.getElementById('loadModelBtn').addEventListener('click', loadModel);

    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const preview = document.getElementById('previewContainer');

    uploadArea.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.innerHTML = `<img src="${e.target.result}" id="inputImage" />`;
                if (model) document.getElementById('processBtn').disabled = false;
            };
            reader.readAsDataURL(file);
        }
    });

    document.getElementById('processBtn').addEventListener('click', processImage);
    document.getElementById('downloadBtn').addEventListener('click', downloadResult);
}

async function loadModel() {
    const btn = document.getElementById('loadModelBtn');
    const status = document.getElementById('statusText');
    const indicator = document.getElementById('statusIndicator');

    btn.disabled = true;
    status.textContent = translations[currentLang].loading;

    try {
        const { AutoProcessor, AutoModelForDepthEstimation, env, RawImage } = await import('../../assets/js/transformers.js');

        env.allowLocalModels = true;
        env.useBrowserCache = false;
        env.backends.onnx.wasm.wasmPaths = '../../assets/js/';

        window.RawImage = RawImage;

        const modelId = '../../assets/models/Xenova/depth-anything-small-hf';

        processor = await AutoProcessor.from_pretrained(modelId);
        model = await AutoModelForDepthEstimation.from_pretrained(modelId);

        status.textContent = translations[currentLang].ready;
        indicator.classList.add('ready');
        btn.style.display = 'none';

        if (document.getElementById('inputImage')) {
            document.getElementById('processBtn').disabled = false;
        }

    } catch (e) {
        console.error(e);
        status.textContent = "Error loading model. Ensure files are downloaded.";
        btn.disabled = false;
    }
}

async function processImage() {
    if (!model) return;

    const btn = document.getElementById('processBtn');
    btn.disabled = true;
    btn.textContent = '...';

    const imgSrc = document.getElementById('inputImage').src;

    try {
        const image = await window.RawImage.fromURL(imgSrc);
        const { pixel_values } = await processor(image);
        const { predicted_depth } = await model({ pixel_values });

        // Visualize depth
        // Normalize depth map to 0-255
        const depthData = predicted_depth.data;
        let min = Infinity, max = -Infinity;
        for (let i = 0; i < depthData.length; ++i) {
            if (depthData[i] < min) min = depthData[i];
            if (depthData[i] > max) max = depthData[i];
        }

        const range = max - min;
        const dims = predicted_depth.dims; // [batch, 1, height, width] usually
        const width = dims[3];
        const height = dims[2];

        const canvas = document.getElementById('resultCanvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        const imageData = ctx.createImageData(width, height);

        for (let i = 0; i < depthData.length; ++i) {
            const val = Math.floor(((depthData[i] - min) / range) * 255);
            // Grayscale (or colormap)
            imageData.data[i * 4] = val;
            imageData.data[i * 4 + 1] = val;
            imageData.data[i * 4 + 2] = val;
            imageData.data[i * 4 + 3] = 255;
        }

        ctx.putImageData(imageData, 0, 0);

        document.getElementById('downloadBtn').disabled = false;

    } catch (e) {
        console.error(e);
        alert('Error processing image');
    } finally {
        btn.textContent = translations[currentLang].process;
        btn.disabled = false;
    }
}

function downloadResult() {
    const canvas = document.getElementById('resultCanvas');
    const link = document.createElement('a');
    link.download = `depth-map-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}
