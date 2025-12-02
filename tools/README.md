# AI Local Tools Index

> All tools in this directory run entirely in your browser with zero data upload.

## Completed Tools

| # | Tool Name | Category | Model | Status |
|---|-----------|----------|-------|--------|
| 001 | [AI Background Remover](./001-background-remover/) | Image Processing | RMBG-1.4 | ✅ Complete |
| 003 | [AI Background Blur](./003-background-blur/) | Image Processing | MediaPipe Selfie Segmenter | ✅ Complete |
| 004 | [AI Background Color Fill](./004-background-color-fill/) | Image Processing | RMBG-1.4 | ✅ Complete |
| 005 | [AI ID Photo Background](./005-id-photo-background/) | Image Processing | RMBG-1.4 | ✅ Complete |
| 006 | [AI Background Extender](./006-background-extender/) | Image Processing | Canvas API | ✅ Complete |
| 007 | [AI Scene Background](./007-scene-background/) | Image Processing | RMBG-1.4 | ✅ Complete |
| 008 | [AI Background Bokeh](./008-background-bokeh/) | Image Processing | Depth-Anything | ✅ Complete |
| 009 | [AI Green Screen](./009-green-screen/) | Image Processing | HSV Chroma Key | ✅ Complete |
| 010 | [AI Background Animation](./010-background-animation/) | Image Processing | Perlin Noise + Canvas | ✅ Complete |
| 012 | [AI Super Resolution 2x](./012-super-resolution-2x/) | Image Enhancement | Swin2SR | ✅ Complete |
| 013 | [Anime Image Enhancement](./013-anime-enhancement/) | Image Enhancement | Swin2SR + Anime Filter | ✅ Complete |
| 014 | [Old Photo Restoration](./014-old-photo-restoration/) | Image Enhancement | Restoration AI | ✅ Complete |
| 015 | [Smart Denoise](./015-smart-denoise/) | Image Enhancement | Bilateral Filter | ✅ Complete |
| 051 | [AI Image Classifier](./051-image-classifier/) | Image Recognition | MobileNetV2 | ✅ Complete |
| 052 | [AI Object Detection](./052-object-detection/) | Image Recognition | YOLOS-tiny | ✅ Complete |

## Directory Structure

```
tools/
├── README.md                    # This file
├── 001-background-remover/      # AI Background Remover
│   ├── index.html
│   ├── style.css
│   └── app.js
├── 003-background-blur/         # AI Background Blur
│   ├── index.html
│   ├── style.css
│   └── app.js
├── 004-background-color-fill/   # AI Background Color Fill
│   ├── index.html
│   ├── style.css
│   └── app.js
├── 005-id-photo-background/     # AI ID Photo Background
│   ├── index.html
│   ├── style.css
│   └── app.js
├── 006-background-extender/     # AI Background Extender
│   ├── index.html
│   ├── style.css
│   └── app.js
├── 007-scene-background/        # AI Scene Background
│   ├── index.html
│   ├── style.css
│   └── app.js
├── 008-background-bokeh/        # AI Background Bokeh
│   ├── index.html
│   ├── style.css
│   └── app.js
├── 009-green-screen/            # AI Green Screen
│   ├── index.html
│   ├── style.css
│   └── app.js
├── 010-background-animation/    # AI Background Animation
│   ├── index.html
│   ├── style.css
│   └── app.js
├── 012-super-resolution-2x/     # AI Super Resolution 2x
│   ├── index.html
│   ├── style.css
│   └── app.js
├── 013-anime-enhancement/       # Anime Image Enhancement
│   ├── index.html
│   ├── style.css
│   └── app.js
├── 014-old-photo-restoration/   # Old Photo Restoration
│   ├── index.html
│   ├── style.css
│   └── app.js
├── 015-smart-denoise/           # Smart Denoise
│   ├── index.html
│   ├── style.css
│   └── app.js
├── 051-image-classifier/        # AI Image Classifier
│   ├── index.html
│   ├── style.css
│   └── app.js
├── 052-object-detection/        # AI Object Detection
│   ├── index.html
│   ├── style.css
│   └── app.js
└── ...                          # More tools coming
```

## How to Use

1. Navigate to any tool directory
2. Open `index.html` in a modern browser (Chrome 113+ recommended for WebGPU)
3. The tool will load and prompt you to download the AI model on first use
4. All processing happens locally - your data never leaves your device

## Technical Requirements

- **Browser**: Chrome 113+, Edge 113+, Firefox 115+, Safari 16.4+
- **Memory**: 4GB+ RAM recommended
- **Storage**: 2GB+ for model caching
- **GPU**: Optional but recommended for faster processing

## Privacy

All tools in this collection:
- Process data 100% locally in your browser
- Never upload your files to any server
- Cache AI models in IndexedDB for offline use
- Require no account or registration
