/**
 * Doc Search - Tool #182
 */
let files = [];

function init() {
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');

    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    uploadZone.addEventListener('click', () => fileInput.click());
    uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); uploadZone.classList.add('dragover'); });
    uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });
    fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

    document.getElementById('searchBtn').addEventListener('click', search);
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') search();
    });
}

function handleFiles(fileList) {
    Array.from(fileList).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            files.push({ name: file.name, content: e.target.result });
            renderFileList();
        };
        reader.readAsText(file);
    });
}

function renderFileList() {
    const container = document.getElementById('fileList');
    container.innerHTML = files.map((f, i) => `
        <div class="file-tag">
            <span>📄 ${escapeHtml(f.name)}</span>
            <span class="remove" data-index="${i}">×</span>
        </div>
    `).join('');

    container.querySelectorAll('.remove').forEach(btn => {
        btn.addEventListener('click', () => {
            files.splice(parseInt(btn.dataset.index), 1);
            renderFileList();
        });
    });

    document.getElementById('searchSection').style.display = files.length > 0 ? 'block' : 'none';
}

function search() {
    const query = document.getElementById('searchInput').value.trim();
    if (!query || files.length === 0) return;

    const caseSensitive = document.getElementById('caseSensitive').checked;
    const wholeWord = document.getElementById('wholeWord').checked;
    const useRegex = document.getElementById('useRegex').checked;

    let pattern;
    try {
        if (useRegex) {
            pattern = new RegExp(query, caseSensitive ? 'g' : 'gi');
        } else {
            let escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            if (wholeWord) escaped = `\\b${escaped}\\b`;
            pattern = new RegExp(escaped, caseSensitive ? 'g' : 'gi');
        }
    } catch (e) {
        alert('無效的正規表達式');
        return;
    }

    const results = [];

    files.forEach(file => {
        const lines = file.content.split('\n');
        lines.forEach((line, lineNum) => {
            if (pattern.test(line)) {
                pattern.lastIndex = 0; // Reset regex
                const highlighted = line.replace(pattern, match => `<span class="highlight">${escapeHtml(match)}</span>`);
                results.push({
                    file: file.name,
                    lineNum: lineNum + 1,
                    content: highlighted,
                    raw: line
                });
            }
        });
    });

    displayResults(results);
}

function displayResults(results) {
    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('resultCount').textContent = `${results.length} 個結果`;

    if (results.length === 0) {
        document.getElementById('resultsList').innerHTML = '<p style="color: var(--text-secondary);">找不到符合的結果</p>';
        return;
    }

    document.getElementById('resultsList').innerHTML = results.slice(0, 100).map(r => `
        <div class="result-item">
            <div class="result-file">📄 ${escapeHtml(r.file)}</div>
            <div class="result-line">${r.content}</div>
            <div class="result-context">第 ${r.lineNum} 行</div>
        </div>
    `).join('');

    if (results.length > 100) {
        document.getElementById('resultsList').innerHTML += '<p style="color: var(--text-secondary); margin-top: 1rem;">顯示前 100 個結果...</p>';
    }
}

function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

init();
