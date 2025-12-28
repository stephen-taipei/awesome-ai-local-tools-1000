/**
 * Audio Noise Generator - Tool #299
 * Generate various types of noise
 */

let currentLang = 'zh';
let audioContext = null;
let noiseNode = null;
let gainNode = null;
let isPlaying = false;
let selectedType = 'white';

const texts = {
    zh: {
        title: '音訊噪音產生器',
        subtitle: '產生各種類型的噪音信號',
        privacy: '100% 本地處理 · 零資料上傳',
        volume: '音量',
        duration: '持續時間',
        play: '▶️ 播放',
        stop: '⏹️ 停止',
        download: '⬇️ 下載',
        white: '白噪音',
        pink: '粉紅噪音',
        brown: '棕噪音',
        whiteInfo: '白噪音包含所有頻率，適合遮蔽環境噪音和幫助專注。',
        pinkInfo: '粉紅噪音的低頻較強，聽起來更自然，適合放鬆和睡眠。',
        brownInfo: '棕噪音（紅噪音）以低頻為主，像是風聲或瀑布聲。',
        seconds: '秒'
    },
    en: {
        title: 'Noise Generator',
        subtitle: 'Generate various types of noise',
        privacy: '100% Local Processing · No Data Upload',
        volume: 'Volume',
        duration: 'Duration',
        play: '▶️ Play',
        stop: '⏹️ Stop',
        download: '⬇️ Download',
        white: 'White Noise',
        pink: 'Pink Noise',
        brown: 'Brown Noise',
        whiteInfo: 'White noise contains all frequencies equally. Great for masking sounds and focus.',
        pinkInfo: 'Pink noise has stronger bass, sounds more natural. Good for relaxation and sleep.',
        brownInfo: 'Brown (red) noise is dominated by low frequencies, like wind or waterfall.',
        seconds: 's'
    }
};

function init() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));

    document.querySelectorAll('.noise-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.noise-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedType = btn.dataset.type;
            updateInfo();

            if (isPlaying) {
                stopNoise();
                playNoise();
            }
        });
    });

    document.getElementById('volumeSlider').addEventListener('input', (e) => {
        document.getElementById('volumeValue').textContent = e.target.value + '%';
        if (gainNode) gainNode.gain.value = e.target.value / 100;
    });

    document.getElementById('durationSlider').addEventListener('input', (e) => {
        const unit = currentLang === 'zh' ? '秒' : 's';
        document.getElementById('durationValue').textContent = e.target.value + ' ' + unit;
    });

    document.getElementById('playBtn').addEventListener('click', togglePlay);
    document.getElementById('downloadBtn').addEventListener('click', downloadNoise);

    updateInfo();
}

function updateInfo() {
    const t = texts[currentLang];
    const info = {
        white: t.whiteInfo,
        pink: t.pinkInfo,
        brown: t.brownInfo
    };
    document.getElementById('noiseInfo').textContent = info[selectedType];
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
    labels[0].textContent = t.volume;
    labels[1].textContent = t.duration;

    document.querySelectorAll('.noise-name')[0].textContent = t.white;
    document.querySelectorAll('.noise-name')[1].textContent = t.pink;
    document.querySelectorAll('.noise-name')[2].textContent = t.brown;

    const unit = lang === 'zh' ? '秒' : 's';
    document.getElementById('durationValue').textContent = document.getElementById('durationSlider').value + ' ' + unit;

    document.getElementById('playBtn').textContent = isPlaying ? t.stop : t.play;
    document.getElementById('downloadBtn').textContent = t.download;

    updateInfo();
}

function generateNoise(type, length, sampleRate) {
    const buffer = new Float32Array(length);

    if (type === 'white') {
        for (let i = 0; i < length; i++) {
            buffer[i] = Math.random() * 2 - 1;
        }
    } else if (type === 'pink') {
        // Pink noise using Voss-McCartney algorithm
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < length; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            buffer[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
            b6 = white * 0.115926;
        }
    } else if (type === 'brown') {
        // Brown noise (random walk)
        let lastOut = 0;
        for (let i = 0; i < length; i++) {
            const white = Math.random() * 2 - 1;
            lastOut = (lastOut + (0.02 * white)) / 1.02;
            buffer[i] = lastOut * 3.5;
        }
    }

    return buffer;
}

function togglePlay() {
    if (isPlaying) {
        stopNoise();
    } else {
        playNoise();
    }
}

async function playNoise() {
    await audioContext.resume();

    const sampleRate = audioContext.sampleRate;
    const bufferSize = sampleRate * 2; // 2 second buffer

    const audioBuffer = audioContext.createBuffer(1, bufferSize, sampleRate);
    const channelData = audioBuffer.getChannelData(0);
    const noiseData = generateNoise(selectedType, bufferSize, sampleRate);

    for (let i = 0; i < bufferSize; i++) {
        channelData[i] = noiseData[i];
    }

    noiseNode = audioContext.createBufferSource();
    noiseNode.buffer = audioBuffer;
    noiseNode.loop = true;

    gainNode = audioContext.createGain();
    gainNode.gain.value = parseInt(document.getElementById('volumeSlider').value) / 100;

    noiseNode.connect(gainNode);
    gainNode.connect(audioContext.destination);

    noiseNode.start();
    isPlaying = true;
    document.getElementById('playBtn').textContent = texts[currentLang].stop;
}

function stopNoise() {
    if (noiseNode) {
        noiseNode.stop();
        noiseNode.disconnect();
        noiseNode = null;
    }
    if (gainNode) {
        gainNode.disconnect();
        gainNode = null;
    }
    isPlaying = false;
    document.getElementById('playBtn').textContent = texts[currentLang].play;
}

function downloadNoise() {
    const volume = parseInt(document.getElementById('volumeSlider').value) / 100;
    const duration = parseInt(document.getElementById('durationSlider').value);
    const sampleRate = 44100;
    const length = sampleRate * duration;

    const noiseData = generateNoise(selectedType, length, sampleRate);

    // Apply volume
    for (let i = 0; i < length; i++) {
        noiseData[i] *= volume;
    }

    const wavBlob = createWav(noiseData, sampleRate);
    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedType}-noise-${duration}s.wav`;
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
