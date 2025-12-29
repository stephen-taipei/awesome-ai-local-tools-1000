/**
 * Real-time Translation - Tool #126
 * Live translation as you type
 */

let currentLang = 'zh-TW';
let translateTimeout = null;

const i18n = {
    'zh-TW': {
        title: '即時翻譯',
        subtitle: '邊打字邊翻譯',
        sourceLang: '來源語言',
        targetLang: '目標語言',
        inputLabel: '輸入文字',
        outputLabel: '翻譯結果',
        placeholder: '開始輸入文字...',
        outputPlaceholder: '翻譯結果將顯示在這裡...',
        delay: '翻譯延遲',
        autoDetect: '自動偵測語言',
        instant: '即時'
    },
    'en': {
        title: 'Real-time Translation',
        subtitle: 'Translate as you type',
        sourceLang: 'Source',
        targetLang: 'Target',
        inputLabel: 'Input',
        outputLabel: 'Translation',
        placeholder: 'Start typing...',
        outputPlaceholder: 'Translation will appear here...',
        delay: 'Delay',
        autoDetect: 'Auto-detect language',
        instant: 'Instant'
    }
};

// Simple translation dictionary
const translations = {
    zh: {
        en: {
            '你好': 'Hello', '謝謝': 'Thank you', '再見': 'Goodbye',
            '早安': 'Good morning', '晚安': 'Good night', '對不起': 'Sorry',
            '我': 'I', '你': 'You', '他': 'He', '她': 'She',
            '是': 'Yes', '不是': 'No', '好': 'Good', '壞': 'Bad',
            '愛': 'Love', '喜歡': 'Like', '今天': 'Today', '明天': 'Tomorrow'
        },
        ja: {
            '你好': 'こんにちは', '謝謝': 'ありがとう', '再見': 'さようなら',
            '早安': 'おはよう', '晚安': 'おやすみ', '對不起': 'ごめんなさい'
        },
        ko: {
            '你好': '안녕하세요', '謝謝': '감사합니다', '再見': '안녕히 가세요',
            '早安': '좋은 아침', '晚安': '안녕히 주무세요', '對不起': '미안합니다'
        }
    },
    en: {
        zh: {
            'hello': '你好', 'thank you': '謝謝', 'goodbye': '再見',
            'good morning': '早安', 'good night': '晚安', 'sorry': '對不起',
            'i': '我', 'you': '你', 'he': '他', 'she': '她',
            'yes': '是', 'no': '不是', 'good': '好', 'bad': '壞',
            'love': '愛', 'like': '喜歡', 'today': '今天', 'tomorrow': '明天'
        },
        ja: {
            'hello': 'こんにちは', 'thank you': 'ありがとう', 'goodbye': 'さようなら'
        },
        ko: {
            'hello': '안녕하세요', 'thank you': '감사합니다', 'goodbye': '안녕히 가세요'
        }
    },
    ja: {
        zh: {
            'こんにちは': '你好', 'ありがとう': '謝謝', 'さようなら': '再見'
        },
        en: {
            'こんにちは': 'Hello', 'ありがとう': 'Thank you', 'さようなら': 'Goodbye'
        }
    },
    ko: {
        zh: {
            '안녕하세요': '你好', '감사합니다': '謝謝', '안녕히 가세요': '再見'
        },
        en: {
            '안녕하세요': 'Hello', '감사합니다': 'Thank you', '안녕히 가세요': 'Goodbye'
        }
    }
};

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
    document.getElementById('sourceText').placeholder = t('placeholder');
}

function detectLanguage(text) {
    if (/[\u4e00-\u9fff]/.test(text)) return 'zh';
    if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) return 'ja';
    if (/[\uac00-\ud7af]/.test(text)) return 'ko';
    return 'en';
}

function translate(text, sourceLang, targetLang) {
    if (!text.trim()) return '';

    // Auto-detect
    if (sourceLang === 'auto') {
        sourceLang = detectLanguage(text);
    }

    if (sourceLang === targetLang) return text;

    const dict = translations[sourceLang]?.[targetLang] || {};
    let result = text;

    // Sort by length (longer first)
    const sortedTerms = Object.entries(dict).sort((a, b) => b[0].length - a[0].length);

    sortedTerms.forEach(([source, target]) => {
        const regex = new RegExp(source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        result = result.replace(regex, target);
    });

    if (result === text) {
        return `[${targetLang.toUpperCase()}: ${text}]`;
    }

    return result;
}

function performTranslation() {
    const sourceText = document.getElementById('sourceText').value;
    const sourceLang = document.getElementById('sourceLang').value;
    const targetLang = document.getElementById('targetLang').value;

    const statusIndicator = document.getElementById('statusIndicator');
    statusIndicator.classList.add('active');

    const result = translate(sourceText, sourceLang, targetLang);
    document.getElementById('targetText').textContent = result;
    document.getElementById('targetCount').textContent = result.length;

    setTimeout(() => {
        statusIndicator.classList.remove('active');
    }, 300);
}

function init() {
    setLanguage(navigator.language.startsWith('zh') ? 'zh-TW' : 'en');

    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    const sourceText = document.getElementById('sourceText');

    sourceText.addEventListener('input', () => {
        document.getElementById('sourceCount').textContent = sourceText.value.length;

        const delay = parseInt(document.getElementById('delaySelect').value);

        if (translateTimeout) {
            clearTimeout(translateTimeout);
        }

        if (delay === 0) {
            performTranslation();
        } else {
            translateTimeout = setTimeout(performTranslation, delay);
        }
    });

    document.getElementById('swapBtn').addEventListener('click', () => {
        const sourceSelect = document.getElementById('sourceLang');
        const targetSelect = document.getElementById('targetLang');

        if (sourceSelect.value === 'auto') return;

        const temp = sourceSelect.value;
        sourceSelect.value = targetSelect.value;
        targetSelect.value = temp;

        // Also swap text
        const tempText = sourceText.value;
        sourceText.value = document.getElementById('targetText').textContent;
        document.getElementById('targetText').textContent = tempText;

        document.getElementById('sourceCount').textContent = sourceText.value.length;
    });

    document.getElementById('clearBtn').addEventListener('click', () => {
        sourceText.value = '';
        document.getElementById('targetText').textContent = '';
        document.getElementById('sourceCount').textContent = '0';
        document.getElementById('targetCount').textContent = '0';
    });

    document.getElementById('copyBtn').addEventListener('click', () => {
        const text = document.getElementById('targetText').textContent;
        if (text) {
            navigator.clipboard.writeText(text);
        }
    });
}

init();
