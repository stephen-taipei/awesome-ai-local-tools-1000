/**
 * Paper Summary - Tool #116
 */

let currentLang = 'zh-TW';

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`lang-${lang === 'zh-TW' ? 'zh' : 'en'}`).classList.add('active');
}

function extractSection(text, keywords) {
    const sentences = text.split(/[。.!?\n]+/).filter(s => s.trim().length > 15);
    const matched = sentences.filter(s => keywords.some(k => s.toLowerCase().includes(k.toLowerCase())));
    return matched.slice(0, 3);
}

function generatePaperSummary(text, structure, detail) {
    const numPoints = detail === 'brief' ? 1 : detail === 'standard' ? 2 : 3;
    let output = '';

    const introKeywords = currentLang === 'zh-TW'
        ? ['研究', '目的', '旨在', '探討', '背景', '問題']
        : ['study', 'purpose', 'aim', 'investigate', 'background', 'problem'];

    const methodKeywords = currentLang === 'zh-TW'
        ? ['方法', '使用', '採用', '樣本', '實驗', '分析', '資料']
        : ['method', 'using', 'sample', 'experiment', 'analysis', 'data'];

    const resultKeywords = currentLang === 'zh-TW'
        ? ['結果', '發現', '顯示', '表明', '證實', '數據']
        : ['result', 'found', 'shows', 'indicates', 'demonstrates', 'data'];

    const conclusionKeywords = currentLang === 'zh-TW'
        ? ['結論', '因此', '總結', '建議', '未來', '意義']
        : ['conclusion', 'therefore', 'summary', 'suggest', 'future', 'implications'];

    if (structure === 'imrad') {
        const intro = extractSection(text, introKeywords).slice(0, numPoints);
        const methods = extractSection(text, methodKeywords).slice(0, numPoints);
        const results = extractSection(text, resultKeywords).slice(0, numPoints);
        const conclusion = extractSection(text, conclusionKeywords).slice(0, numPoints);

        output = `<h4>${currentLang === 'zh-TW' ? '引言/背景' : 'Introduction'}</h4>
            <p>${intro.join(currentLang === 'zh-TW' ? '。' : '. ') || (currentLang === 'zh-TW' ? '未識別到相關內容' : 'No relevant content found')}</p>
            <h4>${currentLang === 'zh-TW' ? '研究方法' : 'Methods'}</h4>
            <p>${methods.join(currentLang === 'zh-TW' ? '。' : '. ') || (currentLang === 'zh-TW' ? '未識別到相關內容' : 'No relevant content found')}</p>
            <h4>${currentLang === 'zh-TW' ? '研究結果' : 'Results'}</h4>
            <p>${results.join(currentLang === 'zh-TW' ? '。' : '. ') || (currentLang === 'zh-TW' ? '未識別到相關內容' : 'No relevant content found')}</p>
            <h4>${currentLang === 'zh-TW' ? '結論' : 'Conclusion'}</h4>
            <p>${conclusion.join(currentLang === 'zh-TW' ? '。' : '. ') || (currentLang === 'zh-TW' ? '未識別到相關內容' : 'No relevant content found')}</p>`;
    } else if (structure === 'highlights') {
        const allKeywords = [...resultKeywords, ...conclusionKeywords];
        const highlights = extractSection(text, allKeywords).slice(0, numPoints * 2);
        output = `<h4>${currentLang === 'zh-TW' ? '研究亮點' : 'Research Highlights'}</h4><ul>`;
        highlights.forEach(h => output += `<li>${h.trim()}</li>`);
        output += '</ul>';
    } else {
        const sentences = text.split(/[。.]+/).filter(s => s.trim().length > 20);
        const selected = sentences.slice(0, numPoints * 3);
        output = `<h4>${currentLang === 'zh-TW' ? '摘要' : 'Abstract'}</h4>
            <p>${selected.join(currentLang === 'zh-TW' ? '。' : '. ')}</p>`;
    }

    return output;
}

function init() {
    setLanguage(navigator.language.startsWith('zh') ? 'zh-TW' : 'en');

    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    document.getElementById('generateBtn').addEventListener('click', () => {
        const text = document.getElementById('paperInput').value.trim();
        if (!text) {
            alert(currentLang === 'zh-TW' ? '請輸入論文內容' : 'Please enter paper content');
            return;
        }

        const structure = document.getElementById('structureSelect').value;
        const detail = document.getElementById('detailSelect').value;
        const output = generatePaperSummary(text, structure, detail);

        document.getElementById('summaryContent').innerHTML = output;
        document.getElementById('stats').innerHTML = `
            <span>${currentLang === 'zh-TW' ? '原文' : 'Original'}: ${text.length} ${currentLang === 'zh-TW' ? '字' : 'chars'}</span>
        `;
        document.getElementById('outputSection').style.display = 'block';
    });

    document.getElementById('copyBtn').addEventListener('click', () => {
        navigator.clipboard.writeText(document.getElementById('summaryContent').innerText);
    });
}

init();
