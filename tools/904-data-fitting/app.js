const translations = {
    en: { title: "Data Fitting Tool", subtitle: "Fit curves to your data locally in browser", privacyBadge: "100% Local Processing", fitType: "Fit Type:", degree: "Polynomial Degree:", dataInput: "Data Input", loadSample: "Load Sample", fitData: "Fit Data", results: "Results", equation: "Equation:", rSquared: "R-Squared:", rmse: "RMSE:", backToHome: "Back to Home", toolNumber: "Tool #904" },
    zh: { title: "數據擬合工具", subtitle: "在瀏覽器本地進行曲線擬合", privacyBadge: "100% 本地處理", fitType: "擬合類型:", degree: "多項式次數:", dataInput: "數據輸入", loadSample: "載入範例", fitData: "擬合數據", results: "結果", equation: "方程式:", rSquared: "R平方值:", rmse: "均方根誤差:", backToHome: "返回首頁", toolNumber: "工具 #904" }
};
let currentLang = 'en', chart = null;

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) el.textContent = translations[lang][key];
    });
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');
}

document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));
document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh'));

document.getElementById('fitType').addEventListener('change', (e) => {
    document.getElementById('degreeGroup').style.display = e.target.value === 'polynomial' ? 'flex' : 'none';
});

document.getElementById('loadSample').addEventListener('click', () => {
    document.getElementById('dataInput').value = '1,2.1\n2,4.0\n3,6.2\n4,7.9\n5,10.1\n6,12.0\n7,14.2\n8,15.8\n9,18.1\n10,20.0';
});

document.getElementById('fitData').addEventListener('click', fitData);

function parseData(text) {
    return text.trim().split('\n').map(line => {
        const parts = line.split(/[,\s\t]+/);
        return { x: parseFloat(parts[0]), y: parseFloat(parts[1]) };
    }).filter(p => !isNaN(p.x) && !isNaN(p.y));
}

function linearRegression(data) {
    const n = data.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    data.forEach(p => { sumX += p.x; sumY += p.y; sumXY += p.x * p.y; sumX2 += p.x * p.x; });
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    return { slope, intercept, predict: x => slope * x + intercept };
}

function polynomialRegression(data, degree) {
    const n = data.length;
    const X = [], Y = [];
    for (let i = 0; i < n; i++) {
        const row = [];
        for (let j = 0; j <= degree; j++) row.push(Math.pow(data[i].x, j));
        X.push(row);
        Y.push(data[i].y);
    }
    const coeffs = solveLinearSystem(X, Y);
    return {
        coeffs,
        predict: x => coeffs.reduce((sum, c, i) => sum + c * Math.pow(x, i), 0)
    };
}

function solveLinearSystem(X, Y) {
    const n = X.length, m = X[0].length;
    const XtX = [], XtY = [];
    for (let i = 0; i < m; i++) {
        XtX[i] = [];
        for (let j = 0; j < m; j++) {
            let sum = 0;
            for (let k = 0; k < n; k++) sum += X[k][i] * X[k][j];
            XtX[i][j] = sum;
        }
        let sum = 0;
        for (let k = 0; k < n; k++) sum += X[k][i] * Y[k];
        XtY[i] = sum;
    }
    for (let i = 0; i < m; i++) {
        let maxRow = i;
        for (let k = i + 1; k < m; k++) if (Math.abs(XtX[k][i]) > Math.abs(XtX[maxRow][i])) maxRow = k;
        [XtX[i], XtX[maxRow]] = [XtX[maxRow], XtX[i]];
        [XtY[i], XtY[maxRow]] = [XtY[maxRow], XtY[i]];
        for (let k = i + 1; k < m; k++) {
            const c = XtX[k][i] / XtX[i][i];
            for (let j = i; j < m; j++) XtX[k][j] -= c * XtX[i][j];
            XtY[k] -= c * XtY[i];
        }
    }
    const coeffs = new Array(m);
    for (let i = m - 1; i >= 0; i--) {
        coeffs[i] = XtY[i];
        for (let j = i + 1; j < m; j++) coeffs[i] -= XtX[i][j] * coeffs[j];
        coeffs[i] /= XtX[i][i];
    }
    return coeffs;
}

function calculateRSquared(data, predict) {
    const meanY = data.reduce((s, p) => s + p.y, 0) / data.length;
    let ssRes = 0, ssTot = 0;
    data.forEach(p => { ssRes += Math.pow(p.y - predict(p.x), 2); ssTot += Math.pow(p.y - meanY, 2); });
    return 1 - ssRes / ssTot;
}

function calculateRMSE(data, predict) {
    const mse = data.reduce((s, p) => s + Math.pow(p.y - predict(p.x), 2), 0) / data.length;
    return Math.sqrt(mse);
}

function fitData() {
    const data = parseData(document.getElementById('dataInput').value);
    if (data.length < 2) { alert('Please enter at least 2 data points'); return; }

    const fitType = document.getElementById('fitType').value;
    let result, equation;

    switch (fitType) {
        case 'linear':
            result = linearRegression(data);
            equation = `y = ${result.slope.toFixed(4)}x + ${result.intercept.toFixed(4)}`;
            break;
        case 'polynomial':
            const degree = parseInt(document.getElementById('degree').value);
            result = polynomialRegression(data, degree);
            equation = 'y = ' + result.coeffs.map((c, i) => {
                if (i === 0) return c.toFixed(4);
                return `${c >= 0 ? '+' : ''}${c.toFixed(4)}x^${i}`;
            }).join(' ');
            break;
        case 'exponential':
            const logData = data.filter(p => p.y > 0).map(p => ({ x: p.x, y: Math.log(p.y) }));
            const lr = linearRegression(logData);
            const a = Math.exp(lr.intercept), b = lr.slope;
            result = { predict: x => a * Math.exp(b * x) };
            equation = `y = ${a.toFixed(4)} * e^(${b.toFixed(4)}x)`;
            break;
        case 'logarithmic':
            const lnData = data.filter(p => p.x > 0).map(p => ({ x: Math.log(p.x), y: p.y }));
            const lnReg = linearRegression(lnData);
            result = { predict: x => lnReg.slope * Math.log(x) + lnReg.intercept };
            equation = `y = ${lnReg.slope.toFixed(4)} * ln(x) + ${lnReg.intercept.toFixed(4)}`;
            break;
        case 'power':
            const pwData = data.filter(p => p.x > 0 && p.y > 0).map(p => ({ x: Math.log(p.x), y: Math.log(p.y) }));
            const pwReg = linearRegression(pwData);
            const pa = Math.exp(pwReg.intercept), pb = pwReg.slope;
            result = { predict: x => pa * Math.pow(x, pb) };
            equation = `y = ${pa.toFixed(4)} * x^${pb.toFixed(4)}`;
            break;
        default:
            result = linearRegression(data);
            equation = `y = ${result.slope.toFixed(4)}x + ${result.intercept.toFixed(4)}`;
    }

    const rSquared = calculateRSquared(data, result.predict);
    const rmse = calculateRMSE(data, result.predict);

    document.getElementById('equation').textContent = equation;
    document.getElementById('rSquared').textContent = rSquared.toFixed(6);
    document.getElementById('rmse').textContent = rmse.toFixed(6);

    updateChart(data, result.predict);
}

function updateChart(data, predict) {
    const ctx = document.getElementById('chart').getContext('2d');
    if (chart) chart.destroy();

    const minX = Math.min(...data.map(p => p.x));
    const maxX = Math.max(...data.map(p => p.x));
    const padding = (maxX - minX) * 0.1;
    const fitLine = [];
    for (let x = minX - padding; x <= maxX + padding; x += (maxX - minX) / 100) {
        fitLine.push({ x, y: predict(x) });
    }

    chart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                { label: 'Data Points', data: data, backgroundColor: '#6366f1', pointRadius: 6 },
                { label: 'Fitted Curve', data: fitLine, type: 'line', borderColor: '#22c55e', borderWidth: 2, fill: false, pointRadius: 0 }
            ]
        },
        options: {
            responsive: true,
            plugins: { legend: { labels: { color: '#f1f5f9' } } },
            scales: {
                x: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } },
                y: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } }
            }
        }
    });
}
