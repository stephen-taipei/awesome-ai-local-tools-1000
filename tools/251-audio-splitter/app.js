/**
 * Audio Splitter - Tool #251
 * Split audio into multiple segments
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let fileName = '';
let segments = [];

const texts = {
    zh: {
        title: '音訊分割',
        subtitle: '將音訊分割成多個片段',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '點擊或拖放音訊檔案',
        uploadHint: '支援 MP3, WAV, OGG 等格式',
        splitMode: '分割模式',
        equal: '平均分割',
        duration: '按時長分割',
        manual: '手動標記',
        splitCount: '分割數量',
        segmentDuration: '每段時長',
        seconds: '秒',
        totalDuration: '總時長',
        segmentCount: '片段數',
        split: '✂️ 分割並下載',
        segment: '片段'
    },
    en: {
        title: 'Audio Splitter',
        subtitle: 'Split audio into multiple segments',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Click or drop audio file',
        uploadHint: 'Supports MP3, WAV, OGG formats',
        splitMode: 'Split Mode',
        equal: 'Equal Parts',
        duration: 'By Duration',
        manual: 'Manual Markers',
        splitCount: 'Split Count',
        segmentDuration: 'Segment Duration',
        seconds: 'sec',
        totalDuration: 'Total Duration',
        segmentCount: 'Segments',
        split: '✂️ Split & Download',
        segment: 'Segment'
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

    document.getElementById('splitMode').addEventListener('change', (e) => {
        document.getElementById('equalOption').style.display = e.target.value === 'equal' ? 'flex' : 'none';
        document.getElementById('durationOption').style.display = e.target.value === 'duration' ? 'flex' : 'none';
        if (originalBuffer) updateSegments();
    });

    document.getElementById('splitCount').addEventListener('input', updateSegments);
    document.getElementById('segmentDuration').addEventListener('input', updateSegments);

    document.getElementById('splitBtn').addEventListener('click', splitAndDownload);
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

    document.querySelectorAll('.option-group label')[0].textContent = t.splitMode;
    document.getElementById('splitMode').options[0].text = t.equal;
    document.getElementById('splitMode').options[1].text = t.duration;
    document.getElementById('splitMode').options[2].text = t.manual;

    document.querySelectorAll('.option-group label')[1].textContent = t.splitCount;
    document.querySelectorAll('.option-group label')[2].textContent = t.segmentDuration;
    document.querySelector('#durationOption span').textContent = t.seconds;

    document.querySelectorAll('.info-label')[0].textContent = t.totalDuration;
    document.querySelectorAll('.info-label')[1].textContent = t.segmentCount;

    document.getElementById('splitBtn').textContent = t.split;

    if (originalBuffer) updateSegments();
}

async function handleFile(file) {
    fileName = file.name.replace(/\.[^/.]+$/, '');

    const arrayBuffer = await file.arrayBuffer();
    originalBuffer = await audioContext.decodeAudioData(arrayBuffer);

    document.getElementById('totalDuration').textContent = formatTime(originalBuffer.duration);

    drawWaveform();
    updateSegments();
    document.getElementById('editorSection').style.display = 'block';
}

function drawWaveform() {
    const canvas = document.getElementById('waveformCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = canvas.offsetWidth * 2;
    canvas.height = 100 * 2;
    ctx.scale(2, 2);

    const width = canvas.offsetWidth;
    const height = 100;
    const data = originalBuffer.getChannelData(0);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    ctx.beginPath();
    ctx.strokeStyle = '#64748b';
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

function updateSegments() {
    if (!originalBuffer) return;

    const mode = document.getElementById('splitMode').value;
    const duration = originalBuffer.duration;
    segments = [];

    if (mode === 'equal') {
        const count = parseInt(document.getElementById('splitCount').value) || 2;
        const segmentLength = duration / count;
        for (let i = 0; i < count; i++) {
            segments.push({
                start: i * segmentLength,
                end: (i + 1) * segmentLength
            });
        }
    } else if (mode === 'duration') {
        const segmentLength = parseFloat(document.getElementById('segmentDuration').value) || 30;
        let start = 0;
        while (start < duration) {
            segments.push({
                start: start,
                end: Math.min(start + segmentLength, duration)
            });
            start += segmentLength;
        }
    } else {
        // Manual mode - for now just split in half
        segments.push({ start: 0, end: duration / 2 });
        segments.push({ start: duration / 2, end: duration });
    }

    document.getElementById('segmentCount').textContent = segments.length;
    renderSegmentsList();
    drawMarkers();
}

function renderSegmentsList() {
    const list = document.getElementById('segmentsList');
    const t = texts[currentLang];

    list.innerHTML = segments.map((seg, i) => `
        <div class="segment-item">
            <span class="segment-name">${t.segment} ${i + 1}</span>
            <span class="segment-time">${formatTime(seg.start)} - ${formatTime(seg.end)}</span>
        </div>
    `).join('');
}

function drawMarkers() {
    const container = document.getElementById('markers');
    const duration = originalBuffer.duration;

    container.innerHTML = segments.slice(0, -1).map((seg, i) => {
        const percent = (seg.end / duration) * 100;
        return `<div class="marker" style="left: ${percent}%"></div>`;
    }).join('');
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

async function splitAndDownload() {
    if (!originalBuffer || segments.length === 0) return;

    for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        const segmentBuffer = extractSegment(originalBuffer, seg.start, seg.end);
        const wavBlob = bufferToWav(segmentBuffer);

        const url = URL.createObjectURL(wavBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}-part${i + 1}.wav`;
        a.click();
        URL.revokeObjectURL(url);

        // Small delay between downloads
        await new Promise(r => setTimeout(r, 300));
    }
}

function extractSegment(buffer, start, end) {
    const sampleRate = buffer.sampleRate;
    const startSample = Math.floor(start * sampleRate);
    const endSample = Math.floor(end * sampleRate);
    const length = endSample - startSample;

    const segmentBuffer = audioContext.createBuffer(
        buffer.numberOfChannels,
        length,
        sampleRate
    );

    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
        const input = buffer.getChannelData(ch);
        const output = segmentBuffer.getChannelData(ch);
        for (let i = 0; i < length; i++) {
            output[i] = input[startSample + i];
        }
    }

    return segmentBuffer;
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
