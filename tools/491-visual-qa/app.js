/**
 * Visual QA - Tool #491
 * Answer questions about images using AI simulation
 */

// Translations
const translations = {
    'zh-TW': {
        title: '視覺問答',
        subtitle: '上傳圖片並提問，AI 為您解答',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        uploadText: '拖放圖片到此處或點擊上傳',
        uploadHint: '支援 PNG、JPG、WebP 格式',
        askQuestion: '請輸入您的問題：',
        questionPlaceholder: '這張圖片中有什麼？',
        suggestedQuestions: '推薦問題：',
        ask: '提問',
        analyzing: '分析中...',
        answer: '回答',
        confidence: '信心度：',
        history: '問答歷史',
        export: '匯出結果',
        uploadAnother: '上傳其他圖片',
        backToHome: '返回首頁',
        toolNumber: '工具 #491',
        processing: 'AI 正在分析圖片...',
        noQuestion: '請輸入問題',
        exportSuccess: '結果已匯出'
    },
    'en': {
        title: 'Visual QA',
        subtitle: 'Upload an image and ask questions about it',
        privacyBadge: '100% Local Processing · Zero Upload',
        uploadText: 'Drag & drop image here or click to upload',
        uploadHint: 'Supports PNG, JPG, WebP formats',
        askQuestion: 'Enter your question:',
        questionPlaceholder: 'What is in this image?',
        suggestedQuestions: 'Suggested:',
        ask: 'Ask',
        analyzing: 'Analyzing...',
        answer: 'Answer',
        confidence: 'Confidence:',
        history: 'Q&A History',
        export: 'Export Results',
        uploadAnother: 'Upload Another',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #491',
        processing: 'AI is analyzing the image...',
        noQuestion: 'Please enter a question',
        exportSuccess: 'Results exported'
    }
};

let currentLang = 'zh-TW';
let qaHistory = [];
let currentImageData = null;

// DOM Elements
const elements = {
    uploadArea: document.getElementById('uploadArea'),
    fileInput: document.getElementById('fileInput'),
    previewArea: document.getElementById('previewArea'),
    previewImage: document.getElementById('previewImage'),
    questionInput: document.getElementById('questionInput'),
    askBtn: document.getElementById('askBtn'),
    progressContainer: document.getElementById('progressContainer'),
    progressFill: document.getElementById('progressFill'),
    progressText: document.getElementById('progressText'),
    answerSection: document.getElementById('answerSection'),
    answerContent: document.getElementById('answerContent'),
    confidenceFill: document.getElementById('confidenceFill'),
    confidenceValue: document.getElementById('confidenceValue'),
    historyList: document.getElementById('historyList'),
    exportBtn: document.getElementById('exportBtn'),
    resetBtn: document.getElementById('resetBtn')
};

// Language Functions
function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[lang][key]) {
            el.placeholder = translations[lang][key];
        }
    });
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`lang-${lang === 'zh-TW' ? 'zh' : 'en'}`).classList.add('active');
}

function t(key) {
    return translations[currentLang][key] || key;
}

// Simulated VQA answers based on common questions
function generateVQAAnswer(question, imageData) {
    const q = question.toLowerCase();
    const isZh = /[\u4e00-\u9fff]/.test(question);

    // Analyze image colors
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = elements.previewImage;
    canvas.width = img.naturalWidth || 300;
    canvas.height = img.naturalHeight || 300;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    let r = 0, g = 0, b = 0, count = 0;
    for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count++;
    }
    r = Math.round(r / count);
    g = Math.round(g / count);
    b = Math.round(b / count);

    const brightness = (r + g + b) / 3;
    const dominantColor = r > g && r > b ? (isZh ? '紅色調' : 'reddish') :
                         g > r && g > b ? (isZh ? '綠色調' : 'greenish') :
                         b > r && b > g ? (isZh ? '藍色調' : 'bluish') :
                         (isZh ? '中性色調' : 'neutral tones');

    // Generate contextual answers
    const answers = {
        color: isZh
            ? `這張圖片的主要顏色是${dominantColor}，整體色調${brightness > 128 ? '偏亮' : '偏暗'}。平均RGB值為(${r}, ${g}, ${b})。`
            : `The main color of this image is ${dominantColor}, with an overall ${brightness > 128 ? 'bright' : 'dark'} tone. Average RGB is (${r}, ${g}, ${b}).`,

        object: isZh
            ? `基於視覺分析，這張圖片包含了一個主要物體或場景。圖片整體呈現${dominantColor}，可能是一個${brightness > 128 ? '明亮的日間場景' : '較暗的環境'}。`
            : `Based on visual analysis, this image contains a main object or scene. The overall color is ${dominantColor}, possibly a ${brightness > 128 ? 'bright daytime scene' : 'darker environment'}.`,

        scene: isZh
            ? `這看起來像是一個${brightness > 128 ? '戶外或光線充足的' : '室內或光線較暗的'}場景。色彩以${dominantColor}為主。`
            : `This appears to be a ${brightness > 128 ? 'outdoor or well-lit' : 'indoor or dimly-lit'} scene. The color palette is mainly ${dominantColor}.`,

        people: isZh
            ? `這張圖片中可能包含人物。整體環境${brightness > 128 ? '明亮' : '較暗'}，以${dominantColor}為主色調。`
            : `This image may contain people. The overall environment is ${brightness > 128 ? 'bright' : 'darker'}, with ${dominantColor} as the main tone.`,

        default: isZh
            ? `這是一張${canvas.width}x${canvas.height}像素的圖片。主要色調為${dominantColor}，亮度${brightness > 128 ? '較高' : '較低'}。圖片整體${brightness > 180 ? '非常明亮' : brightness > 100 ? '光線適中' : '偏暗'}。`
            : `This is a ${canvas.width}x${canvas.height} pixel image. The main tone is ${dominantColor}, with ${brightness > 128 ? 'higher' : 'lower'} brightness. The overall image is ${brightness > 180 ? 'very bright' : brightness > 100 ? 'moderately lit' : 'darker'}.`
    };

    // Match question to answer type
    let answer = answers.default;
    let confidence = 75 + Math.random() * 20;

    if (q.includes('color') || q.includes('顏色') || q.includes('色')) {
        answer = answers.color;
        confidence = 85 + Math.random() * 10;
    } else if (q.includes('what') || q.includes('什麼') || q.includes('有什麼')) {
        answer = answers.object;
        confidence = 70 + Math.random() * 20;
    } else if (q.includes('scene') || q.includes('場景') || q.includes('where') || q.includes('哪裡')) {
        answer = answers.scene;
        confidence = 72 + Math.random() * 18;
    } else if (q.includes('people') || q.includes('person') || q.includes('人') || q.includes('幾個')) {
        answer = answers.people;
        confidence = 65 + Math.random() * 20;
    }

    return { answer, confidence: Math.round(confidence) };
}

// Process question
async function processQuestion() {
    const question = elements.questionInput.value.trim();
    if (!question) {
        alert(t('noQuestion'));
        return;
    }

    elements.askBtn.disabled = true;
    elements.progressContainer.style.display = 'block';
    elements.answerSection.style.display = 'none';

    // Simulate processing
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;
        elements.progressFill.style.width = `${progress}%`;
        elements.progressText.textContent = t('processing');
    }, 200);

    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    clearInterval(interval);
    elements.progressFill.style.width = '100%';

    await new Promise(resolve => setTimeout(resolve, 300));

    // Generate answer
    const result = generateVQAAnswer(question, currentImageData);

    // Display answer
    elements.progressContainer.style.display = 'none';
    elements.answerSection.style.display = 'block';
    elements.answerContent.textContent = result.answer;
    elements.confidenceFill.style.width = `${result.confidence}%`;
    elements.confidenceValue.textContent = `${result.confidence}%`;

    // Add to history
    qaHistory.push({ question, answer: result.answer, confidence: result.confidence });
    updateHistory();

    elements.questionInput.value = '';
    elements.askBtn.disabled = false;
}

// Update history display
function updateHistory() {
    elements.historyList.innerHTML = qaHistory.slice().reverse().map((item, idx) => `
        <div class="history-item">
            <div class="history-question">Q: ${item.question}</div>
            <div class="history-answer">A: ${item.answer}</div>
        </div>
    `).join('');
}

// Export results
function exportResults() {
    const data = {
        timestamp: new Date().toISOString(),
        imageInfo: {
            width: elements.previewImage.naturalWidth,
            height: elements.previewImage.naturalHeight
        },
        qaHistory: qaHistory
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visual-qa-results-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// Reset
function reset() {
    elements.uploadArea.style.display = 'block';
    elements.previewArea.style.display = 'none';
    elements.fileInput.value = '';
    elements.answerSection.style.display = 'none';
    elements.progressContainer.style.display = 'none';
    qaHistory = [];
    elements.historyList.innerHTML = '';
    currentImageData = null;
}

// Handle file upload
function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        elements.previewImage.src = e.target.result;
        currentImageData = e.target.result;
        elements.uploadArea.style.display = 'none';
        elements.previewArea.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

// Event Listeners
function initEventListeners() {
    // Language switcher
    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    // Upload
    elements.uploadArea.addEventListener('click', () => elements.fileInput.click());
    elements.fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));

    // Drag and drop
    elements.uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.uploadArea.classList.add('dragover');
    });
    elements.uploadArea.addEventListener('dragleave', () => {
        elements.uploadArea.classList.remove('dragover');
    });
    elements.uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.uploadArea.classList.remove('dragover');
        handleFile(e.dataTransfer.files[0]);
    });

    // Question
    elements.askBtn.addEventListener('click', processQuestion);
    elements.questionInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') processQuestion();
    });

    // Suggested questions
    document.querySelectorAll('.suggestion-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const q = currentLang === 'zh-TW' ? btn.dataset.questionZh : btn.dataset.questionEn;
            elements.questionInput.value = q;
        });
    });

    // Actions
    elements.exportBtn.addEventListener('click', exportResults);
    elements.resetBtn.addEventListener('click', reset);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setLanguage('zh-TW');
    initEventListeners();
});
