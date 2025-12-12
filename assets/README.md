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
