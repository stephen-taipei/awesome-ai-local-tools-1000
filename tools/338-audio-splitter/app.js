/**
 * Audio Splitter - Tool #338
 * Split audio into multiple parts
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let audioParts = [];

const texts = {
    zh: {
        title: '音頻分割',
        subtitle: '將音頻分割成多個片段',
        privacy: '100% 本地處理 · 零資料上傳',
        mode: '分割方式',
        modeEqual: '等分',
        modeDuration: '固定長度',
        modeSilence: '靜音處偵測',
        parts: '分割數量',
        duration: '每段長度',
        threshold: '靜音閾值',
        partsUnit: '段',
        seconds: '秒',
        process: '🔄 分割音頻',
        result: '分割結果',
        downloadAll: '⬇️ 下載全部',
        part: '片段',
        upload: '拖放音頻檔案至此或點擊上傳',
        uploadHint: '支援 MP3, WAV, OGG, M4A',
        processing: '處理中...'
    },
    en: {
        title: 'Audio Splitter',
        subtitle: 'Split audio into multiple parts',
        privacy: '100% Local Processing · No Data Upload',
        mode: 'Split Mode',
        modeEqual: 'Equal Parts',
        modeDuration: 'Fixed Duration',
        modeSilence: 'By Silence',
        parts: 'Number of Parts',
        duration: 'Part Duration',
        threshold: 'Silence Threshold',
        partsUnit: 'parts',
        seconds: 's',
        process: '🔄 Split Audio',
        result: 'Split Result',
        downloadAll: '⬇️ Download All',
        part: 'Part',
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
    document.getElementById('downloadAllBtn').addEventListener('click', downloadAll);
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
    document.getElementById('splitMode').addEventListener('change', (e) => {
        document.getElementById('partsGroup').style.display = e.target.value === 'equal' ? 'flex' : 'none';
        document.getElementById('durationGroup').style.display = e.target.value === 'duration' ? 'flex' : 'none';
        document.getElementById('thresholdGroup').style.display = e.target.value === 'silence' ? 'flex' : 'none';
    });
    document.getElementById('parts').addEventListener('input', (e) => {
        const unit = currentLang === 'zh' ? ' 段' : ' parts';
        document.getElementById('partsValue').textContent = e.target.value + unit;
    });
    document.getElementById('duration').addEventListener('input', (e) => {
        const unit = currentLang === 'zh' ? ' 秒' : ' s';
        document.getElementById('durationValue').textContent = e.target.value + unit;
    });
    document.getElementById('threshold').addEventListener('input', (e) => {
        document.getElementById('thresholdValue').textContent = e.target.value + ' dB';
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
    document.getElementById('modeLabel').textContent = t.mode;
    const modeSelect = document.getElementById('splitMode');
    modeSelect.options[0].text = t.modeEqual;
    modeSelect.options[1].text = t.modeDuration;
    modeSelect.options[2].text = t.modeSilence;
    document.getElementById('partsLabel').textContent = t.parts;
    document.getElementById('durationLabel').textContent = t.duration;
    document.getElementById('thresholdLabel').textContent = t.threshold;
    document.getElementById('processBtn').textContent = t.process;
    document.getElementById('resultTitle').textContent = t.result;
    document.getElementById('downloadAllBtn').textContent = t.downloadAll;
    document.querySelector('.upload-area p').textContent = t.upload;
    document.querySelector('.upload-hint').textContent = t.uploadHint;
    // Update slider values
    document.getElementById('partsValue').textContent = document.getElementById('parts').value + (lang === 'zh' ? ' 段' : ' parts');
    document.getElementById('durationValue').textContent = document.getElementById('duration').value + (lang === 'zh' ? ' 秒' : ' s');
}

function dbToLinear(db) {
    return Math.pow(10, db / 20);
}

function detectSilencePoints(buffer, thresholdDb, sampleRate) {
    const threshold = dbToLinear(thresholdDb);
    const minSilenceSamples = Math.floor(0.3 * sampleRate); // 300ms minimum silence
    const data = buffer.getChannelData(0);
    const splitPoints = [0];

    let silentStart = -1;
    for (let i = 0; i < data.length; i++) {
        const isSilent = Math.abs(data[i]) < threshold;
        if (isSilent && silentStart === -1) {
            silentStart = i;
        } else if (!isSilent && silentStart !== -1) {
            if (i - silentStart >= minSilenceSamples) {
                splitPoints.push(Math.floor((silentStart + i) / 2));
            }
            silentStart = -1;
        }
    }
    splitPoints.push(buffer.length);
    return splitPoints;
}

function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

async function handleFile(file) {
    const arrayBuffer = await file.arrayBuffer();
    originalBuffer = await audioContext.decodeAudioData(arrayBuffer);

    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('audioLoaded').style.display = 'block';
    document.getElementById('fileInfo').textContent = `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB) - ${formatDuration(originalBuffer.duration)}`;
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

    const mode = document.getElementById('splitMode').value;
    const channels = originalBuffer.numberOfChannels;
    const sampleRate = originalBuffer.sampleRate;
    const totalLength = originalBuffer.length;

    let splitPoints = [0];

    switch (mode) {
        case 'equal':
            const numParts = parseInt(document.getElementById('parts').value);
            const partLength = Math.floor(totalLength / numParts);
            for (let i = 1; i < numParts; i++) {
                splitPoints.push(i * partLength);
            }
            splitPoints.push(totalLength);
            break;

        case 'duration':
            const durationSec = parseFloat(document.getElementById('duration').value);
            const durationSamples = Math.floor(durationSec * sampleRate);
            let pos = durationSamples;
            while (pos < totalLength) {
                splitPoints.push(pos);
                pos += durationSamples;
            }
            splitPoints.push(totalLength);
            break;

        case 'silence':
            const thresholdDb = parseFloat(document.getElementById('threshold').value);
            splitPoints = detectSilencePoints(originalBuffer, thresholdDb, sampleRate);
            break;
    }

    // Create audio parts
    audioParts = [];
    for (let i = 0; i < splitPoints.length - 1; i++) {
        const start = splitPoints[i];
        const end = splitPoints[i + 1];
        const length = end - start;

        if (length <= 0) continue;

        const partBuffer = audioContext.createBuffer(channels, length, sampleRate);
        for (let ch = 0; ch < channels; ch++) {
            const inputData = originalBuffer.getChannelData(ch);
            const outputData = partBuffer.getChannelData(ch);
            for (let j = 0; j < length; j++) {
                outputData[j] = inputData[start + j];
            }
        }

        const blob = bufferToWav(partBuffer);
        audioParts.push({
            buffer: partBuffer,
            blob: blob,
            duration: partBuffer.duration
        });
    }

    // Display parts
    const partsList = document.getElementById('partsList');
    partsList.innerHTML = '';
    const t = texts[currentLang];

    audioParts.forEach((part, index) => {
        const item = document.createElement('div');
        item.className = 'part-item';
        item.innerHTML = `
            <span class="part-name">${t.part} ${index + 1}</span>
            <span class="part-duration">${formatDuration(part.duration)}</span>
            <audio src="${URL.createObjectURL(part.blob)}" controls></audio>
            <button class="download-btn" data-index="${index}">⬇️</button>
        `;
        partsList.appendChild(item);
    });

    partsList.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            downloadPart(index);
        });
    });

    document.getElementById('resultSection').style.display = 'block';
    processBtn.textContent = originalText;
    processBtn.disabled = false;
}

function downloadPart(index) {
    const part = audioParts[index];
    if (!part) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(part.blob);
    a.download = `audio-part-${index + 1}.wav`;
    a.click();
}

function downloadAll() {
    audioParts.forEach((part, index) => {
        setTimeout(() => downloadPart(index), index * 500);
    });
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
