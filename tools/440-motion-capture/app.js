/**
 * Motion Capture - Tool #440
 * Capture and record body motion data
 */

const video = document.getElementById('webcam');
const canvas = document.getElementById('skeletonCanvas');
const ctx = canvas.getContext('2d');
let stream = null;
let animationId = null;
let currentLang = 'zh';
let isRecording = false;
let recordedFrames = [];
let recordStartTime = 0;
let frameCount = 0;
let lastFpsTime = Date.now();
let fps = 0;

const jointNames = ['nose', 'leftEye', 'rightEye', 'leftEar', 'rightEar',
    'leftShoulder', 'rightShoulder', 'leftElbow', 'rightElbow',
    'leftWrist', 'rightWrist', 'leftHip', 'rightHip',
    'leftKnee', 'rightKnee', 'leftAnkle', 'rightAnkle'];

const skeleton = [
    [0, 1], [0, 2], [1, 3], [2, 4],
    [5, 6], [5, 7], [7, 9], [6, 8], [8, 10],
    [5, 11], [6, 12], [11, 12],
    [11, 13], [13, 15], [12, 14], [14, 16]
];

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    document.getElementById('startBtn').addEventListener('click', startCapture);
    document.getElementById('recordBtn').addEventListener('click', toggleRecording);
    document.getElementById('exportBtn').addEventListener('click', exportData);
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');

    const texts = {
        zh: { title: '動作捕捉', subtitle: '即時捕捉並記錄身體動作數據', privacy: '100% 本地處理 · 零資料上傳', start: '開始捕捉', record: '開始錄製', stopRecord: '停止錄製', frames: '幀數', joints: '關節點', data: '動作數據', export: '匯出 JSON' },
        en: { title: 'Motion Capture', subtitle: 'Capture and record body motion data', privacy: '100% Local Processing · No Data Upload', start: 'Start Capture', record: 'Start Recording', stopRecord: 'Stop Recording', frames: 'Frames', joints: 'Joints', data: 'Motion Data', export: 'Export JSON' }
    };

    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.getElementById('startBtn').textContent = t.start;
    document.querySelector('.record-text').textContent = isRecording ? t.stopRecord : t.record;

    const labels = document.querySelectorAll('.stat-label');
    labels[0].textContent = t.frames;
    labels[1].textContent = t.joints;

    document.querySelector('.data-section h3').textContent = t.data;
    document.getElementById('exportBtn').textContent = t.export;
}

async function startCapture() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: 640, height: 480 }
        });
        video.srcObject = stream;

        document.querySelector('.webcam-section').style.display = 'none';
        document.getElementById('captureSection').style.display = 'block';

        video.onloadedmetadata = () => {
            video.play();
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            captureMotion();
        };
    } catch (err) {
        alert(currentLang === 'zh' ? '無法存取攝影機' : 'Cannot access camera');
    }
}

function captureMotion() {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = 80;
    tempCanvas.height = 60;

    function analyze() {
        tempCtx.drawImage(video, 0, 0, 80, 60);
        const imageData = tempCtx.getImageData(0, 0, 80, 60);
        const data = imageData.data;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Detect pose keypoints
        const keypoints = detectKeypoints(data, 80, 60);

        // Scale keypoints to canvas size
        const scaledKeypoints = keypoints.map(kp => ({
            x: kp.x * canvas.width / 80,
            y: kp.y * canvas.height / 60,
            confidence: kp.confidence
        }));

        // Draw skeleton
        drawSkeleton(scaledKeypoints);

        // Record frame if recording
        if (isRecording) {
            recordedFrames.push({
                timestamp: Date.now() - recordStartTime,
                keypoints: keypoints.map((kp, i) => ({
                    name: jointNames[i],
                    x: kp.x / 80,
                    y: kp.y / 60,
                    confidence: kp.confidence
                }))
            });
            updateRecordTimer();
        }

        // Update stats
        frameCount++;
        const now = Date.now();
        if (now - lastFpsTime >= 1000) {
            fps = Math.round(frameCount * 1000 / (now - lastFpsTime));
            document.getElementById('fpsValue').textContent = fps;
            frameCount = 0;
            lastFpsTime = now;
        }
        document.getElementById('frameCount').textContent = recordedFrames.length;

        animationId = requestAnimationFrame(analyze);
    }

    analyze();
}

function detectKeypoints(data, width, height) {
    const keypoints = [];

    // Find skin regions
    const skinRegions = [];
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const r = data[idx], g = data[idx + 1], b = data[idx + 2];
            if (isSkinColor(r, g, b)) {
                skinRegions.push({ x, y });
            }
        }
    }

    if (skinRegions.length < 10) {
        // Return default keypoints if no body detected
        return jointNames.map(() => ({ x: width / 2, y: height / 2, confidence: 0 }));
    }

    // Find bounding box
    let minX = width, maxX = 0, minY = height, maxY = 0;
    skinRegions.forEach(p => {
        minX = Math.min(minX, p.x);
        maxX = Math.max(maxX, p.x);
        minY = Math.min(minY, p.y);
        maxY = Math.max(maxY, p.y);
    });

    const bodyWidth = maxX - minX;
    const bodyHeight = maxY - minY;
    const centerX = (minX + maxX) / 2;

    // Estimate keypoints based on body proportions
    const headY = minY + bodyHeight * 0.05;
    const shoulderY = minY + bodyHeight * 0.15;
    const elbowY = minY + bodyHeight * 0.35;
    const wristY = minY + bodyHeight * 0.50;
    const hipY = minY + bodyHeight * 0.55;
    const kneeY = minY + bodyHeight * 0.75;
    const ankleY = minY + bodyHeight * 0.95;

    const shoulderSpread = bodyWidth * 0.4;
    const hipSpread = bodyWidth * 0.25;
    const armSpread = bodyWidth * 0.5;

    // Generate keypoints
    keypoints.push({ x: centerX, y: headY, confidence: 0.9 }); // nose
    keypoints.push({ x: centerX - 3, y: headY - 2, confidence: 0.8 }); // leftEye
    keypoints.push({ x: centerX + 3, y: headY - 2, confidence: 0.8 }); // rightEye
    keypoints.push({ x: centerX - 6, y: headY, confidence: 0.7 }); // leftEar
    keypoints.push({ x: centerX + 6, y: headY, confidence: 0.7 }); // rightEar
    keypoints.push({ x: centerX - shoulderSpread, y: shoulderY, confidence: 0.9 }); // leftShoulder
    keypoints.push({ x: centerX + shoulderSpread, y: shoulderY, confidence: 0.9 }); // rightShoulder
    keypoints.push({ x: centerX - armSpread, y: elbowY, confidence: 0.8 }); // leftElbow
    keypoints.push({ x: centerX + armSpread, y: elbowY, confidence: 0.8 }); // rightElbow
    keypoints.push({ x: centerX - armSpread, y: wristY, confidence: 0.7 }); // leftWrist
    keypoints.push({ x: centerX + armSpread, y: wristY, confidence: 0.7 }); // rightWrist
    keypoints.push({ x: centerX - hipSpread, y: hipY, confidence: 0.9 }); // leftHip
    keypoints.push({ x: centerX + hipSpread, y: hipY, confidence: 0.9 }); // rightHip
    keypoints.push({ x: centerX - hipSpread, y: kneeY, confidence: 0.8 }); // leftKnee
    keypoints.push({ x: centerX + hipSpread, y: kneeY, confidence: 0.8 }); // rightKnee
    keypoints.push({ x: centerX - hipSpread, y: ankleY, confidence: 0.7 }); // leftAnkle
    keypoints.push({ x: centerX + hipSpread, y: ankleY, confidence: 0.7 }); // rightAnkle

    return keypoints;
}

function isSkinColor(r, g, b) {
    return r > 95 && g > 40 && b > 20 &&
           r > g && r > b &&
           Math.abs(r - g) > 15;
}

function drawSkeleton(keypoints) {
    // Draw bones
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    skeleton.forEach(([i, j]) => {
        const kp1 = keypoints[i];
        const kp2 = keypoints[j];
        if (kp1.confidence > 0.5 && kp2.confidence > 0.5) {
            ctx.beginPath();
            ctx.moveTo(kp1.x, kp1.y);
            ctx.lineTo(kp2.x, kp2.y);
            ctx.stroke();
        }
    });

    // Draw joints
    keypoints.forEach((kp, idx) => {
        if (kp.confidence > 0.5) {
            ctx.beginPath();
            ctx.arc(kp.x, kp.y, 6, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(168, 85, 247, ${kp.confidence})`;
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    });
}

function toggleRecording() {
    const btn = document.getElementById('recordBtn');
    const textEl = btn.querySelector('.record-text');

    if (isRecording) {
        isRecording = false;
        btn.classList.remove('recording');
        textEl.textContent = currentLang === 'zh' ? '開始錄製' : 'Start Recording';
        document.getElementById('dataSection').style.display = 'block';
        updateDataPreview();
    } else {
        isRecording = true;
        recordedFrames = [];
        recordStartTime = Date.now();
        btn.classList.add('recording');
        textEl.textContent = currentLang === 'zh' ? '停止錄製' : 'Stop Recording';
        document.getElementById('dataSection').style.display = 'none';
    }
}

function updateRecordTimer() {
    const elapsed = Date.now() - recordStartTime;
    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    document.getElementById('recordTimer').textContent =
        `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function updateDataPreview() {
    const preview = document.getElementById('dataPreview');
    const sampleFrames = recordedFrames.slice(0, 3);
    preview.textContent = JSON.stringify({
        totalFrames: recordedFrames.length,
        duration: recordedFrames.length > 0 ?
            recordedFrames[recordedFrames.length - 1].timestamp : 0,
        sampleData: sampleFrames
    }, null, 2);
}

function exportData() {
    const data = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        jointNames: jointNames,
        skeleton: skeleton,
        frames: recordedFrames
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `motion-capture-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

init();
