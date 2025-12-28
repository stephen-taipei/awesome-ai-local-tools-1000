/**
 * Real-time Reading - Tool #216
 */

let synth = window.speechSynthesis;
let voices = [];
let mode = 'word'; // 'word' or 'sentence'
let lastReadIndex = 0;
let history = [];

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    document.getElementById('wordModeBtn').addEventListener('click', () => setMode('word'));
    document.getElementById('sentenceModeBtn').addEventListener('click', () => setMode('sentence'));

    document.getElementById('inputText').addEventListener('input', handleInput);

    document.getElementById('rate').addEventListener('input', (e) => {
        document.getElementById('rateValue').textContent = e.target.value + 'x';
    });

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
        `<option value="${voices.indexOf(v)}">${v.name}</option>`
    ).join('');
}

function setMode(newMode) {
    mode = newMode;
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(newMode + 'ModeBtn').classList.add('active');
    lastReadIndex = document.getElementById('inputText').value.length;
}

function handleInput(e) {
    if (!document.getElementById('enableReading').checked) return;

    const text = e.target.value;
    const newText = text.substring(lastReadIndex);

    if (mode === 'word') {
        // Trigger on space or punctuation
        const triggers = [' ', '　', '，', '。', '！', '？', '、', '；', '：', '\n'];
        const lastChar = text.charAt(text.length - 1);

        if (triggers.includes(lastChar)) {
            const words = newText.trim();
            if (words) {
                speak(words);
                lastReadIndex = text.length;
            }
        }
    } else {
        // Trigger on sentence end
        const sentenceEnds = ['。', '！', '？', '.', '!', '?'];
        const lastChar = text.charAt(text.length - 1);

        if (sentenceEnds.includes(lastChar)) {
            const sentence = newText.trim();
            if (sentence) {
                speak(sentence);
                lastReadIndex = text.length;
            }
        }
    }
}

function speak(text) {
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    const voiceIndex = document.getElementById('voiceSelect').value;
    if (voiceIndex) utterance.voice = voices[parseInt(voiceIndex)];

    utterance.rate = parseFloat(document.getElementById('rate').value);

    synth.speak(utterance);

    addToHistory(text);
}

function addToHistory(text) {
    const now = new Date();
    const time = now.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });

    history.unshift({ text, time });
    if (history.length > 20) history.pop();

    renderHistory();
}

function renderHistory() {
    if (history.length === 0) {
        document.getElementById('historyList').innerHTML = '<div class="empty-hint">尚無朗讀記錄</div>';
        return;
    }

    const html = history.map(item => `
        <div class="history-item">
            <span class="text">${escapeHtml(item.text.substring(0, 50))}${item.text.length > 50 ? '...' : ''}</span>
            <span class="time">${item.time}</span>
        </div>
    `).join('');

    document.getElementById('historyList').innerHTML = html;
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

init();
