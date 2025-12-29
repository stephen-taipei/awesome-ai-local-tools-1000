/**
 * Audio Distortion - Tool #314
 * Add distortion effect to audio
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let processedBuffer = null;

const texts = {
    zh: {
        title: '音頻失真',
        subtitle: '為音頻添加失真效果',
        privacy: '100% 本地處理 · 零資料上傳',
        amount: '失真量',
        type: '類型',
        tone: '音調',
        mix: '混合',
        soft: '軟削波',
        hard: '硬削波',
        fuzz: '法茲',
        process: '🔄 處理音頻',
        download: '⬇️ 下載',
        result: '處理結果',
        upload: '拖放音頻檔案至此或點擊上傳',
        uploadHint: '支援 MP3, WAV, OGG, M4A',
        processing: '處理中...'
    },
    en: {
        title: 'Distortion',
        subtitle: 'Add distortion effect to audio',
        privacy: '100% Local Processing · No Data Upload',
        amount: 'Amount',
        type: 'Type',
        tone: 'Tone',
        mix: 'Mix',
        soft: 'Soft Clip',
        hard: 'Hard Clip',
        fuzz: 'Fuzz',
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
    document.getElementById('amount').addEventListener('input', (e) => { document.getElementById('amountValue').textContent = e.target.value; });
    document.getElementById('tone').addEventListener('input', (e) => { document.getElementById('toneValue').textContent = e.target.value + '%'; });
    document.getElementById('mix').addEventListener('input', (e) => { document.getElementById('mixValue').textContent = e.target.value + '%'; });
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
    labels[0].textContent = t.amount;
    labels[1].textContent = t.type;
    labels[2].textContent = t.tone;
    labels[3].textContent = t.mix;
    const select = document.getElementById('distType');
    select.options[0].textContent = t.soft;
    select.options[1].textContent = t.hard;
    select.options[2].textContent = t.fuzz;
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

function softClip(sample, amount) {
    const k = amount;
    return Math.tanh(k * sample) / Math.tanh(k);
}

function hardClip(sample, threshold) {
    return Math.max(-threshold, Math.min(threshold, sample * (1 + (1 - threshold) * 2))) / threshold;
}

function fuzz(sample, amount) {
    const sign = sample >= 0 ? 1 : -1;
    const abs = Math.abs(sample);
    return sign * (1 - Math.exp(-amount * abs));
}

async function processAudio() {
    if (!originalBuffer) return;
    const processBtn = document.getElementById('processBtn');
    const originalText = processBtn.textContent;
    processBtn.textContent = texts[currentLang].processing;
    processBtn.disabled = true;
    await new Promise(resolve => setTimeout(resolve, 10));

    const amount = parseInt(document.getElementById('amount').value);
    const distType = document.getElementById('distType').value;
    const tone = parseInt(document.getElementById('tone').value) / 100;
    const mix = parseInt(document.getElementById('mix').value) / 100;

    const sampleRate = originalBuffer.sampleRate;
    const channels = originalBuffer.numberOfChannels;
    const length = originalBuffer.length;

    processedBuffer = audioContext.createBuffer(channels, length, sampleRate);

    // Simple low-pass filter for tone
    const filterCoef = 0.1 + tone * 0.9;

    for (let ch = 0; ch < channels; ch++) {
        const inputData = originalBuffer.getChannelData(ch);
        const outputData = processedBuffer.getChannelData(ch);
        let lastFiltered = 0;

        for (let i = 0; i < length; i++) {
            let sample = inputData[i];
            let distorted;

            switch (distType) {
                case 'soft':
                    distorted = softClip(sample, amount / 10);
                    break;
                case 'hard':
                    distorted = hardClip(sample, 1 - (amount / 120));
                    break;
                case 'fuzz':
                    distorted = fuzz(sample, amount / 5);
                    break;
                default:
                    distorted = sample;
            }

            // Simple tone filter
            lastFiltered = lastFiltered + filterCoef * (distorted - lastFiltered);
            const filtered = distorted * tone + lastFiltered * (1 - tone);

            outputData[i] = inputData[i] * (1 - mix) + filtered * mix;
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
    a.download = 'distortion-audio.wav';
    a.click();
}

function bufferToWav(buffer) {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const bytesPerSample = 2;
    const blockAlign = numChannels * bytesPerSample;
    const dataSize = buffer.length * blockAlign;
    const bufferSize = 44 + dataSize;
    const arrayBuffer = new ArrayBuffer(bufferSize);
    const view = new DataView(arrayBuffer);
    const writeString = (offset, string) => { for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i)); };
    writeString(0, 'RIFF'); view.setUint32(4, bufferSize - 8, true); writeString(8, 'WAVE'); writeString(12, 'fmt ');
    view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true); view.setUint16(34, 16, true); writeString(36, 'data'); view.setUint32(40, dataSize, true);
    const channels = []; for (let i = 0; i < numChannels; i++) channels.push(buffer.getChannelData(i));
    let offset = 44;
    for (let i = 0; i < buffer.length; i++) { for (let ch = 0; ch < numChannels; ch++) { const sample = Math.max(-1, Math.min(1, channels[ch][i])); view.setInt16(offset, sample * 32767, true); offset += 2; } }
    return new Blob([arrayBuffer], { type: 'audio/wav' });
}

init();
