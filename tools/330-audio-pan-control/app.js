/**
 * Audio Pan Control - Tool #330
 * Control audio panning position in stereo field
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let processedBuffer = null;

const texts = {
    zh: {
        title: '音頻聲像控制',
        subtitle: '調整音頻在立體聲場中的位置',
        privacy: '100% 本地處理 · 零資料上傳',
        mode: '模式',
        linear: '線性',
        constant: '等功率',
        balance: '平衡',
        center: '中央',
        left: '左',
        right: '右',
        process: '🔄 處理音頻',
        download: '⬇️ 下載',
        result: '處理結果',
        upload: '拖放音頻檔案至此或點擊上傳',
        uploadHint: '支援 MP3, WAV, OGG, M4A',
        processing: '處理中...'
    },
    en: {
        title: 'Pan Control',
        subtitle: 'Control audio position in stereo field',
        privacy: '100% Local Processing · No Data Upload',
        mode: 'Mode',
        linear: 'Linear',
        constant: 'Constant Power',
        balance: 'Balance',
        center: 'Center',
        left: 'Left',
        right: 'Right',
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
    document.getElementById('pan').addEventListener('input', (e) => {
        updatePanDisplay(parseInt(e.target.value));
    });
}

function updatePanDisplay(value) {
    const t = texts[currentLang];
    let text;
    if (value === 0) {
        text = t.center;
    } else if (value < 0) {
        text = `${t.left} ${Math.abs(value)}%`;
    } else {
        text = `${t.right} ${value}%`;
    }
    document.getElementById('panValue').textContent = text;
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');
    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.querySelector('.option-group label').textContent = t.mode;
    const select = document.getElementById('panLaw');
    select.options[0].text = t.linear;
    select.options[1].text = t.constant;
    select.options[2].text = t.balance;
    document.getElementById('processBtn').textContent = t.process;
    document.getElementById('downloadBtn').textContent = t.download;
    document.getElementById('resultTitle').textContent = t.result;
    document.querySelector('.upload-area p').textContent = t.upload;
    document.querySelector('.upload-hint').textContent = t.uploadHint;
    updatePanDisplay(parseInt(document.getElementById('pan').value));
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
    const processBtn = document.getElementById('processBtn');
    const originalText = processBtn.textContent;
    processBtn.textContent = texts[currentLang].processing;
    processBtn.disabled = true;
    await new Promise(resolve => setTimeout(resolve, 10));

    const panValue = parseInt(document.getElementById('pan').value) / 100; // -1 to 1
    const panLaw = document.getElementById('panLaw').value;

    const sampleRate = originalBuffer.sampleRate;
    const length = originalBuffer.length;
    const numChannels = originalBuffer.numberOfChannels;

    // Get input data
    const leftIn = originalBuffer.getChannelData(0);
    const rightIn = numChannels > 1 ? originalBuffer.getChannelData(1) : leftIn;

    processedBuffer = audioContext.createBuffer(2, length, sampleRate);
    const leftOut = processedBuffer.getChannelData(0);
    const rightOut = processedBuffer.getChannelData(1);

    // Calculate pan gains based on pan law
    let leftGain, rightGain;

    switch (panLaw) {
        case 'linear':
            // Linear panning
            leftGain = (1 - panValue) / 2;
            rightGain = (1 + panValue) / 2;
            break;
        case 'constant':
            // Constant power panning (equal power)
            const angle = (panValue + 1) * Math.PI / 4; // 0 to PI/2
            leftGain = Math.cos(angle);
            rightGain = Math.sin(angle);
            break;
        case 'balance':
            // Balance mode - only attenuates opposite channel
            if (panValue <= 0) {
                leftGain = 1;
                rightGain = 1 + panValue;
            } else {
                leftGain = 1 - panValue;
                rightGain = 1;
            }
            break;
    }

    // Apply panning
    for (let i = 0; i < length; i++) {
        // Mix input to mono first, then pan
        const mono = (leftIn[i] + rightIn[i]) * 0.5;
        leftOut[i] = mono * leftGain;
        rightOut[i] = mono * rightGain;
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
    a.download = 'panned-audio.wav';
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
