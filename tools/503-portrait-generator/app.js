/**
 * Portrait Generator - Tool #503
 * Awesome AI Local Tools
 *
 * Generates simulated AI portraits locally in the browser
 */

const translations = {
    'zh-TW': {
        title: 'AI 人像生成器',
        subtitle: '自訂參數，生成獨特的 AI 人像',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        controlsTitle: '人像參數',
        genderLabel: '性別',
        genderFemale: '女性',
        genderMale: '男性',
        genderNeutral: '中性',
        ageLabel: '年齡範圍',
        ageChild: '兒童 (5-12)',
        ageTeen: '青少年 (13-19)',
        ageYoung: '青年 (20-35)',
        ageMiddle: '中年 (36-55)',
        ageSenior: '老年 (55+)',
        styleLabel: '風格',
        styleRealistic: '寫實',
        styleAnime: '動漫',
        styleCartoon: '卡通',
        styleSketch: '素描',
        styleOil: '油畫',
        skinLabel: '膚色',
        hairLabel: '髮色',
        bgLabel: '背景顏色',
        generateBtn: '生成人像',
        generating: '生成中...',
        downloadBtn: '下載 PNG',
        randomizeBtn: '隨機參數',
        timeLabel: '生成時間',
        styleUsed: '風格',
        paramsUsed: '參數',
        howItWorks: '功能特色',
        feature1: '自訂參數',
        feature1Desc: '性別、年齡、膚色、髮色自由調整',
        feature2: '多種風格',
        feature2Desc: '寫實、動漫、卡通、素描等風格',
        feature3: '隱私保護',
        feature3Desc: '所有處理在瀏覽器本地完成',
        feature4: '隨機生成',
        feature4Desc: '一鍵隨機所有參數創造驚喜',
        backToHome: '返回首頁',
        toolNumber: '工具 #503',
        copyright: 'Awesome AI Local Tools © 2024'
    },
    'en': {
        title: 'AI Portrait Generator',
        subtitle: 'Customize parameters to generate unique AI portraits',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        controlsTitle: 'Portrait Parameters',
        genderLabel: 'Gender',
        genderFemale: 'Female',
        genderMale: 'Male',
        genderNeutral: 'Neutral',
        ageLabel: 'Age Range',
        ageChild: 'Child (5-12)',
        ageTeen: 'Teen (13-19)',
        ageYoung: 'Young Adult (20-35)',
        ageMiddle: 'Middle Age (36-55)',
        ageSenior: 'Senior (55+)',
        styleLabel: 'Style',
        styleRealistic: 'Realistic',
        styleAnime: 'Anime',
        styleCartoon: 'Cartoon',
        styleSketch: 'Sketch',
        styleOil: 'Oil Painting',
        skinLabel: 'Skin Tone',
        hairLabel: 'Hair Color',
        bgLabel: 'Background Color',
        generateBtn: 'Generate Portrait',
        generating: 'Generating...',
        downloadBtn: 'Download PNG',
        randomizeBtn: 'Randomize',
        timeLabel: 'Generation Time',
        styleUsed: 'Style',
        paramsUsed: 'Parameters',
        howItWorks: 'Features',
        feature1: 'Custom Parameters',
        feature1Desc: 'Freely adjust gender, age, skin tone, hair color',
        feature2: 'Multiple Styles',
        feature2Desc: 'Realistic, anime, cartoon, sketch and more',
        feature3: 'Privacy Protected',
        feature3Desc: 'All processing done locally in browser',
        feature4: 'Random Generation',
        feature4Desc: 'One-click randomize all parameters for surprises',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #503',
        copyright: 'Awesome AI Local Tools © 2024'
    }
};

let currentLang = 'zh-TW';
let hasGenerated = false;

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`lang-${lang === 'zh-TW' ? 'zh' : 'en'}`).classList.add('active');
}

function t(key) {
    return translations[currentLang][key] || key;
}

// Parse color
function parseColor(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
}

function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
}

// Draw portrait
function drawPortrait(canvas, params) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    const { gender, age, style, skinColor, hairColor, bgColor } = params;

    // Clear canvas with background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    const skin = parseColor(skinColor);
    const hair = parseColor(hairColor);

    // Age affects proportions
    const ageFactors = {
        child: { headScale: 1.3, eyeScale: 1.4, faceWidth: 0.85 },
        teen: { headScale: 1.1, eyeScale: 1.2, faceWidth: 0.9 },
        young: { headScale: 1.0, eyeScale: 1.0, faceWidth: 1.0 },
        middle: { headScale: 0.95, eyeScale: 0.9, faceWidth: 1.05 },
        senior: { headScale: 0.9, eyeScale: 0.85, faceWidth: 1.1 }
    };

    const ageFactor = ageFactors[age];

    // Gender affects face shape
    const genderFactors = {
        female: { jawWidth: 0.85, browThickness: 0.6, lipFullness: 1.2 },
        male: { jawWidth: 1.1, browThickness: 1.0, lipFullness: 0.8 },
        neutral: { jawWidth: 0.95, browThickness: 0.8, lipFullness: 1.0 }
    };

    const genderFactor = genderFactors[gender];

    // Base measurements
    const headWidth = 180 * ageFactor.headScale * ageFactor.faceWidth;
    const headHeight = 240 * ageFactor.headScale;
    const faceY = centerY - 20;

    // Apply style-specific rendering
    ctx.save();

    if (style === 'sketch') {
        ctx.strokeStyle = '#2a2a2a';
        ctx.lineWidth = 2;
        ctx.fillStyle = 'transparent';
    } else if (style === 'anime') {
        // Larger eyes, smaller nose for anime
        ageFactor.eyeScale *= 1.5;
    }

    // Draw neck
    const neckWidth = 60 * genderFactor.jawWidth;
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.moveTo(centerX - neckWidth / 2, faceY + headHeight / 2 - 20);
    ctx.lineTo(centerX - neckWidth / 2 - 10, faceY + headHeight / 2 + 80);
    ctx.lineTo(centerX + neckWidth / 2 + 10, faceY + headHeight / 2 + 80);
    ctx.lineTo(centerX + neckWidth / 2, faceY + headHeight / 2 - 20);
    ctx.closePath();
    ctx.fill();
    if (style === 'sketch') ctx.stroke();

    // Draw hair (back)
    ctx.fillStyle = hairColor;
    ctx.beginPath();
    ctx.ellipse(centerX, faceY - 30, headWidth / 2 + 20, headHeight / 2 + 30, 0, 0, Math.PI * 2);
    ctx.fill();
    if (style === 'sketch') ctx.stroke();

    // Draw face (oval shape)
    ctx.fillStyle = skinColor;
    ctx.beginPath();

    // Custom face shape based on gender
    const jawAdjust = genderFactor.jawWidth;
    ctx.moveTo(centerX, faceY - headHeight / 2);

    // Top of head curve
    ctx.bezierCurveTo(
        centerX + headWidth / 2, faceY - headHeight / 2,
        centerX + headWidth / 2, faceY,
        centerX + headWidth / 2 * jawAdjust, faceY + headHeight / 3
    );

    // Jaw line
    ctx.bezierCurveTo(
        centerX + headWidth / 3 * jawAdjust, faceY + headHeight / 2,
        centerX + 20, faceY + headHeight / 2 + 10,
        centerX, faceY + headHeight / 2
    );

    ctx.bezierCurveTo(
        centerX - 20, faceY + headHeight / 2 + 10,
        centerX - headWidth / 3 * jawAdjust, faceY + headHeight / 2,
        centerX - headWidth / 2 * jawAdjust, faceY + headHeight / 3
    );

    // Back to top
    ctx.bezierCurveTo(
        centerX - headWidth / 2, faceY,
        centerX - headWidth / 2, faceY - headHeight / 2,
        centerX, faceY - headHeight / 2
    );

    ctx.fill();
    if (style === 'sketch') ctx.stroke();

    // Draw ears
    const earY = faceY + 10;
    const earWidth = 25;
    const earHeight = 50;

    ctx.beginPath();
    ctx.ellipse(centerX - headWidth / 2 + 5, earY, earWidth / 2, earHeight / 2, 0.2, 0, Math.PI * 2);
    ctx.fill();
    if (style === 'sketch') ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(centerX + headWidth / 2 - 5, earY, earWidth / 2, earHeight / 2, -0.2, 0, Math.PI * 2);
    ctx.fill();
    if (style === 'sketch') ctx.stroke();

    // Draw hair (front/fringe)
    ctx.fillStyle = hairColor;

    // Hair style varies by gender
    ctx.beginPath();
    if (gender === 'female') {
        // Longer flowing hair
        ctx.moveTo(centerX - headWidth / 2 - 15, faceY - 20);
        ctx.bezierCurveTo(
            centerX - headWidth / 2 - 20, faceY + 100,
            centerX - headWidth / 2, faceY + 150,
            centerX - headWidth / 3, faceY + 180
        );
        ctx.lineTo(centerX - headWidth / 2 + 20, faceY);
        ctx.bezierCurveTo(
            centerX - headWidth / 4, faceY - headHeight / 2 + 30,
            centerX + headWidth / 4, faceY - headHeight / 2 + 30,
            centerX + headWidth / 2 - 20, faceY
        );
        ctx.lineTo(centerX + headWidth / 3, faceY + 180);
        ctx.bezierCurveTo(
            centerX + headWidth / 2, faceY + 150,
            centerX + headWidth / 2 + 20, faceY + 100,
            centerX + headWidth / 2 + 15, faceY - 20
        );
        ctx.bezierCurveTo(
            centerX + headWidth / 3, faceY - headHeight / 2 - 20,
            centerX - headWidth / 3, faceY - headHeight / 2 - 20,
            centerX - headWidth / 2 - 15, faceY - 20
        );
    } else {
        // Shorter hair
        ctx.moveTo(centerX - headWidth / 2 - 5, faceY - 20);
        ctx.bezierCurveTo(
            centerX - headWidth / 3, faceY - headHeight / 2 - 10,
            centerX + headWidth / 3, faceY - headHeight / 2 - 10,
            centerX + headWidth / 2 + 5, faceY - 20
        );
        ctx.bezierCurveTo(
            centerX + headWidth / 3, faceY - headHeight / 2 + 40,
            centerX - headWidth / 3, faceY - headHeight / 2 + 40,
            centerX - headWidth / 2 - 5, faceY - 20
        );
    }
    ctx.fill();
    if (style === 'sketch') ctx.stroke();

    // Draw eyes
    const eyeY = faceY - 10;
    const eyeSpacing = 55;
    const eyeWidth = 35 * ageFactor.eyeScale;
    const eyeHeight = 20 * ageFactor.eyeScale;

    // Eye whites
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(centerX - eyeSpacing / 2, eyeY, eyeWidth / 2, eyeHeight / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(centerX + eyeSpacing / 2, eyeY, eyeWidth / 2, eyeHeight / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    if (style === 'sketch') {
        ctx.beginPath();
        ctx.ellipse(centerX - eyeSpacing / 2, eyeY, eyeWidth / 2, eyeHeight / 2, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(centerX + eyeSpacing / 2, eyeY, eyeWidth / 2, eyeHeight / 2, 0, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Iris and pupil
    const irisSize = eyeHeight / 2 * (style === 'anime' ? 1.2 : 0.9);
    ctx.fillStyle = '#4a3728';
    ctx.beginPath();
    ctx.arc(centerX - eyeSpacing / 2, eyeY, irisSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + eyeSpacing / 2, eyeY, irisSize, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(centerX - eyeSpacing / 2, eyeY, irisSize / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + eyeSpacing / 2, eyeY, irisSize / 2, 0, Math.PI * 2);
    ctx.fill();

    // Eye highlights
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(centerX - eyeSpacing / 2 + 3, eyeY - 3, irisSize / 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + eyeSpacing / 2 + 3, eyeY - 3, irisSize / 4, 0, Math.PI * 2);
    ctx.fill();

    // Eyebrows
    const browY = eyeY - eyeHeight - 10;
    const browThickness = 6 * genderFactor.browThickness;
    ctx.strokeStyle = hairColor;
    ctx.lineWidth = browThickness;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(centerX - eyeSpacing / 2 - eyeWidth / 2, browY + 5);
    ctx.quadraticCurveTo(centerX - eyeSpacing / 2, browY - 5, centerX - eyeSpacing / 2 + eyeWidth / 2, browY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX + eyeSpacing / 2 - eyeWidth / 2, browY);
    ctx.quadraticCurveTo(centerX + eyeSpacing / 2, browY - 5, centerX + eyeSpacing / 2 + eyeWidth / 2, browY + 5);
    ctx.stroke();

    // Draw nose
    const noseY = faceY + 30;
    ctx.strokeStyle = style === 'sketch' ? '#2a2a2a' : `rgba(${skin.r * 0.7}, ${skin.g * 0.7}, ${skin.b * 0.7}, 0.6)`;
    ctx.lineWidth = style === 'sketch' ? 2 : 3;

    if (style !== 'anime') {
        ctx.beginPath();
        ctx.moveTo(centerX, eyeY + 10);
        ctx.quadraticCurveTo(centerX + 5, noseY, centerX, noseY + 15);
        ctx.stroke();

        // Nose tip
        ctx.beginPath();
        ctx.arc(centerX, noseY + 15, 8, 0, Math.PI, false);
        ctx.stroke();
    } else {
        // Simple anime nose
        ctx.beginPath();
        ctx.moveTo(centerX, noseY);
        ctx.lineTo(centerX, noseY + 10);
        ctx.stroke();
    }

    // Draw mouth
    const mouthY = faceY + headHeight / 3;
    const mouthWidth = 40 * genderFactor.lipFullness;
    const lipColor = `rgb(${Math.min(255, skin.r * 1.1)}, ${skin.g * 0.7}, ${skin.b * 0.7})`;

    ctx.fillStyle = lipColor;
    ctx.beginPath();
    ctx.moveTo(centerX - mouthWidth / 2, mouthY);
    ctx.quadraticCurveTo(centerX, mouthY - 8 * genderFactor.lipFullness, centerX + mouthWidth / 2, mouthY);
    ctx.quadraticCurveTo(centerX, mouthY + 12 * genderFactor.lipFullness, centerX - mouthWidth / 2, mouthY);
    ctx.fill();

    if (style === 'sketch') {
        ctx.stroke();
    }

    // Add style effects
    if (style === 'oil') {
        // Add oil painting texture
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * 15;
            data[i] = Math.max(0, Math.min(255, data[i] + noise));
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
        }
        ctx.putImageData(imageData, 0, 0);
    }

    // Add age-related details
    if (age === 'senior') {
        // Add subtle wrinkles
        ctx.strokeStyle = `rgba(${skin.r * 0.8}, ${skin.g * 0.8}, ${skin.b * 0.8}, 0.3)`;
        ctx.lineWidth = 1;

        // Forehead lines
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(centerX - 40, faceY - headHeight / 4 + i * 8);
            ctx.quadraticCurveTo(centerX, faceY - headHeight / 4 - 3 + i * 8, centerX + 40, faceY - headHeight / 4 + i * 8);
            ctx.stroke();
        }

        // Smile lines
        ctx.beginPath();
        ctx.arc(centerX - eyeSpacing / 2 - eyeWidth / 2, eyeY + 20, 30, 0.3, 1.2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(centerX + eyeSpacing / 2 + eyeWidth / 2, eyeY + 20, 30, Math.PI - 1.2, Math.PI - 0.3);
        ctx.stroke();
    }

    ctx.restore();
}

function getParams() {
    const gender = document.querySelector('input[name="gender"]:checked').value;
    const age = document.getElementById('ageSelect').value;
    const style = document.getElementById('styleSelect').value;
    const skinColor = document.getElementById('skinColor').value;
    const hairColor = document.getElementById('hairColor').value;
    const bgColor = document.getElementById('bgColor').value;

    return { gender, age, style, skinColor, hairColor, bgColor };
}

function randomizeParams() {
    const genders = ['female', 'male', 'neutral'];
    const ages = ['child', 'teen', 'young', 'middle', 'senior'];
    const styles = ['realistic', 'anime', 'cartoon', 'sketch', 'oil'];

    const skinPresets = ['#fce5d3', '#f5d0b0', '#d4a574', '#a67c52', '#6b4423'];
    const hairPresets = ['#f5e6ca', '#8b4513', '#3d2314', '#1a1a1a', '#c41e3a'];
    const bgPresets = ['#1e293b', '#2d3748', '#1a202c', '#171923', '#0f172a'];

    const randomGender = genders[Math.floor(Math.random() * genders.length)];
    document.querySelector(`input[name="gender"][value="${randomGender}"]`).checked = true;

    document.getElementById('ageSelect').value = ages[Math.floor(Math.random() * ages.length)];
    document.getElementById('styleSelect').value = styles[Math.floor(Math.random() * styles.length)];
    document.getElementById('skinColor').value = skinPresets[Math.floor(Math.random() * skinPresets.length)];
    document.getElementById('hairColor').value = hairPresets[Math.floor(Math.random() * hairPresets.length)];
    document.getElementById('bgColor').value = bgPresets[Math.floor(Math.random() * bgPresets.length)];
}

function init() {
    const browserLang = navigator.language;
    setLanguage(browserLang.startsWith('zh') ? 'zh-TW' : 'en');

    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    // Set up skin color presets
    document.querySelectorAll('#skinPresets .preset-color').forEach((btn, i) => {
        const colors = ['#fce5d3', '#f5d0b0', '#d4a574', '#a67c52', '#6b4423'];
        btn.style.backgroundColor = colors[i];
        btn.dataset.color = colors[i];
        btn.addEventListener('click', () => {
            document.getElementById('skinColor').value = colors[i];
        });
    });

    // Set up hair color presets
    document.querySelectorAll('#hairPresets .preset-color').forEach((btn, i) => {
        const colors = ['#f5e6ca', '#8b4513', '#3d2314', '#1a1a1a', '#c41e3a'];
        btn.style.backgroundColor = colors[i];
        btn.dataset.color = colors[i];
        btn.addEventListener('click', () => {
            document.getElementById('hairColor').value = colors[i];
        });
    });

    // Generate button
    document.getElementById('generateBtn').addEventListener('click', () => {
        const btn = document.getElementById('generateBtn');
        const overlay = document.getElementById('canvasOverlay');
        const canvas = document.getElementById('portraitCanvas');

        btn.disabled = true;
        btn.querySelector('span').textContent = t('generating');
        overlay.classList.add('active');

        const startTime = performance.now();
        const params = getParams();

        setTimeout(() => {
            drawPortrait(canvas, params);

            const endTime = performance.now();
            const duration = ((endTime - startTime) / 1000).toFixed(2);

            overlay.classList.remove('active');
            btn.disabled = false;
            btn.querySelector('span').textContent = t('generateBtn');

            document.getElementById('downloadBtn').disabled = false;
            hasGenerated = true;

            // Update stats
            const stats = document.getElementById('outputStats');
            stats.style.display = 'flex';
            stats.innerHTML = `
                <span><span class="label">${t('timeLabel')}:</span> <span class="value">${duration}s</span></span>
                <span><span class="label">${t('styleUsed')}:</span> <span class="value">${t('style' + params.style.charAt(0).toUpperCase() + params.style.slice(1))}</span></span>
                <span><span class="label">${t('paramsUsed')}:</span> <span class="value">6</span></span>
            `;
        }, 500);
    });

    // Download button
    document.getElementById('downloadBtn').addEventListener('click', () => {
        const canvas = document.getElementById('portraitCanvas');
        const link = document.createElement('a');
        link.download = `portrait-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    });

    // Randomize button
    document.getElementById('randomizeBtn').addEventListener('click', () => {
        randomizeParams();
        document.getElementById('generateBtn').click();
    });

    // Initial canvas state
    const canvas = document.getElementById('portraitCanvas');
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#64748b';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(currentLang === 'zh-TW' ? '點擊「生成人像」開始' : 'Click "Generate Portrait" to start', canvas.width / 2, canvas.height / 2);
}

init();
