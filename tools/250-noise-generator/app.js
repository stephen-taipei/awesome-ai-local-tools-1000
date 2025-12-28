/**
 * Noise Generator - Tool #250
 * Generate white, pink, brown noise
 */

let currentLang = 'zh';
let audioContext = null;
let noiseNode = null;
let gainNode = null;
let analyser = null;
let isPlaying = false;
let animationId = null;
let currentNoiseType = 'white';

const texts = {
    zh: {
        title: '噪音產生器',
        subtitle: '產生白噪音、粉紅噪音、棕噪音',
        privacy: '100% 本地處理 · 零資料上傳',
        white: '白噪音',
        whiteDesc: '所有頻率等強度',
        pink: '粉紅噪音',
        pinkDesc: '自然平衡頻譜',
        brown: '棕噪音',
        brownDesc: '深沉低頻',
        volume: '音量',
        duration: '時長',
        seconds: '秒',
        play: '▶️ 播放',
        stop: '⏹️ 停止',
        download: '⬇️ 下載音訊檔'
    },
    en: {
        title: 'Noise Generator',
        subtitle: 'Generate white, pink, brown noise',
        privacy: '100% Local Processing · No Data Upload',
        white: 'White Noise',
        whiteDesc: 'Equal intensity all frequencies',
        pink: 'Pink Noise',
        pinkDesc: 'Naturally balanced spectrum',
        brown: 'Brown Noise',
        brownDesc: 'Deep low frequencies',
        volume: 'Volume',
        duration: 'Duration',
        seconds: 'sec',
        play: '▶️ Play',
        stop: '⏹️ Stop',
        download: '⬇️ Download Audio'
    }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));

    document.querySelectorAll('.noise-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentNoiseType = btn.dataset.type;
            document.querySelectorAll('.noise-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (isPlaying) {
                stopNoise();
                playNoise();
            }
        });
    });

    document.getElementById('volumeSlider').addEventListener('input', (e) => {
        document.getElementById('volumeValue').textContent = e.target.value + '%';
        if (gainNode) {
            gainNode.gain.value = e.target.value / 100;
        }
    });

    document.getElementById('durationSlider').addEventListener('input', (e) => {
        document.getElementById('durationValue').textContent = e.target.value + ' ' + texts[currentLang].seconds;
    });

    document.getElementById('playBtn').addEventListener('click', togglePlay);
    document.getElementById('downloadBtn').addEventListener('click', downloadNoise);

    drawVisualizerIdle();
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');

    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;

    const noiseBtns = document.querySelectorAll('.noise-btn');
    noiseBtns[0].querySelector('.noise-name').textContent = t.white;
    noiseBtns[0].querySelector('.noise-desc').textContent = t.whiteDesc;
    noiseBtns[1].querySelector('.noise-name').textContent = t.pink;
    noiseBtns[1].querySelector('.noise-desc').textContent = t.pinkDesc;
    noiseBtns[2].querySelector('.noise-name').textContent = t.brown;
    noiseBtns[2].querySelector('.noise-desc').textContent = t.brownDesc;

    document.querySelectorAll('.control-group label')[0].textContent = t.volume;
    document.querySelectorAll('.control-group label')[1].textContent = t.duration;
    document.getElementById('durationValue').textContent =
        document.getElementById('durationSlider').value + ' ' + t.seconds;

    document.getElementById('playBtn').textContent = isPlaying ? t.stop : t.play;
    document.getElementById('downloadBtn').textContent = t.download;
}

function togglePlay() {
    if (isPlaying) {
        stopNoise();
    } else {
        playNoise();
    }
}

function playNoise() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    const bufferSize = 2 * audioContext.sampleRate;
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    generateNoise(output, currentNoiseType);

    noiseNode = audioContext.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    noiseNode.loop = true;

    gainNode = audioContext.createGain();
    gainNode.gain.value = document.getElementById('volumeSlider').value / 100;

    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;

    noiseNode.connect(gainNode);
    gainNode.connect(analyser);
    analyser.connect(audioContext.destination);

    noiseNode.start();
    isPlaying = true;
    document.getElementById('playBtn').textContent = texts[currentLang].stop;
    document.getElementById('playBtn').classList.add('playing');

    drawVisualizer();
}

function stopNoise() {
    if (noiseNode) {
        noiseNode.stop();
        noiseNode = null;
    }
    if (audioContext) {
        audioContext.close();
        audioContext = null;
    }
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    isPlaying = false;
    document.getElementById('playBtn').textContent = texts[currentLang].play;
    document.getElementById('playBtn').classList.remove('playing');
    drawVisualizerIdle();
}

function generateNoise(output, type) {
    switch (type) {
        case 'white':
            for (let i = 0; i < output.length; i++) {
                output[i] = Math.random() * 2 - 1;
            }
            break;
        case 'pink':
            let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
            for (let i = 0; i < output.length; i++) {
                const white = Math.random() * 2 - 1;
                b0 = 0.99886 * b0 + white * 0.0555179;
                b1 = 0.99332 * b1 + white * 0.0750759;
                b2 = 0.96900 * b2 + white * 0.1538520;
                b3 = 0.86650 * b3 + white * 0.3104856;
                b4 = 0.55000 * b4 + white * 0.5329522;
                b5 = -0.7616 * b5 - white * 0.0168980;
                output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
                b6 = white * 0.115926;
            }
            break;
        case 'brown':
            let lastOut = 0;
            for (let i = 0; i < output.length; i++) {
                const white = Math.random() * 2 - 1;
                output[i] = (lastOut + (0.02 * white)) / 1.02;
                lastOut = output[i];
                output[i] *= 3.5;
            }
            break;
    }
}

function drawVisualizer() {
    const canvas = document.getElementById('visualizer');
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = 100 * 2;

    const width = canvas.width;
    const height = canvas.height;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
        animationId = requestAnimationFrame(draw);

        analyser.getByteFrequencyData(dataArray);

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);

        const barWidth = (width / bufferLength) * 2.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * height;

            const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
            gradient.addColorStop(0, '#a855f7');
            gradient.addColorStop(1, '#c084fc');

            ctx.fillStyle = gradient;
            ctx.fillRect(x, height - barHeight, barWidth, barHeight);

            x += barWidth + 1;
        }
    }

    draw();
}

function drawVisualizerIdle() {
    const canvas = document.getElementById('visualizer');
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = 100 * 2;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
}

function downloadNoise() {
    const duration = parseFloat(document.getElementById('durationSlider').value);
    const sampleRate = 44100;
    const length = Math.floor(duration * sampleRate);

    const offlineCtx = new OfflineAudioContext(1, length, sampleRate);
    const buffer = offlineCtx.createBuffer(1, length, sampleRate);
    const output = buffer.getChannelData(0);

    generateNoise(output, currentNoiseType);

    // Apply volume
    const volume = document.getElementById('volumeSlider').value / 100;
    for (let i = 0; i < output.length; i++) {
        output[i] *= volume;
    }

    const wavBlob = bufferToWav(buffer);

    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentNoiseType}-noise-${duration}s.wav`;
    a.click();
    URL.revokeObjectURL(url);
}

function bufferToWav(buffer) {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1;
    const bitDepth = 16;

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;

    const samples = buffer.length;
    const dataSize = samples * blockAlign;
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
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    const channels = [];
    for (let i = 0; i < numChannels; i++) {
        channels.push(buffer.getChannelData(i));
    }

    let offset = 44;
    for (let i = 0; i < samples; i++) {
        for (let ch = 0; ch < numChannels; ch++) {
            const sample = Math.max(-1, Math.min(1, channels[ch][i]));
            view.setInt16(offset, sample * 32767, true);
            offset += 2;
        }
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
}

init();
