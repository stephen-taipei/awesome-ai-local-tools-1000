/**
 * Audio Normalizer - Tool #287
 * Normalize audio volume levels
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let sourceNode = null;
let isPlaying = false;
let fileName = '';
let originalPeak = 0;

const texts = {
    zh: {
        title: '音訊正規化',
        subtitle: '統一音訊音量水平',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '點擊或拖放音訊檔案',
        uploadHint: '支援 MP3, WAV, OGG 等格式',
        type: '正規化類型',
        target: '目標音量',
        originalPeak: '原始峰值',
        preview: '▶️ 預覽',
        stop: '⏹️ 停止',
        download: '⬇️ 下載',
        peak: '峰值正規化',
        rms: 'RMS正規化',
        lufs: 'LUFS正規化'
    },
    en: {
        title: 'Audio Normalizer',
        subtitle: 'Normalize audio volume levels',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Click or drop audio file',
        uploadHint: 'Supports MP3, WAV, OGG formats',
        type: 'Type',
        target: 'Target',
        originalPeak: 'Original Peak',
        preview: '▶️ Preview',
        stop: '⏹️ Stop',
        download: '⬇️ Download',
        peak: 'Peak Normalization',
        rms: 'RMS Normalization',
        lufs: 'LUFS Normalization'
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

    const labels = document.querySelectorAll('.option-group label');
    labels[0].textContent = t.type;
    labels[1].textContent = t.target;

    const typeSelect = document.getElementById('typeSelect');
    typeSelect.options[0].textContent = t.peak;
    typeSelect.options[1].textContent = t.rms;
    typeSelect.options[2].textContent = t.lufs;

    document.querySelector('.info-box p').innerHTML = t.originalPeak + '：<span id="originalPeak">' + (originalPeak ? originalPeak.toFixed(2) : '-') + '</span> dB';

    document.getElementById('previewBtn').textContent = isPlaying ? t.stop : t.preview;
    document.getElementById('downloadBtn').textContent = t.download;
}

async function handleFile(file) {
    fileName = file.name.replace(/\.[^/.]+$/, '');

    const arrayBuffer = await file.arrayBuffer();
    originalBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // Analyze original peak
    let maxPeak = 0;
    for (let ch = 0; ch < originalBuffer.numberOfChannels; ch++) {
        const data = originalBuffer.getChannelData(ch);
        for (let i = 0; i < data.length; i++) {
            maxPeak = Math.max(maxPeak, Math.abs(data[i]));
        }
    }
    originalPeak = 20 * Math.log10(maxPeak);
    document.getElementById('originalPeak').textContent = originalPeak.toFixed(2);

    document.getElementById('editorSection').style.display = 'block';
}

function normalizeAudio(buffer) {
    const type = document.getElementById('typeSelect').value;
    const targetDb = parseFloat(document.getElementById('targetSlider').value);
    const targetLinear = Math.pow(10, targetDb / 20);

    const sampleRate = buffer.sampleRate;
    const outputBuffer = audioContext.createBuffer(
        buffer.numberOfChannels,
        buffer.length,
        sampleRate
    );

    let measureValue = 0;

    // Calculate current level based on type
    switch (type) {
        case 'peak':
            for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
                const data = buffer.getChannelData(ch);
                for (let i = 0; i < data.length; i++) {
                    measureValue = Math.max(measureValue, Math.abs(data[i]));
                }
            }
            break;

        case 'rms':
            let sumSquares = 0;
            let totalSamples = 0;
            for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
                const data = buffer.getChannelData(ch);
                for (let i = 0; i < data.length; i++) {
                    sumSquares += data[i] * data[i];
                    totalSamples++;
                }
            }
            measureValue = Math.sqrt(sumSquares / totalSamples);
            break;

        case 'lufs':
            // Simplified LUFS calculation (not full ITU-R BS.1770)
            const blockSize = Math.floor(sampleRate * 0.4);
            let maxLoudness = 0;
            for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
                const data = buffer.getChannelData(ch);
                for (let start = 0; start < data.length - blockSize; start += Math.floor(blockSize / 4)) {
                    let blockSum = 0;
                    for (let i = 0; i < blockSize; i++) {
                        blockSum += data[start + i] * data[start + i];
                    }
                    maxLoudness = Math.max(maxLoudness, blockSum / blockSize);
                }
            }
            measureValue = Math.sqrt(maxLoudness);
            break;
    }

    // Calculate gain
    const gain = measureValue > 0 ? targetLinear / measureValue : 1;

    // Apply gain
    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
        const input = buffer.getChannelData(ch);
        const output = outputBuffer.getChannelData(ch);
        for (let i = 0; i < buffer.length; i++) {
            output[i] = Math.max(-1, Math.min(1, input[i] * gain));
        }
    }

    return outputBuffer;
}

function togglePreview() {
    if (isPlaying) {
        stopPreview();
    } else {
        startPreview();
    }
}

async function startPreview() {
    if (!originalBuffer) return;

    await audioContext.resume();
    isPlaying = true;
    document.getElementById('previewBtn').textContent = texts[currentLang].stop;

    const normalizedBuffer = normalizeAudio(originalBuffer);

    sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = normalizedBuffer;
    sourceNode.connect(audioContext.destination);

    sourceNode.onended = () => {
        isPlaying = false;
        document.getElementById('previewBtn').textContent = texts[currentLang].preview;
    };

    sourceNode.start(0);
}

function stopPreview() {
    if (sourceNode) {
        sourceNode.stop();
        sourceNode = null;
    }
    isPlaying = false;
    document.getElementById('previewBtn').textContent = texts[currentLang].preview;
}

async function downloadNormalized() {
    if (!originalBuffer) return;

    const normalizedBuffer = normalizeAudio(originalBuffer);
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
