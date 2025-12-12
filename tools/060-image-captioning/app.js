/**
 * Image Captioning
 * Tool #060 - Awesome AI Local Tools
 *
 * Generate image captions using ViT-GPT2 via Transformers.js
 */

const translations = {
    'zh-TW': {
        title: '圖片標籤生成',
        subtitle: '自動為圖片生成描述標籤，支援多種情境',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        modelNotLoaded: '模型未載入',
        loadModel: '載入模型',
        loading: '載入中...',
        ready: '模型已就緒',
        uploadText: '點擊或拖放圖片到這裡',
        uploadHint: 'AI 將自動產生描述文字',
        generatedCaption: '生成描述',
        generating: '正在生成中...',
        copy: '複製',
        newImage: '選擇新圖片',
        useCases: '使用場景',
        useCaseSEO: '圖片 SEO 優化',
        useCaseAccessibility: '無障礙輔助 (Alt Text)',
        useCaseOrganize: '數位資產管理',
        backToHome: '返回首頁',
        toolNumber: '工具 #060',
        copyright: 'Awesome AI Local Tools © 2024'
    },
    'en': {
        title: 'Image Captioning',
        subtitle: 'Generate image descriptions locally',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        modelNotLoaded: 'Model not loaded',
        loadModel: 'Load Model',
        loading: 'Loading...',
        ready: 'Model ready',
        uploadText: 'Click or drag image here',
        uploadHint: 'AI will generate a description',
        generatedCaption: 'Generated Caption',
        generating: 'Generating...',
        copy: 'Copy',
        newImage: 'New Image',
        useCases: 'Use Cases',
        useCaseSEO: 'Image SEO',
        useCaseAccessibility: 'Accessibility (Alt Text)',
        useCaseOrganize: 'Digital Asset Mgmt',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #060',
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

    uploadArea.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.getElementById('previewImage');
                img.src = e.target.result;
                document.getElementById('uploadArea').style.display = 'none';
                document.getElementById('resultArea').style.display = 'block';
                generateCaption(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    document.getElementById('newImageBtn').addEventListener('click', () => location.reload());
    document.getElementById('copyBtn').addEventListener('click', () => {
        const text = document.getElementById('captionText').textContent;
        navigator.clipboard.writeText(text);
        const btn = document.getElementById('copyBtn');
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = originalText, 1500);
    });
}

async function loadModel() {
    const btn = document.getElementById('loadModelBtn');
    const status = document.getElementById('statusText');
    const indicator = document.getElementById('statusIndicator');

    btn.disabled = true;
    status.textContent = translations[currentLang].loading;

    try {
        const { AutoProcessor, AutoModelForVision2Seq, env, RawImage } = await import('../../assets/js/transformers.js');

        env.allowLocalModels = true;
        env.useBrowserCache = false;
        env.backends.onnx.wasm.wasmPaths = '../../assets/js/';

        window.RawImage = RawImage;

        const modelId = '../../assets/models/Xenova/vit-gpt2-image-captioning';

        processor = await AutoProcessor.from_pretrained(modelId);
        model = await AutoModelForVision2Seq.from_pretrained(modelId);

        status.textContent = translations[currentLang].ready;
        indicator.classList.add('ready');
        btn.style.display = 'none';

    } catch (e) {
        console.error(e);
        status.textContent = "Error loading model. Check assets.";
        btn.disabled = false;
    }
}

async function generateCaption(imgSrc) {
    if (!model) {
        await loadModel(); // Auto load
    }

    const captionEl = document.getElementById('captionText');
    captionEl.textContent = translations[currentLang].generating;
    captionEl.classList.add('loading-text');

    try {
        const image = await window.RawImage.fromURL(imgSrc);
        const pixel_values = await processor(image);
        const output = await model.generate({ ...pixel_values, max_new_tokens: 50 });
        const caption = processor.batch_decode(output, { skip_special_tokens: true })[0];

        captionEl.textContent = caption;
        captionEl.classList.remove('loading-text');

    } catch (e) {
        console.error(e);
        captionEl.textContent = "Error generating caption.";
    }
}
