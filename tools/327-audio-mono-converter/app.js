/**
 * Audio Mono Converter - Tool #327
 * Convert stereo audio to mono
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let processedBuffer = null;

const texts = {
    zh: {
        title: '音頻單聲道轉換',
        subtitle: '將立體聲轉換為單聲道',
        privacy: '100% 本地處理 · 零資料上傳',
        mode: '模式',
        output: '輸出',
        modeAverage: '平均（L+R）',
        modeLeft: '僅左聲道',
        modeRight: '僅右聲道',
        modeSide: '僅側邊（L-R）',
        outputMono: '單聲道',
        outputDual: '雙單聲道',
        process: '🔄 處理音頻',
        download: '⬇️ 下載',
        result: '處理結果',
        upload: '拖放音頻檔案至此或點擊上傳',
        uploadHint: '支援 MP3, WAV, OGG, M4A',
        processing: '處理中...'
    },
    en: {
        title: 'Mono Converter',
        subtitle: 'Convert stereo audio to mono',
        privacy: '100% Local Processing · No Data Upload',
        mode: 'Mode',
        output: 'Output',
        modeAverage: 'Average (L+R)',
        modeLeft: 'Left Only',
        modeRight: 'Right Only',
        modeSide: 'Side Only (L-R)',
        outputMono: 'Mono',
        outputDual: 'Dual Mono',
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

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');
    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    const labels = document.querySelectorAll('.option-group label');
    labels[0].textContent = t.mode;
    labels[1].textContent = t.output;
    const modeSelect = document.getElementById('mode');
    modeSelect.options[0].text = t.modeAverage;
    modeSelect.options[1].text = t.modeLeft;
    modeSelect.options[2].text = t.modeRight;
    modeSelect.options[3].text = t.modeSide;
    const outputSelect = document.getElementById('output');
    outputSelect.options[0].text = t.outputMono;
    outputSelect.options[1].text = t.outputDual;
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

async function processAudio() {
    if (!originalBuffer) return;
    const processBtn = document.getElementById('processBtn');
    const originalText = processBtn.textContent;
    processBtn.textContent = texts[currentLang].processing;
    processBtn.disabled = true;
    await new Promise(resolve => setTimeout(resolve, 10));

    const mode = document.getElementById('mode').value;
    const outputType = document.getElementById('output').value;

    const sampleRate = originalBuffer.sampleRate;
    const length = originalBuffer.length;
    const numChannels = originalBuffer.numberOfChannels;

    const leftIn = originalBuffer.getChannelData(0);
    const rightIn = numChannels > 1 ? originalBuffer.getChannelData(1) : leftIn;

    // Create mono data based on mode
    const monoData = new Float32Array(length);

    for (let i = 0; i < length; i++) {
        switch (mode) {
            case 'average':
                monoData[i] = (leftIn[i] + rightIn[i]) * 0.5;
                break;
            case 'left':
                monoData[i] = leftIn[i];
                break;
            case 'right':
                monoData[i] = rightIn[i];
                break;
            case 'side':
                monoData[i] = (leftIn[i] - rightIn[i]) * 0.5;
                break;
        }
    }

    // Create output buffer
    const outChannels = outputType === 'mono' ? 1 : 2;
    processedBuffer = audioContext.createBuffer(outChannels, length, sampleRate);

    if (outChannels === 1) {
        processedBuffer.getChannelData(0).set(monoData);
    } else {
        processedBuffer.getChannelData(0).set(monoData);
        processedBuffer.getChannelData(1).set(monoData);
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
    a.download = 'mono-audio.wav';
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
