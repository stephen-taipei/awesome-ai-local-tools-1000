/**
 * Slideshow Maker - Tool #381
 * Create slideshow videos from images
 */

let currentLang = 'zh';
let images = [];
let outputBlob = null;
let duration = 3;
let transition = 'fade';
let transitionDuration = 0.5;
let outputSize = '1920x1080';
let isPlaying = false;

const texts = {
    zh: {
        title: '幻燈片製作',
        subtitle: '從圖片製作精美幻燈片影片',
        privacy: '100% 本地處理 · 零資料上傳',
        preview: '👁️ 預覽',
        process: '🎬 生成影片',
        download: '⬇️ 下載',
        upload: '拖放多張圖片至此或點擊上傳',
        uploadHint: '支援 JPG, PNG, WebP',
        imageList: '圖片列表',
        duration: '每張時長 (秒)',
        transition: '轉場效果',
        transitionDuration: '轉場時長 (秒)',
        outputSize: '輸出尺寸',
        processing: '生成中...',
        complete: '生成完成！',
        fade: '淡入淡出',
        slide: '滑動',
        zoom: '縮放',
        none: '無'
    },
    en: {
        title: 'Slideshow Maker',
        subtitle: 'Create slideshow videos from images',
        privacy: '100% Local Processing · No Data Upload',
        preview: '👁️ Preview',
        process: '🎬 Generate',
        download: '⬇️ Download',
        upload: 'Drop images here or click to upload',
        uploadHint: 'Supports JPG, PNG, WebP',
        imageList: 'Image List',
        duration: 'Duration per slide (sec)',
        transition: 'Transition',
        transitionDuration: 'Transition Duration (sec)',
        outputSize: 'Output Size',
        processing: 'Generating...',
        complete: 'Complete!',
        fade: 'Fade',
        slide: 'Slide',
        zoom: 'Zoom',
        none: 'None'
    }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    setupFileUpload();
    document.getElementById('previewBtn').addEventListener('click', previewSlideshow);
    document.getElementById('processBtn').addEventListener('click', generateVideo);
    document.getElementById('downloadBtn').addEventListener('click', downloadResult);

    document.getElementById('duration').addEventListener('input', (e) => {
        duration = parseFloat(e.target.value);
        document.getElementById('durationValue').textContent = duration;
    });
    document.getElementById('transition').addEventListener('change', (e) => transition = e.target.value);
    document.getElementById('transitionDuration').addEventListener('input', (e) => {
        transitionDuration = parseFloat(e.target.value);
        document.getElementById('transitionDurationValue').textContent = transitionDuration;
    });
    document.getElementById('outputSize').addEventListener('change', (e) => outputSize = e.target.value);
}

function setupFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', (e) => e.preventDefault());
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        handleFiles(e.dataTransfer.files);
    });
    fileInput.addEventListener('change', (e) => handleFiles(e.target.files));
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

async function handleFiles(files) {
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));

    for (const file of imageFiles) {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        await new Promise(resolve => img.onload = resolve);
        images.push({ file, img, url: img.src });
    }

    updateImageList();

    if (images.length > 0) {
        document.getElementById('uploadArea').style.display = 'none';
        document.getElementById('imagesPreview').style.display = 'block';
        document.getElementById('optionsSection').style.display = 'block';
        document.getElementById('actionSection').style.display = 'flex';
    }
}

function updateImageList() {
    const list = document.getElementById('imagesList');
    list.innerHTML = '';

    images.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'image-item';
        div.draggable = true;
        div.innerHTML = `
            <img src="${item.url}" alt="Image ${index + 1}">
            <button class="remove-btn" data-index="${index}">×</button>
            <span class="order">${index + 1}</span>
        `;

        div.querySelector('.remove-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            removeImage(index);
        });

        div.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', index);
        });

        div.addEventListener('dragover', (e) => e.preventDefault());

        div.addEventListener('drop', (e) => {
            e.preventDefault();
            const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
            const toIndex = index;
            if (fromIndex !== toIndex) {
                const [item] = images.splice(fromIndex, 1);
                images.splice(toIndex, 0, item);
                updateImageList();
            }
        });

        list.appendChild(div);
    });

    document.getElementById('imageCount').textContent = images.length;
}

function removeImage(index) {
    images.splice(index, 1);
    updateImageList();
    if (images.length === 0) {
        document.getElementById('uploadArea').style.display = 'block';
        document.getElementById('imagesPreview').style.display = 'none';
        document.getElementById('optionsSection').style.display = 'none';
        document.getElementById('actionSection').style.display = 'none';
    }
}

function getOutputDimensions() {
    const [w, h] = outputSize.split('x').map(Number);
    return { width: w, height: h };
}

function drawImageFit(ctx, img, width, height) {
    const imgRatio = img.width / img.height;
    const canvasRatio = width / height;

    let drawWidth, drawHeight, drawX, drawY;

    if (imgRatio > canvasRatio) {
        drawHeight = height;
        drawWidth = img.width * (height / img.height);
        drawX = (width - drawWidth) / 2;
        drawY = 0;
    } else {
        drawWidth = width;
        drawHeight = img.height * (width / img.width);
        drawX = 0;
        drawY = (height - drawHeight) / 2;
    }

    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
}

async function previewSlideshow() {
    if (images.length === 0) return;

    document.getElementById('previewSection').style.display = 'block';
    const canvas = document.getElementById('previewCanvas');
    const ctx = canvas.getContext('2d');
    const { width, height } = getOutputDimensions();

    canvas.width = width;
    canvas.height = height;

    isPlaying = true;
    let currentIndex = 0;
    const fps = 30;
    const frameDuration = 1000 / fps;
    const slideFrames = duration * fps;
    const transitionFrames = transitionDuration * fps;

    async function animate() {
        if (!isPlaying) return;

        const totalFramesPerSlide = slideFrames + transitionFrames;

        for (let i = 0; i < images.length && isPlaying; i++) {
            for (let frame = 0; frame < totalFramesPerSlide && isPlaying; frame++) {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, width, height);

                const currentImg = images[i].img;
                const nextImg = images[(i + 1) % images.length].img;

                if (frame < slideFrames) {
                    drawImageFit(ctx, currentImg, width, height);
                } else {
                    const t = (frame - slideFrames) / transitionFrames;
                    applyTransition(ctx, currentImg, nextImg, t, width, height);
                }

                await new Promise(resolve => setTimeout(resolve, frameDuration));
            }
        }

        if (isPlaying) animate();
    }

    animate();
}

function applyTransition(ctx, img1, img2, t, width, height) {
    switch (transition) {
        case 'fade':
            ctx.globalAlpha = 1 - t;
            drawImageFit(ctx, img1, width, height);
            ctx.globalAlpha = t;
            drawImageFit(ctx, img2, width, height);
            ctx.globalAlpha = 1;
            break;

        case 'slide':
            ctx.save();
            ctx.translate(-width * t, 0);
            drawImageFit(ctx, img1, width, height);
            ctx.translate(width, 0);
            drawImageFit(ctx, img2, width, height);
            ctx.restore();
            break;

        case 'zoom':
            const scale1 = 1 + t * 0.2;
            const scale2 = 0.8 + t * 0.2;
            ctx.globalAlpha = 1 - t;
            ctx.save();
            ctx.translate(width / 2, height / 2);
            ctx.scale(scale1, scale1);
            ctx.translate(-width / 2, -height / 2);
            drawImageFit(ctx, img1, width, height);
            ctx.restore();
            ctx.globalAlpha = t;
            ctx.save();
            ctx.translate(width / 2, height / 2);
            ctx.scale(scale2, scale2);
            ctx.translate(-width / 2, -height / 2);
            drawImageFit(ctx, img2, width, height);
            ctx.restore();
            ctx.globalAlpha = 1;
            break;

        default:
            if (t < 0.5) {
                drawImageFit(ctx, img1, width, height);
            } else {
                drawImageFit(ctx, img2, width, height);
            }
    }
}

async function generateVideo() {
    if (images.length === 0) return;

    isPlaying = false;
    const t = texts[currentLang];
    const processBtn = document.getElementById('processBtn');
    processBtn.disabled = true;

    document.getElementById('progressSection').style.display = 'block';
    document.getElementById('previewSection').style.display = 'block';

    const canvas = document.getElementById('previewCanvas');
    const ctx = canvas.getContext('2d');
    const { width, height } = getOutputDimensions();

    canvas.width = width;
    canvas.height = height;

    const fps = 30;
    const slideFrames = Math.floor(duration * fps);
    const transitionFrames = Math.floor(transitionDuration * fps);
    const totalFramesPerSlide = slideFrames + transitionFrames;
    const totalFrames = totalFramesPerSlide * images.length;

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

    let frameCount = 0;

    for (let i = 0; i < images.length; i++) {
        for (let frame = 0; frame < totalFramesPerSlide; frame++) {
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, width, height);

            const currentImg = images[i].img;
            const nextImg = images[(i + 1) % images.length].img;

            if (frame < slideFrames) {
                drawImageFit(ctx, currentImg, width, height);
            } else {
                const transitionT = (frame - slideFrames) / transitionFrames;
                applyTransition(ctx, currentImg, nextImg, transitionT, width, height);
            }

            frameCount++;
            const progress = (frameCount / totalFrames) * 100;
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
    a.download = 'slideshow.webm';
    a.click();
}

init();
