/**
 * Action Recognition - Tool #426
 * Recognize human actions and activities
 */

const video = document.getElementById('webcam');
const canvas = document.getElementById('actionCanvas');
const ctx = canvas.getContext('2d');
let stream = null;
let animationId = null;
let currentLang = 'zh';
let prevFrameData = null;
let actionHistory = [];

const actions = {
    standing: { icon: '🧍', zh: '站立', en: 'Standing' },
    sitting: { icon: '🪑', zh: '坐下', en: 'Sitting' },
    walking: { icon: '🚶', zh: '走路', en: 'Walking' },
    waving: { icon: '👋', zh: '揮手', en: 'Waving' },
    jumping: { icon: '🦘', zh: '跳躍', en: 'Jumping' },
    clapping: { icon: '👏', zh: '拍手', en: 'Clapping' },
    typing: { icon: '⌨️', zh: '打字', en: 'Typing' },
    phone: { icon: '📱', zh: '講電話', en: 'Phone Call' }
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
        zh: { title: '動作識別', subtitle: '識別人體動作與活動', privacy: '100% 本地處理 · 零資料上傳', start: '開始識別', detecting: '偵測中...', history: '動作歷史' },
        en: { title: 'Action Recognition', subtitle: 'Recognize human actions', privacy: '100% Local Processing · No Data Upload', start: 'Start Recognition', detecting: 'Detecting...', history: 'Action History' }
    };

    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.getElementById('startBtn').textContent = t.start;
    document.querySelector('.action-history h3').textContent = t.history;

    updateHistoryDisplay();
}

async function startRecognition() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } });
        video.srcObject = stream;

        document.querySelector('.webcam-section').style.display = 'none';
        document.getElementById('actionSection').style.display = 'block';

        video.onloadedmetadata = () => {
            video.play();
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            recognizeActions();
        };
    } catch (err) {
        alert(currentLang === 'zh' ? '無法存取攝影機' : 'Cannot access camera');
    }
}

function recognizeActions() {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = 64;
    tempCanvas.height = 48;

    let frameCount = 0;
    let motionBuffer = [];

    function analyze() {
        frameCount++;

        tempCtx.drawImage(video, 0, 0, 64, 48);
        const imageData = tempCtx.getImageData(0, 0, 64, 48);
        const data = imageData.data;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Calculate motion
        if (prevFrameData) {
            const motion = calculateMotion(data, prevFrameData, 64, 48);
            motionBuffer.push(motion);
            if (motionBuffer.length > 30) motionBuffer.shift();

            // Draw motion overlay
            drawMotionOverlay(data, prevFrameData, 64, 48);

            // Recognize action every 20 frames
            if (frameCount % 20 === 0) {
                const action = classifyAction(motionBuffer, data, 64, 48);
                updateActionDisplay(action);
            }
        }

        prevFrameData = new Uint8ClampedArray(data);
        animationId = requestAnimationFrame(analyze);
    }

    analyze();
}

function calculateMotion(current, previous, width, height) {
    let totalMotion = 0;
    let motionX = 0, motionY = 0;
    let upperMotion = 0, lowerMotion = 0;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const diff = Math.abs(current[idx] - previous[idx]) +
                        Math.abs(current[idx + 1] - previous[idx + 1]) +
                        Math.abs(current[idx + 2] - previous[idx + 2]);

            if (diff > 30) {
                totalMotion += diff;
                motionX += x * diff;
                motionY += y * diff;

                if (y < height / 2) upperMotion += diff;
                else lowerMotion += diff;
            }
        }
    }

    return {
        total: totalMotion,
        centerX: totalMotion > 0 ? motionX / totalMotion : width / 2,
        centerY: totalMotion > 0 ? motionY / totalMotion : height / 2,
        upper: upperMotion,
        lower: lowerMotion
    };
}

function drawMotionOverlay(current, previous, width, height) {
    const scaleX = canvas.width / width;
    const scaleY = canvas.height / height;

    ctx.fillStyle = 'rgba(168, 85, 247, 0.4)';

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

function classifyAction(motionBuffer, data, width, height) {
    if (motionBuffer.length < 10) {
        return { type: 'standing', confidence: 0.5 };
    }

    // Calculate motion statistics
    const avgTotal = motionBuffer.reduce((s, m) => s + m.total, 0) / motionBuffer.length;
    const avgUpper = motionBuffer.reduce((s, m) => s + m.upper, 0) / motionBuffer.length;
    const avgLower = motionBuffer.reduce((s, m) => s + m.lower, 0) / motionBuffer.length;

    // Calculate motion variance (for rhythmic actions)
    const motionVariance = motionBuffer.reduce((s, m) => s + Math.pow(m.total - avgTotal, 2), 0) / motionBuffer.length;

    // Classify based on motion patterns
    let actionType = 'standing';
    let confidence = 0.7;

    if (avgTotal < 5000) {
        actionType = 'standing';
        confidence = 0.85;
    } else if (avgTotal > 50000) {
        if (avgUpper > avgLower * 1.5) {
            actionType = 'waving';
            confidence = 0.75;
        } else if (avgLower > avgUpper * 1.5) {
            actionType = 'walking';
            confidence = 0.7;
        } else {
            actionType = 'jumping';
            confidence = 0.65;
        }
    } else if (avgTotal > 20000) {
        if (motionVariance > 100000000) {
            actionType = 'clapping';
            confidence = 0.7;
        } else if (avgUpper > avgLower) {
            actionType = 'waving';
            confidence = 0.7;
        } else {
            actionType = 'walking';
            confidence = 0.65;
        }
    } else if (avgTotal > 8000) {
        if (avgUpper > avgLower * 2) {
            actionType = 'phone';
            confidence = 0.6;
        } else {
            actionType = 'typing';
            confidence = 0.6;
        }
    } else {
        actionType = 'sitting';
        confidence = 0.7;
    }

    return { type: actionType, confidence };
}

function updateActionDisplay(action) {
    const a = actions[action.type];
    if (!a) return;

    document.getElementById('actionIcon').textContent = a.icon;
    document.getElementById('actionName').textContent = a[currentLang];
    document.getElementById('confidenceFill').style.width = `${action.confidence * 100}%`;
    document.getElementById('confidenceValue').textContent = `${Math.round(action.confidence * 100)}%`;

    // Add to history
    const now = new Date();
    const timeStr = now.toLocaleTimeString(currentLang === 'zh' ? 'zh-TW' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (actionHistory.length === 0 || actionHistory[actionHistory.length - 1].type !== action.type) {
        actionHistory.push({ type: action.type, time: timeStr });
        if (actionHistory.length > 10) actionHistory.shift();
        updateHistoryDisplay();
    }
}

function updateHistoryDisplay() {
    const listEl = document.getElementById('historyList');
    listEl.innerHTML = actionHistory.map(item => {
        const a = actions[item.type];
        return `
            <div class="history-item">
                <span class="icon">${a.icon}</span>
                <span>${a[currentLang]}</span>
                <span class="time">${item.time}</span>
            </div>
        `;
    }).reverse().join('');
}

init();
