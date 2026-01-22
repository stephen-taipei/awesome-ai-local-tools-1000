/**
 * Video Compare - Tool #395
 * Compare two videos side by side
 */

let currentLang = 'zh';
let video1File = null;
let video2File = null;

const texts = {
    zh: {
        title: '影片比較器',
        subtitle: '並排比較兩個影片',
        privacy: '100% 本地處理 · 零資料上傳',
        uploadA: '上傳影片 A',
        uploadB: '上傳影片 B',
        uploadHint: '支援 MP4, WebM',
        sync: '同步播放',
        play: '▶️ 播放',
        pause: '⏸️ 暫停',
        reset: '⏮️ 重置',
        compareTitle: '比較資訊',
        property: '屬性',
        fileName: '檔案名稱',
        fileSize: '檔案大小',
        duration: '時長',
        resolution: '解析度',
        aspectRatio: '寬高比',
        bitrate: '位元率'
    },
    en: {
        title: 'Video Compare',
        subtitle: 'Compare two videos side by side',
        privacy: '100% Local Processing · No Data Upload',
        uploadA: 'Upload Video A',
        uploadB: 'Upload Video B',
        uploadHint: 'Supports MP4, WebM',
        sync: 'Sync Playback',
        play: '▶️ Play',
        pause: '⏸️ Pause',
        reset: '⏮️ Reset',
        compareTitle: 'Comparison Info',
        property: 'Property',
        fileName: 'File Name',
        fileSize: 'File Size',
        duration: 'Duration',
        resolution: 'Resolution',
        aspectRatio: 'Aspect Ratio',
        bitrate: 'Bitrate'
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
    document.getElementById('uploadText1').textContent = t.uploadA;
    document.getElementById('uploadText2').textContent = t.uploadB;
    document.getElementById('syncLabel').textContent = t.sync;
    document.getElementById('playBothBtn').textContent = t.play;
    document.getElementById('pauseBothBtn').textContent = t.pause;
    document.getElementById('resetBothBtn').textContent = t.reset;
    document.getElementById('compareTitle').textContent = t.compareTitle;
    document.getElementById('propertyHeader').textContent = t.property;

    if (video1File && video2File) {
        updateComparisonTable();
    }
}

function setupFileUpload() {
    setupSingleUpload('uploadArea1', 'fileInput1', 1);
    setupSingleUpload('uploadArea2', 'fileInput2', 2);
}

function setupSingleUpload(areaId, inputId, num) {
    const uploadArea = document.getElementById(areaId);
    const fileInput = document.getElementById(inputId);

    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', (e) => e.preventDefault());
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0], num);
    });
    fileInput.addEventListener('change', (e) => { if (e.target.files.length) handleFile(e.target.files[0], num); });
}

function setupControls() {
    const video1 = document.getElementById('video1');
    const video2 = document.getElementById('video2');
    const syncCheckbox = document.getElementById('syncPlayback');

    video1.addEventListener('play', () => {
        if (syncCheckbox.checked) video2.play();
    });
    video1.addEventListener('pause', () => {
        if (syncCheckbox.checked) video2.pause();
    });
    video1.addEventListener('seeked', () => {
        if (syncCheckbox.checked) video2.currentTime = video1.currentTime;
    });

    video2.addEventListener('play', () => {
        if (syncCheckbox.checked) video1.play();
    });
    video2.addEventListener('pause', () => {
        if (syncCheckbox.checked) video1.pause();
    });
    video2.addEventListener('seeked', () => {
        if (syncCheckbox.checked) video1.currentTime = video2.currentTime;
    });

    document.getElementById('playBothBtn').addEventListener('click', () => {
        video1.play();
        video2.play();
    });

    document.getElementById('pauseBothBtn').addEventListener('click', () => {
        video1.pause();
        video2.pause();
    });

    document.getElementById('resetBothBtn').addEventListener('click', () => {
        video1.currentTime = 0;
        video2.currentTime = 0;
        video1.pause();
        video2.pause();
    });
}

function handleFile(file, num) {
    if (num === 1) {
        video1File = file;
        document.getElementById('uploadArea1').classList.add('uploaded');
        document.getElementById('uploadArea1').innerHTML = `<div class="upload-icon">✅</div><p>${file.name}</p>`;
        const video = document.getElementById('video1');
        video.src = URL.createObjectURL(file);
        video.onloadedmetadata = () => updateInfo(1);
    } else {
        video2File = file;
        document.getElementById('uploadArea2').classList.add('uploaded');
        document.getElementById('uploadArea2').innerHTML = `<div class="upload-icon">✅</div><p>${file.name}</p>`;
        const video = document.getElementById('video2');
        video.src = URL.createObjectURL(file);
        video.onloadedmetadata = () => updateInfo(2);
    }

    checkBothReady();
}

function checkBothReady() {
    if (video1File && video2File) {
        document.getElementById('editorContent').style.display = 'block';
        updateComparisonTable();
    }
}

function updateInfo(num) {
    const video = document.getElementById(`video${num}`);
    const file = num === 1 ? video1File : video2File;
    const info = document.getElementById(`info${num}`);

    info.textContent = `${video.videoWidth}×${video.videoHeight} | ${formatDuration(video.duration)} | ${formatFileSize(file.size)}`;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDuration(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
}

function estimateBitrate(bytes, duration) {
    if (duration <= 0) return 'N/A';
    const bps = (bytes * 8) / duration;
    if (bps >= 1000000) {
        return (bps / 1000000).toFixed(2) + ' Mbps';
    }
    return (bps / 1000).toFixed(2) + ' Kbps';
}

function updateComparisonTable() {
    const t = texts[currentLang];
    const video1 = document.getElementById('video1');
    const video2 = document.getElementById('video2');

    const w1 = video1.videoWidth, h1 = video1.videoHeight;
    const w2 = video2.videoWidth, h2 = video2.videoHeight;
    const d1 = gcd(w1, h1), d2 = gcd(w2, h2);

    const rows = [
        { label: t.fileName, v1: video1File.name, v2: video2File.name },
        { label: t.fileSize, v1: formatFileSize(video1File.size), v2: formatFileSize(video2File.size) },
        { label: t.duration, v1: formatDuration(video1.duration), v2: formatDuration(video2.duration) },
        { label: t.resolution, v1: `${w1}×${h1}`, v2: `${w2}×${h2}` },
        { label: t.aspectRatio, v1: `${w1/d1}:${h1/d1}`, v2: `${w2/d2}:${h2/d2}` },
        { label: t.bitrate, v1: estimateBitrate(video1File.size, video1.duration), v2: estimateBitrate(video2File.size, video2.duration) }
    ];

    document.getElementById('compareBody').innerHTML = rows.map(row => `
        <tr>
            <td>${row.label}</td>
            <td>${row.v1}</td>
            <td>${row.v2}</td>
        </tr>
    `).join('');
}

init();
