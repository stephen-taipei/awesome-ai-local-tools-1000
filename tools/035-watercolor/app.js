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
                const maxWidth = 800;
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

                // Draw original image
                originalCtx.drawImage(originalImage, 0, 0, width, height);
                // Clear output
                outputCtx.clearRect(0, 0, width, height);
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

        applyWatercolorEffect(originalCtx, outputCtx, originalCanvas.width, originalCanvas.height);
    });

    function applyWatercolorEffect(srcCtx, destCtx, width, height) {
        // Simple watercolor simulation using median filter approximation and edge enhancement
        const srcData = srcCtx.getImageData(0, 0, width, height);
        const tempCtx = document.createElement('canvas').getContext('2d');
        tempCtx.canvas.width = width;
        tempCtx.canvas.height = height;

        // Step 1: Apply a simplified median filter (or blur) to smooth out details
        // We will do a few passes of blur for the "wash" effect
        tempCtx.putImageData(srcData, 0, 0);

        // Use stack blur or simple box blur
        // For simplicity here, we use the canvas filter API if available, or manual convolution

        // Manual simple blur for compatibility
        const blurRadius = 2;
        const blurPasses = 3;

        let currentData = srcData;

        for(let i=0; i<blurPasses; i++) {
             currentData = boxBlur(currentData, width, height, blurRadius);
        }

        // Step 2: Edge detection (Sobel) to find outlines
        const edgeData = sobelEdgeDetection(srcData, width, height);

        // Step 3: Combine blurred image with edges
        // Ideally watercolor edges are dark but not too sharp
        const finalData = destCtx.createImageData(width, height);

        for (let i = 0; i < finalData.data.length; i += 4) {
            // Blend: Multiply blur with inverted edge
            // Edge is white on black background, so we invert it to be black lines on white
            const edgeVal = edgeData.data[i]; // Grayscale edge
            const invertedEdge = 255 - edgeVal;

            // Enhance contrast of color
            let r = currentData.data[i] * 1.1;
            let g = currentData.data[i+1] * 1.1;
            let b = currentData.data[i+2] * 1.1;

            // Apply edge
            finalData.data[i] = (r * invertedEdge) / 255;
            finalData.data[i+1] = (g * invertedEdge) / 255;
            finalData.data[i+2] = (b * invertedEdge) / 255;
            finalData.data[i+3] = 255;
        }

        destCtx.putImageData(finalData, 0, 0);
    }

    function boxBlur(imageData, width, height, radius) {
        const data = imageData.data;
        const result = new Uint8ClampedArray(data.length);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let r = 0, g = 0, b = 0, count = 0;

                for (let dy = -radius; dy <= radius; dy++) {
                    for (let dx = -radius; dx <= radius; dx++) {
                        const nx = x + dx;
                        const ny = y + dy;

                        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                            const idx = (ny * width + nx) * 4;
                            r += data[idx];
                            g += data[idx+1];
                            b += data[idx+2];
                            count++;
                        }
                    }
                }

                const idx = (y * width + x) * 4;
                result[idx] = r / count;
                result[idx+1] = g / count;
                result[idx+2] = b / count;
                result[idx+3] = data[idx+3];
            }
        }

        return new ImageData(result, width, height);
    }

    function sobelEdgeDetection(imageData, width, height) {
        const data = imageData.data;
        const result = new Uint8ClampedArray(data.length);
        const gray = new Uint8Array(width * height);

        // Convert to grayscale
        for (let i = 0; i < width * height; i++) {
            gray[i] = 0.299 * data[i*4] + 0.587 * data[i*4+1] + 0.114 * data[i*4+2];
        }

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                // Sobel kernels
                // Gx: -1 0 1
                //     -2 0 2
                //     -1 0 1

                // Gy: -1 -2 -1
                //      0  0  0
                //      1  2  1

                let gx = 0;
                let gy = 0;

                gx += -1 * gray[(y-1)*width + (x-1)] + 1 * gray[(y-1)*width + (x+1)];
                gx += -2 * gray[y*width + (x-1)]     + 2 * gray[y*width + (x+1)];
                gx += -1 * gray[(y+1)*width + (x-1)] + 1 * gray[(y+1)*width + (x+1)];

                gy += -1 * gray[(y-1)*width + (x-1)] + -2 * gray[(y-1)*width + x] + -1 * gray[(y-1)*width + (x+1)];
                gy +=  1 * gray[(y+1)*width + (x-1)] +  2 * gray[(y+1)*width + x] +  1 * gray[(y+1)*width + (x+1)];

                let mag = Math.sqrt(gx*gx + gy*gy);

                // Thresholding for cleaner edges
                if (mag < 50) mag = 0;
                else mag = mag * 2; // Darken edges

                const idx = (y * width + x) * 4;
                result[idx] = mag;
                result[idx+1] = mag;
                result[idx+2] = mag;
                result[idx+3] = 255;
            }
        }

        return new ImageData(result, width, height);
    }
});
