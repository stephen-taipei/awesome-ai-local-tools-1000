/**
 * Video Voiceover - Tool #389
 * Record and add voiceover to videos
 */

let currentLang = 'zh';
let videoFile = null;
let outputBlob = null;
let mediaRecorder = null;
let audioChunks = [];
let recordedAudioBlob = null;
let isRecording = false;
let recordingStartTime = null;
let recordingTimer = null;

const texts = {
    zh: {
        title: '影片配音',
        subtitle: '錄製並添加配音至影片',
        privacy: '100% 本地處理 · 零資料上傳',
        process: '🎬 合成影片',
        download: '⬇️ 下載',
        upload: '拖放影片檔案至此或點擊上傳',
        uploadHint: '支援 MP4, WebM',
        recordVoiceover: '錄製配音',
        startRecord: '🎙️ 開始錄音',
        stopRecord: '⏹️ 停止錄音',
        clear: '🗑️ 清除',
        originalVolume: '原音音量',
        voiceoverVolume: '配音音量',
        startTime: '配音起始時間',
        processing: '處理中...',
        complete: '處理完成！'
    },
    en: {
        title: 'Video Voiceover',
        subtitle: 'Record and add voiceover to videos',
        privacy: '100% Local Processing · No Data Upload',
        process: '🎬 Merge',
        download: '⬇️ Download',
        upload: 'Drop video file here or click to upload',
        uploadHint: 'Supports MP4, WebM',
        recordVoiceover: 'Record Voiceover',
        startRecord: '🎙️ Start Recording',
        stopRecord: '⏹️ Stop Recording',
        clear: '🗑️ Clear',
        originalVolume: 'Original Volume',
        voiceoverVolume: 'Voiceover Volume',
        startTime: 'Start Time',
        processing: 'Processing...',
        complete: 'Complete!'
    }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    setupFileUpload();
    document.getElementById('recordBtn').addEventListener('click', toggleRecording);
    document.getElementById('clearRecordingBtn').addEventListener('click', clearRecording);
    document.getElementById('processBtn').addEventListener('click', processVideo);
    document.getElementById('downloadBtn').addEventListener('click', downloadResult);

    document.getElementById('originalVolume').addEventListener('input', (e) => {
        document.getElementById('originalVolumeValue').textContent = Math.round(e.target.value * 100) + '%';
    });
    document.getElementById('voiceoverVolume').addEventListener('input', (e) => {
        document.getElementById('voiceoverVolumeValue').textContent = Math.round(e.target.value * 100) + '%';
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
    document.getElementById('processBtn').textContent = t.process;
    document.getElementById('downloadBtn').textContent = t.download;
    document.getElementById('recordBtn').textContent = isRecording ? t.stopRecord : t.startRecord;
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

function handleFile(file) {
    videoFile = file;
    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('editorContent').style.display = 'block';

    const video = document.getElementById('inputVideo');
    video.src = URL.createObjectURL(file);
}

async function toggleRecording() {
    const t = texts[currentLang];
    const recordBtn = document.getElementById('recordBtn');

    if (isRecording) {
        // Stop recording
        mediaRecorder.stop();
        isRecording = false;
        recordBtn.textContent = t.startRecord;
        recordBtn.classList.remove('recording');
        clearInterval(recordingTimer);
    } else {
        // Start recording
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];

            mediaRecorder.ondataavailable = (e) => {
                audioChunks.push(e.data);
            };

            mediaRecorder.onstop = () => {
                recordedAudioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(recordedAudioBlob);
                document.getElementById('recordedAudio').src = audioUrl;
                document.getElementById('audioPreview').style.display = 'flex';
                document.getElementById('processBtn').disabled = false;

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            isRecording = true;
            recordBtn.textContent = t.stopRecord;
            recordBtn.classList.add('recording');
            recordingStartTime = Date.now();

            // Update recording time
            recordingTimer = setInterval(() => {
                const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
                const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
                const secs = (elapsed % 60).toString().padStart(2, '0');
                document.getElementById('recordingTime').textContent = `${mins}:${secs}`;
            }, 1000);

        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('無法存取麥克風，請確保已授權麥克風權限。');
        }
    }
}

function clearRecording() {
    recordedAudioBlob = null;
    document.getElementById('audioPreview').style.display = 'none';
    document.getElementById('recordingTime').textContent = '00:00';
    document.getElementById('processBtn').disabled = true;
}

async function processVideo() {
    if (!recordedAudioBlob) return;

    const t = texts[currentLang];
    const processBtn = document.getElementById('processBtn');
    processBtn.disabled = true;

    document.getElementById('progressSection').style.display = 'block';

    const video = document.getElementById('inputVideo');
    const originalVolume = parseFloat(document.getElementById('originalVolume').value);
    const voiceoverVolume = parseFloat(document.getElementById('voiceoverVolume').value);
    const startTime = parseFloat(document.getElementById('startTime').value);

    // Create audio context for mixing
    const audioContext = new AudioContext();

    // Create canvas for video
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');

    // Load voiceover audio
    const voiceoverBuffer = await audioContext.decodeAudioData(await recordedAudioBlob.arrayBuffer());

    await video.play();
    video.pause();
    video.currentTime = 0;

    const duration = video.duration;
    const fps = 30;
    const totalFrames = Math.floor(duration * fps);

    // Create output stream
    const canvasStream = canvas.captureStream(fps);

    // Create audio nodes
    const destination = audioContext.createMediaStreamDestination();

    // Add video's audio
    const videoSource = audioContext.createMediaElementSource(video);
    const videoGain = audioContext.createGain();
    videoGain.gain.value = originalVolume;
    videoSource.connect(videoGain);
    videoGain.connect(destination);
    videoGain.connect(audioContext.destination);

    // Add voiceover
    const voiceoverSource = audioContext.createBufferSource();
    voiceoverSource.buffer = voiceoverBuffer;
    const voiceoverGain = audioContext.createGain();
    voiceoverGain.gain.value = voiceoverVolume;
    voiceoverSource.connect(voiceoverGain);
    voiceoverGain.connect(destination);

    // Combine video and audio streams
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
    voiceoverSource.start(audioContext.currentTime + startTime);

    // Render frames
    function renderFrame() {
        if (video.paused || video.ended) {
            outputRecorder.stop();
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
    a.download = 'voiceover-video.webm';
    a.click();
}

init();
