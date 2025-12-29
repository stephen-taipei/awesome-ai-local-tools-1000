/**
 * Business Card OCR - Tool #165
 */
let selectedImage = null;
let extractedContact = {};

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
        const vcard = generateVCard(extractedContact);
        navigator.clipboard.writeText(vcard).then(() => {
            document.getElementById('copyBtn').textContent = '已複製!';
            setTimeout(() => document.getElementById('copyBtn').textContent = '複製 vCard', 2000);
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

function extractContactInfo(text) {
    const info = {};

    // Extract email
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) info.email = emailMatch[0];

    // Extract phone
    const phonePatterns = [
        /(?:\+886|0)[- ]?\d{1,2}[- ]?\d{3,4}[- ]?\d{3,4}/,
        /\d{2,4}[-.\s]?\d{3,4}[-.\s]?\d{3,4}/,
    ];
    for (const pattern of phonePatterns) {
        const match = text.match(pattern);
        if (match) {
            info.phone = match[0];
            break;
        }
    }

    // Extract website
    const urlMatch = text.match(/(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*/);
    if (urlMatch && !urlMatch[0].includes('@')) info.website = urlMatch[0];

    // Extract company (look for common patterns)
    const companyPatterns = [
        /(?:公司|企業|集團|股份有限公司|有限公司|Corp\.|Inc\.|Ltd\.|LLC)[^\n]*/i,
        /^[^\n]+(?:公司|企業|集團)/m,
    ];
    for (const pattern of companyPatterns) {
        const match = text.match(pattern);
        if (match) {
            info.company = match[0].trim();
            break;
        }
    }

    // First line often contains name
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length > 0 && !lines[0].match(/[@.]/)) {
        info.name = lines[0].trim();
    }

    return info;
}

function generateVCard(contact) {
    let vcard = 'BEGIN:VCARD\nVERSION:3.0\n';
    if (contact.name) vcard += `FN:${contact.name}\n`;
    if (contact.company) vcard += `ORG:${contact.company}\n`;
    if (contact.phone) vcard += `TEL:${contact.phone}\n`;
    if (contact.email) vcard += `EMAIL:${contact.email}\n`;
    if (contact.website) vcard += `URL:${contact.website}\n`;
    vcard += 'END:VCARD';
    return vcard;
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
        extractedContact = extractContactInfo(text);

        document.getElementById('resultSection').style.display = 'block';

        let contactHtml = '';
        if (extractedContact.name) contactHtml += `<div class="contact-item"><span class="contact-icon">👤</span><div><div class="contact-label">姓名</div><div class="contact-value">${extractedContact.name}</div></div></div>`;
        if (extractedContact.company) contactHtml += `<div class="contact-item"><span class="contact-icon">🏢</span><div><div class="contact-label">公司</div><div class="contact-value">${extractedContact.company}</div></div></div>`;
        if (extractedContact.phone) contactHtml += `<div class="contact-item"><span class="contact-icon">📱</span><div><div class="contact-label">電話</div><div class="contact-value">${extractedContact.phone}</div></div></div>`;
        if (extractedContact.email) contactHtml += `<div class="contact-item"><span class="contact-icon">📧</span><div><div class="contact-label">Email</div><div class="contact-value">${extractedContact.email}</div></div></div>`;
        if (extractedContact.website) contactHtml += `<div class="contact-item"><span class="contact-icon">🌐</span><div><div class="contact-label">網站</div><div class="contact-value">${extractedContact.website}</div></div></div>`;

        document.getElementById('contactInfo').innerHTML = contactHtml || '<p style="color: var(--text-secondary);">無法自動提取聯絡資訊</p>';
        document.getElementById('resultText').textContent = text || '(未偵測到文字)';
        progressSection.style.display = 'none';

    } catch (error) {
        progressText.textContent = '辨識失敗: ' + error.message;
    }
    recognizeBtn.disabled = false;
}

init();
