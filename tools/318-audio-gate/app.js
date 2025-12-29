/**
 * Audio Gate - Tool #318
 * Noise gate to eliminate background noise
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let processedBuffer = null;

const texts = {
    zh: {
        title: '音頻門限',
        subtitle: '消除靜音段落的背景噪音',
        privacy: '100% 本地處理 · 零資料上傳',
        threshold: '閾值',
        attack: '起音',
        hold: '保持',
        release: '釋放',
        range: '範圍',
        process: '🔄 處理音頻',
        download: '⬇️ 下載',
        result: '處理結果',
        upload: '拖放音頻檔案至此或點擊上傳',
        uploadHint: '支援 MP3, WAV, OGG, M4A',
        processing: '處理中...'
    },
    en: {
        title: 'Gate',
        subtitle: 'Eliminate background noise in quiet sections',
        privacy: '100% Local Processing · No Data Upload',
        threshold: 'Threshold',
        attack: 'Attack',
        hold: 'Hold',
        release: 'Release',
        range: 'Range',
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
    document.getElementById('hold').addEventListener('input', (e) => { document.getElementById('holdValue').textContent = e.target.value + ' ms'; });
    document.getElementById('release').addEventListener('input', (e) => { document.getElementById('releaseValue').textContent = e.target.value + ' ms'; });
    document.getElementById('range').addEventListener('input', (e) => { document.getElementById('rangeValue').textContent = e.target.value + ' dB'; });
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
    labels[2].textContent = t.hold;
    labels[3].textContent = t.release;
    labels[4].textContent = t.range;
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
    const holdMs = parseFloat(document.getElementById('hold').value);
    const releaseMs = parseFloat(document.getElementById('release').value);
    const rangeDB = parseFloat(document.getElementById('range').value);

    const sampleRate = originalBuffer.sampleRate;
    const channels = originalBuffer.numberOfChannels;
    const length = originalBuffer.length;

    const threshold = dBToLinear(thresholdDB);
    const rangeGain = dBToLinear(rangeDB);
    const attackCoef = Math.exp(-1 / (sampleRate * attackMs / 1000));
    const releaseCoef = Math.exp(-1 / (sampleRate * releaseMs / 1000));
    const holdSamples = Math.floor(sampleRate * holdMs / 1000);

    processedBuffer = audioContext.createBuffer(channels, length, sampleRate);

    // First pass: detect signal level across all channels
    const levelBuffer = new Float32Array(length);
    for (let ch = 0; ch < channels; ch++) {
        const inputData = originalBuffer.getChannelData(ch);
        for (let i = 0; i < length; i++) {
            const sample = Math.abs(inputData[i]);
            if (sample > levelBuffer[i]) levelBuffer[i] = sample;
        }
    }

    // Calculate gate envelope with attack, hold, release
    const gateBuffer = new Float32Array(length);
    let gateOpen = false;
    let holdCounter = 0;
    let envelope = 0;

    for (let i = 0; i < length; i++) {
        const level = levelBuffer[i];

        if (level > threshold) {
            gateOpen = true;
            holdCounter = holdSamples;
        } else if (holdCounter > 0) {
            holdCounter--;
        } else {
            gateOpen = false;
        }

        // Smooth the gate
        const targetGain = gateOpen ? 1 : rangeGain;
        if (targetGain > envelope) {
            envelope = attackCoef * envelope + (1 - attackCoef) * targetGain;
        } else {
            envelope = releaseCoef * envelope + (1 - releaseCoef) * targetGain;
        }

        gateBuffer[i] = envelope;
    }

    // Apply gate to all channels
    for (let ch = 0; ch < channels; ch++) {
        const inputData = originalBuffer.getChannelData(ch);
        const outputData = processedBuffer.getChannelData(ch);
        for (let i = 0; i < length; i++) {
            outputData[i] = inputData[i] * gateBuffer[i];
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
    a.download = 'gated-audio.wav';
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
