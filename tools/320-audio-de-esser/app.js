/**
 * Audio De-Esser - Tool #320
 * Reduce sibilance in vocals
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let processedBuffer = null;

const texts = {
    zh: {
        title: '音頻去齒音',
        subtitle: '減少人聲中的齒音',
        privacy: '100% 本地處理 · 零資料上傳',
        frequency: '頻率',
        bandwidth: '頻寬',
        threshold: '閾值',
        ratio: '比率',
        amount: '強度',
        process: '🔄 處理音頻',
        download: '⬇️ 下載',
        result: '處理結果',
        upload: '拖放音頻檔案至此或點擊上傳',
        uploadHint: '支援 MP3, WAV, OGG, M4A',
        processing: '處理中...'
    },
    en: {
        title: 'De-Esser',
        subtitle: 'Reduce sibilance in vocals',
        privacy: '100% Local Processing · No Data Upload',
        frequency: 'Frequency',
        bandwidth: 'Bandwidth',
        threshold: 'Threshold',
        ratio: 'Ratio',
        amount: 'Amount',
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
    document.getElementById('frequency').addEventListener('input', (e) => { document.getElementById('frequencyValue').textContent = e.target.value + ' Hz'; });
    document.getElementById('bandwidth').addEventListener('input', (e) => { document.getElementById('bandwidthValue').textContent = e.target.value + ' oct'; });
    document.getElementById('threshold').addEventListener('input', (e) => { document.getElementById('thresholdValue').textContent = e.target.value + ' dB'; });
    document.getElementById('ratio').addEventListener('input', (e) => { document.getElementById('ratioValue').textContent = e.target.value + ':1'; });
    document.getElementById('amount').addEventListener('input', (e) => { document.getElementById('amountValue').textContent = e.target.value + '%'; });
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
    labels[0].textContent = t.frequency;
    labels[1].textContent = t.bandwidth;
    labels[2].textContent = t.threshold;
    labels[3].textContent = t.ratio;
    labels[4].textContent = t.amount;
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

// Biquad bandpass filter coefficients
function calculateBandpassCoeffs(sampleRate, centerFreq, bandwidth) {
    const omega = 2 * Math.PI * centerFreq / sampleRate;
    const sinOmega = Math.sin(omega);
    const cosOmega = Math.cos(omega);
    const alpha = sinOmega * Math.sinh(Math.log(2) / 2 * bandwidth * omega / sinOmega);

    const b0 = alpha;
    const b1 = 0;
    const b2 = -alpha;
    const a0 = 1 + alpha;
    const a1 = -2 * cosOmega;
    const a2 = 1 - alpha;

    return {
        b0: b0 / a0,
        b1: b1 / a0,
        b2: b2 / a0,
        a1: a1 / a0,
        a2: a2 / a0
    };
}

// Apply biquad filter
function applyBiquad(input, coeffs) {
    const output = new Float32Array(input.length);
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0;

    for (let i = 0; i < input.length; i++) {
        const x0 = input[i];
        output[i] = coeffs.b0 * x0 + coeffs.b1 * x1 + coeffs.b2 * x2 - coeffs.a1 * y1 - coeffs.a2 * y2;
        x2 = x1;
        x1 = x0;
        y2 = y1;
        y1 = output[i];
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

    const centerFreq = parseFloat(document.getElementById('frequency').value);
    const bandwidth = parseFloat(document.getElementById('bandwidth').value);
    const thresholdDB = parseFloat(document.getElementById('threshold').value);
    const ratio = parseFloat(document.getElementById('ratio').value);
    const amount = parseFloat(document.getElementById('amount').value) / 100;

    const sampleRate = originalBuffer.sampleRate;
    const channels = originalBuffer.numberOfChannels;
    const length = originalBuffer.length;

    const threshold = dBToLinear(thresholdDB);
    const coeffs = calculateBandpassCoeffs(sampleRate, centerFreq, bandwidth);

    // Fast attack, medium release for sibilance detection
    const attackCoef = Math.exp(-1 / (sampleRate * 0.001)); // 1ms attack
    const releaseCoef = Math.exp(-1 / (sampleRate * 0.05)); // 50ms release

    processedBuffer = audioContext.createBuffer(channels, length, sampleRate);

    for (let ch = 0; ch < channels; ch++) {
        const inputData = originalBuffer.getChannelData(ch);
        const outputData = processedBuffer.getChannelData(ch);

        // Extract sibilant band
        const sibilantBand = applyBiquad(inputData, coeffs);

        // Calculate sibilance envelope and gain reduction
        let envelope = 0;

        for (let i = 0; i < length; i++) {
            const sibilantLevel = Math.abs(sibilantBand[i]);

            // Envelope follower for sibilant band
            if (sibilantLevel > envelope) {
                envelope = attackCoef * envelope + (1 - attackCoef) * sibilantLevel;
            } else {
                envelope = releaseCoef * envelope + (1 - releaseCoef) * sibilantLevel;
            }

            // Calculate gain reduction
            let gain = 1;
            if (envelope > threshold) {
                // Compress only the sibilant frequencies
                const overRatio = envelope / threshold;
                const targetRatio = 1 + (overRatio - 1) / ratio;
                gain = targetRatio / overRatio;
            }

            // Apply gain reduction weighted by amount
            const finalGain = 1 - amount * (1 - gain);

            // Apply to the sibilant band, mix with original
            const processed = inputData[i] - sibilantBand[i] * (1 - finalGain);
            outputData[i] = processed;
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
    a.download = 'de-essed-audio.wav';
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
