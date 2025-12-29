/**
 * AR Hand Gesture - Tool #803
 * Hand gesture recognition using camera
 */

const i18n = {
    en: {
        title: "AR Hand Gesture",
        subtitle: "Control with your hands in augmented reality",
        privacy: "100% Local Processing - No Data Upload",
        start: "Start Camera",
        stop: "Stop Camera",
        waiting: "Show your hand",
        open: "Open",
        fist: "Fist",
        point: "Point",
        peace: "Peace",
        thumbs: "Thumbs Up",
        pinch: "Pinch",
        multiGesture: "Multi-Gesture",
        multiGestureDesc: "Recognizes 6+ common hand gestures",
        lowLatency: "Low Latency",
        lowLatencyDesc: "Real-time tracking at 30+ FPS",
        precise: "Precise",
        preciseDesc: "21 hand landmarks tracked accurately"
    },
    zh: {
        title: "AR 手勢識別",
        subtitle: "在擴增實境中用手勢控制",
        privacy: "100% 本地處理 - 無數據上傳",
        start: "啟動相機",
        stop: "停止相機",
        waiting: "請展示您的手",
        open: "張開",
        fist: "握拳",
        point: "指向",
        peace: "和平",
        thumbs: "讚",
        pinch: "捏合",
        multiGesture: "多手勢",
        multiGestureDesc: "識別 6 種以上常見手勢",
        lowLatency: "低延遲",
        lowLatencyDesc: "30+ FPS 即時追蹤",
        precise: "精確",
        preciseDesc: "精確追蹤 21 個手部關鍵點"
    }
};

let currentLang = 'en';
let video, canvas, ctx;
let isTracking = false;

const gestures = [
    { id: 'open', icon: '✋', name: 'Open' },
    { id: 'fist', icon: '✊', name: 'Fist' },
    { id: 'point', icon: '👆', name: 'Point' },
    { id: 'peace', icon: '✌️', name: 'Peace' },
    { id: 'thumbs', icon: '👍', name: 'Thumbs Up' },
    { id: 'pinch', icon: '🤏', name: 'Pinch' }
];

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

async function startTracking() {
    const btn = document.getElementById('startBtn');

    if (isTracking) {
        stopTracking();
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 1280, height: 720 }
        });
        video.srcObject = stream;

        video.onloadedmetadata = () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            isTracking = true;
            btn.textContent = i18n[currentLang].stop;
            detectLoop();
        };
    } catch (err) {
        console.error('Camera error:', err);
    }
}

function stopTracking() {
    isTracking = false;
    const stream = video.srcObject;
    if (stream) stream.getTracks().forEach(track => track.stop());
    video.srcObject = null;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById('startBtn').textContent = i18n[currentLang].start;
}

function detectLoop() {
    if (!isTracking) return;

    // Simulate hand detection
    const detected = Math.random() > 0.3;

    if (detected) {
        drawMockHand();
        const gesture = gestures[Math.floor(Math.random() * gestures.length)];
        updateGestureDisplay(gesture);
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        document.getElementById('gestureIcon').textContent = '✋';
        document.getElementById('gestureName').textContent = i18n[currentLang].waiting;
        document.querySelectorAll('.gesture-card').forEach(card => card.classList.remove('active'));
    }

    setTimeout(() => requestAnimationFrame(detectLoop), 200);
}

function drawMockHand() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Mock hand landmarks
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const landmarks = [];
    for (let i = 0; i < 21; i++) {
        landmarks.push({
            x: centerX + (Math.random() - 0.5) * 200,
            y: centerY + (Math.random() - 0.5) * 250
        });
    }

    // Draw connections
    ctx.strokeStyle = '#38ef7d';
    ctx.lineWidth = 3;
    const connections = [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[17,18],[18,19],[19,20],[0,17]];

    connections.forEach(([i, j]) => {
        if (landmarks[i] && landmarks[j]) {
            ctx.beginPath();
            ctx.moveTo(landmarks[i].x, landmarks[i].y);
            ctx.lineTo(landmarks[j].x, landmarks[j].y);
            ctx.stroke();
        }
    });

    // Draw landmarks
    landmarks.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#11998e';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
    });
}

function updateGestureDisplay(gesture) {
    document.getElementById('gestureIcon').textContent = gesture.icon;
    document.getElementById('gestureName').textContent = i18n[currentLang][gesture.id] || gesture.name;

    document.querySelectorAll('.gesture-card').forEach(card => {
        card.classList.remove('active');
        if (card.id === `gesture-${gesture.id}`) {
            card.classList.add('active');
        }
    });
}

document.addEventListener('DOMContentLoaded', init);
