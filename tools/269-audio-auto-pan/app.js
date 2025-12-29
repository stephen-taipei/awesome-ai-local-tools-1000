/**
 * Audio Auto-Pan - Tool #269
 * Add auto-pan effect to audio
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let sourceNode = null;
let isPlaying = false;
let fileName = '';

const texts = {
    zh: {
        title: '音訊自動聲像',
        subtitle: '為音訊添加自動左右聲道移動效果',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '點擊或拖放音訊檔案',
        uploadHint: '支援 MP3, WAV, OGG 等格式',
        rate: '移動速率',
        depth: '移動範圍',
        waveform: '波形',
        preview: '▶️ 預覽',
        stop: '⏹️ 停止',
        download: '⬇️ 下載',
        sine: '正弦波',
        triangle: '三角波',
        square: '方波'
    },
    en: {
        title: 'Audio Auto-Pan',
        subtitle: 'Add auto-pan effect to audio',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Click or drop audio file',
        uploadHint: 'Supports MP3, WAV, OGG formats',
        rate: 'Rate',
        depth: 'Depth',
        waveform: 'Waveform',
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
        document.getElementById('rateValue').textContent = parseFloat(e.target.value).toFixed(1) + ' Hz';
    });

    document.getElementById('depthSlider').addEventListener('input', (e) => {
        document.getElementById('depthValue').textContent = e.target.value + '%';
    });

    document.getElementById('previewBtn').addEventListener('click', togglePreview);
    document.getElementById('downloadBtn').addEventListener('click', downloadAutoPan);
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
            return Math.sin(phase);
        case 'triangle':
            const normalized = (phase % (2 * Math.PI)) / (2 * Math.PI);
            return 4 * Math.abs(normalized - 0.5) - 1;
        case 'square':
            return Math.sin(phase) >= 0 ? 1 : -1;
        default:
            return Math.sin(phase);
    }
}

function applyAutoPan(buffer) {
    const rate = parseFloat(document.getElementById('rateSlider').value);
    const depth = parseInt(document.getElementById('depthSlider').value) / 100;
    const waveform = document.getElementById('waveformSelect').value;

    const sampleRate = buffer.sampleRate;

    // Always output stereo
    const outputBuffer = audioContext.createBuffer(2, buffer.length, sampleRate);

    // Get mono signal (mix all input channels)
    const mono = new Float32Array(buffer.length);
    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
        const channelData = buffer.getChannelData(ch);
        for (let i = 0; i < buffer.length; i++) {
            mono[i] += channelData[i] / buffer.numberOfChannels;
        }
    }

    const leftOutput = outputBuffer.getChannelData(0);
    const rightOutput = outputBuffer.getChannelData(1);

    for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const phase = 2 * Math.PI * rate * t;

        // LFO value from -1 to 1
        const lfo = getLFO(phase, waveform);

        // Pan position from -1 (left) to 1 (right)
        const pan = lfo * depth;

        // Equal power panning
        const leftGain = Math.cos((pan + 1) * Math.PI / 4);
        const rightGain = Math.sin((pan + 1) * Math.PI / 4);

        leftOutput[i] = mono[i] * leftGain;
        rightOutput[i] = mono[i] * rightGain;
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

    const panBuffer = applyAutoPan(originalBuffer);

    sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = panBuffer;
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

async function downloadAutoPan() {
    if (!originalBuffer) return;

    const panBuffer = applyAutoPan(originalBuffer);
    const wavBlob = bufferToWav(panBuffer);

    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}-autopan.wav`;
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
