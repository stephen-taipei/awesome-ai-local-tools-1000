/**
 * Text Animation - Tool #382
 * Create animated text videos
 */

let currentLang = 'zh';
let outputBlob = null;
let isPlaying = false;
let animationId = null;

const texts = {
    zh: {
        title: '文字動畫',
        subtitle: '製作精美文字動畫影片',
        privacy: '100% 本地處理 · 零資料上傳',
        preview: '👁️ 預覽',
        process: '🎬 生成影片',
        download: '⬇️ 下載',
        inputText: '輸入文字',
        placeholder: '請輸入要動畫的文字...',
        animationType: '動畫效果',
        fontSize: '字體大小',
        textColor: '文字顏色',
        bgColor: '背景顏色',
        duration: '動畫時長 (秒)',
        processing: '生成中...',
        complete: '生成完成！'
    },
    en: {
        title: 'Text Animation',
        subtitle: 'Create animated text videos',
        privacy: '100% Local Processing · No Data Upload',
        preview: '👁️ Preview',
        process: '🎬 Generate',
        download: '⬇️ Download',
        inputText: 'Input Text',
        placeholder: 'Enter text to animate...',
        animationType: 'Animation',
        fontSize: 'Font Size',
        textColor: 'Text Color',
        bgColor: 'Background',
        duration: 'Duration (sec)',
        processing: 'Generating...',
        complete: 'Complete!'
    }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    document.getElementById('previewBtn').addEventListener('click', previewAnimation);
    document.getElementById('processBtn').addEventListener('click', generateVideo);
    document.getElementById('downloadBtn').addEventListener('click', downloadResult);

    document.getElementById('fontSize').addEventListener('input', (e) => {
        document.getElementById('fontSizeValue').textContent = e.target.value + 'px';
    });
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
        text: document.getElementById('textInput').value,
        animationType: document.getElementById('animationType').value,
        fontSize: parseInt(document.getElementById('fontSize').value),
        textColor: document.getElementById('textColor').value,
        bgColor: document.getElementById('bgColor').value,
        duration: parseFloat(document.getElementById('duration').value)
    };
}

function drawText(ctx, text, settings, progress, width, height) {
    ctx.fillStyle = settings.bgColor;
    ctx.fillRect(0, 0, width, height);

    ctx.font = `bold ${settings.fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const chars = text.split('');
    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;
    const startX = (width - textWidth) / 2;
    const centerY = height / 2;

    switch (settings.animationType) {
        case 'typewriter':
            drawTypewriter(ctx, chars, settings, progress, startX, centerY);
            break;
        case 'fade':
            drawFade(ctx, text, settings, progress, width / 2, centerY);
            break;
        case 'bounce':
            drawBounce(ctx, chars, settings, progress, startX, centerY);
            break;
        case 'wave':
            drawWave(ctx, chars, settings, progress, startX, centerY);
            break;
        case 'glow':
            drawGlow(ctx, text, settings, progress, width / 2, centerY);
            break;
        case 'slide':
            drawSlide(ctx, text, settings, progress, width, centerY);
            break;
    }
}

function drawTypewriter(ctx, chars, settings, progress, startX, centerY) {
    const visibleChars = Math.floor(progress * chars.length);
    ctx.fillStyle = settings.textColor;

    let x = startX;
    for (let i = 0; i <= visibleChars && i < chars.length; i++) {
        const char = chars[i];
        const charWidth = ctx.measureText(char).width;
        ctx.fillText(char, x + charWidth / 2, centerY);
        x += charWidth;
    }

    // Cursor
    if (progress < 1) {
        const cursorVisible = Math.floor(Date.now() / 500) % 2 === 0;
        if (cursorVisible) {
            ctx.fillRect(x, centerY - settings.fontSize / 2, 3, settings.fontSize);
        }
    }
}

function drawFade(ctx, text, settings, progress, centerX, centerY) {
    ctx.globalAlpha = progress;
    ctx.fillStyle = settings.textColor;
    ctx.fillText(text, centerX, centerY);
    ctx.globalAlpha = 1;
}

function drawBounce(ctx, chars, settings, progress, startX, centerY) {
    ctx.fillStyle = settings.textColor;
    let x = startX;

    for (let i = 0; i < chars.length; i++) {
        const char = chars[i];
        const charWidth = ctx.measureText(char).width;
        const delay = i / chars.length * 0.5;
        const charProgress = Math.max(0, Math.min(1, (progress - delay) / (1 - delay)));

        let offsetY = 0;
        if (charProgress < 1) {
            const t = charProgress * Math.PI;
            offsetY = -Math.abs(Math.sin(t * 3)) * 30 * (1 - charProgress);
        }

        ctx.fillText(char, x + charWidth / 2, centerY + offsetY);
        x += charWidth;
    }
}

function drawWave(ctx, chars, settings, progress, startX, centerY) {
    ctx.fillStyle = settings.textColor;
    let x = startX;

    for (let i = 0; i < chars.length; i++) {
        const char = chars[i];
        const charWidth = ctx.measureText(char).width;
        const phase = progress * Math.PI * 4 - i * 0.3;
        const offsetY = Math.sin(phase) * 20;

        ctx.fillText(char, x + charWidth / 2, centerY + offsetY);
        x += charWidth;
    }
}

function drawGlow(ctx, text, settings, progress, centerX, centerY) {
    const glowIntensity = Math.sin(progress * Math.PI * 2) * 0.5 + 0.5;
    const blur = 10 + glowIntensity * 20;

    ctx.shadowColor = settings.textColor;
    ctx.shadowBlur = blur;
    ctx.fillStyle = settings.textColor;

    for (let i = 0; i < 3; i++) {
        ctx.fillText(text, centerX, centerY);
    }

    ctx.shadowBlur = 0;
}

function drawSlide(ctx, text, settings, progress, width, centerY) {
    const startX = -ctx.measureText(text).width;
    const endX = width / 2;
    const currentX = startX + (endX - startX) * easeOutCubic(progress);

    ctx.fillStyle = settings.textColor;
    ctx.fillText(text, currentX, centerY);
}

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

function previewAnimation() {
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

        drawText(ctx, settings.text, settings, progress, canvas.width, canvas.height);

        if (progress < 1) {
            animationId = requestAnimationFrame(animate);
        } else {
            setTimeout(() => {
                if (isPlaying) {
                    previewAnimation();
                }
            }, 1000);
        }
    }

    if (animationId) {
        cancelAnimationFrame(animationId);
    }

    animate();
}

async function generateVideo() {
    isPlaying = false;
    if (animationId) {
        cancelAnimationFrame(animationId);
    }

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
        drawText(ctx, settings.text, settings, progress, canvas.width, canvas.height);

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
    a.download = 'text-animation.webm';
    a.click();
}

init();
