// Physics Formula Solver - Tool #903

document.addEventListener('DOMContentLoaded', () => {
    const categoryButtons = document.getElementById('category-buttons');
    const formulaList = document.getElementById('formula-list');
    const inputSection = document.getElementById('input-section');
    const resultSection = document.getElementById('result-section');
    const errorSection = document.getElementById('error-section');
    const formulaDisplay = document.getElementById('formula-display');
    const variableInputs = document.getElementById('variable-inputs');
    const resultDisplay = document.getElementById('result-display');
    const stepsList = document.getElementById('steps-list');
    const errorMessage = document.getElementById('error-message');
    const solveBtn = document.getElementById('solve-btn');
    const clearBtn = document.getElementById('clear-btn');

    let currentCategory = 'mechanics';
    let selectedFormula = null;

    // Physics formulas database
    const formulas = {
        mechanics: [
            {
                id: 'force',
                name: "Newton's Second Law",
                latex: 'F = ma',
                variables: {
                    F: { name: 'Force', unit: 'N', description: 'Net force' },
                    m: { name: 'Mass', unit: 'kg', description: 'Object mass' },
                    a: { name: 'Acceleration', unit: 'm/s²', description: 'Acceleration' }
                },
                solve: (vars, unknown) => {
                    if (unknown === 'F') return vars.m * vars.a;
                    if (unknown === 'm') return vars.F / vars.a;
                    if (unknown === 'a') return vars.F / vars.m;
                }
            },
            {
                id: 'weight',
                name: 'Weight',
                latex: 'W = mg',
                variables: {
                    W: { name: 'Weight', unit: 'N', description: 'Weight force' },
                    m: { name: 'Mass', unit: 'kg', description: 'Object mass' },
                    g: { name: 'Gravity', unit: 'm/s²', description: 'Gravitational acceleration', default: 9.81 }
                },
                solve: (vars, unknown) => {
                    if (unknown === 'W') return vars.m * vars.g;
                    if (unknown === 'm') return vars.W / vars.g;
                    if (unknown === 'g') return vars.W / vars.m;
                }
            },
            {
                id: 'momentum',
                name: 'Momentum',
                latex: 'p = mv',
                variables: {
                    p: { name: 'Momentum', unit: 'kg·m/s', description: 'Linear momentum' },
                    m: { name: 'Mass', unit: 'kg', description: 'Object mass' },
                    v: { name: 'Velocity', unit: 'm/s', description: 'Velocity' }
                },
                solve: (vars, unknown) => {
                    if (unknown === 'p') return vars.m * vars.v;
                    if (unknown === 'm') return vars.p / vars.v;
                    if (unknown === 'v') return vars.p / vars.m;
                }
            },
            {
                id: 'pressure',
                name: 'Pressure',
                latex: 'P = F/A',
                variables: {
                    P: { name: 'Pressure', unit: 'Pa', description: 'Pressure' },
                    F: { name: 'Force', unit: 'N', description: 'Applied force' },
                    A: { name: 'Area', unit: 'm²', description: 'Surface area' }
                },
                solve: (vars, unknown) => {
                    if (unknown === 'P') return vars.F / vars.A;
                    if (unknown === 'F') return vars.P * vars.A;
                    if (unknown === 'A') return vars.F / vars.P;
                }
            }
        ],
        kinematics: [
            {
                id: 'velocity',
                name: 'Velocity',
                latex: 'v = d/t',
                variables: {
                    v: { name: 'Velocity', unit: 'm/s', description: 'Average velocity' },
                    d: { name: 'Distance', unit: 'm', description: 'Distance traveled' },
                    t: { name: 'Time', unit: 's', description: 'Time elapsed' }
                },
                solve: (vars, unknown) => {
                    if (unknown === 'v') return vars.d / vars.t;
                    if (unknown === 'd') return vars.v * vars.t;
                    if (unknown === 't') return vars.d / vars.v;
                }
            },
            {
                id: 'acceleration',
                name: 'Acceleration',
                latex: 'a = (v - v_0)/t',
                variables: {
                    a: { name: 'Acceleration', unit: 'm/s²', description: 'Acceleration' },
                    v: { name: 'Final Velocity', unit: 'm/s', description: 'Final velocity' },
                    v0: { name: 'Initial Velocity', unit: 'm/s', description: 'Initial velocity' },
                    t: { name: 'Time', unit: 's', description: 'Time elapsed' }
                },
                solve: (vars, unknown) => {
                    if (unknown === 'a') return (vars.v - vars.v0) / vars.t;
                    if (unknown === 'v') return vars.v0 + vars.a * vars.t;
                    if (unknown === 'v0') return vars.v - vars.a * vars.t;
                    if (unknown === 't') return (vars.v - vars.v0) / vars.a;
                }
            },
            {
                id: 'displacement',
                name: 'Displacement',
                latex: 'd = v_0 t + \\frac{1}{2}at^2',
                variables: {
                    d: { name: 'Displacement', unit: 'm', description: 'Displacement' },
                    v0: { name: 'Initial Velocity', unit: 'm/s', description: 'Initial velocity' },
                    t: { name: 'Time', unit: 's', description: 'Time elapsed' },
                    a: { name: 'Acceleration', unit: 'm/s²', description: 'Acceleration' }
                },
                solve: (vars, unknown) => {
                    if (unknown === 'd') return vars.v0 * vars.t + 0.5 * vars.a * vars.t * vars.t;
                    // Other solutions are more complex
                }
            },
            {
                id: 'freefall',
                name: 'Free Fall Distance',
                latex: 'h = \\frac{1}{2}gt^2',
                variables: {
                    h: { name: 'Height', unit: 'm', description: 'Fall distance' },
                    g: { name: 'Gravity', unit: 'm/s²', description: 'Gravitational acceleration', default: 9.81 },
                    t: { name: 'Time', unit: 's', description: 'Fall time' }
                },
                solve: (vars, unknown) => {
                    if (unknown === 'h') return 0.5 * vars.g * vars.t * vars.t;
                    if (unknown === 't') return Math.sqrt(2 * vars.h / vars.g);
                    if (unknown === 'g') return 2 * vars.h / (vars.t * vars.t);
                }
            }
        ],
        energy: [
            {
                id: 'kinetic',
                name: 'Kinetic Energy',
                latex: 'KE = \\frac{1}{2}mv^2',
                variables: {
                    KE: { name: 'Kinetic Energy', unit: 'J', description: 'Kinetic energy' },
                    m: { name: 'Mass', unit: 'kg', description: 'Object mass' },
                    v: { name: 'Velocity', unit: 'm/s', description: 'Velocity' }
                },
                solve: (vars, unknown) => {
                    if (unknown === 'KE') return 0.5 * vars.m * vars.v * vars.v;
                    if (unknown === 'm') return 2 * vars.KE / (vars.v * vars.v);
                    if (unknown === 'v') return Math.sqrt(2 * vars.KE / vars.m);
                }
            },
            {
                id: 'potential',
                name: 'Potential Energy',
                latex: 'PE = mgh',
                variables: {
                    PE: { name: 'Potential Energy', unit: 'J', description: 'Gravitational potential energy' },
                    m: { name: 'Mass', unit: 'kg', description: 'Object mass' },
                    g: { name: 'Gravity', unit: 'm/s²', description: 'Gravitational acceleration', default: 9.81 },
                    h: { name: 'Height', unit: 'm', description: 'Height above reference' }
                },
                solve: (vars, unknown) => {
                    if (unknown === 'PE') return vars.m * vars.g * vars.h;
                    if (unknown === 'm') return vars.PE / (vars.g * vars.h);
                    if (unknown === 'h') return vars.PE / (vars.m * vars.g);
                    if (unknown === 'g') return vars.PE / (vars.m * vars.h);
                }
            },
            {
                id: 'work',
                name: 'Work',
                latex: 'W = Fd',
                variables: {
                    W: { name: 'Work', unit: 'J', description: 'Work done' },
                    F: { name: 'Force', unit: 'N', description: 'Applied force' },
                    d: { name: 'Distance', unit: 'm', description: 'Displacement' }
                },
                solve: (vars, unknown) => {
                    if (unknown === 'W') return vars.F * vars.d;
                    if (unknown === 'F') return vars.W / vars.d;
                    if (unknown === 'd') return vars.W / vars.F;
                }
            },
            {
                id: 'power',
                name: 'Power',
                latex: 'P = W/t',
                variables: {
                    P: { name: 'Power', unit: 'W', description: 'Power' },
                    W: { name: 'Work', unit: 'J', description: 'Work done' },
                    t: { name: 'Time', unit: 's', description: 'Time elapsed' }
                },
                solve: (vars, unknown) => {
                    if (unknown === 'P') return vars.W / vars.t;
                    if (unknown === 'W') return vars.P * vars.t;
                    if (unknown === 't') return vars.W / vars.P;
                }
            }
        ],
        waves: [
            {
                id: 'wave_speed',
                name: 'Wave Speed',
                latex: 'v = f\\lambda',
                variables: {
                    v: { name: 'Wave Speed', unit: 'm/s', description: 'Wave velocity' },
                    f: { name: 'Frequency', unit: 'Hz', description: 'Wave frequency' },
                    lambda: { name: 'Wavelength', unit: 'm', description: 'Wavelength (λ)' }
                },
                solve: (vars, unknown) => {
                    if (unknown === 'v') return vars.f * vars.lambda;
                    if (unknown === 'f') return vars.v / vars.lambda;
                    if (unknown === 'lambda') return vars.v / vars.f;
                }
            },
            {
                id: 'period',
                name: 'Period & Frequency',
                latex: 'T = 1/f',
                variables: {
                    T: { name: 'Period', unit: 's', description: 'Wave period' },
                    f: { name: 'Frequency', unit: 'Hz', description: 'Wave frequency' }
                },
                solve: (vars, unknown) => {
                    if (unknown === 'T') return 1 / vars.f;
                    if (unknown === 'f') return 1 / vars.T;
                }
            },
            {
                id: 'pendulum',
                name: 'Pendulum Period',
                latex: 'T = 2\\pi\\sqrt{L/g}',
                variables: {
                    T: { name: 'Period', unit: 's', description: 'Oscillation period' },
                    L: { name: 'Length', unit: 'm', description: 'Pendulum length' },
                    g: { name: 'Gravity', unit: 'm/s²', description: 'Gravitational acceleration', default: 9.81 }
                },
                solve: (vars, unknown) => {
                    if (unknown === 'T') return 2 * Math.PI * Math.sqrt(vars.L / vars.g);
                    if (unknown === 'L') return vars.g * Math.pow(vars.T / (2 * Math.PI), 2);
                    if (unknown === 'g') return vars.L * Math.pow(2 * Math.PI / vars.T, 2);
                }
            }
        ],
        electricity: [
            {
                id: 'ohm',
                name: "Ohm's Law",
                latex: 'V = IR',
                variables: {
                    V: { name: 'Voltage', unit: 'V', description: 'Voltage' },
                    I: { name: 'Current', unit: 'A', description: 'Electric current' },
                    R: { name: 'Resistance', unit: 'Ω', description: 'Resistance' }
                },
                solve: (vars, unknown) => {
                    if (unknown === 'V') return vars.I * vars.R;
                    if (unknown === 'I') return vars.V / vars.R;
                    if (unknown === 'R') return vars.V / vars.I;
                }
            },
            {
                id: 'electric_power',
                name: 'Electric Power',
                latex: 'P = IV',
                variables: {
                    P: { name: 'Power', unit: 'W', description: 'Electric power' },
                    I: { name: 'Current', unit: 'A', description: 'Electric current' },
                    V: { name: 'Voltage', unit: 'V', description: 'Voltage' }
                },
                solve: (vars, unknown) => {
                    if (unknown === 'P') return vars.I * vars.V;
                    if (unknown === 'I') return vars.P / vars.V;
                    if (unknown === 'V') return vars.P / vars.I;
                }
            },
            {
                id: 'capacitance',
                name: 'Capacitance',
                latex: 'C = Q/V',
                variables: {
                    C: { name: 'Capacitance', unit: 'F', description: 'Capacitance' },
                    Q: { name: 'Charge', unit: 'C', description: 'Electric charge' },
                    V: { name: 'Voltage', unit: 'V', description: 'Voltage' }
                },
                solve: (vars, unknown) => {
                    if (unknown === 'C') return vars.Q / vars.V;
                    if (unknown === 'Q') return vars.C * vars.V;
                    if (unknown === 'V') return vars.Q / vars.C;
                }
            },
            {
                id: 'coulomb',
                name: "Coulomb's Law",
                latex: 'F = k\\frac{q_1 q_2}{r^2}',
                variables: {
                    F: { name: 'Force', unit: 'N', description: 'Electric force' },
                    k: { name: 'Coulomb constant', unit: 'N·m²/C²', description: 'Coulomb constant', default: 8.99e9 },
                    q1: { name: 'Charge 1', unit: 'C', description: 'First charge' },
                    q2: { name: 'Charge 2', unit: 'C', description: 'Second charge' },
                    r: { name: 'Distance', unit: 'm', description: 'Distance between charges' }
                },
                solve: (vars, unknown) => {
                    if (unknown === 'F') return vars.k * vars.q1 * vars.q2 / (vars.r * vars.r);
                    if (unknown === 'r') return Math.sqrt(vars.k * vars.q1 * vars.q2 / vars.F);
                }
            }
        ],
        thermodynamics: [
            {
                id: 'heat',
                name: 'Heat Transfer',
                latex: 'Q = mc\\Delta T',
                variables: {
                    Q: { name: 'Heat', unit: 'J', description: 'Heat energy' },
                    m: { name: 'Mass', unit: 'kg', description: 'Object mass' },
                    c: { name: 'Specific Heat', unit: 'J/(kg·K)', description: 'Specific heat capacity' },
                    dT: { name: 'Temperature Change', unit: 'K', description: 'Change in temperature' }
                },
                solve: (vars, unknown) => {
                    if (unknown === 'Q') return vars.m * vars.c * vars.dT;
                    if (unknown === 'm') return vars.Q / (vars.c * vars.dT);
                    if (unknown === 'c') return vars.Q / (vars.m * vars.dT);
                    if (unknown === 'dT') return vars.Q / (vars.m * vars.c);
                }
            },
            {
                id: 'ideal_gas',
                name: 'Ideal Gas Law',
                latex: 'PV = nRT',
                variables: {
                    P: { name: 'Pressure', unit: 'Pa', description: 'Pressure' },
                    V: { name: 'Volume', unit: 'm³', description: 'Volume' },
                    n: { name: 'Moles', unit: 'mol', description: 'Amount of substance' },
                    R: { name: 'Gas Constant', unit: 'J/(mol·K)', description: 'Ideal gas constant', default: 8.314 },
                    T: { name: 'Temperature', unit: 'K', description: 'Absolute temperature' }
                },
                solve: (vars, unknown) => {
                    if (unknown === 'P') return vars.n * vars.R * vars.T / vars.V;
                    if (unknown === 'V') return vars.n * vars.R * vars.T / vars.P;
                    if (unknown === 'n') return vars.P * vars.V / (vars.R * vars.T);
                    if (unknown === 'T') return vars.P * vars.V / (vars.n * vars.R);
                    if (unknown === 'R') return vars.P * vars.V / (vars.n * vars.T);
                }
            },
            {
                id: 'efficiency',
                name: 'Efficiency',
                latex: '\\eta = W_{out}/W_{in}',
                variables: {
                    eta: { name: 'Efficiency', unit: '%', description: 'Efficiency (as decimal)' },
                    Wout: { name: 'Output Work', unit: 'J', description: 'Work output' },
                    Win: { name: 'Input Work', unit: 'J', description: 'Work input' }
                },
                solve: (vars, unknown) => {
                    if (unknown === 'eta') return (vars.Wout / vars.Win) * 100;
                    if (unknown === 'Wout') return (vars.eta / 100) * vars.Win;
                    if (unknown === 'Win') return vars.Wout / (vars.eta / 100);
                }
            }
        ]
    };

    // Initialize
    renderFormulas(currentCategory);
    setupEventListeners();

    function setupEventListeners() {
        categoryButtons.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                categoryButtons.querySelectorAll('.category-btn').forEach(b => {
                    b.classList.remove('active');
                    b.classList.add('bg-gray-100');
                });
                btn.classList.add('active');
                btn.classList.remove('bg-gray-100');
                currentCategory = btn.dataset.category;
                renderFormulas(currentCategory);
                hideAllSections();
            });
        });

        solveBtn.addEventListener('click', solve);
        clearBtn.addEventListener('click', clearInputs);
    }

    function renderFormulas(category) {
        const categoryFormulas = formulas[category] || [];

        formulaList.innerHTML = categoryFormulas.map(f => `
            <div class="formula-card p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-indigo-300" data-id="${f.id}">
                <div class="font-medium text-gray-800 mb-2">${f.name}</div>
                <div class="formula-latex text-lg text-center text-indigo-600" data-latex="${f.latex}"></div>
            </div>
        `).join('');

        // Render LaTeX
        formulaList.querySelectorAll('.formula-latex').forEach(el => {
            try {
                katex.render(el.dataset.latex, el, { throwOnError: false });
            } catch (e) {
                el.textContent = el.dataset.latex;
            }
        });

        // Add click handlers
        formulaList.querySelectorAll('.formula-card').forEach(card => {
            card.addEventListener('click', () => {
                formulaList.querySelectorAll('.formula-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                selectFormula(card.dataset.id);
            });
        });
    }

    function selectFormula(formulaId) {
        const categoryFormulas = formulas[currentCategory];
        selectedFormula = categoryFormulas.find(f => f.id === formulaId);

        if (!selectedFormula) return;

        inputSection.classList.remove('hidden');
        resultSection.classList.add('hidden');
        errorSection.classList.add('hidden');

        // Render formula display
        try {
            katex.render(selectedFormula.latex, formulaDisplay, { throwOnError: false });
        } catch (e) {
            formulaDisplay.textContent = selectedFormula.latex;
        }

        // Render variable inputs
        const varKeys = Object.keys(selectedFormula.variables);
        variableInputs.innerHTML = varKeys.map(key => {
            const v = selectedFormula.variables[key];
            return `
                <div class="flex flex-col">
                    <label class="text-sm font-medium text-gray-700 mb-1">
                        ${v.name} (${key})
                        <span class="text-gray-400 font-normal">[${v.unit}]</span>
                    </label>
                    <input type="number" step="any"
                        class="variable-input px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                        data-var="${key}"
                        placeholder="${v.description}"
                        ${v.default !== undefined ? `value="${v.default}"` : ''}>
                    <span class="text-xs text-gray-400 mt-1">Leave empty to solve for this variable</span>
                </div>
            `;
        }).join('');
    }

    function solve() {
        if (!selectedFormula) return;

        const inputs = {};
        let unknown = null;
        let unknownCount = 0;

        variableInputs.querySelectorAll('.variable-input').forEach(input => {
            const varName = input.dataset.var;
            const value = input.value.trim();

            if (value === '') {
                unknown = varName;
                unknownCount++;
            } else {
                const num = parseFloat(value);
                if (isNaN(num)) {
                    showError(`Invalid value for ${varName}`);
                    return;
                }
                inputs[varName] = num;
            }
        });

        if (unknownCount === 0) {
            showError('Leave one variable empty to solve for it.');
            return;
        }

        if (unknownCount > 1) {
            showError('Please provide values for all but one variable.');
            return;
        }

        try {
            const result = selectedFormula.solve(inputs, unknown);

            if (result === undefined || isNaN(result) || !isFinite(result)) {
                showError('Cannot solve for this variable with the given formula.');
                return;
            }

            displayResult(unknown, result, inputs);
        } catch (e) {
            showError('Error solving the equation: ' + e.message);
        }
    }

    function displayResult(unknown, result, inputs) {
        errorSection.classList.add('hidden');
        resultSection.classList.remove('hidden');

        const varInfo = selectedFormula.variables[unknown];
        const formattedResult = formatNumber(result);

        resultDisplay.innerHTML = `${unknown} = ${formattedResult} ${varInfo.unit}`;

        // Show steps
        const steps = [];

        steps.push({
            title: 'Start with the formula',
            content: selectedFormula.latex
        });

        steps.push({
            title: 'Substitute known values',
            content: Object.entries(inputs).map(([k, v]) => `${k} = ${formatNumber(v)}`).join(', ')
        });

        steps.push({
            title: 'Solve for ' + unknown,
            content: `${unknown} = ${formattedResult} ${varInfo.unit}`
        });

        stepsList.innerHTML = steps.map((step, i) => `
            <div class="step-item bg-gray-50 p-3 rounded-r-lg">
                <div class="text-sm font-medium text-indigo-600 mb-1">Step ${i + 1}: ${step.title}</div>
                <div class="text-gray-700 step-content" data-latex="${step.content}">${step.content}</div>
            </div>
        `).join('');

        // Render LaTeX in steps
        stepsList.querySelectorAll('.step-content').forEach(el => {
            const latex = el.dataset.latex;
            if (latex.includes('\\') || latex.includes('_') || latex.includes('^')) {
                try {
                    katex.render(latex, el, { throwOnError: false });
                } catch (e) {
                    // Keep text content
                }
            }
        });
    }

    function formatNumber(num) {
        if (Math.abs(num) < 0.001 || Math.abs(num) > 100000) {
            return num.toExponential(4);
        }
        return parseFloat(num.toPrecision(6)).toString();
    }

    function showError(message) {
        errorSection.classList.remove('hidden');
        resultSection.classList.add('hidden');
        errorMessage.textContent = message;
    }

    function clearInputs() {
        variableInputs.querySelectorAll('.variable-input').forEach(input => {
            const varName = input.dataset.var;
            const varInfo = selectedFormula.variables[varName];
            if (varInfo.default !== undefined) {
                input.value = varInfo.default;
            } else {
                input.value = '';
            }
        });
        resultSection.classList.add('hidden');
        errorSection.classList.add('hidden');
    }

    function hideAllSections() {
        inputSection.classList.add('hidden');
        resultSection.classList.add('hidden');
        errorSection.classList.add('hidden');
        selectedFormula = null;
    }
});
