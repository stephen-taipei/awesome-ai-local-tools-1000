/**
 * Audio Echo - Tool #257
 * Add echo/delay effect to audio
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let sourceNode = null;
let isPlaying = false;
let fileName = '';

const presets = {
    slapback: { delay: 80, feedback: 20, mix: 40, repeat: 2 },
    quarter: { delay: 250, feedback: 40, mix: 50, repeat: 4 },
    half: { delay: 500, feedback: 50, mix: 45, repeat: 5 },
    long: { delay: 800, feedback: 60, mix: 40, repeat: 8 }
};

const texts = {
    zh: {
        title: '音訊回音',
        subtitle: '為音訊添加回音延遲效果',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '點擊或拖放音訊檔案',
        uploadHint: '支援 MP3, WAV, OGG 等格式',
        echoPresets: '回音預設',
        slapback: '短回音',
        quarter: '1/4 拍',
        half: '1/2 拍',
        long: '長回音',
        delayTime: '延遲時間',
        feedback: '回授量',
        mix: '混合比例',
        repeat: '回音次數',
        preview: '▶️ 預覽',
        stop: '⏹️ 停止',
        download: '⬇️ 下載'
    },
    en: {
        title: 'Audio Echo',
        subtitle: 'Add echo/delay effect to audio',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Click or drop audio file',
        uploadHint: 'Supports MP3, WAV, OGG formats',
        echoPresets: 'Echo Presets',
        slapback: 'Slapback',
        quarter: '1/4 Note',
        half: '1/2 Note',
        long: 'Long Echo',
        delayTime: 'Delay Time',
        feedback: 'Feedback',
        mix: 'Mix',
        repeat: 'Repeats',
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
            const preset = presets[btn.dataset.preset];
            if (preset) {
                applyPreset(preset);
                document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            }
        });
    });

    document.getElementById('delaySlider').addEventListener('input', (e) => {
        document.getElementById('delayValue').textContent = e.target.value + ' ms';
    });

    document.getElementById('feedbackSlider').addEventListener('input', (e) => {
        document.getElementById('feedbackValue').textContent = e.target.value + '%';
    });

    document.getElementById('mixSlider').addEventListener('input', (e) => {
        document.getElementById('mixValue').textContent = e.target.value + '%';
    });

    document.getElementById('repeatSlider').addEventListener('input', (e) => {
        document.getElementById('repeatValue').textContent = e.target.value;
    });

    document.getElementById('previewBtn').addEventListener('click', togglePreview);
    document.getElementById('downloadBtn').addEventListener('click', downloadEcho);
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

    document.querySelector('.presets-section > label').textContent = t.echoPresets;
    const presetBtns = document.querySelectorAll('.preset-btn');
    presetBtns[0].textContent = t.slapback;
    presetBtns[1].textContent = t.quarter;
    presetBtns[2].textContent = t.half;
    presetBtns[3].textContent = t.long;

    document.querySelectorAll('.option-group label')[0].textContent = t.delayTime;
    document.querySelectorAll('.option-group label')[1].textContent = t.feedback;
    document.querySelectorAll('.option-group label')[2].textContent = t.mix;
    document.querySelectorAll('.option-group label')[3].textContent = t.repeat;

    document.getElementById('previewBtn').textContent = isPlaying ? t.stop : t.preview;
    document.getElementById('downloadBtn').textContent = t.download;
}

function applyPreset(preset) {
    document.getElementById('delaySlider').value = preset.delay;
    document.getElementById('delayValue').textContent = preset.delay + ' ms';
    document.getElementById('feedbackSlider').value = preset.feedback;
    document.getElementById('feedbackValue').textContent = preset.feedback + '%';
    document.getElementById('mixSlider').value = preset.mix;
    document.getElementById('mixValue').textContent = preset.mix + '%';
    document.getElementById('repeatSlider').value = preset.repeat;
    document.getElementById('repeatValue').textContent = preset.repeat;
}

async function handleFile(file) {
    fileName = file.name.replace(/\.[^/.]+$/, '');

    const arrayBuffer = await file.arrayBuffer();
    originalBuffer = await audioContext.decodeAudioData(arrayBuffer);

    document.getElementById('editorSection').style.display = 'block';
}

function applyEcho(buffer) {
    const delayMs = parseInt(document.getElementById('delaySlider').value);
    const feedback = parseInt(document.getElementById('feedbackSlider').value) / 100;
    const mix = parseInt(document.getElementById('mixSlider').value) / 100;
    const repeats = parseInt(document.getElementById('repeatSlider').value);

    const sampleRate = buffer.sampleRate;
    const delaySamples = Math.floor((delayMs / 1000) * sampleRate);
    const totalLength = buffer.length + (delaySamples * repeats);

    const outputBuffer = audioContext.createBuffer(buffer.numberOfChannels, totalLength, sampleRate);

    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
        const input = buffer.getChannelData(ch);
        const output = outputBuffer.getChannelData(ch);

        // Copy dry signal
        for (let i = 0; i < input.length; i++) {
            output[i] = input[i] * (1 - mix);
        }

        // Add echoes
        let echoGain = mix;
        for (let r = 1; r <= repeats; r++) {
            const offset = delaySamples * r;
            for (let i = 0; i < input.length; i++) {
                if (i + offset < totalLength) {
                    output[i + offset] += input[i] * echoGain;
                }
            }
            echoGain *= feedback;
        }

        // Normalize
        let max = 0;
        for (let i = 0; i < totalLength; i++) {
            max = Math.max(max, Math.abs(output[i]));
        }
        if (max > 1) {
            for (let i = 0; i < totalLength; i++) {
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

    const echoBuffer = applyEcho(originalBuffer);

    sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = echoBuffer;
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

async function downloadEcho() {
    if (!originalBuffer) return;

    const echoBuffer = applyEcho(originalBuffer);
    const wavBlob = bufferToWav(echoBuffer);

    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}-echo.wav`;
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
