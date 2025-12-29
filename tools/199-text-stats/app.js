/**
 * Text Stats - Tool #199
 */

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    document.getElementById('inputText').addEventListener('input', analyze);

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab + '-content').classList.add('active');
        });
    });
}

function analyze() {
    const text = document.getElementById('inputText').value;

    // Basic counts
    const charCount = text.length;
    const charNoSpace = text.replace(/\s/g, '').length;

    // Word count (considering both English words and Chinese characters)
    const englishWords = text.match(/[a-zA-Z]+/g) || [];
    const chineseChars = text.match(/[\u4e00-\u9fff]/g) || [];
    const wordCount = englishWords.length + chineseChars.length;

    // Sentence count
    const sentences = text.split(/[.!?。！？]+/).filter(s => s.trim().length > 0);
    const sentenceCount = sentences.length;

    // Paragraph count
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    const paragraphCount = paragraphs.length || (text.trim() ? 1 : 0);

    // Line count
    const lines = text.split('\n');
    const lineCount = text.trim() ? lines.length : 0;

    // Character type counts
    const chineseCount = chineseChars.length;
    const englishCount = (text.match(/[a-zA-Z]/g) || []).length;
    const numberCount = (text.match(/[0-9]/g) || []).length;
    const punctCount = (text.match(/[.,!?;:'"()[\]{}，。！？；：「」『』（）【】]/g) || []).length;

    // Reading time (assuming 300 Chinese chars or 200 English words per minute)
    const readTime = Math.ceil((chineseCount / 300 + englishWords.length / 200));

    // Speaking time (assuming 150 Chinese chars or 130 English words per minute)
    const speakTime = Math.ceil((chineseCount / 150 + englishWords.length / 130));

    // Update UI
    document.getElementById('charCount').textContent = charCount.toLocaleString();
    document.getElementById('charNoSpace').textContent = charNoSpace.toLocaleString();
    document.getElementById('wordCount').textContent = wordCount.toLocaleString();
    document.getElementById('sentenceCount').textContent = sentenceCount.toLocaleString();
    document.getElementById('paragraphCount').textContent = paragraphCount.toLocaleString();
    document.getElementById('lineCount').textContent = lineCount.toLocaleString();
    document.getElementById('chineseCount').textContent = chineseCount.toLocaleString();
    document.getElementById('englishCount').textContent = englishCount.toLocaleString();
    document.getElementById('numberCount').textContent = numberCount.toLocaleString();
    document.getElementById('punctCount').textContent = punctCount.toLocaleString();
    document.getElementById('readTime').textContent = readTime;
    document.getElementById('speakTime').textContent = speakTime;

    // Show details section if there's text
    if (text.trim()) {
        document.getElementById('detailsSection').style.display = 'block';
        updateFrequency(text);
        updateDistribution(chineseCount, englishCount, numberCount, punctCount);
    } else {
        document.getElementById('detailsSection').style.display = 'none';
    }
}

function updateFrequency(text) {
    // Extract words
    const words = [];

    // Chinese words (2-4 character combinations)
    const chineseText = text.match(/[\u4e00-\u9fff]+/g) || [];
    chineseText.forEach(segment => {
        // Add individual characters
        for (const char of segment) {
            words.push(char);
        }
        // Add 2-character combinations
        for (let i = 0; i < segment.length - 1; i++) {
            words.push(segment.substring(i, i + 2));
        }
    });

    // English words
    const englishWords = text.toLowerCase().match(/[a-z]+/g) || [];
    words.push(...englishWords);

    // Count frequency
    const freq = {};
    words.forEach(w => {
        if (w.length > 1) {
            freq[w] = (freq[w] || 0) + 1;
        }
    });

    // Sort and display top 30
    const sorted = Object.entries(freq)
        .filter(([_, count]) => count > 1)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 30);

    const html = sorted.map(([word, count]) => `
        <div class="freq-item">
            <span class="freq-word">${escapeHtml(word)}</span>
            <span class="freq-count">${count}</span>
        </div>
    `).join('');

    document.getElementById('frequencyList').innerHTML = html || '<p style="color: var(--text-secondary); grid-column: 1/-1; text-align: center;">無足夠資料</p>';
}

function updateDistribution(chinese, english, numbers, punct) {
    const total = chinese + english + numbers + punct;
    if (total === 0) {
        document.getElementById('distributionChart').innerHTML = '<p style="color: var(--text-secondary); text-align: center; width: 100%;">無足夠資料</p>';
        return;
    }

    const data = [
        { label: '中文', count: chinese, color: '#0ea5e9' },
        { label: '英文', count: english, color: '#22c55e' },
        { label: '數字', count: numbers, color: '#f59e0b' },
        { label: '標點', count: punct, color: '#ec4899' }
    ];

    const maxCount = Math.max(...data.map(d => d.count));

    const html = data.map(d => {
        const height = maxCount > 0 ? Math.max(10, (d.count / maxCount) * 150) : 10;
        return `<div class="dist-bar" style="height: ${height}px; background: ${d.color};" data-label="${d.label}" data-count="${d.count}"></div>`;
    }).join('');

    document.getElementById('distributionChart').innerHTML = html;
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

init();
