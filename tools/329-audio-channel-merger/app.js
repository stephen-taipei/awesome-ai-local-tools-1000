/**
 * Audio Channel Merger - Tool #329
 * Merge two mono files into stereo
 */

let currentLang = 'zh';
let audioContext = null;
let leftBuffer = null;
let rightBuffer = null;
let processedBuffer = null;

const texts = {
    zh: {
        title: '音頻聲道合併',
        subtitle: '將兩個單聲道合併為立體聲',
        privacy: '100% 本地處理 · 零資料上傳',
        left: '左聲道',
        right: '右聲道',
        clickUpload: '點擊上傳',
        process: '🔄 合併聲道',
        download: '⬇️ 下載',
        result: '處理結果',
        processing: '處理中...'
    },
    en: {
        title: 'Channel Merger',
        subtitle: 'Merge two mono files into stereo',
        privacy: '100% Local Processing · No Data Upload',
        left: 'Left Channel',
        right: 'Right Channel',
        clickUpload: 'Click to upload',
        process: '🔄 Merge Channels',
        download: '⬇️ Download',
        result: 'Result',
        processing: 'Processing...'
    }
};

function init() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    setupFileUpload();
    document.getElementById('processBtn').addEventListener('click', processAudio);
    document.getElementById('downloadBtn').addEventListener('click', downloadAudio);
}

function setupFileUpload() {
    const leftUpload = document.getElementById('leftUpload');
    const rightUpload = document.getElementById('rightUpload');
    const leftInput = document.getElementById('leftInput');
    const rightInput = document.getElementById('rightInput');

    leftUpload.addEventListener('click', () => leftInput.click());
    rightUpload.addEventListener('click', () => rightInput.click());

    leftInput.addEventListener('change', (e) => {
        if (e.target.files.length) handleFile(e.target.files[0], 'left');
    });
    rightInput.addEventListener('change', (e) => {
        if (e.target.files.length) handleFile(e.target.files[0], 'right');
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
    document.getElementById('leftUploadText').textContent = t.left;
    document.getElementById('rightUploadText').textContent = t.right;
    if (!leftBuffer) document.getElementById('leftFileName').textContent = t.clickUpload;
    if (!rightBuffer) document.getElementById('rightFileName').textContent = t.clickUpload;
    document.getElementById('processBtn').textContent = t.process;
    document.getElementById('downloadBtn').textContent = t.download;
    document.getElementById('resultTitle').textContent = t.result;
}

async function handleFile(file, channel) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = await audioContext.decodeAudioData(arrayBuffer);

    if (channel === 'left') {
        leftBuffer = buffer;
        document.getElementById('leftUpload').classList.add('loaded');
        document.getElementById('leftFileName').textContent = file.name;
    } else {
        rightBuffer = buffer;
        document.getElementById('rightUpload').classList.add('loaded');
        document.getElementById('rightFileName').textContent = file.name;
    }

    if (leftBuffer && rightBuffer) {
        document.getElementById('actionSection').style.display = 'flex';
    }
}

async function processAudio() {
    if (!leftBuffer || !rightBuffer) return;

    const processBtn = document.getElementById('processBtn');
    const originalText = processBtn.textContent;
    processBtn.textContent = texts[currentLang].processing;
    processBtn.disabled = true;
    await new Promise(resolve => setTimeout(resolve, 10));

    // Use the higher sample rate and longer duration
    const sampleRate = Math.max(leftBuffer.sampleRate, rightBuffer.sampleRate);
    const length = Math.max(leftBuffer.length, rightBuffer.length);

    processedBuffer = audioContext.createBuffer(2, length, sampleRate);

    // Get left channel data (use first channel if stereo)
    const leftData = leftBuffer.getChannelData(0);
    const rightData = rightBuffer.getChannelData(0);

    const leftOut = processedBuffer.getChannelData(0);
    const rightOut = processedBuffer.getChannelData(1);

    // Copy data, padding with zeros if needed
    for (let i = 0; i < length; i++) {
        leftOut[i] = i < leftData.length ? leftData[i] : 0;
        rightOut[i] = i < rightData.length ? rightData[i] : 0;
    }

    const blob = bufferToWav(processedBuffer);
    document.getElementById('resultSection').style.display = 'block';
    document.getElementById('processedAudio').src = URL.createObjectURL(blob);
    document.getElementById('downloadBtn').disabled = false;
    processBtn.textContent = originalText;
    processBtn.disabled = false;
}

function downloadAudio() {
    if (!processedBuffer) return;
    const blob = bufferToWav(processedBuffer);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'merged-stereo.wav';
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
