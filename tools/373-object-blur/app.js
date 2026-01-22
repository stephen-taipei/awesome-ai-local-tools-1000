/**
 * Object Blur - Tool #373
 * Automatically blur objects like license plates in video
 */

let currentLang = 'zh';
let model = null;
let videoFile = null;
let outputBlob = null;
let blurStrength = 20;
let selectedObjects = ['car'];

const texts = {
    zh: {
        title: '影片物件模糊',
        subtitle: '自動模糊指定物件（車牌等）',
        privacy: '100% 本地處理 · 零資料上傳',
        process: '🔲 模糊物件',
        download: '⬇️ 下載',
        upload: '拖放影片檔案至此或點擊上傳',
        uploadHint: '支援 MP4, WebM',
        loading: '載入模型中...',
        processing: '處理中...',
        complete: '處理完成！',
        selectObjects: '選擇要模糊的物件類型'
    },
    en: {
        title: 'Object Blur',
        subtitle: 'Automatically blur objects like license plates',
        privacy: '100% Local Processing · No Data Upload',
        process: '🔲 Blur Objects',
        download: '⬇️ Download',
        upload: 'Drop video file here or click to upload',
        uploadHint: 'Supports MP4, WebM',
        loading: 'Loading model...',
        processing: 'Processing...',
        complete: 'Processing complete!',
        selectObjects: 'Select object types to blur'
    }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    setupFileUpload();
    document.getElementById('processBtn').addEventListener('click', processVideo);
    document.getElementById('downloadBtn').addEventListener('click', downloadResult);
    document.getElementById('blurStrength').addEventListener('input', (e) => {
        blurStrength = parseInt(e.target.value);
        document.getElementById('blurValue').textContent = blurStrength;
    });

    document.querySelectorAll('.object-types input').forEach(cb => {
        cb.addEventListener('change', () => {
            selectedObjects = Array.from(document.querySelectorAll('.object-types input:checked')).map(c => c.value);
        });
    });
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

function handleFile(file) {
    videoFile = file;
    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('previewSection').style.display = 'grid';
    document.getElementById('optionsSection').style.display = 'block';
    document.getElementById('actionSection').style.display = 'flex';

    const video = document.getElementById('inputVideo');
    video.src = URL.createObjectURL(file);
}

async function processVideo() {
    const t = texts[currentLang];
    const processBtn = document.getElementById('processBtn');
    processBtn.disabled = true;
    processBtn.textContent = t.loading;

    document.getElementById('progressSection').style.display = 'block';

    try {
        if (!model) {
            model = await cocoSsd.load();
        }

        const video = document.getElementById('inputVideo');
        const canvas = document.getElementById('outputCanvas');
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
        };

        mediaRecorder.start();

        for (let frame = 0; frame < totalFrames; frame++) {
            video.currentTime = frame / fps;
            await new Promise(resolve => video.onseeked = resolve);

            ctx.drawImage(video, 0, 0);

            const predictions = await model.detect(video);

            predictions.forEach(prediction => {
                if (selectedObjects.includes(prediction.class)) {
                    const [x, y, width, height] = prediction.bbox;
                    ctx.filter = `blur(${blurStrength}px)`;
                    ctx.drawImage(canvas, x, y, width, height, x, y, width, height);
                    ctx.filter = 'none';
                }
            });

            const progress = ((frame + 1) / totalFrames) * 100;
            document.getElementById('progressFill').style.width = progress + '%';
            document.getElementById('progressText').textContent = `${t.processing} ${Math.round(progress)}%`;

            await new Promise(resolve => setTimeout(resolve, 1000 / fps));
        }

        mediaRecorder.stop();

    } catch (error) {
        console.error('Error:', error);
    }

    document.getElementById('progressSection').style.display = 'none';
    processBtn.disabled = false;
    processBtn.textContent = t.process;
}

function downloadResult() {
    if (!outputBlob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(outputBlob);
    a.download = 'object-blurred.webm';
    a.click();
}

init();
