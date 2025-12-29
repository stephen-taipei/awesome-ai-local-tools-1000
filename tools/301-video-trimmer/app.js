/**
 * Video Trimmer - Tool #301
 * Trim videos locally in the browser using MediaRecorder API
 */

const translations = {
    en: {
        title: 'Video Trimmer',
        subtitle: 'Trim and cut your videos locally in the browser',
        privacyBadge: '100% Local Processing - No Upload Required',
        uploadText: 'Drop video here or click to upload',
        uploadHint: 'Supports MP4, WebM, MOV, AVI',
        startLabel: 'Start Time:',
        endLabel: 'End Time:',
        preview: 'Preview Selection',
        trim: 'Trim Video',
        reset: 'Upload New Video',
        processing: 'Processing...',
        download: 'Download Trimmed Video',
        howItWorks: 'How It Works',
        step1Title: 'Upload Video',
        step1Desc: 'Select or drag a video file to the upload area',
        step2Title: 'Select Range',
        step2Desc: 'Drag the handles or enter precise times to select the portion to keep',
        step3Title: 'Export',
        step3Desc: 'Process and download the trimmed video',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #301'
    },
    zh: {
        title: '影片裁剪工具',
        subtitle: '在瀏覽器中本地裁剪您的影片',
        privacyBadge: '100% 本地處理 - 無需上傳',
        uploadText: '拖放影片到此處或點擊上傳',
        uploadHint: '支援 MP4、WebM、MOV、AVI',
        startLabel: '開始時間：',
        endLabel: '結束時間：',
        preview: '預覽選擇',
        trim: '裁剪影片',
        reset: '上傳新影片',
        processing: '處理中...',
        download: '下載裁剪後的影片',
        howItWorks: '使用方法',
        step1Title: '上傳影片',
        step1Desc: '選擇或拖放影片檔案到上傳區域',
        step2Title: '選擇範圍',
        step2Desc: '拖動滑塊或輸入精確時間來選擇要保留的部分',
        step3Title: '匯出',
        step3Desc: '處理並下載裁剪後的影片',
        backToHome: '返回首頁',
        toolNumber: '工具 #301'
    }
};

let currentLang = 'en';
let videoFile = null;
let videoDuration = 0;
let trimStart = 0;
let trimEnd = 0;
let isDragging = null;

const elements = {
    uploadArea: document.getElementById('uploadArea'),
    videoInput: document.getElementById('videoInput'),
    editorArea: document.getElementById('editorArea'),
    videoPlayer: document.getElementById('videoPlayer'),
    timeline: document.getElementById('timeline'),
    trimLeft: document.getElementById('trimLeft'),
    trimRight: document.getElementById('trimRight'),
    trimRegion: document.getElementById('trimRegion'),
    playhead: document.getElementById('playhead'),
    startTime: document.getElementById('startTime'),
    endTime: document.getElementById('endTime'),
    duration: document.getElementById('duration'),
    startInput: document.getElementById('startInput'),
    endInput: document.getElementById('endInput'),
    previewBtn: document.getElementById('previewBtn'),
    trimBtn: document.getElementById('trimBtn'),
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
    const ms = Math.floor((seconds % 1) * 1000);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

function parseTime(timeStr) {
    const parts = timeStr.split(':');
    if (parts.length === 2) {
        const mins = parseFloat(parts[0]) || 0;
        const secs = parseFloat(parts[1]) || 0;
        return mins * 60 + secs;
    }
    return parseFloat(timeStr) || 0;
}

function updateTimeline() {
    const leftPercent = (trimStart / videoDuration) * 100;
    const rightPercent = (trimEnd / videoDuration) * 100;

    elements.trimLeft.style.left = `${leftPercent}%`;
    elements.trimRight.style.left = `${rightPercent}%`;
    elements.trimRegion.style.left = `${leftPercent}%`;
    elements.trimRegion.style.width = `${rightPercent - leftPercent}%`;

    elements.startTime.textContent = formatTime(trimStart);
    elements.endTime.textContent = formatTime(trimEnd);
    elements.duration.textContent = `Duration: ${formatTime(trimEnd - trimStart)}`;

    elements.startInput.value = formatTime(trimStart);
    elements.endInput.value = formatTime(trimEnd);
}

function updatePlayhead() {
    const percent = (elements.videoPlayer.currentTime / videoDuration) * 100;
    elements.playhead.style.left = `${percent}%`;
}

function handleVideoLoad() {
    videoDuration = elements.videoPlayer.duration;
    trimStart = 0;
    trimEnd = videoDuration;
    updateTimeline();

    elements.uploadArea.style.display = 'none';
    elements.editorArea.style.display = 'flex';
    elements.downloadArea.style.display = 'none';
}

function handleTimelineClick(e) {
    const rect = elements.timeline.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const time = percent * videoDuration;
    elements.videoPlayer.currentTime = Math.max(0, Math.min(time, videoDuration));
}

function startDrag(handle) {
    isDragging = handle;
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', stopDrag);
}

function handleDrag(e) {
    if (!isDragging) return;

    const rect = elements.timeline.getBoundingClientRect();
    let percent = (e.clientX - rect.left) / rect.width;
    percent = Math.max(0, Math.min(1, percent));
    const time = percent * videoDuration;

    if (isDragging === 'left') {
        trimStart = Math.min(time, trimEnd - 0.1);
    } else if (isDragging === 'right') {
        trimEnd = Math.max(time, trimStart + 0.1);
    }

    updateTimeline();
}

function stopDrag() {
    isDragging = null;
    document.removeEventListener('mousemove', handleDrag);
    document.removeEventListener('mouseup', stopDrag);
}

function previewSelection() {
    elements.videoPlayer.currentTime = trimStart;
    elements.videoPlayer.play();

    const checkTime = () => {
        if (elements.videoPlayer.currentTime >= trimEnd) {
            elements.videoPlayer.pause();
            elements.videoPlayer.currentTime = trimStart;
        } else if (!elements.videoPlayer.paused) {
            requestAnimationFrame(checkTime);
        }
    };
    checkTime();
}

async function trimVideo() {
    elements.progressContainer.style.display = 'block';
    elements.progressFill.style.width = '0%';

    const video = elements.videoPlayer;
    const canvas = document.getElementById('processingCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const stream = canvas.captureStream(30);

    // Add audio if available
    try {
        const audioCtx = new AudioContext();
        const source = audioCtx.createMediaElementSource(video);
        const dest = audioCtx.createMediaStreamDestination();
        source.connect(dest);
        source.connect(audioCtx.destination);
        stream.addTrack(dest.stream.getAudioTracks()[0]);
    } catch (e) {
        console.log('No audio track or audio capture not supported');
    }

    const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
    });

    const chunks = [];

    mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
            chunks.push(e.data);
        }
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
            a.download = `trimmed-video-${Date.now()}.webm`;
            a.click();
        };
    };

    video.currentTime = trimStart;
    await new Promise(resolve => video.onseeked = resolve);

    mediaRecorder.start();
    video.play();

    const renderFrame = () => {
        if (video.currentTime >= trimEnd || video.paused) {
            video.pause();
            mediaRecorder.stop();
            return;
        }

        ctx.drawImage(video, 0, 0);
        const progress = (video.currentTime - trimStart) / (trimEnd - trimStart) * 100;
        elements.progressFill.style.width = `${progress}%`;

        requestAnimationFrame(renderFrame);
    };

    renderFrame();
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

    elements.uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.uploadArea.style.borderColor = '#e94560';
    });

    elements.uploadArea.addEventListener('dragleave', () => {
        elements.uploadArea.style.borderColor = 'rgba(255,255,255,0.3)';
    });

    elements.uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.uploadArea.style.borderColor = 'rgba(255,255,255,0.3)';
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('video/')) {
            loadVideo(file);
        }
    });

    elements.videoInput.addEventListener('change', (e) => {
        if (e.target.files[0]) {
            loadVideo(e.target.files[0]);
        }
    });

    function loadVideo(file) {
        videoFile = file;
        const url = URL.createObjectURL(file);
        elements.videoPlayer.src = url;
        elements.videoPlayer.onloadedmetadata = handleVideoLoad;
    }

    elements.videoPlayer.addEventListener('timeupdate', updatePlayhead);

    elements.timeline.addEventListener('click', handleTimelineClick);
    elements.trimLeft.addEventListener('mousedown', () => startDrag('left'));
    elements.trimRight.addEventListener('mousedown', () => startDrag('right'));

    elements.startInput.addEventListener('change', () => {
        trimStart = Math.max(0, Math.min(parseTime(elements.startInput.value), trimEnd - 0.1));
        updateTimeline();
    });

    elements.endInput.addEventListener('change', () => {
        trimEnd = Math.max(trimStart + 0.1, Math.min(parseTime(elements.endInput.value), videoDuration));
        updateTimeline();
    });

    elements.previewBtn.addEventListener('click', previewSelection);
    elements.trimBtn.addEventListener('click', trimVideo);
    elements.resetBtn.addEventListener('click', resetEditor);

    setLanguage('en');
}

init();
