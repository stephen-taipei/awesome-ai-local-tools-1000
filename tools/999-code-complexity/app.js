// Code Complexity Analyzer - Tool #999
// Analyze code complexity and quality metrics

(function() {
    'use strict';

    // DOM Elements
    const codeInput = document.getElementById('code-input');
    const analyzeBtn = document.getElementById('analyze-btn');
    const sampleBtn = document.getElementById('sample-btn');
    const clearBtn = document.getElementById('clear-btn');

    const summaryPlaceholder = document.getElementById('summary-placeholder');
    const summaryContent = document.getElementById('summary-content');
    const scoreValue = document.getElementById('score-value');
    const scoreLabel = document.getElementById('score-label');
    const totalLines = document.getElementById('total-lines');
    const totalFunctions = document.getElementById('total-functions');
    const avgComplexity = document.getElementById('avg-complexity');
    const maxComplexity = document.getElementById('max-complexity');

    const functionsSection = document.getElementById('functions-section');
    const functionsList = document.getElementById('functions-list');
    const metricsSection = document.getElementById('metrics-section');
    const metricsGrid = document.getElementById('metrics-grid');
    const suggestionsSection = document.getElementById('suggestions-section');
    const suggestionsList = document.getElementById('suggestions-list');

    // Sample code
    const sampleCode = `// Sample code with varying complexity
function calculateTotal(items, discount, taxRate) {
    let total = 0;

    for (let i = 0; i < items.length; i++) {
        const item = items[i];

        if (item.quantity > 0 && item.price > 0) {
            let itemTotal = item.quantity * item.price;

            if (item.category === 'electronics') {
                itemTotal *= 0.95; // 5% off electronics
            } else if (item.category === 'clothing') {
                if (item.quantity >= 3) {
                    itemTotal *= 0.9; // 10% off for 3+ clothing items
                }
            } else if (item.category === 'food') {
                // No discount on food
            }

            total += itemTotal;
        }
    }

    if (discount > 0) {
        if (discount > 50) {
            discount = 50; // Max 50% discount
        }
        total *= (1 - discount / 100);
    }

    const tax = total * (taxRate / 100);
    return total + tax;
}

function validateEmail(email) {
    if (!email) return false;
    const regex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    return regex.test(email);
}

const processOrder = async (order) => {
    try {
        const validated = validateOrder(order);
        if (!validated) throw new Error('Invalid order');

        const result = await submitOrder(order);
        return result;
    } catch (error) {
        console.error(error);
        return null;
    }
};

class ShoppingCart {
    constructor() {
        this.items = [];
    }

    addItem(item) {
        const existing = this.items.find(i => i.id === item.id);
        if (existing) {
            existing.quantity += item.quantity;
        } else {
            this.items.push(item);
        }
    }

    removeItem(itemId) {
        this.items = this.items.filter(i => i.id !== itemId);
    }

    getTotal() {
        return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }
}`;

    // ========== Event Listeners ==========

    analyzeBtn.addEventListener('click', analyzeCode);
    codeInput.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') analyzeCode();
    });

    sampleBtn.addEventListener('click', () => {
        codeInput.value = sampleCode;
        showNotification('Sample loaded', 'success');
    });

    clearBtn.addEventListener('click', () => {
        codeInput.value = '';
        summaryPlaceholder.classList.remove('hidden');
        summaryContent.classList.add('hidden');
        functionsSection.classList.add('hidden');
        metricsSection.classList.add('hidden');
        suggestionsSection.classList.add('hidden');
        showNotification('Cleared', 'success');
    });

    // ========== Analyze Code ==========

    function analyzeCode() {
        const code = codeInput.value.trim();
        if (!code) {
            showNotification('Please enter code', 'warning');
            return;
        }

        try {
            const ast = acorn.parse(code, {
                ecmaVersion: 2022,
                sourceType: 'module',
                locations: true
            });

            const metrics = calculateMetrics(code, ast);
            displayResults(metrics);
            showNotification('Analysis complete', 'success');
        } catch (e) {
            showNotification('Parse error: ' + e.message, 'error');
        }
    }

    function calculateMetrics(code, ast) {
        const lines = code.split('\n');
        const codeLines = lines.filter(line => {
            const trimmed = line.trim();
            return trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('/*');
        }).length;

        const functions = [];
        let totalComplexity = 0;

        // Traverse AST
        function traverse(node, parentName = '') {
            if (!node || typeof node !== 'object') return;

            // Check for functions
            if (node.type === 'FunctionDeclaration' ||
                node.type === 'FunctionExpression' ||
                node.type === 'ArrowFunctionExpression') {

                const name = node.id?.name ||
                            (node.type === 'FunctionExpression' && parentName) ||
                            '(anonymous)';

                const complexity = calculateCyclomaticComplexity(node);
                const loc = countLines(node, code);
                const params = node.params?.length || 0;

                functions.push({
                    name,
                    type: node.type,
                    complexity,
                    lines: loc,
                    params,
                    start: node.loc?.start?.line || 0,
                    end: node.loc?.end?.line || 0
                });

                totalComplexity += complexity;
            }

            // Check for class methods
            if (node.type === 'MethodDefinition') {
                const name = node.key?.name || '(method)';
                const complexity = calculateCyclomaticComplexity(node.value);
                const loc = countLines(node, code);
                const params = node.value?.params?.length || 0;

                functions.push({
                    name,
                    type: 'Method',
                    complexity,
                    lines: loc,
                    params,
                    start: node.loc?.start?.line || 0,
                    end: node.loc?.end?.line || 0
                });

                totalComplexity += complexity;
            }

            // Handle variable declarations with function expressions
            if (node.type === 'VariableDeclarator' && node.init) {
                traverse(node.init, node.id?.name);
                return;
            }

            // Recurse
            for (const key in node) {
                if (key === 'loc' || key === 'start' || key === 'end') continue;
                const child = node[key];
                if (Array.isArray(child)) {
                    child.forEach(c => traverse(c, parentName));
                } else if (typeof child === 'object') {
                    traverse(child, parentName);
                }
            }
        }

        traverse(ast);

        // Calculate Halstead metrics
        const halstead = calculateHalstead(code);

        // Calculate maintainability index
        const avgLoc = functions.length > 0 ? codeLines / functions.length : codeLines;
        const avgCc = functions.length > 0 ? totalComplexity / functions.length : 1;
        const maintainability = Math.max(0, Math.min(100,
            171 - 5.2 * Math.log(halstead.volume || 1) -
            0.23 * avgCc -
            16.2 * Math.log(codeLines || 1)
        ) * 100 / 171);

        return {
            totalLines: lines.length,
            codeLines,
            commentLines: lines.length - codeLines,
            functions,
            totalComplexity,
            avgComplexity: functions.length > 0 ? totalComplexity / functions.length : 0,
            maxComplexity: functions.length > 0 ? Math.max(...functions.map(f => f.complexity)) : 0,
            halstead,
            maintainability: Math.round(maintainability)
        };
    }

    function calculateCyclomaticComplexity(node) {
        let complexity = 1;

        function traverse(n) {
            if (!n || typeof n !== 'object') return;

            // Count decision points
            switch (n.type) {
                case 'IfStatement':
                case 'ConditionalExpression':
                case 'WhileStatement':
                case 'DoWhileStatement':
                case 'ForStatement':
                case 'ForInStatement':
                case 'ForOfStatement':
                case 'CatchClause':
                    complexity++;
                    break;
                case 'SwitchCase':
                    if (n.test) complexity++; // Don't count default
                    break;
                case 'LogicalExpression':
                    if (n.operator === '&&' || n.operator === '||') complexity++;
                    break;
            }

            for (const key in n) {
                if (key === 'loc' || key === 'start' || key === 'end') continue;
                const child = n[key];
                if (Array.isArray(child)) {
                    child.forEach(traverse);
                } else if (typeof child === 'object') {
                    traverse(child);
                }
            }
        }

        traverse(node);
        return complexity;
    }

    function countLines(node, code) {
        if (!node.loc) return 0;
        return node.loc.end.line - node.loc.start.line + 1;
    }

    function calculateHalstead(code) {
        // Simplified Halstead metrics
        const operators = code.match(/[+\-*/%=<>!&|^~?:]+|function|return|if|else|for|while|switch|case|break|continue|try|catch|throw|new|typeof|instanceof|delete|void|in|of/g) || [];
        const operands = code.match(/[a-zA-Z_$][a-zA-Z0-9_$]*|"[^"]*"|'[^']*'|`[^`]*`|\d+\.?\d*/g) || [];

        const uniqueOperators = new Set(operators);
        const uniqueOperands = new Set(operands);

        const n1 = uniqueOperators.size;
        const n2 = uniqueOperands.size;
        const N1 = operators.length;
        const N2 = operands.length;

        const vocabulary = n1 + n2;
        const length = N1 + N2;
        const volume = length * Math.log2(vocabulary || 1);
        const difficulty = (n1 / 2) * (N2 / (n2 || 1));
        const effort = volume * difficulty;

        return {
            vocabulary,
            length,
            volume: Math.round(volume),
            difficulty: Math.round(difficulty * 10) / 10,
            effort: Math.round(effort)
        };
    }

    // ========== Display Results ==========

    function displayResults(metrics) {
        summaryPlaceholder.classList.add('hidden');
        summaryContent.classList.remove('hidden');

        // Score
        scoreValue.textContent = metrics.maintainability;
        if (metrics.maintainability >= 65) {
            scoreValue.className = 'text-6xl font-bold mb-2 text-green-600';
            scoreLabel.textContent = 'Good';
            scoreLabel.className = 'mt-2 px-3 py-1 rounded-full text-sm font-medium inline-block bg-green-100 text-green-700';
        } else if (metrics.maintainability >= 35) {
            scoreValue.className = 'text-6xl font-bold mb-2 text-yellow-600';
            scoreLabel.textContent = 'Moderate';
            scoreLabel.className = 'mt-2 px-3 py-1 rounded-full text-sm font-medium inline-block bg-yellow-100 text-yellow-700';
        } else {
            scoreValue.className = 'text-6xl font-bold mb-2 text-red-600';
            scoreLabel.textContent = 'Needs Improvement';
            scoreLabel.className = 'mt-2 px-3 py-1 rounded-full text-sm font-medium inline-block bg-red-100 text-red-700';
        }

        // Quick stats
        totalLines.textContent = metrics.codeLines;
        totalFunctions.textContent = metrics.functions.length;
        avgComplexity.textContent = metrics.avgComplexity.toFixed(1);
        maxComplexity.textContent = metrics.maxComplexity;

        // Functions list
        if (metrics.functions.length > 0) {
            functionsSection.classList.remove('hidden');
            functionsList.innerHTML = metrics.functions.map(fn => {
                const complexityClass = fn.complexity <= 5 ? 'complexity-low' :
                                       fn.complexity <= 10 ? 'complexity-medium' : 'complexity-high';
                const complexityColor = fn.complexity <= 5 ? 'text-green-600' :
                                       fn.complexity <= 10 ? 'text-yellow-600' : 'text-red-600';

                return `
                    <div class="metric-card ${complexityClass} bg-gray-50 p-3 rounded-lg">
                        <div class="flex items-center justify-between">
                            <div>
                                <span class="font-medium text-gray-800">${escapeHtml(fn.name)}</span>
                                <span class="text-xs text-gray-500 ml-2">${fn.type}</span>
                            </div>
                            <div class="text-right">
                                <span class="font-bold ${complexityColor}">${fn.complexity}</span>
                                <span class="text-xs text-gray-500 ml-1">complexity</span>
                            </div>
                        </div>
                        <div class="mt-2 text-xs text-gray-500 flex gap-4">
                            <span><i class="fas fa-code mr-1"></i>${fn.lines} lines</span>
                            <span><i class="fas fa-hashtag mr-1"></i>${fn.params} params</span>
                            <span><i class="fas fa-map-marker-alt mr-1"></i>Line ${fn.start}-${fn.end}</span>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            functionsSection.classList.add('hidden');
        }

        // Detailed metrics
        metricsSection.classList.remove('hidden');
        metricsGrid.innerHTML = `
            <div class="metric-card bg-gray-50 p-4 rounded-lg">
                <div class="text-sm text-gray-500">Total Lines</div>
                <div class="text-xl font-bold text-gray-800">${metrics.totalLines}</div>
            </div>
            <div class="metric-card bg-gray-50 p-4 rounded-lg">
                <div class="text-sm text-gray-500">Code Lines</div>
                <div class="text-xl font-bold text-gray-800">${metrics.codeLines}</div>
            </div>
            <div class="metric-card bg-gray-50 p-4 rounded-lg">
                <div class="text-sm text-gray-500">Comment Lines</div>
                <div class="text-xl font-bold text-gray-800">${metrics.commentLines}</div>
            </div>
            <div class="metric-card bg-gray-50 p-4 rounded-lg">
                <div class="text-sm text-gray-500">Halstead Volume</div>
                <div class="text-xl font-bold text-gray-800">${metrics.halstead.volume}</div>
            </div>
            <div class="metric-card bg-gray-50 p-4 rounded-lg">
                <div class="text-sm text-gray-500">Halstead Difficulty</div>
                <div class="text-xl font-bold text-gray-800">${metrics.halstead.difficulty}</div>
            </div>
            <div class="metric-card bg-gray-50 p-4 rounded-lg">
                <div class="text-sm text-gray-500">Halstead Effort</div>
                <div class="text-xl font-bold text-gray-800">${metrics.halstead.effort}</div>
            </div>
        `;

        // Suggestions
        const suggestions = generateSuggestions(metrics);
        if (suggestions.length > 0) {
            suggestionsSection.classList.remove('hidden');
            suggestionsList.innerHTML = suggestions.map(s => `
                <div class="flex items-start gap-3 p-3 bg-${s.type}-50 rounded-lg">
                    <i class="fas fa-${s.icon} text-${s.type}-500 mt-0.5"></i>
                    <div>
                        <div class="font-medium text-${s.type}-700">${s.title}</div>
                        <div class="text-sm text-${s.type}-600">${s.message}</div>
                    </div>
                </div>
            `).join('');
        } else {
            suggestionsSection.classList.add('hidden');
        }
    }

    function generateSuggestions(metrics) {
        const suggestions = [];

        if (metrics.maxComplexity > 10) {
            suggestions.push({
                type: 'red',
                icon: 'exclamation-triangle',
                title: 'High Complexity Function',
                message: `Function with complexity ${metrics.maxComplexity} should be refactored. Consider breaking it into smaller functions.`
            });
        }

        if (metrics.avgComplexity > 5) {
            suggestions.push({
                type: 'yellow',
                icon: 'lightbulb',
                title: 'Average Complexity',
                message: 'Average complexity is above 5. Consider simplifying conditional logic.'
            });
        }

        const longFunctions = metrics.functions.filter(f => f.lines > 30);
        if (longFunctions.length > 0) {
            suggestions.push({
                type: 'yellow',
                icon: 'ruler',
                title: 'Long Functions',
                message: `${longFunctions.length} function(s) exceed 30 lines. Consider extracting smaller functions.`
            });
        }

        if (metrics.maintainability < 35) {
            suggestions.push({
                type: 'red',
                icon: 'tools',
                title: 'Low Maintainability',
                message: 'Code may be difficult to maintain. Consider refactoring for better readability.'
            });
        }

        if (suggestions.length === 0) {
            suggestions.push({
                type: 'green',
                icon: 'check-circle',
                title: 'Good Code Quality',
                message: 'No major issues detected. Keep up the good work!'
            });
        }

        return suggestions;
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
