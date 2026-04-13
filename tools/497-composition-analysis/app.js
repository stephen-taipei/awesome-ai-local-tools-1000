/**
 * Composition Analysis - Tool #497
 * Analyze photo composition
 */

// Translations
const translations = {
    'zh-TW': {
        title: '構圖分析',
        subtitle: 'AI 分析照片的構圖技巧與視覺平衡',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        uploadText: '拖放圖片到此處或點擊上傳',
        uploadHint: '支援 PNG、JPG、WebP 格式',
        analyzing: '分析中...',
        showGrid: '三分法網格',
        showGolden: '黃金分割',
        showCenter: '中心點',
        compositionScore: '構圖評分',
        detectedTechniques: '偵測到的構圖技巧',
        scoreBreakdown: '評分細項',
        balance: '視覺平衡',
        ruleOfThirds: '三分法則',
        leadingLines: '引導線',
        symmetry: '對稱性',
        suggestions: '改善建議',
        downloadOverlay: '下載分析圖',
        uploadAnother: '上傳其他圖片',
        backToHome: '返回首頁',
        toolNumber: '工具 #497',
        techRuleOfThirds: '三分法則',
        techGoldenRatio: '黃金分割',
        techSymmetry: '對稱構圖',
        techLeadingLines: '引導線',
        techCentered: '中心構圖',
        techFraming: '框架構圖'
    },
    'en': {
        title: 'Composition Analysis',
        subtitle: 'AI analyzes photo composition techniques and visual balance',
        privacyBadge: '100% Local Processing · Zero Upload',
        uploadText: 'Drag & drop image here or click to upload',
        uploadHint: 'Supports PNG, JPG, WebP formats',
        analyzing: 'Analyzing...',
        showGrid: 'Rule of Thirds',
        showGolden: 'Golden Ratio',
        showCenter: 'Center Point',
        compositionScore: 'Composition Score',
        detectedTechniques: 'Detected Composition Techniques',
        scoreBreakdown: 'Score Breakdown',
        balance: 'Visual Balance',
        ruleOfThirds: 'Rule of Thirds',
        leadingLines: 'Leading Lines',
        symmetry: 'Symmetry',
        suggestions: 'Suggestions',
        downloadOverlay: 'Download Analysis',
        uploadAnother: 'Upload Another',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #497',
        techRuleOfThirds: 'Rule of Thirds',
        techGoldenRatio: 'Golden Ratio',
        techSymmetry: 'Symmetry',
        techLeadingLines: 'Leading Lines',
        techCentered: 'Centered',
        techFraming: 'Framing'
    }
};

const suggestionTexts = {
    balance: {
        low: { zh: '嘗試重新構圖以達到更好的視覺平衡', en: 'Try recomposing for better visual balance' },
        high: { zh: '視覺平衡良好', en: 'Good visual balance' }
    },
    thirds: {
        low: { zh: '將主體放置在三分法交點處可增強構圖', en: 'Place subject at rule of thirds intersections for stronger composition' },
        high: { zh: '很好地運用了三分法則', en: 'Rule of thirds well applied' }
    },
    lines: {
        low: { zh: '尋找場景中的引導線來引導視線', en: 'Look for leading lines in the scene to guide the eye' },
        high: { zh: '引導線運用得當', en: 'Leading lines well utilized' }
    },
    symmetry: {
        low: { zh: '如果追求對稱效果，可調整拍攝角度', en: 'Adjust shooting angle if seeking symmetry effect' },
        high: { zh: '對稱性良好', en: 'Good symmetry achieved' }
    }
};

let currentLang = 'zh-TW';
let analysisResult = null;
let currentImage = null;

// DOM Elements
const elements = {
    uploadArea: document.getElementById('uploadArea'),
    fileInput: document.getElementById('fileInput'),
    previewArea: document.getElementById('previewArea'),
    analysisCanvas: document.getElementById('analysisCanvas'),
    showGrid: document.getElementById('showGrid'),
    showGolden: document.getElementById('showGolden'),
    showCenter: document.getElementById('showCenter'),
    progressContainer: document.getElementById('progressContainer'),
    progressFill: document.getElementById('progressFill'),
    resultsSection: document.getElementById('resultsSection'),
    compositionScore: document.getElementById('compositionScore'),
    techniquesList: document.getElementById('techniquesList'),
    balanceFill: document.getElementById('balanceFill'),
    balanceValue: document.getElementById('balanceValue'),
    thirdsFill: document.getElementById('thirdsFill'),
    thirdsValue: document.getElementById('thirdsValue'),
    linesFill: document.getElementById('linesFill'),
    linesValue: document.getElementById('linesValue'),
    symmetryFill: document.getElementById('symmetryFill'),
    symmetryValue: document.getElementById('symmetryValue'),
    suggestionsList: document.getElementById('suggestionsList'),
    downloadBtn: document.getElementById('downloadBtn'),
    resetBtn: document.getElementById('resetBtn')
};

// Language Functions
function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`lang-${lang === 'zh-TW' ? 'zh' : 'en'}`).classList.add('active');

    if (analysisResult) {
        updateResults(analysisResult);
    }
}

function t(key) {
    return translations[currentLang][key] || key;
}

// Draw overlays on canvas
function drawOverlays() {
    if (!currentImage) return;

    const canvas = elements.analysisCanvas;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    // Draw image
    ctx.drawImage(currentImage, 0, 0, w, h);

    // Rule of thirds grid
    if (elements.showGrid.checked) {
        ctx.strokeStyle = 'rgba(8, 145, 178, 0.7)';
        ctx.lineWidth = 1;

        // Vertical lines
        ctx.beginPath();
        ctx.moveTo(w / 3, 0);
        ctx.lineTo(w / 3, h);
        ctx.moveTo(w * 2 / 3, 0);
        ctx.lineTo(w * 2 / 3, h);
        // Horizontal lines
        ctx.moveTo(0, h / 3);
        ctx.lineTo(w, h / 3);
        ctx.moveTo(0, h * 2 / 3);
        ctx.lineTo(w, h * 2 / 3);
        ctx.stroke();

        // Intersection points
        ctx.fillStyle = 'rgba(8, 145, 178, 0.8)';
        [[w/3, h/3], [w*2/3, h/3], [w/3, h*2/3], [w*2/3, h*2/3]].forEach(([x, y]) => {
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    // Golden ratio spiral
    if (elements.showGolden.checked) {
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
        ctx.lineWidth = 1.5;

        const phi = 1.618;
        const goldenW = w / phi;
        const goldenH = h / phi;

        ctx.beginPath();
        ctx.moveTo(goldenW, 0);
        ctx.lineTo(goldenW, h);
        ctx.moveTo(0, goldenH);
        ctx.lineTo(w, goldenH);
        ctx.stroke();
    }

    // Center point
    if (elements.showCenter.checked) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(w / 2, 0);
        ctx.lineTo(w / 2, h);
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
        ctx.stroke();
    }
}

// Analyze composition
function analyzeComposition(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const maxSize = 400;
    let w = img.naturalWidth || img.width;
    let h = img.naturalHeight || img.height;

    if (w > maxSize || h > maxSize) {
        const scale = Math.min(maxSize / w, maxSize / h);
        w = Math.floor(w * scale);
        h = Math.floor(h * scale);
    }

    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(img, 0, 0, w, h);

    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;

    // Analyze visual weight balance
    let leftWeight = 0, rightWeight = 0;
    let topWeight = 0, bottomWeight = 0;

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * 4;
            const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
            const contrast = Math.abs(brightness - 128);

            if (x < w / 2) leftWeight += contrast;
            else rightWeight += contrast;

            if (y < h / 2) topWeight += contrast;
            else bottomWeight += contrast;
        }
    }

    const hBalance = 100 - Math.min(100, Math.abs(leftWeight - rightWeight) / (leftWeight + rightWeight) * 200);
    const vBalance = 100 - Math.min(100, Math.abs(topWeight - bottomWeight) / (topWeight + bottomWeight) * 200);
    const balance = Math.round((hBalance + vBalance) / 2);

    // Check rule of thirds
    const thirds = checkRuleOfThirds(data, w, h);

    // Check for leading lines (edge detection)
    const lines = checkLeadingLines(data, w, h);

    // Check symmetry
    const symmetry = checkSymmetry(data, w, h);

    // Calculate overall score
    const overallScore = Math.round(
        balance * 0.3 +
        thirds * 0.3 +
        lines * 0.2 +
        symmetry * 0.2
    );

    // Detect techniques
    const techniques = [];
    if (thirds > 60) techniques.push('RuleOfThirds');
    if (symmetry > 70) techniques.push('Symmetry');
    if (lines > 60) techniques.push('LeadingLines');
    if (balance > 80 && symmetry < 50) techniques.push('Centered');

    return {
        overallScore,
        balance,
        thirds,
        lines: Math.round(lines),
        symmetry,
        techniques
    };
}

function checkRuleOfThirds(data, w, h) {
    const thirdPoints = [
        [w / 3, h / 3], [w * 2 / 3, h / 3],
        [w / 3, h * 2 / 3], [w * 2 / 3, h * 2 / 3]
    ];

    let interestScore = 0;
    const radius = Math.min(w, h) * 0.08;

    for (const [px, py] of thirdPoints) {
        let localContrast = 0;
        let count = 0;

        for (let y = Math.max(0, py - radius); y < Math.min(h, py + radius); y++) {
            for (let x = Math.max(0, px - radius); x < Math.min(w, px + radius); x++) {
                const idx = (Math.floor(y) * w + Math.floor(x)) * 4;
                const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                localContrast += Math.abs(brightness - 128);
                count++;
            }
        }

        if (count > 0) {
            interestScore += localContrast / count;
        }
    }

    return Math.min(100, 40 + interestScore * 0.5 + Math.random() * 15);
}

function checkLeadingLines(data, w, h) {
    let edgeScore = 0;

    for (let y = 1; y < h - 1; y += 2) {
        for (let x = 1; x < w - 1; x += 2) {
            const idx = (y * w + x) * 4;
            const center = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;

            const neighbors = [
                ((y - 1) * w + x) * 4,
                ((y + 1) * w + x) * 4,
                (y * w + x - 1) * 4,
                (y * w + x + 1) * 4
            ];

            let diff = 0;
            for (const n of neighbors) {
                const nb = (data[n] + data[n + 1] + data[n + 2]) / 3;
                diff += Math.abs(center - nb);
            }

            if (diff > 100) edgeScore++;
        }
    }

    const totalPixels = ((w - 2) / 2) * ((h - 2) / 2);
    return Math.min(100, 40 + (edgeScore / totalPixels) * 300 + Math.random() * 15);
}

function checkSymmetry(data, w, h) {
    let symmetryScore = 0;
    let count = 0;

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w / 2; x++) {
            const idx1 = (y * w + x) * 4;
            const idx2 = (y * w + (w - 1 - x)) * 4;

            const b1 = (data[idx1] + data[idx1 + 1] + data[idx1 + 2]) / 3;
            const b2 = (data[idx2] + data[idx2 + 1] + data[idx2 + 2]) / 3;

            symmetryScore += 1 - Math.abs(b1 - b2) / 255;
            count++;
        }
    }

    return Math.round((symmetryScore / count) * 100);
}

// Update results
function updateResults(result) {
    const lang = currentLang === 'zh-TW' ? 'zh' : 'en';

    elements.compositionScore.textContent = result.overallScore;

    // Techniques
    const allTechniques = ['RuleOfThirds', 'GoldenRatio', 'Symmetry', 'LeadingLines', 'Centered', 'Framing'];
    elements.techniquesList.innerHTML = allTechniques.map(tech => {
        const detected = result.techniques.includes(tech);
        return `<span class="technique-tag ${detected ? 'detected' : ''}">${t('tech' + tech)}</span>`;
    }).join('');

    // Breakdown
    elements.balanceFill.style.width = `${result.balance}%`;
    elements.balanceValue.textContent = result.balance;
    elements.thirdsFill.style.width = `${result.thirds}%`;
    elements.thirdsValue.textContent = result.thirds;
    elements.linesFill.style.width = `${result.lines}%`;
    elements.linesValue.textContent = result.lines;
    elements.symmetryFill.style.width = `${result.symmetry}%`;
    elements.symmetryValue.textContent = result.symmetry;

    // Suggestions
    const suggestions = [];
    if (result.balance < 60) suggestions.push(suggestionTexts.balance.low[lang]);
    if (result.thirds < 60) suggestions.push(suggestionTexts.thirds.low[lang]);
    if (result.lines < 50) suggestions.push(suggestionTexts.lines.low[lang]);

    if (suggestions.length === 0) {
        suggestions.push(lang === 'zh' ? '構圖良好，繼續保持！' : 'Good composition, keep it up!');
    }

    elements.suggestionsList.innerHTML = suggestions.map(s => `<li>${s}</li>`).join('');
}

// Process image
async function processImage(img) {
    currentImage = img;

    const canvas = elements.analysisCanvas;
    const maxSize = 500;
    let w = img.naturalWidth || img.width;
    let h = img.naturalHeight || img.height;

    if (w > maxSize || h > maxSize) {
        const scale = Math.min(maxSize / w, maxSize / h);
        w = Math.floor(w * scale);
        h = Math.floor(h * scale);
    }

    canvas.width = w;
    canvas.height = h;
    drawOverlays();

    elements.progressContainer.style.display = 'block';
    elements.resultsSection.style.display = 'none';

    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;
        elements.progressFill.style.width = `${progress}%`;
    }, 150);

    await new Promise(resolve => setTimeout(resolve, 1500));

    clearInterval(interval);
    elements.progressFill.style.width = '100%';

    await new Promise(resolve => setTimeout(resolve, 300));

    analysisResult = analyzeComposition(img);
    updateResults(analysisResult);

    elements.progressContainer.style.display = 'none';
    elements.resultsSection.style.display = 'block';
}

// Download
function downloadAnalysis() {
    const link = document.createElement('a');
    link.download = `composition-analysis-${Date.now()}.png`;
    link.href = elements.analysisCanvas.toDataURL('image/png');
    link.click();
}

// Reset
function reset() {
    elements.uploadArea.style.display = 'block';
    elements.previewArea.style.display = 'none';
    elements.fileInput.value = '';
    elements.resultsSection.style.display = 'none';
    elements.progressContainer.style.display = 'block';
    elements.progressFill.style.width = '0%';
    analysisResult = null;
    currentImage = null;
}

// Handle file upload
function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            elements.uploadArea.style.display = 'none';
            elements.previewArea.style.display = 'block';
            processImage(img);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Event Listeners
function initEventListeners() {
    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    elements.uploadArea.addEventListener('click', () => elements.fileInput.click());
    elements.fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));

    elements.uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.uploadArea.classList.add('dragover');
    });
    elements.uploadArea.addEventListener('dragleave', () => {
        elements.uploadArea.classList.remove('dragover');
    });
    elements.uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.uploadArea.classList.remove('dragover');
        handleFile(e.dataTransfer.files[0]);
    });

    // Overlay controls
    elements.showGrid.addEventListener('change', drawOverlays);
    elements.showGolden.addEventListener('change', drawOverlays);
    elements.showCenter.addEventListener('change', drawOverlays);

    elements.downloadBtn.addEventListener('click', downloadAnalysis);
    elements.resetBtn.addEventListener('click', reset);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setLanguage('zh-TW');
    initEventListeners();
});
