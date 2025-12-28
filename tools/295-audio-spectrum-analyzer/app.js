/**
 * Audio Spectrum Analyzer - Tool #295
 * Analyze audio frequency spectrum
 */

let currentLang = 'zh';
let audioContext = null;
let analyser = null;
let originalBuffer = null;
let sourceNode = null;
let isPlaying = false;
let animationId = null;

const texts = {
    zh: {
        title: '音訊頻譜分析',
        subtitle: '即時分析音訊頻譜',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '點擊或拖放音訊檔案',
        uploadHint: '支援 MP3, WAV, OGG 等格式',
        mode: '顯示模式',
        fftSize: 'FFT大小',
        smooth: '平滑度',
        play: '▶️ 播放',
        stop: '⏹️ 停止',
        bars: '條形圖',
        line: '線條圖',
        gradient: '漸層條形'
    },
    en: {
        title: 'Spectrum Analyzer',
        subtitle: 'Real-time audio spectrum analysis',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Click or drop audio file',
        uploadHint: 'Supports MP3, WAV, OGG formats',
        mode: 'Display Mode',
        fftSize: 'FFT Size',
        smooth: 'Smoothing',
        play: '▶️ Play',
        stop: '⏹️ Stop',
        bars: 'Bars',
        line: 'Line',
        gradient: 'Gradient Bars'
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

    document.getElementById('smoothSlider').addEventListener('input', (e) => {
        document.getElementById('smoothValue').textContent = parseFloat(e.target.value).toFixed(2);
        if (analyser) {
            analyser.smoothingTimeConstant = parseFloat(e.target.value);
        }
    });

    document.getElementById('fftSelect').addEventListener('change', () => {
        if (analyser) {
            analyser.fftSize = parseInt(document.getElementById('fftSelect').value);
        }
    });

    document.getElementById('playBtn').addEventListener('click', startPlayback);
    document.getElementById('stopBtn').addEventListener('click', stopPlayback);

    // Draw empty spectrum
    drawSpectrum(new Uint8Array(128));
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
    labels[1].textContent = t.fftSize;
    labels[2].textContent = t.smooth;

    const modeSelect = document.getElementById('modeSelect');
    modeSelect.options[0].textContent = t.bars;
    modeSelect.options[1].textContent = t.line;
    modeSelect.options[2].textContent = t.gradient;

    document.getElementById('playBtn').textContent = t.play;
    document.getElementById('stopBtn').textContent = t.stop;
}

async function handleFile(file) {
    const arrayBuffer = await file.arrayBuffer();
    originalBuffer = await audioContext.decodeAudioData(arrayBuffer);

    document.getElementById('editorSection').style.display = 'block';
}

function drawSpectrum(dataArray) {
    const canvas = document.getElementById('spectrumCanvas');
    const ctx = canvas.getContext('2d');
    const mode = document.getElementById('modeSelect').value;

    const width = canvas.width;
    const height = canvas.height;
    const bufferLength = dataArray.length;

    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    if (mode === 'bars') {
        const barWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * height;
            ctx.fillStyle = `hsl(${(i / bufferLength) * 60 + 20}, 100%, 50%)`;
            ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
            x += barWidth;
        }
    } else if (mode === 'line') {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();

        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const y = height - (dataArray[i] / 255) * height;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            x += sliceWidth;
        }

        ctx.stroke();
    } else if (mode === 'gradient') {
        const barWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * height;

            const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
            gradient.addColorStop(0, '#ef4444');
            gradient.addColorStop(0.3, '#f59e0b');
            gradient.addColorStop(0.6, '#22c55e');
            gradient.addColorStop(1, '#3b82f6');

            ctx.fillStyle = gradient;
            ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
            x += barWidth;
        }
    }
}

function animate() {
    if (!isPlaying || !analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    drawSpectrum(dataArray);
    animationId = requestAnimationFrame(animate);
}

async function startPlayback() {
    if (!originalBuffer || isPlaying) return;

    await audioContext.resume();

    // Create analyser
    analyser = audioContext.createAnalyser();
    analyser.fftSize = parseInt(document.getElementById('fftSelect').value);
    analyser.smoothingTimeConstant = parseFloat(document.getElementById('smoothSlider').value);

    sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = originalBuffer;
    sourceNode.connect(analyser);
    analyser.connect(audioContext.destination);

    sourceNode.onended = () => {
        isPlaying = false;
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
    };

    isPlaying = true;
    sourceNode.start(0);
    animate();
}

function stopPlayback() {
    if (sourceNode) {
        sourceNode.stop();
        sourceNode = null;
    }
    isPlaying = false;
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
}

init();
