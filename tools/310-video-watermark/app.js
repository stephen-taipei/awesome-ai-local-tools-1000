/**
 * Video Watermark - Tool #310
 */

const canvas = document.getElementById('previewCanvas');
const ctx = canvas.getContext('2d');
const video = document.getElementById('sourceVideo');
let watermarkImage = null;
let watermarkPosition = 'bottom-right';
let currentTab = 'text';
let animationId = null;

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    document.getElementById('uploadArea').addEventListener('click', () => document.getElementById('videoInput').click());
    document.getElementById('videoInput').addEventListener('change', (e) => loadVideo(e.target.files[0]));

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    document.getElementById('imageUpload').addEventListener('click', () => document.getElementById('imageInput').click());
    document.getElementById('imageInput').addEventListener('change', (e) => loadWatermarkImage(e.target.files[0]));

    document.querySelectorAll('.pos-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.pos-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            watermarkPosition = btn.dataset.pos;
            updatePreview();
        });
    });

    document.getElementById('fontSize').addEventListener('input', (e) => {
        document.getElementById('fontSizeValue').textContent = e.target.value + 'px';
        updatePreview();
    });

    document.getElementById('opacity').addEventListener('input', (e) => {
        document.getElementById('opacityValue').textContent = Math.round(e.target.value * 100) + '%';
        updatePreview();
    });

    ['watermarkText', 'fontColor'].forEach(id => {
        document.getElementById(id).addEventListener('input', updatePreview);
    });

    document.getElementById('playBtn').addEventListener('click', playVideo);
    document.getElementById('downloadBtn').addEventListener('click', downloadFrame);
}

function loadVideo(file) {
    if (!file) return;
    video.src = URL.createObjectURL(file);
    video.onloadedmetadata = () => {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;
        document.getElementById('uploadArea').style.display = 'none';
        document.getElementById('settingsSection').style.display = 'block';
        document.getElementById('previewSection').style.display = 'block';
        updatePreview();
    };
}

function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    document.getElementById(`${tab}-content`).classList.add('active');
    updatePreview();
}

function loadWatermarkImage(file) {
    if (!file) return;
    const img = new Image();
    img.onload = () => {
        watermarkImage = img;
        document.getElementById('watermarkImage').src = img.src;
        document.getElementById('watermarkImage').style.display = 'block';
        updatePreview();
    };
    img.src = URL.createObjectURL(file);
}

function updatePreview() {
    if (!video.videoWidth) return;

    // Draw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const opacity = parseFloat(document.getElementById('opacity').value);
    ctx.globalAlpha = opacity;

    if (currentTab === 'text') {
        drawTextWatermark();
    } else if (watermarkImage) {
        drawImageWatermark();
    }

    ctx.globalAlpha = 1;
}

function drawTextWatermark() {
    const text = document.getElementById('watermarkText').value;
    const fontSize = parseInt(document.getElementById('fontSize').value);
    const color = document.getElementById('fontColor').value;

    ctx.font = `${fontSize}px Arial, sans-serif`;
    ctx.fillStyle = color;
    ctx.textBaseline = 'top';

    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;
    const textHeight = fontSize;
    const margin = 20;

    const pos = getPosition(textWidth, textHeight, margin);
    ctx.fillText(text, pos.x, pos.y);
}

function drawImageWatermark() {
    const imgWidth = watermarkImage.width * 0.2;
    const imgHeight = watermarkImage.height * 0.2;
    const margin = 20;

    const pos = getPosition(imgWidth, imgHeight, margin);
    ctx.drawImage(watermarkImage, pos.x, pos.y, imgWidth, imgHeight);
}

function getPosition(w, h, margin) {
    let x, y;
    const positions = watermarkPosition.split('-');

    // Vertical
    if (positions[0] === 'top') y = margin;
    else if (positions[0] === 'center') y = (canvas.height - h) / 2;
    else y = canvas.height - h - margin;

    // Horizontal
    const hPos = positions[1] || positions[0];
    if (hPos === 'left') x = margin;
    else if (hPos === 'center') x = (canvas.width - w) / 2;
    else x = canvas.width - w - margin;

    return { x, y };
}

function playVideo() {
    video.currentTime = 0;
    video.play();

    function animate() {
        updatePreview();
        animationId = requestAnimationFrame(animate);
    }
    animate();

    video.onended = () => {
        cancelAnimationFrame(animationId);
    };
}

function downloadFrame() {
    updatePreview();
    const link = document.createElement('a');
    link.download = 'watermarked-frame.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

init();
