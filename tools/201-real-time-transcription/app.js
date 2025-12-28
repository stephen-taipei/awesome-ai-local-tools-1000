/**
 * Real-time Transcription - Tool #201
 * Uses Web Speech API for real-time speech-to-text
 */

// i18n translations
const translations = {
    en: {
        title: 'Real-time Transcription',
        subtitle: 'Convert speech to text in real-time, entirely in your browser',
        privacy: '100% Local Processing - No Data Upload',
        options: 'Options',
        language: 'Language:',
        continuous: 'Continuous Recognition:',
        statusReady: 'Ready to record',
        statusRecording: 'Recording...',
        statusProcessing: 'Processing...',
        start: 'Start Recording',
        stop: 'Stop',
        clear: 'Clear',
        copy: 'Copy Text',
        download: 'Download',
        transcript: 'Transcript',
        placeholder: 'Click "Start Recording" and speak into your microphone...',
        howItWorks: 'How It Works',
        feature1: 'Web Speech API',
        feature1Desc: 'Uses browser\'s built-in speech recognition',
        feature2: 'Privacy First',
        feature2Desc: 'Audio processed locally in your browser',
        feature3: 'Real-time',
        feature3Desc: 'Instant transcription as you speak',
        feature4: 'Multi-language',
        feature4Desc: 'Supports multiple languages',
        backHome: 'Back to Home',
        copied: 'Copied to clipboard!',
        notSupported: 'Speech recognition is not supported in this browser. Please use Chrome or Edge.',
        micError: 'Microphone access denied. Please allow microphone access.',
        words: 'words'
    },
    zh: {
        title: '即時語音轉文字',
        subtitle: '在瀏覽器中即時將語音轉換為文字',
        privacy: '100% 本地處理 - 無資料上傳',
        options: '選項',
        language: '語言：',
        continuous: '連續識別：',
        statusReady: '準備錄音',
        statusRecording: '錄音中...',
        statusProcessing: '處理中...',
        start: '開始錄音',
        stop: '停止',
        clear: '清除',
        copy: '複製文字',
        download: '下載',
        transcript: '轉錄文字',
        placeholder: '點擊「開始錄音」並對著麥克風說話...',
        howItWorks: '運作原理',
        feature1: 'Web Speech API',
        feature1Desc: '使用瀏覽器內建的語音識別',
        feature2: '隱私優先',
        feature2Desc: '音訊在瀏覽器本地處理',
        feature3: '即時轉錄',
        feature3Desc: '說話的同時即時轉換',
        feature4: '多語言支援',
        feature4Desc: '支援多種語言',
        backHome: '返回首頁',
        copied: '已複製到剪貼簿！',
        notSupported: '此瀏覽器不支援語音識別。請使用 Chrome 或 Edge。',
        micError: '麥克風存取被拒絕。請允許麥克風存取。',
        words: '字'
    }
};

let currentLang = 'en';
let recognition = null;
let isRecording = false;
let finalTranscript = '';
let interimTranscript = '';
let audioContext = null;
let analyser = null;
let animationId = null;

// DOM Elements
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const clearBtn = document.getElementById('clearBtn');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const transcriptContent = document.getElementById('transcriptContent');
const statusIndicator = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');
const languageSelect = document.getElementById('languageSelect');
const continuousCheck = document.getElementById('continuousCheck');
const wordCount = document.getElementById('wordCount');
const canvas = document.getElementById('waveform');
const canvasCtx = canvas.getContext('2d');

// Set canvas size
function resizeCanvas() {
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    canvasCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Language switching
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
    updateWordCount();
}

document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));
document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh'));

// Initialize Speech Recognition
function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert(translations[currentLang].notSupported);
        startBtn.disabled = true;
        return false;
    }

    recognition = new SpeechRecognition();
    recognition.continuous = continuousCheck.checked;
    recognition.interimResults = true;
    recognition.lang = languageSelect.value;

    recognition.onstart = () => {
        isRecording = true;
        updateStatus('recording');
        startBtn.disabled = true;
        stopBtn.disabled = false;
    };

    recognition.onend = () => {
        if (isRecording && continuousCheck.checked) {
            recognition.start();
        } else {
            isRecording = false;
            updateStatus('ready');
            startBtn.disabled = false;
            stopBtn.disabled = true;
            stopVisualization();
        }
    };

    recognition.onresult = (event) => {
        interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
            } else {
                interimTranscript += transcript;
            }
        }
        updateTranscript();
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
            alert(translations[currentLang].micError);
        }
        isRecording = false;
        updateStatus('ready');
        startBtn.disabled = false;
        stopBtn.disabled = true;
    };

    return true;
}

// Update status display
function updateStatus(status) {
    statusIndicator.className = 'status-indicator ' + status;
    if (status === 'recording') {
        statusText.textContent = translations[currentLang].statusRecording;
    } else if (status === 'processing') {
        statusText.textContent = translations[currentLang].statusProcessing;
    } else {
        statusText.textContent = translations[currentLang].statusReady;
    }
}

// Update transcript display
function updateTranscript() {
    if (!finalTranscript && !interimTranscript) {
        transcriptContent.innerHTML = `<p class="placeholder">${translations[currentLang].placeholder}</p>`;
    } else {
        transcriptContent.innerHTML = finalTranscript +
            (interimTranscript ? `<span class="interim">${interimTranscript}</span>` : '');
    }
    updateWordCount();
}

// Update word count
function updateWordCount() {
    const text = finalTranscript.trim();
    const count = text ? text.split(/\s+/).length : 0;
    wordCount.textContent = `${count} ${translations[currentLang].words}`;
}

// Audio visualization
async function startVisualization() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.fftSize = 256;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        function draw() {
            if (!isRecording) return;
            animationId = requestAnimationFrame(draw);

            analyser.getByteFrequencyData(dataArray);

            const width = canvas.offsetWidth;
            const height = canvas.offsetHeight;
            canvasCtx.fillStyle = '#16213e';
            canvasCtx.fillRect(0, 0, width, height);

            const barWidth = (width / bufferLength) * 2.5;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * height;
                const gradient = canvasCtx.createLinearGradient(0, height, 0, height - barHeight);
                gradient.addColorStop(0, '#667eea');
                gradient.addColorStop(1, '#764ba2');
                canvasCtx.fillStyle = gradient;
                canvasCtx.fillRect(x, height - barHeight, barWidth, barHeight);
                x += barWidth + 1;
            }
        }
        draw();
    } catch (err) {
        console.error('Error accessing microphone:', err);
    }
}

function stopVisualization() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    if (audioContext) {
        audioContext.close();
    }
    // Clear canvas
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    canvasCtx.fillStyle = '#16213e';
    canvasCtx.fillRect(0, 0, width, height);
}

// Event Listeners
startBtn.addEventListener('click', () => {
    if (initSpeechRecognition()) {
        recognition.lang = languageSelect.value;
        recognition.continuous = continuousCheck.checked;
        recognition.start();
        startVisualization();
    }
});

stopBtn.addEventListener('click', () => {
    isRecording = false;
    if (recognition) {
        recognition.stop();
    }
    stopVisualization();
});

clearBtn.addEventListener('click', () => {
    finalTranscript = '';
    interimTranscript = '';
    updateTranscript();
});

copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(finalTranscript.trim()).then(() => {
        alert(translations[currentLang].copied);
    });
});

downloadBtn.addEventListener('click', () => {
    const blob = new Blob([finalTranscript.trim()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
});

languageSelect.addEventListener('change', () => {
    if (recognition) {
        recognition.lang = languageSelect.value;
    }
});

// Initialize
setLanguage('en');
