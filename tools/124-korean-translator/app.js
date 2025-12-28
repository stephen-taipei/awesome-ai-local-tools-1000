/**
 * Korean Translator - Tool #124
 * Korean-Chinese-English translation
 */

let currentLang = 'zh-TW';

const i18n = {
    'zh-TW': {
        title: '韓語翻譯器',
        subtitle: '中韓、英韓互譯',
        translateBtn: '翻譯',
        placeholder: '輸入文字...',
        chars: '字',
        clear: '清除',
        copy: '複製',
        showRoman: '顯示羅馬拼音',
        formalMode: '正式語氣',
        phrases: '常用韓語',
        roman: '羅馬拼音：'
    },
    'en': {
        title: 'Korean Translator',
        subtitle: 'Korean-Chinese-English',
        translateBtn: 'Translate',
        placeholder: 'Enter text...',
        chars: 'chars',
        clear: 'Clear',
        copy: 'Copy',
        showRoman: 'Show Romanization',
        formalMode: 'Formal mode',
        phrases: 'Common Korean',
        roman: 'Romanization: '
    }
};

const koDict = {
    '안녕하세요': { zh: '你好', en: 'Hello', roman: 'annyeonghaseyo' },
    '감사합니다': { zh: '謝謝', en: 'Thank you', roman: 'gamsahamnida' },
    '안녕히 가세요': { zh: '再見（對離開者說）', en: 'Goodbye (to one leaving)', roman: 'annyeonghi gaseyo' },
    '안녕히 계세요': { zh: '再見（對留下者說）', en: 'Goodbye (to one staying)', roman: 'annyeonghi gyeseyo' },
    '좋은 아침': { zh: '早安', en: 'Good morning', roman: 'joeun achim' },
    '안녕히 주무세요': { zh: '晚安', en: 'Good night', roman: 'annyeonghi jumuseyo' },
    '미안합니다': { zh: '對不起', en: 'I\'m sorry', roman: 'mianhamnida' },
    '죄송합니다': { zh: '抱歉（更正式）', en: 'I\'m sorry (formal)', roman: 'joesonghamnida' },
    '네': { zh: '是', en: 'Yes', roman: 'ne' },
    '아니요': { zh: '不是', en: 'No', roman: 'aniyo' },
    '사랑해요': { zh: '我愛你', en: 'I love you', roman: 'saranghaeyo' },
    '좋아해요': { zh: '我喜歡', en: 'I like', roman: 'joahaeyo' },
    '저': { zh: '我（謙稱）', en: 'I (humble)', roman: 'jeo' },
    '나': { zh: '我', en: 'I', roman: 'na' },
    '당신': { zh: '你', en: 'You', roman: 'dangsin' },
    '한국': { zh: '韓國', en: 'Korea', roman: 'hanguk' },
    '한국어': { zh: '韓語', en: 'Korean', roman: 'hangugeo' },
    '맛있어요': { zh: '好吃', en: 'Delicious', roman: 'masisseoyo' },
    '예쁘다': { zh: '漂亮', en: 'Pretty', roman: 'yeppeuda' },
    '화이팅': { zh: '加油', en: 'Fighting/Good luck', roman: 'hwaiting' }
};

const zhToKoDict = {
    '你好': { ko: '안녕하세요', roman: 'annyeonghaseyo' },
    '謝謝': { ko: '감사합니다', roman: 'gamsahamnida' },
    '再見': { ko: '안녕히 가세요', roman: 'annyeonghi gaseyo' },
    '早安': { ko: '좋은 아침', roman: 'joeun achim' },
    '晚安': { ko: '안녕히 주무세요', roman: 'annyeonghi jumuseyo' },
    '對不起': { ko: '미안합니다', roman: 'mianhamnida' },
    '是': { ko: '네', roman: 'ne' },
    '不是': { ko: '아니요', roman: 'aniyo' },
    '我愛你': { ko: '사랑해요', roman: 'saranghaeyo' },
    '喜歡': { ko: '좋아해요', roman: 'joahaeyo' },
    '韓國': { ko: '한국', roman: 'hanguk' },
    '韓語': { ko: '한국어', roman: 'hangugeo' },
    '好吃': { ko: '맛있어요', roman: 'masisseoyo' },
    '漂亮': { ko: '예쁘다', roman: 'yeppeuda' },
    '加油': { ko: '화이팅', roman: 'hwaiting' }
};

const enToKoDict = {
    'hello': { ko: '안녕하세요', roman: 'annyeonghaseyo' },
    'thank you': { ko: '감사합니다', roman: 'gamsahamnida' },
    'goodbye': { ko: '안녕히 가세요', roman: 'annyeonghi gaseyo' },
    'good morning': { ko: '좋은 아침', roman: 'joeun achim' },
    'good night': { ko: '안녕히 주무세요', roman: 'annyeonghi jumuseyo' },
    'sorry': { ko: '미안합니다', roman: 'mianhamnida' },
    'yes': { ko: '네', roman: 'ne' },
    'no': { ko: '아니요', roman: 'aniyo' },
    'i love you': { ko: '사랑해요', roman: 'saranghaeyo' },
    'korea': { ko: '한국', roman: 'hanguk' },
    'korean': { ko: '한국어', roman: 'hangugeo' },
    'delicious': { ko: '맛있어요', roman: 'masisseoyo' },
    'pretty': { ko: '예쁘다', roman: 'yeppeuda' },
    'fighting': { ko: '화이팅', roman: 'hwaiting' }
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
    document.getElementById('translateBtn').textContent = t('translateBtn');
    document.getElementById('sourceText').placeholder = t('placeholder');
    document.getElementById('clearBtn').textContent = t('clear');
    document.getElementById('copyBtn').textContent = t('copy');
    document.querySelector('.phrases-section h3').textContent = t('phrases');
}

function translate(text, sourceLang, targetLang) {
    if (!text.trim()) return { text: '', roman: '' };

    let result = '';
    let roman = '';

    if (sourceLang === 'ko') {
        if (koDict[text]) {
            result = targetLang === 'zh' ? koDict[text].zh : koDict[text].en;
            roman = koDict[text].roman;
        } else {
            result = `[${targetLang === 'zh' ? '翻譯' : 'Translation'}: ${text}]`;
        }
    } else if (sourceLang === 'zh') {
        if (targetLang === 'ko') {
            if (zhToKoDict[text]) {
                result = zhToKoDict[text].ko;
                roman = zhToKoDict[text].roman;
            } else {
                result = `[한국어: ${text}]`;
            }
        } else {
            result = `[English: ${text}]`;
        }
    } else if (sourceLang === 'en') {
        const lowerText = text.toLowerCase().trim();
        if (targetLang === 'ko') {
            if (enToKoDict[lowerText]) {
                result = enToKoDict[lowerText].ko;
                roman = enToKoDict[lowerText].roman;
            } else {
                result = `[한국어: ${text}]`;
            }
        } else {
            result = `[中文: ${text}]`;
        }
    }

    return { text: result, roman };
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
    const romanSection = document.getElementById('romanSection');
    const romanText = document.getElementById('romanText');

    sourceText.addEventListener('input', updateCharCount);

    document.getElementById('translateBtn').addEventListener('click', () => {
        const text = sourceText.value.trim();
        if (!text) return;

        const sourceLang = document.getElementById('sourceLanguage').value;
        const targetLang = document.getElementById('targetLanguage').value;
        const showRoman = document.getElementById('showRoman').checked;

        const result = translate(text, sourceLang, targetLang);
        targetText.textContent = result.text;

        if (showRoman && result.roman) {
            romanSection.style.display = 'block';
            romanText.textContent = result.roman;
        } else {
            romanSection.style.display = 'none';
        }

        updateCharCount();
    });

    document.getElementById('clearBtn').addEventListener('click', () => {
        sourceText.value = '';
        targetText.textContent = '';
        romanSection.style.display = 'none';
        updateCharCount();
    });

    document.getElementById('copyBtn').addEventListener('click', () => {
        if (targetText.textContent) {
            navigator.clipboard.writeText(targetText.textContent);
        }
    });

    document.querySelectorAll('.phrase-card').forEach(card => {
        card.addEventListener('click', () => {
            const ko = card.dataset.ko;
            document.getElementById('sourceLanguage').value = 'ko';
            document.getElementById('targetLanguage').value = 'zh';
            sourceText.value = ko;
            document.getElementById('translateBtn').click();
        });
    });
}

init();
