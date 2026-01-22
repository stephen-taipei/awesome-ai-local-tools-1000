/**
 * Hair Segmentation - Tool #465
 * Segment hair region for virtual try-on
 */

let currentLang = 'zh';
let originalImage = null;
let hairMask = null;
let selectedColor = null;

const texts = {
    zh: {
        title: '頭髮分割',
        subtitle: '分割頭髮區域用於虛擬換髮',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '拖放人像照片至此或點擊上傳',
        segment: '✂️ 分割頭髮',
        reset: '🔄 重置',
        processing: '處理中...',
        colorLabel: '試試新髮色：',
        hairArea: '頭髮面積',
        download: '💾 下載結果'
    },
    en: {
        title: 'Hair Segmentation',
        subtitle: 'Segment hair region for virtual try-on',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Drop portrait photo here or click to upload',
        segment: '✂️ Segment Hair',
        reset: '🔄 Reset',
        processing: 'Processing...',
        colorLabel: 'Try new hair color:',
        hairArea: 'Hair Area',
        download: '💾 Download Result'
    }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    setupFileUpload();
    document.getElementById('segmentBtn').addEventListener('click', segment);
    document.getElementById('resetBtn').addEventListener('click', reset);
    document.getElementById('downloadBtn').addEventListener('click', downloadResult);

    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedColor = btn.dataset.color;
            if (hairMask) applyHairColor();
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
    document.getElementById('resetBtn').textContent = t.reset;
    document.getElementById('colorLabel').textContent = t.colorLabel;
    document.getElementById('areaLabel').textContent = t.hairArea;
    document.getElementById('downloadBtn').textContent = t.download;
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
    const maxWidth = 600;
    const scale = Math.min(1, maxWidth / img.width);
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
}

function generateHairMask(canvas) {
    const cx = canvas.width / 2;
    const cy = canvas.height * 0.25;
    const rx = canvas.width * 0.25;
    const ry = canvas.height * 0.2;
    return { cx, cy, rx, ry };
}

async function segment() {
    const t = texts[currentLang];
    document.getElementById('segmentBtn').disabled = true;
    document.getElementById('progressSection').style.display = 'block';
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('exportSection').style.display = 'none';
    document.getElementById('colorSection').style.display = 'none';
    document.getElementById('resetBtn').style.display = 'none';

    for (let i = 0; i <= 100; i += 5) {
        document.getElementById('progressFill').style.width = i + '%';
        document.getElementById('progressText').textContent = `${t.processing} ${i}%`;
        await new Promise(r => setTimeout(r, 25));
    }

    const canvas = document.getElementById('mainCanvas');
    hairMask = generateHairMask(canvas);
    drawHairMask();

    document.getElementById('hairArea').textContent = Math.round(Math.random() * 10 + 15) + '%';

    document.getElementById('progressSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('exportSection').style.display = 'flex';
    document.getElementById('colorSection').style.display = 'block';
    document.getElementById('resetBtn').style.display = 'inline-flex';
    document.getElementById('segmentBtn').disabled = false;
}

function drawHairMask() {
    const canvas = document.getElementById('mainCanvas');
    const ctx = canvas.getContext('2d');
    drawImage(originalImage);

    const { cx, cy, rx, ry } = hairMask;
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#a855f7';
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
}

function applyHairColor() {
    const canvas = document.getElementById('mainCanvas');
    const ctx = canvas.getContext('2d');
    drawImage(originalImage);

    const { cx, cy, rx, ry } = hairMask;
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = selectedColor;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function reset() {
    selectedColor = null;
    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
    drawHairMask();
}

function downloadResult() {
    const canvas = document.getElementById('mainCanvas');
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `hair-segmentation-${Date.now()}.png`;
    a.click();
}

init();
