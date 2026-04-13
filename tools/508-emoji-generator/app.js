/**
 * Emoji Generator - Tool #508
 * Awesome AI Local Tools
 *
 * Local emoji generation with customizable expressions
 */

// ========================================
// Internationalization (i18n)
// ========================================

const translations = {
    'zh-TW': {
        title: '表情符號生成',
        subtitle: '智能表情設計，本地處理保護隱私',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        emotionLabel: '表情類型',
        emotionHappy: '開心',
        emotionSad: '難過',
        emotionAngry: '生氣',
        emotionSurprised: '驚訝',
        emotionLove: '喜愛',
        emotionWink: '眨眼',
        emotionThink: '思考',
        emotionCool: '酷',
        emotionLaugh: '大笑',
        emotionSleepy: '睡眠',
        emotionSick: '不適',
        emotionDevil: '調皮',
        faceColorLabel: '臉部顏色',
        accentColorLabel: '強調顏色',
        sizeLabel: '輸出尺寸',
        bgLabel: '背景',
        bgTransparent: '透明',
        bgWhite: '白色',
        bgCircle: '圓形背景',
        generateBtn: '生成表情',
        generating: '生成中...',
        processing: 'AI 正在繪製表情...',
        previewTitle: '表情預覽',
        outputTitle: '生成結果',
        downloadPng: '下載 PNG',
        copyBtn: '複製到剪貼板',
        copied: '已複製!',
        emotion: '表情',
        features: '特徵',
        size: '尺寸',
        howItWorks: '功能特色',
        feature1: '豐富表情',
        feature1Desc: '支援 12 種不同情緒的表情符號',
        feature2: '自訂顏色',
        feature2Desc: '自由調整臉部和強調顏色',
        feature3: '隱私保護',
        feature3Desc: '所有處理在瀏覽器本地完成',
        feature4: '多種尺寸',
        feature4Desc: '支援 64px 到 512px 多種尺寸',
        backToHome: '返回首頁',
        toolNumber: '工具 #508',
        copyright: 'Awesome AI Local Tools © 2024'
    },
    'en': {
        title: 'Emoji Generator',
        subtitle: 'AI-powered emoji design, processed locally',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        emotionLabel: 'Expression Type',
        emotionHappy: 'Happy',
        emotionSad: 'Sad',
        emotionAngry: 'Angry',
        emotionSurprised: 'Surprised',
        emotionLove: 'Love',
        emotionWink: 'Wink',
        emotionThink: 'Think',
        emotionCool: 'Cool',
        emotionLaugh: 'Laugh',
        emotionSleepy: 'Sleepy',
        emotionSick: 'Sick',
        emotionDevil: 'Devil',
        faceColorLabel: 'Face Color',
        accentColorLabel: 'Accent Color',
        sizeLabel: 'Output Size',
        bgLabel: 'Background',
        bgTransparent: 'Transparent',
        bgWhite: 'White',
        bgCircle: 'Circle BG',
        generateBtn: 'Generate Emoji',
        generating: 'Generating...',
        processing: 'AI is drawing emoji...',
        previewTitle: 'Emoji Preview',
        outputTitle: 'Generated Result',
        downloadPng: 'Download PNG',
        copyBtn: 'Copy to Clipboard',
        copied: 'Copied!',
        emotion: 'Emotion',
        features: 'Features',
        size: 'Size',
        howItWorks: 'Features',
        feature1: 'Rich Expressions',
        feature1Desc: 'Support 12 different emotion types',
        feature2: 'Custom Colors',
        feature2Desc: 'Freely adjust face and accent colors',
        feature3: 'Privacy Protected',
        feature3Desc: 'All processing done locally in browser',
        feature4: 'Multiple Sizes',
        feature4Desc: 'Support 64px to 512px sizes',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #508',
        copyright: 'Awesome AI Local Tools © 2024'
    }
};

let currentLang = 'zh-TW';
let selectedEmotion = 'happy';

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
// Emoji Drawing Functions
// ========================================

function drawEmoji(ctx, emotion, faceColor, accentColor, size, bgType) {
    const center = size / 2;
    const radius = size * 0.4;

    ctx.clearRect(0, 0, size, size);

    // Draw background
    if (bgType === 'white') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);
    } else if (bgType === 'circle') {
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.arc(center, center, radius * 1.15, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draw face
    ctx.fillStyle = faceColor;
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw face shadow
    ctx.fillStyle = adjustColor(faceColor, -20);
    ctx.beginPath();
    ctx.arc(center, center + radius * 0.05, radius, 0, Math.PI);
    ctx.fill();

    // Draw expression based on emotion
    drawExpression(ctx, emotion, center, radius, accentColor);

    return getFeatures(emotion);
}

function adjustColor(hex, amount) {
    const num = parseInt(hex.slice(1), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
}

function drawExpression(ctx, emotion, center, radius, accentColor) {
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = radius * 0.06;
    ctx.lineCap = 'round';

    switch (emotion) {
        case 'happy':
            drawHappyFace(ctx, center, radius);
            break;
        case 'sad':
            drawSadFace(ctx, center, radius);
            break;
        case 'angry':
            drawAngryFace(ctx, center, radius, accentColor);
            break;
        case 'surprised':
            drawSurprisedFace(ctx, center, radius);
            break;
        case 'love':
            drawLoveFace(ctx, center, radius, accentColor);
            break;
        case 'wink':
            drawWinkFace(ctx, center, radius);
            break;
        case 'think':
            drawThinkFace(ctx, center, radius);
            break;
        case 'cool':
            drawCoolFace(ctx, center, radius);
            break;
        case 'laugh':
            drawLaughFace(ctx, center, radius);
            break;
        case 'sleepy':
            drawSleepyFace(ctx, center, radius);
            break;
        case 'sick':
            drawSickFace(ctx, center, radius, accentColor);
            break;
        case 'devil':
            drawDevilFace(ctx, center, radius, accentColor);
            break;
    }
}

function drawHappyFace(ctx, c, r) {
    // Eyes
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(c - r * 0.3, c - r * 0.15, r * 0.1, 0, Math.PI * 2);
    ctx.arc(c + r * 0.3, c - r * 0.15, r * 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Mouth
    ctx.beginPath();
    ctx.arc(c, c + r * 0.1, r * 0.35, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();

    // Cheeks
    ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
    ctx.beginPath();
    ctx.ellipse(c - r * 0.5, c + r * 0.15, r * 0.12, r * 0.08, 0, 0, Math.PI * 2);
    ctx.ellipse(c + r * 0.5, c + r * 0.15, r * 0.12, r * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawSadFace(ctx, c, r) {
    // Eyes
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(c - r * 0.3, c - r * 0.1, r * 0.08, 0, Math.PI * 2);
    ctx.arc(c + r * 0.3, c - r * 0.1, r * 0.08, 0, Math.PI * 2);
    ctx.fill();

    // Eyebrows
    ctx.beginPath();
    ctx.moveTo(c - r * 0.45, c - r * 0.35);
    ctx.lineTo(c - r * 0.15, c - r * 0.28);
    ctx.moveTo(c + r * 0.45, c - r * 0.35);
    ctx.lineTo(c + r * 0.15, c - r * 0.28);
    ctx.stroke();

    // Mouth
    ctx.beginPath();
    ctx.arc(c, c + r * 0.45, r * 0.25, 1.1 * Math.PI, 1.9 * Math.PI);
    ctx.stroke();

    // Tear
    ctx.fillStyle = '#60a5fa';
    ctx.beginPath();
    ctx.ellipse(c - r * 0.35, c + r * 0.15, r * 0.06, r * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawAngryFace(ctx, c, r, accentColor) {
    // Eyes
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(c - r * 0.3, c - r * 0.05, r * 0.1, 0, Math.PI * 2);
    ctx.arc(c + r * 0.3, c - r * 0.05, r * 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Angry eyebrows
    ctx.lineWidth = r * 0.08;
    ctx.beginPath();
    ctx.moveTo(c - r * 0.5, c - r * 0.2);
    ctx.lineTo(c - r * 0.15, c - r * 0.35);
    ctx.moveTo(c + r * 0.5, c - r * 0.2);
    ctx.lineTo(c + r * 0.15, c - r * 0.35);
    ctx.stroke();

    // Mouth
    ctx.lineWidth = r * 0.06;
    ctx.beginPath();
    ctx.moveTo(c - r * 0.3, c + r * 0.35);
    ctx.lineTo(c + r * 0.3, c + r * 0.35);
    ctx.stroke();

    // Red face tint
    ctx.fillStyle = accentColor + '30';
    ctx.beginPath();
    ctx.arc(c, c, r, 0, Math.PI * 2);
    ctx.fill();
}

function drawSurprisedFace(ctx, c, r) {
    // Wide eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(c - r * 0.3, c - r * 0.1, r * 0.15, r * 0.18, 0, 0, Math.PI * 2);
    ctx.ellipse(c + r * 0.3, c - r * 0.1, r * 0.15, r * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(c - r * 0.3, c - r * 0.08, r * 0.08, 0, Math.PI * 2);
    ctx.arc(c + r * 0.3, c - r * 0.08, r * 0.08, 0, Math.PI * 2);
    ctx.fill();

    // Raised eyebrows
    ctx.beginPath();
    ctx.arc(c - r * 0.3, c - r * 0.4, r * 0.15, 1.1 * Math.PI, 1.9 * Math.PI);
    ctx.arc(c + r * 0.3, c - r * 0.4, r * 0.15, 1.1 * Math.PI, 1.9 * Math.PI);
    ctx.stroke();

    // O mouth
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.ellipse(c, c + r * 0.35, r * 0.15, r * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawLoveFace(ctx, c, r, accentColor) {
    // Heart eyes
    ctx.fillStyle = accentColor;
    drawHeart(ctx, c - r * 0.3, c - r * 0.1, r * 0.2);
    drawHeart(ctx, c + r * 0.3, c - r * 0.1, r * 0.2);

    // Smile
    ctx.strokeStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(c, c + r * 0.15, r * 0.3, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
}

function drawHeart(ctx, x, y, size) {
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.3);
    ctx.bezierCurveTo(x - size * 0.5, y - size * 0.3, x - size * 0.5, y - size * 0.8, x, y - size * 0.4);
    ctx.bezierCurveTo(x + size * 0.5, y - size * 0.8, x + size * 0.5, y - size * 0.3, x, y + size * 0.3);
    ctx.fill();
}

function drawWinkFace(ctx, c, r) {
    // Open eye
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(c - r * 0.3, c - r * 0.1, r * 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Winking eye
    ctx.beginPath();
    ctx.arc(c + r * 0.3, c - r * 0.1, r * 0.15, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();

    // Smile
    ctx.beginPath();
    ctx.arc(c, c + r * 0.15, r * 0.3, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();

    // Tongue
    ctx.fillStyle = '#f87171';
    ctx.beginPath();
    ctx.arc(c + r * 0.1, c + r * 0.4, r * 0.1, 0, Math.PI);
    ctx.fill();
}

function drawThinkFace(ctx, c, r) {
    // Eyes looking up
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(c - r * 0.25, c - r * 0.2, r * 0.08, 0, Math.PI * 2);
    ctx.arc(c + r * 0.25, c - r * 0.2, r * 0.08, 0, Math.PI * 2);
    ctx.fill();

    // Raised eyebrow
    ctx.beginPath();
    ctx.arc(c + r * 0.25, c - r * 0.4, r * 0.12, 1.1 * Math.PI, 1.9 * Math.PI);
    ctx.stroke();

    // Thinking mouth
    ctx.beginPath();
    ctx.moveTo(c - r * 0.1, c + r * 0.3);
    ctx.quadraticCurveTo(c + r * 0.1, c + r * 0.25, c + r * 0.25, c + r * 0.35);
    ctx.stroke();

    // Hand on chin
    ctx.fillStyle = adjustColor(ctx.canvas.dataset.faceColor || '#fbbf24', -10);
    ctx.beginPath();
    ctx.ellipse(c + r * 0.5, c + r * 0.5, r * 0.15, r * 0.12, -0.3, 0, Math.PI * 2);
    ctx.fill();
}

function drawCoolFace(ctx, c, r) {
    // Sunglasses
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(c - r * 0.55, c - r * 0.25, r * 0.4, r * 0.25, r * 0.05);
    ctx.roundRect(c + r * 0.15, c - r * 0.25, r * 0.4, r * 0.25, r * 0.05);
    ctx.fill();

    // Bridge
    ctx.lineWidth = r * 0.05;
    ctx.beginPath();
    ctx.moveTo(c - r * 0.15, c - r * 0.12);
    ctx.lineTo(c + r * 0.15, c - r * 0.12);
    ctx.stroke();

    // Smirk
    ctx.beginPath();
    ctx.moveTo(c - r * 0.2, c + r * 0.3);
    ctx.quadraticCurveTo(c + r * 0.1, c + r * 0.35, c + r * 0.3, c + r * 0.25);
    ctx.stroke();
}

function drawLaughFace(ctx, c, r) {
    // Closed happy eyes
    ctx.beginPath();
    ctx.arc(c - r * 0.3, c - r * 0.15, r * 0.12, 1.1 * Math.PI, 1.9 * Math.PI);
    ctx.arc(c + r * 0.3, c - r * 0.15, r * 0.12, 1.1 * Math.PI, 1.9 * Math.PI);
    ctx.stroke();

    // Tears of joy
    ctx.fillStyle = '#60a5fa';
    ctx.beginPath();
    ctx.ellipse(c - r * 0.5, c - r * 0.05, r * 0.05, r * 0.08, 0.3, 0, Math.PI * 2);
    ctx.ellipse(c + r * 0.5, c - r * 0.05, r * 0.05, r * 0.08, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Wide open mouth
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.ellipse(c, c + r * 0.3, r * 0.35, r * 0.25, 0, 0, Math.PI);
    ctx.fill();

    // Tongue
    ctx.fillStyle = '#f87171';
    ctx.beginPath();
    ctx.ellipse(c, c + r * 0.45, r * 0.15, r * 0.1, 0, 0, Math.PI);
    ctx.fill();
}

function drawSleepyFace(ctx, c, r) {
    // Closed eyes
    ctx.beginPath();
    ctx.arc(c - r * 0.3, c - r * 0.1, r * 0.12, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.arc(c + r * 0.3, c - r * 0.1, r * 0.12, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();

    // Sleepy mouth
    ctx.beginPath();
    ctx.ellipse(c, c + r * 0.35, r * 0.1, r * 0.15, 0, 0, Math.PI * 2);
    ctx.stroke();

    // ZZZ
    ctx.fillStyle = '#64748b';
    ctx.font = `bold ${r * 0.2}px sans-serif`;
    ctx.fillText('Z', c + r * 0.5, c - r * 0.3);
    ctx.font = `bold ${r * 0.15}px sans-serif`;
    ctx.fillText('z', c + r * 0.65, c - r * 0.45);
    ctx.font = `bold ${r * 0.1}px sans-serif`;
    ctx.fillText('z', c + r * 0.75, c - r * 0.55);
}

function drawSickFace(ctx, c, r, accentColor) {
    // Dizzy eyes
    ctx.beginPath();
    ctx.moveTo(c - r * 0.4, c - r * 0.2);
    ctx.lineTo(c - r * 0.2, c);
    ctx.moveTo(c - r * 0.2, c - r * 0.2);
    ctx.lineTo(c - r * 0.4, c);
    ctx.moveTo(c + r * 0.4, c - r * 0.2);
    ctx.lineTo(c + r * 0.2, c);
    ctx.moveTo(c + r * 0.2, c - r * 0.2);
    ctx.lineTo(c + r * 0.4, c);
    ctx.stroke();

    // Sick mouth
    ctx.beginPath();
    ctx.arc(c, c + r * 0.4, r * 0.2, 1.1 * Math.PI, 1.9 * Math.PI);
    ctx.stroke();

    // Green tint
    ctx.fillStyle = accentColor + '30';
    ctx.beginPath();
    ctx.arc(c, c, r, 0, Math.PI * 2);
    ctx.fill();
}

function drawDevilFace(ctx, c, r, accentColor) {
    // Horns
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.moveTo(c - r * 0.6, c - r * 0.5);
    ctx.lineTo(c - r * 0.45, c - r * 1);
    ctx.lineTo(c - r * 0.3, c - r * 0.6);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(c + r * 0.6, c - r * 0.5);
    ctx.lineTo(c + r * 0.45, c - r * 1);
    ctx.lineTo(c + r * 0.3, c - r * 0.6);
    ctx.closePath();
    ctx.fill();

    // Evil eyes
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(c - r * 0.3, c - r * 0.1, r * 0.1, 0, Math.PI * 2);
    ctx.arc(c + r * 0.3, c - r * 0.1, r * 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Slanted eyebrows
    ctx.beginPath();
    ctx.moveTo(c - r * 0.15, c - r * 0.35);
    ctx.lineTo(c - r * 0.5, c - r * 0.25);
    ctx.moveTo(c + r * 0.15, c - r * 0.35);
    ctx.lineTo(c + r * 0.5, c - r * 0.25);
    ctx.stroke();

    // Smirk
    ctx.beginPath();
    ctx.arc(c, c + r * 0.2, r * 0.3, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
}

function getFeatures(emotion) {
    const features = {
        happy: ['eyes', 'smile', 'cheeks'],
        sad: ['eyes', 'eyebrows', 'frown', 'tear'],
        angry: ['eyes', 'angry eyebrows', 'straight mouth'],
        surprised: ['wide eyes', 'raised eyebrows', 'O mouth'],
        love: ['heart eyes', 'smile'],
        wink: ['winking eye', 'smile', 'tongue'],
        think: ['looking eyes', 'raised eyebrow', 'hand'],
        cool: ['sunglasses', 'smirk'],
        laugh: ['closed eyes', 'tears', 'open mouth'],
        sleepy: ['closed eyes', 'yawn', 'ZZZ'],
        sick: ['X eyes', 'frown', 'green tint'],
        devil: ['horns', 'evil eyes', 'smirk']
    };
    return features[emotion] || [];
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
        { progress: 25, text: currentLang === 'zh-TW' ? '分析表情類型...' : 'Analyzing expression...' },
        { progress: 50, text: currentLang === 'zh-TW' ? '繪製臉部輪廓...' : 'Drawing face outline...' },
        { progress: 75, text: currentLang === 'zh-TW' ? '添加表情特徵...' : 'Adding expression features...' },
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

function updateStats(emotion, features, size) {
    const emotionName = t('emotion' + emotion.charAt(0).toUpperCase() + emotion.slice(1));
    const statsHtml = `
        <div class="stat-item">
            <span class="stat-label">${t('emotion')}:</span>
            <span class="stat-value">${emotionName}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">${t('features')}:</span>
            <span class="stat-value">${features.length}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">${t('size')}:</span>
            <span class="stat-value">${size}x${size}</span>
        </div>
    `;
    document.getElementById('outputStats').innerHTML = statsHtml;
}

function downloadEmoji() {
    const canvas = document.getElementById('emojiCanvas');
    const link = document.createElement('a');
    link.download = `emoji-${selectedEmotion}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

async function copyToClipboard() {
    const canvas = document.getElementById('emojiCanvas');
    try {
        const blob = await new Promise(resolve => canvas.toBlob(resolve));
        await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
        ]);
        const copyBtn = document.getElementById('copyBtn');
        const originalText = copyBtn.textContent;
        copyBtn.textContent = t('copied');
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    } catch (err) {
        console.error('Failed to copy:', err);
    }
}

// ========================================
// Event Handlers
// ========================================

function initEventListeners() {
    // Language switcher
    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    // Emotion selection
    document.querySelectorAll('.emotion-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.emotion-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedEmotion = btn.dataset.emotion;
        });
    });

    // Generate button
    document.getElementById('generateBtn').addEventListener('click', async () => {
        const btn = document.getElementById('generateBtn');
        btn.disabled = true;
        btn.querySelector('span').textContent = t('generating');

        await showProgress();

        const faceColor = document.getElementById('faceColor').value;
        const accentColor = document.getElementById('accentColor').value;
        const size = parseInt(document.getElementById('sizeSelect').value);
        const bgType = document.getElementById('bgSelect').value;

        const canvas = document.getElementById('emojiCanvas');
        canvas.width = size;
        canvas.height = size;
        canvas.dataset.faceColor = faceColor;
        const ctx = canvas.getContext('2d');

        const features = drawEmoji(ctx, selectedEmotion, faceColor, accentColor, size, bgType);

        document.getElementById('progressSection').style.display = 'none';
        document.getElementById('canvasSection').style.display = 'block';
        document.getElementById('outputSection').style.display = 'block';

        updateStats(selectedEmotion, features, size);

        btn.disabled = false;
        btn.querySelector('span').textContent = t('generateBtn');

        document.getElementById('canvasSection').scrollIntoView({ behavior: 'smooth' });
    });

    // Download button
    document.getElementById('downloadBtn').addEventListener('click', downloadEmoji);

    // Copy button
    document.getElementById('copyBtn').addEventListener('click', copyToClipboard);
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
    console.log('Emoji Generator initialized - Tool #508');
}

init();
