/**
 * Chroma Key - Tool #370
 * Real-time green/blue screen removal
 */

let currentLang = 'zh';
let isRunning = false;
let mediaRecorder = null;
let recordedChunks = [];
let video = null;
let canvas = null;
let ctx = null;
let animationId = null;
let keyColor = { r: 0, g: 255, b: 0 };
let tolerance = 40;
let feather = 5;
let bgType = 'transparent';
let bgColor = '#1e293b';
let bgImage = null;

const texts = {
    zh: {
        title: '即時綠幕去背',
        subtitle: '即時綠幕/藍幕去背效果',
        privacy: '100% 本地處理 · 零資料上傳',
        start: '📷 啟動攝影機',
        stop: '⏹️ 停止',
        record: '⏺️ 開始錄製',
        stopRecord: '⏹️ 停止錄製',
        download: '⬇️ 下載',
        ready: '準備就緒',
        recording: '錄製中...',
        settings: '去背設定',
        green: '🟢 綠幕',
        blue: '🔵 藍幕',
        custom: '🎨 自訂',
        selectColor: '選擇顏色',
        tolerance: '容差值',
        feather: '邊緣羽化',
        replaceBg: '替換背景',
        transparent: '透明',
        color: '純色',
        image: '圖片',
        upload: '上傳'
    },
    en: {
        title: 'Chroma Key',
        subtitle: 'Real-time green/blue screen removal',
        privacy: '100% Local Processing · No Data Upload',
        start: '📷 Start Camera',
        stop: '⏹️ Stop',
        record: '⏺️ Start Recording',
        stopRecord: '⏹️ Stop Recording',
        download: '⬇️ Download',
        ready: 'Ready',
        recording: 'Recording...',
        settings: 'Chroma Key Settings',
        green: '🟢 Green',
        blue: '🔵 Blue',
        custom: '🎨 Custom',
        selectColor: 'Select Color',
        tolerance: 'Tolerance',
        feather: 'Edge Feather',
        replaceBg: 'Replace Background',
        transparent: 'Transparent',
        color: 'Color',
        image: 'Image',
        upload: 'Upload'
    }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    document.getElementById('startBtn').addEventListener('click', toggleCamera);
    document.getElementById('recordBtn').addEventListener('click', toggleRecording);
    document.getElementById('downloadBtn').addEventListener('click', downloadRecording);

    // Color presets
    document.querySelectorAll('.color-preset').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.color-preset').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const color = btn.dataset.color;
            document.getElementById('customColor').style.display = color === 'custom' ? 'flex' : 'none';

            if (color === 'green') keyColor = { r: 0, g: 255, b: 0 };
            else if (color === 'blue') keyColor = { r: 0, g: 0, b: 255 };
        });
    });

    document.getElementById('keyColor').addEventListener('input', (e) => {
        const hex = e.target.value;
        keyColor = {
            r: parseInt(hex.slice(1, 3), 16),
            g: parseInt(hex.slice(3, 5), 16),
            b: parseInt(hex.slice(5, 7), 16)
        };
    });

    document.getElementById('tolerance').addEventListener('input', (e) => {
        tolerance = parseInt(e.target.value);
        document.getElementById('toleranceValue').textContent = tolerance;
    });

    document.getElementById('feather').addEventListener('input', (e) => {
        feather = parseInt(e.target.value);
        document.getElementById('featherValue').textContent = feather;
    });

    document.getElementById('bgType').addEventListener('change', (e) => {
        bgType = e.target.value;
        document.getElementById('bgColor').style.display = bgType === 'color' ? 'inline-block' : 'none';
        document.getElementById('uploadBgBtn').style.display = bgType === 'image' ? 'inline-block' : 'none';
    });

    document.getElementById('bgColor').addEventListener('input', (e) => {
        bgColor = e.target.value;
    });

    document.getElementById('uploadBgBtn').addEventListener('click', () => {
        document.getElementById('bgInput').click();
    });

    document.getElementById('bgInput').addEventListener('change', (e) => {
        if (e.target.files.length) {
            const img = new Image();
            img.onload = () => { bgImage = img; };
            img.src = URL.createObjectURL(e.target.files[0]);
        }
    });

    video = document.getElementById('webcam');
    canvas = document.getElementById('output');
    ctx = canvas.getContext('2d');
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');
    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.getElementById('startBtn').textContent = isRunning ? t.stop : t.start;
    document.getElementById('recordBtn').textContent = mediaRecorder?.state === 'recording' ? t.stopRecord : t.record;
    document.getElementById('downloadBtn').textContent = t.download;
    document.querySelector('.options-section h3').textContent = t.settings;
}

async function toggleCamera() {
    const startBtn = document.getElementById('startBtn');
    const t = texts[currentLang];

    if (isRunning) {
        stopCamera();
        startBtn.textContent = t.start;
        return;
    }

    try {
        await startCamera();
        isRunning = true;
        startBtn.textContent = t.stop;
        document.getElementById('recordBtn').disabled = false;
        document.getElementById('optionsSection').style.display = 'block';
        document.getElementById('status').textContent = t.ready;
        processFrame();
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('status').textContent = 'Error: ' + error.message;
    }
}

async function startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' }
    });

    video.srcObject = stream;
    await video.play();

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
}

function processFrame() {
    if (!isRunning) return;

    // Draw video frame (mirrored)
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();

    // Apply chroma key
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Draw background first if needed
    if (bgType === 'color' || bgType === 'image') {
        const bgCanvas = document.createElement('canvas');
        bgCanvas.width = canvas.width;
        bgCanvas.height = canvas.height;
        const bgCtx = bgCanvas.getContext('2d');

        if (bgType === 'color') {
            bgCtx.fillStyle = bgColor;
            bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
        } else if (bgType === 'image' && bgImage) {
            bgCtx.drawImage(bgImage, 0, 0, bgCanvas.width, bgCanvas.height);
        }

        const bgData = bgCtx.getImageData(0, 0, bgCanvas.width, bgCanvas.height).data;

        for (let i = 0; i < data.length; i += 4) {
            const alpha = calculateAlpha(data[i], data[i + 1], data[i + 2]);

            if (alpha < 1) {
                data[i] = data[i] * alpha + bgData[i] * (1 - alpha);
                data[i + 1] = data[i + 1] * alpha + bgData[i + 1] * (1 - alpha);
                data[i + 2] = data[i + 2] * alpha + bgData[i + 2] * (1 - alpha);
            }
        }
    } else {
        // Transparent background
        for (let i = 0; i < data.length; i += 4) {
            const alpha = calculateAlpha(data[i], data[i + 1], data[i + 2]);
            data[i + 3] = Math.round(alpha * 255);
        }
    }

    ctx.putImageData(imageData, 0, 0);

    animationId = requestAnimationFrame(processFrame);
}

function calculateAlpha(r, g, b) {
    // Calculate color distance from key color
    const dr = r - keyColor.r;
    const dg = g - keyColor.g;
    const db = b - keyColor.b;
    const distance = Math.sqrt(dr * dr + dg * dg + db * db);

    // Calculate alpha based on distance and tolerance
    if (distance < tolerance) {
        return 0;
    } else if (distance < tolerance + feather * 5) {
        return (distance - tolerance) / (feather * 5);
    }
    return 1;
}

function stopCamera() {
    isRunning = false;

    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }

    document.getElementById('recordBtn').disabled = true;
    document.getElementById('optionsSection').style.display = 'none';
}

function toggleRecording() {
    const recordBtn = document.getElementById('recordBtn');
    const t = texts[currentLang];

    if (mediaRecorder?.state === 'recording') {
        mediaRecorder.stop();
        recordBtn.textContent = t.record;
        recordBtn.classList.remove('recording');
        document.getElementById('status').textContent = t.ready;
    } else {
        startRecording();
        recordBtn.textContent = t.stopRecord;
        recordBtn.classList.add('recording');
        document.getElementById('status').textContent = t.recording;
    }
}

function startRecording() {
    const stream = canvas.captureStream(30);
    recordedChunks = [];
    mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });

    mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
        document.getElementById('downloadBtn').disabled = false;
    };

    mediaRecorder.start();
}

function downloadRecording() {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'chroma-key.webm';
    a.click();
}

init();
