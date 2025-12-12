/**
 * Image Similarity
 * Tool #058 - Awesome AI Local Tools
 *
 * Calculate semantic similarity between two images using MobileCLIP
 */

const translations = {
    'zh-TW': {
        title: '圖片相似度比對',
        subtitle: '比較兩張圖片的相似程度，支援語義特徵分析',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        modelNotLoaded: '模型未載入',
        loadModel: '載入模型',
        loading: '載入中...',
        ready: '模型已就緒',
        image1: '圖片 1',
        image2: '圖片 2',
        similarity: '相似度',
        compare: '開始比對',
        useCases: '使用場景',
        useCaseDuplicate: '重複圖片檢查',
        useCaseStyle: '風格一致性分析',
        useCaseProduct: '商品比對',
        backToHome: '返回首頁',
        toolNumber: '工具 #058',
        copyright: 'Awesome AI Local Tools © 2024'
    },
    'en': {
        title: 'Image Similarity',
        subtitle: 'Compare image similarity using semantic analysis',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        modelNotLoaded: 'Model not loaded',
        loadModel: 'Load Model',
        loading: 'Loading...',
        ready: 'Model ready',
        image1: 'Image 1',
        image2: 'Image 2',
        similarity: 'Similarity',
        compare: 'Compare',
        useCases: 'Use Cases',
        useCaseDuplicate: 'Duplicate Check',
        useCaseStyle: 'Style Consistency',
        useCaseProduct: 'Product Matching',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #058',
        copyright: 'Awesome AI Local Tools © 2024'
    }
};

let currentLang = 'zh-TW';
let processor, vision_model;
let img1Features, img2Features;

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

    setupUpload('1');
    setupUpload('2');

    document.getElementById('compareBtn').addEventListener('click', compareImages);
}

function setupUpload(id) {
    const uploadArea = document.getElementById(`uploadArea${id}`);
    const fileInput = document.getElementById(`fileInput${id}`);
    const preview = document.getElementById(`preview${id}`);

    uploadArea.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.innerHTML = `<img src="${e.target.result}" id="img${id}" />`;
                checkReady();
            };
            reader.readAsDataURL(file);
        }
    });
}

async function loadModel() {
    const btn = document.getElementById('loadModelBtn');
    const status = document.getElementById('statusText');
    const indicator = document.getElementById('statusIndicator');

    btn.disabled = true;
    status.textContent = translations[currentLang].loading;

    try {
        const { AutoProcessor, CLIPVisionModelWithProjection, env, RawImage } = await import('../../assets/js/transformers.js');

        env.allowLocalModels = true;
        env.useBrowserCache = false;
        env.backends.onnx.wasm.wasmPaths = '../../assets/js/';

        window.RawImage = RawImage;

        const modelId = '../../assets/models/Xenova/clip-vit-base-patch32';

        // Load only vision components
        processor = await AutoProcessor.from_pretrained(modelId);
        vision_model = await CLIPVisionModelWithProjection.from_pretrained(modelId);

        status.textContent = translations[currentLang].ready;
        indicator.classList.add('ready');
        btn.style.display = 'none';

        checkReady();

    } catch (e) {
        console.error(e);
        status.textContent = "Error loading model. Check console and ensure assets are downloaded.";
        btn.disabled = false;
    }
}

function checkReady() {
    const img1 = document.getElementById('img1');
    const img2 = document.getElementById('img2');
    const btn = document.getElementById('compareBtn');

    if (img1 && img2 && vision_model) {
        btn.disabled = false;
    }
}

function cosineSimilarity(a, b) {
    let dot = 0;
    let magA = 0;
    let magB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        magA += a[i] * a[i];
        magB += b[i] * b[i];
    }
    return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

async function compareImages() {
    if (!vision_model) return;

    const btn = document.getElementById('compareBtn');
    btn.disabled = true;
    btn.textContent = '...';

    const img1Src = document.getElementById('img1').src;
    const img2Src = document.getElementById('img2').src;

    try {
        const image1 = await window.RawImage.fromURL(img1Src);
        const image2 = await window.RawImage.fromURL(img2Src);

        const image_inputs1 = await processor(image1);
        const image_inputs2 = await processor(image2);

        const { image_embeds: embed1 } = await vision_model(image_inputs1);
        const { image_embeds: embed2 } = await vision_model(image_inputs2);

        const sim = cosineSimilarity(embed1.data, embed2.data);

        const score = Math.round(sim * 100);
        document.getElementById('similarityScore').textContent = `${score}%`;

        // Color code
        const circle = document.querySelector('.score-circle');
        if (score > 80) circle.style.borderColor = '#22c55e';
        else if (score > 50) circle.style.borderColor = '#eab308';
        else circle.style.borderColor = '#ef4444';

    } catch (e) {
        console.error(e);
        alert('Error during comparison');
    } finally {
        btn.textContent = translations[currentLang].compare;
        btn.disabled = false;
    }
}
