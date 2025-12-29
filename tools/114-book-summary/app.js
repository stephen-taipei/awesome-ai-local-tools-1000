/**
 * Book Summary - Tool #114
 * Summarizes book chapters and extracts key insights
 */

let currentLang = 'zh-TW';

const i18n = {
    'zh-TW': {
        title: '書籍章節摘要',
        subtitle: '摘要書籍章節內容，提取核心要點',
        inputLabel: '貼上書籍章節內容',
        placeholder: '將書籍章節內容貼在這裡...',
        styleLabel: '摘要風格',
        lengthLabel: '摘要長度',
        generateBtn: '生成摘要',
        outputTitle: '章節摘要',
        copy: '複製',
        download: '下載',
        copied: '已複製',
        styleKeypoints: '重點提取',
        styleNarrative: '敘事摘要',
        styleAnalytical: '分析評論',
        styleOutline: '結構大綱',
        lengthShort: '簡短 (100-200字)',
        lengthMedium: '中等 (300-500字)',
        lengthLong: '詳細 (500+字)',
        noContent: '無法提取有效內容，請確認輸入的章節內容。',
        enterContent: '請輸入書籍章節內容',
        original: '原文',
        summary: '摘要',
        chars: '字',
        ratio: '壓縮比',
        keyInsights: '核心洞見',
        mainIdeas: '主要觀點',
        concepts: '重要概念',
        chapterOutline: '章節大綱',
        analysis: '分析評論'
    },
    'en': {
        title: 'Book Summary',
        subtitle: 'Summarize book chapters and extract key insights',
        inputLabel: 'Paste book chapter content',
        placeholder: 'Paste book chapter content here...',
        styleLabel: 'Summary style',
        lengthLabel: 'Summary length',
        generateBtn: 'Generate Summary',
        outputTitle: 'Chapter Summary',
        copy: 'Copy',
        download: 'Download',
        copied: 'Copied',
        styleKeypoints: 'Key Points',
        styleNarrative: 'Narrative',
        styleAnalytical: 'Analytical',
        styleOutline: 'Outline',
        lengthShort: 'Short (100-200 chars)',
        lengthMedium: 'Medium (300-500 chars)',
        lengthLong: 'Detailed (500+ chars)',
        noContent: 'Unable to extract content. Please check the chapter text.',
        enterContent: 'Please enter chapter content',
        original: 'Original',
        summary: 'Summary',
        chars: 'chars',
        ratio: 'Ratio',
        keyInsights: 'Key Insights',
        mainIdeas: 'Main Ideas',
        concepts: 'Key Concepts',
        chapterOutline: 'Chapter Outline',
        analysis: 'Analysis'
    }
};

function t(key) {
    return i18n[currentLang][key] || key;
}

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`lang-${lang === 'zh-TW' ? 'zh' : 'en'}`).classList.add('active');
}

// Split text into paragraphs
function getParagraphs(text) {
    return text.split(/\n\n+/).filter(p => p.trim().length > 20);
}

// Extract sentences from text
function getSentences(text) {
    return text.split(/[。！？.!?]+/).filter(s => s.trim().length > 10);
}

// Score sentence importance
function scoreSentence(sentence, allText, index, total) {
    let score = 0;

    const keywords = currentLang === 'zh-TW'
        ? ['重要', '關鍵', '核心', '主要', '根據', '認為', '因此', '所以', '總之', '首先', '其次', '最後', '結論', '觀點', '理論', '研究', '發現', '顯示']
        : ['important', 'key', 'main', 'according', 'therefore', 'thus', 'conclusion', 'primarily', 'significant', 'research', 'study', 'shows', 'demonstrates', 'theory', 'concept'];

    // Position score
    if (index < 3) score += 4;
    if (index >= total - 2) score += 3;

    // Keyword score
    keywords.forEach(kw => {
        if (sentence.toLowerCase().includes(kw.toLowerCase())) score += 2;
    });

    // Length preference (medium length)
    if (sentence.length > 30 && sentence.length < 150) score += 2;

    // Quote or emphasis
    if (sentence.includes('"') || sentence.includes('「') || sentence.includes('『')) score += 1;

    return score;
}

// Extract key points
function extractKeyPoints(text, numPoints) {
    const sentences = getSentences(text);
    if (sentences.length === 0) return [];

    const scored = sentences.map((s, i) => ({
        text: s.trim(),
        score: scoreSentence(s, text, i, sentences.length),
        index: i
    }));

    scored.sort((a, b) => b.score - a.score);
    const selected = scored.slice(0, numPoints);
    selected.sort((a, b) => a.index - b.index);

    return selected.map(s => s.text);
}

// Extract concepts/terms
function extractConcepts(text) {
    const concepts = [];
    const patterns = currentLang === 'zh-TW' ? [
        /「([^」]+)」/g,
        /『([^』]+)』/g,
        /《([^》]+)》/g,
        /所謂[的]?([^，。、]+)/g
    ] : [
        /"([^"]+)"/g,
        /'([^']+)'/g,
        /called\s+([^,.\s]+)/gi,
        /known\s+as\s+([^,.\s]+)/gi
    ];

    patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(text)) !== null) {
            const concept = match[1].trim();
            if (concept.length >= 2 && concept.length <= 30) {
                concepts.push(concept);
            }
        }
    });

    return [...new Set(concepts)].slice(0, 8);
}

// Generate outline from paragraphs
function generateOutline(text) {
    const paragraphs = getParagraphs(text);
    const outline = [];

    paragraphs.forEach((para, i) => {
        const sentences = getSentences(para);
        if (sentences.length > 0) {
            // Take first sentence as topic sentence
            const topic = sentences[0].trim();
            if (topic.length > 10 && topic.length < 100) {
                outline.push({
                    number: i + 1,
                    topic: topic,
                    details: sentences.slice(1, 3).map(s => s.trim()).filter(s => s.length > 10)
                });
            }
        }
    });

    return outline.slice(0, 8);
}

// Generate summary based on style
function generateSummary(text, style, length) {
    let numPoints;
    switch (length) {
        case 'short': numPoints = 3; break;
        case 'medium': numPoints = 5; break;
        case 'long': numPoints = 8; break;
        default: numPoints = 5;
    }

    const keyPoints = extractKeyPoints(text, numPoints);
    const concepts = extractConcepts(text);

    if (keyPoints.length === 0) {
        return { content: t('noContent'), stats: null };
    }

    let output = '';

    switch (style) {
        case 'keypoints':
            output += `<h4>${t('keyInsights')}</h4>\n<ul>`;
            keyPoints.forEach(point => {
                output += `<li>${point}</li>`;
            });
            output += '</ul>';

            if (concepts.length > 0) {
                output += `\n<h4>${t('concepts')}</h4>\n<p>${concepts.join('、')}</p>`;
            }
            break;

        case 'narrative':
            const connector = currentLang === 'zh-TW' ? '。' : '. ';
            const intro = currentLang === 'zh-TW' ? '本章主要探討：' : 'This chapter mainly discusses: ';
            output = `<p>${intro}${keyPoints.join(connector)}${connector}</p>`;
            break;

        case 'analytical':
            output += `<h4>${t('mainIdeas')}</h4>\n<ul>`;
            keyPoints.slice(0, Math.ceil(numPoints / 2)).forEach(point => {
                output += `<li>${point}</li>`;
            });
            output += '</ul>';

            output += `\n<h4>${t('analysis')}</h4>\n<p>`;
            const analysisIntro = currentLang === 'zh-TW'
                ? '作者透過以上論述，旨在說明'
                : 'Through the above discussion, the author aims to illustrate ';
            output += analysisIntro + keyPoints.slice(-2).join(currentLang === 'zh-TW' ? '，並且' : ', and ');
            output += currentLang === 'zh-TW' ? '。</p>' : '.</p>';
            break;

        case 'outline':
            const outline = generateOutline(text);
            output += `<h4>${t('chapterOutline')}</h4>\n<ol>`;
            outline.forEach(item => {
                output += `<li><strong>${item.topic}</strong>`;
                if (item.details.length > 0) {
                    output += '<ul>';
                    item.details.forEach(d => {
                        output += `<li>${d}</li>`;
                    });
                    output += '</ul>';
                }
                output += '</li>';
            });
            output += '</ol>';
            break;
    }

    const summaryText = output.replace(/<[^>]*>/g, '');
    const stats = {
        original: text.length,
        summary: summaryText.length,
        keyPoints: keyPoints.length,
        concepts: concepts.length
    };

    return { content: output, stats };
}

function downloadSummary(content, filename) {
    const plainText = content
        .replace(/<h4>/g, '\n\n### ')
        .replace(/<\/h4>/g, '\n')
        .replace(/<ul>/g, '')
        .replace(/<\/ul>/g, '')
        .replace(/<ol>/g, '')
        .replace(/<\/ol>/g, '')
        .replace(/<li><strong>/g, '\n')
        .replace(/<\/strong>/g, '')
        .replace(/<li>/g, '- ')
        .replace(/<\/li>/g, '\n')
        .replace(/<p>/g, '\n')
        .replace(/<\/p>/g, '\n')
        .replace(/<[^>]*>/g, '');

    const blob = new Blob([plainText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'book-summary.txt';
    a.click();
    URL.revokeObjectURL(url);
}

function init() {
    setLanguage(navigator.language.startsWith('zh') ? 'zh-TW' : 'en');

    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    document.getElementById('generateBtn').addEventListener('click', () => {
        const text = document.getElementById('bookInput').value.trim();
        const style = document.getElementById('styleSelect').value;
        const length = document.getElementById('lengthSelect').value;

        if (!text) {
            alert(t('enterContent'));
            return;
        }

        const result = generateSummary(text, style, length);
        document.getElementById('summaryContent').innerHTML = result.content;

        if (result.stats) {
            const ratio = Math.round((result.stats.summary / result.stats.original) * 100);
            document.getElementById('stats').innerHTML = `
                <span>${t('original')}: ${result.stats.original} ${t('chars')}</span>
                <span>${t('summary')}: ${result.stats.summary} ${t('chars')}</span>
                <span>${t('ratio')}: ${ratio}%</span>
            `;
        }

        document.getElementById('outputSection').style.display = 'block';
    });

    document.getElementById('copyBtn').addEventListener('click', () => {
        const content = document.getElementById('summaryContent').innerText;
        navigator.clipboard.writeText(content).then(() => {
            const btn = document.getElementById('copyBtn');
            btn.textContent = t('copied');
            setTimeout(() => btn.textContent = t('copy'), 2000);
        });
    });

    document.getElementById('downloadBtn').addEventListener('click', () => {
        const content = document.getElementById('summaryContent').innerHTML;
        const date = new Date().toISOString().split('T')[0];
        downloadSummary(content, `book-summary-${date}.txt`);
    });
}

init();
