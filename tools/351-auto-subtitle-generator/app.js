/**
 * Auto Subtitle Generator - Tool #351
 * AI-powered automatic subtitle generation using Whisper
 */

import { pipeline } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.0';

let currentLang = 'zh';
let transcriber = null;
let mediaFile = null;
let subtitleText = '';

const texts = {
    zh: {
        title: '自動字幕生成',
        subtitle: 'AI 自動為影片生成字幕',
        privacy: '100% 本地處理 · 零資料上傳',
        language: '語言',
        langAuto: '自動偵測',
        format: '輸出格式',
        process: '🔄 生成字幕',
        download: '⬇️ 下載',
        result: '生成結果',
        upload: '拖放影片或音頻檔案至此或點擊上傳',
        uploadHint: '支援 MP4, WebM, MP3, WAV',
        loading: '載入 Whisper 模型中...',
        modelReady: '✅ 模型已就緒',
        modelError: '❌ 模型載入失敗',
        processing: '處理中...',
        transcribing: '轉錄中...'
    },
    en: {
        title: 'Auto Subtitle Generator',
        subtitle: 'AI-powered automatic subtitle generation',
        privacy: '100% Local Processing · No Data Upload',
        language: 'Language',
        langAuto: 'Auto Detect',
        format: 'Output Format',
        process: '🔄 Generate Subtitles',
        download: '⬇️ Download',
        result: 'Result',
        upload: 'Drop video or audio file here or click to upload',
        uploadHint: 'Supports MP4, WebM, MP3, WAV',
        loading: 'Loading Whisper model...',
        modelReady: '✅ Model Ready',
        modelError: '❌ Model Load Failed',
        processing: 'Processing...',
        transcribing: 'Transcribing...'
    }
};

async function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    setupFileUpload();
    document.getElementById('processBtn').addEventListener('click', processMedia);
    document.getElementById('downloadBtn').addEventListener('click', downloadSubtitle);
    await loadModel();
}

async function loadModel() {
    try {
        transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny', {
            progress_callback: (progress) => {
                if (progress.status === 'downloading') {
                    document.getElementById('modelStatusText').textContent =
                        `下載模型中... ${Math.round(progress.progress || 0)}%`;
                }
            }
        });
        document.getElementById('modelStatus').classList.add('ready');
        document.getElementById('modelStatusText').textContent = texts[currentLang].modelReady;
        document.getElementById('processBtn').disabled = false;
    } catch (error) {
        console.error('Model load error:', error);
        document.getElementById('modelStatus').classList.add('error');
        document.getElementById('modelStatusText').textContent = texts[currentLang].modelError;
    }
}

function setupFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('drag-over'); });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));
    uploadArea.addEventListener('drop', (e) => { e.preventDefault(); uploadArea.classList.remove('drag-over'); if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]); });
    fileInput.addEventListener('change', (e) => { if (e.target.files.length) handleFile(e.target.files[0]); });
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');
    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.getElementById('langLabel').textContent = t.language;
    document.getElementById('language').options[0].text = t.langAuto;
    document.getElementById('formatLabel').textContent = t.format;
    document.getElementById('processBtn').textContent = t.process;
    document.getElementById('downloadBtn').textContent = t.download;
    document.getElementById('resultTitle').textContent = t.result;
    document.querySelector('.upload-area p').textContent = t.upload;
    document.querySelector('.upload-hint').textContent = t.uploadHint;
}

function handleFile(file) {
    mediaFile = file;
    const isVideo = file.type.startsWith('video/');

    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('mediaLoaded').style.display = 'block';
    document.getElementById('fileInfo').textContent = `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;

    if (isVideo) {
        document.getElementById('previewVideo').style.display = 'block';
        document.getElementById('previewVideo').src = URL.createObjectURL(file);
        document.getElementById('previewAudio').style.display = 'none';
    } else {
        document.getElementById('previewAudio').style.display = 'block';
        document.getElementById('previewAudio').src = URL.createObjectURL(file);
        document.getElementById('previewVideo').style.display = 'none';
    }

    document.getElementById('optionsSection').style.display = 'block';
    document.getElementById('actionSection').style.display = 'flex';
}

async function processMedia() {
    if (!mediaFile || !transcriber) return;

    const processBtn = document.getElementById('processBtn');
    const t = texts[currentLang];
    processBtn.textContent = t.processing;
    processBtn.disabled = true;
    document.getElementById('progressSection').style.display = 'block';
    document.getElementById('progressText').textContent = t.transcribing;

    try {
        // Extract audio from media file
        const audioContext = new AudioContext({ sampleRate: 16000 });
        const arrayBuffer = await mediaFile.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // Convert to mono
        const audioData = audioBuffer.getChannelData(0);

        document.getElementById('progressFill').style.width = '30%';

        const language = document.getElementById('language').value;
        const options = {
            chunk_length_s: 30,
            stride_length_s: 5,
            return_timestamps: true
        };

        if (language !== 'auto') {
            options.language = language;
        }

        const result = await transcriber(audioData, options);

        document.getElementById('progressFill').style.width = '90%';

        // Generate subtitle file
        const format = document.getElementById('outputFormat').value;
        subtitleText = format === 'srt'
            ? generateSRT(result.chunks || [{ text: result.text, timestamp: [0, audioBuffer.duration] }])
            : generateVTT(result.chunks || [{ text: result.text, timestamp: [0, audioBuffer.duration] }]);

        document.getElementById('subtitleText').value = subtitleText;
        document.getElementById('resultSection').style.display = 'block';
        document.getElementById('downloadBtn').disabled = false;
        document.getElementById('progressFill').style.width = '100%';
    } catch (error) {
        console.error('Error:', error);
        alert('Transcription failed: ' + error.message);
    }

    document.getElementById('progressSection').style.display = 'none';
    processBtn.textContent = t.process;
    processBtn.disabled = false;
}

function generateSRT(chunks) {
    return chunks.map((chunk, i) => {
        const start = formatTime(chunk.timestamp[0], 'srt');
        const end = formatTime(chunk.timestamp[1], 'srt');
        return `${i + 1}\n${start} --> ${end}\n${chunk.text.trim()}\n`;
    }).join('\n');
}

function generateVTT(chunks) {
    let vtt = 'WEBVTT\n\n';
    vtt += chunks.map((chunk, i) => {
        const start = formatTime(chunk.timestamp[0], 'vtt');
        const end = formatTime(chunk.timestamp[1], 'vtt');
        return `${start} --> ${end}\n${chunk.text.trim()}\n`;
    }).join('\n');
    return vtt;
}

function formatTime(seconds, format) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    const sep = format === 'srt' ? ',' : '.';
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}${sep}${String(ms).padStart(3, '0')}`;
}

function downloadSubtitle() {
    if (!subtitleText) return;
    const format = document.getElementById('outputFormat').value;
    const blob = new Blob([subtitleText], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `subtitle.${format}`;
    a.click();
}

init();
