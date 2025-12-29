/**
 * Rotate & Flip Video - Tool #305
 * Rotate, flip, and mirror videos
 */

const translations = {
    en: {
        title: 'Rotate & Flip Video',
        subtitle: 'Rotate, flip, and mirror your videos easily',
        privacyBadge: '100% Local Processing - No Upload Required',
        uploadText: 'Drop video here or click to upload',
        uploadHint: 'Supports MP4, WebM, MOV formats',
        rotate: 'Rotate',
        rotateLeft: '90° Left',
        rotateRight: '90° Right',
        rotate180: '180°',
        customAngle: 'Custom Angle:',
        flip: 'Flip',
        flipHorizontal: 'Horizontal',
        flipVertical: 'Vertical',
        currentTransform: 'Current Transform:',
        resetTransform: 'Reset Transform',
        apply: 'Apply Changes',
        reset: 'Upload New Video',
        processing: 'Processing...',
        download: 'Download Video',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #305'
    },
    zh: {
        title: '影片旋轉翻轉',
        subtitle: '輕鬆旋轉、翻轉和鏡像您的影片',
        privacyBadge: '100% 本地處理 - 無需上傳',
        uploadText: '拖放影片到此處或點擊上傳',
        uploadHint: '支援 MP4、WebM、MOV 格式',
        rotate: '旋轉',
        rotateLeft: '左轉 90°',
        rotateRight: '右轉 90°',
        rotate180: '180°',
        customAngle: '自訂角度：',
        flip: '翻轉',
        flipHorizontal: '水平翻轉',
        flipVertical: '垂直翻轉',
        currentTransform: '當前變換：',
        resetTransform: '重置變換',
        apply: '套用變更',
        reset: '上傳新影片',
        processing: '處理中...',
        download: '下載影片',
        backToHome: '返回首頁',
        toolNumber: '工具 #305'
    }
};

let currentLang = 'en';
let videoFile = null;
let transform = {
    rotation: 0,
    flipH: false,
    flipV: false
};

const elements = {
    uploadArea: document.getElementById('uploadArea'),
    videoInput: document.getElementById('videoInput'),
    editorArea: document.getElementById('editorArea'),
    videoPlayer: document.getElementById('videoPlayer'),
    videoWrapper: document.getElementById('videoWrapper'),
    rotateSlider: document.getElementById('rotateSlider'),
    rotateValue: document.getElementById('rotateValue'),
    transformInfo: document.getElementById('transformInfo'),
    resetTransformBtn: document.getElementById('resetTransformBtn'),
    applyBtn: document.getElementById('applyBtn'),
    resetBtn: document.getElementById('resetBtn'),
    progressContainer: document.getElementById('progressContainer'),
    progressFill: document.getElementById('progressFill'),
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

function updatePreview() {
    const scaleX = transform.flipH ? -1 : 1;
    const scaleY = transform.flipV ? -1 : 1;
    elements.videoWrapper.style.transform =
        `rotate(${transform.rotation}deg) scale(${scaleX}, ${scaleY})`;

    let info = [];
    if (transform.rotation !== 0) info.push(`Rotate: ${transform.rotation}°`);
    if (transform.flipH) info.push('Flip H');
    if (transform.flipV) info.push('Flip V');
    elements.transformInfo.textContent = info.length ? info.join(', ') : 'None';
}

function rotateBy(degrees) {
    transform.rotation = (transform.rotation + degrees + 360) % 360;
    elements.rotateSlider.value = transform.rotation;
    elements.rotateValue.textContent = `${transform.rotation}°`;
    updatePreview();
}

function toggleFlipH() {
    transform.flipH = !transform.flipH;
    document.getElementById('flipH').classList.toggle('active', transform.flipH);
    updatePreview();
}

function toggleFlipV() {
    transform.flipV = !transform.flipV;
    document.getElementById('flipV').classList.toggle('active', transform.flipV);
    updatePreview();
}

function resetTransform() {
    transform = { rotation: 0, flipH: false, flipV: false };
    elements.rotateSlider.value = 0;
    elements.rotateValue.textContent = '0°';
    document.getElementById('flipH').classList.remove('active');
    document.getElementById('flipV').classList.remove('active');
    updatePreview();
}

async function applyChanges() {
    elements.progressContainer.style.display = 'block';
    elements.progressFill.style.width = '0%';

    const video = elements.videoPlayer;
    const canvas = document.getElementById('processingCanvas');
    const ctx = canvas.getContext('2d');

    // Calculate output dimensions
    const radians = (transform.rotation * Math.PI) / 180;
    const cos = Math.abs(Math.cos(radians));
    const sin = Math.abs(Math.sin(radians));

    if (transform.rotation === 90 || transform.rotation === 270) {
        canvas.width = video.videoHeight;
        canvas.height = video.videoWidth;
    } else {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
    }

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
            a.download = `rotated-video-${Date.now()}.webm`;
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

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((transform.rotation * Math.PI) / 180);
        ctx.scale(transform.flipH ? -1 : 1, transform.flipV ? -1 : 1);
        ctx.drawImage(video, -video.videoWidth / 2, -video.videoHeight / 2);
        ctx.restore();

        const progress = (video.currentTime / video.duration) * 100;
        elements.progressFill.style.width = `${progress}%`;

        requestAnimationFrame(render);
    };

    render();

    video.onended = () => mediaRecorder.stop();
}

function resetEditor() {
    elements.uploadArea.style.display = 'block';
    elements.editorArea.style.display = 'none';
    elements.downloadArea.style.display = 'none';
    elements.videoInput.value = '';
    videoFile = null;
    resetTransform();
}

function init() {
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));
    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh'));

    elements.uploadArea.addEventListener('click', () => elements.videoInput.click());

    elements.uploadArea.addEventListener('dragover', e => {
        e.preventDefault();
        elements.uploadArea.style.borderColor = '#71b280';
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
            resetTransform();
        };
    }

    document.getElementById('rotateLeft').addEventListener('click', () => rotateBy(-90));
    document.getElementById('rotateRight').addEventListener('click', () => rotateBy(90));
    document.getElementById('rotate180').addEventListener('click', () => rotateBy(180));
    document.getElementById('flipH').addEventListener('click', toggleFlipH);
    document.getElementById('flipV').addEventListener('click', toggleFlipV);

    elements.rotateSlider.addEventListener('input', e => {
        transform.rotation = parseInt(e.target.value);
        elements.rotateValue.textContent = `${transform.rotation}°`;
        updatePreview();
    });

    elements.resetTransformBtn.addEventListener('click', resetTransform);
    elements.applyBtn.addEventListener('click', applyChanges);
    elements.resetBtn.addEventListener('click', resetEditor);

    setLanguage('en');
}

init();
