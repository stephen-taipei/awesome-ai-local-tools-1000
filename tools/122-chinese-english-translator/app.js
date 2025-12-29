/**
 * Chinese-English Translator - Tool #122
 * High-quality Chinese-English translation
 */

let currentLang = 'zh-TW';
let direction = 'zh-en';

const i18n = {
    'zh-TW': {
        title: '中英翻譯專家',
        subtitle: '高品質中英互譯',
        zhToEn: '中文 → 英文',
        enToZh: '英文 → 中文',
        placeholder: '輸入中文或英文...',
        translateBtn: '翻譯',
        chars: '字',
        clear: '清除',
        copy: '複製',
        options: '翻譯選項',
        formal: '正式語氣',
        keepFormat: '保留格式',
        showPinyin: '顯示拼音',
        traditional: '繁體中文',
        examples: '範例句子',
        outputPlaceholder: '翻譯結果將顯示在這裡...'
    },
    'en': {
        title: 'Chinese-English Expert',
        subtitle: 'High-quality translation',
        zhToEn: 'Chinese → English',
        enToZh: 'English → Chinese',
        placeholder: 'Enter Chinese or English...',
        translateBtn: 'Translate',
        chars: 'chars',
        clear: 'Clear',
        copy: 'Copy',
        options: 'Options',
        formal: 'Formal tone',
        keepFormat: 'Keep format',
        showPinyin: 'Show pinyin',
        traditional: 'Traditional Chinese',
        examples: 'Examples',
        outputPlaceholder: 'Translation will appear here...'
    }
};

// Extended dictionary for Chinese-English
const zhToEnDict = {
    '你好': 'Hello',
    '謝謝': 'Thank you',
    '再見': 'Goodbye',
    '早安': 'Good morning',
    '午安': 'Good afternoon',
    '晚安': 'Good night',
    '對不起': 'Sorry',
    '沒關係': "That's okay",
    '請': 'Please',
    '是': 'Yes',
    '不是': 'No',
    '好': 'Good / Okay',
    '我': 'I',
    '你': 'You',
    '他': 'He',
    '她': 'She',
    '我們': 'We',
    '他們': 'They',
    '今天': 'Today',
    '明天': 'Tomorrow',
    '昨天': 'Yesterday',
    '天氣': 'Weather',
    '很好': 'Very good',
    '學習': 'Study / Learn',
    '工作': 'Work',
    '程式設計': 'Programming',
    '電腦': 'Computer',
    '手機': 'Mobile phone',
    '網路': 'Internet',
    '人工智慧': 'Artificial Intelligence',
    '機器學習': 'Machine Learning',
    '愛': 'Love',
    '喜歡': 'Like',
    '吃': 'Eat',
    '喝': 'Drink',
    '看': 'See / Watch',
    '聽': 'Listen',
    '說': 'Speak',
    '寫': 'Write',
    '讀': 'Read',
    '走': 'Walk',
    '跑': 'Run',
    '時間': 'Time',
    '地方': 'Place',
    '問題': 'Question / Problem',
    '答案': 'Answer',
    '今天天氣很好': 'The weather is nice today',
    '我喜歡程式設計': 'I love programming',
    '學習永遠不嫌晚': "It's never too late to learn",
    '謝謝你的幫助': 'Thank you for your help',
    '這是什麼': 'What is this',
    '你好嗎': 'How are you',
    '我很好': "I'm fine",
    '很高興認識你': 'Nice to meet you'
};

const enToZhDict = {};
// Build reverse dictionary
Object.entries(zhToEnDict).forEach(([zh, en]) => {
    enToZhDict[en.toLowerCase()] = zh;
});

// Additional English phrases
Object.assign(enToZhDict, {
    'hello': '你好',
    'hi': '嗨',
    'thank you': '謝謝',
    'thanks': '謝謝',
    'goodbye': '再見',
    'bye': '再見',
    'good morning': '早安',
    'good afternoon': '午安',
    'good night': '晚安',
    'sorry': '對不起',
    'please': '請',
    'yes': '是',
    'no': '不是',
    'i love you': '我愛你',
    'i like': '我喜歡',
    'how are you': '你好嗎',
    "i'm fine": '我很好',
    'nice to meet you': '很高興認識你',
    'what is this': '這是什麼',
    'where is': '在哪裡',
    'when': '什麼時候',
    'why': '為什麼',
    'how': '如何',
    'i love programming': '我喜歡程式設計',
    "it's never too late to learn": '學習永遠不嫌晚',
    'the weather is nice today': '今天天氣很好',
    'artificial intelligence': '人工智慧',
    'machine learning': '機器學習',
    'computer': '電腦',
    'internet': '網路',
    'programming': '程式設計'
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
    document.querySelectorAll('.tab-btn')[0].textContent = t('zhToEn');
    document.querySelectorAll('.tab-btn')[1].textContent = t('enToZh');
    document.getElementById('sourceText').placeholder = t('placeholder');
    document.getElementById('translateBtn').textContent = t('translateBtn');
    document.getElementById('clearBtn').textContent = t('clear');
    document.getElementById('copyBtn').textContent = t('copy');
    document.querySelector('.options-panel h3').textContent = t('options');
    document.querySelector('.examples-section h3').textContent = t('examples');
}

function translateZhToEn(text) {
    // Try exact match first
    if (zhToEnDict[text]) {
        return zhToEnDict[text];
    }

    // Try word-by-word
    let result = text;
    Object.entries(zhToEnDict).forEach(([zh, en]) => {
        if (text.includes(zh)) {
            result = result.replace(zh, en);
        }
    });

    if (result === text) {
        return `[Translation: ${text}]`;
    }
    return result;
}

function translateEnToZh(text) {
    const lowerText = text.toLowerCase().trim();

    // Try exact match
    if (enToZhDict[lowerText]) {
        const result = enToZhDict[lowerText];
        return document.getElementById('traditionalChinese').checked ? result : toSimplified(result);
    }

    // Try phrase matching
    let result = text;
    const sortedPhrases = Object.entries(enToZhDict).sort((a, b) => b[0].length - a[0].length);

    sortedPhrases.forEach(([en, zh]) => {
        const regex = new RegExp(en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        if (regex.test(result)) {
            const translation = document.getElementById('traditionalChinese').checked ? zh : toSimplified(zh);
            result = result.replace(regex, translation);
        }
    });

    if (result === text) {
        return `[翻譯: ${text}]`;
    }
    return result;
}

function toSimplified(text) {
    const map = {
        '謝': '谢', '說': '说', '學': '学', '機': '机', '電': '电',
        '腦': '脑', '網': '网', '絡': '络', '設': '设', '計': '计',
        '認': '认', '識': '识', '題': '题', '問': '问', '個': '个',
        '開': '开', '關': '关', '時': '时', '間': '间', '見': '见',
        '對': '对', '請': '请', '聽': '听', '寫': '写', '讀': '读',
        '這': '这', '裡': '里', '嗎': '吗', '麼': '么', '會': '会',
        '愛': '爱', '歡': '欢', '氣': '气', '業': '业', '與': '与'
    };
    return text.split('').map(char => map[char] || char).join('');
}

function translate(text) {
    if (!text.trim()) return '';

    if (direction === 'zh-en') {
        return translateZhToEn(text);
    } else {
        return translateEnToZh(text);
    }
}

function updateCharCount() {
    const sourceText = document.getElementById('sourceText').value;
    const targetText = document.getElementById('targetText').textContent;
    document.getElementById('charCount').textContent = `${sourceText.length} ${t('chars')}`;
    document.getElementById('resultCount').textContent = `${targetText.length} ${t('chars')}`;
}

function init() {
    setLanguage(navigator.language.startsWith('zh') ? 'zh-TW' : 'en');

    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    // Direction tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            direction = btn.dataset.dir;
        });
    });

    const sourceText = document.getElementById('sourceText');
    const targetText = document.getElementById('targetText');

    sourceText.addEventListener('input', updateCharCount);

    document.getElementById('translateBtn').addEventListener('click', () => {
        const text = sourceText.value.trim();
        if (!text) return;
        targetText.textContent = translate(text);
        updateCharCount();
    });

    document.getElementById('clearBtn').addEventListener('click', () => {
        sourceText.value = '';
        targetText.textContent = '';
        updateCharCount();
    });

    document.getElementById('copyBtn').addEventListener('click', () => {
        if (targetText.textContent) {
            navigator.clipboard.writeText(targetText.textContent);
        }
    });

    // Example clicks
    document.querySelectorAll('.example-item').forEach(item => {
        item.addEventListener('click', () => {
            sourceText.value = item.dataset.text;
            direction = item.dataset.dir;
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.dir === direction);
            });
            document.getElementById('translateBtn').click();
        });
    });
}

init();
