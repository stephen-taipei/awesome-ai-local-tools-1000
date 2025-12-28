/**
 * Silence Remover - Tool #303
 * Automatically remove silent parts from videos
 */

const translations = {
    en: {
        title: 'Silence Remover',
        subtitle: 'Automatically remove silent parts from your videos',
        privacyBadge: '100% Local Processing - No Upload Required',
        uploadText: 'Drop video here or click to upload',
        uploadHint: 'Supports MP4, WebM, MOV formats',
        silenceThreshold: 'Silence Threshold (dB):',
        minSilence: 'Minimum Silence Duration (s):',
        padding: 'Padding Around Speech (s):',
        originalDuration: 'Original Duration:',
        silenceRemoved: 'Silence Removed:',
        newDuration: 'New Duration:',
        analyze: 'Analyze Audio',
        removeSilence: 'Remove Silence',
        reset: 'Upload New Video',
        analyzing: 'Analyzing audio...',
        processing: 'Processing...',
        download: 'Download Processed Video',
        howItWorks: 'How It Works',
        audioAnalysis: 'Audio Analysis',
        audioAnalysisDesc: 'Analyzes the audio waveform to detect silent sections',
        smartRemoval: 'Smart Removal',
        smartRemovalDesc: 'Removes only the silent parts while keeping speech intact',
        precision: 'Precision Control',
        precisionDesc: 'Adjustable threshold and padding for perfect results',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #303'
    },
    zh: {
        title: '靜音移除器',
        subtitle: '自動移除影片中的靜音部分',
        privacyBadge: '100% 本地處理 - 無需上傳',
        uploadText: '拖放影片到此處或點擊上傳',
        uploadHint: '支援 MP4、WebM、MOV 格式',
        silenceThreshold: '靜音閾值 (dB)：',
        minSilence: '最小靜音時長 (秒)：',
        padding: '語音周圍填充 (秒)：',
        originalDuration: '原始時長：',
        silenceRemoved: '已移除靜音：',
        newDuration: '新時長：',
        analyze: '分析音訊',
        removeSilence: '移除靜音',
        reset: '上傳新影片',
        analyzing: '分析音訊中...',
        processing: '處理中...',
        download: '下載處理後的影片',
        howItWorks: '使用方法',
        audioAnalysis: '音訊分析',
        audioAnalysisDesc: '分析音訊波形以檢測靜音部分',
        smartRemoval: '智能移除',
        smartRemovalDesc: '只移除靜音部分同時保留語音',
        precision: '精確控制',
        precisionDesc: '可調整閾值和填充以獲得完美結果',
        backToHome: '返回首頁',
        toolNumber: '工具 #303'
    }
};

let currentLang = 'en';
let videoFile = null;
let audioContext = null;
let audioBuffer = null;
let speechSegments = [];

const elements = {
    uploadArea: document.getElementById('uploadArea'),
    videoInput: document.getElementById('videoInput'),
    editorArea: document.getElementById('editorArea'),
    videoPlayer: document.getElementById('videoPlayer'),
    waveformCanvas: document.getElementById('waveformCanvas'),
    thresholdLine: document.getElementById('thresholdLine'),
    thresholdSlider: document.getElementById('thresholdSlider'),
    thresholdValue: document.getElementById('thresholdValue'),
    minSilenceSlider: document.getElementById('minSilenceSlider'),
    minSilenceValue: document.getElementById('minSilenceValue'),
    paddingSlider: document.getElementById('paddingSlider'),
    paddingValue: document.getElementById('paddingValue'),
    originalDuration: document.getElementById('originalDuration'),
    silenceRemoved: document.getElementById('silenceRemoved'),
    newDuration: document.getElementById('newDuration'),
    analyzeBtn: document.getElementById('analyzeBtn'),
    removeBtn: document.getElementById('removeBtn'),
    resetBtn: document.getElementById('resetBtn'),
    progressContainer: document.getElementById('progressContainer'),
    progressFill: document.getElementById('progressFill'),
    progressText: document.getElementById('progressText'),
    downloadArea: document.getElementById('downloadArea'),
    resultVideo: document.getElementById('resultVideo'),
    downloadBtn: document.getElementById('downloadBtn')
};

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function t(key) {
    return translations[currentLang][key] || key;
}

function drawWaveform(audioData, threshold) {
    const canvas = elements.waveformCanvas;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth * 2;
    const height = canvas.height = canvas.offsetHeight * 2;

    ctx.fillStyle = '#1e3c72';
    ctx.fillRect(0, 0, width, height);

    const step = Math.floor(audioData.length / width);
    const midY = height / 2;

    // Draw waveform
    ctx.beginPath();
    ctx.strokeStyle = '#00d2ff';
    ctx.lineWidth = 1;

    for (let i = 0; i < width; i++) {
        const index = i * step;
        let max = 0;
        for (let j = 0; j < step; j++) {
            const val = Math.abs(audioData[index + j] || 0);
            if (val > max) max = val;
        }
        const y = midY - max * midY;
        if (i === 0) {
            ctx.moveTo(i, y);
        } else {
            ctx.lineTo(i, y);
        }
    }
    ctx.stroke();

    // Draw mirrored waveform
    ctx.beginPath();
    for (let i = 0; i < width; i++) {
        const index = i * step;
        let max = 0;
        for (let j = 0; j < step; j++) {
            const val = Math.abs(audioData[index + j] || 0);
            if (val > max) max = val;
        }
        const y = midY + max * midY;
        if (i === 0) {
            ctx.moveTo(i, y);
        } else {
            ctx.lineTo(i, y);
        }
    }
    ctx.stroke();

    // Draw threshold line
    const thresholdLinear = Math.pow(10, threshold / 20);
    const thresholdY = midY - thresholdLinear * midY;
    ctx.beginPath();
    ctx.strokeStyle = '#ff4757';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.moveTo(0, thresholdY);
    ctx.lineTo(width, thresholdY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Highlight speech segments
    ctx.fillStyle = 'rgba(46, 204, 113, 0.3)';
    for (const seg of speechSegments) {
        const x1 = (seg.start / audioBuffer.duration) * width;
        const x2 = (seg.end / audioBuffer.duration) * width;
        ctx.fillRect(x1, 0, x2 - x1, height);
    }
}

async function analyzeAudio() {
    elements.progressContainer.style.display = 'block';
    elements.progressText.textContent = t('analyzing');
    elements.progressFill.style.width = '0%';

    if (!audioContext) {
        audioContext = new AudioContext();
    }

    const arrayBuffer = await videoFile.arrayBuffer();
    audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const audioData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    const threshold = parseFloat(elements.thresholdSlider.value);
    const minSilence = parseFloat(elements.minSilenceSlider.value);
    const padding = parseFloat(elements.paddingSlider.value);

    const thresholdLinear = Math.pow(10, threshold / 20);
    const windowSize = Math.floor(sampleRate * 0.01); // 10ms windows

    speechSegments = [];
    let inSpeech = false;
    let speechStart = 0;

    for (let i = 0; i < audioData.length; i += windowSize) {
        let rms = 0;
        for (let j = i; j < Math.min(i + windowSize, audioData.length); j++) {
            rms += audioData[j] * audioData[j];
        }
        rms = Math.sqrt(rms / windowSize);

        const time = i / sampleRate;

        if (rms > thresholdLinear) {
            if (!inSpeech) {
                speechStart = Math.max(0, time - padding);
                inSpeech = true;
            }
        } else {
            if (inSpeech) {
                const segEnd = time + padding;
                if (speechSegments.length > 0) {
                    const lastSeg = speechSegments[speechSegments.length - 1];
                    if (speechStart - lastSeg.end < minSilence) {
                        lastSeg.end = segEnd;
                    } else {
                        speechSegments.push({ start: speechStart, end: segEnd });
                    }
                } else {
                    speechSegments.push({ start: speechStart, end: segEnd });
                }
                inSpeech = false;
            }
        }

        elements.progressFill.style.width = `${(i / audioData.length) * 100}%`;
    }

    if (inSpeech) {
        speechSegments.push({ start: speechStart, end: audioBuffer.duration });
    }

    // Update stats
    const originalDuration = audioBuffer.duration;
    const newDuration = speechSegments.reduce((sum, seg) => sum + (seg.end - seg.start), 0);
    const silenceRemoved = originalDuration - newDuration;

    elements.originalDuration.textContent = formatTime(originalDuration);
    elements.silenceRemoved.textContent = formatTime(silenceRemoved);
    elements.newDuration.textContent = formatTime(newDuration);

    drawWaveform(audioData, threshold);
    elements.progressContainer.style.display = 'none';
}

async function removeSilence() {
    if (speechSegments.length === 0) {
        await analyzeAudio();
    }

    elements.progressContainer.style.display = 'block';
    elements.progressText.textContent = t('processing');
    elements.progressFill.style.width = '0%';

    const video = elements.videoPlayer;
    const canvas = document.getElementById('processingCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const stream = canvas.captureStream(30);
    const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
    });

    const chunks = [];
    mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        elements.resultVideo.src = url;
        elements.downloadArea.style.display = 'block';
        elements.progressContainer.style.display = 'none';

        elements.downloadBtn.onclick = () => {
            const a = document.createElement('a');
            a.href = url;
            a.download = `silence-removed-${Date.now()}.webm`;
            a.click();
        };
    };

    mediaRecorder.start();

    const totalDuration = speechSegments.reduce((sum, seg) => sum + (seg.end - seg.start), 0);
    let processedDuration = 0;

    for (const segment of speechSegments) {
        video.currentTime = segment.start;
        await new Promise(resolve => video.onseeked = resolve);
        video.play();

        await new Promise(resolve => {
            const render = () => {
                if (video.currentTime >= segment.end || video.paused) {
                    video.pause();
                    resolve();
                    return;
                }
                ctx.drawImage(video, 0, 0);
                processedDuration += 1/30;
                elements.progressFill.style.width = `${(processedDuration / totalDuration) * 100}%`;
                requestAnimationFrame(render);
            };
            render();
        });
    }

    mediaRecorder.stop();
}

function resetEditor() {
    elements.uploadArea.style.display = 'block';
    elements.editorArea.style.display = 'none';
    elements.downloadArea.style.display = 'none';
    elements.videoInput.value = '';
    videoFile = null;
    audioBuffer = null;
    speechSegments = [];
}

function init() {
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));
    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh'));

    elements.uploadArea.addEventListener('click', () => elements.videoInput.click());

    elements.uploadArea.addEventListener('dragover', e => {
        e.preventDefault();
        elements.uploadArea.style.borderColor = '#00d2ff';
    });

    elements.uploadArea.addEventListener('dragleave', () => {
        elements.uploadArea.style.borderColor = 'rgba(255,255,255,0.3)';
    });

    elements.uploadArea.addEventListener('drop', e => {
        e.preventDefault();
        elements.uploadArea.style.borderColor = 'rgba(255,255,255,0.3)';
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('video/')) {
            loadVideo(file);
        }
    });

    elements.videoInput.addEventListener('change', e => {
        if (e.target.files[0]) loadVideo(e.target.files[0]);
    });

    function loadVideo(file) {
        videoFile = file;
        const url = URL.createObjectURL(file);
        elements.videoPlayer.src = url;
        elements.videoPlayer.onloadedmetadata = () => {
            elements.uploadArea.style.display = 'none';
            elements.editorArea.style.display = 'flex';
            elements.downloadArea.style.display = 'none';
            elements.originalDuration.textContent = formatTime(elements.videoPlayer.duration);
        };
    }

    elements.thresholdSlider.addEventListener('input', e => {
        elements.thresholdValue.textContent = `${e.target.value} dB`;
        if (audioBuffer) analyzeAudio();
    });

    elements.minSilenceSlider.addEventListener('input', e => {
        elements.minSilenceValue.textContent = `${e.target.value}s`;
    });

    elements.paddingSlider.addEventListener('input', e => {
        elements.paddingValue.textContent = `${e.target.value}s`;
    });

    elements.analyzeBtn.addEventListener('click', analyzeAudio);
    elements.removeBtn.addEventListener('click', removeSilence);
    elements.resetBtn.addEventListener('click', resetEditor);

    setLanguage('en');
}

init();
