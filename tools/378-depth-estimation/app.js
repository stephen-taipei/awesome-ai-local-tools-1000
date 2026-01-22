/**
 * Depth Estimation - Tool #378
 * Estimate scene depth in videos (simplified demo using edge detection)
 * Note: Full implementation would require MiDaS ONNX model
 */

let currentLang = 'zh';
let videoFile = null;
let outputBlob = null;
let colorMode = 'viridis';
let invertDepth = false;
let overlay = 0;

const texts = {
    zh: {
        title: '影片深度估計',
        subtitle: '估計影片場景的深度資訊',
        privacy: '100% 本地處理 · 零資料上傳',
        process: '🌊 估計深度',
        download: '⬇️ 下載',
        upload: '拖放影片檔案至此或點擊上傳',
        uploadHint: '支援 MP4, WebM',
        loading: '載入中...',
        processing: '處理中...',
        complete: '處理完成！',
        original: '原始影片',
        depth: '深度圖',
        colorMode: '色彩模式',
        invertDepth: '反轉深度',
        overlay: '疊加原圖'
    },
    en: {
        title: 'Depth Estimation',
        subtitle: 'Estimate scene depth in videos',
        privacy: '100% Local Processing · No Data Upload',
        process: '🌊 Estimate Depth',
        download: '⬇️ Download',
        upload: 'Drop video file here or click to upload',
        uploadHint: 'Supports MP4, WebM',
        loading: 'Loading...',
        processing: 'Processing...',
        complete: 'Processing complete!',
        original: 'Original Video',
        depth: 'Depth Map',
        colorMode: 'Color Mode',
        invertDepth: 'Invert Depth',
        overlay: 'Overlay Original'
    }
};

// Color maps for depth visualization
const colorMaps = {
    viridis: (t) => {
        const r = Math.round(68 + t * (253 - 68));
        const g = Math.round(1 + t * (231 - 1));
        const b = Math.round(84 + t * (37 - 84));
        return [r, g, b];
    },
    grayscale: (t) => {
        const v = Math.round(t * 255);
        return [v, v, v];
    },
    rainbow: (t) => {
        const h = t * 300; // Hue from 0 to 300
        return hslToRgb(h / 360, 1, 0.5);
    },
    hot: (t) => {
        if (t < 0.33) {
            return [Math.round(t * 3 * 255), 0, 0];
        } else if (t < 0.66) {
            return [255, Math.round((t - 0.33) * 3 * 255), 0];
        } else {
            return [255, 255, Math.round((t - 0.66) * 3 * 255)];
        }
    }
};

function hslToRgb(h, s, l) {
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

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    setupFileUpload();
    document.getElementById('processBtn').addEventListener('click', processVideo);
    document.getElementById('downloadBtn').addEventListener('click', downloadResult);
    document.getElementById('colorMode').addEventListener('change', (e) => colorMode = e.target.value);
    document.getElementById('invertDepth').addEventListener('change', (e) => invertDepth = e.target.checked);
    document.getElementById('overlay').addEventListener('input', (e) => {
        overlay = parseFloat(e.target.value);
        document.getElementById('overlayValue').textContent = overlay;
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

// Simplified depth estimation using gradient magnitude
function estimateDepth(imageData) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const depth = new Float32Array(width * height);

    // Convert to grayscale and calculate gradient
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = (y * width + x) * 4;

            // Sobel gradient
            const gx =
                -1 * getGray(data, (y-1) * width + (x-1), width) +
                 1 * getGray(data, (y-1) * width + (x+1), width) +
                -2 * getGray(data, y * width + (x-1), width) +
                 2 * getGray(data, y * width + (x+1), width) +
                -1 * getGray(data, (y+1) * width + (x-1), width) +
                 1 * getGray(data, (y+1) * width + (x+1), width);

            const gy =
                -1 * getGray(data, (y-1) * width + (x-1), width) +
                -2 * getGray(data, (y-1) * width + x, width) +
                -1 * getGray(data, (y-1) * width + (x+1), width) +
                 1 * getGray(data, (y+1) * width + (x-1), width) +
                 2 * getGray(data, (y+1) * width + x, width) +
                 1 * getGray(data, (y+1) * width + (x+1), width);

            const magnitude = Math.sqrt(gx * gx + gy * gy);

            // Combine with vertical position heuristic (objects higher in image tend to be farther)
            const verticalBias = 1 - (y / height) * 0.5;

            // Estimate depth (higher gradient = closer, but weighted by position)
            depth[y * width + x] = (1 - Math.min(magnitude / 500, 1)) * 0.7 + verticalBias * 0.3;
        }
    }

    // Normalize depth
    let minDepth = Infinity, maxDepth = -Infinity;
    for (let i = 0; i < depth.length; i++) {
        if (depth[i] < minDepth) minDepth = depth[i];
        if (depth[i] > maxDepth) maxDepth = depth[i];
    }

    const range = maxDepth - minDepth || 1;
    for (let i = 0; i < depth.length; i++) {
        depth[i] = (depth[i] - minDepth) / range;
    }

    return depth;
}

function getGray(data, idx, width) {
    const i = idx * 4;
    return (data[i] + data[i + 1] + data[i + 2]) / 3;
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

        for (let frame = 0; frame < totalFrames; frame++) {
            video.currentTime = frame / fps;
            await new Promise(resolve => video.onseeked = resolve);

            tempCtx.drawImage(video, 0, 0);
            const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);

            const depth = estimateDepth(imageData);

            // Apply color map
            const outputData = ctx.createImageData(canvas.width, canvas.height);
            const colorMap = colorMaps[colorMode];

            for (let i = 0; i < depth.length; i++) {
                let d = depth[i];
                if (invertDepth) d = 1 - d;

                const [r, g, b] = colorMap(d);
                const idx = i * 4;

                if (overlay > 0) {
                    outputData.data[idx] = r * (1 - overlay) + imageData.data[idx] * overlay;
                    outputData.data[idx + 1] = g * (1 - overlay) + imageData.data[idx + 1] * overlay;
                    outputData.data[idx + 2] = b * (1 - overlay) + imageData.data[idx + 2] * overlay;
                } else {
                    outputData.data[idx] = r;
                    outputData.data[idx + 1] = g;
                    outputData.data[idx + 2] = b;
                }
                outputData.data[idx + 3] = 255;
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
    a.download = 'depth-map.webm';
    a.click();
}

init();
