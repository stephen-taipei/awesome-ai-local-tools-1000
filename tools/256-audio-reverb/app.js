/**
 * Audio Reverb - Tool #256
 * Add reverb effect to audio
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let sourceNode = null;
let isPlaying = false;
let fileName = '';

const presets = {
    room: { decay: 1.0, wet: 25, predelay: 10 },
    hall: { decay: 2.5, wet: 35, predelay: 30 },
    church: { decay: 4.0, wet: 45, predelay: 50 },
    cave: { decay: 3.5, wet: 55, predelay: 80 }
};

const texts = {
    zh: {
        title: '音訊殘響',
        subtitle: '為音訊添加空間殘響效果',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '點擊或拖放音訊檔案',
        uploadHint: '支援 MP3, WAV, OGG 等格式',
        spacePresets: '空間預設',
        room: '小房間',
        hall: '音樂廳',
        church: '教堂',
        cave: '洞穴',
        decayTime: '殘響時間',
        wetDry: '乾/濕比例',
        predelay: '預延遲',
        seconds: '秒',
        preview: '▶️ 預覽',
        stop: '⏹️ 停止',
        download: '⬇️ 下載'
    },
    en: {
        title: 'Audio Reverb',
        subtitle: 'Add spatial reverb effect to audio',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Click or drop audio file',
        uploadHint: 'Supports MP3, WAV, OGG formats',
        spacePresets: 'Space Presets',
        room: 'Small Room',
        hall: 'Concert Hall',
        church: 'Church',
        cave: 'Cave',
        decayTime: 'Decay Time',
        wetDry: 'Wet/Dry Mix',
        predelay: 'Pre-delay',
        seconds: 'sec',
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

    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const preset = presets[btn.dataset.preset];
            if (preset) {
                applyPreset(preset);
                document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            }
        });
    });

    document.getElementById('decaySlider').addEventListener('input', (e) => {
        document.getElementById('decayValue').textContent = e.target.value + ' ' + texts[currentLang].seconds;
    });

    document.getElementById('wetSlider').addEventListener('input', (e) => {
        document.getElementById('wetValue').textContent = e.target.value + '%';
    });

    document.getElementById('predelaySlider').addEventListener('input', (e) => {
        document.getElementById('predelayValue').textContent = e.target.value + ' ms';
    });

    document.getElementById('previewBtn').addEventListener('click', togglePreview);
    document.getElementById('downloadBtn').addEventListener('click', downloadReverb);
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

    document.querySelector('.presets-section > label').textContent = t.spacePresets;
    const presetBtns = document.querySelectorAll('.preset-btn');
    presetBtns[0].textContent = t.room;
    presetBtns[1].textContent = t.hall;
    presetBtns[2].textContent = t.church;
    presetBtns[3].textContent = t.cave;

    document.querySelectorAll('.option-group label')[0].textContent = t.decayTime;
    document.querySelectorAll('.option-group label')[1].textContent = t.wetDry;
    document.querySelectorAll('.option-group label')[2].textContent = t.predelay;

    document.getElementById('decayValue').textContent = document.getElementById('decaySlider').value + ' ' + t.seconds;

    document.getElementById('previewBtn').textContent = isPlaying ? t.stop : t.preview;
    document.getElementById('downloadBtn').textContent = t.download;
}

function applyPreset(preset) {
    document.getElementById('decaySlider').value = preset.decay;
    document.getElementById('decayValue').textContent = preset.decay + ' ' + texts[currentLang].seconds;
    document.getElementById('wetSlider').value = preset.wet;
    document.getElementById('wetValue').textContent = preset.wet + '%';
    document.getElementById('predelaySlider').value = preset.predelay;
    document.getElementById('predelayValue').textContent = preset.predelay + ' ms';
}

async function handleFile(file) {
    fileName = file.name.replace(/\.[^/.]+$/, '');

    const arrayBuffer = await file.arrayBuffer();
    originalBuffer = await audioContext.decodeAudioData(arrayBuffer);

    document.getElementById('editorSection').style.display = 'block';
}

function createImpulseResponse(duration, decay, sampleRate) {
    const length = Math.floor(sampleRate * duration);
    const impulse = audioContext.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
        const data = impulse.getChannelData(channel);
        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            data[i] = (Math.random() * 2 - 1) * Math.exp(-t / decay);
        }
    }

    return impulse;
}

async function applyReverb(buffer) {
    const decay = parseFloat(document.getElementById('decaySlider').value);
    const wet = parseInt(document.getElementById('wetSlider').value) / 100;
    const predelayMs = parseInt(document.getElementById('predelaySlider').value);

    const sampleRate = buffer.sampleRate;
    const predelaySamples = Math.floor((predelayMs / 1000) * sampleRate);
    const reverbLength = Math.floor(decay * 2 * sampleRate);
    const totalLength = buffer.length + predelaySamples + reverbLength;

    const outputBuffer = audioContext.createBuffer(buffer.numberOfChannels, totalLength, sampleRate);
    const impulse = createImpulseResponse(decay * 2, decay, sampleRate);

    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
        const input = buffer.getChannelData(ch);
        const output = outputBuffer.getChannelData(ch);
        const impulseData = impulse.getChannelData(ch % 2);

        // Copy dry signal
        for (let i = 0; i < input.length; i++) {
            output[i] = input[i] * (1 - wet);
        }

        // Simple convolution for reverb (wet signal with predelay)
        for (let i = 0; i < input.length; i++) {
            for (let j = 0; j < Math.min(impulseData.length, 2000); j += 10) {
                const outIdx = i + predelaySamples + j;
                if (outIdx < totalLength) {
                    output[outIdx] += input[i] * impulseData[j] * wet * 0.5;
                }
            }
        }

        // Normalize
        let max = 0;
        for (let i = 0; i < totalLength; i++) {
            max = Math.max(max, Math.abs(output[i]));
        }
        if (max > 1) {
            for (let i = 0; i < totalLength; i++) {
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

    const reverbBuffer = await applyReverb(originalBuffer);

    sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = reverbBuffer;
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

async function downloadReverb() {
    if (!originalBuffer) return;

    const reverbBuffer = await applyReverb(originalBuffer);
    const wavBlob = bufferToWav(reverbBuffer);

    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}-reverb.wav`;
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
