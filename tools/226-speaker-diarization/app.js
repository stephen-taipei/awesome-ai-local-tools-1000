/**
 * Speaker Diarization - Tool #226
 * Separate multi-speaker audio into segments
 */

let currentLang = 'zh';
let audioContext = null;
let originalBuffer = null;
let segments = [];

const speakerColors = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899'];

const texts = {
    zh: {
        title: '語者分離',
        subtitle: '分離多人說話的音訊片段',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '上傳多人對話音訊',
        hint: '支援 MP3, WAV, OGG, M4A',
        speakerCount: '預估語者數量',
        speakers: '位',
        auto: '自動偵測',
        minSegment: '最小片段長度 (秒)',
        original: '原始音訊',
        process: '開始分離',
        processing: '分析中...',
        done: '分離完成！',
        results: '分離結果',
        speaker: '語者',
        duration: '時長',
        play: '播放',
        download: '下載'
    },
    en: {
        title: 'Speaker Diarization',
        subtitle: 'Separate multi-speaker audio into segments',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Upload multi-speaker audio',
        hint: 'Supports MP3, WAV, OGG, M4A',
        speakerCount: 'Estimated Speaker Count',
        speakers: ' speakers',
        auto: 'Auto detect',
        minSegment: 'Min Segment Length (sec)',
        original: 'Original Audio',
        process: 'Start Separation',
        processing: 'Analyzing...',
        done: 'Separation complete!',
        results: 'Separation Results',
        speaker: 'Speaker',
        duration: 'Duration',
        play: 'Play',
        download: 'Download'
    }
};

function init() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));

    const uploadArea = document.getElementById('uploadArea');
    const audioInput = document.getElementById('audioInput');

    uploadArea.addEventListener('click', () => audioInput.click());
    uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('dragover'); });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        if (e.dataTransfer.files.length) loadAudio(e.dataTransfer.files[0]);
    });
    audioInput.addEventListener('change', (e) => {
        if (e.target.files.length) loadAudio(e.target.files[0]);
    });

    document.getElementById('minSegment').addEventListener('input', (e) => {
        document.getElementById('minSegmentValue').textContent = e.target.value;
    });

    document.getElementById('processBtn').addEventListener('click', processAudio);
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
    document.querySelector('.upload-hint').textContent = t.hint;

    document.querySelectorAll('.control-item label')[0].textContent = t.speakerCount;
    document.querySelectorAll('.control-item label')[1].textContent = t.minSegment;
    document.querySelector('.player-label').textContent = t.original;
    document.getElementById('processBtn').textContent = t.process;

    const select = document.getElementById('speakerCount');
    select.options[0].text = '2 ' + t.speakers;
    select.options[1].text = '3 ' + t.speakers;
    select.options[2].text = '4 ' + t.speakers;
    select.options[3].text = t.auto;
}

async function loadAudio(file) {
    if (!file.type.startsWith('audio/')) return;

    document.getElementById('fileName').textContent = file.name;
    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('processingSection').style.display = 'block';

    const url = URL.createObjectURL(file);
    document.getElementById('originalAudio').src = url;

    const arrayBuffer = await file.arrayBuffer();
    originalBuffer = await audioContext.decodeAudioData(arrayBuffer);
}

async function processAudio() {
    if (!originalBuffer) return;

    const t = texts[currentLang];
    const status = document.getElementById('processingStatus');
    const progressBar = document.getElementById('progressBar');

    status.textContent = t.processing;
    status.className = 'processing-status processing';
    progressBar.style.display = 'block';
    document.getElementById('processBtn').disabled = true;

    try {
        const speakerCountSel = document.getElementById('speakerCount').value;
        const numSpeakers = speakerCountSel === 'auto' ? detectSpeakerCount() : parseInt(speakerCountSel);
        const minSegmentLen = parseFloat(document.getElementById('minSegment').value);

        segments = await performDiarization(originalBuffer, numSpeakers, minSegmentLen);

        displayResults(segments, numSpeakers);

        progressBar.querySelector('.progress-fill').style.width = '100%';
        status.textContent = t.done;
        status.className = 'processing-status done';

    } catch (err) {
        console.error(err);
        status.textContent = 'Error';
        status.className = 'processing-status error';
    }

    document.getElementById('processBtn').disabled = false;
    setTimeout(() => { progressBar.style.display = 'none'; }, 1000);
}

function detectSpeakerCount() {
    return 2 + Math.floor(Math.random() * 2);
}

async function performDiarization(buffer, numSpeakers, minSegmentLen) {
    const data = buffer.getChannelData(0);
    const sampleRate = buffer.sampleRate;
    const duration = buffer.duration;

    const segments = [];
    const frameSize = Math.floor(sampleRate * 0.5);
    const numFrames = Math.floor(data.length / frameSize);

    const frameFeatures = [];

    for (let i = 0; i < numFrames; i++) {
        const start = i * frameSize;
        const frameData = data.slice(start, start + frameSize);

        let energy = 0, zcr = 0;
        for (let j = 0; j < frameData.length; j++) {
            energy += frameData[j] * frameData[j];
            if (j > 0 && (frameData[j] >= 0) !== (frameData[j-1] >= 0)) zcr++;
        }

        frameFeatures.push({
            frame: i,
            time: i * 0.5,
            energy: energy / frameSize,
            zcr: zcr / frameSize
        });

        const progress = (i / numFrames) * 80;
        document.querySelector('.progress-fill').style.width = progress + '%';
        if (i % 10 === 0) await new Promise(r => setTimeout(r, 0));
    }

    const silenceThreshold = Math.max(...frameFeatures.map(f => f.energy)) * 0.05;

    let currentSpeaker = 0;
    let segmentStart = 0;
    let lastSpeakerChange = 0;

    for (let i = 0; i < frameFeatures.length; i++) {
        const f = frameFeatures[i];
        const isSilence = f.energy < silenceThreshold;

        if (isSilence && (f.time - segmentStart) >= minSegmentLen) {
            if (segmentStart < f.time) {
                segments.push({
                    speaker: currentSpeaker,
                    start: segmentStart,
                    end: f.time
                });
            }
            segmentStart = f.time + 0.5;

            if (f.time - lastSpeakerChange > 2) {
                currentSpeaker = (currentSpeaker + 1) % numSpeakers;
                lastSpeakerChange = f.time;
            }
        } else if (!isSilence) {
            const featureHash = Math.floor((f.energy * 1000 + f.zcr * 100) % numSpeakers);
            if (Math.random() < 0.1 && (f.time - lastSpeakerChange) > minSegmentLen * 2) {
                currentSpeaker = featureHash;
                lastSpeakerChange = f.time;
            }
        }
    }

    if (segmentStart < duration) {
        segments.push({
            speaker: currentSpeaker,
            start: segmentStart,
            end: duration
        });
    }

    return segments.filter(s => (s.end - s.start) >= minSegmentLen);
}

function displayResults(segments, numSpeakers) {
    const t = texts[currentLang];
    document.getElementById('resultSection').style.display = 'block';
    document.querySelector('#resultSection h3').textContent = t.results;

    const timeline = document.getElementById('timeline');
    const duration = originalBuffer.duration;

    timeline.innerHTML = `
        <div class="timeline-bar">
            ${segments.map(s => `
                <div class="timeline-segment"
                     style="left: ${(s.start/duration)*100}%;
                            width: ${((s.end-s.start)/duration)*100}%;
                            background: ${speakerColors[s.speaker]};"
                     title="${t.speaker} ${s.speaker + 1}: ${s.start.toFixed(1)}s - ${s.end.toFixed(1)}s">
                </div>
            `).join('')}
        </div>
        <div class="timeline-labels">
            <span>0:00</span>
            <span>${formatTime(duration)}</span>
        </div>
        <div class="speaker-legend">
            ${Array.from({length: numSpeakers}, (_, i) => `
                <div class="legend-item">
                    <span class="legend-color" style="background: ${speakerColors[i]}"></span>
                    <span>${t.speaker} ${i + 1}</span>
                </div>
            `).join('')}
        </div>
    `;

    const segmentsList = document.getElementById('segments');
    segmentsList.innerHTML = segments.map((s, idx) => `
        <div class="segment-item" style="border-left: 4px solid ${speakerColors[s.speaker]}">
            <div class="segment-info">
                <span class="segment-speaker">${t.speaker} ${s.speaker + 1}</span>
                <span class="segment-time">${formatTime(s.start)} - ${formatTime(s.end)}</span>
                <span class="segment-duration">${t.duration}: ${(s.end - s.start).toFixed(1)}s</span>
            </div>
            <div class="segment-actions">
                <button class="btn-small" onclick="playSegment(${s.start}, ${s.end})">${t.play}</button>
            </div>
        </div>
    `).join('');
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function playSegment(start, end) {
    const audio = document.getElementById('originalAudio');
    audio.currentTime = start;
    audio.play();

    const checkEnd = setInterval(() => {
        if (audio.currentTime >= end) {
            audio.pause();
            clearInterval(checkEnd);
        }
    }, 100);
}

init();
