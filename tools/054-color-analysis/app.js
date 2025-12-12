/**
 * Color Analysis
 * Tool #054 - Awesome AI Local Tools
 *
 * Analyze image colors using Color Thief (K-means clustering)
 */

const translations = {
    'zh-TW': {
        title: '顏色分析',
        subtitle: '分析圖片主要顏色、色調分布，生成配色方案',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        uploadText: '點擊或拖放圖片到這裡',
        uploadHint: '支援 JPG、PNG、WebP 格式',
        originalSize: '原始尺寸',
        dominantColor: '主要顏色',
        palette: '配色方案',
        colorDistribution: '色彩分布',
        downloadPalette: '下載配色卡',
        newImage: '選擇新圖片',
        useCases: '使用場景',
        useCaseDesign: 'UI/UX 設計配色',
        useCaseFashion: '服裝搭配分析',
        useCaseArt: '藝術風格研究',
        backToHome: '返回首頁',
        toolNumber: '工具 #054',
        copyright: 'Awesome AI Local Tools © 2024'
    },
    'en': {
        title: 'Color Analysis',
        subtitle: 'Analyze image colors and generate palette',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        uploadText: 'Click or drag image here',
        uploadHint: 'Supports JPG, PNG, WebP formats',
        originalSize: 'Original Size',
        dominantColor: 'Dominant Color',
        palette: 'Color Palette',
        colorDistribution: 'Color Distribution',
        downloadPalette: 'Download Palette',
        newImage: 'New Image',
        useCases: 'Use Cases',
        useCaseDesign: 'UI/UX Design',
        useCaseFashion: 'Fashion Match',
        useCaseArt: 'Art Style Analysis',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #054',
        copyright: 'Awesome AI Local Tools © 2024'
    }
};

let currentLang = 'zh-TW';
let colorThief = new ColorThief();

document.addEventListener('DOMContentLoaded', () => {
    initLanguage();
    initEventListeners();
});

function initLanguage() {
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && translations[savedLang]) {
        currentLang = savedLang;
    }
    updateLanguage();
}

function updateLanguage() {
    const t = translations[currentLang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.textContent = t[key];
    });

    const langZhBtn = document.getElementById('lang-zh');
    const langEnBtn = document.getElementById('lang-en');

    if (currentLang === 'zh-TW') {
        langZhBtn.classList.add('active');
        langEnBtn.classList.remove('active');
    } else {
        langEnBtn.classList.add('active');
        langZhBtn.classList.remove('active');
    }
    localStorage.setItem('preferredLanguage', currentLang);
}

function initEventListeners() {
    document.getElementById('lang-zh').addEventListener('click', () => { currentLang = 'zh-TW'; updateLanguage(); });
    document.getElementById('lang-en').addEventListener('click', () => { currentLang = 'en'; updateLanguage(); });

    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('dragover'); });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        if (e.dataTransfer.files.length) processFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', (e) => { if (e.target.files.length) processFile(e.target.files[0]); });

    document.getElementById('paletteCount').addEventListener('change', analyzeImage);
    document.getElementById('downloadPaletteBtn').addEventListener('click', downloadPalette);
    document.getElementById('newImageBtn').addEventListener('click', () => location.reload());

    // Copy to clipboard
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('copy-btn')) {
            const targetId = e.target.getAttribute('data-target');
            const text = document.getElementById(targetId).textContent;
            navigator.clipboard.writeText(text).then(() => {
                const originalText = e.target.textContent;
                e.target.textContent = '✅';
                setTimeout(() => e.target.textContent = originalText, 1500);
            });
        }
        if (e.target.closest('.palette-item')) {
             const hex = e.target.closest('.palette-item').querySelector('.palette-hex').textContent;
             navigator.clipboard.writeText(hex).then(() => {
                 // Feedback?
             });
        }
    });
}

function processFile(file) {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = document.getElementById('previewImage');
        img.onload = () => {
             document.getElementById('originalSize').textContent = `${img.naturalWidth} x ${img.naturalHeight}`;
             document.getElementById('uploadArea').style.display = 'none';
             document.getElementById('analysisArea').style.display = 'block';
             analyzeImage();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function analyzeImage() {
    const img = document.getElementById('previewImage');
    const paletteCount = parseInt(document.getElementById('paletteCount').value);

    // Dominant Color
    const dominant = colorThief.getColor(img);
    const domHex = rgbToHex(dominant[0], dominant[1], dominant[2]);
    const domRgb = `rgb(${dominant[0]}, ${dominant[1]}, ${dominant[2]})`;

    document.getElementById('dominantColorPreview').style.backgroundColor = domRgb;
    document.getElementById('dominantColorHex').textContent = domHex;
    document.getElementById('dominantColorRgb').textContent = domRgb;

    // Palette
    const palette = colorThief.getPalette(img, paletteCount);
    const paletteGrid = document.getElementById('paletteGrid');
    paletteGrid.innerHTML = '';

    let rTotal = 0, gTotal = 0, bTotal = 0;

    palette.forEach(color => {
        const hex = rgbToHex(color[0], color[1], color[2]);
        const rgb = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;

        const item = document.createElement('div');
        item.className = 'palette-item';
        item.innerHTML = `
            <div class="palette-color" style="background-color: ${rgb}" title="${rgb}"></div>
            <span class="palette-hex">${hex}</span>
        `;
        paletteGrid.appendChild(item);

        rTotal += color[0];
        gTotal += color[1];
        bTotal += color[2];
    });

    // Simple Distribution Estimate (based on palette average)
    const total = rTotal + gTotal + bTotal;
    if (total > 0) {
        document.getElementById('distRed').style.width = (rTotal / total * 100) + '%';
        document.getElementById('distGreen').style.width = (gTotal / total * 100) + '%';
        document.getElementById('distBlue').style.width = (bTotal / total * 100) + '%';
    }
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function downloadPalette() {
    // Generate a canvas with the palette
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = document.getElementById('previewImage');

    // Layout: Image on top, Palette below
    const palette = colorThief.getPalette(img, parseInt(document.getElementById('paletteCount').value));
    const padding = 20;
    const swatchSize = 100;
    const textHeight = 40;

    const paletteWidth = (palette.length * swatchSize) + ((palette.length - 1) * padding) + (padding * 2);
    const paletteHeight = swatchSize + textHeight + (padding * 2);

    // Target image width (scaled down if huge)
    const targetImgWidth = 800;
    const scale = targetImgWidth / img.naturalWidth;
    const targetImgHeight = img.naturalHeight * scale;

    canvas.width = Math.max(targetImgWidth, paletteWidth);
    canvas.height = targetImgHeight + paletteHeight;

    // Draw White BG
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Image
    // Center it
    const imgX = (canvas.width - targetImgWidth) / 2;
    ctx.drawImage(img, imgX, 0, targetImgWidth, targetImgHeight);

    // Draw Palette
    const startX = (canvas.width - ((palette.length * swatchSize) + ((palette.length - 1) * padding))) / 2;
    const startY = targetImgHeight + padding;

    ctx.font = '16px monospace';
    ctx.textAlign = 'center';

    palette.forEach((color, index) => {
        const x = startX + (index * (swatchSize + padding));
        const hex = rgbToHex(color[0], color[1], color[2]);

        ctx.fillStyle = hex;
        ctx.fillRect(x, startY, swatchSize, swatchSize);

        ctx.fillStyle = '#000000';
        ctx.fillText(hex, x + (swatchSize / 2), startY + swatchSize + 20);
    });

    const link = document.createElement('a');
    link.download = `palette-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}
