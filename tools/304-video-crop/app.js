/**
 * Video Crop - Tool #304
 * Crop and resize videos with precision
 */

const translations = {
    en: {
        title: 'Video Crop',
        subtitle: 'Crop and resize your videos with precision',
        privacyBadge: '100% Local Processing - No Upload Required',
        uploadText: 'Drop video here or click to upload',
        uploadHint: 'Supports MP4, WebM, MOV formats',
        aspectRatio: 'Aspect Ratio:',
        free: 'Free',
        width: 'Width:',
        height: 'Height:',
        posX: 'X:',
        posY: 'Y:',
        preview: 'Preview',
        crop: 'Crop Video',
        reset: 'Upload New Video',
        processing: 'Processing...',
        download: 'Download Cropped Video',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #304'
    },
    zh: {
        title: '影片裁切工具',
        subtitle: '精確裁切和調整影片尺寸',
        privacyBadge: '100% 本地處理 - 無需上傳',
        uploadText: '拖放影片到此處或點擊上傳',
        uploadHint: '支援 MP4、WebM、MOV 格式',
        aspectRatio: '長寬比：',
        free: '自由',
        width: '寬度：',
        height: '高度：',
        posX: 'X：',
        posY: 'Y：',
        preview: '預覽',
        crop: '裁切影片',
        reset: '上傳新影片',
        processing: '處理中...',
        download: '下載裁切後的影片',
        backToHome: '返回首頁',
        toolNumber: '工具 #304'
    }
};

let currentLang = 'en';
let videoFile = null;
let cropBox = { x: 0, y: 0, width: 100, height: 100 };
let aspectRatio = null;
let isDragging = false;
let dragHandle = null;
let dragStart = { x: 0, y: 0 };
let videoRect = null;
let scale = 1;

const elements = {
    uploadArea: document.getElementById('uploadArea'),
    videoInput: document.getElementById('videoInput'),
    editorArea: document.getElementById('editorArea'),
    videoPlayer: document.getElementById('videoPlayer'),
    cropOverlay: document.getElementById('cropOverlay'),
    cropBoxEl: document.getElementById('cropBox'),
    cropWidth: document.getElementById('cropWidth'),
    cropHeight: document.getElementById('cropHeight'),
    cropX: document.getElementById('cropX'),
    cropY: document.getElementById('cropY'),
    previewBtn: document.getElementById('previewBtn'),
    cropBtn: document.getElementById('cropBtn'),
    resetBtn: document.getElementById('resetBtn'),
    progressContainer: document.getElementById('progressContainer'),
    progressFill: document.getElementById('progressFill'),
    progressText: document.getElementById('progressText'),
    downloadArea: document.getElementById('downloadArea'),
    resultVideo: document.getElementById('resultVideo'),
    downloadBtn: document.getElementById('downloadBtn')
};

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');
}

function updateCropBox() {
    elements.cropBoxEl.style.left = `${cropBox.x * scale}px`;
    elements.cropBoxEl.style.top = `${cropBox.y * scale}px`;
    elements.cropBoxEl.style.width = `${cropBox.width * scale}px`;
    elements.cropBoxEl.style.height = `${cropBox.height * scale}px`;

    elements.cropWidth.value = Math.round(cropBox.width);
    elements.cropHeight.value = Math.round(cropBox.height);
    elements.cropX.value = Math.round(cropBox.x);
    elements.cropY.value = Math.round(cropBox.y);
}

function constrainCropBox() {
    const video = elements.videoPlayer;
    cropBox.x = Math.max(0, Math.min(cropBox.x, video.videoWidth - cropBox.width));
    cropBox.y = Math.max(0, Math.min(cropBox.y, video.videoHeight - cropBox.height));
    cropBox.width = Math.max(20, Math.min(cropBox.width, video.videoWidth - cropBox.x));
    cropBox.height = Math.max(20, Math.min(cropBox.height, video.videoHeight - cropBox.y));
}

function handleMouseDown(e) {
    const handle = e.target.dataset.handle;
    if (handle || e.target === elements.cropBoxEl) {
        isDragging = true;
        dragHandle = handle || 'move';
        dragStart = { x: e.clientX, y: e.clientY };
        e.preventDefault();
    }
}

function handleMouseMove(e) {
    if (!isDragging) return;

    const dx = (e.clientX - dragStart.x) / scale;
    const dy = (e.clientY - dragStart.y) / scale;

    if (dragHandle === 'move') {
        cropBox.x += dx;
        cropBox.y += dy;
    } else {
        if (dragHandle.includes('w')) {
            cropBox.x += dx;
            cropBox.width -= dx;
        }
        if (dragHandle.includes('e')) {
            cropBox.width += dx;
        }
        if (dragHandle.includes('n')) {
            cropBox.y += dy;
            cropBox.height -= dy;
        }
        if (dragHandle.includes('s')) {
            cropBox.height += dy;
        }

        if (aspectRatio) {
            if (dragHandle.includes('e') || dragHandle.includes('w')) {
                cropBox.height = cropBox.width / aspectRatio;
            } else {
                cropBox.width = cropBox.height * aspectRatio;
            }
        }
    }

    dragStart = { x: e.clientX, y: e.clientY };
    constrainCropBox();
    updateCropBox();
}

function handleMouseUp() {
    isDragging = false;
    dragHandle = null;
}

function setAspectRatio(ratio) {
    document.querySelectorAll('.ratio-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    if (ratio === 'free') {
        aspectRatio = null;
    } else {
        const [w, h] = ratio.split(':').map(Number);
        aspectRatio = w / h;
        cropBox.height = cropBox.width / aspectRatio;
        constrainCropBox();
        updateCropBox();
    }
}

async function cropVideo() {
    elements.progressContainer.style.display = 'block';
    elements.progressFill.style.width = '0%';

    const video = elements.videoPlayer;
    const canvas = document.getElementById('processingCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = Math.round(cropBox.width);
    canvas.height = Math.round(cropBox.height);

    const stream = canvas.captureStream(30);
    const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
    });

    const chunks = [];
    mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        elements.resultVideo.src = url;
        elements.downloadArea.style.display = 'block';
        elements.progressContainer.style.display = 'none';

        elements.downloadBtn.onclick = () => {
            const a = document.createElement('a');
            a.href = url;
            a.download = `cropped-video-${Date.now()}.webm`;
            a.click();
        };
    };

    video.currentTime = 0;
    await new Promise(resolve => video.onseeked = resolve);

    mediaRecorder.start();
    video.play();

    const render = () => {
        if (video.ended || video.paused) {
            mediaRecorder.stop();
            return;
        }

        ctx.drawImage(
            video,
            cropBox.x, cropBox.y, cropBox.width, cropBox.height,
            0, 0, canvas.width, canvas.height
        );

        const progress = (video.currentTime / video.duration) * 100;
        elements.progressFill.style.width = `${progress}%`;

        requestAnimationFrame(render);
    };

    render();

    video.onended = () => {
        mediaRecorder.stop();
    };
}

function resetEditor() {
    elements.uploadArea.style.display = 'block';
    elements.editorArea.style.display = 'none';
    elements.downloadArea.style.display = 'none';
    elements.videoInput.value = '';
    videoFile = null;
}

function init() {
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));
    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh'));

    elements.uploadArea.addEventListener('click', () => elements.videoInput.click());

    elements.uploadArea.addEventListener('dragover', e => {
        e.preventDefault();
        elements.uploadArea.style.borderColor = '#3498db';
    });

    elements.uploadArea.addEventListener('dragleave', () => {
        elements.uploadArea.style.borderColor = 'rgba(255,255,255,0.3)';
    });

    elements.uploadArea.addEventListener('drop', e => {
        e.preventDefault();
        elements.uploadArea.style.borderColor = 'rgba(255,255,255,0.3)';
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('video/')) {
            loadVideo(file);
        }
    });

    elements.videoInput.addEventListener('change', e => {
        if (e.target.files[0]) loadVideo(e.target.files[0]);
    });

    function loadVideo(file) {
        videoFile = file;
        const url = URL.createObjectURL(file);
        elements.videoPlayer.src = url;
        elements.videoPlayer.onloadedmetadata = () => {
            elements.uploadArea.style.display = 'none';
            elements.editorArea.style.display = 'flex';
            elements.downloadArea.style.display = 'none';

            const video = elements.videoPlayer;
            videoRect = video.getBoundingClientRect();
            scale = videoRect.width / video.videoWidth;

            cropBox = {
                x: 0,
                y: 0,
                width: video.videoWidth,
                height: video.videoHeight
            };
            updateCropBox();
        };
    }

    elements.cropBoxEl.addEventListener('mousedown', handleMouseDown);
    document.querySelectorAll('.crop-handle').forEach(handle => {
        handle.addEventListener('mousedown', handleMouseDown);
    });
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    document.querySelectorAll('.ratio-btn').forEach(btn => {
        btn.addEventListener('click', () => setAspectRatio(btn.dataset.ratio));
    });

    elements.cropWidth.addEventListener('change', () => {
        cropBox.width = parseInt(elements.cropWidth.value) || 100;
        if (aspectRatio) cropBox.height = cropBox.width / aspectRatio;
        constrainCropBox();
        updateCropBox();
    });

    elements.cropHeight.addEventListener('change', () => {
        cropBox.height = parseInt(elements.cropHeight.value) || 100;
        if (aspectRatio) cropBox.width = cropBox.height * aspectRatio;
        constrainCropBox();
        updateCropBox();
    });

    elements.cropX.addEventListener('change', () => {
        cropBox.x = parseInt(elements.cropX.value) || 0;
        constrainCropBox();
        updateCropBox();
    });

    elements.cropY.addEventListener('change', () => {
        cropBox.y = parseInt(elements.cropY.value) || 0;
        constrainCropBox();
        updateCropBox();
    });

    elements.previewBtn.addEventListener('click', () => {
        elements.videoPlayer.currentTime = 0;
        elements.videoPlayer.play();
    });

    elements.cropBtn.addEventListener('click', cropVideo);
    elements.resetBtn.addEventListener('click', resetEditor);

    setLanguage('en');
}

init();
