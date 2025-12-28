/**
 * Posture Assessment - Tool #429
 * Assess sitting and standing posture
 */

const video = document.getElementById('webcam');
const canvas = document.getElementById('postureCanvas');
const ctx = canvas.getContext('2d');
let stream = null;
let animationId = null;
let currentLang = 'zh';

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    document.getElementById('startBtn').addEventListener('click', startAssessment);
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');

    const texts = {
        zh: { title: '姿勢評估', subtitle: '評估站姿與坐姿', privacy: '100% 本地處理 · 零資料上傳', start: '開始評估', score: '姿勢分數', head: '頭部位置', shoulder: '肩膀對齊', spine: '脊椎曲度', tips: '改善建議', assessing: '評估中...' },
        en: { title: 'Posture Assessment', subtitle: 'Assess sitting and standing posture', privacy: '100% Local Processing · No Data Upload', start: 'Start Assessment', score: 'Posture Score', head: 'Head Position', shoulder: 'Shoulder Align', spine: 'Spine Curve', tips: 'Improvement Tips', assessing: 'Assessing...' }
    };

    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.getElementById('startBtn').textContent = t.start;
    document.querySelector('.score-label').textContent = t.score;
    document.querySelector('.tips-section h3').textContent = t.tips;

    const labels = document.querySelectorAll('.metric-label');
    if (labels.length >= 3) {
        labels[0].textContent = t.head;
        labels[1].textContent = t.shoulder;
        labels[2].textContent = t.spine;
    }
}

async function startAssessment() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } });
        video.srcObject = stream;

        document.querySelector('.webcam-section').style.display = 'none';
        document.getElementById('assessSection').style.display = 'block';

        video.onloadedmetadata = () => {
            video.play();
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            assessPosture();
        };
    } catch (err) {
        alert(currentLang === 'zh' ? '無法存取攝影機' : 'Cannot access camera');
    }
}

function assessPosture() {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = 64;
    tempCanvas.height = 48;

    let frameCount = 0;

    function analyze() {
        frameCount++;

        tempCtx.drawImage(video, 0, 0, 64, 48);
        const imageData = tempCtx.getImageData(0, 0, 64, 48);
        const data = imageData.data;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Analyze posture
        const postureData = analyzePostureData(data, 64, 48);
        drawPostureGuides(postureData);

        // Update display every 10 frames
        if (frameCount % 10 === 0) {
            updatePostureDisplay(postureData);
        }

        animationId = requestAnimationFrame(analyze);
    }

    analyze();
}

function analyzePostureData(data, width, height) {
    // Find body silhouette
    const bodyPixels = [];
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const r = data[idx], g = data[idx + 1], b = data[idx + 2];
            const brightness = (r + g + b) / 3;

            // Detect non-background pixels
            if (brightness > 30 && brightness < 230) {
                bodyPixels.push({ x, y });
            }
        }
    }

    if (bodyPixels.length < 100) {
        return { valid: false };
    }

    // Calculate body center and bounds
    const centerX = bodyPixels.reduce((s, p) => s + p.x, 0) / bodyPixels.length;
    const centerY = bodyPixels.reduce((s, p) => s + p.y, 0) / bodyPixels.length;

    let minY = height, maxY = 0;
    bodyPixels.forEach(p => {
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
    });

    // Analyze head position (top 20%)
    const headRegion = bodyPixels.filter(p => p.y < minY + (maxY - minY) * 0.2);
    const headCenterX = headRegion.length > 0
        ? headRegion.reduce((s, p) => s + p.x, 0) / headRegion.length
        : centerX;

    // Analyze shoulder region (20-35%)
    const shoulderRegion = bodyPixels.filter(p => {
        const relY = (p.y - minY) / (maxY - minY);
        return relY >= 0.2 && relY <= 0.35;
    });

    let shoulderLeft = width, shoulderRight = 0;
    shoulderRegion.forEach(p => {
        if (p.x < shoulderLeft) shoulderLeft = p.x;
        if (p.x > shoulderRight) shoulderRight = p.x;
    });

    const shoulderWidth = shoulderRight - shoulderLeft;
    const shoulderCenterX = (shoulderLeft + shoulderRight) / 2;

    // Analyze spine region (35-70%)
    const spineRegion = bodyPixels.filter(p => {
        const relY = (p.y - minY) / (maxY - minY);
        return relY >= 0.35 && relY <= 0.7;
    });

    const spineCenterX = spineRegion.length > 0
        ? spineRegion.reduce((s, p) => s + p.x, 0) / spineRegion.length
        : centerX;

    // Calculate posture metrics
    const headOffset = Math.abs(headCenterX - width / 2) / (width / 2);
    const shoulderTilt = Math.abs(shoulderCenterX - width / 2) / (width / 2);
    const spineOffset = Math.abs(spineCenterX - shoulderCenterX) / (width / 4);

    const headScore = Math.max(0, 1 - headOffset * 2);
    const shoulderScore = Math.max(0, 1 - shoulderTilt * 2);
    const spineScore = Math.max(0, 1 - spineOffset * 2);

    const overallScore = (headScore * 0.3 + shoulderScore * 0.35 + spineScore * 0.35);

    return {
        valid: true,
        headScore,
        shoulderScore,
        spineScore,
        overallScore,
        headCenterX,
        shoulderCenterX,
        spineCenterX,
        centerY,
        minY,
        maxY,
        width,
        height
    };
}

function drawPostureGuides(postureData) {
    if (!postureData.valid) return;

    const scaleX = canvas.width / postureData.width;
    const scaleY = canvas.height / postureData.height;

    // Draw center guideline
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw posture points
    const points = [
        { x: postureData.headCenterX, y: postureData.minY + (postureData.maxY - postureData.minY) * 0.1, label: 'Head' },
        { x: postureData.shoulderCenterX, y: postureData.minY + (postureData.maxY - postureData.minY) * 0.27, label: 'Shoulder' },
        { x: postureData.spineCenterX, y: postureData.minY + (postureData.maxY - postureData.minY) * 0.5, label: 'Spine' }
    ];

    points.forEach(point => {
        const x = point.x * scaleX;
        const y = point.y * scaleY;

        // Connection to center
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, y);
        ctx.lineTo(x, y);
        ctx.stroke();

        // Point
        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw spine line
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(points[0].x * scaleX, points[0].y * scaleY);
    ctx.lineTo(points[1].x * scaleX, points[1].y * scaleY);
    ctx.lineTo(points[2].x * scaleX, points[2].y * scaleY);
    ctx.stroke();
}

function updatePostureDisplay(postureData) {
    if (!postureData.valid) return;

    const score = Math.round(postureData.overallScore * 100);

    // Update score circle
    document.getElementById('scoreValue').textContent = score;
    const circumference = 283;
    const offset = circumference - (score / 100) * circumference;
    document.getElementById('scoreFill').style.strokeDashoffset = offset;

    // Update status
    const statusEl = document.getElementById('postureStatus');
    let statusText, statusClass;

    if (score >= 80) {
        statusText = currentLang === 'zh' ? '姿勢良好！保持下去' : 'Great posture! Keep it up';
        statusClass = 'good';
    } else if (score >= 60) {
        statusText = currentLang === 'zh' ? '姿勢尚可，可以改進' : 'Fair posture, room for improvement';
        statusClass = 'fair';
    } else {
        statusText = currentLang === 'zh' ? '需要調整姿勢' : 'Posture needs adjustment';
        statusClass = 'poor';
    }

    statusEl.textContent = statusText;
    statusEl.className = `posture-status ${statusClass}`;

    // Update metrics
    updateMetric('headFill', postureData.headScore);
    updateMetric('shoulderFill', postureData.shoulderScore);
    updateMetric('spineFill', postureData.spineScore);

    // Update tips
    updateTips(postureData);
}

function updateMetric(id, score) {
    const el = document.getElementById(id);
    const percent = Math.round(score * 100);
    el.style.width = `${percent}%`;

    el.className = 'metric-fill';
    if (score >= 0.8) el.classList.add('good');
    else if (score >= 0.6) el.classList.add('fair');
    else el.classList.add('poor');
}

function updateTips(postureData) {
    const tips = [];

    if (postureData.headScore < 0.7) {
        tips.push({
            icon: '🗣️',
            text: currentLang === 'zh' ? '將頭部保持在中線位置' : 'Keep your head centered'
        });
    }

    if (postureData.shoulderScore < 0.7) {
        tips.push({
            icon: '💪',
            text: currentLang === 'zh' ? '放鬆肩膀，保持水平' : 'Relax shoulders, keep them level'
        });
    }

    if (postureData.spineScore < 0.7) {
        tips.push({
            icon: '🧘',
            text: currentLang === 'zh' ? '挺直脊椎，收緊核心' : 'Straighten spine, engage core'
        });
    }

    if (tips.length === 0) {
        tips.push({
            icon: '✨',
            text: currentLang === 'zh' ? '姿勢很棒！繼續保持' : 'Excellent posture! Keep it up'
        });
    }

    document.getElementById('tipsList').innerHTML = tips.map(tip => `
        <div class="tip-item">
            <span class="tip-icon">${tip.icon}</span>
            <span>${tip.text}</span>
        </div>
    `).join('');
}

init();
