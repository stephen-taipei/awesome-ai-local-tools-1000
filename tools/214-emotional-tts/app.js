/**
 * Emotional TTS - Tool #214
 */

let synth = window.speechSynthesis;
let voices = [];
let currentEmotion = { rate: 1, pitch: 1 };

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    document.querySelectorAll('.emotion-btn').forEach(btn => {
        btn.addEventListener('click', () => selectEmotion(btn));
    });

    document.getElementById('intensity').addEventListener('input', (e) => {
        document.getElementById('intensityValue').textContent = Math.round(e.target.value * 100) + '%';
    });

    document.getElementById('playBtn').addEventListener('click', play);
    document.getElementById('stopBtn').addEventListener('click', stop);

    loadVoices();
    synth.onvoiceschanged = loadVoices;
}

function loadVoices() {
    voices = synth.getVoices();
    const select = document.getElementById('voiceSelect');

    if (voices.length === 0) {
        select.innerHTML = '<option value="">無可用語音</option>';
        return;
    }

    // Prefer Chinese voices
    const sortedVoices = [...voices].sort((a, b) => {
        const aIsChinese = a.lang.includes('zh');
        const bIsChinese = b.lang.includes('zh');
        if (aIsChinese && !bIsChinese) return -1;
        if (!aIsChinese && bIsChinese) return 1;
        return 0;
    });

    select.innerHTML = sortedVoices.map((v, i) =>
        `<option value="${voices.indexOf(v)}">${v.name} (${v.lang})</option>`
    ).join('');
}

function selectEmotion(btn) {
    document.querySelectorAll('.emotion-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    currentEmotion = {
        rate: parseFloat(btn.dataset.rate),
        pitch: parseFloat(btn.dataset.pitch)
    };
}

function play() {
    const text = document.getElementById('inputText').value.trim();
    if (!text) return;

    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    const voiceIndex = document.getElementById('voiceSelect').value;
    if (voiceIndex) {
        utterance.voice = voices[parseInt(voiceIndex)];
    }

    const intensity = parseFloat(document.getElementById('intensity').value);

    // Apply emotion with intensity modifier
    const rateModifier = (currentEmotion.rate - 1) * intensity;
    const pitchModifier = (currentEmotion.pitch - 1) * intensity;

    utterance.rate = Math.max(0.5, Math.min(2, 1 + rateModifier));
    utterance.pitch = Math.max(0.5, Math.min(2, 1 + pitchModifier));

    utterance.onstart = () => {
        document.getElementById('playBtn').disabled = true;
        document.getElementById('stopBtn').disabled = false;
    };

    utterance.onend = () => {
        document.getElementById('playBtn').disabled = false;
        document.getElementById('stopBtn').disabled = true;
    };

    utterance.onerror = () => {
        document.getElementById('playBtn').disabled = false;
        document.getElementById('stopBtn').disabled = true;
    };

    synth.speak(utterance);
}

function stop() {
    synth.cancel();
    document.getElementById('playBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;
}

init();
