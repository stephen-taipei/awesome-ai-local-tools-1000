const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const lipColorInput = document.getElementById('lip-color');
const opacityInput = document.getElementById('opacity');

let faceMesh = null;
let currentImage = null;

async function init() {
    faceMesh = new FaceMesh({locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
    }});

    faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    faceMesh.onResults(onResults);
}

dropArea.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = async () => {
                currentImage = img;
                canvas.width = img.width;
                canvas.height = img.height;
                document.getElementById('preview-section').style.display = 'block';
                ctx.drawImage(img, 0, 0);

                if (!faceMesh) await init();
                await faceMesh.send({image: img});
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

function onResults(results) {
    ctx.drawImage(currentImage, 0, 0);

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0];

        const upperLipIndices = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 308, 415, 310, 311, 312, 13, 82, 81, 80, 191, 78, 62, 76, 61];
        const lowerLipIndices = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95, 78, 62, 76, 61];

        drawLip(landmarks, upperLipIndices);
        drawLip(landmarks, lowerLipIndices);
    }
}

function drawLip(landmarks, indices) {
    ctx.beginPath();
    const width = canvas.width;
    const height = canvas.height;

    ctx.moveTo(landmarks[indices[0]].x * width, landmarks[indices[0]].y * height);

    for (let i = 1; i < indices.length; i++) {
        const point = landmarks[indices[i]];
        ctx.lineTo(point.x * width, point.y * height);
    }

    ctx.closePath();
    ctx.fillStyle = lipColorInput.value;
    ctx.globalAlpha = opacityInput.value;
    ctx.globalCompositeOperation = 'multiply';
    ctx.fill();
    ctx.globalAlpha = 1.0;
    ctx.globalCompositeOperation = 'source-over';
}

lipColorInput.addEventListener('input', () => {
    if (currentImage) faceMesh.send({image: currentImage});
});

opacityInput.addEventListener('input', () => {
    if (currentImage) faceMesh.send({image: currentImage});
});

init();
