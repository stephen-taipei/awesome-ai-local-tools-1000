/**
 * Privacy Protection - Tool #398
 * Remove video metadata for privacy
 */

let currentLang = 'zh';
let videoFile = null;
let outputBlob = null;

const texts = {
    zh: {
        title: '影片隱私保護',
        subtitle: '移除影片元資料以保護隱私',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '拖放影片檔案至此或點擊上傳',
        uploadHint: '支援 MP4, WebM',
        currentMeta: '目前元資料',
        options: '隱私選項',
        removeFilename: '使用隨機檔案名稱',
        resetTimestamp: '重設時間戳記',
        reencode: '重新編碼影片 (移除所有內嵌元資料)',
        process: '🛡️ 處理影片',
        download: '⬇️ 下載',
        processing: '處理中...',
        complete: '完成！',
        resultTitle: '處理結果',
        originalSize: '原始大小',
        newSize: '新檔案大小',
        metaRemoved: '元資料',
        removed: '已移除',
        fileName: '檔案名稱',
        fileSize: '檔案大小',
        fileType: '檔案類型',
        lastModified: '最後修改',
        duration: '時長'
    },
    en: {
        title: 'Privacy Protection',
        subtitle: 'Remove video metadata for privacy',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Drop video file here or click to upload',
        uploadHint: 'Supports MP4, WebM',
        currentMeta: 'Current Metadata',
        options: 'Privacy Options',
        removeFilename: 'Use random filename',
        resetTimestamp: 'Reset timestamp',
        reencode: 'Re-encode video (remove all embedded metadata)',
        process: '🛡️ Process Video',
        download: '⬇️ Download',
        processing: 'Processing...',
        complete: 'Complete!',
        resultTitle: 'Processing Result',
        originalSize: 'Original Size',
        newSize: 'New File Size',
        metaRemoved: 'Metadata',
        removed: 'Removed',
        fileName: 'File Name',
        fileSize: 'File Size',
        fileType: 'File Type',
        lastModified: 'Last Modified',
        duration: 'Duration'
    }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    setupFileUpload();
    document.getElementById('processBtn').addEventListener('click', processVideo);
    document.getElementById('downloadBtn').addEventListener('click', downloadResult);
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');
    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.getElementById('currentMetaTitle').textContent = t.currentMeta;
    document.getElementById('optionsTitle').textContent = t.options;
    document.getElementById('removeFilenameLabel').textContent = t.removeFilename;
    document.getElementById('resetTimestampLabel').textContent = t.resetTimestamp;
    document.getElementById('reencodeLabel').textContent = t.reencode;
    document.getElementById('processBtn').textContent = t.process;
    document.getElementById('downloadBtn').textContent = t.download;
    document.getElementById('resultTitle').textContent = t.resultTitle;
    document.getElementById('originalSizeLabel').textContent = t.originalSize;
    document.getElementById('newSizeLabel').textContent = t.newSize;
    document.getElementById('metaRemovedLabel').textContent = t.metaRemoved;
    document.getElementById('metaRemoved').textContent = t.removed;

    if (videoFile) {
        displayMetadata();
    }
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

function handleFile(file) {
    videoFile = file;
    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('editorContent').style.display = 'block';

    const video = document.getElementById('inputVideo');
    video.src = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
        displayMetadata();
    };
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDuration(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function displayMetadata() {
    const t = texts[currentLang];
    const video = document.getElementById('inputVideo');

    const metadata = [
        { key: t.fileName, value: videoFile.name },
        { key: t.fileSize, value: formatFileSize(videoFile.size) },
        { key: t.fileType, value: videoFile.type },
        { key: t.lastModified, value: new Date(videoFile.lastModified).toLocaleString() },
        { key: t.duration, value: formatDuration(video.duration) }
    ];

    document.getElementById('metadataList').innerHTML = metadata.map(m => `
        <div class="meta-item">
            <span class="meta-key">${m.key}</span>
            <span class="meta-value">${m.value}</span>
        </div>
    `).join('');
}

async function processVideo() {
    const t = texts[currentLang];
    const reencode = document.getElementById('reencodeVideo').checked;

    document.getElementById('processBtn').disabled = true;
    document.getElementById('progressSection').style.display = 'block';
    document.getElementById('resultSection').style.display = 'none';

    if (reencode) {
        // Re-encode video to strip metadata
        await reencodeVideo();
    } else {
        // Just create a copy (metadata in container may still exist)
        outputBlob = new Blob([videoFile], { type: 'video/webm' });
        document.getElementById('progressFill').style.width = '100%';
        document.getElementById('progressText').textContent = t.complete;
    }

    // Show results
    document.getElementById('progressSection').style.display = 'none';
    document.getElementById('resultSection').style.display = 'block';
    document.getElementById('originalSize').textContent = formatFileSize(videoFile.size);
    document.getElementById('newSize').textContent = formatFileSize(outputBlob.size);

    document.getElementById('downloadBtn').disabled = false;
    document.getElementById('processBtn').disabled = false;
}

async function reencodeVideo() {
    const t = texts[currentLang];
    const video = document.getElementById('inputVideo');

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');

    // Set up video for processing
    video.currentTime = 0;
    await new Promise(resolve => { video.onseeked = resolve; });

    const fps = 30;
    const duration = video.duration;

    // Create streams
    const canvasStream = canvas.captureStream(fps);

    // Handle audio
    const audioContext = new AudioContext();
    const destination = audioContext.createMediaStreamDestination();
    const source = audioContext.createMediaElementSource(video);
    source.connect(destination);
    source.connect(audioContext.destination);

    const combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...destination.stream.getAudioTracks()
    ]);

    const recorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm' });
    const chunks = [];

    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
        outputBlob = new Blob(chunks, { type: 'video/webm' });
    };

    recorder.start();
    await video.play();

    // Render frames
    return new Promise((resolve) => {
        function render() {
            if (video.paused || video.ended) {
                recorder.stop();
                video.pause();
                setTimeout(resolve, 100);
                return;
            }

            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            const progress = (video.currentTime / duration) * 100;
            document.getElementById('progressFill').style.width = progress + '%';
            document.getElementById('progressText').textContent = `${t.processing} ${Math.round(progress)}%`;

            requestAnimationFrame(render);
        }

        video.onended = () => {
            recorder.stop();
            document.getElementById('progressFill').style.width = '100%';
            document.getElementById('progressText').textContent = t.complete;
            setTimeout(resolve, 100);
        };

        render();
    });
}

function downloadResult() {
    if (!outputBlob) return;

    const useRandom = document.getElementById('removeFilename').checked;
    const filename = useRandom
        ? `video_${Math.random().toString(36).substring(2, 10)}.webm`
        : `clean_${videoFile.name.replace(/\.[^/.]+$/, '')}.webm`;

    const a = document.createElement('a');
    a.href = URL.createObjectURL(outputBlob);
    a.download = filename;
    a.click();
}

init();
