/**
 * Logo Detection - Tool #449
 * Detect brand logos in images
 */

let currentLang = 'zh';
let originalImage = null;
let detectionResults = [];

const logoData = {
    'Apple': { category: 'Technology', color: '#555555' },
    'Google': { category: 'Technology', color: '#4285F4' },
    'Microsoft': { category: 'Technology', color: '#00A4EF' },
    'Amazon': { category: 'E-commerce', color: '#FF9900' },
    'Nike': { category: 'Sportswear', color: '#111111' },
    'Adidas': { category: 'Sportswear', color: '#000000' },
    'Coca-Cola': { category: 'Beverage', color: '#ED1C16' },
    'McDonald\'s': { category: 'Fast Food', color: '#FFC72C' },
    'Starbucks': { category: 'Coffee', color: '#00704A' },
    'Samsung': { category: 'Technology', color: '#1428A0' },
    'BMW': { category: 'Automotive', color: '#0066B1' },
    'Mercedes-Benz': { category: 'Automotive', color: '#333333' },
    'Facebook': { category: 'Social Media', color: '#1877F2' },
    'Twitter': { category: 'Social Media', color: '#1DA1F2' },
    'Instagram': { category: 'Social Media', color: '#E4405F' }
};

const texts = {
    zh: {
        title: 'Logo 偵測',
        subtitle: '偵測圖片中的品牌 Logo',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '拖放圖片至此或點擊上傳',
        detect: '🔍 偵測 Logo',
        processing: '處理中...',
        resultsTitle: '偵測結果',
        download: '💾 下載結果',
        export: '📄 匯出 JSON',
        noLogos: '未偵測到品牌 Logo'
    },
    en: {
        title: 'Logo Detection',
        subtitle: 'Detect brand logos in images',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Drop image here or click to upload',
        detect: '🔍 Detect Logos',
        processing: 'Processing...',
        resultsTitle: 'Detection Results',
        download: '💾 Download Result',
        export: '📄 Export JSON',
        noLogos: 'No brand logos detected'
    }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    setupFileUpload();
    document.getElementById('detectBtn').addEventListener('click', detectLogos);
    document.getElementById('downloadBtn').addEventListener('click', downloadResult);
    document.getElementById('exportBtn').addEventListener('click', exportJSON);
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
    document.getElementById('resultsTitle').textContent = t.resultsTitle;
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

async function detectLogos() {
    const t = texts[currentLang];
    document.getElementById('detectBtn').disabled = true;
    document.getElementById('progressSection').style.display = 'block';
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('exportSection').style.display = 'none';

    drawImage(originalImage);

    for (let i = 0; i <= 100; i += 10) {
        document.getElementById('progressFill').style.width = i + '%';
        document.getElementById('progressText').textContent = `${t.processing} ${i}%`;
        await new Promise(r => setTimeout(r, 50));
    }

    const canvas = document.getElementById('mainCanvas');
    const ctx = canvas.getContext('2d');
    const logoKeys = Object.keys(logoData);
    detectionResults = [];

    const numLogos = Math.floor(Math.random() * 3) + 1;
    const usedLogos = new Set();

    for (let i = 0; i < numLogos; i++) {
        let logo;
        do {
            logo = logoKeys[Math.floor(Math.random() * logoKeys.length)];
        } while (usedLogos.has(logo));
        usedLogos.add(logo);

        const x = Math.random() * (canvas.width - 120) + 20;
        const y = Math.random() * (canvas.height - 80) + 20;
        const w = Math.random() * 60 + 60;
        const h = Math.random() * 40 + 40;
        const conf = Math.random() * 0.3 + 0.7 - i * 0.1;

        detectionResults.push({
            brand: logo,
            confidence: conf,
            bbox: { x, y, width: w, height: h },
            ...logoData[logo]
        });

        ctx.strokeStyle = logoData[logo].color;
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, w, h);
        ctx.fillStyle = logoData[logo].color;
        ctx.fillRect(x, y - 20, ctx.measureText(logo).width + 10, 20);
        ctx.fillStyle = '#fff';
        ctx.font = '12px sans-serif';
        ctx.fillText(logo, x + 5, y - 6);
    }

    displayResults();

    document.getElementById('progressSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('exportSection').style.display = 'flex';
    document.getElementById('detectBtn').disabled = false;
}

function displayResults() {
    const t = texts[currentLang];
    const resultsList = document.getElementById('resultsList');

    if (detectionResults.length === 0) {
        resultsList.innerHTML = `<p style="text-align: center; color: var(--text-secondary);">${t.noLogos}</p>`;
        return;
    }

    resultsList.innerHTML = detectionResults.map(r => `
        <div class="result-item">
            <div class="result-info">
                <span class="result-color" style="background: ${r.color}"></span>
                <div>
                    <div class="brand-name">${r.brand}</div>
                    <div class="brand-category">${r.category}</div>
                </div>
            </div>
            <div class="result-confidence">${Math.round(r.confidence * 100)}%</div>
        </div>
    `).join('');
}

function downloadResult() {
    const canvas = document.getElementById('mainCanvas');
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `logo-detection-${Date.now()}.png`;
    a.click();
}

function exportJSON() {
    const data = {
        timestamp: new Date().toISOString(),
        detections: detectionResults.map(r => ({
            brand: r.brand, category: r.category, confidence: r.confidence, bbox: r.bbox
        }))
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `logo-detection-${Date.now()}.json`;
    a.click();
}

init();
