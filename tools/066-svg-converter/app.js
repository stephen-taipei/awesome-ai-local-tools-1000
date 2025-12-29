/**
 * Tool #066: SVG Converter
 */
document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const imageInput = document.getElementById('imageInput');
    const controls = document.getElementById('controls');
    const modeSelect = document.getElementById('mode');
    const scaleSlider = document.getElementById('scale');
    const scaleValue = document.getElementById('scaleValue');
    const previewSection = document.getElementById('previewSection');
    const inputCanvas = document.getElementById('inputCanvas');
    const outputContainer = document.getElementById('outputContainer');
    const downloadBtn = document.getElementById('downloadBtn');
    const copySvgBtn = document.getElementById('copySvgBtn');
    const downloadSection = document.getElementById('downloadSection');

    let currentFile = null;
    let outputData = null;
    let isSvgInput = false;

    scaleSlider.addEventListener('input', () => {
        scaleValue.textContent = scaleSlider.value + 'x';
    });

    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => { e.preventDefault(); dropZone.classList.remove('dragover'); handleFile(e.dataTransfer.files[0]); });
    imageInput.addEventListener('change', (e) => handleFile(e.target.files[0]));
    modeSelect.addEventListener('change', processImage);
    scaleSlider.addEventListener('change', processImage);
    downloadBtn.addEventListener('click', download);
    copySvgBtn.addEventListener('click', copySvg);

    function handleFile(file) {
        if (!file) return;
        currentFile = file;
        isSvgInput = file.type === 'image/svg+xml' || file.name.endsWith('.svg');

        if (isSvgInput) {
            modeSelect.value = 'toRaster';
        }

        controls.style.display = 'flex';
        previewSection.style.display = 'flex';
        downloadSection.style.display = 'block';

        processImage();
    }

    function processImage() {
        const mode = modeSelect.value;
        const scale = parseFloat(scaleSlider.value);

        if (isSvgInput && mode !== 'toRaster') {
            modeSelect.value = 'toRaster';
            return processImage();
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            if (isSvgInput) {
                svgToRaster(e.target.result, scale);
            } else {
                const img = new Image();
                img.onload = () => {
                    displayInput(img);
                    if (mode === 'toSvg') {
                        imageToSvgEmbed(img);
                    } else if (mode === 'trace') {
                        imageToSvgTrace(img);
                    }
                };
                img.src = e.target.result;
            }
        };

        if (isSvgInput) {
            reader.readAsText(currentFile);
        } else {
            reader.readAsDataURL(currentFile);
        }
    }

    function displayInput(img) {
        const ctx = inputCanvas.getContext('2d');
        const maxSize = 300;
        let w = img.width, h = img.height;
        if (w > maxSize || h > maxSize) {
            const s = Math.min(maxSize / w, maxSize / h);
            w *= s; h *= s;
        }
        inputCanvas.width = w;
        inputCanvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);
    }

    function imageToSvgEmbed(img) {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');

        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${img.width}" height="${img.height}">
  <image href="${dataUrl}" width="${img.width}" height="${img.height}"/>
</svg>`;

        outputData = { type: 'svg', data: svg };
        outputContainer.innerHTML = `<div class="svg-output">${escapeHtml(svg.substring(0, 500))}...</div>`;
        copySvgBtn.style.display = 'inline-block';
    }

    function imageToSvgTrace(img) {
        // Simple edge-based tracing
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const paths = traceEdges(imageData);

        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${img.width}" height="${img.height}" viewBox="0 0 ${img.width} ${img.height}">
  ${paths}
</svg>`;

        outputData = { type: 'svg', data: svg };
        outputContainer.innerHTML = `<img src="data:image/svg+xml;base64,${btoa(svg)}" style="max-width:100%;max-height:300px;">`;
        copySvgBtn.style.display = 'inline-block';
    }

    function traceEdges(imageData) {
        const w = imageData.width, h = imageData.height;
        const data = imageData.data;
        let paths = '';

        // Sample and create simple polygons based on color regions
        const step = 4;
        for (let y = 0; y < h; y += step) {
            for (let x = 0; x < w; x += step) {
                const idx = (y * w + x) * 4;
                const r = data[idx], g = data[idx + 1], b = data[idx + 2], a = data[idx + 3];
                if (a > 128) {
                    paths += `<rect x="${x}" y="${y}" width="${step}" height="${step}" fill="rgb(${r},${g},${b})" fill-opacity="${a / 255}"/>`;
                }
            }
        }
        return paths;
    }

    function svgToRaster(svgText, scale) {
        const blob = new Blob([svgText], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const img = new Image();

        img.onload = () => {
            displayInput(img);

            const canvas = document.createElement('canvas');
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            outputData = { type: 'png', data: canvas.toDataURL('image/png') };
            outputContainer.innerHTML = `<img src="${outputData.data}" style="max-width:100%;max-height:300px;">`;
            copySvgBtn.style.display = 'none';
            URL.revokeObjectURL(url);
        };
        img.src = url;
    }

    function download() {
        if (!outputData) return;
        const link = document.createElement('a');

        if (outputData.type === 'svg') {
            const blob = new Blob([outputData.data], { type: 'image/svg+xml' });
            link.href = URL.createObjectURL(blob);
            link.download = 'converted.svg';
        } else {
            link.href = outputData.data;
            link.download = 'converted.png';
        }
        link.click();
    }

    function copySvg() {
        if (outputData && outputData.type === 'svg') {
            navigator.clipboard.writeText(outputData.data);
            alert('SVG code copied! | SVG 代碼已複製!');
        }
    }

    function escapeHtml(text) {
        return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
});
