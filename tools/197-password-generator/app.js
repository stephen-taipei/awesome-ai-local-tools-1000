/**
 * Password Generator - Tool #197
 */

const charSets = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

const similarChars = '0O1lI';
const ambiguousSymbols = '{}[]()\\\'"`~,;:.<>';

let history = [];

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    document.getElementById('lengthSlider').addEventListener('input', (e) => {
        document.getElementById('lengthValue').textContent = e.target.value;
    });

    document.getElementById('generateBtn').addEventListener('click', generate);
    document.getElementById('copyBtn').addEventListener('click', copyPassword);
    document.getElementById('clearHistoryBtn').addEventListener('click', clearHistory);

    // Load history from localStorage
    const saved = localStorage.getItem('passwordHistory');
    if (saved) {
        history = JSON.parse(saved);
        renderHistory();
    }
}

function generate() {
    const length = parseInt(document.getElementById('lengthSlider').value);
    const options = {
        uppercase: document.getElementById('uppercase').checked,
        lowercase: document.getElementById('lowercase').checked,
        numbers: document.getElementById('numbers').checked,
        symbols: document.getElementById('symbols').checked,
        excludeSimilar: document.getElementById('excludeSimilar').checked,
        excludeAmbiguous: document.getElementById('excludeAmbiguous').checked
    };

    // Build character set
    let chars = '';
    if (options.uppercase) chars += charSets.uppercase;
    if (options.lowercase) chars += charSets.lowercase;
    if (options.numbers) chars += charSets.numbers;
    if (options.symbols) chars += charSets.symbols;

    if (options.excludeSimilar) {
        chars = chars.split('').filter(c => !similarChars.includes(c)).join('');
    }
    if (options.excludeAmbiguous) {
        chars = chars.split('').filter(c => !ambiguousSymbols.includes(c)).join('');
    }

    if (chars.length === 0) {
        document.getElementById('passwordOutput').textContent = '請至少選擇一個字元類型';
        return;
    }

    // Generate password using crypto API
    const password = generateSecurePassword(chars, length);

    document.getElementById('passwordOutput').textContent = password;

    // Update strength meter
    updateStrength(password, options);

    // Add to history
    addToHistory(password);
}

function generateSecurePassword(chars, length) {
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);

    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars[array[i] % chars.length];
    }
    return password;
}

function updateStrength(password, options) {
    let score = 0;
    const length = password.length;

    // Length score
    if (length >= 8) score += 1;
    if (length >= 12) score += 1;
    if (length >= 16) score += 1;
    if (length >= 20) score += 1;

    // Character variety score
    if (options.uppercase && /[A-Z]/.test(password)) score += 1;
    if (options.lowercase && /[a-z]/.test(password)) score += 1;
    if (options.numbers && /[0-9]/.test(password)) score += 1;
    if (options.symbols && /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) score += 1;

    // Normalize to percentage
    const percentage = Math.min(100, score * 12.5);

    const bar = document.getElementById('strengthBar');
    const text = document.getElementById('strengthText');

    bar.style.width = percentage + '%';

    if (percentage < 25) {
        bar.style.background = 'var(--danger-color)';
        text.textContent = '密碼強度: 弱';
        text.style.color = 'var(--danger-color)';
    } else if (percentage < 50) {
        bar.style.background = 'var(--warning-color)';
        text.textContent = '密碼強度: 一般';
        text.style.color = 'var(--warning-color)';
    } else if (percentage < 75) {
        bar.style.background = 'var(--primary-color)';
        text.textContent = '密碼強度: 強';
        text.style.color = 'var(--primary-color)';
    } else {
        bar.style.background = 'var(--success-color)';
        text.textContent = '密碼強度: 非常強';
        text.style.color = 'var(--success-color)';
    }
}

function addToHistory(password) {
    history.unshift(password);
    if (history.length > 10) history.pop();
    localStorage.setItem('passwordHistory', JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    if (history.length === 0) {
        document.getElementById('historyList').innerHTML = '<p class="empty-hint">尚無記錄</p>';
        return;
    }

    const html = history.map((pw, i) => `
        <div class="history-item">
            <span>${pw.length > 30 ? pw.substring(0, 30) + '...' : pw}</span>
            <button onclick="copyFromHistory(${i})">複製</button>
        </div>
    `).join('');

    document.getElementById('historyList').innerHTML = html;
}

function copyPassword() {
    const password = document.getElementById('passwordOutput').textContent;
    if (password && password !== '點擊生成密碼' && password !== '請至少選擇一個字元類型') {
        navigator.clipboard.writeText(password).then(showToast);
    }
}

function copyFromHistory(index) {
    navigator.clipboard.writeText(history[index]).then(showToast);
}

function clearHistory() {
    history = [];
    localStorage.removeItem('passwordHistory');
    renderHistory();
}

function showToast() {
    const toast = document.getElementById('toast');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

init();
