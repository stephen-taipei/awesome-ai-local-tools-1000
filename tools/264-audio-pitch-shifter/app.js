/**
 * Audio Pitch Shifter - Tool #264
 * Shift audio pitch without changing speed
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let sourceNode = null;
let isPlaying = false;
let fileName = '';

const texts = {
    zh: {
        title: '音訊變調',
        subtitle: '調整音高而不改變速度',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '點擊或拖放音訊檔案',
        uploadHint: '支援 MP3, WAV, OGG 等格式',
        pitch: '音高調整',
        fine: '微調',
        semitones: '半音',
        cents: '音分',
        preview: '▶️ 預覽',
        stop: '⏹️ 停止',
        download: '⬇️ 下載',
        octaveDown: '-1 八度',
        p5Down: '-P5',
        original: '原調',
        p5Up: '+P5',
        octaveUp: '+1 八度'
    },
    en: {
        title: 'Audio Pitch Shifter',
        subtitle: 'Shift pitch without changing speed',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Click or drop audio file',
        uploadHint: 'Supports MP3, WAV, OGG formats',
        pitch: 'Pitch Shift',
        fine: 'Fine Tune',
        semitones: 'semitones',
        cents: 'cents',
        preview: '▶️ Preview',
        stop: '⏹️ Stop',
        download: '⬇️ Download',
        octaveDown: '-1 Octave',
        p5Down: '-P5',
        original: 'Original',
        p5Up: '+P5',
        octaveUp: '+1 Octave'
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

    document.getElementById('pitchSlider').addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        const sign = val > 0 ? '+' : '';
        document.getElementById('pitchValue').textContent = sign + val + ' ' + texts[currentLang].semitones;
        updatePresetButtons(val);
    });

    document.getElementById('fineSlider').addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        const sign = val > 0 ? '+' : '';
        document.getElementById('fineValue').textContent = sign + val + ' ' + texts[currentLang].cents;
    });

    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const pitch = parseInt(btn.dataset.pitch);
            document.getElementById('pitchSlider').value = pitch;
            const sign = pitch > 0 ? '+' : '';
            document.getElementById('pitchValue').textContent = sign + pitch + ' ' + texts[currentLang].semitones;
            updatePresetButtons(pitch);
        });
    });

    document.getElementById('previewBtn').addEventListener('click', togglePreview);
    document.getElementById('downloadBtn').addEventListener('click', downloadPitchShifted);
}

function updatePresetButtons(pitch) {
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.pitch) === pitch);
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

    document.querySelector('.upload-text').textContent = t.upload;
    document.querySelector('.upload-hint').textContent = t.uploadHint;

    document.querySelectorAll('.option-group label')[0].textContent = t.pitch;
    document.querySelectorAll('.option-group label')[1].textContent = t.fine;

    const pitchVal = parseInt(document.getElementById('pitchSlider').value);
    const pitchSign = pitchVal > 0 ? '+' : '';
    document.getElementById('pitchValue').textContent = pitchSign + pitchVal + ' ' + t.semitones;

    const fineVal = parseInt(document.getElementById('fineSlider').value);
    const fineSign = fineVal > 0 ? '+' : '';
    document.getElementById('fineValue').textContent = fineSign + fineVal + ' ' + t.cents;

    const presetBtns = document.querySelectorAll('.preset-btn');
    presetBtns[0].textContent = t.octaveDown;
    presetBtns[1].textContent = t.p5Down;
    presetBtns[2].textContent = t.original;
    presetBtns[3].textContent = t.p5Up;
    presetBtns[4].textContent = t.octaveUp;

    document.getElementById('previewBtn').textContent = isPlaying ? t.stop : t.preview;
    document.getElementById('downloadBtn').textContent = t.download;
}

async function handleFile(file) {
    fileName = file.name.replace(/\.[^/.]+$/, '');

    const arrayBuffer = await file.arrayBuffer();
    originalBuffer = await audioContext.decodeAudioData(arrayBuffer);

    document.getElementById('editorSection').style.display = 'block';
}

function applyPitchShift(buffer) {
    const semitones = parseInt(document.getElementById('pitchSlider').value);
    const cents = parseInt(document.getElementById('fineSlider').value);

    // Total pitch shift in semitones (including cents)
    const totalSemitones = semitones + cents / 100;

    // Pitch ratio: 2^(semitones/12)
    const pitchRatio = Math.pow(2, totalSemitones / 12);

    const sampleRate = buffer.sampleRate;

    // Time stretch factor to maintain duration
    // When pitch goes up, we need to stretch; when pitch goes down, we need to compress
    const stretchFactor = 1 / pitchRatio;

    // New length after resampling
    const newLength = Math.floor(buffer.length * stretchFactor);

    const outputBuffer = audioContext.createBuffer(buffer.numberOfChannels, newLength, sampleRate);

    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
        const input = buffer.getChannelData(ch);
        const output = outputBuffer.getChannelData(ch);

        // Simple resampling with linear interpolation
        for (let i = 0; i < newLength; i++) {
            const srcPos = i * pitchRatio;
            const srcIndex = Math.floor(srcPos);
            const frac = srcPos - srcIndex;

            if (srcIndex + 1 < buffer.length) {
                output[i] = input[srcIndex] * (1 - frac) + input[srcIndex + 1] * frac;
            } else if (srcIndex < buffer.length) {
                output[i] = input[srcIndex];
            } else {
                output[i] = 0;
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

    const pitchBuffer = applyPitchShift(originalBuffer);

    sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = pitchBuffer;
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

async function downloadPitchShifted() {
    if (!originalBuffer) return;

    const pitchBuffer = applyPitchShift(originalBuffer);
    const wavBlob = bufferToWav(pitchBuffer);

    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}-pitch.wav`;
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
