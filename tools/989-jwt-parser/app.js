// JWT Parser - Tool #989
// Decode and analyze JWT tokens locally

(function() {
    'use strict';

    // DOM Elements
    const jwtInput = document.getElementById('jwt-input');
    const decodeBtn = document.getElementById('decode-btn');
    const pasteBtn = document.getElementById('paste-btn');
    const sampleBtn = document.getElementById('sample-btn');
    const clearBtn = document.getElementById('clear-btn');

    const encodedDisplay = document.getElementById('encoded-display');
    const jwtColored = document.getElementById('jwt-colored');
    const decodedResult = document.getElementById('decoded-result');
    const errorDisplay = document.getElementById('error-display');
    const errorMessage = document.getElementById('error-message');

    const validationStatus = document.getElementById('validation-status');
    const statusIcon = document.getElementById('status-icon');
    const statusTitle = document.getElementById('status-title');
    const statusMessage = document.getElementById('status-message');

    const headerJson = document.getElementById('header-json');
    const payloadJson = document.getElementById('payload-json');
    const signatureText = document.getElementById('signature-text');
    const signatureInfo = document.getElementById('signature-info');
    const claimsTable = document.getElementById('claims-table');

    // Standard JWT Claims
    const standardClaims = {
        iss: { name: 'Issuer', desc: 'Who issued the token' },
        sub: { name: 'Subject', desc: 'Subject of the token (user ID)' },
        aud: { name: 'Audience', desc: 'Intended recipient of the token' },
        exp: { name: 'Expiration Time', desc: 'When the token expires', isTime: true },
        nbf: { name: 'Not Before', desc: 'Token not valid before this time', isTime: true },
        iat: { name: 'Issued At', desc: 'When the token was issued', isTime: true },
        jti: { name: 'JWT ID', desc: 'Unique identifier for the token' }
    };

    // Algorithm descriptions
    const algorithms = {
        HS256: 'HMAC using SHA-256',
        HS384: 'HMAC using SHA-384',
        HS512: 'HMAC using SHA-512',
        RS256: 'RSA using SHA-256',
        RS384: 'RSA using SHA-384',
        RS512: 'RSA using SHA-512',
        ES256: 'ECDSA using P-256 and SHA-256',
        ES384: 'ECDSA using P-384 and SHA-384',
        ES512: 'ECDSA using P-521 and SHA-512',
        PS256: 'RSA-PSS using SHA-256',
        PS384: 'RSA-PSS using SHA-384',
        PS512: 'RSA-PSS using SHA-512',
        none: 'No digital signature'
    };

    // Sample JWT for testing
    const sampleJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZW1haWwiOiJqb2huQGV4YW1wbGUuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MzU2ODk2MDAsImlzcyI6Imh0dHBzOi8vZXhhbXBsZS5jb20iLCJhdWQiOiJodHRwczovL2FwaS5leGFtcGxlLmNvbSJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

    // ========== Event Listeners ==========

    decodeBtn.addEventListener('click', decodeJWT);
    jwtInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            decodeJWT();
        }
    });

    pasteBtn.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            jwtInput.value = text.trim();
            showNotification('Pasted', 'success');
        } catch (e) {
            showNotification('Failed to paste', 'error');
        }
    });

    sampleBtn.addEventListener('click', () => {
        jwtInput.value = sampleJWT;
        showNotification('Sample JWT loaded', 'success');
    });

    clearBtn.addEventListener('click', () => {
        jwtInput.value = '';
        encodedDisplay.classList.add('hidden');
        decodedResult.classList.add('hidden');
        errorDisplay.classList.add('hidden');
        showNotification('Cleared', 'success');
    });

    // Copy buttons
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const targetId = btn.dataset.target;
            const targetEl = document.getElementById(targetId);
            try {
                await navigator.clipboard.writeText(targetEl.textContent);
                showNotification('Copied', 'success');
            } catch (e) {
                showNotification('Failed to copy', 'error');
            }
        });
    });

    // ========== JWT Decoding ==========

    function decodeJWT() {
        const token = jwtInput.value.trim();

        if (!token) {
            showNotification('Please enter a JWT token', 'warning');
            return;
        }

        // Hide previous results
        encodedDisplay.classList.add('hidden');
        decodedResult.classList.add('hidden');
        errorDisplay.classList.add('hidden');

        try {
            const parts = token.split('.');

            if (parts.length !== 3) {
                throw new Error(`JWT must have 3 parts separated by dots. Found ${parts.length} part(s).`);
            }

            // Decode header
            let header;
            try {
                header = JSON.parse(base64UrlDecode(parts[0]));
            } catch (e) {
                throw new Error('Invalid header: Could not decode Base64URL or parse JSON.');
            }

            // Decode payload
            let payload;
            try {
                payload = JSON.parse(base64UrlDecode(parts[1]));
            } catch (e) {
                throw new Error('Invalid payload: Could not decode Base64URL or parse JSON.');
            }

            // Signature (keep as-is, it's just the Base64URL string)
            const signature = parts[2];

            // Display colored JWT
            encodedDisplay.classList.remove('hidden');
            jwtColored.innerHTML = `<span class="jwt-header">${escapeHtml(parts[0])}</span>.<span class="jwt-payload">${escapeHtml(parts[1])}</span>.<span class="jwt-signature">${escapeHtml(parts[2])}</span>`;

            // Display decoded result
            decodedResult.classList.remove('hidden');

            // Header
            headerJson.textContent = JSON.stringify(header, null, 2);

            // Payload
            payloadJson.textContent = JSON.stringify(payload, null, 2);

            // Signature
            signatureText.textContent = signature;

            // Algorithm info
            const alg = header.alg || 'unknown';
            const algDesc = algorithms[alg] || 'Unknown algorithm';
            signatureInfo.innerHTML = `
                <div class="flex items-center gap-2">
                    <span class="px-2 py-1 bg-cyan-100 text-cyan-700 rounded text-xs font-medium">${escapeHtml(alg)}</span>
                    <span class="text-gray-500">${escapeHtml(algDesc)}</span>
                </div>
            `;

            // Validation status
            updateValidationStatus(payload);

            // Claims analysis
            updateClaimsTable(payload);

            showNotification('JWT decoded successfully', 'success');

        } catch (e) {
            errorDisplay.classList.remove('hidden');
            errorMessage.textContent = e.message;
            showNotification('Invalid JWT', 'error');
        }
    }

    function base64UrlDecode(str) {
        // Replace URL-safe characters
        let base64 = str.replace(/-/g, '+').replace(/_/g, '/');

        // Add padding if needed
        const padding = base64.length % 4;
        if (padding) {
            base64 += '='.repeat(4 - padding);
        }

        // Decode
        const decoded = atob(base64);

        // Handle UTF-8
        try {
            return decodeURIComponent(escape(decoded));
        } catch (e) {
            return decoded;
        }
    }

    function updateValidationStatus(payload) {
        const now = Math.floor(Date.now() / 1000);
        let isValid = true;
        let message = '';

        if (payload.exp) {
            if (payload.exp < now) {
                isValid = false;
                const expiredAgo = formatTimeAgo(now - payload.exp);
                message = `Token expired ${expiredAgo} ago`;
            } else {
                const expiresIn = formatTimeAgo(payload.exp - now);
                message = `Token expires in ${expiresIn}`;
            }
        } else {
            message = 'No expiration set';
        }

        if (payload.nbf && payload.nbf > now) {
            isValid = false;
            const notValidFor = formatTimeAgo(payload.nbf - now);
            message = `Token not valid for another ${notValidFor}`;
        }

        if (isValid) {
            validationStatus.className = 'mb-6 p-4 rounded-xl flex items-center gap-3 bg-green-50 text-green-700';
            statusIcon.className = 'fas fa-check-circle text-2xl';
            statusTitle.textContent = 'Valid Token';
        } else {
            validationStatus.className = 'mb-6 p-4 rounded-xl flex items-center gap-3 bg-red-50 text-red-700';
            statusIcon.className = 'fas fa-times-circle text-2xl';
            statusTitle.textContent = 'Invalid Token';
        }

        statusMessage.textContent = message;
    }

    function formatTimeAgo(seconds) {
        if (seconds < 60) return `${seconds} second${seconds !== 1 ? 's' : ''}`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''}`;
        const days = Math.floor(hours / 24);
        return `${days} day${days !== 1 ? 's' : ''}`;
    }

    function updateClaimsTable(payload) {
        const rows = [];

        // Process all claims
        for (const [key, value] of Object.entries(payload)) {
            const standardClaim = standardClaims[key];
            let displayValue = value;
            let extra = '';

            if (standardClaim && standardClaim.isTime && typeof value === 'number') {
                const date = new Date(value * 1000);
                displayValue = date.toLocaleString();
                extra = `<span class="text-gray-400 text-xs ml-2">(${value})</span>`;
            } else if (typeof value === 'object') {
                displayValue = JSON.stringify(value);
            }

            rows.push(`
                <div class="py-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                        <span class="font-mono text-indigo-600 font-medium">${escapeHtml(key)}</span>
                        ${standardClaim ? `<span class="text-gray-400 text-xs ml-2">(${standardClaim.name})</span>` : ''}
                    </div>
                    <div class="sm:col-span-2">
                        <span class="font-mono text-sm">${escapeHtml(String(displayValue))}</span>${extra}
                        ${standardClaim ? `<div class="text-xs text-gray-500 mt-1">${standardClaim.desc}</div>` : ''}
                    </div>
                </div>
            `);
        }

        claimsTable.innerHTML = rows.join('');
    }

    // ========== Utility Functions ==========

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
