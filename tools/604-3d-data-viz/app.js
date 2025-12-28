/**
 * 3D Data Visualization - Tool #604
 */

const translations = {
    en: { title: '3D Data Visualization', subtitle: 'Interactive 3D scatter plots and surfaces', privacyBadge: '100% Local Processing', uploadText: 'Drag & drop CSV/JSON file or click to upload', uploadHint: '3D data with X, Y, Z columns', vizType: 'Type:', generate: 'Generate 3D View', resetView: 'Reset View', reset: 'Reset', dragHint: 'Drag to rotate, scroll to zoom', backToHome: 'Back to Home', toolNumber: 'Tool #604' },
    zh: { title: '3D 數據可視化', subtitle: '交互式3D散點圖和曲面', privacyBadge: '100% 本地處理', uploadText: '拖放 CSV/JSON 文件或點擊上傳', uploadHint: '包含 X, Y, Z 列的3D數據', vizType: '類型：', generate: '生成3D視圖', resetView: '重置視角', reset: '重置', dragHint: '拖動旋轉，滾動縮放', backToHome: '返回首頁', toolNumber: '工具 #604' }
};

let currentLang = 'en', currentData = null, scene, camera, renderer, controls;

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
        headers.forEach((h, i) => row[h] = parseFloat(values[i]) || 0);
        return row;
    });
    return { headers, data };
}

function parseJSON(text) {
    const json = JSON.parse(text);
    const data = Array.isArray(json) ? json : [json];
    return { headers: Object.keys(data[0] || {}), data };
}

function populateSelects(headers) {
    ['xCol', 'yCol', 'zCol'].forEach((id, i) => {
        const sel = document.getElementById(id);
        sel.innerHTML = headers.map(h => `<option value="${h}">${h}</option>`).join('');
        if (headers[i]) sel.value = headers[i];
    });
}

function initThree() {
    const container = document.getElementById('threeContainer');
    container.innerHTML = '';
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(5, 5, 5);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    // Axes
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
}

function generate3D() {
    const xCol = document.getElementById('xCol').value;
    const yCol = document.getElementById('yCol').value;
    const zCol = document.getElementById('zCol').value;
    const type = document.getElementById('vizType').value;

    initThree();

    const points = currentData.data.map(row => ({
        x: row[xCol] || 0, y: row[yCol] || 0, z: row[zCol] || 0
    }));

    const maxVal = Math.max(...points.flatMap(p => [Math.abs(p.x), Math.abs(p.y), Math.abs(p.z)])) || 1;
    const scale = 4 / maxVal;

    if (type === 'scatter') {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(points.length * 3);
        points.forEach((p, i) => {
            positions[i * 3] = p.x * scale;
            positions[i * 3 + 1] = p.y * scale;
            positions[i * 3 + 2] = p.z * scale;
        });
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const material = new THREE.PointsMaterial({ color: 0x667eea, size: 0.15 });
        scene.add(new THREE.Points(geometry, material));
    } else if (type === 'bars') {
        points.forEach(p => {
            const height = Math.abs(p.y * scale) || 0.1;
            const geo = new THREE.BoxGeometry(0.2, height, 0.2);
            const mat = new THREE.MeshPhongMaterial({ color: new THREE.Color().setHSL(p.y / maxVal, 0.7, 0.5) });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(p.x * scale, height / 2, p.z * scale);
            scene.add(mesh);
        });
    } else {
        const geo = new THREE.SphereGeometry(0.1, 16, 16);
        points.forEach(p => {
            const mat = new THREE.MeshPhongMaterial({ color: new THREE.Color().setHSL((p.y / maxVal + 1) / 2, 0.7, 0.5) });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(p.x * scale, p.y * scale, p.z * scale);
            scene.add(mesh);
        });
    }

    document.getElementById('vizSection').style.display = 'block';
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

function handleFile(file) {
    const reader = new FileReader();
    reader.onload = e => {
        try {
            currentData = file.name.endsWith('.json') ? parseJSON(e.target.result) : parseCSV(e.target.result);
            populateSelects(currentData.headers);
            document.getElementById('controlsSection').style.display = 'block';
            document.getElementById('uploadArea').style.display = 'none';
        } catch (err) { alert('Error parsing file'); }
    };
    reader.readAsText(file);
}

function reset() {
    currentData = null;
    document.getElementById('controlsSection').style.display = 'none';
    document.getElementById('vizSection').style.display = 'none';
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
    document.getElementById('generateBtn').addEventListener('click', generate3D);
    document.getElementById('resetView').addEventListener('click', () => { camera.position.set(5, 5, 5); camera.lookAt(0, 0, 0); });
    document.getElementById('resetBtn').addEventListener('click', reset);
});
