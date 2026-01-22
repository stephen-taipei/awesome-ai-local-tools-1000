/**
 * Video to Image Sequence - Tool #347
 * Extract image sequence from video
 */

let currentLang = 'zh';
let videoFile = null;
let extractedImages = [];

const texts = {
    zh: {
        title: '影片轉圖片序列',
        subtitle: '從影片匯出圖片序列',
        privacy: '100% 本地處理 · 零資料上傳',
        format: '圖片格式',
        fps: '取幀頻率',
        fps1: '每秒 1 張',
        fps5: '每秒 5 張',
        fps10: '每秒 10 張',
        fpsAll: '全部幀',
        quality: '品質',
        process: '🔄 提取圖片',
        download: '⬇️ 下載 ZIP',
        result: '提取結果',
        upload: '拖放影片檔案至此或點擊上傳',
        uploadHint: '支援 MP4, WebM, MOV',
        processing: '處理中...',
        extracting: '提取幀 {current}/{total}...',
        extracted: '已提取 {count} 張圖片'
    },
    en: {
        title: 'Video to Image Sequence',
        subtitle: 'Extract image sequence from video',
        privacy: '100% Local Processing · No Data Upload',
        format: 'Image Format',
        fps: 'Frame Rate',
        fps1: '1 frame/sec',
        fps5: '5 frames/sec',
        fps10: '10 frames/sec',
        fpsAll: 'All frames',
        quality: 'Quality',
        process: '🔄 Extract',
        download: '⬇️ Download ZIP',
        result: 'Result',
        upload: 'Drop video file here or click to upload',
        uploadHint: 'Supports MP4, WebM, MOV',
        processing: 'Processing...',
        extracting: 'Extracting frame {current}/{total}...',
        extracted: 'Extracted {count} images'
    }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    setupFileUpload();
    setupControls();
    document.getElementById('processBtn').addEventListener('click', extractFrames);
    document.getElementById('downloadBtn').addEventListener('click', downloadZip);
}

function setupFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('drag-over'); });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));
    uploadArea.addEventListener('drop', (e) => { e.preventDefault(); uploadArea.classList.remove('drag-over'); if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]); });
    fileInput.addEventListener('change', (e) => { if (e.target.files.length) handleFile(e.target.files[0]); });
}

function setupControls() {
    document.getElementById('quality').addEventListener('input', (e) => {
        document.getElementById('qualityValue').textContent = e.target.value + '%';
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
    document.getElementById('formatLabel').textContent = t.format;
    document.getElementById('fpsLabel').textContent = t.fps;
    const fpsSelect = document.getElementById('fps');
    fpsSelect.options[0].text = t.fps1;
    fpsSelect.options[1].text = t.fps5;
    fpsSelect.options[2].text = t.fps10;
    fpsSelect.options[3].text = t.fpsAll;
    document.getElementById('qualityLabel').textContent = t.quality;
    document.getElementById('processBtn').textContent = t.process;
    document.getElementById('downloadBtn').textContent = t.download;
    document.getElementById('resultTitle').textContent = t.result;
    document.querySelector('.upload-area p').textContent = t.upload;
    document.querySelector('.upload-hint').textContent = t.uploadHint;
}

function handleFile(file) {
    if (!file.type.startsWith('video/')) {
        alert('Please select a video file');
        return;
    }
    videoFile = file;
    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('videoLoaded').style.display = 'block';
    document.getElementById('fileInfo').textContent = `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
    document.getElementById('previewVideo').src = URL.createObjectURL(file);
    document.getElementById('optionsSection').style.display = 'block';
    document.getElementById('actionSection').style.display = 'flex';
}

async function extractFrames() {
    if (!videoFile) return;

    const processBtn = document.getElementById('processBtn');
    const t = texts[currentLang];
    processBtn.textContent = t.processing;
    processBtn.disabled = true;
    document.getElementById('progressSection').style.display = 'block';

    const video = document.createElement('video');
    video.src = URL.createObjectURL(videoFile);
    await new Promise(resolve => { video.onloadedmetadata = resolve; });

    const fps = document.getElementById('fps').value;
    const format = document.getElementById('imageFormat').value;
    const quality = parseInt(document.getElementById('quality').value) / 100;
    const duration = video.duration;

    let interval;
    if (fps === 'all') {
        interval = 1 / 30;
    } else {
        interval = 1 / parseInt(fps);
    }

    const totalFrames = Math.floor(duration / interval);
    extractedImages = [];

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');

    for (let i = 0; i < totalFrames && i < 100; i++) {
        const time = i * interval;
        video.currentTime = time;
        await new Promise(resolve => { video.onseeked = resolve; });

        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL(format === 'png' ? 'image/png' : 'image/jpeg', quality);
        extractedImages.push({ data: dataUrl, name: `frame_${String(i + 1).padStart(4, '0')}.${format}` });

        const progress = ((i + 1) / Math.min(totalFrames, 100)) * 100;
        document.getElementById('progressFill').style.width = progress + '%';
        document.getElementById('progressText').textContent = t.extracting.replace('{current}', i + 1).replace('{total}', Math.min(totalFrames, 100));
    }

    displayResults();
    document.getElementById('downloadBtn').disabled = false;
    document.getElementById('progressSection').style.display = 'none';
    processBtn.textContent = t.process;
    processBtn.disabled = false;
}

function displayResults() {
    const grid = document.getElementById('resultGrid');
    grid.innerHTML = '';
    extractedImages.slice(0, 12).forEach(img => {
        const imgEl = document.createElement('img');
        imgEl.src = img.data;
        grid.appendChild(imgEl);
    });
    document.getElementById('resultSection').style.display = 'block';
    document.getElementById('resultInfo').textContent = texts[currentLang].extracted.replace('{count}', extractedImages.length);
}

async function downloadZip() {
    if (extractedImages.length === 0) return;

    const zip = new JSZip();
    for (const img of extractedImages) {
        const base64 = img.data.split(',')[1];
        zip.file(img.name, base64, { base64: true });
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'image_sequence.zip';
    a.click();
}

init();
