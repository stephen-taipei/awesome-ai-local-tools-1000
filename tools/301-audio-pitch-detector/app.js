/**
 * Audio Pitch Detector - Tool #301
 * Real-time pitch detection
 */

let currentLang = 'zh';
let audioContext = null;
let analyser = null;
let mediaStream = null;
let isDetecting = false;
let animationId = null;
let detectionHistory = [];

const noteStrings = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const texts = {
    zh: {
        title: '音高偵測器',
        subtitle: '即時偵測音頻音高',
        privacy: '100% 本地處理 · 零資料上傳',
        mic: '麥克風',
        file: '檔案',
        startMic: '🎤 開始偵測',
        stopMic: '⏹️ 停止偵測',
        analyze: '▶️ 分析音高',
        history: '偵測歷史',
        upload: '拖放音頻檔案至此或點擊上傳',
        uploadHint: '支援 MP3, WAV, OGG, M4A'
    },
    en: {
        title: 'Pitch Detector',
        subtitle: 'Real-time pitch detection',
        privacy: '100% Local Processing · No Data Upload',
        mic: 'Microphone',
        file: 'File',
        startMic: '🎤 Start Detection',
        stopMic: '⏹️ Stop Detection',
        analyze: '▶️ Analyze Pitch',
        history: 'Detection History',
        upload: 'Drop audio file here or click to upload',
        uploadHint: 'Supports MP3, WAV, OGG, M4A'
    }
};

function init() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));

    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const mode = btn.dataset.mode;
            document.getElementById('micSection').style.display = mode === 'mic' ? 'block' : 'none';
            document.getElementById('fileSection').style.display = mode === 'file' ? 'block' : 'none';
            if (isDetecting) stopDetection();
        });
    });

    document.getElementById('startMicBtn').addEventListener('click', toggleMicDetection);
    document.getElementById('analyzeBtn').addEventListener('click', analyzeFile);

    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) handleFile(e.target.files[0]);
    });
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');

    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;

    document.querySelectorAll('.mode-name')[0].textContent = t.mic;
    document.querySelectorAll('.mode-name')[1].textContent = t.file;

    document.getElementById('startMicBtn').textContent = isDetecting ? t.stopMic : t.startMic;
    document.getElementById('analyzeBtn').textContent = t.analyze;
    document.getElementById('historyTitle').textContent = t.history;

    document.querySelector('.upload-area p').textContent = t.upload;
    document.querySelector('.upload-hint').textContent = t.uploadHint;
}

function handleFile(file) {
    const url = URL.createObjectURL(file);
    const audioPlayer = document.getElementById('audioPlayer');
    audioPlayer.src = url;
    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('audioControls').style.display = 'flex';
}

async function toggleMicDetection() {
    if (isDetecting) {
        stopDetection();
    } else {
        await startMicDetection();
    }
}

async function startMicDetection() {
    try {
        await audioContext.resume();
        mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

        const source = audioContext.createMediaStreamSource(mediaStream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;

        source.connect(analyser);

        isDetecting = true;
        document.getElementById('startMicBtn').textContent = texts[currentLang].stopMic;
        document.getElementById('startMicBtn').classList.add('btn-stop');

        detectPitch();
    } catch (err) {
        console.error('Microphone access denied:', err);
    }
}

function stopDetection() {
    isDetecting = false;
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
    }
    document.getElementById('startMicBtn').textContent = texts[currentLang].startMic;
    document.getElementById('startMicBtn').classList.remove('btn-stop');

    document.getElementById('noteName').textContent = '--';
    document.getElementById('frequency').textContent = '-- Hz';
    document.getElementById('cents').textContent = '-- cents';
    document.getElementById('meterIndicator').style.left = '50%';
}

function detectPitch() {
    if (!isDetecting) return;

    const buffer = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(buffer);

    const frequency = autoCorrelate(buffer, audioContext.sampleRate);

    if (frequency > 0) {
        updateDisplay(frequency);
    }

    animationId = requestAnimationFrame(detectPitch);
}

function autoCorrelate(buffer, sampleRate) {
    // Check if signal has enough energy
    let rms = 0;
    for (let i = 0; i < buffer.length; i++) {
        rms += buffer[i] * buffer[i];
    }
    rms = Math.sqrt(rms / buffer.length);
    if (rms < 0.01) return -1;

    // Find first zero crossing
    let r1 = 0, r2 = buffer.length - 1;
    const threshold = 0.2;
    for (let i = 0; i < buffer.length / 2; i++) {
        if (Math.abs(buffer[i]) < threshold) {
            r1 = i;
            break;
        }
    }
    for (let i = 1; i < buffer.length / 2; i++) {
        if (Math.abs(buffer[buffer.length - i]) < threshold) {
            r2 = buffer.length - i;
            break;
        }
    }

    const trimmedBuffer = buffer.slice(r1, r2);
    const size = trimmedBuffer.length;

    // Autocorrelation
    const correlations = new Array(size).fill(0);
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size - i; j++) {
            correlations[i] += trimmedBuffer[j] * trimmedBuffer[j + i];
        }
    }

    // Find peak
    let d = 0;
    while (correlations[d] > correlations[d + 1]) d++;

    let maxVal = -1, maxPos = -1;
    for (let i = d; i < size; i++) {
        if (correlations[i] > maxVal) {
            maxVal = correlations[i];
            maxPos = i;
        }
    }

    let t0 = maxPos;

    // Parabolic interpolation
    const x1 = correlations[t0 - 1];
    const x2 = correlations[t0];
    const x3 = correlations[t0 + 1];
    const a = (x1 + x3 - 2 * x2) / 2;
    const b = (x3 - x1) / 2;
    if (a) t0 = t0 - b / (2 * a);

    return sampleRate / t0;
}

function frequencyToNote(frequency) {
    const noteNum = 12 * (Math.log2(frequency / 440));
    return Math.round(noteNum) + 69;
}

function noteToFrequency(note) {
    return 440 * Math.pow(2, (note - 69) / 12);
}

function updateDisplay(frequency) {
    const noteNum = frequencyToNote(frequency);
    const noteName = noteStrings[noteNum % 12];
    const octave = Math.floor(noteNum / 12) - 1;
    const exactFreq = noteToFrequency(noteNum);
    const cents = Math.round(1200 * Math.log2(frequency / exactFreq));

    document.getElementById('noteName').textContent = noteName + octave;
    document.getElementById('frequency').textContent = frequency.toFixed(1) + ' Hz';

    const centsDisplay = document.getElementById('cents');
    const centsText = cents >= 0 ? `+${cents}` : `${cents}`;
    centsDisplay.textContent = centsText + ' cents';

    const isInTune = Math.abs(cents) < 5;
    centsDisplay.classList.toggle('in-tune', isInTune);

    // Update meter
    const meterIndicator = document.getElementById('meterIndicator');
    const position = 50 + (cents / 50) * 50;
    meterIndicator.style.left = Math.max(0, Math.min(100, position)) + '%';
    meterIndicator.classList.toggle('in-tune', isInTune);

    // Add to history
    const noteString = noteName + octave;
    if (!detectionHistory.includes(noteString)) {
        detectionHistory.unshift(noteString);
        if (detectionHistory.length > 20) detectionHistory.pop();
        updateHistory();
    }
}

function updateHistory() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = detectionHistory.map(note =>
        `<span class="history-item">${note}</span>`
    ).join('');
}

async function analyzeFile() {
    const audioPlayer = document.getElementById('audioPlayer');
    if (!audioPlayer.src) return;

    await audioContext.resume();

    const response = await fetch(audioPlayer.src);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // Analyze a portion of the audio
    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;

    // Analyze from the middle of the file
    const startSample = Math.floor(channelData.length / 4);
    const analyzeLength = Math.min(4096, channelData.length - startSample);
    const buffer = channelData.slice(startSample, startSample + analyzeLength);

    const frequency = autoCorrelate(buffer, sampleRate);

    if (frequency > 0) {
        updateDisplay(frequency);
    }
}

init();
