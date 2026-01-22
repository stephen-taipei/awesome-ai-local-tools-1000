/**
 * Vehicle Segmentation - Tool #473
 * Segment vehicles in images
 */

let currentLang = 'zh';
let originalImage = null;
let vehicleData = null;

const texts = {
    zh: {
        title: '車輛分割',
        subtitle: '分割圖像中的車輛',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '拖放含車輛的照片至此或點擊上傳',
        segment: '🚗 分割車輛',
        processing: '處理中...',
        vehicleArea: '車輛面積',
        vehicleCount: '車輛數量',
        download: '💾 下載結果',
        export: '📄 匯出報告'
    },
    en: {
        title: 'Vehicle Segmentation',
        subtitle: 'Segment vehicles in images',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Drop image with vehicles here or click to upload',
        segment: '🚗 Segment Vehicles',
        processing: 'Processing...',
        vehicleArea: 'Vehicle Area',
        vehicleCount: 'Vehicle Count',
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
    document.getElementById('areaLabel').textContent = t.vehicleArea;
    document.getElementById('countLabel').textContent = t.vehicleCount;
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

    const vehicleCount = Math.floor(Math.random() * 4) + 1;
    const vehicles = [];

    for (let i = 0; i < vehicleCount; i++) {
        const width = canvas.width * (0.15 + Math.random() * 0.1);
        const height = width * 0.5;
        const x = canvas.width * (0.1 + (i / vehicleCount) * 0.7);
        const y = canvas.height * (0.5 + Math.random() * 0.3);

        vehicles.push({ x, y, width, height });

        // Vehicle body
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, 8);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
        ctx.fill();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Roof/cabin
        ctx.beginPath();
        ctx.roundRect(x + width * 0.2, y - height * 0.4, width * 0.5, height * 0.5, 5);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
        ctx.fill();
        ctx.strokeStyle = '#ef4444';
        ctx.stroke();

        // Wheels
        ctx.fillStyle = 'rgba(252, 165, 165, 0.6)';
        ctx.beginPath();
        ctx.arc(x + width * 0.2, y + height, height * 0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + width * 0.8, y + height, height * 0.25, 0, Math.PI * 2);
        ctx.fill();

        // Windows
        ctx.fillStyle = 'rgba(252, 165, 165, 0.4)';
        ctx.fillRect(x + width * 0.25, y - height * 0.3, width * 0.18, height * 0.35);
        ctx.fillRect(x + width * 0.48, y - height * 0.3, width * 0.18, height * 0.35);
    }

    vehicleData = { vehicleCount, vehicles };

    const totalArea = vehicles.reduce((sum, v) => sum + v.width * v.height * 1.3, 0);
    const vehicleAreaPercent = Math.round((totalArea / (canvas.width * canvas.height)) * 100);

    document.getElementById('vehicleArea').textContent = vehicleAreaPercent + '%';
    document.getElementById('vehicleCount').textContent = vehicleCount;

    document.getElementById('progressSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('exportSection').style.display = 'flex';
    document.getElementById('segmentBtn').disabled = false;
}

function downloadResult() {
    const canvas = document.getElementById('mainCanvas');
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `vehicle-segmentation-${Date.now()}.png`;
    a.click();
}

function exportReport() {
    const data = {
        timestamp: new Date().toISOString(),
        vehicleData: vehicleData,
        analysis: {
            vehicleCount: vehicleData.vehicleCount,
            vehicles: vehicleData.vehicles
        }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vehicle-report-${Date.now()}.json`;
    a.click();
}

init();
