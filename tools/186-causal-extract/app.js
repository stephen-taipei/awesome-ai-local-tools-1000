/**
 * Causal Extract - Tool #186
 */
function init() {
    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    document.getElementById('loadSampleBtn').addEventListener('click', loadSample);
    document.getElementById('extractBtn').addEventListener('click', extract);
}

function loadSample() {
    document.getElementById('textInput').value = `因為天氣炎熱，所以冰淇淋銷量大增。

由於全球暖化，導致海平面上升。

運動可以促進新陳代謝，因此有助於減重。

因為疫情爆發，許多企業開始實施遠端工作。

學習程式設計能夠提升邏輯思考能力，進而改善解決問題的技巧。

睡眠不足會造成注意力下降，影響工作效率。

環境污染嚴重，使得空氣品質惡化。

持續練習可以增強記憶力。`;
}

function extract() {
    const text = document.getElementById('textInput').value.trim();
    if (!text) return;

    const relations = extractRelations(text);
    displayResults(relations);
}

function extractRelations(text) {
    const relations = [];
    const sentences = text.split(/[。！？\n]+/).filter(s => s.trim());

    // Causal patterns
    const patterns = [
        { regex: /因為(.+?)，?所以(.+)/, cause: 1, effect: 2, confidence: 95 },
        { regex: /由於(.+?)，?導致(.+)/, cause: 1, effect: 2, confidence: 95 },
        { regex: /(.+?)因此(.+)/, cause: 1, effect: 2, confidence: 85 },
        { regex: /(.+?)，?使得(.+)/, cause: 1, effect: 2, confidence: 80 },
        { regex: /(.+?)造成(.+)/, cause: 1, effect: 2, confidence: 85 },
        { regex: /(.+?)導致(.+)/, cause: 1, effect: 2, confidence: 90 },
        { regex: /(.+?)會(.+)/, cause: 1, effect: 2, confidence: 60 },
        { regex: /(.+?)能夠(.+)/, cause: 1, effect: 2, confidence: 70 },
        { regex: /(.+?)可以(.+)/, cause: 1, effect: 2, confidence: 65 },
        { regex: /(.+?)，?進而(.+)/, cause: 1, effect: 2, confidence: 80 },
        { regex: /because (.+?),? (.+)/i, cause: 1, effect: 2, confidence: 90 },
        { regex: /(.+?) causes? (.+)/i, cause: 1, effect: 2, confidence: 90 },
        { regex: /(.+?) leads? to (.+)/i, cause: 1, effect: 2, confidence: 85 },
        { regex: /(.+?) results? in (.+)/i, cause: 1, effect: 2, confidence: 85 }
    ];

    sentences.forEach(sentence => {
        const s = sentence.trim();
        for (const pattern of patterns) {
            const match = s.match(pattern.regex);
            if (match) {
                const cause = match[pattern.cause].trim();
                const effect = match[pattern.effect].trim();
                if (cause.length > 2 && effect.length > 2) {
                    relations.push({
                        cause,
                        effect,
                        confidence: pattern.confidence,
                        original: s
                    });
                    break;
                }
            }
        }
    });

    return relations;
}

function displayResults(relations) {
    document.getElementById('relationCount').textContent = `${relations.length} 組關係`;

    if (relations.length === 0) {
        document.getElementById('relationsList').innerHTML = '<p style="color: var(--text-secondary);">未找到因果關係</p>';
    } else {
        document.getElementById('relationsList').innerHTML = relations.map(r => `
            <div class="relation-item">
                <div class="cause-box">
                    <div class="box-label">原因</div>
                    <div class="box-text">${escapeHtml(r.cause)}</div>
                </div>
                <div class="arrow">→</div>
                <div class="effect-box">
                    <div class="box-label">結果</div>
                    <div class="box-text">${escapeHtml(r.effect)}</div>
                    <div class="confidence">信心度: ${r.confidence}%</div>
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
