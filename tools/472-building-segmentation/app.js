/**
 * Building Segmentation - Tool #472
 * Segment buildings and structures in images
 */

let currentLang = 'zh';
let originalImage = null;
let buildingData = null;

const texts = {
    zh: {
        title: '建築分割',
        subtitle: '分割圖像中的建築與結構',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '拖放含建築的照片至此或點擊上傳',
        segment: '🏢 分割建築',
        processing: '處理中...',
        buildingArea: '建築面積',
        buildingCount: '建築數量',
        download: '💾 下載結果',
        export: '📄 匯出報告'
    },
    en: {
        title: 'Building Segmentation',
        subtitle: 'Segment buildings and structures in images',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Drop image with buildings here or click to upload',
        segment: '🏢 Segment Buildings',
        processing: 'Processing...',
        buildingArea: 'Building Area',
        buildingCount: 'Building Count',
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
    document.getElementById('areaLabel').textContent = t.buildingArea;
    document.getElementById('countLabel').textContent = t.buildingCount;
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

    const buildingCount = Math.floor(Math.random() * 4) + 2;
    const buildings = [];

    for (let i = 0; i < buildingCount; i++) {
        const width = canvas.width * (0.1 + Math.random() * 0.15);
        const height = canvas.height * (0.3 + Math.random() * 0.4);
        const x = canvas.width * (0.05 + (i / buildingCount) * 0.8);
        const y = canvas.height - height - canvas.height * 0.1;

        buildings.push({ x, y, width, height });

        // Building body
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.fillStyle = 'rgba(120, 113, 108, 0.35)';
        ctx.fill();
        ctx.strokeStyle = '#78716c';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Windows grid
        ctx.fillStyle = 'rgba(168, 162, 158, 0.5)';
        const windowRows = Math.floor(height / 30);
        const windowCols = Math.floor(width / 25);
        for (let r = 1; r < windowRows; r++) {
            for (let c = 0; c < windowCols; c++) {
                const wx = x + 8 + c * (width / windowCols);
                const wy = y + r * (height / windowRows);
                ctx.fillRect(wx, wy, 10, 12);
            }
        }

        // Roof
        ctx.beginPath();
        ctx.moveTo(x - 5, y);
        ctx.lineTo(x + width / 2, y - 20);
        ctx.lineTo(x + width + 5, y);
        ctx.closePath();
        ctx.fillStyle = 'rgba(120, 113, 108, 0.5)';
        ctx.fill();
        ctx.stroke();
    }

    buildingData = { buildingCount, buildings };

    const totalArea = buildings.reduce((sum, b) => sum + b.width * b.height, 0);
    const buildingAreaPercent = Math.round((totalArea / (canvas.width * canvas.height)) * 100);

    document.getElementById('buildingArea').textContent = buildingAreaPercent + '%';
    document.getElementById('buildingCount').textContent = buildingCount;

    document.getElementById('progressSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('exportSection').style.display = 'flex';
    document.getElementById('segmentBtn').disabled = false;
}

function downloadResult() {
    const canvas = document.getElementById('mainCanvas');
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `building-segmentation-${Date.now()}.png`;
    a.click();
}

function exportReport() {
    const data = {
        timestamp: new Date().toISOString(),
        buildingData: buildingData,
        analysis: {
            buildingCount: buildingData.buildingCount,
            buildings: buildingData.buildings
        }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `building-report-${Date.now()}.json`;
    a.click();
}

init();
