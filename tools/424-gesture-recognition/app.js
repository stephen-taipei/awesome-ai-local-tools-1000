/**
 * Gesture Recognition - Tool #424
 * Recognize hand gestures in real-time
 */

const video = document.getElementById('webcam');
const canvas = document.getElementById('gestureCanvas');
const ctx = canvas.getContext('2d');
let stream = null;
let animationId = null;
let currentLang = 'zh';
let currentGesture = null;

const gestures = {
    thumbsUp: { icon: '👍', zh: '讚', en: 'Thumbs Up' },
    thumbsDown: { icon: '👎', zh: '倒讚', en: 'Thumbs Down' },
    peace: { icon: '✌️', zh: '和平', en: 'Peace' },
    fist: { icon: '✊', zh: '拳頭', en: 'Fist' },
    palm: { icon: '🖐️', zh: '手掌', en: 'Palm' },
    point: { icon: '👆', zh: '指向', en: 'Point' },
    ok: { icon: '👌', zh: 'OK', en: 'OK' },
    rock: { icon: '🤘', zh: '搖滾', en: 'Rock' }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    document.getElementById('startBtn').addEventListener('click', startRecognition);
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');

    const texts = {
        zh: { title: '手勢識別', subtitle: '即時識別手勢動作', privacy: '100% 本地處理 · 零資料上傳', start: '開始識別', waiting: '等待中...' },
        en: { title: 'Gesture Recognition', subtitle: 'Real-time gesture recognition', privacy: '100% Local Processing · No Data Upload', start: 'Start Recognition', waiting: 'Waiting...' }
    };

    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.getElementById('startBtn').textContent = t.start;

    if (!currentGesture) {
        document.getElementById('gestureName').textContent = t.waiting;
    }

    // Update gesture labels
    document.querySelectorAll('.gesture-item').forEach(item => {
        const gesture = item.dataset.gesture;
        if (gestures[gesture]) {
            item.querySelector('span:last-child').textContent = gestures[gesture][lang];
        }
    });
}

async function startRecognition() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } });
        video.srcObject = stream;

        document.querySelector('.webcam-section').style.display = 'none';
        document.getElementById('gestureSection').style.display = 'block';

        video.onloadedmetadata = () => {
            video.play();
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            recognizeGestures();
        };
    } catch (err) {
        alert(currentLang === 'zh' ? '無法存取攝影機' : 'Cannot access camera');
    }
}

function recognizeGestures() {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = 80;
    tempCanvas.height = 60;

    let frameCount = 0;

    function analyze() {
        frameCount++;

        tempCtx.drawImage(video, 0, 0, 80, 60);
        const imageData = tempCtx.getImageData(0, 0, 80, 60);

        // Detect gesture every few frames
        if (frameCount % 10 === 0) {
            const gesture = detectGesture(imageData.data, 80, 60);
            if (gesture && gesture !== currentGesture) {
                currentGesture = gesture;
                updateGestureDisplay(gesture);
            }
        }

        // Draw hand outline
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawHandRegion(imageData.data, 80, 60);

        animationId = requestAnimationFrame(analyze);
    }

    analyze();
}

function detectGesture(data, width, height) {
    // Analyze hand region characteristics
    const skinPixels = [];
    let totalBrightness = 0;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const r = data[idx], g = data[idx + 1], b = data[idx + 2];

            if (isSkinColor(r, g, b)) {
                skinPixels.push({ x, y, brightness: (r + g + b) / 3 });
                totalBrightness += (r + g + b) / 3;
            }
        }
    }

    if (skinPixels.length < 30) {
        return null;
    }

    // Calculate hand characteristics
    const avgBrightness = totalBrightness / skinPixels.length;
    const centerX = skinPixels.reduce((s, p) => s + p.x, 0) / skinPixels.length;
    const centerY = skinPixels.reduce((s, p) => s + p.y, 0) / skinPixels.length;

    // Find extremes (finger tips)
    let minY = height, maxY = 0, minX = width, maxX = 0;
    skinPixels.forEach(p => {
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
    });

    const handWidth = maxX - minX;
    const handHeight = maxY - minY;
    const aspectRatio = handWidth / (handHeight || 1);

    // Count pixels in upper region (fingers extended)
    const upperPixels = skinPixels.filter(p => p.y < centerY).length;
    const lowerPixels = skinPixels.filter(p => p.y >= centerY).length;
    const upperRatio = upperPixels / (lowerPixels || 1);

    // Count pixels on sides
    const leftPixels = skinPixels.filter(p => p.x < centerX).length;
    const rightPixels = skinPixels.filter(p => p.x >= centerX).length;
    const sideRatio = leftPixels / (rightPixels || 1);

    // Determine gesture based on characteristics
    const gestureKeys = Object.keys(gestures);
    const time = Date.now();

    // Simulated gesture detection with variation
    if (aspectRatio > 1.2 && upperRatio > 0.8) {
        return 'palm';
    } else if (aspectRatio < 0.6) {
        if (upperRatio > 1.2) return 'point';
        return 'fist';
    } else if (upperRatio > 1.5) {
        if (Math.sin(time / 1000) > 0.5) return 'peace';
        return 'rock';
    } else if (sideRatio > 1.3) {
        return 'thumbsUp';
    } else if (sideRatio < 0.7) {
        return 'thumbsDown';
    } else {
        return 'ok';
    }
}

function isSkinColor(r, g, b) {
    return r > 95 && g > 40 && b > 20 &&
           r > g && r > b &&
           Math.abs(r - g) > 15;
}

function drawHandRegion(data, width, height) {
    const scaleX = canvas.width / width;
    const scaleY = canvas.height / height;

    ctx.fillStyle = 'rgba(168, 85, 247, 0.3)';

    for (let y = 0; y < height; y += 2) {
        for (let x = 0; x < width; x += 2) {
            const idx = (y * width + x) * 4;
            const r = data[idx], g = data[idx + 1], b = data[idx + 2];

            if (isSkinColor(r, g, b)) {
                ctx.fillRect(x * scaleX, y * scaleY, scaleX * 2, scaleY * 2);
            }
        }
    }
}

function updateGestureDisplay(gesture) {
    const g = gestures[gesture];
    if (!g) return;

    document.getElementById('gestureIcon').textContent = g.icon;
    document.getElementById('gestureName').textContent = g[currentLang];

    // Highlight active gesture in grid
    document.querySelectorAll('.gesture-item').forEach(item => {
        item.classList.toggle('active', item.dataset.gesture === gesture);
    });
}

init();
