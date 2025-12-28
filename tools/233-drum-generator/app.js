/**
 * Drum Pattern Generator - Tool #233
 * AI-powered drum pattern generation
 */

let currentLang = 'zh';
let audioContext = null;
let pattern = {};
let isPlaying = false;
let isLooping = false;
let playbackInterval = null;
let currentStep = 0;

const drums = [
    { id: 'kick', zh: '大鼓', en: 'Kick', freq: 60, decay: 0.3 },
    { id: 'snare', zh: '小鼓', en: 'Snare', freq: 200, decay: 0.15 },
    { id: 'hihat', zh: '腳踏鈸', en: 'Hi-Hat', freq: 800, decay: 0.05 },
    { id: 'tom', zh: '筒鼓', en: 'Tom', freq: 120, decay: 0.2 },
    { id: 'crash', zh: '碎音鈸', en: 'Crash', freq: 500, decay: 0.4 }
];

const stylePatterns = {
    rock: {
        kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
        snare: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
        hihat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    },
    pop: {
        kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
        snare: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
        hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0]
    },
    hiphop: {
        kick: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0],
        snare: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1],
        hihat: [1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1]
    },
    jazz: {
        kick: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        snare: [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
        hihat: [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1]
    },
    electronic: {
        kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
        snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        hihat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    },
    latin: {
        kick: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
        snare: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
        hihat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    }
};

const texts = {
    zh: {
        title: '鼓點生成',
        subtitle: 'AI 自動生成鼓組節奏',
        privacy: '100% 本地處理 · 零資料上傳',
        style: '節奏風格',
        rock: '搖滾', pop: '流行', hiphop: '嘻哈', jazz: '爵士', electronic: '電子', latin: '拉丁',
        bpm: '速度 (BPM)',
        complexity: '複雜度',
        bars: '小節數',
        barsUnit: '小節',
        generate: '生成鼓點',
        play: '▶️ 播放',
        stop: '⏹️ 停止',
        loop: '🔁 循環',
        loopOn: '🔁 循環中',
        regenerate: '🔄 重新生成',
        beatCount: '總拍數',
        duration: '時長'
    },
    en: {
        title: 'Drum Pattern Generator',
        subtitle: 'AI-powered drum pattern generation',
        privacy: '100% Local Processing · No Data Upload',
        style: 'Style',
        rock: 'Rock', pop: 'Pop', hiphop: 'Hip-Hop', jazz: 'Jazz', electronic: 'Electronic', latin: 'Latin',
        bpm: 'Tempo (BPM)',
        complexity: 'Complexity',
        bars: 'Bars',
        barsUnit: ' bar(s)',
        generate: 'Generate',
        play: '▶️ Play',
        stop: '⏹️ Stop',
        loop: '🔁 Loop',
        loopOn: '🔁 Looping',
        regenerate: '🔄 Regenerate',
        beatCount: 'Beats',
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

    document.getElementById('complexitySlider').addEventListener('input', (e) => {
        document.getElementById('complexityValue').textContent = e.target.value;
    });

    document.getElementById('generateBtn').addEventListener('click', generatePattern);
    document.getElementById('playBtn').addEventListener('click', playPattern);
    document.getElementById('stopBtn').addEventListener('click', stopPlayback);
    document.getElementById('loopBtn').addEventListener('click', toggleLoop);
    document.getElementById('regenerateBtn').addEventListener('click', generatePattern);
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
    labels[1].textContent = t.bpm;
    labels[2].textContent = t.complexity;
    labels[3].textContent = t.bars;

    const styleSelect = document.getElementById('styleSelect');
    styleSelect.options[0].text = t.rock;
    styleSelect.options[1].text = t.pop;
    styleSelect.options[2].text = t.hiphop;
    styleSelect.options[3].text = t.jazz;
    styleSelect.options[4].text = t.electronic;
    styleSelect.options[5].text = t.latin;

    document.getElementById('generateBtn').textContent = t.generate;
    document.getElementById('playBtn').textContent = t.play;
    document.getElementById('stopBtn').textContent = t.stop;
    document.getElementById('loopBtn').textContent = isLooping ? t.loopOn : t.loop;
    document.getElementById('regenerateBtn').textContent = t.regenerate;

    document.querySelectorAll('.info-label')[0].textContent = t.beatCount;
    document.querySelectorAll('.info-label')[1].textContent = t.duration;

    if (Object.keys(pattern).length > 0) {
        displayPattern();
    }
}

function generatePattern() {
    const style = document.getElementById('styleSelect').value;
    const complexity = parseInt(document.getElementById('complexitySlider').value);
    const bars = parseInt(document.getElementById('barsSelect').value);

    const basePattern = stylePatterns[style];
    const stepsPerBar = 16;
    const totalSteps = bars * stepsPerBar;

    pattern = {};

    drums.forEach(drum => {
        pattern[drum.id] = [];
        const base = basePattern[drum.id] || new Array(16).fill(0);

        for (let bar = 0; bar < bars; bar++) {
            for (let step = 0; step < stepsPerBar; step++) {
                let hit = base[step];

                // Add variation based on complexity
                if (complexity > 2 && Math.random() < (complexity - 2) * 0.1) {
                    hit = hit ? 0 : (Math.random() < 0.3 ? 1 : 0);
                }

                // Add fills at end of pattern
                if (complexity > 3 && bar === bars - 1 && step >= 12) {
                    if (drum.id === 'tom' || drum.id === 'snare') {
                        hit = Math.random() < 0.5 ? 1 : hit;
                    }
                }

                pattern[drum.id].push(hit);
            }
        }
    });

    displayPattern();
    document.getElementById('resultSection').style.display = 'block';
}

function displayPattern() {
    const grid = document.getElementById('drumGrid');
    const bars = parseInt(document.getElementById('barsSelect').value);
    const stepsPerBar = 16;
    const totalSteps = bars * stepsPerBar;

    let html = '<div class="grid-header"><div class="drum-label"></div>';
    for (let i = 0; i < totalSteps; i++) {
        const isDownbeat = i % 4 === 0;
        html += `<div class="step-num ${isDownbeat ? 'downbeat' : ''}">${(i % 16) + 1}</div>`;
    }
    html += '</div>';

    drums.forEach(drum => {
        html += `<div class="grid-row" data-drum="${drum.id}">`;
        html += `<div class="drum-label">${drum[currentLang]}</div>`;

        for (let step = 0; step < totalSteps; step++) {
            const active = pattern[drum.id][step] ? 'active' : '';
            const isDownbeat = step % 4 === 0;
            html += `<div class="grid-cell ${active} ${isDownbeat ? 'downbeat' : ''}" data-step="${step}"></div>`;
        }
        html += '</div>';
    });

    grid.innerHTML = html;

    // Add click handlers for cells
    grid.querySelectorAll('.grid-cell').forEach(cell => {
        cell.addEventListener('click', () => {
            const row = cell.closest('.grid-row');
            const drumId = row.dataset.drum;
            const step = parseInt(cell.dataset.step);

            pattern[drumId][step] = pattern[drumId][step] ? 0 : 1;
            cell.classList.toggle('active');

            if (pattern[drumId][step]) {
                const drum = drums.find(d => d.id === drumId);
                playDrumSound(drum);
            }
        });
    });

    const bpm = parseInt(document.getElementById('bpmSlider').value);
    const beatDuration = 60 / bpm / 4; // 16th notes
    const totalDuration = totalSteps * beatDuration;

    document.getElementById('beatCount').textContent = totalSteps;
    document.getElementById('duration').textContent = totalDuration.toFixed(1) + 's';
}

function playDrumSound(drum) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const noise = audioContext.createOscillator();

    const now = audioContext.currentTime;

    if (drum.id === 'kick') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(drum.freq, now + 0.05);
        gain.gain.setValueAtTime(0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + drum.decay);
    } else if (drum.id === 'snare') {
        osc.type = 'triangle';
        osc.frequency.value = drum.freq;
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + drum.decay);
    } else if (drum.id === 'hihat') {
        osc.type = 'square';
        osc.frequency.value = drum.freq;
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + drum.decay);
    } else if (drum.id === 'tom') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(drum.freq * 1.5, now);
        osc.frequency.exponentialRampToValueAtTime(drum.freq, now + 0.1);
        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + drum.decay);
    } else if (drum.id === 'crash') {
        osc.type = 'sawtooth';
        osc.frequency.value = drum.freq;
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + drum.decay);
    }

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.start(now);
    osc.stop(now + drum.decay + 0.1);
}

function playPattern() {
    if (isPlaying || Object.keys(pattern).length === 0) return;

    audioContext.resume();
    isPlaying = true;
    currentStep = 0;

    const bpm = parseInt(document.getElementById('bpmSlider').value);
    const stepDuration = (60 / bpm / 4) * 1000; // ms per 16th note

    const bars = parseInt(document.getElementById('barsSelect').value);
    const totalSteps = bars * 16;

    playbackInterval = setInterval(() => {
        // Highlight current step
        document.querySelectorAll('.grid-cell').forEach(cell => cell.classList.remove('playing'));
        document.querySelectorAll(`.grid-cell[data-step="${currentStep}"]`).forEach(cell => {
            cell.classList.add('playing');
        });

        // Play drums
        drums.forEach(drum => {
            if (pattern[drum.id][currentStep]) {
                playDrumSound(drum);
            }
        });

        currentStep++;

        if (currentStep >= totalSteps) {
            if (isLooping) {
                currentStep = 0;
            } else {
                stopPlayback();
            }
        }
    }, stepDuration);
}

function stopPlayback() {
    isPlaying = false;
    currentStep = 0;
    if (playbackInterval) {
        clearInterval(playbackInterval);
        playbackInterval = null;
    }
    document.querySelectorAll('.grid-cell').forEach(cell => cell.classList.remove('playing'));
}

function toggleLoop() {
    isLooping = !isLooping;
    const t = texts[currentLang];
    document.getElementById('loopBtn').textContent = isLooping ? t.loopOn : t.loop;
    document.getElementById('loopBtn').classList.toggle('active', isLooping);
}

init();
