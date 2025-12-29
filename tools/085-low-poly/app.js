/**
 * Tool #085: Low Poly Art
 * Create low polygon geometric art using Delaunay triangulation
 */
document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('imageInput');
    const dropZone = document.getElementById('dropZone');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const controls = document.getElementById('controls');
    const previewContainer = document.getElementById('previewContainer');
    const loading = document.getElementById('loading');
    const triangleCount = document.getElementById('triangleCount');
    const triangleVal = document.getElementById('triangleVal');
    const edgeWeight = document.getElementById('edgeWeight');
    const edgeVal = document.getElementById('edgeVal');
    const showEdges = document.getElementById('showEdges');
    const regenerateBtn = document.getElementById('regenerateBtn');
    const downloadBtn = document.getElementById('downloadBtn');

    let originalImage = null;
    let tempCanvas = document.createElement('canvas');
    let tempCtx = tempCanvas.getContext('2d');

    // Event listeners
    imageInput.addEventListener('change', handleUpload);
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.style.borderColor = '#fbc2eb'; });
    dropZone.addEventListener('dragleave', () => { dropZone.style.borderColor = '#a18cd1'; });
    dropZone.addEventListener('drop', handleDrop);
    triangleCount.addEventListener('input', () => { triangleVal.textContent = triangleCount.value; });
    triangleCount.addEventListener('change', applyEffect);
    edgeWeight.addEventListener('input', () => { edgeVal.textContent = edgeWeight.value + '%'; });
    edgeWeight.addEventListener('change', applyEffect);
    showEdges.addEventListener('change', applyEffect);
    regenerateBtn.addEventListener('click', applyEffect);
    downloadBtn.addEventListener('click', download);

    function handleDrop(e) {
        e.preventDefault();
        dropZone.style.borderColor = '#a18cd1';
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            loadImage(file);
        }
    }

    function handleUpload(e) {
        const file = e.target.files[0];
        if (file) loadImage(file);
    }

    function loadImage(file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                originalImage = img;
                // Limit size for performance
                const maxSize = 800;
                let w = img.width, h = img.height;
                if (w > maxSize || h > maxSize) {
                    const ratio = Math.min(maxSize / w, maxSize / h);
                    w = Math.floor(w * ratio);
                    h = Math.floor(h * ratio);
                }
                tempCanvas.width = w;
                tempCanvas.height = h;
                tempCtx.drawImage(img, 0, 0, w, h);
                canvas.width = w;
                canvas.height = h;
                controls.style.display = 'flex';
                previewContainer.style.display = 'flex';
                applyEffect();
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    }

    function applyEffect() {
        if (!originalImage) return;
        loading.style.display = 'block';

        setTimeout(() => {
            const w = canvas.width, h = canvas.height;
            const numPoints = parseInt(triangleCount.value);
            const edgeW = parseInt(edgeWeight.value) / 100;

            // Get image data for edge detection
            const imageData = tempCtx.getImageData(0, 0, w, h);
            const edges = detectEdges(imageData, w, h);

            // Generate points
            const points = generatePoints(w, h, numPoints, edges, edgeW);

            // Add corner points
            points.push([0, 0], [w, 0], [0, h], [w, h]);

            // Delaunay triangulation
            const triangles = delaunay(points);

            // Draw triangles
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, w, h);

            triangles.forEach(tri => {
                const [p1, p2, p3] = tri;
                const cx = (p1[0] + p2[0] + p3[0]) / 3;
                const cy = (p1[1] + p2[1] + p3[1]) / 3;

                // Sample color from center
                const i = (Math.floor(cy) * w + Math.floor(cx)) * 4;
                const r = imageData.data[i] || 0;
                const g = imageData.data[i + 1] || 0;
                const b = imageData.data[i + 2] || 0;

                ctx.beginPath();
                ctx.moveTo(p1[0], p1[1]);
                ctx.lineTo(p2[0], p2[1]);
                ctx.lineTo(p3[0], p3[1]);
                ctx.closePath();

                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fill();

                if (showEdges.checked) {
                    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            });

            loading.style.display = 'none';
        }, 50);
    }

    function detectEdges(imageData, w, h) {
        const data = imageData.data;
        const edges = new Float32Array(w * h);

        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
                const i = (y * w + x) * 4;
                const l = (y * w + x - 1) * 4;
                const r = (y * w + x + 1) * 4;
                const t = ((y - 1) * w + x) * 4;
                const b = ((y + 1) * w + x) * 4;

                const gx = (-data[l] + data[r] - data[l + 1] + data[r + 1] - data[l + 2] + data[r + 2]) / 3;
                const gy = (-data[t] + data[b] - data[t + 1] + data[b + 1] - data[t + 2] + data[b + 2]) / 3;

                edges[y * w + x] = Math.sqrt(gx * gx + gy * gy);
            }
        }
        return edges;
    }

    function generatePoints(w, h, count, edges, edgeWeight) {
        const points = [];
        const maxEdge = Math.max(...edges);

        for (let i = 0; i < count; i++) {
            let x, y;
            if (Math.random() < edgeWeight && maxEdge > 0) {
                // Weight towards edges
                let attempts = 0;
                do {
                    x = Math.random() * w;
                    y = Math.random() * h;
                    const edgeVal = edges[Math.floor(y) * w + Math.floor(x)] / maxEdge;
                    if (Math.random() < edgeVal) break;
                    attempts++;
                } while (attempts < 50);
            } else {
                x = Math.random() * w;
                y = Math.random() * h;
            }
            points.push([x, y]);
        }
        return points;
    }

    // Simple Delaunay triangulation (Bowyer-Watson algorithm)
    function delaunay(points) {
        const triangles = [];
        const w = canvas.width, h = canvas.height;

        // Super triangle
        const superTriangle = [
            [-w, -h],
            [2 * w, -h],
            [w / 2, 3 * h]
        ];
        triangles.push(superTriangle);

        points.forEach(point => {
            const badTriangles = [];

            triangles.forEach(tri => {
                if (inCircumcircle(point, tri)) {
                    badTriangles.push(tri);
                }
            });

            const polygon = [];
            badTriangles.forEach(tri => {
                for (let i = 0; i < 3; i++) {
                    const edge = [tri[i], tri[(i + 1) % 3]];
                    let shared = false;
                    badTriangles.forEach(other => {
                        if (other === tri) return;
                        for (let j = 0; j < 3; j++) {
                            const otherEdge = [other[j], other[(j + 1) % 3]];
                            if (edgesEqual(edge, otherEdge)) {
                                shared = true;
                            }
                        }
                    });
                    if (!shared) polygon.push(edge);
                }
            });

            badTriangles.forEach(tri => {
                const idx = triangles.indexOf(tri);
                if (idx > -1) triangles.splice(idx, 1);
            });

            polygon.forEach(edge => {
                triangles.push([edge[0], edge[1], point]);
            });
        });

        // Remove triangles with super triangle vertices
        return triangles.filter(tri => {
            return !tri.some(p =>
                superTriangle.some(sp => sp[0] === p[0] && sp[1] === p[1])
            );
        });
    }

    function inCircumcircle(point, triangle) {
        const [a, b, c] = triangle;
        const d = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1]));
        if (Math.abs(d) < 0.0001) return false;

        const ux = ((a[0] * a[0] + a[1] * a[1]) * (b[1] - c[1]) +
            (b[0] * b[0] + b[1] * b[1]) * (c[1] - a[1]) +
            (c[0] * c[0] + c[1] * c[1]) * (a[1] - b[1])) / d;
        const uy = ((a[0] * a[0] + a[1] * a[1]) * (c[0] - b[0]) +
            (b[0] * b[0] + b[1] * b[1]) * (a[0] - c[0]) +
            (c[0] * c[0] + c[1] * c[1]) * (b[0] - a[0])) / d;

        const r = Math.sqrt((a[0] - ux) ** 2 + (a[1] - uy) ** 2);
        const dist = Math.sqrt((point[0] - ux) ** 2 + (point[1] - uy) ** 2);

        return dist < r;
    }

    function edgesEqual(e1, e2) {
        return (e1[0][0] === e2[0][0] && e1[0][1] === e2[0][1] &&
                e1[1][0] === e2[1][0] && e1[1][1] === e2[1][1]) ||
               (e1[0][0] === e2[1][0] && e1[0][1] === e2[1][1] &&
                e1[1][0] === e2[0][0] && e1[1][1] === e2[0][1]);
    }

    function download() {
        const link = document.createElement('a');
        link.download = 'low-poly-art.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }
});
