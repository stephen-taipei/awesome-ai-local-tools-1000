import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.14.0';

// Skip local model checks since we are running in browser
env.allowLocalModels = false;
env.useBrowserCache = true;

const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const previewSection = document.getElementById('preview-section');
const previewImage = document.getElementById('preview-image');
const resultsDiv = document.getElementById('results');
const loadingDiv = document.getElementById('loading');

let classifier = null;

async function initModel() {
    try {
        classifier = await pipeline('image-classification', 'Xenova/resnet-50');
    } catch (error) {
        console.error('Error loading model:', error);
        resultsDiv.innerHTML = `<div class="error">Failed to load model: ${error.message}</div>`;
    }
}

// Initialize model on load
initModel();

// Event Listeners
dropArea.addEventListener('click', () => fileInput.click());

dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropArea.style.borderColor = 'var(--primary)';
});

dropArea.addEventListener('dragleave', () => {
    dropArea.style.borderColor = 'var(--border)';
});

dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dropArea.style.borderColor = 'var(--border)';
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFile(files[0]);
});

fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) handleFile(fileInput.files[0]);
});

async function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Please upload an image file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        previewImage.src = e.target.result;
        previewSection.style.display = 'block';
        resultsDiv.innerHTML = '';
        loadingDiv.style.display = 'block';

        await analyzeImage(e.target.result);
    };
    reader.readAsDataURL(file);
}

async function analyzeImage(imageUrl) {
    if (!classifier) {
        await initModel();
    }

    try {
        const results = await classifier(imageUrl, { topk: 5 });
        loadingDiv.style.display = 'none';
        displayResults(results);
    } catch (error) {
        console.error('Analysis error:', error);
        loadingDiv.style.display = 'none';
        resultsDiv.innerHTML = `<div class="error">Error analyzing image: ${error.message}</div>`;
    }
}

function displayResults(results) {
    resultsDiv.innerHTML = results.map(result => `
        <div class="result-item">
            <span class="label">${result.label}</span>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${result.score * 100}%"></div>
            </div>
            <span class="score">${(result.score * 100).toFixed(1)}%</span>
        </div>
    `).join('');
}
