/**
 * Face Alignment - Tool #411
 * Align and normalize face images
 */

const originalCanvas = document.getElementById('originalCanvas');
const alignedCanvas = document.getElementById('alignedCanvas');
const originalCtx = originalCanvas.getContext('2d');
const alignedCtx = alignedCanvas.getContext('2d');
let sourceImage = null;
let currentLang = 'zh';

let alignParams = {
    rotation: 0,
    scale: 100,
    offsetX: 0,
    offsetY: 0
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));

    document.getElementById('uploadArea').addEventListener('click', () => document.getElementById('imageInput').click());
    document.getElementById('imageInput').addEventListener('change', (e) => loadImage(e.target.files[0]));

    document.getElementById('rotation').addEventListener('input', (e) => {
        alignParams.rotation = parseInt(e.target.value);
        document.getElementById('rotationValue').textContent = `${alignParams.rotation}°`;
        updateAligned();
    });

    document.getElementById('scale').addEventListener('input', (e) => {
        alignParams.scale = parseInt(e.target.value);
        document.getElementById('scaleValue').textContent = `${alignParams.scale}%`;
        updateAligned();
    });

    document.getElementById('offsetX').addEventListener('input', (e) => {
        alignParams.offsetX = parseInt(e.target.value);
        document.getElementById('offsetXValue').textContent = `${alignParams.offsetX}px`;
        updateAligned();
    });

    document.getElementById('offsetY').addEventListener('input', (e) => {
        alignParams.offsetY = parseInt(e.target.value);
        document.getElementById('offsetYValue').textContent = `${alignParams.offsetY}px`;
        updateAligned();
    });

    document.getElementById('autoAlignBtn').addEventListener('click', autoAlign);
    document.getElementById('resetBtn').addEventListener('click', resetParams);
    document.getElementById('downloadBtn').addEventListener('click', downloadAligned);
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');

    const texts = {
        zh: {
            title: '人臉對齊',
            subtitle: '自動對齊和標準化人臉影像',
            privacy: '100% 本地處理 · 零資料上傳',
            upload: '上傳人臉照片',
            original: '原始影像',
            aligned: '對齊後',
            rotation: '旋轉角度',
            scale: '縮放比例',
            offsetX: '水平位移',
            offsetY: '垂直位移',
            autoAlign: '自動對齊',
            reset: '重設',
            download: '下載'
        },
        en: {
            title: 'Face Alignment',
            subtitle: 'Auto-align and normalize face images',
            privacy: '100% Local Processing · No Data Upload',
            upload: 'Upload face photo',
            original: 'Original',
            aligned: 'Aligned',
            rotation: 'Rotation',
            scale: 'Scale',
            offsetX: 'X Offset',
            offsetY: 'Y Offset',
            autoAlign: 'Auto Align',
            reset: 'Reset',
            download: 'Download'
        }
    };

    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.querySelector('.upload-text').textContent = t.upload;
    document.querySelectorAll('.image-box h3')[0].textContent = t.original;
    document.querySelectorAll('.image-box h3')[1].textContent = t.aligned;
    document.querySelectorAll('.control-row label')[0].textContent = t.rotation;
    document.querySelectorAll('.control-row label')[1].textContent = t.scale;
    document.querySelectorAll('.control-row label')[2].textContent = t.offsetX;
    document.querySelectorAll('.control-row label')[3].textContent = t.offsetY;
    document.getElementById('autoAlignBtn').textContent = t.autoAlign;
    document.getElementById('resetBtn').textContent = t.reset;
    document.getElementById('downloadBtn').textContent = t.download;
}

function loadImage(file) {
    if (!file) return;

    const img = new Image();
    img.onload = () => {
        sourceImage = img;

        const size = 300;
        originalCanvas.width = size;
        originalCanvas.height = size;
        alignedCanvas.width = size;
        alignedCanvas.height = size;

        // Draw original
        const scale = Math.min(size / img.width, size / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        originalCtx.fillStyle = '#000';
        originalCtx.fillRect(0, 0, size, size);
        originalCtx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);

        // Show sections
        document.getElementById('uploadArea').style.display = 'none';
        document.getElementById('comparisonSection').style.display = 'grid';
        document.getElementById('controlsSection').style.display = 'block';

        // Initial aligned view
        resetParams();
    };
    img.src = URL.createObjectURL(file);
}

function updateAligned() {
    if (!sourceImage) return;

    const size = alignedCanvas.width;
    alignedCtx.fillStyle = '#000';
    alignedCtx.fillRect(0, 0, size, size);

    alignedCtx.save();

    // Apply transformations
    alignedCtx.translate(size / 2 + alignParams.offsetX, size / 2 + alignParams.offsetY);
    alignedCtx.rotate(alignParams.rotation * Math.PI / 180);
    alignedCtx.scale(alignParams.scale / 100, alignParams.scale / 100);

    const scale = Math.min(size / sourceImage.width, size / sourceImage.height);
    const w = sourceImage.width * scale;
    const h = sourceImage.height * scale;

    alignedCtx.drawImage(sourceImage, -w / 2, -h / 2, w, h);

    alignedCtx.restore();
}

function autoAlign() {
    if (!sourceImage) return;

    // Analyze face for auto-alignment
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = 100;
    tempCanvas.height = 100;
    tempCtx.drawImage(sourceImage, 0, 0, 100, 100);

    const imageData = tempCtx.getImageData(0, 0, 100, 100);
    const analysis = analyzeForAlignment(imageData.data, 100);

    // Apply detected corrections
    alignParams.rotation = Math.round(analysis.rotation);
    alignParams.offsetX = Math.round(analysis.offsetX);
    alignParams.offsetY = Math.round(analysis.offsetY);

    // Update UI
    document.getElementById('rotation').value = alignParams.rotation;
    document.getElementById('rotationValue').textContent = `${alignParams.rotation}°`;
    document.getElementById('offsetX').value = alignParams.offsetX;
    document.getElementById('offsetXValue').textContent = `${alignParams.offsetX}px`;
    document.getElementById('offsetY').value = alignParams.offsetY;
    document.getElementById('offsetYValue').textContent = `${alignParams.offsetY}px`;

    updateAligned();
}

function analyzeForAlignment(data, size) {
    // Find brightest regions (likely face features)
    let leftSum = 0, rightSum = 0;
    let topSum = 0, bottomSum = 0;
    let leftCount = 0, rightCount = 0;
    let topCount = 0, bottomCount = 0;

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const idx = (y * size + x) * 4;
            const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;

            if (x < size / 2) {
                leftSum += brightness;
                leftCount++;
            } else {
                rightSum += brightness;
                rightCount++;
            }

            if (y < size / 2) {
                topSum += brightness;
                topCount++;
            } else {
                bottomSum += brightness;
                bottomCount++;
            }
        }
    }

    const leftAvg = leftSum / leftCount;
    const rightAvg = rightSum / rightCount;
    const topAvg = topSum / topCount;
    const bottomAvg = bottomSum / bottomCount;

    // Estimate rotation from asymmetry
    const horizontalDiff = (rightAvg - leftAvg) / 255;
    const rotation = horizontalDiff * 15; // Max 15 degree correction

    // Estimate offset from center of mass
    const offsetX = horizontalDiff * 20;
    const offsetY = ((topAvg - bottomAvg) / 255) * 20;

    return { rotation, offsetX, offsetY };
}

function resetParams() {
    alignParams = { rotation: 0, scale: 100, offsetX: 0, offsetY: 0 };

    document.getElementById('rotation').value = 0;
    document.getElementById('rotationValue').textContent = '0°';
    document.getElementById('scale').value = 100;
    document.getElementById('scaleValue').textContent = '100%';
    document.getElementById('offsetX').value = 0;
    document.getElementById('offsetXValue').textContent = '0px';
    document.getElementById('offsetY').value = 0;
    document.getElementById('offsetYValue').textContent = '0px';

    updateAligned();
}

function downloadAligned() {
    const link = document.createElement('a');
    link.download = 'aligned-face.png';
    link.href = alignedCanvas.toDataURL('image/png');
    link.click();
}

init();
