/**
 * Pupil Detection - Tool #408
 * Local pupil detection and measurement
 */

const canvas = document.getElementById('previewCanvas');
const ctx = canvas.getContext('2d');
let webcamStream = null;
let currentLang = 'zh';

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));

    document.getElementById('uploadArea').addEventListener('click', () => document.getElementById('imageInput').click());
    document.getElementById('imageInput').addEventListener('change', (e) => loadImage(e.target.files[0]));

    document.getElementById('webcamBtn').addEventListener('click', toggleWebcam);
    document.getElementById('captureBtn').addEventListener('click', captureWebcam);
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');

    const texts = {
        zh: {
            title: '瞳孔偵測',
            subtitle: '偵測並測量瞳孔大小',
            privacy: '100% 本地處理 · 零資料上傳',
            upload: '上傳眼睛照片',
            analysis: '瞳孔分析',
            leftEye: '左眼',
            rightEye: '右眼',
            webcam: '使用攝影機',
            capture: '拍攝'
        },
        en: {
            title: 'Pupil Detection',
            subtitle: 'Detect and measure pupil size',
            privacy: '100% Local Processing · No Data Upload',
            upload: 'Upload eye photo',
            analysis: 'Pupil Analysis',
            leftEye: 'Left Eye',
            rightEye: 'Right Eye',
            webcam: 'Use Webcam',
            capture: 'Capture'
        }
    };

    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.querySelector('.upload-text').textContent = t.upload;
    document.querySelector('.result-section h3').textContent = t.analysis;
    document.querySelectorAll('.pupil-label')[0].textContent = t.leftEye;
    document.querySelectorAll('.pupil-label')[1].textContent = t.rightEye;
    document.getElementById('webcamBtn').textContent = t.webcam;
    document.getElementById('captureBtn').textContent = t.capture;
}

function loadImage(file) {
    if (!file) return;

    const img = new Image();
    img.onload = () => {
        canvas.width = Math.min(img.width, 600);
        canvas.height = (img.height / img.width) * canvas.width;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        document.getElementById('uploadArea').style.display = 'none';
        document.getElementById('previewSection').style.display = 'block';

        detectPupils(canvas);
    };
    img.src = URL.createObjectURL(file);
}

async function toggleWebcam() {
    const video = document.getElementById('webcam');
    const btn = document.getElementById('webcamBtn');
    const captureBtn = document.getElementById('captureBtn');

    if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
        webcamStream = null;
        video.style.display = 'none';
        captureBtn.style.display = 'none';
        btn.textContent = currentLang === 'zh' ? '使用攝影機' : 'Use Webcam';
        return;
    }

    try {
        webcamStream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = webcamStream;
        video.style.display = 'block';
        captureBtn.style.display = 'inline-block';
        btn.textContent = currentLang === 'zh' ? '關閉攝影機' : 'Close Webcam';
    } catch (err) {
        alert(currentLang === 'zh' ? '無法存取攝影機' : 'Cannot access webcam');
    }
}

function captureWebcam() {
    const video = document.getElementById('webcam');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('previewSection').style.display = 'block';

    detectPupils(canvas);
}

function detectPupils(sourceCanvas) {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = sourceCanvas.width;
    tempCanvas.height = sourceCanvas.height;
    tempCtx.drawImage(sourceCanvas, 0, 0);

    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);

    // Define approximate eye regions
    const leftEyeRegion = {
        x: tempCanvas.width * 0.15,
        y: tempCanvas.height * 0.25,
        width: tempCanvas.width * 0.3,
        height: tempCanvas.height * 0.25
    };

    const rightEyeRegion = {
        x: tempCanvas.width * 0.55,
        y: tempCanvas.height * 0.25,
        width: tempCanvas.width * 0.3,
        height: tempCanvas.height * 0.25
    };

    const leftPupil = analyzePupil(imageData, leftEyeRegion, tempCanvas.width);
    const rightPupil = analyzePupil(imageData, rightEyeRegion, tempCanvas.width);

    // Draw detection overlay
    drawPupilOverlay(sourceCanvas, leftEyeRegion, rightEyeRegion, leftPupil, rightPupil);

    displayResults(leftPupil, rightPupil);
}

function analyzePupil(imageData, region, canvasWidth) {
    const data = imageData.data;
    let darkestPixels = [];
    let totalDark = 0;
    let centerX = 0, centerY = 0;

    for (let y = Math.floor(region.y); y < Math.floor(region.y + region.height); y++) {
        for (let x = Math.floor(region.x); x < Math.floor(region.x + region.width); x++) {
            const idx = (y * canvasWidth + x) * 4;
            const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;

            if (brightness < 50) {
                darkestPixels.push({ x, y, brightness });
                centerX += x;
                centerY += y;
                totalDark++;
            }
        }
    }

    // Calculate pupil properties
    let diameter = 0;
    let roundness = 0;

    if (totalDark > 0) {
        centerX /= totalDark;
        centerY /= totalDark;

        // Estimate diameter from dark pixel count
        diameter = Math.sqrt(totalDark / Math.PI) * 2;

        // Calculate roundness
        let maxDist = 0, minDist = Infinity;
        darkestPixels.forEach(p => {
            const dist = Math.sqrt((p.x - centerX) ** 2 + (p.y - centerY) ** 2);
            if (dist > maxDist) maxDist = dist;
            if (dist < minDist) minDist = dist;
        });

        roundness = minDist / (maxDist + 0.01);
    }

    // Relative size (as percentage of region)
    const relativeSize = totalDark / (region.width * region.height) * 100;

    return {
        centerX,
        centerY,
        diameter,
        relativeSize,
        roundness,
        pixelCount: totalDark
    };
}

function drawPupilOverlay(sourceCanvas, leftRegion, rightRegion, leftPupil, rightPupil) {
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2;

    // Draw eye regions
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(leftRegion.x, leftRegion.y, leftRegion.width, leftRegion.height);
    ctx.strokeRect(rightRegion.x, rightRegion.y, rightRegion.width, rightRegion.height);
    ctx.setLineDash([]);

    // Draw pupil circles
    if (leftPupil.pixelCount > 0) {
        ctx.beginPath();
        ctx.arc(leftPupil.centerX, leftPupil.centerY, leftPupil.diameter / 2, 0, Math.PI * 2);
        ctx.strokeStyle = '#22c55e';
        ctx.stroke();

        // Draw center point
        ctx.beginPath();
        ctx.arc(leftPupil.centerX, leftPupil.centerY, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#22c55e';
        ctx.fill();
    }

    if (rightPupil.pixelCount > 0) {
        ctx.beginPath();
        ctx.arc(rightPupil.centerX, rightPupil.centerY, rightPupil.diameter / 2, 0, Math.PI * 2);
        ctx.strokeStyle = '#22c55e';
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(rightPupil.centerX, rightPupil.centerY, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#22c55e';
        ctx.fill();
    }
}

function displayResults(leftPupil, rightPupil) {
    document.getElementById('resultSection').style.display = 'block';

    // Update visual representations
    const leftCircle = document.getElementById('leftPupilCircle');
    const rightCircle = document.getElementById('rightPupilCircle');

    const leftSize = Math.max(20, Math.min(60, leftPupil.diameter));
    const rightSize = Math.max(20, Math.min(60, rightPupil.diameter));

    leftCircle.style.width = `${leftSize}px`;
    leftCircle.style.height = `${leftSize}px`;
    rightCircle.style.width = `${rightSize}px`;
    rightCircle.style.height = `${rightSize}px`;

    // Update size labels
    document.getElementById('leftPupilSize').textContent =
        `${Math.round(leftPupil.diameter)}px (${leftPupil.relativeSize.toFixed(1)}%)`;
    document.getElementById('rightPupilSize').textContent =
        `${Math.round(rightPupil.diameter)}px (${rightPupil.relativeSize.toFixed(1)}%)`;

    // Display metrics
    const metrics = currentLang === 'zh' ? {
        symmetry: '對稱性',
        leftRound: '左眼圓度',
        rightRound: '右眼圓度',
        sizeDiff: '大小差異'
    } : {
        symmetry: 'Symmetry',
        leftRound: 'Left Roundness',
        rightRound: 'Right Roundness',
        sizeDiff: 'Size Difference'
    };

    const sizeDiff = Math.abs(leftPupil.diameter - rightPupil.diameter);
    const symmetry = 100 - (sizeDiff / Math.max(leftPupil.diameter, rightPupil.diameter, 1) * 100);

    document.getElementById('metricsGrid').innerHTML = `
        <div class="metric-item">
            <div class="metric-label">${metrics.symmetry}</div>
            <div class="metric-value">${Math.round(symmetry)}%</div>
        </div>
        <div class="metric-item">
            <div class="metric-label">${metrics.leftRound}</div>
            <div class="metric-value">${Math.round(leftPupil.roundness * 100)}%</div>
        </div>
        <div class="metric-item">
            <div class="metric-label">${metrics.rightRound}</div>
            <div class="metric-value">${Math.round(rightPupil.roundness * 100)}%</div>
        </div>
        <div class="metric-item">
            <div class="metric-label">${metrics.sizeDiff}</div>
            <div class="metric-value">${sizeDiff.toFixed(1)}px</div>
        </div>
    `;
}

init();
