/**
 * Speaker Identification - Tool #225
 * Identify and verify speakers by voice using audio feature analysis
 */

let currentLang = 'zh';
let audioContext = null;
let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;
let speakers = [];
let enrollBuffer = null;
let identifyBuffer = null;

const texts = {
    zh: {
        title: '語者辨識',
        subtitle: '辨識與驗證說話者身份',
        privacy: '100% 本地處理 · 零資料上傳',
        enrollTab: '註冊語者',
        identifyTab: '辨識語者',
        addSpeaker: '新增語者',
        speakerName: '語者名稱',
        namePlaceholder: '輸入名稱...',
        recordSample: '點擊錄製語音樣本',
        recordHint: '建議錄製 3-5 秒',
        recording: '錄製中... 點擊停止',
        or: '或',
        uploadFile: '上傳音訊檔案',
        analyzeRegister: '分析並註冊',
        enrolled: '已註冊語者',
        identifyVoice: '辨識語音',
        recordIdentify: '點擊錄製要辨識的語音',
        recordIdentifyHint: '錄製說話者的聲音',
        startIdentify: '開始辨識',
        results: '辨識結果',
        match: '匹配度',
        bestMatch: '最佳匹配',
        noSpeakers: '請先註冊至少一位語者',
        registered: '已註冊',
        delete: '刪除'
    },
    en: {
        title: 'Speaker Identification',
        subtitle: 'Identify and verify speakers by voice',
        privacy: '100% Local Processing · No Data Upload',
        enrollTab: 'Enroll Speaker',
        identifyTab: 'Identify Speaker',
        addSpeaker: 'Add Speaker',
        speakerName: 'Speaker Name',
        namePlaceholder: 'Enter name...',
        recordSample: 'Click to record voice sample',
        recordHint: 'Recommended 3-5 seconds',
        recording: 'Recording... Click to stop',
        or: 'or',
        uploadFile: 'Upload audio file',
        analyzeRegister: 'Analyze & Register',
        enrolled: 'Enrolled Speakers',
        identifyVoice: 'Identify Voice',
        recordIdentify: 'Click to record voice to identify',
        recordIdentifyHint: 'Record the speaker\'s voice',
        startIdentify: 'Start Identification',
        results: 'Identification Results',
        match: 'Match',
        bestMatch: 'Best Match',
        noSpeakers: 'Please enroll at least one speaker first',
        registered: 'Registered',
        delete: 'Delete'
    }
};

function init() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    document.getElementById('enrollRecordArea').addEventListener('click', () => toggleRecording('enroll'));
    document.getElementById('identifyRecordArea').addEventListener('click', () => toggleRecording('identify'));

    document.getElementById('uploadEnrollBtn').addEventListener('click', () => document.getElementById('enrollFileInput').click());
    document.getElementById('uploadIdentifyBtn').addEventListener('click', () => document.getElementById('identifyFileInput').click());

    document.getElementById('enrollFileInput').addEventListener('change', (e) => loadFile(e, 'enroll'));
    document.getElementById('identifyFileInput').addEventListener('change', (e) => loadFile(e, 'identify'));

    document.getElementById('analyzeBtn').addEventListener('click', enrollSpeaker);
    document.getElementById('identifyBtn').addEventListener('click', identifySpeaker);

    loadSpeakers();
    updateSpeakerList();
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');

    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;

    document.querySelectorAll('.tab-btn')[0].textContent = t.enrollTab;
    document.querySelectorAll('.tab-btn')[1].textContent = t.identifyTab;

    document.querySelector('.enroll-section h3').textContent = t.addSpeaker;
    document.querySelector('.input-group label').textContent = t.speakerName;
    document.getElementById('speakerName').placeholder = t.namePlaceholder;
    document.querySelector('#enrollRecordArea .record-text').textContent = t.recordSample;
    document.querySelector('#enrollRecordArea .record-hint').textContent = t.recordHint;
    document.querySelectorAll('.upload-option span')[0].textContent = t.or;
    document.getElementById('uploadEnrollBtn').textContent = t.uploadFile;
    document.getElementById('analyzeBtn').textContent = t.analyzeRegister;

    document.querySelector('.identify-section h3').textContent = t.identifyVoice;
    document.querySelector('#identifyRecordArea .record-text').textContent = t.recordIdentify;
    document.querySelector('#identifyRecordArea .record-hint').textContent = t.recordIdentifyHint;
    document.querySelectorAll('.upload-option span')[1].textContent = t.or;
    document.getElementById('uploadIdentifyBtn').textContent = t.uploadFile;
    document.getElementById('identifyBtn').textContent = t.startIdentify;

    updateSpeakerList();
}

function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(`${tab}Tab`).classList.add('active');
}

async function toggleRecording(type) {
    if (isRecording) {
        stopRecording(type);
    } else {
        startRecording(type);
    }
}

async function startRecording(type) {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
        mediaRecorder.onstop = () => processRecording(type);

        mediaRecorder.start();
        isRecording = true;

        const area = document.getElementById(`${type}RecordArea`);
        area.classList.add('recording');
        area.querySelector('.record-text').textContent = texts[currentLang].recording;
    } catch (err) {
        console.error('Recording error:', err);
    }
}

function stopRecording(type) {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
    isRecording = false;

    const area = document.getElementById(`${type}RecordArea`);
    area.classList.remove('recording');
    area.querySelector('.record-text').textContent =
        type === 'enroll' ? texts[currentLang].recordSample : texts[currentLang].recordIdentify;
}

async function processRecording(type) {
    const blob = new Blob(audioChunks, { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);

    document.getElementById(`${type}Audio`).src = url;
    document.getElementById(`${type}Preview`).style.display = 'flex';

    const arrayBuffer = await blob.arrayBuffer();
    const buffer = await audioContext.decodeAudioData(arrayBuffer);

    if (type === 'enroll') {
        enrollBuffer = buffer;
    } else {
        identifyBuffer = buffer;
    }
}

async function loadFile(e, type) {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    document.getElementById(`${type}Audio`).src = url;
    document.getElementById(`${type}Preview`).style.display = 'flex';

    const arrayBuffer = await file.arrayBuffer();
    const buffer = await audioContext.decodeAudioData(arrayBuffer);

    if (type === 'enroll') {
        enrollBuffer = buffer;
    } else {
        identifyBuffer = buffer;
    }
}

function extractFeatures(buffer) {
    const data = buffer.getChannelData(0);
    const sampleRate = buffer.sampleRate;

    // Extract various audio features for voice fingerprinting
    const frameSize = 2048;
    const hopSize = 512;
    const numFrames = Math.floor((data.length - frameSize) / hopSize);

    let pitchSum = 0, pitchCount = 0;
    let energySum = 0;
    let zcr = 0;
    const spectralCentroids = [];

    for (let frame = 0; frame < numFrames; frame++) {
        const start = frame * hopSize;
        const frameData = data.slice(start, start + frameSize);

        // Energy
        let energy = 0;
        for (let i = 0; i < frameData.length; i++) {
            energy += frameData[i] * frameData[i];
        }
        energySum += energy;

        // Zero crossing rate
        for (let i = 1; i < frameData.length; i++) {
            if ((frameData[i] >= 0) !== (frameData[i - 1] >= 0)) zcr++;
        }

        // Spectral centroid (simplified)
        let weightedSum = 0, sum = 0;
        for (let i = 0; i < frameData.length; i++) {
            const mag = Math.abs(frameData[i]);
            weightedSum += i * mag;
            sum += mag;
        }
        if (sum > 0) spectralCentroids.push(weightedSum / sum);
    }

    // Pitch estimation using autocorrelation
    const minPeriod = Math.floor(sampleRate / 500); // 500 Hz max
    const maxPeriod = Math.floor(sampleRate / 50);  // 50 Hz min
    let bestCorr = 0, bestPeriod = 0;

    for (let period = minPeriod; period < maxPeriod; period++) {
        let corr = 0;
        for (let i = 0; i < 1024; i++) {
            if (i + period < data.length) {
                corr += data[i] * data[i + period];
            }
        }
        if (corr > bestCorr) {
            bestCorr = corr;
            bestPeriod = period;
        }
    }

    const pitch = bestPeriod > 0 ? sampleRate / bestPeriod : 0;
    const avgEnergy = energySum / numFrames;
    const avgZcr = zcr / data.length;
    const avgSpectralCentroid = spectralCentroids.reduce((a, b) => a + b, 0) / spectralCentroids.length || 0;

    return {
        pitch,
        energy: avgEnergy,
        zcr: avgZcr,
        spectralCentroid: avgSpectralCentroid,
        duration: buffer.duration
    };
}

function calculateSimilarity(f1, f2) {
    // Normalize and compare features
    const pitchDiff = Math.abs(f1.pitch - f2.pitch) / Math.max(f1.pitch, f2.pitch, 1);
    const energyDiff = Math.abs(f1.energy - f2.energy) / Math.max(f1.energy, f2.energy, 0.001);
    const zcrDiff = Math.abs(f1.zcr - f2.zcr) / Math.max(f1.zcr, f2.zcr, 0.001);
    const scDiff = Math.abs(f1.spectralCentroid - f2.spectralCentroid) / Math.max(f1.spectralCentroid, f2.spectralCentroid, 1);

    // Weighted similarity (pitch is most important for speaker ID)
    const similarity = 1 - (pitchDiff * 0.4 + energyDiff * 0.2 + zcrDiff * 0.2 + scDiff * 0.2);
    return Math.max(0, Math.min(1, similarity));
}

function enrollSpeaker() {
    const name = document.getElementById('speakerName').value.trim();
    if (!name || !enrollBuffer) return;

    const features = extractFeatures(enrollBuffer);

    speakers.push({
        id: Date.now(),
        name,
        features
    });

    saveSpeakers();
    updateSpeakerList();

    document.getElementById('speakerName').value = '';
    document.getElementById('enrollPreview').style.display = 'none';
    enrollBuffer = null;
}

function identifySpeaker() {
    if (!identifyBuffer || speakers.length === 0) {
        if (speakers.length === 0) {
            alert(texts[currentLang].noSpeakers);
        }
        return;
    }

    const testFeatures = extractFeatures(identifyBuffer);
    const results = speakers.map(speaker => ({
        ...speaker,
        similarity: calculateSimilarity(speaker.features, testFeatures)
    })).sort((a, b) => b.similarity - a.similarity);

    displayResults(results);
}

function displayResults(results) {
    const t = texts[currentLang];
    const container = document.getElementById('matchResults');
    container.innerHTML = '';

    results.forEach((result, index) => {
        const div = document.createElement('div');
        div.className = `match-item ${index === 0 ? 'best-match' : ''}`;

        const percentage = Math.round(result.similarity * 100);
        div.innerHTML = `
            <div class="match-info">
                <span class="match-name">${result.name}</span>
                ${index === 0 ? `<span class="best-badge">${t.bestMatch}</span>` : ''}
            </div>
            <div class="match-bar">
                <div class="match-fill" style="width: ${percentage}%"></div>
            </div>
            <span class="match-percent">${percentage}%</span>
        `;
        container.appendChild(div);
    });

    document.getElementById('resultSection').style.display = 'block';
}

function deleteSpeaker(id) {
    speakers = speakers.filter(s => s.id !== id);
    saveSpeakers();
    updateSpeakerList();
}

function updateSpeakerList() {
    const t = texts[currentLang];
    document.getElementById('speakerCount').textContent = speakers.length;

    const container = document.getElementById('speakerList');
    if (speakers.length === 0) {
        container.innerHTML = `<div class="empty-state">${t.noSpeakers}</div>`;
        return;
    }

    container.innerHTML = speakers.map(speaker => `
        <div class="speaker-item">
            <div class="speaker-info">
                <span class="speaker-name">${speaker.name}</span>
                <span class="speaker-meta">${t.registered}</span>
            </div>
            <button class="delete-btn" onclick="deleteSpeaker(${speaker.id})">${t.delete}</button>
        </div>
    `).join('');
}

function saveSpeakers() {
    localStorage.setItem('speakers_225', JSON.stringify(speakers));
}

function loadSpeakers() {
    const saved = localStorage.getItem('speakers_225');
    if (saved) {
        speakers = JSON.parse(saved);
    }
}

init();
