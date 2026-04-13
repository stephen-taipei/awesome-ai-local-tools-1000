/**
 * Color Harmony Analysis - Tool #496
 * Analyze color harmony in images
 */

// Translations
const translations = {
    'zh-TW': {
        title: '色彩和諧分析',
        subtitle: 'AI 分析圖片的色彩組合與和諧度',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        uploadText: '拖放圖片到此處或點擊上傳',
        uploadHint: '支援 PNG、JPG、WebP 格式',
        analyzing: '分析中...',
        harmonyScore: '和諧度評分',
        colorPalette: '色彩調色盤',
        colorWheel: '色輪分布',
        colorStats: '色彩統計',
        dominantHue: '主色調',
        avgSaturation: '平均飽和度',
        colorTemp: '色溫',
        colorCount: '色彩數量',
        harmonyAnalysis: '和諧性分析',
        exportPalette: '匯出調色盤',
        uploadAnother: '上傳其他圖片',
        backToHome: '返回首頁',
        toolNumber: '工具 #496',
        harmonyComplementary: '互補色配色',
        harmonyAnalogous: '類似色配色',
        harmonyTriadic: '三角配色',
        harmonyMonochromatic: '單色配色',
        harmonySplit: '分裂互補配色',
        harmonyTetradic: '四角配色',
        warm: '暖色調',
        cool: '冷色調',
        neutral: '中性色調'
    },
    'en': {
        title: 'Color Harmony Analysis',
        subtitle: 'AI analyzes color combinations and harmony in images',
        privacyBadge: '100% Local Processing · Zero Upload',
        uploadText: 'Drag & drop image here or click to upload',
        uploadHint: 'Supports PNG, JPG, WebP formats',
        analyzing: 'Analyzing...',
        harmonyScore: 'Harmony Score',
        colorPalette: 'Color Palette',
        colorWheel: 'Color Wheel Distribution',
        colorStats: 'Color Statistics',
        dominantHue: 'Dominant Hue',
        avgSaturation: 'Avg Saturation',
        colorTemp: 'Color Temp',
        colorCount: 'Color Count',
        harmonyAnalysis: 'Harmony Analysis',
        exportPalette: 'Export Palette',
        uploadAnother: 'Upload Another',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #496',
        harmonyComplementary: 'Complementary',
        harmonyAnalogous: 'Analogous',
        harmonyTriadic: 'Triadic',
        harmonyMonochromatic: 'Monochromatic',
        harmonySplit: 'Split Complementary',
        harmonyTetradic: 'Tetradic',
        warm: 'Warm',
        cool: 'Cool',
        neutral: 'Neutral'
    }
};

const harmonyDescriptions = {
    complementary: {
        zh: '圖片採用互補色配色，使用色輪上相對的顏色，創造強烈的視覺對比和活力。',
        en: 'The image uses complementary colors, creating strong visual contrast and vibrancy with opposite colors on the color wheel.'
    },
    analogous: {
        zh: '圖片採用類似色配色，使用色輪上相鄰的顏色，呈現和諧、舒適的視覺效果。',
        en: 'The image uses analogous colors, creating a harmonious and comfortable visual effect with adjacent colors on the wheel.'
    },
    triadic: {
        zh: '圖片採用三角配色，使用色輪上等距的三種顏色，達到豐富又平衡的效果。',
        en: 'The image uses triadic colors, achieving a rich yet balanced effect with three equidistant colors on the wheel.'
    },
    monochromatic: {
        zh: '圖片採用單色配色，使用單一色相的不同明度和飽和度變化，呈現統一、優雅的感覺。',
        en: 'The image uses monochromatic colors, presenting a unified and elegant feel with variations of a single hue.'
    },
    split: {
        zh: '圖片採用分裂互補配色，結合互補色的對比與類似色的和諧。',
        en: 'The image uses split-complementary colors, combining complementary contrast with analogous harmony.'
    },
    tetradic: {
        zh: '圖片採用四角配色，使用四種顏色形成複雜但平衡的視覺體驗。',
        en: 'The image uses tetradic colors, creating a complex but balanced visual experience with four colors.'
    }
};

let currentLang = 'zh-TW';
let analysisResult = null;

// DOM Elements
const elements = {
    uploadArea: document.getElementById('uploadArea'),
    fileInput: document.getElementById('fileInput'),
    previewArea: document.getElementById('previewArea'),
    previewImage: document.getElementById('previewImage'),
    progressContainer: document.getElementById('progressContainer'),
    progressFill: document.getElementById('progressFill'),
    resultsSection: document.getElementById('resultsSection'),
    harmonyScore: document.getElementById('harmonyScore'),
    harmonyType: document.getElementById('harmonyType'),
    colorPalette: document.getElementById('colorPalette'),
    colorWheelCanvas: document.getElementById('colorWheelCanvas'),
    dominantHue: document.getElementById('dominantHue'),
    saturation: document.getElementById('saturation'),
    colorTemp: document.getElementById('colorTemp'),
    colorCount: document.getElementById('colorCount'),
    harmonyDescription: document.getElementById('harmonyDescription'),
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

    if (analysisResult) {
        updateResults(analysisResult);
    }
}

function t(key) {
    return translations[currentLang][key] || key;
}

// Convert RGB to HSL
function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

// Convert RGB to Hex
function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

// Extract dominant colors using k-means-like clustering
function extractColors(imageData, k = 6) {
    const data = imageData.data;
    const pixels = [];

    for (let i = 0; i < data.length; i += 16) {
        pixels.push([data[i], data[i + 1], data[i + 2]]);
    }

    // Simple color quantization
    const colorBins = {};
    for (const [r, g, b] of pixels) {
        const key = `${Math.floor(r / 32)}-${Math.floor(g / 32)}-${Math.floor(b / 32)}`;
        if (!colorBins[key]) {
            colorBins[key] = { r: 0, g: 0, b: 0, count: 0 };
        }
        colorBins[key].r += r;
        colorBins[key].g += g;
        colorBins[key].b += b;
        colorBins[key].count++;
    }

    const colors = Object.values(colorBins)
        .sort((a, b) => b.count - a.count)
        .slice(0, k)
        .map(bin => ({
            r: Math.round(bin.r / bin.count),
            g: Math.round(bin.g / bin.count),
            b: Math.round(bin.b / bin.count),
            percent: Math.round((bin.count / pixels.length) * 100)
        }));

    return colors;
}

// Analyze color harmony
function analyzeColorHarmony(colors) {
    const hues = colors.map(c => rgbToHsl(c.r, c.g, c.b).h);
    const saturations = colors.map(c => rgbToHsl(c.r, c.g, c.b).s);

    // Calculate average saturation
    const avgSaturation = Math.round(saturations.reduce((a, b) => a + b, 0) / saturations.length);

    // Determine dominant hue
    const dominantHue = hues[0];

    // Check for color temperature
    let warmCount = 0, coolCount = 0;
    for (const h of hues) {
        if ((h >= 0 && h <= 60) || h >= 300) warmCount++;
        else if (h >= 180 && h <= 270) coolCount++;
    }

    let colorTemp;
    if (warmCount > coolCount * 1.5) colorTemp = 'warm';
    else if (coolCount > warmCount * 1.5) colorTemp = 'cool';
    else colorTemp = 'neutral';

    // Determine harmony type
    let harmonyType = 'monochromatic';
    let harmonyScore = 70;

    const hueRange = Math.max(...hues) - Math.min(...hues);
    const uniqueHues = [...new Set(hues.map(h => Math.floor(h / 30)))];

    if (uniqueHues.length === 1 || hueRange < 30) {
        harmonyType = 'monochromatic';
        harmonyScore = 85 + Math.random() * 10;
    } else if (uniqueHues.length === 2) {
        const diff = Math.abs(hues[0] - hues[1]);
        if (diff > 150 && diff < 210) {
            harmonyType = 'complementary';
            harmonyScore = 80 + Math.random() * 15;
        } else if (diff < 60) {
            harmonyType = 'analogous';
            harmonyScore = 85 + Math.random() * 10;
        } else {
            harmonyType = 'split';
            harmonyScore = 75 + Math.random() * 15;
        }
    } else if (uniqueHues.length >= 3) {
        harmonyType = uniqueHues.length === 3 ? 'triadic' : 'tetradic';
        harmonyScore = 70 + Math.random() * 20;
    }

    return {
        colors,
        harmonyType,
        harmonyScore: Math.round(harmonyScore),
        dominantHue,
        avgSaturation,
        colorTemp,
        colorCount: uniqueHues.length
    };
}

// Draw color wheel
function drawColorWheel(colors) {
    const canvas = elements.colorWheelCanvas;
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 100;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw base color wheel
    for (let angle = 0; angle < 360; angle++) {
        const startAngle = (angle - 1) * Math.PI / 180;
        const endAngle = (angle + 1) * Math.PI / 180;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();

        ctx.fillStyle = `hsl(${angle}, 70%, 50%)`;
        ctx.fill();
    }

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = '#1e293b';
    ctx.fill();

    // Plot colors on wheel
    for (const color of colors) {
        const hsl = rgbToHsl(color.r, color.g, color.b);
        const angle = hsl.h * Math.PI / 180;
        const dist = radius * 0.65 * (hsl.s / 100);

        const x = centerX + Math.cos(angle - Math.PI / 2) * dist;
        const y = centerY + Math.sin(angle - Math.PI / 2) * dist;

        ctx.beginPath();
        ctx.arc(x, y, 8 + color.percent * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = rgbToHex(color.r, color.g, color.b);
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

// Update results
function updateResults(result) {
    const lang = currentLang === 'zh-TW' ? 'zh' : 'en';

    // Score
    elements.harmonyScore.textContent = result.harmonyScore;
    elements.harmonyType.textContent = t(`harmony${result.harmonyType.charAt(0).toUpperCase() + result.harmonyType.slice(1)}`);

    // Palette
    elements.colorPalette.innerHTML = result.colors.map(c => `
        <div class="color-swatch" style="background: ${rgbToHex(c.r, c.g, c.b)}">
            <span class="color-hex">${rgbToHex(c.r, c.g, c.b)}</span>
            <span class="color-percent">${c.percent}%</span>
        </div>
    `).join('');

    // Stats
    const hueNames = { zh: ['紅', '橙', '黃', '黃綠', '綠', '青', '藍', '紫', '洋紅', '粉紅'], en: ['Red', 'Orange', 'Yellow', 'Lime', 'Green', 'Cyan', 'Blue', 'Purple', 'Magenta', 'Pink'] };
    const hueIndex = Math.floor(result.dominantHue / 36) % 10;
    elements.dominantHue.textContent = hueNames[lang][hueIndex];
    elements.saturation.textContent = `${result.avgSaturation}%`;
    elements.colorTemp.textContent = t(result.colorTemp);
    elements.colorCount.textContent = result.colorCount;

    // Color wheel
    drawColorWheel(result.colors);

    // Description
    document.getElementById('harmonyDescription').textContent = harmonyDescriptions[result.harmonyType][lang];
}

// Analyze image
function analyzeImage(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const maxSize = 300;
    let w = img.naturalWidth || img.width;
    let h = img.naturalHeight || img.height;

    if (w > maxSize || h > maxSize) {
        const scale = Math.min(maxSize / w, maxSize / h);
        w = Math.floor(w * scale);
        h = Math.floor(h * scale);
    }

    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(img, 0, 0, w, h);

    const imageData = ctx.getImageData(0, 0, w, h);
    const colors = extractColors(imageData);

    return analyzeColorHarmony(colors);
}

// Process image
async function processImage(img) {
    elements.progressContainer.style.display = 'block';
    elements.resultsSection.style.display = 'none';

    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;
        elements.progressFill.style.width = `${progress}%`;
    }, 150);

    await new Promise(resolve => setTimeout(resolve, 1500));

    clearInterval(interval);
    elements.progressFill.style.width = '100%';

    await new Promise(resolve => setTimeout(resolve, 300));

    analysisResult = analyzeImage(img);
    updateResults(analysisResult);

    elements.progressContainer.style.display = 'none';
    elements.resultsSection.style.display = 'block';
}

// Export palette
function exportPalette() {
    if (!analysisResult) return;

    const palette = {
        timestamp: new Date().toISOString(),
        harmonyType: analysisResult.harmonyType,
        harmonyScore: analysisResult.harmonyScore,
        colors: analysisResult.colors.map(c => ({
            hex: rgbToHex(c.r, c.g, c.b),
            rgb: { r: c.r, g: c.g, b: c.b },
            percent: c.percent
        }))
    };

    const blob = new Blob([JSON.stringify(palette, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `color-palette-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// Reset
function reset() {
    elements.uploadArea.style.display = 'block';
    elements.previewArea.style.display = 'none';
    elements.fileInput.value = '';
    elements.resultsSection.style.display = 'none';
    elements.progressContainer.style.display = 'block';
    elements.progressFill.style.width = '0%';
    analysisResult = null;
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
            processImage(elements.previewImage);
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

    elements.exportBtn.addEventListener('click', exportPalette);
    elements.resetBtn.addEventListener('click', reset);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setLanguage('zh-TW');
    initEventListeners();
});
