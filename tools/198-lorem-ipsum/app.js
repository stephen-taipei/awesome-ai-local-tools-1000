/**
 * Lorem Ipsum Generator - Tool #198
 */

const latinWords = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
    'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
    'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
    'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
    'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
    'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
    'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'at', 'vero', 'eos',
    'accusamus', 'iusto', 'odio', 'dignissimos', 'ducimus', 'blanditiis',
    'praesentium', 'voluptatum', 'deleniti', 'atque', 'corrupti', 'quos', 'dolores',
    'quas', 'molestias', 'excepturi', 'obcaecati', 'cupiditate', 'provident'
];

const chineseWords = [
    '設計', '開發', '程式', '科技', '創新', '資料', '使用者', '介面', '體驗', '功能',
    '系統', '應用', '服務', '平台', '解決方案', '效率', '品質', '專業', '團隊', '合作',
    '目標', '成長', '價值', '策略', '規劃', '執行', '管理', '分析', '優化', '整合',
    '數位', '轉型', '雲端', '安全', '智慧', '自動化', '人工智慧', '機器學習', '區塊鏈',
    '物聯網', '大數據', '演算法', '架構', '模組', '元件', '測試', '部署', '維護', '更新'
];

const chineseSentences = [
    '這是一個專業的設計平台。',
    '我們致力於提供最佳的使用者體驗。',
    '創新科技改變了我們的生活方式。',
    '團隊合作是成功的關鍵。',
    '持續學習是進步的動力。',
    '品質是我們堅持的原則。',
    '數位轉型正在改變產業生態。',
    '使用者需求是產品開發的核心。',
    '資料分析幫助我們做出更好的決策。',
    '安全性是系統設計的首要考量。'
];

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    document.getElementById('generateBtn').addEventListener('click', generate);
    document.getElementById('copyBtn').addEventListener('click', copyResult);

    document.getElementById('language').addEventListener('change', (e) => {
        document.getElementById('startLorem').disabled = e.target.value === 'chinese';
    });
}

function generate() {
    const language = document.getElementById('language').value;
    const type = document.getElementById('type').value;
    const count = parseInt(document.getElementById('count').value) || 1;
    const startLorem = document.getElementById('startLorem').checked;
    const includeHtml = document.getElementById('includeHtml').checked;

    let result;

    switch (type) {
        case 'paragraphs':
            result = generateParagraphs(language, count, startLorem);
            break;
        case 'sentences':
            result = generateSentences(language, count, startLorem);
            break;
        case 'words':
            result = generateWords(language, count, startLorem);
            break;
    }

    if (includeHtml && type === 'paragraphs') {
        result = result.split('\n\n').map(p => `<p>${p}</p>`).join('\n');
    }

    document.getElementById('output').textContent = result;

    // Word count
    const words = result.replace(/<[^>]*>/g, '').trim().split(/\s+/).length;
    const chars = result.replace(/<[^>]*>/g, '').replace(/\s/g, '').length;
    document.getElementById('wordCount').textContent = `${words} 詞 / ${chars} 字`;

    document.getElementById('resultsSection').style.display = 'block';
}

function generateParagraphs(language, count, startLorem) {
    const paragraphs = [];

    for (let i = 0; i < count; i++) {
        const sentenceCount = randomInt(4, 8);
        const sentences = [];

        for (let j = 0; j < sentenceCount; j++) {
            const isFirst = i === 0 && j === 0;
            sentences.push(generateSentence(language, isFirst && startLorem));
        }

        paragraphs.push(sentences.join(' '));
    }

    return paragraphs.join('\n\n');
}

function generateSentences(language, count, startLorem) {
    const sentences = [];

    for (let i = 0; i < count; i++) {
        sentences.push(generateSentence(language, i === 0 && startLorem));
    }

    return sentences.join(' ');
}

function generateWords(language, count, startLorem) {
    const words = [];
    const wordList = language === 'chinese' ? chineseWords :
                     language === 'mixed' ? [...latinWords, ...chineseWords] : latinWords;

    if (startLorem && language !== 'chinese') {
        words.push('Lorem', 'ipsum');
        count = Math.max(0, count - 2);
    }

    for (let i = 0; i < count; i++) {
        words.push(wordList[randomInt(0, wordList.length - 1)]);
    }

    return words.join(language === 'chinese' ? '' : ' ');
}

function generateSentence(language, startWithLorem) {
    if (language === 'chinese') {
        return chineseSentences[randomInt(0, chineseSentences.length - 1)];
    }

    const wordList = language === 'mixed' ? [...latinWords, ...chineseWords] : latinWords;
    const wordCount = randomInt(8, 15);
    const words = [];

    if (startWithLorem) {
        words.push('Lorem', 'ipsum', 'dolor', 'sit', 'amet');
    }

    while (words.length < wordCount) {
        words.push(wordList[randomInt(0, wordList.length - 1)]);
    }

    // Capitalize first letter
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);

    // Add comma randomly
    if (words.length > 6) {
        const commaPos = randomInt(3, words.length - 3);
        words[commaPos] = words[commaPos] + ',';
    }

    return words.join(' ') + '.';
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function copyResult() {
    const output = document.getElementById('output').textContent;
    navigator.clipboard.writeText(output).then(() => {
        const toast = document.getElementById('toast');
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
    });
}

init();
