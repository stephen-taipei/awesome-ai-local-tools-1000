/**
 * Audio Reverser - Tool #243
 * Reverse audio playback
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let reversedBuffer = null;
let reversedBlob = null;
let fileName = '';

const texts = {
    zh: {
        title: '音訊倒放',
        subtitle: '將音訊反向播放',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '點擊或拖放音訊檔案',
        uploadHint: '支援 MP3, WAV, OGG 等格式',
        original: '原始音訊',
        reversed: '倒放音訊',
        fileName: '檔案名稱',
        duration: '時長',
        download: '⬇️ 下載倒放音訊'
    },
    en: {
        title: 'Audio Reverser',
        subtitle: 'Reverse audio playback',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Click or drop audio file',
        uploadHint: 'Supports MP3, WAV, OGG formats',
        original: 'Original Audio',
        reversed: 'Reversed Audio',
        fileName: 'File Name',
        duration: 'Duration',
        download: '⬇️ Download Reversed Audio'
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

    document.getElementById('downloadBtn').addEventListener('click', downloadReversed);
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

    document.querySelectorAll('.card-title')[0].textContent = t.original;
    document.querySelectorAll('.card-title')[1].textContent = t.reversed;

    document.querySelectorAll('.info-label')[0].textContent = t.fileName;
    document.querySelectorAll('.info-label')[1].textContent = t.duration;

    document.getElementById('downloadBtn').textContent = t.download;
}

async function handleFile(file) {
    fileName = file.name.replace(/\.[^/.]+$/, '');

    // Original audio
    const originalUrl = URL.createObjectURL(file);
    document.getElementById('originalPlayer').src = originalUrl;

    // Decode audio
    const arrayBuffer = await file.arrayBuffer();
    originalBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // Reverse the audio
    reversedBuffer = reverseAudioBuffer(originalBuffer);

    // Convert to WAV blob
    reversedBlob = bufferToWav(reversedBuffer);
    const reversedUrl = URL.createObjectURL(reversedBlob);
    document.getElementById('reversedPlayer').src = reversedUrl;

    // Update info
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('duration').textContent = formatTime(originalBuffer.duration);

    // Draw waveform
    drawWaveform();

    document.getElementById('editorSection').style.display = 'block';
}

function reverseAudioBuffer(buffer) {
    const numChannels = buffer.numberOfChannels;
    const length = buffer.length;
    const sampleRate = buffer.sampleRate;

    const reversedBuffer = audioContext.createBuffer(numChannels, length, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const inputData = buffer.getChannelData(channel);
        const outputData = reversedBuffer.getChannelData(channel);

        for (let i = 0; i < length; i++) {
            outputData[i] = inputData[length - 1 - i];
        }
    }

    return reversedBuffer;
}

function drawWaveform() {
    const canvas = document.getElementById('waveformCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = canvas.offsetWidth * 2;
    canvas.height = 100 * 2;
    ctx.scale(2, 2);

    const width = canvas.offsetWidth;
    const height = 100;
    const data = originalBuffer.getChannelData(0);
    const step = Math.ceil(data.length / width);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Draw original waveform (left half)
    ctx.beginPath();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1;

    const halfWidth = width / 2;
    for (let i = 0; i < halfWidth; i++) {
        const index = Math.floor(i * data.length / halfWidth);
        const x = i;
        const y = (1 + data[index]) * height / 2;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw reversed waveform (right half)
    ctx.beginPath();
    ctx.strokeStyle = '#8b5cf6';

    for (let i = 0; i < halfWidth; i++) {
        const index = Math.floor((halfWidth - 1 - i) * data.length / halfWidth);
        const x = halfWidth + i;
        const y = (1 + data[index]) * height / 2;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw center line
    ctx.strokeStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(halfWidth, 0);
    ctx.lineTo(halfWidth, height);
    ctx.stroke();
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function downloadReversed() {
    if (!reversedBlob) return;

    const url = URL.createObjectURL(reversedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}-reversed.wav`;
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
