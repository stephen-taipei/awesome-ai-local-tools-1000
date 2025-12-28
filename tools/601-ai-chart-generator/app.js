/**
 * AI Chart Generator - Tool #601
 * Intelligent chart creation from CSV/JSON data
 */

const translations = {
    en: {
        title: 'AI Chart Generator',
        subtitle: 'Intelligent chart creation from your data',
        privacyBadge: '100% Local Processing - Your data never leaves your browser',
        uploadText: 'Drag & drop CSV/JSON file here or click to upload',
        uploadHint: 'Supports CSV and JSON formats',
        chartType: 'Chart Type:',
        barChart: 'Bar Chart',
        lineChart: 'Line Chart',
        pieChart: 'Pie Chart',
        doughnutChart: 'Doughnut Chart',
        polarChart: 'Polar Area',
        radarChart: 'Radar Chart',
        xAxis: 'X-Axis Column:',
        yAxis: 'Y-Axis Column:',
        colorScheme: 'Color Scheme:',
        generate: 'Generate Chart',
        downloadPng: 'Download PNG',
        downloadSvg: 'Download SVG',
        reset: 'Reset',
        dataPreview: 'Data Preview',
        features: 'Features',
        multipleCharts: 'Multiple Chart Types',
        multipleChartsDesc: 'Support for bar, line, pie, doughnut, polar, and radar charts',
        customColors: 'Custom Colors',
        customColorsDesc: 'Choose from multiple color schemes or customize your own',
        exportOptions: 'Export Options',
        exportOptionsDesc: 'Download your charts as PNG or SVG files',
        privacy: 'Privacy First',
        privacyDesc: 'All processing happens locally in your browser',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #601',
        copyright: 'Awesome AI Local Tools',
        errorFile: 'Please upload a valid CSV or JSON file',
        errorParse: 'Error parsing file. Please check the format.'
    },
    zh: {
        title: 'AI 圖表生成器',
        subtitle: '智能數據圖表創建工具',
        privacyBadge: '100% 本地處理 - 數據不離開瀏覽器',
        uploadText: '拖放 CSV/JSON 文件到此處或點擊上傳',
        uploadHint: '支持 CSV 和 JSON 格式',
        chartType: '圖表類型：',
        barChart: '柱狀圖',
        lineChart: '折線圖',
        pieChart: '餅圖',
        doughnutChart: '環形圖',
        polarChart: '極坐標圖',
        radarChart: '雷達圖',
        xAxis: 'X 軸列：',
        yAxis: 'Y 軸列：',
        colorScheme: '顏色方案：',
        generate: '生成圖表',
        downloadPng: '下載 PNG',
        downloadSvg: '下載 SVG',
        reset: '重置',
        dataPreview: '數據預覽',
        features: '功能特點',
        multipleCharts: '多種圖表類型',
        multipleChartsDesc: '支持柱狀圖、折線圖、餅圖、環形圖、極坐標圖和雷達圖',
        customColors: '自定義顏色',
        customColorsDesc: '選擇多種顏色方案或自定義',
        exportOptions: '導出選項',
        exportOptionsDesc: '將圖表下載為 PNG 或 SVG 文件',
        privacy: '隱私優先',
        privacyDesc: '所有處理在瀏覽器本地完成',
        backToHome: '返回首頁',
        toolNumber: '工具 #601',
        copyright: 'Awesome AI 本地工具集',
        errorFile: '請上傳有效的 CSV 或 JSON 文件',
        errorParse: '解析文件錯誤，請檢查格式'
    }
};

let currentLang = 'en';
let currentData = null;
let currentChart = null;

const colorSchemes = {
    default: ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#34495e', '#e67e22'],
    pastel: ['#a8e6cf', '#dcedc1', '#ffd3b6', '#ffaaa5', '#ff8b94', '#b8d4e3', '#f7dc6f', '#bb8fce'],
    vibrant: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9', '#fd79a8', '#6c5ce7'],
    ocean: ['#0077b6', '#00b4d8', '#90e0ef', '#caf0f8', '#03045e', '#023e8a', '#0096c7', '#48cae4'],
    sunset: ['#f72585', '#b5179e', '#7209b7', '#560bad', '#480ca8', '#3a0ca3', '#3f37c9', '#4361ee']
};

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            if (el.tagName === 'OPTION') {
                el.textContent = translations[lang][key];
            } else {
                el.textContent = translations[lang][key];
            }
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
            row[header] = isNaN(values[index]) ? values[index] : parseFloat(values[index]);
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
    const xSelect = document.getElementById('xAxisSelect');
    const ySelect = document.getElementById('yAxisSelect');

    xSelect.innerHTML = '';
    ySelect.innerHTML = '';

    headers.forEach(header => {
        xSelect.innerHTML += `<option value="${header}">${header}</option>`;
        ySelect.innerHTML += `<option value="${header}">${header}</option>`;
    });

    if (headers.length > 1) {
        ySelect.selectedIndex = 1;
    }
}

function renderDataPreview(headers, data) {
    const table = document.getElementById('previewTable');
    let html = '<thead><tr>';
    headers.forEach(h => html += `<th>${h}</th>`);
    html += '</tr></thead><tbody>';

    const previewData = data.slice(0, 10);
    previewData.forEach(row => {
        html += '<tr>';
        headers.forEach(h => html += `<td>${row[h] !== undefined ? row[h] : ''}</td>`);
        html += '</tr>';
    });

    if (data.length > 10) {
        html += `<tr><td colspan="${headers.length}" style="text-align:center">... ${data.length - 10} more rows</td></tr>`;
    }

    html += '</tbody>';
    table.innerHTML = html;
    document.getElementById('dataPreview').style.display = 'block';
}

function generateChart() {
    const chartType = document.getElementById('chartType').value;
    const xAxis = document.getElementById('xAxisSelect').value;
    const yAxis = document.getElementById('yAxisSelect').value;
    const scheme = document.getElementById('colorScheme').value;

    const labels = currentData.data.map(row => row[xAxis]);
    const values = currentData.data.map(row => parseFloat(row[yAxis]) || 0);
    const colors = colorSchemes[scheme];

    if (currentChart) {
        currentChart.destroy();
    }

    const ctx = document.getElementById('chartCanvas').getContext('2d');

    const config = {
        type: chartType,
        data: {
            labels: labels,
            datasets: [{
                label: yAxis,
                data: values,
                backgroundColor: colors.map((c, i) => colors[i % colors.length]),
                borderColor: chartType === 'line' ? colors[0] : colors,
                borderWidth: chartType === 'line' ? 2 : 1,
                fill: chartType === 'line' ? false : true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: ['pie', 'doughnut', 'polarArea'].includes(chartType)
                },
                title: {
                    display: true,
                    text: `${yAxis} by ${xAxis}`
                }
            },
            scales: ['pie', 'doughnut', 'polarArea', 'radar'].includes(chartType) ? {} : {
                y: {
                    beginAtZero: true
                }
            }
        }
    };

    currentChart = new Chart(ctx, config);
    document.getElementById('chartSection').style.display = 'block';
}

function downloadPng() {
    const canvas = document.getElementById('chartCanvas');
    const link = document.createElement('a');
    link.download = 'chart.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

function downloadSvg() {
    const canvas = document.getElementById('chartCanvas');
    const svgData = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">
        <foreignObject width="100%" height="100%">
            <img src="${canvas.toDataURL('image/png')}" width="${canvas.width}" height="${canvas.height}"/>
        </foreignObject>
    </svg>`;
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const link = document.createElement('a');
    link.download = 'chart.svg';
    link.href = URL.createObjectURL(blob);
    link.click();
}

function reset() {
    currentData = null;
    if (currentChart) {
        currentChart.destroy();
        currentChart = null;
    }
    document.getElementById('controlsSection').style.display = 'none';
    document.getElementById('chartSection').style.display = 'none';
    document.getElementById('dataPreview').style.display = 'none';
    document.getElementById('uploadArea').style.display = 'block';
    document.getElementById('fileInput').value = '';
}

function handleFile(file) {
    const reader = new FileReader();

    reader.onload = function(e) {
        try {
            const text = e.target.result;
            let parsed;

            if (file.name.endsWith('.json')) {
                parsed = parseJSON(text);
            } else {
                parsed = parseCSV(text);
            }

            currentData = parsed;
            populateSelects(parsed.headers);
            renderDataPreview(parsed.headers, parsed.data);
            document.getElementById('controlsSection').style.display = 'block';
            document.getElementById('uploadArea').style.display = 'none';

        } catch (error) {
            alert(translations[currentLang].errorParse);
            console.error(error);
        }
    };

    reader.readAsText(file);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));
    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh'));

    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    uploadArea.addEventListener('click', () => fileInput.click());

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleFile(file);
    });

    document.getElementById('generateBtn').addEventListener('click', generateChart);
    document.getElementById('downloadPng').addEventListener('click', downloadPng);
    document.getElementById('downloadSvg').addEventListener('click', downloadSvg);
    document.getElementById('resetBtn').addEventListener('click', reset);
});
