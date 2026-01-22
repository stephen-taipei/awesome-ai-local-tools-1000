/**
 * Timeline Preview - Tool #394
 * Generate video timeline preview strip
 */

let currentLang = 'zh';
let videoFile = null;
let stripCanvas = null;

const texts = {
    zh: {
        title: '影片預覽條',
        subtitle: '產生影片時間軸預覽條',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '拖放影片檔案至此或點擊上傳',
        uploadHint: '支援 MP4, WebM, MOV',
        frames: '幀數',
        height: '高度',
        showTime: '顯示時間',
        generate: '🎬 產生預覽條',
        resultTitle: '預覽條',
        download: '⬇️ 下載 PNG',
        generating: '產生中...',
        complete: '完成！'
    },
    en: {
        title: 'Timeline Preview',
        subtitle: 'Generate video timeline preview strip',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Drop video file here or click to upload',
        uploadHint: 'Supports MP4, WebM, MOV',
        frames: 'Frames',
        height: 'Height',
        showTime: 'Show Time',
        generate: '🎬 Generate Strip',
        resultTitle: 'Preview Strip',
        download: '⬇️ Download PNG',
        generating: 'Generating...',
        complete: 'Complete!'
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
    document.getElementById('framesLabel').textContent = t.frames;
    document.getElementById('heightLabel').textContent = t.height;
    document.getElementById('showTimeLabel').textContent = t.showTime;
    document.getElementById('generateBtn').textContent = t.generate;
    document.getElementById('resultTitle').textContent = t.resultTitle;
    document.getElementById('downloadBtn').textContent = t.download;
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
    document.getElementById('frameCount').addEventListener('input', (e) => {
        document.getElementById('framesValue').textContent = e.target.value;
    });

    document.getElementById('generateBtn').addEventListener('click', generateStrip);
    document.getElementById('downloadBtn').addEventListener('click', downloadStrip);
}

function handleFile(file) {
    videoFile = file;
    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('editorContent').style.display = 'block';

    const video = document.getElementById('inputVideo');
    video.src = URL.createObjectURL(file);
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

async function generateStrip() {
    const t = texts[currentLang];
    const video = document.getElementById('inputVideo');
    const frameCount = parseInt(document.getElementById('frameCount').value);
    const stripHeight = parseInt(document.getElementById('stripHeight').value);
    const showTime = document.getElementById('showTime').checked;

    document.getElementById('generateBtn').disabled = true;
    document.getElementById('progressSection').style.display = 'block';

    // Wait for video metadata
    await new Promise(resolve => {
        if (video.readyState >= 1) resolve();
        else video.onloadedmetadata = resolve;
    });

    const duration = video.duration;
    const aspectRatio = video.videoWidth / video.videoHeight;
    const frameWidth = Math.round(stripHeight * aspectRatio);
    const totalWidth = frameWidth * frameCount;

    // Create strip canvas
    stripCanvas = document.createElement('canvas');
    stripCanvas.width = totalWidth;
    stripCanvas.height = stripHeight + (showTime ? 20 : 0);
    const ctx = stripCanvas.getContext('2d');

    // Fill background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, stripCanvas.width, stripCanvas.height);

    const interval = duration / frameCount;

    for (let i = 0; i < frameCount; i++) {
        const time = (i + 0.5) * interval;
        video.currentTime = time;

        await new Promise(resolve => {
            video.onseeked = resolve;
        });

        // Draw frame
        const x = i * frameWidth;
        ctx.drawImage(video, x, 0, frameWidth, stripHeight);

        // Draw time label
        if (showTime) {
            ctx.fillStyle = '#94a3b8';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(formatTime(time), x + frameWidth / 2, stripHeight + 14);
        }

        // Draw separator
        if (i > 0) {
            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, stripHeight);
            ctx.stroke();
        }

        const progress = ((i + 1) / frameCount) * 100;
        document.getElementById('progressFill').style.width = progress + '%';
        document.getElementById('progressText').textContent = `${t.generating} ${Math.round(progress)}%`;
    }

    document.getElementById('progressSection').style.display = 'none';
    document.getElementById('generateBtn').disabled = false;

    // Display result
    const container = document.getElementById('stripContainer');
    container.innerHTML = '';
    container.appendChild(stripCanvas);
    document.getElementById('resultSection').style.display = 'block';
}

function downloadStrip() {
    if (!stripCanvas) return;

    const a = document.createElement('a');
    a.href = stripCanvas.toDataURL('image/png');
    a.download = `timeline-preview-${Date.now()}.png`;
    a.click();
}

init();
