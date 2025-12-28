/**
 * Receipt OCR - Tool #164
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

function extractReceiptInfo(text) {
    const info = {};

    // Extract total amount (various patterns)
    const totalPatterns = [
        /總計[：:]\s*\$?([\d,]+\.?\d*)/,
        /合計[：:]\s*\$?([\d,]+\.?\d*)/,
        /Total[：:]?\s*\$?([\d,]+\.?\d*)/i,
        /NT\$?\s*([\d,]+)/,
    ];
    for (const pattern of totalPatterns) {
        const match = text.match(pattern);
        if (match) {
            info.total = match[1];
            break;
        }
    }

    // Extract date
    const datePatterns = [
        /(\d{4}[-/]\d{1,2}[-/]\d{1,2})/,
        /(\d{1,2}[-/]\d{1,2}[-/]\d{4})/,
        /民國\s*(\d+)\s*年\s*(\d+)\s*月\s*(\d+)\s*日/,
    ];
    for (const pattern of datePatterns) {
        const match = text.match(pattern);
        if (match) {
            info.date = match[0];
            break;
        }
    }

    // Extract invoice number
    const invoicePatterns = [
        /發票號碼[：:]\s*([A-Z]{2}-?\d{8})/,
        /([A-Z]{2}-?\d{8})/,
    ];
    for (const pattern of invoicePatterns) {
        const match = text.match(pattern);
        if (match) {
            info.invoice = match[1];
            break;
        }
    }

    return info;
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

        const text = result.data.text.trim();
        const info = extractReceiptInfo(text);

        document.getElementById('resultSection').style.display = 'block';

        // Display extracted info
        let infoHtml = '';
        if (info.total) infoHtml += `<div class="info-card"><div class="info-label">總金額</div><div class="info-value">$${info.total}</div></div>`;
        if (info.date) infoHtml += `<div class="info-card"><div class="info-label">日期</div><div class="info-value">${info.date}</div></div>`;
        if (info.invoice) infoHtml += `<div class="info-card"><div class="info-label">發票號碼</div><div class="info-value">${info.invoice}</div></div>`;

        document.getElementById('extractedInfo').innerHTML = infoHtml || '<p style="color: var(--text-secondary);">無法自動提取資訊</p>';
        document.getElementById('resultText').textContent = text || '(未偵測到文字)';
        progressSection.style.display = 'none';

    } catch (error) {
        progressText.textContent = '辨識失敗: ' + error.message;
    }
    recognizeBtn.disabled = false;
}

init();
