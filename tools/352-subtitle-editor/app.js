/**
 * Subtitle Editor - Tool #352
 * Edit subtitle content and timeline
 */

let currentLang = 'zh';
let subtitles = [];

const texts = {
    zh: {
        title: '字幕編輯器',
        subtitle: '編輯字幕內容與時間軸',
        privacy: '100% 本地處理 · 零資料上傳',
        add: '➕ 新增',
        shift: '⏱️ 時間偏移',
        sort: '🔢 排序',
        download: '⬇️ 下載',
        upload: '拖放字幕檔案至此或點擊上傳',
        uploadHint: '支援 SRT, VTT, ASS',
        start: '開始',
        end: '結束',
        delete: '🗑️'
    },
    en: {
        title: 'Subtitle Editor',
        subtitle: 'Edit subtitle content and timeline',
        privacy: '100% Local Processing · No Data Upload',
        add: '➕ Add',
        shift: '⏱️ Time Shift',
        sort: '🔢 Sort',
        download: '⬇️ Download',
        upload: 'Drop subtitle file here or click to upload',
        uploadHint: 'Supports SRT, VTT, ASS',
        start: 'Start',
        end: 'End',
        delete: '🗑️'
    }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    setupFileUpload();
    document.getElementById('addBtn').addEventListener('click', addSubtitle);
    document.getElementById('shiftBtn').addEventListener('click', shiftTime);
    document.getElementById('sortBtn').addEventListener('click', sortSubtitles);
    document.getElementById('downloadBtn').addEventListener('click', downloadSubtitle);
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
    document.getElementById('addBtn').textContent = t.add;
    document.getElementById('shiftBtn').textContent = t.shift;
    document.getElementById('sortBtn').textContent = t.sort;
    document.getElementById('downloadBtn').textContent = t.download;
    document.querySelector('.upload-area p').textContent = t.upload;
    document.querySelector('.upload-hint').textContent = t.uploadHint;
    renderSubtitles();
}

async function handleFile(file) {
    const text = await file.text();
    const ext = file.name.split('.').pop().toLowerCase();

    if (ext === 'srt') {
        subtitles = parseSRT(text);
    } else if (ext === 'vtt') {
        subtitles = parseVTT(text);
    } else {
        subtitles = parseSRT(text);
    }

    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('editorLoaded').style.display = 'block';
    document.getElementById('actionSection').style.display = 'flex';
    renderSubtitles();
}

function parseSRT(text) {
    const blocks = text.trim().split(/\n\n+/);
    return blocks.map(block => {
        const lines = block.split('\n');
        if (lines.length < 3) return null;
        const timeMatch = lines[1].match(/(\d{2}:\d{2}:\d{2}[,\.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,\.]\d{3})/);
        if (!timeMatch) return null;
        return {
            start: timeMatch[1].replace(',', '.'),
            end: timeMatch[2].replace(',', '.'),
            text: lines.slice(2).join('\n')
        };
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

function renderSubtitles() {
    const list = document.getElementById('subtitleList');
    list.innerHTML = '';

    subtitles.forEach((sub, index) => {
        const item = document.createElement('div');
        item.className = 'subtitle-item';
        item.innerHTML = `
            <div class="time-row">
                <input type="text" value="${sub.start}" onchange="updateSubtitle(${index}, 'start', this.value)">
                <span>→</span>
                <input type="text" value="${sub.end}" onchange="updateSubtitle(${index}, 'end', this.value)">
                <button class="delete-btn" onclick="deleteSubtitle(${index})">${texts[currentLang].delete}</button>
            </div>
            <textarea onchange="updateSubtitle(${index}, 'text', this.value)">${sub.text}</textarea>
        `;
        list.appendChild(item);
    });
}

window.updateSubtitle = function(index, field, value) {
    subtitles[index][field] = value;
};

window.deleteSubtitle = function(index) {
    subtitles.splice(index, 1);
    renderSubtitles();
};

function addSubtitle() {
    const lastSub = subtitles[subtitles.length - 1];
    const newStart = lastSub ? addSeconds(lastSub.end, 1) : '00:00:00.000';
    const newEnd = addSeconds(newStart, 3);
    subtitles.push({ start: newStart, end: newEnd, text: '' });
    renderSubtitles();
}

function addSeconds(time, seconds) {
    const parts = time.split(/[:\.]/);
    let totalMs = parseInt(parts[0]) * 3600000 + parseInt(parts[1]) * 60000 + parseInt(parts[2]) * 1000 + parseInt(parts[3]);
    totalMs += seconds * 1000;
    const h = Math.floor(totalMs / 3600000);
    const m = Math.floor((totalMs % 3600000) / 60000);
    const s = Math.floor((totalMs % 60000) / 1000);
    const ms = totalMs % 1000;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
}

function shiftTime() {
    const shift = parseFloat(prompt('Enter time shift in seconds (negative to shift earlier):'));
    if (isNaN(shift)) return;
    subtitles = subtitles.map(sub => ({
        ...sub,
        start: addSeconds(sub.start, shift),
        end: addSeconds(sub.end, shift)
    }));
    renderSubtitles();
}

function sortSubtitles() {
    subtitles.sort((a, b) => a.start.localeCompare(b.start));
    renderSubtitles();
}

function downloadSubtitle() {
    const format = document.getElementById('outputFormat').value;
    let content;

    if (format === 'srt') {
        content = subtitles.map((sub, i) => {
            return `${i + 1}\n${sub.start.replace('.', ',')} --> ${sub.end.replace('.', ',')}\n${sub.text}\n`;
        }).join('\n');
    } else {
        content = 'WEBVTT\n\n' + subtitles.map(sub => {
            return `${sub.start} --> ${sub.end}\n${sub.text}\n`;
        }).join('\n');
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `subtitle.${format}`;
    a.click();
}

init();
