/**
 * Audio Loop Maker - Tool #292
 * Create seamless audio loops
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let sourceNode = null;
let isPlaying = false;
let fileName = '';

const texts = {
    zh: {
        title: '音訊循環製作',
        subtitle: '創建無縫循環音訊',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '點擊或拖放音訊檔案',
        uploadHint: '支援 MP3, WAV, OGG 等格式',
        loops: '循環次數',
        crossfade: '交叉淡化',
        curve: '淡化曲線',
        preview: '▶️ 預覽',
        stop: '⏹️ 停止',
        download: '⬇️ 下載',
        linear: '線性',
        equalPower: '等功率',
        exponential: '指數',
        times: '次'
    },
    en: {
        title: 'Audio Loop Maker',
        subtitle: 'Create seamless audio loops',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Click or drop audio file',
        uploadHint: 'Supports MP3, WAV, OGG formats',
        loops: 'Loop Count',
        crossfade: 'Crossfade',
        curve: 'Curve',
        preview: '▶️ Preview',
        stop: '⏹️ Stop',
        download: '⬇️ Download',
        linear: 'Linear',
        equalPower: 'Equal Power',
        exponential: 'Exponential',
        times: 'times'
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

    document.getElementById('loopSlider').addEventListener('input', (e) => {
        const unit = currentLang === 'zh' ? '次' : 'times';
        document.getElementById('loopValue').textContent = e.target.value + ' ' + unit;
    });

    document.getElementById('crossfadeSlider').addEventListener('input', (e) => {
        document.getElementById('crossfadeValue').textContent = e.target.value + ' ms';
    });

    document.getElementById('previewBtn').addEventListener('click', togglePreview);
    document.getElementById('downloadBtn').addEventListener('click', downloadLoop);
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
    labels[0].textContent = t.loops;
    labels[1].textContent = t.crossfade;
    labels[2].textContent = t.curve;

    const curveSelect = document.getElementById('curveSelect');
    curveSelect.options[0].textContent = t.linear;
    curveSelect.options[1].textContent = t.equalPower;
    curveSelect.options[2].textContent = t.exponential;

    const unit = lang === 'zh' ? '次' : 'times';
    document.getElementById('loopValue').textContent = document.getElementById('loopSlider').value + ' ' + unit;

    document.getElementById('previewBtn').textContent = isPlaying ? t.stop : t.preview;
    document.getElementById('downloadBtn').textContent = t.download;
}

async function handleFile(file) {
    fileName = file.name.replace(/\.[^/.]+$/, '');

    const arrayBuffer = await file.arrayBuffer();
    originalBuffer = await audioContext.decodeAudioData(arrayBuffer);

    document.getElementById('editorSection').style.display = 'block';
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

function createLoop(buffer) {
    const loopCount = parseInt(document.getElementById('loopSlider').value);
    const crossfadeMs = parseInt(document.getElementById('crossfadeSlider').value);
    const curve = document.getElementById('curveSelect').value;

    const sampleRate = buffer.sampleRate;
    const crossfadeSamples = Math.min(
        Math.floor(crossfadeMs * sampleRate / 1000),
        Math.floor(buffer.length / 2)
    );

    // Total length: original * loops - crossfade * (loops - 1)
    const totalLength = buffer.length * loopCount - crossfadeSamples * (loopCount - 1);

    const outputBuffer = audioContext.createBuffer(
        buffer.numberOfChannels,
        totalLength,
        sampleRate
    );

    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
        const input = buffer.getChannelData(ch);
        const output = outputBuffer.getChannelData(ch);

        let writePos = 0;

        for (let loop = 0; loop < loopCount; loop++) {
            const isFirst = loop === 0;
            const isLast = loop === loopCount - 1;

            for (let i = 0; i < buffer.length; i++) {
                let sample = input[i];

                // Fade in at start (except first loop)
                if (!isFirst && i < crossfadeSamples) {
                    const t = i / crossfadeSamples;
                    const gains = getCrossfadeGain(t, curve);
                    sample *= gains.fadeIn;
                }

                // Fade out at end (except last loop)
                if (!isLast && i >= buffer.length - crossfadeSamples) {
                    const t = (buffer.length - i) / crossfadeSamples;
                    const gains = getCrossfadeGain(t, curve);
                    sample *= gains.fadeOut;
                }

                // Add or set sample
                if (!isFirst && i < crossfadeSamples) {
                    output[writePos + i] += sample;
                } else {
                    const pos = writePos + i;
                    if (pos < totalLength) {
                        output[pos] = sample;
                    }
                }
            }

            writePos += buffer.length - crossfadeSamples;
        }
    }

    // Normalize
    let max = 0;
    for (let ch = 0; ch < outputBuffer.numberOfChannels; ch++) {
        const data = outputBuffer.getChannelData(ch);
        for (let i = 0; i < data.length; i++) {
            max = Math.max(max, Math.abs(data[i]));
        }
    }
    if (max > 1) {
        for (let ch = 0; ch < outputBuffer.numberOfChannels; ch++) {
            const data = outputBuffer.getChannelData(ch);
            for (let i = 0; i < data.length; i++) {
                data[i] /= max;
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

    const loopBuffer = createLoop(originalBuffer);

    sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = loopBuffer;
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

async function downloadLoop() {
    if (!originalBuffer) return;

    const loopBuffer = createLoop(originalBuffer);
    const wavBlob = bufferToWav(loopBuffer);

    const loopCount = document.getElementById('loopSlider').value;
    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}-loop${loopCount}x.wav`;
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
