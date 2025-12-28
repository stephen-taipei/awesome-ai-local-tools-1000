/**
 * Audio Stereo Widener - Tool #270
 * Widen or narrow stereo image of audio
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let sourceNode = null;
let isPlaying = false;
let fileName = '';

const texts = {
    zh: {
        title: '音訊立體聲擴展',
        subtitle: '擴展或縮窄立體聲音場',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '點擊或拖放音訊檔案',
        uploadHint: '支援 MP3, WAV, OGG 等格式',
        width: '寬度',
        center: '中央增益',
        side: '側邊增益',
        preview: '▶️ 預覽',
        stop: '⏹️ 停止',
        download: '⬇️ 下載',
        mono: '單聲道',
        original: '原始',
        wide: '寬闊',
        extraWide: '超寬'
    },
    en: {
        title: 'Audio Stereo Widener',
        subtitle: 'Widen or narrow stereo image',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Click or drop audio file',
        uploadHint: 'Supports MP3, WAV, OGG formats',
        width: 'Width',
        center: 'Center Gain',
        side: 'Side Gain',
        preview: '▶️ Preview',
        stop: '⏹️ Stop',
        download: '⬇️ Download',
        mono: 'Mono',
        original: 'Original',
        wide: 'Wide',
        extraWide: 'Extra Wide'
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

    document.getElementById('widthSlider').addEventListener('input', (e) => {
        document.getElementById('widthValue').textContent = e.target.value + '%';
        updatePresetButtons();
    });

    document.getElementById('centerSlider').addEventListener('input', (e) => {
        document.getElementById('centerValue').textContent = e.target.value + '%';
        updatePresetButtons();
    });

    document.getElementById('sideSlider').addEventListener('input', (e) => {
        document.getElementById('sideValue').textContent = e.target.value + '%';
        updatePresetButtons();
    });

    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const width = parseInt(btn.dataset.width);
            const center = parseInt(btn.dataset.center);
            const side = parseInt(btn.dataset.side);

            document.getElementById('widthSlider').value = width;
            document.getElementById('centerSlider').value = center;
            document.getElementById('sideSlider').value = side;

            document.getElementById('widthValue').textContent = width + '%';
            document.getElementById('centerValue').textContent = center + '%';
            document.getElementById('sideValue').textContent = side + '%';

            updatePresetButtons();
        });
    });

    document.getElementById('previewBtn').addEventListener('click', togglePreview);
    document.getElementById('downloadBtn').addEventListener('click', downloadWidened);
}

function updatePresetButtons() {
    const width = parseInt(document.getElementById('widthSlider').value);
    const center = parseInt(document.getElementById('centerSlider').value);
    const side = parseInt(document.getElementById('sideSlider').value);

    document.querySelectorAll('.preset-btn').forEach(btn => {
        const btnWidth = parseInt(btn.dataset.width);
        const btnCenter = parseInt(btn.dataset.center);
        const btnSide = parseInt(btn.dataset.side);
        btn.classList.toggle('active', btnWidth === width && btnCenter === center && btnSide === side);
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

    document.querySelectorAll('.option-group label')[0].textContent = t.width;
    document.querySelectorAll('.option-group label')[1].textContent = t.center;
    document.querySelectorAll('.option-group label')[2].textContent = t.side;

    const presetBtns = document.querySelectorAll('.preset-btn');
    presetBtns[0].textContent = t.mono;
    presetBtns[1].textContent = t.original;
    presetBtns[2].textContent = t.wide;
    presetBtns[3].textContent = t.extraWide;

    document.getElementById('previewBtn').textContent = isPlaying ? t.stop : t.preview;
    document.getElementById('downloadBtn').textContent = t.download;
}

async function handleFile(file) {
    fileName = file.name.replace(/\.[^/.]+$/, '');

    const arrayBuffer = await file.arrayBuffer();
    originalBuffer = await audioContext.decodeAudioData(arrayBuffer);

    document.getElementById('editorSection').style.display = 'block';
}

function applyStereoWidth(buffer) {
    const width = parseInt(document.getElementById('widthSlider').value) / 100;
    const centerGain = parseInt(document.getElementById('centerSlider').value) / 100;
    const sideGain = parseInt(document.getElementById('sideSlider').value) / 100;

    const sampleRate = buffer.sampleRate;

    // Always output stereo
    const outputBuffer = audioContext.createBuffer(2, buffer.length, sampleRate);

    // Get left and right channels (or duplicate mono)
    const leftInput = buffer.getChannelData(0);
    const rightInput = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : buffer.getChannelData(0);

    const leftOutput = outputBuffer.getChannelData(0);
    const rightOutput = outputBuffer.getChannelData(1);

    for (let i = 0; i < buffer.length; i++) {
        // Mid-Side processing
        // M = (L + R) / 2 (center/mono content)
        // S = (L - R) / 2 (stereo difference)
        const mid = (leftInput[i] + rightInput[i]) / 2;
        const side = (leftInput[i] - rightInput[i]) / 2;

        // Apply gains
        const processedMid = mid * centerGain;
        const processedSide = side * sideGain * width;

        // Convert back to L/R
        // L = M + S
        // R = M - S
        leftOutput[i] = processedMid + processedSide;
        rightOutput[i] = processedMid - processedSide;
    }

    // Normalize if needed
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

    const widenedBuffer = applyStereoWidth(originalBuffer);

    sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = widenedBuffer;
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

async function downloadWidened() {
    if (!originalBuffer) return;

    const widenedBuffer = applyStereoWidth(originalBuffer);
    const wavBlob = bufferToWav(widenedBuffer);

    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}-widened.wav`;
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
