/**
 * Audio Splitter - Tool #289
 * Split audio into multiple parts
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let fileName = '';

const texts = {
    zh: {
        title: '音訊分割',
        subtitle: '將音訊分割成多個部分',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '點擊或拖放音訊檔案',
        uploadHint: '支援 MP3, WAV, OGG 等格式',
        duration: '音訊長度',
        mode: '分割方式',
        count: '分割數量',
        partDuration: '每段時長',
        download: '⬇️ 下載全部',
        byCount: '按數量分割',
        byDuration: '按時長分割',
        parts: '段',
        seconds: '秒'
    },
    en: {
        title: 'Audio Splitter',
        subtitle: 'Split audio into multiple parts',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Click or drop audio file',
        uploadHint: 'Supports MP3, WAV, OGG formats',
        duration: 'Duration',
        mode: 'Split Mode',
        count: 'Parts',
        partDuration: 'Part Duration',
        download: '⬇️ Download All',
        byCount: 'By Count',
        byDuration: 'By Duration',
        parts: 'parts',
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

    document.getElementById('modeSelect').addEventListener('change', (e) => {
        document.getElementById('countGroup').style.display = e.target.value === 'count' ? 'flex' : 'none';
        document.getElementById('durationGroup').style.display = e.target.value === 'duration' ? 'flex' : 'none';
    });

    document.getElementById('countSlider').addEventListener('input', (e) => {
        const unit = currentLang === 'zh' ? '段' : 'parts';
        document.getElementById('countValue').textContent = e.target.value + ' ' + unit;
    });

    document.getElementById('durationSlider').addEventListener('input', (e) => {
        const unit = currentLang === 'zh' ? '秒' : 's';
        document.getElementById('durationValue').textContent = e.target.value + ' ' + unit;
    });

    document.getElementById('downloadBtn').addEventListener('click', downloadSplits);
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
    labels[0].textContent = t.mode;
    labels[1].textContent = t.count;
    labels[2].textContent = t.partDuration;

    const modeSelect = document.getElementById('modeSelect');
    modeSelect.options[0].textContent = t.byCount;
    modeSelect.options[1].textContent = t.byDuration;

    const countUnit = lang === 'zh' ? '段' : 'parts';
    document.getElementById('countValue').textContent = document.getElementById('countSlider').value + ' ' + countUnit;

    const durUnit = lang === 'zh' ? '秒' : 's';
    document.getElementById('durationValue').textContent = document.getElementById('durationSlider').value + ' ' + durUnit;

    document.getElementById('downloadBtn').textContent = t.download;
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

async function handleFile(file) {
    fileName = file.name.replace(/\.[^/.]+$/, '');

    const arrayBuffer = await file.arrayBuffer();
    originalBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const duration = originalBuffer.length / originalBuffer.sampleRate;
    document.getElementById('duration').textContent = formatTime(duration);

    document.getElementById('editorSection').style.display = 'block';
}

function splitAudio() {
    if (!originalBuffer) return [];

    const mode = document.getElementById('modeSelect').value;
    const sampleRate = originalBuffer.sampleRate;
    const totalLength = originalBuffer.length;
    const parts = [];

    let splitPoints = [];

    if (mode === 'count') {
        const count = parseInt(document.getElementById('countSlider').value);
        const partLength = Math.floor(totalLength / count);
        for (let i = 0; i < count; i++) {
            splitPoints.push({
                start: i * partLength,
                end: i === count - 1 ? totalLength : (i + 1) * partLength
            });
        }
    } else {
        const partDuration = parseFloat(document.getElementById('durationSlider').value);
        const partSamples = Math.floor(partDuration * sampleRate);
        let start = 0;
        while (start < totalLength) {
            splitPoints.push({
                start: start,
                end: Math.min(start + partSamples, totalLength)
            });
            start += partSamples;
        }
    }

    for (const point of splitPoints) {
        const length = point.end - point.start;
        const buffer = audioContext.createBuffer(
            originalBuffer.numberOfChannels,
            length,
            sampleRate
        );

        for (let ch = 0; ch < originalBuffer.numberOfChannels; ch++) {
            const input = originalBuffer.getChannelData(ch);
            const output = buffer.getChannelData(ch);
            for (let i = 0; i < length; i++) {
                output[i] = input[point.start + i];
            }
        }

        parts.push(buffer);
    }

    return parts;
}

async function downloadSplits() {
    if (!originalBuffer) return;

    const parts = splitAudio();

    for (let i = 0; i < parts.length; i++) {
        const wavBlob = bufferToWav(parts[i]);
        const url = URL.createObjectURL(wavBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}-part${i + 1}.wav`;
        a.click();
        URL.revokeObjectURL(url);

        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 100));
    }
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
