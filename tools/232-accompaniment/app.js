/**
 * Accompaniment Generator - Tool #232
 * AI-powered accompaniment generation
 */

let currentLang = 'zh';
let audioContext = null;
let tracks = [];
let isPlaying = false;
let playbackTimeouts = [];

const chordProgressions = {
    C: ['C', 'Am', 'F', 'G', 'C', 'G', 'Am', 'F'],
    G: ['G', 'Em', 'C', 'D', 'G', 'D', 'Em', 'C'],
    D: ['D', 'Bm', 'G', 'A', 'D', 'A', 'Bm', 'G'],
    F: ['F', 'Dm', 'Bb', 'C', 'F', 'C', 'Dm', 'Bb'],
    Am: ['Am', 'F', 'C', 'G', 'Am', 'G', 'F', 'E'],
    Em: ['Em', 'C', 'G', 'D', 'Em', 'D', 'C', 'B']
};

const chordNotes = {
    'C': [60, 64, 67], 'Dm': [62, 65, 69], 'Em': [64, 67, 71], 'F': [65, 69, 72],
    'G': [67, 71, 74], 'Am': [69, 72, 76], 'Bm': [71, 74, 78], 'D': [62, 66, 69],
    'A': [69, 73, 76], 'E': [64, 68, 71], 'B': [71, 75, 78], 'Bb': [70, 74, 77]
};

const stylePatterns = {
    piano: { octave: 0, attack: 0.02, decay: 0.3, wave: 'triangle', pattern: 'arpeggio' },
    guitar: { octave: -1, attack: 0.01, decay: 0.5, wave: 'sawtooth', pattern: 'strum' },
    orchestra: { octave: 0, attack: 0.1, decay: 0.8, wave: 'sine', pattern: 'sustained' },
    electronic: { octave: 0, attack: 0.01, decay: 0.2, wave: 'square', pattern: 'pulse' },
    band: { octave: -1, attack: 0.02, decay: 0.4, wave: 'triangle', pattern: 'groove' }
};

const texts = {
    zh: {
        title: '伴奏生成',
        subtitle: 'AI 自動生成音樂伴奏',
        privacy: '100% 本地處理 · 零資料上傳',
        style: '伴奏風格',
        piano: '鋼琴', guitar: '吉他', orchestra: '管弦樂', electronic: '電子', band: '樂團',
        key: '調性',
        major: '大調', minor: '小調',
        bpm: '速度 (BPM)',
        bars: '小節數',
        barsUnit: '小節',
        chords: '和弦進行',
        shuffle: '🔀 隨機和弦',
        generate: '生成伴奏',
        play: '▶️ 播放',
        stop: '⏹️ 停止',
        regenerate: '🔄 重新生成',
        trackCount: '音軌數',
        duration: '時長'
    },
    en: {
        title: 'Accompaniment Generator',
        subtitle: 'AI-powered accompaniment generation',
        privacy: '100% Local Processing · No Data Upload',
        style: 'Style',
        piano: 'Piano', guitar: 'Guitar', orchestra: 'Orchestra', electronic: 'Electronic', band: 'Band',
        key: 'Key',
        major: 'Major', minor: 'Minor',
        bpm: 'Tempo (BPM)',
        bars: 'Bars',
        barsUnit: ' bars',
        chords: 'Chord Progression',
        shuffle: '🔀 Shuffle',
        generate: 'Generate',
        play: '▶️ Play',
        stop: '⏹️ Stop',
        regenerate: '🔄 Regenerate',
        trackCount: 'Tracks',
        duration: 'Duration'
    }
};

let currentChords = ['C', 'Am', 'F', 'G'];

function init() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));

    document.getElementById('bpmSlider').addEventListener('input', (e) => {
        document.getElementById('bpmValue').textContent = e.target.value;
    });

    document.getElementById('keySelect').addEventListener('change', updateChordDisplay);
    document.getElementById('shuffleBtn').addEventListener('click', shuffleChords);
    document.getElementById('generateBtn').addEventListener('click', generateAccompaniment);
    document.getElementById('playBtn').addEventListener('click', playTracks);
    document.getElementById('stopBtn').addEventListener('click', stopPlayback);
    document.getElementById('regenerateBtn').addEventListener('click', generateAccompaniment);

    updateChordDisplay();
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

    document.querySelector('.chord-section label').textContent = t.chords;
    document.getElementById('shuffleBtn').textContent = t.shuffle;

    const styleSelect = document.getElementById('styleSelect');
    styleSelect.options[0].text = t.piano;
    styleSelect.options[1].text = t.guitar;
    styleSelect.options[2].text = t.orchestra;
    styleSelect.options[3].text = t.electronic;
    styleSelect.options[4].text = t.band;

    document.getElementById('generateBtn').textContent = t.generate;
    document.getElementById('playBtn').textContent = t.play;
    document.getElementById('stopBtn').textContent = t.stop;
    document.getElementById('regenerateBtn').textContent = t.regenerate;

    document.querySelectorAll('.info-label')[0].textContent = t.trackCount;
    document.querySelectorAll('.info-label')[1].textContent = t.duration;
}

function updateChordDisplay() {
    const key = document.getElementById('keySelect').value;
    const bars = parseInt(document.getElementById('barsSelect').value);
    currentChords = chordProgressions[key].slice(0, bars);

    const display = document.getElementById('chordDisplay');
    display.innerHTML = currentChords.map(c => `<span class="chord">${c}</span>`).join('');
}

function shuffleChords() {
    const key = document.getElementById('keySelect').value;
    const bars = parseInt(document.getElementById('barsSelect').value);
    const available = chordProgressions[key];

    currentChords = [];
    for (let i = 0; i < bars; i++) {
        currentChords.push(available[Math.floor(Math.random() * available.length)]);
    }

    const display = document.getElementById('chordDisplay');
    display.innerHTML = currentChords.map(c => `<span class="chord">${c}</span>`).join('');
}

function generateAccompaniment() {
    const style = document.getElementById('styleSelect').value;
    const bpm = parseInt(document.getElementById('bpmSlider').value);
    const bars = parseInt(document.getElementById('barsSelect').value);

    const pattern = stylePatterns[style];
    const beatsPerBar = 4;
    const beatDuration = 60 / bpm;

    tracks = [];

    // Bass track
    const bassTrack = { name: 'Bass', notes: [] };
    currentChords.forEach((chord, barIndex) => {
        const notes = chordNotes[chord] || chordNotes['C'];
        const bassNote = notes[0] - 24;
        for (let beat = 0; beat < beatsPerBar; beat++) {
            if (beat === 0 || beat === 2) {
                bassTrack.notes.push({
                    note: bassNote,
                    start: (barIndex * beatsPerBar + beat) * beatDuration,
                    duration: beatDuration * 1.5,
                    velocity: 0.6
                });
            }
        }
    });
    tracks.push(bassTrack);

    // Chord track
    const chordTrack = { name: 'Chords', notes: [] };
    currentChords.forEach((chord, barIndex) => {
        const notes = chordNotes[chord] || chordNotes['C'];

        if (pattern.pattern === 'arpeggio') {
            notes.forEach((note, i) => {
                chordTrack.notes.push({
                    note: note + pattern.octave * 12,
                    start: (barIndex * beatsPerBar + i * 0.5) * beatDuration,
                    duration: beatDuration * 0.4,
                    velocity: 0.4
                });
            });
        } else if (pattern.pattern === 'strum') {
            notes.forEach((note, i) => {
                chordTrack.notes.push({
                    note: note + pattern.octave * 12,
                    start: (barIndex * beatsPerBar) * beatDuration + i * 0.02,
                    duration: beatDuration * 3,
                    velocity: 0.5
                });
            });
        } else if (pattern.pattern === 'sustained') {
            notes.forEach(note => {
                chordTrack.notes.push({
                    note: note + pattern.octave * 12,
                    start: barIndex * beatsPerBar * beatDuration,
                    duration: beatsPerBar * beatDuration * 0.9,
                    velocity: 0.35
                });
            });
        } else if (pattern.pattern === 'pulse') {
            for (let beat = 0; beat < beatsPerBar; beat++) {
                notes.forEach(note => {
                    chordTrack.notes.push({
                        note: note + pattern.octave * 12,
                        start: (barIndex * beatsPerBar + beat) * beatDuration,
                        duration: beatDuration * 0.3,
                        velocity: beat % 2 === 0 ? 0.5 : 0.3
                    });
                });
            }
        } else {
            for (let beat = 0; beat < beatsPerBar; beat += 2) {
                notes.forEach(note => {
                    chordTrack.notes.push({
                        note: note + pattern.octave * 12,
                        start: (barIndex * beatsPerBar + beat + 0.5) * beatDuration,
                        duration: beatDuration * 1.2,
                        velocity: 0.4
                    });
                });
            }
        }
    });
    tracks.push(chordTrack);

    displayTracks(bpm, bars);
    document.getElementById('resultSection').style.display = 'block';
}

function displayTracks(bpm, bars) {
    const trackDisplay = document.getElementById('trackDisplay');
    const beatDuration = 60 / bpm;
    const totalDuration = bars * 4 * beatDuration;

    let html = '';
    tracks.forEach((track, idx) => {
        html += `<div class="track">
            <div class="track-header">${track.name}</div>
            <div class="track-notes" id="track-${idx}"></div>
        </div>`;
    });
    trackDisplay.innerHTML = html;

    tracks.forEach((track, idx) => {
        const container = document.getElementById(`track-${idx}`);
        track.notes.forEach(note => {
            const div = document.createElement('div');
            div.className = 'track-note';
            div.style.left = (note.start / totalDuration * 100) + '%';
            div.style.width = Math.max(2, note.duration / totalDuration * 100) + '%';
            container.appendChild(div);
        });
    });

    document.getElementById('trackCount').textContent = tracks.length;
    document.getElementById('duration').textContent = totalDuration.toFixed(1) + 's';
}

function playTracks() {
    if (isPlaying || tracks.length === 0) return;

    audioContext.resume();
    isPlaying = true;

    const style = document.getElementById('styleSelect').value;
    const pattern = stylePatterns[style];

    tracks.forEach(track => {
        track.notes.forEach(note => {
            const timeout = setTimeout(() => {
                playNote(note.note, pattern, note.duration, note.velocity);
            }, note.start * 1000);
            playbackTimeouts.push(timeout);
        });
    });

    const bpm = parseInt(document.getElementById('bpmSlider').value);
    const bars = parseInt(document.getElementById('barsSelect').value);
    const totalDuration = bars * 4 * (60 / bpm);

    const endTimeout = setTimeout(() => {
        isPlaying = false;
    }, totalDuration * 1000);
    playbackTimeouts.push(endTimeout);
}

function playNote(midiNote, pattern, duration, velocity) {
    const freq = 440 * Math.pow(2, (midiNote - 69) / 12);

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = pattern.wave;
    osc.frequency.value = freq;

    const now = audioContext.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(velocity * 0.25, now + pattern.attack);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.start(now);
    osc.stop(now + duration + 0.1);
}

function stopPlayback() {
    isPlaying = false;
    playbackTimeouts.forEach(t => clearTimeout(t));
    playbackTimeouts = [];
}

init();
