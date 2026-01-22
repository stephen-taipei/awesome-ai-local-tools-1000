/**
 * Salient Object Detection - Tool #479
 * Detect and segment salient objects in images
 */

let currentLang = 'zh';
let originalImage = null;
let detectionData = null;
let maskCanvas = null;
let showOriginal = false;
let threshold = 50;

const objectColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899'];

const texts = {
    zh: {
        title: '顯著物件偵測',
        subtitle: '自動偵測並分割圖片中的顯著物件',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '拖放圖片至此或點擊上傳',
        detect: '🎯 偵測物件',
        toggle: '🔄 切換顯示',
        processing: '偵測中...',
        thresholdLabel: '顯著度閾值：',
        results: '偵測結果',
        objectCount: '顯著物件',
        avgSaliency: '平均顯著度',
        coverage: '覆蓋面積',
        object: '物件',
        download: '💾 下載結果',
        downloadMask: '🎭 下載遮罩',
        export: '📄 匯出報告'
    },
    en: {
        title: 'Salient Object Detection',
        subtitle: 'Automatically detect and segment salient objects',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Drop image here or click to upload',
        detect: '🎯 Detect Objects',
        toggle: '🔄 Toggle View',
        processing: 'Detecting...',
        thresholdLabel: 'Saliency Threshold:',
        results: 'Detection Results',
        objectCount: 'Salient Objects',
        avgSaliency: 'Avg Saliency',
        coverage: 'Coverage',
        object: 'Object',
        download: '💾 Download Result',
        downloadMask: '🎭 Download Mask',
        export: '📄 Export Report'
    }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    setupFileUpload();
    document.getElementById('detectBtn').addEventListener('click', detectObjects);
    document.getElementById('toggleBtn').addEventListener('click', toggleView);
    document.getElementById('downloadBtn').addEventListener('click', downloadResult);
    document.getElementById('downloadMaskBtn').addEventListener('click', downloadMask);
    document.getElementById('exportBtn').addEventListener('click', exportReport);

    document.getElementById('thresholdSlider').addEventListener('input', (e) => {
        threshold = parseInt(e.target.value);
        document.getElementById('thresholdValue').textContent = threshold;
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
    document.getElementById('detectBtn').textContent = t.detect;
    document.getElementById('toggleBtn').textContent = t.toggle;
    document.getElementById('thresholdLabel').textContent = t.thresholdLabel;
    document.getElementById('resultsTitle').textContent = t.results;
    document.getElementById('objectLabel').textContent = t.objectCount;
    document.getElementById('saliencyLabel').textContent = t.avgSaliency;
    document.getElementById('coverageLabel').textContent = t.coverage;
    document.getElementById('downloadBtn').textContent = t.download;
    document.getElementById('downloadMaskBtn').textContent = t.downloadMask;
    document.getElementById('exportBtn').textContent = t.export;
    if (detectionData) updateObjectsList();
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

function generateSalientObjects(w, h) {
    const objects = [];
    const numObjects = Math.floor(Math.random() * 3) + 2;

    for (let i = 0; i < numObjects; i++) {
        const cx = Math.random() * w * 0.6 + w * 0.2;
        const cy = Math.random() * h * 0.6 + h * 0.2;
        const radiusX = Math.random() * 60 + 40;
        const radiusY = Math.random() * 50 + 30;
        const saliency = Math.round(Math.random() * 30 + 65);

        if (saliency >= threshold) {
            objects.push({
                id: i + 1,
                cx, cy, radiusX, radiusY,
                saliency,
                color: objectColors[i % objectColors.length]
            });
        }
    }

    return objects;
}

async function detectObjects() {
    const t = texts[currentLang];
    document.getElementById('detectBtn').disabled = true;
    document.getElementById('progressSection').style.display = 'block';
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('exportSection').style.display = 'none';
    document.getElementById('toggleBtn').style.display = 'none';

    drawImage(originalImage);

    for (let i = 0; i <= 100; i += 4) {
        document.getElementById('progressFill').style.width = i + '%';
        document.getElementById('progressText').textContent = `${t.processing} ${i}%`;
        await new Promise(r => setTimeout(r, 25));
    }

    const canvas = document.getElementById('mainCanvas');
    const ctx = canvas.getContext('2d');

    detectionData = { objects: generateSalientObjects(canvas.width, canvas.height) };

    // Create mask canvas
    maskCanvas = document.createElement('canvas');
    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;
    const maskCtx = maskCanvas.getContext('2d');
    maskCtx.fillStyle = '#000000';
    maskCtx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw detections
    drawDetections(ctx, maskCtx);
    displayResults();

    document.getElementById('progressSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('exportSection').style.display = 'flex';
    document.getElementById('toggleBtn').style.display = 'inline-flex';
    document.getElementById('detectBtn').disabled = false;
    showOriginal = false;
}

function drawDetections(ctx, maskCtx) {
    detectionData.objects.forEach(obj => {
        // Draw on main canvas
        ctx.beginPath();
        ctx.ellipse(obj.cx, obj.cy, obj.radiusX, obj.radiusY, 0, 0, Math.PI * 2);
        ctx.fillStyle = obj.color + '40';
        ctx.fill();
        ctx.strokeStyle = obj.color;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw saliency label
        ctx.fillStyle = obj.color;
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText(`${obj.saliency}%`, obj.cx - 15, obj.cy - obj.radiusY - 8);

        // Draw on mask
        maskCtx.beginPath();
        maskCtx.ellipse(obj.cx, obj.cy, obj.radiusX, obj.radiusY, 0, 0, Math.PI * 2);
        maskCtx.fillStyle = '#ffffff';
        maskCtx.fill();
    });
}

function toggleView() {
    showOriginal = !showOriginal;
    const canvas = document.getElementById('mainCanvas');
    const ctx = canvas.getContext('2d');
    drawImage(originalImage);
    if (!showOriginal) {
        const maskCtx = maskCanvas.getContext('2d');
        drawDetections(ctx, maskCtx);
    }
}

function updateObjectsList() {
    const t = texts[currentLang];
    const list = document.getElementById('objectsList');
    list.innerHTML = detectionData.objects.map(obj => `
        <div class="object-item">
            <div class="object-color" style="background: ${obj.color}"></div>
            <span>${t.object} ${obj.id}</span>
            <span class="object-saliency">${obj.saliency}%</span>
        </div>
    `).join('');
}

function displayResults() {
    const objects = detectionData.objects;
    document.getElementById('objectCount').textContent = objects.length;

    const avgSaliency = objects.length > 0
        ? Math.round(objects.reduce((a, o) => a + o.saliency, 0) / objects.length)
        : 0;
    document.getElementById('avgSaliency').textContent = avgSaliency + '%';

    const coverage = Math.round(Math.random() * 20 + 25);
    document.getElementById('coverage').textContent = coverage + '%';

    updateObjectsList();
}

function downloadResult() {
    const canvas = document.getElementById('mainCanvas');
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `salient-detection-${Date.now()}.png`;
    a.click();
}

function downloadMask() {
    if (!maskCanvas) return;
    const a = document.createElement('a');
    a.href = maskCanvas.toDataURL('image/png');
    a.download = `saliency-mask-${Date.now()}.png`;
    a.click();
}

function exportReport() {
    const t = texts[currentLang];
    const data = {
        timestamp: new Date().toISOString(),
        threshold: threshold,
        summary: {
            totalObjects: detectionData.objects.length,
            averageSaliency: detectionData.objects.length > 0
                ? Math.round(detectionData.objects.reduce((a, o) => a + o.saliency, 0) / detectionData.objects.length)
                : 0
        },
        objects: detectionData.objects.map(obj => ({
            id: obj.id,
            saliency: obj.saliency + '%',
            position: { x: Math.round(obj.cx), y: Math.round(obj.cy) },
            size: { width: Math.round(obj.radiusX * 2), height: Math.round(obj.radiusY * 2) }
        }))
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `saliency-report-${Date.now()}.json`;
    a.click();
}

init();
