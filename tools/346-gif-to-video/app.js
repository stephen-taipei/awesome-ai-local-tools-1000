/**
 * GIF to Video - Tool #346
 * Convert GIF to MP4/WebM video format
 */

let currentLang = 'zh';
let ffmpeg = null;
let gifFile = null;
let outputBlob = null;

const texts = {
    zh: {
        title: 'GIF 轉影片',
        subtitle: '將 GIF 轉換為 MP4/WebM 格式',
        privacy: '100% 本地處理 · 零資料上傳',
        format: '輸出格式',
        quality: '品質',
        qualityHigh: '高品質',
        qualityMedium: '中等',
        qualityLow: '低品質 (小檔案)',
        loop: '循環次數',
        process: '🔄 轉換',
        download: '⬇️ 下載',
        result: '轉換結果',
        upload: '拖放 GIF 檔案至此或點擊上傳',
        uploadHint: '支援 GIF 格式',
        processing: '處理中...',
        loading: '載入 FFmpeg...',
        converting: '轉換中...'
    },
    en: {
        title: 'GIF to Video',
        subtitle: 'Convert GIF to MP4/WebM format',
        privacy: '100% Local Processing · No Data Upload',
        format: 'Output Format',
        quality: 'Quality',
        qualityHigh: 'High Quality',
        qualityMedium: 'Medium',
        qualityLow: 'Low Quality (Small File)',
        loop: 'Loop Count',
        process: '🔄 Convert',
        download: '⬇️ Download',
        result: 'Result',
        upload: 'Drop GIF file here or click to upload',
        uploadHint: 'Supports GIF format',
        processing: 'Processing...',
        loading: 'Loading FFmpeg...',
        converting: 'Converting...'
    }
};

async function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    setupFileUpload();
    document.getElementById('processBtn').addEventListener('click', processGif);
    document.getElementById('downloadBtn').addEventListener('click', downloadVideo);
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
    document.getElementById('formatLabel').textContent = t.format;
    document.getElementById('qualityLabel').textContent = t.quality;
    const qualitySelect = document.getElementById('quality');
    qualitySelect.options[0].text = t.qualityHigh;
    qualitySelect.options[1].text = t.qualityMedium;
    qualitySelect.options[2].text = t.qualityLow;
    document.getElementById('loopLabel').textContent = t.loop;
    document.getElementById('processBtn').textContent = t.process;
    document.getElementById('downloadBtn').textContent = t.download;
    document.getElementById('resultTitle').textContent = t.result;
    document.querySelector('.upload-area p').textContent = t.upload;
    document.querySelector('.upload-hint').textContent = t.uploadHint;
}

function handleFile(file) {
    if (!file.type.includes('gif')) {
        alert('Please select a GIF file');
        return;
    }
    gifFile = file;
    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('previewLoaded').style.display = 'block';
    document.getElementById('fileInfo').textContent = `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
    document.getElementById('previewGif').src = URL.createObjectURL(file);
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

async function processGif() {
    if (!gifFile) return;

    const processBtn = document.getElementById('processBtn');
    const t = texts[currentLang];
    processBtn.textContent = t.loading;
    processBtn.disabled = true;
    document.getElementById('progressSection').style.display = 'block';
    document.getElementById('progressText').textContent = t.loading;

    try {
        await loadFFmpeg();
        document.getElementById('progressText').textContent = t.converting;

        const format = document.getElementById('outputFormat').value;
        const quality = document.getElementById('quality').value;
        const loopCount = parseInt(document.getElementById('loopCount').value);

        const { fetchFile } = FFmpegUtil;
        await ffmpeg.writeFile('input.gif', await fetchFile(gifFile));

        let crf = quality === 'high' ? '18' : quality === 'medium' ? '23' : '28';
        let outputFile = format === 'mp4' ? 'output.mp4' : 'output.webm';

        let args = ['-i', 'input.gif'];
        if (loopCount > 1) {
            args.push('-stream_loop', String(loopCount - 1));
        }

        if (format === 'mp4') {
            args.push('-c:v', 'libx264', '-crf', crf, '-pix_fmt', 'yuv420p', '-movflags', '+faststart');
        } else {
            args.push('-c:v', 'libvpx-vp9', '-crf', crf, '-b:v', '0');
        }
        args.push(outputFile);

        await ffmpeg.exec(args);

        const data = await ffmpeg.readFile(outputFile);
        outputBlob = new Blob([data.buffer], { type: format === 'mp4' ? 'video/mp4' : 'video/webm' });

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
    const format = document.getElementById('outputFormat').value;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(outputBlob);
    a.download = `converted.${format}`;
    a.click();
}

init();
