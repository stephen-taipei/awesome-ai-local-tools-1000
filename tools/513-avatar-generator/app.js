/**
 * AI Avatar Generator - Tool #513
 * Awesome AI Local Tools
 *
 * Generates unique avatar images locally in the browser
 */

// ========================================
// Internationalization (i18n)
// ========================================

const translations = {
    'zh-TW': {
        title: 'AI 頭像生成器',
        subtitle: '完全在瀏覽器本地執行，資料不外傳',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        avatarOptions: '頭像選項',
        avatarStyle: '頭像風格',
        cartoon: '卡通',
        pixel: '像素',
        '3d': '3D',
        minimalist: '極簡',
        backgroundColor: '背景顏色',
        skinTone: '膚色',
        features: '特徵',
        hair: '髮型',
        eyes: '眼睛',
        accessories: '配件',
        randomize: '隨機',
        avatarSize: '頭像尺寸',
        generate: '生成頭像',
        randomAll: '全部隨機',
        generating: '生成中...',
        statistics: '統計資訊',
        statStyle: '風格',
        statFeatures: '特徵數',
        statSize: '尺寸',
        statSeed: '種子碼',
        downloadPng: '下載 PNG',
        downloadSvg: '下載 SVG',
        backToHome: '返回首頁',
        toolNumber: '工具 #513',
        copyright: 'Awesome AI Local Tools'
    },
    'en': {
        title: 'AI Avatar Generator',
        subtitle: 'Runs entirely in your browser, data never leaves your device',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        avatarOptions: 'Avatar Options',
        avatarStyle: 'Avatar Style',
        cartoon: 'Cartoon',
        pixel: 'Pixel',
        '3d': '3D',
        minimalist: 'Minimalist',
        backgroundColor: 'Background Color',
        skinTone: 'Skin Tone',
        features: 'Features',
        hair: 'Hair',
        eyes: 'Eyes',
        accessories: 'Accessories',
        randomize: 'Random',
        avatarSize: 'Avatar Size',
        generate: 'Generate Avatar',
        randomAll: 'Randomize All',
        generating: 'Generating...',
        statistics: 'Statistics',
        statStyle: 'Style',
        statFeatures: 'Features',
        statSize: 'Size',
        statSeed: 'Seed',
        downloadPng: 'Download PNG',
        downloadSvg: 'Download SVG',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #513',
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
    style: 'cartoon',
    bgColor: '#6366f1',
    skinTone: '#EDB98A',
    size: 256,
    hair: 0,
    eyes: 0,
    accessories: 0,
    seed: 0,
    isGenerating: false,
    generatedImage: null
};

// Avatar feature options
const features = {
    hair: {
        cartoon: ['short', 'long', 'curly', 'spiky', 'bald', 'ponytail', 'mohawk', 'afro'],
        pixel: ['short', 'long', 'spiky', 'bald', 'cap'],
        '3d': ['short', 'long', 'curly', 'wavy', 'bald', 'bun'],
        minimalist: ['dot', 'line', 'none', 'circle']
    },
    eyes: {
        cartoon: ['normal', 'happy', 'surprised', 'sleepy', 'wink', 'glasses'],
        pixel: ['dot', 'line', 'square'],
        '3d': ['round', 'almond', 'narrow', 'wide'],
        minimalist: ['dot', 'line', 'circle']
    },
    accessories: {
        cartoon: ['none', 'glasses', 'hat', 'earring', 'headphones', 'bow'],
        pixel: ['none', 'glasses', 'hat'],
        '3d': ['none', 'glasses', 'earring', 'necklace'],
        minimalist: ['none', 'dot', 'line']
    }
};

// ========================================
// DOM Elements
// ========================================

const elements = {
    canvas: document.getElementById('avatarCanvas'),
    generateBtn: document.getElementById('generateBtn'),
    randomAllBtn: document.getElementById('randomAllBtn'),
    processingOverlay: document.getElementById('processingOverlay'),
    progressContainer: document.getElementById('progressContainer'),
    progressFill: document.getElementById('progressFill'),
    progressText: document.getElementById('progressText'),
    statsPanel: document.getElementById('statsPanel'),
    actionsPanel: document.getElementById('actionsPanel'),
    bgColor: document.getElementById('bgColor'),
    avatarSize: document.getElementById('avatarSize'),
    downloadPng: document.getElementById('downloadPng'),
    downloadSvg: document.getElementById('downloadSvg')
};

const ctx = elements.canvas.getContext('2d');

// ========================================
// Avatar Drawing Functions
// ========================================

function drawCartoonAvatar(size, skinTone, hairType, eyeType, accessory) {
    const center = size / 2;
    const headRadius = size * 0.35;

    // Face
    ctx.fillStyle = skinTone;
    ctx.beginPath();
    ctx.arc(center, center, headRadius, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    const hairColors = ['#2C1810', '#4A3728', '#8B4513', '#D4A574', '#1a1a1a', '#E8B89D', '#FF6B6B', '#4ECDC4'];
    ctx.fillStyle = hairColors[state.hair % hairColors.length];

    switch (hairType) {
        case 'short':
            ctx.beginPath();
            ctx.arc(center, center - headRadius * 0.2, headRadius * 0.9, Math.PI, 0);
            ctx.fill();
            break;
        case 'long':
            ctx.beginPath();
            ctx.arc(center, center - headRadius * 0.1, headRadius * 0.95, Math.PI * 0.8, Math.PI * 0.2);
            ctx.fill();
            ctx.fillRect(center - headRadius * 0.8, center, headRadius * 0.3, headRadius * 0.8);
            ctx.fillRect(center + headRadius * 0.5, center, headRadius * 0.3, headRadius * 0.8);
            break;
        case 'curly':
            for (let i = 0; i < 8; i++) {
                const angle = Math.PI + (i / 8) * Math.PI;
                const x = center + Math.cos(angle) * headRadius * 0.85;
                const y = center + Math.sin(angle) * headRadius * 0.85 - headRadius * 0.2;
                ctx.beginPath();
                ctx.arc(x, y, headRadius * 0.25, 0, Math.PI * 2);
                ctx.fill();
            }
            break;
        case 'spiky':
            for (let i = 0; i < 7; i++) {
                const angle = Math.PI + (i / 6) * Math.PI;
                ctx.beginPath();
                ctx.moveTo(center, center - headRadius * 0.3);
                ctx.lineTo(center + Math.cos(angle) * headRadius * 1.1, center + Math.sin(angle) * headRadius * 0.8 - headRadius * 0.5);
                ctx.lineTo(center + Math.cos(angle + 0.15) * headRadius * 0.7, center - headRadius * 0.1);
                ctx.fill();
            }
            break;
        case 'ponytail':
            ctx.beginPath();
            ctx.arc(center, center - headRadius * 0.2, headRadius * 0.85, Math.PI, 0);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(center + headRadius * 0.7, center - headRadius * 0.3, headRadius * 0.15, headRadius * 0.4, 0.3, 0, Math.PI * 2);
            ctx.fill();
            break;
        default:
            ctx.beginPath();
            ctx.arc(center, center - headRadius * 0.15, headRadius * 0.8, Math.PI, 0);
            ctx.fill();
    }

    // Eyes
    const eyeY = center - headRadius * 0.1;
    const eyeSpacing = headRadius * 0.35;
    ctx.fillStyle = '#FFFFFF';

    switch (eyeType) {
        case 'happy':
            ctx.strokeStyle = '#2C1810';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(center - eyeSpacing, eyeY, headRadius * 0.12, 0, Math.PI, true);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(center + eyeSpacing, eyeY, headRadius * 0.12, 0, Math.PI, true);
            ctx.stroke();
            break;
        case 'surprised':
            ctx.beginPath();
            ctx.arc(center - eyeSpacing, eyeY, headRadius * 0.15, 0, Math.PI * 2);
            ctx.arc(center + eyeSpacing, eyeY, headRadius * 0.15, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#2C1810';
            ctx.beginPath();
            ctx.arc(center - eyeSpacing, eyeY, headRadius * 0.08, 0, Math.PI * 2);
            ctx.arc(center + eyeSpacing, eyeY, headRadius * 0.08, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'wink':
            ctx.beginPath();
            ctx.arc(center - eyeSpacing, eyeY, headRadius * 0.12, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#2C1810';
            ctx.beginPath();
            ctx.arc(center - eyeSpacing, eyeY, headRadius * 0.06, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#2C1810';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(center + eyeSpacing, eyeY, headRadius * 0.1, 0.2, Math.PI - 0.2);
            ctx.stroke();
            break;
        default:
            ctx.beginPath();
            ctx.arc(center - eyeSpacing, eyeY, headRadius * 0.12, 0, Math.PI * 2);
            ctx.arc(center + eyeSpacing, eyeY, headRadius * 0.12, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#2C1810';
            ctx.beginPath();
            ctx.arc(center - eyeSpacing, eyeY, headRadius * 0.06, 0, Math.PI * 2);
            ctx.arc(center + eyeSpacing, eyeY, headRadius * 0.06, 0, Math.PI * 2);
            ctx.fill();
    }

    // Mouth
    ctx.strokeStyle = '#C4897A';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(center, center + headRadius * 0.25, headRadius * 0.15, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // Accessories
    switch (accessory) {
        case 'glasses':
            ctx.strokeStyle = '#1a1a1a';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(center - eyeSpacing, eyeY, headRadius * 0.18, 0, Math.PI * 2);
            ctx.arc(center + eyeSpacing, eyeY, headRadius * 0.18, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(center - eyeSpacing + headRadius * 0.18, eyeY);
            ctx.lineTo(center + eyeSpacing - headRadius * 0.18, eyeY);
            ctx.stroke();
            break;
        case 'hat':
            ctx.fillStyle = '#4A90D9';
            ctx.beginPath();
            ctx.ellipse(center, center - headRadius * 0.8, headRadius * 0.9, headRadius * 0.15, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(center - headRadius * 0.4, center - headRadius * 1.3, headRadius * 0.8, headRadius * 0.5);
            break;
        case 'earring':
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(center - headRadius * 0.9, center + headRadius * 0.1, headRadius * 0.08, 0, Math.PI * 2);
            ctx.arc(center + headRadius * 0.9, center + headRadius * 0.1, headRadius * 0.08, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'headphones':
            ctx.strokeStyle = '#1a1a1a';
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.arc(center, center - headRadius * 0.3, headRadius * 0.9, Math.PI * 0.8, Math.PI * 0.2);
            ctx.stroke();
            ctx.fillStyle = '#333';
            ctx.beginPath();
            ctx.ellipse(center - headRadius * 0.85, center, headRadius * 0.15, headRadius * 0.25, 0, 0, Math.PI * 2);
            ctx.ellipse(center + headRadius * 0.85, center, headRadius * 0.15, headRadius * 0.25, 0, 0, Math.PI * 2);
            ctx.fill();
            break;
    }
}

function drawPixelAvatar(size, skinTone, hairType, eyeType, accessory) {
    const pixelSize = size / 16;
    const center = size / 2;

    // Helper to draw pixel
    function pixel(x, y, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    }

    // Face (8x8 centered)
    for (let y = 5; y < 13; y++) {
        for (let x = 4; x < 12; x++) {
            if ((y === 5 || y === 12) && (x === 4 || x === 11)) continue;
            pixel(x, y, skinTone);
        }
    }

    // Hair
    const hairColors = ['#2C1810', '#4A3728', '#8B4513', '#1a1a1a', '#D4A574'];
    const hairColor = hairColors[state.hair % hairColors.length];

    switch (hairType) {
        case 'short':
            for (let x = 4; x < 12; x++) pixel(x, 4, hairColor);
            for (let x = 5; x < 11; x++) pixel(x, 3, hairColor);
            break;
        case 'long':
            for (let x = 4; x < 12; x++) pixel(x, 4, hairColor);
            for (let x = 5; x < 11; x++) pixel(x, 3, hairColor);
            for (let y = 5; y < 14; y++) { pixel(3, y, hairColor); pixel(12, y, hairColor); }
            break;
        case 'spiky':
            for (let x = 4; x < 12; x++) pixel(x, 4, hairColor);
            pixel(5, 2, hairColor); pixel(7, 1, hairColor); pixel(8, 2, hairColor); pixel(10, 2, hairColor);
            break;
        case 'cap':
            for (let x = 3; x < 13; x++) pixel(x, 4, '#4A90D9');
            for (let x = 4; x < 12; x++) pixel(x, 3, '#4A90D9');
            break;
    }

    // Eyes
    const eyeColor = '#2C1810';
    switch (eyeType) {
        case 'dot':
            pixel(5, 7, eyeColor); pixel(10, 7, eyeColor);
            break;
        case 'line':
            pixel(5, 7, eyeColor); pixel(6, 7, eyeColor);
            pixel(9, 7, eyeColor); pixel(10, 7, eyeColor);
            break;
        default:
            pixel(5, 7, '#fff'); pixel(6, 7, eyeColor);
            pixel(9, 7, '#fff'); pixel(10, 7, eyeColor);
    }

    // Mouth
    pixel(6, 10, '#C4897A'); pixel(7, 10, '#C4897A'); pixel(8, 10, '#C4897A'); pixel(9, 10, '#C4897A');

    // Accessories
    if (accessory === 'glasses') {
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 2;
        ctx.strokeRect(4 * pixelSize, 6 * pixelSize, 3 * pixelSize, 2 * pixelSize);
        ctx.strokeRect(9 * pixelSize, 6 * pixelSize, 3 * pixelSize, 2 * pixelSize);
    }
}

function draw3DAvatar(size, skinTone, hairType, eyeType, accessory) {
    const center = size / 2;
    const headRadius = size * 0.35;

    // Create 3D effect with gradients
    // Face shadow
    const faceGradient = ctx.createRadialGradient(
        center - headRadius * 0.3, center - headRadius * 0.3, 0,
        center, center, headRadius * 1.2
    );
    faceGradient.addColorStop(0, lightenColor(skinTone, 30));
    faceGradient.addColorStop(0.5, skinTone);
    faceGradient.addColorStop(1, darkenColor(skinTone, 30));

    ctx.fillStyle = faceGradient;
    ctx.beginPath();
    ctx.arc(center, center, headRadius, 0, Math.PI * 2);
    ctx.fill();

    // Add subtle shadow
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.beginPath();
    ctx.ellipse(center + headRadius * 0.1, center + headRadius * 0.8, headRadius * 0.6, headRadius * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hair with 3D gradient
    const hairColors = ['#2C1810', '#4A3728', '#8B4513', '#D4A574', '#1a1a1a'];
    const baseHairColor = hairColors[state.hair % hairColors.length];
    const hairGradient = ctx.createLinearGradient(center - headRadius, center - headRadius, center + headRadius, center);
    hairGradient.addColorStop(0, lightenColor(baseHairColor, 20));
    hairGradient.addColorStop(1, darkenColor(baseHairColor, 20));
    ctx.fillStyle = hairGradient;

    switch (hairType) {
        case 'short':
            ctx.beginPath();
            ctx.arc(center, center - headRadius * 0.15, headRadius * 0.88, Math.PI * 0.9, Math.PI * 0.1);
            ctx.fill();
            break;
        case 'long':
            ctx.beginPath();
            ctx.arc(center, center - headRadius * 0.1, headRadius * 0.92, Math.PI * 0.85, Math.PI * 0.15);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(center - headRadius * 0.6, center + headRadius * 0.3, headRadius * 0.2, headRadius * 0.5, -0.2, 0, Math.PI * 2);
            ctx.ellipse(center + headRadius * 0.6, center + headRadius * 0.3, headRadius * 0.2, headRadius * 0.5, 0.2, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'curly':
            for (let i = 0; i < 10; i++) {
                const angle = Math.PI * 0.8 + (i / 10) * Math.PI * 0.4;
                const x = center + Math.cos(angle) * headRadius * 0.9;
                const y = center + Math.sin(angle) * headRadius * 0.9 - headRadius * 0.15;
                ctx.beginPath();
                ctx.arc(x, y, headRadius * 0.2, 0, Math.PI * 2);
                ctx.fill();
            }
            break;
        case 'bun':
            ctx.beginPath();
            ctx.arc(center, center - headRadius * 0.15, headRadius * 0.85, Math.PI * 0.9, Math.PI * 0.1);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(center, center - headRadius * 0.9, headRadius * 0.3, 0, Math.PI * 2);
            ctx.fill();
            break;
    }

    // 3D Eyes
    const eyeY = center - headRadius * 0.05;
    const eyeSpacing = headRadius * 0.32;

    // Eye whites with gradient
    const eyeGradient = ctx.createRadialGradient(
        center - eyeSpacing, eyeY - 2, 0,
        center - eyeSpacing, eyeY, headRadius * 0.15
    );
    eyeGradient.addColorStop(0, '#FFFFFF');
    eyeGradient.addColorStop(1, '#E8E8E8');
    ctx.fillStyle = eyeGradient;
    ctx.beginPath();
    ctx.ellipse(center - eyeSpacing, eyeY, headRadius * 0.13, headRadius * 0.1, 0, 0, Math.PI * 2);
    ctx.ellipse(center + eyeSpacing, eyeY, headRadius * 0.13, headRadius * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    // Iris
    ctx.fillStyle = '#4A6FA5';
    ctx.beginPath();
    ctx.arc(center - eyeSpacing, eyeY, headRadius * 0.06, 0, Math.PI * 2);
    ctx.arc(center + eyeSpacing, eyeY, headRadius * 0.06, 0, Math.PI * 2);
    ctx.fill();

    // Pupil
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(center - eyeSpacing, eyeY, headRadius * 0.03, 0, Math.PI * 2);
    ctx.arc(center + eyeSpacing, eyeY, headRadius * 0.03, 0, Math.PI * 2);
    ctx.fill();

    // Eye highlight
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(center - eyeSpacing - 2, eyeY - 2, headRadius * 0.02, 0, Math.PI * 2);
    ctx.arc(center + eyeSpacing - 2, eyeY - 2, headRadius * 0.02, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.fillStyle = darkenColor(skinTone, 15);
    ctx.beginPath();
    ctx.ellipse(center, center + headRadius * 0.1, headRadius * 0.05, headRadius * 0.08, 0, 0, Math.PI);
    ctx.fill();

    // Mouth
    ctx.fillStyle = '#C4897A';
    ctx.beginPath();
    ctx.ellipse(center, center + headRadius * 0.3, headRadius * 0.12, headRadius * 0.05, 0, 0, Math.PI);
    ctx.fill();

    // Accessories
    if (accessory === 'glasses') {
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(center - eyeSpacing, eyeY, headRadius * 0.18, headRadius * 0.12, 0, 0, Math.PI * 2);
        ctx.ellipse(center + eyeSpacing, eyeY, headRadius * 0.18, headRadius * 0.12, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(center - eyeSpacing + headRadius * 0.18, eyeY);
        ctx.lineTo(center + eyeSpacing - headRadius * 0.18, eyeY);
        ctx.stroke();
    }
}

function drawMinimalistAvatar(size, skinTone, hairType, eyeType, accessory) {
    const center = size / 2;
    const headRadius = size * 0.35;

    // Simple circle face
    ctx.fillStyle = skinTone;
    ctx.beginPath();
    ctx.arc(center, center, headRadius, 0, Math.PI * 2);
    ctx.fill();

    // Minimalist hair
    ctx.fillStyle = '#2C1810';
    switch (hairType) {
        case 'dot':
            ctx.beginPath();
            ctx.arc(center, center - headRadius * 0.7, headRadius * 0.15, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'line':
            ctx.strokeStyle = '#2C1810';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(center - headRadius * 0.5, center - headRadius * 0.7);
            ctx.lineTo(center + headRadius * 0.5, center - headRadius * 0.7);
            ctx.stroke();
            break;
        case 'circle':
            ctx.strokeStyle = '#2C1810';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(center, center - headRadius * 0.3, headRadius * 0.6, Math.PI, 0);
            ctx.stroke();
            break;
    }

    // Minimalist eyes
    ctx.fillStyle = '#1a1a1a';
    const eyeY = center - headRadius * 0.1;
    const eyeSpacing = headRadius * 0.3;

    switch (eyeType) {
        case 'dot':
            ctx.beginPath();
            ctx.arc(center - eyeSpacing, eyeY, 4, 0, Math.PI * 2);
            ctx.arc(center + eyeSpacing, eyeY, 4, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'line':
            ctx.strokeStyle = '#1a1a1a';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(center - eyeSpacing - 8, eyeY);
            ctx.lineTo(center - eyeSpacing + 8, eyeY);
            ctx.moveTo(center + eyeSpacing - 8, eyeY);
            ctx.lineTo(center + eyeSpacing + 8, eyeY);
            ctx.stroke();
            break;
        case 'circle':
            ctx.strokeStyle = '#1a1a1a';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(center - eyeSpacing, eyeY, 6, 0, Math.PI * 2);
            ctx.arc(center + eyeSpacing, eyeY, 6, 0, Math.PI * 2);
            ctx.stroke();
            break;
    }

    // Simple mouth - just a line
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(center - headRadius * 0.15, center + headRadius * 0.25);
    ctx.lineTo(center + headRadius * 0.15, center + headRadius * 0.25);
    ctx.stroke();
}

// Color utility functions
function lightenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

function darkenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
    const B = Math.max(0, (num & 0x0000FF) - amt);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

// ========================================
// Main Generation Function
// ========================================

async function generateAvatar(randomizeAll = false) {
    if (state.isGenerating) return;

    if (randomizeAll) {
        state.hair = Math.floor(Math.random() * 100);
        state.eyes = Math.floor(Math.random() * 100);
        state.accessories = Math.floor(Math.random() * 100);
        state.bgColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        elements.bgColor.value = state.bgColor;

        const styles = ['cartoon', 'pixel', '3d', 'minimalist'];
        state.style = styles[Math.floor(Math.random() * styles.length)];
        document.querySelectorAll('.style-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.style === state.style);
        });

        const skinTones = ['#FFDBB4', '#EDB98A', '#D08B5B', '#AE5D29', '#694D3D'];
        state.skinTone = skinTones[Math.floor(Math.random() * skinTones.length)];
        document.querySelectorAll('.skin-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.color === state.skinTone);
        });
    }

    state.seed = Math.floor(Math.random() * 1000000);
    state.isGenerating = true;
    elements.generateBtn.disabled = true;
    elements.randomAllBtn.disabled = true;
    elements.processingOverlay.style.display = 'flex';
    elements.progressContainer.style.display = 'flex';
    elements.statsPanel.style.display = 'none';
    elements.actionsPanel.style.display = 'none';

    elements.canvas.width = state.size;
    elements.canvas.height = state.size;

    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress > 90) progress = 90;
        updateProgress(progress);
    }, 80);

    await new Promise(resolve => setTimeout(resolve, 100));

    // Clear and draw background
    ctx.fillStyle = state.bgColor;
    ctx.beginPath();
    ctx.arc(state.size / 2, state.size / 2, state.size / 2, 0, Math.PI * 2);
    ctx.fill();

    // Get feature names for current style
    const styleFeatures = features.hair[state.style] || features.hair.cartoon;
    const hairType = styleFeatures[state.hair % styleFeatures.length];
    const eyeFeatures = features.eyes[state.style] || features.eyes.cartoon;
    const eyeType = eyeFeatures[state.eyes % eyeFeatures.length];
    const accFeatures = features.accessories[state.style] || features.accessories.cartoon;
    const accessory = accFeatures[state.accessories % accFeatures.length];

    // Draw avatar based on style
    switch (state.style) {
        case 'cartoon':
            drawCartoonAvatar(state.size, state.skinTone, hairType, eyeType, accessory);
            break;
        case 'pixel':
            drawPixelAvatar(state.size, state.skinTone, hairType, eyeType, accessory);
            break;
        case '3d':
            draw3DAvatar(state.size, state.skinTone, hairType, eyeType, accessory);
            break;
        case 'minimalist':
            drawMinimalistAvatar(state.size, state.skinTone, hairType, eyeType, accessory);
            break;
    }

    clearInterval(progressInterval);
    updateProgress(100);

    await new Promise(resolve => setTimeout(resolve, 200));

    state.generatedImage = elements.canvas.toDataURL('image/png');

    // Count features
    const featureCount = (hairType !== 'bald' && hairType !== 'none' ? 1 : 0) + 1 + (accessory !== 'none' ? 1 : 0);

    // Update stats
    document.getElementById('statStyle').textContent = t(state.style);
    document.getElementById('statFeatures').textContent = featureCount;
    document.getElementById('statSize').textContent = `${state.size} x ${state.size}`;
    document.getElementById('statSeed').textContent = state.seed;

    elements.processingOverlay.style.display = 'none';
    elements.progressContainer.style.display = 'none';
    elements.statsPanel.style.display = 'block';
    elements.actionsPanel.style.display = 'flex';
    elements.generateBtn.disabled = false;
    elements.randomAllBtn.disabled = false;
    state.isGenerating = false;
}

function updateProgress(value) {
    elements.progressFill.style.width = `${value}%`;
    elements.progressText.textContent = `${Math.round(value)}%`;
}

// ========================================
// Download Functions
// ========================================

function downloadPng() {
    if (!state.generatedImage) return;
    const link = document.createElement('a');
    link.download = `avatar-${state.style}-${state.seed}.png`;
    link.href = state.generatedImage;
    link.click();
}

function downloadSvg() {
    // Create a simple SVG representation
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${state.size}" height="${state.size}">
        <circle cx="${state.size/2}" cy="${state.size/2}" r="${state.size/2}" fill="${state.bgColor}"/>
        <image href="${state.generatedImage}" width="${state.size}" height="${state.size}"/>
    </svg>`;

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const link = document.createElement('a');
    link.download = `avatar-${state.style}-${state.seed}.svg`;
    link.href = URL.createObjectURL(blob);
    link.click();
}

// ========================================
// Event Listeners
// ========================================

function initEventListeners() {
    // Language switcher
    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    // Style buttons
    document.querySelectorAll('.style-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.style-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.style = btn.dataset.style;
        });
    });

    // Skin tone buttons
    document.querySelectorAll('.skin-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.skin-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.skinTone = btn.dataset.color;
        });
    });

    // Feature randomize buttons
    document.querySelectorAll('.feature-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const feature = btn.dataset.feature;
            state[feature] = Math.floor(Math.random() * 100);
        });
    });

    // Background color
    elements.bgColor.addEventListener('input', (e) => {
        state.bgColor = e.target.value;
    });

    // Avatar size
    elements.avatarSize.addEventListener('change', (e) => {
        state.size = parseInt(e.target.value);
    });

    // Generate buttons
    elements.generateBtn.addEventListener('click', () => generateAvatar(false));
    elements.randomAllBtn.addEventListener('click', () => generateAvatar(true));

    // Download buttons
    elements.downloadPng.addEventListener('click', downloadPng);
    elements.downloadSvg.addEventListener('click', downloadSvg);
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

    // Draw placeholder
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(state.size / 2, state.size / 2, state.size / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#64748b';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(t('generate'), state.size / 2, state.size / 2);

    console.log('AI Avatar Generator initialized');
}

init();
