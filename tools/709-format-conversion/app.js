/**
 * Format Conversion - Tool #709
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

    const fromFormat = document.getElementById('fromFormat');
    const toFormat = document.getElementById('toFormat');
    const inputText = document.getElementById('inputText');
    const outputText = document.getElementById('outputText');
    const convertBtn = document.getElementById('convertBtn');
    const outputArea = document.getElementById('outputArea');
    const copyBtn = document.getElementById('copyBtn');
    const downloadBtn = document.getElementById('downloadBtn');

    convertBtn.addEventListener('click', () => {
        const input = inputText.value.trim();
        if (!input) { alert('Please enter content'); return; }

        try {
            const result = convert(input, fromFormat.value, toFormat.value);
            outputText.value = result;
            outputArea.classList.add('visible');
        } catch (e) {
            alert('Conversion error: ' + e.message);
        }
    });

    function convert(input, from, to) {
        // Parse input
        let data;
        switch (from) {
            case 'json':
                data = JSON.parse(input);
                break;
            case 'csv':
                data = parseCSV(input);
                break;
            case 'markdown':
                data = { type: 'markdown', content: input };
                break;
            case 'html':
                data = { type: 'html', content: input };
                break;
            case 'yaml':
                data = parseSimpleYAML(input);
                break;
            default:
                data = { type: 'text', content: input };
        }

        // Convert to output
        switch (to) {
            case 'json':
                return JSON.stringify(data, null, 2);
            case 'csv':
                return toCSV(data);
            case 'markdown':
                return toMarkdown(data, from);
            case 'html':
                return toHTML(data, from);
            case 'yaml':
                return toYAML(data);
            default:
                return data.content || JSON.stringify(data);
        }
    }

    function parseCSV(text) {
        const lines = text.split('\n').filter(l => l.trim());
        const headers = lines[0].split(',').map(h => h.trim());
        return lines.slice(1).map(line => {
            const values = line.split(',');
            const obj = {};
            headers.forEach((h, i) => obj[h] = (values[i] || '').trim());
            return obj;
        });
    }

    function toCSV(data) {
        if (Array.isArray(data) && data.length > 0) {
            const headers = Object.keys(data[0]);
            return [headers.join(','), ...data.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))].join('\n');
        }
        return '';
    }

    function toMarkdown(data, from) {
        if (from === 'html') {
            return data.content
                .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n')
                .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n')
                .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n')
                .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
                .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
                .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
                .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
                .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
                .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
                .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
                .replace(/<br\s*\/?>/gi, '\n')
                .replace(/<[^>]+>/g, '');
        }
        if (Array.isArray(data)) {
            const headers = Object.keys(data[0]);
            return `| ${headers.join(' | ')} |\n| ${headers.map(() => '---').join(' | ')} |\n` +
                data.map(row => `| ${headers.map(h => row[h] || '').join(' | ')} |`).join('\n');
        }
        return JSON.stringify(data, null, 2);
    }

    function toHTML(data, from) {
        if (from === 'markdown') {
            return data.content
                .replace(/^### (.*$)/gm, '<h3>$1</h3>')
                .replace(/^## (.*$)/gm, '<h2>$1</h2>')
                .replace(/^# (.*$)/gm, '<h1>$1</h1>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
                .replace(/^- (.*$)/gm, '<li>$1</li>')
                .replace(/\n\n/g, '</p><p>')
                .replace(/^(.+)$/gm, '<p>$1</p>');
        }
        if (Array.isArray(data)) {
            const headers = Object.keys(data[0]);
            return `<table>\n<thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>\n<tbody>\n` +
                data.map(row => `<tr>${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}</tr>`).join('\n') +
                '\n</tbody>\n</table>';
        }
        return `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    }

    function parseSimpleYAML(text) {
        const obj = {};
        text.split('\n').forEach(line => {
            const match = line.match(/^(\w+):\s*(.*)$/);
            if (match) obj[match[1]] = match[2];
        });
        return obj;
    }

    function toYAML(data) {
        if (typeof data === 'object' && !Array.isArray(data)) {
            return Object.entries(data).map(([k, v]) => `${k}: ${v}`).join('\n');
        }
        if (Array.isArray(data)) {
            return data.map((item, i) => `- item${i + 1}:\n` + Object.entries(item).map(([k, v]) => `    ${k}: ${v}`).join('\n')).join('\n');
        }
        return String(data);
    }

    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(outputText.value);
        copyBtn.textContent = 'Copied!';
        setTimeout(() => copyBtn.textContent = 'Copy', 2000);
    });

    downloadBtn.addEventListener('click', () => {
        const ext = { json: 'json', csv: 'csv', markdown: 'md', html: 'html', yaml: 'yaml', text: 'txt' };
        const blob = new Blob([outputText.value], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `converted.${ext[toFormat.value] || 'txt'}`;
        a.click();
        URL.revokeObjectURL(url);
    });
});
