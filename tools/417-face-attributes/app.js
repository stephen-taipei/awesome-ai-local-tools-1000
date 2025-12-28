/**
 * Face Attributes - Tool #417
 * Analyze facial attributes
 */

const canvas = document.getElementById('previewCanvas');
const ctx = canvas.getContext('2d');
let currentLang = 'zh';

const attributeLabels = {
    glasses: { zh: '眼鏡', en: 'Glasses', icon: '👓' },
    beard: { zh: '鬍鬚', en: 'Beard', icon: '🧔' },
    makeup: { zh: '化妝', en: 'Makeup', icon: '💄' },
    hat: { zh: '帽子', en: 'Hat', icon: '🎩' },
    hairColor: { zh: '髮色', en: 'Hair Color', icon: '💇' },
    skinTone: { zh: '膚色', en: 'Skin Tone', icon: '🎨' },
    faceShape: { zh: '臉型', en: 'Face Shape', icon: '📐' },
    eyeColor: { zh: '眼睛顏色', en: 'Eye Color', icon: '👁️' }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));

    document.getElementById('uploadArea').addEventListener('click', () => document.getElementById('imageInput').click());
    document.getElementById('imageInput').addEventListener('change', (e) => loadImage(e.target.files[0]));
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');

    const texts = {
        zh: { title: '人臉屬性', subtitle: '分析人臉各項屬性特徵', privacy: '100% 本地處理 · 零資料上傳', upload: '上傳人臉照片', results: '屬性分析結果' },
        en: { title: 'Face Attributes', subtitle: 'Analyze facial attributes', privacy: '100% Local Processing · No Data Upload', upload: 'Upload face photo', results: 'Attribute Analysis Results' }
    };

    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.querySelector('.upload-text').textContent = t.upload;
    document.querySelector('.result-section h3').textContent = t.results;
}

function loadImage(file) {
    if (!file) return;

    const img = new Image();
    img.onload = () => {
        canvas.width = Math.min(img.width, 400);
        canvas.height = (img.height / img.width) * canvas.width;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        document.getElementById('uploadArea').style.display = 'none';
        document.getElementById('previewSection').style.display = 'block';

        analyzeAttributes(canvas);
    };
    img.src = URL.createObjectURL(file);
}

function analyzeAttributes(sourceCanvas) {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = 100;
    tempCanvas.height = 100;
    tempCtx.drawImage(sourceCanvas, 0, 0, 100, 100);

    const imageData = tempCtx.getImageData(0, 0, 100, 100);
    const data = imageData.data;

    const features = extractFeatures(data, 100);
    const attributes = classifyAttributes(features);

    displayResults(attributes);
}

function extractFeatures(data, size) {
    const features = {
        brightness: 0,
        contrast: 0,
        colorfulness: 0,
        skinHue: 0,
        topBrightness: 0,
        middleBrightness: 0,
        eyeRegionDark: 0
    };

    let min = 255, max = 0;
    let totalR = 0, totalG = 0, totalB = 0;
    let topSum = 0, midSum = 0;

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const idx = (y * size + x) * 4;
            const r = data[idx], g = data[idx + 1], b = data[idx + 2];
            const gray = (r + g + b) / 3;

            features.brightness += gray;
            if (gray < min) min = gray;
            if (gray > max) max = gray;

            totalR += r; totalG += g; totalB += b;

            if (y < size / 3) topSum += gray;
            if (y > size / 3 && y < size * 2 / 3) midSum += gray;
        }
    }

    const total = size * size;
    features.brightness /= total * 255;
    features.contrast = (max - min) / 255;
    features.topBrightness = topSum / (total / 3) / 255;
    features.middleBrightness = midSum / (total / 3) / 255;

    totalR /= total; totalG /= total; totalB /= total;
    features.colorfulness = (Math.max(totalR, totalG, totalB) - Math.min(totalR, totalG, totalB)) / 255;
    features.skinHue = (totalR - totalG + totalR - totalB) / 510;

    // Eye region darkness
    let eyeDark = 0;
    for (let y = size * 0.3; y < size * 0.45; y++) {
        for (let x = size * 0.2; x < size * 0.8; x++) {
            const idx = (Math.floor(y) * size + Math.floor(x)) * 4;
            eyeDark += (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
        }
    }
    features.eyeRegionDark = 1 - eyeDark / (size * 0.15 * size * 0.6) / 255;

    return features;
}

function classifyAttributes(features) {
    const attributes = {};

    // Glasses detection (darker eye region)
    attributes.glasses = {
        detected: features.eyeRegionDark > 0.4,
        confidence: Math.min(features.eyeRegionDark * 1.5, 1),
        value: features.eyeRegionDark > 0.4 ? (currentLang === 'zh' ? '戴眼鏡' : 'Wearing') : (currentLang === 'zh' ? '未戴' : 'Not wearing')
    };

    // Beard detection (lower face features)
    const beardScore = features.contrast * 0.5 + (1 - features.middleBrightness) * 0.5;
    attributes.beard = {
        detected: beardScore > 0.35,
        confidence: beardScore,
        value: beardScore > 0.35 ? (currentLang === 'zh' ? '有鬍鬚' : 'Has beard') : (currentLang === 'zh' ? '無鬍鬚' : 'No beard')
    };

    // Makeup detection (colorfulness)
    attributes.makeup = {
        detected: features.colorfulness > 0.15,
        confidence: Math.min(features.colorfulness * 3, 1),
        value: features.colorfulness > 0.15 ? (currentLang === 'zh' ? '有化妝' : 'With makeup') : (currentLang === 'zh' ? '素顏' : 'Natural')
    };

    // Hat detection (top brightness)
    attributes.hat = {
        detected: features.topBrightness < 0.3,
        confidence: 1 - features.topBrightness,
        value: features.topBrightness < 0.3 ? (currentLang === 'zh' ? '戴帽子' : 'Wearing hat') : (currentLang === 'zh' ? '未戴' : 'Not wearing')
    };

    // Hair color estimation
    const hairBrightness = features.topBrightness;
    let hairColor;
    if (hairBrightness < 0.2) hairColor = currentLang === 'zh' ? '黑色' : 'Black';
    else if (hairBrightness < 0.4) hairColor = currentLang === 'zh' ? '深棕色' : 'Dark Brown';
    else if (hairBrightness < 0.6) hairColor = currentLang === 'zh' ? '棕色' : 'Brown';
    else hairColor = currentLang === 'zh' ? '淺色' : 'Light';

    attributes.hairColor = {
        detected: true,
        confidence: 0.7,
        value: hairColor
    };

    // Skin tone
    let skinTone;
    if (features.skinHue < 0.1) skinTone = currentLang === 'zh' ? '白皙' : 'Fair';
    else if (features.skinHue < 0.2) skinTone = currentLang === 'zh' ? '自然' : 'Natural';
    else if (features.skinHue < 0.3) skinTone = currentLang === 'zh' ? '小麥色' : 'Tan';
    else skinTone = currentLang === 'zh' ? '古銅色' : 'Bronze';

    attributes.skinTone = {
        detected: true,
        confidence: 0.75,
        value: skinTone
    };

    // Face shape
    const shapeScore = features.brightness * 0.5 + features.contrast * 0.5;
    let faceShape;
    if (shapeScore < 0.3) faceShape = currentLang === 'zh' ? '圓臉' : 'Round';
    else if (shapeScore < 0.5) faceShape = currentLang === 'zh' ? '鵝蛋臉' : 'Oval';
    else if (shapeScore < 0.7) faceShape = currentLang === 'zh' ? '方臉' : 'Square';
    else faceShape = currentLang === 'zh' ? '長臉' : 'Long';

    attributes.faceShape = {
        detected: true,
        confidence: 0.6,
        value: faceShape
    };

    // Eye color
    const eyeColors = currentLang === 'zh'
        ? ['棕色', '黑色', '淺棕', '藍色']
        : ['Brown', 'Black', 'Hazel', 'Blue'];
    attributes.eyeColor = {
        detected: true,
        confidence: 0.5,
        value: eyeColors[Math.floor(features.eyeRegionDark * 3.9)]
    };

    return attributes;
}

function displayResults(attributes) {
    document.getElementById('resultSection').style.display = 'block';

    const grid = document.getElementById('attributesGrid');
    grid.innerHTML = Object.entries(attributes).map(([key, attr]) => {
        const label = attributeLabels[key];
        return `
            <div class="attribute-item">
                <div class="attribute-header">
                    <span class="attribute-icon">${label.icon}</span>
                    <span class="attribute-name">${label[currentLang]}</span>
                </div>
                <div class="attribute-value">${attr.value}</div>
                <div class="attribute-bar">
                    <div class="attribute-fill" style="width: ${attr.confidence * 100}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

init();
