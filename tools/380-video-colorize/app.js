/**
 * Video Colorize - Tool #380
 * Colorize black and white videos (simplified demo using heuristic colorization)
 * Note: Full implementation would require deep learning models
 */

let currentLang = 'zh';
let videoFile = null;
let outputBlob = null;
let colorStyle = 'natural';
let saturation = 1.0;
let intensity = 0.8;

const texts = {
    zh: {
        title: '黑白影片上色',
        subtitle: '將黑白影片轉換為彩色',
        privacy: '100% 本地處理 · 零資料上傳',
        process: '🎨 開始上色',
        download: '⬇️ 下載',
        upload: '拖放影片檔案至此或點擊上傳',
        uploadHint: '支援 MP4, WebM (黑白影片)',
        loading: '載入中...',
        processing: '上色中...',
        complete: '處理完成！',
        original: '原始影片',
        colorized: '上色後',
        colorStyle: '色調風格',
        saturation: '飽和度',
        intensity: '色彩強度'
    },
    en: {
        title: 'Video Colorize',
        subtitle: 'Colorize black and white videos',
        privacy: '100% Local Processing · No Data Upload',
        process: '🎨 Colorize',
        download: '⬇️ Download',
        upload: 'Drop video file here or click to upload',
        uploadHint: 'Supports MP4, WebM (B&W videos)',
        loading: 'Loading...',
        processing: 'Colorizing...',
        complete: 'Processing complete!',
        original: 'Original Video',
        colorized: 'Colorized',
        colorStyle: 'Color Style',
        saturation: 'Saturation',
        intensity: 'Intensity'
    }
};

// Color palettes for different styles
const colorPalettes = {
    natural: {
        sky: { h: 200, s: 60, lRange: [60, 90] },
        grass: { h: 120, s: 50, lRange: [30, 50] },
        skin: { h: 25, s: 50, lRange: [50, 80] },
        earth: { h: 30, s: 40, lRange: [20, 45] }
    },
    warm: {
        sky: { h: 30, s: 40, lRange: [60, 90] },
        grass: { h: 80, s: 40, lRange: [30, 50] },
        skin: { h: 20, s: 60, lRange: [50, 80] },
        earth: { h: 25, s: 50, lRange: [20, 45] }
    },
    cool: {
        sky: { h: 220, s: 70, lRange: [60, 90] },
        grass: { h: 160, s: 50, lRange: [30, 50] },
        skin: { h: 30, s: 40, lRange: [50, 80] },
        earth: { h: 200, s: 30, lRange: [20, 45] }
    },
    vintage: {
        sky: { h: 40, s: 30, lRange: [60, 85] },
        grass: { h: 60, s: 30, lRange: [30, 50] },
        skin: { h: 30, s: 40, lRange: [50, 75] },
        earth: { h: 35, s: 35, lRange: [20, 45] }
    },
    vivid: {
        sky: { h: 200, s: 80, lRange: [60, 90] },
        grass: { h: 130, s: 70, lRange: [30, 50] },
        skin: { h: 25, s: 60, lRange: [50, 80] },
        earth: { h: 30, s: 60, lRange: [20, 45] }
    }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    setupFileUpload();
    document.getElementById('processBtn').addEventListener('click', processVideo);
    document.getElementById('downloadBtn').addEventListener('click', downloadResult);
    document.getElementById('colorStyle').addEventListener('change', (e) => colorStyle = e.target.value);
    document.getElementById('saturation').addEventListener('input', (e) => {
        saturation = parseFloat(e.target.value);
        document.getElementById('saturationValue').textContent = saturation.toFixed(1);
    });
    document.getElementById('intensity').addEventListener('input', (e) => {
        intensity = parseFloat(e.target.value);
        document.getElementById('intensityValue').textContent = intensity.toFixed(1);
    });
}

function setupFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', (e) => e.preventDefault());
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', (e) => { if (e.target.files.length) handleFile(e.target.files[0]); });
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');
    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.getElementById('processBtn').textContent = t.process;
    document.getElementById('downloadBtn').textContent = t.download;
}

function handleFile(file) {
    videoFile = file;
    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('previewSection').style.display = 'grid';
    document.getElementById('optionsSection').style.display = 'block';
    document.getElementById('actionSection').style.display = 'flex';

    const video = document.getElementById('inputVideo');
    video.src = URL.createObjectURL(file);
}

function hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;

    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// Simple colorization based on luminance and position
function colorizePixel(gray, x, y, width, height, palette) {
    const l = gray / 255 * 100;
    const normalizedY = y / height;
    const normalizedX = x / width;

    let h, s;

    // Heuristic colorization based on position and brightness
    if (normalizedY < 0.4 && l > 50) {
        // Upper part with high brightness = sky
        h = palette.sky.h;
        s = palette.sky.s * saturation;
    } else if (normalizedY > 0.7 && l < 50) {
        // Lower dark areas = earth/ground
        h = palette.earth.h;
        s = palette.earth.s * saturation;
    } else if (l > 40 && l < 80) {
        // Mid-tones could be skin or objects
        h = palette.skin.h + (Math.random() - 0.5) * 20;
        s = palette.skin.s * saturation;
    } else {
        // Default to earth tones
        h = palette.earth.h;
        s = palette.earth.s * saturation * 0.5;
    }

    // Add some noise for natural look
    h += (Math.random() - 0.5) * 10;
    s = Math.max(0, Math.min(100, s + (Math.random() - 0.5) * 10));

    const [r, g, b] = hslToRgb(h, s, l);

    // Blend with original grayscale based on intensity
    return [
        Math.round(gray * (1 - intensity) + r * intensity),
        Math.round(gray * (1 - intensity) + g * intensity),
        Math.round(gray * (1 - intensity) + b * intensity)
    ];
}

async function processVideo() {
    const t = texts[currentLang];
    const processBtn = document.getElementById('processBtn');
    processBtn.disabled = true;
    processBtn.textContent = t.loading;

    document.getElementById('progressSection').style.display = 'block';

    try {
        const video = document.getElementById('inputVideo');
        const canvas = document.getElementById('outputCanvas');
        const ctx = canvas.getContext('2d');

        await video.play();
        video.pause();
        video.currentTime = 0;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const duration = video.duration;
        const fps = 30;
        const totalFrames = Math.floor(duration * fps);

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = video.videoWidth;
        tempCanvas.height = video.videoHeight;
        const tempCtx = tempCanvas.getContext('2d');

        const stream = canvas.captureStream(fps);
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });

        const chunks = [];
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = () => {
            outputBlob = new Blob(chunks, { type: 'video/webm' });
            document.getElementById('downloadBtn').disabled = false;
            document.getElementById('progressText').textContent = t.complete;
        };

        mediaRecorder.start();

        const palette = colorPalettes[colorStyle];

        for (let frame = 0; frame < totalFrames; frame++) {
            video.currentTime = frame / fps;
            await new Promise(resolve => video.onseeked = resolve);

            tempCtx.drawImage(video, 0, 0);
            const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            const data = imageData.data;

            const outputData = ctx.createImageData(canvas.width, canvas.height);

            for (let y = 0; y < canvas.height; y++) {
                for (let x = 0; x < canvas.width; x++) {
                    const i = (y * canvas.width + x) * 4;

                    // Get grayscale value
                    const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;

                    // Colorize
                    const [r, g, b] = colorizePixel(gray, x, y, canvas.width, canvas.height, palette);

                    outputData.data[i] = r;
                    outputData.data[i + 1] = g;
                    outputData.data[i + 2] = b;
                    outputData.data[i + 3] = 255;
                }
            }

            ctx.putImageData(outputData, 0, 0);

            const progress = ((frame + 1) / totalFrames) * 100;
            document.getElementById('progressFill').style.width = progress + '%';
            document.getElementById('progressText').textContent = `${t.processing} ${Math.round(progress)}%`;

            await new Promise(resolve => setTimeout(resolve, 1000 / fps));
        }

        mediaRecorder.stop();

    } catch (error) {
        console.error('Error:', error);
    }

    document.getElementById('progressSection').style.display = 'none';
    processBtn.disabled = false;
    processBtn.textContent = t.process;
}

function downloadResult() {
    if (!outputBlob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(outputBlob);
    a.download = 'colorized.webm';
    a.click();
}

init();
