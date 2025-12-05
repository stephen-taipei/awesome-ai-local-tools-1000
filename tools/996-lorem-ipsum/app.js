// Lorem Ipsum Generator - Tool #996
// Generate placeholder text for designs

(function() {
    'use strict';

    // DOM Elements
    const typeSelect = document.getElementById('type');
    const countInput = document.getElementById('count');
    const formatSelect = document.getElementById('format');
    const styleSelect = document.getElementById('style');
    const startLorem = document.getElementById('start-lorem');
    const includeHtmlTags = document.getElementById('include-html-tags');
    const generateBtn = document.getElementById('generate-btn');
    const output = document.getElementById('output');
    const stats = document.getElementById('stats');
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');
    const previewSection = document.getElementById('preview-section');
    const preview = document.getElementById('preview');
    const quickBtns = document.querySelectorAll('.quick-btn');

    // Text libraries
    const textLibraries = {
        classic: {
            words: ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo', 'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate', 'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'perspiciatis', 'unde', 'omnis', 'iste', 'natus', 'error', 'voluptatem', 'accusantium', 'doloremque', 'laudantium', 'totam', 'rem', 'aperiam', 'eaque', 'ipsa', 'quae', 'ab', 'illo', 'inventore', 'veritatis', 'quasi', 'architecto', 'beatae', 'vitae', 'dicta', 'explicabo'],
            start: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
        },
        hipster: {
            words: ['artisan', 'authentic', 'beard', 'bicycle', 'blog', 'brooklyn', 'cardigan', 'chambray', 'craft', 'denim', 'direct', 'distillery', 'ethical', 'farm', 'fixie', 'flannel', 'food', 'freegan', 'gastropub', 'gentrify', 'hashtag', 'helvetica', 'hoodie', 'humblebrag', 'intelligentsia', 'irony', 'jean', 'kale', 'keytar', 'kickstarter', 'knausgaard', 'kombucha', 'lomo', 'messenger', 'microdosing', 'mustache', 'neutra', 'normcore', 'organic', 'photo', 'pitchfork', 'plaid', 'polaroid', 'portland', 'pour', 'quinoa', 'raw', 'retro', 'ramps', 'schlitz', 'selfies', 'semiotics', 'slow', 'sriracha', 'stumptown', 'sustainable', 'synth', 'tattooed', 'taxidermy', 'thundercats', 'tilde', 'tote', 'trade', 'trust', 'tumblr', 'twee', 'typewriter', 'umami', 'unicorn', 'vegan', 'vice', 'vinyl', 'wayfarers', 'williamsburg', 'wolf', 'yoga', 'yuccie'],
            start: 'Artisan sustainable portland craft beer vegan'
        },
        office: {
            words: ['synergy', 'leverage', 'paradigm', 'bandwidth', 'stakeholder', 'deliverable', 'action', 'item', 'circle', 'back', 'deep', 'dive', 'drill', 'down', 'ecosystem', 'empower', 'enabler', 'engagement', 'execute', 'holistic', 'impact', 'innovative', 'integration', 'iterate', 'key', 'performance', 'indicator', 'lean', 'methodology', 'milestone', 'mission', 'critical', 'move', 'needle', 'offline', 'optimize', 'organic', 'growth', 'out', 'box', 'pipeline', 'pivot', 'proactive', 'pushback', 'quarterly', 'review', 'reach', 'roadmap', 'roi', 'scalable', 'scope', 'sprint', 'strategy', 'streamline', 'sunset', 'synergize', 'takeaway', 'thought', 'leader', 'touch', 'base', 'transparency', 'upskill', 'value', 'proposition', 'vertical', 'visibility', 'win', 'workflow'],
            start: 'Let us circle back to leverage our core synergies'
        },
        bacon: {
            words: ['bacon', 'ipsum', 'dolor', 'amet', 'beef', 'ribs', 'brisket', 'pork', 'belly', 'ham', 'hock', 'sirloin', 'tenderloin', 'drumstick', 'turkey', 'chicken', 'hamburger', 'salami', 'prosciutto', 'pancetta', 'sausage', 'andouille', 'kielbasa', 'chorizo', 'frankfurter', 'meatball', 'meatloaf', 'jerky', 'flank', 'steak', 'ground', 'round', 'corned', 'pastrami', 'short', 'loin', 'spare', 'chuck', 'shank', 'shankle', 'rump', 'tri', 'tip', 'fatback', 'tongue', 'tail', 'picanha', 'capicola', 'bresaola', 'burgdoggen', 'boudin', 'landjaeger', 'kevin', 'venison', 'buffalo', 'leberkas', 'filet', 'mignon', 'porchetta', 'alcatra', 'cupim', 'pig', 'jowl', 'strip', 'ball'],
            start: 'Bacon ipsum dolor amet beef ribs brisket pork belly'
        }
    };

    let generatedText = '';

    // ========== Generate Text ==========

    generateBtn.addEventListener('click', generate);

    function generate() {
        const type = typeSelect.value;
        const count = parseInt(countInput.value) || 1;
        const format = formatSelect.value;
        const style = styleSelect.value;
        const useLoremStart = startLorem.checked;

        const library = textLibraries[style];
        let result;

        switch (type) {
            case 'paragraphs':
                result = generateParagraphs(count, library, useLoremStart);
                break;
            case 'sentences':
                result = generateSentences(count, library, useLoremStart);
                break;
            case 'words':
                result = generateWords(count, library, useLoremStart);
                break;
            case 'list':
                result = generateList(count, library, useLoremStart);
                break;
        }

        // Format output
        generatedText = formatOutput(result, type, format);
        displayOutput(generatedText, format);
        updateStats(generatedText);

        showNotification('Text generated', 'success');
    }

    function generateParagraphs(count, library, useLoremStart) {
        const paragraphs = [];
        for (let i = 0; i < count; i++) {
            const sentenceCount = randomInt(4, 8);
            const sentences = [];
            for (let j = 0; j < sentenceCount; j++) {
                if (i === 0 && j === 0 && useLoremStart) {
                    sentences.push(library.start + '.');
                } else {
                    sentences.push(generateSentence(library));
                }
            }
            paragraphs.push(sentences.join(' '));
        }
        return paragraphs;
    }

    function generateSentences(count, library, useLoremStart) {
        const sentences = [];
        for (let i = 0; i < count; i++) {
            if (i === 0 && useLoremStart) {
                sentences.push(library.start + '.');
            } else {
                sentences.push(generateSentence(library));
            }
        }
        return sentences;
    }

    function generateWords(count, library, useLoremStart) {
        const words = [];
        if (useLoremStart) {
            const startWords = library.start.split(' ');
            words.push(...startWords.slice(0, Math.min(count, startWords.length)));
        }
        while (words.length < count) {
            words.push(randomWord(library));
        }
        return words.slice(0, count);
    }

    function generateList(count, library, useLoremStart) {
        const items = [];
        for (let i = 0; i < count; i++) {
            const wordCount = randomInt(4, 10);
            const words = [];
            if (i === 0 && useLoremStart) {
                words.push(...library.start.split(' ').slice(0, Math.min(wordCount, 6)));
            }
            while (words.length < wordCount) {
                words.push(randomWord(library));
            }
            items.push(capitalize(words.join(' ')));
        }
        return items;
    }

    function generateSentence(library) {
        const wordCount = randomInt(8, 16);
        const words = [];
        for (let i = 0; i < wordCount; i++) {
            words.push(randomWord(library));
        }
        // Add comma occasionally
        if (wordCount > 6 && Math.random() > 0.5) {
            const commaPos = randomInt(3, wordCount - 3);
            words[commaPos] = words[commaPos] + ',';
        }
        return capitalize(words.join(' ')) + '.';
    }

    function formatOutput(content, type, format) {
        if (type === 'words') {
            return content.join(' ');
        }

        if (type === 'list') {
            switch (format) {
                case 'html':
                    return '<ul>\n' + content.map(item => `  <li>${item}</li>`).join('\n') + '\n</ul>';
                case 'markdown':
                    return content.map(item => `- ${item}`).join('\n');
                default:
                    return content.map(item => `• ${item}`).join('\n');
            }
        }

        // Paragraphs or sentences
        switch (format) {
            case 'html':
                if (type === 'paragraphs') {
                    return content.map(p => `<p>${p}</p>`).join('\n\n');
                }
                return `<p>${content.join(' ')}</p>`;
            case 'markdown':
                return content.join('\n\n');
            default:
                return content.join('\n\n');
        }
    }

    function displayOutput(text, format) {
        if (format === 'html') {
            output.textContent = text;
            previewSection.classList.remove('hidden');
            preview.innerHTML = text;
        } else {
            output.textContent = text;
            previewSection.classList.add('hidden');
        }
    }

    function updateStats(text) {
        const words = text.split(/\s+/).filter(w => w.length > 0).length;
        const chars = text.length;
        const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0).length;
        stats.textContent = `${words} words | ${chars} characters | ${paragraphs} paragraphs`;
    }

    // ========== Quick Generate ==========

    quickBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            typeSelect.value = btn.dataset.type;
            countInput.value = btn.dataset.count;
            generate();
        });
    });

    // ========== Copy & Download ==========

    copyBtn.addEventListener('click', async () => {
        if (!generatedText) {
            showNotification('Nothing to copy', 'warning');
            return;
        }
        try {
            await navigator.clipboard.writeText(generatedText);
            showNotification('Copied to clipboard', 'success');
        } catch (e) {
            showNotification('Failed to copy', 'error');
        }
    });

    downloadBtn.addEventListener('click', () => {
        if (!generatedText) {
            showNotification('Nothing to download', 'warning');
            return;
        }
        const format = formatSelect.value;
        const ext = format === 'html' ? 'html' : format === 'markdown' ? 'md' : 'txt';
        const blob = new Blob([generatedText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lorem-ipsum.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
        showNotification('Downloaded', 'success');
    });

    // ========== Utility Functions ==========

    function randomWord(library) {
        return library.words[Math.floor(Math.random() * library.words.length)];
    }

    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
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
