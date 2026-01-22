/**
 * Realtime Filter - Tool #368
 * Apply video filters in real-time using Canvas
 */

let currentLang = 'zh';
let isRunning = false;
let mediaRecorder = null;
let recordedChunks = [];
let video = null;
let canvas = null;
let ctx = null;
let animationId = null;
let currentFilter = 'none';

const texts = {
    zh: {
        title: '即時濾鏡',
        subtitle: '即時套用影片濾鏡效果',
        privacy: '100% 本地處理 · 零資料上傳',
        start: '📷 啟動攝影機',
        stop: '⏹️ 停止',
        record: '⏺️ 開始錄製',
        stopRecord: '⏹️ 停止錄製',
        download: '⬇️ 下載',
        ready: '準備就緒',
        recording: '錄製中...',
        filters: {
            none: '原始', grayscale: '黑白', sepia: '復古', invert: '反轉',
            blur: '模糊', sharpen: '銳化', emboss: '浮雕', edge: '邊緣',
            vintage: '懷舊', cool: '冷色調', warm: '暖色調', vignette: '暗角'
        }
    },
    en: {
        title: 'Realtime Filter',
        subtitle: 'Apply video filters in real-time',
        privacy: '100% Local Processing · No Data Upload',
        start: '📷 Start Camera',
        stop: '⏹️ Stop',
        record: '⏺️ Start Recording',
        stopRecord: '⏹️ Stop Recording',
        download: '⬇️ Download',
        ready: 'Ready',
        recording: 'Recording...',
        filters: {
            none: 'Original', grayscale: 'Grayscale', sepia: 'Sepia', invert: 'Invert',
            blur: 'Blur', sharpen: 'Sharpen', emboss: 'Emboss', edge: 'Edge',
            vintage: 'Vintage', cool: 'Cool', warm: 'Warm', vignette: 'Vignette'
        }
    }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    document.getElementById('startBtn').addEventListener('click', toggleCamera);
    document.getElementById('recordBtn').addEventListener('click', toggleRecording);
    document.getElementById('downloadBtn').addEventListener('click', downloadRecording);

    document.querySelectorAll('.filter-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.filter-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            currentFilter = item.dataset.filter;
        });
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

    document.querySelectorAll('.filter-item').forEach(item => {
        item.textContent = t.filters[item.dataset.filter];
    });
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

    // Apply filter
    if (currentFilter !== 'none') {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        applyFilter(imageData, currentFilter);
        ctx.putImageData(imageData, 0, 0);
    }

    animationId = requestAnimationFrame(processFrame);
}

function applyFilter(imageData, filter) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    switch (filter) {
        case 'grayscale':
            for (let i = 0; i < data.length; i += 4) {
                const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                data[i] = data[i + 1] = data[i + 2] = avg;
            }
            break;

        case 'sepia':
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i], g = data[i + 1], b = data[i + 2];
                data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
                data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
                data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
            }
            break;

        case 'invert':
            for (let i = 0; i < data.length; i += 4) {
                data[i] = 255 - data[i];
                data[i + 1] = 255 - data[i + 1];
                data[i + 2] = 255 - data[i + 2];
            }
            break;

        case 'blur':
            applyConvolution(imageData, [
                1/9, 1/9, 1/9,
                1/9, 1/9, 1/9,
                1/9, 1/9, 1/9
            ]);
            break;

        case 'sharpen':
            applyConvolution(imageData, [
                0, -1, 0,
                -1, 5, -1,
                0, -1, 0
            ]);
            break;

        case 'emboss':
            applyConvolution(imageData, [
                -2, -1, 0,
                -1, 1, 1,
                0, 1, 2
            ]);
            break;

        case 'edge':
            applyConvolution(imageData, [
                -1, -1, -1,
                -1, 8, -1,
                -1, -1, -1
            ]);
            break;

        case 'vintage':
            for (let i = 0; i < data.length; i += 4) {
                data[i] = Math.min(255, data[i] * 1.1 + 20);
                data[i + 1] = Math.min(255, data[i + 1] * 0.9);
                data[i + 2] = Math.min(255, data[i + 2] * 0.8);
            }
            break;

        case 'cool':
            for (let i = 0; i < data.length; i += 4) {
                data[i] = data[i] * 0.9;
                data[i + 2] = Math.min(255, data[i + 2] * 1.2);
            }
            break;

        case 'warm':
            for (let i = 0; i < data.length; i += 4) {
                data[i] = Math.min(255, data[i] * 1.2);
                data[i + 2] = data[i + 2] * 0.9;
            }
            break;

        case 'vignette':
            const cx = width / 2, cy = height / 2;
            const maxDist = Math.sqrt(cx * cx + cy * cy);
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const i = (y * width + x) * 4;
                    const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
                    const factor = 1 - (dist / maxDist) * 0.7;
                    data[i] *= factor;
                    data[i + 1] *= factor;
                    data[i + 2] *= factor;
                }
            }
            break;
    }
}

function applyConvolution(imageData, kernel) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const copy = new Uint8ClampedArray(data);

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const i = (y * width + x) * 4;
            for (let c = 0; c < 3; c++) {
                let sum = 0;
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const ki = ((y + ky) * width + (x + kx)) * 4;
                        sum += copy[ki + c] * kernel[(ky + 1) * 3 + (kx + 1)];
                    }
                }
                data[i + c] = Math.min(255, Math.max(0, sum));
            }
        }
    }
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
    a.download = 'realtime-filter.webm';
    a.click();
}

init();
