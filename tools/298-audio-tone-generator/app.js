/**
 * Audio Tone Generator - Tool #298
 * Generate audio tones and signals
 */

let currentLang = 'zh';
let audioContext = null;
let oscillator = null;
let gainNode = null;
let isPlaying = false;

const texts = {
    zh: {
        title: '音訊音調產生器',
        subtitle: '產生各種音調和信號',
        privacy: '100% 本地處理 · 零資料上傳',
        waveform: '波形類型',
        frequency: '頻率',
        volume: '音量',
        duration: '持續時間',
        presets: '快速設定',
        play: '▶️ 播放',
        stop: '⏹️ 停止',
        download: '⬇️ 下載',
        sine: '正弦波',
        square: '方波',
        sawtooth: '鋸齒波',
        triangle: '三角波',
        seconds: '秒'
    },
    en: {
        title: 'Tone Generator',
        subtitle: 'Generate audio tones and signals',
        privacy: '100% Local Processing · No Data Upload',
        waveform: 'Waveform',
        frequency: 'Frequency',
        volume: 'Volume',
        duration: 'Duration',
        presets: 'Presets',
        play: '▶️ Play',
        stop: '⏹️ Stop',
        download: '⬇️ Download',
        sine: 'Sine',
        square: 'Square',
        sawtooth: 'Sawtooth',
        triangle: 'Triangle',
        seconds: 's'
    }
};

function init() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));

    document.getElementById('freqSlider').addEventListener('input', (e) => {
        document.getElementById('freqValue').textContent = e.target.value + ' Hz';
        updatePresetButtons(parseFloat(e.target.value));
        if (oscillator) oscillator.frequency.value = parseFloat(e.target.value);
    });

    document.getElementById('volumeSlider').addEventListener('input', (e) => {
        document.getElementById('volumeValue').textContent = e.target.value + '%';
        if (gainNode) gainNode.gain.value = e.target.value / 100;
    });

    document.getElementById('durationSlider').addEventListener('input', (e) => {
        const unit = currentLang === 'zh' ? '秒' : 's';
        document.getElementById('durationValue').textContent = e.target.value + ' ' + unit;
    });

    document.getElementById('waveformSelect').addEventListener('change', (e) => {
        if (oscillator) oscillator.type = e.target.value;
    });

    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const freq = parseFloat(btn.dataset.freq);
            document.getElementById('freqSlider').value = freq;
            document.getElementById('freqValue').textContent = freq.toFixed(2) + ' Hz';
            updatePresetButtons(freq);
            if (oscillator) oscillator.frequency.value = freq;
        });
    });

    document.getElementById('playBtn').addEventListener('click', togglePlay);
    document.getElementById('downloadBtn').addEventListener('click', downloadTone);
}

function updatePresetButtons(freq) {
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.classList.toggle('active', Math.abs(parseFloat(btn.dataset.freq) - freq) < 1);
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

    const labels = document.querySelectorAll('.option-group label');
    labels[0].textContent = t.waveform;
    labels[1].textContent = t.frequency;
    labels[2].textContent = t.volume;
    labels[3].textContent = t.duration;

    document.querySelector('.preset-label').textContent = t.presets;

    const waveSelect = document.getElementById('waveformSelect');
    waveSelect.options[0].textContent = t.sine;
    waveSelect.options[1].textContent = t.square;
    waveSelect.options[2].textContent = t.sawtooth;
    waveSelect.options[3].textContent = t.triangle;

    const unit = lang === 'zh' ? '秒' : 's';
    document.getElementById('durationValue').textContent = document.getElementById('durationSlider').value + ' ' + unit;

    document.getElementById('playBtn').textContent = isPlaying ? t.stop : t.play;
    document.getElementById('downloadBtn').textContent = t.download;
}

function togglePlay() {
    if (isPlaying) {
        stopTone();
    } else {
        playTone();
    }
}

async function playTone() {
    await audioContext.resume();

    const waveform = document.getElementById('waveformSelect').value;
    const frequency = parseFloat(document.getElementById('freqSlider').value);
    const volume = parseInt(document.getElementById('volumeSlider').value) / 100;

    oscillator = audioContext.createOscillator();
    gainNode = audioContext.createGain();

    oscillator.type = waveform;
    oscillator.frequency.value = frequency;
    gainNode.gain.value = volume;

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    isPlaying = true;
    document.getElementById('playBtn').textContent = texts[currentLang].stop;
}

function stopTone() {
    if (oscillator) {
        oscillator.stop();
        oscillator.disconnect();
        oscillator = null;
    }
    if (gainNode) {
        gainNode.disconnect();
        gainNode = null;
    }
    isPlaying = false;
    document.getElementById('playBtn').textContent = texts[currentLang].play;
}

function downloadTone() {
    const waveform = document.getElementById('waveformSelect').value;
    const frequency = parseFloat(document.getElementById('freqSlider').value);
    const volume = parseInt(document.getElementById('volumeSlider').value) / 100;
    const duration = parseFloat(document.getElementById('durationSlider').value);

    const sampleRate = 44100;
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = new Float32Array(numSamples);

    for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        const phase = 2 * Math.PI * frequency * t;

        let sample;
        switch (waveform) {
            case 'sine':
                sample = Math.sin(phase);
                break;
            case 'square':
                sample = Math.sin(phase) > 0 ? 1 : -1;
                break;
            case 'sawtooth':
                sample = 2 * (frequency * t - Math.floor(0.5 + frequency * t));
                break;
            case 'triangle':
                sample = 2 * Math.abs(2 * (frequency * t - Math.floor(frequency * t + 0.5))) - 1;
                break;
            default:
                sample = Math.sin(phase);
        }

        buffer[i] = sample * volume;
    }

    // Create WAV
    const wavBlob = createWav(buffer, sampleRate);
    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tone-${frequency}hz-${waveform}.wav`;
    a.click();
    URL.revokeObjectURL(url);
}

function createWav(samples, sampleRate) {
    const numChannels = 1;
    const bitDepth = 16;
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const dataSize = samples.length * blockAlign;
    const bufferSize = 44 + dataSize;

    const arrayBuffer = new ArrayBuffer(bufferSize);
    const view = new DataView(arrayBuffer);

    const writeString = (offset, string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, bufferSize - 8, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    let offset = 44;
    for (let i = 0; i < samples.length; i++) {
        const sample = Math.max(-1, Math.min(1, samples[i]));
        view.setInt16(offset, sample * 32767, true);
        offset += 2;
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
}

init();
