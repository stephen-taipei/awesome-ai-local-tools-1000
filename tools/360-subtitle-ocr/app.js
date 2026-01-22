/**
 * Subtitle OCR - Tool #360
 * OCR recognition for hardcoded subtitles in videos
 */

let currentLang = 'zh';
let worker = null;
let imageData = null;
let video = null;
let frames = [];
let currentFrame = 0;
let regionType = 'bottom';
let resultText = '';

const texts = {
    zh: {
        title: '字幕 OCR',
        subtitle: '識別影片中的硬字幕',
        privacy: '100% 本地處理 · 零資料上傳',
        ocr: '🔍 識別字幕',
        download: '⬇️ 下載',
        upload: '拖放影片或圖片至此或點擊上傳',
        uploadHint: '支援影片截圖或帶字幕的圖片',
        loading: '載入 OCR 引擎...',
        recognizing: '識別中...',
        region: '字幕區域',
        regionHint: '在預覽圖上拖曳選擇字幕區域，或使用預設',
        bottom: '底部字幕',
        top: '頂部字幕',
        custom: '自訂區域',
        language: '語言',
        result: '識別結果',
        prevFrame: '◀ 上一幀',
        nextFrame: '下一幀 ▶',
        frame: '幀'
    },
    en: {
        title: 'Subtitle OCR',
        subtitle: 'OCR recognition for hardcoded subtitles',
        privacy: '100% Local Processing · No Data Upload',
        ocr: '🔍 Recognize',
        download: '⬇️ Download',
        upload: 'Drop video or image here or click to upload',
        uploadHint: 'Supports video screenshots or images with subtitles',
        loading: 'Loading OCR engine...',
        recognizing: 'Recognizing...',
        region: 'Subtitle Region',
        regionHint: 'Drag to select subtitle region, or use presets',
        bottom: 'Bottom',
        top: 'Top',
        custom: 'Custom',
        language: 'Language',
        result: 'Recognition Result',
        prevFrame: '◀ Prev',
        nextFrame: 'Next ▶',
        frame: 'Frame'
    }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    setupFileUpload();
    setupRegionPresets();
    document.getElementById('ocrBtn').addEventListener('click', performOCR);
    document.getElementById('downloadBtn').addEventListener('click', downloadResult);
    document.getElementById('prevFrame').addEventListener('click', () => changeFrame(-1));
    document.getElementById('nextFrame').addEventListener('click', () => changeFrame(1));
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

function setupRegionPresets() {
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            regionType = btn.dataset.region;
        });
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
    document.getElementById('ocrBtn').textContent = t.ocr;
    document.getElementById('downloadBtn').textContent = t.download;
    document.querySelector('.upload-area p').textContent = t.upload;
    document.querySelector('.upload-hint').textContent = t.uploadHint;
    document.querySelector('.region-section h3').textContent = t.region;
    document.querySelector('.hint').textContent = t.regionHint;
    document.querySelectorAll('.preset-btn')[0].textContent = t.bottom;
    document.querySelectorAll('.preset-btn')[1].textContent = t.top;
    document.querySelectorAll('.preset-btn')[2].textContent = t.custom;
    document.getElementById('prevFrame').textContent = t.prevFrame;
    document.getElementById('nextFrame').textContent = t.nextFrame;
}

async function handleFile(file) {
    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('previewSection').style.display = 'block';
    document.getElementById('regionSection').style.display = 'block';
    document.getElementById('optionsSection').style.display = 'block';
    document.getElementById('actionSection').style.display = 'flex';

    const canvas = document.getElementById('previewCanvas');
    const ctx = canvas.getContext('2d');

    if (file.type.startsWith('video/')) {
        // Handle video - extract frames
        video = document.createElement('video');
        video.src = URL.createObjectURL(file);
        video.muted = true;
        await new Promise(resolve => video.onloadedmetadata = resolve);

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Extract a few frames
        frames = [];
        const duration = video.duration;
        const frameCount = Math.min(10, Math.floor(duration));

        for (let i = 0; i < frameCount; i++) {
            video.currentTime = (duration / frameCount) * i + 1;
            await new Promise(resolve => video.onseeked = resolve);
            ctx.drawImage(video, 0, 0);
            frames.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        }

        currentFrame = 0;
        ctx.putImageData(frames[0], 0, 0);
        document.getElementById('frameControls').style.display = 'flex';
        updateFrameInfo();
    } else {
        // Handle image
        const img = new Image();
        img.src = URL.createObjectURL(file);
        await new Promise(resolve => img.onload = resolve);

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        document.getElementById('frameControls').style.display = 'none';
    }
}

function changeFrame(delta) {
    if (frames.length === 0) return;
    currentFrame = Math.max(0, Math.min(frames.length - 1, currentFrame + delta));
    const canvas = document.getElementById('previewCanvas');
    const ctx = canvas.getContext('2d');
    ctx.putImageData(frames[currentFrame], 0, 0);
    updateFrameInfo();
}

function updateFrameInfo() {
    const t = texts[currentLang];
    document.getElementById('frameInfo').textContent = `${t.frame} ${currentFrame + 1}/${frames.length}`;
}

function getSubtitleRegion(canvas) {
    const width = canvas.width;
    const height = canvas.height;

    switch (regionType) {
        case 'top':
            return { x: 0, y: 0, width: width, height: Math.floor(height * 0.25) };
        case 'bottom':
        default:
            return { x: 0, y: Math.floor(height * 0.75), width: width, height: Math.floor(height * 0.25) };
    }
}

async function performOCR() {
    const ocrBtn = document.getElementById('ocrBtn');
    const t = texts[currentLang];
    ocrBtn.textContent = t.loading;
    ocrBtn.disabled = true;
    document.getElementById('progressSection').style.display = 'block';

    try {
        const ocrLang = document.getElementById('ocrLang').value;

        // Initialize Tesseract worker
        worker = await Tesseract.createWorker(ocrLang, 1, {
            logger: m => {
                if (m.status === 'recognizing text') {
                    document.getElementById('progressFill').style.width = Math.round(m.progress * 100) + '%';
                    document.getElementById('progressText').textContent = t.recognizing;
                }
            }
        });

        const canvas = document.getElementById('previewCanvas');
        const region = getSubtitleRegion(canvas);

        // Create a temporary canvas for the subtitle region
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = region.width;
        tempCanvas.height = region.height;
        const tempCtx = tempCanvas.getContext('2d');

        let allText = [];

        if (frames.length > 0) {
            // Process multiple frames
            for (let i = 0; i < frames.length; i++) {
                const ctx = canvas.getContext('2d');
                ctx.putImageData(frames[i], 0, 0);
                tempCtx.drawImage(canvas, region.x, region.y, region.width, region.height, 0, 0, region.width, region.height);

                const { data: { text } } = await worker.recognize(tempCanvas);
                if (text.trim()) {
                    allText.push(`[${t.frame} ${i + 1}]\n${text.trim()}`);
                }

                document.getElementById('progressFill').style.width = Math.round(((i + 1) / frames.length) * 100) + '%';
            }
            resultText = allText.join('\n\n');
        } else {
            // Process single image
            tempCtx.drawImage(canvas, region.x, region.y, region.width, region.height, 0, 0, region.width, region.height);
            const { data: { text } } = await worker.recognize(tempCanvas);
            resultText = text.trim();
        }

        await worker.terminate();

        document.getElementById('resultText').value = resultText;
        document.getElementById('resultSection').style.display = 'block';
        document.getElementById('downloadBtn').disabled = false;
    } catch (error) {
        console.error('OCR Error:', error);
        alert('OCR failed: ' + error.message);
    }

    document.getElementById('progressSection').style.display = 'none';
    ocrBtn.textContent = t.ocr;
    ocrBtn.disabled = false;
}

function downloadResult() {
    if (!resultText) return;
    const blob = new Blob([resultText], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'subtitle-ocr.txt';
    a.click();
}

init();
