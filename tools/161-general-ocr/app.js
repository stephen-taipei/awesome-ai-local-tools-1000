/**
 * General OCR - Tool #161
 */
let selectedImage = null;

function init() {
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');
    const recognizeBtn = document.getElementById('recognizeBtn');

    // Language switcher
    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    // Upload zone click
    uploadZone.addEventListener('click', () => fileInput.click());

    // Drag and drop
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleFile(file);
        }
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleFile(file);
    });

    // Recognize button
    recognizeBtn.addEventListener('click', performOCR);

    // Copy button
    document.getElementById('copyBtn').addEventListener('click', () => {
        const text = document.getElementById('resultText').textContent;
        navigator.clipboard.writeText(text).then(() => {
            document.getElementById('copyBtn').textContent = '已複製!';
            setTimeout(() => document.getElementById('copyBtn').textContent = '複製', 2000);
        });
    });
}

function handleFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        selectedImage = e.target.result;
        document.getElementById('previewImage').src = selectedImage;
        document.getElementById('previewSection').style.display = 'block';
        document.getElementById('recognizeBtn').disabled = false;
    };
    reader.readAsDataURL(file);
}

async function performOCR() {
    if (!selectedImage) return;

    const lang = document.getElementById('langSelect').value;
    const progressSection = document.getElementById('progressSection');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const recognizeBtn = document.getElementById('recognizeBtn');

    progressSection.style.display = 'block';
    recognizeBtn.disabled = true;

    try {
        const result = await Tesseract.recognize(selectedImage, lang, {
            logger: (m) => {
                if (m.status === 'recognizing text') {
                    const percent = Math.round(m.progress * 100);
                    progressFill.style.width = percent + '%';
                    progressText.textContent = `辨識中... ${percent}%`;
                } else if (m.status === 'loading language traineddata') {
                    progressText.textContent = '載入語言模型...';
                    progressFill.style.width = '10%';
                } else if (m.status === 'initializing tesseract') {
                    progressText.textContent = '初始化 OCR 引擎...';
                    progressFill.style.width = '5%';
                }
            }
        });

        const text = result.data.text.trim();
        const confidence = Math.round(result.data.confidence);
        const wordCount = text.split(/\s+/).filter(w => w).length;
        const charCount = text.replace(/\s/g, '').length;

        document.getElementById('resultSection').style.display = 'block';
        document.getElementById('resultStats').innerHTML = `
            <span>字元數: <strong>${charCount}</strong></span>
            <span>信心度: <strong>${confidence}%</strong></span>
        `;
        document.getElementById('resultText').textContent = text || '(未偵測到文字)';

        progressSection.style.display = 'none';

    } catch (error) {
        console.error('OCR Error:', error);
        progressText.textContent = '辨識失敗: ' + error.message;
    }

    recognizeBtn.disabled = false;
}

init();
