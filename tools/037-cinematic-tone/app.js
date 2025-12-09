document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('imageInput');
    const outputCanvas = document.getElementById('outputCanvas');
    const outputCtx = outputCanvas.getContext('2d');
    const filterButtons = document.querySelectorAll('.filter-btn');

    let originalImage = null;
    let currentFilter = 'none';

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

                outputCanvas.width = width;
                outputCanvas.height = height;

                applyFilter(currentFilter);
            };
            originalImage.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Update UI
            filterButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            // Apply filter
            currentFilter = e.target.dataset.filter;
            if (originalImage) {
                applyFilter(currentFilter);
            }
        });
    });

    function applyFilter(filterName) {
        if (!originalImage) return;

        // Reset
        outputCtx.drawImage(originalImage, 0, 0, outputCanvas.width, outputCanvas.height);

        if (filterName === 'none') return;

        const imageData = outputCtx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];

            const [newR, newG, newB] = colorGradePixel(r, g, b, filterName);

            data[i] = newR;
            data[i + 1] = newG;
            data[i + 2] = newB;
        }

        outputCtx.putImageData(imageData, 0, 0);
    }

    function colorGradePixel(r, g, b, filter) {
        // Normalize 0-1
        let rn = r / 255, gn = g / 255, bn = b / 255;
        let ro = rn, go = gn, bo = bn;

        switch (filter) {
            case 'teal-orange':
                // Shadows towards teal, highlights towards orange
                // Simple implementation:
                // Boost Red in highlights, reduce in shadows
                // Boost Blue in shadows, reduce in highlights
                const luma = 0.299 * rn + 0.587 * gn + 0.114 * bn;

                ro = rn + (luma - 0.5) * 0.5;
                bo = bn - (luma - 0.5) * 0.5;
                go = gn + (luma - 0.5) * 0.1;

                // Saturation boost
                // ... (simplified)
                break;

            case 'vintage':
                // Lift shadows (fade), warm tint
                ro = rn * 1.2 + 0.1;
                go = gn * 1.1 + 0.1;
                bo = bn * 0.9;
                break;

            case 'noir':
                // High contrast BW
                const gray = 0.299 * rn + 0.587 * gn + 0.114 * bn;
                const contrast = 1.5;
                let cGray = (gray - 0.5) * contrast + 0.5;
                cGray = Math.max(0, Math.min(1, cGray));
                ro = go = bo = cGray;
                break;

            case 'cyberpunk':
                // Pink/Purple and Cyan
                // Boost R and B
                ro = rn * 1.1;
                go = gn * 0.9;
                bo = bn * 1.3;

                // Color shift based on brightness
                if (rn > 0.5) ro += 0.2; // Highlights pink
                if (bn < 0.5) bo += 0.2; // Shadows blue
                break;

            case 'dramatic':
                // Desaturated, high contrast, cold
                const sat = 0.5; // desaturate
                const l = 0.299 * rn + 0.587 * gn + 0.114 * bn;
                ro = l * (1 - sat) + rn * sat;
                go = l * (1 - sat) + gn * sat;
                bo = l * (1 - sat) + bn * sat;

                // Cool tint
                bo *= 1.2;
                ro *= 0.9;

                // Contrast
                ro = (ro - 0.5) * 1.2 + 0.5;
                go = (go - 0.5) * 1.2 + 0.5;
                bo = (bo - 0.5) * 1.2 + 0.5;
                break;
        }

        // Clamp 0-255
        return [
            Math.max(0, Math.min(255, ro * 255)),
            Math.max(0, Math.min(255, go * 255)),
            Math.max(0, Math.min(255, bo * 255))
        ];
    }
});
