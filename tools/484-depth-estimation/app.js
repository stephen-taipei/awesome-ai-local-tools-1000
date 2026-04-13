/**
 * Depth Estimation - Tool #484
 * Estimate depth map from single image
 */

// Internationalization
const translations = {
    'zh-TW': {
        title: '深度估計',
        subtitle: '從單張圖片生成深度圖',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        uploadText: '拖放圖片到此處或點擊上傳',
        uploadHint: '支援 PNG、JPG、WebP 格式',
        originalImage: '原始圖片',
        depthMap: '深度圖',
        analyzing: '正在估計深度...',
        depthAnalysis: '深度分析',
        colormap: '色彩映射',
        contrast: '對比度',
        invert: '反轉',
        downloadDepthMap: '下載深度圖',
        uploadAnother: '上傳其他圖片',
        backToHome: '返回首頁',
        toolNumber: '工具 #484',
        meanDepth: '平均深度',
        depthRange: '深度範圍',
        nearestPoint: '最近點',
        farthestPoint: '最遠點'
    },
    'en': {
        title: 'Depth Estimation',
        subtitle: 'Generate depth map from single image',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        uploadText: 'Drag & drop image here or click to upload',
        uploadHint: 'Supports PNG, JPG, WebP formats',
        originalImage: 'Original Image',
        depthMap: 'Depth Map',
        analyzing: 'Estimating depth...',
        depthAnalysis: 'Depth Analysis',
        colormap: 'Colormap',
        contrast: 'Contrast',
        invert: 'Invert',
        downloadDepthMap: 'Download Depth Map',
        uploadAnother: 'Upload Another',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #484',
        meanDepth: 'Mean Depth',
        depthRange: 'Depth Range',
        nearestPoint: 'Nearest Point',
        farthestPoint: 'Farthest Point'
    }
};

// Colormaps
const colormaps = {
    magma: [[0,0,4],[28,16,68],[79,18,123],[129,37,129],[181,54,122],[229,80,100],[251,135,97],[254,194,135],[252,253,191]],
    viridis: [[68,1,84],[72,40,120],[62,73,137],[49,104,142],[38,130,142],[31,158,137],[53,183,121],[109,205,89],[180,222,44],[253,231,37]],
    plasma: [[13,8,135],[75,3,161],[126,3,168],[168,34,150],[203,70,121],[229,107,93],[248,148,65],[253,195,40],[240,249,33]],
    inferno: [[0,0,4],[40,11,84],[101,21,110],[159,42,99],[212,72,66],[245,125,21],[250,193,39],[252,255,164]],
    grayscale: [[0,0,0],[128,128,128],[255,255,255]]
};

let currentLang = 'zh-TW';
let depthData = null;
let originalImageData = null;

// DOM Elements
const elements = {
    uploadArea: document.getElementById('uploadArea'),
    fileInput: document.getElementById('fileInput'),
    previewArea: document.getElementById('previewArea'),
    originalImage: document.getElementById('originalImage'),
    depthCanvas: document.getElementById('depthCanvas'),
    progressContainer: document.getElementById('progressContainer'),
    progressFill: document.getElementById('progressFill'),
    progressPercent: document.getElementById('progressPercent'),
    controls: document.getElementById('controls'),
    colormapSelect: document.getElementById('colormapSelect'),
    contrastSlider: document.getElementById('contrastSlider'),
    invertCheckbox: document.getElementById('invertCheckbox'),
    resultsSection: document.getElementById('resultsSection'),
    depthStats: document.getElementById('depthStats'),
    downloadBtn: document.getElementById('downloadBtn'),
    resetBtn: document.getElementById('resetBtn')
};

const ctx = elements.depthCanvas.getContext('2d');

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

// Depth Estimation
function estimateDepth(imageData, width, height) {
    const data = imageData.data;

    // Convert to grayscale
    const gray = new Float32Array(width * height);
    for (let i = 0; i < width * height; i++) {
        const idx = i * 4;
        gray[i] = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
    }

    // Calculate gradients (edge detection)
    const gradients = new Float32Array(width * height);
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = y * width + x;
            const gx = gray[idx + 1] - gray[idx - 1];
            const gy = gray[idx + width] - gray[idx - width];
            gradients[idx] = Math.sqrt(gx * gx + gy * gy);
        }
    }

    // Blur gradients
    const blurred = blur(gradients, width, height, 5);

    // Combine depth cues
    const depth = new Float32Array(width * height);
    let minDepth = Infinity, maxDepth = -Infinity;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;

            // Vertical position cue (higher = further)
            const verticalCue = y / height;

            // Edge density cue
            const edgeCue = blurred[idx] / 255;

            // Brightness cue
            const brightCue = gray[idx] / 255;

            // Texture frequency
            let texture = 0;
            if (x > 0 && y > 0 && x < width - 1 && y < height - 1) {
                texture = Math.abs(gray[idx] - gray[idx - 1]) +
                          Math.abs(gray[idx] - gray[idx + 1]) +
                          Math.abs(gray[idx] - gray[idx - width]) +
                          Math.abs(gray[idx] - gray[idx + width]);
                texture /= 1020;
            }

            // Combine cues
            depth[idx] = verticalCue * 0.35 + edgeCue * 0.2 + (1 - brightCue) * 0.25 + texture * 0.2;

            if (depth[idx] < minDepth) minDepth = depth[idx];
            if (depth[idx] > maxDepth) maxDepth = depth[idx];
        }
    }

    // Normalize
    const range = maxDepth - minDepth || 1;
    for (let i = 0; i < depth.length; i++) {
        depth[i] = (depth[i] - minDepth) / range;
    }

    // Refine with bilateral-like filter
    return refineDepth(depth, width, height);
}

function blur(data, w, h, radius) {
    const result = new Float32Array(data.length);
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            let sum = 0, count = 0;
            for (let ky = -radius; ky <= radius; ky++) {
                for (let kx = -radius; kx <= radius; kx++) {
                    const ny = y + ky, nx = x + kx;
                    if (ny >= 0 && ny < h && nx >= 0 && nx < w) {
                        sum += data[ny * w + nx];
                        count++;
                    }
                }
            }
            result[y * w + x] = sum / count;
        }
    }
    return result;
}

function refineDepth(depth, w, h) {
    const refined = new Float32Array(depth.length);
    const radius = 3;

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const idx = y * w + x;
            const centerVal = depth[idx];
            let sum = 0, weightSum = 0;

            for (let ky = -radius; ky <= radius; ky++) {
                for (let kx = -radius; kx <= radius; kx++) {
                    const ny = y + ky, nx = x + kx;
                    if (ny >= 0 && ny < h && nx >= 0 && nx < w) {
                        const nidx = ny * w + nx;
                        const dist = Math.sqrt(kx * kx + ky * ky);
                        const rangeDist = Math.abs(depth[nidx] - centerVal);
                        const weight = Math.exp(-dist / 4) * Math.exp(-rangeDist * 10);
                        sum += depth[nidx] * weight;
                        weightSum += weight;
                    }
                }
            }
            refined[idx] = weightSum > 0 ? sum / weightSum : centerVal;
        }
    }
    return refined;
}

function applyColormap() {
    if (!depthData) return;

    const w = elements.depthCanvas.width;
    const h = elements.depthCanvas.height;
    const imageData = ctx.createImageData(w, h);
    const colormap = colormaps[elements.colormapSelect.value];
    const contrast = parseFloat(elements.contrastSlider.value);
    const invert = elements.invertCheckbox.checked;

    for (let i = 0; i < depthData.length; i++) {
        let val = depthData[i];
        val = ((val - 0.5) * contrast) + 0.5;
        val = Math.max(0, Math.min(1, val));
        if (invert) val = 1 - val;

        const color = interpolateColormap(colormap, val);
        const idx = i * 4;
        imageData.data[idx] = color[0];
        imageData.data[idx + 1] = color[1];
        imageData.data[idx + 2] = color[2];
        imageData.data[idx + 3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);
}

function interpolateColormap(colormap, t) {
    const n = colormap.length - 1;
    const idx = t * n;
    const i = Math.floor(idx);
    const f = idx - i;

    if (i >= n) return colormap[n];
    if (i < 0) return colormap[0];

    const c1 = colormap[i];
    const c2 = colormap[i + 1];

    return [
        Math.round(c1[0] + (c2[0] - c1[0]) * f),
        Math.round(c1[1] + (c2[1] - c1[1]) * f),
        Math.round(c1[2] + (c2[2] - c1[2]) * f)
    ];
}

function updateStats() {
    if (!depthData) return;

    let min = 1, max = 0, sum = 0;
    for (let i = 0; i < depthData.length; i++) {
        const val = depthData[i];
        if (val < min) min = val;
        if (val > max) max = val;
        sum += val;
    }
    const mean = sum / depthData.length;

    elements.depthStats.innerHTML = `
        <div class="stat-item">
            <div class="stat-value">${Math.round(mean * 100)}%</div>
            <div class="stat-label">${t('meanDepth')}</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${Math.round(min * 100)}% - ${Math.round(max * 100)}%</div>
            <div class="stat-label">${t('depthRange')}</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${Math.round(min * 100)}%</div>
            <div class="stat-label">${t('nearestPoint')}</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${Math.round(max * 100)}%</div>
            <div class="stat-label">${t('farthestPoint')}</div>
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
            elements.controls.style.display = 'none';
            elements.resultsSection.style.display = 'none';

            // Set canvas size
            const maxSize = 500;
            let w = img.width, h = img.height;
            if (w > maxSize || h > maxSize) {
                const scale = Math.min(maxSize / w, maxSize / h);
                w = Math.floor(w * scale);
                h = Math.floor(h * scale);
            }
            elements.depthCanvas.width = w;
            elements.depthCanvas.height = h;

            // Draw to temp canvas to get image data
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = w;
            tempCanvas.height = h;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(img, 0, 0, w, h);
            originalImageData = tempCtx.getImageData(0, 0, w, h);

            simulateProgress(() => {
                depthData = estimateDepth(originalImageData, w, h);
                applyColormap();
                updateStats();
                elements.progressContainer.style.display = 'none';
                elements.controls.style.display = 'flex';
                elements.resultsSection.style.display = 'block';
            });
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function downloadDepthMap() {
    const link = document.createElement('a');
    link.download = `depth-map-${Date.now()}.png`;
    link.href = elements.depthCanvas.toDataURL('image/png');
    link.click();
}

function resetUI() {
    elements.uploadArea.style.display = 'block';
    elements.previewArea.style.display = 'none';
    elements.fileInput.value = '';
    depthData = null;
    originalImageData = null;
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

    elements.colormapSelect.addEventListener('change', applyColormap);
    elements.contrastSlider.addEventListener('input', applyColormap);
    elements.invertCheckbox.addEventListener('change', applyColormap);

    elements.downloadBtn.addEventListener('click', downloadDepthMap);
    elements.resetBtn.addEventListener('click', resetUI);
}

// Initialize
function init() {
    const browserLang = navigator.language;
    setLanguage(browserLang.startsWith('zh') ? 'zh-TW' : 'en');
    initEventListeners();
}

init();
