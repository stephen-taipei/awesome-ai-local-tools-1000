/**
 * Pattern Generator - Tool #510
 * Awesome AI Local Tools
 *
 * Local seamless pattern generation
 */

// ========================================
// Internationalization (i18n)
// ========================================

const translations = {
    'zh-TW': {
        title: 'Pattern 生成器',
        subtitle: '智能圖案設計，本地處理保護隱私',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        patternTypeLabel: '圖案類型',
        patternGeometric: '幾何圖形',
        patternFloral: '花卉',
        patternAbstract: '抽象',
        patternDots: '圓點',
        patternLines: '線條',
        patternWaves: '波浪',
        patternChevron: '人字紋',
        patternMosaic: '馬賽克',
        tileSizeLabel: '磁貼尺寸',
        colorsLabel: '配色方案',
        color1: '顏色 1',
        color2: '顏色 2',
        color3: '顏色 3',
        randomColors: '隨機配色',
        densityLabel: '密度',
        rotationLabel: '旋轉角度',
        generateBtn: '生成圖案',
        generating: '生成中...',
        processing: 'AI 正在生成圖案...',
        previewTitle: '圖案預覽',
        tilePreview: '單一磁貼',
        patternPreview: '重複效果',
        outputTitle: '生成結果',
        downloadTile: '下載磁貼',
        downloadPattern: '下載圖案',
        tileSize: '磁貼尺寸',
        repeatCount: '重複次數',
        patternType: '圖案類型',
        howItWorks: '功能特色',
        feature1: '多種圖案',
        feature1Desc: '支援幾何、花卉、抽象等多種圖案類型',
        feature2: '無縫銜接',
        feature2Desc: '生成可無縫重複的磁貼圖案',
        feature3: '隱私保護',
        feature3Desc: '所有處理在瀏覽器本地完成',
        feature4: '隨機配色',
        feature4Desc: '一鍵生成隨機和諧配色方案',
        backToHome: '返回首頁',
        toolNumber: '工具 #510',
        copyright: 'Awesome AI Local Tools © 2024'
    },
    'en': {
        title: 'Pattern Generator',
        subtitle: 'AI-powered pattern design, processed locally',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        patternTypeLabel: 'Pattern Type',
        patternGeometric: 'Geometric',
        patternFloral: 'Floral',
        patternAbstract: 'Abstract',
        patternDots: 'Dots',
        patternLines: 'Lines',
        patternWaves: 'Waves',
        patternChevron: 'Chevron',
        patternMosaic: 'Mosaic',
        tileSizeLabel: 'Tile Size',
        colorsLabel: 'Color Scheme',
        color1: 'Color 1',
        color2: 'Color 2',
        color3: 'Color 3',
        randomColors: 'Random',
        densityLabel: 'Density',
        rotationLabel: 'Rotation',
        generateBtn: 'Generate Pattern',
        generating: 'Generating...',
        processing: 'AI is generating pattern...',
        previewTitle: 'Pattern Preview',
        tilePreview: 'Single Tile',
        patternPreview: 'Repeat Effect',
        outputTitle: 'Generated Result',
        downloadTile: 'Download Tile',
        downloadPattern: 'Download Pattern',
        tileSize: 'Tile Size',
        repeatCount: 'Repeat Count',
        patternType: 'Pattern Type',
        howItWorks: 'Features',
        feature1: 'Multiple Patterns',
        feature1Desc: 'Support geometric, floral, abstract and more',
        feature2: 'Seamless Tiles',
        feature2Desc: 'Generate seamlessly repeating tile patterns',
        feature3: 'Privacy Protected',
        feature3Desc: 'All processing done locally in browser',
        feature4: 'Random Colors',
        feature4Desc: 'One-click random harmonious color schemes',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #510',
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
// Pattern Drawing Functions
// ========================================

function generatePattern(type, tileSize, colors, density, rotation) {
    const tileCanvas = document.getElementById('tileCanvas');
    const patternCanvas = document.getElementById('patternCanvas');
    const tileCtx = tileCanvas.getContext('2d');
    const patternCtx = patternCanvas.getContext('2d');

    // Set tile canvas size
    tileCanvas.width = tileSize;
    tileCanvas.height = tileSize;

    // Clear canvases
    tileCtx.clearRect(0, 0, tileSize, tileSize);
    patternCtx.clearRect(0, 0, 400, 400);

    // Draw tile based on type
    drawTile(tileCtx, type, tileSize, colors, density);

    // Create pattern from tile
    const repeatX = Math.ceil(400 / tileSize);
    const repeatY = Math.ceil(400 / tileSize);

    patternCtx.save();
    patternCtx.translate(200, 200);
    patternCtx.rotate(rotation * Math.PI / 180);
    patternCtx.translate(-200, -200);

    for (let y = -1; y <= repeatY; y++) {
        for (let x = -1; x <= repeatX; x++) {
            patternCtx.drawImage(tileCanvas, x * tileSize, y * tileSize);
        }
    }

    patternCtx.restore();

    return {
        tileSize: `${tileSize}x${tileSize}`,
        repeatCount: repeatX * repeatY,
        patternType: t('pattern' + type.charAt(0).toUpperCase() + type.slice(1))
    };
}

function drawTile(ctx, type, size, colors, density) {
    const [color1, color2, color3] = colors;

    // Fill background
    ctx.fillStyle = color2;
    ctx.fillRect(0, 0, size, size);

    switch (type) {
        case 'geometric':
            drawGeometric(ctx, size, colors, density);
            break;
        case 'floral':
            drawFloral(ctx, size, colors, density);
            break;
        case 'abstract':
            drawAbstract(ctx, size, colors, density);
            break;
        case 'dots':
            drawDots(ctx, size, colors, density);
            break;
        case 'lines':
            drawLines(ctx, size, colors, density);
            break;
        case 'waves':
            drawWaves(ctx, size, colors, density);
            break;
        case 'chevron':
            drawChevron(ctx, size, colors, density);
            break;
        case 'mosaic':
            drawMosaic(ctx, size, colors, density);
            break;
    }
}

function drawGeometric(ctx, size, colors, density) {
    const [color1, color2, color3] = colors;
    const shapes = Math.floor(density * 1.5);
    const shapeSize = size / (shapes + 1);

    ctx.fillStyle = color1;
    ctx.strokeStyle = color3;
    ctx.lineWidth = 2;

    // Draw triangles pattern
    for (let y = 0; y <= shapes; y++) {
        for (let x = 0; x <= shapes; x++) {
            const cx = x * shapeSize + shapeSize / 2;
            const cy = y * shapeSize + shapeSize / 2;
            const isEven = (x + y) % 2 === 0;

            ctx.beginPath();
            if (isEven) {
                ctx.moveTo(cx, cy - shapeSize / 3);
                ctx.lineTo(cx + shapeSize / 3, cy + shapeSize / 3);
                ctx.lineTo(cx - shapeSize / 3, cy + shapeSize / 3);
            } else {
                ctx.moveTo(cx, cy + shapeSize / 3);
                ctx.lineTo(cx + shapeSize / 3, cy - shapeSize / 3);
                ctx.lineTo(cx - shapeSize / 3, cy - shapeSize / 3);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
    }
}

function drawFloral(ctx, size, colors, density) {
    const [color1, color2, color3] = colors;
    const petals = 6;
    const flowerSize = size / (density / 2 + 1);

    // Draw flower at center
    drawFlower(ctx, size / 2, size / 2, flowerSize * 0.4, color1, color3, petals);

    // Draw partial flowers at corners for seamless tiling
    drawFlower(ctx, 0, 0, flowerSize * 0.3, color1, color3, petals);
    drawFlower(ctx, size, 0, flowerSize * 0.3, color1, color3, petals);
    drawFlower(ctx, 0, size, flowerSize * 0.3, color1, color3, petals);
    drawFlower(ctx, size, size, flowerSize * 0.3, color1, color3, petals);

    // Draw small flowers at edges for seamless tiling
    drawFlower(ctx, size / 2, 0, flowerSize * 0.2, color3, color1, petals);
    drawFlower(ctx, size / 2, size, flowerSize * 0.2, color3, color1, petals);
    drawFlower(ctx, 0, size / 2, flowerSize * 0.2, color3, color1, petals);
    drawFlower(ctx, size, size / 2, flowerSize * 0.2, color3, color1, petals);
}

function drawFlower(ctx, x, y, radius, petalColor, centerColor, petals) {
    ctx.fillStyle = petalColor;

    // Draw petals
    for (let i = 0; i < petals; i++) {
        const angle = (Math.PI * 2 / petals) * i;
        ctx.beginPath();
        ctx.ellipse(
            x + Math.cos(angle) * radius * 0.5,
            y + Math.sin(angle) * radius * 0.5,
            radius * 0.6,
            radius * 0.3,
            angle,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }

    // Draw center
    ctx.fillStyle = centerColor;
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.3, 0, Math.PI * 2);
    ctx.fill();
}

function drawAbstract(ctx, size, colors, density) {
    const [color1, color2, color3] = colors;
    const shapes = density + 2;

    for (let i = 0; i < shapes; i++) {
        const x = (Math.random() * size * 2 - size / 2) % size;
        const y = (Math.random() * size * 2 - size / 2) % size;
        const r = size / (density + 3) * (0.5 + Math.random());

        ctx.fillStyle = i % 2 === 0 ? color1 : color3;
        ctx.globalAlpha = 0.6;

        ctx.beginPath();
        if (i % 3 === 0) {
            ctx.arc(x, y, r, 0, Math.PI * 2);
        } else if (i % 3 === 1) {
            ctx.rect(x - r / 2, y - r / 2, r, r);
        } else {
            ctx.moveTo(x, y - r);
            ctx.lineTo(x + r, y + r);
            ctx.lineTo(x - r, y + r);
            ctx.closePath();
        }
        ctx.fill();

        // Draw at opposite corner for seamless tiling
        ctx.beginPath();
        if (i % 3 === 0) {
            ctx.arc(x + size, y + size, r, 0, Math.PI * 2);
        }
        ctx.fill();
    }

    ctx.globalAlpha = 1;
}

function drawDots(ctx, size, colors, density) {
    const [color1, color2, color3] = colors;
    const cols = density + 2;
    const rows = density + 2;
    const spacing = size / cols;
    const dotRadius = spacing * 0.25;

    ctx.fillStyle = color1;

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const offsetX = y % 2 === 0 ? 0 : spacing / 2;
            const cx = x * spacing + spacing / 2 + offsetX;
            const cy = y * spacing + spacing / 2;

            ctx.beginPath();
            ctx.arc(cx % size, cy % size, dotRadius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Accent dots
    ctx.fillStyle = color3;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, dotRadius * 0.6, 0, Math.PI * 2);
    ctx.fill();
}

function drawLines(ctx, size, colors, density) {
    const [color1, color2, color3] = colors;
    const lineCount = density + 3;
    const spacing = size / lineCount;

    ctx.strokeStyle = color1;
    ctx.lineWidth = spacing * 0.3;

    // Diagonal lines
    for (let i = -lineCount; i <= lineCount * 2; i++) {
        ctx.beginPath();
        ctx.moveTo(i * spacing, 0);
        ctx.lineTo(i * spacing + size, size);
        ctx.stroke();
    }

    // Cross lines
    ctx.strokeStyle = color3;
    ctx.lineWidth = spacing * 0.15;

    for (let i = -lineCount; i <= lineCount * 2; i++) {
        ctx.beginPath();
        ctx.moveTo(i * spacing + size, 0);
        ctx.lineTo(i * spacing, size);
        ctx.stroke();
    }
}

function drawWaves(ctx, size, colors, density) {
    const [color1, color2, color3] = colors;
    const waveCount = density + 2;
    const waveHeight = size / waveCount;
    const amplitude = waveHeight * 0.4;

    ctx.strokeStyle = color1;
    ctx.lineWidth = waveHeight * 0.3;

    for (let y = 0; y <= waveCount + 1; y++) {
        ctx.beginPath();
        for (let x = 0; x <= size; x += 2) {
            const yPos = y * waveHeight + Math.sin(x / size * Math.PI * 4) * amplitude;
            if (x === 0) {
                ctx.moveTo(x, yPos);
            } else {
                ctx.lineTo(x, yPos);
            }
        }
        ctx.stroke();
    }

    // Secondary waves
    ctx.strokeStyle = color3;
    ctx.lineWidth = waveHeight * 0.15;

    for (let y = 0; y <= waveCount + 1; y++) {
        ctx.beginPath();
        for (let x = 0; x <= size; x += 2) {
            const yPos = (y + 0.5) * waveHeight + Math.cos(x / size * Math.PI * 4) * amplitude * 0.5;
            if (x === 0) {
                ctx.moveTo(x, yPos);
            } else {
                ctx.lineTo(x, yPos);
            }
        }
        ctx.stroke();
    }
}

function drawChevron(ctx, size, colors, density) {
    const [color1, color2, color3] = colors;
    const rows = density + 3;
    const rowHeight = size / rows;

    for (let y = 0; y <= rows; y++) {
        ctx.fillStyle = y % 2 === 0 ? color1 : color3;

        ctx.beginPath();
        ctx.moveTo(0, y * rowHeight);
        ctx.lineTo(size / 2, y * rowHeight + rowHeight / 2);
        ctx.lineTo(size, y * rowHeight);
        ctx.lineTo(size, y * rowHeight + rowHeight);
        ctx.lineTo(size / 2, y * rowHeight + rowHeight / 2 + rowHeight);
        ctx.lineTo(0, y * rowHeight + rowHeight);
        ctx.closePath();
        ctx.fill();
    }
}

function drawMosaic(ctx, size, colors, density) {
    const [color1, color2, color3] = colors;
    const gridSize = density + 3;
    const cellSize = size / gridSize;

    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const colorChoice = (x + y) % 3;
            ctx.fillStyle = colorChoice === 0 ? color1 : colorChoice === 1 ? color2 : color3;

            ctx.fillRect(
                x * cellSize + 1,
                y * cellSize + 1,
                cellSize - 2,
                cellSize - 2
            );
        }
    }
}

// ========================================
// UI Functions
// ========================================

function showProgress() {
    document.getElementById('progressSection').style.display = 'block';
    document.getElementById('canvasSection').style.display = 'none';
    document.getElementById('outputSection').style.display = 'none';

    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    const stages = [
        { progress: 25, text: currentLang === 'zh-TW' ? '分析圖案類型...' : 'Analyzing pattern type...' },
        { progress: 50, text: currentLang === 'zh-TW' ? '生成磁貼...' : 'Generating tile...' },
        { progress: 75, text: currentLang === 'zh-TW' ? '創建重複圖案...' : 'Creating repeat pattern...' },
        { progress: 100, text: currentLang === 'zh-TW' ? '完成!' : 'Complete!' }
    ];

    let stageIndex = 0;
    const interval = setInterval(() => {
        if (stageIndex < stages.length) {
            progressFill.style.width = stages[stageIndex].progress + '%';
            progressText.textContent = stages[stageIndex].text;
            stageIndex++;
        } else {
            clearInterval(interval);
        }
    }, 300);

    return new Promise(resolve => {
        setTimeout(resolve, stages.length * 300 + 200);
    });
}

function updateStats(stats) {
    const statsHtml = `
        <div class="stat-item">
            <span class="stat-label">${t('patternType')}:</span>
            <span class="stat-value">${stats.patternType}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">${t('tileSize')}:</span>
            <span class="stat-value">${stats.tileSize}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">${t('repeatCount')}:</span>
            <span class="stat-value">${stats.repeatCount}</span>
        </div>
    `;
    document.getElementById('outputStats').innerHTML = statsHtml;
}

function randomizeColors() {
    const hue1 = Math.random() * 360;
    const hue2 = (hue1 + 180) % 360;
    const hue3 = (hue1 + 90) % 360;

    document.getElementById('color1').value = hslToHex(hue1, 70, 50);
    document.getElementById('color2').value = hslToHex(hue1, 20, 95);
    document.getElementById('color3').value = hslToHex(hue3, 60, 30);
}

function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

function downloadTile() {
    const canvas = document.getElementById('tileCanvas');
    const link = document.createElement('a');
    link.download = 'pattern-tile.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

function downloadPattern() {
    const canvas = document.getElementById('patternCanvas');
    const link = document.createElement('a');
    link.download = 'pattern.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// ========================================
// Event Handlers
// ========================================

function initEventListeners() {
    // Language switcher
    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    // Range inputs
    const density = document.getElementById('density');
    const densityValue = document.getElementById('densityValue');
    density.addEventListener('input', () => {
        densityValue.textContent = density.value;
    });

    const rotation = document.getElementById('rotation');
    const rotationValue = document.getElementById('rotationValue');
    rotation.addEventListener('input', () => {
        rotationValue.textContent = rotation.value;
    });

    // Random colors button
    document.getElementById('randomColorsBtn').addEventListener('click', randomizeColors);

    // Generate button
    document.getElementById('generateBtn').addEventListener('click', async () => {
        const btn = document.getElementById('generateBtn');
        btn.disabled = true;
        btn.querySelector('span').textContent = t('generating');

        await showProgress();

        const type = document.getElementById('patternType').value;
        const tileSize = parseInt(document.getElementById('tileSize').value);
        const colors = [
            document.getElementById('color1').value,
            document.getElementById('color2').value,
            document.getElementById('color3').value
        ];
        const densityVal = parseInt(document.getElementById('density').value);
        const rotationVal = parseInt(document.getElementById('rotation').value);

        const stats = generatePattern(type, tileSize, colors, densityVal, rotationVal);

        document.getElementById('progressSection').style.display = 'none';
        document.getElementById('canvasSection').style.display = 'block';
        document.getElementById('outputSection').style.display = 'block';

        updateStats(stats);

        btn.disabled = false;
        btn.querySelector('span').textContent = t('generateBtn');

        document.getElementById('canvasSection').scrollIntoView({ behavior: 'smooth' });
    });

    // Download buttons
    document.getElementById('downloadTileBtn').addEventListener('click', downloadTile);
    document.getElementById('downloadPatternBtn').addEventListener('click', downloadPattern);
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
    console.log('Pattern Generator initialized - Tool #510');
}

init();
