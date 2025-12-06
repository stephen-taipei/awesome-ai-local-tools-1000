// Chemical Equation Balancer - Tool #902

document.addEventListener('DOMContentLoaded', () => {
    const equationInput = document.getElementById('equation-input');
    const balanceBtn = document.getElementById('balance-btn');
    const examplesList = document.getElementById('examples-list');
    const resultSection = document.getElementById('result-section');
    const errorSection = document.getElementById('error-section');
    const stepsSection = document.getElementById('steps-section');
    const balancedEquationEl = document.getElementById('balanced-equation');
    const reactantCountsEl = document.getElementById('reactant-counts');
    const productCountsEl = document.getElementById('product-counts');
    const errorMessageEl = document.getElementById('error-message');
    const stepsListEl = document.getElementById('steps-list');

    // Example equations
    const examples = [
        { text: 'H₂ + O₂ → H₂O', equation: 'H2 + O2 -> H2O' },
        { text: 'CH₄ + O₂ → CO₂ + H₂O', equation: 'CH4 + O2 -> CO2 + H2O' },
        { text: 'Fe + O₂ → Fe₂O₃', equation: 'Fe + O2 -> Fe2O3' },
        { text: 'N₂ + H₂ → NH₃', equation: 'N2 + H2 -> NH3' },
        { text: 'C₃H₈ + O₂ → CO₂ + H₂O', equation: 'C3H8 + O2 -> CO2 + H2O' },
        { text: 'KClO₃ → KCl + O₂', equation: 'KClO3 -> KCl + O2' },
        { text: 'Na + Cl₂ → NaCl', equation: 'Na + Cl2 -> NaCl' },
        { text: 'Al + HCl → AlCl₃ + H₂', equation: 'Al + HCl -> AlCl3 + H2' },
        { text: 'CaCO₃ → CaO + CO₂', equation: 'CaCO3 -> CaO + CO2' },
        { text: 'H₂SO₄ + NaOH → Na₂SO₄ + H₂O', equation: 'H2SO4 + NaOH -> Na2SO4 + H2O' }
    ];

    // Initialize examples
    renderExamples();

    // Event listeners
    balanceBtn.addEventListener('click', balanceEquation);
    equationInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') balanceEquation();
    });

    function renderExamples() {
        examplesList.innerHTML = examples.map(ex => `
            <button class="example-btn px-3 py-2 bg-gray-100 hover:bg-indigo-100 text-gray-700 rounded-lg text-sm transition-colors" data-equation="${ex.equation}">
                ${ex.text}
            </button>
        `).join('');

        examplesList.querySelectorAll('.example-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                equationInput.value = btn.dataset.equation;
                balanceEquation();
            });
        });
    }

    function balanceEquation() {
        const input = equationInput.value.trim();
        if (!input) return;

        hideAllSections();

        try {
            const parsed = parseEquation(input);
            const balanced = balance(parsed);
            displayResult(balanced, parsed);
        } catch (error) {
            showError(error.message);
        }
    }

    function parseEquation(input) {
        // Normalize arrow
        const normalized = input.replace(/[=→⟶]/g, '->');
        const parts = normalized.split('->');

        if (parts.length !== 2) {
            throw new Error('Invalid equation format. Use "->" or "=" to separate reactants and products.');
        }

        const reactants = parseSide(parts[0].trim());
        const products = parseSide(parts[1].trim());

        if (reactants.length === 0 || products.length === 0) {
            throw new Error('Both sides of the equation must have at least one compound.');
        }

        return { reactants, products };
    }

    function parseSide(side) {
        return side.split('+').map(compound => parseCompound(compound.trim())).filter(c => c);
    }

    function parseCompound(compound) {
        if (!compound) return null;

        // Extract coefficient if present
        const coeffMatch = compound.match(/^(\d+)?(.+)$/);
        const coefficient = coeffMatch[1] ? parseInt(coeffMatch[1]) : 1;
        const formula = coeffMatch[2];

        // Parse elements and counts
        const elements = {};
        const regex = /([A-Z][a-z]?)(\d*)/g;
        let match;

        while ((match = regex.exec(formula)) !== null) {
            const element = match[1];
            const count = match[2] ? parseInt(match[2]) : 1;
            elements[element] = (elements[element] || 0) + count;
        }

        if (Object.keys(elements).length === 0) {
            throw new Error(`Invalid compound: ${compound}`);
        }

        return { formula, coefficient, elements, original: compound };
    }

    function balance(parsed) {
        const { reactants, products } = parsed;

        // Get all unique elements
        const allElements = new Set();
        [...reactants, ...products].forEach(compound => {
            Object.keys(compound.elements).forEach(el => allElements.add(el));
        });
        const elements = Array.from(allElements);

        // Try to balance using trial and error with small coefficients
        const maxCoef = 10;
        const numReactants = reactants.length;
        const numProducts = products.length;

        // Generate all possible coefficient combinations
        function* generateCombinations(n, max) {
            if (n === 0) {
                yield [];
                return;
            }
            for (let i = 1; i <= max; i++) {
                for (const rest of generateCombinations(n - 1, max)) {
                    yield [i, ...rest];
                }
            }
        }

        for (const reactantCoefs of generateCombinations(numReactants, maxCoef)) {
            for (const productCoefs of generateCombinations(numProducts, maxCoef)) {
                if (isBalanced(reactants, products, reactantCoefs, productCoefs, elements)) {
                    // Simplify coefficients by finding GCD
                    const allCoefs = [...reactantCoefs, ...productCoefs];
                    const gcd = allCoefs.reduce((a, b) => gcdFunc(a, b));

                    const simplifiedReactantCoefs = reactantCoefs.map(c => c / gcd);
                    const simplifiedProductCoefs = productCoefs.map(c => c / gcd);

                    return {
                        reactants: reactants.map((r, i) => ({ ...r, coefficient: simplifiedReactantCoefs[i] })),
                        products: products.map((p, i) => ({ ...p, coefficient: simplifiedProductCoefs[i] })),
                        elements
                    };
                }
            }
        }

        throw new Error('Unable to balance this equation. Please check the input.');
    }

    function isBalanced(reactants, products, reactantCoefs, productCoefs, elements) {
        for (const element of elements) {
            let reactantCount = 0;
            let productCount = 0;

            reactants.forEach((r, i) => {
                reactantCount += (r.elements[element] || 0) * reactantCoefs[i];
            });

            products.forEach((p, i) => {
                productCount += (p.elements[element] || 0) * productCoefs[i];
            });

            if (reactantCount !== productCount) return false;
        }
        return true;
    }

    function gcdFunc(a, b) {
        return b === 0 ? a : gcdFunc(b, a % b);
    }

    function displayResult(balanced, original) {
        resultSection.classList.remove('hidden');
        stepsSection.classList.remove('hidden');

        // Format balanced equation
        const reactantStr = balanced.reactants.map(r => formatCompound(r)).join(' + ');
        const productStr = balanced.products.map(p => formatCompound(p)).join(' + ');
        balancedEquationEl.innerHTML = `${reactantStr} → ${productStr}`;

        // Show atom counts
        const reactantCounts = countAtoms(balanced.reactants);
        const productCounts = countAtoms(balanced.products);

        reactantCountsEl.innerHTML = Object.entries(reactantCounts).map(([el, count]) =>
            `<span class="inline-block px-2 py-1 bg-blue-100 rounded mr-1 mb-1">${el}: ${count}</span>`
        ).join('');

        productCountsEl.innerHTML = Object.entries(productCounts).map(([el, count]) =>
            `<span class="inline-block px-2 py-1 bg-green-100 rounded mr-1 mb-1">${el}: ${count}</span>`
        ).join('');

        // Show steps
        displaySteps(original, balanced);
    }

    function formatCompound(compound) {
        const coef = compound.coefficient > 1 ? `<span class="coefficient">${compound.coefficient}</span>` : '';
        const formula = compound.formula.replace(/(\d+)/g, '<sub>$1</sub>');
        return `${coef}${formula}`;
    }

    function countAtoms(compounds) {
        const counts = {};
        compounds.forEach(c => {
            Object.entries(c.elements).forEach(([el, count]) => {
                counts[el] = (counts[el] || 0) + count * c.coefficient;
            });
        });
        return counts;
    }

    function displaySteps(original, balanced) {
        const steps = [];

        // Step 1: Original equation
        steps.push({
            title: 'Original Equation',
            content: `${original.reactants.map(r => r.formula).join(' + ')} → ${original.products.map(p => p.formula).join(' + ')}`
        });

        // Step 2: Identify elements
        steps.push({
            title: 'Identify Elements',
            content: `Elements present: ${balanced.elements.join(', ')}`
        });

        // Step 3: Count atoms before balancing
        const beforeReactant = countAtoms(original.reactants.map(r => ({ ...r, coefficient: 1 })));
        const beforeProduct = countAtoms(original.products.map(p => ({ ...p, coefficient: 1 })));

        steps.push({
            title: 'Count Atoms (Unbalanced)',
            content: `Reactants: ${Object.entries(beforeReactant).map(([el, c]) => `${el}=${c}`).join(', ')}<br>Products: ${Object.entries(beforeProduct).map(([el, c]) => `${el}=${c}`).join(', ')}`
        });

        // Step 4: Apply coefficients
        const coefficients = [];
        balanced.reactants.forEach(r => {
            if (r.coefficient > 1) coefficients.push(`${r.coefficient} before ${r.formula}`);
        });
        balanced.products.forEach(p => {
            if (p.coefficient > 1) coefficients.push(`${p.coefficient} before ${p.formula}`);
        });

        steps.push({
            title: 'Apply Coefficients',
            content: coefficients.length > 0 ? coefficients.join(', ') : 'No additional coefficients needed (equation was already balanced)'
        });

        // Step 5: Verify
        const afterReactant = countAtoms(balanced.reactants);
        steps.push({
            title: 'Verify Balance',
            content: `All elements: ${Object.entries(afterReactant).map(([el, c]) => `${el}=${c}`).join(', ')} (both sides equal)`
        });

        stepsListEl.innerHTML = steps.map((step, i) => `
            <div class="step-card bg-gray-50 p-3 rounded-r-lg">
                <div class="text-sm font-medium text-indigo-600 mb-1">Step ${i + 1}: ${step.title}</div>
                <div class="text-gray-700">${step.content}</div>
            </div>
        `).join('');
    }

    function showError(message) {
        errorSection.classList.remove('hidden');
        errorMessageEl.textContent = message;
    }

    function hideAllSections() {
        resultSection.classList.add('hidden');
        errorSection.classList.add('hidden');
        stepsSection.classList.add('hidden');
    }
});
