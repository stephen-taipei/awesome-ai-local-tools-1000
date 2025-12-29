/**
 * 3D Face Reconstruction - Tool #419
 * Create pseudo-3D face model from 2D image
 */

const canvas = document.getElementById('modelCanvas');
const ctx = canvas.getContext('2d');
let sourceImage = null;
let rotation = 0;
let zoom = 1;
let renderStyle = 'textured';
let animationId = null;
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
    document.getElementById('renderStyle').addEventListener('change', (e) => { renderStyle = e.target.value; render(); });

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');

    const texts = {
        zh: { title: '3D人臉重建', subtitle: '從2D照片建立3D人臉模型', privacy: '100% 本地處理 · 零資料上傳', upload: '上傳正面人臉照片', style: '渲染風格', wireframe: '線框', flat: '平面', textured: '紋理' },
        en: { title: '3D Face Reconstruction', subtitle: 'Create 3D model from 2D photo', privacy: '100% Local Processing · No Data Upload', upload: 'Upload frontal face photo', style: 'Render Style', wireframe: 'Wireframe', flat: 'Flat', textured: 'Textured' }
    };

    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.querySelector('.upload-text').textContent = t.upload;
    document.querySelector('.style-controls label').textContent = t.style;

    const select = document.getElementById('renderStyle');
    select.options[0].text = t.wireframe;
    select.options[1].text = t.flat;
    select.options[2].text = t.textured;
}

function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = 400;
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
    const size = Math.min(canvas.width, canvas.height) * 0.6 * zoom;

    ctx.save();
    ctx.translate(centerX, centerY);

    // Create pseudo-3D effect based on rotation
    const rotRad = rotation * Math.PI / 180;
    const scaleX = Math.cos(rotRad);
    const perspective = 0.3;

    if (renderStyle === 'wireframe') {
        renderWireframe(scaleX, size, perspective);
    } else if (renderStyle === 'flat') {
        renderFlat(scaleX, size, perspective);
    } else {
        renderTextured(scaleX, size, perspective);
    }

    ctx.restore();
}

function renderWireframe(scaleX, size, perspective) {
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 1;

    const gridSize = 8;
    const halfSize = size / 2;

    // Draw vertical lines
    for (let i = 0; i <= gridSize; i++) {
        const x = (i / gridSize - 0.5) * size * scaleX;
        const depth = Math.abs(x / halfSize) * perspective;

        ctx.beginPath();
        ctx.moveTo(x, -halfSize * (1 - depth));
        ctx.lineTo(x, halfSize * (1 - depth));
        ctx.stroke();
    }

    // Draw horizontal lines with depth curve
    for (let i = 0; i <= gridSize; i++) {
        const y = (i / gridSize - 0.5) * size;
        ctx.beginPath();

        for (let j = 0; j <= 20; j++) {
            const x = (j / 20 - 0.5) * size * scaleX;
            const depth = getDepth(x / (halfSize * scaleX), y / halfSize);
            const adjustedY = y * (1 - depth * perspective);

            if (j === 0) ctx.moveTo(x, adjustedY);
            else ctx.lineTo(x, adjustedY);
        }
        ctx.stroke();
    }

    // Draw face outline
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let i = 0; i <= 36; i++) {
        const angle = (i / 36) * Math.PI * 2;
        const radius = halfSize * 0.8;
        const x = Math.cos(angle) * radius * scaleX;
        const y = Math.sin(angle) * radius * 0.95;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
}

function renderFlat(scaleX, size, perspective) {
    const halfSize = size / 2;

    // Base face shape
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, halfSize);
    gradient.addColorStop(0, '#ffd7b5');
    gradient.addColorStop(0.7, '#e8b89a');
    gradient.addColorStop(1, '#c9967a');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(0, 0, halfSize * 0.8 * Math.abs(scaleX), halfSize * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    const eyeY = -size * 0.1;
    const eyeSpacing = size * 0.2 * scaleX;

    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.ellipse(-eyeSpacing, eyeY, size * 0.08 * Math.abs(scaleX), size * 0.04, 0, 0, Math.PI * 2);
    ctx.ellipse(eyeSpacing, eyeY, size * 0.08 * Math.abs(scaleX), size * 0.04, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#4a3520';
    ctx.beginPath();
    ctx.arc(-eyeSpacing, eyeY, size * 0.03, 0, Math.PI * 2);
    ctx.arc(eyeSpacing, eyeY, size * 0.03, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.fillStyle = '#d4a088';
    ctx.beginPath();
    ctx.moveTo(0, eyeY + size * 0.05);
    ctx.lineTo(-size * 0.04 * scaleX, size * 0.15);
    ctx.lineTo(size * 0.04 * scaleX, size * 0.15);
    ctx.closePath();
    ctx.fill();

    // Mouth
    ctx.fillStyle = '#c9766a';
    ctx.beginPath();
    ctx.ellipse(0, size * 0.25, size * 0.1 * Math.abs(scaleX), size * 0.03, 0, 0, Math.PI);
    ctx.fill();
}

function renderTextured(scaleX, size, perspective) {
    const halfSize = size / 2;

    // Create off-screen canvas for texture
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = size;
    tempCanvas.height = size;

    // Draw source image
    const imgSize = Math.min(sourceImage.width, sourceImage.height);
    const sx = (sourceImage.width - imgSize) / 2;
    const sy = (sourceImage.height - imgSize) / 2;
    tempCtx.drawImage(sourceImage, sx, sy, imgSize, imgSize, 0, 0, size, size);

    // Apply depth-based distortion
    const imageData = tempCtx.getImageData(0, 0, size, size);
    const outputData = ctx.createImageData(canvas.width, canvas.height);

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const nx = (x / size - 0.5) * 2;
            const ny = (y / size - 0.5) * 2;

            // Apply perspective distortion
            const distortedX = nx * scaleX;
            const depth = getDepth(nx, ny);
            const distortedY = ny * (1 - depth * perspective);

            // Map to screen coordinates
            const screenX = Math.floor(canvas.width / 2 + distortedX * halfSize);
            const screenY = Math.floor(canvas.height / 2 + distortedY * halfSize);

            if (screenX >= 0 && screenX < canvas.width && screenY >= 0 && screenY < canvas.height) {
                const srcIdx = (y * size + x) * 4;
                const dstIdx = (screenY * canvas.width + screenX) * 4;

                // Apply shading based on rotation
                const shade = 1 - Math.abs(nx * scaleX) * 0.3;

                outputData.data[dstIdx] = imageData.data[srcIdx] * shade;
                outputData.data[dstIdx + 1] = imageData.data[srcIdx + 1] * shade;
                outputData.data[dstIdx + 2] = imageData.data[srcIdx + 2] * shade;
                outputData.data[dstIdx + 3] = imageData.data[srcIdx + 3];
            }
        }
    }

    ctx.putImageData(outputData, 0, 0);
}

function getDepth(nx, ny) {
    // Simple face depth map - center is deeper
    const dist = Math.sqrt(nx * nx + ny * ny);
    return Math.max(0, 1 - dist * dist) * 0.5;
}

init();
