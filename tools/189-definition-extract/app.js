/**
 * Definition Extract - Tool #189
 */
function init() {
    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    document.getElementById('loadSampleBtn').addEventListener('click', loadSample);
    document.getElementById('extractBtn').addEventListener('click', extract);
}

function loadSample() {
    document.getElementById('textInput').value = `人工智慧（AI）是指由機器展現的智慧，特別是電腦系統。

機器學習是一種人工智慧的應用，它使系統能夠從經驗中自動學習和改進。

深度學習指的是使用多層神經網路的機器學習技術。

自然語言處理（NLP）是電腦科學和人工智慧的一個子領域，專注於電腦與人類語言之間的互動。

大型語言模型（LLM）是在大量文本數據上訓練的語言模型，能夠理解和生成人類語言。

Transformer 是一種深度學習架構，主要用於處理序列數據，如自然語言。

API，即應用程式介面，是一組定義軟體組件如何相互通信的協議。

雲端計算是透過網際網路提供計算服務，包括伺服器、儲存、資料庫等。`;
}

function extract() {
    const text = document.getElementById('textInput').value.trim();
    if (!text) return;

    const definitions = extractDefinitions(text);
    displayResults(definitions);
}

function extractDefinitions(text) {
    const definitions = [];
    const sentences = text.split(/[。！？\n]+/).filter(s => s.trim());

    // Definition patterns
    const patterns = [
        { regex: /(.+?)(?:是指|指的是|是)(.+)/, term: 1, def: 2, confidence: 90 },
        { regex: /(.+?)(?:，即|（即）)(.+)/, term: 1, def: 2, confidence: 85 },
        { regex: /(.+?)（(.+?)）是(.+)/, term: 1, abbrev: 2, def: 3, confidence: 95 },
        { regex: /(.+?)，?(?:意思是|意指|代表)(.+)/, term: 1, def: 2, confidence: 85 },
        { regex: /所謂(.+?)(?:，|是)(.+)/, term: 1, def: 2, confidence: 80 },
        { regex: /(.+?) (?:is|are|refers to|means) (.+)/i, term: 1, def: 2, confidence: 85 },
        { regex: /(.+?), (?:which is|that is|i\.e\.,?) (.+)/i, term: 1, def: 2, confidence: 80 }
    ];

    sentences.forEach(sentence => {
        const s = sentence.trim();
        for (const pattern of patterns) {
            const match = s.match(pattern.regex);
            if (match) {
                let term = match[pattern.term].trim();
                let def = match[pattern.def].trim();

                // Handle abbreviation pattern
                if (pattern.abbrev && match[pattern.abbrev]) {
                    term = `${term}（${match[pattern.abbrev]}）`;
                }

                if (term.length > 1 && term.length < 50 && def.length > 5) {
                    definitions.push({
                        term,
                        definition: def,
                        confidence: pattern.confidence,
                        original: s
                    });
                    break;
                }
            }
        }
    });

    // Remove duplicates
    return definitions.filter((d, i, arr) =>
        i === arr.findIndex(x => x.term === d.term)
    );
}

function displayResults(definitions) {
    document.getElementById('defCount').textContent = `${definitions.length} 個定義`;

    if (definitions.length === 0) {
        document.getElementById('definitionsList').innerHTML = '<p style="color: var(--text-secondary);">未找到定義</p>';
    } else {
        document.getElementById('definitionsList').innerHTML = definitions.map(d => `
            <div class="definition-item">
                <div class="term">📖 ${escapeHtml(d.term)}</div>
                <div class="definition">${escapeHtml(d.definition)}</div>
                <div class="confidence-bar">
                    <span>信心度</span>
                    <div class="bar"><div class="bar-fill" style="width: ${d.confidence}%"></div></div>
                    <span>${d.confidence}%</span>
                </div>
            </div>
        `).join('');
    }

    document.getElementById('resultsSection').style.display = 'block';
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

init();
