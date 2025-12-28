/**
 * Audio De-Esser - Tool #273
 * Reduce sibilance in audio
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let sourceNode = null;
let isPlaying = false;
let fileName = '';

const texts = {
    zh: {
        title: '音訊去齒音',
        subtitle: '減少人聲中的齒擦音',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '點擊或拖放音訊檔案',
        uploadHint: '支援 MP3, WAV, OGG 等格式',
        freq: '頻率範圍',
        threshold: '臨界值',
        ratio: '壓縮比',
        amount: '強度',
        preview: '▶️ 預覽',
        stop: '⏹️ 停止',
        download: '⬇️ 下載'
    },
    en: {
        title: 'Audio De-Esser',
        subtitle: 'Reduce sibilance in vocals',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Click or drop audio file',
        uploadHint: 'Supports MP3, WAV, OGG formats',
        freq: 'Frequency',
        threshold: 'Threshold',
        ratio: 'Ratio',
        amount: 'Amount',
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

    document.getElementById('freqSlider').addEventListener('input', (e) => {
        document.getElementById('freqValue').textContent = e.target.value + ' Hz';
    });

    document.getElementById('thresholdSlider').addEventListener('input', (e) => {
        document.getElementById('thresholdValue').textContent = e.target.value + ' dB';
    });

    document.getElementById('ratioSlider').addEventListener('input', (e) => {
        document.getElementById('ratioValue').textContent = e.target.value + ':1';
    });

    document.getElementById('amountSlider').addEventListener('input', (e) => {
        document.getElementById('amountValue').textContent = e.target.value + '%';
    });

    document.getElementById('previewBtn').addEventListener('click', togglePreview);
    document.getElementById('downloadBtn').addEventListener('click', downloadDeEssed);
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

    document.querySelectorAll('.option-group label')[0].textContent = t.freq;
    document.querySelectorAll('.option-group label')[1].textContent = t.threshold;
    document.querySelectorAll('.option-group label')[2].textContent = t.ratio;
    document.querySelectorAll('.option-group label')[3].textContent = t.amount;

    document.getElementById('previewBtn').textContent = isPlaying ? t.stop : t.preview;
    document.getElementById('downloadBtn').textContent = t.download;
}

async function handleFile(file) {
    fileName = file.name.replace(/\.[^/.]+$/, '');

    const arrayBuffer = await file.arrayBuffer();
    originalBuffer = await audioContext.decodeAudioData(arrayBuffer);

    document.getElementById('editorSection').style.display = 'block';
}

function applyDeEsser(buffer) {
    const centerFreq = parseFloat(document.getElementById('freqSlider').value);
    const thresholdDb = parseFloat(document.getElementById('thresholdSlider').value);
    const ratio = parseFloat(document.getElementById('ratioSlider').value);
    const amount = parseInt(document.getElementById('amountSlider').value) / 100;

    const threshold = Math.pow(10, thresholdDb / 20);
    const sampleRate = buffer.sampleRate;

    const outputBuffer = audioContext.createBuffer(buffer.numberOfChannels, buffer.length, sampleRate);

    // Bandpass filter coefficients for sibilance detection
    const bandwidth = centerFreq * 0.5;
    const w0 = 2 * Math.PI * centerFreq / sampleRate;
    const Q = centerFreq / bandwidth;
    const alpha = Math.sin(w0) / (2 * Q);

    const b0 = alpha;
    const b1 = 0;
    const b2 = -alpha;
    const a0 = 1 + alpha;
    const a1 = -2 * Math.cos(w0);
    const a2 = 1 - alpha;

    // Normalize
    const b0n = b0 / a0;
    const b1n = b1 / a0;
    const b2n = b2 / a0;
    const a1n = a1 / a0;
    const a2n = a2 / a0;

    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
        const input = buffer.getChannelData(ch);
        const output = outputBuffer.getChannelData(ch);

        // Filter state
        let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
        let envelope = 0;

        for (let i = 0; i < buffer.length; i++) {
            // Apply bandpass filter to detect sibilance
            const filtered = b0n * input[i] + b1n * x1 + b2n * x2 - a1n * y1 - a2n * y2;
            x2 = x1;
            x1 = input[i];
            y2 = y1;
            y1 = filtered;

            // Envelope follower
            const absFiltered = Math.abs(filtered);
            if (absFiltered > envelope) {
                envelope = absFiltered;
            } else {
                envelope = envelope * 0.9995;
            }

            // Calculate gain reduction
            let gainReduction = 1;
            if (envelope > threshold) {
                const overDb = 20 * Math.log10(envelope / threshold);
                const reductionDb = overDb * (1 - 1 / ratio);
                gainReduction = Math.pow(10, -reductionDb / 20);
            }

            // Apply de-essing with amount control
            const effectGain = 1 - (1 - gainReduction) * amount;
            output[i] = input[i] * effectGain;
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

    const deEssedBuffer = applyDeEsser(originalBuffer);

    sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = deEssedBuffer;
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

async function downloadDeEssed() {
    if (!originalBuffer) return;

    const deEssedBuffer = applyDeEsser(originalBuffer);
    const wavBlob = bufferToWav(deEssedBuffer);

    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}-deessed.wav`;
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
