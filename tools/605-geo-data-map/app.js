/**
 * Geo Data Map - Tool #605
 */

const translations = {
    en: { title: 'Geo Data Map', subtitle: 'Visualize geographic data on interactive maps', privacyBadge: '100% Local Processing', uploadText: 'Drag & drop CSV/JSON/GeoJSON file', uploadHint: 'Data with latitude/longitude columns', latCol: 'Latitude:', lngCol: 'Longitude:', labelCol: 'Label:', markerType: 'Marker:', generate: 'Generate Map', fitBounds: 'Fit All Points', reset: 'Reset', points: 'Points:', backToHome: 'Back to Home', toolNumber: 'Tool #605' },
    zh: { title: '地理數據地圖', subtitle: '在交互式地圖上可視化地理數據', privacyBadge: '100% 本地處理', uploadText: '拖放 CSV/JSON/GeoJSON 文件', uploadHint: '包含經緯度列的數據', latCol: '緯度：', lngCol: '經度：', labelCol: '標籤：', markerType: '標記：', generate: '生成地圖', fitBounds: '適應所有點', reset: '重置', points: '點數：', backToHome: '返回首頁', toolNumber: '工具 #605' }
};

let currentLang = 'en', currentData = null, map = null, markers = [];

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        if (translations[lang][el.getAttribute('data-i18n')]) el.textContent = translations[lang][el.getAttribute('data-i18n')];
    });
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');
}

function parseCSV(text) {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data = lines.slice(1).map(line => {
        const values = line.split(',');
        const row = {};
        headers.forEach((h, i) => row[h] = values[i]?.trim());
        return row;
    });
    return { headers, data };
}

function parseJSON(text) {
    const json = JSON.parse(text);
    if (json.type === 'FeatureCollection') {
        const data = json.features.map(f => ({
            lat: f.geometry.coordinates[1],
            lng: f.geometry.coordinates[0],
            ...f.properties
        }));
        return { headers: Object.keys(data[0] || {}), data };
    }
    const data = Array.isArray(json) ? json : [json];
    return { headers: Object.keys(data[0] || {}), data };
}

function populateSelects(headers) {
    ['latCol', 'lngCol', 'labelCol'].forEach(id => {
        const sel = document.getElementById(id);
        sel.innerHTML = headers.map(h => `<option value="${h}">${h}</option>`).join('');
    });
    const latGuess = headers.find(h => /lat/i.test(h));
    const lngGuess = headers.find(h => /lng|lon/i.test(h));
    if (latGuess) document.getElementById('latCol').value = latGuess;
    if (lngGuess) document.getElementById('lngCol').value = lngGuess;
}

function generateMap() {
    const latCol = document.getElementById('latCol').value;
    const lngCol = document.getElementById('lngCol').value;
    const labelCol = document.getElementById('labelCol').value;
    const markerType = document.getElementById('markerType').value;

    if (map) { map.remove(); }
    markers = [];

    map = L.map('map').setView([25.0330, 121.5654], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const bounds = [];
    let validCount = 0;

    currentData.data.forEach(row => {
        const lat = parseFloat(row[latCol]);
        const lng = parseFloat(row[lngCol]);
        if (isNaN(lat) || isNaN(lng)) return;

        validCount++;
        bounds.push([lat, lng]);
        const label = row[labelCol] || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

        let marker;
        if (markerType === 'circle') {
            marker = L.circleMarker([lat, lng], { radius: 8, fillColor: '#667eea', color: '#fff', weight: 2, fillOpacity: 0.8 });
        } else {
            marker = L.marker([lat, lng]);
        }
        marker.bindPopup(label).addTo(map);
        markers.push(marker);
    });

    if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [20, 20] });
    }

    document.getElementById('pointCount').textContent = validCount;
    document.getElementById('mapSection').style.display = 'block';
}

function handleFile(file) {
    const reader = new FileReader();
    reader.onload = e => {
        try {
            currentData = file.name.endsWith('.json') || file.name.endsWith('.geojson') ? parseJSON(e.target.result) : parseCSV(e.target.result);
            populateSelects(currentData.headers);
            document.getElementById('controlsSection').style.display = 'block';
            document.getElementById('uploadArea').style.display = 'none';
        } catch (err) { alert('Error parsing file'); console.error(err); }
    };
    reader.readAsText(file);
}

function reset() {
    currentData = null;
    if (map) { map.remove(); map = null; }
    document.getElementById('controlsSection').style.display = 'none';
    document.getElementById('mapSection').style.display = 'none';
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
    document.getElementById('generateBtn').addEventListener('click', generateMap);
    document.getElementById('fitBounds').addEventListener('click', () => {
        if (markers.length > 0) {
            const bounds = markers.map(m => m.getLatLng());
            map.fitBounds(bounds, { padding: [20, 20] });
        }
    });
    document.getElementById('resetBtn').addEventListener('click', reset);
});
