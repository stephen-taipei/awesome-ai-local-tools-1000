/**
 * MIDI Generator - Tool #236
 * Generate and download MIDI files
 */

let currentLang = 'zh';
let audioContext = null;
let sequence = [];
let isPlaying = false;

const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const whiteKeys = [0, 2, 4, 5, 7, 9, 11];
const blackKeys = [1, 3, 6, 8, 10];

const texts = {
    zh: {
        title: 'MIDI 生成器',
        subtitle: '生成並下載 MIDI 檔案',
        privacy: '100% 本地處理 · 零資料上傳',
        instrument: '音色',
        piano: '鋼琴', guitar: '吉他', bass: '貝斯', violin: '小提琴', flute: '長笛',
        bpm: '速度 (BPM)',
        octave: '八度',
        duration: '音符長度',
        sixteenth: '十六分音符', eighth: '八分音符', quarter: '四分音符', half: '二分音符',
        sequence: '音符序列',
        clear: '清除',
        emptyHint: '點擊鋼琴鍵盤添加音符',
        preview: '▶️ 預覽',
        download: '⬇️ 下載 MIDI',
        noteCount: '音符數',
        estDuration: '預估時長'
    },
    en: {
        title: 'MIDI Generator',
        subtitle: 'Generate and download MIDI files',
        privacy: '100% Local Processing · No Data Upload',
        instrument: 'Instrument',
        piano: 'Piano', guitar: 'Guitar', bass: 'Bass', violin: 'Violin', flute: 'Flute',
        bpm: 'Tempo (BPM)',
        octave: 'Octave',
        duration: 'Note Length',
        sixteenth: '16th Note', eighth: '8th Note', quarter: 'Quarter', half: 'Half',
        sequence: 'Note Sequence',
        clear: 'Clear',
        emptyHint: 'Click piano keys to add notes',
        preview: '▶️ Preview',
        download: '⬇️ Download MIDI',
        noteCount: 'Notes',
        estDuration: 'Est. Duration'
    }
};

function init() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    createPiano();

    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));

    document.getElementById('bpmSlider').addEventListener('input', (e) => {
        document.getElementById('bpmValue').textContent = e.target.value;
        updateInfo();
    });

    document.getElementById('durationSelect').addEventListener('change', updateInfo);
    document.getElementById('clearBtn').addEventListener('click', clearSequence);
    document.getElementById('playBtn').addEventListener('click', playSequence);
    document.getElementById('downloadBtn').addEventListener('click', downloadMidi);
}

function createPiano() {
    const piano = document.getElementById('piano');
    piano.innerHTML = '';

    // Create white keys
    whiteKeys.forEach((noteIndex, i) => {
        const key = document.createElement('div');
        key.className = 'white-key';
        key.dataset.note = noteIndex;
        key.addEventListener('click', () => addNote(noteIndex));
        piano.appendChild(key);
    });

    // Create black keys
    const blackKeyPositions = [1, 2, 4, 5, 6]; // positions after white keys
    blackKeys.forEach((noteIndex, i) => {
        const key = document.createElement('div');
        key.className = 'black-key';
        key.dataset.note = noteIndex;
        key.style.left = (blackKeyPositions[i] * 40 - 12) + 'px';
        key.addEventListener('click', (e) => {
            e.stopPropagation();
            addNote(noteIndex);
        });
        piano.appendChild(key);
    });
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
    labels[0].textContent = t.instrument;
    labels[1].textContent = t.bpm;
    labels[2].textContent = t.octave;
    labels[3].textContent = t.duration;

    const instrumentSelect = document.getElementById('instrumentSelect');
    instrumentSelect.options[0].text = t.piano;
    instrumentSelect.options[1].text = t.guitar;
    instrumentSelect.options[2].text = t.bass;
    instrumentSelect.options[3].text = t.violin;
    instrumentSelect.options[4].text = t.flute;

    const durationSelect = document.getElementById('durationSelect');
    durationSelect.options[0].text = t.sixteenth;
    durationSelect.options[1].text = t.eighth;
    durationSelect.options[2].text = t.quarter;
    durationSelect.options[3].text = t.half;

    document.querySelector('.sequence-header label').textContent = t.sequence;
    document.getElementById('clearBtn').textContent = t.clear;

    if (sequence.length === 0) {
        document.querySelector('.empty-hint').textContent = t.emptyHint;
    }

    document.getElementById('playBtn').textContent = t.preview;
    document.getElementById('downloadBtn').textContent = t.download;

    document.querySelectorAll('.info-label')[0].textContent = t.noteCount;
    document.querySelectorAll('.info-label')[1].textContent = t.estDuration;
}

function addNote(noteIndex) {
    const octave = parseInt(document.getElementById('octaveSelect').value);
    const duration = parseFloat(document.getElementById('durationSelect').value);
    const midiNote = noteIndex + (octave + 1) * 12;

    sequence.push({
        note: midiNote,
        name: noteNames[noteIndex] + octave,
        duration: duration
    });

    playNoteSound(midiNote, duration);
    updateSequenceDisplay();
    updateInfo();
}

function playNoteSound(midiNote, duration) {
    audioContext.resume();
    const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
    const bpm = parseInt(document.getElementById('bpmSlider').value);
    const noteDuration = (duration * 60 / bpm);

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = 'triangle';
    osc.frequency.value = freq;

    const now = audioContext.currentTime;
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + noteDuration);

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.start(now);
    osc.stop(now + noteDuration + 0.1);
}

function updateSequenceDisplay() {
    const display = document.getElementById('sequenceDisplay');

    if (sequence.length === 0) {
        display.innerHTML = `<span class="empty-hint">${texts[currentLang].emptyHint}</span>`;
        return;
    }

    display.innerHTML = sequence.map((note, i) =>
        `<span class="note-chip" data-index="${i}">${note.name}</span>`
    ).join('');

    display.querySelectorAll('.note-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const index = parseInt(chip.dataset.index);
            sequence.splice(index, 1);
            updateSequenceDisplay();
            updateInfo();
        });
    });
}

function updateInfo() {
    const bpm = parseInt(document.getElementById('bpmSlider').value);
    const totalBeats = sequence.reduce((sum, note) => sum + note.duration, 0);
    const totalDuration = totalBeats * 60 / bpm;

    document.getElementById('noteCount').textContent = sequence.length;
    document.getElementById('duration').textContent = totalDuration.toFixed(1) + 's';
}

function clearSequence() {
    sequence = [];
    updateSequenceDisplay();
    updateInfo();
}

function playSequence() {
    if (isPlaying || sequence.length === 0) return;

    audioContext.resume();
    isPlaying = true;

    const bpm = parseInt(document.getElementById('bpmSlider').value);
    let currentTime = 0;

    sequence.forEach((note, i) => {
        const noteDuration = note.duration * 60 / bpm;
        setTimeout(() => {
            playNoteSound(note.note, note.duration);

            // Highlight note
            const chips = document.querySelectorAll('.note-chip');
            chips.forEach(c => c.classList.remove('playing'));
            if (chips[i]) chips[i].classList.add('playing');
        }, currentTime * 1000);

        currentTime += noteDuration;
    });

    setTimeout(() => {
        isPlaying = false;
        document.querySelectorAll('.note-chip').forEach(c => c.classList.remove('playing'));
    }, currentTime * 1000);
}

function downloadMidi() {
    if (sequence.length === 0) return;

    const bpm = parseInt(document.getElementById('bpmSlider').value);
    const instrument = parseInt(document.getElementById('instrumentSelect').value);

    // Create MIDI file
    const midi = createMidiFile(sequence, bpm, instrument);

    // Download
    const blob = new Blob([midi], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'melody.mid';
    a.click();
    URL.revokeObjectURL(url);
}

function createMidiFile(notes, bpm, instrument) {
    const ticksPerBeat = 480;

    // Helper functions
    function writeVariableLength(value) {
        const bytes = [];
        bytes.push(value & 0x7f);
        while (value >>= 7) {
            bytes.unshift((value & 0x7f) | 0x80);
        }
        return bytes;
    }

    function writeInt16(value) {
        return [(value >> 8) & 0xff, value & 0xff];
    }

    function writeInt32(value) {
        return [(value >> 24) & 0xff, (value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
    }

    // Build track data
    let trackData = [];

    // Tempo meta event
    const microsecondsPerBeat = Math.round(60000000 / bpm);
    trackData.push(0x00); // delta time
    trackData.push(0xff, 0x51, 0x03); // tempo meta event
    trackData.push((microsecondsPerBeat >> 16) & 0xff);
    trackData.push((microsecondsPerBeat >> 8) & 0xff);
    trackData.push(microsecondsPerBeat & 0xff);

    // Program change (instrument)
    trackData.push(0x00); // delta time
    trackData.push(0xc0, instrument); // program change channel 0

    // Notes
    let currentTick = 0;
    notes.forEach(note => {
        const noteTicks = Math.round(note.duration * ticksPerBeat);
        const velocity = 80;

        // Note on
        trackData.push(...writeVariableLength(0));
        trackData.push(0x90, note.note, velocity);

        // Note off
        trackData.push(...writeVariableLength(noteTicks));
        trackData.push(0x80, note.note, 0);
    });

    // End of track
    trackData.push(0x00);
    trackData.push(0xff, 0x2f, 0x00);

    // Build complete MIDI file
    const header = [
        0x4d, 0x54, 0x68, 0x64, // "MThd"
        0x00, 0x00, 0x00, 0x06, // header length
        0x00, 0x00, // format 0
        0x00, 0x01, // 1 track
        ...writeInt16(ticksPerBeat)
    ];

    const trackHeader = [
        0x4d, 0x54, 0x72, 0x6b, // "MTrk"
        ...writeInt32(trackData.length)
    ];

    return new Uint8Array([...header, ...trackHeader, ...trackData]);
}

init();
