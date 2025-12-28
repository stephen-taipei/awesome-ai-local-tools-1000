/**
 * Voice Age Estimation - Tool #229
 * Estimate speaker age from voice characteristics
 */

let currentLang = 'zh';
let audioContext = null;
let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;
let audioBuffer = null;

const ageGroups = [
    { range: '0-12', zh: '兒童', en: 'Child', midAge: 8 },
    { range: '13-19', zh: '青少年', en: 'Teen', midAge: 16 },
    { range: '20-35', zh: '青年', en: 'Young Adult', midAge: 27 },
    { range: '36-50', zh: '中年', en: 'Middle Age', midAge: 43 },
    { range: '51-65', zh: '中老年', en: 'Senior', midAge: 58 },
    { range: '65+', zh: '老年', en: 'Elderly', midAge: 72 }
];

const texts = {
    zh: {
        title: '語音年齡估計',
        subtitle: '根據語音估計說話者年齡',
        privacy: '100% 本地處理 · 零資料上傳',
        record: '點擊開始錄音',
        recording: '錄音中... 點擊停止',
        hint: '建議錄製 3-5 秒',
        upload: '上傳音訊檔案',
        analyze: '估計年齡',
        years: '歲',
        distribution: '年齡分布機率',
        indicators: '語音指標',
        pitch: '音調穩定度',
        clarity: '清晰度',
        energy: '能量',
        tremor: '顫抖度'
    },
    en: {
        title: 'Voice Age Estimation',
        subtitle: 'Estimate speaker age from voice',
        privacy: '100% Local Processing · No Data Upload',
        record: 'Click to start recording',
        recording: 'Recording... Click to stop',
        hint: 'Record 3-5 seconds',
        upload: 'Upload audio file',
        analyze: 'Estimate Age',
        years: 'years',
        distribution: 'Age Distribution',
        indicators: 'Voice Indicators',
        pitch: 'Pitch Stability',
        clarity: 'Clarity',
        energy: 'Energy',
        tremor: 'Tremor'
    }
};

function init() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));

    document.getElementById('recordArea').addEventListener('click', toggleRecording);
    document.getElementById('uploadBtn').addEventListener('click', () => document.getElementById('audioInput').click());
    document.getElementById('audioInput').addEventListener('change', handleFileUpload);
    document.getElementById('analyzeBtn').addEventListener('click', analyzeAge);
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
    document.querySelector('.age-label').textContent = t.years;
}

async function toggleRecording() {
    if (isRecording) stopRecording();
    else startRecording();
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

        document.getElementById('recordArea').classList.add('recording');
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

    document.getElementById('recordArea').classList.remove('recording');
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

function analyzeAge() {
    if (!audioBuffer) return;

    const features = extractFeatures(audioBuffer);
    const ageResult = estimateAge(features);

    displayResults(ageResult, features);
}

function extractFeatures(buffer) {
    const data = buffer.getChannelData(0);
    const sampleRate = buffer.sampleRate;

    const frameSize = 2048;
    const hopSize = 512;
    const numFrames = Math.floor((data.length - frameSize) / hopSize);

    let totalEnergy = 0, energyVariance = 0;
    const pitchValues = [], energyValues = [];

    for (let frame = 0; frame < numFrames; frame++) {
        const start = frame * hopSize;
        const frameData = data.slice(start, start + frameSize);

        let energy = 0;
        for (let i = 0; i < frameData.length; i++) {
            energy += frameData[i] * frameData[i];
        }
        energyValues.push(energy);
        totalEnergy += energy;

        const pitch = estimateFramePitch(frameData, sampleRate);
        if (pitch > 0) pitchValues.push(pitch);
    }

    const avgEnergy = totalEnergy / numFrames;
    const meanEnergy = energyValues.reduce((a, b) => a + b, 0) / energyValues.length;
    for (const e of energyValues) energyVariance += Math.pow(e - meanEnergy, 2);
    energyVariance = Math.sqrt(energyVariance / energyValues.length);

    const avgPitch = pitchValues.length > 0 ? pitchValues.reduce((a, b) => a + b, 0) / pitchValues.length : 150;
    let pitchVariance = 0;
    for (const p of pitchValues) pitchVariance += Math.pow(p - avgPitch, 2);
    pitchVariance = pitchValues.length > 0 ? Math.sqrt(pitchVariance / pitchValues.length) : 0;

    return {
        pitch: avgPitch,
        pitchStability: 1 - Math.min(1, pitchVariance / 50),
        energy: avgEnergy,
        energyVariation: energyVariance / (meanEnergy + 0.001),
        clarity: Math.min(1, avgEnergy * 100),
        tremor: Math.min(1, pitchVariance / 30)
    };
}

function estimateFramePitch(frameData, sampleRate) {
    const minPeriod = Math.floor(sampleRate / 400);
    const maxPeriod = Math.floor(sampleRate / 60);

    let bestCorr = 0, bestPeriod = 0;
    for (let period = minPeriod; period < maxPeriod; period++) {
        let corr = 0;
        for (let i = 0; i < frameData.length - period; i++) {
            corr += frameData[i] * frameData[i + period];
        }
        if (corr > bestCorr) { bestCorr = corr; bestPeriod = period; }
    }

    return bestPeriod > 0 ? sampleRate / bestPeriod : 0;
}

function estimateAge(features) {
    const { pitch, pitchStability, tremor, energy } = features;

    let ageScore = 30;

    if (pitch > 250) ageScore -= 15;
    else if (pitch > 200) ageScore -= 5;
    else if (pitch < 120) ageScore += 10;
    else if (pitch < 100) ageScore += 20;

    if (pitchStability < 0.6) ageScore += 15;
    if (tremor > 0.5) ageScore += 10;
    if (energy < 0.005) ageScore += 5;

    ageScore = Math.max(5, Math.min(80, ageScore));

    const groupProbs = ageGroups.map(group => {
        const diff = Math.abs(group.midAge - ageScore);
        return {
            ...group,
            probability: Math.exp(-diff / 15)
        };
    });

    const totalProb = groupProbs.reduce((sum, g) => sum + g.probability, 0);
    groupProbs.forEach(g => g.probability /= totalProb);

    const bestGroup = groupProbs.reduce((a, b) => a.probability > b.probability ? a : b);

    return {
        estimatedAge: ageScore,
        ageRange: bestGroup.range,
        groupProbs
    };
}

function displayResults(result, features) {
    const t = texts[currentLang];
    document.getElementById('resultSection').style.display = 'block';

    document.getElementById('ageRange').textContent = result.ageRange;
    document.querySelector('.age-groups h3').textContent = t.distribution;
    document.querySelector('.voice-indicators h3').textContent = t.indicators;

    const meterPos = (result.estimatedAge / 85) * 100;
    document.getElementById('meterIndicator').style.left = meterPos + '%';

    const groupsHtml = result.groupProbs.map(g => `
        <div class="group-item">
            <span class="group-label">${g[currentLang]} (${g.range})</span>
            <div class="group-bar">
                <div class="group-fill" style="width: ${g.probability * 100}%"></div>
            </div>
            <span class="group-percent">${Math.round(g.probability * 100)}%</span>
        </div>
    `).join('');
    document.getElementById('ageGroups').innerHTML = groupsHtml;

    const indicatorsHtml = `
        <div class="indicator-item">
            <div class="indicator-value">${Math.round(features.pitchStability * 100)}%</div>
            <div class="indicator-label">${t.pitch}</div>
        </div>
        <div class="indicator-item">
            <div class="indicator-value">${Math.round(features.clarity * 100)}%</div>
            <div class="indicator-label">${t.clarity}</div>
        </div>
        <div class="indicator-item">
            <div class="indicator-value">${(features.energy * 1000).toFixed(1)}</div>
            <div class="indicator-label">${t.energy}</div>
        </div>
        <div class="indicator-item">
            <div class="indicator-value">${Math.round(features.tremor * 100)}%</div>
            <div class="indicator-label">${t.tremor}</div>
        </div>
    `;
    document.getElementById('indicators').innerHTML = indicatorsHtml;
}

init();
