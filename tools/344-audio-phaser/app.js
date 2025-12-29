/**
 * Audio Phaser - Tool #344
 * Add phaser effect to audio
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let processedBuffer = null;

const texts = {
    zh: {
        title: '音頻相位',
        subtitle: '添加迷幻相位效果',
        privacy: '100% 本地處理 · 零資料上傳',
        rate: '速率',
        depth: '深度',
        stages: '級數',
        feedback: '回授',
        mix: '混合',
        process: '🔄 處理音頻',
        download: '⬇️ 下載',
        result: '處理結果',
        upload: '拖放音頻檔案至此或點擊上傳',
        uploadHint: '支援 MP3, WAV, OGG, M4A',
        processing: '處理中...'
    },
    en: {
        title: 'Audio Phaser',
        subtitle: 'Add psychedelic phaser effect',
        privacy: '100% Local Processing · No Data Upload',
        rate: 'Rate',
        depth: 'Depth',
        stages: 'Stages',
        feedback: 'Feedback',
        mix: 'Mix',
        process: '🔄 Process',
        download: '⬇️ Download',
        result: 'Result',
        upload: 'Drop audio file here or click to upload',
        uploadHint: 'Supports MP3, WAV, OGG, M4A',
        processing: 'Processing...'
    }
};

function init() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    setupFileUpload();
    setupControls();
    document.getElementById('processBtn').addEventListener('click', processAudio);
    document.getElementById('downloadBtn').addEventListener('click', downloadAudio);
}

function setupFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('drag-over'); });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));
    uploadArea.addEventListener('drop', (e) => { e.preventDefault(); uploadArea.classList.remove('drag-over'); if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]); });
    fileInput.addEventListener('change', (e) => { if (e.target.files.length) handleFile(e.target.files[0]); });
}

function setupControls() {
    document.getElementById('rate').addEventListener('input', (e) => {
        document.getElementById('rateValue').textContent = parseFloat(e.target.value).toFixed(1) + ' Hz';
    });
    document.getElementById('depth').addEventListener('input', (e) => {
        document.getElementById('depthValue').textContent = e.target.value + '%';
    });
    document.getElementById('stages').addEventListener('input', (e) => {
        document.getElementById('stagesValue').textContent = e.target.value;
    });
    document.getElementById('feedback').addEventListener('input', (e) => {
        document.getElementById('feedbackValue').textContent = e.target.value + '%';
    });
    document.getElementById('mix').addEventListener('input', (e) => {
        document.getElementById('mixValue').textContent = e.target.value + '%';
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
    document.getElementById('rateLabel').textContent = t.rate;
    document.getElementById('depthLabel').textContent = t.depth;
    document.getElementById('stagesLabel').textContent = t.stages;
    document.getElementById('feedbackLabel').textContent = t.feedback;
    document.getElementById('mixLabel').textContent = t.mix;
    document.getElementById('processBtn').textContent = t.process;
    document.getElementById('downloadBtn').textContent = t.download;
    document.getElementById('resultTitle').textContent = t.result;
    document.querySelector('.upload-area p').textContent = t.upload;
    document.querySelector('.upload-hint').textContent = t.uploadHint;
}

async function handleFile(file) {
    const arrayBuffer = await file.arrayBuffer();
    originalBuffer = await audioContext.decodeAudioData(arrayBuffer);

    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('audioLoaded').style.display = 'block';
    document.getElementById('fileInfo').textContent = `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
    document.getElementById('originalAudio').src = URL.createObjectURL(file);

    document.getElementById('optionsSection').style.display = 'block';
    document.getElementById('actionSection').style.display = 'flex';
}

// All-pass filter for phaser stages
class AllPassFilter {
    constructor() {
        this.a1 = 0;
        this.zm1 = 0;
    }

    setCoefficient(a1) {
        this.a1 = a1;
    }

    process(input) {
        const output = input * -this.a1 + this.zm1;
        this.zm1 = output * this.a1 + input;
        return output;
    }
}

async function processAudio() {
    if (!originalBuffer) return;
    const processBtn = document.getElementById('processBtn');
    const originalText = processBtn.textContent;
    processBtn.textContent = texts[currentLang].processing;
    processBtn.disabled = true;
    await new Promise(resolve => setTimeout(resolve, 10));

    const rate = parseFloat(document.getElementById('rate').value);
    const depth = parseInt(document.getElementById('depth').value) / 100;
    const numStages = parseInt(document.getElementById('stages').value);
    const feedback = parseInt(document.getElementById('feedback').value) / 100;
    const mix = parseInt(document.getElementById('mix').value) / 100;

    const channels = originalBuffer.numberOfChannels;
    const length = originalBuffer.length;
    const sampleRate = originalBuffer.sampleRate;

    // Frequency range for the phaser
    const minFreq = 200;
    const maxFreq = 4000;

    processedBuffer = audioContext.createBuffer(channels, length, sampleRate);

    for (let ch = 0; ch < channels; ch++) {
        const inputData = originalBuffer.getChannelData(ch);
        const outputData = processedBuffer.getChannelData(ch);

        // Create all-pass filters for this channel
        const filters = [];
        for (let s = 0; s < numStages; s++) {
            filters.push(new AllPassFilter());
        }

        let feedbackSample = 0;

        for (let i = 0; i < length; i++) {
            // Calculate LFO
            const lfo = (Math.sin(2 * Math.PI * rate * i / sampleRate) + 1) * 0.5;

            // Calculate sweep frequency
            const sweepFreq = minFreq + (maxFreq - minFreq) * lfo * depth;

            // Calculate all-pass coefficient
            const w0 = 2 * Math.PI * sweepFreq / sampleRate;
            const tan_w0_2 = Math.tan(w0 / 2);
            const a1 = (tan_w0_2 - 1) / (tan_w0_2 + 1);

            // Process through all-pass filter chain
            let sample = inputData[i] + feedbackSample * feedback;

            for (let s = 0; s < numStages; s++) {
                filters[s].setCoefficient(a1);
                sample = filters[s].process(sample);
            }

            feedbackSample = sample;

            // Mix dry and wet signals
            outputData[i] = inputData[i] * (1 - mix) + sample * mix;
        }
    }

    const blob = bufferToWav(processedBuffer);
    document.getElementById('resultSection').style.display = 'block';
    document.getElementById('processedAudio').src = URL.createObjectURL(blob);
    document.getElementById('downloadBtn').disabled = false;
    processBtn.textContent = originalText;
    processBtn.disabled = false;
}

function downloadAudio() {
    if (!processedBuffer) return;
    const blob = bufferToWav(processedBuffer);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'phased-audio.wav';
    a.click();
}

function bufferToWav(buffer) {
    const numChannels = buffer.numberOfChannels, sampleRate = buffer.sampleRate;
    const bytesPerSample = 2, blockAlign = numChannels * bytesPerSample;
    const dataSize = buffer.length * blockAlign, bufferSize = 44 + dataSize;
    const arrayBuffer = new ArrayBuffer(bufferSize);
    const view = new DataView(arrayBuffer);
    const writeString = (o, s) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); };
    writeString(0, 'RIFF'); view.setUint32(4, bufferSize - 8, true); writeString(8, 'WAVE'); writeString(12, 'fmt ');
    view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true); view.setUint16(34, 16, true); writeString(36, 'data'); view.setUint32(40, dataSize, true);
    const channels = []; for (let i = 0; i < numChannels; i++) channels.push(buffer.getChannelData(i));
    let offset = 44;
    for (let i = 0; i < buffer.length; i++) { for (let ch = 0; ch < numChannels; ch++) { view.setInt16(offset, Math.max(-1, Math.min(1, channels[ch][i])) * 32767, true); offset += 2; } }
    return new Blob([arrayBuffer], { type: 'audio/wav' });
}

init();
