/**
 * Smart Sharpening - Tool #017
 * Uses WebGL for Unsharp Masking
 */

const translations = {
    'zh-TW': {
        title: '智慧銳化',
        subtitle: 'AI 智慧銳化，增強邊緣同時避免過度處理',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        uploadText: '拖放圖片到此處或點擊上傳',
        uploadHint: '支援 PNG、JPG、WebP',
        preview: '預覽',
        amount: '銳化程度',
        radius: '半徑',
        threshold: '臨界值',
        uploadAnother: '重新上傳',
        download: '下載圖片',
        techSpecs: '技術規格',
        specTech: '技術核心',
        specSpeed: '處理速度',
        specPrivacy: '隱私保護',
        realTime: '即時 (Real-time)',
        localProcessing: '100% 本地運算',
        backToHome: '返回首頁',
        toolNumber: '工具 #017',
        errorFileType: '請上傳圖片檔案',
        webglError: '您的瀏覽器不支援 WebGL'
    },
    'en': {
        title: 'Smart Sharpening',
        subtitle: 'Intelligent sharpening, enhancing edges while avoiding artifacts',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        uploadText: 'Drag & drop image here or click to upload',
        uploadHint: 'Supports PNG, JPG, WebP',
        preview: 'Preview',
        amount: 'Amount',
        radius: 'Radius',
        threshold: 'Threshold',
        uploadAnother: 'Upload Another',
        download: 'Download',
        techSpecs: 'Technical Specs',
        specTech: 'Core Tech',
        specSpeed: 'Speed',
        specPrivacy: 'Privacy',
        realTime: 'Real-time',
        localProcessing: '100% Local Processing',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #017',
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
        amount: document.getElementById('amount'),
        radius: document.getElementById('radius'),
        threshold: document.getElementById('threshold')
    }
};

// Shaders for Unsharp Mask
// We implement a simplified 1-pass unsharp mask by sampling neighbors
// For larger radii, a 2-pass gaussian blur would be better, but for simplicity here we sample a few points
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
    uniform float uAmount;
    uniform float uRadius;
    uniform float uThreshold;

    void main(void) {
        vec4 original = texture2D(uSampler, vTextureCoord);

        // Simple Gaussian Blur Approximation (9-tap)
        vec4 blurred = vec4(0.0);
        float totalWeight = 0.0;

        // Dynamic sampling based on radius
        // Note: In a real shader, loops with variable limits can be slow or unsupported.
        // We use a fixed kernel but spread it out based on radius.

        float stepX = uRadius / uResolution.x;
        float stepY = uRadius / uResolution.y;

        // Weights for 3x3 kernel approximation
        float w0 = 0.25; // center
        float w1 = 0.125; // cross
        float w2 = 0.0625; // diagonal

        blurred += texture2D(uSampler, vTextureCoord) * w0;

        blurred += texture2D(uSampler, vTextureCoord + vec2(stepX, 0.0)) * w1;
        blurred += texture2D(uSampler, vTextureCoord + vec2(-stepX, 0.0)) * w1;
        blurred += texture2D(uSampler, vTextureCoord + vec2(0.0, stepY)) * w1;
        blurred += texture2D(uSampler, vTextureCoord + vec2(0.0, -stepY)) * w1;

        blurred += texture2D(uSampler, vTextureCoord + vec2(stepX, stepY)) * w2;
        blurred += texture2D(uSampler, vTextureCoord + vec2(-stepX, stepY)) * w2;
        blurred += texture2D(uSampler, vTextureCoord + vec2(stepX, -stepY)) * w2;
        blurred += texture2D(uSampler, vTextureCoord + vec2(-stepX, -stepY)) * w2;

        // Unsharp Mask Logic
        // sharp = original + (original - blurred) * amount
        // But only if diff > threshold

        vec3 diff = original.rgb - blurred.rgb;
        float lumDiff = dot(abs(diff), vec3(0.299, 0.587, 0.114));

        vec3 sharp = original.rgb;

        if (lumDiff > uThreshold) {
            sharp += diff * uAmount;
        }

        gl_FragColor = vec4(clamp(sharp, 0.0, 1.0), original.a);
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
            amount: gl.getUniformLocation(shaderProgram, 'uAmount'),
            radius: gl.getUniformLocation(shaderProgram, 'uRadius'),
            threshold: gl.getUniformLocation(shaderProgram, 'uThreshold'),
        },
    };

    // Initialize buffers (same as HDR)
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
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }
    return shaderProgram;
}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
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

    // Uniforms
    const amount = parseInt(elements.controls.amount.value) / 20.0; // 0 to 5.0
    const radius = parseInt(elements.controls.radius.value) * 1.0; // 1.0 to 50.0
    const threshold = parseInt(elements.controls.threshold.value) / 255.0; // 0 to ~0.2

    gl.uniform2f(program.uniformLocations.resolution, gl.canvas.width, gl.canvas.height);
    gl.uniform1f(program.uniformLocations.amount, amount);
    gl.uniform1f(program.uniformLocations.radius, radius);
    gl.uniform1f(program.uniformLocations.threshold, threshold);

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
             // Resize canvas
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
        elements.controls.amount.value = 50;
        elements.controls.radius.value = 10;
        elements.controls.threshold.value = 10;
    });

    elements.downloadBtn.addEventListener('click', () => {
        elements.canvas.toBlob((blob) => {
            const link = document.createElement('a');
            link.download = `sharpened-${Date.now()}.png`;
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
