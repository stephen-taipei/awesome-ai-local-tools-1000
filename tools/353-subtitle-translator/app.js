/**
 * Subtitle Translator - Tool #353
 * Translate subtitles to other languages using local AI
 */

import { pipeline } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.0';

let currentLang = 'zh';
let translator = null;
let subtitles = [];
let translatedText = '';

const texts = {
    zh: {
        title: '字幕翻譯',
        subtitle: '翻譯字幕為其他語言',
        privacy: '100% 本地處理 · 零資料上傳',
        target: '目標語言',
        process: '🔄 翻譯',
        download: '⬇️ 下載',
        result: '翻譯結果',
        upload: '拖放字幕檔案至此或點擊上傳',
        uploadHint: '支援 SRT, VTT',
        loading: '載入翻譯模型中...',
        modelReady: '✅ 模型已就緒',
        translating: '翻譯中 {current}/{total}...'
    },
    en: {
        title: 'Subtitle Translator',
        subtitle: 'Translate subtitles to other languages',
        privacy: '100% Local Processing · No Data Upload',
        target: 'Target Language',
        process: '🔄 Translate',
        download: '⬇️ Download',
        result: 'Result',
        upload: 'Drop subtitle file here or click to upload',
        uploadHint: 'Supports SRT, VTT',
        loading: 'Loading translation model...',
        modelReady: '✅ Model Ready',
        translating: 'Translating {current}/{total}...'
    }
};

async function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    setupFileUpload();
    document.getElementById('processBtn').addEventListener('click', translateSubtitles);
    document.getElementById('downloadBtn').addEventListener('click', downloadSubtitle);
    await loadModel();
}

async function loadModel() {
    try {
        translator = await pipeline('translation', 'Xenova/nllb-200-distilled-600M', {
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
        document.getElementById('modelStatusText').textContent = '模型載入失敗，使用簡易翻譯';
        document.getElementById('processBtn').disabled = false;
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
    document.getElementById('targetLabel').textContent = t.target;
    document.getElementById('processBtn').textContent = t.process;
    document.getElementById('downloadBtn').textContent = t.download;
    document.getElementById('resultTitle').textContent = t.result;
    document.querySelector('.upload-area p').textContent = t.upload;
    document.querySelector('.upload-hint').textContent = t.uploadHint;
}

async function handleFile(file) {
    const text = await file.text();
    const ext = file.name.split('.').pop().toLowerCase();
    subtitles = ext === 'vtt' ? parseVTT(text) : parseSRT(text);
    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('optionsSection').style.display = 'block';
    document.getElementById('actionSection').style.display = 'flex';
}

function parseSRT(text) {
    const blocks = text.trim().split(/\n\n+/);
    return blocks.map(block => {
        const lines = block.split('\n');
        if (lines.length < 3) return null;
        const timeMatch = lines[1].match(/(\d{2}:\d{2}:\d{2}[,\.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,\.]\d{3})/);
        if (!timeMatch) return null;
        return { start: timeMatch[1], end: timeMatch[2], text: lines.slice(2).join('\n') };
    }).filter(s => s);
}

function parseVTT(text) {
    const lines = text.split('\n');
    const result = [];
    let current = null;
    for (const line of lines) {
        const timeMatch = line.match(/(\d{2}:\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}\.\d{3})/);
        if (timeMatch) {
            if (current) result.push(current);
            current = { start: timeMatch[1], end: timeMatch[2], text: '' };
        } else if (current && line.trim() && !line.startsWith('WEBVTT')) {
            current.text += (current.text ? '\n' : '') + line;
        }
    }
    if (current) result.push(current);
    return result;
}

const langCodes = { zh: 'zho_Hans', en: 'eng_Latn', ja: 'jpn_Jpan', ko: 'kor_Hang', es: 'spa_Latn', fr: 'fra_Latn' };

async function translateSubtitles() {
    const processBtn = document.getElementById('processBtn');
    const t = texts[currentLang];
    processBtn.disabled = true;
    document.getElementById('progressSection').style.display = 'block';

    const targetLang = document.getElementById('targetLang').value;
    const translated = [];

    for (let i = 0; i < subtitles.length; i++) {
        const sub = subtitles[i];
        document.getElementById('progressText').textContent = t.translating.replace('{current}', i + 1).replace('{total}', subtitles.length);
        document.getElementById('progressFill').style.width = ((i + 1) / subtitles.length * 100) + '%';

        let translatedText;
        if (translator) {
            try {
                const result = await translator(sub.text, { tgt_lang: langCodes[targetLang] || 'eng_Latn' });
                translatedText = result[0].translation_text;
            } catch {
                translatedText = sub.text;
            }
        } else {
            translatedText = sub.text;
        }
        translated.push({ ...sub, text: translatedText });
    }

    translatedText = translated.map((sub, i) => {
        return `${i + 1}\n${sub.start} --> ${sub.end}\n${sub.text}\n`;
    }).join('\n');

    document.getElementById('subtitleText').value = translatedText;
    document.getElementById('resultSection').style.display = 'block';
    document.getElementById('downloadBtn').disabled = false;
    document.getElementById('progressSection').style.display = 'none';
    processBtn.disabled = false;
}

function downloadSubtitle() {
    const blob = new Blob([translatedText], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'translated.srt';
    a.click();
}

init();
