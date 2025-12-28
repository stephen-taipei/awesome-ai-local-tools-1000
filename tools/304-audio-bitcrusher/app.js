/**
 * Audio Bitcrusher - Tool #304
 * Add lo-fi bitcrusher effect to audio
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let processedBuffer = null;

const presets = {
    '8bit': { bitDepth: 8, sampleReduction: 10, noiseLevel: 5, mixRatio: 100 },
    '4bit': { bitDepth: 4, sampleReduction: 20, noiseLevel: 10, mixRatio: 100 },
    'phone': { bitDepth: 12, sampleReduction: 5, noiseLevel: 15, mixRatio: 80 },
    'radio': { bitDepth: 10, sampleReduction: 8, noiseLevel: 20, mixRatio: 90 }
};

const texts = {
    zh: {
        title: '位元破碎器',
        subtitle: '創造復古的 Lo-Fi 音效',
        privacy: '100% 本地處理 · 零資料上傳',
        bitDepth: '位元深度',
        sampleReduction: '降取樣率',
        noiseLevel: '噪音強度',
        mixRatio: '混合比例',
        presets: '預設效果',
        process: '🔄 處理音頻',
        download: '⬇️ 下載',
        result: '處理結果',
        upload: '拖放音頻檔案至此或點擊上傳',
        uploadHint: '支援 MP3, WAV, OGG, M4A',
        '8bit': '🎮 8-bit',
        '4bit': '📟 4-bit',
        'phone': '📞 電話',
        'radio': '📻 收音機',
        processing: '處理中...'
    },
    en: {
        title: 'Bitcrusher',
        subtitle: 'Create retro Lo-Fi sound effects',
        privacy: '100% Local Processing · No Data Upload',
        bitDepth: 'Bit Depth',
        sampleReduction: 'Downsample',
        noiseLevel: 'Noise Level',
        mixRatio: 'Mix Ratio',
        presets: 'Presets',
        process: '🔄 Process',
        download: '⬇️ Download',
        result: 'Result',
        upload: 'Drop audio file here or click to upload',
        uploadHint: 'Supports MP3, WAV, OGG, M4A',
        '8bit': '🎮 8-bit',
        '4bit': '📟 4-bit',
        'phone': '📞 Phone',
        'radio': '📻 Radio',
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

    document.getElementById('bitDepth').addEventListener('input', (e) => {
        document.getElementById('bitValue').textContent = e.target.value + ' bit';
    });

    document.getElementById('sampleReduction').addEventListener('input', (e) => {
        document.getElementById('sampleValue').textContent = e.target.value + 'x';
    });

    document.getElementById('noiseLevel').addEventListener('input', (e) => {
        document.getElementById('noiseValue').textContent = e.target.value + '%';
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
    labels[0].textContent = t.bitDepth;
    labels[1].textContent = t.sampleReduction;
    labels[2].textContent = t.noiseLevel;
    labels[3].textContent = t.mixRatio;

    document.getElementById('presetTitle').textContent = t.presets;

    const presetBtns = document.querySelectorAll('.preset-btn');
    presetBtns[0].textContent = t['8bit'];
    presetBtns[1].textContent = t['4bit'];
    presetBtns[2].textContent = t['phone'];
    presetBtns[3].textContent = t['radio'];

    document.getElementById('processBtn').textContent = t.process;
    document.getElementById('downloadBtn').textContent = t.download;
    document.getElementById('resultTitle').textContent = t.result;

    document.querySelector('.upload-area p').textContent = t.upload;
    document.querySelector('.upload-hint').textContent = t.uploadHint;
}

function applyPreset(preset) {
    const p = presets[preset];
    document.getElementById('bitDepth').value = p.bitDepth;
    document.getElementById('bitValue').textContent = p.bitDepth + ' bit';
    document.getElementById('sampleReduction').value = p.sampleReduction;
    document.getElementById('sampleValue').textContent = p.sampleReduction + 'x';
    document.getElementById('noiseLevel').value = p.noiseLevel;
    document.getElementById('noiseValue').textContent = p.noiseLevel + '%';
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

async function processAudio() {
    if (!originalBuffer) return;

    const processBtn = document.getElementById('processBtn');
    const originalText = processBtn.textContent;
    processBtn.textContent = texts[currentLang].processing;
    processBtn.disabled = true;

    await new Promise(resolve => setTimeout(resolve, 10));

    const bitDepth = parseInt(document.getElementById('bitDepth').value);
    const sampleReduction = parseInt(document.getElementById('sampleReduction').value);
    const noiseLevel = parseInt(document.getElementById('noiseLevel').value) / 100;
    const mixRatio = parseInt(document.getElementById('mixRatio').value) / 100;

    const sampleRate = originalBuffer.sampleRate;
    const channels = originalBuffer.numberOfChannels;
    const length = originalBuffer.length;

    // Create output buffer
    processedBuffer = audioContext.createBuffer(channels, length, sampleRate);

    const levels = Math.pow(2, bitDepth);

    for (let ch = 0; ch < channels; ch++) {
        const inputData = originalBuffer.getChannelData(ch);
        const outputData = processedBuffer.getChannelData(ch);

        let lastSample = 0;
        let sampleCounter = 0;

        for (let i = 0; i < length; i++) {
            // Sample rate reduction
            if (sampleCounter % sampleReduction === 0) {
                lastSample = inputData[i];
            }
            sampleCounter++;

            // Bit depth reduction
            let sample = lastSample;
            sample = Math.round(sample * levels) / levels;

            // Add noise
            if (noiseLevel > 0) {
                sample += (Math.random() * 2 - 1) * noiseLevel * 0.1;
            }

            // Clamp
            sample = Math.max(-1, Math.min(1, sample));

            // Mix wet/dry
            outputData[i] = sample * mixRatio + inputData[i] * (1 - mixRatio);
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
    a.download = 'bitcrushed-audio.wav';
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
