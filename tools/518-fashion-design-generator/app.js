/**
 * Fashion Design Generator - Tool #518
 * Awesome AI Local Tools
 *
 * Local fashion sketch generation
 */

// ========================================
// Internationalization (i18n)
// ========================================

const translations = {
    'zh-TW': {
        title: '時尚設計生成',
        subtitle: '智能時尚設計，本地處理保護隱私',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        garmentTypeLabel: '服裝類型',
        garmentDress: '連衣裙',
        garmentShirt: '襯衫',
        garmentPants: '褲子',
        garmentJacket: '夾克',
        styleLabel: '設計風格',
        styleCasual: '休閒風',
        styleFormal: '正式風',
        styleStreetwear: '街頭風',
        styleElegant: '優雅風',
        patternLabel: '圖案',
        patternSolid: '純色',
        patternStripes: '條紋',
        patternPlaid: '格紋',
        patternFloral: '花卉',
        patternDots: '圓點',
        detailLevelLabel: '細節程度',
        colorsLabel: '配色方案',
        colorPrimary: '主色',
        colorSecondary: '副色',
        colorAccent: '強調色',
        generateBtn: '生成設計',
        generating: '生成中...',
        processing: 'AI 正在生成時尚設計...',
        previewTitle: '設計預覽',
        outputTitle: '生成結果',
        downloadPng: '下載 PNG',
        regenerate: '重新生成',
        statGarment: '服裝類型',
        statStyle: '設計風格',
        statPattern: '圖案',
        howItWorks: '功能特色',
        feature1: '多種服裝',
        feature1Desc: '支援連衣裙、襯衫、褲子、夾克',
        feature2: '豐富圖案',
        feature2Desc: '條紋、格紋、花卉、圓點等圖案',
        feature3: '隱私保護',
        feature3Desc: '所有處理在瀏覽器本地完成',
        feature4: '時尚草圖',
        feature4Desc: '生成專業時尚設計草圖',
        backToHome: '返回首頁',
        toolNumber: '工具 #518',
        copyright: 'Awesome AI Local Tools © 2024'
    },
    'en': {
        title: 'Fashion Design Generator',
        subtitle: 'AI-powered fashion design, processed locally',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        garmentTypeLabel: 'Garment Type',
        garmentDress: 'Dress',
        garmentShirt: 'Shirt',
        garmentPants: 'Pants',
        garmentJacket: 'Jacket',
        styleLabel: 'Design Style',
        styleCasual: 'Casual',
        styleFormal: 'Formal',
        styleStreetwear: 'Streetwear',
        styleElegant: 'Elegant',
        patternLabel: 'Pattern',
        patternSolid: 'Solid',
        patternStripes: 'Stripes',
        patternPlaid: 'Plaid',
        patternFloral: 'Floral',
        patternDots: 'Dots',
        detailLevelLabel: 'Detail Level',
        colorsLabel: 'Color Scheme',
        colorPrimary: 'Primary',
        colorSecondary: 'Secondary',
        colorAccent: 'Accent',
        generateBtn: 'Generate Design',
        generating: 'Generating...',
        processing: 'AI is generating fashion design...',
        previewTitle: 'Design Preview',
        outputTitle: 'Generated Result',
        downloadPng: 'Download PNG',
        regenerate: 'Regenerate',
        statGarment: 'Garment',
        statStyle: 'Style',
        statPattern: 'Pattern',
        howItWorks: 'Features',
        feature1: 'Multiple Garments',
        feature1Desc: 'Support dress, shirt, pants, jacket',
        feature2: 'Rich Patterns',
        feature2Desc: 'Stripes, plaid, floral, dots patterns',
        feature3: 'Privacy Protected',
        feature3Desc: 'All processing done locally in browser',
        feature4: 'Fashion Sketch',
        feature4Desc: 'Generate professional fashion sketches',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #518',
        copyright: 'Awesome AI Local Tools © 2024'
    }
};

let currentLang = 'zh-TW';

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`lang-${lang === 'zh-TW' ? 'zh' : 'en'}`).classList.add('active');
    document.documentElement.lang = lang === 'zh-TW' ? 'zh-TW' : 'en';
}

function t(key) {
    return translations[currentLang][key] || key;
}

// ========================================
// Fashion Design Drawing Functions
// ========================================

function generateFashionDesign(garmentType, style, pattern, detailLevel, colors) {
    const canvas = document.getElementById('mainCanvas');
    const ctx = canvas.getContext('2d');
    const [colorPrimary, colorSecondary, colorAccent] = colors;

    // Clear canvas with sketch paper background
    ctx.fillStyle = '#faf5f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add paper texture
    addPaperTexture(ctx, canvas.width, canvas.height);

    // Draw fashion figure silhouette
    drawFashionFigure(ctx, canvas.width, canvas.height);

    // Draw garment based on type
    switch (garmentType) {
        case 'dress':
            drawDress(ctx, style, pattern, colors, detailLevel);
            break;
        case 'shirt':
            drawShirt(ctx, style, pattern, colors, detailLevel);
            break;
        case 'pants':
            drawPants(ctx, style, pattern, colors, detailLevel);
            break;
        case 'jacket':
            drawJacket(ctx, style, pattern, colors, detailLevel);
            break;
    }

    // Add sketch details
    addSketchDetails(ctx, canvas.width, canvas.height, detailLevel);

    return {
        garment: t('garment' + garmentType.charAt(0).toUpperCase() + garmentType.slice(1)),
        style: t('style' + style.charAt(0).toUpperCase() + style.slice(1)),
        pattern: t('pattern' + pattern.charAt(0).toUpperCase() + pattern.slice(1))
    };
}

function addPaperTexture(ctx, w, h) {
    ctx.globalAlpha = 0.03;
    for (let i = 0; i < 1000; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? '#000' : '#8b7355';
        ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
    }
    ctx.globalAlpha = 1;
}

function drawFashionFigure(ctx, w, h) {
    const centerX = w / 2;

    // Light guide lines (fashion sketch style)
    ctx.strokeStyle = '#d4c4b4';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([5, 5]);

    // Center line
    ctx.beginPath();
    ctx.moveTo(centerX, 50);
    ctx.lineTo(centerX, h - 50);
    ctx.stroke();

    // Shoulder line
    ctx.beginPath();
    ctx.moveTo(centerX - 80, 130);
    ctx.lineTo(centerX + 80, 130);
    ctx.stroke();

    // Waist line
    ctx.beginPath();
    ctx.moveTo(centerX - 50, 280);
    ctx.lineTo(centerX + 50, 280);
    ctx.stroke();

    // Hip line
    ctx.beginPath();
    ctx.moveTo(centerX - 60, 340);
    ctx.lineTo(centerX + 60, 340);
    ctx.stroke();

    ctx.setLineDash([]);
}

function drawDress(ctx, style, pattern, colors, detailLevel) {
    const [colorPrimary, colorSecondary, colorAccent] = colors;
    const centerX = ctx.canvas.width / 2;

    // Dress body
    ctx.fillStyle = colorPrimary;
    ctx.beginPath();
    ctx.moveTo(centerX - 40, 140);
    ctx.lineTo(centerX + 40, 140);

    if (style === 'elegant') {
        // A-line elegant dress
        ctx.lineTo(centerX + 80, 450);
        ctx.quadraticCurveTo(centerX, 470, centerX - 80, 450);
    } else if (style === 'formal') {
        // Fitted formal dress
        ctx.lineTo(centerX + 45, 280);
        ctx.lineTo(centerX + 50, 420);
        ctx.lineTo(centerX - 50, 420);
        ctx.lineTo(centerX - 45, 280);
    } else if (style === 'streetwear') {
        // T-shirt dress
        ctx.lineTo(centerX + 60, 380);
        ctx.lineTo(centerX - 60, 380);
    } else {
        // Casual dress
        ctx.lineTo(centerX + 70, 400);
        ctx.lineTo(centerX - 70, 400);
    }
    ctx.closePath();
    ctx.fill();

    // Add pattern
    ctx.save();
    ctx.clip();
    drawPattern(ctx, pattern, colorSecondary, centerX - 80, 140, 160, 320, detailLevel);
    ctx.restore();

    // Neckline
    ctx.strokeStyle = colorAccent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (style === 'elegant') {
        ctx.moveTo(centerX - 35, 140);
        ctx.quadraticCurveTo(centerX, 160, centerX + 35, 140);
    } else {
        ctx.moveTo(centerX - 30, 140);
        ctx.quadraticCurveTo(centerX, 150, centerX + 30, 140);
    }
    ctx.stroke();

    // Sleeves based on style
    ctx.fillStyle = colorPrimary;
    if (style !== 'elegant') {
        // Short sleeves
        ctx.beginPath();
        ctx.moveTo(centerX - 40, 140);
        ctx.lineTo(centerX - 70, 180);
        ctx.lineTo(centerX - 45, 185);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(centerX + 40, 140);
        ctx.lineTo(centerX + 70, 180);
        ctx.lineTo(centerX + 45, 185);
        ctx.closePath();
        ctx.fill();
    }

    // Outline
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(centerX - 40, 140);
    ctx.lineTo(centerX + 40, 140);
    if (style === 'elegant') {
        ctx.lineTo(centerX + 80, 450);
        ctx.quadraticCurveTo(centerX, 470, centerX - 80, 450);
    } else if (style === 'formal') {
        ctx.lineTo(centerX + 45, 280);
        ctx.lineTo(centerX + 50, 420);
        ctx.lineTo(centerX - 50, 420);
        ctx.lineTo(centerX - 45, 280);
    } else if (style === 'streetwear') {
        ctx.lineTo(centerX + 60, 380);
        ctx.lineTo(centerX - 60, 380);
    } else {
        ctx.lineTo(centerX + 70, 400);
        ctx.lineTo(centerX - 70, 400);
    }
    ctx.closePath();
    ctx.stroke();

    // Add details based on detail level
    if (detailLevel > 5) {
        addDressDetails(ctx, centerX, style, colorAccent);
    }
}

function drawShirt(ctx, style, pattern, colors, detailLevel) {
    const [colorPrimary, colorSecondary, colorAccent] = colors;
    const centerX = ctx.canvas.width / 2;

    // Shirt body
    ctx.fillStyle = colorPrimary;
    ctx.beginPath();
    ctx.moveTo(centerX - 50, 140);
    ctx.lineTo(centerX + 50, 140);
    ctx.lineTo(centerX + 55, 280);
    ctx.lineTo(centerX - 55, 280);
    ctx.closePath();
    ctx.fill();

    // Add pattern
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(centerX - 50, 140);
    ctx.lineTo(centerX + 50, 140);
    ctx.lineTo(centerX + 55, 280);
    ctx.lineTo(centerX - 55, 280);
    ctx.closePath();
    ctx.clip();
    drawPattern(ctx, pattern, colorSecondary, centerX - 55, 140, 110, 140, detailLevel);
    ctx.restore();

    // Sleeves
    ctx.fillStyle = colorPrimary;
    // Left sleeve
    ctx.beginPath();
    ctx.moveTo(centerX - 50, 140);
    ctx.lineTo(centerX - 90, 160);
    if (style === 'formal') {
        ctx.lineTo(centerX - 100, 250);
        ctx.lineTo(centerX - 70, 255);
    } else {
        ctx.lineTo(centerX - 85, 200);
        ctx.lineTo(centerX - 55, 195);
    }
    ctx.closePath();
    ctx.fill();

    // Right sleeve
    ctx.beginPath();
    ctx.moveTo(centerX + 50, 140);
    ctx.lineTo(centerX + 90, 160);
    if (style === 'formal') {
        ctx.lineTo(centerX + 100, 250);
        ctx.lineTo(centerX + 70, 255);
    } else {
        ctx.lineTo(centerX + 85, 200);
        ctx.lineTo(centerX + 55, 195);
    }
    ctx.closePath();
    ctx.fill();

    // Collar
    ctx.fillStyle = colorPrimary;
    ctx.strokeStyle = colorAccent;
    ctx.lineWidth = 2;
    if (style === 'formal') {
        // Formal collar
        ctx.beginPath();
        ctx.moveTo(centerX - 30, 140);
        ctx.lineTo(centerX - 40, 115);
        ctx.lineTo(centerX - 15, 130);
        ctx.lineTo(centerX, 145);
        ctx.lineTo(centerX + 15, 130);
        ctx.lineTo(centerX + 40, 115);
        ctx.lineTo(centerX + 30, 140);
        ctx.stroke();
    } else {
        // Casual neckline
        ctx.beginPath();
        ctx.moveTo(centerX - 25, 140);
        ctx.quadraticCurveTo(centerX, 155, centerX + 25, 140);
        ctx.stroke();
    }

    // Outline
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(centerX - 50, 140);
    ctx.lineTo(centerX + 50, 140);
    ctx.lineTo(centerX + 55, 280);
    ctx.lineTo(centerX - 55, 280);
    ctx.closePath();
    ctx.stroke();

    // Buttons for formal style
    if (style === 'formal' && detailLevel > 3) {
        ctx.fillStyle = colorAccent;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.arc(centerX, 160 + i * 25, 4, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function drawPants(ctx, style, pattern, colors, detailLevel) {
    const [colorPrimary, colorSecondary, colorAccent] = colors;
    const centerX = ctx.canvas.width / 2;

    // Pants
    ctx.fillStyle = colorPrimary;

    // Waistband
    ctx.fillRect(centerX - 55, 280, 110, 20);

    // Left leg
    ctx.beginPath();
    ctx.moveTo(centerX - 55, 300);
    ctx.lineTo(centerX - 5, 300);
    if (style === 'streetwear') {
        // Wide leg
        ctx.lineTo(centerX - 20, 520);
        ctx.lineTo(centerX - 70, 520);
    } else if (style === 'formal') {
        // Straight leg
        ctx.lineTo(centerX - 15, 500);
        ctx.lineTo(centerX - 50, 500);
    } else {
        // Tapered
        ctx.lineTo(centerX - 25, 480);
        ctx.lineTo(centerX - 45, 480);
    }
    ctx.closePath();
    ctx.fill();

    // Right leg
    ctx.beginPath();
    ctx.moveTo(centerX + 55, 300);
    ctx.lineTo(centerX + 5, 300);
    if (style === 'streetwear') {
        ctx.lineTo(centerX + 20, 520);
        ctx.lineTo(centerX + 70, 520);
    } else if (style === 'formal') {
        ctx.lineTo(centerX + 15, 500);
        ctx.lineTo(centerX + 50, 500);
    } else {
        ctx.lineTo(centerX + 25, 480);
        ctx.lineTo(centerX + 45, 480);
    }
    ctx.closePath();
    ctx.fill();

    // Add pattern
    ctx.save();
    ctx.beginPath();
    ctx.rect(centerX - 70, 280, 140, 250);
    ctx.clip();
    drawPattern(ctx, pattern, colorSecondary, centerX - 70, 280, 140, 250, detailLevel);
    ctx.restore();

    // Outline
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(centerX - 55, 280, 110, 20);

    // Left leg outline
    ctx.beginPath();
    ctx.moveTo(centerX - 55, 300);
    ctx.lineTo(centerX - 5, 300);
    if (style === 'streetwear') {
        ctx.lineTo(centerX - 20, 520);
        ctx.lineTo(centerX - 70, 520);
    } else if (style === 'formal') {
        ctx.lineTo(centerX - 15, 500);
        ctx.lineTo(centerX - 50, 500);
    } else {
        ctx.lineTo(centerX - 25, 480);
        ctx.lineTo(centerX - 45, 480);
    }
    ctx.closePath();
    ctx.stroke();

    // Right leg outline
    ctx.beginPath();
    ctx.moveTo(centerX + 55, 300);
    ctx.lineTo(centerX + 5, 300);
    if (style === 'streetwear') {
        ctx.lineTo(centerX + 20, 520);
        ctx.lineTo(centerX + 70, 520);
    } else if (style === 'formal') {
        ctx.lineTo(centerX + 15, 500);
        ctx.lineTo(centerX + 50, 500);
    } else {
        ctx.lineTo(centerX + 25, 480);
        ctx.lineTo(centerX + 45, 480);
    }
    ctx.closePath();
    ctx.stroke();

    // Details
    if (detailLevel > 5) {
        // Pockets
        ctx.strokeStyle = colorAccent;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(centerX - 45, 310);
        ctx.lineTo(centerX - 35, 350);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(centerX + 45, 310);
        ctx.lineTo(centerX + 35, 350);
        ctx.stroke();
    }
}

function drawJacket(ctx, style, pattern, colors, detailLevel) {
    const [colorPrimary, colorSecondary, colorAccent] = colors;
    const centerX = ctx.canvas.width / 2;

    // Jacket body
    ctx.fillStyle = colorPrimary;
    ctx.beginPath();
    ctx.moveTo(centerX - 60, 130);
    ctx.lineTo(centerX + 60, 130);
    ctx.lineTo(centerX + 65, 320);
    ctx.lineTo(centerX - 65, 320);
    ctx.closePath();
    ctx.fill();

    // Add pattern
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(centerX - 60, 130);
    ctx.lineTo(centerX + 60, 130);
    ctx.lineTo(centerX + 65, 320);
    ctx.lineTo(centerX - 65, 320);
    ctx.closePath();
    ctx.clip();
    drawPattern(ctx, pattern, colorSecondary, centerX - 65, 130, 130, 190, detailLevel);
    ctx.restore();

    // Sleeves
    ctx.fillStyle = colorPrimary;
    // Left sleeve
    ctx.beginPath();
    ctx.moveTo(centerX - 60, 130);
    ctx.lineTo(centerX - 100, 150);
    ctx.lineTo(centerX - 110, 280);
    ctx.lineTo(centerX - 75, 285);
    ctx.lineTo(centerX - 65, 200);
    ctx.closePath();
    ctx.fill();

    // Right sleeve
    ctx.beginPath();
    ctx.moveTo(centerX + 60, 130);
    ctx.lineTo(centerX + 100, 150);
    ctx.lineTo(centerX + 110, 280);
    ctx.lineTo(centerX + 75, 285);
    ctx.lineTo(centerX + 65, 200);
    ctx.closePath();
    ctx.fill();

    // Lapels
    ctx.fillStyle = lightenColor(colorPrimary, 10);
    ctx.beginPath();
    ctx.moveTo(centerX - 20, 130);
    ctx.lineTo(centerX - 50, 130);
    ctx.lineTo(centerX - 55, 200);
    ctx.lineTo(centerX - 15, 200);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(centerX + 20, 130);
    ctx.lineTo(centerX + 50, 130);
    ctx.lineTo(centerX + 55, 200);
    ctx.lineTo(centerX + 15, 200);
    ctx.closePath();
    ctx.fill();

    // Collar
    ctx.strokeStyle = colorAccent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - 45, 130);
    ctx.lineTo(centerX - 55, 110);
    ctx.lineTo(centerX - 30, 120);
    ctx.lineTo(centerX, 135);
    ctx.lineTo(centerX + 30, 120);
    ctx.lineTo(centerX + 55, 110);
    ctx.lineTo(centerX + 45, 130);
    ctx.stroke();

    // Outline
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(centerX - 60, 130);
    ctx.lineTo(centerX + 60, 130);
    ctx.lineTo(centerX + 65, 320);
    ctx.lineTo(centerX - 65, 320);
    ctx.closePath();
    ctx.stroke();

    // Buttons
    if (detailLevel > 3) {
        ctx.fillStyle = colorAccent;
        ctx.beginPath();
        ctx.arc(centerX - 25, 220, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(centerX - 25, 260, 5, 0, Math.PI * 2);
        ctx.fill();
    }

    // Pockets
    if (detailLevel > 5) {
        ctx.strokeStyle = colorAccent;
        ctx.lineWidth = 1;
        ctx.strokeRect(centerX - 55, 240, 25, 30);
        ctx.strokeRect(centerX + 30, 240, 25, 30);
    }
}

function drawPattern(ctx, pattern, color, x, y, w, h, detailLevel) {
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 1;

    switch (pattern) {
        case 'stripes':
            const stripeSpacing = 15 - detailLevel;
            for (let i = 0; i < w + h; i += Math.max(stripeSpacing, 5)) {
                ctx.beginPath();
                ctx.moveTo(x + i, y);
                ctx.lineTo(x, y + i);
                ctx.stroke();
            }
            break;

        case 'plaid':
            const gridSize = 20 - detailLevel;
            ctx.lineWidth = 2;
            for (let i = 0; i < w; i += Math.max(gridSize, 8)) {
                ctx.beginPath();
                ctx.moveTo(x + i, y);
                ctx.lineTo(x + i, y + h);
                ctx.stroke();
            }
            for (let i = 0; i < h; i += Math.max(gridSize, 8)) {
                ctx.beginPath();
                ctx.moveTo(x, y + i);
                ctx.lineTo(x + w, y + i);
                ctx.stroke();
            }
            break;

        case 'floral':
            const flowerCount = detailLevel * 2;
            for (let i = 0; i < flowerCount; i++) {
                const fx = x + Math.random() * w;
                const fy = y + Math.random() * h;
                drawSmallFlower(ctx, fx, fy, 8, color);
            }
            break;

        case 'dots':
            const dotSpacing = 25 - detailLevel;
            for (let dy = 0; dy < h; dy += Math.max(dotSpacing, 10)) {
                for (let dx = 0; dx < w; dx += Math.max(dotSpacing, 10)) {
                    ctx.beginPath();
                    ctx.arc(x + dx, y + dy, 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            break;
    }

    ctx.globalAlpha = 1;
}

function drawSmallFlower(ctx, x, y, size, color) {
    ctx.fillStyle = color;
    for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 / 5) * i;
        ctx.beginPath();
        ctx.ellipse(
            x + Math.cos(angle) * size * 0.5,
            y + Math.sin(angle) * size * 0.5,
            size * 0.4,
            size * 0.2,
            angle,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(x, y, size * 0.2, 0, Math.PI * 2);
    ctx.fill();
}

function addDressDetails(ctx, centerX, style, accentColor) {
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1;

    // Waist detail
    if (style === 'elegant' || style === 'formal') {
        ctx.beginPath();
        ctx.moveTo(centerX - 45, 280);
        ctx.quadraticCurveTo(centerX, 285, centerX + 45, 280);
        ctx.stroke();
    }

    // Belt or sash
    if (style === 'elegant') {
        ctx.fillStyle = accentColor;
        ctx.fillRect(centerX - 50, 275, 100, 10);
    }
}

function addSketchDetails(ctx, w, h, detailLevel) {
    // Add sketch-like hatching in shadows
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 0.5;

    if (detailLevel > 7) {
        // Add construction lines
        ctx.setLineDash([2, 4]);
        ctx.strokeStyle = '#ccc';

        // Measurement annotations
        ctx.font = '10px Arial';
        ctx.fillStyle = '#999';
        ctx.fillText('front view', 20, h - 20);

        ctx.setLineDash([]);
    }
}

// ========================================
// Color Utility Functions
// ========================================

function lightenColor(hex, percent) {
    const num = parseInt(hex.slice(1), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

function darkenColor(hex, percent) {
    const num = parseInt(hex.slice(1), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
    const B = Math.max(0, (num & 0x0000FF) - amt);
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

// ========================================
// UI Functions
// ========================================

function showProgress() {
    document.getElementById('progressSection').style.display = 'block';
    document.getElementById('canvasSection').style.display = 'none';
    document.getElementById('outputSection').style.display = 'none';

    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    const stages = [
        { progress: 25, text: currentLang === 'zh-TW' ? '分析服裝類型...' : 'Analyzing garment type...' },
        { progress: 50, text: currentLang === 'zh-TW' ? '繪製輪廓...' : 'Drawing silhouette...' },
        { progress: 75, text: currentLang === 'zh-TW' ? '添加細節...' : 'Adding details...' },
        { progress: 100, text: currentLang === 'zh-TW' ? '完成!' : 'Complete!' }
    ];

    let stageIndex = 0;
    const interval = setInterval(() => {
        if (stageIndex < stages.length) {
            progressFill.style.width = stages[stageIndex].progress + '%';
            progressText.textContent = stages[stageIndex].text;
            stageIndex++;
        } else {
            clearInterval(interval);
        }
    }, 300);

    return new Promise(resolve => {
        setTimeout(resolve, stages.length * 300 + 200);
    });
}

function updateStats(stats) {
    const statsHtml = `
        <div class="stat-item">
            <span class="stat-label">${t('statGarment')}:</span>
            <span class="stat-value">${stats.garment}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">${t('statStyle')}:</span>
            <span class="stat-value">${stats.style}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">${t('statPattern')}:</span>
            <span class="stat-value">${stats.pattern}</span>
        </div>
    `;
    document.getElementById('outputStats').innerHTML = statsHtml;
}

function downloadPng() {
    const canvas = document.getElementById('mainCanvas');
    const link = document.createElement('a');
    link.download = 'fashion-design.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

async function regenerate() {
    document.getElementById('generateBtn').click();
}

// ========================================
// Event Handlers
// ========================================

function initEventListeners() {
    // Language switcher
    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    // Range input
    const detailLevel = document.getElementById('detailLevel');
    const detailLevelValue = document.getElementById('detailLevelValue');
    detailLevel.addEventListener('input', () => {
        detailLevelValue.textContent = detailLevel.value;
    });

    // Generate button
    document.getElementById('generateBtn').addEventListener('click', async () => {
        const btn = document.getElementById('generateBtn');
        btn.disabled = true;
        btn.querySelector('span').textContent = t('generating');

        await showProgress();

        const garmentType = document.getElementById('garmentType').value;
        const style = document.getElementById('designStyle').value;
        const pattern = document.getElementById('pattern').value;
        const detailLevelVal = parseInt(document.getElementById('detailLevel').value);
        const colors = [
            document.getElementById('colorPrimary').value,
            document.getElementById('colorSecondary').value,
            document.getElementById('colorAccent').value
        ];

        const stats = generateFashionDesign(garmentType, style, pattern, detailLevelVal, colors);

        document.getElementById('progressSection').style.display = 'none';
        document.getElementById('canvasSection').style.display = 'block';
        document.getElementById('outputSection').style.display = 'block';

        updateStats(stats);

        btn.disabled = false;
        btn.querySelector('span').textContent = t('generateBtn');

        document.getElementById('canvasSection').scrollIntoView({ behavior: 'smooth' });
    });

    // Download button
    document.getElementById('downloadPngBtn').addEventListener('click', downloadPng);
    document.getElementById('regenerateBtn').addEventListener('click', regenerate);
}

// ========================================
// Initialization
// ========================================

function init() {
    const browserLang = navigator.language;
    if (browserLang.startsWith('zh')) {
        setLanguage('zh-TW');
    } else {
        setLanguage('en');
    }

    initEventListeners();
    console.log('Fashion Design Generator initialized - Tool #518');
}

init();
