/**
 * Audio Metronome - Tool #300
 * Digital metronome for practice
 */

let currentLang = 'zh';
let audioContext = null;
let isPlaying = false;
let intervalId = null;
let currentBeat = 0;

const texts = {
    zh: {
        title: '節拍器',
        subtitle: '數位節拍器練習工具',
        privacy: '100% 本地處理 · 零資料上傳',
        tempo: '速度',
        beats: '拍號',
        volume: '音量',
        accent: '重音',
        on: '開啟',
        off: '關閉',
        start: '▶️ 開始',
        stop: '⏹️ 停止'
    },
    en: {
        title: 'Metronome',
        subtitle: 'Digital metronome for practice',
        privacy: '100% Local Processing · No Data Upload',
        tempo: 'Tempo',
        beats: 'Time Sig',
        volume: 'Volume',
        accent: 'Accent',
        on: 'On',
        off: 'Off',
        start: '▶️ Start',
        stop: '⏹️ Stop'
    }
};

function init() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));

    document.getElementById('tempoSlider').addEventListener('input', (e) => {
        document.getElementById('tempoValue').textContent = e.target.value;
        updateTempoPresets(parseInt(e.target.value));
        if (isPlaying) {
            restartMetronome();
        }
    });

    document.getElementById('volumeSlider').addEventListener('input', (e) => {
        document.getElementById('volumeValue').textContent = e.target.value + '%';
    });

    document.getElementById('beatsSelect').addEventListener('change', () => {
        updateBeatIndicator();
        if (isPlaying) {
            currentBeat = 0;
        }
    });

    document.querySelectorAll('.tempo-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tempo = parseInt(btn.dataset.tempo);
            document.getElementById('tempoSlider').value = tempo;
            document.getElementById('tempoValue').textContent = tempo;
            updateTempoPresets(tempo);
            if (isPlaying) {
                restartMetronome();
            }
        });
    });

    document.getElementById('playBtn').addEventListener('click', togglePlay);

    updateBeatIndicator();
}

function updateTempoPresets(tempo) {
    document.querySelectorAll('.tempo-btn').forEach(btn => {
        const btnTempo = parseInt(btn.dataset.tempo);
        btn.classList.toggle('active', Math.abs(btnTempo - tempo) < 10);
    });
}

function updateBeatIndicator() {
    const beats = parseInt(document.getElementById('beatsSelect').value);
    const indicator = document.querySelector('.beat-indicator');
    indicator.innerHTML = '';

    for (let i = 1; i <= beats; i++) {
        const dot = document.createElement('span');
        dot.className = 'beat-dot' + (i === 1 ? ' active' : '');
        dot.dataset.beat = i;
        indicator.appendChild(dot);
    }
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');

    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;

    const labels = document.querySelectorAll('.option-group label');
    labels[0].textContent = t.tempo;
    labels[1].textContent = t.beats;
    labels[2].textContent = t.volume;
    labels[3].textContent = t.accent;

    const accentSelect = document.getElementById('accentSelect');
    accentSelect.options[0].textContent = t.on;
    accentSelect.options[1].textContent = t.off;

    document.getElementById('playBtn').textContent = isPlaying ? t.stop : t.start;
}

function playClick(isAccent) {
    const volume = parseInt(document.getElementById('volumeSlider').value) / 100;
    const frequency = isAccent ? 1000 : 800;
    const duration = 0.05;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;

    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

function tick() {
    const beats = parseInt(document.getElementById('beatsSelect').value);
    const useAccent = document.getElementById('accentSelect').value === 'yes';

    currentBeat = (currentBeat % beats) + 1;
    const isAccent = useAccent && currentBeat === 1;

    playClick(isAccent);

    // Update visual indicator
    document.querySelectorAll('.beat-dot').forEach((dot, i) => {
        dot.classList.remove('current');
        if (i + 1 === currentBeat) {
            dot.classList.add('current');
        }
    });
}

function startMetronome() {
    const tempo = parseInt(document.getElementById('tempoSlider').value);
    const interval = 60000 / tempo;

    currentBeat = 0;
    tick(); // Play first beat immediately

    intervalId = setInterval(tick, interval);
}

function stopMetronome() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }

    // Reset visual indicator
    document.querySelectorAll('.beat-dot').forEach((dot, i) => {
        dot.classList.remove('current');
        dot.classList.toggle('active', i === 0);
    });
}

function restartMetronome() {
    stopMetronome();
    startMetronome();
}

function togglePlay() {
    if (isPlaying) {
        stopMetronome();
        isPlaying = false;
        document.getElementById('playBtn').textContent = texts[currentLang].start;
    } else {
        audioContext.resume().then(() => {
            startMetronome();
            isPlaying = true;
            document.getElementById('playBtn').textContent = texts[currentLang].stop;
        });
    }
}

init();
