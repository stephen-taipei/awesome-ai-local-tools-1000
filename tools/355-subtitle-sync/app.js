/**
 * Subtitle Sync - Tool #355
 * Adjust subtitle timing offset
 */

let currentLang = 'zh';
let subtitles = [];
let resultText = '';
let inputFormat = 'srt';

const texts = {
    zh: {
        title: '字幕時間軸調整',
        subtitle: '調整字幕時間偏移',
        privacy: '100% 本地處理 · 零資料上傳',
        shift: '時間偏移 (秒)',
        scale: '速度比例',
        process: '🔄 調整',
        download: '⬇️ 下載',
        result: '調整結果',
        upload: '拖放字幕檔案至此或點擊上傳',
        uploadHint: '支援 SRT, VTT'
    },
    en: {
        title: 'Subtitle Sync',
        subtitle: 'Adjust subtitle timing offset',
        privacy: '100% Local Processing · No Data Upload',
        shift: 'Time Shift (sec)',
        scale: 'Speed Scale',
        process: '🔄 Adjust',
        download: '⬇️ Download',
        result: 'Result',
        upload: 'Drop subtitle file here or click to upload',
        uploadHint: 'Supports SRT, VTT'
    }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    setupFileUpload();
    document.getElementById('processBtn').addEventListener('click', adjustSubtitles);
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
    document.getElementById('shiftLabel').textContent = t.shift;
    document.getElementById('scaleLabel').textContent = t.scale;
    document.getElementById('processBtn').textContent = t.process;
    document.getElementById('downloadBtn').textContent = t.download;
    document.getElementById('resultTitle').textContent = t.result;
    document.querySelector('.upload-area p').textContent = t.upload;
    document.querySelector('.upload-hint').textContent = t.uploadHint;
}

window.setShift = function(value) {
    const current = parseFloat(document.getElementById('shiftValue').value) || 0;
    document.getElementById('shiftValue').value = current + value;
};

async function handleFile(file) {
    const text = await file.text();
    inputFormat = file.name.endsWith('.vtt') ? 'vtt' : 'srt';
    subtitles = inputFormat === 'vtt' ? parseVTT(text) : parseSRT(text);

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
        return { start: timeToMs(timeMatch[1]), end: timeToMs(timeMatch[2]), text: lines.slice(2).join('\n') };
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
            current = { start: timeToMs(timeMatch[1]), end: timeToMs(timeMatch[2]), text: '' };
        } else if (current && line.trim() && !line.startsWith('WEBVTT')) {
            current.text += (current.text ? '\n' : '') + line;
        }
    }
    if (current) result.push(current);
    return result;
}

function timeToMs(time) {
    const parts = time.replace(',', '.').split(/[:\.]/);
    return parseInt(parts[0]) * 3600000 + parseInt(parts[1]) * 60000 + parseInt(parts[2]) * 1000 + parseInt(parts[3]);
}

function msToTime(ms, format) {
    ms = Math.max(0, ms);
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const millis = ms % 1000;
    const sep = format === 'srt' ? ',' : '.';
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}${sep}${String(millis).padStart(3, '0')}`;
}

function adjustSubtitles() {
    const shift = parseFloat(document.getElementById('shiftValue').value) * 1000 || 0;
    const scale = parseFloat(document.getElementById('scaleValue').value) || 1;

    const adjusted = subtitles.map(sub => ({
        start: sub.start * scale + shift,
        end: sub.end * scale + shift,
        text: sub.text
    }));

    if (inputFormat === 'srt') {
        resultText = adjusted.map((sub, i) => `${i + 1}\n${msToTime(sub.start, 'srt')} --> ${msToTime(sub.end, 'srt')}\n${sub.text}\n`).join('\n');
    } else {
        resultText = 'WEBVTT\n\n' + adjusted.map(sub => `${msToTime(sub.start, 'vtt')} --> ${msToTime(sub.end, 'vtt')}\n${sub.text}\n`).join('\n');
    }

    document.getElementById('resultText').value = resultText;
    document.getElementById('resultSection').style.display = 'block';
    document.getElementById('downloadBtn').disabled = false;
}

function downloadResult() {
    const blob = new Blob([resultText], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `synced.${inputFormat}`;
    a.click();
}

init();
