/**
 * Blur Detection - Tool #494
 * Detect blur regions in images
 */

// Translations
const translations = {
    'zh-TW': {
        title: '模糊偵測',
        subtitle: 'AI 偵測並標示圖片中的模糊區域',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        uploadText: '拖放圖片到此處或點擊上傳',
        uploadHint: '支援 PNG、JPG、WebP 格式',
        analyzing: '分析中...',
        original: '原圖',
        blurMap: '模糊熱力圖',
        sharpness: '清晰度評分',
        blurArea: '模糊區域',
        blurType: '模糊類型',
        legend: '圖例',
        sharp: '清晰',
        slightBlur: '輕微模糊',
        heavyBlur: '嚴重模糊',
        recommendations: '建議',
        downloadMap: '下載熱力圖',
        uploadAnother: '上傳其他圖片',
        backToHome: '返回首頁',
        toolNumber: '工具 #494',
        statusSharp: '圖片整體清晰度良好',
        statusSlight: '圖片存在輕微模糊區域',
        statusHeavy: '圖片存在較多模糊區域',
        typeMotion: '動態模糊',
        typeFocus: '對焦模糊',
        typeGaussian: '高斯模糊',
        typeMixed: '混合模糊'
    },
    'en': {
        title: 'Blur Detection',
        subtitle: 'AI detects and highlights blur regions in images',
        privacyBadge: '100% Local Processing · Zero Upload',
        uploadText: 'Drag & drop image here or click to upload',
        uploadHint: 'Supports PNG, JPG, WebP formats',
        analyzing: 'Analyzing...',
        original: 'Original',
        blurMap: 'Blur Heatmap',
        sharpness: 'Sharpness Score',
        blurArea: 'Blur Area',
        blurType: 'Blur Type',
        legend: 'Legend',
        sharp: 'Sharp',
        slightBlur: 'Slight Blur',
        heavyBlur: 'Heavy Blur',
        recommendations: 'Recommendations',
        downloadMap: 'Download Heatmap',
        uploadAnother: 'Upload Another',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #494',
        statusSharp: 'Image overall sharpness is good',
        statusSlight: 'Image has slight blur regions',
        statusHeavy: 'Image has significant blur regions',
        typeMotion: 'Motion Blur',
        typeFocus: 'Focus Blur',
        typeGaussian: 'Gaussian Blur',
        typeMixed: 'Mixed Blur'
    }
};

const recommendations = {
    motion: {
        zh: ['使用更快的快門速度', '使用三腳架或穩定器', '提高 ISO 以換取更快快門'],
        en: ['Use a faster shutter speed', 'Use a tripod or stabilizer', 'Increase ISO for faster shutter']
    },
    focus: {
        zh: ['確保對焦正確', '使用更小的光圈以增加景深', '檢查相機對焦設定'],
        en: ['Ensure correct focus', 'Use smaller aperture for more depth of field', 'Check camera focus settings']
    },
    general: {
        zh: ['使用銳化後製提升清晰度', '重新拍攝以獲得更好效果'],
        en: ['Apply sharpening in post-processing', 'Reshoot for better results']
    },
    good: {
        zh: ['圖片品質良好，無需調整'],
        en: ['Image quality is good, no adjustments needed']
    }
};

let currentLang = 'zh-TW';
let analysisResult = null;

// DOM Elements
const elements = {
    uploadArea: document.getElementById('uploadArea'),
    fileInput: document.getElementById('fileInput'),
    previewArea: document.getElementById('previewArea'),
    originalCanvas: document.getElementById('originalCanvas'),
    blurCanvas: document.getElementById('blurCanvas'),
    progressContainer: document.getElementById('progressContainer'),
    progressFill: document.getElementById('progressFill'),
    progressText: document.getElementById('progressText'),
    resultsSection: document.getElementById('resultsSection'),
    statusCard: document.getElementById('statusCard'),
    statusIcon: document.getElementById('statusIcon'),
    statusText: document.getElementById('statusText'),
    sharpnessScore: document.getElementById('sharpnessScore'),
    blurPercent: document.getElementById('blurPercent'),
    blurType: document.getElementById('blurType'),
    recommendationsList: document.getElementById('recommendationsList'),
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

// Analyze blur in image
function analyzeBlur(img) {
    const originalCtx = elements.originalCanvas.getContext('2d');
    const blurCtx = elements.blurCanvas.getContext('2d');

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
    elements.blurCanvas.width = w;
    elements.blurCanvas.height = h;

    originalCtx.drawImage(img, 0, 0, w, h);
    const imageData = originalCtx.getImageData(0, 0, w, h);
    const data = imageData.data;

    // Convert to grayscale
    const gray = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) {
        const idx = i * 4;
        gray[i] = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
    }

    // Calculate Laplacian variance for each block
    const blockSize = 16;
    const blurMap = new Float32Array(w * h);
    let totalVariance = 0;
    let blurPixels = 0;
    let sharpPixels = 0;

    for (let by = 0; by < h; by += blockSize) {
        for (let bx = 0; bx < w; bx += blockSize) {
            let variance = 0;
            let count = 0;

            for (let y = by + 1; y < Math.min(by + blockSize - 1, h - 1); y++) {
                for (let x = bx + 1; x < Math.min(bx + blockSize - 1, w - 1); x++) {
                    const idx = y * w + x;
                    const laplacian = -4 * gray[idx] +
                        gray[idx - 1] + gray[idx + 1] +
                        gray[idx - w] + gray[idx + w];
                    variance += laplacian * laplacian;
                    count++;
                }
            }

            variance = count > 0 ? Math.sqrt(variance / count) : 0;
            totalVariance += variance;

            // Assign blur level to block
            for (let y = by; y < Math.min(by + blockSize, h); y++) {
                for (let x = bx; x < Math.min(bx + blockSize, w); x++) {
                    blurMap[y * w + x] = variance;
                    if (variance < 15) blurPixels++;
                    else sharpPixels++;
                }
            }
        }
    }

    // Normalize blur map
    const maxVar = Math.max(...blurMap);
    for (let i = 0; i < blurMap.length; i++) {
        blurMap[i] = blurMap[i] / (maxVar || 1);
    }

    // Create heatmap
    const heatmapData = blurCtx.createImageData(w, h);
    for (let i = 0; i < blurMap.length; i++) {
        const val = blurMap[i];
        let r, g, b;

        if (val > 0.6) {
            // Sharp - green
            r = 34; g = 197; b = 94;
        } else if (val > 0.3) {
            // Slight blur - yellow/orange
            r = 245; g = 158; b = 11;
        } else {
            // Heavy blur - red
            r = 239; g = 68; b = 68;
        }

        const idx = i * 4;
        heatmapData.data[idx] = r;
        heatmapData.data[idx + 1] = g;
        heatmapData.data[idx + 2] = b;
        heatmapData.data[idx + 3] = 180; // Semi-transparent
    }

    blurCtx.putImageData(heatmapData, 0, 0);

    // Overlay on original
    blurCtx.globalAlpha = 0.4;
    blurCtx.drawImage(elements.originalCanvas, 0, 0);
    blurCtx.globalAlpha = 1;

    // Calculate results
    const avgVariance = totalVariance / ((w / blockSize) * (h / blockSize));
    const blurPercentage = (blurPixels / (blurPixels + sharpPixels)) * 100;
    const sharpnessScore = Math.min(100, Math.round(avgVariance * 3));

    // Determine blur type
    let blurType;
    if (blurPercentage < 20) {
        blurType = 'good';
    } else {
        // Analyze directionality for motion vs focus blur
        const horizontalGrad = analyzeDirection(gray, w, h, 'horizontal');
        const verticalGrad = analyzeDirection(gray, w, h, 'vertical');
        const ratio = Math.abs(horizontalGrad - verticalGrad) / Math.max(horizontalGrad, verticalGrad, 1);

        if (ratio > 0.3) {
            blurType = 'motion';
        } else if (blurPercentage > 50) {
            blurType = 'gaussian';
        } else {
            blurType = 'focus';
        }
    }

    return {
        sharpnessScore,
        blurPercentage: Math.round(blurPercentage),
        blurType
    };
}

function analyzeDirection(gray, w, h, direction) {
    let sum = 0;
    for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
            const idx = y * w + x;
            if (direction === 'horizontal') {
                sum += Math.abs(gray[idx + 1] - gray[idx - 1]);
            } else {
                sum += Math.abs(gray[idx + w] - gray[idx - w]);
            }
        }
    }
    return sum / ((w - 2) * (h - 2));
}

// Update results display
function updateResults(result) {
    const lang = currentLang === 'zh-TW' ? 'zh' : 'en';

    // Update metrics
    elements.sharpnessScore.textContent = result.sharpnessScore;
    elements.blurPercent.textContent = `${result.blurPercentage}%`;

    // Update blur type
    const typeKey = 'type' + result.blurType.charAt(0).toUpperCase() + result.blurType.slice(1);
    elements.blurType.textContent = t(typeKey) || result.blurType;

    // Update status
    elements.statusCard.className = 'status-card';
    if (result.blurPercentage < 20) {
        elements.statusCard.classList.add('sharp');
        elements.statusIcon.textContent = '✓';
        elements.statusText.textContent = t('statusSharp');
    } else if (result.blurPercentage < 50) {
        elements.statusCard.classList.add('slight');
        elements.statusIcon.textContent = '⚠';
        elements.statusText.textContent = t('statusSlight');
    } else {
        elements.statusCard.classList.add('heavy');
        elements.statusIcon.textContent = '✗';
        elements.statusText.textContent = t('statusHeavy');
    }

    // Update recommendations
    let recs;
    if (result.blurType === 'good') {
        recs = recommendations.good[lang];
    } else if (result.blurType === 'motion') {
        recs = [...recommendations.motion[lang], ...recommendations.general[lang]];
    } else {
        recs = [...recommendations.focus[lang], ...recommendations.general[lang]];
    }

    elements.recommendationsList.innerHTML = recs.map(r => `<li>${r}</li>`).join('');
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

    // Analyze and display
    analysisResult = analyzeBlur(img);
    updateResults(analysisResult);

    elements.progressContainer.style.display = 'none';
    elements.resultsSection.style.display = 'block';
}

// Download heatmap
function downloadHeatmap() {
    const link = document.createElement('a');
    link.download = `blur-heatmap-${Date.now()}.png`;
    link.href = elements.blurCanvas.toDataURL('image/png');
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

    elements.downloadBtn.addEventListener('click', downloadHeatmap);
    elements.resetBtn.addEventListener('click', reset);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setLanguage('zh-TW');
    initEventListeners();
});
