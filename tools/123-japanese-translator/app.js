/**
 * Japanese Translator - Tool #123
 * Japanese-Chinese-English translation
 */

let currentLang = 'zh-TW';

const i18n = {
    'zh-TW': {
        title: '日語翻譯器',
        subtitle: '中日、英日互譯',
        translateBtn: '翻譯',
        placeholder: '輸入文字...',
        chars: '字',
        clear: '清除',
        copy: '複製',
        showRomaji: '顯示羅馬拼音',
        politeForm: '敬語形式',
        phrases: '常用日語',
        romaji: '羅馬拼音：'
    },
    'en': {
        title: 'Japanese Translator',
        subtitle: 'Japanese-Chinese-English',
        translateBtn: 'Translate',
        placeholder: 'Enter text...',
        chars: 'chars',
        clear: 'Clear',
        copy: 'Copy',
        showRomaji: 'Show Romaji',
        politeForm: 'Polite form',
        phrases: 'Common Japanese',
        romaji: 'Romaji: '
    }
};

// Japanese dictionary with romaji
const jaDict = {
    'こんにちは': { zh: '你好', en: 'Hello', romaji: 'konnichiwa' },
    'ありがとう': { zh: '謝謝', en: 'Thank you', romaji: 'arigatou' },
    'ありがとうございます': { zh: '非常感謝', en: 'Thank you very much', romaji: 'arigatou gozaimasu' },
    'さようなら': { zh: '再見', en: 'Goodbye', romaji: 'sayounara' },
    'おはよう': { zh: '早安', en: 'Good morning', romaji: 'ohayou' },
    'おはようございます': { zh: '早安（敬語）', en: 'Good morning (polite)', romaji: 'ohayou gozaimasu' },
    'こんばんは': { zh: '晚上好', en: 'Good evening', romaji: 'konbanwa' },
    'おやすみなさい': { zh: '晚安', en: 'Good night', romaji: 'oyasuminasai' },
    'すみません': { zh: '對不起/不好意思', en: 'Excuse me / Sorry', romaji: 'sumimasen' },
    'ごめんなさい': { zh: '對不起', en: 'I\'m sorry', romaji: 'gomen nasai' },
    'お願いします': { zh: '拜託了', en: 'Please', romaji: 'onegaishimasu' },
    'はい': { zh: '是', en: 'Yes', romaji: 'hai' },
    'いいえ': { zh: '不是', en: 'No', romaji: 'iie' },
    '私': { zh: '我', en: 'I', romaji: 'watashi' },
    'あなた': { zh: '你', en: 'You', romaji: 'anata' },
    '愛': { zh: '愛', en: 'Love', romaji: 'ai' },
    '愛しています': { zh: '我愛你', en: 'I love you', romaji: 'aishiteimasu' },
    '好き': { zh: '喜歡', en: 'Like', romaji: 'suki' },
    '食べる': { zh: '吃', en: 'Eat', romaji: 'taberu' },
    '飲む': { zh: '喝', en: 'Drink', romaji: 'nomu' },
    '行く': { zh: '去', en: 'Go', romaji: 'iku' },
    '来る': { zh: '來', en: 'Come', romaji: 'kuru' },
    '見る': { zh: '看', en: 'See', romaji: 'miru' },
    '聞く': { zh: '聽', en: 'Listen', romaji: 'kiku' },
    '話す': { zh: '說話', en: 'Speak', romaji: 'hanasu' },
    '日本': { zh: '日本', en: 'Japan', romaji: 'nihon' },
    '日本語': { zh: '日語', en: 'Japanese', romaji: 'nihongo' },
    '英語': { zh: '英語', en: 'English', romaji: 'eigo' },
    '中国語': { zh: '中文', en: 'Chinese', romaji: 'chuugokugo' }
};

const zhToJaDict = {
    '你好': { ja: 'こんにちは', romaji: 'konnichiwa' },
    '謝謝': { ja: 'ありがとう', romaji: 'arigatou' },
    '再見': { ja: 'さようなら', romaji: 'sayounara' },
    '早安': { ja: 'おはよう', romaji: 'ohayou' },
    '晚安': { ja: 'おやすみなさい', romaji: 'oyasuminasai' },
    '對不起': { ja: 'ごめんなさい', romaji: 'gomen nasai' },
    '是': { ja: 'はい', romaji: 'hai' },
    '不是': { ja: 'いいえ', romaji: 'iie' },
    '我': { ja: '私', romaji: 'watashi' },
    '你': { ja: 'あなた', romaji: 'anata' },
    '愛': { ja: '愛', romaji: 'ai' },
    '我愛你': { ja: '愛しています', romaji: 'aishiteimasu' },
    '喜歡': { ja: '好き', romaji: 'suki' },
    '日本': { ja: '日本', romaji: 'nihon' },
    '日語': { ja: '日本語', romaji: 'nihongo' }
};

const enToJaDict = {
    'hello': { ja: 'こんにちは', romaji: 'konnichiwa' },
    'thank you': { ja: 'ありがとう', romaji: 'arigatou' },
    'goodbye': { ja: 'さようなら', romaji: 'sayounara' },
    'good morning': { ja: 'おはよう', romaji: 'ohayou' },
    'good night': { ja: 'おやすみなさい', romaji: 'oyasuminasai' },
    'sorry': { ja: 'ごめんなさい', romaji: 'gomen nasai' },
    'yes': { ja: 'はい', romaji: 'hai' },
    'no': { ja: 'いいえ', romaji: 'iie' },
    'i love you': { ja: '愛しています', romaji: 'aishiteimasu' },
    'like': { ja: '好き', romaji: 'suki' },
    'japan': { ja: '日本', romaji: 'nihon' },
    'japanese': { ja: '日本語', romaji: 'nihongo' }
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
    if (!text.trim()) return { text: '', romaji: '' };

    let result = '';
    let romaji = '';

    // Japanese to other
    if (sourceLang === 'ja') {
        if (jaDict[text]) {
            result = targetLang === 'zh' ? jaDict[text].zh : jaDict[text].en;
            romaji = jaDict[text].romaji;
        } else {
            result = `[${targetLang === 'zh' ? '翻譯' : 'Translation'}: ${text}]`;
        }
    }
    // Chinese to Japanese
    else if (sourceLang === 'zh') {
        if (targetLang === 'ja') {
            if (zhToJaDict[text]) {
                result = zhToJaDict[text].ja;
                romaji = zhToJaDict[text].romaji;
            } else {
                result = `[日本語: ${text}]`;
            }
        } else {
            result = `[English: ${text}]`;
        }
    }
    // English to Japanese
    else if (sourceLang === 'en') {
        const lowerText = text.toLowerCase().trim();
        if (targetLang === 'ja') {
            if (enToJaDict[lowerText]) {
                result = enToJaDict[lowerText].ja;
                romaji = enToJaDict[lowerText].romaji;
            } else {
                result = `[日本語: ${text}]`;
            }
        } else {
            result = `[中文: ${text}]`;
        }
    }

    return { text: result, romaji };
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
    const romajiSection = document.getElementById('romajiSection');
    const romajiText = document.getElementById('romajiText');

    sourceText.addEventListener('input', updateCharCount);

    document.getElementById('translateBtn').addEventListener('click', () => {
        const text = sourceText.value.trim();
        if (!text) return;

        const sourceLang = document.getElementById('sourceLanguage').value;
        const targetLang = document.getElementById('targetLanguage').value;
        const showRomaji = document.getElementById('showRomaji').checked;

        const result = translate(text, sourceLang, targetLang);
        targetText.textContent = result.text;

        if (showRomaji && result.romaji) {
            romajiSection.style.display = 'block';
            romajiText.textContent = result.romaji;
        } else {
            romajiSection.style.display = 'none';
        }

        updateCharCount();
    });

    document.getElementById('clearBtn').addEventListener('click', () => {
        sourceText.value = '';
        targetText.textContent = '';
        romajiSection.style.display = 'none';
        updateCharCount();
    });

    document.getElementById('copyBtn').addEventListener('click', () => {
        if (targetText.textContent) {
            navigator.clipboard.writeText(targetText.textContent);
        }
    });

    document.querySelectorAll('.phrase-card').forEach(card => {
        card.addEventListener('click', () => {
            const ja = card.dataset.ja;
            const romaji = card.dataset.romaji;
            document.getElementById('sourceLanguage').value = 'ja';
            document.getElementById('targetLanguage').value = 'zh';
            sourceText.value = ja;
            document.getElementById('translateBtn').click();
        });
    });
}

init();
