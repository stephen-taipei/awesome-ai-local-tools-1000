document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('imageInput');
    const pixelSizeInput = document.getElementById('pixelSize');
    const paletteSizeInput = document.getElementById('paletteSize');
    const pixelSizeValue = document.getElementById('pixelSizeValue');
    const paletteSizeValue = document.getElementById('paletteSizeValue');
    const processBtn = document.getElementById('processBtn');
    const originalCanvas = document.getElementById('originalCanvas');
    const outputCanvas = document.getElementById('outputCanvas');
    const originalCtx = originalCanvas.getContext('2d');
    const outputCtx = outputCanvas.getContext('2d');

    let originalImage = null;

    pixelSizeInput.addEventListener('input', (e) => {
        pixelSizeValue.textContent = e.target.value;
    });

    paletteSizeInput.addEventListener('input', (e) => {
        paletteSizeValue.textContent = e.target.value == 0 ? "Original" : e.target.value;
    });

    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            originalImage = new Image();
            originalImage.onload = () => {
                // Set canvas dimensions
                const maxWidth = 600;
                let width = originalImage.width;
                let height = originalImage.height;

                if (width > maxWidth) {
                    height = (maxWidth / width) * height;
                    width = maxWidth;
                }

                originalCanvas.width = width;
                originalCanvas.height = height;
                outputCanvas.width = width;
                outputCanvas.height = height;

                originalCtx.drawImage(originalImage, 0, 0, width, height);
            };
            originalImage.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    processBtn.addEventListener('click', () => {
        if (!originalImage) {
            alert('Please select an image first.');
            return;
        }

        const pixelSize = parseInt(pixelSizeInput.value);
        const paletteSize = parseInt(paletteSizeInput.value);

        applyPixelArtEffect(originalCtx, outputCtx, originalCanvas.width, originalCanvas.height, pixelSize, paletteSize);
    });

    function applyPixelArtEffect(srcCtx, destCtx, width, height, blockSize, paletteCount) {
        // Step 1: Downscale
        const w = Math.ceil(width / blockSize);
        const h = Math.ceil(height / blockSize);

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = w;
        tempCanvas.height = h;
        const tempCtx = tempCanvas.getContext('2d');

        // Disable smoothing for sharp pixels
        tempCtx.imageSmoothingEnabled = false;
        tempCtx.drawImage(srcCtx.canvas, 0, 0, w, h);

        // Step 2: Palette Reduction (K-Means simplified or Quantization)
        if (paletteCount > 0) {
            const imageData = tempCtx.getImageData(0, 0, w, h);
            const data = imageData.data;

            // Collect all colors
            // Simple quantization for performance in browser without heavy library
            // Reduce color depth first
            for (let i = 0; i < data.length; i += 4) {
                // Round to nearest factor to reduce colors roughly
                const factor = 256 / (Math.pow(paletteCount, 1/3));
                // data[i] = Math.round(data[i] / factor) * factor;
                // data[i+1] = Math.round(data[i+1] / factor) * factor;
                // data[i+2] = Math.round(data[i+2] / factor) * factor;
            }

            // Or use simple Posterization
             for (let i = 0; i < data.length; i += 4) {
                 // Simple Posterization to approximate palette reduction
                 const levels = Math.max(2, Math.floor(Math.pow(paletteCount, 1/3)));
                 const step = 255 / (levels - 1);

                 data[i] = Math.round(data[i] / step) * step;
                 data[i+1] = Math.round(data[i+1] / step) * step;
                 data[i+2] = Math.round(data[i+2] / step) * step;
             }

            tempCtx.putImageData(imageData, 0, 0);
        }

        // Step 3: Upscale back
        destCtx.imageSmoothingEnabled = false;
        destCtx.clearRect(0, 0, width, height);
        destCtx.drawImage(tempCanvas, 0, 0, width, height);
    }
});
