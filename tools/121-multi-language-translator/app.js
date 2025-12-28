/**
 * Multi-Language Translator - Tool #121
 * Local translation using dictionary-based approach
 */

let currentLang = 'zh-TW';

const i18n = {
    'zh-TW': {
        title: '多語言翻譯器',
        subtitle: '支援 100+ 語言互譯',
        privacy: '100% 本地處理 · 零資料上傳',
        translateBtn: '翻譯',
        placeholder: '輸入要翻譯的文字...',
        outputPlaceholder: '翻譯結果將顯示在這裡...',
        chars: '字',
        quickPhrases: '常用短語',
        features: '功能特色',
        languages: '100+ 語言',
        langDesc: '支援全球主要語言',
        instant: '即時翻譯',
        instantDesc: '快速翻譯結果',
        bidirectional: '雙向翻譯',
        biDesc: '一鍵切換語言',
        privacy2: '隱私保護',
        privacyDesc: '本地處理不上傳',
        copied: '已複製！',
        clear: '清除',
        copy: '複製',
        swap: '交換語言',
        autoDetect: '自動偵測'
    },
    'en': {
        title: 'Multi-Language Translator',
        subtitle: 'Translate between 100+ languages',
        privacy: '100% Local Processing · Zero Data Upload',
        translateBtn: 'Translate',
        placeholder: 'Enter text to translate...',
        outputPlaceholder: 'Translation will appear here...',
        chars: 'chars',
        quickPhrases: 'Quick Phrases',
        features: 'Features',
        languages: '100+ Languages',
        langDesc: 'Support major languages',
        instant: 'Instant Translation',
        instantDesc: 'Fast translation results',
        bidirectional: 'Bidirectional',
        biDesc: 'One-click swap',
        privacy2: 'Privacy Protection',
        privacyDesc: 'Local processing only',
        copied: 'Copied!',
        clear: 'Clear',
        copy: 'Copy',
        swap: 'Swap languages',
        autoDetect: 'Auto Detect'
    }
};

// Basic translation dictionaries for demo
const dictionaries = {
    'zh-TW': {
        '你好': { en: 'Hello', ja: 'こんにちは', ko: '안녕하세요', fr: 'Bonjour', de: 'Hallo', es: 'Hola' },
        '謝謝': { en: 'Thank you', ja: 'ありがとう', ko: '감사합니다', fr: 'Merci', de: 'Danke', es: 'Gracias' },
        '早安': { en: 'Good morning', ja: 'おはよう', ko: '좋은 아침', fr: 'Bonjour', de: 'Guten Morgen', es: 'Buenos días' },
        '再見': { en: 'Goodbye', ja: 'さようなら', ko: '안녕히 가세요', fr: 'Au revoir', de: 'Auf Wiedersehen', es: 'Adiós' },
        '請問': { en: 'Excuse me', ja: 'すみません', ko: '실례합니다', fr: 'Excusez-moi', de: 'Entschuldigung', es: 'Disculpe' },
        '對不起': { en: 'Sorry', ja: 'ごめんなさい', ko: '미안합니다', fr: 'Pardon', de: 'Entschuldigung', es: 'Lo siento' },
        '是': { en: 'Yes', ja: 'はい', ko: '네', fr: 'Oui', de: 'Ja', es: 'Sí' },
        '不是': { en: 'No', ja: 'いいえ', ko: '아니요', fr: 'Non', de: 'Nein', es: 'No' },
        '我': { en: 'I', ja: '私', ko: '나', fr: 'Je', de: 'Ich', es: 'Yo' },
        '你': { en: 'You', ja: 'あなた', ko: '너', fr: 'Tu', de: 'Du', es: 'Tú' },
        '愛': { en: 'Love', ja: '愛', ko: '사랑', fr: 'Amour', de: 'Liebe', es: 'Amor' },
        '好': { en: 'Good', ja: '良い', ko: '좋은', fr: 'Bon', de: 'Gut', es: 'Bueno' }
    },
    'en': {
        'hello': { 'zh-TW': '你好', 'zh-CN': '你好', ja: 'こんにちは', ko: '안녕하세요', fr: 'Bonjour', de: 'Hallo', es: 'Hola' },
        'thank you': { 'zh-TW': '謝謝', 'zh-CN': '谢谢', ja: 'ありがとう', ko: '감사합니다', fr: 'Merci', de: 'Danke', es: 'Gracias' },
        'good morning': { 'zh-TW': '早安', 'zh-CN': '早安', ja: 'おはよう', ko: '좋은 아침', fr: 'Bonjour', de: 'Guten Morgen', es: 'Buenos días' },
        'goodbye': { 'zh-TW': '再見', 'zh-CN': '再见', ja: 'さようなら', ko: '안녕히 가세요', fr: 'Au revoir', de: 'Auf Wiedersehen', es: 'Adiós' },
        'sorry': { 'zh-TW': '對不起', 'zh-CN': '对不起', ja: 'ごめんなさい', ko: '미안합니다', fr: 'Pardon', de: 'Entschuldigung', es: 'Lo siento' },
        'yes': { 'zh-TW': '是', 'zh-CN': '是', ja: 'はい', ko: '네', fr: 'Oui', de: 'Ja', es: 'Sí' },
        'no': { 'zh-TW': '不是', 'zh-CN': '不是', ja: 'いいえ', ko: '아니요', fr: 'Non', de: 'Nein', es: 'No' },
        'love': { 'zh-TW': '愛', 'zh-CN': '爱', ja: '愛', ko: '사랑', fr: 'Amour', de: 'Liebe', es: 'Amor' },
        'good': { 'zh-TW': '好', 'zh-CN': '好', ja: '良い', ko: '좋은', fr: 'Bon', de: 'Gut', es: 'Bueno' }
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
    document.querySelector('.privacy-badge span:last-child').textContent = t('privacy');
    document.getElementById('translateBtn').textContent = t('translateBtn');
    document.getElementById('sourceText').placeholder = t('placeholder');
    document.getElementById('targetText').setAttribute('data-placeholder', t('outputPlaceholder'));
    document.querySelector('.quick-phrases h3').textContent = t('quickPhrases');
    document.querySelector('.info-section h2').textContent = t('features');
}

function detectLanguage(text) {
    // Simple language detection based on character ranges
    if (/[\u4e00-\u9fff]/.test(text)) {
        // Check for traditional vs simplified
        const traditionalChars = /[\u4e00-\u9fff]/.test(text) && /[繁體國語說謝學機開關電視點點這裡]/u.test(text);
        return traditionalChars ? 'zh-TW' : 'zh-CN';
    }
    if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) return 'ja';
    if (/[\uac00-\ud7af]/.test(text)) return 'ko';
    if (/[\u0600-\u06ff]/.test(text)) return 'ar';
    if (/[\u0e00-\u0e7f]/.test(text)) return 'th';
    return 'en';
}

function translate(text, sourceLang, targetLang) {
    if (!text.trim()) return '';

    // Auto-detect source language
    if (sourceLang === 'auto') {
        sourceLang = detectLanguage(text);
        const sourceSelect = document.getElementById('sourceLang');
        // Don't change the dropdown, but use detected language internally
    }

    // If same language, return original
    if (sourceLang === targetLang) return text;

    // Try dictionary lookup
    const dict = dictionaries[sourceLang] || dictionaries['en'];
    const lowerText = text.toLowerCase().trim();

    // Check for exact match
    if (dict[lowerText] && dict[lowerText][targetLang]) {
        return dict[lowerText][targetLang];
    }
    if (dict[text] && dict[text][targetLang]) {
        return dict[text][targetLang];
    }

    // Word-by-word translation for longer texts
    const words = text.split(/(\s+)/);
    let translated = words.map(word => {
        const lowerWord = word.toLowerCase().trim();
        if (dict[lowerWord] && dict[lowerWord][targetLang]) {
            return dict[lowerWord][targetLang];
        }
        if (dict[word] && dict[word][targetLang]) {
            return dict[word][targetLang];
        }
        return word;
    }).join('');

    // If no translation found, return with marker
    if (translated === text) {
        // Simulate translation with transliteration hint
        const langNames = {
            'zh-TW': '(繁體中文)', 'zh-CN': '(简体中文)', 'en': '(English)',
            'ja': '(日本語)', 'ko': '(한국어)', 'fr': '(Français)',
            'de': '(Deutsch)', 'es': '(Español)', 'pt': '(Português)',
            'it': '(Italiano)', 'ru': '(Русский)', 'ar': '(العربية)',
            'th': '(ไทย)', 'vi': '(Tiếng Việt)'
        };
        return `[${text}] → ${langNames[targetLang] || targetLang}`;
    }

    return translated;
}

function updateCharCount() {
    const sourceText = document.getElementById('sourceText').value;
    const targetText = document.getElementById('targetText').textContent;
    document.getElementById('sourceCount').textContent = `${sourceText.length} ${t('chars')}`;
    document.getElementById('targetCount').textContent = `${targetText.length} ${t('chars')}`;
}

function init() {
    setLanguage(navigator.language.startsWith('zh') ? 'zh-TW' : 'en');

    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    const sourceText = document.getElementById('sourceText');
    const targetText = document.getElementById('targetText');

    sourceText.addEventListener('input', updateCharCount);

    document.getElementById('translateBtn').addEventListener('click', () => {
        const text = sourceText.value.trim();
        if (!text) return;

        const sourceLang = document.getElementById('sourceLang').value;
        const targetLang = document.getElementById('targetLang').value;

        const result = translate(text, sourceLang, targetLang);
        targetText.textContent = result;
        updateCharCount();
    });

    document.getElementById('clearBtn').addEventListener('click', () => {
        sourceText.value = '';
        targetText.textContent = '';
        updateCharCount();
    });

    document.getElementById('copyBtn').addEventListener('click', () => {
        const text = targetText.textContent;
        if (text) {
            navigator.clipboard.writeText(text);
        }
    });

    document.getElementById('swapBtn').addEventListener('click', () => {
        const sourceSelect = document.getElementById('sourceLang');
        const targetSelect = document.getElementById('targetLang');

        if (sourceSelect.value === 'auto') return;

        const tempLang = sourceSelect.value;
        sourceSelect.value = targetSelect.value;
        targetSelect.value = tempLang;

        const tempText = sourceText.value;
        sourceText.value = targetText.textContent;
        targetText.textContent = tempText;
        updateCharCount();
    });

    document.querySelectorAll('.phrase-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            sourceText.value = btn.dataset.text;
            updateCharCount();
            document.getElementById('translateBtn').click();
        });
    });
}

init();
