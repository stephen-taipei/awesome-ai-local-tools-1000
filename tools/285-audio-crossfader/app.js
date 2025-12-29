/**
 * Audio Crossfader - Tool #285
 * Crossfade between two audio files
 */

let currentLang = 'zh';
let audioContext = null;
let buffer1 = null;
let buffer2 = null;
let sourceNode = null;
let isPlaying = false;

const texts = {
    zh: {
        title: '音訊交叉淡化',
        subtitle: '將兩個音訊檔案交叉淡化合併',
        privacy: '100% 本地處理 · 零資料上傳',
        audioA: '音訊 A',
        audioB: '音訊 B',
        clickUpload: '點擊上傳',
        loaded: '已載入',
        crossfade: '淡化時間',
        curve: '淡化曲線',
        position: '淡化位置',
        preview: '▶️ 預覽',
        stop: '⏹️ 停止',
        download: '⬇️ 下載',
        linear: '線性',
        equalPower: '等功率',
        exponential: '指數',
        endToStart: 'A結尾到B開頭',
        custom: '自訂位置',
        seconds: '秒'
    },
    en: {
        title: 'Audio Crossfader',
        subtitle: 'Crossfade between two audio files',
        privacy: '100% Local Processing · No Data Upload',
        audioA: 'Audio A',
        audioB: 'Audio B',
        clickUpload: 'Click to upload',
        loaded: 'Loaded',
        crossfade: 'Crossfade',
        curve: 'Curve',
        position: 'Position',
        preview: '▶️ Preview',
        stop: '⏹️ Stop',
        download: '⬇️ Download',
        linear: 'Linear',
        equalPower: 'Equal Power',
        exponential: 'Exponential',
        endToStart: 'A end to B start',
        custom: 'Custom',
        seconds: 's'
    }
};

function init() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));

    setupUploadArea('uploadArea1', 'audioInput1', 1);
    setupUploadArea('uploadArea2', 'audioInput2', 2);

    document.getElementById('crossfadeSlider').addEventListener('input', (e) => {
        const unit = currentLang === 'zh' ? '秒' : 's';
        document.getElementById('crossfadeValue').textContent = parseFloat(e.target.value).toFixed(1) + ' ' + unit;
    });

    document.getElementById('previewBtn').addEventListener('click', togglePreview);
    document.getElementById('downloadBtn').addEventListener('click', downloadCrossfaded);
}

function setupUploadArea(areaId, inputId, num) {
    const uploadArea = document.getElementById(areaId);
    const audioInput = document.getElementById(inputId);

    uploadArea.addEventListener('click', () => audioInput.click());
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0], num);
    });
    audioInput.addEventListener('change', (e) => {
        if (e.target.files.length) handleFile(e.target.files[0], num);
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

    document.querySelectorAll('.upload-text')[0].textContent = t.audioA;
    document.querySelectorAll('.upload-text')[1].textContent = t.audioB;

    if (!buffer1) document.getElementById('status1').textContent = t.clickUpload;
    if (!buffer2) document.getElementById('status2').textContent = t.clickUpload;

    const labels = document.querySelectorAll('.option-group label');
    labels[0].textContent = t.crossfade;
    labels[1].textContent = t.curve;
    labels[2].textContent = t.position;

    const curveSelect = document.getElementById('curveSelect');
    curveSelect.options[0].textContent = t.linear;
    curveSelect.options[1].textContent = t.equalPower;
    curveSelect.options[2].textContent = t.exponential;

    const positionSelect = document.getElementById('positionSelect');
    positionSelect.options[0].textContent = t.endToStart;
    positionSelect.options[1].textContent = t.custom;

    const unit = lang === 'zh' ? '秒' : 's';
    document.getElementById('crossfadeValue').textContent = parseFloat(document.getElementById('crossfadeSlider').value).toFixed(1) + ' ' + unit;

    document.getElementById('previewBtn').textContent = isPlaying ? t.stop : t.preview;
    document.getElementById('downloadBtn').textContent = t.download;
}

async function handleFile(file, num) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = await audioContext.decodeAudioData(arrayBuffer);

    if (num === 1) {
        buffer1 = buffer;
        document.getElementById('uploadArea1').classList.add('loaded');
        document.getElementById('status1').textContent = texts[currentLang].loaded;
    } else {
        buffer2 = buffer;
        document.getElementById('uploadArea2').classList.add('loaded');
        document.getElementById('status2').textContent = texts[currentLang].loaded;
    }

    if (buffer1 && buffer2) {
        document.getElementById('editorSection').style.display = 'block';
    }
}

function getCrossfadeGain(t, curve) {
    switch (curve) {
        case 'linear':
            return { fadeOut: 1 - t, fadeIn: t };
        case 'equalPower':
            return {
                fadeOut: Math.cos(t * Math.PI / 2),
                fadeIn: Math.sin(t * Math.PI / 2)
            };
        case 'exponential':
            return {
                fadeOut: Math.pow(1 - t, 2),
                fadeIn: Math.pow(t, 2)
            };
        default:
            return { fadeOut: 1 - t, fadeIn: t };
    }
}

function createCrossfade() {
    if (!buffer1 || !buffer2) return null;

    const crossfadeTime = parseFloat(document.getElementById('crossfadeSlider').value);
    const curve = document.getElementById('curveSelect').value;

    const sampleRate = buffer1.sampleRate;
    const crossfadeSamples = Math.floor(crossfadeTime * sampleRate);

    // Total length: buffer1 + buffer2 - crossfade overlap
    const totalLength = buffer1.length + buffer2.length - crossfadeSamples;
    const numChannels = Math.max(buffer1.numberOfChannels, buffer2.numberOfChannels);

    const outputBuffer = audioContext.createBuffer(numChannels, totalLength, sampleRate);

    for (let ch = 0; ch < numChannels; ch++) {
        const output = outputBuffer.getChannelData(ch);
        const input1 = buffer1.getChannelData(Math.min(ch, buffer1.numberOfChannels - 1));
        const input2 = buffer2.getChannelData(Math.min(ch, buffer2.numberOfChannels - 1));

        // Copy first part of buffer1 (before crossfade)
        const crossfadeStart1 = buffer1.length - crossfadeSamples;
        for (let i = 0; i < crossfadeStart1; i++) {
            output[i] = input1[i];
        }

        // Crossfade region
        for (let i = 0; i < crossfadeSamples; i++) {
            const t = i / crossfadeSamples;
            const gains = getCrossfadeGain(t, curve);

            const sample1 = input1[crossfadeStart1 + i];
            const sample2 = input2[i];

            output[crossfadeStart1 + i] = sample1 * gains.fadeOut + sample2 * gains.fadeIn;
        }

        // Copy rest of buffer2 (after crossfade)
        for (let i = crossfadeSamples; i < buffer2.length; i++) {
            output[crossfadeStart1 + i] = input2[i];
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
    if (!buffer1 || !buffer2) return;

    await audioContext.resume();
    isPlaying = true;
    document.getElementById('previewBtn').textContent = texts[currentLang].stop;

    const crossfadedBuffer = createCrossfade();

    sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = crossfadedBuffer;
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

async function downloadCrossfaded() {
    if (!buffer1 || !buffer2) return;

    const crossfadedBuffer = createCrossfade();
    const wavBlob = bufferToWav(crossfadedBuffer);

    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'crossfaded-audio.wav';
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
