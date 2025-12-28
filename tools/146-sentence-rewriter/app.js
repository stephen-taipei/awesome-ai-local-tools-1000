/**
 * Sentence Rewriter - Tool #146
 */
let currentLang = 'zh-TW';

const rewritePatterns = {
    zh: [
        { label: '被動語態', transform: text => text.replace(/我(.+?)喜歡(.+)/g, '$2被我所$1喜愛') || text.replace(/(.+?)非常(.+)/g, '$2在$1中顯得$2') },
        { label: '強調主語', transform: text => '就我而言，' + text },
        { label: '倒裝句式', transform: text => { const parts = text.split('，'); return parts.length > 1 ? parts[1] + '，' + parts[0] : text; } },
        { label: '簡潔版本', transform: text => text.replace(/非常/g, '很').replace(/閱讀/g, '讀') }
    ],
    en: [
        { label: 'Formal', transform: text => text.replace(/is/g, 'appears to be').replace(/today/g, 'on this day') },
        { label: 'Passive', transform: text => { const m = text.match(/The (\w+) is (\w+)/); return m ? `It is observed that the ${m[1]} is ${m[2]}` : text; } },
        { label: 'Enthusiastic', transform: text => text.replace(/beautiful/g, 'absolutely stunning').replace(/./g, '!') },
        { label: 'Concise', transform: text => text.replace(/The weather is beautiful today/, "Beautiful day!") || text }
    ]
};

function detectLanguage(text) { return /[\u4e00-\u9fff]/.test(text) ? 'zh' : 'en'; }

function generateVersions(text) {
    const lang = detectLanguage(text);
    return rewritePatterns[lang].map(p => ({ label: p.label, text: p.transform(text) })).filter(v => v.text !== text);
}

function init() {
    currentLang = navigator.language.startsWith('zh') ? 'zh-TW' : 'en';
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`lang-${currentLang === 'zh-TW' ? 'zh' : 'en'}`).classList.add('active');

    document.getElementById('lang-zh').addEventListener('click', () => { currentLang = 'zh-TW'; document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { currentLang = 'en'; document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    document.getElementById('rewriteBtn').addEventListener('click', () => {
        const text = document.getElementById('textInput').value.trim();
        if (!text) return;
        const versions = generateVersions(text);
        document.getElementById('resultSection').style.display = 'block';
        document.getElementById('versionsList').innerHTML = versions.length > 0
            ? versions.map(v => `<div class="version-item"><span class="version-text">${v.text}</span><span class="version-label">${v.label}</span></div>`).join('')
            : '<p style="color: var(--text-secondary); text-align: center;">無法生成更多版本</p>';
    });

    document.querySelectorAll('.example-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('textInput').value = btn.dataset.text;
            document.getElementById('rewriteBtn').click();
        });
    });
}
init();
