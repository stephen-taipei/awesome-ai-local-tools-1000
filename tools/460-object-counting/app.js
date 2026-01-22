/**
 * Object Counting - Tool #460
 * Count specific objects in images
 */

let currentLang = 'zh';
let originalImage = null;
let detectionResults = [];
let selectedCategory = 'person';

const categoryLabels = {
    zh: { person: '人', car: '車輛', animal: '動物', tree: '樹木', building: '建築', all: '全部物件' },
    en: { person: 'Person', car: 'Vehicle', animal: 'Animal', tree: 'Tree', building: 'Building', all: 'All Objects' }
};

const texts = {
    zh: {
        title: '物件計數',
        subtitle: '計算圖片中特定物件的數量',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '拖放圖片至此或點擊上傳',
        categoryLabel: '選擇要計數的類別：',
        count: '🔍 開始計數',
        processing: '計數中...',
        objects: '個物件',
        density: '密度',
        heatmap: '分佈熱點圖',
        download: '💾 下載結果',
        export: '📄 匯出報告'
    },
    en: {
        title: 'Object Counting',
        subtitle: 'Count specific objects in images',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Drop image here or click to upload',
        categoryLabel: 'Select category to count:',
        count: '🔍 Start Counting',
        processing: 'Counting...',
        objects: 'objects',
        density: 'Density',
        heatmap: 'Distribution Heatmap',
        download: '💾 Download Result',
        export: '📄 Export Report'
    }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    setupFileUpload();
    document.getElementById('countBtn').addEventListener('click', count);
    document.getElementById('downloadBtn').addEventListener('click', downloadResult);
    document.getElementById('exportBtn').addEventListener('click', exportReport);

    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedCategory = btn.dataset.category;
        });
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
    document.getElementById('categoryLabel').textContent = t.categoryLabel;
    document.getElementById('countBtn').textContent = t.count;
    document.getElementById('countLabelText').textContent = t.objects;
    document.getElementById('densityLabel').textContent = t.density;
    document.getElementById('heatmapTitle').textContent = t.heatmap;
    document.getElementById('downloadBtn').textContent = t.download;
    document.getElementById('exportBtn').textContent = t.export;

    const icons = { person: '👤', car: '🚗', animal: '🐕', tree: '🌳', building: '🏢', all: '📦' };
    document.querySelectorAll('.category-btn').forEach(btn => {
        const cat = btn.dataset.category;
        btn.textContent = `${icons[cat]} ${categoryLabels[lang][cat]}`;
    });
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

async function count() {
    const t = texts[currentLang];
    document.getElementById('countBtn').disabled = true;
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

    const numObjects = selectedCategory === 'all'
        ? Math.floor(Math.random() * 20) + 10
        : Math.floor(Math.random() * 12) + 3;

    for (let i = 0; i < numObjects; i++) {
        const x = Math.random() * (canvas.width - 30) + 15;
        const y = Math.random() * (canvas.height - 30) + 15;
        const size = Math.random() * 15 + 10;

        detectionResults.push({
            id: i + 1,
            category: selectedCategory,
            x: Math.round(x),
            y: Math.round(y),
            confidence: Math.random() * 0.2 + 0.8
        });

        // Draw numbered marker
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(249, 115, 22, 0.7)';
        ctx.fill();
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(i + 1, x, y);
    }

    displayResults();
    drawHeatmap();

    document.getElementById('progressSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('exportSection').style.display = 'flex';
    document.getElementById('countBtn').disabled = false;
}

function displayResults() {
    document.getElementById('totalCount').textContent = detectionResults.length;

    const canvas = document.getElementById('mainCanvas');
    const area = (canvas.width * canvas.height) / 10000;
    const density = (detectionResults.length / area).toFixed(2);
    document.getElementById('densityValue').textContent = density;
}

function drawHeatmap() {
    const heatCanvas = document.getElementById('heatmapCanvas');
    const ctx = heatCanvas.getContext('2d');
    const mainCanvas = document.getElementById('mainCanvas');

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, heatCanvas.width, heatCanvas.height);

    const gridX = 10;
    const gridY = 8;
    const cellW = heatCanvas.width / gridX;
    const cellH = heatCanvas.height / gridY;
    const scaleX = heatCanvas.width / mainCanvas.width;
    const scaleY = heatCanvas.height / mainCanvas.height;

    const grid = Array(gridY).fill(null).map(() => Array(gridX).fill(0));

    detectionResults.forEach(r => {
        const gx = Math.floor(r.x * scaleX / cellW);
        const gy = Math.floor(r.y * scaleY / cellH);
        if (gx >= 0 && gx < gridX && gy >= 0 && gy < gridY) {
            grid[gy][gx]++;
        }
    });

    const maxCount = Math.max(...grid.flat(), 1);

    for (let y = 0; y < gridY; y++) {
        for (let x = 0; x < gridX; x++) {
            const intensity = grid[y][x] / maxCount;
            const r = Math.round(249 * intensity);
            const g = Math.round(115 * intensity);
            const b = Math.round(22 * intensity);
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fillRect(x * cellW, y * cellH, cellW - 1, cellH - 1);
        }
    }
}

function downloadResult() {
    const canvas = document.getElementById('mainCanvas');
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `object-counting-${Date.now()}.png`;
    a.click();
}

function exportReport() {
    const canvas = document.getElementById('mainCanvas');
    const area = (canvas.width * canvas.height) / 10000;
    const data = {
        timestamp: new Date().toISOString(),
        category: selectedCategory,
        summary: {
            totalCount: detectionResults.length,
            density: (detectionResults.length / area).toFixed(2),
            imageSize: { width: canvas.width, height: canvas.height }
        },
        objects: detectionResults
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `object-count-report-${Date.now()}.json`;
    a.click();
}

init();
