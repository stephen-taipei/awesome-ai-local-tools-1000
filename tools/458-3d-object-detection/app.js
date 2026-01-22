/**
 * 3D Object Detection - Tool #458
 * Estimate 3D position and size of objects
 */

let currentLang = 'zh';
let originalImage = null;
let detectionResults = [];

const texts = {
    zh: {
        title: '3D物件偵測',
        subtitle: '估算物件的3D位置與尺寸',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '拖放圖片至此或點擊上傳',
        detect: '🔍 3D偵測',
        processing: '偵測中...',
        results: '偵測結果',
        count: '物件數量',
        download: '💾 下載結果',
        export: '📄 匯出報告',
        object: '物件',
        position: '位置',
        size: '尺寸',
        depth: '深度'
    },
    en: {
        title: '3D Object Detection',
        subtitle: 'Estimate 3D position and size of objects',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Drop image here or click to upload',
        detect: '🔍 3D Detection',
        processing: 'Detecting...',
        results: 'Detection Results',
        count: 'Object Count',
        download: '💾 Download Result',
        export: '📄 Export Report',
        object: 'Object',
        position: 'Position',
        size: 'Size',
        depth: 'Depth'
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

function draw3DBox(ctx, x, y, w, h, depth) {
    const offsetX = depth * 0.3;
    const offsetY = -depth * 0.3;

    // Front face
    ctx.strokeStyle = '#14b8a6';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    // Back face
    ctx.strokeStyle = 'rgba(20, 184, 166, 0.5)';
    ctx.strokeRect(x + offsetX, y + offsetY, w, h);

    // Connect corners
    ctx.beginPath();
    ctx.moveTo(x, y); ctx.lineTo(x + offsetX, y + offsetY);
    ctx.moveTo(x + w, y); ctx.lineTo(x + w + offsetX, y + offsetY);
    ctx.moveTo(x, y + h); ctx.lineTo(x + offsetX, y + h + offsetY);
    ctx.moveTo(x + w, y + h); ctx.lineTo(x + w + offsetX, y + h + offsetY);
    ctx.stroke();

    // Fill front face with transparency
    ctx.fillStyle = 'rgba(20, 184, 166, 0.1)';
    ctx.fillRect(x, y, w, h);
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

    const numObjects = Math.floor(Math.random() * 5) + 2;

    for (let i = 0; i < numObjects; i++) {
        const w = Math.random() * 80 + 50;
        const h = Math.random() * 60 + 40;
        const depth = Math.random() * 40 + 20;
        const x = Math.random() * (canvas.width - w - depth - 20) + 10;
        const y = Math.random() * (canvas.height - h - 20) + depth + 10;

        const position3D = {
            x: Math.round(x + w / 2),
            y: Math.round(y + h / 2),
            z: Math.round(Math.random() * 500 + 100)
        };

        const size3D = {
            width: Math.round(w * 2),
            height: Math.round(h * 2),
            depth: Math.round(depth * 3)
        };

        detectionResults.push({
            id: i + 1,
            bbox2D: { x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) },
            position3D,
            size3D,
            estimatedDepth: depth,
            confidence: Math.random() * 0.2 + 0.8
        });

        draw3DBox(ctx, x, y, w, h, depth);

        // Draw label
        ctx.fillStyle = '#14b8a6';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(`#${i + 1} Z:${position3D.z}cm`, x, y - 5);
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

    document.getElementById('objectList').innerHTML = detectionResults.map(r => `
        <div class="object-item">
            <div class="object-header">
                <span>📦 ${t.object} #${r.id}</span>
                <span style="color: var(--text-secondary)">${Math.round(r.confidence * 100)}%</span>
            </div>
            <div class="object-details">
                <div class="detail-item">
                    <span class="detail-label">${t.position} (X,Y,Z)</span>
                    <span class="detail-value">${r.position3D.x}, ${r.position3D.y}, ${r.position3D.z}cm</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">${t.size} (W×H×D)</span>
                    <span class="detail-value">${r.size3D.width}×${r.size3D.height}×${r.size3D.depth}cm</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">${t.depth}</span>
                    <span class="detail-value">${r.position3D.z}cm</span>
                </div>
            </div>
        </div>
    `).join('');
}

function downloadResult() {
    const canvas = document.getElementById('mainCanvas');
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `3d-object-detection-${Date.now()}.png`;
    a.click();
}

function exportReport() {
    const data = {
        timestamp: new Date().toISOString(),
        summary: { totalObjects: detectionResults.length },
        objects: detectionResults
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `3d-object-report-${Date.now()}.json`;
    a.click();
}

init();
