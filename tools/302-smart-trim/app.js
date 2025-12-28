/**
 * Smart Video Trim - Tool #302
 * AI-powered automatic video trimming based on content analysis
 */

const translations = {
    en: {
        title: 'Smart Video Trim',
        subtitle: 'AI-powered automatic video trimming based on content analysis',
        privacyBadge: '100% Local Processing - No Upload Required',
        uploadText: 'Drop video here or click to upload',
        uploadHint: 'Supports MP4, WebM, MOV formats',
        smartOptions: 'Smart Trim Options',
        removeIntro: 'Remove Intro/Outro',
        removePauses: 'Remove Long Pauses',
        keepHighlight: 'Keep Highlight Moments',
        removeStatic: 'Remove Static Frames',
        sensitivity: 'Detection Sensitivity:',
        detectedSegments: 'Detected Segments',
        analyze: 'Analyze Video',
        smartTrim: 'Smart Trim',
        reset: 'Upload New Video',
        analyzing: 'Analyzing video...',
        processing: 'Processing...',
        download: 'Download Trimmed Video',
        howItWorks: 'How It Works',
        aiAnalysis: 'AI Analysis',
        aiAnalysisDesc: 'Automatically detects content patterns and important moments',
        smartCut: 'Smart Cutting',
        smartCutDesc: 'Removes unnecessary parts while preserving key content',
        fastProcess: 'Fast Processing',
        fastProcessDesc: 'All processing happens locally for maximum speed',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #302',
        intro: 'Intro',
        outro: 'Outro',
        pause: 'Long Pause',
        static: 'Static',
        content: 'Content',
        highlight: 'Highlight'
    },
    zh: {
        title: 'AI 智能剪輯',
        subtitle: '基於內容分析的 AI 智能影片剪輯',
        privacyBadge: '100% 本地處理 - 無需上傳',
        uploadText: '拖放影片到此處或點擊上傳',
        uploadHint: '支援 MP4、WebM、MOV 格式',
        smartOptions: '智能剪輯選項',
        removeIntro: '移除片頭/片尾',
        removePauses: '移除長暫停',
        keepHighlight: '保留精彩片段',
        removeStatic: '移除靜態畫面',
        sensitivity: '檢測靈敏度：',
        detectedSegments: '檢測到的片段',
        analyze: '分析影片',
        smartTrim: '智能剪輯',
        reset: '上傳新影片',
        analyzing: '分析影片中...',
        processing: '處理中...',
        download: '下載剪輯後的影片',
        howItWorks: '使用方法',
        aiAnalysis: 'AI 分析',
        aiAnalysisDesc: '自動檢測內容模式和重要時刻',
        smartCut: '智能剪切',
        smartCutDesc: '移除不必要的部分同時保留關鍵內容',
        fastProcess: '快速處理',
        fastProcessDesc: '所有處理都在本地進行以獲得最快速度',
        backToHome: '返回首頁',
        toolNumber: '工具 #302',
        intro: '片頭',
        outro: '片尾',
        pause: '長暫停',
        static: '靜態',
        content: '內容',
        highlight: '精彩片段'
    }
};

let currentLang = 'en';
let videoFile = null;
let videoDuration = 0;
let segments = [];

const elements = {
    uploadArea: document.getElementById('uploadArea'),
    videoInput: document.getElementById('videoInput'),
    editorArea: document.getElementById('editorArea'),
    videoPlayer: document.getElementById('videoPlayer'),
    segmentsList: document.getElementById('segmentsList'),
    sensitivity: document.getElementById('sensitivity'),
    sensitivityValue: document.getElementById('sensitivityValue'),
    analyzeBtn: document.getElementById('analyzeBtn'),
    trimBtn: document.getElementById('trimBtn'),
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
    renderSegments();
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

function t(key) {
    return translations[currentLang][key] || key;
}

async function analyzeVideo() {
    elements.progressContainer.style.display = 'block';
    elements.progressText.textContent = t('analyzing');
    elements.progressFill.style.width = '0%';

    const video = elements.videoPlayer;
    const canvas = document.getElementById('processingCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 160;
    canvas.height = 90;

    const sensitivity = parseInt(elements.sensitivity.value);
    const frameInterval = 1; // Analyze every second
    const totalFrames = Math.floor(video.duration);

    segments = [];
    let previousFrame = null;
    let frameData = [];

    // Sample frames throughout the video
    for (let i = 0; i < totalFrames; i++) {
        video.currentTime = i;
        await new Promise(resolve => video.onseeked = resolve);

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Calculate frame brightness and motion
        let brightness = 0;
        let motion = 0;

        for (let j = 0; j < imageData.data.length; j += 4) {
            const r = imageData.data[j];
            const g = imageData.data[j + 1];
            const b = imageData.data[j + 2];
            brightness += (r + g + b) / 3;

            if (previousFrame) {
                const diff = Math.abs(r - previousFrame[j]) +
                           Math.abs(g - previousFrame[j + 1]) +
                           Math.abs(b - previousFrame[j + 2]);
                motion += diff;
            }
        }

        brightness /= (imageData.data.length / 4);
        motion /= (imageData.data.length / 4);

        frameData.push({
            time: i,
            brightness,
            motion,
            pixels: Array.from(imageData.data)
        });

        previousFrame = imageData.data;

        elements.progressFill.style.width = `${(i / totalFrames) * 100}%`;
    }

    // Analyze frame data and create segments
    const avgMotion = frameData.reduce((sum, f) => sum + f.motion, 0) / frameData.length;
    const motionThreshold = avgMotion * (1 - sensitivity / 20);

    let currentSegment = null;

    for (let i = 0; i < frameData.length; i++) {
        const frame = frameData[i];
        let type = 'content';

        // Detect intro (first 10% with low motion)
        if (i < totalFrames * 0.1 && frame.motion < motionThreshold) {
            type = 'intro';
        }
        // Detect outro (last 10% with low motion)
        else if (i > totalFrames * 0.9 && frame.motion < motionThreshold) {
            type = 'outro';
        }
        // Detect static frames
        else if (frame.motion < motionThreshold * 0.5) {
            type = 'static';
        }
        // Detect highlights (high motion)
        else if (frame.motion > avgMotion * 1.5) {
            type = 'highlight';
        }

        if (!currentSegment || currentSegment.type !== type) {
            if (currentSegment) {
                currentSegment.end = frame.time;
                segments.push(currentSegment);
            }
            currentSegment = {
                type,
                start: frame.time,
                end: frame.time,
                keep: type === 'content' || type === 'highlight'
            };
        }
    }

    if (currentSegment) {
        currentSegment.end = video.duration;
        segments.push(currentSegment);
    }

    // Merge small segments
    segments = mergeSmallSegments(segments);

    elements.progressContainer.style.display = 'none';
    renderSegments();
}

function mergeSmallSegments(segs) {
    const merged = [];
    for (const seg of segs) {
        if (merged.length > 0 && merged[merged.length - 1].type === seg.type) {
            merged[merged.length - 1].end = seg.end;
        } else if (seg.end - seg.start >= 0.5) {
            merged.push(seg);
        } else if (merged.length > 0) {
            merged[merged.length - 1].end = seg.end;
        }
    }
    return merged;
}

function renderSegments() {
    const removeIntro = document.getElementById('removeIntro').checked;
    const removePauses = document.getElementById('removePauses').checked;
    const keepHighlight = document.getElementById('keepHighlight').checked;
    const removeStatic = document.getElementById('removeStatic').checked;

    segments.forEach(seg => {
        seg.keep = true;
        if (seg.type === 'intro' && removeIntro) seg.keep = false;
        if (seg.type === 'outro' && removeIntro) seg.keep = false;
        if (seg.type === 'pause' && removePauses) seg.keep = false;
        if (seg.type === 'static' && removeStatic) seg.keep = false;
        if (seg.type === 'highlight' && keepHighlight) seg.keep = true;
    });

    elements.segmentsList.innerHTML = segments.map((seg, i) => `
        <div class="segment-item ${seg.keep ? 'keep' : 'removed'}">
            <span class="segment-time">${formatTime(seg.start)} - ${formatTime(seg.end)}</span>
            <span class="segment-type">${t(seg.type)}</span>
            <label>
                <input type="checkbox" ${seg.keep ? 'checked' : ''} onchange="toggleSegment(${i})">
                Keep
            </label>
        </div>
    `).join('');
}

window.toggleSegment = function(index) {
    segments[index].keep = !segments[index].keep;
    renderSegments();
};

async function smartTrim() {
    const keepSegments = segments.filter(s => s.keep);
    if (keepSegments.length === 0) {
        alert('No segments selected to keep!');
        return;
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
            a.download = `smart-trimmed-${Date.now()}.webm`;
            a.click();
        };
    };

    mediaRecorder.start();

    const totalDuration = keepSegments.reduce((sum, s) => sum + (s.end - s.start), 0);
    let processedDuration = 0;

    for (const segment of keepSegments) {
        video.currentTime = segment.start;
        await new Promise(resolve => video.onseeked = resolve);
        video.play();

        await new Promise(resolve => {
            const checkTime = () => {
                if (video.currentTime >= segment.end) {
                    video.pause();
                    resolve();
                } else {
                    ctx.drawImage(video, 0, 0);
                    processedDuration = video.currentTime - segment.start;
                    const progress = (processedDuration / totalDuration) * 100;
                    elements.progressFill.style.width = `${Math.min(progress, 100)}%`;
                    requestAnimationFrame(checkTime);
                }
            };
            checkTime();
        });
    }

    mediaRecorder.stop();
}

function resetEditor() {
    elements.uploadArea.style.display = 'block';
    elements.editorArea.style.display = 'none';
    elements.downloadArea.style.display = 'none';
    elements.videoInput.value = '';
    segments = [];
    videoFile = null;
}

function init() {
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));
    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh'));

    elements.uploadArea.addEventListener('click', () => elements.videoInput.click());

    elements.uploadArea.addEventListener('dragover', e => {
        e.preventDefault();
        elements.uploadArea.style.borderColor = '#667eea';
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
            videoDuration = elements.videoPlayer.duration;
            elements.uploadArea.style.display = 'none';
            elements.editorArea.style.display = 'flex';
            elements.downloadArea.style.display = 'none';
        };
    }

    elements.sensitivity.addEventListener('input', e => {
        elements.sensitivityValue.textContent = e.target.value;
    });

    document.querySelectorAll('.option-item input').forEach(checkbox => {
        checkbox.addEventListener('change', renderSegments);
    });

    elements.analyzeBtn.addEventListener('click', analyzeVideo);
    elements.trimBtn.addEventListener('click', smartTrim);
    elements.resetBtn.addEventListener('click', resetEditor);

    setLanguage('en');
}

init();
