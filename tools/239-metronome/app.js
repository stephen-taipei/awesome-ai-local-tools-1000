/**
 * Metronome - Tool #239
 * Digital metronome for musicians
 */

let currentLang = 'zh';
let audioContext = null;
let isPlaying = false;
let intervalId = null;
let currentBeat = 0;
let tapTimes = [];

const tempoNames = {
    zh: [
        { min: 20, max: 40, name: 'Grave (極緩板)' },
        { min: 40, max: 60, name: 'Largo (廣板)' },
        { min: 60, max: 66, name: 'Larghetto (小廣板)' },
        { min: 66, max: 76, name: 'Adagio (柔板)' },
        { min: 76, max: 108, name: 'Andante (行板)' },
        { min: 108, max: 120, name: 'Moderato (中板)' },
        { min: 120, max: 168, name: 'Allegro (快板)' },
        { min: 168, max: 200, name: 'Presto (急板)' },
        { min: 200, max: 280, name: 'Prestissimo (最急板)' }
    ],
    en: [
        { min: 20, max: 40, name: 'Grave' },
        { min: 40, max: 60, name: 'Largo' },
        { min: 60, max: 66, name: 'Larghetto' },
        { min: 66, max: 76, name: 'Adagio' },
        { min: 76, max: 108, name: 'Andante' },
        { min: 108, max: 120, name: 'Moderato' },
        { min: 120, max: 168, name: 'Allegro' },
        { min: 168, max: 200, name: 'Presto' },
        { min: 200, max: 280, name: 'Prestissimo' }
    ]
};

const texts = {
    zh: {
        title: '節拍器',
        subtitle: '精準數位節拍器',
        privacy: '100% 本地處理 · 零資料上傳',
        timeSignature: '拍號',
        sound: '音色',
        click: '點擊', beep: '嗶聲', wood: '木塊', drum: '鼓聲',
        volume: '音量',
        start: '▶️ 開始',
        stop: '⏹️ 停止',
        tap: '👆 點擊測速',
        tapHint: '連續點擊以測量速度'
    },
    en: {
        title: 'Metronome',
        subtitle: 'Precise digital metronome',
        privacy: '100% Local Processing · No Data Upload',
        timeSignature: 'Time Signature',
        sound: 'Sound',
        click: 'Click', beep: 'Beep', wood: 'Wood', drum: 'Drum',
        volume: 'Volume',
        start: '▶️ Start',
        stop: '⏹️ Stop',
        tap: '👆 Tap Tempo',
        tapHint: 'Tap repeatedly to set tempo'
    }
};

function init() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));

    document.getElementById('bpmSlider').addEventListener('input', updateBpm);
    document.getElementById('decreaseBtn').addEventListener('click', () => adjustBpm(-1));
    document.getElementById('increaseBtn').addEventListener('click', () => adjustBpm(1));

    document.getElementById('timeSignature').addEventListener('change', updateBeatIndicator);
    document.getElementById('playBtn').addEventListener('click', togglePlay);
    document.getElementById('tapBtn').addEventListener('click', handleTap);

    updateBeatIndicator();
    updateTempoName();
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');

    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;

    const labels = document.querySelectorAll('.control-group label');
    labels[0].textContent = t.timeSignature;
    labels[1].textContent = t.sound;
    labels[2].textContent = t.volume;

    const soundSelect = document.getElementById('soundSelect');
    soundSelect.options[0].text = t.click;
    soundSelect.options[1].text = t.beep;
    soundSelect.options[2].text = t.wood;
    soundSelect.options[3].text = t.drum;

    document.getElementById('playBtn').textContent = isPlaying ? t.stop : t.start;
    document.getElementById('tapBtn').textContent = t.tap;

    updateTempoName();
}

function updateBpm() {
    const bpm = document.getElementById('bpmSlider').value;
    document.getElementById('bpmNumber').textContent = bpm;
    updateTempoName();

    if (isPlaying) {
        stopMetronome();
        startMetronome();
    }
}

function adjustBpm(delta) {
    const slider = document.getElementById('bpmSlider');
    const newValue = Math.max(20, Math.min(280, parseInt(slider.value) + delta));
    slider.value = newValue;
    updateBpm();
}

function updateTempoName() {
    const bpm = parseInt(document.getElementById('bpmSlider').value);
    const tempos = tempoNames[currentLang];

    for (const tempo of tempos) {
        if (bpm >= tempo.min && bpm < tempo.max) {
            document.getElementById('tempoName').textContent = tempo.name;
            break;
        }
    }
}

function updateBeatIndicator() {
    const beats = parseInt(document.getElementById('timeSignature').value);
    const indicator = document.getElementById('beatIndicator');

    indicator.innerHTML = '';
    for (let i = 0; i < beats; i++) {
        const dot = document.createElement('span');
        dot.className = 'beat-dot' + (i === 0 ? ' active' : '');
        indicator.appendChild(dot);
    }

    currentBeat = 0;
}

function togglePlay() {
    if (isPlaying) {
        stopMetronome();
    } else {
        startMetronome();
    }
}

function startMetronome() {
    audioContext.resume();
    isPlaying = true;
    currentBeat = 0;

    const t = texts[currentLang];
    document.getElementById('playBtn').textContent = t.stop;
    document.getElementById('playBtn').classList.add('playing');

    tick();
    scheduleTicks();
}

function stopMetronome() {
    isPlaying = false;

    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }

    const t = texts[currentLang];
    document.getElementById('playBtn').textContent = t.start;
    document.getElementById('playBtn').classList.remove('playing');

    // Reset beat indicator
    document.querySelectorAll('.beat-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === 0);
    });
}

function scheduleTicks() {
    const bpm = parseInt(document.getElementById('bpmSlider').value);
    const interval = 60000 / bpm;

    intervalId = setInterval(tick, interval);
}

function tick() {
    const beats = parseInt(document.getElementById('timeSignature').value);
    const isAccent = currentBeat === 0;

    playClick(isAccent);
    updateBeatDisplay();

    currentBeat = (currentBeat + 1) % beats;
}

function updateBeatDisplay() {
    const dots = document.querySelectorAll('.beat-dot');
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentBeat);
    });
}

function playClick(isAccent) {
    const sound = document.getElementById('soundSelect').value;
    const volume = parseInt(document.getElementById('volumeSlider').value) / 100;

    const now = audioContext.currentTime;

    switch (sound) {
        case 'click':
            playClickSound(isAccent, volume, now);
            break;
        case 'beep':
            playBeepSound(isAccent, volume, now);
            break;
        case 'wood':
            playWoodSound(isAccent, volume, now);
            break;
        case 'drum':
            playDrumSound(isAccent, volume, now);
            break;
    }
}

function playClickSound(isAccent, volume, time) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.value = isAccent ? 1000 : 800;

    gain.gain.setValueAtTime(volume * 0.5, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.start(time);
    osc.stop(time + 0.05);
}

function playBeepSound(isAccent, volume, time) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = 'square';
    osc.frequency.value = isAccent ? 880 : 660;

    gain.gain.setValueAtTime(volume * 0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.08);

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.start(time);
    osc.stop(time + 0.08);
}

function playWoodSound(isAccent, volume, time) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(isAccent ? 1200 : 900, time);
    osc.frequency.exponentialRampToValueAtTime(400, time + 0.02);

    gain.gain.setValueAtTime(volume * 0.6, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.04);

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.start(time);
    osc.stop(time + 0.05);
}

function playDrumSound(isAccent, volume, time) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(isAccent ? 200 : 150, time);
    osc.frequency.exponentialRampToValueAtTime(50, time + 0.1);

    gain.gain.setValueAtTime(volume * 0.8, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.start(time);
    osc.stop(time + 0.15);
}

function handleTap() {
    const now = Date.now();

    // Clear old taps (older than 2 seconds)
    tapTimes = tapTimes.filter(t => now - t < 2000);
    tapTimes.push(now);

    if (tapTimes.length >= 2) {
        // Calculate average interval
        let totalInterval = 0;
        for (let i = 1; i < tapTimes.length; i++) {
            totalInterval += tapTimes[i] - tapTimes[i - 1];
        }
        const avgInterval = totalInterval / (tapTimes.length - 1);
        const bpm = Math.round(60000 / avgInterval);

        if (bpm >= 20 && bpm <= 280) {
            document.getElementById('bpmSlider').value = bpm;
            updateBpm();
        }

        document.getElementById('tapInfo').textContent = `${tapTimes.length} taps → ${bpm} BPM`;
    } else {
        document.getElementById('tapInfo').textContent = texts[currentLang].tapHint;
    }

    // Visual feedback
    const tapBtn = document.getElementById('tapBtn');
    tapBtn.classList.add('tapped');
    setTimeout(() => tapBtn.classList.remove('tapped'), 100);
}

init();
