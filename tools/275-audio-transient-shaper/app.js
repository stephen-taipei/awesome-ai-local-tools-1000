/**
 * Audio Transient Shaper - Tool #275
 * Shape attack and sustain of audio
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let sourceNode = null;
let isPlaying = false;
let fileName = '';

const texts = {
    zh: {
        title: '音訊瞬態塑形',
        subtitle: '調整音訊的起音和持續音',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '點擊或拖放音訊檔案',
        uploadHint: '支援 MP3, WAV, OGG 等格式',
        attack: '起音強度',
        sustain: '持續音',
        sensitivity: '敏感度',
        preview: '▶️ 預覽',
        stop: '⏹️ 停止',
        download: '⬇️ 下載',
        drums: '鼓機強化',
        original: '原始',
        soft: '柔和',
        punch: '衝擊'
    },
    en: {
        title: 'Audio Transient Shaper',
        subtitle: 'Shape attack and sustain of audio',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Click or drop audio file',
        uploadHint: 'Supports MP3, WAV, OGG formats',
        attack: 'Attack',
        sustain: 'Sustain',
        sensitivity: 'Sensitivity',
        preview: '▶️ Preview',
        stop: '⏹️ Stop',
        download: '⬇️ Download',
        drums: 'Drums',
        original: 'Original',
        soft: 'Soft',
        punch: 'Punch'
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

    document.getElementById('attackSlider').addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        const sign = val > 0 ? '+' : '';
        document.getElementById('attackValue').textContent = sign + val + '%';
        updatePresetButtons();
    });

    document.getElementById('sustainSlider').addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        const sign = val > 0 ? '+' : '';
        document.getElementById('sustainValue').textContent = sign + val + '%';
        updatePresetButtons();
    });

    document.getElementById('sensitivitySlider').addEventListener('input', (e) => {
        document.getElementById('sensitivityValue').textContent = e.target.value + '%';
    });

    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const attack = parseInt(btn.dataset.attack);
            const sustain = parseInt(btn.dataset.sustain);
            document.getElementById('attackSlider').value = attack;
            document.getElementById('sustainSlider').value = sustain;

            const attackSign = attack > 0 ? '+' : '';
            const sustainSign = sustain > 0 ? '+' : '';
            document.getElementById('attackValue').textContent = attackSign + attack + '%';
            document.getElementById('sustainValue').textContent = sustainSign + sustain + '%';

            updatePresetButtons();
        });
    });

    document.getElementById('previewBtn').addEventListener('click', togglePreview);
    document.getElementById('downloadBtn').addEventListener('click', downloadShaped);
}

function updatePresetButtons() {
    const attack = parseInt(document.getElementById('attackSlider').value);
    const sustain = parseInt(document.getElementById('sustainSlider').value);

    document.querySelectorAll('.preset-btn').forEach(btn => {
        const btnAttack = parseInt(btn.dataset.attack);
        const btnSustain = parseInt(btn.dataset.sustain);
        btn.classList.toggle('active', btnAttack === attack && btnSustain === sustain);
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

    document.querySelectorAll('.option-group label')[0].textContent = t.attack;
    document.querySelectorAll('.option-group label')[1].textContent = t.sustain;
    document.querySelectorAll('.option-group label')[2].textContent = t.sensitivity;

    const presetBtns = document.querySelectorAll('.preset-btn');
    presetBtns[0].textContent = t.drums;
    presetBtns[1].textContent = t.original;
    presetBtns[2].textContent = t.soft;
    presetBtns[3].textContent = t.punch;

    document.getElementById('previewBtn').textContent = isPlaying ? t.stop : t.preview;
    document.getElementById('downloadBtn').textContent = t.download;
}

async function handleFile(file) {
    fileName = file.name.replace(/\.[^/.]+$/, '');

    const arrayBuffer = await file.arrayBuffer();
    originalBuffer = await audioContext.decodeAudioData(arrayBuffer);

    document.getElementById('editorSection').style.display = 'block';
}

function applyTransientShaper(buffer) {
    const attackAmount = parseInt(document.getElementById('attackSlider').value) / 100;
    const sustainAmount = parseInt(document.getElementById('sustainSlider').value) / 100;
    const sensitivity = parseInt(document.getElementById('sensitivitySlider').value) / 100;

    const sampleRate = buffer.sampleRate;
    const outputBuffer = audioContext.createBuffer(buffer.numberOfChannels, buffer.length, sampleRate);

    // Time constants
    const fastAttackMs = 0.5;
    const slowAttackMs = 20;
    const fastAttack = Math.exp(-1 / (fastAttackMs * sampleRate / 1000));
    const slowAttack = Math.exp(-1 / (slowAttackMs * sampleRate / 1000));

    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
        const input = buffer.getChannelData(ch);
        const output = outputBuffer.getChannelData(ch);

        let fastEnv = 0;
        let slowEnv = 0;

        for (let i = 0; i < buffer.length; i++) {
            const absInput = Math.abs(input[i]);

            // Two envelope followers with different time constants
            if (absInput > fastEnv) {
                fastEnv = absInput;
            } else {
                fastEnv = fastEnv * fastAttack;
            }

            if (absInput > slowEnv) {
                slowEnv = slowEnv * slowAttack + absInput * (1 - slowAttack);
            } else {
                slowEnv = slowEnv * 0.9999;
            }

            // Transient detection: difference between fast and slow envelope
            const transient = Math.max(0, fastEnv - slowEnv * sensitivity);

            // Calculate gain multiplier
            let gain = 1;

            // Attack shaping: boost or cut transients
            if (transient > 0.01) {
                gain += transient * attackAmount * 2;
            }

            // Sustain shaping: affect the sustain portion
            const sustainFactor = Math.max(0, 1 - transient * 10);
            if (sustainFactor > 0.5) {
                gain += sustainAmount * sustainFactor * 0.5;
            }

            // Apply gain
            output[i] = input[i] * Math.max(0.1, gain);
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

    const shapedBuffer = applyTransientShaper(originalBuffer);

    sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = shapedBuffer;
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

async function downloadShaped() {
    if (!originalBuffer) return;

    const shapedBuffer = applyTransientShaper(originalBuffer);
    const wavBlob = bufferToWav(shapedBuffer);

    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}-transient.wav`;
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
