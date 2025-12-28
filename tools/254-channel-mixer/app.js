/**
 * Channel Mixer - Tool #254
 * Mix and swap audio channels
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let mixedBuffer = null;
let sourceNode = null;
let isPlaying = false;
let fileName = '';

const presets = {
    normal: { ll: 100, rl: 0, lr: 0, rr: 100 },
    swap: { ll: 0, rl: 100, lr: 100, rr: 0 },
    mono: { ll: 50, rl: 50, lr: 50, rr: 50 },
    leftOnly: { ll: 100, rl: 0, lr: 100, rr: 0 },
    rightOnly: { ll: 0, rl: 100, lr: 0, rr: 100 }
};

const texts = {
    zh: {
        title: '聲道混合器',
        subtitle: '混合、交換或調整左右聲道',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '點擊或拖放立體聲音訊',
        uploadHint: '支援 MP3, WAV, OGG 等格式',
        leftOutput: '左聲道輸出',
        rightOutput: '右聲道輸出',
        leftInput: '左聲道輸入',
        rightInput: '右聲道輸入',
        presets: '快速預設',
        normal: '正常',
        swap: '交換聲道',
        mono: '混合為單聲道',
        leftOnly: '僅左聲道',
        rightOnly: '僅右聲道',
        preview: '▶️ 預覽',
        stop: '⏹️ 停止',
        download: '⬇️ 下載'
    },
    en: {
        title: 'Channel Mixer',
        subtitle: 'Mix, swap or adjust left/right channels',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Click or drop stereo audio',
        uploadHint: 'Supports MP3, WAV, OGG formats',
        leftOutput: 'Left Output',
        rightOutput: 'Right Output',
        leftInput: 'Left Input',
        rightInput: 'Right Input',
        presets: 'Quick Presets',
        normal: 'Normal',
        swap: 'Swap Channels',
        mono: 'Mix to Mono',
        leftOnly: 'Left Only',
        rightOnly: 'Right Only',
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

    // Sliders
    ['leftToLeft', 'rightToLeft', 'leftToRight', 'rightToRight'].forEach(id => {
        document.getElementById(id).addEventListener('input', (e) => {
            document.getElementById(id + 'Value').textContent = e.target.value + '%';
            document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
            if (originalBuffer) processAudio();
        });
    });

    // Presets
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const preset = presets[btn.dataset.preset];
            if (preset) {
                applyPreset(preset);
                document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            }
        });
    });

    document.getElementById('previewBtn').addEventListener('click', togglePreview);
    document.getElementById('downloadBtn').addEventListener('click', downloadMixed);
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

    document.querySelectorAll('.channel-name')[0].textContent = t.leftOutput;
    document.querySelectorAll('.channel-name')[1].textContent = t.rightOutput;

    const sliderLabels = document.querySelectorAll('.slider-group label');
    sliderLabels[0].textContent = t.leftInput;
    sliderLabels[1].textContent = t.rightInput;
    sliderLabels[2].textContent = t.leftInput;
    sliderLabels[3].textContent = t.rightInput;

    document.querySelector('.presets-section > label').textContent = t.presets;
    const presetBtns = document.querySelectorAll('.preset-btn');
    presetBtns[0].textContent = t.normal;
    presetBtns[1].textContent = t.swap;
    presetBtns[2].textContent = t.mono;
    presetBtns[3].textContent = t.leftOnly;
    presetBtns[4].textContent = t.rightOnly;

    document.getElementById('previewBtn').textContent = isPlaying ? t.stop : t.preview;
    document.getElementById('downloadBtn').textContent = t.download;
}

function applyPreset(preset) {
    document.getElementById('leftToLeft').value = preset.ll;
    document.getElementById('leftToLeftValue').textContent = preset.ll + '%';
    document.getElementById('rightToLeft').value = preset.rl;
    document.getElementById('rightToLeftValue').textContent = preset.rl + '%';
    document.getElementById('leftToRight').value = preset.lr;
    document.getElementById('leftToRightValue').textContent = preset.lr + '%';
    document.getElementById('rightToRight').value = preset.rr;
    document.getElementById('rightToRightValue').textContent = preset.rr + '%';

    if (originalBuffer) processAudio();
}

async function handleFile(file) {
    fileName = file.name.replace(/\.[^/.]+$/, '');

    const arrayBuffer = await file.arrayBuffer();
    originalBuffer = await audioContext.decodeAudioData(arrayBuffer);

    processAudio();
    document.getElementById('editorSection').style.display = 'block';
}

function processAudio() {
    const ll = parseInt(document.getElementById('leftToLeft').value) / 100;
    const rl = parseInt(document.getElementById('rightToLeft').value) / 100;
    const lr = parseInt(document.getElementById('leftToRight').value) / 100;
    const rr = parseInt(document.getElementById('rightToRight').value) / 100;

    mixedBuffer = mixChannels(originalBuffer, ll, rl, lr, rr);

    drawWaveform(document.getElementById('leftOutputCanvas'), mixedBuffer.getChannelData(0), '#3b82f6');
    drawWaveform(document.getElementById('rightOutputCanvas'), mixedBuffer.getChannelData(1), '#60a5fa');
}

function mixChannels(buffer, ll, rl, lr, rr) {
    const left = buffer.getChannelData(0);
    const right = buffer.numberOfChannels >= 2 ? buffer.getChannelData(1) : left;

    const mixed = audioContext.createBuffer(2, buffer.length, buffer.sampleRate);
    const outLeft = mixed.getChannelData(0);
    const outRight = mixed.getChannelData(1);

    for (let i = 0; i < buffer.length; i++) {
        outLeft[i] = Math.max(-1, Math.min(1, left[i] * ll + right[i] * rl));
        outRight[i] = Math.max(-1, Math.min(1, left[i] * lr + right[i] * rr));
    }

    return mixed;
}

function drawWaveform(canvas, data, color) {
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = 50 * 2;
    ctx.scale(2, 2);

    const width = canvas.offsetWidth;
    const height = 50;

    ctx.fillStyle = '#1e293b';
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

function togglePreview() {
    if (isPlaying) {
        stopPreview();
    } else {
        startPreview();
    }
}

function startPreview() {
    if (!mixedBuffer) return;

    audioContext.resume();
    isPlaying = true;

    sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = mixedBuffer;
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

function downloadMixed() {
    if (!mixedBuffer) return;

    const wavBlob = bufferToWav(mixedBuffer);

    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}-mixed.wav`;
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
