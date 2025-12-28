/**
 * Audio Distortion - Tool #258
 * Add distortion effect to audio
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let sourceNode = null;
let isPlaying = false;
let fileName = '';
let currentPreset = 'soft';

const texts = {
    zh: {
        title: '音訊失真',
        subtitle: '為音訊添加失真效果',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '點擊或拖放音訊檔案',
        uploadHint: '支援 MP3, WAV, OGG 等格式',
        distortionType: '失真類型',
        soft: '軟削波',
        hard: '硬削波',
        fuzz: '模糊',
        bitcrush: '位元破碎',
        drive: '失真量',
        output: '輸出音量',
        mix: '混合比例',
        preview: '▶️ 預覽',
        stop: '⏹️ 停止',
        download: '⬇️ 下載'
    },
    en: {
        title: 'Audio Distortion',
        subtitle: 'Add distortion effect to audio',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Click or drop audio file',
        uploadHint: 'Supports MP3, WAV, OGG formats',
        distortionType: 'Distortion Type',
        soft: 'Soft Clip',
        hard: 'Hard Clip',
        fuzz: 'Fuzz',
        bitcrush: 'Bitcrush',
        drive: 'Drive',
        output: 'Output',
        mix: 'Mix',
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

    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentPreset = btn.dataset.preset;
            document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    document.getElementById('driveSlider').addEventListener('input', (e) => {
        document.getElementById('driveValue').textContent = e.target.value + '%';
    });

    document.getElementById('outputSlider').addEventListener('input', (e) => {
        document.getElementById('outputValue').textContent = e.target.value + '%';
    });

    document.getElementById('mixSlider').addEventListener('input', (e) => {
        document.getElementById('mixValue').textContent = e.target.value + '%';
    });

    document.getElementById('previewBtn').addEventListener('click', togglePreview);
    document.getElementById('downloadBtn').addEventListener('click', downloadDistorted);
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

    document.querySelector('.presets-section > label').textContent = t.distortionType;
    const presetBtns = document.querySelectorAll('.preset-btn');
    presetBtns[0].textContent = t.soft;
    presetBtns[1].textContent = t.hard;
    presetBtns[2].textContent = t.fuzz;
    presetBtns[3].textContent = t.bitcrush;

    document.querySelectorAll('.option-group label')[0].textContent = t.drive;
    document.querySelectorAll('.option-group label')[1].textContent = t.output;
    document.querySelectorAll('.option-group label')[2].textContent = t.mix;

    document.getElementById('previewBtn').textContent = isPlaying ? t.stop : t.preview;
    document.getElementById('downloadBtn').textContent = t.download;
}

async function handleFile(file) {
    fileName = file.name.replace(/\.[^/.]+$/, '');

    const arrayBuffer = await file.arrayBuffer();
    originalBuffer = await audioContext.decodeAudioData(arrayBuffer);

    document.getElementById('editorSection').style.display = 'block';
}

function applyDistortion(buffer) {
    const drive = parseInt(document.getElementById('driveSlider').value) / 100;
    const output = parseInt(document.getElementById('outputSlider').value) / 100;
    const mix = parseInt(document.getElementById('mixSlider').value) / 100;

    const outputBuffer = audioContext.createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);

    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
        const input = buffer.getChannelData(ch);
        const out = outputBuffer.getChannelData(ch);

        for (let i = 0; i < buffer.length; i++) {
            const dry = input[i];
            let wet;

            // Apply gain (drive)
            let sample = input[i] * (1 + drive * 10);

            switch (currentPreset) {
                case 'soft':
                    // Soft clipping using tanh
                    wet = Math.tanh(sample * (1 + drive * 3));
                    break;

                case 'hard':
                    // Hard clipping
                    wet = Math.max(-1, Math.min(1, sample * (1 + drive * 5)));
                    break;

                case 'fuzz':
                    // Fuzz distortion
                    const sign = sample >= 0 ? 1 : -1;
                    wet = sign * (1 - Math.exp(-Math.abs(sample) * (1 + drive * 8)));
                    break;

                case 'bitcrush':
                    // Bitcrushing effect
                    const bits = Math.max(2, Math.floor(16 - drive * 14));
                    const levels = Math.pow(2, bits);
                    wet = Math.round(sample * levels) / levels;
                    break;

                default:
                    wet = sample;
            }

            // Mix dry and wet
            out[i] = (dry * (1 - mix) + wet * mix) * output;

            // Final clipping
            out[i] = Math.max(-1, Math.min(1, out[i]));
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

    const distortedBuffer = applyDistortion(originalBuffer);

    sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = distortedBuffer;
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

async function downloadDistorted() {
    if (!originalBuffer) return;

    const distortedBuffer = applyDistortion(originalBuffer);
    const wavBlob = bufferToWav(distortedBuffer);

    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}-distorted.wav`;
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
