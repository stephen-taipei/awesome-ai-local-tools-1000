/**
 * Music Visualizer - Tool #387
 * Generate visualizations from music
 */

let currentLang = 'zh';
let audioFile = null;
let outputBlob = null;
let audioContext = null;
let analyser = null;
let dataArray = null;
let isPlaying = false;
let animationId = null;
let particles = [];

const texts = {
    zh: {
        title: '音樂視覺化',
        subtitle: '根據音樂生成動態視覺效果',
        privacy: '100% 本地處理 · 零資料上傳',
        play: '▶️ 播放預覽',
        pause: '⏸️ 暫停',
        process: '🎬 生成影片',
        download: '⬇️ 下載',
        upload: '拖放音樂檔案至此或點擊上傳',
        uploadHint: '支援 MP3, WAV, OGG',
        processing: '生成中...',
        complete: '生成完成！'
    },
    en: {
        title: 'Music Visualizer',
        subtitle: 'Generate visualizations from music',
        privacy: '100% Local Processing · No Data Upload',
        play: '▶️ Play Preview',
        pause: '⏸️ Pause',
        process: '🎬 Generate',
        download: '⬇️ Download',
        upload: 'Drop audio file here or click to upload',
        uploadHint: 'Supports MP3, WAV, OGG',
        processing: 'Generating...',
        complete: 'Complete!'
    }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    setupFileUpload();
    document.getElementById('playBtn').addEventListener('click', togglePlay);
    document.getElementById('processBtn').addEventListener('click', generateVideo);
    document.getElementById('downloadBtn').addEventListener('click', downloadResult);
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');
    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.getElementById('playBtn').textContent = isPlaying ? t.pause : t.play;
    document.getElementById('processBtn').textContent = t.process;
    document.getElementById('downloadBtn').textContent = t.download;
}

function setupFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', (e) => e.preventDefault());
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', (e) => { if (e.target.files.length) handleFile(e.target.files[0]); });
}

function handleFile(file) {
    audioFile = file;
    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('editorContent').style.display = 'block';

    const audio = document.getElementById('audioPlayer');
    audio.src = URL.createObjectURL(file);

    setupAudioAnalyser();
}

function setupAudioAnalyser() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    dataArray = new Uint8Array(analyser.frequencyBinCount);

    const audio = document.getElementById('audioPlayer');
    const source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
}

function togglePlay() {
    const t = texts[currentLang];
    const audio = document.getElementById('audioPlayer');
    const playBtn = document.getElementById('playBtn');

    if (isPlaying) {
        audio.pause();
        isPlaying = false;
        playBtn.textContent = t.play;
        if (animationId) cancelAnimationFrame(animationId);
    } else {
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        audio.play();
        isPlaying = true;
        playBtn.textContent = t.pause;
        visualize();
    }
}

function getSettings() {
    return {
        style: document.getElementById('visualStyle').value,
        primaryColor: document.getElementById('primaryColor').value,
        bgColor: document.getElementById('bgColor').value,
        gradient: document.getElementById('gradientEffect').checked
    };
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function visualize() {
    const canvas = document.getElementById('visualizerCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1280;
    canvas.height = 720;

    const settings = getSettings();

    function draw() {
        if (!isPlaying) return;

        analyser.getByteFrequencyData(dataArray);
        drawVisualization(ctx, dataArray, settings, canvas.width, canvas.height, Date.now() / 1000);

        animationId = requestAnimationFrame(draw);
    }

    draw();
}

function drawVisualization(ctx, data, settings, width, height, time) {
    // Background
    ctx.fillStyle = settings.bgColor;
    ctx.fillRect(0, 0, width, height);

    switch (settings.style) {
        case 'bars':
            drawBars(ctx, data, settings, width, height);
            break;
        case 'wave':
            drawWave(ctx, data, settings, width, height);
            break;
        case 'circle':
            drawCircle(ctx, data, settings, width, height, time);
            break;
        case 'particles':
            drawParticles(ctx, data, settings, width, height, time);
            break;
    }
}

function drawBars(ctx, data, settings, width, height) {
    const barCount = data.length;
    const barWidth = width / barCount;
    const rgb = hexToRgb(settings.primaryColor);

    for (let i = 0; i < barCount; i++) {
        const barHeight = (data[i] / 255) * height * 0.8;

        if (settings.gradient) {
            const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
            gradient.addColorStop(0, settings.primaryColor);
            gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`);
            ctx.fillStyle = gradient;
        } else {
            ctx.fillStyle = settings.primaryColor;
        }

        ctx.fillRect(i * barWidth, height - barHeight, barWidth - 2, barHeight);
    }
}

function drawWave(ctx, data, settings, width, height) {
    ctx.beginPath();
    ctx.moveTo(0, height / 2);

    for (let i = 0; i < data.length; i++) {
        const x = (i / data.length) * width;
        const y = height / 2 + ((data[i] - 128) / 128) * height * 0.4;
        ctx.lineTo(x, y);
    }

    ctx.lineTo(width, height / 2);
    ctx.strokeStyle = settings.primaryColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Fill below
    if (settings.gradient) {
        const rgb = hexToRgb(settings.primaryColor);
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        const gradient = ctx.createLinearGradient(0, height / 2, 0, height);
        gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`);
        gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
        ctx.fillStyle = gradient;
        ctx.fill();
    }
}

function drawCircle(ctx, data, settings, width, height, time) {
    const centerX = width / 2;
    const centerY = height / 2;
    const baseRadius = Math.min(width, height) * 0.25;
    const rgb = hexToRgb(settings.primaryColor);

    // Draw outer bars
    for (let i = 0; i < data.length; i++) {
        const angle = (i / data.length) * Math.PI * 2 - Math.PI / 2;
        const barLength = (data[i] / 255) * baseRadius * 0.8;

        const x1 = centerX + Math.cos(angle) * baseRadius;
        const y1 = centerY + Math.sin(angle) * baseRadius;
        const x2 = centerX + Math.cos(angle) * (baseRadius + barLength);
        const y2 = centerY + Math.sin(angle) * (baseRadius + barLength);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);

        const hue = (i / data.length) * 60;
        ctx.strokeStyle = settings.gradient
            ? `hsl(${270 + hue}, 70%, 60%)`
            : settings.primaryColor;
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    // Center circle
    const avgVolume = data.reduce((a, b) => a + b, 0) / data.length;
    const pulseRadius = baseRadius * 0.8 + (avgVolume / 255) * 20;

    ctx.beginPath();
    ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`;
    ctx.fill();
    ctx.strokeStyle = settings.primaryColor;
    ctx.lineWidth = 2;
    ctx.stroke();
}

function drawParticles(ctx, data, settings, width, height, time) {
    const avgVolume = data.reduce((a, b) => a + b, 0) / data.length;
    const rgb = hexToRgb(settings.primaryColor);

    // Create new particles based on volume
    if (avgVolume > 100) {
        for (let i = 0; i < avgVolume / 50; i++) {
            particles.push({
                x: width / 2,
                y: height / 2,
                vx: (Math.random() - 0.5) * avgVolume / 10,
                vy: (Math.random() - 0.5) * avgVolume / 10,
                life: 1,
                size: Math.random() * 5 + 2
            });
        }
    }

    // Update and draw particles
    particles = particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        p.vx *= 0.98;
        p.vy *= 0.98;

        if (p.life > 0) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${p.life})`;
            ctx.fill();
            return true;
        }
        return false;
    });

    // Keep particle count manageable
    if (particles.length > 500) {
        particles = particles.slice(-500);
    }
}

async function generateVideo() {
    const t = texts[currentLang];
    const processBtn = document.getElementById('processBtn');
    processBtn.disabled = true;

    document.getElementById('progressSection').style.display = 'block';

    const canvas = document.getElementById('visualizerCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1280;
    canvas.height = 720;

    const audio = document.getElementById('audioPlayer');
    const settings = getSettings();

    // Reset audio
    audio.pause();
    audio.currentTime = 0;
    isPlaying = false;
    particles = [];

    const duration = audio.duration;
    const fps = 30;
    const totalFrames = Math.floor(duration * fps);

    const stream = canvas.captureStream(fps);

    // Add audio track
    const audioStream = audioContext.createMediaStreamDestination();
    const source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });

    const chunks = [];
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = () => {
        outputBlob = new Blob(chunks, { type: 'video/webm' });
        document.getElementById('downloadBtn').disabled = false;
        document.getElementById('progressText').textContent = t.complete;
        processBtn.disabled = false;
        processBtn.textContent = t.process;
    };

    mediaRecorder.start();

    // Start audio playback
    if (audioContext.state === 'suspended') {
        await audioContext.resume();
    }
    audio.play();
    isPlaying = true;

    const startTime = Date.now();

    function renderFrame() {
        if (!isPlaying || audio.ended) {
            mediaRecorder.stop();
            audio.pause();
            isPlaying = false;
            document.getElementById('progressSection').style.display = 'none';
            return;
        }

        analyser.getByteFrequencyData(dataArray);
        drawVisualization(ctx, dataArray, settings, canvas.width, canvas.height, Date.now() / 1000);

        const elapsed = (Date.now() - startTime) / 1000;
        const progress = Math.min((elapsed / duration) * 100, 100);
        document.getElementById('progressFill').style.width = progress + '%';
        document.getElementById('progressText').textContent = `${t.processing} ${Math.round(progress)}%`;

        requestAnimationFrame(renderFrame);
    }

    renderFrame();
}

function downloadResult() {
    if (!outputBlob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(outputBlob);
    a.download = 'music-visualizer.webm';
    a.click();
}

init();
