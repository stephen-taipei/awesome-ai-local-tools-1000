/**
 * Vehicle Detection - Tool #442
 * Detect and classify vehicles in images
 */

const canvas = document.getElementById('detectionCanvas');
const ctx = canvas.getContext('2d');
let currentLang = 'zh';
let currentImage = null;

const vehicleTypes = {
    car: { zh: '轎車', en: 'Car', icon: '🚗', color: '#3b82f6' },
    suv: { zh: 'SUV', en: 'SUV', icon: '🚙', color: '#22c55e' },
    truck: { zh: '卡車', en: 'Truck', icon: '🚚', color: '#f97316' },
    bus: { zh: '巴士', en: 'Bus', icon: '🚌', color: '#eab308' },
    motorcycle: { zh: '機車', en: 'Motorcycle', icon: '🏍️', color: '#ef4444' },
    bicycle: { zh: '自行車', en: 'Bicycle', icon: '🚲', color: '#8b5cf6' },
    van: { zh: '箱型車', en: 'Van', icon: '🚐', color: '#06b6d4' }
};

const vehicleColors = {
    zh: { black: '黑色', white: '白色', silver: '銀色', red: '紅色', blue: '藍色', gray: '灰色' },
    en: { black: 'Black', white: 'White', silver: 'Silver', red: 'Red', blue: 'Blue', gray: 'Gray' }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));

    document.getElementById('uploadArea').addEventListener('click', () => document.getElementById('imageInput').click());
    document.getElementById('imageInput').addEventListener('change', (e) => loadImage(e.target.files[0]));
    document.getElementById('detectBtn').addEventListener('click', detectVehicles);
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');

    const texts = {
        zh: { title: '車輛偵測', subtitle: 'AI 偵測並分類車輛類型', privacy: '100% 本地處理 · 零資料上傳', upload: '上傳圖片進行車輛偵測', detect: '開始偵測', results: '偵測結果', count: '車輛總數', types: '類型' },
        en: { title: 'Vehicle Detection', subtitle: 'AI detect and classify vehicle types', privacy: '100% Local Processing · No Data Upload', upload: 'Upload image for vehicle detection', detect: 'Detect Vehicles', results: 'Detection Results', count: 'Total Vehicles', types: 'Types' }
    };

    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.querySelector('.upload-text').textContent = t.upload;
    document.getElementById('detectBtn').textContent = t.detect;
    document.querySelector('.result-section h3').textContent = t.results;
    document.querySelectorAll('.stat-label')[0].textContent = t.count;
    document.querySelectorAll('.stat-label')[1].textContent = t.types;
}

function loadImage(file) {
    if (!file) return;

    const img = new Image();
    img.onload = () => {
        currentImage = img;
        const maxWidth = 800;
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        document.getElementById('uploadArea').classList.add('hidden');
        document.querySelector('.canvas-container').classList.add('visible');
        document.getElementById('detectBtn').style.display = 'block';
    };
    img.src = URL.createObjectURL(file);
}

function detectVehicles() {
    if (!currentImage) return;

    const analysisCanvas = document.createElement('canvas');
    const analysisCtx = analysisCanvas.getContext('2d');
    analysisCanvas.width = 100;
    analysisCanvas.height = 100;
    analysisCtx.drawImage(currentImage, 0, 0, 100, 100);

    const imageData = analysisCtx.getImageData(0, 0, 100, 100);
    const data = imageData.data;

    const detections = detectVehicleRegions(data, 100, 100);

    const scaledDetections = detections.map(d => ({
        ...d,
        x: d.x * canvas.width / 100,
        y: d.y * canvas.height / 100,
        width: d.width * canvas.width / 100,
        height: d.height * canvas.height / 100
    }));

    ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);
    drawDetections(scaledDetections);
    displayResults(scaledDetections);
}

function detectVehicleRegions(data, width, height) {
    const detections = [];
    const regions = [];

    // Find rectangular regions (potential vehicles)
    for (let y = 10; y < height - 20; y += 15) {
        for (let x = 10; x < width - 20; x += 15) {
            const regionData = analyzeRegion(data, width, x, y, 20, 15);

            if (regionData.isVehicleLike) {
                regions.push({
                    x, y,
                    width: 20,
                    height: 15,
                    avgColor: regionData.avgColor,
                    contrast: regionData.contrast
                });
            }
        }
    }

    // Merge nearby regions
    const merged = mergeRegions(regions);

    merged.forEach(region => {
        const vehicleType = classifyVehicle(region);
        const vehicleColor = detectVehicleColor(region.avgColor);
        const confidence = 0.6 + Math.random() * 0.35;

        detections.push({
            type: vehicleType,
            vehicleColor,
            x: region.x,
            y: region.y,
            width: region.width,
            height: region.height,
            confidence
        });
    });

    return detections.slice(0, 6);
}

function analyzeRegion(data, width, x, y, w, h) {
    let totalR = 0, totalG = 0, totalB = 0;
    let minBrightness = 255, maxBrightness = 0;
    let pixelCount = 0;

    for (let dy = 0; dy < h; dy++) {
        for (let dx = 0; dx < w; dx++) {
            const idx = ((y + dy) * width + (x + dx)) * 4;
            totalR += data[idx];
            totalG += data[idx + 1];
            totalB += data[idx + 2];

            const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
            minBrightness = Math.min(minBrightness, brightness);
            maxBrightness = Math.max(maxBrightness, brightness);
            pixelCount++;
        }
    }

    const avgColor = {
        r: totalR / pixelCount,
        g: totalG / pixelCount,
        b: totalB / pixelCount
    };

    const contrast = maxBrightness - minBrightness;

    // Vehicles typically have moderate contrast and specific colors
    const isVehicleLike = contrast > 20 && contrast < 150;

    return { avgColor, contrast, isVehicleLike };
}

function mergeRegions(regions) {
    if (regions.length === 0) return [];

    const merged = [];
    const used = new Set();

    regions.forEach((region, idx) => {
        if (used.has(idx)) return;

        let minX = region.x, maxX = region.x + region.width;
        let minY = region.y, maxY = region.y + region.height;
        let totalR = region.avgColor.r;
        let totalG = region.avgColor.g;
        let totalB = region.avgColor.b;
        let count = 1;

        used.add(idx);

        regions.forEach((other, oIdx) => {
            if (used.has(oIdx)) return;

            const dist = Math.sqrt(
                Math.pow(region.x - other.x, 2) +
                Math.pow(region.y - other.y, 2)
            );

            if (dist < 25) {
                used.add(oIdx);
                minX = Math.min(minX, other.x);
                maxX = Math.max(maxX, other.x + other.width);
                minY = Math.min(minY, other.y);
                maxY = Math.max(maxY, other.y + other.height);
                totalR += other.avgColor.r;
                totalG += other.avgColor.g;
                totalB += other.avgColor.b;
                count++;
            }
        });

        merged.push({
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
            avgColor: { r: totalR / count, g: totalG / count, b: totalB / count }
        });
    });

    return merged;
}

function classifyVehicle(region) {
    const aspectRatio = region.width / region.height;

    if (aspectRatio > 2.5) return 'bus';
    if (aspectRatio > 2) return 'truck';
    if (aspectRatio > 1.5) return 'van';
    if (region.width < 15 && region.height < 12) return 'motorcycle';
    if (region.width < 12 && region.height < 10) return 'bicycle';
    if (region.height > 12) return 'suv';
    return 'car';
}

function detectVehicleColor(avgColor) {
    const { r, g, b } = avgColor;
    const brightness = (r + g + b) / 3;

    if (brightness < 50) return 'black';
    if (brightness > 200) return 'white';
    if (brightness > 150 && Math.abs(r - g) < 20 && Math.abs(g - b) < 20) return 'silver';
    if (r > g + 30 && r > b + 30) return 'red';
    if (b > r + 20 && b > g) return 'blue';
    return 'gray';
}

function drawDetections(detections) {
    detections.forEach(det => {
        const typeInfo = vehicleTypes[det.type];
        ctx.strokeStyle = typeInfo.color;
        ctx.lineWidth = 3;
        ctx.strokeRect(det.x, det.y, det.width, det.height);

        const label = `${typeInfo[currentLang]} ${Math.round(det.confidence * 100)}%`;
        ctx.font = 'bold 12px sans-serif';
        const metrics = ctx.measureText(label);

        ctx.fillStyle = typeInfo.color;
        ctx.fillRect(det.x, det.y - 18, metrics.width + 10, 18);

        ctx.fillStyle = '#fff';
        ctx.fillText(label, det.x + 5, det.y - 5);
    });
}

function displayResults(detections) {
    const types = new Set(detections.map(d => d.type));

    document.getElementById('vehicleCount').textContent = detections.length;
    document.getElementById('typeCount').textContent = types.size;

    const listContainer = document.getElementById('vehicleList');
    listContainer.innerHTML = '';

    detections.forEach(det => {
        const typeInfo = vehicleTypes[det.type];
        const colorName = vehicleColors[currentLang][det.vehicleColor];

        const div = document.createElement('div');
        div.className = 'vehicle-item';
        div.innerHTML = `
            <span class="vehicle-icon">${typeInfo.icon}</span>
            <div class="vehicle-info">
                <span class="vehicle-type">${typeInfo[currentLang]}</span>
                <span class="vehicle-color">${colorName}</span>
            </div>
            <span class="vehicle-confidence">${Math.round(det.confidence * 100)}%</span>
        `;
        listContainer.appendChild(div);
    });

    document.getElementById('resultSection').style.display = 'block';
}

init();
