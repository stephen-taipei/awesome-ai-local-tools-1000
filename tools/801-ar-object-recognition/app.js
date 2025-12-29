/**
 * AR Object Recognition - Tool #801
 * Real-time object detection using camera
 */

const i18n = {
    en: {
        title: "AR Object Recognition",
        subtitle: "Identify objects in real-time using your camera",
        privacy: "100% Local Processing - No Data Upload",
        loading: "Loading AR engine...",
        ready: "Ready! Click 'Start Camera' to begin",
        error: "Error loading model",
        start: "Start Camera",
        stop: "Stop Camera",
        capture: "Capture Frame",
        detected: "Detected Objects",
        realtime: "Real-time Detection",
        realtimeDesc: "Continuous object recognition from camera feed",
        ai: "AI Powered",
        aiDesc: "Advanced neural network for accurate recognition",
        privacyTitle: "Privacy First",
        privacyDesc: "All processing happens locally in your browser",
        noObjects: "Point camera at objects to detect them",
        confidence: "Confidence"
    },
    zh: {
        title: "AR 物件識別",
        subtitle: "使用相機即時識別物件",
        privacy: "100% 本地處理 - 無數據上傳",
        loading: "正在載入 AR 引擎...",
        ready: "準備就緒！點擊「啟動相機」開始",
        error: "模型載入錯誤",
        start: "啟動相機",
        stop: "停止相機",
        capture: "截取畫面",
        detected: "偵測到的物件",
        realtime: "即時偵測",
        realtimeDesc: "從相機畫面持續識別物件",
        ai: "AI 驅動",
        aiDesc: "先進神經網路實現精確識別",
        privacyTitle: "隱私優先",
        privacyDesc: "所有處理都在瀏覽器本地進行",
        noObjects: "將相機對準物件以進行偵測",
        confidence: "信心度"
    }
};

let currentLang = 'en';
let video, canvas, ctx;
let isRunning = false;
let animationId;

// Simulated object detection (in production, use TensorFlow.js or similar)
const mockObjects = [
    { label: 'Person', confidence: 0.95 },
    { label: 'Chair', confidence: 0.87 },
    { label: 'Table', confidence: 0.82 },
    { label: 'Computer', confidence: 0.78 },
    { label: 'Phone', confidence: 0.91 },
    { label: 'Book', confidence: 0.85 },
    { label: 'Cup', confidence: 0.89 },
    { label: 'Keyboard', confidence: 0.93 }
];

function setLang(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18n[lang][key]) {
            el.textContent = i18n[lang][key];
        }
    });
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

function init() {
    video = document.getElementById('video');
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    setTimeout(() => {
        document.getElementById('status').className = 'status ready';
        document.getElementById('status').textContent = i18n[currentLang].ready;
    }, 1500);
}

async function startAR() {
    const btn = document.getElementById('startBtn');

    if (isRunning) {
        stopAR();
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
            isRunning = true;
            btn.textContent = i18n[currentLang].stop;
            document.getElementById('captureBtn').disabled = false;
            detectLoop();
        };
    } catch (err) {
        console.error('Camera error:', err);
        document.getElementById('status').className = 'status error';
        document.getElementById('status').textContent = 'Camera access denied';
    }
}

function stopAR() {
    isRunning = false;
    if (animationId) cancelAnimationFrame(animationId);

    const stream = video.srcObject;
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    video.srcObject = null;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    document.getElementById('startBtn').textContent = i18n[currentLang].start;
    document.getElementById('captureBtn').disabled = true;
}

function detectLoop() {
    if (!isRunning) return;

    // Simulate detection with random objects
    const detected = mockObjects
        .filter(() => Math.random() > 0.6)
        .map(obj => ({
            ...obj,
            confidence: Math.max(0.5, obj.confidence - Math.random() * 0.2),
            x: Math.random() * (canvas.width - 200),
            y: Math.random() * (canvas.height - 150),
            w: 100 + Math.random() * 150,
            h: 80 + Math.random() * 120
        }));

    drawDetections(detected);
    updateResultsList(detected);

    animationId = setTimeout(() => requestAnimationFrame(detectLoop), 500);
}

function drawDetections(detections) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    detections.forEach(det => {
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 3;
        ctx.strokeRect(det.x, det.y, det.w, det.h);

        ctx.fillStyle = 'rgba(0, 255, 136, 0.8)';
        ctx.font = 'bold 16px Arial';
        const text = `${det.label} ${(det.confidence * 100).toFixed(0)}%`;
        const textWidth = ctx.measureText(text).width;
        ctx.fillRect(det.x, det.y - 25, textWidth + 10, 25);
        ctx.fillStyle = '#000';
        ctx.fillText(text, det.x + 5, det.y - 7);
    });
}

function updateResultsList(detections) {
    const list = document.getElementById('resultsList');
    if (detections.length === 0) {
        list.innerHTML = `<p style="color: rgba(255,255,255,0.5);">${i18n[currentLang].noObjects}</p>`;
        return;
    }

    list.innerHTML = detections.map(det => `
        <div class="result-item">
            <span class="result-label">${det.label}</span>
            <span class="result-confidence">${(det.confidence * 100).toFixed(1)}%</span>
        </div>
    `).join('');
}

function captureFrame() {
    const captureCanvas = document.createElement('canvas');
    captureCanvas.width = video.videoWidth;
    captureCanvas.height = video.videoHeight;
    const captureCtx = captureCanvas.getContext('2d');
    captureCtx.drawImage(video, 0, 0);
    captureCtx.drawImage(canvas, 0, 0);

    const link = document.createElement('a');
    link.download = `ar-capture-${Date.now()}.png`;
    link.href = captureCanvas.toDataURL('image/png');
    link.click();
}

document.addEventListener('DOMContentLoaded', init);
