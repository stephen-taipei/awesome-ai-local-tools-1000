/**
 * Plagiarism Detector - Tool #150
 */
function detectLanguage(text) { return /[\u4e00-\u9fff]/.test(text) ? 'zh' : 'en'; }

function tokenize(text, lang) {
    if (lang === 'zh') return text.match(/[\u4e00-\u9fff]+/g) || [];
    return text.toLowerCase().match(/[a-z]+/g) || [];
}

function getNGrams(words, n) {
    const ngrams = [];
    for (let i = 0; i <= words.length - n; i++) {
        ngrams.push(words.slice(i, i + n).join(' '));
    }
    return ngrams;
}

function detectPlagiarism(textA, textB) {
    const lang = detectLanguage(textA + textB);
    const wordsA = tokenize(textA, lang);
    const wordsB = tokenize(textB, lang);

    // Get n-grams (phrases of 3-4 words)
    const ngramSize = lang === 'zh' ? 3 : 4;
    const ngramsA = new Set(getNGrams(wordsA, ngramSize));
    const ngramsB = getNGrams(wordsB, ngramSize);

    // Find matches
    const matches = [];
    ngramsB.forEach(ngram => {
        if (ngramsA.has(ngram)) {
            matches.push(ngram);
        }
    });

    // Calculate similarity using Jaccard index
    const setA = new Set(wordsA);
    const setB = new Set(wordsB);
    const intersection = [...setA].filter(x => setB.has(x));
    const union = new Set([...setA, ...setB]);
    const jaccard = union.size > 0 ? (intersection.length / union.size) * 100 : 0;

    // Combine with n-gram matching
    const ngramSimilarity = ngramsA.size > 0 ? (matches.length / ngramsA.size) * 100 : 0;
    const similarity = Math.round((jaccard * 0.4 + ngramSimilarity * 0.6));

    let verdict, level;
    if (similarity < 30) { verdict = '原創度高'; level = 'low'; }
    else if (similarity < 60) { verdict = '部分相似'; level = 'medium'; }
    else { verdict = '高度相似'; level = 'high'; }

    return {
        similarity: Math.min(similarity, 100),
        verdict,
        level,
        matches: [...new Set(matches)].slice(0, 5)
    };
}

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    document.getElementById('detectBtn').addEventListener('click', () => {
        const textA = document.getElementById('textA').value.trim();
        const textB = document.getElementById('textB').value.trim();
        if (!textA || !textB) return;

        const result = detectPlagiarism(textA, textB);
        document.getElementById('resultSection').style.display = 'block';
        document.getElementById('similarityDisplay').innerHTML = `
            <div class="similarity-value ${result.level}">${result.similarity}%</div>
            <div class="similarity-label">相似度</div>
            <div class="similarity-verdict ${result.level}">${result.verdict}</div>
        `;

        const matchesSection = document.getElementById('matchesSection');
        if (result.matches.length > 0) {
            matchesSection.style.display = 'block';
            document.getElementById('matchesList').innerHTML = result.matches.map(m => `<div class="match-item">"${m}"</div>`).join('');
        } else {
            matchesSection.style.display = 'none';
        }
    });

    document.querySelectorAll('.example-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('textA').value = btn.dataset.a;
            document.getElementById('textB').value = btn.dataset.b;
            document.getElementById('detectBtn').click();
        });
    });
}
init();
