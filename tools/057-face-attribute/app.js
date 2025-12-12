/**
 * Face Attribute Analysis
 * Tool #057 - Awesome AI Local Tools
 *
 * Uses face-api.js for detecting age, gender, and expressions.
 */

const translations = {
    'zh-TW': {
        title: '人臉屬性分析',
        subtitle: '分析人臉屬性（年齡、性別、情緒），完全本地運算',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        loadingModels: '載入模型中...',
        modelsReady: '模型已就緒',
        uploadText: '上傳照片',
        uploadHint: '請確保照片中包含清晰的人臉',
        newImage: '選擇新圖片',
        detecting: '正在分析...',
        noFace: '未偵測到人臉',
        age: '年齡',
        gender: '性別',
        male: '男性',
        female: '女性',
        expression: '表情',
        neutral: '中性',
        happy: '快樂',
        sad: '悲傷',
        angry: '生氣',
        fearful: '恐懼',
        disgusted: '厭惡',
        surprised: '驚訝',
        useCases: '使用場景',
        useCaseDemographics: '客群分析',
        useCaseEmotion: '情緒辨識研究',
        useCaseFun: '趣味年齡測試',
        backToHome: '返回首頁',
        toolNumber: '工具 #057',
        copyright: 'Awesome AI Local Tools © 2024'
    },
    'en': {
        title: 'Face Attribute Analysis',
        subtitle: 'Analyze age, gender, and expressions locally',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        loadingModels: 'Loading models...',
        modelsReady: 'Models ready',
        uploadText: 'Upload Photo',
        uploadHint: 'Ensure clear faces in the photo',
        newImage: 'New Image',
        detecting: 'Analyzing...',
        noFace: 'No face detected',
        age: 'Age',
        gender: 'Gender',
        male: 'Male',
        female: 'Female',
        expression: 'Expression',
        neutral: 'Neutral',
        happy: 'Happy',
        sad: 'Sad',
        angry: 'Angry',
        fearful: 'Fearful',
        disgusted: 'Disgusted',
        surprised: 'Surprised',
        useCases: 'Use Cases',
        useCaseDemographics: 'Demographics',
        useCaseEmotion: 'Emotion Research',
        useCaseFun: 'Fun Age Test',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #057',
        copyright: 'Awesome AI Local Tools © 2024'
    }
};

let currentLang = 'zh-TW';
let modelsLoaded = false;

document.addEventListener('DOMContentLoaded', () => {
    initLanguage();
    initEventListeners();
    loadModels();
});

function initLanguage() {
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && translations[savedLang]) {
        currentLang = savedLang;
    }
    updateLanguage();
}

function updateLanguage() {
    const t = translations[currentLang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.textContent = t[key];
    });

    const langZhBtn = document.getElementById('lang-zh');
    const langEnBtn = document.getElementById('lang-en');

    if (currentLang === 'zh-TW') {
        langZhBtn.classList.add('active');
        langEnBtn.classList.remove('active');
    } else {
        langEnBtn.classList.add('active');
        langZhBtn.classList.remove('active');
    }
    localStorage.setItem('preferredLanguage', currentLang);
}

function initEventListeners() {
    document.getElementById('lang-zh').addEventListener('click', () => { currentLang = 'zh-TW'; updateLanguage(); });
    document.getElementById('lang-en').addEventListener('click', () => { currentLang = 'en'; updateLanguage(); });

    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('dragover'); });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        if (e.dataTransfer.files.length) processFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', (e) => { if (e.target.files.length) processFile(e.target.files[0]); });

    document.getElementById('newImageBtn').addEventListener('click', () => location.reload());
}

async function loadModels() {
    const MODEL_URL = '../../assets/models/face-api';
    try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL);
        await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);

        modelsLoaded = true;
        document.getElementById('statusText').textContent = translations[currentLang].modelsReady;
        document.getElementById('statusIndicator').classList.add('ready');
    } catch (e) {
        console.error("Error loading models", e);
        document.getElementById('statusText').textContent = "Error loading models";
    }
}

function processFile(file) {
    if (!modelsLoaded) return alert('Models not loaded yet');
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        const img = document.getElementById('image');
        img.src = e.target.result;

        document.getElementById('uploadArea').style.display = 'none';
        document.getElementById('resultArea').style.display = 'block';
        document.getElementById('statusText').textContent = translations[currentLang].detecting;

        // Wait for image to load
        await new Promise(resolve => img.onload = resolve);
        detectFaces();
    };
    reader.readAsDataURL(file);
}

async function detectFaces() {
    const img = document.getElementById('image');
    const canvas = document.getElementById('overlay');
    const t = translations[currentLang];

    // Detect
    const detections = await faceapi.detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions()
        .withAgeAndGender();

    // Resize canvas
    const displaySize = { width: img.width, height: img.height };
    faceapi.matchDimensions(canvas, displaySize);

    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    faceapi.draw.drawDetections(canvas, resizedDetections);

    // Display results
    const list = document.getElementById('attributesList');
    list.innerHTML = '';

    if (resizedDetections.length === 0) {
        list.innerHTML = `<p>${t.noFace}</p>`;
        document.getElementById('statusText').textContent = t.modelsReady;
        return;
    }

    resizedDetections.forEach((detection, i) => {
        const { age, gender, genderProbability, expressions } = detection;

        // Find dominant expression
        const expression = Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b);

        const card = document.createElement('div');
        card.className = 'face-card';
        card.innerHTML = `
            <h3>Face ${i + 1}</h3>
            <p><strong>${t.age}:</strong> ${Math.round(age)}</p>
            <p><strong>${t.gender}:</strong> ${t[gender]} (${Math.round(genderProbability * 100)}%)</p>
            <p><strong>${t.expression}:</strong> ${t[expression]}</p>
        `;
        list.appendChild(card);
    });

    document.getElementById('statusText').textContent = t.modelsReady;
}
