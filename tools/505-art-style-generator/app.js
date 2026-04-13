/**
 * Art Style Generator - Tool #505
 * Awesome AI Local Tools
 *
 * Generates simulated AI art in various styles locally in the browser
 */

const translations = {
    'zh-TW': {
        title: 'AI 藝術風格生成',
        subtitle: '選擇藝術風格，創作獨特的 AI 藝術作品',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        controlsTitle: '藝術參數',
        styleLabel: '藝術風格',
        styleImpressionist: '印象派',
        styleCubist: '立體派',
        stylePopart: '普普藝術',
        styleWatercolor: '水彩畫',
        subjectLabel: '主題描述',
        subjectPlaceholder: '描述您想要創作的主題，例如：花瓶中的向日葵...',
        colorSchemeLabel: '色彩方案',
        colorVibrant: '鮮豔',
        colorPastel: '柔和',
        colorMono: '單色',
        colorWarm: '暖色調',
        colorCool: '冷色調',
        complexityLabel: '複雜度',
        simple: '簡約',
        complex: '複雜',
        brushSizeLabel: '筆觸大小',
        fine: '細緻',
        bold: '粗獷',
        generateBtn: '生成藝術作品',
        generating: '創作中...',
        downloadBtn: '下載 PNG',
        randomizeBtn: '隨機靈感',
        timeUsed: '創作時間',
        styleApplied: '風格',
        complexityUsed: '複雜度',
        howItWorks: '功能特色',
        feature1: '經典風格',
        feature1Desc: '印象派、立體派、普普藝術等風格',
        feature2: '筆觸控制',
        feature2Desc: '調整筆觸大小和複雜度',
        feature3: '隱私保護',
        feature3Desc: '所有處理在瀏覽器本地完成',
        feature4: '色彩方案',
        feature4Desc: '多種配色風格供選擇',
        backToHome: '返回首頁',
        toolNumber: '工具 #505',
        copyright: 'Awesome AI Local Tools © 2024'
    },
    'en': {
        title: 'AI Art Style Generator',
        subtitle: 'Select art style to create unique AI artworks',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        controlsTitle: 'Art Parameters',
        styleLabel: 'Art Style',
        styleImpressionist: 'Impressionist',
        styleCubist: 'Cubist',
        stylePopart: 'Pop Art',
        styleWatercolor: 'Watercolor',
        subjectLabel: 'Subject Description',
        subjectPlaceholder: 'Describe the subject you want to create, e.g., sunflowers in a vase...',
        colorSchemeLabel: 'Color Scheme',
        colorVibrant: 'Vibrant',
        colorPastel: 'Pastel',
        colorMono: 'Monochrome',
        colorWarm: 'Warm Tones',
        colorCool: 'Cool Tones',
        complexityLabel: 'Complexity',
        simple: 'Simple',
        complex: 'Complex',
        brushSizeLabel: 'Brush Size',
        fine: 'Fine',
        bold: 'Bold',
        generateBtn: 'Generate Artwork',
        generating: 'Creating...',
        downloadBtn: 'Download PNG',
        randomizeBtn: 'Random Inspiration',
        timeUsed: 'Creation Time',
        styleApplied: 'Style',
        complexityUsed: 'Complexity',
        howItWorks: 'Features',
        feature1: 'Classic Styles',
        feature1Desc: 'Impressionist, Cubist, Pop Art and more',
        feature2: 'Brush Control',
        feature2Desc: 'Adjust brush size and complexity',
        feature3: 'Privacy Protected',
        feature3Desc: 'All processing done locally in browser',
        feature4: 'Color Schemes',
        feature4Desc: 'Multiple color palettes to choose from',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #505',
        copyright: 'Awesome AI Local Tools © 2024'
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

// Color palettes
const colorSchemes = {
    vibrant: ['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3', '#f38181', '#6c5ce7', '#a8e6cf'],
    pastel: ['#ffeaa7', '#dfe6e9', '#fdcb6e', '#fab1a0', '#81ecec', '#a29bfe', '#ffecd2'],
    monochrome: ['#2d3436', '#636e72', '#b2bec3', '#dfe6e9', '#74b9ff', '#a4b0be'],
    warm: ['#e74c3c', '#e67e22', '#f1c40f', '#d35400', '#c0392b', '#f39c12', '#e55039'],
    cool: ['#3498db', '#2980b9', '#1abc9c', '#16a085', '#9b59b6', '#8e44ad', '#74b9ff']
};

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

    randomFromArray(arr) {
        return arr[Math.floor(this.random() * arr.length)];
    }
}

// Draw impressionist style
function drawImpressionist(ctx, width, height, colors, complexity, brushSize, rng) {
    // Background
    ctx.fillStyle = rng.randomFromArray(colors);
    ctx.fillRect(0, 0, width, height);

    const strokeCount = complexity * 500;
    const baseSize = brushSize * 3;

    for (let i = 0; i < strokeCount; i++) {
        const x = rng.randomFloat(0, width);
        const y = rng.randomFloat(0, height);
        const size = rng.randomFloat(baseSize * 0.5, baseSize * 2);
        const angle = rng.randomFloat(0, Math.PI * 2);

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        const color = rng.randomFromArray(colors);
        ctx.fillStyle = color;
        ctx.globalAlpha = rng.randomFloat(0.3, 0.8);

        // Short brush strokes
        ctx.beginPath();
        ctx.ellipse(0, 0, size, size * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // Add some focal points
    const focalCount = Math.floor(complexity / 2) + 2;
    for (let i = 0; i < focalCount; i++) {
        const fx = rng.randomFloat(width * 0.2, width * 0.8);
        const fy = rng.randomFloat(height * 0.2, height * 0.8);
        const fSize = rng.randomFloat(50, 100);

        for (let j = 0; j < 50; j++) {
            const sx = fx + rng.randomFloat(-fSize, fSize);
            const sy = fy + rng.randomFloat(-fSize, fSize);
            const ss = rng.randomFloat(baseSize * 0.3, baseSize);

            ctx.fillStyle = rng.randomFromArray(colors);
            ctx.globalAlpha = rng.randomFloat(0.4, 0.9);
            ctx.beginPath();
            ctx.ellipse(sx, sy, ss, ss * 0.4, rng.randomFloat(0, Math.PI), 0, Math.PI * 2);
            ctx.fill();
        }
    }

    ctx.globalAlpha = 1;
}

// Draw cubist style
function drawCubist(ctx, width, height, colors, complexity, brushSize, rng) {
    // Background
    ctx.fillStyle = colors[0];
    ctx.fillRect(0, 0, width, height);

    const shapeCount = complexity * 30;

    for (let i = 0; i < shapeCount; i++) {
        const x = rng.randomFloat(0, width);
        const y = rng.randomFloat(0, height);
        const size = rng.randomFloat(30, 150) * (brushSize / 5);
        const rotation = rng.randomFloat(0, Math.PI * 2);

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);

        ctx.fillStyle = rng.randomFromArray(colors);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.globalAlpha = rng.randomFloat(0.5, 0.9);

        const sides = rng.randomInt(3, 6);
        ctx.beginPath();

        for (let j = 0; j < sides; j++) {
            const angle = (j / sides) * Math.PI * 2;
            const px = Math.cos(angle) * size * rng.randomFloat(0.5, 1);
            const py = Math.sin(angle) * size * rng.randomFloat(0.5, 1);
            if (j === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Add internal lines
        if (rng.random() > 0.5) {
            ctx.beginPath();
            ctx.moveTo(rng.randomFloat(-size / 2, size / 2), rng.randomFloat(-size / 2, size / 2));
            ctx.lineTo(rng.randomFloat(-size / 2, size / 2), rng.randomFloat(-size / 2, size / 2));
            ctx.stroke();
        }

        ctx.restore();
    }

    // Add fragmentation lines
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i < complexity * 10; i++) {
        ctx.beginPath();
        ctx.moveTo(rng.randomFloat(0, width), rng.randomFloat(0, height));
        ctx.lineTo(rng.randomFloat(0, width), rng.randomFloat(0, height));
        ctx.stroke();
    }

    ctx.globalAlpha = 1;
}

// Draw pop art style
function drawPopArt(ctx, width, height, colors, complexity, brushSize, rng) {
    // Grid background
    const gridSize = Math.floor(width / (complexity + 2));

    for (let x = 0; x < width; x += gridSize) {
        for (let y = 0; y < height; y += gridSize) {
            ctx.fillStyle = rng.randomFromArray(colors);
            ctx.fillRect(x, y, gridSize, gridSize);
        }
    }

    // Ben-Day dots pattern
    const dotSpacing = brushSize * 3;
    ctx.globalAlpha = 0.3;
    for (let x = 0; x < width; x += dotSpacing) {
        for (let y = 0; y < height; y += dotSpacing) {
            ctx.fillStyle = rng.random() > 0.5 ? '#000' : '#fff';
            ctx.beginPath();
            ctx.arc(x, y, dotSpacing * 0.2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    ctx.globalAlpha = 1;

    // Bold shapes
    const shapeCount = Math.floor(complexity * 3);
    for (let i = 0; i < shapeCount; i++) {
        const x = rng.randomFloat(50, width - 50);
        const y = rng.randomFloat(50, height - 50);
        const size = rng.randomFloat(40, 120) * (brushSize / 5);

        ctx.fillStyle = rng.randomFromArray(colors);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;

        const shapeType = rng.randomInt(0, 2);
        ctx.beginPath();

        switch (shapeType) {
            case 0: // Circle
                ctx.arc(x, y, size, 0, Math.PI * 2);
                break;
            case 1: // Star
                for (let j = 0; j < 10; j++) {
                    const angle = (j / 10) * Math.PI * 2 - Math.PI / 2;
                    const radius = j % 2 === 0 ? size : size * 0.5;
                    const px = x + Math.cos(angle) * radius;
                    const py = y + Math.sin(angle) * radius;
                    if (j === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                break;
            case 2: // Diamond
                ctx.moveTo(x, y - size);
                ctx.lineTo(x + size, y);
                ctx.lineTo(x, y + size);
                ctx.lineTo(x - size, y);
                ctx.closePath();
                break;
        }

        ctx.fill();
        ctx.stroke();
    }

    // Add bold outlines/comic effects
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    for (let i = 0; i < complexity; i++) {
        const x = rng.randomFloat(0, width);
        const y = rng.randomFloat(0, height);

        ctx.beginPath();
        ctx.moveTo(x, y);
        for (let j = 0; j < 4; j++) {
            ctx.lineTo(
                x + rng.randomFloat(-100, 100),
                y + rng.randomFloat(-100, 100)
            );
        }
        ctx.stroke();
    }
}

// Draw watercolor style
function drawWatercolor(ctx, width, height, colors, complexity, brushSize, rng) {
    // Soft background wash
    const bgGradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, width
    );
    bgGradient.addColorStop(0, '#fefefe');
    bgGradient.addColorStop(1, '#f5f5f0');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Watercolor washes
    const washCount = complexity * 5;

    for (let i = 0; i < washCount; i++) {
        const x = rng.randomFloat(0, width);
        const y = rng.randomFloat(0, height);
        const size = rng.randomFloat(80, 200) * (brushSize / 5);

        const color = rng.randomFromArray(colors);
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);

        // Parse color and make it translucent
        gradient.addColorStop(0, color.replace(')', ', 0.4)').replace('rgb', 'rgba'));
        gradient.addColorStop(0.5, color.replace(')', ', 0.2)').replace('rgb', 'rgba'));
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = gradient;

        // Organic blob shape
        ctx.beginPath();
        const points = rng.randomInt(6, 12);
        for (let j = 0; j <= points; j++) {
            const angle = (j / points) * Math.PI * 2;
            const radius = size * (0.5 + rng.random() * 0.5);
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;

            if (j === 0) {
                ctx.moveTo(px, py);
            } else {
                const cpAngle = angle - Math.PI / points;
                const cpRadius = radius * (0.8 + rng.random() * 0.4);
                const cpx = x + Math.cos(cpAngle) * cpRadius;
                const cpy = y + Math.sin(cpAngle) * cpRadius;
                ctx.quadraticCurveTo(cpx, cpy, px, py);
            }
        }
        ctx.closePath();
        ctx.fill();
    }

    // Add color bleeds at edges
    for (let i = 0; i < complexity * 10; i++) {
        const x = rng.randomFloat(0, width);
        const y = rng.randomFloat(0, height);
        const size = rng.randomFloat(20, 60);

        ctx.globalAlpha = rng.randomFloat(0.1, 0.3);
        ctx.fillStyle = rng.randomFromArray(colors);

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }

    // Add subtle pigment granulation
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        if (rng.random() > 0.95) {
            const darken = rng.randomInt(-20, 0);
            data[i] = Math.max(0, data[i] + darken);
            data[i + 1] = Math.max(0, data[i + 1] + darken);
            data[i + 2] = Math.max(0, data[i + 2] + darken);
        }
    }
    ctx.putImageData(imageData, 0, 0);

    ctx.globalAlpha = 1;
}

// Main draw function
function drawArt(canvas, params) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const { style, colorScheme, complexity, brushSize, subject } = params;
    const colors = colorSchemes[colorScheme];

    // Create seed from subject text
    let seed = 12345;
    if (subject) {
        for (let i = 0; i < subject.length; i++) {
            seed = ((seed << 5) - seed) + subject.charCodeAt(i);
            seed = seed & seed;
        }
    }
    seed = Math.abs(seed);

    const rng = new SeededRNG(seed);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw based on style
    switch (style) {
        case 'impressionist':
            drawImpressionist(ctx, width, height, colors, complexity, brushSize, rng);
            break;
        case 'cubist':
            drawCubist(ctx, width, height, colors, complexity, brushSize, rng);
            break;
        case 'popart':
            drawPopArt(ctx, width, height, colors, complexity, brushSize, rng);
            break;
        case 'watercolor':
            drawWatercolor(ctx, width, height, colors, complexity, brushSize, rng);
            break;
    }

    // Add subtle texture overlay
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    for (let i = 0; i < 1000; i++) {
        ctx.fillRect(rng.randomFloat(0, width), rng.randomFloat(0, height), 2, 2);
    }
    ctx.globalCompositeOperation = 'source-over';
}

function getParams() {
    return {
        style: document.querySelector('input[name="style"]:checked').value,
        colorScheme: document.getElementById('colorSchemeSelect').value,
        complexity: parseInt(document.getElementById('complexitySlider').value),
        brushSize: parseInt(document.getElementById('brushSlider').value),
        subject: document.getElementById('subjectInput').value.trim()
    };
}

function randomizeParams() {
    const styles = ['impressionist', 'cubist', 'popart', 'watercolor'];
    const colorSchemes = ['vibrant', 'pastel', 'monochrome', 'warm', 'cool'];
    const subjects = [
        'Sunflowers in a vase',
        'City at night',
        'Dancing figures',
        'Abstract emotions',
        'Ocean waves',
        'Mountain landscape',
        'Portrait of a dream',
        'Starry sky'
    ];

    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    document.querySelector(`input[name="style"][value="${randomStyle}"]`).checked = true;

    document.getElementById('colorSchemeSelect').value = colorSchemes[Math.floor(Math.random() * colorSchemes.length)];
    document.getElementById('complexitySlider').value = Math.floor(Math.random() * 10) + 1;
    document.getElementById('brushSlider').value = Math.floor(Math.random() * 10) + 1;
    document.getElementById('subjectInput').value = subjects[Math.floor(Math.random() * subjects.length)];

    document.getElementById('complexityValue').textContent = document.getElementById('complexitySlider').value;
    document.getElementById('brushValue').textContent = document.getElementById('brushSlider').value;
}

function init() {
    const browserLang = navigator.language;
    setLanguage(browserLang.startsWith('zh') ? 'zh-TW' : 'en');

    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    // Slider value updates
    document.getElementById('complexitySlider').addEventListener('input', (e) => {
        document.getElementById('complexityValue').textContent = e.target.value;
    });

    document.getElementById('brushSlider').addEventListener('input', (e) => {
        document.getElementById('brushValue').textContent = e.target.value;
    });

    // Generate button
    document.getElementById('generateBtn').addEventListener('click', () => {
        const btn = document.getElementById('generateBtn');
        const overlay = document.getElementById('canvasOverlay');
        const canvas = document.getElementById('artCanvas');

        btn.disabled = true;
        btn.querySelector('span').textContent = t('generating');
        overlay.classList.add('active');

        const startTime = performance.now();
        const params = getParams();

        setTimeout(() => {
            drawArt(canvas, params);

            const endTime = performance.now();
            const duration = ((endTime - startTime) / 1000).toFixed(2);

            overlay.classList.remove('active');
            btn.disabled = false;
            btn.querySelector('span').textContent = t('generateBtn');

            document.getElementById('downloadBtn').disabled = false;

            // Update stats
            const styleNames = {
                impressionist: t('styleImpressionist'),
                cubist: t('styleCubist'),
                popart: t('stylePopart'),
                watercolor: t('styleWatercolor')
            };

            const stats = document.getElementById('outputStats');
            stats.style.display = 'flex';
            stats.innerHTML = `
                <span><span class="label">${t('timeUsed')}:</span> <span class="value">${duration}s</span></span>
                <span><span class="label">${t('styleApplied')}:</span> <span class="value">${styleNames[params.style]}</span></span>
                <span><span class="label">${t('complexityUsed')}:</span> <span class="value">${params.complexity}/10</span></span>
            `;
        }, 500);
    });

    // Download button
    document.getElementById('downloadBtn').addEventListener('click', () => {
        const canvas = document.getElementById('artCanvas');
        const link = document.createElement('a');
        link.download = `art-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    });

    // Randomize button
    document.getElementById('randomizeBtn').addEventListener('click', () => {
        randomizeParams();
        document.getElementById('generateBtn').click();
    });

    // Initial canvas state
    const canvas = document.getElementById('artCanvas');
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#1e293b');
    gradient.addColorStop(1, '#0f172a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#64748b';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(currentLang === 'zh-TW' ? '點擊「生成藝術作品」開始' : 'Click "Generate Artwork" to start', canvas.width / 2, canvas.height / 2);
}

init();
