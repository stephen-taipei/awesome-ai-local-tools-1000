/**
 * Audio BPM Detector - Tool #296
 * Detect BPM from audio files
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let sourceNode = null;
let isPlaying = false;
let tapTimes = [];

const texts = {
    zh: {
        title: '音訊節拍偵測',
        subtitle: '偵測音訊的BPM（每分鐘節拍數）',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '點擊或拖放音訊檔案',
        uploadHint: '支援 MP3, WAV, OGG 等格式',
        tempoType: '節奏類型',
        danceType: '適合舞蹈',
        play: '▶️ 播放',
        stop: '⏹️ 停止',
        tap: '👆 手動打拍',
        manualBpm: '手動BPM',
        verySlow: '很慢',
        slow: '慢',
        moderate: '中等',
        fast: '快',
        veryFast: '很快',
        waltz: '華爾滋',
        hiphop: '嘻哈',
        house: '浩室',
        techno: '鐵克諾',
        dnb: '鼓打貝斯'
    },
    en: {
        title: 'BPM Detector',
        subtitle: 'Detect audio BPM (beats per minute)',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Click or drop audio file',
        uploadHint: 'Supports MP3, WAV, OGG formats',
        tempoType: 'Tempo Type',
        danceType: 'Dance Style',
        play: '▶️ Play',
        stop: '⏹️ Stop',
        tap: '👆 Tap Tempo',
        manualBpm: 'Manual BPM',
        verySlow: 'Very Slow',
        slow: 'Slow',
        moderate: 'Moderate',
        fast: 'Fast',
        veryFast: 'Very Fast',
        waltz: 'Waltz',
        hiphop: 'Hip Hop',
        house: 'House',
        techno: 'Techno',
        dnb: 'Drum & Bass'
    }
};

function init() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));

    const uploadArea = document.getElementById('uploadArea');
    const audioInput = document.getElementById('audioInput');

    uploadArea.addEventListener('click', () => audioInput.click());
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
    });
    audioInput.addEventListener('change', (e) => {
        if (e.target.files.length) handleFile(e.target.files[0]);
    });

    document.getElementById('playBtn').addEventListener('click', togglePlay);
    document.getElementById('tapBtn').addEventListener('click', handleTap);
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');

    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;

    document.querySelector('.upload-text').textContent = t.upload;
    document.querySelector('.upload-hint').textContent = t.uploadHint;

    document.querySelectorAll('.info-label')[0].textContent = t.tempoType;
    document.querySelectorAll('.info-label')[1].textContent = t.danceType;

    document.getElementById('playBtn').textContent = isPlaying ? t.stop : t.play;
    document.getElementById('tapBtn').textContent = t.tap;
}

async function handleFile(file) {
    const arrayBuffer = await file.arrayBuffer();
    originalBuffer = await audioContext.decodeAudioData(arrayBuffer);

    document.getElementById('resultSection').style.display = 'block';

    // Analyze BPM
    const bpm = detectBPM(originalBuffer);
    displayBPM(bpm);
}

function detectBPM(buffer) {
    // Simple beat detection using energy peaks
    const data = buffer.getChannelData(0);
    const sampleRate = buffer.sampleRate;

    // Downsample for faster processing
    const downsampleFactor = 4;
    const downsampled = [];
    for (let i = 0; i < data.length; i += downsampleFactor) {
        let sum = 0;
        for (let j = 0; j < downsampleFactor && i + j < data.length; j++) {
            sum += Math.abs(data[i + j]);
        }
        downsampled.push(sum / downsampleFactor);
    }

    const effectiveSampleRate = sampleRate / downsampleFactor;

    // Calculate energy in windows
    const windowSize = Math.floor(effectiveSampleRate * 0.02); // 20ms windows
    const energies = [];
    for (let i = 0; i < downsampled.length - windowSize; i += windowSize) {
        let energy = 0;
        for (let j = 0; j < windowSize; j++) {
            energy += downsampled[i + j] * downsampled[i + j];
        }
        energies.push(energy);
    }

    // Find peaks
    const peaks = [];
    const threshold = energies.reduce((a, b) => a + b, 0) / energies.length * 1.5;

    for (let i = 1; i < energies.length - 1; i++) {
        if (energies[i] > energies[i - 1] && energies[i] > energies[i + 1] && energies[i] > threshold) {
            peaks.push(i);
        }
    }

    // Calculate intervals between peaks
    const intervals = [];
    for (let i = 1; i < peaks.length; i++) {
        intervals.push(peaks[i] - peaks[i - 1]);
    }

    if (intervals.length === 0) {
        return 120; // Default BPM
    }

    // Get most common interval
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const windowDuration = windowSize / effectiveSampleRate;
    const beatInterval = avgInterval * windowDuration;

    let bpm = 60 / beatInterval;

    // Normalize to reasonable range (60-180 BPM)
    while (bpm < 60) bpm *= 2;
    while (bpm > 180) bpm /= 2;

    return Math.round(bpm);
}

function displayBPM(bpm) {
    document.getElementById('bpmValue').textContent = bpm;

    const t = texts[currentLang];

    // Tempo type
    let tempoType;
    if (bpm < 70) tempoType = t.verySlow;
    else if (bpm < 100) tempoType = t.slow;
    else if (bpm < 120) tempoType = t.moderate;
    else if (bpm < 150) tempoType = t.fast;
    else tempoType = t.veryFast;

    document.getElementById('tempoType').textContent = tempoType;

    // Dance type
    let danceType;
    if (bpm < 90) danceType = t.waltz;
    else if (bpm < 115) danceType = t.hiphop;
    else if (bpm < 135) danceType = t.house;
    else if (bpm < 160) danceType = t.techno;
    else danceType = t.dnb;

    document.getElementById('danceType').textContent = danceType;
}

function togglePlay() {
    if (isPlaying) {
        stopPlayback();
    } else {
        startPlayback();
    }
}

async function startPlayback() {
    if (!originalBuffer) return;

    await audioContext.resume();
    isPlaying = true;
    document.getElementById('playBtn').textContent = texts[currentLang].stop;

    sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = originalBuffer;
    sourceNode.connect(audioContext.destination);

    sourceNode.onended = () => {
        isPlaying = false;
        document.getElementById('playBtn').textContent = texts[currentLang].play;
    };

    sourceNode.start(0);
}

function stopPlayback() {
    if (sourceNode) {
        sourceNode.stop();
        sourceNode = null;
    }
    isPlaying = false;
    document.getElementById('playBtn').textContent = texts[currentLang].play;
}

function handleTap() {
    const now = Date.now();
    tapTimes.push(now);

    // Keep only last 8 taps
    if (tapTimes.length > 8) {
        tapTimes.shift();
    }

    // Reset if too long between taps
    if (tapTimes.length >= 2) {
        const lastInterval = tapTimes[tapTimes.length - 1] - tapTimes[tapTimes.length - 2];
        if (lastInterval > 3000) {
            tapTimes = [now];
        }
    }

    if (tapTimes.length >= 2) {
        document.getElementById('tapDisplay').style.display = 'block';

        // Calculate average interval
        let totalInterval = 0;
        for (let i = 1; i < tapTimes.length; i++) {
            totalInterval += tapTimes[i] - tapTimes[i - 1];
        }
        const avgInterval = totalInterval / (tapTimes.length - 1);
        const bpm = Math.round(60000 / avgInterval);

        document.getElementById('tapBpm').textContent = bpm;
    }
}

init();
