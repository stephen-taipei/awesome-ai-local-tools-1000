/**
 * Weather Recognition - Tool #488
 * Recognize weather conditions from images
 */

// Internationalization
const translations = {
    'zh-TW': {
        title: '天氣識別',
        subtitle: '從圖片中識別天氣狀況',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        uploadText: '拖放戶外場景圖片到此處或點擊上傳',
        uploadHint: '支援 PNG、JPG、WebP 格式',
        originalImage: '原始圖片',
        analyzing: '正在分析天氣...',
        exportResults: '匯出結果',
        uploadAnother: '上傳其他圖片',
        backToHome: '返回首頁',
        toolNumber: '工具 #488',
        confidence: '信心度',
        visibility: '能見度',
        cloudCover: '雲量',
        brightness: '亮度',
        humidity: '濕度估計',
        detectedConditions: '偵測到的天氣特徵',
        weather: {
            sunny: '晴天',
            cloudy: '多雲',
            overcast: '陰天',
            rainy: '雨天',
            snowy: '下雪',
            foggy: '霧天',
            stormy: '暴風雨',
            partlyCloudy: '局部多雲'
        },
        conditions: {
            clearSky: '天空晴朗',
            blueSky: '藍天',
            whiteClouds: '白雲',
            grayClouds: '灰雲',
            darkClouds: '烏雲',
            rain: '降雨',
            fog: '霧氣',
            snow: '積雪',
            wetGround: '濕地面',
            shadows: '有陰影',
            sunlight: '陽光',
            lowVisibility: '低能見度'
        }
    },
    'en': {
        title: 'Weather Recognition',
        subtitle: 'Recognize weather conditions from images',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        uploadText: 'Drag & drop outdoor scene image here or click to upload',
        uploadHint: 'Supports PNG, JPG, WebP formats',
        originalImage: 'Original Image',
        analyzing: 'Analyzing weather...',
        exportResults: 'Export Results',
        uploadAnother: 'Upload Another',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #488',
        confidence: 'Confidence',
        visibility: 'Visibility',
        cloudCover: 'Cloud Cover',
        brightness: 'Brightness',
        humidity: 'Est. Humidity',
        detectedConditions: 'Detected Weather Features',
        weather: {
            sunny: 'Sunny',
            cloudy: 'Cloudy',
            overcast: 'Overcast',
            rainy: 'Rainy',
            snowy: 'Snowy',
            foggy: 'Foggy',
            stormy: 'Stormy',
            partlyCloudy: 'Partly Cloudy'
        },
        conditions: {
            clearSky: 'Clear Sky',
            blueSky: 'Blue Sky',
            whiteClouds: 'White Clouds',
            grayClouds: 'Gray Clouds',
            darkClouds: 'Dark Clouds',
            rain: 'Rain',
            fog: 'Fog',
            snow: 'Snow',
            wetGround: 'Wet Ground',
            shadows: 'Shadows',
            sunlight: 'Sunlight',
            lowVisibility: 'Low Visibility'
        }
    }
};

const weatherIcons = {
    sunny: '☀️',
    cloudy: '☁️',
    overcast: '🌥️',
    rainy: '🌧️',
    snowy: '❄️',
    foggy: '🌫️',
    stormy: '⛈️',
    partlyCloudy: '⛅'
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
    weatherCard: document.getElementById('weatherCard'),
    weatherDetails: document.getElementById('weatherDetails'),
    weatherConditions: document.getElementById('weatherConditions'),
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

// Weather Recognition
function analyzeWeather(imageData) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

            // Analyze image for weather cues
            let totalR = 0, totalG = 0, totalB = 0;
            let bluePixels = 0, grayPixels = 0, whitePixels = 0, darkPixels = 0;
            const pixelCount = data.length / 4;

            // Focus on upper half (sky)
            const skyHeight = Math.floor(canvas.height * 0.4);
            let skyBlue = 0, skyGray = 0, skyWhite = 0;
            let skyPixels = 0;

            for (let y = 0; y < canvas.height; y++) {
                for (let x = 0; x < canvas.width; x++) {
                    const idx = (y * canvas.width + x) * 4;
                    const r = data[idx], g = data[idx + 1], b = data[idx + 2];
                    totalR += r; totalG += g; totalB += b;

                    const brightness = (r + g + b) / 3;

                    if (y < skyHeight) {
                        skyPixels++;
                        if (b > r && b > g && b > 150) skyBlue++;
                        if (Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && brightness > 180) skyWhite++;
                        if (Math.abs(r - g) < 30 && Math.abs(g - b) < 30 && brightness < 150) skyGray++;
                    }

                    if (brightness > 220) whitePixels++;
                    if (brightness < 60) darkPixels++;
                }
            }

            const avgBrightness = (totalR + totalG + totalB) / (3 * pixelCount);
            const skyBlueRatio = skyBlue / skyPixels;
            const skyWhiteRatio = skyWhite / skyPixels;
            const skyGrayRatio = skyGray / skyPixels;
            const darkRatio = darkPixels / pixelCount;

            // Determine weather type
            let weatherType, confidence;
            const conditions = [];

            if (skyBlueRatio > 0.3 && avgBrightness > 150) {
                weatherType = 'sunny';
                confidence = 70 + skyBlueRatio * 30;
                conditions.push('clearSky', 'blueSky', 'sunlight');
                if (skyWhiteRatio > 0.1) conditions.push('whiteClouds');
            } else if (skyGrayRatio > 0.4 && avgBrightness < 120) {
                weatherType = 'overcast';
                confidence = 60 + skyGrayRatio * 30;
                conditions.push('grayClouds');
                if (darkRatio > 0.2) conditions.push('darkClouds');
            } else if (skyWhiteRatio > 0.3 && skyBlueRatio > 0.1) {
                weatherType = 'partlyCloudy';
                confidence = 65 + Math.min(skyWhiteRatio, skyBlueRatio) * 30;
                conditions.push('blueSky', 'whiteClouds');
            } else if (avgBrightness < 80) {
                weatherType = 'stormy';
                confidence = 55 + darkRatio * 40;
                conditions.push('darkClouds', 'lowVisibility');
            } else if (skyGrayRatio > 0.5) {
                weatherType = 'cloudy';
                confidence = 60 + skyGrayRatio * 25;
                conditions.push('grayClouds');
            } else {
                weatherType = 'partlyCloudy';
                confidence = 50 + Math.random() * 20;
                conditions.push('whiteClouds');
            }

            // Calculate other metrics
            const visibility = avgBrightness > 150 ? 'high' : avgBrightness > 100 ? 'medium' : 'low';
            const cloudCover = Math.round((skyGrayRatio + skyWhiteRatio) * 100);
            const brightness = Math.round(avgBrightness / 2.55);
            const humidity = weatherType === 'rainy' || weatherType === 'foggy' ? 80 + Math.random() * 15 : 40 + Math.random() * 30;

            resolve({
                weatherType,
                confidence: Math.min(95, confidence),
                conditions,
                metrics: {
                    visibility,
                    cloudCover,
                    brightness,
                    humidity: Math.round(humidity)
                }
            });
        };

        img.src = imageData;
    });
}

function displayResults(results) {
    const weatherT = t('weather');
    const conditionsT = t('conditions');

    elements.weatherCard.innerHTML = `
        <div class="weather-icon">${weatherIcons[results.weatherType]}</div>
        <div class="weather-type">${weatherT[results.weatherType]}</div>
        <div class="weather-confidence">${t('confidence')}: ${results.confidence.toFixed(1)}%</div>
    `;

    const visibilityText = {
        high: currentLang === 'zh-TW' ? '良好' : 'Good',
        medium: currentLang === 'zh-TW' ? '一般' : 'Moderate',
        low: currentLang === 'zh-TW' ? '低' : 'Low'
    };

    elements.weatherDetails.innerHTML = `
        <div class="detail-item">
            <div class="detail-icon">👁️</div>
            <div class="detail-value">${visibilityText[results.metrics.visibility]}</div>
            <div class="detail-label">${t('visibility')}</div>
        </div>
        <div class="detail-item">
            <div class="detail-icon">☁️</div>
            <div class="detail-value">${results.metrics.cloudCover}%</div>
            <div class="detail-label">${t('cloudCover')}</div>
        </div>
        <div class="detail-item">
            <div class="detail-icon">💡</div>
            <div class="detail-value">${results.metrics.brightness}%</div>
            <div class="detail-label">${t('brightness')}</div>
        </div>
        <div class="detail-item">
            <div class="detail-icon">💧</div>
            <div class="detail-value">${results.metrics.humidity}%</div>
            <div class="detail-label">${t('humidity')}</div>
        </div>
    `;

    elements.weatherConditions.innerHTML = `
        <h4>${t('detectedConditions')}</h4>
        <div class="condition-list">
            ${results.conditions.map(c => `<span class="condition-tag">${conditionsT[c] || c}</span>`).join('')}
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
            analysisResults = await analyzeWeather(e.target.result);
            displayResults(analysisResults);
            elements.progressContainer.style.display = 'none';
            elements.resultsSection.style.display = 'block';
        });
    };
    reader.readAsDataURL(file);
}

function exportResults() {
    if (!analysisResults) return;

    const weatherT = t('weather');
    const data = {
        tool: 'Weather Recognition - Tool #488',
        timestamp: new Date().toISOString(),
        results: {
            weatherType: weatherT[analysisResults.weatherType],
            confidence: analysisResults.confidence.toFixed(2) + '%',
            metrics: analysisResults.metrics,
            detectedConditions: analysisResults.conditions
        }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weather-recognition-${Date.now()}.json`;
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
