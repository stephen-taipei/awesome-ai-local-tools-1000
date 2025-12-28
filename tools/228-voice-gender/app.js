/**
 * Voice Gender Detection - Tool #228
 * Detect speaker gender from voice using pitch analysis
 */

let currentLang = 'zh';
let audioContext = null;
let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;
let audioBuffer = null;

const texts = {
    zh: {
        title: '語音性別辨識',
        subtitle: '根據語音辨識說話者性別',
        privacy: '100% 本地處理 · 零資料上傳',
        record: '點擊開始錄音',
        recording: '錄音中... 點擊停止',
        hint: '建議錄製 2-5 秒',
        or: '或',
        upload: '上傳音訊檔案',
        analyze: '分析性別',
        male: '男性',
        female: '女性',
        confidence: '信心度',
        features: '語音特徵',
        pitch: '基頻',
        formant: '共振峰',
        timbre: '音色',
        low: '低',
        midLow: '中低',
        mid: '中',
        midHigh: '中高',
        high: '高',
        deep: '渾厚',
        warm: '溫暖',
        bright: '明亮',
        clear: '清亮'
    },
    en: {
        title: 'Voice Gender Detection',
        subtitle: 'Detect speaker gender from voice',
        privacy: '100% Local Processing · No Data Upload',
        record: 'Click to start recording',
        recording: 'Recording... Click to stop',
        hint: 'Record 2-5 seconds',
        or: 'or',
        upload: 'Upload audio file',
        analyze: 'Analyze Gender',
        male: 'Male',
        female: 'Female',
        confidence: 'Confidence',
        features: 'Voice Features',
        pitch: 'Pitch',
        formant: 'Formant',
        timbre: 'Timbre',
        low: 'Low',
        midLow: 'Mid-Low',
        mid: 'Mid',
        midHigh: 'Mid-High',
        high: 'High',
        deep: 'Deep',
        warm: 'Warm',
        bright: 'Bright',
        clear: 'Clear'
    }
};

function init() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));

    document.getElementById('recordArea').addEventListener('click', toggleRecording);
    document.getElementById('uploadBtn').addEventListener('click', () => document.getElementById('audioInput').click());
    document.getElementById('audioInput').addEventListener('change', handleFileUpload);
    document.getElementById('analyzeBtn').addEventListener('click', analyzeGender);
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
    document.querySelector('.upload-option span').textContent = t.or;
    document.getElementById('uploadBtn').textContent = t.upload;
    document.getElementById('analyzeBtn').textContent = t.analyze;
    document.querySelector('.voice-features h3').textContent = t.features;

    const labels = document.querySelectorAll('.feature-label');
    labels[0].textContent = t.pitch;
    labels[1].textContent = t.formant;
    labels[2].textContent = t.timbre;
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

function analyzeGender() {
    if (!audioBuffer) return;

    const pitch = estimatePitch(audioBuffer);
    const result = classifyGender(pitch);

    displayResults(result, pitch);
}

function estimatePitch(buffer) {
    const data = buffer.getChannelData(0);
    const sampleRate = buffer.sampleRate;

    const minPeriod = Math.floor(sampleRate / 400);
    const maxPeriod = Math.floor(sampleRate / 60);

    let bestCorr = 0, bestPeriod = 0;

    for (let period = minPeriod; period < maxPeriod; period++) {
        let corr = 0;
        for (let i = 0; i < 2048; i++) {
            if (i + period < data.length) {
                corr += data[i] * data[i + period];
            }
        }
        if (corr > bestCorr) {
            bestCorr = corr;
            bestPeriod = period;
        }
    }

    return bestPeriod > 0 ? sampleRate / bestPeriod : 150;
}

function classifyGender(pitch) {
    const maleMean = 120;
    const femaleMean = 220;
    const std = 30;

    const maleProb = Math.exp(-Math.pow(pitch - maleMean, 2) / (2 * std * std));
    const femaleProb = Math.exp(-Math.pow(pitch - femaleMean, 2) / (2 * std * std));

    const total = maleProb + femaleProb;
    const malePercent = maleProb / total;
    const femalePercent = femaleProb / total;

    return {
        gender: malePercent > femalePercent ? 'male' : 'female',
        malePercent,
        femalePercent,
        confidence: Math.max(malePercent, femalePercent)
    };
}

function displayResults(result, pitch) {
    const t = texts[currentLang];
    document.getElementById('resultSection').style.display = 'block';

    const isMale = result.gender === 'male';
    document.getElementById('genderIcon').textContent = isMale ? '👨' : '👩';
    document.getElementById('genderLabel').textContent = isMale ? t.male : t.female;
    document.getElementById('confidence').textContent = `${t.confidence}: ${Math.round(result.confidence * 100)}%`;

    document.getElementById('maleBar').style.width = (result.malePercent * 100) + '%';
    document.getElementById('femaleBar').style.width = (result.femalePercent * 100) + '%';
    document.getElementById('malePercent').textContent = Math.round(result.malePercent * 100) + '%';
    document.getElementById('femalePercent').textContent = Math.round(result.femalePercent * 100) + '%';

    document.querySelector('.prob-item:first-child .prob-label').textContent = `👨 ${t.male}`;
    document.querySelector('.prob-item:last-child .prob-label').textContent = `👩 ${t.female}`;

    document.getElementById('pitchValue').textContent = Math.round(pitch) + ' Hz';

    let formant, timbre;
    if (pitch < 100) { formant = t.low; timbre = t.deep; }
    else if (pitch < 150) { formant = t.midLow; timbre = t.deep; }
    else if (pitch < 180) { formant = t.mid; timbre = t.warm; }
    else if (pitch < 220) { formant = t.midHigh; timbre = t.bright; }
    else { formant = t.high; timbre = t.clear; }

    document.getElementById('formantValue').textContent = formant;
    document.getElementById('timbreValue').textContent = timbre;
}

init();
