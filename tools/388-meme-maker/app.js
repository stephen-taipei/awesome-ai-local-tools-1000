/**
 * Meme Maker - Tool #388
 * Create animated memes and GIFs
 */

let currentLang = 'zh';
let sourceType = null; // 'image' or 'video'
let outputBlob = null;
let isPlaying = false;
let animationId = null;

const texts = {
    zh: {
        title: '表情包製作',
        subtitle: '製作表情包 GIF 與動圖',
        privacy: '100% 本地處理 · 零資料上傳',
        preview: '👁️ 預覽',
        process: '🎬 生成 GIF',
        download: '⬇️ 下載',
        upload: '拖放圖片或影片至此或點擊上傳',
        uploadHint: '支援 JPG, PNG, GIF, MP4',
        topText: '上方文字',
        bottomText: '下方文字',
        fontSize: '字體大小',
        textColor: '文字顏色',
        strokeColor: '描邊顏色',
        animation: '動畫效果',
        processing: '生成中...',
        complete: '生成完成！'
    },
    en: {
        title: 'Meme Maker',
        subtitle: 'Create animated memes and GIFs',
        privacy: '100% Local Processing · No Data Upload',
        preview: '👁️ Preview',
        process: '🎬 Generate GIF',
        download: '⬇️ Download',
        upload: 'Drop image or video here or click to upload',
        uploadHint: 'Supports JPG, PNG, GIF, MP4',
        topText: 'Top Text',
        bottomText: 'Bottom Text',
        fontSize: 'Font Size',
        textColor: 'Text Color',
        strokeColor: 'Stroke Color',
        animation: 'Animation',
        processing: 'Generating...',
        complete: 'Complete!'
    }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    setupFileUpload();
    document.getElementById('previewBtn').addEventListener('click', previewMeme);
    document.getElementById('processBtn').addEventListener('click', generateMeme);
    document.getElementById('downloadBtn').addEventListener('click', downloadResult);

    document.getElementById('fontSize').addEventListener('input', (e) => {
        document.getElementById('fontSizeValue').textContent = e.target.value + 'px';
    });

    // Live preview on text change
    document.getElementById('topText').addEventListener('input', drawFrame);
    document.getElementById('bottomText').addEventListener('input', drawFrame);
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
    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('editorContent').style.display = 'block';

    if (file.type.startsWith('video/')) {
        sourceType = 'video';
        const video = document.getElementById('sourceVideo');
        video.src = URL.createObjectURL(file);
        video.style.display = 'none';
        video.onloadeddata = () => {
            initCanvas(video.videoWidth, video.videoHeight);
            drawFrame();
        };
    } else {
        sourceType = 'image';
        const img = document.getElementById('sourceImage');
        img.src = URL.createObjectURL(file);
        img.style.display = 'none';
        img.onload = () => {
            initCanvas(img.width, img.height);
            drawFrame();
        };
    }
}

function initCanvas(width, height) {
    const canvas = document.getElementById('memeCanvas');
    const maxWidth = 500;
    const scale = width > maxWidth ? maxWidth / width : 1;
    canvas.width = width * scale;
    canvas.height = height * scale;
}

function getSettings() {
    return {
        topText: document.getElementById('topText').value,
        bottomText: document.getElementById('bottomText').value,
        fontSize: parseInt(document.getElementById('fontSize').value),
        textColor: document.getElementById('textColor').value,
        strokeColor: document.getElementById('strokeColor').value,
        animation: document.getElementById('animation').value
    };
}

function drawFrame(time = 0) {
    const canvas = document.getElementById('memeCanvas');
    const ctx = canvas.getContext('2d');
    const settings = getSettings();

    // Draw source
    if (sourceType === 'video') {
        const video = document.getElementById('sourceVideo');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    } else {
        const img = document.getElementById('sourceImage');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }

    // Apply animation offset
    let offsetX = 0, offsetY = 0, scale = 1;

    switch (settings.animation) {
        case 'shake':
            offsetX = Math.sin(time * 30) * 3;
            offsetY = Math.cos(time * 25) * 2;
            break;
        case 'bounce':
            offsetY = Math.abs(Math.sin(time * 10)) * -10;
            break;
        case 'zoom':
            scale = 1 + Math.sin(time * 5) * 0.05;
            break;
    }

    // Draw text
    ctx.save();
    ctx.translate(canvas.width / 2, 0);
    ctx.scale(scale, scale);
    ctx.translate(-canvas.width / 2, 0);

    drawMemeText(ctx, settings.topText, canvas.width / 2 + offsetX, settings.fontSize + 10 + offsetY, settings);
    drawMemeText(ctx, settings.bottomText, canvas.width / 2 + offsetX, canvas.height - 20 + offsetY, settings);

    ctx.restore();
}

function drawMemeText(ctx, text, x, y, settings) {
    if (!text) return;

    ctx.font = `bold ${settings.fontSize}px Impact, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Stroke
    ctx.strokeStyle = settings.strokeColor;
    ctx.lineWidth = settings.fontSize / 10;
    ctx.strokeText(text.toUpperCase(), x, y);

    // Fill
    ctx.fillStyle = settings.textColor;
    ctx.fillText(text.toUpperCase(), x, y);
}

function previewMeme() {
    if (sourceType === 'video') {
        const video = document.getElementById('sourceVideo');
        if (isPlaying) {
            video.pause();
            isPlaying = false;
            if (animationId) cancelAnimationFrame(animationId);
        } else {
            video.play();
            isPlaying = true;
            animateVideo();
        }
    } else {
        isPlaying = !isPlaying;
        if (isPlaying) {
            animateImage();
        } else if (animationId) {
            cancelAnimationFrame(animationId);
        }
    }
}

function animateVideo() {
    const video = document.getElementById('sourceVideo');

    function render() {
        if (!isPlaying || video.paused || video.ended) {
            isPlaying = false;
            return;
        }
        drawFrame(video.currentTime);
        animationId = requestAnimationFrame(render);
    }

    render();
}

function animateImage() {
    const startTime = Date.now();

    function render() {
        if (!isPlaying) return;
        const time = (Date.now() - startTime) / 1000;
        drawFrame(time);
        animationId = requestAnimationFrame(render);
    }

    render();
}

async function generateMeme() {
    const t = texts[currentLang];
    const processBtn = document.getElementById('processBtn');
    processBtn.disabled = true;

    document.getElementById('progressSection').style.display = 'block';
    isPlaying = false;
    if (animationId) cancelAnimationFrame(animationId);

    const canvas = document.getElementById('memeCanvas');
    const settings = getSettings();

    const fps = 15;
    const duration = sourceType === 'video'
        ? document.getElementById('sourceVideo').duration
        : 3; // 3 seconds for image animations
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

    if (sourceType === 'video') {
        const video = document.getElementById('sourceVideo');
        video.currentTime = 0;

        for (let frame = 0; frame < totalFrames; frame++) {
            video.currentTime = frame / fps;
            await new Promise(resolve => video.onseeked = resolve);
            drawFrame(video.currentTime);

            const progress = ((frame + 1) / totalFrames) * 100;
            document.getElementById('progressFill').style.width = progress + '%';
            document.getElementById('progressText').textContent = `${t.processing} ${Math.round(progress)}%`;

            await new Promise(resolve => setTimeout(resolve, 1000 / fps));
        }
    } else {
        for (let frame = 0; frame < totalFrames; frame++) {
            const time = frame / fps;
            drawFrame(time);

            const progress = ((frame + 1) / totalFrames) * 100;
            document.getElementById('progressFill').style.width = progress + '%';
            document.getElementById('progressText').textContent = `${t.processing} ${Math.round(progress)}%`;

            await new Promise(resolve => setTimeout(resolve, 1000 / fps));
        }
    }

    mediaRecorder.stop();
    document.getElementById('progressSection').style.display = 'none';
}

function downloadResult() {
    if (!outputBlob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(outputBlob);
    a.download = 'meme.webm';
    a.click();
}

init();
