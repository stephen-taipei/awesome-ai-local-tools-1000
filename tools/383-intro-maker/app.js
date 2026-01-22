/**
 * Intro Maker - Tool #383
 * Create video intros with animations
 */

let currentLang = 'zh';
let outputBlob = null;
let logoImage = null;
let isPlaying = false;
let particles = [];

const texts = {
    zh: {
        title: '片頭製作',
        subtitle: '製作專業影片片頭動畫',
        privacy: '100% 本地處理 · 零資料上傳',
        preview: '👁️ 預覽',
        process: '🎬 生成片頭',
        download: '⬇️ 下載',
        titleLabel: '標題文字',
        subtitleLabel: '副標題',
        logoLabel: 'Logo 圖片',
        uploadLogo: '📷 上傳 Logo',
        style: '片頭樣式',
        primaryColor: '主題色',
        bgColor: '背景色',
        duration: '時長 (秒)',
        processing: '生成中...',
        complete: '生成完成！'
    },
    en: {
        title: 'Intro Maker',
        subtitle: 'Create professional video intros',
        privacy: '100% Local Processing · No Data Upload',
        preview: '👁️ Preview',
        process: '🎬 Generate',
        download: '⬇️ Download',
        titleLabel: 'Title',
        subtitleLabel: 'Subtitle',
        logoLabel: 'Logo Image',
        uploadLogo: '📷 Upload Logo',
        style: 'Intro Style',
        primaryColor: 'Primary Color',
        bgColor: 'Background',
        duration: 'Duration (sec)',
        processing: 'Generating...',
        complete: 'Complete!'
    }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    document.getElementById('previewBtn').addEventListener('click', previewIntro);
    document.getElementById('processBtn').addEventListener('click', generateVideo);
    document.getElementById('downloadBtn').addEventListener('click', downloadResult);

    document.getElementById('duration').addEventListener('input', (e) => {
        document.getElementById('durationValue').textContent = e.target.value;
    });

    const logoUpload = document.getElementById('logoUpload');
    const logoInput = document.getElementById('logoInput');
    logoUpload.addEventListener('click', () => logoInput.click());
    logoInput.addEventListener('change', handleLogoUpload);
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

function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const img = new Image();
        img.onload = () => {
            logoImage = img;
            document.getElementById('logoPreview').src = img.src;
            document.getElementById('logoPreview').style.display = 'block';
        };
        img.src = URL.createObjectURL(file);
    }
}

function getSettings() {
    return {
        title: document.getElementById('titleInput').value,
        subtitle: document.getElementById('subtitleInput').value,
        style: document.getElementById('introStyle').value,
        primaryColor: document.getElementById('primaryColor').value,
        bgColor: document.getElementById('bgColor').value,
        duration: parseFloat(document.getElementById('duration').value)
    };
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function initParticles(width, height, color) {
    particles = [];
    for (let i = 0; i < 50; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            size: Math.random() * 3 + 1,
            color: color
        });
    }
}

function drawIntro(ctx, settings, progress, width, height) {
    ctx.fillStyle = settings.bgColor;
    ctx.fillRect(0, 0, width, height);

    switch (settings.style) {
        case 'minimal':
            drawMinimal(ctx, settings, progress, width, height);
            break;
        case 'glitch':
            drawGlitch(ctx, settings, progress, width, height);
            break;
        case 'particles':
            drawParticles(ctx, settings, progress, width, height);
            break;
        case 'neon':
            drawNeon(ctx, settings, progress, width, height);
            break;
        case 'zoom':
            drawZoom(ctx, settings, progress, width, height);
            break;
    }
}

function drawMinimal(ctx, settings, progress, width, height) {
    const centerY = height / 2;

    // Logo
    if (logoImage && progress > 0.1) {
        const logoAlpha = Math.min((progress - 0.1) / 0.2, 1);
        ctx.globalAlpha = logoAlpha;
        const logoSize = 80;
        ctx.drawImage(logoImage, width / 2 - logoSize / 2, centerY - 80, logoSize, logoSize);
        ctx.globalAlpha = 1;
    }

    // Title
    if (progress > 0.3) {
        const titleAlpha = Math.min((progress - 0.3) / 0.2, 1);
        ctx.globalAlpha = titleAlpha;
        ctx.fillStyle = settings.primaryColor;
        ctx.font = 'bold 48px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(settings.title, width / 2, centerY + 30);
        ctx.globalAlpha = 1;
    }

    // Subtitle
    if (settings.subtitle && progress > 0.5) {
        const subAlpha = Math.min((progress - 0.5) / 0.2, 1);
        ctx.globalAlpha = subAlpha;
        ctx.fillStyle = '#94a3b8';
        ctx.font = '24px -apple-system, sans-serif';
        ctx.fillText(settings.subtitle, width / 2, centerY + 70);
        ctx.globalAlpha = 1;
    }

    // Line animation
    const lineProgress = Math.min(progress / 0.5, 1);
    const lineWidth = width * 0.3 * lineProgress;
    ctx.fillStyle = settings.primaryColor;
    ctx.fillRect(width / 2 - lineWidth / 2, centerY - 100, lineWidth, 2);
}

function drawGlitch(ctx, settings, progress, width, height) {
    const centerY = height / 2;

    // Glitch effect
    const glitchIntensity = Math.sin(progress * Math.PI * 10) * 5;

    ctx.fillStyle = settings.primaryColor;
    ctx.font = 'bold 60px -apple-system, sans-serif';
    ctx.textAlign = 'center';

    // RGB split
    if (Math.random() > 0.9) {
        ctx.fillStyle = '#ff0000';
        ctx.fillText(settings.title, width / 2 + glitchIntensity, centerY);
        ctx.fillStyle = '#00ff00';
        ctx.fillText(settings.title, width / 2 - glitchIntensity, centerY);
        ctx.fillStyle = '#0000ff';
        ctx.fillText(settings.title, width / 2, centerY + glitchIntensity);
    }

    ctx.fillStyle = settings.primaryColor;
    ctx.fillText(settings.title, width / 2, centerY);

    // Glitch lines
    if (Math.random() > 0.8) {
        const y = Math.random() * height;
        const h = Math.random() * 10;
        ctx.fillStyle = settings.primaryColor;
        ctx.globalAlpha = 0.5;
        ctx.fillRect(0, y, width, h);
        ctx.globalAlpha = 1;
    }
}

function drawParticles(ctx, settings, progress, width, height) {
    if (particles.length === 0) {
        initParticles(width, height, settings.primaryColor);
    }

    // Update and draw particles
    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = settings.primaryColor;
        ctx.globalAlpha = 0.6;
        ctx.fill();
        ctx.globalAlpha = 1;
    });

    // Connect nearby particles
    ctx.strokeStyle = settings.primaryColor;
    ctx.globalAlpha = 0.2;
    particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
            const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
            if (dist < 100) {
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        });
    });
    ctx.globalAlpha = 1;

    // Title
    const titleAlpha = Math.min(progress / 0.3, 1);
    ctx.globalAlpha = titleAlpha;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(settings.title, width / 2, height / 2);
    ctx.globalAlpha = 1;
}

function drawNeon(ctx, settings, progress, width, height) {
    const centerY = height / 2;
    const glow = Math.sin(progress * Math.PI * 4) * 10 + 20;

    ctx.shadowColor = settings.primaryColor;
    ctx.shadowBlur = glow;
    ctx.fillStyle = settings.primaryColor;
    ctx.font = 'bold 60px -apple-system, sans-serif';
    ctx.textAlign = 'center';

    for (let i = 0; i < 3; i++) {
        ctx.fillText(settings.title, width / 2, centerY);
    }

    ctx.shadowBlur = 0;

    if (settings.subtitle) {
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = glow / 2;
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px -apple-system, sans-serif';
        ctx.fillText(settings.subtitle, width / 2, centerY + 50);
        ctx.shadowBlur = 0;
    }
}

function drawZoom(ctx, settings, progress, width, height) {
    const scale = 0.5 + progress * 0.5;
    const alpha = progress < 0.8 ? 1 : 1 - (progress - 0.8) / 0.2;

    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.scale(scale, scale);
    ctx.globalAlpha = alpha;

    if (logoImage) {
        const logoSize = 100;
        ctx.drawImage(logoImage, -logoSize / 2, -logoSize / 2 - 40, logoSize, logoSize);
    }

    ctx.fillStyle = settings.primaryColor;
    ctx.font = 'bold 48px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(settings.title, 0, 40);

    if (settings.subtitle) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '24px -apple-system, sans-serif';
        ctx.fillText(settings.subtitle, 0, 80);
    }

    ctx.restore();
}

function previewIntro() {
    const canvas = document.getElementById('previewCanvas');
    const ctx = canvas.getContext('2d');
    const settings = getSettings();

    canvas.width = 1280;
    canvas.height = 720;
    particles = [];

    isPlaying = true;
    const startTime = Date.now();
    const durationMs = settings.duration * 1000;

    function animate() {
        if (!isPlaying) return;

        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / durationMs, 1);

        drawIntro(ctx, settings, progress, canvas.width, canvas.height);

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            setTimeout(() => {
                if (isPlaying) {
                    particles = [];
                    previewIntro();
                }
            }, 1000);
        }
    }

    animate();
}

async function generateVideo() {
    isPlaying = false;
    particles = [];

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
        drawIntro(ctx, settings, progress, canvas.width, canvas.height);

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
    a.download = 'intro.webm';
    a.click();
}

init();
