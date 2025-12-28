/**
 * Chat Summary - Tool #119
 */

let currentLang = 'zh-TW';

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`lang-${lang === 'zh-TW' ? 'zh' : 'en'}`).classList.add('active');
}

function parseChat(text) {
    const lines = text.split('\n').filter(l => l.trim());
    const messages = [];
    const participants = new Set();

    const patterns = [
        /^([^:：\[\]]+)[：:]\s*(.+)$/,
        /^\[([^\]]+)\]\s*(.+)$/,
        /^【([^】]+)】\s*(.+)$/
    ];

    lines.forEach(line => {
        for (const pattern of patterns) {
            const match = line.match(pattern);
            if (match) {
                const speaker = match[1].trim();
                const content = match[2].trim();
                if (speaker.length < 20 && content.length > 0) {
                    participants.add(speaker);
                    messages.push({ speaker, content });
                    break;
                }
            }
        }
    });

    return { messages, participants: Array.from(participants) };
}

function extractTopics(messages) {
    const allContent = messages.map(m => m.content).join(' ');
    const keywords = currentLang === 'zh-TW'
        ? ['討論', '決定', '同意', '問題', '方案', '計畫', '時間', '需要', '建議']
        : ['discuss', 'decide', 'agree', 'issue', 'plan', 'solution', 'need', 'suggest'];

    const topics = [];
    const sentences = allContent.split(/[。.!?！？]+/).filter(s => s.trim().length > 10);

    sentences.forEach(s => {
        if (keywords.some(k => s.includes(k))) {
            topics.push(s.trim());
        }
    });

    return [...new Set(topics)].slice(0, 5);
}

function extractDecisions(messages) {
    const decisionKw = currentLang === 'zh-TW'
        ? ['決定', '同意', '確定', '就這樣', 'OK', '好的', '沒問題']
        : ['decided', 'agreed', 'confirmed', "let's", 'okay', 'will do'];

    return messages
        .filter(m => decisionKw.some(k => m.content.includes(k)))
        .map(m => m.content)
        .slice(0, 5);
}

function generateChatSummary(text, summaryType, detail) {
    const { messages, participants } = parseChat(text);

    if (messages.length === 0) {
        return {
            content: currentLang === 'zh-TW'
                ? '<p>無法識別聊天格式。請使用 "名字: 訊息" 格式。</p>'
                : '<p>Could not parse chat format. Please use "Name: message" format.</p>',
            stats: null
        };
    }

    let output = '';
    const numPoints = detail === 'brief' ? 3 : detail === 'standard' ? 5 : 8;

    if (summaryType === 'overview' || summaryType === 'topics') {
        const topics = extractTopics(messages);
        output += `<h4>${currentLang === 'zh-TW' ? '討論主題' : 'Discussion Topics'}</h4><ul>`;
        topics.slice(0, numPoints).forEach(t => output += `<li>${t}</li>`);
        output += '</ul>';
    }

    if (summaryType === 'overview' || summaryType === 'decisions') {
        const decisions = extractDecisions(messages);
        if (decisions.length > 0) {
            output += `<h4>${currentLang === 'zh-TW' ? '決定與結論' : 'Decisions'}</h4><ul>`;
            decisions.slice(0, numPoints).forEach(d => output += `<li>${d}</li>`);
            output += '</ul>';
        }
    }

    if (summaryType === 'participants' || summaryType === 'overview') {
        if (participants.length > 0) {
            output += `<h4>${currentLang === 'zh-TW' ? '參與者' : 'Participants'}</h4>`;
            output += `<p>${participants.join('、')}</p>`;

            if (summaryType === 'participants') {
                participants.forEach(p => {
                    const pMsgs = messages.filter(m => m.speaker === p);
                    if (pMsgs.length > 0) {
                        output += `<h4>${p}</h4><ul>`;
                        pMsgs.slice(0, 3).forEach(m => output += `<li>${m.content}</li>`);
                        output += '</ul>';
                    }
                });
            }
        }
    }

    return {
        content: output || `<p>${currentLang === 'zh-TW' ? '未找到相關內容' : 'No relevant content found'}</p>`,
        stats: { messages: messages.length, participants: participants.length }
    };
}

function init() {
    setLanguage(navigator.language.startsWith('zh') ? 'zh-TW' : 'en');

    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    document.getElementById('generateBtn').addEventListener('click', () => {
        const text = document.getElementById('chatInput').value.trim();
        if (!text) {
            alert(currentLang === 'zh-TW' ? '請輸入聊天記錄' : 'Please enter chat content');
            return;
        }

        const summaryType = document.getElementById('typeSelect').value;
        const detail = document.getElementById('detailSelect').value;
        const result = generateChatSummary(text, summaryType, detail);

        document.getElementById('summaryContent').innerHTML = result.content;

        if (result.stats) {
            document.getElementById('stats').innerHTML = `
                <span>${currentLang === 'zh-TW' ? '訊息數' : 'Messages'}: ${result.stats.messages}</span>
                <span>${currentLang === 'zh-TW' ? '參與者' : 'Participants'}: ${result.stats.participants}</span>
            `;
        }

        document.getElementById('outputSection').style.display = 'block';
    });

    document.getElementById('copyBtn').addEventListener('click', () => {
        navigator.clipboard.writeText(document.getElementById('summaryContent').innerText);
    });
}

init();
