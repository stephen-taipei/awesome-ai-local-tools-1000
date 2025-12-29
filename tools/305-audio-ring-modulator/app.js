/**
 * Audio Ring Modulator - Tool #305
 * Add ring modulation effect to audio
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let processedBuffer = null;

const presets = {
    metallic: { modFreq: 440, modDepth: 100, waveType: 'sine', mixRatio: 80 },
    tremolo: { modFreq: 8, modDepth: 50, waveType: 'sine', mixRatio: 100 },
    dalek: { modFreq: 30, modDepth: 100, waveType: 'square', mixRatio: 90 },
    bell: { modFreq: 880, modDepth: 80, waveType: 'sine', mixRatio: 70 }
};

const texts = {
    zh: {
        title: '環形調變器',
        subtitle: '創造獨特的金屬般聲音效果',
        privacy: '100% 本地處理 · 零資料上傳',
        modFreq: '調變頻率',
        modDepth: '調變深度',
        waveType: '波形類型',
        mixRatio: '混合比例',
        presets: '預設效果',
        process: '🔄 處理音頻',
        download: '⬇️ 下載',
        result: '處理結果',
        upload: '拖放音頻檔案至此或點擊上傳',
        uploadHint: '支援 MP3, WAV, OGG, M4A',
        sine: '正弦波',
        square: '方波',
        triangle: '三角波',
        sawtooth: '鋸齒波',
        metallic: '🔔 金屬',
        tremolo: '🌊 顫音',
        dalek: '🤖 機器人',
        bell: '🔔 鐘聲',
        processing: '處理中...'
    },
    en: {
        title: 'Ring Modulator',
        subtitle: 'Create unique metallic sound effects',
        privacy: '100% Local Processing · No Data Upload',
        modFreq: 'Mod Freq',
        modDepth: 'Mod Depth',
        waveType: 'Wave Type',
        mixRatio: 'Mix Ratio',
        presets: 'Presets',
        process: '🔄 Process',
        download: '⬇️ Download',
        result: 'Result',
        upload: 'Drop audio file here or click to upload',
        uploadHint: 'Supports MP3, WAV, OGG, M4A',
        sine: 'Sine',
        square: 'Square',
        triangle: 'Triangle',
        sawtooth: 'Sawtooth',
        metallic: '🔔 Metallic',
        tremolo: '🌊 Tremolo',
        dalek: '🤖 Dalek',
        bell: '🔔 Bell',
        processing: 'Processing...'
    }
};

function init() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));

    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) handleFile(e.target.files[0]);
    });

    document.getElementById('modFreq').addEventListener('input', (e) => {
        document.getElementById('modValue').textContent = e.target.value + ' Hz';
    });

    document.getElementById('modDepth').addEventListener('input', (e) => {
        document.getElementById('depthValue').textContent = e.target.value + '%';
    });

    document.getElementById('mixRatio').addEventListener('input', (e) => {
        document.getElementById('mixValue').textContent = e.target.value + '%';
    });

    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            applyPreset(btn.dataset.preset);
        });
    });

    document.getElementById('processBtn').addEventListener('click', processAudio);
    document.getElementById('downloadBtn').addEventListener('click', downloadAudio);
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');

    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;

    const labels = document.querySelectorAll('.option-group label');
    labels[0].textContent = t.modFreq;
    labels[1].textContent = t.modDepth;
    labels[2].textContent = t.waveType;
    labels[3].textContent = t.mixRatio;

    const select = document.getElementById('waveType');
    select.options[0].textContent = t.sine;
    select.options[1].textContent = t.square;
    select.options[2].textContent = t.triangle;
    select.options[3].textContent = t.sawtooth;

    document.getElementById('presetTitle').textContent = t.presets;

    const presetBtns = document.querySelectorAll('.preset-btn');
    presetBtns[0].textContent = t.metallic;
    presetBtns[1].textContent = t.tremolo;
    presetBtns[2].textContent = t.dalek;
    presetBtns[3].textContent = t.bell;

    document.getElementById('processBtn').textContent = t.process;
    document.getElementById('downloadBtn').textContent = t.download;
    document.getElementById('resultTitle').textContent = t.result;

    document.querySelector('.upload-area p').textContent = t.upload;
    document.querySelector('.upload-hint').textContent = t.uploadHint;
}

function applyPreset(preset) {
    const p = presets[preset];
    document.getElementById('modFreq').value = p.modFreq;
    document.getElementById('modValue').textContent = p.modFreq + ' Hz';
    document.getElementById('modDepth').value = p.modDepth;
    document.getElementById('depthValue').textContent = p.modDepth + '%';
    document.getElementById('waveType').value = p.waveType;
    document.getElementById('mixRatio').value = p.mixRatio;
    document.getElementById('mixValue').textContent = p.mixRatio + '%';
}

async function handleFile(file) {
    const arrayBuffer = await file.arrayBuffer();
    originalBuffer = await audioContext.decodeAudioData(arrayBuffer);

    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('audioLoaded').style.display = 'block';
    document.getElementById('fileInfo').textContent = `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;

    const originalAudio = document.getElementById('originalAudio');
    originalAudio.src = URL.createObjectURL(file);

    document.getElementById('optionsSection').style.display = 'block';
    document.getElementById('actionSection').style.display = 'flex';
}

function generateWave(type, phase) {
    switch (type) {
        case 'sine':
            return Math.sin(phase);
        case 'square':
            return Math.sin(phase) >= 0 ? 1 : -1;
        case 'triangle':
            return 2 * Math.abs(2 * (phase / (2 * Math.PI) - Math.floor(phase / (2 * Math.PI) + 0.5))) - 1;
        case 'sawtooth':
            return 2 * (phase / (2 * Math.PI) - Math.floor(phase / (2 * Math.PI) + 0.5));
        default:
            return Math.sin(phase);
    }
}

async function processAudio() {
    if (!originalBuffer) return;

    const processBtn = document.getElementById('processBtn');
    const originalText = processBtn.textContent;
    processBtn.textContent = texts[currentLang].processing;
    processBtn.disabled = true;

    await new Promise(resolve => setTimeout(resolve, 10));

    const modFreq = parseFloat(document.getElementById('modFreq').value);
    const modDepth = parseInt(document.getElementById('modDepth').value) / 100;
    const waveType = document.getElementById('waveType').value;
    const mixRatio = parseInt(document.getElementById('mixRatio').value) / 100;

    const sampleRate = originalBuffer.sampleRate;
    const channels = originalBuffer.numberOfChannels;
    const length = originalBuffer.length;

    // Create output buffer
    processedBuffer = audioContext.createBuffer(channels, length, sampleRate);

    for (let ch = 0; ch < channels; ch++) {
        const inputData = originalBuffer.getChannelData(ch);
        const outputData = processedBuffer.getChannelData(ch);

        for (let i = 0; i < length; i++) {
            const time = i / sampleRate;
            const phase = 2 * Math.PI * modFreq * time;
            const modulator = generateWave(waveType, phase);

            // Ring modulation: multiply input by modulator
            const wetSample = inputData[i] * modulator * modDepth;
            const drySample = inputData[i] * (1 - modDepth);

            // Mix wet/dry
            outputData[i] = (wetSample + drySample) * mixRatio + inputData[i] * (1 - mixRatio);
        }
    }

    // Create blob and audio element
    const blob = bufferToWav(processedBuffer);
    const url = URL.createObjectURL(blob);

    document.getElementById('resultSection').style.display = 'block';
    document.getElementById('processedAudio').src = url;
    document.getElementById('downloadBtn').disabled = false;

    processBtn.textContent = originalText;
    processBtn.disabled = false;
}

function downloadAudio() {
    if (!processedBuffer) return;

    const blob = bufferToWav(processedBuffer);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ring-modulated-audio.wav';
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
    const dataSize = buffer.length * blockAlign;
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
    for (let i = 0; i < buffer.length; i++) {
        for (let ch = 0; ch < numChannels; ch++) {
            const sample = Math.max(-1, Math.min(1, channels[ch][i]));
            view.setInt16(offset, sample * 32767, true);
            offset += 2;
        }
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
}

init();
