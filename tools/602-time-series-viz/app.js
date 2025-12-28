/**
 * Time Series Visualization - Tool #602
 */

const translations = {
    en: {
        title: 'Time Series Visualization',
        subtitle: 'Visualize temporal data patterns and trends',
        privacyBadge: '100% Local Processing - Your data never leaves your browser',
        uploadText: 'Drag & drop CSV/JSON file here or click to upload',
        uploadHint: 'Time series data with date/time column',
        dateColumn: 'Date Column:',
        valueColumn: 'Value Column:',
        chartStyle: 'Chart Style:',
        showTrend: 'Show Trend Line:',
        generate: 'Generate Chart',
        downloadPng: 'Download PNG',
        downloadCsv: 'Export CSV',
        reset: 'Reset',
        min: 'Min:',
        max: 'Max:',
        avg: 'Average:',
        trend: 'Trend:',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #602',
        increasing: 'Increasing',
        decreasing: 'Decreasing',
        stable: 'Stable'
    },
    zh: {
        title: '時間序列可視化',
        subtitle: '可視化時間數據模式和趨勢',
        privacyBadge: '100% 本地處理 - 數據不離開瀏覽器',
        uploadText: '拖放 CSV/JSON 文件到此處或點擊上傳',
        uploadHint: '包含日期/時間列的時間序列數據',
        dateColumn: '日期列：',
        valueColumn: '數值列：',
        chartStyle: '圖表樣式：',
        showTrend: '顯示趨勢線：',
        generate: '生成圖表',
        downloadPng: '下載 PNG',
        downloadCsv: '導出 CSV',
        reset: '重置',
        min: '最小值：',
        max: '最大值：',
        avg: '平均值：',
        trend: '趨勢：',
        backToHome: '返回首頁',
        toolNumber: '工具 #602',
        increasing: '上升',
        decreasing: '下降',
        stable: '穩定'
    }
};

let currentLang = 'en';
let currentData = null;
let currentChart = null;

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');
}

function parseCSV(text) {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const row = {};
        headers.forEach((header, index) => {
            row[header] = values[index];
        });
        data.push(row);
    }
    return { headers, data };
}

function parseJSON(text) {
    const json = JSON.parse(text);
    const data = Array.isArray(json) ? json : json.data || [json];
    const headers = Object.keys(data[0] || {});
    return { headers, data };
}

function populateSelects(headers) {
    const dateSelect = document.getElementById('dateColumn');
    const valueSelect = document.getElementById('valueColumn');
    dateSelect.innerHTML = '';
    valueSelect.innerHTML = '';
    headers.forEach(header => {
        dateSelect.innerHTML += `<option value="${header}">${header}</option>`;
        valueSelect.innerHTML += `<option value="${header}">${header}</option>`;
    });
    if (headers.length > 1) valueSelect.selectedIndex = 1;
}

function calculateTrend(values) {
    const n = values.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    for (let i = 0; i < n; i++) {
        sumX += i;
        sumY += values[i];
        sumXY += i * values[i];
        sumX2 += i * i;
    }
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
}

function generateChart() {
    const dateCol = document.getElementById('dateColumn').value;
    const valueCol = document.getElementById('valueColumn').value;
    const style = document.getElementById('chartStyle').value;
    const showTrend = document.getElementById('showTrend').checked;

    const labels = currentData.data.map(row => row[dateCol]);
    const values = currentData.data.map(row => parseFloat(row[valueCol]) || 0);

    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const trendSlope = calculateTrend(values);

    document.getElementById('statMin').textContent = min.toFixed(2);
    document.getElementById('statMax').textContent = max.toFixed(2);
    document.getElementById('statAvg').textContent = avg.toFixed(2);

    let trendText = translations[currentLang].stable;
    if (trendSlope > 0.1) trendText = translations[currentLang].increasing;
    else if (trendSlope < -0.1) trendText = translations[currentLang].decreasing;
    document.getElementById('statTrend').textContent = trendText;

    if (currentChart) currentChart.destroy();

    const ctx = document.getElementById('chartCanvas').getContext('2d');
    const datasets = [{
        label: valueCol,
        data: values,
        borderColor: '#667eea',
        backgroundColor: style === 'area' ? 'rgba(102, 126, 234, 0.3)' : 'rgba(102, 126, 234, 0.8)',
        fill: style === 'area',
        tension: style === 'step' ? 0 : 0.4,
        stepped: style === 'step'
    }];

    if (showTrend) {
        const trendLine = values.map((_, i) => avg + trendSlope * (i - values.length / 2));
        datasets.push({
            label: 'Trend',
            data: trendLine,
            borderColor: '#e74c3c',
            borderDash: [5, 5],
            fill: false,
            pointRadius: 0
        });
    }

    currentChart = new Chart(ctx, {
        type: style === 'bar' ? 'bar' : 'line',
        data: { labels, datasets },
        options: {
            responsive: true,
            plugins: { legend: { display: true } },
            scales: { y: { beginAtZero: false } }
        }
    });

    document.getElementById('chartSection').style.display = 'block';
}

function handleFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const text = e.target.result;
            currentData = file.name.endsWith('.json') ? parseJSON(text) : parseCSV(text);
            populateSelects(currentData.headers);
            document.getElementById('controlsSection').style.display = 'block';
            document.getElementById('uploadArea').style.display = 'none';
        } catch (error) {
            alert('Error parsing file');
            console.error(error);
        }
    };
    reader.readAsText(file);
}

function reset() {
    currentData = null;
    if (currentChart) { currentChart.destroy(); currentChart = null; }
    document.getElementById('controlsSection').style.display = 'none';
    document.getElementById('chartSection').style.display = 'none';
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
    uploadArea.addEventListener('drop', e => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', e => { if (e.target.files[0]) handleFile(e.target.files[0]); });

    document.getElementById('generateBtn').addEventListener('click', generateChart);
    document.getElementById('downloadPng').addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'time-series.png';
        link.href = document.getElementById('chartCanvas').toDataURL();
        link.click();
    });
    document.getElementById('resetBtn').addEventListener('click', reset);
});
