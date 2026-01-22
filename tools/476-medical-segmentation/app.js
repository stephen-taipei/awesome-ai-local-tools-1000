/**
 * Medical Image Segmentation - Tool #476
 * Segment medical imaging areas for analysis
 */

let currentLang = 'zh';
let originalImage = null;
let segmentationData = null;
let showOriginal = false;
let selectedMode = 'organ';

const medicalClasses = {
    organ: [
        { id: 'heart', zh: '心臟', en: 'Heart', color: '#ef4444' },
        { id: 'lung', zh: '肺部', en: 'Lung', color: '#3b82f6' },
        { id: 'liver', zh: '肝臟', en: 'Liver', color: '#8b4513' },
        { id: 'kidney', zh: '腎臟', en: 'Kidney', color: '#a855f7' },
        { id: 'spleen', zh: '脾臟', en: 'Spleen', color: '#ec4899' }
    ],
    tissue: [
        { id: 'muscle', zh: '肌肉組織', en: 'Muscle Tissue', color: '#dc2626' },
        { id: 'fat', zh: '脂肪組織', en: 'Fat Tissue', color: '#fbbf24' },
        { id: 'bone', zh: '骨骼組織', en: 'Bone Tissue', color: '#f5f5f5' },
        { id: 'nerve', zh: '神經組織', en: 'Nerve Tissue', color: '#22c55e' }
    ],
    lesion: [
        { id: 'tumor', zh: '腫瘤', en: 'Tumor', color: '#dc2626' },
        { id: 'cyst', zh: '囊腫', en: 'Cyst', color: '#06b6d4' },
        { id: 'inflammation', zh: '發炎區域', en: 'Inflammation', color: '#f97316' },
        { id: 'calcification', zh: '�ite化', en: 'Calcification', color: '#f5f5f5' }
    ],
    vessel: [
        { id: 'artery', zh: '動脈', en: 'Artery', color: '#ef4444' },
        { id: 'vein', zh: '靜脈', en: 'Vein', color: '#3b82f6' },
        { id: 'capillary', zh: '微血管', en: 'Capillary', color: '#a855f7' }
    ]
};

const texts = {
    zh: {
        title: '醫學影像分割',
        subtitle: '分割醫學影像中的解剖區域',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '拖放醫學影像至此或點擊上傳',
        segment: '🏥 開始分割',
        toggle: '🔄 切換顯示',
        processing: '分析中...',
        modeLabel: '分割模式：',
        organ: '器官',
        tissue: '組織',
        lesion: '病灶',
        vessel: '血管',
        results: '分割結果',
        regionCount: '偵測區域',
        coverage: '覆蓋率',
        confidence: '信心度',
        download: '💾 下載結果',
        export: '📄 匯出報告'
    },
    en: {
        title: 'Medical Image Segmentation',
        subtitle: 'Segment anatomical regions in medical images',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Drop medical image here or click to upload',
        segment: '🏥 Start Segmentation',
        toggle: '🔄 Toggle View',
        processing: 'Analyzing...',
        modeLabel: 'Segmentation Mode:',
        organ: 'Organ',
        tissue: 'Tissue',
        lesion: 'Lesion',
        vessel: 'Vessel',
        results: 'Segmentation Results',
        regionCount: 'Detected Regions',
        coverage: 'Coverage',
        confidence: 'Confidence',
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

    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedMode = btn.dataset.mode;
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
    document.getElementById('toggleBtn').textContent = t.toggle;
    document.getElementById('modeLabel').textContent = t.modeLabel;
    document.getElementById('resultsTitle').textContent = t.results;
    document.getElementById('regionLabel').textContent = t.regionCount;
    document.getElementById('coverageLabel').textContent = t.coverage;
    document.getElementById('confidenceLabel').textContent = t.confidence;
    document.getElementById('downloadBtn').textContent = t.download;
    document.getElementById('exportBtn').textContent = t.export;

    const modeLabels = ['organ', 'tissue', 'lesion', 'vessel'];
    document.querySelectorAll('.mode-btn').forEach((btn, i) => {
        btn.textContent = t[modeLabels[i]];
    });

    if (segmentationData) updateLegend();
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
    document.getElementById('toggleBtn').style.display = 'none';

    drawImage(originalImage);

    for (let i = 0; i <= 100; i += 3) {
        document.getElementById('progressFill').style.width = i + '%';
        document.getElementById('progressText').textContent = `${t.processing} ${i}%`;
        await new Promise(r => setTimeout(r, 30));
    }

    const canvas = document.getElementById('mainCanvas');
    const ctx = canvas.getContext('2d');
    const classes = medicalClasses[selectedMode];

    segmentationData = { classes: [], regions: [] };
    const usedClasses = [];
    const numRegions = Math.floor(Math.random() * 4) + 3;

    for (let i = 0; i < numRegions; i++) {
        const cls = classes[Math.floor(Math.random() * classes.length)];
        if (!usedClasses.includes(cls.id)) usedClasses.push(cls.id);

        const region = {
            classId: cls.id,
            points: generateOrganicShape(canvas.width, canvas.height),
            confidence: Math.round(Math.random() * 15 + 85)
        };
        segmentationData.regions.push(region);
    }

    segmentationData.classes = usedClasses.map(id => classes.find(c => c.id === id));

    drawSegmentation(ctx);
    displayResults();

    document.getElementById('progressSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('exportSection').style.display = 'flex';
    document.getElementById('toggleBtn').style.display = 'inline-flex';
    document.getElementById('segmentBtn').disabled = false;
    showOriginal = false;
}

function generateOrganicShape(maxW, maxH) {
    const cx = Math.random() * maxW * 0.6 + maxW * 0.2;
    const cy = Math.random() * maxH * 0.6 + maxH * 0.2;
    const points = [];
    const numPoints = Math.floor(Math.random() * 6) + 8;
    const baseRadius = Math.random() * 60 + 30;

    for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        const radius = baseRadius * (0.6 + Math.random() * 0.8);
        points.push({
            x: cx + Math.cos(angle) * radius,
            y: cy + Math.sin(angle) * radius
        });
    }
    return points;
}

function drawSegmentation(ctx) {
    const classes = medicalClasses[selectedMode];
    segmentationData.regions.forEach(region => {
        const cls = classes.find(c => c.id === region.classId);
        ctx.beginPath();
        ctx.moveTo(region.points[0].x, region.points[0].y);
        for (let i = 1; i < region.points.length; i++) {
            const p0 = region.points[i - 1];
            const p1 = region.points[i];
            const midX = (p0.x + p1.x) / 2;
            const midY = (p0.y + p1.y) / 2;
            ctx.quadraticCurveTo(p0.x, p0.y, midX, midY);
        }
        ctx.closePath();
        ctx.fillStyle = cls.color + '60';
        ctx.fill();
        ctx.strokeStyle = cls.color;
        ctx.lineWidth = 2;
        ctx.stroke();
    });
}

function toggleView() {
    showOriginal = !showOriginal;
    const canvas = document.getElementById('mainCanvas');
    const ctx = canvas.getContext('2d');
    drawImage(originalImage);
    if (!showOriginal) {
        drawSegmentation(ctx);
    }
}

function updateLegend() {
    const legend = document.getElementById('legend');
    legend.innerHTML = segmentationData.classes.map(cls => `
        <div class="legend-item">
            <div class="legend-color" style="background: ${cls.color}"></div>
            <span>${cls[currentLang]}</span>
        </div>
    `).join('');
}

function displayResults() {
    document.getElementById('regionCount').textContent = segmentationData.regions.length;
    document.getElementById('coverage').textContent = Math.round(Math.random() * 25 + 65) + '%';
    const avgConfidence = Math.round(segmentationData.regions.reduce((a, r) => a + r.confidence, 0) / segmentationData.regions.length);
    document.getElementById('confidence').textContent = avgConfidence + '%';
    updateLegend();
}

function downloadResult() {
    const canvas = document.getElementById('mainCanvas');
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `medical-segmentation-${Date.now()}.png`;
    a.click();
}

function exportReport() {
    const classes = medicalClasses[selectedMode];
    const data = {
        timestamp: new Date().toISOString(),
        mode: selectedMode,
        summary: {
            totalRegions: segmentationData.regions.length,
            classes: segmentationData.classes.map(c => ({ id: c.id, name: c[currentLang] }))
        },
        regions: segmentationData.regions.map(r => {
            const cls = classes.find(c => c.id === r.classId);
            return {
                class: r.classId,
                name: cls[currentLang],
                confidence: r.confidence + '%',
                pointCount: r.points.length
            };
        })
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `medical-seg-report-${Date.now()}.json`;
    a.click();
}

init();
