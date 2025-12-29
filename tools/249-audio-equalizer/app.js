/**
 * Audio Equalizer - Tool #249
 * 10-band audio equalizer
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let sourceNode = null;
let isPlaying = false;
let fileName = '';

const bands = [
    { freq: 32, label: '32' },
    { freq: 64, label: '64' },
    { freq: 125, label: '125' },
    { freq: 250, label: '250' },
    { freq: 500, label: '500' },
    { freq: 1000, label: '1K' },
    { freq: 2000, label: '2K' },
    { freq: 4000, label: '4K' },
    { freq: 8000, label: '8K' },
    { freq: 16000, label: '16K' }
];

const presets = {
    flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    bass: [8, 6, 4, 2, 0, 0, 0, 0, 0, 0],
    treble: [0, 0, 0, 0, 0, 2, 4, 6, 8, 8],
    vocal: [-2, -2, 0, 4, 6, 6, 4, 2, 0, -2],
    rock: [5, 4, 2, 0, -2, 0, 2, 4, 5, 5],
    jazz: [3, 2, 0, 2, -2, -2, 0, 2, 3, 4]
};

const texts = {
    zh: {
        title: '音訊等化器',
        subtitle: '10 頻段等化器調整音色',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '點擊或拖放音訊檔案',
        uploadHint: '支援 MP3, WAV, OGG 等格式',
        presets: '預設',
        flat: '平坦',
        bass: '低音增強',
        treble: '高音增強',
        vocal: '人聲',
        rock: '搖滾',
        jazz: '爵士',
        reset: '🔄 重置',
        preview: '▶️ 預覽',
        stop: '⏹️ 停止',
        download: '⬇️ 下載'
    },
    en: {
        title: 'Audio Equalizer',
        subtitle: '10-band equalizer for tone adjustment',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Click or drop audio file',
        uploadHint: 'Supports MP3, WAV, OGG formats',
        presets: 'Presets',
        flat: 'Flat',
        bass: 'Bass Boost',
        treble: 'Treble Boost',
        vocal: 'Vocal',
        rock: 'Rock',
        jazz: 'Jazz',
        reset: '🔄 Reset',
        preview: '▶️ Preview',
        stop: '⏹️ Stop',
        download: '⬇️ Download'
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

    // Create EQ bands
    createEQBands();

    // Presets
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const preset = presets[btn.dataset.preset];
            if (preset) {
                applyPreset(preset);
                document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            }
        });
    });

    document.getElementById('resetBtn').addEventListener('click', () => {
        applyPreset(presets.flat);
        document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('[data-preset="flat"]').classList.add('active');
    });

    document.getElementById('previewBtn').addEventListener('click', togglePreview);
    document.getElementById('downloadBtn').addEventListener('click', downloadEQ);
}

function createEQBands() {
    const container = document.getElementById('eqBands');
    container.innerHTML = bands.map((band, i) => `
        <div class="eq-band">
            <div class="value" id="value-${i}">0 dB</div>
            <div class="slider-container">
                <input type="range" id="band-${i}" min="-12" max="12" step="1" value="0">
            </div>
            <div class="freq">${band.label}</div>
        </div>
    `).join('');

    // Add event listeners
    bands.forEach((_, i) => {
        document.getElementById(`band-${i}`).addEventListener('input', (e) => {
            document.getElementById(`value-${i}`).textContent = e.target.value + ' dB';
        });
    });
}

function applyPreset(values) {
    values.forEach((val, i) => {
        document.getElementById(`band-${i}`).value = val;
        document.getElementById(`value-${i}`).textContent = val + ' dB';
    });
}

function getEQValues() {
    return bands.map((_, i) => parseFloat(document.getElementById(`band-${i}`).value));
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

    document.querySelector('.presets-section > label').textContent = t.presets;
    const presetBtns = document.querySelectorAll('.preset-btn');
    presetBtns[0].textContent = t.flat;
    presetBtns[1].textContent = t.bass;
    presetBtns[2].textContent = t.treble;
    presetBtns[3].textContent = t.vocal;
    presetBtns[4].textContent = t.rock;
    presetBtns[5].textContent = t.jazz;

    document.getElementById('resetBtn').textContent = t.reset;
    document.getElementById('previewBtn').textContent = isPlaying ? t.stop : t.preview;
    document.getElementById('downloadBtn').textContent = t.download;
}

async function handleFile(file) {
    fileName = file.name.replace(/\.[^/.]+$/, '');

    const arrayBuffer = await file.arrayBuffer();
    originalBuffer = await audioContext.decodeAudioData(arrayBuffer);

    document.getElementById('editorSection').style.display = 'block';
}

function applyEQ(buffer, eqValues) {
    // Create offline context for processing
    const offlineCtx = new OfflineAudioContext(
        buffer.numberOfChannels,
        buffer.length,
        buffer.sampleRate
    );

    // Create source
    const source = offlineCtx.createBufferSource();
    source.buffer = buffer;

    // Create filter chain
    let lastNode = source;
    const filters = [];

    bands.forEach((band, i) => {
        const filter = offlineCtx.createBiquadFilter();
        filter.type = 'peaking';
        filter.frequency.value = band.freq;
        filter.Q.value = 1.4;
        filter.gain.value = eqValues[i];

        lastNode.connect(filter);
        lastNode = filter;
        filters.push(filter);
    });

    lastNode.connect(offlineCtx.destination);
    source.start(0);

    return offlineCtx.startRendering();
}

function togglePreview() {
    if (isPlaying) {
        stopPreview();
    } else {
        startPreview();
    }
}

async function startPreview() {
    if (!originalBuffer) return;

    await audioContext.resume();
    isPlaying = true;
    document.getElementById('previewBtn').textContent = texts[currentLang].stop;

    const eqValues = getEQValues();
    const eqBuffer = await applyEQ(originalBuffer, eqValues);

    sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = eqBuffer;
    sourceNode.connect(audioContext.destination);

    sourceNode.onended = () => {
        isPlaying = false;
        document.getElementById('previewBtn').textContent = texts[currentLang].preview;
    };

    sourceNode.start(0);
}

function stopPreview() {
    if (sourceNode) {
        sourceNode.stop();
        sourceNode = null;
    }
    isPlaying = false;
    document.getElementById('previewBtn').textContent = texts[currentLang].preview;
}

async function downloadEQ() {
    if (!originalBuffer) return;

    const eqValues = getEQValues();
    const eqBuffer = await applyEQ(originalBuffer, eqValues);
    const wavBlob = bufferToWav(eqBuffer);

    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}-eq.wav`;
    a.click();
    URL.revokeObjectURL(url);
}

function bufferToWav(buffer) {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1;
    const bitDepth = 16;

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;

    const samples = buffer.length;
    const dataSize = samples * blockAlign;
    const bufferSize = 44 + dataSize;

    const arrayBuffer = new ArrayBuffer(bufferSize);
    const view = new DataView(arrayBuffer);

    const writeString = (offset, string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, bufferSize - 8, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    const channels = [];
    for (let i = 0; i < numChannels; i++) {
        channels.push(buffer.getChannelData(i));
    }

    let offset = 44;
    for (let i = 0; i < samples; i++) {
        for (let ch = 0; ch < numChannels; ch++) {
            const sample = Math.max(-1, Math.min(1, channels[ch][i]));
            view.setInt16(offset, sample * 32767, true);
            offset += 2;
        }
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
}

init();
