/**
 * Subtitle Translator - Tool #128
 * Translate SRT/VTT subtitle files
 */

let currentLang = 'zh-TW';
let subtitles = [];
let translatedSubtitles = [];
let originalFormat = 'srt';

const i18n = {
    'zh-TW': {
        title: '字幕翻譯器',
        subtitle: '翻譯 SRT/VTT 字幕檔案',
        dropHere: '拖放字幕檔案到這裡',
        orClick: '或點擊選擇檔案',
        supported: '支援 SRT, VTT 格式',
        original: '原始字幕',
        translated: '翻譯結果',
        translate: '翻譯字幕',
        download: '下載翻譯字幕',
        keepOriginal: '保留原文（雙語字幕）',
        lines: '行'
    },
    'en': {
        title: 'Subtitle Translator',
        subtitle: 'Translate SRT/VTT files',
        dropHere: 'Drop subtitle file here',
        orClick: 'or click to select',
        supported: 'Supports SRT, VTT formats',
        original: 'Original',
        translated: 'Translated',
        translate: 'Translate',
        download: 'Download Translated',
        keepOriginal: 'Keep original (bilingual)',
        lines: 'lines'
    }
};

// Translation dictionary
const translations = {
    zh: {
        en: {
            '你好': 'Hello', '謝謝': 'Thank you', '再見': 'Goodbye',
            '是': 'Yes', '不是': 'No', '對': 'Right', '好': 'Okay'
        }
    },
    en: {
        zh: {
            'hello': '你好', 'thank you': '謝謝', 'goodbye': '再見',
            'yes': '是', 'no': '不是', 'right': '對', 'okay': '好'
        }
    }
};

function t(key) {
    return i18n[currentLang][key] || key;
}

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`lang-${lang === 'zh-TW' ? 'zh' : 'en'}`).classList.add('active');
}

function parseSRT(content) {
    const blocks = content.trim().split(/\n\n+/);
    return blocks.map(block => {
        const lines = block.split('\n');
        if (lines.length < 3) return null;

        const index = parseInt(lines[0]);
        const timeMatch = lines[1].match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/);
        if (!timeMatch) return null;

        return {
            index,
            startTime: timeMatch[1],
            endTime: timeMatch[2],
            text: lines.slice(2).join('\n')
        };
    }).filter(Boolean);
}

function parseVTT(content) {
    const lines = content.split('\n');
    const subtitles = [];
    let currentSub = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line.includes('-->')) {
            const timeMatch = line.match(/(\d{2}:\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}\.\d{3})/);
            if (timeMatch) {
                currentSub = {
                    index: subtitles.length + 1,
                    startTime: timeMatch[1],
                    endTime: timeMatch[2],
                    text: ''
                };
            }
        } else if (currentSub && line) {
            currentSub.text += (currentSub.text ? '\n' : '') + line;
        } else if (currentSub && !line) {
            subtitles.push(currentSub);
            currentSub = null;
        }
    }

    if (currentSub) subtitles.push(currentSub);
    return subtitles;
}

function translateText(text, sourceLang, targetLang) {
    if (sourceLang === 'auto') {
        sourceLang = /[\u4e00-\u9fff]/.test(text) ? 'zh' : 'en';
    }

    if (sourceLang === targetLang) return text;

    const dict = translations[sourceLang]?.[targetLang] || {};
    let result = text;

    Object.entries(dict).forEach(([source, target]) => {
        const regex = new RegExp(source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        result = result.replace(regex, target);
    });

    return result;
}

function renderPreview(container, subs) {
    container.innerHTML = subs.map(sub => `
        <div class="subtitle-item">
            <div class="subtitle-time">${sub.startTime} → ${sub.endTime}</div>
            <div class="subtitle-text">${sub.text}</div>
        </div>
    `).join('');
}

function generateSRT(subs, keepOriginal) {
    return subs.map((sub, i) => {
        let text = sub.translatedText || sub.text;
        if (keepOriginal && sub.translatedText) {
            text = `${subtitles[i].text}\n${sub.translatedText}`;
        }
        return `${sub.index}\n${sub.startTime} --> ${sub.endTime}\n${text}`;
    }).join('\n\n');
}

function generateVTT(subs, keepOriginal) {
    let output = 'WEBVTT\n\n';
    output += subs.map((sub, i) => {
        let text = sub.translatedText || sub.text;
        if (keepOriginal && sub.translatedText) {
            text = `${subtitles[i].text}\n${sub.translatedText}`;
        }
        return `${sub.startTime} --> ${sub.endTime}\n${text}`;
    }).join('\n\n');
    return output;
}

function init() {
    setLanguage(navigator.language.startsWith('zh') ? 'zh-TW' : 'en');

    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    uploadArea.addEventListener('click', () => fileInput.click());

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', async (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) await handleFile(file);
    });

    fileInput.addEventListener('change', async () => {
        if (fileInput.files[0]) {
            await handleFile(fileInput.files[0]);
        }
    });

    document.getElementById('translateBtn').addEventListener('click', () => {
        const sourceLang = document.getElementById('sourceLang').value;
        const targetLang = document.getElementById('targetLang').value;

        translatedSubtitles = subtitles.map(sub => ({
            ...sub,
            translatedText: translateText(sub.text, sourceLang, targetLang)
        }));

        renderPreview(
            document.getElementById('translatedPreview'),
            translatedSubtitles.map(s => ({ ...s, text: s.translatedText }))
        );

        document.getElementById('downloadBtn').disabled = false;
    });

    document.getElementById('downloadBtn').addEventListener('click', () => {
        const keepOriginal = document.getElementById('keepOriginal').checked;
        const content = originalFormat === 'vtt'
            ? generateVTT(translatedSubtitles, keepOriginal)
            : generateSRT(translatedSubtitles, keepOriginal);

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `translated.${originalFormat}`;
        a.click();
        URL.revokeObjectURL(url);
    });
}

async function handleFile(file) {
    const content = await file.text();
    originalFormat = file.name.endsWith('.vtt') ? 'vtt' : 'srt';

    subtitles = originalFormat === 'vtt' ? parseVTT(content) : parseSRT(content);

    document.getElementById('fileName').textContent = file.name;
    document.getElementById('subtitleCount').textContent = `${subtitles.length} ${t('lines')}`;

    renderPreview(document.getElementById('originalPreview'), subtitles);
    document.getElementById('translatedPreview').innerHTML = '';
    document.getElementById('downloadBtn').disabled = true;

    document.querySelector('.upload-section').style.display = 'none';
    document.getElementById('previewSection').style.display = 'block';
}

init();
