const codeInput = document.getElementById('code-input');
const generateBtn = document.getElementById('generate-btn');
const sampleBtn = document.getElementById('sample-btn');
const astContainer = document.getElementById('ast-container');

const sampleCode = `// Simple AST Example
function greeting(name) {
    const message = "Hello, " + name;
    return message;
}

greeting("World");`;

sampleBtn.addEventListener('click', () => {
    codeInput.value = sampleCode;
    generateAST();
});

generateBtn.addEventListener('click', generateAST);

function generateAST() {
    const code = codeInput.value;
    if (!code.trim()) return;

    try {
        astContainer.innerHTML = ''; // Clear previous
        const ast = esprima.parseScript(code, { loc: false, range: false });
        
        // Render JSON Tree
        astContainer.appendChild(createNodeElement('Program', ast));

    } catch (error) {
        console.error(error);
        astContainer.innerHTML = `<div class="text-red-500 p-4">Error parsing code:<br>${error.message}</div>`;
    }
}

function createNodeElement(key, value) {
    const node = document.createElement('div');
    node.className = 'ast-node';

    // Primitives (null, number, boolean)
    if (value === null) {
        node.innerHTML = `<span class="ast-key">${key}:</span> <span class="ast-value">null</span>`;
        return node;
    }
    if (typeof value !== 'object') {
        let valStr = value;
        let valClass = 'ast-value';
        if (typeof value === 'string') {
            valStr = `"${value}"`;
            valClass = 'ast-string';
        }
        node.innerHTML = `<span class="ast-key">${key}:</span> <span class="${valClass}">${valStr}</span>`;
        return node;
    }

    // Objects / Arrays
    const isArray = Array.isArray(value);
    const typeLabel = value.type ? value.type : (isArray ? `[${value.length}]` : '{...}');
    
    // Toggle Button
    const toggle = document.createElement('span');
    toggle.className = 'ast-toggle';
    toggle.textContent = '▼';
    
    // Label Line
    const labelLine = document.createElement('span');
    if (key) {
        labelLine.innerHTML = `<span class="ast-key">${key}:</span> <span class="ast-type">${typeLabel}</span>`;
    } else {
        labelLine.innerHTML = `<span class="ast-type">${typeLabel}</span>`;
    }

    // Children Container
    const childrenContainer = document.createElement('div');
    childrenContainer.className = 'ast-children';

    // Interactions
    const toggleHandler = (e) => {
        e.stopPropagation();
        const isHidden = childrenContainer.classList.contains('hidden');
        if (isHidden) {
            childrenContainer.classList.remove('hidden');
            toggle.textContent = '▼';
        } else {
            childrenContainer.classList.add('hidden');
            toggle.textContent = '▶';
        }
    };

    toggle.addEventListener('click', toggleHandler);
    labelLine.addEventListener('click', toggleHandler);

    node.appendChild(toggle);
    node.appendChild(labelLine);
    node.appendChild(childrenContainer);

    // Populate Children
    // Filter out generic object keys if necessary, but usually we want all for AST
    Object.keys(value).forEach(k => {
        // Skip 'type' as we displayed it in the label
        if (k === 'type') return;
        childrenContainer.appendChild(createNodeElement(k, value[k]));
    });
    
    // If empty object/array
    if (Object.keys(value).length === 0 || (Object.keys(value).length === 1 && value.type)) {
        toggle.style.visibility = 'hidden';
    }

    return node;
}
