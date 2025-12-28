/**
 * Document Q&A - Tool #705
 * Ask questions about documents locally
 */

document.addEventListener('DOMContentLoaded', () => {
    // Language switching
    const langBtns = document.querySelectorAll('.lang-btn');
    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            langBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const lang = btn.dataset.lang;
            document.querySelectorAll('.en').forEach(el => el.style.display = lang === 'en' ? '' : 'none');
            document.querySelectorAll('.zh').forEach(el => el.style.display = lang === 'zh' ? '' : 'none');
        });
    });

    let documentContent = '';
    let sentences = [];

    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const docLoaded = document.getElementById('docLoaded');
    const docName = document.getElementById('docName');
    const docStats = document.getElementById('docStats');
    const chatContainer = document.getElementById('chatContainer');
    const questionInput = document.getElementById('questionInput');
    const askBtn = document.getElementById('askBtn');
    const suggestedQuestions = document.getElementById('suggestedQuestions');
    const questionChips = document.getElementById('questionChips');

    uploadArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
        if (e.target.files[0]) loadDocument(e.target.files[0]);
    });

    function loadDocument(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            documentContent = e.target.result;
            sentences = documentContent.match(/[^.!?]+[.!?]+/g) || [documentContent];

            docName.textContent = file.name;
            const words = documentContent.split(/\s+/).length;
            docStats.textContent = `${words} words, ${sentences.length} sentences`;
            docLoaded.classList.add('visible');

            questionInput.disabled = false;
            askBtn.disabled = false;
            questionInput.placeholder = 'Ask a question about the document...';

            generateSuggestedQuestions();

            addMessage('assistant', `Document loaded! I've analyzed "${file.name}". You can now ask me questions about its content.`);
        };
        reader.readAsText(file);
    }

    function generateSuggestedQuestions() {
        const questions = [
            'What is the main topic?',
            'Summarize the key points',
            'What are the conclusions?',
            'Who is mentioned in the document?',
            'What are the important dates?'
        ];
        questionChips.innerHTML = questions.map(q =>
            `<span class="question-chip">${q}</span>`
        ).join('');
        suggestedQuestions.style.display = 'block';

        document.querySelectorAll('.question-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                questionInput.value = chip.textContent;
                askQuestion();
            });
        });
    }

    askBtn.addEventListener('click', askQuestion);
    questionInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') askQuestion();
    });

    function askQuestion() {
        const question = questionInput.value.trim();
        if (!question || !documentContent) return;

        addMessage('user', question);
        questionInput.value = '';

        setTimeout(() => {
            const answer = findAnswer(question);
            addMessage('assistant', answer);
        }, 800);
    }

    function findAnswer(question) {
        const questionLower = question.toLowerCase();
        const questionWords = questionLower.split(/\s+/).filter(w => w.length > 2);

        // Score each sentence by relevance
        const scoredSentences = sentences.map(sentence => {
            const sentenceLower = sentence.toLowerCase();
            let score = 0;

            questionWords.forEach(word => {
                if (sentenceLower.includes(word)) score += 2;
            });

            // Boost for question-type matching
            if (questionLower.includes('who') && /\b[A-Z][a-z]+ [A-Z][a-z]+\b/.test(sentence)) score += 3;
            if (questionLower.includes('when') && /\b\d{4}\b|\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/i.test(sentence)) score += 3;
            if (questionLower.includes('how many') && /\b\d+\b/.test(sentence)) score += 3;
            if ((questionLower.includes('main') || questionLower.includes('topic') || questionLower.includes('about')) && sentences.indexOf(sentence) < 5) score += 2;

            return { sentence: sentence.trim(), score };
        });

        scoredSentences.sort((a, b) => b.score - a.score);
        const topSentences = scoredSentences.filter(s => s.score > 0).slice(0, 3);

        if (topSentences.length === 0) {
            return "I couldn't find a specific answer to that question in the document. Try rephrasing or asking about something else.";
        }

        if (questionLower.includes('summarize') || questionLower.includes('key points')) {
            return `Based on the document, here are the key points:\n\n${topSentences.map((s, i) => `${i + 1}. ${s.sentence}`).join('\n')}`;
        }

        return `Based on the document:\n\n"${topSentences[0].sentence}"${topSentences.length > 1 ? `\n\nAdditionally: "${topSentences[1].sentence}"` : ''}`;
    }

    function addMessage(type, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.innerHTML = `
            <div class="message-avatar">${type === 'user' ? '👤' : '🤖'}</div>
            <div class="message-content">${content}</div>
        `;
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
});
