// Diff Checker - Tool #994
// Compare two texts and highlight differences

(function() {
    'use strict';

    // DOM Elements
    const textOriginal = document.getElementById('text-original');
    const textModified = document.getElementById('text-modified');
    const compareBtn = document.getElementById('compare-btn');
    const sampleBtn = document.getElementById('sample-btn');
    const swapBtn = document.getElementById('swap-btn');
    const clearBtn = document.getElementById('clear-btn');

    const ignoreCase = document.getElementById('ignore-case');
    const ignoreWhitespace = document.getElementById('ignore-whitespace');
    const showLineNumbers = document.getElementById('show-line-numbers');

    const stats = document.getElementById('stats');
    const statAdded = document.getElementById('stat-added');
    const statRemoved = document.getElementById('stat-removed');
    const statChanged = document.getElementById('stat-changed');
    const statUnchanged = document.getElementById('stat-unchanged');

    const diffResult = document.getElementById('diff-result');
    const diffOutput = document.getElementById('diff-output');
    const sideBySide = document.getElementById('side-by-side');
    const sideOriginal = document.getElementById('side-original');
    const sideModified = document.getElementById('side-modified');

    // Sample texts
    const sampleOriginal = `function greet(name) {
    console.log("Hello, " + name);
    return true;
}

const users = ["Alice", "Bob", "Charlie"];

for (let i = 0; i < users.length; i++) {
    greet(users[i]);
}`;

    const sampleModified = `function greet(name, greeting = "Hello") {
    console.log(greeting + ", " + name + "!");
    return true;
}

const users = ["Alice", "Bob", "Charlie", "David"];

users.forEach(user => {
    greet(user);
});`;

    // ========== Event Listeners ==========

    compareBtn.addEventListener('click', compareDiff);

    sampleBtn.addEventListener('click', () => {
        textOriginal.value = sampleOriginal;
        textModified.value = sampleModified;
        showNotification('Sample loaded', 'success');
    });

    swapBtn.addEventListener('click', () => {
        const temp = textOriginal.value;
        textOriginal.value = textModified.value;
        textModified.value = temp;
        showNotification('Swapped', 'success');
    });

    clearBtn.addEventListener('click', () => {
        textOriginal.value = '';
        textModified.value = '';
        diffResult.classList.add('hidden');
        sideBySide.classList.add('hidden');
        stats.classList.add('hidden');
        showNotification('Cleared', 'success');
    });

    document.querySelectorAll('.paste-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            try {
                const text = await navigator.clipboard.readText();
                document.getElementById(btn.dataset.target).value = text;
                showNotification('Pasted', 'success');
            } catch (e) {
                showNotification('Failed to paste', 'error');
            }
        });
    });

    // ========== Diff Algorithm ==========

    function compareDiff() {
        const original = textOriginal.value;
        const modified = textModified.value;

        if (!original && !modified) {
            showNotification('Please enter text to compare', 'warning');
            return;
        }

        const originalLines = original.split('\n');
        const modifiedLines = modified.split('\n');

        // Compute LCS (Longest Common Subsequence)
        const diff = computeDiff(originalLines, modifiedLines);

        // Display results
        displayDiff(diff, originalLines, modifiedLines);
        displaySideBySide(diff, originalLines, modifiedLines);

        // Update stats
        let added = 0, removed = 0, changed = 0, unchanged = 0;
        diff.forEach(item => {
            if (item.type === 'add') added++;
            else if (item.type === 'remove') removed++;
            else if (item.type === 'change') changed++;
            else unchanged++;
        });

        stats.classList.remove('hidden');
        statAdded.textContent = added;
        statRemoved.textContent = removed;
        statChanged.textContent = changed;
        statUnchanged.textContent = unchanged;

        diffResult.classList.remove('hidden');
        sideBySide.classList.remove('hidden');

        showNotification('Comparison complete', 'success');
    }

    function computeDiff(original, modified) {
        const processLine = (line) => {
            let processed = line;
            if (ignoreCase.checked) processed = processed.toLowerCase();
            if (ignoreWhitespace.checked) processed = processed.replace(/\s+/g, ' ').trim();
            return processed;
        };

        const n = original.length;
        const m = modified.length;

        // Build LCS table
        const dp = Array(n + 1).fill(null).map(() => Array(m + 1).fill(0));

        for (let i = 1; i <= n; i++) {
            for (let j = 1; j <= m; j++) {
                if (processLine(original[i - 1]) === processLine(modified[j - 1])) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                } else {
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                }
            }
        }

        // Backtrack to find diff
        const result = [];
        let i = n, j = m;

        while (i > 0 || j > 0) {
            if (i > 0 && j > 0 && processLine(original[i - 1]) === processLine(modified[j - 1])) {
                result.unshift({
                    type: 'unchanged',
                    originalLine: i,
                    modifiedLine: j,
                    originalText: original[i - 1],
                    modifiedText: modified[j - 1]
                });
                i--;
                j--;
            } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
                result.unshift({
                    type: 'add',
                    modifiedLine: j,
                    modifiedText: modified[j - 1]
                });
                j--;
            } else if (i > 0) {
                result.unshift({
                    type: 'remove',
                    originalLine: i,
                    originalText: original[i - 1]
                });
                i--;
            }
        }

        // Detect changes (adjacent remove/add pairs)
        for (let k = 0; k < result.length - 1; k++) {
            if (result[k].type === 'remove' && result[k + 1].type === 'add') {
                result[k].type = 'change';
                result[k].modifiedLine = result[k + 1].modifiedLine;
                result[k].modifiedText = result[k + 1].modifiedText;
                result.splice(k + 1, 1);
            }
        }

        return result;
    }

    function displayDiff(diff, original, modified) {
        const showNumbers = showLineNumbers.checked;
        let html = '';

        diff.forEach(item => {
            const lineNumO = item.originalLine ? String(item.originalLine).padStart(4) : '    ';
            const lineNumM = item.modifiedLine ? String(item.modifiedLine).padStart(4) : '    ';

            if (item.type === 'unchanged') {
                html += `<div class="diff-unchanged flex">`;
                if (showNumbers) {
                    html += `<span class="line-number px-2 text-gray-400 border-r border-gray-200">${lineNumO}</span>`;
                    html += `<span class="line-number px-2 text-gray-400 border-r border-gray-200">${lineNumM}</span>`;
                }
                html += `<span class="px-3 py-0.5 flex-1">${escapeHtml(item.originalText)}</span>`;
                html += `</div>`;
            } else if (item.type === 'add') {
                html += `<div class="diff-added flex">`;
                if (showNumbers) {
                    html += `<span class="line-number px-2 text-gray-400 border-r border-gray-200">    </span>`;
                    html += `<span class="line-number px-2 text-green-600 border-r border-gray-200">${lineNumM}</span>`;
                }
                html += `<span class="px-3 py-0.5 flex-1">+ ${escapeHtml(item.modifiedText)}</span>`;
                html += `</div>`;
            } else if (item.type === 'remove') {
                html += `<div class="diff-removed flex">`;
                if (showNumbers) {
                    html += `<span class="line-number px-2 text-red-600 border-r border-gray-200">${lineNumO}</span>`;
                    html += `<span class="line-number px-2 text-gray-400 border-r border-gray-200">    </span>`;
                }
                html += `<span class="px-3 py-0.5 flex-1">- ${escapeHtml(item.originalText)}</span>`;
                html += `</div>`;
            } else if (item.type === 'change') {
                // Show removed line
                html += `<div class="diff-removed flex">`;
                if (showNumbers) {
                    html += `<span class="line-number px-2 text-red-600 border-r border-gray-200">${lineNumO}</span>`;
                    html += `<span class="line-number px-2 text-gray-400 border-r border-gray-200">    </span>`;
                }
                html += `<span class="px-3 py-0.5 flex-1">- ${highlightCharDiff(item.originalText, item.modifiedText, 'remove')}</span>`;
                html += `</div>`;

                // Show added line
                html += `<div class="diff-added flex">`;
                if (showNumbers) {
                    html += `<span class="line-number px-2 text-gray-400 border-r border-gray-200">    </span>`;
                    html += `<span class="line-number px-2 text-green-600 border-r border-gray-200">${lineNumM}</span>`;
                }
                html += `<span class="px-3 py-0.5 flex-1">+ ${highlightCharDiff(item.modifiedText, item.originalText, 'add')}</span>`;
                html += `</div>`;
            }
        });

        diffOutput.innerHTML = html;
    }

    function displaySideBySide(diff, original, modified) {
        const showNumbers = showLineNumbers.checked;
        let htmlO = '';
        let htmlM = '';

        diff.forEach(item => {
            const lineNumO = item.originalLine ? String(item.originalLine).padStart(4) : '    ';
            const lineNumM = item.modifiedLine ? String(item.modifiedLine).padStart(4) : '    ';

            if (item.type === 'unchanged') {
                htmlO += `<div class="diff-unchanged flex">`;
                if (showNumbers) htmlO += `<span class="line-number px-2 text-gray-400 border-r border-gray-200">${lineNumO}</span>`;
                htmlO += `<span class="px-3 py-0.5 flex-1">${escapeHtml(item.originalText)}</span></div>`;

                htmlM += `<div class="diff-unchanged flex">`;
                if (showNumbers) htmlM += `<span class="line-number px-2 text-gray-400 border-r border-gray-200">${lineNumM}</span>`;
                htmlM += `<span class="px-3 py-0.5 flex-1">${escapeHtml(item.modifiedText)}</span></div>`;
            } else if (item.type === 'add') {
                htmlO += `<div class="diff-unchanged flex opacity-50">`;
                if (showNumbers) htmlO += `<span class="line-number px-2 text-gray-400 border-r border-gray-200">    </span>`;
                htmlO += `<span class="px-3 py-0.5 flex-1"></span></div>`;

                htmlM += `<div class="diff-added flex">`;
                if (showNumbers) htmlM += `<span class="line-number px-2 text-green-600 border-r border-gray-200">${lineNumM}</span>`;
                htmlM += `<span class="px-3 py-0.5 flex-1">${escapeHtml(item.modifiedText)}</span></div>`;
            } else if (item.type === 'remove') {
                htmlO += `<div class="diff-removed flex">`;
                if (showNumbers) htmlO += `<span class="line-number px-2 text-red-600 border-r border-gray-200">${lineNumO}</span>`;
                htmlO += `<span class="px-3 py-0.5 flex-1">${escapeHtml(item.originalText)}</span></div>`;

                htmlM += `<div class="diff-unchanged flex opacity-50">`;
                if (showNumbers) htmlM += `<span class="line-number px-2 text-gray-400 border-r border-gray-200">    </span>`;
                htmlM += `<span class="px-3 py-0.5 flex-1"></span></div>`;
            } else if (item.type === 'change') {
                htmlO += `<div class="diff-changed flex">`;
                if (showNumbers) htmlO += `<span class="line-number px-2 text-yellow-600 border-r border-gray-200">${lineNumO}</span>`;
                htmlO += `<span class="px-3 py-0.5 flex-1">${highlightCharDiff(item.originalText, item.modifiedText, 'remove')}</span></div>`;

                htmlM += `<div class="diff-changed flex">`;
                if (showNumbers) htmlM += `<span class="line-number px-2 text-yellow-600 border-r border-gray-200">${lineNumM}</span>`;
                htmlM += `<span class="px-3 py-0.5 flex-1">${highlightCharDiff(item.modifiedText, item.originalText, 'add')}</span></div>`;
            }
        });

        sideOriginal.innerHTML = htmlO;
        sideModified.innerHTML = htmlM;

        // Sync scrolling
        sideOriginal.onscroll = () => {
            sideModified.scrollTop = sideOriginal.scrollTop;
            sideModified.scrollLeft = sideOriginal.scrollLeft;
        };
        sideModified.onscroll = () => {
            sideOriginal.scrollTop = sideModified.scrollTop;
            sideOriginal.scrollLeft = sideModified.scrollLeft;
        };
    }

    function highlightCharDiff(text, compare, type) {
        // Simple character-level diff highlighting
        const result = [];
        const textChars = text.split('');
        const compareChars = compare.split('');

        let i = 0, j = 0;

        while (i < textChars.length) {
            if (j < compareChars.length && textChars[i] === compareChars[j]) {
                result.push(escapeHtml(textChars[i]));
                i++;
                j++;
            } else {
                const className = type === 'add' ? 'highlight-char-add' : 'highlight-char-remove';
                result.push(`<span class="${className}">${escapeHtml(textChars[i])}</span>`);
                i++;
            }
        }

        return result.join('');
    }

    // ========== Utility ==========

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function showNotification(message, type = 'info') {
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };

        const notification = document.createElement('div');
        notification.className = `fixed bottom-4 right-4 ${colors[type]} text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity duration-300`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

})();
