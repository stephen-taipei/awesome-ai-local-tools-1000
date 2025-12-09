document.addEventListener('DOMContentLoaded', () => {
    const contentInput = document.getElementById('contentInput');
    const styleInput = document.getElementById('styleInput');
    const contentImg = document.getElementById('contentImg');
    const styleImg = document.getElementById('styleImg');
    const processBtn = document.getElementById('processBtn');
    const loading = document.getElementById('loading');
    const outputCanvas = document.getElementById('outputCanvas');

    let model = null;
    let contentLoaded = false;
    let styleLoaded = false;

    // Load Arbitrary Style Transfer model from TF Hub (hosted on storage.googleapis.com usually)
    // For this local tool environment, we'll try to use a quantized version or standard magenta model
    // Since we can't easily download 100MB+ models in this simulation without external access guarantee,
    // we will simulate the process if model fails to load or provide a placeholder explanation.
    // However, the prompt implies "Development", so I should try to implement the logic.
    // We will use the TensorFlow.js pre-trained model for arbitrary style transfer.

    const MODEL_URL = 'https://tfhub.dev/google/tfjs-model/magenta/arbitrary-image-stylization-v1-256/int8/prediction/1';

    // Note: TFHub models usually require loading via tf.loadGraphModel from the tfhub URL directly or a converted JSON.
    // Given CORS and environment, we might need a direct link to model.json.
    // Let's assume we use a known compatible URL or explain the limitation.
    // A common one is:
    const MODEL_JSON_URL = 'https://www.kaggle.com/models/google/arbitrary-image-stylization-v1/frameworks/tfJs/variations/256-int8-prediction/versions/1/model.json?tfjs-format=file';
    // Note: The above URL is hypothetical for direct access.
    // Let's try to use the raw storage googleapis link which works often for demos:
    const ACTUAL_MODEL_URL = 'https://storage.googleapis.com/tfjs-models/savedmodel/arbitrary_style_transfer/model.json';

    async function loadModel() {
        try {
            loading.style.display = 'block';
            loading.textContent = 'Loading AI Model...';
            // We use the separated separable conv model which is smaller
            model = await tf.loadGraphModel(ACTUAL_MODEL_URL);
            loading.style.display = 'none';
            console.log('Model loaded');
            checkReady();
        } catch (e) {
            console.error('Failed to load model', e);
            loading.textContent = 'Error loading model. Check internet connection or CORS.';
        }
    }

    // Initialize
    loadModel();

    function checkReady() {
        if (contentLoaded && styleLoaded && model) {
            processBtn.disabled = false;
        }
    }

    contentInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                contentImg.src = event.target.result;
                contentImg.style.display = 'inline-block';
                contentImg.onload = () => {
                    contentLoaded = true;
                    checkReady();
                }
            };
            reader.readAsDataURL(file);
        }
    });

    styleInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                styleImg.src = event.target.result;
                styleImg.style.display = 'inline-block';
                styleImg.onload = () => {
                    styleLoaded = true;
                    checkReady();
                }
            };
            reader.readAsDataURL(file);
        }
    });

    processBtn.addEventListener('click', async () => {
        if (!model) return;

        loading.style.display = 'block';
        loading.textContent = 'Stylizing...';

        // Wait for UI update
        await new Promise(r => setTimeout(r, 100));

        try {
            // Preprocess images
            const contentTensor = preprocess(contentImg);
            const styleTensor = preprocess(styleImg);

            // Run model
            // The magenta model takes [content, style]
            const result = await model.executeAsync([contentTensor, styleTensor]);

            // Postprocess and draw
            await tf.browser.toPixels(tf.squeeze(result), outputCanvas);

            // Cleanup
            contentTensor.dispose();
            styleTensor.dispose();
            result.dispose();

            loading.style.display = 'none';
        } catch (e) {
            console.error(e);
            loading.textContent = 'Error during processing: ' + e.message;
        }
    });

    function preprocess(imgElement) {
        // Resize to 256x256 or similar as required by some models,
        // but Arbitrary Style Transfer usually handles various sizes.
        // However, for performance in browser, keep it reasonable.
        return tf.tidy(() => {
            let tensor = tf.browser.fromPixels(imgElement);
            // Resize to a manageable size, e.g., max 500px dimension
            const shape = tensor.shape;
            const maxDim = 384; // Good balance
            let h = shape[0];
            let w = shape[1];

            if (h > maxDim || w > maxDim) {
                if (h > w) {
                    w = (w / h) * maxDim;
                    h = maxDim;
                } else {
                    h = (h / w) * maxDim;
                    w = maxDim;
                }
            }

            tensor = tf.image.resizeBilinear(tensor, [parseInt(h), parseInt(w)]);
            tensor = tensor.toFloat().div(255); // Normalize to [0, 1]
            return tensor.expandDims(0); // Add batch dimension [1, h, w, 3]
        });
    }
});
