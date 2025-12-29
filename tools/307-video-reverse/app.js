/**
 * Video Reverse - Tool #307
 * Play videos backwards
 */

const translations = {
    en: {
        title: 'Video Reverse',
        subtitle: 'Play your videos backwards for creative effects',
        privacyBadge: '100% Local Processing - No Upload Required',
        uploadText: 'Drop video here or click to upload',
        uploadHint: 'Supports MP4, WebM, MOV formats',
        reverseAudio: 'Reverse Audio',
        keepOriginalAudio: 'Keep Original Audio',
        muteAudio: 'Mute Audio',
        videoDuration: 'Duration:',
        totalFrames: 'Total Frames:',
        reverse: 'Reverse Video',
        reset: 'Upload New Video',
        extractingFrames: 'Extracting frames...',
        reversingFrames: 'Reversing frames...',
        encodingVideo: 'Encoding video...',
        download: 'Download Reversed Video',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #307'
    },
    zh: {
        title: '影片倒轉',
        subtitle: '將影片倒放以創造獨特效果',
        privacyBadge: '100% 本地處理 - 無需上傳',
        uploadText: '拖放影片到此處或點擊上傳',
        uploadHint: '支援 MP4、WebM、MOV 格式',
        reverseAudio: '倒轉音訊',
        keepOriginalAudio: '保留原始音訊',
        muteAudio: '靜音',
        videoDuration: '時長：',
        totalFrames: '總幀數：',
        reverse: '倒轉影片',
        reset: '上傳新影片',
        extractingFrames: '提取幀中...',
        reversingFrames: '倒轉幀中...',
        encodingVideo: '編碼影片中...',
        download: '下載倒轉後的影片',
        backToHome: '返回首頁',
        toolNumber: '工具 #307'
    }
};

let currentLang = 'en';
let videoFile = null;

const elements = {
    uploadArea: document.getElementById('uploadArea'),
    videoInput: document.getElementById('videoInput'),
    editorArea: document.getElementById('editorArea'),
    videoPlayer: document.getElementById('videoPlayer'),
    reverseAudio: document.getElementById('reverseAudio'),
    keepOriginalAudio: document.getElementById('keepOriginalAudio'),
    muteAudio: document.getElementById('muteAudio'),
    videoDuration: document.getElementById('videoDuration'),
    totalFrames: document.getElementById('totalFrames'),
    reverseBtn: document.getElementById('reverseBtn'),
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

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function t(key) {
    return translations[currentLang][key] || key;
}

async function reverseVideo() {
    elements.progressContainer.style.display = 'block';
    elements.progressText.textContent = t('extractingFrames');
    elements.progressFill.style.width = '0%';

    const video = elements.videoPlayer;
    const canvas = document.getElementById('processingCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const fps = 30;
    const duration = video.duration;
    const frameCount = Math.floor(duration * fps);
    const frames = [];

    // Extract frames
    for (let i = 0; i < frameCount; i++) {
        video.currentTime = i / fps;
        await new Promise(resolve => video.onseeked = resolve);

        ctx.drawImage(video, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        frames.push(imageData);

        elements.progressFill.style.width = `${(i / frameCount) * 50}%`;
    }

    elements.progressText.textContent = t('encodingVideo');

    // Create reversed video
    const stream = canvas.captureStream(fps);
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
            a.download = `reversed-video-${Date.now()}.webm`;
            a.click();
        };
    };

    mediaRecorder.start();

    // Play frames in reverse
    let frameIndex = frames.length - 1;
    const playFrame = () => {
        if (frameIndex < 0) {
            mediaRecorder.stop();
            return;
        }

        ctx.putImageData(frames[frameIndex], 0, 0);
        frameIndex--;

        elements.progressFill.style.width = `${50 + ((frames.length - frameIndex) / frames.length) * 50}%`;

        setTimeout(playFrame, 1000 / fps);
    };

    playFrame();
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
        elements.uploadArea.style.borderColor = '#fff';
    });

    elements.uploadArea.addEventListener('dragleave', () => {
        elements.uploadArea.style.borderColor = 'rgba(255,255,255,0.4)';
    });

    elements.uploadArea.addEventListener('drop', e => {
        e.preventDefault();
        elements.uploadArea.style.borderColor = 'rgba(255,255,255,0.4)';
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

            const duration = elements.videoPlayer.duration;
            elements.videoDuration.textContent = formatTime(duration);
            elements.totalFrames.textContent = Math.floor(duration * 30);
        };
    }

    // Mutually exclusive checkboxes
    elements.reverseAudio.addEventListener('change', () => {
        if (elements.reverseAudio.checked) {
            elements.keepOriginalAudio.checked = false;
            elements.muteAudio.checked = false;
        }
    });

    elements.keepOriginalAudio.addEventListener('change', () => {
        if (elements.keepOriginalAudio.checked) {
            elements.reverseAudio.checked = false;
            elements.muteAudio.checked = false;
        }
    });

    elements.muteAudio.addEventListener('change', () => {
        if (elements.muteAudio.checked) {
            elements.reverseAudio.checked = false;
            elements.keepOriginalAudio.checked = false;
        }
    });

    elements.reverseBtn.addEventListener('click', reverseVideo);
    elements.resetBtn.addEventListener('click', resetEditor);

    setLanguage('en');
}

init();
