/**
 * Text to SSML - Tool #192
 */
function init() {
    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    document.getElementById('loadSampleBtn').addEventListener('click', loadSample);
    document.getElementById('convertBtn').addEventListener('click', convert);
    document.getElementById('copyBtn').addEventListener('click', copyResult);
    document.getElementById('previewBtn').addEventListener('click', previewSpeech);
}

function loadSample() {
    document.getElementById('textInput').value = `歡迎使用文字轉語音服務。

這是一段「重要」的訊息。請仔細聆聽。

今天的天氣非常好。陽光普照，萬里無雲。

謝謝您的使用！`;
}

function convert() {
    const text = document.getElementById('textInput').value.trim();
    if (!text) return;

    const lang = document.getElementById('langSelect').value;
    const rate = document.getElementById('rateSelect').value;
    const volume = document.getElementById('volumeSelect').value;
    const pitch = document.getElementById('pitchSelect').value;
    const addBreaks = document.getElementById('addBreaks').checked;
    const addEmphasis = document.getElementById('addEmphasis').checked;

    let processedText = escapeXml(text);

    // Add breaks after periods
    if (addBreaks) {
        processedText = processedText.replace(/([。．.！!？?])/g, '$1<break time="500ms"/>');
    }

    // Add emphasis to quoted text
    if (addEmphasis) {
        processedText = processedText.replace(/「([^」]+)」/g, '<emphasis level="strong">$1</emphasis>');
        processedText = processedText.replace(/"([^"]+)"/g, '<emphasis level="strong">$1</emphasis>');
    }

    // Build SSML
    const ssml = `<?xml version="1.0" encoding="UTF-8"?>
<speak version="1.1" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${lang}">
  <prosody rate="${rate}" volume="${volume}" pitch="${pitch}">
    ${processedText}
  </prosody>
</speak>`;

    document.getElementById('ssmlOutput').textContent = ssml;
    document.getElementById('resultsSection').style.display = 'block';
}

function escapeXml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function copyResult() {
    const ssml = document.getElementById('ssmlOutput').textContent;
    navigator.clipboard.writeText(ssml).then(() => {
        const btn = document.getElementById('copyBtn');
        btn.textContent = '已複製!';
        setTimeout(() => btn.textContent = '複製', 2000);
    });
}

function previewSpeech() {
    const text = document.getElementById('textInput').value.trim();
    if (!text) return;

    // Use Web Speech API for preview (note: doesn't support full SSML)
    const utterance = new SpeechSynthesisUtterance(text);

    const lang = document.getElementById('langSelect').value;
    const rate = document.getElementById('rateSelect').value;

    utterance.lang = lang;

    // Map SSML rate to Speech API rate
    const rateMap = { 'x-slow': 0.5, 'slow': 0.75, 'medium': 1, 'fast': 1.25, 'x-fast': 1.5 };
    utterance.rate = rateMap[rate] || 1;

    const pitchVal = document.getElementById('pitchSelect').value;
    const pitchMap = { 'x-low': 0.5, 'low': 0.75, 'medium': 1, 'high': 1.25, 'x-high': 1.5 };
    utterance.pitch = pitchMap[pitchVal] || 1;

    const volumeVal = document.getElementById('volumeSelect').value;
    const volumeMap = { 'silent': 0, 'x-soft': 0.25, 'soft': 0.5, 'medium': 0.75, 'loud': 0.9, 'x-loud': 1 };
    utterance.volume = volumeMap[volumeVal] || 0.75;

    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
}

init();
