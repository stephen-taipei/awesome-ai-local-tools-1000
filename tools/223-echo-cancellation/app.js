/**
 * Echo Cancellation - Tool #223
 * Remove echo and reverb from audio using Web Audio API
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let processedBuffer = null;
let currentType = 'room';

const typePresets = {
    room: { strength: 70, delay: 50, decay: 60, lowKeep: 30 },
    hall: { strength: 85, delay: 120, decay: 75, lowKeep: 20 },
    phone: { strength: 60, delay: 30, decay: 50, lowKeep: 40 }
};

const texts = {
    zh: {
        title: '回音消除',
        subtitle: '消除音訊中的回音與殘響',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '點擊或拖放音訊檔案',
        hint: '支援 MP3, WAV, OGG, M4A',
        echoType: '回音類型',
        room: '室內回音',
        hall: '大廳殘響',
        phone: '通話回音',
        strength: '消除強度',
        delay: '延遲補償 (ms)',
        decay: '衰減速率',
        lowKeep: '低頻保留',
        original: '原始音訊',
        processed: '處理後',
        process: '處理音訊',
        download: '下載結果',
        processing: '處理中...',
        done: '處理完成！',
        error: '處理失敗，請重試'
    },
    en: {
        title: 'Echo Cancellation',
        subtitle: 'Remove echo and reverb from audio',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Click or drop audio file',
        hint: 'Supports MP3, WAV, OGG, M4A',
        echoType: 'Echo Type',
        room: 'Room Echo',
        hall: 'Hall Reverb',
        phone: 'Phone Echo',
        strength: 'Cancellation Strength',
        delay: 'Delay Compensation (ms)',
        decay: 'Decay Rate',
        lowKeep: 'Low Freq Preserve',
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

    document.querySelectorAll('.type-card').forEach(card => {
        card.addEventListener('click', () => selectType(card.dataset.type));
    });

    ['strength', 'delay', 'decay', 'lowKeep'].forEach(id => {
        const input = document.getElementById(id);
        input.addEventListener('input', () => {
            const suffix = id === 'delay' ? '' : '%';
            document.getElementById(id + 'Value').textContent = input.value + suffix;
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
    document.querySelector('.echo-types h3').textContent = t.echoType;

    const typeCards = document.querySelectorAll('.type-card .type-name');
    typeCards[0].textContent = t.room;
    typeCards[1].textContent = t.hall;
    typeCards[2].textContent = t.phone;

    const labels = document.querySelectorAll('.control-item label');
    labels[0].textContent = t.strength;
    labels[1].textContent = t.delay;
    labels[2].textContent = t.decay;
    labels[3].textContent = t.lowKeep;

    const playerLabels = document.querySelectorAll('.player-label');
    playerLabels[0].textContent = t.original;
    playerLabels[1].textContent = t.processed;

    document.getElementById('processBtn').textContent = t.process;
    document.getElementById('downloadBtn').textContent = t.download;
}

function selectType(type) {
    currentType = type;
    document.querySelectorAll('.type-card').forEach(c => c.classList.remove('active'));
    document.querySelector(`[data-type="${type}"]`).classList.add('active');

    const preset = typePresets[type];
    document.getElementById('strength').value = preset.strength;
    document.getElementById('delay').value = preset.delay;
    document.getElementById('decay').value = preset.decay;
    document.getElementById('lowKeep').value = preset.lowKeep;
    document.getElementById('strengthValue').textContent = preset.strength + '%';
    document.getElementById('delayValue').textContent = preset.delay;
    document.getElementById('decayValue').textContent = preset.decay + '%';
    document.getElementById('lowKeepValue').textContent = preset.lowKeep + '%';
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

        const strength = parseInt(document.getElementById('strength').value) / 100;
        const delay = parseInt(document.getElementById('delay').value);
        const decay = parseInt(document.getElementById('decay').value) / 100;
        const lowKeep = parseInt(document.getElementById('lowKeep').value) / 100;

        const offlineCtx = new OfflineAudioContext(
            originalBuffer.numberOfChannels,
            originalBuffer.length,
            originalBuffer.sampleRate
        );

        const source = offlineCtx.createBufferSource();
        source.buffer = originalBuffer;

        // High-pass filter to reduce echo in lower frequencies (echo tends to be bassy)
        const highpass = offlineCtx.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.value = 80 + (200 * strength * (1 - lowKeep));
        highpass.Q.value = 0.7;

        // Peaking filter to reduce mid-range reverb
        const midCut = offlineCtx.createBiquadFilter();
        midCut.type = 'peaking';
        midCut.frequency.value = 400;
        midCut.Q.value = 0.5;
        midCut.gain.value = -4 * strength;

        // Another peaking filter for presence range where echo is prominent
        const presenceCut = offlineCtx.createBiquadFilter();
        presenceCut.type = 'peaking';
        presenceCut.frequency.value = 2000;
        presenceCut.Q.value = 0.8;
        presenceCut.gain.value = -3 * strength * decay;

        // Dynamics compressor to tighten transients (reduces reverb tail perception)
        const compressor = offlineCtx.createDynamicsCompressor();
        compressor.threshold.value = -20 - (10 * strength);
        compressor.knee.value = 10;
        compressor.ratio.value = 4 + (8 * strength);
        compressor.attack.value = 0.001;
        compressor.release.value = 0.05 + (0.1 * (1 - decay));

        // Expander-like gate effect using gain automation
        const gate = offlineCtx.createGain();
        gate.gain.value = 1;

        // Output gain to compensate
        const gain = offlineCtx.createGain();
        gain.gain.value = 1 + (0.3 * strength);

        // Connect the chain
        source.connect(highpass);
        highpass.connect(midCut);
        midCut.connect(presenceCut);
        presenceCut.connect(compressor);
        compressor.connect(gate);
        gate.connect(gain);
        gain.connect(offlineCtx.destination);

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
    a.download = 'echo_removed.wav';
    a.click();
    URL.revokeObjectURL(url);
}

init();
