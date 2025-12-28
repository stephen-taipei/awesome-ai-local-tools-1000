/**
 * Audio Chorus - Tool #310
 * Add chorus effect to audio
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let processedBuffer = null;

const texts = {
    zh: {
        title: '音頻合唱',
        subtitle: '為音頻添加合唱效果',
        privacy: '100% 本地處理 · 零資料上傳',
        rate: '速率',
        depth: '深度',
        voices: '聲部',
        mix: '混合',
        process: '🔄 處理音頻',
        download: '⬇️ 下載',
        result: '處理結果',
        upload: '拖放音頻檔案至此或點擊上傳',
        uploadHint: '支援 MP3, WAV, OGG, M4A',
        processing: '處理中...'
    },
    en: {
        title: 'Chorus',
        subtitle: 'Add chorus effect to audio',
        privacy: '100% Local Processing · No Data Upload',
        rate: 'Rate',
        depth: 'Depth',
        voices: 'Voices',
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
    setupSliders();

    document.getElementById('processBtn').addEventListener('click', processAudio);
    document.getElementById('downloadBtn').addEventListener('click', downloadAudio);
}

function setupFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('drag-over'); });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', (e) => { if (e.target.files.length) handleFile(e.target.files[0]); });
}

function setupSliders() {
    document.getElementById('rate').addEventListener('input', (e) => {
        document.getElementById('rateValue').textContent = e.target.value + ' Hz';
    });
    document.getElementById('depth').addEventListener('input', (e) => {
        document.getElementById('depthValue').textContent = e.target.value + '%';
    });
    document.getElementById('voices').addEventListener('input', (e) => {
        document.getElementById('voicesValue').textContent = e.target.value;
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

    const labels = document.querySelectorAll('.option-group label');
    labels[0].textContent = t.rate;
    labels[1].textContent = t.depth;
    labels[2].textContent = t.voices;
    labels[3].textContent = t.mix;

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

async function processAudio() {
    if (!originalBuffer) return;

    const processBtn = document.getElementById('processBtn');
    const originalText = processBtn.textContent;
    processBtn.textContent = texts[currentLang].processing;
    processBtn.disabled = true;

    await new Promise(resolve => setTimeout(resolve, 10));

    const rate = parseFloat(document.getElementById('rate').value);
    const depth = parseInt(document.getElementById('depth').value) / 100;
    const voices = parseInt(document.getElementById('voices').value);
    const mix = parseInt(document.getElementById('mix').value) / 100;

    const sampleRate = originalBuffer.sampleRate;
    const channels = originalBuffer.numberOfChannels;
    const length = originalBuffer.length;

    const baseDelay = 0.025; // 25ms base delay
    const maxModulation = 0.003; // 3ms max modulation

    processedBuffer = audioContext.createBuffer(channels, length, sampleRate);

    for (let ch = 0; ch < channels; ch++) {
        const inputData = originalBuffer.getChannelData(ch);
        const outputData = processedBuffer.getChannelData(ch);

        // Create delay buffers for each voice
        const delayBufferSize = Math.ceil((baseDelay + maxModulation * 2) * sampleRate);
        const delayBuffers = [];
        const writeIndices = [];

        for (let v = 0; v < voices; v++) {
            delayBuffers.push(new Float32Array(delayBufferSize));
            writeIndices.push(0);
        }

        for (let i = 0; i < length; i++) {
            const time = i / sampleRate;
            let wetSum = 0;

            for (let v = 0; v < voices; v++) {
                // Different phase offset for each voice
                const phaseOffset = (v / voices) * 2 * Math.PI;
                const lfo = Math.sin(2 * Math.PI * rate * time + phaseOffset);

                // Slightly different delay and modulation for each voice
                const voiceDelay = baseDelay * (1 + v * 0.1);
                const delayTime = voiceDelay + maxModulation * depth * lfo;
                const delaySamples = delayTime * sampleRate;

                // Write to delay buffer
                delayBuffers[v][writeIndices[v]] = inputData[i];

                // Read from delay buffer with interpolation
                let readIndex = writeIndices[v] - delaySamples;
                if (readIndex < 0) readIndex += delayBufferSize;

                const index0 = Math.floor(readIndex);
                const index1 = (index0 + 1) % delayBufferSize;
                const frac = readIndex - index0;

                const sample0 = delayBuffers[v][index0 % delayBufferSize];
                const sample1 = delayBuffers[v][index1];
                wetSum += sample0 + (sample1 - sample0) * frac;

                writeIndices[v] = (writeIndices[v] + 1) % delayBufferSize;
            }

            // Average wet samples and mix
            const wetSample = wetSum / voices;
            outputData[i] = inputData[i] * (1 - mix) + wetSample * mix;
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
    a.download = 'chorus-audio.wav';
    a.click();
}

function bufferToWav(buffer) {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const bytesPerSample = 2;
    const blockAlign = numChannels * bytesPerSample;
    const dataSize = buffer.length * blockAlign;
    const bufferSize = 44 + dataSize;

    const arrayBuffer = new ArrayBuffer(bufferSize);
    const view = new DataView(arrayBuffer);

    const writeString = (offset, string) => {
        for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
    };

    writeString(0, 'RIFF');
    view.setUint32(4, bufferSize - 8, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    const channels = [];
    for (let i = 0; i < numChannels; i++) channels.push(buffer.getChannelData(i));

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
