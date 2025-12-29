/**
 * Audio Tuner - Tool #302
 * Chromatic tuner for instruments
 */

let currentLang = 'zh';
let audioContext = null;
let analyser = null;
let mediaStream = null;
let isRunning = false;
let animationId = null;
let referenceA4 = 440;

const noteStrings = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const instruments = {
    guitar: { notes: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'], freqs: [82.41, 110.00, 146.83, 196.00, 246.94, 329.63] },
    bass: { notes: ['E1', 'A1', 'D2', 'G2'], freqs: [41.20, 55.00, 73.42, 98.00] },
    ukulele: { notes: ['G4', 'C4', 'E4', 'A4'], freqs: [392.00, 261.63, 329.63, 440.00] },
    violin: { notes: ['G3', 'D4', 'A4', 'E5'], freqs: [196.00, 293.66, 440.00, 659.25] }
};

const texts = {
    zh: {
        title: '調音器',
        subtitle: '樂器調音工具',
        privacy: '100% 本地處理 · 零資料上傳',
        reference: '參考音高',
        quickTuning: '快速調音',
        start: '🎤 開始調音',
        stop: '⏹️ 停止調音',
        inTune: '準確！',
        flat: '偏低 ↑',
        sharp: '偏高 ↓',
        waiting: '等待偵測...',
        guitar: '吉他',
        bass: '貝斯',
        ukulele: '烏克麗麗',
        violin: '小提琴'
    },
    en: {
        title: 'Tuner',
        subtitle: 'Instrument tuning tool',
        privacy: '100% Local Processing · No Data Upload',
        reference: 'Reference',
        quickTuning: 'Quick Tuning',
        start: '🎤 Start Tuning',
        stop: '⏹️ Stop Tuning',
        inTune: 'In Tune!',
        flat: 'Flat ↑',
        sharp: 'Sharp ↓',
        waiting: 'Waiting for input...',
        guitar: 'Guitar',
        bass: 'Bass',
        ukulele: 'Ukulele',
        violin: 'Violin'
    }
};

function init() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));

    document.getElementById('refSlider').addEventListener('input', (e) => {
        referenceA4 = parseInt(e.target.value);
        document.getElementById('refValue').textContent = `A4 = ${referenceA4} Hz`;
    });

    document.querySelectorAll('.instrument-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.instrument-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            showStringButtons(btn.dataset.instrument);
        });
    });

    document.getElementById('startBtn').addEventListener('click', toggleTuning);
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');

    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;

    document.getElementById('refLabel').textContent = t.reference;
    document.getElementById('instrumentTitle').textContent = t.quickTuning;
    document.getElementById('startBtn').textContent = isRunning ? t.stop : t.start;

    const instrumentNames = document.querySelectorAll('.instrument-name');
    instrumentNames[0].textContent = t.guitar;
    instrumentNames[1].textContent = t.bass;
    instrumentNames[2].textContent = t.ukulele;
    instrumentNames[3].textContent = t.violin;
}

function showStringButtons(instrument) {
    const container = document.getElementById('stringButtons');
    const inst = instruments[instrument];

    container.innerHTML = inst.notes.map((note, i) =>
        `<button class="string-btn" data-freq="${inst.freqs[i]}">${note}</button>`
    ).join('');

    container.style.display = 'flex';

    container.querySelectorAll('.string-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            playReferenceNote(parseFloat(btn.dataset.freq));
        });
    });
}

function playReferenceNote(frequency) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 1);
}

async function toggleTuning() {
    if (isRunning) {
        stopTuning();
    } else {
        await startTuning();
    }
}

async function startTuning() {
    try {
        await audioContext.resume();
        mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

        const source = audioContext.createMediaStreamSource(mediaStream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;

        source.connect(analyser);

        isRunning = true;
        document.getElementById('startBtn').textContent = texts[currentLang].stop;
        document.getElementById('startBtn').classList.add('btn-stop');

        detectPitch();
    } catch (err) {
        console.error('Microphone access denied:', err);
    }
}

function stopTuning() {
    isRunning = false;
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
    }

    document.getElementById('startBtn').textContent = texts[currentLang].start;
    document.getElementById('startBtn').classList.remove('btn-stop');

    resetDisplay();
}

function resetDisplay() {
    document.getElementById('prevNote').textContent = '--';
    document.getElementById('currentNote').textContent = '--';
    document.getElementById('nextNote').textContent = '--';
    document.getElementById('frequencyDisplay').textContent = '-- Hz';
    document.getElementById('tuningStatus').textContent = '--';
    document.getElementById('tuningStatus').className = 'tuning-status';
    document.getElementById('meterNeedle').style.left = '50%';
    document.getElementById('meterNeedle').className = 'meter-needle';
}

function detectPitch() {
    if (!isRunning) return;

    const buffer = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(buffer);

    const frequency = autoCorrelate(buffer, audioContext.sampleRate);

    if (frequency > 0) {
        updateDisplay(frequency);
    }

    animationId = requestAnimationFrame(detectPitch);
}

function autoCorrelate(buffer, sampleRate) {
    let rms = 0;
    for (let i = 0; i < buffer.length; i++) {
        rms += buffer[i] * buffer[i];
    }
    rms = Math.sqrt(rms / buffer.length);
    if (rms < 0.01) return -1;

    let r1 = 0, r2 = buffer.length - 1;
    const threshold = 0.2;
    for (let i = 0; i < buffer.length / 2; i++) {
        if (Math.abs(buffer[i]) < threshold) {
            r1 = i;
            break;
        }
    }
    for (let i = 1; i < buffer.length / 2; i++) {
        if (Math.abs(buffer[buffer.length - i]) < threshold) {
            r2 = buffer.length - i;
            break;
        }
    }

    const trimmedBuffer = buffer.slice(r1, r2);
    const size = trimmedBuffer.length;

    const correlations = new Array(size).fill(0);
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size - i; j++) {
            correlations[i] += trimmedBuffer[j] * trimmedBuffer[j + i];
        }
    }

    let d = 0;
    while (correlations[d] > correlations[d + 1]) d++;

    let maxVal = -1, maxPos = -1;
    for (let i = d; i < size; i++) {
        if (correlations[i] > maxVal) {
            maxVal = correlations[i];
            maxPos = i;
        }
    }

    let t0 = maxPos;

    const x1 = correlations[t0 - 1];
    const x2 = correlations[t0];
    const x3 = correlations[t0 + 1];
    const a = (x1 + x3 - 2 * x2) / 2;
    const b = (x3 - x1) / 2;
    if (a) t0 = t0 - b / (2 * a);

    return sampleRate / t0;
}

function frequencyToNote(frequency) {
    const noteNum = 12 * (Math.log2(frequency / referenceA4));
    return Math.round(noteNum) + 69;
}

function noteToFrequency(note) {
    return referenceA4 * Math.pow(2, (note - 69) / 12);
}

function updateDisplay(frequency) {
    const noteNum = frequencyToNote(frequency);
    const noteName = noteStrings[((noteNum % 12) + 12) % 12];
    const octave = Math.floor(noteNum / 12) - 1;
    const exactFreq = noteToFrequency(noteNum);
    const cents = Math.round(1200 * Math.log2(frequency / exactFreq));

    // Get previous and next notes
    const prevNoteNum = noteNum - 1;
    const nextNoteNum = noteNum + 1;
    const prevNoteName = noteStrings[((prevNoteNum % 12) + 12) % 12];
    const nextNoteName = noteStrings[((nextNoteNum % 12) + 12) % 12];
    const prevOctave = Math.floor(prevNoteNum / 12) - 1;
    const nextOctave = Math.floor(nextNoteNum / 12) - 1;

    document.getElementById('prevNote').textContent = prevNoteName + prevOctave;
    document.getElementById('currentNote').textContent = noteName + octave;
    document.getElementById('nextNote').textContent = nextNoteName + nextOctave;
    document.getElementById('frequencyDisplay').textContent = frequency.toFixed(1) + ' Hz';

    // Update meter needle
    const needle = document.getElementById('meterNeedle');
    const position = 50 + (cents / 50) * 50;
    needle.style.left = Math.max(0, Math.min(100, position)) + '%';

    // Update status
    const status = document.getElementById('tuningStatus');
    const t = texts[currentLang];

    needle.className = 'meter-needle';
    status.className = 'tuning-status';

    if (Math.abs(cents) < 5) {
        status.textContent = t.inTune;
        status.classList.add('in-tune');
        needle.classList.add('in-tune');
    } else if (cents < 0) {
        status.textContent = t.flat;
        status.classList.add('flat');
        needle.classList.add('flat');
    } else {
        status.textContent = t.sharp;
        status.classList.add('sharp');
        needle.classList.add('sharp');
    }
}

init();
