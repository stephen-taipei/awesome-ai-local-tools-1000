/**
 * Audio Fade - Tool #247
 * Add fade in/out effects to audio
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let sourceNode = null;
let isPlaying = false;
let fileName = '';

const texts = {
    zh: {
        title: '音訊淡化',
        subtitle: '為音訊添加淡入淡出效果',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '點擊或拖放音訊檔案',
        uploadHint: '支援 MP3, WAV, OGG 等格式',
        fadeIn: '淡入時長',
        fadeOut: '淡出時長',
        curveType: '曲線類型',
        linear: '線性',
        exponential: '指數',
        logarithmic: '對數',
        scurve: 'S 曲線',
        duration: '音訊時長',
        seconds: '秒',
        preview: '▶️ 預覽',
        stop: '⏹️ 停止',
        download: '⬇️ 下載'
    },
    en: {
        title: 'Audio Fade',
        subtitle: 'Add fade in/out effects to audio',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Click or drop audio file',
        uploadHint: 'Supports MP3, WAV, OGG formats',
        fadeIn: 'Fade In',
        fadeOut: 'Fade Out',
        curveType: 'Curve Type',
        linear: 'Linear',
        exponential: 'Exponential',
        logarithmic: 'Logarithmic',
        scurve: 'S-Curve',
        duration: 'Duration',
        seconds: 'sec',
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

    document.getElementById('fadeInSlider').addEventListener('input', (e) => {
        document.getElementById('fadeInValue').textContent = e.target.value + ' ' + texts[currentLang].seconds;
        updateOverlays();
    });

    document.getElementById('fadeOutSlider').addEventListener('input', (e) => {
        document.getElementById('fadeOutValue').textContent = e.target.value + ' ' + texts[currentLang].seconds;
        updateOverlays();
    });

    document.getElementById('previewBtn').addEventListener('click', togglePreview);
    document.getElementById('downloadBtn').addEventListener('click', downloadFaded);
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

    document.querySelectorAll('.option-group label')[0].textContent = t.fadeIn;
    document.querySelectorAll('.option-group label')[1].textContent = t.fadeOut;
    document.querySelectorAll('.option-group label')[2].textContent = t.curveType;

    const curveSelect = document.getElementById('curveType');
    curveSelect.options[0].text = t.linear;
    curveSelect.options[1].text = t.exponential;
    curveSelect.options[2].text = t.logarithmic;
    curveSelect.options[3].text = t.scurve;

    document.getElementById('fadeInValue').textContent =
        document.getElementById('fadeInSlider').value + ' ' + t.seconds;
    document.getElementById('fadeOutValue').textContent =
        document.getElementById('fadeOutSlider').value + ' ' + t.seconds;

    document.querySelector('.info-label').textContent = t.duration;
    document.getElementById('previewBtn').textContent = isPlaying ? t.stop : t.preview;
    document.getElementById('downloadBtn').textContent = t.download;
}

async function handleFile(file) {
    fileName = file.name.replace(/\.[^/.]+$/, '');

    const arrayBuffer = await file.arrayBuffer();
    originalBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // Update max values for sliders
    const maxFade = Math.min(10, originalBuffer.duration / 2);
    document.getElementById('fadeInSlider').max = maxFade;
    document.getElementById('fadeOutSlider').max = maxFade;

    document.getElementById('duration').textContent = formatTime(originalBuffer.duration);

    drawWaveform();
    updateOverlays();
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

function updateOverlays() {
    if (!originalBuffer) return;

    const fadeIn = parseFloat(document.getElementById('fadeInSlider').value);
    const fadeOut = parseFloat(document.getElementById('fadeOutSlider').value);
    const duration = originalBuffer.duration;

    const fadeInPercent = (fadeIn / duration) * 100;
    const fadeOutPercent = (fadeOut / duration) * 100;

    document.getElementById('fadeInOverlay').style.width = fadeInPercent + '%';
    document.getElementById('fadeOutOverlay').style.width = fadeOutPercent + '%';
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function applyFade(buffer) {
    const fadeIn = parseFloat(document.getElementById('fadeInSlider').value);
    const fadeOut = parseFloat(document.getElementById('fadeOutSlider').value);
    const curveType = document.getElementById('curveType').value;

    const sampleRate = buffer.sampleRate;
    const fadeInSamples = Math.floor(fadeIn * sampleRate);
    const fadeOutSamples = Math.floor(fadeOut * sampleRate);

    const fadedBuffer = audioContext.createBuffer(
        buffer.numberOfChannels,
        buffer.length,
        sampleRate
    );

    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
        const input = buffer.getChannelData(ch);
        const output = fadedBuffer.getChannelData(ch);

        for (let i = 0; i < buffer.length; i++) {
            let gain = 1;

            // Fade in
            if (i < fadeInSamples && fadeInSamples > 0) {
                const progress = i / fadeInSamples;
                gain = applyCurve(progress, curveType);
            }

            // Fade out
            if (i >= buffer.length - fadeOutSamples && fadeOutSamples > 0) {
                const progress = (buffer.length - i) / fadeOutSamples;
                gain *= applyCurve(progress, curveType);
            }

            output[i] = input[i] * gain;
        }
    }

    return fadedBuffer;
}

function applyCurve(progress, curveType) {
    switch (curveType) {
        case 'exponential':
            return Math.pow(progress, 2);
        case 'logarithmic':
            return Math.sqrt(progress);
        case 'scurve':
            return progress < 0.5
                ? 2 * Math.pow(progress, 2)
                : 1 - 2 * Math.pow(1 - progress, 2);
        default: // linear
            return progress;
    }
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

    const fadedBuffer = applyFade(originalBuffer);
    sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = fadedBuffer;
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

function downloadFaded() {
    if (!originalBuffer) return;

    const fadedBuffer = applyFade(originalBuffer);
    const wavBlob = bufferToWav(fadedBuffer);

    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}-faded.wav`;
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
