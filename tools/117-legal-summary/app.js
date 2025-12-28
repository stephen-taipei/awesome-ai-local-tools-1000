/**
 * Legal Summary - Tool #117
 */

let currentLang = 'zh-TW';

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`lang-${lang === 'zh-TW' ? 'zh' : 'en'}`).classList.add('active');
}

function extractLegalClauses(text, keywords) {
    const sentences = text.split(/[。.；;]+/).filter(s => s.trim().length > 10);
    return sentences.filter(s => keywords.some(k => s.includes(k))).slice(0, 5);
}

function generateLegalSummary(text, docType, focus) {
    let output = '';

    const obligationKw = currentLang === 'zh-TW'
        ? ['應', '須', '必須', '負責', '義務', '責任', '承擔', '遵守']
        : ['shall', 'must', 'required', 'responsible', 'obligation', 'duty'];

    const rightsKw = currentLang === 'zh-TW'
        ? ['權利', '得', '可以', '有權', '享有', '授權', '許可']
        : ['right', 'may', 'entitled', 'authorized', 'permitted', 'license'];

    const riskKw = currentLang === 'zh-TW'
        ? ['不得', '禁止', '違反', '賠償', '損失', '風險', '終止', '解除', '違約']
        : ['prohibited', 'terminate', 'breach', 'damages', 'liability', 'risk', 'penalty'];

    if (focus === 'all' || focus === 'obligations') {
        const obligations = extractLegalClauses(text, obligationKw);
        if (obligations.length > 0) {
            output += `<h4>${currentLang === 'zh-TW' ? '義務與責任' : 'Obligations'}</h4><ul>`;
            obligations.forEach(o => output += `<li>${o.trim()}</li>`);
            output += '</ul>';
        }
    }

    if (focus === 'all' || focus === 'rights') {
        const rights = extractLegalClauses(text, rightsKw);
        if (rights.length > 0) {
            output += `<h4>${currentLang === 'zh-TW' ? '權利條款' : 'Rights'}</h4><ul>`;
            rights.forEach(r => output += `<li>${r.trim()}</li>`);
            output += '</ul>';
        }
    }

    if (focus === 'all' || focus === 'risks') {
        const risks = extractLegalClauses(text, riskKw);
        if (risks.length > 0) {
            output += `<h4>${currentLang === 'zh-TW' ? '風險警示' : 'Risk Warnings'}</h4><ul>`;
            risks.forEach(r => output += `<li>${r.trim()}</li>`);
            output += '</ul>';
        }
    }

    if (!output) {
        output = `<p>${currentLang === 'zh-TW' ? '未識別到相關法律條款' : 'No relevant legal clauses identified'}</p>`;
    }

    return output;
}

function init() {
    setLanguage(navigator.language.startsWith('zh') ? 'zh-TW' : 'en');

    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    document.getElementById('generateBtn').addEventListener('click', () => {
        const text = document.getElementById('legalInput').value.trim();
        if (!text) {
            alert(currentLang === 'zh-TW' ? '請輸入法律文件內容' : 'Please enter legal document content');
            return;
        }

        const docType = document.getElementById('typeSelect').value;
        const focus = document.getElementById('focusSelect').value;
        const output = generateLegalSummary(text, docType, focus);

        document.getElementById('summaryContent').innerHTML = output;
        document.getElementById('stats').innerHTML = `
            <span>${currentLang === 'zh-TW' ? '原文' : 'Original'}: ${text.length} ${currentLang === 'zh-TW' ? '字' : 'chars'}</span>
        `;
        document.getElementById('outputSection').style.display = 'block';
    });

    document.getElementById('copyBtn').addEventListener('click', () => {
        navigator.clipboard.writeText(document.getElementById('summaryContent').innerText);
    });
}

init();
