/**
 * Contract Analysis - Tool #706
 * Analyze contracts for key clauses and risks locally
 */

document.addEventListener('DOMContentLoaded', () => {
    // Language switching
    const langBtns = document.querySelectorAll('.lang-btn');
    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            langBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const lang = btn.dataset.lang;
            document.querySelectorAll('.en').forEach(el => el.style.display = lang === 'en' ? '' : 'none');
            document.querySelectorAll('.zh').forEach(el => el.style.display = lang === 'zh' ? '' : 'none');
        });
    });

    const clausePatterns = {
        'Limitation of Liability': { pattern: /limitation of liability|limit.{0,20}liability|liability.{0,20}limit/gi, risk: 'high', desc: 'May limit compensation for damages' },
        'Indemnification': { pattern: /indemnif|hold harmless|defend and indemnify/gi, risk: 'high', desc: 'Requires one party to cover losses' },
        'Termination': { pattern: /terminat|cancellation|end.{0,10}agreement/gi, risk: 'medium', desc: 'Defines how agreement can be ended' },
        'Confidentiality': { pattern: /confidential|non-disclosure|nda|proprietary information/gi, risk: 'medium', desc: 'Restricts information sharing' },
        'Non-Compete': { pattern: /non-compete|non.compete|restrict.{0,20}compet/gi, risk: 'high', desc: 'Limits competitive activities' },
        'Payment Terms': { pattern: /payment.{0,20}term|due.{0,10}date|net.?\d+|invoice/gi, risk: 'medium', desc: 'Specifies payment obligations' },
        'Intellectual Property': { pattern: /intellectual property|ip rights|copyright|patent|trademark/gi, risk: 'high', desc: 'Defines IP ownership' },
        'Dispute Resolution': { pattern: /dispute|arbitration|mediation|jurisdiction|governing law/gi, risk: 'medium', desc: 'How disputes are handled' },
        'Force Majeure': { pattern: /force majeure|act of god|unforeseeable/gi, risk: 'low', desc: 'Excuses for non-performance' },
        'Warranty': { pattern: /warrant|guarantee|as-is|merchantability/gi, risk: 'medium', desc: 'Product/service guarantees' },
        'Auto-Renewal': { pattern: /auto.{0,5}renew|automatic.{0,5}renewal|evergreen/gi, risk: 'high', desc: 'Automatic contract extension' },
        'Assignment': { pattern: /assign|transfer.{0,20}rights|successor/gi, risk: 'low', desc: 'Transfer of contract rights' }
    };

    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const contractText = document.getElementById('contractText');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const loading = document.getElementById('loading');
    const results = document.getElementById('results');

    uploadArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
        if (e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (ev) => { contractText.value = ev.target.result; };
            reader.readAsText(e.target.files[0]);
        }
    });

    analyzeBtn.addEventListener('click', () => {
        const text = contractText.value.trim();
        if (!text) { alert('Please provide contract text'); return; }

        loading.classList.add('visible');
        results.classList.remove('visible');

        setTimeout(() => {
            const analysis = analyzeContract(text);
            displayResults(analysis);
            loading.classList.remove('visible');
            results.classList.add('visible');
        }, 1500);
    });

    function analyzeContract(text) {
        const clauses = [];
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [];

        for (const [name, config] of Object.entries(clausePatterns)) {
            const matches = text.match(config.pattern);
            if (matches) {
                const relevantSentences = sentences.filter(s => config.pattern.test(s)).slice(0, 2);
                clauses.push({
                    name,
                    risk: config.risk,
                    description: config.desc,
                    matchCount: matches.length,
                    excerpts: relevantSentences.map(s => s.trim())
                });
            }
        }

        // Extract key terms
        const termPatterns = [
            /\$[\d,]+(?:\.\d{2})?/g,
            /\d+\s*(?:days?|months?|years?)/gi,
            /\d+%/g,
            /(?:effective|commencement|start)\s*date[:\s]*[\w\s,]+/gi
        ];
        const keyTerms = new Set();
        termPatterns.forEach(pattern => {
            const matches = text.match(pattern) || [];
            matches.forEach(m => keyTerms.add(m.trim()));
        });

        return { clauses, keyTerms: [...keyTerms] };
    }

    function displayResults(analysis) {
        const riskCounts = { high: 0, medium: 0, low: 0 };
        analysis.clauses.forEach(c => riskCounts[c.risk]++);

        document.getElementById('riskSummary').innerHTML = `
            <div class="risk-card high"><div class="risk-count">${riskCounts.high}</div><div class="risk-label">High Risk</div></div>
            <div class="risk-card medium"><div class="risk-count">${riskCounts.medium}</div><div class="risk-label">Medium Risk</div></div>
            <div class="risk-card low"><div class="risk-count">${riskCounts.low}</div><div class="risk-label">Low Risk</div></div>
        `;

        document.getElementById('clauseAnalysis').innerHTML = analysis.clauses.map((c, i) => `
            <div class="clause-section">
                <div class="clause-header" onclick="this.nextElementSibling.classList.toggle('visible')">
                    <span class="clause-title">${c.name}</span>
                    <span class="clause-badge ${c.risk}">${c.risk.toUpperCase()}</span>
                </div>
                <div class="clause-content">
                    ${c.excerpts.length ? `<div class="clause-text">"${c.excerpts[0]}"</div>` : ''}
                    <div class="clause-analysis"><strong>Analysis:</strong> ${c.description}. Found ${c.matchCount} reference(s) in the document.</div>
                </div>
            </div>
        `).join('');

        document.getElementById('keyTerms').innerHTML = analysis.keyTerms.map(t => `<span class="term-tag">${t}</span>`).join('');
    }
});
