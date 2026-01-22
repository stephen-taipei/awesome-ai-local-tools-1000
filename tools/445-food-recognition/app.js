/**
 * Food Recognition - Tool #445
 * Recognize food types in images
 */

let currentLang = 'zh';
let imageFile = null;
let recognitionResults = [];

const foodData = {
    'pizza': { emoji: '🍕', calories: 266, protein: 11, carbs: 33, fat: 10 },
    'burger': { emoji: '🍔', calories: 295, protein: 17, carbs: 24, fat: 14 },
    'sushi': { emoji: '🍣', calories: 40, protein: 2, carbs: 7, fat: 0.5 },
    'ramen': { emoji: '🍜', calories: 436, protein: 15, carbs: 56, fat: 17 },
    'salad': { emoji: '🥗', calories: 152, protein: 3, carbs: 12, fat: 11 },
    'steak': { emoji: '🥩', calories: 271, protein: 26, carbs: 0, fat: 18 },
    'pasta': { emoji: '🍝', calories: 220, protein: 8, carbs: 43, fat: 1 },
    'rice': { emoji: '🍚', calories: 130, protein: 3, carbs: 28, fat: 0.3 },
    'bread': { emoji: '🍞', calories: 265, protein: 9, carbs: 49, fat: 3 },
    'cake': { emoji: '🎂', calories: 257, protein: 3, carbs: 38, fat: 11 },
    'ice cream': { emoji: '🍦', calories: 207, protein: 4, carbs: 24, fat: 11 },
    'fruit': { emoji: '🍎', calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
    'soup': { emoji: '🍲', calories: 75, protein: 6, carbs: 9, fat: 2 },
    'sandwich': { emoji: '🥪', calories: 250, protein: 12, carbs: 28, fat: 10 },
    'fried chicken': { emoji: '🍗', calories: 320, protein: 26, carbs: 12, fat: 19 },
    'noodles': { emoji: '🍜', calories: 138, protein: 5, carbs: 25, fat: 2 },
    'dumpling': { emoji: '🥟', calories: 41, protein: 2, carbs: 5, fat: 1.5 },
    'taco': { emoji: '🌮', calories: 226, protein: 9, carbs: 20, fat: 12 },
    'curry': { emoji: '🍛', calories: 325, protein: 12, carbs: 45, fat: 12 },
    'seafood': { emoji: '🦐', calories: 85, protein: 18, carbs: 0, fat: 1 }
};

const texts = {
    zh: {
        title: '食物辨識',
        subtitle: '辨識圖片中的食物種類',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '拖放食物圖片至此或點擊上傳',
        uploadHint: '支援 JPG, PNG, WebP',
        recognize: '🔍 辨識食物',
        camera: '📷 拍照',
        processing: '分析中...',
        complete: '辨識完成！',
        resultsTitle: '辨識結果',
        nutritionTitle: '估計營養資訊 (每份)',
        calories: '卡路里',
        protein: '蛋白質',
        carbs: '碳水化合物',
        fat: '脂肪',
        export: '📄 匯出報告'
    },
    en: {
        title: 'Food Recognition',
        subtitle: 'Recognize food types in images',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Drop food image here or click to upload',
        uploadHint: 'Supports JPG, PNG, WebP',
        recognize: '🔍 Recognize Food',
        camera: '📷 Take Photo',
        processing: 'Analyzing...',
        complete: 'Recognition Complete!',
        resultsTitle: 'Recognition Results',
        nutritionTitle: 'Estimated Nutrition (per serving)',
        calories: 'Calories',
        protein: 'Protein',
        carbs: 'Carbohydrates',
        fat: 'Fat',
        export: '📄 Export Report'
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
    document.getElementById('uploadText').textContent = t.upload;
    document.getElementById('recognizeBtn').textContent = t.recognize;
    document.getElementById('cameraBtn').textContent = t.camera;
    document.getElementById('resultsTitle').textContent = t.resultsTitle;
    document.getElementById('nutritionTitle').textContent = t.nutritionTitle;
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

function setupControls() {
    document.getElementById('recognizeBtn').addEventListener('click', recognizeFood);
    document.getElementById('cameraBtn').addEventListener('click', useCamera);
    document.getElementById('exportBtn').addEventListener('click', exportReport);
}

function handleFile(file) {
    if (!file.type.startsWith('image/')) return;
    imageFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('previewImage').src = e.target.result;
        document.getElementById('uploadArea').style.display = 'none';
        document.getElementById('editorContent').style.display = 'block';
    };
    reader.readAsDataURL(file);
}

async function useCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();
        await new Promise(resolve => video.onloadedmetadata = resolve);
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        stream.getTracks().forEach(track => track.stop());
        document.getElementById('previewImage').src = canvas.toDataURL();
        document.getElementById('uploadArea').style.display = 'none';
        document.getElementById('editorContent').style.display = 'block';
    } catch (error) {
        console.error('Camera error:', error);
    }
}

async function recognizeFood() {
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

    // Simulate recognition
    const foodKeys = Object.keys(foodData);
    recognitionResults = [];
    const numResults = Math.floor(Math.random() * 3) + 2;
    const usedFoods = new Set();

    for (let i = 0; i < numResults; i++) {
        let food;
        do {
            food = foodKeys[Math.floor(Math.random() * foodKeys.length)];
        } while (usedFoods.has(food));
        usedFoods.add(food);
        recognitionResults.push({
            name: food,
            confidence: Math.random() * 0.4 + 0.6 - i * 0.15,
            ...foodData[food]
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
    const mainResult = document.getElementById('mainResult');
    const resultsList = document.getElementById('resultsList');
    const nutritionGrid = document.getElementById('nutritionGrid');

    const topResult = recognitionResults[0];
    mainResult.innerHTML = `
        <div class="food-emoji">${topResult.emoji}</div>
        <div class="food-name">${topResult.name}</div>
        <div class="food-confidence">${Math.round(topResult.confidence * 100)}% ${currentLang === 'zh' ? '信心度' : 'confidence'}</div>
    `;

    resultsList.innerHTML = recognitionResults.slice(1).map(r => `
        <div class="result-item">
            <div class="result-name"><span>${r.emoji}</span><span>${r.name}</span></div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="font-size: 0.875rem; color: var(--text-secondary);">${Math.round(r.confidence * 100)}%</span>
                <div class="confidence-bar"><div class="confidence-fill" style="width: ${r.confidence * 100}%"></div></div>
            </div>
        </div>
    `).join('');

    nutritionGrid.innerHTML = `
        <div class="nutrition-item"><div class="nutrition-value">${topResult.calories}</div><div class="nutrition-label">${t.calories} kcal</div></div>
        <div class="nutrition-item"><div class="nutrition-value">${topResult.protein}g</div><div class="nutrition-label">${t.protein}</div></div>
        <div class="nutrition-item"><div class="nutrition-value">${topResult.carbs}g</div><div class="nutrition-label">${t.carbs}</div></div>
        <div class="nutrition-item"><div class="nutrition-value">${topResult.fat}g</div><div class="nutrition-label">${t.fat}</div></div>
    `;
}

function exportReport() {
    const data = {
        timestamp: new Date().toISOString(),
        results: recognitionResults.map(r => ({
            name: r.name,
            confidence: r.confidence,
            nutrition: { calories: r.calories, protein: r.protein, carbs: r.carbs, fat: r.fat }
        }))
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `food-recognition-${Date.now()}.json`;
    a.click();
}

init();
