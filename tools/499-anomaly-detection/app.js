/**
 * Anomaly Detection - Tool #499
 * Detect anomalies in images
 */

// Translations
const translations = {
    'zh-TW': {
        title: '異常偵測',
        subtitle: 'AI 偵測圖片中的異常區域與不規則性',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        uploadText: '拖放圖片到此處或點擊上傳',
        uploadHint: '支援 PNG、JPG、WebP 格式',
        analyzing: '分析中...',
        original: '原圖',
        anomalyMap: '異常熱力圖',
        anomalyScore: '異常分數',
        regionsDetected: '偵測區域',
        coverage: '異常覆蓋率',
        detectedAnomalies: '偵測到的異常',
        normal: '正常',
        mildAnomaly: '輕微異常',
        severeAnomaly: '嚴重異常',
        downloadMap: '下載分析圖',
        uploadAnother: '上傳其他圖片',
        backToHome: '返回首頁',
        toolNumber: '工具 #499',
        statusNormal: '未偵測到明顯異常',
        statusWarning: '偵測到輕微異常',
        statusAlert: '偵測到顯著異常',
        subtitleNormal: '圖片整體正常，無需關注',
        subtitleWarning: '建議檢查標記區域',
        subtitleAlert: '請仔細檢查紅色標記區域'
    },
    'en': {
        title: 'Anomaly Detection',
        subtitle: 'AI detects anomalous regions and irregularities in images',
        privacyBadge: '100% Local Processing · Zero Upload',
        uploadText: 'Drag & drop image here or click to upload',
        uploadHint: 'Supports PNG, JPG, WebP formats',
        analyzing: 'Analyzing...',
        original: 'Original',
        anomalyMap: 'Anomaly Heatmap',
        anomalyScore: 'Anomaly Score',
        regionsDetected: 'Regions Detected',
        coverage: 'Coverage',
        detectedAnomalies: 'Detected Anomalies',
        normal: 'Normal',
        mildAnomaly: 'Mild Anomaly',
        severeAnomaly: 'Severe Anomaly',
        downloadMap: 'Download Analysis',
        uploadAnother: 'Upload Another',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #499',
        statusNormal: 'No significant anomalies detected',
        statusWarning: 'Mild anomalies detected',
        statusAlert: 'Significant anomalies detected',
        subtitleNormal: 'Image appears normal, no concerns',
        subtitleWarning: 'Recommend checking highlighted regions',
        subtitleAlert: 'Please carefully review red highlighted areas'
    }
};

const anomalyTypes = {
    texture: { zh: '紋理異常', en: 'Texture Anomaly' },
    color: { zh: '色彩異常', en: 'Color Anomaly' },
    pattern: { zh: '圖案異常', en: 'Pattern Anomaly' },
    edge: { zh: '邊緣異常', en: 'Edge Anomaly' },
    artifact: { zh: '偽影', en: 'Artifact' }
};

let currentLang = 'zh-TW';
let analysisResult = null;

// DOM Elements
const elements = {
    uploadArea: document.getElementById('uploadArea'),
    fileInput: document.getElementById('fileInput'),
    previewArea: document.getElementById('previewArea'),
    originalCanvas: document.getElementById('originalCanvas'),
    anomalyCanvas: document.getElementById('anomalyCanvas'),
    progressContainer: document.getElementById('progressContainer'),
    progressFill: document.getElementById('progressFill'),
    resultsSection: document.getElementById('resultsSection'),
    statusCard: document.getElementById('statusCard'),
    statusIcon: document.getElementById('statusIcon'),
    statusTitle: document.getElementById('statusTitle'),
    statusSubtitle: document.getElementById('statusSubtitle'),
    anomalyScore: document.getElementById('anomalyScore'),
    regionsCount: document.getElementById('regionsCount'),
    coverage: document.getElementById('coverage'),
    anomaliesList: document.getElementById('anomaliesList'),
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

    if (analysisResult) {
        updateResults(analysisResult);
    }
}

function t(key) {
    return translations[currentLang][key] || key;
}

// Detect anomalies
function detectAnomalies(img) {
    const originalCtx = elements.originalCanvas.getContext('2d');
    const anomalyCtx = elements.anomalyCanvas.getContext('2d');

    const maxSize = 400;
    let w = img.naturalWidth || img.width;
    let h = img.naturalHeight || img.height;

    if (w > maxSize || h > maxSize) {
        const scale = Math.min(maxSize / w, maxSize / h);
        w = Math.floor(w * scale);
        h = Math.floor(h * scale);
    }

    elements.originalCanvas.width = w;
    elements.originalCanvas.height = h;
    elements.anomalyCanvas.width = w;
    elements.anomalyCanvas.height = h;

    originalCtx.drawImage(img, 0, 0, w, h);
    const imageData = originalCtx.getImageData(0, 0, w, h);
    const data = imageData.data;

    // Calculate local statistics
    const blockSize = 16;
    const anomalyMap = new Float32Array(w * h);
    let totalAnomalyPixels = 0;
    const detectedAnomalies = [];

    // Calculate global statistics
    let globalMean = 0, globalStd = 0;
    for (let i = 0; i < data.length; i += 4) {
        globalMean += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }
    globalMean /= (data.length / 4);

    for (let i = 0; i < data.length; i += 4) {
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        globalStd += Math.pow(brightness - globalMean, 2);
    }
    globalStd = Math.sqrt(globalStd / (data.length / 4));

    // Analyze blocks
    for (let by = 0; by < h; by += blockSize) {
        for (let bx = 0; bx < w; bx += blockSize) {
            let localMean = 0, localStd = 0, count = 0;

            // Calculate local mean
            for (let y = by; y < Math.min(by + blockSize, h); y++) {
                for (let x = bx; x < Math.min(bx + blockSize, w); x++) {
                    const idx = (y * w + x) * 4;
                    localMean += (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                    count++;
                }
            }
            localMean /= count;

            // Calculate local std
            for (let y = by; y < Math.min(by + blockSize, h); y++) {
                for (let x = bx; x < Math.min(bx + blockSize, w); x++) {
                    const idx = (y * w + x) * 4;
                    const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                    localStd += Math.pow(brightness - localMean, 2);
                }
            }
            localStd = Math.sqrt(localStd / count);

            // Calculate anomaly score for block
            const meanDiff = Math.abs(localMean - globalMean) / (globalMean + 1);
            const stdDiff = Math.abs(localStd - globalStd) / (globalStd + 1);
            const blockAnomaly = Math.min(1, (meanDiff + stdDiff) * 1.5);

            // Apply to pixels
            for (let y = by; y < Math.min(by + blockSize, h); y++) {
                for (let x = bx; x < Math.min(bx + blockSize, w); x++) {
                    anomalyMap[y * w + x] = blockAnomaly;
                    if (blockAnomaly > 0.3) totalAnomalyPixels++;
                }
            }

            // Record significant anomalies
            if (blockAnomaly > 0.5) {
                const type = stdDiff > meanDiff ? 'texture' : 'color';
                detectedAnomalies.push({
                    type,
                    x: bx,
                    y: by,
                    severity: blockAnomaly > 0.7 ? 'high' : 'medium'
                });
            }
        }
    }

    // Create anomaly heatmap
    const heatmapData = anomalyCtx.createImageData(w, h);
    for (let i = 0; i < anomalyMap.length; i++) {
        const val = anomalyMap[i];
        let r, g, b, a;

        if (val < 0.2) {
            r = 34; g = 197; b = 94; a = 50; // Green
        } else if (val < 0.5) {
            r = 245; g = 158; b = 11; a = 100; // Yellow
        } else {
            r = 239; g = 68; b = 68; a = 150; // Red
        }

        const idx = i * 4;
        heatmapData.data[idx] = r;
        heatmapData.data[idx + 1] = g;
        heatmapData.data[idx + 2] = b;
        heatmapData.data[idx + 3] = a;
    }

    anomalyCtx.drawImage(img, 0, 0, w, h);
    anomalyCtx.globalAlpha = 0.6;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = w;
    tempCanvas.height = h;
    tempCanvas.getContext('2d').putImageData(heatmapData, 0, 0);
    anomalyCtx.drawImage(tempCanvas, 0, 0);
    anomalyCtx.globalAlpha = 1;

    // Calculate overall score
    const coverage = (totalAnomalyPixels / (w * h)) * 100;
    const avgAnomaly = anomalyMap.reduce((a, b) => a + b, 0) / anomalyMap.length;
    const anomalyScore = Math.round(avgAnomaly * 100);

    // Deduplicate and limit anomalies
    const uniqueAnomalies = [];
    const seen = new Set();
    for (const a of detectedAnomalies) {
        const key = `${Math.floor(a.x / 32)}-${Math.floor(a.y / 32)}`;
        if (!seen.has(key)) {
            seen.add(key);
            uniqueAnomalies.push(a);
        }
        if (uniqueAnomalies.length >= 5) break;
    }

    return {
        anomalyScore,
        coverage: Math.round(coverage),
        regionsCount: uniqueAnomalies.length,
        anomalies: uniqueAnomalies
    };
}

// Update results
function updateResults(result) {
    const lang = currentLang === 'zh-TW' ? 'zh' : 'en';

    elements.anomalyScore.textContent = result.anomalyScore;
    elements.regionsCount.textContent = result.regionsCount;
    elements.coverage.textContent = `${result.coverage}%`;

    // Status
    elements.statusCard.className = 'status-card';
    if (result.anomalyScore < 20) {
        elements.statusCard.classList.add('normal');
        elements.statusIcon.textContent = '✓';
        elements.statusTitle.textContent = t('statusNormal');
        elements.statusSubtitle.textContent = t('subtitleNormal');
    } else if (result.anomalyScore < 50) {
        elements.statusCard.classList.add('warning');
        elements.statusIcon.textContent = '⚠';
        elements.statusTitle.textContent = t('statusWarning');
        elements.statusSubtitle.textContent = t('subtitleWarning');
    } else {
        elements.statusCard.classList.add('alert');
        elements.statusIcon.textContent = '⚠';
        elements.statusTitle.textContent = t('statusAlert');
        elements.statusSubtitle.textContent = t('subtitleAlert');
    }

    // Anomalies list
    if (result.anomalies.length > 0) {
        elements.anomaliesList.innerHTML = result.anomalies.map(a => `
            <div class="anomaly-item">
                <span class="anomaly-icon">${a.severity === 'high' ? '🔴' : '🟡'}</span>
                <div class="anomaly-info">
                    <div class="anomaly-type">${anomalyTypes[a.type][lang]}</div>
                    <div class="anomaly-desc">位置: (${a.x}, ${a.y})</div>
                </div>
                <span class="anomaly-severity">${a.severity === 'high' ? (lang === 'zh' ? '嚴重' : 'Severe') : (lang === 'zh' ? '中等' : 'Medium')}</span>
            </div>
        `).join('');
    } else {
        elements.anomaliesList.innerHTML = `<p style="color: var(--text-secondary); text-align: center; padding: 1rem;">${lang === 'zh' ? '未發現明顯異常區域' : 'No significant anomaly regions found'}</p>`;
    }
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

    await new Promise(resolve => setTimeout(resolve, 2000));

    clearInterval(interval);
    elements.progressFill.style.width = '100%';

    await new Promise(resolve => setTimeout(resolve, 300));

    analysisResult = detectAnomalies(img);
    updateResults(analysisResult);

    elements.progressContainer.style.display = 'none';
    elements.resultsSection.style.display = 'block';
}

// Download
function downloadAnalysis() {
    const link = document.createElement('a');
    link.download = `anomaly-detection-${Date.now()}.png`;
    link.href = elements.anomalyCanvas.toDataURL('image/png');
    link.click();
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

    elements.downloadBtn.addEventListener('click', downloadAnalysis);
    elements.resetBtn.addEventListener('click', reset);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setLanguage('zh-TW');
    initEventListeners();
});
