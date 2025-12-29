/**
 * Face Recognition - Tool #403
 * Local face feature extraction and comparison
 */

let refImage = null;
let targetImage = null;
let refFeatures = null;
let targetFeatures = null;
const history = [];

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));

    document.getElementById('refUpload').addEventListener('click', () => document.getElementById('refInput').click());
    document.getElementById('targetUpload').addEventListener('click', () => document.getElementById('targetInput').click());

    document.getElementById('refInput').addEventListener('change', (e) => loadImage(e.target.files[0], 'ref'));
    document.getElementById('targetInput').addEventListener('change', (e) => loadImage(e.target.files[0], 'target'));

    document.getElementById('matchBtn').addEventListener('click', compareFaces);
}

function switchLang(lang) {
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');

    const texts = {
        zh: {
            title: '人臉辨識',
            subtitle: '比對和識別人臉特徵',
            privacy: '100% 本地處理 · 零資料上傳',
            refTitle: '參考人臉',
            targetTitle: '待比對人臉',
            refText: '上傳參考照片',
            targetText: '上傳待比對照片',
            matchBtn: '開始比對',
            resultTitle: '比對結果',
            historyTitle: '比對歷史',
            match: '相似度高，可能是同一人',
            noMatch: '相似度低，可能不是同一人'
        },
        en: {
            title: 'Face Recognition',
            subtitle: 'Compare and recognize facial features',
            privacy: '100% Local Processing · No Data Upload',
            refTitle: 'Reference Face',
            targetTitle: 'Target Face',
            refText: 'Upload reference photo',
            targetText: 'Upload target photo',
            matchBtn: 'Start Matching',
            resultTitle: 'Match Result',
            historyTitle: 'Match History',
            match: 'High similarity, likely same person',
            noMatch: 'Low similarity, likely different person'
        }
    };

    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.querySelectorAll('.upload-box h3')[0].textContent = t.refTitle;
    document.querySelectorAll('.upload-box h3')[1].textContent = t.targetTitle;
    document.querySelectorAll('.upload-text')[0].textContent = t.refText;
    document.querySelectorAll('.upload-text')[1].textContent = t.targetText;
    document.getElementById('matchBtn').textContent = t.matchBtn;
}

function loadImage(file, type) {
    if (!file) return;

    const img = new Image();
    img.onload = () => {
        if (type === 'ref') {
            refImage = img;
            refFeatures = extractFeatures(img);
            document.getElementById('refPreview').innerHTML = `<img src="${img.src}" alt="Reference">`;
            document.getElementById('refUpload').style.display = 'none';
        } else {
            targetImage = img;
            targetFeatures = extractFeatures(img);
            document.getElementById('targetPreview').innerHTML = `<img src="${img.src}" alt="Target">`;
            document.getElementById('targetUpload').style.display = 'none';
        }

        if (refImage && targetImage) {
            document.getElementById('compareBtn').style.display = 'block';
        }
    };
    img.src = URL.createObjectURL(file);
}

function extractFeatures(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = 128;
    canvas.width = size;
    canvas.height = size;

    // Draw and scale image
    ctx.drawImage(img, 0, 0, size, size);
    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;

    // Extract features
    const features = {
        colorHistogram: extractColorHistogram(data),
        edgeFeatures: extractEdgeFeatures(data, size),
        regionIntensity: extractRegionIntensity(data, size),
        symmetry: calculateSymmetry(data, size),
        contrast: calculateContrast(data)
    };

    return features;
}

function extractColorHistogram(data) {
    const histogram = { r: new Array(8).fill(0), g: new Array(8).fill(0), b: new Array(8).fill(0) };
    const total = data.length / 4;

    for (let i = 0; i < data.length; i += 4) {
        histogram.r[Math.floor(data[i] / 32)]++;
        histogram.g[Math.floor(data[i + 1] / 32)]++;
        histogram.b[Math.floor(data[i + 2] / 32)]++;
    }

    // Normalize
    for (let i = 0; i < 8; i++) {
        histogram.r[i] /= total;
        histogram.g[i] /= total;
        histogram.b[i] /= total;
    }

    return histogram;
}

function extractEdgeFeatures(data, size) {
    const edges = [];
    const grayscale = [];

    for (let i = 0; i < data.length; i += 4) {
        grayscale.push(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    }

    for (let y = 1; y < size - 1; y++) {
        for (let x = 1; x < size - 1; x++) {
            const idx = y * size + x;
            const gx = grayscale[idx + 1] - grayscale[idx - 1];
            const gy = grayscale[idx + size] - grayscale[idx - size];
            edges.push(Math.sqrt(gx * gx + gy * gy));
        }
    }

    // Reduce to 16 summary values
    const summary = [];
    const blockSize = Math.floor(edges.length / 16);
    for (let i = 0; i < 16; i++) {
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
            sum += edges[i * blockSize + j] || 0;
        }
        summary.push(sum / blockSize);
    }

    return summary;
}

function extractRegionIntensity(data, size) {
    const regions = [];
    const regionSize = size / 4;

    for (let ry = 0; ry < 4; ry++) {
        for (let rx = 0; rx < 4; rx++) {
            let sum = 0;
            let count = 0;

            for (let y = ry * regionSize; y < (ry + 1) * regionSize; y++) {
                for (let x = rx * regionSize; x < (rx + 1) * regionSize; x++) {
                    const idx = (y * size + x) * 4;
                    sum += (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                    count++;
                }
            }

            regions.push(sum / count / 255);
        }
    }

    return regions;
}

function calculateSymmetry(data, size) {
    let symmetryScore = 0;
    let count = 0;

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size / 2; x++) {
            const leftIdx = (y * size + x) * 4;
            const rightIdx = (y * size + (size - 1 - x)) * 4;

            const leftGray = (data[leftIdx] + data[leftIdx + 1] + data[leftIdx + 2]) / 3;
            const rightGray = (data[rightIdx] + data[rightIdx + 1] + data[rightIdx + 2]) / 3;

            symmetryScore += 1 - Math.abs(leftGray - rightGray) / 255;
            count++;
        }
    }

    return symmetryScore / count;
}

function calculateContrast(data) {
    let min = 255, max = 0;

    for (let i = 0; i < data.length; i += 4) {
        const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
        if (gray < min) min = gray;
        if (gray > max) max = gray;
    }

    return (max - min) / 255;
}

function compareFaces() {
    if (!refFeatures || !targetFeatures) return;

    document.getElementById('matchBtn').disabled = true;
    document.getElementById('matchBtn').textContent = '分析中...';

    setTimeout(() => {
        const similarities = {
            color: compareHistograms(refFeatures.colorHistogram, targetFeatures.colorHistogram),
            edges: compareArrays(refFeatures.edgeFeatures, targetFeatures.edgeFeatures),
            regions: compareArrays(refFeatures.regionIntensity, targetFeatures.regionIntensity),
            symmetry: 1 - Math.abs(refFeatures.symmetry - targetFeatures.symmetry),
            contrast: 1 - Math.abs(refFeatures.contrast - targetFeatures.contrast)
        };

        // Weighted average
        const weights = { color: 0.25, edges: 0.3, regions: 0.25, symmetry: 0.1, contrast: 0.1 };
        let totalSimilarity = 0;
        for (const key in similarities) {
            totalSimilarity += similarities[key] * weights[key];
        }

        // Apply sigmoid for better distribution
        totalSimilarity = 1 / (1 + Math.exp(-10 * (totalSimilarity - 0.5)));

        displayResult(totalSimilarity * 100, similarities);

        document.getElementById('matchBtn').disabled = false;
        document.getElementById('matchBtn').textContent = '開始比對';
    }, 500);
}

function compareHistograms(h1, h2) {
    let similarity = 0;

    for (const channel of ['r', 'g', 'b']) {
        for (let i = 0; i < 8; i++) {
            similarity += 1 - Math.abs(h1[channel][i] - h2[channel][i]);
        }
    }

    return similarity / 24;
}

function compareArrays(arr1, arr2) {
    if (arr1.length !== arr2.length) return 0;

    let similarity = 0;
    let maxVal = 0;

    for (let i = 0; i < arr1.length; i++) {
        maxVal = Math.max(maxVal, arr1[i], arr2[i]);
    }

    if (maxVal === 0) return 1;

    for (let i = 0; i < arr1.length; i++) {
        similarity += 1 - Math.abs(arr1[i] - arr2[i]) / maxVal;
    }

    return similarity / arr1.length;
}

function displayResult(similarity, details) {
    document.getElementById('resultSection').style.display = 'block';

    const meterFill = document.getElementById('meterFill');
    meterFill.style.width = `${similarity}%`;

    document.getElementById('similarityValue').textContent = `${Math.round(similarity)}%`;

    const resultText = document.getElementById('resultText');
    const isMatch = similarity >= 60;
    resultText.textContent = isMatch ? '相似度高，可能是同一人' : '相似度低，可能不是同一人';
    resultText.className = `result-text ${isMatch ? 'match' : 'no-match'}`;

    // Show feature comparison
    const featureHtml = `
        <div class="feature-item">
            <div class="feature-label">色彩相似度</div>
            <div class="feature-value">${Math.round(details.color * 100)}%</div>
        </div>
        <div class="feature-item">
            <div class="feature-label">邊緣特徵</div>
            <div class="feature-value">${Math.round(details.edges * 100)}%</div>
        </div>
        <div class="feature-item">
            <div class="feature-label">區域亮度</div>
            <div class="feature-value">${Math.round(details.regions * 100)}%</div>
        </div>
        <div class="feature-item">
            <div class="feature-label">對稱性</div>
            <div class="feature-value">${Math.round(details.symmetry * 100)}%</div>
        </div>
        <div class="feature-item">
            <div class="feature-label">對比度</div>
            <div class="feature-value">${Math.round(details.contrast * 100)}%</div>
        </div>
    `;
    document.getElementById('featureComparison').innerHTML = featureHtml;

    // Add to history
    addToHistory(similarity, isMatch);
}

function addToHistory(similarity, isMatch) {
    const now = new Date();
    history.unshift({
        date: now.toLocaleString(),
        similarity: Math.round(similarity),
        isMatch
    });

    if (history.length > 5) history.pop();

    document.getElementById('historySection').style.display = 'block';

    const historyHtml = history.map(item => `
        <div class="history-item">
            <div class="history-info">
                <div class="history-date">${item.date}</div>
                <div class="history-result" style="color: ${item.isMatch ? 'var(--success-color)' : 'var(--danger-color)'}">
                    ${item.similarity}% - ${item.isMatch ? '匹配' : '不匹配'}
                </div>
            </div>
        </div>
    `).join('');

    document.getElementById('historyList').innerHTML = historyHtml;
}

init();
