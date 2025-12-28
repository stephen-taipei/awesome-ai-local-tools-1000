/**
 * Audio Karaoke Maker - Tool #280
 * Create karaoke tracks from songs
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let sourceNode = null;
let isPlaying = false;
let fileName = '';

const texts = {
    zh: {
        title: '卡拉OK製作',
        subtitle: '製作卡拉OK伴奏音軌',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '點擊或拖放音訊檔案',
        uploadHint: '支援 MP3, WAV, OGG 等格式（需為立體聲）',
        mode: '模式',
        vocal: '人聲衰減',
        bass: '低音保護',
        reverb: '殘響增強',
        preview: '▶️ 預覽',
        stop: '⏹️ 停止',
        download: '⬇️ 下載',
        instrumental: '純伴奏',
        karaoke: '卡拉OK'
    },
    en: {
        title: 'Karaoke Maker',
        subtitle: 'Create karaoke backing tracks',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Click or drop audio file',
        uploadHint: 'Supports MP3, WAV, OGG formats (stereo required)',
        mode: 'Mode',
        vocal: 'Vocal Reduction',
        bass: 'Bass Protection',
        reverb: 'Reverb',
        preview: '▶️ Preview',
        stop: '⏹️ Stop',
        download: '⬇️ Download',
        instrumental: 'Instrumental',
        karaoke: 'Karaoke'
    }
};

function init() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));

    const uploadArea = document.getElementById('uploadArea');
    const audioInput = document.getElementById('audioInput');

    uploadArea.addEventListener('click', () => audioInput.click());
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
    });
    audioInput.addEventListener('change', (e) => {
        if (e.target.files.length) handleFile(e.target.files[0]);
    });

    document.getElementById('vocalSlider').addEventListener('input', (e) => {
        document.getElementById('vocalValue').textContent = e.target.value + '%';
    });

    document.getElementById('bassSlider').addEventListener('input', (e) => {
        document.getElementById('bassValue').textContent = e.target.value + ' Hz';
    });

    document.getElementById('reverbSlider').addEventListener('input', (e) => {
        document.getElementById('reverbValue').textContent = e.target.value + '%';
    });

    document.getElementById('previewBtn').addEventListener('click', togglePreview);
    document.getElementById('downloadBtn').addEventListener('click', downloadKaraoke);
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');

    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;

    document.querySelector('.upload-text').textContent = t.upload;
    document.querySelector('.upload-hint').textContent = t.uploadHint;

    document.querySelectorAll('.option-group label')[0].textContent = t.mode;
    document.querySelectorAll('.option-group label')[1].textContent = t.vocal;
    document.querySelectorAll('.option-group label')[2].textContent = t.bass;
    document.querySelectorAll('.option-group label')[3].textContent = t.reverb;

    const select = document.getElementById('modeSelect');
    select.options[0].textContent = t.instrumental;
    select.options[1].textContent = t.karaoke;

    document.getElementById('previewBtn').textContent = isPlaying ? t.stop : t.preview;
    document.getElementById('downloadBtn').textContent = t.download;
}

async function handleFile(file) {
    fileName = file.name.replace(/\.[^/.]+$/, '');

    const arrayBuffer = await file.arrayBuffer();
    originalBuffer = await audioContext.decodeAudioData(arrayBuffer);

    document.getElementById('editorSection').style.display = 'block';
}

function makeKaraoke(buffer) {
    const mode = document.getElementById('modeSelect').value;
    const vocalReduction = parseInt(document.getElementById('vocalSlider').value) / 100;
    const bassProtect = parseFloat(document.getElementById('bassSlider').value);
    const reverbAmount = parseInt(document.getElementById('reverbSlider').value) / 100;

    const sampleRate = buffer.sampleRate;

    if (buffer.numberOfChannels < 2) {
        return buffer;
    }

    const outputBuffer = audioContext.createBuffer(2, buffer.length, sampleRate);

    const leftInput = buffer.getChannelData(0);
    const rightInput = buffer.getChannelData(1);
    const leftOutput = outputBuffer.getChannelData(0);
    const rightOutput = outputBuffer.getChannelData(1);

    // High-pass filter to protect bass
    const w0 = 2 * Math.PI * bassProtect / sampleRate;
    const alpha = Math.sin(w0) / 2;
    const hpB0 = (1 + Math.cos(w0)) / 2 / (1 + alpha);
    const hpB1 = -(1 + Math.cos(w0)) / (1 + alpha);
    const hpB2 = (1 + Math.cos(w0)) / 2 / (1 + alpha);
    const hpA1 = -2 * Math.cos(w0) / (1 + alpha);
    const hpA2 = (1 - alpha) / (1 + alpha);

    // Simple reverb delay lines
    const reverbDelay1 = Math.floor(sampleRate * 0.03);
    const reverbDelay2 = Math.floor(sampleRate * 0.05);
    const reverbBuffer1 = new Float32Array(reverbDelay1);
    const reverbBuffer2 = new Float32Array(reverbDelay2);
    let reverbIdx1 = 0, reverbIdx2 = 0;

    // Filter states
    let hpX1L = 0, hpX2L = 0, hpY1L = 0, hpY2L = 0;
    let hpX1R = 0, hpX2R = 0, hpY1R = 0, hpY2R = 0;

    for (let i = 0; i < buffer.length; i++) {
        // Calculate center (vocal) and sides
        const mid = (leftInput[i] + rightInput[i]) * 0.5;
        const side = (leftInput[i] - rightInput[i]) * 0.5;

        // High-pass filter the center to get vocal frequencies
        const hpMid = hpB0 * mid + hpB1 * hpX1L + hpB2 * hpX2L - hpA1 * hpY1L - hpA2 * hpY2L;
        hpX2L = hpX1L;
        hpX1L = mid;
        hpY2L = hpY1L;
        hpY1L = hpMid;

        // Reduce vocals
        const reducedMid = mid - hpMid * vocalReduction;

        // Reconstruct stereo
        let left = reducedMid + side;
        let right = reducedMid - side;

        // Add reverb for karaoke mode
        if (mode === 'karaoke' && reverbAmount > 0) {
            const reverb1 = reverbBuffer1[reverbIdx1];
            const reverb2 = reverbBuffer2[reverbIdx2];

            reverbBuffer1[reverbIdx1] = left * 0.3;
            reverbBuffer2[reverbIdx2] = right * 0.3;

            left += reverb1 * reverbAmount;
            right += reverb2 * reverbAmount;

            reverbIdx1 = (reverbIdx1 + 1) % reverbDelay1;
            reverbIdx2 = (reverbIdx2 + 1) % reverbDelay2;
        }

        leftOutput[i] = left;
        rightOutput[i] = right;
    }

    // Normalize
    let max = 0;
    for (let i = 0; i < buffer.length; i++) {
        max = Math.max(max, Math.abs(leftOutput[i]), Math.abs(rightOutput[i]));
    }
    if (max > 1) {
        for (let i = 0; i < buffer.length; i++) {
            leftOutput[i] /= max;
            rightOutput[i] /= max;
        }
    }

    return outputBuffer;
}

function togglePreview() {
    if (isPlaying) {
        stopPreview();
    } else {
        startPreview();
    }
}

async function startPreview() {
    if (!originalBuffer) return;

    await audioContext.resume();
    isPlaying = true;
    document.getElementById('previewBtn').textContent = texts[currentLang].stop;

    const karaokeBuffer = makeKaraoke(originalBuffer);

    sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = karaokeBuffer;
    sourceNode.connect(audioContext.destination);

    sourceNode.onended = () => {
        isPlaying = false;
        document.getElementById('previewBtn').textContent = texts[currentLang].preview;
    };

    sourceNode.start(0);
}

function stopPreview() {
    if (sourceNode) {
        sourceNode.stop();
        sourceNode = null;
    }
    isPlaying = false;
    document.getElementById('previewBtn').textContent = texts[currentLang].preview;
}

async function downloadKaraoke() {
    if (!originalBuffer) return;

    const karaokeBuffer = makeKaraoke(originalBuffer);
    const wavBlob = bufferToWav(karaokeBuffer);

    const mode = document.getElementById('modeSelect').value;
    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}-${mode}.wav`;
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
