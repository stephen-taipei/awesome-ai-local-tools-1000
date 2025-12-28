/**
 * Audio Reverse - Tool #290
 * Reverse audio playback
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let sourceNode = null;
let isPlaying = false;
let fileName = '';

const texts = {
    zh: {
        title: '音訊倒轉',
        subtitle: '倒轉播放音訊',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '點擊或拖放音訊檔案',
        uploadHint: '支援 MP3, WAV, OGG 等格式',
        range: '倒轉範圍',
        start: '開始位置',
        end: '結束位置',
        info: '音訊倒轉可以創造有趣的聲音效果或找出隱藏的訊息。',
        preview: '▶️ 預覽',
        stop: '⏹️ 停止',
        download: '⬇️ 下載',
        full: '完整倒轉',
        partial: '部分倒轉'
    },
    en: {
        title: 'Audio Reverse',
        subtitle: 'Reverse audio playback',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Click or drop audio file',
        uploadHint: 'Supports MP3, WAV, OGG formats',
        range: 'Range',
        start: 'Start',
        end: 'End',
        info: 'Reversing audio can create interesting effects or reveal hidden messages.',
        preview: '▶️ Preview',
        stop: '⏹️ Stop',
        download: '⬇️ Download',
        full: 'Full Reverse',
        partial: 'Partial Reverse'
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

    document.getElementById('rangeSelect').addEventListener('change', (e) => {
        const isPartial = e.target.value === 'partial';
        document.getElementById('startGroup').style.display = isPartial ? 'flex' : 'none';
        document.getElementById('endGroup').style.display = isPartial ? 'flex' : 'none';
    });

    document.getElementById('startSlider').addEventListener('input', (e) => {
        document.getElementById('startValue').textContent = e.target.value + '%';
    });

    document.getElementById('endSlider').addEventListener('input', (e) => {
        document.getElementById('endValue').textContent = e.target.value + '%';
    });

    document.getElementById('previewBtn').addEventListener('click', togglePreview);
    document.getElementById('downloadBtn').addEventListener('click', downloadReversed);
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
    labels[0].textContent = t.range;
    labels[1].textContent = t.start;
    labels[2].textContent = t.end;

    const rangeSelect = document.getElementById('rangeSelect');
    rangeSelect.options[0].textContent = t.full;
    rangeSelect.options[1].textContent = t.partial;

    document.querySelector('.info-box p').textContent = t.info;

    document.getElementById('previewBtn').textContent = isPlaying ? t.stop : t.preview;
    document.getElementById('downloadBtn').textContent = t.download;
}

async function handleFile(file) {
    fileName = file.name.replace(/\.[^/.]+$/, '');

    const arrayBuffer = await file.arrayBuffer();
    originalBuffer = await audioContext.decodeAudioData(arrayBuffer);

    document.getElementById('editorSection').style.display = 'block';
}

function reverseAudio(buffer) {
    const range = document.getElementById('rangeSelect').value;
    const sampleRate = buffer.sampleRate;

    let startSample = 0;
    let endSample = buffer.length;

    if (range === 'partial') {
        const startPercent = parseInt(document.getElementById('startSlider').value) / 100;
        const endPercent = parseInt(document.getElementById('endSlider').value) / 100;
        startSample = Math.floor(buffer.length * startPercent);
        endSample = Math.floor(buffer.length * endPercent);
    }

    const outputBuffer = audioContext.createBuffer(
        buffer.numberOfChannels,
        buffer.length,
        sampleRate
    );

    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
        const input = buffer.getChannelData(ch);
        const output = outputBuffer.getChannelData(ch);

        // Copy non-reversed parts
        for (let i = 0; i < startSample; i++) {
            output[i] = input[i];
        }
        for (let i = endSample; i < buffer.length; i++) {
            output[i] = input[i];
        }

        // Reverse the selected range
        const reverseLength = endSample - startSample;
        for (let i = 0; i < reverseLength; i++) {
            output[startSample + i] = input[endSample - 1 - i];
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

    const reversedBuffer = reverseAudio(originalBuffer);

    sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = reversedBuffer;
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

async function downloadReversed() {
    if (!originalBuffer) return;

    const reversedBuffer = reverseAudio(originalBuffer);
    const wavBlob = bufferToWav(reversedBuffer);

    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}-reversed.wav`;
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
