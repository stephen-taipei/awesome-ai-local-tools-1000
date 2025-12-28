/**
 * Multi-voice TTS - Tool #213
 */

let synth = window.speechSynthesis;
let voices = [];
let voiceAssignments = {};
let dialogueLines = [];
let currentLineIndex = 0;
let isPlaying = false;

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    document.getElementById('loadSampleBtn').addEventListener('click', loadSample);
    document.getElementById('inputText').addEventListener('input', updateVoiceAssignments);
    document.getElementById('playBtn').addEventListener('click', play);
    document.getElementById('stopBtn').addEventListener('click', stop);

    loadVoices();
    synth.onvoiceschanged = loadVoices;
}

function loadVoices() {
    voices = synth.getVoices();
    updateVoiceAssignments();
}

function loadSample() {
    document.getElementById('inputText').value = `[主持人]: 歡迎收聽今天的科技新知節目！
[來賓A]: 謝謝邀請，很高興能來這裡分享。
[主持人]: 今天我們要討論人工智慧的最新發展。
[來賓A]: 是的，最近 AI 技術有了很大的突破。
[來賓B]: 我補充一下，特別是在語音合成領域。
[主持人]: 沒錯！就像我們現在使用的這個工具一樣。
[來賓A]: 完全本地運行，保護用戶隱私。
[來賓B]: 這真的是很棒的技術！
[主持人]: 感謝兩位來賓的分享，我們下次見！`;
    updateVoiceAssignments();
}

function updateVoiceAssignments() {
    const text = document.getElementById('inputText').value;
    const characters = new Set();

    // Parse dialogue lines
    const lines = text.split('\n');
    lines.forEach(line => {
        const match = line.match(/^\[([^\]]+)\]:/);
        if (match) {
            characters.add(match[1]);
        }
    });

    const container = document.getElementById('voiceAssignments');

    if (characters.size === 0) {
        container.innerHTML = '<div style="color: var(--text-secondary);">尚未偵測到角色</div>';
        return;
    }

    // Build voice options
    const voiceOptions = voices.map((v, i) =>
        `<option value="${i}">${v.name} (${v.lang})</option>`
    ).join('');

    const html = Array.from(characters).map((char, index) => {
        const savedVoice = voiceAssignments[char] || (index % voices.length);
        return `
            <div class="voice-row">
                <span class="character">${char}</span>
                <select onchange="assignVoice('${char}', this.value)">
                    ${voiceOptions.replace(`value="${savedVoice}"`, `value="${savedVoice}" selected`)}
                </select>
            </div>
        `;
    }).join('');

    container.innerHTML = html;

    // Initialize assignments
    characters.forEach((char, index) => {
        if (!voiceAssignments[char]) {
            voiceAssignments[char] = index % voices.length;
        }
    });
}

window.assignVoice = function(character, voiceIndex) {
    voiceAssignments[character] = parseInt(voiceIndex);
};

function play() {
    const text = document.getElementById('inputText').value.trim();
    if (!text) return;

    // Parse dialogue
    dialogueLines = [];
    const lines = text.split('\n');
    lines.forEach(line => {
        const match = line.match(/^\[([^\]]+)\]:\s*(.+)/);
        if (match) {
            dialogueLines.push({
                character: match[1],
                text: match[2]
            });
        }
    });

    if (dialogueLines.length === 0) return;

    isPlaying = true;
    currentLineIndex = 0;

    document.getElementById('playBtn').disabled = true;
    document.getElementById('stopBtn').disabled = false;
    document.getElementById('progressSection').style.display = 'block';

    speakNext();
}

function speakNext() {
    if (!isPlaying || currentLineIndex >= dialogueLines.length) {
        finish();
        return;
    }

    const line = dialogueLines[currentLineIndex];

    // Update UI
    document.getElementById('currentLine').innerHTML =
        `<span class="speaker">[${line.character}]:</span> ${line.text}`;
    document.getElementById('progressFill').style.width =
        ((currentLineIndex + 1) / dialogueLines.length * 100) + '%';

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(line.text);

    const voiceIndex = voiceAssignments[line.character];
    if (voiceIndex !== undefined && voices[voiceIndex]) {
        utterance.voice = voices[voiceIndex];
    }

    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onend = () => {
        currentLineIndex++;
        setTimeout(speakNext, 300); // Small pause between lines
    };

    utterance.onerror = () => {
        currentLineIndex++;
        speakNext();
    };

    synth.speak(utterance);
}

function stop() {
    isPlaying = false;
    synth.cancel();
    finish();
}

function finish() {
    isPlaying = false;
    document.getElementById('playBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;
}

init();
