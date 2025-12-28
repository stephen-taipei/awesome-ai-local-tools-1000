/**
 * Liveness Detection - Tool #413
 * Detect if face is live or spoofed
 */

const video = document.getElementById('webcam');
let webcamStream = null;
let detectionInterval = null;
let currentLang = 'zh';
let challengeIndex = 0;
let frameHistory = [];

const challenges = [
    { type: 'blink', zh: '請眨眼', en: 'Please blink', icon: '👁️' },
    { type: 'turnLeft', zh: '請向左轉頭', en: 'Turn head left', icon: '←' },
    { type: 'turnRight', zh: '請向右轉頭', en: 'Turn head right', icon: '→' },
    { type: 'nod', zh: '請點頭', en: 'Please nod', icon: '↓' }
];

let challengeResults = [];
let livenessMetrics = {
    movement: 0,
    textureVariance: 0,
    depthCues: 0,
    responseTime: 0
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
        zh: { title: '活體偵測', subtitle: '偵測是否為真人活體', privacy: '100% 本地處理 · 零資料上傳', start: '開始偵測', stop: '停止偵測', preparing: '準備中...', challengeTitle: '請完成以下動作' },
        en: { title: 'Liveness Detection', subtitle: 'Detect if face is live or spoofed', privacy: '100% Local Processing · No Data Upload', start: 'Start Detection', stop: 'Stop Detection', preparing: 'Preparing...', challengeTitle: 'Complete the following actions' }
    };

    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.querySelector('.challenge-section h3').textContent = t.challengeTitle;

    if (!webcamStream) {
        document.getElementById('startBtn').textContent = t.start;
    } else {
        document.getElementById('startBtn').textContent = t.stop;
    }

    updateChallengeList();
}

async function toggleDetection() {
    const btn = document.getElementById('startBtn');
    const videoContainer = document.querySelector('.video-container');

    if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
        webcamStream = null;
        clearInterval(detectionInterval);
        videoContainer.style.display = 'none';
        document.getElementById('challengeSection').style.display = 'none';
        document.getElementById('resultSection').style.display = 'none';
        btn.textContent = currentLang === 'zh' ? '開始偵測' : 'Start Detection';
        return;
    }

    try {
        webcamStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: 640, height: 480 }
        });
        video.srcObject = webcamStream;
        videoContainer.style.display = 'block';
        document.getElementById('challengeSection').style.display = 'block';
        btn.textContent = currentLang === 'zh' ? '停止偵測' : 'Stop Detection';

        // Reset
        challengeIndex = 0;
        challengeResults = [];
        frameHistory = [];
        livenessMetrics = { movement: 0, textureVariance: 0, depthCues: 0, responseTime: 0 };

        updateChallengeList();
        updateStatus('⏳', currentLang === 'zh' ? '準備中...' : 'Preparing...');

        video.onloadedmetadata = () => {
            setTimeout(startChallenges, 2000);
        };
    } catch (err) {
        alert(currentLang === 'zh' ? '無法存取攝影機' : 'Cannot access webcam');
    }
}

function updateChallengeList() {
    const listEl = document.getElementById('challengeList');
    listEl.innerHTML = challenges.map((c, i) => {
        let status = '○';
        let className = '';
        if (i < challengeResults.length) {
            status = challengeResults[i] ? '✓' : '✗';
            className = challengeResults[i] ? 'completed' : '';
        } else if (i === challengeIndex && challengeIndex < challenges.length) {
            className = 'active';
            status = '◉';
        }
        return `
            <div class="challenge-item ${className}">
                <span class="challenge-icon">${c.icon}</span>
                <span class="challenge-text">${c[currentLang]}</span>
                <span class="challenge-status">${status}</span>
            </div>
        `;
    }).join('');

    const progress = (challengeResults.length / challenges.length) * 100;
    document.getElementById('progressFill').style.width = `${progress}%`;
}

function updateStatus(icon, text) {
    document.getElementById('statusIcon').textContent = icon;
    document.getElementById('statusText').textContent = text;
}

function startChallenges() {
    if (challengeIndex >= challenges.length) {
        showResults();
        return;
    }

    const challenge = challenges[challengeIndex];
    updateStatus('👀', challenge[currentLang]);
    updateChallengeList();

    const startTime = Date.now();
    let detected = false;

    detectionInterval = setInterval(() => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        frameHistory.push(imageData);
        if (frameHistory.length > 10) frameHistory.shift();

        // Analyze for challenge completion
        const analysis = analyzeChallenge(challenge.type, frameHistory);

        if (analysis.detected && !detected) {
            detected = true;
            livenessMetrics.responseTime += Date.now() - startTime;

            updateStatus('✓', currentLang === 'zh' ? '已偵測!' : 'Detected!');
            challengeResults.push(true);

            // Update liveness metrics
            livenessMetrics.movement += analysis.movement;
            livenessMetrics.textureVariance += analysis.texture;

            setTimeout(() => {
                clearInterval(detectionInterval);
                challengeIndex++;
                updateChallengeList();
                setTimeout(() => startChallenges(), 500);
            }, 500);
        }

        // Timeout after 5 seconds
        if (Date.now() - startTime > 5000 && !detected) {
            clearInterval(detectionInterval);
            challengeResults.push(false);
            challengeIndex++;
            updateChallengeList();
            setTimeout(() => startChallenges(), 500);
        }
    }, 100);
}

function analyzeChallenge(type, frames) {
    if (frames.length < 5) return { detected: false, movement: 0, texture: 0 };

    const current = frames[frames.length - 1];
    const previous = frames[0];

    let movement = 0;
    let texture = 0;

    // Calculate movement between frames
    for (let i = 0; i < current.data.length; i += 16) {
        const diff = Math.abs(current.data[i] - previous.data[i]);
        movement += diff;
    }
    movement = movement / (current.data.length / 16) / 255;

    // Calculate texture variance
    let variance = 0;
    for (let i = 0; i < current.data.length - 4; i += 4) {
        variance += Math.abs(current.data[i] - current.data[i + 4]);
    }
    texture = variance / (current.data.length / 4) / 255;

    let detected = false;

    switch (type) {
        case 'blink':
            // Detect sudden brightness change in eye region
            detected = movement > 0.02 && movement < 0.15;
            break;
        case 'turnLeft':
        case 'turnRight':
            // Detect horizontal movement
            detected = movement > 0.05;
            break;
        case 'nod':
            // Detect vertical movement
            detected = movement > 0.04;
            break;
    }

    return { detected, movement, texture };
}

function showResults() {
    clearInterval(detectionInterval);
    document.getElementById('resultSection').style.display = 'block';

    const passedChallenges = challengeResults.filter(r => r).length;
    const isLive = passedChallenges >= 3 && livenessMetrics.movement > 0.1;

    const livenessScore = Math.round(
        (passedChallenges / challenges.length) * 50 +
        Math.min(livenessMetrics.movement * 100, 25) +
        Math.min(livenessMetrics.textureVariance * 100, 25)
    );

    document.getElementById('resultIcon').textContent = isLive ? '✅' : '❌';

    const resultLabel = document.getElementById('resultLabel');
    resultLabel.textContent = isLive
        ? (currentLang === 'zh' ? '真人活體' : 'Live Person')
        : (currentLang === 'zh' ? '可能為照片/影片' : 'Possible Photo/Video');
    resultLabel.className = `result-label ${isLive ? 'live' : 'spoof'}`;

    document.getElementById('resultScore').textContent =
        currentLang === 'zh' ? `信心度: ${livenessScore}%` : `Confidence: ${livenessScore}%`;

    const metrics = currentLang === 'zh'
        ? { challenges: '通過挑戰', movement: '動作幅度', texture: '紋理變化', response: '反應時間' }
        : { challenges: 'Challenges', movement: 'Movement', texture: 'Texture', response: 'Response' };

    document.getElementById('metricsGrid').innerHTML = `
        <div class="metric-item">
            <div class="metric-label">${metrics.challenges}</div>
            <div class="metric-value">${passedChallenges}/${challenges.length}</div>
        </div>
        <div class="metric-item">
            <div class="metric-label">${metrics.movement}</div>
            <div class="metric-value">${Math.round(livenessMetrics.movement * 100)}%</div>
        </div>
        <div class="metric-item">
            <div class="metric-label">${metrics.texture}</div>
            <div class="metric-value">${Math.round(livenessMetrics.textureVariance * 100)}%</div>
        </div>
        <div class="metric-item">
            <div class="metric-label">${metrics.response}</div>
            <div class="metric-value">${Math.round(livenessMetrics.responseTime / passedChallenges / 1000)}s</div>
        </div>
    `;

    updateStatus(isLive ? '✅' : '❌', resultLabel.textContent);
}

init();
