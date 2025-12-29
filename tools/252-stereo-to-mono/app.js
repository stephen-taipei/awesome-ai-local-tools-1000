/**
 * Stereo to Mono - Tool #252
 * Convert stereo audio to mono
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let monoBuffer = null;
let sourceNode = null;
let isPlaying = false;
let fileName = '';

const texts = {
    zh: {
        title: '立體聲轉單聲道',
        subtitle: '將立體聲音訊轉換為單聲道',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '點擊或拖放立體聲音訊',
        uploadHint: '支援 MP3, WAV, OGG 等格式',
        leftChannel: '左聲道',
        rightChannel: '右聲道',
        monoChannel: '單聲道',
        mixMode: '混合方式',
        average: '平均混合',
        left: '僅左聲道',
        right: '僅右聲道',
        max: '最大值',
        originalChannels: '原始聲道',
        duration: '時長',
        preview: '▶️ 預覽',
        stop: '⏹️ 停止',
        download: '⬇️ 下載單聲道'
    },
    en: {
        title: 'Stereo to Mono',
        subtitle: 'Convert stereo audio to mono',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Click or drop stereo audio',
        uploadHint: 'Supports MP3, WAV, OGG formats',
        leftChannel: 'Left Channel',
        rightChannel: 'Right Channel',
        monoChannel: 'Mono',
        mixMode: 'Mix Mode',
        average: 'Average',
        left: 'Left Only',
        right: 'Right Only',
        max: 'Maximum',
        originalChannels: 'Original Channels',
        duration: 'Duration',
        preview: '▶️ Preview',
        stop: '⏹️ Stop',
        download: '⬇️ Download Mono'
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

    document.getElementById('mixMode').addEventListener('change', () => {
        if (originalBuffer) processAudio();
    });

    document.getElementById('previewBtn').addEventListener('click', togglePreview);
    document.getElementById('downloadBtn').addEventListener('click', downloadMono);
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

    document.querySelectorAll('.channel-label')[0].textContent = t.leftChannel;
    document.querySelectorAll('.channel-label')[1].textContent = t.rightChannel;
    document.querySelectorAll('.channel-label')[2].textContent = t.monoChannel;

    document.querySelector('.option-group label').textContent = t.mixMode;
    const mixSelect = document.getElementById('mixMode');
    mixSelect.options[0].text = t.average;
    mixSelect.options[1].text = t.left;
    mixSelect.options[2].text = t.right;
    mixSelect.options[3].text = t.max;

    document.querySelectorAll('.info-label')[0].textContent = t.originalChannels;
    document.querySelectorAll('.info-label')[1].textContent = t.duration;

    document.getElementById('previewBtn').textContent = isPlaying ? t.stop : t.preview;
    document.getElementById('downloadBtn').textContent = t.download;
}

async function handleFile(file) {
    fileName = file.name.replace(/\.[^/.]+$/, '');

    const arrayBuffer = await file.arrayBuffer();
    originalBuffer = await audioContext.decodeAudioData(arrayBuffer);

    document.getElementById('originalChannels').textContent = originalBuffer.numberOfChannels;
    document.getElementById('duration').textContent = formatTime(originalBuffer.duration);

    drawChannels();
    processAudio();
    document.getElementById('editorSection').style.display = 'block';
}

function drawChannels() {
    const leftCanvas = document.getElementById('leftCanvas');
    const rightCanvas = document.getElementById('rightCanvas');

    if (originalBuffer.numberOfChannels >= 2) {
        drawWaveform(leftCanvas, originalBuffer.getChannelData(0), '#14b8a6');
        drawWaveform(rightCanvas, originalBuffer.getChannelData(1), '#14b8a6');
    } else {
        drawWaveform(leftCanvas, originalBuffer.getChannelData(0), '#14b8a6');
        drawWaveform(rightCanvas, originalBuffer.getChannelData(0), '#64748b');
    }
}

function drawWaveform(canvas, data, color) {
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = 60 * 2;
    ctx.scale(2, 2);

    const width = canvas.offsetWidth;
    const height = 60;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;

    const step = Math.ceil(data.length / width);
    for (let i = 0; i < width; i++) {
        let min = 1, max = -1;
        for (let j = 0; j < step; j++) {
            const idx = i * step + j;
            if (idx < data.length) {
                min = Math.min(min, data[idx]);
                max = Math.max(max, data[idx]);
            }
        }
        const y1 = (1 - max) * height / 2;
        const y2 = (1 - min) * height / 2;
        ctx.moveTo(i, y1);
        ctx.lineTo(i, y2);
    }
    ctx.stroke();
}

function processAudio() {
    const mode = document.getElementById('mixMode').value;
    monoBuffer = convertToMono(originalBuffer, mode);
    drawWaveform(document.getElementById('monoCanvas'), monoBuffer.getChannelData(0), '#2dd4bf');
}

function convertToMono(buffer, mode) {
    const mono = audioContext.createBuffer(1, buffer.length, buffer.sampleRate);
    const output = mono.getChannelData(0);

    const left = buffer.getChannelData(0);
    const right = buffer.numberOfChannels >= 2 ? buffer.getChannelData(1) : left;

    for (let i = 0; i < buffer.length; i++) {
        switch (mode) {
            case 'average':
                output[i] = (left[i] + right[i]) / 2;
                break;
            case 'left':
                output[i] = left[i];
                break;
            case 'right':
                output[i] = right[i];
                break;
            case 'max':
                output[i] = Math.abs(left[i]) > Math.abs(right[i]) ? left[i] : right[i];
                break;
        }
    }

    return mono;
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function togglePreview() {
    if (isPlaying) {
        stopPreview();
    } else {
        startPreview();
    }
}

function startPreview() {
    if (!monoBuffer) return;

    audioContext.resume();
    isPlaying = true;

    sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = monoBuffer;
    sourceNode.connect(audioContext.destination);

    sourceNode.onended = () => {
        isPlaying = false;
        document.getElementById('previewBtn').textContent = texts[currentLang].preview;
    };

    sourceNode.start(0);
    document.getElementById('previewBtn').textContent = texts[currentLang].stop;
}

function stopPreview() {
    if (sourceNode) {
        sourceNode.stop();
        sourceNode = null;
    }
    isPlaying = false;
    document.getElementById('previewBtn').textContent = texts[currentLang].preview;
}

function downloadMono() {
    if (!monoBuffer) return;

    const wavBlob = bufferToWav(monoBuffer);

    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}-mono.wav`;
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
