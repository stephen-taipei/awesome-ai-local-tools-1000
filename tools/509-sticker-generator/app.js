/**
 * Sticker Generator - Tool #509
 * Awesome AI Local Tools
 *
 * Local sticker generation with text and decorations
 */

// ========================================
// Internationalization (i18n)
// ========================================

const translations = {
    'zh-TW': {
        title: '貼圖生成器',
        subtitle: '智能貼圖設計，本地處理保護隱私',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        textLabel: '貼圖文字',
        textPlaceholder: '輸入貼圖上的文字...',
        styleLabel: '貼圖風格',
        styleCute: '可愛',
        styleCool: '酷炫',
        styleFunny: '搞笑',
        styleElegant: '優雅',
        styleRetro: '復古',
        styleNeon: '霓虹',
        shapeLabel: '貼圖形狀',
        shapeBubble: '對話泡泡',
        shapeStar: '星形',
        shapeHeart: '愛心',
        shapeCloud: '雲朵',
        shapeBang: '爆炸',
        shapeRibbon: '絲帶',
        bgColorLabel: '背景顏色',
        textColorLabel: '文字顏色',
        decorLabel: '裝飾元素',
        decorSparkles: '閃光',
        decorHearts: '愛心',
        decorStars: '星星',
        decorOutline: '描邊',
        decorShadow: '陰影',
        generateBtn: '生成貼圖',
        generating: '生成中...',
        processing: 'AI 正在設計貼圖...',
        previewTitle: '貼圖預覽',
        outputTitle: '生成結果',
        downloadPng: '下載 PNG (透明背景)',
        style: '風格',
        elements: '裝飾數量',
        dimensions: '尺寸',
        howItWorks: '功能特色',
        feature1: '多種風格',
        feature1Desc: '支援可愛、酷炫、搞笑等多種風格',
        feature2: '裝飾元素',
        feature2Desc: '閃光、愛心、星星等裝飾任選',
        feature3: '隱私保護',
        feature3Desc: '所有處理在瀏覽器本地完成',
        feature4: '透明背景',
        feature4Desc: '支援透明背景 PNG 下載',
        backToHome: '返回首頁',
        toolNumber: '工具 #509',
        copyright: 'Awesome AI Local Tools © 2024',
        errorNoText: '請輸入貼圖文字'
    },
    'en': {
        title: 'Sticker Generator',
        subtitle: 'AI-powered sticker design, processed locally',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        textLabel: 'Sticker Text',
        textPlaceholder: 'Enter text for sticker...',
        styleLabel: 'Sticker Style',
        styleCute: 'Cute',
        styleCool: 'Cool',
        styleFunny: 'Funny',
        styleElegant: 'Elegant',
        styleRetro: 'Retro',
        styleNeon: 'Neon',
        shapeLabel: 'Sticker Shape',
        shapeBubble: 'Speech Bubble',
        shapeStar: 'Star',
        shapeHeart: 'Heart',
        shapeCloud: 'Cloud',
        shapeBang: 'Bang',
        shapeRibbon: 'Ribbon',
        bgColorLabel: 'Background Color',
        textColorLabel: 'Text Color',
        decorLabel: 'Decorations',
        decorSparkles: 'Sparkles',
        decorHearts: 'Hearts',
        decorStars: 'Stars',
        decorOutline: 'Outline',
        decorShadow: 'Shadow',
        generateBtn: 'Generate Sticker',
        generating: 'Generating...',
        processing: 'AI is designing sticker...',
        previewTitle: 'Sticker Preview',
        outputTitle: 'Generated Result',
        downloadPng: 'Download PNG (Transparent)',
        style: 'Style',
        elements: 'Elements',
        dimensions: 'Dimensions',
        howItWorks: 'Features',
        feature1: 'Multiple Styles',
        feature1Desc: 'Support cute, cool, funny and more styles',
        feature2: 'Decorations',
        feature2Desc: 'Choose from sparkles, hearts, stars and more',
        feature3: 'Privacy Protected',
        feature3Desc: 'All processing done locally in browser',
        feature4: 'Transparent BG',
        feature4Desc: 'Download PNG with transparent background',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #509',
        copyright: 'Awesome AI Local Tools © 2024',
        errorNoText: 'Please enter sticker text'
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
// Sticker Drawing Functions
// ========================================

function drawSticker(ctx, text, style, shape, bgColor, textColor, decorations) {
    const size = 400;
    const center = size / 2;

    ctx.clearRect(0, 0, size, size);

    // Get style properties
    const styleProps = getStyleProperties(style);

    // Draw shadow if enabled
    if (decorations.includes('shadow')) {
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;
        drawShape(ctx, shape, center, center, size * 0.4, bgColor, styleProps);
        ctx.restore();
    } else {
        drawShape(ctx, shape, center, center, size * 0.4, bgColor, styleProps);
    }

    // Draw outline if enabled
    if (decorations.includes('outline')) {
        ctx.strokeStyle = adjustColor(bgColor, -40);
        ctx.lineWidth = 4;
        drawShapeOutline(ctx, shape, center, center, size * 0.4);
    }

    // Draw text
    drawText(ctx, text, center, center, textColor, styleProps, size);

    // Draw decorations
    let elementCount = 0;
    if (decorations.includes('sparkles')) {
        elementCount += drawSparkles(ctx, center, size, bgColor);
    }
    if (decorations.includes('hearts')) {
        elementCount += drawHearts(ctx, center, size, textColor);
    }
    if (decorations.includes('stars')) {
        elementCount += drawStars(ctx, center, size, textColor);
    }

    return {
        style: t('style' + style.charAt(0).toUpperCase() + style.slice(1)),
        elements: elementCount + (decorations.includes('outline') ? 1 : 0) + (decorations.includes('shadow') ? 1 : 0),
        dimensions: `${size}x${size}`
    };
}

function getStyleProperties(style) {
    const styles = {
        cute: {
            fontFamily: 'Comic Sans MS, cursive',
            fontWeight: 'bold',
            fontSize: 0.12,
            letterSpacing: 2,
            rotation: -5
        },
        cool: {
            fontFamily: 'Impact, sans-serif',
            fontWeight: 'bold',
            fontSize: 0.14,
            letterSpacing: 4,
            rotation: 0
        },
        funny: {
            fontFamily: 'Comic Sans MS, cursive',
            fontWeight: 'bold',
            fontSize: 0.13,
            letterSpacing: 1,
            rotation: 8
        },
        elegant: {
            fontFamily: 'Georgia, serif',
            fontWeight: 'normal',
            fontSize: 0.11,
            letterSpacing: 3,
            rotation: 0
        },
        retro: {
            fontFamily: 'Courier New, monospace',
            fontWeight: 'bold',
            fontSize: 0.11,
            letterSpacing: 2,
            rotation: -3
        },
        neon: {
            fontFamily: 'Arial Black, sans-serif',
            fontWeight: 'bold',
            fontSize: 0.12,
            letterSpacing: 3,
            rotation: 0,
            glow: true
        }
    };
    return styles[style] || styles.cute;
}

function drawShape(ctx, shape, x, y, radius, color, styleProps) {
    ctx.fillStyle = color;

    switch (shape) {
        case 'bubble':
            drawBubble(ctx, x, y, radius);
            break;
        case 'star':
            drawStar(ctx, x, y, radius, 5);
            break;
        case 'heart':
            drawHeart(ctx, x, y, radius);
            break;
        case 'cloud':
            drawCloud(ctx, x, y, radius);
            break;
        case 'bang':
            drawBang(ctx, x, y, radius);
            break;
        case 'ribbon':
            drawRibbon(ctx, x, y, radius);
            break;
    }
}

function drawShapeOutline(ctx, shape, x, y, radius) {
    ctx.beginPath();

    switch (shape) {
        case 'bubble':
            ctx.ellipse(x, y - radius * 0.1, radius * 1.1, radius * 0.85, 0, 0, Math.PI * 2);
            break;
        case 'star':
            for (let i = 0; i < 5; i++) {
                const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
                const innerAngle = angle + Math.PI / 5;
                const outerR = radius * 1.1;
                const innerR = radius * 0.5;
                if (i === 0) {
                    ctx.moveTo(x + outerR * Math.cos(angle), y + outerR * Math.sin(angle));
                } else {
                    ctx.lineTo(x + outerR * Math.cos(angle), y + outerR * Math.sin(angle));
                }
                ctx.lineTo(x + innerR * Math.cos(innerAngle), y + innerR * Math.sin(innerAngle));
            }
            ctx.closePath();
            break;
        case 'heart':
            ctx.moveTo(x, y + radius * 0.7);
            ctx.bezierCurveTo(x - radius * 1.3, y, x - radius * 1.3, y - radius * 0.9, x, y - radius * 0.5);
            ctx.bezierCurveTo(x + radius * 1.3, y - radius * 0.9, x + radius * 1.3, y, x, y + radius * 0.7);
            break;
        default:
            ctx.ellipse(x, y, radius, radius * 0.8, 0, 0, Math.PI * 2);
    }

    ctx.stroke();
}

function drawBubble(ctx, x, y, radius) {
    ctx.beginPath();
    ctx.ellipse(x, y - radius * 0.1, radius * 1.1, radius * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bubble tail
    ctx.beginPath();
    ctx.moveTo(x - radius * 0.3, y + radius * 0.6);
    ctx.quadraticCurveTo(x - radius * 0.5, y + radius * 1.1, x - radius * 0.7, y + radius * 0.9);
    ctx.quadraticCurveTo(x - radius * 0.4, y + radius * 0.8, x - radius * 0.1, y + radius * 0.7);
    ctx.fill();
}

function drawStar(ctx, x, y, radius, points) {
    ctx.beginPath();
    for (let i = 0; i < points; i++) {
        const angle = (Math.PI * 2 / points) * i - Math.PI / 2;
        const innerAngle = angle + Math.PI / points;
        const outerR = radius * 1.1;
        const innerR = radius * 0.5;
        if (i === 0) {
            ctx.moveTo(x + outerR * Math.cos(angle), y + outerR * Math.sin(angle));
        } else {
            ctx.lineTo(x + outerR * Math.cos(angle), y + outerR * Math.sin(angle));
        }
        ctx.lineTo(x + innerR * Math.cos(innerAngle), y + innerR * Math.sin(innerAngle));
    }
    ctx.closePath();
    ctx.fill();
}

function drawHeart(ctx, x, y, radius) {
    ctx.beginPath();
    ctx.moveTo(x, y + radius * 0.7);
    ctx.bezierCurveTo(x - radius * 1.3, y, x - radius * 1.3, y - radius * 0.9, x, y - radius * 0.5);
    ctx.bezierCurveTo(x + radius * 1.3, y - radius * 0.9, x + radius * 1.3, y, x, y + radius * 0.7);
    ctx.fill();
}

function drawCloud(ctx, x, y, radius) {
    ctx.beginPath();
    ctx.arc(x - radius * 0.4, y + radius * 0.1, radius * 0.5, 0, Math.PI * 2);
    ctx.arc(x + radius * 0.4, y + radius * 0.1, radius * 0.45, 0, Math.PI * 2);
    ctx.arc(x, y - radius * 0.2, radius * 0.55, 0, Math.PI * 2);
    ctx.arc(x - radius * 0.6, y + radius * 0.3, radius * 0.35, 0, Math.PI * 2);
    ctx.arc(x + radius * 0.6, y + radius * 0.3, radius * 0.35, 0, Math.PI * 2);
    ctx.fill();
}

function drawBang(ctx, x, y, radius) {
    ctx.beginPath();
    const points = 12;
    for (let i = 0; i < points; i++) {
        const angle = (Math.PI * 2 / points) * i - Math.PI / 2;
        const r = i % 2 === 0 ? radius * 1.1 : radius * 0.7;
        if (i === 0) {
            ctx.moveTo(x + r * Math.cos(angle), y + r * Math.sin(angle));
        } else {
            ctx.lineTo(x + r * Math.cos(angle), y + r * Math.sin(angle));
        }
    }
    ctx.closePath();
    ctx.fill();
}

function drawRibbon(ctx, x, y, radius) {
    ctx.beginPath();
    // Main ribbon body
    ctx.moveTo(x - radius * 1.2, y - radius * 0.2);
    ctx.quadraticCurveTo(x - radius * 0.6, y - radius * 0.4, x, y - radius * 0.3);
    ctx.quadraticCurveTo(x + radius * 0.6, y - radius * 0.4, x + radius * 1.2, y - radius * 0.2);
    ctx.lineTo(x + radius * 1.1, y + radius * 0.3);
    ctx.quadraticCurveTo(x + radius * 0.5, y + radius * 0.1, x, y + radius * 0.2);
    ctx.quadraticCurveTo(x - radius * 0.5, y + radius * 0.1, x - radius * 1.1, y + radius * 0.3);
    ctx.closePath();
    ctx.fill();

    // Ribbon ends
    ctx.beginPath();
    ctx.moveTo(x - radius * 1.1, y + radius * 0.3);
    ctx.lineTo(x - radius * 1.3, y + radius * 0.6);
    ctx.lineTo(x - radius * 1.0, y + radius * 0.5);
    ctx.lineTo(x - radius * 0.9, y + radius * 0.7);
    ctx.lineTo(x - radius * 0.8, y + radius * 0.3);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x + radius * 1.1, y + radius * 0.3);
    ctx.lineTo(x + radius * 1.3, y + radius * 0.6);
    ctx.lineTo(x + radius * 1.0, y + radius * 0.5);
    ctx.lineTo(x + radius * 0.9, y + radius * 0.7);
    ctx.lineTo(x + radius * 0.8, y + radius * 0.3);
    ctx.fill();
}

function drawText(ctx, text, x, y, color, styleProps, size) {
    const fontSize = size * styleProps.fontSize;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(styleProps.rotation * Math.PI / 180);

    ctx.font = `${styleProps.fontWeight} ${fontSize}px ${styleProps.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = styleProps.letterSpacing + 'px';

    if (styleProps.glow) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 20;
    }

    // Text outline
    ctx.strokeStyle = adjustColor(color, -60);
    ctx.lineWidth = 4;
    ctx.strokeText(text, 0, 0);

    // Text fill
    ctx.fillStyle = color;
    ctx.fillText(text, 0, 0);

    ctx.restore();
}

function drawSparkles(ctx, center, size, color) {
    const sparklePositions = [
        { x: center - size * 0.35, y: center - size * 0.3 },
        { x: center + size * 0.35, y: center - size * 0.25 },
        { x: center - size * 0.3, y: center + size * 0.25 },
        { x: center + size * 0.32, y: center + size * 0.28 }
    ];

    ctx.fillStyle = '#ffffff';

    sparklePositions.forEach(pos => {
        drawSparkle(ctx, pos.x, pos.y, size * 0.04);
    });

    return sparklePositions.length;
}

function drawSparkle(ctx, x, y, s) {
    ctx.beginPath();
    ctx.moveTo(x, y - s);
    ctx.lineTo(x + s * 0.3, y - s * 0.3);
    ctx.lineTo(x + s, y);
    ctx.lineTo(x + s * 0.3, y + s * 0.3);
    ctx.lineTo(x, y + s);
    ctx.lineTo(x - s * 0.3, y + s * 0.3);
    ctx.lineTo(x - s, y);
    ctx.lineTo(x - s * 0.3, y - s * 0.3);
    ctx.closePath();
    ctx.fill();
}

function drawHearts(ctx, center, size, color) {
    const positions = [
        { x: center - size * 0.38, y: center - size * 0.2 },
        { x: center + size * 0.36, y: center + size * 0.15 }
    ];

    ctx.fillStyle = '#ef4444';

    positions.forEach(pos => {
        drawSmallHeart(ctx, pos.x, pos.y, size * 0.05);
    });

    return positions.length;
}

function drawSmallHeart(ctx, x, y, s) {
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.5);
    ctx.bezierCurveTo(x - s, y, x - s, y - s * 0.7, x, y - s * 0.3);
    ctx.bezierCurveTo(x + s, y - s * 0.7, x + s, y, x, y + s * 0.5);
    ctx.fill();
}

function drawStars(ctx, center, size, color) {
    const positions = [
        { x: center + size * 0.38, y: center - size * 0.32 },
        { x: center - size * 0.36, y: center + size * 0.3 }
    ];

    ctx.fillStyle = '#fbbf24';

    positions.forEach(pos => {
        drawSmallStar(ctx, pos.x, pos.y, size * 0.04);
    });

    return positions.length;
}

function drawSmallStar(ctx, x, y, s) {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
        const innerAngle = angle + Math.PI / 5;
        if (i === 0) {
            ctx.moveTo(x + s * Math.cos(angle), y + s * Math.sin(angle));
        } else {
            ctx.lineTo(x + s * Math.cos(angle), y + s * Math.sin(angle));
        }
        ctx.lineTo(x + s * 0.4 * Math.cos(innerAngle), y + s * 0.4 * Math.sin(innerAngle));
    }
    ctx.closePath();
    ctx.fill();
}

function adjustColor(hex, amount) {
    const num = parseInt(hex.slice(1), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
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
        { progress: 25, text: currentLang === 'zh-TW' ? '繪製形狀...' : 'Drawing shape...' },
        { progress: 50, text: currentLang === 'zh-TW' ? '添加文字...' : 'Adding text...' },
        { progress: 75, text: currentLang === 'zh-TW' ? '裝飾元素...' : 'Adding decorations...' },
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
            <span class="stat-label">${t('style')}:</span>
            <span class="stat-value">${stats.style}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">${t('elements')}:</span>
            <span class="stat-value">${stats.elements}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">${t('dimensions')}:</span>
            <span class="stat-value">${stats.dimensions}</span>
        </div>
    `;
    document.getElementById('outputStats').innerHTML = statsHtml;
}

function downloadSticker() {
    const canvas = document.getElementById('stickerCanvas');
    const link = document.createElement('a');
    link.download = 'sticker.png';
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

    // Character count
    const textInput = document.getElementById('textInput');
    const charCount = document.getElementById('charCount');
    textInput.addEventListener('input', () => {
        charCount.textContent = textInput.value.length;
    });

    // Generate button
    document.getElementById('generateBtn').addEventListener('click', async () => {
        const text = textInput.value.trim();

        if (!text) {
            alert(t('errorNoText'));
            return;
        }

        const btn = document.getElementById('generateBtn');
        btn.disabled = true;
        btn.querySelector('span').textContent = t('generating');

        await showProgress();

        const style = document.getElementById('styleSelect').value;
        const shape = document.getElementById('shapeSelect').value;
        const bgColor = document.getElementById('bgColor').value;
        const textColor = document.getElementById('textColor').value;
        const decorations = Array.from(document.querySelectorAll('.decor-option input:checked'))
            .map(cb => cb.value);

        const canvas = document.getElementById('stickerCanvas');
        const ctx = canvas.getContext('2d');

        const stats = drawSticker(ctx, text, style, shape, bgColor, textColor, decorations);

        document.getElementById('progressSection').style.display = 'none';
        document.getElementById('canvasSection').style.display = 'block';
        document.getElementById('outputSection').style.display = 'block';

        updateStats(stats);

        btn.disabled = false;
        btn.querySelector('span').textContent = t('generateBtn');

        document.getElementById('canvasSection').scrollIntoView({ behavior: 'smooth' });
    });

    // Download button
    document.getElementById('downloadBtn').addEventListener('click', downloadSticker);
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
    console.log('Sticker Generator initialized - Tool #509');
}

init();
