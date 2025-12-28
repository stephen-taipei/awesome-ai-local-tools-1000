/**
 * Keyword Spotting - Tool #208
 */

const translations = {
    en: {
        title: 'Keyword Spotting',
        subtitle: 'Detect specific keywords in speech',
        keywords: 'Keywords to Detect',
        enterKeyword: 'Enter keyword...',
        add: 'Add',
        ready: 'Ready to listen',
        listening: 'Listening...',
        start: 'Start Listening',
        stop: 'Stop',
        clearLog: 'Clear Log',
        detectionLog: 'Detection Log',
        noDetections: 'No keywords detected yet...',
        detected: 'Detected!'
    },
    zh: {
        title: '關鍵字偵測',
        subtitle: '在語音中偵測特定關鍵字',
        keywords: '要偵測的關鍵字',
        enterKeyword: '輸入關鍵字...',
        add: '新增',
        ready: '準備聆聽',
        listening: '聆聽中...',
        start: '開始聆聽',
        stop: '停止',
        clearLog: '清除記錄',
        detectionLog: '偵測記錄',
        noDetections: '尚未偵測到關鍵字...',
        detected: '偵測到！'
    }
};

let currentLang = 'en';
let keywords = ['hello', 'stop', 'start'];
let recognition = null;
let isListening = false;
let detections = [];
let audioContext, analyser, animationId;

const canvas = document.getElementById('waveform');
const ctx = canvas.getContext('2d');
const keywordInput = document.getElementById('keywordInput');
const keywordTags = document.getElementById('keywordTags');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const clearLogBtn = document.getElementById('clearLogBtn');
const logList = document.getElementById('logList');
const statusText = document.getElementById('statusText');

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) el.textContent = translations[lang][key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[lang][key]) el.placeholder = translations[lang][key];
    });
    document.getElementById('lang-en').classList.toggle('active', lang === 'en');
    document.getElementById('lang-zh').classList.toggle('active', lang === 'zh');
}

document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));
document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh'));

function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = 80;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function renderKeywords() {
    keywordTags.innerHTML = keywords.map(word =>
        `<div class="keyword-tag" data-word="${word}">${word} <span class="remove" onclick="removeKeyword('${word}')">x</span></div>`
    ).join('');
}

window.removeKeyword = (word) => {
    keywords = keywords.filter(k => k !== word);
    renderKeywords();
};

document.getElementById('addKeywordBtn').addEventListener('click', () => {
    const word = keywordInput.value.trim().toLowerCase();
    if (word && !keywords.includes(word)) {
        keywords.push(word);
        renderKeywords();
        keywordInput.value = '';
    }
});

keywordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('addKeywordBtn').click();
    }
});

function highlightKeyword(word) {
    const tag = document.querySelector(`.keyword-tag[data-word="${word}"]`);
    if (tag) {
        tag.classList.add('detected');
        setTimeout(() => tag.classList.remove('detected'), 1000);
    }
}

function addDetection(word) {
    const time = new Date().toLocaleTimeString();
    detections.unshift({ word, time });
    renderLog();
    highlightKeyword(word);
}

function renderLog() {
    if (detections.length === 0) {
        logList.innerHTML = `<p class="placeholder">${translations[currentLang].noDetections}</p>`;
    } else {
        logList.innerHTML = detections.map(d =>
            `<div class="log-entry"><span class="keyword">"${d.word}"</span><span class="time">${d.time}</span></div>`
        ).join('');
    }
}

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
            if (!isListening) return;
            animationId = requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);

            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 2.5;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * canvas.height;
                const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
                gradient.addColorStop(0, '#ff9a9e');
                gradient.addColorStop(1, '#fecfef');
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

function initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert('Speech recognition not supported');
        return null;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript.toLowerCase();
            keywords.forEach(word => {
                if (transcript.includes(word)) {
                    addDetection(word);
                }
            });
        }
    };

    rec.onend = () => {
        if (isListening) rec.start();
    };

    return rec;
}

startBtn.addEventListener('click', () => {
    recognition = initRecognition();
    if (!recognition) return;

    isListening = true;
    recognition.start();
    startVisualization();

    statusText.textContent = translations[currentLang].listening;
    startBtn.disabled = true;
    stopBtn.disabled = false;
});

stopBtn.addEventListener('click', () => {
    isListening = false;
    if (recognition) recognition.stop();
    if (animationId) cancelAnimationFrame(animationId);
    if (audioContext) audioContext.close();

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    statusText.textContent = translations[currentLang].ready;
    startBtn.disabled = false;
    stopBtn.disabled = true;
});

clearLogBtn.addEventListener('click', () => {
    detections = [];
    renderLog();
});

setLanguage('en');
renderKeywords();
