/**
 * Hardcoded Subtitle - Tool #356
 * Burn subtitles into video using FFmpeg
 */

let currentLang = 'zh';
let ffmpeg = null;
let videoFile = null;
let subtitleFile = null;
let outputBlob = null;

const texts = {
    zh: {
        title: '硬字幕嵌入',
        subtitle: '將字幕燒錄至影片中',
        privacy: '100% 本地處理 · 零資料上傳',
        fontSize: '字體大小',
        fontSmall: '小',
        fontMedium: '中',
        fontLarge: '大',
        position: '位置',
        posBottom: '底部',
        posTop: '頂部',
        process: '🔄 嵌入字幕',
        download: '⬇️ 下載',
        result: '處理結果',
        uploadVideo: '上傳影片',
        uploadSub: '上傳字幕',
        loading: '載入 FFmpeg...',
        burning: '燒錄字幕中...'
    },
    en: {
        title: 'Hardcoded Subtitle',
        subtitle: 'Burn subtitles into video',
        privacy: '100% Local Processing · No Data Upload',
        fontSize: 'Font Size',
        fontSmall: 'Small',
        fontMedium: 'Medium',
        fontLarge: 'Large',
        position: 'Position',
        posBottom: 'Bottom',
        posTop: 'Top',
        process: '🔄 Burn Subtitles',
        download: '⬇️ Download',
        result: 'Result',
        uploadVideo: 'Upload Video',
        uploadSub: 'Upload Subtitle',
        loading: 'Loading FFmpeg...',
        burning: 'Burning subtitles...'
    }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    setupFileUpload();
    document.getElementById('processBtn').addEventListener('click', processVideo);
    document.getElementById('downloadBtn').addEventListener('click', downloadVideo);
}

function setupFileUpload() {
    const videoUpload = document.getElementById('videoUpload');
    const videoInput = document.getElementById('videoInput');
    const subtitleUpload = document.getElementById('subtitleUpload');
    const subtitleInput = document.getElementById('subtitleInput');

    videoUpload.addEventListener('click', () => videoInput.click());
    subtitleUpload.addEventListener('click', () => subtitleInput.click());

    videoInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            videoFile = e.target.files[0];
            videoUpload.classList.add('loaded');
            document.getElementById('videoInfo').textContent = `影片: ${videoFile.name}`;
            checkFilesReady();
        }
    });

    subtitleInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            subtitleFile = e.target.files[0];
            subtitleUpload.classList.add('loaded');
            document.getElementById('subtitleInfo').textContent = `字幕: ${subtitleFile.name}`;
            checkFilesReady();
        }
    });
}

function checkFilesReady() {
    if (videoFile && subtitleFile) {
        document.getElementById('filesInfo').style.display = 'block';
        document.getElementById('optionsSection').style.display = 'block';
        document.getElementById('actionSection').style.display = 'flex';
    }
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');
    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.getElementById('fontSizeLabel').textContent = t.fontSize;
    document.getElementById('positionLabel').textContent = t.position;
    document.getElementById('processBtn').textContent = t.process;
    document.getElementById('downloadBtn').textContent = t.download;
    document.getElementById('resultTitle').textContent = t.result;
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
    if (!videoFile || !subtitleFile) return;

    const processBtn = document.getElementById('processBtn');
    const t = texts[currentLang];
    processBtn.textContent = t.loading;
    processBtn.disabled = true;
    document.getElementById('progressSection').style.display = 'block';

    try {
        await loadFFmpeg();
        document.getElementById('progressText').textContent = t.burning;

        const { fetchFile } = FFmpegUtil;
        await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));
        await ffmpeg.writeFile('subtitles.srt', await fetchFile(subtitleFile));

        const fontSize = document.getElementById('fontSize').value;
        const position = document.getElementById('position').value;
        const yPos = position === 'top' ? '10' : '(h-text_h-10)';

        await ffmpeg.exec([
            '-i', 'input.mp4',
            '-vf', `subtitles=subtitles.srt:force_style='FontSize=${fontSize},MarginV=${position === 'top' ? 10 : 20}'`,
            '-c:a', 'copy',
            'output.mp4'
        ]);

        const data = await ffmpeg.readFile('output.mp4');
        outputBlob = new Blob([data.buffer], { type: 'video/mp4' });

        document.getElementById('resultSection').style.display = 'block';
        document.getElementById('resultVideo').src = URL.createObjectURL(outputBlob);
        document.getElementById('downloadBtn').disabled = false;
    } catch (error) {
        console.error('Error:', error);
        alert('Processing failed: ' + error.message);
    }

    document.getElementById('progressSection').style.display = 'none';
    processBtn.textContent = t.process;
    processBtn.disabled = false;
}

function downloadVideo() {
    if (!outputBlob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(outputBlob);
    a.download = 'video_with_subtitles.mp4';
    a.click();
}

init();
