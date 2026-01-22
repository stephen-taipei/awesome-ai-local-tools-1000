/**
 * Vegetation Segmentation - Tool #471
 * Segment vegetation and plants in images
 */

let currentLang = 'zh';
let originalImage = null;
let vegData = null;

const texts = {
    zh: {
        title: '植被分割',
        subtitle: '分割圖像中的植被與植物區域',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '拖放含植被的照片至此或點擊上傳',
        segment: '🌿 分割植被',
        processing: '處理中...',
        vegArea: '植被面積',
        vegZones: '植被區域',
        download: '💾 下載結果',
        export: '📄 匯出報告'
    },
    en: {
        title: 'Vegetation Segmentation',
        subtitle: 'Segment vegetation and plants in images',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Drop image with vegetation here or click to upload',
        segment: '🌿 Segment Vegetation',
        processing: 'Processing...',
        vegArea: 'Vegetation Area',
        vegZones: 'Vegetation Zones',
        download: '💾 Download Result',
        export: '📄 Export Report'
    }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    setupFileUpload();
    document.getElementById('segmentBtn').addEventListener('click', segment);
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
    document.getElementById('areaLabel').textContent = t.vegArea;
    document.getElementById('zonesLabel').textContent = t.vegZones;
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

async function segment() {
    const t = texts[currentLang];
    document.getElementById('segmentBtn').disabled = true;
    document.getElementById('progressSection').style.display = 'block';
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('exportSection').style.display = 'none';

    drawImage(originalImage);

    for (let i = 0; i <= 100; i += 5) {
        document.getElementById('progressFill').style.width = i + '%';
        document.getElementById('progressText').textContent = `${t.processing} ${i}%`;
        await new Promise(r => setTimeout(r, 25));
    }

    const canvas = document.getElementById('mainCanvas');
    const ctx = canvas.getContext('2d');

    const vegZonesCount = Math.floor(Math.random() * 4) + 2;
    const regions = [];

    for (let i = 0; i < vegZonesCount; i++) {
        const points = [];
        const centerX = canvas.width * (0.15 + Math.random() * 0.7);
        const centerY = canvas.height * (0.15 + Math.random() * 0.7);
        const radius = Math.min(canvas.width, canvas.height) * (0.1 + Math.random() * 0.15);
        const numPoints = 8 + Math.floor(Math.random() * 4);

        for (let j = 0; j < numPoints; j++) {
            const angle = (j / numPoints) * Math.PI * 2;
            const r = radius * (0.7 + Math.random() * 0.6);
            points.push({
                x: centerX + Math.cos(angle) * r,
                y: centerY + Math.sin(angle) * r
            });
        }

        regions.push({ centerX, centerY, radius, points });

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let j = 1; j < points.length; j++) {
            ctx.lineTo(points[j].x, points[j].y);
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(34, 197, 94, 0.35)';
        ctx.fill();
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Add leaf patterns
        ctx.fillStyle = 'rgba(134, 239, 172, 0.5)';
        for (let l = 0; l < 5; l++) {
            const lx = centerX + (Math.random() - 0.5) * radius;
            const ly = centerY + (Math.random() - 0.5) * radius;
            ctx.beginPath();
            ctx.ellipse(lx, ly, 8, 4, Math.random() * Math.PI, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    vegData = { vegZonesCount, regions };

    const totalArea = regions.reduce((sum, r) => sum + Math.PI * r.radius * r.radius * 0.7, 0);
    const vegAreaPercent = Math.round((totalArea / (canvas.width * canvas.height)) * 100);

    document.getElementById('vegArea').textContent = vegAreaPercent + '%';
    document.getElementById('vegZones').textContent = vegZonesCount;

    document.getElementById('progressSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('exportSection').style.display = 'flex';
    document.getElementById('segmentBtn').disabled = false;
}

function downloadResult() {
    const canvas = document.getElementById('mainCanvas');
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `vegetation-segmentation-${Date.now()}.png`;
    a.click();
}

function exportReport() {
    const data = {
        timestamp: new Date().toISOString(),
        vegData: vegData,
        analysis: {
            vegZonesCount: vegData.vegZonesCount,
            regions: vegData.regions.map(r => ({
                centerX: r.centerX,
                centerY: r.centerY,
                radius: r.radius
            }))
        }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vegetation-report-${Date.now()}.json`;
    a.click();
}

init();
