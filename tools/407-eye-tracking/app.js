/**
 * Eye Tracking - Tool #407
 * Local eye movement tracking using webcam
 */

const video = document.getElementById('webcam');
const overlayCanvas = document.getElementById('overlayCanvas');
const overlayCtx = overlayCanvas.getContext('2d');
let webcamStream = null;
let trackingInterval = null;
let blinkCount = 0;
let lastEyeState = { left: 'open', right: 'open' };
let currentLang = 'zh';

const directions = {
    'top-left': { zh: '左上', en: 'Top Left' },
    'top': { zh: '上方', en: 'Top' },
    'top-right': { zh: '右上', en: 'Top Right' },
    'left': { zh: '左側', en: 'Left' },
    'center': { zh: '中央', en: 'Center' },
    'right': { zh: '右側', en: 'Right' },
    'bottom-left': { zh: '左下', en: 'Bottom Left' },
    'bottom': { zh: '下方', en: 'Bottom' },
    'bottom-right': { zh: '右下', en: 'Bottom Right' }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    document.getElementById('startBtn').addEventListener('click', toggleTracking);
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');

    const texts = {
        zh: {
            title: '眼球追蹤',
            subtitle: '即時追蹤眼球移動方向',
            privacy: '100% 本地處理 · 零資料上傳',
            start: '開始追蹤',
            stop: '停止追蹤',
            leftEye: '左眼狀態',
            rightEye: '右眼狀態',
            blinks: '眨眼次數'
        },
        en: {
            title: 'Eye Tracking',
            subtitle: 'Track eye movement in real-time',
            privacy: '100% Local Processing · No Data Upload',
            start: 'Start Tracking',
            stop: 'Stop Tracking',
            leftEye: 'Left Eye',
            rightEye: 'Right Eye',
            blinks: 'Blink Count'
        }
    };

    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;

    const btn = document.getElementById('startBtn');
    if (!webcamStream) {
        btn.textContent = t.start;
    } else {
        btn.textContent = t.stop;
    }

    document.querySelectorAll('.stat-label')[0].textContent = t.leftEye;
    document.querySelectorAll('.stat-label')[1].textContent = t.rightEye;
    document.querySelectorAll('.stat-label')[2].textContent = t.blinks;
}

async function toggleTracking() {
    const btn = document.getElementById('startBtn');
    const videoContainer = document.querySelector('.video-container');

    if (webcamStream) {
        // Stop tracking
        webcamStream.getTracks().forEach(track => track.stop());
        webcamStream = null;
        clearInterval(trackingInterval);
        videoContainer.style.display = 'none';
        document.getElementById('resultSection').style.display = 'none';
        btn.textContent = currentLang === 'zh' ? '開始追蹤' : 'Start Tracking';
        return;
    }

    try {
        webcamStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: 640, height: 480 }
        });
        video.srcObject = webcamStream;
        videoContainer.style.display = 'block';
        document.getElementById('resultSection').style.display = 'block';
        btn.textContent = currentLang === 'zh' ? '停止追蹤' : 'Stop Tracking';
        blinkCount = 0;

        video.onloadedmetadata = () => {
            overlayCanvas.width = video.videoWidth;
            overlayCanvas.height = video.videoHeight;
            startTracking();
        };
    } catch (err) {
        alert(currentLang === 'zh' ? '無法存取攝影機' : 'Cannot access webcam');
    }
}

function startTracking() {
    trackingInterval = setInterval(() => {
        analyzeFrame();
    }, 100);
}

function analyzeFrame() {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;
    tempCtx.drawImage(video, 0, 0);

    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);

    // Simulate eye detection regions (typically eyes are in upper-middle of face)
    const faceRegion = {
        x: tempCanvas.width * 0.25,
        y: tempCanvas.height * 0.2,
        width: tempCanvas.width * 0.5,
        height: tempCanvas.height * 0.4
    };

    const leftEyeRegion = {
        x: faceRegion.x + faceRegion.width * 0.1,
        y: faceRegion.y + faceRegion.height * 0.2,
        width: faceRegion.width * 0.35,
        height: faceRegion.height * 0.3
    };

    const rightEyeRegion = {
        x: faceRegion.x + faceRegion.width * 0.55,
        y: faceRegion.y + faceRegion.height * 0.2,
        width: faceRegion.width * 0.35,
        height: faceRegion.height * 0.3
    };

    const leftEye = analyzeEyeRegion(imageData, leftEyeRegion, tempCanvas.width);
    const rightEye = analyzeEyeRegion(imageData, rightEyeRegion, tempCanvas.width);

    // Detect blinks
    if ((leftEye.openness < 0.3 || rightEye.openness < 0.3) &&
        (lastEyeState.left === 'open' && lastEyeState.right === 'open')) {
        blinkCount++;
        document.getElementById('blinkCount').textContent = blinkCount;
    }

    lastEyeState.left = leftEye.openness < 0.3 ? 'closed' : 'open';
    lastEyeState.right = rightEye.openness < 0.3 ? 'closed' : 'open';

    // Calculate gaze direction
    const gazeX = (leftEye.gazeX + rightEye.gazeX) / 2;
    const gazeY = (leftEye.gazeY + rightEye.gazeY) / 2;
    const direction = getGazeDirection(gazeX, gazeY);

    // Update UI
    updateGazeDisplay(direction);
    updateEyeStatus(leftEye, rightEye);
    drawOverlay(leftEyeRegion, rightEyeRegion, direction);
}

function analyzeEyeRegion(imageData, region, width) {
    let darkPixels = 0;
    let totalPixels = 0;
    let centerX = 0, centerY = 0;
    let darkCount = 0;

    for (let y = Math.floor(region.y); y < Math.floor(region.y + region.height); y++) {
        for (let x = Math.floor(region.x); x < Math.floor(region.x + region.width); x++) {
            const idx = (y * width + x) * 4;
            const brightness = (imageData.data[idx] + imageData.data[idx + 1] + imageData.data[idx + 2]) / 3;

            totalPixels++;
            if (brightness < 80) {
                darkPixels++;
                centerX += x;
                centerY += y;
                darkCount++;
            }
        }
    }

    const openness = 1 - (darkPixels / totalPixels);

    // Calculate pupil position relative to eye region center
    let gazeX = 0, gazeY = 0;
    if (darkCount > 0) {
        const pupilX = centerX / darkCount;
        const pupilY = centerY / darkCount;
        const regionCenterX = region.x + region.width / 2;
        const regionCenterY = region.y + region.height / 2;

        gazeX = (pupilX - regionCenterX) / (region.width / 2);
        gazeY = (pupilY - regionCenterY) / (region.height / 2);
    }

    return { openness, gazeX, gazeY };
}

function getGazeDirection(x, y) {
    const threshold = 0.3;

    let horizontal = 'center';
    let vertical = 'center';

    if (x < -threshold) horizontal = 'left';
    else if (x > threshold) horizontal = 'right';

    if (y < -threshold) vertical = 'top';
    else if (y > threshold) vertical = 'bottom';

    if (vertical === 'center' && horizontal === 'center') return 'center';
    if (vertical === 'center') return horizontal;
    if (horizontal === 'center') return vertical;
    return `${vertical}-${horizontal}`;
}

function updateGazeDisplay(direction) {
    document.querySelectorAll('.gaze-cell').forEach(cell => {
        cell.classList.remove('active');
        if (cell.dataset.dir === direction) {
            cell.classList.add('active');
        }
    });

    const label = currentLang === 'zh'
        ? `注視${directions[direction].zh}`
        : `Looking ${directions[direction].en}`;
    document.getElementById('gazeLabel').textContent = label;
}

function updateEyeStatus(leftEye, rightEye) {
    const openText = currentLang === 'zh' ? '張開' : 'Open';
    const closedText = currentLang === 'zh' ? '閉合' : 'Closed';

    document.getElementById('leftEyeStatus').textContent =
        leftEye.openness > 0.3 ? openText : closedText;
    document.getElementById('rightEyeStatus').textContent =
        rightEye.openness > 0.3 ? openText : closedText;
}

function drawOverlay(leftRegion, rightRegion, direction) {
    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    // Draw eye region boxes
    overlayCtx.strokeStyle = '#10b981';
    overlayCtx.lineWidth = 2;

    overlayCtx.strokeRect(leftRegion.x, leftRegion.y, leftRegion.width, leftRegion.height);
    overlayCtx.strokeRect(rightRegion.x, rightRegion.y, rightRegion.width, rightRegion.height);

    // Draw direction indicator
    const centerX = overlayCanvas.width / 2;
    const centerY = overlayCanvas.height * 0.8;

    overlayCtx.fillStyle = '#10b981';
    overlayCtx.font = '24px Arial';
    overlayCtx.textAlign = 'center';
    overlayCtx.fillText(directions[direction][currentLang], centerX, centerY);
}

init();
