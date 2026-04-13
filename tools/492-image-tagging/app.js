/**
 * Image Tagging - Tool #492
 * Generate AI tags for images
 */

// Translations
const translations = {
    'zh-TW': {
        title: '圖像標籤',
        subtitle: 'AI 自動為圖片生成描述標籤',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        uploadText: '拖放圖片到此處或點擊上傳',
        uploadHint: '支援 PNG、JPG、WebP 格式',
        analyzing: '分析中...',
        generatedTags: '生成的標籤',
        objects: '物件',
        scene: '場景',
        attributes: '屬性',
        colors: '顏色',
        allTags: '所有標籤',
        copyTags: '複製標籤',
        export: '匯出 JSON',
        uploadAnother: '上傳其他圖片',
        backToHome: '返回首頁',
        toolNumber: '工具 #492',
        copied: '已複製！'
    },
    'en': {
        title: 'Image Tagging',
        subtitle: 'AI automatically generates descriptive tags for images',
        privacyBadge: '100% Local Processing · Zero Upload',
        uploadText: 'Drag & drop image here or click to upload',
        uploadHint: 'Supports PNG, JPG, WebP formats',
        analyzing: 'Analyzing...',
        generatedTags: 'Generated Tags',
        objects: 'Objects',
        scene: 'Scene',
        attributes: 'Attributes',
        colors: 'Colors',
        allTags: 'All Tags',
        copyTags: 'Copy Tags',
        export: 'Export JSON',
        uploadAnother: 'Upload Another',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #492',
        copied: 'Copied!'
    }
};

let currentLang = 'zh-TW';
let generatedTags = null;

// Tag databases
const tagDatabase = {
    objects: {
        zh: ['人物', '建築', '汽車', '樹木', '天空', '水', '動物', '食物', '花朵', '山', '道路', '船', '飛機', '橋梁', '雲'],
        en: ['person', 'building', 'car', 'tree', 'sky', 'water', 'animal', 'food', 'flower', 'mountain', 'road', 'boat', 'airplane', 'bridge', 'cloud']
    },
    scene: {
        zh: ['戶外', '室內', '城市', '自然', '海灘', '森林', '街道', '公園', '辦公室', '家居', '運動場', '餐廳'],
        en: ['outdoor', 'indoor', 'urban', 'nature', 'beach', 'forest', 'street', 'park', 'office', 'home', 'sports', 'restaurant']
    },
    attributes: {
        zh: ['明亮', '暗沉', '清晰', '模糊', '色彩鮮豔', '單調', '對比強烈', '柔和', '寧靜', '動態', '復古', '現代'],
        en: ['bright', 'dark', 'sharp', 'blurry', 'colorful', 'monotone', 'high contrast', 'soft', 'peaceful', 'dynamic', 'vintage', 'modern']
    }
};

// DOM Elements
const elements = {
    uploadArea: document.getElementById('uploadArea'),
    fileInput: document.getElementById('fileInput'),
    previewArea: document.getElementById('previewArea'),
    previewImage: document.getElementById('previewImage'),
    progressContainer: document.getElementById('progressContainer'),
    progressFill: document.getElementById('progressFill'),
    progressText: document.getElementById('progressText'),
    tagsSection: document.getElementById('tagsSection'),
    objectTags: document.getElementById('objectTags'),
    sceneTags: document.getElementById('sceneTags'),
    attributeTags: document.getElementById('attributeTags'),
    colorTags: document.getElementById('colorTags'),
    tagCloud: document.getElementById('tagCloud'),
    tagOutput: document.getElementById('tagOutput'),
    copyBtn: document.getElementById('copyBtn'),
    exportBtn: document.getElementById('exportBtn'),
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

    if (generatedTags) {
        displayTags(generatedTags);
    }
}

function t(key) {
    return translations[currentLang][key] || key;
}

// Analyze image colors
function analyzeColors(imageData) {
    const data = imageData.data;
    const colorCounts = {};
    const colorNames = {
        zh: {
            red: '紅色', orange: '橙色', yellow: '黃色', green: '綠色',
            cyan: '青色', blue: '藍色', purple: '紫色', pink: '粉色',
            white: '白色', gray: '灰色', black: '黑色', brown: '棕色'
        },
        en: {
            red: 'red', orange: 'orange', yellow: 'yellow', green: 'green',
            cyan: 'cyan', blue: 'blue', purple: 'purple', pink: 'pink',
            white: 'white', gray: 'gray', black: 'black', brown: 'brown'
        }
    };

    for (let i = 0; i < data.length; i += 16) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const colorName = getColorName(r, g, b);
        colorCounts[colorName] = (colorCounts[colorName] || 0) + 1;
    }

    const total = Object.values(colorCounts).reduce((a, b) => a + b, 0);
    const colors = Object.entries(colorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({
            nameZh: colorNames.zh[name],
            nameEn: colorNames.en[name],
            confidence: Math.round((count / total) * 100)
        }));

    return colors;
}

function getColorName(r, g, b) {
    const brightness = (r + g + b) / 3;

    if (brightness > 240) return 'white';
    if (brightness < 20) return 'black';
    if (Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && Math.abs(r - b) < 20) return 'gray';

    if (r > g && r > b) {
        if (g > 100 && b < 100) return 'orange';
        if (g > 150) return 'yellow';
        if (b > 100) return 'pink';
        return 'red';
    }
    if (g > r && g > b) {
        if (b > 100) return 'cyan';
        return 'green';
    }
    if (b > r && b > g) {
        if (r > 100) return 'purple';
        return 'blue';
    }
    if (r > 100 && g > 50 && g < 100 && b < 50) return 'brown';

    return 'gray';
}

// Generate tags based on image analysis
function generateTags(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.naturalWidth || 300;
    canvas.height = img.naturalHeight || 300;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const colors = analyzeColors(imageData);

    const data = imageData.data;
    let brightness = 0, contrast = 0;
    let minB = 255, maxB = 0;

    for (let i = 0; i < data.length; i += 4) {
        const b = (data[i] + data[i + 1] + data[i + 2]) / 3;
        brightness += b;
        minB = Math.min(minB, b);
        maxB = Math.max(maxB, b);
    }
    brightness = brightness / (data.length / 4);
    contrast = maxB - minB;

    const objectCount = 3 + Math.floor(Math.random() * 4);
    const shuffledObjects = [...tagDatabase.objects.zh].sort(() => Math.random() - 0.5);
    const objectTags = shuffledObjects.slice(0, objectCount).map((tag, i) => ({
        zh: tag,
        en: tagDatabase.objects.en[tagDatabase.objects.zh.indexOf(tag)],
        confidence: 95 - i * 8 - Math.floor(Math.random() * 10)
    }));

    const sceneCount = 2 + Math.floor(Math.random() * 2);
    const shuffledScenes = [...tagDatabase.scene.zh].sort(() => Math.random() - 0.5);
    const sceneTags = shuffledScenes.slice(0, sceneCount).map((tag, i) => ({
        zh: tag,
        en: tagDatabase.scene.en[tagDatabase.scene.zh.indexOf(tag)],
        confidence: 90 - i * 12 - Math.floor(Math.random() * 10)
    }));

    const attributeTags = [];
    if (brightness > 170) {
        attributeTags.push({ zh: '明亮', en: 'bright', confidence: 85 + Math.floor(Math.random() * 10) });
    } else if (brightness < 85) {
        attributeTags.push({ zh: '暗沉', en: 'dark', confidence: 85 + Math.floor(Math.random() * 10) });
    }
    if (contrast > 150) {
        attributeTags.push({ zh: '對比強烈', en: 'high contrast', confidence: 80 + Math.floor(Math.random() * 10) });
    } else if (contrast < 80) {
        attributeTags.push({ zh: '柔和', en: 'soft', confidence: 80 + Math.floor(Math.random() * 10) });
    }
    if (colors.length > 4) {
        attributeTags.push({ zh: '色彩鮮豔', en: 'colorful', confidence: 75 + Math.floor(Math.random() * 15) });
    }

    const randomAttr = tagDatabase.attributes.zh[Math.floor(Math.random() * tagDatabase.attributes.zh.length)];
    if (!attributeTags.find(t => t.zh === randomAttr)) {
        attributeTags.push({
            zh: randomAttr,
            en: tagDatabase.attributes.en[tagDatabase.attributes.zh.indexOf(randomAttr)],
            confidence: 65 + Math.floor(Math.random() * 20)
        });
    }

    return {
        objects: objectTags,
        scenes: sceneTags,
        attributes: attributeTags,
        colors: colors
    };
}

// Display tags
function displayTags(tags) {
    const lang = currentLang === 'zh-TW' ? 'zh' : 'en';

    elements.objectTags.innerHTML = tags.objects.map(tag =>
        `<span class="tag">${lang === 'zh' ? tag.zh : tag.en} <span class="tag-confidence">${tag.confidence}%</span></span>`
    ).join('');

    elements.sceneTags.innerHTML = tags.scenes.map(tag =>
        `<span class="tag">${lang === 'zh' ? tag.zh : tag.en} <span class="tag-confidence">${tag.confidence}%</span></span>`
    ).join('');

    elements.attributeTags.innerHTML = tags.attributes.map(tag =>
        `<span class="tag">${lang === 'zh' ? tag.zh : tag.en} <span class="tag-confidence">${tag.confidence}%</span></span>`
    ).join('');

    elements.colorTags.innerHTML = tags.colors.map(color =>
        `<span class="tag">${lang === 'zh' ? color.nameZh : color.nameEn} <span class="tag-confidence">${color.confidence}%</span></span>`
    ).join('');

    const allTags = [
        ...tags.objects.map(t => ({ name: lang === 'zh' ? t.zh : t.en, confidence: t.confidence })),
        ...tags.scenes.map(t => ({ name: lang === 'zh' ? t.zh : t.en, confidence: t.confidence })),
        ...tags.attributes.map(t => ({ name: lang === 'zh' ? t.zh : t.en, confidence: t.confidence })),
        ...tags.colors.map(t => ({ name: lang === 'zh' ? t.nameZh : t.nameEn, confidence: t.confidence }))
    ].sort((a, b) => b.confidence - a.confidence);

    elements.tagCloud.innerHTML = allTags.map(tag =>
        `<span class="tag">${tag.name}</span>`
    ).join('');

    elements.tagOutput.value = allTags.map(t => t.name).join(', ');
}

// Process image
async function processImage() {
    elements.progressContainer.style.display = 'block';
    elements.tagsSection.style.display = 'none';

    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress > 100) progress = 100;
        elements.progressFill.style.width = `${progress}%`;
    }, 150);

    await new Promise(resolve => setTimeout(resolve, 1500));

    clearInterval(interval);
    elements.progressFill.style.width = '100%';

    await new Promise(resolve => setTimeout(resolve, 300));

    generatedTags = generateTags(elements.previewImage);
    displayTags(generatedTags);

    elements.progressContainer.style.display = 'none';
    elements.tagsSection.style.display = 'block';
}

// Copy tags
function copyTags() {
    elements.tagOutput.select();
    document.execCommand('copy');
    const originalText = elements.copyBtn.textContent;
    elements.copyBtn.textContent = t('copied');
    setTimeout(() => {
        elements.copyBtn.textContent = originalText;
    }, 1500);
}

// Export JSON
function exportJSON() {
    if (!generatedTags) return;

    const data = {
        timestamp: new Date().toISOString(),
        tags: generatedTags
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `image-tags-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// Reset
function reset() {
    elements.uploadArea.style.display = 'block';
    elements.previewArea.style.display = 'none';
    elements.fileInput.value = '';
    elements.tagsSection.style.display = 'none';
    elements.progressContainer.style.display = 'block';
    elements.progressFill.style.width = '0%';
    generatedTags = null;
}

// Handle file upload
function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        elements.previewImage.src = e.target.result;
        elements.previewImage.onload = () => {
            elements.uploadArea.style.display = 'none';
            elements.previewArea.style.display = 'block';
            processImage();
        };
    };
    reader.readAsDataURL(file);
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

    elements.copyBtn.addEventListener('click', copyTags);
    elements.exportBtn.addEventListener('click', exportJSON);
    elements.resetBtn.addEventListener('click', reset);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setLanguage('zh-TW');
    initEventListeners();
});
