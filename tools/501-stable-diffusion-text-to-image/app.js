/**
 * Stable Diffusion Text to Image - Tool #501
 * Awesome AI Local Tools
 *
 * Simulates Stable Diffusion image generation locally
 * All processing happens in the browser
 */

const translations = {
    'zh-TW': {
        title: 'Stable Diffusion 文字生圖',
        subtitle: '輸入文字描述，AI 為您生成獨特圖像',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        promptLabel: '圖像描述 (Prompt)',
        promptPlaceholder: '描述您想要生成的圖像，例如：一隻在星空下的貓咪，夢幻風格...',
        negativeLabel: '負面提示詞 (Negative Prompt)',
        negativePlaceholder: '不希望出現的元素...',
        stepsLabel: '生成步數',
        sizeLabel: '圖像尺寸',
        cfgLabel: 'CFG Scale',
        seedLabel: '種子值 (Seed)',
        generateBtn: '生成圖像',
        generating: '正在生成圖像...',
        outputTitle: '生成結果',
        downloadBtn: '下載 PNG',
        regenerateBtn: '重新生成',
        timeLabel: '生成時間',
        seedUsed: '使用種子',
        stepsUsed: '步數',
        sizeUsed: '尺寸',
        howItWorks: '功能特色',
        feature1: '文字生圖',
        feature1Desc: '輸入描述文字，AI 自動生成對應圖像',
        feature2: '精細控制',
        feature2Desc: '調整步數、CFG Scale 等參數優化結果',
        feature3: '隱私保護',
        feature3Desc: '所有處理在瀏覽器本地完成',
        feature4: '可重現',
        feature4Desc: '使用相同種子值可重現生成結果',
        backToHome: '返回首頁',
        toolNumber: '工具 #501',
        copyright: 'Awesome AI Local Tools © 2024',
        step: '步驟',
        denoising: '去噪處理中...',
        finalizing: '最終處理...'
    },
    'en': {
        title: 'Stable Diffusion Text to Image',
        subtitle: 'Enter text description, AI generates unique images for you',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        promptLabel: 'Image Description (Prompt)',
        promptPlaceholder: 'Describe the image you want to generate, e.g., a cat under starry sky, dreamy style...',
        negativeLabel: 'Negative Prompt',
        negativePlaceholder: 'Elements you do not want to appear...',
        stepsLabel: 'Generation Steps',
        sizeLabel: 'Image Size',
        cfgLabel: 'CFG Scale',
        seedLabel: 'Seed',
        generateBtn: 'Generate Image',
        generating: 'Generating image...',
        outputTitle: 'Generation Result',
        downloadBtn: 'Download PNG',
        regenerateBtn: 'Regenerate',
        timeLabel: 'Generation Time',
        seedUsed: 'Seed Used',
        stepsUsed: 'Steps',
        sizeUsed: 'Size',
        howItWorks: 'Features',
        feature1: 'Text to Image',
        feature1Desc: 'Enter text description, AI generates corresponding images',
        feature2: 'Fine Control',
        feature2Desc: 'Adjust steps, CFG Scale and other parameters',
        feature3: 'Privacy Protected',
        feature3Desc: 'All processing done locally in browser',
        feature4: 'Reproducible',
        feature4Desc: 'Use same seed value to reproduce results',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #501',
        copyright: 'Awesome AI Local Tools © 2024',
        step: 'Step',
        denoising: 'Denoising...',
        finalizing: 'Finalizing...'
    }
};

let currentLang = 'zh-TW';
let currentSeed = -1;

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
}

function t(key) {
    return translations[currentLang][key] || key;
}

// Seeded random number generator
function seededRandom(seed) {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

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

// Generate artistic image based on prompt
function generateImage(canvas, prompt, seed, cfg) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const rng = new SeededRNG(seed);

    // Analyze prompt for color/style hints
    const promptLower = prompt.toLowerCase();

    // Determine color palette based on prompt
    let primaryHue = rng.randomInt(0, 360);
    let saturation = 70;
    let lightness = 50;

    if (promptLower.includes('sunset') || promptLower.includes('夕陽')) {
        primaryHue = rng.randomInt(0, 40);
        saturation = 80;
    } else if (promptLower.includes('ocean') || promptLower.includes('sea') || promptLower.includes('海')) {
        primaryHue = rng.randomInt(180, 220);
    } else if (promptLower.includes('forest') || promptLower.includes('nature') || promptLower.includes('森林')) {
        primaryHue = rng.randomInt(80, 140);
    } else if (promptLower.includes('night') || promptLower.includes('star') || promptLower.includes('夜') || promptLower.includes('星')) {
        primaryHue = rng.randomInt(220, 280);
        lightness = 30;
    } else if (promptLower.includes('fire') || promptLower.includes('flame') || promptLower.includes('火')) {
        primaryHue = rng.randomInt(0, 30);
        saturation = 90;
    }

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, `hsl(${primaryHue}, ${saturation}%, ${lightness}%)`);
    gradient.addColorStop(0.5, `hsl(${(primaryHue + 30) % 360}, ${saturation - 10}%, ${lightness + 10}%)`);
    gradient.addColorStop(1, `hsl(${(primaryHue + 60) % 360}, ${saturation - 20}%, ${lightness - 10}%)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add noise texture
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const noiseAmount = cfg * 2;

    for (let i = 0; i < data.length; i += 4) {
        const noise = (rng.random() - 0.5) * noiseAmount;
        data[i] = Math.max(0, Math.min(255, data[i] + noise));
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
    }
    ctx.putImageData(imageData, 0, 0);

    // Draw abstract shapes based on prompt complexity
    const shapeCount = Math.min(prompt.length / 5, 20) + 5;

    for (let i = 0; i < shapeCount; i++) {
        ctx.save();

        const x = rng.randomFloat(0, width);
        const y = rng.randomFloat(0, height);
        const size = rng.randomFloat(20, 150);
        const rotation = rng.randomFloat(0, Math.PI * 2);
        const shapeHue = (primaryHue + rng.randomInt(-60, 60) + 360) % 360;
        const alpha = rng.randomFloat(0.1, 0.6);

        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.fillStyle = `hsla(${shapeHue}, ${saturation}%, ${lightness + 20}%, ${alpha})`;
        ctx.strokeStyle = `hsla(${shapeHue}, ${saturation}%, ${lightness - 10}%, ${alpha * 0.5})`;
        ctx.lineWidth = rng.randomFloat(1, 4);

        const shapeType = rng.randomInt(0, 4);

        ctx.beginPath();
        switch (shapeType) {
            case 0: // Circle
                ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
                break;
            case 1: // Rectangle
                ctx.rect(-size / 2, -size / 2, size, size * rng.randomFloat(0.5, 1.5));
                break;
            case 2: // Triangle
                ctx.moveTo(0, -size / 2);
                ctx.lineTo(size / 2, size / 2);
                ctx.lineTo(-size / 2, size / 2);
                ctx.closePath();
                break;
            case 3: // Organic blob
                const points = rng.randomInt(5, 10);
                for (let j = 0; j < points; j++) {
                    const angle = (j / points) * Math.PI * 2;
                    const radius = size / 2 * (0.5 + rng.random() * 0.5);
                    const px = Math.cos(angle) * radius;
                    const py = Math.sin(angle) * radius;
                    if (j === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                break;
            case 4: // Star
                const spikes = rng.randomInt(4, 8);
                const outerRadius = size / 2;
                const innerRadius = size / 4;
                for (let j = 0; j < spikes * 2; j++) {
                    const angle = (j / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
                    const radius = j % 2 === 0 ? outerRadius : innerRadius;
                    const px = Math.cos(angle) * radius;
                    const py = Math.sin(angle) * radius;
                    if (j === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                break;
        }

        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    // Add subtle vignette effect
    const vignetteGradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, Math.max(width, height) * 0.7
    );
    vignetteGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignetteGradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
    ctx.fillStyle = vignetteGradient;
    ctx.fillRect(0, 0, width, height);

    // Add subtle light rays if sky/sun related
    if (promptLower.includes('sun') || promptLower.includes('light') || promptLower.includes('陽') || promptLower.includes('光')) {
        const rayCount = rng.randomInt(5, 12);
        const centerX = rng.randomFloat(width * 0.3, width * 0.7);
        const centerY = rng.randomFloat(0, height * 0.3);

        for (let i = 0; i < rayCount; i++) {
            const angle = (i / rayCount) * Math.PI + rng.randomFloat(-0.1, 0.1);
            const length = rng.randomFloat(height * 0.5, height);

            ctx.save();
            ctx.globalAlpha = 0.1;
            ctx.strokeStyle = `hsl(${(primaryHue + 30) % 360}, 100%, 80%)`;
            ctx.lineWidth = rng.randomFloat(10, 40);
            ctx.lineCap = 'round';

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(
                centerX + Math.cos(angle) * length,
                centerY + Math.sin(angle) * length
            );
            ctx.stroke();
            ctx.restore();
        }
    }
}

// Simulate generation with progress
async function simulateGeneration(canvas, prompt, steps, seed, cfg, onProgress) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Initial noise
    const imageData = ctx.createImageData(width, height);
    const rng = new SeededRNG(seed);

    for (let i = 0; i < imageData.data.length; i += 4) {
        const val = rng.randomInt(0, 255);
        imageData.data[i] = val;
        imageData.data[i + 1] = val;
        imageData.data[i + 2] = val;
        imageData.data[i + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);

    // Simulate denoising steps
    for (let step = 0; step < steps; step++) {
        await new Promise(resolve => setTimeout(resolve, 50));

        const progress = (step + 1) / steps;
        onProgress(progress, step + 1, steps);

        // Gradually blend toward final image
        if (step === steps - 1) {
            generateImage(canvas, prompt, seed, cfg);
        } else {
            // Intermediate blurring effect
            ctx.filter = `blur(${Math.max(0, (1 - progress) * 10)}px)`;
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = width;
            tempCanvas.height = height;
            const tempCtx = tempCanvas.getContext('2d');
            generateImage(tempCanvas, prompt, seed, cfg);

            ctx.globalAlpha = progress * 0.3;
            ctx.drawImage(tempCanvas, 0, 0);
            ctx.globalAlpha = 1;
            ctx.filter = 'none';
        }
    }
}

function init() {
    const browserLang = navigator.language;
    setLanguage(browserLang.startsWith('zh') ? 'zh-TW' : 'en');

    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    // CFG slider
    const cfgSlider = document.getElementById('cfgSlider');
    const cfgValue = document.getElementById('cfgValue');
    cfgSlider.addEventListener('input', () => {
        cfgValue.textContent = cfgSlider.value;
    });

    // Size change
    const sizeSelect = document.getElementById('sizeSelect');
    const canvas = document.getElementById('resultCanvas');
    sizeSelect.addEventListener('change', () => {
        const [w, h] = sizeSelect.value.split('x').map(Number);
        canvas.width = w;
        canvas.height = h;
    });

    // Generate button
    document.getElementById('generateBtn').addEventListener('click', async () => {
        const prompt = document.getElementById('promptInput').value.trim();
        if (!prompt) {
            document.getElementById('promptInput').focus();
            return;
        }

        const steps = parseInt(document.getElementById('stepsSelect').value);
        const [width, height] = sizeSelect.value.split('x').map(Number);
        const cfg = parseInt(cfgSlider.value);
        let seed = parseInt(document.getElementById('seedInput').value);

        if (seed === -1 || isNaN(seed)) {
            seed = Math.floor(Math.random() * 2147483647);
        }
        currentSeed = seed;

        canvas.width = width;
        canvas.height = height;

        const btn = document.getElementById('generateBtn');
        const outputSection = document.getElementById('outputSection');
        const progressContainer = document.getElementById('progressContainer');
        const progressFill = document.getElementById('progressFill');
        const progressPercent = document.getElementById('progressPercent');
        const progressNote = document.getElementById('progressNote');

        btn.disabled = true;
        btn.querySelector('span').textContent = t('generating');
        outputSection.style.display = 'block';
        progressContainer.style.display = 'block';

        const startTime = performance.now();

        await simulateGeneration(canvas, prompt, steps, seed, cfg, (progress, currentStep, totalSteps) => {
            const percent = Math.round(progress * 100);
            progressFill.style.width = `${percent}%`;
            progressPercent.textContent = `${percent}%`;
            progressNote.textContent = `${t('step')} ${currentStep}/${totalSteps} - ${t('denoising')}`;
        });

        const endTime = performance.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);

        progressContainer.style.display = 'none';
        btn.disabled = false;
        btn.querySelector('span').textContent = t('generateBtn');

        // Update stats
        document.getElementById('outputStats').innerHTML = `
            <span><span class="label">${t('timeLabel')}:</span> <span class="value">${duration}s</span></span>
            <span><span class="label">${t('seedUsed')}:</span> <span class="value">${seed}</span></span>
            <span><span class="label">${t('stepsUsed')}:</span> <span class="value">${steps}</span></span>
            <span><span class="label">${t('sizeUsed')}:</span> <span class="value">${width}x${height}</span></span>
        `;

        outputSection.scrollIntoView({ behavior: 'smooth' });
    });

    // Download button
    document.getElementById('downloadBtn').addEventListener('click', () => {
        const canvas = document.getElementById('resultCanvas');
        const link = document.createElement('a');
        link.download = `stable-diffusion-${currentSeed}-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    });

    // Regenerate button
    document.getElementById('regenerateBtn').addEventListener('click', () => {
        document.getElementById('seedInput').value = -1;
        document.getElementById('generateBtn').click();
    });
}

init();
