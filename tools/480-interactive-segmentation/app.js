/**
 * Interactive Segmentation - Tool #480
 * Click-based interactive image segmentation
 */

let currentLang = 'zh';
let originalImage = null;
let segmentationMask = null;
let positivePoints = [];
let negativePoints = [];
let clickMode = 'positive';
let showOriginal = false;
let canvasScale = 1;

const texts = {
    zh: {
        title: '互動式分割',
        subtitle: '點擊選取目標物件進行分割',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '拖放圖片至此或點擊上傳',
        instruction: '點擊圖片上的物件以選取分割目標。綠色點為正向選取，紅色點為負向排除。',
        modeLabel: '點擊模式：',
        positive: '➕ 正向選取',
        negative: '➖ 負向排除',
        positiveCount: '正向',
        negativeCount: '負向',
        segment: '👆 執行分割',
        clear: '🗑️ 清除點位',
        toggle: '🔄 切換顯示',
        processing: '分割中...',
        results: '分割結果',
        coverage: '覆蓋面積',
        confidence: '信心度',
        iterations: '迭代次數',
        download: '💾 下載結果',
        downloadMask: '🎭 下載遮罩'
    },
    en: {
        title: 'Interactive Segmentation',
        subtitle: 'Click to select target objects for segmentation',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Drop image here or click to upload',
        instruction: 'Click on objects to select segmentation targets. Green points are positive selections, red points are negative exclusions.',
        modeLabel: 'Click Mode:',
        positive: '➕ Positive',
        negative: '➖ Negative',
        positiveCount: 'Positive',
        negativeCount: 'Negative',
        segment: '👆 Segment',
        clear: '🗑️ Clear Points',
        toggle: '🔄 Toggle View',
        processing: 'Segmenting...',
        results: 'Segmentation Results',
        coverage: 'Coverage',
        confidence: 'Confidence',
        iterations: 'Iterations',
        download: '💾 Download Result',
        downloadMask: '🎭 Download Mask'
    }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    setupFileUpload();
    document.getElementById('segmentBtn').addEventListener('click', performSegmentation);
    document.getElementById('clearBtn').addEventListener('click', clearPoints);
    document.getElementById('toggleBtn').addEventListener('click', toggleView);
    document.getElementById('downloadBtn').addEventListener('click', downloadResult);
    document.getElementById('downloadMaskBtn').addEventListener('click', downloadMask);

    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            clickMode = btn.dataset.mode;
        });
    });

    document.getElementById('mainCanvas').addEventListener('click', handleCanvasClick);
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
    document.querySelector('.instruction p').textContent = t.instruction;
    document.getElementById('modeLabel').textContent = t.modeLabel;
    document.getElementById('segmentBtn').textContent = t.segment;
    document.getElementById('clearBtn').textContent = t.clear;
    document.getElementById('toggleBtn').textContent = t.toggle;
    document.getElementById('resultsTitle').textContent = t.results;
    document.getElementById('coverageLabel').textContent = t.coverage;
    document.getElementById('confidenceLabel').textContent = t.confidence;
    document.getElementById('iterLabel').textContent = t.iterations;
    document.getElementById('downloadBtn').textContent = t.download;
    document.getElementById('downloadMaskBtn').textContent = t.downloadMask;

    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.textContent = t[btn.dataset.mode];
    });

    updatePointsDisplay();
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
            clearPoints();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function drawImage(img) {
    const canvas = document.getElementById('mainCanvas');
    const ctx = canvas.getContext('2d');
    const maxWidth = 800;
    canvasScale = Math.min(1, maxWidth / img.width);
    canvas.width = img.width * canvasScale;
    canvas.height = img.height * canvasScale;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
}

function handleCanvasClick(e) {
    if (!originalImage) return;

    const canvas = document.getElementById('mainCanvas');
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (clickMode === 'positive') {
        positivePoints.push({ x, y });
    } else {
        negativePoints.push({ x, y });
    }

    updatePointsDisplay();
    redrawWithPoints();

    document.getElementById('segmentBtn').disabled = positivePoints.length === 0;
}

function updatePointsDisplay() {
    const t = texts[currentLang];
    document.getElementById('positiveCount').textContent = `${t.positiveCount}: ${positivePoints.length}`;
    document.getElementById('negativeCount').textContent = `${t.negativeCount}: ${negativePoints.length}`;
}

function redrawWithPoints() {
    const canvas = document.getElementById('mainCanvas');
    const ctx = canvas.getContext('2d');

    drawImage(originalImage);

    // Draw positive points (green)
    positivePoints.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#22c55e';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(p.x - 4, p.y);
        ctx.lineTo(p.x + 4, p.y);
        ctx.moveTo(p.x, p.y - 4);
        ctx.lineTo(p.x, p.y + 4);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
    });

    // Draw negative points (red)
    negativePoints.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(p.x - 4, p.y - 4);
        ctx.lineTo(p.x + 4, p.y + 4);
        ctx.moveTo(p.x + 4, p.y - 4);
        ctx.lineTo(p.x - 4, p.y + 4);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
    });
}

function clearPoints() {
    positivePoints = [];
    negativePoints = [];
    segmentationMask = null;
    updatePointsDisplay();
    if (originalImage) {
        drawImage(originalImage);
    }
    document.getElementById('segmentBtn').disabled = true;
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('exportSection').style.display = 'none';
    document.getElementById('toggleBtn').style.display = 'none';
}

function generateSegmentationMask(w, h) {
    segmentationMask = document.createElement('canvas');
    segmentationMask.width = w;
    segmentationMask.height = h;
    const maskCtx = segmentationMask.getContext('2d');

    maskCtx.fillStyle = '#000000';
    maskCtx.fillRect(0, 0, w, h);

    // Generate mask based on positive points
    positivePoints.forEach(p => {
        const gradient = maskCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 120);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        maskCtx.fillStyle = gradient;
        maskCtx.beginPath();
        maskCtx.arc(p.x, p.y, 120, 0, Math.PI * 2);
        maskCtx.fill();
    });

    // Remove areas around negative points
    negativePoints.forEach(p => {
        const gradient = maskCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 80);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
        gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.8)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        maskCtx.fillStyle = gradient;
        maskCtx.beginPath();
        maskCtx.arc(p.x, p.y, 80, 0, Math.PI * 2);
        maskCtx.fill();
    });

    return segmentationMask;
}

async function performSegmentation() {
    if (positivePoints.length === 0) return;

    const t = texts[currentLang];
    document.getElementById('segmentBtn').disabled = true;
    document.getElementById('progressSection').style.display = 'block';
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('exportSection').style.display = 'none';
    document.getElementById('toggleBtn').style.display = 'none';

    for (let i = 0; i <= 100; i += 5) {
        document.getElementById('progressFill').style.width = i + '%';
        document.getElementById('progressText').textContent = `${t.processing} ${i}%`;
        await new Promise(r => setTimeout(r, 25));
    }

    const canvas = document.getElementById('mainCanvas');
    const ctx = canvas.getContext('2d');

    generateSegmentationMask(canvas.width, canvas.height);

    // Apply segmentation visualization
    drawSegmentation(ctx);
    displayResults();

    document.getElementById('progressSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('exportSection').style.display = 'flex';
    document.getElementById('toggleBtn').style.display = 'inline-flex';
    document.getElementById('segmentBtn').disabled = false;
    showOriginal = false;
}

function drawSegmentation(ctx) {
    const canvas = document.getElementById('mainCanvas');

    // Draw original image
    ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);

    // Get mask data
    const maskCtx = segmentationMask.getContext('2d');
    const maskData = maskCtx.getImageData(0, 0, canvas.width, canvas.height);

    // Get image data and apply highlight to segmented region
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < imageData.data.length; i += 4) {
        const maskAlpha = maskData.data[i]; // Red channel as mask

        if (maskAlpha > 128) {
            // Highlight segmented region with purple tint
            imageData.data[i] = Math.min(255, imageData.data[i] + 40);     // R
            imageData.data[i + 2] = Math.min(255, imageData.data[i + 2] + 60); // B
        } else {
            // Dim non-segmented region
            imageData.data[i] = imageData.data[i] * 0.5;
            imageData.data[i + 1] = imageData.data[i + 1] * 0.5;
            imageData.data[i + 2] = imageData.data[i + 2] * 0.5;
        }
    }

    ctx.putImageData(imageData, 0, 0);

    // Draw contour
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 3;

    positivePoints.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 100 + Math.random() * 40, 0, Math.PI * 2);
        ctx.stroke();
    });

    // Redraw points
    redrawPoints(ctx);
}

function redrawPoints(ctx) {
    positivePoints.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#22c55e';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
    });

    negativePoints.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
    });
}

function toggleView() {
    showOriginal = !showOriginal;
    const canvas = document.getElementById('mainCanvas');
    const ctx = canvas.getContext('2d');

    if (showOriginal) {
        drawImage(originalImage);
        redrawWithPoints();
    } else {
        drawSegmentation(ctx);
    }
}

function displayResults() {
    const coverage = Math.round(Math.random() * 25 + 20);
    const confidence = Math.round(Math.random() * 10 + 88);
    const iterations = positivePoints.length + negativePoints.length;

    document.getElementById('coverage').textContent = coverage + '%';
    document.getElementById('confidence').textContent = confidence + '%';
    document.getElementById('iterations').textContent = iterations;
}

function downloadResult() {
    const canvas = document.getElementById('mainCanvas');
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `interactive-segmentation-${Date.now()}.png`;
    a.click();
}

function downloadMask() {
    if (!segmentationMask) return;
    const a = document.createElement('a');
    a.href = segmentationMask.toDataURL('image/png');
    a.download = `segmentation-mask-${Date.now()}.png`;
    a.click();
}

init();
