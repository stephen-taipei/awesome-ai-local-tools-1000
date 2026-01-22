/**
 * Bilingual Subtitle - Tool #358
 * Create bilingual subtitles by merging two subtitle files
 */

let currentLang = 'zh';
let primarySubs = [];
let secondarySubs = [];
let resultText = '';

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    setupFileUpload();
    document.getElementById('processBtn').addEventListener('click', mergeSubtitles);
    document.getElementById('downloadBtn').addEventListener('click', downloadResult);
}

function setupFileUpload() {
    const primaryUpload = document.getElementById('primaryUpload');
    const primaryInput = document.getElementById('primaryInput');
    const secondaryUpload = document.getElementById('secondaryUpload');
    const secondaryInput = document.getElementById('secondaryInput');

    primaryUpload.addEventListener('click', () => primaryInput.click());
    secondaryUpload.addEventListener('click', () => secondaryInput.click());

    primaryInput.addEventListener('change', async (e) => {
        if (e.target.files.length) {
            const text = await e.target.files[0].text();
            primarySubs = parseSRT(text);
            primaryUpload.classList.add('loaded');
            document.getElementById('primaryInfo').textContent = `主要: ${e.target.files[0].name} (${primarySubs.length} 條)`;
            checkFilesReady();
        }
    });

    secondaryInput.addEventListener('change', async (e) => {
        if (e.target.files.length) {
            const text = await e.target.files[0].text();
            secondarySubs = parseSRT(text);
            secondaryUpload.classList.add('loaded');
            document.getElementById('secondaryInfo').textContent = `次要: ${e.target.files[0].name} (${secondarySubs.length} 條)`;
            checkFilesReady();
        }
    });
}

function checkFilesReady() {
    if (primarySubs.length > 0 && secondarySubs.length > 0) {
        document.getElementById('filesInfo').style.display = 'block';
        document.getElementById('optionsSection').style.display = 'block';
        document.getElementById('actionSection').style.display = 'flex';
    }
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');
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

function mergeSubtitles() {
    const layout = document.getElementById('layout').value;
    const separator = document.getElementById('separator').value;

    const merged = primarySubs.map((primary, i) => {
        const secondary = secondarySubs[i];
        let text;
        if (secondary) {
            if (layout === 'stack') {
                text = primary.text + '\n' + secondary.text;
            } else {
                text = primary.text + separator + secondary.text;
            }
        } else {
            text = primary.text;
        }
        return { start: primary.start, end: primary.end, text };
    });

    resultText = merged.map((sub, i) => `${i + 1}\n${sub.start} --> ${sub.end}\n${sub.text}\n`).join('\n');
    document.getElementById('resultText').value = resultText;
    document.getElementById('resultSection').style.display = 'block';
    document.getElementById('downloadBtn').disabled = false;
}

function downloadResult() {
    const blob = new Blob([resultText], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'bilingual.srt';
    a.click();
}

init();
