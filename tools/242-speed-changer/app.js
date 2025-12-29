/**
 * Speed Changer - Tool #242
 * Change audio playback speed
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let sourceNode = null;
let isPlaying = false;
let fileName = '';

const texts = {
    zh: {
        title: '速度調整',
        subtitle: '調整音訊播放速度',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '點擊或拖放音訊檔案',
        uploadHint: '支援 MP3, WAV, OGG 等格式',
        speedControl: '播放速度',
        presets: '快速預設',
        originalDuration: '原始時長',
        newDuration: '新時長',
        preview: '▶️ 預覽',
        stop: '⏹️ 停止',
        process: '⬇️ 處理並下載',
        processing: '處理中...',
        complete: '完成！'
    },
    en: {
        title: 'Speed Changer',
        subtitle: 'Change audio playback speed',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Click or drop audio file',
        uploadHint: 'Supports MP3, WAV, OGG formats',
        speedControl: 'Playback Speed',
        presets: 'Quick Presets',
        originalDuration: 'Original Duration',
        newDuration: 'New Duration',
        preview: '▶️ Preview',
        stop: '⏹️ Stop',
        process: '⬇️ Process & Download',
        processing: 'Processing...',
        complete: 'Complete!'
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

    document.getElementById('speedSlider').addEventListener('input', updateSpeedDisplay);

    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('speedSlider').value = btn.dataset.speed;
            updateSpeedDisplay();
        });
    });

    document.getElementById('previewBtn').addEventListener('click', togglePreview);
    document.getElementById('processBtn').addEventListener('click', processAndDownload);
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

    document.querySelector('.speed-control label').textContent = t.speedControl;
    document.querySelector('.preset-section label').textContent = t.presets;

    document.querySelectorAll('.info-label')[0].textContent = t.originalDuration;
    document.querySelectorAll('.info-label')[1].textContent = t.newDuration;

    document.getElementById('previewBtn').textContent = isPlaying ? t.stop : t.preview;
    document.getElementById('processBtn').textContent = t.process;
}

async function handleFile(file) {
    fileName = file.name.replace(/\.[^/.]+$/, '');

    const arrayBuffer = await file.arrayBuffer();
    originalBuffer = await audioContext.decodeAudioData(arrayBuffer);

    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileDuration').textContent = formatTime(originalBuffer.duration);
    document.getElementById('originalDuration').textContent = formatTime(originalBuffer.duration);

    updateSpeedDisplay();
    document.getElementById('editorSection').style.display = 'block';
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function updateSpeedDisplay() {
    const speed = parseFloat(document.getElementById('speedSlider').value);
    document.getElementById('speedValue').textContent = speed.toFixed(2);

    if (originalBuffer) {
        const newDuration = originalBuffer.duration / speed;
        document.getElementById('newDuration').textContent = formatTime(newDuration);
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

    const speed = parseFloat(document.getElementById('speedSlider').value);

    sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = originalBuffer;
    sourceNode.playbackRate.value = speed;
    sourceNode.connect(audioContext.destination);

    sourceNode.onended = () => {
        isPlaying = false;
        document.getElementById('previewBtn').textContent = texts[currentLang].preview;
    };

    sourceNode.start();
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

async function processAndDownload() {
    if (!originalBuffer) return;

    const progressSection = document.getElementById('progressSection');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    progressSection.style.display = 'block';
    progressFill.style.width = '0%';
    progressText.textContent = texts[currentLang].processing;

    const speed = parseFloat(document.getElementById('speedSlider').value);
    const newDuration = originalBuffer.duration / speed;

    const offlineContext = new OfflineAudioContext(
        originalBuffer.numberOfChannels,
        Math.ceil(audioContext.sampleRate * newDuration),
        audioContext.sampleRate
    );

    const source = offlineContext.createBufferSource();
    source.buffer = originalBuffer;
    source.playbackRate.value = speed;
    source.connect(offlineContext.destination);
    source.start();

    progressFill.style.width = '30%';

    const renderedBuffer = await offlineContext.startRendering();

    progressFill.style.width = '70%';

    const wavBlob = bufferToWav(renderedBuffer);

    progressFill.style.width = '100%';
    progressText.textContent = texts[currentLang].complete;

    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}-${speed}x.wav`;
    a.click();
    URL.revokeObjectURL(url);

    setTimeout(() => {
        progressSection.style.display = 'none';
    }, 2000);
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
