/**
 * Chinese TTS - Tool #212
 */

let synth = window.speechSynthesis;
let utterance = null;
let voices = [];
let isPaused = false;

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    document.getElementById('loadSampleBtn').addEventListener('click', loadSample);
    document.getElementById('inputText').addEventListener('input', updateCharCount);

    document.getElementById('rate').addEventListener('input', (e) => {
        document.getElementById('rateValue').textContent = e.target.value + 'x';
    });
    document.getElementById('pitch').addEventListener('input', (e) => {
        document.getElementById('pitchValue').textContent = e.target.value + 'x';
    });
    document.getElementById('volume').addEventListener('input', (e) => {
        document.getElementById('volumeValue').textContent = Math.round(e.target.value * 100) + '%';
    });

    document.getElementById('playBtn').addEventListener('click', play);
    document.getElementById('pauseBtn').addEventListener('click', togglePause);
    document.getElementById('stopBtn').addEventListener('click', stop);

    loadVoices();
    synth.onvoiceschanged = loadVoices;
}

function loadVoices() {
    voices = synth.getVoices();
    const select = document.getElementById('voiceSelect');

    // Filter for Chinese voices
    const chineseVoices = voices.filter(v =>
        v.lang.includes('zh') || v.lang.includes('cmn')
    );

    if (chineseVoices.length === 0) {
        select.innerHTML = '<option value="">無可用中文語音</option>';
        return;
    }

    select.innerHTML = chineseVoices.map((v, i) => {
        const langLabel = v.lang.includes('TW') ? '繁體' :
                         v.lang.includes('CN') || v.lang.includes('Hans') ? '簡體' :
                         v.lang.includes('HK') ? '粵語' : '中文';
        return `<option value="${voices.indexOf(v)}">${v.name} (${langLabel})</option>`;
    }).join('');
}

function loadSample() {
    document.getElementById('inputText').value = `歡迎使用中文語音合成工具。

這是一個完全在本地運行的文字轉語音服務，您的資料不會上傳到任何伺服器。

您可以調整語速、音調和音量，來獲得最適合您的語音效果。

感謝您的使用！`;
    updateCharCount();
}

function updateCharCount() {
    const count = document.getElementById('inputText').value.length;
    document.getElementById('charCount').textContent = count;
}

function play() {
    const text = document.getElementById('inputText').value.trim();
    if (!text) return;

    if (isPaused) {
        synth.resume();
        isPaused = false;
        document.getElementById('pauseBtn').textContent = '暫停';
        return;
    }

    stop();

    utterance = new SpeechSynthesisUtterance(text);

    const voiceIndex = document.getElementById('voiceSelect').value;
    if (voiceIndex) {
        utterance.voice = voices[parseInt(voiceIndex)];
    }

    utterance.rate = parseFloat(document.getElementById('rate').value);
    utterance.pitch = parseFloat(document.getElementById('pitch').value);
    utterance.volume = parseFloat(document.getElementById('volume').value);

    utterance.onstart = () => {
        document.getElementById('playBtn').disabled = true;
        document.getElementById('pauseBtn').disabled = false;
        document.getElementById('stopBtn').disabled = false;
        document.getElementById('progressSection').style.display = 'block';
        document.getElementById('progressText').textContent = '播放中...';
    };

    utterance.onend = () => {
        resetControls();
        document.getElementById('progressFill').style.width = '100%';
        document.getElementById('progressText').textContent = '播放完成';
    };

    utterance.onerror = (e) => {
        resetControls();
        document.getElementById('progressText').textContent = '播放錯誤: ' + e.error;
    };

    utterance.onboundary = (e) => {
        const progress = (e.charIndex / text.length) * 100;
        document.getElementById('progressFill').style.width = progress + '%';
    };

    synth.speak(utterance);
}

function togglePause() {
    if (synth.paused) {
        synth.resume();
        isPaused = false;
        document.getElementById('pauseBtn').textContent = '暫停';
        document.getElementById('progressText').textContent = '播放中...';
    } else {
        synth.pause();
        isPaused = true;
        document.getElementById('pauseBtn').textContent = '繼續';
        document.getElementById('progressText').textContent = '已暫停';
    }
}

function stop() {
    synth.cancel();
    resetControls();
    document.getElementById('progressFill').style.width = '0%';
    isPaused = false;
}

function resetControls() {
    document.getElementById('playBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
    document.getElementById('stopBtn').disabled = true;
    document.getElementById('pauseBtn').textContent = '暫停';
}

init();
