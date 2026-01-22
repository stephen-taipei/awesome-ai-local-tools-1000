/**
 * Subtitle Style - Tool #357
 * Customize subtitle font, color, and position
 */

let currentLang = 'zh';
let subtitles = [];

const texts = {
    zh: {
        title: '字幕樣式設計',
        subtitle: '自訂字幕字型、顏色、位置',
        privacy: '100% 本地處理 · 零資料上傳',
        download: '⬇️ 下載 ASS',
        upload: '拖放字幕檔案至此或點擊上傳',
        uploadHint: '支援 SRT, ASS'
    },
    en: {
        title: 'Subtitle Style',
        subtitle: 'Customize subtitle font, color, and position',
        privacy: '100% Local Processing · No Data Upload',
        download: '⬇️ Download ASS',
        upload: 'Drop subtitle file here or click to upload',
        uploadHint: 'Supports SRT, ASS'
    }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    setupFileUpload();
    setupStyleControls();
    document.getElementById('downloadBtn').addEventListener('click', downloadASS);
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

function setupStyleControls() {
    const controls = ['fontFamily', 'fontSize', 'fontColor', 'outlineColor', 'outlineWidth', 'bold'];
    controls.forEach(id => {
        document.getElementById(id).addEventListener('input', updatePreview);
        document.getElementById(id).addEventListener('change', updatePreview);
    });
    document.getElementById('fontSize').addEventListener('input', (e) => {
        document.getElementById('fontSizeValue').textContent = e.target.value + 'px';
    });
    document.getElementById('outlineWidth').addEventListener('input', (e) => {
        document.getElementById('outlineValue').textContent = e.target.value + 'px';
    });
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');
    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.getElementById('downloadBtn').textContent = t.download;
    document.querySelector('.upload-area p').textContent = t.upload;
    document.querySelector('.upload-hint').textContent = t.uploadHint;
}

async function handleFile(file) {
    const text = await file.text();
    subtitles = parseSRT(text);
    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('styleOptions').style.display = 'block';
    document.getElementById('actionSection').style.display = 'flex';
    updatePreview();
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

function updatePreview() {
    const previewText = document.getElementById('previewText');
    const fontFamily = document.getElementById('fontFamily').value;
    const fontSize = document.getElementById('fontSize').value;
    const fontColor = document.getElementById('fontColor').value;
    const outlineColor = document.getElementById('outlineColor').value;
    const outlineWidth = document.getElementById('outlineWidth').value;
    const bold = document.getElementById('bold').checked;

    previewText.style.fontFamily = fontFamily;
    previewText.style.fontSize = fontSize + 'px';
    previewText.style.color = fontColor;
    previewText.style.textShadow = `${outlineWidth}px ${outlineWidth}px 0 ${outlineColor}, -${outlineWidth}px -${outlineWidth}px 0 ${outlineColor}, ${outlineWidth}px -${outlineWidth}px 0 ${outlineColor}, -${outlineWidth}px ${outlineWidth}px 0 ${outlineColor}`;
    previewText.style.fontWeight = bold ? 'bold' : 'normal';
}

function colorToASS(hex) {
    const r = hex.slice(1, 3);
    const g = hex.slice(3, 5);
    const b = hex.slice(5, 7);
    return '&H00' + b + g + r;
}

function timeToASS(time) {
    const parts = time.split(/[:\.]/);
    return `${parts[0]}:${parts[1]}:${parts[2]}.${parts[3].substring(0, 2)}`;
}

function downloadASS() {
    const fontFamily = document.getElementById('fontFamily').value;
    const fontSize = document.getElementById('fontSize').value;
    const fontColor = colorToASS(document.getElementById('fontColor').value);
    const outlineColor = colorToASS(document.getElementById('outlineColor').value);
    const outlineWidth = document.getElementById('outlineWidth').value;
    const bold = document.getElementById('bold').checked ? '-1' : '0';

    let ass = `[Script Info]
Title: Styled Subtitle
ScriptType: v4.00+
Collisions: Normal
PlayDepth: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${fontFamily},${fontSize},${fontColor},${fontColor},${outlineColor},&H00000000,${bold},0,0,0,100,100,0,0,1,${outlineWidth},0,2,10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n`;

    subtitles.forEach(sub => {
        const start = timeToASS(sub.start);
        const end = timeToASS(sub.end);
        ass += `Dialogue: 0,${start},${end},Default,,0,0,0,,${sub.text.replace(/\n/g, '\\N')}\n`;
    });

    const blob = new Blob([ass], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'styled_subtitle.ass';
    a.click();
}

init();
