/**
 * Clothing Analysis - Tool #438
 * Analyze clothing attributes from images
 */

const canvas = document.getElementById('previewCanvas');
const ctx = canvas.getContext('2d');
let currentLang = 'zh';
let currentImage = null;

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));

    document.getElementById('uploadArea').addEventListener('click', () => document.getElementById('imageInput').click());
    document.getElementById('imageInput').addEventListener('change', (e) => loadImage(e.target.files[0]));
    document.getElementById('analyzeBtn').addEventListener('click', analyzeClothing);
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');

    const texts = {
        zh: { title: '服裝分析', subtitle: 'AI 分析服裝屬性與風格', privacy: '100% 本地處理 · 零資料上傳', upload: '上傳服裝圖片進行分析', analyze: '開始分析', results: '分析結果', mainColor: '主要顏色', pattern: '圖案類型', style: '風格', tone: '色調', detail: '詳細分析' },
        en: { title: 'Clothing Analysis', subtitle: 'AI analyze clothing attributes & style', privacy: '100% Local Processing · No Data Upload', upload: 'Upload clothing image to analyze', analyze: 'Analyze', results: 'Analysis Results', mainColor: 'Main Colors', pattern: 'Pattern Type', style: 'Style', tone: 'Color Tone', detail: 'Detailed Analysis' }
    };

    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.querySelector('.upload-text').textContent = t.upload;
    document.getElementById('analyzeBtn').textContent = t.analyze;
    document.querySelector('.result-section h3').textContent = t.results;
    document.querySelectorAll('.result-label')[0].textContent = t.mainColor;
    document.querySelectorAll('.result-label')[1].textContent = t.pattern;
    document.querySelectorAll('.result-label')[2].textContent = t.style;
    document.querySelectorAll('.result-label')[3].textContent = t.tone;
    document.querySelector('.detail-section h4').textContent = t.detail;
}

function loadImage(file) {
    if (!file) return;

    const img = new Image();
    img.onload = () => {
        currentImage = img;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        document.getElementById('uploadArea').classList.add('has-image');
        canvas.classList.add('visible');
        document.getElementById('analyzeBtn').style.display = 'block';
    };
    img.src = URL.createObjectURL(file);
}

function analyzeClothing() {
    if (!currentImage) return;

    // Resize for analysis
    const analysisCanvas = document.createElement('canvas');
    const analysisCtx = analysisCanvas.getContext('2d');
    analysisCanvas.width = 100;
    analysisCanvas.height = 100;
    analysisCtx.drawImage(currentImage, 0, 0, 100, 100);

    const imageData = analysisCtx.getImageData(0, 0, 100, 100);
    const data = imageData.data;

    // Extract dominant colors
    const colors = extractDominantColors(data);
    displayColors(colors);

    // Analyze pattern
    const pattern = analyzePattern(data, 100, 100);
    const patternTexts = {
        zh: { solid: '純色', striped: '條紋', checkered: '格紋', floral: '花卉', geometric: '幾何', complex: '複雜圖案' },
        en: { solid: 'Solid', striped: 'Striped', checkered: 'Checkered', floral: 'Floral', geometric: 'Geometric', complex: 'Complex Pattern' }
    };
    document.getElementById('patternType').textContent = patternTexts[currentLang][pattern];

    // Analyze style
    const style = analyzeStyle(colors, pattern);
    const styleTexts = {
        zh: { casual: '休閒', formal: '正式', sporty: '運動', elegant: '優雅', bohemian: '波希米亞', minimalist: '極簡' },
        en: { casual: 'Casual', formal: 'Formal', sporty: 'Sporty', elegant: 'Elegant', bohemian: 'Bohemian', minimalist: 'Minimalist' }
    };
    document.getElementById('styleType').textContent = styleTexts[currentLang][style];

    // Analyze color tone
    const tone = analyzeColorTone(colors);
    const toneTexts = {
        zh: { warm: '暖色調', cool: '冷色調', neutral: '中性色調', vibrant: '鮮豔', muted: '柔和' },
        en: { warm: 'Warm', cool: 'Cool', neutral: 'Neutral', vibrant: 'Vibrant', muted: 'Muted' }
    };
    document.getElementById('colorTone').textContent = toneTexts[currentLang][tone];

    // Display detailed analysis
    displayDetails(colors, pattern, style, tone);

    document.getElementById('resultSection').style.display = 'block';
}

function extractDominantColors(data) {
    const colorMap = {};

    for (let i = 0; i < data.length; i += 4) {
        const r = Math.floor(data[i] / 32) * 32;
        const g = Math.floor(data[i + 1] / 32) * 32;
        const b = Math.floor(data[i + 2] / 32) * 32;
        const key = `${r},${g},${b}`;
        colorMap[key] = (colorMap[key] || 0) + 1;
    }

    const sorted = Object.entries(colorMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    return sorted.map(([color, count]) => {
        const [r, g, b] = color.split(',').map(Number);
        return { r, g, b, count };
    });
}

function displayColors(colors) {
    const container = document.getElementById('mainColors');
    container.innerHTML = '';

    colors.slice(0, 4).forEach(color => {
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch';
        swatch.style.backgroundColor = `rgb(${color.r}, ${color.g}, ${color.b})`;
        container.appendChild(swatch);
    });
}

function analyzePattern(data, width, height) {
    // Calculate color variance in different regions
    let horizontalVar = 0;
    let verticalVar = 0;
    let totalVar = 0;

    // Horizontal variance
    for (let y = 0; y < height; y++) {
        for (let x = 1; x < width; x++) {
            const idx1 = (y * width + x) * 4;
            const idx2 = (y * width + x - 1) * 4;
            horizontalVar += Math.abs(data[idx1] - data[idx2]) +
                           Math.abs(data[idx1 + 1] - data[idx2 + 1]) +
                           Math.abs(data[idx1 + 2] - data[idx2 + 2]);
        }
    }

    // Vertical variance
    for (let y = 1; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx1 = (y * width + x) * 4;
            const idx2 = ((y - 1) * width + x) * 4;
            verticalVar += Math.abs(data[idx1] - data[idx2]) +
                          Math.abs(data[idx1 + 1] - data[idx2 + 1]) +
                          Math.abs(data[idx1 + 2] - data[idx2 + 2]);
        }
    }

    totalVar = (horizontalVar + verticalVar) / (width * height * 6);

    if (totalVar < 5) return 'solid';
    if (horizontalVar > verticalVar * 1.5) return 'striped';
    if (verticalVar > horizontalVar * 1.5) return 'striped';
    if (Math.abs(horizontalVar - verticalVar) / Math.max(horizontalVar, verticalVar) < 0.2) return 'checkered';
    if (totalVar > 30) return 'complex';
    return 'geometric';
}

function analyzeStyle(colors, pattern) {
    const mainColor = colors[0];
    const brightness = (mainColor.r + mainColor.g + mainColor.b) / 3;
    const saturation = Math.max(mainColor.r, mainColor.g, mainColor.b) -
                      Math.min(mainColor.r, mainColor.g, mainColor.b);

    if (pattern === 'solid' && brightness < 50) return 'formal';
    if (pattern === 'solid' && saturation < 30) return 'minimalist';
    if (pattern === 'complex') return 'bohemian';
    if (saturation > 100) return 'sporty';
    if (brightness > 180 && saturation < 50) return 'elegant';
    return 'casual';
}

function analyzeColorTone(colors) {
    const mainColor = colors[0];
    const saturation = Math.max(mainColor.r, mainColor.g, mainColor.b) -
                      Math.min(mainColor.r, mainColor.g, mainColor.b);

    if (saturation < 30) return 'neutral';
    if (saturation > 150) return 'vibrant';

    // Check warm vs cool
    const warmScore = mainColor.r + mainColor.g * 0.5;
    const coolScore = mainColor.b + mainColor.g * 0.5;

    if (warmScore > coolScore * 1.2) return 'warm';
    if (coolScore > warmScore * 1.2) return 'cool';
    return 'muted';
}

function displayDetails(colors, pattern, style, tone) {
    const container = document.getElementById('detailList');

    const mainColor = colors[0];
    const colorName = getColorName(mainColor);
    const colorCount = colors.length;

    const details = currentLang === 'zh' ? [
        { key: '主色調', value: colorName },
        { key: '配色數量', value: `${colorCount} 種顏色` },
        { key: '色彩飽和度', value: getSaturationLevel(mainColor) },
        { key: '明暗度', value: getBrightnessLevel(mainColor) },
        { key: '建議搭配', value: getSuggestedMatch(mainColor) }
    ] : [
        { key: 'Main Color', value: colorName },
        { key: 'Color Count', value: `${colorCount} colors` },
        { key: 'Saturation', value: getSaturationLevel(mainColor) },
        { key: 'Brightness', value: getBrightnessLevel(mainColor) },
        { key: 'Suggested Match', value: getSuggestedMatch(mainColor) }
    ];

    container.innerHTML = details.map(d => `
        <div class="detail-item">
            <span class="detail-key">${d.key}</span>
            <span class="detail-value">${d.value}</span>
        </div>
    `).join('');
}

function getColorName(color) {
    const { r, g, b } = color;
    const max = Math.max(r, g, b);

    if (max < 50) return currentLang === 'zh' ? '黑色' : 'Black';
    if (r > 200 && g > 200 && b > 200) return currentLang === 'zh' ? '白色' : 'White';
    if (r > g && r > b) return currentLang === 'zh' ? '紅色系' : 'Red Family';
    if (g > r && g > b) return currentLang === 'zh' ? '綠色系' : 'Green Family';
    if (b > r && b > g) return currentLang === 'zh' ? '藍色系' : 'Blue Family';
    if (r > 150 && g > 150 && b < 100) return currentLang === 'zh' ? '黃色系' : 'Yellow Family';
    return currentLang === 'zh' ? '混合色' : 'Mixed';
}

function getSaturationLevel(color) {
    const sat = Math.max(color.r, color.g, color.b) - Math.min(color.r, color.g, color.b);
    if (sat < 30) return currentLang === 'zh' ? '低' : 'Low';
    if (sat < 100) return currentLang === 'zh' ? '中' : 'Medium';
    return currentLang === 'zh' ? '高' : 'High';
}

function getBrightnessLevel(color) {
    const brightness = (color.r + color.g + color.b) / 3;
    if (brightness < 80) return currentLang === 'zh' ? '深色' : 'Dark';
    if (brightness < 170) return currentLang === 'zh' ? '中等' : 'Medium';
    return currentLang === 'zh' ? '淺色' : 'Light';
}

function getSuggestedMatch(color) {
    const { r, g, b } = color;
    // Complementary color suggestion
    if (r > g && r > b) return currentLang === 'zh' ? '青綠色、白色' : 'Cyan, White';
    if (g > r && g > b) return currentLang === 'zh' ? '紫紅色、米色' : 'Magenta, Beige';
    if (b > r && b > g) return currentLang === 'zh' ? '橙黃色、灰色' : 'Orange, Gray';
    return currentLang === 'zh' ? '黑白配色' : 'Black & White';
}

init();
