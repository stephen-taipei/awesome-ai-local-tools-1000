// Regex Tester - Tool #983
// Test and debug regular expressions locally in the browser

(function() {
    'use strict';

    // DOM Elements
    const regexInput = document.getElementById('regex-input');
    const testString = document.getElementById('test-string');
    const highlightedResult = document.getElementById('highlighted-result');
    const matchDetails = document.getElementById('match-details');
    const matchCount = document.getElementById('match-count');
    const regexStatus = document.getElementById('regex-status');
    const flagsDisplay = document.getElementById('flags-display');
    const flagBtns = document.querySelectorAll('.flag-btn');
    const sampleBtn = document.getElementById('sample-btn');
    const clearBtn = document.getElementById('clear-btn');
    const cheatsheetItems = document.querySelectorAll('.cheatsheet-item');
    const commonPatterns = document.querySelectorAll('.common-pattern');

    let activeFlags = new Set(['g']);
    let debounceTimeout = null;

    // Update flags display
    function updateFlagsDisplay() {
        flagsDisplay.textContent = Array.from(activeFlags).sort().join('');
    }

    // Flag button handling
    flagBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const flag = btn.dataset.flag;
            if (activeFlags.has(flag)) {
                activeFlags.delete(flag);
                btn.classList.remove('active');
            } else {
                activeFlags.add(flag);
                btn.classList.add('active');
            }
            updateFlagsDisplay();
            runTest();
        });
    });

    // Create regex from input
    function createRegex() {
        const pattern = regexInput.value;
        if (!pattern) return null;

        try {
            const flags = Array.from(activeFlags).join('');
            const regex = new RegExp(pattern, flags);
            regexInput.classList.remove('error-state');
            updateStatus('valid', `Valid pattern`);
            return regex;
        } catch (e) {
            regexInput.classList.add('error-state');
            updateStatus('error', e.message);
            return null;
        }
    }

    // Update status display
    function updateStatus(type, message) {
        const statusHtml = {
            valid: `<span class="text-green-600"><i class="fas fa-check-circle mr-1"></i>${message}</span>`,
            error: `<span class="text-red-600"><i class="fas fa-times-circle mr-1"></i>${message}</span>`,
            empty: `<span class="text-gray-400">Enter a pattern</span>`
        };
        regexStatus.innerHTML = statusHtml[type] || statusHtml.empty;
    }

    // Escape HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Highlight matches in text
    function highlightMatches(text, regex) {
        if (!regex) return escapeHtml(text);

        const matches = [];
        let match;

        // Clone regex to avoid issues with lastIndex
        const testRegex = new RegExp(regex.source, regex.flags);

        if (regex.global) {
            while ((match = testRegex.exec(text)) !== null) {
                matches.push({
                    index: match.index,
                    length: match[0].length,
                    value: match[0],
                    groups: match.slice(1)
                });
                // Prevent infinite loop for zero-length matches
                if (match[0].length === 0) {
                    testRegex.lastIndex++;
                }
            }
        } else {
            match = testRegex.exec(text);
            if (match) {
                matches.push({
                    index: match.index,
                    length: match[0].length,
                    value: match[0],
                    groups: match.slice(1)
                });
            }
        }

        if (matches.length === 0) {
            return escapeHtml(text);
        }

        // Build highlighted HTML
        let result = '';
        let lastIndex = 0;

        matches.forEach(m => {
            // Add text before match
            result += escapeHtml(text.substring(lastIndex, m.index));
            // Add highlighted match
            result += `<span class="highlight-match">${escapeHtml(m.value)}</span>`;
            lastIndex = m.index + m.length;
        });

        // Add remaining text
        result += escapeHtml(text.substring(lastIndex));

        return result;
    }

    // Get all matches with details
    function getMatchDetails(text, regex) {
        if (!regex) return [];

        const matches = [];
        let match;
        let matchIndex = 0;

        const testRegex = new RegExp(regex.source, regex.flags);

        if (regex.global) {
            while ((match = testRegex.exec(text)) !== null) {
                matches.push({
                    index: matchIndex++,
                    start: match.index,
                    end: match.index + match[0].length,
                    value: match[0],
                    groups: match.slice(1).map((g, i) => ({
                        index: i + 1,
                        value: g
                    })).filter(g => g.value !== undefined)
                });
                if (match[0].length === 0) {
                    testRegex.lastIndex++;
                }
            }
        } else {
            match = testRegex.exec(text);
            if (match) {
                matches.push({
                    index: 0,
                    start: match.index,
                    end: match.index + match[0].length,
                    value: match[0],
                    groups: match.slice(1).map((g, i) => ({
                        index: i + 1,
                        value: g
                    })).filter(g => g.value !== undefined)
                });
            }
        }

        return matches;
    }

    // Render match details
    function renderMatchDetails(matches) {
        if (matches.length === 0) {
            matchDetails.innerHTML = '<div class="text-gray-400 text-sm">No matches found</div>';
            return;
        }

        let html = '<div class="space-y-2">';

        matches.forEach(m => {
            html += `
                <div class="match-item p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div class="flex items-center justify-between mb-2">
                        <span class="font-medium text-gray-700">Match ${m.index + 1}</span>
                        <span class="text-xs text-gray-500">pos ${m.start}-${m.end}</span>
                    </div>
                    <div class="font-mono text-sm bg-white p-2 rounded border border-gray-200 break-all">
                        <span class="highlight-match">${escapeHtml(m.value)}</span>
                    </div>
                    ${m.groups.length > 0 ? `
                        <div class="mt-2 space-y-1">
                            ${m.groups.map(g => `
                                <div class="flex items-center gap-2 text-sm">
                                    <span class="text-gray-500">Group ${g.index}:</span>
                                    <span class="font-mono bg-blue-50 px-2 py-0.5 rounded text-blue-700">${escapeHtml(g.value || '')}</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
        });

        html += '</div>';
        matchDetails.innerHTML = html;
    }

    // Main test function
    function runTest() {
        const text = testString.value;
        const pattern = regexInput.value;

        if (!pattern) {
            updateStatus('empty');
            highlightedResult.innerHTML = '<span class="text-gray-400">Matches will be highlighted here...</span>';
            matchDetails.innerHTML = '<div class="text-gray-400 text-sm">No matches found</div>';
            matchCount.textContent = '0 matches';
            return;
        }

        const regex = createRegex();

        if (!regex) {
            highlightedResult.innerHTML = '<span class="text-gray-400">Fix the regex pattern to see matches...</span>';
            matchDetails.innerHTML = '<div class="text-gray-400 text-sm">Invalid regex pattern</div>';
            matchCount.textContent = '0 matches';
            return;
        }

        if (!text) {
            highlightedResult.innerHTML = '<span class="text-gray-400">Enter text to test...</span>';
            matchDetails.innerHTML = '<div class="text-gray-400 text-sm">No test string provided</div>';
            matchCount.textContent = '0 matches';
            return;
        }

        // Highlight matches
        const highlighted = highlightMatches(text, regex);
        highlightedResult.innerHTML = highlighted;

        // Get and render match details
        const matches = getMatchDetails(text, regex);
        renderMatchDetails(matches);

        // Update match count
        matchCount.textContent = `${matches.length} match${matches.length !== 1 ? 'es' : ''}`;
    }

    // Debounced test
    function debouncedTest() {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(runTest, 150);
    }

    // Event listeners
    regexInput.addEventListener('input', debouncedTest);
    testString.addEventListener('input', debouncedTest);

    // Cheatsheet click to insert
    cheatsheetItems.forEach(item => {
        item.addEventListener('click', () => {
            const pattern = item.dataset.pattern;
            const start = regexInput.selectionStart;
            const end = regexInput.selectionEnd;
            const value = regexInput.value;
            regexInput.value = value.substring(0, start) + pattern + value.substring(end);
            regexInput.focus();
            regexInput.setSelectionRange(start + pattern.length, start + pattern.length);
            debouncedTest();
            showNotification(`Inserted: ${pattern}`, 'info');
        });
    });

    // Common patterns click
    commonPatterns.forEach(btn => {
        btn.addEventListener('click', () => {
            regexInput.value = btn.dataset.pattern;
            testString.value = btn.dataset.sample || '';
            runTest();
            showNotification('Pattern loaded', 'success');
        });
    });

    // Sample button
    sampleBtn.addEventListener('click', () => {
        regexInput.value = '\\b[A-Z][a-z]+\\b';
        testString.value = `Hello World! This is a Test.
John and Jane went to Paris.
The Quick Brown Fox jumps over the Lazy Dog.`;
        runTest();
        showNotification('Sample loaded', 'info');
    });

    // Clear button
    clearBtn.addEventListener('click', () => {
        regexInput.value = '';
        testString.value = '';
        regexInput.classList.remove('error-state');
        runTest();
        showNotification('Cleared', 'success');
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            runTest();
        }
    });

    // Show notification
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

    // Initialize
    runTest();

})();
