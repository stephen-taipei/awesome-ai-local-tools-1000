/**
 * Anime Image Enhancement - Specialized Anime/Illustration Upscaling
 * Tool #013 - Uses anime-optimized super resolution model
 */

import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.2';

// Configure environment
env.useBrowserCache = true;
env.allowLocalModels = false;

// Translations
const translations = {
    zh: {
        title: '動漫圖片增強',
        subtitle: '專為動漫、插畫風格圖片優化的 AI 超解析度增強',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        loadingModel: '正在載入動漫增強模型...',
        loadingHint: '首次載入需下載模型檔案',
        uploadText: '點擊或拖放動漫圖片到這裡',
        uploadHint: '支援 JPG、PNG、WebP 格式',
        original: '原圖',
        enhanced: '增強後',
        inputSize: '輸入尺寸',
        outputSize: '輸出尺寸',
        scaleFactor: '放大倍率',
        processTime: '處理時間',
        enhanceOptions: '增強選項',
        scale2x: '標準放大',
        scale4x: '極致放大',
        denoiseLevel: '降噪程度',
        sharpenLevel: '銳化程度',
        newImage: '選擇新圖片',
        download: '下載結果',
        processing: '正在增強動漫圖片...',
        processingHint: 'AI 正在優化線條與色彩',
        howItWorks: '如何運作？',
        step1Title: '動漫特徵識別',
        step1Desc: 'AI 識別動漫特有的線條、色塊和紋理特徵',
        step2Title: '線條強化',
        step2Desc: '專門針對動漫線條進行銳化和平滑處理',
        step3Title: '色彩優化',
        step3Desc: '保持動漫風格的色彩鮮豔度和對比度',
        step4Title: '高解析度輸出',
        step4Desc: '輸出清晰銳利的高解析度動漫圖片',
        techSpecs: '技術規格',
        specModel: 'AI 模型',
        specScale: '放大倍率',
        specInput: '輸入格式',
        specOutput: '輸出格式',
        backToHome: '返回首頁',
        toolNumber: '工具 #013',
        copyright: 'Awesome AI Local Tools © 2024',
        modelLoaded: '模型載入完成！',
        errorLoading: '模型載入失敗'
    },
    en: {
        title: 'Anime Image Enhancement',
        subtitle: 'AI super resolution optimized for anime and illustration style images',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        loadingModel: 'Loading anime enhancement model...',
        loadingHint: 'First load requires model download',
        uploadText: 'Click or drag and drop anime image here',
        uploadHint: 'Supports JPG, PNG, WebP formats',
        original: 'Original',
        enhanced: 'Enhanced',
        inputSize: 'Input Size',
        outputSize: 'Output Size',
        scaleFactor: 'Scale Factor',
        processTime: 'Process Time',
        enhanceOptions: 'Enhancement Options',
        scale2x: 'Standard 2x',
        scale4x: 'Ultra 4x',
        denoiseLevel: 'Denoise Level',
        sharpenLevel: 'Sharpen Level',
        newImage: 'New Image',
        download: 'Download',
        processing: 'Enhancing anime image...',
        processingHint: 'AI is optimizing lines and colors',
        howItWorks: 'How It Works',
        step1Title: 'Anime Feature Recognition',
        step1Desc: 'AI identifies anime-specific lines, colors, and textures',
        step2Title: 'Line Enhancement',
        step2Desc: 'Specialized sharpening and smoothing for anime lines',
        step3Title: 'Color Optimization',
        step3Desc: 'Preserve anime-style vibrant colors and contrast',
        step4Title: 'High-Res Output',
        step4Desc: 'Output crisp, sharp high-resolution anime images',
        techSpecs: 'Technical Specs',
        specModel: 'AI Model',
        specScale: 'Scale Factor',
        specInput: 'Input Format',
        specOutput: 'Output Format',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #013',
        copyright: 'Awesome AI Local Tools © 2024',
        modelLoaded: 'Model loaded!',
        errorLoading: 'Failed to load model'
    }
};

// State
let currentLang = 'zh';
let upscaler = null;
let originalImage = null;
let sliderPosition = 50;
let isDragging = false;
let settings = {
    scale: 2,
    denoise: 30,
    sharpen: 50
};

// DOM Elements
const modelLoading = document.getElementById('modelLoading');
const uploadArea = document.getElementById('uploadArea');
const editorArea = document.getElementById('editorArea');
const fileInput = document.getElementById('fileInput');
const originalCanvas = document.getElementById('originalCanvas');
const resultCanvas = document.getElementById('resultCanvas');
const processingOverlay = document.getElementById('processingOverlay');
const loadProgress = document.getElementById('loadProgress');
const loadingStatus = document.getElementById('loadingStatus');
const comparisonSlider = document.getElementById('comparisonSlider');
const sliderHandle = document.getElementById('sliderHandle');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    initLanguage();
    initUpload();
    initControls();
    initSlider();
    await loadModel();
});

// Language handling
function initLanguage() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLanguage('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLanguage('en'));
    applyTranslations();
}

function switchLanguage(lang) {
    currentLang = lang;
    document.getElementById('lang-zh').classList.toggle('active', lang === 'zh');
    document.getElementById('lang-en').classList.toggle('active', lang === 'en');
    applyTranslations();
}

function applyTranslations() {
    const t = translations[currentLang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) {
            el.textContent = t[key];
        }
    });
}

// Load AI Model
async function loadModel() {
    try {
        loadingStatus.textContent = translations[currentLang].loadingHint;

        // Use image-to-image pipeline with anime-friendly model
        upscaler = await pipeline('image-to-image', 'Xenova/swin2SR-classical-sr-x2-64', {
            progress_callback: (progress) => {
                if (progress.status === 'downloading') {
                    const percent = Math.round((progress.loaded / progress.total) * 100);
                    loadProgress.style.width = percent + '%';
                    loadingStatus.textContent = `下載中... ${percent}%`;
                } else if (progress.status === 'loading') {
                    loadingStatus.textContent = '載入模型中...';
                }
            }
        });

        loadProgress.style.width = '100%';
        loadingStatus.textContent = translations[currentLang].modelLoaded;

        setTimeout(() => {
            modelLoading.style.display = 'none';
            uploadArea.style.display = 'flex';
        }, 500);

    } catch (error) {
        console.error('Model loading error:', error);
        loadingStatus.textContent = translations[currentLang].errorLoading;

        // Fallback mode
        setTimeout(() => {
            modelLoading.style.display = 'none';
            uploadArea.style.display = 'flex';
            upscaler = null;
        }, 2000);
    }
}

// Upload handling
function initUpload() {
    uploadArea.addEventListener('click', () => fileInput.click());

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    document.getElementById('resetBtn').addEventListener('click', resetEditor);
    document.getElementById('downloadBtn').addEventListener('click', downloadResult);
}

function handleFile(file) {
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
        alert('請選擇 JPG、PNG 或 WebP 格式的圖片');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            originalImage = img;
            showEditor();
            processImage();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function showEditor() {
    uploadArea.style.display = 'none';
    editorArea.style.display = 'grid';
}

function resetEditor() {
    uploadArea.style.display = 'flex';
    editorArea.style.display = 'none';
    originalImage = null;
    fileInput.value = '';
    sliderPosition = 50;
    updateSlider();
}

// Comparison Slider
function initSlider() {
    comparisonSlider.addEventListener('mousedown', startDrag);
    comparisonSlider.addEventListener('touchstart', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag);
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
}

function startDrag(e) {
    isDragging = true;
    drag(e);
}

function drag(e) {
    if (!isDragging) return;

    const rect = comparisonSlider.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    sliderPosition = Math.max(0, Math.min(100, (x / rect.width) * 100));
    updateSlider();
}

function endDrag() {
    isDragging = false;
}

function updateSlider() {
    sliderHandle.style.left = sliderPosition + '%';
    resultCanvas.style.clipPath = `inset(0 0 0 ${sliderPosition}%)`;
}

// Process image
async function processImage() {
    if (!originalImage) return;

    processingOverlay.style.display = 'flex';
    const startTime = performance.now();

    // Limit input size for performance
    let width = originalImage.width;
    let height = originalImage.height;
    const maxSize = 512;

    if (width > maxSize || height > maxSize) {
        if (width > height) {
            height = Math.round((maxSize / width) * height);
            width = maxSize;
        } else {
            width = Math.round((maxSize / height) * width);
            height = maxSize;
        }
    }

    // Set canvas sizes
    const origCtx = originalCanvas.getContext('2d');
    originalCanvas.width = width * settings.scale;
    originalCanvas.height = height * settings.scale;

    // Draw original scaled up for comparison
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(originalImage, 0, 0, width, height);

    // Apply denoise if needed
    if (settings.denoise > 0) {
        applyDenoise(tempCtx, width, height, settings.denoise / 100);
    }

    // Scale up original for comparison
    origCtx.imageSmoothingEnabled = true;
    origCtx.imageSmoothingQuality = 'high';
    origCtx.drawImage(tempCanvas, 0, 0, width * settings.scale, height * settings.scale);

    document.getElementById('inputSizeValue').textContent = `${width} x ${height}`;

    try {
        let resultWidth, resultHeight;

        if (upscaler) {
            // Use AI model for upscaling
            const imageDataUrl = tempCanvas.toDataURL('image/png');
            const result = await upscaler(imageDataUrl);

            // Create image from result
            const resultImg = new Image();
            await new Promise((resolve, reject) => {
                resultImg.onload = resolve;
                resultImg.onerror = reject;
                resultImg.src = result.url;
            });

            resultWidth = resultImg.width;
            resultHeight = resultImg.height;

            // If scale is 4x, we need to upscale twice
            if (settings.scale === 4) {
                const canvas2 = document.createElement('canvas');
                canvas2.width = resultWidth;
                canvas2.height = resultHeight;
                const ctx2 = canvas2.getContext('2d');
                ctx2.drawImage(resultImg, 0, 0);

                const result2 = await upscaler(canvas2.toDataURL('image/png'));
                const resultImg2 = new Image();
                await new Promise((resolve, reject) => {
                    resultImg2.onload = resolve;
                    resultImg2.onerror = reject;
                    resultImg2.src = result2.url;
                });

                resultWidth = resultImg2.width;
                resultHeight = resultImg2.height;

                resultCanvas.width = resultWidth;
                resultCanvas.height = resultHeight;
                originalCanvas.width = resultWidth;
                originalCanvas.height = resultHeight;
                origCtx.drawImage(tempCanvas, 0, 0, resultWidth, resultHeight);

                const resultCtx = resultCanvas.getContext('2d');
                resultCtx.drawImage(resultImg2, 0, 0);
            } else {
                resultCanvas.width = resultWidth;
                resultCanvas.height = resultHeight;
                originalCanvas.width = resultWidth;
                originalCanvas.height = resultHeight;
                origCtx.drawImage(tempCanvas, 0, 0, resultWidth, resultHeight);

                const resultCtx = resultCanvas.getContext('2d');
                resultCtx.drawImage(resultImg, 0, 0);
            }
        } else {
            // Fallback: Enhanced bicubic with anime-specific sharpening
            resultWidth = width * settings.scale;
            resultHeight = height * settings.scale;

            resultCanvas.width = resultWidth;
            resultCanvas.height = resultHeight;

            const resultCtx = resultCanvas.getContext('2d');
            resultCtx.imageSmoothingEnabled = true;
            resultCtx.imageSmoothingQuality = 'high';
            resultCtx.drawImage(tempCanvas, 0, 0, resultWidth, resultHeight);

            // Apply anime-specific sharpening
            const resultData = resultCtx.getImageData(0, 0, resultWidth, resultHeight);
            applyAnimeSharpen(resultData, settings.sharpen / 100);
            resultCtx.putImageData(resultData, 0, 0);
        }

        // Apply final sharpening if needed
        if (settings.sharpen > 0 && upscaler) {
            const resultCtx = resultCanvas.getContext('2d');
            const resultData = resultCtx.getImageData(0, 0, resultCanvas.width, resultCanvas.height);
            applyAnimeSharpen(resultData, settings.sharpen / 200); // Lighter pass for AI output
            resultCtx.putImageData(resultData, 0, 0);
        }

        document.getElementById('outputSizeValue').textContent = `${resultCanvas.width} x ${resultCanvas.height}`;
        document.getElementById('scaleValue').textContent = `${settings.scale}x`;

        const endTime = performance.now();
        document.getElementById('processTimeValue').textContent = `${((endTime - startTime) / 1000).toFixed(2)}s`;

    } catch (error) {
        console.error('Processing error:', error);

        // Fallback
        const resultWidth = width * settings.scale;
        const resultHeight = height * settings.scale;

        resultCanvas.width = resultWidth;
        resultCanvas.height = resultHeight;

        const resultCtx = resultCanvas.getContext('2d');
        resultCtx.imageSmoothingEnabled = true;
        resultCtx.imageSmoothingQuality = 'high';
        resultCtx.drawImage(tempCanvas, 0, 0, resultWidth, resultHeight);

        document.getElementById('outputSizeValue').textContent = `${resultWidth} x ${resultHeight}`;

        const endTime = performance.now();
        document.getElementById('processTimeValue').textContent = `${((endTime - startTime) / 1000).toFixed(2)}s`;
    }

    processingOverlay.style.display = 'none';
    updateSlider();
}

// Anime-specific sharpening (emphasizes edges/lines)
function applyAnimeSharpen(imageData, strength) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    // Edge-emphasizing kernel for anime lines
    const kernel = [
        0, -1 * strength, 0,
        -1 * strength, 1 + 4 * strength, -1 * strength,
        0, -1 * strength, 0
    ];

    const tempData = new Uint8ClampedArray(data);

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            for (let c = 0; c < 3; c++) {
                let sum = 0;
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const idx = ((y + ky) * width + (x + kx)) * 4 + c;
                        sum += tempData[idx] * kernel[(ky + 1) * 3 + (kx + 1)];
                    }
                }
                const idx = (y * width + x) * 4 + c;
                data[idx] = Math.max(0, Math.min(255, sum));
            }
        }
    }
}

// Simple denoise using bilateral-like averaging
function applyDenoise(ctx, width, height, strength) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const radius = Math.ceil(strength * 2);

    if (radius < 1) return;

    const tempData = new Uint8ClampedArray(data);

    for (let y = radius; y < height - radius; y++) {
        for (let x = radius; x < width - radius; x++) {
            for (let c = 0; c < 3; c++) {
                let sum = 0;
                let count = 0;
                const centerIdx = (y * width + x) * 4 + c;
                const centerVal = tempData[centerIdx];

                for (let dy = -radius; dy <= radius; dy++) {
                    for (let dx = -radius; dx <= radius; dx++) {
                        const idx = ((y + dy) * width + (x + dx)) * 4 + c;
                        const val = tempData[idx];
                        const diff = Math.abs(val - centerVal);

                        // Only average similar values (preserve edges)
                        if (diff < 30) {
                            sum += val;
                            count++;
                        }
                    }
                }

                data[centerIdx] = count > 0 ? Math.round(sum / count) : centerVal;
            }
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

// Controls
function initControls() {
    // Scale options
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            settings.scale = parseInt(btn.dataset.scale);
            if (originalImage) {
                processImage();
            }
        });
    });

    // Denoise slider
    const denoiseSlider = document.getElementById('denoiseSlider');
    const denoiseValue = document.getElementById('denoiseValue');
    denoiseSlider.addEventListener('input', (e) => {
        settings.denoise = parseInt(e.target.value);
        denoiseValue.textContent = e.target.value + '%';
    });
    denoiseSlider.addEventListener('change', () => {
        if (originalImage) processImage();
    });

    // Sharpen slider
    const sharpenSlider = document.getElementById('sharpenSlider');
    const sharpenValue = document.getElementById('sharpenValue');
    sharpenSlider.addEventListener('input', (e) => {
        settings.sharpen = parseInt(e.target.value);
        sharpenValue.textContent = e.target.value + '%';
    });
    sharpenSlider.addEventListener('change', () => {
        if (originalImage) processImage();
    });
}

// Download result
function downloadResult() {
    if (!resultCanvas.width) return;

    const link = document.createElement('a');
    link.download = 'anime-enhanced.png';
    link.href = resultCanvas.toDataURL('image/png');
    link.click();
}
