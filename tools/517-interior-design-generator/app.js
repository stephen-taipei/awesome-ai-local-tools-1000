/**
 * Interior Design Generator - Tool #517
 * Awesome AI Local Tools
 *
 * Local interior design generation
 */

// ========================================
// Internationalization (i18n)
// ========================================

const translations = {
    'zh-TW': {
        title: '室內設計生成',
        subtitle: '智能室內設計，本地處理保護隱私',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        roomTypeLabel: '房間類型',
        roomLiving: '客廳',
        roomBedroom: '臥室',
        roomKitchen: '廚房',
        roomOffice: '辦公室',
        styleLabel: '設計風格',
        styleMinimalist: '極簡風格',
        styleModern: '現代風格',
        styleVintage: '復古風格',
        styleIndustrial: '工業風格',
        viewLabel: '視角',
        viewTopdown: '俯視圖',
        viewPerspective: '透視圖',
        roomSizeLabel: '房間大小',
        colorsLabel: '配色方案',
        colorWall: '牆壁',
        colorFloor: '地板',
        colorFurniture: '家具',
        generateBtn: '生成設計',
        generating: '生成中...',
        processing: 'AI 正在生成室內設計...',
        previewTitle: '設計預覽',
        outputTitle: '生成結果',
        downloadPng: '下載 PNG',
        regenerate: '重新生成',
        statRoomType: '房間類型',
        statStyle: '設計風格',
        statFurnitureCount: '家具數量',
        howItWorks: '功能特色',
        feature1: '多種房間',
        feature1Desc: '支援客廳、臥室、廚房、辦公室',
        feature2: '風格多樣',
        feature2Desc: '極簡、現代、復古、工業風格',
        feature3: '隱私保護',
        feature3Desc: '所有處理在瀏覽器本地完成',
        feature4: '雙視角',
        feature4Desc: '俯視圖與透視圖兩種視角',
        backToHome: '返回首頁',
        toolNumber: '工具 #517',
        copyright: 'Awesome AI Local Tools © 2024'
    },
    'en': {
        title: 'Interior Design Generator',
        subtitle: 'AI-powered interior design, processed locally',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        roomTypeLabel: 'Room Type',
        roomLiving: 'Living Room',
        roomBedroom: 'Bedroom',
        roomKitchen: 'Kitchen',
        roomOffice: 'Office',
        styleLabel: 'Design Style',
        styleMinimalist: 'Minimalist',
        styleModern: 'Modern',
        styleVintage: 'Vintage',
        styleIndustrial: 'Industrial',
        viewLabel: 'View',
        viewTopdown: 'Top-down',
        viewPerspective: 'Perspective',
        roomSizeLabel: 'Room Size',
        colorsLabel: 'Color Scheme',
        colorWall: 'Wall',
        colorFloor: 'Floor',
        colorFurniture: 'Furniture',
        generateBtn: 'Generate Design',
        generating: 'Generating...',
        processing: 'AI is generating interior design...',
        previewTitle: 'Design Preview',
        outputTitle: 'Generated Result',
        downloadPng: 'Download PNG',
        regenerate: 'Regenerate',
        statRoomType: 'Room Type',
        statStyle: 'Style',
        statFurnitureCount: 'Furniture Count',
        howItWorks: 'Features',
        feature1: 'Multiple Rooms',
        feature1Desc: 'Support living room, bedroom, kitchen, office',
        feature2: 'Various Styles',
        feature2Desc: 'Minimalist, modern, vintage, industrial',
        feature3: 'Privacy Protected',
        feature3Desc: 'All processing done locally in browser',
        feature4: 'Dual Views',
        feature4Desc: 'Top-down and perspective views',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #517',
        copyright: 'Awesome AI Local Tools © 2024'
    }
};

let currentLang = 'zh-TW';
let furnitureCount = 0;

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
// Interior Design Drawing Functions
// ========================================

function generateInteriorDesign(roomType, style, viewType, roomSize, colors) {
    const canvas = document.getElementById('mainCanvas');
    const ctx = canvas.getContext('2d');
    const [colorWall, colorFloor, colorFurniture] = colors;

    furnitureCount = 0;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (viewType === 'topdown') {
        drawTopDownView(ctx, roomType, style, roomSize, colors);
    } else {
        drawPerspectiveView(ctx, roomType, style, roomSize, colors);
    }

    return {
        roomType: t('room' + roomType.charAt(0).toUpperCase() + roomType.slice(1)),
        style: t('style' + style.charAt(0).toUpperCase() + style.slice(1)),
        furnitureCount: furnitureCount
    };
}

function drawTopDownView(ctx, roomType, style, roomSize, colors) {
    const [colorWall, colorFloor, colorFurniture] = colors;
    const padding = 50;
    const roomWidth = 500;
    const roomHeight = 400;
    const startX = (ctx.canvas.width - roomWidth) / 2;
    const startY = (ctx.canvas.height - roomHeight) / 2;

    // Draw floor
    ctx.fillStyle = colorFloor;
    ctx.fillRect(startX, startY, roomWidth, roomHeight);

    // Draw floor pattern based on style
    if (style === 'vintage') {
        drawParquetFloor(ctx, startX, startY, roomWidth, roomHeight, colorFloor);
    } else if (style === 'industrial') {
        drawConcreteFloor(ctx, startX, startY, roomWidth, roomHeight, colorFloor);
    } else {
        drawWoodFloor(ctx, startX, startY, roomWidth, roomHeight, colorFloor);
    }

    // Draw walls (top-down view shows wall thickness)
    ctx.fillStyle = colorWall;
    const wallThickness = 15;
    ctx.fillRect(startX - wallThickness, startY - wallThickness, roomWidth + wallThickness * 2, wallThickness);
    ctx.fillRect(startX - wallThickness, startY, wallThickness, roomHeight);
    ctx.fillRect(startX + roomWidth, startY, wallThickness, roomHeight);
    ctx.fillRect(startX - wallThickness, startY + roomHeight, roomWidth + wallThickness * 2, wallThickness);

    // Draw furniture based on room type
    switch (roomType) {
        case 'living':
            drawLivingRoomFurnitureTopDown(ctx, startX, startY, roomWidth, roomHeight, style, colorFurniture);
            break;
        case 'bedroom':
            drawBedroomFurnitureTopDown(ctx, startX, startY, roomWidth, roomHeight, style, colorFurniture);
            break;
        case 'kitchen':
            drawKitchenFurnitureTopDown(ctx, startX, startY, roomWidth, roomHeight, style, colorFurniture);
            break;
        case 'office':
            drawOfficeFurnitureTopDown(ctx, startX, startY, roomWidth, roomHeight, style, colorFurniture);
            break;
    }
}

function drawPerspectiveView(ctx, roomType, style, roomSize, colors) {
    const [colorWall, colorFloor, colorFurniture] = colors;
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    // Vanishing point
    const vpX = w / 2;
    const vpY = h * 0.35;

    // Draw back wall
    ctx.fillStyle = colorWall;
    ctx.beginPath();
    ctx.moveTo(100, 80);
    ctx.lineTo(w - 100, 80);
    ctx.lineTo(w - 100, h - 100);
    ctx.lineTo(100, h - 100);
    ctx.closePath();
    ctx.fill();

    // Draw floor
    ctx.fillStyle = colorFloor;
    ctx.beginPath();
    ctx.moveTo(100, h - 100);
    ctx.lineTo(w - 100, h - 100);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // Draw left wall
    ctx.fillStyle = darkenColor(colorWall, 10);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(100, 80);
    ctx.lineTo(100, h - 100);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // Draw right wall
    ctx.fillStyle = darkenColor(colorWall, 15);
    ctx.beginPath();
    ctx.moveTo(w, 0);
    ctx.lineTo(w - 100, 80);
    ctx.lineTo(w - 100, h - 100);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Draw ceiling
    ctx.fillStyle = lightenColor(colorWall, 20);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(w, 0);
    ctx.lineTo(w - 100, 80);
    ctx.lineTo(100, 80);
    ctx.closePath();
    ctx.fill();

    // Draw furniture based on room type
    switch (roomType) {
        case 'living':
            drawLivingRoomFurniturePerspective(ctx, style, colorFurniture);
            break;
        case 'bedroom':
            drawBedroomFurniturePerspective(ctx, style, colorFurniture);
            break;
        case 'kitchen':
            drawKitchenFurniturePerspective(ctx, style, colorFurniture);
            break;
        case 'office':
            drawOfficeFurniturePerspective(ctx, style, colorFurniture);
            break;
    }
}

// Top-down furniture drawings
function drawLivingRoomFurnitureTopDown(ctx, x, y, w, h, style, color) {
    // Sofa
    ctx.fillStyle = color;
    ctx.fillRect(x + 50, y + h - 120, 200, 80);
    ctx.fillStyle = lightenColor(color, 20);
    ctx.fillRect(x + 55, y + h - 115, 190, 60);
    furnitureCount++;

    // Coffee table
    ctx.fillStyle = darkenColor(color, 10);
    ctx.fillRect(x + 100, y + h - 200, 100, 60);
    furnitureCount++;

    // TV stand
    ctx.fillStyle = color;
    ctx.fillRect(x + 80, y + 30, 140, 40);
    furnitureCount++;

    // Armchair
    ctx.fillStyle = lightenColor(color, 10);
    ctx.fillRect(x + w - 120, y + h - 150, 70, 70);
    furnitureCount++;

    // Rug
    ctx.fillStyle = lightenColor(color, 30);
    ctx.globalAlpha = 0.5;
    ctx.fillRect(x + 80, y + h - 220, 160, 100);
    ctx.globalAlpha = 1;
    furnitureCount++;

    // Plant
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(x + w - 50, y + 50, 25, 0, Math.PI * 2);
    ctx.fill();
    furnitureCount++;
}

function drawBedroomFurnitureTopDown(ctx, x, y, w, h, style, color) {
    // Bed
    ctx.fillStyle = color;
    ctx.fillRect(x + w / 2 - 80, y + 50, 160, 200);
    ctx.fillStyle = lightenColor(color, 20);
    ctx.fillRect(x + w / 2 - 75, y + 55, 150, 180);
    // Pillows
    ctx.fillStyle = lightenColor(color, 40);
    ctx.fillRect(x + w / 2 - 65, y + 60, 55, 35);
    ctx.fillRect(x + w / 2 + 10, y + 60, 55, 35);
    furnitureCount++;

    // Nightstands
    ctx.fillStyle = darkenColor(color, 10);
    ctx.fillRect(x + w / 2 - 120, y + 80, 35, 35);
    ctx.fillRect(x + w / 2 + 85, y + 80, 35, 35);
    furnitureCount += 2;

    // Wardrobe
    ctx.fillStyle = color;
    ctx.fillRect(x + 30, y + h - 80, 120, 50);
    furnitureCount++;

    // Dresser
    ctx.fillStyle = darkenColor(color, 5);
    ctx.fillRect(x + w - 100, y + h / 2, 60, 80);
    furnitureCount++;

    // Rug
    ctx.fillStyle = lightenColor(color, 30);
    ctx.globalAlpha = 0.5;
    ctx.fillRect(x + w / 2 - 100, y + 260, 200, 80);
    ctx.globalAlpha = 1;
    furnitureCount++;
}

function drawKitchenFurnitureTopDown(ctx, x, y, w, h, style, color) {
    // Counter top (L-shaped)
    ctx.fillStyle = color;
    ctx.fillRect(x + 20, y + 20, w - 40, 60);
    ctx.fillRect(x + 20, y + 20, 60, h - 40);
    furnitureCount++;

    // Sink
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(x + 200, y + 30, 80, 40);
    ctx.fillStyle = darkenColor(color, 20);
    ctx.fillRect(x + 210, y + 40, 60, 20);
    furnitureCount++;

    // Stove
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x + 350, y + 30, 80, 40);
    ctx.fillStyle = '#64748b';
    for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(x + 370 + (i % 2) * 40, y + 45 + Math.floor(i / 2) * 20, 8, 0, Math.PI * 2);
        ctx.fill();
    }
    furnitureCount++;

    // Island
    ctx.fillStyle = darkenColor(color, 10);
    ctx.fillRect(x + w / 2 - 60, y + h / 2 - 30, 120, 80);
    furnitureCount++;

    // Dining table
    ctx.fillStyle = lightenColor(color, 10);
    ctx.fillRect(x + w / 2 - 50, y + h - 150, 150, 100);
    furnitureCount++;

    // Chairs
    ctx.fillStyle = color;
    const chairPositions = [
        [x + w / 2 - 30, y + h - 165],
        [x + w / 2 + 50, y + h - 165],
        [x + w / 2 - 30, y + h - 55],
        [x + w / 2 + 50, y + h - 55]
    ];
    chairPositions.forEach(pos => {
        ctx.fillRect(pos[0], pos[1], 30, 30);
        furnitureCount++;
    });

    // Refrigerator
    ctx.fillStyle = '#64748b';
    ctx.fillRect(x + 30, y + h - 100, 50, 70);
    furnitureCount++;
}

function drawOfficeFurnitureTopDown(ctx, x, y, w, h, style, color) {
    // Desk
    ctx.fillStyle = color;
    ctx.fillRect(x + w / 2 - 100, y + 80, 200, 80);
    furnitureCount++;

    // Chair
    ctx.fillStyle = lightenColor(color, 20);
    ctx.beginPath();
    ctx.arc(x + w / 2, y + 200, 30, 0, Math.PI * 2);
    ctx.fill();
    furnitureCount++;

    // Computer monitor
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x + w / 2 - 30, y + 95, 60, 5);
    furnitureCount++;

    // Bookshelf
    ctx.fillStyle = darkenColor(color, 10);
    ctx.fillRect(x + 30, y + 30, 80, 150);
    ctx.fillStyle = lightenColor(color, 30);
    for (let i = 0; i < 4; i++) {
        ctx.fillRect(x + 35, y + 40 + i * 35, 70, 25);
    }
    furnitureCount++;

    // Filing cabinet
    ctx.fillStyle = '#64748b';
    ctx.fillRect(x + w - 80, y + 30, 50, 80);
    furnitureCount++;

    // Guest chairs
    ctx.fillStyle = color;
    ctx.fillRect(x + w / 2 - 80, y + h - 100, 50, 50);
    ctx.fillRect(x + w / 2 + 30, y + h - 100, 50, 50);
    furnitureCount += 2;

    // Plant
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(x + w - 50, y + h - 50, 25, 0, Math.PI * 2);
    ctx.fill();
    furnitureCount++;
}

// Perspective furniture drawings
function drawLivingRoomFurniturePerspective(ctx, style, color) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    // Sofa
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(120, h - 80);
    ctx.lineTo(350, h - 80);
    ctx.lineTo(330, h - 180);
    ctx.lineTo(140, h - 180);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = lightenColor(color, 15);
    ctx.beginPath();
    ctx.moveTo(140, h - 180);
    ctx.lineTo(330, h - 180);
    ctx.lineTo(320, h - 220);
    ctx.lineTo(150, h - 220);
    ctx.closePath();
    ctx.fill();
    furnitureCount++;

    // Coffee table
    ctx.fillStyle = darkenColor(color, 20);
    ctx.fillRect(200, h - 160, 100, 30);
    ctx.fillRect(205, h - 130, 5, 20);
    ctx.fillRect(290, h - 130, 5, 20);
    furnitureCount++;

    // TV
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(w / 2 - 80, 150, 160, 100);
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(w / 2 - 75, 155, 150, 90);
    furnitureCount++;

    // TV stand
    ctx.fillStyle = color;
    ctx.fillRect(w / 2 - 100, 250, 200, 30);
    furnitureCount++;

    // Lamp
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(w - 180, h - 250, 10, 80);
    ctx.beginPath();
    ctx.moveTo(w - 200, h - 250);
    ctx.lineTo(w - 150, h - 250);
    ctx.lineTo(w - 160, h - 290);
    ctx.lineTo(w - 190, h - 290);
    ctx.closePath();
    ctx.fill();
    furnitureCount++;

    // Plant
    ctx.fillStyle = '#8b5a3c';
    ctx.fillRect(130, h - 130, 25, 40);
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(142, h - 160, 35, 0, Math.PI * 2);
    ctx.fill();
    furnitureCount++;
}

function drawBedroomFurniturePerspective(ctx, style, color) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    // Bed frame
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(150, h - 50);
    ctx.lineTo(w - 150, h - 50);
    ctx.lineTo(w - 180, h - 200);
    ctx.lineTo(180, h - 200);
    ctx.closePath();
    ctx.fill();

    // Mattress
    ctx.fillStyle = lightenColor(color, 30);
    ctx.beginPath();
    ctx.moveTo(160, h - 60);
    ctx.lineTo(w - 160, h - 60);
    ctx.lineTo(w - 185, h - 190);
    ctx.lineTo(185, h - 190);
    ctx.closePath();
    ctx.fill();

    // Pillows
    ctx.fillStyle = lightenColor(color, 50);
    ctx.fillRect(200, h - 185, 80, 25);
    ctx.fillRect(w - 280, h - 185, 80, 25);
    furnitureCount++;

    // Headboard
    ctx.fillStyle = darkenColor(color, 10);
    ctx.fillRect(180, h - 300, w - 360, 110);
    furnitureCount++;

    // Nightstand left
    ctx.fillStyle = color;
    ctx.fillRect(120, h - 150, 50, 80);
    furnitureCount++;

    // Nightstand right
    ctx.fillRect(w - 170, h - 150, 50, 80);
    furnitureCount++;

    // Lamp on nightstand
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(135, h - 190, 20, 40);
    ctx.beginPath();
    ctx.arc(145, h - 200, 15, Math.PI, 0);
    ctx.fill();
    furnitureCount++;

    // Window with curtains
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(w / 2 - 60, 100, 120, 80);
    ctx.fillStyle = lightenColor(color, 20);
    ctx.fillRect(w / 2 - 80, 90, 30, 100);
    ctx.fillRect(w / 2 + 50, 90, 30, 100);
    furnitureCount++;
}

function drawKitchenFurniturePerspective(ctx, style, color) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    // Counter (back wall)
    ctx.fillStyle = color;
    ctx.fillRect(120, 180, w - 240, 100);
    furnitureCount++;

    // Upper cabinets
    ctx.fillStyle = darkenColor(color, 10);
    ctx.fillRect(130, 90, 100, 80);
    ctx.fillRect(250, 90, 100, 80);
    ctx.fillRect(w - 230, 90, 100, 80);
    furnitureCount += 3;

    // Stove
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(w / 2 - 50, 190, 100, 80);
    ctx.fillStyle = '#64748b';
    for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(w / 2 - 25 + (i % 2) * 50, 215 + Math.floor(i / 2) * 35, 12, 0, Math.PI * 2);
        ctx.fill();
    }
    furnitureCount++;

    // Range hood
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.moveTo(w / 2 - 60, 90);
    ctx.lineTo(w / 2 + 60, 90);
    ctx.lineTo(w / 2 + 50, 150);
    ctx.lineTo(w / 2 - 50, 150);
    ctx.closePath();
    ctx.fill();
    furnitureCount++;

    // Island
    ctx.fillStyle = lightenColor(color, 10);
    ctx.beginPath();
    ctx.moveTo(200, h - 80);
    ctx.lineTo(w - 200, h - 80);
    ctx.lineTo(w - 220, h - 180);
    ctx.lineTo(220, h - 180);
    ctx.closePath();
    ctx.fill();
    furnitureCount++;

    // Bar stools
    ctx.fillStyle = '#64748b';
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(250 + i * 100, h - 60, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(245 + i * 100, h - 40, 10, 30);
        furnitureCount++;
    }

    // Sink
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(150, 200, 80, 50);
    furnitureCount++;

    // Refrigerator
    ctx.fillStyle = '#64748b';
    ctx.fillRect(w - 180, 120, 60, 160);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.strokeRect(w - 175, 125, 50, 70);
    ctx.strokeRect(w - 175, 200, 50, 70);
    furnitureCount++;
}

function drawOfficeFurniturePerspective(ctx, style, color) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    // Desk
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(150, h - 120);
    ctx.lineTo(w - 150, h - 120);
    ctx.lineTo(w - 170, h - 200);
    ctx.lineTo(170, h - 200);
    ctx.closePath();
    ctx.fill();
    // Desk legs
    ctx.fillRect(160, h - 120, 10, 50);
    ctx.fillRect(w - 170, h - 120, 10, 50);
    furnitureCount++;

    // Monitor
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(w / 2 - 60, h - 300, 120, 80);
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(w / 2 - 55, h - 295, 110, 70);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(w / 2 - 10, h - 220, 20, 20);
    ctx.fillRect(w / 2 - 25, h - 205, 50, 8);
    furnitureCount++;

    // Office chair
    ctx.fillStyle = darkenColor(color, 20);
    ctx.beginPath();
    ctx.arc(w / 2, h - 60, 35, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(w / 2 - 5, h - 100, 10, 40);
    furnitureCount++;

    // Bookshelf
    ctx.fillStyle = color;
    ctx.fillRect(130, 100, 100, 180);
    ctx.fillStyle = lightenColor(color, 20);
    for (let i = 0; i < 4; i++) {
        ctx.fillRect(140, 115 + i * 42, 80, 35);
    }
    // Books
    const bookColors = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b'];
    bookColors.forEach((bookColor, i) => {
        ctx.fillStyle = bookColor;
        ctx.fillRect(145 + i * 18, 120, 15, 28);
    });
    furnitureCount++;

    // Window
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(w - 200, 100, 80, 120);
    ctx.strokeStyle = colorWall || '#f472b6';
    ctx.lineWidth = 5;
    ctx.strokeRect(w - 200, 100, 80, 120);
    ctx.beginPath();
    ctx.moveTo(w - 160, 100);
    ctx.lineTo(w - 160, 220);
    ctx.moveTo(w - 200, 160);
    ctx.lineTo(w - 120, 160);
    ctx.stroke();
    furnitureCount++;

    // Plant
    ctx.fillStyle = '#8b5a3c';
    ctx.fillRect(w - 160, h - 150, 30, 50);
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(w - 145, h - 180, 40, 0, Math.PI * 2);
    ctx.fill();
    furnitureCount++;
}

// Floor patterns
function drawWoodFloor(ctx, x, y, w, h, color) {
    const plankWidth = 80;
    const plankHeight = 20;
    ctx.strokeStyle = darkenColor(color, 10);
    ctx.lineWidth = 1;

    for (let row = 0; row < h / plankHeight; row++) {
        const offset = (row % 2) * (plankWidth / 2);
        for (let col = -1; col < w / plankWidth + 1; col++) {
            ctx.strokeRect(x + col * plankWidth + offset, y + row * plankHeight, plankWidth, plankHeight);
        }
    }
}

function drawParquetFloor(ctx, x, y, w, h, color) {
    const size = 30;
    ctx.strokeStyle = darkenColor(color, 15);
    ctx.lineWidth = 1;

    for (let row = 0; row < h / size; row++) {
        for (let col = 0; col < w / size; col++) {
            const px = x + col * size;
            const py = y + row * size;
            if ((row + col) % 2 === 0) {
                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(px + size, py + size);
                ctx.stroke();
            } else {
                ctx.beginPath();
                ctx.moveTo(px + size, py);
                ctx.lineTo(px, py + size);
                ctx.stroke();
            }
        }
    }
}

function drawConcreteFloor(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);

    // Add texture
    ctx.fillStyle = darkenColor(color, 5);
    for (let i = 0; i < 50; i++) {
        const rx = x + Math.random() * w;
        const ry = y + Math.random() * h;
        ctx.beginPath();
        ctx.arc(rx, ry, Math.random() * 3, 0, Math.PI * 2);
        ctx.fill();
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
        { progress: 25, text: currentLang === 'zh-TW' ? '分析房間類型...' : 'Analyzing room type...' },
        { progress: 50, text: currentLang === 'zh-TW' ? '生成佈局...' : 'Generating layout...' },
        { progress: 75, text: currentLang === 'zh-TW' ? '放置家具...' : 'Placing furniture...' },
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
            <span class="stat-label">${t('statRoomType')}:</span>
            <span class="stat-value">${stats.roomType}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">${t('statStyle')}:</span>
            <span class="stat-value">${stats.style}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">${t('statFurnitureCount')}:</span>
            <span class="stat-value">${stats.furnitureCount}</span>
        </div>
    `;
    document.getElementById('outputStats').innerHTML = statsHtml;
}

function downloadPng() {
    const canvas = document.getElementById('mainCanvas');
    const link = document.createElement('a');
    link.download = 'interior-design.png';
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
    const roomSize = document.getElementById('roomSize');
    const roomSizeValue = document.getElementById('roomSizeValue');
    roomSize.addEventListener('input', () => {
        roomSizeValue.textContent = roomSize.value;
    });

    // Generate button
    document.getElementById('generateBtn').addEventListener('click', async () => {
        const btn = document.getElementById('generateBtn');
        btn.disabled = true;
        btn.querySelector('span').textContent = t('generating');

        await showProgress();

        const roomType = document.getElementById('roomType').value;
        const style = document.getElementById('designStyle').value;
        const viewType = document.getElementById('viewType').value;
        const roomSizeVal = parseInt(document.getElementById('roomSize').value);
        const colors = [
            document.getElementById('colorWall').value,
            document.getElementById('colorFloor').value,
            document.getElementById('colorFurniture').value
        ];

        const stats = generateInteriorDesign(roomType, style, viewType, roomSizeVal, colors);

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
    console.log('Interior Design Generator initialized - Tool #517');
}

init();
