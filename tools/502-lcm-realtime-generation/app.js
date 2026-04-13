/**
 * LCM Realtime Generation - Tool #502
 * Awesome AI Local Tools
 *
 * Simulates LCM (Latent Consistency Model) realtime image generation
 * All processing happens locally in the browser
 */

const translations = {
    'zh-TW': {
        title: 'LCM 即時生圖',
        subtitle: '輸入即生成，極速 AI 圖像創作',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        promptLabel: '即時描述',
        promptPlaceholder: '開始輸入，即時看到生成結果...',
        inputHint: '輸入時自動生成，無需按按鈕',
        styleLabel: '風格預設',
        styleDefault: '預設',
        styleAnime: '動漫',
        stylePhoto: '寫實',
        styleArt: '藝術',
        stylePixel: '像素',
        qualityLabel: '品質',
        latencyLabel: '延遲：',
        fpsLabel: 'FPS：',
        generating: '生成中...',
        downloadBtn: '下載 PNG',
        lockBtn: '鎖定當前',
        unlockBtn: '解除鎖定',
        randomBtn: '隨機種子',
        statsTitle: '生成統計',
        totalGenerated: '已生成',
        avgLatency: '平均延遲',
        currentSeed: '當前種子',
        stepsUsed: '步數',
        howItWorks: '功能特色',
        feature1: '即時生成',
        feature1Desc: '輸入文字即時看到圖像變化',
        feature2: '極速推理',
        feature2Desc: 'LCM 模型僅需 4-8 步即可生成',
        feature3: '隱私保護',
        feature3Desc: '所有處理在瀏覽器本地完成',
        feature4: '多種風格',
        feature4Desc: '支援動漫、寫實、藝術等風格',
        backToHome: '返回首頁',
        toolNumber: '工具 #502',
        copyright: 'Awesome AI Local Tools © 2024'
    },
    'en': {
        title: 'LCM Realtime Generation',
        subtitle: 'Type and generate instantly, ultra-fast AI image creation',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        promptLabel: 'Realtime Description',
        promptPlaceholder: 'Start typing to see results in real-time...',
        inputHint: 'Auto-generates as you type, no button needed',
        styleLabel: 'Style Preset',
        styleDefault: 'Default',
        styleAnime: 'Anime',
        stylePhoto: 'Photorealistic',
        styleArt: 'Artistic',
        stylePixel: 'Pixel Art',
        qualityLabel: 'Quality',
        latencyLabel: 'Latency:',
        fpsLabel: 'FPS:',
        generating: 'Generating...',
        downloadBtn: 'Download PNG',
        lockBtn: 'Lock Current',
        unlockBtn: 'Unlock',
        randomBtn: 'Random Seed',
        statsTitle: 'Generation Stats',
        totalGenerated: 'Generated',
        avgLatency: 'Avg Latency',
        currentSeed: 'Current Seed',
        stepsUsed: 'Steps',
        howItWorks: 'Features',
        feature1: 'Realtime Generation',
        feature1Desc: 'See image changes as you type',
        feature2: 'Ultra-Fast Inference',
        feature2Desc: 'LCM model needs only 4-8 steps',
        feature3: 'Privacy Protected',
        feature3Desc: 'All processing done locally in browser',
        feature4: 'Multiple Styles',
        feature4Desc: 'Supports anime, photo, art styles and more',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #502',
        copyright: 'Awesome AI Local Tools © 2024'
    }
};

let currentLang = 'zh-TW';
let currentSeed = Math.floor(Math.random() * 2147483647);
let isLocked = false;
let totalGenerated = 0;
let latencyHistory = [];
let generateTimeout = null;
let lastGenerateTime = 0;

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[lang][key]) {
            el.placeholder = translations[lang][key];
        }
    });
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`lang-${lang === 'zh-TW' ? 'zh' : 'en'}`).classList.add('active');

    // Update lock button text
    const lockBtn = document.getElementById('lockBtn');
    lockBtn.textContent = isLocked ? t('unlockBtn') : t('lockBtn');
}

function t(key) {
    return translations[currentLang][key] || key;
}

// Seeded RNG
class SeededRNG {
    constructor(seed) {
        this.seed = seed;
    }

    random() {
        const x = Math.sin(this.seed++) * 10000;
        return x - Math.floor(x);
    }

    randomInt(min, max) {
        return Math.floor(this.random() * (max - min + 1)) + min;
    }

    randomFloat(min, max) {
        return this.random() * (max - min) + min;
    }
}

// Style presets
const stylePresets = {
    default: {
        saturation: 70,
        lightness: 50,
        shapes: 'mixed',
        colorVariation: 60
    },
    anime: {
        saturation: 85,
        lightness: 55,
        shapes: 'smooth',
        colorVariation: 40
    },
    photo: {
        saturation: 50,
        lightness: 45,
        shapes: 'organic',
        colorVariation: 30
    },
    art: {
        saturation: 80,
        lightness: 50,
        shapes: 'geometric',
        colorVariation: 80
    },
    pixel: {
        saturation: 90,
        lightness: 55,
        shapes: 'blocky',
        colorVariation: 50
    }
};

// Fast generation algorithm
function generateImageFast(canvas, prompt, seed, style, steps) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const rng = new SeededRNG(seed);
    const preset = stylePresets[style];

    // Hash prompt for consistent color generation
    let promptHash = 0;
    for (let i = 0; i < prompt.length; i++) {
        promptHash = ((promptHash << 5) - promptHash) + prompt.charCodeAt(i);
        promptHash = promptHash & promptHash;
    }
    const promptSeed = Math.abs(promptHash);
    const colorRng = new SeededRNG(promptSeed);

    const primaryHue = colorRng.randomInt(0, 360);
    const { saturation, lightness, colorVariation } = preset;

    // Clear and create background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, `hsl(${primaryHue}, ${saturation}%, ${lightness}%)`);
    gradient.addColorStop(0.5, `hsl(${(primaryHue + 40) % 360}, ${saturation - 10}%, ${lightness + 10}%)`);
    gradient.addColorStop(1, `hsl(${(primaryHue + 80) % 360}, ${saturation - 20}%, ${lightness - 10}%)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add style-specific rendering
    if (style === 'pixel') {
        // Pixelate effect
        const pixelSize = 8;
        ctx.imageSmoothingEnabled = false;

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width / pixelSize;
        tempCanvas.height = height / pixelSize;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height);
        ctx.drawImage(tempCanvas, 0, 0, width, height);
    }

    // Draw shapes based on style
    const shapeCount = Math.min(prompt.length / 3, 25) + 8;

    for (let i = 0; i < shapeCount; i++) {
        ctx.save();

        const x = rng.randomFloat(0, width);
        const y = rng.randomFloat(0, height);
        const size = rng.randomFloat(30, 120);
        const shapeHue = (primaryHue + rng.randomInt(-colorVariation, colorVariation) + 360) % 360;
        const alpha = rng.randomFloat(0.15, 0.5);

        ctx.translate(x, y);
        ctx.rotate(rng.randomFloat(0, Math.PI * 2));

        const gradientFill = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
        gradientFill.addColorStop(0, `hsla(${shapeHue}, ${saturation}%, ${lightness + 20}%, ${alpha})`);
        gradientFill.addColorStop(1, `hsla(${shapeHue}, ${saturation}%, ${lightness - 10}%, ${alpha * 0.3})`);
        ctx.fillStyle = gradientFill;

        ctx.beginPath();

        switch (preset.shapes) {
            case 'smooth':
                // Smooth organic shapes for anime
                const smoothPoints = rng.randomInt(6, 12);
                for (let j = 0; j < smoothPoints; j++) {
                    const angle = (j / smoothPoints) * Math.PI * 2;
                    const radius = size / 2 * (0.7 + rng.random() * 0.3);
                    const px = Math.cos(angle) * radius;
                    const py = Math.sin(angle) * radius;
                    if (j === 0) ctx.moveTo(px, py);
                    else {
                        const cpx = Math.cos(angle - 0.3) * radius * 1.1;
                        const cpy = Math.sin(angle - 0.3) * radius * 1.1;
                        ctx.quadraticCurveTo(cpx, cpy, px, py);
                    }
                }
                ctx.closePath();
                break;

            case 'organic':
                // Natural organic shapes for photo
                ctx.ellipse(0, 0, size / 2 * rng.randomFloat(0.5, 1), size / 2 * rng.randomFloat(0.5, 1), 0, 0, Math.PI * 2);
                break;

            case 'geometric':
                // Sharp geometric shapes for art
                const sides = rng.randomInt(3, 8);
                for (let j = 0; j < sides; j++) {
                    const angle = (j / sides) * Math.PI * 2;
                    const px = Math.cos(angle) * size / 2;
                    const py = Math.sin(angle) * size / 2;
                    if (j === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                break;

            case 'blocky':
                // Blocky shapes for pixel art
                const blockSize = Math.floor(size / 8) * 8;
                ctx.rect(-blockSize / 2, -blockSize / 2, blockSize, blockSize);
                break;

            default:
                // Mixed shapes
                if (rng.random() > 0.5) {
                    ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
                } else {
                    ctx.rect(-size / 2, -size / 2, size, size * rng.randomFloat(0.5, 1.5));
                }
        }

        ctx.fill();
        ctx.restore();
    }

    // Add glow effect
    ctx.globalCompositeOperation = 'screen';
    const glowCount = rng.randomInt(3, 6);
    for (let i = 0; i < glowCount; i++) {
        const gx = rng.randomFloat(width * 0.2, width * 0.8);
        const gy = rng.randomFloat(height * 0.2, height * 0.8);
        const gr = rng.randomFloat(50, 150);

        const glowGradient = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
        const glowHue = (primaryHue + rng.randomInt(-30, 30) + 360) % 360;
        glowGradient.addColorStop(0, `hsla(${glowHue}, 100%, 70%, 0.3)`);
        glowGradient.addColorStop(1, `hsla(${glowHue}, 100%, 50%, 0)`);

        ctx.fillStyle = glowGradient;
        ctx.fillRect(0, 0, width, height);
    }
    ctx.globalCompositeOperation = 'source-over';

    // Subtle vignette
    const vignetteGradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, Math.max(width, height) * 0.7
    );
    vignetteGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignetteGradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
    ctx.fillStyle = vignetteGradient;
    ctx.fillRect(0, 0, width, height);
}

// Debounced generation
function scheduleGeneration() {
    if (isLocked) return;

    if (generateTimeout) {
        clearTimeout(generateTimeout);
    }

    generateTimeout = setTimeout(() => {
        const prompt = document.getElementById('promptInput').value.trim();
        if (!prompt) {
            // Show placeholder gradient
            const canvas = document.getElementById('previewCanvas');
            const ctx = canvas.getContext('2d');
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, '#1e293b');
            gradient.addColorStop(1, '#0f172a');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Center text
            ctx.fillStyle = '#64748b';
            ctx.font = '16px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(t('promptPlaceholder'), canvas.width / 2, canvas.height / 2);
            return;
        }

        const style = document.getElementById('styleSelect').value;
        const quality = document.getElementById('qualitySelect').value;
        const steps = quality === 'fast' ? 4 : quality === 'balanced' ? 8 : 12;

        const overlay = document.getElementById('canvasOverlay');
        overlay.classList.add('active');

        const startTime = performance.now();

        // Simulate generation with slight delay
        setTimeout(() => {
            const canvas = document.getElementById('previewCanvas');
            generateImageFast(canvas, prompt, currentSeed, style, steps);

            const endTime = performance.now();
            const latency = Math.round(endTime - startTime);

            // Update UI
            overlay.classList.remove('active');

            // Update latency display
            document.getElementById('latencyValue').textContent = latency;
            latencyHistory.push(latency);
            if (latencyHistory.length > 20) latencyHistory.shift();

            const avgLatency = Math.round(latencyHistory.reduce((a, b) => a + b, 0) / latencyHistory.length);
            document.getElementById('avgLatency').textContent = avgLatency;

            // Update latency indicator
            const latencyDot = document.getElementById('latencyDot');
            latencyDot.className = 'latency-dot';
            if (latency < 100) {
                latencyDot.classList.add('fast');
            } else if (latency < 300) {
                latencyDot.classList.add('medium');
            } else {
                latencyDot.classList.add('slow');
            }

            // Calculate FPS
            const now = performance.now();
            const timeSinceLast = now - lastGenerateTime;
            const fps = timeSinceLast > 0 ? Math.round(1000 / timeSinceLast) : 0;
            document.getElementById('fpsValue').textContent = Math.min(fps, 60);
            lastGenerateTime = now;

            // Update stats
            totalGenerated++;
            document.getElementById('totalGenerated').textContent = totalGenerated;
            document.getElementById('currentSeed').textContent = currentSeed;
            document.getElementById('stepsUsed').textContent = steps;
        }, 50);
    }, 150); // Debounce delay
}

function init() {
    const browserLang = navigator.language;
    setLanguage(browserLang.startsWith('zh') ? 'zh-TW' : 'en');

    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    // Realtime input handling
    const promptInput = document.getElementById('promptInput');
    promptInput.addEventListener('input', scheduleGeneration);

    // Style and quality changes
    document.getElementById('styleSelect').addEventListener('change', scheduleGeneration);
    document.getElementById('qualitySelect').addEventListener('change', scheduleGeneration);

    // Download button
    document.getElementById('downloadBtn').addEventListener('click', () => {
        const canvas = document.getElementById('previewCanvas');
        const link = document.createElement('a');
        link.download = `lcm-realtime-${currentSeed}-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    });

    // Lock button
    document.getElementById('lockBtn').addEventListener('click', () => {
        isLocked = !isLocked;
        const lockBtn = document.getElementById('lockBtn');
        lockBtn.textContent = isLocked ? t('unlockBtn') : t('lockBtn');
        lockBtn.classList.toggle('btn-primary', isLocked);
        lockBtn.classList.toggle('btn-secondary', !isLocked);
    });

    // Random seed button
    document.getElementById('randomBtn').addEventListener('click', () => {
        currentSeed = Math.floor(Math.random() * 2147483647);
        document.getElementById('currentSeed').textContent = currentSeed;
        scheduleGeneration();
    });

    // Initial display
    const canvas = document.getElementById('previewCanvas');
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#1e293b');
    gradient.addColorStop(1, '#0f172a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#64748b';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(t('promptPlaceholder'), canvas.width / 2, canvas.height / 2);

    document.getElementById('currentSeed').textContent = currentSeed;
}

init();
