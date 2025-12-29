/**
 * Web Translation - Tool #129
 * Translate entire web page content
 */

let currentLang = 'zh-TW';
let translatedHTML = '';

const i18n = {
    'zh-TW': {
        title: '網頁即時翻譯',
        subtitle: '翻譯整個網頁內容',
        inputLabel: '貼上網頁 HTML 內容',
        placeholder: '貼上網頁的 HTML 原始碼...',
        translateBtn: '翻譯網頁',
        result: '翻譯結果',
        preview: '預覽',
        copyHtml: '複製 HTML',
        code: '原始碼',
        translateAlt: '翻譯圖片 alt 屬性',
        translateTitle: '翻譯 title 屬性',
        skipCode: '跳過程式碼區塊',
        elements: '元素',
        translated: '已翻譯'
    },
    'en': {
        title: 'Web Translation',
        subtitle: 'Translate entire web pages',
        inputLabel: 'Paste HTML content',
        placeholder: 'Paste web page HTML source code...',
        translateBtn: 'Translate Page',
        result: 'Translation Result',
        preview: 'Preview',
        copyHtml: 'Copy HTML',
        code: 'Source Code',
        translateAlt: 'Translate alt attributes',
        translateTitle: 'Translate title attributes',
        skipCode: 'Skip code blocks',
        elements: 'elements',
        translated: 'translated'
    }
};

// Translation dictionary
const translations = {
    zh: {
        en: {
            '首頁': 'Home', '關於': 'About', '聯絡': 'Contact',
            '產品': 'Products', '服務': 'Services', '新聞': 'News',
            '登入': 'Login', '註冊': 'Register', '搜尋': 'Search',
            '更多': 'More', '了解更多': 'Learn More', '立即購買': 'Buy Now',
            '提交': 'Submit', '取消': 'Cancel', '確認': 'Confirm',
            '你好': 'Hello', '謝謝': 'Thank you', '歡迎': 'Welcome'
        }
    },
    en: {
        zh: {
            'home': '首頁', 'about': '關於', 'contact': '聯絡',
            'products': '產品', 'services': '服務', 'news': '新聞',
            'login': '登入', 'register': '註冊', 'search': '搜尋',
            'more': '更多', 'learn more': '了解更多', 'buy now': '立即購買',
            'submit': '提交', 'cancel': '取消', 'confirm': '確認',
            'hello': '你好', 'thank you': '謝謝', 'welcome': '歡迎'
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
    document.querySelector('.url-input-group label').textContent = t('inputLabel');
    document.getElementById('htmlInput').placeholder = t('placeholder');
    document.getElementById('translateBtn').textContent = t('translateBtn');
}

function detectLanguage(text) {
    return /[\u4e00-\u9fff]/.test(text) ? 'zh' : 'en';
}

function translateText(text, sourceLang, targetLang) {
    if (!text.trim()) return text;
    if (sourceLang === targetLang) return text;

    const dict = translations[sourceLang]?.[targetLang] || {};
    let result = text;

    // Sort by length (longer first)
    const sortedTerms = Object.entries(dict).sort((a, b) => b[0].length - a[0].length);

    sortedTerms.forEach(([source, target]) => {
        const regex = new RegExp(source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        result = result.replace(regex, target);
    });

    return result;
}

function translateHTML(html, options) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const sourceLang = document.getElementById('sourceLang').value;
    const targetLang = document.getElementById('targetLang').value;

    let elementCount = 0;
    let translatedCount = 0;

    // Skip these tags
    const skipTags = ['SCRIPT', 'STYLE', 'NOSCRIPT'];
    if (options.skipCode) {
        skipTags.push('CODE', 'PRE', 'KBD', 'SAMP');
    }

    // Walk through text nodes
    const walker = document.createTreeWalker(
        doc.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    const textNodes = [];
    while (walker.nextNode()) {
        textNodes.push(walker.currentNode);
    }

    textNodes.forEach(node => {
        if (skipTags.includes(node.parentElement?.tagName)) return;

        const originalText = node.textContent;
        if (!originalText.trim()) return;

        elementCount++;
        const detectedLang = sourceLang === 'auto' ? detectLanguage(originalText) : sourceLang;
        const translated = translateText(originalText, detectedLang, targetLang);

        if (translated !== originalText) {
            node.textContent = translated;
            translatedCount++;
        }
    });

    // Translate alt attributes
    if (options.translateAlt) {
        doc.querySelectorAll('[alt]').forEach(el => {
            const alt = el.getAttribute('alt');
            if (alt) {
                elementCount++;
                const detectedLang = sourceLang === 'auto' ? detectLanguage(alt) : sourceLang;
                const translated = translateText(alt, detectedLang, targetLang);
                if (translated !== alt) {
                    el.setAttribute('alt', translated);
                    translatedCount++;
                }
            }
        });
    }

    // Translate title attributes
    if (options.translateTitle) {
        doc.querySelectorAll('[title]').forEach(el => {
            const title = el.getAttribute('title');
            if (title) {
                elementCount++;
                const detectedLang = sourceLang === 'auto' ? detectLanguage(title) : sourceLang;
                const translated = translateText(title, detectedLang, targetLang);
                if (translated !== title) {
                    el.setAttribute('title', translated);
                    translatedCount++;
                }
            }
        });
    }

    return {
        html: doc.documentElement.outerHTML,
        elementCount,
        translatedCount
    };
}

function escapeHTML(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function init() {
    setLanguage(navigator.language.startsWith('zh') ? 'zh-TW' : 'en');

    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    document.getElementById('translateBtn').addEventListener('click', () => {
        const html = document.getElementById('htmlInput').value.trim();
        if (!html) return;

        const options = {
            translateAlt: document.getElementById('translateAlt').checked,
            translateTitle: document.getElementById('translateTitle').checked,
            skipCode: document.getElementById('skipCode').checked
        };

        const result = translateHTML(html, options);
        translatedHTML = result.html;

        document.getElementById('codeOutput').textContent = translatedHTML;
        document.getElementById('previewOutput').innerHTML = translatedHTML;

        document.getElementById('stats').innerHTML = `
            <span>${t('elements')}: ${result.elementCount}</span>
            <span>${t('translated')}: ${result.translatedCount}</span>
        `;

        document.getElementById('outputSection').style.display = 'block';
    });

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const tab = btn.dataset.tab;
            document.getElementById('codeOutput').style.display = tab === 'code' ? 'block' : 'none';
            document.getElementById('previewOutput').style.display = tab === 'preview' ? 'block' : 'none';
        });
    });

    document.getElementById('copyBtn').addEventListener('click', () => {
        if (translatedHTML) {
            navigator.clipboard.writeText(translatedHTML);
        }
    });

    document.getElementById('previewBtn').addEventListener('click', () => {
        document.querySelector('[data-tab="preview"]').click();
    });
}

init();
