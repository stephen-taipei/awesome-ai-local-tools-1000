/**
 * PDF Text Extract - Tool #171
 */
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

let extractedPages = [];

function init() {
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');

    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    uploadZone.addEventListener('click', () => fileInput.click());
    uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); uploadZone.classList.add('dragover'); });
    uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type === 'application/pdf') handleFile(file);
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleFile(file);
    });

    document.getElementById('copyBtn').addEventListener('click', copyText);
    document.getElementById('downloadBtn').addEventListener('click', downloadText);
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

async function handleFile(file) {
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = formatFileSize(file.size);
    document.getElementById('fileInfo').style.display = 'flex';

    const progressSection = document.getElementById('progressSection');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    progressSection.style.display = 'block';
    progressFill.style.width = '0%';
    progressText.textContent = '載入 PDF...';

    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const numPages = pdf.numPages;

        extractedPages = [];

        for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const text = textContent.items.map(item => item.str).join(' ');
            extractedPages.push(text);

            const percent = Math.round((i / numPages) * 100);
            progressFill.style.width = percent + '%';
            progressText.textContent = `提取中... 第 ${i}/${numPages} 頁`;
        }

        displayResults();
        progressSection.style.display = 'none';

    } catch (error) {
        progressText.textContent = '提取失敗: ' + error.message;
    }
}

function displayResults() {
    const pageNav = document.getElementById('pageNav');
    const resultText = document.getElementById('resultText');

    pageNav.innerHTML = '<button class="page-btn active" data-page="all">全部</button>';
    extractedPages.forEach((_, i) => {
        pageNav.innerHTML += `<button class="page-btn" data-page="${i}">第 ${i + 1} 頁</button>`;
    });

    pageNav.querySelectorAll('.page-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            pageNav.querySelectorAll('.page-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const page = btn.dataset.page;
            if (page === 'all') {
                resultText.textContent = extractedPages.map((t, i) => `--- 第 ${i + 1} 頁 ---\n${t}`).join('\n\n');
            } else {
                resultText.textContent = extractedPages[parseInt(page)];
            }
        });
    });

    resultText.textContent = extractedPages.map((t, i) => `--- 第 ${i + 1} 頁 ---\n${t}`).join('\n\n');
    document.getElementById('resultSection').style.display = 'block';
}

function copyText() {
    const text = document.getElementById('resultText').textContent;
    navigator.clipboard.writeText(text).then(() => {
        document.getElementById('copyBtn').textContent = '已複製!';
        setTimeout(() => document.getElementById('copyBtn').textContent = '複製', 2000);
    });
}

function downloadText() {
    const text = document.getElementById('resultText').textContent;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extracted-text.txt';
    a.click();
    URL.revokeObjectURL(url);
}

init();
