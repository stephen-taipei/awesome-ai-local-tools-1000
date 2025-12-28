/**
 * Tool #099: Histogram
 * View image color histograms
 */
document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('imageInput');
    const dropZone = document.getElementById('dropZone');
    const imagePreview = document.getElementById('imagePreview');
    const imageCanvas = document.getElementById('imageCanvas');
    const imageCtx = imageCanvas.getContext('2d');
    const histogramCanvas = document.getElementById('histogramCanvas');
    const histCtx = histogramCanvas.getContext('2d');
    const controls = document.getElementById('controls');
    const previewContainer = document.getElementById('previewContainer');
    const histogramInfo = document.getElementById('histogramInfo');
    const downloadBtn = document.getElementById('downloadBtn');
    const channelBtns = document.querySelectorAll('.channel-btn');

    let histogramData = null;
    let currentChannel = 'rgb';

    // Event listeners
    imageInput.addEventListener('change', handleUpload);
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.style.borderColor = '#4a00e0'; });
    dropZone.addEventListener('dragleave', () => { dropZone.style.borderColor = '#8e2de2'; });
    dropZone.addEventListener('drop', handleDrop);
    downloadBtn.addEventListener('click', download);

    channelBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            channelBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentChannel = btn.dataset.channel;
            if (histogramData) drawHistogram();
        });
    });

    function handleDrop(e) {
        e.preventDefault();
        dropZone.style.borderColor = '#8e2de2';
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            analyzeImage(file);
        }
    }

    function handleUpload(e) {
        const file = e.target.files[0];
        if (file) analyzeImage(file);
    }

    function analyzeImage(file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                imagePreview.src = ev.target.result;
                controls.style.display = 'flex';
                previewContainer.style.display = 'flex';

                imageCanvas.width = img.width;
                imageCanvas.height = img.height;
                imageCtx.drawImage(img, 0, 0);

                const imageData = imageCtx.getImageData(0, 0, img.width, img.height);
                histogramData = calculateHistogram(imageData);
                drawHistogram();
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    }

    function calculateHistogram(imageData) {
        const data = imageData.data;
        const red = new Array(256).fill(0);
        const green = new Array(256).fill(0);
        const blue = new Array(256).fill(0);
        const luminance = new Array(256).fill(0);

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            red[r]++;
            green[g]++;
            blue[b]++;

            const lum = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
            luminance[lum]++;
        }

        const pixels = data.length / 4;

        return {
            red,
            green,
            blue,
            luminance,
            pixels,
            stats: {
                red: calcStats(red, pixels),
                green: calcStats(green, pixels),
                blue: calcStats(blue, pixels),
                luminance: calcStats(luminance, pixels)
            }
        };
    }

    function calcStats(histogram, totalPixels) {
        let sum = 0;
        let min = 255;
        let max = 0;

        for (let i = 0; i < 256; i++) {
            if (histogram[i] > 0) {
                sum += i * histogram[i];
                if (i < min) min = i;
                if (i > max) max = i;
            }
        }

        const mean = sum / totalPixels;

        // Find median
        let cumulative = 0;
        let median = 0;
        for (let i = 0; i < 256; i++) {
            cumulative += histogram[i];
            if (cumulative >= totalPixels / 2) {
                median = i;
                break;
            }
        }

        return { mean, median, min, max };
    }

    function drawHistogram() {
        const canvas = histogramCanvas;
        const ctx = histCtx;
        const dpr = window.devicePixelRatio || 1;

        canvas.width = canvas.offsetWidth * dpr;
        canvas.height = canvas.offsetHeight * dpr;
        ctx.scale(dpr, dpr);

        const w = canvas.offsetWidth;
        const h = canvas.offsetHeight;
        const padding = 20;
        const chartW = w - padding * 2;
        const chartH = h - padding * 2;

        // Clear
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, w, h);

        // Draw grid
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = padding + (chartH / 4) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(w - padding, y);
            ctx.stroke();
        }

        // Find max for scaling
        let maxVal = 0;
        const channels = currentChannel === 'rgb'
            ? ['red', 'green', 'blue']
            : [currentChannel];

        channels.forEach(ch => {
            maxVal = Math.max(maxVal, ...histogramData[ch]);
        });

        // Draw histograms
        const barW = chartW / 256;

        const colors = {
            red: 'rgba(255, 68, 68, 0.7)',
            green: 'rgba(68, 255, 68, 0.7)',
            blue: 'rgba(68, 68, 255, 0.7)',
            luminance: 'rgba(255, 170, 0, 0.7)'
        };

        channels.forEach(channel => {
            const data = histogramData[channel];
            ctx.fillStyle = colors[channel];
            ctx.beginPath();
            ctx.moveTo(padding, h - padding);

            for (let i = 0; i < 256; i++) {
                const x = padding + i * barW;
                const barH = (data[i] / maxVal) * chartH;
                const y = h - padding - barH;
                ctx.lineTo(x, y);
            }

            ctx.lineTo(w - padding, h - padding);
            ctx.closePath();
            ctx.fill();
        });

        // Draw axis labels
        ctx.fillStyle = '#888';
        ctx.font = '10px sans-serif';
        ctx.fillText('0', padding, h - 5);
        ctx.fillText('255', w - padding - 15, h - 5);

        // Update info
        const stats = histogramData.stats[currentChannel === 'rgb' ? 'luminance' : currentChannel];
        histogramInfo.innerHTML = `
            <span><strong>Mean:</strong> ${stats.mean.toFixed(1)}</span>
            <span><strong>Median:</strong> ${stats.median}</span>
            <span><strong>Min:</strong> ${stats.min}</span>
            <span><strong>Max:</strong> ${stats.max}</span>
            <span><strong>Range:</strong> ${stats.max - stats.min}</span>
        `;
    }

    function download() {
        const link = document.createElement('a');
        link.download = 'histogram.png';
        link.href = histogramCanvas.toDataURL('image/png');
        link.click();
    }

    // Handle resize
    window.addEventListener('resize', () => {
        if (histogramData) drawHistogram();
    });
});
