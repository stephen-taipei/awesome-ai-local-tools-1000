/**
 * Garbled Text Fix - Tool #196
 */

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    document.getElementById('loadSampleBtn').addEventListener('click', loadSample);
    document.getElementById('convertBtn').addEventListener('click', convert);
    document.getElementById('copyBtn').addEventListener('click', copyResult);

    document.querySelectorAll('.fix-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.fix-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            quickFix(btn.dataset.fix);
        });
    });
}

function loadSample() {
    // Common garbled text example (UTF-8 displayed as ISO-8859-1)
    document.getElementById('inputText').value = 'ä½ å¥½ï¼æ¬¢è¿ä½¿ç¨äºç¢¼ä¿®å¾©å·¥å·ã';
}

function convert() {
    const text = document.getElementById('inputText').value.trim();
    if (!text) return;

    const sourceEnc = document.getElementById('sourceEncoding').value;

    let results = [];

    if (sourceEnc === 'auto') {
        // Try multiple encoding combinations
        results = tryAllEncodings(text);
    } else {
        results.push({
            label: `${sourceEnc} → UTF-8`,
            text: attemptDecode(text, sourceEnc)
        });
    }

    if (results.length > 0) {
        document.getElementById('outputText').textContent = results[0].text;

        if (results.length > 1) {
            const altHtml = results.slice(1).map(r => `
                <div class="alt-item" onclick="selectAlternative(this, '${escapeHtml(r.text)}')">
                    <div class="alt-label">${r.label}</div>
                    <div class="alt-text">${escapeHtml(r.text.substring(0, 100))}${r.text.length > 100 ? '...' : ''}</div>
                </div>
            `).join('');
            document.getElementById('alternatives').innerHTML = altHtml;
            document.getElementById('alternativeResults').style.display = 'block';
        } else {
            document.getElementById('alternativeResults').style.display = 'none';
        }
    }

    document.getElementById('resultsSection').style.display = 'block';
}

function tryAllEncodings(text) {
    const results = [];

    // Try common encoding misinterpretation fixes
    const fixes = [
        { label: 'UTF-8 誤讀為 Latin-1', fn: () => fixUtf8AsLatin1(text) },
        { label: 'Latin-1 誤讀為 UTF-8', fn: () => fixLatin1AsUtf8(text) },
        { label: '雙重 UTF-8 編碼', fn: () => fixDoubleUtf8(text) },
        { label: 'URL 編碼修復', fn: () => fixUrlEncoding(text) },
        { label: 'HTML 實體修復', fn: () => fixHtmlEntities(text) },
        { label: 'Unicode 轉義修復', fn: () => fixUnicodeEscape(text) }
    ];

    for (const fix of fixes) {
        try {
            const result = fix.fn();
            if (result && result !== text && isReadableText(result)) {
                results.push({ label: fix.label, text: result });
            }
        } catch (e) {
            // Ignore failed attempts
        }
    }

    // If no fix worked, return original
    if (results.length === 0) {
        results.push({ label: '原文', text: text });
    }

    return results;
}

function fixUtf8AsLatin1(text) {
    // Text was UTF-8 but read as Latin-1, convert back
    const bytes = [];
    for (let i = 0; i < text.length; i++) {
        bytes.push(text.charCodeAt(i));
    }
    return new TextDecoder('utf-8').decode(new Uint8Array(bytes));
}

function fixLatin1AsUtf8(text) {
    // Text was Latin-1 but read as UTF-8
    const encoder = new TextEncoder();
    const bytes = encoder.encode(text);
    return String.fromCharCode(...bytes);
}

function fixDoubleUtf8(text) {
    // Text was double-encoded as UTF-8
    return fixUtf8AsLatin1(fixUtf8AsLatin1(text));
}

function fixUrlEncoding(text) {
    return decodeURIComponent(text);
}

function fixHtmlEntities(text) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
}

function fixUnicodeEscape(text) {
    return text.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
        String.fromCharCode(parseInt(hex, 16))
    );
}

function attemptDecode(text, encoding) {
    // Simple simulation of encoding conversion
    switch (encoding) {
        case 'utf8':
            return text;
        case 'big5':
        case 'gbk':
        case 'shift_jis':
            return fixUtf8AsLatin1(text);
        case 'iso8859':
            return fixLatin1AsUtf8(text);
        default:
            return text;
    }
}

function quickFix(fixType) {
    const text = document.getElementById('inputText').value.trim();
    if (!text) return;

    let result;
    switch (fixType) {
        case 'utf8-big5':
            result = fixUtf8AsLatin1(text);
            break;
        case 'big5-utf8':
            result = fixLatin1AsUtf8(text);
            break;
        case 'gbk-utf8':
            result = fixLatin1AsUtf8(text);
            break;
        case 'double-encode':
            result = fixDoubleUtf8(text);
            break;
        default:
            result = text;
    }

    document.getElementById('outputText').textContent = result;
    document.getElementById('alternativeResults').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
}

function isReadableText(text) {
    // Check if text contains readable characters
    const readable = text.match(/[\u4e00-\u9fff\u3040-\u30ff\u0020-\u007f]/g);
    return readable && readable.length > text.length * 0.3;
}

function selectAlternative(el, text) {
    document.getElementById('outputText').textContent = text;
}

function copyResult() {
    const output = document.getElementById('outputText').textContent;
    navigator.clipboard.writeText(output).then(() => {
        const btn = document.getElementById('copyBtn');
        btn.textContent = '已複製!';
        setTimeout(() => btn.textContent = '複製', 2000);
    });
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

init();
