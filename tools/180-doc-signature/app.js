/**
 * Doc Signature - Tool #180
 */
let canvas, ctx;
let isDrawing = false;
let lastX = 0, lastY = 0;
let strokeColor = '#000000';
let strokeWidth = 3;
let bgColor = 'transparent';
let paths = [];
let currentPath = [];

function init() {
    canvas = document.getElementById('signatureCanvas');
    ctx = canvas.getContext('2d');

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    // Drawing events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Touch events
    canvas.addEventListener('touchstart', handleTouch);
    canvas.addEventListener('touchmove', handleTouch);
    canvas.addEventListener('touchend', stopDrawing);

    // Tools
    document.getElementById('strokeWidth').addEventListener('input', (e) => {
        strokeWidth = parseInt(e.target.value);
    });

    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            strokeColor = btn.dataset.color;
        });
    });

    document.querySelectorAll('.bg-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.bg-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            bgColor = btn.dataset.bg;
            redraw();
        });
    });

    document.getElementById('clearBtn').addEventListener('click', clearCanvas);
    document.getElementById('undoBtn').addEventListener('click', undo);
    document.getElementById('downloadPng').addEventListener('click', downloadPng);
    document.getElementById('downloadSvg').addEventListener('click', downloadSvg);
}

function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = 250 * dpr;
    ctx.scale(dpr, dpr);
    redraw();
}

function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

function startDrawing(e) {
    isDrawing = true;
    const pos = getPos(e);
    lastX = pos.x;
    lastY = pos.y;
    currentPath = [{ x: lastX, y: lastY, color: strokeColor, width: strokeWidth }];
}

function draw(e) {
    if (!isDrawing) return;
    const pos = getPos(e);

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    currentPath.push({ x: pos.x, y: pos.y, color: strokeColor, width: strokeWidth });
    lastX = pos.x;
    lastY = pos.y;

    updatePreview();
}

function stopDrawing() {
    if (isDrawing && currentPath.length > 0) {
        paths.push([...currentPath]);
        currentPath = [];
    }
    isDrawing = false;
}

function handleTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent(
        e.type === 'touchstart' ? 'mousedown' : 'mousemove',
        { clientX: touch.clientX, clientY: touch.clientY }
    );
    canvas.dispatchEvent(mouseEvent);
}

function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (bgColor !== 'transparent') {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    paths.forEach(path => {
        if (path.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i].x, path[i].y);
        }
        ctx.strokeStyle = path[0].color;
        ctx.lineWidth = path[0].width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
    });

    updatePreview();
}

function clearCanvas() {
    paths = [];
    currentPath = [];
    redraw();
}

function undo() {
    if (paths.length > 0) {
        paths.pop();
        redraw();
    }
}

function updatePreview() {
    const dataUrl = canvas.toDataURL('image/png');
    document.getElementById('previewLight').style.backgroundImage = `url(${dataUrl})`;
    document.getElementById('previewLight').innerHTML = '';
    document.getElementById('previewDark').style.backgroundImage = `url(${dataUrl})`;
    document.getElementById('previewDark').innerHTML = '';
}

function downloadPng() {
    const link = document.createElement('a');
    link.download = 'signature.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

function downloadSvg() {
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">`;

    if (bgColor !== 'transparent') {
        svg += `<rect width="100%" height="100%" fill="${bgColor}"/>`;
    }

    paths.forEach(path => {
        if (path.length < 2) return;
        const d = path.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
        svg += `<path d="${d}" stroke="${path[0].color}" stroke-width="${path[0].width}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    });

    svg += '</svg>';

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'signature.svg';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
}

init();
