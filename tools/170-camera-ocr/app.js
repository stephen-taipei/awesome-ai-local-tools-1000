/**
 * Camera OCR - Tool #170
 */
let stream = null;
let capturedImage = null;

function init() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const cameraOverlay = document.getElementById('cameraOverlay');
    const startBtn = document.getElementById('startBtn');
    const captureBtn = document.getElementById('captureBtn');

    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    cameraOverlay.addEventListener('click', startCamera);
    startBtn.addEventListener('click', toggleCamera);
    captureBtn.addEventListener('click', captureAndRecognize);

    document.getElementById('copyBtn').addEventListener('click', () => {
        const text = document.getElementById('resultText').textContent;
        navigator.clipboard.writeText(text).then(() => {
            document.getElementById('copyBtn').textContent = '已複製!';
            setTimeout(() => document.getElementById('copyBtn').textContent = '複製', 2000);
        });
    });
}

async function startCamera() {
    const video = document.getElementById('video');
    const cameraOverlay = document.getElementById('cameraOverlay');
    const startBtn = document.getElementById('startBtn');
    const captureBtn = document.getElementById('captureBtn');

    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        video.srcObject = stream;
        cameraOverlay.classList.add('hidden');
        startBtn.textContent = '停止相機';
        captureBtn.disabled = false;
    } catch (error) {
        alert('無法存取相機: ' + error.message);
    }
}

function stopCamera() {
    const video = document.getElementById('video');
    const cameraOverlay = document.getElementById('cameraOverlay');
    const startBtn = document.getElementById('startBtn');
    const captureBtn = document.getElementById('captureBtn');

    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    video.srcObject = null;
    cameraOverlay.classList.remove('hidden');
    startBtn.textContent = '啟動相機';
    captureBtn.disabled = true;
}

function toggleCamera() {
    if (stream) {
        stopCamera();
    } else {
        startCamera();
    }
}

async function captureAndRecognize() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    capturedImage = canvas.toDataURL('image/png');
    document.getElementById('previewImage').src = capturedImage;
    document.getElementById('previewSection').style.display = 'block';

    await performOCR();
}

async function performOCR() {
    if (!capturedImage) return;

    const progressSection = document.getElementById('progressSection');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const captureBtn = document.getElementById('captureBtn');

    progressSection.style.display = 'block';
    captureBtn.disabled = true;

    try {
        const result = await Tesseract.recognize(capturedImage, 'chi_tra+eng', {
            logger: (m) => {
                if (m.status === 'recognizing text') {
                    const percent = Math.round(m.progress * 100);
                    progressFill.style.width = percent + '%';
                    progressText.textContent = `辨識中... ${percent}%`;
                } else if (m.status === 'loading language traineddata') {
                    progressText.textContent = '載入語言模型...';
                } else {
                    progressText.textContent = '初始化...';
                }
            }
        });

        const text = result.data.text.trim();
        document.getElementById('resultSection').style.display = 'block';
        document.getElementById('resultText').textContent = text || '(未偵測到文字)';
        progressSection.style.display = 'none';

    } catch (error) {
        progressText.textContent = '辨識失敗: ' + error.message;
    }
    captureBtn.disabled = false;
}

init();
