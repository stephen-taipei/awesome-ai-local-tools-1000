/**
 * Audio Speed Changer - Tool #291
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
        title: '音訊速度調整',
        subtitle: '調整音訊播放速度',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '點擊或拖放音訊檔案',
        uploadHint: '支援 MP3, WAV, OGG 等格式',
        speed: '播放速度',
        pitch: '保持音高',
        yes: '是',
        no: '否（變調）',
        preview: '▶️ 預覽',
        stop: '⏹️ 停止',
        download: '⬇️ 下載'
    },
    en: {
        title: 'Audio Speed Changer',
        subtitle: 'Change audio playback speed',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Click or drop audio file',
        uploadHint: 'Supports MP3, WAV, OGG formats',
        speed: 'Speed',
        pitch: 'Keep Pitch',
        yes: 'Yes',
        no: 'No (pitch shift)',
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
        document.getElementById('speedValue').textContent = parseFloat(e.target.value).toFixed(2) + 'x';
        updatePresetButtons(parseFloat(e.target.value));
    });

    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const speed = parseFloat(btn.dataset.speed);
            document.getElementById('speedSlider').value = speed;
            document.getElementById('speedValue').textContent = speed.toFixed(2) + 'x';
            updatePresetButtons(speed);
        });
    });

    document.getElementById('previewBtn').addEventListener('click', togglePreview);
    document.getElementById('downloadBtn').addEventListener('click', downloadProcessed);
}

function updatePresetButtons(speed) {
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.classList.toggle('active', parseFloat(btn.dataset.speed) === speed);
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

    document.querySelector('.upload-text').textContent = t.upload;
    document.querySelector('.upload-hint').textContent = t.uploadHint;

    const labels = document.querySelectorAll('.option-group label');
    labels[0].textContent = t.speed;
    labels[1].textContent = t.pitch;

    const pitchSelect = document.getElementById('pitchSelect');
    pitchSelect.options[0].textContent = t.yes;
    pitchSelect.options[1].textContent = t.no;

    document.getElementById('previewBtn').textContent = isPlaying ? t.stop : t.preview;
    document.getElementById('downloadBtn').textContent = t.download;
}

async function handleFile(file) {
    fileName = file.name.replace(/\.[^/.]+$/, '');

    const arrayBuffer = await file.arrayBuffer();
    originalBuffer = await audioContext.decodeAudioData(arrayBuffer);

    document.getElementById('editorSection').style.display = 'block';
}

async function changeSpeed(buffer) {
    const speed = parseFloat(document.getElementById('speedSlider').value);
    const keepPitch = document.getElementById('pitchSelect').value === 'yes';

    const sampleRate = buffer.sampleRate;
    const newLength = Math.floor(buffer.length / speed);

    if (!keepPitch) {
        // Simple resampling (changes pitch)
        const outputBuffer = audioContext.createBuffer(
            buffer.numberOfChannels,
            newLength,
            sampleRate
        );

        for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
            const input = buffer.getChannelData(ch);
            const output = outputBuffer.getChannelData(ch);

            for (let i = 0; i < newLength; i++) {
                const srcIndex = i * speed;
                const srcIndexFloor = Math.floor(srcIndex);
                const srcIndexCeil = Math.min(srcIndexFloor + 1, buffer.length - 1);
                const frac = srcIndex - srcIndexFloor;

                output[i] = input[srcIndexFloor] * (1 - frac) + input[srcIndexCeil] * frac;
            }
        }

        return outputBuffer;
    } else {
        // Use OfflineAudioContext for pitch-preserving speed change
        const offlineContext = new OfflineAudioContext(
            buffer.numberOfChannels,
            newLength,
            sampleRate
        );

        const source = offlineContext.createBufferSource();
        source.buffer = buffer;
        source.playbackRate.value = speed;
        source.connect(offlineContext.destination);
        source.start(0);

        return await offlineContext.startRendering();
    }
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

    const speed = parseFloat(document.getElementById('speedSlider').value);
    const keepPitch = document.getElementById('pitchSelect').value === 'yes';

    sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = originalBuffer;

    if (!keepPitch) {
        sourceNode.playbackRate.value = speed;
    } else {
        sourceNode.playbackRate.value = speed;
    }

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

    const processedBuffer = await changeSpeed(originalBuffer);
    const wavBlob = bufferToWav(processedBuffer);

    const speed = document.getElementById('speedSlider').value;
    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}-${speed}x.wav`;
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
