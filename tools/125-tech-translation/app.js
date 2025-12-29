/**
 * Tech Translation - Tool #125
 * Technical document translation
 */

let currentLang = 'zh-TW';

const i18n = {
    'zh-TW': {
        title: '技術文件翻譯',
        subtitle: '專為技術文件優化的翻譯工具',
        translateBtn: '翻譯文件',
        placeholder: '貼上技術文件內容...',
        keepCode: '保留程式碼區塊',
        keepTerms: '保留技術術語原文',
        result: '翻譯結果',
        copy: '複製',
        glossary: '技術術語對照',
        general: '一般技術',
        programming: '程式開發',
        database: '資料庫',
        network: '網路通訊',
        security: '資訊安全',
        ai: '人工智慧',
        chars: '字元',
        terms: '術語'
    },
    'en': {
        title: 'Tech Translation',
        subtitle: 'Translation optimized for technical documents',
        translateBtn: 'Translate Document',
        placeholder: 'Paste technical document content...',
        keepCode: 'Keep code blocks',
        keepTerms: 'Keep technical terms',
        result: 'Translation Result',
        copy: 'Copy',
        glossary: 'Technical Glossary',
        general: 'General Tech',
        programming: 'Programming',
        database: 'Database',
        network: 'Networking',
        security: 'Security',
        ai: 'AI/ML',
        chars: 'chars',
        terms: 'terms'
    }
};

// Technical terms dictionary
const techTerms = {
    enToZh: {
        // Programming
        'API': '應用程式介面 (API)',
        'function': '函式',
        'variable': '變數',
        'constant': '常數',
        'class': '類別',
        'object': '物件',
        'method': '方法',
        'property': '屬性',
        'array': '陣列',
        'string': '字串',
        'integer': '整數',
        'boolean': '布林值',
        'null': '空值',
        'undefined': '未定義',
        'framework': '框架',
        'library': '函式庫',
        'module': '模組',
        'package': '套件',
        'dependency': '相依性',
        'repository': '儲存庫',
        'branch': '分支',
        'commit': '提交',
        'merge': '合併',
        'pull request': '拉取請求',
        'code review': '程式碼審查',
        'debug': '除錯',
        'compile': '編譯',
        'runtime': '執行時期',
        'deployment': '部署',
        // Database
        'database': '資料庫',
        'table': '資料表',
        'column': '欄位',
        'row': '列/紀錄',
        'query': '查詢',
        'index': '索引',
        'primary key': '主鍵',
        'foreign key': '外鍵',
        'transaction': '交易',
        'schema': '結構描述',
        // Network
        'server': '伺服器',
        'client': '客戶端',
        'request': '請求',
        'response': '回應',
        'endpoint': '端點',
        'protocol': '協定',
        'authentication': '身份驗證',
        'authorization': '授權',
        'session': '會話',
        'cookie': 'Cookie',
        'cache': '快取',
        'load balancer': '負載平衡器',
        // AI/ML
        'machine learning': '機器學習',
        'deep learning': '深度學習',
        'neural network': '神經網路',
        'model': '模型',
        'training': '訓練',
        'inference': '推論',
        'dataset': '資料集',
        'feature': '特徵',
        'label': '標籤',
        'accuracy': '準確率',
        'precision': '精確率',
        'recall': '召回率'
    },
    zhToEn: {}
};

// Build reverse dictionary
Object.entries(techTerms.enToZh).forEach(([en, zh]) => {
    // Extract Chinese term without parenthesis
    const zhTerm = zh.split(' (')[0];
    techTerms.zhToEn[zhTerm] = en;
});

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
    document.querySelector('.header h1').textContent = t('title');
    document.querySelector('.subtitle').textContent = t('subtitle');
    document.getElementById('translateBtn').textContent = t('translateBtn');
    document.getElementById('sourceText').placeholder = t('placeholder');
    document.querySelector('.glossary-section h3').textContent = t('glossary');
}

function extractCodeBlocks(text) {
    const codeBlocks = [];
    let counter = 0;

    // Extract fenced code blocks
    const processed = text.replace(/```[\s\S]*?```/g, (match) => {
        codeBlocks.push(match);
        return `__CODE_BLOCK_${counter++}__`;
    });

    // Extract inline code
    const processed2 = processed.replace(/`[^`]+`/g, (match) => {
        codeBlocks.push(match);
        return `__CODE_BLOCK_${counter++}__`;
    });

    return { text: processed2, codeBlocks };
}

function restoreCodeBlocks(text, codeBlocks) {
    let result = text;
    codeBlocks.forEach((block, i) => {
        result = result.replace(`__CODE_BLOCK_${i}__`, block);
    });
    return result;
}

function translateTechDoc(text, sourceLang, targetLang, options) {
    if (!text.trim()) return { text: '', termCount: 0 };

    let result = text;
    let termCount = 0;
    let codeBlocks = [];

    // Extract code blocks if option enabled
    if (options.keepCode) {
        const extracted = extractCodeBlocks(result);
        result = extracted.text;
        codeBlocks = extracted.codeBlocks;
    }

    // Apply term translations
    const dict = sourceLang === 'en' ? techTerms.enToZh : techTerms.zhToEn;

    // Sort by length (longer terms first)
    const sortedTerms = Object.entries(dict).sort((a, b) => b[0].length - a[0].length);

    sortedTerms.forEach(([source, target]) => {
        const regex = new RegExp(`\\b${source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        const matches = result.match(regex);
        if (matches) {
            termCount += matches.length;
            if (options.keepTerms) {
                result = result.replace(regex, `${target} (${source})`);
            } else {
                result = result.replace(regex, target);
            }
        }
    });

    // Restore code blocks
    if (options.keepCode) {
        result = restoreCodeBlocks(result, codeBlocks);
    }

    return { text: result, termCount };
}

function init() {
    setLanguage(navigator.language.startsWith('zh') ? 'zh-TW' : 'en');

    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    document.getElementById('swapBtn').addEventListener('click', () => {
        const sourceSelect = document.getElementById('sourceLang');
        const targetSelect = document.getElementById('targetLang');
        const temp = sourceSelect.value;
        sourceSelect.value = targetSelect.value;
        targetSelect.value = temp;
    });

    document.getElementById('translateBtn').addEventListener('click', () => {
        const text = document.getElementById('sourceText').value.trim();
        if (!text) return;

        const sourceLang = document.getElementById('sourceLang').value;
        const targetLang = document.getElementById('targetLang').value;
        const options = {
            keepCode: document.getElementById('keepCode').checked,
            keepTerms: document.getElementById('keepTerms').checked
        };

        const result = translateTechDoc(text, sourceLang, targetLang, options);

        document.getElementById('outputContent').textContent = result.text;
        document.getElementById('stats').innerHTML = `
            <span>${t('chars')}: ${result.text.length}</span>
            <span>${t('terms')}: ${result.termCount}</span>
        `;
        document.getElementById('outputSection').style.display = 'block';
    });

    document.getElementById('copyBtn').addEventListener('click', () => {
        const content = document.getElementById('outputContent').textContent;
        if (content) {
            navigator.clipboard.writeText(content);
        }
    });
}

init();
