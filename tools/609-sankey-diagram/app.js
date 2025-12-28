/**
 * Sankey Diagram - Tool #609
 */
const translations = {
    en: { title: 'Sankey Diagram', subtitle: 'Visualize flow and relationships between entities', privacyBadge: '100% Local Processing', uploadText: 'Upload flow data (source, target, value)', uploadHint: 'CSV/JSON with flow relationships', sourceCol: 'Source:', targetCol: 'Target:', valueCol: 'Value:', generate: 'Generate Diagram', download: 'Download SVG', reset: 'Reset', backToHome: 'Back to Home', toolNumber: 'Tool #609' },
    zh: { title: '桑基圖', subtitle: '可視化實體之間的流動和關係', privacyBadge: '100% 本地處理', uploadText: '上傳流程數據（源、目標、值）', uploadHint: 'CSV/JSON 包含流程關係', sourceCol: '源：', targetCol: '目標：', valueCol: '值：', generate: '生成圖表', download: '下載 SVG', reset: '重置', backToHome: '返回首頁', toolNumber: '工具 #609' }
};
let currentLang = 'en', currentData = null;

function setLanguage(lang) { currentLang = lang; document.querySelectorAll('[data-i18n]').forEach(el => { if (translations[lang][el.getAttribute('data-i18n')]) el.textContent = translations[lang][el.getAttribute('data-i18n')]; }); document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active')); document.getElementById(`lang-${lang}`).classList.add('active'); }

function parseData(text, isJSON) {
    if (isJSON) { const json = JSON.parse(text); return { headers: Object.keys((Array.isArray(json) ? json : [json])[0] || {}), data: Array.isArray(json) ? json : [json] }; }
    const lines = text.trim().split('\n'); const headers = lines[0].split(',').map(h => h.trim());
    return { headers, data: lines.slice(1).map(line => { const v = line.split(','); const row = {}; headers.forEach((h, i) => row[h] = v[i]?.trim()); return row; }) };
}

function generateSankey() {
    const sourceCol = document.getElementById('sourceCol').value;
    const targetCol = document.getElementById('targetCol').value;
    const valueCol = document.getElementById('valueCol').value;

    const nodeSet = new Set();
    const links = [];
    currentData.data.forEach(row => {
        const s = row[sourceCol], t = row[targetCol], v = parseFloat(row[valueCol]) || 1;
        if (s && t) { nodeSet.add(s); nodeSet.add(t); links.push({ source: s, target: t, value: v }); }
    });

    const nodes = Array.from(nodeSet).map(name => ({ name }));
    const nodeIndex = {};
    nodes.forEach((n, i) => nodeIndex[n.name] = i);
    links.forEach(l => { l.source = nodeIndex[l.source]; l.target = nodeIndex[l.target]; });

    const container = document.getElementById('sankey');
    container.innerHTML = '';
    const width = container.clientWidth || 800, height = 500;
    const svg = d3.select('#sankey').append('svg').attr('width', width).attr('height', height);

    const sankey = d3.sankey().nodeWidth(20).nodePadding(10).extent([[20, 20], [width - 20, height - 20]]);
    const { nodes: sNodes, links: sLinks } = sankey({ nodes: nodes.map(d => Object.assign({}, d)), links: links.map(d => Object.assign({}, d)) });

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    svg.append('g').selectAll('rect').data(sNodes).join('rect')
        .attr('x', d => d.x0).attr('y', d => d.y0).attr('height', d => d.y1 - d.y0).attr('width', d => d.x1 - d.x0)
        .attr('fill', d => color(d.name)).attr('stroke', '#000');

    svg.append('g').attr('fill', 'none').selectAll('path').data(sLinks).join('path')
        .attr('d', d3.sankeyLinkHorizontal()).attr('stroke', d => color(d.source.name)).attr('stroke-width', d => Math.max(1, d.width)).attr('opacity', 0.5);

    svg.append('g').selectAll('text').data(sNodes).join('text')
        .attr('x', d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6).attr('y', d => (d.y1 + d.y0) / 2).attr('dy', '0.35em')
        .attr('text-anchor', d => d.x0 < width / 2 ? 'start' : 'end').text(d => d.name).attr('font-size', '12px');

    document.getElementById('sankeySection').style.display = 'block';
}

function handleFile(file) { const reader = new FileReader(); reader.onload = e => { try { currentData = parseData(e.target.result, file.name.endsWith('.json')); ['sourceCol', 'targetCol', 'valueCol'].forEach((id, i) => { document.getElementById(id).innerHTML = currentData.headers.map(h => `<option value="${h}">${h}</option>`).join(''); if (currentData.headers[i]) document.getElementById(id).value = currentData.headers[i]; }); document.getElementById('controlsSection').style.display = 'block'; document.getElementById('uploadArea').style.display = 'none'; } catch (err) { alert('Error'); } }; reader.readAsText(file); }

function reset() { currentData = null; document.getElementById('sankey').innerHTML = ''; document.getElementById('controlsSection').style.display = 'none'; document.getElementById('sankeySection').style.display = 'none'; document.getElementById('uploadArea').style.display = 'block'; }

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));
    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh'));
    const uploadArea = document.getElementById('uploadArea'), fileInput = document.getElementById('fileInput');
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', e => { e.preventDefault(); uploadArea.classList.add('dragover'); });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
    uploadArea.addEventListener('drop', e => { e.preventDefault(); uploadArea.classList.remove('dragover'); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); });
    fileInput.addEventListener('change', e => { if (e.target.files[0]) handleFile(e.target.files[0]); });
    document.getElementById('generateBtn').addEventListener('click', generateSankey);
    document.getElementById('downloadBtn').addEventListener('click', () => { const svg = document.querySelector('#sankey svg'); const blob = new Blob([svg.outerHTML], {type: 'image/svg+xml'}); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'sankey.svg'; a.click(); });
    document.getElementById('resetBtn').addEventListener('click', reset);
});
