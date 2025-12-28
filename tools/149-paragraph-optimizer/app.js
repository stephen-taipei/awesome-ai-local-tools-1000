/**
 * Paragraph Optimizer - Tool #149
 */
function detectLanguage(text) { return /[\u4e00-\u9fff]/.test(text) ? 'zh' : 'en'; }

function optimizeParagraph(text) {
    const lang = detectLanguage(text);
    const suggestions = [];
    let result = text;

    if (lang === 'zh') {
        // Add punctuation at natural breaks
        if (!/[。！？，]/.test(text)) {
            suggestions.push('添加標點符號');
            // Add periods at natural break points (every ~20 chars)
            const words = text.split('');
            let processed = '';
            let count = 0;
            words.forEach((char, i) => {
                processed += char;
                count++;
                if (count > 15 && /[的了是在和]/.test(char) && i < words.length - 5) {
                    processed += '，';
                    count = 0;
                }
                if (count > 25) {
                    processed += '。';
                    count = 0;
                }
            });
            result = processed;
        }
        // Add paragraph breaks
        if (text.length > 100 && !/\n/.test(text)) {
            suggestions.push('建議分段');
            const mid = Math.floor(result.length / 2);
            const breakPoint = result.indexOf('。', mid) + 1 || mid;
            result = result.slice(0, breakPoint) + '\n\n' + result.slice(breakPoint);
        }
    } else {
        // Add periods at sentence breaks
        if (!/[.!?]/.test(text)) {
            suggestions.push('Added punctuation');
            result = result.replace(/(\s+)(which|and|but|so|because)/gi, '.$1$2');
            if (!/\.$/.test(result)) result += '.';
        }
        // Add paragraph breaks
        if (text.length > 150 && !/\n/.test(text)) {
            suggestions.push('Added paragraph break');
            const sentences = result.split(/(?<=[.!?])\s+/);
            const mid = Math.floor(sentences.length / 2);
            result = sentences.slice(0, mid).join(' ') + '\n\n' + sentences.slice(mid).join(' ');
        }
        // Capitalize sentences
        result = result.replace(/(^|\. )([a-z])/g, (m, p, l) => p + l.toUpperCase());
    }

    const charCount = result.replace(/\s/g, '').length;
    const sentenceCount = (result.match(/[。.!?！？]/g) || []).length || 1;
    const paragraphCount = result.split(/\n\n+/).filter(p => p.trim()).length;

    return { result, suggestions, stats: { chars: charCount, sentences: sentenceCount, paragraphs: paragraphCount } };
}

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    document.getElementById('optimizeBtn').addEventListener('click', () => {
        const text = document.getElementById('textInput').value.trim();
        if (!text) return;
        const { result, suggestions, stats } = optimizeParagraph(text);
        document.getElementById('resultSection').style.display = 'block';
        document.getElementById('statsBar').innerHTML = `
            <div class="stat-item"><div class="stat-value">${stats.chars}</div><div class="stat-label">字元</div></div>
            <div class="stat-item"><div class="stat-value">${stats.sentences}</div><div class="stat-label">句子</div></div>
            <div class="stat-item"><div class="stat-value">${stats.paragraphs}</div><div class="stat-label">段落</div></div>
        `;
        document.getElementById('resultContent').textContent = result;
        document.getElementById('suggestions').innerHTML = suggestions.map(s => `<span class="suggestion-tag">✓ ${s}</span>`).join('');
    });

    document.querySelectorAll('.example-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('textInput').value = btn.dataset.text;
            document.getElementById('optimizeBtn').click();
        });
    });
}
init();
