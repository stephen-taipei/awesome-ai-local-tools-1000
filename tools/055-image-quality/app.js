/**
 * Tool #055: Image Quality Assessment
 */
document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('imageInput');
    const preview = document.getElementById('preview');
    const ctx = preview.getContext('2d');
    const results = document.getElementById('results');
    const overallScore = document.getElementById('overallScore');
    const scoreLabel = document.getElementById('scoreLabel');
    const metricsGrid = document.getElementById('metricsGrid');
    const suggestions = document.getElementById('suggestions');
    const suggestionsList = document.getElementById('suggestionsList');

    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const maxW = 600;
                let w = img.width, h = img.height;
                if (w > maxW) { h = (maxW / w) * h; w = maxW; }
                preview.width = w; preview.height = h;
                ctx.drawImage(img, 0, 0, w, h);
                results.style.display = 'block';
                analyzeQuality(ctx.getImageData(0, 0, w, h), img.width, img.height);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    function analyzeQuality(imageData, origW, origH) {
        const data = imageData.data;
        const w = imageData.width, h = imageData.height;

        // Sharpness (Laplacian variance)
        let sharpness = calculateSharpness(data, w, h);
        // Brightness
        let brightness = calculateBrightness(data);
        // Contrast
        let contrast = calculateContrast(data);
        // Noise estimate
        let noise = estimateNoise(data, w, h);
        // Resolution score
        let resolution = Math.min(100, (origW * origH) / (1920 * 1080) * 100);

        // Calculate overall score
        const overall = Math.round(
            sharpness * 0.3 + brightness * 0.2 + contrast * 0.2 +
            (100 - noise) * 0.15 + resolution * 0.15
        );

        // Display
        overallScore.textContent = overall;
        overallScore.className = 'quality-score ' +
            (overall >= 80 ? 'excellent' : overall >= 60 ? 'good' : overall >= 40 ? 'fair' : 'poor');

        const labels = {
            excellent: 'Excellent | 優秀',
            good: 'Good | 良好',
            fair: 'Fair | 一般',
            poor: 'Poor | 較差'
        };
        scoreLabel.textContent = labels[overall >= 80 ? 'excellent' : overall >= 60 ? 'good' : overall >= 40 ? 'fair' : 'poor'];

        const metrics = [
            { name: 'Sharpness | 清晰度', value: Math.round(sharpness), color: '#3498db' },
            { name: 'Brightness | 亮度', value: Math.round(brightness), color: '#f39c12' },
            { name: 'Contrast | 對比度', value: Math.round(contrast), color: '#9b59b6' },
            { name: 'Noise Level | 噪點', value: Math.round(100 - noise), color: '#e74c3c' },
            { name: 'Resolution | 解析度', value: Math.round(resolution), color: '#27ae60' }
        ];

        metricsGrid.innerHTML = metrics.map(m => `
            <div class="metric-card">
                <div class="metric-value">${m.value}</div>
                <div class="metric-label">${m.name}</div>
                <div class="metric-bar"><div class="metric-fill" style="width:${m.value}%;background:${m.color}"></div></div>
            </div>
        `).join('');

        // Suggestions
        const tips = [];
        if (sharpness < 50) tips.push('Image appears blurry. Try using a tripod or faster shutter speed. | 圖片較模糊，建議使用腳架或更快的快門速度。');
        if (brightness < 40) tips.push('Image is too dark. Consider increasing exposure. | 圖片過暗，建議增加曝光。');
        if (brightness > 80) tips.push('Image is overexposed. Reduce exposure. | 圖片過曝，建議降低曝光。');
        if (contrast < 40) tips.push('Low contrast. Try adjusting levels. | 對比度較低，建議調整色階。');
        if (noise > 50) tips.push('High noise detected. Use lower ISO or apply denoising. | 偵測到較高噪點，建議使用較低ISO或降噪處理。');

        if (tips.length > 0) {
            suggestions.style.display = 'block';
            suggestionsList.innerHTML = tips.map(t => `<li>${t}</li>`).join('');
        } else {
            suggestions.style.display = 'none';
        }
    }

    function calculateSharpness(data, w, h) {
        let variance = 0, count = 0;
        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
                const idx = (y * w + x) * 4;
                const gray = 0.299 * data[idx] + 0.587 * data[idx+1] + 0.114 * data[idx+2];
                const neighbors = [
                    ((y-1)*w+x)*4, ((y+1)*w+x)*4, (y*w+x-1)*4, (y*w+x+1)*4
                ];
                let laplacian = -4 * gray;
                neighbors.forEach(n => {
                    laplacian += 0.299*data[n] + 0.587*data[n+1] + 0.114*data[n+2];
                });
                variance += laplacian * laplacian;
                count++;
            }
        }
        return Math.min(100, Math.sqrt(variance / count) * 2);
    }

    function calculateBrightness(data) {
        let sum = 0;
        for (let i = 0; i < data.length; i += 4) {
            sum += 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
        }
        return (sum / (data.length / 4)) / 255 * 100;
    }

    function calculateContrast(data) {
        let min = 255, max = 0;
        for (let i = 0; i < data.length; i += 4) {
            const gray = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
            min = Math.min(min, gray);
            max = Math.max(max, gray);
        }
        return (max - min) / 255 * 100;
    }

    function estimateNoise(data, w, h) {
        let diff = 0, count = 0;
        for (let y = 0; y < h - 1; y++) {
            for (let x = 0; x < w - 1; x++) {
                const idx = (y * w + x) * 4;
                const nextX = idx + 4;
                const nextY = ((y+1) * w + x) * 4;
                diff += Math.abs(data[idx] - data[nextX]) + Math.abs(data[idx] - data[nextY]);
                count += 2;
            }
        }
        return Math.min(100, (diff / count) / 10);
    }
});
