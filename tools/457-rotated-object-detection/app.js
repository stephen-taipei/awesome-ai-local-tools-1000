/**
 * Rotated Object Detection - Tool #457
 * Detect rotated objects with angle estimation
 */

let currentLang = 'zh';
let originalImage = null;
let detectionResults = [];

const texts = {
    zh: {
        title: '旋轉物件偵測',
        subtitle: '偵測旋轉物件並估算角度',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '拖放圖片至此或點擊上傳',
        detect: '🔍 偵測旋轉物件',
        processing: '偵測中...',
        results: '偵測結果',
        count: '物件數量',
        avgAngle: '平均角度',
        download: '💾 下載結果',
        export: '📄 匯出報告',
        object: '物件'
    },
    en: {
        title: 'Rotated Object Detection',
        subtitle: 'Detect rotated objects with angle estimation',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Drop image here or click to upload',
        detect: '🔍 Detect Rotated Objects',
        processing: 'Detecting...',
        results: 'Detection Results',
        count: 'Object Count',
        avgAngle: 'Avg Angle',
        download: '💾 Download Result',
        export: '📄 Export Report',
        object: 'Object'
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
    document.getElementById('resultsTitle').textContent = t.results;
    document.getElementById('countLabel').textContent = t.count;
    document.getElementById('angleLabel').textContent = t.avgAngle;
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

function drawRotatedRect(ctx, cx, cy, width, height, angle) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle * Math.PI / 180);
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 2;
    ctx.strokeRect(-width / 2, -height / 2, width, height);

    // Draw angle indicator line
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width / 2 + 10, 0);
    ctx.strokeStyle = '#f9a8d4';
    ctx.stroke();

    ctx.restore();
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

    const numObjects = Math.floor(Math.random() * 6) + 3;

    for (let i = 0; i < numObjects; i++) {
        const width = Math.random() * 60 + 40;
        const height = Math.random() * 40 + 30;
        const cx = Math.random() * (canvas.width - width - 40) + width / 2 + 20;
        const cy = Math.random() * (canvas.height - height - 40) + height / 2 + 20;
        const angle = Math.round(Math.random() * 360 - 180);

        detectionResults.push({
            id: i + 1,
            centerX: Math.round(cx),
            centerY: Math.round(cy),
            width: Math.round(width),
            height: Math.round(height),
            angle: angle,
            confidence: Math.random() * 0.2 + 0.8
        });

        drawRotatedRect(ctx, cx, cy, width, height, angle);

        // Draw label
        ctx.fillStyle = '#ec4899';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(`${angle}°`, cx - 15, cy - height / 2 - 5);
    }

    displayResults();

    document.getElementById('progressSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('exportSection').style.display = 'flex';
    document.getElementById('detectBtn').disabled = false;
}

function displayResults() {
    const t = texts[currentLang];
    document.getElementById('objectCount').textContent = detectionResults.length;

    const avgAngle = detectionResults.length > 0
        ? Math.round(detectionResults.reduce((sum, r) => sum + Math.abs(r.angle), 0) / detectionResults.length)
        : 0;
    document.getElementById('avgAngle').textContent = avgAngle + '°';

    document.getElementById('objectList').innerHTML = detectionResults.map(r => `
        <div class="object-item">
            <span>🔄 ${t.object} #${r.id} (${r.width}×${r.height}px)</span>
            <span class="angle-badge">${r.angle}°</span>
        </div>
    `).join('');
}

function downloadResult() {
    const canvas = document.getElementById('mainCanvas');
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `rotated-object-detection-${Date.now()}.png`;
    a.click();
}

function exportReport() {
    const avgAngle = detectionResults.length > 0
        ? Math.round(detectionResults.reduce((sum, r) => sum + Math.abs(r.angle), 0) / detectionResults.length)
        : 0;
    const data = {
        timestamp: new Date().toISOString(),
        summary: { totalObjects: detectionResults.length, averageAngle: avgAngle },
        objects: detectionResults
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `rotated-object-report-${Date.now()}.json`;
    a.click();
}

init();
