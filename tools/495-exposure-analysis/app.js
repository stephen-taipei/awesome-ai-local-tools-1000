/**
 * Exposure Analysis - Tool #495
 * Analyze image exposure and brightness distribution
 */

// Translations
const translations = {
    'zh-TW': {
        title: '曝光分析',
        subtitle: 'AI 分析圖片曝光狀態與亮度分布',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        uploadText: '拖放圖片到此處或點擊上傳',
        uploadHint: '支援 PNG、JPG、WebP 格式',
        analyzing: '分析中...',
        histogram: '亮度直方圖',
        shadows: '暗部',
        midtones: '中間調',
        highlights: '亮部',
        avgBrightness: '平均亮度',
        dynamicRange: '動態範圍',
        clipping: '剪裁比例',
        zoneAnalysis: '區域分析',
        underexposed: '曝光不足',
        proper: '正常曝光',
        overexposed: '曝光過度',
        suggestions: '調整建議',
        export: '匯出報告',
        uploadAnother: '上傳其他圖片',
        backToHome: '返回首頁',
        toolNumber: '工具 #495',
        statusUnder: '曝光不足',
        statusProper: '曝光正常',
        statusOver: '曝光過度'
    },
    'en': {
        title: 'Exposure Analysis',
        subtitle: 'AI analyzes image exposure and brightness distribution',
        privacyBadge: '100% Local Processing · Zero Upload',
        uploadText: 'Drag & drop image here or click to upload',
        uploadHint: 'Supports PNG, JPG, WebP formats',
        analyzing: 'Analyzing...',
        histogram: 'Brightness Histogram',
        shadows: 'Shadows',
        midtones: 'Midtones',
        highlights: 'Highlights',
        avgBrightness: 'Avg Brightness',
        dynamicRange: 'Dynamic Range',
        clipping: 'Clipping',
        zoneAnalysis: 'Zone Analysis',
        underexposed: 'Underexposed',
        proper: 'Proper',
        overexposed: 'Overexposed',
        suggestions: 'Suggestions',
        export: 'Export Report',
        uploadAnother: 'Upload Another',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #495',
        statusUnder: 'Underexposed',
        statusProper: 'Properly Exposed',
        statusOver: 'Overexposed'
    }
};

const suggestionTexts = {
    under: {
        zh: '圖片曝光不足。建議增加曝光補償 +0.5 到 +1.5 EV，或降低快門速度、增大光圈、提高 ISO。',
        en: 'Image is underexposed. Consider increasing exposure compensation by +0.5 to +1.5 EV, or use slower shutter speed, wider aperture, or higher ISO.'
    },
    proper: {
        zh: '圖片曝光良好，亮度分布均勻，無需調整。',
        en: 'Image is properly exposed with good brightness distribution. No adjustment needed.'
    },
    over: {
        zh: '圖片曝光過度。建議降低曝光補償 -0.5 到 -1.5 EV，或提高快門速度、縮小光圈、降低 ISO。',
        en: 'Image is overexposed. Consider decreasing exposure compensation by -0.5 to -1.5 EV, or use faster shutter speed, smaller aperture, or lower ISO.'
    }
};

let currentLang = 'zh-TW';
let analysisResult = null;

// DOM Elements
const elements = {
    uploadArea: document.getElementById('uploadArea'),
    fileInput: document.getElementById('fileInput'),
    previewArea: document.getElementById('previewArea'),
    previewCanvas: document.getElementById('previewCanvas'),
    progressContainer: document.getElementById('progressContainer'),
    progressFill: document.getElementById('progressFill'),
    progressText: document.getElementById('progressText'),
    resultsSection: document.getElementById('resultsSection'),
    statusIndicator: document.getElementById('statusIndicator'),
    statusLabel: document.getElementById('statusLabel'),
    histogramCanvas: document.getElementById('histogramCanvas'),
    avgBrightness: document.getElementById('avgBrightness'),
    dynamicRange: document.getElementById('dynamicRange'),
    clipping: document.getElementById('clipping'),
    underFill: document.getElementById('underFill'),
    underValue: document.getElementById('underValue'),
    properFill: document.getElementById('properFill'),
    properValue: document.getElementById('properValue'),
    overFill: document.getElementById('overFill'),
    overValue: document.getElementById('overValue'),
    suggestionContent: document.getElementById('suggestionContent'),
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

// Analyze exposure
function analyzeExposure(img) {
    const canvas = elements.previewCanvas;
    const ctx = canvas.getContext('2d');

    const maxSize = 500;
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
    const data = imageData.data;

    // Calculate histogram
    const histogram = new Array(256).fill(0);
    let totalBrightness = 0;
    let underCount = 0, properCount = 0, overCount = 0;
    let clippedDark = 0, clippedBright = 0;

    for (let i = 0; i < data.length; i += 4) {
        const brightness = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
        histogram[brightness]++;
        totalBrightness += brightness;

        if (brightness < 50) {
            underCount++;
            if (brightness < 5) clippedDark++;
        } else if (brightness > 205) {
            overCount++;
            if (brightness > 250) clippedBright++;
        } else {
            properCount++;
        }
    }

    const pixelCount = data.length / 4;
    const avgBrightness = totalBrightness / pixelCount;

    // Calculate dynamic range
    let minBrightness = 0, maxBrightness = 255;
    for (let i = 0; i < 256; i++) {
        if (histogram[i] > pixelCount * 0.001) {
            minBrightness = i;
            break;
        }
    }
    for (let i = 255; i >= 0; i--) {
        if (histogram[i] > pixelCount * 0.001) {
            maxBrightness = i;
            break;
        }
    }

    const dynamicRange = maxBrightness - minBrightness;
    const clippingPercent = ((clippedDark + clippedBright) / pixelCount) * 100;

    // Determine exposure status
    let exposureStatus;
    if (avgBrightness < 90) {
        exposureStatus = 'under';
    } else if (avgBrightness > 165) {
        exposureStatus = 'over';
    } else {
        exposureStatus = 'proper';
    }

    return {
        histogram,
        avgBrightness: Math.round(avgBrightness),
        dynamicRange,
        clippingPercent: Math.round(clippingPercent * 10) / 10,
        underPercent: Math.round((underCount / pixelCount) * 100),
        properPercent: Math.round((properCount / pixelCount) * 100),
        overPercent: Math.round((overCount / pixelCount) * 100),
        exposureStatus
    };
}

// Draw histogram
function drawHistogram(histogram) {
    const canvas = elements.histogramCanvas;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = canvas.offsetWidth * 2;
    const h = canvas.height = 150 * 2;

    ctx.scale(2, 2);
    ctx.clearRect(0, 0, w / 2, h / 2);

    const maxVal = Math.max(...histogram);
    const barWidth = (w / 2) / 256;

    for (let i = 0; i < 256; i++) {
        const barHeight = (histogram[i] / maxVal) * (h / 2 - 10);
        const x = i * barWidth;
        const y = h / 2 - barHeight;

        // Color gradient from dark to bright
        const gray = Math.round(i);
        ctx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;
        ctx.fillRect(x, y, barWidth + 0.5, barHeight);
    }

    // Draw zone indicators
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(50 * barWidth, 0);
    ctx.lineTo(50 * barWidth, h / 2);
    ctx.stroke();

    ctx.strokeStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(205 * barWidth, 0);
    ctx.lineTo(205 * barWidth, h / 2);
    ctx.stroke();
}

// Update results
function updateResults(result) {
    const lang = currentLang === 'zh-TW' ? 'zh' : 'en';

    // Status
    elements.statusIndicator.className = `status-indicator ${result.exposureStatus}`;
    elements.statusLabel.textContent = t(`status${result.exposureStatus.charAt(0).toUpperCase() + result.exposureStatus.slice(1)}`);

    // Metrics
    elements.avgBrightness.textContent = result.avgBrightness;
    elements.dynamicRange.textContent = result.dynamicRange;
    elements.clipping.textContent = `${result.clippingPercent}%`;

    // Zone bars
    elements.underFill.style.width = `${result.underPercent}%`;
    elements.underValue.textContent = `${result.underPercent}%`;
    elements.properFill.style.width = `${result.properPercent}%`;
    elements.properValue.textContent = `${result.properPercent}%`;
    elements.overFill.style.width = `${result.overPercent}%`;
    elements.overValue.textContent = `${result.overPercent}%`;

    // Histogram
    drawHistogram(result.histogram);

    // Suggestions
    elements.suggestionContent.textContent = suggestionTexts[result.exposureStatus][lang];
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

    analysisResult = analyzeExposure(img);
    updateResults(analysisResult);

    elements.progressContainer.style.display = 'none';
    elements.resultsSection.style.display = 'block';
}

// Export report
function exportReport() {
    if (!analysisResult) return;

    const report = {
        timestamp: new Date().toISOString(),
        analysis: analysisResult
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exposure-analysis-${Date.now()}.json`;
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
        const img = new Image();
        img.onload = () => {
            elements.uploadArea.style.display = 'none';
            elements.previewArea.style.display = 'block';
            processImage(img);
        };
        img.src = e.target.result;
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
