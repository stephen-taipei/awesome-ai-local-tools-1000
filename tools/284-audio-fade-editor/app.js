/**
 * Audio Fade Editor - Tool #284
 * Add fade in and fade out effects to audio
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let sourceNode = null;
let isPlaying = false;
let fileName = '';

const texts = {
    zh: {
        title: '音訊淡入淡出',
        subtitle: '為音訊添加淡入淡出效果',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '點擊或拖放音訊檔案',
        uploadHint: '支援 MP3, WAV, OGG 等格式',
        fadeIn: '淡入時間',
        fadeInCurve: '淡入曲線',
        fadeOut: '淡出時間',
        fadeOutCurve: '淡出曲線',
        preview: '▶️ 預覽',
        stop: '⏹️ 停止',
        download: '⬇️ 下載',
        linear: '線性',
        exponential: '指數',
        logarithmic: '對數',
        scurve: 'S曲線',
        seconds: '秒'
    },
    en: {
        title: 'Audio Fade Editor',
        subtitle: 'Add fade in and fade out effects',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Click or drop audio file',
        uploadHint: 'Supports MP3, WAV, OGG formats',
        fadeIn: 'Fade In',
        fadeInCurve: 'Fade In Curve',
        fadeOut: 'Fade Out',
        fadeOutCurve: 'Fade Out Curve',
        preview: '▶️ Preview',
        stop: '⏹️ Stop',
        download: '⬇️ Download',
        linear: 'Linear',
        exponential: 'Exponential',
        logarithmic: 'Logarithmic',
        scurve: 'S-Curve',
        seconds: 's'
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

    document.getElementById('fadeInSlider').addEventListener('input', (e) => {
        const unit = currentLang === 'zh' ? '秒' : 's';
        document.getElementById('fadeInValue').textContent = parseFloat(e.target.value).toFixed(1) + ' ' + unit;
    });

    document.getElementById('fadeOutSlider').addEventListener('input', (e) => {
        const unit = currentLang === 'zh' ? '秒' : 's';
        document.getElementById('fadeOutValue').textContent = parseFloat(e.target.value).toFixed(1) + ' ' + unit;
    });

    document.getElementById('previewBtn').addEventListener('click', togglePreview);
    document.getElementById('downloadBtn').addEventListener('click', downloadFaded);
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

    const labels = document.querySelectorAll('.option-group label');
    labels[0].textContent = t.fadeIn;
    labels[1].textContent = t.fadeInCurve;
    labels[2].textContent = t.fadeOut;
    labels[3].textContent = t.fadeOutCurve;

    const curveOptions = [t.linear, t.exponential, t.logarithmic, t.scurve];
    document.getElementById('fadeInCurve').querySelectorAll('option').forEach((opt, i) => {
        opt.textContent = curveOptions[i];
    });
    document.getElementById('fadeOutCurve').querySelectorAll('option').forEach((opt, i) => {
        opt.textContent = curveOptions[i];
    });

    const unit = lang === 'zh' ? '秒' : 's';
    document.getElementById('fadeInValue').textContent = parseFloat(document.getElementById('fadeInSlider').value).toFixed(1) + ' ' + unit;
    document.getElementById('fadeOutValue').textContent = parseFloat(document.getElementById('fadeOutSlider').value).toFixed(1) + ' ' + unit;

    document.getElementById('previewBtn').textContent = isPlaying ? t.stop : t.preview;
    document.getElementById('downloadBtn').textContent = t.download;
}

async function handleFile(file) {
    fileName = file.name.replace(/\.[^/.]+$/, '');

    const arrayBuffer = await file.arrayBuffer();
    originalBuffer = await audioContext.decodeAudioData(arrayBuffer);

    document.getElementById('editorSection').style.display = 'block';
}

function getCurveValue(t, curve) {
    switch (curve) {
        case 'linear':
            return t;
        case 'exponential':
            return t * t;
        case 'logarithmic':
            return Math.sqrt(t);
        case 'scurve':
            return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        default:
            return t;
    }
}

function applyFades(buffer) {
    const fadeInTime = parseFloat(document.getElementById('fadeInSlider').value);
    const fadeOutTime = parseFloat(document.getElementById('fadeOutSlider').value);
    const fadeInCurve = document.getElementById('fadeInCurve').value;
    const fadeOutCurve = document.getElementById('fadeOutCurve').value;

    const sampleRate = buffer.sampleRate;
    const fadeInSamples = Math.floor(fadeInTime * sampleRate);
    const fadeOutSamples = Math.floor(fadeOutTime * sampleRate);

    const outputBuffer = audioContext.createBuffer(
        buffer.numberOfChannels,
        buffer.length,
        sampleRate
    );

    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
        const input = buffer.getChannelData(ch);
        const output = outputBuffer.getChannelData(ch);

        for (let i = 0; i < buffer.length; i++) {
            let gain = 1;

            // Fade in
            if (i < fadeInSamples && fadeInSamples > 0) {
                const t = i / fadeInSamples;
                gain *= getCurveValue(t, fadeInCurve);
            }

            // Fade out
            const fadeOutStart = buffer.length - fadeOutSamples;
            if (i >= fadeOutStart && fadeOutSamples > 0) {
                const t = (buffer.length - i) / fadeOutSamples;
                gain *= getCurveValue(t, fadeOutCurve);
            }

            output[i] = input[i] * gain;
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

    const fadedBuffer = applyFades(originalBuffer);

    sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = fadedBuffer;
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

async function downloadFaded() {
    if (!originalBuffer) return;

    const fadedBuffer = applyFades(originalBuffer);
    const wavBlob = bufferToWav(fadedBuffer);

    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}-faded.wav`;
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
