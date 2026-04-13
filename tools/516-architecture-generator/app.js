/**
 * Architecture Generator - Tool #516
 * Awesome AI Local Tools
 *
 * Local architectural silhouette generation
 */

// ========================================
// Internationalization (i18n)
// ========================================

const translations = {
    'zh-TW': {
        title: '建築生成器',
        subtitle: '智能建築設計，本地處理保護隱私',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        buildingTypeLabel: '建築類型',
        buildingHouse: '住宅',
        buildingOffice: '辦公大樓',
        buildingSkyscraper: '摩天大樓',
        buildingTemple: '寺廟',
        styleLabel: '建築風格',
        styleModern: '現代風格',
        styleClassic: '古典風格',
        styleFuturistic: '未來風格',
        floorsLabel: '樓層數',
        widthLabel: '寬度',
        colorsLabel: '配色方案',
        colorMain: '主色',
        colorAccent: '強調色',
        colorSky: '天空色',
        generateBtn: '生成建築',
        generating: '生成中...',
        processing: 'AI 正在生成建築...',
        previewTitle: '建築預覽',
        outputTitle: '生成結果',
        downloadPng: '下載 PNG',
        downloadSvg: '下載 SVG',
        statType: '建築類型',
        statStyle: '建築風格',
        statFloors: '樓層數',
        howItWorks: '功能特色',
        feature1: '多種建築',
        feature1Desc: '支援住宅、辦公室、摩天樓等類型',
        feature2: '風格多樣',
        feature2Desc: '現代、古典、未來等風格選擇',
        feature3: '隱私保護',
        feature3Desc: '所有處理在瀏覽器本地完成',
        feature4: '參數控制',
        feature4Desc: '自訂樓層數與建築寬度',
        backToHome: '返回首頁',
        toolNumber: '工具 #516',
        copyright: 'Awesome AI Local Tools © 2024'
    },
    'en': {
        title: 'Architecture Generator',
        subtitle: 'AI-powered architecture design, processed locally',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        buildingTypeLabel: 'Building Type',
        buildingHouse: 'House',
        buildingOffice: 'Office Building',
        buildingSkyscraper: 'Skyscraper',
        buildingTemple: 'Temple',
        styleLabel: 'Architecture Style',
        styleModern: 'Modern',
        styleClassic: 'Classic',
        styleFuturistic: 'Futuristic',
        floorsLabel: 'Floors',
        widthLabel: 'Width',
        colorsLabel: 'Color Scheme',
        colorMain: 'Main Color',
        colorAccent: 'Accent',
        colorSky: 'Sky Color',
        generateBtn: 'Generate Architecture',
        generating: 'Generating...',
        processing: 'AI is generating architecture...',
        previewTitle: 'Architecture Preview',
        outputTitle: 'Generated Result',
        downloadPng: 'Download PNG',
        downloadSvg: 'Download SVG',
        statType: 'Building Type',
        statStyle: 'Style',
        statFloors: 'Floors',
        howItWorks: 'Features',
        feature1: 'Multiple Buildings',
        feature1Desc: 'Support house, office, skyscraper and more',
        feature2: 'Various Styles',
        feature2Desc: 'Modern, classic, futuristic style options',
        feature3: 'Privacy Protected',
        feature3Desc: 'All processing done locally in browser',
        feature4: 'Parameter Control',
        feature4Desc: 'Customize floors and building width',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #516',
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
// Architecture Drawing Functions
// ========================================

function generateArchitecture(type, style, floors, width, colors) {
    const canvas = document.getElementById('mainCanvas');
    const ctx = canvas.getContext('2d');
    const [colorMain, colorAccent, colorSky] = colors;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGradient.addColorStop(0, colorSky);
    skyGradient.addColorStop(1, lightenColor(colorSky, 20));
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw ground
    ctx.fillStyle = darkenColor(colorSky, 10);
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);

    // Calculate building dimensions
    const buildingWidth = 80 + width * 30;
    const buildingHeight = Math.min(floors * 15 + 50, canvas.height - 80);
    const startX = (canvas.width - buildingWidth) / 2;
    const startY = canvas.height - 50 - buildingHeight;

    // Draw building based on type and style
    switch (type) {
        case 'house':
            drawHouse(ctx, startX, startY, buildingWidth, buildingHeight, style, colors, floors);
            break;
        case 'office':
            drawOffice(ctx, startX, startY, buildingWidth, buildingHeight, style, colors, floors);
            break;
        case 'skyscraper':
            drawSkyscraper(ctx, startX, startY, buildingWidth, buildingHeight, style, colors, floors);
            break;
        case 'temple':
            drawTemple(ctx, startX, startY, buildingWidth, buildingHeight, style, colors, floors);
            break;
    }

    return {
        type: t('building' + type.charAt(0).toUpperCase() + type.slice(1)),
        style: t('style' + style.charAt(0).toUpperCase() + style.slice(1)),
        floors: floors
    };
}

function drawHouse(ctx, x, y, w, h, style, colors, floors) {
    const [colorMain, colorAccent] = colors;

    // Adjust for house proportions
    const houseHeight = Math.min(h, 200);
    const roofHeight = houseHeight * 0.35;
    const bodyY = y + (h - houseHeight) + roofHeight;
    const bodyHeight = houseHeight - roofHeight;

    // Draw house body
    ctx.fillStyle = colorMain;
    ctx.fillRect(x, bodyY, w, bodyHeight);

    // Draw roof based on style
    ctx.fillStyle = colorAccent;
    ctx.beginPath();
    if (style === 'modern') {
        // Flat roof with slight overhang
        ctx.rect(x - 10, bodyY - 15, w + 20, 20);
    } else if (style === 'classic') {
        // Triangular roof
        ctx.moveTo(x - 15, bodyY);
        ctx.lineTo(x + w / 2, bodyY - roofHeight);
        ctx.lineTo(x + w + 15, bodyY);
        ctx.closePath();
    } else {
        // Futuristic curved roof
        ctx.moveTo(x - 10, bodyY);
        ctx.quadraticCurveTo(x + w / 2, bodyY - roofHeight * 1.5, x + w + 10, bodyY);
        ctx.closePath();
    }
    ctx.fill();

    // Draw windows
    drawWindows(ctx, x, bodyY, w, bodyHeight, style, Math.min(floors, 3), colorAccent);

    // Draw door
    const doorWidth = w * 0.15;
    const doorHeight = bodyHeight * 0.4;
    ctx.fillStyle = darkenColor(colorMain, 20);
    ctx.fillRect(x + w / 2 - doorWidth / 2, bodyY + bodyHeight - doorHeight, doorWidth, doorHeight);

    // Add style-specific details
    if (style === 'futuristic') {
        ctx.strokeStyle = lightenColor(colorAccent, 30);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, bodyY + bodyHeight * 0.5);
        ctx.lineTo(x + w, bodyY + bodyHeight * 0.5);
        ctx.stroke();
    }
}

function drawOffice(ctx, x, y, w, h, style, colors, floors) {
    const [colorMain, colorAccent] = colors;

    // Draw main building body
    ctx.fillStyle = colorMain;
    ctx.fillRect(x, y, w, h);

    // Draw windows grid
    drawWindows(ctx, x, y, w, h, style, floors, colorAccent);

    // Style-specific top
    ctx.fillStyle = colorAccent;
    if (style === 'modern') {
        ctx.fillRect(x, y - 10, w, 15);
    } else if (style === 'classic') {
        // Ornamental top
        ctx.fillRect(x - 5, y - 20, w + 10, 25);
        ctx.fillRect(x + w / 4, y - 35, w / 2, 20);
    } else {
        // Futuristic antenna
        ctx.fillRect(x + w / 2 - 5, y - 40, 10, 45);
        ctx.beginPath();
        ctx.arc(x + w / 2, y - 45, 15, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draw entrance
    const entranceWidth = w * 0.4;
    const entranceHeight = h * 0.1;
    ctx.fillStyle = darkenColor(colorMain, 15);
    ctx.fillRect(x + w / 2 - entranceWidth / 2, y + h - entranceHeight, entranceWidth, entranceHeight);
}

function drawSkyscraper(ctx, x, y, w, h, style, colors, floors) {
    const [colorMain, colorAccent] = colors;

    // Draw tapered building
    const taperAmount = style === 'futuristic' ? 0.3 : 0.15;
    const topWidth = w * (1 - taperAmount);
    const topX = x + (w - topWidth) / 2;

    ctx.fillStyle = colorMain;
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(topX, y);
    ctx.lineTo(topX + topWidth, y);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
    ctx.fill();

    // Draw windows
    const windowRows = Math.min(floors, 30);
    const windowCols = Math.floor(w / 25);
    const windowHeight = (h - 40) / windowRows;
    const windowWidth = 12;

    ctx.fillStyle = colorAccent;
    for (let row = 0; row < windowRows; row++) {
        const rowY = y + 20 + row * windowHeight;
        const rowTaper = (row / windowRows) * (w - topWidth) / 2;
        const rowX = x + rowTaper;
        const rowWidth = w - rowTaper * 2;
        const spacing = rowWidth / (windowCols + 1);

        for (let col = 1; col <= windowCols; col++) {
            const winX = rowX + col * spacing - windowWidth / 2;
            if (style === 'futuristic') {
                ctx.fillRect(winX, rowY, windowWidth, windowHeight * 0.7);
            } else {
                ctx.fillRect(winX, rowY + 3, windowWidth, windowHeight * 0.5);
            }
        }
    }

    // Draw spire
    ctx.fillStyle = colorAccent;
    if (style === 'modern') {
        ctx.fillRect(topX + topWidth / 2 - 8, y - 30, 16, 35);
    } else if (style === 'classic') {
        ctx.beginPath();
        ctx.moveTo(topX + topWidth / 2, y - 60);
        ctx.lineTo(topX + topWidth / 2 - 15, y);
        ctx.lineTo(topX + topWidth / 2 + 15, y);
        ctx.closePath();
        ctx.fill();
    } else {
        ctx.fillRect(topX + topWidth / 2 - 3, y - 80, 6, 85);
        ctx.beginPath();
        ctx.arc(topX + topWidth / 2, y - 85, 10, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawTemple(ctx, x, y, w, h, style, colors, floors) {
    const [colorMain, colorAccent] = colors;

    // Calculate tiers
    const tiers = Math.min(Math.max(floors, 1), 5);
    const tierHeight = h / tiers;

    for (let i = 0; i < tiers; i++) {
        const tierY = y + i * tierHeight;
        const tierWidth = w - i * (w / (tiers + 1));
        const tierX = x + (w - tierWidth) / 2;

        // Draw tier body
        ctx.fillStyle = colorMain;
        ctx.fillRect(tierX, tierY + tierHeight * 0.3, tierWidth, tierHeight * 0.7);

        // Draw roof
        ctx.fillStyle = colorAccent;
        ctx.beginPath();
        if (style === 'modern') {
            ctx.rect(tierX - 10, tierY + tierHeight * 0.2, tierWidth + 20, tierHeight * 0.15);
        } else if (style === 'classic') {
            // Curved Asian-style roof
            ctx.moveTo(tierX - 20, tierY + tierHeight * 0.35);
            ctx.quadraticCurveTo(tierX + tierWidth / 2, tierY - tierHeight * 0.1, tierX + tierWidth + 20, tierY + tierHeight * 0.35);
            ctx.lineTo(tierX + tierWidth + 10, tierY + tierHeight * 0.35);
            ctx.quadraticCurveTo(tierX + tierWidth / 2, tierY + tierHeight * 0.1, tierX - 10, tierY + tierHeight * 0.35);
            ctx.closePath();
        } else {
            // Futuristic floating roof
            ctx.ellipse(tierX + tierWidth / 2, tierY + tierHeight * 0.2, tierWidth / 2 + 15, tierHeight * 0.15, 0, 0, Math.PI * 2);
        }
        ctx.fill();

        // Draw windows/openings
        if (i < tiers - 1) {
            const openings = 3 - Math.floor(i / 2);
            const openingWidth = tierWidth / (openings * 2 + 1);
            ctx.fillStyle = darkenColor(colorMain, 20);
            for (let j = 0; j < openings; j++) {
                const openX = tierX + openingWidth * (j * 2 + 1);
                ctx.fillRect(openX, tierY + tierHeight * 0.5, openingWidth, tierHeight * 0.35);
            }
        }
    }

    // Draw entrance
    const entranceWidth = w * 0.2;
    const entranceHeight = tierHeight * 0.5;
    ctx.fillStyle = darkenColor(colorMain, 25);
    ctx.fillRect(x + w / 2 - entranceWidth / 2, y + h - entranceHeight, entranceWidth, entranceHeight);
}

function drawWindows(ctx, x, y, w, h, style, floors, color) {
    const rows = Math.min(floors, 20);
    const cols = Math.max(Math.floor(w / 30), 2);
    const windowHeight = (h - 30) / rows;
    const windowWidth = (w - 30) / cols;
    const padding = 8;

    ctx.fillStyle = color;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const winX = x + 15 + col * windowWidth + padding / 2;
            const winY = y + 15 + row * windowHeight + padding / 2;
            const winW = windowWidth - padding;
            const winH = windowHeight - padding;

            if (style === 'modern') {
                ctx.fillRect(winX, winY, winW, winH);
            } else if (style === 'classic') {
                // Arched windows
                ctx.beginPath();
                ctx.moveTo(winX, winY + winH);
                ctx.lineTo(winX, winY + winH * 0.3);
                ctx.arc(winX + winW / 2, winY + winH * 0.3, winW / 2, Math.PI, 0);
                ctx.lineTo(winX + winW, winY + winH);
                ctx.closePath();
                ctx.fill();
            } else {
                // Futuristic hexagonal
                ctx.beginPath();
                ctx.moveTo(winX + winW * 0.2, winY);
                ctx.lineTo(winX + winW * 0.8, winY);
                ctx.lineTo(winX + winW, winY + winH * 0.5);
                ctx.lineTo(winX + winW * 0.8, winY + winH);
                ctx.lineTo(winX + winW * 0.2, winY + winH);
                ctx.lineTo(winX, winY + winH * 0.5);
                ctx.closePath();
                ctx.fill();
            }
        }
    }
}

// ========================================
// Color Utility Functions
// ========================================

function lightenColor(hex, percent) {
    const num = parseInt(hex.slice(1), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

function darkenColor(hex, percent) {
    const num = parseInt(hex.slice(1), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
    const B = Math.max(0, (num & 0x0000FF) - amt);
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
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
        { progress: 25, text: currentLang === 'zh-TW' ? '分析建築類型...' : 'Analyzing building type...' },
        { progress: 50, text: currentLang === 'zh-TW' ? '生成結構...' : 'Generating structure...' },
        { progress: 75, text: currentLang === 'zh-TW' ? '添加細節...' : 'Adding details...' },
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
            <span class="stat-label">${t('statType')}:</span>
            <span class="stat-value">${stats.type}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">${t('statStyle')}:</span>
            <span class="stat-value">${stats.style}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">${t('statFloors')}:</span>
            <span class="stat-value">${stats.floors}</span>
        </div>
    `;
    document.getElementById('outputStats').innerHTML = statsHtml;
}

function downloadPng() {
    const canvas = document.getElementById('mainCanvas');
    const link = document.createElement('a');
    link.download = 'architecture.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

function downloadSvg() {
    const canvas = document.getElementById('mainCanvas');
    const link = document.createElement('a');
    link.download = 'architecture.png';
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
    const floors = document.getElementById('floors');
    const floorsValue = document.getElementById('floorsValue');
    floors.addEventListener('input', () => {
        floorsValue.textContent = floors.value;
    });

    const buildingWidth = document.getElementById('buildingWidth');
    const widthValue = document.getElementById('widthValue');
    buildingWidth.addEventListener('input', () => {
        widthValue.textContent = buildingWidth.value;
    });

    // Generate button
    document.getElementById('generateBtn').addEventListener('click', async () => {
        const btn = document.getElementById('generateBtn');
        btn.disabled = true;
        btn.querySelector('span').textContent = t('generating');

        await showProgress();

        const type = document.getElementById('buildingType').value;
        const style = document.getElementById('buildingStyle').value;
        const floorsVal = parseInt(document.getElementById('floors').value);
        const widthVal = parseInt(document.getElementById('buildingWidth').value);
        const colors = [
            document.getElementById('colorMain').value,
            document.getElementById('colorAccent').value,
            document.getElementById('colorSky').value
        ];

        const stats = generateArchitecture(type, style, floorsVal, widthVal, colors);

        document.getElementById('progressSection').style.display = 'none';
        document.getElementById('canvasSection').style.display = 'block';
        document.getElementById('outputSection').style.display = 'block';

        updateStats(stats);

        btn.disabled = false;
        btn.querySelector('span').textContent = t('generateBtn');

        document.getElementById('canvasSection').scrollIntoView({ behavior: 'smooth' });
    });

    // Download buttons
    document.getElementById('downloadPngBtn').addEventListener('click', downloadPng);
    document.getElementById('downloadSvgBtn').addEventListener('click', downloadSvg);
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
    console.log('Architecture Generator initialized - Tool #516');
}

init();
