/**
 * Batch Video Converter - Tool #349
 * Convert multiple videos at once
 */

let currentLang = 'zh';
let ffmpeg = null;
let videoFiles = [];
let convertedVideos = [];

const texts = {
    zh: {
        title: '批次影片轉換',
        subtitle: '同時轉換多個影片',
        privacy: '100% 本地處理 · 零資料上傳',
        format: '輸出格式',
        quality: '品質',
        qualityHigh: '高品質',
        qualityMedium: '中等',
        qualityLow: '低品質',
        resolution: '解析度',
        resOriginal: '原始',
        process: '🔄 開始轉換',
        downloadAll: '⬇️ 下載全部',
        result: '轉換結果',
        upload: '拖放多個影片檔案至此或點擊上傳',
        uploadHint: '支援 MP4, WebM, MOV, AVI',
        loading: '載入 FFmpeg...',
        converting: '轉換中 {current}/{total}...',
        download: '下載'
    },
    en: {
        title: 'Batch Video Converter',
        subtitle: 'Convert multiple videos at once',
        privacy: '100% Local Processing · No Data Upload',
        format: 'Output Format',
        quality: 'Quality',
        qualityHigh: 'High Quality',
        qualityMedium: 'Medium',
        qualityLow: 'Low Quality',
        resolution: 'Resolution',
        resOriginal: 'Original',
        process: '🔄 Start Conversion',
        downloadAll: '⬇️ Download All',
        result: 'Results',
        upload: 'Drop multiple video files here or click to upload',
        uploadHint: 'Supports MP4, WebM, MOV, AVI',
        loading: 'Loading FFmpeg...',
        converting: 'Converting {current}/{total}...',
        download: 'Download'
    }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    setupFileUpload();
    document.getElementById('processBtn').addEventListener('click', processVideos);
    document.getElementById('downloadAllBtn').addEventListener('click', downloadAll);
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
    document.getElementById('resLabel').textContent = t.resolution;
    const resSelect = document.getElementById('resolution');
    resSelect.options[0].text = t.resOriginal;
    document.getElementById('processBtn').textContent = t.process;
    document.getElementById('downloadAllBtn').textContent = t.downloadAll;
    document.getElementById('resultTitle').textContent = t.result;
    document.querySelector('.upload-area p').textContent = t.upload;
    document.querySelector('.upload-hint').textContent = t.uploadHint;
}

function handleFiles(files) {
    videoFiles = Array.from(files).filter(f => f.type.startsWith('video/'));
    if (videoFiles.length === 0) return;

    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('filesLoaded').style.display = 'block';

    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '';
    videoFiles.forEach((file, index) => {
        const item = document.createElement('div');
        item.className = 'file-item';
        item.innerHTML = `
            <span class="name">${file.name}</span>
            <span class="size">${(file.size / 1024 / 1024).toFixed(2)} MB</span>
            <span class="status" id="status-${index}">⏳</span>
        `;
        fileList.appendChild(item);
    });

    document.getElementById('optionsSection').style.display = 'block';
    document.getElementById('actionSection').style.display = 'flex';
}

async function loadFFmpeg() {
    if (ffmpeg) return;
    const { FFmpeg } = FFmpegWASM;
    ffmpeg = new FFmpeg();
    await ffmpeg.load({
        coreURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js',
        wasmURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm'
    });
}

async function processVideos() {
    if (videoFiles.length === 0) return;

    const processBtn = document.getElementById('processBtn');
    const t = texts[currentLang];
    processBtn.textContent = t.loading;
    processBtn.disabled = true;
    document.getElementById('progressSection').style.display = 'block';

    try {
        await loadFFmpeg();
        convertedVideos = [];

        const format = document.getElementById('outputFormat').value;
        const quality = document.getElementById('quality').value;
        const resolution = document.getElementById('resolution').value;

        for (let i = 0; i < videoFiles.length; i++) {
            document.getElementById('progressText').textContent = t.converting.replace('{current}', i + 1).replace('{total}', videoFiles.length);
            document.getElementById('progressFill').style.width = ((i / videoFiles.length) * 100) + '%';
            document.getElementById(`status-${i}`).textContent = '🔄';

            try {
                const file = videoFiles[i];
                const { fetchFile } = FFmpegUtil;
                const inputName = 'input' + i + '.' + file.name.split('.').pop();
                const outputName = 'output' + i + '.' + format;

                await ffmpeg.writeFile(inputName, await fetchFile(file));

                let args = ['-i', inputName];
                let crf = quality === 'high' ? '18' : quality === 'medium' ? '23' : '28';

                if (resolution !== 'original') {
                    args.push('-vf', `scale=-2:${resolution}`);
                }

                if (format === 'mp4') {
                    args.push('-c:v', 'libx264', '-crf', crf, '-preset', 'fast', '-c:a', 'aac');
                } else {
                    args.push('-c:v', 'libvpx-vp9', '-crf', crf, '-b:v', '0', '-c:a', 'libopus');
                }
                args.push(outputName);

                await ffmpeg.exec(args);

                const data = await ffmpeg.readFile(outputName);
                const blob = new Blob([data.buffer], { type: format === 'mp4' ? 'video/mp4' : 'video/webm' });
                convertedVideos.push({ name: file.name.replace(/\.[^/.]+$/, '') + '.' + format, blob });

                document.getElementById(`status-${i}`).textContent = '✅';
                await ffmpeg.deleteFile(inputName);
                await ffmpeg.deleteFile(outputName);
            } catch (err) {
                console.error('Error converting', videoFiles[i].name, err);
                document.getElementById(`status-${i}`).textContent = '❌';
            }
        }

        document.getElementById('progressFill').style.width = '100%';
        displayResults();
        document.getElementById('downloadAllBtn').disabled = false;
    } catch (error) {
        console.error('Error:', error);
        alert('Conversion failed: ' + error.message);
    }

    document.getElementById('progressSection').style.display = 'none';
    processBtn.textContent = t.process;
    processBtn.disabled = false;
}

function displayResults() {
    const resultList = document.getElementById('resultList');
    resultList.innerHTML = '';
    convertedVideos.forEach((video, index) => {
        const item = document.createElement('div');
        item.className = 'result-item';
        item.innerHTML = `
            <span class="name">${video.name}</span>
            <button class="btn btn-secondary" onclick="downloadSingle(${index})">${texts[currentLang].download}</button>
        `;
        resultList.appendChild(item);
    });
    document.getElementById('resultSection').style.display = 'block';
}

window.downloadSingle = function(index) {
    const video = convertedVideos[index];
    const a = document.createElement('a');
    a.href = URL.createObjectURL(video.blob);
    a.download = video.name;
    a.click();
};

async function downloadAll() {
    if (convertedVideos.length === 0) return;

    const zip = new JSZip();
    convertedVideos.forEach(video => {
        zip.file(video.name, video.blob);
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'converted_videos.zip';
    a.click();
}

init();
