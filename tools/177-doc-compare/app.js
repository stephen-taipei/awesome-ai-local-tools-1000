/**
 * Doc Compare - Tool #177
 */
function init() {
    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    document.querySelectorAll('.upload-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.target;
            document.getElementById(target === 'text1' ? 'file1' : 'file2').click();
        });
    });

    document.getElementById('file1').addEventListener('change', (e) => loadFile(e, 'text1'));
    document.getElementById('file2').addEventListener('change', (e) => loadFile(e, 'text2'));
    document.getElementById('compareBtn').addEventListener('click', compare);
}

function loadFile(e, targetId) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            document.getElementById(targetId).value = ev.target.result;
        };
        reader.readAsText(file);
    }
}

function compare() {
    const text1 = document.getElementById('text1').value;
    const text2 = document.getElementById('text2').value;

    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');

    const diff = computeDiff(lines1, lines2);
    displayDiff(diff);

    document.getElementById('resultSection').style.display = 'block';
}

function computeDiff(lines1, lines2) {
    // Simple line-by-line diff using LCS
    const lcs = computeLCS(lines1, lines2);
    const result = [];

    let i = 0, j = 0, k = 0;
    while (i < lines1.length || j < lines2.length) {
        if (k < lcs.length && i < lines1.length && lines1[i] === lcs[k]) {
            if (j < lines2.length && lines2[j] === lcs[k]) {
                result.push({ type: 'unchanged', left: lines1[i], right: lines2[j] });
                i++; j++; k++;
            } else {
                result.push({ type: 'added', left: null, right: lines2[j] });
                j++;
            }
        } else if (k < lcs.length && j < lines2.length && lines2[j] === lcs[k]) {
            result.push({ type: 'removed', left: lines1[i], right: null });
            i++;
        } else if (i < lines1.length && j < lines2.length) {
            result.push({ type: 'removed', left: lines1[i], right: null });
            result.push({ type: 'added', left: null, right: lines2[j] });
            i++; j++;
        } else if (i < lines1.length) {
            result.push({ type: 'removed', left: lines1[i], right: null });
            i++;
        } else if (j < lines2.length) {
            result.push({ type: 'added', left: null, right: lines2[j] });
            j++;
        }
    }

    return result;
}

function computeLCS(arr1, arr2) {
    const m = arr1.length;
    const n = arr2.length;
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (arr1[i - 1] === arr2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }

    // Backtrack to find LCS
    const lcs = [];
    let i = m, j = n;
    while (i > 0 && j > 0) {
        if (arr1[i - 1] === arr2[j - 1]) {
            lcs.unshift(arr1[i - 1]);
            i--; j--;
        } else if (dp[i - 1][j] > dp[i][j - 1]) {
            i--;
        } else {
            j--;
        }
    }

    return lcs;
}

function displayDiff(diff) {
    const leftHtml = [];
    const rightHtml = [];
    let added = 0, removed = 0, unchanged = 0;
    let leftLine = 1, rightLine = 1;

    diff.forEach(item => {
        if (item.type === 'unchanged') {
            leftHtml.push(`<div class="diff-line unchanged"><span class="line-num">${leftLine++}</span>${escapeHtml(item.left)}</div>`);
            rightHtml.push(`<div class="diff-line unchanged"><span class="line-num">${rightLine++}</span>${escapeHtml(item.right)}</div>`);
            unchanged++;
        } else if (item.type === 'removed') {
            leftHtml.push(`<div class="diff-line removed"><span class="line-num">${leftLine++}</span>${escapeHtml(item.left)}</div>`);
            rightHtml.push(`<div class="diff-line removed"><span class="line-num"></span></div>`);
            removed++;
        } else if (item.type === 'added') {
            leftHtml.push(`<div class="diff-line added"><span class="line-num"></span></div>`);
            rightHtml.push(`<div class="diff-line added"><span class="line-num">${rightLine++}</span>${escapeHtml(item.right)}</div>`);
            added++;
        }
    });

    document.getElementById('diffLeft').innerHTML = leftHtml.join('');
    document.getElementById('diffRight').innerHTML = rightHtml.join('');
    document.getElementById('addedCount').textContent = added;
    document.getElementById('removedCount').textContent = removed;
    document.getElementById('unchangedCount').textContent = unchanged;

    // Sync scroll
    const left = document.getElementById('diffLeft');
    const right = document.getElementById('diffRight');
    left.addEventListener('scroll', () => { right.scrollTop = left.scrollTop; });
    right.addEventListener('scroll', () => { left.scrollTop = right.scrollTop; });
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

init();
