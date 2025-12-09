document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('imageInput');
    const processBtn = document.getElementById('processBtn');
    const originalCanvas = document.getElementById('originalCanvas');
    const outputCanvas = document.getElementById('outputCanvas');
    const originalCtx = originalCanvas.getContext('2d');
    const outputCtx = outputCanvas.getContext('2d');

    let originalImage = null;

    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            originalImage = new Image();
            originalImage.onload = () => {
                // Set canvas dimensions
                const maxWidth = 400; // Smaller for 2x2 grid
                let width = originalImage.width;
                let height = originalImage.height;

                if (width > maxWidth) {
                    height = (maxWidth / width) * height;
                    width = maxWidth;
                }

                originalCanvas.width = width;
                originalCanvas.height = height;
                outputCanvas.width = width * 2;
                outputCanvas.height = height * 2;

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

        generatePopArt();
    });

    function generatePopArt() {
        const w = originalCanvas.width;
        const h = originalCanvas.height;

        // 1. Preprocess: Thresholding / Posterization to get high contrast
        const baseData = originalCtx.getImageData(0, 0, w, h);

        // Convert to grayscale and threshold
        const grayData = new Uint8ClampedArray(baseData.data.length);
        for(let i=0; i<baseData.data.length; i+=4) {
            const luma = 0.299*baseData.data[i] + 0.587*baseData.data[i+1] + 0.114*baseData.data[i+2];
            // 3 level threshold
            let val = 0; // Black
            if (luma > 170) val = 2; // White/Light
            else if (luma > 85) val = 1; // Gray/Mid

            // Store simple index 0,1,2
            grayData[i] = val;
        }

        // 2. Create 4 panels with different color schemes
        // Panel 1: Top Left
        drawPanel(outputCtx, grayData, w, h, 0, 0, ['#e74c3c', '#f1c40f', '#3498db']);

        // Panel 2: Top Right
        drawPanel(outputCtx, grayData, w, h, w, 0, ['#8e44ad', '#2ecc71', '#e67e22']);

        // Panel 3: Bottom Left
        drawPanel(outputCtx, grayData, w, h, 0, h, ['#16a085', '#d35400', '#ecf0f1']);

        // Panel 4: Bottom Right
        drawPanel(outputCtx, grayData, w, h, w, h, ['#f39c12', '#2980b9', '#c0392b']);
    }

    function drawPanel(ctx, grayMap, width, height, offsetX, offsetY, colors) {
        // colors: [shadow, midtone, highlight]
        // or background, mid, fore?
        // Let's assume standard Warhol style:
        // Background color (val 2 or 0?), Main Subject (val 1), Shadow/Details (val 0)

        // Parse hex colors
        const c0 = hexToRgb(colors[0]); // Darkest/Background
        const c1 = hexToRgb(colors[1]); // Mid
        const c2 = hexToRgb(colors[2]); // Lightest

        const imgData = ctx.createImageData(width, height);

        for(let i=0; i<grayMap.length; i+=4) {
            const val = grayMap[i];
            let r, g, b;

            if (val === 0) { r=c0.r; g=c0.g; b=c0.b; }
            else if (val === 1) { r=c1.r; g=c1.g; b=c1.b; }
            else { r=c2.r; g=c2.g; b=c2.b; }

            imgData.data[i] = r;
            imgData.data[i+1] = g;
            imgData.data[i+2] = b;
            imgData.data[i+3] = 255;
        }

        ctx.putImageData(imgData, offsetX, offsetY);
    }

    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }
});
