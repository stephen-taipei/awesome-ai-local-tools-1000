/**
 * Doc Index - Tool #190
 */
let tocData = [];

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    document.getElementById('loadSampleBtn').addEventListener('click', loadSample);
    document.getElementById('generateBtn').addEventListener('click', generate);
    document.getElementById('copyBtn').addEventListener('click', copyToc);

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab + '-content').classList.add('active');
        });
    });
}

function loadSample() {
    document.getElementById('textInput').value = `# 人工智慧簡介

人工智慧是當今最重要的技術之一。

## 什麼是人工智慧

人工智慧是指由機器展現的智慧，特別是電腦系統。

### 人工智慧的歷史

人工智慧的概念最早在 1956 年被提出。

### 人工智慧的應用

人工智慧已經被廣泛應用於各個領域。

## 機器學習

機器學習是人工智慧的一個子領域。

### 監督式學習

監督式學習使用標記的資料進行訓練。

### 非監督式學習

非監督式學習在無標記資料上學習模式。

## 深度學習

深度學習使用多層神經網路。

### 卷積神經網路

CNN 常用於影像識別。

### 循環神經網路

RNN 適合處理序列資料。

## 未來展望

人工智慧將繼續改變我們的生活方式。`;
}

function generate() {
    const text = document.getElementById('textInput').value.trim();
    if (!text) return;

    tocData = generateToc(text);
    const keywords = extractKeywords(text);

    displayToc(tocData);
    displayKeywords(keywords);
    document.getElementById('resultsSection').style.display = 'block';
}

function generateToc(text) {
    const lines = text.split('\n');
    const toc = [];
    const counters = [0, 0, 0];

    lines.forEach((line, index) => {
        const match = line.match(/^(#{1,3})\s+(.+)/);
        if (match) {
            const level = match[1].length;
            const title = match[2].trim();

            // Update counters
            counters[level - 1]++;
            for (let i = level; i < 3; i++) counters[i] = 0;

            const number = counters.slice(0, level).join('.');

            toc.push({ level, title, number, line: index + 1 });
        }
    });

    return toc;
}

function extractKeywords(text) {
    // Remove markdown headers
    const cleanText = text.replace(/^#+\s+.+$/gm, '');

    // Tokenize
    const words = cleanText.toLowerCase()
        .replace(/[，。！？、；：""''（）\[\]{}]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 1);

    // Count frequency
    const freq = {};
    const stopWords = ['的', '是', '在', '和', '與', '了', '有', '個', '這', '那', '一', '為', '被', '將', '等'];

    words.forEach(w => {
        if (!stopWords.includes(w) && w.length > 1) {
            freq[w] = (freq[w] || 0) + 1;
        }
    });

    // Sort by frequency
    return Object.entries(freq)
        .filter(([_, count]) => count > 1)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 30);
}

function displayToc(toc) {
    if (toc.length === 0) {
        document.getElementById('tocList').innerHTML = '<p style="color: var(--text-secondary);">未找到標題</p>';
        return;
    }

    document.getElementById('tocList').innerHTML = toc.map(item => `
        <div class="toc-item level-${item.level}">
            <span class="toc-number">${item.number}</span>
            ${escapeHtml(item.title)}
        </div>
    `).join('');
}

function displayKeywords(keywords) {
    if (keywords.length === 0) {
        document.getElementById('keywordsList').innerHTML = '<p style="color: var(--text-secondary);">未找到關鍵詞</p>';
        return;
    }

    document.getElementById('keywordsList').innerHTML = keywords.map(([word, count]) => `
        <span class="keyword-item">${escapeHtml(word)}<span class="keyword-count">(${count})</span></span>
    `).join('');
}

function copyToc() {
    const tocText = tocData.map(item => {
        const indent = '  '.repeat(item.level - 1);
        return `${indent}${item.number} ${item.title}`;
    }).join('\n');

    navigator.clipboard.writeText(tocText).then(() => {
        const btn = document.getElementById('copyBtn');
        btn.textContent = '已複製!';
        setTimeout(() => btn.textContent = '複製目錄', 2000);
    });
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

init();
