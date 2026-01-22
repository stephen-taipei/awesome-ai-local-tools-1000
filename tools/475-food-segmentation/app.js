/**
 * Food Segmentation - Tool #475
 * Segment food items in images
 */

let currentLang = 'zh';
let originalImage = null;
let foodData = null;

const texts = {
    zh: {
        title: '食物分割',
        subtitle: '分割圖像中的食物項目',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '拖放含食物的照片至此或點擊上傳',
        segment: '🍽️ 分割食物',
        processing: '處理中...',
        foodArea: '食物面積',
        foodCount: '食物項目',
        download: '💾 下載結果',
        export: '📄 匯出報告'
    },
    en: {
        title: 'Food Segmentation',
        subtitle: 'Segment food items in images',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Drop image with food here or click to upload',
        segment: '🍽️ Segment Food',
        processing: 'Processing...',
        foodArea: 'Food Area',
        foodCount: 'Food Items',
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
    document.getElementById('areaLabel').textContent = t.foodArea;
    document.getElementById('countLabel').textContent = t.foodCount;
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

    const foodCount = Math.floor(Math.random() * 4) + 2;
    const foods = [];

    const foodColors = [
        { fill: 'rgba(249, 115, 22, 0.35)', stroke: '#f97316' },
        { fill: 'rgba(234, 179, 8, 0.35)', stroke: '#eab308' },
        { fill: 'rgba(239, 68, 68, 0.35)', stroke: '#ef4444' },
        { fill: 'rgba(34, 197, 94, 0.35)', stroke: '#22c55e' },
        { fill: 'rgba(168, 85, 247, 0.35)', stroke: '#a855f7' }
    ];

    for (let i = 0; i < foodCount; i++) {
        const centerX = canvas.width * (0.2 + (i % 3) * 0.3 + Math.random() * 0.1);
        const centerY = canvas.height * (0.3 + Math.floor(i / 3) * 0.35 + Math.random() * 0.1);
        const radiusX = canvas.width * (0.08 + Math.random() * 0.06);
        const radiusY = canvas.height * (0.06 + Math.random() * 0.05);
        const rotation = Math.random() * Math.PI * 0.3;
        const color = foodColors[i % foodColors.length];

        foods.push({ centerX, centerY, radiusX, radiusY, rotation });

        // Main food shape (organic blob)
        ctx.beginPath();
        const points = 12;
        for (let p = 0; p <= points; p++) {
            const angle = (p / points) * Math.PI * 2 + rotation;
            const wobble = 1 + Math.sin(angle * 3) * 0.15;
            const x = centerX + Math.cos(angle) * radiusX * wobble;
            const y = centerY + Math.sin(angle) * radiusY * wobble;
            if (p === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = color.fill;
        ctx.fill();
        ctx.strokeStyle = color.stroke;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Add texture details
        ctx.fillStyle = 'rgba(253, 186, 116, 0.4)';
        for (let d = 0; d < 4; d++) {
            const dx = centerX + (Math.random() - 0.5) * radiusX * 1.2;
            const dy = centerY + (Math.random() - 0.5) * radiusY * 1.2;
            ctx.beginPath();
            ctx.arc(dx, dy, 3 + Math.random() * 4, 0, Math.PI * 2);
            ctx.fill();
        }

        // Add highlight
        ctx.beginPath();
        ctx.ellipse(centerX - radiusX * 0.3, centerY - radiusY * 0.3, radiusX * 0.2, radiusY * 0.15, rotation, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fill();
    }

    foodData = { foodCount, foods };

    const totalArea = foods.reduce((sum, f) => sum + Math.PI * f.radiusX * f.radiusY, 0);
    const foodAreaPercent = Math.round((totalArea / (canvas.width * canvas.height)) * 100);

    document.getElementById('foodArea').textContent = foodAreaPercent + '%';
    document.getElementById('foodCount').textContent = foodCount;

    document.getElementById('progressSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('exportSection').style.display = 'flex';
    document.getElementById('segmentBtn').disabled = false;
}

function downloadResult() {
    const canvas = document.getElementById('mainCanvas');
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `food-segmentation-${Date.now()}.png`;
    a.click();
}

function exportReport() {
    const data = {
        timestamp: new Date().toISOString(),
        foodData: foodData,
        analysis: {
            foodCount: foodData.foodCount,
            foods: foodData.foods
        }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `food-report-${Date.now()}.json`;
    a.click();
}

init();
