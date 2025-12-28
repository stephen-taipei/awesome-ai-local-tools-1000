/**
 * Audio Vocal Remover - Tool #279
 * Remove vocals from audio using phase cancellation
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let sourceNode = null;
let isPlaying = false;
let fileName = '';

const texts = {
    zh: {
        title: '音訊人聲移除',
        subtitle: '從音訊中移除人聲',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '點擊或拖放音訊檔案',
        uploadHint: '支援 MP3, WAV, OGG 等格式（需為立體聲）',
        info: '使用相位消除技術移除中央聲道的人聲。效果取決於原始混音。',
        lowCut: '低頻保護',
        highCut: '高頻保護',
        strength: '移除強度',
        preview: '▶️ 預覽',
        stop: '⏹️ 停止',
        download: '⬇️ 下載'
    },
    en: {
        title: 'Audio Vocal Remover',
        subtitle: 'Remove vocals from audio',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Click or drop audio file',
        uploadHint: 'Supports MP3, WAV, OGG formats (stereo required)',
        info: 'Uses phase cancellation to remove center-panned vocals. Results depend on original mix.',
        lowCut: 'Low Protect',
        highCut: 'High Protect',
        strength: 'Strength',
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

    document.getElementById('lowCutSlider').addEventListener('input', (e) => {
        document.getElementById('lowCutValue').textContent = e.target.value + ' Hz';
    });

    document.getElementById('highCutSlider').addEventListener('input', (e) => {
        document.getElementById('highCutValue').textContent = e.target.value + ' Hz';
    });

    document.getElementById('strengthSlider').addEventListener('input', (e) => {
        document.getElementById('strengthValue').textContent = e.target.value + '%';
    });

    document.getElementById('previewBtn').addEventListener('click', togglePreview);
    document.getElementById('downloadBtn').addEventListener('click', downloadVocalRemoved);
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
    document.querySelector('.info-box p').textContent = t.info;

    document.querySelectorAll('.option-group label')[0].textContent = t.lowCut;
    document.querySelectorAll('.option-group label')[1].textContent = t.highCut;
    document.querySelectorAll('.option-group label')[2].textContent = t.strength;

    document.getElementById('previewBtn').textContent = isPlaying ? t.stop : t.preview;
    document.getElementById('downloadBtn').textContent = t.download;
}

async function handleFile(file) {
    fileName = file.name.replace(/\.[^/.]+$/, '');

    const arrayBuffer = await file.arrayBuffer();
    originalBuffer = await audioContext.decodeAudioData(arrayBuffer);

    document.getElementById('editorSection').style.display = 'block';
}

function removeVocals(buffer) {
    const lowCut = parseFloat(document.getElementById('lowCutSlider').value);
    const highCut = parseFloat(document.getElementById('highCutSlider').value);
    const strength = parseInt(document.getElementById('strengthSlider').value) / 100;

    const sampleRate = buffer.sampleRate;

    // Need stereo for phase cancellation
    if (buffer.numberOfChannels < 2) {
        // Return original if mono
        return buffer;
    }

    const outputBuffer = audioContext.createBuffer(2, buffer.length, sampleRate);

    const leftInput = buffer.getChannelData(0);
    const rightInput = buffer.getChannelData(1);
    const leftOutput = outputBuffer.getChannelData(0);
    const rightOutput = outputBuffer.getChannelData(1);

    // High-pass filter coefficients (to protect bass)
    const w0Low = 2 * Math.PI * lowCut / sampleRate;
    const alphaLow = Math.sin(w0Low) / 2;
    const hpB0 = (1 + Math.cos(w0Low)) / 2 / (1 + alphaLow);
    const hpB1 = -(1 + Math.cos(w0Low)) / (1 + alphaLow);
    const hpB2 = (1 + Math.cos(w0Low)) / 2 / (1 + alphaLow);
    const hpA1 = -2 * Math.cos(w0Low) / (1 + alphaLow);
    const hpA2 = (1 - alphaLow) / (1 + alphaLow);

    // Low-pass filter coefficients (to protect highs)
    const w0High = 2 * Math.PI * highCut / sampleRate;
    const alphaHigh = Math.sin(w0High) / 2;
    const lpB0 = (1 - Math.cos(w0High)) / 2 / (1 + alphaHigh);
    const lpB1 = (1 - Math.cos(w0High)) / (1 + alphaHigh);
    const lpB2 = (1 - Math.cos(w0High)) / 2 / (1 + alphaHigh);
    const lpA1 = -2 * Math.cos(w0High) / (1 + alphaHigh);
    const lpA2 = (1 - alphaHigh) / (1 + alphaHigh);

    // Filter states
    let hpX1 = 0, hpX2 = 0, hpY1 = 0, hpY2 = 0;
    let lpX1 = 0, lpX2 = 0, lpY1 = 0, lpY2 = 0;

    for (let i = 0; i < buffer.length; i++) {
        // Phase cancellation: subtract right from left to remove center
        const diff = (leftInput[i] - rightInput[i]) * 0.5;

        // Apply high-pass to protect bass
        let filtered = hpB0 * diff + hpB1 * hpX1 + hpB2 * hpX2 - hpA1 * hpY1 - hpA2 * hpY2;
        hpX2 = hpX1;
        hpX1 = diff;
        hpY2 = hpY1;
        hpY1 = filtered;

        // Apply low-pass to protect highs
        const lpFiltered = lpB0 * filtered + lpB1 * lpX1 + lpB2 * lpX2 - lpA1 * lpY1 - lpA2 * lpY2;
        lpX2 = lpX1;
        lpX1 = filtered;
        lpY2 = lpY1;
        lpY1 = lpFiltered;

        // Blend between original and vocal-removed based on strength
        const vocalRemoved = lpFiltered;

        leftOutput[i] = leftInput[i] * (1 - strength) + vocalRemoved * strength;
        rightOutput[i] = rightInput[i] * (1 - strength) + vocalRemoved * strength;
    }

    // Normalize
    let max = 0;
    for (let i = 0; i < buffer.length; i++) {
        max = Math.max(max, Math.abs(leftOutput[i]), Math.abs(rightOutput[i]));
    }
    if (max > 1) {
        for (let i = 0; i < buffer.length; i++) {
            leftOutput[i] /= max;
            rightOutput[i] /= max;
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

    const vocalRemovedBuffer = removeVocals(originalBuffer);

    sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = vocalRemovedBuffer;
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

async function downloadVocalRemoved() {
    if (!originalBuffer) return;

    const vocalRemovedBuffer = removeVocals(originalBuffer);
    const wavBlob = bufferToWav(vocalRemovedBuffer);

    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}-instrumental.wav`;
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
