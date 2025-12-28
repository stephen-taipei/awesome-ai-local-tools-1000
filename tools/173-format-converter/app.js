/**
 * Format Converter - Tool #173
 */
function init() {
    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    document.getElementById('convertBtn').addEventListener('click', convert);
    document.getElementById('swapBtn').addEventListener('click', swapFormats);
    document.getElementById('clearBtn').addEventListener('click', () => {
        document.getElementById('inputText').value = '';
        document.getElementById('outputText').value = '';
        hideError();
    });
    document.getElementById('copyBtn').addEventListener('click', () => {
        const text = document.getElementById('outputText').value;
        if (text) {
            navigator.clipboard.writeText(text).then(() => {
                document.getElementById('copyBtn').textContent = '已複製!';
                setTimeout(() => document.getElementById('copyBtn').textContent = '複製', 2000);
            });
        }
    });
}

function swapFormats() {
    const from = document.getElementById('fromFormat');
    const to = document.getElementById('toFormat');
    const temp = from.value;
    from.value = to.value;
    to.value = temp;
}

function showError(msg) {
    const el = document.getElementById('errorMessage');
    el.textContent = msg;
    el.style.display = 'block';
}

function hideError() {
    document.getElementById('errorMessage').style.display = 'none';
}

function convert() {
    hideError();
    const input = document.getElementById('inputText').value.trim();
    if (!input) { showError('請輸入要轉換的內容'); return; }

    const from = document.getElementById('fromFormat').value;
    const to = document.getElementById('toFormat').value;

    try {
        let data = parseInput(input, from);
        let output = formatOutput(data, to);
        document.getElementById('outputText').value = output;
    } catch (e) {
        showError('轉換失敗: ' + e.message);
    }
}

function parseInput(input, format) {
    switch (format) {
        case 'json':
            return JSON.parse(input);
        case 'yaml':
            return jsyaml.load(input);
        case 'xml':
            return parseXML(input);
        case 'csv':
            return parseCSV(input);
        default:
            throw new Error('不支援的格式');
    }
}

function formatOutput(data, format) {
    switch (format) {
        case 'json':
            return JSON.stringify(data, null, 2);
        case 'yaml':
            return jsyaml.dump(data);
        case 'xml':
            return toXML(data);
        case 'csv':
            return toCSV(data);
        default:
            throw new Error('不支援的格式');
    }
}

function parseXML(xml) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');
    const error = doc.querySelector('parsererror');
    if (error) throw new Error('無效的 XML');
    return xmlToJson(doc.documentElement);
}

function xmlToJson(node) {
    if (node.nodeType === 3) return node.textContent.trim();
    const obj = {};
    if (node.attributes) {
        for (let attr of node.attributes) {
            obj['@' + attr.name] = attr.value;
        }
    }
    for (let child of node.childNodes) {
        if (child.nodeType === 3) {
            const text = child.textContent.trim();
            if (text) obj['#text'] = text;
        } else if (child.nodeType === 1) {
            const name = child.nodeName;
            const value = xmlToJson(child);
            if (obj[name]) {
                if (!Array.isArray(obj[name])) obj[name] = [obj[name]];
                obj[name].push(value);
            } else {
                obj[name] = value;
            }
        }
    }
    return obj;
}

function toXML(data, name = 'root', indent = '') {
    if (typeof data !== 'object' || data === null) {
        return `${indent}<${name}>${escapeXML(String(data))}</${name}>\n`;
    }
    if (Array.isArray(data)) {
        return data.map(item => toXML(item, name, indent)).join('');
    }
    let attrs = '', children = '';
    for (let key in data) {
        if (key.startsWith('@')) {
            attrs += ` ${key.slice(1)}="${escapeXML(data[key])}"`;
        } else if (key === '#text') {
            children += escapeXML(data[key]);
        } else {
            children += toXML(data[key], key, indent + '  ');
        }
    }
    if (children.includes('<')) {
        return `${indent}<${name}${attrs}>\n${children}${indent}</${name}>\n`;
    }
    return `${indent}<${name}${attrs}>${children}</${name}>\n`;
}

function escapeXML(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function parseCSV(csv) {
    const lines = csv.split('\n').filter(l => l.trim());
    if (lines.length < 2) throw new Error('CSV 至少需要標題和一行資料');
    const headers = parseCSVLine(lines[0]);
    return lines.slice(1).map(line => {
        const values = parseCSVLine(line);
        const obj = {};
        headers.forEach((h, i) => obj[h] = values[i] || '');
        return obj;
    });
}

function parseCSVLine(line) {
    const result = [];
    let current = '', inQuotes = false;
    for (let char of line) {
        if (char === '"') inQuotes = !inQuotes;
        else if (char === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
        else current += char;
    }
    result.push(current.trim());
    return result;
}

function toCSV(data) {
    if (!Array.isArray(data)) data = [data];
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const lines = [headers.join(',')];
    data.forEach(row => {
        const values = headers.map(h => {
            const v = String(row[h] || '');
            return v.includes(',') || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v;
        });
        lines.push(values.join(','));
    });
    return lines.join('\n');
}

init();
