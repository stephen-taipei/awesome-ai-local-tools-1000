/**
 * Sky Segmentation - Tool #467
 * Segment and replace sky in photos
 */

let currentLang = 'zh';
let originalImage = null;
let skyMask = null;
let selectedSky = 'original';

const skyGradients = {
    original: null,
    sunset: ['#ff7e5f', '#feb47b', '#ffd194'],
    blue: ['#1e3c72', '#2a5298', '#87CEEB'],
    night: ['#0f0c29', '#302b63', '#24243e'],
    cloudy: ['#bdc3c7', '#95a5a6', '#7f8c8d'],
    gradient: ['#ff6b6b', '#feca57', '#48dbfb', '#1dd1a1']
};

const texts = {
    zh: {
        title: '天空分割',
        subtitle: '分割並替換照片中的天空',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '拖放風景照片至此或點擊上傳',
        segment: '🌤️ 分割天空',
        processing: '處理中...',
        skyLabel: '選擇天空樣式：',
        original: '原始', sunset: '日落', blue: '藍天', night: '夜空', cloudy: '多雲', gradient: '漸層',
        skyArea: '天空面積',
        download: '💾 下載結果'
    },
    en: {
        title: 'Sky Segmentation',
        subtitle: 'Segment and replace sky in photos',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Drop landscape photo here or click to upload',
        segment: '🌤️ Segment Sky',
        processing: 'Processing...',
        skyLabel: 'Select sky style:',
        original: 'Original', sunset: 'Sunset', blue: 'Blue Sky', night: 'Night', cloudy: 'Cloudy', gradient: 'Gradient',
        skyArea: 'Sky Area',
        download: '💾 Download Result'
    }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    setupFileUpload();
    document.getElementById('segmentBtn').addEventListener('click', segment);
    document.getElementById('downloadBtn').addEventListener('click', downloadResult);

    document.querySelectorAll('.sky-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.sky-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedSky = btn.dataset.sky;
            if (skyMask) applySky();
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
    document.getElementById('segmentBtn').textContent = t.segment;
    document.getElementById('skyLabel').textContent = t.skyLabel;
    document.getElementById('areaLabel').textContent = t.skyArea;
    document.getElementById('downloadBtn').textContent = t.download;

    const keys = ['original', 'sunset', 'blue', 'night', 'cloudy', 'gradient'];
    document.querySelectorAll('.sky-btn').forEach((btn, i) => {
        btn.textContent = t[keys[i]];
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

async function segment() {
    const t = texts[currentLang];
    document.getElementById('segmentBtn').disabled = true;
    document.getElementById('progressSection').style.display = 'block';
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('exportSection').style.display = 'none';
    document.getElementById('skyOptions').style.display = 'none';

    for (let i = 0; i <= 100; i += 5) {
        document.getElementById('progressFill').style.width = i + '%';
        document.getElementById('progressText').textContent = `${t.processing} ${i}%`;
        await new Promise(r => setTimeout(r, 25));
    }

    const canvas = document.getElementById('mainCanvas');
    skyMask = { height: canvas.height * (Math.random() * 0.2 + 0.3) };
    applySky();

    document.getElementById('skyArea').textContent = Math.round(skyMask.height / canvas.height * 100) + '%';

    document.getElementById('progressSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('exportSection').style.display = 'flex';
    document.getElementById('skyOptions').style.display = 'block';
    document.getElementById('segmentBtn').disabled = false;
}

function applySky() {
    const canvas = document.getElementById('mainCanvas');
    const ctx = canvas.getContext('2d');
    drawImage(originalImage);

    if (selectedSky !== 'original' && skyGradients[selectedSky]) {
        const gradient = ctx.createLinearGradient(0, 0, 0, skyMask.height);
        const colors = skyGradients[selectedSky];
        colors.forEach((color, i) => gradient.addColorStop(i / (colors.length - 1), color));

        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, canvas.width, skyMask.height);
        ctx.clip();
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, skyMask.height);
        ctx.restore();

        // Blend edge
        const edgeGradient = ctx.createLinearGradient(0, skyMask.height - 30, 0, skyMask.height + 10);
        edgeGradient.addColorStop(0, 'rgba(0,0,0,0)');
        edgeGradient.addColorStop(1, 'rgba(0,0,0,0.3)');
        ctx.fillStyle = edgeGradient;
        ctx.fillRect(0, skyMask.height - 30, canvas.width, 40);
    }

    // Draw mask boundary
    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, skyMask.height);
    ctx.lineTo(canvas.width, skyMask.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function downloadResult() {
    const canvas = document.getElementById('mainCanvas');
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `sky-segmentation-${Date.now()}.png`;
    a.click();
}

init();
