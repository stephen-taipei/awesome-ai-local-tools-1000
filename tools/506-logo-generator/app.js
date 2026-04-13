/**
 * Logo Generator - Tool #506
 * Awesome AI Local Tools
 *
 * Local logo generation with geometric shapes and text
 */

// ========================================
// Internationalization (i18n)
// ========================================

const translations = {
    'zh-TW': {
        title: 'Logo 生成器',
        subtitle: '智能 Logo 設計，本地處理保護隱私',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        companyLabel: '公司名稱',
        companyPlaceholder: '輸入公司或品牌名稱...',
        industryLabel: '行業類型',
        industryTech: '科技',
        industryFinance: '金融',
        industryHealth: '醫療健康',
        industryFood: '餐飲美食',
        industryEducation: '教育培訓',
        industryCreative: '創意設計',
        industryRetail: '零售電商',
        industrySports: '運動健身',
        shapeLabel: '形狀風格',
        shapeCircle: '圓形',
        shapeSquare: '方形',
        shapeHexagon: '六邊形',
        shapeTriangle: '三角形',
        shapeAbstract: '抽象',
        primaryColorLabel: '主色調',
        secondaryColorLabel: '輔助色',
        generateBtn: '生成 Logo',
        generating: '生成中...',
        processing: 'AI 正在設計中...',
        previewTitle: 'Logo 預覽',
        outputTitle: '生成結果',
        downloadPng: '下載 PNG',
        downloadSvg: '下載 SVG',
        colorsUsed: '使用顏色',
        complexity: '複雜度',
        dimensions: '尺寸',
        howItWorks: '功能特色',
        feature1: '多種風格',
        feature1Desc: '支援圓形、方形、六邊形等多種幾何風格',
        feature2: '行業適配',
        feature2Desc: '根據行業類型智能選擇設計元素',
        feature3: '隱私保護',
        feature3Desc: '所有處理在瀏覽器本地完成',
        feature4: '多格式導出',
        feature4Desc: '支援 PNG 和 SVG 兩種格式下載',
        backToHome: '返回首頁',
        toolNumber: '工具 #506',
        copyright: 'Awesome AI Local Tools © 2024',
        errorNoCompany: '請輸入公司名稱',
        complexityLow: '簡約',
        complexityMedium: '中等',
        complexityHigh: '複雜'
    },
    'en': {
        title: 'Logo Generator',
        subtitle: 'AI-powered logo design, processed locally',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        companyLabel: 'Company Name',
        companyPlaceholder: 'Enter company or brand name...',
        industryLabel: 'Industry Type',
        industryTech: 'Technology',
        industryFinance: 'Finance',
        industryHealth: 'Healthcare',
        industryFood: 'Food & Dining',
        industryEducation: 'Education',
        industryCreative: 'Creative Design',
        industryRetail: 'Retail & E-commerce',
        industrySports: 'Sports & Fitness',
        shapeLabel: 'Shape Style',
        shapeCircle: 'Circle',
        shapeSquare: 'Square',
        shapeHexagon: 'Hexagon',
        shapeTriangle: 'Triangle',
        shapeAbstract: 'Abstract',
        primaryColorLabel: 'Primary Color',
        secondaryColorLabel: 'Secondary Color',
        generateBtn: 'Generate Logo',
        generating: 'Generating...',
        processing: 'AI is designing...',
        previewTitle: 'Logo Preview',
        outputTitle: 'Generated Result',
        downloadPng: 'Download PNG',
        downloadSvg: 'Download SVG',
        colorsUsed: 'Colors Used',
        complexity: 'Complexity',
        dimensions: 'Dimensions',
        howItWorks: 'Features',
        feature1: 'Multiple Styles',
        feature1Desc: 'Support circle, square, hexagon and more geometric styles',
        feature2: 'Industry Adaptive',
        feature2Desc: 'Smart design elements based on industry type',
        feature3: 'Privacy Protected',
        feature3Desc: 'All processing done locally in browser',
        feature4: 'Multi-format Export',
        feature4Desc: 'Support PNG and SVG format download',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #506',
        copyright: 'Awesome AI Local Tools © 2024',
        errorNoCompany: 'Please enter a company name',
        complexityLow: 'Simple',
        complexityMedium: 'Medium',
        complexityHigh: 'Complex'
    }
};

let currentLang = 'zh-TW';
let generatedSvgData = '';

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
// Logo Generation
// ========================================

const industryIcons = {
    tech: ['circuit', 'chip', 'code', 'network'],
    finance: ['chart', 'coin', 'growth', 'shield'],
    health: ['heart', 'plus', 'pulse', 'leaf'],
    food: ['fork', 'cup', 'chef', 'plate'],
    education: ['book', 'cap', 'pen', 'bulb'],
    creative: ['brush', 'palette', 'star', 'spark'],
    retail: ['cart', 'bag', 'tag', 'box'],
    sports: ['trophy', 'ball', 'run', 'flame']
};

function generateLogo(companyName, industry, shape, primaryColor, secondaryColor) {
    const canvas = document.getElementById('logoCanvas');
    const ctx = canvas.getContext('2d');
    const size = 400;
    const center = size / 2;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Draw background shape
    ctx.fillStyle = primaryColor;
    drawShape(ctx, shape, center, center, size * 0.4);

    // Draw inner decorative element based on industry
    ctx.fillStyle = secondaryColor;
    drawIndustryElement(ctx, industry, center, center, size * 0.15);

    // Draw company name initial or short name
    const displayText = companyName.substring(0, 2).toUpperCase();
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${size * 0.15}px -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(displayText, center, center + size * 0.12);

    // Draw company name below
    ctx.fillStyle = secondaryColor;
    ctx.font = `600 ${size * 0.06}px -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.fillText(companyName, center, center + size * 0.35);

    // Generate SVG data
    generatedSvgData = generateSvgData(companyName, industry, shape, primaryColor, secondaryColor, size);

    return {
        colorsUsed: 3,
        complexity: getComplexity(shape, industry),
        dimensions: `${size}x${size}`
    };
}

function drawShape(ctx, shape, x, y, radius) {
    ctx.beginPath();

    switch (shape) {
        case 'circle':
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            break;
        case 'square':
            const halfSize = radius * 0.9;
            ctx.roundRect(x - halfSize, y - halfSize, halfSize * 2, halfSize * 2, radius * 0.1);
            break;
        case 'hexagon':
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 3) * i - Math.PI / 2;
                const px = x + radius * Math.cos(angle);
                const py = y + radius * Math.sin(angle);
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            break;
        case 'triangle':
            ctx.moveTo(x, y - radius);
            ctx.lineTo(x + radius * Math.cos(Math.PI / 6), y + radius * Math.sin(Math.PI / 6));
            ctx.lineTo(x - radius * Math.cos(Math.PI / 6), y + radius * Math.sin(Math.PI / 6));
            ctx.closePath();
            break;
        case 'abstract':
            // Draw an abstract blob shape
            ctx.moveTo(x + radius, y);
            ctx.bezierCurveTo(
                x + radius, y - radius * 0.8,
                x + radius * 0.5, y - radius,
                x, y - radius * 0.9
            );
            ctx.bezierCurveTo(
                x - radius * 0.5, y - radius * 0.8,
                x - radius, y - radius * 0.3,
                x - radius * 0.9, y + radius * 0.2
            );
            ctx.bezierCurveTo(
                x - radius * 0.8, y + radius * 0.8,
                x - radius * 0.2, y + radius,
                x + radius * 0.3, y + radius * 0.9
            );
            ctx.bezierCurveTo(
                x + radius * 0.8, y + radius * 0.8,
                x + radius, y + radius * 0.4,
                x + radius, y
            );
            break;
    }

    ctx.fill();
}

function drawIndustryElement(ctx, industry, x, y, size) {
    ctx.beginPath();

    switch (industry) {
        case 'tech':
            // Circuit-like pattern
            for (let i = 0; i < 4; i++) {
                const angle = (Math.PI / 2) * i;
                ctx.moveTo(x, y);
                ctx.lineTo(x + size * Math.cos(angle), y + size * Math.sin(angle));
            }
            ctx.lineWidth = 3;
            ctx.strokeStyle = ctx.fillStyle;
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'finance':
            // Upward arrow/chart
            ctx.moveTo(x - size * 0.5, y + size * 0.3);
            ctx.lineTo(x, y - size * 0.5);
            ctx.lineTo(x + size * 0.5, y + size * 0.3);
            ctx.lineWidth = 4;
            ctx.strokeStyle = ctx.fillStyle;
            ctx.stroke();
            break;
        case 'health':
            // Plus sign
            const thickness = size * 0.3;
            ctx.fillRect(x - size * 0.5, y - thickness / 2, size, thickness);
            ctx.fillRect(x - thickness / 2, y - size * 0.5, thickness, size);
            break;
        case 'food':
            // Fork-like shape
            ctx.arc(x, y - size * 0.2, size * 0.4, Math.PI, 0);
            ctx.fill();
            break;
        case 'education':
            // Book/cap shape
            ctx.moveTo(x - size * 0.5, y);
            ctx.lineTo(x, y - size * 0.4);
            ctx.lineTo(x + size * 0.5, y);
            ctx.lineTo(x, y + size * 0.2);
            ctx.closePath();
            ctx.fill();
            break;
        case 'creative':
            // Star
            for (let i = 0; i < 5; i++) {
                const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
                const innerAngle = angle + Math.PI / 5;
                const outerRadius = size * 0.6;
                const innerRadius = size * 0.25;
                if (i === 0) {
                    ctx.moveTo(x + outerRadius * Math.cos(angle), y + outerRadius * Math.sin(angle));
                } else {
                    ctx.lineTo(x + outerRadius * Math.cos(angle), y + outerRadius * Math.sin(angle));
                }
                ctx.lineTo(x + innerRadius * Math.cos(innerAngle), y + innerRadius * Math.sin(innerAngle));
            }
            ctx.closePath();
            ctx.fill();
            break;
        case 'retail':
            // Shopping bag
            ctx.roundRect(x - size * 0.4, y - size * 0.2, size * 0.8, size * 0.7, 4);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x, y - size * 0.3, size * 0.25, Math.PI, 0);
            ctx.lineWidth = 3;
            ctx.strokeStyle = ctx.fillStyle;
            ctx.stroke();
            break;
        case 'sports':
            // Flame/trophy
            ctx.moveTo(x, y - size * 0.5);
            ctx.bezierCurveTo(x + size * 0.3, y - size * 0.2, x + size * 0.4, y + size * 0.2, x, y + size * 0.5);
            ctx.bezierCurveTo(x - size * 0.4, y + size * 0.2, x - size * 0.3, y - size * 0.2, x, y - size * 0.5);
            ctx.fill();
            break;
    }
}

function generateSvgData(companyName, industry, shape, primaryColor, secondaryColor, size) {
    const center = size / 2;
    const radius = size * 0.4;

    let shapePath = '';
    switch (shape) {
        case 'circle':
            shapePath = `<circle cx="${center}" cy="${center}" r="${radius}" fill="${primaryColor}"/>`;
            break;
        case 'square':
            const halfSize = radius * 0.9;
            shapePath = `<rect x="${center - halfSize}" y="${center - halfSize}" width="${halfSize * 2}" height="${halfSize * 2}" rx="${radius * 0.1}" fill="${primaryColor}"/>`;
            break;
        case 'hexagon':
            let points = [];
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 3) * i - Math.PI / 2;
                points.push(`${center + radius * Math.cos(angle)},${center + radius * Math.sin(angle)}`);
            }
            shapePath = `<polygon points="${points.join(' ')}" fill="${primaryColor}"/>`;
            break;
        case 'triangle':
            shapePath = `<polygon points="${center},${center - radius} ${center + radius * Math.cos(Math.PI / 6)},${center + radius * Math.sin(Math.PI / 6)} ${center - radius * Math.cos(Math.PI / 6)},${center + radius * Math.sin(Math.PI / 6)}" fill="${primaryColor}"/>`;
            break;
        default:
            shapePath = `<circle cx="${center}" cy="${center}" r="${radius}" fill="${primaryColor}"/>`;
    }

    const displayText = companyName.substring(0, 2).toUpperCase();

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    ${shapePath}
    <text x="${center}" y="${center + size * 0.12}" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="${size * 0.15}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${displayText}</text>
    <text x="${center}" y="${center + size * 0.35}" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="${size * 0.06}" font-weight="600" fill="${secondaryColor}" text-anchor="middle">${companyName}</text>
</svg>`;
}

function getComplexity(shape, industry) {
    const shapeComplexity = { circle: 1, square: 1, hexagon: 2, triangle: 1, abstract: 3 };
    const industryComplexity = { tech: 2, finance: 1, health: 1, food: 2, education: 2, creative: 3, retail: 2, sports: 2 };

    const total = (shapeComplexity[shape] || 1) + (industryComplexity[industry] || 1);

    if (total <= 2) return t('complexityLow');
    if (total <= 4) return t('complexityMedium');
    return t('complexityHigh');
}

// ========================================
// UI Functions
// ========================================

function showProgress() {
    document.getElementById('progressSection').style.display = 'block';
    document.getElementById('canvasSection').style.display = 'none';
    document.getElementById('outputSection').style.display = 'none';

    let progress = 0;
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    const stages = [
        { progress: 20, text: currentLang === 'zh-TW' ? '分析公司名稱...' : 'Analyzing company name...' },
        { progress: 40, text: currentLang === 'zh-TW' ? '選擇設計元素...' : 'Selecting design elements...' },
        { progress: 60, text: currentLang === 'zh-TW' ? '生成幾何圖形...' : 'Generating geometric shapes...' },
        { progress: 80, text: currentLang === 'zh-TW' ? '添加文字排版...' : 'Adding typography...' },
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
    }, 400);

    return new Promise(resolve => {
        setTimeout(resolve, stages.length * 400 + 200);
    });
}

function updateStats(stats) {
    const statsHtml = `
        <div class="stat-item">
            <span class="stat-label">${t('colorsUsed')}:</span>
            <span class="stat-value">${stats.colorsUsed}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">${t('complexity')}:</span>
            <span class="stat-value">${stats.complexity}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">${t('dimensions')}:</span>
            <span class="stat-value">${stats.dimensions}</span>
        </div>
    `;
    document.getElementById('outputStats').innerHTML = statsHtml;
}

function downloadPng() {
    const canvas = document.getElementById('logoCanvas');
    const link = document.createElement('a');
    link.download = 'logo.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

function downloadSvg() {
    const blob = new Blob([generatedSvgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'logo.svg';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
}

// ========================================
// Event Handlers
// ========================================

function initEventListeners() {
    // Language switcher
    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    // Generate button
    document.getElementById('generateBtn').addEventListener('click', async () => {
        const companyName = document.getElementById('companyInput').value.trim();
        const industry = document.getElementById('industrySelect').value;
        const shape = document.getElementById('shapeSelect').value;
        const primaryColor = document.getElementById('primaryColor').value;
        const secondaryColor = document.getElementById('secondaryColor').value;

        if (!companyName) {
            alert(t('errorNoCompany'));
            return;
        }

        const btn = document.getElementById('generateBtn');
        btn.disabled = true;
        btn.querySelector('span').textContent = t('generating');

        await showProgress();

        const stats = generateLogo(companyName, industry, shape, primaryColor, secondaryColor);

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
    console.log('Logo Generator initialized - Tool #506');
}

init();
