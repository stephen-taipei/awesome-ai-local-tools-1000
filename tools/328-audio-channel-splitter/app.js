/**
 * Audio Channel Splitter - Tool #328
 * Split stereo audio into separate channels
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let leftBuffer = null;
let rightBuffer = null;

const texts = {
    zh: {
        title: '音頻聲道分離',
        subtitle: '將立體聲分離為獨立聲道',
        privacy: '100% 本地處理 · 零資料上傳',
        info: '處理後將產生左右聲道兩個獨立檔案',
        process: '🔄 分離聲道',
        result: '處理結果',
        left: '左聲道',
        right: '右聲道',
        download: '⬇️ 下載',
        upload: '拖放音頻檔案至此或點擊上傳',
        uploadHint: '支援 MP3, WAV, OGG, M4A',
        processing: '處理中...',
        monoWarning: '此檔案為單聲道，無需分離'
    },
    en: {
        title: 'Channel Splitter',
        subtitle: 'Split stereo audio into separate channels',
        privacy: '100% Local Processing · No Data Upload',
        info: 'Processing will create two separate files for left and right channels',
        process: '🔄 Split Channels',
        result: 'Result',
        left: 'Left Channel',
        right: 'Right Channel',
        download: '⬇️ Download',
        upload: 'Drop audio file here or click to upload',
        uploadHint: 'Supports MP3, WAV, OGG, M4A',
        processing: 'Processing...',
        monoWarning: 'This file is mono, no need to split'
    }
};

function init() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    setupFileUpload();
    document.getElementById('processBtn').addEventListener('click', processAudio);
    document.getElementById('downloadLeft').addEventListener('click', () => downloadChannel('left'));
    document.getElementById('downloadRight').addEventListener('click', () => downloadChannel('right'));
}

function setupFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('drag-over'); });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));
    uploadArea.addEventListener('drop', (e) => { e.preventDefault(); uploadArea.classList.remove('drag-over'); if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]); });
    fileInput.addEventListener('change', (e) => { if (e.target.files.length) handleFile(e.target.files[0]); });
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');
    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.getElementById('infoText').textContent = t.info;
    document.getElementById('processBtn').textContent = t.process;
    document.getElementById('resultTitle').textContent = t.result;
    document.getElementById('leftLabel').textContent = t.left;
    document.getElementById('rightLabel').textContent = t.right;
    document.getElementById('downloadLeft').textContent = t.download;
    document.getElementById('downloadRight').textContent = t.download;
    document.querySelector('.upload-area p').textContent = t.upload;
    document.querySelector('.upload-hint').textContent = t.uploadHint;
}

async function handleFile(file) {
    const arrayBuffer = await file.arrayBuffer();
    originalBuffer = await audioContext.decodeAudioData(arrayBuffer);
    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('audioLoaded').style.display = 'block';
    document.getElementById('fileInfo').textContent = `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
    document.getElementById('originalAudio').src = URL.createObjectURL(file);
    document.getElementById('optionsSection').style.display = 'block';
    document.getElementById('actionSection').style.display = 'flex';
}

async function processAudio() {
    if (!originalBuffer) return;

    if (originalBuffer.numberOfChannels < 2) {
        alert(texts[currentLang].monoWarning);
        return;
    }

    const processBtn = document.getElementById('processBtn');
    const originalText = processBtn.textContent;
    processBtn.textContent = texts[currentLang].processing;
    processBtn.disabled = true;
    await new Promise(resolve => setTimeout(resolve, 10));

    const sampleRate = originalBuffer.sampleRate;
    const length = originalBuffer.length;

    // Create left channel buffer
    leftBuffer = audioContext.createBuffer(1, length, sampleRate);
    leftBuffer.getChannelData(0).set(originalBuffer.getChannelData(0));

    // Create right channel buffer
    rightBuffer = audioContext.createBuffer(1, length, sampleRate);
    rightBuffer.getChannelData(0).set(originalBuffer.getChannelData(1));

    // Create audio URLs
    const leftBlob = bufferToWav(leftBuffer);
    const rightBlob = bufferToWav(rightBuffer);

    document.getElementById('resultSection').style.display = 'block';
    document.getElementById('leftAudio').src = URL.createObjectURL(leftBlob);
    document.getElementById('rightAudio').src = URL.createObjectURL(rightBlob);

    processBtn.textContent = originalText;
    processBtn.disabled = false;
}

function downloadChannel(channel) {
    const buffer = channel === 'left' ? leftBuffer : rightBuffer;
    if (!buffer) return;
    const blob = bufferToWav(buffer);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${channel}-channel.wav`;
    a.click();
}

function bufferToWav(buffer) {
    const numChannels = buffer.numberOfChannels, sampleRate = buffer.sampleRate;
    const bytesPerSample = 2, blockAlign = numChannels * bytesPerSample;
    const dataSize = buffer.length * blockAlign, bufferSize = 44 + dataSize;
    const arrayBuffer = new ArrayBuffer(bufferSize);
    const view = new DataView(arrayBuffer);
    const writeString = (o, s) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); };
    writeString(0, 'RIFF'); view.setUint32(4, bufferSize - 8, true); writeString(8, 'WAVE'); writeString(12, 'fmt ');
    view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true); view.setUint16(34, 16, true); writeString(36, 'data'); view.setUint32(40, dataSize, true);
    const channels = []; for (let i = 0; i < numChannels; i++) channels.push(buffer.getChannelData(i));
    let offset = 44;
    for (let i = 0; i < buffer.length; i++) { for (let ch = 0; ch < numChannels; ch++) { view.setInt16(offset, Math.max(-1, Math.min(1, channels[ch][i])) * 32767, true); offset += 2; } }
    return new Blob([arrayBuffer], { type: 'audio/wav' });
}

init();
