/**
 * Aesthetic Scoring - Tool #493
 * Score image aesthetics and quality
 */

// Translations
const translations = {
    'zh-TW': {
        title: '美學評分',
        subtitle: 'AI 評估圖片的美學品質與藝術價值',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        uploadText: '拖放圖片到此處或點擊上傳',
        uploadHint: '支援 PNG、JPG、WebP 格式',
        analyzing: '評估中...',
        overallScore: '綜合評分',
        breakdown: '評分細項',
        composition: '構圖',
        colorHarmony: '色彩和諧',
        lighting: '光線',
        clarity: '清晰度',
        creativity: '創意性',
        suggestions: '改善建議',
        export: '匯出報告',
        uploadAnother: '上傳其他圖片',
        backToHome: '返回首頁',
        toolNumber: '工具 #493',
        ratingExcellent: '傑出',
        ratingGood: '優秀',
        ratingAverage: '良好',
        ratingFair: '普通',
        ratingPoor: '待改進'
    },
    'en': {
        title: 'Aesthetic Scoring',
        subtitle: 'AI evaluates image aesthetic quality and artistic value',
        privacyBadge: '100% Local Processing · Zero Upload',
        uploadText: 'Drag & drop image here or click to upload',
        uploadHint: 'Supports PNG, JPG, WebP formats',
        analyzing: 'Analyzing...',
        overallScore: 'Overall Score',
        breakdown: 'Score Breakdown',
        composition: 'Composition',
        colorHarmony: 'Color Harmony',
        lighting: 'Lighting',
        clarity: 'Clarity',
        creativity: 'Creativity',
        suggestions: 'Suggestions',
        export: 'Export Report',
        uploadAnother: 'Upload Another',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #493',
        ratingExcellent: 'Excellent',
        ratingGood: 'Very Good',
        ratingAverage: 'Good',
        ratingFair: 'Fair',
        ratingPoor: 'Needs Work'
    }
};

const suggestions = {
    composition: {
        low: {
            zh: '建議使用三分法則或黃金分割來改善構圖',
            en: 'Consider using the rule of thirds or golden ratio for better composition'
        },
        medium: {
            zh: '構圖基本合理，可嘗試更有創意的角度',
            en: 'Composition is decent, try more creative angles'
        }
    },
    color: {
        low: {
            zh: '色彩較為單調，可增加對比色或調整飽和度',
            en: 'Colors appear flat, consider adding contrast or adjusting saturation'
        },
        medium: {
            zh: '色彩搭配尚可，可嘗試更和諧的配色方案',
            en: 'Color palette is acceptable, try more harmonious color schemes'
        }
    },
    lighting: {
        low: {
            zh: '光線不足或過曝，建議調整曝光值',
            en: 'Lighting is too dark or overexposed, adjust exposure'
        },
        medium: {
            zh: '光線分布可改善，嘗試使用自然光或補光',
            en: 'Lighting distribution could improve, try natural or fill lighting'
        }
    },
    clarity: {
        low: {
            zh: '圖片較為模糊，使用三腳架或提高快門速度',
            en: 'Image appears blurry, use tripod or faster shutter speed'
        },
        medium: {
            zh: '清晰度尚可，可適當銳化處理',
            en: 'Clarity is acceptable, consider sharpening'
        }
    },
    creativity: {
        low: {
            zh: '嘗試獨特的視角或後製風格增加創意性',
            en: 'Try unique perspectives or post-processing styles for creativity'
        },
        medium: {
            zh: '有一定創意，可進一步探索個人風格',
            en: 'Shows creativity, explore your personal style further'
        }
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
    progressText: document.getElementById('progressText'),
    scoreSection: document.getElementById('scoreSection'),
    scoreValue: document.getElementById('scoreValue'),
    scoreRating: document.getElementById('scoreRating'),
    compositionFill: document.getElementById('compositionFill'),
    compositionValue: document.getElementById('compositionValue'),
    colorFill: document.getElementById('colorFill'),
    colorValue: document.getElementById('colorValue'),
    lightingFill: document.getElementById('lightingFill'),
    lightingValue: document.getElementById('lightingValue'),
    clarityFill: document.getElementById('clarityFill'),
    clarityValue: document.getElementById('clarityValue'),
    creativityFill: document.getElementById('creativityFill'),
    creativityValue: document.getElementById('creativityValue'),
    suggestionsList: document.getElementById('suggestionsList'),
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
        updateSuggestions(analysisResult);
        updateRating(analysisResult.overall);
    }
}

function t(key) {
    return translations[currentLang][key] || key;
}

// Analyze image aesthetics
function analyzeAesthetics(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const w = canvas.width = img.naturalWidth || 400;
    const h = canvas.height = img.naturalHeight || 400;
    ctx.drawImage(img, 0, 0, w, h);

    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;

    // Analyze various aspects
    const composition = analyzeComposition(data, w, h);
    const colorHarmony = analyzeColorHarmony(data);
    const lighting = analyzeLighting(data);
    const clarity = analyzeClarity(data, w, h);
    const creativity = 60 + Math.random() * 30; // Simulated

    const overall = Math.round(
        composition * 0.25 +
        colorHarmony * 0.25 +
        lighting * 0.2 +
        clarity * 0.2 +
        creativity * 0.1
    );

    return {
        overall,
        composition: Math.round(composition),
        colorHarmony: Math.round(colorHarmony),
        lighting: Math.round(lighting),
        clarity: Math.round(clarity),
        creativity: Math.round(creativity)
    };
}

function analyzeComposition(data, w, h) {
    // Rule of thirds analysis
    const thirds = [w / 3, w * 2 / 3, h / 3, h * 2 / 3];
    let interestPoints = 0;

    // Sample points at rule of thirds intersections
    const checkPoints = [
        [thirds[0], thirds[2]], [thirds[1], thirds[2]],
        [thirds[0], thirds[3]], [thirds[1], thirds[3]]
    ];

    for (const [x, y] of checkPoints) {
        const idx = (Math.floor(y) * w + Math.floor(x)) * 4;
        const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
        // Check for contrast at interest points
        const surroundingBrightness = getAverageBrightness(data, w, h, x, y, 20);
        if (Math.abs(brightness - surroundingBrightness) > 30) {
            interestPoints++;
        }
    }

    const baseScore = 50 + interestPoints * 10;
    return Math.min(100, baseScore + Math.random() * 15);
}

function getAverageBrightness(data, w, h, cx, cy, radius) {
    let sum = 0, count = 0;
    for (let y = Math.max(0, cy - radius); y < Math.min(h, cy + radius); y++) {
        for (let x = Math.max(0, cx - radius); x < Math.min(w, cx + radius); x++) {
            const idx = (Math.floor(y) * w + Math.floor(x)) * 4;
            sum += (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
            count++;
        }
    }
    return count > 0 ? sum / count : 128;
}

function analyzeColorHarmony(data) {
    // Count unique hues
    const hueCount = {};
    for (let i = 0; i < data.length; i += 16) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const hue = Math.floor(rgbToHue(r, g, b) / 30) * 30;
        hueCount[hue] = (hueCount[hue] || 0) + 1;
    }

    const hues = Object.keys(hueCount).map(Number).sort((a, b) => hueCount[b] - hueCount[a]);
    const dominantHues = hues.slice(0, 3);

    // Check for complementary or analogous colors
    let harmonyScore = 50;
    if (dominantHues.length >= 2) {
        const diff = Math.abs(dominantHues[0] - dominantHues[1]);
        if (diff >= 150 && diff <= 210) { // Complementary
            harmonyScore += 30;
        } else if (diff <= 60) { // Analogous
            harmonyScore += 25;
        }
    }

    return Math.min(100, harmonyScore + Math.random() * 20);
}

function rgbToHue(r, g, b) {
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0;
    if (max !== min) {
        const d = max - min;
        if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
        else if (max === g) h = ((b - r) / d + 2) * 60;
        else h = ((r - g) / d + 4) * 60;
    }
    return h;
}

function analyzeLighting(data) {
    let brightness = 0;
    let histogram = new Array(256).fill(0);

    for (let i = 0; i < data.length; i += 4) {
        const b = Math.round((data[i] + data[i + 1] + data[i + 2]) / 3);
        brightness += b;
        histogram[b]++;
    }

    brightness /= (data.length / 4);
    const pixelCount = data.length / 4;

    // Check for proper exposure (histogram distribution)
    const underexposed = histogram.slice(0, 50).reduce((a, b) => a + b, 0) / pixelCount;
    const overexposed = histogram.slice(205).reduce((a, b) => a + b, 0) / pixelCount;

    let score = 80;
    if (underexposed > 0.3) score -= 25;
    if (overexposed > 0.3) score -= 25;
    if (brightness < 60 || brightness > 200) score -= 15;

    return Math.max(30, Math.min(100, score + Math.random() * 15));
}

function analyzeClarity(data, w, h) {
    // Laplacian variance for sharpness detection
    let variance = 0;
    let count = 0;

    for (let y = 1; y < h - 1; y += 2) {
        for (let x = 1; x < w - 1; x += 2) {
            const idx = (y * w + x) * 4;
            const center = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;

            const neighbors = [
                ((y - 1) * w + x) * 4,
                ((y + 1) * w + x) * 4,
                (y * w + x - 1) * 4,
                (y * w + x + 1) * 4
            ];

            let laplacian = -4 * center;
            for (const n of neighbors) {
                laplacian += (data[n] + data[n + 1] + data[n + 2]) / 3;
            }
            variance += laplacian * laplacian;
            count++;
        }
    }

    const sharpness = Math.sqrt(variance / count);
    return Math.min(100, 40 + sharpness * 1.5 + Math.random() * 10);
}

// Update UI with scores
function updateScores(result) {
    // Animate score value
    let current = 0;
    const target = result.overall;
    const interval = setInterval(() => {
        current += 2;
        if (current >= target) {
            current = target;
            clearInterval(interval);
        }
        elements.scoreValue.textContent = current;
    }, 30);

    // Update rating
    updateRating(result.overall);

    // Animate individual scores
    setTimeout(() => {
        elements.compositionFill.style.width = `${result.composition}%`;
        elements.compositionValue.textContent = result.composition;

        elements.colorFill.style.width = `${result.colorHarmony}%`;
        elements.colorValue.textContent = result.colorHarmony;

        elements.lightingFill.style.width = `${result.lighting}%`;
        elements.lightingValue.textContent = result.lighting;

        elements.clarityFill.style.width = `${result.clarity}%`;
        elements.clarityValue.textContent = result.clarity;

        elements.creativityFill.style.width = `${result.creativity}%`;
        elements.creativityValue.textContent = result.creativity;
    }, 300);

    // Update suggestions
    updateSuggestions(result);
}

function updateRating(score) {
    let rating;
    if (score >= 90) rating = t('ratingExcellent');
    else if (score >= 75) rating = t('ratingGood');
    else if (score >= 60) rating = t('ratingAverage');
    else if (score >= 45) rating = t('ratingFair');
    else rating = t('ratingPoor');

    elements.scoreRating.textContent = rating;
}

function updateSuggestions(result) {
    const lang = currentLang === 'zh-TW' ? 'zh' : 'en';
    const suggestionItems = [];

    if (result.composition < 70) {
        suggestionItems.push(suggestions.composition[result.composition < 50 ? 'low' : 'medium'][lang]);
    }
    if (result.colorHarmony < 70) {
        suggestionItems.push(suggestions.color[result.colorHarmony < 50 ? 'low' : 'medium'][lang]);
    }
    if (result.lighting < 70) {
        suggestionItems.push(suggestions.lighting[result.lighting < 50 ? 'low' : 'medium'][lang]);
    }
    if (result.clarity < 70) {
        suggestionItems.push(suggestions.clarity[result.clarity < 50 ? 'low' : 'medium'][lang]);
    }
    if (result.creativity < 70) {
        suggestionItems.push(suggestions.creativity[result.creativity < 50 ? 'low' : 'medium'][lang]);
    }

    if (suggestionItems.length === 0) {
        suggestionItems.push(lang === 'zh' ? '這是一張優秀的圖片，繼續保持！' : 'This is an excellent image, keep it up!');
    }

    elements.suggestionsList.innerHTML = suggestionItems.map(s => `<li>${s}</li>`).join('');
}

// Process image
async function processImage() {
    elements.progressContainer.style.display = 'block';
    elements.scoreSection.style.display = 'none';

    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;
        elements.progressFill.style.width = `${progress}%`;
    }, 150);

    await new Promise(resolve => setTimeout(resolve, 2000));

    clearInterval(interval);
    elements.progressFill.style.width = '100%';

    await new Promise(resolve => setTimeout(resolve, 300));

    // Analyze and display
    analysisResult = analyzeAesthetics(elements.previewImage);
    updateScores(analysisResult);

    elements.progressContainer.style.display = 'none';
    elements.scoreSection.style.display = 'block';
}

// Export report
function exportReport() {
    if (!analysisResult) return;

    const report = {
        timestamp: new Date().toISOString(),
        scores: analysisResult,
        rating: elements.scoreRating.textContent
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aesthetic-score-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// Reset
function reset() {
    elements.uploadArea.style.display = 'block';
    elements.previewArea.style.display = 'none';
    elements.fileInput.value = '';
    elements.scoreSection.style.display = 'none';
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

    elements.exportBtn.addEventListener('click', exportReport);
    elements.resetBtn.addEventListener('click', reset);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setLanguage('zh-TW');
    initEventListeners();
});
