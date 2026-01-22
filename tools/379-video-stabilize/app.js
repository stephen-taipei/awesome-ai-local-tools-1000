/**
 * Video Stabilize - Tool #379
 * Stabilize shaky video footage using motion estimation
 */

let currentLang = 'zh';
let videoFile = null;
let outputBlob = null;
let strength = 0.8;
let borderMode = 'crop';
let smoothWindow = 15;

const texts = {
    zh: {
        title: '影片穩定器',
        subtitle: '去除影片的抖動與模糊',
        privacy: '100% 本地處理 · 零資料上傳',
        process: '📹 穩定影片',
        download: '⬇️ 下載',
        upload: '拖放影片檔案至此或點擊上傳',
        uploadHint: '支援 MP4, WebM',
        loading: '載入中...',
        analyzing: '分析動態...',
        stabilizing: '穩定中...',
        complete: '處理完成！',
        original: '原始影片',
        stabilized: '穩定後',
        strength: '穩定強度',
        borderMode: '邊緣處理',
        smoothWindow: '平滑視窗'
    },
    en: {
        title: 'Video Stabilizer',
        subtitle: 'Remove shaking and blur from videos',
        privacy: '100% Local Processing · No Data Upload',
        process: '📹 Stabilize',
        download: '⬇️ Download',
        upload: 'Drop video file here or click to upload',
        uploadHint: 'Supports MP4, WebM',
        loading: 'Loading...',
        analyzing: 'Analyzing motion...',
        stabilizing: 'Stabilizing...',
        complete: 'Processing complete!',
        original: 'Original Video',
        stabilized: 'Stabilized',
        strength: 'Strength',
        borderMode: 'Border Mode',
        smoothWindow: 'Smooth Window'
    }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    setupFileUpload();
    document.getElementById('processBtn').addEventListener('click', processVideo);
    document.getElementById('downloadBtn').addEventListener('click', downloadResult);
    document.getElementById('strength').addEventListener('input', (e) => {
        strength = parseFloat(e.target.value);
        document.getElementById('strengthValue').textContent = strength;
    });
    document.getElementById('borderMode').addEventListener('change', (e) => borderMode = e.target.value);
    document.getElementById('smoothWindow').addEventListener('input', (e) => {
        smoothWindow = parseInt(e.target.value);
        document.getElementById('smoothWindowValue').textContent = smoothWindow;
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

// Simple motion estimation using block matching
function estimateMotion(prevData, currData, width, height, blockSize = 16) {
    let totalDx = 0;
    let totalDy = 0;
    let count = 0;

    const searchRange = 8;

    for (let y = searchRange; y < height - blockSize - searchRange; y += blockSize * 2) {
        for (let x = searchRange; x < width - blockSize - searchRange; x += blockSize * 2) {
            let minSAD = Infinity;
            let bestDx = 0;
            let bestDy = 0;

            // Search in a small window
            for (let dy = -searchRange; dy <= searchRange; dy += 2) {
                for (let dx = -searchRange; dx <= searchRange; dx += 2) {
                    let sad = 0;

                    // Calculate Sum of Absolute Differences
                    for (let by = 0; by < blockSize; by += 2) {
                        for (let bx = 0; bx < blockSize; bx += 2) {
                            const prevIdx = ((y + by) * width + (x + bx)) * 4;
                            const currIdx = ((y + by + dy) * width + (x + bx + dx)) * 4;

                            const prevGray = (prevData[prevIdx] + prevData[prevIdx + 1] + prevData[prevIdx + 2]) / 3;
                            const currGray = (currData[currIdx] + currData[currIdx + 1] + currData[currIdx + 2]) / 3;

                            sad += Math.abs(prevGray - currGray);
                        }
                    }

                    if (sad < minSAD) {
                        minSAD = sad;
                        bestDx = dx;
                        bestDy = dy;
                    }
                }
            }

            totalDx += bestDx;
            totalDy += bestDy;
            count++;
        }
    }

    return {
        dx: count > 0 ? totalDx / count : 0,
        dy: count > 0 ? totalDy / count : 0
    };
}

// Smooth the motion trajectory
function smoothTrajectory(motions, windowSize) {
    const smoothed = [];
    const halfWindow = Math.floor(windowSize / 2);

    for (let i = 0; i < motions.length; i++) {
        let sumDx = 0;
        let sumDy = 0;
        let count = 0;

        for (let j = Math.max(0, i - halfWindow); j <= Math.min(motions.length - 1, i + halfWindow); j++) {
            sumDx += motions[j].dx;
            sumDy += motions[j].dy;
            count++;
        }

        smoothed.push({
            dx: sumDx / count,
            dy: sumDy / count
        });
    }

    return smoothed;
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

        const cropMargin = borderMode === 'crop' ? 0.1 : 0;
        const outputWidth = Math.floor(video.videoWidth * (1 - cropMargin * 2));
        const outputHeight = Math.floor(video.videoHeight * (1 - cropMargin * 2));

        canvas.width = outputWidth;
        canvas.height = outputHeight;

        const duration = video.duration;
        const fps = 30;
        const totalFrames = Math.floor(duration * fps);

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = video.videoWidth;
        tempCanvas.height = video.videoHeight;
        const tempCtx = tempCanvas.getContext('2d');

        // Phase 1: Analyze motion
        document.getElementById('progressText').textContent = t.analyzing;
        const motions = [];
        let prevImageData = null;

        for (let frame = 0; frame < totalFrames; frame++) {
            video.currentTime = frame / fps;
            await new Promise(resolve => video.onseeked = resolve);

            tempCtx.drawImage(video, 0, 0);
            const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);

            if (prevImageData) {
                const motion = estimateMotion(
                    prevImageData.data,
                    imageData.data,
                    tempCanvas.width,
                    tempCanvas.height
                );
                motions.push(motion);
            } else {
                motions.push({ dx: 0, dy: 0 });
            }

            prevImageData = imageData;

            const progress = ((frame + 1) / totalFrames) * 50;
            document.getElementById('progressFill').style.width = progress + '%';
        }

        // Smooth trajectory
        const smoothedMotions = smoothTrajectory(motions, smoothWindow);

        // Calculate cumulative motion
        const trajectory = [{ x: 0, y: 0 }];
        for (let i = 0; i < motions.length; i++) {
            trajectory.push({
                x: trajectory[i].x + motions[i].dx,
                y: trajectory[i].y + motions[i].dy
            });
        }

        const smoothedTrajectory = [{ x: 0, y: 0 }];
        for (let i = 0; i < smoothedMotions.length; i++) {
            smoothedTrajectory.push({
                x: smoothedTrajectory[i].x + smoothedMotions[i].dx,
                y: smoothedTrajectory[i].y + smoothedMotions[i].dy
            });
        }

        // Calculate transforms (difference between original and smoothed)
        const transforms = [];
        for (let i = 0; i < trajectory.length; i++) {
            transforms.push({
                dx: (smoothedTrajectory[i].x - trajectory[i].x) * strength,
                dy: (smoothedTrajectory[i].y - trajectory[i].y) * strength
            });
        }

        // Phase 2: Apply stabilization
        document.getElementById('progressText').textContent = t.stabilizing;

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

            const transform = transforms[frame] || { dx: 0, dy: 0 };

            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, outputWidth, outputHeight);

            if (borderMode === 'crop') {
                const srcX = video.videoWidth * cropMargin - transform.dx;
                const srcY = video.videoHeight * cropMargin - transform.dy;
                ctx.drawImage(video, srcX, srcY, outputWidth, outputHeight, 0, 0, outputWidth, outputHeight);
            } else if (borderMode === 'mirror') {
                ctx.save();
                ctx.translate(transform.dx, transform.dy);
                ctx.drawImage(video, 0, 0, outputWidth, outputHeight);
                ctx.restore();
            } else {
                ctx.drawImage(video, transform.dx, transform.dy, outputWidth, outputHeight);
            }

            const progress = 50 + ((frame + 1) / totalFrames) * 50;
            document.getElementById('progressFill').style.width = progress + '%';

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
    a.download = 'stabilized.webm';
    a.click();
}

init();
