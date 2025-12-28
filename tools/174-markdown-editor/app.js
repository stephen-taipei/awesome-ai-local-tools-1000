/**
 * Markdown Editor - Tool #174
 */
function init() {
    const input = document.getElementById('markdownInput');
    const preview = document.getElementById('preview');

    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    // Configure marked
    marked.setOptions({
        breaks: true,
        gfm: true
    });

    // Live preview
    input.addEventListener('input', () => {
        preview.innerHTML = marked.parse(input.value);
    });

    // Toolbar actions
    document.querySelectorAll('.tool-btn[data-action]').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            insertMarkdown(action);
        });
    });

    // Export buttons
    document.getElementById('exportHtml').addEventListener('click', exportHtml);
    document.getElementById('exportMd').addEventListener('click', exportMd);

    // Initial sample
    input.value = `# Markdown 編輯器

歡迎使用 **Markdown 編輯器**！

## 功能

- 即時預覽
- 工具列快捷鍵
- 匯出 HTML 或 Markdown

## 程式碼範例

\`\`\`javascript
console.log('Hello, World!');
\`\`\`

## 表格

| 名稱 | 說明 |
|------|------|
| 項目1 | 描述1 |
| 項目2 | 描述2 |

> 這是一段引用文字

---

[連結範例](https://example.com)
`;
    preview.innerHTML = marked.parse(input.value);
}

function insertMarkdown(action) {
    const input = document.getElementById('markdownInput');
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const text = input.value;
    const selected = text.substring(start, end);

    let insertion = '';
    let cursorOffset = 0;

    switch (action) {
        case 'bold':
            insertion = `**${selected || '粗體文字'}**`;
            cursorOffset = selected ? 0 : -2;
            break;
        case 'italic':
            insertion = `*${selected || '斜體文字'}*`;
            cursorOffset = selected ? 0 : -1;
            break;
        case 'heading':
            insertion = `\n## ${selected || '標題'}\n`;
            break;
        case 'link':
            insertion = `[${selected || '連結文字'}](url)`;
            break;
        case 'image':
            insertion = `![${selected || '圖片描述'}](url)`;
            break;
        case 'code':
            if (selected.includes('\n')) {
                insertion = `\n\`\`\`\n${selected}\n\`\`\`\n`;
            } else {
                insertion = `\`${selected || '程式碼'}\``;
            }
            break;
        case 'list':
            insertion = `\n- ${selected || '列表項目'}\n`;
            break;
        case 'quote':
            insertion = `\n> ${selected || '引用文字'}\n`;
            break;
    }

    input.value = text.substring(0, start) + insertion + text.substring(end);
    input.focus();

    const newPos = start + insertion.length + cursorOffset;
    input.setSelectionRange(newPos, newPos);

    // Trigger preview update
    input.dispatchEvent(new Event('input'));
}

function exportHtml() {
    const html = document.getElementById('preview').innerHTML;
    const fullHtml = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown Export</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; line-height: 1.6; }
        code { background: #f4f4f4; padding: 0.2rem 0.4rem; border-radius: 4px; }
        pre { background: #f4f4f4; padding: 1rem; border-radius: 8px; overflow-x: auto; }
        blockquote { border-left: 3px solid #8b5cf6; padding-left: 1rem; margin: 1rem 0; color: #666; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 0.5rem; }
    </style>
</head>
<body>
${html}
</body>
</html>`;

    downloadFile(fullHtml, 'document.html', 'text/html');
}

function exportMd() {
    const md = document.getElementById('markdownInput').value;
    downloadFile(md, 'document.md', 'text/markdown');
}

function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type: type + ';charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

init();
