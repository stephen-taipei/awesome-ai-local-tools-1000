/**
 * Face Driven Animation - Tool #420
 * Drive avatar with face movements
 */

const video = document.getElementById('webcam');
const avatarCanvas = document.getElementById('avatarCanvas');
const avatarCtx = avatarCanvas.getContext('2d');
let stream = null;
let animationId = null;
let currentAvatar = 'emoji';
let currentLang = 'zh';
let prevFrameData = null;

const expressions = {
    blink: 0,
    smile: 0,
    headTurn: 0.5
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    document.getElementById('startBtn').addEventListener('click', startAnimation);

    document.querySelectorAll('.avatar-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.avatar-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentAvatar = btn.dataset.avatar;
        });
    });

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');

    const texts = {
        zh: { title: '表情驅動動畫', subtitle: '用臉部動作控制虛擬角色', privacy: '100% 本地處理 · 零資料上傳', start: '開始動畫', camera: '攝影機', avatar: '虛擬角色', blink: '眨眼', smile: '微笑', head: '頭部轉動' },
        en: { title: 'Face Driven Animation', subtitle: 'Drive avatar with face movements', privacy: '100% Local Processing · No Data Upload', start: 'Start Animation', camera: 'Camera', avatar: 'Avatar', blink: 'Blink', smile: 'Smile', head: 'Head Turn' }
    };

    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.getElementById('startBtn').textContent = t.start;

    const viewHeaders = document.querySelectorAll('.view-box h3');
    if (viewHeaders.length >= 2) {
        viewHeaders[0].textContent = t.camera;
        viewHeaders[1].textContent = t.avatar;
    }

    const labels = document.querySelectorAll('.expression-label');
    if (labels.length >= 3) {
        labels[0].textContent = t.blink;
        labels[1].textContent = t.smile;
        labels[2].textContent = t.head;
    }
}

function resizeCanvas() {
    const container = avatarCanvas.parentElement;
    avatarCanvas.width = container.clientWidth - 32;
    avatarCanvas.height = 240;
}

async function startAnimation() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 320, height: 240 } });
        video.srcObject = stream;

        document.querySelector('.webcam-section').style.display = 'none';
        document.getElementById('animationSection').style.display = 'block';
        resizeCanvas();

        video.onloadedmetadata = () => {
            video.play();
            detectExpressions();
        };
    } catch (err) {
        alert(currentLang === 'zh' ? '無法存取攝影機' : 'Cannot access camera');
    }
}

function detectExpressions() {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = 80;
    tempCanvas.height = 60;

    function analyze() {
        tempCtx.drawImage(video, 0, 0, 80, 60);
        const imageData = tempCtx.getImageData(0, 0, 80, 60);
        const data = imageData.data;

        // Analyze eye region for blink
        const eyeRegion = getRegionBrightness(data, 80, 15, 20, 50, 20);
        expressions.blink = 1 - Math.min(eyeRegion / 150, 1);

        // Analyze mouth region for smile
        const mouthRegion = getRegionBrightness(data, 80, 40, 50, 30, 10);
        const mouthWidth = getMouthWidth(data, 80, 45);
        expressions.smile = Math.min(mouthWidth / 40, 1);

        // Analyze left/right brightness for head turn
        const leftBrightness = getRegionBrightness(data, 80, 0, 10, 30, 40);
        const rightBrightness = getRegionBrightness(data, 80, 50, 10, 30, 40);
        const diff = (leftBrightness - rightBrightness) / 100;
        expressions.headTurn = 0.5 + Math.max(-0.5, Math.min(0.5, diff));

        // Update expression bars
        document.getElementById('blinkFill').style.width = `${expressions.blink * 100}%`;
        document.getElementById('smileFill').style.width = `${expressions.smile * 100}%`;
        document.getElementById('headFill').style.width = `${expressions.headTurn * 100}%`;

        // Render avatar
        renderAvatar();

        prevFrameData = new Uint8ClampedArray(data);
        animationId = requestAnimationFrame(analyze);
    }

    analyze();
}

function getRegionBrightness(data, width, x, y, w, h) {
    let sum = 0;
    let count = 0;
    for (let py = y; py < y + h && py < 60; py++) {
        for (let px = x; px < x + w && px < width; px++) {
            const idx = (py * width + px) * 4;
            sum += (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
            count++;
        }
    }
    return count > 0 ? sum / count : 0;
}

function getMouthWidth(data, width, y) {
    let leftEdge = 40;
    let rightEdge = 40;
    const threshold = 80;

    // Find dark pixels (lips) from center outward
    for (let x = 40; x >= 20; x--) {
        const idx = (y * width + x) * 4;
        const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
        if (brightness < threshold) {
            leftEdge = x;
            break;
        }
    }
    for (let x = 40; x <= 60; x++) {
        const idx = (y * width + x) * 4;
        const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
        if (brightness < threshold) {
            rightEdge = x;
            break;
        }
    }
    return rightEdge - leftEdge;
}

function renderAvatar() {
    avatarCtx.fillStyle = '#0f172a';
    avatarCtx.fillRect(0, 0, avatarCanvas.width, avatarCanvas.height);

    const centerX = avatarCanvas.width / 2;
    const centerY = avatarCanvas.height / 2;
    const size = 100;

    // Apply head turn offset
    const headOffset = (expressions.headTurn - 0.5) * 60;

    switch (currentAvatar) {
        case 'emoji':
            drawEmojiAvatar(centerX + headOffset, centerY, size);
            break;
        case 'cat':
            drawCatAvatar(centerX + headOffset, centerY, size);
            break;
        case 'robot':
            drawRobotAvatar(centerX + headOffset, centerY, size);
            break;
        case 'alien':
            drawAlienAvatar(centerX + headOffset, centerY, size);
            break;
    }
}

function drawEmojiAvatar(cx, cy, size) {
    // Face
    avatarCtx.fillStyle = '#ffd93d';
    avatarCtx.beginPath();
    avatarCtx.arc(cx, cy, size, 0, Math.PI * 2);
    avatarCtx.fill();

    // Eyes
    const eyeOpenness = 1 - expressions.blink;
    const eyeHeight = 12 * eyeOpenness;

    avatarCtx.fillStyle = '#000';
    avatarCtx.beginPath();
    avatarCtx.ellipse(cx - 30, cy - 15, 8, Math.max(2, eyeHeight), 0, 0, Math.PI * 2);
    avatarCtx.ellipse(cx + 30, cy - 15, 8, Math.max(2, eyeHeight), 0, 0, Math.PI * 2);
    avatarCtx.fill();

    // Mouth
    const smileAmount = expressions.smile;
    avatarCtx.strokeStyle = '#000';
    avatarCtx.lineWidth = 4;
    avatarCtx.lineCap = 'round';
    avatarCtx.beginPath();

    if (smileAmount > 0.5) {
        // Big smile
        avatarCtx.arc(cx, cy + 10, 40, 0.2, Math.PI - 0.2);
    } else {
        // Neutral to slight smile
        const curve = smileAmount * 30;
        avatarCtx.moveTo(cx - 30, cy + 30);
        avatarCtx.quadraticCurveTo(cx, cy + 30 + curve, cx + 30, cy + 30);
    }
    avatarCtx.stroke();
}

function drawCatAvatar(cx, cy, size) {
    // Ears
    avatarCtx.fillStyle = '#ff9f43';
    avatarCtx.beginPath();
    avatarCtx.moveTo(cx - 70, cy - 30);
    avatarCtx.lineTo(cx - 40, cy - 80);
    avatarCtx.lineTo(cx - 20, cy - 40);
    avatarCtx.closePath();
    avatarCtx.fill();

    avatarCtx.beginPath();
    avatarCtx.moveTo(cx + 70, cy - 30);
    avatarCtx.lineTo(cx + 40, cy - 80);
    avatarCtx.lineTo(cx + 20, cy - 40);
    avatarCtx.closePath();
    avatarCtx.fill();

    // Face
    avatarCtx.fillStyle = '#ffa94d';
    avatarCtx.beginPath();
    avatarCtx.ellipse(cx, cy, size * 0.9, size * 0.8, 0, 0, Math.PI * 2);
    avatarCtx.fill();

    // Eyes
    const eyeOpenness = 1 - expressions.blink;
    avatarCtx.fillStyle = '#2d3436';
    avatarCtx.beginPath();
    avatarCtx.ellipse(cx - 35, cy - 10, 15, 20 * eyeOpenness + 2, 0, 0, Math.PI * 2);
    avatarCtx.ellipse(cx + 35, cy - 10, 15, 20 * eyeOpenness + 2, 0, 0, Math.PI * 2);
    avatarCtx.fill();

    if (eyeOpenness > 0.3) {
        avatarCtx.fillStyle = '#00cec9';
        avatarCtx.beginPath();
        avatarCtx.ellipse(cx - 35, cy - 10, 10, 15 * eyeOpenness, 0, 0, Math.PI * 2);
        avatarCtx.ellipse(cx + 35, cy - 10, 10, 15 * eyeOpenness, 0, 0, Math.PI * 2);
        avatarCtx.fill();
    }

    // Nose
    avatarCtx.fillStyle = '#fd79a8';
    avatarCtx.beginPath();
    avatarCtx.moveTo(cx, cy + 15);
    avatarCtx.lineTo(cx - 8, cy + 25);
    avatarCtx.lineTo(cx + 8, cy + 25);
    avatarCtx.closePath();
    avatarCtx.fill();

    // Mouth
    const smile = expressions.smile;
    avatarCtx.strokeStyle = '#2d3436';
    avatarCtx.lineWidth = 3;
    avatarCtx.beginPath();
    avatarCtx.moveTo(cx, cy + 25);
    avatarCtx.lineTo(cx - 15, cy + 35 + smile * 10);
    avatarCtx.moveTo(cx, cy + 25);
    avatarCtx.lineTo(cx + 15, cy + 35 + smile * 10);
    avatarCtx.stroke();

    // Whiskers
    avatarCtx.strokeStyle = '#636e72';
    avatarCtx.lineWidth = 2;
    for (let i = -1; i <= 1; i++) {
        avatarCtx.beginPath();
        avatarCtx.moveTo(cx - 25, cy + 20 + i * 8);
        avatarCtx.lineTo(cx - 70, cy + 15 + i * 12);
        avatarCtx.stroke();

        avatarCtx.beginPath();
        avatarCtx.moveTo(cx + 25, cy + 20 + i * 8);
        avatarCtx.lineTo(cx + 70, cy + 15 + i * 12);
        avatarCtx.stroke();
    }
}

function drawRobotAvatar(cx, cy, size) {
    // Antenna
    avatarCtx.strokeStyle = '#74b9ff';
    avatarCtx.lineWidth = 4;
    avatarCtx.beginPath();
    avatarCtx.moveTo(cx, cy - size);
    avatarCtx.lineTo(cx, cy - size - 30);
    avatarCtx.stroke();

    avatarCtx.fillStyle = '#ff7675';
    avatarCtx.beginPath();
    avatarCtx.arc(cx, cy - size - 35, 8, 0, Math.PI * 2);
    avatarCtx.fill();

    // Head
    avatarCtx.fillStyle = '#b2bec3';
    avatarCtx.fillRect(cx - size, cy - size * 0.9, size * 2, size * 1.8);

    avatarCtx.fillStyle = '#636e72';
    avatarCtx.fillRect(cx - size + 5, cy - size * 0.9 + 5, size * 2 - 10, size * 1.8 - 10);

    // Eyes
    const eyeOpenness = 1 - expressions.blink;
    avatarCtx.fillStyle = '#00cec9';
    avatarCtx.shadowColor = '#00cec9';
    avatarCtx.shadowBlur = 10;

    const eyeHeight = 25 * eyeOpenness + 3;
    avatarCtx.fillRect(cx - 55, cy - 20 - eyeHeight / 2, 30, eyeHeight);
    avatarCtx.fillRect(cx + 25, cy - 20 - eyeHeight / 2, 30, eyeHeight);
    avatarCtx.shadowBlur = 0;

    // Mouth
    const smile = expressions.smile;
    avatarCtx.fillStyle = '#74b9ff';
    avatarCtx.shadowColor = '#74b9ff';
    avatarCtx.shadowBlur = 8;

    const mouthWidth = 50 + smile * 30;
    avatarCtx.fillRect(cx - mouthWidth / 2, cy + 40, mouthWidth, 10);
    avatarCtx.shadowBlur = 0;

    // Side panels
    avatarCtx.fillStyle = '#dfe6e9';
    avatarCtx.fillRect(cx - size - 15, cy - 30, 15, 60);
    avatarCtx.fillRect(cx + size, cy - 30, 15, 60);
}

function drawAlienAvatar(cx, cy, size) {
    // Head
    avatarCtx.fillStyle = '#a8e6cf';
    avatarCtx.beginPath();
    avatarCtx.ellipse(cx, cy, size * 0.8, size, 0, 0, Math.PI * 2);
    avatarCtx.fill();

    // Large eyes
    const eyeOpenness = 1 - expressions.blink;

    // Eye sockets (dark)
    avatarCtx.fillStyle = '#000';
    avatarCtx.beginPath();
    avatarCtx.ellipse(cx - 35, cy - 20, 30, 40 * eyeOpenness + 5, -0.2, 0, Math.PI * 2);
    avatarCtx.ellipse(cx + 35, cy - 20, 30, 40 * eyeOpenness + 5, 0.2, 0, Math.PI * 2);
    avatarCtx.fill();

    if (eyeOpenness > 0.2) {
        // Eye pupils
        avatarCtx.fillStyle = '#55efc4';
        avatarCtx.beginPath();
        avatarCtx.arc(cx - 35, cy - 15, 12, 0, Math.PI * 2);
        avatarCtx.arc(cx + 35, cy - 15, 12, 0, Math.PI * 2);
        avatarCtx.fill();

        // Pupil
        avatarCtx.fillStyle = '#000';
        avatarCtx.beginPath();
        avatarCtx.arc(cx - 35, cy - 15, 6, 0, Math.PI * 2);
        avatarCtx.arc(cx + 35, cy - 15, 6, 0, Math.PI * 2);
        avatarCtx.fill();
    }

    // Small mouth
    const smile = expressions.smile;
    avatarCtx.strokeStyle = '#00b894';
    avatarCtx.lineWidth = 3;
    avatarCtx.beginPath();

    if (smile > 0.5) {
        avatarCtx.arc(cx, cy + 50, 15, 0.2, Math.PI - 0.2);
    } else {
        avatarCtx.moveTo(cx - 10, cy + 55);
        avatarCtx.lineTo(cx + 10, cy + 55);
    }
    avatarCtx.stroke();

    // Nostrils
    avatarCtx.fillStyle = '#00b894';
    avatarCtx.beginPath();
    avatarCtx.ellipse(cx - 5, cy + 35, 3, 5, 0, 0, Math.PI * 2);
    avatarCtx.ellipse(cx + 5, cy + 35, 3, 5, 0, 0, Math.PI * 2);
    avatarCtx.fill();
}

init();
