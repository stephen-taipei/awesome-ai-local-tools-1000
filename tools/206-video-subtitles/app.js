/**
 * Video Subtitles Generator - Tool #206
 */

const translations = {
    en: {
        title: 'Video Subtitles Generator',
        subtitle: 'Auto-generate subtitles for your videos',
        uploadText: 'Drop video file here or click to upload',
        uploadHint: 'Supports MP4, WebM, MOV',
        options: 'Options',
        language: 'Language:',
        format: 'Format:',
        generate: 'Generate Subtitles',
        download: 'Download',
        subtitles: 'Subtitles',
        placeholder: 'Upload a video to generate subtitles...',
        generating: 'Generating...'
    },
    zh: {
        title: '影片字幕生成',
        subtitle: '自動為影片生成字幕',
        uploadText: '拖放影片檔案或點擊上傳',
        uploadHint: '支援 MP4、WebM、MOV',
        options: '選項',
        language: '語言：',
        format: '格式：',
        generate: '生成字幕',
        download: '下載',
        subtitles: '字幕',
        placeholder: '上傳影片以生成字幕...',
        generating: '生成中...'
    }
};

let currentLang = 'en';
let videoFile = null;
let subtitles = [];

const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const videoContainer = document.getElementById('videoContainer');
const videoPlayer = document.getElementById('videoPlayer');
const subtitleOverlay = document.getElementById('subtitleOverlay');
const generateBtn = document.getElementById('generateBtn');
const downloadBtn = document.getElementById('downloadBtn');
const subtitleList = document.getElementById('subtitleList');
const formatSelect = document.getElementById('formatSelect');

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });
    document.getElementById('lang-en').classList.toggle('active', lang === 'en');
    document.getElementById('lang-zh').classList.toggle('active', lang === 'zh');
}

document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));
document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh'));

// File upload
uploadArea.addEventListener('click', () => fileInput.click());
uploadArea.addEventListener('dragover', (e) => e.preventDefault());
uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
});
fileInput.addEventListener('change', (e) => {
    if (e.target.files[0]) handleFile(e.target.files[0]);
});

function handleFile(file) {
    videoFile = file;
    const url = URL.createObjectURL(file);
    videoPlayer.src = url;
    videoContainer.style.display = 'block';
    uploadArea.style.display = 'none';
    generateBtn.disabled = false;
}

// Generate subtitles (simulated)
generateBtn.addEventListener('click', () => {
    generateBtn.textContent = translations[currentLang].generating;
    generateBtn.disabled = true;

    // Simulated subtitles
    setTimeout(() => {
        subtitles = [
            { start: 0, end: 3, text: 'Welcome to this video presentation.' },
            { start: 3, end: 6, text: 'Today we will explore various topics.' },
            { start: 6, end: 10, text: 'Let\'s begin with an introduction.' },
            { start: 10, end: 14, text: 'This technology is revolutionizing the industry.' },
            { start: 14, end: 18, text: 'Thank you for watching!' }
        ];

        renderSubtitles();
        generateBtn.textContent = translations[currentLang].generate;
        generateBtn.disabled = false;
        downloadBtn.disabled = false;
    }, 2000);
});

function renderSubtitles() {
    subtitleList.innerHTML = subtitles.map((sub, i) => `
        <div class="subtitle-line">
            <input type="text" class="time-input" value="${formatTime(sub.start)}" data-index="${i}" data-type="start">
            <input type="text" class="time-input" value="${formatTime(sub.end)}" data-index="${i}" data-type="end">
            <input type="text" value="${sub.text}" data-index="${i}" data-type="text">
        </div>
    `).join('');

    // Update subtitle display during playback
    videoPlayer.addEventListener('timeupdate', () => {
        const time = videoPlayer.currentTime;
        const current = subtitles.find(s => time >= s.start && time <= s.end);
        subtitleOverlay.textContent = current ? current.text : '';
        subtitleOverlay.style.display = current ? 'block' : 'none';
    });
}

function formatTime(seconds) {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
}

// Download
downloadBtn.addEventListener('click', () => {
    const format = formatSelect.value;
    let content = '';
    let filename = '';

    if (format === 'srt') {
        subtitles.forEach((sub, i) => {
            content += `${i + 1}\n`;
            content += `${formatTime(sub.start)},000 --> ${formatTime(sub.end)},000\n`;
            content += `${sub.text}\n\n`;
        });
        filename = 'subtitles.srt';
    } else if (format === 'vtt') {
        content = 'WEBVTT\n\n';
        subtitles.forEach((sub, i) => {
            content += `${i + 1}\n`;
            content += `${formatTime(sub.start)}.000 --> ${formatTime(sub.end)}.000\n`;
            content += `${sub.text}\n\n`;
        });
        filename = 'subtitles.vtt';
    } else {
        subtitles.forEach(sub => {
            content += `[${formatTime(sub.start)}] ${sub.text}\n`;
        });
        filename = 'subtitles.txt';
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
});

setLanguage('en');
