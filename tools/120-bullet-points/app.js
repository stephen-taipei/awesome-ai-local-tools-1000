/**
 * Bullet Points - Tool #120
 */

let currentLang = 'zh-TW';

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`lang-${lang === 'zh-TW' ? 'zh' : 'en'}`).classList.add('active');
}

function extractBulletPoints(text, count) {
    const sentences = text.split(/[。.!?！？\n]+/).filter(s => s.trim().length > 15);

    if (sentences.length === 0) return [];

    const keywords = currentLang === 'zh-TW'
        ? ['重要', '關鍵', '主要', '結論', '首先', '其次', '因此', '顯示', '表明', '研究', '發現', '需要', '應該']
        : ['important', 'key', 'main', 'conclusion', 'first', 'second', 'therefore', 'shows', 'indicates', 'research', 'found', 'need', 'should'];

    const scored = sentences.map((sentence, index) => {
        let score = 0;

        // Position weight
        if (index < 3) score += 4;
        if (index >= sentences.length - 2) score += 2;

        // Length preference
        if (sentence.length > 20 && sentence.length < 150) score += 3;

        // Keyword matching
        keywords.forEach(kw => {
            if (sentence.toLowerCase().includes(kw.toLowerCase())) score += 2;
        });

        // Numbers indicate importance
        if (/\d+/.test(sentence)) score += 1;

        return { text: sentence.trim(), score, index };
    });

    // Sort by score, take top N, then restore original order
    scored.sort((a, b) => b.score - a.score);
    const selected = scored.slice(0, count);
    selected.sort((a, b) => a.index - b.index);

    return selected.map(s => s.text);
}

function formatOutput(points, format) {
    if (format === 'bullets') {
        return '<ul>' + points.map(p => `<li>${p}</li>`).join('') + '</ul>';
    } else if (format === 'numbered') {
        return '<ol>' + points.map(p => `<li>${p}</li>`).join('') + '</ol>';
    } else {
        // Markdown
        return points.map((p, i) => `${i + 1}. ${p}`).join('\n');
    }
}

function init() {
    setLanguage(navigator.language.startsWith('zh') ? 'zh-TW' : 'en');

    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    document.getElementById('generateBtn').addEventListener('click', () => {
        const text = document.getElementById('textInput').value.trim();
        if (!text) {
            alert(currentLang === 'zh-TW' ? '請輸入文章內容' : 'Please enter text content');
            return;
        }

        const count = parseInt(document.getElementById('countSelect').value);
        const format = document.getElementById('formatSelect').value;

        const points = extractBulletPoints(text, count);

        if (points.length === 0) {
            document.getElementById('summaryContent').innerHTML =
                currentLang === 'zh-TW' ? '無法提取重點，請確認輸入內容。' : 'Unable to extract key points.';
        } else {
            document.getElementById('summaryContent').innerHTML = formatOutput(points, format);
        }

        document.getElementById('stats').innerHTML = `
            <span>${currentLang === 'zh-TW' ? '原文' : 'Original'}: ${text.length} ${currentLang === 'zh-TW' ? '字' : 'chars'}</span>
            <span>${currentLang === 'zh-TW' ? '提取重點' : 'Points'}: ${points.length} ${currentLang === 'zh-TW' ? '條' : ''}</span>
        `;

        document.getElementById('outputSection').style.display = 'block';
    });

    document.getElementById('copyBtn').addEventListener('click', () => {
        const content = document.getElementById('summaryContent').innerText;
        navigator.clipboard.writeText(content);
    });
}

init();
