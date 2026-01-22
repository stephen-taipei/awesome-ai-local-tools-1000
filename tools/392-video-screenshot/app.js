/**
 * Video Screenshot - Tool #392
 * Capture screenshots from videos at any timestamp
 */

let currentLang = 'zh';
let videoFile = null;
let captures = [];

const texts = {
    zh: {
        title: '影片截圖',
        subtitle: '從影片中擷取任意時間點的畫面',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '拖放影片檔案至此或點擊上傳',
        uploadHint: '支援 MP4, WebM, MOV',
        format: '輸出格式',
        quality: '品質',
        capture: '📸 擷取畫面',
        capturesTitle: '已擷取的畫面',
        downloadAll: '⬇️ 下載全部',
        download: '下載',
        delete: '刪除'
    },
    en: {
        title: 'Video Screenshot',
        subtitle: 'Capture screenshots from videos',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Drop video file here or click to upload',
        uploadHint: 'Supports MP4, WebM, MOV',
        format: 'Output Format',
        quality: 'Quality',
        capture: '📸 Capture',
        capturesTitle: 'Captured Screenshots',
        downloadAll: '⬇️ Download All',
        download: 'Download',
        delete: 'Delete'
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
    document.getElementById('formatLabel').textContent = t.format;
    document.getElementById('qualityLabel').textContent = t.quality;
    document.getElementById('captureBtn').textContent = t.capture;
    document.getElementById('capturesTitle').textContent = t.capturesTitle;
    document.getElementById('downloadAllBtn').textContent = t.downloadAll;
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
    const video = document.getElementById('inputVideo');
    const slider = document.getElementById('timelineSlider');
    const quality = document.getElementById('quality');
    const format = document.getElementById('outputFormat');

    slider.addEventListener('input', (e) => {
        if (video.duration) {
            video.currentTime = (e.target.value / 100) * video.duration;
        }
    });

    video.addEventListener('timeupdate', () => {
        if (video.duration) {
            slider.value = (video.currentTime / video.duration) * 100;
            document.getElementById('currentTime').textContent = formatTime(video.currentTime);
        }
    });

    quality.addEventListener('input', (e) => {
        document.getElementById('qualityValue').textContent = Math.round(e.target.value * 100) + '%';
    });

    format.addEventListener('change', (e) => {
        document.getElementById('qualityGroup').style.display = e.target.value === 'png' ? 'none' : 'flex';
    });

    document.getElementById('captureBtn').addEventListener('click', captureFrame);
    document.getElementById('downloadAllBtn').addEventListener('click', downloadAll);
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
    const ms = Math.floor((seconds % 1) * 1000);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

function captureFrame() {
    const video = document.getElementById('inputVideo');
    const format = document.getElementById('outputFormat').value;
    const quality = parseFloat(document.getElementById('quality').value);

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    const mimeType = format === 'png' ? 'image/png' : format === 'jpeg' ? 'image/jpeg' : 'image/webp';
    const dataUrl = format === 'png' ? canvas.toDataURL(mimeType) : canvas.toDataURL(mimeType, quality);

    const capture = {
        id: Date.now(),
        dataUrl,
        time: video.currentTime,
        timeStr: formatTime(video.currentTime),
        format
    };

    captures.push(capture);
    renderCaptures();
}

function renderCaptures() {
    const t = texts[currentLang];
    const grid = document.getElementById('capturesGrid');
    const section = document.getElementById('capturesSection');

    if (captures.length === 0) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';
    grid.innerHTML = captures.map(cap => `
        <div class="capture-item" data-id="${cap.id}">
            <img src="${cap.dataUrl}" alt="Capture at ${cap.timeStr}">
            <div class="capture-time">${cap.timeStr}</div>
            <div class="capture-actions">
                <button onclick="downloadCapture(${cap.id})">${t.download}</button>
                <button onclick="deleteCapture(${cap.id})">×</button>
            </div>
        </div>
    `).join('');
}

function downloadCapture(id) {
    const cap = captures.find(c => c.id === id);
    if (!cap) return;

    const a = document.createElement('a');
    a.href = cap.dataUrl;
    a.download = `screenshot-${cap.timeStr.replace(/:/g, '-')}.${cap.format}`;
    a.click();
}

function deleteCapture(id) {
    captures = captures.filter(c => c.id !== id);
    renderCaptures();
}

function downloadAll() {
    captures.forEach((cap, i) => {
        setTimeout(() => {
            downloadCapture(cap.id);
        }, i * 200);
    });
}

init();
