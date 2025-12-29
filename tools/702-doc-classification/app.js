/**
 * Document Classification - Tool #702
 * AI-powered document classification running locally
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

    // DOM elements
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const textInput = document.getElementById('textInput');
    const customCategories = document.getElementById('customCategories');
    const classifyBtn = document.getElementById('classifyBtn');
    const loading = document.getElementById('loading');
    const results = document.getElementById('results');
    const resultsContainer = document.getElementById('resultsContainer');

    // Default categories with keywords
    const defaultCategories = {
        'Legal': ['contract', 'agreement', 'law', 'legal', 'court', 'attorney', 'clause', 'liability', 'jurisdiction', 'plaintiff', 'defendant', 'statute', 'regulation', 'compliance'],
        'Technical': ['software', 'code', 'algorithm', 'system', 'api', 'database', 'programming', 'server', 'network', 'protocol', 'architecture', 'development', 'technical', 'implementation'],
        'Financial': ['revenue', 'profit', 'investment', 'budget', 'financial', 'accounting', 'tax', 'expense', 'income', 'asset', 'liability', 'balance', 'fiscal', 'capital'],
        'Marketing': ['marketing', 'brand', 'campaign', 'customer', 'audience', 'promotion', 'advertising', 'market', 'sales', 'conversion', 'engagement', 'social media', 'content'],
        'HR/Personnel': ['employee', 'hiring', 'recruitment', 'salary', 'benefits', 'performance', 'training', 'hr', 'personnel', 'workforce', 'compensation', 'onboarding'],
        'Medical/Health': ['patient', 'treatment', 'diagnosis', 'medical', 'health', 'clinical', 'hospital', 'doctor', 'therapy', 'medication', 'symptom', 'disease'],
        'Academic/Research': ['study', 'research', 'analysis', 'hypothesis', 'methodology', 'data', 'findings', 'academic', 'thesis', 'literature', 'experiment', 'conclusion'],
        'Business/Operations': ['business', 'operations', 'strategy', 'management', 'process', 'efficiency', 'productivity', 'project', 'stakeholder', 'objective', 'milestone']
    };

    // File upload
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.style.borderColor = '#11998e'; });
    uploadArea.addEventListener('dragleave', () => { uploadArea.style.borderColor = '#ddd'; });
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#ddd';
        if (e.dataTransfer.files.length) loadFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) loadFile(e.target.files[0]);
    });

    function loadFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => { textInput.value = e.target.result; };
        reader.readAsText(file);
    }

    // Classify document
    classifyBtn.addEventListener('click', () => {
        const text = textInput.value.trim();
        if (!text) {
            alert('Please upload a document or paste text');
            return;
        }

        loading.classList.add('visible');
        results.classList.remove('visible');

        setTimeout(() => {
            const categories = getCategories();
            const classification = classifyDocument(text, categories);
            displayResults(classification);
            loading.classList.remove('visible');
            results.classList.add('visible');
        }, 1200);
    });

    function getCategories() {
        const custom = customCategories.value.trim();
        if (custom) {
            const cats = {};
            custom.split(',').forEach(cat => {
                const name = cat.trim();
                if (name) cats[name] = [name.toLowerCase()];
            });
            return cats;
        }
        return defaultCategories;
    }

    function classifyDocument(text, categories) {
        const lowerText = text.toLowerCase();
        const words = lowerText.split(/\s+/);
        const results = [];

        for (const [category, keywords] of Object.entries(categories)) {
            let score = 0;
            const matchedKeywords = [];

            keywords.forEach(keyword => {
                const regex = new RegExp('\\b' + keyword + '\\b', 'gi');
                const matches = lowerText.match(regex);
                if (matches) {
                    score += matches.length;
                    if (!matchedKeywords.includes(keyword)) matchedKeywords.push(keyword);
                }
            });

            if (score > 0) {
                results.push({
                    category,
                    score,
                    keywords: matchedKeywords,
                    confidence: 0
                });
            }
        }

        // Calculate confidence percentages
        const totalScore = results.reduce((sum, r) => sum + r.score, 0);
        results.forEach(r => {
            r.confidence = totalScore > 0 ? Math.round((r.score / totalScore) * 100) : 0;
        });

        // Sort by confidence
        results.sort((a, b) => b.confidence - a.confidence);

        return results.slice(0, 5);
    }

    function displayResults(classification) {
        if (classification.length === 0) {
            resultsContainer.innerHTML = '<p>No clear classification found. Try adding custom categories.</p>';
            return;
        }

        resultsContainer.innerHTML = classification.map((result, index) => `
            <div class="category-result">
                <div class="category-name">${index + 1}. ${result.category}</div>
                <div>Confidence: ${result.confidence}%</div>
                <div class="confidence-bar">
                    <div class="confidence-fill" style="width: ${result.confidence}%"></div>
                </div>
                <div class="category-tags">
                    ${result.keywords.map(kw => `<span class="tag">${kw}</span>`).join('')}
                </div>
            </div>
        `).join('');
    }
});
