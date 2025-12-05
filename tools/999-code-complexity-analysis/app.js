const codeInput = document.getElementById('code-input');
const analyzeBtn = document.getElementById('analyze-btn');
const sampleBtn = document.getElementById('sample-btn');
const scoreValue = document.getElementById('score-value');
const scoreCircle = document.getElementById('score-circle');
const complexityLabel = document.getElementById('complexity-label');
const detailsList = document.getElementById('details-list');

// Metrics Elements
const metricLoc = document.getElementById('metric-loc');
const metricFunctions = document.getElementById('metric-functions');
const metricNesting = document.getElementById('metric-nesting');
const metricCyclo = document.getElementById('metric-cyclo');

// Sample Code
const sampleCode = `function calculateFibonacci(n) {
    if (n <= 1) {
        return n;
    }
    let a = 0, b = 1, temp;
    for (let i = 2; i <= n; i++) {
        temp = a + b;
        a = b;
        b = temp;
    }
    return b;
}

function complexLogic(x, y) {
    if (x > 10) {
        if (y < 5) {
            return 'A';
        } else {
            return 'B';
        }
    } else if (x < 0) {
        switch(y) {
            case 1: return 'C';
            case 2: return 'D';
            default: return 'E';
        }
    }
    return 'F';
}`;

sampleBtn.addEventListener('click', () => {
    codeInput.value = sampleCode;
});

analyzeBtn.addEventListener('click', analyzeCode);

function analyzeCode() {
    const code = codeInput.value;
    if (!code.trim()) return;

    try {
        // Parse code using Esprima
        const ast = esprima.parseScript(code, { loc: true, range: true });
        
        // Reset metrics
        let totalCyclomatic = 0;
        let functionCount = 0;
        let maxNesting = 0;
        const functionDetails = [];

        // Helper to traverse AST
        function traverse(node, parent, depth = 0) {
            if (!node) return;

            // Cyclomatic Complexity Logic
            // Base 1 + 1 for each: if, while, for, case, catch, ternary, ||, &&
            let complexityIncrement = 0;
            
            if (['IfStatement', 'WhileStatement', 'DoWhileStatement', 'ForStatement', 'ForInStatement', 'ForOfStatement', 'CaseClause', 'CatchClause', 'ConditionalExpression'].includes(node.type)) {
                complexityIncrement = 1;
            } else if (node.type === 'LogicalExpression' && (node.operator === '||' || node.operator === '&&')) {
                complexityIncrement = 1;
            }

            // Nesting Depth
            if (['IfStatement', 'ForStatement', 'WhileStatement', 'FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression'].includes(node.type)) {
                maxNesting = Math.max(maxNesting, depth + 1);
            }

            // Function Analysis
            if (['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression'].includes(node.type)) {
                functionCount++;
                const funcName = node.id ? node.id.name : '(anonymous)';
                const funcComplexity = calculateFunctionComplexity(node);
                functionDetails.push({ name: funcName, complexity: funcComplexity, line: node.loc.start.line });
            }

            // Recursively traverse children
            for (const key in node) {
                if (node.hasOwnProperty(key)) {
                    const child = node[key];
                    if (typeof child === 'object' && child !== null) {
                        if (Array.isArray(child)) {
                            child.forEach(c => traverse(c, node, depth + (complexityIncrement ? 1 : 0)));
                        } else if (child.type) {
                            traverse(child, node, depth + (complexityIncrement ? 1 : 0));
                        }
                    }
                }
            }
        }
        
        // Specialized traversal just for a node's complexity (not full tree again)
        function calculateFunctionComplexity(funcNode) {
            let complexity = 1; // Base complexity
            
            function visit(node) {
                if (!node) return;
                if (['IfStatement', 'WhileStatement', 'DoWhileStatement', 'ForStatement', 'ForInStatement', 'ForOfStatement', 'CaseClause', 'CatchClause', 'ConditionalExpression'].includes(node.type)) {
                    complexity++;
                } else if (node.type === 'LogicalExpression' && (node.operator === '||' || node.operator === '&&')) {
                    complexity++;
                }
                
                for (const key in node) {
                    if (node.hasOwnProperty(key)) {
                        const child = node[key];
                        if (typeof child === 'object' && child !== null) {
                            // Don't traverse into nested functions for *this* function's complexity
                            if (['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression'].includes(child.type)) continue;

                            if (Array.isArray(child)) {
                                child.forEach(visit);
                            } else if (child.type) {
                                visit(child);
                            }
                        }
                    }
                }
            }
            
            // Visit body of function
            if (funcNode.body) visit(funcNode.body);
            return complexity;
        }

        // Start Traversal
        traverse(ast, null);
        
        // Calculate Total Cyclomatic (Sum of functions or global + functions)
        // For this tool, let's sum function complexities + a global check
        // Actually, traverse() already tracks structure. Let's aggregate functionDetails for simplicity.
        const avgComplexity = functionDetails.length > 0 
            ? (functionDetails.reduce((sum, f) => sum + f.complexity, 0) / functionDetails.length).toFixed(1) 
            : 1;
        
        const maxComplexity = functionDetails.length > 0 
            ? Math.max(...functionDetails.map(f => f.complexity)) 
            : 1;

        // Update UI
        metricLoc.textContent = code.split('\n').length;
        metricFunctions.textContent = functionCount;
        metricNesting.textContent = maxNesting;
        metricCyclo.textContent = maxComplexity; // Showing Max complexity as the "Cyclomatic" metric usually refers to the worst offender

        // Update Score Circle (Visualizing Complexity: Lower is better, but for progress bar, let's say 0-20 scale)
        // 1-5: Good (Green), 6-10: Warning (Yellow), >10: Bad (Red)
        updateScoreCircle(maxComplexity);

        // Update Details
        updateDetailsList(functionDetails);

    } catch (error) {
        console.error(error);
        alert("Error parsing code: " + error.message);
    }
}

function updateScoreCircle(complexity) {
    // Map complexity 1..20 to 0..100% circle fill
    // But here, "score" usually implies quality. Let's invert?
    // No, let's just show the number in the middle.
    
    scoreValue.textContent = complexity;
    
    // Circle stroke: 351.86 is full circumference
    // Let's cap display at 20 for "full circle"
    const percentage = Math.min(complexity / 20, 1); 
    const offset = 351.86 * (1 - percentage);
    scoreCircle.style.strokeDashoffset = offset;

    // Color & Label
    scoreCircle.classList.remove('text-purple-500', 'text-green-500', 'text-yellow-500', 'text-red-500');
    complexityLabel.className = "text-sm font-medium px-2 py-1 rounded";

    if (complexity <= 5) {
        scoreCircle.classList.add('text-green-500');
        complexityLabel.classList.add('bg-green-100', 'text-green-800');
        complexityLabel.textContent = "Simple & Clean";
    } else if (complexity <= 10) {
        scoreCircle.classList.add('text-yellow-500');
        complexityLabel.classList.add('bg-yellow-100', 'text-yellow-800');
        complexityLabel.textContent = "Moderate Complexity";
    } else {
        scoreCircle.classList.add('text-red-500');
        complexityLabel.classList.add('bg-red-100', 'text-red-800');
        complexityLabel.textContent = "High Complexity";
    }
}

function updateDetailsList(details) {
    detailsList.innerHTML = '';
    if (details.length === 0) {
        detailsList.innerHTML = '<li class="px-4 py-3 text-gray-500 text-center italic">No functions found.</li>';
        return;
    }

    details.sort((a, b) => b.complexity - a.complexity); // Sort by complexity desc

    details.forEach(func => {
        const li = document.createElement('li');
        li.className = "px-4 py-3 flex justify-between items-center hover:bg-gray-50 transition-colors";
        
        let colorClass = "bg-green-100 text-green-800";
        if (func.complexity > 10) colorClass = "bg-red-100 text-red-800";
        else if (func.complexity > 5) colorClass = "bg-yellow-100 text-yellow-800";

        li.innerHTML = "`
            <div>
                <span class="font-medium text-gray-700">${func.name}</span>
                <span class="text-xs text-gray-400 ml-2">Line ${func.line}</span>
            </div>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}">
                CC: ${func.complexity}
            </span>
        `";
        detailsList.appendChild(li);
    });
}
