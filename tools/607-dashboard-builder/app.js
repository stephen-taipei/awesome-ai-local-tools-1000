/**
 * Dashboard Builder - Tool #607
 */
const translations = {
    en: { title: 'Dashboard Builder', subtitle: 'Create interactive data dashboards', privacyBadge: '100% Local Processing', uploadText: 'Upload your data file', uploadHint: 'CSV or JSON format', addWidget: 'Add Widget', add: 'Add', export: 'Export Dashboard', reset: 'Reset', backToHome: 'Back to Home', toolNumber: 'Tool #607', sum: 'Sum', avg: 'Average', count: 'Count', min: 'Min', max: 'Max' },
    zh: { title: '儀表板構建器', subtitle: '創建交互式數據儀表板', privacyBadge: '100% 本地處理', uploadText: '上傳數據文件', uploadHint: 'CSV 或 JSON 格式', addWidget: '添加組件', add: '添加', export: '導出儀表板', reset: '重置', backToHome: '返回首頁', toolNumber: '工具 #607', sum: '總和', avg: '平均', count: '計數', min: '最小', max: '最大' }
};
let currentLang = 'en', currentData = null, widgets = [], chartInstances = [];

function setLanguage(lang) { currentLang = lang; document.querySelectorAll('[data-i18n]').forEach(el => { if (translations[lang][el.getAttribute('data-i18n')]) el.textContent = translations[lang][el.getAttribute('data-i18n')]; }); document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active')); document.getElementById(`lang-${lang}`).classList.add('active'); }

function parseData(text, isJSON) {
    if (isJSON) { const json = JSON.parse(text); return { headers: Object.keys((Array.isArray(json) ? json : [json])[0] || {}), data: Array.isArray(json) ? json : [json] }; }
    const lines = text.trim().split('\n'); const headers = lines[0].split(',').map(h => h.trim());
    return { headers, data: lines.slice(1).map(line => { const v = line.split(','); const row = {}; headers.forEach((h, i) => row[h] = v[i]?.trim()); return row; }) };
}

function addWidget() {
    const type = document.getElementById('widgetType').value;
    const col = document.getElementById('widgetColumn').value;
    const values = currentData.data.map(r => parseFloat(r[col]) || 0).filter(v => !isNaN(v));
    const id = `widget-${Date.now()}`;
    const dashboard = document.getElementById('dashboard');

    const widget = document.createElement('div');
    widget.className = 'widget';
    widget.id = id;

    if (type === 'kpi') {
        const sum = values.reduce((a, b) => a + b, 0);
        const avg = sum / values.length || 0;
        widget.innerHTML = `<div class="widget-header"><h4>${col}</h4><button class="remove-btn" onclick="removeWidget('${id}')">×</button></div>
            <div class="kpi-content"><div class="kpi-item"><span class="kpi-label">${translations[currentLang].sum}</span><span class="kpi-value">${sum.toFixed(2)}</span></div>
            <div class="kpi-item"><span class="kpi-label">${translations[currentLang].avg}</span><span class="kpi-value">${avg.toFixed(2)}</span></div>
            <div class="kpi-item"><span class="kpi-label">${translations[currentLang].count}</span><span class="kpi-value">${values.length}</span></div></div>`;
    } else if (type === 'table') {
        let tableHtml = `<div class="widget-header"><h4>${col}</h4><button class="remove-btn" onclick="removeWidget('${id}')">×</button></div><div class="table-wrap"><table><thead><tr>${currentData.headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>`;
        currentData.data.slice(0, 10).forEach(row => { tableHtml += `<tr>${currentData.headers.map(h => `<td>${row[h] || ''}</td>`).join('')}</tr>`; });
        tableHtml += '</tbody></table></div>';
        widget.innerHTML = tableHtml;
    } else {
        widget.innerHTML = `<div class="widget-header"><h4>${col}</h4><button class="remove-btn" onclick="removeWidget('${id}')">×</button></div><canvas id="chart-${id}"></canvas>`;
        dashboard.appendChild(widget);
        const ctx = document.getElementById(`chart-${id}`).getContext('2d');
        const labels = currentData.data.map((_, i) => i + 1);
        const chart = new Chart(ctx, { type: type === 'pie' ? 'pie' : type, data: { labels: type === 'pie' ? currentData.data.slice(0, 10).map((r, i) => r[currentData.headers[0]] || i) : labels, datasets: [{ label: col, data: type === 'pie' ? values.slice(0, 10) : values, backgroundColor: type === 'pie' ? ['#667eea', '#f093fb', '#4facfe', '#38ef7d', '#f5576c', '#ffd93d', '#6bcb77', '#4d96ff'] : 'rgba(102, 126, 234, 0.6)', borderColor: '#667eea', fill: type === 'line' ? false : true }] }, options: { responsive: true, maintainAspectRatio: false } });
        chartInstances.push(chart);
        return;
    }
    dashboard.appendChild(widget);
}

window.removeWidget = function(id) { document.getElementById(id).remove(); };

function handleFile(file) { const reader = new FileReader(); reader.onload = e => { try { currentData = parseData(e.target.result, file.name.endsWith('.json')); document.getElementById('widgetColumn').innerHTML = currentData.headers.map(h => `<option value="${h}">${h}</option>`).join(''); document.getElementById('builderSection').style.display = 'block'; document.getElementById('uploadArea').style.display = 'none'; } catch (err) { alert('Error'); } }; reader.readAsText(file); }

function reset() { currentData = null; chartInstances.forEach(c => c.destroy()); chartInstances = []; document.getElementById('dashboard').innerHTML = ''; document.getElementById('builderSection').style.display = 'none'; document.getElementById('uploadArea').style.display = 'block'; }

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));
    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh'));
    const uploadArea = document.getElementById('uploadArea'), fileInput = document.getElementById('fileInput');
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', e => { e.preventDefault(); uploadArea.classList.add('dragover'); });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
    uploadArea.addEventListener('drop', e => { e.preventDefault(); uploadArea.classList.remove('dragover'); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); });
    fileInput.addEventListener('change', e => { if (e.target.files[0]) handleFile(e.target.files[0]); });
    document.getElementById('addWidgetBtn').addEventListener('click', addWidget);
    document.getElementById('resetBtn').addEventListener('click', reset);
    document.getElementById('exportBtn').addEventListener('click', () => { const html = document.getElementById('dashboard').innerHTML; const blob = new Blob([`<!DOCTYPE html><html><head><style>${document.querySelector('link[rel="stylesheet"]').href}</style></head><body>${html}</body></html>`], {type: 'text/html'}); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'dashboard.html'; a.click(); });
});
