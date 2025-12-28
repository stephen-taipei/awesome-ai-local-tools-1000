/**
 * Silence Remover - Tool #255
 * Remove silence from audio files
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let processedBuffer = null;
let silenceRegions = [];
let sourceNode = null;
let isPlaying = false;
let fileName = '';

const texts = {
    zh: {
        title: '靜音移除',
        subtitle: '自動偵測並移除音訊中的靜音片段',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '點擊或拖放音訊檔案',
        uploadHint: '支援 MP3, WAV, OGG 等格式',
        originalWave: '原始波形',
        silenceIndicator: '(紅色區域為靜音)',
        processedWave: '處理後波形',
        threshold: '靜音閾值',
        minSilence: '最短靜音',
        padding: '保留邊距',
        originalDuration: '原始時長',
        processedDuration: '處理後時長',
        removedDuration: '移除時間',
        preview: '▶️ 預覽',
        stop: '⏹️ 停止',
        download: '⬇️ 下載'
    },
    en: {
        title: 'Silence Remover',
        subtitle: 'Detect and remove silence from audio',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Click or drop audio file',
        uploadHint: 'Supports MP3, WAV, OGG formats',
        originalWave: 'Original Waveform',
        silenceIndicator: '(Red areas are silence)',
        processedWave: 'Processed Waveform',
        threshold: 'Threshold',
        minSilence: 'Min Silence',
        padding: 'Padding',
        originalDuration: 'Original',
        processedDuration: 'Processed',
        removedDuration: 'Removed',
        preview: '▶️ Preview',
        stop: '⏹️ Stop',
        download: '⬇️ Download'
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
        if (originalBuffer) processAudio();
    });

    document.getElementById('minSilenceSlider').addEventListener('input', (e) => {
        document.getElementById('minSilenceValue').textContent = e.target.value + ' ms';
        if (originalBuffer) processAudio();
    });

    document.getElementById('paddingSlider').addEventListener('input', (e) => {
        document.getElementById('paddingValue').textContent = e.target.value + ' ms';
        if (originalBuffer) processAudio();
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

    document.querySelectorAll('.waveform-label')[0].childNodes[0].textContent = t.originalWave + ' ';
    document.querySelector('.silence-indicator').textContent = t.silenceIndicator;
    document.querySelectorAll('.waveform-label')[1].textContent = t.processedWave;

    document.querySelectorAll('.option-group label')[0].textContent = t.threshold;
    document.querySelectorAll('.option-group label')[1].textContent = t.minSilence;
    document.querySelectorAll('.option-group label')[2].textContent = t.padding;

    document.querySelectorAll('.info-label')[0].textContent = t.originalDuration;
    document.querySelectorAll('.info-label')[1].textContent = t.processedDuration;
    document.querySelectorAll('.info-label')[2].textContent = t.removedDuration;

    document.getElementById('previewBtn').textContent = isPlaying ? t.stop : t.preview;
    document.getElementById('downloadBtn').textContent = t.download;
}

async function handleFile(file) {
    fileName = file.name.replace(/\.[^/.]+$/, '');

    const arrayBuffer = await file.arrayBuffer();
    originalBuffer = await audioContext.decodeAudioData(arrayBuffer);

    document.getElementById('originalDuration').textContent = formatTime(originalBuffer.duration);

    drawWaveform(document.getElementById('originalCanvas'), originalBuffer, '#64748b');
    processAudio();
    document.getElementById('editorSection').style.display = 'block';
}

function processAudio() {
    const thresholdDb = parseFloat(document.getElementById('thresholdSlider').value);
    const minSilenceMs = parseFloat(document.getElementById('minSilenceSlider').value);
    const paddingMs = parseFloat(document.getElementById('paddingSlider').value);

    const threshold = Math.pow(10, thresholdDb / 20);
    const minSilenceSamples = Math.floor((minSilenceMs / 1000) * originalBuffer.sampleRate);
    const paddingSamples = Math.floor((paddingMs / 1000) * originalBuffer.sampleRate);

    // Detect silence regions
    silenceRegions = detectSilence(originalBuffer, threshold, minSilenceSamples);

    // Draw silence overlay
    drawSilenceOverlay();

    // Remove silence
    processedBuffer = removeSilence(originalBuffer, silenceRegions, paddingSamples);

    // Draw processed waveform
    drawWaveform(document.getElementById('processedCanvas'), processedBuffer, '#eab308');

    // Update info
    document.getElementById('processedDuration').textContent = formatTime(processedBuffer.duration);
    const removed = originalBuffer.duration - processedBuffer.duration;
    document.getElementById('removedDuration').textContent = formatTime(removed);
}

function detectSilence(buffer, threshold, minSamples) {
    const data = buffer.getChannelData(0);
    const regions = [];
    let silenceStart = null;

    for (let i = 0; i < data.length; i++) {
        const isSilent = Math.abs(data[i]) < threshold;

        if (isSilent && silenceStart === null) {
            silenceStart = i;
        } else if (!isSilent && silenceStart !== null) {
            if (i - silenceStart >= minSamples) {
                regions.push({ start: silenceStart, end: i });
            }
            silenceStart = null;
        }
    }

    // Handle trailing silence
    if (silenceStart !== null && data.length - silenceStart >= minSamples) {
        regions.push({ start: silenceStart, end: data.length });
    }

    return regions;
}

function drawSilenceOverlay() {
    const overlay = document.getElementById('silenceOverlay');
    const duration = originalBuffer.duration;

    overlay.innerHTML = silenceRegions.map(region => {
        const startPercent = (region.start / originalBuffer.length) * 100;
        const widthPercent = ((region.end - region.start) / originalBuffer.length) * 100;
        return `<div class="silence-region" style="left: ${startPercent}%; width: ${widthPercent}%"></div>`;
    }).join('');
}

function removeSilence(buffer, regions, padding) {
    // Calculate new length
    let removedSamples = 0;
    regions.forEach(region => {
        const adjustedStart = Math.max(0, region.start + padding);
        const adjustedEnd = Math.min(buffer.length, region.end - padding);
        if (adjustedEnd > adjustedStart) {
            removedSamples += adjustedEnd - adjustedStart;
        }
    });

    const newLength = buffer.length - removedSamples;
    if (newLength <= 0) {
        return audioContext.createBuffer(buffer.numberOfChannels, 1, buffer.sampleRate);
    }

    const processed = audioContext.createBuffer(buffer.numberOfChannels, newLength, buffer.sampleRate);

    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
        const input = buffer.getChannelData(ch);
        const output = processed.getChannelData(ch);

        let outputIndex = 0;
        let inputIndex = 0;

        for (const region of regions) {
            const adjustedStart = Math.max(0, region.start + padding);
            const adjustedEnd = Math.min(buffer.length, region.end - padding);

            // Copy audio before silence
            while (inputIndex < adjustedStart && outputIndex < newLength) {
                output[outputIndex++] = input[inputIndex++];
            }

            // Skip silence
            inputIndex = adjustedEnd;
        }

        // Copy remaining audio
        while (inputIndex < buffer.length && outputIndex < newLength) {
            output[outputIndex++] = input[inputIndex++];
        }
    }

    return processed;
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

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function togglePreview() {
    if (isPlaying) {
        stopPreview();
    } else {
        startPreview();
    }
}

function startPreview() {
    if (!processedBuffer) return;

    audioContext.resume();
    isPlaying = true;

    sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = processedBuffer;
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

function downloadProcessed() {
    if (!processedBuffer) return;

    const wavBlob = bufferToWav(processedBuffer);

    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}-no-silence.wav`;
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
