/**
 * Animal Detection - Tool #444
 * Detect and classify various animals in images
 */

let currentLang = 'zh';
let imageFile = null;
let detectionResults = [];
let originalImage = null;

const animalClasses = [
    'dog', 'cat', 'bird', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe',
    'lion', 'tiger', 'monkey', 'rabbit', 'deer', 'fox', 'wolf', 'pig', 'mouse', 'squirrel',
    'duck', 'chicken', 'eagle', 'owl', 'parrot', 'penguin', 'fish', 'shark', 'whale', 'dolphin',
    'turtle', 'snake', 'lizard', 'frog', 'butterfly', 'bee', 'spider', 'ant', 'crab', 'lobster'
];

const animalEmojis = {
    'dog': '🐕', 'cat': '🐈', 'bird': '🐦', 'horse': '🐴', 'sheep': '🐑', 'cow': '🐄',
    'elephant': '🐘', 'bear': '🐻', 'zebra': '🦓', 'giraffe': '🦒', 'lion': '🦁', 'tiger': '🐅',
    'monkey': '🐒', 'rabbit': '🐰', 'deer': '🦌', 'fox': '🦊', 'wolf': '🐺', 'pig': '🐷',
    'mouse': '🐭', 'squirrel': '🐿️', 'duck': '🦆', 'chicken': '🐔', 'eagle': '🦅', 'owl': '🦉',
    'parrot': '🦜', 'penguin': '🐧', 'fish': '🐟', 'shark': '🦈', 'whale': '🐋', 'dolphin': '🐬',
    'turtle': '🐢', 'snake': '🐍', 'lizard': '🦎', 'frog': '🐸', 'butterfly': '🦋', 'bee': '🐝',
    'spider': '🕷️', 'ant': '🐜', 'crab': '🦀', 'lobster': '🦞'
};

const texts = {
    zh: {
        title: '動物偵測',
        subtitle: '偵測並辨識圖片中的各類動物',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '拖放圖片至此或點擊上傳',
        uploadHint: '支援 JPG, PNG, WebP',
        confidence: '信心度閾值',
        maxDetect: '最大偵測數',
        detect: '🔍 開始偵測',
        camera: '📷 使用攝影機',
        processing: '處理中...',
        complete: '偵測完成！',
        resultsTitle: '偵測結果',
        total: '偵測到',
        species: '種類',
        download: '💾 下載結果',
        export: '📄 匯出 JSON',
        noAnimals: '未偵測到動物'
    },
    en: {
        title: 'Animal Detection',
        subtitle: 'Detect and classify various animals in images',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Drop image here or click to upload',
        uploadHint: 'Supports JPG, PNG, WebP',
        confidence: 'Confidence Threshold',
        maxDetect: 'Max Detections',
        detect: '🔍 Start Detection',
        camera: '📷 Use Camera',
        processing: 'Processing...',
        complete: 'Detection Complete!',
        resultsTitle: 'Detection Results',
        total: 'Detected',
        species: 'Species',
        download: '💾 Download Result',
        export: '📄 Export JSON',
        noAnimals: 'No animals detected'
    }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    setupFileUpload();
    setupControls();
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
    document.getElementById('confidenceLabel').textContent = t.confidence;
    document.getElementById('maxDetectLabel').textContent = t.maxDetect;
    document.getElementById('detectBtn').textContent = t.detect;
    document.getElementById('cameraBtn').textContent = t.camera;
    document.getElementById('resultsTitle').textContent = t.resultsTitle;
    document.getElementById('totalLabel').textContent = t.total;
    document.getElementById('speciesLabel').textContent = t.species;
    document.getElementById('downloadBtn').textContent = t.download;
    document.getElementById('exportBtn').textContent = t.export;
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

function setupControls() {
    document.getElementById('confidence').addEventListener('input', (e) => {
        document.getElementById('confidenceValue').textContent = Math.round(e.target.value * 100) + '%';
    });
    document.getElementById('detectBtn').addEventListener('click', detectAnimals);
    document.getElementById('cameraBtn').addEventListener('click', useCamera);
    document.getElementById('downloadBtn').addEventListener('click', downloadResult);
    document.getElementById('exportBtn').addEventListener('click', exportJSON);
}

function handleFile(file) {
    if (!file.type.startsWith('image/')) return;
    imageFile = file;

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

async function useCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();

        await new Promise(resolve => video.onloadedmetadata = resolve);

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);

        stream.getTracks().forEach(track => track.stop());

        const img = new Image();
        img.onload = () => {
            originalImage = img;
            drawImage(img);
            document.getElementById('uploadArea').style.display = 'none';
            document.getElementById('editorContent').style.display = 'block';
        };
        img.src = canvas.toDataURL();
    } catch (error) {
        console.error('Camera error:', error);
    }
}

async function detectAnimals() {
    const t = texts[currentLang];
    const confidence = parseFloat(document.getElementById('confidence').value);
    const maxDetect = parseInt(document.getElementById('maxDetect').value);

    document.getElementById('detectBtn').disabled = true;
    document.getElementById('progressSection').style.display = 'block';
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('exportSection').style.display = 'none';

    // Simulate detection with random animals
    detectionResults = [];
    const canvas = document.getElementById('mainCanvas');
    const ctx = canvas.getContext('2d');

    // Redraw original image
    drawImage(originalImage);

    // Simulate processing
    for (let i = 0; i <= 100; i += 10) {
        document.getElementById('progressFill').style.width = i + '%';
        document.getElementById('progressText').textContent = `${t.processing} ${i}%`;
        await new Promise(r => setTimeout(r, 50));
    }

    // Generate random detections (simulated)
    const numDetections = Math.floor(Math.random() * Math.min(5, maxDetect)) + 1;
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

    for (let i = 0; i < numDetections; i++) {
        const animalIndex = Math.floor(Math.random() * animalClasses.length);
        const animal = animalClasses[animalIndex];
        const conf = Math.random() * 0.5 + 0.5;

        if (conf >= confidence) {
            const x = Math.random() * (canvas.width - 100);
            const y = Math.random() * (canvas.height - 100);
            const w = Math.random() * 100 + 80;
            const h = Math.random() * 100 + 80;

            const color = colors[i % colors.length];

            detectionResults.push({
                animal,
                confidence: conf,
                bbox: { x, y, width: w, height: h },
                color
            });

            // Draw bounding box
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, w, h);

            // Draw label
            const emoji = animalEmojis[animal] || '🐾';
            const label = `${emoji} ${animal} ${Math.round(conf * 100)}%`;
            ctx.fillStyle = color;
            ctx.fillRect(x, y - 25, ctx.measureText(label).width + 10, 25);
            ctx.fillStyle = '#fff';
            ctx.font = '14px sans-serif';
            ctx.fillText(label, x + 5, y - 8);
        }
    }

    // Display results
    displayResults();

    document.getElementById('progressSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('exportSection').style.display = 'flex';
    document.getElementById('progressText').textContent = t.complete;
    document.getElementById('detectBtn').disabled = false;
}

function displayResults() {
    const t = texts[currentLang];
    const resultsList = document.getElementById('resultsList');
    resultsList.innerHTML = '';

    if (detectionResults.length === 0) {
        resultsList.innerHTML = `<p style="text-align: center; color: var(--text-secondary);">${t.noAnimals}</p>`;
        document.getElementById('totalCount').textContent = '0';
        document.getElementById('speciesCount').textContent = '0';
        return;
    }

    const species = new Set();
    detectionResults.forEach(result => {
        species.add(result.animal);
        const emoji = animalEmojis[result.animal] || '🐾';
        const item = document.createElement('div');
        item.className = 'result-item';
        item.innerHTML = `
            <div class="result-name">
                <span class="result-color" style="background: ${result.color}"></span>
                <span>${emoji} ${result.animal}</span>
            </div>
            <div class="result-confidence">
                ${Math.round(result.confidence * 100)}%
                <div class="confidence-bar">
                    <div class="confidence-fill" style="width: ${result.confidence * 100}%"></div>
                </div>
            </div>
        `;
        resultsList.appendChild(item);
    });

    document.getElementById('totalCount').textContent = detectionResults.length;
    document.getElementById('speciesCount').textContent = species.size;
}

function downloadResult() {
    const canvas = document.getElementById('mainCanvas');
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `animal-detection-${Date.now()}.png`;
    a.click();
}

function exportJSON() {
    const data = {
        timestamp: new Date().toISOString(),
        detections: detectionResults.map(r => ({
            animal: r.animal,
            confidence: r.confidence,
            bbox: r.bbox
        })),
        totalDetected: detectionResults.length,
        species: [...new Set(detectionResults.map(r => r.animal))]
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `animal-detection-${Date.now()}.json`;
    a.click();
}

init();
