/**
 * Accent-Adapted Recognition - Tool #210
 */

const translations = {
    en: {
        title: 'Accent-Adapted Recognition',
        subtitle: 'Optimized speech recognition for different accents',
        selectAccent: 'Select Your Accent',
        ready: 'Ready to record',
        recording: 'Recording...',
        start: 'Start',
        stop: 'Stop',
        clear: 'Clear',
        transcript: 'Transcript',
        placeholder: 'Select your accent and start speaking...',
        confidence: 'Recognition Confidence:',
        tips: 'Tips for Better Recognition',
        tip1: 'Speak clearly and at a moderate pace',
        tip2: 'Reduce background noise',
        tip3: 'Position microphone close to your mouth',
        tip4: 'Select the accent closest to yours'
    },
    zh: {
        title: '口音適應識別',
        subtitle: '針對不同口音優化的語音識別',
        selectAccent: '選擇您的口音',
        ready: '準備錄音',
        recording: '錄音中...',
        start: '開始',
        stop: '停止',
        clear: '清除',
        transcript: '轉錄文字',
        placeholder: '選擇您的口音並開始說話...',
        confidence: '識別信心度：',
        tips: '提高識別準確度的技巧',
        tip1: '清晰且適中的語速說話',
        tip2: '減少背景噪音',
        tip3: '將麥克風靠近嘴巴',
        tip4: '選擇最接近您的口音'
    }
};

let currentLang = 'en';
let selectedAccent = 'en-US';
let recognition = null;
let isRecording = false;
let transcript = '';
let audioContext, analyser, animationId;

const canvas = document.getElementById('waveform');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const clearBtn = document.getElementById('clearBtn');
const transcriptContent = document.getElementById('transcriptContent');
const statusText = document.getElementById('statusText');
const confidenceValue = document.getElementById('confidenceValue');
const confidenceFill = document.getElementById('confidenceFill');

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) el.textContent = translations[lang][key];
    });
    document.getElementById('lang-en').classList.toggle('active', lang === 'en');
    document.getElementById('lang-zh').classList.toggle('active', lang === 'zh');
}

document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));
document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh'));

// Accent selection
document.getElementById('accentGrid').addEventListener('click', (e) => {
    const option = e.target.closest('.accent-option');
    if (option) {
        document.querySelectorAll('.accent-option').forEach(o => o.classList.remove('active'));
        option.classList.add('active');
        selectedAccent = option.dataset.accent;
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
                gradient.addColorStop(0, '#f12711');
                gradient.addColorStop(1, '#f5af19');
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

function updateConfidence(confidence) {
    const percent = Math.round(confidence * 100);
    confidenceValue.textContent = percent + '%';
    confidenceFill.style.width = percent + '%';
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
    rec.lang = selectedAccent;

    rec.onresult = (event) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
                transcript += result[0].transcript + ' ';
                updateConfidence(result[0].confidence || 0.8);
            } else {
                interim += result[0].transcript;
            }
        }
        transcriptContent.innerHTML = transcript + '<span style="color:#999">' + interim + '</span>';
    };

    rec.onend = () => {
        if (isRecording) rec.start();
    };

    rec.onerror = (e) => {
        console.error('Recognition error:', e);
    };

    return rec;
}

startBtn.addEventListener('click', () => {
    recognition = initRecognition();
    if (!recognition) return;

    isRecording = true;
    recognition.start();
    startVisualization();

    statusText.textContent = translations[currentLang].recording;
    startBtn.disabled = true;
    stopBtn.disabled = false;
});

stopBtn.addEventListener('click', () => {
    isRecording = false;
    if (recognition) recognition.stop();
    stopVisualization();

    statusText.textContent = translations[currentLang].ready;
    startBtn.disabled = false;
    stopBtn.disabled = true;
});

clearBtn.addEventListener('click', () => {
    transcript = '';
    transcriptContent.textContent = translations[currentLang].placeholder;
    updateConfidence(0);
});

setLanguage('en');
