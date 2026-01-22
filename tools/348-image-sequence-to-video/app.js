/**
 * Image Sequence to Video - Tool #348
 * Create video from image sequence using Canvas
 */

let currentLang = 'zh';
let images = [];
let outputBlob = null;

const texts = {
    zh: {
        title: '圖片序列轉影片',
        subtitle: '將圖片序列合成影片',
        privacy: '100% 本地處理 · 零資料上傳',
        fps: '幀率 (FPS)',
        format: '輸出格式',
        duration: '每張持續',
        process: '🔄 生成影片',
        download: '⬇️ 下載',
        result: '生成結果',
        upload: '拖放多張圖片至此或點擊上傳',
        uploadHint: '支援 PNG, JPG, WebP',
        processing: '處理中...',
        rendering: '渲染幀 {current}/{total}...',
        loaded: '已載入 {count} 張圖片'
    },
    en: {
        title: 'Image Sequence to Video',
        subtitle: 'Create video from image sequence',
        privacy: '100% Local Processing · No Data Upload',
        fps: 'Frame Rate',
        format: 'Output Format',
        duration: 'Duration Each',
        process: '🔄 Generate Video',
        download: '⬇️ Download',
        result: 'Result',
        upload: 'Drop multiple images here or click to upload',
        uploadHint: 'Supports PNG, JPG, WebP',
        processing: 'Processing...',
        rendering: 'Rendering frame {current}/{total}...',
        loaded: 'Loaded {count} images'
    }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    setupFileUpload();
    setupControls();
    document.getElementById('processBtn').addEventListener('click', generateVideo);
    document.getElementById('downloadBtn').addEventListener('click', downloadVideo);
}

function setupFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('drag-over'); });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));
    uploadArea.addEventListener('drop', (e) => { e.preventDefault(); uploadArea.classList.remove('drag-over'); if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files); });
    fileInput.addEventListener('change', (e) => { if (e.target.files.length) handleFiles(e.target.files); });
}

function setupControls() {
    document.getElementById('duration').addEventListener('input', (e) => {
        document.getElementById('durationValue').textContent = e.target.value + ' ms';
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
    document.getElementById('fpsLabel').textContent = t.fps;
    document.getElementById('formatLabel').textContent = t.format;
    document.getElementById('durationLabel').textContent = t.duration;
    document.getElementById('processBtn').textContent = t.process;
    document.getElementById('downloadBtn').textContent = t.download;
    document.getElementById('resultTitle').textContent = t.result;
    document.querySelector('.upload-area p').textContent = t.upload;
    document.querySelector('.upload-hint').textContent = t.uploadHint;
}

async function handleFiles(files) {
    images = [];
    const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'));
    fileArray.sort((a, b) => a.name.localeCompare(b.name));

    for (const file of fileArray) {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        await new Promise(resolve => { img.onload = resolve; });
        images.push(img);
    }

    if (images.length === 0) return;

    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('imagesLoaded').style.display = 'block';
    document.getElementById('fileInfo').textContent = texts[currentLang].loaded.replace('{count}', images.length);

    const preview = document.getElementById('imagePreview');
    preview.innerHTML = '';
    images.slice(0, 20).forEach(img => {
        const imgEl = document.createElement('img');
        imgEl.src = img.src;
        preview.appendChild(imgEl);
    });

    document.getElementById('optionsSection').style.display = 'block';
    document.getElementById('actionSection').style.display = 'flex';
}

async function generateVideo() {
    if (images.length === 0) return;

    const processBtn = document.getElementById('processBtn');
    const t = texts[currentLang];
    processBtn.textContent = t.processing;
    processBtn.disabled = true;
    document.getElementById('progressSection').style.display = 'block';

    const fps = parseInt(document.getElementById('fps').value);
    const format = document.getElementById('format').value;
    const frameDuration = parseInt(document.getElementById('duration').value);

    const canvas = document.createElement('canvas');
    canvas.width = images[0].naturalWidth;
    canvas.height = images[0].naturalHeight;
    const ctx = canvas.getContext('2d');

    const stream = canvas.captureStream(fps);
    const recorder = new MediaRecorder(stream, {
        mimeType: format === 'webm' ? 'video/webm;codecs=vp9' : 'video/webm'
    });

    const chunks = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);

    recorder.start();

    const framesPerImage = Math.round((frameDuration / 1000) * fps);
    const totalFrames = images.length * framesPerImage;
    let currentFrame = 0;

    for (let i = 0; i < images.length; i++) {
        ctx.drawImage(images[i], 0, 0, canvas.width, canvas.height);

        for (let f = 0; f < framesPerImage; f++) {
            await new Promise(resolve => setTimeout(resolve, 1000 / fps));
            currentFrame++;
            const progress = (currentFrame / totalFrames) * 100;
            document.getElementById('progressFill').style.width = progress + '%';
            document.getElementById('progressText').textContent = t.rendering.replace('{current}', currentFrame).replace('{total}', totalFrames);
        }
    }

    recorder.stop();

    await new Promise(resolve => { recorder.onstop = resolve; });

    outputBlob = new Blob(chunks, { type: format === 'webm' ? 'video/webm' : 'video/webm' });
    document.getElementById('resultSection').style.display = 'block';
    document.getElementById('resultVideo').src = URL.createObjectURL(outputBlob);
    document.getElementById('downloadBtn').disabled = false;
    document.getElementById('progressSection').style.display = 'none';
    processBtn.textContent = t.process;
    processBtn.disabled = false;
}

function downloadVideo() {
    if (!outputBlob) return;
    const format = document.getElementById('format').value;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(outputBlob);
    a.download = `slideshow.${format}`;
    a.click();
}

init();
