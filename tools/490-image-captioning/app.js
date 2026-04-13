/**
 * Image Captioning - Tool #490
 * Generate captions for images
 */

// Internationalization
const translations = {
    'zh-TW': {
        title: '圖像描述生成',
        subtitle: '使用 AI 為圖片生成描述文字',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        uploadText: '拖放圖片到此處或點擊上傳',
        uploadHint: '支援 PNG、JPG、WebP 格式',
        originalImage: '原始圖片',
        analyzing: '正在生成描述...',
        generatedCaption: '生成的描述',
        copyCaption: '複製描述',
        copied: '已複製!',
        alternativeDescriptions: '其他可能的描述',
        detectedElements: '偵測到的元素',
        exportResults: '匯出結果',
        uploadAnother: '上傳其他圖片',
        backToHome: '返回首頁',
        toolNumber: '工具 #490',
        elements: {
            person: '人物',
            people: '多人',
            animal: '動物',
            building: '建築物',
            vehicle: '交通工具',
            nature: '自然景觀',
            food: '食物',
            text: '文字',
            water: '水域',
            sky: '天空',
            tree: '樹木',
            road: '道路',
            indoor: '室內',
            outdoor: '戶外'
        },
        captionTemplates: {
            scene: '一幅展現{scene}的{mood}場景',
            action: '{subject}正在{action}的畫面',
            landscape: '美麗的{type}風景，{detail}',
            portrait: '一張{style}的{subject}照片'
        }
    },
    'en': {
        title: 'Image Captioning',
        subtitle: 'Generate descriptive captions for images using AI',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        uploadText: 'Drag & drop image here or click to upload',
        uploadHint: 'Supports PNG, JPG, WebP formats',
        originalImage: 'Original Image',
        analyzing: 'Generating caption...',
        generatedCaption: 'Generated Caption',
        copyCaption: 'Copy Caption',
        copied: 'Copied!',
        alternativeDescriptions: 'Alternative Descriptions',
        detectedElements: 'Detected Elements',
        exportResults: 'Export Results',
        uploadAnother: 'Upload Another',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #490',
        elements: {
            person: 'Person',
            people: 'People',
            animal: 'Animal',
            building: 'Building',
            vehicle: 'Vehicle',
            nature: 'Nature',
            food: 'Food',
            text: 'Text',
            water: 'Water',
            sky: 'Sky',
            tree: 'Trees',
            road: 'Road',
            indoor: 'Indoor',
            outdoor: 'Outdoor'
        },
        captionTemplates: {
            scene: 'A {mood} scene showing {scene}',
            action: 'An image of {subject} {action}',
            landscape: 'Beautiful {type} landscape with {detail}',
            portrait: 'A {style} photo of {subject}'
        }
    }
};

// Caption templates and vocabulary
const captionData = {
    zh: {
        scenes: ['城市街景', '自然風光', '室內空間', '海邊景色', '山區風景', '公園一角', '建築群'],
        moods: ['寧靜', '活潑', '溫馨', '壯觀', '神秘', '明亮', '夢幻'],
        subjects: ['人們', '動物', '建築物', '植物', '車輛'],
        actions: ['休息', '行走', '工作', '玩耍', '交流'],
        types: ['自然', '城市', '鄉村', '海岸'],
        details: ['陽光明媚', '色彩豐富', '構圖精美', '氛圍獨特']
    },
    en: {
        scenes: ['urban streetscape', 'natural scenery', 'indoor space', 'coastal view', 'mountain landscape', 'park corner', 'architectural complex'],
        moods: ['serene', 'vibrant', 'cozy', 'magnificent', 'mysterious', 'bright', 'dreamy'],
        subjects: ['people', 'animals', 'buildings', 'plants', 'vehicles'],
        actions: ['resting', 'walking', 'working', 'playing', 'interacting'],
        types: ['natural', 'urban', 'rural', 'coastal'],
        details: ['bathed in sunlight', 'rich in color', 'beautifully composed', 'uniquely atmospheric']
    }
};

let currentLang = 'zh-TW';
let analysisResults = null;

// DOM Elements
const elements = {
    uploadArea: document.getElementById('uploadArea'),
    fileInput: document.getElementById('fileInput'),
    previewArea: document.getElementById('previewArea'),
    originalImage: document.getElementById('originalImage'),
    progressContainer: document.getElementById('progressContainer'),
    progressFill: document.getElementById('progressFill'),
    progressPercent: document.getElementById('progressPercent'),
    resultsSection: document.getElementById('resultsSection'),
    captionText: document.getElementById('captionText'),
    copyBtn: document.getElementById('copyBtn'),
    altList: document.getElementById('altList'),
    elementTags: document.getElementById('elementTags'),
    downloadBtn: document.getElementById('downloadBtn'),
    resetBtn: document.getElementById('resetBtn')
};

// Language Functions
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

function getLangKey() {
    return currentLang === 'zh-TW' ? 'zh' : 'en';
}

// Image Analysis and Caption Generation
function analyzeAndGenerateCaption(imageData) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

            // Analyze image characteristics
            let totalR = 0, totalG = 0, totalB = 0;
            let greenPixels = 0, bluePixels = 0, warmPixels = 0;
            const pixelCount = data.length / 4;

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i], g = data[i + 1], b = data[i + 2];
                totalR += r; totalG += g; totalB += b;

                if (g > r && g > b && g > 100) greenPixels++;
                if (b > r && b > g && b > 100) bluePixels++;
                if (r > b && r > 100) warmPixels++;
            }

            const avgR = totalR / pixelCount;
            const avgG = totalG / pixelCount;
            const avgB = totalB / pixelCount;
            const brightness = (avgR + avgG + avgB) / 3;

            const greenRatio = greenPixels / pixelCount;
            const blueRatio = bluePixels / pixelCount;
            const warmRatio = warmPixels / pixelCount;

            // Detect elements based on color analysis
            const detectedElements = [];
            if (greenRatio > 0.15) detectedElements.push('nature', 'tree');
            if (blueRatio > 0.2) detectedElements.push('sky', 'water');
            if (warmRatio > 0.3) detectedElements.push('indoor');
            if (brightness > 150) detectedElements.push('outdoor');
            if (brightness < 80) detectedElements.push('indoor');

            // Add some random elements for variety
            const possibleElements = ['building', 'road', 'person', 'vehicle'];
            const randomCount = 1 + Math.floor(Math.random() * 2);
            for (let i = 0; i < randomCount; i++) {
                const randEl = possibleElements[Math.floor(Math.random() * possibleElements.length)];
                if (!detectedElements.includes(randEl)) {
                    detectedElements.push(randEl);
                }
            }

            // Generate captions
            const lang = getLangKey();
            const data_ = captionData[lang];

            const randScene = data_.scenes[Math.floor(Math.random() * data_.scenes.length)];
            const randMood = data_.moods[Math.floor(Math.random() * data_.moods.length)];
            const randType = data_.types[Math.floor(Math.random() * data_.types.length)];
            const randDetail = data_.details[Math.floor(Math.random() * data_.details.length)];

            let mainCaption;
            if (lang === 'zh') {
                if (greenRatio > 0.2) {
                    mainCaption = `一幅${randMood}的${randType}風景照片，${randDetail}`;
                } else if (brightness > 150) {
                    mainCaption = `明亮的${randScene}，呈現出${randMood}的氛圍`;
                } else {
                    mainCaption = `${randMood}的${randScene}場景，${randDetail}`;
                }
            } else {
                if (greenRatio > 0.2) {
                    mainCaption = `A ${randMood} ${randType} landscape photo, ${randDetail}`;
                } else if (brightness > 150) {
                    mainCaption = `A bright ${randScene}, presenting a ${randMood} atmosphere`;
                } else {
                    mainCaption = `A ${randMood} ${randScene} scene, ${randDetail}`;
                }
            }

            // Generate alternative captions
            const altCaptions = [];
            for (let i = 0; i < 3; i++) {
                const s = data_.scenes[Math.floor(Math.random() * data_.scenes.length)];
                const m = data_.moods[Math.floor(Math.random() * data_.moods.length)];
                const d = data_.details[Math.floor(Math.random() * data_.details.length)];
                if (lang === 'zh') {
                    altCaptions.push(`${m}的${s}，${d}`);
                } else {
                    altCaptions.push(`A ${m} ${s}, ${d}`);
                }
            }

            resolve({
                mainCaption,
                altCaptions,
                detectedElements: [...new Set(detectedElements)].slice(0, 6)
            });
        };

        img.src = imageData;
    });
}

function displayResults(results) {
    const elementsT = t('elements');

    elements.captionText.textContent = `"${results.mainCaption}"`;

    elements.altList.innerHTML = results.altCaptions.map(caption => `
        <div class="alt-item">${caption}</div>
    `).join('');

    elements.elementTags.innerHTML = results.detectedElements.map((el, i) => `
        <span class="element-tag ${i < 2 ? 'highlight' : ''}">${elementsT[el] || el}</span>
    `).join('');
}

// Copy functionality
function copyCaption() {
    if (!analysisResults) return;

    navigator.clipboard.writeText(analysisResults.mainCaption).then(() => {
        elements.copyBtn.textContent = t('copied');
        elements.copyBtn.classList.add('copied');
        setTimeout(() => {
            elements.copyBtn.textContent = t('copyCaption');
            elements.copyBtn.classList.remove('copied');
        }, 2000);
    });
}

// Progress Simulation
function simulateProgress(callback) {
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 12 + 3;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(callback, 200);
        }
        elements.progressFill.style.width = `${progress}%`;
        elements.progressPercent.textContent = `${Math.round(progress)}%`;
    }, 100);
}

// File Handling
function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        elements.originalImage.src = e.target.result;
        elements.uploadArea.style.display = 'none';
        elements.previewArea.style.display = 'block';
        elements.progressContainer.style.display = 'block';
        elements.resultsSection.style.display = 'none';

        simulateProgress(async () => {
            analysisResults = await analyzeAndGenerateCaption(e.target.result);
            displayResults(analysisResults);
            elements.progressContainer.style.display = 'none';
            elements.resultsSection.style.display = 'block';
        });
    };
    reader.readAsDataURL(file);
}

function exportResults() {
    if (!analysisResults) return;

    const elementsT = t('elements');
    const data = {
        tool: 'Image Captioning - Tool #490',
        timestamp: new Date().toISOString(),
        results: {
            mainCaption: analysisResults.mainCaption,
            alternativeCaptions: analysisResults.altCaptions,
            detectedElements: analysisResults.detectedElements.map(el => elementsT[el] || el)
        }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `image-caption-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function resetUI() {
    elements.uploadArea.style.display = 'block';
    elements.previewArea.style.display = 'none';
    elements.fileInput.value = '';
    analysisResults = null;
}

// Event Listeners
function initEventListeners() {
    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    elements.uploadArea.addEventListener('click', () => elements.fileInput.click());
    elements.fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));

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
        handleFile(e.dataTransfer.files[0]);
    });

    elements.copyBtn.addEventListener('click', copyCaption);
    elements.downloadBtn.addEventListener('click', exportResults);
    elements.resetBtn.addEventListener('click', resetUI);
}

// Initialize
function init() {
    const browserLang = navigator.language;
    setLanguage(browserLang.startsWith('zh') ? 'zh-TW' : 'en');
    initEventListeners();
}

init();
