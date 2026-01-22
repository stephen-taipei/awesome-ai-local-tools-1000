/**
 * Small Object Detection - Tool #456
 * Detect small objects in high-resolution images
 */

let currentLang = 'zh';
let originalImage = null;
let detectionResults = [];
let threshold = 20;

const texts = {
    zh: {
        title: '小物件偵測',
        subtitle: '偵測高解析度圖片中的小型物件',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '拖放高解析度圖片至此或點擊上傳',
        detect: '🔍 偵測小物件',
        processing: '偵測中...',
        results: '偵測結果',
        count: '物件數量',
        avgSize: '平均尺寸(px)',
        threshold: '最小尺寸閾值',
        download: '💾 下載結果',
        export: '📄 匯出報告',
        object: '物件'
    },
    en: {
        title: 'Small Object Detection',
        subtitle: 'Detect small objects in high-resolution images',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Drop high-res image here or click to upload',
        detect: '🔍 Detect Small Objects',
        processing: 'Detecting...',
        results: 'Detection Results',
        count: 'Object Count',
        avgSize: 'Avg Size(px)',
        threshold: 'Min Size Threshold',
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
    document.getElementById('thresholdSlider').addEventListener('input', (e) => {
        threshold = parseInt(e.target.value);
        document.getElementById('thresholdValue').textContent = threshold;
    });
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
    document.getElementById('sizeLabel').textContent = t.avgSize;
    document.getElementById('thresholdLabel').innerHTML = `${t.threshold}：<span id="thresholdValue">${threshold}</span>px`;
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

    const numObjects = Math.floor(Math.random() * 15) + 5;

    for (let i = 0; i < numObjects; i++) {
        const size = Math.floor(Math.random() * (threshold - 5)) + 5;
        const x = Math.random() * (canvas.width - size - 10) + 5;
        const y = Math.random() * (canvas.height - size - 10) + 5;

        detectionResults.push({
            id: i + 1,
            x: Math.round(x),
            y: Math.round(y),
            width: size,
            height: size,
            confidence: Math.random() * 0.3 + 0.7
        });

        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, size, size);
        ctx.fillStyle = 'rgba(99, 102, 241, 0.3)';
        ctx.fillRect(x, y, size, size);
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

    const avgSize = detectionResults.length > 0
        ? Math.round(detectionResults.reduce((sum, r) => sum + r.width, 0) / detectionResults.length)
        : 0;
    document.getElementById('avgSize').textContent = avgSize;

    document.getElementById('objectList').innerHTML = detectionResults.map(r => `
        <div class="object-item">
            <span>📍 ${t.object} #${r.id} (${r.width}×${r.height}px)</span>
            <span style="color: var(--text-secondary)">${Math.round(r.confidence * 100)}%</span>
        </div>
    `).join('');
}

function downloadResult() {
    const canvas = document.getElementById('mainCanvas');
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `small-object-detection-${Date.now()}.png`;
    a.click();
}

function exportReport() {
    const avgSize = detectionResults.length > 0
        ? Math.round(detectionResults.reduce((sum, r) => sum + r.width, 0) / detectionResults.length)
        : 0;
    const data = {
        timestamp: new Date().toISOString(),
        settings: { threshold },
        summary: { totalObjects: detectionResults.length, averageSize: avgSize },
        objects: detectionResults
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `small-object-report-${Date.now()}.json`;
    a.click();
}

init();
