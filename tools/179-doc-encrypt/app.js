/**
 * Doc Encrypt - Tool #179
 * Uses Web Crypto API for AES-GCM encryption
 */
let mode = 'encrypt';
let resultContent = '';

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    document.getElementById('encryptTab').addEventListener('click', () => setMode('encrypt'));
    document.getElementById('decryptTab').addEventListener('click', () => setMode('decrypt'));
    document.getElementById('togglePassword').addEventListener('click', togglePassword);
    document.getElementById('password').addEventListener('input', updatePasswordStrength);
    document.getElementById('processBtn').addEventListener('click', process);
    document.getElementById('copyBtn').addEventListener('click', copyResult);
    document.getElementById('downloadBtn').addEventListener('click', downloadResult);
}

function setMode(newMode) {
    mode = newMode;
    document.getElementById('encryptTab').classList.toggle('active', mode === 'encrypt');
    document.getElementById('decryptTab').classList.toggle('active', mode === 'decrypt');
    document.getElementById('inputLabel').textContent = mode === 'encrypt' ? '要加密的文字' : '要解密的密文';
    document.getElementById('processBtn').textContent = mode === 'encrypt' ? '加密' : '解密';
    document.getElementById('resultLabel').textContent = mode === 'encrypt' ? '加密結果' : '解密結果';
    document.getElementById('inputText').placeholder = mode === 'encrypt' ? '輸入或貼上文字內容...' : '貼上加密後的密文...';
}

function togglePassword() {
    const input = document.getElementById('password');
    const btn = document.getElementById('togglePassword');
    if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
    } else {
        input.type = 'password';
        btn.textContent = '👁️';
    }
}

function updatePasswordStrength() {
    const password = document.getElementById('password').value;
    const container = document.getElementById('passwordStrength');

    if (!password) {
        container.innerHTML = '';
        return;
    }

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    let className = 'weak';
    if (strength >= 4) className = 'strong';
    else if (strength >= 2) className = 'medium';

    container.innerHTML = `<div class="bar ${className}"></div>`;
}

async function process() {
    const password = document.getElementById('password').value;
    const text = document.getElementById('inputText').value;

    if (!password) {
        alert('請輸入密碼');
        return;
    }
    if (!text) {
        alert('請輸入文字內容');
        return;
    }

    try {
        if (mode === 'encrypt') {
            resultContent = await encrypt(text, password);
        } else {
            resultContent = await decrypt(text, password);
        }
        document.getElementById('resultText').textContent = resultContent;
        document.getElementById('resultSection').style.display = 'block';
    } catch (e) {
        alert(mode === 'encrypt' ? '加密失敗: ' + e.message : '解密失敗: 密碼錯誤或密文格式不正確');
    }
}

async function deriveKey(password, salt) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        enc.encode(password),
        'PBKDF2',
        false,
        ['deriveKey']
    );

    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

async function encrypt(text, password) {
    const enc = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(password, salt);

    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        enc.encode(text)
    );

    const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encrypted), salt.length + iv.length);

    return btoa(String.fromCharCode(...combined));
}

async function decrypt(ciphertext, password) {
    const dec = new TextDecoder();
    const data = new Uint8Array(atob(ciphertext).split('').map(c => c.charCodeAt(0)));

    const salt = data.slice(0, 16);
    const iv = data.slice(16, 28);
    const encrypted = data.slice(28);

    const key = await deriveKey(password, salt);

    const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encrypted
    );

    return dec.decode(decrypted);
}

function copyResult() {
    navigator.clipboard.writeText(resultContent).then(() => {
        const btn = document.getElementById('copyBtn');
        btn.textContent = '已複製!';
        setTimeout(() => btn.textContent = '複製', 2000);
    });
}

function downloadResult() {
    const ext = mode === 'encrypt' ? '.enc' : '.txt';
    const blob = new Blob([resultContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (mode === 'encrypt' ? 'encrypted' : 'decrypted') + ext;
    a.click();
    URL.revokeObjectURL(url);
}

init();
