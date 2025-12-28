/**
 * Table OCR - Tool #163
 */
let selectedImage = null;
let ocrResult = '';

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
        navigator.clipboard.writeText(ocrResult).then(() => {
            document.getElementById('copyBtn').textContent = '已複製!';
            setTimeout(() => document.getElementById('copyBtn').textContent = '複製文字', 2000);
        });
    });

    document.getElementById('csvBtn').addEventListener('click', () => {
        // Convert to CSV format
        const csv = ocrResult.split('\n').map(line => {
            // Split by multiple spaces or tabs
            return line.split(/\s{2,}|\t/).join(',');
        }).join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'table_data.csv';
        link.click();
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

    const progressSection = document.getElementById('progressSection');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const recognizeBtn = document.getElementById('recognizeBtn');

    progressSection.style.display = 'block';
    recognizeBtn.disabled = true;

    try {
        const result = await Tesseract.recognize(selectedImage, 'chi_tra+eng', {
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

        ocrResult = result.data.text.trim();

        // Format as table-like structure
        const lines = ocrResult.split('\n').filter(l => l.trim());
        const formatted = lines.map(line => {
            // Normalize spacing to look like table columns
            return line.replace(/\s{2,}/g, '\t|\t');
        }).join('\n');

        document.getElementById('resultSection').style.display = 'block';
        document.getElementById('resultText').textContent = formatted || '(未偵測到文字)';
        progressSection.style.display = 'none';

    } catch (error) {
        progressText.textContent = '辨識失敗: ' + error.message;
    }
    recognizeBtn.disabled = false;
}

init();
