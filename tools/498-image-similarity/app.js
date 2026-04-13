/**
 * Image Similarity - Tool #498
 * Compare image similarity
 */

// Translations
const translations = {
    'zh-TW': {
        title: '圖像相似度',
        subtitle: 'AI 比較兩張圖片的相似程度',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        image1: '圖片 1',
        image2: '圖片 2',
        compare: '比較相似度',
        analyzing: '分析中...',
        comparisonDetails: '比較細項',
        colorSimilarity: '色彩相似度',
        structureSimilarity: '結構相似度',
        textureSimilarity: '紋理相似度',
        histogramSimilarity: '直方圖相似度',
        verdict: '判定結果',
        export: '匯出報告',
        reset: '重新比較',
        backToHome: '返回首頁',
        toolNumber: '工具 #498',
        identical: '幾乎相同',
        verySimilar: '非常相似',
        similar: '相似',
        somewhatSimilar: '有些相似',
        different: '不同'
    },
    'en': {
        title: 'Image Similarity',
        subtitle: 'AI compares the similarity between two images',
        privacyBadge: '100% Local Processing · Zero Upload',
        image1: 'Image 1',
        image2: 'Image 2',
        compare: 'Compare Similarity',
        analyzing: 'Analyzing...',
        comparisonDetails: 'Comparison Details',
        colorSimilarity: 'Color Similarity',
        structureSimilarity: 'Structure Similarity',
        textureSimilarity: 'Texture Similarity',
        histogramSimilarity: 'Histogram Similarity',
        verdict: 'Verdict',
        export: 'Export Report',
        reset: 'Compare Again',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #498',
        identical: 'Nearly Identical',
        verySimilar: 'Very Similar',
        similar: 'Similar',
        somewhatSimilar: 'Somewhat Similar',
        different: 'Different'
    }
};

const verdictTexts = {
    identical: {
        zh: '這兩張圖片幾乎完全相同，可能是同一張圖片的不同版本或經過輕微編輯。',
        en: 'These two images are nearly identical, possibly different versions of the same image or slightly edited.'
    },
    verySimilar: {
        zh: '這兩張圖片非常相似，具有相同的主題和構圖，可能來自同一場景或序列。',
        en: 'These images are very similar, sharing the same subject and composition, possibly from the same scene or sequence.'
    },
    similar: {
        zh: '這兩張圖片有明顯的相似之處，可能具有相似的主題或風格。',
        en: 'These images share noticeable similarities, possibly having similar subjects or styles.'
    },
    somewhatSimilar: {
        zh: '這兩張圖片有一些共同特徵，但整體上存在明顯差異。',
        en: 'These images share some common features but have notable differences overall.'
    },
    different: {
        zh: '這兩張圖片差異明顯，屬於不同的圖片。',
        en: 'These images are notably different from each other.'
    }
};

let currentLang = 'zh-TW';
let image1 = null;
let image2 = null;
let analysisResult = null;

// DOM Elements
const elements = {
    uploadBox1: document.getElementById('uploadBox1'),
    uploadBox2: document.getElementById('uploadBox2'),
    fileInput1: document.getElementById('fileInput1'),
    fileInput2: document.getElementById('fileInput2'),
    uploadContent1: document.getElementById('uploadContent1'),
    uploadContent2: document.getElementById('uploadContent2'),
    preview1: document.getElementById('preview1'),
    preview2: document.getElementById('preview2'),
    compareBtn: document.getElementById('compareBtn'),
    progressContainer: document.getElementById('progressContainer'),
    progressFill: document.getElementById('progressFill'),
    resultsSection: document.getElementById('resultsSection'),
    similarityValue: document.getElementById('similarityValue'),
    similarityLabel: document.getElementById('similarityLabel'),
    colorFill: document.getElementById('colorFill'),
    colorValue: document.getElementById('colorValue'),
    structureFill: document.getElementById('structureFill'),
    structureValue: document.getElementById('structureValue'),
    textureFill: document.getElementById('textureFill'),
    textureValue: document.getElementById('textureValue'),
    histogramFill: document.getElementById('histogramFill'),
    histogramValue: document.getElementById('histogramValue'),
    verdictText: document.getElementById('verdictText'),
    actions: document.getElementById('actions'),
    exportBtn: document.getElementById('exportBtn'),
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

// Get image data
function getImageData(img, size = 100) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = size;
    canvas.height = size;
    ctx.drawImage(img, 0, 0, size, size);
    return ctx.getImageData(0, 0, size, size);
}

// Compare color histograms
function compareHistograms(data1, data2) {
    const hist1 = new Array(256).fill(0);
    const hist2 = new Array(256).fill(0);

    for (let i = 0; i < data1.data.length; i += 4) {
        const b1 = Math.round((data1.data[i] + data1.data[i + 1] + data1.data[i + 2]) / 3);
        const b2 = Math.round((data2.data[i] + data2.data[i + 1] + data2.data[i + 2]) / 3);
        hist1[b1]++;
        hist2[b2]++;
    }

    // Bhattacharyya coefficient
    let bc = 0;
    const total1 = data1.data.length / 4;
    const total2 = data2.data.length / 4;

    for (let i = 0; i < 256; i++) {
        bc += Math.sqrt((hist1[i] / total1) * (hist2[i] / total2));
    }

    return Math.round(bc * 100);
}

// Compare color
function compareColor(data1, data2) {
    let totalDiff = 0;
    const pixelCount = data1.data.length / 4;

    for (let i = 0; i < data1.data.length; i += 4) {
        const r = Math.abs(data1.data[i] - data2.data[i]) / 255;
        const g = Math.abs(data1.data[i + 1] - data2.data[i + 1]) / 255;
        const b = Math.abs(data1.data[i + 2] - data2.data[i + 2]) / 255;
        totalDiff += (r + g + b) / 3;
    }

    return Math.round((1 - totalDiff / pixelCount) * 100);
}

// Compare structure (edge-based)
function compareStructure(data1, data2, w, h) {
    const edges1 = detectEdges(data1, w, h);
    const edges2 = detectEdges(data2, w, h);

    let match = 0;
    for (let i = 0; i < edges1.length; i++) {
        if (Math.abs(edges1[i] - edges2[i]) < 30) match++;
    }

    return Math.round((match / edges1.length) * 100);
}

function detectEdges(data, w, h) {
    const edges = [];
    for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
            const idx = (y * w + x) * 4;
            const center = (data.data[idx] + data.data[idx + 1] + data.data[idx + 2]) / 3;

            const left = ((y * w + x - 1) * 4);
            const right = ((y * w + x + 1) * 4);
            const lv = (data.data[left] + data.data[left + 1] + data.data[left + 2]) / 3;
            const rv = (data.data[right] + data.data[right + 1] + data.data[right + 2]) / 3;

            edges.push(Math.abs(lv - rv));
        }
    }
    return edges;
}

// Compare texture
function compareTexture(data1, data2) {
    let variance1 = 0, variance2 = 0;
    let mean1 = 0, mean2 = 0;

    for (let i = 0; i < data1.data.length; i += 4) {
        const b1 = (data1.data[i] + data1.data[i + 1] + data1.data[i + 2]) / 3;
        const b2 = (data2.data[i] + data2.data[i + 1] + data2.data[i + 2]) / 3;
        mean1 += b1;
        mean2 += b2;
    }

    const count = data1.data.length / 4;
    mean1 /= count;
    mean2 /= count;

    for (let i = 0; i < data1.data.length; i += 4) {
        const b1 = (data1.data[i] + data1.data[i + 1] + data1.data[i + 2]) / 3;
        const b2 = (data2.data[i] + data2.data[i + 1] + data2.data[i + 2]) / 3;
        variance1 += Math.pow(b1 - mean1, 2);
        variance2 += Math.pow(b2 - mean2, 2);
    }

    variance1 = Math.sqrt(variance1 / count);
    variance2 = Math.sqrt(variance2 / count);

    const maxVar = Math.max(variance1, variance2, 1);
    return Math.round((1 - Math.abs(variance1 - variance2) / maxVar) * 100);
}

// Compare images
function compareImages() {
    const size = 100;
    const data1 = getImageData(image1, size);
    const data2 = getImageData(image2, size);

    const color = compareColor(data1, data2);
    const structure = compareStructure(data1, data2, size, size);
    const texture = compareTexture(data1, data2);
    const histogram = compareHistograms(data1, data2);

    const overall = Math.round(
        color * 0.3 +
        structure * 0.3 +
        texture * 0.2 +
        histogram * 0.2
    );

    return { overall, color, structure, texture, histogram };
}

// Update results
function updateResults(result) {
    const lang = currentLang === 'zh-TW' ? 'zh' : 'en';

    elements.similarityValue.textContent = result.overall;

    // Determine category
    let category;
    if (result.overall >= 90) category = 'identical';
    else if (result.overall >= 75) category = 'verySimilar';
    else if (result.overall >= 55) category = 'similar';
    else if (result.overall >= 35) category = 'somewhatSimilar';
    else category = 'different';

    elements.similarityLabel.textContent = t(category);
    elements.verdictText.textContent = verdictTexts[category][lang];

    // Detail bars
    elements.colorFill.style.width = `${result.color}%`;
    elements.colorValue.textContent = `${result.color}%`;
    elements.structureFill.style.width = `${result.structure}%`;
    elements.structureValue.textContent = `${result.structure}%`;
    elements.textureFill.style.width = `${result.texture}%`;
    elements.textureValue.textContent = `${result.texture}%`;
    elements.histogramFill.style.width = `${result.histogram}%`;
    elements.histogramValue.textContent = `${result.histogram}%`;
}

// Run comparison
async function runComparison() {
    elements.progressContainer.style.display = 'block';
    elements.resultsSection.style.display = 'none';
    elements.actions.style.display = 'none';

    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;
        elements.progressFill.style.width = `${progress}%`;
    }, 150);

    await new Promise(resolve => setTimeout(resolve, 2000));

    clearInterval(interval);
    elements.progressFill.style.width = '100%';

    await new Promise(resolve => setTimeout(resolve, 300));

    analysisResult = compareImages();
    updateResults(analysisResult);

    elements.progressContainer.style.display = 'none';
    elements.resultsSection.style.display = 'block';
    elements.actions.style.display = 'flex';
}

// Check if both images loaded
function checkImages() {
    elements.compareBtn.disabled = !(image1 && image2);
}

// Handle file upload
function handleFile(file, num) {
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            if (num === 1) {
                image1 = img;
                elements.preview1.src = e.target.result;
                elements.preview1.style.display = 'block';
                elements.uploadContent1.style.display = 'none';
                elements.uploadBox1.classList.add('has-image');
            } else {
                image2 = img;
                elements.preview2.src = e.target.result;
                elements.preview2.style.display = 'block';
                elements.uploadContent2.style.display = 'none';
                elements.uploadBox2.classList.add('has-image');
            }
            checkImages();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Export report
function exportReport() {
    if (!analysisResult) return;

    const report = {
        timestamp: new Date().toISOString(),
        similarity: analysisResult
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `image-similarity-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// Reset
function reset() {
    image1 = null;
    image2 = null;
    analysisResult = null;

    elements.preview1.style.display = 'none';
    elements.preview2.style.display = 'none';
    elements.uploadContent1.style.display = 'flex';
    elements.uploadContent2.style.display = 'flex';
    elements.uploadBox1.classList.remove('has-image');
    elements.uploadBox2.classList.remove('has-image');
    elements.fileInput1.value = '';
    elements.fileInput2.value = '';
    elements.resultsSection.style.display = 'none';
    elements.actions.style.display = 'none';
    elements.progressContainer.style.display = 'none';
    elements.progressFill.style.width = '0%';
    elements.compareBtn.disabled = true;
}

// Event Listeners
function initEventListeners() {
    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    elements.uploadBox1.addEventListener('click', () => elements.fileInput1.click());
    elements.uploadBox2.addEventListener('click', () => elements.fileInput2.click());

    elements.fileInput1.addEventListener('change', (e) => handleFile(e.target.files[0], 1));
    elements.fileInput2.addEventListener('change', (e) => handleFile(e.target.files[0], 2));

    elements.compareBtn.addEventListener('click', runComparison);
    elements.exportBtn.addEventListener('click', exportReport);
    elements.resetBtn.addEventListener('click', reset);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setLanguage('zh-TW');
    initEventListeners();
});
