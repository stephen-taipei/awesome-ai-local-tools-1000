/**
 * Audio Stereo to Mono - Tool #281
 * Convert stereo audio to mono
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let sourceNode = null;
let isPlaying = false;
let fileName = '';

const texts = {
    zh: {
        title: '立體聲轉單聲道',
        subtitle: '將立體聲音訊轉換為單聲道',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '點擊或拖放音訊檔案',
        uploadHint: '支援 MP3, WAV, OGG 等格式',
        mode: '混合模式',
        gain: '輸出增益',
        info: '立體聲轉單聲道可用於節省空間、兼容單聲道系統或創建中央聲道。',
        preview: '▶️ 預覽',
        stop: '⏹️ 停止',
        download: '⬇️ 下載',
        average: '平均混合',
        left: '僅左聲道',
        right: '僅右聲道',
        max: '最大值'
    },
    en: {
        title: 'Stereo to Mono',
        subtitle: 'Convert stereo audio to mono',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Click or drop audio file',
        uploadHint: 'Supports MP3, WAV, OGG formats',
        mode: 'Mix Mode',
        gain: 'Output Gain',
        info: 'Stereo to mono can save space, ensure compatibility with mono systems, or create a center channel.',
        preview: '▶️ Preview',
        stop: '⏹️ Stop',
        download: '⬇️ Download',
        average: 'Average',
        left: 'Left Only',
        right: 'Right Only',
        max: 'Maximum'
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

    document.getElementById('gainSlider').addEventListener('input', (e) => {
        document.getElementById('gainValue').textContent = e.target.value + ' dB';
    });

    document.getElementById('previewBtn').addEventListener('click', togglePreview);
    document.getElementById('downloadBtn').addEventListener('click', downloadMono);
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

    document.querySelectorAll('.option-group label')[0].textContent = t.mode;
    document.querySelectorAll('.option-group label')[1].textContent = t.gain;
    document.querySelector('.info-box p').textContent = t.info;

    const select = document.getElementById('modeSelect');
    select.options[0].textContent = t.average;
    select.options[1].textContent = t.left;
    select.options[2].textContent = t.right;
    select.options[3].textContent = t.max;

    document.getElementById('previewBtn').textContent = isPlaying ? t.stop : t.preview;
    document.getElementById('downloadBtn').textContent = t.download;
}

async function handleFile(file) {
    fileName = file.name.replace(/\.[^/.]+$/, '');

    const arrayBuffer = await file.arrayBuffer();
    originalBuffer = await audioContext.decodeAudioData(arrayBuffer);

    document.getElementById('editorSection').style.display = 'block';
}

function convertToMono(buffer) {
    const mode = document.getElementById('modeSelect').value;
    const gainDb = parseFloat(document.getElementById('gainSlider').value);
    const gain = Math.pow(10, gainDb / 20);

    const sampleRate = buffer.sampleRate;
    const outputBuffer = audioContext.createBuffer(1, buffer.length, sampleRate);
    const output = outputBuffer.getChannelData(0);

    if (buffer.numberOfChannels === 1) {
        const input = buffer.getChannelData(0);
        for (let i = 0; i < buffer.length; i++) {
            output[i] = input[i] * gain;
        }
    } else {
        const left = buffer.getChannelData(0);
        const right = buffer.getChannelData(1);

        for (let i = 0; i < buffer.length; i++) {
            let sample;
            switch (mode) {
                case 'left':
                    sample = left[i];
                    break;
                case 'right':
                    sample = right[i];
                    break;
                case 'max':
                    sample = Math.abs(left[i]) > Math.abs(right[i]) ? left[i] : right[i];
                    break;
                case 'average':
                default:
                    sample = (left[i] + right[i]) * 0.5;
                    break;
            }
            output[i] = sample * gain;
        }
    }

    // Normalize if needed
    let max = 0;
    for (let i = 0; i < buffer.length; i++) {
        max = Math.max(max, Math.abs(output[i]));
    }
    if (max > 1) {
        for (let i = 0; i < buffer.length; i++) {
            output[i] /= max;
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

    const monoBuffer = convertToMono(originalBuffer);

    sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = monoBuffer;
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

async function downloadMono() {
    if (!originalBuffer) return;

    const monoBuffer = convertToMono(originalBuffer);
    const wavBlob = bufferToWav(monoBuffer);

    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}-mono.wav`;
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
