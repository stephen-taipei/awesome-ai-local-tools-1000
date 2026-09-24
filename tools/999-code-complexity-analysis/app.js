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
        const ast = esprima.parseScript(code, { loc: true });
        const result = ComplexityCore.analyze(ast);
        metricLoc.textContent = code.split('\n').length;
        metricFunctions.textContent = result.functionCount;
        metricNesting.textContent = result.maxNesting;
        metricCyclo.textContent = result.maxComplexity;
        updateScoreCircle(result.maxComplexity);
        updateDetailsList(result.details);
    } catch (error) {
        alert('Error parsing code: ' + error.message);
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
    detailsList.replaceChildren();
    if (!details.length) {
        const empty = document.createElement('li');
        empty.className = 'px-4 py-3 text-gray-500 text-center italic';
        empty.textContent = 'No functions found.';
        detailsList.appendChild(empty);
        return;
    }
    [...details].sort((a, b) => b.complexity - a.complexity).forEach(func => {
        const li = document.createElement('li');
        li.className = 'px-4 py-3 flex justify-between items-center hover:bg-gray-50 transition-colors';
        const name = document.createElement('span');
        name.className = 'font-medium text-gray-700';
        name.textContent = `${func.name} — Line ${func.line}`;
        const badge = document.createElement('span');
        const color = func.complexity > 10 ? 'bg-red-100 text-red-800' : func.complexity > 5 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800';
        badge.className = `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`;
        badge.textContent = `CC: ${func.complexity}`;
        li.append(name, badge);
        detailsList.appendChild(li);
    });
}
