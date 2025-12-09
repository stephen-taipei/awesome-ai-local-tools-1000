// Portrait to Anime using OpenCV.js for a "Cartoon" effect
// Pipeline:
// 1. Bilateral Filter to smooth colors while keeping edges (cartoon look)
// 2. Canny Edge Detection to find edges
// 3. Dilate edges to make them thicker
// 4. Combine smoothed image with edges

const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const originalImg = document.getElementById('original-img');
const resultCanvas = document.getElementById('result-canvas');
const loading = document.getElementById('loading');

let cvReady = false;

function onOpenCvReady() {
    cvReady = true;
}

dropArea.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFile);

function handleFile(e) {
    if (!cvReady) {
        // Fallback or wait
        if (typeof cv !== 'undefined') {
            cvReady = true;
        } else {
            alert("OpenCV is loading...");
            return;
        }
    }

    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            originalImg.src = event.target.result;
            originalImg.onload = () => {
                document.getElementById('preview-section').style.display = 'block';
                resultCanvas.width = originalImg.width;
                resultCanvas.height = originalImg.height;
                processImage();
            };
        };
        reader.readAsDataURL(file);
    }
}

function processImage() {
    loading.style.display = 'block';

    // Allow UI to update
    setTimeout(() => {
        try {
            let src = cv.imread(originalImg);
            let dst = new cv.Mat();
            let gray = new cv.Mat();
            let edges = new cv.Mat();

            // 1. Reduce noise and smooth using Bilateral Filter
            // d=9, sigmaColor=75, sigmaSpace=75 are standard values
            // Note: bilateralFilter can be slow in JS.
            // Alternative: Pyramid Mean Shift Filtering (pyrMeanShiftFiltering) if available in opencv.js
            // but it might not be bound.
            // Let's use simple medianBlur + GaussianBlur as a faster approx for "flat" colors

            cv.cvtColor(src, src, cv.COLOR_RGBA2RGB); // Ensure 3 channels

            let smooth = new cv.Mat();
            // Median blur to remove noise/texture
            cv.medianBlur(src, smooth, 7);

            // 2. Edge Detection
            cv.cvtColor(src, gray, cv.COLOR_RGB2GRAY);
            cv.medianBlur(gray, gray, 5);
            // Adaptive thresholding makes for nice line drawings
            cv.adaptiveThreshold(gray, edges, 255, cv.ADAPTIVE_THRESH_MEAN_C, cv.THRESH_BINARY, 9, 9);

            // 3. Color Quantization (Simplified)
            // Ideally k-means, but that's slow.
            // We can just downsample and upsample or use integer division
            // Let's do a simple bitwise AND to reduce color palette
            // e.g. floor(pixel / 24) * 24

            let data = smooth.data;
            for(let i=0; i<data.length; i++) {
                data[i] = Math.floor(data[i] / 32) * 32;
            }

            // 4. Combine
            // Edges are black on white. We want to apply black edges to the color image.
            // Convert edges back to RGB
            let edgesRgb = new cv.Mat();
            cv.cvtColor(edges, edgesRgb, cv.COLOR_GRAY2RGB);

            // Bitwise AND to apply edges
            cv.bitwise_and(smooth, edgesRgb, dst);

            cv.imshow('result-canvas', dst);

            // Cleanup
            src.delete(); dst.delete(); gray.delete(); edges.delete(); smooth.delete(); edgesRgb.delete();

        } catch (e) {
            console.error(e);
            alert("Error processing image: " + e);
        }

        loading.style.display = 'none';
    }, 100);
}
