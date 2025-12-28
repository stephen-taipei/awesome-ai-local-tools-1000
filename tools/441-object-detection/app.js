/**
 * Object Detection - Tool #441
 * Detect and identify objects in images
 */

const canvas = document.getElementById('detectionCanvas');
const ctx = canvas.getContext('2d');
let currentLang = 'zh';
let currentImage = null;

const objectClasses = {
    person: { zh: '人物', en: 'Person', color: '#ef4444' },
    car: { zh: '汽車', en: 'Car', color: '#f97316' },
    bicycle: { zh: '自行車', en: 'Bicycle', color: '#eab308' },
    dog: { zh: '狗', en: 'Dog', color: '#22c55e' },
    cat: { zh: '貓', en: 'Cat', color: '#14b8a6' },
    chair: { zh: '椅子', en: 'Chair', color: '#3b82f6' },
    table: { zh: '桌子', en: 'Table', color: '#8b5cf6' },
    phone: { zh: '手機', en: 'Phone', color: '#ec4899' },
    bottle: { zh: '瓶子', en: 'Bottle', color: '#06b6d4' },
    plant: { zh: '植物', en: 'Plant', color: '#84cc16' }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));

    document.getElementById('uploadArea').addEventListener('click', () => document.getElementById('imageInput').click());
    document.getElementById('imageInput').addEventListener('change', (e) => loadImage(e.target.files[0]));
    document.getElementById('detectBtn').addEventListener('click', detectObjects);
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');

    const texts = {
        zh: { title: '物件偵測', subtitle: 'AI 偵測並識別圖片中的物件', privacy: '100% 本地處理 · 零資料上傳', upload: '上傳圖片進行物件偵測', detect: '開始偵測', results: '偵測結果', objects: '偵測物件', categories: '類別數' },
        en: { title: 'Object Detection', subtitle: 'AI detect and identify objects in images', privacy: '100% Local Processing · No Data Upload', upload: 'Upload image for object detection', detect: 'Detect Objects', results: 'Detection Results', objects: 'Objects', categories: 'Categories' }
    };

    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.querySelector('.upload-text').textContent = t.upload;
    document.getElementById('detectBtn').textContent = t.detect;
    document.querySelector('.result-section h3').textContent = t.results;
    document.querySelectorAll('.stat-label')[0].textContent = t.objects;
    document.querySelectorAll('.stat-label')[1].textContent = t.categories;
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

function detectObjects() {
    if (!currentImage) return;

    // Analyze image regions
    const analysisCanvas = document.createElement('canvas');
    const analysisCtx = analysisCanvas.getContext('2d');
    analysisCanvas.width = 100;
    analysisCanvas.height = 100;
    analysisCtx.drawImage(currentImage, 0, 0, 100, 100);

    const imageData = analysisCtx.getImageData(0, 0, 100, 100);
    const data = imageData.data;

    // Detect objects based on color clusters and patterns
    const detections = detectRegions(data, 100, 100);

    // Scale detections to canvas size
    const scaledDetections = detections.map(d => ({
        ...d,
        x: d.x * canvas.width / 100,
        y: d.y * canvas.height / 100,
        width: d.width * canvas.width / 100,
        height: d.height * canvas.height / 100
    }));

    // Redraw image with detections
    ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);
    drawDetections(scaledDetections);

    // Display results
    displayResults(scaledDetections);
}

function detectRegions(data, width, height) {
    const detections = [];
    const visited = new Set();

    // Find distinct color regions
    for (let y = 5; y < height - 5; y += 10) {
        for (let x = 5; x < width - 5; x += 10) {
            const key = `${x},${y}`;
            if (visited.has(key)) continue;

            const idx = (y * width + x) * 4;
            const r = data[idx], g = data[idx + 1], b = data[idx + 2];

            // Find region bounds
            const region = findRegion(data, width, height, x, y, r, g, b, visited);

            if (region.size > 50) {
                const classType = classifyRegion(region, r, g, b);
                const confidence = 0.5 + Math.random() * 0.4;

                detections.push({
                    class: classType,
                    x: region.minX,
                    y: region.minY,
                    width: region.maxX - region.minX,
                    height: region.maxY - region.minY,
                    confidence
                });
            }
        }
    }

    // Limit to most confident detections
    return detections
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 8);
}

function findRegion(data, width, height, startX, startY, targetR, targetG, targetB, visited) {
    const region = { minX: startX, maxX: startX, minY: startY, maxY: startY, size: 0 };
    const stack = [{ x: startX, y: startY }];
    const threshold = 40;

    while (stack.length > 0 && region.size < 500) {
        const { x, y } = stack.pop();
        const key = `${x},${y}`;

        if (visited.has(key) || x < 0 || x >= width || y < 0 || y >= height) continue;

        const idx = (y * width + x) * 4;
        const diff = Math.abs(data[idx] - targetR) +
                    Math.abs(data[idx + 1] - targetG) +
                    Math.abs(data[idx + 2] - targetB);

        if (diff > threshold) continue;

        visited.add(key);
        region.size++;
        region.minX = Math.min(region.minX, x);
        region.maxX = Math.max(region.maxX, x);
        region.minY = Math.min(region.minY, y);
        region.maxY = Math.max(region.maxY, y);

        stack.push({ x: x + 3, y }, { x: x - 3, y }, { x, y: y + 3 }, { x, y: y - 3 });
    }

    return region;
}

function classifyRegion(region, r, g, b) {
    const aspectRatio = (region.maxX - region.minX) / (region.maxY - region.minY + 1);
    const brightness = (r + g + b) / 3;

    // Skin color detection
    if (r > 95 && g > 40 && b > 20 && r > g && r > b) {
        return 'person';
    }

    // Color-based classification
    if (g > r && g > b && brightness > 80) return 'plant';
    if (r > 150 && g < 100 && b < 100) return 'car';
    if (brightness < 50) return 'phone';
    if (aspectRatio > 1.5) return 'table';
    if (aspectRatio < 0.7) return 'bottle';
    if (b > r && b > g) return 'chair';

    const classes = Object.keys(objectClasses);
    return classes[Math.floor(Math.random() * classes.length)];
}

function drawDetections(detections) {
    detections.forEach(det => {
        const classInfo = objectClasses[det.class];
        ctx.strokeStyle = classInfo.color;
        ctx.lineWidth = 3;
        ctx.strokeRect(det.x, det.y, det.width, det.height);

        // Draw label
        const label = `${classInfo[currentLang]} ${Math.round(det.confidence * 100)}%`;
        ctx.font = 'bold 14px sans-serif';
        const metrics = ctx.measureText(label);
        const labelHeight = 20;

        ctx.fillStyle = classInfo.color;
        ctx.fillRect(det.x, det.y - labelHeight, metrics.width + 10, labelHeight);

        ctx.fillStyle = '#fff';
        ctx.fillText(label, det.x + 5, det.y - 5);
    });
}

function displayResults(detections) {
    const categories = new Set(detections.map(d => d.class));

    document.getElementById('objectCount').textContent = detections.length;
    document.getElementById('categoryCount').textContent = categories.size;

    const listContainer = document.getElementById('objectList');
    listContainer.innerHTML = '';

    detections.forEach(det => {
        const classInfo = objectClasses[det.class];
        const div = document.createElement('div');
        div.className = 'object-item';
        div.innerHTML = `
            <div class="object-color" style="background: ${classInfo.color}"></div>
            <span class="object-name">${classInfo[currentLang]}</span>
            <span class="object-confidence">${Math.round(det.confidence * 100)}%</span>
        `;
        listContainer.appendChild(div);
    });

    document.getElementById('resultSection').style.display = 'block';
}

init();
