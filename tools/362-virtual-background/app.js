/**
 * Virtual Background - Tool #362
 * Replace webcam background with custom images
 */

let currentLang = 'zh';
let selfieSegmentation = null;
let camera = null;
let isRunning = false;
let mediaRecorder = null;
let recordedChunks = [];
let bgType = 'blur';
let blurAmount = 15;
let bgColor = '#1e293b';
let bgImage = null;

const texts = {
    zh: {
        title: '虛擬背景',
        subtitle: '即時替換視訊背景',
        privacy: '100% 本地處理 · 零資料上傳',
        start: '📷 啟動攝影機',
        stop: '⏹️ 停止',
        record: '⏺️ 開始錄製',
        stopRecord: '⏹️ 停止錄製',
        download: '⬇️ 下載',
        loading: '載入模型中...',
        ready: '準備就緒',
        recording: '錄製中...',
        selectBg: '選擇背景',
        blur: '模糊',
        color: '純色',
        image: '圖片',
        blurLevel: '模糊程度',
        bgColor: '背景顏色',
        uploadBg: '上傳背景圖片'
    },
    en: {
        title: 'Virtual Background',
        subtitle: 'Replace video background in real-time',
        privacy: '100% Local Processing · No Data Upload',
        start: '📷 Start Camera',
        stop: '⏹️ Stop',
        record: '⏺️ Start Recording',
        stopRecord: '⏹️ Stop Recording',
        download: '⬇️ Download',
        loading: 'Loading model...',
        ready: 'Ready',
        recording: 'Recording...',
        selectBg: 'Select Background',
        blur: 'Blur',
        color: 'Color',
        image: 'Image',
        blurLevel: 'Blur Level',
        bgColor: 'Background Color',
        uploadBg: 'Upload Background Image'
    }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    document.getElementById('startBtn').addEventListener('click', toggleCamera);
    document.getElementById('recordBtn').addEventListener('click', toggleRecording);
    document.getElementById('downloadBtn').addEventListener('click', downloadRecording);

    document.querySelectorAll('.bg-option').forEach(opt => {
        opt.addEventListener('click', () => selectBgType(opt.dataset.bg));
    });

    document.getElementById('blurAmount').addEventListener('input', (e) => {
        blurAmount = parseInt(e.target.value);
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
}

function selectBgType(type) {
    bgType = type;
    document.querySelectorAll('.bg-option').forEach(opt => opt.classList.remove('active'));
    document.querySelector(`[data-bg="${type}"]`).classList.add('active');

    document.getElementById('blurSettings').style.display = type === 'blur' ? 'flex' : 'none';
    document.getElementById('colorSettings').style.display = type === 'color' ? 'flex' : 'none';
    document.getElementById('imageSettings').style.display = type === 'image' ? 'flex' : 'none';
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
    document.querySelector('.bg-selector h3').textContent = t.selectBg;
}

async function toggleCamera() {
    const startBtn = document.getElementById('startBtn');
    const t = texts[currentLang];

    if (isRunning) {
        stopCamera();
        startBtn.textContent = t.start;
        return;
    }

    startBtn.disabled = true;
    document.getElementById('status').textContent = t.loading;

    try {
        await initSegmentation();
        await startCamera();
        isRunning = true;
        startBtn.textContent = t.stop;
        document.getElementById('recordBtn').disabled = false;
        document.getElementById('status').textContent = t.ready;
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('status').textContent = 'Error: ' + error.message;
    }

    startBtn.disabled = false;
}

async function initSegmentation() {
    if (selfieSegmentation) return;

    selfieSegmentation = new SelfieSegmentation({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`
    });

    selfieSegmentation.setOptions({
        modelSelection: 1,
        selfieMode: true
    });

    selfieSegmentation.onResults(onResults);
    await selfieSegmentation.initialize();
}

function onResults(results) {
    const canvas = document.getElementById('output');
    const ctx = canvas.getContext('2d');

    canvas.width = results.image.width;
    canvas.height = results.image.height;

    ctx.save();

    // Draw background first
    if (bgType === 'blur') {
        ctx.filter = `blur(${blurAmount}px)`;
        ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
        ctx.filter = 'none';
    } else if (bgType === 'color') {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (bgType === 'image' && bgImage) {
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Create mask for person
    ctx.globalCompositeOperation = 'destination-out';
    ctx.drawImage(results.segmentationMask, 0, 0, canvas.width, canvas.height);

    // Draw person
    ctx.globalCompositeOperation = 'destination-over';
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

    ctx.restore();
}

async function startCamera() {
    const video = document.getElementById('webcam');

    const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' }
    });

    video.srcObject = stream;
    await video.play();

    camera = new Camera(video, {
        onFrame: async () => {
            if (selfieSegmentation && isRunning) {
                await selfieSegmentation.send({ image: video });
            }
        },
        width: 1280,
        height: 720
    });

    await camera.start();
}

function stopCamera() {
    if (camera) {
        camera.stop();
        camera = null;
    }

    const video = document.getElementById('webcam');
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }

    isRunning = false;
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
    const canvas = document.getElementById('output');
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
    a.download = 'virtual-background.webm';
    a.click();
}

init();
