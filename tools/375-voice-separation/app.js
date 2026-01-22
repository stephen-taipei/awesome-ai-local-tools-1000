/**
 * Voice Separation - Tool #375
 * Separate vocals from background in video (simplified demo)
 * Note: Full implementation would require Demucs ONNX model
 */

let currentLang = 'zh';
let audioFile = null;
let audioContext = null;

const texts = {
    zh: {
        title: '影片語音分離',
        subtitle: '分離影片中的人聲與背景音',
        privacy: '100% 本地處理 · 零資料上傳',
        process: '🎵 分離音軌',
        download: '下載',
        upload: '拖放影片檔案至此或點擊上傳',
        uploadHint: '支援 MP4, WebM, MP3, WAV',
        loading: '載入中...',
        processing: '處理中...',
        complete: '處理完成！',
        separationOptions: '分離選項',
        extractVocals: '提取人聲',
        extractBgm: '提取背景音樂',
        result: '分離結果',
        vocals: '🎤 人聲',
        bgm: '🎵 背景音樂',
        notSupported: '此功能需要 Demucs 模型，目前提供簡化版示範'
    },
    en: {
        title: 'Voice Separation',
        subtitle: 'Separate vocals from background',
        privacy: '100% Local Processing · No Data Upload',
        process: '🎵 Separate Audio',
        download: 'Download',
        upload: 'Drop video file here or click to upload',
        uploadHint: 'Supports MP4, WebM, MP3, WAV',
        loading: 'Loading...',
        processing: 'Processing...',
        complete: 'Processing complete!',
        separationOptions: 'Separation Options',
        extractVocals: 'Extract Vocals',
        extractBgm: 'Extract Background Music',
        result: 'Separation Result',
        vocals: '🎤 Vocals',
        bgm: '🎵 Background Music',
        notSupported: 'This feature requires Demucs model, showing simplified demo'
    }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    setupFileUpload();
    document.getElementById('processBtn').addEventListener('click', processAudio);
    document.getElementById('downloadVocals').addEventListener('click', () => downloadAudio('vocals'));
    document.getElementById('downloadBgm').addEventListener('click', () => downloadAudio('bgm'));
}

function setupFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', (e) => e.preventDefault());
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', (e) => { if (e.target.files.length) handleFile(e.target.files[0]); });
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');
    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.getElementById('processBtn').textContent = t.process;
}

function handleFile(file) {
    audioFile = file;
    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('fileInfo').style.display = 'block';
    document.getElementById('fileInfo').textContent = `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
    document.getElementById('optionsSection').style.display = 'block';
    document.getElementById('actionSection').style.display = 'flex';
}

async function processAudio() {
    const t = texts[currentLang];
    const processBtn = document.getElementById('processBtn');
    processBtn.disabled = true;
    processBtn.textContent = t.loading;

    document.getElementById('progressSection').style.display = 'block';

    try {
        audioContext = new AudioContext();

        // Read file as array buffer
        const arrayBuffer = await audioFile.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // Simple frequency-based separation (demo only)
        // Real implementation would use Demucs AI model
        const extractVocals = document.getElementById('extractVocals').checked;
        const extractBgm = document.getElementById('extractBgm').checked;

        document.getElementById('progressFill').style.width = '50%';
        document.getElementById('progressText').textContent = t.processing;

        await new Promise(resolve => setTimeout(resolve, 1000));

        // Create filtered versions (simplified demo)
        if (extractVocals) {
            const vocalsBuffer = applyFilter(audioBuffer, 'highpass', 200);
            const vocalsBlob = await bufferToWav(vocalsBuffer);
            document.getElementById('vocalsAudio').src = URL.createObjectURL(vocalsBlob);
            document.getElementById('vocalsResult').style.display = 'flex';
        }

        if (extractBgm) {
            const bgmBuffer = applyFilter(audioBuffer, 'lowpass', 2000);
            const bgmBlob = await bufferToWav(bgmBuffer);
            document.getElementById('bgmAudio').src = URL.createObjectURL(bgmBlob);
            document.getElementById('bgmResult').style.display = 'flex';
        }

        document.getElementById('progressFill').style.width = '100%';
        document.getElementById('progressText').textContent = t.complete;
        document.getElementById('resultSection').style.display = 'block';

    } catch (error) {
        console.error('Error:', error);
        document.getElementById('progressText').textContent = 'Error: ' + error.message;
    }

    document.getElementById('progressSection').style.display = 'none';
    processBtn.disabled = false;
    processBtn.textContent = t.process;
}

function applyFilter(audioBuffer, type, frequency) {
    const offlineContext = new OfflineAudioContext(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        audioBuffer.sampleRate
    );

    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;

    const filter = offlineContext.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = frequency;

    source.connect(filter);
    filter.connect(offlineContext.destination);
    source.start();

    return offlineContext.startRendering();
}

async function bufferToWav(audioBuffer) {
    const buffer = await audioBuffer;
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;

    const dataLength = buffer.length * blockAlign;
    const bufferLength = 44 + dataLength;

    const arrayBuffer = new ArrayBuffer(bufferLength);
    const view = new DataView(arrayBuffer);

    // WAV header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, bufferLength - 8, true);
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
    view.setUint32(40, dataLength, true);

    // Audio data
    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
        for (let ch = 0; ch < numChannels; ch++) {
            const sample = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
            view.setInt16(offset, sample * 0x7FFF, true);
            offset += 2;
        }
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
}

function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

function downloadAudio(type) {
    const audio = document.getElementById(type === 'vocals' ? 'vocalsAudio' : 'bgmAudio');
    const a = document.createElement('a');
    a.href = audio.src;
    a.download = `${type}.wav`;
    a.click();
}

init();
