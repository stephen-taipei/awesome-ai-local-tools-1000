/**
 * Speed & Pitch Control - Tool #217
 */

let synth = window.speechSynthesis;
let voices = [];

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    document.getElementById('rate').addEventListener('input', (e) => {
        document.getElementById('rateValue').textContent = parseFloat(e.target.value).toFixed(2) + 'x';
    });
    document.getElementById('pitch').addEventListener('input', (e) => {
        document.getElementById('pitchValue').textContent = parseFloat(e.target.value).toFixed(2) + 'x';
    });
    document.getElementById('volume').addEventListener('input', (e) => {
        document.getElementById('volumeValue').textContent = Math.round(e.target.value * 100) + '%';
    });

    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => applyPreset(btn));
    });

    document.getElementById('playBtn').addEventListener('click', play);
    document.getElementById('stopBtn').addEventListener('click', stop);
    document.getElementById('resetBtn').addEventListener('click', reset);

    loadVoices();
    synth.onvoiceschanged = loadVoices;
}

function loadVoices() {
    voices = synth.getVoices();
    const select = document.getElementById('voiceSelect');

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

function applyPreset(btn) {
    const rate = parseFloat(btn.dataset.rate);
    const pitch = parseFloat(btn.dataset.pitch);

    document.getElementById('rate').value = rate;
    document.getElementById('pitch').value = pitch;
    document.getElementById('rateValue').textContent = rate.toFixed(2) + 'x';
    document.getElementById('pitchValue').textContent = pitch.toFixed(2) + 'x';
}

function play() {
    const text = document.getElementById('inputText').value.trim();
    if (!text) return;

    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    const voiceIndex = document.getElementById('voiceSelect').value;
    if (voiceIndex) utterance.voice = voices[parseInt(voiceIndex)];

    utterance.rate = parseFloat(document.getElementById('rate').value);
    utterance.pitch = parseFloat(document.getElementById('pitch').value);
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

function reset() {
    document.getElementById('rate').value = 1;
    document.getElementById('pitch').value = 1;
    document.getElementById('volume').value = 1;
    document.getElementById('rateValue').textContent = '1.00x';
    document.getElementById('pitchValue').textContent = '1.00x';
    document.getElementById('volumeValue').textContent = '100%';
}

init();
