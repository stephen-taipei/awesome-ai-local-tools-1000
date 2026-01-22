/**
 * Pose Estimation - Tool #366
 * Detect human pose in real-time using MediaPipe
 */

let currentLang = 'zh';
let pose = null;
let camera = null;
let isRunning = false;
let mediaRecorder = null;
let recordedChunks = [];
let skeletonColor = '#10b981';
let showPoints = true;

const texts = {
    zh: {
        title: '即時姿態估計',
        subtitle: '即時偵測人體姿態',
        privacy: '100% 本地處理 · 零資料上傳',
        start: '📷 啟動攝影機',
        stop: '⏹️ 停止',
        record: '⏺️ 開始錄製',
        stopRecord: '⏹️ 停止錄製',
        download: '⬇️ 下載',
        loading: '載入模型中...',
        ready: '準備就緒',
        recording: '錄製中...',
        skeletonColor: '骨架顏色',
        showPoints: '顯示關節點'
    },
    en: {
        title: 'Pose Estimation',
        subtitle: 'Detect human pose in real-time',
        privacy: '100% Local Processing · No Data Upload',
        start: '📷 Start Camera',
        stop: '⏹️ Stop',
        record: '⏺️ Start Recording',
        stopRecord: '⏹️ Stop Recording',
        download: '⬇️ Download',
        loading: 'Loading model...',
        ready: 'Ready',
        recording: 'Recording...',
        skeletonColor: 'Skeleton Color',
        showPoints: 'Show Points'
    }
};

const POSE_CONNECTIONS = [
    [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
    [11, 23], [12, 24], [23, 24],
    [23, 25], [25, 27], [24, 26], [26, 28],
    [27, 29], [29, 31], [28, 30], [30, 32]
];

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    document.getElementById('startBtn').addEventListener('click', toggleCamera);
    document.getElementById('recordBtn').addEventListener('click', toggleRecording);
    document.getElementById('downloadBtn').addEventListener('click', downloadRecording);

    document.getElementById('skeletonColor').addEventListener('input', (e) => {
        skeletonColor = e.target.value;
    });

    document.getElementById('showPoints').addEventListener('change', (e) => {
        showPoints = e.target.checked;
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
        await initPose();
        await startCamera();
        isRunning = true;
        startBtn.textContent = t.stop;
        document.getElementById('recordBtn').disabled = false;
        document.getElementById('optionsSection').style.display = 'flex';
        document.getElementById('status').textContent = t.ready;
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('status').textContent = 'Error: ' + error.message;
    }

    startBtn.disabled = false;
}

async function initPose() {
    if (pose) return;

    pose = new Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
    });

    pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    pose.onResults(onResults);
    await pose.initialize();
}

function onResults(results) {
    const canvas = document.getElementById('output');
    const ctx = canvas.getContext('2d');

    canvas.width = results.image.width;
    canvas.height = results.image.height;

    // Draw image (mirrored)
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(results.image, -canvas.width, 0);
    ctx.restore();

    if (results.poseLandmarks) {
        const landmarks = results.poseLandmarks;

        // Mirror the landmarks
        const mirroredLandmarks = landmarks.map(lm => ({
            x: 1 - lm.x,
            y: lm.y,
            z: lm.z,
            visibility: lm.visibility
        }));

        // Draw connections
        ctx.strokeStyle = skeletonColor;
        ctx.lineWidth = 4;

        POSE_CONNECTIONS.forEach(([start, end]) => {
            const startLm = mirroredLandmarks[start];
            const endLm = mirroredLandmarks[end];

            if (startLm.visibility > 0.5 && endLm.visibility > 0.5) {
                ctx.beginPath();
                ctx.moveTo(startLm.x * canvas.width, startLm.y * canvas.height);
                ctx.lineTo(endLm.x * canvas.width, endLm.y * canvas.height);
                ctx.stroke();
            }
        });

        // Draw points
        if (showPoints) {
            mirroredLandmarks.forEach((lm, index) => {
                if (lm.visibility > 0.5) {
                    ctx.fillStyle = skeletonColor;
                    ctx.beginPath();
                    ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 6, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.fillStyle = '#fff';
                    ctx.beginPath();
                    ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
        }
    }
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
            if (pose && isRunning) {
                await pose.send({ image: video });
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
    a.download = 'pose-estimation.webm';
    a.click();
}

init();
