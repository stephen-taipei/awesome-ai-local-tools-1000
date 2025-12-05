// Markdown Preview - Tool #991
// Real-time Markdown editor with live preview

(function() {
    'use strict';

    // DOM Elements
    const mdInput = document.getElementById('md-input');
    const mdPreview = document.getElementById('md-preview');
    const charCount = document.getElementById('char-count');
    const sampleBtn = document.getElementById('sample-btn');
    const clearBtn = document.getElementById('clear-btn');
    const copyMdBtn = document.getElementById('copy-md-btn');
    const copyHtmlBtn = document.getElementById('copy-html-btn');

    const formatBtns = document.querySelectorAll('.format-btn');
    const viewBtns = document.querySelectorAll('.view-btn');
    const editorContainer = document.getElementById('editor-container');
    const inputPanel = document.getElementById('input-panel');
    const previewPanel = document.getElementById('preview-panel');

    // Sample Markdown
    const sampleMarkdown = `# Welcome to Markdown Preview

This is a **live preview** editor for *Markdown* with support for ~~strikethrough~~ and more!

## Features

- Real-time preview
- GitHub Flavored Markdown (GFM)
- Syntax highlighting for code blocks
- Tables support
- Task lists

### Code Example

Inline code: \`const hello = "world"\`

\`\`\`javascript
function greet(name) {
    console.log(\`Hello, \${name}!\`);
    return true;
}

greet("Developer");
\`\`\`

### Task List

- [x] Create Markdown editor
- [x] Add live preview
- [ ] Add more features
- [ ] Write documentation

### Table

| Feature | Status | Notes |
|---------|--------|-------|
| Bold | Done | **works** |
| Italic | Done | *works* |
| Tables | Done | You're looking at one |

### Blockquote

> "The only way to do great work is to love what you do."
> — Steve Jobs

### Links & Images

[Visit GitHub](https://github.com)

![Placeholder Image](https://via.placeholder.com/150x100?text=Image)

---

*Happy writing!*
`;

    // Configure marked
    marked.setOptions({
        breaks: true,
        gfm: true,
        headerIds: true,
        highlight: function(code, lang) {
            if (Prism.languages[lang]) {
                return Prism.highlight(code, Prism.languages[lang], lang);
            }
            return code;
        }
    });

    // ========== Live Preview ==========

    let debounceTimeout;

    function updatePreview() {
        const markdown = mdInput.value;
        try {
            const html = marked.parse(markdown);
            mdPreview.innerHTML = html;

            // Apply Prism highlighting to code blocks
            mdPreview.querySelectorAll('pre code').forEach(block => {
                Prism.highlightElement(block);
            });
        } catch (e) {
            mdPreview.innerHTML = '<p class="text-red-500">Error parsing Markdown</p>';
        }

        // Update char count
        charCount.textContent = `${markdown.length} chars`;
    }

    mdInput.addEventListener('input', () => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(updatePreview, 100);
    });

    // ========== Format Buttons ==========

    const formats = {
        bold: { prefix: '**', suffix: '**', placeholder: 'bold text' },
        italic: { prefix: '*', suffix: '*', placeholder: 'italic text' },
        strikethrough: { prefix: '~~', suffix: '~~', placeholder: 'strikethrough' },
        h1: { prefix: '# ', suffix: '', placeholder: 'Heading 1', line: true },
        h2: { prefix: '## ', suffix: '', placeholder: 'Heading 2', line: true },
        h3: { prefix: '### ', suffix: '', placeholder: 'Heading 3', line: true },
        ul: { prefix: '- ', suffix: '', placeholder: 'list item', line: true },
        ol: { prefix: '1. ', suffix: '', placeholder: 'list item', line: true },
        checklist: { prefix: '- [ ] ', suffix: '', placeholder: 'task item', line: true },
        link: { prefix: '[', suffix: '](url)', placeholder: 'link text' },
        image: { prefix: '![', suffix: '](url)', placeholder: 'alt text' },
        code: { prefix: '`', suffix: '`', placeholder: 'code' },
        codeblock: { prefix: '```\n', suffix: '\n```', placeholder: 'code block', block: true },
        quote: { prefix: '> ', suffix: '', placeholder: 'quote', line: true },
        table: {
            insert: '| Header 1 | Header 2 | Header 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n| Cell 4   | Cell 5   | Cell 6   |'
        },
        hr: { insert: '\n---\n' }
    };

    formatBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const format = formats[btn.dataset.format];
            if (!format) return;

            const start = mdInput.selectionStart;
            const end = mdInput.selectionEnd;
            const text = mdInput.value;
            const selected = text.substring(start, end);

            let newText;
            let newCursorPos;

            if (format.insert) {
                // Insert fixed text
                newText = text.substring(0, start) + format.insert + text.substring(end);
                newCursorPos = start + format.insert.length;
            } else if (format.line) {
                // Line-based format (add at start of line)
                let lineStart = text.lastIndexOf('\n', start - 1) + 1;
                const before = text.substring(0, lineStart);
                const after = text.substring(lineStart);

                if (selected) {
                    newText = before + format.prefix + selected + format.suffix + after.substring(selected.length);
                } else {
                    newText = before + format.prefix + format.placeholder + format.suffix + after;
                }
                newCursorPos = lineStart + format.prefix.length + (selected || format.placeholder).length;
            } else if (format.block) {
                // Block format
                const content = selected || format.placeholder;
                const insertion = format.prefix + content + format.suffix;
                newText = text.substring(0, start) + insertion + text.substring(end);
                newCursorPos = start + format.prefix.length + content.length;
            } else {
                // Wrap format
                const content = selected || format.placeholder;
                const insertion = format.prefix + content + format.suffix;
                newText = text.substring(0, start) + insertion + text.substring(end);
                newCursorPos = start + format.prefix.length + content.length;
            }

            mdInput.value = newText;
            mdInput.focus();
            mdInput.setSelectionRange(newCursorPos, newCursorPos);
            updatePreview();
        });
    });

    // Keyboard shortcuts
    mdInput.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 'b') {
                e.preventDefault();
                document.querySelector('[data-format="bold"]').click();
            } else if (e.key === 'i') {
                e.preventDefault();
                document.querySelector('[data-format="italic"]').click();
            }
        }

        // Tab handling
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = mdInput.selectionStart;
            const end = mdInput.selectionEnd;
            mdInput.value = mdInput.value.substring(0, start) + '    ' + mdInput.value.substring(end);
            mdInput.selectionStart = mdInput.selectionEnd = start + 4;
            updatePreview();
        }
    });

    // ========== View Toggle (Mobile) ==========

    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            viewBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const view = btn.dataset.view;
            if (view === 'split') {
                editorContainer.style.gridTemplateColumns = '1fr 1fr';
                inputPanel.classList.remove('hidden');
                previewPanel.classList.remove('hidden');
            } else if (view === 'edit') {
                editorContainer.style.gridTemplateColumns = '1fr';
                inputPanel.classList.remove('hidden');
                previewPanel.classList.add('hidden');
            } else if (view === 'preview') {
                editorContainer.style.gridTemplateColumns = '1fr';
                inputPanel.classList.add('hidden');
                previewPanel.classList.remove('hidden');
            }
        });
    });

    // ========== Actions ==========

    sampleBtn.addEventListener('click', () => {
        mdInput.value = sampleMarkdown;
        updatePreview();
        showNotification('Sample loaded', 'success');
    });

    clearBtn.addEventListener('click', () => {
        mdInput.value = '';
        updatePreview();
        showNotification('Cleared', 'success');
    });

    copyMdBtn.addEventListener('click', async () => {
        if (!mdInput.value) {
            showNotification('Nothing to copy', 'warning');
            return;
        }
        try {
            await navigator.clipboard.writeText(mdInput.value);
            showNotification('Markdown copied', 'success');
        } catch (e) {
            showNotification('Failed to copy', 'error');
        }
    });

    copyHtmlBtn.addEventListener('click', async () => {
        if (!mdInput.value) {
            showNotification('Nothing to copy', 'warning');
            return;
        }
        try {
            const html = marked.parse(mdInput.value);
            await navigator.clipboard.writeText(html);
            showNotification('HTML copied', 'success');
        } catch (e) {
            showNotification('Failed to copy', 'error');
        }
    });

    // ========== Utility ==========

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

    // Initialize
    updatePreview();

})();
