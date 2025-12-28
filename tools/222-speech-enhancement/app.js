/**
 * Speech Enhancement - Tool #222
 * Enhance speech clarity and quality using Web Audio API
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let processedBuffer = null;
let currentMode = 'clarity';

const modePresets = {
    clarity: { low: -2, mid: 3, high: 4, presence: 6, gain: 1.5, comp: 4 },
    warmth: { low: 6, mid: 2, high: -2, presence: 0, gain: 1.3, comp: 3 },
    broadcast: { low: 2, mid: 4, high: 3, presence: 5, gain: 1.8, comp: 6 },
    telephone: { low: -6, mid: 6, high: 2, presence: 4, gain: 2, comp: 8 }
};

const texts = {
    zh: {
        title: '語音增強',
        subtitle: '增強語音清晰度與品質',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '點擊或拖放音訊檔案',
        hint: '支援 MP3, WAV, OGG, M4A',
        modes: '增強模式',
        clarity: '清晰度', clarityDesc: '提高語音辨識度',
        warmth: '溫暖', warmthDesc: '增加低頻溫潤感',
        broadcast: '廣播', broadcastDesc: '專業廣播音質',
        telephone: '電話', telephoneDesc: '優化通話清晰度',
        eq: '等化器調整',
        low: '低音', mid: '中音', high: '高音', presence: '臨場',
        gainLabel: '音量增益',
        compLabel: '壓縮強度',
        original: '原始音訊',
        processed: '增強後',
        process: '處理音訊',
        download: '下載結果',
        processing: '處理中...',
        done: '處理完成！',
        error: '處理失敗，請重試'
    },
    en: {
        title: 'Speech Enhancement',
        subtitle: 'Enhance speech clarity and quality',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Click or drop audio file',
        hint: 'Supports MP3, WAV, OGG, M4A',
        modes: 'Enhancement Mode',
        clarity: 'Clarity', clarityDesc: 'Improve intelligibility',
        warmth: 'Warmth', warmthDesc: 'Add low-end warmth',
        broadcast: 'Broadcast', broadcastDesc: 'Professional broadcast quality',
        telephone: 'Phone', telephoneDesc: 'Optimize call clarity',
        eq: 'Equalizer',
        low: 'Low', mid: 'Mid', high: 'High', presence: 'Presence',
        gainLabel: 'Volume Gain',
        compLabel: 'Compression',
        original: 'Original Audio',
        processed: 'Enhanced',
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

    document.querySelectorAll('.mode-card').forEach(card => {
        card.addEventListener('click', () => selectMode(card.dataset.mode));
    });

    document.getElementById('gain').addEventListener('input', (e) => {
        document.getElementById('gainValue').textContent = e.target.value + 'x';
    });
    document.getElementById('compressor').addEventListener('input', (e) => {
        document.getElementById('compressorValue').textContent = e.target.value;
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

    document.querySelector('.enhancement-modes h3').textContent = t.modes;
    const modeCards = document.querySelectorAll('.mode-card');
    modeCards[0].querySelector('.mode-name').textContent = t.clarity;
    modeCards[0].querySelector('.mode-desc').textContent = t.clarityDesc;
    modeCards[1].querySelector('.mode-name').textContent = t.warmth;
    modeCards[1].querySelector('.mode-desc').textContent = t.warmthDesc;
    modeCards[2].querySelector('.mode-name').textContent = t.broadcast;
    modeCards[2].querySelector('.mode-desc').textContent = t.broadcastDesc;
    modeCards[3].querySelector('.mode-name').textContent = t.telephone;
    modeCards[3].querySelector('.mode-desc').textContent = t.telephoneDesc;

    document.querySelector('.eq-section h3').textContent = t.eq;
    const eqLabels = document.querySelectorAll('.eq-band label');
    eqLabels[0].textContent = t.low;
    eqLabels[1].textContent = t.mid;
    eqLabels[2].textContent = t.high;
    eqLabels[3].textContent = t.presence;

    document.querySelectorAll('.control-group label')[0].textContent = t.gainLabel;
    document.querySelectorAll('.control-group label')[1].textContent = t.compLabel;

    const playerLabels = document.querySelectorAll('.player-label');
    playerLabels[0].textContent = t.original;
    playerLabels[1].textContent = t.processed;

    document.getElementById('processBtn').textContent = t.process;
    document.getElementById('downloadBtn').textContent = t.download;
}

function selectMode(mode) {
    currentMode = mode;
    document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('active'));
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');

    const preset = modePresets[mode];
    document.getElementById('eq-low').value = preset.low;
    document.getElementById('eq-mid').value = preset.mid;
    document.getElementById('eq-high').value = preset.high;
    document.getElementById('eq-presence').value = preset.presence;
    document.getElementById('gain').value = preset.gain;
    document.getElementById('compressor').value = preset.comp;
    document.getElementById('gainValue').textContent = preset.gain + 'x';
    document.getElementById('compressorValue').textContent = preset.comp;
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

        // Low shelf filter (bass)
        const lowShelf = offlineCtx.createBiquadFilter();
        lowShelf.type = 'lowshelf';
        lowShelf.frequency.value = 300;
        lowShelf.gain.value = parseFloat(document.getElementById('eq-low').value);

        // Peaking filter (mid)
        const mid = offlineCtx.createBiquadFilter();
        mid.type = 'peaking';
        mid.frequency.value = 1000;
        mid.Q.value = 1;
        mid.gain.value = parseFloat(document.getElementById('eq-mid').value);

        // High shelf filter (treble)
        const highShelf = offlineCtx.createBiquadFilter();
        highShelf.type = 'highshelf';
        highShelf.frequency.value = 3000;
        highShelf.gain.value = parseFloat(document.getElementById('eq-high').value);

        // Presence peaking filter
        const presence = offlineCtx.createBiquadFilter();
        presence.type = 'peaking';
        presence.frequency.value = 5000;
        presence.Q.value = 0.8;
        presence.gain.value = parseFloat(document.getElementById('eq-presence').value);

        // Dynamics compressor
        const compressor = offlineCtx.createDynamicsCompressor();
        compressor.threshold.value = -20;
        compressor.knee.value = 20;
        compressor.ratio.value = parseFloat(document.getElementById('compressor').value);
        compressor.attack.value = 0.005;
        compressor.release.value = 0.1;

        // Output gain
        const gain = offlineCtx.createGain();
        gain.gain.value = parseFloat(document.getElementById('gain').value);

        // Limiter to prevent clipping
        const limiter = offlineCtx.createDynamicsCompressor();
        limiter.threshold.value = -1;
        limiter.knee.value = 0;
        limiter.ratio.value = 20;
        limiter.attack.value = 0.001;
        limiter.release.value = 0.01;

        // Connect the chain
        source.connect(lowShelf);
        lowShelf.connect(mid);
        mid.connect(highShelf);
        highShelf.connect(presence);
        presence.connect(compressor);
        compressor.connect(gain);
        gain.connect(limiter);
        limiter.connect(offlineCtx.destination);

        source.start(0);

        processedBuffer = await offlineCtx.startRendering();

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

function downloadAudio() {
    if (!processedBuffer) return;
    const wavBlob = bufferToWav(processedBuffer);
    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'enhanced_audio.wav';
    a.click();
    URL.revokeObjectURL(url);
}

init();
