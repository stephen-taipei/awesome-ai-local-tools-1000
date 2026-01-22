/**
 * Subtitle Format Converter - Tool #354
 * Convert between subtitle formats
 */

let currentLang = 'zh';
let subtitles = [];
let resultText = '';

const texts = {
    zh: {
        title: '字幕格式轉換',
        subtitle: '在各種字幕格式間轉換',
        privacy: '100% 本地處理 · 零資料上傳',
        format: '輸出格式',
        process: '🔄 轉換',
        download: '⬇️ 下載',
        result: '轉換結果',
        upload: '拖放字幕檔案至此或點擊上傳',
        uploadHint: '支援 SRT, VTT, ASS, SUB'
    },
    en: {
        title: 'Subtitle Format Converter',
        subtitle: 'Convert between subtitle formats',
        privacy: '100% Local Processing · No Data Upload',
        format: 'Output Format',
        process: '🔄 Convert',
        download: '⬇️ Download',
        result: 'Result',
        upload: 'Drop subtitle file here or click to upload',
        uploadHint: 'Supports SRT, VTT, ASS, SUB'
    }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    setupFileUpload();
    document.getElementById('processBtn').addEventListener('click', convertSubtitle);
    document.getElementById('downloadBtn').addEventListener('click', downloadResult);
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
    document.getElementById('formatLabel').textContent = t.format;
    document.getElementById('processBtn').textContent = t.process;
    document.getElementById('downloadBtn').textContent = t.download;
    document.getElementById('resultTitle').textContent = t.result;
    document.querySelector('.upload-area p').textContent = t.upload;
    document.querySelector('.upload-hint').textContent = t.uploadHint;
}

async function handleFile(file) {
    const text = await file.text();
    const ext = file.name.split('.').pop().toLowerCase();

    if (ext === 'srt') subtitles = parseSRT(text);
    else if (ext === 'vtt') subtitles = parseVTT(text);
    else if (ext === 'ass' || ext === 'ssa') subtitles = parseASS(text);
    else subtitles = parseSRT(text);

    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('fileLoaded').style.display = 'block';
    document.getElementById('fileInfo').textContent = `${file.name} - ${subtitles.length} 條字幕`;
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
        return { start: timeMatch[1].replace(',', '.'), end: timeMatch[2].replace(',', '.'), text: lines.slice(2).join('\n') };
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

function parseASS(text) {
    const lines = text.split('\n');
    const result = [];
    for (const line of lines) {
        if (line.startsWith('Dialogue:')) {
            const parts = line.substring(9).split(',');
            if (parts.length >= 10) {
                const start = parts[1].trim();
                const end = parts[2].trim();
                const textPart = parts.slice(9).join(',').replace(/\{[^}]*\}/g, '');
                result.push({ start: assTimeToStandard(start), end: assTimeToStandard(end), text: textPart });
            }
        }
    }
    return result;
}

function assTimeToStandard(time) {
    const parts = time.split(':');
    if (parts.length === 3) {
        const h = parts[0].padStart(2, '0');
        const m = parts[1].padStart(2, '0');
        const s = parseFloat(parts[2]).toFixed(3).padStart(6, '0');
        return `${h}:${m}:${s}`;
    }
    return time;
}

function convertSubtitle() {
    const format = document.getElementById('outputFormat').value;

    if (format === 'srt') {
        resultText = subtitles.map((sub, i) => `${i + 1}\n${sub.start.replace('.', ',')} --> ${sub.end.replace('.', ',')}\n${sub.text}\n`).join('\n');
    } else if (format === 'vtt') {
        resultText = 'WEBVTT\n\n' + subtitles.map(sub => `${sub.start} --> ${sub.end}\n${sub.text}\n`).join('\n');
    } else if (format === 'ass') {
        resultText = generateASS(subtitles);
    } else {
        resultText = subtitles.map(sub => sub.text).join('\n\n');
    }

    document.getElementById('resultText').value = resultText;
    document.getElementById('resultSection').style.display = 'block';
    document.getElementById('downloadBtn').disabled = false;
}

function generateASS(subs) {
    let ass = `[Script Info]
Title: Converted Subtitle
ScriptType: v4.00+
Collisions: Normal
PlayDepth: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,20,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,2,2,10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n`;

    subs.forEach(sub => {
        const start = standardTimeToASS(sub.start);
        const end = standardTimeToASS(sub.end);
        ass += `Dialogue: 0,${start},${end},Default,,0,0,0,,${sub.text.replace(/\n/g, '\\N')}\n`;
    });
    return ass;
}

function standardTimeToASS(time) {
    return time.replace(/^0/, '').replace('.', '.');
}

function downloadResult() {
    const format = document.getElementById('outputFormat').value;
    const ext = format === 'txt' ? 'txt' : format;
    const blob = new Blob([resultText], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `subtitle.${ext}`;
    a.click();
}

init();
