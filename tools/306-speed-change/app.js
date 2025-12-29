/**
 * Video Speed Changer - Tool #306
 * Speed up or slow down videos
 */

const translations = {
    en: {
        title: 'Video Speed Changer',
        subtitle: 'Speed up or slow down your videos with ease',
        privacyBadge: '100% Local Processing - No Upload Required',
        uploadText: 'Drop video here or click to upload',
        uploadHint: 'Supports MP4, WebM, MOV formats',
        playbackSpeed: 'Playback Speed',
        customSpeed: 'Custom Speed:',
        originalDuration: 'Original Duration:',
        newDuration: 'New Duration:',
        preservePitch: 'Preserve Audio Pitch',
        keepAudio: 'Keep Audio',
        preview: 'Preview',
        apply: 'Apply Speed Change',
        reset: 'Upload New Video',
        processing: 'Processing...',
        download: 'Download Video',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #306'
    },
    zh: {
        title: '影片速度調整',
        subtitle: '輕鬆加速或減慢您的影片',
        privacyBadge: '100% 本地處理 - 無需上傳',
        uploadText: '拖放影片到此處或點擊上傳',
        uploadHint: '支援 MP4、WebM、MOV 格式',
        playbackSpeed: '播放速度',
        customSpeed: '自訂速度：',
        originalDuration: '原始時長：',
        newDuration: '新時長：',
        preservePitch: '保持音調',
        keepAudio: '保留音訊',
        preview: '預覽',
        apply: '套用速度變更',
        reset: '上傳新影片',
        processing: '處理中...',
        download: '下載影片',
        backToHome: '返回首頁',
        toolNumber: '工具 #306'
    }
};

let currentLang = 'en';
let videoFile = null;
let playbackSpeed = 1;

const elements = {
    uploadArea: document.getElementById('uploadArea'),
    videoInput: document.getElementById('videoInput'),
    editorArea: document.getElementById('editorArea'),
    videoPlayer: document.getElementById('videoPlayer'),
    speedSlider: document.getElementById('speedSlider'),
    speedValue: document.getElementById('speedValue'),
    originalDuration: document.getElementById('originalDuration'),
    newDuration: document.getElementById('newDuration'),
    preservePitch: document.getElementById('preservePitch'),
    keepAudio: document.getElementById('keepAudio'),
    previewBtn: document.getElementById('previewBtn'),
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

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateSpeed(speed) {
    playbackSpeed = speed;
    elements.speedSlider.value = speed;
    elements.speedValue.textContent = `${speed.toFixed(2)}x`;

    document.querySelectorAll('.speed-btn').forEach(btn => {
        btn.classList.toggle('active', parseFloat(btn.dataset.speed) === speed);
    });

    const duration = elements.videoPlayer.duration;
    if (duration) {
        elements.newDuration.textContent = formatTime(duration / speed);
    }
}

async function applySpeedChange() {
    elements.progressContainer.style.display = 'block';
    elements.progressFill.style.width = '0%';

    const video = elements.videoPlayer;
    const canvas = document.getElementById('processingCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

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
            a.download = `speed-${playbackSpeed}x-${Date.now()}.webm`;
            a.click();
        };
    };

    video.currentTime = 0;
    await new Promise(resolve => video.onseeked = resolve);

    video.playbackRate = playbackSpeed;
    if (elements.preservePitch.checked) {
        video.preservesPitch = true;
    }
    video.muted = !elements.keepAudio.checked;

    mediaRecorder.start();
    video.play();

    const expectedDuration = video.duration / playbackSpeed;

    const render = () => {
        if (video.ended || video.paused) {
            mediaRecorder.stop();
            video.playbackRate = 1;
            return;
        }

        ctx.drawImage(video, 0, 0);

        const progress = (video.currentTime / video.duration) * 100;
        elements.progressFill.style.width = `${progress}%`;

        requestAnimationFrame(render);
    };

    render();

    video.onended = () => {
        mediaRecorder.stop();
        video.playbackRate = 1;
    };
}

function resetEditor() {
    elements.uploadArea.style.display = 'block';
    elements.editorArea.style.display = 'none';
    elements.downloadArea.style.display = 'none';
    elements.videoInput.value = '';
    videoFile = null;
    updateSpeed(1);
}

function init() {
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));
    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh'));

    elements.uploadArea.addEventListener('click', () => elements.videoInput.click());

    elements.uploadArea.addEventListener('dragover', e => {
        e.preventDefault();
        elements.uploadArea.style.borderColor = '#fff';
    });

    elements.uploadArea.addEventListener('dragleave', () => {
        elements.uploadArea.style.borderColor = 'rgba(255,255,255,0.5)';
    });

    elements.uploadArea.addEventListener('drop', e => {
        e.preventDefault();
        elements.uploadArea.style.borderColor = 'rgba(255,255,255,0.5)';
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
            elements.originalDuration.textContent = formatTime(elements.videoPlayer.duration);
            updateSpeed(1);
        };
    }

    document.querySelectorAll('.speed-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            updateSpeed(parseFloat(btn.dataset.speed));
        });
    });

    elements.speedSlider.addEventListener('input', e => {
        updateSpeed(parseFloat(e.target.value));
    });

    elements.previewBtn.addEventListener('click', () => {
        elements.videoPlayer.playbackRate = playbackSpeed;
        elements.videoPlayer.currentTime = 0;
        elements.videoPlayer.play();
    });

    elements.applyBtn.addEventListener('click', applySpeedChange);
    elements.resetBtn.addEventListener('click', resetEditor);

    setLanguage('en');
}

init();
