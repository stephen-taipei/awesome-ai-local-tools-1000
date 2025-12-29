/**
 * Document Version Compare - Tool #707
 */

document.addEventListener('DOMContentLoaded', () => {
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

    const file1 = document.getElementById('file1');
    const file2 = document.getElementById('file2');
    const text1 = document.getElementById('text1');
    const text2 = document.getElementById('text2');
    const compareBtn = document.getElementById('compareBtn');
    const loading = document.getElementById('loading');
    const results = document.getElementById('results');
    const diffView = document.getElementById('diffView');

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
        if (!t1 || !t2) { alert('Please enter both versions'); return; }

        loading.classList.add('visible');
        results.classList.remove('visible');

        setTimeout(() => {
            const diff = computeDiff(t1, t2);
            displayDiff(diff);
            loading.classList.remove('visible');
            results.classList.add('visible');
        }, 800);
    });

    function computeDiff(text1, text2) {
        const lines1 = text1.split('\n');
        const lines2 = text2.split('\n');
        const result = [];
        let added = 0, removed = 0;

        // Simple line-by-line diff using LCS approach
        const lcs = [];
        for (let i = 0; i <= lines1.length; i++) {
            lcs[i] = [];
            for (let j = 0; j <= lines2.length; j++) {
                if (i === 0 || j === 0) lcs[i][j] = 0;
                else if (lines1[i-1] === lines2[j-1]) lcs[i][j] = lcs[i-1][j-1] + 1;
                else lcs[i][j] = Math.max(lcs[i-1][j], lcs[i][j-1]);
            }
        }

        // Backtrack to find diff
        let i = lines1.length, j = lines2.length;
        const diff = [];
        while (i > 0 || j > 0) {
            if (i > 0 && j > 0 && lines1[i-1] === lines2[j-1]) {
                diff.unshift({ type: 'unchanged', text: lines1[i-1] });
                i--; j--;
            } else if (j > 0 && (i === 0 || lcs[i][j-1] >= lcs[i-1][j])) {
                diff.unshift({ type: 'added', text: lines2[j-1] });
                added++;
                j--;
            } else {
                diff.unshift({ type: 'removed', text: lines1[i-1] });
                removed++;
                i--;
            }
        }

        const total = lines1.length + lines2.length;
        const unchanged = diff.filter(d => d.type === 'unchanged').length * 2;
        const similarity = total > 0 ? Math.round((unchanged / total) * 100) : 100;

        return { diff, added, removed, similarity };
    }

    function displayDiff(result) {
        document.getElementById('addedCount').textContent = result.added;
        document.getElementById('removedCount').textContent = result.removed;
        document.getElementById('changedCount').textContent = result.added + result.removed;
        document.getElementById('similarity').textContent = result.similarity + '%';

        diffView.innerHTML = result.diff.map(d =>
            `<div class="diff-line ${d.type}">${d.type === 'added' ? '+ ' : d.type === 'removed' ? '- ' : '  '}${escapeHtml(d.text) || '&nbsp;'}</div>`
        ).join('');
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});
