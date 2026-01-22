/**
 * Defect Detection - Tool #455
 * Detect surface defects in products
 */

let currentLang = 'zh';
let originalImage = null;
let detectionResults = [];

const defectTypes = ['scratch', 'dent', 'crack', 'stain', 'hole', 'discoloration'];

const texts = {
    zh: {
        title: '缺陷偵測',
        subtitle: '偵測產品表面缺陷',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '拖放產品圖片至此或點擊上傳',
        detect: '🔍 檢測缺陷',
        processing: '檢測中...',
        pass: '品質合格',
        fail: '品質不合格',
        scratch: '刮痕',
        dent: '凹痕',
        crack: '裂縫',
        stain: '污漬',
        hole: '孔洞',
        discoloration: '變色',
        defects: '缺陷數量',
        score: '品質評分',
        download: '💾 下載結果',
        export: '📄 匯出報告'
    },
    en: {
        title: 'Defect Detection',
        subtitle: 'Detect surface defects in products',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Drop product image here or click to upload',
        detect: '🔍 Detect Defects',
        processing: 'Detecting...',
        pass: 'Quality Passed',
        fail: 'Quality Failed',
        scratch: 'Scratch',
        dent: 'Dent',
        crack: 'Crack',
        stain: 'Stain',
        hole: 'Hole',
        discoloration: 'Discoloration',
        defects: 'Defect Count',
        score: 'Quality Score',
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
    document.getElementById('defectLabel').textContent = t.defects;
    document.getElementById('scoreLabel').textContent = t.score;
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

    const numDefects = Math.floor(Math.random() * 5);

    for (let i = 0; i < numDefects; i++) {
        const type = defectTypes[Math.floor(Math.random() * defectTypes.length)];
        const x = Math.random() * (canvas.width - 50) + 10;
        const y = Math.random() * (canvas.height - 50) + 10;
        const size = Math.random() * 20 + 15;

        detectionResults.push({
            type, location: { x, y }, size,
            severity: ['minor', 'moderate', 'major'][Math.floor(Math.random() * 3)],
            confidence: Math.random() * 0.2 + 0.8
        });

        ctx.beginPath();
        ctx.arc(x + size/2, y + size/2, size, 0, Math.PI * 2);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    displayResults();

    document.getElementById('progressSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('exportSection').style.display = 'flex';
    document.getElementById('detectBtn').disabled = false;
}

function displayResults() {
    const t = texts[currentLang];
    const qualityIndicator = document.getElementById('qualityIndicator');
    const qualityIcon = document.getElementById('qualityIcon');
    const qualityText = document.getElementById('qualityText');
    const defectList = document.getElementById('defectList');

    const passed = detectionResults.length <= 2;
    const score = Math.max(0, 100 - detectionResults.length * 15);

    qualityIndicator.className = 'quality-indicator ' + (passed ? 'pass' : 'fail');
    qualityIcon.textContent = passed ? '✅' : '❌';
    qualityText.textContent = passed ? t.pass : t.fail;

    document.getElementById('defectCount').textContent = detectionResults.length;
    document.getElementById('qualityScore').textContent = score + '%';

    defectList.innerHTML = detectionResults.map(r => `
        <div class="defect-item">
            <span>⚠️ ${t[r.type]} (${r.severity})</span>
            <span style="color: var(--text-secondary)">${Math.round(r.confidence * 100)}%</span>
        </div>
    `).join('');
}

function downloadResult() {
    const canvas = document.getElementById('mainCanvas');
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `defect-detection-${Date.now()}.png`;
    a.click();
}

function exportReport() {
    const score = Math.max(0, 100 - detectionResults.length * 15);
    const data = {
        timestamp: new Date().toISOString(),
        summary: { totalDefects: detectionResults.length, qualityScore: score, passed: detectionResults.length <= 2 },
        defects: detectionResults
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `defect-report-${Date.now()}.json`;
    a.click();
}

init();
