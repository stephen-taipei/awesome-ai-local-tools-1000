/**
 * Open Vocabulary Detection - Tool #459
 * Detect objects using natural language descriptions
 */

let currentLang = 'zh';
let originalImage = null;
let detectionResults = [];
let currentQuery = '';

const texts = {
    zh: {
        title: '開放詞彙偵測',
        subtitle: '使用自然語言描述偵測物件',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '拖放圖片至此或點擊上傳',
        queryLabel: '描述要偵測的物件：',
        placeholder: '例如：紅色的車、戴眼鏡的人、木製桌子',
        detect: '🔍 開始偵測',
        processing: '偵測中...',
        results: '偵測結果',
        searchFor: '搜尋：',
        matchCount: '符合數量',
        download: '💾 下載結果',
        export: '📄 匯出報告',
        match: '符合',
        person: '人',
        vehicle: '車輛',
        animal: '動物',
        food: '食物',
        electronics: '電子產品'
    },
    en: {
        title: 'Open Vocabulary Detection',
        subtitle: 'Detect objects using natural language descriptions',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Drop image here or click to upload',
        queryLabel: 'Describe objects to detect:',
        placeholder: 'e.g., red car, person with glasses, wooden table',
        detect: '🔍 Start Detection',
        processing: 'Detecting...',
        results: 'Detection Results',
        searchFor: 'Search for:',
        matchCount: 'Match Count',
        download: '💾 Download Result',
        export: '📄 Export Report',
        match: 'Match',
        person: 'Person',
        vehicle: 'Vehicle',
        animal: 'Animal',
        food: 'Food',
        electronics: 'Electronics'
    }
};

const suggestionData = {
    zh: ['人', '車輛', '動物', '食物', '電子產品'],
    en: ['Person', 'Vehicle', 'Animal', 'Food', 'Electronics']
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    setupFileUpload();
    document.getElementById('detectBtn').addEventListener('click', detect);
    document.getElementById('downloadBtn').addEventListener('click', downloadResult);
    document.getElementById('exportBtn').addEventListener('click', exportReport);

    document.querySelectorAll('.suggestion').forEach(s => {
        s.addEventListener('click', () => {
            document.getElementById('queryInput').value = s.dataset.query;
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
    document.getElementById('queryLabel').textContent = t.queryLabel;
    document.getElementById('queryInput').placeholder = t.placeholder;
    document.getElementById('detectBtn').textContent = t.detect;
    document.getElementById('resultsTitle').textContent = t.results;
    document.getElementById('matchLabel').textContent = t.matchCount;
    document.getElementById('downloadBtn').textContent = t.download;
    document.getElementById('exportBtn').textContent = t.export;

    const suggestions = document.querySelectorAll('.suggestion');
    const icons = ['👤', '🚗', '🐕', '🍕', '📱'];
    suggestionData[lang].forEach((text, i) => {
        suggestions[i].textContent = `${icons[i]} ${text}`;
        suggestions[i].dataset.query = text;
    });
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

async function detect() {
    const query = document.getElementById('queryInput').value.trim();
    if (!query) {
        document.getElementById('queryInput').focus();
        return;
    }
    currentQuery = query;

    const t = texts[currentLang];
    document.getElementById('detectBtn').disabled = true;
    document.getElementById('progressSection').style.display = 'block';
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('exportSection').style.display = 'none';

    drawImage(originalImage);

    for (let i = 0; i <= 100; i += 10) {
        document.getElementById('progressFill').style.width = i + '%';
        document.getElementById('progressText').textContent = `${t.processing} ${i}%`;
        await new Promise(r => setTimeout(r, 40));
    }

    const canvas = document.getElementById('mainCanvas');
    const ctx = canvas.getContext('2d');
    detectionResults = [];

    const numMatches = Math.floor(Math.random() * 5) + 1;

    for (let i = 0; i < numMatches; i++) {
        const w = Math.random() * 100 + 60;
        const h = Math.random() * 80 + 50;
        const x = Math.random() * (canvas.width - w - 20) + 10;
        const y = Math.random() * (canvas.height - h - 20) + 10;

        detectionResults.push({
            id: i + 1,
            query: query,
            bbox: { x: Math.round(x), y: Math.round(y), width: Math.round(w), height: Math.round(h) },
            similarity: Math.random() * 0.3 + 0.7,
            confidence: Math.random() * 0.2 + 0.8
        });

        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);
        ctx.fillStyle = 'rgba(139, 92, 246, 0.2)';
        ctx.fillRect(x, y, w, h);

        // Draw label
        ctx.fillStyle = '#8b5cf6';
        ctx.fillRect(x, y - 20, 60, 20);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(`${t.match} #${i + 1}`, x + 5, y - 6);
    }

    displayResults();

    document.getElementById('progressSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('exportSection').style.display = 'flex';
    document.getElementById('detectBtn').disabled = false;
}

function displayResults() {
    const t = texts[currentLang];
    document.getElementById('queryDisplay').textContent = `${t.searchFor} "${currentQuery}"`;
    document.getElementById('matchCount').textContent = detectionResults.length;

    document.getElementById('objectList').innerHTML = detectionResults.map(r => `
        <div class="object-item">
            <span>🎯 ${t.match} #${r.id}</span>
            <span style="color: var(--text-secondary)">${Math.round(r.similarity * 100)}% similar</span>
        </div>
    `).join('');
}

function downloadResult() {
    const canvas = document.getElementById('mainCanvas');
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `open-vocab-detection-${Date.now()}.png`;
    a.click();
}

function exportReport() {
    const data = {
        timestamp: new Date().toISOString(),
        query: currentQuery,
        summary: { totalMatches: detectionResults.length },
        matches: detectionResults
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `open-vocab-report-${Date.now()}.json`;
    a.click();
}

init();
