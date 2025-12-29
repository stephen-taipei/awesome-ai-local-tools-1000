/**
 * Web Summary - Tool #118
 */

let currentLang = 'zh-TW';

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`lang-${lang === 'zh-TW' ? 'zh' : 'en'}`).classList.add('active');
}

function stripHtml(html) {
    const temp = document.createElement('div');
    temp.innerHTML = html;

    // Remove scripts, styles, nav, footer, aside
    ['script', 'style', 'nav', 'footer', 'aside', 'header', 'iframe', 'noscript'].forEach(tag => {
        temp.querySelectorAll(tag).forEach(el => el.remove());
    });

    return temp.textContent || temp.innerText || '';
}

function extractKeyPoints(text, numPoints) {
    const sentences = text.split(/[。.!?\n]+/).filter(s => s.trim().length > 20);

    const keywords = currentLang === 'zh-TW'
        ? ['重要', '關鍵', '主要', '結論', '顯示', '根據', '研究', '發現', '提供', '服務']
        : ['important', 'key', 'main', 'conclusion', 'shows', 'according', 'research', 'found', 'provides'];

    const scored = sentences.map((s, i) => {
        let score = i < 3 ? 3 : 0;
        if (s.length > 30 && s.length < 200) score += 2;
        keywords.forEach(kw => { if (s.toLowerCase().includes(kw)) score += 2; });
        return { text: s.trim(), score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, numPoints).map(s => s.text);
}

function generateWebSummary(rawContent, contentType, length) {
    const text = stripHtml(rawContent).replace(/\s+/g, ' ').trim();

    if (text.length < 50) {
        return { content: currentLang === 'zh-TW' ? '內容太短，無法生成摘要' : 'Content too short for summary', stats: null };
    }

    const numPoints = length === 'short' ? 3 : length === 'medium' ? 5 : 8;
    const points = extractKeyPoints(text, numPoints);

    let output = '';
    const title = currentLang === 'zh-TW' ? '網頁摘要' : 'Web Summary';

    output = `<h4>${title}</h4><ul>`;
    points.forEach(p => output += `<li>${p}</li>`);
    output += '</ul>';

    const stats = {
        original: text.length,
        summary: points.join(' ').length
    };

    return { content: output, stats };
}

function init() {
    setLanguage(navigator.language.startsWith('zh') ? 'zh-TW' : 'en');

    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    document.getElementById('generateBtn').addEventListener('click', () => {
        const content = document.getElementById('webInput').value.trim();
        if (!content) {
            alert(currentLang === 'zh-TW' ? '請輸入網頁內容' : 'Please enter web content');
            return;
        }

        const contentType = document.getElementById('typeSelect').value;
        const length = document.getElementById('lengthSelect').value;
        const result = generateWebSummary(content, contentType, length);

        document.getElementById('summaryContent').innerHTML = result.content;

        if (result.stats) {
            const ratio = Math.round((result.stats.summary / result.stats.original) * 100);
            document.getElementById('stats').innerHTML = `
                <span>${currentLang === 'zh-TW' ? '原文' : 'Original'}: ${result.stats.original} ${currentLang === 'zh-TW' ? '字' : 'chars'}</span>
                <span>${currentLang === 'zh-TW' ? '摘要' : 'Summary'}: ${result.stats.summary} ${currentLang === 'zh-TW' ? '字' : 'chars'}</span>
                <span>${currentLang === 'zh-TW' ? '壓縮比' : 'Ratio'}: ${ratio}%</span>
            `;
        }

        document.getElementById('outputSection').style.display = 'block';
    });

    document.getElementById('copyBtn').addEventListener('click', () => {
        navigator.clipboard.writeText(document.getElementById('summaryContent').innerText);
    });
}

init();
