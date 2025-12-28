/**
 * Body Parsing - Tool #434
 * Segment body parts from image
 */

const originalCanvas = document.getElementById('originalCanvas');
const segmentCanvas = document.getElementById('segmentCanvas');
const origCtx = originalCanvas.getContext('2d');
const segCtx = segmentCanvas.getContext('2d');
let currentLang = 'zh';

const bodyParts = {
    head: { color: '#ff6b6b', zh: '頭部', en: 'Head' },
    torso: { color: '#4ecdc4', zh: '軀幹', en: 'Torso' },
    arms: { color: '#45b7d1', zh: '手臂', en: 'Arms' },
    legs: { color: '#96ceb4', zh: '腿部', en: 'Legs' },
    hands: { color: '#ffeaa7', zh: '手部', en: 'Hands' },
    feet: { color: '#dfe6e9', zh: '腳部', en: 'Feet' }
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
        zh: { title: '人體分割', subtitle: '分割識別人體各部位', privacy: '100% 本地處理 · 零資料上傳', upload: '上傳人物照片', original: '原圖', result: '分割結果' },
        en: { title: 'Body Parsing', subtitle: 'Segment body parts from image', privacy: '100% Local Processing · No Data Upload', upload: 'Upload person photo', original: 'Original', result: 'Segmentation' }
    };

    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.querySelector('.upload-text').textContent = t.upload;

    const headers = document.querySelectorAll('.image-box h3');
    if (headers.length >= 2) {
        headers[0].textContent = t.original;
        headers[1].textContent = t.result;
    }

    // Update legend
    const legendItems = document.querySelectorAll('.legend-item span:last-child');
    const parts = Object.values(bodyParts);
    legendItems.forEach((item, i) => {
        if (parts[i]) item.textContent = parts[i][lang];
    });
}

function loadImage(file) {
    if (!file) return;

    const img = new Image();
    img.onload = () => {
        const maxSize = 350;
        const scale = Math.min(maxSize / img.width, maxSize / img.height);
        const w = img.width * scale;
        const h = img.height * scale;

        originalCanvas.width = segmentCanvas.width = w;
        originalCanvas.height = segmentCanvas.height = h;

        origCtx.drawImage(img, 0, 0, w, h);

        document.getElementById('uploadArea').style.display = 'none';
        document.getElementById('resultSection').style.display = 'block';

        segmentBody(w, h);
    };
    img.src = URL.createObjectURL(file);
}

function segmentBody(width, height) {
    const imageData = origCtx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Create output image data
    const outputData = segCtx.createImageData(width, height);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const r = data[idx], g = data[idx + 1], b = data[idx + 2];

            // Detect if pixel is part of person (skin or clothing)
            const isSkin = isSkinColor(r, g, b);
            const isClothing = !isSkin && isNonBackground(r, g, b);

            if (isSkin || isClothing) {
                // Determine body part based on position
                const relY = y / height;
                const relX = x / width;

                let color;

                if (relY < 0.18) {
                    // Head region
                    color = hexToRgb(bodyParts.head.color);
                } else if (relY < 0.2 && Math.abs(relX - 0.5) < 0.1) {
                    // Neck (part of head)
                    color = hexToRgb(bodyParts.head.color);
                } else if (relY >= 0.2 && relY < 0.5 && Math.abs(relX - 0.5) < 0.2) {
                    // Torso
                    color = hexToRgb(bodyParts.torso.color);
                } else if (relY >= 0.2 && relY < 0.55 && Math.abs(relX - 0.5) >= 0.2) {
                    // Arms
                    if (relY > 0.45) {
                        // Hands
                        color = hexToRgb(bodyParts.hands.color);
                    } else {
                        color = hexToRgb(bodyParts.arms.color);
                    }
                } else if (relY >= 0.5 && relY < 0.9) {
                    // Legs
                    color = hexToRgb(bodyParts.legs.color);
                } else if (relY >= 0.9) {
                    // Feet
                    color = hexToRgb(bodyParts.feet.color);
                } else {
                    // Default to torso
                    color = hexToRgb(bodyParts.torso.color);
                }

                outputData.data[idx] = color.r;
                outputData.data[idx + 1] = color.g;
                outputData.data[idx + 2] = color.b;
                outputData.data[idx + 3] = 200;
            } else {
                // Background
                outputData.data[idx] = 15;
                outputData.data[idx + 1] = 23;
                outputData.data[idx + 2] = 42;
                outputData.data[idx + 3] = 255;
            }
        }
    }

    segCtx.putImageData(outputData, 0, 0);

    // Blend with original
    segCtx.globalAlpha = 0.3;
    segCtx.drawImage(originalCanvas, 0, 0);
    segCtx.globalAlpha = 1;
}

function isSkinColor(r, g, b) {
    return r > 95 && g > 40 && b > 20 &&
           r > g && r > b &&
           Math.abs(r - g) > 15 &&
           r - g > 15;
}

function isNonBackground(r, g, b) {
    const brightness = (r + g + b) / 3;
    // Check for clothing colors (not too dark, not too bright, not neutral gray)
    return brightness > 30 && brightness < 230 &&
           (Math.abs(r - g) > 10 || Math.abs(g - b) > 10 || Math.abs(r - b) > 10);
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

init();
