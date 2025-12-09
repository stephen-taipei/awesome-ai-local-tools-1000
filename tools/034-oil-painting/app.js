document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('imageInput');
    const radiusInput = document.getElementById('radius');
    const intensityInput = document.getElementById('intensity');
    const radiusValue = document.getElementById('radiusValue');
    const intensityValue = document.getElementById('intensityValue');
    const processBtn = document.getElementById('processBtn');
    const originalCanvas = document.getElementById('originalCanvas');
    const outputCanvas = document.getElementById('outputCanvas');
    const originalCtx = originalCanvas.getContext('2d');
    const outputCtx = outputCanvas.getContext('2d');

    let originalImage = null;

    radiusInput.addEventListener('input', (e) => {
        radiusValue.textContent = e.target.value;
    });

    intensityInput.addEventListener('input', (e) => {
        intensityValue.textContent = e.target.value;
    });

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

        const radius = parseInt(radiusInput.value);
        const intensityLevels = parseInt(intensityInput.value);

        applyOilPaintingEffect(originalCtx, outputCtx, originalCanvas.width, originalCanvas.height, radius, intensityLevels);
    });

    function applyOilPaintingEffect(srcCtx, destCtx, width, height, radius, levels) {
        // Get image data
        const srcData = srcCtx.getImageData(0, 0, width, height);
        const destData = destCtx.createImageData(width, height);
        const srcPixels = srcData.data;
        const destPixels = destData.data;

        // Apply oil painting filter
        // Based on Kuwahara filter or simplified oil painting algorithm
        // For each pixel, look at neighbors within radius
        // Calculate intensity of each neighbor
        // Group neighbors by intensity
        // Find most frequent intensity group
        // Assign average color of that group to the pixel

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const intensityCount = new Array(levels + 1).fill(0);
                const averageR = new Array(levels + 1).fill(0);
                const averageG = new Array(levels + 1).fill(0);
                const averageB = new Array(levels + 1).fill(0);

                // Check neighbors
                for (let ny = -radius; ny <= radius; ny++) {
                    const currentY = y + ny;
                    if (currentY < 0 || currentY >= height) continue;

                    for (let nx = -radius; nx <= radius; nx++) {
                        const currentX = x + nx;
                        if (currentX < 0 || currentX >= width) continue;

                        const pos = (currentY * width + currentX) * 4;
                        const r = srcPixels[pos];
                        const g = srcPixels[pos + 1];
                        const b = srcPixels[pos + 2];

                        // Calculate intensity (0-255 scaled to 0-levels)
                        // Simple average for intensity
                        const curIntensity = Math.floor((((r + g + b) / 3) * levels) / 255);

                        intensityCount[curIntensity]++;
                        averageR[curIntensity] += r;
                        averageG[curIntensity] += g;
                        averageB[curIntensity] += b;
                    }
                }

                // Find max intensity count
                let maxCount = 0;
                let maxIndex = 0;
                for (let i = 0; i <= levels; i++) {
                    if (intensityCount[i] > maxCount) {
                        maxCount = intensityCount[i];
                        maxIndex = i;
                    }
                }

                // Set destination pixel
                const destPos = (y * width + x) * 4;
                destPixels[destPos] = averageR[maxIndex] / maxCount;
                destPixels[destPos + 1] = averageG[maxIndex] / maxCount;
                destPixels[destPos + 2] = averageB[maxIndex] / maxCount;
                destPixels[destPos + 3] = srcPixels[destPos + 3]; // Alpha
            }
        }

        destCtx.putImageData(destData, 0, 0);
    }
});
