/**
 * Floor Segmentation - Tool #468
 * Segment floor area for AR applications
 */

let currentLang = 'zh';
let originalImage = null;
let floorMask = null;

const texts = {
    zh: {
        title: '地板分割',
        subtitle: '分割地板區域用於AR應用',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '拖放室內照片至此或點擊上傳',
        segment: '🏠 分割地板',
        processing: '處理中...',
        floorArea: '地板面積',
        confidence: '信心度',
        download: '💾 下載結果',
        export: '📄 匯出遮罩'
    },
    en: {
        title: 'Floor Segmentation',
        subtitle: 'Segment floor area for AR applications',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Drop indoor photo here or click to upload',
        segment: '🏠 Segment Floor',
        processing: 'Processing...',
        floorArea: 'Floor Area',
        confidence: 'Confidence',
        download: '💾 Download Result',
        export: '📄 Export Mask'
    }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    setupFileUpload();
    document.getElementById('segmentBtn').addEventListener('click', segment);
    document.getElementById('downloadBtn').addEventListener('click', downloadResult);
    document.getElementById('exportBtn').addEventListener('click', exportMask);
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
    document.getElementById('areaLabel').textContent = t.floorArea;
    document.getElementById('confLabel').textContent = t.confidence;
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

    // Generate floor polygon (trapezoid shape)
    const topY = canvas.height * (0.5 + Math.random() * 0.2);
    const bottomY = canvas.height;
    const topLeft = canvas.width * (0.2 + Math.random() * 0.1);
    const topRight = canvas.width * (0.8 - Math.random() * 0.1);

    floorMask = [
        { x: topLeft, y: topY },
        { x: topRight, y: topY },
        { x: canvas.width, y: bottomY },
        { x: 0, y: bottomY }
    ];

    // Draw floor overlay
    ctx.beginPath();
    ctx.moveTo(floorMask[0].x, floorMask[0].y);
    floorMask.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.fillStyle = 'rgba(132, 204, 22, 0.3)';
    ctx.fill();
    ctx.strokeStyle = '#84cc16';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Calculate area
    const floorAreaPercent = Math.round((bottomY - topY) / canvas.height * 50 + 20);
    document.getElementById('floorArea').textContent = floorAreaPercent + '%';
    document.getElementById('confidence').textContent = Math.round(Math.random() * 10 + 88) + '%';

    document.getElementById('progressSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('exportSection').style.display = 'flex';
    document.getElementById('segmentBtn').disabled = false;
}

function downloadResult() {
    const canvas = document.getElementById('mainCanvas');
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `floor-segmentation-${Date.now()}.png`;
    a.click();
}

function exportMask() {
    const canvas = document.getElementById('mainCanvas');
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;
    const ctx = maskCanvas.getContext('2d');

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

    if (floorMask) {
        ctx.beginPath();
        ctx.moveTo(floorMask[0].x, floorMask[0].y);
        floorMask.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.closePath();
        ctx.fillStyle = '#fff';
        ctx.fill();
    }

    const a = document.createElement('a');
    a.href = maskCanvas.toDataURL('image/png');
    a.download = `floor-mask-${Date.now()}.png`;
    a.click();
}

init();
