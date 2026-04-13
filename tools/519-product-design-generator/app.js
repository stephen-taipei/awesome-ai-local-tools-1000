/**
 * Product Design Generator - Tool #519
 * Awesome AI Local Tools
 *
 * Local 3D-style product design generation
 */

// ========================================
// Internationalization (i18n)
// ========================================

const translations = {
    'zh-TW': {
        title: '產品設計生成',
        subtitle: '智能產品設計，本地處理保護隱私',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        categoryLabel: '產品類別',
        categoryElectronics: '電子產品',
        categoryFurniture: '家具',
        categoryToy: '玩具',
        categoryAppliance: '家電',
        materialLabel: '材質',
        materialMetal: '金屬',
        materialPlastic: '塑膠',
        materialWood: '木材',
        materialGlass: '玻璃',
        finishLabel: '表面處理',
        finishMatte: '霧面',
        finishGlossy: '亮面',
        finishTextured: '紋理',
        finishBrushed: '拉絲',
        complexityLabel: '複雜度',
        colorsLabel: '配色方案',
        colorPrimary: '主色',
        colorSecondary: '副色',
        colorAccent: '強調色',
        generateBtn: '生成設計',
        generating: '生成中...',
        processing: 'AI 正在生成產品設計...',
        previewTitle: '設計預覽',
        outputTitle: '生成結果',
        downloadPng: '下載 PNG',
        regenerate: '重新生成',
        statCategory: '產品類別',
        statMaterial: '材質',
        statFinish: '表面處理',
        howItWorks: '功能特色',
        feature1: '多種產品',
        feature1Desc: '支援電子產品、家具、玩具、家電',
        feature2: '材質選擇',
        feature2Desc: '金屬、塑膠、木材、玻璃等材質',
        feature3: '隱私保護',
        feature3Desc: '所有處理在瀏覽器本地完成',
        feature4: '3D 效果',
        feature4Desc: '生成逼真的 3D 產品渲染',
        backToHome: '返回首頁',
        toolNumber: '工具 #519',
        copyright: 'Awesome AI Local Tools © 2024'
    },
    'en': {
        title: 'Product Design Generator',
        subtitle: 'AI-powered product design, processed locally',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        categoryLabel: 'Product Category',
        categoryElectronics: 'Electronics',
        categoryFurniture: 'Furniture',
        categoryToy: 'Toy',
        categoryAppliance: 'Appliance',
        materialLabel: 'Material',
        materialMetal: 'Metal',
        materialPlastic: 'Plastic',
        materialWood: 'Wood',
        materialGlass: 'Glass',
        finishLabel: 'Surface Finish',
        finishMatte: 'Matte',
        finishGlossy: 'Glossy',
        finishTextured: 'Textured',
        finishBrushed: 'Brushed',
        complexityLabel: 'Complexity',
        colorsLabel: 'Color Scheme',
        colorPrimary: 'Primary',
        colorSecondary: 'Secondary',
        colorAccent: 'Accent',
        generateBtn: 'Generate Design',
        generating: 'Generating...',
        processing: 'AI is generating product design...',
        previewTitle: 'Design Preview',
        outputTitle: 'Generated Result',
        downloadPng: 'Download PNG',
        regenerate: 'Regenerate',
        statCategory: 'Category',
        statMaterial: 'Material',
        statFinish: 'Finish',
        howItWorks: 'Features',
        feature1: 'Multiple Products',
        feature1Desc: 'Support electronics, furniture, toy, appliance',
        feature2: 'Material Options',
        feature2Desc: 'Metal, plastic, wood, glass materials',
        feature3: 'Privacy Protected',
        feature3Desc: 'All processing done locally in browser',
        feature4: '3D Effect',
        feature4Desc: 'Generate realistic 3D product rendering',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #519',
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
// Product Design Drawing Functions
// ========================================

function generateProductDesign(category, material, finish, complexity, colors) {
    const canvas = document.getElementById('mainCanvas');
    const ctx = canvas.getContext('2d');
    const [colorPrimary, colorSecondary, colorAccent] = colors;

    // Clear canvas with gradient background
    const bgGradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 2
    );
    bgGradient.addColorStop(0, '#2d3748');
    bgGradient.addColorStop(1, '#1a202c');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw product based on category
    switch (category) {
        case 'electronics':
            drawElectronics(ctx, material, finish, complexity, colors);
            break;
        case 'furniture':
            drawFurniture(ctx, material, finish, complexity, colors);
            break;
        case 'toy':
            drawToy(ctx, material, finish, complexity, colors);
            break;
        case 'appliance':
            drawAppliance(ctx, material, finish, complexity, colors);
            break;
    }

    // Add shadow
    addProductShadow(ctx, canvas.width, canvas.height);

    return {
        category: t('category' + category.charAt(0).toUpperCase() + category.slice(1)),
        material: t('material' + material.charAt(0).toUpperCase() + material.slice(1)),
        finish: t('finish' + finish.charAt(0).toUpperCase() + finish.slice(1))
    };
}

function drawElectronics(ctx, material, finish, complexity, colors) {
    const [colorPrimary, colorSecondary, colorAccent] = colors;
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;

    // Draw smartphone/tablet style device
    const deviceWidth = 140;
    const deviceHeight = 280;
    const cornerRadius = 25;

    // Device body with 3D effect
    // Back shadow
    ctx.fillStyle = darkenColor(colorPrimary, 40);
    drawRoundedRect(ctx, centerX - deviceWidth / 2 + 8, centerY - deviceHeight / 2 + 8, deviceWidth, deviceHeight, cornerRadius);
    ctx.fill();

    // Side (3D depth)
    ctx.fillStyle = darkenColor(colorPrimary, 20);
    drawRoundedRect(ctx, centerX - deviceWidth / 2 + 4, centerY - deviceHeight / 2 + 4, deviceWidth, deviceHeight, cornerRadius);
    ctx.fill();

    // Main body
    const bodyGradient = createMaterialGradient(ctx, colorPrimary, material, finish,
        centerX - deviceWidth / 2, centerY - deviceHeight / 2, deviceWidth, deviceHeight);
    ctx.fillStyle = bodyGradient;
    drawRoundedRect(ctx, centerX - deviceWidth / 2, centerY - deviceHeight / 2, deviceWidth, deviceHeight, cornerRadius);
    ctx.fill();

    // Screen
    const screenMargin = 12;
    const screenGradient = ctx.createLinearGradient(
        centerX - deviceWidth / 2 + screenMargin,
        centerY - deviceHeight / 2 + screenMargin,
        centerX + deviceWidth / 2 - screenMargin,
        centerY + deviceHeight / 2 - screenMargin * 3
    );
    screenGradient.addColorStop(0, '#1a1a2e');
    screenGradient.addColorStop(0.5, '#16213e');
    screenGradient.addColorStop(1, '#0f3460');
    ctx.fillStyle = screenGradient;
    drawRoundedRect(ctx, centerX - deviceWidth / 2 + screenMargin, centerY - deviceHeight / 2 + screenMargin * 2,
        deviceWidth - screenMargin * 2, deviceHeight - screenMargin * 4, cornerRadius - 8);
    ctx.fill();

    // Screen reflection
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(centerX - deviceWidth / 2 + screenMargin + 10, centerY - deviceHeight / 2 + screenMargin * 2);
    ctx.lineTo(centerX - deviceWidth / 2 + screenMargin + 60, centerY - deviceHeight / 2 + screenMargin * 2);
    ctx.lineTo(centerX - deviceWidth / 2 + screenMargin + 20, centerY);
    ctx.lineTo(centerX - deviceWidth / 2 + screenMargin + 10, centerY);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;

    // Camera notch
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(centerX, centerY - deviceHeight / 2 + screenMargin + 8, 5, 0, Math.PI * 2);
    ctx.fill();

    // Home button/gesture bar
    ctx.fillStyle = colorAccent;
    drawRoundedRect(ctx, centerX - 40, centerY + deviceHeight / 2 - screenMargin - 5, 80, 5, 2);
    ctx.fill();

    // Add complexity details
    if (complexity > 5) {
        // Side buttons
        ctx.fillStyle = darkenColor(colorPrimary, 15);
        ctx.fillRect(centerX + deviceWidth / 2 - 2, centerY - 50, 4, 40);
        ctx.fillRect(centerX + deviceWidth / 2 - 2, centerY + 20, 4, 25);
    }

    if (complexity > 7) {
        // Speaker grille
        ctx.fillStyle = colorAccent;
        for (let i = 0; i < 6; i++) {
            ctx.beginPath();
            ctx.arc(centerX - 25 + i * 10, centerY + deviceHeight / 2 - 8, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function drawFurniture(ctx, material, finish, complexity, colors) {
    const [colorPrimary, colorSecondary, colorAccent] = colors;
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;

    // Draw a modern chair
    const seatWidth = 180;
    const seatDepth = 160;
    const seatHeight = 20;
    const legHeight = 120;

    // Perspective offset
    const perspX = 30;
    const perspY = 20;

    // Chair legs
    ctx.fillStyle = colorAccent;
    // Front left leg
    drawLeg(ctx, centerX - seatWidth / 2 + 20, centerY + 40, legHeight);
    // Front right leg
    drawLeg(ctx, centerX + seatWidth / 2 - 20 - perspX, centerY + 40 - perspY, legHeight);
    // Back left leg
    drawLeg(ctx, centerX - seatWidth / 2 + 20 + perspX, centerY - seatDepth / 2 + perspY, legHeight + 100);
    // Back right leg
    drawLeg(ctx, centerX + seatWidth / 2 - 20, centerY - seatDepth / 2, legHeight + 100);

    // Seat
    const seatGradient = createMaterialGradient(ctx, colorPrimary, material, finish,
        centerX - seatWidth / 2, centerY - seatDepth / 4, seatWidth, seatDepth);
    ctx.fillStyle = seatGradient;

    // Draw 3D seat
    ctx.beginPath();
    ctx.moveTo(centerX - seatWidth / 2, centerY + 40);
    ctx.lineTo(centerX + seatWidth / 2 - perspX, centerY + 40 - perspY);
    ctx.lineTo(centerX + seatWidth / 2, centerY - seatDepth / 2);
    ctx.lineTo(centerX - seatWidth / 2 + perspX, centerY - seatDepth / 2 + perspY);
    ctx.closePath();
    ctx.fill();

    // Seat side
    ctx.fillStyle = darkenColor(colorPrimary, 15);
    ctx.beginPath();
    ctx.moveTo(centerX - seatWidth / 2, centerY + 40);
    ctx.lineTo(centerX - seatWidth / 2 + perspX, centerY - seatDepth / 2 + perspY);
    ctx.lineTo(centerX - seatWidth / 2 + perspX, centerY - seatDepth / 2 + perspY + seatHeight);
    ctx.lineTo(centerX - seatWidth / 2, centerY + 40 + seatHeight);
    ctx.closePath();
    ctx.fill();

    // Backrest
    const backGradient = createMaterialGradient(ctx, colorSecondary, material, finish,
        centerX - seatWidth / 3, centerY - seatDepth / 2 - 80, seatWidth / 1.5, 100);
    ctx.fillStyle = backGradient;

    ctx.beginPath();
    ctx.moveTo(centerX - seatWidth / 3 + perspX, centerY - seatDepth / 2 + perspY);
    ctx.lineTo(centerX + seatWidth / 3, centerY - seatDepth / 2);
    ctx.lineTo(centerX + seatWidth / 3, centerY - seatDepth / 2 - 100);
    ctx.lineTo(centerX - seatWidth / 3 + perspX, centerY - seatDepth / 2 + perspY - 100);
    ctx.closePath();
    ctx.fill();

    // Backrest side
    ctx.fillStyle = darkenColor(colorSecondary, 15);
    ctx.beginPath();
    ctx.moveTo(centerX - seatWidth / 3 + perspX, centerY - seatDepth / 2 + perspY);
    ctx.lineTo(centerX - seatWidth / 3 + perspX, centerY - seatDepth / 2 + perspY - 100);
    ctx.lineTo(centerX - seatWidth / 3 + perspX - 10, centerY - seatDepth / 2 + perspY - 95);
    ctx.lineTo(centerX - seatWidth / 3 + perspX - 10, centerY - seatDepth / 2 + perspY + 5);
    ctx.closePath();
    ctx.fill();

    // Add cushion for complexity
    if (complexity > 5) {
        ctx.fillStyle = lightenColor(colorPrimary, 15);
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.moveTo(centerX - seatWidth / 2 + 15, centerY + 35);
        ctx.lineTo(centerX + seatWidth / 2 - perspX - 15, centerY + 35 - perspY);
        ctx.lineTo(centerX + seatWidth / 2 - 15, centerY - seatDepth / 2 + 15);
        ctx.lineTo(centerX - seatWidth / 2 + perspX + 15, centerY - seatDepth / 2 + perspY + 15);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

function drawLeg(ctx, x, y, height) {
    ctx.fillRect(x, y, 8, height);
}

function drawToy(ctx, material, finish, complexity, colors) {
    const [colorPrimary, colorSecondary, colorAccent] = colors;
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;

    // Draw a toy robot
    // Body
    const bodyGradient = createMaterialGradient(ctx, colorPrimary, material, finish,
        centerX - 60, centerY - 50, 120, 120);
    ctx.fillStyle = bodyGradient;
    drawRoundedRect(ctx, centerX - 60, centerY - 50, 120, 120, 15);
    ctx.fill();

    // Body 3D side
    ctx.fillStyle = darkenColor(colorPrimary, 20);
    ctx.beginPath();
    ctx.moveTo(centerX - 60, centerY - 50);
    ctx.lineTo(centerX - 70, centerY - 40);
    ctx.lineTo(centerX - 70, centerY + 80);
    ctx.lineTo(centerX - 60, centerY + 70);
    ctx.closePath();
    ctx.fill();

    // Head
    const headGradient = createMaterialGradient(ctx, colorSecondary, material, finish,
        centerX - 50, centerY - 130, 100, 80);
    ctx.fillStyle = headGradient;
    drawRoundedRect(ctx, centerX - 50, centerY - 130, 100, 80, 20);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(centerX - 20, centerY - 95, 18, 0, Math.PI * 2);
    ctx.arc(centerX + 20, centerY - 95, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = colorAccent;
    ctx.beginPath();
    ctx.arc(centerX - 18, centerY - 93, 10, 0, Math.PI * 2);
    ctx.arc(centerX + 22, centerY - 93, 10, 0, Math.PI * 2);
    ctx.fill();

    // Eye shine
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(centerX - 22, centerY - 98, 4, 0, Math.PI * 2);
    ctx.arc(centerX + 18, centerY - 98, 4, 0, Math.PI * 2);
    ctx.fill();

    // Antenna
    ctx.fillStyle = colorAccent;
    ctx.fillRect(centerX - 3, centerY - 160, 6, 35);
    ctx.beginPath();
    ctx.arc(centerX, centerY - 165, 10, 0, Math.PI * 2);
    ctx.fill();

    // Arms
    ctx.fillStyle = darkenColor(colorPrimary, 10);
    // Left arm
    drawRoundedRect(ctx, centerX - 100, centerY - 30, 35, 80, 10);
    ctx.fill();
    // Right arm
    drawRoundedRect(ctx, centerX + 65, centerY - 30, 35, 80, 10);
    ctx.fill();

    // Hands
    ctx.fillStyle = colorSecondary;
    ctx.beginPath();
    ctx.arc(centerX - 82, centerY + 60, 18, 0, Math.PI * 2);
    ctx.arc(centerX + 82, centerY + 60, 18, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    ctx.fillStyle = darkenColor(colorPrimary, 10);
    drawRoundedRect(ctx, centerX - 45, centerY + 75, 35, 90, 10);
    ctx.fill();
    drawRoundedRect(ctx, centerX + 10, centerY + 75, 35, 90, 10);
    ctx.fill();

    // Feet
    ctx.fillStyle = colorAccent;
    drawRoundedRect(ctx, centerX - 55, centerY + 155, 55, 25, 8);
    ctx.fill();
    drawRoundedRect(ctx, centerX, centerY + 155, 55, 25, 8);
    ctx.fill();

    // Body details
    if (complexity > 4) {
        ctx.fillStyle = colorSecondary;
        ctx.beginPath();
        ctx.arc(centerX, centerY + 10, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = colorAccent;
        ctx.beginPath();
        ctx.arc(centerX, centerY + 10, 15, 0, Math.PI * 2);
        ctx.fill();
    }

    if (complexity > 7) {
        // Panel lines
        ctx.strokeStyle = darkenColor(colorPrimary, 30);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX - 40, centerY - 35);
        ctx.lineTo(centerX + 40, centerY - 35);
        ctx.moveTo(centerX - 40, centerY + 50);
        ctx.lineTo(centerX + 40, centerY + 50);
        ctx.stroke();
    }
}

function drawAppliance(ctx, material, finish, complexity, colors) {
    const [colorPrimary, colorSecondary, colorAccent] = colors;
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;

    // Draw a modern coffee maker / appliance
    const baseWidth = 180;
    const baseHeight = 280;

    // Main body
    const bodyGradient = createMaterialGradient(ctx, colorPrimary, material, finish,
        centerX - baseWidth / 2, centerY - baseHeight / 2, baseWidth, baseHeight);
    ctx.fillStyle = bodyGradient;
    drawRoundedRect(ctx, centerX - baseWidth / 2, centerY - baseHeight / 2, baseWidth, baseHeight, 20);
    ctx.fill();

    // 3D side
    ctx.fillStyle = darkenColor(colorPrimary, 25);
    ctx.beginPath();
    ctx.moveTo(centerX - baseWidth / 2, centerY - baseHeight / 2 + 20);
    ctx.lineTo(centerX - baseWidth / 2 - 15, centerY - baseHeight / 2 + 35);
    ctx.lineTo(centerX - baseWidth / 2 - 15, centerY + baseHeight / 2 - 5);
    ctx.lineTo(centerX - baseWidth / 2, centerY + baseHeight / 2 - 20);
    ctx.closePath();
    ctx.fill();

    // Display panel
    ctx.fillStyle = '#111';
    drawRoundedRect(ctx, centerX - 60, centerY - baseHeight / 2 + 30, 120, 50, 8);
    ctx.fill();

    // Display content
    ctx.fillStyle = colorAccent;
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('12:00', centerX, centerY - baseHeight / 2 + 65);

    // Control buttons
    ctx.fillStyle = colorSecondary;
    const buttonY = centerY - baseHeight / 2 + 100;
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(centerX - 40 + i * 40, buttonY, 12, 0, Math.PI * 2);
        ctx.fill();
    }

    // Main chamber/window
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    drawRoundedRect(ctx, centerX - 55, centerY - 30, 110, 120, 10);
    ctx.fill();

    // Glass effect
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(centerX - 50, centerY - 25);
    ctx.lineTo(centerX - 20, centerY - 25);
    ctx.lineTo(centerX - 40, centerY + 50);
    ctx.lineTo(centerX - 50, centerY + 50);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;

    // Drip tray
    ctx.fillStyle = colorAccent;
    drawRoundedRect(ctx, centerX - 70, centerY + baseHeight / 2 - 50, 140, 30, 5);
    ctx.fill();

    // Spout
    ctx.fillStyle = darkenColor(colorPrimary, 15);
    ctx.fillRect(centerX - 10, centerY + 50, 20, 40);

    // Base platform
    ctx.fillStyle = colorSecondary;
    drawRoundedRect(ctx, centerX - baseWidth / 2 - 10, centerY + baseHeight / 2 - 15, baseWidth + 20, 20, 5);
    ctx.fill();

    if (complexity > 5) {
        // Water tank indicator
        ctx.fillStyle = lightenColor(colorSecondary, 20);
        ctx.fillRect(centerX + baseWidth / 2 - 25, centerY - 60, 15, 100);

        // Water level
        ctx.fillStyle = '#3b82f6';
        ctx.globalAlpha = 0.6;
        ctx.fillRect(centerX + baseWidth / 2 - 23, centerY, 11, 38);
        ctx.globalAlpha = 1;
    }

    if (complexity > 7) {
        // Brand logo placeholder
        ctx.fillStyle = colorAccent;
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText('BREW', centerX, centerY + baseHeight / 2 - 65);
    }
}

function createMaterialGradient(ctx, baseColor, material, finish, x, y, w, h) {
    let gradient;

    switch (material) {
        case 'metal':
            gradient = ctx.createLinearGradient(x, y, x + w, y + h);
            gradient.addColorStop(0, lightenColor(baseColor, 30));
            gradient.addColorStop(0.3, baseColor);
            gradient.addColorStop(0.5, lightenColor(baseColor, 20));
            gradient.addColorStop(0.7, baseColor);
            gradient.addColorStop(1, darkenColor(baseColor, 20));
            break;

        case 'plastic':
            gradient = ctx.createLinearGradient(x, y, x, y + h);
            gradient.addColorStop(0, lightenColor(baseColor, 15));
            gradient.addColorStop(0.5, baseColor);
            gradient.addColorStop(1, darkenColor(baseColor, 10));
            break;

        case 'wood':
            gradient = ctx.createLinearGradient(x, y, x + w, y);
            gradient.addColorStop(0, baseColor);
            gradient.addColorStop(0.2, darkenColor(baseColor, 5));
            gradient.addColorStop(0.4, baseColor);
            gradient.addColorStop(0.6, darkenColor(baseColor, 8));
            gradient.addColorStop(0.8, baseColor);
            gradient.addColorStop(1, darkenColor(baseColor, 5));
            break;

        case 'glass':
            gradient = ctx.createLinearGradient(x, y, x + w, y + h);
            gradient.addColorStop(0, lightenColor(baseColor, 40));
            gradient.addColorStop(0.3, baseColor);
            gradient.addColorStop(0.5, lightenColor(baseColor, 30));
            gradient.addColorStop(1, baseColor);
            break;

        default:
            gradient = ctx.createLinearGradient(x, y, x, y + h);
            gradient.addColorStop(0, lightenColor(baseColor, 10));
            gradient.addColorStop(1, darkenColor(baseColor, 10));
    }

    return gradient;
}

function drawRoundedRect(ctx, x, y, w, h, r) {
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
}

function addProductShadow(ctx, w, h) {
    // Floor shadow
    ctx.globalAlpha = 0.3;
    const shadowGradient = ctx.createRadialGradient(w / 2, h - 50, 0, w / 2, h - 50, 150);
    shadowGradient.addColorStop(0, 'rgba(0,0,0,0.5)');
    shadowGradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = shadowGradient;
    ctx.beginPath();
    ctx.ellipse(w / 2, h - 50, 150, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
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
        { progress: 25, text: currentLang === 'zh-TW' ? '分析產品類型...' : 'Analyzing product type...' },
        { progress: 50, text: currentLang === 'zh-TW' ? '應用材質...' : 'Applying materials...' },
        { progress: 75, text: currentLang === 'zh-TW' ? '渲染 3D 效果...' : 'Rendering 3D effect...' },
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
            <span class="stat-label">${t('statCategory')}:</span>
            <span class="stat-value">${stats.category}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">${t('statMaterial')}:</span>
            <span class="stat-value">${stats.material}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">${t('statFinish')}:</span>
            <span class="stat-value">${stats.finish}</span>
        </div>
    `;
    document.getElementById('outputStats').innerHTML = statsHtml;
}

function downloadPng() {
    const canvas = document.getElementById('mainCanvas');
    const link = document.createElement('a');
    link.download = 'product-design.png';
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
    const complexity = document.getElementById('complexity');
    const complexityValue = document.getElementById('complexityValue');
    complexity.addEventListener('input', () => {
        complexityValue.textContent = complexity.value;
    });

    // Generate button
    document.getElementById('generateBtn').addEventListener('click', async () => {
        const btn = document.getElementById('generateBtn');
        btn.disabled = true;
        btn.querySelector('span').textContent = t('generating');

        await showProgress();

        const category = document.getElementById('category').value;
        const material = document.getElementById('material').value;
        const finish = document.getElementById('finish').value;
        const complexityVal = parseInt(document.getElementById('complexity').value);
        const colors = [
            document.getElementById('colorPrimary').value,
            document.getElementById('colorSecondary').value,
            document.getElementById('colorAccent').value
        ];

        const stats = generateProductDesign(category, material, finish, complexityVal, colors);

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
    console.log('Product Design Generator initialized - Tool #519');
}

init();
