/**
 * Gesture Recognition - Tool #367
 * Recognize hand gestures in real-time using MediaPipe
 */

let currentLang = 'zh';
let hands = null;
let camera = null;
let isRunning = false;
let mediaRecorder = null;
let recordedChunks = [];

const texts = {
    zh: {
        title: '即時手勢辨識',
        subtitle: '即時辨識手勢動作',
        privacy: '100% 本地處理 · 零資料上傳',
        start: '📷 啟動攝影機',
        stop: '⏹️ 停止',
        record: '⏺️ 開始錄製',
        stopRecord: '⏹️ 停止錄製',
        download: '⬇️ 下載',
        loading: '載入模型中...',
        ready: '準備就緒',
        recording: '錄製中...',
        detectedGesture: '偵測到的手勢',
        gestures: {
            'Fist': '握拳 ✊',
            'Open Palm': '張開手掌 ✋',
            'Thumbs Up': '讚 👍',
            'Thumbs Down': '倒讚 👎',
            'Peace': '勝利 ✌️',
            'Pointing': '指向 👆',
            'OK': 'OK 👌',
            'Rock': '搖滾 🤘',
            'Call': '打電話 🤙',
            'None': '無'
        }
    },
    en: {
        title: 'Gesture Recognition',
        subtitle: 'Recognize hand gestures in real-time',
        privacy: '100% Local Processing · No Data Upload',
        start: '📷 Start Camera',
        stop: '⏹️ Stop',
        record: '⏺️ Start Recording',
        stopRecord: '⏹️ Stop Recording',
        download: '⬇️ Download',
        loading: 'Loading model...',
        ready: 'Ready',
        recording: 'Recording...',
        detectedGesture: 'Detected Gesture',
        gestures: {
            'Fist': 'Fist ✊',
            'Open Palm': 'Open Palm ✋',
            'Thumbs Up': 'Thumbs Up 👍',
            'Thumbs Down': 'Thumbs Down 👎',
            'Peace': 'Peace ✌️',
            'Pointing': 'Pointing 👆',
            'OK': 'OK 👌',
            'Rock': 'Rock 🤘',
            'Call': 'Call 🤙',
            'None': 'None'
        }
    }
};

const HAND_CONNECTIONS = [
    [0, 1], [1, 2], [2, 3], [3, 4],
    [0, 5], [5, 6], [6, 7], [7, 8],
    [0, 9], [9, 10], [10, 11], [11, 12],
    [0, 13], [13, 14], [14, 15], [15, 16],
    [0, 17], [17, 18], [18, 19], [19, 20],
    [5, 9], [9, 13], [13, 17]
];

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    document.getElementById('startBtn').addEventListener('click', toggleCamera);
    document.getElementById('recordBtn').addEventListener('click', toggleRecording);
    document.getElementById('downloadBtn').addEventListener('click', downloadRecording);
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
    document.querySelector('.gesture-info h3').textContent = t.detectedGesture;
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
        await initHands();
        await startCamera();
        isRunning = true;
        startBtn.textContent = t.stop;
        document.getElementById('recordBtn').disabled = false;
        document.getElementById('gestureInfo').style.display = 'block';
        document.getElementById('status').textContent = t.ready;
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('status').textContent = 'Error: ' + error.message;
    }

    startBtn.disabled = false;
}

async function initHands() {
    if (hands) return;

    hands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    hands.onResults(onResults);
    await hands.initialize();
}

function recognizeGesture(landmarks) {
    const fingerTips = [4, 8, 12, 16, 20];
    const fingerPips = [3, 6, 10, 14, 18];

    // Check if fingers are extended
    const fingersExtended = [];

    // Thumb (special case)
    fingersExtended.push(landmarks[4].x < landmarks[3].x);

    // Other fingers
    for (let i = 1; i < 5; i++) {
        fingersExtended.push(landmarks[fingerTips[i]].y < landmarks[fingerPips[i]].y);
    }

    const extendedCount = fingersExtended.filter(Boolean).length;

    // Gesture recognition
    if (extendedCount === 0) return 'Fist';
    if (extendedCount === 5) return 'Open Palm';
    if (fingersExtended[0] && extendedCount === 1) return 'Thumbs Up';
    if (fingersExtended[1] && fingersExtended[2] && extendedCount === 2) return 'Peace';
    if (fingersExtended[1] && extendedCount === 1) return 'Pointing';
    if (fingersExtended[0] && fingersExtended[4] && extendedCount === 2) return 'Call';
    if (fingersExtended[1] && fingersExtended[4] && extendedCount === 2) return 'Rock';

    // OK gesture (thumb and index touching)
    const thumbIndexDist = Math.hypot(
        landmarks[4].x - landmarks[8].x,
        landmarks[4].y - landmarks[8].y
    );
    if (thumbIndexDist < 0.05 && fingersExtended[2] && fingersExtended[3] && fingersExtended[4]) {
        return 'OK';
    }

    return 'None';
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

    let gesture = 'None';

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        results.multiHandLandmarks.forEach((landmarks) => {
            // Mirror landmarks
            const mirroredLandmarks = landmarks.map(lm => ({
                x: 1 - lm.x,
                y: lm.y,
                z: lm.z
            }));

            // Draw connections
            ctx.strokeStyle = '#6366f1';
            ctx.lineWidth = 3;

            HAND_CONNECTIONS.forEach(([start, end]) => {
                ctx.beginPath();
                ctx.moveTo(mirroredLandmarks[start].x * canvas.width, mirroredLandmarks[start].y * canvas.height);
                ctx.lineTo(mirroredLandmarks[end].x * canvas.width, mirroredLandmarks[end].y * canvas.height);
                ctx.stroke();
            });

            // Draw points
            mirroredLandmarks.forEach((lm) => {
                ctx.fillStyle = '#818cf8';
                ctx.beginPath();
                ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 5, 0, Math.PI * 2);
                ctx.fill();
            });

            gesture = recognizeGesture(mirroredLandmarks);
        });
    }

    // Update gesture display
    const t = texts[currentLang];
    document.getElementById('gestureName').textContent = t.gestures[gesture];

    const gestureEmoji = {
        'Fist': '✊', 'Open Palm': '✋', 'Thumbs Up': '👍', 'Thumbs Down': '👎',
        'Peace': '✌️', 'Pointing': '👆', 'OK': '👌', 'Rock': '🤘', 'Call': '🤙', 'None': '✋'
    };
    document.getElementById('gestureDisplay').textContent = gestureEmoji[gesture];
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
            if (hands && isRunning) {
                await hands.send({ image: video });
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
    document.getElementById('gestureInfo').style.display = 'none';
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
    a.download = 'gesture-recognition.webm';
    a.click();
}

init();
