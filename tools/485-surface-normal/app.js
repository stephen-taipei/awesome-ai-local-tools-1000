/**
 * Surface Normal Estimation - Tool #485
 * Estimate surface normals from images
 */

// Internationalization
const translations = {
    'zh-TW': {
        title: '表面法線估計',
        subtitle: '從圖片估計表面法線方向',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        uploadText: '拖放圖片到此處或點擊上傳',
        uploadHint: '支援 PNG、JPG、WebP 格式',
        originalImage: '原始圖片',
        normalMap: '法線圖',
        analyzing: '正在估計表面法線...',
        colorLegend: '顏色說明',
        rightFacing: '朝右 (+X)',
        upFacing: '朝上 (+Y)',
        frontFacing: '朝前 (+Z)',
        analysisResults: '分析結果',
        downloadNormalMap: '下載法線圖',
        uploadAnother: '上傳其他圖片',
        backToHome: '返回首頁',
        toolNumber: '工具 #485',
        dominantDirection: '主要方向',
        surfaceComplexity: '表面複雜度',
        flatSurfaces: '平面區域',
        curvedSurfaces: '曲面區域'
    },
    'en': {
        title: 'Surface Normal Estimation',
        subtitle: 'Estimate surface normals from images',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        uploadText: 'Drag & drop image here or click to upload',
        uploadHint: 'Supports PNG, JPG, WebP formats',
        originalImage: 'Original Image',
        normalMap: 'Normal Map',
        analyzing: 'Estimating surface normals...',
        colorLegend: 'Color Legend',
        rightFacing: 'Right (+X)',
        upFacing: 'Up (+Y)',
        frontFacing: 'Front (+Z)',
        analysisResults: 'Analysis Results',
        downloadNormalMap: 'Download Normal Map',
        uploadAnother: 'Upload Another',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #485',
        dominantDirection: 'Dominant Direction',
        surfaceComplexity: 'Surface Complexity',
        flatSurfaces: 'Flat Surfaces',
        curvedSurfaces: 'Curved Surfaces'
    }
};

let currentLang = 'zh-TW';
let analysisResults = null;

// DOM Elements
const elements = {
    uploadArea: document.getElementById('uploadArea'),
    fileInput: document.getElementById('fileInput'),
    previewArea: document.getElementById('previewArea'),
    originalImage: document.getElementById('originalImage'),
    normalCanvas: document.getElementById('normalCanvas'),
    progressContainer: document.getElementById('progressContainer'),
    progressFill: document.getElementById('progressFill'),
    progressPercent: document.getElementById('progressPercent'),
    legend: document.getElementById('legend'),
    resultsSection: document.getElementById('resultsSection'),
    normalStats: document.getElementById('normalStats'),
    downloadBtn: document.getElementById('downloadBtn'),
    resetBtn: document.getElementById('resetBtn')
};

const ctx = elements.normalCanvas.getContext('2d');

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

// Surface Normal Estimation
function estimateSurfaceNormals(imageData, width, height) {
    const data = imageData.data;

    // Convert to grayscale
    const gray = new Float32Array(width * height);
    for (let i = 0; i < width * height; i++) {
        const idx = i * 4;
        gray[i] = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
    }

    // Estimate normals using gradients
    const normals = new Float32Array(width * height * 3);
    let flatCount = 0;
    let curvedCount = 0;
    let totalX = 0, totalY = 0, totalZ = 0;

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = y * width + x;

            // Calculate gradients using Sobel-like operator
            const dzdx = (
                gray[idx + 1] - gray[idx - 1] +
                gray[idx + width + 1] - gray[idx + width - 1] +
                gray[idx - width + 1] - gray[idx - width - 1]
            ) / 6;

            const dzdy = (
                gray[idx + width] - gray[idx - width] +
                gray[idx + width + 1] - gray[idx - width + 1] +
                gray[idx + width - 1] - gray[idx - width - 1]
            ) / 6;

            // Calculate normal vector
            const scale = 2.0;
            let nx = -dzdx * scale;
            let ny = -dzdy * scale;
            let nz = 1.0;

            // Normalize
            const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
            nx /= len;
            ny /= len;
            nz /= len;

            normals[idx * 3] = nx;
            normals[idx * 3 + 1] = ny;
            normals[idx * 3 + 2] = nz;

            totalX += Math.abs(nx);
            totalY += Math.abs(ny);
            totalZ += nz;

            // Classify surface
            if (nz > 0.95) {
                flatCount++;
            } else {
                curvedCount++;
            }
        }
    }

    const pixelCount = (width - 2) * (height - 2);
    const avgX = totalX / pixelCount;
    const avgY = totalY / pixelCount;
    const avgZ = totalZ / pixelCount;

    return {
        normals,
        stats: {
            flatRatio: flatCount / pixelCount,
            curvedRatio: curvedCount / pixelCount,
            avgX,
            avgY,
            avgZ,
            complexity: 1 - (flatCount / pixelCount)
        }
    };
}

function renderNormalMap(normals, width, height) {
    const imageData = ctx.createImageData(width, height);

    for (let i = 0; i < width * height; i++) {
        const nx = normals[i * 3] || 0;
        const ny = normals[i * 3 + 1] || 0;
        const nz = normals[i * 3 + 2] || 1;

        // Convert normal to RGB (standard normal map encoding)
        // nx: -1 to 1 -> 0 to 255 (R)
        // ny: -1 to 1 -> 0 to 255 (G)
        // nz: 0 to 1 -> 128 to 255 (B)
        const r = Math.round((nx * 0.5 + 0.5) * 255);
        const g = Math.round((ny * 0.5 + 0.5) * 255);
        const b = Math.round((nz * 0.5 + 0.5) * 255);

        const idx = i * 4;
        imageData.data[idx] = r;
        imageData.data[idx + 1] = g;
        imageData.data[idx + 2] = b;
        imageData.data[idx + 3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);
}

function displayStats(stats) {
    const directions = [
        { label: 'X', value: stats.avgX },
        { label: 'Y', value: stats.avgY },
        { label: 'Z', value: stats.avgZ }
    ];
    const dominant = directions.sort((a, b) => b.value - a.value)[0];

    elements.normalStats.innerHTML = `
        <div class="stat-item">
            <div class="stat-value">${dominant.label}</div>
            <div class="stat-label">${t('dominantDirection')}</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${(stats.complexity * 100).toFixed(1)}%</div>
            <div class="stat-label">${t('surfaceComplexity')}</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${(stats.flatRatio * 100).toFixed(1)}%</div>
            <div class="stat-label">${t('flatSurfaces')}</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${(stats.curvedRatio * 100).toFixed(1)}%</div>
            <div class="stat-label">${t('curvedSurfaces')}</div>
        </div>
    `;
}

// Progress Simulation
function simulateProgress(callback) {
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 12 + 3;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(callback, 200);
        }
        elements.progressFill.style.width = `${progress}%`;
        elements.progressPercent.textContent = `${Math.round(progress)}%`;
    }, 100);
}

// File Handling
function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            elements.originalImage.src = e.target.result;
            elements.uploadArea.style.display = 'none';
            elements.previewArea.style.display = 'block';
            elements.progressContainer.style.display = 'block';
            elements.legend.style.display = 'none';
            elements.resultsSection.style.display = 'none';

            // Set canvas size
            const maxSize = 500;
            let w = img.width, h = img.height;
            if (w > maxSize || h > maxSize) {
                const scale = Math.min(maxSize / w, maxSize / h);
                w = Math.floor(w * scale);
                h = Math.floor(h * scale);
            }
            elements.normalCanvas.width = w;
            elements.normalCanvas.height = h;

            // Get image data
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = w;
            tempCanvas.height = h;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(img, 0, 0, w, h);
            const imageData = tempCtx.getImageData(0, 0, w, h);

            simulateProgress(() => {
                analysisResults = estimateSurfaceNormals(imageData, w, h);
                renderNormalMap(analysisResults.normals, w, h);
                displayStats(analysisResults.stats);
                elements.progressContainer.style.display = 'none';
                elements.legend.style.display = 'block';
                elements.resultsSection.style.display = 'block';
            });
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function downloadNormalMap() {
    const link = document.createElement('a');
    link.download = `normal-map-${Date.now()}.png`;
    link.href = elements.normalCanvas.toDataURL('image/png');
    link.click();
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

    elements.downloadBtn.addEventListener('click', downloadNormalMap);
    elements.resetBtn.addEventListener('click', resetUI);
}

// Initialize
function init() {
    const browserLang = navigator.language;
    setLanguage(browserLang.startsWith('zh') ? 'zh-TW' : 'en');
    initEventListeners();
}

init();
