#!/usr/bin/env python3
"""Additional fixes reproduced by the full HTTP browser audit."""
from pathlib import Path
import json
import re
R = Path(__file__).resolve().parents[1]
def function(source, name, body):
    result, count = re.subn(rf'(?:async )?function {name}\([^\n]*\) \{{.*?\n\}}', lambda _: body.strip(), source, count=1, flags=re.S)
    if count != 1: raise RuntimeError(f'Missing function {name}')
    return result
p = R / 'tools/009-green-screen/app.js'
s = p.read_text().replace("getElementById('colorInput')", "getElementById('customColor')").replace("getElementById('pickColorBtn')", "getElementById('pickerBtn')")
if 'let processingTimer' not in s: s = s.replace("let currentLang = 'zh';", "let currentLang = 'zh';\nlet processingTimer = null;")
s = function(s, 'initControls', '''function initControls() {
    for (const [slider, label, key, suffix] of [
        [toleranceSlider, toleranceValue, 'tolerance', '%'],
        [softnessSlider, softnessValue, 'softness', '%'],
        [spillSlider, spillValue, 'spillSuppression', '%'],
        [edgeSlider, edgeValue, 'edgeRefinement', 'px']
    ]) {
        currentSettings[key] = Number(slider.value);
        slider.addEventListener('input', () => {
            currentSettings[key] = Number(slider.value);
            label.textContent = slider.value + suffix;
        });
        slider.addEventListener('change', applyChromaKey);
    }
    function chooseColor(hex) {
        const rgb = hexToRgb(hex);
        currentSettings.keyColor = rgbToHsv(rgb.r, rgb.g, rgb.b);
        colorInput.value = hex;
        document.querySelectorAll('.color-preset').forEach(button => button.classList.toggle('active', button.dataset.color === hex));
        applyChromaKey();
    }
    document.querySelectorAll('.color-preset').forEach(button => button.addEventListener('click', () => chooseColor(button.dataset.color)));
    colorInput.addEventListener('input', () => chooseColor(colorInput.value));
    pickColorBtn.addEventListener('click', () => {
        isPickingColor = !isPickingColor;
        pickColorBtn.classList.toggle('active', isPickingColor);
        document.getElementById('pickColorHint').hidden = !isPickingColor;
        for (const canvas of [resultCanvas, originalCanvas]) canvas.style.cursor = isPickingColor ? 'crosshair' : 'default';
    });
    for (const canvas of [resultCanvas, originalCanvas]) canvas.addEventListener('click', event => {
        if (!isPickingColor || !originalImage) return;
        const rect = canvas.getBoundingClientRect();
        const x = Math.max(0, Math.min(canvas.width - 1, Math.floor((event.clientX - rect.left) * canvas.width / rect.width)));
        const y = Math.max(0, Math.min(canvas.height - 1, Math.floor((event.clientY - rect.top) * canvas.height / rect.height)));
        const data = originalCanvas.getContext('2d').getImageData(x, y, 1, 1).data;
        chooseColor(rgbToHex(data[0], data[1], data[2]));
        isPickingColor = false;
        pickColorBtn.classList.remove('active');
        document.getElementById('pickColorHint').hidden = true;
        resultCanvas.style.cursor = originalCanvas.style.cursor = 'default';
    });
    document.querySelectorAll('.preset-btn').forEach(button => button.addEventListener('click', () => applyQuickPreset(button.dataset.preset)));
    document.querySelectorAll('.bg-preset').forEach(button => button.addEventListener('click', () => {
        document.querySelectorAll('.bg-preset').forEach(other => other.classList.toggle('active', other === button));
        currentBgMode = button.dataset.bg === 'checker' ? 'checkerboard' : button.dataset.bg;
        updateBackgroundPreview();
    }));
    document.getElementById('customBgColor').addEventListener('input', event => {
        customBgColor = event.target.value;
        currentBgMode = 'custom';
        document.querySelectorAll('.bg-preset').forEach(button => button.classList.remove('active'));
        updateBackgroundPreview();
    });
    applyBtn.addEventListener('click', applyChromaKey);
    downloadBtn.addEventListener('click', downloadResult);
}''')
s = function(s, 'resetEditor', '''function resetEditor() {
    clearTimeout(processingTimer);
    processingOverlay.style.display = 'none';
    uploadArea.style.display = 'flex';
    editorArea.style.display = 'none';
    originalImage = null;
    fileInput.value = '';
    isPickingColor = false;
    pickColorBtn.classList.remove('active');
    document.getElementById('pickColorHint').hidden = true;
    resultCanvas.style.cursor = originalCanvas.style.cursor = 'default';
}''')
s = s.replace('const width = Math.sqrt(imageData.data.length / 4);\n    const height = imageData.data.length / 4 / width;', 'const width = imageData.width;\n    const height = imageData.height;')
s = function(s, 'gaussianBlur', '''function gaussianBlur(data, width, height, radius) {
    // Separable Gaussian: O(pixels * radius), instead of a quadratic kernel per pixel.
    if (!radius) return new Uint8Array(data);
    const kernel = [], sigma = radius / 2;
    let total = 0;
    for (let offset = -radius; offset <= radius; offset++) {
        const weight = Math.exp(-offset * offset / (2 * sigma * sigma));
        kernel.push(weight); total += weight;
    }
    const temp = new Float32Array(data.length), result = new Uint8Array(data.length);
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
        let value = 0;
        for (let offset = -radius; offset <= radius; offset++) value += data[y * width + Math.max(0, Math.min(width - 1, x + offset))] * kernel[offset + radius];
        temp[y * width + x] = value / total;
    }
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
        let value = 0;
        for (let offset = -radius; offset <= radius; offset++) value += temp[Math.max(0, Math.min(height - 1, y + offset)) * width + x] * kernel[offset + radius];
        result[y * width + x] = Math.round(value / total);
    }
    return result;
}''')
s = s.replace("const previewBox = document.getElementById('previewBox');", "const previewBox = document.querySelector('.checkerboard-bg');")
s = s.replace("        case 'custom':\n            previewBox", "        case 'red':\n            previewBox.style.background = '#ef4444';\n            break;\n        case 'custom':\n            previewBox") if "case 'red':" not in s else s
s = s.replace("    // Use setTimeout to allow UI to update\n    setTimeout(() => {", "    clearTimeout(processingTimer);\n    processingTimer = setTimeout(() => {")
if 'if (softness === 0)' not in s: s = s.replace('if (effectiveDiff < tolerance - softness)', 'if (softness === 0) {\n                alpha = effectiveDiff <= tolerance ? 0 : 255;\n            } else if (effectiveDiff < tolerance - softness)')
if 'Math.min(resultData.data[i + 3], srcData.data[i + 3])' not in s:
    s = s.replace('        resultCtx.putImageData(resultData, 0, 0);', '''        for (let i = 0; i < resultData.data.length; i += 4) {
            resultData.data[i + 3] = Math.min(resultData.data[i + 3], srcData.data[i + 3]);
            maskData.data[i] = maskData.data[i + 1] = maskData.data[i + 2] = resultData.data[i + 3];
        }
        resultCtx.putImageData(resultData, 0, 0);''')
if '10 * 1024 * 1024' not in s:
    s = s.replace('function handleFile(file) {', "function handleFile(file) {\n    if (file.size > 10 * 1024 * 1024) { alert('Maximum image size: 10 MiB.'); return; }")
    s = s.replace('            originalImage = img;', "            if (img.width > 4096 || img.height > 4096) { alert('Maximum dimensions: 4096 x 4096.'); return; }\n            originalImage = img;")
p.write_text(s)
p = p.with_name('index.html'); s = p.read_text()
if 'id="applyBtn"' not in s: s = s.replace('<button id="downloadBtn"', '<button id="applyBtn" class="btn btn-secondary" data-i18n="applyEffect">套用效果</button>\n                            <button id="downloadBtn"')
if 'id="processingOverlay"' not in s: s = s.replace('<div class="preview-box" id="previewBox">', '<p id="pickColorHint" data-i18n="pickColorHint" hidden>點擊圖片吸取顏色</p>\n                        <p id="processingOverlay" style="display:none" role="status" data-i18n="processing">正在處理中...</p>\n                        <div class="preview-box" id="previewBox">')
p.write_text(s)

p = R / 'tools/805-ar-virtual-try-on/app.js'; s = p.read_text()
s = function(s, 'setLang', '''function setLang(lang) {
    if (!i18n[lang]) return;
    currentLang = lang;
    document.documentElement.lang = lang === 'zh' ? 'zh-TW' : 'en';
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const value = i18n[lang][element.dataset.i18n];
        if (value) element.textContent = value;
    });
    document.querySelectorAll('.lang-btn').forEach((button, index) => button.classList.toggle('active', ['en', 'zh'][index] === lang));
    document.getElementById('startBtn').textContent = i18n[lang][isRunning ? 'stop' : 'start'];
}''')
s = function(s, 'showCategory', '''function showCategory(category) {
    if (!Object.hasOwn(items, category)) return;
    if (category !== currentCategory) selectedItem = null;
    currentCategory = category;
    document.querySelectorAll('.tab-btn').forEach((button, index) => button.classList.toggle('active', Object.keys(items)[index] === category));
    const grid = document.getElementById('itemsGrid');
    grid.replaceChildren();
    items[category].forEach(item => {
        const button = document.createElement('button');
        button.type = 'button'; button.className = 'item-card';
        button.classList.toggle('active', selectedItem === item.id);
        button.setAttribute('aria-pressed', String(selectedItem === item.id));
        const icon = document.createElement('div'); icon.className = 'icon'; icon.textContent = item.icon;
        const label = document.createElement('div'); label.className = 'name'; label.textContent = item.name;
        button.append(icon, label);
        button.addEventListener('click', () => selectItem(item.id));
        grid.append(button);
    });
}''')
s = s.replace('Items placed precisely using face tracking', 'Centered sticker preview only; no face tracking is implemented')
s = s.replace('使用臉部追蹤精準定位物品', '置中貼圖示範，尚未實作臉部追蹤')
if 'let cameraRequestId' not in s: s = s.replace('let isRunning = false;', 'let isRunning = false;\nlet cameraRequestId = 0, cameraStarting = false;')
s = function(s, 'startCamera', '''async function startCamera() {
    if (isRunning || cameraStarting) { stopCamera(); return; }
    const request = ++cameraRequestId;
    cameraStarting = true;
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 720, height: 960 } });
        if (request !== cameraRequestId) { stream.getTracks().forEach(track => track.stop()); return; }
        video.onloadedmetadata = () => {
            if (request !== cameraRequestId) return;
            canvas.width = video.videoWidth; canvas.height = video.videoHeight;
            isRunning = true; cameraStarting = false;
            document.getElementById('captureBtn').disabled = false;
            document.getElementById('startBtn').textContent = i18n[currentLang].stop;
            renderLoop();
        };
        video.srcObject = stream;
    } catch (error) {
        if (request === cameraRequestId) { stopCamera(); alert('Camera unavailable: ' + error.message); }
    }
}''')
s = function(s, 'stopCamera', '''function stopCamera() {
    cameraRequestId++;
    cameraStarting = false;
    isRunning = false;
    if (!video) return;
    video.onloadedmetadata = null;
    video.srcObject?.getTracks().forEach(track => track.stop());
    video.srcObject = null;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById('startBtn').textContent = i18n[currentLang].start;
    document.getElementById('captureBtn').disabled = true;
}''')
if "addEventListener('pagehide', stopCamera)" not in s: s += "\nwindow.addEventListener('pagehide', stopCamera);\n"
if 'if (!isRunning || !video.videoWidth)' not in s: s = s.replace('function capturePhoto() {', 'function capturePhoto() {\n    if (!isRunning || !video.videoWidth) return;')
p.write_text(s)
p = p.with_name('index.html');s = p.read_text()
s = s.replace('onclick="capturePhoto()"', 'onclick="capturePhoto()" id="captureBtn" disabled') if 'id="captureBtn"' not in s else s
if 'data-implementation=' not in s: s = s.replace('<body>', '<body data-implementation="demo">')
if '../shared/tool-status.js' not in s: s = s.replace('<script src="app.js">', '<script src="../shared/tool-status.js"></script>\n    <script src="app.js">')
s = s.replace('Items placed precisely using face tracking', 'Centered sticker preview only; no face tracking is implemented')
p.write_text(s)
p = R / 'docs/tool-inventory.json'; entries = json.loads(p.read_text())
for entry in entries:
    if '/805-ar-virtual-try-on/' in entry['path']: entry['status'] = 'demo'
p.write_text(json.dumps(entries, ensure_ascii=False, indent=2) + '\n')
