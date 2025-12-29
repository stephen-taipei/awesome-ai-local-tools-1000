/**
 * Audio Silence Remover - Tool #337
 * Remove silent parts from audio
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let processedBuffer = null;

const texts = {
    zh: {
        title: '音頻靜音移除',
        subtitle: '自動偵測並移除靜音段落',
        privacy: '100% 本地處理 · 零資料上傳',
        threshold: '閾值',
        minDuration: '最短靜音',
        padding: '保留邊緣',
        seconds: '秒',
        process: '🔄 移除靜音',
        download: '⬇️ 下載',
        result: '處理結果',
        upload: '拖放音頻檔案至此或點擊上傳',
        uploadHint: '支援 MP3, WAV, OGG, M4A',
        processing: '處理中...',
        removed: '已移除',
        silentParts: '個靜音段落',
        savedTime: '節省時間'
    },
    en: {
        title: 'Silence Remover',
        subtitle: 'Detect and remove silent parts',
        privacy: '100% Local Processing · No Data Upload',
        threshold: 'Threshold',
        minDuration: 'Min Duration',
        padding: 'Edge Padding',
        seconds: 's',
        process: '🔄 Remove Silence',
        download: '⬇️ Download',
        result: 'Result',
        upload: 'Drop audio file here or click to upload',
        uploadHint: 'Supports MP3, WAV, OGG, M4A',
        processing: 'Processing...',
        removed: 'Removed',
        silentParts: 'silent parts',
        savedTime: 'Saved time'
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
    document.getElementById('threshold').addEventListener('input', (e) => {
        document.getElementById('thresholdValue').textContent = e.target.value + ' dB';
    });
    document.getElementById('minDuration').addEventListener('input', (e) => {
        const unit = currentLang === 'zh' ? ' 秒' : ' s';
        document.getElementById('minDurationValue').textContent = parseFloat(e.target.value).toFixed(1) + unit;
    });
    document.getElementById('padding').addEventListener('input', (e) => {
        const unit = currentLang === 'zh' ? ' 秒' : ' s';
        document.getElementById('paddingValue').textContent = parseFloat(e.target.value).toFixed(2) + unit;
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
    document.getElementById('thresholdLabel').textContent = t.threshold;
    document.getElementById('minDurationLabel').textContent = t.minDuration;
    document.getElementById('paddingLabel').textContent = t.padding;
    document.getElementById('processBtn').textContent = t.process;
    document.getElementById('downloadBtn').textContent = t.download;
    document.getElementById('resultTitle').textContent = t.result;
    document.querySelector('.upload-area p').textContent = t.upload;
    document.querySelector('.upload-hint').textContent = t.uploadHint;
    // Update slider values
    const unit = lang === 'zh' ? ' 秒' : ' s';
    document.getElementById('minDurationValue').textContent = parseFloat(document.getElementById('minDuration').value).toFixed(1) + unit;
    document.getElementById('paddingValue').textContent = parseFloat(document.getElementById('padding').value).toFixed(2) + unit;
}

function dbToLinear(db) {
    return Math.pow(10, db / 20);
}

function detectSilentRegions(buffer, thresholdDb, minDuration, sampleRate) {
    const threshold = dbToLinear(thresholdDb);
    const minSamples = Math.floor(minDuration * sampleRate);
    const silentRegions = [];

    // Analyze first channel for simplicity
    const data = buffer.getChannelData(0);
    let silentStart = -1;

    for (let i = 0; i < data.length; i++) {
        const isSilent = Math.abs(data[i]) < threshold;

        if (isSilent && silentStart === -1) {
            silentStart = i;
        } else if (!isSilent && silentStart !== -1) {
            const duration = i - silentStart;
            if (duration >= minSamples) {
                silentRegions.push({ start: silentStart, end: i });
            }
            silentStart = -1;
        }
    }

    // Check if audio ends with silence
    if (silentStart !== -1) {
        const duration = data.length - silentStart;
        if (duration >= minSamples) {
            silentRegions.push({ start: silentStart, end: data.length });
        }
    }

    return silentRegions;
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

    const thresholdDb = parseFloat(document.getElementById('threshold').value);
    const minDuration = parseFloat(document.getElementById('minDuration').value);
    const padding = parseFloat(document.getElementById('padding').value);

    const channels = originalBuffer.numberOfChannels;
    const sampleRate = originalBuffer.sampleRate;
    const paddingSamples = Math.floor(padding * sampleRate);

    // Detect silent regions
    const silentRegions = detectSilentRegions(originalBuffer, thresholdDb, minDuration, sampleRate);

    // Calculate non-silent regions with padding
    const nonSilentRegions = [];
    let lastEnd = 0;

    for (const region of silentRegions) {
        const start = Math.max(0, region.start - paddingSamples);
        const end = Math.min(originalBuffer.length, region.end + paddingSamples);

        if (lastEnd < start) {
            nonSilentRegions.push({ start: lastEnd, end: start });
        }
        lastEnd = end;
    }

    if (lastEnd < originalBuffer.length) {
        nonSilentRegions.push({ start: lastEnd, end: originalBuffer.length });
    }

    // Calculate new length
    let newLength = 0;
    for (const region of nonSilentRegions) {
        newLength += region.end - region.start;
    }

    if (newLength === 0) {
        newLength = originalBuffer.length;
        nonSilentRegions.push({ start: 0, end: originalBuffer.length });
    }

    processedBuffer = audioContext.createBuffer(channels, newLength, sampleRate);

    // Copy non-silent regions
    let writeOffset = 0;
    for (const region of nonSilentRegions) {
        for (let ch = 0; ch < channels; ch++) {
            const inputData = originalBuffer.getChannelData(ch);
            const outputData = processedBuffer.getChannelData(ch);
            for (let i = region.start; i < region.end; i++) {
                outputData[writeOffset + (i - region.start)] = inputData[i];
            }
        }
        writeOffset += region.end - region.start;
    }

    const savedTime = originalBuffer.duration - processedBuffer.duration;
    const t = texts[currentLang];
    document.getElementById('resultInfo').innerHTML =
        `${t.removed} <span>${silentRegions.length}</span> ${t.silentParts} | ` +
        `${t.savedTime}: <span>${savedTime.toFixed(1)}s</span>`;

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
    a.download = 'silence-removed-audio.wav';
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
