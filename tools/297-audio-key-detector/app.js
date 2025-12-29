/**
 * Audio Key Detector - Tool #297
 * Detect musical key from audio
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let sourceNode = null;
let isPlaying = false;

const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Major and minor key profiles (Krumhansl-Schmuckler)
const majorProfile = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const minorProfile = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];

const texts = {
    zh: {
        title: '音訊調性偵測',
        subtitle: '偵測音訊的音樂調性',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '點擊或拖放音訊檔案',
        uploadHint: '支援 MP3, WAV, OGG 等格式',
        detected: '偵測到的調性',
        distribution: '音符能量分佈',
        play: '▶️ 播放',
        stop: '⏹️ 停止',
        major: '大調',
        minor: '小調'
    },
    en: {
        title: 'Key Detector',
        subtitle: 'Detect musical key from audio',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Click or drop audio file',
        uploadHint: 'Supports MP3, WAV, OGG formats',
        detected: 'Detected Key',
        distribution: 'Note Energy Distribution',
        play: '▶️ Play',
        stop: '⏹️ Stop',
        major: 'Major',
        minor: 'Minor'
    }
};

function init() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Create chromagram bars
    const chromaBars = document.getElementById('chromaBars');
    for (let i = 0; i < 12; i++) {
        const bar = document.createElement('div');
        bar.className = 'chroma-bar';
        bar.style.height = '4px';
        chromaBars.appendChild(bar);
    }

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

    document.querySelector('.key-label').textContent = t.detected;
    document.querySelector('.chroma-label').textContent = t.distribution;

    document.getElementById('playBtn').textContent = isPlaying ? t.stop : t.play;
}

async function handleFile(file) {
    const arrayBuffer = await file.arrayBuffer();
    originalBuffer = await audioContext.decodeAudioData(arrayBuffer);

    document.getElementById('resultSection').style.display = 'block';

    // Analyze key
    const result = detectKey(originalBuffer);
    displayKey(result);
}

function detectKey(buffer) {
    const data = buffer.getChannelData(0);
    const sampleRate = buffer.sampleRate;

    // Calculate chromagram using simple frequency analysis
    const chromagram = new Array(12).fill(0);
    const fftSize = 4096;
    const hopSize = fftSize / 2;

    // Process in chunks
    for (let start = 0; start < data.length - fftSize; start += hopSize) {
        const chunk = data.slice(start, start + fftSize);

        // Apply Hanning window
        const windowed = new Float32Array(fftSize);
        for (let i = 0; i < fftSize; i++) {
            windowed[i] = chunk[i] * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / fftSize));
        }

        // Simple DFT for specific frequencies
        for (let note = 0; note < 12; note++) {
            // Check multiple octaves (2-6)
            for (let octave = 2; octave <= 6; octave++) {
                const freq = 440 * Math.pow(2, (note - 9 + (octave - 4) * 12) / 12);
                const bin = Math.round(freq * fftSize / sampleRate);

                if (bin > 0 && bin < fftSize / 2) {
                    // Goertzel algorithm approximation
                    let real = 0, imag = 0;
                    const omega = 2 * Math.PI * bin / fftSize;
                    for (let i = 0; i < fftSize; i++) {
                        real += windowed[i] * Math.cos(omega * i);
                        imag += windowed[i] * Math.sin(omega * i);
                    }
                    chromagram[note] += Math.sqrt(real * real + imag * imag);
                }
            }
        }
    }

    // Normalize chromagram
    const maxChroma = Math.max(...chromagram);
    if (maxChroma > 0) {
        for (let i = 0; i < 12; i++) {
            chromagram[i] /= maxChroma;
        }
    }

    // Find best matching key using correlation
    let bestKey = 0;
    let bestCorr = -Infinity;
    let isMinor = false;

    for (let key = 0; key < 12; key++) {
        // Rotate chromagram to match key
        const rotated = [];
        for (let i = 0; i < 12; i++) {
            rotated[i] = chromagram[(i + key) % 12];
        }

        // Correlate with major profile
        let majorCorr = 0;
        for (let i = 0; i < 12; i++) {
            majorCorr += rotated[i] * majorProfile[i];
        }

        if (majorCorr > bestCorr) {
            bestCorr = majorCorr;
            bestKey = key;
            isMinor = false;
        }

        // Correlate with minor profile
        let minorCorr = 0;
        for (let i = 0; i < 12; i++) {
            minorCorr += rotated[i] * minorProfile[i];
        }

        if (minorCorr > bestCorr) {
            bestCorr = minorCorr;
            bestKey = key;
            isMinor = true;
        }
    }

    return {
        key: bestKey,
        isMinor: isMinor,
        chromagram: chromagram
    };
}

function displayKey(result) {
    const t = texts[currentLang];
    const keyName = noteNames[result.key];
    const keyType = result.isMinor ? t.minor : t.major;

    document.getElementById('keyValue').textContent = keyName;
    document.getElementById('keyType').textContent = keyType;

    // Update chromagram visualization
    const bars = document.querySelectorAll('.chroma-bar');
    bars.forEach((bar, i) => {
        bar.style.height = Math.max(4, result.chromagram[i] * 100) + 'px';
    });
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

init();
