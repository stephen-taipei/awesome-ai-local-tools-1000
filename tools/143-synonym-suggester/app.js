/**
 * Synonym Suggester - Tool #143
 * Find synonyms for words
 */

let currentLang = 'zh-TW';

const i18n = {
    'zh-TW': {
        title: '同義詞建議',
        subtitle: '尋找詞彙的同義詞與替代用語',
        inputLabel: '輸入詞彙',
        placeholder: '輸入要查找同義詞的詞彙...',
        searchBtn: '查找同義詞',
        synonyms: '同義詞',
        antonyms: '反義詞',
        related: '相關詞',
        notFound: '未找到該詞彙，請嘗試其他詞彙'
    },
    'en': {
        title: 'Synonym Suggester',
        subtitle: 'Find synonyms and alternatives for words',
        inputLabel: 'Enter word',
        placeholder: 'Enter a word to find synonyms...',
        searchBtn: 'Find Synonyms',
        synonyms: 'Synonyms',
        antonyms: 'Antonyms',
        related: 'Related Words',
        notFound: 'Word not found. Try another word.'
    }
};

// Thesaurus data
const thesaurus = {
    // English words
    'good': {
        pos: 'adjective',
        synonyms: ['excellent', 'great', 'wonderful', 'fantastic', 'superb', 'fine', 'nice', 'pleasant', 'outstanding', 'exceptional'],
        antonyms: ['bad', 'poor', 'terrible', 'awful'],
        related: ['better', 'best', 'well', 'goodness']
    },
    'bad': {
        pos: 'adjective',
        synonyms: ['poor', 'terrible', 'awful', 'horrible', 'dreadful', 'inferior', 'substandard', 'unpleasant'],
        antonyms: ['good', 'excellent', 'great', 'wonderful'],
        related: ['worse', 'worst', 'badly', 'badness']
    },
    'happy': {
        pos: 'adjective',
        synonyms: ['joyful', 'cheerful', 'delighted', 'pleased', 'content', 'elated', 'glad', 'thrilled', 'ecstatic', 'blissful'],
        antonyms: ['sad', 'unhappy', 'miserable', 'depressed'],
        related: ['happiness', 'happily', 'happier', 'happiest']
    },
    'sad': {
        pos: 'adjective',
        synonyms: ['unhappy', 'sorrowful', 'dejected', 'melancholy', 'gloomy', 'downcast', 'depressed', 'miserable', 'heartbroken'],
        antonyms: ['happy', 'joyful', 'cheerful', 'elated'],
        related: ['sadness', 'sadly', 'sadder', 'saddest']
    },
    'big': {
        pos: 'adjective',
        synonyms: ['large', 'huge', 'enormous', 'massive', 'giant', 'vast', 'immense', 'colossal', 'substantial', 'sizeable'],
        antonyms: ['small', 'tiny', 'little', 'miniature'],
        related: ['bigger', 'biggest', 'bigness', 'size']
    },
    'small': {
        pos: 'adjective',
        synonyms: ['little', 'tiny', 'miniature', 'compact', 'petite', 'minute', 'diminutive', 'modest', 'slight'],
        antonyms: ['big', 'large', 'huge', 'enormous'],
        related: ['smaller', 'smallest', 'smallness']
    },
    'fast': {
        pos: 'adjective',
        synonyms: ['quick', 'rapid', 'swift', 'speedy', 'hasty', 'brisk', 'prompt', 'expeditious', 'fleet'],
        antonyms: ['slow', 'sluggish', 'leisurely'],
        related: ['faster', 'fastest', 'speed', 'quickly']
    },
    'slow': {
        pos: 'adjective',
        synonyms: ['sluggish', 'leisurely', 'gradual', 'unhurried', 'delayed', 'tardy', 'lagging'],
        antonyms: ['fast', 'quick', 'rapid', 'swift'],
        related: ['slower', 'slowest', 'slowly', 'slowness']
    },
    'important': {
        pos: 'adjective',
        synonyms: ['significant', 'crucial', 'essential', 'vital', 'critical', 'key', 'major', 'notable', 'substantial', 'meaningful'],
        antonyms: ['unimportant', 'trivial', 'insignificant', 'minor'],
        related: ['importance', 'importantly']
    },
    'beautiful': {
        pos: 'adjective',
        synonyms: ['gorgeous', 'stunning', 'lovely', 'attractive', 'pretty', 'elegant', 'exquisite', 'handsome', 'radiant'],
        antonyms: ['ugly', 'unattractive', 'plain'],
        related: ['beauty', 'beautifully']
    },
    'smart': {
        pos: 'adjective',
        synonyms: ['intelligent', 'clever', 'bright', 'brilliant', 'sharp', 'wise', 'astute', 'quick-witted'],
        antonyms: ['stupid', 'dumb', 'foolish', 'slow'],
        related: ['smarter', 'smartest', 'smartly', 'smartness']
    },
    'easy': {
        pos: 'adjective',
        synonyms: ['simple', 'straightforward', 'effortless', 'uncomplicated', 'painless', 'elementary', 'basic'],
        antonyms: ['difficult', 'hard', 'challenging', 'complex'],
        related: ['easier', 'easiest', 'easily', 'ease']
    },
    'difficult': {
        pos: 'adjective',
        synonyms: ['hard', 'challenging', 'tough', 'demanding', 'arduous', 'complex', 'complicated', 'tricky'],
        antonyms: ['easy', 'simple', 'effortless'],
        related: ['difficulty', 'difficulties']
    },
    // Chinese words
    '好': {
        pos: '形容詞',
        synonyms: ['良好', '優秀', '出色', '棒', '讚', '佳', '優', '極好', '美好'],
        antonyms: ['壞', '差', '糟', '爛'],
        related: ['更好', '最好', '好處', '好感']
    },
    '壞': {
        pos: '形容詞',
        synonyms: ['差', '糟', '爛', '惡劣', '不好', '不佳'],
        antonyms: ['好', '良好', '優秀'],
        related: ['更壞', '最壞', '壞處']
    },
    '快樂': {
        pos: '形容詞',
        synonyms: ['開心', '高興', '愉快', '歡樂', '喜悅', '幸福', '愉悅', '欣喜'],
        antonyms: ['悲傷', '難過', '憂鬱', '沮喪'],
        related: ['快樂地', '快樂感']
    },
    '悲傷': {
        pos: '形容詞',
        synonyms: ['難過', '傷心', '哀傷', '憂傷', '悲痛', '沮喪', '憂鬱'],
        antonyms: ['快樂', '開心', '高興', '愉快'],
        related: ['悲傷地', '悲傷感']
    },
    '美麗': {
        pos: '形容詞',
        synonyms: ['漂亮', '美', '好看', '動人', '優美', '秀麗', '美觀', '艷麗'],
        antonyms: ['醜陋', '難看', '醜'],
        related: ['美麗地', '美麗的']
    },
    '重要': {
        pos: '形容詞',
        synonyms: ['關鍵', '要緊', '關鍵性', '至關重要', '必要', '不可或缺', '重大'],
        antonyms: ['不重要', '次要', '無關緊要'],
        related: ['重要性', '重要地']
    },
    '大': {
        pos: '形容詞',
        synonyms: ['巨大', '龐大', '廣大', '寬大', '浩大', '宏大'],
        antonyms: ['小', '微小', '細小'],
        related: ['更大', '最大', '大小']
    },
    '小': {
        pos: '形容詞',
        synonyms: ['微小', '細小', '渺小', '迷你', '嬌小', '小型'],
        antonyms: ['大', '巨大', '龐大'],
        related: ['更小', '最小', '小巧']
    },
    '快': {
        pos: '形容詞',
        synonyms: ['迅速', '快速', '急速', '敏捷', '迅捷', '飛快'],
        antonyms: ['慢', '緩慢', '遲緩'],
        related: ['更快', '最快', '快速地']
    },
    '慢': {
        pos: '形容詞',
        synonyms: ['緩慢', '遲緩', '緩和', '徐徐'],
        antonyms: ['快', '迅速', '敏捷'],
        related: ['更慢', '最慢', '慢慢地']
    }
};

function t(key) {
    return i18n[currentLang][key] || key;
}

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`lang-${lang === 'zh-TW' ? 'zh' : 'en'}`).classList.add('active');
}

function searchWord(word) {
    const lowerWord = word.toLowerCase().trim();
    return thesaurus[lowerWord] || thesaurus[word.trim()] || null;
}

function displayResults(word, data) {
    document.getElementById('resultSection').style.display = 'block';

    if (!data) {
        document.getElementById('wordInfo').innerHTML = `
            <div class="word-main">${word}</div>
            <div class="word-pos">${t('notFound')}</div>
        `;
        document.getElementById('synonymsGrid').innerHTML = '';
        document.getElementById('antonymsSection').style.display = 'none';
        document.getElementById('relatedSection').style.display = 'none';
        return;
    }

    // Word info
    document.getElementById('wordInfo').innerHTML = `
        <div class="word-main">${word}</div>
        <div class="word-pos">${data.pos}</div>
    `;

    // Synonyms
    document.getElementById('synonymsGrid').innerHTML = data.synonyms
        .map(syn => `<span class="word-tag" onclick="searchNewWord('${syn}')">${syn}</span>`)
        .join('');

    // Antonyms
    const antonymsSection = document.getElementById('antonymsSection');
    if (data.antonyms && data.antonyms.length > 0) {
        antonymsSection.style.display = 'block';
        document.getElementById('antonymsGrid').innerHTML = data.antonyms
            .map(ant => `<span class="word-tag" onclick="searchNewWord('${ant}')">${ant}</span>`)
            .join('');
    } else {
        antonymsSection.style.display = 'none';
    }

    // Related words
    const relatedSection = document.getElementById('relatedSection');
    if (data.related && data.related.length > 0) {
        relatedSection.style.display = 'block';
        document.getElementById('relatedGrid').innerHTML = data.related
            .map(rel => `<span class="word-tag" onclick="searchNewWord('${rel}')">${rel}</span>`)
            .join('');
    } else {
        relatedSection.style.display = 'none';
    }
}

function searchNewWord(word) {
    document.getElementById('wordInput').value = word;
    const data = searchWord(word);
    displayResults(word, data);
}

function init() {
    setLanguage(navigator.language.startsWith('zh') ? 'zh-TW' : 'en');

    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    document.getElementById('searchBtn').addEventListener('click', () => {
        const word = document.getElementById('wordInput').value.trim();
        if (!word) return;
        const data = searchWord(word);
        displayResults(word, data);
    });

    document.getElementById('wordInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('searchBtn').click();
        }
    });

    document.querySelectorAll('.quick-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const word = btn.dataset.word;
            document.getElementById('wordInput').value = word;
            const data = searchWord(word);
            displayResults(word, data);
        });
    });
}

// Make searchNewWord available globally
window.searchNewWord = searchNewWord;

init();
