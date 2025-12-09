document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('imageInput');
    const eyeSizeInput = document.getElementById('eyeSize');
    const noseSizeInput = document.getElementById('noseSize');
    const smileInput = document.getElementById('smile');
    const resetBtn = document.getElementById('resetBtn');
    const outputCanvas = document.getElementById('outputCanvas');
    const outputCtx = outputCanvas.getContext('2d');
    const loading = document.getElementById('loading');

    let originalImage = null;
    let faceLandmarks = null;
    let faceMesh = null;

    // Initialize MediaPipe Face Mesh
    async function initFaceMesh() {
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

    initFaceMesh();

    function onResults(results) {
        loading.style.display = 'none';
        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            faceLandmarks = results.multiFaceLandmarks[0];
            draw();
        } else {
            alert('No face detected.');
            // Just draw the original image
            if (originalImage) {
                outputCtx.drawImage(originalImage, 0, 0, outputCanvas.width, outputCanvas.height);
            }
        }
    }

    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            originalImage = new Image();
            originalImage.onload = async () => {
                const maxWidth = 800;
                let width = originalImage.width;
                let height = originalImage.height;

                if (width > maxWidth) {
                    height = (maxWidth / width) * height;
                    width = maxWidth;
                }

                outputCanvas.width = width;
                outputCanvas.height = height;
                outputCtx.drawImage(originalImage, 0, 0, width, height);

                loading.style.display = 'block';
                await faceMesh.send({image: outputCanvas});
            };
            originalImage.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    [eyeSizeInput, noseSizeInput, smileInput].forEach(input => {
        input.addEventListener('input', draw);
    });

    resetBtn.addEventListener('click', () => {
        eyeSizeInput.value = 0;
        noseSizeInput.value = 0;
        smileInput.value = 0;
        draw();
    });

    function draw() {
        if (!originalImage || !faceLandmarks) return;

        // Reset canvas with original image
        outputCtx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
        outputCtx.drawImage(originalImage, 0, 0, outputCanvas.width, outputCanvas.height);

        // Apply warps
        // We use a simple image warping technique based on triangulated mesh or local displacement
        // For simplicity in Canvas 2D without WebGL shaders, we can use multiple small drawImage calls
        // to approximate warping, or just simple scaling of regions.
        // A proper implementation requires WebGL or complex Canvas 2D mesh mapping.
        // Here we will implement a simplified "magnify/shrink" effect for eyes/nose
        // and a shift for smile.

        const w = outputCanvas.width;
        const h = outputCanvas.height;

        // Helper to get coords
        const getPt = (idx) => ({
            x: faceLandmarks[idx].x * w,
            y: faceLandmarks[idx].y * h
        });

        const eyeSize = parseInt(eyeSizeInput.value) / 100; // -0.5 to 0.5
        const noseSize = parseInt(noseSizeInput.value) / 100;
        const smileVal = parseInt(smileInput.value);

        // 1. Left Eye (Indices around 468? No, Iris is 468, 473. Center of eye approx 468, 473)
        // MediaPipe Face Mesh Keypoints: Left Eye Center ~ 468, Right Eye Center ~ 473
        const leftEyeCenter = getPt(468);
        const rightEyeCenter = getPt(473);

        // Approximate radius of eye region
        const eyeRadius = Math.abs(getPt(33).x - getPt(133).x) * 0.8; // Distance between inner/outer corners

        if (eyeSize !== 0) {
            applyBulgePinch(outputCtx, leftEyeCenter.x, leftEyeCenter.y, eyeRadius, eyeSize);
            applyBulgePinch(outputCtx, rightEyeCenter.x, rightEyeCenter.y, eyeRadius, eyeSize);
        }

        // 2. Nose (Center ~ 4)
        const noseCenter = getPt(4);
        const noseRadius = Math.abs(getPt(21).x - getPt(251).x) * 0.8; // Width

        if (noseSize !== 0) {
            // Negative strength makes it smaller (pinch), positive makes it bigger (bulge)
            // But usually "nose width" means horizontal scaling.
            // Bulge/Pinch is easiest to implement in pure 2D canvas without mesh
            applyBulgePinch(outputCtx, noseCenter.x, noseCenter.y, noseRadius * 1.5, noseSize);
        }

        // 3. Smile (Mouth corners 61 and 291)
        if (smileVal !== 0) {
            // This is harder with pure 2D.
            // We can try to move the corners up/down.
            // Copy the mouth corner region and draw it offset.
            // This looks bad without mesh warping.
            // Let's try a very subtle nudge.
            const leftCorner = getPt(61);
            const rightCorner = getPt(291);
            const radius = 20;

            // Move corners up
            const offset = smileVal * -0.5; // Negative Y is up

            copyAndMove(outputCtx, leftCorner.x, leftCorner.y, radius, 0, offset);
            copyAndMove(outputCtx, rightCorner.x, rightCorner.y, radius, 0, offset);
        }
    }

    function applyBulgePinch(ctx, cx, cy, radius, strength) {
        // Strength: > 0 for bulge (magnify), < 0 for pinch (shrink)
        // Canvas 2D doesn't support displacement maps natively.
        // We can approximate by drawing slices.
        // Or we use the 'magnify' trick: draw the image from a smaller source rect to a larger dest rect (bulge)
        // or larger source to smaller dest (pinch).

        const d = radius * 2;

        // Save state
        ctx.save();

        // Clip a circle
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.clip();

        // If strength > 0 (Bulge/Big Eyes)
        // We want to show LESS of the source image in the SAME space.
        // Source rect should be smaller than Dest rect.

        // If strength < 0 (Pinch/Small Eyes)
        // We want to show MORE of the source image in the SAME space.
        // Source rect should be larger than Dest rect.

        const scale = 1 - strength; // e.g. strength 0.5 -> scale 0.5 (zoom in). strength -0.5 -> scale 1.5 (zoom out)

        const sSize = d * scale;
        const sX = cx - sSize/2;
        const sY = cy - sSize/2;

        // Draw image again
        // Note: we need the original image source to avoid recursive blurring if we did this on the same canvas multiple times
        // But here we redraw on top of the base image which is already on canvas?
        // Ideally we read from 'originalImage'
        if (originalImage) {
            // Calculate source coordinates in original image space
            const ratioX = originalImage.width / outputCanvas.width;
            const ratioY = originalImage.height / outputCanvas.height;

            ctx.drawImage(originalImage,
                sX * ratioX, sY * ratioY, sSize * ratioX, sSize * ratioY, // Source
                cx - radius, cy - radius, d, d // Dest
            );
        }

        ctx.restore();
    }

    function copyAndMove(ctx, cx, cy, radius, dx, dy) {
         ctx.save();
         ctx.beginPath();
         ctx.arc(cx + dx, cy + dy, radius, 0, Math.PI*2);
         ctx.clip();

         // Draw from original at (cx, cy) to (cx+dx, cy+dy)
         if (originalImage) {
             const ratioX = originalImage.width / outputCanvas.width;
             const ratioY = originalImage.height / outputCanvas.height;

             ctx.drawImage(originalImage,
                 (cx - radius) * ratioX, (cy - radius) * ratioY, (radius*2) * ratioX, (radius*2) * ratioY,
                 cx + dx - radius, cy + dy - radius, radius*2, radius*2
             );
         }
         ctx.restore();
    }
});
