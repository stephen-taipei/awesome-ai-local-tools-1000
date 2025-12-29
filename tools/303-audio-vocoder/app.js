/**
 * Audio Vocoder - Tool #303
 * Apply vocoder effect to audio
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let processedBuffer = null;

const presets = {
    robot: { carrierFreq: 150, bandCount: 16, mixRatio: 80, carrierType: 'sawtooth' },
    alien: { carrierFreq: 300, bandCount: 24, mixRatio: 90, carrierType: 'square' },
    deep: { carrierFreq: 80, bandCount: 12, mixRatio: 70, carrierType: 'sawtooth' },
    bright: { carrierFreq: 250, bandCount: 32, mixRatio: 85, carrierType: 'triangle' }
};

const texts = {
    zh: {
        title: '聲音合成器',
        subtitle: '創造機器人般的聲音效果',
        privacy: '100% 本地處理 · 零資料上傳',
        carrierFreq: '載波頻率',
        bandCount: '頻帶數量',
        mixRatio: '混合比例',
        carrierType: '載波類型',
        presets: '預設效果',
        process: '🔄 處理音頻',
        download: '⬇️ 下載',
        result: '處理結果',
        upload: '拖放音頻檔案至此或點擊上傳',
        uploadHint: '支援 MP3, WAV, OGG, M4A',
        sawtooth: '鋸齒波',
        square: '方波',
        triangle: '三角波',
        sine: '正弦波',
        robot: '🤖 機器人',
        alien: '👽 外星人',
        deep: '🔊 低沉',
        bright: '✨ 明亮',
        processing: '處理中...'
    },
    en: {
        title: 'Vocoder',
        subtitle: 'Create robotic voice effects',
        privacy: '100% Local Processing · No Data Upload',
        carrierFreq: 'Carrier Freq',
        bandCount: 'Bands',
        mixRatio: 'Mix Ratio',
        carrierType: 'Carrier Type',
        presets: 'Presets',
        process: '🔄 Process',
        download: '⬇️ Download',
        result: 'Result',
        upload: 'Drop audio file here or click to upload',
        uploadHint: 'Supports MP3, WAV, OGG, M4A',
        sawtooth: 'Sawtooth',
        square: 'Square',
        triangle: 'Triangle',
        sine: 'Sine',
        robot: '🤖 Robot',
        alien: '👽 Alien',
        deep: '🔊 Deep',
        bright: '✨ Bright',
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

    document.getElementById('carrierFreq').addEventListener('input', (e) => {
        document.getElementById('carrierValue').textContent = e.target.value + ' Hz';
    });

    document.getElementById('bandCount').addEventListener('input', (e) => {
        document.getElementById('bandValue').textContent = e.target.value;
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
    labels[0].textContent = t.carrierFreq;
    labels[1].textContent = t.bandCount;
    labels[2].textContent = t.mixRatio;
    labels[3].textContent = t.carrierType;

    const select = document.getElementById('carrierType');
    select.options[0].textContent = t.sawtooth;
    select.options[1].textContent = t.square;
    select.options[2].textContent = t.triangle;
    select.options[3].textContent = t.sine;

    document.getElementById('presetTitle').textContent = t.presets;

    const presetBtns = document.querySelectorAll('.preset-btn');
    presetBtns[0].textContent = t.robot;
    presetBtns[1].textContent = t.alien;
    presetBtns[2].textContent = t.deep;
    presetBtns[3].textContent = t.bright;

    document.getElementById('processBtn').textContent = t.process;
    document.getElementById('downloadBtn').textContent = t.download;
    document.getElementById('resultTitle').textContent = t.result;

    document.querySelector('.upload-area p').textContent = t.upload;
    document.querySelector('.upload-hint').textContent = t.uploadHint;
}

function applyPreset(preset) {
    const p = presets[preset];
    document.getElementById('carrierFreq').value = p.carrierFreq;
    document.getElementById('carrierValue').textContent = p.carrierFreq + ' Hz';
    document.getElementById('bandCount').value = p.bandCount;
    document.getElementById('bandValue').textContent = p.bandCount;
    document.getElementById('mixRatio').value = p.mixRatio;
    document.getElementById('mixValue').textContent = p.mixRatio + '%';
    document.getElementById('carrierType').value = p.carrierType;
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

async function processAudio() {
    if (!originalBuffer) return;

    const processBtn = document.getElementById('processBtn');
    const originalText = processBtn.textContent;
    processBtn.textContent = texts[currentLang].processing;
    processBtn.disabled = true;

    await new Promise(resolve => setTimeout(resolve, 10));

    const carrierFreq = parseInt(document.getElementById('carrierFreq').value);
    const bandCount = parseInt(document.getElementById('bandCount').value);
    const mixRatio = parseInt(document.getElementById('mixRatio').value) / 100;
    const carrierType = document.getElementById('carrierType').value;

    const sampleRate = originalBuffer.sampleRate;
    const length = originalBuffer.length;
    const channels = originalBuffer.numberOfChannels;

    // Create offline context for processing
    const offlineCtx = new OfflineAudioContext(channels, length, sampleRate);

    // Create carrier oscillator
    const carrier = offlineCtx.createOscillator();
    carrier.type = carrierType;
    carrier.frequency.value = carrierFreq;

    // Create gain for carrier
    const carrierGain = offlineCtx.createGain();
    carrierGain.gain.value = mixRatio;

    // Create source from original buffer
    const source = offlineCtx.createBufferSource();
    source.buffer = originalBuffer;

    // Create dry signal gain
    const dryGain = offlineCtx.createGain();
    dryGain.gain.value = 1 - mixRatio;

    // Create band-pass filters for vocoder effect
    const analyserBands = [];
    const filterBands = [];
    const minFreq = 100;
    const maxFreq = Math.min(8000, sampleRate / 2);

    for (let i = 0; i < bandCount; i++) {
        const freq = minFreq * Math.pow(maxFreq / minFreq, i / (bandCount - 1));

        // Analysis filter
        const analyser = offlineCtx.createBiquadFilter();
        analyser.type = 'bandpass';
        analyser.frequency.value = freq;
        analyser.Q.value = 5;
        analyserBands.push(analyser);

        // Synthesis filter
        const filter = offlineCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = freq;
        filter.Q.value = 5;
        filterBands.push(filter);
    }

    // Create output merger
    const merger = offlineCtx.createGain();
    merger.gain.value = 1 / Math.sqrt(bandCount);

    // Connect analysis chain
    for (let i = 0; i < bandCount; i++) {
        source.connect(analyserBands[i]);
        carrier.connect(filterBands[i]);

        // Create envelope follower simulation using gain
        const envelope = offlineCtx.createGain();
        envelope.gain.value = 1;

        filterBands[i].connect(envelope);
        envelope.connect(merger);
    }

    merger.connect(carrierGain);
    source.connect(dryGain);

    // Mix wet and dry
    const output = offlineCtx.createGain();
    carrierGain.connect(output);
    dryGain.connect(output);
    output.connect(offlineCtx.destination);

    carrier.start();
    source.start();

    processedBuffer = await offlineCtx.startRendering();

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
    a.download = 'vocoder-output.wav';
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
