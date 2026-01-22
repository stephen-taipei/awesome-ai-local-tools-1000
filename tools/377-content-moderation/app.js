/**
 * Content Moderation - Tool #377
 * Detect sensitive content in videos
 */

let currentLang = 'zh';
let model = null;
let videoFile = null;
let detectionResults = [];

const texts = {
    zh: {
        title: '影片內容審核',
        subtitle: '偵測影片中的敏感內容',
        privacy: '100% 本地處理 · 零資料上傳',
        process: '🛡️ 開始審核',
        export: '📊 匯出報告',
        upload: '拖放影片檔案至此或點擊上傳',
        uploadHint: '支援 MP4, WebM',
        loading: '載入模型中...',
        processing: '審核中...',
        complete: '審核完成！',
        detectItems: '偵測項目',
        violence: '暴力內容',
        weapons: '武器偵測',
        sensitiveText: '敏感文字',
        sampleInterval: '取樣間隔 (秒)',
        result: '審核結果',
        safe: '安全',
        flagged: '標記',
        totalFrames: '分析幀數',
        issues: '發現問題',
        weaponDetected: '偵測到武器',
        personDetected: '偵測到人物動作',
        noIssues: '未發現敏感內容'
    },
    en: {
        title: 'Content Moderation',
        subtitle: 'Detect sensitive content in videos',
        privacy: '100% Local Processing · No Data Upload',
        process: '🛡️ Start Review',
        export: '📊 Export Report',
        upload: 'Drop video file here or click to upload',
        uploadHint: 'Supports MP4, WebM',
        loading: 'Loading model...',
        processing: 'Reviewing...',
        complete: 'Review complete!',
        detectItems: 'Detection Items',
        violence: 'Violence',
        weapons: 'Weapons',
        sensitiveText: 'Sensitive Text',
        sampleInterval: 'Sample Interval (sec)',
        result: 'Review Result',
        safe: 'Safe',
        flagged: 'Flagged',
        totalFrames: 'Analyzed Frames',
        issues: 'Issues Found',
        weaponDetected: 'Weapon detected',
        personDetected: 'Person action detected',
        noIssues: 'No sensitive content found'
    }
};

// Weapon-related objects from COCO-SSD
const weaponClasses = ['knife', 'scissors', 'baseball bat'];
const violenceIndicators = ['person', 'sports ball'];

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    setupFileUpload();
    document.getElementById('processBtn').addEventListener('click', processVideo);
    document.getElementById('exportBtn').addEventListener('click', exportReport);
}

function setupFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', (e) => e.preventDefault());
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', (e) => { if (e.target.files.length) handleFile(e.target.files[0]); });
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');
    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.getElementById('processBtn').textContent = t.process;
    document.getElementById('exportBtn').textContent = t.export;
}

function handleFile(file) {
    videoFile = file;
    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('previewSection').style.display = 'block';
    document.getElementById('optionsSection').style.display = 'block';
    document.getElementById('actionSection').style.display = 'flex';

    const video = document.getElementById('inputVideo');
    video.src = URL.createObjectURL(file);
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

async function processVideo() {
    const t = texts[currentLang];
    const processBtn = document.getElementById('processBtn');
    processBtn.disabled = true;
    processBtn.textContent = t.loading;

    document.getElementById('progressSection').style.display = 'block';
    document.getElementById('resultSection').style.display = 'none';
    detectionResults = [];

    try {
        if (!model) {
            model = await cocoSsd.load();
        }

        const video = document.getElementById('inputVideo');
        const detectWeapons = document.getElementById('detectWeapons').checked;
        const detectViolence = document.getElementById('detectViolence').checked;
        const sampleInterval = parseFloat(document.getElementById('sampleInterval').value);

        await video.play();
        video.pause();
        video.currentTime = 0;

        const duration = video.duration;
        const totalSamples = Math.floor(duration / sampleInterval);

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = video.videoWidth;
        tempCanvas.height = video.videoHeight;
        const tempCtx = tempCanvas.getContext('2d');

        let weaponCount = 0;
        let violenceCount = 0;

        for (let i = 0; i <= totalSamples; i++) {
            const currentTime = i * sampleInterval;
            video.currentTime = currentTime;
            await new Promise(resolve => video.onseeked = resolve);

            tempCtx.drawImage(video, 0, 0);
            const predictions = await model.detect(tempCanvas);

            for (const pred of predictions) {
                if (detectWeapons && weaponClasses.includes(pred.class)) {
                    detectionResults.push({
                        time: currentTime,
                        type: 'weapon',
                        label: pred.class,
                        confidence: pred.score
                    });
                    weaponCount++;
                }

                if (detectViolence && violenceIndicators.includes(pred.class)) {
                    // Check for multiple persons or sudden movements
                    const persons = predictions.filter(p => p.class === 'person');
                    if (persons.length >= 2) {
                        // Check if persons are close to each other
                        const boxes = persons.map(p => p.bbox);
                        for (let j = 0; j < boxes.length - 1; j++) {
                            for (let k = j + 1; k < boxes.length; k++) {
                                if (boxesOverlap(boxes[j], boxes[k])) {
                                    detectionResults.push({
                                        time: currentTime,
                                        type: 'violence',
                                        label: 'close_contact',
                                        confidence: 0.5
                                    });
                                    violenceCount++;
                                }
                            }
                        }
                    }
                }
            }

            const progress = ((i + 1) / (totalSamples + 1)) * 100;
            document.getElementById('progressFill').style.width = progress + '%';
            document.getElementById('progressText').textContent = `${t.processing} ${Math.round(progress)}%`;
        }

        // Display results
        displayResults(totalSamples + 1, weaponCount, violenceCount);

        document.getElementById('progressText').textContent = t.complete;
        document.getElementById('exportBtn').disabled = false;

    } catch (error) {
        console.error('Error:', error);
        document.getElementById('progressText').textContent = 'Error: ' + error.message;
    }

    document.getElementById('progressSection').style.display = 'none';
    processBtn.disabled = false;
    processBtn.textContent = t.process;
}

function boxesOverlap(box1, box2) {
    const [x1, y1, w1, h1] = box1;
    const [x2, y2, w2, h2] = box2;

    return !(x1 + w1 < x2 || x2 + w2 < x1 || y1 + h1 < y2 || y2 + h2 < y1);
}

function displayResults(totalFrames, weaponCount, violenceCount) {
    const t = texts[currentLang];
    const totalIssues = weaponCount + violenceCount;

    document.getElementById('resultSection').style.display = 'block';

    const summaryHtml = `
        <div class="summary-card ${totalIssues === 0 ? 'safe' : 'danger'}">
            <div class="count">${totalIssues === 0 ? '✓' : totalIssues}</div>
            <div class="label">${totalIssues === 0 ? t.safe : t.issues}</div>
        </div>
        <div class="summary-card">
            <div class="count">${totalFrames}</div>
            <div class="label">${t.totalFrames}</div>
        </div>
        <div class="summary-card ${weaponCount > 0 ? 'warning' : 'safe'}">
            <div class="count">${weaponCount}</div>
            <div class="label">${t.weapons}</div>
        </div>
    `;
    document.getElementById('resultSummary').innerHTML = summaryHtml;

    let timelineHtml = '';
    if (detectionResults.length === 0) {
        timelineHtml = `<p style="text-align: center; color: var(--success-color);">${t.noIssues}</p>`;
    } else {
        for (const result of detectionResults) {
            timelineHtml += `
                <div class="timeline-item">
                    <span class="time">${formatTime(result.time)}</span>
                    <span class="type ${result.type}">${result.type === 'weapon' ? t.weaponDetected : t.personDetected}</span>
                    <span>${result.label} (${Math.round(result.confidence * 100)}%)</span>
                </div>
            `;
        }
    }
    document.getElementById('resultTimeline').innerHTML = timelineHtml;
}

function exportReport() {
    const t = texts[currentLang];
    const report = {
        title: t.title,
        date: new Date().toISOString(),
        file: videoFile.name,
        results: detectionResults,
        summary: {
            totalIssues: detectionResults.length,
            weapons: detectionResults.filter(r => r.type === 'weapon').length,
            violence: detectionResults.filter(r => r.type === 'violence').length
        }
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'moderation-report.json';
    a.click();
}

init();
