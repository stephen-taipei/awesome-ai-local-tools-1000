# AI Local Tools Index

> All tools in this directory run entirely in your browser with zero data upload.

## Completed Tools

| # | Tool Name | Category | Model | Status |
|---|-----------|----------|-------|--------|
| 001 | [AI Background Remover](./001-background-remover/) | Image Processing | RMBG-1.4 | ✅ Complete |

## Directory Structure

```
tools/
├── README.md                    # This file
├── 001-background-remover/      # AI Background Remover
│   ├── index.html               # Main HTML file
│   ├── style.css                # Styles
│   └── app.js                   # Application logic
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
