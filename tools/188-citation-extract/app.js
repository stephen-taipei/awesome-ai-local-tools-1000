/**
 * Citation Extract - Tool #188
 */
let citations = [];

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    document.getElementById('loadSampleBtn').addEventListener('click', loadSample);
    document.getElementById('extractBtn').addEventListener('click', extract);
    document.getElementById('exportBtn').addEventListener('click', exportCitations);
}

function loadSample() {
    document.getElementById('textInput').value = `根據 Smith et al. (2020) 的研究，人工智慧在醫療診斷方面的應用已經取得了顯著進展。

Johnson & Williams (2019) 指出，深度學習模型在影像識別任務中的準確率已超過人類專家。

正如 "Attention is All You Need" (Vaswani et al., 2017) 一文所述，Transformer 架構徹底改變了自然語言處理領域。

Wang (2021) 在其論文中提到："機器學習的可解釋性對於實際應用至關重要。"

根據 IEEE 期刊上發表的研究 [15]，量子計算可能會對現有加密方法產生重大影響。

參考文獻：
[1] Smith, J., Brown, A., & Lee, C. (2020). AI in Healthcare. Nature Medicine.
[2] Johnson, M. & Williams, R. (2019). Deep Learning for Image Recognition. CVPR.
[3] Vaswani, A. et al. (2017). Attention is All You Need. NeurIPS.`;
}

function extract() {
    const text = document.getElementById('textInput').value.trim();
    if (!text) return;

    citations = extractCitations(text);
    displayResults(citations);
}

function extractCitations(text) {
    const found = [];

    // Pattern 1: Author et al. (Year)
    const pattern1 = /([A-Z][a-zA-Z]+)\s+et\s+al\.\s*\((\d{4})\)/g;
    let match;
    while ((match = pattern1.exec(text)) !== null) {
        found.push({
            type: '學術引用',
            text: match[0],
            author: match[1] + ' et al.',
            year: match[2],
            context: getContext(text, match.index)
        });
    }

    // Pattern 2: Author & Author (Year)
    const pattern2 = /([A-Z][a-zA-Z]+)\s*[&＆]\s*([A-Z][a-zA-Z]+)\s*\((\d{4})\)/g;
    while ((match = pattern2.exec(text)) !== null) {
        found.push({
            type: '學術引用',
            text: match[0],
            author: match[1] + ' & ' + match[2],
            year: match[3],
            context: getContext(text, match.index)
        });
    }

    // Pattern 3: Author (Year)
    const pattern3 = /([A-Z][a-zA-Z]+)\s*\((\d{4})\)/g;
    while ((match = pattern3.exec(text)) !== null) {
        if (!found.some(c => c.text.includes(match[0]))) {
            found.push({
                type: '學術引用',
                text: match[0],
                author: match[1],
                year: match[2],
                context: getContext(text, match.index)
            });
        }
    }

    // Pattern 4: [Number] references
    const pattern4 = /\[(\d+)\]/g;
    while ((match = pattern4.exec(text)) !== null) {
        found.push({
            type: '編號引用',
            text: match[0],
            number: match[1],
            context: getContext(text, match.index)
        });
    }

    // Pattern 5: Quoted text with citation
    const pattern5 = /"([^"]+)"/g;
    while ((match = pattern5.exec(text)) !== null) {
        if (match[1].length > 10) {
            found.push({
                type: '直接引用',
                text: '"' + match[1] + '"',
                context: getContext(text, match.index)
            });
        }
    }

    // Pattern 6: Reference list items
    const pattern6 = /\[(\d+)\]\s*([^[\n]+)/g;
    while ((match = pattern6.exec(text)) !== null) {
        found.push({
            type: '參考文獻',
            text: match[2].trim(),
            number: match[1]
        });
    }

    return found;
}

function getContext(text, index) {
    const start = Math.max(0, index - 50);
    const end = Math.min(text.length, index + 100);
    let context = text.substring(start, end);
    if (start > 0) context = '...' + context;
    if (end < text.length) context = context + '...';
    return context;
}

function displayResults(citations) {
    document.getElementById('citationCount').textContent = `${citations.length} 個引用`;

    if (citations.length === 0) {
        document.getElementById('citationsList').innerHTML = '<p style="color: var(--text-secondary);">未找到引用</p>';
    } else {
        document.getElementById('citationsList').innerHTML = citations.map(c => `
            <div class="citation-item">
                <div class="citation-type">${c.type}</div>
                <div class="citation-text">${escapeHtml(c.text)}</div>
                ${c.context ? `<div class="citation-context">${escapeHtml(c.context)}</div>` : ''}
            </div>
        `).join('');
    }

    document.getElementById('resultsSection').style.display = 'block';
}

function exportCitations() {
    const lines = citations.map((c, i) => `${i + 1}. [${c.type}] ${c.text}`);
    const text = lines.join('\n');

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'citations.txt';
    a.click();
    URL.revokeObjectURL(url);
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

init();
