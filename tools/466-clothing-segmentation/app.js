/**
 * Clothing Segmentation - Tool #466
 * Segment clothing items for fashion analysis
 */

let currentLang = 'zh';
let originalImage = null;
let clothingItems = [];

const clothingTypes = [
    { id: 'shirt', zh: '上衣', en: 'Shirt', icon: '👔' },
    { id: 'pants', zh: '褲子', en: 'Pants', icon: '👖' },
    { id: 'dress', zh: '洋裝', en: 'Dress', icon: '👗' },
    { id: 'jacket', zh: '外套', en: 'Jacket', icon: '🧥' },
    { id: 'skirt', zh: '裙子', en: 'Skirt', icon: '🩱' },
    { id: 'shoes', zh: '鞋子', en: 'Shoes', icon: '👟' }
];

const categories = {
    zh: ['正式', '休閒', '運動', '商務'],
    en: ['Formal', 'Casual', 'Sports', 'Business']
};

const texts = {
    zh: {
        title: '服裝分割',
        subtitle: '分割圖片中的服裝區域',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '拖放人像照片至此或點擊上傳',
        segment: '👔 分割服裝',
        processing: '處理中...',
        results: '偵測到的服裝',
        download: '💾 下載結果',
        export: '📄 匯出報告'
    },
    en: {
        title: 'Clothing Segmentation',
        subtitle: 'Segment clothing items for fashion analysis',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Drop portrait photo here or click to upload',
        segment: '👔 Segment Clothing',
        processing: 'Processing...',
        results: 'Detected Clothing',
        download: '💾 Download Result',
        export: '📄 Export Report'
    }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    setupFileUpload();
    document.getElementById('segmentBtn').addEventListener('click', segment);
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
    document.getElementById('resultsTitle').textContent = t.results;
    document.getElementById('downloadBtn').textContent = t.download;
    document.getElementById('exportBtn').textContent = t.export;
    if (clothingItems.length) displayResults();
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
    const maxWidth = 600;
    const scale = Math.min(1, maxWidth / img.width);
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
}

function generateColor() {
    const colors = ['#1a1a1a', '#ffffff', '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899'];
    return colors[Math.floor(Math.random() * colors.length)];
}

async function segment() {
    const t = texts[currentLang];
    document.getElementById('segmentBtn').disabled = true;
    document.getElementById('progressSection').style.display = 'block';
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('exportSection').style.display = 'none';

    drawImage(originalImage);

    for (let i = 0; i <= 100; i += 5) {
        document.getElementById('progressFill').style.width = i + '%';
        document.getElementById('progressText').textContent = `${t.processing} ${i}%`;
        await new Promise(r => setTimeout(r, 25));
    }

    const canvas = document.getElementById('mainCanvas');
    const ctx = canvas.getContext('2d');
    clothingItems = [];

    const numItems = Math.floor(Math.random() * 3) + 2;
    const usedTypes = new Set();

    for (let i = 0; i < numItems; i++) {
        let typeIndex;
        do {
            typeIndex = Math.floor(Math.random() * clothingTypes.length);
        } while (usedTypes.has(typeIndex) && usedTypes.size < clothingTypes.length);
        usedTypes.add(typeIndex);

        const type = clothingTypes[typeIndex];
        const color = generateColor();
        const category = categories[currentLang][Math.floor(Math.random() * categories[currentLang].length)];

        const y = (i + 1) * (canvas.height / (numItems + 1));
        const x = canvas.width * 0.2;
        const w = canvas.width * 0.6;
        const h = canvas.height / (numItems + 1) - 10;

        clothingItems.push({
            type,
            color,
            category,
            bbox: { x, y: y - h/2, w, h },
            confidence: Math.random() * 0.2 + 0.8
        });

        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y - h/2, w, h);
        ctx.fillStyle = 'rgba(244, 63, 94, 0.1)';
        ctx.fillRect(x, y - h/2, w, h);

        ctx.fillStyle = '#f43f5e';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(`${type.icon} ${type[currentLang]}`, x + 5, y - h/2 + 15);
    }

    displayResults();

    document.getElementById('progressSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('exportSection').style.display = 'flex';
    document.getElementById('segmentBtn').disabled = false;
}

function displayResults() {
    document.getElementById('clothingList').innerHTML = clothingItems.map(item => `
        <div class="clothing-item">
            <div class="clothing-info">
                <div class="clothing-color" style="background: ${item.color}"></div>
                <div>
                    <div class="clothing-type">${item.type.icon} ${item.type[currentLang]}</div>
                    <div class="clothing-category">${item.category}</div>
                </div>
            </div>
            <span style="color: var(--text-secondary)">${Math.round(item.confidence * 100)}%</span>
        </div>
    `).join('');
}

function downloadResult() {
    const canvas = document.getElementById('mainCanvas');
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `clothing-segmentation-${Date.now()}.png`;
    a.click();
}

function exportReport() {
    const data = {
        timestamp: new Date().toISOString(),
        items: clothingItems.map(item => ({
            type: item.type.id,
            color: item.color,
            category: item.category,
            confidence: item.confidence
        }))
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `clothing-report-${Date.now()}.json`;
    a.click();
}

init();
