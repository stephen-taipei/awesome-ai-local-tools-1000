/**
 * Audio Bitcrusher - Tool #268
 * Add bitcrusher lo-fi effect to audio
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let sourceNode = null;
let isPlaying = false;
let fileName = '';

const texts = {
    zh: {
        title: '音訊位元壓縮',
        subtitle: '為音訊添加復古 Lo-Fi 效果',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '點擊或拖放音訊檔案',
        uploadHint: '支援 MP3, WAV, OGG 等格式',
        bits: '位元深度',
        downsample: '降頻因子',
        mix: '混合比例',
        preview: '▶️ 預覽',
        stop: '⏹️ 停止',
        download: '⬇️ 下載',
        extreme: '極限'
    },
    en: {
        title: 'Audio Bitcrusher',
        subtitle: 'Add retro Lo-Fi effect to audio',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Click or drop audio file',
        uploadHint: 'Supports MP3, WAV, OGG formats',
        bits: 'Bit Depth',
        downsample: 'Downsample',
        mix: 'Mix',
        preview: '▶️ Preview',
        stop: '⏹️ Stop',
        download: '⬇️ Download',
        extreme: 'Extreme'
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

    document.getElementById('bitsSlider').addEventListener('input', (e) => {
        document.getElementById('bitsValue').textContent = e.target.value + ' bits';
        updatePresetButtons();
    });

    document.getElementById('downsampleSlider').addEventListener('input', (e) => {
        document.getElementById('downsampleValue').textContent = e.target.value + 'x';
        updatePresetButtons();
    });

    document.getElementById('mixSlider').addEventListener('input', (e) => {
        document.getElementById('mixValue').textContent = e.target.value + '%';
    });

    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const bits = parseInt(btn.dataset.bits);
            const downsample = parseInt(btn.dataset.downsample);
            document.getElementById('bitsSlider').value = bits;
            document.getElementById('downsampleSlider').value = downsample;
            document.getElementById('bitsValue').textContent = bits + ' bits';
            document.getElementById('downsampleValue').textContent = downsample + 'x';
            updatePresetButtons();
        });
    });

    document.getElementById('previewBtn').addEventListener('click', togglePreview);
    document.getElementById('downloadBtn').addEventListener('click', downloadBitcrushed);
}

function updatePresetButtons() {
    const bits = parseInt(document.getElementById('bitsSlider').value);
    const downsample = parseInt(document.getElementById('downsampleSlider').value);

    document.querySelectorAll('.preset-btn').forEach(btn => {
        const btnBits = parseInt(btn.dataset.bits);
        const btnDownsample = parseInt(btn.dataset.downsample);
        btn.classList.toggle('active', btnBits === bits && btnDownsample === downsample);
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

    document.querySelectorAll('.option-group label')[0].textContent = t.bits;
    document.querySelectorAll('.option-group label')[1].textContent = t.downsample;
    document.querySelectorAll('.option-group label')[2].textContent = t.mix;

    const presetBtns = document.querySelectorAll('.preset-btn');
    presetBtns[3].textContent = t.extreme;

    document.getElementById('previewBtn').textContent = isPlaying ? t.stop : t.preview;
    document.getElementById('downloadBtn').textContent = t.download;
}

async function handleFile(file) {
    fileName = file.name.replace(/\.[^/.]+$/, '');

    const arrayBuffer = await file.arrayBuffer();
    originalBuffer = await audioContext.decodeAudioData(arrayBuffer);

    document.getElementById('editorSection').style.display = 'block';
}

function applyBitcrusher(buffer) {
    const bits = parseInt(document.getElementById('bitsSlider').value);
    const downsample = parseInt(document.getElementById('downsampleSlider').value);
    const mix = parseInt(document.getElementById('mixSlider').value) / 100;

    const sampleRate = buffer.sampleRate;
    const outputBuffer = audioContext.createBuffer(buffer.numberOfChannels, buffer.length, sampleRate);

    // Quantization levels based on bit depth
    const levels = Math.pow(2, bits);

    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
        const input = buffer.getChannelData(ch);
        const output = outputBuffer.getChannelData(ch);

        let holdSample = 0;

        for (let i = 0; i < buffer.length; i++) {
            // Sample rate reduction (sample and hold)
            if (i % downsample === 0) {
                holdSample = input[i];
            }

            // Bit depth reduction (quantization)
            const crushed = Math.round(holdSample * (levels / 2)) / (levels / 2);

            // Mix dry and wet
            output[i] = input[i] * (1 - mix) + crushed * mix;
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

    const crushedBuffer = applyBitcrusher(originalBuffer);

    sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = crushedBuffer;
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

async function downloadBitcrushed() {
    if (!originalBuffer) return;

    const crushedBuffer = applyBitcrusher(originalBuffer);
    const wavBlob = bufferToWav(crushedBuffer);

    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}-bitcrushed.wav`;
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
