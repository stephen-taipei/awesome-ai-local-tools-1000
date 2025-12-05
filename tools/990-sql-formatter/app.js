// SQL Formatter - Tool #990
// Format and beautify SQL queries locally

(function() {
    'use strict';

    // DOM Elements
    const sqlInput = document.getElementById('sql-input');
    const sqlOutput = document.getElementById('sql-output');
    const formatBtn = document.getElementById('format-btn');
    const minifyBtn = document.getElementById('minify-btn');
    const pasteBtn = document.getElementById('paste-btn');
    const sampleBtn = document.getElementById('sample-btn');
    const clearBtn = document.getElementById('clear-btn');
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');

    const indentSize = document.getElementById('indent-size');
    const keywordCase = document.getElementById('keyword-case');
    const sqlDialect = document.getElementById('sql-dialect');
    const lineBetween = document.getElementById('line-between');

    const stats = document.getElementById('stats');
    const statLines = document.getElementById('stat-lines');
    const statChars = document.getElementById('stat-chars');
    const statStatements = document.getElementById('stat-statements');
    const statKeywords = document.getElementById('stat-keywords');

    // SQL Keywords
    const keywords = [
        'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN',
        'JOIN', 'INNER', 'LEFT', 'RIGHT', 'OUTER', 'FULL', 'CROSS', 'ON',
        'GROUP', 'BY', 'HAVING', 'ORDER', 'ASC', 'DESC', 'LIMIT', 'OFFSET',
        'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE',
        'CREATE', 'TABLE', 'INDEX', 'VIEW', 'DATABASE', 'SCHEMA',
        'ALTER', 'DROP', 'TRUNCATE', 'ADD', 'COLUMN', 'CONSTRAINT',
        'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'UNIQUE', 'CHECK', 'DEFAULT',
        'NULL', 'IS', 'AS', 'DISTINCT', 'ALL', 'ANY', 'EXISTS',
        'UNION', 'INTERSECT', 'EXCEPT', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
        'IF', 'ELSE', 'BEGIN', 'COMMIT', 'ROLLBACK', 'TRANSACTION',
        'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'COALESCE', 'NULLIF',
        'CAST', 'CONVERT', 'SUBSTRING', 'CONCAT', 'TRIM', 'UPPER', 'LOWER',
        'WITH', 'RECURSIVE', 'OVER', 'PARTITION', 'ROW_NUMBER', 'RANK',
        'TOP', 'FETCH', 'NEXT', 'ROWS', 'ONLY', 'PERCENT', 'TIES'
    ];

    // Major clauses that start new lines
    const majorClauses = [
        'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN',
        'OUTER JOIN', 'FULL JOIN', 'CROSS JOIN', 'LEFT OUTER JOIN', 'RIGHT OUTER JOIN',
        'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT', 'OFFSET', 'UNION', 'INTERSECT', 'EXCEPT',
        'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM',
        'CREATE TABLE', 'CREATE INDEX', 'CREATE VIEW', 'ALTER TABLE', 'DROP TABLE',
        'ON', 'AND', 'OR', 'WHEN', 'ELSE', 'THEN', 'END'
    ];

    // Sample SQL
    const sampleSQL = `select u.id, u.name, u.email, count(o.id) as order_count, sum(o.total) as total_spent from users u left join orders o on u.id = o.user_id where u.status = 'active' and u.created_at >= '2024-01-01' group by u.id, u.name, u.email having count(o.id) > 5 order by total_spent desc limit 100;

insert into products (name, price, category_id, created_at) values ('New Product', 29.99, 5, now());

update users set last_login = now(), login_count = login_count + 1 where id = 123;`;

    let formattedSQL = '';

    // ========== Event Listeners ==========

    formatBtn.addEventListener('click', formatSQL);
    minifyBtn.addEventListener('click', minifySQL);

    pasteBtn.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            sqlInput.value = text;
            showNotification('Pasted', 'success');
        } catch (e) {
            showNotification('Failed to paste', 'error');
        }
    });

    sampleBtn.addEventListener('click', () => {
        sqlInput.value = sampleSQL;
        showNotification('Sample loaded', 'success');
    });

    clearBtn.addEventListener('click', () => {
        sqlInput.value = '';
        sqlOutput.innerHTML = '<code class="text-gray-400">Formatted SQL will appear here...</code>';
        stats.classList.add('hidden');
        formattedSQL = '';
        showNotification('Cleared', 'success');
    });

    copyBtn.addEventListener('click', async () => {
        if (!formattedSQL) {
            showNotification('Nothing to copy', 'warning');
            return;
        }
        try {
            await navigator.clipboard.writeText(formattedSQL);
            showNotification('Copied', 'success');
        } catch (e) {
            showNotification('Failed to copy', 'error');
        }
    });

    downloadBtn.addEventListener('click', () => {
        if (!formattedSQL) {
            showNotification('Nothing to download', 'warning');
            return;
        }
        const blob = new Blob([formattedSQL], { type: 'text/sql' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'formatted.sql';
        a.click();
        URL.revokeObjectURL(url);
        showNotification('Downloaded', 'success');
    });

    // ========== Format SQL ==========

    function formatSQL() {
        const input = sqlInput.value.trim();
        if (!input) {
            showNotification('Please enter SQL', 'warning');
            return;
        }

        try {
            const indent = getIndent();
            const caseStyle = keywordCase.value;

            // Split into statements
            const statements = splitStatements(input);
            const formattedStatements = statements.map(stmt => formatStatement(stmt, indent, caseStyle));

            formattedSQL = lineBetween.checked
                ? formattedStatements.join('\n\n')
                : formattedStatements.join('\n');

            // Display with syntax highlighting
            sqlOutput.innerHTML = Prism.highlight(formattedSQL, Prism.languages.sql, 'sql');

            // Update stats
            updateStats(formattedSQL, statements.length);

            showNotification('Formatted', 'success');
        } catch (e) {
            showNotification('Error: ' + e.message, 'error');
        }
    }

    function formatStatement(sql, indent, caseStyle) {
        // Normalize whitespace
        sql = sql.replace(/\s+/g, ' ').trim();

        // Handle keyword case
        sql = applyKeywordCase(sql, caseStyle);

        // Tokenize
        const tokens = tokenize(sql);

        // Format
        let result = '';
        let currentIndent = 0;
        let inParenthesis = 0;
        let lastToken = '';

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            const nextToken = tokens[i + 1] || '';

            // Handle parentheses
            if (token === '(') {
                inParenthesis++;
                result += token;
                continue;
            }
            if (token === ')') {
                inParenthesis--;
                result += token;
                continue;
            }

            // Check for major clause
            const upperToken = token.toUpperCase();
            const twoWordClause = `${upperToken} ${(nextToken || '').toUpperCase()}`;

            let isMajorClause = false;
            let clauseLen = 1;

            if (majorClauses.includes(twoWordClause)) {
                isMajorClause = true;
                clauseLen = 2;
            } else if (majorClauses.includes(upperToken)) {
                isMajorClause = true;
            }

            if (isMajorClause && inParenthesis === 0) {
                // Determine indent level
                if (['AND', 'OR'].includes(upperToken)) {
                    result += '\n' + indent.repeat(currentIndent + 1) + token + ' ';
                } else if (['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP', 'WITH'].some(k => upperToken.startsWith(k))) {
                    currentIndent = 0;
                    if (result.trim()) result += '\n';
                    result += token + ' ';
                } else {
                    result += '\n' + indent + token + ' ';
                }

                // Skip next token if two-word clause
                if (clauseLen === 2) {
                    result += nextToken + ' ';
                    i++;
                }
            } else {
                // Regular token
                if (token === ',') {
                    result += token + '\n' + indent.repeat(currentIndent + 1);
                } else {
                    result += token + ' ';
                }
            }

            lastToken = token;
        }

        return result.trim().replace(/  +/g, ' ').replace(/ +\n/g, '\n');
    }

    function tokenize(sql) {
        const tokens = [];
        let current = '';
        let inString = false;
        let stringChar = '';

        for (let i = 0; i < sql.length; i++) {
            const char = sql[i];

            // Handle strings
            if ((char === "'" || char === '"') && sql[i - 1] !== '\\') {
                if (!inString) {
                    if (current.trim()) tokens.push(current.trim());
                    current = char;
                    inString = true;
                    stringChar = char;
                } else if (char === stringChar) {
                    current += char;
                    tokens.push(current);
                    current = '';
                    inString = false;
                } else {
                    current += char;
                }
                continue;
            }

            if (inString) {
                current += char;
                continue;
            }

            // Handle special characters
            if ('(),;'.includes(char)) {
                if (current.trim()) tokens.push(current.trim());
                tokens.push(char);
                current = '';
                continue;
            }

            // Handle whitespace
            if (/\s/.test(char)) {
                if (current.trim()) tokens.push(current.trim());
                current = '';
                continue;
            }

            current += char;
        }

        if (current.trim()) tokens.push(current.trim());

        return tokens;
    }

    function applyKeywordCase(sql, caseStyle) {
        if (caseStyle === 'preserve') return sql;

        // Create regex pattern for all keywords
        const pattern = new RegExp('\\b(' + keywords.join('|') + ')\\b', 'gi');

        return sql.replace(pattern, (match) => {
            return caseStyle === 'upper' ? match.toUpperCase() : match.toLowerCase();
        });
    }

    function splitStatements(sql) {
        const statements = [];
        let current = '';
        let inString = false;
        let stringChar = '';

        for (let i = 0; i < sql.length; i++) {
            const char = sql[i];

            if ((char === "'" || char === '"') && sql[i - 1] !== '\\') {
                if (!inString) {
                    inString = true;
                    stringChar = char;
                } else if (char === stringChar) {
                    inString = false;
                }
            }

            if (char === ';' && !inString) {
                if (current.trim()) {
                    statements.push(current.trim() + ';');
                }
                current = '';
            } else {
                current += char;
            }
        }

        if (current.trim()) {
            statements.push(current.trim());
        }

        return statements;
    }

    function getIndent() {
        const value = indentSize.value;
        if (value === 'tab') return '\t';
        return ' '.repeat(parseInt(value));
    }

    // ========== Minify SQL ==========

    function minifySQL() {
        const input = sqlInput.value.trim();
        if (!input) {
            showNotification('Please enter SQL', 'warning');
            return;
        }

        try {
            // Remove comments
            let minified = input
                .replace(/--.*$/gm, '')  // Single line comments
                .replace(/\/\*[\s\S]*?\*\//g, '');  // Multi-line comments

            // Normalize whitespace
            minified = minified.replace(/\s+/g, ' ').trim();

            // Remove spaces around operators
            minified = minified
                .replace(/\s*,\s*/g, ',')
                .replace(/\s*;\s*/g, ';')
                .replace(/\(\s+/g, '(')
                .replace(/\s+\)/g, ')');

            formattedSQL = minified;
            sqlOutput.innerHTML = Prism.highlight(formattedSQL, Prism.languages.sql, 'sql');

            const statements = splitStatements(minified);
            updateStats(formattedSQL, statements.length);

            showNotification('Minified', 'success');
        } catch (e) {
            showNotification('Error: ' + e.message, 'error');
        }
    }

    // ========== Stats ==========

    function updateStats(sql, stmtCount) {
        stats.classList.remove('hidden');
        statLines.textContent = sql.split('\n').length;
        statChars.textContent = sql.length;
        statStatements.textContent = stmtCount;

        // Count keywords
        let keywordCount = 0;
        const upperSql = sql.toUpperCase();
        keywords.forEach(kw => {
            const regex = new RegExp('\\b' + kw + '\\b', 'g');
            const matches = upperSql.match(regex);
            if (matches) keywordCount += matches.length;
        });
        statKeywords.textContent = keywordCount;
    }

    // ========== Utility ==========

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
