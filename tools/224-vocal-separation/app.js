/**
 * Vocal Separation - Tool #224
 * Separate vocals from instrumental tracks using center-channel extraction
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let vocalBuffer = null;
let instrumentalBuffer = null;
let currentMode = 'vocal';

const texts = {
    zh: {
        title: '人聲分離',
        subtitle: '從混合音訊中分離人聲與伴奏',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '點擊或拖放音樂檔案',
        hint: '支援 MP3, WAV, OGG, M4A（建議使用立體聲音訊）',
        mode: '分離模式',
        vocal: '提取人聲',
        instrumental: '提取伴奏',
        both: '兩者都要',
        strength: '分離強度',
        freqRange: '人聲頻率範圍 (Hz)',
        original: '原始音訊',
        vocalLabel: '人聲',
        instrLabel: '伴奏',
        process: '開始分離',
        processing: '處理中...',
        done: '分離完成！',
        error: '處理失敗，請重試',
        stereoOnly: '此技術需要立體聲音訊',
        channels: '聲道'
    },
    en: {
        title: 'Vocal Separation',
        subtitle: 'Separate vocals from instrumental tracks',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Click or drop music file',
        hint: 'Supports MP3, WAV, OGG, M4A (stereo recommended)',
        mode: 'Separation Mode',
        vocal: 'Extract Vocals',
        instrumental: 'Extract Instrumental',
        both: 'Extract Both',
        strength: 'Separation Strength',
        freqRange: 'Vocal Frequency Range (Hz)',
        original: 'Original Audio',
        vocalLabel: 'Vocals',
        instrLabel: 'Instrumental',
        process: 'Start Separation',
        processing: 'Processing...',
        done: 'Separation complete!',
        error: 'Processing failed, please retry',
        stereoOnly: 'This technique requires stereo audio',
        channels: 'channels'
    }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));

    const uploadArea = document.getElementById('uploadArea');
    const audioInput = document.getElementById('audioInput');

    uploadArea.addEventListener('click', () => audioInput.click());
    uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('dragover'); });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        if (e.dataTransfer.files.length) loadAudio(e.dataTransfer.files[0]);
    });
    audioInput.addEventListener('change', (e) => {
        if (e.target.files.length) loadAudio(e.target.files[0]);
    });

    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => selectMode(btn.dataset.mode));
    });

    document.getElementById('strength').addEventListener('input', (e) => {
        document.getElementById('strengthValue').textContent = e.target.value + '%';
    });

    document.getElementById('processBtn').addEventListener('click', processAudio);

    document.querySelectorAll('.download-single').forEach(btn => {
        btn.addEventListener('click', () => downloadSingle(btn.dataset.type));
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
    document.querySelector('.upload-hint').textContent = t.hint;
    document.querySelector('.separation-mode h3').textContent = t.mode;

    const modeBtns = document.querySelectorAll('.mode-btn .mode-label');
    modeBtns[0].textContent = t.vocal;
    modeBtns[1].textContent = t.instrumental;
    modeBtns[2].textContent = t.both;

    document.querySelectorAll('.control-item label')[0].textContent = t.strength;
    document.querySelectorAll('.control-item label')[1].textContent = t.freqRange;

    const playerLabels = document.querySelectorAll('.player-label');
    playerLabels[0].textContent = t.original;
    if (playerLabels[1]) playerLabels[1].textContent = t.vocalLabel;
    if (playerLabels[2]) playerLabels[2].textContent = t.instrLabel;

    document.getElementById('processBtn').textContent = t.process;
}

function selectMode(mode) {
    currentMode = mode;
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
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

    const t = texts[currentLang];
    document.getElementById('channelInfo').textContent =
        `(${originalBuffer.numberOfChannels} ${t.channels})`;

    document.getElementById('vocalRow').style.display = 'none';
    document.getElementById('instrumentalRow').style.display = 'none';
    vocalBuffer = null;
    instrumentalBuffer = null;
}

async function processAudio() {
    if (!originalBuffer) return;

    const t = texts[currentLang];

    if (originalBuffer.numberOfChannels < 2) {
        document.getElementById('processingStatus').textContent = t.stereoOnly;
        document.getElementById('processingStatus').className = 'processing-status error';
        return;
    }

    const status = document.getElementById('processingStatus');
    status.textContent = t.processing;
    status.className = 'processing-status processing';

    const progressBar = document.getElementById('progressBar');
    progressBar.style.display = 'block';

    document.getElementById('processBtn').disabled = true;

    try {
        await new Promise(resolve => setTimeout(resolve, 100));

        const strength = parseInt(document.getElementById('strength').value) / 100;
        const freqLow = parseInt(document.getElementById('freqLow').value);
        const freqHigh = parseInt(document.getElementById('freqHigh').value);

        const leftChannel = originalBuffer.getChannelData(0);
        const rightChannel = originalBuffer.getChannelData(1);
        const length = originalBuffer.length;
        const sampleRate = originalBuffer.sampleRate;

        // Create output buffers
        const vocalData = new Float32Array(length);
        const instrumentalLeft = new Float32Array(length);
        const instrumentalRight = new Float32Array(length);

        // Center-channel extraction technique
        // Vocals are typically mixed in the center (same in both channels)
        // Instruments are typically panned (different between channels)
        for (let i = 0; i < length; i++) {
            // Extract center (vocal)
            const center = (leftChannel[i] + rightChannel[i]) / 2;

            // Extract sides (instrumental)
            const sideL = leftChannel[i] - center * strength;
            const sideR = rightChannel[i] - center * strength;

            vocalData[i] = center * strength;
            instrumentalLeft[i] = sideL + center * (1 - strength);
            instrumentalRight[i] = sideR + center * (1 - strength);

            // Update progress
            if (i % 100000 === 0) {
                const progress = (i / length) * 100;
                progressBar.querySelector('.progress-fill').style.width = progress + '%';
                await new Promise(r => setTimeout(r, 0));
            }
        }

        // Create vocal buffer (mono)
        vocalBuffer = audioContext.createBuffer(1, length, sampleRate);
        vocalBuffer.getChannelData(0).set(vocalData);

        // Create instrumental buffer (stereo)
        instrumentalBuffer = audioContext.createBuffer(2, length, sampleRate);
        instrumentalBuffer.getChannelData(0).set(instrumentalLeft);
        instrumentalBuffer.getChannelData(1).set(instrumentalRight);

        // Apply frequency filtering to clean up the separation
        if (currentMode === 'vocal' || currentMode === 'both') {
            vocalBuffer = await applyBandpass(vocalBuffer, freqLow, freqHigh);
        }

        // Show results based on mode
        if (currentMode === 'vocal' || currentMode === 'both') {
            const vocalBlob = bufferToWav(vocalBuffer);
            document.getElementById('vocalAudio').src = URL.createObjectURL(vocalBlob);
            document.getElementById('vocalRow').style.display = 'flex';
        }

        if (currentMode === 'instrumental' || currentMode === 'both') {
            const instrBlob = bufferToWav(instrumentalBuffer);
            document.getElementById('instrumentalAudio').src = URL.createObjectURL(instrBlob);
            document.getElementById('instrumentalRow').style.display = 'flex';
        }

        progressBar.querySelector('.progress-fill').style.width = '100%';
        status.textContent = t.done;
        status.className = 'processing-status done';

    } catch (err) {
        console.error(err);
        status.textContent = t.error;
        status.className = 'processing-status error';
    }

    document.getElementById('processBtn').disabled = false;
    setTimeout(() => { progressBar.style.display = 'none'; }, 1000);
}

async function applyBandpass(buffer, lowFreq, highFreq) {
    const offlineCtx = new OfflineAudioContext(
        buffer.numberOfChannels,
        buffer.length,
        buffer.sampleRate
    );

    const source = offlineCtx.createBufferSource();
    source.buffer = buffer;

    const highpass = offlineCtx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = lowFreq;
    highpass.Q.value = 0.7;

    const lowpass = offlineCtx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = highFreq;
    lowpass.Q.value = 0.7;

    source.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(offlineCtx.destination);

    source.start(0);
    return await offlineCtx.startRendering();
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

    const channelData = [];
    for (let ch = 0; ch < numChannels; ch++) {
        channelData.push(buffer.getChannelData(ch));
    }

    let pos = 44;
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

function downloadSingle(type) {
    const buffer = type === 'vocal' ? vocalBuffer : instrumentalBuffer;
    if (!buffer) return;

    const wavBlob = bufferToWav(buffer);
    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = type === 'vocal' ? 'vocals.wav' : 'instrumental.wav';
    a.click();
    URL.revokeObjectURL(url);
}

init();
