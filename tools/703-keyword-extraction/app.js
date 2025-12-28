/**
 * Keyword Extraction - Tool #703
 * Extract keywords and key phrases from documents locally
 */

document.addEventListener('DOMContentLoaded', () => {
    // Language switching
    const langBtns = document.querySelectorAll('.lang-btn');
    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            langBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const lang = btn.dataset.lang;
            document.querySelectorAll('.en').forEach(el => el.style.display = lang === 'en' ? '' : 'none');
            document.querySelectorAll('.zh').forEach(el => el.style.display = lang === 'zh' ? '' : 'none');
        });
    });

    // Stop words
    const stopWords = new Set([
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
        'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had',
        'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
        'shall', 'can', 'need', 'dare', 'ought', 'used', 'this', 'that', 'these', 'those',
        'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who', 'whom',
        'if', 'then', 'else', 'when', 'where', 'why', 'how', 'all', 'each', 'every',
        'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only',
        'own', 'same', 'so', 'than', 'too', 'very', 'just', 'also', 'now', 'here', 'there'
    ]);

    // DOM elements
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const textInput = document.getElementById('textInput');
    const extractBtn = document.getElementById('extractBtn');
    const loading = document.getElementById('loading');
    const results = document.getElementById('results');
    const keywordCloud = document.getElementById('keywordCloud');
    const keywordList = document.getElementById('keywordList');
    const copyBtn = document.getElementById('copyBtn');
    const exportBtn = document.getElementById('exportBtn');
    const resetBtn = document.getElementById('resetBtn');

    let extractedKeywords = [];

    // File upload
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); });
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        if (e.dataTransfer.files.length) loadFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) loadFile(e.target.files[0]);
    });

    function loadFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => { textInput.value = e.target.result; };
        reader.readAsText(file);
    }

    // Extract keywords
    extractBtn.addEventListener('click', () => {
        const text = textInput.value.trim();
        if (!text) {
            alert('Please upload a document or paste text');
            return;
        }

        const count = parseInt(document.getElementById('keywordCount').value);
        const mode = document.getElementById('extractionMode').value;

        loading.classList.add('visible');
        results.classList.remove('visible');

        setTimeout(() => {
            extractedKeywords = extractKeywords(text, count, mode);
            displayResults(extractedKeywords);
            loading.classList.remove('visible');
            results.classList.add('visible');
        }, 1000);
    });

    function extractKeywords(text, count, mode) {
        const cleanText = text.toLowerCase().replace(/<[^>]*>/g, '');
        const words = cleanText.match(/\b[a-z\u4e00-\u9fff]{2,}\b/g) || [];

        // Word frequency
        const wordFreq = {};
        words.forEach(word => {
            if (!stopWords.has(word) && word.length > 2) {
                wordFreq[word] = (wordFreq[word] || 0) + 1;
            }
        });

        // Phrase extraction (bigrams and trigrams)
        const phraseFreq = {};
        if (mode === 'phrases' || mode === 'both') {
            for (let i = 0; i < words.length - 1; i++) {
                if (!stopWords.has(words[i]) && !stopWords.has(words[i + 1])) {
                    const bigram = words[i] + ' ' + words[i + 1];
                    phraseFreq[bigram] = (phraseFreq[bigram] || 0) + 1;
                }
                if (i < words.length - 2 && !stopWords.has(words[i]) && !stopWords.has(words[i + 2])) {
                    const trigram = words[i] + ' ' + words[i + 1] + ' ' + words[i + 2];
                    phraseFreq[trigram] = (phraseFreq[trigram] || 0) + 1;
                }
            }
        }

        // Combine and score
        let keywords = [];

        if (mode === 'single' || mode === 'both') {
            for (const [word, freq] of Object.entries(wordFreq)) {
                keywords.push({ text: word, score: freq, type: 'word' });
            }
        }

        if (mode === 'phrases' || mode === 'both') {
            for (const [phrase, freq] of Object.entries(phraseFreq)) {
                if (freq >= 2) {
                    keywords.push({ text: phrase, score: freq * 1.5, type: 'phrase' });
                }
            }
        }

        // Sort by score and take top N
        keywords.sort((a, b) => b.score - a.score);
        return keywords.slice(0, count);
    }

    function displayResults(keywords) {
        // Word cloud
        const maxScore = Math.max(...keywords.map(k => k.score));
        const colors = ['#f093fb', '#f5576c', '#667eea', '#764ba2', '#11998e', '#38ef7d'];

        keywordCloud.innerHTML = keywords.map((kw, i) => {
            const size = 12 + (kw.score / maxScore) * 24;
            const color = colors[i % colors.length];
            return `<span class="keyword-tag" style="font-size:${size}px;background:${color}20;color:${color};border:1px solid ${color}">${kw.text}</span>`;
        }).join('');

        // Ranked list
        keywordList.innerHTML = keywords.slice(0, 20).map((kw, i) => `
            <div class="keyword-item">
                <span class="keyword-rank">${i + 1}</span>
                <span class="keyword-text">${kw.text}</span>
                <span class="keyword-score">Score: ${kw.score.toFixed(1)}</span>
            </div>
        `).join('');
    }

    // Copy
    copyBtn.addEventListener('click', () => {
        const text = extractedKeywords.map(k => k.text).join(', ');
        navigator.clipboard.writeText(text);
        copyBtn.textContent = 'Copied!';
        setTimeout(() => { copyBtn.innerHTML = '<span class="en">Copy Keywords</span><span class="zh">複製關鍵詞</span>'; }, 2000);
    });

    // Export CSV
    exportBtn.addEventListener('click', () => {
        const csv = 'Keyword,Score,Type\n' + extractedKeywords.map(k => `"${k.text}",${k.score},${k.type}`).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'keywords-' + Date.now() + '.csv';
        a.click();
        URL.revokeObjectURL(url);
    });

    // Reset
    resetBtn.addEventListener('click', () => {
        textInput.value = '';
        fileInput.value = '';
        results.classList.remove('visible');
        extractedKeywords = [];
    });
});
