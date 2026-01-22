/**
 * Realtime Background Removal - Tool #361
 * Remove background from webcam feed in real-time using MediaPipe
 */

let currentLang = 'zh';
let selfieSegmentation = null;
let camera = null;
let isRunning = false;
let mediaRecorder = null;
let recordedChunks = [];
let edgeBlur = 3;

const texts = {
    zh: {
        title: '即時背景移除',
        subtitle: '即時移除視訊背景',
        privacy: '100% 本地處理 · 零資料上傳',
        start: '📷 啟動攝影機',
        stop: '⏹️ 停止',
        record: '⏺️ 開始錄製',
        stopRecord: '⏹️ 停止錄製',
        download: '⬇️ 下載',
        loading: '載入模型中...',
        ready: '準備就緒',
        recording: '錄製中...',
        edgeBlur: '邊緣模糊'
    },
    en: {
        title: 'Realtime Background Removal',
        subtitle: 'Remove video background in real-time',
        privacy: '100% Local Processing · No Data Upload',
        start: '📷 Start Camera',
        stop: '⏹️ Stop',
        record: '⏺️ Start Recording',
        stopRecord: '⏹️ Stop Recording',
        download: '⬇️ Download',
        loading: 'Loading model...',
        ready: 'Ready',
        recording: 'Recording...',
        edgeBlur: 'Edge Blur'
    }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    document.getElementById('startBtn').addEventListener('click', toggleCamera);
    document.getElementById('recordBtn').addEventListener('click', toggleRecording);
    document.getElementById('downloadBtn').addEventListener('click', downloadRecording);

    const edgeBlurInput = document.getElementById('edgeBlur');
    edgeBlurInput.addEventListener('input', (e) => {
        edgeBlur = parseInt(e.target.value);
        document.getElementById('edgeBlurValue').textContent = edgeBlur;
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
    document.querySelector('.option-group label').textContent = t.edgeBlur + '：';
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
        await initSegmentation();
        await startCamera();
        isRunning = true;
        startBtn.textContent = t.stop;
        document.getElementById('recordBtn').disabled = false;
        document.getElementById('optionsSection').style.display = 'block';
        document.getElementById('status').textContent = t.ready;
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('status').textContent = 'Error: ' + error.message;
    }

    startBtn.disabled = false;
}

async function initSegmentation() {
    if (selfieSegmentation) return;

    selfieSegmentation = new SelfieSegmentation({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`
    });

    selfieSegmentation.setOptions({
        modelSelection: 1,
        selfieMode: true
    });

    selfieSegmentation.onResults(onResults);
    await selfieSegmentation.initialize();
}

function onResults(results) {
    const canvas = document.getElementById('output');
    const ctx = canvas.getContext('2d');

    canvas.width = results.image.width;
    canvas.height = results.image.height;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw segmentation mask
    ctx.drawImage(results.segmentationMask, 0, 0, canvas.width, canvas.height);

    // Apply blur to edges if needed
    if (edgeBlur > 0) {
        ctx.filter = `blur(${edgeBlur}px)`;
        ctx.globalCompositeOperation = 'destination-in';
        ctx.drawImage(results.segmentationMask, 0, 0, canvas.width, canvas.height);
        ctx.filter = 'none';
    }

    // Draw the person only (background removed)
    ctx.globalCompositeOperation = 'source-in';
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

    ctx.restore();
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
            if (selfieSegmentation && isRunning) {
                await selfieSegmentation.send({ image: video });
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
    document.getElementById('optionsSection').style.display = 'none';
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
    a.download = 'background-removed.webm';
    a.click();
}

init();
