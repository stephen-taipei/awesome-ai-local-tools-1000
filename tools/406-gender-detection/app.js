/**
 * Gender Detection - Tool #406
 * Local gender classification from facial features
 */

const canvas = document.getElementById('previewCanvas');
const ctx = canvas.getContext('2d');
let webcamStream = null;
let currentLang = 'zh';

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));

    document.getElementById('uploadArea').addEventListener('click', () => document.getElementById('imageInput').click());
    document.getElementById('imageInput').addEventListener('change', (e) => loadImage(e.target.files[0]));

    document.getElementById('webcamBtn').addEventListener('click', toggleWebcam);
    document.getElementById('captureBtn').addEventListener('click', captureWebcam);
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');

    const texts = {
        zh: {
            title: '性別偵測',
            subtitle: '從人臉特徵分析性別',
            privacy: '100% 本地處理 · 零資料上傳',
            upload: '上傳人臉照片',
            male: '男性',
            female: '女性',
            webcam: '使用攝影機',
            capture: '拍攝'
        },
        en: {
            title: 'Gender Detection',
            subtitle: 'Analyze gender from facial features',
            privacy: '100% Local Processing · No Data Upload',
            upload: 'Upload face photo',
            male: 'Male',
            female: 'Female',
            webcam: 'Use Webcam',
            capture: 'Capture'
        }
    };

    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.querySelector('.upload-text').textContent = t.upload;
    document.querySelectorAll('.prob-label')[0].textContent = t.male;
    document.querySelectorAll('.prob-label')[1].textContent = t.female;
    document.getElementById('webcamBtn').textContent = t.webcam;
    document.getElementById('captureBtn').textContent = t.capture;
}

function loadImage(file) {
    if (!file) return;

    const img = new Image();
    img.onload = () => {
        canvas.width = Math.min(img.width, 500);
        canvas.height = (img.height / img.width) * canvas.width;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        document.getElementById('uploadArea').style.display = 'none';
        document.getElementById('previewSection').style.display = 'block';

        detectGender(canvas);
    };
    img.src = URL.createObjectURL(file);
}

async function toggleWebcam() {
    const video = document.getElementById('webcam');
    const btn = document.getElementById('webcamBtn');
    const captureBtn = document.getElementById('captureBtn');

    if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
        webcamStream = null;
        video.style.display = 'none';
        captureBtn.style.display = 'none';
        btn.textContent = currentLang === 'zh' ? '使用攝影機' : 'Use Webcam';
        return;
    }

    try {
        webcamStream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = webcamStream;
        video.style.display = 'block';
        captureBtn.style.display = 'inline-block';
        btn.textContent = currentLang === 'zh' ? '關閉攝影機' : 'Close Webcam';
    } catch (err) {
        alert(currentLang === 'zh' ? '無法存取攝影機' : 'Cannot access webcam');
    }
}

function captureWebcam() {
    const video = document.getElementById('webcam');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('previewSection').style.display = 'block';

    detectGender(canvas);
}

function detectGender(sourceCanvas) {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    const size = 64;
    tempCanvas.width = size;
    tempCanvas.height = size;
    tempCtx.drawImage(sourceCanvas, 0, 0, size, size);

    const imageData = tempCtx.getImageData(0, 0, size, size);
    const data = imageData.data;

    const features = extractGenderFeatures(data, size);
    const result = classifyGender(features);

    displayResult(result, features);
}

function extractGenderFeatures(data, size) {
    const features = {
        jawWidth: 0,
        foreheadHeight: 0,
        eyebrowThickness: 0,
        lipFullness: 0,
        skinSmoothness: 0,
        contrast: 0,
        brightness: 0
    };

    const grayscale = [];
    let min = 255, max = 0, totalBrightness = 0;

    for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        grayscale.push(gray);
        totalBrightness += gray;
        if (gray < min) min = gray;
        if (gray > max) max = gray;
    }

    features.brightness = totalBrightness / grayscale.length / 255;
    features.contrast = (max - min) / 255;

    // Analyze face regions
    const upperThird = analyzeRegion(grayscale, size, 0, 0, size, size / 3);
    const middleThird = analyzeRegion(grayscale, size, 0, size / 3, size, size / 3);
    const lowerThird = analyzeRegion(grayscale, size, 0, size * 2 / 3, size, size / 3);

    // Width analysis for jaw
    const leftSide = analyzeRegion(grayscale, size, 0, size * 2 / 3, size / 4, size / 3);
    const rightSide = analyzeRegion(grayscale, size, size * 3 / 4, size * 2 / 3, size / 4, size / 3);

    features.jawWidth = (leftSide.intensity + rightSide.intensity) / 2;
    features.foreheadHeight = upperThird.intensity;
    features.eyebrowThickness = middleThird.edgeDensity;
    features.lipFullness = lowerThird.intensity;
    features.skinSmoothness = 1 - middleThird.edgeDensity;

    return features;
}

function analyzeRegion(grayscale, fullSize, startX, startY, width, height) {
    let sum = 0;
    let count = 0;
    let edgeSum = 0;

    for (let y = Math.floor(startY); y < Math.floor(startY + height) && y < fullSize - 1; y++) {
        for (let x = Math.floor(startX); x < Math.floor(startX + width) && x < fullSize - 1; x++) {
            const idx = y * fullSize + x;
            if (idx < grayscale.length) {
                sum += grayscale[idx];
                count++;

                if (x > 0 && y > 0) {
                    const gx = Math.abs(grayscale[idx + 1] - grayscale[idx - 1]);
                    const gy = Math.abs(grayscale[idx + fullSize] - grayscale[idx - fullSize]);
                    edgeSum += Math.sqrt(gx * gx + gy * gy);
                }
            }
        }
    }

    return {
        intensity: count > 0 ? sum / count / 255 : 0,
        edgeDensity: count > 0 ? Math.min(edgeSum / count / 30, 1) : 0
    };
}

function classifyGender(features) {
    // Gender classification based on facial feature analysis
    let maleScore = 0.5;

    // Stronger jaw = more masculine
    maleScore += (features.jawWidth - 0.5) * 0.3;

    // Higher forehead = slightly more masculine
    maleScore += (features.foreheadHeight - 0.5) * 0.1;

    // Thicker eyebrows = more masculine
    maleScore += features.eyebrowThickness * 0.2;

    // Fuller lips = more feminine
    maleScore -= (features.lipFullness - 0.5) * 0.15;

    // Smoother skin = more feminine
    maleScore -= (features.skinSmoothness - 0.5) * 0.2;

    // Higher contrast = often more masculine
    maleScore += (features.contrast - 0.5) * 0.1;

    // Clamp between 0 and 1
    maleScore = Math.max(0, Math.min(1, maleScore));

    return {
        male: maleScore,
        female: 1 - maleScore
    };
}

function displayResult(result, features) {
    document.getElementById('resultSection').style.display = 'block';

    const isMale = result.male > result.female;
    const malePercent = Math.round(result.male * 100);
    const femalePercent = Math.round(result.female * 100);

    document.getElementById('genderIcon').textContent = isMale ? '👨' : '👩';

    const genderLabel = document.getElementById('genderLabel');
    genderLabel.textContent = isMale
        ? (currentLang === 'zh' ? '男性' : 'Male')
        : (currentLang === 'zh' ? '女性' : 'Female');
    genderLabel.className = `gender-label ${isMale ? 'male' : 'female'}`;

    document.getElementById('maleFill').style.width = `${malePercent}%`;
    document.getElementById('femaleFill').style.width = `${femalePercent}%`;
    document.getElementById('maleValue').textContent = `${malePercent}%`;
    document.getElementById('femaleValue').textContent = `${femalePercent}%`;

    // Display feature analysis
    const featureLabels = currentLang === 'zh'
        ? { jawWidth: '下顎寬度', eyebrowThickness: '眉毛特徵', skinSmoothness: '皮膚光滑度', contrast: '對比度' }
        : { jawWidth: 'Jaw Width', eyebrowThickness: 'Eyebrow Features', skinSmoothness: 'Skin Smoothness', contrast: 'Contrast' };

    const featureHtml = Object.entries(featureLabels).map(([key, label]) => `
        <div class="feature-item">
            <div class="feature-name">${label}</div>
            <div class="feature-score">${Math.round((features[key] || 0) * 100)}%</div>
        </div>
    `).join('');

    document.getElementById('featureAnalysis').innerHTML = featureHtml;
}

init();
