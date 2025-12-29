/**
 * Smart Document Summary - Tool #701
 * AI-powered document summarization running locally in browser
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

    // DOM elements
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const summarizeBtn = document.getElementById('summarizeBtn');
    const loading = document.getElementById('loading');
    const outputArea = document.getElementById('outputArea');
    const summaryOutput = document.getElementById('summaryOutput');
    const copyBtn = document.getElementById('copyBtn');
    const exportBtn = document.getElementById('exportBtn');
    const resetBtn = document.getElementById('resetBtn');

    let documentContent = '';

    // File upload handling
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) handleFile(e.target.files[0]);
    });

    function handleFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            documentContent = e.target.result;
            fileName.textContent = file.name;
            fileInfo.classList.add('visible');
        };
        reader.readAsText(file);
    }

    // Generate summary
    summarizeBtn.addEventListener('click', () => {
        if (!documentContent) {
            alert('Please upload a document first');
            return;
        }

        const length = document.getElementById('summaryLength').value;
        const style = document.getElementById('summaryStyle').value;
        const keywords = document.getElementById('focusKeywords').value;

        loading.classList.add('visible');
        outputArea.classList.remove('visible');

        setTimeout(() => {
            const summary = generateSummary(documentContent, length, style, keywords);
            displaySummary(summary);
            loading.classList.remove('visible');
            outputArea.classList.add('visible');
        }, 1500);
    });

    function generateSummary(text, length, style, keywords) {
        // Clean and prepare text
        const cleanText = text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
        const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [cleanText];
        const words = cleanText.split(/\s+/);

        // Score sentences based on word frequency and position
        const wordFreq = {};
        words.forEach(word => {
            const w = word.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]/g, '');
            if (w.length > 3) wordFreq[w] = (wordFreq[w] || 0) + 1;
        });

        // Keyword boost
        const keywordList = keywords ? keywords.split(',').map(k => k.trim().toLowerCase()) : [];

        const scoredSentences = sentences.map((sentence, index) => {
            let score = 0;
            const sentenceWords = sentence.toLowerCase().split(/\s+/);

            // Word frequency score
            sentenceWords.forEach(word => {
                const w = word.replace(/[^a-z0-9\u4e00-\u9fff]/g, '');
                if (wordFreq[w]) score += wordFreq[w];
            });

            // Position bonus (first and last sentences are often important)
            if (index < 3) score *= 1.5;
            if (index >= sentences.length - 2) score *= 1.2;

            // Keyword boost
            keywordList.forEach(kw => {
                if (sentence.toLowerCase().includes(kw)) score *= 2;
            });

            // Length penalty for very short or very long sentences
            if (sentenceWords.length < 5) score *= 0.5;
            if (sentenceWords.length > 40) score *= 0.7;

            return { sentence: sentence.trim(), score, index };
        });

        // Sort by score and select top sentences
        scoredSentences.sort((a, b) => b.score - a.score);

        let numSentences;
        switch (length) {
            case 'short': numSentences = Math.min(2, sentences.length); break;
            case 'medium': numSentences = Math.min(5, sentences.length); break;
            case 'long': numSentences = Math.min(10, sentences.length); break;
            default: numSentences = Math.min(5, sentences.length);
        }

        // Get top sentences and sort by original position
        const selectedSentences = scoredSentences
            .slice(0, numSentences)
            .sort((a, b) => a.index - b.index)
            .map(s => s.sentence);

        // Format based on style
        let summary;
        switch (style) {
            case 'bullet':
                summary = selectedSentences.map(s => '• ' + s).join('\n');
                break;
            case 'executive':
                summary = 'Key Points:\n\n' + selectedSentences.join(' ');
                break;
            case 'academic':
                summary = 'Abstract: ' + selectedSentences.join(' ');
                break;
            default:
                summary = selectedSentences.join(' ');
        }

        return {
            summary,
            originalWords: words.length,
            summaryWords: summary.split(/\s+/).length
        };
    }

    function displaySummary(result) {
        summaryOutput.textContent = result.summary;
        document.getElementById('origWords').textContent = result.originalWords;
        document.getElementById('summaryWords').textContent = result.summaryWords;

        const compression = Math.round((1 - result.summaryWords / result.originalWords) * 100);
        document.getElementById('compression').textContent = compression + '%';

        const readTime = Math.ceil(result.summaryWords / 200);
        document.getElementById('readTime').textContent = readTime + 'm';
    }

    // Copy to clipboard
    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(summaryOutput.textContent);
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyBtn.innerHTML = '<span class="en">Copy to Clipboard</span><span class="zh" style="display:none;">複製到剪貼簿</span>';
        }, 2000);
    });

    // Export as TXT
    exportBtn.addEventListener('click', () => {
        const blob = new Blob([summaryOutput.textContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'summary-' + Date.now() + '.txt';
        a.click();
        URL.revokeObjectURL(url);
    });

    // Reset
    resetBtn.addEventListener('click', () => {
        documentContent = '';
        fileInput.value = '';
        fileInfo.classList.remove('visible');
        outputArea.classList.remove('visible');
        document.getElementById('focusKeywords').value = '';
    });
});
