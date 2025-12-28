/**
 * SSML TTS - Tool #218
 */

let synth = window.speechSynthesis;
let voices = [];
let segments = [];

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    document.getElementById('loadSampleBtn').addEventListener('click', loadSample);

    document.querySelectorAll('.tag-btn').forEach(btn => {
        btn.addEventListener('click', () => insertTag(btn.dataset.tag));
    });

    document.getElementById('parseBtn').addEventListener('click', parse);
    document.getElementById('playBtn').addEventListener('click', play);
    document.getElementById('stopBtn').addEventListener('click', stop);

    loadVoices();
    synth.onvoiceschanged = loadVoices;
}

function loadVoices() {
    voices = synth.getVoices();
}

function loadSample() {
    document.getElementById('ssmlInput').value = `<speak>
  歡迎使用 SSML 語音合成工具。
  <break time="500ms"/>
  這是一段<emphasis level="strong">重要的</emphasis>訊息。
  <break time="300ms"/>
  <prosody rate="slow">慢速朗讀這段文字。</prosody>
  <break time="300ms"/>
  <prosody rate="fast">快速朗讀這段文字。</prosody>
  <break time="300ms"/>
  <prosody pitch="high">高音調朗讀。</prosody>
  <break time="300ms"/>
  <prosody pitch="low">低音調朗讀。</prosody>
  <break time="500ms"/>
  感謝您的使用！
</speak>`;
}

function insertTag(tag) {
    const textarea = document.getElementById('ssmlInput');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end);

    let insertion = '';
    switch (tag) {
        case 'break':
            insertion = '<break time="500ms"/>';
            break;
        case 'emphasis':
            insertion = `<emphasis level="strong">${selected || '強調文字'}</emphasis>`;
            break;
        case 'prosody-slow':
            insertion = `<prosody rate="slow">${selected || '慢速文字'}</prosody>`;
            break;
        case 'prosody-fast':
            insertion = `<prosody rate="fast">${selected || '快速文字'}</prosody>`;
            break;
        case 'prosody-high':
            insertion = `<prosody pitch="high">${selected || '高音文字'}</prosody>`;
            break;
        case 'prosody-low':
            insertion = `<prosody pitch="low">${selected || '低音文字'}</prosody>`;
            break;
    }

    textarea.value = textarea.value.substring(0, start) + insertion + textarea.value.substring(end);
    textarea.focus();
}

function parse() {
    const ssml = document.getElementById('ssmlInput').value;
    segments = parseSSML(ssml);

    const html = segments.map(seg => {
        if (seg.type === 'break') {
            return `<div class="segment segment-break">⏸ 停頓 ${seg.time || '500ms'}</div>`;
        } else if (seg.type === 'emphasis') {
            return `<div class="segment segment-emphasis">💪 ${escapeHtml(seg.text)}</div>`;
        } else {
            const props = [];
            if (seg.rate) props.push(`速度: ${seg.rate}`);
            if (seg.pitch) props.push(`音調: ${seg.pitch}`);
            const propStr = props.length ? ` (${props.join(', ')})` : '';
            return `<div class="segment segment-text">${escapeHtml(seg.text)}${propStr}</div>`;
        }
    }).join('');

    document.getElementById('previewContent').innerHTML = html || '<p style="color: var(--text-secondary);">無內容</p>';
    document.getElementById('previewSection').style.display = 'block';
}

function parseSSML(ssml) {
    const results = [];

    // Remove speak tags
    let content = ssml.replace(/<\/?speak[^>]*>/gi, '');

    // Parse segments
    const regex = /<(break|emphasis|prosody)[^>]*>([^<]*)<\/\1>|<break[^>]*\/>|([^<]+)/gi;
    let match;

    while ((match = regex.exec(content)) !== null) {
        if (match[0].startsWith('<break')) {
            const timeMatch = match[0].match(/time="([^"]+)"/);
            results.push({ type: 'break', time: timeMatch ? timeMatch[1] : '500ms' });
        } else if (match[1] === 'emphasis') {
            results.push({ type: 'emphasis', text: match[2].trim() });
        } else if (match[1] === 'prosody') {
            const rateMatch = match[0].match(/rate="([^"]+)"/);
            const pitchMatch = match[0].match(/pitch="([^"]+)"/);
            results.push({
                type: 'text',
                text: match[2].trim(),
                rate: rateMatch ? rateMatch[1] : null,
                pitch: pitchMatch ? pitchMatch[1] : null
            });
        } else if (match[3] && match[3].trim()) {
            results.push({ type: 'text', text: match[3].trim() });
        }
    }

    return results.filter(s => s.text || s.type === 'break');
}

function play() {
    parse();
    if (segments.length === 0) return;

    document.getElementById('playBtn').disabled = true;
    document.getElementById('stopBtn').disabled = false;

    playSegments(0);
}

function playSegments(index) {
    if (index >= segments.length) {
        document.getElementById('playBtn').disabled = false;
        document.getElementById('stopBtn').disabled = true;
        return;
    }

    const seg = segments[index];

    if (seg.type === 'break') {
        const time = parseInt(seg.time) || 500;
        setTimeout(() => playSegments(index + 1), time);
        return;
    }

    const utterance = new SpeechSynthesisUtterance(seg.text);

    // Apply rate
    if (seg.rate) {
        const rateMap = { 'x-slow': 0.5, 'slow': 0.75, 'medium': 1, 'fast': 1.25, 'x-fast': 1.5 };
        utterance.rate = rateMap[seg.rate] || 1;
    }

    // Apply pitch
    if (seg.pitch) {
        const pitchMap = { 'x-low': 0.5, 'low': 0.75, 'medium': 1, 'high': 1.25, 'x-high': 1.5 };
        utterance.pitch = pitchMap[seg.pitch] || 1;
    }

    if (seg.type === 'emphasis') {
        utterance.rate = 0.9;
        utterance.volume = 1;
    }

    utterance.onend = () => playSegments(index + 1);
    utterance.onerror = () => playSegments(index + 1);

    synth.speak(utterance);
}

function stop() {
    synth.cancel();
    document.getElementById('playBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

init();
