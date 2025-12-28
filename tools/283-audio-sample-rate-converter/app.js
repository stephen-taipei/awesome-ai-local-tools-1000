/**
 * Audio Sample Rate Converter - Tool #283
 * Convert audio sample rate
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let sourceNode = null;
let isPlaying = false;
let fileName = '';

const texts = {
    zh: {
        title: '音訊取樣率轉換',
        subtitle: '轉換音訊取樣率',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '點擊或拖放音訊檔案',
        uploadHint: '支援 MP3, WAV, OGG 等格式',
        originalRate: '原始取樣率',
        targetRate: '目標取樣率',
        quality: '品質',
        preview: '▶️ 預覽',
        stop: '⏹️ 停止',
        download: '⬇️ 下載',
        phone: '電話',
        voice: '語音',
        cd: 'CD',
        dvd: 'DVD',
        hires: '高解析',
        fast: '快速',
        standard: '標準',
        high: '高品質'
    },
    en: {
        title: 'Sample Rate Converter',
        subtitle: 'Convert audio sample rate',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Click or drop audio file',
        uploadHint: 'Supports MP3, WAV, OGG formats',
        originalRate: 'Original Sample Rate',
        targetRate: 'Target Sample Rate',
        quality: 'Quality',
        preview: '▶️ Preview',
        stop: '⏹️ Stop',
        download: '⬇️ Download',
        phone: 'Phone',
        voice: 'Voice',
        cd: 'CD',
        dvd: 'DVD',
        hires: 'Hi-Res',
        fast: 'Fast',
        standard: 'Standard',
        high: 'High Quality'
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

    document.getElementById('previewBtn').addEventListener('click', togglePreview);
    document.getElementById('downloadBtn').addEventListener('click', downloadConverted);
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

    document.querySelectorAll('.option-group label')[0].textContent = t.targetRate;
    document.querySelectorAll('.option-group label')[1].textContent = t.quality;

    const rateSelect = document.getElementById('rateSelect');
    rateSelect.options[0].textContent = `8,000 Hz (${t.phone})`;
    rateSelect.options[1].textContent = `16,000 Hz (${t.voice})`;
    rateSelect.options[2].textContent = '22,050 Hz';
    rateSelect.options[3].textContent = `44,100 Hz (${t.cd})`;
    rateSelect.options[4].textContent = `48,000 Hz (${t.dvd})`;
    rateSelect.options[5].textContent = `96,000 Hz (${t.hires})`;

    const qualitySelect = document.getElementById('qualitySelect');
    qualitySelect.options[0].textContent = t.fast;
    qualitySelect.options[1].textContent = t.standard;
    qualitySelect.options[2].textContent = t.high;

    document.getElementById('previewBtn').textContent = isPlaying ? t.stop : t.preview;
    document.getElementById('downloadBtn').textContent = t.download;
}

async function handleFile(file) {
    fileName = file.name.replace(/\.[^/.]+$/, '');

    const arrayBuffer = await file.arrayBuffer();
    originalBuffer = await audioContext.decodeAudioData(arrayBuffer);

    document.getElementById('originalRate').textContent = originalBuffer.sampleRate.toLocaleString() + ' Hz';
    document.getElementById('editorSection').style.display = 'block';
}

async function convertSampleRate(buffer) {
    const targetRate = parseInt(document.getElementById('rateSelect').value);

    if (buffer.sampleRate === targetRate) {
        return buffer;
    }

    // Use OfflineAudioContext for resampling
    const ratio = targetRate / buffer.sampleRate;
    const newLength = Math.round(buffer.length * ratio);

    const offlineContext = new OfflineAudioContext(
        buffer.numberOfChannels,
        newLength,
        targetRate
    );

    const source = offlineContext.createBufferSource();
    source.buffer = buffer;
    source.connect(offlineContext.destination);
    source.start(0);

    return await offlineContext.startRendering();
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

    const convertedBuffer = await convertSampleRate(originalBuffer);

    // Create a new context at the converted sample rate for accurate preview
    const previewContext = new (window.AudioContext || window.webkitAudioContext)();

    sourceNode = previewContext.createBufferSource();
    sourceNode.buffer = convertedBuffer;
    sourceNode.connect(previewContext.destination);

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

async function downloadConverted() {
    if (!originalBuffer) return;

    const convertedBuffer = await convertSampleRate(originalBuffer);
    const wavBlob = bufferToWav(convertedBuffer);

    const targetRate = document.getElementById('rateSelect').value;
    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}-${targetRate}hz.wav`;
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
