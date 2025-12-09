// AI Expression Editing
// Ideally uses GANs.
// Fallback: Use MediaPipe FaceMesh to warp the image.

const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const processingMsg = document.getElementById('processing-msg');
let originalImage = null;
let currentExpression = 'smile';
let faceLandmarker = null;

import { FilesetResolver, FaceLandmarker } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

async function initLandmarker() {
    const filesetResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
    );
    faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: "GPU"
        },
        outputFaceBlendshapes: true,
        runningMode: "IMAGE",
        numFaces: 1
    });
}
initLandmarker();

// Setup controls
document.querySelectorAll('.expression-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.expression-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentExpression = e.target.dataset.exp;
        if (originalImage && faceLandmarker) processImage();
    });
});

dropArea.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFile);

function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            originalImage = img;
            canvas.width = img.width;
            canvas.height = img.height;
            document.getElementById('preview-section').style.display = 'block';
            ctx.drawImage(img, 0, 0);
            if(faceLandmarker) processImage();
            else alert("AI Model still loading...");
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

async function processImage() {
    if (!originalImage || !faceLandmarker) return;

    processingMsg.style.display = 'block';

    // Detect face
    const results = faceLandmarker.detect(originalImage);

    ctx.drawImage(originalImage, 0, 0);

    if (results.faceLandmarks.length > 0) {
        const landmarks = results.faceLandmarks[0];

        // Simple 2D Mesh Warp Simulation using Canvas API
        // This is tricky. A simple approach is to copy chunks of the image around.
        // Or we can draw "patches" over the mouth.

        // Since implementing a full Deformable Mesh in 2D Canvas is a project in itself,
        // we will use a simplified "liquify" effect by moving pixels.
        // Specifically for "smile", we want to move mouth corners UP.

        const mouthLeft = landmarks[61];
        const mouthRight = landmarks[291];
        const upperLip = landmarks[13];
        const lowerLip = landmarks[14];

        // Convert normalized coords to pixels
        const ml = {x: mouthLeft.x * canvas.width, y: mouthLeft.y * canvas.height};
        const mr = {x: mouthRight.x * canvas.width, y: mouthRight.y * canvas.height};

        if (currentExpression === 'smile') {
            // "Pull" pixels around mouth corners up
            warpRegion(ml.x, ml.y, 0, -20, 40); // Left corner up
            warpRegion(mr.x, mr.y, 0, -20, 40); // Right corner up
        } else if (currentExpression === 'sad') {
             warpRegion(ml.x, ml.y, 0, 20, 40);
             warpRegion(mr.x, mr.y, 0, 20, 40);
        } else if (currentExpression === 'surprise') {
             // Open mouth / stretch vertically
             // Not easy to "open" a closed mouth without generative fill.
             // We can just stretch the chin down?
             // Let's just warp mouth corners OUT
             warpRegion(ml.x, ml.y, -10, 0, 40);
             warpRegion(mr.x, mr.y, 10, 0, 40);
        }

    }

    processingMsg.style.display = 'none';
}

// A very naive "Liquify" tool implementation
function warpRegion(cx, cy, dx, dy, radius) {
    // Get image data for the region
    const x = Math.floor(cx - radius);
    const y = Math.floor(cy - radius);
    const size = radius * 2;

    // Boundary check
    if (x < 0 || y < 0 || x + size > canvas.width || y + size > canvas.height) return;

    try {
        const imgData = ctx.getImageData(x, y, size, size);
        const newImgData = ctx.createImageData(size, size);
        const src = imgData.data;
        const dst = newImgData.data;

        // Copy with displacement
        for (let py = 0; py < size; py++) {
            for (let px = 0; px < size; px++) {
                // Distance from center of brush
                const distX = px - radius;
                const distY = py - radius;
                const dist = Math.sqrt(distX*distX + distY*distY);

                if (dist < radius) {
                    // Falloff
                    const strength = Math.pow(1 - dist/radius, 2); // Quadratic falloff

                    // Source position
                    const sx = px - dx * strength;
                    const sy = py - dy * strength;

                    // Bilinear interpolation or nearest neighbor
                    const isx = Math.round(sx);
                    const isy = Math.round(sy);

                    if (isx >= 0 && isx < size && isy >= 0 && isy < size) {
                        const srcIdx = (isy * size + isx) * 4;
                        const dstIdx = (py * size + px) * 4;

                        dst[dstIdx] = src[srcIdx];
                        dst[dstIdx+1] = src[srcIdx+1];
                        dst[dstIdx+2] = src[srcIdx+2];
                        dst[dstIdx+3] = src[srcIdx+3];
                    }
                } else {
                     // Keep original outside radius
                     const idx = (py * size + px) * 4;
                     dst[idx] = src[idx];
                     dst[idx+1] = src[idx+1];
                     dst[idx+2] = src[idx+2];
                     dst[idx+3] = src[idx+3];
                }
            }
        }

        ctx.putImageData(newImgData, x, y);
    } catch(e) {
        console.error(e);
    }
}
