/**
 * Audio Time Stretcher - Tool #265
 * Change audio speed without changing pitch
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let sourceNode = null;
let isPlaying = false;
let fileName = '';

const texts = {
    zh: {
        title: '音訊變速',
        subtitle: '調整速度而不改變音高',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '點擊或拖放音訊檔案',
        uploadHint: '支援 MP3, WAV, OGG 等格式',
        speed: '速度倍率',
        originalDuration: '原始長度',
        newDuration: '新長度',
        preview: '▶️ 預覽',
        stop: '⏹️ 停止',
        download: '⬇️ 下載'
    },
    en: {
        title: 'Audio Time Stretcher',
        subtitle: 'Change speed without changing pitch',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Click or drop audio file',
        uploadHint: 'Supports MP3, WAV, OGG formats',
        speed: 'Speed',
        originalDuration: 'Original',
        newDuration: 'New',
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

    document.getElementById('speedSlider').addEventListener('input', (e) => {
        const speed = parseFloat(e.target.value);
        document.getElementById('speedValue').textContent = speed.toFixed(2) + 'x';
        updatePresetButtons(speed);
        updateDurationInfo();
    });

    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const speed = parseFloat(btn.dataset.speed);
            document.getElementById('speedSlider').value = speed;
            document.getElementById('speedValue').textContent = speed.toFixed(2) + 'x';
            updatePresetButtons(speed);
            updateDurationInfo();
        });
    });

    document.getElementById('previewBtn').addEventListener('click', togglePreview);
    document.getElementById('downloadBtn').addEventListener('click', downloadTimeStretched);
}

function updatePresetButtons(speed) {
    document.querySelectorAll('.preset-btn').forEach(btn => {
        const btnSpeed = parseFloat(btn.dataset.speed);
        btn.classList.toggle('active', Math.abs(btnSpeed - speed) < 0.01);
    });
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}

function updateDurationInfo() {
    if (!originalBuffer) return;

    const originalDuration = originalBuffer.duration;
    const speed = parseFloat(document.getElementById('speedSlider').value);
    const newDuration = originalDuration / speed;

    const t = texts[currentLang];
    document.getElementById('durationLabel').textContent = `${t.originalDuration}: ${formatTime(originalDuration)}`;
    document.getElementById('newDurationLabel').textContent = `${t.newDuration}: ${formatTime(newDuration)}`;
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

    document.querySelectorAll('.option-group label')[0].textContent = t.speed;

    document.getElementById('previewBtn').textContent = isPlaying ? t.stop : t.preview;
    document.getElementById('downloadBtn').textContent = t.download;

    updateDurationInfo();
}

async function handleFile(file) {
    fileName = file.name.replace(/\.[^/.]+$/, '');

    const arrayBuffer = await file.arrayBuffer();
    originalBuffer = await audioContext.decodeAudioData(arrayBuffer);

    document.getElementById('editorSection').style.display = 'block';
    updateDurationInfo();
}

function applyTimeStretch(buffer) {
    const speed = parseFloat(document.getElementById('speedSlider').value);

    const sampleRate = buffer.sampleRate;
    const newLength = Math.floor(buffer.length / speed);

    const outputBuffer = audioContext.createBuffer(buffer.numberOfChannels, newLength, sampleRate);

    // Simple time stretching using overlap-add with windowing
    const windowSize = 2048;
    const hopSize = Math.floor(windowSize / 4);
    const outputHopSize = Math.floor(hopSize / speed);

    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
        const input = buffer.getChannelData(ch);
        const output = outputBuffer.getChannelData(ch);

        // Fill with zeros first
        output.fill(0);

        // Create Hann window
        const window = new Float32Array(windowSize);
        for (let i = 0; i < windowSize; i++) {
            window[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / (windowSize - 1)));
        }

        let outputPos = 0;
        for (let inputPos = 0; inputPos < buffer.length - windowSize; inputPos += hopSize) {
            // Extract and window the input chunk
            for (let i = 0; i < windowSize && outputPos + i < newLength; i++) {
                const srcIdx = inputPos + i;
                if (srcIdx < buffer.length) {
                    output[outputPos + i] += input[srcIdx] * window[i];
                }
            }
            outputPos += outputHopSize;

            if (outputPos >= newLength) break;
        }

        // Normalize to prevent clipping
        let max = 0;
        for (let i = 0; i < newLength; i++) {
            max = Math.max(max, Math.abs(output[i]));
        }
        if (max > 1) {
            for (let i = 0; i < newLength; i++) {
                output[i] /= max;
            }
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

    const stretchedBuffer = applyTimeStretch(originalBuffer);

    sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = stretchedBuffer;
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

async function downloadTimeStretched() {
    if (!originalBuffer) return;

    const stretchedBuffer = applyTimeStretch(originalBuffer);
    const wavBlob = bufferToWav(stretchedBuffer);

    const speed = parseFloat(document.getElementById('speedSlider').value);
    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}-${speed.toFixed(2)}x.wav`;
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
