/**
 * Table Extraction - Tool #708
 */

document.addEventListener('DOMContentLoaded', () => {
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

    let tableData = { headers: [], rows: [] };

    const inputText = document.getElementById('inputText');
    const delimiter = document.getElementById('delimiter');
    const hasHeader = document.getElementById('hasHeader');
    const extractBtn = document.getElementById('extractBtn');
    const loading = document.getElementById('loading');
    const results = document.getElementById('results');
    const tablePreview = document.getElementById('tablePreview');

    extractBtn.addEventListener('click', () => {
        const text = inputText.value.trim();
        if (!text) { alert('Please enter table data'); return; }

        loading.classList.add('visible');
        results.classList.remove('visible');

        setTimeout(() => {
            tableData = parseTable(text);
            displayTable(tableData);
            loading.classList.remove('visible');
            results.classList.add('visible');
        }, 500);
    });

    function parseTable(text) {
        const delim = delimiter.value;
        const lines = text.split('\n').filter(l => l.trim());
        const rows = lines.map(line => {
            return line.split(delim).map(cell => cell.trim());
        });

        if (hasHeader.checked && rows.length > 0) {
            return { headers: rows[0], rows: rows.slice(1) };
        }
        return { headers: rows[0].map((_, i) => `Column ${i + 1}`), rows };
    }

    function displayTable(data) {
        let html = '<table class="extracted-table"><thead><tr>';
        html += data.headers.map(h => `<th>${escapeHtml(h)}</th>`).join('');
        html += '</tr></thead><tbody>';
        html += data.rows.map(row =>
            '<tr>' + row.map(cell => `<td>${escapeHtml(cell)}</td>`).join('') + '</tr>'
        ).join('');
        html += '</tbody></table>';
        tablePreview.innerHTML = html;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    document.getElementById('exportCsv').addEventListener('click', () => {
        const csv = [tableData.headers.join(','), ...tableData.rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
        downloadFile(csv, 'table.csv', 'text/csv');
    });

    document.getElementById('exportJson').addEventListener('click', () => {
        const json = tableData.rows.map(row => {
            const obj = {};
            tableData.headers.forEach((h, i) => obj[h] = row[i] || '');
            return obj;
        });
        downloadFile(JSON.stringify(json, null, 2), 'table.json', 'application/json');
    });

    document.getElementById('exportHtml').addEventListener('click', () => {
        downloadFile(tablePreview.innerHTML, 'table.html', 'text/html');
    });

    document.getElementById('copyTable').addEventListener('click', () => {
        const text = [tableData.headers.join('\t'), ...tableData.rows.map(r => r.join('\t'))].join('\n');
        navigator.clipboard.writeText(text);
        alert('Table copied to clipboard!');
    });

    function downloadFile(content, filename, type) {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }
});
