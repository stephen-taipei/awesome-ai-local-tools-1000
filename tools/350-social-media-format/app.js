/**
 * Social Media Format - Tool #350
 * Convert video to optimal formats for social media platforms
 */

let currentLang = 'zh';
let ffmpeg = null;
let videoFile = null;
let outputBlob = null;

const presets = {
    'instagram-feed': { width: 1080, height: 1080, aspect: '1:1', maxDuration: 60 },
    'instagram-story': { width: 1080, height: 1920, aspect: '9:16', maxDuration: 60 },
    'instagram-reels': { width: 1080, height: 1920, aspect: '9:16', maxDuration: 90 },
    'tiktok': { width: 1080, height: 1920, aspect: '9:16', maxDuration: 180 },
    'youtube': { width: 1920, height: 1080, aspect: '16:9', maxDuration: null },
    'youtube-shorts': { width: 1080, height: 1920, aspect: '9:16', maxDuration: 60 },
    'twitter': { width: 1280, height: 720, aspect: '16:9', maxDuration: 140 },
    'facebook': { width: 1280, height: 720, aspect: '16:9', maxDuration: 240 }
};

const texts = {
    zh: {
        title: '社群媒體格式',
        subtitle: '轉換為各平台最佳格式',
        privacy: '100% 本地處理 · 零資料上傳',
        platform: '平台',
        resolution: '解析度:',
        aspect: '比例:',
        maxDuration: '最長時間:',
        seconds: '秒',
        unlimited: '無限制',
        process: '🔄 轉換',
        download: '⬇️ 下載',
        result: '轉換結果',
        upload: '拖放影片檔案至此或點擊上傳',
        uploadHint: '支援 MP4, WebM, MOV',
        loading: '載入 FFmpeg...',
        converting: '轉換中...'
    },
    en: {
        title: 'Social Media Format',
        subtitle: 'Convert to optimal format for each platform',
        privacy: '100% Local Processing · No Data Upload',
        platform: 'Platform',
        resolution: 'Resolution:',
        aspect: 'Aspect:',
        maxDuration: 'Max Duration:',
        seconds: 'sec',
        unlimited: 'Unlimited',
        process: '🔄 Convert',
        download: '⬇️ Download',
        result: 'Result',
        upload: 'Drop video file here or click to upload',
        uploadHint: 'Supports MP4, WebM, MOV',
        loading: 'Loading FFmpeg...',
        converting: 'Converting...'
    }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    setupFileUpload();
    document.getElementById('platform').addEventListener('change', updatePresetInfo);
    document.getElementById('processBtn').addEventListener('click', processVideo);
    document.getElementById('downloadBtn').addEventListener('click', downloadVideo);
    updatePresetInfo();
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

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');
    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.getElementById('platformLabel').textContent = t.platform;
    document.getElementById('resLabel').textContent = t.resolution;
    document.getElementById('aspectLabel').textContent = t.aspect;
    document.getElementById('maxDurLabel').textContent = t.maxDuration;
    document.getElementById('processBtn').textContent = t.process;
    document.getElementById('downloadBtn').textContent = t.download;
    document.getElementById('resultTitle').textContent = t.result;
    document.querySelector('.upload-area p').textContent = t.upload;
    document.querySelector('.upload-hint').textContent = t.uploadHint;
    updatePresetInfo();
}

function updatePresetInfo() {
    const platform = document.getElementById('platform').value;
    const preset = presets[platform];
    const t = texts[currentLang];
    document.getElementById('resValue').textContent = `${preset.width}x${preset.height}`;
    document.getElementById('aspectValue').textContent = preset.aspect;
    document.getElementById('maxDurValue').textContent = preset.maxDuration ? `${preset.maxDuration} ${t.seconds}` : t.unlimited;
}

function handleFile(file) {
    if (!file.type.startsWith('video/')) {
        alert('Please select a video file');
        return;
    }
    videoFile = file;
    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('videoLoaded').style.display = 'block';
    document.getElementById('fileInfo').textContent = `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
    document.getElementById('previewVideo').src = URL.createObjectURL(file);
    document.getElementById('optionsSection').style.display = 'block';
    document.getElementById('actionSection').style.display = 'flex';
}

async function loadFFmpeg() {
    if (ffmpeg) return;
    const { FFmpeg } = FFmpegWASM;
    ffmpeg = new FFmpeg();
    ffmpeg.on('progress', ({ progress }) => {
        document.getElementById('progressFill').style.width = Math.round(progress * 100) + '%';
    });
    await ffmpeg.load({
        coreURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js',
        wasmURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm'
    });
}

async function processVideo() {
    if (!videoFile) return;

    const processBtn = document.getElementById('processBtn');
    const t = texts[currentLang];
    processBtn.textContent = t.loading;
    processBtn.disabled = true;
    document.getElementById('progressSection').style.display = 'block';
    document.getElementById('progressText').textContent = t.loading;

    try {
        await loadFFmpeg();
        document.getElementById('progressText').textContent = t.converting;

        const platform = document.getElementById('platform').value;
        const preset = presets[platform];

        const { fetchFile } = FFmpegUtil;
        await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));

        const args = [
            '-i', 'input.mp4',
            '-vf', `scale=${preset.width}:${preset.height}:force_original_aspect_ratio=decrease,pad=${preset.width}:${preset.height}:(ow-iw)/2:(oh-ih)/2:black`,
            '-c:v', 'libx264',
            '-crf', '23',
            '-preset', 'fast',
            '-c:a', 'aac',
            '-b:a', '128k'
        ];

        if (preset.maxDuration) {
            args.push('-t', String(preset.maxDuration));
        }

        args.push('-movflags', '+faststart', 'output.mp4');

        await ffmpeg.exec(args);

        const data = await ffmpeg.readFile('output.mp4');
        outputBlob = new Blob([data.buffer], { type: 'video/mp4' });

        document.getElementById('resultSection').style.display = 'block';
        document.getElementById('resultVideo').src = URL.createObjectURL(outputBlob);
        document.getElementById('downloadBtn').disabled = false;
        document.getElementById('progressSection').style.display = 'none';
    } catch (error) {
        console.error('Error:', error);
        alert('Conversion failed: ' + error.message);
    }

    processBtn.textContent = t.process;
    processBtn.disabled = false;
}

function downloadVideo() {
    if (!outputBlob) return;
    const platform = document.getElementById('platform').value;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(outputBlob);
    a.download = `${platform}-video.mp4`;
    a.click();
}

init();
