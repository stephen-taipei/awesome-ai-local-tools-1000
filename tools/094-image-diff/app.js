/**
 * Tool #094: Image Diff
 * Compare two images and highlight differences
 */
document.addEventListener('DOMContentLoaded', () => {
    const imageInput1 = document.getElementById('imageInput1');
    const imageInput2 = document.getElementById('imageInput2');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const controls = document.getElementById('controls');
    const previewContainer = document.getElementById('previewContainer');
    const stats = document.getElementById('stats');
    const mode = document.getElementById('mode');
    const threshold = document.getElementById('threshold');
    const thresholdVal = document.getElementById('thresholdVal');
    const opacity = document.getElementById('opacity');
    const opacityVal = document.getElementById('opacityVal');
    const downloadBtn = document.getElementById('downloadBtn');

    let image1 = null;
    let image2 = null;

    // Event listeners
    imageInput1.addEventListener('change', (e) => handleUpload(e, 1));
    imageInput2.addEventListener('change', (e) => handleUpload(e, 2));
    mode.addEventListener('change', compare);
    threshold.addEventListener('input', () => { thresholdVal.textContent = threshold.value; compare(); });
    opacity.addEventListener('input', () => { opacityVal.textContent = opacity.value + '%'; compare(); });
    downloadBtn.addEventListener('click', download);

    // Drag and drop
    ['dropZone1', 'dropZone2'].forEach((id, idx) => {
        const zone = document.getElementById(id);
        zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.style.borderColor = '#f5576c'; });
        zone.addEventListener('dragleave', () => { zone.style.borderColor = '#f093fb'; });
        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.style.borderColor = '#f093fb';
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                loadImage(file, idx + 1);
            }
        });
    });

    function handleUpload(e, num) {
        const file = e.target.files[0];
        if (file) loadImage(file, num);
    }

    function loadImage(file, num) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                if (num === 1) {
                    image1 = img;
                } else {
                    image2 = img;
                }
                checkAndCompare();
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    }

    function checkAndCompare() {
        if (image1 && image2) {
            controls.style.display = 'flex';
            previewContainer.style.display = 'flex';
            compare();
        }
    }

    function compare() {
        if (!image1 || !image2) return;

        const viewMode = mode.value;
        const thresh = parseInt(threshold.value);
        const alpha = parseInt(opacity.value) / 100;

        // Use the larger dimensions
        const w = Math.max(image1.width, image2.width);
        const h = Math.max(image1.height, image2.height);

        // Create temp canvases
        const temp1 = document.createElement('canvas');
        const temp2 = document.createElement('canvas');
        temp1.width = temp2.width = w;
        temp1.height = temp2.height = h;

        const ctx1 = temp1.getContext('2d');
        const ctx2 = temp2.getContext('2d');

        ctx1.drawImage(image1, 0, 0);
        ctx2.drawImage(image2, 0, 0);

        const data1 = ctx1.getImageData(0, 0, w, h);
        const data2 = ctx2.getImageData(0, 0, w, h);

        if (viewMode === 'sideBySide') {
            canvas.width = w * 2 + 10;
            canvas.height = h;
            ctx.fillStyle = '#333';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(image1, 0, 0);
            ctx.drawImage(image2, w + 10, 0);
            stats.innerHTML = `<span>Side-by-side comparison | 並排比較</span>
                <span>Image A: ${image1.width} x ${image1.height}</span>
                <span>Image B: ${image2.width} x ${image2.height}</span>`;
            return;
        }

        canvas.width = w;
        canvas.height = h;

        let diffPixels = 0;
        const totalPixels = w * h;

        if (viewMode === 'difference') {
            const result = ctx.createImageData(w, h);
            for (let i = 0; i < data1.data.length; i += 4) {
                const diff = Math.abs(data1.data[i] - data2.data[i]) +
                            Math.abs(data1.data[i + 1] - data2.data[i + 1]) +
                            Math.abs(data1.data[i + 2] - data2.data[i + 2]);

                if (diff > thresh * 3) {
                    diffPixels++;
                    result.data[i] = 255;
                    result.data[i + 1] = 255;
                    result.data[i + 2] = 255;
                } else {
                    result.data[i] = 0;
                    result.data[i + 1] = 0;
                    result.data[i + 2] = 0;
                }
                result.data[i + 3] = 255;
            }
            ctx.putImageData(result, 0, 0);
        } else if (viewMode === 'highlight') {
            ctx.drawImage(image1, 0, 0);
            const result = ctx.getImageData(0, 0, w, h);

            for (let i = 0; i < data1.data.length; i += 4) {
                const diff = Math.abs(data1.data[i] - data2.data[i]) +
                            Math.abs(data1.data[i + 1] - data2.data[i + 1]) +
                            Math.abs(data1.data[i + 2] - data2.data[i + 2]);

                if (diff > thresh * 3) {
                    diffPixels++;
                    // Highlight in red
                    result.data[i] = 255;
                    result.data[i + 1] = 0;
                    result.data[i + 2] = 0;
                }
            }
            ctx.putImageData(result, 0, 0);
        } else if (viewMode === 'overlay') {
            ctx.drawImage(image1, 0, 0);
            ctx.globalAlpha = alpha;
            ctx.drawImage(image2, 0, 0);
            ctx.globalAlpha = 1;

            // Calculate diff for stats
            for (let i = 0; i < data1.data.length; i += 4) {
                const diff = Math.abs(data1.data[i] - data2.data[i]) +
                            Math.abs(data1.data[i + 1] - data2.data[i + 1]) +
                            Math.abs(data1.data[i + 2] - data2.data[i + 2]);
                if (diff > thresh * 3) diffPixels++;
            }
        }

        const diffPercent = ((diffPixels / totalPixels) * 100).toFixed(2);
        const similarity = (100 - diffPercent).toFixed(2);
        const diffClass = diffPercent > 10 ? 'diff-high' : 'diff-low';

        stats.innerHTML = `
            <span>Total Pixels: ${totalPixels.toLocaleString()}</span>
            <span>Different Pixels: ${diffPixels.toLocaleString()}</span>
            <span class="${diffClass}">Difference: ${diffPercent}%</span>
            <span class="${diffPercent > 10 ? 'diff-high' : 'diff-low'}">Similarity: ${similarity}%</span>
            <span>Threshold: ${thresh}</span>
        `;
    }

    function download() {
        const link = document.createElement('a');
        link.download = 'image-diff.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }
});
