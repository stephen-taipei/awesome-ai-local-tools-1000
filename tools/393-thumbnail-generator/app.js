/**
 * Thumbnail Generator - Tool #393
 * Auto-generate video thumbnails
 */

let currentLang = 'zh';
let videoFile = null;
let thumbnails = [];
let selectedIds = new Set();

const texts = {
    zh: {
        title: '影片縮圖生成',
        subtitle: '自動產生影片縮圖',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '拖放影片檔案至此或點擊上傳',
        uploadHint: '支援 MP4, WebM, MOV',
        count: '縮圖數量',
        size: '縮圖尺寸',
        small: '小 (160px)',
        medium: '中 (320px)',
        large: '大 (480px)',
        generate: '🎯 產生縮圖',
        thumbnailsTitle: '產生的縮圖',
        downloadAll: '⬇️ 下載全部',
        downloadSelected: '⬇️ 下載選取',
        generating: '產生中...',
        complete: '完成！'
    },
    en: {
        title: 'Thumbnail Generator',
        subtitle: 'Auto-generate video thumbnails',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Drop video file here or click to upload',
        uploadHint: 'Supports MP4, WebM, MOV',
        count: 'Thumbnail Count',
        size: 'Thumbnail Size',
        small: 'Small (160px)',
        medium: 'Medium (320px)',
        large: 'Large (480px)',
        generate: '🎯 Generate',
        thumbnailsTitle: 'Generated Thumbnails',
        downloadAll: '⬇️ Download All',
        downloadSelected: '⬇️ Download Selected',
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
    document.getElementById('countLabel').textContent = t.count;
    document.getElementById('sizeLabel').textContent = t.size;
    document.getElementById('generateBtn').textContent = t.generate;
    document.getElementById('thumbnailsTitle').textContent = t.thumbnailsTitle;
    document.getElementById('downloadAllBtn').textContent = t.downloadAll;
    document.getElementById('downloadSelectedBtn').textContent = t.downloadSelected;

    const sizeSelect = document.getElementById('thumbnailSize');
    sizeSelect.options[0].text = t.small;
    sizeSelect.options[1].text = t.medium;
    sizeSelect.options[2].text = t.large;
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
    document.getElementById('thumbnailCount').addEventListener('input', (e) => {
        document.getElementById('countValue').textContent = e.target.value;
    });

    document.getElementById('generateBtn').addEventListener('click', generateThumbnails);
    document.getElementById('downloadAllBtn').addEventListener('click', downloadAll);
    document.getElementById('downloadSelectedBtn').addEventListener('click', downloadSelected);
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
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

async function generateThumbnails() {
    const t = texts[currentLang];
    const video = document.getElementById('inputVideo');
    const count = parseInt(document.getElementById('thumbnailCount').value);
    const sizeOption = document.getElementById('thumbnailSize').value;

    const sizes = { small: 160, medium: 320, large: 480 };
    const width = sizes[sizeOption];

    document.getElementById('generateBtn').disabled = true;
    document.getElementById('progressSection').style.display = 'block';

    thumbnails = [];
    selectedIds.clear();

    // Wait for video metadata
    await new Promise(resolve => {
        if (video.readyState >= 1) resolve();
        else video.onloadedmetadata = resolve;
    });

    const duration = video.duration;
    const interval = duration / (count + 1);

    for (let i = 1; i <= count; i++) {
        const time = interval * i;
        video.currentTime = time;

        await new Promise(resolve => {
            video.onseeked = resolve;
        });

        const canvas = document.createElement('canvas');
        const aspectRatio = video.videoHeight / video.videoWidth;
        canvas.width = width;
        canvas.height = width * aspectRatio;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        thumbnails.push({
            id: Date.now() + i,
            dataUrl: canvas.toDataURL('image/jpeg', 0.85),
            time,
            timeStr: formatTime(time)
        });

        const progress = (i / count) * 100;
        document.getElementById('progressFill').style.width = progress + '%';
        document.getElementById('progressText').textContent = `${t.generating} ${Math.round(progress)}%`;
    }

    document.getElementById('progressSection').style.display = 'none';
    document.getElementById('progressText').textContent = t.complete;
    document.getElementById('generateBtn').disabled = false;

    renderThumbnails();
}

function renderThumbnails() {
    const grid = document.getElementById('thumbnailsGrid');
    const section = document.getElementById('thumbnailsSection');

    if (thumbnails.length === 0) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';
    grid.innerHTML = thumbnails.map(thumb => `
        <div class="thumbnail-item ${selectedIds.has(thumb.id) ? 'selected' : ''}"
             data-id="${thumb.id}" onclick="toggleSelect(${thumb.id})">
            <img src="${thumb.dataUrl}" alt="Thumbnail at ${thumb.timeStr}">
            <div class="thumb-time">${thumb.timeStr}</div>
            <div class="thumb-check">✓</div>
        </div>
    `).join('');
}

function toggleSelect(id) {
    if (selectedIds.has(id)) {
        selectedIds.delete(id);
    } else {
        selectedIds.add(id);
    }
    renderThumbnails();
}

function downloadAll() {
    thumbnails.forEach((thumb, i) => {
        setTimeout(() => {
            downloadThumbnail(thumb);
        }, i * 200);
    });
}

function downloadSelected() {
    const selected = thumbnails.filter(t => selectedIds.has(t.id));
    selected.forEach((thumb, i) => {
        setTimeout(() => {
            downloadThumbnail(thumb);
        }, i * 200);
    });
}

function downloadThumbnail(thumb) {
    const a = document.createElement('a');
    a.href = thumb.dataUrl;
    a.download = `thumbnail-${thumb.timeStr.replace(':', '-')}.jpg`;
    a.click();
}

init();
