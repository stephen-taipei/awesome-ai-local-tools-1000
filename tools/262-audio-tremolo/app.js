/**
 * Audio Tremolo - Tool #262
 * Add tremolo effect to audio (amplitude modulation)
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let sourceNode = null;
let isPlaying = false;
let fileName = '';

const texts = {
    zh: {
        title: '音訊顫音',
        subtitle: '為音訊添加顫音效果',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '點擊或拖放音訊檔案',
        uploadHint: '支援 MP3, WAV, OGG 等格式',
        rate: '調變速率',
        depth: '調變深度',
        waveform: '波形',
        mix: '混合比例',
        preview: '▶️ 預覽',
        stop: '⏹️ 停止',
        download: '⬇️ 下載',
        sine: '正弦波',
        triangle: '三角波',
        square: '方波'
    },
    en: {
        title: 'Audio Tremolo',
        subtitle: 'Add tremolo effect to audio',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Click or drop audio file',
        uploadHint: 'Supports MP3, WAV, OGG formats',
        rate: 'Rate',
        depth: 'Depth',
        waveform: 'Waveform',
        mix: 'Mix',
        preview: '▶️ Preview',
        stop: '⏹️ Stop',
        download: '⬇️ Download',
        sine: 'Sine',
        triangle: 'Triangle',
        square: 'Square'
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

    document.getElementById('rateSlider').addEventListener('input', (e) => {
        document.getElementById('rateValue').textContent = e.target.value + ' Hz';
    });

    document.getElementById('depthSlider').addEventListener('input', (e) => {
        document.getElementById('depthValue').textContent = e.target.value + '%';
    });

    document.getElementById('mixSlider').addEventListener('input', (e) => {
        document.getElementById('mixValue').textContent = e.target.value + '%';
    });

    document.getElementById('previewBtn').addEventListener('click', togglePreview);
    document.getElementById('downloadBtn').addEventListener('click', downloadTremolo);
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

    document.querySelectorAll('.option-group label')[0].textContent = t.rate;
    document.querySelectorAll('.option-group label')[1].textContent = t.depth;
    document.querySelectorAll('.option-group label')[2].textContent = t.waveform;
    document.querySelectorAll('.option-group label')[3].textContent = t.mix;

    const select = document.getElementById('waveformSelect');
    select.options[0].textContent = t.sine;
    select.options[1].textContent = t.triangle;
    select.options[2].textContent = t.square;

    document.getElementById('previewBtn').textContent = isPlaying ? t.stop : t.preview;
    document.getElementById('downloadBtn').textContent = t.download;
}

async function handleFile(file) {
    fileName = file.name.replace(/\.[^/.]+$/, '');

    const arrayBuffer = await file.arrayBuffer();
    originalBuffer = await audioContext.decodeAudioData(arrayBuffer);

    document.getElementById('editorSection').style.display = 'block';
}

function getLFO(phase, waveform) {
    switch (waveform) {
        case 'sine':
            return (Math.sin(phase) + 1) / 2;
        case 'triangle':
            const normalized = (phase % (2 * Math.PI)) / (2 * Math.PI);
            return normalized < 0.5 ? normalized * 2 : 2 - normalized * 2;
        case 'square':
            return Math.sin(phase) >= 0 ? 1 : 0;
        default:
            return (Math.sin(phase) + 1) / 2;
    }
}

function applyTremolo(buffer) {
    const rate = parseFloat(document.getElementById('rateSlider').value);
    const depth = parseInt(document.getElementById('depthSlider').value) / 100;
    const waveform = document.getElementById('waveformSelect').value;
    const mix = parseInt(document.getElementById('mixSlider').value) / 100;

    const sampleRate = buffer.sampleRate;
    const outputBuffer = audioContext.createBuffer(buffer.numberOfChannels, buffer.length, sampleRate);

    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
        const input = buffer.getChannelData(ch);
        const output = outputBuffer.getChannelData(ch);

        for (let i = 0; i < buffer.length; i++) {
            const t = i / sampleRate;
            const phase = 2 * Math.PI * rate * t;

            // LFO value between 0 and 1
            const lfo = getLFO(phase, waveform);

            // Tremolo: modulate amplitude
            // At depth=1, amplitude varies from 0 to 1
            // At depth=0, amplitude is constant at 1
            const modulation = 1 - depth * (1 - lfo);

            const wet = input[i] * modulation;
            const dry = input[i];

            output[i] = dry * (1 - mix) + wet * mix;
        }
    }

    return outputBuffer;
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

    const tremoloBuffer = applyTremolo(originalBuffer);

    sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = tremoloBuffer;
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

async function downloadTremolo() {
    if (!originalBuffer) return;

    const tremoloBuffer = applyTremolo(originalBuffer);
    const wavBlob = bufferToWav(tremoloBuffer);

    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}-tremolo.wav`;
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
