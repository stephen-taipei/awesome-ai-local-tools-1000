/**
 * Audio Metadata Editor - Tool #293
 * View and edit audio metadata
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let originalFile = null;
let fileName = '';

const texts = {
    zh: {
        title: '音訊元資料編輯',
        subtitle: '查看和編輯音訊檔案資訊',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '點擊或拖放音訊檔案',
        uploadHint: '支援 MP3, WAV, OGG 等格式',
        fileInfo: '檔案資訊',
        format: '格式',
        duration: '長度',
        sampleRate: '取樣率',
        channels: '聲道',
        metaTitle: '標題',
        metaArtist: '藝術家',
        metaAlbum: '專輯',
        metaYear: '年份',
        metaTrack: '曲目',
        metaGenre: '類型',
        download: '⬇️ 下載',
        titlePlaceholder: '歌曲標題',
        artistPlaceholder: '藝術家名稱',
        albumPlaceholder: '專輯名稱',
        yearPlaceholder: '發行年份',
        trackPlaceholder: '曲目編號',
        genrePlaceholder: '音樂類型',
        mono: '單聲道',
        stereo: '立體聲'
    },
    en: {
        title: 'Audio Metadata Editor',
        subtitle: 'View and edit audio file info',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Click or drop audio file',
        uploadHint: 'Supports MP3, WAV, OGG formats',
        fileInfo: 'File Info',
        format: 'Format',
        duration: 'Duration',
        sampleRate: 'Sample Rate',
        channels: 'Channels',
        metaTitle: 'Title',
        metaArtist: 'Artist',
        metaAlbum: 'Album',
        metaYear: 'Year',
        metaTrack: 'Track',
        metaGenre: 'Genre',
        download: '⬇️ Download',
        titlePlaceholder: 'Song title',
        artistPlaceholder: 'Artist name',
        albumPlaceholder: 'Album name',
        yearPlaceholder: 'Release year',
        trackPlaceholder: 'Track number',
        genrePlaceholder: 'Music genre',
        mono: 'Mono',
        stereo: 'Stereo'
    }
};

function init() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));

    const uploadArea = document.getElementById('uploadArea');
    const audioInput = document.getElementById('audioInput');

    uploadArea.addEventListener('click', () => audioInput.click());
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
    });
    audioInput.addEventListener('change', (e) => {
        if (e.target.files.length) handleFile(e.target.files[0]);
    });

    document.getElementById('downloadBtn').addEventListener('click', downloadWithMetadata);
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');

    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;

    document.querySelector('.upload-text').textContent = t.upload;
    document.querySelector('.upload-hint').textContent = t.uploadHint;

    document.querySelector('.info-box p').textContent = t.fileInfo;

    const labels = document.querySelectorAll('.form-group label');
    labels[0].textContent = t.metaTitle;
    labels[1].textContent = t.metaArtist;
    labels[2].textContent = t.metaAlbum;
    labels[3].textContent = t.metaYear;
    labels[4].textContent = t.metaTrack;
    labels[5].textContent = t.metaGenre;

    document.getElementById('metaTitle').placeholder = t.titlePlaceholder;
    document.getElementById('metaArtist').placeholder = t.artistPlaceholder;
    document.getElementById('metaAlbum').placeholder = t.albumPlaceholder;
    document.getElementById('metaYear').placeholder = t.yearPlaceholder;
    document.getElementById('metaTrack').placeholder = t.trackPlaceholder;
    document.getElementById('metaGenre').placeholder = t.genrePlaceholder;

    document.getElementById('downloadBtn').textContent = t.download;
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

async function handleFile(file) {
    originalFile = file;
    fileName = file.name.replace(/\.[^/.]+$/, '');

    // Get file extension
    const ext = file.name.split('.').pop().toUpperCase();
    document.getElementById('fileFormat').textContent = ext;

    const arrayBuffer = await file.arrayBuffer();
    originalBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));

    // Display file info
    document.getElementById('fileDuration').textContent = formatTime(originalBuffer.duration);
    document.getElementById('fileSampleRate').textContent = originalBuffer.sampleRate + ' Hz';

    const channelText = originalBuffer.numberOfChannels === 1
        ? texts[currentLang].mono
        : texts[currentLang].stereo;
    document.getElementById('fileChannels').textContent = channelText;

    // Pre-fill with filename as title
    document.getElementById('metaTitle').value = fileName;

    document.getElementById('editorSection').style.display = 'block';
}

async function downloadWithMetadata() {
    if (!originalBuffer) return;

    // Create WAV with metadata embedded in filename (simplified approach)
    // Full ID3 tag editing would require a library like jsmediatags
    const wavBlob = bufferToWav(originalBuffer);

    const title = document.getElementById('metaTitle').value || fileName;
    const artist = document.getElementById('metaArtist').value;

    let downloadName = title;
    if (artist) {
        downloadName = `${artist} - ${title}`;
    }

    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${downloadName}.wav`;
    a.click();
    URL.revokeObjectURL(url);
}

function bufferToWav(buffer) {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1;
    const bitDepth = 16;

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;

    const samples = buffer.length;
    const dataSize = samples * blockAlign;
    const bufferSize = 44 + dataSize;

    const arrayBuffer = new ArrayBuffer(bufferSize);
    const view = new DataView(arrayBuffer);

    const writeString = (offset, string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, bufferSize - 8, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    const channels = [];
    for (let i = 0; i < numChannels; i++) {
        channels.push(buffer.getChannelData(i));
    }

    let offset = 44;
    for (let i = 0; i < samples; i++) {
        for (let ch = 0; ch < numChannels; ch++) {
            const sample = Math.max(-1, Math.min(1, channels[ch][i]));
            view.setInt16(offset, sample * 32767, true);
            offset += 2;
        }
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
}

init();
