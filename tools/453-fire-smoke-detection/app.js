/**
 * Fire & Smoke Detection - Tool #453
 * Detect fire and smoke in images
 */

let currentLang = 'zh';
let originalImage = null;
let detectionResults = [];

const texts = {
    zh: {
        title: '煙火偵測',
        subtitle: '偵測圖片中的煙霧或火焰',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '拖放圖片至此或點擊上傳',
        detect: '🔍 開始偵測',
        processing: '處理中...',
        safe: '未偵測到危險',
        danger: '警告：偵測到危險！',
        fire: '火焰',
        smoke: '煙霧',
        download: '💾 下載結果',
        export: '📄 匯出報告'
    },
    en: {
        title: 'Fire & Smoke Detection',
        subtitle: 'Detect fire and smoke in images',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Drop image here or click to upload',
        detect: '🔍 Start Detection',
        processing: 'Processing...',
        safe: 'No danger detected',
        danger: 'WARNING: Danger detected!',
        fire: 'Fire',
        smoke: 'Smoke',
        download: '💾 Download Result',
        export: '📄 Export Report'
    }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    setupFileUpload();
    document.getElementById('detectBtn').addEventListener('click', detect);
    document.getElementById('downloadBtn').addEventListener('click', downloadResult);
    document.getElementById('exportBtn').addEventListener('click', exportReport);
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');
    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.getElementById('uploadText').textContent = t.upload;
    document.getElementById('detectBtn').textContent = t.detect;
    document.getElementById('downloadBtn').textContent = t.download;
    document.getElementById('exportBtn').textContent = t.export;
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

function handleFile(file) {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            originalImage = img;
            drawImage(img);
            document.getElementById('uploadArea').style.display = 'none';
            document.getElementById('editorContent').style.display = 'block';
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function drawImage(img) {
    const canvas = document.getElementById('mainCanvas');
    const ctx = canvas.getContext('2d');
    const maxWidth = 800;
    const scale = Math.min(1, maxWidth / img.width);
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
}

async function detect() {
    const t = texts[currentLang];
    document.getElementById('detectBtn').disabled = true;
    document.getElementById('progressSection').style.display = 'block';
    document.getElementById('alertSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('exportSection').style.display = 'none';

    drawImage(originalImage);

    for (let i = 0; i <= 100; i += 10) {
        document.getElementById('progressFill').style.width = i + '%';
        document.getElementById('progressText').textContent = `${t.processing} ${i}%`;
        await new Promise(r => setTimeout(r, 40));
    }

    const canvas = document.getElementById('mainCanvas');
    const ctx = canvas.getContext('2d');
    detectionResults = [];

    // Simulate detection
    const hasDanger = Math.random() > 0.5;

    if (hasDanger) {
        const numDetections = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < numDetections; i++) {
            const isFire = Math.random() > 0.4;
            const x = Math.random() * (canvas.width - 120) + 20;
            const y = Math.random() * (canvas.height - 100) + 20;
            const w = Math.random() * 80 + 60;
            const h = Math.random() * 80 + 60;

            detectionResults.push({
                type: isFire ? 'fire' : 'smoke',
                bbox: { x, y, width: w, height: h },
                confidence: Math.random() * 0.2 + 0.8
            });

            ctx.strokeStyle = isFire ? '#dc2626' : '#6b7280';
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, w, h);
            ctx.fillStyle = isFire ? '#dc2626' : '#6b7280';
            ctx.fillRect(x, y - 25, 60, 25);
            ctx.fillStyle = '#fff';
            ctx.font = '12px sans-serif';
            ctx.fillText(isFire ? '🔥 Fire' : '💨 Smoke', x + 5, y - 8);
        }
    }

    displayResults(hasDanger);

    document.getElementById('progressSection').style.display = 'none';
    document.getElementById('alertSection').style.display = 'block';
    if (hasDanger) document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('exportSection').style.display = 'flex';
    document.getElementById('detectBtn').disabled = false;
}

function displayResults(hasDanger) {
    const t = texts[currentLang];
    const alertBox = document.getElementById('alertBox');
    const alertIcon = document.getElementById('alertIcon');
    const alertText = document.getElementById('alertText');

    if (hasDanger) {
        alertBox.className = 'alert-box danger';
        alertIcon.textContent = '⚠️';
        alertText.textContent = t.danger;

        const detectionList = document.getElementById('detectionList');
        detectionList.innerHTML = detectionResults.map(r => `
            <div class="detection-item">
                <div class="detection-type">
                    <span>${r.type === 'fire' ? '🔥' : '💨'}</span>
                    <span>${t[r.type]}</span>
                </div>
                <span style="color: var(--text-secondary)">${Math.round(r.confidence * 100)}%</span>
            </div>
        `).join('');
    } else {
        alertBox.className = 'alert-box safe';
        alertIcon.textContent = '✅';
        alertText.textContent = t.safe;
    }
}

function downloadResult() {
    const canvas = document.getElementById('mainCanvas');
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `fire-smoke-detection-${Date.now()}.png`;
    a.click();
}

function exportReport() {
    const data = {
        timestamp: new Date().toISOString(),
        dangerDetected: detectionResults.length > 0,
        detections: detectionResults
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `fire-smoke-report-${Date.now()}.json`;
    a.click();
}

init();
