/**
 * Oil Painting Effect
 * Tool #034 - Awesome AI Local Tools
 *
 * WebGL-based Kuwahara filter
 */

const translations = {
    'zh-TW': {
        title: '油畫效果',
        subtitle: '將照片轉換為油畫風格，支援即時預覽與調整',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        uploadText: '點擊或拖放圖片到這裡',
        uploadHint: '支援 JPG、PNG、WebP 格式',
        settings: '效果設定',
        radius: '筆觸大小',
        radiusHelp: '控制油畫筆觸的大小與細節程度',
        intensity: '色彩層次',
        intensityHelp: '控制色彩的豐富度與分層',
        reset: '重設',
        download: '下載結果',
        newImage: '選擇新圖片',
        resolution: '解析度',
        useCases: '使用場景',
        useCaseArt: '藝術創作',
        useCaseGift: '個性化禮物',
        useCaseSocial: '社群分享',
        backToHome: '返回首頁',
        toolNumber: '工具 #034',
        copyright: 'Awesome AI Local Tools © 2024'
    },
    'en': {
        title: 'Oil Painting Effect',
        subtitle: 'Turn your photos into oil paintings locally',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        uploadText: 'Click or drag image here',
        uploadHint: 'Supports JPG, PNG, WebP formats',
        settings: 'Settings',
        radius: 'Brush Size',
        radiusHelp: 'Controls the size of oil painting strokes',
        intensity: 'Color Levels',
        intensityHelp: 'Controls color richness and layering',
        reset: 'Reset',
        download: 'Download',
        newImage: 'New Image',
        resolution: 'Resolution',
        useCases: 'Use Cases',
        useCaseArt: 'Artistic Creation',
        useCaseGift: 'Personalized Gifts',
        useCaseSocial: 'Social Sharing',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #034',
        copyright: 'Awesome AI Local Tools © 2024'
    }
};

let currentLang = 'zh-TW';
let gl;
let program;
let originalImageTexture;
let canvas;
let originalImage;

// State
let state = {
    radius: 4,
    intensity: 10
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

    const bindSlider = (id, prop) => {
        const slider = document.getElementById(id + 'Slider');
        const valueDisplay = document.getElementById(id + 'Value');
        slider.addEventListener('input', (e) => {
            state[prop] = parseInt(e.target.value);
            valueDisplay.textContent = state[prop];
            requestAnimationFrame(render);
        });
    };

    bindSlider('radius', 'radius');
    bindSlider('intensity', 'intensity');

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
        document.getElementById('resolutionVal').textContent = `${img.width} x ${img.height}`;

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

    // Bind attributes
    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1,
    ]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const texCoordLocation = gl.getAttribLocation(program, 'texCoord');
    gl.enableVertexAttribArray(texCoordLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0,
    ]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

    // Uniforms
    gl.uniform1i(gl.getUniformLocation(program, 'uImage'), 0);
    gl.uniform2f(gl.getUniformLocation(program, 'uResolution'), gl.canvas.width, gl.canvas.height);
    gl.uniform1i(gl.getUniformLocation(program, 'uRadius'), state.radius);
    gl.uniform1f(gl.getUniformLocation(program, 'uIntensityLevel'), state.intensity);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, originalImageTexture);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function resetControls() {
    state = {
        radius: 4,
        intensity: 10
    };
    document.getElementById('radiusSlider').value = 4;
    document.getElementById('radiusValue').textContent = '4';
    document.getElementById('intensitySlider').value = 10;
    document.getElementById('intensityValue').textContent = '10';
    render();
}

function downloadResult() {
    render();
    const link = document.createElement('a');
    link.download = `oil-painting-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}
