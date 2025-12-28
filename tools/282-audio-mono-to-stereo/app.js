/**
 * Audio Mono to Stereo - Tool #282
 * Convert mono audio to stereo with spatial effects
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let sourceNode = null;
let isPlaying = false;
let fileName = '';

const texts = {
    zh: {
        title: '單聲道轉立體聲',
        subtitle: '將單聲道音訊轉換為立體聲',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '點擊或拖放音訊檔案',
        uploadHint: '支援 MP3, WAV, OGG 等格式',
        mode: '模式',
        width: '立體寬度',
        delay: '延遲時間',
        preview: '▶️ 預覽',
        stop: '⏹️ 停止',
        download: '⬇️ 下載',
        duplicate: '複製雙聲道',
        haas: 'Haas效果',
        chorus: '合唱效果'
    },
    en: {
        title: 'Mono to Stereo',
        subtitle: 'Convert mono audio to stereo',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Click or drop audio file',
        uploadHint: 'Supports MP3, WAV, OGG formats',
        mode: 'Mode',
        width: 'Stereo Width',
        delay: 'Delay Time',
        preview: '▶️ Preview',
        stop: '⏹️ Stop',
        download: '⬇️ Download',
        duplicate: 'Duplicate',
        haas: 'Haas Effect',
        chorus: 'Chorus Effect'
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
    });

    document.getElementById('delaySlider').addEventListener('input', (e) => {
        document.getElementById('delayValue').textContent = e.target.value + ' ms';
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

    document.querySelectorAll('.option-group label')[0].textContent = t.mode;
    document.querySelectorAll('.option-group label')[1].textContent = t.width;
    document.querySelectorAll('.option-group label')[2].textContent = t.delay;

    const select = document.getElementById('modeSelect');
    select.options[0].textContent = t.duplicate;
    select.options[1].textContent = t.haas;
    select.options[2].textContent = t.chorus;

    document.getElementById('previewBtn').textContent = isPlaying ? t.stop : t.preview;
    document.getElementById('downloadBtn').textContent = t.download;
}

async function handleFile(file) {
    fileName = file.name.replace(/\.[^/.]+$/, '');

    const arrayBuffer = await file.arrayBuffer();
    originalBuffer = await audioContext.decodeAudioData(arrayBuffer);

    document.getElementById('editorSection').style.display = 'block';
}

function convertToStereo(buffer) {
    const mode = document.getElementById('modeSelect').value;
    const width = parseInt(document.getElementById('widthSlider').value) / 100;
    const delayMs = parseFloat(document.getElementById('delaySlider').value);

    const sampleRate = buffer.sampleRate;
    const delaySamples = Math.floor(delayMs * sampleRate / 1000);

    const outputBuffer = audioContext.createBuffer(2, buffer.length, sampleRate);
    const leftOutput = outputBuffer.getChannelData(0);
    const rightOutput = outputBuffer.getChannelData(1);

    // Get mono input (use left channel if stereo)
    const input = buffer.getChannelData(0);

    switch (mode) {
        case 'duplicate':
            // Simple duplication with slight panning
            for (let i = 0; i < buffer.length; i++) {
                leftOutput[i] = input[i];
                rightOutput[i] = input[i];
            }
            break;

        case 'haas':
            // Haas effect - delay one channel slightly
            for (let i = 0; i < buffer.length; i++) {
                leftOutput[i] = input[i];
                if (i >= delaySamples) {
                    rightOutput[i] = input[i - delaySamples] * (1 - width * 0.3);
                } else {
                    rightOutput[i] = 0;
                }
            }
            break;

        case 'chorus':
            // Simple chorus effect for stereo widening
            const lfoRate = 0.5;
            const maxDelay = delaySamples * 2;
            const delayBuffer = new Float32Array(maxDelay);
            let writeIdx = 0;

            for (let i = 0; i < buffer.length; i++) {
                delayBuffer[writeIdx] = input[i];

                // LFO for modulated delay
                const lfo = Math.sin(2 * Math.PI * lfoRate * i / sampleRate);
                const delayOffset = Math.floor((1 + lfo * width) * delaySamples * 0.5);

                let readIdx = writeIdx - delaySamples - delayOffset;
                if (readIdx < 0) readIdx += maxDelay;

                let readIdx2 = writeIdx - delaySamples + delayOffset;
                if (readIdx2 < 0) readIdx2 += maxDelay;

                leftOutput[i] = input[i] * 0.7 + delayBuffer[readIdx % maxDelay] * 0.3;
                rightOutput[i] = input[i] * 0.7 + delayBuffer[readIdx2 % maxDelay] * 0.3;

                writeIdx = (writeIdx + 1) % maxDelay;
            }
            break;
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

    const stereoBuffer = convertToStereo(originalBuffer);

    sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = stereoBuffer;
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

async function downloadStereo() {
    if (!originalBuffer) return;

    const stereoBuffer = convertToStereo(originalBuffer);
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
