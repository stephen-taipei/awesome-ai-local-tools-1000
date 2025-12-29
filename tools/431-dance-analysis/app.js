/**
 * Dance Analysis - Tool #431
 * Analyze dance movements and rhythm
 */

const video = document.getElementById('webcam');
const canvas = document.getElementById('danceCanvas');
const ctx = canvas.getContext('2d');
const timelineCanvas = document.getElementById('timelineCanvas');
const timelineCtx = timelineCanvas.getContext('2d');
let stream = null;
let animationId = null;
let currentLang = 'zh';
let moveCount = 0;
let motionHistory = [];
let peakTimes = [];

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    document.getElementById('startBtn').addEventListener('click', startAnalysis);
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');

    const texts = {
        zh: { title: '舞蹈分析', subtitle: '分析舞蹈動作與節奏', privacy: '100% 本地處理 · 零資料上傳', start: '開始分析', moves: '動作數', energy: '能量', tempo: 'BPM', timeline: '動作軌跡' },
        en: { title: 'Dance Analysis', subtitle: 'Analyze dance movements and rhythm', privacy: '100% Local Processing · No Data Upload', start: 'Start Analysis', moves: 'Moves', energy: 'Energy', tempo: 'BPM', timeline: 'Motion Timeline' }
    };

    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.getElementById('startBtn').textContent = t.start;
    document.querySelector('.motion-timeline h3').textContent = t.timeline;

    const labels = document.querySelectorAll('.stat-label');
    if (labels.length >= 3) {
        labels[0].textContent = t.moves;
        labels[1].textContent = t.energy;
        labels[2].textContent = t.tempo;
    }
}

async function startAnalysis() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } });
        video.srcObject = stream;

        document.querySelector('.webcam-section').style.display = 'none';
        document.getElementById('danceSection').style.display = 'block';

        video.onloadedmetadata = () => {
            video.play();
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            resizeTimeline();
            analyzeDance();
        };
    } catch (err) {
        alert(currentLang === 'zh' ? '無法存取攝影機' : 'Cannot access camera');
    }
}

function resizeTimeline() {
    const container = timelineCanvas.parentElement;
    timelineCanvas.width = container.clientWidth - 32;
    timelineCanvas.height = 80;
}

function analyzeDance() {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = 64;
    tempCanvas.height = 48;

    let prevFrameData = null;
    let prevMotion = 0;
    let lastPeakTime = 0;

    function analyze() {
        tempCtx.drawImage(video, 0, 0, 64, 48);
        const imageData = tempCtx.getImageData(0, 0, 64, 48);
        const data = imageData.data;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (prevFrameData) {
            const motion = calculateMotion(data, prevFrameData, 64, 48);
            motionHistory.push(motion);
            if (motionHistory.length > 300) motionHistory.shift();

            // Draw motion trails
            drawMotionTrails(data, prevFrameData, 64, 48);

            // Detect movement peaks (dance moves)
            const now = Date.now();
            if (motion.total > 50000 && prevMotion < 40000 && now - lastPeakTime > 300) {
                moveCount++;
                document.getElementById('moveCount').textContent = moveCount;
                peakTimes.push(now);
                if (peakTimes.length > 20) peakTimes.shift();
                lastPeakTime = now;
            }

            // Calculate energy level
            const recentMotion = motionHistory.slice(-30);
            const avgMotion = recentMotion.reduce((s, m) => s + m.total, 0) / recentMotion.length;
            const energyLevel = getEnergyLevel(avgMotion);
            document.getElementById('energy').textContent = energyLevel[currentLang];

            // Calculate tempo from peak intervals
            const tempo = calculateTempo();
            document.getElementById('tempo').textContent = tempo > 0 ? tempo : '--';

            // Draw timeline
            drawTimeline();

            prevMotion = motion.total;
        }

        prevFrameData = new Uint8ClampedArray(data);
        animationId = requestAnimationFrame(analyze);
    }

    analyze();
}

function calculateMotion(current, previous, width, height) {
    let totalMotion = 0;
    let centerX = 0, centerY = 0, count = 0;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const diff = Math.abs(current[idx] - previous[idx]) +
                        Math.abs(current[idx + 1] - previous[idx + 1]) +
                        Math.abs(current[idx + 2] - previous[idx + 2]);

            if (diff > 30) {
                totalMotion += diff;
                centerX += x * diff;
                centerY += y * diff;
                count += diff;
            }
        }
    }

    return {
        total: totalMotion,
        centerX: count > 0 ? centerX / count : width / 2,
        centerY: count > 0 ? centerY / count : height / 2
    };
}

function drawMotionTrails(current, previous, width, height) {
    const scaleX = canvas.width / width;
    const scaleY = canvas.height / height;

    // Create gradient effect for motion
    for (let y = 0; y < height; y += 2) {
        for (let x = 0; x < width; x += 2) {
            const idx = (y * width + x) * 4;
            const diff = Math.abs(current[idx] - previous[idx]) +
                        Math.abs(current[idx + 1] - previous[idx + 1]) +
                        Math.abs(current[idx + 2] - previous[idx + 2]);

            if (diff > 40) {
                const intensity = Math.min(diff / 200, 1);
                const hue = 270 + (1 - intensity) * 60; // Purple to pink
                ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${intensity * 0.6})`;
                ctx.fillRect(x * scaleX, y * scaleY, scaleX * 3, scaleY * 3);
            }
        }
    }
}

function getEnergyLevel(avgMotion) {
    if (avgMotion > 80000) return { zh: '極高', en: 'Extreme' };
    if (avgMotion > 50000) return { zh: '高', en: 'High' };
    if (avgMotion > 25000) return { zh: '中', en: 'Medium' };
    if (avgMotion > 10000) return { zh: '低', en: 'Low' };
    return { zh: '靜止', en: 'Still' };
}

function calculateTempo() {
    if (peakTimes.length < 4) return 0;

    const intervals = [];
    for (let i = 1; i < peakTimes.length; i++) {
        intervals.push(peakTimes[i] - peakTimes[i - 1]);
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const bpm = Math.round(60000 / avgInterval);

    return bpm > 40 && bpm < 200 ? bpm : 0;
}

function drawTimeline() {
    timelineCtx.fillStyle = '#1e293b';
    timelineCtx.fillRect(0, 0, timelineCanvas.width, timelineCanvas.height);

    if (motionHistory.length < 2) return;

    const maxMotion = Math.max(...motionHistory.map(m => m.total), 100000);

    // Draw motion graph
    timelineCtx.beginPath();
    timelineCtx.strokeStyle = '#a855f7';
    timelineCtx.lineWidth = 2;

    const stepX = timelineCanvas.width / (motionHistory.length - 1);

    motionHistory.forEach((m, i) => {
        const x = i * stepX;
        const y = timelineCanvas.height - (m.total / maxMotion) * (timelineCanvas.height - 10);

        if (i === 0) timelineCtx.moveTo(x, y);
        else timelineCtx.lineTo(x, y);
    });

    timelineCtx.stroke();

    // Draw threshold line
    timelineCtx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
    timelineCtx.setLineDash([5, 5]);
    const thresholdY = timelineCanvas.height - (50000 / maxMotion) * (timelineCanvas.height - 10);
    timelineCtx.beginPath();
    timelineCtx.moveTo(0, thresholdY);
    timelineCtx.lineTo(timelineCanvas.width, thresholdY);
    timelineCtx.stroke();
    timelineCtx.setLineDash([]);
}

init();
