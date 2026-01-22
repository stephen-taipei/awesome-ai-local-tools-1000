/**
 * Video Info - Tool #391
 * View detailed video metadata and information
 */

let currentLang = 'zh';
let videoFile = null;
let videoInfo = {};

const texts = {
    zh: {
        title: '影片資訊查看',
        subtitle: '查看影片詳細資訊與元資料',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '拖放影片檔案至此或點擊上傳',
        uploadHint: '支援 MP4, WebM, MOV, AVI',
        infoTitle: '影片資訊',
        copy: '📋 複製資訊',
        export: '📄 匯出 JSON',
        copied: '已複製！',
        fileName: '檔案名稱',
        fileSize: '檔案大小',
        fileType: '檔案類型',
        duration: '影片長度',
        resolution: '解析度',
        aspectRatio: '寬高比',
        frameRate: '幀率',
        videoCodec: '視訊編碼',
        audioCodec: '音訊編碼',
        bitrate: '位元率',
        lastModified: '最後修改'
    },
    en: {
        title: 'Video Info',
        subtitle: 'View detailed video metadata',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Drop video file here or click to upload',
        uploadHint: 'Supports MP4, WebM, MOV, AVI',
        infoTitle: 'Video Information',
        copy: '📋 Copy Info',
        export: '📄 Export JSON',
        copied: 'Copied!',
        fileName: 'File Name',
        fileSize: 'File Size',
        fileType: 'File Type',
        duration: 'Duration',
        resolution: 'Resolution',
        aspectRatio: 'Aspect Ratio',
        frameRate: 'Frame Rate',
        videoCodec: 'Video Codec',
        audioCodec: 'Audio Codec',
        bitrate: 'Bitrate',
        lastModified: 'Last Modified'
    }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    setupFileUpload();
    document.getElementById('copyBtn').addEventListener('click', copyInfo);
    document.getElementById('exportBtn').addEventListener('click', exportJSON);
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');
    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.getElementById('infoTitle').textContent = t.infoTitle;
    document.getElementById('copyBtn').textContent = t.copy;
    document.getElementById('exportBtn').textContent = t.export;

    if (videoFile) {
        displayInfo();
    }
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

    video.onloadedmetadata = () => {
        extractInfo(video, file);
        displayInfo();
    };
}

function extractInfo(video, file) {
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const w = video.videoWidth;
    const h = video.videoHeight;
    const divisor = gcd(w, h);

    videoInfo = {
        fileName: file.name,
        fileSize: formatFileSize(file.size),
        fileSizeBytes: file.size,
        fileType: file.type || 'unknown',
        duration: formatDuration(video.duration),
        durationSeconds: video.duration,
        resolution: `${w} × ${h}`,
        width: w,
        height: h,
        aspectRatio: `${w/divisor}:${h/divisor}`,
        frameRate: estimateFrameRate(video),
        videoCodec: getCodecInfo(file.type),
        audioCodec: getAudioCodec(file.type),
        bitrate: estimateBitrate(file.size, video.duration),
        lastModified: new Date(file.lastModified).toLocaleString()
    };
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDuration(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    if (h > 0) {
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

function estimateFrameRate(video) {
    // Common frame rates based on duration precision
    const duration = video.duration;
    if (duration % (1/60) < 0.001) return '60 fps';
    if (duration % (1/30) < 0.001) return '30 fps';
    if (duration % (1/25) < 0.001) return '25 fps';
    if (duration % (1/24) < 0.001) return '24 fps';
    return '~30 fps';
}

function getCodecInfo(mimeType) {
    if (mimeType.includes('mp4')) return 'H.264/AVC';
    if (mimeType.includes('webm')) return 'VP8/VP9';
    if (mimeType.includes('ogg')) return 'Theora';
    if (mimeType.includes('quicktime')) return 'H.264/ProRes';
    return 'Unknown';
}

function getAudioCodec(mimeType) {
    if (mimeType.includes('mp4')) return 'AAC';
    if (mimeType.includes('webm')) return 'Opus/Vorbis';
    if (mimeType.includes('ogg')) return 'Vorbis';
    return 'Unknown';
}

function estimateBitrate(bytes, duration) {
    if (duration <= 0) return 'N/A';
    const bps = (bytes * 8) / duration;
    if (bps >= 1000000) {
        return (bps / 1000000).toFixed(2) + ' Mbps';
    }
    return (bps / 1000).toFixed(2) + ' Kbps';
}

function displayInfo() {
    const t = texts[currentLang];
    const grid = document.getElementById('infoGrid');

    const items = [
        { label: t.fileName, value: videoInfo.fileName },
        { label: t.fileSize, value: videoInfo.fileSize },
        { label: t.fileType, value: videoInfo.fileType },
        { label: t.duration, value: videoInfo.duration },
        { label: t.resolution, value: videoInfo.resolution },
        { label: t.aspectRatio, value: videoInfo.aspectRatio },
        { label: t.frameRate, value: videoInfo.frameRate },
        { label: t.videoCodec, value: videoInfo.videoCodec },
        { label: t.audioCodec, value: videoInfo.audioCodec },
        { label: t.bitrate, value: videoInfo.bitrate },
        { label: t.lastModified, value: videoInfo.lastModified }
    ];

    grid.innerHTML = items.map(item => `
        <div class="info-item">
            <div class="info-label">${item.label}</div>
            <div class="info-value">${item.value}</div>
        </div>
    `).join('');
}

function copyInfo() {
    const t = texts[currentLang];
    const text = Object.entries(videoInfo)
        .filter(([key]) => !key.includes('Bytes') && !key.includes('Seconds'))
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');

    navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById('copyBtn');
        btn.textContent = t.copied;
        setTimeout(() => btn.textContent = t.copy, 2000);
    });
}

function exportJSON() {
    const dataStr = JSON.stringify(videoInfo, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `video-info-${Date.now()}.json`;
    a.click();
}

init();
