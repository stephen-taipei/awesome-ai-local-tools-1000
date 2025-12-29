/**
 * Audio Delay - Tool #345
 * Add delay and echo effects
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let processedBuffer = null;

const texts = {
    zh: {
        title: '音頻延遲',
        subtitle: '添加延遲與迴音效果',
        privacy: '100% 本地處理 · 零資料上傳',
        type: '類型',
        typeMono: '單聲道延遲',
        typeStereo: '立體聲乒乓',
        typeMulti: '多重回聲',
        time: '延遲時間',
        feedback: '回授',
        filter: '高切',
        mix: '混合',
        process: '🔄 處理音頻',
        download: '⬇️ 下載',
        result: '處理結果',
        upload: '拖放音頻檔案至此或點擊上傳',
        uploadHint: '支援 MP3, WAV, OGG, M4A',
        processing: '處理中...'
    },
    en: {
        title: 'Audio Delay',
        subtitle: 'Add delay and echo effects',
        privacy: '100% Local Processing · No Data Upload',
        type: 'Type',
        typeMono: 'Mono Delay',
        typeStereo: 'Stereo Ping-Pong',
        typeMulti: 'Multi-tap Echo',
        time: 'Delay Time',
        feedback: 'Feedback',
        filter: 'High Cut',
        mix: 'Mix',
        process: '🔄 Process',
        download: '⬇️ Download',
        result: 'Result',
        upload: 'Drop audio file here or click to upload',
        uploadHint: 'Supports MP3, WAV, OGG, M4A',
        processing: 'Processing...'
    }
};

function init() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    setupFileUpload();
    setupControls();
    document.getElementById('processBtn').addEventListener('click', processAudio);
    document.getElementById('downloadBtn').addEventListener('click', downloadAudio);
}

function setupFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('drag-over'); });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));
    uploadArea.addEventListener('drop', (e) => { e.preventDefault(); uploadArea.classList.remove('drag-over'); if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]); });
    fileInput.addEventListener('change', (e) => { if (e.target.files.length) handleFile(e.target.files[0]); });
}

function setupControls() {
    document.getElementById('delayTime').addEventListener('input', (e) => {
        document.getElementById('timeValue').textContent = e.target.value + ' ms';
    });
    document.getElementById('feedback').addEventListener('input', (e) => {
        document.getElementById('feedbackValue').textContent = e.target.value + '%';
    });
    document.getElementById('filter').addEventListener('input', (e) => {
        document.getElementById('filterValue').textContent = e.target.value + ' Hz';
    });
    document.getElementById('mix').addEventListener('input', (e) => {
        document.getElementById('mixValue').textContent = e.target.value + '%';
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
    document.getElementById('typeLabel').textContent = t.type;
    const typeSelect = document.getElementById('delayType');
    typeSelect.options[0].text = t.typeMono;
    typeSelect.options[1].text = t.typeStereo;
    typeSelect.options[2].text = t.typeMulti;
    document.getElementById('timeLabel').textContent = t.time;
    document.getElementById('feedbackLabel').textContent = t.feedback;
    document.getElementById('filterLabel').textContent = t.filter;
    document.getElementById('mixLabel').textContent = t.mix;
    document.getElementById('processBtn').textContent = t.process;
    document.getElementById('downloadBtn').textContent = t.download;
    document.getElementById('resultTitle').textContent = t.result;
    document.querySelector('.upload-area p').textContent = t.upload;
    document.querySelector('.upload-hint').textContent = t.uploadHint;
}

async function handleFile(file) {
    const arrayBuffer = await file.arrayBuffer();
    originalBuffer = await audioContext.decodeAudioData(arrayBuffer);

    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('audioLoaded').style.display = 'block';
    document.getElementById('fileInfo').textContent = `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
    document.getElementById('originalAudio').src = URL.createObjectURL(file);

    document.getElementById('optionsSection').style.display = 'block';
    document.getElementById('actionSection').style.display = 'flex';
}

// Simple one-pole low-pass filter
function applyLowPass(data, sampleRate, cutoff) {
    const rc = 1.0 / (cutoff * 2 * Math.PI);
    const dt = 1.0 / sampleRate;
    const alpha = dt / (rc + dt);
    let prev = 0;
    for (let i = 0; i < data.length; i++) {
        data[i] = prev + alpha * (data[i] - prev);
        prev = data[i];
    }
}

async function processAudio() {
    if (!originalBuffer) return;
    const processBtn = document.getElementById('processBtn');
    const originalText = processBtn.textContent;
    processBtn.textContent = texts[currentLang].processing;
    processBtn.disabled = true;
    await new Promise(resolve => setTimeout(resolve, 10));

    const delayType = document.getElementById('delayType').value;
    const delayTimeMs = parseInt(document.getElementById('delayTime').value);
    const feedback = parseInt(document.getElementById('feedback').value) / 100;
    const filterFreq = parseInt(document.getElementById('filter').value);
    const mix = parseInt(document.getElementById('mix').value) / 100;

    const sampleRate = originalBuffer.sampleRate;
    const delaySamples = Math.floor((delayTimeMs / 1000) * sampleRate);

    // Extend buffer to accommodate delay tails
    const tailSamples = Math.floor(delaySamples * 5);
    const newLength = originalBuffer.length + tailSamples;

    // Always output stereo for stereo ping-pong effect
    const outChannels = delayType === 'stereo' ? 2 : originalBuffer.numberOfChannels;
    processedBuffer = audioContext.createBuffer(outChannels, newLength, sampleRate);

    if (delayType === 'mono') {
        for (let ch = 0; ch < originalBuffer.numberOfChannels; ch++) {
            const inputData = originalBuffer.getChannelData(ch);
            const outputData = processedBuffer.getChannelData(Math.min(ch, outChannels - 1));

            const delayBuffer = new Float32Array(delaySamples);
            let delayIndex = 0;

            for (let i = 0; i < newLength; i++) {
                const dry = i < inputData.length ? inputData[i] : 0;
                const delayed = delayBuffer[delayIndex];

                // Apply low-pass filter to delayed signal
                const filteredDelay = delayed;

                // Write to delay buffer with feedback
                delayBuffer[delayIndex] = dry + filteredDelay * feedback;
                delayIndex = (delayIndex + 1) % delaySamples;

                outputData[i] = dry * (1 - mix) + filteredDelay * mix;
            }

            // Apply filter to output
            applyLowPass(outputData, sampleRate, filterFreq);
        }
    } else if (delayType === 'stereo') {
        // Ping-pong delay between L and R
        const leftData = processedBuffer.getChannelData(0);
        const rightData = processedBuffer.getChannelData(1);

        const leftInput = originalBuffer.getChannelData(0);
        const rightInput = originalBuffer.numberOfChannels > 1
            ? originalBuffer.getChannelData(1)
            : originalBuffer.getChannelData(0);

        const leftBuffer = new Float32Array(delaySamples);
        const rightBuffer = new Float32Array(delaySamples);
        let leftIndex = 0;
        let rightIndex = 0;

        for (let i = 0; i < newLength; i++) {
            const dryL = i < leftInput.length ? leftInput[i] : 0;
            const dryR = i < rightInput.length ? rightInput[i] : 0;

            const delayedL = leftBuffer[leftIndex];
            const delayedR = rightBuffer[rightIndex];

            // Ping-pong: left delay feeds into right, right feeds into left
            leftBuffer[leftIndex] = dryL + delayedR * feedback;
            rightBuffer[rightIndex] = dryR + delayedL * feedback;

            leftIndex = (leftIndex + 1) % delaySamples;
            rightIndex = (rightIndex + 1) % delaySamples;

            leftData[i] = dryL * (1 - mix) + delayedL * mix;
            rightData[i] = dryR * (1 - mix) + delayedR * mix;
        }

        applyLowPass(leftData, sampleRate, filterFreq);
        applyLowPass(rightData, sampleRate, filterFreq);
    } else if (delayType === 'multi') {
        // Multi-tap delay with different delay times
        const taps = [
            { delay: delaySamples, gain: 0.6 },
            { delay: Math.floor(delaySamples * 0.75), gain: 0.4 },
            { delay: Math.floor(delaySamples * 0.5), gain: 0.3 },
            { delay: Math.floor(delaySamples * 0.25), gain: 0.2 }
        ];

        for (let ch = 0; ch < originalBuffer.numberOfChannels; ch++) {
            const inputData = originalBuffer.getChannelData(ch);
            const outputData = processedBuffer.getChannelData(Math.min(ch, outChannels - 1));

            const maxDelay = delaySamples + 10;
            const delayBuffer = new Float32Array(maxDelay);
            let writeIndex = 0;

            for (let i = 0; i < newLength; i++) {
                const dry = i < inputData.length ? inputData[i] : 0;

                let wetSignal = 0;
                for (const tap of taps) {
                    const readIndex = (writeIndex - tap.delay + maxDelay) % maxDelay;
                    wetSignal += delayBuffer[readIndex] * tap.gain;
                }

                delayBuffer[writeIndex] = dry + wetSignal * feedback;
                writeIndex = (writeIndex + 1) % maxDelay;

                outputData[i] = dry * (1 - mix) + wetSignal * mix;
            }

            applyLowPass(outputData, sampleRate, filterFreq);
        }
    }

    const blob = bufferToWav(processedBuffer);
    document.getElementById('resultSection').style.display = 'block';
    document.getElementById('processedAudio').src = URL.createObjectURL(blob);
    document.getElementById('downloadBtn').disabled = false;
    processBtn.textContent = originalText;
    processBtn.disabled = false;
}

function downloadAudio() {
    if (!processedBuffer) return;
    const blob = bufferToWav(processedBuffer);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'delayed-audio.wav';
    a.click();
}

function bufferToWav(buffer) {
    const numChannels = buffer.numberOfChannels, sampleRate = buffer.sampleRate;
    const bytesPerSample = 2, blockAlign = numChannels * bytesPerSample;
    const dataSize = buffer.length * blockAlign, bufferSize = 44 + dataSize;
    const arrayBuffer = new ArrayBuffer(bufferSize);
    const view = new DataView(arrayBuffer);
    const writeString = (o, s) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); };
    writeString(0, 'RIFF'); view.setUint32(4, bufferSize - 8, true); writeString(8, 'WAVE'); writeString(12, 'fmt ');
    view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true); view.setUint16(34, 16, true); writeString(36, 'data'); view.setUint32(40, dataSize, true);
    const channels = []; for (let i = 0; i < numChannels; i++) channels.push(buffer.getChannelData(i));
    let offset = 44;
    for (let i = 0; i < buffer.length; i++) { for (let ch = 0; ch < numChannels; ch++) { view.setInt16(offset, Math.max(-1, Math.min(1, channels[ch][i])) * 32767, true); offset += 2; } }
    return new Blob([arrayBuffer], { type: 'audio/wav' });
}

init();
