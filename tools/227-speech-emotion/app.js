/**
 * Speech Emotion Recognition - Tool #227
 * Analyze emotions in speech using audio features
 */

let currentLang = 'zh';
let audioContext = null;
let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;
let audioBuffer = null;

const emotions = {
    happy: { zh: '快樂', en: 'Happy', icon: '😊', color: '#22c55e' },
    sad: { zh: '悲傷', en: 'Sad', icon: '😢', color: '#3b82f6' },
    angry: { zh: '憤怒', en: 'Angry', icon: '😠', color: '#ef4444' },
    fearful: { zh: '恐懼', en: 'Fearful', icon: '😨', color: '#8b5cf6' },
    surprised: { zh: '驚訝', en: 'Surprised', icon: '😲', color: '#f59e0b' },
    neutral: { zh: '中性', en: 'Neutral', icon: '😐', color: '#64748b' },
    disgust: { zh: '厭惡', en: 'Disgust', icon: '🤢', color: '#84cc16' }
};

const texts = {
    zh: {
        title: '語音情感分析',
        subtitle: '分析語音中的情感狀態',
        privacy: '100% 本地處理 · 零資料上傳',
        record: '點擊開始錄音',
        recording: '錄音中... 點擊停止',
        hint: '或上傳音訊檔案',
        upload: '上傳檔案',
        analyze: '分析情感',
        breakdown: '情感分布',
        metrics: '語音特徵',
        pitch: '音調',
        energy: '能量',
        speed: '語速',
        variation: '變化度'
    },
    en: {
        title: 'Speech Emotion Recognition',
        subtitle: 'Analyze emotions in speech',
        privacy: '100% Local Processing · No Data Upload',
        record: 'Click to start recording',
        recording: 'Recording... Click to stop',
        hint: 'or upload audio file',
        upload: 'Upload file',
        analyze: 'Analyze Emotion',
        breakdown: 'Emotion Breakdown',
        metrics: 'Voice Metrics',
        pitch: 'Pitch',
        energy: 'Energy',
        speed: 'Speed',
        variation: 'Variation'
    }
};

function init() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));

    document.getElementById('recordArea').addEventListener('click', toggleRecording);
    document.getElementById('uploadBtn').addEventListener('click', () => document.getElementById('audioInput').click());
    document.getElementById('audioInput').addEventListener('change', handleFileUpload);
    document.getElementById('analyzeBtn').addEventListener('click', analyzeEmotion);
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');

    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.querySelector('.record-text').textContent = isRecording ? t.recording : t.record;
    document.querySelector('.record-hint').textContent = t.hint;
    document.getElementById('uploadBtn').textContent = t.upload;
    document.getElementById('analyzeBtn').textContent = t.analyze;
}

async function toggleRecording() {
    if (isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
}

async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
        mediaRecorder.onstop = processRecording;

        mediaRecorder.start();
        isRecording = true;

        const recordArea = document.getElementById('recordArea');
        recordArea.classList.add('recording');
        document.querySelector('.record-text').textContent = texts[currentLang].recording;
    } catch (err) {
        console.error('Recording error:', err);
    }
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
    isRecording = false;

    const recordArea = document.getElementById('recordArea');
    recordArea.classList.remove('recording');
    document.querySelector('.record-text').textContent = texts[currentLang].record;
}

async function processRecording() {
    const blob = new Blob(audioChunks, { type: 'audio/wav' });
    await loadAudioBlob(blob);
}

async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (file) await loadAudioBlob(file);
}

async function loadAudioBlob(blob) {
    const url = URL.createObjectURL(blob);
    document.getElementById('audioPlayer').src = url;
    document.getElementById('analysisSection').style.display = 'block';

    const arrayBuffer = await blob.arrayBuffer();
    audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
}

function analyzeEmotion() {
    if (!audioBuffer) return;

    const features = extractFeatures(audioBuffer);
    const emotionScores = predictEmotions(features);

    displayResults(emotionScores, features);
}

function extractFeatures(buffer) {
    const data = buffer.getChannelData(0);
    const sampleRate = buffer.sampleRate;

    let energy = 0, zcr = 0, pitchSum = 0, pitchCount = 0;
    const energyValues = [];

    const frameSize = 2048;
    const hopSize = 512;
    const numFrames = Math.floor((data.length - frameSize) / hopSize);

    for (let frame = 0; frame < numFrames; frame++) {
        const start = frame * hopSize;
        const frameData = data.slice(start, start + frameSize);

        let frameEnergy = 0;
        for (let i = 0; i < frameData.length; i++) {
            frameEnergy += frameData[i] * frameData[i];
            if (i > 0 && (frameData[i] >= 0) !== (frameData[i-1] >= 0)) zcr++;
        }
        energyValues.push(frameEnergy);
        energy += frameEnergy;
    }

    const minPeriod = Math.floor(sampleRate / 500);
    const maxPeriod = Math.floor(sampleRate / 50);
    let bestCorr = 0, bestPeriod = 0;

    for (let period = minPeriod; period < maxPeriod; period++) {
        let corr = 0;
        for (let i = 0; i < 1024; i++) {
            if (i + period < data.length) corr += data[i] * data[i + period];
        }
        if (corr > bestCorr) { bestCorr = corr; bestPeriod = period; }
    }

    const pitch = bestPeriod > 0 ? sampleRate / bestPeriod : 200;
    const avgEnergy = energy / numFrames;
    const avgZcr = zcr / data.length;

    let energyVariation = 0;
    const meanEnergy = energyValues.reduce((a, b) => a + b, 0) / energyValues.length;
    for (const e of energyValues) energyVariation += Math.pow(e - meanEnergy, 2);
    energyVariation = Math.sqrt(energyVariation / energyValues.length);

    return {
        pitch: pitch,
        energy: avgEnergy,
        zcr: avgZcr,
        variation: energyVariation / (meanEnergy + 0.001),
        duration: buffer.duration
    };
}

function predictEmotions(features) {
    const scores = {};
    const { pitch, energy, zcr, variation } = features;

    scores.happy = 0.1 + (pitch > 200 ? 0.3 : 0) + (energy > 0.01 ? 0.2 : 0) + (variation > 0.5 ? 0.2 : 0);
    scores.sad = 0.1 + (pitch < 150 ? 0.3 : 0) + (energy < 0.005 ? 0.2 : 0) + (variation < 0.3 ? 0.2 : 0);
    scores.angry = 0.1 + (pitch > 180 ? 0.2 : 0) + (energy > 0.02 ? 0.3 : 0) + (zcr > 0.1 ? 0.2 : 0);
    scores.fearful = 0.1 + (pitch > 220 ? 0.2 : 0) + (variation > 0.6 ? 0.3 : 0);
    scores.surprised = 0.1 + (pitch > 250 ? 0.3 : 0) + (variation > 0.5 ? 0.2 : 0);
    scores.neutral = 0.2 + (Math.abs(pitch - 180) < 30 ? 0.2 : 0) + (variation < 0.4 ? 0.2 : 0);
    scores.disgust = 0.1 + (zcr > 0.08 ? 0.2 : 0) + (energy > 0.01 ? 0.1 : 0);

    const total = Object.values(scores).reduce((a, b) => a + b, 0);
    for (const key in scores) scores[key] = scores[key] / total;

    return scores;
}

function displayResults(scores, features) {
    document.getElementById('resultSection').style.display = 'block';

    const sortedEmotions = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const [topEmotion, topScore] = sortedEmotions[0];

    const emotionData = emotions[topEmotion];
    document.getElementById('emotionIcon').textContent = emotionData.icon;
    document.getElementById('emotionName').textContent = emotionData[currentLang];
    document.getElementById('emotionConf').textContent = Math.round(topScore * 100) + '%';

    const barsHtml = sortedEmotions.map(([emotion, score]) => {
        const e = emotions[emotion];
        return `
            <div class="emotion-bar-item">
                <div class="emotion-bar-label">
                    <span>${e.icon} ${e[currentLang]}</span>
                    <span>${Math.round(score * 100)}%</span>
                </div>
                <div class="emotion-bar">
                    <div class="emotion-bar-fill" style="width: ${score * 100}%; background: ${e.color}"></div>
                </div>
            </div>
        `;
    }).join('');
    document.getElementById('emotionBars').innerHTML = barsHtml;

    const t = texts[currentLang];
    const metricsHtml = `
        <div class="metric-item">
            <div class="metric-value">${Math.round(features.pitch)} Hz</div>
            <div class="metric-label">${t.pitch}</div>
        </div>
        <div class="metric-item">
            <div class="metric-value">${(features.energy * 1000).toFixed(1)}</div>
            <div class="metric-label">${t.energy}</div>
        </div>
        <div class="metric-item">
            <div class="metric-value">${features.duration.toFixed(1)}s</div>
            <div class="metric-label">${t.speed}</div>
        </div>
        <div class="metric-item">
            <div class="metric-value">${(features.variation * 100).toFixed(0)}%</div>
            <div class="metric-label">${t.variation}</div>
        </div>
    `;
    document.getElementById('voiceMetrics').innerHTML = metricsHtml;
}

init();
