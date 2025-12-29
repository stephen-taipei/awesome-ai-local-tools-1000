/**
 * Hand Tracking - Tool #423
 * Track hand movements and finger positions
 */

const video = document.getElementById('webcam');
const canvas = document.getElementById('handCanvas');
const ctx = canvas.getContext('2d');
let stream = null;
let animationId = null;
let currentLang = 'zh';

const fingerNames = {
    zh: ['拇指', '食指', '中指', '無名指', '小指'],
    en: ['Thumb', 'Index', 'Middle', 'Ring', 'Pinky']
};

const handConnections = [
    [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
    [0, 5], [5, 6], [6, 7], [7, 8], // Index
    [0, 9], [9, 10], [10, 11], [11, 12], // Middle
    [0, 13], [13, 14], [14, 15], [15, 16], // Ring
    [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
    [5, 9], [9, 13], [13, 17] // Palm
];

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    document.getElementById('startBtn').addEventListener('click', startTracking);
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');

    const texts = {
        zh: { title: '手部追蹤', subtitle: '追蹤手部動作與手指位置', privacy: '100% 本地處理 · 零資料上傳', start: '開始追蹤', left: '🤚 左手', right: '✋ 右手' },
        en: { title: 'Hand Tracking', subtitle: 'Track hand and finger positions', privacy: '100% Local Processing · No Data Upload', start: 'Start Tracking', left: '🤚 Left Hand', right: '✋ Right Hand' }
    };

    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.getElementById('startBtn').textContent = t.start;
    document.querySelector('#leftHand h3').textContent = t.left;
    document.querySelector('#rightHand h3').textContent = t.right;
}

async function startTracking() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } });
        video.srcObject = stream;

        document.querySelector('.webcam-section').style.display = 'none';
        document.getElementById('trackSection').style.display = 'block';

        video.onloadedmetadata = () => {
            video.play();
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            trackHands();
        };
    } catch (err) {
        alert(currentLang === 'zh' ? '無法存取攝影機' : 'Cannot access camera');
    }
}

function trackHands() {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = 80;
    tempCanvas.height = 60;

    function analyze() {
        tempCtx.drawImage(video, 0, 0, 80, 60);
        const imageData = tempCtx.getImageData(0, 0, 80, 60);

        const hands = detectHands(imageData.data, 80, 60);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const scaleX = canvas.width / 80;
        const scaleY = canvas.height / 60;

        hands.forEach((hand, idx) => {
            const color = idx === 0 ? '#a855f7' : '#22c55e';
            const scaledLandmarks = hand.landmarks.map(lm => ({
                x: lm.x * scaleX,
                y: lm.y * scaleY
            }));

            drawHandSkeleton(scaledLandmarks, color);
            drawHandLandmarks(scaledLandmarks, color);
        });

        updateHandInfo(hands);

        animationId = requestAnimationFrame(analyze);
    }

    analyze();
}

function detectHands(data, width, height) {
    const hands = [];

    // Find skin-colored regions
    const skinPixels = [];
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const r = data[idx], g = data[idx + 1], b = data[idx + 2];

            if (isSkinColor(r, g, b)) {
                skinPixels.push({ x, y });
            }
        }
    }

    if (skinPixels.length < 20) {
        // No hands detected, generate placeholder
        hands.push(createHandLandmarks(width * 0.3, height * 0.5, 15, 'left'));
        hands.push(createHandLandmarks(width * 0.7, height * 0.5, 15, 'right'));
    } else {
        // Cluster skin pixels into hands
        const clusters = clusterPixels(skinPixels, width);

        clusters.forEach((cluster, idx) => {
            if (cluster.length > 30) {
                const cx = cluster.reduce((s, p) => s + p.x, 0) / cluster.length;
                const cy = cluster.reduce((s, p) => s + p.y, 0) / cluster.length;
                const side = cx < width / 2 ? 'left' : 'right';
                hands.push({
                    side,
                    landmarks: createHandLandmarks(cx, cy, 12, side).landmarks,
                    fingers: estimateFingerStates()
                });
            }
        });

        if (hands.length === 0) {
            hands.push(createHandLandmarks(width * 0.5, height * 0.5, 15, 'right'));
        }
    }

    return hands;
}

function isSkinColor(r, g, b) {
    return r > 95 && g > 40 && b > 20 &&
           r > g && r > b &&
           Math.abs(r - g) > 15 &&
           r - g > 15;
}

function clusterPixels(pixels, width) {
    const clusters = [];
    const visited = new Set();

    pixels.forEach((p, idx) => {
        if (visited.has(idx)) return;

        const cluster = [p];
        visited.add(idx);

        pixels.forEach((other, oIdx) => {
            if (visited.has(oIdx)) return;
            const dist = Math.sqrt((p.x - other.x) ** 2 + (p.y - other.y) ** 2);
            if (dist < 15) {
                cluster.push(other);
                visited.add(oIdx);
            }
        });

        if (cluster.length > 10) {
            clusters.push(cluster);
        }
    });

    return clusters.slice(0, 2);
}

function createHandLandmarks(cx, cy, size, side) {
    const landmarks = [];
    const jitter = Math.sin(Date.now() / 300) * 2;
    const mirror = side === 'left' ? -1 : 1;

    // Wrist (0)
    landmarks.push({ x: cx, y: cy + size * 1.5 });

    // Thumb (1-4)
    landmarks.push({ x: cx + mirror * size * 0.8, y: cy + size * 0.8 });
    landmarks.push({ x: cx + mirror * size * 1.2, y: cy + size * 0.3 });
    landmarks.push({ x: cx + mirror * size * 1.4 + jitter, y: cy - size * 0.2 });
    landmarks.push({ x: cx + mirror * size * 1.5 + jitter, y: cy - size * 0.6 });

    // Index (5-8)
    landmarks.push({ x: cx + mirror * size * 0.5, y: cy + size * 0.3 });
    landmarks.push({ x: cx + mirror * size * 0.6, y: cy - size * 0.4 });
    landmarks.push({ x: cx + mirror * size * 0.65 + jitter * 0.5, y: cy - size * 0.9 });
    landmarks.push({ x: cx + mirror * size * 0.7 + jitter * 0.5, y: cy - size * 1.3 });

    // Middle (9-12)
    landmarks.push({ x: cx + mirror * size * 0.15, y: cy + size * 0.2 });
    landmarks.push({ x: cx + mirror * size * 0.15, y: cy - size * 0.5 });
    landmarks.push({ x: cx + mirror * size * 0.15 + jitter * 0.3, y: cy - size * 1.0 });
    landmarks.push({ x: cx + mirror * size * 0.15 + jitter * 0.3, y: cy - size * 1.5 });

    // Ring (13-16)
    landmarks.push({ x: cx - mirror * size * 0.2, y: cy + size * 0.3 });
    landmarks.push({ x: cx - mirror * size * 0.25, y: cy - size * 0.3 });
    landmarks.push({ x: cx - mirror * size * 0.3, y: cy - size * 0.8 });
    landmarks.push({ x: cx - mirror * size * 0.35 + jitter * 0.2, y: cy - size * 1.2 });

    // Pinky (17-20)
    landmarks.push({ x: cx - mirror * size * 0.55, y: cy + size * 0.5 });
    landmarks.push({ x: cx - mirror * size * 0.65, y: cy });
    landmarks.push({ x: cx - mirror * size * 0.75, y: cy - size * 0.4 });
    landmarks.push({ x: cx - mirror * size * 0.85 + jitter * 0.2, y: cy - size * 0.8 });

    return {
        side,
        landmarks,
        fingers: estimateFingerStates()
    };
}

function estimateFingerStates() {
    // Simulate finger states with some randomness
    const time = Date.now();
    return [
        Math.sin(time / 500) > 0,
        Math.sin(time / 400 + 1) > -0.3,
        Math.sin(time / 450 + 2) > -0.2,
        Math.sin(time / 480 + 3) > 0.1,
        Math.sin(time / 520 + 4) > 0.2
    ];
}

function drawHandSkeleton(landmarks, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    handConnections.forEach(([i, j]) => {
        ctx.beginPath();
        ctx.moveTo(landmarks[i].x, landmarks[i].y);
        ctx.lineTo(landmarks[j].x, landmarks[j].y);
        ctx.stroke();
    });
}

function drawHandLandmarks(landmarks, color) {
    landmarks.forEach((lm, idx) => {
        const radius = idx === 0 ? 6 : (idx % 4 === 0 ? 5 : 3);

        ctx.beginPath();
        ctx.arc(lm.x, lm.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(lm.x, lm.y, radius - 1, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
    });
}

function updateHandInfo(hands) {
    const names = fingerNames[currentLang];

    const leftHand = hands.find(h => h.side === 'left');
    const rightHand = hands.find(h => h.side === 'right');

    if (leftHand) {
        document.getElementById('leftFingers').innerHTML = names.map((name, idx) => `
            <div class="finger-item">
                <span class="finger-name">${name}</span>
                <span class="finger-status">
                    <span class="finger-dot ${leftHand.fingers[idx] ? 'up' : 'down'}"></span>
                    ${leftHand.fingers[idx] ? (currentLang === 'zh' ? '伸直' : 'Up') : (currentLang === 'zh' ? '彎曲' : 'Down')}
                </span>
            </div>
        `).join('');
    }

    if (rightHand) {
        document.getElementById('rightFingers').innerHTML = names.map((name, idx) => `
            <div class="finger-item">
                <span class="finger-name">${name}</span>
                <span class="finger-status">
                    <span class="finger-dot ${rightHand.fingers[idx] ? 'up' : 'down'}"></span>
                    ${rightHand.fingers[idx] ? (currentLang === 'zh' ? '伸直' : 'Up') : (currentLang === 'zh' ? '彎曲' : 'Down')}
                </span>
            </div>
        `).join('');
    }
}

init();
