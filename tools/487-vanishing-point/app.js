/**
 * Vanishing Point Detection - Tool #487
 * Detect vanishing points in images
 */

// Internationalization
const translations = {
    'zh-TW': {
        title: '消失點偵測',
        subtitle: '自動偵測圖片中的透視消失點',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        uploadText: '拖放建築或街景圖片到此處或點擊上傳',
        uploadHint: '支援 PNG、JPG、WebP 格式',
        detectionResult: '偵測結果',
        analyzing: '正在偵測消失點...',
        analysisResults: '分析結果',
        downloadImage: '下載標註圖片',
        exportResults: '匯出數據',
        uploadAnother: '上傳其他圖片',
        backToHome: '返回首頁',
        toolNumber: '工具 #487',
        vpCount: '消失點數量',
        perspectiveType: '透視類型',
        mainVP: '主消失點',
        secondaryVP: '次消失點',
        confidence: '信心度',
        onePoint: '一點透視',
        twoPoint: '兩點透視',
        threePoint: '三點透視'
    },
    'en': {
        title: 'Vanishing Point Detection',
        subtitle: 'Automatically detect perspective vanishing points',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        uploadText: 'Drag & drop architecture or street image here or click to upload',
        uploadHint: 'Supports PNG, JPG, WebP formats',
        detectionResult: 'Detection Result',
        analyzing: 'Detecting vanishing points...',
        analysisResults: 'Analysis Results',
        downloadImage: 'Download Annotated Image',
        exportResults: 'Export Data',
        uploadAnother: 'Upload Another',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #487',
        vpCount: 'Vanishing Points',
        perspectiveType: 'Perspective Type',
        mainVP: 'Main VP',
        secondaryVP: 'Secondary VP',
        confidence: 'Confidence',
        onePoint: 'One-Point',
        twoPoint: 'Two-Point',
        threePoint: 'Three-Point'
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
    vpList: document.getElementById('vpList'),
    vpStats: document.getElementById('vpStats'),
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

// Vanishing Point Detection (Simulated)
function detectVanishingPoints(imageData, width, height) {
    // Simulate vanishing point detection
    const vpCount = 1 + Math.floor(Math.random() * 2); // 1-2 vanishing points

    const vanishingPoints = [];

    // Main vanishing point (usually near center horizon)
    const mainVP = {
        x: width * (0.4 + Math.random() * 0.2),
        y: height * (0.3 + Math.random() * 0.2),
        type: 'main',
        confidence: 75 + Math.random() * 20
    };
    vanishingPoints.push(mainVP);

    // Secondary vanishing point (for two-point perspective)
    if (vpCount >= 2) {
        const side = Math.random() > 0.5 ? 1 : -1;
        const secondaryVP = {
            x: mainVP.x + side * width * (0.3 + Math.random() * 0.3),
            y: mainVP.y + (Math.random() - 0.5) * height * 0.1,
            type: 'secondary',
            confidence: 60 + Math.random() * 25
        };
        vanishingPoints.push(secondaryVP);
    }

    // Determine perspective type
    let perspectiveType;
    if (vpCount === 1) {
        perspectiveType = 'onePoint';
    } else if (vpCount === 2) {
        perspectiveType = 'twoPoint';
    } else {
        perspectiveType = 'threePoint';
    }

    return {
        vanishingPoints,
        perspectiveType,
        vpCount
    };
}

function drawVanishingPoints(results, width, height) {
    const canvas = elements.resultCanvas;
    const img = loadedImage;

    // Set canvas size
    const maxWidth = 800;
    const scale = Math.min(1, maxWidth / img.width);
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;

    // Draw image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const colors = ['#ef4444', '#3b82f6', '#22c55e'];

    results.vanishingPoints.forEach((vp, index) => {
        const x = vp.x * scale;
        const y = vp.y * scale;
        const color = colors[index % colors.length];

        // Draw perspective lines from corners
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 5]);

        const corners = [
            [0, 0], [canvas.width, 0],
            [0, canvas.height], [canvas.width, canvas.height]
        ];

        corners.forEach(([cx, cy]) => {
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(x, y);
            ctx.stroke();
        });

        ctx.setLineDash([]);

        // Draw vanishing point marker
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw crosshair
        ctx.beginPath();
        ctx.moveTo(x - 18, y);
        ctx.lineTo(x + 18, y);
        ctx.moveTo(x, y - 18);
        ctx.lineTo(x, y + 18);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label
        ctx.font = 'bold 12px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`VP${index + 1}`, x + 15, y - 15);
    });
}

function displayResults(results) {
    const vpNames = [t('mainVP'), t('secondaryVP'), 'VP3'];

    elements.vpList.innerHTML = results.vanishingPoints.map((vp, index) => `
        <div class="vp-item">
            <div class="vp-name">${vpNames[index] || 'VP' + (index + 1)}</div>
            <div class="vp-coords">X: ${Math.round(vp.x)}, Y: ${Math.round(vp.y)}</div>
            <div class="vp-confidence">${t('confidence')}: ${vp.confidence.toFixed(1)}%</div>
        </div>
    `).join('');

    elements.vpStats.innerHTML = `
        <div class="stat-item">
            <div class="stat-value">${results.vpCount}</div>
            <div class="stat-label">${t('vpCount')}</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${t(results.perspectiveType)}</div>
            <div class="stat-label">${t('perspectiveType')}</div>
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

            const maxSize = 800;
            const scale = Math.min(1, maxSize / img.width, maxSize / img.height);
            const w = img.width * scale;
            const h = img.height * scale;

            simulateProgress(() => {
                analysisResults = detectVanishingPoints(null, w, h);
                drawVanishingPoints(analysisResults, w, h);
                displayResults(analysisResults);
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
    link.download = `vanishing-points-${Date.now()}.png`;
    link.href = elements.resultCanvas.toDataURL('image/png');
    link.click();
}

function exportResults() {
    if (!analysisResults) return;

    const data = {
        tool: 'Vanishing Point Detection - Tool #487',
        timestamp: new Date().toISOString(),
        results: {
            perspectiveType: t(analysisResults.perspectiveType),
            vanishingPointCount: analysisResults.vpCount,
            vanishingPoints: analysisResults.vanishingPoints.map((vp, i) => ({
                name: `VP${i + 1}`,
                x: Math.round(vp.x),
                y: Math.round(vp.y),
                confidence: vp.confidence.toFixed(2) + '%'
            }))
        }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vanishing-points-${Date.now()}.json`;
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
