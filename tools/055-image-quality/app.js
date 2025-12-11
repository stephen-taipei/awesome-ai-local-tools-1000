/**
 * Image Quality Assessment
 * Tool #055 - Awesome AI Local Tools
 *
 * Evaluate image quality using OpenCV.js heuristics
 */

const translations = {
    'zh-TW': {
        title: '圖片品質評估',
        subtitle: 'AI 評估圖片品質分數（清晰度、曝光、構圖）',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        uploadText: '點擊或拖放圖片到這裡',
        uploadHint: '支援 JPG、PNG、WebP 格式',
        resolution: '解析度',
        overall: '總分',
        sharpness: '清晰度',
        exposure: '曝光度',
        contrast: '對比度',
        saturation: '飽和度',
        suggestions: '改善建議',
        newImage: '選擇新圖片',
        gradeExcellent: '極佳',
        gradeGood: '良好',
        gradeFair: '普通',
        gradePoor: '不佳',
        descSharp: '影像清晰銳利',
        descBlur: '影像略顯模糊',
        descGoodExp: '曝光適中',
        descDark: '曝光不足',
        descBright: '曝光過度',
        descGoodCont: '對比度良好',
        descLowCont: '對比度偏低',
        descGoodSat: '色彩飽和',
        descLowSat: '色彩平淡',
        sugBlur: '建議使用銳化工具或重新對焦拍攝',
        sugDark: '建議提高亮度或使用閃光燈',
        sugBright: '建議降低亮度或減少曝光時間',
        sugLowCont: '建議增加對比度以突顯細節',
        sugLowSat: '建議增加飽和度讓色彩更鮮豔',
        sugGood: '這張照片品質很棒！',
        backToHome: '返回首頁',
        toolNumber: '工具 #055',
        copyright: 'Awesome AI Local Tools © 2024'
    },
    'en': {
        title: 'Image Quality Assessment',
        subtitle: 'Evaluate image quality score (sharpness, exposure, composition)',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        uploadText: 'Click or drag image here',
        uploadHint: 'Supports JPG, PNG, WebP formats',
        resolution: 'Resolution',
        overall: 'Overall',
        sharpness: 'Sharpness',
        exposure: 'Exposure',
        contrast: 'Contrast',
        saturation: 'Saturation',
        suggestions: 'Suggestions',
        newImage: 'New Image',
        gradeExcellent: 'Excellent',
        gradeGood: 'Good',
        gradeFair: 'Fair',
        gradePoor: 'Poor',
        descSharp: 'Sharp and clear',
        descBlur: 'Slightly blurry',
        descGoodExp: 'Well exposed',
        descDark: 'Underexposed',
        descBright: 'Overexposed',
        descGoodCont: 'Good contrast',
        descLowCont: 'Low contrast',
        descGoodSat: 'Vibrant colors',
        descLowSat: 'Dull colors',
        sugBlur: 'Try sharpening tool or refocus',
        sugDark: 'Try increasing brightness',
        sugBright: 'Try decreasing brightness',
        sugLowCont: 'Try increasing contrast',
        sugLowSat: 'Try increasing saturation',
        sugGood: 'This image looks great!',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #055',
        copyright: 'Awesome AI Local Tools © 2024'
    }
};

let currentLang = 'zh-TW';
let isOpenCvReady = false;

window.onOpenCvReady = function() {
    console.log('OpenCV.js is ready');
    isOpenCvReady = true;
};

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

    document.getElementById('newImageBtn').addEventListener('click', () => location.reload());
}

function processFile(file) {
    if (!isOpenCvReady) {
        alert('OpenCV is loading...');
        return;
    }
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => evaluateImage(e.target.result);
    reader.readAsDataURL(file);
}

function evaluateImage(src) {
    const img = new Image();
    img.onload = () => {
        const canvas = document.getElementById('previewCanvas');
        const ctx = canvas.getContext('2d');

        // Resize for display/processing if too large
        let w = img.width;
        let h = img.height;
        const maxDim = 800;
        if (w > maxDim || h > maxDim) {
            if (w > h) {
                h = Math.round(h * (maxDim / w));
                w = maxDim;
            } else {
                w = Math.round(w * (maxDim / h));
                h = maxDim;
            }
        }

        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);

        document.getElementById('resolutionVal').textContent = `${img.width} x ${img.height}`;
        document.getElementById('uploadArea').style.display = 'none';
        document.getElementById('analysisArea').style.display = 'block';

        // Analyze using OpenCV
        let mat = cv.imread(canvas);
        analyze(mat);
        mat.delete();
    };
    img.src = src;
}

function analyze(mat) {
    const t = translations[currentLang];

    // 1. Sharpness (Laplacian Variance)
    let gray = new cv.Mat();
    cv.cvtColor(mat, gray, cv.COLOR_RGBA2GRAY);
    let laplacian = new cv.Mat();
    cv.Laplacian(gray, laplacian, cv.CV_64F);
    let mean = new cv.Mat();
    let stddev = new cv.Mat();
    cv.meanStdDev(laplacian, mean, stddev);
    let sharpness = Math.pow(stddev.data64F[0], 2); // Variance

    // Normalize sharpness (heuristic: >500 is very sharp, <100 is blurry)
    // Scale 0-100
    let sharpScore = Math.min(100, Math.max(0, (sharpness / 500) * 100));

    // 2. Exposure (Brightness Mean)
    let exposureScore = 0;
    let exposureVal = mean.data64F[0]; // Wait, mean of Laplacian is ~0. Need mean of Gray.
    cv.meanStdDev(gray, mean, stddev);
    let brightness = mean.data64F[0]; // 0-255
    // Ideal brightness ~128?
    // Score based on distance from 128
    let expDist = Math.abs(128 - brightness);
    exposureScore = Math.max(0, 100 - (expDist / 128 * 100));

    // 3. Contrast (Standard Deviation of Gray)
    let contrast = stddev.data64F[0]; // 0-128
    // Higher is generally better contrast
    let contrastScore = Math.min(100, (contrast / 80) * 100);

    // 4. Saturation
    let hsv = new cv.Mat();
    cv.cvtColor(mat, hsv, cv.COLOR_RGBA2RGB);
    cv.cvtColor(hsv, hsv, cv.COLOR_RGB2HSV);
    let channels = new cv.MatVector();
    cv.split(hsv, channels);
    let s = channels.get(1); // Saturation channel
    cv.meanStdDev(s, mean, stddev);
    let saturation = mean.data64F[0]; // 0-255
    let satScore = (saturation / 255) * 100;

    // Cleanup
    gray.delete();
    laplacian.delete();
    mean.delete();
    stddev.delete();
    hsv.delete();
    channels.delete();
    s.delete();

    // Update UI
    updateMetric('sharpness', sharpScore, sharpScore > 60 ? t.descSharp : t.descBlur);
    updateMetric('exposure', exposureScore, brightness < 80 ? t.descDark : (brightness > 200 ? t.descBright : t.descGoodExp));
    updateMetric('contrast', contrastScore, contrastScore > 40 ? t.descGoodCont : t.descLowCont);
    updateMetric('saturation', satScore, satScore > 30 ? t.descGoodSat : t.descLowSat);

    // Overall Score (Weighted)
    const total = (sharpScore * 0.4) + (exposureScore * 0.3) + (contrastScore * 0.2) + (satScore * 0.1);
    const finalScore = Math.round(total);

    document.getElementById('totalScore').textContent = finalScore;

    // Circle Color
    const circle = document.querySelector('.score-circle');
    let color = '#ef4444'; // red
    let grade = t.gradePoor;

    if (finalScore >= 85) { color = '#10b981'; grade = t.gradeExcellent; }
    else if (finalScore >= 70) { color = '#3b82f6'; grade = t.gradeGood; }
    else if (finalScore >= 50) { color = '#f59e0b'; grade = t.gradeFair; }

    circle.style.background = `conic-gradient(${color} ${finalScore}%, #e5e7eb ${finalScore}%)`;
    document.getElementById('totalScore').style.color = color;
    document.getElementById('scoreGrade').textContent = grade;
    document.getElementById('scoreGrade').style.color = color;

    // Suggestions
    const list = document.getElementById('suggestionList');
    list.innerHTML = '';

    if (sharpScore < 60) addSuggestion(t.sugBlur);
    if (brightness < 80) addSuggestion(t.sugDark);
    if (brightness > 200) addSuggestion(t.sugBright);
    if (contrastScore < 40) addSuggestion(t.sugLowCont);
    if (satScore < 30) addSuggestion(t.sugLowSat);

    if (list.children.length === 0) addSuggestion(t.sugGood);
}

function updateMetric(id, score, desc) {
    const bar = document.getElementById(id + 'Bar');
    const val = document.getElementById(id + 'Val');
    const descEl = document.getElementById(id + 'Desc');

    score = Math.round(score);
    bar.style.width = score + '%';
    val.textContent = score;
    descEl.textContent = desc;
}

function addSuggestion(text) {
    const li = document.createElement('li');
    li.textContent = text;
    document.getElementById('suggestionList').appendChild(li);
}
