/**
 * QA System - Tool #181
 * Local question answering using text similarity
 */
let history = [];

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    document.getElementById('loadSampleBtn').addEventListener('click', loadSample);
    document.getElementById('askBtn').addEventListener('click', askQuestion);
    document.getElementById('questionInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') askQuestion();
    });
}

function loadSample() {
    document.getElementById('docText').value = `人工智慧（AI）是電腦科學的一個分支，致力於創建能夠執行通常需要人類智慧的任務的系統。這些任務包括視覺感知、語音識別、決策制定和語言翻譯。

機器學習是人工智慧的一個子集，它使電腦能夠從數據中學習並改進，而無需明確編程。深度學習是機器學習的一個分支，使用類似人腦的神經網絡。

自然語言處理（NLP）是人工智慧的另一個重要領域，專注於使電腦能夠理解、解釋和生成人類語言。NLP 的應用包括聊天機器人、翻譯服務和情感分析。

電腦視覺使機器能夠解釋和理解視覺世界。通過使用數位圖像和深度學習模型，機器可以準確識別和分類物體。

人工智慧的應用非常廣泛，包括醫療診斷、自動駕駛汽車、金融服務、製造業自動化等。隨著技術的發展，AI 正在改變我們生活和工作的方式。`;
}

function askQuestion() {
    const doc = document.getElementById('docText').value.trim();
    const question = document.getElementById('questionInput').value.trim();

    if (!doc) {
        alert('請先輸入文件內容');
        return;
    }
    if (!question) {
        alert('請輸入問題');
        return;
    }

    const result = findAnswer(doc, question);
    displayAnswer(question, result);
}

function findAnswer(doc, question) {
    // Split document into sentences
    const sentences = doc.split(/[。！？\n]+/).filter(s => s.trim().length > 5);

    // Extract keywords from question
    const questionWords = tokenize(question);

    // Score each sentence based on keyword overlap
    const scored = sentences.map(sentence => {
        const sentenceWords = tokenize(sentence);
        const overlap = questionWords.filter(w => sentenceWords.includes(w)).length;
        const score = overlap / Math.max(questionWords.length, 1);
        return { sentence: sentence.trim(), score };
    });

    // Sort by score and get top results
    scored.sort((a, b) => b.score - a.score);

    const bestMatch = scored[0];
    if (!bestMatch || bestMatch.score === 0) {
        return {
            answer: '抱歉，在文件中找不到相關答案。',
            confidence: 0,
            source: ''
        };
    }

    // Try to extract a concise answer
    const answer = extractAnswer(bestMatch.sentence, questionWords);

    return {
        answer: answer,
        confidence: Math.min(bestMatch.score * 100, 100),
        source: bestMatch.sentence
    };
}

function tokenize(text) {
    // Simple tokenization - split by common delimiters and filter stop words
    const stopWords = ['的', '是', '在', '和', '與', '了', '有', '個', '這', '那', '什麼', '如何', '為什麼', 'a', 'an', 'the', 'is', 'are', 'what', 'how', 'why', 'when', 'where'];
    return text.toLowerCase()
        .replace(/[，。！？、；：""''（）\[\]{}]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 1 && !stopWords.includes(w));
}

function extractAnswer(sentence, questionWords) {
    // If question asks "什麼" or "what", try to find the definition/description
    const isWhatQuestion = questionWords.some(w => ['什麼', 'what', '是'].includes(w));

    if (isWhatQuestion) {
        // Look for patterns like "X是Y" or "X是..."
        const match = sentence.match(/(.+?)是(.+)/);
        if (match) {
            return match[0];
        }
    }

    // Default: return the most relevant sentence
    return sentence;
}

function displayAnswer(question, result) {
    document.getElementById('answerText').textContent = result.answer;
    document.getElementById('confidence').textContent = `信心度: ${result.confidence.toFixed(0)}%`;
    document.getElementById('sourceText').textContent = result.source || '無相關來源';
    document.getElementById('answerBox').style.display = 'block';

    // Add to history
    history.unshift({ question, answer: result.answer });
    if (history.length > 5) history.pop();
    updateHistory();

    // Clear input
    document.getElementById('questionInput').value = '';
}

function updateHistory() {
    if (history.length === 0) {
        document.getElementById('historySection').style.display = 'none';
        return;
    }

    document.getElementById('historySection').style.display = 'block';
    document.getElementById('historyList').innerHTML = history.map(h => `
        <div class="history-item">
            <div class="history-q">❓ ${escapeHtml(h.question)}</div>
            <div class="history-a">💬 ${escapeHtml(h.answer)}</div>
        </div>
    `).join('');
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

init();
