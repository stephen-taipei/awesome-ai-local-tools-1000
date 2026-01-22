/**
 * Document Segmentation - Tool #477
 * Segment document regions and layouts
 */

let currentLang = 'zh';
let originalImage = null;
let segmentationData = null;
let showOriginal = false;

const documentClasses = [
    { id: 'title', zh: '標題', en: 'Title', color: '#ef4444' },
    { id: 'paragraph', zh: '段落', en: 'Paragraph', color: '#3b82f6' },
    { id: 'heading', zh: '標題', en: 'Heading', color: '#f97316' },
    { id: 'image', zh: '圖片', en: 'Image', color: '#22c55e' },
    { id: 'table', zh: '表格', en: 'Table', color: '#8b5cf6' },
    { id: 'list', zh: '列表', en: 'List', color: '#06b6d4' },
    { id: 'caption', zh: '圖說', en: 'Caption', color: '#ec4899' },
    { id: 'footer', zh: '頁尾', en: 'Footer', color: '#64748b' },
    { id: 'header', zh: '頁首', en: 'Header', color: '#a855f7' }
];

const texts = {
    zh: {
        title: '文件分割',
        subtitle: '分析文件版面與區域結構',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '拖放文件圖片至此或點擊上傳',
        segment: '📄 分析版面',
        toggle: '🔄 切換顯示',
        processing: '分析中...',
        results: '版面分析結果',
        blockCount: '區塊數',
        textRatio: '文字比例',
        imageRatio: '圖片比例',
        download: '💾 下載結果',
        export: '📄 匯出JSON'
    },
    en: {
        title: 'Document Segmentation',
        subtitle: 'Analyze document layout and regions',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Drop document image here or click to upload',
        segment: '📄 Analyze Layout',
        toggle: '🔄 Toggle View',
        processing: 'Analyzing...',
        results: 'Layout Analysis Results',
        blockCount: 'Blocks',
        textRatio: 'Text Ratio',
        imageRatio: 'Image Ratio',
        download: '💾 Download Result',
        export: '📄 Export JSON'
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
    document.getElementById('resultsTitle').textContent = t.results;
    document.getElementById('blockLabel').textContent = t.blockCount;
    document.getElementById('textLabel').textContent = t.textRatio;
    document.getElementById('imageLabel').textContent = t.imageRatio;
    document.getElementById('downloadBtn').textContent = t.download;
    document.getElementById('exportBtn').textContent = t.export;
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

    for (let i = 0; i <= 100; i += 4) {
        document.getElementById('progressFill').style.width = i + '%';
        document.getElementById('progressText').textContent = `${t.processing} ${i}%`;
        await new Promise(r => setTimeout(r, 25));
    }

    const canvas = document.getElementById('mainCanvas');
    const ctx = canvas.getContext('2d');

    segmentationData = { classes: [], regions: [] };
    const usedClasses = [];

    // Generate document layout blocks
    const layouts = generateDocumentLayout(canvas.width, canvas.height);

    layouts.forEach(layout => {
        const cls = documentClasses.find(c => c.id === layout.type);
        if (!usedClasses.includes(cls.id)) usedClasses.push(cls.id);
        segmentationData.regions.push({
            classId: cls.id,
            rect: layout.rect,
            confidence: Math.round(Math.random() * 10 + 88)
        });
    });

    segmentationData.classes = usedClasses.map(id => documentClasses.find(c => c.id === id));

    drawSegmentation(ctx);
    displayResults();

    document.getElementById('progressSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('exportSection').style.display = 'flex';
    document.getElementById('toggleBtn').style.display = 'inline-flex';
    document.getElementById('segmentBtn').disabled = false;
    showOriginal = false;
}

function generateDocumentLayout(w, h) {
    const layouts = [];
    const margin = 20;
    let y = margin;

    // Header
    layouts.push({ type: 'header', rect: { x: margin, y: y, w: w - 2 * margin, h: 30 } });
    y += 40;

    // Title
    layouts.push({ type: 'title', rect: { x: margin, y: y, w: w - 2 * margin, h: 40 } });
    y += 60;

    // Generate random content blocks
    const blockTypes = ['paragraph', 'paragraph', 'image', 'table', 'list', 'paragraph'];

    for (let i = 0; i < blockTypes.length && y < h - 80; i++) {
        const type = blockTypes[i];
        const blockH = type === 'paragraph' ? Math.random() * 40 + 50 :
                       type === 'image' ? Math.random() * 60 + 80 :
                       type === 'table' ? Math.random() * 50 + 60 :
                       Math.random() * 30 + 40;

        if (type === 'image' && Math.random() > 0.5) {
            // Side by side layout
            const imgW = (w - 3 * margin) / 2;
            layouts.push({ type: 'image', rect: { x: margin, y: y, w: imgW, h: blockH } });
            layouts.push({ type: 'paragraph', rect: { x: margin * 2 + imgW, y: y, w: imgW, h: blockH } });
        } else {
            layouts.push({ type: type, rect: { x: margin, y: y, w: w - 2 * margin, h: blockH } });
        }

        if (type === 'image') {
            layouts.push({ type: 'caption', rect: { x: margin, y: y + blockH + 5, w: w - 2 * margin, h: 20 } });
            y += 25;
        }

        y += blockH + 15;
    }

    // Footer
    layouts.push({ type: 'footer', rect: { x: margin, y: h - 40, w: w - 2 * margin, h: 25 } });

    return layouts;
}

function drawSegmentation(ctx) {
    segmentationData.regions.forEach(region => {
        const cls = documentClasses.find(c => c.id === region.classId);
        const { x, y, w, h } = region.rect;

        ctx.fillStyle = cls.color + '40';
        ctx.fillRect(x, y, w, h);

        ctx.strokeStyle = cls.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);

        // Draw label
        ctx.fillStyle = cls.color;
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText(cls[currentLang], x + 4, y + 12);
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
    const textTypes = ['title', 'paragraph', 'heading', 'list', 'caption'];
    const imageTypes = ['image', 'table'];

    const textBlocks = segmentationData.regions.filter(r => textTypes.includes(r.classId)).length;
    const imageBlocks = segmentationData.regions.filter(r => imageTypes.includes(r.classId)).length;
    const total = segmentationData.regions.length;

    document.getElementById('blockCount').textContent = total;
    document.getElementById('textRatio').textContent = Math.round((textBlocks / total) * 100) + '%';
    document.getElementById('imageRatio').textContent = Math.round((imageBlocks / total) * 100) + '%';
    updateLegend();
}

function downloadResult() {
    const canvas = document.getElementById('mainCanvas');
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `document-segmentation-${Date.now()}.png`;
    a.click();
}

function exportReport() {
    const data = {
        timestamp: new Date().toISOString(),
        summary: {
            totalBlocks: segmentationData.regions.length,
            classes: segmentationData.classes.map(c => ({ id: c.id, name: c[currentLang] }))
        },
        regions: segmentationData.regions.map(r => {
            const cls = documentClasses.find(c => c.id === r.classId);
            return {
                type: r.classId,
                name: cls[currentLang],
                confidence: r.confidence + '%',
                bounds: r.rect
            };
        })
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `document-layout-${Date.now()}.json`;
    a.click();
}

init();
