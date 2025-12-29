/**
 * Audio Flanger - Tool #260
 * Add flanger effect to audio
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let sourceNode = null;
let isPlaying = false;
let fileName = '';

const texts = {
    zh: {
        title: '音訊鑲邊',
        subtitle: '為音訊添加鑲邊效果',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '點擊或拖放音訊檔案',
        uploadHint: '支援 MP3, WAV, OGG 等格式',
        rate: '調變速率',
        depth: '調變深度',
        feedback: '回授量',
        mix: '混合比例',
        preview: '▶️ 預覽',
        stop: '⏹️ 停止',
        download: '⬇️ 下載'
    },
    en: {
        title: 'Audio Flanger',
        subtitle: 'Add flanger effect to audio',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Click or drop audio file',
        uploadHint: 'Supports MP3, WAV, OGG formats',
        rate: 'Rate',
        depth: 'Depth',
        feedback: 'Feedback',
        mix: 'Mix',
        preview: '▶️ Preview',
        stop: '⏹️ Stop',
        download: '⬇️ Download'
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

    document.getElementById('rateSlider').addEventListener('input', (e) => {
        document.getElementById('rateValue').textContent = e.target.value + ' Hz';
    });

    document.getElementById('depthSlider').addEventListener('input', (e) => {
        document.getElementById('depthValue').textContent = e.target.value + ' ms';
    });

    document.getElementById('feedbackSlider').addEventListener('input', (e) => {
        document.getElementById('feedbackValue').textContent = e.target.value + '%';
    });

    document.getElementById('mixSlider').addEventListener('input', (e) => {
        document.getElementById('mixValue').textContent = e.target.value + '%';
    });

    document.getElementById('previewBtn').addEventListener('click', togglePreview);
    document.getElementById('downloadBtn').addEventListener('click', downloadFlanger);
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

    document.querySelectorAll('.option-group label')[0].textContent = t.rate;
    document.querySelectorAll('.option-group label')[1].textContent = t.depth;
    document.querySelectorAll('.option-group label')[2].textContent = t.feedback;
    document.querySelectorAll('.option-group label')[3].textContent = t.mix;

    document.getElementById('previewBtn').textContent = isPlaying ? t.stop : t.preview;
    document.getElementById('downloadBtn').textContent = t.download;
}

async function handleFile(file) {
    fileName = file.name.replace(/\.[^/.]+$/, '');

    const arrayBuffer = await file.arrayBuffer();
    originalBuffer = await audioContext.decodeAudioData(arrayBuffer);

    document.getElementById('editorSection').style.display = 'block';
}

function applyFlanger(buffer) {
    const rate = parseFloat(document.getElementById('rateSlider').value);
    const depthMs = parseFloat(document.getElementById('depthSlider').value);
    const feedback = parseInt(document.getElementById('feedbackSlider').value) / 100;
    const mix = parseInt(document.getElementById('mixSlider').value) / 100;

    const sampleRate = buffer.sampleRate;
    const depthSamples = Math.floor((depthMs / 1000) * sampleRate);
    const maxDelay = depthSamples * 2;

    const outputBuffer = audioContext.createBuffer(buffer.numberOfChannels, buffer.length, sampleRate);

    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
        const input = buffer.getChannelData(ch);
        const output = outputBuffer.getChannelData(ch);

        // Delay line for feedback
        const delayLine = new Float32Array(maxDelay);
        let delayIndex = 0;

        for (let i = 0; i < buffer.length; i++) {
            const t = i / sampleRate;
            const lfo = (Math.sin(2 * Math.PI * rate * t) + 1) / 2; // 0 to 1
            const currentDelay = Math.floor(lfo * depthSamples) + 1;

            // Read from delay line
            let readIndex = (delayIndex - currentDelay + maxDelay) % maxDelay;
            const delayed = delayLine[readIndex];

            // Calculate output
            const wet = delayed;
            const dry = input[i];
            output[i] = dry * (1 - mix) + wet * mix;

            // Write to delay line with feedback
            delayLine[delayIndex] = input[i] + delayed * feedback;
            delayIndex = (delayIndex + 1) % maxDelay;
        }

        // Normalize
        let max = 0;
        for (let i = 0; i < buffer.length; i++) {
            max = Math.max(max, Math.abs(output[i]));
        }
        if (max > 1) {
            for (let i = 0; i < buffer.length; i++) {
                output[i] /= max;
            }
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

    const flangerBuffer = applyFlanger(originalBuffer);

    sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = flangerBuffer;
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

async function downloadFlanger() {
    if (!originalBuffer) return;

    const flangerBuffer = applyFlanger(originalBuffer);
    const wavBlob = bufferToWav(flangerBuffer);

    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}-flanger.wav`;
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
