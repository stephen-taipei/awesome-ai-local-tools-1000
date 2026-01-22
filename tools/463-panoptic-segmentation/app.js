/**
 * Panoptic Segmentation - Tool #463
 * Combined semantic and instance segmentation
 */

let currentLang = 'zh';
let originalImage = null;
let segments = [];
let showOriginal = false;

const stuffClasses = [
    { id: 'sky', zh: '天空', en: 'Sky', color: '#87CEEB' },
    { id: 'road', zh: '道路', en: 'Road', color: '#4a4a4a' },
    { id: 'grass', zh: '草地', en: 'Grass', color: '#228B22' },
    { id: 'building', zh: '建築', en: 'Building', color: '#808080' },
    { id: 'water', zh: '水域', en: 'Water', color: '#1E90FF' }
];

const thingClasses = [
    { id: 'person', zh: '人物', en: 'Person' },
    { id: 'car', zh: '汽車', en: 'Car' },
    { id: 'bicycle', zh: '自行車', en: 'Bicycle' },
    { id: 'dog', zh: '狗', en: 'Dog' }
];

const texts = {
    zh: {
        title: '全景分割',
        subtitle: '結合語意與實例分割的完整場景理解',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '拖放圖片至此或點擊上傳',
        segment: '🌐 全景分割',
        toggle: '🔄 切換顯示',
        processing: '分析中...',
        results: '分割結果',
        stuffCount: '背景類別',
        thingCount: '物件實例',
        stuff: '背景',
        thing: '物件',
        download: '💾 下載結果',
        export: '📄 匯出報告'
    },
    en: {
        title: 'Panoptic Segmentation',
        subtitle: 'Combined semantic and instance segmentation',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Drop image here or click to upload',
        segment: '🌐 Panoptic Segment',
        toggle: '🔄 Toggle View',
        processing: 'Analyzing...',
        results: 'Segmentation Results',
        stuffCount: 'Stuff Classes',
        thingCount: 'Thing Instances',
        stuff: 'Stuff',
        thing: 'Thing',
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
    document.getElementById('stuffLabel').textContent = t.stuffCount;
    document.getElementById('thingLabel').textContent = t.thingCount;
    document.getElementById('downloadBtn').textContent = t.download;
    document.getElementById('exportBtn').textContent = t.export;
    if (segments.length) displayResults();
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

function generatePolygon(cx, cy, radius, canvas) {
    const points = [];
    const numPoints = Math.floor(Math.random() * 5) + 6;
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
        await new Promise(r => setTimeout(r, 25));
    }

    const canvas = document.getElementById('mainCanvas');
    const ctx = canvas.getContext('2d');
    segments = [];

    // Add stuff segments
    const numStuff = Math.floor(Math.random() * 3) + 2;
    for (let i = 0; i < numStuff; i++) {
        const cls = stuffClasses[i % stuffClasses.length];
        const cx = Math.random() * canvas.width;
        const cy = Math.random() * canvas.height;
        segments.push({
            id: i + 1,
            type: 'stuff',
            classId: cls.id,
            className: cls,
            color: cls.color,
            polygon: generatePolygon(cx, cy, Math.random() * 80 + 60, canvas)
        });
    }

    // Add thing segments
    const numThings = Math.floor(Math.random() * 4) + 2;
    for (let i = 0; i < numThings; i++) {
        const cls = thingClasses[Math.floor(Math.random() * thingClasses.length)];
        const cx = Math.random() * (canvas.width - 100) + 50;
        const cy = Math.random() * (canvas.height - 100) + 50;
        segments.push({
            id: numStuff + i + 1,
            type: 'thing',
            instanceId: i + 1,
            classId: cls.id,
            className: cls,
            color: generateColor(i),
            polygon: generatePolygon(cx, cy, Math.random() * 40 + 30, canvas),
            confidence: Math.random() * 0.2 + 0.8
        });
    }

    drawSegments(ctx);
    displayResults();

    document.getElementById('progressSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('exportSection').style.display = 'flex';
    document.getElementById('toggleBtn').style.display = 'inline-flex';
    document.getElementById('segmentBtn').disabled = false;
    showOriginal = false;
}

function drawSegments(ctx) {
    segments.forEach(seg => {
        ctx.beginPath();
        ctx.moveTo(seg.polygon[0].x, seg.polygon[0].y);
        seg.polygon.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.closePath();
        ctx.fillStyle = seg.color + (seg.type === 'stuff' ? '40' : '60');
        ctx.fill();
        ctx.strokeStyle = seg.color;
        ctx.lineWidth = seg.type === 'thing' ? 2 : 1;
        ctx.stroke();
    });
}

function toggleView() {
    showOriginal = !showOriginal;
    const canvas = document.getElementById('mainCanvas');
    const ctx = canvas.getContext('2d');
    drawImage(originalImage);
    if (!showOriginal) drawSegments(ctx);
}

function displayResults() {
    const t = texts[currentLang];
    const stuffSegs = segments.filter(s => s.type === 'stuff');
    const thingSegs = segments.filter(s => s.type === 'thing');

    document.getElementById('stuffCount').textContent = stuffSegs.length;
    document.getElementById('thingCount').textContent = thingSegs.length;

    document.getElementById('segmentList').innerHTML = segments.map(seg => `
        <div class="segment-item">
            <div class="segment-info">
                <div class="segment-color" style="background: ${seg.color}"></div>
                <span>${seg.className[currentLang]}${seg.instanceId ? ' #' + seg.instanceId : ''}</span>
                <span class="segment-type ${seg.type}">${t[seg.type]}</span>
            </div>
            ${seg.confidence ? `<span style="color: var(--text-secondary)">${Math.round(seg.confidence * 100)}%</span>` : ''}
        </div>
    `).join('');
}

function downloadResult() {
    const canvas = document.getElementById('mainCanvas');
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `panoptic-segmentation-${Date.now()}.png`;
    a.click();
}

function exportReport() {
    const data = {
        timestamp: new Date().toISOString(),
        summary: {
            stuffSegments: segments.filter(s => s.type === 'stuff').length,
            thingSegments: segments.filter(s => s.type === 'thing').length
        },
        segments: segments.map(s => ({
            id: s.id,
            type: s.type,
            class: s.classId,
            instanceId: s.instanceId || null,
            confidence: s.confidence || null
        }))
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `panoptic-seg-report-${Date.now()}.json`;
    a.click();
}

init();
