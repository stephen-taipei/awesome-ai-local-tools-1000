/**
 * Tool #060: Image Tagging
 * Auto-generates descriptive tags based on image analysis
 */
document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('imageInput');
    const preview = document.getElementById('preview');
    const ctx = preview.getContext('2d');
    const previewSection = document.getElementById('previewSection');
    const tagsContainer = document.getElementById('tagsContainer');
    const loading = document.getElementById('loading');
    const exportSection = document.getElementById('exportSection');
    const exportText = document.getElementById('exportText');

    let selectedTags = new Set();
    let allTags = [];

    // Tag databases for various categories
    const tagDatabase = {
        colors: {
            red: ['red', 'crimson', 'scarlet', 'cherry', 'ruby'],
            orange: ['orange', 'tangerine', 'amber', 'peach'],
            yellow: ['yellow', 'golden', 'lemon', 'sunny'],
            green: ['green', 'emerald', 'forest', 'lime', 'sage'],
            blue: ['blue', 'azure', 'navy', 'cobalt', 'sky'],
            purple: ['purple', 'violet', 'lavender', 'plum', 'magenta'],
            pink: ['pink', 'rose', 'blush', 'coral'],
            brown: ['brown', 'chocolate', 'coffee', 'tan', 'sepia'],
            black: ['black', 'dark', 'charcoal', 'ebony'],
            white: ['white', 'cream', 'ivory', 'snow'],
            gray: ['gray', 'silver', 'slate', 'neutral']
        },
        mood: ['bright', 'dark', 'moody', 'vibrant', 'muted', 'warm', 'cool', 'dramatic', 'soft', 'high contrast', 'low contrast'],
        composition: ['centered', 'rule of thirds', 'symmetrical', 'diagonal', 'horizontal', 'vertical', 'close-up', 'wide shot'],
        style: ['minimalist', 'detailed', 'abstract', 'realistic', 'artistic', 'vintage', 'modern', 'classic'],
        subjects: ['portrait', 'landscape', 'nature', 'urban', 'architecture', 'food', 'animal', 'people', 'object', 'sky', 'water', 'plant', 'texture', 'pattern'],
        quality: ['sharp', 'soft focus', 'bokeh', 'grainy', 'smooth', 'detailed', 'high resolution']
    };

    imageInput.addEventListener('change', handleImageUpload);

    function handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const maxSize = 500;
                let w = img.width, h = img.height;
                if (w > maxSize || h > maxSize) {
                    const scale = Math.min(maxSize / w, maxSize / h);
                    w = Math.floor(w * scale);
                    h = Math.floor(h * scale);
                }

                preview.width = w;
                preview.height = h;
                ctx.drawImage(img, 0, 0, w, h);

                previewSection.style.display = 'flex';
                loading.style.display = 'block';
                exportSection.style.display = 'none';

                // Simulate processing time
                setTimeout(() => {
                    analyzeImage(ctx.getImageData(0, 0, w, h));
                }, 500);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }

    function analyzeImage(imageData) {
        const data = imageData.data;
        const w = imageData.width, h = imageData.height;
        allTags = [];
        selectedTags.clear();

        // Analyze colors
        const colorAnalysis = analyzeColors(data);

        // Analyze brightness and contrast
        const toneAnalysis = analyzeTones(data);

        // Analyze composition
        const compAnalysis = analyzeComposition(data, w, h);

        // Analyze texture/detail
        const textureAnalysis = analyzeTexture(data, w, h);

        // Generate tags based on analysis
        const generatedTags = {
            'Colors | 顏色': generateColorTags(colorAnalysis),
            'Mood | 氛圍': generateMoodTags(toneAnalysis),
            'Composition | 構圖': generateCompositionTags(compAnalysis),
            'Style | 風格': generateStyleTags(textureAnalysis, toneAnalysis),
            'Subjects | 主題': generateSubjectTags(colorAnalysis, toneAnalysis)
        };

        displayTags(generatedTags);
        loading.style.display = 'none';
        exportSection.style.display = 'block';
    }

    function analyzeColors(data) {
        const colorCounts = {};
        const sampleRate = 4;

        for (let i = 0; i < data.length; i += 4 * sampleRate) {
            const r = data[i], g = data[i + 1], b = data[i + 2];
            const colorName = getColorName(r, g, b);
            colorCounts[colorName] = (colorCounts[colorName] || 0) + 1;
        }

        return Object.entries(colorCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
    }

    function getColorName(r, g, b) {
        const colors = [
            { name: 'red', rgb: [255, 0, 0] },
            { name: 'orange', rgb: [255, 165, 0] },
            { name: 'yellow', rgb: [255, 255, 0] },
            { name: 'green', rgb: [0, 128, 0] },
            { name: 'blue', rgb: [0, 0, 255] },
            { name: 'purple', rgb: [128, 0, 128] },
            { name: 'pink', rgb: [255, 192, 203] },
            { name: 'brown', rgb: [139, 69, 19] },
            { name: 'black', rgb: [0, 0, 0] },
            { name: 'white', rgb: [255, 255, 255] },
            { name: 'gray', rgb: [128, 128, 128] }
        ];

        let minDist = Infinity, closest = 'gray';
        for (const color of colors) {
            const dist = Math.sqrt(
                Math.pow(r - color.rgb[0], 2) +
                Math.pow(g - color.rgb[1], 2) +
                Math.pow(b - color.rgb[2], 2)
            );
            if (dist < minDist) {
                minDist = dist;
                closest = color.name;
            }
        }
        return closest;
    }

    function analyzeTones(data) {
        let totalBrightness = 0;
        let minBrightness = 255, maxBrightness = 0;
        const brightnessValues = [];

        for (let i = 0; i < data.length; i += 4) {
            const brightness = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            totalBrightness += brightness;
            brightnessValues.push(brightness);
            if (brightness < minBrightness) minBrightness = brightness;
            if (brightness > maxBrightness) maxBrightness = brightness;
        }

        const avgBrightness = totalBrightness / (data.length / 4);
        const contrast = maxBrightness - minBrightness;

        // Calculate saturation average
        let totalSaturation = 0;
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i + 1], b = data[i + 2];
            const max = Math.max(r, g, b), min = Math.min(r, g, b);
            totalSaturation += max > 0 ? (max - min) / max : 0;
        }
        const avgSaturation = totalSaturation / (data.length / 4);

        return {
            brightness: avgBrightness,
            contrast: contrast,
            saturation: avgSaturation
        };
    }

    function analyzeComposition(data, w, h) {
        // Analyze brightness distribution in regions
        const regions = { top: 0, bottom: 0, left: 0, right: 0, center: 0 };
        let counts = { top: 0, bottom: 0, left: 0, right: 0, center: 0 };

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const idx = (y * w + x) * 4;
                const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;

                // Top third
                if (y < h / 3) { regions.top += brightness; counts.top++; }
                // Bottom third
                if (y > 2 * h / 3) { regions.bottom += brightness; counts.bottom++; }
                // Left third
                if (x < w / 3) { regions.left += brightness; counts.left++; }
                // Right third
                if (x > 2 * w / 3) { regions.right += brightness; counts.right++; }
                // Center
                if (x > w / 3 && x < 2 * w / 3 && y > h / 3 && y < 2 * h / 3) {
                    regions.center += brightness; counts.center++;
                }
            }
        }

        Object.keys(regions).forEach(k => {
            regions[k] = counts[k] > 0 ? regions[k] / counts[k] : 0;
        });

        return regions;
    }

    function analyzeTexture(data, w, h) {
        let edgeSum = 0;
        let pixelCount = 0;

        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
                const idx = (y * w + x) * 4;
                const current = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                const right = (data[idx + 4] + data[idx + 5] + data[idx + 6]) / 3;
                const bottom = (data[idx + w * 4] + data[idx + w * 4 + 1] + data[idx + w * 4 + 2]) / 3;

                edgeSum += Math.abs(current - right) + Math.abs(current - bottom);
                pixelCount++;
            }
        }

        return {
            detail: edgeSum / pixelCount,
            complexity: edgeSum / pixelCount > 20 ? 'high' : edgeSum / pixelCount > 10 ? 'medium' : 'low'
        };
    }

    function generateColorTags(colorAnalysis) {
        const tags = [];
        colorAnalysis.forEach(([color, count], i) => {
            const confidence = Math.max(0.5, 1 - i * 0.15);
            const variants = tagDatabase.colors[color] || [color];
            tags.push({ name: variants[0], confidence });
            if (i < 2 && variants.length > 1) {
                tags.push({ name: variants[Math.floor(Math.random() * (variants.length - 1)) + 1], confidence: confidence - 0.1 });
            }
        });
        return tags;
    }

    function generateMoodTags(toneAnalysis) {
        const tags = [];
        const { brightness, contrast, saturation } = toneAnalysis;

        if (brightness > 150) tags.push({ name: 'bright', confidence: 0.9 });
        else if (brightness < 80) tags.push({ name: 'dark', confidence: 0.9 });
        else tags.push({ name: 'balanced', confidence: 0.7 });

        if (contrast > 180) tags.push({ name: 'high contrast', confidence: 0.85 });
        else if (contrast < 100) tags.push({ name: 'low contrast', confidence: 0.8 });

        if (saturation > 0.5) tags.push({ name: 'vibrant', confidence: 0.85 });
        else if (saturation < 0.2) tags.push({ name: 'muted', confidence: 0.8 });

        // Add mood tags based on color temperature
        if (brightness > 120 && saturation > 0.3) {
            tags.push({ name: 'warm', confidence: 0.75 });
        } else if (brightness < 100) {
            tags.push({ name: 'moody', confidence: 0.7 });
        }

        return tags;
    }

    function generateCompositionTags(compAnalysis) {
        const tags = [];
        const { top, bottom, left, right, center } = compAnalysis;

        // Check for centered composition
        const avgEdge = (top + bottom + left + right) / 4;
        if (Math.abs(center - avgEdge) > 30) {
            tags.push({ name: 'centered', confidence: 0.8 });
        }

        // Check for rule of thirds
        if (Math.abs(left - right) < 20 && Math.abs(top - bottom) < 20) {
            tags.push({ name: 'balanced', confidence: 0.75 });
        }

        // Check for horizontal/vertical emphasis
        if (Math.abs(top - bottom) > 40) {
            tags.push({ name: top > bottom ? 'top-heavy' : 'bottom-heavy', confidence: 0.7 });
        }
        if (Math.abs(left - right) > 40) {
            tags.push({ name: left > right ? 'left-weighted' : 'right-weighted', confidence: 0.7 });
        }

        return tags;
    }

    function generateStyleTags(textureAnalysis, toneAnalysis) {
        const tags = [];

        if (textureAnalysis.complexity === 'low') {
            tags.push({ name: 'minimalist', confidence: 0.85 });
            tags.push({ name: 'clean', confidence: 0.8 });
        } else if (textureAnalysis.complexity === 'high') {
            tags.push({ name: 'detailed', confidence: 0.85 });
            tags.push({ name: 'complex', confidence: 0.75 });
        }

        if (toneAnalysis.saturation < 0.15) {
            tags.push({ name: 'monochrome', confidence: 0.9 });
        }

        if (toneAnalysis.contrast > 200) {
            tags.push({ name: 'dramatic', confidence: 0.8 });
        } else if (toneAnalysis.contrast < 80) {
            tags.push({ name: 'soft', confidence: 0.8 });
        }

        return tags;
    }

    function generateSubjectTags(colorAnalysis, toneAnalysis) {
        const tags = [];
        const dominantColor = colorAnalysis[0]?.[0];

        // Infer subjects based on color patterns
        if (dominantColor === 'green') {
            tags.push({ name: 'nature', confidence: 0.7 });
            tags.push({ name: 'outdoors', confidence: 0.65 });
        } else if (dominantColor === 'blue') {
            tags.push({ name: 'sky', confidence: 0.6 });
            tags.push({ name: 'water', confidence: 0.55 });
        } else if (['brown', 'orange'].includes(dominantColor)) {
            tags.push({ name: 'warm tones', confidence: 0.7 });
        }

        // Add generic tags
        if (toneAnalysis.saturation > 0.4) {
            tags.push({ name: 'colorful', confidence: 0.75 });
        }

        return tags;
    }

    function displayTags(tagsByCategory) {
        let html = '';

        for (const [category, tags] of Object.entries(tagsByCategory)) {
            if (tags.length === 0) continue;

            html += `<div class="tag-category">
                <h4>${category}</h4>
                <div class="tags-list">`;

            tags.forEach(tag => {
                allTags.push(tag.name);
                html += `<span class="tag" data-tag="${tag.name}">
                    ${tag.name}
                    <span class="confidence">${Math.round(tag.confidence * 100)}%</span>
                </span>`;
            });

            html += `</div></div>`;
        }

        tagsContainer.innerHTML = html;
        updateExportText();

        // Add click handlers
        document.querySelectorAll('.tag').forEach(el => {
            el.addEventListener('click', () => {
                el.classList.toggle('selected');
                const tagName = el.dataset.tag;
                if (selectedTags.has(tagName)) {
                    selectedTags.delete(tagName);
                } else {
                    selectedTags.add(tagName);
                }
                updateExportText();
            });
        });
    }

    function updateExportText() {
        const tags = selectedTags.size > 0 ? Array.from(selectedTags) : allTags;
        exportText.value = tags.join(', ');
    }

    // Export functions
    document.getElementById('copyBtn').addEventListener('click', () => {
        exportText.select();
        document.execCommand('copy');
        alert('Tags copied! | 標籤已複製!');
    });

    document.getElementById('copyHashtags').addEventListener('click', () => {
        const tags = selectedTags.size > 0 ? Array.from(selectedTags) : allTags;
        const hashtags = tags.map(t => '#' + t.replace(/\s+/g, '')).join(' ');
        navigator.clipboard.writeText(hashtags);
        alert('Hashtags copied! | 標籤已複製!');
    });

    document.getElementById('downloadBtn').addEventListener('click', () => {
        const tags = selectedTags.size > 0 ? Array.from(selectedTags) : allTags;
        const json = JSON.stringify({ tags, generatedAt: new Date().toISOString() }, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'image-tags.json';
        a.click();
        URL.revokeObjectURL(url);
    });
});
