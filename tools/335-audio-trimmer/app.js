/**
 * Audio Trimmer - Tool #335
 * Trim audio to desired length
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let processedBuffer = null;
let audioDuration = 0;

const texts = {
    zh: {
        title: '音頻裁剪',
        subtitle: '裁剪音頻至所需長度',
        privacy: '100% 本地處理 · 零資料上傳',
        start: '開始時間',
        end: '結束時間',
        duration: '選取長度',
        preview: '▶️ 預覽',
        process: '✂️ 裁剪音頻',
        download: '⬇️ 下載',
        result: '處理結果',
        upload: '拖放音頻檔案至此或點擊上傳',
        uploadHint: '支援 MP3, WAV, OGG, M4A',
        processing: '處理中...'
    },
    en: {
        title: 'Audio Trimmer',
        subtitle: 'Trim audio to desired length',
        privacy: '100% Local Processing · No Data Upload',
        start: 'Start Time',
        end: 'End Time',
        duration: 'Selection',
        preview: '▶️ Preview',
        process: '✂️ Trim Audio',
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
    document.getElementById('previewBtn').addEventListener('click', previewSelection);
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
    const startSlider = document.getElementById('startSlider');
    const endSlider = document.getElementById('endSlider');
    const startTime = document.getElementById('startTime');
    const endTime = document.getElementById('endTime');

    startSlider.addEventListener('input', () => {
        const startVal = parseFloat(startSlider.value);
        const endVal = parseFloat(endSlider.value);
        if (startVal >= endVal) {
            startSlider.value = endVal - 0.1;
        }
        updateFromSliders();
    });

    endSlider.addEventListener('input', () => {
        const startVal = parseFloat(startSlider.value);
        const endVal = parseFloat(endSlider.value);
        if (endVal <= startVal) {
            endSlider.value = startVal + 0.1;
        }
        updateFromSliders();
    });

    startTime.addEventListener('change', () => updateFromInputs());
    endTime.addEventListener('change', () => updateFromInputs());
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const ms = Math.round((secs % 1) * 1000);
    return `${mins.toString().padStart(2, '0')}:${Math.floor(secs).toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

function parseTime(timeStr) {
    const match = timeStr.match(/^(\d+):(\d+)\.?(\d*)$/);
    if (!match) return 0;
    const mins = parseInt(match[1]);
    const secs = parseInt(match[2]);
    const ms = match[3] ? parseInt(match[3].padEnd(3, '0')) / 1000 : 0;
    return mins * 60 + secs + ms;
}

function updateFromSliders() {
    const startPercent = parseFloat(document.getElementById('startSlider').value);
    const endPercent = parseFloat(document.getElementById('endSlider').value);
    const startSec = (startPercent / 100) * audioDuration;
    const endSec = (endPercent / 100) * audioDuration;

    document.getElementById('startTime').value = formatTime(startSec);
    document.getElementById('endTime').value = formatTime(endSec);
    updateSelectionOverlay();
    updateDurationInfo();
}

function updateFromInputs() {
    const startSec = parseTime(document.getElementById('startTime').value);
    const endSec = parseTime(document.getElementById('endTime').value);

    document.getElementById('startSlider').value = (startSec / audioDuration) * 100;
    document.getElementById('endSlider').value = (endSec / audioDuration) * 100;
    updateSelectionOverlay();
    updateDurationInfo();
}

function updateSelectionOverlay() {
    const overlay = document.getElementById('selectionOverlay');
    const startPercent = parseFloat(document.getElementById('startSlider').value);
    const endPercent = parseFloat(document.getElementById('endSlider').value);

    overlay.style.left = startPercent + '%';
    overlay.style.width = (endPercent - startPercent) + '%';
}

function updateDurationInfo() {
    const startSec = parseTime(document.getElementById('startTime').value);
    const endSec = parseTime(document.getElementById('endTime').value);
    const duration = endSec - startSec;
    document.getElementById('durationInfo').textContent =
        `${texts[currentLang].duration}: ${formatTime(duration)}`;
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');
    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.getElementById('startLabel').textContent = t.start;
    document.getElementById('endLabel').textContent = t.end;
    document.getElementById('previewBtn').textContent = t.preview;
    document.getElementById('processBtn').textContent = t.process;
    document.getElementById('downloadBtn').textContent = t.download;
    document.getElementById('resultTitle').textContent = t.result;
    document.querySelector('.upload-area p').textContent = t.upload;
    document.querySelector('.upload-hint').textContent = t.uploadHint;
    updateDurationInfo();
}

function drawWaveform(buffer) {
    const canvas = document.getElementById('waveformCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;

    const data = buffer.getChannelData(0);
    const step = Math.ceil(data.length / canvas.width);
    const amp = canvas.height / 2;

    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 1;
    ctx.beginPath();

    for (let i = 0; i < canvas.width; i++) {
        let min = 1.0, max = -1.0;
        for (let j = 0; j < step; j++) {
            const datum = data[(i * step) + j];
            if (datum < min) min = datum;
            if (datum > max) max = datum;
        }
        ctx.moveTo(i, (1 + min) * amp);
        ctx.lineTo(i, (1 + max) * amp);
    }

    ctx.stroke();
}

async function handleFile(file) {
    const arrayBuffer = await file.arrayBuffer();
    originalBuffer = await audioContext.decodeAudioData(arrayBuffer);
    audioDuration = originalBuffer.duration;

    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('audioLoaded').style.display = 'block';
    document.getElementById('fileInfo').textContent = `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
    document.getElementById('originalAudio').src = URL.createObjectURL(file);

    document.getElementById('endTime').value = formatTime(audioDuration);
    document.getElementById('endSlider').value = 100;
    updateSelectionOverlay();
    updateDurationInfo();
    drawWaveform(originalBuffer);

    document.getElementById('optionsSection').style.display = 'block';
    document.getElementById('actionSection').style.display = 'flex';
}

function previewSelection() {
    if (!originalBuffer) return;

    const startSec = parseTime(document.getElementById('startTime').value);
    const endSec = parseTime(document.getElementById('endTime').value);

    const audio = document.getElementById('originalAudio');
    audio.currentTime = startSec;
    audio.play();

    // Stop at end time
    const checkTime = () => {
        if (audio.currentTime >= endSec) {
            audio.pause();
        } else {
            requestAnimationFrame(checkTime);
        }
    };
    requestAnimationFrame(checkTime);
}

async function processAudio() {
    if (!originalBuffer) return;
    const processBtn = document.getElementById('processBtn');
    const originalText = processBtn.textContent;
    processBtn.textContent = texts[currentLang].processing;
    processBtn.disabled = true;
    await new Promise(resolve => setTimeout(resolve, 10));

    const startSec = parseTime(document.getElementById('startTime').value);
    const endSec = parseTime(document.getElementById('endTime').value);

    const channels = originalBuffer.numberOfChannels;
    const sampleRate = originalBuffer.sampleRate;

    const startSample = Math.floor(startSec * sampleRate);
    const endSample = Math.floor(endSec * sampleRate);
    const newLength = endSample - startSample;

    processedBuffer = audioContext.createBuffer(channels, newLength, sampleRate);

    for (let ch = 0; ch < channels; ch++) {
        const inputData = originalBuffer.getChannelData(ch);
        const outputData = processedBuffer.getChannelData(ch);

        for (let i = 0; i < newLength; i++) {
            outputData[i] = inputData[startSample + i];
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
    a.download = 'trimmed-audio.wav';
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
