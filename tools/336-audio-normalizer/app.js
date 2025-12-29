/**
 * Audio Normalizer - Tool #336
 * Normalize audio levels
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let processedBuffer = null;
let originalPeak = 0;
let originalRMS = 0;

const texts = {
    zh: {
        title: '音頻正規化',
        subtitle: '調整音頻至標準音量',
        privacy: '100% 本地處理 · 零資料上傳',
        mode: '模式',
        modePeak: '峰值正規化',
        modeRMS: 'RMS 正規化',
        modeLUFS: 'LUFS 響度',
        target: '目標',
        process: '🔄 正規化',
        download: '⬇️ 下載',
        result: '處理結果',
        upload: '拖放音頻檔案至此或點擊上傳',
        uploadHint: '支援 MP3, WAV, OGG, M4A',
        processing: '處理中...',
        peakLevel: '峰值',
        rmsLevel: 'RMS',
        gainApplied: '增益調整'
    },
    en: {
        title: 'Audio Normalizer',
        subtitle: 'Normalize audio to standard levels',
        privacy: '100% Local Processing · No Data Upload',
        mode: 'Mode',
        modePeak: 'Peak Normalize',
        modeRMS: 'RMS Normalize',
        modeLUFS: 'LUFS Loudness',
        target: 'Target',
        process: '🔄 Normalize',
        download: '⬇️ Download',
        result: 'Result',
        upload: 'Drop audio file here or click to upload',
        uploadHint: 'Supports MP3, WAV, OGG, M4A',
        processing: 'Processing...',
        peakLevel: 'Peak',
        rmsLevel: 'RMS',
        gainApplied: 'Gain Applied'
    }
};

function init() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    setupFileUpload();
    setupControls();
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

function setupControls() {
    document.getElementById('targetLevel').addEventListener('input', (e) => {
        document.getElementById('targetValue').textContent = parseFloat(e.target.value).toFixed(1) + ' dB';
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
    document.getElementById('modeLabel').textContent = t.mode;
    const modeSelect = document.getElementById('normMode');
    modeSelect.options[0].text = t.modePeak;
    modeSelect.options[1].text = t.modeRMS;
    modeSelect.options[2].text = t.modeLUFS;
    document.getElementById('targetLabel').textContent = t.target;
    document.getElementById('processBtn').textContent = t.process;
    document.getElementById('downloadBtn').textContent = t.download;
    document.getElementById('resultTitle').textContent = t.result;
    document.querySelector('.upload-area p').textContent = t.upload;
    document.querySelector('.upload-hint').textContent = t.uploadHint;
    updateLevelInfo();
}

function linearToDb(linear) {
    return 20 * Math.log10(Math.max(linear, 1e-10));
}

function dbToLinear(db) {
    return Math.pow(10, db / 20);
}

function analyzeLevels(buffer) {
    let peak = 0;
    let sumSquares = 0;
    let totalSamples = 0;

    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
        const data = buffer.getChannelData(ch);
        for (let i = 0; i < data.length; i++) {
            const abs = Math.abs(data[i]);
            if (abs > peak) peak = abs;
            sumSquares += data[i] * data[i];
            totalSamples++;
        }
    }

    const rms = Math.sqrt(sumSquares / totalSamples);
    return { peak, rms };
}

function updateLevelInfo() {
    if (!originalBuffer) return;
    const t = texts[currentLang];
    const levelInfo = document.getElementById('levelInfo');
    levelInfo.innerHTML = `${t.peakLevel}: <span>${linearToDb(originalPeak).toFixed(1)} dB</span> | ${t.rmsLevel}: <span>${linearToDb(originalRMS).toFixed(1)} dB</span>`;
}

async function handleFile(file) {
    const arrayBuffer = await file.arrayBuffer();
    originalBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const levels = analyzeLevels(originalBuffer);
    originalPeak = levels.peak;
    originalRMS = levels.rms;

    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('audioLoaded').style.display = 'block';
    document.getElementById('fileInfo').textContent = `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
    document.getElementById('originalAudio').src = URL.createObjectURL(file);
    updateLevelInfo();

    document.getElementById('optionsSection').style.display = 'block';
    document.getElementById('actionSection').style.display = 'flex';
}

async function processAudio() {
    if (!originalBuffer) return;
    const processBtn = document.getElementById('processBtn');
    const originalText = processBtn.textContent;
    processBtn.textContent = texts[currentLang].processing;
    processBtn.disabled = true;
    await new Promise(resolve => setTimeout(resolve, 10));

    const mode = document.getElementById('normMode').value;
    const targetDb = parseFloat(document.getElementById('targetLevel').value);
    const targetLinear = dbToLinear(targetDb);

    let currentLevel;
    switch (mode) {
        case 'peak':
            currentLevel = originalPeak;
            break;
        case 'rms':
            currentLevel = originalRMS;
            break;
        case 'lufs':
            // Simplified LUFS approximation (actual LUFS requires K-weighting filter)
            currentLevel = originalRMS * 1.1; // Rough approximation
            break;
        default:
            currentLevel = originalPeak;
    }

    const gain = targetLinear / currentLevel;
    const gainDb = linearToDb(gain);

    const channels = originalBuffer.numberOfChannels;
    const length = originalBuffer.length;
    const sampleRate = originalBuffer.sampleRate;

    processedBuffer = audioContext.createBuffer(channels, length, sampleRate);

    for (let ch = 0; ch < channels; ch++) {
        const inputData = originalBuffer.getChannelData(ch);
        const outputData = processedBuffer.getChannelData(ch);

        for (let i = 0; i < length; i++) {
            // Apply gain with soft clipping to prevent harsh distortion
            let sample = inputData[i] * gain;
            if (Math.abs(sample) > 1) {
                sample = Math.sign(sample) * (1 - Math.exp(-Math.abs(sample)));
            }
            outputData[i] = sample;
        }
    }

    const newLevels = analyzeLevels(processedBuffer);
    const t = texts[currentLang];
    document.getElementById('resultInfo').innerHTML =
        `${t.gainApplied}: <span>${gainDb > 0 ? '+' : ''}${gainDb.toFixed(1)} dB</span> | ` +
        `${t.peakLevel}: <span>${linearToDb(newLevels.peak).toFixed(1)} dB</span>`;

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
    a.download = 'normalized-audio.wav';
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
