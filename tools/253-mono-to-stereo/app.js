/**
 * Mono to Stereo - Tool #253
 * Convert mono audio to stereo with effects
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let stereoBuffer = null;
let sourceNode = null;
let isPlaying = false;
let fileName = '';

const texts = {
    zh: {
        title: '單聲道轉立體聲',
        subtitle: '為單聲道音訊創建立體聲效果',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '點擊或拖放單聲道音訊',
        uploadHint: '支援 MP3, WAV, OGG 等格式',
        monoChannel: '單聲道',
        leftChannel: '左聲道',
        rightChannel: '右聲道',
        stereoMode: '立體聲效果',
        duplicate: '複製 (雙聲道相同)',
        delay: '延遲 (Haas 效果)',
        pitch: '音高偏移',
        pan: '自動平移',
        delayAmount: '延遲量',
        stereoWidth: '立體聲寬度',
        duration: '時長',
        preview: '▶️ 預覽',
        stop: '⏹️ 停止',
        download: '⬇️ 下載立體聲'
    },
    en: {
        title: 'Mono to Stereo',
        subtitle: 'Create stereo effect from mono audio',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Click or drop mono audio',
        uploadHint: 'Supports MP3, WAV, OGG formats',
        monoChannel: 'Mono',
        leftChannel: 'Left Channel',
        rightChannel: 'Right Channel',
        stereoMode: 'Stereo Effect',
        duplicate: 'Duplicate (Same)',
        delay: 'Delay (Haas Effect)',
        pitch: 'Pitch Shift',
        pan: 'Auto Pan',
        delayAmount: 'Delay Amount',
        stereoWidth: 'Stereo Width',
        duration: 'Duration',
        preview: '▶️ Preview',
        stop: '⏹️ Stop',
        download: '⬇️ Download Stereo'
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

    document.getElementById('stereoMode').addEventListener('change', (e) => {
        document.getElementById('delayOption').style.display = e.target.value === 'delay' ? 'flex' : 'none';
        if (originalBuffer) processAudio();
    });

    document.getElementById('delaySlider').addEventListener('input', (e) => {
        document.getElementById('delayValue').textContent = e.target.value + ' ms';
        if (originalBuffer) processAudio();
    });

    document.getElementById('widthSlider').addEventListener('input', (e) => {
        document.getElementById('widthValue').textContent = e.target.value + '%';
        if (originalBuffer) processAudio();
    });

    document.getElementById('previewBtn').addEventListener('click', togglePreview);
    document.getElementById('downloadBtn').addEventListener('click', downloadStereo);
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

    document.querySelectorAll('.channel-label')[0].textContent = t.monoChannel;
    document.querySelectorAll('.channel-label')[1].textContent = t.leftChannel;
    document.querySelectorAll('.channel-label')[2].textContent = t.rightChannel;

    document.querySelectorAll('.option-group label')[0].textContent = t.stereoMode;
    const modeSelect = document.getElementById('stereoMode');
    modeSelect.options[0].text = t.duplicate;
    modeSelect.options[1].text = t.delay;
    modeSelect.options[2].text = t.pitch;
    modeSelect.options[3].text = t.pan;

    document.querySelectorAll('.option-group label')[1].textContent = t.delayAmount;
    document.querySelectorAll('.option-group label')[2].textContent = t.stereoWidth;

    document.querySelector('.info-label').textContent = t.duration;

    document.getElementById('previewBtn').textContent = isPlaying ? t.stop : t.preview;
    document.getElementById('downloadBtn').textContent = t.download;
}

async function handleFile(file) {
    fileName = file.name.replace(/\.[^/.]+$/, '');

    const arrayBuffer = await file.arrayBuffer();
    originalBuffer = await audioContext.decodeAudioData(arrayBuffer);

    document.getElementById('duration').textContent = formatTime(originalBuffer.duration);

    drawWaveform(document.getElementById('monoCanvas'), originalBuffer.getChannelData(0), '#f97316');
    processAudio();
    document.getElementById('editorSection').style.display = 'block';
}

function drawWaveform(canvas, data, color) {
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = 60 * 2;
    ctx.scale(2, 2);

    const width = canvas.offsetWidth;
    const height = 60;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;

    const step = Math.ceil(data.length / width);
    for (let i = 0; i < width; i++) {
        let min = 1, max = -1;
        for (let j = 0; j < step; j++) {
            const idx = i * step + j;
            if (idx < data.length) {
                min = Math.min(min, data[idx]);
                max = Math.max(max, data[idx]);
            }
        }
        const y1 = (1 - max) * height / 2;
        const y2 = (1 - min) * height / 2;
        ctx.moveTo(i, y1);
        ctx.lineTo(i, y2);
    }
    ctx.stroke();
}

function processAudio() {
    const mode = document.getElementById('stereoMode').value;
    const width = parseInt(document.getElementById('widthSlider').value) / 100;
    const delayMs = parseInt(document.getElementById('delaySlider').value);

    stereoBuffer = convertToStereo(originalBuffer, mode, width, delayMs);

    drawWaveform(document.getElementById('leftCanvas'), stereoBuffer.getChannelData(0), '#f97316');
    drawWaveform(document.getElementById('rightCanvas'), stereoBuffer.getChannelData(1), '#fb923c');
}

function convertToStereo(buffer, mode, width, delayMs) {
    const mono = buffer.getChannelData(0);
    const stereo = audioContext.createBuffer(2, buffer.length, buffer.sampleRate);
    const left = stereo.getChannelData(0);
    const right = stereo.getChannelData(1);

    const delaySamples = Math.floor((delayMs / 1000) * buffer.sampleRate);

    switch (mode) {
        case 'duplicate':
            for (let i = 0; i < buffer.length; i++) {
                left[i] = mono[i];
                right[i] = mono[i];
            }
            break;

        case 'delay':
            // Haas effect - delay one channel
            for (let i = 0; i < buffer.length; i++) {
                left[i] = mono[i];
                const delayedIdx = i - delaySamples;
                right[i] = delayedIdx >= 0 ? mono[delayedIdx] * (1 - width * 0.3) : 0;
            }
            break;

        case 'pitch':
            // Slight pitch shift on right channel (simplified)
            for (let i = 0; i < buffer.length; i++) {
                left[i] = mono[i];
                // Simple interpolation for slight pitch shift
                const shiftedIdx = i * (1 + width * 0.01);
                const idx = Math.floor(shiftedIdx);
                const frac = shiftedIdx - idx;
                if (idx < buffer.length - 1) {
                    right[i] = mono[idx] * (1 - frac) + mono[idx + 1] * frac;
                } else {
                    right[i] = mono[Math.min(idx, buffer.length - 1)];
                }
            }
            break;

        case 'pan':
            // Auto-pan effect
            const panRate = 2; // Hz
            for (let i = 0; i < buffer.length; i++) {
                const t = i / buffer.sampleRate;
                const pan = Math.sin(2 * Math.PI * panRate * t) * width;
                left[i] = mono[i] * (0.5 + pan * 0.5);
                right[i] = mono[i] * (0.5 - pan * 0.5);
            }
            break;
    }

    return stereo;
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function togglePreview() {
    if (isPlaying) {
        stopPreview();
    } else {
        startPreview();
    }
}

function startPreview() {
    if (!stereoBuffer) return;

    audioContext.resume();
    isPlaying = true;

    sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = stereoBuffer;
    sourceNode.connect(audioContext.destination);

    sourceNode.onended = () => {
        isPlaying = false;
        document.getElementById('previewBtn').textContent = texts[currentLang].preview;
    };

    sourceNode.start(0);
    document.getElementById('previewBtn').textContent = texts[currentLang].stop;
}

function stopPreview() {
    if (sourceNode) {
        sourceNode.stop();
        sourceNode = null;
    }
    isPlaying = false;
    document.getElementById('previewBtn').textContent = texts[currentLang].preview;
}

function downloadStereo() {
    if (!stereoBuffer) return;

    const wavBlob = bufferToWav(stereoBuffer);

    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}-stereo.wav`;
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
