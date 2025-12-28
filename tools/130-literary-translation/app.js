/**
 * Literary Translation - Tool #130
 * Preserve literary style in translation
 */

let currentLang = 'zh-TW';

const i18n = {
    'zh-TW': {
        title: '文學翻譯助手',
        subtitle: '保留文學風格的翻譯',
        genre: '文學作品類型',
        style: '翻譯風格',
        poetry: '詩歌',
        novel: '小說',
        essay: '散文',
        drama: '戲劇',
        classical: '古典文學',
        literal: '直譯',
        literalDesc: '忠實原文',
        free: '意譯',
        freeDesc: '注重意境',
        poetic: '詩化',
        poeticDesc: '保留韻律',
        translateBtn: '翻譯',
        showAnnotation: '顯示翻譯註釋',
        preserveFormat: '保留格式排版',
        annotation: '翻譯註釋',
        examples: '經典文學範例',
        placeholder: '輸入文學作品...'
    },
    'en': {
        title: 'Literary Translation',
        subtitle: 'Preserve literary style',
        genre: 'Literary Genre',
        style: 'Translation Style',
        poetry: 'Poetry',
        novel: 'Novel',
        essay: 'Essay',
        drama: 'Drama',
        classical: 'Classical',
        literal: 'Literal',
        literalDesc: 'Faithful to original',
        free: 'Free',
        freeDesc: 'Focus on meaning',
        poetic: 'Poetic',
        poeticDesc: 'Preserve rhythm',
        translateBtn: 'Translate',
        showAnnotation: 'Show annotations',
        preserveFormat: 'Preserve formatting',
        annotation: 'Translation Notes',
        examples: 'Classic Examples',
        placeholder: 'Enter literary work...'
    }
};

// Literary translations with annotations
const literaryTranslations = {
    zh: {
        en: {
            '床前明月光，疑是地上霜。舉頭望明月，低頭思故鄉。': {
                literal: 'Before my bed, bright moonlight gleams,\nI thought it was frost on the ground.\nRaising my head, I gaze at the bright moon,\nLowering my head, I think of my hometown.',
                free: 'Moonlight streams before my bed,\nLike frost upon the ground it seems.\nI raise my eyes to the moon so bright,\nThen bow my head in homesick dreams.',
                poetic: 'Moon\'s silver light beside my bed,\nLike frost across the ground has spread.\nI lift my gaze to moon above,\nAnd bow, recalling home I love.',
                annotations: [
                    { term: '床前', note: '床邊/before the bed' },
                    { term: '明月光', note: '明亮的月光/bright moonlight' },
                    { term: '故鄉', note: '家鄉/hometown, homeland' }
                ]
            },
            '春眠不覺曉，處處聞啼鳥。夜來風雨聲，花落知多少。': {
                literal: 'Spring sleep, unaware of dawn,\nEverywhere hear singing birds.\nLast night, sounds of wind and rain,\nHow many flowers have fallen?',
                free: 'Lost in spring slumber, dawn slips by unnoticed,\nBirdsong fills the air from every tree.\nThrough the night the wind and rain did blow,\nHow many petals fell? Who knows?',
                poetic: 'In spring one sleeps, unaware of light,\nBirds singing sweetly left and right.\nBut in the night came wind and rain—\nHow many blossoms fell in blight?',
                annotations: [
                    { term: '春眠', note: '春天的睡眠/spring sleep' },
                    { term: '曉', note: '黎明/dawn' },
                    { term: '啼鳥', note: '鳥鳴/singing birds' }
                ]
            }
        }
    },
    en: {
        zh: {
            'to be, or not to be, that is the question.': {
                literal: '存在，還是不存在，這是個問題。',
                free: '生存還是毀滅，這是一個值得思考的問題。',
                poetic: '生耶死耶，此為大哉問。',
                annotations: [
                    { term: 'To be', note: '存在/to exist' },
                    { term: 'question', note: '問題/issue, dilemma' }
                ]
            }
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
    document.getElementById('translateBtn').textContent = t('translateBtn');
    document.getElementById('sourceText').placeholder = t('placeholder');
    document.querySelector('.annotation-section h3').textContent = t('annotation');
    document.querySelector('.examples-section h3').textContent = t('examples');
}

function translateLiterary(text, sourceLang, targetLang, style) {
    const lowerText = text.toLowerCase().trim();
    const dict = literaryTranslations[sourceLang]?.[targetLang];

    // Check for exact or similar match
    for (const [original, translations] of Object.entries(dict || {})) {
        if (original.toLowerCase() === lowerText || text === original) {
            return {
                text: translations[style] || translations.literal,
                annotations: translations.annotations || []
            };
        }
    }

    // Default translation message
    return {
        text: `[${t('literary')} ${targetLang.toUpperCase()}: ${text}]`,
        annotations: []
    };
}

function renderAnnotations(annotations) {
    if (!annotations || annotations.length === 0) return '';

    return annotations.map(a => `
        <div class="annotation-item">
            <span class="annotation-term">${a.term}</span>
            <span class="annotation-note">— ${a.note}</span>
        </div>
    `).join('');
}

function init() {
    setLanguage(navigator.language.startsWith('zh') ? 'zh-TW' : 'en');

    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    const sourceText = document.getElementById('sourceText');
    const targetText = document.getElementById('targetText');

    document.getElementById('translateBtn').addEventListener('click', () => {
        const text = sourceText.value.trim();
        if (!text) return;

        const sourceLang = document.getElementById('sourceLang').value;
        const targetLang = document.getElementById('targetLang').value;
        const style = document.querySelector('input[name="style"]:checked').value;
        const showAnnotation = document.getElementById('showAnnotation').checked;

        const result = translateLiterary(text, sourceLang, targetLang, style);
        targetText.textContent = result.text;

        const annotationSection = document.getElementById('annotationSection');
        const annotationContent = document.getElementById('annotationContent');

        if (showAnnotation && result.annotations.length > 0) {
            annotationContent.innerHTML = renderAnnotations(result.annotations);
            annotationSection.style.display = 'block';
        } else {
            annotationSection.style.display = 'none';
        }
    });

    document.getElementById('swapBtn').addEventListener('click', () => {
        const sourceSelect = document.getElementById('sourceLang');
        const targetSelect = document.getElementById('targetLang');

        const temp = sourceSelect.value;
        sourceSelect.value = targetSelect.value;
        targetSelect.value = temp;

        const tempText = sourceText.value;
        sourceText.value = targetText.textContent;
        targetText.textContent = tempText;
    });

    // Example cards
    document.querySelectorAll('.example-card').forEach(card => {
        card.addEventListener('click', () => {
            const text = card.dataset.text;
            const genre = card.dataset.genre;
            const lang = card.dataset.lang || 'zh';

            sourceText.value = text;
            document.getElementById('genreSelect').value = genre;
            document.getElementById('sourceLang').value = lang;
            document.getElementById('targetLang').value = lang === 'zh' ? 'en' : 'zh';

            document.getElementById('translateBtn').click();
        });
    });
}

init();
