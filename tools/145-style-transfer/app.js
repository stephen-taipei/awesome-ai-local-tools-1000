/**
 * Style Transfer - Tool #145
 */
let currentLang = 'zh-TW';
let selectedStyle = 'professional';

const styleTransforms = {
    zh: {
        professional: { prefix: '謹此告知，', suffix: '，敬請參考。', replacements: [['很好', '卓越'], ['推薦', '鄭重推薦'], ['我覺得', '經評估後認為']] },
        friendly: { prefix: '嗨！', suffix: ' 😊', replacements: [['產品', '好物'], ['推薦', '大推'], ['很好', '超讚']] },
        creative: { prefix: '想像一下：', suffix: '——這就是未來！', replacements: [['很好', '令人驚艷'], ['產品', '傑作']] },
        academic: { prefix: '根據觀察與分析，', suffix: '，此結論具有參考價值。', replacements: [['很好', '具優良特性'], ['我', '研究者']] }
    },
    en: {
        professional: { prefix: 'Please be advised that ', suffix: '. We recommend your consideration.', replacements: [['good', 'excellent'], ['think', 'believe'], ['should', 'recommend']] },
        friendly: { prefix: 'Hey there! ', suffix: ' 😊', replacements: [['good', 'awesome'], ['idea', 'cool idea']] },
        creative: { prefix: 'Picture this: ', suffix: ' — the possibilities are endless!', replacements: [['good', 'brilliant'], ['idea', 'vision']] },
        academic: { prefix: 'Based on the analysis, ', suffix: '. This conclusion warrants further consideration.', replacements: [['think', 'hypothesize'], ['good', 'favorable']] }
    }
};

function detectLanguage(text) { return /[\u4e00-\u9fff]/.test(text) ? 'zh' : 'en'; }

function transformStyle(text, style) {
    const lang = detectLanguage(text);
    const transform = styleTransforms[lang][style];
    let result = text;
    transform.replacements.forEach(([from, to]) => {
        result = result.replace(new RegExp(from, 'gi'), to);
    });
    return transform.prefix + result + transform.suffix;
}

function init() {
    currentLang = navigator.language.startsWith('zh') ? 'zh-TW' : 'en';
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`lang-${currentLang === 'zh-TW' ? 'zh' : 'en'}`).classList.add('active');

    document.getElementById('lang-zh').addEventListener('click', () => { currentLang = 'zh-TW'; document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { currentLang = 'en'; document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    document.querySelectorAll('.style-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.style-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedStyle = btn.dataset.style;
        });
    });

    document.getElementById('transformBtn').addEventListener('click', () => {
        const text = document.getElementById('textInput').value.trim();
        if (!text) return;
        document.getElementById('resultSection').style.display = 'block';
        document.getElementById('resultContent').textContent = transformStyle(text, selectedStyle);
    });

    document.getElementById('copyBtn').addEventListener('click', () => {
        navigator.clipboard.writeText(document.getElementById('resultContent').textContent);
        document.getElementById('copyBtn').textContent = '已複製！';
        setTimeout(() => document.getElementById('copyBtn').textContent = '複製結果', 2000);
    });

    document.querySelectorAll('.example-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('textInput').value = btn.dataset.text;
            document.getElementById('transformBtn').click();
        });
    });
}
init();
