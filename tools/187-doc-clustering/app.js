/**
 * Doc Clustering - Tool #187
 */
const clusterColors = ['#f472b6', '#60a5fa', '#34d399', '#fbbf24', '#a78bfa', '#fb7185', '#38bdf8', '#4ade80', '#facc15', '#c084fc'];

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    document.getElementById('loadSampleBtn').addEventListener('click', loadSample);
    document.getElementById('clusterBtn').addEventListener('click', cluster);
}

function loadSample() {
    document.getElementById('textInput').value = `蘋果發布了新款 iPhone，搭載更快的處理器。

特斯拉的電動車銷量在亞洲市場持續增長。

微軟推出了新版 Windows 作業系統。

台積電宣布擴大先進製程產能。

亞馬遜收購了一家人工智慧新創公司。

豐田汽車計劃在未來五年內推出多款電動車。

Google 更新了搜尋演算法以提供更好的結果。

福特汽車投資十億美元建設電動車工廠。

三星發布了新款折疊螢幕手機。

英特爾計劃在德國建設新的晶片製造廠。

本田宣布與 Sony 合作開發電動車。

Nvidia 的 GPU 在 AI 訓練市場佔據主導地位。`;
}

function cluster() {
    const text = document.getElementById('textInput').value.trim();
    const k = parseInt(document.getElementById('clusterCount').value) || 3;
    if (!text) return;

    const docs = text.split(/\n\s*\n/).filter(d => d.trim());
    if (docs.length < k) {
        alert(`文本數量 (${docs.length}) 少於分群數量 (${k})`);
        return;
    }

    const clusters = kMeansClustering(docs, k);
    displayResults(clusters);
}

function tokenize(text) {
    return text.toLowerCase()
        .replace(/[，。！？、；：""''（）\[\]{}]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 1);
}

function getTermFrequency(docs) {
    const vocabulary = new Set();
    const docTokens = docs.map(doc => {
        const tokens = tokenize(doc);
        tokens.forEach(t => vocabulary.add(t));
        return tokens;
    });

    const vocab = Array.from(vocabulary);
    const vectors = docTokens.map(tokens => {
        const freq = {};
        tokens.forEach(t => freq[t] = (freq[t] || 0) + 1);
        return vocab.map(w => freq[w] || 0);
    });

    return { vectors, vocab };
}

function cosineSimilarity(a, b) {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
}

function kMeansClustering(docs, k) {
    const { vectors, vocab } = getTermFrequency(docs);

    // Initialize centroids randomly
    let centroids = [];
    const indices = [...Array(docs.length).keys()];
    for (let i = 0; i < k; i++) {
        const idx = indices.splice(Math.floor(Math.random() * indices.length), 1)[0];
        centroids.push([...vectors[idx]]);
    }

    let assignments = new Array(docs.length).fill(0);
    let iterations = 0;

    while (iterations < 20) {
        // Assign to nearest centroid
        const newAssignments = vectors.map(v => {
            let best = 0, bestSim = -1;
            centroids.forEach((c, i) => {
                const sim = cosineSimilarity(v, c);
                if (sim > bestSim) { bestSim = sim; best = i; }
            });
            return best;
        });

        // Check convergence
        if (JSON.stringify(newAssignments) === JSON.stringify(assignments)) break;
        assignments = newAssignments;

        // Update centroids
        centroids = centroids.map((_, i) => {
            const members = vectors.filter((_, j) => assignments[j] === i);
            if (members.length === 0) return centroids[i];
            const avg = new Array(vocab.length).fill(0);
            members.forEach(m => m.forEach((v, j) => avg[j] += v));
            return avg.map(v => v / members.length);
        });

        iterations++;
    }

    // Build cluster results
    const clusters = Array.from({ length: k }, () => ({ docs: [], keywords: [] }));
    docs.forEach((doc, i) => {
        clusters[assignments[i]].docs.push(doc.trim());
    });

    // Extract keywords for each cluster
    clusters.forEach((cluster, ci) => {
        const termScores = {};
        cluster.docs.forEach(doc => {
            tokenize(doc).forEach(term => {
                termScores[term] = (termScores[term] || 0) + 1;
            });
        });
        cluster.keywords = Object.entries(termScores)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(e => e[0]);
    });

    return clusters.filter(c => c.docs.length > 0);
}

function displayResults(clusters) {
    document.getElementById('clustersList').innerHTML = clusters.map((c, i) => `
        <div class="cluster-group">
            <div class="cluster-header" style="background: ${clusterColors[i % clusterColors.length]}20; border-left: 4px solid ${clusterColors[i % clusterColors.length]}">
                <span>群組 ${i + 1}</span>
                <span class="cluster-keywords">${c.keywords.join(', ')}</span>
            </div>
            <div class="cluster-items">
                ${c.docs.map(d => `<div class="cluster-item">${escapeHtml(d.substring(0, 100))}${d.length > 100 ? '...' : ''}</div>`).join('')}
            </div>
        </div>
    `).join('');

    document.getElementById('resultsSection').style.display = 'block';
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

init();
