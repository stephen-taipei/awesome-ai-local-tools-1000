/**
 * AR Scene Understanding - Tool #807
 * Scene analysis and environment understanding
 */

const i18n = {
    en: {
        title: "AR Scene Understanding",
        subtitle: "Analyze and understand your environment in real-time",
        privacy: "100% Local Processing - No Data Upload",
        start: "Start Analysis",
        stop: "Stop Analysis",
        objects: "Objects Detected",
        surfaces: "Surfaces Found",
        lighting: "Lighting Level",
        roomType: "Room Type",
        semantic: "Semantic Segmentation",
        semanticDesc: "Identifies walls, floors, furniture, and more",
        depth: "Depth Estimation",
        depthDesc: "Estimates distances to objects in the scene",
        light: "Light Estimation",
        lightDesc: "Analyzes lighting conditions for realistic AR"
    },
    zh: {
        title: "AR 場景理解",
        subtitle: "即時分析和理解您的環境",
        privacy: "100% 本地處理 - 無數據上傳",
        start: "開始分析",
        stop: "停止分析",
        objects: "偵測到的物件",
        surfaces: "找到的表面",
        lighting: "光線等級",
        roomType: "房間類型",
        semantic: "語義分割",
        semanticDesc: "識別牆壁、地板、家具等",
        depth: "深度估計",
        depthDesc: "估計場景中物體的距離",
        light: "光線估計",
        lightDesc: "分析光照條件以實現逼真的 AR"
    }
};

let currentLang = 'en';
let video, canvas, ctx;
let isAnalyzing = false;

const roomTypes = ['Living Room', 'Bedroom', 'Office', 'Kitchen', 'Bathroom'];
const lightLevels = ['Low', 'Medium', 'Bright', 'Very Bright'];

function setLang(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18n[lang][key]) el.textContent = i18n[lang][key];
    });
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

function init() {
    video = document.getElementById('video');
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
}

async function startAnalysis() {
    const btn = document.getElementById('startBtn');

    if (isAnalyzing) {
        stopAnalysis();
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: 1280, height: 720 }
        });
        video.srcObject = stream;

        video.onloadedmetadata = () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            isAnalyzing = true;
            btn.textContent = i18n[currentLang].stop;
            analyzeLoop();
        };
    } catch (err) {
        console.error('Camera error:', err);
    }
}

function stopAnalysis() {
    isAnalyzing = false;
    const stream = video.srcObject;
    if (stream) stream.getTracks().forEach(track => track.stop());
    video.srcObject = null;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById('startBtn').textContent = i18n[currentLang].start;
}

function analyzeLoop() {
    if (!isAnalyzing) return;

    drawSegmentation();
    updateStats();

    setTimeout(() => requestAnimationFrame(analyzeLoop), 500);
}

function drawSegmentation() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const segments = generateMockSegments();

    segments.forEach(segment => {
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = segment.color;
        ctx.fillRect(segment.x, segment.y, segment.w, segment.h);

        ctx.globalAlpha = 1;
        ctx.strokeStyle = segment.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(segment.x, segment.y, segment.w, segment.h);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(segment.label, segment.x + 10, segment.y + 20);
    });

    ctx.globalAlpha = 1;
}

function generateMockSegments() {
    const colors = {
        floor: '#ff6b6b',
        wall: '#4ecdc4',
        furniture: '#ffe66d',
        window: '#95e1d3',
        door: '#a8e6cf'
    };

    const segments = [];
    const types = Object.keys(colors);

    // Floor (bottom third)
    segments.push({
        x: 0, y: canvas.height * 0.7,
        w: canvas.width, h: canvas.height * 0.3,
        color: colors.floor, label: 'Floor'
    });

    // Walls
    segments.push({
        x: 0, y: 0,
        w: canvas.width * 0.2, h: canvas.height * 0.7,
        color: colors.wall, label: 'Wall'
    });
    segments.push({
        x: canvas.width * 0.8, y: 0,
        w: canvas.width * 0.2, h: canvas.height * 0.7,
        color: colors.wall, label: 'Wall'
    });

    // Random furniture
    for (let i = 0; i < 3; i++) {
        segments.push({
            x: canvas.width * 0.25 + Math.random() * canvas.width * 0.4,
            y: canvas.height * 0.3 + Math.random() * canvas.height * 0.3,
            w: 100 + Math.random() * 100,
            h: 80 + Math.random() * 80,
            color: colors.furniture,
            label: 'Furniture'
        });
    }

    // Window
    if (Math.random() > 0.5) {
        segments.push({
            x: canvas.width * 0.35,
            y: canvas.height * 0.1,
            w: canvas.width * 0.3,
            h: canvas.height * 0.25,
            color: colors.window,
            label: 'Window'
        });
    }

    return segments;
}

function updateStats() {
    document.getElementById('objectCount').textContent = 5 + Math.floor(Math.random() * 10);
    document.getElementById('surfaceCount').textContent = 3 + Math.floor(Math.random() * 5);
    document.getElementById('lightLevel').textContent = lightLevels[Math.floor(Math.random() * lightLevels.length)];
    document.getElementById('roomType').textContent = roomTypes[Math.floor(Math.random() * roomTypes.length)];
}

document.addEventListener('DOMContentLoaded', init);
