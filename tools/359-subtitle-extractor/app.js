/**
 * Subtitle Extractor - Tool #359
 * Extract embedded subtitles from video files
 */

let currentLang = 'zh';
let ffmpeg = null;
let videoFile = null;
let subtitleText = '';

const texts = {
    zh: {
        title: '字幕提取',
        subtitle: '從影片提取內嵌字幕',
        privacy: '100% 本地處理 · 零資料上傳',
        extract: '🔄 提取',
        download: '⬇️ 下載',
        upload: '拖放影片檔案至此或點擊上傳',
        uploadHint: '支援 MKV, MP4 (含內嵌字幕)',
        loading: '載入 FFmpeg...',
        extracting: '提取中...',
        noSubtitle: '未找到字幕軌道',
        track: '字幕軌道'
    },
    en: {
        title: 'Subtitle Extractor',
        subtitle: 'Extract embedded subtitles from video',
        privacy: '100% Local Processing · No Data Upload',
        extract: '🔄 Extract',
        download: '⬇️ Download',
        upload: 'Drop video file here or click to upload',
        uploadHint: 'Supports MKV, MP4 (with embedded subtitles)',
        loading: 'Loading FFmpeg...',
        extracting: 'Extracting...',
        noSubtitle: 'No subtitle tracks found',
        track: 'Subtitle Track'
    }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    setupFileUpload();
    document.getElementById('extractBtn').addEventListener('click', extractSubtitle);
    document.getElementById('downloadBtn').addEventListener('click', downloadSubtitle);
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
    document.getElementById('extractBtn').textContent = t.extract;
    document.getElementById('downloadBtn').textContent = t.download;
    document.querySelector('.upload-area p').textContent = t.upload;
    document.querySelector('.upload-hint').textContent = t.uploadHint;
}

function handleFile(file) {
    videoFile = file;
    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('fileLoaded').style.display = 'block';
    document.getElementById('fileInfo').textContent = `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;

    // Show a simple track selection
    const trackList = document.getElementById('trackList');
    trackList.innerHTML = `
        <label class="track-item selected">
            <input type="radio" name="track" value="0" checked>
            <span>${texts[currentLang].track} 1</span>
        </label>
    `;
    document.getElementById('tracksSection').style.display = 'block';
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

async function extractSubtitle() {
    if (!videoFile) return;

    const extractBtn = document.getElementById('extractBtn');
    const t = texts[currentLang];
    extractBtn.textContent = t.loading;
    extractBtn.disabled = true;
    document.getElementById('progressSection').style.display = 'block';

    try {
        await loadFFmpeg();
        document.getElementById('progressText').textContent = t.extracting;

        const { fetchFile } = FFmpegUtil;
        await ffmpeg.writeFile('input.mkv', await fetchFile(videoFile));

        await ffmpeg.exec(['-i', 'input.mkv', '-map', '0:s:0', '-c:s', 'srt', 'output.srt']);

        const data = await ffmpeg.readFile('output.srt');
        subtitleText = new TextDecoder().decode(data);

        if (subtitleText.trim()) {
            document.getElementById('resultText').value = subtitleText;
            document.getElementById('resultSection').style.display = 'block';
            document.getElementById('downloadBtn').disabled = false;
        } else {
            alert(t.noSubtitle);
        }
    } catch (error) {
        console.error('Error:', error);
        alert(texts[currentLang].noSubtitle);
    }

    document.getElementById('progressSection').style.display = 'none';
    extractBtn.textContent = t.extract;
    extractBtn.disabled = false;
}

function downloadSubtitle() {
    if (!subtitleText) return;
    const blob = new Blob([subtitleText], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'extracted.srt';
    a.click();
}

init();
