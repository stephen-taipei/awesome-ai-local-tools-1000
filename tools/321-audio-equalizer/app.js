/**
 * Audio Equalizer - Tool #321
 * 5-band graphic equalizer
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let processedBuffer = null;

const BANDS = [60, 250, 1000, 4000, 12000];

const texts = {
    zh: {
        title: '音頻均衡器',
        subtitle: '5 頻段圖形均衡器',
        privacy: '100% 本地處理 · 零資料上傳',
        reset: '重置',
        process: '🔄 處理音頻',
        download: '⬇️ 下載',
        result: '處理結果',
        upload: '拖放音頻檔案至此或點擊上傳',
        uploadHint: '支援 MP3, WAV, OGG, M4A',
        processing: '處理中...'
    },
    en: {
        title: 'Equalizer',
        subtitle: '5-band graphic equalizer',
        privacy: '100% Local Processing · No Data Upload',
        reset: 'Reset',
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
    document.getElementById('resetBtn').addEventListener('click', resetEQ);
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
    for (let i = 1; i <= 5; i++) {
        document.getElementById(`band${i}`).addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            document.getElementById(`band${i}Value`).textContent = (val >= 0 ? '+' : '') + val + ' dB';
        });
    }
}

function resetEQ() {
    for (let i = 1; i <= 5; i++) {
        document.getElementById(`band${i}`).value = 0;
        document.getElementById(`band${i}Value`).textContent = '0 dB';
    }
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');
    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.getElementById('resetBtn').textContent = t.reset;
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

// Peaking EQ filter coefficients
function calculatePeakingCoeffs(sampleRate, freq, gainDB, Q) {
    const A = Math.sqrt(dBToLinear(gainDB));
    const omega = 2 * Math.PI * freq / sampleRate;
    const sinOmega = Math.sin(omega);
    const cosOmega = Math.cos(omega);
    const alpha = sinOmega / (2 * Q);

    const b0 = 1 + alpha * A;
    const b1 = -2 * cosOmega;
    const b2 = 1 - alpha * A;
    const a0 = 1 + alpha / A;
    const a1 = -2 * cosOmega;
    const a2 = 1 - alpha / A;

    return { b0: b0/a0, b1: b1/a0, b2: b2/a0, a1: a1/a0, a2: a2/a0 };
}

// Low shelf filter coefficients
function calculateLowShelfCoeffs(sampleRate, freq, gainDB) {
    const A = Math.sqrt(dBToLinear(gainDB));
    const omega = 2 * Math.PI * freq / sampleRate;
    const sinOmega = Math.sin(omega);
    const cosOmega = Math.cos(omega);
    const alpha = sinOmega / 2 * Math.sqrt(2);

    const b0 = A * ((A + 1) - (A - 1) * cosOmega + 2 * Math.sqrt(A) * alpha);
    const b1 = 2 * A * ((A - 1) - (A + 1) * cosOmega);
    const b2 = A * ((A + 1) - (A - 1) * cosOmega - 2 * Math.sqrt(A) * alpha);
    const a0 = (A + 1) + (A - 1) * cosOmega + 2 * Math.sqrt(A) * alpha;
    const a1 = -2 * ((A - 1) + (A + 1) * cosOmega);
    const a2 = (A + 1) + (A - 1) * cosOmega - 2 * Math.sqrt(A) * alpha;

    return { b0: b0/a0, b1: b1/a0, b2: b2/a0, a1: a1/a0, a2: a2/a0 };
}

// High shelf filter coefficients
function calculateHighShelfCoeffs(sampleRate, freq, gainDB) {
    const A = Math.sqrt(dBToLinear(gainDB));
    const omega = 2 * Math.PI * freq / sampleRate;
    const sinOmega = Math.sin(omega);
    const cosOmega = Math.cos(omega);
    const alpha = sinOmega / 2 * Math.sqrt(2);

    const b0 = A * ((A + 1) + (A - 1) * cosOmega + 2 * Math.sqrt(A) * alpha);
    const b1 = -2 * A * ((A - 1) + (A + 1) * cosOmega);
    const b2 = A * ((A + 1) + (A - 1) * cosOmega - 2 * Math.sqrt(A) * alpha);
    const a0 = (A + 1) - (A - 1) * cosOmega + 2 * Math.sqrt(A) * alpha;
    const a1 = 2 * ((A - 1) - (A + 1) * cosOmega);
    const a2 = (A + 1) - (A - 1) * cosOmega - 2 * Math.sqrt(A) * alpha;

    return { b0: b0/a0, b1: b1/a0, b2: b2/a0, a1: a1/a0, a2: a2/a0 };
}

function applyBiquad(input, coeffs) {
    const output = new Float32Array(input.length);
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    for (let i = 0; i < input.length; i++) {
        const x0 = input[i];
        output[i] = coeffs.b0 * x0 + coeffs.b1 * x1 + coeffs.b2 * x2 - coeffs.a1 * y1 - coeffs.a2 * y2;
        x2 = x1; x1 = x0; y2 = y1; y1 = output[i];
    }
    return output;
}

async function processAudio() {
    if (!originalBuffer) return;
    const processBtn = document.getElementById('processBtn');
    const originalText = processBtn.textContent;
    processBtn.textContent = texts[currentLang].processing;
    processBtn.disabled = true;
    await new Promise(resolve => setTimeout(resolve, 10));

    const gains = [];
    for (let i = 1; i <= 5; i++) {
        gains.push(parseFloat(document.getElementById(`band${i}`).value));
    }

    const sampleRate = originalBuffer.sampleRate;
    const channels = originalBuffer.numberOfChannels;
    const length = originalBuffer.length;

    processedBuffer = audioContext.createBuffer(channels, length, sampleRate);

    // Build filter chain
    const filters = [];
    // Band 1: Low shelf at 60Hz
    if (gains[0] !== 0) filters.push(calculateLowShelfCoeffs(sampleRate, BANDS[0], gains[0]));
    // Bands 2-4: Peaking EQ
    for (let i = 1; i <= 3; i++) {
        if (gains[i] !== 0) filters.push(calculatePeakingCoeffs(sampleRate, BANDS[i], gains[i], 1.0));
    }
    // Band 5: High shelf at 12kHz
    if (gains[4] !== 0) filters.push(calculateHighShelfCoeffs(sampleRate, BANDS[4], gains[4]));

    for (let ch = 0; ch < channels; ch++) {
        let data = originalBuffer.getChannelData(ch).slice();

        // Apply each filter in series
        for (const coeffs of filters) {
            data = applyBiquad(data, coeffs);
        }

        processedBuffer.getChannelData(ch).set(data);
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
    a.download = 'equalized-audio.wav';
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
