/**
 * Punctuation Fix - Tool #148
 */
function detectLanguage(text) { return /[\u4e00-\u9fff]/.test(text) ? 'zh' : 'en'; }

function fixPunctuation(text) {
    const lang = detectLanguage(text);
    const fixes = [];
    let result = text;

    if (lang === 'zh') {
        // Convert half-width to full-width punctuation
        if (/,(?=[\u4e00-\u9fff])/.test(result)) { result = result.replace(/,(?=[\u4e00-\u9fff])/g, '，'); fixes.push('逗號轉全形'); }
        if (/\.(?=[\u4e00-\u9fff])/.test(result)) { result = result.replace(/\.(?=[\u4e00-\u9fff])/g, '。'); fixes.push('句號轉全形'); }
        if (/!(?=[\u4e00-\u9fff])/.test(result)) { result = result.replace(/!(?=[\u4e00-\u9fff])/g, '！'); fixes.push('驚嘆號轉全形'); }
        if (/\?(?=[\u4e00-\u9fff])/.test(result)) { result = result.replace(/\?(?=[\u4e00-\u9fff])/g, '？'); fixes.push('問號轉全形'); }
    } else {
        // Capitalize after periods
        if (/[.!?]\s*[a-z]/.test(result)) {
            result = result.replace(/([.!?])\s*([a-z])/g, (m, p, l) => p + ' ' + l.toUpperCase());
            fixes.push('Capitalized sentences');
        }
        // Add space after punctuation
        if (/[,.:;!?][a-zA-Z]/.test(result)) {
            result = result.replace(/([,.:;!?])([a-zA-Z])/g, '$1 $2');
            fixes.push('Added spaces');
        }
        // Capitalize first letter
        if (/^[a-z]/.test(result)) {
            result = result.charAt(0).toUpperCase() + result.slice(1);
            fixes.push('Capitalized first letter');
        }
    }

    return { result, fixes };
}

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    document.getElementById('fixBtn').addEventListener('click', () => {
        const text = document.getElementById('textInput').value.trim();
        if (!text) return;
        const { result, fixes } = fixPunctuation(text);
        document.getElementById('resultSection').style.display = 'block';
        document.getElementById('resultContent').textContent = result;
        document.getElementById('fixesList').innerHTML = fixes.length > 0
            ? fixes.map(f => `<span class="fix-tag">✓ ${f}</span>`).join('')
            : '<span style="color: var(--text-secondary)">無需修正</span>';
    });

    document.getElementById('copyBtn').addEventListener('click', () => {
        navigator.clipboard.writeText(document.getElementById('resultContent').textContent);
        document.getElementById('copyBtn').textContent = '已複製！';
        setTimeout(() => document.getElementById('copyBtn').textContent = '複製結果', 2000);
    });

    document.querySelectorAll('.example-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('textInput').value = btn.dataset.text;
            document.getElementById('fixBtn').click();
        });
    });
}
init();
