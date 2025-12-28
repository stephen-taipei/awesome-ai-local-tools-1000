/**
 * Body Measurement - Tool #439
 * Estimate body measurements from photos
 */

const previewCanvas = document.getElementById('previewCanvas');
const previewCtx = previewCanvas.getContext('2d');
const overlayCanvas = document.getElementById('overlayCanvas');
const overlayCtx = overlayCanvas.getContext('2d');
let currentLang = 'zh';
let currentImage = null;

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));

    document.getElementById('uploadArea').addEventListener('click', () => document.getElementById('imageInput').click());
    document.getElementById('imageInput').addEventListener('change', (e) => loadImage(e.target.files[0]));
    document.getElementById('measureBtn').addEventListener('click', measureBody);
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');

    const texts = {
        zh: { title: '身體測量', subtitle: '從照片估算身體尺寸', privacy: '100% 本地處理 · 零資料上傳', calibration: '校準設定', height: '實際身高 (cm)', upload: '上傳全身正面照片', measure: '開始測量', results: '測量結果', shoulder: '肩寬', chest: '胸圍', waist: '腰圍', hip: '臀圍', leg: '腿長', arm: '手臂長', note: '測量結果僅供參考，實際尺寸可能有差異' },
        en: { title: 'Body Measurement', subtitle: 'Estimate body measurements from photos', privacy: '100% Local Processing · No Data Upload', calibration: 'Calibration Settings', height: 'Actual Height (cm)', upload: 'Upload front full body photo', measure: 'Measure', results: 'Measurement Results', shoulder: 'Shoulder', chest: 'Chest', waist: 'Waist', hip: 'Hip', leg: 'Leg Length', arm: 'Arm Length', note: 'Results are estimates only, actual measurements may vary' }
    };

    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.querySelector('.calibration-section h3').textContent = t.calibration;
    document.querySelector('.input-group label').textContent = t.height;
    document.querySelector('.upload-text').textContent = t.upload;
    document.getElementById('measureBtn').textContent = t.measure;
    document.querySelector('.result-section h3').textContent = t.results;

    const labels = document.querySelectorAll('.measurement-label');
    labels[0].textContent = t.shoulder;
    labels[1].textContent = t.chest;
    labels[2].textContent = t.waist;
    labels[3].textContent = t.hip;
    labels[4].textContent = t.leg;
    labels[5].textContent = t.arm;

    document.getElementById('noteText').textContent = t.note;
}

function loadImage(file) {
    if (!file) return;

    const img = new Image();
    img.onload = () => {
        currentImage = img;

        // Scale to fit container
        const maxWidth = 600;
        const scale = Math.min(1, maxWidth / img.width);
        const width = img.width * scale;
        const height = img.height * scale;

        previewCanvas.width = width;
        previewCanvas.height = height;
        overlayCanvas.width = width;
        overlayCanvas.height = height;

        previewCtx.drawImage(img, 0, 0, width, height);

        document.getElementById('uploadArea').classList.add('hidden');
        document.querySelector('.canvas-container').classList.add('visible');
        document.getElementById('measureBtn').style.display = 'block';
    };
    img.src = URL.createObjectURL(file);
}

function measureBody() {
    if (!currentImage) return;

    const actualHeight = parseFloat(document.getElementById('heightInput').value) || 170;

    // Analyze image to find body outline
    const analysisCanvas = document.createElement('canvas');
    const analysisCtx = analysisCanvas.getContext('2d');
    const analyzeWidth = 100;
    const analyzeHeight = Math.round(100 * previewCanvas.height / previewCanvas.width);

    analysisCanvas.width = analyzeWidth;
    analysisCanvas.height = analyzeHeight;
    analysisCtx.drawImage(currentImage, 0, 0, analyzeWidth, analyzeHeight);

    const imageData = analysisCtx.getImageData(0, 0, analyzeWidth, analyzeHeight);
    const data = imageData.data;

    // Detect body silhouette
    const bodyBounds = detectBodyBounds(data, analyzeWidth, analyzeHeight);

    // Calculate pixel-to-cm ratio
    const bodyHeightPx = bodyBounds.bottom - bodyBounds.top;
    const pxToCm = actualHeight / bodyHeightPx;

    // Measure at different body levels
    const measurements = calculateMeasurements(data, analyzeWidth, analyzeHeight, bodyBounds, pxToCm);

    // Display results
    displayMeasurements(measurements);

    // Draw overlay
    drawMeasurementOverlay(bodyBounds, measurements, pxToCm);

    document.getElementById('resultSection').style.display = 'block';
}

function detectBodyBounds(data, width, height) {
    let top = height, bottom = 0, left = width, right = 0;

    // Find body pixels (non-background)
    const bgSample = getBackgroundColor(data, width, height);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            if (!isBackground(data, idx, bgSample)) {
                top = Math.min(top, y);
                bottom = Math.max(bottom, y);
                left = Math.min(left, x);
                right = Math.max(right, x);
            }
        }
    }

    return { top, bottom, left, right };
}

function getBackgroundColor(data, width, height) {
    // Sample corners to determine background
    const samples = [];
    const corners = [[0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1]];

    corners.forEach(([x, y]) => {
        const idx = (y * width + x) * 4;
        samples.push({ r: data[idx], g: data[idx + 1], b: data[idx + 2] });
    });

    // Average of corners
    return {
        r: samples.reduce((s, c) => s + c.r, 0) / 4,
        g: samples.reduce((s, c) => s + c.g, 0) / 4,
        b: samples.reduce((s, c) => s + c.b, 0) / 4
    };
}

function isBackground(data, idx, bg) {
    const threshold = 40;
    return Math.abs(data[idx] - bg.r) < threshold &&
           Math.abs(data[idx + 1] - bg.g) < threshold &&
           Math.abs(data[idx + 2] - bg.b) < threshold;
}

function calculateMeasurements(data, width, height, bounds, pxToCm) {
    const bodyHeight = bounds.bottom - bounds.top;
    const bgSample = getBackgroundColor(data, width, height);

    // Measure width at different body levels
    const shoulderY = bounds.top + bodyHeight * 0.15;
    const chestY = bounds.top + bodyHeight * 0.25;
    const waistY = bounds.top + bodyHeight * 0.45;
    const hipY = bounds.top + bodyHeight * 0.55;
    const legStartY = bounds.top + bodyHeight * 0.55;

    function measureWidthAt(y) {
        let left = width, right = 0;
        const yInt = Math.floor(y);
        for (let x = 0; x < width; x++) {
            const idx = (yInt * width + x) * 4;
            if (!isBackground(data, idx, bgSample)) {
                left = Math.min(left, x);
                right = Math.max(right, x);
            }
        }
        return right - left;
    }

    const shoulderWidth = measureWidthAt(shoulderY) * pxToCm;
    const chestWidth = measureWidthAt(chestY) * pxToCm;
    const waistWidth = measureWidthAt(waistY) * pxToCm;
    const hipWidth = measureWidthAt(hipY) * pxToCm;
    const legLength = (bounds.bottom - legStartY) * pxToCm;
    const armLength = bodyHeight * 0.35 * pxToCm; // Estimate based on body proportions

    // Convert frontal widths to circumference estimates (ellipse approximation)
    return {
        shoulder: Math.round(shoulderWidth),
        chest: Math.round(chestWidth * 2.5), // Circumference estimate
        waist: Math.round(waistWidth * 2.3),
        hip: Math.round(hipWidth * 2.5),
        leg: Math.round(legLength),
        arm: Math.round(armLength),
        landmarks: {
            shoulderY: shoulderY / height,
            chestY: chestY / height,
            waistY: waistY / height,
            hipY: hipY / height
        }
    };
}

function displayMeasurements(measurements) {
    document.getElementById('shoulderWidth').textContent = `${measurements.shoulder} cm`;
    document.getElementById('chestSize').textContent = `${measurements.chest} cm`;
    document.getElementById('waistSize').textContent = `${measurements.waist} cm`;
    document.getElementById('hipSize').textContent = `${measurements.hip} cm`;
    document.getElementById('legLength').textContent = `${measurements.leg} cm`;
    document.getElementById('armLength').textContent = `${measurements.arm} cm`;
}

function drawMeasurementOverlay(bounds, measurements, pxToCm) {
    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    const scaleX = overlayCanvas.width / 100;
    const scaleY = overlayCanvas.height / (100 * previewCanvas.height / previewCanvas.width);

    overlayCtx.strokeStyle = '#a855f7';
    overlayCtx.lineWidth = 2;
    overlayCtx.setLineDash([5, 5]);

    const levels = [
        { y: measurements.landmarks.shoulderY, label: currentLang === 'zh' ? '肩' : 'Shoulder' },
        { y: measurements.landmarks.chestY, label: currentLang === 'zh' ? '胸' : 'Chest' },
        { y: measurements.landmarks.waistY, label: currentLang === 'zh' ? '腰' : 'Waist' },
        { y: measurements.landmarks.hipY, label: currentLang === 'zh' ? '臀' : 'Hip' }
    ];

    overlayCtx.font = '12px sans-serif';
    overlayCtx.fillStyle = '#a855f7';

    levels.forEach(level => {
        const y = level.y * overlayCanvas.height;
        overlayCtx.beginPath();
        overlayCtx.moveTo(0, y);
        overlayCtx.lineTo(overlayCanvas.width, y);
        overlayCtx.stroke();

        overlayCtx.fillText(level.label, 10, y - 5);
    });
}

init();
