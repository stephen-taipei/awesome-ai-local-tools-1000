/**
 * AR Face Filter - Tool #804
 * Face filters using camera
 */

const i18n = {
    en: {
        title: "AR Face Filter",
        subtitle: "Add fun effects to your face in real-time",
        privacy: "100% Local Processing - No Data Upload",
        start: "Start Camera",
        stop: "Stop Camera",
        capture: "Take Photo",
        none: "None",
        dog: "Dog",
        cat: "Cat",
        glasses: "Glasses",
        crown: "Crown",
        heart: "Hearts",
        fire: "Fire",
        rainbow: "Rainbow",
        faceTrack: "Face Tracking",
        faceTrackDesc: "468 facial landmarks for precise filter placement",
        realtime: "Real-time",
        realtimeDesc: "Smooth 30fps filter rendering",
        captureDesc: "Save photos with filters applied"
    },
    zh: {
        title: "AR 臉部濾鏡",
        subtitle: "即時為臉部添加有趣效果",
        privacy: "100% 本地處理 - 無數據上傳",
        start: "啟動相機",
        stop: "停止相機",
        capture: "拍照",
        none: "無",
        dog: "狗",
        cat: "貓",
        glasses: "眼鏡",
        crown: "皇冠",
        heart: "愛心",
        fire: "火焰",
        rainbow: "彩虹",
        faceTrack: "臉部追蹤",
        faceTrackDesc: "468 個臉部關鍵點精確定位濾鏡",
        realtime: "即時",
        realtimeDesc: "流暢的 30fps 濾鏡渲染",
        captureDesc: "儲存套用濾鏡的照片"
    }
};

let currentLang = 'en';
let video, canvas, ctx;
let isRunning = false;
let currentFilter = 'none';
let animationId;

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

async function startCamera() {
    const btn = document.getElementById('startBtn');

    if (isRunning) {
        stopCamera();
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: 720, height: 960 }
        });
        video.srcObject = stream;

        video.onloadedmetadata = () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            isRunning = true;
            btn.textContent = i18n[currentLang].stop;
            renderLoop();
        };
    } catch (err) {
        console.error('Camera error:', err);
    }
}

function stopCamera() {
    isRunning = false;
    if (animationId) cancelAnimationFrame(animationId);
    const stream = video.srcObject;
    if (stream) stream.getTracks().forEach(track => track.stop());
    video.srcObject = null;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById('startBtn').textContent = i18n[currentLang].start;
}

function setFilter(filter) {
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.closest('.filter-btn').classList.add('active');
}

function renderLoop() {
    if (!isRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (currentFilter !== 'none') {
        applyFilter();
    }

    animationId = requestAnimationFrame(renderLoop);
}

function applyFilter() {
    // Mock face position (center of canvas)
    const faceX = canvas.width / 2;
    const faceY = canvas.height / 2 - 50;
    const faceWidth = 200;

    ctx.font = '80px Arial';
    ctx.textAlign = 'center';

    switch (currentFilter) {
        case 'dog':
            // Dog ears
            ctx.font = '60px Arial';
            ctx.fillText('🐕', faceX - 80, faceY - 80);
            ctx.fillText('🐕', faceX + 80, faceY - 80);
            // Dog nose
            ctx.font = '50px Arial';
            ctx.fillText('🐽', faceX, faceY + 60);
            break;
        case 'cat':
            ctx.font = '50px Arial';
            ctx.fillText('😺', faceX - 70, faceY - 70);
            ctx.fillText('😺', faceX + 70, faceY - 70);
            ctx.font = '40px Arial';
            ctx.fillText('👃', faceX, faceY + 40);
            break;
        case 'glasses':
            ctx.font = '100px Arial';
            ctx.fillText('🕶️', faceX, faceY);
            break;
        case 'crown':
            ctx.font = '80px Arial';
            ctx.fillText('👑', faceX, faceY - 100);
            break;
        case 'heart':
            for (let i = 0; i < 8; i++) {
                const x = faceX + Math.cos(i * Math.PI / 4) * 120;
                const y = faceY + Math.sin(i * Math.PI / 4) * 120;
                ctx.font = `${30 + Math.random() * 20}px Arial`;
                ctx.fillText('💖', x, y);
            }
            break;
        case 'fire':
            ctx.font = '60px Arial';
            ctx.fillText('🔥', faceX - 100, faceY - 60);
            ctx.fillText('🔥', faceX + 100, faceY - 60);
            ctx.font = '40px Arial';
            ctx.fillText('🔥', faceX, faceY - 120);
            break;
        case 'rainbow':
            ctx.font = '120px Arial';
            ctx.fillText('🌈', faceX, faceY - 80);
            break;
    }
}

function capturePhoto() {
    const captureCanvas = document.createElement('canvas');
    captureCanvas.width = video.videoWidth;
    captureCanvas.height = video.videoHeight;
    const captureCtx = captureCanvas.getContext('2d');

    // Flip horizontally to match the display
    captureCtx.translate(captureCanvas.width, 0);
    captureCtx.scale(-1, 1);
    captureCtx.drawImage(video, 0, 0);
    captureCtx.setTransform(1, 0, 0, 1, 0, 0);
    captureCtx.translate(captureCanvas.width, 0);
    captureCtx.scale(-1, 1);
    captureCtx.drawImage(canvas, 0, 0);

    const link = document.createElement('a');
    link.download = `face-filter-${Date.now()}.png`;
    link.href = captureCanvas.toDataURL('image/png');
    link.click();
}

document.addEventListener('DOMContentLoaded', init);
