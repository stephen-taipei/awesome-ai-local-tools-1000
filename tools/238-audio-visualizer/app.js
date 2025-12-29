/**
 * Audio Visualizer - Tool #238
 * Visualize audio with beautiful effects
 */

let currentLang = 'zh';
let audioContext = null;
let analyser = null;
let dataArray = null;
let canvas, ctx;
let animationId = null;
let isRecording = false;
let mediaStream = null;

const texts = {
    zh: {
        title: '音訊視覺化',
        subtitle: '將音訊轉化為視覺效果',
        privacy: '100% 本地處理 · 零資料上傳',
        mic: '🎤 麥克風',
        file: '📁 音訊檔案',
        startMic: '🎤 開始錄音',
        stopMic: '⏹️ 停止錄音',
        selectFile: '📁 選擇音訊檔案',
        mode: '視覺效果',
        bars: '頻譜條', wave: '波形', circle: '圓形', particles: '粒子',
        color: '顏色主題',
        rainbow: '彩虹', blue: '藍色', green: '綠色', purple: '紫色', fire: '火焰',
        sensitivity: '靈敏度'
    },
    en: {
        title: 'Audio Visualizer',
        subtitle: 'Visualize audio with beautiful effects',
        privacy: '100% Local Processing · No Data Upload',
        mic: '🎤 Microphone',
        file: '📁 Audio File',
        startMic: '🎤 Start Recording',
        stopMic: '⏹️ Stop Recording',
        selectFile: '📁 Select Audio File',
        mode: 'Visual Mode',
        bars: 'Bars', wave: 'Wave', circle: 'Circle', particles: 'Particles',
        color: 'Color Theme',
        rainbow: 'Rainbow', blue: 'Blue', green: 'Green', purple: 'Purple', fire: 'Fire',
        sensitivity: 'Sensitivity'
    }
};

function init() {
    canvas = document.getElementById('visualizer');
    ctx = canvas.getContext('2d');

    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));

    document.getElementById('micTab').addEventListener('click', () => switchTab('mic'));
    document.getElementById('fileTab').addEventListener('click', () => switchTab('file'));

    document.getElementById('micBtn').addEventListener('click', toggleMicrophone);
    document.getElementById('uploadBtn').addEventListener('click', () => document.getElementById('audioInput').click());
    document.getElementById('audioInput').addEventListener('change', handleFileUpload);

    // Draw idle state
    drawIdle();
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');

    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;

    document.getElementById('micTab').textContent = t.mic;
    document.getElementById('fileTab').textContent = t.file;
    document.getElementById('micBtn').textContent = isRecording ? t.stopMic : t.startMic;
    document.getElementById('uploadBtn').textContent = t.selectFile;

    const labels = document.querySelectorAll('.control-group label');
    labels[0].textContent = t.mode;
    labels[1].textContent = t.color;
    labels[2].textContent = t.sensitivity;

    const modeSelect = document.getElementById('modeSelect');
    modeSelect.options[0].text = t.bars;
    modeSelect.options[1].text = t.wave;
    modeSelect.options[2].text = t.circle;
    modeSelect.options[3].text = t.particles;

    const colorSelect = document.getElementById('colorSelect');
    colorSelect.options[0].text = t.rainbow;
    colorSelect.options[1].text = t.blue;
    colorSelect.options[2].text = t.green;
    colorSelect.options[3].text = t.purple;
    colorSelect.options[4].text = t.fire;
}

function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`${tab}Tab`).classList.add('active');

    document.getElementById('micPanel').style.display = tab === 'mic' ? 'block' : 'none';
    document.getElementById('filePanel').style.display = tab === 'file' ? 'block' : 'none';

    if (tab === 'file' && isRecording) {
        stopMicrophone();
    }
}

async function toggleMicrophone() {
    if (isRecording) {
        stopMicrophone();
    } else {
        await startMicrophone();
    }
}

async function startMicrophone() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

        const source = audioContext.createMediaStreamSource(mediaStream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;

        source.connect(analyser);

        dataArray = new Uint8Array(analyser.frequencyBinCount);
        isRecording = true;

        document.getElementById('micBtn').textContent = texts[currentLang].stopMic;
        document.getElementById('micBtn').classList.add('recording');

        visualize();
    } catch (err) {
        console.error('Microphone error:', err);
    }
}

function stopMicrophone() {
    isRecording = false;
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
    }
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    document.getElementById('micBtn').textContent = texts[currentLang].startMic;
    document.getElementById('micBtn').classList.remove('recording');

    drawIdle();
}

async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const audioPlayer = document.getElementById('audioPlayer');
    audioPlayer.src = URL.createObjectURL(file);
    audioPlayer.style.display = 'block';

    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaElementSource(audioPlayer);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;

    source.connect(analyser);
    analyser.connect(audioContext.destination);

    dataArray = new Uint8Array(analyser.frequencyBinCount);

    audioPlayer.onplay = () => visualize();
    audioPlayer.onpause = () => {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    };
}

function visualize() {
    const mode = document.getElementById('modeSelect').value;
    const color = document.getElementById('colorSelect').value;
    const sensitivity = parseInt(document.getElementById('sensitivitySlider').value);

    analyser.getByteFrequencyData(dataArray);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    switch (mode) {
        case 'bars':
            drawBars(color, sensitivity);
            break;
        case 'wave':
            drawWave(color, sensitivity);
            break;
        case 'circle':
            drawCircle(color, sensitivity);
            break;
        case 'particles':
            drawParticles(color, sensitivity);
            break;
    }

    animationId = requestAnimationFrame(visualize);
}

function getColor(index, total, theme) {
    switch (theme) {
        case 'rainbow':
            return `hsl(${(index / total) * 360}, 80%, 60%)`;
        case 'blue':
            return `hsl(${200 + (index / total) * 40}, 80%, ${50 + (index / total) * 30}%)`;
        case 'green':
            return `hsl(${120 + (index / total) * 40}, 80%, ${50 + (index / total) * 30}%)`;
        case 'purple':
            return `hsl(${270 + (index / total) * 40}, 80%, ${50 + (index / total) * 30}%)`;
        case 'fire':
            return `hsl(${(index / total) * 60}, 100%, ${50 + (index / total) * 30}%)`;
        default:
            return '#3b82f6';
    }
}

function drawBars(color, sensitivity) {
    const barCount = dataArray.length / 2;
    const barWidth = canvas.width / barCount;
    const multiplier = sensitivity / 5;

    for (let i = 0; i < barCount; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * multiplier;

        ctx.fillStyle = getColor(i, barCount, color);
        ctx.fillRect(
            i * barWidth,
            canvas.height - barHeight,
            barWidth - 1,
            barHeight
        );
    }
}

function drawWave(color, sensitivity) {
    const multiplier = sensitivity / 5;

    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);

    for (let i = 0; i < dataArray.length; i++) {
        const x = (i / dataArray.length) * canvas.width;
        const y = canvas.height / 2 + ((dataArray[i] - 128) / 128) * (canvas.height / 2) * multiplier;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }

    ctx.strokeStyle = getColor(0, 1, color);
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw gradient fill
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.lineTo(0, canvas.height / 2);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    for (let i = 0; i <= 10; i++) {
        gradient.addColorStop(i / 10, getColor(i, 10, color));
    }
    ctx.fillStyle = gradient;
    ctx.globalAlpha = 0.3;
    ctx.fill();
    ctx.globalAlpha = 1;
}

function drawCircle(color, sensitivity) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const baseRadius = 80;
    const multiplier = sensitivity / 5;

    for (let i = 0; i < dataArray.length; i++) {
        const angle = (i / dataArray.length) * Math.PI * 2;
        const radius = baseRadius + (dataArray[i] / 255) * 100 * multiplier;

        const x1 = centerX + Math.cos(angle) * baseRadius;
        const y1 = centerY + Math.sin(angle) * baseRadius;
        const x2 = centerX + Math.cos(angle) * radius;
        const y2 = centerY + Math.sin(angle) * radius;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = getColor(i, dataArray.length, color);
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // Center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, baseRadius - 5, 0, Math.PI * 2);
    ctx.strokeStyle = getColor(0, 1, color);
    ctx.lineWidth = 2;
    ctx.stroke();
}

let particles = [];

function drawParticles(color, sensitivity) {
    const multiplier = sensitivity / 5;

    // Get average frequency
    const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

    // Add new particles based on audio level
    if (avg > 50) {
        for (let i = 0; i < Math.floor(avg / 30); i++) {
            particles.push({
                x: canvas.width / 2,
                y: canvas.height / 2,
                vx: (Math.random() - 0.5) * 10 * multiplier,
                vy: (Math.random() - 0.5) * 10 * multiplier,
                life: 1,
                size: 2 + Math.random() * 4,
                hue: Math.random() * 360
            });
        }
    }

    // Update and draw particles
    particles = particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;

        if (p.life > 0) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);

            if (color === 'rainbow') {
                ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${p.life})`;
            } else {
                ctx.fillStyle = getColor(p.hue / 360 * 100, 100, color).replace(')', `, ${p.life})`).replace('hsl', 'hsla');
            }
            ctx.fill();
            return true;
        }
        return false;
    });

    // Limit particles
    if (particles.length > 500) {
        particles = particles.slice(-500);
    }
}

function drawIdle() {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#334155';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(currentLang === 'zh' ? '等待音訊輸入...' : 'Waiting for audio...', canvas.width / 2, canvas.height / 2);
}

init();
