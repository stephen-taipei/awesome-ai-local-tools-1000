/**
 * Sound Effects Generator - Tool #237
 * Generate various sound effects
 */

let currentLang = 'zh';
let audioContext = null;

const effects = [
    { id: 'beep', icon: '🔔', zh: '提示音', en: 'Beep' },
    { id: 'success', icon: '✅', zh: '成功', en: 'Success' },
    { id: 'error', icon: '❌', zh: '錯誤', en: 'Error' },
    { id: 'notification', icon: '📬', zh: '通知', en: 'Notification' },
    { id: 'click', icon: '👆', zh: '點擊', en: 'Click' },
    { id: 'pop', icon: '💥', zh: '彈出', en: 'Pop' },
    { id: 'swoosh', icon: '💨', zh: '滑動', en: 'Swoosh' },
    { id: 'coin', icon: '🪙', zh: '金幣', en: 'Coin' },
    { id: 'powerup', icon: '⚡', zh: '升級', en: 'Power Up' },
    { id: 'laser', icon: '🔫', zh: '雷射', en: 'Laser' },
    { id: 'explosion', icon: '💣', zh: '爆炸', en: 'Explosion' },
    { id: 'jump', icon: '🦘', zh: '跳躍', en: 'Jump' }
];

const texts = {
    zh: {
        title: '音效生成器',
        subtitle: '生成各種音效並下載',
        privacy: '100% 本地處理 · 零資料上傳',
        custom: '自訂音效',
        waveform: '波形',
        sine: '正弦波', square: '方波', sawtooth: '鋸齒波', triangle: '三角波',
        frequency: '頻率 (Hz)',
        duration: '持續時間 (秒)',
        volume: '音量',
        preview: '▶️ 預覽',
        download: '⬇️ 下載 WAV'
    },
    en: {
        title: 'Sound Effects Generator',
        subtitle: 'Generate and download sound effects',
        privacy: '100% Local Processing · No Data Upload',
        custom: 'Custom Effect',
        waveform: 'Waveform',
        sine: 'Sine', square: 'Square', sawtooth: 'Sawtooth', triangle: 'Triangle',
        frequency: 'Frequency (Hz)',
        duration: 'Duration (sec)',
        volume: 'Volume',
        preview: '▶️ Preview',
        download: '⬇️ Download WAV'
    }
};

function init() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    createEffectsGrid();

    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));

    document.getElementById('freqSlider').addEventListener('input', (e) => {
        document.getElementById('freqValue').textContent = e.target.value;
    });
    document.getElementById('durationSlider').addEventListener('input', (e) => {
        document.getElementById('durationValue').textContent = e.target.value;
    });
    document.getElementById('volumeSlider').addEventListener('input', (e) => {
        document.getElementById('volumeValue').textContent = e.target.value + '%';
    });

    document.getElementById('playCustomBtn').addEventListener('click', playCustomEffect);
    document.getElementById('downloadCustomBtn').addEventListener('click', downloadCustomEffect);
}

function createEffectsGrid() {
    const grid = document.getElementById('effectsGrid');
    grid.innerHTML = effects.map(effect => `
        <div class="effect-card" data-effect="${effect.id}">
            <div class="effect-icon">${effect.icon}</div>
            <div class="effect-name">${effect[currentLang]}</div>
            <div class="effect-actions">
                <button class="play-btn" title="播放">▶️</button>
                <button class="download-btn" title="下載">⬇️</button>
            </div>
        </div>
    `).join('');

    grid.querySelectorAll('.effect-card').forEach(card => {
        const effectId = card.dataset.effect;
        card.querySelector('.play-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            playEffect(effectId);
        });
        card.querySelector('.download-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            downloadEffect(effectId);
        });
        card.addEventListener('click', () => playEffect(effectId));
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

    document.querySelector('.custom-section h3').textContent = t.custom;

    const labels = document.querySelectorAll('.control-group label');
    labels[0].textContent = t.waveform;
    labels[1].textContent = t.frequency;
    labels[2].textContent = t.duration;
    labels[3].textContent = t.volume;

    const waveformSelect = document.getElementById('waveformSelect');
    waveformSelect.options[0].text = t.sine;
    waveformSelect.options[1].text = t.square;
    waveformSelect.options[2].text = t.sawtooth;
    waveformSelect.options[3].text = t.triangle;

    document.getElementById('playCustomBtn').textContent = t.preview;
    document.getElementById('downloadCustomBtn').textContent = t.download;

    // Update effect names
    document.querySelectorAll('.effect-card').forEach(card => {
        const effect = effects.find(e => e.id === card.dataset.effect);
        card.querySelector('.effect-name').textContent = effect[lang];
    });
}

function playEffect(effectId) {
    audioContext.resume();
    const now = audioContext.currentTime;

    switch (effectId) {
        case 'beep':
            playTone(880, 0.15, 'sine', 0.3);
            break;
        case 'success':
            playTone(523, 0.1, 'sine', 0.3);
            setTimeout(() => playTone(659, 0.1, 'sine', 0.3), 100);
            setTimeout(() => playTone(784, 0.2, 'sine', 0.3), 200);
            break;
        case 'error':
            playTone(200, 0.15, 'square', 0.2);
            setTimeout(() => playTone(150, 0.25, 'square', 0.2), 150);
            break;
        case 'notification':
            playTone(600, 0.1, 'sine', 0.25);
            setTimeout(() => playTone(800, 0.15, 'sine', 0.25), 120);
            break;
        case 'click':
            playTone(1000, 0.03, 'square', 0.15);
            break;
        case 'pop':
            playFrequencySweep(400, 100, 0.08, 'sine', 0.4);
            break;
        case 'swoosh':
            playFrequencySweep(200, 800, 0.2, 'sawtooth', 0.15);
            break;
        case 'coin':
            playTone(988, 0.08, 'square', 0.2);
            setTimeout(() => playTone(1319, 0.15, 'square', 0.2), 80);
            break;
        case 'powerup':
            for (let i = 0; i < 5; i++) {
                setTimeout(() => playTone(300 + i * 100, 0.08, 'square', 0.2), i * 60);
            }
            break;
        case 'laser':
            playFrequencySweep(1500, 100, 0.15, 'sawtooth', 0.2);
            break;
        case 'explosion':
            playNoise(0.4, 0.3);
            break;
        case 'jump':
            playFrequencySweep(150, 400, 0.15, 'sine', 0.3);
            break;
    }
}

function playTone(frequency, duration, waveform, volume) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = waveform;
    osc.frequency.value = frequency;

    const now = audioContext.currentTime;
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.start(now);
    osc.stop(now + duration + 0.1);
}

function playFrequencySweep(startFreq, endFreq, duration, waveform, volume) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = waveform;
    const now = audioContext.currentTime;

    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.start(now);
    osc.stop(now + duration + 0.1);
}

function playNoise(duration, volume) {
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }

    const source = audioContext.createBufferSource();
    const gain = audioContext.createGain();

    source.buffer = buffer;
    gain.gain.value = volume;

    source.connect(gain);
    gain.connect(audioContext.destination);

    source.start();
}

function playCustomEffect() {
    audioContext.resume();

    const waveform = document.getElementById('waveformSelect').value;
    const frequency = parseInt(document.getElementById('freqSlider').value);
    const duration = parseFloat(document.getElementById('durationSlider').value);
    const volume = parseInt(document.getElementById('volumeSlider').value) / 100;

    playTone(frequency, duration, waveform, volume);
}

function generateEffectBuffer(effectId) {
    const sampleRate = 44100;
    let duration, generateSamples;

    switch (effectId) {
        case 'beep':
            duration = 0.15;
            generateSamples = (t) => Math.sin(2 * Math.PI * 880 * t) * Math.exp(-t * 10);
            break;
        case 'success':
            duration = 0.4;
            generateSamples = (t) => {
                if (t < 0.1) return Math.sin(2 * Math.PI * 523 * t) * 0.3;
                if (t < 0.2) return Math.sin(2 * Math.PI * 659 * t) * 0.3;
                return Math.sin(2 * Math.PI * 784 * t) * 0.3 * Math.exp(-(t - 0.2) * 5);
            };
            break;
        default:
            duration = 0.3;
            generateSamples = (t) => Math.sin(2 * Math.PI * 440 * t) * Math.exp(-t * 5);
    }

    const numSamples = Math.floor(sampleRate * duration);
    const samples = new Float32Array(numSamples);

    for (let i = 0; i < numSamples; i++) {
        samples[i] = generateSamples(i / sampleRate);
    }

    return { samples, sampleRate };
}

function generateCustomBuffer() {
    const waveform = document.getElementById('waveformSelect').value;
    const frequency = parseInt(document.getElementById('freqSlider').value);
    const duration = parseFloat(document.getElementById('durationSlider').value);
    const volume = parseInt(document.getElementById('volumeSlider').value) / 100;

    const sampleRate = 44100;
    const numSamples = Math.floor(sampleRate * duration);
    const samples = new Float32Array(numSamples);

    for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        const envelope = Math.exp(-t * 3);
        let sample;

        switch (waveform) {
            case 'sine':
                sample = Math.sin(2 * Math.PI * frequency * t);
                break;
            case 'square':
                sample = Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1;
                break;
            case 'sawtooth':
                sample = 2 * ((frequency * t) % 1) - 1;
                break;
            case 'triangle':
                sample = 4 * Math.abs((frequency * t) % 1 - 0.5) - 1;
                break;
        }

        samples[i] = sample * envelope * volume;
    }

    return { samples, sampleRate };
}

function downloadEffect(effectId) {
    const { samples, sampleRate } = generateEffectBuffer(effectId);
    downloadWav(samples, sampleRate, `${effectId}.wav`);
}

function downloadCustomEffect() {
    const { samples, sampleRate } = generateCustomBuffer();
    downloadWav(samples, sampleRate, 'custom-effect.wav');
}

function downloadWav(samples, sampleRate, filename) {
    const numChannels = 1;
    const bitsPerSample = 16;
    const bytesPerSample = bitsPerSample / 8;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = samples.length * bytesPerSample;
    const fileSize = 44 + dataSize;

    const buffer = new ArrayBuffer(fileSize);
    const view = new DataView(buffer);

    // WAV header
    const writeString = (offset, str) => {
        for (let i = 0; i < str.length; i++) {
            view.setUint8(offset + i, str.charCodeAt(i));
        }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, fileSize - 8, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    // Write samples
    let offset = 44;
    for (let i = 0; i < samples.length; i++) {
        const sample = Math.max(-1, Math.min(1, samples[i]));
        view.setInt16(offset, sample * 32767, true);
        offset += 2;
    }

    const blob = new Blob([buffer], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

init();
