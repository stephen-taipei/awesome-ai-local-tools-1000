/**
 * License Plate OCR - Tool #167
 */
let selectedImage = null;
let plateNumber = '';

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
        navigator.clipboard.writeText(plateNumber).then(() => {
            document.getElementById('copyBtn').textContent = '已複製!';
            setTimeout(() => document.getElementById('copyBtn').textContent = '複製號碼', 2000);
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

function extractPlateNumber(text) {
    // Taiwan plate patterns: ABC-1234, 1234-AB, AB-1234
    const patterns = [
        /[A-Z]{2,3}[-\s]?\d{4}/gi,
        /\d{4}[-\s]?[A-Z]{2}/gi,
        /[A-Z]{2}[-\s]?\d{4}/gi,
        /\d{3}[-\s]?[A-Z]{2,3}/gi,
    ];

    for (const pattern of patterns) {
        const matches = text.match(pattern);
        if (matches && matches.length > 0) {
            // Return the longest match
            return matches.sort((a, b) => b.length - a.length)[0].replace(/\s/g, '-');
        }
    }

    // Fallback: return alphanumeric sequences
    const alphaNum = text.match(/[A-Z0-9]{4,8}/gi);
    if (alphaNum) return alphaNum[0];

    return text.replace(/[^A-Z0-9-]/gi, '').substring(0, 10);
}

async function performOCR() {
    if (!selectedImage) return;

    const progressSection = document.getElementById('progressSection');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const recognizeBtn = document.getElementById('recognizeBtn');

    progressSection.style.display = 'block';
    recognizeBtn.disabled = true;

    try {
        const result = await Tesseract.recognize(selectedImage, 'eng', {
            logger: (m) => {
                if (m.status === 'recognizing text') {
                    const percent = Math.round(m.progress * 100);
                    progressFill.style.width = percent + '%';
                    progressText.textContent = `辨識中... ${percent}%`;
                } else {
                    progressText.textContent = m.status === 'loading language traineddata' ? '載入模型...' : '初始化...';
                }
            }
        });

        const text = result.data.text.trim().toUpperCase();
        plateNumber = extractPlateNumber(text);

        document.getElementById('resultSection').style.display = 'block';
        document.getElementById('plateDisplay').innerHTML = `<div class="plate-number">${plateNumber || '無法辨識'}</div>`;
        progressSection.style.display = 'none';

    } catch (error) {
        progressText.textContent = '辨識失敗: ' + error.message;
    }
    recognizeBtn.disabled = false;
}

init();
