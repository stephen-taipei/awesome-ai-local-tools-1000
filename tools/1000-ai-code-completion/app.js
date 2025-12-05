import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.14.0';

// Configuration
env.allowLocalModels = false;
env.useBrowserCache = true;

// UI Elements
const statusIndicator = document.getElementById('status-indicator');
const generateBtn = document.getElementById('generate-btn');
const codeEditor = document.getElementById('code-editor');
const outputArea = document.getElementById('output-area');
const modelSelect = document.getElementById('model-select');
const maxTokensInput = document.getElementById('max-tokens');
const temperatureInput = document.getElementById('temperature');
const tempVal = document.getElementById('temp-val');

let generator = null;
let currentModel = '';

// Update temperature display
temperatureInput.addEventListener('input', (e) => {
    tempVal.textContent = e.target.value;
});

// Initialize Model
async function loadModel(modelName) {
    try {
        if (generator && currentModel === modelName) return;

        statusIndicator.className = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800";
        statusIndicator.innerHTML = `<span class="loader mr-2"></span> Loading Model...`;
        generateBtn.disabled = true;

        // Initialize the pipeline
        generator = await pipeline('text-generation', modelName, {
            progress_callback: (data) => {
                if (data.status === 'progress') {
                    const percent = Math.round(data.progress * 100);
                    statusIndicator.innerHTML = `<span class="loader mr-2"></span> Loading: ${percent}%`;
                }
            }
        });

        currentModel = modelName;
        statusIndicator.className = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800";
        statusIndicator.textContent = "Model Ready";
        generateBtn.disabled = false;

    } catch (error) {
        console.error("Error loading model:", error);
        statusIndicator.className = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800";
        statusIndicator.textContent = "Load Failed";
        outputArea.innerHTML = `<div class="text-red-500">Error loading model: ${error.message}</div>`;
    }
}

// Generate Code
async function generateCode() {
    if (!generator) return;

    const prompt = codeEditor.value;
    if (!prompt.trim()) return;

    try {
        generateBtn.disabled = true;
        generateBtn.innerHTML = `<span class="loader"></span>`;
        statusIndicator.textContent = "Generating...";

        const maxTokens = parseInt(maxTokensInput.value) || 50;
        const temperature = parseFloat(temperatureInput.value) || 0.5;

        const output = await generator(prompt, {
            max_new_tokens: maxTokens,
            temperature: temperature,
            // do_sample: true, // Uncomment if temperature > 0 requires this explicitly in some versions
        });

        // Display result
        if (output && output.length > 0) {
            const generatedText = output[0].generated_text;
            // Highlight the new part if possible, or just show full
            // Simple diff display:
            const newPart = generatedText.substring(prompt.length);
            
            outputArea.innerHTML = `
                <div class="text-gray-500 mb-2 border-b pb-1">Output:</div>
                <pre class="whitespace-pre-wrap break-words"><span class="text-gray-400">${escapeHtml(prompt)}</span><span class="text-blue-600 font-bold">${escapeHtml(newPart)}</span></pre>
            `;
        }

    } catch (error) {
        console.error("Generation error:", error);
        outputArea.innerHTML = `<div class="text-red-500">Generation error: ${error.message}</div>`;
    } finally {
        generateBtn.disabled = false;
        generateBtn.innerHTML = `<i class="fas fa-magic text-xl"></i>`;
        statusIndicator.textContent = "Model Ready";
    }
}

// Helper to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Event Listeners
generateBtn.addEventListener('click', generateCode);

// Load initial model
window.addEventListener('DOMContentLoaded', () => {
    loadModel(modelSelect.value);
});

modelSelect.addEventListener('change', (e) => {
    loadModel(e.target.value);
});

// Keyboard shortcut (Ctrl+Enter)
codeEditor.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        generateCode();
    }
});
