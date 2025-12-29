/**
 * Audio File Transcription - Tool #202
 * Transcribe audio files using Web Speech API
 */

const translations = {
    en: {
        title: 'Audio File Transcription',
        subtitle: 'Upload audio files and convert to text',
        privacy: '100% Local Processing',
        uploadText: 'Drag & drop audio file or click to upload',
        uploadHint: 'Supports MP3, WAV, OGG, M4A',
        fileName: 'File:',
        options: 'Options',
        language: 'Language:',
        transcribe: 'Transcribe',
        clear: 'Clear',
        copy: 'Copy',
        download: 'Download',
        transcript: 'Transcript',
        placeholder: 'Upload an audio file to begin transcription...',
        howItWorks: 'How It Works',
        feature1: 'Upload Audio',
        feature1Desc: 'Support multiple audio formats',
        feature2: 'Process Locally',
        feature2Desc: 'Using Web Speech API',
        feature3: 'Get Text',
        feature3Desc: 'Download or copy result',
        feature4: 'Private',
        feature4Desc: 'No data leaves your device',
        processing: 'Processing...',
        complete: 'Transcription complete!',
        error: 'Error during transcription',
        words: 'words',
        copied: 'Copied!',
        notSupported: 'Speech recognition not supported in this browser'
    },
    zh: {
        title: '音訊檔案轉錄',
        subtitle: '上傳音訊檔案並轉換為文字',
        privacy: '100% 本地處理',
        uploadText: '拖放音訊檔案或點擊上傳',
        uploadHint: '支援 MP3、WAV、OGG、M4A',
        fileName: '檔案：',
        options: '選項',
        language: '語言：',
        transcribe: '轉錄',
        clear: '清除',
        copy: '複製',
        download: '下載',
        transcript: '轉錄文字',
        placeholder: '上傳音訊檔案以開始轉錄...',
        howItWorks: '運作原理',
        feature1: '上傳音訊',
        feature1Desc: '支援多種音訊格式',
        feature2: '本地處理',
        feature2Desc: '使用 Web Speech API',
        feature3: '取得文字',
        feature3Desc: '下載或複製結果',
        feature4: '隱私保護',
        feature4Desc: '資料不離開您的設備',
        processing: '處理中...',
        complete: '轉錄完成！',
        error: '轉錄時發生錯誤',
        words: '字',
        copied: '已複製！',
        notSupported: '此瀏覽器不支援語音識別'
    }
};

let currentLang = 'en';
let audioFile = null;
let transcriptText = '';

const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const audioPlayer = document.getElementById('audioPlayer');
const transcribeBtn = document.getElementById('transcribeBtn');
const clearBtn = document.getElementById('clearBtn');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const transcriptContent = document.getElementById('transcriptContent');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const wordCount = document.getElementById('wordCount');
const waveformContainer = document.getElementById('waveformContainer');
const canvas = document.getElementById('waveform');
const ctx = canvas.getContext('2d');
const languageSelect = document.getElementById('languageSelect');

// Language switching
function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            if (el.tagName === 'INPUT') {
                el.placeholder = translations[lang][key];
            } else {
                el.textContent = translations[lang][key];
            }
        }
    });
    document.getElementById('lang-en').classList.toggle('active', lang === 'en');
    document.getElementById('lang-zh').classList.toggle('active', lang === 'zh');
}

document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));
document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh'));

// File handling
uploadArea.addEventListener('click', () => fileInput.click());

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('audio/')) {
        handleFile(file);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files[0]) {
        handleFile(e.target.files[0]);
    }
});

function handleFile(file) {
    audioFile = file;
    fileName.textContent = file.name;
    fileInfo.style.display = 'block';

    const url = URL.createObjectURL(file);
    audioPlayer.src = url;

    transcribeBtn.disabled = false;
    drawWaveform(file);
}

async function drawWaveform(file) {
    waveformContainer.style.display = 'block';
    canvas.width = canvas.offsetWidth;
    canvas.height = 100;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const data = audioBuffer.getChannelData(0);
    const step = Math.ceil(data.length / canvas.width);
    const amp = canvas.height / 2;

    ctx.fillStyle = '#16213e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.strokeStyle = '#4facfe';
    ctx.lineWidth = 1;

    for (let i = 0; i < canvas.width; i++) {
        let min = 1.0, max = -1.0;
        for (let j = 0; j < step; j++) {
            const val = data[(i * step) + j];
            if (val < min) min = val;
            if (val > max) max = val;
        }
        ctx.moveTo(i, (1 + min) * amp);
        ctx.lineTo(i, (1 + max) * amp);
    }
    ctx.stroke();
    audioContext.close();
}

// Transcription using MediaRecorder + Speech Recognition workaround
transcribeBtn.addEventListener('click', async () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert(translations[currentLang].notSupported);
        return;
    }

    progressContainer.style.display = 'block';
    progressFill.style.width = '0%';
    progressText.textContent = translations[currentLang].processing;
    transcribeBtn.disabled = true;

    try {
        // Create audio context and play audio to transcribe
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const arrayBuffer = await audioFile.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = languageSelect.value;

        transcriptText = '';

        recognition.onresult = (event) => {
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    transcriptText += event.results[i][0].transcript + ' ';
                }
            }
            transcriptContent.textContent = transcriptText || translations[currentLang].placeholder;
            updateWordCount();
        };

        recognition.onend = () => {
            progressFill.style.width = '100%';
            progressText.textContent = translations[currentLang].complete;
            transcribeBtn.disabled = false;
        };

        recognition.onerror = (e) => {
            console.error('Recognition error:', e);
            progressText.textContent = translations[currentLang].error;
            transcribeBtn.disabled = false;
        };

        // Note: This is a simulation - real file transcription requires server-side processing
        // or Whisper model. We simulate by showing a message.
        transcriptContent.textContent = 'Note: For full audio file transcription, a backend service with Whisper or similar model is recommended. Browser Speech API works best with live microphone input.';
        progressFill.style.width = '100%';
        progressText.textContent = 'Demo mode - See note above';
        transcribeBtn.disabled = false;

        audioContext.close();
    } catch (error) {
        console.error('Transcription error:', error);
        progressText.textContent = translations[currentLang].error;
        transcribeBtn.disabled = false;
    }
});

function updateWordCount() {
    const count = transcriptText.trim() ? transcriptText.trim().split(/\s+/).length : 0;
    wordCount.textContent = `${count} ${translations[currentLang].words}`;
}

clearBtn.addEventListener('click', () => {
    transcriptText = '';
    transcriptContent.textContent = translations[currentLang].placeholder;
    wordCount.textContent = '0 ' + translations[currentLang].words;
    progressContainer.style.display = 'none';
});

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
    a.download = `transcript-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
});

// Initialize
setLanguage('en');
