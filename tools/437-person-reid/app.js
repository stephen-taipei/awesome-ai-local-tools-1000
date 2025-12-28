/**
 * Person Re-ID - Tool #437
 * Re-identify the same person across images
 */

const queryCanvas = document.getElementById('queryCanvas');
const queryCtx = queryCanvas.getContext('2d');
let currentLang = 'zh';
let queryImage = null;
let galleryImages = [];

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));

    document.getElementById('queryArea').addEventListener('click', () => document.getElementById('queryInput').click());
    document.getElementById('queryInput').addEventListener('change', (e) => loadQueryImage(e.target.files[0]));

    document.getElementById('galleryArea').addEventListener('click', () => document.getElementById('galleryInput').click());
    document.getElementById('galleryInput').addEventListener('change', (e) => loadGalleryImages(e.target.files));

    document.getElementById('searchBtn').addEventListener('click', performSearch);
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');

    const texts = {
        zh: { title: '人物重識別', subtitle: '跨圖片識別同一人物', privacy: '100% 本地處理 · 零資料上傳', query: '查詢圖片', gallery: '搜尋圖庫', uploadQuery: '上傳要查詢的人物', uploadGallery: '上傳多張圖片', search: '開始搜尋', results: '匹配結果' },
        en: { title: 'Person Re-ID', subtitle: 'Re-identify person across images', privacy: '100% Local Processing · No Data Upload', query: 'Query Image', gallery: 'Gallery', uploadQuery: 'Upload query person', uploadGallery: 'Upload multiple images', search: 'Search', results: 'Match Results' }
    };

    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.querySelectorAll('.upload-box h3')[0].textContent = t.query;
    document.querySelectorAll('.upload-box h3')[1].textContent = t.gallery;
    document.querySelector('#queryArea .upload-text').textContent = t.uploadQuery;
    document.querySelector('#galleryArea .upload-text').textContent = t.uploadGallery;
    document.getElementById('searchBtn').textContent = t.search;
    document.querySelector('.result-section h3').textContent = t.results;
}

function loadQueryImage(file) {
    if (!file) return;

    const img = new Image();
    img.onload = () => {
        queryImage = img;
        queryCanvas.width = 100;
        queryCanvas.height = 100;
        queryCtx.drawImage(img, 0, 0, 100, 100);

        document.getElementById('queryArea').classList.add('has-image');
        document.getElementById('queryArea').innerHTML = `<img src="${URL.createObjectURL(file)}" style="max-width:100%;max-height:150px;border-radius:8px">`;

        checkReady();
    };
    img.src = URL.createObjectURL(file);
}

function loadGalleryImages(files) {
    if (!files.length) return;

    galleryImages = [];
    const preview = document.getElementById('galleryPreview');
    preview.innerHTML = '';

    Array.from(files).forEach((file, idx) => {
        const img = new Image();
        img.onload = () => {
            galleryImages.push({ img, file });

            const thumb = document.createElement('img');
            thumb.src = URL.createObjectURL(file);
            preview.appendChild(thumb);

            checkReady();
        };
        img.src = URL.createObjectURL(file);
    });

    document.getElementById('galleryArea').classList.add('has-image');
}

function checkReady() {
    if (queryImage && galleryImages.length > 0) {
        document.getElementById('searchBtn').style.display = 'block';
    }
}

function performSearch() {
    const queryFeatures = extractFeatures(queryImage);
    const results = [];

    galleryImages.forEach((item, idx) => {
        const features = extractFeatures(item.img);
        const similarity = compareFeaturesReID(queryFeatures, features);
        results.push({ idx, file: item.file, similarity });
    });

    // Sort by similarity
    results.sort((a, b) => b.similarity - a.similarity);

    displayResults(results);
}

function extractFeatures(img) {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = 64;
    tempCanvas.height = 128; // Person aspect ratio

    tempCtx.drawImage(img, 0, 0, 64, 128);
    const imageData = tempCtx.getImageData(0, 0, 64, 128);
    const data = imageData.data;

    // Color histogram (upper and lower body separately)
    const upperHist = new Array(27).fill(0);
    const lowerHist = new Array(27).fill(0);

    for (let y = 0; y < 128; y++) {
        for (let x = 0; x < 64; x++) {
            const idx = (y * 64 + x) * 4;
            const rBin = Math.floor(data[idx] / 86);
            const gBin = Math.floor(data[idx + 1] / 86);
            const bBin = Math.floor(data[idx + 2] / 86);
            const bin = rBin * 9 + gBin * 3 + bBin;

            if (y < 64) upperHist[bin]++;
            else lowerHist[bin]++;
        }
    }

    // Normalize histograms
    const upperTotal = upperHist.reduce((a, b) => a + b, 1);
    const lowerTotal = lowerHist.reduce((a, b) => a + b, 1);

    return {
        upperHist: upperHist.map(v => v / upperTotal),
        lowerHist: lowerHist.map(v => v / lowerTotal),
        avgColor: getAverageColor(data)
    };
}

function getAverageColor(data) {
    let r = 0, g = 0, b = 0, count = 0;
    for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count++;
    }
    return { r: r / count, g: g / count, b: b / count };
}

function compareFeaturesReID(f1, f2) {
    // Compare upper body
    let upperSim = 0;
    for (let i = 0; i < f1.upperHist.length; i++) {
        upperSim += Math.min(f1.upperHist[i], f2.upperHist[i]);
    }

    // Compare lower body
    let lowerSim = 0;
    for (let i = 0; i < f1.lowerHist.length; i++) {
        lowerSim += Math.min(f1.lowerHist[i], f2.lowerHist[i]);
    }

    // Compare average color
    const colorDist = Math.sqrt(
        Math.pow(f1.avgColor.r - f2.avgColor.r, 2) +
        Math.pow(f1.avgColor.g - f2.avgColor.g, 2) +
        Math.pow(f1.avgColor.b - f2.avgColor.b, 2)
    );
    const colorSim = 1 - colorDist / 441;

    // Weighted combination
    return (upperSim * 0.4 + lowerSim * 0.4 + colorSim * 0.2);
}

function displayResults(results) {
    const container = document.getElementById('matchResults');
    container.innerHTML = '';

    results.forEach(result => {
        const score = Math.round(result.similarity * 100);
        let scoreClass = 'low';
        if (score >= 70) scoreClass = 'high';
        else if (score >= 50) scoreClass = 'medium';

        const div = document.createElement('div');
        div.className = 'match-item';
        div.innerHTML = `
            <img src="${URL.createObjectURL(result.file)}">
            <div class="match-score ${scoreClass}">${currentLang === 'zh' ? '相似度' : 'Match'}: ${score}%</div>
        `;
        container.appendChild(div);
    });

    document.getElementById('resultSection').style.display = 'block';
}

init();
