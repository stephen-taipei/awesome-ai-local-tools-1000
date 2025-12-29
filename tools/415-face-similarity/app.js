/**
 * Face Similarity - Tool #415
 * Compare face similarity between two images
 */

const canvasA = document.getElementById('canvasA');
const canvasB = document.getElementById('canvasB');
const ctxA = canvasA.getContext('2d');
const ctxB = canvasB.getContext('2d');
let imageA = null;
let imageB = null;
let featuresA = null;
let featuresB = null;
let currentLang = 'zh';

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));

    document.getElementById('uploadA').addEventListener('click', () => document.getElementById('inputA').click());
    document.getElementById('uploadB').addEventListener('click', () => document.getElementById('inputB').click());

    document.getElementById('inputA').addEventListener('change', (e) => loadImage(e.target.files[0], 'A'));
    document.getElementById('inputB').addEventListener('change', (e) => loadImage(e.target.files[0], 'B'));

    document.getElementById('analyzeBtn').addEventListener('click', analyzeSimilarity);
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');

    const texts = {
        zh: { title: '人臉相似度', subtitle: '比較兩張人臉的相似程度', privacy: '100% 本地處理 · 零資料上傳', faceA: '人臉 A', faceB: '人臉 B', upload: '上傳照片', analyze: '分析相似度' },
        en: { title: 'Face Similarity', subtitle: 'Compare similarity between two faces', privacy: '100% Local Processing · No Data Upload', faceA: 'Face A', faceB: 'Face B', upload: 'Upload Photo', analyze: 'Analyze Similarity' }
    };

    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.querySelectorAll('.upload-box h3')[0].textContent = t.faceA;
    document.querySelectorAll('.upload-box h3')[1].textContent = t.faceB;
    document.querySelectorAll('.upload-text').forEach(el => el.textContent = t.upload);
    document.getElementById('analyzeBtn').textContent = t.analyze;
}

function loadImage(file, which) {
    if (!file) return;

    const img = new Image();
    img.onload = () => {
        const canvas = which === 'A' ? canvasA : canvasB;
        const ctx = which === 'A' ? ctxA : ctxB;
        const uploadArea = document.getElementById(`upload${which}`);

        canvas.width = 200;
        canvas.height = 200;

        // Draw centered and cropped
        const scale = Math.max(200 / img.width, 200 / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, (200 - w) / 2, (200 - h) / 2, w, h);

        uploadArea.style.display = 'none';
        canvas.style.display = 'block';

        // Extract features
        const features = extractFeatures(canvas);
        if (which === 'A') {
            imageA = img;
            featuresA = features;
        } else {
            imageB = img;
            featuresB = features;
        }

        // Show compare button if both loaded
        if (imageA && imageB) {
            document.getElementById('compareBtn').style.display = 'block';
        }
    };
    img.src = URL.createObjectURL(file);
}

function extractFeatures(canvas) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const features = {
        colorHistogram: extractColorHistogram(data),
        brightness: extractBrightness(data),
        contrast: extractContrast(data),
        edges: extractEdges(data, canvas.width, canvas.height),
        regions: extractRegions(data, canvas.width, canvas.height),
        symmetry: extractSymmetry(data, canvas.width, canvas.height)
    };

    return features;
}

function extractColorHistogram(data) {
    const bins = 8;
    const histogram = { r: new Array(bins).fill(0), g: new Array(bins).fill(0), b: new Array(bins).fill(0) };

    for (let i = 0; i < data.length; i += 4) {
        histogram.r[Math.floor(data[i] / 32)]++;
        histogram.g[Math.floor(data[i + 1] / 32)]++;
        histogram.b[Math.floor(data[i + 2] / 32)]++;
    }

    const total = data.length / 4;
    for (let i = 0; i < bins; i++) {
        histogram.r[i] /= total;
        histogram.g[i] /= total;
        histogram.b[i] /= total;
    }

    return histogram;
}

function extractBrightness(data) {
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) {
        sum += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }
    return sum / (data.length / 4) / 255;
}

function extractContrast(data) {
    let min = 255, max = 0;
    for (let i = 0; i < data.length; i += 4) {
        const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
        if (gray < min) min = gray;
        if (gray > max) max = gray;
    }
    return (max - min) / 255;
}

function extractEdges(data, width, height) {
    let edgeSum = 0;
    const grayscale = [];

    for (let i = 0; i < data.length; i += 4) {
        grayscale.push((data[i] + data[i + 1] + data[i + 2]) / 3);
    }

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = y * width + x;
            const gx = Math.abs(grayscale[idx + 1] - grayscale[idx - 1]);
            const gy = Math.abs(grayscale[idx + width] - grayscale[idx - width]);
            edgeSum += Math.sqrt(gx * gx + gy * gy);
        }
    }

    return edgeSum / ((width - 2) * (height - 2)) / 255;
}

function extractRegions(data, width, height) {
    const regions = [];
    const regionSize = 4;

    for (let ry = 0; ry < regionSize; ry++) {
        for (let rx = 0; rx < regionSize; rx++) {
            let sum = 0;
            let count = 0;
            const startX = Math.floor(rx * width / regionSize);
            const startY = Math.floor(ry * height / regionSize);
            const endX = Math.floor((rx + 1) * width / regionSize);
            const endY = Math.floor((ry + 1) * height / regionSize);

            for (let y = startY; y < endY; y++) {
                for (let x = startX; x < endX; x++) {
                    const idx = (y * width + x) * 4;
                    sum += (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                    count++;
                }
            }
            regions.push(sum / count / 255);
        }
    }

    return regions;
}

function extractSymmetry(data, width, height) {
    let symmetry = 0;
    let count = 0;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width / 2; x++) {
            const leftIdx = (y * width + x) * 4;
            const rightIdx = (y * width + (width - 1 - x)) * 4;

            const leftGray = (data[leftIdx] + data[leftIdx + 1] + data[leftIdx + 2]) / 3;
            const rightGray = (data[rightIdx] + data[rightIdx + 1] + data[rightIdx + 2]) / 3;

            symmetry += 1 - Math.abs(leftGray - rightGray) / 255;
            count++;
        }
    }

    return symmetry / count;
}

function analyzeSimilarity() {
    if (!featuresA || !featuresB) return;

    document.getElementById('analyzeBtn').disabled = true;
    document.getElementById('analyzeBtn').textContent = currentLang === 'zh' ? '分析中...' : 'Analyzing...';

    setTimeout(() => {
        const similarities = {
            color: compareHistograms(featuresA.colorHistogram, featuresB.colorHistogram),
            brightness: 1 - Math.abs(featuresA.brightness - featuresB.brightness),
            contrast: 1 - Math.abs(featuresA.contrast - featuresB.contrast),
            edges: 1 - Math.abs(featuresA.edges - featuresB.edges),
            regions: compareArrays(featuresA.regions, featuresB.regions),
            symmetry: 1 - Math.abs(featuresA.symmetry - featuresB.symmetry)
        };

        // Weighted average
        const weights = { color: 0.25, brightness: 0.1, contrast: 0.1, edges: 0.2, regions: 0.25, symmetry: 0.1 };
        let totalSimilarity = 0;
        for (const key in similarities) {
            totalSimilarity += similarities[key] * weights[key];
        }

        displayResults(totalSimilarity * 100, similarities);

        document.getElementById('analyzeBtn').disabled = false;
        document.getElementById('analyzeBtn').textContent = currentLang === 'zh' ? '分析相似度' : 'Analyze Similarity';
    }, 500);
}

function compareHistograms(h1, h2) {
    let similarity = 0;
    for (const channel of ['r', 'g', 'b']) {
        for (let i = 0; i < h1[channel].length; i++) {
            similarity += 1 - Math.abs(h1[channel][i] - h2[channel][i]);
        }
    }
    return similarity / 24;
}

function compareArrays(arr1, arr2) {
    let similarity = 0;
    for (let i = 0; i < arr1.length; i++) {
        similarity += 1 - Math.abs(arr1[i] - arr2[i]);
    }
    return similarity / arr1.length;
}

function displayResults(similarity, details) {
    document.getElementById('resultSection').style.display = 'block';

    // Animate circle
    const circle = document.getElementById('progressCircle');
    const circumference = 283;
    const offset = circumference - (similarity / 100) * circumference;
    circle.style.strokeDashoffset = offset;

    document.getElementById('similarityValue').textContent = `${Math.round(similarity)}%`;

    const label = document.getElementById('similarityLabel');
    let labelText, labelClass;

    if (similarity >= 70) {
        labelText = currentLang === 'zh' ? '高度相似' : 'Highly Similar';
        labelClass = 'high';
    } else if (similarity >= 40) {
        labelText = currentLang === 'zh' ? '中度相似' : 'Moderately Similar';
        labelClass = 'medium';
    } else {
        labelText = currentLang === 'zh' ? '低度相似' : 'Low Similarity';
        labelClass = 'low';
    }

    label.textContent = labelText;
    label.className = `similarity-label ${labelClass}`;

    // Feature comparison
    const featureLabels = currentLang === 'zh'
        ? { color: '色彩', brightness: '亮度', contrast: '對比', edges: '邊緣', regions: '區域', symmetry: '對稱' }
        : { color: 'Color', brightness: 'Brightness', contrast: 'Contrast', edges: 'Edges', regions: 'Regions', symmetry: 'Symmetry' };

    document.getElementById('featuresComparison').innerHTML = Object.entries(details).map(([key, value]) => `
        <div class="feature-item">
            <div class="feature-label">${featureLabels[key]}</div>
            <div class="feature-bar">
                <div class="feature-fill" style="width: ${value * 100}%"></div>
            </div>
            <div class="feature-value">${Math.round(value * 100)}%</div>
        </div>
    `).join('');
}

init();
