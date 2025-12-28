/**
 * AI Composer - Tool #231
 * AI-powered music composition
 */

let currentLang = 'zh';
let audioContext = null;
let melody = [];
let isPlaying = false;
let playbackTimeout = null;

const scales = {
    C: [60, 62, 64, 65, 67, 69, 71, 72],
    G: [55, 57, 59, 60, 62, 64, 66, 67],
    D: [50, 52, 54, 55, 57, 59, 61, 62],
    Am: [57, 59, 60, 62, 64, 65, 67, 69],
    Em: [52, 54, 55, 57, 59, 60, 62, 64]
};

const stylePatterns = {
    pop: { stepProb: 0.7, restProb: 0.1, rhythms: [0.5, 0.5, 1, 0.25] },
    classical: { stepProb: 0.6, restProb: 0.05, rhythms: [1, 0.5, 0.5, 2] },
    jazz: { stepProb: 0.5, restProb: 0.15, rhythms: [0.75, 0.25, 0.5, 1] },
    electronic: { stepProb: 0.4, restProb: 0.2, rhythms: [0.25, 0.25, 0.5, 0.25] },
    folk: { stepProb: 0.65, restProb: 0.1, rhythms: [1, 1, 0.5, 0.5] }
};

const texts = {
    zh: {
        title: 'AI 作曲',
        subtitle: 'AI 自動生成音樂旋律',
        privacy: '100% 本地處理 · 零資料上傳',
        style: '音樂風格',
        pop: '流行', classical: '古典', jazz: '爵士', electronic: '電子', folk: '民謠',
        key: '調性',
        major: '大調', minor: '小調',
        bpm: '速度 (BPM)',
        bars: '小節數',
        barsUnit: '小節',
        generate: '生成旋律',
        play: '▶️ 播放',
        stop: '⏹️ 停止',
        regenerate: '🔄 重新生成',
        noteCount: '音符數',
        duration: '時長'
    },
    en: {
        title: 'AI Composer',
        subtitle: 'AI-powered music composition',
        privacy: '100% Local Processing · No Data Upload',
        style: 'Music Style',
        pop: 'Pop', classical: 'Classical', jazz: 'Jazz', electronic: 'Electronic', folk: 'Folk',
        key: 'Key',
        major: 'Major', minor: 'Minor',
        bpm: 'Tempo (BPM)',
        bars: 'Bars',
        barsUnit: ' bars',
        generate: 'Generate Melody',
        play: '▶️ Play',
        stop: '⏹️ Stop',
        regenerate: '🔄 Regenerate',
        noteCount: 'Notes',
        duration: 'Duration'
    }
};

function init() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));

    document.getElementById('bpmSlider').addEventListener('input', (e) => {
        document.getElementById('bpmValue').textContent = e.target.value;
    });

    document.getElementById('generateBtn').addEventListener('click', generateMelody);
    document.getElementById('playBtn').addEventListener('click', playMelody);
    document.getElementById('stopBtn').addEventListener('click', stopPlayback);
    document.getElementById('regenerateBtn').addEventListener('click', generateMelody);
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
    labels[0].textContent = t.style;
    labels[1].textContent = t.key;
    labels[2].textContent = t.bpm;
    labels[3].textContent = t.bars;

    const styleSelect = document.getElementById('styleSelect');
    styleSelect.options[0].text = t.pop;
    styleSelect.options[1].text = t.classical;
    styleSelect.options[2].text = t.jazz;
    styleSelect.options[3].text = t.electronic;
    styleSelect.options[4].text = t.folk;

    document.getElementById('generateBtn').textContent = t.generate;
    document.getElementById('playBtn').textContent = t.play;
    document.getElementById('stopBtn').textContent = t.stop;
    document.getElementById('regenerateBtn').textContent = t.regenerate;

    document.querySelectorAll('.info-label')[0].textContent = t.noteCount;
    document.querySelectorAll('.info-label')[1].textContent = t.duration;
}

function generateMelody() {
    const style = document.getElementById('styleSelect').value;
    const key = document.getElementById('keySelect').value;
    const bpm = parseInt(document.getElementById('bpmSlider').value);
    const bars = parseInt(document.getElementById('barsSelect').value);

    const scale = scales[key];
    const pattern = stylePatterns[style];
    const beatsPerBar = 4;
    const totalBeats = bars * beatsPerBar;

    melody = [];
    let currentBeat = 0;
    let prevNoteIndex = Math.floor(scale.length / 2);

    while (currentBeat < totalBeats) {
        const rhythm = pattern.rhythms[Math.floor(Math.random() * pattern.rhythms.length)];

        if (Math.random() > pattern.restProb) {
            let noteIndex;
            if (Math.random() < pattern.stepProb) {
                const step = Math.random() < 0.5 ? -1 : 1;
                noteIndex = Math.max(0, Math.min(scale.length - 1, prevNoteIndex + step));
            } else {
                noteIndex = Math.floor(Math.random() * scale.length);
            }

            melody.push({
                note: scale[noteIndex],
                start: currentBeat,
                duration: rhythm,
                velocity: 0.5 + Math.random() * 0.3
            });

            prevNoteIndex = noteIndex;
        }

        currentBeat += rhythm;
    }

    displayMelody(bpm);
    document.getElementById('resultSection').style.display = 'block';
}

function displayMelody(bpm) {
    const pianoRoll = document.getElementById('pianoRoll');
    const beatDuration = 60 / bpm;
    const totalDuration = melody.length > 0 ?
        Math.max(...melody.map(n => (n.start + n.duration) * beatDuration)) : 0;

    const minNote = Math.min(...melody.map(n => n.note));
    const maxNote = Math.max(...melody.map(n => n.note));
    const noteRange = maxNote - minNote + 1;

    pianoRoll.innerHTML = '';

    const gridWidth = 100;
    const noteHeight = 100 / Math.max(noteRange, 8);

    melody.forEach(note => {
        const div = document.createElement('div');
        div.className = 'note-block';
        div.style.left = (note.start / (melody[melody.length-1].start + melody[melody.length-1].duration) * gridWidth) + '%';
        div.style.width = (note.duration / (melody[melody.length-1].start + melody[melody.length-1].duration) * gridWidth) + '%';
        div.style.bottom = ((note.note - minNote) / noteRange * 80 + 10) + '%';
        div.style.height = noteHeight + '%';
        div.style.opacity = note.velocity;
        pianoRoll.appendChild(div);
    });

    document.getElementById('noteCount').textContent = melody.length;
    document.getElementById('duration').textContent = totalDuration.toFixed(1) + 's';
}

function playMelody() {
    if (isPlaying || melody.length === 0) return;

    audioContext.resume();
    isPlaying = true;
    const bpm = parseInt(document.getElementById('bpmSlider').value);
    const beatDuration = 60 / bpm;

    melody.forEach(note => {
        const startTime = audioContext.currentTime + note.start * beatDuration;
        const duration = note.duration * beatDuration;
        playNote(note.note, startTime, duration, note.velocity);
    });

    const totalDuration = Math.max(...melody.map(n => (n.start + n.duration))) * beatDuration;
    playbackTimeout = setTimeout(() => {
        isPlaying = false;
    }, totalDuration * 1000);
}

function playNote(midiNote, startTime, duration, velocity) {
    const freq = 440 * Math.pow(2, (midiNote - 69) / 12);

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = 'triangle';
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(velocity * 0.3, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.1);
}

function stopPlayback() {
    isPlaying = false;
    if (playbackTimeout) {
        clearTimeout(playbackTimeout);
        playbackTimeout = null;
    }
}

init();
