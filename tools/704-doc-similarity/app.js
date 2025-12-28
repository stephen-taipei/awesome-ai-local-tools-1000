/**
 * Document Similarity - Tool #704
 * Compare and analyze document similarity locally
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

    const stopWords = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','by','from','as','is','was','are','were','be','have','has','had','do','does','did','will','would','could','should','this','that','these','those','i','you','he','she','it','we','they']);

    const file1 = document.getElementById('file1');
    const file2 = document.getElementById('file2');
    const text1 = document.getElementById('text1');
    const text2 = document.getElementById('text2');
    const compareBtn = document.getElementById('compareBtn');
    const loading = document.getElementById('loading');
    const results = document.getElementById('results');

    file1.addEventListener('change', (e) => { if (e.target.files[0]) loadFile(e.target.files[0], text1); });
    file2.addEventListener('change', (e) => { if (e.target.files[0]) loadFile(e.target.files[0], text2); });

    function loadFile(file, target) {
        const reader = new FileReader();
        reader.onload = (e) => { target.value = e.target.result; };
        reader.readAsText(file);
    }

    compareBtn.addEventListener('click', () => {
        const t1 = text1.value.trim();
        const t2 = text2.value.trim();
        if (!t1 || !t2) { alert('Please enter both documents'); return; }

        loading.classList.add('visible');
        results.classList.remove('visible');

        setTimeout(() => {
            const result = analyzeSimilarity(t1, t2);
            displayResults(result);
            loading.classList.remove('visible');
            results.classList.add('visible');
        }, 1000);
    });

    function analyzeSimilarity(text1, text2) {
        const getWords = (text) => text.toLowerCase().match(/\b[a-z\u4e00-\u9fff]{2,}\b/g) || [];
        const words1 = getWords(text1);
        const words2 = getWords(text2);

        const set1 = new Set(words1.filter(w => !stopWords.has(w)));
        const set2 = new Set(words2.filter(w => !stopWords.has(w)));

        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);

        const jaccardSimilarity = intersection.size / union.size;

        // TF-IDF based cosine similarity
        const tf1 = {}, tf2 = {};
        words1.forEach(w => { if (!stopWords.has(w)) tf1[w] = (tf1[w] || 0) + 1; });
        words2.forEach(w => { if (!stopWords.has(w)) tf2[w] = (tf2[w] || 0) + 1; });

        let dotProduct = 0, mag1 = 0, mag2 = 0;
        for (const word of union) {
            const v1 = tf1[word] || 0;
            const v2 = tf2[word] || 0;
            dotProduct += v1 * v2;
            mag1 += v1 * v1;
            mag2 += v2 * v2;
        }
        const cosineSimilarity = mag1 && mag2 ? dotProduct / (Math.sqrt(mag1) * Math.sqrt(mag2)) : 0;

        // Combined score
        const similarity = (jaccardSimilarity * 0.4 + cosineSimilarity * 0.6) * 100;

        // Get common words with frequency
        const commonWords = [...intersection].map(w => ({
            word: w,
            count: (tf1[w] || 0) + (tf2[w] || 0)
        })).sort((a, b) => b.count - a.count).slice(0, 30);

        return {
            similarity: Math.round(similarity),
            doc1Words: words1.length,
            doc2Words: words2.length,
            commonCount: intersection.size,
            commonWords
        };
    }

    function displayResults(result) {
        document.getElementById('scoreValue').textContent = result.similarity + '%';
        document.getElementById('similarityFill').style.width = result.similarity + '%';
        document.getElementById('doc1Words').textContent = result.doc1Words;
        document.getElementById('doc2Words').textContent = result.doc2Words;
        document.getElementById('commonCount').textContent = result.commonCount;
        document.getElementById('commonWords').innerHTML = result.commonWords.map(w =>
            `<span class="word-tag">${w.word} (${w.count})</span>`
        ).join('');
    }
});
