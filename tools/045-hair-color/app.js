const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const hairColorInput = document.getElementById('hair-color');
const loading = document.getElementById('loading');

let imageSegmenter;
let runningMode = "IMAGE";

async function createSegmenter() {
    loading.style.display = 'block';
    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );
    imageSegmenter = await ImageSegmenter.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/image_segmenter/hair_segmenter/float32/1/hair_segmenter.tflite",
            delegate: "GPU"
        },
        runningMode: runningMode,
        outputCategoryMask: true,
        outputConfidenceMasks: false
    });
    loading.style.display = 'none';
}

createSegmenter();

dropArea.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                processImage(img);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

async function processImage(img) {
    if (!imageSegmenter) return;

    canvas.width = img.width;
    canvas.height = img.height;
    document.getElementById('preview-section').style.display = 'block';

    const result = await imageSegmenter.segment(img);
    const mask = result.categoryMask;

    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, img.width, img.height);
    const data = imageData.data;
    const maskData = mask.getAsUint8Array();

    const hex = hairColorInput.value;
    const r = parseInt(hex.substring(1,3), 16);
    const g = parseInt(hex.substring(3,5), 16);
    const b = parseInt(hex.substring(5,7), 16);

    for (let i = 0; i < maskData.length; i++) {
        if (maskData[i] > 0) {
             const idx = i * 4;
             data[idx] = (data[idx] * 0.5) + (r * 0.5);
             data[idx+1] = (data[idx+1] * 0.5) + (g * 0.5);
             data[idx+2] = (data[idx+2] * 0.5) + (b * 0.5);
        }
    }

    ctx.putImageData(imageData, 0, 0);
}
