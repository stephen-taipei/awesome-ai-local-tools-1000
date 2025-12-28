/**
 * Audio Waveform Generator - Tool #294
 * Generate waveform visualization from audio
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let sourceNode = null;
let isPlaying = false;
let fileName = '';

const texts = {
    zh: {
        title: '音訊波形產生器',
        subtitle: '從音訊生成波形圖像',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '點擊或拖放音訊檔案',
        uploadHint: '支援 MP3, WAV, OGG 等格式',
        waveColor: '波形顏色',
        bgColor: '背景顏色',
        style: '樣式',
        barWidth: '條形寬度',
        play: '▶️ 播放',
        stop: '⏹️ 停止',
        download: '⬇️ 下載圖片',
        bars: '條形',
        mirror: '鏡像',
        line: '線條'
    },
    en: {
        title: 'Waveform Generator',
        subtitle: 'Generate waveform from audio',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Click or drop audio file',
        uploadHint: 'Supports MP3, WAV, OGG formats',
        waveColor: 'Wave Color',
        bgColor: 'Background',
        style: 'Style',
        barWidth: 'Bar Width',
        play: '▶️ Play',
        stop: '⏹️ Stop',
        download: '⬇️ Download Image',
        bars: 'Bars',
        mirror: 'Mirror',
        line: 'Line'
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

    document.getElementById('waveColor').addEventListener('input', drawWaveform);
    document.getElementById('bgColor').addEventListener('input', drawWaveform);
    document.getElementById('styleSelect').addEventListener('change', drawWaveform);
    document.getElementById('barWidthSlider').addEventListener('input', (e) => {
        document.getElementById('barWidthValue').textContent = e.target.value + ' px';
        drawWaveform();
    });

    document.getElementById('previewBtn').addEventListener('click', togglePreview);
    document.getElementById('downloadBtn').addEventListener('click', downloadImage);
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
    labels[0].textContent = t.waveColor;
    labels[1].textContent = t.bgColor;
    labels[2].textContent = t.style;
    labels[3].textContent = t.barWidth;

    const styleSelect = document.getElementById('styleSelect');
    styleSelect.options[0].textContent = t.bars;
    styleSelect.options[1].textContent = t.mirror;
    styleSelect.options[2].textContent = t.line;

    document.getElementById('previewBtn').textContent = isPlaying ? t.stop : t.play;
    document.getElementById('downloadBtn').textContent = t.download;
}

async function handleFile(file) {
    fileName = file.name.replace(/\.[^/.]+$/, '');

    const arrayBuffer = await file.arrayBuffer();
    originalBuffer = await audioContext.decodeAudioData(arrayBuffer);

    document.getElementById('editorSection').style.display = 'block';
    drawWaveform();
}

function drawWaveform() {
    if (!originalBuffer) return;

    const canvas = document.getElementById('waveformCanvas');
    const ctx = canvas.getContext('2d');
    const waveColor = document.getElementById('waveColor').value;
    const bgColor = document.getElementById('bgColor').value;
    const style = document.getElementById('styleSelect').value;
    const barWidth = parseInt(document.getElementById('barWidthSlider').value);

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // Get audio data
    const data = originalBuffer.getChannelData(0);
    const step = Math.ceil(data.length / width);
    const amp = height / 2;

    ctx.fillStyle = waveColor;
    ctx.strokeStyle = waveColor;
    ctx.lineWidth = barWidth;

    if (style === 'bars') {
        const barGap = Math.max(1, barWidth);
        const numBars = Math.floor(width / (barWidth + barGap));
        const samplesPerBar = Math.floor(data.length / numBars);

        for (let i = 0; i < numBars; i++) {
            let sum = 0;
            const start = i * samplesPerBar;
            for (let j = 0; j < samplesPerBar; j++) {
                sum += Math.abs(data[start + j] || 0);
            }
            const avg = sum / samplesPerBar;
            const barHeight = avg * height * 0.9;

            const x = i * (barWidth + barGap);
            ctx.fillRect(x, (height - barHeight) / 2, barWidth, barHeight);
        }
    } else if (style === 'mirror') {
        const barGap = Math.max(1, barWidth);
        const numBars = Math.floor(width / (barWidth + barGap));
        const samplesPerBar = Math.floor(data.length / numBars);

        for (let i = 0; i < numBars; i++) {
            let sum = 0;
            const start = i * samplesPerBar;
            for (let j = 0; j < samplesPerBar; j++) {
                sum += Math.abs(data[start + j] || 0);
            }
            const avg = sum / samplesPerBar;
            const barHeight = avg * amp * 0.9;

            const x = i * (barWidth + barGap);
            ctx.fillRect(x, amp - barHeight, barWidth, barHeight * 2);
        }
    } else if (style === 'line') {
        ctx.beginPath();
        ctx.moveTo(0, amp);

        for (let i = 0; i < width; i++) {
            let min = 1.0;
            let max = -1.0;
            for (let j = 0; j < step; j++) {
                const datum = data[(i * step) + j];
                if (datum < min) min = datum;
                if (datum > max) max = datum;
            }
            const y = ((min + max) / 2 + 1) * amp;
            ctx.lineTo(i, y);
        }

        ctx.stroke();
    }
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

    sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = originalBuffer;
    sourceNode.connect(audioContext.destination);

    sourceNode.onended = () => {
        isPlaying = false;
        document.getElementById('previewBtn').textContent = texts[currentLang].play;
    };

    sourceNode.start(0);
}

function stopPreview() {
    if (sourceNode) {
        sourceNode.stop();
        sourceNode = null;
    }
    isPlaying = false;
    document.getElementById('previewBtn').textContent = texts[currentLang].play;
}

function downloadImage() {
    const canvas = document.getElementById('waveformCanvas');
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}-waveform.png`;
    a.click();
}

init();
