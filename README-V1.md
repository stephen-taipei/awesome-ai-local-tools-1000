# Awesome AI Local Tools [![Awesome](https://awesome.re/badge.svg)](https://awesome.re)

> A curated list of AI tools and models that can run locally on your own hardware, ensuring privacy, offline access, and full control over your data.

Running AI locally means your data never leaves your machine. This list focuses on tools that prioritize privacy, work offline, and give you complete control.

## Contents

- [LLM Inference Engines](#llm-inference-engines)
- [Chat Interfaces](#chat-interfaces)
- [Image Generation](#image-generation)
- [Audio & Speech](#audio--speech)
- [Video Generation](#video-generation)
- [Code Assistants](#code-assistants)
- [Document & RAG](#document--rag)
- [Computer Vision](#computer-vision)
- [AI Agents & Automation](#ai-agents--automation)
- [Model Management](#model-management)
- [Development Tools](#development-tools)
- [Hardware Optimization](#hardware-optimization)

---

## LLM Inference Engines

*Tools for running large language models locally.*

- [Ollama](https://github.com/ollama/ollama) - Get up and running with large language models locally. Simple CLI and API.
- [llama.cpp](https://github.com/ggerganov/llama.cpp) - Port of Facebook's LLaMA model in C/C++. Highly optimized for CPU and GPU.
- [LM Studio](https://lmstudio.ai/) - Discover, download, and run local LLMs with a beautiful desktop app.
- [GPT4All](https://gpt4all.io/) - Open-source large language models that run locally on your CPU.
- [Llamafile](https://github.com/Mozilla-Ocho/llamafile) - Distribute and run LLMs with a single file that runs on multiple OS.
- [vLLM](https://github.com/vllm-project/vllm) - High-throughput and memory-efficient inference engine for LLMs.
- [Text Generation WebUI](https://github.com/oobabooga/text-generation-webui) - A Gradio web UI for running Large Language Models.
- [LocalAI](https://github.com/mudler/LocalAI) - OpenAI-compatible API for local inference. Drop-in replacement.
- [KoboldCpp](https://github.com/LostRuins/koboldcpp) - Easy-to-use single-file LLM inference with no setup required.
- [Jan](https://jan.ai/) - Open-source ChatGPT alternative that runs 100% offline.
- [MLC LLM](https://github.com/mlc-ai/mlc-llm) - Universal deployment for large language models with ML compilation.
- [ExLlamaV2](https://github.com/turboderp/exllamav2) - Fast inference library for running LLMs locally with GPTQ quantization.

## Chat Interfaces

*User-friendly chat applications for interacting with local LLMs.*

- [Open WebUI](https://github.com/open-webui/open-webui) - User-friendly WebUI for LLMs. Supports Ollama and OpenAI-compatible APIs.
- [LibreChat](https://github.com/danny-avila/LibreChat) - Enhanced ChatGPT clone with multi-model support and plugins.
- [SillyTavern](https://github.com/SillyTavern/SillyTavern) - LLM frontend for power users with extensive customization.
- [Chatbox](https://github.com/Bin-Huang/chatbox) - Desktop client for ChatGPT/Claude/local models with privacy focus.
- [Big-AGI](https://github.com/enricoros/big-agi) - Personal AI application powered by GPT-4 and beyond.
- [Msty](https://msty.app/) - Beautiful, private AI chat for Mac, Windows, and Linux.
- [AnythingLLM](https://github.com/Mintplex-Labs/anything-llm) - All-in-one Desktop & Docker AI application with built-in RAG.
- [Lobe Chat](https://github.com/lobehub/lobe-chat) - Modern chatbot framework supporting multiple AI providers.

## Image Generation

*Tools for generating and editing images locally.*

- [Stable Diffusion WebUI (AUTOMATIC1111)](https://github.com/AUTOMATIC1111/stable-diffusion-webui) - Feature-rich Gradio interface for Stable Diffusion.
- [ComfyUI](https://github.com/comfyanonymous/ComfyUI) - Node-based workflow UI for Stable Diffusion with advanced features.
- [Fooocus](https://github.com/lllyasviel/Fooocus) - Image generating software in the style of Midjourney, runs locally.
- [InvokeAI](https://github.com/invoke-ai/InvokeAI) - Creative engine for Stable Diffusion models with professional UI.
- [Stable Diffusion.cpp](https://github.com/leejet/stable-diffusion.cpp) - Stable diffusion in pure C/C++.
- [DiffusionBee](https://diffusionbee.com/) - Easiest way to run Stable Diffusion locally on your Mac.
- [Draw Things](https://drawthings.ai/) - AI-assisted image generation for iOS and macOS.
- [NMKD Stable Diffusion GUI](https://github.com/n00mkrad/text2image-gui) - Windows GUI for Stable Diffusion.
- [SD.Next](https://github.com/vladmandic/automatic) - Advanced Stable Diffusion implementation with latest features.
- [Forge WebUI](https://github.com/lllyasviel/stable-diffusion-webui-forge) - Platform for Stable Diffusion with optimized performance.

## Audio & Speech

*Local tools for speech recognition, text-to-speech, and audio processing.*

### Speech-to-Text
- [Whisper](https://github.com/openai/whisper) - OpenAI's robust speech recognition model.
- [Whisper.cpp](https://github.com/ggerganov/whisper.cpp) - Port of OpenAI's Whisper in C/C++ for efficient local inference.
- [Faster Whisper](https://github.com/SYSTRAN/faster-whisper) - Faster Whisper transcription with CTranslate2.
- [WhisperX](https://github.com/m-bain/whisperX) - Fast automatic speech recognition with word-level timestamps.
- [Buzz](https://github.com/chidiwilliams/buzz) - Transcribe and translate audio offline using Whisper.

### Text-to-Speech
- [Coqui TTS](https://github.com/coqui-ai/TTS) - Deep learning toolkit for Text-to-Speech.
- [Piper](https://github.com/rhasspy/piper) - Fast, local neural text-to-speech for Raspberry Pi and beyond.
- [XTTS](https://github.com/coqui-ai/TTS) - Cross-lingual voice cloning and text-to-speech.
- [Bark](https://github.com/suno-ai/bark) - Transformer-based text-to-audio model with realistic speech.
- [OpenVoice](https://github.com/myshell-ai/OpenVoice) - Instant voice cloning by MyShell.
- [StyleTTS2](https://github.com/yl4579/StyleTTS2) - High-quality, natural-sounding text-to-speech.
- [Fish Speech](https://github.com/fishaudio/fish-speech) - Zero-shot & few-shot text-to-speech solution.

### Audio Processing
- [AudioCraft](https://github.com/facebookresearch/audiocraft) - Audio generation library including MusicGen and AudioGen.
- [Demucs](https://github.com/facebookresearch/demucs) - Music source separation using deep learning.
- [RVC](https://github.com/RVC-Project/Retrieval-based-Voice-Conversion-WebUI) - Voice conversion training and inference.

## Video Generation

*Tools for AI-powered video creation and editing locally.*

- [Deforum](https://github.com/deforum-art/deforum-stable-diffusion) - Animation tools for Stable Diffusion.
- [AnimateDiff](https://github.com/guoyww/AnimateDiff) - Animate personalized text-to-image models.
- [Stable Video Diffusion](https://github.com/Stability-AI/generative-models) - Video generation from images.
- [Open-Sora](https://github.com/hpcaitech/Open-Sora) - Open-source Sora-like video generation.
- [CogVideo](https://github.com/THUDM/CogVideo) - Text-to-video generation.
- [MuseV](https://github.com/TMElyralab/MuseV) - Infinite length and high fidelity virtual human video generation.

## Code Assistants

*Local AI tools for coding and development.*

- [Continue](https://github.com/continuedev/continue) - Open-source AI code assistant for VS Code and JetBrains.
- [Tabby](https://github.com/TabbyML/tabby) - Self-hosted AI coding assistant with enterprise features.
- [Aider](https://github.com/paul-gauthier/aider) - AI pair programming in your terminal.
- [Cursor](https://cursor.sh/) - AI-powered code editor (requires local model setup).
- [Cody](https://github.com/sourcegraph/cody) - AI coding assistant that uses your codebase as context.
- [Codeium](https://codeium.com/) - Free AI-powered code completion (has local option).
- [FauxPilot](https://github.com/fauxpilot/fauxpilot) - Open-source GitHub Copilot server.
- [Twinny](https://github.com/rjmacarthy/twinny) - Free AI code completion plugin for VS Code.

## Document & RAG

*Tools for document processing and Retrieval-Augmented Generation.*

- [PrivateGPT](https://github.com/zylon-ai/private-gpt) - Interact with your documents using LLMs, 100% privately.
- [LocalGPT](https://github.com/PromtEngineer/localGPT) - Chat with your documents on local hardware using GPT models.
- [Danswer](https://github.com/danswer-ai/danswer) - Open source enterprise question-answering.
- [Khoj](https://github.com/khoj-ai/khoj) - AI second brain for your digital life.
- [Quivr](https://github.com/QuivrHQ/quivr) - Your GenAI second brain with RAG capabilities.
- [DocsGPT](https://github.com/arc53/DocsGPT) - GPT-powered chat for documentation.
- [Verba](https://github.com/weaviate/Verba) - Retrieval Augmented Generation chatbot.
- [RAGFlow](https://github.com/infiniflow/ragflow) - Deep document understanding RAG engine.
- [Kotaemon](https://github.com/Cinnamon/kotaemon) - Clean & customizable RAG UI for chatting with documents.

## Computer Vision

*Local tools for image and video analysis.*

- [YOLO](https://github.com/ultralytics/ultralytics) - State-of-the-art object detection.
- [Segment Anything (SAM)](https://github.com/facebookresearch/segment-anything) - Foundation model for image segmentation.
- [Grounding DINO](https://github.com/IDEA-Research/GroundingDINO) - Open-set object detection.
- [LLaVA](https://github.com/haotian-liu/LLaVA) - Large Language and Vision Assistant.
- [MiniCPM-V](https://github.com/OpenBMB/MiniCPM-V) - Efficient multimodal large language model.
- [CogVLM](https://github.com/THUDM/CogVLM) - Visual language model for image understanding.
- [Florence-2](https://huggingface.co/microsoft/Florence-2-large) - Foundation vision model by Microsoft.
- [PaddleOCR](https://github.com/PaddlePaddle/PaddleOCR) - Multilingual OCR toolkits.

## AI Agents & Automation

*Tools for building and running AI agents locally.*

- [AutoGPT](https://github.com/Significant-Gravitas/AutoGPT) - Autonomous AI agents with local model support.
- [Open Interpreter](https://github.com/OpenInterpreter/open-interpreter) - Natural language interface for your computer.
- [CrewAI](https://github.com/joaomdmoura/crewAI) - Framework for orchestrating role-playing AI agents.
- [GPT Researcher](https://github.com/assafelovic/gpt-researcher) - Autonomous agent for comprehensive research.
- [MetaGPT](https://github.com/geekan/MetaGPT) - Multi-agent framework for software development.
- [Langroid](https://github.com/langroid/langroid) - Harness LLMs with multi-agent programming.
- [Autogen](https://github.com/microsoft/autogen) - Framework for building multi-agent conversational systems.
- [TaskWeaver](https://github.com/microsoft/TaskWeaver) - Code-first agent framework for complex tasks.
- [Browser Use](https://github.com/browser-use/browser-use) - AI agent that controls your browser.

## Model Management

*Tools for downloading, converting, and managing AI models.*

- [Hugging Face Hub](https://github.com/huggingface/huggingface_hub) - Client library to interact with the Hub.
- [ModelScope](https://github.com/modelscope/modelscope) - Model hub and library for AI models.
- [CivitAI](https://civitai.com/) - Community for Stable Diffusion models and resources.
- [GGUF](https://github.com/ggerganov/ggml) - Binary format for distributing LLMs.
- [AutoGGUF](https://github.com/leafspark/AutoGGUF) - Automatically quantize models to GGUF format.
- [Transformers](https://github.com/huggingface/transformers) - State-of-the-art ML for PyTorch and TensorFlow.

## Development Tools

*Libraries and frameworks for building local AI applications.*

- [LangChain](https://github.com/langchain-ai/langchain) - Build applications with LLMs through composability.
- [LlamaIndex](https://github.com/run-llama/llama_index) - Data framework for LLM applications.
- [Haystack](https://github.com/deepset-ai/haystack) - Framework for building NLP applications.
- [Semantic Kernel](https://github.com/microsoft/semantic-kernel) - Integrate AI into your apps.
- [guidance](https://github.com/guidance-ai/guidance) - Language for controlling language models.
- [Instructor](https://github.com/jxnl/instructor) - Structured outputs from LLMs.
- [Outlines](https://github.com/outlines-dev/outlines) - Structured text generation.
- [LiteLLM](https://github.com/BerriAI/litellm) - Call 100+ LLM APIs using the OpenAI format.

## Hardware Optimization

*Tools for optimizing AI inference on specific hardware.*

- [llama.cpp CUDA](https://github.com/ggerganov/llama.cpp) - NVIDIA GPU acceleration.
- [llama.cpp Metal](https://github.com/ggerganov/llama.cpp) - Apple Silicon optimization.
- [llama.cpp ROCm](https://github.com/ggerganov/llama.cpp) - AMD GPU support.
- [llama.cpp SYCL](https://github.com/ggerganov/llama.cpp) - Intel GPU acceleration.
- [ONNX Runtime](https://github.com/microsoft/onnxruntime) - Cross-platform inference accelerator.
- [TensorRT-LLM](https://github.com/NVIDIA/TensorRT-LLM) - NVIDIA's library for LLM inference.
- [OpenVINO](https://github.com/openvinotoolkit/openvino) - Intel's toolkit for AI inference.
- [DirectML](https://github.com/microsoft/DirectML) - Hardware-accelerated machine learning on Windows.

---

## Contributing

Contributions welcome! Read the [contribution guidelines](CONTRIBUTING.md) first.

## License

[![CC0](https://mirrors.creativecommons.org/presskit/buttons/88x31/svg/cc-zero.svg)](https://creativecommons.org/publicdomain/zero/1.0/)

To the extent possible under law, the contributors have waived all copyright and related rights to this work.
