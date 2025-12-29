/**
 * Fact Check - Tool #184
 */
function init() {
    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    document.getElementById('loadSampleBtn').addEventListener('click', loadSample);
    document.getElementById('analyzeBtn').addEventListener('click', analyze);
}

function loadSample() {
    document.getElementById('textInput').value = `地球是太陽系中第三顆行星。水的化學式是 H2O。

我認為這部電影非常精彩。台北 101 曾經是世界最高的建築物。

人工智慧將在未來幾年取代所有工作。光速約為每秒 30 萬公里。

這家餐廳的食物應該很好吃。蘋果公司成立於 1976 年。

全球變暖是一個嚴重的問題。有些專家表示經濟可能會復甦。`;
}

function analyze() {
    const text = document.getElementById('textInput').value.trim();
    if (!text) return;

    const claims = extractClaims(text);
    displayResults(claims);
}

function extractClaims(text) {
    const sentences = text.split(/[。！？\n]+/).filter(s => s.trim().length > 3);

    return sentences.map(sentence => {
        const s = sentence.trim();
        const classification = classifyClaim(s);
        const entities = extractEntities(s);

        return {
            text: s,
            type: classification.type,
            confidence: classification.confidence,
            reason: classification.reason,
            entities
        };
    });
}

function classifyClaim(sentence) {
    // Opinion indicators
    const opinionPatterns = [
        /我認為|我覺得|我相信|我想|可能|應該|大概|也許/,
        /認為|覺得|感覺|希望|擔心|期待/,
        /最好的|最差的|非常|特別|很棒|很糟/,
        /I think|I believe|probably|maybe|should|would|could/i
    ];

    // Verifiable indicators
    const verifiablePatterns = [
        /\d+年|\d+月|\d+日/,
        /成立於|創建於|發現於|發明於/,
        /是|為|有|等於|約為/,
        /位於|位在|在.*?內/,
        /\d+%|\d+公里|\d+米|\d+公斤/,
        /根據.*?資料|研究表明|數據顯示/
    ];

    // Uncertain indicators
    const uncertainPatterns = [
        /有些|部分|某些|一些/,
        /可能會|將會|預計|預期/,
        /專家表示|據報導|有人說/
    ];

    for (const p of opinionPatterns) {
        if (p.test(sentence)) {
            return { type: 'opinion', confidence: 80, reason: '包含主觀表達詞彙' };
        }
    }

    for (const p of uncertainPatterns) {
        if (p.test(sentence)) {
            return { type: 'uncertain', confidence: 60, reason: '陳述不確定或來源不明' };
        }
    }

    for (const p of verifiablePatterns) {
        if (p.test(sentence)) {
            return { type: 'verifiable', confidence: 85, reason: '包含可驗證的具體資訊' };
        }
    }

    // Default: if contains numbers or proper nouns, likely verifiable
    if (/\d+/.test(sentence) || /[A-Z][a-z]+/.test(sentence)) {
        return { type: 'verifiable', confidence: 65, reason: '包含數字或專有名詞' };
    }

    return { type: 'uncertain', confidence: 50, reason: '無法確定陳述類型' };
}

function extractEntities(sentence) {
    const entities = [];

    // Numbers and dates
    const numbers = sentence.match(/\d+(?:\.\d+)?(?:年|月|日|%|公里|米|公斤)?/g) || [];
    entities.push(...numbers.map(n => ({ text: n, type: 'number' })));

    // Organizations/Names (simplified)
    const names = sentence.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*|[\u4e00-\u9fff]{2,4}(?:公司|集團|組織)/g) || [];
    entities.push(...names.map(n => ({ text: n, type: 'entity' })));

    return entities.slice(0, 5); // Limit entities
}

function displayResults(claims) {
    const verifiable = claims.filter(c => c.type === 'verifiable').length;
    const opinion = claims.filter(c => c.type === 'opinion').length;

    document.getElementById('totalCount').textContent = claims.length;
    document.getElementById('verifiableCount').textContent = verifiable;
    document.getElementById('opinionCount').textContent = opinion;

    document.getElementById('claimsList').innerHTML = claims.map(c => `
        <div class="claim-item ${c.type}">
            <div class="claim-text">${escapeHtml(c.text)}</div>
            <div class="claim-meta">
                <span class="claim-tag ${c.type}">${getTypeLabel(c.type)}</span>
                <span class="claim-entities">${c.reason}</span>
            </div>
        </div>
    `).join('');

    document.getElementById('resultsSection').style.display = 'block';
}

function getTypeLabel(type) {
    const labels = {
        verifiable: '✓ 可驗證',
        opinion: '💭 意見',
        uncertain: '? 不確定'
    };
    return labels[type] || type;
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

init();
