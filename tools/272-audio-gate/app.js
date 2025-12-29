/**
 * Audio Gate - Tool #272
 * Apply noise gate effect to audio
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let sourceNode = null;
let isPlaying = false;
let fileName = '';

const texts = {
    zh: {
        title: '音訊閘門',
        subtitle: '移除低於臨界值的音訊',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '點擊或拖放音訊檔案',
        uploadHint: '支援 MP3, WAV, OGG 等格式',
        threshold: '臨界值',
        attack: '起音時間',
        release: '釋放時間',
        range: '衰減量',
        preview: '▶️ 預覽',
        stop: '⏹️ 停止',
        download: '⬇️ 下載'
    },
    en: {
        title: 'Audio Gate',
        subtitle: 'Remove audio below threshold',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Click or drop audio file',
        uploadHint: 'Supports MP3, WAV, OGG formats',
        threshold: 'Threshold',
        attack: 'Attack',
        release: 'Release',
        range: 'Range',
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

    document.getElementById('thresholdSlider').addEventListener('input', (e) => {
        document.getElementById('thresholdValue').textContent = e.target.value + ' dB';
    });

    document.getElementById('attackSlider').addEventListener('input', (e) => {
        document.getElementById('attackValue').textContent = e.target.value + ' ms';
    });

    document.getElementById('releaseSlider').addEventListener('input', (e) => {
        document.getElementById('releaseValue').textContent = e.target.value + ' ms';
    });

    document.getElementById('rangeSlider').addEventListener('input', (e) => {
        document.getElementById('rangeValue').textContent = e.target.value + ' dB';
    });

    document.getElementById('previewBtn').addEventListener('click', togglePreview);
    document.getElementById('downloadBtn').addEventListener('click', downloadGated);
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

    document.querySelectorAll('.option-group label')[0].textContent = t.threshold;
    document.querySelectorAll('.option-group label')[1].textContent = t.attack;
    document.querySelectorAll('.option-group label')[2].textContent = t.release;
    document.querySelectorAll('.option-group label')[3].textContent = t.range;

    document.getElementById('previewBtn').textContent = isPlaying ? t.stop : t.preview;
    document.getElementById('downloadBtn').textContent = t.download;
}

async function handleFile(file) {
    fileName = file.name.replace(/\.[^/.]+$/, '');

    const arrayBuffer = await file.arrayBuffer();
    originalBuffer = await audioContext.decodeAudioData(arrayBuffer);

    document.getElementById('editorSection').style.display = 'block';
}

function applyGate(buffer) {
    const thresholdDb = parseFloat(document.getElementById('thresholdSlider').value);
    const attackMs = parseFloat(document.getElementById('attackSlider').value);
    const releaseMs = parseFloat(document.getElementById('releaseSlider').value);
    const rangeDb = parseFloat(document.getElementById('rangeSlider').value);

    const threshold = Math.pow(10, thresholdDb / 20);
    const range = Math.pow(10, rangeDb / 20);
    const sampleRate = buffer.sampleRate;
    const attackCoeff = Math.exp(-1 / (attackMs * sampleRate / 1000));
    const releaseCoeff = Math.exp(-1 / (releaseMs * sampleRate / 1000));

    const outputBuffer = audioContext.createBuffer(buffer.numberOfChannels, buffer.length, sampleRate);

    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
        const input = buffer.getChannelData(ch);
        const output = outputBuffer.getChannelData(ch);

        let envelope = 0;
        let gateGain = range; // Start closed

        for (let i = 0; i < buffer.length; i++) {
            const absInput = Math.abs(input[i]);

            // Envelope follower
            if (absInput > envelope) {
                envelope = absInput;
            } else {
                envelope = envelope * 0.9995;
            }

            // Gate state
            const targetGain = envelope > threshold ? 1 : range;

            // Smooth gain transition
            if (targetGain > gateGain) {
                // Opening (attack)
                gateGain = gateGain * attackCoeff + targetGain * (1 - attackCoeff);
            } else {
                // Closing (release)
                gateGain = gateGain * releaseCoeff + targetGain * (1 - releaseCoeff);
            }

            output[i] = input[i] * gateGain;
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

    const gatedBuffer = applyGate(originalBuffer);

    sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = gatedBuffer;
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

async function downloadGated() {
    if (!originalBuffer) return;

    const gatedBuffer = applyGate(originalBuffer);
    const wavBlob = bufferToWav(gatedBuffer);

    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}-gated.wav`;
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
