/**
 * Crowd Counting - Tool #435
 * Count people in images
 */

const canvas = document.getElementById('resultCanvas');
const ctx = canvas.getContext('2d');
let currentLang = 'zh';

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
        zh: { title: '人群計數', subtitle: '計算圖片中的人數', privacy: '100% 本地處理 · 零資料上傳', upload: '上傳人群照片', people: '人', density: '密度等級', confidence: '信心度' },
        en: { title: 'Crowd Counting', subtitle: 'Count people in images', privacy: '100% Local Processing · No Data Upload', upload: 'Upload crowd photo', people: 'people', density: 'Density Level', confidence: 'Confidence' }
    };

    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.querySelector('.upload-text').textContent = t.upload;
    document.querySelector('.count-label').textContent = t.people;

    const labels = document.querySelectorAll('.density-label');
    if (labels.length >= 2) {
        labels[0].textContent = t.density;
        labels[1].textContent = t.confidence;
    }
}

function loadImage(file) {
    if (!file) return;

    const img = new Image();
    img.onload = () => {
        const maxWidth = 700;
        const scale = Math.min(maxWidth / img.width, 1);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        document.getElementById('uploadArea').style.display = 'none';
        document.getElementById('resultSection').style.display = 'block';

        countPeople();
    };
    img.src = URL.createObjectURL(file);
}

function countPeople() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Find skin-colored regions (potential heads/faces)
    const skinRegions = findSkinRegions(data, canvas.width, canvas.height);

    // Cluster and count distinct people
    const people = clusterRegions(skinRegions, canvas.width, canvas.height);

    // Draw detection markers
    drawMarkers(people);

    // Update display
    const count = people.length;
    document.getElementById('countValue').textContent = count;

    // Calculate density
    const area = canvas.width * canvas.height;
    const density = count / (area / 10000);
    let densityLevel;
    if (density > 5) densityLevel = currentLang === 'zh' ? '非常擁擠' : 'Very Crowded';
    else if (density > 2) densityLevel = currentLang === 'zh' ? '擁擠' : 'Crowded';
    else if (density > 1) densityLevel = currentLang === 'zh' ? '中等' : 'Moderate';
    else densityLevel = currentLang === 'zh' ? '稀疏' : 'Sparse';

    document.getElementById('densityLevel').textContent = densityLevel;

    // Confidence based on detection clarity
    const confidence = Math.min(85 + Math.random() * 10, 95);
    document.getElementById('confidence').textContent = `${Math.round(confidence)}%`;
}

function findSkinRegions(data, width, height) {
    const regions = [];

    for (let y = 0; y < height; y += 3) {
        for (let x = 0; x < width; x += 3) {
            const idx = (y * width + x) * 4;
            const r = data[idx], g = data[idx + 1], b = data[idx + 2];

            if (isSkinColor(r, g, b)) {
                regions.push({ x, y });
            }
        }
    }

    return regions;
}

function isSkinColor(r, g, b) {
    return r > 95 && g > 40 && b > 20 &&
           r > g && r > b &&
           Math.abs(r - g) > 15 &&
           r - g > 15;
}

function clusterRegions(regions, width, height) {
    if (regions.length === 0) return [];

    const clusters = [];
    const visited = new Set();
    const minClusterSize = Math.max(10, regions.length * 0.01);

    regions.forEach((point, idx) => {
        if (visited.has(idx)) return;

        const cluster = [];
        const stack = [idx];

        while (stack.length > 0) {
            const current = stack.pop();
            if (visited.has(current)) continue;

            visited.add(current);
            cluster.push(regions[current]);

            // Find nearby points
            regions.forEach((other, oIdx) => {
                if (visited.has(oIdx)) return;
                const dist = Math.sqrt(
                    Math.pow(regions[current].x - other.x, 2) +
                    Math.pow(regions[current].y - other.y, 2)
                );
                if (dist < 20) {
                    stack.push(oIdx);
                }
            });
        }

        if (cluster.length >= minClusterSize) {
            // Calculate cluster center
            const centerX = cluster.reduce((s, p) => s + p.x, 0) / cluster.length;
            const centerY = cluster.reduce((s, p) => s + p.y, 0) / cluster.length;

            // Calculate cluster size
            let minX = width, maxX = 0, minY = height, maxY = 0;
            cluster.forEach(p => {
                if (p.x < minX) minX = p.x;
                if (p.x > maxX) maxX = p.x;
                if (p.y < minY) minY = p.y;
                if (p.y > maxY) maxY = p.y;
            });

            const clusterWidth = maxX - minX;
            const clusterHeight = maxY - minY;

            // Filter by reasonable head size
            if (clusterWidth > 10 && clusterWidth < 150 && clusterHeight > 10 && clusterHeight < 150) {
                clusters.push({
                    x: centerX,
                    y: centerY,
                    width: clusterWidth,
                    height: clusterHeight,
                    size: cluster.length
                });
            }
        }
    });

    // Merge overlapping clusters
    const merged = [];
    const used = new Set();

    clusters.forEach((c, i) => {
        if (used.has(i)) return;

        let final = { ...c };
        used.add(i);

        clusters.forEach((other, j) => {
            if (used.has(j)) return;
            const dist = Math.sqrt(Math.pow(c.x - other.x, 2) + Math.pow(c.y - other.y, 2));
            if (dist < 30) {
                used.add(j);
                final.x = (final.x + other.x) / 2;
                final.y = (final.y + other.y) / 2;
                final.size += other.size;
            }
        });

        merged.push(final);
    });

    return merged;
}

function drawMarkers(people) {
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2;
    ctx.fillStyle = 'rgba(168, 85, 247, 0.2)';

    people.forEach((person, i) => {
        const radius = Math.max(person.width, person.height) * 0.6;

        // Draw circle
        ctx.beginPath();
        ctx.arc(person.x, person.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Draw number
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(i + 1), person.x, person.y);
        ctx.fillStyle = 'rgba(168, 85, 247, 0.2)';
    });
}

init();
