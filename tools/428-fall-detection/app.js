/**
 * Fall Detection - Tool #428
 * Detect falls and sudden movements
 */

const video = document.getElementById('webcam');
const canvas = document.getElementById('monitorCanvas');
const ctx = canvas.getContext('2d');
let stream = null;
let animationId = null;
let currentLang = 'zh';
let startTime = null;
let alertCount = 0;
let events = [];
let isAlertActive = false;

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    document.getElementById('startBtn').addEventListener('click', startMonitoring);
    document.getElementById('dismissBtn').addEventListener('click', dismissAlert);
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');

    const texts = {
        zh: { title: '跌倒偵測', subtitle: '偵測跌倒與突發動作', privacy: '100% 本地處理 · 零資料上傳', start: '開始監測', normal: '正常', alert: '警報！', time: '監測時間', motion: '動作強度', alerts: '警報次數', events: '事件記錄', dismiss: '取消警報', fall: '偵測到跌倒！' },
        en: { title: 'Fall Detection', subtitle: 'Detect falls and sudden movements', privacy: '100% Local Processing · No Data Upload', start: 'Start Monitoring', normal: 'Normal', alert: 'Alert!', time: 'Monitor Time', motion: 'Motion Level', alerts: 'Alert Count', events: 'Event Log', dismiss: 'Dismiss Alert', fall: 'Fall Detected!' }
    };

    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.getElementById('startBtn').textContent = t.start;
    document.getElementById('dismissBtn').textContent = t.dismiss;
    document.getElementById('alertText').textContent = t.fall;
    document.querySelector('.event-log h3').textContent = t.events;

    const labels = document.querySelectorAll('.stat-label');
    if (labels.length >= 3) {
        labels[0].textContent = t.time;
        labels[1].textContent = t.motion;
        labels[2].textContent = t.alerts;
    }

    updateStatusIndicator(!isAlertActive);
}

async function startMonitoring() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } });
        video.srcObject = stream;
        startTime = Date.now();

        document.querySelector('.webcam-section').style.display = 'none';
        document.getElementById('monitorSection').style.display = 'block';

        video.onloadedmetadata = () => {
            video.play();
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            monitorFalls();
        };
    } catch (err) {
        alert(currentLang === 'zh' ? '無法存取攝影機' : 'Cannot access camera');
    }
}

function monitorFalls() {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = 64;
    tempCanvas.height = 48;

    let prevFrameData = null;
    let motionHistory = [];
    let positionHistory = [];

    function analyze() {
        tempCtx.drawImage(video, 0, 0, 64, 48);
        const imageData = tempCtx.getImageData(0, 0, 64, 48);
        const data = imageData.data;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update time display
        if (startTime) {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
            const secs = (elapsed % 60).toString().padStart(2, '0');
            document.getElementById('monitorTime').textContent = `${mins}:${secs}`;
        }

        if (prevFrameData) {
            const motion = analyzeMotion(data, prevFrameData, 64, 48);
            motionHistory.push(motion);
            if (motionHistory.length > 30) motionHistory.shift();

            positionHistory.push(motion.centerY);
            if (positionHistory.length > 30) positionHistory.shift();

            // Update motion indicator
            const motionLevel = Math.min(motion.total / 100000, 1);
            document.getElementById('motionFill').style.width = `${motionLevel * 100}%`;

            // Draw motion overlay
            drawMotionOverlay(data, prevFrameData, 64, 48);

            // Check for fall
            if (!isAlertActive) {
                const fallDetected = detectFall(motionHistory, positionHistory);
                if (fallDetected) {
                    triggerAlert(fallDetected);
                }
            }
        }

        prevFrameData = new Uint8ClampedArray(data);
        animationId = requestAnimationFrame(analyze);
    }

    analyze();
}

function analyzeMotion(current, previous, width, height) {
    let totalMotion = 0;
    let motionY = 0, motionCount = 0;
    let verticalMotion = 0;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const diff = Math.abs(current[idx] - previous[idx]) +
                        Math.abs(current[idx + 1] - previous[idx + 1]) +
                        Math.abs(current[idx + 2] - previous[idx + 2]);

            if (diff > 30) {
                totalMotion += diff;
                motionY += y * diff;
                motionCount += diff;
            }
        }
    }

    const centerY = motionCount > 0 ? motionY / motionCount : height / 2;

    return { total: totalMotion, centerY };
}

function detectFall(motionHistory, positionHistory) {
    if (motionHistory.length < 15 || positionHistory.length < 15) return null;

    // Check for sudden downward movement
    const recentPositions = positionHistory.slice(-15);
    const oldPositions = positionHistory.slice(-30, -15);

    const recentAvg = recentPositions.reduce((a, b) => a + b, 0) / recentPositions.length;
    const oldAvg = oldPositions.length > 0 ? oldPositions.reduce((a, b) => a + b, 0) / oldPositions.length : recentAvg;

    const positionDrop = recentAvg - oldAvg;

    // Check for sudden large motion
    const recentMotion = motionHistory.slice(-5);
    const avgMotion = recentMotion.reduce((s, m) => s + m.total, 0) / recentMotion.length;

    // Detect sudden motion followed by stillness
    const motionSpike = avgMotion > 80000;
    const significantDrop = positionDrop > 8;

    if (motionSpike && significantDrop) {
        return { type: 'fall', confidence: 0.85 };
    }

    // Detect sudden large motion (possible stumble)
    if (avgMotion > 120000) {
        return { type: 'sudden', confidence: 0.7 };
    }

    return null;
}

function drawMotionOverlay(current, previous, width, height) {
    const scaleX = canvas.width / width;
    const scaleY = canvas.height / height;

    ctx.fillStyle = 'rgba(168, 85, 247, 0.3)';

    for (let y = 0; y < height; y += 2) {
        for (let x = 0; x < width; x += 2) {
            const idx = (y * width + x) * 4;
            const diff = Math.abs(current[idx] - previous[idx]) +
                        Math.abs(current[idx + 1] - previous[idx + 1]) +
                        Math.abs(current[idx + 2] - previous[idx + 2]);

            if (diff > 50) {
                ctx.fillRect(x * scaleX, y * scaleY, scaleX * 2, scaleY * 2);
            }
        }
    }
}

function triggerAlert(detection) {
    isAlertActive = true;
    alertCount++;
    document.getElementById('alertCount').textContent = alertCount;

    updateStatusIndicator(false);
    document.getElementById('alertPanel').style.display = 'block';

    // Add event
    addEvent(detection.type === 'fall' ? 'danger' : 'warning',
             detection.type === 'fall'
                 ? (currentLang === 'zh' ? '偵測到跌倒' : 'Fall detected')
                 : (currentLang === 'zh' ? '偵測到突發動作' : 'Sudden movement detected'));
}

function dismissAlert() {
    isAlertActive = false;
    updateStatusIndicator(true);
    document.getElementById('alertPanel').style.display = 'none';
    addEvent('normal', currentLang === 'zh' ? '警報已取消' : 'Alert dismissed');
}

function updateStatusIndicator(normal) {
    const indicator = document.getElementById('statusIndicator');
    const texts = {
        zh: { normal: '正常', alert: '警報！' },
        en: { normal: 'Normal', alert: 'Alert!' }
    };

    if (normal) {
        indicator.className = 'status-indicator';
        indicator.innerHTML = `<span class="status-icon">✓</span><span class="status-text">${texts[currentLang].normal}</span>`;
    } else {
        indicator.className = 'status-indicator alert';
        indicator.innerHTML = `<span class="status-icon">⚠</span><span class="status-text">${texts[currentLang].alert}</span>`;
    }
}

function addEvent(type, text) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString(currentLang === 'zh' ? 'zh-TW' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    events.unshift({ type, text, time: timeStr });
    if (events.length > 20) events.pop();

    const listEl = document.getElementById('eventList');
    listEl.innerHTML = events.map(e => `
        <div class="event-item ${e.type}">
            <span class="event-time">${e.time}</span>
            <span>${e.text}</span>
        </div>
    `).join('');
}

init();
