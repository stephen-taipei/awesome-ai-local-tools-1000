/**
 * Person Tracking Crop - Tool #374
 * Auto track and crop to person in video
 */

let currentLang = 'zh';
let model = null;
let videoFile = null;
let outputBlob = null;
let aspectRatio = '9:16';
let smoothness = 0.5;
let lastCenter = null;

const texts = {
    zh: {
        title: '影片人物追蹤裁切',
        subtitle: '自動追蹤人物並重新構圖',
        privacy: '100% 本地處理 · 零資料上傳',
        process: '🎯 追蹤裁切',
        download: '⬇️ 下載',
        upload: '拖放影片檔案至此或點擊上傳',
        uploadHint: '支援 MP4, WebM',
        loading: '載入模型中...',
        processing: '處理中...',
        complete: '處理完成！',
        aspectRatio: '輸出比例',
        smoothness: '追蹤平滑度'
    },
    en: {
        title: 'Person Tracking Crop',
        subtitle: 'Auto track and crop to person',
        privacy: '100% Local Processing · No Data Upload',
        process: '🎯 Track & Crop',
        download: '⬇️ Download',
        upload: 'Drop video file here or click to upload',
        uploadHint: 'Supports MP4, WebM',
        loading: 'Loading model...',
        processing: 'Processing...',
        complete: 'Processing complete!',
        aspectRatio: 'Output Ratio',
        smoothness: 'Tracking Smoothness'
    }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    setupFileUpload();
    document.getElementById('processBtn').addEventListener('click', processVideo);
    document.getElementById('downloadBtn').addEventListener('click', downloadResult);
    document.getElementById('aspectRatio').addEventListener('change', (e) => aspectRatio = e.target.value);
    document.getElementById('smoothness').addEventListener('input', (e) => {
        smoothness = parseFloat(e.target.value);
        document.getElementById('smoothValue').textContent = smoothness;
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

function getOutputDimensions(srcWidth, srcHeight) {
    const [w, h] = aspectRatio.split(':').map(Number);
    const ratio = w / h;
    let outW, outH;

    if (srcWidth / srcHeight > ratio) {
        outH = srcHeight;
        outW = Math.floor(srcHeight * ratio);
    } else {
        outW = srcWidth;
        outH = Math.floor(srcWidth / ratio);
    }

    return { width: outW, height: outH };
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

        const { width, height } = getOutputDimensions(video.videoWidth, video.videoHeight);
        canvas.width = width;
        canvas.height = height;

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
        lastCenter = null;

        for (let frame = 0; frame < totalFrames; frame++) {
            video.currentTime = frame / fps;
            await new Promise(resolve => video.onseeked = resolve);

            const predictions = await model.detect(video);
            const persons = predictions.filter(p => p.class === 'person');

            let centerX = video.videoWidth / 2;
            let centerY = video.videoHeight / 2;

            if (persons.length > 0) {
                const person = persons[0];
                const [x, y, w, h] = person.bbox;
                centerX = x + w / 2;
                centerY = y + h / 2;
            }

            // Smooth tracking
            if (lastCenter) {
                centerX = lastCenter.x + (centerX - lastCenter.x) * (1 - smoothness);
                centerY = lastCenter.y + (centerY - lastCenter.y) * (1 - smoothness);
            }
            lastCenter = { x: centerX, y: centerY };

            // Calculate crop region
            let srcX = Math.max(0, centerX - width / 2);
            let srcY = Math.max(0, centerY - height / 2);
            srcX = Math.min(srcX, video.videoWidth - width);
            srcY = Math.min(srcY, video.videoHeight - height);

            ctx.drawImage(video, srcX, srcY, width, height, 0, 0, width, height);

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
    a.download = 'person-tracked.webm';
    a.click();
}

init();
