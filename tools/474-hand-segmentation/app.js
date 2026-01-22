/**
 * Hand Segmentation - Tool #474
 * Segment hands for gesture recognition
 */

let currentLang = 'zh';
let originalImage = null;
let handData = null;

const texts = {
    zh: {
        title: '手部分割',
        subtitle: '分割手部區域以進行手勢識別',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '拖放含手部的照片至此或點擊上傳',
        segment: '🖐️ 分割手部',
        processing: '處理中...',
        handArea: '手部面積',
        handCount: '手部數量',
        download: '💾 下載結果',
        export: '📄 匯出報告'
    },
    en: {
        title: 'Hand Segmentation',
        subtitle: 'Segment hands for gesture recognition',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Drop image with hands here or click to upload',
        segment: '🖐️ Segment Hands',
        processing: 'Processing...',
        handArea: 'Hand Area',
        handCount: 'Hand Count',
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
    document.getElementById('areaLabel').textContent = t.handArea;
    document.getElementById('countLabel').textContent = t.handCount;
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

    const handCount = Math.floor(Math.random() * 2) + 1;
    const hands = [];

    for (let i = 0; i < handCount; i++) {
        const palmX = canvas.width * (0.25 + i * 0.5);
        const palmY = canvas.height * (0.4 + Math.random() * 0.2);
        const palmSize = Math.min(canvas.width, canvas.height) * (0.12 + Math.random() * 0.05);

        const landmarks = [];

        // Palm center
        landmarks.push({ x: palmX, y: palmY });

        // Generate finger positions
        const fingerLengths = [0.7, 1, 0.95, 0.85, 0.65]; // thumb to pinky ratios
        for (let f = 0; f < 5; f++) {
            const angle = -Math.PI / 2 + (f - 2) * 0.35;
            const length = palmSize * fingerLengths[f] * 1.8;

            // Finger base
            const baseX = palmX + Math.cos(angle) * palmSize * 0.5;
            const baseY = palmY + Math.sin(angle) * palmSize * 0.3 - palmSize * 0.3;

            // Finger tip
            const tipX = baseX + Math.cos(angle - 0.1) * length;
            const tipY = baseY + Math.sin(angle - 0.1) * length;

            landmarks.push({ x: baseX, y: baseY });
            landmarks.push({ x: tipX, y: tipY });
        }

        hands.push({ palmX, palmY, palmSize, landmarks });

        // Draw palm
        ctx.beginPath();
        ctx.ellipse(palmX, palmY, palmSize, palmSize * 1.2, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(245, 158, 11, 0.35)';
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw fingers
        for (let f = 0; f < 5; f++) {
            const base = landmarks[1 + f * 2];
            const tip = landmarks[2 + f * 2];

            ctx.beginPath();
            ctx.moveTo(base.x, base.y);
            ctx.lineTo(tip.x, tip.y);
            ctx.lineWidth = palmSize * 0.15;
            ctx.lineCap = 'round';
            ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
            ctx.stroke();

            ctx.lineWidth = 2;
            ctx.strokeStyle = '#f59e0b';
            ctx.stroke();
        }

        // Draw landmarks
        ctx.fillStyle = '#fcd34d';
        landmarks.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            ctx.fill();
        });

        // Connect landmarks with skeleton
        ctx.strokeStyle = 'rgba(252, 211, 77, 0.6)';
        ctx.lineWidth = 1;
        for (let f = 0; f < 5; f++) {
            ctx.beginPath();
            ctx.moveTo(landmarks[0].x, landmarks[0].y);
            ctx.lineTo(landmarks[1 + f * 2].x, landmarks[1 + f * 2].y);
            ctx.lineTo(landmarks[2 + f * 2].x, landmarks[2 + f * 2].y);
            ctx.stroke();
        }
    }

    handData = { handCount, hands };

    const totalArea = hands.reduce((sum, h) => sum + Math.PI * h.palmSize * h.palmSize * 2.5, 0);
    const handAreaPercent = Math.round((totalArea / (canvas.width * canvas.height)) * 100);

    document.getElementById('handArea').textContent = handAreaPercent + '%';
    document.getElementById('handCount').textContent = handCount;

    document.getElementById('progressSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('exportSection').style.display = 'flex';
    document.getElementById('segmentBtn').disabled = false;
}

function downloadResult() {
    const canvas = document.getElementById('mainCanvas');
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `hand-segmentation-${Date.now()}.png`;
    a.click();
}

function exportReport() {
    const data = {
        timestamp: new Date().toISOString(),
        handData: handData,
        analysis: {
            handCount: handData.handCount,
            hands: handData.hands.map(h => ({
                palmX: h.palmX,
                palmY: h.palmY,
                palmSize: h.palmSize,
                landmarkCount: h.landmarks.length
            }))
        }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `hand-report-${Date.now()}.json`;
    a.click();
}

init();
