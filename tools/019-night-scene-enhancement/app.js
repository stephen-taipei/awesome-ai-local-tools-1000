/**
 * Night Scene Enhancement - Tool #019
 * Uses WebGL for Low-light enhancement (Gamma Correction + Local Contrast + Denoise)
 */

const translations = {
    'zh-TW': {
        title: '夜景增強',
        subtitle: '提升夜間/低光照片的亮度與清晰度',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        uploadText: '拖放圖片到此處或點擊上傳',
        uploadHint: '支援 PNG、JPG、WebP',
        preview: '預覽',
        brightness: '提亮程度',
        contrast: '對比度保留',
        denoise: '噪點抑制',
        uploadAnother: '重新上傳',
        download: '下載圖片',
        techSpecs: '技術規格',
        specTech: '技術核心',
        specSpeed: '處理速度',
        specPrivacy: '隱私保護',
        realTime: '即時 (Real-time)',
        localProcessing: '100% 本地運算',
        backToHome: '返回首頁',
        toolNumber: '工具 #019',
        errorFileType: '請上傳圖片檔案',
        webglError: '您的瀏覽器不支援 WebGL'
    },
    'en': {
        title: 'Night Scene Enhancement',
        subtitle: 'Enhance brightness and clarity of low-light photos',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        uploadText: 'Drag & drop image here or click to upload',
        uploadHint: 'Supports PNG, JPG, WebP',
        preview: 'Preview',
        brightness: 'Brightness',
        contrast: 'Contrast Preservation',
        denoise: 'Noise Reduction',
        uploadAnother: 'Upload Another',
        download: 'Download',
        techSpecs: 'Technical Specs',
        specTech: 'Core Tech',
        specSpeed: 'Speed',
        specPrivacy: 'Privacy',
        realTime: 'Real-time',
        localProcessing: '100% Local Processing',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #019',
        errorFileType: 'Please upload an image file',
        webglError: 'Your browser does not support WebGL'
    }
};

let currentLang = 'zh-TW';
let gl = null;
let program = null;
let texture = null;
let image = null;

// DOM Elements
const elements = {
    uploadArea: document.getElementById('uploadArea'),
    fileInput: document.getElementById('fileInput'),
    editorArea: document.getElementById('editorArea'),
    canvas: document.getElementById('previewCanvas'),
    resetBtn: document.getElementById('resetBtn'),
    downloadBtn: document.getElementById('downloadBtn'),
    controls: {
        brightness: document.getElementById('brightness'),
        contrast: document.getElementById('contrast'),
        denoise: document.getElementById('denoise')
    }
};

// Shaders
const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec2 aTextureCoord;
    varying highp vec2 vTextureCoord;
    void main(void) {
        gl_Position = aVertexPosition;
        vTextureCoord = aTextureCoord;
    }
`;

const fsSource = `
    precision highp float;
    varying highp vec2 vTextureCoord;
    uniform sampler2D uSampler;
    uniform vec2 uResolution;

    uniform float uBrightness; // 0.0 to 1.0 (actually maps to gamma)
    uniform float uContrast;   // 0.0 to 1.0
    uniform float uDenoise;    // 0.0 to 1.0

    void main(void) {
        vec4 color = texture2D(uSampler, vTextureCoord);

        // 1. Denoise (Simple Median-ish or blur based on brightness)
        // Since we are brightening, noise becomes visible. We apply mild blur to dark areas before brightening.

        vec4 blurred = vec4(0.0);
        float blurSize = uDenoise * 2.0 / uResolution.x; // max 2px
        if (blurSize > 0.0) {
            blurred += texture2D(uSampler, vTextureCoord + vec2(-blurSize, -blurSize));
            blurred += texture2D(uSampler, vTextureCoord + vec2(0.0, -blurSize));
            blurred += texture2D(uSampler, vTextureCoord + vec2(blurSize, -blurSize));
            blurred += texture2D(uSampler, vTextureCoord + vec2(-blurSize, 0.0));
            blurred += texture2D(uSampler, vTextureCoord);
            blurred += texture2D(uSampler, vTextureCoord + vec2(blurSize, 0.0));
            blurred += texture2D(uSampler, vTextureCoord + vec2(-blurSize, blurSize));
            blurred += texture2D(uSampler, vTextureCoord + vec2(0.0, blurSize));
            blurred += texture2D(uSampler, vTextureCoord + vec2(blurSize, blurSize));
            blurred /= 9.0;

            // Mix original and blurred based on luminance (blur more in darks)
            float lum = dot(color.rgb, vec3(0.299, 0.587, 0.114));
            color = mix(blurred, color, smoothstep(0.0, 0.5, lum)); // Keep highlights sharp
        }

        // 2. Brightness Enhancement (Gamma Correction curve)
        // Adjust gamma based on brightness control
        // Low light enhancement usually means gamma < 1.0
        float gamma = 1.0 - (uBrightness * 0.6); // range 1.0 down to 0.4

        color.rgb = pow(color.rgb, vec3(gamma));

        // 3. Contrast Restoration (S-curve)
        // Boosting gamma washes out contrast, so we add some back
        // Simple contrast adjustment
        float contrastFactor = 1.0 + (uContrast * 0.5);
        color.rgb = (color.rgb - 0.5) * contrastFactor + 0.5;

        gl_FragColor = vec4(clamp(color.rgb, 0.0, 1.0), color.a);
    }
`;

function initWebGL() {
    gl = elements.canvas.getContext('webgl') || elements.canvas.getContext('experimental-webgl');
    if (!gl) {
        alert(translations[currentLang].webglError);
        return false;
    }

    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
    program = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
        },
        uniformLocations: {
            sampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
            resolution: gl.getUniformLocation(shaderProgram, 'uResolution'),
            brightness: gl.getUniformLocation(shaderProgram, 'uBrightness'),
            contrast: gl.getUniformLocation(shaderProgram, 'uContrast'),
            denoise: gl.getUniformLocation(shaderProgram, 'uDenoise'),
        },
    };

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [ -1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0 ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    const textureCoordinates = [ 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0 ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);

    program.buffers = { position: positionBuffer, textureCoord: textureCoordBuffer };

    return true;
}

function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) return null;
    return shaderProgram;
}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function initTexture(gl, image) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    return texture;
}

function drawScene() {
    if (!gl || !program || !texture) return;

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program.program);

    gl.bindBuffer(gl.ARRAY_BUFFER, program.buffers.position);
    gl.vertexAttribPointer(program.attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.attribLocations.vertexPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, program.buffers.textureCoord);
    gl.vertexAttribPointer(program.attribLocations.textureCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.attribLocations.textureCoord);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(program.uniformLocations.sampler, 0);

    const brightness = parseInt(elements.controls.brightness.value) / 100.0;
    const contrast = parseInt(elements.controls.contrast.value) / 100.0;
    const denoise = parseInt(elements.controls.denoise.value) / 100.0;

    gl.uniform2f(program.uniformLocations.resolution, gl.canvas.width, gl.canvas.height);
    gl.uniform1f(program.uniformLocations.brightness, brightness);
    gl.uniform1f(program.uniformLocations.contrast, contrast);
    gl.uniform1f(program.uniformLocations.denoise, denoise);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

function handleFileSelect(file) {
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
        alert(translations[currentLang].errorFileType);
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        image = new Image();
        image.onload = () => {
            const maxWidth = 1200;
            const maxHeight = 800;
            let width = image.width;
            let height = image.height;
            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width *= ratio;
                height *= ratio;
            }
            elements.canvas.width = width;
            elements.canvas.height = height;

            if (!gl) initWebGL();
            texture = initTexture(gl, image);

            elements.uploadArea.style.display = 'none';
            elements.editorArea.style.display = 'block';
            drawScene();
        };
        image.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function setupEventListeners() {
    Object.values(elements.controls).forEach(input => {
        input.addEventListener('input', drawScene);
    });

    elements.uploadArea.addEventListener('click', () => elements.fileInput.click());
    elements.fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) handleFileSelect(e.target.files[0]);
    });

    elements.uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.uploadArea.classList.add('dragover');
    });
    elements.uploadArea.addEventListener('dragleave', () => elements.uploadArea.classList.remove('dragover'));
    elements.uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.uploadArea.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) handleFileSelect(e.dataTransfer.files[0]);
    });

    elements.resetBtn.addEventListener('click', () => {
        elements.editorArea.style.display = 'none';
        elements.uploadArea.style.display = 'block';
        elements.fileInput.value = '';
        image = null;
        elements.controls.brightness.value = 50;
        elements.controls.contrast.value = 20;
        elements.controls.denoise.value = 30;
    });

    elements.downloadBtn.addEventListener('click', () => {
        elements.canvas.toBlob((blob) => {
            const link = document.createElement('a');
            link.download = `night-enhanced-${Date.now()}.png`;
            link.href = URL.createObjectURL(blob);
            link.click();
        }, 'image/png');
    });

    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));
}

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(lang === 'zh-TW' ? 'lang-zh' : 'lang-en').classList.add('active');

    const t = translations[lang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.textContent = t[key];
    });
}

setupEventListeners();
