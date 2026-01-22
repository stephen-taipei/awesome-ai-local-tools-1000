/**
 * Video BGM - Tool #390
 * Add background music to videos
 */

let currentLang = 'zh';
let videoFile = null;
let audioFile = null;
let outputBlob = null;
let audioContext = null;

const texts = {
    zh: {
        title: '影片配樂',
        subtitle: '為影片添加背景音樂',
        privacy: '100% 本地處理 · 零資料上傳',
        preview: '👁️ 預覽',
        process: '🎬 合成影片',
        download: '⬇️ 下載',
        uploadVideo: '上傳影片',
        uploadAudio: '上傳音樂',
        videoHint: '支援 MP4, WebM',
        audioHint: '支援 MP3, WAV, OGG',
        originalVolume: '原音音量',
        bgmVolume: '音樂音量',
        audioStart: '音樂起始 (秒)',
        fadeEffect: '淡入淡出',
        processing: '處理中...',
        complete: '處理完成！'
    },
    en: {
        title: 'Video BGM',
        subtitle: 'Add background music to videos',
        privacy: '100% Local Processing · No Data Upload',
        preview: '👁️ Preview',
        process: '🎬 Merge',
        download: '⬇️ Download',
        uploadVideo: 'Upload Video',
        uploadAudio: 'Upload Music',
        videoHint: 'Supports MP4, WebM',
        audioHint: 'Supports MP3, WAV, OGG',
        originalVolume: 'Original Volume',
        bgmVolume: 'BGM Volume',
        audioStart: 'Music Start (sec)',
        fadeEffect: 'Fade In/Out',
        processing: 'Processing...',
        complete: 'Complete!'
    }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    setupFileUpload();
    document.getElementById('previewBtn').addEventListener('click', previewCombined);
    document.getElementById('processBtn').addEventListener('click', processVideo);
    document.getElementById('downloadBtn').addEventListener('click', downloadResult);

    document.getElementById('originalVolume').addEventListener('input', (e) => {
        document.getElementById('originalVolumeValue').textContent = Math.round(e.target.value * 100) + '%';
    });
    document.getElementById('bgmVolume').addEventListener('input', (e) => {
        document.getElementById('bgmVolumeValue').textContent = Math.round(e.target.value * 100) + '%';
    });
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');
    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.getElementById('previewBtn').textContent = t.preview;
    document.getElementById('processBtn').textContent = t.process;
    document.getElementById('downloadBtn').textContent = t.download;
}

function setupFileUpload() {
    const videoUploadArea = document.getElementById('videoUploadArea');
    const audioUploadArea = document.getElementById('audioUploadArea');
    const videoInput = document.getElementById('videoInput');
    const audioInput = document.getElementById('audioInput');

    videoUploadArea.addEventListener('click', () => videoInput.click());
    videoUploadArea.addEventListener('dragover', (e) => e.preventDefault());
    videoUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        if (e.dataTransfer.files.length) handleVideoFile(e.dataTransfer.files[0]);
    });
    videoInput.addEventListener('change', (e) => { if (e.target.files.length) handleVideoFile(e.target.files[0]); });

    audioUploadArea.addEventListener('click', () => audioInput.click());
    audioUploadArea.addEventListener('dragover', (e) => e.preventDefault());
    audioUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        if (e.dataTransfer.files.length) handleAudioFile(e.dataTransfer.files[0]);
    });
    audioInput.addEventListener('change', (e) => { if (e.target.files.length) handleAudioFile(e.target.files[0]); });
}

function handleVideoFile(file) {
    videoFile = file;
    document.getElementById('videoUploadArea').classList.add('uploaded');
    document.getElementById('videoUploadArea').innerHTML = `<div class="upload-icon">✅</div><p>${file.name}</p>`;

    checkFilesReady();
}

function handleAudioFile(file) {
    audioFile = file;
    document.getElementById('audioUploadArea').classList.add('uploaded');
    document.getElementById('audioUploadArea').innerHTML = `<div class="upload-icon">✅</div><p>${file.name}</p>`;

    checkFilesReady();
}

function checkFilesReady() {
    if (videoFile && audioFile) {
        document.getElementById('editorContent').style.display = 'block';

        const video = document.getElementById('inputVideo');
        video.src = URL.createObjectURL(videoFile);
        document.getElementById('videoInfo').textContent = `影片: ${videoFile.name} (${(videoFile.size / 1024 / 1024).toFixed(2)} MB)`;

        const audio = document.getElementById('inputAudio');
        audio.src = URL.createObjectURL(audioFile);
        document.getElementById('audioInfo').textContent = `音樂: ${audioFile.name} (${(audioFile.size / 1024 / 1024).toFixed(2)} MB)`;
    }
}

function previewCombined() {
    const video = document.getElementById('inputVideo');
    const audio = document.getElementById('inputAudio');
    const originalVolume = parseFloat(document.getElementById('originalVolume').value);
    const bgmVolume = parseFloat(document.getElementById('bgmVolume').value);
    const audioStart = parseFloat(document.getElementById('audioStart').value);

    video.volume = originalVolume;
    audio.volume = bgmVolume;
    audio.currentTime = audioStart;

    video.play();
    audio.play();

    video.onended = () => {
        audio.pause();
    };
}

async function processVideo() {
    const t = texts[currentLang];
    const processBtn = document.getElementById('processBtn');
    processBtn.disabled = true;

    document.getElementById('progressSection').style.display = 'block';

    const video = document.getElementById('inputVideo');
    const originalVolume = parseFloat(document.getElementById('originalVolume').value);
    const bgmVolume = parseFloat(document.getElementById('bgmVolume').value);
    const audioStart = parseFloat(document.getElementById('audioStart').value);
    const fadeEffect = document.getElementById('fadeEffect').checked;

    // Create audio context
    audioContext = new AudioContext();

    // Create canvas for video
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');

    // Load BGM
    const bgmArrayBuffer = await audioFile.arrayBuffer();
    const bgmBuffer = await audioContext.decodeAudioData(bgmArrayBuffer);

    await video.play();
    video.pause();
    video.currentTime = 0;

    const duration = video.duration;
    const fps = 30;

    // Create output stream
    const canvasStream = canvas.captureStream(fps);
    const destination = audioContext.createMediaStreamDestination();

    // Video audio source
    const videoSource = audioContext.createMediaElementSource(video);
    const videoGain = audioContext.createGain();
    videoGain.gain.value = originalVolume;
    videoSource.connect(videoGain);
    videoGain.connect(destination);
    videoGain.connect(audioContext.destination);

    // BGM source
    const bgmSource = audioContext.createBufferSource();
    bgmSource.buffer = bgmBuffer;
    const bgmGain = audioContext.createGain();
    bgmGain.gain.value = bgmVolume;

    // Apply fade effect
    if (fadeEffect) {
        bgmGain.gain.setValueAtTime(0, audioContext.currentTime);
        bgmGain.gain.linearRampToValueAtTime(bgmVolume, audioContext.currentTime + 2);
        bgmGain.gain.setValueAtTime(bgmVolume, audioContext.currentTime + duration - 2);
        bgmGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);
    }

    bgmSource.connect(bgmGain);
    bgmGain.connect(destination);

    // Combine streams
    const combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...destination.stream.getAudioTracks()
    ]);

    const outputRecorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm' });
    const chunks = [];
    outputRecorder.ondataavailable = (e) => chunks.push(e.data);
    outputRecorder.onstop = () => {
        outputBlob = new Blob(chunks, { type: 'video/webm' });
        document.getElementById('downloadBtn').disabled = false;
        document.getElementById('progressText').textContent = t.complete;
        processBtn.disabled = false;
        processBtn.textContent = t.process;
    };

    outputRecorder.start();

    // Start playback
    video.play();
    bgmSource.start(audioContext.currentTime, audioStart);

    // Render frames
    function renderFrame() {
        if (video.paused || video.ended) {
            outputRecorder.stop();
            bgmSource.stop();
            video.pause();
            document.getElementById('progressSection').style.display = 'none';
            return;
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const progress = (video.currentTime / duration) * 100;
        document.getElementById('progressFill').style.width = progress + '%';
        document.getElementById('progressText').textContent = `${t.processing} ${Math.round(progress)}%`;

        requestAnimationFrame(renderFrame);
    }

    renderFrame();
}

function downloadResult() {
    if (!outputBlob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(outputBlob);
    a.download = 'video-with-bgm.webm';
    a.click();
}

init();
