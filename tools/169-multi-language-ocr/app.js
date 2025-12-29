/**
 * Multi-Language OCR - Tool #169
 */
let selectedImage = null;

function init() {
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');
    const recognizeBtn = document.getElementById('recognizeBtn');

    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    uploadZone.addEventListener('click', () => fileInput.click());
    uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); uploadZone.classList.add('dragover'); });
    uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) handleFile(file);
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleFile(file);
    });

    recognizeBtn.addEventListener('click', performOCR);

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

function getSelectedLanguages() {
    const checkboxes = document.querySelectorAll('.lang-checkboxes input[type="checkbox"]:checked');
    const langs = Array.from(checkboxes).map(cb => cb.value);
    return langs.length > 0 ? langs.join('+') : 'eng';
}

async function performOCR() {
    if (!selectedImage) return;

    const progressSection = document.getElementById('progressSection');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const recognizeBtn = document.getElementById('recognizeBtn');

    progressSection.style.display = 'block';
    recognizeBtn.disabled = true;

    const langs = getSelectedLanguages();

    try {
        const result = await Tesseract.recognize(selectedImage, langs, {
            logger: (m) => {
                if (m.status === 'recognizing text') {
                    const percent = Math.round(m.progress * 100);
                    progressFill.style.width = percent + '%';
                    progressText.textContent = `辨識中... ${percent}%`;
                } else if (m.status === 'loading language traineddata') {
                    progressText.textContent = '載入語言模型...';
                } else {
                    progressText.textContent = '初始化...';
                }
            }
        });

        const text = result.data.text.trim();
        document.getElementById('resultSection').style.display = 'block';
        document.getElementById('resultText').textContent = text || '(未偵測到文字)';
        progressSection.style.display = 'none';

    } catch (error) {
        progressText.textContent = '辨識失敗: ' + error.message;
    }
    recognizeBtn.disabled = false;
}

init();
