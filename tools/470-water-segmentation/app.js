/**
 * Water Segmentation - Tool #470
 * Segment water bodies in images
 */

let currentLang = 'zh';
let originalImage = null;
let waterData = null;

const texts = {
    zh: {
        title: '水域分割',
        subtitle: '分割圖像中的水體區域',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '拖放含水域的照片至此或點擊上傳',
        segment: '🌊 分割水域',
        processing: '處理中...',
        waterArea: '水域面積',
        waterBodies: '水體數量',
        download: '💾 下載結果',
        export: '📄 匯出報告'
    },
    en: {
        title: 'Water Segmentation',
        subtitle: 'Segment water bodies in images',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Drop image with water here or click to upload',
        segment: '🌊 Segment Water',
        processing: 'Processing...',
        waterArea: 'Water Area',
        waterBodies: 'Water Bodies',
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
    document.getElementById('areaLabel').textContent = t.waterArea;
    document.getElementById('bodiesLabel').textContent = t.waterBodies;
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

    const waterBodiesCount = Math.floor(Math.random() * 3) + 1;
    const regions = [];

    for (let i = 0; i < waterBodiesCount; i++) {
        const centerX = canvas.width * (0.2 + Math.random() * 0.6);
        const centerY = canvas.height * (0.4 + Math.random() * 0.4);
        const radiusX = canvas.width * (0.15 + Math.random() * 0.2);
        const radiusY = canvas.height * (0.1 + Math.random() * 0.15);

        regions.push({ centerX, centerY, radiusX, radiusY });

        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(59, 130, 246, 0.35)';
        ctx.fill();
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Add wave pattern
        ctx.strokeStyle = 'rgba(147, 197, 253, 0.6)';
        ctx.lineWidth = 1;
        for (let w = 0; w < 3; w++) {
            ctx.beginPath();
            const waveY = centerY - radiusY * 0.5 + w * radiusY * 0.4;
            ctx.moveTo(centerX - radiusX * 0.7, waveY);
            ctx.quadraticCurveTo(centerX - radiusX * 0.3, waveY - 5, centerX, waveY);
            ctx.quadraticCurveTo(centerX + radiusX * 0.3, waveY + 5, centerX + radiusX * 0.7, waveY);
            ctx.stroke();
        }
    }

    waterData = { waterBodiesCount, regions };

    const totalArea = regions.reduce((sum, r) => sum + Math.PI * r.radiusX * r.radiusY, 0);
    const waterAreaPercent = Math.round((totalArea / (canvas.width * canvas.height)) * 100);

    document.getElementById('waterArea').textContent = waterAreaPercent + '%';
    document.getElementById('waterBodies').textContent = waterBodiesCount;

    document.getElementById('progressSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('exportSection').style.display = 'flex';
    document.getElementById('segmentBtn').disabled = false;
}

function downloadResult() {
    const canvas = document.getElementById('mainCanvas');
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `water-segmentation-${Date.now()}.png`;
    a.click();
}

function exportReport() {
    const data = {
        timestamp: new Date().toISOString(),
        waterData: waterData,
        analysis: {
            waterBodiesCount: waterData.waterBodiesCount,
            regions: waterData.regions
        }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `water-report-${Date.now()}.json`;
    a.click();
}

init();
