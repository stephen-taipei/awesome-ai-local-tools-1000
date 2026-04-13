/**
 * Icon Generator - Tool #507
 * Awesome AI Local Tools
 *
 * Local icon generation with multiple styles and sizes
 */

// ========================================
// Internationalization (i18n)
// ========================================

const translations = {
    'zh-TW': {
        title: 'Icon 生成器',
        subtitle: '智能圖示設計，本地處理保護隱私',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        categoryLabel: '圖示類別',
        categoryUI: '介面元素',
        categorySocial: '社交媒體',
        categoryFile: '檔案類型',
        categoryArrow: '箭頭方向',
        categoryDevice: '設備裝置',
        categoryWeather: '天氣圖示',
        categoryAction: '操作動作',
        categoryEmoji: '表情符號',
        styleLabel: '圖示風格',
        styleFlat: '扁平化',
        styleOutlined: '線條',
        styleFilled: '填充',
        styleDuotone: '雙色調',
        iconTypeLabel: '具體圖示',
        colorLabel: '圖示顏色',
        sizeLabel: '輸出尺寸',
        generateBtn: '生成圖示',
        generating: '生成中...',
        processing: 'AI 正在繪製中...',
        previewTitle: '圖示預覽',
        outputTitle: '生成結果',
        downloadAll: '下載全部尺寸',
        styleName: '風格',
        sizesGenerated: '已生成尺寸',
        clickToDownload: '點擊下載',
        howItWorks: '功能特色',
        feature1: '多種風格',
        feature1Desc: '支援扁平化、線條、填充、雙色調風格',
        feature2: '多尺寸輸出',
        feature2Desc: '一次生成多種尺寸，適配各種場景',
        feature3: '隱私保護',
        feature3Desc: '所有處理在瀏覽器本地完成',
        feature4: '批量下載',
        feature4Desc: '支援一鍵下載所有尺寸圖示',
        backToHome: '返回首頁',
        toolNumber: '工具 #507',
        copyright: 'Awesome AI Local Tools © 2024'
    },
    'en': {
        title: 'Icon Generator',
        subtitle: 'AI-powered icon design, processed locally',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        categoryLabel: 'Icon Category',
        categoryUI: 'UI Elements',
        categorySocial: 'Social Media',
        categoryFile: 'File Types',
        categoryArrow: 'Arrows',
        categoryDevice: 'Devices',
        categoryWeather: 'Weather',
        categoryAction: 'Actions',
        categoryEmoji: 'Emoji',
        styleLabel: 'Icon Style',
        styleFlat: 'Flat',
        styleOutlined: 'Outlined',
        styleFilled: 'Filled',
        styleDuotone: 'Duotone',
        iconTypeLabel: 'Specific Icon',
        colorLabel: 'Icon Color',
        sizeLabel: 'Output Sizes',
        generateBtn: 'Generate Icon',
        generating: 'Generating...',
        processing: 'AI is drawing...',
        previewTitle: 'Icon Preview',
        outputTitle: 'Generated Result',
        downloadAll: 'Download All Sizes',
        styleName: 'Style',
        sizesGenerated: 'Sizes Generated',
        clickToDownload: 'Click to download',
        howItWorks: 'Features',
        feature1: 'Multiple Styles',
        feature1Desc: 'Support flat, outlined, filled, duotone styles',
        feature2: 'Multi-size Output',
        feature2Desc: 'Generate multiple sizes at once for various uses',
        feature3: 'Privacy Protected',
        feature3Desc: 'All processing done locally in browser',
        feature4: 'Batch Download',
        feature4Desc: 'Download all sizes with one click',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #507',
        copyright: 'Awesome AI Local Tools © 2024'
    }
};

let currentLang = 'zh-TW';
let generatedCanvases = {};

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

    updateIconOptions();
}

function t(key) {
    return translations[currentLang][key] || key;
}

// ========================================
// Icon Data
// ========================================

const iconCategories = {
    ui: {
        'zh-TW': ['選單', '搜尋', '設定', '首頁', '用戶', '通知', '購物車', '心形'],
        'en': ['Menu', 'Search', 'Settings', 'Home', 'User', 'Notification', 'Cart', 'Heart']
    },
    social: {
        'zh-TW': ['分享', '讚', '評論', '訊息', '關注', '書籤', '鏈接', '郵件'],
        'en': ['Share', 'Like', 'Comment', 'Message', 'Follow', 'Bookmark', 'Link', 'Email']
    },
    file: {
        'zh-TW': ['文件', '資料夾', '圖片', '音樂', '影片', '壓縮檔', '代碼', '表格'],
        'en': ['Document', 'Folder', 'Image', 'Music', 'Video', 'Archive', 'Code', 'Table']
    },
    arrow: {
        'zh-TW': ['上', '下', '左', '右', '展開', '收起', '刷新', '返回'],
        'en': ['Up', 'Down', 'Left', 'Right', 'Expand', 'Collapse', 'Refresh', 'Back']
    },
    device: {
        'zh-TW': ['手機', '電腦', '平板', '手錶', '電視', '相機', '耳機', '印表機'],
        'en': ['Phone', 'Computer', 'Tablet', 'Watch', 'TV', 'Camera', 'Headphone', 'Printer']
    },
    weather: {
        'zh-TW': ['晴天', '多雲', '雨天', '雪天', '雷電', '風', '霧', '月亮'],
        'en': ['Sunny', 'Cloudy', 'Rainy', 'Snowy', 'Thunder', 'Wind', 'Fog', 'Moon']
    },
    action: {
        'zh-TW': ['播放', '暫停', '停止', '錄音', '編輯', '刪除', '新增', '下載'],
        'en': ['Play', 'Pause', 'Stop', 'Record', 'Edit', 'Delete', 'Add', 'Download']
    },
    emoji: {
        'zh-TW': ['開心', '難過', '生氣', '驚訝', '愛心', '眨眼', '思考', '酷'],
        'en': ['Happy', 'Sad', 'Angry', 'Surprised', 'Love', 'Wink', 'Think', 'Cool']
    }
};

function updateIconOptions() {
    const category = document.getElementById('categorySelect').value;
    const iconTypeSelect = document.getElementById('iconTypeSelect');
    const icons = iconCategories[category][currentLang];

    iconTypeSelect.innerHTML = icons.map((icon, i) =>
        `<option value="${i}">${icon}</option>`
    ).join('');
}

// ========================================
// Icon Drawing Functions
// ========================================

function drawIcon(ctx, iconIndex, category, style, color, size) {
    const center = size / 2;
    const padding = size * 0.15;
    const iconSize = size - padding * 2;

    ctx.clearRect(0, 0, size, size);

    // Set styles based on mode
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = Math.max(1, size / 16);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const drawFilled = style === 'filled' || style === 'flat';
    const drawOutline = style === 'outlined' || style === 'duotone';

    if (style === 'duotone') {
        ctx.globalAlpha = 0.3;
        drawIconShape(ctx, iconIndex, category, center, iconSize, true);
        ctx.globalAlpha = 1;
        drawIconShape(ctx, iconIndex, category, center, iconSize, false);
    } else if (drawFilled) {
        drawIconShape(ctx, iconIndex, category, center, iconSize, true);
    } else {
        drawIconShape(ctx, iconIndex, category, center, iconSize, false);
    }
}

function drawIconShape(ctx, iconIndex, category, center, iconSize, filled) {
    const r = iconSize / 2;

    ctx.beginPath();

    switch (category) {
        case 'ui':
            drawUIIcon(ctx, iconIndex, center, r, filled);
            break;
        case 'social':
            drawSocialIcon(ctx, iconIndex, center, r, filled);
            break;
        case 'file':
            drawFileIcon(ctx, iconIndex, center, r, filled);
            break;
        case 'arrow':
            drawArrowIcon(ctx, iconIndex, center, r, filled);
            break;
        case 'device':
            drawDeviceIcon(ctx, iconIndex, center, r, filled);
            break;
        case 'weather':
            drawWeatherIcon(ctx, iconIndex, center, r, filled);
            break;
        case 'action':
            drawActionIcon(ctx, iconIndex, center, r, filled);
            break;
        case 'emoji':
            drawEmojiIcon(ctx, iconIndex, center, r, filled);
            break;
    }
}

function drawUIIcon(ctx, index, c, r, filled) {
    switch (index) {
        case 0: // Menu
            for (let i = -1; i <= 1; i++) {
                ctx.beginPath();
                ctx.moveTo(c - r * 0.6, c + i * r * 0.4);
                ctx.lineTo(c + r * 0.6, c + i * r * 0.4);
                ctx.stroke();
            }
            break;
        case 1: // Search
            ctx.beginPath();
            ctx.arc(c - r * 0.1, c - r * 0.1, r * 0.5, 0, Math.PI * 2);
            filled ? ctx.fill() : ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(c + r * 0.25, c + r * 0.25);
            ctx.lineTo(c + r * 0.6, c + r * 0.6);
            ctx.stroke();
            break;
        case 2: // Settings
            ctx.beginPath();
            ctx.arc(c, c, r * 0.3, 0, Math.PI * 2);
            filled ? ctx.fill() : ctx.stroke();
            for (let i = 0; i < 8; i++) {
                const angle = (Math.PI / 4) * i;
                ctx.beginPath();
                ctx.moveTo(c + r * 0.4 * Math.cos(angle), c + r * 0.4 * Math.sin(angle));
                ctx.lineTo(c + r * 0.7 * Math.cos(angle), c + r * 0.7 * Math.sin(angle));
                ctx.stroke();
            }
            break;
        case 3: // Home
            ctx.beginPath();
            ctx.moveTo(c, c - r * 0.7);
            ctx.lineTo(c + r * 0.7, c);
            ctx.lineTo(c + r * 0.5, c);
            ctx.lineTo(c + r * 0.5, c + r * 0.6);
            ctx.lineTo(c - r * 0.5, c + r * 0.6);
            ctx.lineTo(c - r * 0.5, c);
            ctx.lineTo(c - r * 0.7, c);
            ctx.closePath();
            filled ? ctx.fill() : ctx.stroke();
            break;
        case 4: // User
            ctx.beginPath();
            ctx.arc(c, c - r * 0.25, r * 0.35, 0, Math.PI * 2);
            filled ? ctx.fill() : ctx.stroke();
            ctx.beginPath();
            ctx.arc(c, c + r * 0.9, r * 0.55, Math.PI * 1.2, Math.PI * 1.8);
            filled ? ctx.fill() : ctx.stroke();
            break;
        case 5: // Notification
            ctx.beginPath();
            ctx.moveTo(c - r * 0.5, c + r * 0.3);
            ctx.quadraticCurveTo(c - r * 0.5, c - r * 0.6, c, c - r * 0.6);
            ctx.quadraticCurveTo(c + r * 0.5, c - r * 0.6, c + r * 0.5, c + r * 0.3);
            ctx.lineTo(c - r * 0.5, c + r * 0.3);
            filled ? ctx.fill() : ctx.stroke();
            ctx.beginPath();
            ctx.arc(c, c + r * 0.55, r * 0.15, 0, Math.PI * 2);
            filled ? ctx.fill() : ctx.stroke();
            break;
        case 6: // Cart
            ctx.beginPath();
            ctx.moveTo(c - r * 0.7, c - r * 0.5);
            ctx.lineTo(c - r * 0.4, c - r * 0.5);
            ctx.lineTo(c - r * 0.2, c + r * 0.3);
            ctx.lineTo(c + r * 0.5, c + r * 0.3);
            ctx.lineTo(c + r * 0.7, c - r * 0.2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(c - r * 0.1, c + r * 0.55, r * 0.12, 0, Math.PI * 2);
            ctx.arc(c + r * 0.35, c + r * 0.55, r * 0.12, 0, Math.PI * 2);
            filled ? ctx.fill() : ctx.stroke();
            break;
        case 7: // Heart
            ctx.beginPath();
            ctx.moveTo(c, c + r * 0.6);
            ctx.bezierCurveTo(c - r * 0.8, c, c - r * 0.8, c - r * 0.6, c, c - r * 0.3);
            ctx.bezierCurveTo(c + r * 0.8, c - r * 0.6, c + r * 0.8, c, c, c + r * 0.6);
            filled ? ctx.fill() : ctx.stroke();
            break;
    }
}

function drawSocialIcon(ctx, index, c, r, filled) {
    switch (index) {
        case 0: // Share
            ctx.beginPath();
            ctx.arc(c, c - r * 0.5, r * 0.2, 0, Math.PI * 2);
            ctx.arc(c - r * 0.5, c + r * 0.3, r * 0.2, 0, Math.PI * 2);
            ctx.arc(c + r * 0.5, c + r * 0.3, r * 0.2, 0, Math.PI * 2);
            filled ? ctx.fill() : ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(c - r * 0.1, c - r * 0.35);
            ctx.lineTo(c - r * 0.35, c + r * 0.15);
            ctx.moveTo(c + r * 0.1, c - r * 0.35);
            ctx.lineTo(c + r * 0.35, c + r * 0.15);
            ctx.stroke();
            break;
        case 1: // Like (thumbs up)
            ctx.beginPath();
            ctx.moveTo(c - r * 0.4, c);
            ctx.lineTo(c - r * 0.4, c + r * 0.6);
            ctx.lineTo(c + r * 0.3, c + r * 0.6);
            ctx.lineTo(c + r * 0.5, c);
            ctx.lineTo(c + r * 0.2, c);
            ctx.lineTo(c + r * 0.2, c - r * 0.5);
            ctx.lineTo(c, c - r * 0.5);
            ctx.quadraticCurveTo(c - r * 0.2, c - r * 0.3, c - r * 0.4, c);
            filled ? ctx.fill() : ctx.stroke();
            break;
        default:
            ctx.beginPath();
            ctx.arc(c, c, r * 0.6, 0, Math.PI * 2);
            filled ? ctx.fill() : ctx.stroke();
    }
}

function drawFileIcon(ctx, index, c, r, filled) {
    // Basic document shape
    ctx.beginPath();
    ctx.moveTo(c - r * 0.5, c - r * 0.7);
    ctx.lineTo(c + r * 0.2, c - r * 0.7);
    ctx.lineTo(c + r * 0.5, c - r * 0.4);
    ctx.lineTo(c + r * 0.5, c + r * 0.7);
    ctx.lineTo(c - r * 0.5, c + r * 0.7);
    ctx.closePath();
    filled ? ctx.fill() : ctx.stroke();

    if (!filled) {
        ctx.beginPath();
        ctx.moveTo(c + r * 0.2, c - r * 0.7);
        ctx.lineTo(c + r * 0.2, c - r * 0.4);
        ctx.lineTo(c + r * 0.5, c - r * 0.4);
        ctx.stroke();
    }
}

function drawArrowIcon(ctx, index, c, r, filled) {
    const directions = [
        { dx: 0, dy: -1 },  // Up
        { dx: 0, dy: 1 },   // Down
        { dx: -1, dy: 0 },  // Left
        { dx: 1, dy: 0 },   // Right
    ];

    if (index < 4) {
        const { dx, dy } = directions[index];
        ctx.beginPath();
        ctx.moveTo(c + dx * r * 0.6, c + dy * r * 0.6);
        ctx.lineTo(c, c);
        ctx.lineTo(c + dy * r * 0.3, c - dx * r * 0.3);
        ctx.moveTo(c, c);
        ctx.lineTo(c - dy * r * 0.3, c + dx * r * 0.3);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(c + dx * r * 0.6, c + dy * r * 0.6);
        ctx.lineTo(c - dx * r * 0.6, c - dy * r * 0.6);
        ctx.stroke();
    } else if (index === 6) { // Refresh
        ctx.beginPath();
        ctx.arc(c, c, r * 0.5, 0, Math.PI * 1.5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(c + r * 0.5, c - r * 0.3);
        ctx.lineTo(c + r * 0.5, c + r * 0.1);
        ctx.lineTo(c + r * 0.2, c - r * 0.1);
        filled ? ctx.fill() : ctx.stroke();
    } else {
        ctx.beginPath();
        ctx.arc(c, c, r * 0.5, 0, Math.PI * 2);
        ctx.stroke();
    }
}

function drawDeviceIcon(ctx, index, c, r, filled) {
    if (index === 0) { // Phone
        ctx.beginPath();
        ctx.roundRect(c - r * 0.3, c - r * 0.6, r * 0.6, r * 1.2, r * 0.1);
        filled ? ctx.fill() : ctx.stroke();
        if (!filled) {
            ctx.beginPath();
            ctx.moveTo(c - r * 0.1, c + r * 0.4);
            ctx.lineTo(c + r * 0.1, c + r * 0.4);
            ctx.stroke();
        }
    } else if (index === 1) { // Computer
        ctx.beginPath();
        ctx.roundRect(c - r * 0.6, c - r * 0.5, r * 1.2, r * 0.8, r * 0.05);
        filled ? ctx.fill() : ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(c - r * 0.2, c + r * 0.3);
        ctx.lineTo(c - r * 0.3, c + r * 0.6);
        ctx.lineTo(c + r * 0.3, c + r * 0.6);
        ctx.lineTo(c + r * 0.2, c + r * 0.3);
        filled ? ctx.fill() : ctx.stroke();
    } else {
        ctx.beginPath();
        ctx.roundRect(c - r * 0.5, c - r * 0.5, r, r, r * 0.1);
        filled ? ctx.fill() : ctx.stroke();
    }
}

function drawWeatherIcon(ctx, index, c, r, filled) {
    if (index === 0) { // Sunny
        ctx.beginPath();
        ctx.arc(c, c, r * 0.35, 0, Math.PI * 2);
        filled ? ctx.fill() : ctx.stroke();
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI / 4) * i;
            ctx.beginPath();
            ctx.moveTo(c + r * 0.5 * Math.cos(angle), c + r * 0.5 * Math.sin(angle));
            ctx.lineTo(c + r * 0.7 * Math.cos(angle), c + r * 0.7 * Math.sin(angle));
            ctx.stroke();
        }
    } else if (index === 1) { // Cloudy
        ctx.beginPath();
        ctx.arc(c - r * 0.2, c + r * 0.1, r * 0.35, 0, Math.PI * 2);
        ctx.arc(c + r * 0.2, c + r * 0.1, r * 0.3, 0, Math.PI * 2);
        ctx.arc(c, c - r * 0.15, r * 0.3, 0, Math.PI * 2);
        filled ? ctx.fill() : ctx.stroke();
    } else if (index === 7) { // Moon
        ctx.beginPath();
        ctx.arc(c, c, r * 0.5, 0, Math.PI * 2);
        filled ? ctx.fill() : ctx.stroke();
        if (filled) {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(c + r * 0.25, c - r * 0.1, r * 0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalCompositeOperation = 'source-over';
        }
    } else {
        ctx.beginPath();
        ctx.arc(c, c, r * 0.5, 0, Math.PI * 2);
        filled ? ctx.fill() : ctx.stroke();
    }
}

function drawActionIcon(ctx, index, c, r, filled) {
    if (index === 0) { // Play
        ctx.beginPath();
        ctx.moveTo(c - r * 0.3, c - r * 0.5);
        ctx.lineTo(c + r * 0.5, c);
        ctx.lineTo(c - r * 0.3, c + r * 0.5);
        ctx.closePath();
        filled ? ctx.fill() : ctx.stroke();
    } else if (index === 1) { // Pause
        ctx.beginPath();
        ctx.roundRect(c - r * 0.45, c - r * 0.5, r * 0.3, r, r * 0.05);
        ctx.roundRect(c + r * 0.15, c - r * 0.5, r * 0.3, r, r * 0.05);
        filled ? ctx.fill() : ctx.stroke();
    } else if (index === 2) { // Stop
        ctx.beginPath();
        ctx.roundRect(c - r * 0.4, c - r * 0.4, r * 0.8, r * 0.8, r * 0.1);
        filled ? ctx.fill() : ctx.stroke();
    } else if (index === 6) { // Add
        ctx.beginPath();
        ctx.moveTo(c, c - r * 0.5);
        ctx.lineTo(c, c + r * 0.5);
        ctx.moveTo(c - r * 0.5, c);
        ctx.lineTo(c + r * 0.5, c);
        ctx.stroke();
    } else if (index === 5) { // Delete
        ctx.beginPath();
        ctx.moveTo(c - r * 0.4, c - r * 0.4);
        ctx.lineTo(c + r * 0.4, c + r * 0.4);
        ctx.moveTo(c + r * 0.4, c - r * 0.4);
        ctx.lineTo(c - r * 0.4, c + r * 0.4);
        ctx.stroke();
    } else {
        ctx.beginPath();
        ctx.arc(c, c, r * 0.5, 0, Math.PI * 2);
        filled ? ctx.fill() : ctx.stroke();
    }
}

function drawEmojiIcon(ctx, index, c, r, filled) {
    // Face circle
    ctx.beginPath();
    ctx.arc(c, c, r * 0.7, 0, Math.PI * 2);
    filled ? ctx.fill() : ctx.stroke();

    if (!filled) {
        // Eyes
        ctx.beginPath();
        ctx.arc(c - r * 0.25, c - r * 0.15, r * 0.08, 0, Math.PI * 2);
        ctx.arc(c + r * 0.25, c - r * 0.15, r * 0.08, 0, Math.PI * 2);
        ctx.fill();

        // Mouth based on emotion
        ctx.beginPath();
        if (index === 0) { // Happy
            ctx.arc(c, c + r * 0.1, r * 0.3, 0, Math.PI);
        } else if (index === 1) { // Sad
            ctx.arc(c, c + r * 0.4, r * 0.25, Math.PI, 0);
        } else if (index === 2) { // Angry
            ctx.moveTo(c - r * 0.3, c + r * 0.25);
            ctx.lineTo(c + r * 0.3, c + r * 0.25);
        } else {
            ctx.arc(c, c + r * 0.15, r * 0.15, 0, Math.PI * 2);
        }
        ctx.stroke();
    }
}

// ========================================
// Generation Functions
// ========================================

function generateIcon() {
    const category = document.getElementById('categorySelect').value;
    const style = document.getElementById('styleSelect').value;
    const iconIndex = parseInt(document.getElementById('iconTypeSelect').value);
    const color = document.getElementById('iconColor').value;

    const selectedSizes = Array.from(document.querySelectorAll('.size-option input:checked'))
        .map(cb => parseInt(cb.value));

    if (selectedSizes.length === 0) {
        selectedSizes.push(64);
    }

    generatedCanvases = {};

    // Draw main preview
    const mainCanvas = document.getElementById('iconCanvas');
    const mainCtx = mainCanvas.getContext('2d');
    drawIcon(mainCtx, iconIndex, category, style, color, 256);

    // Generate all sizes
    selectedSizes.forEach(size => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        drawIcon(ctx, iconIndex, category, style, color, size);
        generatedCanvases[size] = canvas;
    });

    return {
        style: t('style' + style.charAt(0).toUpperCase() + style.slice(1)),
        sizes: selectedSizes
    };
}

// ========================================
// UI Functions
// ========================================

function showProgress() {
    document.getElementById('progressSection').style.display = 'block';
    document.getElementById('canvasSection').style.display = 'none';
    document.getElementById('outputSection').style.display = 'none';

    let progress = 0;
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    const stages = [
        { progress: 25, text: currentLang === 'zh-TW' ? '分析圖示類型...' : 'Analyzing icon type...' },
        { progress: 50, text: currentLang === 'zh-TW' ? '繪製圖形...' : 'Drawing shapes...' },
        { progress: 75, text: currentLang === 'zh-TW' ? '生成多尺寸版本...' : 'Generating multiple sizes...' },
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
            <span class="stat-label">${t('styleName')}:</span>
            <span class="stat-value">${stats.style}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">${t('sizesGenerated')}:</span>
            <span class="stat-value">${stats.sizes.length}</span>
        </div>
    `;
    document.getElementById('outputStats').innerHTML = statsHtml;

    // Create size previews
    const previewsContainer = document.getElementById('sizePreviews');
    previewsContainer.innerHTML = '';

    stats.sizes.sort((a, b) => a - b).forEach(size => {
        const preview = document.createElement('div');
        preview.className = 'size-preview';
        preview.onclick = () => downloadSize(size);
        preview.title = t('clickToDownload');

        const canvas = generatedCanvases[size];
        const displayCanvas = document.createElement('canvas');
        const displaySize = Math.min(size, 64);
        displayCanvas.width = displaySize;
        displayCanvas.height = displaySize;
        displayCanvas.getContext('2d').drawImage(canvas, 0, 0, displaySize, displaySize);

        preview.appendChild(displayCanvas);
        preview.innerHTML += `<span>${size}x${size}</span>`;
        previewsContainer.appendChild(preview);
    });
}

function downloadSize(size) {
    const canvas = generatedCanvases[size];
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `icon-${size}x${size}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

function downloadAll() {
    Object.keys(generatedCanvases).forEach(size => {
        setTimeout(() => downloadSize(parseInt(size)), parseInt(size) * 10);
    });
}

// ========================================
// Event Handlers
// ========================================

function initEventListeners() {
    // Language switcher
    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    // Category change
    document.getElementById('categorySelect').addEventListener('change', updateIconOptions);

    // Generate button
    document.getElementById('generateBtn').addEventListener('click', async () => {
        const btn = document.getElementById('generateBtn');
        btn.disabled = true;
        btn.querySelector('span').textContent = t('generating');

        await showProgress();

        const stats = generateIcon();

        document.getElementById('progressSection').style.display = 'none';
        document.getElementById('canvasSection').style.display = 'block';
        document.getElementById('outputSection').style.display = 'block';

        updateStats(stats);

        btn.disabled = false;
        btn.querySelector('span').textContent = t('generateBtn');

        document.getElementById('canvasSection').scrollIntoView({ behavior: 'smooth' });
    });

    // Download all button
    document.getElementById('downloadAllBtn').addEventListener('click', downloadAll);
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

    updateIconOptions();
    initEventListeners();
    console.log('Icon Generator initialized - Tool #507');
}

init();
