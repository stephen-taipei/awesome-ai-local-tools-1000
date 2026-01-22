/**
 * Video Player - Tool #396
 * Advanced video player with playback controls
 */

let currentLang = 'zh';
let videoFile = null;
let isPlaying = false;
let isMuted = false;

const texts = {
    zh: {
        title: '影片播放器',
        subtitle: '進階影片播放器',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '拖放影片檔案至此或點擊上傳',
        uploadHint: '支援 MP4, WebM, MOV, AVI',
        speed: '速度',
        resolution: '解析度',
        frame: '幀',
        buffer: '緩衝'
    },
    en: {
        title: 'Video Player',
        subtitle: 'Advanced video player',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Drop video file here or click to upload',
        uploadHint: 'Supports MP4, WebM, MOV, AVI',
        speed: 'Speed',
        resolution: 'Resolution',
        frame: 'Frame',
        buffer: 'Buffer'
    }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    setupFileUpload();
    setupControls();
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');
    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.getElementById('speedLabel').textContent = t.speed;
    document.getElementById('resolutionLabel').textContent = t.resolution;
    document.getElementById('framerateLabel').textContent = t.frame;
    document.getElementById('bufferLabel').textContent = t.buffer;
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

function setupControls() {
    const video = document.getElementById('videoPlayer');
    const progressBar = document.getElementById('progressBar');
    const volumeBar = document.getElementById('volumeBar');
    const overlay = document.getElementById('videoOverlay');

    // Video events
    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('loadedmetadata', updateInfo);
    video.addEventListener('play', () => {
        isPlaying = true;
        document.getElementById('playPauseBtn').textContent = '⏸';
        overlay.classList.add('hidden');
    });
    video.addEventListener('pause', () => {
        isPlaying = false;
        document.getElementById('playPauseBtn').textContent = '▶';
        overlay.classList.remove('hidden');
    });
    video.addEventListener('progress', updateBuffer);

    // Progress bar
    progressBar.addEventListener('input', (e) => {
        video.currentTime = (e.target.value / 100) * video.duration;
    });

    // Volume
    volumeBar.addEventListener('input', (e) => {
        video.volume = e.target.value;
        updateMuteButton();
    });

    // Control buttons
    document.getElementById('playPauseBtn').addEventListener('click', togglePlay);
    document.getElementById('bigPlayBtn').addEventListener('click', togglePlay);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) togglePlay();
    });
    document.getElementById('stopBtn').addEventListener('click', stopVideo);
    document.getElementById('backwardBtn').addEventListener('click', () => video.currentTime -= 10);
    document.getElementById('forwardBtn').addEventListener('click', () => video.currentTime += 10);
    document.getElementById('muteBtn').addEventListener('click', toggleMute);
    document.getElementById('fullscreenBtn').addEventListener('click', toggleFullscreen);

    // Playback speed
    document.getElementById('playbackSpeed').addEventListener('change', (e) => {
        video.playbackRate = parseFloat(e.target.value);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

        switch (e.key) {
            case ' ':
                e.preventDefault();
                togglePlay();
                break;
            case 'ArrowLeft':
                video.currentTime -= 5;
                break;
            case 'ArrowRight':
                video.currentTime += 5;
                break;
            case 'ArrowUp':
                video.volume = Math.min(1, video.volume + 0.1);
                volumeBar.value = video.volume;
                break;
            case 'ArrowDown':
                video.volume = Math.max(0, video.volume - 0.1);
                volumeBar.value = video.volume;
                break;
            case 'f':
                toggleFullscreen();
                break;
            case 'm':
                toggleMute();
                break;
        }
    });
}

function handleFile(file) {
    videoFile = file;
    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('playerContent').style.display = 'block';

    const video = document.getElementById('videoPlayer');
    video.src = URL.createObjectURL(file);
}

function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    if (h > 0) {
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function updateProgress() {
    const video = document.getElementById('videoPlayer');
    const progress = (video.currentTime / video.duration) * 100;
    document.getElementById('progressBar').value = progress;
    document.getElementById('currentTime').textContent = formatTime(video.currentTime);

    // Estimate current frame (assuming 30fps)
    const frame = Math.floor(video.currentTime * 30);
    document.getElementById('currentFrame').textContent = frame;
}

function updateInfo() {
    const video = document.getElementById('videoPlayer');
    document.getElementById('duration').textContent = formatTime(video.duration);
    document.getElementById('resolution').textContent = `${video.videoWidth}×${video.videoHeight}`;
}

function updateBuffer() {
    const video = document.getElementById('videoPlayer');
    if (video.buffered.length > 0) {
        const buffered = video.buffered.end(video.buffered.length - 1);
        const percent = Math.round((buffered / video.duration) * 100);
        document.getElementById('bufferInfo').textContent = `${percent}%`;
    }
}

function togglePlay() {
    const video = document.getElementById('videoPlayer');
    if (video.paused) {
        video.play();
    } else {
        video.pause();
    }
}

function stopVideo() {
    const video = document.getElementById('videoPlayer');
    video.pause();
    video.currentTime = 0;
}

function toggleMute() {
    const video = document.getElementById('videoPlayer');
    video.muted = !video.muted;
    isMuted = video.muted;
    updateMuteButton();
}

function updateMuteButton() {
    const video = document.getElementById('videoPlayer');
    const btn = document.getElementById('muteBtn');
    if (video.muted || video.volume === 0) {
        btn.textContent = '🔇';
    } else if (video.volume < 0.5) {
        btn.textContent = '🔉';
    } else {
        btn.textContent = '🔊';
    }
}

function toggleFullscreen() {
    const container = document.getElementById('videoContainer');
    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else {
        container.requestFullscreen();
    }
}

init();
