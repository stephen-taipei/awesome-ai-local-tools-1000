/**
 * Picture in Picture - Tool #309
 */

const canvas = document.getElementById('previewCanvas');
const ctx = canvas.getContext('2d');
let mainVideo = document.getElementById('mainVideo');
let pipVideo = document.getElementById('pipVideo');
let pipPosition = 'bottom-right';
let pipSize = 'medium';
let pipBorder = 'thin';
let animationId = null;

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    document.getElementById('mainUpload').addEventListener('click', () => document.getElementById('mainInput').click());
    document.getElementById('pipUpload').addEventListener('click', () => document.getElementById('pipInput').click());

    document.getElementById('mainInput').addEventListener('change', (e) => loadVideo(e.target.files[0], 'main'));
    document.getElementById('pipInput').addEventListener('change', (e) => loadVideo(e.target.files[0], 'pip'));

    document.querySelectorAll('.pos-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.pos-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            pipPosition = btn.dataset.pos;
            updatePreview();
        });
    });

    document.getElementById('pipSize').addEventListener('change', (e) => {
        pipSize = e.target.value;
        updatePreview();
    });

    document.getElementById('pipBorder').addEventListener('change', (e) => {
        pipBorder = e.target.value;
        updatePreview();
    });

    document.getElementById('playPreviewBtn').addEventListener('click', playPreview);
    document.getElementById('downloadBtn').addEventListener('click', downloadFrame);
}

function loadVideo(file, type) {
    if (!file) return;
    const url = URL.createObjectURL(file);

    if (type === 'main') {
        mainVideo.src = url;
        mainVideo.style.display = 'block';
        document.getElementById('mainUpload').style.display = 'none';
    } else {
        pipVideo.src = url;
        pipVideo.style.display = 'block';
        document.getElementById('pipUpload').style.display = 'none';
    }

    checkReady();
}

function checkReady() {
    if (mainVideo.src && pipVideo.src) {
        document.getElementById('settingsSection').style.display = 'block';
        document.getElementById('previewSection').style.display = 'block';

        mainVideo.onloadedmetadata = () => {
            pipVideo.onloadedmetadata = () => {
                canvas.width = mainVideo.videoWidth || 640;
                canvas.height = mainVideo.videoHeight || 360;
                updatePreview();
            };
        };
    }
}

function updatePreview() {
    if (!mainVideo.videoWidth) return;

    // Draw main video
    ctx.drawImage(mainVideo, 0, 0, canvas.width, canvas.height);

    // Calculate PiP size and position
    const sizeMap = { small: 0.15, medium: 0.25, large: 0.35 };
    const pipW = canvas.width * sizeMap[pipSize];
    const pipH = pipW * (pipVideo.videoHeight / pipVideo.videoWidth) || pipW * 0.75;
    const margin = 20;

    let pipX, pipY;
    switch (pipPosition) {
        case 'top-left': pipX = margin; pipY = margin; break;
        case 'top-right': pipX = canvas.width - pipW - margin; pipY = margin; break;
        case 'bottom-left': pipX = margin; pipY = canvas.height - pipH - margin; break;
        case 'bottom-right': pipX = canvas.width - pipW - margin; pipY = canvas.height - pipH - margin; break;
    }

    // Draw border
    if (pipBorder !== 'none') {
        ctx.fillStyle = '#fff';
        const borderWidth = pipBorder === 'thick' ? 4 : 2;
        const radius = pipBorder === 'rounded' ? 10 : 0;

        if (radius > 0) {
            roundRect(ctx, pipX - borderWidth, pipY - borderWidth, pipW + borderWidth * 2, pipH + borderWidth * 2, radius);
        } else {
            ctx.fillRect(pipX - borderWidth, pipY - borderWidth, pipW + borderWidth * 2, pipH + borderWidth * 2);
        }
    }

    // Draw PiP video
    if (pipBorder === 'rounded') {
        ctx.save();
        roundRect(ctx, pipX, pipY, pipW, pipH, 8);
        ctx.clip();
        ctx.drawImage(pipVideo, pipX, pipY, pipW, pipH);
        ctx.restore();
    } else {
        ctx.drawImage(pipVideo, pipX, pipY, pipW, pipH);
    }
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
}

function playPreview() {
    mainVideo.currentTime = 0;
    pipVideo.currentTime = 0;
    mainVideo.play();
    pipVideo.play();

    function animate() {
        updatePreview();
        animationId = requestAnimationFrame(animate);
    }
    animate();

    mainVideo.onended = () => {
        cancelAnimationFrame(animationId);
        pipVideo.pause();
    };
}

function downloadFrame() {
    updatePreview();
    const link = document.createElement('a');
    link.download = 'pip-frame.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

init();
