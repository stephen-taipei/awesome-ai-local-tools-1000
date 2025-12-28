/**
 * Spell Checker - Tool #142
 * Check spelling errors in text
 */

let currentLang = 'zh-TW';

const i18n = {
    'zh-TW': {
        title: '拼寫檢查',
        subtitle: '檢測英文拼寫錯誤與常見別字',
        inputLabel: '輸入文字',
        placeholder: '輸入要檢查拼寫的文字...',
        checkBtn: '檢查拼寫',
        wordCount: '總詞數',
        errorCount: '拼寫錯誤',
        accuracy: '正確率',
        correctedText: '標記文本',
        spellErrors: '拼寫問題',
        accept: '接受'
    },
    'en': {
        title: 'Spell Checker',
        subtitle: 'Detect spelling errors in text',
        inputLabel: 'Enter text',
        placeholder: 'Enter text to check spelling...',
        checkBtn: 'Check Spelling',
        wordCount: 'Total Words',
        errorCount: 'Spelling Errors',
        accuracy: 'Accuracy',
        correctedText: 'Highlighted Text',
        spellErrors: 'Spelling Issues',
        accept: 'Accept'
    }
};

// Common misspellings dictionary
const misspellings = {
    'recieve': 'receive',
    'recieved': 'received',
    'recieving': 'receiving',
    'mesage': 'message',
    'mesages': 'messages',
    'thankyou': 'thank you',
    'informaton': 'information',
    'definately': 'definitely',
    'definatly': 'definitely',
    'accomodation': 'accommodation',
    'accomodate': 'accommodate',
    'excelent': 'excellent',
    'excellant': 'excellent',
    'resturant': 'restaurant',
    'restarant': 'restaurant',
    'delicous': 'delicious',
    'deliceous': 'delicious',
    'enviroment': 'environment',
    'enviorment': 'environment',
    'neccessary': 'necessary',
    'neccesary': 'necessary',
    'necessery': 'necessary',
    'dependancies': 'dependencies',
    'dependancy': 'dependency',
    'occured': 'occurred',
    'occurence': 'occurrence',
    'seperate': 'separate',
    'seperately': 'separately',
    'untill': 'until',
    'beleive': 'believe',
    'belive': 'believe',
    'wierd': 'weird',
    'truely': 'truly',
    'arguement': 'argument',
    'begining': 'beginning',
    'calender': 'calendar',
    'catagory': 'category',
    'collegue': 'colleague',
    'commited': 'committed',
    'concious': 'conscious',
    'existance': 'existence',
    'foriegn': 'foreign',
    'freind': 'friend',
    'goverment': 'government',
    'grammer': 'grammar',
    'happend': 'happened',
    'harrass': 'harass',
    'immediatly': 'immediately',
    'independant': 'independent',
    'intresting': 'interesting',
    'knowlege': 'knowledge',
    'liason': 'liaison',
    'lisence': 'license',
    'maintenence': 'maintenance',
    'manuever': 'maneuver',
    'millenium': 'millennium',
    'minumum': 'minimum',
    'mischievious': 'mischievous',
    'noticable': 'noticeable',
    'occassion': 'occasion',
    'occassionally': 'occasionally',
    'persistant': 'persistent',
    'posession': 'possession',
    'potatos': 'potatoes',
    'preceed': 'precede',
    'privelege': 'privilege',
    'professer': 'professor',
    'pronounciation': 'pronunciation',
    'publically': 'publicly',
    'questionaire': 'questionnaire',
    'recomend': 'recommend',
    'referance': 'reference',
    'relevent': 'relevant',
    'rythm': 'rhythm',
    'shedule': 'schedule',
    'succesful': 'successful',
    'sucessful': 'successful',
    'suprise': 'surprise',
    'tommorow': 'tomorrow',
    'tommorrow': 'tomorrow',
    'tounge': 'tongue',
    'vaccum': 'vacuum',
    'wether': 'whether',
    'writting': 'writing',
    'wich': 'which',
    'thier': 'their',
    'teh': 'the',
    'taht': 'that',
    'adn': 'and',
    'jsut': 'just',
    'becuase': 'because',
    'beacuse': 'because',
    'youre': "you're",
    'dont': "don't",
    'cant': "can't",
    'wont': "won't",
    'didnt': "didn't",
    'doesnt': "doesn't",
    'isnt': "isn't",
    'wasnt': "wasn't",
    'werent': "weren't",
    'havent': "haven't",
    'hasnt': "hasn't",
    'hadnt': "hadn't",
    'wouldnt': "wouldn't",
    'couldnt': "couldn't",
    'shouldnt': "shouldn't"
};

function t(key) {
    return i18n[currentLang][key] || key;
}

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`lang-${lang === 'zh-TW' ? 'zh' : 'en'}`).classList.add('active');
}

function checkSpelling(text) {
    const words = text.match(/[a-zA-Z']+/g) || [];
    const errors = [];
    let highlightedText = text;

    // Find misspelled words
    const wordPositions = [];
    let searchStart = 0;

    words.forEach(word => {
        const lowerWord = word.toLowerCase();
        const correction = misspellings[lowerWord];

        if (correction) {
            const index = text.toLowerCase().indexOf(lowerWord, searchStart);
            if (index !== -1) {
                wordPositions.push({
                    original: word,
                    suggestion: correction,
                    index: index
                });
                searchStart = index + word.length;
            }
        }
    });

    // Sort by position (reverse for replacement)
    wordPositions.sort((a, b) => b.index - a.index);

    // Create highlighted text
    wordPositions.forEach(item => {
        const before = highlightedText.substring(0, item.index);
        const after = highlightedText.substring(item.index + item.original.length);
        highlightedText = before + `<span class="spell-error" title="${item.suggestion}">${item.original}</span>` + after;
    });

    // Sort back for display
    wordPositions.sort((a, b) => a.index - b.index);

    errors.push(...wordPositions);

    const wordCount = words.length;
    const errorCount = errors.length;
    const accuracy = wordCount > 0 ? Math.round(((wordCount - errorCount) / wordCount) * 100) : 100;

    return {
        errors,
        highlightedText,
        wordCount,
        errorCount,
        accuracy
    };
}

function displayResults(result) {
    document.getElementById('resultSection').style.display = 'block';

    // Summary
    document.getElementById('wordCount').textContent = result.wordCount;
    document.getElementById('errorCount').textContent = result.errorCount;
    document.getElementById('accuracy').textContent = result.accuracy + '%';

    // Highlighted text
    document.getElementById('correctedText').innerHTML = result.highlightedText;

    // Error list
    const errorsSection = document.getElementById('errorsSection');
    if (result.errors.length > 0) {
        errorsSection.style.display = 'block';
        const errorsHTML = result.errors.map((error, idx) => `
            <div class="error-item" data-index="${idx}">
                <div class="error-word">
                    <span class="error-original">${error.original}</span>
                    <span class="error-arrow">→</span>
                    <span class="error-suggestion">${error.suggestion}</span>
                </div>
            </div>
        `).join('');
        document.getElementById('errorsList').innerHTML = errorsHTML;
    } else {
        errorsSection.style.display = 'none';
    }
}

function init() {
    setLanguage(navigator.language.startsWith('zh') ? 'zh-TW' : 'en');

    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    document.getElementById('checkBtn').addEventListener('click', () => {
        const text = document.getElementById('textInput').value.trim();
        if (!text) return;

        const result = checkSpelling(text);
        displayResults(result);
    });

    document.querySelectorAll('.example-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('textInput').value = btn.dataset.text;
            document.getElementById('checkBtn').click();
        });
    });
}

init();
