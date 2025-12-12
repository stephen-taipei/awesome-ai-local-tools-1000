# Local Assets Instructions

To deploy this project to an offline server, you must ensure the following binary files are downloaded and placed in the correct directories. These files were too large or restricted to be committed directly via the development interface.

## JS Libraries (WASM)

Location: `assets/js/`

Download the following files from `https://cdn.jsdelivr.net/npm/onnxruntime-web@1.18.0/dist/`:

1.  `ort-wasm.wasm`
2.  `ort-wasm-simd.wasm`
3.  `ort-wasm-threaded.wasm`
4.  `ort-wasm-simd-threaded.wasm`

Commands:
```bash
cd assets/js/
wget https://cdn.jsdelivr.net/npm/onnxruntime-web@1.18.0/dist/ort-wasm.wasm
wget https://cdn.jsdelivr.net/npm/onnxruntime-web@1.18.0/dist/ort-wasm-simd.wasm
wget https://cdn.jsdelivr.net/npm/onnxruntime-web@1.18.0/dist/ort-wasm-threaded.wasm
wget https://cdn.jsdelivr.net/npm/onnxruntime-web@1.18.0/dist/ort-wasm-simd-threaded.wasm
```

## AI Models

### briaai/RMBG-1.4 (Background Removal)

Location: `assets/models/briaai/RMBG-1.4/`

Download `model.onnx` (~176MB):
```bash
cd assets/models/briaai/RMBG-1.4/
wget https://huggingface.co/briaai/RMBG-1.4/resolve/main/model.onnx
```

(Note: `config.json` and `preprocessor_config.json` should already be present).

### Xenova/clip-vit-base-patch32 (Image Similarity)

Location: `assets/models/Xenova/clip-vit-base-patch32/`

Download `vision_model.onnx` (~350MB) and `text_model.onnx` (~150MB):
```bash
cd assets/models/Xenova/clip-vit-base-patch32/
wget https://huggingface.co/Xenova/clip-vit-base-patch32/resolve/main/vision_model.onnx
wget https://huggingface.co/Xenova/clip-vit-base-patch32/resolve/main/text_model.onnx
wget https://huggingface.co/Xenova/clip-vit-base-patch32/resolve/main/logit_scale.npy
```

### Xenova/depth-anything-small-hf (Depth Estimation)

Location: `assets/models/Xenova/depth-anything-small-hf/`

Download `model.onnx` (~100MB):
```bash
cd assets/models/Xenova/depth-anything-small-hf/
wget https://huggingface.co/Xenova/depth-anything-small-hf/resolve/main/model.onnx
```

### Xenova/vit-gpt2-image-captioning (Image Captioning)

Location: `assets/models/Xenova/vit-gpt2-image-captioning/`

Download models (~900MB total):
```bash
cd assets/models/Xenova/vit-gpt2-image-captioning/
wget https://huggingface.co/Xenova/vit-gpt2-image-captioning/resolve/main/encoder_model.onnx
wget https://huggingface.co/Xenova/vit-gpt2-image-captioning/resolve/main/decoder_model.onnx
wget https://huggingface.co/Xenova/vit-gpt2-image-captioning/resolve/main/decoder_with_past_model.onnx
```

## Face API Models

Location: `assets/models/face-api/`

The models should have been downloaded by the script. If missing, download from:
`https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/`
- tiny_face_detector_model-weights_manifest.json (and shards)
- age_gender_model-weights_manifest.json (and shards)
- face_expression_model-weights_manifest.json (and shards)
