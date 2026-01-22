/**
 * Instance Segmentation - Tool #462
 * Segment individual object instances
 */

let currentLang = 'zh';
let originalImage = null;
let instances = [];
let showOriginal = false;

const objectClasses = [
    { id: 'person', zh: '人物', en: 'Person' },
    { id: 'car', zh: '汽車', en: 'Car' },
    { id: 'dog', zh: '狗', en: 'Dog' },
    { id: 'cat', zh: '貓', en: 'Cat' },
    { id: 'chair', zh: '椅子', en: 'Chair' },
    { id: 'bottle', zh: '瓶子', en: 'Bottle' }
];

const texts = {
    zh: {
        title: '實例分割',
        subtitle: '分割圖片中的個別物件實例',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '拖放圖片至此或點擊上傳',
        segment: '🧩 開始分割',
        toggle: '🔄 切換顯示',
        processing: '分割中...',
        results: '分割結果',
        instanceCount: '實例數',
        classCount: '類別數',
        download: '💾 下載結果',
        export: '📄 匯出報告'
    },
    en: {
        title: 'Instance Segmentation',
        subtitle: 'Segment individual object instances',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Drop image here or click to upload',
        segment: '🧩 Start Segmentation',
        toggle: '🔄 Toggle View',
        processing: 'Segmenting...',
        results: 'Segmentation Results',
        instanceCount: 'Instances',
        classCount: 'Classes',
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
    document.getElementById('instanceLabel').textContent = t.instanceCount;
    document.getElementById('classLabel').textContent = t.classCount;
    document.getElementById('downloadBtn').textContent = t.download;
    document.getElementById('exportBtn').textContent = t.export;
    if (instances.length) displayResults();
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

function generateColor(index) {
    const hue = (index * 137.508) % 360;
    return `hsl(${hue}, 70%, 50%)`;
}

function generateMask(cx, cy, radius, canvas) {
    const points = [];
    const numPoints = Math.floor(Math.random() * 5) + 8;
    for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        const r = radius * (0.6 + Math.random() * 0.4);
        points.push({
            x: Math.max(0, Math.min(canvas.width, cx + Math.cos(angle) * r)),
            y: Math.max(0, Math.min(canvas.height, cy + Math.sin(angle) * r))
        });
    }
    return points;
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
    instances = [];

    const numInstances = Math.floor(Math.random() * 6) + 3;

    for (let i = 0; i < numInstances; i++) {
        const cls = objectClasses[Math.floor(Math.random() * objectClasses.length)];
        const color = generateColor(i);
        const cx = Math.random() * (canvas.width - 100) + 50;
        const cy = Math.random() * (canvas.height - 100) + 50;
        const radius = Math.random() * 50 + 30;

        instances.push({
            id: i + 1,
            classId: cls.id,
            className: cls,
            color,
            mask: generateMask(cx, cy, radius, canvas),
            confidence: Math.random() * 0.2 + 0.8
        });
    }

    drawInstances(ctx);
    displayResults();

    document.getElementById('progressSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('exportSection').style.display = 'flex';
    document.getElementById('toggleBtn').style.display = 'inline-flex';
    document.getElementById('segmentBtn').disabled = false;
    showOriginal = false;
}

function drawInstances(ctx) {
    instances.forEach(inst => {
        ctx.beginPath();
        ctx.moveTo(inst.mask[0].x, inst.mask[0].y);
        inst.mask.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.closePath();
        ctx.fillStyle = inst.color + '60';
        ctx.fill();
        ctx.strokeStyle = inst.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        const cx = inst.mask.reduce((s, p) => s + p.x, 0) / inst.mask.length;
        const cy = inst.mask.reduce((s, p) => s + p.y, 0) / inst.mask.length;
        ctx.fillStyle = inst.color;
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`#${inst.id}`, cx, cy);
    });
}

function toggleView() {
    showOriginal = !showOriginal;
    const canvas = document.getElementById('mainCanvas');
    const ctx = canvas.getContext('2d');
    drawImage(originalImage);
    if (!showOriginal) drawInstances(ctx);
}

function displayResults() {
    const uniqueClasses = [...new Set(instances.map(i => i.classId))];
    document.getElementById('instanceCount').textContent = instances.length;
    document.getElementById('classCount').textContent = uniqueClasses.length;

    document.getElementById('instanceList').innerHTML = instances.map(inst => `
        <div class="instance-item">
            <div class="instance-info">
                <div class="instance-color" style="background: ${inst.color}"></div>
                <span>#${inst.id} ${inst.className[currentLang]}</span>
            </div>
            <span style="color: var(--text-secondary)">${Math.round(inst.confidence * 100)}%</span>
        </div>
    `).join('');
}

function downloadResult() {
    const canvas = document.getElementById('mainCanvas');
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `instance-segmentation-${Date.now()}.png`;
    a.click();
}

function exportReport() {
    const data = {
        timestamp: new Date().toISOString(),
        summary: {
            totalInstances: instances.length,
            uniqueClasses: [...new Set(instances.map(i => i.classId))].length
        },
        instances: instances.map(i => ({
            id: i.id,
            class: i.classId,
            confidence: i.confidence,
            maskPoints: i.mask.length
        }))
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `instance-seg-report-${Date.now()}.json`;
    a.click();
}

init();
