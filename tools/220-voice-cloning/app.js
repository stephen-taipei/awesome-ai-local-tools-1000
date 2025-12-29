/**
 * Voice Cloning - Tool #220
 */

let synth = window.speechSynthesis;
let voices = [];

const profiles = {
    'male-adult': { pitch: 0.8, rate: 0.95, volume: 1 },
    'female-adult': { pitch: 1.2, rate: 1, volume: 1 },
    'child': { pitch: 1.5, rate: 1.1, volume: 1 },
    'elderly': { pitch: 0.7, rate: 0.8, volume: 0.9 },
    'robot': { pitch: 1, rate: 1.2, volume: 1 },
    'whisper': { pitch: 1, rate: 0.85, volume: 0.5 }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    document.querySelectorAll('.profile-card').forEach(card => {
        card.addEventListener('click', () => selectProfile(card));
    });

    document.getElementById('pitch').addEventListener('input', (e) => {
        document.getElementById('pitchValue').textContent = e.target.value;
    });
    document.getElementById('rate').addEventListener('input', (e) => {
        document.getElementById('rateValue').textContent = e.target.value;
    });
    document.getElementById('volume').addEventListener('input', (e) => {
        document.getElementById('volumeValue').textContent = e.target.value;
    });

    document.getElementById('playBtn').addEventListener('click', play);
    document.getElementById('stopBtn').addEventListener('click', stop);

    loadVoices();
    synth.onvoiceschanged = loadVoices;
}

function loadVoices() {
    voices = synth.getVoices();
}

function selectProfile(card) {
    document.querySelectorAll('.profile-card').forEach(c => c.classList.remove('active'));
    card.classList.add('active');

    const profile = profiles[card.dataset.profile];
    if (profile) {
        document.getElementById('pitch').value = profile.pitch;
        document.getElementById('rate').value = profile.rate;
        document.getElementById('volume').value = profile.volume;
        document.getElementById('pitchValue').textContent = profile.pitch;
        document.getElementById('rateValue').textContent = profile.rate;
        document.getElementById('volumeValue').textContent = profile.volume;
    }
}

function play() {
    const text = document.getElementById('inputText').value.trim();
    if (!text) return;

    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Find a suitable voice (prefer Chinese)
    const chineseVoice = voices.find(v => v.lang.includes('zh'));
    if (chineseVoice) utterance.voice = chineseVoice;

    utterance.pitch = parseFloat(document.getElementById('pitch').value);
    utterance.rate = parseFloat(document.getElementById('rate').value);
    utterance.volume = parseFloat(document.getElementById('volume').value);

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
