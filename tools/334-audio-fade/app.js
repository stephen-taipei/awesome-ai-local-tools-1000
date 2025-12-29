/**
 * Audio Fade - Tool #334
 * Add fade in and fade out effects
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let processedBuffer = null;

const texts = {
    zh: {
        title: '音頻淡入淡出',
        subtitle: '為音頻添加淡入淡出效果',
        privacy: '100% 本地處理 · 零資料上傳',
        fadeIn: '淡入',
        fadeOut: '淡出',
        curve: '曲線',
        curveLinear: '線性',
        curveExp: '指數',
        curveLog: '對數',
        curveSCurve: 'S曲線',
        seconds: '秒',
        process: '🔄 處理音頻',
        download: '⬇️ 下載',
        result: '處理結果',
        upload: '拖放音頻檔案至此或點擊上傳',
        uploadHint: '支援 MP3, WAV, OGG, M4A',
        processing: '處理中...'
    },
    en: {
        title: 'Audio Fade',
        subtitle: 'Add fade in and fade out effects',
        privacy: '100% Local Processing · No Data Upload',
        fadeIn: 'Fade In',
        fadeOut: 'Fade Out',
        curve: 'Curve',
        curveLinear: 'Linear',
        curveExp: 'Exponential',
        curveLog: 'Logarithmic',
        curveSCurve: 'S-Curve',
        seconds: 's',
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
    document.getElementById('fadeIn').addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        document.getElementById('fadeInValue').textContent = val.toFixed(1) + ' ' + (currentLang === 'zh' ? '秒' : 's');
    });
    document.getElementById('fadeOut').addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        document.getElementById('fadeOutValue').textContent = val.toFixed(1) + ' ' + (currentLang === 'zh' ? '秒' : 's');
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
    document.getElementById('fadeInLabel').textContent = t.fadeIn;
    document.getElementById('fadeOutLabel').textContent = t.fadeOut;
    document.getElementById('curveLabel').textContent = t.curve;
    const curveSelect = document.getElementById('curveType');
    curveSelect.options[0].text = t.curveLinear;
    curveSelect.options[1].text = t.curveExp;
    curveSelect.options[2].text = t.curveLog;
    curveSelect.options[3].text = t.curveSCurve;
    document.getElementById('processBtn').textContent = t.process;
    document.getElementById('downloadBtn').textContent = t.download;
    document.getElementById('resultTitle').textContent = t.result;
    document.querySelector('.upload-area p').textContent = t.upload;
    document.querySelector('.upload-hint').textContent = t.uploadHint;
    // Update slider values
    const fadeInVal = parseFloat(document.getElementById('fadeIn').value);
    const fadeOutVal = parseFloat(document.getElementById('fadeOut').value);
    document.getElementById('fadeInValue').textContent = fadeInVal.toFixed(1) + ' ' + t.seconds;
    document.getElementById('fadeOutValue').textContent = fadeOutVal.toFixed(1) + ' ' + t.seconds;
}

async function handleFile(file) {
    const arrayBuffer = await file.arrayBuffer();
    originalBuffer = await audioContext.decodeAudioData(arrayBuffer);
    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('audioLoaded').style.display = 'block';
    document.getElementById('fileInfo').textContent = `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
    document.getElementById('originalAudio').src = URL.createObjectURL(file);

    // Adjust max fade time based on audio length
    const maxFade = Math.min(10, originalBuffer.duration / 2);
    document.getElementById('fadeIn').max = maxFade;
    document.getElementById('fadeOut').max = maxFade;

    document.getElementById('optionsSection').style.display = 'block';
    document.getElementById('actionSection').style.display = 'flex';
}

function getFadeCurve(progress, curveType) {
    switch (curveType) {
        case 'linear':
            return progress;
        case 'exponential':
            return progress * progress;
        case 'logarithmic':
            return Math.sqrt(progress);
        case 'scurve':
            return progress < 0.5
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        default:
            return progress;
    }
}

async function processAudio() {
    if (!originalBuffer) return;
    const processBtn = document.getElementById('processBtn');
    const originalText = processBtn.textContent;
    processBtn.textContent = texts[currentLang].processing;
    processBtn.disabled = true;
    await new Promise(resolve => setTimeout(resolve, 10));

    const fadeInTime = parseFloat(document.getElementById('fadeIn').value);
    const fadeOutTime = parseFloat(document.getElementById('fadeOut').value);
    const curveType = document.getElementById('curveType').value;

    const channels = originalBuffer.numberOfChannels;
    const length = originalBuffer.length;
    const sampleRate = originalBuffer.sampleRate;

    const fadeInSamples = Math.floor(fadeInTime * sampleRate);
    const fadeOutSamples = Math.floor(fadeOutTime * sampleRate);

    processedBuffer = audioContext.createBuffer(channels, length, sampleRate);

    for (let ch = 0; ch < channels; ch++) {
        const inputData = originalBuffer.getChannelData(ch);
        const outputData = processedBuffer.getChannelData(ch);

        for (let i = 0; i < length; i++) {
            let gain = 1.0;

            // Apply fade in
            if (i < fadeInSamples && fadeInSamples > 0) {
                const progress = i / fadeInSamples;
                gain *= getFadeCurve(progress, curveType);
            }

            // Apply fade out
            if (i >= length - fadeOutSamples && fadeOutSamples > 0) {
                const progress = (length - i) / fadeOutSamples;
                gain *= getFadeCurve(progress, curveType);
            }

            outputData[i] = inputData[i] * gain;
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
    a.download = 'faded-audio.wav';
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
