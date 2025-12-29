/**
 * Audio Joiner - Tool #288
 * Join multiple audio files together
 */

let currentLang = 'zh';
let audioContext = null;
let audioBuffers = [];
let sourceNode = null;
let isPlaying = false;

const texts = {
    zh: {
        title: '音訊合併',
        subtitle: '將多個音訊檔案合併為一個',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '點擊或拖放多個音訊檔案',
        uploadHint: '支援 MP3, WAV, OGG 等格式',
        gap: '間隔時間',
        preview: '▶️ 預覽',
        stop: '⏹️ 停止',
        download: '⬇️ 下載',
        seconds: '秒'
    },
    en: {
        title: 'Audio Joiner',
        subtitle: 'Join multiple audio files',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Click or drop multiple audio files',
        uploadHint: 'Supports MP3, WAV, OGG formats',
        gap: 'Gap Time',
        preview: '▶️ Preview',
        stop: '⏹️ Stop',
        download: '⬇️ Download',
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
        handleFiles(e.dataTransfer.files);
    });
    audioInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    document.getElementById('gapSlider').addEventListener('input', (e) => {
        const unit = currentLang === 'zh' ? '秒' : 's';
        document.getElementById('gapValue').textContent = e.target.value + ' ' + unit;
    });

    document.getElementById('previewBtn').addEventListener('click', togglePreview);
    document.getElementById('downloadBtn').addEventListener('click', downloadJoined);
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

    document.querySelector('.option-group label').textContent = t.gap;

    const unit = lang === 'zh' ? '秒' : 's';
    document.getElementById('gapValue').textContent = document.getElementById('gapSlider').value + ' ' + unit;

    document.getElementById('previewBtn').textContent = isPlaying ? t.stop : t.preview;
    document.getElementById('downloadBtn').textContent = t.download;
}

async function handleFiles(files) {
    for (const file of files) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = await audioContext.decodeAudioData(arrayBuffer);
            audioBuffers.push({
                name: file.name,
                buffer: buffer
            });
        } catch (e) {
            console.error('Error loading file:', file.name, e);
        }
    }

    updateFileList();

    if (audioBuffers.length >= 1) {
        document.getElementById('editorSection').style.display = 'block';
    }
}

function updateFileList() {
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '';

    audioBuffers.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'file-item';
        div.innerHTML = `
            <div class="file-info">
                <span class="file-number">${index + 1}</span>
                <span class="file-name">${item.name}</span>
            </div>
            <button class="file-remove" data-index="${index}">&times;</button>
        `;
        fileList.appendChild(div);
    });

    fileList.querySelectorAll('.file-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            audioBuffers.splice(index, 1);
            updateFileList();
            if (audioBuffers.length === 0) {
                document.getElementById('editorSection').style.display = 'none';
            }
        });
    });
}

function joinAudio() {
    if (audioBuffers.length === 0) return null;

    const gapTime = parseFloat(document.getElementById('gapSlider').value);
    const sampleRate = audioBuffers[0].buffer.sampleRate;
    const gapSamples = Math.floor(gapTime * sampleRate);

    // Calculate total length
    let totalLength = 0;
    let maxChannels = 1;
    for (const item of audioBuffers) {
        totalLength += item.buffer.length;
        maxChannels = Math.max(maxChannels, item.buffer.numberOfChannels);
    }
    totalLength += gapSamples * (audioBuffers.length - 1);

    const outputBuffer = audioContext.createBuffer(maxChannels, totalLength, sampleRate);

    let writePos = 0;
    for (let i = 0; i < audioBuffers.length; i++) {
        const buffer = audioBuffers[i].buffer;

        for (let ch = 0; ch < maxChannels; ch++) {
            const output = outputBuffer.getChannelData(ch);
            const input = buffer.getChannelData(Math.min(ch, buffer.numberOfChannels - 1));

            for (let j = 0; j < buffer.length; j++) {
                output[writePos + j] = input[j];
            }
        }

        writePos += buffer.length;

        // Add gap (silence)
        if (i < audioBuffers.length - 1) {
            writePos += gapSamples;
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
    if (audioBuffers.length === 0) return;

    await audioContext.resume();
    isPlaying = true;
    document.getElementById('previewBtn').textContent = texts[currentLang].stop;

    const joinedBuffer = joinAudio();

    sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = joinedBuffer;
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

async function downloadJoined() {
    if (audioBuffers.length === 0) return;

    const joinedBuffer = joinAudio();
    const wavBlob = bufferToWav(joinedBuffer);

    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'joined-audio.wav';
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
