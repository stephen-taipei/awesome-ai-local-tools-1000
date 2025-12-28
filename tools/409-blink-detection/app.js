/**
 * Blink Detection - Tool #409
 * Real-time eye blink detection and monitoring
 */

const video = document.getElementById('webcam');
let webcamStream = null;
let detectionInterval = null;
let currentLang = 'zh';

let blinkData = {
    count: 0,
    timestamps: [],
    durations: [],
    startTime: null,
    lastBlinkStart: null,
    eyesClosed: false
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
            title: '眨眼偵測',
            subtitle: '即時監測眨眼頻率',
            privacy: '100% 本地處理 · 零資料上傳',
            start: '開始偵測',
            stop: '停止偵測',
            blinkCount: '眨眼次數',
            avgInterval: '平均間隔',
            blinkRate: '每分鐘次數',
            blinkDuration: '平均時長',
            timeline: '眨眼時間軸'
        },
        en: {
            title: 'Blink Detection',
            subtitle: 'Monitor blink frequency in real-time',
            privacy: '100% Local Processing · No Data Upload',
            start: 'Start Detection',
            stop: 'Stop Detection',
            blinkCount: 'Blink Count',
            avgInterval: 'Avg Interval',
            blinkRate: 'Blinks/Minute',
            blinkDuration: 'Avg Duration',
            timeline: 'Blink Timeline'
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

    document.querySelector('.counter-label').textContent = t.blinkCount;
    document.querySelectorAll('.stat-label')[0].textContent = t.avgInterval;
    document.querySelectorAll('.stat-label')[1].textContent = t.blinkRate;
    document.querySelectorAll('.stat-label')[2].textContent = t.blinkDuration;
    document.querySelector('.blink-timeline h4').textContent = t.timeline;
}

async function toggleDetection() {
    const btn = document.getElementById('startBtn');
    const videoContainer = document.querySelector('.video-container');

    if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
        webcamStream = null;
        clearInterval(detectionInterval);
        videoContainer.style.display = 'none';
        btn.textContent = currentLang === 'zh' ? '開始偵測' : 'Start Detection';
        return;
    }

    try {
        webcamStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: 640, height: 480 }
        });
        video.srcObject = webcamStream;
        videoContainer.style.display = 'block';
        document.getElementById('statsSection').style.display = 'block';
        btn.textContent = currentLang === 'zh' ? '停止偵測' : 'Stop Detection';

        // Reset data
        blinkData = {
            count: 0,
            timestamps: [],
            durations: [],
            startTime: Date.now(),
            lastBlinkStart: null,
            eyesClosed: false
        };

        updateStats();

        video.onloadedmetadata = () => {
            startDetection();
        };
    } catch (err) {
        alert(currentLang === 'zh' ? '無法存取攝影機' : 'Cannot access webcam');
    }
}

function startDetection() {
    detectionInterval = setInterval(() => {
        analyzeFrame();
    }, 50); // 20 FPS for smooth detection
}

function analyzeFrame() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Analyze eye regions
    const leftEyeRegion = {
        x: canvas.width * 0.2,
        y: canvas.height * 0.25,
        width: canvas.width * 0.25,
        height: canvas.height * 0.15
    };

    const rightEyeRegion = {
        x: canvas.width * 0.55,
        y: canvas.height * 0.25,
        width: canvas.width * 0.25,
        height: canvas.height * 0.15
    };

    const leftEyeOpen = analyzeEyeOpenness(imageData, leftEyeRegion, canvas.width);
    const rightEyeOpen = analyzeEyeOpenness(imageData, rightEyeRegion, canvas.width);

    const eyesClosed = leftEyeOpen < 0.4 && rightEyeOpen < 0.4;

    // Update eye indicators
    updateEyeIndicators(leftEyeOpen, rightEyeOpen);

    // Detect blink transition
    if (eyesClosed && !blinkData.eyesClosed) {
        // Eyes just closed - blink started
        blinkData.lastBlinkStart = Date.now();
    } else if (!eyesClosed && blinkData.eyesClosed && blinkData.lastBlinkStart) {
        // Eyes just opened - blink ended
        const duration = Date.now() - blinkData.lastBlinkStart;

        // Only count as blink if duration is reasonable (50-500ms)
        if (duration >= 50 && duration <= 500) {
            blinkData.count++;
            blinkData.timestamps.push(Date.now());
            blinkData.durations.push(duration);
            updateStats();
            addTimelineMark();
        }

        blinkData.lastBlinkStart = null;
    }

    blinkData.eyesClosed = eyesClosed;
}

function analyzeEyeOpenness(imageData, region, canvasWidth) {
    const data = imageData.data;
    let darkPixels = 0;
    let totalPixels = 0;

    // Look for dark (pupil) pixels in the region
    for (let y = Math.floor(region.y); y < Math.floor(region.y + region.height); y++) {
        for (let x = Math.floor(region.x); x < Math.floor(region.x + region.width); x++) {
            const idx = (y * canvasWidth + x) * 4;
            const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;

            totalPixels++;
            if (brightness < 60) {
                darkPixels++;
            }
        }
    }

    // Higher ratio of dark pixels = eyes more open (visible pupil)
    return darkPixels / totalPixels;
}

function updateEyeIndicators(leftOpen, rightOpen) {
    const leftIndicator = document.getElementById('leftEyeIndicator');
    const rightIndicator = document.getElementById('rightEyeIndicator');

    const leftIcon = leftIndicator.querySelector('.eye-icon');
    const rightIcon = rightIndicator.querySelector('.eye-icon');
    const leftStatus = leftIndicator.querySelector('.eye-status');
    const rightStatus = rightIndicator.querySelector('.eye-status');

    const openText = currentLang === 'zh' ? '張開' : 'Open';
    const closedText = currentLang === 'zh' ? '閉合' : 'Closed';

    if (leftOpen >= 0.4) {
        leftIcon.classList.remove('closed');
        leftStatus.textContent = openText;
    } else {
        leftIcon.classList.add('closed');
        leftStatus.textContent = closedText;
    }

    if (rightOpen >= 0.4) {
        rightIcon.classList.remove('closed');
        rightStatus.textContent = openText;
    } else {
        rightIcon.classList.add('closed');
        rightStatus.textContent = closedText;
    }
}

function updateStats() {
    document.getElementById('blinkCount').textContent = blinkData.count;

    // Calculate average interval
    if (blinkData.timestamps.length >= 2) {
        let totalInterval = 0;
        for (let i = 1; i < blinkData.timestamps.length; i++) {
            totalInterval += blinkData.timestamps[i] - blinkData.timestamps[i - 1];
        }
        const avgInterval = totalInterval / (blinkData.timestamps.length - 1) / 1000;
        document.getElementById('avgInterval').textContent = `${avgInterval.toFixed(1)}s`;
    } else {
        document.getElementById('avgInterval').textContent = '--';
    }

    // Calculate blink rate (per minute)
    const elapsedMinutes = (Date.now() - blinkData.startTime) / 60000;
    if (elapsedMinutes > 0.1) {
        const rate = blinkData.count / elapsedMinutes;
        document.getElementById('blinkRate').textContent = `${Math.round(rate)}`;
    } else {
        document.getElementById('blinkRate').textContent = '--';
    }

    // Calculate average duration
    if (blinkData.durations.length > 0) {
        const avgDuration = blinkData.durations.reduce((a, b) => a + b, 0) / blinkData.durations.length;
        document.getElementById('blinkDuration').textContent = `${Math.round(avgDuration)}ms`;
    } else {
        document.getElementById('blinkDuration').textContent = '--';
    }
}

function addTimelineMark() {
    const timeline = document.getElementById('timelineBar');
    const elapsed = Date.now() - blinkData.startTime;
    const maxTime = 60000; // 1 minute timeline

    const position = Math.min((elapsed / maxTime) * 100, 100);

    const mark = document.createElement('div');
    mark.className = 'blink-mark';
    mark.style.left = `${position}%`;
    timeline.appendChild(mark);

    // Keep only last minute of marks
    const marks = timeline.querySelectorAll('.blink-mark');
    if (marks.length > 30) {
        marks[0].remove();
    }
}

init();
