/**
 * Audio Limiter - Tool #317
 * Peak limiting to prevent clipping
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let processedBuffer = null;

const texts = {
    zh: {
        title: '音頻限制器',
        subtitle: '防止音頻削波的峰值限制',
        privacy: '100% 本地處理 · 零資料上傳',
        threshold: '閾值',
        attack: '起音',
        release: '釋放',
        lookahead: '預視',
        process: '🔄 處理音頻',
        download: '⬇️ 下載',
        result: '處理結果',
        upload: '拖放音頻檔案至此或點擊上傳',
        uploadHint: '支援 MP3, WAV, OGG, M4A',
        processing: '處理中...'
    },
    en: {
        title: 'Limiter',
        subtitle: 'Peak limiting to prevent clipping',
        privacy: '100% Local Processing · No Data Upload',
        threshold: 'Threshold',
        attack: 'Attack',
        release: 'Release',
        lookahead: 'Lookahead',
        process: '🔄 Process',
        download: '⬇️ Download',
        result: 'Result',
        upload: 'Drop audio file here or click to upload',
        uploadHint: 'Supports MP3, WAV, OGG, M4A',
        processing: 'Processing...'
    }
};

function init() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    setupFileUpload();
    setupSliders();
    document.getElementById('processBtn').addEventListener('click', processAudio);
    document.getElementById('downloadBtn').addEventListener('click', downloadAudio);
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

function setupSliders() {
    document.getElementById('threshold').addEventListener('input', (e) => { document.getElementById('thresholdValue').textContent = e.target.value + ' dB'; });
    document.getElementById('attack').addEventListener('input', (e) => { document.getElementById('attackValue').textContent = e.target.value + ' ms'; });
    document.getElementById('release').addEventListener('input', (e) => { document.getElementById('releaseValue').textContent = e.target.value + ' ms'; });
    document.getElementById('lookahead').addEventListener('input', (e) => { document.getElementById('lookaheadValue').textContent = e.target.value + ' ms'; });
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');
    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    const labels = document.querySelectorAll('.option-group label');
    labels[0].textContent = t.threshold;
    labels[1].textContent = t.attack;
    labels[2].textContent = t.release;
    labels[3].textContent = t.lookahead;
    document.getElementById('processBtn').textContent = t.process;
    document.getElementById('downloadBtn').textContent = t.download;
    document.getElementById('resultTitle').textContent = t.result;
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

function dBToLinear(dB) { return Math.pow(10, dB / 20); }

async function processAudio() {
    if (!originalBuffer) return;
    const processBtn = document.getElementById('processBtn');
    const originalText = processBtn.textContent;
    processBtn.textContent = texts[currentLang].processing;
    processBtn.disabled = true;
    await new Promise(resolve => setTimeout(resolve, 10));

    const thresholdDB = parseFloat(document.getElementById('threshold').value);
    const attackMs = parseFloat(document.getElementById('attack').value);
    const releaseMs = parseFloat(document.getElementById('release').value);
    const lookaheadMs = parseFloat(document.getElementById('lookahead').value);

    const sampleRate = originalBuffer.sampleRate;
    const channels = originalBuffer.numberOfChannels;
    const length = originalBuffer.length;

    const threshold = dBToLinear(thresholdDB);
    const attackCoef = Math.exp(-1 / (sampleRate * attackMs / 1000));
    const releaseCoef = Math.exp(-1 / (sampleRate * releaseMs / 1000));
    const lookaheadSamples = Math.floor(sampleRate * lookaheadMs / 1000);

    processedBuffer = audioContext.createBuffer(channels, length, sampleRate);

    // First pass: find peaks with lookahead
    const peakBuffer = new Float32Array(length);
    for (let ch = 0; ch < channels; ch++) {
        const inputData = originalBuffer.getChannelData(ch);
        for (let i = 0; i < length; i++) {
            const sample = Math.abs(inputData[i]);
            if (sample > peakBuffer[i]) peakBuffer[i] = sample;
        }
    }

    // Apply lookahead - spread peak detection forward
    for (let i = length - 1; i >= 0; i--) {
        const end = Math.min(i + lookaheadSamples, length);
        for (let j = i + 1; j < end; j++) {
            if (peakBuffer[j] > peakBuffer[i]) {
                peakBuffer[i] = peakBuffer[j];
            }
        }
    }

    // Calculate gain reduction
    const gainBuffer = new Float32Array(length);
    let envelope = 0;

    for (let i = 0; i < length; i++) {
        const peak = peakBuffer[i];

        // Envelope follower
        if (peak > envelope) {
            envelope = attackCoef * envelope + (1 - attackCoef) * peak;
        } else {
            envelope = releaseCoef * envelope + (1 - releaseCoef) * peak;
        }

        // Calculate gain (hard limiting - infinite ratio)
        if (envelope > threshold) {
            gainBuffer[i] = threshold / envelope;
        } else {
            gainBuffer[i] = 1;
        }
    }

    // Apply gain to all channels
    for (let ch = 0; ch < channels; ch++) {
        const inputData = originalBuffer.getChannelData(ch);
        const outputData = processedBuffer.getChannelData(ch);
        for (let i = 0; i < length; i++) {
            outputData[i] = inputData[i] * gainBuffer[i];
        }
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
    a.download = 'limited-audio.wav';
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
