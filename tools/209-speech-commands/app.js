/**
 * Speech Commands - Tool #209
 */

const translations = {
    en: {
        title: 'Speech Commands',
        subtitle: 'Control actions with your voice',
        availableCommands: 'Available Commands',
        tapToStart: 'Tap to start listening',
        listening: 'Listening...',
        lastCommand: 'Last Command:',
        actionResult: 'Action Result',
        waitingForCommand: 'Waiting for command...',
        commandExecuted: 'Command executed: '
    },
    zh: {
        title: '語音指令',
        subtitle: '用您的聲音控制動作',
        availableCommands: '可用指令',
        tapToStart: '點擊開始聆聽',
        listening: '聆聽中...',
        lastCommand: '上一個指令：',
        actionResult: '動作結果',
        waitingForCommand: '等待指令...',
        commandExecuted: '已執行指令：'
    }
};

let currentLang = 'en';
let isListening = false;
let recognition = null;
let audioContext, analyser, animationId;

const commands = {
    up: { icon: '⬆️', action: () => 'Moving UP!' },
    down: { icon: '⬇️', action: () => 'Moving DOWN!' },
    left: { icon: '⬅️', action: () => 'Moving LEFT!' },
    right: { icon: '➡️', action: () => 'Moving RIGHT!' },
    go: { icon: '▶️', action: () => 'Starting action...' },
    stop: { icon: '⏹️', action: () => 'Stopping...' },
    yes: { icon: '✅', action: () => 'Confirmed!' },
    no: { icon: '❌', action: () => 'Cancelled!' }
};

const canvas = document.getElementById('waveform');
const ctx = canvas.getContext('2d');
const micIcon = document.getElementById('micIcon');
const statusText = document.getElementById('statusText');
const lastCommand = document.getElementById('lastCommand');
const actionOutput = document.getElementById('actionOutput');

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

function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = 60;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function highlightCommand(cmd) {
    document.querySelectorAll('.command-card').forEach(card => {
        card.classList.remove('detected');
        if (card.dataset.command === cmd) {
            card.classList.add('detected');
            setTimeout(() => card.classList.remove('detected'), 1000);
        }
    });
}

function executeCommand(cmd) {
    if (commands[cmd]) {
        highlightCommand(cmd);
        lastCommand.textContent = cmd.toUpperCase();
        actionOutput.textContent = translations[currentLang].commandExecuted + commands[cmd].action();
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
                gradient.addColorStop(0, '#5f2c82');
                gradient.addColorStop(1, '#49a09d');
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
    rec.interimResults = false;

    rec.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript.toLowerCase().trim();
            Object.keys(commands).forEach(cmd => {
                if (transcript.includes(cmd)) {
                    executeCommand(cmd);
                }
            });
        }
    };

    rec.onend = () => {
        if (isListening) rec.start();
    };

    return rec;
}

function toggleListening() {
    if (isListening) {
        isListening = false;
        if (recognition) recognition.stop();
        stopVisualization();
        micIcon.classList.remove('listening');
        statusText.textContent = translations[currentLang].tapToStart;
    } else {
        recognition = initRecognition();
        if (!recognition) return;

        isListening = true;
        recognition.start();
        startVisualization();
        micIcon.classList.add('listening');
        statusText.textContent = translations[currentLang].listening;
    }
}

micIcon.addEventListener('click', toggleListening);

// Toggle command cards
document.getElementById('commandGrid').addEventListener('click', (e) => {
    const card = e.target.closest('.command-card');
    if (card) {
        card.classList.toggle('active');
    }
});

setLanguage('en');
