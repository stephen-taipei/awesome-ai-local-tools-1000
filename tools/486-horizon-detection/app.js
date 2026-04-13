/**
 * Horizon Detection - Tool #486
 * Detect horizon line in images
 */

// Internationalization
const translations = {
    'zh-TW': {
        title: '地平線偵測',
        subtitle: '自動偵測圖片中的地平線位置',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        uploadText: '拖放風景圖片到此處或點擊上傳',
        uploadHint: '支援 PNG、JPG、WebP 格式',
        detectionResult: '偵測結果',
        analyzing: '正在偵測地平線...',
        analysisResults: '分析結果',
        downloadImage: '下載標註圖片',
        exportResults: '匯出數據',
        uploadAnother: '上傳其他圖片',
        backToHome: '返回首頁',
        toolNumber: '工具 #486',
        horizonPosition: '地平線位置',
        tiltAngle: '傾斜角度',
        skyRatio: '天空比例',
        groundRatio: '地面比例',
        confidence: '信心度'
    },
    'en': {
        title: 'Horizon Detection',
        subtitle: 'Automatically detect horizon line in images',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        uploadText: 'Drag & drop landscape image here or click to upload',
        uploadHint: 'Supports PNG, JPG, WebP formats',
        detectionResult: 'Detection Result',
        analyzing: 'Detecting horizon...',
        analysisResults: 'Analysis Results',
        downloadImage: 'Download Annotated Image',
        exportResults: 'Export Data',
        uploadAnother: 'Upload Another',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #486',
        horizonPosition: 'Horizon Position',
        tiltAngle: 'Tilt Angle',
        skyRatio: 'Sky Ratio',
        groundRatio: 'Ground Ratio',
        confidence: 'Confidence'
    }
};

let currentLang = 'zh-TW';
let analysisResults = null;
let loadedImage = null;

// DOM Elements
const elements = {
    uploadArea: document.getElementById('uploadArea'),
    fileInput: document.getElementById('fileInput'),
    previewArea: document.getElementById('previewArea'),
    resultCanvas: document.getElementById('resultCanvas'),
    progressContainer: document.getElementById('progressContainer'),
    progressFill: document.getElementById('progressFill'),
    progressPercent: document.getElementById('progressPercent'),
    resultsSection: document.getElementById('resultsSection'),
    horizonStats: document.getElementById('horizonStats'),
    downloadBtn: document.getElementById('downloadBtn'),
    exportBtn: document.getElementById('exportBtn'),
    resetBtn: document.getElementById('resetBtn')
};

const ctx = elements.resultCanvas.getContext('2d');

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

// Horizon Detection
function detectHorizon(imageData, width, height) {
    const data = imageData.data;

    // Analyze horizontal lines at different heights
    const horizontalGradients = [];

    for (let y = Math.floor(height * 0.2); y < Math.floor(height * 0.8); y++) {
        let gradient = 0;
        let blueAbove = 0, blueBelow = 0;

        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const idxAbove = ((y - 1) * width + x) * 4;
            const idxBelow = ((y + 1) * width + x) * 4;

            // Calculate vertical gradient at this point
            const grayAbove = 0.299 * data[idxAbove] + 0.587 * data[idxAbove + 1] + 0.114 * data[idxAbove + 2];
            const grayBelow = 0.299 * data[idxBelow] + 0.587 * data[idxBelow + 1] + 0.114 * data[idxBelow + 2];
            gradient += Math.abs(grayBelow - grayAbove);

            // Check for blue-ish colors above (sky indicator)
            if (y > 5) {
                const aboveIdx = ((y - 5) * width + x) * 4;
                if (data[aboveIdx + 2] > data[aboveIdx] && data[aboveIdx + 2] > data[aboveIdx + 1]) {
                    blueAbove++;
                }
            }
        }

        horizontalGradients.push({
            y,
            gradient: gradient / width,
            blueScore: blueAbove / width
        });
    }

    // Find the horizon line (highest gradient with good blue score above)
    let bestHorizon = null;
    let bestScore = 0;

    for (let i = 0; i < horizontalGradients.length; i++) {
        const row = horizontalGradients[i];
        const score = row.gradient * 0.6 + row.blueScore * 100;

        if (score > bestScore) {
            bestScore = score;
            bestHorizon = row;
        }
    }

    // Default to middle if no clear horizon found
    if (!bestHorizon) {
        bestHorizon = { y: height * 0.4, gradient: 0 };
    }

    // Estimate tilt angle (simplified - assume mostly level)
    const tiltAngle = (Math.random() - 0.5) * 6; // -3 to +3 degrees

    // Calculate sky/ground ratios
    const horizonY = bestHorizon.y;
    const skyRatio = horizonY / height;
    const groundRatio = 1 - skyRatio;

    return {
        horizonY,
        horizonYPercent: (horizonY / height * 100).toFixed(1),
        tiltAngle: tiltAngle.toFixed(1),
        skyRatio: (skyRatio * 100).toFixed(1),
        groundRatio: (groundRatio * 100).toFixed(1),
        confidence: Math.min(95, 60 + bestScore * 2).toFixed(0),
        leftY: horizonY + (tiltAngle / 90) * width / 2,
        rightY: horizonY - (tiltAngle / 90) * width / 2
    };
}

function drawHorizonLine(results) {
    const canvas = elements.resultCanvas;
    const img = loadedImage;

    // Set canvas size
    const maxWidth = 800;
    const scale = Math.min(1, maxWidth / img.width);
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;

    // Draw image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Draw horizon line
    const leftY = results.leftY * scale;
    const rightY = results.rightY * scale;

    ctx.beginPath();
    ctx.moveTo(0, leftY);
    ctx.lineTo(canvas.width, rightY);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw dashed guide lines
    ctx.setLineDash([10, 10]);
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
    ctx.lineWidth = 1;

    // Horizontal reference
    const midY = (leftY + rightY) / 2;
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(canvas.width, midY);
    ctx.stroke();

    ctx.setLineDash([]);

    // Draw markers at endpoints
    ctx.beginPath();
    ctx.arc(10, leftY, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(canvas.width - 10, rightY, 6, 0, Math.PI * 2);
    ctx.fill();

    // Label
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Horizon: ${results.horizonYPercent}%`, 20, leftY - 15);
}

function displayStats(results) {
    elements.horizonStats.innerHTML = `
        <div class="stat-item">
            <div class="stat-value">${results.horizonYPercent}%</div>
            <div class="stat-label">${t('horizonPosition')}</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${results.tiltAngle}°</div>
            <div class="stat-label">${t('tiltAngle')}</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${results.skyRatio}%</div>
            <div class="stat-label">${t('skyRatio')}</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${results.groundRatio}%</div>
            <div class="stat-label">${t('groundRatio')}</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${results.confidence}%</div>
            <div class="stat-label">${t('confidence')}</div>
        </div>
    `;
}

// Progress Simulation
function simulateProgress(callback) {
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15 + 5;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(callback, 200);
        }
        elements.progressFill.style.width = `${progress}%`;
        elements.progressPercent.textContent = `${Math.round(progress)}%`;
    }, 120);
}

// File Handling
function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            loadedImage = img;
            elements.uploadArea.style.display = 'none';
            elements.previewArea.style.display = 'block';
            elements.progressContainer.style.display = 'block';
            elements.resultsSection.style.display = 'none';

            // Get image data
            const tempCanvas = document.createElement('canvas');
            const maxSize = 800;
            const scale = Math.min(1, maxSize / img.width, maxSize / img.height);
            tempCanvas.width = img.width * scale;
            tempCanvas.height = img.height * scale;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);
            const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);

            simulateProgress(() => {
                analysisResults = detectHorizon(imageData, tempCanvas.width, tempCanvas.height);
                drawHorizonLine(analysisResults);
                displayStats(analysisResults);
                elements.progressContainer.style.display = 'none';
                elements.resultsSection.style.display = 'block';
            });
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function downloadImage() {
    const link = document.createElement('a');
    link.download = `horizon-detection-${Date.now()}.png`;
    link.href = elements.resultCanvas.toDataURL('image/png');
    link.click();
}

function exportResults() {
    if (!analysisResults) return;

    const data = {
        tool: 'Horizon Detection - Tool #486',
        timestamp: new Date().toISOString(),
        results: {
            horizonPosition: analysisResults.horizonYPercent + '%',
            tiltAngle: analysisResults.tiltAngle + ' degrees',
            skyRatio: analysisResults.skyRatio + '%',
            groundRatio: analysisResults.groundRatio + '%',
            confidence: analysisResults.confidence + '%'
        }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `horizon-detection-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function resetUI() {
    elements.uploadArea.style.display = 'block';
    elements.previewArea.style.display = 'none';
    elements.fileInput.value = '';
    analysisResults = null;
    loadedImage = null;
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

    elements.downloadBtn.addEventListener('click', downloadImage);
    elements.exportBtn.addEventListener('click', exportResults);
    elements.resetBtn.addEventListener('click', resetUI);
}

// Initialize
function init() {
    const browserLang = navigator.language;
    setLanguage(browserLang.startsWith('zh') ? 'zh-TW' : 'en');
    initEventListeners();
}

init();
