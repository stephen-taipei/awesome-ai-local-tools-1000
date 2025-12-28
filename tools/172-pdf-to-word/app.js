/**
 * PDF to Word - Tool #172
 */
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

let extractedText = '';
let wordBlob = null;

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

    document.getElementById('downloadBtn').addEventListener('click', downloadWord);
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

        let allText = [];

        for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const text = textContent.items.map(item => item.str).join(' ');
            allText.push(text);

            const percent = Math.round((i / numPages) * 50);
            progressFill.style.width = percent + '%';
            progressText.textContent = `提取文字... 第 ${i}/${numPages} 頁`;
        }

        extractedText = allText.join('\n\n');
        progressFill.style.width = '75%';
        progressText.textContent = '生成 Word 文件...';

        await createWordDocument(allText);

        progressFill.style.width = '100%';
        progressText.textContent = '轉換完成!';

        document.getElementById('resultPreview').textContent = extractedText.substring(0, 500) + (extractedText.length > 500 ? '...' : '');
        document.getElementById('resultSection').style.display = 'block';

        setTimeout(() => {
            progressSection.style.display = 'none';
        }, 1000);

    } catch (error) {
        progressText.textContent = '轉換失敗: ' + error.message;
    }
}

async function createWordDocument(pages) {
    const { Document, Packer, Paragraph, TextRun } = docx;

    const children = [];
    pages.forEach((pageText, index) => {
        if (index > 0) {
            children.push(new Paragraph({ children: [] }));
        }
        children.push(new Paragraph({
            children: [new TextRun({ text: `--- 第 ${index + 1} 頁 ---`, bold: true })]
        }));
        children.push(new Paragraph({ children: [] }));

        const lines = pageText.split(/\s{2,}/);
        lines.forEach(line => {
            if (line.trim()) {
                children.push(new Paragraph({
                    children: [new TextRun(line.trim())]
                }));
            }
        });
    });

    const doc = new Document({
        sections: [{
            properties: {},
            children: children
        }]
    });

    wordBlob = await Packer.toBlob(doc);
}

function downloadWord() {
    if (!wordBlob) return;
    const url = URL.createObjectURL(wordBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted-document.docx';
    a.click();
    URL.revokeObjectURL(url);
}

init();
