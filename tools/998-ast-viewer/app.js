// AST Viewer - Tool #998
// Visualize JavaScript Abstract Syntax Tree

(function() {
    'use strict';

    // DOM Elements
    const codeInput = document.getElementById('code-input');
    const parseBtn = document.getElementById('parse-btn');
    const sampleBtn = document.getElementById('sample-btn');
    const clearBtn = document.getElementById('clear-btn');
    const astTree = document.getElementById('ast-tree');
    const copyJsonBtn = document.getElementById('copy-json-btn');

    const showLocations = document.getElementById('show-locations');
    const expandAll = document.getElementById('expand-all');

    const nodeDetails = document.getElementById('node-details');
    const nodeJson = document.getElementById('node-json');
    const errorDisplay = document.getElementById('error-display');
    const errorMessage = document.getElementById('error-message');

    const stats = document.getElementById('stats');
    const statNodes = document.getElementById('stat-nodes');
    const statDepth = document.getElementById('stat-depth');
    const statTypes = document.getElementById('stat-types');
    const statFunctions = document.getElementById('stat-functions');

    let currentAst = null;

    // Sample code
    const sampleCode = `// Sample JavaScript code
function greet(name) {
    const message = \`Hello, \${name}!\`;
    console.log(message);
    return message;
}

const users = ['Alice', 'Bob', 'Charlie'];

users.forEach((user, index) => {
    if (index % 2 === 0) {
        greet(user);
    }
});

class Person {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }

    sayHello() {
        return \`Hi, I'm \${this.name}\`;
    }
}`;

    // ========== Event Listeners ==========

    parseBtn.addEventListener('click', parseCode);
    codeInput.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            parseCode();
        }
    });

    sampleBtn.addEventListener('click', () => {
        codeInput.value = sampleCode;
        showNotification('Sample loaded', 'success');
    });

    clearBtn.addEventListener('click', () => {
        codeInput.value = '';
        astTree.innerHTML = '<span class="text-gray-400">Parse code to see AST...</span>';
        nodeDetails.classList.add('hidden');
        errorDisplay.classList.add('hidden');
        stats.classList.add('hidden');
        currentAst = null;
        showNotification('Cleared', 'success');
    });

    copyJsonBtn.addEventListener('click', async () => {
        if (!currentAst) {
            showNotification('Nothing to copy', 'warning');
            return;
        }
        try {
            await navigator.clipboard.writeText(JSON.stringify(currentAst, null, 2));
            showNotification('AST JSON copied', 'success');
        } catch (e) {
            showNotification('Failed to copy', 'error');
        }
    });

    showLocations.addEventListener('change', () => {
        if (currentAst) renderTree(currentAst);
    });

    expandAll.addEventListener('change', () => {
        if (currentAst) renderTree(currentAst);
    });

    // ========== Parse Code ==========

    function parseCode() {
        const code = codeInput.value.trim();
        if (!code) {
            showNotification('Please enter code', 'warning');
            return;
        }

        errorDisplay.classList.add('hidden');

        try {
            currentAst = acorn.parse(code, {
                ecmaVersion: 2022,
                sourceType: 'module',
                locations: true
            });

            renderTree(currentAst);
            calculateStats(currentAst);
            stats.classList.remove('hidden');
            showNotification('Parsed successfully', 'success');
        } catch (e) {
            errorDisplay.classList.remove('hidden');
            errorMessage.textContent = `${e.message} at position ${e.pos}`;
            astTree.innerHTML = '<span class="text-gray-400">Fix errors to see AST...</span>';
            stats.classList.add('hidden');
            showNotification('Parse error', 'error');
        }
    }

    // ========== Render Tree ==========

    function renderTree(ast) {
        astTree.innerHTML = '';
        const tree = createTreeNode(ast, 0, expandAll.checked);
        astTree.appendChild(tree);
    }

    function createTreeNode(node, depth, expanded) {
        if (node === null || node === undefined) {
            return createValueSpan(node);
        }

        if (typeof node !== 'object') {
            return createValueSpan(node);
        }

        if (Array.isArray(node)) {
            return createArrayNode(node, depth, expanded);
        }

        return createObjectNode(node, depth, expanded);
    }

    function createObjectNode(obj, depth, expanded) {
        const container = document.createElement('div');
        container.style.marginLeft = depth > 0 ? '20px' : '0';

        const isAstNode = obj.type !== undefined;
        const header = document.createElement('div');
        header.className = 'tree-node py-1 px-2 rounded';

        const toggle = document.createElement('span');
        toggle.className = 'tree-toggle';
        toggle.innerHTML = expanded ? '<i class="fas fa-caret-down"></i>' : '<i class="fas fa-caret-right"></i>';

        const label = document.createElement('span');
        if (isAstNode) {
            label.innerHTML = `<span class="node-type">${obj.type}</span>`;
            if (obj.name) {
                label.innerHTML += ` <span class="node-key">name:</span> <span class="node-string">"${obj.name}"</span>`;
            }
            if (obj.value !== undefined && typeof obj.value !== 'object') {
                label.innerHTML += ` <span class="node-key">value:</span> ${formatValue(obj.value)}`;
            }
        } else {
            label.textContent = '{...}';
        }

        header.appendChild(toggle);
        header.appendChild(label);
        container.appendChild(header);

        const content = document.createElement('div');
        content.style.display = expanded ? 'block' : 'none';

        // Filter keys
        const keys = Object.keys(obj).filter(key => {
            if (!showLocations.checked && (key === 'loc' || key === 'start' || key === 'end')) {
                return false;
            }
            return true;
        });

        keys.forEach(key => {
            const value = obj[key];
            if (value === undefined) return;

            const row = document.createElement('div');
            row.style.marginLeft = '20px';
            row.className = 'py-0.5';

            if (typeof value === 'object' && value !== null) {
                const keySpan = document.createElement('span');
                keySpan.innerHTML = `<span class="node-key">${key}:</span> `;
                row.appendChild(keySpan);
                row.appendChild(createTreeNode(value, depth + 1, expanded && depth < 2));
            } else {
                row.innerHTML = `<span class="node-key">${key}:</span> ${formatValue(value)}`;
            }

            content.appendChild(row);
        });

        container.appendChild(content);

        // Toggle click
        header.addEventListener('click', (e) => {
            e.stopPropagation();
            const isExpanded = content.style.display !== 'none';
            content.style.display = isExpanded ? 'none' : 'block';
            toggle.innerHTML = isExpanded ? '<i class="fas fa-caret-right"></i>' : '<i class="fas fa-caret-down"></i>';
        });

        // Show details on double click
        header.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            showNodeDetails(obj);
        });

        return container;
    }

    function createArrayNode(arr, depth, expanded) {
        const container = document.createElement('div');
        container.style.marginLeft = depth > 0 ? '20px' : '0';

        const header = document.createElement('div');
        header.className = 'tree-node py-1 px-2 rounded';

        const toggle = document.createElement('span');
        toggle.className = 'tree-toggle';
        toggle.innerHTML = expanded ? '<i class="fas fa-caret-down"></i>' : '<i class="fas fa-caret-right"></i>';

        const label = document.createElement('span');
        label.innerHTML = `<span class="text-gray-500">Array(${arr.length})</span>`;

        header.appendChild(toggle);
        header.appendChild(label);
        container.appendChild(header);

        const content = document.createElement('div');
        content.style.display = expanded ? 'block' : 'none';

        arr.forEach((item, index) => {
            const row = document.createElement('div');
            row.style.marginLeft = '20px';
            row.className = 'py-0.5';

            const indexSpan = document.createElement('span');
            indexSpan.innerHTML = `<span class="node-number">[${index}]</span> `;
            row.appendChild(indexSpan);
            row.appendChild(createTreeNode(item, depth + 1, expanded && depth < 2));

            content.appendChild(row);
        });

        container.appendChild(content);

        header.addEventListener('click', (e) => {
            e.stopPropagation();
            const isExpanded = content.style.display !== 'none';
            content.style.display = isExpanded ? 'none' : 'block';
            toggle.innerHTML = isExpanded ? '<i class="fas fa-caret-right"></i>' : '<i class="fas fa-caret-down"></i>';
        });

        return container;
    }

    function createValueSpan(value) {
        const span = document.createElement('span');
        span.innerHTML = formatValue(value);
        return span;
    }

    function formatValue(value) {
        if (value === null) return '<span class="node-null">null</span>';
        if (value === undefined) return '<span class="node-null">undefined</span>';
        if (typeof value === 'string') return `<span class="node-string">"${escapeHtml(value)}"</span>`;
        if (typeof value === 'number') return `<span class="node-number">${value}</span>`;
        if (typeof value === 'boolean') return `<span class="node-boolean">${value}</span>`;
        return escapeHtml(String(value));
    }

    function showNodeDetails(node) {
        nodeDetails.classList.remove('hidden');
        const json = JSON.stringify(node, null, 2);
        nodeJson.innerHTML = Prism.highlight(json, Prism.languages.json, 'json');
    }

    // ========== Statistics ==========

    function calculateStats(ast) {
        let nodeCount = 0;
        let maxDepth = 0;
        const types = new Set();
        let functionCount = 0;

        function traverse(node, depth) {
            if (!node || typeof node !== 'object') return;

            if (node.type) {
                nodeCount++;
                types.add(node.type);
                maxDepth = Math.max(maxDepth, depth);

                if (node.type === 'FunctionDeclaration' ||
                    node.type === 'FunctionExpression' ||
                    node.type === 'ArrowFunctionExpression') {
                    functionCount++;
                }
            }

            for (const key in node) {
                if (key === 'loc' || key === 'start' || key === 'end') continue;
                const value = node[key];
                if (Array.isArray(value)) {
                    value.forEach(item => traverse(item, depth + 1));
                } else if (typeof value === 'object') {
                    traverse(value, depth + 1);
                }
            }
        }

        traverse(ast, 0);

        statNodes.textContent = nodeCount;
        statDepth.textContent = maxDepth;
        statTypes.textContent = types.size;
        statFunctions.textContent = functionCount;
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
