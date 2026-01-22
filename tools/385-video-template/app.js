/**
 * Video Template - Tool #385
 * Apply preset video templates
 */

let currentLang = 'zh';
let outputBlob = null;
let selectedTemplate = 'promo';
let isPlaying = false;

const texts = {
    zh: {
        title: '影片模板',
        subtitle: '套用預設影片模板快速製作',
        privacy: '100% 本地處理 · 零資料上傳',
        preview: '👁️ 預覽',
        process: '🎬 生成影片',
        download: '⬇️ 下載',
        selectTemplate: '選擇模板',
        fillContent: '填入內容',
        primaryColor: '主題色',
        duration: '時長 (秒)',
        processing: '生成中...',
        complete: '生成完成！'
    },
    en: {
        title: 'Video Template',
        subtitle: 'Apply preset video templates',
        privacy: '100% Local Processing · No Data Upload',
        preview: '👁️ Preview',
        process: '🎬 Generate',
        download: '⬇️ Download',
        selectTemplate: 'Select Template',
        fillContent: 'Fill Content',
        primaryColor: 'Primary Color',
        duration: 'Duration (sec)',
        processing: 'Generating...',
        complete: 'Complete!'
    }
};

const templateConfigs = {
    promo: {
        name: '促銷廣告',
        fields: [
            { id: 'headline', label: '主標題', type: 'text', default: '限時特賣' },
            { id: 'discount', label: '折扣/優惠', type: 'text', default: '5折優惠' },
            { id: 'cta', label: '行動號召', type: 'text', default: '立即購買' }
        ],
        gradient: ['#ef4444', '#f97316']
    },
    social: {
        name: '社群貼文',
        fields: [
            { id: 'title', label: '標題', type: 'text', default: '今日精選' },
            { id: 'content', label: '內容', type: 'textarea', default: '分享你的精彩時刻' },
            { id: 'hashtag', label: 'Hashtag', type: 'text', default: '#精彩生活' }
        ],
        gradient: ['#6366f1', '#8b5cf6']
    },
    quote: {
        name: '名言金句',
        fields: [
            { id: 'quote', label: '金句內容', type: 'textarea', default: '成功的秘訣在於堅持' },
            { id: 'author', label: '作者', type: 'text', default: '— 佚名' }
        ],
        gradient: ['#14b8a6', '#22c55e']
    },
    countdown: {
        name: '倒數計時',
        fields: [
            { id: 'title', label: '活動名稱', type: 'text', default: '新品發布' },
            { id: 'date', label: '目標日期', type: 'text', default: '即將來臨' }
        ],
        gradient: ['#0ea5e9', '#06b6d4']
    }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    document.getElementById('previewBtn').addEventListener('click', previewTemplate);
    document.getElementById('processBtn').addEventListener('click', generateVideo);
    document.getElementById('downloadBtn').addEventListener('click', downloadResult);

    document.getElementById('duration').addEventListener('input', (e) => {
        document.getElementById('durationValue').textContent = e.target.value;
    });

    // Template selection
    document.querySelectorAll('.template-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.template-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            selectedTemplate = item.dataset.template;
            updateContentFields();
        });
    });

    updateContentFields();
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

function updateContentFields() {
    const config = templateConfigs[selectedTemplate];
    const container = document.getElementById('contentFields');
    container.innerHTML = '';

    config.fields.forEach(field => {
        const div = document.createElement('div');
        div.className = 'field-group';
        div.innerHTML = `
            <label>${field.label}</label>
            ${field.type === 'textarea'
                ? `<textarea id="field_${field.id}" placeholder="${field.label}">${field.default}</textarea>`
                : `<input type="text" id="field_${field.id}" value="${field.default}" placeholder="${field.label}">`
            }
        `;
        container.appendChild(div);
    });
}

function getFieldValues() {
    const config = templateConfigs[selectedTemplate];
    const values = {};
    config.fields.forEach(field => {
        values[field.id] = document.getElementById(`field_${field.id}`).value;
    });
    return values;
}

function getSettings() {
    return {
        template: selectedTemplate,
        fields: getFieldValues(),
        primaryColor: document.getElementById('primaryColor').value,
        duration: parseFloat(document.getElementById('duration').value)
    };
}

function drawTemplate(ctx, settings, progress, width, height) {
    const config = templateConfigs[settings.template];

    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, config.gradient[0]);
    gradient.addColorStop(1, config.gradient[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    switch (settings.template) {
        case 'promo':
            drawPromo(ctx, settings, progress, width, height);
            break;
        case 'social':
            drawSocial(ctx, settings, progress, width, height);
            break;
        case 'quote':
            drawQuote(ctx, settings, progress, width, height);
            break;
        case 'countdown':
            drawCountdown(ctx, settings, progress, width, height);
            break;
    }
}

function drawPromo(ctx, settings, progress, width, height) {
    const { headline, discount, cta } = settings.fields;
    const centerY = height / 2;

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';

    // Headline with scale animation
    const headlineScale = Math.min(progress * 3, 1);
    ctx.save();
    ctx.translate(width / 2, centerY - 80);
    ctx.scale(headlineScale, headlineScale);
    ctx.font = 'bold 72px -apple-system, sans-serif';
    ctx.fillText(headline, 0, 0);
    ctx.restore();

    // Discount with bounce
    if (progress > 0.2) {
        const discountProgress = (progress - 0.2) / 0.3;
        const bounce = Math.sin(discountProgress * Math.PI * 3) * 20 * (1 - discountProgress);
        ctx.font = 'bold 96px -apple-system, sans-serif';
        ctx.fillStyle = '#fef08a';
        ctx.fillText(discount, width / 2, centerY + 30 - bounce);
    }

    // CTA button
    if (progress > 0.5) {
        const ctaAlpha = (progress - 0.5) / 0.3;
        ctx.globalAlpha = Math.min(ctaAlpha, 1);
        ctx.fillStyle = '#ffffff';
        const btnWidth = 200;
        const btnHeight = 50;
        ctx.fillRect(width / 2 - btnWidth / 2, centerY + 80, btnWidth, btnHeight);
        ctx.fillStyle = config.gradient[0];
        ctx.font = 'bold 24px -apple-system, sans-serif';
        ctx.fillText(cta, width / 2, centerY + 112);
        ctx.globalAlpha = 1;
    }
}

function drawSocial(ctx, settings, progress, width, height) {
    const { title, content, hashtag } = settings.fields;
    const centerY = height / 2;

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';

    // Title slide in
    const titleX = progress < 0.3 ? width * (1 - progress / 0.3) + width / 2 : width / 2;
    ctx.font = 'bold 56px -apple-system, sans-serif';
    ctx.fillText(title, titleX, centerY - 60);

    // Content fade in
    if (progress > 0.3) {
        const contentAlpha = Math.min((progress - 0.3) / 0.3, 1);
        ctx.globalAlpha = contentAlpha;
        ctx.font = '32px -apple-system, sans-serif';
        ctx.fillText(content, width / 2, centerY + 20);
        ctx.globalAlpha = 1;
    }

    // Hashtag
    if (progress > 0.6) {
        const hashAlpha = Math.min((progress - 0.6) / 0.2, 1);
        ctx.globalAlpha = hashAlpha;
        ctx.fillStyle = '#c4b5fd';
        ctx.font = '28px -apple-system, sans-serif';
        ctx.fillText(hashtag, width / 2, centerY + 80);
        ctx.globalAlpha = 1;
    }
}

function drawQuote(ctx, settings, progress, width, height) {
    const { quote, author } = settings.fields;
    const centerY = height / 2;

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';

    // Quote marks
    ctx.font = '120px Georgia, serif';
    ctx.globalAlpha = 0.3;
    ctx.fillText('"', width / 2 - 200, centerY - 50);
    ctx.fillText('"', width / 2 + 200, centerY + 50);
    ctx.globalAlpha = 1;

    // Quote text with typewriter effect
    ctx.font = 'italic 36px Georgia, serif';
    const visibleChars = Math.floor(progress * quote.length * 1.5);
    const displayText = quote.substring(0, Math.min(visibleChars, quote.length));
    ctx.fillText(displayText, width / 2, centerY);

    // Author
    if (progress > 0.7) {
        const authorAlpha = (progress - 0.7) / 0.3;
        ctx.globalAlpha = authorAlpha;
        ctx.font = '24px Georgia, serif';
        ctx.fillStyle = '#d1fae5';
        ctx.fillText(author, width / 2, centerY + 60);
        ctx.globalAlpha = 1;
    }
}

function drawCountdown(ctx, settings, progress, width, height) {
    const { title, date } = settings.fields;
    const centerY = height / 2;

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';

    // Title
    ctx.font = 'bold 48px -apple-system, sans-serif';
    ctx.fillText(title, width / 2, centerY - 80);

    // Countdown numbers animation
    const countdown = Math.floor(10 - progress * 10);
    ctx.font = 'bold 144px -apple-system, sans-serif';
    const scale = 1 + Math.sin(progress * Math.PI * 10) * 0.1;
    ctx.save();
    ctx.translate(width / 2, centerY + 30);
    ctx.scale(scale, scale);
    ctx.fillText(countdown > 0 ? countdown.toString() : '🎉', 0, 0);
    ctx.restore();

    // Date
    ctx.font = '28px -apple-system, sans-serif';
    ctx.fillStyle = '#a5f3fc';
    ctx.fillText(date, width / 2, centerY + 120);
}

function previewTemplate() {
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

        drawTemplate(ctx, settings, progress, canvas.width, canvas.height);

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            setTimeout(() => {
                if (isPlaying) previewTemplate();
            }, 1000);
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
        drawTemplate(ctx, settings, progress, canvas.width, canvas.height);

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
    a.download = `${selectedTemplate}-video.webm`;
    a.click();
}

init();
