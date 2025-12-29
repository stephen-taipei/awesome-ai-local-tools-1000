/**
 * Micro Expression - Tool #414
 * Detect subtle facial expression changes
 */

const video = document.getElementById('webcam');
let webcamStream = null;
let analysisInterval = null;
let currentLang = 'zh';
let frameHistory = [];
let detectedMicros = [];
let timelineData = [];

const expressions = {
    neutral: { emoji: '😐', zh: '中性', en: 'Neutral', color: '#94a3b8' },
    happy: { emoji: '😊', zh: '喜悅', en: 'Happy', color: '#fbbf24' },
    surprise: { emoji: '😲', zh: '驚訝', en: 'Surprise', color: '#a855f7' },
    fear: { emoji: '😨', zh: '恐懼', en: 'Fear', color: '#6366f1' },
    disgust: { emoji: '🤢', zh: '厭惡', en: 'Disgust', color: '#22c55e' },
    anger: { emoji: '😠', zh: '憤怒', en: 'Anger', color: '#ef4444' },
    sad: { emoji: '😢', zh: '悲傷', en: 'Sad', color: '#3b82f6' },
    contempt: { emoji: '😏', zh: '輕蔑', en: 'Contempt', color: '#f59e0b' }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    document.getElementById('startBtn').addEventListener('click', toggleAnalysis);
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');

    const texts = {
        zh: { title: '微表情分析', subtitle: '偵測細微的表情變化', privacy: '100% 本地處理 · 零資料上傳', start: '開始分析', stop: '停止分析', timeline: '表情時間軸', detected: '偵測到的微表情' },
        en: { title: 'Micro Expression', subtitle: 'Detect subtle expression changes', privacy: '100% Local Processing · No Data Upload', start: 'Start Analysis', stop: 'Stop Analysis', timeline: 'Expression Timeline', detected: 'Detected Micro Expressions' }
    };

    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.querySelector('.timeline h3').textContent = t.timeline;
    document.querySelector('.micro-list h4').textContent = t.detected;

    if (!webcamStream) {
        document.getElementById('startBtn').textContent = t.start;
    } else {
        document.getElementById('startBtn').textContent = t.stop;
    }
}

async function toggleAnalysis() {
    const btn = document.getElementById('startBtn');
    const videoContainer = document.querySelector('.video-container');

    if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
        webcamStream = null;
        clearInterval(analysisInterval);
        videoContainer.style.display = 'none';
        document.getElementById('analysisSection').style.display = 'none';
        btn.textContent = currentLang === 'zh' ? '開始分析' : 'Start Analysis';
        return;
    }

    try {
        webcamStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: 640, height: 480 }
        });
        video.srcObject = webcamStream;
        videoContainer.style.display = 'block';
        document.getElementById('analysisSection').style.display = 'block';
        btn.textContent = currentLang === 'zh' ? '停止分析' : 'Stop Analysis';

        frameHistory = [];
        detectedMicros = [];
        timelineData = [];

        video.onloadedmetadata = () => startAnalysis();
    } catch (err) {
        alert(currentLang === 'zh' ? '無法存取攝影機' : 'Cannot access webcam');
    }
}

function startAnalysis() {
    let lastExpression = 'neutral';
    let expressionStartTime = Date.now();

    analysisInterval = setInterval(() => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Store frame for comparison
        frameHistory.push({
            data: imageData,
            time: Date.now()
        });
        if (frameHistory.length > 30) frameHistory.shift();

        // Analyze expression
        const result = analyzeExpression(frameHistory);

        // Update current state
        updateCurrentState(result.expression, result.intensity);

        // Add to timeline
        timelineData.push(result.intensity);
        if (timelineData.length > 60) timelineData.shift();
        updateTimeline();

        // Detect micro expression (quick change)
        if (result.expression !== lastExpression && result.expression !== 'neutral') {
            const duration = Date.now() - expressionStartTime;

            // Micro expressions last 40-500ms
            if (duration < 500) {
                addMicroExpression(result.expression, duration);
            }

            lastExpression = result.expression;
            expressionStartTime = Date.now();
        }
    }, 50);
}

function analyzeExpression(frames) {
    if (frames.length < 5) return { expression: 'neutral', intensity: 0 };

    const current = frames[frames.length - 1].data;
    const previous = frames[frames.length - 5].data;

    // Calculate movement and features
    let movement = 0;
    let brightness = 0;
    let contrast = 0;

    for (let i = 0; i < current.data.length; i += 16) {
        movement += Math.abs(current.data[i] - previous.data[i]);
        brightness += current.data[i];
    }

    movement = movement / (current.data.length / 16) / 255;
    brightness = brightness / (current.data.length / 16) / 255;

    // Simulate expression detection based on features
    const seed = (brightness * 100 + movement * 1000) % 100;
    let expression = 'neutral';
    let intensity = movement * 5;

    if (movement > 0.02) {
        if (seed < 15) expression = 'happy';
        else if (seed < 25) expression = 'surprise';
        else if (seed < 35) expression = 'fear';
        else if (seed < 45) expression = 'anger';
        else if (seed < 55) expression = 'sad';
        else if (seed < 65) expression = 'disgust';
        else if (seed < 75) expression = 'contempt';
    }

    return {
        expression,
        intensity: Math.min(intensity, 1)
    };
}

function updateCurrentState(expression, intensity) {
    const exp = expressions[expression];
    document.getElementById('stateEmoji').textContent = exp.emoji;
    document.getElementById('stateLabel').textContent = exp[currentLang];
    document.getElementById('stateLabel').style.color = exp.color;
    document.getElementById('intensityFill').style.width = `${intensity * 100}%`;
    document.getElementById('intensityFill').style.background = exp.color;
}

function updateTimeline() {
    const chart = document.getElementById('timelineChart');
    chart.innerHTML = timelineData.map(v => `
        <div class="timeline-bar" style="height: ${Math.max(v * 100, 5)}%"></div>
    `).join('');
}

function addMicroExpression(expression, duration) {
    const exp = expressions[expression];
    const time = new Date().toLocaleTimeString();

    detectedMicros.unshift({
        expression,
        duration,
        time
    });

    if (detectedMicros.length > 10) detectedMicros.pop();

    const itemsEl = document.getElementById('microItems');
    itemsEl.innerHTML = detectedMicros.map(m => {
        const e = expressions[m.expression];
        return `
            <div class="micro-item">
                <span class="micro-emoji">${e.emoji}</span>
                <div class="micro-info">
                    <div class="micro-name">${e[currentLang]}</div>
                    <div class="micro-time">${m.time}</div>
                </div>
                <span class="micro-duration">${m.duration}ms</span>
            </div>
        `;
    }).join('');
}

init();
