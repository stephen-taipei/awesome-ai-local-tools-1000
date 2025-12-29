/**
 * Network Graph - Tool #606
 */
const translations = {
    en: { title: 'Network Graph', subtitle: 'Visualize relationships and connections', privacyBadge: '100% Local Processing', uploadText: 'Upload edge list (source, target columns)', uploadHint: 'CSV/JSON with connection data', sourceCol: 'Source:', targetCol: 'Target:', layout: 'Layout:', generate: 'Generate Graph', nodes: 'Nodes:', edges: 'Edges:', reset: 'Reset', backToHome: 'Back to Home', toolNumber: 'Tool #606' },
    zh: { title: '網絡圖', subtitle: '可視化關係和連接', privacyBadge: '100% 本地處理', uploadText: '上傳邊列表（源、目標列）', uploadHint: 'CSV/JSON 連接數據', sourceCol: '源：', targetCol: '目標：', layout: '佈局：', generate: '生成圖', nodes: '節點：', edges: '邊：', reset: '重置', backToHome: '返回首頁', toolNumber: '工具 #606' }
};
let currentLang = 'en', currentData = null, network = null;

function setLanguage(lang) { currentLang = lang; document.querySelectorAll('[data-i18n]').forEach(el => { if (translations[lang][el.getAttribute('data-i18n')]) el.textContent = translations[lang][el.getAttribute('data-i18n')]; }); document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active')); document.getElementById(`lang-${lang}`).classList.add('active'); }

function parseData(text, isJSON) {
    if (isJSON) { const json = JSON.parse(text); return { headers: Object.keys((Array.isArray(json) ? json : [json])[0] || {}), data: Array.isArray(json) ? json : [json] }; }
    const lines = text.trim().split('\n'); const headers = lines[0].split(',').map(h => h.trim());
    return { headers, data: lines.slice(1).map(line => { const v = line.split(','); const row = {}; headers.forEach((h, i) => row[h] = v[i]?.trim()); return row; }) };
}

function generateGraph() {
    const sourceCol = document.getElementById('sourceCol').value;
    const targetCol = document.getElementById('targetCol').value;
    const layout = document.getElementById('layout').value;
    const nodesSet = new Set(); const edges = [];
    currentData.data.forEach(row => { const s = row[sourceCol], t = row[targetCol]; if (s && t) { nodesSet.add(s); nodesSet.add(t); edges.push({ from: s, to: t }); } });
    const nodes = Array.from(nodesSet).map((id, i) => ({ id, label: id, color: { background: `hsl(${i * 37 % 360}, 70%, 60%)`, border: '#333' } }));
    document.getElementById('nodeCount').textContent = nodes.length;
    document.getElementById('edgeCount').textContent = edges.length;
    const container = document.getElementById('network');
    const options = { nodes: { shape: 'dot', size: 20, font: { size: 14 } }, edges: { arrows: 'to', smooth: { type: 'curvedCW' } }, physics: layout !== 'hierarchical', layout: layout === 'hierarchical' ? { hierarchical: { direction: 'UD' } } : {} };
    if (network) network.destroy();
    network = new vis.Network(container, { nodes: new vis.DataSet(nodes), edges: new vis.DataSet(edges) }, options);
    if (layout === 'circular') { const r = 250; nodes.forEach((n, i) => { const angle = (2 * Math.PI * i) / nodes.length; network.moveNode(n.id, r * Math.cos(angle), r * Math.sin(angle)); }); }
    document.getElementById('graphSection').style.display = 'block';
}

function handleFile(file) { const reader = new FileReader(); reader.onload = e => { try { currentData = parseData(e.target.result, file.name.endsWith('.json')); ['sourceCol', 'targetCol'].forEach(id => { document.getElementById(id).innerHTML = currentData.headers.map(h => `<option value="${h}">${h}</option>`).join(''); }); if (currentData.headers[1]) document.getElementById('targetCol').value = currentData.headers[1]; document.getElementById('controlsSection').style.display = 'block'; document.getElementById('uploadArea').style.display = 'none'; } catch (err) { alert('Error'); } }; reader.readAsText(file); }

function reset() { currentData = null; if (network) network.destroy(); document.getElementById('controlsSection').style.display = 'none'; document.getElementById('graphSection').style.display = 'none'; document.getElementById('uploadArea').style.display = 'block'; }

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));
    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh'));
    const uploadArea = document.getElementById('uploadArea'), fileInput = document.getElementById('fileInput');
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', e => { e.preventDefault(); uploadArea.classList.add('dragover'); });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
    uploadArea.addEventListener('drop', e => { e.preventDefault(); uploadArea.classList.remove('dragover'); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); });
    fileInput.addEventListener('change', e => { if (e.target.files[0]) handleFile(e.target.files[0]); });
    document.getElementById('generateBtn').addEventListener('click', generateGraph);
    document.getElementById('resetBtn').addEventListener('click', reset);
});
