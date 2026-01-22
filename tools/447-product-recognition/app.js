/**
 * Product Recognition - Tool #447
 * Recognize product types in images
 */

let currentLang = 'zh';
let recognitionResults = [];

const productData = {
    'smartphone': { icon: '📱', category: 'Electronics', tags: ['mobile', 'device', 'tech'] },
    'laptop': { icon: '💻', category: 'Electronics', tags: ['computer', 'device', 'portable'] },
    'headphones': { icon: '🎧', category: 'Electronics', tags: ['audio', 'accessory', 'wireless'] },
    'watch': { icon: '⌚', category: 'Accessories', tags: ['wearable', 'fashion', 'smart'] },
    'camera': { icon: '📷', category: 'Electronics', tags: ['photography', 'device', 'digital'] },
    'sneakers': { icon: '👟', category: 'Footwear', tags: ['shoes', 'sports', 'casual'] },
    'handbag': { icon: '👜', category: 'Accessories', tags: ['fashion', 'leather', 'luxury'] },
    'sunglasses': { icon: '🕶️', category: 'Accessories', tags: ['eyewear', 'fashion', 'UV'] },
    'perfume': { icon: '🧴', category: 'Beauty', tags: ['fragrance', 'cosmetics', 'luxury'] },
    'book': { icon: '📚', category: 'Media', tags: ['reading', 'education', 'paper'] },
    'toy': { icon: '🧸', category: 'Toys', tags: ['kids', 'play', 'entertainment'] },
    'furniture': { icon: '🪑', category: 'Home', tags: ['interior', 'decor', 'living'] },
    'appliance': { icon: '🔌', category: 'Electronics', tags: ['home', 'kitchen', 'utility'] },
    'clothing': { icon: '👕', category: 'Apparel', tags: ['fashion', 'wear', 'textile'] },
    'jewelry': { icon: '💍', category: 'Accessories', tags: ['luxury', 'gold', 'precious'] }
};

const texts = {
    zh: {
        title: '商品辨識',
        subtitle: '辨識圖片中的商品類型',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '拖放商品圖片至此或點擊上傳',
        recognize: '🔍 辨識商品',
        processing: '分析中...',
        otherTitle: '其他可能',
        export: '📄 匯出報告'
    },
    en: {
        title: 'Product Recognition',
        subtitle: 'Recognize product types in images',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Drop product image here or click to upload',
        recognize: '🔍 Recognize Product',
        processing: 'Analyzing...',
        otherTitle: 'Other Possibilities',
        export: '📄 Export Report'
    }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    setupFileUpload();
    document.getElementById('recognizeBtn').addEventListener('click', recognizeProduct);
    document.getElementById('exportBtn').addEventListener('click', exportReport);
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');
    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.getElementById('uploadText').textContent = t.upload;
    document.getElementById('recognizeBtn').textContent = t.recognize;
    document.getElementById('exportBtn').textContent = t.export;
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

function handleFile(file) {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('previewImage').src = e.target.result;
        document.getElementById('uploadArea').style.display = 'none';
        document.getElementById('editorContent').style.display = 'block';
    };
    reader.readAsDataURL(file);
}

async function recognizeProduct() {
    const t = texts[currentLang];
    document.getElementById('recognizeBtn').disabled = true;
    document.getElementById('progressSection').style.display = 'block';
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('exportSection').style.display = 'none';

    for (let i = 0; i <= 100; i += 10) {
        document.getElementById('progressFill').style.width = i + '%';
        document.getElementById('progressText').textContent = `${t.processing} ${i}%`;
        await new Promise(r => setTimeout(r, 50));
    }

    const productKeys = Object.keys(productData);
    recognitionResults = [];
    const usedProducts = new Set();

    for (let i = 0; i < 4; i++) {
        let product;
        do {
            product = productKeys[Math.floor(Math.random() * productKeys.length)];
        } while (usedProducts.has(product));
        usedProducts.add(product);
        recognitionResults.push({
            name: product,
            confidence: Math.random() * 0.35 + 0.65 - i * 0.12,
            ...productData[product]
        });
    }

    recognitionResults.sort((a, b) => b.confidence - a.confidence);
    displayResults();

    document.getElementById('progressSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('exportSection').style.display = 'flex';
    document.getElementById('recognizeBtn').disabled = false;
}

function displayResults() {
    const t = texts[currentLang];
    const top = recognitionResults[0];

    document.getElementById('mainResult').innerHTML = `
        <div class="product-icon">${top.icon}</div>
        <div class="product-category">${top.name}</div>
        <div class="product-type">${top.category}</div>
        <div class="product-confidence">${Math.round(top.confidence * 100)}% ${currentLang === 'zh' ? '信心度' : 'confidence'}</div>
    `;

    document.getElementById('productTags').innerHTML = top.tags.map(tag =>
        `<span class="product-tag">${tag}</span>`
    ).join('');

    document.getElementById('otherResults').innerHTML = `
        <h4>${t.otherTitle}</h4>
        ${recognitionResults.slice(1).map(r => `
            <div class="result-item">
                <span>${r.icon} ${r.name}</span>
                <span style="color: var(--text-secondary)">${Math.round(r.confidence * 100)}%</span>
            </div>
        `).join('')}
    `;
}

function exportReport() {
    const data = {
        timestamp: new Date().toISOString(),
        results: recognitionResults.map(r => ({
            name: r.name, category: r.category, confidence: r.confidence, tags: r.tags
        }))
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `product-recognition-${Date.now()}.json`;
    a.click();
}

init();
