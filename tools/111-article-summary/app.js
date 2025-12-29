/**
 * Article Summary - Tool #111
 */

let currentLang = 'zh-TW';

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`lang-${lang === 'zh-TW' ? 'zh' : 'en'}`).classList.add('active');
}

function extractSentences(text) {
    // Split by common sentence endings
    const sentences = text.split(/[。！？.!?\n]+/).filter(s => s.trim().length > 10);
    return sentences.map(s => s.trim());
}

function scoreSentence(sentence, allSentences) {
    // Simple scoring based on word frequency and position
    const words = sentence.toLowerCase().split(/\s+/);
    let score = 0;

    // Length score (prefer medium length)
    if (sentence.length > 20 && sentence.length < 200) {
        score += 10;
    }

    // Position score (first sentences are important)
    const index = allSentences.indexOf(sentence);
    if (index < 3) score += 5;

    // Keyword indicators
    const keywords = currentLang === 'zh-TW'
        ? ['重要', '關鍵', '結論', '因此', '總之', '首先', '主要', '核心']
        : ['important', 'key', 'conclusion', 'therefore', 'main', 'primary', 'essential'];

    keywords.forEach(kw => {
        if (sentence.includes(kw)) score += 3;
    });

    return score;
}

function generateSummary(text, length, style) {
    const sentences = extractSentences(text);

    if (sentences.length === 0) {
        return currentLang === 'zh-TW' ? '無法提取有效內容，請確認輸入的文章。' : 'Unable to extract content. Please check the input.';
    }

    // Score and sort sentences
    const scored = sentences.map(s => ({ text: s, score: scoreSentence(s, sentences) }));
    scored.sort((a, b) => b.score - a.score);

    // Select top sentences based on length
    let numSentences;
    switch (length) {
        case 'short': numSentences = 2; break;
        case 'medium': numSentences = 4; break;
        case 'long': numSentences = 6; break;
        default: numSentences = 4;
    }

    const selected = scored.slice(0, Math.min(numSentences, scored.length));

    // Sort by original order
    selected.sort((a, b) => sentences.indexOf(a.text) - sentences.indexOf(b.text));

    // Format based on style
    let summary = selected.map(s => s.text).join(currentLang === 'zh-TW' ? '。' : '. ');

    if (style === 'analytical') {
        const prefix = currentLang === 'zh-TW'
            ? '本文主要探討以下要點：'
            : 'This article mainly discusses the following points: ';
        summary = prefix + summary;
    } else if (style === 'simplified') {
        const prefix = currentLang === 'zh-TW'
            ? '簡單來說，'
            : 'Simply put, ';
        summary = prefix + summary;
    }

    return summary + (currentLang === 'zh-TW' ? '。' : '.');
}

function init() {
    setLanguage(navigator.language.startsWith('zh') ? 'zh-TW' : 'en');

    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    document.getElementById('generateBtn').addEventListener('click', () => {
        const article = document.getElementById('articleInput').value.trim();
        const length = document.getElementById('lengthSelect').value;
        const style = document.getElementById('styleSelect').value;

        if (!article) {
            alert(currentLang === 'zh-TW' ? '請輸入文章內容' : 'Please enter article content');
            return;
        }

        const summary = generateSummary(article, length, style);
        document.getElementById('summaryContent').textContent = summary;

        const originalLen = article.length;
        const summaryLen = summary.length;
        const ratio = Math.round((summaryLen / originalLen) * 100);

        document.getElementById('stats').innerHTML = `
            <span>${currentLang === 'zh-TW' ? '原文' : 'Original'}: ${originalLen} ${currentLang === 'zh-TW' ? '字' : 'chars'}</span>
            <span>${currentLang === 'zh-TW' ? '摘要' : 'Summary'}: ${summaryLen} ${currentLang === 'zh-TW' ? '字' : 'chars'}</span>
            <span>${currentLang === 'zh-TW' ? '壓縮比' : 'Ratio'}: ${ratio}%</span>
        `;

        document.getElementById('outputSection').style.display = 'block';
    });

    document.getElementById('copyBtn').addEventListener('click', () => {
        navigator.clipboard.writeText(document.getElementById('summaryContent').textContent);
    });
}

init();
