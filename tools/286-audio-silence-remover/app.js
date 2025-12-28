/**
 * Audio Silence Remover - Tool #286
 * Remove silence from audio files
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let sourceNode = null;
let isPlaying = false;
let fileName = '';

const texts = {
    zh: {
        title: '音訊靜音移除',
        subtitle: '自動移除音訊中的靜音部分',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '點擊或拖放音訊檔案',
        uploadHint: '支援 MP3, WAV, OGG 等格式',
        threshold: '靜音閾值',
        minSilence: '最短靜音',
        padding: '保留邊距',
        info: '移除靜音可以縮短音訊長度並提高節奏感。',
        preview: '▶️ 預覽',
        stop: '⏹️ 停止',
        download: '⬇️ 下載',
        seconds: '秒'
    },
    en: {
        title: 'Silence Remover',
        subtitle: 'Remove silence from audio',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Click or drop audio file',
        uploadHint: 'Supports MP3, WAV, OGG formats',
        threshold: 'Threshold',
        minSilence: 'Min Silence',
        padding: 'Padding',
        info: 'Removing silence can shorten audio and improve pacing.',
        preview: '▶️ Preview',
        stop: '⏹️ Stop',
        download: '⬇️ Download',
        seconds: 's'
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

    document.getElementById('thresholdSlider').addEventListener('input', (e) => {
        document.getElementById('thresholdValue').textContent = e.target.value + ' dB';
    });

    document.getElementById('minSilenceSlider').addEventListener('input', (e) => {
        const unit = currentLang === 'zh' ? '秒' : 's';
        document.getElementById('minSilenceValue').textContent = e.target.value + ' ' + unit;
    });

    document.getElementById('paddingSlider').addEventListener('input', (e) => {
        document.getElementById('paddingValue').textContent = e.target.value + ' ms';
    });

    document.getElementById('previewBtn').addEventListener('click', togglePreview);
    document.getElementById('downloadBtn').addEventListener('click', downloadProcessed);
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
    labels[0].textContent = t.threshold;
    labels[1].textContent = t.minSilence;
    labels[2].textContent = t.padding;

    document.getElementById('infoText').textContent = t.info;

    const unit = lang === 'zh' ? '秒' : 's';
    document.getElementById('minSilenceValue').textContent = document.getElementById('minSilenceSlider').value + ' ' + unit;

    document.getElementById('previewBtn').textContent = isPlaying ? t.stop : t.preview;
    document.getElementById('downloadBtn').textContent = t.download;
}

async function handleFile(file) {
    fileName = file.name.replace(/\.[^/.]+$/, '');

    const arrayBuffer = await file.arrayBuffer();
    originalBuffer = await audioContext.decodeAudioData(arrayBuffer);

    document.getElementById('editorSection').style.display = 'block';
}

function removeSilence(buffer) {
    const thresholdDb = parseFloat(document.getElementById('thresholdSlider').value);
    const minSilence = parseFloat(document.getElementById('minSilenceSlider').value);
    const paddingMs = parseFloat(document.getElementById('paddingSlider').value);

    const threshold = Math.pow(10, thresholdDb / 20);
    const sampleRate = buffer.sampleRate;
    const minSilenceSamples = Math.floor(minSilence * sampleRate);
    const paddingSamples = Math.floor(paddingMs * sampleRate / 1000);

    // Analyze all channels combined
    const length = buffer.length;
    const rms = new Float32Array(length);

    // Calculate RMS for each sample (simplified: just use absolute value)
    for (let i = 0; i < length; i++) {
        let sum = 0;
        for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
            sum += Math.abs(buffer.getChannelData(ch)[i]);
        }
        rms[i] = sum / buffer.numberOfChannels;
    }

    // Find non-silent regions
    const regions = [];
    let inSound = false;
    let start = 0;
    let silenceStart = 0;

    for (let i = 0; i < length; i++) {
        if (rms[i] > threshold) {
            if (!inSound) {
                start = Math.max(0, i - paddingSamples);
                inSound = true;
            }
            silenceStart = i;
        } else if (inSound) {
            if (i - silenceStart > minSilenceSamples) {
                regions.push({
                    start: start,
                    end: Math.min(length, silenceStart + paddingSamples)
                });
                inSound = false;
            }
        }
    }

    if (inSound) {
        regions.push({
            start: start,
            end: length
        });
    }

    // Calculate total length
    let totalLength = 0;
    for (const region of regions) {
        totalLength += region.end - region.start;
    }

    if (totalLength === 0) {
        return buffer;
    }

    // Create output buffer
    const outputBuffer = audioContext.createBuffer(
        buffer.numberOfChannels,
        totalLength,
        sampleRate
    );

    // Copy non-silent regions
    let writePos = 0;
    for (const region of regions) {
        const regionLength = region.end - region.start;
        for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
            const input = buffer.getChannelData(ch);
            const output = outputBuffer.getChannelData(ch);
            for (let i = 0; i < regionLength; i++) {
                output[writePos + i] = input[region.start + i];
            }
        }
        writePos += regionLength;
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

    const processedBuffer = removeSilence(originalBuffer);

    sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = processedBuffer;
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

async function downloadProcessed() {
    if (!originalBuffer) return;

    const processedBuffer = removeSilence(originalBuffer);
    const wavBlob = bufferToWav(processedBuffer);

    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}-trimmed.wav`;
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
