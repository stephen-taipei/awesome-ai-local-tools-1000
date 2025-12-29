/**
 * Audiobook Generation - Tool #215
 */

let synth = window.speechSynthesis;
let voices = [];
let chapters = [];
let currentChapterIndex = 0;
let isPlaying = false;
let startTime = 0;

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    document.getElementById('loadSampleBtn').addEventListener('click', loadSample);
    document.getElementById('inputText').addEventListener('input', updateStats);
    document.getElementById('playBtn').addEventListener('click', togglePlay);
    document.getElementById('prevBtn').addEventListener('click', prevChapter);
    document.getElementById('nextBtn').addEventListener('click', nextChapter);

    loadVoices();
    synth.onvoiceschanged = loadVoices;
}

function loadVoices() {
    voices = synth.getVoices();
    const select = document.getElementById('voiceSelect');

    const sortedVoices = [...voices].sort((a, b) => {
        const aIsChinese = a.lang.includes('zh');
        const bIsChinese = b.lang.includes('zh');
        if (aIsChinese && !bIsChinese) return -1;
        if (!aIsChinese && bIsChinese) return 1;
        return 0;
    });

    select.innerHTML = sortedVoices.map((v, i) =>
        `<option value="${voices.indexOf(v)}">${v.name}</option>`
    ).join('');
}

function loadSample() {
    document.getElementById('inputText').value = `第一章 起點

每一個偉大的旅程都始於一個小小的決定。當我站在這條路的起點時，我並不知道前方等待著我的是什麼。

那是一個寧靜的早晨，陽光透過樹葉的縫隙灑落在地面上，形成斑駁的光影。

第二章 挑戰

旅途並非一帆風順。我遇到了無數的困難和挑戰，每一個都考驗著我的決心。

但正是這些挑戰，讓我變得更加堅強。

第三章 領悟

經歷了這一切之後，我終於明白了一個道理：真正的成功不在於達到終點，而在於旅途中的成長。

每一步都是一個學習的機會，每一次跌倒都是一次重新站起來的契機。`;
    updateStats();
    parseChapters();
}

function updateStats() {
    const text = document.getElementById('inputText').value;
    const charCount = text.length;
    const duration = Math.ceil(charCount / 200); // ~200 chars per minute

    document.getElementById('charCount').textContent = charCount;
    document.getElementById('duration').textContent = duration;

    parseChapters();
}

function parseChapters() {
    const text = document.getElementById('inputText').value;
    chapters = [];

    // Split by chapter markers
    const chapterRegex = /^(第[一二三四五六七八九十百千]+章|Chapter\s+\d+|#{1,3}\s+)/gim;
    const parts = text.split(chapterRegex);

    let chapterName = '序章';
    let chapterContent = '';

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i].trim();
        if (!part) continue;

        if (chapterRegex.test(part + ' ')) {
            if (chapterContent.trim()) {
                chapters.push({ name: chapterName, content: chapterContent.trim() });
            }
            chapterName = part + (parts[i + 1] ? parts[i + 1].split('\n')[0] : '');
            chapterContent = parts[i + 1] ? parts[i + 1].substring(parts[i + 1].indexOf('\n')) : '';
            i++;
        } else {
            chapterContent += part;
        }
    }

    if (chapterContent.trim()) {
        chapters.push({ name: chapterName, content: chapterContent.trim() });
    }

    // If no chapters found, treat as single chapter
    if (chapters.length === 0 && text.trim()) {
        chapters.push({ name: '全文', content: text.trim() });
    }

    renderChapters();
}

function renderChapters() {
    if (chapters.length === 0) {
        document.getElementById('chaptersSection').style.display = 'none';
        return;
    }

    document.getElementById('chaptersSection').style.display = 'block';

    const html = chapters.map((ch, i) => `
        <div class="chapter-item ${i === currentChapterIndex ? 'active' : ''}" onclick="selectChapter(${i})">
            <span class="name">${ch.name.substring(0, 30)}</span>
            <span class="length">${Math.ceil(ch.content.length / 200)} 分鐘</span>
        </div>
    `).join('');

    document.getElementById('chaptersList').innerHTML = html;
}

window.selectChapter = function(index) {
    currentChapterIndex = index;
    renderChapters();
    if (isPlaying) {
        synth.cancel();
        playCurrentChapter();
    }
};

function togglePlay() {
    if (isPlaying) {
        synth.cancel();
        isPlaying = false;
        document.getElementById('playBtn').textContent = '▶ 開始朗讀';
        document.getElementById('prevBtn').disabled = true;
        document.getElementById('nextBtn').disabled = true;
    } else {
        if (chapters.length === 0) return;
        isPlaying = true;
        document.getElementById('playBtn').textContent = '⏸ 暫停';
        document.getElementById('playerSection').style.display = 'block';
        document.getElementById('prevBtn').disabled = false;
        document.getElementById('nextBtn').disabled = false;
        playCurrentChapter();
    }
}

function playCurrentChapter() {
    if (currentChapterIndex >= chapters.length) {
        isPlaying = false;
        document.getElementById('playBtn').textContent = '▶ 開始朗讀';
        return;
    }

    const chapter = chapters[currentChapterIndex];
    document.getElementById('currentChapter').textContent = chapter.name;

    const utterance = new SpeechSynthesisUtterance(chapter.content);

    const voiceIndex = document.getElementById('voiceSelect').value;
    if (voiceIndex) utterance.voice = voices[parseInt(voiceIndex)];

    utterance.rate = parseFloat(document.getElementById('speed').value);

    startTime = Date.now();
    const totalDuration = (chapter.content.length / 200) * 60 * 1000;

    const progressInterval = setInterval(() => {
        if (!isPlaying) {
            clearInterval(progressInterval);
            return;
        }
        const elapsed = Date.now() - startTime;
        const progress = Math.min(100, (elapsed / totalDuration) * 100);
        document.getElementById('progressFill').style.width = progress + '%';
        document.getElementById('currentTime').textContent = formatTime(elapsed / 1000);
        document.getElementById('totalTime').textContent = formatTime(totalDuration / 1000);
    }, 100);

    utterance.onend = () => {
        clearInterval(progressInterval);
        currentChapterIndex++;
        renderChapters();

        if (isPlaying && currentChapterIndex < chapters.length) {
            const pauseDuration = parseInt(document.getElementById('chapterPause').value) * 1000;
            setTimeout(playCurrentChapter, pauseDuration);
        } else {
            isPlaying = false;
            document.getElementById('playBtn').textContent = '▶ 開始朗讀';
        }
    };

    synth.speak(utterance);
}

function prevChapter() {
    if (currentChapterIndex > 0) {
        currentChapterIndex--;
        renderChapters();
        if (isPlaying) {
            synth.cancel();
            playCurrentChapter();
        }
    }
}

function nextChapter() {
    if (currentChapterIndex < chapters.length - 1) {
        currentChapterIndex++;
        renderChapters();
        if (isPlaying) {
            synth.cancel();
            playCurrentChapter();
        }
    }
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

init();
