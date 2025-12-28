/**
 * Tool #058: Image Similarity Comparison
 */
document.addEventListener('DOMContentLoaded', () => {
    const canvas1 = document.getElementById('canvas1');
    const canvas2 = document.getElementById('canvas2');
    const ctx1 = canvas1.getContext('2d');
    const ctx2 = canvas2.getContext('2d');
    const input1 = document.getElementById('input1');
    const input2 = document.getElementById('input2');
    const result = document.getElementById('result');

    let image1Data = null, image2Data = null;

    input1.addEventListener('change', (e) => loadImage(e, canvas1, ctx1, 1));
    input2.addEventListener('change', (e) => loadImage(e, canvas2, ctx2, 2));

    function loadImage(e, canvas, ctx, num) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const size = 250;
                canvas.width = size; canvas.height = size;
                // Fit image in canvas
                const scale = Math.min(size / img.width, size / img.height);
                const w = img.width * scale, h = img.height * scale;
                const x = (size - w) / 2, y = (size - h) / 2;
                ctx.fillStyle = '#f9f9f9';
                ctx.fillRect(0, 0, size, size);
                ctx.drawImage(img, x, y, w, h);
                canvas.classList.add('has-image');

                if (num === 1) image1Data = ctx.getImageData(0, 0, size, size);
                else image2Data = ctx.getImageData(0, 0, size, size);

                if (image1Data && image2Data) compare();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }

    function compare() {
        const d1 = image1Data.data, d2 = image2Data.data;

        // Calculate various similarity metrics
        const pixelSim = calculatePixelSimilarity(d1, d2);
        const histSim = calculateHistogramSimilarity(d1, d2);
        const structSim = calculateStructuralSimilarity(d1, d2, image1Data.width);
        const colorSim = calculateColorSimilarity(d1, d2);

        // Weighted average
        const overall = Math.round(
            pixelSim * 0.2 + histSim * 0.3 + structSim * 0.3 + colorSim * 0.2
        );

        document.getElementById('score').textContent = overall + '%';
        document.getElementById('label').textContent = getSimilarityLabel(overall);
        document.getElementById('details').innerHTML = `
            <div class="detail-item">
                <div class="detail-value">${Math.round(pixelSim)}%</div>
                <div class="detail-label">Pixel Match | 像素匹配</div>
            </div>
            <div class="detail-item">
                <div class="detail-value">${Math.round(histSim)}%</div>
                <div class="detail-label">Histogram | 直方圖</div>
            </div>
            <div class="detail-item">
                <div class="detail-value">${Math.round(structSim)}%</div>
                <div class="detail-label">Structure | 結構</div>
            </div>
            <div class="detail-item">
                <div class="detail-value">${Math.round(colorSim)}%</div>
                <div class="detail-label">Color | 色彩</div>
            </div>
        `;
        result.style.display = 'block';
    }

    function calculatePixelSimilarity(d1, d2) {
        let diff = 0;
        for (let i = 0; i < d1.length; i += 4) {
            diff += Math.abs(d1[i] - d2[i]) + Math.abs(d1[i+1] - d2[i+1]) + Math.abs(d1[i+2] - d2[i+2]);
        }
        const maxDiff = d1.length / 4 * 255 * 3;
        return 100 - (diff / maxDiff * 100);
    }

    function calculateHistogramSimilarity(d1, d2) {
        const bins = 16;
        const hist1 = new Array(bins).fill(0), hist2 = new Array(bins).fill(0);

        for (let i = 0; i < d1.length; i += 4) {
            const gray1 = Math.floor((d1[i] + d1[i+1] + d1[i+2]) / 3 / 256 * bins);
            const gray2 = Math.floor((d2[i] + d2[i+1] + d2[i+2]) / 3 / 256 * bins);
            hist1[Math.min(gray1, bins-1)]++;
            hist2[Math.min(gray2, bins-1)]++;
        }

        // Normalize
        const total = d1.length / 4;
        let similarity = 0;
        for (let i = 0; i < bins; i++) {
            similarity += Math.min(hist1[i], hist2[i]);
        }
        return similarity / total * 100;
    }

    function calculateStructuralSimilarity(d1, d2, width) {
        // Simplified SSIM
        let mean1 = 0, mean2 = 0;
        const n = d1.length / 4;

        for (let i = 0; i < d1.length; i += 4) {
            mean1 += (d1[i] + d1[i+1] + d1[i+2]) / 3;
            mean2 += (d2[i] + d2[i+1] + d2[i+2]) / 3;
        }
        mean1 /= n; mean2 /= n;

        let var1 = 0, var2 = 0, covar = 0;
        for (let i = 0; i < d1.length; i += 4) {
            const g1 = (d1[i] + d1[i+1] + d1[i+2]) / 3 - mean1;
            const g2 = (d2[i] + d2[i+1] + d2[i+2]) / 3 - mean2;
            var1 += g1 * g1;
            var2 += g2 * g2;
            covar += g1 * g2;
        }
        var1 /= n; var2 /= n; covar /= n;

        const c1 = 6.5025, c2 = 58.5225;
        const ssim = ((2*mean1*mean2 + c1) * (2*covar + c2)) /
                     ((mean1*mean1 + mean2*mean2 + c1) * (var1 + var2 + c2));
        return Math.max(0, ssim * 100);
    }

    function calculateColorSimilarity(d1, d2) {
        let r1=0, g1=0, b1=0, r2=0, g2=0, b2=0;
        const n = d1.length / 4;

        for (let i = 0; i < d1.length; i += 4) {
            r1 += d1[i]; g1 += d1[i+1]; b1 += d1[i+2];
            r2 += d2[i]; g2 += d2[i+1]; b2 += d2[i+2];
        }

        const diff = Math.abs(r1/n - r2/n) + Math.abs(g1/n - g2/n) + Math.abs(b1/n - b2/n);
        return Math.max(0, 100 - diff / 7.65);
    }

    function getSimilarityLabel(score) {
        if (score >= 90) return 'Nearly Identical | 幾乎相同';
        if (score >= 70) return 'Very Similar | 非常相似';
        if (score >= 50) return 'Moderately Similar | 中度相似';
        if (score >= 30) return 'Somewhat Similar | 略為相似';
        return 'Different | 不同';
    }
});
