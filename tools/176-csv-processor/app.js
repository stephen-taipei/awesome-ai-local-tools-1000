/**
 * CSV Processor - Tool #176
 */
let csvData = [];
let headers = [];
let filteredData = [];
let sortColumn = -1;
let sortAsc = true;

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
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    });
    fileInput.addEventListener('change', (e) => {
        if (e.target.files[0]) handleFile(e.target.files[0]);
    });

    document.getElementById('addRowBtn').addEventListener('click', addRow);
    document.getElementById('addColBtn').addEventListener('click', addColumn);
    document.getElementById('sortBtn').addEventListener('click', () => {
        if (sortColumn >= 0) sortByColumn(sortColumn);
    });
    document.getElementById('filterBtn').addEventListener('click', toggleFilter);
    document.getElementById('applyFilter').addEventListener('click', applyFilter);
    document.getElementById('clearFilter').addEventListener('click', clearFilter);
    document.getElementById('downloadBtn').addEventListener('click', downloadCSV);
}

function handleFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        parseCSV(e.target.result);
        document.getElementById('toolsSection').style.display = 'block';
    };
    reader.readAsText(file);
}

function parseCSV(text) {
    const lines = text.split('\n').filter(l => l.trim());
    headers = parseCSVLine(lines[0]);
    csvData = lines.slice(1).map(line => parseCSVLine(line));
    filteredData = [...csvData];

    populateFilterColumn();
    renderTable();
    updateStats();
}

function parseCSVLine(line) {
    const result = [];
    let current = '', inQuotes = false;
    for (let char of line) {
        if (char === '"') inQuotes = !inQuotes;
        else if ((char === ',' || char === '\t') && !inQuotes) { result.push(current.trim()); current = ''; }
        else current += char;
    }
    result.push(current.trim());
    return result;
}

function populateFilterColumn() {
    const select = document.getElementById('filterColumn');
    select.innerHTML = headers.map((h, i) => `<option value="${i}">${h}</option>`).join('');
}

function renderTable() {
    const thead = document.getElementById('tableHead');
    const tbody = document.getElementById('tableBody');

    thead.innerHTML = '<tr>' + headers.map((h, i) =>
        `<th data-col="${i}" class="${sortColumn === i ? (sortAsc ? 'sort-asc' : 'sort-desc') : ''}">${escapeHtml(h)}</th>`
    ).join('') + '</tr>';

    tbody.innerHTML = filteredData.map((row, ri) =>
        '<tr>' + row.map((cell, ci) =>
            `<td><input type="text" value="${escapeHtml(cell)}" data-row="${ri}" data-col="${ci}"></td>`
        ).join('') + '</tr>'
    ).join('');

    thead.querySelectorAll('th').forEach(th => {
        th.addEventListener('click', () => sortByColumn(parseInt(th.dataset.col)));
    });

    tbody.querySelectorAll('input').forEach(input => {
        input.addEventListener('change', (e) => {
            const row = parseInt(e.target.dataset.row);
            const col = parseInt(e.target.dataset.col);
            filteredData[row][col] = e.target.value;
            // Update original data
            const originalIndex = csvData.indexOf(filteredData[row]);
            if (originalIndex >= 0) csvData[originalIndex][col] = e.target.value;
        });
    });
}

function sortByColumn(col) {
    if (sortColumn === col) {
        sortAsc = !sortAsc;
    } else {
        sortColumn = col;
        sortAsc = true;
    }

    filteredData.sort((a, b) => {
        const valA = a[col] || '';
        const valB = b[col] || '';
        const numA = parseFloat(valA);
        const numB = parseFloat(valB);

        if (!isNaN(numA) && !isNaN(numB)) {
            return sortAsc ? numA - numB : numB - numA;
        }
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

    renderTable();
}

function toggleFilter() {
    const bar = document.getElementById('filterBar');
    bar.style.display = bar.style.display === 'none' ? 'flex' : 'none';
}

function applyFilter() {
    const col = parseInt(document.getElementById('filterColumn').value);
    const op = document.getElementById('filterOp').value;
    const val = document.getElementById('filterValue').value.toLowerCase();

    filteredData = csvData.filter(row => {
        const cell = (row[col] || '').toLowerCase();
        switch (op) {
            case 'contains': return cell.includes(val);
            case 'equals': return cell === val;
            case 'starts': return cell.startsWith(val);
            case 'ends': return cell.endsWith(val);
            default: return true;
        }
    });

    renderTable();
    updateStats();
}

function clearFilter() {
    document.getElementById('filterValue').value = '';
    filteredData = [...csvData];
    renderTable();
    updateStats();
}

function addRow() {
    const newRow = headers.map(() => '');
    csvData.push(newRow);
    filteredData.push(newRow);
    renderTable();
    updateStats();
}

function addColumn() {
    const name = prompt('輸入欄位名稱:');
    if (name) {
        headers.push(name);
        csvData.forEach(row => row.push(''));
        filteredData.forEach(row => row.push(''));
        populateFilterColumn();
        renderTable();
        updateStats();
    }
}

function updateStats() {
    document.getElementById('rowCount').textContent = `${filteredData.length} 列`;
    document.getElementById('colCount').textContent = `${headers.length} 欄`;
}

function downloadCSV() {
    const lines = [headers.join(',')];
    csvData.forEach(row => {
        lines.push(row.map(cell => {
            if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
                return `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
        }).join(','));
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'processed.csv';
    a.click();
    URL.revokeObjectURL(url);
}

function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

init();
