/**
 * Screen Recorder - Tool #369
 * Record screen with audio using MediaRecorder API
 */

let currentLang = 'zh';
let mediaRecorder = null;
let recordedChunks = [];
let stream = null;
let startTime = null;
let timerInterval = null;

const texts = {
    zh: {
        title: '螢幕錄製',
        subtitle: '錄製螢幕畫面與音訊',
        privacy: '100% 本地處理 · 零資料上傳',
        start: '🎬 開始錄製',
        stop: '⏹️ 停止錄製',
        download: '⬇️ 下載',
        options: '錄製選項',
        includeAudio: '包含系統音訊',
        includeMic: '包含麥克風',
        outputFormat: '輸出格式',
        hint: '點擊「開始錄製」選擇要錄製的螢幕或視窗',
        recording: '錄製中...',
        stopped: '錄製完成！點擊下載保存影片',
        error: '錄製失敗：'
    },
    en: {
        title: 'Screen Recorder',
        subtitle: 'Record screen with audio',
        privacy: '100% Local Processing · No Data Upload',
        start: '🎬 Start Recording',
        stop: '⏹️ Stop Recording',
        download: '⬇️ Download',
        options: 'Recording Options',
        includeAudio: 'Include System Audio',
        includeMic: 'Include Microphone',
        outputFormat: 'Output Format',
        hint: 'Click "Start Recording" to select screen or window',
        recording: 'Recording...',
        stopped: 'Recording complete! Click download to save.',
        error: 'Recording failed: '
    }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    document.getElementById('startBtn').addEventListener('click', startRecording);
    document.getElementById('stopBtn').addEventListener('click', stopRecording);
    document.getElementById('downloadBtn').addEventListener('click', downloadRecording);
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');
    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.getElementById('startBtn').textContent = t.start;
    document.getElementById('stopBtn').textContent = t.stop;
    document.getElementById('downloadBtn').textContent = t.download;
    document.querySelector('.options-section h3').textContent = t.options;
}

async function startRecording() {
    const t = texts[currentLang];

    try {
        const includeAudio = document.getElementById('includeAudio').checked;
        const includeMic = document.getElementById('includeMic').checked;

        // Get screen capture
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
            video: { cursor: 'always' },
            audio: includeAudio
        });

        const tracks = [...displayStream.getTracks()];

        // Add microphone if requested
        if (includeMic) {
            try {
                const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                tracks.push(...micStream.getAudioTracks());
            } catch (e) {
                console.warn('Microphone not available:', e);
            }
        }

        stream = new MediaStream(tracks);

        // Show preview
        const preview = document.getElementById('preview');
        preview.srcObject = displayStream;

        // Start recording
        recordedChunks = [];
        const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
            ? 'video/webm;codecs=vp9'
            : 'video/webm';

        mediaRecorder = new MediaRecorder(stream, { mimeType });

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) recordedChunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
            document.getElementById('downloadBtn').disabled = false;
            document.getElementById('status').textContent = t.stopped;
            document.getElementById('recordingIndicator').style.display = 'none';
            clearInterval(timerInterval);
        };

        // Handle stream end (user stops sharing)
        displayStream.getVideoTracks()[0].onended = () => {
            if (mediaRecorder.state === 'recording') {
                stopRecording();
            }
        };

        mediaRecorder.start(1000);

        // Update UI
        document.getElementById('startBtn').disabled = true;
        document.getElementById('stopBtn').disabled = false;
        document.getElementById('recordingIndicator').style.display = 'flex';
        document.getElementById('status').textContent = t.recording;

        // Start timer
        startTime = Date.now();
        timerInterval = setInterval(updateTimer, 1000);

    } catch (error) {
        console.error('Error:', error);
        document.getElementById('status').textContent = t.error + error.message;
    }
}

function updateTimer() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const seconds = (elapsed % 60).toString().padStart(2, '0');
    document.getElementById('recordTime').textContent = `${minutes}:${seconds}`;
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
    }

    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }

    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;
}

function downloadRecording() {
    const format = document.getElementById('outputFormat').value;
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `screen-recording.${format === 'mp4' ? 'webm' : 'webm'}`;
    a.click();
}

init();
