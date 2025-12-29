/**
 * Navigation TTS - Tool #219
 */

let synth = window.speechSynthesis;
let voices = [];

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    document.querySelectorAll('.cmd-btn').forEach(btn => {
        btn.addEventListener('click', () => speak(btn.dataset.text));
    });

    document.getElementById('playCustomBtn').addEventListener('click', () => {
        const text = document.getElementById('customText').value.trim();
        if (text) speak(text);
    });

    document.getElementById('customText').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const text = e.target.value.trim();
            if (text) speak(text);
        }
    });

    loadVoices();
    synth.onvoiceschanged = loadVoices;
}

function loadVoices() {
    voices = synth.getVoices();
    const select = document.getElementById('voiceSelect');

    // Prefer Chinese voices
    const sortedVoices = [...voices].sort((a, b) => {
        const aIsChinese = a.lang.includes('zh');
        const bIsChinese = b.lang.includes('zh');
        if (aIsChinese && !bIsChinese) return -1;
        if (!aIsChinese && bIsChinese) return 1;
        return 0;
    });

    select.innerHTML = sortedVoices.map((v, i) =>
        `<option value="${voices.indexOf(v)}">${v.name}</option>`
    ).join('');
}

function speak(text) {
    synth.cancel();

    // Update display
    document.getElementById('currentInstruction').textContent = text;
    document.getElementById('distanceInfo').textContent = '正在播報...';

    const utterance = new SpeechSynthesisUtterance(text);

    const voiceIndex = document.getElementById('voiceSelect').value;
    if (voiceIndex) utterance.voice = voices[parseInt(voiceIndex)];

    utterance.rate = parseFloat(document.getElementById('speed').value);
    utterance.volume = parseFloat(document.getElementById('volume').value);
    utterance.pitch = 1;

    utterance.onend = () => {
        document.getElementById('distanceInfo').textContent = '播報完成';
    };

    utterance.onerror = () => {
        document.getElementById('distanceInfo').textContent = '播報失敗';
    };

    synth.speak(utterance);
}

init();
