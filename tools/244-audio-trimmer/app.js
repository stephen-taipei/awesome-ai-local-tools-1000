/**
 * Audio Trimmer - Tool #244
 * Trim audio files locally
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let sourceNode = null;
let isPlaying = false;
let fileName = '';
let startTime = 0;
let endTime = 0;
let isDragging = null;

const texts = {
    zh: {
        title: '音訊裁剪',
        subtitle: '剪輯音訊的起點與終點',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '點擊或拖放音訊檔案',
        uploadHint: '支援 MP3, WAV, OGG 等格式',
        startTime: '起始時間',
        endTime: '結束時間',
        seconds: '秒',
        originalDuration: '原始時長',
        selectedDuration: '選取時長',
        preview: '▶️ 預覽選取',
        stop: '⏹️ 停止',
        download: '⬇️ 下載裁剪'
    },
    en: {
        title: 'Audio Trimmer',
        subtitle: 'Trim audio start and end points',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Click or drop audio file',
        uploadHint: 'Supports MP3, WAV, OGG formats',
        startTime: 'Start Time',
        endTime: 'End Time',
        seconds: 'sec',
        originalDuration: 'Original Duration',
        selectedDuration: 'Selected Duration',
        preview: '▶️ Preview',
        stop: '⏹️ Stop',
        download: '⬇️ Download Trimmed'
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

    document.getElementById('startTime').addEventListener('input', handleTimeInput);
    document.getElementById('endTime').addEventListener('input', handleTimeInput);

    document.getElementById('previewBtn').addEventListener('click', togglePreview);
    document.getElementById('downloadBtn').addEventListener('click', downloadTrimmed);

    // Handle drag
    const canvas = document.getElementById('waveformCanvas');
    canvas.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
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

    document.querySelectorAll('.time-group label')[0].textContent = t.startTime;
    document.querySelectorAll('.time-group label')[1].textContent = t.endTime;
    document.querySelectorAll('.time-input span').forEach(s => s.textContent = t.seconds);

    document.querySelectorAll('.info-label')[0].textContent = t.originalDuration;
    document.querySelectorAll('.info-label')[1].textContent = t.selectedDuration;

    document.getElementById('previewBtn').textContent = isPlaying ? t.stop : t.preview;
    document.getElementById('downloadBtn').textContent = t.download;
}

async function handleFile(file) {
    fileName = file.name.replace(/\.[^/.]+$/, '');

    const arrayBuffer = await file.arrayBuffer();
    originalBuffer = await audioContext.decodeAudioData(arrayBuffer);

    startTime = 0;
    endTime = originalBuffer.duration;

    document.getElementById('startTime').value = startTime.toFixed(1);
    document.getElementById('startTime').max = originalBuffer.duration;
    document.getElementById('endTime').value = endTime.toFixed(1);
    document.getElementById('endTime').max = originalBuffer.duration;

    document.getElementById('originalDuration').textContent = formatTime(originalBuffer.duration);
    updateSelectedDuration();

    drawWaveform();
    updateSelection();

    document.getElementById('editorSection').style.display = 'block';
}

function drawWaveform() {
    const canvas = document.getElementById('waveformCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = canvas.offsetWidth * 2;
    canvas.height = 120 * 2;
    ctx.scale(2, 2);

    const width = canvas.offsetWidth;
    const height = 120;
    const data = originalBuffer.getChannelData(0);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    ctx.beginPath();
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;

    for (let i = 0; i < width; i++) {
        const index = Math.floor(i * data.length / width);
        const y = (1 + data[index]) * height / 2;

        if (i === 0) ctx.moveTo(i, y);
        else ctx.lineTo(i, y);
    }
    ctx.stroke();
}

function handleTimeInput() {
    startTime = parseFloat(document.getElementById('startTime').value) || 0;
    endTime = parseFloat(document.getElementById('endTime').value) || originalBuffer.duration;

    startTime = Math.max(0, Math.min(startTime, originalBuffer.duration));
    endTime = Math.max(startTime, Math.min(endTime, originalBuffer.duration));

    updateSelection();
    updateSelectedDuration();
}

function handleMouseDown(e) {
    if (!originalBuffer) return;

    const canvas = document.getElementById('waveformCanvas');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    const time = percent * originalBuffer.duration;

    const startX = (startTime / originalBuffer.duration) * rect.width;
    const endX = (endTime / originalBuffer.duration) * rect.width;

    if (Math.abs(x - startX) < 15) {
        isDragging = 'start';
    } else if (Math.abs(x - endX) < 15) {
        isDragging = 'end';
    } else {
        isDragging = 'start';
        startTime = time;
        document.getElementById('startTime').value = startTime.toFixed(1);
        updateSelection();
        updateSelectedDuration();
    }
}

function handleMouseMove(e) {
    if (!isDragging || !originalBuffer) return;

    const canvas = document.getElementById('waveformCanvas');
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const time = (x / rect.width) * originalBuffer.duration;

    if (isDragging === 'start') {
        startTime = Math.min(time, endTime - 0.1);
        document.getElementById('startTime').value = startTime.toFixed(1);
    } else {
        endTime = Math.max(time, startTime + 0.1);
        document.getElementById('endTime').value = endTime.toFixed(1);
    }

    updateSelection();
    updateSelectedDuration();
}

function handleMouseUp() {
    isDragging = null;
}

function updateSelection() {
    if (!originalBuffer) return;

    const container = document.querySelector('.waveform-container');
    const width = container.offsetWidth;

    const startPercent = (startTime / originalBuffer.duration) * 100;
    const endPercent = (endTime / originalBuffer.duration) * 100;

    document.getElementById('startHandle').style.left = startPercent + '%';
    document.getElementById('endHandle').style.left = endPercent + '%';
    document.getElementById('selection').style.left = startPercent + '%';
    document.getElementById('selection').style.width = (endPercent - startPercent) + '%';
}

function updateSelectedDuration() {
    const duration = endTime - startTime;
    document.getElementById('selectedDuration').textContent = formatTime(duration);
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms}`;
}

function togglePreview() {
    if (isPlaying) {
        stopPreview();
    } else {
        startPreview();
    }
}

function startPreview() {
    if (!originalBuffer) return;

    audioContext.resume();
    isPlaying = true;

    sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = originalBuffer;
    sourceNode.connect(audioContext.destination);

    sourceNode.onended = () => {
        isPlaying = false;
        document.getElementById('previewBtn').textContent = texts[currentLang].preview;
    };

    sourceNode.start(0, startTime, endTime - startTime);
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

function downloadTrimmed() {
    if (!originalBuffer) return;

    const trimmedBuffer = trimAudioBuffer(originalBuffer, startTime, endTime);
    const wavBlob = bufferToWav(trimmedBuffer);

    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}-trimmed.wav`;
    a.click();
    URL.revokeObjectURL(url);
}

function trimAudioBuffer(buffer, start, end) {
    const sampleRate = buffer.sampleRate;
    const startSample = Math.floor(start * sampleRate);
    const endSample = Math.floor(end * sampleRate);
    const length = endSample - startSample;

    const trimmedBuffer = audioContext.createBuffer(
        buffer.numberOfChannels,
        length,
        sampleRate
    );

    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
        const inputData = buffer.getChannelData(channel);
        const outputData = trimmedBuffer.getChannelData(channel);

        for (let i = 0; i < length; i++) {
            outputData[i] = inputData[startSample + i];
        }
    }

    return trimmedBuffer;
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
