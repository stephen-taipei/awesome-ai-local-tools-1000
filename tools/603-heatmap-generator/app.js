/**
 * Heatmap Generator - Tool #603
 */

const translations = {
    en: {
        title: 'Heatmap Generator',
        subtitle: 'Visualize data intensity with color gradients',
        privacyBadge: '100% Local Processing',
        uploadText: 'Drag & drop CSV/JSON file or click to upload',
        uploadHint: 'Matrix data with numeric values',
        colorScheme: 'Color Scheme:',
        showValues: 'Show Values:',
        generate: 'Generate Heatmap',
        downloadPng: 'Download PNG',
        reset: 'Reset',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #603'
    },
    zh: {
        title: '熱力圖生成器',
        subtitle: '使用顏色梯度可視化數據強度',
        privacyBadge: '100% 本地處理',
        uploadText: '拖放 CSV/JSON 文件或點擊上傳',
        uploadHint: '包含數值的矩陣數據',
        colorScheme: '顏色方案：',
        showValues: '顯示數值：',
        generate: '生成熱力圖',
        downloadPng: '下載 PNG',
        reset: '重置',
        backToHome: '返回首頁',
        toolNumber: '工具 #603'
    }
};

let currentLang = 'en';
let currentData = null;

const colorSchemes = {
    heat: [[255, 255, 224], [255, 200, 100], [255, 100, 50], [200, 0, 0]],
    cool: [[224, 255, 255], [100, 200, 255], [50, 100, 255], [0, 0, 200]],
    viridis: [[68, 1, 84], [59, 82, 139], [33, 145, 140], [253, 231, 37]],
    plasma: [[13, 8, 135], [126, 3, 168], [240, 99, 93], [240, 249, 33]],
    grayscale: [[255, 255, 255], [170, 170, 170], [85, 85, 85], [0, 0, 0]]
};

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) el.textContent = translations[lang][key];
    });
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');
}

function interpolateColor(colors, t) {
    t = Math.max(0, Math.min(1, t));
    const idx = t * (colors.length - 1);
    const low = Math.floor(idx);
    const high = Math.min(low + 1, colors.length - 1);
    const f = idx - low;
    return [
        Math.round(colors[low][0] + (colors[high][0] - colors[low][0]) * f),
        Math.round(colors[low][1] + (colors[high][1] - colors[low][1]) * f),
        Math.round(colors[low][2] + (colors[high][2] - colors[low][2]) * f)
    ];
}

function parseCSV(text) {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        data.push(lines[i].split(',').map(v => parseFloat(v.trim()) || 0));
    }
    return { headers, data, rowLabels: data.map((_, i) => `Row ${i + 1}`) };
}

function parseJSON(text) {
    const json = JSON.parse(text);
    if (Array.isArray(json) && Array.isArray(json[0])) {
        return { headers: json[0].map((_, i) => `Col ${i + 1}`), data: json, rowLabels: json.map((_, i) => `Row ${i + 1}`) };
    }
    const arr = Array.isArray(json) ? json : [json];
    const headers = Object.keys(arr[0]);
    const data = arr.map(row => headers.map(h => parseFloat(row[h]) || 0));
    return { headers, data, rowLabels: arr.map((_, i) => `Row ${i + 1}`) };
}

function generateHeatmap() {
    const scheme = document.getElementById('colorScheme').value;
    const showValues = document.getElementById('showValues').checked;
    const colors = colorSchemes[scheme];
    const canvas = document.getElementById('heatmapCanvas');
    const ctx = canvas.getContext('2d');

    const cellWidth = 60, cellHeight = 40, padding = 80;
    const cols = currentData.data[0].length, rows = currentData.data.length;
    canvas.width = cols * cellWidth + padding * 2;
    canvas.height = rows * cellHeight + padding * 2;

    const allValues = currentData.data.flat();
    const minVal = Math.min(...allValues), maxVal = Math.max(...allValues);
    const range = maxVal - minVal || 1;

    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw headers
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    currentData.headers.forEach((h, i) => {
        ctx.fillText(h.substring(0, 8), padding + i * cellWidth + cellWidth / 2, padding - 10);
    });

    // Draw heatmap cells
    currentData.data.forEach((row, i) => {
        ctx.textAlign = 'right';
        ctx.fillStyle = '#333';
        ctx.fillText(currentData.rowLabels[i].substring(0, 8), padding - 10, padding + i * cellHeight + cellHeight / 2 + 4);

        row.forEach((val, j) => {
            const t = (val - minVal) / range;
            const color = interpolateColor(colors, t);
            ctx.fillStyle = `rgb(${color[0]},${color[1]},${color[2]})`;
            ctx.fillRect(padding + j * cellWidth, padding + i * cellHeight, cellWidth - 2, cellHeight - 2);

            if (showValues) {
                ctx.fillStyle = t > 0.5 ? '#fff' : '#000';
                ctx.textAlign = 'center';
                ctx.font = '11px Arial';
                ctx.fillText(val.toFixed(1), padding + j * cellWidth + cellWidth / 2, padding + i * cellHeight + cellHeight / 2 + 4);
            }
        });
    });

    // Draw legend
    const legend = document.getElementById('legend');
    legend.innerHTML = `<div style="display:flex;align-items:center;gap:10px;justify-content:center;margin-top:15px;">
        <span>${minVal.toFixed(1)}</span>
        <div style="width:200px;height:20px;background:linear-gradient(to right,rgb(${colors[0].join(',')}),rgb(${colors[Math.floor(colors.length/2)].join(',')}),rgb(${colors[colors.length-1].join(',')}));border-radius:4px;"></div>
        <span>${maxVal.toFixed(1)}</span>
    </div>`;

    document.getElementById('heatmapSection').style.display = 'block';
}

function handleFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            currentData = file.name.endsWith('.json') ? parseJSON(e.target.result) : parseCSV(e.target.result);
            document.getElementById('controlsSection').style.display = 'block';
            document.getElementById('uploadArea').style.display = 'none';
        } catch (err) { alert('Error parsing file'); }
    };
    reader.readAsText(file);
}

function reset() {
    currentData = null;
    document.getElementById('controlsSection').style.display = 'none';
    document.getElementById('heatmapSection').style.display = 'none';
    document.getElementById('uploadArea').style.display = 'block';
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));
    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh'));

    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', e => { e.preventDefault(); uploadArea.classList.add('dragover'); });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
    uploadArea.addEventListener('drop', e => { e.preventDefault(); uploadArea.classList.remove('dragover'); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); });
    fileInput.addEventListener('change', e => { if (e.target.files[0]) handleFile(e.target.files[0]); });

    document.getElementById('generateBtn').addEventListener('click', generateHeatmap);
    document.getElementById('downloadPng').addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'heatmap.png';
        link.href = document.getElementById('heatmapCanvas').toDataURL();
        link.click();
    });
    document.getElementById('resetBtn').addEventListener('click', reset);
});
