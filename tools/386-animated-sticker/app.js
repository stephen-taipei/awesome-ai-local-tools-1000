/**
 * Animated Sticker - Tool #386
 * Add animated stickers to videos
 */

let currentLang = 'zh';
let videoFile = null;
let outputBlob = null;
let stickers = [];
let stickerIdCounter = 0;

const texts = {
    zh: {
        title: '動態貼圖',
        subtitle: '為影片添加動態貼圖效果',
        privacy: '100% 本地處理 · 零資料上傳',
        process: '🎬 生成影片',
        download: '⬇️ 下載',
        upload: '拖放影片檔案至此或點擊上傳',
        uploadHint: '支援 MP4, WebM',
        selectSticker: '選擇貼圖',
        addedStickers: '已添加貼圖',
        noStickers: '點擊上方貼圖添加',
        processing: '處理中...',
        complete: '處理完成！',
        remove: '移除'
    },
    en: {
        title: 'Animated Sticker',
        subtitle: 'Add animated stickers to videos',
        privacy: '100% Local Processing · No Data Upload',
        process: '🎬 Generate',
        download: '⬇️ Download',
        upload: 'Drop video file here or click to upload',
        uploadHint: 'Supports MP4, WebM',
        selectSticker: 'Select Sticker',
        addedStickers: 'Added Stickers',
        noStickers: 'Click stickers above to add',
        processing: 'Processing...',
        complete: 'Complete!',
        remove: 'Remove'
    }
};

const stickerAnimations = {
    heart: { emoji: '❤️', animation: 'pulse' },
    star: { emoji: '⭐', animation: 'spin' },
    fire: { emoji: '🔥', animation: 'shake' },
    sparkle: { emoji: '✨', animation: 'twinkle' },
    thumbs: { emoji: '👍', animation: 'bounce' },
    party: { emoji: '🎉', animation: 'explode' },
    laugh: { emoji: '😂', animation: 'shake' },
    cool: { emoji: '😎', animation: 'bounce' },
    rocket: { emoji: '🚀', animation: 'fly' },
    rainbow: { emoji: '🌈', animation: 'fade' }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    setupFileUpload();
    setupStickerButtons();
    document.getElementById('processBtn').addEventListener('click', processVideo);
    document.getElementById('downloadBtn').addEventListener('click', downloadResult);
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

function setupStickerButtons() {
    document.querySelectorAll('.sticker-btn').forEach(btn => {
        btn.addEventListener('click', () => addSticker(btn.dataset.sticker));
    });
}

function handleFile(file) {
    videoFile = file;
    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('editorContent').style.display = 'block';

    const video = document.getElementById('inputVideo');
    video.src = URL.createObjectURL(file);
}

function addSticker(type) {
    const config = stickerAnimations[type];
    const sticker = {
        id: stickerIdCounter++,
        type,
        emoji: config.emoji,
        animation: config.animation,
        x: 0.5 + (Math.random() - 0.5) * 0.5,
        y: 0.5 + (Math.random() - 0.5) * 0.5,
        size: 60,
        startTime: 0,
        duration: -1 // -1 means entire video
    };
    stickers.push(sticker);
    updateStickersList();
}

function removeSticker(id) {
    stickers = stickers.filter(s => s.id !== id);
    updateStickersList();
}

function updateStickersList() {
    const t = texts[currentLang];
    const container = document.getElementById('addedStickers');

    if (stickers.length === 0) {
        container.innerHTML = `<p style="color: var(--text-secondary); font-size: 0.875rem;">${t.noStickers}</p>`;
        return;
    }

    container.innerHTML = stickers.map(s => `
        <div class="sticker-item">
            <span class="emoji">${s.emoji}</span>
            <span class="info">位置: ${Math.round(s.x * 100)}%, ${Math.round(s.y * 100)}%</span>
            <button class="remove" onclick="removeSticker(${s.id})">${t.remove}</button>
        </div>
    `).join('');
}

function drawSticker(ctx, sticker, time, width, height) {
    const config = stickerAnimations[sticker.type];
    const x = sticker.x * width;
    const y = sticker.y * height;
    const size = sticker.size;

    ctx.save();
    ctx.translate(x, y);

    // Apply animation
    switch (sticker.animation) {
        case 'pulse':
            const pulseScale = 1 + Math.sin(time * 5) * 0.2;
            ctx.scale(pulseScale, pulseScale);
            break;
        case 'spin':
            ctx.rotate(time * 3);
            break;
        case 'shake':
            const shakeX = Math.sin(time * 20) * 5;
            ctx.translate(shakeX, 0);
            break;
        case 'twinkle':
            ctx.globalAlpha = 0.5 + Math.sin(time * 8) * 0.5;
            break;
        case 'bounce':
            const bounceY = Math.abs(Math.sin(time * 5)) * 20;
            ctx.translate(0, -bounceY);
            break;
        case 'explode':
            const explodeScale = 1 + Math.sin(time * 3) * 0.3;
            ctx.scale(explodeScale, explodeScale);
            ctx.rotate(Math.sin(time * 5) * 0.1);
            break;
        case 'fly':
            const flyY = Math.sin(time * 2) * 30;
            const flyX = Math.cos(time * 3) * 20;
            ctx.translate(flyX, flyY);
            ctx.rotate(Math.PI / 6);
            break;
        case 'fade':
            ctx.globalAlpha = 0.5 + Math.sin(time * 2) * 0.5;
            break;
    }

    ctx.font = `${size}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(sticker.emoji, 0, 0);

    ctx.restore();
}

async function processVideo() {
    if (stickers.length === 0) {
        alert('請先添加至少一個貼圖');
        return;
    }

    const t = texts[currentLang];
    const processBtn = document.getElementById('processBtn');
    processBtn.disabled = true;

    document.getElementById('progressSection').style.display = 'block';

    const video = document.getElementById('inputVideo');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    await video.play();
    video.pause();
    video.currentTime = 0;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const duration = video.duration;
    const fps = 30;
    const totalFrames = Math.floor(duration * fps);

    const stream = canvas.captureStream(fps);
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });

    const chunks = [];
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = () => {
        outputBlob = new Blob(chunks, { type: 'video/webm' });
        document.getElementById('downloadBtn').disabled = false;
        document.getElementById('progressText').textContent = t.complete;
        processBtn.disabled = false;
        processBtn.textContent = t.process;
    };

    mediaRecorder.start();

    for (let frame = 0; frame < totalFrames; frame++) {
        const currentTime = frame / fps;
        video.currentTime = currentTime;
        await new Promise(resolve => video.onseeked = resolve);

        // Draw video frame
        ctx.drawImage(video, 0, 0);

        // Draw stickers
        stickers.forEach(sticker => {
            drawSticker(ctx, sticker, currentTime, canvas.width, canvas.height);
        });

        const progress = ((frame + 1) / totalFrames) * 100;
        document.getElementById('progressFill').style.width = progress + '%';
        document.getElementById('progressText').textContent = `${t.processing} ${Math.round(progress)}%`;

        await new Promise(resolve => setTimeout(resolve, 1000 / fps));
    }

    mediaRecorder.stop();
    document.getElementById('progressSection').style.display = 'none';
}

function downloadResult() {
    if (!outputBlob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(outputBlob);
    a.download = 'sticker-video.webm';
    a.click();
}

// Make removeSticker available globally
window.removeSticker = removeSticker;

init();
