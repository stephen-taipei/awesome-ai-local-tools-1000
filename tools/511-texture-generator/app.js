/**
 * AI Texture Generator - Tool #511
 * Awesome AI Local Tools
 *
 * Generates seamless texture patterns locally in the browser
 */

// ========================================
// Internationalization (i18n)
// ========================================

const translations = {
    'zh-TW': {
        title: 'AI 材質生成器',
        subtitle: '完全在瀏覽器本地執行，資料不外傳',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        textureOptions: '材質選項',
        textureType: '材質類型',
        wood: '木紋',
        marble: '大理石',
        metal: '金屬',
        fabric: '布料',
        brick: '磚塊',
        concrete: '混凝土',
        scale: '縮放比例',
        roughness: '粗糙度',
        colorTint: '色調',
        tileSize: '圖塊尺寸',
        generate: '生成材質',
        generating: '生成中...',
        statistics: '統計資訊',
        statType: '類型',
        statTileSize: '圖塊尺寸',
        statScale: '縮放',
        statRoughness: '粗糙度',
        downloadPng: '下載 PNG',
        downloadJpg: '下載 JPG',
        previewTile: '預覽平鋪效果',
        tilePreview: '平鋪預覽',
        backToHome: '返回首頁',
        toolNumber: '工具 #511',
        copyright: 'Awesome AI Local Tools'
    },
    'en': {
        title: 'AI Texture Generator',
        subtitle: 'Runs entirely in your browser, data never leaves your device',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        textureOptions: 'Texture Options',
        textureType: 'Texture Type',
        wood: 'Wood',
        marble: 'Marble',
        metal: 'Metal',
        fabric: 'Fabric',
        brick: 'Brick',
        concrete: 'Concrete',
        scale: 'Scale',
        roughness: 'Roughness',
        colorTint: 'Color Tint',
        tileSize: 'Tile Size',
        generate: 'Generate Texture',
        generating: 'Generating...',
        statistics: 'Statistics',
        statType: 'Type',
        statTileSize: 'Tile Size',
        statScale: 'Scale',
        statRoughness: 'Roughness',
        downloadPng: 'Download PNG',
        downloadJpg: 'Download JPG',
        previewTile: 'Preview Tiling',
        tilePreview: 'Tile Preview',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #511',
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
    textureType: 'wood',
    scale: 1,
    roughness: 50,
    colorTint: '#8B7355',
    tileSize: 512,
    isGenerating: false,
    generatedTexture: null
};

// ========================================
// DOM Elements
// ========================================

const elements = {
    canvas: document.getElementById('textureCanvas'),
    generateBtn: document.getElementById('generateBtn'),
    processingOverlay: document.getElementById('processingOverlay'),
    progressContainer: document.getElementById('progressContainer'),
    progressFill: document.getElementById('progressFill'),
    progressText: document.getElementById('progressText'),
    statsPanel: document.getElementById('statsPanel'),
    actionsPanel: document.getElementById('actionsPanel'),
    scaleSlider: document.getElementById('scaleSlider'),
    scaleValue: document.getElementById('scaleValue'),
    roughnessSlider: document.getElementById('roughnessSlider'),
    roughnessValue: document.getElementById('roughnessValue'),
    colorTint: document.getElementById('colorTint'),
    tileSize: document.getElementById('tileSize'),
    downloadPng: document.getElementById('downloadPng'),
    downloadJpg: document.getElementById('downloadJpg'),
    previewTile: document.getElementById('previewTile'),
    tileModal: document.getElementById('tileModal'),
    closeModal: document.getElementById('closeModal'),
    tilePreviewContainer: document.getElementById('tilePreviewContainer')
};

const ctx = elements.canvas.getContext('2d');

// ========================================
// Texture Generation Functions
// ========================================

// Perlin noise implementation
class PerlinNoise {
    constructor(seed = Math.random() * 10000) {
        this.p = [];
        for (let i = 0; i < 256; i++) {
            this.p[i] = Math.floor(Math.random() * 256);
        }
        this.p = this.p.concat(this.p);
    }

    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    lerp(a, b, t) {
        return a + t * (b - a);
    }

    grad(hash, x, y) {
        const h = hash & 3;
        const u = h < 2 ? x : y;
        const v = h < 2 ? y : x;
        return ((h & 1) ? -u : u) + ((h & 2) ? -v : v);
    }

    noise(x, y) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        x -= Math.floor(x);
        y -= Math.floor(y);
        const u = this.fade(x);
        const v = this.fade(y);
        const A = this.p[X] + Y;
        const B = this.p[X + 1] + Y;
        return this.lerp(
            this.lerp(this.grad(this.p[A], x, y), this.grad(this.p[B], x - 1, y), u),
            this.lerp(this.grad(this.p[A + 1], x, y - 1), this.grad(this.p[B + 1], x - 1, y - 1), u),
            v
        );
    }

    fbm(x, y, octaves = 6, persistence = 0.5) {
        let total = 0;
        let frequency = 1;
        let amplitude = 1;
        let maxValue = 0;
        for (let i = 0; i < octaves; i++) {
            total += this.noise(x * frequency, y * frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= persistence;
            frequency *= 2;
        }
        return total / maxValue;
    }
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 139, g: 115, b: 85 };
}

function generateWoodTexture(size, scale, roughness, tint) {
    const perlin = new PerlinNoise();
    const imageData = ctx.createImageData(size, size);
    const rgb = hexToRgb(tint);
    const roughnessScale = roughness / 50;

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const nx = x / size * 4 * scale;
            const ny = y / size * 0.5 * scale;

            let grain = perlin.fbm(nx * 2, ny * 8, 4, 0.6);
            grain = Math.sin(ny * 20 + grain * 10 * roughnessScale) * 0.5 + 0.5;

            const ring = perlin.fbm(nx * 0.5, ny * 4, 3, 0.5);
            grain = grain * 0.7 + ring * 0.3;

            const detail = perlin.fbm(nx * 8, ny * 8, 2, 0.3) * 0.1 * roughnessScale;
            grain += detail;

            grain = Math.max(0, Math.min(1, grain));

            const i = (y * size + x) * 4;
            imageData.data[i] = Math.floor(rgb.r * (0.6 + grain * 0.4));
            imageData.data[i + 1] = Math.floor(rgb.g * (0.5 + grain * 0.5));
            imageData.data[i + 2] = Math.floor(rgb.b * (0.4 + grain * 0.6));
            imageData.data[i + 3] = 255;
        }
    }
    return imageData;
}

function generateMarbleTexture(size, scale, roughness, tint) {
    const perlin = new PerlinNoise();
    const imageData = ctx.createImageData(size, size);
    const rgb = hexToRgb(tint);
    const roughnessScale = roughness / 50;

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const nx = x / size * 3 * scale;
            const ny = y / size * 3 * scale;

            const noise = perlin.fbm(nx, ny, 6, 0.5 + roughnessScale * 0.2);
            let veins = Math.sin(nx * 5 + ny * 5 + noise * 8);
            veins = Math.pow(Math.abs(veins), 0.3);

            const secondary = perlin.fbm(nx * 2, ny * 2, 4, 0.6);
            const value = veins * 0.7 + secondary * 0.3;

            const i = (y * size + x) * 4;
            const brightness = 0.8 + value * 0.2;
            imageData.data[i] = Math.floor(Math.min(255, rgb.r * brightness + (1 - veins) * 50));
            imageData.data[i + 1] = Math.floor(Math.min(255, rgb.g * brightness + (1 - veins) * 50));
            imageData.data[i + 2] = Math.floor(Math.min(255, rgb.b * brightness + (1 - veins) * 60));
            imageData.data[i + 3] = 255;
        }
    }
    return imageData;
}

function generateMetalTexture(size, scale, roughness, tint) {
    const perlin = new PerlinNoise();
    const imageData = ctx.createImageData(size, size);
    const rgb = hexToRgb(tint);
    const roughnessScale = roughness / 100;

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const nx = x / size * 8 * scale;
            const ny = y / size * 8 * scale;

            const scratch = perlin.fbm(nx * 4, ny * 0.5, 3, 0.4);
            const noise = perlin.fbm(nx, ny, 4, 0.5);

            let value = 0.7 + noise * 0.2 * roughnessScale;
            value += scratch * 0.1 * roughnessScale;

            const specular = Math.pow(Math.max(0, perlin.noise(nx * 2, ny * 2)), 3) * 0.3;
            value += specular * (1 - roughnessScale);

            const i = (y * size + x) * 4;
            imageData.data[i] = Math.floor(Math.min(255, rgb.r * value + specular * 100));
            imageData.data[i + 1] = Math.floor(Math.min(255, rgb.g * value + specular * 100));
            imageData.data[i + 2] = Math.floor(Math.min(255, rgb.b * value + specular * 100));
            imageData.data[i + 3] = 255;
        }
    }
    return imageData;
}

function generateFabricTexture(size, scale, roughness, tint) {
    const perlin = new PerlinNoise();
    const imageData = ctx.createImageData(size, size);
    const rgb = hexToRgb(tint);
    const roughnessScale = roughness / 50;

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const nx = x / size * 20 * scale;
            const ny = y / size * 20 * scale;

            const warpX = Math.sin(nx * Math.PI) * 0.5 + 0.5;
            const weftY = Math.sin(ny * Math.PI) * 0.5 + 0.5;
            let weave = (warpX + weftY) * 0.5;

            const noise = perlin.fbm(nx * 0.5, ny * 0.5, 3, 0.5);
            weave += noise * 0.2 * roughnessScale;

            const thread = perlin.fbm(nx * 2, ny * 2, 2, 0.3) * 0.1;
            weave += thread;

            const i = (y * size + x) * 4;
            imageData.data[i] = Math.floor(rgb.r * (0.7 + weave * 0.3));
            imageData.data[i + 1] = Math.floor(rgb.g * (0.7 + weave * 0.3));
            imageData.data[i + 2] = Math.floor(rgb.b * (0.7 + weave * 0.3));
            imageData.data[i + 3] = 255;
        }
    }
    return imageData;
}

function generateBrickTexture(size, scale, roughness, tint) {
    const perlin = new PerlinNoise();
    const imageData = ctx.createImageData(size, size);
    const rgb = hexToRgb(tint);
    const roughnessScale = roughness / 50;

    const brickWidth = size / (4 * scale);
    const brickHeight = size / (8 * scale);
    const mortarWidth = 4;

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const row = Math.floor(y / brickHeight);
            const offset = (row % 2) * (brickWidth / 2);
            const brickX = (x + offset) % brickWidth;
            const brickY = y % brickHeight;

            const isMortar = brickX < mortarWidth || brickY < mortarWidth;

            const nx = x / size * 10;
            const ny = y / size * 10;
            const noise = perlin.fbm(nx, ny, 4, 0.5) * roughnessScale;

            const i = (y * size + x) * 4;

            if (isMortar) {
                const mortarNoise = perlin.fbm(nx * 2, ny * 2, 2, 0.3);
                imageData.data[i] = Math.floor(180 + mortarNoise * 30);
                imageData.data[i + 1] = Math.floor(175 + mortarNoise * 25);
                imageData.data[i + 2] = Math.floor(165 + mortarNoise * 20);
            } else {
                const variation = perlin.noise(brickX * 0.1, brickY * 0.1 + row) * 0.2;
                imageData.data[i] = Math.floor(rgb.r * (0.8 + noise * 0.2 + variation));
                imageData.data[i + 1] = Math.floor(rgb.g * (0.7 + noise * 0.2 + variation));
                imageData.data[i + 2] = Math.floor(rgb.b * (0.6 + noise * 0.2 + variation));
            }
            imageData.data[i + 3] = 255;
        }
    }
    return imageData;
}

function generateConcreteTexture(size, scale, roughness, tint) {
    const perlin = new PerlinNoise();
    const imageData = ctx.createImageData(size, size);
    const rgb = hexToRgb(tint);
    const roughnessScale = roughness / 50;

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const nx = x / size * 6 * scale;
            const ny = y / size * 6 * scale;

            const base = perlin.fbm(nx, ny, 6, 0.6);
            const detail = perlin.fbm(nx * 4, ny * 4, 3, 0.4) * 0.3 * roughnessScale;
            const spots = perlin.fbm(nx * 8, ny * 8, 2, 0.3) * 0.15 * roughnessScale;

            let value = 0.5 + base * 0.3 + detail + spots;
            value = Math.max(0.3, Math.min(0.9, value));

            const i = (y * size + x) * 4;
            imageData.data[i] = Math.floor(rgb.r * value);
            imageData.data[i + 1] = Math.floor(rgb.g * value);
            imageData.data[i + 2] = Math.floor(rgb.b * value);
            imageData.data[i + 3] = 255;
        }
    }
    return imageData;
}

// ========================================
// Main Generation Function
// ========================================

async function generateTexture() {
    if (state.isGenerating) return;

    state.isGenerating = true;
    elements.generateBtn.disabled = true;
    elements.processingOverlay.style.display = 'flex';
    elements.progressContainer.style.display = 'flex';
    elements.statsPanel.style.display = 'none';
    elements.actionsPanel.style.display = 'none';

    const size = state.tileSize;
    elements.canvas.width = size;
    elements.canvas.height = size;

    // Simulate progress
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 90) progress = 90;
        updateProgress(progress);
    }, 100);

    // Use setTimeout to allow UI to update
    await new Promise(resolve => setTimeout(resolve, 100));

    let imageData;
    const generators = {
        wood: generateWoodTexture,
        marble: generateMarbleTexture,
        metal: generateMetalTexture,
        fabric: generateFabricTexture,
        brick: generateBrickTexture,
        concrete: generateConcreteTexture
    };

    const generator = generators[state.textureType] || generateWoodTexture;
    imageData = generator(size, state.scale, state.roughness, state.colorTint);

    // Apply seamless tiling by blending edges
    makeSeamless(imageData, size);

    ctx.putImageData(imageData, 0, 0);

    clearInterval(progressInterval);
    updateProgress(100);

    await new Promise(resolve => setTimeout(resolve, 300));

    state.generatedTexture = elements.canvas.toDataURL('image/png');

    // Update stats
    document.getElementById('statType').textContent = t(state.textureType);
    document.getElementById('statTileSize').textContent = `${size} x ${size}`;
    document.getElementById('statScale').textContent = `${state.scale}x`;
    document.getElementById('statRoughness').textContent = `${state.roughness}%`;

    elements.processingOverlay.style.display = 'none';
    elements.progressContainer.style.display = 'none';
    elements.statsPanel.style.display = 'block';
    elements.actionsPanel.style.display = 'flex';
    elements.generateBtn.disabled = false;
    state.isGenerating = false;
}

function makeSeamless(imageData, size) {
    const blendSize = Math.floor(size * 0.1);
    const data = imageData.data;

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < blendSize; x++) {
            const blend = x / blendSize;
            const leftIdx = (y * size + x) * 4;
            const rightIdx = (y * size + (size - blendSize + x)) * 4;

            for (let c = 0; c < 3; c++) {
                const avg = (data[leftIdx + c] + data[rightIdx + c]) / 2;
                data[leftIdx + c] = Math.floor(data[leftIdx + c] * blend + avg * (1 - blend));
                data[rightIdx + c] = Math.floor(data[rightIdx + c] * (1 - blend) + avg * blend);
            }
        }
    }

    for (let x = 0; x < size; x++) {
        for (let y = 0; y < blendSize; y++) {
            const blend = y / blendSize;
            const topIdx = (y * size + x) * 4;
            const bottomIdx = ((size - blendSize + y) * size + x) * 4;

            for (let c = 0; c < 3; c++) {
                const avg = (data[topIdx + c] + data[bottomIdx + c]) / 2;
                data[topIdx + c] = Math.floor(data[topIdx + c] * blend + avg * (1 - blend));
                data[bottomIdx + c] = Math.floor(data[bottomIdx + c] * (1 - blend) + avg * blend);
            }
        }
    }
}

function updateProgress(value) {
    elements.progressFill.style.width = `${value}%`;
    elements.progressText.textContent = `${Math.round(value)}%`;
}

// ========================================
// Download Functions
// ========================================

function downloadPng() {
    if (!state.generatedTexture) return;
    const link = document.createElement('a');
    link.download = `texture-${state.textureType}-${Date.now()}.png`;
    link.href = state.generatedTexture;
    link.click();
}

function downloadJpg() {
    if (!state.generatedTexture) return;
    const link = document.createElement('a');
    link.download = `texture-${state.textureType}-${Date.now()}.jpg`;
    link.href = elements.canvas.toDataURL('image/jpeg', 0.9);
    link.click();
}

function showTilePreview() {
    if (!state.generatedTexture) return;
    elements.tilePreviewContainer.style.backgroundImage = `url(${state.generatedTexture})`;
    elements.tileModal.style.display = 'flex';
}

// ========================================
// Event Listeners
// ========================================

function initEventListeners() {
    // Language switcher
    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    // Texture type buttons
    document.querySelectorAll('.texture-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.texture-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.textureType = btn.dataset.type;

            // Update default color tint based on texture type
            const colorDefaults = {
                wood: '#8B7355',
                marble: '#E8E8E8',
                metal: '#A0A0A0',
                fabric: '#6B7280',
                brick: '#B5543B',
                concrete: '#9CA3AF'
            };
            elements.colorTint.value = colorDefaults[state.textureType] || '#8B7355';
            state.colorTint = elements.colorTint.value;
        });
    });

    // Sliders
    elements.scaleSlider.addEventListener('input', (e) => {
        state.scale = parseFloat(e.target.value);
        elements.scaleValue.textContent = `${state.scale.toFixed(1)}x`;
    });

    elements.roughnessSlider.addEventListener('input', (e) => {
        state.roughness = parseInt(e.target.value);
        elements.roughnessValue.textContent = `${state.roughness}%`;
    });

    // Color tint
    elements.colorTint.addEventListener('input', (e) => {
        state.colorTint = e.target.value;
    });

    // Tile size
    elements.tileSize.addEventListener('change', (e) => {
        state.tileSize = parseInt(e.target.value);
    });

    // Generate button
    elements.generateBtn.addEventListener('click', generateTexture);

    // Download buttons
    elements.downloadPng.addEventListener('click', downloadPng);
    elements.downloadJpg.addEventListener('click', downloadJpg);

    // Tile preview
    elements.previewTile.addEventListener('click', showTilePreview);
    elements.closeModal.addEventListener('click', () => {
        elements.tileModal.style.display = 'none';
    });
    elements.tileModal.addEventListener('click', (e) => {
        if (e.target === elements.tileModal) {
            elements.tileModal.style.display = 'none';
        }
    });
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

    // Draw initial placeholder
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, elements.canvas.width, elements.canvas.height);
    ctx.fillStyle = '#64748b';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(t('generate'), elements.canvas.width / 2, elements.canvas.height / 2);

    console.log('AI Texture Generator initialized');
}

init();
