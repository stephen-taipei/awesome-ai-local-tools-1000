/**
 * AR Filter - Tool #364
 * Apply AR effects to webcam in real-time
 */

let currentLang = 'zh';
let faceMesh = null;
let camera = null;
let isRunning = false;
let mediaRecorder = null;
let recordedChunks = [];
let currentFilter = 'glasses';

const texts = {
    zh: {
        title: 'AR 濾鏡',
        subtitle: '即時 AR 特效濾鏡',
        privacy: '100% 本地處理 · 零資料上傳',
        start: '📷 啟動攝影機',
        stop: '⏹️ 停止',
        record: '⏺️ 開始錄製',
        stopRecord: '⏹️ 停止錄製',
        download: '⬇️ 下載',
        loading: '載入模型中...',
        ready: '準備就緒',
        recording: '錄製中...',
        selectFilter: '選擇特效'
    },
    en: {
        title: 'AR Filter',
        subtitle: 'Real-time AR effect filters',
        privacy: '100% Local Processing · No Data Upload',
        start: '📷 Start Camera',
        stop: '⏹️ Stop',
        record: '⏺️ Start Recording',
        stopRecord: '⏹️ Stop Recording',
        download: '⬇️ Download',
        loading: 'Loading model...',
        ready: 'Ready',
        recording: 'Recording...',
        selectFilter: 'Select Effect'
    }
};

const FACE_LANDMARKS = {
    leftEye: [33, 133, 160, 159, 158, 144, 145, 153],
    rightEye: [362, 263, 387, 386, 385, 373, 374, 380],
    nose: [1, 2, 98, 327],
    mouth: [61, 291, 0, 17],
    forehead: [10, 338, 297, 332, 284],
    chin: [152, 148, 176, 149, 150]
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    document.getElementById('startBtn').addEventListener('click', toggleCamera);
    document.getElementById('recordBtn').addEventListener('click', toggleRecording);
    document.getElementById('downloadBtn').addEventListener('click', downloadRecording);

    document.querySelectorAll('.filter-option').forEach(opt => {
        opt.addEventListener('click', () => {
            document.querySelectorAll('.filter-option').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            currentFilter = opt.dataset.filter;
        });
    });
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');
    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.getElementById('startBtn').textContent = isRunning ? t.stop : t.start;
    document.getElementById('recordBtn').textContent = mediaRecorder?.state === 'recording' ? t.stopRecord : t.record;
    document.getElementById('downloadBtn').textContent = t.download;
    document.querySelector('.filter-selector h3').textContent = t.selectFilter;
}

async function toggleCamera() {
    const startBtn = document.getElementById('startBtn');
    const t = texts[currentLang];

    if (isRunning) {
        stopCamera();
        startBtn.textContent = t.start;
        return;
    }

    startBtn.disabled = true;
    document.getElementById('status').textContent = t.loading;

    try {
        await initFaceMesh();
        await startCamera();
        isRunning = true;
        startBtn.textContent = t.stop;
        document.getElementById('recordBtn').disabled = false;
        document.getElementById('status').textContent = t.ready;
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('status').textContent = 'Error: ' + error.message;
    }

    startBtn.disabled = false;
}

async function initFaceMesh() {
    if (faceMesh) return;

    faceMesh = new FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
    });

    faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    faceMesh.onResults(onResults);
    await faceMesh.initialize();
}

function onResults(results) {
    const canvas = document.getElementById('output');
    const ctx = canvas.getContext('2d');

    canvas.width = results.image.width;
    canvas.height = results.image.height;

    // Draw original image (mirrored)
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(results.image, -canvas.width, 0);
    ctx.restore();

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0];
        drawFilter(ctx, landmarks, canvas.width, canvas.height);
    }
}

function drawFilter(ctx, landmarks, width, height) {
    const getPoint = (idx) => ({
        x: width - landmarks[idx].x * width,
        y: landmarks[idx].y * height
    });

    ctx.save();

    switch (currentFilter) {
        case 'glasses':
            drawGlasses(ctx, getPoint, width);
            break;
        case 'hat':
            drawHat(ctx, getPoint, width);
            break;
        case 'mask':
            drawMask(ctx, getPoint, width);
            break;
        case 'crown':
            drawCrown(ctx, getPoint, width);
            break;
        case 'mustache':
            drawMustache(ctx, getPoint, width);
            break;
        case 'hearts':
            drawHearts(ctx, getPoint, width);
            break;
    }

    ctx.restore();
}

function drawGlasses(ctx, getPoint, width) {
    const leftEye = getPoint(33);
    const rightEye = getPoint(263);
    const eyeDistance = Math.abs(rightEye.x - leftEye.x);
    const glassSize = eyeDistance * 0.6;

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';

    // Left lens
    ctx.beginPath();
    ctx.ellipse(leftEye.x, leftEye.y, glassSize, glassSize * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Right lens
    ctx.beginPath();
    ctx.ellipse(rightEye.x, rightEye.y, glassSize, glassSize * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Bridge
    ctx.beginPath();
    ctx.moveTo(leftEye.x + glassSize, leftEye.y);
    ctx.lineTo(rightEye.x - glassSize, rightEye.y);
    ctx.stroke();
}

function drawHat(ctx, getPoint, width) {
    const forehead = getPoint(10);
    const leftTemple = getPoint(234);
    const rightTemple = getPoint(454);
    const hatWidth = Math.abs(rightTemple.x - leftTemple.x) * 1.5;

    ctx.fillStyle = '#1a1a1a';

    // Hat body
    ctx.beginPath();
    ctx.ellipse(forehead.x, forehead.y - hatWidth * 0.3, hatWidth * 0.5, hatWidth * 0.4, 0, Math.PI, 0);
    ctx.fill();

    // Hat brim
    ctx.beginPath();
    ctx.ellipse(forehead.x, forehead.y - hatWidth * 0.1, hatWidth * 0.7, hatWidth * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawMask(ctx, getPoint, width) {
    const nose = getPoint(1);
    const chin = getPoint(152);
    const leftCheek = getPoint(234);
    const rightCheek = getPoint(454);

    ctx.fillStyle = '#87CEEB';
    ctx.beginPath();
    ctx.moveTo(leftCheek.x, nose.y);
    ctx.quadraticCurveTo(nose.x, nose.y - 20, rightCheek.x, nose.y);
    ctx.lineTo(rightCheek.x, chin.y - 10);
    ctx.quadraticCurveTo(nose.x, chin.y + 10, leftCheek.x, chin.y - 10);
    ctx.closePath();
    ctx.fill();
}

function drawCrown(ctx, getPoint, width) {
    const forehead = getPoint(10);
    const leftTemple = getPoint(234);
    const rightTemple = getPoint(454);
    const crownWidth = Math.abs(rightTemple.x - leftTemple.x) * 1.2;
    const crownHeight = crownWidth * 0.5;

    ctx.fillStyle = '#FFD700';
    ctx.strokeStyle = '#DAA520';
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(forehead.x - crownWidth / 2, forehead.y - crownHeight * 0.3);
    ctx.lineTo(forehead.x - crownWidth / 3, forehead.y - crownHeight);
    ctx.lineTo(forehead.x - crownWidth / 6, forehead.y - crownHeight * 0.5);
    ctx.lineTo(forehead.x, forehead.y - crownHeight * 1.1);
    ctx.lineTo(forehead.x + crownWidth / 6, forehead.y - crownHeight * 0.5);
    ctx.lineTo(forehead.x + crownWidth / 3, forehead.y - crownHeight);
    ctx.lineTo(forehead.x + crownWidth / 2, forehead.y - crownHeight * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Gems
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.arc(forehead.x, forehead.y - crownHeight * 0.6, 8, 0, Math.PI * 2);
    ctx.fill();
}

function drawMustache(ctx, getPoint, width) {
    const nose = getPoint(1);
    const upperLip = getPoint(0);

    const mustacheY = (nose.y + upperLip.y) / 2;
    const mustacheWidth = width * 0.15;

    ctx.fillStyle = '#4a3728';
    ctx.beginPath();
    ctx.moveTo(nose.x - mustacheWidth, mustacheY);
    ctx.quadraticCurveTo(nose.x - mustacheWidth * 0.5, mustacheY - 15, nose.x, mustacheY - 5);
    ctx.quadraticCurveTo(nose.x + mustacheWidth * 0.5, mustacheY - 15, nose.x + mustacheWidth, mustacheY);
    ctx.quadraticCurveTo(nose.x + mustacheWidth * 0.5, mustacheY + 10, nose.x, mustacheY + 5);
    ctx.quadraticCurveTo(nose.x - mustacheWidth * 0.5, mustacheY + 10, nose.x - mustacheWidth, mustacheY);
    ctx.fill();
}

function drawHearts(ctx, getPoint, width) {
    const leftEye = getPoint(33);
    const rightEye = getPoint(263);

    const drawHeart = (x, y, size) => {
        ctx.fillStyle = '#FF69B4';
        ctx.beginPath();
        ctx.moveTo(x, y + size / 4);
        ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + size / 4);
        ctx.bezierCurveTo(x - size / 2, y + size / 2, x, y + size * 0.75, x, y + size);
        ctx.bezierCurveTo(x, y + size * 0.75, x + size / 2, y + size / 2, x + size / 2, y + size / 4);
        ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + size / 4);
        ctx.fill();
    };

    drawHeart(leftEye.x - 30, leftEye.y - 50, 25);
    drawHeart(rightEye.x + 30, rightEye.y - 50, 25);
    drawHeart(leftEye.x + 20, leftEye.y - 70, 15);
    drawHeart(rightEye.x - 20, rightEye.y - 70, 15);
}

async function startCamera() {
    const video = document.getElementById('webcam');

    const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' }
    });

    video.srcObject = stream;
    await video.play();

    camera = new Camera(video, {
        onFrame: async () => {
            if (faceMesh && isRunning) {
                await faceMesh.send({ image: video });
            }
        },
        width: 1280,
        height: 720
    });

    await camera.start();
}

function stopCamera() {
    if (camera) {
        camera.stop();
        camera = null;
    }

    const video = document.getElementById('webcam');
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }

    isRunning = false;
    document.getElementById('recordBtn').disabled = true;
}

function toggleRecording() {
    const recordBtn = document.getElementById('recordBtn');
    const t = texts[currentLang];

    if (mediaRecorder?.state === 'recording') {
        mediaRecorder.stop();
        recordBtn.textContent = t.record;
        recordBtn.classList.remove('recording');
        document.getElementById('status').textContent = t.ready;
    } else {
        startRecording();
        recordBtn.textContent = t.stopRecord;
        recordBtn.classList.add('recording');
        document.getElementById('status').textContent = t.recording;
    }
}

function startRecording() {
    const canvas = document.getElementById('output');
    const stream = canvas.captureStream(30);

    recordedChunks = [];
    mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });

    mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
        document.getElementById('downloadBtn').disabled = false;
    };

    mediaRecorder.start();
}

function downloadRecording() {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'ar-filter.webm';
    a.click();
}

init();
