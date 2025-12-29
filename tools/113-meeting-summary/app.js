/**
 * Meeting Summary - Tool #113
 * Extracts key points, action items, and decisions from meeting transcripts
 */

let currentLang = 'zh-TW';

const i18n = {
    'zh-TW': {
        title: '會議紀錄摘要',
        subtitle: '從會議逐字稿生成重點摘要',
        inputLabel: '貼上會議逐字稿',
        formatLabel: '輸出格式',
        detailLabel: '詳細程度',
        generateBtn: '生成摘要',
        outputTitle: '會議摘要',
        copy: '複製',
        download: '下載',
        placeholder: '將您的會議記錄或逐字稿貼在這裡...',
        formatSummary: '重點摘要',
        formatActions: '待辦事項',
        formatDecisions: '決議事項',
        formatFull: '完整報告',
        detailBrief: '簡潔',
        detailStandard: '標準',
        detailDetailed: '詳細',
        noContent: '無法提取有效內容，請確認輸入的會議記錄。',
        enterContent: '請輸入會議記錄內容',
        copied: '已複製到剪貼簿',
        original: '原文',
        summary: '摘要',
        chars: '字',
        ratio: '壓縮比',
        participants: '參與者',
        topics: '討論主題',
        actionItems: '待辦事項',
        decisions: '決議事項',
        keyPoints: '重點摘要',
        meetingOverview: '會議概覽',
        nextSteps: '後續步驟'
    },
    'en': {
        title: 'Meeting Summary',
        subtitle: 'Generate summaries from meeting transcripts',
        inputLabel: 'Paste meeting transcript',
        formatLabel: 'Output format',
        detailLabel: 'Detail level',
        generateBtn: 'Generate Summary',
        outputTitle: 'Meeting Summary',
        copy: 'Copy',
        download: 'Download',
        placeholder: 'Paste your meeting transcript here...',
        formatSummary: 'Key Points',
        formatActions: 'Action Items',
        formatDecisions: 'Decisions',
        formatFull: 'Full Report',
        detailBrief: 'Brief',
        detailStandard: 'Standard',
        detailDetailed: 'Detailed',
        noContent: 'Unable to extract content. Please check the meeting transcript.',
        enterContent: 'Please enter meeting content',
        copied: 'Copied to clipboard',
        original: 'Original',
        summary: 'Summary',
        chars: 'chars',
        ratio: 'Ratio',
        participants: 'Participants',
        topics: 'Discussion Topics',
        actionItems: 'Action Items',
        decisions: 'Decisions',
        keyPoints: 'Key Points',
        meetingOverview: 'Meeting Overview',
        nextSteps: 'Next Steps'
    }
};

function t(key) {
    return i18n[currentLang][key] || key;
}

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`lang-${lang === 'zh-TW' ? 'zh' : 'en'}`).classList.add('active');
    updateUI();
}

function updateUI() {
    document.querySelector('h1').textContent = t('title');
    document.querySelector('.subtitle').textContent = t('subtitle');
    document.querySelector('[data-i18n="inputLabel"]').textContent = t('inputLabel');
    document.querySelector('[data-i18n="formatLabel"]').textContent = t('formatLabel');
    document.querySelector('[data-i18n="detailLabel"]').textContent = t('detailLabel');
    document.querySelector('[data-i18n="generateBtn"]').textContent = t('generateBtn');
    document.getElementById('meetingInput').placeholder = t('placeholder');
}

// Extract participants from meeting text
function extractParticipants(text) {
    const participants = new Set();

    // Common patterns for speaker identification
    const patterns = [
        /^([A-Z\u4e00-\u9fff]{1,10})[:：]/gm,  // Name: or 名字：
        /\[([^\]]+)\]/g,  // [Name]
        /【([^】]+)】/g,  // 【名字】
        /^(\w+)\s*said/gim,
        /^(\w+):\s/gm
    ];

    patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(text)) !== null) {
            const name = match[1].trim();
            if (name.length >= 2 && name.length <= 20) {
                participants.add(name);
            }
        }
    });

    return Array.from(participants).slice(0, 10);
}

// Extract action items
function extractActionItems(text) {
    const actions = [];
    const patterns = currentLang === 'zh-TW' ? [
        /(?:需要|要|請|應該|必須|待辦|行動|任務)[：:]\s*(.+)/g,
        /(?:負責|處理|完成|跟進|追蹤)[：:]?\s*(.+)/g,
        /TODO[：:]\s*(.+)/gi,
        /(?:下一步|後續)[：:]\s*(.+)/g
    ] : [
        /(?:action item|todo|task)[：:]\s*(.+)/gi,
        /(?:need to|should|must|will)\s+(.+)/gi,
        /(?:responsible for|handle|complete|follow up)[：:]?\s*(.+)/gi,
        /(?:next step)[：:]\s*(.+)/gi
    ];

    patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(text)) !== null) {
            const action = match[1].trim();
            if (action.length > 5 && action.length < 200) {
                actions.push(action);
            }
        }
    });

    // Also check for bullet points that look like action items
    const lines = text.split('\n');
    lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.match(/^[-•*]\s*.+/) &&
            (trimmed.includes('需') || trimmed.includes('要') ||
             trimmed.includes('will') || trimmed.includes('should'))) {
            actions.push(trimmed.replace(/^[-•*]\s*/, ''));
        }
    });

    return [...new Set(actions)].slice(0, 10);
}

// Extract decisions
function extractDecisions(text) {
    const decisions = [];
    const patterns = currentLang === 'zh-TW' ? [
        /(?:決定|決議|同意|確認|通過)[：:]\s*(.+)/g,
        /(?:結論是|最後決定|會議決議)[：:]?\s*(.+)/g,
        /(?:大家同意|一致認為)[：:]?\s*(.+)/g
    ] : [
        /(?:decision|decided|agreed|confirmed|approved)[：:]\s*(.+)/gi,
        /(?:conclusion|final decision)[：:]?\s*(.+)/gi,
        /(?:everyone agreed|consensus)[：:]?\s*(.+)/gi
    ];

    patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(text)) !== null) {
            const decision = match[1].trim();
            if (decision.length > 5 && decision.length < 200) {
                decisions.push(decision);
            }
        }
    });

    return [...new Set(decisions)].slice(0, 8);
}

// Extract key sentences for summary
function extractKeyPoints(text, numPoints) {
    const sentences = text.split(/[。！？.!?\n]+/).filter(s => s.trim().length > 15);

    if (sentences.length === 0) return [];

    const keywords = currentLang === 'zh-TW'
        ? ['重要', '關鍵', '決定', '結論', '同意', '計畫', '目標', '問題', '解決', '討論', '提出', '建議']
        : ['important', 'key', 'decision', 'conclusion', 'agree', 'plan', 'goal', 'issue', 'solution', 'discuss', 'propose', 'suggest'];

    const scored = sentences.map((sentence, index) => {
        let score = 0;

        // Position score
        if (index < 3) score += 5;
        if (index >= sentences.length - 3) score += 3;

        // Keyword score
        keywords.forEach(kw => {
            if (sentence.toLowerCase().includes(kw)) score += 3;
        });

        // Length preference
        if (sentence.length > 20 && sentence.length < 150) score += 2;

        return { text: sentence.trim(), score, index };
    });

    scored.sort((a, b) => b.score - a.score);
    const selected = scored.slice(0, numPoints);
    selected.sort((a, b) => a.index - b.index);

    return selected.map(s => s.text);
}

// Generate meeting summary
function generateSummary(text, format, detail) {
    const participants = extractParticipants(text);
    const actionItems = extractActionItems(text);
    const decisions = extractDecisions(text);

    let numPoints;
    switch (detail) {
        case 'brief': numPoints = 3; break;
        case 'standard': numPoints = 5; break;
        case 'detailed': numPoints = 8; break;
        default: numPoints = 5;
    }

    const keyPoints = extractKeyPoints(text, numPoints);

    if (keyPoints.length === 0 && actionItems.length === 0 && decisions.length === 0) {
        return { content: t('noContent'), stats: null };
    }

    let output = '';

    if (format === 'summary' || format === 'full') {
        output += `<h4>${t('keyPoints')}</h4>\n<ul>`;
        keyPoints.forEach(point => {
            output += `<li>${point}</li>`;
        });
        output += '</ul>\n';
    }

    if (format === 'actions' || format === 'full') {
        if (actionItems.length > 0) {
            output += `<h4>${t('actionItems')}</h4>\n<ul>`;
            actionItems.forEach(item => {
                output += `<li>${item}</li>`;
            });
            output += '</ul>\n';
        }
    }

    if (format === 'decisions' || format === 'full') {
        if (decisions.length > 0) {
            output += `<h4>${t('decisions')}</h4>\n<ul>`;
            decisions.forEach(decision => {
                output += `<li>${decision}</li>`;
            });
            output += '</ul>\n';
        }
    }

    if (format === 'full' && participants.length > 0) {
        output += `<h4>${t('participants')}</h4>\n<p>${participants.join('、')}</p>\n`;
    }

    const stats = {
        original: text.length,
        summary: output.replace(/<[^>]*>/g, '').length,
        keyPoints: keyPoints.length,
        actions: actionItems.length,
        decisions: decisions.length
    };

    return { content: output, stats };
}

function downloadSummary(content, filename) {
    const plainText = content.replace(/<h4>/g, '\n\n### ')
                             .replace(/<\/h4>/g, '\n')
                             .replace(/<ul>/g, '')
                             .replace(/<\/ul>/g, '')
                             .replace(/<li>/g, '- ')
                             .replace(/<\/li>/g, '\n')
                             .replace(/<p>/g, '')
                             .replace(/<\/p>/g, '\n')
                             .replace(/<[^>]*>/g, '');

    const blob = new Blob([plainText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'meeting-summary.txt';
    a.click();
    URL.revokeObjectURL(url);
}

function init() {
    setLanguage(navigator.language.startsWith('zh') ? 'zh-TW' : 'en');

    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    document.getElementById('generateBtn').addEventListener('click', () => {
        const text = document.getElementById('meetingInput').value.trim();
        const format = document.getElementById('formatSelect').value;
        const detail = document.getElementById('detailSelect').value;

        if (!text) {
            alert(t('enterContent'));
            return;
        }

        const result = generateSummary(text, format, detail);
        document.getElementById('summaryContent').innerHTML = result.content;

        if (result.stats) {
            const ratio = Math.round((result.stats.summary / result.stats.original) * 100);
            document.getElementById('stats').innerHTML = `
                <span>${t('original')}: ${result.stats.original} ${t('chars')}</span>
                <span>${t('summary')}: ${result.stats.summary} ${t('chars')}</span>
                <span>${t('ratio')}: ${ratio}%</span>
                <span>${t('keyPoints')}: ${result.stats.keyPoints}</span>
                <span>${t('actionItems')}: ${result.stats.actions}</span>
            `;
        }

        document.getElementById('outputSection').style.display = 'block';
    });

    document.getElementById('copyBtn').addEventListener('click', () => {
        const content = document.getElementById('summaryContent').innerText;
        navigator.clipboard.writeText(content).then(() => {
            const btn = document.getElementById('copyBtn');
            const originalText = btn.textContent;
            btn.textContent = t('copied');
            setTimeout(() => btn.textContent = originalText, 2000);
        });
    });

    document.getElementById('downloadBtn').addEventListener('click', () => {
        const content = document.getElementById('summaryContent').innerHTML;
        const date = new Date().toISOString().split('T')[0];
        downloadSummary(content, `meeting-summary-${date}.txt`);
    });
}

init();
