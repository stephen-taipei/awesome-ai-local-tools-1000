/**
 * AI Character Generator - Tool #514
 * Awesome AI Local Tools
 *
 * Generates full body character silhouettes locally in the browser
 */

// ========================================
// Internationalization (i18n)
// ========================================

const translations = {
    'zh-TW': {
        title: 'AI 角色生成器',
        subtitle: '完全在瀏覽器本地執行，資料不外傳',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        characterOptions: '角色選項',
        characterType: '角色類型',
        warrior: '戰士',
        mage: '法師',
        archer: '弓箭手',
        robot: '機器人',
        pose: '姿勢',
        standing: '站立',
        action: '動作',
        idle: '待機',
        colorScheme: '配色方案',
        primary: '主色',
        secondary: '輔色',
        accent: '強調色',
        attributes: '屬性加成',
        strength: '力量',
        agility: '敏捷',
        magic: '魔力',
        canvasSize: '畫布尺寸',
        generate: '生成角色',
        randomize: '隨機生成',
        generating: '生成中...',
        statistics: '統計資訊',
        statType: '類型',
        statAttributes: '屬性總和',
        statPose: '姿勢',
        statSize: '尺寸',
        downloadPng: '下載 PNG',
        downloadJpg: '下載 JPG',
        backToHome: '返回首頁',
        toolNumber: '工具 #514',
        copyright: 'Awesome AI Local Tools'
    },
    'en': {
        title: 'AI Character Generator',
        subtitle: 'Runs entirely in your browser, data never leaves your device',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        characterOptions: 'Character Options',
        characterType: 'Character Type',
        warrior: 'Warrior',
        mage: 'Mage',
        archer: 'Archer',
        robot: 'Robot',
        pose: 'Pose',
        standing: 'Standing',
        action: 'Action',
        idle: 'Idle',
        colorScheme: 'Color Scheme',
        primary: 'Primary',
        secondary: 'Secondary',
        accent: 'Accent',
        attributes: 'Attributes',
        strength: 'STR',
        agility: 'AGI',
        magic: 'MAG',
        canvasSize: 'Canvas Size',
        generate: 'Generate Character',
        randomize: 'Randomize',
        generating: 'Generating...',
        statistics: 'Statistics',
        statType: 'Type',
        statAttributes: 'Total Stats',
        statPose: 'Pose',
        statSize: 'Size',
        downloadPng: 'Download PNG',
        downloadJpg: 'Download JPG',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #514',
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
    type: 'warrior',
    pose: 'standing',
    primaryColor: '#4ade80',
    secondaryColor: '#22c55e',
    accentColor: '#16a34a',
    strength: 5,
    agility: 5,
    magic: 5,
    canvasWidth: 512,
    canvasHeight: 768,
    isGenerating: false,
    generatedImage: null
};

// ========================================
// DOM Elements
// ========================================

const elements = {
    canvas: document.getElementById('characterCanvas'),
    generateBtn: document.getElementById('generateBtn'),
    randomBtn: document.getElementById('randomBtn'),
    processingOverlay: document.getElementById('processingOverlay'),
    progressContainer: document.getElementById('progressContainer'),
    progressFill: document.getElementById('progressFill'),
    progressText: document.getElementById('progressText'),
    statsPanel: document.getElementById('statsPanel'),
    actionsPanel: document.getElementById('actionsPanel'),
    primaryColor: document.getElementById('primaryColor'),
    secondaryColor: document.getElementById('secondaryColor'),
    accentColor: document.getElementById('accentColor'),
    strength: document.getElementById('strength'),
    agility: document.getElementById('agility'),
    magic: document.getElementById('magic'),
    strengthVal: document.getElementById('strengthVal'),
    agilityVal: document.getElementById('agilityVal'),
    magicVal: document.getElementById('magicVal'),
    canvasSize: document.getElementById('canvasSize'),
    downloadPng: document.getElementById('downloadPng'),
    downloadJpg: document.getElementById('downloadJpg')
};

const ctx = elements.canvas.getContext('2d');

// ========================================
// Utility Functions
// ========================================

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

function lightenColor(hex, percent) {
    const rgb = hexToRgb(hex);
    const amt = Math.round(2.55 * percent);
    return `rgb(${Math.min(255, rgb.r + amt)}, ${Math.min(255, rgb.g + amt)}, ${Math.min(255, rgb.b + amt)})`;
}

function darkenColor(hex, percent) {
    const rgb = hexToRgb(hex);
    const amt = Math.round(2.55 * percent);
    return `rgb(${Math.max(0, rgb.r - amt)}, ${Math.max(0, rgb.g - amt)}, ${Math.max(0, rgb.b - amt)})`;
}

// ========================================
// Character Drawing Functions
// ========================================

function drawWarrior(width, height, pose) {
    const centerX = width / 2;
    const scale = height / 768;

    // Body proportions
    const headSize = 60 * scale;
    const bodyWidth = 120 * scale;
    const bodyHeight = 180 * scale;
    const legLength = 200 * scale;
    const armLength = 150 * scale;

    // Calculate pose offsets
    let armAngleL = -0.3, armAngleR = 0.3;
    let legAngleL = 0.1, legAngleR = -0.1;
    let bodyTilt = 0;

    if (pose === 'action') {
        armAngleL = -1.2;
        armAngleR = 0.8;
        legAngleL = 0.4;
        legAngleR = -0.3;
        bodyTilt = 0.1;
    } else if (pose === 'idle') {
        armAngleL = -0.1;
        armAngleR = 0.1;
    }

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(centerX, height - 50 * scale, bodyWidth * 0.8, 20 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    const legStartY = height / 2 + bodyHeight / 2 - 20 * scale;
    drawLimb(centerX - 30 * scale, legStartY, legLength, 35 * scale, legAngleL + Math.PI / 2, state.secondaryColor);
    drawLimb(centerX + 30 * scale, legStartY, legLength, 35 * scale, legAngleR + Math.PI / 2, state.secondaryColor);

    // Boots
    ctx.fillStyle = darkenColor(state.secondaryColor, 30);
    const bootLX = centerX - 30 * scale + Math.sin(legAngleL + Math.PI / 2) * legLength;
    const bootLY = legStartY + Math.cos(legAngleL + Math.PI / 2) * legLength;
    const bootRX = centerX + 30 * scale + Math.sin(legAngleR + Math.PI / 2) * legLength;
    const bootRY = legStartY + Math.cos(legAngleR + Math.PI / 2) * legLength;
    ctx.fillRect(bootLX - 25 * scale, bootLY - 10 * scale, 50 * scale, 40 * scale);
    ctx.fillRect(bootRX - 25 * scale, bootRY - 10 * scale, 50 * scale, 40 * scale);

    // Body/Armor
    ctx.save();
    ctx.translate(centerX, height / 2 - bodyHeight / 4);
    ctx.rotate(bodyTilt);

    // Torso armor
    const torsoGradient = ctx.createLinearGradient(-bodyWidth / 2, 0, bodyWidth / 2, 0);
    torsoGradient.addColorStop(0, darkenColor(state.primaryColor, 20));
    torsoGradient.addColorStop(0.5, state.primaryColor);
    torsoGradient.addColorStop(1, darkenColor(state.primaryColor, 20));
    ctx.fillStyle = torsoGradient;

    ctx.beginPath();
    ctx.moveTo(-bodyWidth / 2, -bodyHeight / 3);
    ctx.lineTo(-bodyWidth / 2 - 20 * scale, bodyHeight / 3);
    ctx.lineTo(bodyWidth / 2 + 20 * scale, bodyHeight / 3);
    ctx.lineTo(bodyWidth / 2, -bodyHeight / 3);
    ctx.closePath();
    ctx.fill();

    // Chest plate detail
    ctx.fillStyle = state.accentColor;
    ctx.beginPath();
    ctx.moveTo(0, -bodyHeight / 4);
    ctx.lineTo(-40 * scale, bodyHeight / 4);
    ctx.lineTo(40 * scale, bodyHeight / 4);
    ctx.closePath();
    ctx.fill();

    // Shoulder pads
    ctx.fillStyle = state.primaryColor;
    ctx.beginPath();
    ctx.ellipse(-bodyWidth / 2 - 10 * scale, -bodyHeight / 4, 40 * scale, 30 * scale, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(bodyWidth / 2 + 10 * scale, -bodyHeight / 4, 40 * scale, 30 * scale, 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Arms
    const armStartY = height / 2 - bodyHeight / 4 - bodyHeight / 4;
    drawLimb(centerX - bodyWidth / 2 - 10 * scale, armStartY, armLength, 28 * scale, armAngleL + Math.PI / 2, state.secondaryColor);
    drawLimb(centerX + bodyWidth / 2 + 10 * scale, armStartY, armLength, 28 * scale, armAngleR + Math.PI / 2, state.secondaryColor);

    // Sword (for warrior)
    if (pose === 'action') {
        const swordX = centerX - bodyWidth / 2 - 10 * scale + Math.sin(armAngleL + Math.PI / 2) * armLength;
        const swordY = armStartY + Math.cos(armAngleL + Math.PI / 2) * armLength;
        ctx.save();
        ctx.translate(swordX, swordY);
        ctx.rotate(armAngleL - 0.5);
        // Blade
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(-8 * scale, 0, 16 * scale, -180 * scale);
        // Handle
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-12 * scale, 0, 24 * scale, 40 * scale);
        // Guard
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(-25 * scale, -5 * scale, 50 * scale, 15 * scale);
        ctx.restore();
    }

    // Shield
    ctx.fillStyle = state.accentColor;
    const shieldX = centerX + bodyWidth / 2 + 10 * scale + Math.sin(armAngleR + Math.PI / 2) * (armLength * 0.5);
    const shieldY = armStartY + Math.cos(armAngleR + Math.PI / 2) * (armLength * 0.5);
    ctx.beginPath();
    ctx.ellipse(shieldX + 30 * scale, shieldY, 50 * scale, 70 * scale, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = state.primaryColor;
    ctx.beginPath();
    ctx.ellipse(shieldX + 30 * scale, shieldY, 30 * scale, 45 * scale, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Head
    const headY = height / 2 - bodyHeight / 2 - headSize - 20 * scale;
    drawHead(centerX, headY, headSize, 'helmet');
}

function drawMage(width, height, pose) {
    const centerX = width / 2;
    const scale = height / 768;

    const headSize = 55 * scale;
    const bodyHeight = 280 * scale;
    const armLength = 140 * scale;

    let armAngleL = -0.4, armAngleR = 0.4;
    if (pose === 'action') {
        armAngleL = -1.5;
        armAngleR = 1.0;
    }

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(centerX, height - 40 * scale, 100 * scale, 20 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Robe
    const robeGradient = ctx.createLinearGradient(centerX - 100 * scale, 0, centerX + 100 * scale, 0);
    robeGradient.addColorStop(0, darkenColor(state.primaryColor, 30));
    robeGradient.addColorStop(0.5, state.primaryColor);
    robeGradient.addColorStop(1, darkenColor(state.primaryColor, 30));
    ctx.fillStyle = robeGradient;

    ctx.beginPath();
    ctx.moveTo(centerX - 60 * scale, height / 2 - bodyHeight / 2);
    ctx.quadraticCurveTo(centerX - 120 * scale, height / 2, centerX - 100 * scale, height - 50 * scale);
    ctx.lineTo(centerX + 100 * scale, height - 50 * scale);
    ctx.quadraticCurveTo(centerX + 120 * scale, height / 2, centerX + 60 * scale, height / 2 - bodyHeight / 2);
    ctx.closePath();
    ctx.fill();

    // Robe details
    ctx.strokeStyle = state.accentColor;
    ctx.lineWidth = 4 * scale;
    ctx.beginPath();
    ctx.moveTo(centerX, height / 2 - bodyHeight / 3);
    ctx.lineTo(centerX, height - 60 * scale);
    ctx.stroke();

    // Belt
    ctx.fillStyle = state.secondaryColor;
    ctx.fillRect(centerX - 70 * scale, height / 2, 140 * scale, 20 * scale);

    // Arms
    const armStartY = height / 2 - bodyHeight / 3;
    drawLimb(centerX - 60 * scale, armStartY, armLength, 25 * scale, armAngleL + Math.PI / 2, state.secondaryColor);
    drawLimb(centerX + 60 * scale, armStartY, armLength, 25 * scale, armAngleR + Math.PI / 2, state.secondaryColor);

    // Staff
    const staffX = centerX - 60 * scale + Math.sin(armAngleL + Math.PI / 2) * armLength;
    const staffY = armStartY + Math.cos(armAngleL + Math.PI / 2) * armLength;
    ctx.save();
    ctx.translate(staffX, staffY);
    ctx.rotate(armAngleL);
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(-8 * scale, -250 * scale, 16 * scale, 300 * scale);
    // Orb
    const orbGradient = ctx.createRadialGradient(0, -280 * scale, 0, 0, -280 * scale, 35 * scale);
    orbGradient.addColorStop(0, '#FFFFFF');
    orbGradient.addColorStop(0.5, state.accentColor);
    orbGradient.addColorStop(1, darkenColor(state.accentColor, 30));
    ctx.fillStyle = orbGradient;
    ctx.beginPath();
    ctx.arc(0, -280 * scale, 35 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Magic effect for action pose
    if (pose === 'action') {
        const effectX = centerX + 60 * scale + Math.sin(armAngleR + Math.PI / 2) * armLength;
        const effectY = armStartY + Math.cos(armAngleR + Math.PI / 2) * armLength;
        for (let i = 0; i < 5; i++) {
            ctx.fillStyle = `rgba(${hexToRgb(state.accentColor).r}, ${hexToRgb(state.accentColor).g}, ${hexToRgb(state.accentColor).b}, ${0.3 - i * 0.05})`;
            ctx.beginPath();
            ctx.arc(effectX, effectY, (20 + i * 15) * scale, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Head with hood
    const headY = height / 2 - bodyHeight / 2 - headSize - 10 * scale;
    drawHead(centerX, headY, headSize, 'hood');
}

function drawArcher(width, height, pose) {
    const centerX = width / 2;
    const scale = height / 768;

    const headSize = 55 * scale;
    const bodyWidth = 100 * scale;
    const bodyHeight = 160 * scale;
    const legLength = 210 * scale;
    const armLength = 145 * scale;

    let armAngleL = -0.5, armAngleR = 0.5;
    let legAngleL = 0.15, legAngleR = -0.15;

    if (pose === 'action') {
        armAngleL = -1.8;
        armAngleR = 0.2;
        legAngleL = 0.3;
        legAngleR = -0.4;
    }

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(centerX, height - 45 * scale, 90 * scale, 18 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    const legStartY = height / 2 + bodyHeight / 2 - 10 * scale;
    drawLimb(centerX - 25 * scale, legStartY, legLength, 30 * scale, legAngleL + Math.PI / 2, state.secondaryColor);
    drawLimb(centerX + 25 * scale, legStartY, legLength, 30 * scale, legAngleR + Math.PI / 2, state.secondaryColor);

    // Boots
    ctx.fillStyle = darkenColor(state.secondaryColor, 25);
    const bootLX = centerX - 25 * scale + Math.sin(legAngleL + Math.PI / 2) * legLength;
    const bootLY = legStartY + Math.cos(legAngleL + Math.PI / 2) * legLength;
    const bootRX = centerX + 25 * scale + Math.sin(legAngleR + Math.PI / 2) * legLength;
    const bootRY = legStartY + Math.cos(legAngleR + Math.PI / 2) * legLength;
    ctx.fillRect(bootLX - 20 * scale, bootLY - 5 * scale, 40 * scale, 30 * scale);
    ctx.fillRect(bootRX - 20 * scale, bootRY - 5 * scale, 40 * scale, 30 * scale);

    // Body - Light armor
    const bodyGradient = ctx.createLinearGradient(centerX - bodyWidth / 2, 0, centerX + bodyWidth / 2, 0);
    bodyGradient.addColorStop(0, darkenColor(state.primaryColor, 15));
    bodyGradient.addColorStop(0.5, state.primaryColor);
    bodyGradient.addColorStop(1, darkenColor(state.primaryColor, 15));
    ctx.fillStyle = bodyGradient;

    ctx.beginPath();
    ctx.ellipse(centerX, height / 2 - bodyHeight / 6, bodyWidth / 2, bodyHeight / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Quiver
    ctx.fillStyle = '#8B4513';
    ctx.save();
    ctx.translate(centerX + bodyWidth / 2 + 10 * scale, height / 2 - bodyHeight / 4);
    ctx.rotate(0.2);
    ctx.fillRect(-15 * scale, -60 * scale, 30 * scale, 120 * scale);
    // Arrows
    ctx.fillStyle = '#654321';
    for (let i = 0; i < 4; i++) {
        ctx.fillRect(-10 * scale + i * 7 * scale, -80 * scale, 4 * scale, 100 * scale);
    }
    ctx.restore();

    // Arms
    const armStartY = height / 2 - bodyHeight / 3;
    drawLimb(centerX - bodyWidth / 2, armStartY, armLength, 24 * scale, armAngleL + Math.PI / 2, lightenColor(state.secondaryColor, 10));
    drawLimb(centerX + bodyWidth / 2, armStartY, armLength, 24 * scale, armAngleR + Math.PI / 2, lightenColor(state.secondaryColor, 10));

    // Bow
    const bowX = centerX - bodyWidth / 2 + Math.sin(armAngleL + Math.PI / 2) * armLength;
    const bowY = armStartY + Math.cos(armAngleL + Math.PI / 2) * armLength;
    ctx.save();
    ctx.translate(bowX, bowY);
    ctx.rotate(armAngleL - 0.3);
    // Bow limbs
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 8 * scale;
    ctx.beginPath();
    ctx.arc(0, 0, 100 * scale, -Math.PI * 0.7, Math.PI * 0.7);
    ctx.stroke();
    // String
    ctx.strokeStyle = '#DDD';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(Math.cos(-Math.PI * 0.7) * 100 * scale, Math.sin(-Math.PI * 0.7) * 100 * scale);
    ctx.lineTo(Math.cos(Math.PI * 0.7) * 100 * scale, Math.sin(Math.PI * 0.7) * 100 * scale);
    ctx.stroke();
    ctx.restore();

    // Head
    const headY = height / 2 - bodyHeight / 2 - headSize - 15 * scale;
    drawHead(centerX, headY, headSize, 'cap');
}

function drawRobot(width, height, pose) {
    const centerX = width / 2;
    const scale = height / 768;

    const headSize = 70 * scale;
    const bodyWidth = 130 * scale;
    const bodyHeight = 180 * scale;
    const legLength = 190 * scale;
    const armLength = 150 * scale;

    let armAngleL = -0.3, armAngleR = 0.3;
    let legAngleL = 0.1, legAngleR = -0.1;

    if (pose === 'action') {
        armAngleL = -0.8;
        armAngleR = 1.2;
        legAngleL = 0.3;
        legAngleR = -0.2;
    }

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(centerX, height - 50 * scale, bodyWidth * 0.7, 20 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs - mechanical
    const legStartY = height / 2 + bodyHeight / 2 - 30 * scale;

    // Left leg
    ctx.fillStyle = state.secondaryColor;
    const legLX = centerX - 35 * scale;
    ctx.save();
    ctx.translate(legLX, legStartY);
    ctx.rotate(legAngleL);
    // Upper leg
    ctx.fillRect(-20 * scale, 0, 40 * scale, legLength * 0.5);
    // Knee joint
    ctx.fillStyle = state.accentColor;
    ctx.beginPath();
    ctx.arc(0, legLength * 0.5, 20 * scale, 0, Math.PI * 2);
    ctx.fill();
    // Lower leg
    ctx.fillStyle = state.secondaryColor;
    ctx.fillRect(-18 * scale, legLength * 0.5, 36 * scale, legLength * 0.5);
    // Foot
    ctx.fillStyle = darkenColor(state.primaryColor, 20);
    ctx.fillRect(-30 * scale, legLength - 10 * scale, 60 * scale, 35 * scale);
    ctx.restore();

    // Right leg
    const legRX = centerX + 35 * scale;
    ctx.save();
    ctx.translate(legRX, legStartY);
    ctx.rotate(legAngleR);
    ctx.fillStyle = state.secondaryColor;
    ctx.fillRect(-20 * scale, 0, 40 * scale, legLength * 0.5);
    ctx.fillStyle = state.accentColor;
    ctx.beginPath();
    ctx.arc(0, legLength * 0.5, 20 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = state.secondaryColor;
    ctx.fillRect(-18 * scale, legLength * 0.5, 36 * scale, legLength * 0.5);
    ctx.fillStyle = darkenColor(state.primaryColor, 20);
    ctx.fillRect(-30 * scale, legLength - 10 * scale, 60 * scale, 35 * scale);
    ctx.restore();

    // Body - main chassis
    const bodyGradient = ctx.createLinearGradient(centerX - bodyWidth / 2, 0, centerX + bodyWidth / 2, 0);
    bodyGradient.addColorStop(0, darkenColor(state.primaryColor, 25));
    bodyGradient.addColorStop(0.3, state.primaryColor);
    bodyGradient.addColorStop(0.7, state.primaryColor);
    bodyGradient.addColorStop(1, darkenColor(state.primaryColor, 25));
    ctx.fillStyle = bodyGradient;

    ctx.beginPath();
    ctx.roundRect(centerX - bodyWidth / 2, height / 2 - bodyHeight / 2, bodyWidth, bodyHeight, 15 * scale);
    ctx.fill();

    // Chest panel
    ctx.fillStyle = state.accentColor;
    ctx.beginPath();
    ctx.roundRect(centerX - bodyWidth / 3, height / 2 - bodyHeight / 3, bodyWidth * 0.66, bodyHeight * 0.4, 8 * scale);
    ctx.fill();

    // Energy core
    const coreGradient = ctx.createRadialGradient(centerX, height / 2 - bodyHeight / 6, 0, centerX, height / 2 - bodyHeight / 6, 30 * scale);
    coreGradient.addColorStop(0, '#FFFFFF');
    coreGradient.addColorStop(0.5, lightenColor(state.accentColor, 30));
    coreGradient.addColorStop(1, state.accentColor);
    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(centerX, height / 2 - bodyHeight / 6, 25 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Arms - mechanical
    const armStartY = height / 2 - bodyHeight / 3;

    // Left arm
    ctx.save();
    ctx.translate(centerX - bodyWidth / 2 - 15 * scale, armStartY);
    ctx.rotate(armAngleL);
    ctx.fillStyle = state.secondaryColor;
    ctx.fillRect(-15 * scale, 0, 30 * scale, armLength * 0.5);
    ctx.fillStyle = state.accentColor;
    ctx.beginPath();
    ctx.arc(0, armLength * 0.5, 18 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = state.secondaryColor;
    ctx.fillRect(-14 * scale, armLength * 0.5, 28 * scale, armLength * 0.45);
    // Hand
    ctx.fillStyle = darkenColor(state.primaryColor, 15);
    ctx.beginPath();
    ctx.arc(0, armLength * 0.95, 22 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Right arm
    ctx.save();
    ctx.translate(centerX + bodyWidth / 2 + 15 * scale, armStartY);
    ctx.rotate(armAngleR);
    ctx.fillStyle = state.secondaryColor;
    ctx.fillRect(-15 * scale, 0, 30 * scale, armLength * 0.5);
    ctx.fillStyle = state.accentColor;
    ctx.beginPath();
    ctx.arc(0, armLength * 0.5, 18 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = state.secondaryColor;
    ctx.fillRect(-14 * scale, armLength * 0.5, 28 * scale, armLength * 0.45);
    // Hand/weapon
    if (pose === 'action') {
        ctx.fillStyle = '#666';
        ctx.fillRect(-20 * scale, armLength * 0.9, 40 * scale, 80 * scale);
        ctx.fillStyle = state.accentColor;
        ctx.beginPath();
        ctx.arc(0, armLength * 0.9 + 80 * scale, 15 * scale, 0, Math.PI * 2);
        ctx.fill();
    } else {
        ctx.fillStyle = darkenColor(state.primaryColor, 15);
        ctx.beginPath();
        ctx.arc(0, armLength * 0.95, 22 * scale, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();

    // Head - robot
    const headY = height / 2 - bodyHeight / 2 - headSize - 10 * scale;
    drawRobotHead(centerX, headY, headSize);
}

function drawLimb(x, y, length, width, angle, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    const gradient = ctx.createLinearGradient(-width / 2, 0, width / 2, 0);
    gradient.addColorStop(0, darkenColor(color, 15));
    gradient.addColorStop(0.5, color);
    gradient.addColorStop(1, darkenColor(color, 15));
    ctx.fillStyle = gradient;

    ctx.beginPath();
    ctx.roundRect(-width / 2, 0, width, length, width / 4);
    ctx.fill();

    ctx.restore();
}

function drawHead(x, y, size, type) {
    const scale = size / 55;

    // Base head
    ctx.fillStyle = '#FFDBB4';
    ctx.beginPath();
    ctx.arc(x, y, size * 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(x - size * 0.25, y - size * 0.1, size * 0.1, 0, Math.PI * 2);
    ctx.arc(x + size * 0.25, y - size * 0.1, size * 0.1, 0, Math.PI * 2);
    ctx.fill();

    switch (type) {
        case 'helmet':
            ctx.fillStyle = state.primaryColor;
            ctx.beginPath();
            ctx.arc(x, y - size * 0.1, size * 0.9, Math.PI, 0);
            ctx.fill();
            // Visor
            ctx.fillStyle = darkenColor(state.primaryColor, 30);
            ctx.beginPath();
            ctx.ellipse(x, y - size * 0.05, size * 0.7, size * 0.3, 0, Math.PI, 0);
            ctx.fill();
            break;
        case 'hood':
            ctx.fillStyle = state.primaryColor;
            ctx.beginPath();
            ctx.arc(x, y, size, Math.PI * 0.8, Math.PI * 0.2);
            ctx.quadraticCurveTo(x + size * 0.3, y + size * 0.8, x, y + size * 0.5);
            ctx.quadraticCurveTo(x - size * 0.3, y + size * 0.8, x - size * Math.cos(Math.PI * 0.8), y + size * Math.sin(Math.PI * 0.8));
            ctx.fill();
            break;
        case 'cap':
            ctx.fillStyle = state.primaryColor;
            ctx.beginPath();
            ctx.arc(x, y - size * 0.2, size * 0.85, Math.PI * 0.9, Math.PI * 0.1);
            ctx.fill();
            // Feather
            ctx.fillStyle = state.accentColor;
            ctx.save();
            ctx.translate(x + size * 0.5, y - size * 0.6);
            ctx.rotate(0.3);
            ctx.beginPath();
            ctx.ellipse(0, 0, 8 * scale, 40 * scale, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            break;
    }
}

function drawRobotHead(x, y, size) {
    const scale = size / 70;

    // Main head structure
    const headGradient = ctx.createLinearGradient(x - size / 2, y, x + size / 2, y);
    headGradient.addColorStop(0, darkenColor(state.primaryColor, 20));
    headGradient.addColorStop(0.5, state.primaryColor);
    headGradient.addColorStop(1, darkenColor(state.primaryColor, 20));
    ctx.fillStyle = headGradient;

    ctx.beginPath();
    ctx.roundRect(x - size * 0.5, y - size * 0.5, size, size * 0.9, 10 * scale);
    ctx.fill();

    // Face plate
    ctx.fillStyle = darkenColor(state.primaryColor, 30);
    ctx.beginPath();
    ctx.roundRect(x - size * 0.4, y - size * 0.35, size * 0.8, size * 0.6, 5 * scale);
    ctx.fill();

    // Eyes - glowing
    const eyeGlow = ctx.createRadialGradient(x - size * 0.2, y - size * 0.1, 0, x - size * 0.2, y - size * 0.1, 15 * scale);
    eyeGlow.addColorStop(0, '#FFFFFF');
    eyeGlow.addColorStop(0.5, state.accentColor);
    eyeGlow.addColorStop(1, darkenColor(state.accentColor, 30));
    ctx.fillStyle = eyeGlow;
    ctx.beginPath();
    ctx.arc(x - size * 0.2, y - size * 0.1, 12 * scale, 0, Math.PI * 2);
    ctx.fill();

    const eyeGlow2 = ctx.createRadialGradient(x + size * 0.2, y - size * 0.1, 0, x + size * 0.2, y - size * 0.1, 15 * scale);
    eyeGlow2.addColorStop(0, '#FFFFFF');
    eyeGlow2.addColorStop(0.5, state.accentColor);
    eyeGlow2.addColorStop(1, darkenColor(state.accentColor, 30));
    ctx.fillStyle = eyeGlow2;
    ctx.beginPath();
    ctx.arc(x + size * 0.2, y - size * 0.1, 12 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Mouth grill
    ctx.fillStyle = state.secondaryColor;
    for (let i = 0; i < 4; i++) {
        ctx.fillRect(x - size * 0.25 + i * 15 * scale, y + size * 0.15, 10 * scale, 3 * scale);
    }

    // Antenna
    ctx.fillStyle = state.accentColor;
    ctx.fillRect(x - 4 * scale, y - size * 0.5 - 30 * scale, 8 * scale, 30 * scale);
    ctx.beginPath();
    ctx.arc(x, y - size * 0.5 - 35 * scale, 8 * scale, 0, Math.PI * 2);
    ctx.fill();
}

// ========================================
// Main Generation Function
// ========================================

async function generateCharacter(randomize = false) {
    if (state.isGenerating) return;

    if (randomize) {
        const types = ['warrior', 'mage', 'archer', 'robot'];
        const poses = ['standing', 'action', 'idle'];

        state.type = types[Math.floor(Math.random() * types.length)];
        state.pose = poses[Math.floor(Math.random() * poses.length)];

        state.primaryColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        state.secondaryColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        state.accentColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');

        state.strength = Math.floor(Math.random() * 10) + 1;
        state.agility = Math.floor(Math.random() * 10) + 1;
        state.magic = Math.floor(Math.random() * 10) + 1;

        // Update UI
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === state.type);
        });
        document.querySelectorAll('.pose-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.pose === state.pose);
        });
        elements.primaryColor.value = state.primaryColor;
        elements.secondaryColor.value = state.secondaryColor;
        elements.accentColor.value = state.accentColor;
        elements.strength.value = state.strength;
        elements.agility.value = state.agility;
        elements.magic.value = state.magic;
        elements.strengthVal.textContent = state.strength;
        elements.agilityVal.textContent = state.agility;
        elements.magicVal.textContent = state.magic;
    }

    state.isGenerating = true;
    elements.generateBtn.disabled = true;
    elements.randomBtn.disabled = true;
    elements.processingOverlay.style.display = 'flex';
    elements.progressContainer.style.display = 'flex';
    elements.statsPanel.style.display = 'none';
    elements.actionsPanel.style.display = 'none';

    elements.canvas.width = state.canvasWidth;
    elements.canvas.height = state.canvasHeight;

    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 90) progress = 90;
        updateProgress(progress);
    }, 100);

    await new Promise(resolve => setTimeout(resolve, 150));

    // Clear canvas with gradient background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, state.canvasHeight);
    bgGradient.addColorStop(0, '#1a1a2e');
    bgGradient.addColorStop(1, '#0f0f1a');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, state.canvasWidth, state.canvasHeight);

    // Draw character based on type
    switch (state.type) {
        case 'warrior':
            drawWarrior(state.canvasWidth, state.canvasHeight, state.pose);
            break;
        case 'mage':
            drawMage(state.canvasWidth, state.canvasHeight, state.pose);
            break;
        case 'archer':
            drawArcher(state.canvasWidth, state.canvasHeight, state.pose);
            break;
        case 'robot':
            drawRobot(state.canvasWidth, state.canvasHeight, state.pose);
            break;
    }

    clearInterval(progressInterval);
    updateProgress(100);

    await new Promise(resolve => setTimeout(resolve, 300));

    state.generatedImage = elements.canvas.toDataURL('image/png');

    const totalStats = state.strength + state.agility + state.magic;

    // Update stats
    document.getElementById('statType').textContent = t(state.type);
    document.getElementById('statAttributes').textContent = totalStats;
    document.getElementById('statPose').textContent = t(state.pose);
    document.getElementById('statSize').textContent = `${state.canvasWidth} x ${state.canvasHeight}`;

    elements.processingOverlay.style.display = 'none';
    elements.progressContainer.style.display = 'none';
    elements.statsPanel.style.display = 'block';
    elements.actionsPanel.style.display = 'flex';
    elements.generateBtn.disabled = false;
    elements.randomBtn.disabled = false;
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
    link.download = `character-${state.type}-${Date.now()}.png`;
    link.href = state.generatedImage;
    link.click();
}

function downloadJpg() {
    if (!state.generatedImage) return;
    const link = document.createElement('a');
    link.download = `character-${state.type}-${Date.now()}.jpg`;
    link.href = elements.canvas.toDataURL('image/jpeg', 0.9);
    link.click();
}

// ========================================
// Event Listeners
// ========================================

function initEventListeners() {
    // Language switcher
    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    // Type buttons
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.type = btn.dataset.type;
        });
    });

    // Pose buttons
    document.querySelectorAll('.pose-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.pose-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.pose = btn.dataset.pose;
        });
    });

    // Colors
    elements.primaryColor.addEventListener('input', (e) => { state.primaryColor = e.target.value; });
    elements.secondaryColor.addEventListener('input', (e) => { state.secondaryColor = e.target.value; });
    elements.accentColor.addEventListener('input', (e) => { state.accentColor = e.target.value; });

    // Attributes
    elements.strength.addEventListener('input', (e) => {
        state.strength = parseInt(e.target.value);
        elements.strengthVal.textContent = state.strength;
    });
    elements.agility.addEventListener('input', (e) => {
        state.agility = parseInt(e.target.value);
        elements.agilityVal.textContent = state.agility;
    });
    elements.magic.addEventListener('input', (e) => {
        state.magic = parseInt(e.target.value);
        elements.magicVal.textContent = state.magic;
    });

    // Canvas size
    elements.canvasSize.addEventListener('change', (e) => {
        const size = parseInt(e.target.value);
        state.canvasWidth = size;
        state.canvasHeight = Math.round(size * 1.5);
    });

    // Generate buttons
    elements.generateBtn.addEventListener('click', () => generateCharacter(false));
    elements.randomBtn.addEventListener('click', () => generateCharacter(true));

    // Download buttons
    elements.downloadPng.addEventListener('click', downloadPng);
    elements.downloadJpg.addEventListener('click', downloadJpg);
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
    const bgGradient = ctx.createLinearGradient(0, 0, 0, state.canvasHeight);
    bgGradient.addColorStop(0, '#1a1a2e');
    bgGradient.addColorStop(1, '#0f0f1a');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, state.canvasWidth, state.canvasHeight);
    ctx.fillStyle = '#64748b';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(t('generate'), state.canvasWidth / 2, state.canvasHeight / 2);

    console.log('AI Character Generator initialized');
}

init();
