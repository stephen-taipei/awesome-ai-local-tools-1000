/**
 * Regex Generator - Tool #158
 */
const commonPatterns = [
    { name: 'Email', regex: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', flags: 'gi' },
    { name: '網址 URL', regex: 'https?:\\/\\/[\\w\\-._~:/?#[\\]@!$&\'()*+,;=%]+', flags: 'gi' },
    { name: '電話號碼', regex: '0[2-9]\\d{7,8}|09\\d{8}', flags: 'g' },
    { name: '手機號碼', regex: '09\\d{8}', flags: 'g' },
    { name: 'IP 地址', regex: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b', flags: 'g' },
    { name: '日期 YYYY-MM-DD', regex: '\\d{4}-\\d{2}-\\d{2}', flags: 'g' },
    { name: '時間 HH:MM', regex: '(?:[01]\\d|2[0-3]):[0-5]\\d', flags: 'g' },
    { name: 'HTML 標籤', regex: '<[^>]+>', flags: 'g' },
    { name: '十六進制色碼', regex: '#[0-9A-Fa-f]{3,8}', flags: 'gi' },
    { name: '數字', regex: '\\d+', flags: 'g' },
    { name: '英文單字', regex: '[a-zA-Z]+', flags: 'g' },
    { name: '中文字', regex: '[\\u4e00-\\u9fff]+', flags: 'g' },
    { name: '空白字元', regex: '\\s+', flags: 'g' },
    { name: 'UUID', regex: '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', flags: 'gi' },
    { name: '信用卡號', regex: '\\d{4}[- ]?\\d{4}[- ]?\\d{4}[- ]?\\d{4}', flags: 'g' },
    { name: '郵遞區號', regex: '\\d{3}(?:-\\d{2,3})?', flags: 'g' },
];

function escapeHtml(text) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function testRegex(pattern, flags, text) {
    try {
        const regex = new RegExp(pattern, flags);
        const matches = [];
        let match;

        if (flags.includes('g')) {
            while ((match = regex.exec(text)) !== null) {
                matches.push({
                    value: match[0],
                    index: match.index,
                    length: match[0].length
                });
            }
        } else {
            match = regex.exec(text);
            if (match) {
                matches.push({
                    value: match[0],
                    index: match.index,
                    length: match[0].length
                });
            }
        }

        // Create highlighted text
        let highlighted = '';
        let lastIndex = 0;

        for (const m of matches) {
            highlighted += escapeHtml(text.substring(lastIndex, m.index));
            highlighted += `<span class="match">${escapeHtml(m.value)}</span>`;
            lastIndex = m.index + m.length;
        }
        highlighted += escapeHtml(text.substring(lastIndex));

        return {
            success: true,
            matches,
            highlighted,
            unique: [...new Set(matches.map(m => m.value))]
        };
    } catch (e) {
        return {
            success: false,
            error: e.message,
            matches: [],
            highlighted: escapeHtml(text),
            unique: []
        };
    }
}

function renderPatterns() {
    const grid = document.getElementById('patternsGrid');
    grid.innerHTML = commonPatterns.map(p => `
        <div class="pattern-card" data-regex="${escapeHtml(p.regex)}" data-flags="${p.flags}">
            <div class="pattern-name">${p.name}</div>
            <div class="pattern-regex">${escapeHtml(p.regex.substring(0, 30))}${p.regex.length > 30 ? '...' : ''}</div>
        </div>
    `).join('');

    grid.querySelectorAll('.pattern-card').forEach(card => {
        card.addEventListener('click', () => {
            document.getElementById('regexInput').value = card.dataset.regex;
            document.getElementById('flagsInput').value = card.dataset.flags;

            // Auto test if there's text
            const text = document.getElementById('testInput').value;
            if (text) {
                document.getElementById('testBtn').click();
            }
        });
    });
}

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    renderPatterns();

    document.getElementById('testBtn').addEventListener('click', () => {
        const pattern = document.getElementById('regexInput').value;
        const flags = document.getElementById('flagsInput').value;
        const text = document.getElementById('testInput').value;

        if (!pattern || !text) return;

        const result = testRegex(pattern, flags, text);

        document.getElementById('resultSection').style.display = 'block';

        if (result.success) {
            document.getElementById('matchStats').innerHTML = `
                <span>匹配數: <strong>${result.matches.length}</strong></span>
                <span>唯一值: <strong>${result.unique.length}</strong></span>
            `;

            document.getElementById('matchesList').innerHTML = result.unique.length > 0
                ? result.unique.slice(0, 20).map(m => `<span class="match-item">${escapeHtml(m)}</span>`).join('')
                    + (result.unique.length > 20 ? `<span class="match-item">+${result.unique.length - 20} more</span>` : '')
                : '<span style="color: var(--text-secondary);">無匹配</span>';

            document.getElementById('highlightedText').innerHTML = result.highlighted;
        } else {
            document.getElementById('matchStats').innerHTML = `<span style="color: var(--error-color);">錯誤: ${result.error}</span>`;
            document.getElementById('matchesList').innerHTML = '';
            document.getElementById('highlightedText').innerHTML = result.highlighted;
        }
    });

    // Auto test on input change
    let timeout;
    const autoTest = () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            if (document.getElementById('regexInput').value && document.getElementById('testInput').value) {
                document.getElementById('testBtn').click();
            }
        }, 300);
    };

    document.getElementById('regexInput').addEventListener('input', autoTest);
    document.getElementById('flagsInput').addEventListener('input', autoTest);
    document.getElementById('testInput').addEventListener('input', autoTest);
}
init();
