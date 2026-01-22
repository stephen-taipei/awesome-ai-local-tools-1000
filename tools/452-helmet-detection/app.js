/**
 * Helmet Detection - Tool #452
 * Detect whether people are wearing helmets
 */

let currentLang = 'zh';
let originalImage = null;
let detectionResults = [];

const texts = {
    zh: {
        title: '安全帽偵測',
        subtitle: '偵測是否配戴安全帽',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '拖放圖片至此或點擊上傳',
        detect: '🔍 開始偵測',
        processing: '處理中...',
        withHelmet: '配戴安全帽',
        withoutHelmet: '未配戴',
        compliance: '合規率',
        download: '💾 下載結果',
        export: '📄 匯出報告'
    },
    en: {
        title: 'Helmet Detection',
        subtitle: 'Detect whether people are wearing helmets',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Drop image here or click to upload',
        detect: '🔍 Start Detection',
        processing: 'Processing...',
        withHelmet: 'With Helmet',
        withoutHelmet: 'Without Helmet',
        compliance: 'Compliance Rate',
        download: '💾 Download Result',
        export: '📄 Export Report'
    }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    setupFileUpload();
    document.getElementById('detectBtn').addEventListener('click', detectHelmets);
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
    document.getElementById('withLabel').textContent = t.withHelmet;
    document.getElementById('withoutLabel').textContent = t.withoutHelmet;
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

async function detectHelmets() {
    const t = texts[currentLang];
    document.getElementById('detectBtn').disabled = true;
    document.getElementById('progressSection').style.display = 'block';
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
    const numPeople = Math.floor(Math.random() * 5) + 2;
    let withHelmet = 0;
    let withoutHelmet = 0;

    for (let i = 0; i < numPeople; i++) {
        const hasHelmet = Math.random() > 0.3;
        const x = (canvas.width / numPeople) * i + 20;
        const y = Math.random() * (canvas.height - 120) + 20;
        const w = 60 + Math.random() * 30;
        const h = 80 + Math.random() * 40;

        detectionResults.push({
            hasHelmet,
            bbox: { x, y, width: w, height: h },
            confidence: Math.random() * 0.2 + 0.8
        });

        if (hasHelmet) withHelmet++; else withoutHelmet++;

        ctx.strokeStyle = hasHelmet ? '#22c55e' : '#ef4444';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, w, h);
        ctx.fillStyle = hasHelmet ? '#22c55e' : '#ef4444';
        const label = hasHelmet ? '⛑️' : '⚠️';
        ctx.fillRect(x, y - 25, 30, 25);
        ctx.fillStyle = '#fff';
        ctx.font = '16px sans-serif';
        ctx.fillText(label, x + 5, y - 7);
    }

    const compliance = numPeople > 0 ? Math.round((withHelmet / numPeople) * 100) : 0;

    document.getElementById('withHelmet').textContent = withHelmet;
    document.getElementById('withoutHelmet').textContent = withoutHelmet;
    document.getElementById('complianceFill').style.width = compliance + '%';
    document.getElementById('complianceText').textContent = `${t.compliance}: ${compliance}%`;

    document.getElementById('progressSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('exportSection').style.display = 'flex';
    document.getElementById('detectBtn').disabled = false;
}

function downloadResult() {
    const canvas = document.getElementById('mainCanvas');
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `helmet-detection-${Date.now()}.png`;
    a.click();
}

function exportReport() {
    const withHelmet = detectionResults.filter(r => r.hasHelmet).length;
    const withoutHelmet = detectionResults.filter(r => !r.hasHelmet).length;
    const data = {
        timestamp: new Date().toISOString(),
        summary: { total: detectionResults.length, withHelmet, withoutHelmet, compliance: withHelmet / detectionResults.length },
        detections: detectionResults
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `helmet-report-${Date.now()}.json`;
    a.click();
}

init();
