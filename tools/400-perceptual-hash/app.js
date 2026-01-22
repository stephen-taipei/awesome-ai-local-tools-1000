/**
 * Perceptual Hash - Tool #400
 * Calculate perceptual hash for video similarity matching
 */

let currentLang = 'zh';
let video1File = null;
let video2File = null;
let hash1 = '';
let hash2 = '';

const texts = {
    zh: {
        title: '影片感知雜湊',
        subtitle: '計算感知雜湊以進行相似度比對',
        privacy: '100% 本地處理 · 零資料上傳',
        uploadA: '上傳影片 A',
        uploadB: '上傳影片 B (可選)',
        uploadHintA: '支援 MP4, WebM',
        uploadHintB: '用於比較',
        samples: '取樣幀數',
        hashSize: '雜湊大小',
        calculate: '🔢 計算雜湊',
        processing: '處理中...',
        complete: '完成！',
        similarityTitle: '相似度分析',
        copy: '📋 複製雜湊',
        export: '📄 匯出報告',
        copied: '已複製！',
        identical: '幾乎相同的影片',
        verySimilar: '非常相似',
        similar: '相似',
        somewhatSimilar: '有些相似',
        different: '不同的影片'
    },
    en: {
        title: 'Perceptual Hash',
        subtitle: 'Calculate perceptual hash for similarity matching',
        privacy: '100% Local Processing · No Data Upload',
        uploadA: 'Upload Video A',
        uploadB: 'Upload Video B (optional)',
        uploadHintA: 'Supports MP4, WebM',
        uploadHintB: 'For comparison',
        samples: 'Sample Frames',
        hashSize: 'Hash Size',
        calculate: '🔢 Calculate Hash',
        processing: 'Processing...',
        complete: 'Complete!',
        similarityTitle: 'Similarity Analysis',
        copy: '📋 Copy Hash',
        export: '📄 Export Report',
        copied: 'Copied!',
        identical: 'Nearly identical videos',
        verySimilar: 'Very similar',
        similar: 'Similar',
        somewhatSimilar: 'Somewhat similar',
        different: 'Different videos'
    }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    setupFileUpload();
    setupControls();
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');
    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.getElementById('uploadText1').textContent = t.uploadA;
    document.getElementById('uploadText2').textContent = t.uploadB;
    document.getElementById('samplesLabel').textContent = t.samples;
    document.getElementById('hashSizeLabel').textContent = t.hashSize;
    document.getElementById('calculateBtn').textContent = t.calculate;
    document.getElementById('similarityTitle').textContent = t.similarityTitle;
    document.getElementById('copyBtn').textContent = t.copy;
    document.getElementById('exportBtn').textContent = t.export;
}

function setupFileUpload() {
    setupSingleUpload('uploadArea1', 'fileInput1', 1);
    setupSingleUpload('uploadArea2', 'fileInput2', 2);
}

function setupSingleUpload(areaId, inputId, num) {
    const uploadArea = document.getElementById(areaId);
    const fileInput = document.getElementById(inputId);

    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', (e) => e.preventDefault());
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0], num);
    });
    fileInput.addEventListener('change', (e) => { if (e.target.files.length) handleFile(e.target.files[0], num); });
}

function setupControls() {
    document.getElementById('sampleFrames').addEventListener('input', (e) => {
        document.getElementById('samplesValue').textContent = e.target.value;
    });

    document.getElementById('calculateBtn').addEventListener('click', calculateHashes);
    document.getElementById('copyBtn').addEventListener('click', copyHashes);
    document.getElementById('exportBtn').addEventListener('click', exportReport);
}

function handleFile(file, num) {
    if (num === 1) {
        video1File = file;
        document.getElementById('uploadArea1').classList.add('uploaded');
        document.getElementById('uploadArea1').innerHTML = `<div class="upload-icon">✅</div><p>${file.name}</p>`;
    } else {
        video2File = file;
        document.getElementById('uploadArea2').classList.add('uploaded');
        document.getElementById('uploadArea2').innerHTML = `<div class="upload-icon">✅</div><p>${file.name}</p>`;
    }

    if (video1File) {
        document.getElementById('editorContent').style.display = 'block';
    }
}

async function calculateHashes() {
    const t = texts[currentLang];
    const sampleFrames = parseInt(document.getElementById('sampleFrames').value);
    const hashSize = parseInt(document.getElementById('hashSize').value);

    document.getElementById('calculateBtn').disabled = true;
    document.getElementById('progressSection').style.display = 'block';
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('exportSection').style.display = 'none';

    // Calculate hash for video 1
    hash1 = await calculatePHash(video1File, sampleFrames, hashSize, 0, video2File ? 50 : 100);
    displayHash(1, hash1, hashSize);

    // Calculate hash for video 2 if provided
    if (video2File) {
        hash2 = await calculatePHash(video2File, sampleFrames, hashSize, 50, 100);
        displayHash(2, hash2, hashSize);
        document.getElementById('hash2Result').style.display = 'block';

        // Calculate similarity
        const similarity = calculateSimilarity(hash1, hash2);
        displaySimilarity(similarity);
        document.getElementById('similarityResult').style.display = 'block';
    }

    document.getElementById('progressSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'grid';
    document.getElementById('exportSection').style.display = 'flex';
    document.getElementById('calculateBtn').disabled = false;
}

async function calculatePHash(file, sampleFrames, hashSize, progressStart, progressEnd) {
    const t = texts[currentLang];
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    video.muted = true;

    await new Promise(resolve => {
        video.onloadedmetadata = resolve;
    });

    const duration = video.duration;
    const frameHashes = [];

    for (let i = 0; i < sampleFrames; i++) {
        const time = (i / sampleFrames) * duration;
        video.currentTime = time;

        await new Promise(resolve => {
            video.onseeked = resolve;
        });

        const frameHash = calculateFramePHash(video, hashSize);
        frameHashes.push(frameHash);

        const progress = progressStart + ((i + 1) / sampleFrames) * (progressEnd - progressStart);
        document.getElementById('progressFill').style.width = progress + '%';
        document.getElementById('progressText').textContent = `${t.processing} ${Math.round(progress)}%`;
    }

    // Combine frame hashes
    return combineHashes(frameHashes);
}

function calculateFramePHash(video, size) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Draw video frame to small canvas (grayscale)
    ctx.filter = 'grayscale(1)';
    ctx.drawImage(video, 0, 0, size, size);

    // Get pixel data
    const imageData = ctx.getImageData(0, 0, size, size);
    const pixels = imageData.data;

    // Calculate average
    let sum = 0;
    const grayValues = [];
    for (let i = 0; i < pixels.length; i += 4) {
        const gray = pixels[i]; // Already grayscale, R=G=B
        grayValues.push(gray);
        sum += gray;
    }
    const avg = sum / grayValues.length;

    // Generate binary hash
    let hash = '';
    for (const gray of grayValues) {
        hash += gray > avg ? '1' : '0';
    }

    return hash;
}

function combineHashes(frameHashes) {
    // XOR all frame hashes together
    if (frameHashes.length === 0) return '';

    let combined = frameHashes[0];
    for (let i = 1; i < frameHashes.length; i++) {
        let newCombined = '';
        for (let j = 0; j < combined.length; j++) {
            newCombined += combined[j] === frameHashes[i][j] ? '0' : '1';
        }
        combined = newCombined;
    }

    // Convert to hex
    let hex = '';
    for (let i = 0; i < combined.length; i += 4) {
        const chunk = combined.substr(i, 4);
        hex += parseInt(chunk, 2).toString(16);
    }

    return hex;
}

function displayHash(num, hash, size) {
    // Create visual preview
    const preview = document.getElementById(`preview${num}`);
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Convert hex back to binary for visualization
    let binary = '';
    for (const char of hash) {
        binary += parseInt(char, 16).toString(2).padStart(4, '0');
    }

    // Draw hash visualization
    const pixelSize = Math.max(1, Math.floor(100 / size));
    canvas.width = size * pixelSize;
    canvas.height = size * pixelSize;

    for (let i = 0; i < binary.length && i < size * size; i++) {
        const x = (i % size) * pixelSize;
        const y = Math.floor(i / size) * pixelSize;
        ctx.fillStyle = binary[i] === '1' ? '#a855f7' : '#1e293b';
        ctx.fillRect(x, y, pixelSize, pixelSize);
    }

    preview.innerHTML = '';
    preview.appendChild(canvas);

    // Display hash value
    document.getElementById(`hashValue${num}`).textContent = hash;
}

function calculateSimilarity(hash1, hash2) {
    if (hash1.length !== hash2.length) return 0;

    // Convert to binary
    let binary1 = '', binary2 = '';
    for (let i = 0; i < hash1.length; i++) {
        binary1 += parseInt(hash1[i], 16).toString(2).padStart(4, '0');
        binary2 += parseInt(hash2[i], 16).toString(2).padStart(4, '0');
    }

    // Calculate Hamming distance
    let matching = 0;
    for (let i = 0; i < binary1.length; i++) {
        if (binary1[i] === binary2[i]) matching++;
    }

    return matching / binary1.length;
}

function displaySimilarity(similarity) {
    const t = texts[currentLang];
    const percent = Math.round(similarity * 100);

    document.getElementById('similarityFill').style.width = percent + '%';
    document.getElementById('similarityValue').textContent = percent + '%';

    let desc;
    if (percent >= 95) desc = t.identical;
    else if (percent >= 85) desc = t.verySimilar;
    else if (percent >= 70) desc = t.similar;
    else if (percent >= 50) desc = t.somewhatSimilar;
    else desc = t.different;

    document.getElementById('similarityDesc').textContent = desc;
}

function copyHashes() {
    const t = texts[currentLang];
    let text = `Video A: ${hash1}`;
    if (hash2) {
        text += `\nVideo B: ${hash2}`;
        text += `\nSimilarity: ${document.getElementById('similarityValue').textContent}`;
    }

    navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById('copyBtn');
        btn.textContent = t.copied;
        setTimeout(() => btn.textContent = t.copy, 2000);
    });
}

function exportReport() {
    const report = {
        video1: {
            name: video1File.name,
            size: video1File.size,
            hash: hash1
        },
        timestamp: new Date().toISOString()
    };

    if (video2File && hash2) {
        report.video2 = {
            name: video2File.name,
            size: video2File.size,
            hash: hash2
        };
        report.similarity = document.getElementById('similarityValue').textContent;
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `phash-report-${Date.now()}.json`;
    a.click();
}

init();
