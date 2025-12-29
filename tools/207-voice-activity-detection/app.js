/**
 * Voice Activity Detection - Tool #207
 */

const translations = {
    en: {
        title: 'Voice Activity Detection',
        subtitle: 'Real-time speech detection using Web Audio API',
        silent: 'Silent',
        speaking: 'Speaking',
        settings: 'Settings',
        threshold: 'Detection Threshold:',
        smoothing: 'Smoothing:',
        start: 'Start Detection',
        stop: 'Stop',
        speakingTime: 'Speaking Time',
        silentTime: 'Silent Time',
        ratio: 'Speaking Ratio'
    },
    zh: {
        title: '語音活動偵測',
        subtitle: '使用 Web Audio API 即時偵測語音',
        silent: '靜音',
        speaking: '說話中',
        settings: '設定',
        threshold: '偵測閾值：',
        smoothing: '平滑度：',
        start: '開始偵測',
        stop: '停止',
        speakingTime: '說話時間',
        silentTime: '靜音時間',
        ratio: '說話比例'
    }
};

let currentLang = 'en';
let isRunning = false;
let audioContext, analyser, animationId;
let threshold = 30;
let smoothing = 0.5;
let isSpeaking = false;
let speakingSeconds = 0;
let silentSeconds = 0;
let lastUpdateTime = Date.now();

const canvas = document.getElementById('waveform');
const ctx = canvas.getContext('2d');
const vadIndicator = document.getElementById('vadIndicator');
const statusText = document.getElementById('statusText');
const volumeFill = document.getElementById('volumeFill');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const thresholdSlider = document.getElementById('thresholdSlider');
const smoothingSlider = document.getElementById('smoothingSlider');

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
    updateStatus();
}

document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));
document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh'));

function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = 100;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

thresholdSlider.addEventListener('input', (e) => {
    threshold = parseInt(e.target.value);
    document.getElementById('thresholdValue').textContent = threshold;
});

smoothingSlider.addEventListener('input', (e) => {
    smoothing = parseInt(e.target.value) / 100;
    document.getElementById('smoothingValue').textContent = e.target.value;
    if (analyser) analyser.smoothingTimeConstant = smoothing;
});

function updateStatus() {
    if (isSpeaking) {
        vadIndicator.classList.remove('silent');
        vadIndicator.classList.add('speaking');
        statusText.textContent = translations[currentLang].speaking;
    } else {
        vadIndicator.classList.remove('speaking');
        vadIndicator.classList.add('silent');
        statusText.textContent = translations[currentLang].silent;
    }
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function updateStats() {
    document.getElementById('speakingTime').textContent = formatTime(speakingSeconds);
    document.getElementById('silentTime').textContent = formatTime(silentSeconds);
    const total = speakingSeconds + silentSeconds;
    const ratio = total > 0 ? Math.round((speakingSeconds / total) * 100) : 0;
    document.getElementById('speakingRatio').textContent = ratio + '%';
}

async function startVAD() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = smoothing;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const timeData = new Uint8Array(analyser.fftSize);

        isRunning = true;
        lastUpdateTime = Date.now();

        function detect() {
            if (!isRunning) return;
            animationId = requestAnimationFrame(detect);

            analyser.getByteFrequencyData(dataArray);
            analyser.getByteTimeDomainData(timeData);

            // Calculate RMS volume
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
            }
            const average = sum / bufferLength;
            const volume = Math.min(100, average * 1.5);

            volumeFill.style.width = volume + '%';

            // VAD decision
            const wasSpeaking = isSpeaking;
            isSpeaking = volume > threshold;

            if (isSpeaking !== wasSpeaking) {
                updateStatus();
            }

            // Update time tracking
            const now = Date.now();
            const elapsed = (now - lastUpdateTime) / 1000;
            lastUpdateTime = now;

            if (isSpeaking) {
                speakingSeconds += elapsed;
            } else {
                silentSeconds += elapsed;
            }
            updateStats();

            // Draw waveform
            ctx.fillStyle = '#16213e';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.lineWidth = 2;
            ctx.strokeStyle = isSpeaking ? '#38ef7d' : '#4a5568';
            ctx.beginPath();

            const sliceWidth = canvas.width / timeData.length;
            let x = 0;

            for (let i = 0; i < timeData.length; i++) {
                const v = timeData[i] / 128.0;
                const y = v * canvas.height / 2;

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
                x += sliceWidth;
            }

            ctx.lineTo(canvas.width, canvas.height / 2);
            ctx.stroke();
        }

        detect();
        startBtn.disabled = true;
        stopBtn.disabled = false;
    } catch (err) {
        console.error('Error:', err);
        alert('Could not access microphone');
    }
}

function stopVAD() {
    isRunning = false;
    if (animationId) cancelAnimationFrame(animationId);
    if (audioContext) audioContext.close();

    ctx.fillStyle = '#16213e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    volumeFill.style.width = '0%';

    isSpeaking = false;
    updateStatus();

    startBtn.disabled = false;
    stopBtn.disabled = true;
}

startBtn.addEventListener('click', startVAD);
stopBtn.addEventListener('click', stopVAD);

setLanguage('en');
