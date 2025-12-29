/**
 * Face Clustering - Tool #416
 * Group similar faces together
 */

let photos = [];
let currentLang = 'zh';

const clusterColors = ['#8b5cf6', '#ec4899', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16'];

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));

    document.getElementById('uploadArea').addEventListener('click', () => document.getElementById('imageInput').click());
    document.getElementById('imageInput').addEventListener('change', handleFileUpload);
    document.getElementById('clusterBtn').addEventListener('click', performClustering);
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');

    const texts = {
        zh: { title: '人臉聚類', subtitle: '將相似的人臉分組', privacy: '100% 本地處理 · 零資料上傳', upload: '上傳多張人臉照片', uploaded: '已上傳照片', cluster: '開始聚類', results: '聚類結果' },
        en: { title: 'Face Clustering', subtitle: 'Group similar faces together', privacy: '100% Local Processing · No Data Upload', upload: 'Upload multiple face photos', uploaded: 'Uploaded Photos', cluster: 'Start Clustering', results: 'Clustering Results' }
    };

    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.querySelector('.upload-text').textContent = t.upload;
    document.getElementById('clusterBtn').textContent = t.cluster;
    document.querySelector('.result-section h3').textContent = t.results;
    updatePhotoCount();
}

function handleFileUpload(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = 100;
                canvas.height = 100;

                const scale = Math.max(100 / img.width, 100 / img.height);
                const w = img.width * scale;
                const h = img.height * scale;
                ctx.drawImage(img, (100 - w) / 2, (100 - h) / 2, w, h);

                const features = extractFeatures(canvas);

                photos.push({
                    id: Date.now() + Math.random(),
                    dataUrl: event.target.result,
                    features
                });

                updatePhotoGrid();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function extractFeatures(canvas) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const features = [];

    // Color histogram (8 bins per channel = 24 features)
    const colorBins = 8;
    for (let c = 0; c < 3; c++) {
        const hist = new Array(colorBins).fill(0);
        for (let i = c; i < data.length; i += 4) {
            hist[Math.floor(data[i] / 32)]++;
        }
        const total = data.length / 4;
        for (let i = 0; i < colorBins; i++) {
            features.push(hist[i] / total);
        }
    }

    // Region intensities (4x4 = 16 features)
    const regionSize = canvas.width / 4;
    for (let ry = 0; ry < 4; ry++) {
        for (let rx = 0; rx < 4; rx++) {
            let sum = 0;
            let count = 0;
            for (let y = ry * regionSize; y < (ry + 1) * regionSize; y++) {
                for (let x = rx * regionSize; x < (rx + 1) * regionSize; x++) {
                    const idx = (Math.floor(y) * canvas.width + Math.floor(x)) * 4;
                    sum += (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                    count++;
                }
            }
            features.push(sum / count / 255);
        }
    }

    return features;
}

function updatePhotoGrid() {
    document.getElementById('previewSection').style.display = 'block';
    updatePhotoCount();

    const grid = document.getElementById('photoGrid');
    grid.innerHTML = photos.map(photo => `
        <div class="photo-item">
            <img src="${photo.dataUrl}" alt="Face">
            <button class="remove-btn" onclick="removePhoto('${photo.id}')">×</button>
        </div>
    `).join('');
}

function updatePhotoCount() {
    const label = currentLang === 'zh' ? '已上傳照片' : 'Uploaded Photos';
    document.querySelector('.preview-section h3').innerHTML = `${label} (<span id="photoCount">${photos.length}</span>)`;
}

function removePhoto(id) {
    photos = photos.filter(p => p.id != id);
    updatePhotoGrid();
    if (photos.length === 0) {
        document.getElementById('previewSection').style.display = 'none';
    }
}

function performClustering() {
    if (photos.length < 2) {
        alert(currentLang === 'zh' ? '請至少上傳 2 張照片' : 'Please upload at least 2 photos');
        return;
    }

    const btn = document.getElementById('clusterBtn');
    btn.disabled = true;
    btn.textContent = currentLang === 'zh' ? '分析中...' : 'Analyzing...';

    setTimeout(() => {
        const clusters = kMeansClustering(photos, Math.min(Math.ceil(photos.length / 2), 5));
        displayClusters(clusters);

        btn.disabled = false;
        btn.textContent = currentLang === 'zh' ? '開始聚類' : 'Start Clustering';
    }, 500);
}

function kMeansClustering(items, k) {
    const n = items.length;
    const featureLen = items[0].features.length;

    // Initialize centroids randomly
    const centroids = [];
    const used = new Set();
    while (centroids.length < k) {
        const idx = Math.floor(Math.random() * n);
        if (!used.has(idx)) {
            used.add(idx);
            centroids.push([...items[idx].features]);
        }
    }

    let assignments = new Array(n).fill(0);
    let iterations = 0;
    const maxIterations = 20;

    while (iterations < maxIterations) {
        // Assign each item to nearest centroid
        const newAssignments = items.map(item => {
            let minDist = Infinity;
            let minIdx = 0;
            for (let c = 0; c < k; c++) {
                const dist = euclideanDistance(item.features, centroids[c]);
                if (dist < minDist) {
                    minDist = dist;
                    minIdx = c;
                }
            }
            return minIdx;
        });

        // Check convergence
        let changed = false;
        for (let i = 0; i < n; i++) {
            if (newAssignments[i] !== assignments[i]) {
                changed = true;
                break;
            }
        }

        assignments = newAssignments;

        if (!changed) break;

        // Update centroids
        for (let c = 0; c < k; c++) {
            const clusterItems = items.filter((_, i) => assignments[i] === c);
            if (clusterItems.length > 0) {
                for (let f = 0; f < featureLen; f++) {
                    centroids[c][f] = clusterItems.reduce((sum, item) => sum + item.features[f], 0) / clusterItems.length;
                }
            }
        }

        iterations++;
    }

    // Group items by cluster
    const clusters = [];
    for (let c = 0; c < k; c++) {
        const clusterItems = items.filter((_, i) => assignments[i] === c);
        if (clusterItems.length > 0) {
            clusters.push({
                id: c,
                items: clusterItems
            });
        }
    }

    return clusters;
}

function euclideanDistance(a, b) {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
        sum += (a[i] - b[i]) ** 2;
    }
    return Math.sqrt(sum);
}

function displayClusters(clusters) {
    document.getElementById('resultSection').style.display = 'block';

    const clustersEl = document.getElementById('clusters');
    clustersEl.innerHTML = clusters.map((cluster, idx) => {
        const color = clusterColors[idx % clusterColors.length];
        const name = currentLang === 'zh' ? `群組 ${idx + 1}` : `Group ${idx + 1}`;
        const count = currentLang === 'zh' ? `${cluster.items.length} 張照片` : `${cluster.items.length} photos`;

        return `
            <div class="cluster">
                <div class="cluster-header">
                    <div class="cluster-color" style="background: ${color}"></div>
                    <span class="cluster-name">${name}</span>
                    <span class="cluster-count">${count}</span>
                </div>
                <div class="cluster-faces">
                    ${cluster.items.map(item => `
                        <div class="cluster-face">
                            <img src="${item.dataUrl}" alt="Face">
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
}

init();
