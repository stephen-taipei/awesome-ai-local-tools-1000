/**
 * Outro Maker - Tool #384
 * Create video outros with credits
 */

let currentLang = 'zh';
let outputBlob = null;
let isPlaying = false;

const texts = {
    zh: {
        title: '片尾製作',
        subtitle: '製作影片片尾字幕與感謝名單',
        privacy: '100% 本地處理 · 零資料上傳',
        preview: '👁️ 預覽',
        process: '🎬 生成片尾',
        download: '⬇️ 下載',
        processing: '生成中...',
        complete: '生成完成！'
    },
    en: {
        title: 'Outro Maker',
        subtitle: 'Create video outros with credits',
        privacy: '100% Local Processing · No Data Upload',
        preview: '👁️ Preview',
        process: '🎬 Generate',
        download: '⬇️ Download',
        processing: 'Generating...',
        complete: 'Complete!'
    }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    document.getElementById('previewBtn').addEventListener('click', previewOutro);
    document.getElementById('processBtn').addEventListener('click', generateVideo);
    document.getElementById('downloadBtn').addEventListener('click', downloadResult);

    document.getElementById('duration').addEventListener('input', (e) => {
        document.getElementById('durationValue').textContent = e.target.value;
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
    document.getElementById('previewBtn').textContent = t.preview;
    document.getElementById('processBtn').textContent = t.process;
    document.getElementById('downloadBtn').textContent = t.download;
}

function getSettings() {
    return {
        title: document.getElementById('titleInput').value,
        credits: document.getElementById('creditsInput').value.split('\n').filter(l => l.trim()),
        endMessage: document.getElementById('endMessageInput').value,
        style: document.getElementById('outroStyle').value,
        textColor: document.getElementById('textColor').value,
        bgColor: document.getElementById('bgColor').value,
        duration: parseFloat(document.getElementById('duration').value)
    };
}

function drawOutro(ctx, settings, progress, width, height) {
    ctx.fillStyle = settings.bgColor;
    ctx.fillRect(0, 0, width, height);

    switch (settings.style) {
        case 'scroll':
            drawScroll(ctx, settings, progress, width, height);
            break;
        case 'fade':
            drawFade(ctx, settings, progress, width, height);
            break;
        case 'cinema':
            drawCinema(ctx, settings, progress, width, height);
            break;
        case 'minimal':
            drawMinimal(ctx, settings, progress, width, height);
            break;
    }
}

function drawScroll(ctx, settings, progress, width, height) {
    const lineHeight = 40;
    const totalLines = settings.credits.length + 4; // title + credits + spacing + end message
    const totalHeight = totalLines * lineHeight;

    const startY = height;
    const endY = -totalHeight;
    const currentY = startY + (endY - startY) * progress;

    ctx.fillStyle = settings.textColor;
    ctx.textAlign = 'center';

    // Title
    ctx.font = 'bold 48px -apple-system, sans-serif';
    ctx.fillText(settings.title, width / 2, currentY);

    // Credits
    ctx.font = '28px -apple-system, sans-serif';
    settings.credits.forEach((credit, i) => {
        ctx.fillText(credit, width / 2, currentY + (i + 2) * lineHeight);
    });

    // End message
    if (settings.endMessage) {
        ctx.font = '24px -apple-system, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(settings.endMessage, width / 2, currentY + (settings.credits.length + 4) * lineHeight);
    }
}

function drawFade(ctx, settings, progress, width, height) {
    const sections = [
        { start: 0, end: 0.3, content: 'title' },
        { start: 0.25, end: 0.7, content: 'credits' },
        { start: 0.65, end: 1, content: 'endMessage' }
    ];

    ctx.textAlign = 'center';

    // Title
    const titleSection = sections[0];
    if (progress >= titleSection.start && progress <= titleSection.end) {
        const sectionProgress = (progress - titleSection.start) / (titleSection.end - titleSection.start);
        const alpha = sectionProgress < 0.5
            ? sectionProgress * 2
            : 2 - sectionProgress * 2;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = settings.textColor;
        ctx.font = 'bold 56px -apple-system, sans-serif';
        ctx.fillText(settings.title, width / 2, height / 2);
        ctx.globalAlpha = 1;
    }

    // Credits
    const creditsSection = sections[1];
    if (progress >= creditsSection.start && progress <= creditsSection.end) {
        const sectionProgress = (progress - creditsSection.start) / (creditsSection.end - creditsSection.start);
        const alpha = sectionProgress < 0.2
            ? sectionProgress * 5
            : sectionProgress > 0.8
                ? (1 - sectionProgress) * 5
                : 1;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = settings.textColor;
        ctx.font = '28px -apple-system, sans-serif';
        const startY = height / 2 - (settings.credits.length * 20);
        settings.credits.forEach((credit, i) => {
            ctx.fillText(credit, width / 2, startY + i * 40);
        });
        ctx.globalAlpha = 1;
    }

    // End message
    const endSection = sections[2];
    if (settings.endMessage && progress >= endSection.start && progress <= endSection.end) {
        const sectionProgress = (progress - endSection.start) / (endSection.end - endSection.start);
        const alpha = sectionProgress < 0.3 ? sectionProgress * 3.33 : 1;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#94a3b8';
        ctx.font = '24px -apple-system, sans-serif';
        ctx.fillText(settings.endMessage, width / 2, height / 2);
        ctx.globalAlpha = 1;
    }
}

function drawCinema(ctx, settings, progress, width, height) {
    // Black bars
    const barHeight = 80;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, barHeight);
    ctx.fillRect(0, height - barHeight, width, barHeight);

    const lineHeight = 35;
    const totalLines = settings.credits.length + 4;
    const totalHeight = totalLines * lineHeight;

    const startY = height - barHeight;
    const endY = barHeight - totalHeight;
    const currentY = startY + (endY - startY) * progress;

    ctx.textAlign = 'center';

    // Title
    ctx.fillStyle = settings.textColor;
    ctx.font = 'bold 42px Georgia, serif';
    ctx.fillText(settings.title, width / 2, currentY);

    // Separator
    ctx.fillRect(width / 2 - 50, currentY + 20, 100, 1);

    // Credits
    ctx.font = '24px Georgia, serif';
    settings.credits.forEach((credit, i) => {
        ctx.fillText(credit, width / 2, currentY + (i + 2) * lineHeight);
    });

    // End message
    if (settings.endMessage) {
        ctx.font = 'italic 20px Georgia, serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(settings.endMessage, width / 2, currentY + (settings.credits.length + 4) * lineHeight);
    }
}

function drawMinimal(ctx, settings, progress, width, height) {
    const centerY = height / 2;

    // Fade in title
    if (progress < 0.4) {
        const alpha = progress / 0.4;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = settings.textColor;
        ctx.font = 'bold 48px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(settings.title, width / 2, centerY - 60);
        ctx.globalAlpha = 1;
    } else if (progress < 0.6) {
        ctx.fillStyle = settings.textColor;
        ctx.font = 'bold 48px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(settings.title, width / 2, centerY - 60);
    } else {
        const alpha = 1 - (progress - 0.6) / 0.4;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = settings.textColor;
        ctx.font = 'bold 48px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(settings.title, width / 2, centerY - 60);
        ctx.globalAlpha = 1;
    }

    // Credits appear one by one
    ctx.font = '24px -apple-system, sans-serif';
    settings.credits.forEach((credit, i) => {
        const creditStart = 0.1 + (i / settings.credits.length) * 0.5;
        const creditEnd = creditStart + 0.3;

        if (progress >= creditStart && progress <= creditEnd) {
            const alpha = Math.min((progress - creditStart) / 0.1, 1, (creditEnd - progress) / 0.1);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = settings.textColor;
            ctx.fillText(credit, width / 2, centerY + i * 30);
            ctx.globalAlpha = 1;
        }
    });

    // End message
    if (settings.endMessage && progress > 0.7) {
        const alpha = (progress - 0.7) / 0.3;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#94a3b8';
        ctx.font = '20px -apple-system, sans-serif';
        ctx.fillText(settings.endMessage, width / 2, height - 100);
        ctx.globalAlpha = 1;
    }
}

function previewOutro() {
    const canvas = document.getElementById('previewCanvas');
    const ctx = canvas.getContext('2d');
    const settings = getSettings();

    canvas.width = 1280;
    canvas.height = 720;

    isPlaying = true;
    const startTime = Date.now();
    const durationMs = settings.duration * 1000;

    function animate() {
        if (!isPlaying) return;

        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / durationMs, 1);

        drawOutro(ctx, settings, progress, canvas.width, canvas.height);

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            setTimeout(() => {
                if (isPlaying) previewOutro();
            }, 2000);
        }
    }

    animate();
}

async function generateVideo() {
    isPlaying = false;

    const t = texts[currentLang];
    const processBtn = document.getElementById('processBtn');
    processBtn.disabled = true;

    document.getElementById('progressSection').style.display = 'block';

    const canvas = document.getElementById('previewCanvas');
    const ctx = canvas.getContext('2d');
    const settings = getSettings();

    canvas.width = 1280;
    canvas.height = 720;

    const fps = 30;
    const totalFrames = Math.floor(settings.duration * fps);

    const stream = canvas.captureStream(fps);
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });

    const chunks = [];
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = () => {
        outputBlob = new Blob(chunks, { type: 'video/webm' });
        document.getElementById('downloadBtn').disabled = false;
        document.getElementById('progressText').textContent = t.complete;
        processBtn.disabled = false;
        processBtn.textContent = t.process;
    };

    mediaRecorder.start();

    for (let frame = 0; frame < totalFrames; frame++) {
        const progress = frame / totalFrames;
        drawOutro(ctx, settings, progress, canvas.width, canvas.height);

        const progressPercent = ((frame + 1) / totalFrames) * 100;
        document.getElementById('progressFill').style.width = progressPercent + '%';
        document.getElementById('progressText').textContent = `${t.processing} ${Math.round(progressPercent)}%`;

        await new Promise(resolve => setTimeout(resolve, 1000 / fps));
    }

    mediaRecorder.stop();
    document.getElementById('progressSection').style.display = 'none';
}

function downloadResult() {
    if (!outputBlob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(outputBlob);
    a.download = 'outro.webm';
    a.click();
}

init();
