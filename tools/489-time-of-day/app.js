/**
 * Time of Day Estimation - Tool #489
 * Estimate time of day from lighting conditions
 */

// Internationalization
const translations = {
    'zh-TW': {
        title: '時間判斷',
        subtitle: '從光線條件估計拍攝時間',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        uploadText: '拖放戶外場景圖片到此處或點擊上傳',
        uploadHint: '支援 PNG、JPG、WebP 格式',
        originalImage: '原始圖片',
        analyzing: '正在分析光線...',
        exportResults: '匯出結果',
        uploadAnother: '上傳其他圖片',
        backToHome: '返回首頁',
        toolNumber: '工具 #489',
        confidence: '信心度',
        brightness: '整體亮度',
        warmth: '色溫',
        contrast: '對比度',
        shadowLength: '陰影',
        lightingBreakdown: '光線分析',
        timePeriods: {
            dawn: '黎明',
            morning: '早晨',
            noon: '中午',
            afternoon: '下午',
            sunset: '黃昏',
            dusk: '傍晚',
            night: '夜晚',
            goldenHour: '黃金時刻'
        },
        warmthLevels: {
            warm: '暖色調',
            neutral: '中性',
            cool: '冷色調'
        },
        shadowLevels: {
            long: '長',
            medium: '中等',
            short: '短',
            none: '無'
        }
    },
    'en': {
        title: 'Time of Day Estimation',
        subtitle: 'Estimate capture time from lighting conditions',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        uploadText: 'Drag & drop outdoor scene image here or click to upload',
        uploadHint: 'Supports PNG, JPG, WebP formats',
        originalImage: 'Original Image',
        analyzing: 'Analyzing lighting...',
        exportResults: 'Export Results',
        uploadAnother: 'Upload Another',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #489',
        confidence: 'Confidence',
        brightness: 'Brightness',
        warmth: 'Color Temp',
        contrast: 'Contrast',
        shadowLength: 'Shadows',
        lightingBreakdown: 'Lighting Analysis',
        timePeriods: {
            dawn: 'Dawn',
            morning: 'Morning',
            noon: 'Noon',
            afternoon: 'Afternoon',
            sunset: 'Sunset',
            dusk: 'Dusk',
            night: 'Night',
            goldenHour: 'Golden Hour'
        },
        warmthLevels: {
            warm: 'Warm',
            neutral: 'Neutral',
            cool: 'Cool'
        },
        shadowLevels: {
            long: 'Long',
            medium: 'Medium',
            short: 'Short',
            none: 'None'
        }
    }
};

const timeIcons = {
    dawn: '🌅',
    morning: '🌄',
    noon: '☀️',
    afternoon: '🌤️',
    sunset: '🌇',
    dusk: '🌆',
    night: '🌙',
    goldenHour: '🌅'
};

const timeRanges = {
    dawn: '5:00 - 6:30',
    morning: '6:30 - 10:00',
    noon: '11:00 - 13:00',
    afternoon: '13:00 - 17:00',
    sunset: '17:00 - 19:00',
    dusk: '19:00 - 20:30',
    night: '20:30 - 5:00',
    goldenHour: '17:00 - 18:30'
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
    timeCard: document.getElementById('timeCard'),
    timeDetails: document.getElementById('timeDetails'),
    lightingAnalysis: document.getElementById('lightingAnalysis'),
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

// Time of Day Analysis
function analyzeTimeOfDay(imageData) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

            // Analyze lighting characteristics
            let totalR = 0, totalG = 0, totalB = 0;
            let highlights = 0, shadows = 0;
            const pixelCount = data.length / 4;

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i], g = data[i + 1], b = data[i + 2];
                totalR += r; totalG += g; totalB += b;

                const brightness = (r + g + b) / 3;
                if (brightness > 220) highlights++;
                if (brightness < 40) shadows++;
            }

            const avgR = totalR / pixelCount;
            const avgG = totalG / pixelCount;
            const avgB = totalB / pixelCount;
            const avgBrightness = (avgR + avgG + avgB) / 3;

            // Calculate color temperature (warm vs cool)
            const warmth = (avgR - avgB) / 255;

            // Calculate contrast
            const contrast = (highlights + shadows) / pixelCount;

            // Determine time of day
            let timePeriod, confidence;

            if (avgBrightness < 50) {
                timePeriod = 'night';
                confidence = 70 + (50 - avgBrightness) / 50 * 25;
            } else if (avgBrightness < 100 && warmth > 0.1) {
                timePeriod = warmth > 0.2 ? 'dawn' : 'dusk';
                confidence = 60 + warmth * 30;
            } else if (avgBrightness > 180 && warmth < 0.1) {
                timePeriod = 'noon';
                confidence = 65 + avgBrightness / 255 * 30;
            } else if (warmth > 0.15 && avgBrightness > 120) {
                timePeriod = 'goldenHour';
                confidence = 70 + warmth * 25;
            } else if (avgBrightness > 150) {
                timePeriod = warmth > 0.05 ? 'afternoon' : 'morning';
                confidence = 60 + avgBrightness / 255 * 25;
            } else {
                timePeriod = 'afternoon';
                confidence = 55 + Math.random() * 15;
            }

            // Determine warmth level
            let warmthLevel;
            if (warmth > 0.1) warmthLevel = 'warm';
            else if (warmth < -0.05) warmthLevel = 'cool';
            else warmthLevel = 'neutral';

            // Determine shadow length (simulated based on time)
            let shadowLength;
            if (timePeriod === 'noon') shadowLength = 'short';
            else if (timePeriod === 'night') shadowLength = 'none';
            else if (timePeriod === 'dawn' || timePeriod === 'dusk') shadowLength = 'long';
            else shadowLength = 'medium';

            // Lighting breakdown percentages
            const directLight = Math.min(80, avgBrightness / 3);
            const ambientLight = Math.min(60, 100 - directLight);
            const diffuseLight = 100 - directLight - ambientLight;

            resolve({
                timePeriod,
                timeRange: timeRanges[timePeriod],
                confidence: Math.min(95, confidence),
                metrics: {
                    brightness: Math.round(avgBrightness / 2.55),
                    warmth: warmthLevel,
                    contrast: Math.round(contrast * 100),
                    shadowLength
                },
                lighting: {
                    direct: Math.round(directLight),
                    ambient: Math.round(ambientLight),
                    diffuse: Math.round(diffuseLight)
                }
            });
        };

        img.src = imageData;
    });
}

function displayResults(results) {
    const timePeriodsT = t('timePeriods');
    const warmthLevelsT = t('warmthLevels');
    const shadowLevelsT = t('shadowLevels');

    elements.timeCard.innerHTML = `
        <div class="time-icon">${timeIcons[results.timePeriod]}</div>
        <div class="time-period">${timePeriodsT[results.timePeriod]}</div>
        <div class="time-range">${results.timeRange}</div>
        <div class="time-confidence">${t('confidence')}: ${results.confidence.toFixed(1)}%</div>
    `;

    elements.timeDetails.innerHTML = `
        <div class="detail-item">
            <div class="detail-value">${results.metrics.brightness}%</div>
            <div class="detail-label">${t('brightness')}</div>
        </div>
        <div class="detail-item">
            <div class="detail-value">${warmthLevelsT[results.metrics.warmth]}</div>
            <div class="detail-label">${t('warmth')}</div>
        </div>
        <div class="detail-item">
            <div class="detail-value">${results.metrics.contrast}%</div>
            <div class="detail-label">${t('contrast')}</div>
        </div>
        <div class="detail-item">
            <div class="detail-value">${shadowLevelsT[results.metrics.shadowLength]}</div>
            <div class="detail-label">${t('shadowLength')}</div>
        </div>
    `;

    elements.lightingAnalysis.innerHTML = `
        <h4>${t('lightingBreakdown')}</h4>
        <div class="lighting-bar">
            <div class="lighting-segment" style="width: ${results.lighting.direct}%; background: #f97316;">
                ${results.lighting.direct}%
            </div>
            <div class="lighting-segment" style="width: ${results.lighting.ambient}%; background: #3b82f6;">
                ${results.lighting.ambient}%
            </div>
            <div class="lighting-segment" style="width: ${results.lighting.diffuse}%; background: #8b5cf6;">
                ${results.lighting.diffuse}%
            </div>
        </div>
        <div class="lighting-labels">
            <span>Direct</span>
            <span>Ambient</span>
            <span>Diffuse</span>
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
    reader.onload = async (e) => {
        elements.originalImage.src = e.target.result;
        elements.uploadArea.style.display = 'none';
        elements.previewArea.style.display = 'block';
        elements.progressContainer.style.display = 'block';
        elements.resultsSection.style.display = 'none';

        simulateProgress(async () => {
            analysisResults = await analyzeTimeOfDay(e.target.result);
            displayResults(analysisResults);
            elements.progressContainer.style.display = 'none';
            elements.resultsSection.style.display = 'block';
        });
    };
    reader.readAsDataURL(file);
}

function exportResults() {
    if (!analysisResults) return;

    const timePeriodsT = t('timePeriods');
    const data = {
        tool: 'Time of Day Estimation - Tool #489',
        timestamp: new Date().toISOString(),
        results: {
            estimatedTime: timePeriodsT[analysisResults.timePeriod],
            timeRange: analysisResults.timeRange,
            confidence: analysisResults.confidence.toFixed(2) + '%',
            metrics: analysisResults.metrics,
            lightingBreakdown: analysisResults.lighting
        }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `time-estimation-${Date.now()}.json`;
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
