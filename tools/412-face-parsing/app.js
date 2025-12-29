/**
 * Face Parsing - Tool #412
 * Parse face into semantic regions
 */

const canvas = document.getElementById('resultCanvas');
const ctx = canvas.getContext('2d');
let sourceImage = null;
let showOriginal = false;
let currentLang = 'zh';

const regions = {
    skin: { color: '#ffd7b5', zh: '皮膚', en: 'Skin' },
    leftEye: { color: '#3b82f6', zh: '左眼', en: 'Left Eye' },
    rightEye: { color: '#60a5fa', zh: '右眼', en: 'Right Eye' },
    leftBrow: { color: '#8b5cf6', zh: '左眉', en: 'Left Brow' },
    rightBrow: { color: '#a78bfa', zh: '右眉', en: 'Right Brow' },
    nose: { color: '#f59e0b', zh: '鼻子', en: 'Nose' },
    upperLip: { color: '#ef4444', zh: '上唇', en: 'Upper Lip' },
    lowerLip: { color: '#dc2626', zh: '下唇', en: 'Lower Lip' },
    hair: { color: '#1f2937', zh: '頭髮', en: 'Hair' },
    background: { color: '#0f172a', zh: '背景', en: 'Background' }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));

    document.getElementById('uploadArea').addEventListener('click', () => document.getElementById('imageInput').click());
    document.getElementById('imageInput').addEventListener('change', (e) => loadImage(e.target.files[0]));

    document.getElementById('toggleBtn').addEventListener('click', toggleView);
    document.getElementById('downloadBtn').addEventListener('click', downloadResult);

    buildLegend();
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');

    const texts = {
        zh: { title: '人臉分割', subtitle: '將人臉分割為語義區域', privacy: '100% 本地處理 · 零資料上傳', upload: '上傳人臉照片', toggle: '切換檢視', download: '下載' },
        en: { title: 'Face Parsing', subtitle: 'Parse face into semantic regions', privacy: '100% Local Processing · No Data Upload', upload: 'Upload face photo', toggle: 'Toggle View', download: 'Download' }
    };

    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.querySelector('.upload-text').textContent = t.upload;
    document.getElementById('toggleBtn').textContent = t.toggle;
    document.getElementById('downloadBtn').textContent = t.download;

    buildLegend();
}

function buildLegend() {
    const legendEl = document.getElementById('legend');
    legendEl.innerHTML = Object.entries(regions).map(([key, value]) => `
        <div class="legend-item">
            <div class="legend-color" style="background: ${value.color}"></div>
            <span>${value[currentLang]}</span>
        </div>
    `).join('');
}

function loadImage(file) {
    if (!file) return;

    const img = new Image();
    img.onload = () => {
        sourceImage = img;
        canvas.width = Math.min(img.width, 500);
        canvas.height = (img.height / img.width) * canvas.width;

        document.getElementById('uploadArea').style.display = 'none';
        document.getElementById('resultSection').style.display = 'block';

        parseFace();
    };
    img.src = URL.createObjectURL(file);
}

function parseFace() {
    ctx.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Simple face parsing based on color and position
    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const idx = (y * canvas.width + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];

            const region = classifyPixel(r, g, b, x, y, canvas.width, canvas.height);
            const color = hexToRgb(regions[region].color);

            data[idx] = color.r;
            data[idx + 1] = color.g;
            data[idx + 2] = color.b;
        }
    }

    ctx.putImageData(imageData, 0, 0);
    showOriginal = false;
}

function classifyPixel(r, g, b, x, y, width, height) {
    const brightness = (r + g + b) / 3;
    const normalizedX = x / width;
    const normalizedY = y / height;

    // Detect skin tone
    const isSkinTone = r > 95 && g > 40 && b > 20 &&
        r > g && r > b &&
        Math.abs(r - g) > 15 &&
        r - g > 0;

    // Detect dark regions (hair, eyes)
    const isDark = brightness < 60;

    // Position-based classification
    const isTop = normalizedY < 0.25;
    const isEyeLevel = normalizedY > 0.3 && normalizedY < 0.45;
    const isBrowLevel = normalizedY > 0.2 && normalizedY < 0.35;
    const isNoseLevel = normalizedY > 0.4 && normalizedY < 0.65;
    const isMouthLevel = normalizedY > 0.6 && normalizedY < 0.8;
    const isLeftSide = normalizedX < 0.5;
    const isCenterX = normalizedX > 0.35 && normalizedX < 0.65;

    // Hair region (top and dark)
    if (isTop && isDark) return 'hair';
    if (normalizedY < 0.15) return 'hair';

    // Eye regions
    if (isEyeLevel && isDark) {
        if (normalizedX > 0.2 && normalizedX < 0.4) return 'leftEye';
        if (normalizedX > 0.6 && normalizedX < 0.8) return 'rightEye';
    }

    // Eyebrow regions
    if (isBrowLevel && brightness < 80) {
        if (normalizedX > 0.15 && normalizedX < 0.4) return 'leftBrow';
        if (normalizedX > 0.6 && normalizedX < 0.85) return 'rightBrow';
    }

    // Nose region
    if (isNoseLevel && isCenterX && isSkinTone) return 'nose';

    // Lip regions
    if (isMouthLevel && isCenterX) {
        if (r > 150 && g < 100) {
            return normalizedY < 0.7 ? 'upperLip' : 'lowerLip';
        }
        // Pink/red detection for lips
        if (r > g && r > b && r > 100) {
            return normalizedY < 0.7 ? 'upperLip' : 'lowerLip';
        }
    }

    // Skin
    if (isSkinTone) return 'skin';

    // Background
    if (normalizedX < 0.1 || normalizedX > 0.9) return 'background';
    if (normalizedY > 0.85) return 'background';

    return 'skin';
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

function toggleView() {
    if (!sourceImage) return;

    showOriginal = !showOriginal;

    if (showOriginal) {
        ctx.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);
    } else {
        parseFace();
    }
}

function downloadResult() {
    const link = document.createElement('a');
    link.download = 'face-parsing.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

init();
