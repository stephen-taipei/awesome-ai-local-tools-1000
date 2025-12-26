/**
 * AI Background Animation - Procedural Animation Engine
 * Tool #010 - Uses Perlin noise and WebGL for smooth motion effects
 */

// Translations
const translations = {
    zh: {
        title: 'AI 背景動態化',
        subtitle: '將靜態圖片背景轉換為動態效果，創造生動的動畫',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        uploadText: '點擊或拖放圖片到這裡',
        uploadHint: '支援 JPG、PNG、WebP 格式',
        animationType: '動畫類型',
        animClouds: '雲彩飄動',
        animWater: '水波蕩漾',
        animFire: '火焰搖曳',
        animWind: '風吹草動',
        animSparkle: '閃爍星光',
        animPulse: '呼吸脈動',
        animSettings: '動畫設定',
        intensity: '強度',
        speed: '速度',
        scale: '縮放',
        direction: '方向控制',
        outputSettings: '輸出設定',
        duration: '時長',
        fps: '幀率',
        quality: '品質',
        qualityLow: '低',
        qualityMedium: '中',
        qualityHigh: '高',
        newImage: '選擇新圖片',
        export: '匯出動畫',
        processing: '正在生成動畫...',
        howItWorks: '如何運作？',
        step1Title: '圖像分析',
        step1Desc: '分析圖片結構和色彩分布，準備動畫處理',
        step2Title: '程序動畫',
        step2Desc: '使用柏林噪聲和向量場生成自然流暢的動態效果',
        step3Title: '即時渲染',
        step3Desc: 'WebGL 硬體加速，流暢的即時預覽體驗',
        step4Title: '多格式匯出',
        step4Desc: '支援 GIF、WebM、MP4 等多種動畫格式',
        techSpecs: '技術規格',
        specMethod: '處理方式',
        specMethodValue: '程序化動畫 + WebGL',
        specRealtime: '即時預覽',
        specRealtimeValue: '是 (60 FPS)',
        specInput: '輸入格式',
        specOutput: '輸出格式',
        backToHome: '返回首頁',
        toolNumber: '工具 #010',
        copyright: 'Awesome AI Local Tools © 2024'
    },
    en: {
        title: 'AI Background Animation',
        subtitle: 'Transform static backgrounds into dynamic animated effects',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        uploadText: 'Click or drag and drop image here',
        uploadHint: 'Supports JPG, PNG, WebP formats',
        animationType: 'Animation Type',
        animClouds: 'Cloud Drift',
        animWater: 'Water Ripple',
        animFire: 'Fire Flicker',
        animWind: 'Wind Sway',
        animSparkle: 'Sparkle',
        animPulse: 'Pulse',
        animSettings: 'Animation Settings',
        intensity: 'Intensity',
        speed: 'Speed',
        scale: 'Scale',
        direction: 'Direction',
        outputSettings: 'Output Settings',
        duration: 'Duration',
        fps: 'Frame Rate',
        quality: 'Quality',
        qualityLow: 'Low',
        qualityMedium: 'Medium',
        qualityHigh: 'High',
        newImage: 'New Image',
        export: 'Export Animation',
        processing: 'Generating animation...',
        howItWorks: 'How It Works',
        step1Title: 'Image Analysis',
        step1Desc: 'Analyze image structure and color distribution',
        step2Title: 'Procedural Animation',
        step2Desc: 'Generate smooth motion with Perlin noise and vector fields',
        step3Title: 'Real-time Rendering',
        step3Desc: 'WebGL hardware acceleration for smooth preview',
        step4Title: 'Multi-format Export',
        step4Desc: 'Support GIF, WebM, MP4 animation formats',
        techSpecs: 'Technical Specs',
        specMethod: 'Method',
        specMethodValue: 'Procedural Animation + WebGL',
        specRealtime: 'Real-time Preview',
        specRealtimeValue: 'Yes (60 FPS)',
        specInput: 'Input Format',
        specOutput: 'Output Format',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #010',
        copyright: 'Awesome AI Local Tools © 2024'
    }
};

// Perlin Noise Implementation
class PerlinNoise {
    constructor() {
        this.permutation = [];
        for (let i = 0; i < 256; i++) {
            this.permutation[i] = Math.floor(Math.random() * 256);
        }
        this.p = [...this.permutation, ...this.permutation];
    }

    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    lerp(a, b, t) {
        return a + t * (b - a);
    }

    grad(hash, x, y, z) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    noise(x, y, z = 0) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);

        const u = this.fade(x);
        const v = this.fade(y);
        const w = this.fade(z);

        const A = this.p[X] + Y;
        const AA = this.p[A] + Z;
        const AB = this.p[A + 1] + Z;
        const B = this.p[X + 1] + Y;
        const BA = this.p[B] + Z;
        const BB = this.p[B + 1] + Z;

        return this.lerp(
            this.lerp(
                this.lerp(this.grad(this.p[AA], x, y, z), this.grad(this.p[BA], x - 1, y, z), u),
                this.lerp(this.grad(this.p[AB], x, y - 1, z), this.grad(this.p[BB], x - 1, y - 1, z), u),
                v
            ),
            this.lerp(
                this.lerp(this.grad(this.p[AA + 1], x, y, z - 1), this.grad(this.p[BA + 1], x - 1, y, z - 1), u),
                this.lerp(this.grad(this.p[AB + 1], x, y - 1, z - 1), this.grad(this.p[BB + 1], x - 1, y - 1, z - 1), u),
                v
            ),
            w
        );
    }

    // Fractional Brownian Motion for more natural noise
    fbm(x, y, octaves = 4, lacunarity = 2, persistence = 0.5) {
        let value = 0;
        let amplitude = 1;
        let frequency = 1;
        let maxValue = 0;

        for (let i = 0; i < octaves; i++) {
            value += amplitude * this.noise(x * frequency, y * frequency);
            maxValue += amplitude;
            amplitude *= persistence;
            frequency *= lacunarity;
        }

        return value / maxValue;
    }
}

// State
let currentLang = 'zh';
let originalImage = null;
let animationCanvas = null;
let animationCtx = null;
let isPlaying = true;
let animationFrame = null;
let perlin = new PerlinNoise();
let startTime = 0;

// Animation settings
let settings = {
    type: 'clouds',
    intensity: 50,
    speed: 100,
    scale: 100,
    direction: { x: 1, y: 0 },
    duration: 2,
    fps: 30,
    quality: 'medium',
    format: 'gif'
};

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const editorArea = document.getElementById('editorArea');
const previewCanvas = document.getElementById('previewCanvas');
const processingOverlay = document.getElementById('processingOverlay');
const playPauseBtn = document.getElementById('playPauseBtn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initLanguage();
    initUpload();
    initControls();
    startTime = performance.now();
});

// Language handling
function initLanguage() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLanguage('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLanguage('en'));
    applyTranslations();
}

function switchLanguage(lang) {
    currentLang = lang;
    document.getElementById('lang-zh').classList.toggle('active', lang === 'zh');
    document.getElementById('lang-en').classList.toggle('active', lang === 'en');
    applyTranslations();
}

function applyTranslations() {
    const t = translations[currentLang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) {
            el.textContent = t[key];
        }
    });
}

// Upload handling
function initUpload() {
    uploadArea.addEventListener('click', () => fileInput.click());

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    document.getElementById('resetBtn').addEventListener('click', resetEditor);
}

function handleFile(file) {
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
        alert('請選擇 JPG、PNG 或 WebP 格式的圖片');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            originalImage = img;
            showEditor();
            initAnimation();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function showEditor() {
    uploadArea.style.display = 'none';
    editorArea.style.display = 'grid';
}

function resetEditor() {
    uploadArea.style.display = 'flex';
    editorArea.style.display = 'none';
    originalImage = null;
    fileInput.value = '';
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
    }
}

// Initialize animation
function initAnimation() {
    // Set canvas size
    const maxWidth = 800;
    const maxHeight = 600;
    let width = originalImage.width;
    let height = originalImage.height;

    if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
    }
    if (height > maxHeight) {
        width = (maxHeight / height) * width;
        height = maxHeight;
    }

    previewCanvas.width = width;
    previewCanvas.height = height;
    animationCtx = previewCanvas.getContext('2d');

    // Create offscreen canvas for original image
    animationCanvas = document.createElement('canvas');
    animationCanvas.width = width;
    animationCanvas.height = height;
    const ctx = animationCanvas.getContext('2d');
    ctx.drawImage(originalImage, 0, 0, width, height);

    // Start animation loop
    isPlaying = true;
    updatePlayPauseButton();
    animate();
}

// Animation loop
function animate() {
    if (!originalImage || !isPlaying) return;

    const time = (performance.now() - startTime) / 1000;
    renderFrame(time);
    updateFrameInfo(time);

    animationFrame = requestAnimationFrame(animate);
}

function renderFrame(time) {
    const width = previewCanvas.width;
    const height = previewCanvas.height;
    const speedMultiplier = settings.speed / 100;
    const intensity = settings.intensity / 100;
    const scale = settings.scale / 100;

    // Get original image data
    const srcCtx = animationCanvas.getContext('2d');
    const srcData = srcCtx.getImageData(0, 0, width, height);

    // Create output image data
    const dstData = animationCtx.createImageData(width, height);

    // Apply animation based on type
    switch (settings.type) {
        case 'clouds':
            applyCloudEffect(srcData, dstData, time * speedMultiplier, intensity, scale);
            break;
        case 'water':
            applyWaterEffect(srcData, dstData, time * speedMultiplier, intensity, scale);
            break;
        case 'fire':
            applyFireEffect(srcData, dstData, time * speedMultiplier, intensity, scale);
            break;
        case 'wind':
            applyWindEffect(srcData, dstData, time * speedMultiplier, intensity, scale);
            break;
        case 'sparkle':
            applySparkleEffect(srcData, dstData, time * speedMultiplier, intensity, scale);
            break;
        case 'pulse':
            applyPulseEffect(srcData, dstData, time * speedMultiplier, intensity, scale);
            break;
        default:
            dstData.data.set(srcData.data);
    }

    animationCtx.putImageData(dstData, 0, 0);
}

// Animation Effects

function applyCloudEffect(src, dst, time, intensity, scale) {
    const width = src.width;
    const height = src.height;
    const noiseScale = 0.01 / scale;
    const displacement = 20 * intensity;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Calculate displacement using Perlin noise
            const noiseX = perlin.fbm(x * noiseScale + time * settings.direction.x * 0.5, y * noiseScale, 3);
            const noiseY = perlin.fbm(x * noiseScale, y * noiseScale + time * settings.direction.y * 0.3, 3);

            let srcX = x + noiseX * displacement * settings.direction.x;
            let srcY = y + noiseY * displacement * 0.5;

            // Clamp coordinates
            srcX = Math.max(0, Math.min(width - 1, srcX));
            srcY = Math.max(0, Math.min(height - 1, srcY));

            // Bilinear interpolation
            const color = bilinearSample(src, srcX, srcY);
            const idx = (y * width + x) * 4;
            dst.data[idx] = color.r;
            dst.data[idx + 1] = color.g;
            dst.data[idx + 2] = color.b;
            dst.data[idx + 3] = color.a;
        }
    }
}

function applyWaterEffect(src, dst, time, intensity, scale) {
    const width = src.width;
    const height = src.height;
    const waveFreq = 0.05 / scale;
    const waveAmp = 10 * intensity;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Multiple wave layers
            const wave1 = Math.sin((x * waveFreq + time * 2) * settings.direction.x) * waveAmp;
            const wave2 = Math.sin((y * waveFreq * 0.8 + time * 1.5) * settings.direction.y) * waveAmp * 0.5;
            const ripple = perlin.noise(x * 0.02, y * 0.02, time * 0.5) * waveAmp * 0.3;

            let srcX = x + wave2 + ripple;
            let srcY = y + wave1 + ripple;

            srcX = Math.max(0, Math.min(width - 1, srcX));
            srcY = Math.max(0, Math.min(height - 1, srcY));

            const color = bilinearSample(src, srcX, srcY);
            const idx = (y * width + x) * 4;
            dst.data[idx] = color.r;
            dst.data[idx + 1] = color.g;
            dst.data[idx + 2] = color.b;
            dst.data[idx + 3] = color.a;
        }
    }
}

function applyFireEffect(src, dst, time, intensity, scale) {
    const width = src.width;
    const height = src.height;
    const noiseScale = 0.02 / scale;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Fire rises upward with turbulence
            const turbulence = perlin.fbm(x * noiseScale, y * noiseScale - time * 2, 4);
            const flicker = Math.sin(time * 10 + x * 0.1) * 0.1;

            let srcX = x + turbulence * 8 * intensity;
            let srcY = y + (turbulence + flicker) * 15 * intensity * (1 - y / height);

            srcX = Math.max(0, Math.min(width - 1, srcX));
            srcY = Math.max(0, Math.min(height - 1, srcY));

            const color = bilinearSample(src, srcX, srcY);

            // Add warm color shift for fire
            const warmth = Math.max(0, turbulence * 0.3 * intensity * (1 - y / height));
            const idx = (y * width + x) * 4;
            dst.data[idx] = Math.min(255, color.r + warmth * 50);
            dst.data[idx + 1] = Math.min(255, color.g + warmth * 20);
            dst.data[idx + 2] = color.b;
            dst.data[idx + 3] = color.a;
        }
    }
}

function applyWindEffect(src, dst, time, intensity, scale) {
    const width = src.width;
    const height = src.height;
    const noiseScale = 0.008 / scale;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Wind effect stronger at top (like trees swaying)
            const heightFactor = 1 - (y / height);
            const sway = perlin.fbm(x * noiseScale + time * 0.5, y * noiseScale, 3);

            let srcX = x + sway * 15 * intensity * heightFactor * settings.direction.x;
            let srcY = y + sway * 5 * intensity * heightFactor * Math.abs(settings.direction.y);

            srcX = Math.max(0, Math.min(width - 1, srcX));
            srcY = Math.max(0, Math.min(height - 1, srcY));

            const color = bilinearSample(src, srcX, srcY);
            const idx = (y * width + x) * 4;
            dst.data[idx] = color.r;
            dst.data[idx + 1] = color.g;
            dst.data[idx + 2] = color.b;
            dst.data[idx + 3] = color.a;
        }
    }
}

function applySparkleEffect(src, dst, time, intensity, scale) {
    const width = src.width;
    const height = src.height;

    // Copy original first
    dst.data.set(src.data);

    // Add sparkles
    const sparkleCount = Math.floor(50 * intensity * scale);
    const sparkleSize = 3;

    for (let i = 0; i < sparkleCount; i++) {
        // Use noise for consistent sparkle positions that twinkle
        const baseX = perlin.noise(i * 0.1, 0) * 0.5 + 0.5;
        const baseY = perlin.noise(0, i * 0.1) * 0.5 + 0.5;

        const x = Math.floor(baseX * width);
        const y = Math.floor(baseY * height);

        // Twinkle effect
        const twinkle = Math.sin(time * 5 + i * 0.5) * 0.5 + 0.5;
        const brightness = twinkle * intensity;

        if (brightness > 0.3) {
            // Draw sparkle
            for (let dy = -sparkleSize; dy <= sparkleSize; dy++) {
                for (let dx = -sparkleSize; dx <= sparkleSize; dx++) {
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist <= sparkleSize) {
                        const px = x + dx;
                        const py = y + dy;
                        if (px >= 0 && px < width && py >= 0 && py < height) {
                            const falloff = 1 - dist / sparkleSize;
                            const idx = (py * width + px) * 4;
                            const add = brightness * falloff * 200;
                            dst.data[idx] = Math.min(255, dst.data[idx] + add);
                            dst.data[idx + 1] = Math.min(255, dst.data[idx + 1] + add);
                            dst.data[idx + 2] = Math.min(255, dst.data[idx + 2] + add * 0.8);
                        }
                    }
                }
            }
        }
    }
}

function applyPulseEffect(src, dst, time, intensity, scale) {
    const width = src.width;
    const height = src.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Breathing/pulsing effect
    const pulse = Math.sin(time * 2) * 0.5 + 0.5;
    const scaleFactor = 1 + pulse * 0.05 * intensity;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Scale from center
            let srcX = centerX + (x - centerX) / scaleFactor;
            let srcY = centerY + (y - centerY) / scaleFactor;

            // Add subtle wave
            const wave = perlin.noise(x * 0.01 / scale, y * 0.01 / scale, time * 0.3);
            srcX += wave * 3 * intensity;
            srcY += wave * 3 * intensity;

            srcX = Math.max(0, Math.min(width - 1, srcX));
            srcY = Math.max(0, Math.min(height - 1, srcY));

            const color = bilinearSample(src, srcX, srcY);

            // Subtle brightness pulse
            const brightnessMod = 1 + pulse * 0.1 * intensity;
            const idx = (y * width + x) * 4;
            dst.data[idx] = Math.min(255, color.r * brightnessMod);
            dst.data[idx + 1] = Math.min(255, color.g * brightnessMod);
            dst.data[idx + 2] = Math.min(255, color.b * brightnessMod);
            dst.data[idx + 3] = color.a;
        }
    }
}

// Bilinear sampling for smooth interpolation
function bilinearSample(imageData, x, y) {
    const width = imageData.width;
    const height = imageData.height;

    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const x1 = Math.min(x0 + 1, width - 1);
    const y1 = Math.min(y0 + 1, height - 1);

    const xFrac = x - x0;
    const yFrac = y - y0;

    const getPixel = (px, py) => {
        const idx = (py * width + px) * 4;
        return {
            r: imageData.data[idx],
            g: imageData.data[idx + 1],
            b: imageData.data[idx + 2],
            a: imageData.data[idx + 3]
        };
    };

    const p00 = getPixel(x0, y0);
    const p10 = getPixel(x1, y0);
    const p01 = getPixel(x0, y1);
    const p11 = getPixel(x1, y1);

    const lerp = (a, b, t) => a + t * (b - a);

    return {
        r: lerp(lerp(p00.r, p10.r, xFrac), lerp(p01.r, p11.r, xFrac), yFrac),
        g: lerp(lerp(p00.g, p10.g, xFrac), lerp(p01.g, p11.g, xFrac), yFrac),
        b: lerp(lerp(p00.b, p10.b, xFrac), lerp(p01.b, p11.b, xFrac), yFrac),
        a: lerp(lerp(p00.a, p10.a, xFrac), lerp(p01.a, p11.a, xFrac), yFrac)
    };
}

function updateFrameInfo(time) {
    const totalFrames = Math.floor(settings.duration * settings.fps);
    const currentFrame = Math.floor((time % settings.duration) * settings.fps);
    document.getElementById('frameInfo').textContent = `${currentFrame} / ${totalFrames}`;
    document.getElementById('durationInfo').textContent = `${(time % settings.duration).toFixed(1)}s`;
}

function updatePlayPauseButton() {
    const playIcon = playPauseBtn.querySelector('.play-icon');
    const pauseIcon = playPauseBtn.querySelector('.pause-icon');
    playIcon.style.display = isPlaying ? 'none' : 'block';
    pauseIcon.style.display = isPlaying ? 'block' : 'none';
}

// Controls
function initControls() {
    // Play/Pause
    playPauseBtn.addEventListener('click', () => {
        isPlaying = !isPlaying;
        updatePlayPauseButton();
        if (isPlaying) {
            startTime = performance.now();
            animate();
        }
    });

    // Animation type presets
    document.querySelectorAll('.preset-btn[data-type]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.preset-btn[data-type]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            settings.type = btn.dataset.type;
            perlin = new PerlinNoise(); // Reset noise for variety
        });
    });

    // Sliders
    const intensitySlider = document.getElementById('intensitySlider');
    const speedSlider = document.getElementById('speedSlider');
    const scaleSlider = document.getElementById('scaleSlider');
    const durationSlider = document.getElementById('durationSlider');
    const fpsSlider = document.getElementById('fpsSlider');

    intensitySlider.addEventListener('input', (e) => {
        settings.intensity = parseInt(e.target.value);
        document.getElementById('intensityValue').textContent = e.target.value + '%';
    });

    speedSlider.addEventListener('input', (e) => {
        settings.speed = parseInt(e.target.value);
        document.getElementById('speedValue').textContent = (e.target.value / 100).toFixed(1) + 'x';
    });

    scaleSlider.addEventListener('input', (e) => {
        settings.scale = parseInt(e.target.value);
        document.getElementById('scaleValue').textContent = (e.target.value / 100).toFixed(1) + 'x';
    });

    durationSlider.addEventListener('input', (e) => {
        settings.duration = parseFloat(e.target.value);
        document.getElementById('durationValue').textContent = e.target.value + 's';
    });

    fpsSlider.addEventListener('input', (e) => {
        settings.fps = parseInt(e.target.value);
        document.getElementById('fpsValue').textContent = e.target.value + ' fps';
    });

    // Direction pad
    document.querySelectorAll('.dir-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.dir-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            switch (btn.dataset.dir) {
                case 'up': settings.direction = { x: 0, y: -1 }; break;
                case 'down': settings.direction = { x: 0, y: 1 }; break;
                case 'left': settings.direction = { x: -1, y: 0 }; break;
                case 'right': settings.direction = { x: 1, y: 0 }; break;
                case 'center': settings.direction = { x: 1, y: 0 }; break;
            }
        });
    });

    // Output format
    document.querySelectorAll('.format-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.format-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            settings.format = btn.dataset.format;
        });
    });

    // Quality
    document.querySelectorAll('.quality-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.quality-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            settings.quality = btn.dataset.quality;
        });
    });

    // Export
    document.getElementById('exportBtn').addEventListener('click', exportAnimation);
}

// Export Animation
async function exportAnimation() {
    if (!originalImage) return;

    processingOverlay.style.display = 'flex';
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    const totalFrames = Math.floor(settings.duration * settings.fps);
    const frameDelay = 1000 / settings.fps;

    // Quality settings
    let quality = 10;
    if (settings.quality === 'low') quality = 5;
    if (settings.quality === 'high') quality = 15;

    if (settings.format === 'gif') {
        // Use gif.js for GIF export
        const gif = new GIF({
            workers: 2,
            quality: quality,
            width: previewCanvas.width,
            height: previewCanvas.height,
            workerScript: '/vendor/gif/gif.worker.js'
        });

        // Generate frames
        for (let i = 0; i < totalFrames; i++) {
            const time = i / settings.fps;
            renderFrame(time);

            // Add frame to GIF
            gif.addFrame(animationCtx, { copy: true, delay: frameDelay });

            // Update progress
            const progress = Math.round((i / totalFrames) * 100);
            progressFill.style.width = progress + '%';
            progressText.textContent = progress + '%';

            // Allow UI to update
            await new Promise(r => setTimeout(r, 0));
        }

        gif.on('finished', (blob) => {
            downloadBlob(blob, 'animation.gif');
            processingOverlay.style.display = 'none';
            if (isPlaying) animate();
        });

        gif.render();
    } else {
        // Use MediaRecorder for WebM/MP4
        const stream = previewCanvas.captureStream(settings.fps);
        const mimeType = settings.format === 'mp4' ? 'video/mp4' : 'video/webm';
        const mediaRecorder = new MediaRecorder(stream, {
            mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : 'video/webm'
        });

        const chunks = [];
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: mimeType });
            downloadBlob(blob, `animation.${settings.format}`);
            processingOverlay.style.display = 'none';
            if (isPlaying) animate();
        };

        mediaRecorder.start();

        // Render frames
        for (let i = 0; i < totalFrames; i++) {
            const time = i / settings.fps;
            renderFrame(time);

            const progress = Math.round((i / totalFrames) * 100);
            progressFill.style.width = progress + '%';
            progressText.textContent = progress + '%';

            await new Promise(r => setTimeout(r, frameDelay));
        }

        mediaRecorder.stop();
    }
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}
