/**
 * Auto Complete - Tool #147
 */
const completions = {
    zh: {
        '今天天氣': ['很好，適合出門', '不太理想', '晴朗，陽光普照', '預計會下雨'],
        '我認為': ['這是一個好主意', '我們應該多加考慮', '這個方案可行', '還需要更多討論'],
        '謝謝你': ['的幫助', '的支持與鼓勵', '的理解', '願意花時間'],
        '根據': ['研究顯示', '統計數據', '最新報告', '專家分析'],
        '這個': ['問題很重要', '想法很有創意', '方法很有效', '產品很實用']
    },
    en: {
        'the quick': ['brown fox jumps over the lazy dog', 'solution is simple', 'answer is yes'],
        'thank you for': ['your help', 'your time', 'your understanding', 'reaching out', 'your patience'],
        'i would like to': ['know more about', 'schedule a meeting', 'discuss this further', 'thank you for'],
        'please let me know': ['if you have any questions', 'your thoughts', 'when you are available'],
        'looking forward to': ['hearing from you', 'your response', 'working with you', 'our meeting']
    }
};

function detectLanguage(text) { return /[\u4e00-\u9fff]/.test(text) ? 'zh' : 'en'; }

function getSuggestions(text) {
    const lang = detectLanguage(text);
    const lower = text.toLowerCase().trim();
    const results = [];
    Object.entries(completions[lang]).forEach(([prefix, suffixes]) => {
        if (lower.includes(prefix.toLowerCase()) || prefix.toLowerCase().startsWith(lower)) {
            suffixes.forEach(suffix => results.push({ prefix: text, completion: suffix }));
        }
    });
    return results.slice(0, 5);
}

function displaySuggestions(suggestions, inputText) {
    const area = document.getElementById('suggestionsArea');
    if (suggestions.length === 0) {
        area.innerHTML = inputText.length > 1 ? '<p style="color: var(--text-secondary); text-align: center; padding: 1rem;">繼續輸入以獲取建議...</p>' : '';
        return;
    }
    area.innerHTML = suggestions.map(s => `
        <div class="suggestion-item" onclick="applySuggestion('${s.prefix}', '${s.completion}')">
            <span class="suggestion-icon">💡</span>
            <span class="suggestion-text"><span class="prefix">${s.prefix}</span><span class="completion">${s.completion}</span></span>
        </div>
    `).join('');
}

function applySuggestion(prefix, completion) {
    document.getElementById('textInput').value = prefix + completion;
    document.getElementById('suggestionsArea').innerHTML = '';
}

window.applySuggestion = applySuggestion;

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    document.getElementById('textInput').addEventListener('input', (e) => {
        const text = e.target.value;
        const suggestions = getSuggestions(text);
        displaySuggestions(suggestions, text);
    });

    document.querySelectorAll('.example-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('textInput').value = btn.dataset.text;
            document.getElementById('textInput').dispatchEvent(new Event('input'));
        });
    });
}
init();
