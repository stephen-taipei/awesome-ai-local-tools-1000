/**
 * Retro Filter
 * Tool #036 - Awesome AI Local Tools
 *
 * WebGL-based image filtering
 */

const translations = {
    'zh-TW': {
        title: '復古濾鏡',
        subtitle: '套用復古、懷舊色調效果，重現經典風格',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        uploadText: '點擊或拖放圖片到這裡',
        uploadHint: '支援 JPG、PNG、WebP 格式',
        filters: '濾鏡選擇',
        adjustments: '細節調整',
        intensity: '濾鏡強度',
        brightness: '亮度',
        contrast: '對比度',
        grain: '顆粒感',
        vignette: '暗角',
        filterNone: '原圖',
        filterSepia: '懷舊',
        filterBW: '黑白',
        filterVintage: '復古',
        filterKodak: '柯達',
        filterPolaroid: '拍立得',
        filterFuji: '富士',
        filterCyberpunk: '賽博龐克',
        reset: '重設',
        download: '下載結果',
        newImage: '選擇新圖片',
        originalSize: '原始尺寸',
        useCases: '使用場景',
        useCaseSocial: '社群媒體復古風格',
        useCaseMemory: '重現老照片質感',
        useCaseArt: '藝術創作與設計',
        backToHome: '返回首頁',
        toolNumber: '工具 #036',
        copyright: 'Awesome AI Local Tools © 2024'
    },
    'en': {
        title: 'Retro Filter',
        subtitle: 'Apply retro and vintage filters to your photos',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        uploadText: 'Click or drag image here',
        uploadHint: 'Supports JPG, PNG, WebP formats',
        filters: 'Filter Selection',
        adjustments: 'Adjustments',
        intensity: 'Intensity',
        brightness: 'Brightness',
        contrast: 'Contrast',
        grain: 'Grain',
        vignette: 'Vignette',
        filterNone: 'None',
        filterSepia: 'Sepia',
        filterBW: 'B&W',
        filterVintage: 'Vintage',
        filterKodak: 'Kodak',
        filterPolaroid: 'Polaroid',
        filterFuji: 'Fuji',
        filterCyberpunk: 'Cyberpunk',
        reset: 'Reset',
        download: 'Download',
        newImage: 'New Image',
        originalSize: 'Original Size',
        useCases: 'Use Cases',
        useCaseSocial: 'Social Media Retro Style',
        useCaseMemory: 'Restore Vintage Feel',
        useCaseArt: 'Artistic Creation',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #036',
        copyright: 'Awesome AI Local Tools © 2024'
    }
};

let currentLang = 'zh-TW';
let gl;
let program;
let originalImageTexture;
let originalImage;
let canvas;

// State
let state = {
    filterType: 0, // 0:None, 1:Sepia, 2:BW, 3:Vintage, 4:Kodak, 5:Polaroid, 6:Fuji, 7:Cyberpunk
    intensity: 1.0,
    brightness: 0.0,
    contrast: 0.0,
    grain: 0.0,
    vignette: 0.0
};

// Filter Mapping
const filterMap = {
    'none': 0,
    'sepia': 1,
    'grayscale': 2,
    'vintage': 3,
    'kodak': 4,
    'polaroid': 5,
    'fuji': 6,
    'cyberpunk': 7
};

document.addEventListener('DOMContentLoaded', () => {
    initLanguage();
    initEventListeners();
    initWebGL();
});

function initLanguage() {
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && translations[savedLang]) {
        currentLang = savedLang;
    }
    updateLanguage();
}

function updateLanguage() {
    const t = translations[currentLang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.textContent = t[key];
    });

    const langZhBtn = document.getElementById('lang-zh');
    const langEnBtn = document.getElementById('lang-en');

    if (currentLang === 'zh-TW') {
        langZhBtn.classList.add('active');
        langEnBtn.classList.remove('active');
    } else {
        langEnBtn.classList.add('active');
        langZhBtn.classList.remove('active');
    }
    localStorage.setItem('preferredLanguage', currentLang);
}

function initEventListeners() {
    document.getElementById('lang-zh').addEventListener('click', () => { currentLang = 'zh-TW'; updateLanguage(); });
    document.getElementById('lang-en').addEventListener('click', () => { currentLang = 'en'; updateLanguage(); });

    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('dragover'); });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        if (e.dataTransfer.files.length) processFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', (e) => { if (e.target.files.length) processFile(e.target.files[0]); });

    // Filter Buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.filterType = filterMap[btn.getAttribute('data-filter')];
            render();
        });
    });

    // Sliders
    const bindSlider = (id, prop, scale = 1, offset = 0) => {
        const slider = document.getElementById(id + 'Slider');
        const valueDisplay = document.getElementById(id + 'Value');
        slider.addEventListener('input', (e) => {
            state[prop] = (parseFloat(e.target.value) / 100) * scale + offset; // Normalize if needed
            // Special handling for display
            if (prop === 'brightness' || prop === 'contrast') {
                 valueDisplay.textContent = e.target.value;
                 state[prop] = parseFloat(e.target.value) / 100;
            } else if (prop === 'intensity') {
                 valueDisplay.textContent = e.target.value + '%';
                 state[prop] = parseFloat(e.target.value) / 100;
            } else {
                 valueDisplay.textContent = e.target.value;
                 state[prop] = parseFloat(e.target.value) / 100;
            }
            render();
        });
    };

    bindSlider('intensity', 'intensity');
    bindSlider('brightness', 'brightness');
    bindSlider('contrast', 'contrast');
    bindSlider('grain', 'grain');
    bindSlider('vignette', 'vignette');

    document.getElementById('resetBtn').addEventListener('click', resetControls);
    document.getElementById('downloadBtn').addEventListener('click', downloadResult);
    document.getElementById('newImageBtn').addEventListener('click', () => location.reload());
}

function processFile(file) {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => loadImage(e.target.result);
    reader.readAsDataURL(file);
}

function loadImage(src) {
    const img = new Image();
    img.onload = () => {
        originalImage = img;
        canvas.width = img.width;
        canvas.height = img.height;
        document.getElementById('originalSize').textContent = `${img.width} x ${img.height}`;

        // Upload Texture
        originalImageTexture = createTexture(gl, img);

        document.getElementById('uploadArea').style.display = 'none';
        document.getElementById('editorArea').style.display = 'block';

        render();
    };
    img.src = src;
}

function initWebGL() {
    canvas = document.getElementById('previewCanvas');
    gl = canvas.getContext('webgl');
    if (!gl) return alert('WebGL not supported');

    const vsSource = document.getElementById('vs').text;
    const fsSource = document.getElementById('fs').text;

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    program = createProgram(gl, vertexShader, fragmentShader);

    // Setup buffers
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1,
    ]), gl.STATIC_DRAW);

    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0, 1,
        1, 1,
        0, 0,
        0, 0,
        1, 1,
        1, 0,
    ]), gl.STATIC_DRAW);

    // Initial State
    resetControls();
}

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
        return null;
    }
    return program;
}

function createTexture(gl, image) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    return texture;
}

function render() {
    if (!originalImageTexture) return;

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.useProgram(program);

    // Bind Position
    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); // Using fresh buffer for simplicity here but better to reuse
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1,
    ]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Bind TexCoord
    const texCoordLocation = gl.getAttribLocation(program, 'texCoord');
    gl.enableVertexAttribArray(texCoordLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0, 1,
        1, 1,
        0, 0,
        0, 0,
        1, 1,
        1, 0,
    ]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

    // Uniforms
    gl.uniform1i(gl.getUniformLocation(program, 'uImage'), 0);
    gl.uniform1f(gl.getUniformLocation(program, 'uIntensity'), state.intensity);
    gl.uniform1f(gl.getUniformLocation(program, 'uBrightness'), state.brightness);
    gl.uniform1f(gl.getUniformLocation(program, 'uContrast'), state.contrast);
    gl.uniform1f(gl.getUniformLocation(program, 'uGrain'), state.grain);
    gl.uniform1f(gl.getUniformLocation(program, 'uVignette'), state.vignette);
    gl.uniform1i(gl.getUniformLocation(program, 'uFilterType'), state.filterType);
    gl.uniform1f(gl.getUniformLocation(program, 'uTime'), Math.random() * 100);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, originalImageTexture);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function resetControls() {
    state = {
        filterType: 0,
        intensity: 1.0,
        brightness: 0.0,
        contrast: 0.0,
        grain: 0.0,
        vignette: 0.0
    };

    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('[data-filter="none"]').classList.add('active');

    document.getElementById('intensitySlider').value = 100;
    document.getElementById('intensityValue').textContent = '100%';

    document.getElementById('brightnessSlider').value = 0;
    document.getElementById('brightnessValue').textContent = '0';

    document.getElementById('contrastSlider').value = 0;
    document.getElementById('contrastValue').textContent = '0';

    document.getElementById('grainSlider').value = 0;
    document.getElementById('grainValue').textContent = '0';

    document.getElementById('vignetteSlider').value = 0;
    document.getElementById('vignetteValue').textContent = '0';

    render();
}

function downloadResult() {
    render(); // Ensure up to date
    const link = document.createElement('a');
    link.download = `retro-filter-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}
