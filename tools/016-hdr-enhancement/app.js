/**
 * HDR Effect Enhancement - Tool #016
 * Uses WebGL for real-time tone mapping and local contrast enhancement
 */

const translations = {
    'zh-TW': {
        title: 'HDR 效果增強',
        subtitle: '增強圖片動態範圍，提升亮部暗部細節',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        uploadText: '拖放圖片到此處或點擊上傳',
        uploadHint: '支援 PNG、JPG、WebP',
        preview: '預覽',
        exposure: '曝光補償',
        contrast: '對比度',
        saturation: '飽和度',
        highlights: '亮部抑制',
        shadows: '暗部提亮',
        uploadAnother: '重新上傳',
        download: '下載圖片',
        techSpecs: '技術規格',
        specTech: '技術核心',
        specSpeed: '處理速度',
        specPrivacy: '隱私保護',
        realTime: '即時 (Real-time)',
        localProcessing: '100% 本地運算',
        backToHome: '返回首頁',
        toolNumber: '工具 #016',
        errorFileType: '請上傳圖片檔案',
        webglError: '您的瀏覽器不支援 WebGL'
    },
    'en': {
        title: 'HDR Effect Enhancement',
        subtitle: 'Enhance dynamic range, improve highlight and shadow details',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        uploadText: 'Drag & drop image here or click to upload',
        uploadHint: 'Supports PNG, JPG, WebP',
        preview: 'Preview',
        exposure: 'Exposure',
        contrast: 'Contrast',
        saturation: 'Saturation',
        highlights: 'Highlights',
        shadows: 'Shadows',
        uploadAnother: 'Upload Another',
        download: 'Download',
        techSpecs: 'Technical Specs',
        specTech: 'Core Tech',
        specSpeed: 'Speed',
        specPrivacy: 'Privacy',
        realTime: 'Real-time',
        localProcessing: '100% Local Processing',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #016',
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
        exposure: document.getElementById('exposure'),
        contrast: document.getElementById('contrast'),
        saturation: document.getElementById('saturation'),
        highlights: document.getElementById('highlights'),
        shadows: document.getElementById('shadows')
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

    uniform float uExposure;
    uniform float uContrast;
    uniform float uSaturation;
    uniform float uHighlights;
    uniform float uShadows;

    // Helper to convert RGB to HSL
    vec3 rgb2hsl(vec3 c) {
        float h = 0.0;
        float s = 0.0;
        float l = 0.0;
        float r = c.r;
        float g = c.g;
        float b = c.b;
        float cMin = min(r, min(g, b));
        float cMax = max(r, max(g, b));

        l = (cMax + cMin) / 2.0;
        if (cMax > cMin) {
            float cDelta = cMax - cMin;
            s = l < 0.5 ? cDelta / (cMax + cMin) : cDelta / (2.0 - (cMax + cMin));
            if (r == cMax) {
                h = (g - b) / cDelta;
            } else if (g == cMax) {
                h = 2.0 + (b - r) / cDelta;
            } else {
                h = 4.0 + (r - g) / cDelta;
            }
        }
        return vec3(h, s, l);
    }

    vec3 hsl2rgb(vec3 c) {
        vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
        return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0 * c.z - 1.0));
    }

    void main(void) {
        vec4 texColor = texture2D(uSampler, vTextureCoord);
        vec3 color = texColor.rgb;

        // 1. Exposure
        color = color * pow(2.0, uExposure);

        // 2. Shadows/Highlights (Simplified Tone Mapping)
        float lum = dot(color, vec3(0.299, 0.587, 0.114));

        // Shadow recovery
        float shadowFactor = (1.0 - lum) * uShadows;
        color += color * shadowFactor * 0.5;

        // Highlight suppression
        float highlightFactor = lum * uHighlights;
        color = color / (1.0 + highlightFactor * 0.5);

        // 3. Contrast
        color = (color - 0.5) * (1.0 + uContrast) + 0.5;

        // 4. Saturation
        vec3 gray = vec3(dot(color, vec3(0.299, 0.587, 0.114)));
        color = mix(gray, color, 1.0 + uSaturation);

        gl_FragColor = vec4(clamp(color, 0.0, 1.0), texColor.a);
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
            exposure: gl.getUniformLocation(shaderProgram, 'uExposure'),
            contrast: gl.getUniformLocation(shaderProgram, 'uContrast'),
            saturation: gl.getUniformLocation(shaderProgram, 'uSaturation'),
            highlights: gl.getUniformLocation(shaderProgram, 'uHighlights'),
            shadows: gl.getUniformLocation(shaderProgram, 'uShadows'),
        },
    };

    // Initialize buffers
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [
        -1.0,  1.0,
         1.0,  1.0,
        -1.0, -1.0,
         1.0, -1.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    const textureCoordinates = [
        0.0,  0.0,
        1.0,  0.0,
        0.0,  1.0,
        1.0,  1.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);

    program.buffers = {
        position: positionBuffer,
        textureCoord: textureCoordBuffer,
    };

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

    // Flip Y for WebGL
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    // WebGL1 requires power of 2 textures for mips, or wrap modes other than CLAMP_TO_EDGE
    // But we just use CLAMP_TO_EDGE for arbitrary sizes
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

    // Set vertex positions
    gl.bindBuffer(gl.ARRAY_BUFFER, program.buffers.position);
    gl.vertexAttribPointer(program.attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.attribLocations.vertexPosition);

    // Set texture coords
    gl.bindBuffer(gl.ARRAY_BUFFER, program.buffers.textureCoord);
    gl.vertexAttribPointer(program.attribLocations.textureCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.attribLocations.textureCoord);

    // Bind texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(program.uniformLocations.sampler, 0);

    // Set uniforms from controls
    // Convert ranges (-100 to 100) to appropriate shader values
    const exposure = parseInt(elements.controls.exposure.value) / 50.0; // -2.0 to 2.0
    const contrast = parseInt(elements.controls.contrast.value) / 100.0; // -1.0 to 1.0
    const saturation = parseInt(elements.controls.saturation.value) / 100.0; // -1.0 to 1.0
    const highlights = parseInt(elements.controls.highlights.value) / 100.0; // -1.0 to 1.0 (actually usually 0 to 1 for suppression)
    const shadows = parseInt(elements.controls.shadows.value) / 100.0; // 0 to 1

    gl.uniform1f(program.uniformLocations.exposure, exposure);
    gl.uniform1f(program.uniformLocations.contrast, contrast);
    gl.uniform1f(program.uniformLocations.saturation, saturation);
    gl.uniform1f(program.uniformLocations.highlights, highlights); // Positive reduces highlights
    gl.uniform1f(program.uniformLocations.shadows, shadows); // Positive boosts shadows

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
            // Resize canvas to match image aspect ratio
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
    // Controls
    Object.values(elements.controls).forEach(input => {
        input.addEventListener('input', drawScene);
    });

    // Upload
    elements.uploadArea.addEventListener('click', () => elements.fileInput.click());
    elements.fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) handleFileSelect(e.target.files[0]);
    });

    // Drag & Drop
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

    // Buttons
    elements.resetBtn.addEventListener('click', () => {
        elements.editorArea.style.display = 'none';
        elements.uploadArea.style.display = 'block';
        elements.fileInput.value = '';
        image = null;
        // Reset controls
        elements.controls.exposure.value = 0;
        elements.controls.contrast.value = 10;
        elements.controls.saturation.value = 20;
        elements.controls.highlights.value = 20;
        elements.controls.shadows.value = 30;
    });

    elements.downloadBtn.addEventListener('click', () => {
        // Render at full resolution?
        // For now, we render what's on canvas.
        // Ideally we should create a new framebuffer matching image size if we scaled down for preview.
        // But for "Simple" demo, canvas blob is fine.
        elements.canvas.toBlob((blob) => {
            const link = document.createElement('a');
            link.download = `hdr-enhanced-${Date.now()}.png`;
            link.href = URL.createObjectURL(blob);
            link.click();
        }, 'image/png');
    });

    // Language
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

// Init
setupEventListeners();
