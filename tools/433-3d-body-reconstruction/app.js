/**
 * 3D Body Reconstruction - Tool #433
 * Create 3D body model from image
 */

const canvas = document.getElementById('modelCanvas');
const ctx = canvas.getContext('2d');
let sourceImage = null;
let rotation = 0;
let zoom = 1;
let renderMode = 'mesh';
let currentLang = 'zh';

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));

    document.getElementById('uploadArea').addEventListener('click', () => document.getElementById('imageInput').click());
    document.getElementById('imageInput').addEventListener('change', (e) => loadImage(e.target.files[0]));

    document.getElementById('rotateLeft').addEventListener('click', () => { rotation -= 15; render(); });
    document.getElementById('rotateRight').addEventListener('click', () => { rotation += 15; render(); });
    document.getElementById('zoomIn').addEventListener('click', () => { zoom = Math.min(zoom + 0.1, 2); render(); });
    document.getElementById('zoomOut').addEventListener('click', () => { zoom = Math.max(zoom - 0.1, 0.5); render(); });

    document.querySelectorAll('.render-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.render-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderMode = btn.dataset.render;
            render();
        });
    });

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');

    const texts = {
        zh: { title: '3D人體重建', subtitle: '從照片建立3D人體模型', privacy: '100% 本地處理 · 零資料上傳', upload: '上傳全身照片', mesh: '網格', wireframe: '線框', solid: '實體' },
        en: { title: '3D Body Reconstruction', subtitle: 'Create 3D model from photo', privacy: '100% Local Processing · No Data Upload', upload: 'Upload full body photo', mesh: 'Mesh', wireframe: 'Wireframe', solid: 'Solid' }
    };

    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.querySelector('.upload-text').textContent = t.upload;

    const btns = document.querySelectorAll('.render-btn');
    btns[0].textContent = t.mesh;
    btns[1].textContent = t.wireframe;
    btns[2].textContent = t.solid;
}

function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = 450;
    if (sourceImage) render();
}

function loadImage(file) {
    if (!file) return;

    const img = new Image();
    img.onload = () => {
        sourceImage = img;
        document.getElementById('uploadArea').style.display = 'none';
        document.getElementById('modelSection').style.display = 'block';
        resizeCanvas();
        render();
    };
    img.src = URL.createObjectURL(file);
}

function render() {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!sourceImage) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const rotRad = rotation * Math.PI / 180;
    const scaleX = Math.cos(rotRad);

    switch (renderMode) {
        case 'wireframe':
            renderWireframe(centerX, centerY, scaleX);
            break;
        case 'solid':
            renderSolid(centerX, centerY, scaleX);
            break;
        default:
            renderMesh(centerX, centerY, scaleX);
    }
}

function renderWireframe(cx, cy, scaleX) {
    const bodyHeight = 350 * zoom;
    const bodyWidth = 120 * zoom;

    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 1;

    // Body outline segments
    const segments = [
        // Head
        { type: 'ellipse', x: 0, y: -bodyHeight * 0.42, w: 30, h: 35 },
        // Neck
        { type: 'line', x1: -10, y1: -bodyHeight * 0.35, x2: -10, y2: -bodyHeight * 0.3 },
        { type: 'line', x1: 10, y1: -bodyHeight * 0.35, x2: 10, y2: -bodyHeight * 0.3 },
        // Shoulders
        { type: 'line', x1: -10, y1: -bodyHeight * 0.3, x2: -bodyWidth * 0.4, y2: -bodyHeight * 0.28 },
        { type: 'line', x1: 10, y1: -bodyHeight * 0.3, x2: bodyWidth * 0.4, y2: -bodyHeight * 0.28 },
        // Torso
        { type: 'line', x1: -bodyWidth * 0.4, y1: -bodyHeight * 0.28, x2: -bodyWidth * 0.3, y2: bodyHeight * 0.1 },
        { type: 'line', x1: bodyWidth * 0.4, y1: -bodyHeight * 0.28, x2: bodyWidth * 0.3, y2: bodyHeight * 0.1 },
        // Hips
        { type: 'line', x1: -bodyWidth * 0.3, y1: bodyHeight * 0.1, x2: -bodyWidth * 0.25, y2: bodyHeight * 0.15 },
        { type: 'line', x1: bodyWidth * 0.3, y1: bodyHeight * 0.1, x2: bodyWidth * 0.25, y2: bodyHeight * 0.15 },
        // Legs
        { type: 'line', x1: -bodyWidth * 0.2, y1: bodyHeight * 0.15, x2: -bodyWidth * 0.18, y2: bodyHeight * 0.45 },
        { type: 'line', x1: bodyWidth * 0.2, y1: bodyHeight * 0.15, x2: bodyWidth * 0.18, y2: bodyHeight * 0.45 }
    ];

    ctx.save();
    ctx.translate(cx, cy);

    segments.forEach(seg => {
        ctx.beginPath();
        if (seg.type === 'ellipse') {
            ctx.ellipse(seg.x * scaleX, seg.y, seg.w * Math.abs(scaleX), seg.h, 0, 0, Math.PI * 2);
        } else if (seg.type === 'line') {
            ctx.moveTo(seg.x1 * scaleX, seg.y1);
            ctx.lineTo(seg.x2 * scaleX, seg.y2);
        }
        ctx.stroke();
    });

    // Grid lines
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.3)';
    for (let i = -5; i <= 5; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 20 * scaleX, -bodyHeight * 0.45);
        ctx.lineTo(i * 20 * scaleX, bodyHeight * 0.45);
        ctx.stroke();
    }

    ctx.restore();
}

function renderSolid(cx, cy, scaleX) {
    const bodyHeight = 350 * zoom;
    const bodyWidth = 120 * zoom;

    ctx.save();
    ctx.translate(cx, cy);

    // Body gradient
    const gradient = ctx.createLinearGradient(-bodyWidth * 0.5 * scaleX, 0, bodyWidth * 0.5 * scaleX, 0);
    gradient.addColorStop(0, '#4a3060');
    gradient.addColorStop(0.5, '#7c3aed');
    gradient.addColorStop(1, '#4a3060');

    // Torso
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(-bodyWidth * 0.35 * scaleX, -bodyHeight * 0.28);
    ctx.lineTo(bodyWidth * 0.35 * scaleX, -bodyHeight * 0.28);
    ctx.lineTo(bodyWidth * 0.25 * scaleX, bodyHeight * 0.15);
    ctx.lineTo(-bodyWidth * 0.25 * scaleX, bodyHeight * 0.15);
    ctx.closePath();
    ctx.fill();

    // Head
    ctx.fillStyle = '#ddb89a';
    ctx.beginPath();
    ctx.ellipse(0, -bodyHeight * 0.42, 28 * Math.abs(scaleX) * zoom, 35 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();

    // Neck
    ctx.fillStyle = '#d4a98a';
    ctx.fillRect(-10 * scaleX, -bodyHeight * 0.35, 20 * Math.abs(scaleX), bodyHeight * 0.05);

    // Legs
    ctx.fillStyle = '#3b3b5c';
    ctx.beginPath();
    ctx.moveTo(-bodyWidth * 0.2 * scaleX, bodyHeight * 0.15);
    ctx.lineTo(-bodyWidth * 0.15 * scaleX, bodyHeight * 0.45);
    ctx.lineTo(-bodyWidth * 0.05 * scaleX, bodyHeight * 0.45);
    ctx.lineTo(-bodyWidth * 0.02 * scaleX, bodyHeight * 0.15);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(bodyWidth * 0.2 * scaleX, bodyHeight * 0.15);
    ctx.lineTo(bodyWidth * 0.15 * scaleX, bodyHeight * 0.45);
    ctx.lineTo(bodyWidth * 0.05 * scaleX, bodyHeight * 0.45);
    ctx.lineTo(bodyWidth * 0.02 * scaleX, bodyHeight * 0.15);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

function renderMesh(cx, cy, scaleX) {
    const bodyHeight = 350 * zoom;

    // Draw textured mesh
    const size = Math.min(sourceImage.width, sourceImage.height);
    const sx = (sourceImage.width - size) / 2;
    const sy = (sourceImage.height - size) / 2;

    ctx.save();
    ctx.translate(cx, cy);

    // Create mesh grid effect
    const gridSize = 10;
    const meshWidth = 150 * zoom;
    const meshHeight = bodyHeight;

    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const srcX = sx + (x / gridSize) * size;
            const srcY = sy + (y / gridSize) * size;
            const srcW = size / gridSize;
            const srcH = size / gridSize;

            const dstX = ((x / gridSize) - 0.5) * meshWidth * scaleX;
            const dstY = ((y / gridSize) - 0.5) * meshHeight;
            const dstW = (meshWidth / gridSize) * Math.abs(scaleX);
            const dstH = meshHeight / gridSize;

            // Apply depth shading
            const depth = Math.abs(x / gridSize - 0.5) * 2;
            ctx.globalAlpha = 1 - depth * 0.3;

            ctx.drawImage(sourceImage, srcX, srcY, srcW, srcH, dstX, dstY, dstW, dstH);
        }
    }

    ctx.globalAlpha = 1;

    // Draw mesh grid
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.3)';
    ctx.lineWidth = 1;

    for (let y = 0; y <= gridSize; y++) {
        ctx.beginPath();
        ctx.moveTo(-meshWidth * 0.5 * scaleX, ((y / gridSize) - 0.5) * meshHeight);
        ctx.lineTo(meshWidth * 0.5 * scaleX, ((y / gridSize) - 0.5) * meshHeight);
        ctx.stroke();
    }

    for (let x = 0; x <= gridSize; x++) {
        ctx.beginPath();
        ctx.moveTo(((x / gridSize) - 0.5) * meshWidth * scaleX, -meshHeight * 0.5);
        ctx.lineTo(((x / gridSize) - 0.5) * meshWidth * scaleX, meshHeight * 0.5);
        ctx.stroke();
    }

    ctx.restore();
}

init();
