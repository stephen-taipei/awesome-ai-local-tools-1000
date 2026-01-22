/**
 * Object Tracking - Tool #365
 * Track objects in real-time from webcam
 */

let currentLang = 'zh';
let model = null;
let isRunning = false;
let mediaRecorder = null;
let recordedChunks = [];
let video = null;
let canvas = null;
let ctx = null;
let animationId = null;

const texts = {
    zh: {
        title: '即時物件追蹤',
        subtitle: '即時追蹤畫面中的物件',
        privacy: '100% 本地處理 · 零資料上傳',
        start: '📷 啟動攝影機',
        stop: '⏹️ 停止',
        record: '⏺️ 開始錄製',
        stopRecord: '⏹️ 停止錄製',
        download: '⬇️ 下載',
        loading: '載入模型中...',
        ready: '準備就緒',
        recording: '錄製中...',
        results: '偵測結果'
    },
    en: {
        title: 'Object Tracking',
        subtitle: 'Track objects in real-time',
        privacy: '100% Local Processing · No Data Upload',
        start: '📷 Start Camera',
        stop: '⏹️ Stop',
        record: '⏺️ Start Recording',
        stopRecord: '⏹️ Stop Recording',
        download: '⬇️ Download',
        loading: 'Loading model...',
        ready: 'Ready',
        recording: 'Recording...',
        results: 'Detection Results'
    }
};

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    document.getElementById('startBtn').addEventListener('click', toggleCamera);
    document.getElementById('recordBtn').addEventListener('click', toggleRecording);
    document.getElementById('downloadBtn').addEventListener('click', downloadRecording);

    video = document.getElementById('webcam');
    canvas = document.getElementById('output');
    ctx = canvas.getContext('2d');
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
        await loadModel();
        await startCamera();
        isRunning = true;
        startBtn.textContent = t.stop;
        document.getElementById('recordBtn').disabled = false;
        document.getElementById('infoPanel').style.display = 'block';
        document.getElementById('status').textContent = t.ready;
        detectFrame();
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('status').textContent = 'Error: ' + error.message;
    }

    startBtn.disabled = false;
}

async function loadModel() {
    if (model) return;
    model = await cocoSsd.load();
}

async function startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' }
    });

    video.srcObject = stream;
    await video.play();

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
}

async function detectFrame() {
    if (!isRunning) return;

    const predictions = await model.detect(video);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update detection list
    const detectionList = document.getElementById('detectionList');
    const objectCounts = {};

    predictions.forEach((prediction, index) => {
        const [x, y, width, height] = prediction.bbox;
        const color = COLORS[index % COLORS.length];

        // Draw bounding box
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, width, height);

        // Draw label background
        ctx.fillStyle = color;
        const label = `${prediction.class} ${Math.round(prediction.score * 100)}%`;
        const textWidth = ctx.measureText(label).width;
        ctx.fillRect(x, y - 25, textWidth + 10, 25);

        // Draw label text
        ctx.fillStyle = '#fff';
        ctx.font = '16px sans-serif';
        ctx.fillText(label, x + 5, y - 7);

        // Count objects
        objectCounts[prediction.class] = (objectCounts[prediction.class] || 0) + 1;
    });

    // Update detection list UI
    detectionList.innerHTML = Object.entries(objectCounts)
        .map(([name, count]) => `<span class="detection-item">${name}: ${count}</span>`)
        .join('');

    animationId = requestAnimationFrame(detectFrame);
}

function stopCamera() {
    isRunning = false;

    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }

    document.getElementById('recordBtn').disabled = true;
    document.getElementById('infoPanel').style.display = 'none';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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
    // Create a combined canvas with video and overlays
    const recordCanvas = document.createElement('canvas');
    recordCanvas.width = canvas.width;
    recordCanvas.height = canvas.height;
    const recordCtx = recordCanvas.getContext('2d');

    const drawFrame = () => {
        if (!isRunning) return;
        recordCtx.drawImage(video, 0, 0);
        recordCtx.drawImage(canvas, 0, 0);
        requestAnimationFrame(drawFrame);
    };
    drawFrame();

    const stream = recordCanvas.captureStream(30);
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
    a.download = 'object-tracking.webm';
    a.click();
}

init();
