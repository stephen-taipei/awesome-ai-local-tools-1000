/**
 * Meeting Transcription - Tool #204
 */

const translations = {
    en: {
        title: 'Meeting Transcription',
        subtitle: 'Record and transcribe meetings with timestamps',
        meetingDetails: 'Meeting Details',
        meetingTitlePlaceholder: 'Meeting Title',
        participants: 'Participants',
        addParticipant: 'Add participant name',
        ready: 'Ready',
        recording: 'Recording',
        start: 'Start Recording',
        stop: 'Stop',
        export: 'Export',
        transcript: 'Meeting Transcript',
        placeholder: 'Click Start to begin recording...',
        summary: 'Meeting Summary',
        exportSuccess: 'Meeting transcript exported!'
    },
    zh: {
        title: '會議轉錄',
        subtitle: '錄製並轉錄會議，附帶時間戳記',
        meetingDetails: '會議詳情',
        meetingTitlePlaceholder: '會議標題',
        participants: '參與者',
        addParticipant: '新增參與者名稱',
        ready: '準備就緒',
        recording: '錄音中',
        start: '開始錄音',
        stop: '停止',
        export: '匯出',
        transcript: '會議轉錄',
        placeholder: '點擊開始來錄製會議...',
        summary: '會議摘要',
        exportSuccess: '會議記錄已匯出！'
    }
};

let currentLang = 'en';
let isRecording = false;
let recognition = null;
let startTime = null;
let timerInterval = null;
let participants = [];
let transcriptEntries = [];
let audioContext, analyser, animationId;

const canvas = document.getElementById('waveform');
const ctx = canvas.getContext('2d');

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[lang][key]) {
            el.placeholder = translations[lang][key];
        }
    });
    document.getElementById('lang-en').classList.toggle('active', lang === 'en');
    document.getElementById('lang-zh').classList.toggle('active', lang === 'zh');
}

document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));
document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh'));

// Set current date
document.getElementById('meetingDate').value = new Date().toLocaleString();

// Participant management
document.getElementById('addParticipantBtn').addEventListener('click', () => {
    const input = document.getElementById('newParticipant');
    const name = input.value.trim();
    if (name && !participants.includes(name)) {
        participants.push(name);
        renderParticipants();
        input.value = '';
    }
});

function renderParticipants() {
    const list = document.getElementById('participantList');
    list.innerHTML = participants.map((p, i) => `
        <div class="participant">
            <span>${p}</span>
            <span class="remove" onclick="removeParticipant(${i})">x</span>
        </div>
    `).join('');
}

window.removeParticipant = (index) => {
    participants.splice(index, 1);
    renderParticipants();
};

// Canvas resize
function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = 80;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Timer
function updateTimer() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const hours = Math.floor(elapsed / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((elapsed % 3600) / 60).toString().padStart(2, '0');
    const seconds = (elapsed % 60).toString().padStart(2, '0');
    document.getElementById('timer').textContent = `${hours}:${minutes}:${seconds}`;
}

function getTimestamp() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const seconds = (elapsed % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
}

// Visualization
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
                ctx.fillStyle = `hsl(${250 + i * 0.5}, 70%, 60%)`;
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

// Speech recognition
function initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert('Speech recognition not supported');
        return null;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
                const text = event.results[i][0].transcript;
                addTranscriptEntry(text);
            }
        }
    };

    rec.onend = () => {
        if (isRecording) rec.start();
    };

    return rec;
}

function addTranscriptEntry(text) {
    const entry = {
        time: getTimestamp(),
        speaker: participants.length > 0 ? participants[0] : 'Speaker',
        text: text
    };
    transcriptEntries.push(entry);
    renderTranscript();
}

function renderTranscript() {
    const list = document.getElementById('transcriptList');
    if (transcriptEntries.length === 0) {
        list.innerHTML = `<p class="placeholder">${translations[currentLang].placeholder}</p>`;
        return;
    }

    list.innerHTML = transcriptEntries.map(entry => `
        <div class="transcript-entry">
            <div class="transcript-time">[${entry.time}]</div>
            <div class="transcript-speaker">${entry.speaker}</div>
            <div class="transcript-text">${entry.text}</div>
        </div>
    `).join('');

    list.scrollTop = list.scrollHeight;
}

// Controls
document.getElementById('startBtn').addEventListener('click', () => {
    recognition = initRecognition();
    if (!recognition) return;

    isRecording = true;
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);

    recognition.start();
    startVisualization();

    document.getElementById('recordingDot').classList.remove('stopped');
    document.getElementById('statusText').textContent = translations[currentLang].recording;
    document.getElementById('startBtn').disabled = true;
    document.getElementById('stopBtn').disabled = false;
});

document.getElementById('stopBtn').addEventListener('click', () => {
    isRecording = false;
    if (recognition) recognition.stop();
    if (timerInterval) clearInterval(timerInterval);
    stopVisualization();

    document.getElementById('recordingDot').classList.add('stopped');
    document.getElementById('statusText').textContent = translations[currentLang].ready;
    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;
});

document.getElementById('exportBtn').addEventListener('click', () => {
    const title = document.getElementById('meetingTitle').value || 'Meeting';
    const date = document.getElementById('meetingDate').value;

    let content = `${title}\n${'='.repeat(50)}\n`;
    content += `Date: ${date}\n`;
    content += `Participants: ${participants.join(', ') || 'N/A'}\n\n`;
    content += `Transcript:\n${'-'.repeat(30)}\n`;

    transcriptEntries.forEach(entry => {
        content += `[${entry.time}] ${entry.speaker}: ${entry.text}\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meeting-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    alert(translations[currentLang].exportSuccess);
});

setLanguage('en');
