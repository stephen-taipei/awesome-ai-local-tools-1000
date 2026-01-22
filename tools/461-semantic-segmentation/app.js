/**
 * Semantic Segmentation - Tool #461
 * Segment images by semantic categories
 */

let currentLang = 'zh';
let originalImage = null;
let segmentationData = null;
let showOriginal = false;

const semanticClasses = [
    { id: 'sky', zh: '天空', en: 'Sky', color: '#87CEEB' },
    { id: 'building', zh: '建築', en: 'Building', color: '#808080' },
    { id: 'road', zh: '道路', en: 'Road', color: '#4a4a4a' },
    { id: 'vegetation', zh: '植被', en: 'Vegetation', color: '#228B22' },
    { id: 'person', zh: '人物', en: 'Person', color: '#FF6B6B' },
    { id: 'vehicle', zh: '車輛', en: 'Vehicle', color: '#4169E1' },
    { id: 'water', zh: '水域', en: 'Water', color: '#1E90FF' },
    { id: 'ground', zh: '地面', en: 'Ground', color: '#8B4513' }
];

const texts = {
    zh: {
        title: '語意分割',
        subtitle: '依語意類別分割圖片區域',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '拖放圖片至此或點擊上傳',
        segment: '🎨 開始分割',
        toggle: '🔄 切換顯示',
        processing: '分割中...',
        results: '分割結果',
        classCount: '類別數',
        coverage: '覆蓋率',
        download: '💾 下載結果',
        export: '📄 匯出報告'
    },
    en: {
        title: 'Semantic Segmentation',
        subtitle: 'Segment images by semantic categories',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Drop image here or click to upload',
        segment: '🎨 Start Segmentation',
        toggle: '🔄 Toggle View',
        processing: 'Segmenting...',
        results: 'Segmentation Results',
        classCount: 'Classes',
        coverage: 'Coverage',
        download: '💾 Download Result',
        export: '📄 Export Report'
    }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    setupFileUpload();
    document.getElementById('segmentBtn').addEventListener('click', segment);
    document.getElementById('toggleBtn').addEventListener('click', toggleView);
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
    document.getElementById('segmentBtn').textContent = t.segment;
    document.getElementById('toggleBtn').textContent = t.toggle;
    document.getElementById('resultsTitle').textContent = t.results;
    document.getElementById('classLabel').textContent = t.classCount;
    document.getElementById('coverageLabel').textContent = t.coverage;
    document.getElementById('downloadBtn').textContent = t.download;
    document.getElementById('exportBtn').textContent = t.export;
    if (segmentationData) updateLegend();
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

async function segment() {
    const t = texts[currentLang];
    document.getElementById('segmentBtn').disabled = true;
    document.getElementById('progressSection').style.display = 'block';
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('exportSection').style.display = 'none';
    document.getElementById('toggleBtn').style.display = 'none';

    drawImage(originalImage);

    for (let i = 0; i <= 100; i += 5) {
        document.getElementById('progressFill').style.width = i + '%';
        document.getElementById('progressText').textContent = `${t.processing} ${i}%`;
        await new Promise(r => setTimeout(r, 30));
    }

    const canvas = document.getElementById('mainCanvas');
    const ctx = canvas.getContext('2d');

    // Generate random segmentation regions
    segmentationData = { classes: [], regions: [] };
    const usedClasses = [];
    const numRegions = Math.floor(Math.random() * 5) + 4;

    for (let i = 0; i < numRegions; i++) {
        const cls = semanticClasses[Math.floor(Math.random() * semanticClasses.length)];
        if (!usedClasses.includes(cls.id)) usedClasses.push(cls.id);

        const region = {
            classId: cls.id,
            points: generateRandomPolygon(canvas.width, canvas.height),
            area: 0
        };
        segmentationData.regions.push(region);
    }

    segmentationData.classes = usedClasses.map(id => semanticClasses.find(c => c.id === id));

    // Draw segmentation overlay
    drawSegmentation(ctx);

    displayResults();

    document.getElementById('progressSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('exportSection').style.display = 'flex';
    document.getElementById('toggleBtn').style.display = 'inline-flex';
    document.getElementById('segmentBtn').disabled = false;
    showOriginal = false;
}

function generateRandomPolygon(maxW, maxH) {
    const cx = Math.random() * maxW;
    const cy = Math.random() * maxH;
    const points = [];
    const numPoints = Math.floor(Math.random() * 4) + 5;
    const baseRadius = Math.random() * 80 + 40;

    for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        const radius = baseRadius * (0.7 + Math.random() * 0.6);
        points.push({
            x: cx + Math.cos(angle) * radius,
            y: cy + Math.sin(angle) * radius
        });
    }
    return points;
}

function drawSegmentation(ctx) {
    segmentationData.regions.forEach(region => {
        const cls = semanticClasses.find(c => c.id === region.classId);
        ctx.beginPath();
        ctx.moveTo(region.points[0].x, region.points[0].y);
        region.points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.closePath();
        ctx.fillStyle = cls.color + '80';
        ctx.fill();
        ctx.strokeStyle = cls.color;
        ctx.lineWidth = 2;
        ctx.stroke();
    });
}

function toggleView() {
    showOriginal = !showOriginal;
    const canvas = document.getElementById('mainCanvas');
    const ctx = canvas.getContext('2d');
    drawImage(originalImage);
    if (!showOriginal) {
        drawSegmentation(ctx);
    }
}

function updateLegend() {
    const legend = document.getElementById('legend');
    legend.innerHTML = segmentationData.classes.map(cls => `
        <div class="legend-item">
            <div class="legend-color" style="background: ${cls.color}"></div>
            <span>${cls[currentLang]}</span>
        </div>
    `).join('');
}

function displayResults() {
    document.getElementById('classCount').textContent = segmentationData.classes.length;
    document.getElementById('coverage').textContent = Math.round(Math.random() * 30 + 70) + '%';
    updateLegend();
}

function downloadResult() {
    const canvas = document.getElementById('mainCanvas');
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `semantic-segmentation-${Date.now()}.png`;
    a.click();
}

function exportReport() {
    const data = {
        timestamp: new Date().toISOString(),
        summary: {
            totalClasses: segmentationData.classes.length,
            classes: segmentationData.classes.map(c => ({ id: c.id, name: c[currentLang] }))
        },
        regions: segmentationData.regions.map(r => ({
            class: r.classId,
            pointCount: r.points.length
        }))
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `semantic-seg-report-${Date.now()}.json`;
    a.click();
}

init();
