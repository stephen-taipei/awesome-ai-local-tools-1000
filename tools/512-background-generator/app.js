/**
 * AI Background Generator - Tool #512
 * Awesome AI Local Tools
 *
 * Generates beautiful background patterns locally in the browser
 */

// ========================================
// Internationalization (i18n)
// ========================================

const translations = {
    'zh-TW': {
        title: 'AI 背景生成器',
        subtitle: '完全在瀏覽器本地執行，資料不外傳',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        bgOptions: '背景選項',
        bgStyle: '背景風格',
        gradient: '漸層',
        abstract: '抽象',
        geometric: '幾何',
        bokeh: '散景',
        nature: '自然',
        colorScheme: '色彩方案',
        color1: '顏色 1',
        color2: '顏色 2',
        color3: '顏色 3',
        aspectRatio: '長寬比',
        resolution: '解析度',
        complexity: '複雜度',
        generate: '生成背景',
        randomize: '隨機生成',
        generating: '生成中...',
        statistics: '統計資訊',
        statStyle: '風格',
        statDimensions: '尺寸',
        statRatio: '長寬比',
        statComplexity: '複雜度',
        downloadPng: '下載 PNG',
        downloadJpg: '下載 JPG',
        backToHome: '返回首頁',
        toolNumber: '工具 #512',
        copyright: 'Awesome AI Local Tools'
    },
    'en': {
        title: 'AI Background Generator',
        subtitle: 'Runs entirely in your browser, data never leaves your device',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        bgOptions: 'Background Options',
        bgStyle: 'Background Style',
        gradient: 'Gradient',
        abstract: 'Abstract',
        geometric: 'Geometric',
        bokeh: 'Bokeh',
        nature: 'Nature',
        colorScheme: 'Color Scheme',
        color1: 'Color 1',
        color2: 'Color 2',
        color3: 'Color 3',
        aspectRatio: 'Aspect Ratio',
        resolution: 'Resolution',
        complexity: 'Complexity',
        generate: 'Generate Background',
        randomize: 'Randomize',
        generating: 'Generating...',
        statistics: 'Statistics',
        statStyle: 'Style',
        statDimensions: 'Dimensions',
        statRatio: 'Aspect Ratio',
        statComplexity: 'Complexity',
        downloadPng: 'Download PNG',
        downloadJpg: 'Download JPG',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #512',
        copyright: 'Awesome AI Local Tools'
    }
};

let currentLang = 'zh-TW';

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`lang-${lang === 'zh-TW' ? 'zh' : 'en'}`).classList.add('active');
    document.documentElement.lang = lang === 'zh-TW' ? 'zh-TW' : 'en';
}

function t(key) {
    return translations[currentLang][key] || key;
}

// ========================================
// Application State
// ========================================

const state = {
    style: 'gradient',
    colors: ['#0ea5e9', '#8b5cf6', '#ec4899'],
    aspectRatio: '1:1',
    resolution: 1080,
    complexity: 5,
    isGenerating: false,
    generatedImage: null
};

// ========================================
// DOM Elements
// ========================================

const elements = {
    canvas: document.getElementById('bgCanvas'),
    generateBtn: document.getElementById('generateBtn'),
    randomizeBtn: document.getElementById('randomizeBtn'),
    processingOverlay: document.getElementById('processingOverlay'),
    progressContainer: document.getElementById('progressContainer'),
    progressFill: document.getElementById('progressFill'),
    progressText: document.getElementById('progressText'),
    statsPanel: document.getElementById('statsPanel'),
    actionsPanel: document.getElementById('actionsPanel'),
    color1: document.getElementById('color1'),
    color2: document.getElementById('color2'),
    color3: document.getElementById('color3'),
    resolution: document.getElementById('resolution'),
    complexitySlider: document.getElementById('complexitySlider'),
    complexityValue: document.getElementById('complexityValue'),
    downloadPng: document.getElementById('downloadPng'),
    downloadJpg: document.getElementById('downloadJpg')
};

const ctx = elements.canvas.getContext('2d');

// ========================================
// Utility Functions
// ========================================

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

function rgbToString(rgb, alpha = 1) {
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

function lerpColor(c1, c2, t) {
    return {
        r: Math.round(c1.r + (c2.r - c1.r) * t),
        g: Math.round(c1.g + (c2.g - c1.g) * t),
        b: Math.round(c1.b + (c2.b - c1.b) * t)
    };
}

function getCanvasSize() {
    const ratios = {
        '16:9': { w: 16, h: 9 },
        '1:1': { w: 1, h: 1 },
        '4:3': { w: 4, h: 3 },
        '9:16': { w: 9, h: 16 },
        '3:2': { w: 3, h: 2 }
    };
    const ratio = ratios[state.aspectRatio];
    const baseSize = state.resolution;

    if (ratio.w >= ratio.h) {
        return {
            width: baseSize,
            height: Math.round(baseSize * ratio.h / ratio.w)
        };
    } else {
        return {
            width: Math.round(baseSize * ratio.w / ratio.h),
            height: baseSize
        };
    }
}

// ========================================
// Noise Function
// ========================================

class SimplexNoise {
    constructor(seed = Math.random() * 10000) {
        this.p = new Uint8Array(256);
        for (let i = 0; i < 256; i++) {
            this.p[i] = i;
        }
        // Shuffle
        for (let i = 255; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.p[i], this.p[j]] = [this.p[j], this.p[i]];
        }
    }

    noise(x, y) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        x -= Math.floor(x);
        y -= Math.floor(y);
        const u = x * x * (3 - 2 * x);
        const v = y * y * (3 - 2 * y);
        const A = this.p[X] + Y;
        const B = this.p[(X + 1) & 255] + Y;
        return this.lerp(
            this.lerp(this.grad(this.p[A & 255], x, y), this.grad(this.p[B & 255], x - 1, y), u),
            this.lerp(this.grad(this.p[(A + 1) & 255], x, y - 1), this.grad(this.p[(B + 1) & 255], x - 1, y - 1), u),
            v
        );
    }

    lerp(a, b, t) { return a + t * (b - a); }

    grad(hash, x, y) {
        const h = hash & 3;
        const u = h < 2 ? x : y;
        const v = h < 2 ? y : x;
        return ((h & 1) ? -u : u) + ((h & 2) ? -v : v);
    }

    fbm(x, y, octaves = 4) {
        let value = 0, amplitude = 1, frequency = 1, max = 0;
        for (let i = 0; i < octaves; i++) {
            value += this.noise(x * frequency, y * frequency) * amplitude;
            max += amplitude;
            amplitude *= 0.5;
            frequency *= 2;
        }
        return value / max;
    }
}

// ========================================
// Background Generators
// ========================================

function generateGradientBg(width, height, colors, complexity) {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    const stops = complexity + 1;

    for (let i = 0; i <= stops; i++) {
        const colorIndex = i % colors.length;
        gradient.addColorStop(i / stops, colors[colorIndex]);
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add mesh gradient effect
    const noise = new SimplexNoise();
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            const n = noise.fbm(x / 200, y / 200, complexity) * 0.15;
            data[i] = Math.min(255, Math.max(0, data[i] + n * 255));
            data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + n * 255));
            data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + n * 255));
        }
    }
    ctx.putImageData(imageData, 0, 0);
}

function generateAbstractBg(width, height, colors, complexity) {
    const noise = new SimplexNoise();
    const rgb1 = hexToRgb(colors[0]);
    const rgb2 = hexToRgb(colors[1]);
    const rgb3 = hexToRgb(colors[2]);

    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const nx = x / width * (complexity * 0.5);
            const ny = y / height * (complexity * 0.5);

            const n1 = (noise.fbm(nx, ny, 4) + 1) / 2;
            const n2 = (noise.fbm(nx + 100, ny + 100, 4) + 1) / 2;
            const n3 = (noise.fbm(nx * 2, ny * 2, 3) + 1) / 2;

            let color;
            if (n1 < 0.33) {
                color = lerpColor(rgb1, rgb2, n1 * 3);
            } else if (n1 < 0.66) {
                color = lerpColor(rgb2, rgb3, (n1 - 0.33) * 3);
            } else {
                color = lerpColor(rgb3, rgb1, (n1 - 0.66) * 3);
            }

            const swirl = Math.sin(n2 * Math.PI * 4) * 0.1;
            color.r = Math.min(255, Math.max(0, color.r + swirl * 100 + n3 * 30));
            color.g = Math.min(255, Math.max(0, color.g + swirl * 80 + n3 * 20));
            color.b = Math.min(255, Math.max(0, color.b + swirl * 60 + n3 * 40));

            const i = (y * width + x) * 4;
            data[i] = color.r;
            data[i + 1] = color.g;
            data[i + 2] = color.b;
            data[i + 3] = 255;
        }
    }
    ctx.putImageData(imageData, 0, 0);
}

function generateGeometricBg(width, height, colors, complexity) {
    // Background
    ctx.fillStyle = colors[0];
    ctx.fillRect(0, 0, width, height);

    const shapes = complexity * 10;
    const types = ['circle', 'triangle', 'rect', 'line'];

    for (let i = 0; i < shapes; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const rgb = hexToRgb(color);
        ctx.fillStyle = rgbToString(rgb, 0.1 + Math.random() * 0.3);
        ctx.strokeStyle = rgbToString(rgb, 0.3 + Math.random() * 0.4);
        ctx.lineWidth = 1 + Math.random() * 3;

        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = 20 + Math.random() * (width / 5);

        ctx.beginPath();
        switch (type) {
            case 'circle':
                ctx.arc(x, y, size / 2, 0, Math.PI * 2);
                break;
            case 'triangle':
                ctx.moveTo(x, y - size / 2);
                ctx.lineTo(x + size / 2, y + size / 2);
                ctx.lineTo(x - size / 2, y + size / 2);
                ctx.closePath();
                break;
            case 'rect':
                ctx.rect(x - size / 2, y - size / 2, size, size * (0.5 + Math.random()));
                break;
            case 'line':
                ctx.moveTo(x, y);
                ctx.lineTo(x + Math.cos(Math.random() * Math.PI * 2) * size, y + Math.sin(Math.random() * Math.PI * 2) * size);
                break;
        }

        if (type === 'line') {
            ctx.stroke();
        } else {
            Math.random() > 0.5 ? ctx.fill() : ctx.stroke();
        }
    }
}

function generateBokehBg(width, height, colors, complexity) {
    // Gradient background
    const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height));
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Bokeh circles
    const circles = complexity * 15;
    for (let i = 0; i < circles; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const radius = 10 + Math.random() * (width / 8);
        const color = colors[Math.floor(Math.random() * colors.length)];
        const rgb = hexToRgb(color);

        const bokehGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        bokehGradient.addColorStop(0, rgbToString(rgb, 0.2 + Math.random() * 0.2));
        bokehGradient.addColorStop(0.5, rgbToString(rgb, 0.1));
        bokehGradient.addColorStop(1, rgbToString(rgb, 0));

        ctx.fillStyle = bokehGradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

function generateNatureBg(width, height, colors, complexity) {
    const noise = new SimplexNoise();

    // Sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, height);
    skyGradient.addColorStop(0, colors[0]);
    skyGradient.addColorStop(0.6, colors[1]);
    skyGradient.addColorStop(1, colors[2]);
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height);

    // Clouds
    const cloudCount = complexity * 2;
    for (let c = 0; c < cloudCount; c++) {
        const cloudX = Math.random() * width;
        const cloudY = Math.random() * (height * 0.5);
        const cloudSize = 50 + Math.random() * 100;

        for (let i = 0; i < 5; i++) {
            const offset = (Math.random() - 0.5) * cloudSize;
            ctx.fillStyle = `rgba(255, 255, 255, ${0.2 + Math.random() * 0.3})`;
            ctx.beginPath();
            ctx.arc(cloudX + offset, cloudY + Math.random() * 20, 20 + Math.random() * 40, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Terrain layers
    const layers = 3;
    for (let layer = 0; layer < layers; layer++) {
        const layerColor = colors[Math.min(layer + 1, colors.length - 1)];
        const rgb = hexToRgb(layerColor);
        const darkness = 0.5 + layer * 0.2;

        ctx.fillStyle = rgbToString({
            r: Math.floor(rgb.r * darkness),
            g: Math.floor(rgb.g * darkness),
            b: Math.floor(rgb.b * darkness)
        });

        ctx.beginPath();
        ctx.moveTo(0, height);

        const baseY = height * (0.5 + layer * 0.15);
        for (let x = 0; x <= width; x += 5) {
            const n = noise.fbm(x / 300 + layer * 10, layer, complexity);
            const y = baseY + n * 100 - layer * 30;
            ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();
    }
}

// ========================================
// Main Generation Function
// ========================================

async function generateBackground(randomize = false) {
    if (state.isGenerating) return;

    if (randomize) {
        state.colors = [
            '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
            '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
            '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
        ];
        elements.color1.value = state.colors[0];
        elements.color2.value = state.colors[1];
        elements.color3.value = state.colors[2];

        const styles = ['gradient', 'abstract', 'geometric', 'bokeh', 'nature'];
        state.style = styles[Math.floor(Math.random() * styles.length)];
        document.querySelectorAll('.style-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.style === state.style);
        });

        state.complexity = Math.floor(Math.random() * 10) + 1;
        elements.complexitySlider.value = state.complexity;
        elements.complexityValue.textContent = state.complexity;
    }

    state.isGenerating = true;
    elements.generateBtn.disabled = true;
    elements.randomizeBtn.disabled = true;
    elements.processingOverlay.style.display = 'flex';
    elements.progressContainer.style.display = 'flex';
    elements.statsPanel.style.display = 'none';
    elements.actionsPanel.style.display = 'none';

    const size = getCanvasSize();
    elements.canvas.width = size.width;
    elements.canvas.height = size.height;

    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 90) progress = 90;
        updateProgress(progress);
    }, 100);

    await new Promise(resolve => setTimeout(resolve, 100));

    const generators = {
        gradient: generateGradientBg,
        abstract: generateAbstractBg,
        geometric: generateGeometricBg,
        bokeh: generateBokehBg,
        nature: generateNatureBg
    };

    const generator = generators[state.style] || generateGradientBg;
    generator(size.width, size.height, state.colors, state.complexity);

    clearInterval(progressInterval);
    updateProgress(100);

    await new Promise(resolve => setTimeout(resolve, 300));

    state.generatedImage = elements.canvas.toDataURL('image/png');

    // Update stats
    document.getElementById('statStyle').textContent = t(state.style);
    document.getElementById('statDimensions').textContent = `${size.width} x ${size.height}`;
    document.getElementById('statRatio').textContent = state.aspectRatio;
    document.getElementById('statComplexity').textContent = state.complexity;

    elements.processingOverlay.style.display = 'none';
    elements.progressContainer.style.display = 'none';
    elements.statsPanel.style.display = 'block';
    elements.actionsPanel.style.display = 'flex';
    elements.generateBtn.disabled = false;
    elements.randomizeBtn.disabled = false;
    state.isGenerating = false;
}

function updateProgress(value) {
    elements.progressFill.style.width = `${value}%`;
    elements.progressText.textContent = `${Math.round(value)}%`;
}

// ========================================
// Download Functions
// ========================================

function downloadPng() {
    if (!state.generatedImage) return;
    const link = document.createElement('a');
    link.download = `background-${state.style}-${Date.now()}.png`;
    link.href = state.generatedImage;
    link.click();
}

function downloadJpg() {
    if (!state.generatedImage) return;
    const link = document.createElement('a');
    link.download = `background-${state.style}-${Date.now()}.jpg`;
    link.href = elements.canvas.toDataURL('image/jpeg', 0.9);
    link.click();
}

// ========================================
// Event Listeners
// ========================================

function initEventListeners() {
    // Language switcher
    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    // Style buttons
    document.querySelectorAll('.style-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.style-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.style = btn.dataset.style;
        });
    });

    // Aspect ratio buttons
    document.querySelectorAll('.ratio-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.ratio-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.aspectRatio = btn.dataset.ratio;
        });
    });

    // Preset colors
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const colors = btn.dataset.colors.split(',');
            state.colors = colors;
            elements.color1.value = colors[0];
            elements.color2.value = colors[1];
            elements.color3.value = colors[2];
        });
    });

    // Color inputs
    elements.color1.addEventListener('input', (e) => { state.colors[0] = e.target.value; });
    elements.color2.addEventListener('input', (e) => { state.colors[1] = e.target.value; });
    elements.color3.addEventListener('input', (e) => { state.colors[2] = e.target.value; });

    // Resolution
    elements.resolution.addEventListener('change', (e) => {
        state.resolution = parseInt(e.target.value);
    });

    // Complexity
    elements.complexitySlider.addEventListener('input', (e) => {
        state.complexity = parseInt(e.target.value);
        elements.complexityValue.textContent = state.complexity;
    });

    // Generate buttons
    elements.generateBtn.addEventListener('click', () => generateBackground(false));
    elements.randomizeBtn.addEventListener('click', () => generateBackground(true));

    // Download buttons
    elements.downloadPng.addEventListener('click', downloadPng);
    elements.downloadJpg.addEventListener('click', downloadJpg);
}

// ========================================
// Initialization
// ========================================

function init() {
    const browserLang = navigator.language;
    if (browserLang.startsWith('zh')) {
        setLanguage('zh-TW');
    } else {
        setLanguage('en');
    }

    initEventListeners();

    // Draw placeholder
    const size = getCanvasSize();
    elements.canvas.width = size.width;
    elements.canvas.height = size.height;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, size.width, size.height);
    ctx.fillStyle = '#64748b';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(t('generate'), size.width / 2, size.height / 2);

    console.log('AI Background Generator initialized');
}

init();
