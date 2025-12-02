/**
 * AI Scene Background Library
 * Tool #007 - Awesome AI Local Tools
 *
 * Remove background and apply preset scene backgrounds
 * 100% local processing with Transformers.js
 */

import { AutoModel, AutoProcessor, RawImage, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.2/dist/transformers.min.js';

// Configure environment
env.useBrowserCache = true;
env.allowLocalModels = false;

// Scene backgrounds library (using Unsplash for demo)
const SCENE_BACKGROUNDS = [
    // Office
    { id: 'office-1', category: 'office', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1280', name: '現代辦公室', nameEn: 'Modern Office' },
    { id: 'office-2', category: 'office', url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1280', name: '會議室', nameEn: 'Meeting Room' },
    { id: 'office-3', category: 'office', url: 'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=1280', name: '書房', nameEn: 'Study Room' },
    { id: 'office-4', category: 'office', url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1280', name: '簡約辦公', nameEn: 'Minimal Office' },
    { id: 'office-5', category: 'office', url: 'https://images.unsplash.com/photo-1505409859467-3a796fd5798e?w=1280', name: '書架背景', nameEn: 'Bookshelf' },

    // Nature
    { id: 'nature-1', category: 'nature', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1280', name: '山景', nameEn: 'Mountains' },
    { id: 'nature-2', category: 'nature', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1280', name: '海灘', nameEn: 'Beach' },
    { id: 'nature-3', category: 'nature', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1280', name: '森林', nameEn: 'Forest' },
    { id: 'nature-4', category: 'nature', url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1280', name: '花園', nameEn: 'Garden' },
    { id: 'nature-5', category: 'nature', url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=1280', name: '陽光森林', nameEn: 'Sunlit Forest' },

    // City
    { id: 'city-1', category: 'city', url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1280', name: '城市夜景', nameEn: 'City Night' },
    { id: 'city-2', category: 'city', url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1280', name: '街道', nameEn: 'Street' },
    { id: 'city-3', category: 'city', url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1280', name: '建築', nameEn: 'Architecture' },
    { id: 'city-4', category: 'city', url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1280', name: '天際線', nameEn: 'Skyline' },
    { id: 'city-5', category: 'city', url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1280', name: '都市街景', nameEn: 'Urban Street' },

    // Abstract
    { id: 'abstract-1', category: 'abstract', url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1280', name: '紫色漸層', nameEn: 'Purple Gradient' },
    { id: 'abstract-2', category: 'abstract', url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1280', name: '彩色漸層', nameEn: 'Colorful Gradient' },
    { id: 'abstract-3', category: 'abstract', url: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=1280', name: '抽象波浪', nameEn: 'Abstract Waves' },
    { id: 'abstract-4', category: 'abstract', url: 'https://images.unsplash.com/photo-1557683316-973673bdar25?w=1280', name: '柔和漸層', nameEn: 'Soft Gradient' },
    { id: 'abstract-5', category: 'abstract', url: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=1280', name: '藍色漸層', nameEn: 'Blue Gradient' }
];

// Translations
const translations = {
    'zh-TW': {
        title: 'AI 場景背景庫',
        subtitle: '提供預設場景背景，一鍵套用至去背圖片',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        modelNotLoaded: '模型未載入',
        modelLoading: '正在載入模型...',
        modelReady: '模型已就緒',
        loadModel: '載入模型',
        downloading: '正在下載模型...',
        downloadNote: '首次載入約 176MB，之後會快取',
        uploadText: '上傳您的照片',
        uploadHint: 'AI 將自動移除背景並套用場景',
        selectScene: '選擇場景',
        catAll: '全部',
        catOffice: '辦公室',
        catNature: '自然',
        catCity: '城市',
        catAbstract: '抽象',
        adjustPosition: '調整位置',
        scale: '縮放',
        positionX: '水平',
        positionY: '垂直',
        centerSubject: '置中主體',
        customBackground: '自訂背景',
        uploadBackground: '上傳背景圖',
        solidColor: '純色背景',
        apply: '套用',
        newImage: '選擇新圖片',
        download: '下載結果',
        processing: '正在處理中...',
        removingBg: '正在移除背景...',
        compositing: '正在合成圖片...',
        sceneLibrary: '場景背景庫',
        officeScenes: '辦公場景',
        officeScenesDesc: '專業會議室、現代辦公室背景',
        natureScenes: '自然風景',
        natureScenesDesc: '山林、海灘、花園等自然背景',
        cityScenes: '城市街景',
        cityScenesDesc: '都市街道、建築、夜景背景',
        abstractScenes: '抽象背景',
        abstractScenesDesc: '漸層、紋理、藝術風格背景',
        howItWorks: '如何運作？',
        step1Title: '上傳照片',
        step1Desc: '選擇含有人物或主體的照片',
        step2Title: 'AI 去背',
        step2Desc: '自動移除原有背景',
        step3Title: '選擇場景',
        step3Desc: '從場景庫中選擇喜歡的背景',
        step4Title: '下載成品',
        step4Desc: '調整位置後下載合成圖片',
        techSpecs: '技術規格',
        specModel: 'AI 模型',
        specSize: '模型大小',
        specScenes: '預設場景',
        specOutput: '輸出格式',
        specRuntime: '執行環境',
        backToHome: '返回首頁',
        toolNumber: '工具 #007',
        copyright: 'Awesome AI Local Tools © 2024'
    },
    'en': {
        title: 'AI Scene Background',
        subtitle: 'Apply preset scene backgrounds to your photos',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        modelNotLoaded: 'Model not loaded',
        modelLoading: 'Loading model...',
        modelReady: 'Model ready',
        loadModel: 'Load Model',
        downloading: 'Downloading model...',
        downloadNote: 'First load ~176MB, cached afterwards',
        uploadText: 'Upload Your Photo',
        uploadHint: 'AI will automatically remove background and apply scene',
        selectScene: 'Select Scene',
        catAll: 'All',
        catOffice: 'Office',
        catNature: 'Nature',
        catCity: 'City',
        catAbstract: 'Abstract',
        adjustPosition: 'Adjust Position',
        scale: 'Scale',
        positionX: 'Horizontal',
        positionY: 'Vertical',
        centerSubject: 'Center Subject',
        customBackground: 'Custom Background',
        uploadBackground: 'Upload Background',
        solidColor: 'Solid Color',
        apply: 'Apply',
        newImage: 'New Image',
        download: 'Download',
        processing: 'Processing...',
        removingBg: 'Removing background...',
        compositing: 'Compositing image...',
        sceneLibrary: 'Scene Library',
        officeScenes: 'Office Scenes',
        officeScenesDesc: 'Professional meeting rooms and modern offices',
        natureScenes: 'Nature Scenes',
        natureScenesDesc: 'Mountains, beaches, gardens and more',
        cityScenes: 'City Scenes',
        cityScenesDesc: 'Urban streets, architecture, nightscapes',
        abstractScenes: 'Abstract',
        abstractScenesDesc: 'Gradients, textures, artistic backgrounds',
        howItWorks: 'How It Works?',
        step1Title: 'Upload Photo',
        step1Desc: 'Choose a photo with a person or subject',
        step2Title: 'AI Removal',
        step2Desc: 'Automatically remove original background',
        step3Title: 'Select Scene',
        step3Desc: 'Choose your favorite background from library',
        step4Title: 'Download',
        step4Desc: 'Adjust position and download the result',
        techSpecs: 'Technical Specs',
        specModel: 'AI Model',
        specSize: 'Model Size',
        specScenes: 'Preset Scenes',
        specOutput: 'Output Format',
        specRuntime: 'Runtime',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #007',
        copyright: 'Awesome AI Local Tools © 2024'
    }
};

// State
let currentLang = 'zh-TW';
let model = null;
let processor = null;
let isModelLoading = false;
let subjectImage = null; // Transparent PNG of subject
let currentBackground = null;
let selectedSceneId = null;
let scale = 100;
let positionX = 0;
let positionY = 0;

// DOM Elements
const langZhBtn = document.getElementById('lang-zh');
const langEnBtn = document.getElementById('lang-en');
const statusIndicator = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');
const loadModelBtn = document.getElementById('loadModelBtn');
const progressContainer = document.getElementById('progressContainer');
const progressText = document.getElementById('progressText');
const progressPercent = document.getElementById('progressPercent');
const progressFill = document.getElementById('progressFill');
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const editorArea = document.getElementById('editorArea');
const resultCanvas = document.getElementById('resultCanvas');
const ctx = resultCanvas.getContext('2d');
const processingOverlay = document.getElementById('processingOverlay');
const processingText = document.getElementById('processingText');
const sceneGrid = document.getElementById('sceneGrid');
const resetBtn = document.getElementById('resetBtn');
const downloadBtn = document.getElementById('downloadBtn');
const scaleSlider = document.getElementById('scaleSlider');
const scaleValue = document.getElementById('scaleValue');
const positionXSlider = document.getElementById('positionXSlider');
const positionXValue = document.getElementById('positionXValue');
const positionYSlider = document.getElementById('positionYSlider');
const positionYValue = document.getElementById('positionYValue');
const centerBtn = document.getElementById('centerBtn');
const uploadBgBtn = document.getElementById('uploadBgBtn');
const bgFileInput = document.getElementById('bgFileInput');
const bgColorInput = document.getElementById('bgColorInput');
const applyColorBtn = document.getElementById('applyColorBtn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initLanguage();
    initEventListeners();
    renderSceneGrid('all');
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

    // Update scene labels
    renderSceneGrid(document.querySelector('.category-btn.active')?.dataset.category || 'all');
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

    // Model loading
    loadModelBtn.addEventListener('click', loadModel);

    // File upload
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    fileInput.addEventListener('change', handleFileSelect);

    // Category buttons
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderSceneGrid(btn.dataset.category);
        });
    });

    // Position controls
    scaleSlider.addEventListener('input', (e) => {
        scale = parseInt(e.target.value);
        scaleValue.textContent = `${scale}%`;
        renderComposite();
    });

    positionXSlider.addEventListener('input', (e) => {
        positionX = parseInt(e.target.value);
        positionXValue.textContent = positionX;
        renderComposite();
    });

    positionYSlider.addEventListener('input', (e) => {
        positionY = parseInt(e.target.value);
        positionYValue.textContent = positionY;
        renderComposite();
    });

    centerBtn.addEventListener('click', () => {
        positionX = 0;
        positionY = 0;
        positionXSlider.value = 0;
        positionYSlider.value = 0;
        positionXValue.textContent = '0';
        positionYValue.textContent = '0';
        renderComposite();
    });

    // Custom background
    uploadBgBtn.addEventListener('click', () => bgFileInput.click());
    bgFileInput.addEventListener('change', handleBgFileSelect);
    applyColorBtn.addEventListener('click', applyColorBackground);

    // Action buttons
    resetBtn.addEventListener('click', resetToUpload);
    downloadBtn.addEventListener('click', downloadResult);
}

function renderSceneGrid(category) {
    const scenes = category === 'all'
        ? SCENE_BACKGROUNDS
        : SCENE_BACKGROUNDS.filter(s => s.category === category);

    sceneGrid.innerHTML = scenes.map(scene => `
        <div class="scene-item ${scene.id === selectedSceneId ? 'active' : ''}" data-id="${scene.id}" data-url="${scene.url}">
            <img src="${scene.url.replace('w=1280', 'w=200')}" alt="${currentLang === 'zh-TW' ? scene.name : scene.nameEn}" loading="lazy">
            <span class="scene-label">${currentLang === 'zh-TW' ? scene.name : scene.nameEn}</span>
        </div>
    `).join('');

    // Add click handlers
    sceneGrid.querySelectorAll('.scene-item').forEach(item => {
        item.addEventListener('click', () => selectScene(item.dataset.id, item.dataset.url));
    });
}

async function loadModel() {
    if (isModelLoading || model) return;

    isModelLoading = true;
    const t = translations[currentLang];

    loadModelBtn.disabled = true;
    loadModelBtn.style.display = 'none';
    statusIndicator.className = 'status-indicator loading';
    statusText.textContent = t.modelLoading;
    progressContainer.style.display = 'block';

    try {
        model = await AutoModel.from_pretrained('briaai/RMBG-1.4', {
            progress_callback: (progress) => {
                if (progress.status === 'downloading' || progress.status === 'progress') {
                    const percent = progress.progress ? Math.round(progress.progress) : 0;
                    progressFill.style.width = `${percent}%`;
                    progressPercent.textContent = `${percent}%`;
                    progressText.textContent = progress.file ?
                        `${t.downloading} (${progress.file})` : t.downloading;
                }
            }
        });

        processor = await AutoProcessor.from_pretrained('briaai/RMBG-1.4');

        statusIndicator.className = 'status-indicator ready';
        statusText.textContent = t.modelReady;
        progressContainer.style.display = 'none';
        uploadArea.style.display = 'block';

    } catch (error) {
        console.error('Error loading model:', error);
        statusIndicator.className = 'status-indicator';
        statusText.textContent = `Error: ${error.message}`;
        loadModelBtn.disabled = false;
        loadModelBtn.style.display = 'inline-flex';
        progressContainer.style.display = 'none';
    }

    isModelLoading = false;
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

async function processFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }

    const t = translations[currentLang];

    // Show editor with processing overlay
    uploadArea.style.display = 'none';
    editorArea.style.display = 'block';
    processingOverlay.style.display = 'flex';
    processingText.textContent = t.removingBg;

    // Load image
    const imageUrl = URL.createObjectURL(file);

    try {
        // Remove background
        subjectImage = await removeBackground(imageUrl);

        // Select first scene by default
        const firstScene = SCENE_BACKGROUNDS[0];
        await selectScene(firstScene.id, firstScene.url);

        processingOverlay.style.display = 'none';

    } catch (error) {
        console.error('Error processing image:', error);
        processingOverlay.style.display = 'none';
        alert('Error processing image: ' + error.message);
    }

    URL.revokeObjectURL(imageUrl);
}

async function removeBackground(imageUrl) {
    // Load image
    const image = await RawImage.fromURL(imageUrl);

    // Process with model
    const { pixel_values } = await processor(image);
    const { output } = await model({ input: pixel_values });

    // Get mask
    const maskData = output.squeeze().sigmoid_().data;
    const maskWidth = output.dims[3];
    const maskHeight = output.dims[2];

    // Create canvas for result
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');

    // Draw original image
    ctx.drawImage(image.toCanvas(), 0, 0);

    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Apply mask to alpha channel
    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const i = (y * canvas.width + x) * 4;

            // Sample mask (bilinear interpolation)
            const mx = (x / canvas.width) * maskWidth;
            const my = (y / canvas.height) * maskHeight;
            const mi = Math.floor(my) * maskWidth + Math.floor(mx);

            const alpha = maskData[mi] || 0;
            data[i + 3] = Math.round(alpha * 255);
        }
    }

    ctx.putImageData(imageData, 0, 0);

    // Return as image
    const resultImage = new Image();
    resultImage.src = canvas.toDataURL('image/png');
    await new Promise(resolve => resultImage.onload = resolve);

    return resultImage;
}

async function selectScene(id, url) {
    selectedSceneId = id;

    // Update UI
    sceneGrid.querySelectorAll('.scene-item').forEach(item => {
        item.classList.toggle('active', item.dataset.id === id);
    });

    // Load background image
    const bgImage = new Image();
    bgImage.crossOrigin = 'anonymous';

    bgImage.onload = () => {
        currentBackground = bgImage;
        renderComposite();
    };

    bgImage.onerror = () => {
        console.error('Failed to load scene background');
    };

    bgImage.src = url;
}

function handleBgFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        const file = files[0];
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const bgImage = new Image();
            bgImage.onload = () => {
                currentBackground = bgImage;
                selectedSceneId = null;
                sceneGrid.querySelectorAll('.scene-item').forEach(item => {
                    item.classList.remove('active');
                });
                renderComposite();
            };
            bgImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function applyColorBackground() {
    const color = bgColorInput.value;

    // Create solid color background
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const bgImage = new Image();
    bgImage.onload = () => {
        currentBackground = bgImage;
        selectedSceneId = null;
        sceneGrid.querySelectorAll('.scene-item').forEach(item => {
            item.classList.remove('active');
        });
        renderComposite();
    };
    bgImage.src = canvas.toDataURL('image/png');
}

function renderComposite() {
    if (!subjectImage || !currentBackground) return;

    // Set canvas size to background size (max 1920x1080)
    const maxWidth = 1920;
    const maxHeight = 1080;

    let bgWidth = currentBackground.width;
    let bgHeight = currentBackground.height;

    if (bgWidth > maxWidth || bgHeight > maxHeight) {
        const ratio = Math.min(maxWidth / bgWidth, maxHeight / bgHeight);
        bgWidth *= ratio;
        bgHeight *= ratio;
    }

    resultCanvas.width = bgWidth;
    resultCanvas.height = bgHeight;

    // Draw background
    ctx.drawImage(currentBackground, 0, 0, bgWidth, bgHeight);

    // Calculate subject dimensions
    const scaleFactor = scale / 100;
    let subjectWidth = subjectImage.width * scaleFactor;
    let subjectHeight = subjectImage.height * scaleFactor;

    // Scale subject to fit background (max 80% of background height)
    const maxSubjectHeight = bgHeight * 0.8;
    if (subjectHeight > maxSubjectHeight) {
        const ratio = maxSubjectHeight / subjectHeight;
        subjectWidth *= ratio;
        subjectHeight *= ratio;
    }

    // Calculate position (center + offset)
    const centerX = (bgWidth - subjectWidth) / 2;
    const centerY = (bgHeight - subjectHeight) / 2;

    const offsetX = (positionX / 100) * (bgWidth / 2);
    const offsetY = (positionY / 100) * (bgHeight / 2);

    const x = centerX + offsetX;
    const y = centerY + offsetY;

    // Draw subject
    ctx.drawImage(subjectImage, x, y, subjectWidth, subjectHeight);
}

function resetToUpload() {
    subjectImage = null;
    currentBackground = null;
    selectedSceneId = null;
    scale = 100;
    positionX = 0;
    positionY = 0;

    scaleSlider.value = 100;
    scaleValue.textContent = '100%';
    positionXSlider.value = 0;
    positionYSlider.value = 0;
    positionXValue.textContent = '0';
    positionYValue.textContent = '0';

    fileInput.value = '';
    bgFileInput.value = '';

    editorArea.style.display = 'none';
    uploadArea.style.display = 'block';

    renderSceneGrid('all');
    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.category-btn[data-category="all"]').classList.add('active');
}

function downloadResult() {
    const link = document.createElement('a');
    link.download = `scene-background-${Date.now()}.png`;
    link.href = resultCanvas.toDataURL('image/png');
    link.click();
}
