// Skin Tone Adjustment using OpenCV.js for HSV manipulation
// Ideally we use a skin segmentation model, but OpenCV range thresholding works for a basic version.

const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const toneSelect = document.getElementById('tone-select');
const intensityInput = document.getElementById('intensity');
let originalMat = null;
let openCvReady = false;

function onOpenCvReady() {
    openCvReady = true;
    console.log('OpenCV.js Ready');
}

dropArea.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFile);

function handleFile(e) {
    if (!openCvReady) {
        alert("OpenCV is loading, please wait...");
        return;
    }
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                originalMat = cv.imread(canvas);
                processImage();
                document.getElementById('preview-section').style.display = 'block';
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
}

toneSelect.addEventListener('change', processImage);
intensityInput.addEventListener('input', processImage);

function processImage() {
    if (!originalMat) return;

    const tone = toneSelect.value;
    const intensity = parseInt(intensityInput.value) / 100; // 0.0 to 1.0

    // Always start from original
    if (tone === 'none') {
        cv.imshow('canvas', originalMat);
        return;
    }

    try {
        let src = originalMat.clone();
        let hsv = new cv.Mat();

        // Convert to HSV
        cv.cvtColor(src, hsv, cv.COLOR_RGBA2RGB);
        cv.cvtColor(hsv, hsv, cv.COLOR_RGB2HSV);

        // Define skin color range (Generic Caucasian/Asian/Light skin range)
        // Adjust these values for broader detection if needed
        let low = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [0, 48, 80, 0]);
        let high = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [20, 255, 255, 255]);
        let mask = new cv.Mat();

        // Create mask
        cv.inRange(hsv, low, high, mask);

        // Prepare adjustments based on tone selection
        let h_shift = 0;
        let s_scale = 1.0;
        let v_scale = 1.0;

        if (tone === 'fair') {
            s_scale = 0.8; // Desaturate
            v_scale = 1.1; // Brighten
        } else if (tone === 'tan') {
            h_shift = -2; // Slightly more red/orange
            s_scale = 1.2; // Saturate
            v_scale = 0.9; // Darken slightly
        } else if (tone === 'dark') {
            h_shift = 0;
            s_scale = 1.1;
            v_scale = 0.7; // Darken significantly
        }

        // Apply adjustments pixel by pixel where mask > 0
        // OpenCV.js isn't as fast as C++ for loops, but for reasonable image sizes it's okay.
        // Direct buffer manipulation is faster.

        // Get data from mats
        // src is RGBA, hsv is HSV (3 channels)
        // We need to modify hsv then convert back

        // Let's modify the HSV mat directly
        let hsvData = hsv.data;
        let maskData = mask.data;
        let channels = hsv.channels(); // should be 3

        for (let i = 0; i < maskData.length; i++) {
            if (maskData[i] === 255) { // If skin
                let idx = i * channels;

                // Hue
                let h = hsvData[idx] + h_shift;
                if (h < 0) h += 180;
                if (h > 180) h -= 180;

                // Saturation
                let s = hsvData[idx + 1] * s_scale;
                if (s > 255) s = 255;

                // Value
                let v = hsvData[idx + 2] * v_scale;
                if (v > 255) v = 255;

                // Blend with original based on intensity
                // Current = Original + (New - Original) * intensity
                hsvData[idx] = hsvData[idx] * (1 - intensity) + h * intensity;
                hsvData[idx + 1] = hsvData[idx + 1] * (1 - intensity) + s * intensity;
                hsvData[idx + 2] = hsvData[idx + 2] * (1 - intensity) + v * intensity;
            }
        }

        // Convert back to RGB
        let dst = new cv.Mat();
        cv.cvtColor(hsv, dst, cv.COLOR_HSV2RGB);

        // Display
        cv.imshow('canvas', dst);

        // Clean up
        src.delete(); hsv.delete(); low.delete(); high.delete(); mask.delete(); dst.delete();

    } catch (err) {
        console.error(err);
    }
}
