/**
 * Text Classifier - Tool #134
 */
let currentLang = 'zh-TW';
const categories = {
    news: { zh: '新聞', en: 'News', icon: '📰', keywords: ['報導', '記者', '新聞', '消息', 'news', 'report', 'journalist'] },
    business: { zh: '商業', en: 'Business', icon: '💼', keywords: ['公司', '企業', '投資', '股票', '市場', 'company', 'business', 'market', 'stock'] },
    tech: { zh: '科技', en: 'Technology', icon: '🔬', keywords: ['科技', '技術', 'AI', '人工智慧', '軟體', 'tech', 'software', 'digital', 'app'] },
    sports: { zh: '體育', en: 'Sports', icon: '⚽', keywords: ['運動', '比賽', '球', '冠軍', '選手', 'sports', 'game', 'team', 'player', 'win'] },
    entertainment: { zh: '娛樂', en: 'Entertainment', icon: '🎬', keywords: ['電影', '音樂', '明星', '演唱會', 'movie', 'music', 'celebrity', 'concert'] },
    health: { zh: '健康', en: 'Health', icon: '🏥', keywords: ['健康', '醫療', '病', '治療', '醫院', 'health', 'medical', 'doctor', 'hospital'] }
};

function classifyText(text) {
    const lowerText = text.toLowerCase();
    const scores = {};
    Object.entries(categories).forEach(([key, cat]) => {
        scores[key] = 0;
        cat.keywords.forEach(kw => {
            if (lowerText.includes(kw.toLowerCase())) scores[key] += 10;
        });
    });
    const total = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
    Object.keys(scores).forEach(k => scores[k] = Math.round((scores[k] / total) * 100) || 5);
    return scores;
}

function displayResults(scores) {
    document.getElementById('resultSection').style.display = 'block';
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const [topKey, topScore] = sorted[0];
    const topCat = categories[topKey];
    document.getElementById('primaryCategory').innerHTML = `
        <div class="icon">${topCat.icon}</div>
        <div class="label">${currentLang === 'zh-TW' ? topCat.zh : topCat.en}</div>
        <div class="confidence">信心度: ${topScore}%</div>
    `;
    document.getElementById('categoryScores').innerHTML = sorted.map(([key, score]) => {
        const cat = categories[key];
        return `<div class="score-row">
            <span class="score-label">${cat.icon} ${currentLang === 'zh-TW' ? cat.zh : cat.en}</span>
            <div class="score-bar-container"><div class="score-bar" style="width: ${score}%"></div></div>
            <span class="score-value">${score}%</span>
        </div>`;
    }).join('');
}

function init() {
    currentLang = navigator.language.startsWith('zh') ? 'zh-TW' : 'en';
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`lang-${currentLang === 'zh-TW' ? 'zh' : 'en'}`).classList.add('active');
    document.getElementById('lang-zh').addEventListener('click', () => { currentLang = 'zh-TW'; document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { currentLang = 'en'; document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });
    document.getElementById('classifyBtn').addEventListener('click', () => {
        const text = document.getElementById('textInput').value.trim();
        if (!text) return;
        displayResults(classifyText(text));
    });
}
init();
