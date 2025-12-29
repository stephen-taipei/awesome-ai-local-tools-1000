/**
 * Named Entity Recognition - Tool #133
 * Identify named entities in text
 */

let currentLang = 'zh-TW';

const i18n = {
    'zh-TW': {
        title: '命名實體識別',
        subtitle: '識別文字中的人名、地名、組織等',
        inputLabel: '輸入文字',
        placeholder: '輸入要分析的文字...',
        analyzeBtn: '識別實體',
        result: '識別結果',
        person: '人名',
        location: '地名',
        organization: '組織',
        date: '日期',
        number: '數字',
        examples: '範例文字',
        totalEntities: '共識別到'
    },
    'en': {
        title: 'Named Entity Recognition',
        subtitle: 'Identify persons, locations, organizations',
        inputLabel: 'Enter text',
        placeholder: 'Enter text to analyze...',
        analyzeBtn: 'Identify Entities',
        result: 'Recognition Result',
        person: 'Person',
        location: 'Location',
        organization: 'Organization',
        date: 'Date',
        number: 'Number',
        examples: 'Example Text',
        totalEntities: 'Total entities found'
    }
};

// Entity patterns
const entityPatterns = {
    zh: {
        person: ['提姆·庫克', '庫克', '市長', '總統', '執行長', '董事長', '經理'],
        location: ['台北', '台灣', '加州', '美國', '中國', '日本', '東京', '紐約', '總部', '市', '縣', '省'],
        organization: ['蘋果公司', '蘋果', 'Google', 'Microsoft', '微軟', '台積電', '公司', '企業', '大學', '政府'],
        date: /(\d{4}年\d{1,2}月|\d{1,2}月\d{1,2}日|\d{4}年|\d{1,2}月)/g,
        number: /(\d+[\d,]*(?:\.\d+)?(?:人|元|美元|萬|億|%|個|台|件)?)/g
    },
    en: {
        person: ['Tim Cook', 'Cook', 'CEO', 'President', 'Manager', 'Director'],
        location: ['California', 'USA', 'America', 'China', 'Japan', 'Tokyo', 'New York', 'headquarters'],
        organization: ['Apple', 'Google', 'Microsoft', 'Company', 'Corporation', 'Inc', 'Ltd'],
        date: /(\d{4}|\w+\s+\d{1,2},?\s*\d{4}|\d{1,2}\/\d{1,2}\/\d{4})/g,
        number: /(\d+[\d,]*(?:\.\d+)?(?:\s*(?:people|dollars|million|billion|%|units))?)/gi
    }
};

function t(key) {
    return i18n[currentLang][key] || key;
}

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`lang-${lang === 'zh-TW' ? 'zh' : 'en'}`).classList.add('active');
}

function detectLanguage(text) {
    return /[\u4e00-\u9fff]/.test(text) ? 'zh' : 'en';
}

function recognizeEntities(text) {
    const lang = detectLanguage(text);
    const patterns = entityPatterns[lang];
    const entities = [];

    // Find pattern-based entities (date, number)
    let match;
    const dateRegex = patterns.date;
    dateRegex.lastIndex = 0;
    while ((match = dateRegex.exec(text)) !== null) {
        entities.push({ text: match[0], type: 'date', start: match.index });
    }

    const numberRegex = patterns.number;
    numberRegex.lastIndex = 0;
    while ((match = numberRegex.exec(text)) !== null) {
        entities.push({ text: match[0], type: 'number', start: match.index });
    }

    // Find dictionary-based entities
    ['person', 'location', 'organization'].forEach(type => {
        patterns[type].forEach(entity => {
            let idx = 0;
            while ((idx = text.indexOf(entity, idx)) !== -1) {
                // Check if not already identified
                const overlaps = entities.some(e =>
                    (idx >= e.start && idx < e.start + e.text.length) ||
                    (idx + entity.length > e.start && idx + entity.length <= e.start + e.text.length)
                );
                if (!overlaps) {
                    entities.push({ text: entity, type, start: idx });
                }
                idx += entity.length;
            }
        });
    });

    // Sort by position
    entities.sort((a, b) => a.start - b.start);

    return entities;
}

function highlightEntities(text, entities) {
    let result = '';
    let lastIdx = 0;

    entities.forEach(entity => {
        result += text.slice(lastIdx, entity.start);
        result += `<span class="entity ${entity.type}">${entity.text}</span>`;
        lastIdx = entity.start + entity.text.length;
    });

    result += text.slice(lastIdx);
    return result;
}

function displayResults(text, entities) {
    document.getElementById('resultSection').style.display = 'block';

    // Highlighted text
    document.getElementById('highlightedText').innerHTML = highlightEntities(text, entities);

    // Entity cards
    const grouped = {};
    entities.forEach(e => {
        if (!grouped[e.type]) grouped[e.type] = new Set();
        grouped[e.type].add(e.text);
    });

    let cardsHTML = '';
    Object.entries(grouped).forEach(([type, values]) => {
        values.forEach(value => {
            cardsHTML += `
                <div class="entity-card ${type}">
                    <div class="entity-card-type">${t(type)}</div>
                    <div class="entity-card-value">${value}</div>
                </div>
            `;
        });
    });
    document.getElementById('entitiesList').innerHTML = cardsHTML;

    // Stats
    document.getElementById('stats').textContent = `${t('totalEntities')}: ${entities.length} 個實體`;
}

function init() {
    setLanguage(navigator.language.startsWith('zh') ? 'zh-TW' : 'en');

    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    document.getElementById('analyzeBtn').addEventListener('click', () => {
        const text = document.getElementById('textInput').value.trim();
        if (!text) return;

        const entities = recognizeEntities(text);
        displayResults(text, entities);
    });

    document.querySelectorAll('.example-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('textInput').value = btn.dataset.text;
            document.getElementById('analyzeBtn').click();
        });
    });
}

init();
