/**
 * Text to Handwriting - Tool #195
 */
const canvas = document.getElementById('outputCanvas');
const ctx = canvas.getContext('2d');

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    document.getElementById('fontSize').addEventListener('input', (e) => {
        document.getElementById('fontSizeValue').textContent = e.target.value + 'px';
    });
    document.getElementById('lineHeight').addEventListener('input', (e) => {
        document.getElementById('lineHeightValue').textContent = e.target.value;
    });

    document.getElementById('generateBtn').addEventListener('click', generate);
    document.getElementById('downloadBtn').addEventListener('click', download);
}

function generate() {
    const text = document.getElementById('inputText').value.trim();
    if (!text) return;

    const fontStyle = document.getElementById('fontStyle').value;
    const fontSize = parseInt(document.getElementById('fontSize').value);
    const lineHeight = parseFloat(document.getElementById('lineHeight').value);
    const fontColor = document.getElementById('fontColor').value;
    const bgStyle = document.getElementById('bgStyle').value;

    // Get font family
    let fontFamily;
    switch (fontStyle) {
        case 'cursive': fontFamily = 'cursive, "Brush Script MT", sans-serif'; break;
        case 'neat': fontFamily = '"Comic Sans MS", cursive, sans-serif'; break;
        case 'casual': fontFamily = '"Segoe Script", cursive, sans-serif'; break;
        default: fontFamily = 'cursive';
    }

    // Calculate canvas size
    const padding = 40;
    const lines = text.split('\n');
    const lineHeightPx = fontSize * lineHeight;

    // Measure text width
    ctx.font = `${fontSize}px ${fontFamily}`;
    let maxWidth = 0;
    lines.forEach(line => {
        const width = ctx.measureText(line).width;
        if (width > maxWidth) maxWidth = width;
    });

    const canvasWidth = Math.max(400, maxWidth + padding * 2);
    const canvasHeight = Math.max(200, lines.length * lineHeightPx + padding * 2);

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Draw background
    drawBackground(bgStyle, canvasWidth, canvasHeight, lineHeightPx, padding);

    // Draw text with handwriting effect
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = fontColor;
    ctx.textBaseline = 'top';

    lines.forEach((line, i) => {
        const y = padding + i * lineHeightPx;
        let x = padding;

        // Add slight random variations for handwriting effect
        for (const char of line) {
            const offsetX = (Math.random() - 0.5) * 2;
            const offsetY = (Math.random() - 0.5) * 2;
            const rotation = (Math.random() - 0.5) * 0.05;

            ctx.save();
            ctx.translate(x + offsetX, y + offsetY);
            ctx.rotate(rotation);
            ctx.fillText(char, 0, 0);
            ctx.restore();

            x += ctx.measureText(char).width + (Math.random() - 0.5) * 2;
        }
    });

    document.getElementById('resultsSection').style.display = 'block';
}

function drawBackground(style, width, height, lineHeightPx, padding) {
    // Base background (paper-like)
    ctx.fillStyle = '#fefce8';
    ctx.fillRect(0, 0, width, height);

    // Add paper texture
    ctx.fillStyle = 'rgba(0,0,0,0.02)';
    for (let i = 0; i < 1000; i++) {
        ctx.fillRect(Math.random() * width, Math.random() * height, 1, 1);
    }

    if (style === 'lined') {
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
        ctx.lineWidth = 1;
        for (let y = padding + lineHeightPx; y < height - padding; y += lineHeightPx) {
            ctx.beginPath();
            ctx.moveTo(padding / 2, y);
            ctx.lineTo(width - padding / 2, y);
            ctx.stroke();
        }
        // Red margin line
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.beginPath();
        ctx.moveTo(padding - 10, 0);
        ctx.lineTo(padding - 10, height);
        ctx.stroke();
    } else if (style === 'grid') {
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)';
        ctx.lineWidth = 1;
        const gridSize = 30;
        for (let x = 0; x < width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    }
}

function download() {
    const link = document.createElement('a');
    link.download = 'handwriting.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

init();
