/**
 * JSON Formatter - Tool #175
 */
function init() {
    const input = document.getElementById('jsonInput');

    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    document.getElementById('formatBtn').addEventListener('click', formatJSON);
    document.getElementById('minifyBtn').addEventListener('click', minifyJSON);
    document.getElementById('validateBtn').addEventListener('click', validateJSON);
    document.getElementById('copyBtn').addEventListener('click', copyJSON);
    document.getElementById('clearBtn').addEventListener('click', () => {
        input.value = '';
        updateStatus('等待輸入...', '');
        document.getElementById('treeSection').style.display = 'none';
    });

    document.getElementById('collapseAll').addEventListener('click', () => toggleAll(true));
    document.getElementById('expandAll').addEventListener('click', () => toggleAll(false));

    input.addEventListener('input', debounce(autoValidate, 300));
}

function debounce(fn, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

function getIndent() {
    const val = document.getElementById('indentSize').value;
    return val === 'tab' ? '\t' : ' '.repeat(parseInt(val));
}

function updateStatus(text, stats, isValid = null) {
    const statusText = document.getElementById('statusText');
    statusText.textContent = text;
    statusText.className = 'status-text' + (isValid === true ? ' valid' : isValid === false ? ' invalid' : '');
    document.getElementById('stats').textContent = stats;
}

function autoValidate() {
    const input = document.getElementById('jsonInput').value.trim();
    if (!input) {
        updateStatus('等待輸入...', '');
        return;
    }
    try {
        const obj = JSON.parse(input);
        const stats = getStats(obj);
        updateStatus('✓ 有效的 JSON', stats, true);
    } catch (e) {
        updateStatus('✗ ' + e.message, '', false);
    }
}

function getStats(obj) {
    let objects = 0, arrays = 0, strings = 0, numbers = 0, booleans = 0, nulls = 0;
    function count(val) {
        if (val === null) nulls++;
        else if (Array.isArray(val)) { arrays++; val.forEach(count); }
        else if (typeof val === 'object') { objects++; Object.values(val).forEach(count); }
        else if (typeof val === 'string') strings++;
        else if (typeof val === 'number') numbers++;
        else if (typeof val === 'boolean') booleans++;
    }
    count(obj);
    return `物件: ${objects} | 陣列: ${arrays} | 字串: ${strings} | 數字: ${numbers}`;
}

function formatJSON() {
    const input = document.getElementById('jsonInput');
    try {
        const obj = JSON.parse(input.value);
        const indent = getIndent();
        input.value = JSON.stringify(obj, null, indent);
        const stats = getStats(obj);
        updateStatus('✓ 已格式化', stats, true);
        renderTree(obj);
    } catch (e) {
        updateStatus('✗ ' + e.message, '', false);
    }
}

function minifyJSON() {
    const input = document.getElementById('jsonInput');
    try {
        const obj = JSON.parse(input.value);
        input.value = JSON.stringify(obj);
        updateStatus('✓ 已壓縮', `${input.value.length} 字元`, true);
    } catch (e) {
        updateStatus('✗ ' + e.message, '', false);
    }
}

function validateJSON() {
    const input = document.getElementById('jsonInput').value.trim();
    try {
        const obj = JSON.parse(input);
        const stats = getStats(obj);
        updateStatus('✓ JSON 驗證通過', stats, true);
        renderTree(obj);
    } catch (e) {
        updateStatus('✗ ' + e.message, '', false);
    }
}

function copyJSON() {
    const text = document.getElementById('jsonInput').value;
    navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById('copyBtn');
        btn.textContent = '已複製!';
        setTimeout(() => btn.textContent = '複製', 2000);
    });
}

function renderTree(obj) {
    const container = document.getElementById('jsonTree');
    container.innerHTML = buildTree(obj, '');
    document.getElementById('treeSection').style.display = 'block';

    container.querySelectorAll('.tree-toggle').forEach(toggle => {
        toggle.addEventListener('click', () => {
            toggle.parentElement.classList.toggle('collapsed');
            toggle.textContent = toggle.parentElement.classList.contains('collapsed') ? '▶' : '▼';
        });
    });
}

function buildTree(val, key) {
    if (val === null) {
        return `<div>${key ? `<span class="tree-key">"${key}"</span>: ` : ''}<span class="tree-null">null</span></div>`;
    }
    if (Array.isArray(val)) {
        if (val.length === 0) {
            return `<div>${key ? `<span class="tree-key">"${key}"</span>: ` : ''}[]</div>`;
        }
        return `<div><span class="tree-toggle">▼</span> ${key ? `<span class="tree-key">"${key}"</span>: ` : ''}[${val.length}]<div class="tree-node">${val.map((v, i) => buildTree(v, '')).join('')}</div>]</div>`;
    }
    if (typeof val === 'object') {
        const keys = Object.keys(val);
        if (keys.length === 0) {
            return `<div>${key ? `<span class="tree-key">"${key}"</span>: ` : ''}{}</div>`;
        }
        return `<div><span class="tree-toggle">▼</span> ${key ? `<span class="tree-key">"${key}"</span>: ` : ''}{${keys.length}}<div class="tree-node">${keys.map(k => buildTree(val[k], k)).join('')}</div>}</div>`;
    }
    if (typeof val === 'string') {
        return `<div>${key ? `<span class="tree-key">"${key}"</span>: ` : ''}<span class="tree-string">"${escapeHtml(val)}"</span></div>`;
    }
    if (typeof val === 'number') {
        return `<div>${key ? `<span class="tree-key">"${key}"</span>: ` : ''}<span class="tree-number">${val}</span></div>`;
    }
    if (typeof val === 'boolean') {
        return `<div>${key ? `<span class="tree-key">"${key}"</span>: ` : ''}<span class="tree-boolean">${val}</span></div>`;
    }
    return '';
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function toggleAll(collapse) {
    document.querySelectorAll('.tree-toggle').forEach(toggle => {
        if (collapse) {
            toggle.parentElement.classList.add('collapsed');
            toggle.textContent = '▶';
        } else {
            toggle.parentElement.classList.remove('collapsed');
            toggle.textContent = '▼';
        }
    });
}

init();
