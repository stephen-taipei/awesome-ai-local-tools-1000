/**
 * Face Quality - Tool #418
 * Assess face image quality
 */

const canvas = document.getElementById('previewCanvas');
const ctx = canvas.getContext('2d');
let currentLang = 'zh';

const metricLabels = {
    sharpness: { zh: '清晰度', en: 'Sharpness' },
    brightness: { zh: '亮度', en: 'Brightness' },
    contrast: { zh: '對比度', en: 'Contrast' },
    faceSize: { zh: '人臉大小', en: 'Face Size' },
    pose: { zh: '姿態角度', en: 'Pose Angle' },
    occlusion: { zh: '遮擋程度', en: 'Occlusion' }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));

    document.getElementById('uploadArea').addEventListener('click', () => document.getElementById('imageInput').click());
    document.getElementById('imageInput').addEventListener('change', (e) => loadImage(e.target.files[0]));
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');

    const texts = {
        zh: { title: '人臉品質', subtitle: '評估人臉影像品質', privacy: '100% 本地處理 · 零資料上傳', upload: '上傳人臉照片', recommend: '改善建議' },
        en: { title: 'Face Quality', subtitle: 'Assess face image quality', privacy: '100% Local Processing · No Data Upload', upload: 'Upload face photo', recommend: 'Recommendations' }
    };

    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.querySelector('.upload-text').textContent = t.upload;
}

function loadImage(file) {
    if (!file) return;

    const img = new Image();
    img.onload = () => {
        canvas.width = Math.min(img.width, 400);
        canvas.height = (img.height / img.width) * canvas.width;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        document.getElementById('uploadArea').style.display = 'none';
        document.getElementById('previewSection').style.display = 'block';

        assessQuality(canvas, img);
    };
    img.src = URL.createObjectURL(file);
}

function assessQuality(sourceCanvas, originalImg) {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = 100;
    tempCanvas.height = 100;
    tempCtx.drawImage(sourceCanvas, 0, 0, 100, 100);

    const imageData = tempCtx.getImageData(0, 0, 100, 100);
    const data = imageData.data;

    const metrics = analyzeMetrics(data, 100, originalImg);
    displayResults(metrics);
}

function analyzeMetrics(data, size, originalImg) {
    const metrics = {};

    // Sharpness (edge detection)
    const grayscale = [];
    for (let i = 0; i < data.length; i += 4) {
        grayscale.push((data[i] + data[i + 1] + data[i + 2]) / 3);
    }

    let edgeSum = 0;
    for (let y = 1; y < size - 1; y++) {
        for (let x = 1; x < size - 1; x++) {
            const idx = y * size + x;
            const gx = Math.abs(grayscale[idx + 1] - grayscale[idx - 1]);
            const gy = Math.abs(grayscale[idx + size] - grayscale[idx - size]);
            edgeSum += Math.sqrt(gx * gx + gy * gy);
        }
    }
    metrics.sharpness = Math.min(edgeSum / ((size - 2) * (size - 2)) / 50, 1);

    // Brightness
    let brightnessSum = 0;
    for (let i = 0; i < data.length; i += 4) {
        brightnessSum += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }
    const avgBrightness = brightnessSum / (data.length / 4) / 255;
    // Optimal brightness around 0.5
    metrics.brightness = 1 - Math.abs(avgBrightness - 0.5) * 2;

    // Contrast
    let min = 255, max = 0;
    for (let i = 0; i < data.length; i += 4) {
        const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
        if (gray < min) min = gray;
        if (gray > max) max = gray;
    }
    metrics.contrast = (max - min) / 255;

    // Face size (based on image resolution)
    const faceArea = originalImg.width * originalImg.height;
    const optimalArea = 300 * 300;
    metrics.faceSize = Math.min(faceArea / optimalArea, 1);

    // Pose estimation (symmetry as proxy)
    let leftSum = 0, rightSum = 0;
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size / 2; x++) {
            leftSum += grayscale[y * size + x];
            rightSum += grayscale[y * size + (size - 1 - x)];
        }
    }
    metrics.pose = 1 - Math.abs(leftSum - rightSum) / (size * size / 2 * 255);

    // Occlusion (variance in center region)
    let centerSum = 0;
    let centerCount = 0;
    for (let y = size * 0.25; y < size * 0.75; y++) {
        for (let x = size * 0.25; x < size * 0.75; x++) {
            centerSum += grayscale[Math.floor(y) * size + Math.floor(x)];
            centerCount++;
        }
    }
    const centerAvg = centerSum / centerCount;
    let variance = 0;
    for (let y = size * 0.25; y < size * 0.75; y++) {
        for (let x = size * 0.25; x < size * 0.75; x++) {
            const val = grayscale[Math.floor(y) * size + Math.floor(x)];
            variance += Math.abs(val - centerAvg);
        }
    }
    metrics.occlusion = Math.min((variance / centerCount) / 30, 1);

    return metrics;
}

function displayResults(metrics) {
    document.getElementById('resultSection').style.display = 'block';

    // Calculate overall score
    const weights = { sharpness: 0.25, brightness: 0.15, contrast: 0.15, faceSize: 0.2, pose: 0.15, occlusion: 0.1 };
    let overallScore = 0;
    for (const key in metrics) {
        overallScore += metrics[key] * (weights[key] || 0.1);
    }
    overallScore = Math.round(overallScore * 100);

    // Animate score circle
    const circle = document.getElementById('scoreCircle');
    const circumference = 283;
    const offset = circumference - (overallScore / 100) * circumference;
    circle.style.strokeDashoffset = offset;

    document.getElementById('scoreValue').textContent = overallScore;

    // Score label
    const scoreLabel = document.getElementById('scoreLabel');
    let labelText, labelClass;
    if (overallScore >= 80) {
        labelText = currentLang === 'zh' ? '優秀品質' : 'Excellent';
        labelClass = 'excellent';
    } else if (overallScore >= 60) {
        labelText = currentLang === 'zh' ? '良好品質' : 'Good';
        labelClass = 'good';
    } else if (overallScore >= 40) {
        labelText = currentLang === 'zh' ? '尚可品質' : 'Fair';
        labelClass = 'fair';
    } else {
        labelText = currentLang === 'zh' ? '需改善' : 'Poor';
        labelClass = 'poor';
    }
    scoreLabel.textContent = labelText;
    scoreLabel.className = `score-label ${labelClass}`;

    // Display metrics
    const metricsGrid = document.getElementById('qualityMetrics');
    metricsGrid.innerHTML = Object.entries(metrics).map(([key, value]) => {
        const label = metricLabels[key];
        const percent = Math.round(value * 100);
        let status, fillClass;
        if (percent >= 70) { status = '✓'; fillClass = 'good'; }
        else if (percent >= 40) { status = '!'; fillClass = 'fair'; }
        else { status = '✗'; fillClass = 'poor'; }

        return `
            <div class="metric-item">
                <div class="metric-header">
                    <span class="metric-name">${label[currentLang]}</span>
                    <span class="metric-status">${status}</span>
                </div>
                <div class="metric-bar">
                    <div class="metric-fill ${fillClass}" style="width: ${percent}%"></div>
                </div>
            </div>
        `;
    }).join('');

    // Generate recommendations
    const recommendations = [];
    if (metrics.sharpness < 0.5) recommendations.push({ icon: '📸', text: currentLang === 'zh' ? '嘗試穩定相機以提高清晰度' : 'Stabilize camera for better sharpness' });
    if (metrics.brightness < 0.5) recommendations.push({ icon: '💡', text: currentLang === 'zh' ? '調整光線以獲得更均勻的亮度' : 'Adjust lighting for even brightness' });
    if (metrics.contrast < 0.5) recommendations.push({ icon: '🎨', text: currentLang === 'zh' ? '增加對比度以改善細節' : 'Increase contrast for better details' });
    if (metrics.faceSize < 0.5) recommendations.push({ icon: '🔍', text: currentLang === 'zh' ? '使用更高解析度的照片' : 'Use higher resolution photo' });
    if (metrics.pose < 0.7) recommendations.push({ icon: '👤', text: currentLang === 'zh' ? '保持正面面對相機' : 'Face the camera directly' });

    const recEl = document.getElementById('recommendations');
    if (recommendations.length > 0) {
        recEl.innerHTML = `
            <h4>${currentLang === 'zh' ? '改善建議' : 'Recommendations'}</h4>
            <div class="recommendation-list">
                ${recommendations.map(r => `
                    <div class="recommendation-item">
                        <span class="recommendation-icon">${r.icon}</span>
                        <span>${r.text}</span>
                    </div>
                `).join('')}
            </div>
        `;
    } else {
        recEl.innerHTML = `<h4>✨ ${currentLang === 'zh' ? '照片品質很好！' : 'Great photo quality!'}</h4>`;
    }
}

init();
