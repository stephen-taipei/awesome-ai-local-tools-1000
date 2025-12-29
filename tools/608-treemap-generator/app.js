/**
 * Treemap Generator - Tool #608
 */
const translations = {
    en: { title: 'Treemap Generator', subtitle: 'Visualize hierarchical data proportionally', privacyBadge: '100% Local Processing', uploadText: 'Upload hierarchical data', uploadHint: 'CSV/JSON with category and value', categoryCol: 'Category:', valueCol: 'Value:', colorScheme: 'Colors:', generate: 'Generate Treemap', download: 'Download PNG', reset: 'Reset', backToHome: 'Back to Home', toolNumber: 'Tool #608' },
    zh: { title: '樹狀圖生成器', subtitle: '按比例可視化層次數據', privacyBadge: '100% 本地處理', uploadText: '上傳層次數據', uploadHint: 'CSV/JSON 包含類別和數值', categoryCol: '類別：', valueCol: '數值：', colorScheme: '顏色：', generate: '生成樹狀圖', download: '下載 PNG', reset: '重置', backToHome: '返回首頁', toolNumber: '工具 #608' }
};

let currentLang = 'en', currentData = null;
const colorSchemes = {
    default: ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#38ef7d', '#ffd93d', '#ff6b6b'],
    warm: ['#ff6b6b', '#feca57', '#ff9ff3', '#f368e0', '#ff9f43', '#ee5a24', '#ff793f', '#d63031'],
    cool: ['#0984e3', '#00cec9', '#6c5ce7', '#74b9ff', '#81ecec', '#a29bfe', '#55efc4', '#00b894'],
    rainbow: ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6', '#1abc9c', '#34495e']
};

function setLanguage(lang) { currentLang = lang; document.querySelectorAll('[data-i18n]').forEach(el => { if (translations[lang][el.getAttribute('data-i18n')]) el.textContent = translations[lang][el.getAttribute('data-i18n')]; }); document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active')); document.getElementById(`lang-${lang}`).classList.add('active'); }

function parseData(text, isJSON) {
    if (isJSON) { const json = JSON.parse(text); return { headers: Object.keys((Array.isArray(json) ? json : [json])[0] || {}), data: Array.isArray(json) ? json : [json] }; }
    const lines = text.trim().split('\n'); const headers = lines[0].split(',').map(h => h.trim());
    return { headers, data: lines.slice(1).map(line => { const v = line.split(','); const row = {}; headers.forEach((h, i) => row[h] = v[i]?.trim()); return row; }) };
}

function squarify(items, x, y, w, h) {
    const rects = [];
    if (items.length === 0) return rects;
    const total = items.reduce((s, i) => s + i.value, 0);
    let cx = x, cy = y, remainingW = w, remainingH = h;

    items.forEach((item, idx) => {
        const ratio = item.value / total;
        let rectW, rectH;
        if (remainingW > remainingH) {
            rectW = remainingW * ratio * (items.length / (items.length - idx));
            rectH = remainingH;
            rects.push({ ...item, x: cx, y: cy, w: Math.min(rectW, remainingW), h: rectH });
            cx += rectW;
            remainingW -= rectW;
        } else {
            rectW = remainingW;
            rectH = remainingH * ratio * (items.length / (items.length - idx));
            rects.push({ ...item, x: cx, y: cy, w: rectW, h: Math.min(rectH, remainingH) });
            cy += rectH;
            remainingH -= rectH;
        }
    });
    return rects;
}

function generateTreemap() {
    const catCol = document.getElementById('categoryCol').value;
    const valCol = document.getElementById('valueCol').value;
    const colors = colorSchemes[document.getElementById('colorScheme').value];

    const items = currentData.data.map((row, i) => ({
        label: row[catCol] || `Item ${i}`,
        value: parseFloat(row[valCol]) || 0,
        color: colors[i % colors.length]
    })).filter(i => i.value > 0).sort((a, b) => b.value - a.value);

    const container = document.getElementById('treemap');
    const width = container.clientWidth || 800;
    const height = 500;

    const rects = squarify(items, 0, 0, width, height);

    container.innerHTML = `<svg width="${width}" height="${height}" id="treemapSvg">
        ${rects.map(r => `
            <g>
                <rect x="${r.x}" y="${r.y}" width="${Math.max(r.w - 2, 0)}" height="${Math.max(r.h - 2, 0)}" fill="${r.color}" stroke="white" stroke-width="2"/>
                ${r.w > 60 && r.h > 30 ? `<text x="${r.x + r.w/2}" y="${r.y + r.h/2}" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="12" font-weight="bold">${r.label.substring(0, 15)}</text>
                <text x="${r.x + r.w/2}" y="${r.y + r.h/2 + 15}" text-anchor="middle" fill="white" font-size="10">${r.value.toLocaleString()}</text>` : ''}
            </g>
        `).join('')}
    </svg>`;

    document.getElementById('treemapSection').style.display = 'block';
}

function handleFile(file) { const reader = new FileReader(); reader.onload = e => { try { currentData = parseData(e.target.result, file.name.endsWith('.json')); ['categoryCol', 'valueCol'].forEach(id => { document.getElementById(id).innerHTML = currentData.headers.map(h => `<option value="${h}">${h}</option>`).join(''); }); if (currentData.headers[1]) document.getElementById('valueCol').value = currentData.headers[1]; document.getElementById('controlsSection').style.display = 'block'; document.getElementById('uploadArea').style.display = 'none'; } catch (err) { alert('Error'); } }; reader.readAsText(file); }

function reset() { currentData = null; document.getElementById('treemap').innerHTML = ''; document.getElementById('controlsSection').style.display = 'none'; document.getElementById('treemapSection').style.display = 'none'; document.getElementById('uploadArea').style.display = 'block'; }

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));
    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh'));
    const uploadArea = document.getElementById('uploadArea'), fileInput = document.getElementById('fileInput');
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', e => { e.preventDefault(); uploadArea.classList.add('dragover'); });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
    uploadArea.addEventListener('drop', e => { e.preventDefault(); uploadArea.classList.remove('dragover'); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); });
    fileInput.addEventListener('change', e => { if (e.target.files[0]) handleFile(e.target.files[0]); });
    document.getElementById('generateBtn').addEventListener('click', generateTreemap);
    document.getElementById('downloadBtn').addEventListener('click', () => {
        const svg = document.getElementById('treemapSvg');
        const canvas = document.createElement('canvas');
        canvas.width = svg.width.baseVal.value; canvas.height = svg.height.baseVal.value;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => { ctx.drawImage(img, 0, 0); const a = document.createElement('a'); a.download = 'treemap.png'; a.href = canvas.toDataURL(); a.click(); };
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg.outerHTML)));
    });
    document.getElementById('resetBtn').addEventListener('click', reset);
});
