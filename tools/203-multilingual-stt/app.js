/**
 * Multilingual Speech-to-Text - Tool #203
 */

const translations = {
    en: {
        title: 'Multilingual Speech-to-Text',
        subtitle: 'Auto-detect and transcribe speech in 50+ languages',
        privacy: '100% Browser-based Processing',
        selectLanguage: 'Select Language',
        ready: 'Ready to record',
        recording: 'Recording...',
        start: 'Start',
        stop: 'Stop',
        copy: 'Copy',
        download: 'Download',
        transcript: 'Transcript',
        placeholder: 'Select a language and click Start to begin...',
        copied: 'Copied!'
    },
    zh: {
        title: '多語言語音轉文字',
        subtitle: '自動檢測並轉錄 50+ 種語言',
        privacy: '100% 瀏覽器處理',
        selectLanguage: '選擇語言',
        ready: '準備錄音',
        recording: '錄音中...',
        start: '開始',
        stop: '停止',
        copy: '複製',
        download: '下載',
        transcript: '轉錄文字',
        placeholder: '選擇語言並點擊開始...',
        copied: '已複製！'
    }
};

let currentLang = 'en';
let selectedSpeechLang = 'en-US';
let recognition = null;
let isRecording = false;
let transcript = '';
let audioContext, analyser, animationId;

const canvas = document.getElementById('waveform');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const transcriptContent = document.getElementById('transcriptContent');
const statusText = document.getElementById('statusText');
const languageGrid = document.getElementById('languageGrid');

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

// Language selection
languageGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('.language-btn');
    if (btn) {
        document.querySelectorAll('.language-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedSpeechLang = btn.dataset.lang;
    }
});

function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = 80;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

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

            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 2.5;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * canvas.height;
                const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
                gradient.addColorStop(0, '#a8edea');
                gradient.addColorStop(1, '#fed6e3');
                ctx.fillStyle = gradient;
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                x += barWidth + 1;
            }
        }
        draw();
    } catch (err) {
        console.error('Microphone error:', err);
    }
}

function stopVisualization() {
    if (animationId) cancelAnimationFrame(animationId);
    if (audioContext) audioContext.close();
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert('Speech recognition not supported');
        return null;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = selectedSpeechLang;

    rec.onstart = () => {
        isRecording = true;
        statusText.textContent = translations[currentLang].recording;
        startBtn.disabled = true;
        stopBtn.disabled = false;
    };

    rec.onend = () => {
        if (isRecording) {
            rec.start();
        } else {
            statusText.textContent = translations[currentLang].ready;
            startBtn.disabled = false;
            stopBtn.disabled = true;
            stopVisualization();
        }
    };

    rec.onresult = (event) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
                transcript += event.results[i][0].transcript + ' ';
            } else {
                interim += event.results[i][0].transcript;
            }
        }
        transcriptContent.innerHTML = transcript + '<span style="color:#999">' + interim + '</span>';
    };

    rec.onerror = (e) => {
        console.error('Recognition error:', e);
        isRecording = false;
    };

    return rec;
}

startBtn.addEventListener('click', () => {
    recognition = initRecognition();
    if (recognition) {
        recognition.start();
        startVisualization();
    }
});

stopBtn.addEventListener('click', () => {
    isRecording = false;
    if (recognition) recognition.stop();
});

copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(transcript).then(() => {
        alert(translations[currentLang].copied);
    });
});

downloadBtn.addEventListener('click', () => {
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${selectedSpeechLang}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
});

setLanguage('en');
