/**
 * Audio Bass Enhancer - Tool #278
 * Enhance bass frequencies in audio
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let sourceNode = null;
let isPlaying = false;
let fileName = '';

const texts = {
    zh: {
        title: '音訊低音增強',
        subtitle: '增強音訊的低頻效果',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '點擊或拖放音訊檔案',
        uploadHint: '支援 MP3, WAV, OGG 等格式',
        freq: '低頻頻率',
        gain: '增益',
        harmonics: '諧波',
        preview: '▶️ 預覽',
        stop: '⏹️ 停止',
        download: '⬇️ 下載',
        standard: '標準',
        warm: '溫暖',
        heavy: '重低音'
    },
    en: {
        title: 'Audio Bass Enhancer',
        subtitle: 'Enhance bass frequencies in audio',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Click or drop audio file',
        uploadHint: 'Supports MP3, WAV, OGG formats',
        freq: 'Frequency',
        gain: 'Gain',
        harmonics: 'Harmonics',
        preview: '▶️ Preview',
        stop: '⏹️ Stop',
        download: '⬇️ Download',
        standard: 'Standard',
        warm: 'Warm',
        heavy: 'Heavy'
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

    document.getElementById('freqSlider').addEventListener('input', (e) => {
        document.getElementById('freqValue').textContent = e.target.value + ' Hz';
        updatePresetButtons();
    });

    document.getElementById('gainSlider').addEventListener('input', (e) => {
        document.getElementById('gainValue').textContent = '+' + e.target.value + ' dB';
        updatePresetButtons();
    });

    document.getElementById('harmonicsSlider').addEventListener('input', (e) => {
        document.getElementById('harmonicsValue').textContent = e.target.value + '%';
        updatePresetButtons();
    });

    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const freq = parseInt(btn.dataset.freq);
            const gain = parseInt(btn.dataset.gain);
            const harmonics = parseInt(btn.dataset.harmonics);

            document.getElementById('freqSlider').value = freq;
            document.getElementById('gainSlider').value = gain;
            document.getElementById('harmonicsSlider').value = harmonics;

            document.getElementById('freqValue').textContent = freq + ' Hz';
            document.getElementById('gainValue').textContent = '+' + gain + ' dB';
            document.getElementById('harmonicsValue').textContent = harmonics + '%';

            updatePresetButtons();
        });
    });

    document.getElementById('previewBtn').addEventListener('click', togglePreview);
    document.getElementById('downloadBtn').addEventListener('click', downloadEnhanced);
}

function updatePresetButtons() {
    const freq = parseInt(document.getElementById('freqSlider').value);
    const gain = parseInt(document.getElementById('gainSlider').value);
    const harmonics = parseInt(document.getElementById('harmonicsSlider').value);

    document.querySelectorAll('.preset-btn').forEach(btn => {
        const btnFreq = parseInt(btn.dataset.freq);
        const btnGain = parseInt(btn.dataset.gain);
        const btnHarmonics = parseInt(btn.dataset.harmonics);
        btn.classList.toggle('active', btnFreq === freq && btnGain === gain && btnHarmonics === harmonics);
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

    document.querySelectorAll('.option-group label')[0].textContent = t.freq;
    document.querySelectorAll('.option-group label')[1].textContent = t.gain;
    document.querySelectorAll('.option-group label')[2].textContent = t.harmonics;

    const presetBtns = document.querySelectorAll('.preset-btn');
    presetBtns[1].textContent = t.standard;
    presetBtns[2].textContent = t.warm;
    presetBtns[3].textContent = t.heavy;

    document.getElementById('previewBtn').textContent = isPlaying ? t.stop : t.preview;
    document.getElementById('downloadBtn').textContent = t.download;
}

async function handleFile(file) {
    fileName = file.name.replace(/\.[^/.]+$/, '');

    const arrayBuffer = await file.arrayBuffer();
    originalBuffer = await audioContext.decodeAudioData(arrayBuffer);

    document.getElementById('editorSection').style.display = 'block';
}

function applyBassEnhancer(buffer) {
    const cutoffFreq = parseFloat(document.getElementById('freqSlider').value);
    const gainDb = parseFloat(document.getElementById('gainSlider').value);
    const harmonicsAmount = parseInt(document.getElementById('harmonicsSlider').value) / 100;

    const gain = Math.pow(10, gainDb / 20);
    const sampleRate = buffer.sampleRate;
    const outputBuffer = audioContext.createBuffer(buffer.numberOfChannels, buffer.length, sampleRate);

    // Low-pass filter coefficients
    const w0 = 2 * Math.PI * cutoffFreq / sampleRate;
    const Q = 0.707;
    const alpha = Math.sin(w0) / (2 * Q);

    const b0 = (1 - Math.cos(w0)) / 2;
    const b1 = 1 - Math.cos(w0);
    const b2 = (1 - Math.cos(w0)) / 2;
    const a0 = 1 + alpha;
    const a1 = -2 * Math.cos(w0);
    const a2 = 1 - alpha;

    // Normalize
    const b0n = b0 / a0;
    const b1n = b1 / a0;
    const b2n = b2 / a0;
    const a1n = a1 / a0;
    const a2n = a2 / a0;

    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
        const input = buffer.getChannelData(ch);
        const output = outputBuffer.getChannelData(ch);

        // Filter state
        let x1 = 0, x2 = 0, y1 = 0, y2 = 0;

        for (let i = 0; i < buffer.length; i++) {
            // Low-pass filter to extract bass
            const bass = b0n * input[i] + b1n * x1 + b2n * x2 - a1n * y1 - a2n * y2;
            x2 = x1;
            x1 = input[i];
            y2 = y1;
            y1 = bass;

            // Generate harmonics
            const harmonics = Math.tanh(bass * 3) * harmonicsAmount;

            // Boost bass and add harmonics
            const boostedBass = bass * gain + harmonics;

            // Mix with original
            output[i] = input[i] + boostedBass;
        }

        // Normalize
        let max = 0;
        for (let i = 0; i < buffer.length; i++) {
            max = Math.max(max, Math.abs(output[i]));
        }
        if (max > 1) {
            for (let i = 0; i < buffer.length; i++) {
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

    const enhancedBuffer = applyBassEnhancer(originalBuffer);

    sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = enhancedBuffer;
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

async function downloadEnhanced() {
    if (!originalBuffer) return;

    const enhancedBuffer = applyBassEnhancer(originalBuffer);
    const wavBlob = bufferToWav(enhancedBuffer);

    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}-bass.wav`;
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
