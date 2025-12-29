/**
 * Audio Distortion - Tool #341
 * Add distortion and overdrive effects
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let processedBuffer = null;

const texts = {
    zh: {
        title: '音頻失真',
        subtitle: '添加失真與過載效果',
        privacy: '100% 本地處理 · 零資料上傳',
        type: '類型',
        typeSoft: '軟削波',
        typeHard: '硬削波',
        typeFuzz: 'Fuzz',
        typeOverdrive: '過載',
        drive: '驅動',
        tone: '音色',
        mix: '混合',
        process: '🔄 處理音頻',
        download: '⬇️ 下載',
        result: '處理結果',
        upload: '拖放音頻檔案至此或點擊上傳',
        uploadHint: '支援 MP3, WAV, OGG, M4A',
        processing: '處理中...'
    },
    en: {
        title: 'Audio Distortion',
        subtitle: 'Add distortion and overdrive effects',
        privacy: '100% Local Processing · No Data Upload',
        type: 'Type',
        typeSoft: 'Soft Clip',
        typeHard: 'Hard Clip',
        typeFuzz: 'Fuzz',
        typeOverdrive: 'Overdrive',
        drive: 'Drive',
        tone: 'Tone',
        mix: 'Mix',
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
    document.getElementById('drive').addEventListener('input', (e) => {
        document.getElementById('driveValue').textContent = e.target.value + '%';
    });
    document.getElementById('tone').addEventListener('input', (e) => {
        document.getElementById('toneValue').textContent = e.target.value + ' Hz';
    });
    document.getElementById('mix').addEventListener('input', (e) => {
        document.getElementById('mixValue').textContent = e.target.value + '%';
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
    document.getElementById('typeLabel').textContent = t.type;
    const typeSelect = document.getElementById('distType');
    typeSelect.options[0].text = t.typeSoft;
    typeSelect.options[1].text = t.typeHard;
    typeSelect.options[2].text = t.typeFuzz;
    typeSelect.options[3].text = t.typeOverdrive;
    document.getElementById('driveLabel').textContent = t.drive;
    document.getElementById('toneLabel').textContent = t.tone;
    document.getElementById('mixLabel').textContent = t.mix;
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

function softClip(sample, drive) {
    const k = drive * 10;
    return Math.tanh(sample * k) / Math.tanh(k);
}

function hardClip(sample, drive) {
    const threshold = 1 / (drive + 1);
    return Math.max(-threshold, Math.min(threshold, sample)) / threshold;
}

function fuzz(sample, drive) {
    const k = drive * 50;
    const sign = sample >= 0 ? 1 : -1;
    return sign * (1 - Math.exp(-Math.abs(sample) * k));
}

function overdrive(sample, drive) {
    const k = 1 + drive * 5;
    const x = sample * k;
    if (Math.abs(x) < 1/3) {
        return 2 * x;
    } else if (Math.abs(x) < 2/3) {
        const sign = x >= 0 ? 1 : -1;
        return sign * (3 - Math.pow(2 - 3 * Math.abs(x), 2)) / 3;
    } else {
        return x >= 0 ? 1 : -1;
    }
}

function applyToneFilter(data, sampleRate, cutoff) {
    // Simple one-pole low-pass filter
    const rc = 1.0 / (cutoff * 2 * Math.PI);
    const dt = 1.0 / sampleRate;
    const alpha = dt / (rc + dt);

    let prev = 0;
    for (let i = 0; i < data.length; i++) {
        data[i] = prev + alpha * (data[i] - prev);
        prev = data[i];
    }
}

async function processAudio() {
    if (!originalBuffer) return;
    const processBtn = document.getElementById('processBtn');
    const originalText = processBtn.textContent;
    processBtn.textContent = texts[currentLang].processing;
    processBtn.disabled = true;
    await new Promise(resolve => setTimeout(resolve, 10));

    const distType = document.getElementById('distType').value;
    const drive = parseInt(document.getElementById('drive').value) / 100;
    const tone = parseInt(document.getElementById('tone').value);
    const mix = parseInt(document.getElementById('mix').value) / 100;

    const channels = originalBuffer.numberOfChannels;
    const length = originalBuffer.length;
    const sampleRate = originalBuffer.sampleRate;

    processedBuffer = audioContext.createBuffer(channels, length, sampleRate);

    for (let ch = 0; ch < channels; ch++) {
        const inputData = originalBuffer.getChannelData(ch);
        const outputData = processedBuffer.getChannelData(ch);

        // Apply distortion
        for (let i = 0; i < length; i++) {
            let sample = inputData[i];
            let distorted;

            switch (distType) {
                case 'soft':
                    distorted = softClip(sample, drive);
                    break;
                case 'hard':
                    distorted = hardClip(sample, drive);
                    break;
                case 'fuzz':
                    distorted = fuzz(sample, drive);
                    break;
                case 'overdrive':
                    distorted = overdrive(sample, drive);
                    break;
                default:
                    distorted = sample;
            }

            outputData[i] = distorted;
        }

        // Apply tone filter
        applyToneFilter(outputData, sampleRate, tone);

        // Apply mix
        for (let i = 0; i < length; i++) {
            outputData[i] = inputData[i] * (1 - mix) + outputData[i] * mix;
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
    a.download = 'distorted-audio.wav';
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
