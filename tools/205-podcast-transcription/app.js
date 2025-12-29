/**
 * Podcast Transcription - Tool #205
 */

const translations = {
    en: {
        title: 'Podcast Transcription',
        subtitle: 'Convert podcast episodes to searchable text',
        uploadText: 'Drop your podcast file here or click to upload',
        uploadHint: 'Supports MP3, WAV, M4A, OGG',
        transcribe: 'Transcribe',
        copy: 'Copy',
        download: 'Download',
        downloadSrt: 'Download SRT',
        transcript: 'Transcript',
        placeholder: 'Upload a podcast file to begin transcription...',
        processing: 'Processing...',
        complete: 'Complete!',
        words: 'words',
        copied: 'Copied!'
    },
    zh: {
        title: '播客轉錄',
        subtitle: '將播客節目轉換為可搜尋文字',
        uploadText: '拖放播客檔案或點擊上傳',
        uploadHint: '支援 MP3、WAV、M4A、OGG',
        transcribe: '轉錄',
        copy: '複製',
        download: '下載',
        downloadSrt: '下載 SRT',
        transcript: '轉錄文字',
        placeholder: '上傳播客檔案以開始轉錄...',
        processing: '處理中...',
        complete: '完成！',
        words: '字',
        copied: '已複製！'
    }
};

let currentLang = 'en';
let audioFile = null;
let transcriptText = '';
let transcriptSegments = [];

const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const podcastInfo = document.getElementById('podcastInfo');
const audioPlayer = document.getElementById('audioPlayer');
const waveformContainer = document.getElementById('waveformContainer');
const canvas = document.getElementById('waveform');
const ctx = canvas.getContext('2d');
const transcribeBtn = document.getElementById('transcribeBtn');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const srtBtn = document.getElementById('srtBtn');
const transcriptContent = document.getElementById('transcriptContent');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const wordCount = document.getElementById('wordCount');

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
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.background = '#fff5f8';
});
uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.background = '';
});
uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.background = '';
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
});
fileInput.addEventListener('change', (e) => {
    if (e.target.files[0]) handleFile(e.target.files[0]);
});

function handleFile(file) {
    audioFile = file;
    const url = URL.createObjectURL(file);
    audioPlayer.src = url;
    document.getElementById('podcastTitle').textContent = file.name;
    podcastInfo.style.display = 'block';
    transcribeBtn.disabled = false;

    audioPlayer.addEventListener('loadedmetadata', () => {
        const duration = Math.floor(audioPlayer.duration);
        const mins = Math.floor(duration / 60);
        const secs = duration % 60;
        document.getElementById('podcastDuration').textContent = `Duration: ${mins}:${secs.toString().padStart(2, '0')}`;
    });

    drawWaveform(file);
}

async function drawWaveform(file) {
    waveformContainer.style.display = 'block';
    canvas.width = canvas.offsetWidth;
    canvas.height = 100;

    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        const data = audioBuffer.getChannelData(0);
        const step = Math.ceil(data.length / canvas.width);
        const amp = canvas.height / 2;

        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.beginPath();
        ctx.strokeStyle = '#f093fb';
        ctx.lineWidth = 1;

        for (let i = 0; i < canvas.width; i++) {
            let min = 1.0, max = -1.0;
            for (let j = 0; j < step; j++) {
                const val = data[(i * step) + j] || 0;
                if (val < min) min = val;
                if (val > max) max = val;
            }
            ctx.moveTo(i, (1 + min) * amp);
            ctx.lineTo(i, (1 + max) * amp);
        }
        ctx.stroke();
        audioContext.close();
    } catch (e) {
        console.error('Waveform error:', e);
    }
}

// Transcription simulation
transcribeBtn.addEventListener('click', () => {
    progressBar.style.display = 'block';
    progressFill.style.width = '0%';
    transcribeBtn.disabled = true;

    // Simulated transcription with timestamps
    const sampleText = `[00:00] Welcome to today's podcast episode.

[00:15] In this episode, we'll be discussing the future of AI and technology.

[00:30] Our guest today is an expert in machine learning and natural language processing.

[01:00] Let's start with some background on how you got into this field.

[01:30] It's fascinating how much has changed in the last few years.

[02:00] The applications of AI are becoming more widespread every day.

[02:30] Thank you for joining us today!`;

    transcriptSegments = [
        { time: '00:00:00', text: 'Welcome to today\'s podcast episode.' },
        { time: '00:00:15', text: 'In this episode, we\'ll be discussing the future of AI and technology.' },
        { time: '00:00:30', text: 'Our guest today is an expert in machine learning and natural language processing.' },
        { time: '00:01:00', text: 'Let\'s start with some background on how you got into this field.' },
        { time: '00:01:30', text: 'It\'s fascinating how much has changed in the last few years.' },
        { time: '00:02:00', text: 'The applications of AI are becoming more widespread every day.' },
        { time: '00:02:30', text: 'Thank you for joining us today!' }
    ];

    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        progressFill.style.width = progress + '%';
        if (progress >= 100) {
            clearInterval(interval);
            transcriptText = sampleText;
            transcriptContent.innerHTML = transcriptSegments.map(seg =>
                `<span class="timestamp" onclick="seekTo('${seg.time}')">${seg.time}</span>${seg.text}`
            ).join('<br><br>');
            updateWordCount();
            transcribeBtn.disabled = false;
        }
    }, 200);
});

window.seekTo = (time) => {
    const parts = time.split(':');
    const seconds = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
    audioPlayer.currentTime = seconds;
    audioPlayer.play();
};

function updateWordCount() {
    const count = transcriptText.trim().split(/\s+/).filter(w => w && !w.startsWith('[')).length;
    wordCount.textContent = `${count} ${translations[currentLang].words}`;
}

copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(transcriptText).then(() => {
        alert(translations[currentLang].copied);
    });
});

downloadBtn.addEventListener('click', () => {
    const blob = new Blob([transcriptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `podcast-transcript-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
});

srtBtn.addEventListener('click', () => {
    let srt = '';
    transcriptSegments.forEach((seg, i) => {
        const endTime = transcriptSegments[i + 1]?.time || '00:03:00';
        srt += `${i + 1}\n`;
        srt += `${seg.time},000 --> ${endTime},000\n`;
        srt += `${seg.text}\n\n`;
    });

    const blob = new Blob([srt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `podcast-subtitles-${Date.now()}.srt`;
    a.click();
    URL.revokeObjectURL(url);
});

setLanguage('en');
