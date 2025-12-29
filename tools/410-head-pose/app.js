/**
 * Head Pose - Tool #410
 * Real-time head pose estimation
 */

const video = document.getElementById('webcam');
const overlayCanvas = document.getElementById('overlayCanvas');
const overlayCtx = overlayCanvas.getContext('2d');
let webcamStream = null;
let detectionInterval = null;
let currentLang = 'zh';

const poseLabels = {
    center: { zh: '正視', en: 'Facing Forward' },
    left: { zh: '向左', en: 'Looking Left' },
    right: { zh: '向右', en: 'Looking Right' },
    up: { zh: '向上', en: 'Looking Up' },
    down: { zh: '向下', en: 'Looking Down' },
    tiltLeft: { zh: '左傾', en: 'Tilted Left' },
    tiltRight: { zh: '右傾', en: 'Tilted Right' }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    document.getElementById('startBtn').addEventListener('click', toggleDetection);
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');

    const texts = {
        zh: {
            title: '頭部姿態',
            subtitle: '即時估測頭部方向和角度',
            privacy: '100% 本地處理 · 零資料上傳',
            start: '開始偵測',
            stop: '停止偵測',
            yaw: '水平 (Yaw)',
            pitch: '垂直 (Pitch)',
            roll: '傾斜 (Roll)'
        },
        en: {
            title: 'Head Pose',
            subtitle: 'Estimate head orientation in real-time',
            privacy: '100% Local Processing · No Data Upload',
            start: 'Start Detection',
            stop: 'Stop Detection',
            yaw: 'Horizontal (Yaw)',
            pitch: 'Vertical (Pitch)',
            roll: 'Tilt (Roll)'
        }
    };

    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;

    if (!webcamStream) {
        document.getElementById('startBtn').textContent = t.start;
    } else {
        document.getElementById('startBtn').textContent = t.stop;
    }

    document.querySelectorAll('.angle-label')[0].textContent = t.yaw;
    document.querySelectorAll('.angle-label')[1].textContent = t.pitch;
    document.querySelectorAll('.angle-label')[2].textContent = t.roll;
}

async function toggleDetection() {
    const btn = document.getElementById('startBtn');
    const videoContainer = document.querySelector('.video-container');

    if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
        webcamStream = null;
        clearInterval(detectionInterval);
        videoContainer.style.display = 'none';
        document.getElementById('resultSection').style.display = 'none';
        btn.textContent = currentLang === 'zh' ? '開始偵測' : 'Start Detection';
        return;
    }

    try {
        webcamStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: 640, height: 480 }
        });
        video.srcObject = webcamStream;
        videoContainer.style.display = 'block';
        document.getElementById('resultSection').style.display = 'block';
        btn.textContent = currentLang === 'zh' ? '停止偵測' : 'Stop Detection';

        video.onloadedmetadata = () => {
            overlayCanvas.width = video.videoWidth;
            overlayCanvas.height = video.videoHeight;
            startDetection();
        };
    } catch (err) {
        alert(currentLang === 'zh' ? '無法存取攝影機' : 'Cannot access webcam');
    }
}

function startDetection() {
    detectionInterval = setInterval(() => {
        analyzeFrame();
    }, 50);
}

function analyzeFrame() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Analyze face region for pose estimation
    const pose = estimatePose(imageData, canvas.width, canvas.height);

    updateDisplay(pose);
    drawOverlay(pose);
}

function estimatePose(imageData, width, height) {
    const data = imageData.data;

    // Divide face into regions for analysis
    const regions = {
        left: analyzeRegion(data, width, 0, 0, width * 0.4, height),
        right: analyzeRegion(data, width, width * 0.6, 0, width * 0.4, height),
        top: analyzeRegion(data, width, 0, 0, width, height * 0.4),
        bottom: analyzeRegion(data, width, 0, height * 0.6, width, height * 0.4),
        topLeft: analyzeRegion(data, width, 0, 0, width * 0.5, height * 0.5),
        topRight: analyzeRegion(data, width, width * 0.5, 0, width * 0.5, height * 0.5),
        bottomLeft: analyzeRegion(data, width, 0, height * 0.5, width * 0.5, height * 0.5),
        bottomRight: analyzeRegion(data, width, width * 0.5, height * 0.5, width * 0.5, height * 0.5)
    };

    // Estimate yaw (left-right rotation)
    const yaw = (regions.right.brightness - regions.left.brightness) * 90;

    // Estimate pitch (up-down rotation)
    const pitch = (regions.top.brightness - regions.bottom.brightness) * 60;

    // Estimate roll (head tilt)
    const diag1 = (regions.topLeft.brightness + regions.bottomRight.brightness) / 2;
    const diag2 = (regions.topRight.brightness + regions.bottomLeft.brightness) / 2;
    const roll = (diag1 - diag2) * 45;

    return {
        yaw: Math.max(-45, Math.min(45, yaw)),
        pitch: Math.max(-30, Math.min(30, pitch)),
        roll: Math.max(-30, Math.min(30, roll))
    };
}

function analyzeRegion(data, canvasWidth, startX, startY, regionWidth, regionHeight) {
    let brightness = 0;
    let count = 0;

    for (let y = Math.floor(startY); y < Math.floor(startY + regionHeight); y++) {
        for (let x = Math.floor(startX); x < Math.floor(startX + regionWidth); x++) {
            const idx = (y * canvasWidth + x) * 4;
            if (idx < data.length - 3) {
                brightness += (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                count++;
            }
        }
    }

    return {
        brightness: count > 0 ? brightness / count / 255 : 0.5
    };
}

function updateDisplay(pose) {
    // Update angle values
    document.getElementById('yawValue').textContent = `${Math.round(pose.yaw)}°`;
    document.getElementById('pitchValue').textContent = `${Math.round(pose.pitch)}°`;
    document.getElementById('rollValue').textContent = `${Math.round(pose.roll)}°`;

    // Update angle indicators
    document.getElementById('yawIndicator').style.left = `${50 + (pose.yaw / 45) * 40}%`;
    document.getElementById('pitchIndicator').style.left = `${50 + (pose.pitch / 30) * 40}%`;
    document.getElementById('rollIndicator').style.left = `${50 + (pose.roll / 30) * 40}%`;

    // Update 3D head model
    const headFace = document.querySelector('.head-face');
    headFace.style.transform = `rotateY(${pose.yaw}deg) rotateX(${-pose.pitch}deg) rotateZ(${pose.roll}deg)`;

    // Update pose direction label
    let direction = 'center';
    if (Math.abs(pose.yaw) > 15) {
        direction = pose.yaw > 0 ? 'right' : 'left';
    } else if (Math.abs(pose.pitch) > 10) {
        direction = pose.pitch > 0 ? 'up' : 'down';
    } else if (Math.abs(pose.roll) > 10) {
        direction = pose.roll > 0 ? 'tiltRight' : 'tiltLeft';
    }

    document.getElementById('poseDirection').textContent = poseLabels[direction][currentLang];
}

function drawOverlay(pose) {
    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    const centerX = overlayCanvas.width / 2;
    const centerY = overlayCanvas.height / 2;

    // Draw pose direction arrow
    overlayCtx.strokeStyle = '#14b8a6';
    overlayCtx.lineWidth = 3;

    const arrowLength = 60;
    const arrowX = centerX + (pose.yaw / 45) * arrowLength;
    const arrowY = centerY - (pose.pitch / 30) * arrowLength;

    overlayCtx.beginPath();
    overlayCtx.moveTo(centerX, centerY);
    overlayCtx.lineTo(arrowX, arrowY);
    overlayCtx.stroke();

    // Draw arrow head
    const angle = Math.atan2(arrowY - centerY, arrowX - centerX);
    overlayCtx.beginPath();
    overlayCtx.moveTo(arrowX, arrowY);
    overlayCtx.lineTo(arrowX - 15 * Math.cos(angle - Math.PI / 6), arrowY - 15 * Math.sin(angle - Math.PI / 6));
    overlayCtx.lineTo(arrowX - 15 * Math.cos(angle + Math.PI / 6), arrowY - 15 * Math.sin(angle + Math.PI / 6));
    overlayCtx.closePath();
    overlayCtx.fillStyle = '#14b8a6';
    overlayCtx.fill();

    // Draw center reference point
    overlayCtx.beginPath();
    overlayCtx.arc(centerX, centerY, 5, 0, Math.PI * 2);
    overlayCtx.fillStyle = '#14b8a6';
    overlayCtx.fill();
}

init();
