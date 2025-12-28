/**
 * Multi-Document Summary - Tool #115
 */

let docCount = 2;
let currentLang = 'zh-TW';

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`lang-${lang === 'zh-TW' ? 'zh' : 'en'}`).classList.add('active');
}

function addDoc() {
    docCount++;
    const container = document.getElementById('docsContainer');
    const docItem = document.createElement('div');
    docItem.className = 'doc-item';
    docItem.dataset.doc = docCount;
    docItem.innerHTML = `
        <div class="doc-header">
            <span>${currentLang === 'zh-TW' ? '文件' : 'Document'} ${docCount}</span>
            <button class="remove-doc" onclick="removeDoc(${docCount})">×</button>
        </div>
        <textarea class="textarea-field doc-input" rows="6" placeholder="${currentLang === 'zh-TW' ? '貼上文件內容...' : 'Paste document content...'}"></textarea>
    `;
    container.appendChild(docItem);
}

function removeDoc(num) {
    const docs = document.querySelectorAll('.doc-item');
    if (docs.length <= 2) {
        alert(currentLang === 'zh-TW' ? '至少需要兩份文件' : 'At least 2 documents required');
        return;
    }
    const doc = document.querySelector(`[data-doc="${num}"]`);
    if (doc) doc.remove();
}

window.removeDoc = removeDoc;

function extractKeyPoints(text, num) {
    const sentences = text.split(/[。！？.!?\n]+/).filter(s => s.trim().length > 15);
    const keywords = currentLang === 'zh-TW'
        ? ['重要', '關鍵', '主要', '結論', '因此', '顯示', '表明']
        : ['important', 'key', 'main', 'conclusion', 'shows', 'indicates'];

    const scored = sentences.map((s, i) => {
        let score = i < 3 ? 3 : 0;
        keywords.forEach(kw => { if (s.includes(kw)) score += 2; });
        return { text: s.trim(), score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, num).map(s => s.text);
}

function generateSummary(docs, mergeType, detail) {
    const numPoints = detail === 'brief' ? 2 : detail === 'standard' ? 3 : 5;
    let output = '';

    if (mergeType === 'unified') {
        const allText = docs.join('\n\n');
        const points = extractKeyPoints(allText, numPoints * 2);
        output = `<h4>${currentLang === 'zh-TW' ? '綜合摘要' : 'Unified Summary'}</h4><ul>`;
        points.forEach(p => output += `<li>${p}</li>`);
        output += '</ul>';
    } else if (mergeType === 'comparative') {
        output = `<h4>${currentLang === 'zh-TW' ? '各文件重點比較' : 'Document Comparison'}</h4>`;
        docs.forEach((doc, i) => {
            const points = extractKeyPoints(doc, numPoints);
            output += `<h4>${currentLang === 'zh-TW' ? '文件' : 'Doc'} ${i + 1}</h4><ul>`;
            points.forEach(p => output += `<li>${p}</li>`);
            output += '</ul>';
        });
    } else {
        output = `<h4>${currentLang === 'zh-TW' ? '依序摘要' : 'Sequential Summary'}</h4>`;
        docs.forEach((doc, i) => {
            const points = extractKeyPoints(doc, numPoints);
            output += `<p><strong>${currentLang === 'zh-TW' ? '文件' : 'Doc'} ${i + 1}:</strong> ${points.join(currentLang === 'zh-TW' ? '。' : '. ')}</p>`;
        });
    }

    return output;
}

function init() {
    setLanguage(navigator.language.startsWith('zh') ? 'zh-TW' : 'en');

    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));
    document.getElementById('addDocBtn').addEventListener('click', addDoc);

    document.getElementById('generateBtn').addEventListener('click', () => {
        const textareas = document.querySelectorAll('.doc-input');
        const docs = Array.from(textareas).map(t => t.value.trim()).filter(t => t.length > 0);

        if (docs.length < 2) {
            alert(currentLang === 'zh-TW' ? '請至少輸入兩份文件' : 'Please enter at least 2 documents');
            return;
        }

        const mergeType = document.getElementById('mergeSelect').value;
        const detail = document.getElementById('detailSelect').value;
        const output = generateSummary(docs, mergeType, detail);

        document.getElementById('summaryContent').innerHTML = output;
        const totalChars = docs.reduce((sum, d) => sum + d.length, 0);
        document.getElementById('stats').innerHTML = `
            <span>${currentLang === 'zh-TW' ? '文件數' : 'Documents'}: ${docs.length}</span>
            <span>${currentLang === 'zh-TW' ? '總字數' : 'Total chars'}: ${totalChars}</span>
        `;
        document.getElementById('outputSection').style.display = 'block';
    });

    document.getElementById('copyBtn').addEventListener('click', () => {
        navigator.clipboard.writeText(document.getElementById('summaryContent').innerText);
    });
}

init();
