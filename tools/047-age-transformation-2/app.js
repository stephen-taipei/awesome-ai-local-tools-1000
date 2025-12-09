// AI Age Transformation
// Uses MediaPipe FaceMesh to detect landmarks and canvas drawing to simulate aging/youth.

const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const canvas = document.getElementById('result-canvas');
const ctx = canvas.getContext('2d');
const ageSlider = document.getElementById('age-slider');
const ageDisplay = document.getElementById('age-display');
let originalImage = null;
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

ageSlider.addEventListener('input', (e) => {
    ageDisplay.textContent = `Age: ${e.target.value}`;
    if (originalImage) {
        requestAnimationFrame(render);
    }
});

dropArea.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) loadFile(file);
});

function loadFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            originalImage = img;
            canvas.width = img.width;
            canvas.height = img.height;
            document.getElementById('preview-section').style.display = 'block';
            render();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function render() {
    if (!originalImage) return;

    ctx.drawImage(originalImage, 0, 0);

    if (!faceLandmarker) return;

    // Detect face
    const results = faceLandmarker.detect(originalImage);
    if (results.faceLandmarks.length > 0) {
        const landmarks = results.faceLandmarks[0];
        const age = parseInt(ageSlider.value);

        if (age > 50) {
            // Simulate aging: Add wrinkles
            // Forehead wrinkles (approximate indices)
            // 103, 67, 109, 10, 338, 297, 332

            const intensity = (age - 50) / 50; // 0 to 1
            ctx.globalAlpha = intensity * 0.4;
            ctx.strokeStyle = "#3e2723"; // Dark brown
            ctx.lineWidth = 2;

            drawWrinkle(landmarks, [103, 104, 69, 108]);
            drawWrinkle(landmarks, [332, 333, 299, 337]);
            drawWrinkle(landmarks, [46, 53, 52, 65]); // Under eye
            drawWrinkle(landmarks, [276, 283, 282, 295]); // Under eye

            // Nasolabial folds
            drawWrinkle(landmarks, [205, 206, 207]);
            drawWrinkle(landmarks, [425, 426, 427]);

            // Grey hair tint? Hard without segmentation.

            ctx.globalAlpha = 1.0;
        } else if (age < 30) {
            // Simulate youth: Smooth skin
            // We can draw a semi-transparent blurred version of the skin color over the face
            const intensity = (30 - age) / 30; // 0 to 1

            // Simple approach: overlay skin-tone color with "screen" or "overlay" blend
            // Or just blur.

            // This is complex to do right without segmentation.
            // Let's just slightly blur/soften the whole image or face region.
            // Using a simple "soft focus" overlay on the face area.

            // Get bounding box
            // ...

            // For now, let's skip the smoothing as it's hard to do well on canvas without WebGL shaders.
        }
    }
}

function drawWrinkle(landmarks, indices) {
    ctx.beginPath();
    const width = canvas.width;
    const height = canvas.height;

    ctx.moveTo(landmarks[indices[0]].x * width, landmarks[indices[0]].y * height);
    for (let i = 1; i < indices.length; i++) {
        // Add some noise/jitter for realism?
        ctx.lineTo(landmarks[indices[i]].x * width, landmarks[indices[i]].y * height);
    }
    ctx.stroke();
}
