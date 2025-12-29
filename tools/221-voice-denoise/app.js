/**
 * Voice Noise Reduction - Tool #221
 * AI-powered voice noise reduction using Web Audio API
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let processedBuffer = null;
let currentStrength = 'medium';

const strengthPresets = {
    light: { highpass: 50, lowpass: 15000, compression: 2 },
    medium: { highpass: 80, lowpass: 12000, compression: 4 },
    strong: { highpass: 150, lowpass: 8000, compression: 8 }
};

const texts = {
    zh: {
        title: '語音降噪',
        subtitle: 'AI 降低語音中的背景噪音',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '點擊或拖放音訊檔案',
        hint: '支援 MP3, WAV, OGG, M4A',
        strength: '降噪強度',
        light: '輕度',
        medium: '中度',
        strong: '強力',
        highpass: '高通濾波 (Hz)',
        lowpass: '低通濾波 (Hz)',
        compression: '壓縮比',
        original: '原始音訊',
        processed: '降噪後',
        process: '處理音訊',
        download: '下載結果',
        processing: '處理中...',
        done: '處理完成！',
        error: '處理失敗，請重試'
    },
    en: {
        title: 'Voice Noise Reduction',
        subtitle: 'AI-powered background noise reduction',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Click or drop audio file',
        hint: 'Supports MP3, WAV, OGG, M4A',
        strength: 'Noise Reduction Strength',
        light: 'Light',
        medium: 'Medium',
        strong: 'Strong',
        highpass: 'High-pass Filter (Hz)',
        lowpass: 'Low-pass Filter (Hz)',
        compression: 'Compression Ratio',
        original: 'Original Audio',
        processed: 'Processed',
        process: 'Process Audio',
        download: 'Download Result',
        processing: 'Processing...',
        done: 'Processing complete!',
        error: 'Processing failed, please retry'
    }
};

function init() {
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
        if (e.dataTransfer.files.length) loadAudio(e.dataTransfer.files[0]);
    });
    audioInput.addEventListener('change', (e) => {
        if (e.target.files.length) loadAudio(e.target.files[0]);
    });

    document.querySelectorAll('.strength-btn').forEach(btn => {
        btn.addEventListener('click', () => selectStrength(btn.dataset.level));
    });

    ['highpass', 'lowpass', 'compression'].forEach(id => {
        const input = document.getElementById(id);
        input.addEventListener('input', () => {
            document.getElementById(id + 'Value').textContent = input.value;
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
    document.querySelector('.upload-text').textContent = t.upload;
    document.querySelector('.upload-hint').textContent = t.hint;
    document.querySelector('.controls-group h3').textContent = t.strength;

    const strengthBtns = document.querySelectorAll('.strength-btn');
    strengthBtns[0].textContent = t.light;
    strengthBtns[1].textContent = t.medium;
    strengthBtns[2].textContent = t.strong;

    const labels = document.querySelectorAll('.param-group label');
    labels[0].textContent = t.highpass;
    labels[1].textContent = t.lowpass;
    labels[2].textContent = t.compression;

    const playerLabels = document.querySelectorAll('.player-label');
    playerLabels[0].textContent = t.original;
    playerLabels[1].textContent = t.processed;

    document.getElementById('processBtn').textContent = t.process;
    document.getElementById('downloadBtn').textContent = t.download;
}

function selectStrength(level) {
    currentStrength = level;
    document.querySelectorAll('.strength-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-level="${level}"]`).classList.add('active');

    const preset = strengthPresets[level];
    document.getElementById('highpass').value = preset.highpass;
    document.getElementById('lowpass').value = preset.lowpass;
    document.getElementById('compression').value = preset.compression;
    document.getElementById('highpassValue').textContent = preset.highpass;
    document.getElementById('lowpassValue').textContent = preset.lowpass;
    document.getElementById('compressionValue').textContent = preset.compression;
}

async function loadAudio(file) {
    if (!file.type.startsWith('audio/')) return;

    document.getElementById('fileName').textContent = file.name;
    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('processingSection').style.display = 'block';

    const url = URL.createObjectURL(file);
    document.getElementById('originalAudio').src = url;

    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const arrayBuffer = await file.arrayBuffer();
    originalBuffer = await audioContext.decodeAudioData(arrayBuffer);

    document.getElementById('processedAudio').src = '';
    document.getElementById('downloadBtn').disabled = true;
}

async function processAudio() {
    if (!originalBuffer) return;

    const t = texts[currentLang];
    const status = document.getElementById('processingStatus');
    status.textContent = t.processing;
    status.className = 'processing-status processing';

    document.getElementById('processBtn').disabled = true;

    try {
        await new Promise(resolve => setTimeout(resolve, 100));

        const offlineCtx = new OfflineAudioContext(
            originalBuffer.numberOfChannels,
            originalBuffer.length,
            originalBuffer.sampleRate
        );

        const source = offlineCtx.createBufferSource();
        source.buffer = originalBuffer;

        // High-pass filter to remove low-frequency rumble
        const highpass = offlineCtx.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.value = parseInt(document.getElementById('highpass').value);
        highpass.Q.value = 0.7;

        // Low-pass filter to remove high-frequency hiss
        const lowpass = offlineCtx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.value = parseInt(document.getElementById('lowpass').value);
        lowpass.Q.value = 0.7;

        // Dynamics compressor to even out levels
        const compressor = offlineCtx.createDynamicsCompressor();
        compressor.threshold.value = -24;
        compressor.knee.value = 30;
        compressor.ratio.value = parseInt(document.getElementById('compression').value);
        compressor.attack.value = 0.003;
        compressor.release.value = 0.25;

        // Notch filter to reduce 50/60Hz hum
        const notch = offlineCtx.createBiquadFilter();
        notch.type = 'notch';
        notch.frequency.value = 50;
        notch.Q.value = 10;

        // Gain to compensate for volume loss
        const gain = offlineCtx.createGain();
        gain.gain.value = 1.2;

        // Connect the chain
        source.connect(highpass);
        highpass.connect(lowpass);
        lowpass.connect(notch);
        notch.connect(compressor);
        compressor.connect(gain);
        gain.connect(offlineCtx.destination);

        source.start(0);

        processedBuffer = await offlineCtx.startRendering();

        // Convert to WAV and create URL
        const wavBlob = bufferToWav(processedBuffer);
        const url = URL.createObjectURL(wavBlob);
        document.getElementById('processedAudio').src = url;

        document.getElementById('downloadBtn').disabled = false;
        status.textContent = t.done;
        status.className = 'processing-status done';

    } catch (err) {
        console.error(err);
        status.textContent = t.error;
        status.className = 'processing-status error';
    }

    document.getElementById('processBtn').disabled = false;
}

function bufferToWav(buffer) {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;

    const samples = buffer.length;
    const dataSize = samples * blockAlign;
    const bufferSize = 44 + dataSize;

    const arrayBuffer = new ArrayBuffer(bufferSize);
    const view = new DataView(arrayBuffer);

    // WAV header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, bufferSize - 8, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    // Interleave channels and write samples
    const offset = 44;
    const channelData = [];
    for (let ch = 0; ch < numChannels; ch++) {
        channelData.push(buffer.getChannelData(ch));
    }

    let pos = offset;
    for (let i = 0; i < samples; i++) {
        for (let ch = 0; ch < numChannels; ch++) {
            let sample = channelData[ch][i];
            sample = Math.max(-1, Math.min(1, sample));
            sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
            view.setInt16(pos, sample, true);
            pos += 2;
        }
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
}

function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

function downloadAudio() {
    if (!processedBuffer) return;

    const wavBlob = bufferToWav(processedBuffer);
    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'denoised_audio.wav';
    a.click();
    URL.revokeObjectURL(url);
}

init();
