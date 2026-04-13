/**
 * Landscape Generator - Tool #504
 * Awesome AI Local Tools
 *
 * Generates simulated AI landscapes locally in the browser
 */

const translations = {
    'zh-TW': {
        title: 'AI 風景生成器',
        subtitle: '選擇場景類型，生成壯麗的 AI 風景畫',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        controlsTitle: '風景參數',
        sceneLabel: '場景類型',
        sceneMountain: '山脈',
        sceneBeach: '海灘',
        sceneForest: '森林',
        sceneDesert: '沙漠',
        timeLabel: '時間',
        timeDawn: '黎明',
        timeDay: '白天',
        timeSunset: '黃昏',
        timeNight: '夜晚',
        weatherLabel: '天氣',
        weatherClear: '晴朗',
        weatherCloudy: '多雲',
        weatherRainy: '雨天',
        weatherFoggy: '霧氣',
        seasonLabel: '季節',
        seasonSpring: '春',
        seasonSummer: '夏',
        seasonAutumn: '秋',
        seasonWinter: '冬',
        elementsLabel: '額外元素',
        elementWater: '水域',
        elementClouds: '雲朵',
        elementSun: '太陽/月亮',
        elementBirds: '飛鳥',
        generateBtn: '生成風景',
        generating: '生成中...',
        downloadBtn: '下載 PNG',
        randomizeBtn: '隨機生成',
        timeUsed: '生成時間',
        sceneType: '場景',
        elementsCount: '元素數量',
        howItWorks: '功能特色',
        feature1: '多種場景',
        feature1Desc: '山脈、海灘、森林、沙漠等場景',
        feature2: '天氣系統',
        feature2Desc: '可調整時間、天氣和季節',
        feature3: '隱私保護',
        feature3Desc: '所有處理在瀏覽器本地完成',
        feature4: '豐富元素',
        feature4Desc: '水域、雲朵、飛鳥等細節元素',
        backToHome: '返回首頁',
        toolNumber: '工具 #504',
        copyright: 'Awesome AI Local Tools © 2024'
    },
    'en': {
        title: 'AI Landscape Generator',
        subtitle: 'Select scene type to generate stunning AI landscapes',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        controlsTitle: 'Landscape Parameters',
        sceneLabel: 'Scene Type',
        sceneMountain: 'Mountain',
        sceneBeach: 'Beach',
        sceneForest: 'Forest',
        sceneDesert: 'Desert',
        timeLabel: 'Time of Day',
        timeDawn: 'Dawn',
        timeDay: 'Day',
        timeSunset: 'Sunset',
        timeNight: 'Night',
        weatherLabel: 'Weather',
        weatherClear: 'Clear',
        weatherCloudy: 'Cloudy',
        weatherRainy: 'Rainy',
        weatherFoggy: 'Foggy',
        seasonLabel: 'Season',
        seasonSpring: 'Spring',
        seasonSummer: 'Summer',
        seasonAutumn: 'Autumn',
        seasonWinter: 'Winter',
        elementsLabel: 'Extra Elements',
        elementWater: 'Water',
        elementClouds: 'Clouds',
        elementSun: 'Sun/Moon',
        elementBirds: 'Birds',
        generateBtn: 'Generate Landscape',
        generating: 'Generating...',
        downloadBtn: 'Download PNG',
        randomizeBtn: 'Randomize',
        timeUsed: 'Generation Time',
        sceneType: 'Scene',
        elementsCount: 'Elements',
        howItWorks: 'Features',
        feature1: 'Multiple Scenes',
        feature1Desc: 'Mountains, beaches, forests, deserts and more',
        feature2: 'Weather System',
        feature2Desc: 'Adjustable time, weather and season',
        feature3: 'Privacy Protected',
        feature3Desc: 'All processing done locally in browser',
        feature4: 'Rich Elements',
        feature4Desc: 'Water, clouds, birds and other details',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #504',
        copyright: 'Awesome AI Local Tools © 2024'
    }
};

let currentLang = 'zh-TW';
let elementCount = 0;

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

// Color palettes for different times/seasons
const colorPalettes = {
    dawn: {
        sky: ['#1a1a2e', '#4a1942', '#ff6b6b', '#ffa500', '#ffe4b5'],
        light: '#ffd700'
    },
    day: {
        sky: ['#87ceeb', '#b0e0e6', '#add8e6', '#f0f8ff'],
        light: '#ffff00'
    },
    sunset: {
        sky: ['#1a1a2e', '#4a1942', '#ff6347', '#ff8c00', '#ffd700'],
        light: '#ff4500'
    },
    night: {
        sky: ['#0a0a1a', '#1a1a2e', '#2d2d44', '#3d3d5c'],
        light: '#f0f0f0'
    }
};

const seasonColors = {
    spring: { foliage: '#90ee90', ground: '#8fbc8f' },
    summer: { foliage: '#228b22', ground: '#6b8e23' },
    autumn: { foliage: '#d2691e', ground: '#cd853f' },
    winter: { foliage: '#dcdcdc', ground: '#f5f5f5' }
};

// Draw sky gradient
function drawSky(ctx, width, height, time, weather) {
    const colors = colorPalettes[time].sky;
    const gradient = ctx.createLinearGradient(0, 0, 0, height * 0.6);

    colors.forEach((color, i) => {
        gradient.addColorStop(i / (colors.length - 1), color);
    });

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height * 0.6);

    // Add fog/haze for foggy weather
    if (weather === 'foggy') {
        ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';
        ctx.fillRect(0, 0, width, height);
    }
}

// Draw clouds
function drawClouds(ctx, width, height, weather, time) {
    const cloudCount = weather === 'cloudy' ? 8 : weather === 'rainy' ? 10 : 4;

    for (let i = 0; i < cloudCount; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height * 0.35;
        const size = 40 + Math.random() * 80;

        ctx.fillStyle = time === 'night' ? 'rgba(100, 100, 120, 0.6)' :
            weather === 'rainy' ? 'rgba(80, 80, 90, 0.8)' : 'rgba(255, 255, 255, 0.8)';

        // Draw cloud puffs
        for (let j = 0; j < 5; j++) {
            ctx.beginPath();
            ctx.arc(x + j * size * 0.3, y + Math.sin(j) * 10, size * 0.4 * (0.6 + Math.random() * 0.4), 0, Math.PI * 2);
            ctx.fill();
        }
    }
    elementCount += cloudCount;
}

// Draw sun/moon
function drawCelestialBody(ctx, width, height, time) {
    const x = width * 0.8;
    const y = height * 0.15;
    const radius = 40;

    if (time === 'night') {
        // Moon
        ctx.fillStyle = '#f0f0f0';
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Moon craters
        ctx.fillStyle = 'rgba(180, 180, 180, 0.5)';
        ctx.beginPath();
        ctx.arc(x - 10, y - 5, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 15, y + 10, 6, 0, Math.PI * 2);
        ctx.fill();

        // Stars
        for (let i = 0; i < 50; i++) {
            const sx = Math.random() * width;
            const sy = Math.random() * height * 0.4;
            ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.random() * 0.7})`;
            ctx.beginPath();
            ctx.arc(sx, sy, 1 + Math.random() * 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
        elementCount += 51;
    } else {
        // Sun
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 2);
        gradient.addColorStop(0, colorPalettes[time].light);
        gradient.addColorStop(0.3, colorPalettes[time].light);
        gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius * 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        elementCount++;
    }
}

// Draw mountains
function drawMountains(ctx, width, height, season, layers = 3) {
    const baseY = height * 0.6;

    for (let layer = 0; layer < layers; layer++) {
        const layerY = baseY - layer * 40;
        const darkness = 0.3 + (layer / layers) * 0.5;

        let baseColor;
        if (season === 'winter') {
            baseColor = `rgb(${200 - layer * 30}, ${200 - layer * 30}, ${220 - layer * 20})`;
        } else {
            baseColor = `rgb(${60 + layer * 20}, ${80 + layer * 15}, ${60 + layer * 10})`;
        }

        ctx.fillStyle = baseColor;
        ctx.beginPath();
        ctx.moveTo(0, height);

        // Draw jagged mountain peaks
        const peaks = 5 + layer * 2;
        for (let i = 0; i <= peaks; i++) {
            const x = (i / peaks) * width;
            const peakHeight = layerY - (50 + Math.random() * 100) * (1 - layer * 0.2);
            const midX = x + (width / peaks) / 2;

            if (i < peaks) {
                ctx.lineTo(x, layerY + Math.random() * 20);
                ctx.lineTo(midX, peakHeight);
            }
        }

        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();

        // Snow caps for winter
        if (season === 'winter' || layer === layers - 1) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath();
            for (let i = 0; i <= peaks; i++) {
                const x = (i / peaks) * width;
                const peakHeight = layerY - (50 + Math.random() * 100) * (1 - layer * 0.2);
                const midX = x + (width / peaks) / 2;

                if (i < peaks) {
                    ctx.moveTo(midX, peakHeight);
                    ctx.lineTo(midX - 20, peakHeight + 30);
                    ctx.lineTo(midX + 20, peakHeight + 30);
                    ctx.closePath();
                }
            }
            ctx.fill();
        }
    }
    elementCount += layers;
}

// Draw beach scene
function drawBeach(ctx, width, height, time) {
    // Sand
    const sandGradient = ctx.createLinearGradient(0, height * 0.5, 0, height);
    sandGradient.addColorStop(0, '#f4d03f');
    sandGradient.addColorStop(1, '#e67e22');
    ctx.fillStyle = sandGradient;
    ctx.fillRect(0, height * 0.5, width, height * 0.5);

    // Ocean
    const oceanGradient = ctx.createLinearGradient(0, height * 0.35, 0, height * 0.55);
    oceanGradient.addColorStop(0, time === 'night' ? '#1a3a5c' : '#006994');
    oceanGradient.addColorStop(1, time === 'night' ? '#0d2840' : '#40e0d0');
    ctx.fillStyle = oceanGradient;
    ctx.fillRect(0, height * 0.35, width, height * 0.2);

    // Waves
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
        const waveY = height * 0.48 + i * 8;
        ctx.beginPath();
        for (let x = 0; x < width; x += 10) {
            const y = waveY + Math.sin(x * 0.02 + i) * 3;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }

    // Palm trees
    for (let i = 0; i < 3; i++) {
        const treeX = 100 + i * 250 + Math.random() * 50;
        const treeY = height * 0.55;
        drawPalmTree(ctx, treeX, treeY);
    }
    elementCount += 8;
}

// Draw palm tree
function drawPalmTree(ctx, x, y) {
    // Trunk
    ctx.strokeStyle = '#8b4513';
    ctx.lineWidth = 15;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x - 10, y - 80, x + 5, y - 150);
    ctx.stroke();

    // Leaves
    ctx.fillStyle = '#228b22';
    for (let i = 0; i < 7; i++) {
        const angle = (i / 7) * Math.PI * 2;
        ctx.save();
        ctx.translate(x + 5, y - 150);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.ellipse(40, 0, 50, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    elementCount++;
}

// Draw forest
function drawForest(ctx, width, height, season) {
    const colors = seasonColors[season];

    // Ground
    ctx.fillStyle = colors.ground;
    ctx.fillRect(0, height * 0.5, width, height * 0.5);

    // Trees at different depths
    for (let layer = 0; layer < 3; layer++) {
        const treeCount = 10 + layer * 5;
        const baseY = height * 0.55 + layer * 30;
        const treeHeight = 150 - layer * 30;

        for (let i = 0; i < treeCount; i++) {
            const x = (i / treeCount) * width + Math.random() * 50 - 25;

            // Trunk
            ctx.fillStyle = '#4a3728';
            ctx.fillRect(x - 8, baseY - treeHeight * 0.3, 16, treeHeight * 0.4);

            // Foliage (triangle tree)
            ctx.fillStyle = season === 'winter' ? '#f5f5f5' :
                `hsl(${season === 'autumn' ? 30 : 120}, ${60 - layer * 10}%, ${30 + layer * 10}%)`;

            ctx.beginPath();
            ctx.moveTo(x, baseY - treeHeight);
            ctx.lineTo(x - 40 + layer * 10, baseY - treeHeight * 0.3);
            ctx.lineTo(x + 40 - layer * 10, baseY - treeHeight * 0.3);
            ctx.closePath();
            ctx.fill();
        }
        elementCount += treeCount;
    }
}

// Draw desert
function drawDesert(ctx, width, height, time) {
    // Sand dunes
    const sandColor = time === 'night' ? '#8b7355' : '#f4a460';
    const gradient = ctx.createLinearGradient(0, height * 0.4, 0, height);
    gradient.addColorStop(0, sandColor);
    gradient.addColorStop(1, '#cd853f');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, height * 0.4, width, height * 0.6);

    // Dune curves
    ctx.fillStyle = time === 'night' ? '#a08060' : '#deb887';
    for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(0, height * (0.5 + i * 0.1));

        for (let x = 0; x <= width; x += width / 4) {
            const cp1x = x + width / 8;
            const cp1y = height * (0.45 + i * 0.1) + Math.random() * 30;
            const cp2x = x + width / 4;
            const cp2y = height * (0.55 + i * 0.1);
            ctx.quadraticCurveTo(cp1x, cp1y, cp2x, cp2y);
        }

        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fill();
    }

    // Cacti
    for (let i = 0; i < 4; i++) {
        const cactusX = 150 + i * 200 + Math.random() * 50;
        const cactusY = height * 0.65 + Math.random() * 50;
        drawCactus(ctx, cactusX, cactusY);
    }
    elementCount += 8;
}

// Draw cactus
function drawCactus(ctx, x, y) {
    ctx.fillStyle = '#228b22';

    // Main stem
    ctx.beginPath();
    ctx.roundRect(x - 12, y - 80, 24, 80, 12);
    ctx.fill();

    // Arms
    ctx.beginPath();
    ctx.roundRect(x - 35, y - 60, 25, 15, 7);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(x - 35, y - 75, 15, 30, 7);
    ctx.fill();

    ctx.beginPath();
    ctx.roundRect(x + 10, y - 50, 25, 15, 7);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(x + 20, y - 70, 15, 35, 7);
    ctx.fill();
    elementCount++;
}

// Draw water/lake
function drawWater(ctx, width, height, time) {
    const waterY = height * 0.65;
    const waterHeight = height * 0.15;

    const gradient = ctx.createLinearGradient(0, waterY, 0, waterY + waterHeight);
    gradient.addColorStop(0, time === 'night' ? 'rgba(30, 50, 80, 0.8)' : 'rgba(100, 149, 237, 0.8)');
    gradient.addColorStop(1, time === 'night' ? 'rgba(20, 30, 50, 0.9)' : 'rgba(70, 130, 180, 0.9)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(width / 2, waterY + waterHeight / 2, width * 0.4, waterHeight / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Reflections
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(width * 0.2 + i * 50, waterY + waterHeight / 2);
        ctx.lineTo(width * 0.25 + i * 50, waterY + waterHeight / 2);
        ctx.stroke();
    }
    elementCount += 6;
}

// Draw birds
function drawBirds(ctx, width, height) {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;

    for (let i = 0; i < 5; i++) {
        const bx = 100 + Math.random() * (width - 200);
        const by = 50 + Math.random() * 100;
        const size = 10 + Math.random() * 10;

        ctx.beginPath();
        ctx.moveTo(bx - size, by);
        ctx.quadraticCurveTo(bx - size / 2, by - size / 2, bx, by);
        ctx.quadraticCurveTo(bx + size / 2, by - size / 2, bx + size, by);
        ctx.stroke();
    }
    elementCount += 5;
}

// Draw rain
function drawRain(ctx, width, height) {
    ctx.strokeStyle = 'rgba(150, 150, 200, 0.5)';
    ctx.lineWidth = 1;

    for (let i = 0; i < 100; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 5, y + 20);
        ctx.stroke();
    }
    elementCount += 100;
}

// Main draw function
function drawLandscape(canvas, params) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    elementCount = 0;

    const { scene, time, weather, season, addWater, addClouds, addSun, addBirds } = params;

    // Draw sky
    drawSky(ctx, width, height, time, weather);

    // Draw sun/moon if enabled
    if (addSun) {
        drawCelestialBody(ctx, width, height, time);
    }

    // Draw clouds if enabled
    if (addClouds) {
        drawClouds(ctx, width, height, weather, time);
    }

    // Draw scene-specific elements
    switch (scene) {
        case 'mountain':
            drawMountains(ctx, width, height, season);
            if (addWater) drawWater(ctx, width, height, time);
            break;
        case 'beach':
            drawBeach(ctx, width, height, time);
            break;
        case 'forest':
            drawForest(ctx, width, height, season);
            if (addWater) drawWater(ctx, width, height, time);
            break;
        case 'desert':
            drawDesert(ctx, width, height, time);
            break;
    }

    // Draw birds if enabled
    if (addBirds && time !== 'night') {
        drawBirds(ctx, width, height);
    }

    // Draw rain if rainy weather
    if (weather === 'rainy') {
        drawRain(ctx, width, height);
    }

    return elementCount;
}

function getParams() {
    return {
        scene: document.querySelector('input[name="scene"]:checked').value,
        time: document.getElementById('timeSelect').value,
        weather: document.getElementById('weatherSelect').value,
        season: document.getElementById('seasonSelect').value,
        addWater: document.getElementById('addWater').checked,
        addClouds: document.getElementById('addClouds').checked,
        addSun: document.getElementById('addSun').checked,
        addBirds: document.getElementById('addBirds').checked
    };
}

function randomizeParams() {
    const scenes = ['mountain', 'beach', 'forest', 'desert'];
    const times = ['dawn', 'day', 'sunset', 'night'];
    const weathers = ['clear', 'cloudy', 'rainy', 'foggy'];
    const seasons = ['spring', 'summer', 'autumn', 'winter'];

    const randomScene = scenes[Math.floor(Math.random() * scenes.length)];
    document.querySelector(`input[name="scene"][value="${randomScene}"]`).checked = true;

    document.getElementById('timeSelect').value = times[Math.floor(Math.random() * times.length)];
    document.getElementById('weatherSelect').value = weathers[Math.floor(Math.random() * weathers.length)];
    document.getElementById('seasonSelect').value = seasons[Math.floor(Math.random() * seasons.length)];

    document.getElementById('addWater').checked = Math.random() > 0.5;
    document.getElementById('addClouds').checked = Math.random() > 0.3;
    document.getElementById('addSun').checked = Math.random() > 0.5;
    document.getElementById('addBirds').checked = Math.random() > 0.6;
}

function init() {
    const browserLang = navigator.language;
    setLanguage(browserLang.startsWith('zh') ? 'zh-TW' : 'en');

    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    // Generate button
    document.getElementById('generateBtn').addEventListener('click', () => {
        const btn = document.getElementById('generateBtn');
        const overlay = document.getElementById('canvasOverlay');
        const canvas = document.getElementById('landscapeCanvas');

        btn.disabled = true;
        btn.querySelector('span').textContent = t('generating');
        overlay.classList.add('active');

        const startTime = performance.now();
        const params = getParams();

        setTimeout(() => {
            const elements = drawLandscape(canvas, params);

            const endTime = performance.now();
            const duration = ((endTime - startTime) / 1000).toFixed(2);

            overlay.classList.remove('active');
            btn.disabled = false;
            btn.querySelector('span').textContent = t('generateBtn');

            document.getElementById('downloadBtn').disabled = false;

            // Update stats
            const stats = document.getElementById('outputStats');
            stats.style.display = 'flex';
            stats.innerHTML = `
                <span><span class="label">${t('timeUsed')}:</span> <span class="value">${duration}s</span></span>
                <span><span class="label">${t('sceneType')}:</span> <span class="value">${t('scene' + params.scene.charAt(0).toUpperCase() + params.scene.slice(1))}</span></span>
                <span><span class="label">${t('elementsCount')}:</span> <span class="value">${elements}</span></span>
            `;
        }, 600);
    });

    // Download button
    document.getElementById('downloadBtn').addEventListener('click', () => {
        const canvas = document.getElementById('landscapeCanvas');
        const link = document.createElement('a');
        link.download = `landscape-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    });

    // Randomize button
    document.getElementById('randomizeBtn').addEventListener('click', () => {
        randomizeParams();
        document.getElementById('generateBtn').click();
    });

    // Initial canvas state
    const canvas = document.getElementById('landscapeCanvas');
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1e293b');
    gradient.addColorStop(1, '#0f172a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#64748b';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(currentLang === 'zh-TW' ? '點擊「生成風景」開始' : 'Click "Generate Landscape" to start', canvas.width / 2, canvas.height / 2);
}

init();
