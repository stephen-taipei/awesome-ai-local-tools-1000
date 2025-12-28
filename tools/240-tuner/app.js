/**
 * Tuner - Tool #240
 * Chromatic tuner for musicians
 */

let currentLang = 'zh';
let audioContext = null;
let analyser = null;
let isListening = false;
let animationId = null;
let a4Frequency = 440;

const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const noteFrequencies = {};

const instrumentPresets = {
    chromatic: null,
    guitar: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
    bass: ['E1', 'A1', 'D2', 'G2'],
    ukulele: ['G4', 'C4', 'E4', 'A4'],
    violin: ['G3', 'D4', 'A4', 'E5']
};

const texts = {
    zh: {
        title: '調音器',
        subtitle: '精準半音階調音器',
        privacy: '100% 本地處理 · 零資料上傳',
        a4: 'A4 標準音高',
        instrument: '樂器預設',
        chromatic: '半音階', guitar: '吉他', bass: '貝斯', ukulele: '烏克麗麗', violin: '小提琴',
        start: '🎤 開始調音',
        stop: '⏹️ 停止',
        reference: '參考音',
        waiting: '等待輸入...',
        flat: '偏低',
        sharp: '偏高',
        inTune: '準確！'
    },
    en: {
        title: 'Tuner',
        subtitle: 'Chromatic tuner for musicians',
        privacy: '100% Local Processing · No Data Upload',
        a4: 'A4 Reference',
        instrument: 'Instrument',
        chromatic: 'Chromatic', guitar: 'Guitar', bass: 'Bass', ukulele: 'Ukulele', violin: 'Violin',
        start: '🎤 Start Tuning',
        stop: '⏹️ Stop',
        reference: 'Reference Tones',
        waiting: 'Waiting...',
        flat: 'Flat',
        sharp: 'Sharp',
        inTune: 'In Tune!'
    }
};

function init() {
    calculateNoteFrequencies();

    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));

    document.getElementById('a4Decrease').addEventListener('click', () => adjustA4(-1));
    document.getElementById('a4Increase').addEventListener('click', () => adjustA4(1));

    document.getElementById('instrumentSelect').addEventListener('change', updateReferenceNotes);
    document.getElementById('startBtn').addEventListener('click', toggleListening);

    document.getElementById('referenceNotes').addEventListener('click', (e) => {
        if (e.target.classList.contains('ref-btn')) {
            playReferenceNote(e.target.dataset.note);
        }
    });

    updateReferenceNotes();
}

function calculateNoteFrequencies() {
    // A4 = 440Hz, calculate all notes
    for (let octave = 0; octave <= 8; octave++) {
        for (let i = 0; i < 12; i++) {
            const noteName = noteNames[i] + octave;
            const semitonesFromA4 = (octave - 4) * 12 + (i - 9);
            noteFrequencies[noteName] = a4Frequency * Math.pow(2, semitonesFromA4 / 12);
        }
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

    const labels = document.querySelectorAll('.control-group label');
    labels[0].textContent = t.a4;
    labels[1].textContent = t.instrument;

    const instrumentSelect = document.getElementById('instrumentSelect');
    instrumentSelect.options[0].text = t.chromatic;
    instrumentSelect.options[1].text = t.guitar;
    instrumentSelect.options[2].text = t.bass;
    instrumentSelect.options[3].text = t.ukulele;
    instrumentSelect.options[4].text = t.violin;

    document.getElementById('startBtn').textContent = isListening ? t.stop : t.start;
    document.querySelector('.reference-section label').textContent = t.reference;

    if (!isListening) {
        document.querySelector('.status-text').textContent = t.waiting;
    }
}

function adjustA4(delta) {
    a4Frequency = Math.max(420, Math.min(460, a4Frequency + delta));
    document.getElementById('a4Value').textContent = a4Frequency;
    calculateNoteFrequencies();
}

function updateReferenceNotes() {
    const instrument = document.getElementById('instrumentSelect').value;
    const preset = instrumentPresets[instrument];
    const container = document.getElementById('referenceNotes');

    if (preset) {
        container.innerHTML = preset.map(note =>
            `<button class="ref-btn" data-note="${note}">${note}</button>`
        ).join('');
    } else {
        container.innerHTML = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'].map(note =>
            `<button class="ref-btn" data-note="${note}">${note}</button>`
        ).join('');
    }
}

async function toggleListening() {
    if (isListening) {
        stopListening();
    } else {
        await startListening();
    }
}

async function startListening() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        const source = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 4096;

        source.connect(analyser);

        isListening = true;
        document.getElementById('startBtn').textContent = texts[currentLang].stop;
        document.getElementById('startBtn').classList.add('listening');

        detectPitch();
    } catch (err) {
        console.error('Microphone error:', err);
    }
}

function stopListening() {
    isListening = false;

    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    document.getElementById('startBtn').textContent = texts[currentLang].start;
    document.getElementById('startBtn').classList.remove('listening');
    document.querySelector('.status-text').textContent = texts[currentLang].waiting;
    document.getElementById('tuningStatus').className = 'tuning-status';
}

function detectPitch() {
    if (!isListening) return;

    const bufferLength = analyser.fftSize;
    const buffer = new Float32Array(bufferLength);
    analyser.getFloatTimeDomainData(buffer);

    const pitch = autoCorrelate(buffer, audioContext.sampleRate);

    if (pitch > 0) {
        updateDisplay(pitch);
    }

    animationId = requestAnimationFrame(detectPitch);
}

function autoCorrelate(buffer, sampleRate) {
    // Check if there's enough signal
    let rms = 0;
    for (let i = 0; i < buffer.length; i++) {
        rms += buffer[i] * buffer[i];
    }
    rms = Math.sqrt(rms / buffer.length);

    if (rms < 0.01) return -1; // Not enough signal

    // Autocorrelation
    const correlations = new Float32Array(buffer.length);
    for (let lag = 0; lag < buffer.length; lag++) {
        let sum = 0;
        for (let i = 0; i < buffer.length - lag; i++) {
            sum += buffer[i] * buffer[i + lag];
        }
        correlations[lag] = sum;
    }

    // Find the first peak after the initial decline
    let foundPeak = false;
    let peakLag = 0;

    for (let i = 1; i < correlations.length; i++) {
        if (correlations[i] > correlations[i - 1]) {
            if (!foundPeak && correlations[i] > correlations[0] * 0.5) {
                foundPeak = true;
            }
        } else if (foundPeak) {
            peakLag = i - 1;
            break;
        }
    }

    if (peakLag === 0) return -1;

    // Refine with parabolic interpolation
    const y1 = correlations[peakLag - 1];
    const y2 = correlations[peakLag];
    const y3 = correlations[peakLag + 1];

    const a = (y1 + y3 - 2 * y2) / 2;
    const b = (y3 - y1) / 2;

    const refinedLag = peakLag - b / (2 * a);

    return sampleRate / refinedLag;
}

function updateDisplay(frequency) {
    // Find closest note
    let closestNote = 'A4';
    let closestDiff = Infinity;

    for (const [note, freq] of Object.entries(noteFrequencies)) {
        const cents = 1200 * Math.log2(frequency / freq);
        if (Math.abs(cents) < Math.abs(closestDiff)) {
            closestDiff = cents;
            closestNote = note;
        }
    }

    const noteName = closestNote.replace(/[0-9]/g, '');
    const octave = closestNote.replace(/[^0-9]/g, '');
    const accidental = noteName.includes('#') ? '#' : '';
    const baseNote = noteName.replace('#', '');

    document.getElementById('noteName').textContent = baseNote;
    document.getElementById('noteAccidental').textContent = accidental;
    document.getElementById('noteOctave').textContent = octave;
    document.getElementById('frequency').textContent = frequency.toFixed(1);

    // Update meter
    const cents = Math.max(-50, Math.min(50, closestDiff));
    const needlePosition = (cents / 50) * 45; // degrees
    document.getElementById('meterNeedle').style.transform = `translateX(-50%) rotate(${needlePosition}deg)`;
    document.getElementById('centsDisplay').textContent = `${cents > 0 ? '+' : ''}${Math.round(cents)} cents`;

    // Update status
    const t = texts[currentLang];
    const status = document.getElementById('tuningStatus');
    const statusText = status.querySelector('.status-text');
    const statusIcon = status.querySelector('.status-icon');

    if (Math.abs(cents) < 5) {
        status.className = 'tuning-status in-tune';
        statusIcon.textContent = '✅';
        statusText.textContent = t.inTune;
    } else if (cents < 0) {
        status.className = 'tuning-status flat';
        statusIcon.textContent = '⬇️';
        statusText.textContent = t.flat;
    } else {
        status.className = 'tuning-status sharp';
        statusIcon.textContent = '⬆️';
        statusText.textContent = t.sharp;
    }
}

function playReferenceNote(noteName) {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    audioContext.resume();

    const frequency = noteFrequencies[noteName];
    if (!frequency) return;

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.value = frequency;

    const now = audioContext.currentTime;
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 1.5);

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.start(now);
    osc.stop(now + 1.5);
}

init();
