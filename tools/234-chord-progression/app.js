/**
 * Chord Progression Generator - Tool #234
 * AI-powered chord progression generation
 */

let currentLang = 'zh';
let audioContext = null;
let progression = [];
let isPlaying = false;
let playbackTimeout = null;
let currentChordIndex = 0;

const keyChords = {
    C: { I: 'C', ii: 'Dm', iii: 'Em', IV: 'F', V: 'G', vi: 'Am', vii: 'Bdim' },
    G: { I: 'G', ii: 'Am', iii: 'Bm', IV: 'C', V: 'D', vi: 'Em', vii: 'F#dim' },
    D: { I: 'D', ii: 'Em', iii: 'F#m', IV: 'G', V: 'A', vi: 'Bm', vii: 'C#dim' },
    A: { I: 'A', ii: 'Bm', iii: 'C#m', IV: 'D', V: 'E', vi: 'F#m', vii: 'G#dim' },
    F: { I: 'F', ii: 'Gm', iii: 'Am', IV: 'Bb', V: 'C', vi: 'Dm', vii: 'Edim' },
    Am: { i: 'Am', ii: 'Bdim', III: 'C', iv: 'Dm', v: 'Em', VI: 'F', VII: 'G' },
    Em: { i: 'Em', ii: 'F#dim', III: 'G', iv: 'Am', v: 'Bm', VI: 'C', VII: 'D' },
    Dm: { i: 'Dm', ii: 'Edim', III: 'F', iv: 'Gm', v: 'Am', VI: 'Bb', VII: 'C' }
};

const chordNotes = {
    'C': [48, 52, 55], 'Dm': [50, 53, 57], 'Em': [52, 55, 59], 'F': [53, 57, 60],
    'G': [55, 59, 62], 'Am': [57, 60, 64], 'Bm': [59, 62, 66], 'D': [50, 54, 57],
    'A': [57, 61, 64], 'E': [52, 56, 59], 'B': [59, 63, 66], 'Bb': [58, 62, 65],
    'Gm': [55, 58, 62], 'F#m': [54, 57, 61], 'C#m': [49, 52, 56], 'G#dim': [56, 59, 62],
    'Bdim': [59, 62, 65], 'Edim': [52, 55, 58], 'F#dim': [54, 57, 60], 'C#dim': [49, 52, 55],
    'Cmaj7': [48, 52, 55, 59], 'Dm7': [50, 53, 57, 60], 'Em7': [52, 55, 59, 62],
    'Fmaj7': [53, 57, 60, 64], 'G7': [55, 59, 62, 65], 'Am7': [57, 60, 64, 67],
    'Bm7b5': [59, 62, 65, 69]
};

const styleProgressions = {
    pop: [['I', 'V', 'vi', 'IV'], ['I', 'IV', 'V', 'I'], ['vi', 'IV', 'I', 'V']],
    jazz: [['ii', 'V', 'I', 'I'], ['I', 'vi', 'ii', 'V'], ['iii', 'vi', 'ii', 'V']],
    blues: [['I', 'I', 'IV', 'I'], ['I', 'IV', 'I', 'V'], ['IV', 'IV', 'I', 'I']],
    folk: [['I', 'IV', 'I', 'V'], ['I', 'V', 'IV', 'I'], ['vi', 'IV', 'V', 'I']],
    classical: [['I', 'IV', 'V', 'I'], ['I', 'ii', 'V', 'I'], ['I', 'vi', 'IV', 'V']]
};

const texts = {
    zh: {
        title: '和弦進行生成',
        subtitle: 'AI 自動生成和弦進行',
        privacy: '100% 本地處理 · 零資料上傳',
        key: '調性',
        major: '大調', minor: '小調',
        style: '風格',
        pop: '流行', jazz: '爵士', blues: '藍調', folk: '民謠', classical: '古典',
        length: '和弦數量',
        chordsUnit: '個和弦',
        complexity: '複雜度',
        generate: '生成和弦進行',
        play: '▶️ 播放',
        stop: '⏹️ 停止',
        regenerate: '🔄 重新生成',
        chordCount: '和弦數',
        function: '調性功能'
    },
    en: {
        title: 'Chord Progression Generator',
        subtitle: 'AI-powered chord progression generation',
        privacy: '100% Local Processing · No Data Upload',
        key: 'Key',
        major: 'Major', minor: 'Minor',
        style: 'Style',
        pop: 'Pop', jazz: 'Jazz', blues: 'Blues', folk: 'Folk', classical: 'Classical',
        length: 'Length',
        chordsUnit: ' chords',
        complexity: 'Complexity',
        generate: 'Generate',
        play: '▶️ Play',
        stop: '⏹️ Stop',
        regenerate: '🔄 Regenerate',
        chordCount: 'Chords',
        function: 'Function'
    }
};

function init() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));

    document.getElementById('complexitySlider').addEventListener('input', (e) => {
        document.getElementById('complexityValue').textContent = e.target.value;
    });

    document.getElementById('generateBtn').addEventListener('click', generateProgression);
    document.getElementById('playBtn').addEventListener('click', playProgression);
    document.getElementById('stopBtn').addEventListener('click', stopPlayback);
    document.getElementById('regenerateBtn').addEventListener('click', generateProgression);
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
    labels[0].textContent = t.key;
    labels[1].textContent = t.style;
    labels[2].textContent = t.length;
    labels[3].textContent = t.complexity;

    const styleSelect = document.getElementById('styleSelect');
    styleSelect.options[0].text = t.pop;
    styleSelect.options[1].text = t.jazz;
    styleSelect.options[2].text = t.blues;
    styleSelect.options[3].text = t.folk;
    styleSelect.options[4].text = t.classical;

    document.getElementById('generateBtn').textContent = t.generate;
    document.getElementById('playBtn').textContent = t.play;
    document.getElementById('stopBtn').textContent = t.stop;
    document.getElementById('regenerateBtn').textContent = t.regenerate;

    document.querySelectorAll('.info-label')[0].textContent = t.chordCount;
    document.querySelectorAll('.info-label')[1].textContent = t.function;
}

function generateProgression() {
    const key = document.getElementById('keySelect').value;
    const style = document.getElementById('styleSelect').value;
    const length = parseInt(document.getElementById('lengthSelect').value);
    const complexity = parseInt(document.getElementById('complexitySlider').value);

    const chords = keyChords[key];
    const patterns = styleProgressions[style];

    progression = [];
    let functions = [];

    for (let i = 0; i < length; i += 4) {
        const pattern = patterns[Math.floor(Math.random() * patterns.length)];

        pattern.forEach((func, idx) => {
            if (progression.length >= length) return;

            let chordFunc = func;
            // Handle minor key function names
            if (key.includes('m') && !key.includes('maj')) {
                chordFunc = func.toLowerCase();
                if (func === 'I') chordFunc = 'i';
                if (func === 'IV') chordFunc = 'iv';
                if (func === 'V') chordFunc = 'v';
            }

            let chord = chords[chordFunc] || chords[func] || chords['I'] || chords['i'];

            // Add extensions based on complexity
            if (complexity >= 3 && Math.random() < 0.3) {
                if (chordNotes[chord + '7']) {
                    chord = chord + '7';
                } else if (chordNotes[chord + 'maj7']) {
                    chord = chord + 'maj7';
                }
            }

            // Add substitutions for higher complexity
            if (complexity >= 4 && Math.random() < 0.2) {
                const subs = Object.keys(chordNotes);
                chord = subs[Math.floor(Math.random() * subs.length)];
            }

            progression.push(chord);
            functions.push(func);
        });
    }

    displayProgression(functions);
    document.getElementById('resultSection').style.display = 'block';
}

function displayProgression(functions) {
    const display = document.getElementById('chordDisplay');
    const notation = document.getElementById('chordNotation');

    display.innerHTML = progression.map((chord, i) =>
        `<div class="chord-card" data-index="${i}">
            <div class="chord-name">${chord}</div>
            <div class="chord-function">${functions[i] || ''}</div>
        </div>`
    ).join('');

    notation.textContent = progression.join(' → ');

    document.getElementById('chordCount').textContent = progression.length;
    document.getElementById('functionInfo').textContent = functions.slice(0, 4).join('-');

    // Add click handlers
    display.querySelectorAll('.chord-card').forEach(card => {
        card.addEventListener('click', () => {
            const index = parseInt(card.dataset.index);
            playChord(progression[index]);
        });
    });
}

function playChord(chordName) {
    const notes = chordNotes[chordName];
    if (!notes) return;

    audioContext.resume();
    const now = audioContext.currentTime;

    notes.forEach((note, i) => {
        const freq = 440 * Math.pow(2, (note - 69) / 12);

        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.type = 'triangle';
        osc.frequency.value = freq;

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1.5);

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.start(now + i * 0.02);
        osc.stop(now + 1.6);
    });
}

function playProgression() {
    if (isPlaying || progression.length === 0) return;

    audioContext.resume();
    isPlaying = true;
    currentChordIndex = 0;

    const chordDuration = 1500; // ms

    function playNextChord() {
        if (!isPlaying || currentChordIndex >= progression.length) {
            stopPlayback();
            return;
        }

        // Highlight current chord
        document.querySelectorAll('.chord-card').forEach(c => c.classList.remove('playing'));
        document.querySelector(`.chord-card[data-index="${currentChordIndex}"]`)?.classList.add('playing');

        playChord(progression[currentChordIndex]);
        currentChordIndex++;

        playbackTimeout = setTimeout(playNextChord, chordDuration);
    }

    playNextChord();
}

function stopPlayback() {
    isPlaying = false;
    currentChordIndex = 0;
    if (playbackTimeout) {
        clearTimeout(playbackTimeout);
        playbackTimeout = null;
    }
    document.querySelectorAll('.chord-card').forEach(c => c.classList.remove('playing'));
}

init();
