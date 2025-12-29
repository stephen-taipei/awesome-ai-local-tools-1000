/**
 * Topic Modeling - Tool #135
 * Discover topics in text documents
 */

let currentLang = 'zh-TW';

const i18n = {
    'zh-TW': {
        title: '主題建模',
        subtitle: '自動發現文件中的主題',
        inputLabel: '輸入文字',
        placeholder: '輸入要分析的文字（建議較長的文本效果更好）...',
        analyzeBtn: '分析主題',
        result: '發現的主題',
        topic: '主題',
        weight: '權重',
        wordCloud: '詞彙分佈',
        examples: '範例文字',
        totalWords: '總詞數',
        uniqueWords: '不重複詞',
        topics: '主題數'
    },
    'en': {
        title: 'Topic Modeling',
        subtitle: 'Discover topics in documents',
        inputLabel: 'Enter text',
        placeholder: 'Enter text to analyze (longer text works better)...',
        analyzeBtn: 'Analyze Topics',
        result: 'Discovered Topics',
        topic: 'Topic',
        weight: 'Weight',
        wordCloud: 'Word Distribution',
        examples: 'Example Text',
        totalWords: 'Total words',
        uniqueWords: 'Unique words',
        topics: 'Topics'
    }
};

// Stop words for filtering
const stopWords = {
    zh: ['的', '了', '是', '在', '和', '與', '有', '也', '這', '那', '都', '而', '及', '為', '以', '到', '從', '就', '被', '對', '能', '會', '可以', '可能', '還', '很', '更', '最', '但', '如果', '因為', '所以', '等', '將', '要', '讓', '給', '中', '上', '下', '時', '後', '前'],
    en: ['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'and', 'but', 'if', 'or', 'because', 'until', 'while', 'this', 'that', 'these', 'those', 'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'him', 'his', 'she', 'her', 'it', 'its', 'they', 'them', 'their', 'what', 'which', 'who', 'whom', 'about', 'also', 'new', 'like', 'many', 'even']
};

// Topic seed words for better grouping
const topicSeeds = {
    tech: ['AI', '人工智慧', '機器學習', '深度學習', '軟體', '技術', '科技', '電腦', '網路', '數位', 'technology', 'software', 'computer', 'digital', 'algorithm', 'data', 'machine', 'learning', 'neural', 'computing'],
    health: ['健康', '醫療', '醫生', '疾病', '治療', '藥物', '醫院', '患者', 'health', 'medical', 'doctor', 'disease', 'treatment', 'medicine', 'hospital', 'patient', 'healthcare', 'diagnostic'],
    finance: ['投資', '股票', '金融', '市場', '經濟', '銀行', '貨幣', '價格', 'investment', 'stock', 'market', 'financial', 'economy', 'bank', 'money', 'price', 'trading', 'economic'],
    environment: ['環境', '氣候', '能源', '碳', '再生', '污染', '永續', 'environment', 'climate', 'energy', 'carbon', 'renewable', 'pollution', 'sustainable', 'green', 'weather'],
    transport: ['汽車', '電動車', '自動駕駛', '交通', '運輸', 'car', 'vehicle', 'driving', 'autonomous', 'electric', 'transportation', 'tesla', 'automotive'],
    sports: ['運動', '比賽', '球員', '球隊', '冠軍', '聯賽', 'sports', 'game', 'player', 'team', 'championship', 'league', 'match', 'score', 'performance']
};

function t(key) {
    return i18n[currentLang][key] || key;
}

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`lang-${lang === 'zh-TW' ? 'zh' : 'en'}`).classList.add('active');
}

function detectLanguage(text) {
    return /[\u4e00-\u9fff]/.test(text) ? 'zh' : 'en';
}

function tokenize(text, lang) {
    if (lang === 'zh') {
        // Simple Chinese tokenization
        return text.match(/[\u4e00-\u9fff]+|[a-zA-Z]+/g) || [];
    } else {
        return text.toLowerCase().match(/[a-zA-Z]+/g) || [];
    }
}

function removeStopWords(words, lang) {
    const stops = new Set(stopWords[lang]);
    return words.filter(w => !stops.has(w.toLowerCase()) && w.length > 1);
}

function calculateTF(words) {
    const tf = {};
    words.forEach(word => {
        const w = word.toLowerCase();
        tf[w] = (tf[w] || 0) + 1;
    });
    return tf;
}

function findTopics(text, numTopics, keywordsPerTopic) {
    const lang = detectLanguage(text);
    const words = tokenize(text, lang);
    const filteredWords = removeStopWords(words, lang);
    const tf = calculateTF(filteredWords);

    // Sort words by frequency
    const sortedWords = Object.entries(tf).sort((a, b) => b[1] - a[1]);

    // Assign words to topics based on seed word matching and frequency
    const topics = [];
    const usedWords = new Set();

    // First pass: create topics based on seed words found in text
    Object.entries(topicSeeds).forEach(([topicName, seeds]) => {
        const topicWords = [];
        const seedSet = new Set(seeds.map(s => s.toLowerCase()));

        sortedWords.forEach(([word, count]) => {
            if (!usedWords.has(word) && seedSet.has(word.toLowerCase())) {
                topicWords.push({ word, count });
                usedWords.add(word);
            }
        });

        if (topicWords.length > 0) {
            // Add related words (co-occurring frequently)
            sortedWords.forEach(([word, count]) => {
                if (!usedWords.has(word) && topicWords.length < keywordsPerTopic) {
                    topicWords.push({ word, count });
                    usedWords.add(word);
                }
            });

            topics.push({
                name: topicName,
                words: topicWords.slice(0, keywordsPerTopic),
                weight: topicWords.reduce((sum, w) => sum + w.count, 0)
            });
        }
    });

    // Second pass: create remaining topics from unused high-frequency words
    let topicIndex = topics.length;
    while (topics.length < numTopics && sortedWords.some(([w]) => !usedWords.has(w))) {
        const topicWords = [];

        sortedWords.forEach(([word, count]) => {
            if (!usedWords.has(word) && topicWords.length < keywordsPerTopic) {
                topicWords.push({ word, count });
                usedWords.add(word);
            }
        });

        if (topicWords.length > 0) {
            topics.push({
                name: `topic_${++topicIndex}`,
                words: topicWords,
                weight: topicWords.reduce((sum, w) => sum + w.count, 0)
            });
        }
    }

    // Sort topics by weight and limit
    topics.sort((a, b) => b.weight - a.weight);
    const finalTopics = topics.slice(0, numTopics);

    // Normalize weights
    const totalWeight = finalTopics.reduce((sum, t) => sum + t.weight, 0);
    finalTopics.forEach(t => {
        t.weight = Math.round((t.weight / totalWeight) * 100);
    });

    return {
        topics: finalTopics,
        stats: {
            totalWords: words.length,
            uniqueWords: Object.keys(tf).length,
            topWords: sortedWords.slice(0, 30)
        }
    };
}

function getTopicLabel(name, index) {
    const labels = {
        zh: {
            tech: '科技與 AI',
            health: '醫療健康',
            finance: '金融財經',
            environment: '環境氣候',
            transport: '交通運輸',
            sports: '體育運動'
        },
        en: {
            tech: 'Technology & AI',
            health: 'Health & Medical',
            finance: 'Finance & Economy',
            environment: 'Environment & Climate',
            transport: 'Transportation',
            sports: 'Sports'
        }
    };

    const langKey = currentLang === 'zh-TW' ? 'zh' : 'en';
    return labels[langKey][name] || `${t('topic')} ${index + 1}`;
}

function displayResults(result) {
    document.getElementById('resultSection').style.display = 'block';

    // Topics
    const topicsHTML = result.topics.map((topic, index) => `
        <div class="topic-card">
            <div class="topic-header">
                <span class="topic-title">${getTopicLabel(topic.name, index)}</span>
                <span class="topic-weight">${t('weight')}: ${topic.weight}%</span>
            </div>
            <div class="topic-keywords">
                ${topic.words.map(w => `<span class="keyword-tag">${w.word}</span>`).join('')}
            </div>
        </div>
    `).join('');
    document.getElementById('topicsContainer').innerHTML = topicsHTML;

    // Word cloud
    const topicColors = ['#f59e0b', '#22c55e', '#3b82f6', '#ec4899', '#06b6d4', '#f43f5e', '#84cc16', '#a855f7', '#14b8a6', '#eab308'];
    const maxCount = result.stats.topWords[0]?.[1] || 1;
    const cloudHTML = result.stats.topWords.map(([word, count], i) => {
        const size = 0.8 + (count / maxCount) * 1.5;
        const color = topicColors[i % topicColors.length];
        return `<span class="cloud-word" style="font-size: ${size}rem; color: ${color}; opacity: ${0.6 + (count / maxCount) * 0.4}">${word}</span>`;
    }).join('');
    document.getElementById('wordCloud').innerHTML = cloudHTML;

    // Stats
    document.getElementById('stats').innerHTML = `
        <span>${t('totalWords')}: ${result.stats.totalWords}</span>
        <span>${t('uniqueWords')}: ${result.stats.uniqueWords}</span>
        <span>${t('topics')}: ${result.topics.length}</span>
    `;
}

function init() {
    setLanguage(navigator.language.startsWith('zh') ? 'zh-TW' : 'en');

    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    document.getElementById('analyzeBtn').addEventListener('click', () => {
        const text = document.getElementById('textInput').value.trim();
        if (!text) return;

        const numTopics = parseInt(document.getElementById('topicCount').value);
        const keywordsPerTopic = parseInt(document.getElementById('keywordsPerTopic').value);

        const result = findTopics(text, numTopics, keywordsPerTopic);
        displayResults(result);
    });

    document.querySelectorAll('.example-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('textInput').value = btn.dataset.text;
            document.getElementById('analyzeBtn').click();
        });
    });
}

init();
