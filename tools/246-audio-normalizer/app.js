/**
 * Audio Normalizer - Tool #246
 * Normalize audio levels locally
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let normalizedBuffer = null;
let sourceNode = null;
let isPlaying = false;
let fileName = '';

const texts = {
    zh: {
        title: '音訊正規化',
        subtitle: '自動調整音量至最佳水平',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '點擊或拖放音訊檔案',
        uploadHint: '支援 MP3, WAV, OGG 等格式',
        targetPeak: '目標峰值',
        normalizeMode: '正規化模式',
        peakMode: '峰值正規化',
        rmsMode: 'RMS 正規化',
        originalPeak: '原始峰值',
        gainAdjust: '增益調整',
        preview: '▶️ 預覽',
        stop: '⏹️ 停止',
        download: '⬇️ 下載正規化音訊',
        originalWave: '原始波形',
        normalizedWave: '正規化波形'
    },
    en: {
        title: 'Audio Normalizer',
        subtitle: 'Automatically adjust volume to optimal level',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Click or drop audio file',
        uploadHint: 'Supports MP3, WAV, OGG formats',
        targetPeak: 'Target Peak',
        normalizeMode: 'Normalize Mode',
        peakMode: 'Peak Normalize',
        rmsMode: 'RMS Normalize',
        originalPeak: 'Original Peak',
        gainAdjust: 'Gain Adjust',
        preview: '▶️ Preview',
        stop: '⏹️ Stop',
        download: '⬇️ Download Normalized',
        originalWave: 'Original Waveform',
        normalizedWave: 'Normalized Waveform'
    }
};

function init() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));

    const uploadArea = document.getElementById('uploadArea');
    const audioInput = document.getElementById('audioInput');

    uploadArea.addEventListener('click', () => audioInput.click());
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
    });
    audioInput.addEventListener('change', (e) => {
        if (e.target.files.length) handleFile(e.target.files[0]);
    });

    document.getElementById('targetSlider').addEventListener('input', (e) => {
        document.getElementById('targetValue').textContent = e.target.value + ' dB';
        if (originalBuffer) processAudio();
    });

    document.getElementById('normalizeMode').addEventListener('change', () => {
        if (originalBuffer) processAudio();
    });

    document.getElementById('previewBtn').addEventListener('click', togglePreview);
    document.getElementById('downloadBtn').addEventListener('click', downloadNormalized);
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');

    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;

    document.querySelector('.upload-text').textContent = t.upload;
    document.querySelector('.upload-hint').textContent = t.uploadHint;

    document.querySelectorAll('.option-group label')[0].textContent = t.targetPeak;
    document.querySelectorAll('.option-group label')[1].textContent = t.normalizeMode;
    document.getElementById('normalizeMode').options[0].text = t.peakMode;
    document.getElementById('normalizeMode').options[1].text = t.rmsMode;

    document.querySelectorAll('.info-label')[0].textContent = t.originalPeak;
    document.querySelectorAll('.info-label')[1].textContent = t.gainAdjust;

    document.querySelectorAll('.waveform-label')[0].textContent = t.originalWave;
    document.querySelectorAll('.waveform-label')[1].textContent = t.normalizedWave;

    document.getElementById('previewBtn').textContent = isPlaying ? t.stop : t.preview;
    document.getElementById('downloadBtn').textContent = t.download;
}

async function handleFile(file) {
    fileName = file.name.replace(/\.[^/.]+$/, '');

    const arrayBuffer = await file.arrayBuffer();
    originalBuffer = await audioContext.decodeAudioData(arrayBuffer);

    processAudio();
    document.getElementById('editorSection').style.display = 'block';
}

function processAudio() {
    const targetDb = parseFloat(document.getElementById('targetSlider').value);
    const mode = document.getElementById('normalizeMode').value;

    // Calculate original peak/RMS
    let originalLevel;
    if (mode === 'peak') {
        originalLevel = getPeakLevel(originalBuffer);
    } else {
        originalLevel = getRmsLevel(originalBuffer);
    }

    const originalDb = 20 * Math.log10(originalLevel);
    const gainDb = targetDb - originalDb;
    const gain = Math.pow(10, gainDb / 20);

    // Apply normalization
    normalizedBuffer = normalizeBuffer(originalBuffer, gain);

    // Update UI
    document.getElementById('originalPeak').textContent = originalDb.toFixed(1) + ' dB';
    document.getElementById('gainValue').textContent = (gainDb >= 0 ? '+' : '') + gainDb.toFixed(1) + ' dB';

    // Draw waveforms
    drawWaveform(document.getElementById('originalCanvas'), originalBuffer, '#64748b');
    drawWaveform(document.getElementById('normalizedCanvas'), normalizedBuffer, '#f59e0b');
}

function getPeakLevel(buffer) {
    let peak = 0;
    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
        const data = buffer.getChannelData(ch);
        for (let i = 0; i < data.length; i++) {
            peak = Math.max(peak, Math.abs(data[i]));
        }
    }
    return peak || 0.0001;
}

function getRmsLevel(buffer) {
    let sumSquares = 0;
    let count = 0;
    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
        const data = buffer.getChannelData(ch);
        for (let i = 0; i < data.length; i++) {
            sumSquares += data[i] * data[i];
            count++;
        }
    }
    return Math.sqrt(sumSquares / count) || 0.0001;
}

function normalizeBuffer(buffer, gain) {
    const normalized = audioContext.createBuffer(
        buffer.numberOfChannels,
        buffer.length,
        buffer.sampleRate
    );

    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
        const input = buffer.getChannelData(ch);
        const output = normalized.getChannelData(ch);
        for (let i = 0; i < input.length; i++) {
            output[i] = Math.max(-1, Math.min(1, input[i] * gain));
        }
    }

    return normalized;
}

function drawWaveform(canvas, buffer, color) {
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = 80 * 2;
    ctx.scale(2, 2);

    const width = canvas.offsetWidth;
    const height = 80;
    const data = buffer.getChannelData(0);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;

    const step = Math.ceil(data.length / width);
    for (let i = 0; i < width; i++) {
        let min = 1, max = -1;
        for (let j = 0; j < step; j++) {
            const idx = i * step + j;
            if (idx < data.length) {
                min = Math.min(min, data[idx]);
                max = Math.max(max, data[idx]);
            }
        }
        const y1 = (1 - max) * height / 2;
        const y2 = (1 - min) * height / 2;
        ctx.moveTo(i, y1);
        ctx.lineTo(i, y2);
    }
    ctx.stroke();
}

function togglePreview() {
    if (isPlaying) {
        stopPreview();
    } else {
        startPreview();
    }
}

function startPreview() {
    if (!normalizedBuffer) return;

    audioContext.resume();
    isPlaying = true;

    sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = normalizedBuffer;
    sourceNode.connect(audioContext.destination);

    sourceNode.onended = () => {
        isPlaying = false;
        document.getElementById('previewBtn').textContent = texts[currentLang].preview;
    };

    sourceNode.start(0);
    document.getElementById('previewBtn').textContent = texts[currentLang].stop;
}

function stopPreview() {
    if (sourceNode) {
        sourceNode.stop();
        sourceNode = null;
    }
    isPlaying = false;
    document.getElementById('previewBtn').textContent = texts[currentLang].preview;
}

function downloadNormalized() {
    if (!normalizedBuffer) return;

    const wavBlob = bufferToWav(normalizedBuffer);

    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}-normalized.wav`;
    a.click();
    URL.revokeObjectURL(url);
}

function bufferToWav(buffer) {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1;
    const bitDepth = 16;

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;

    const samples = buffer.length;
    const dataSize = samples * blockAlign;
    const bufferSize = 44 + dataSize;

    const arrayBuffer = new ArrayBuffer(bufferSize);
    const view = new DataView(arrayBuffer);

    const writeString = (offset, string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, bufferSize - 8, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    const channels = [];
    for (let i = 0; i < numChannels; i++) {
        channels.push(buffer.getChannelData(i));
    }

    let offset = 44;
    for (let i = 0; i < samples; i++) {
        for (let ch = 0; ch < numChannels; ch++) {
            const sample = Math.max(-1, Math.min(1, channels[ch][i]));
            view.setInt16(offset, sample * 32767, true);
            offset += 2;
        }
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
}

init();
