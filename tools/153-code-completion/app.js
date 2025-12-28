/**
 * Code Completion - Tool #153
 */
const snippets = {
    javascript: [
        { prefix: 'fn', name: '函數', code: 'function name(params) {\n  \n}' },
        { prefix: 'afn', name: '箭頭函數', code: 'const name = (params) => {\n  \n};' },
        { prefix: 'async', name: '非同步函數', code: 'async function name(params) {\n  try {\n    \n  } catch (error) {\n    console.error(error);\n  }\n}' },
        { prefix: 'class', name: '類別', code: 'class Name {\n  constructor() {\n    \n  }\n}' },
        { prefix: 'for', name: 'For 迴圈', code: 'for (let i = 0; i < array.length; i++) {\n  \n}' },
        { prefix: 'fore', name: 'ForEach', code: 'array.forEach((item) => {\n  \n});' },
        { prefix: 'map', name: 'Map', code: 'const result = array.map((item) => {\n  return item;\n});' },
        { prefix: 'filter', name: 'Filter', code: 'const result = array.filter((item) => {\n  return condition;\n});' },
        { prefix: 'reduce', name: 'Reduce', code: 'const result = array.reduce((acc, item) => {\n  return acc;\n}, initial);' },
        { prefix: 'fetch', name: 'Fetch API', code: 'fetch(url)\n  .then(res => res.json())\n  .then(data => {\n    \n  })\n  .catch(err => console.error(err));' },
        { prefix: 'try', name: 'Try-Catch', code: 'try {\n  \n} catch (error) {\n  console.error(error);\n}' },
        { prefix: 'if', name: '條件判斷', code: 'if (condition) {\n  \n}' },
        { prefix: 'ife', name: 'If-Else', code: 'if (condition) {\n  \n} else {\n  \n}' },
        { prefix: 'sw', name: 'Switch', code: 'switch (key) {\n  case value:\n    break;\n  default:\n    break;\n}' },
        { prefix: 'log', name: 'Console Log', code: "console.log('');" },
        { prefix: 'imp', name: 'Import', code: "import { } from 'module';" },
        { prefix: 'exp', name: 'Export', code: 'export default name;' },
        { prefix: 'prom', name: 'Promise', code: 'new Promise((resolve, reject) => {\n  \n});' },
        { prefix: 'set', name: 'setTimeout', code: 'setTimeout(() => {\n  \n}, 1000);' },
        { prefix: 'int', name: 'setInterval', code: 'setInterval(() => {\n  \n}, 1000);' }
    ],
    python: [
        { prefix: 'def', name: '函數', code: 'def name(params):\n    pass' },
        { prefix: 'class', name: '類別', code: 'class Name:\n    def __init__(self):\n        pass' },
        { prefix: 'for', name: 'For 迴圈', code: 'for item in items:\n    pass' },
        { prefix: 'while', name: 'While 迴圈', code: 'while condition:\n    pass' },
        { prefix: 'if', name: '條件判斷', code: 'if condition:\n    pass' },
        { prefix: 'ife', name: 'If-Else', code: 'if condition:\n    pass\nelse:\n    pass' },
        { prefix: 'try', name: 'Try-Except', code: 'try:\n    pass\nexcept Exception as e:\n    print(e)' },
        { prefix: 'with', name: 'With 語句', code: "with open('file.txt', 'r') as f:\n    content = f.read()" },
        { prefix: 'lc', name: 'List Comprehension', code: 'result = [x for x in items if condition]' },
        { prefix: 'dc', name: 'Dict Comprehension', code: 'result = {k: v for k, v in items.items()}' },
        { prefix: 'lambda', name: 'Lambda', code: 'f = lambda x: x' },
        { prefix: 'print', name: 'Print', code: "print('')" },
        { prefix: 'imp', name: 'Import', code: 'import module' },
        { prefix: 'from', name: 'From Import', code: 'from module import name' },
        { prefix: 'async', name: 'Async 函數', code: 'async def name(params):\n    await something' },
        { prefix: 'main', name: 'Main Guard', code: "if __name__ == '__main__':\n    main()" }
    ],
    typescript: [
        { prefix: 'fn', name: '函數', code: 'function name(params: Type): ReturnType {\n  \n}' },
        { prefix: 'afn', name: '箭頭函數', code: 'const name = (params: Type): ReturnType => {\n  \n};' },
        { prefix: 'int', name: 'Interface', code: 'interface Name {\n  property: Type;\n}' },
        { prefix: 'type', name: 'Type Alias', code: 'type Name = {\n  property: Type;\n};' },
        { prefix: 'class', name: '類別', code: 'class Name {\n  private property: Type;\n\n  constructor() {\n    \n  }\n}' },
        { prefix: 'enum', name: 'Enum', code: 'enum Name {\n  Value1,\n  Value2,\n}' },
        { prefix: 'gen', name: '泛型函數', code: 'function name<T>(param: T): T {\n  return param;\n}' },
        { prefix: 'async', name: 'Async 函數', code: 'async function name(params: Type): Promise<ReturnType> {\n  try {\n    \n  } catch (error) {\n    throw error;\n  }\n}' },
        { prefix: 'react', name: 'React Component', code: "import React from 'react';\n\ninterface Props {\n  \n}\n\nconst Component: React.FC<Props> = ({}) => {\n  return (\n    <div></div>\n  );\n};\n\nexport default Component;" },
        { prefix: 'hook', name: 'Custom Hook', code: 'function useName(param: Type) {\n  const [state, setState] = useState<Type>(initial);\n\n  useEffect(() => {\n    \n  }, []);\n\n  return { state };\n}' }
    ],
    html: [
        { prefix: 'html', name: 'HTML 模板', code: '<!DOCTYPE html>\n<html lang="zh-TW">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Document</title>\n</head>\n<body>\n  \n</body>\n</html>' },
        { prefix: 'div', name: 'Div', code: '<div class="">\n  \n</div>' },
        { prefix: 'a', name: '連結', code: '<a href=""></a>' },
        { prefix: 'img', name: '圖片', code: '<img src="" alt="">' },
        { prefix: 'ul', name: '無序列表', code: '<ul>\n  <li></li>\n</ul>' },
        { prefix: 'ol', name: '有序列表', code: '<ol>\n  <li></li>\n</ol>' },
        { prefix: 'form', name: '表單', code: '<form action="" method="post">\n  \n</form>' },
        { prefix: 'input', name: '輸入框', code: '<input type="text" name="" id="">' },
        { prefix: 'btn', name: '按鈕', code: '<button type="button"></button>' },
        { prefix: 'table', name: '表格', code: '<table>\n  <thead>\n    <tr>\n      <th></th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td></td>\n    </tr>\n  </tbody>\n</table>' },
        { prefix: 'script', name: 'Script', code: '<script src=""></script>' },
        { prefix: 'link', name: 'CSS Link', code: '<link rel="stylesheet" href="">' }
    ],
    css: [
        { prefix: 'flex', name: 'Flexbox', code: 'display: flex;\njustify-content: center;\nalign-items: center;' },
        { prefix: 'grid', name: 'Grid', code: 'display: grid;\ngrid-template-columns: repeat(3, 1fr);\ngap: 1rem;' },
        { prefix: 'center', name: '置中', code: 'position: absolute;\ntop: 50%;\nleft: 50%;\ntransform: translate(-50%, -50%);' },
        { prefix: 'media', name: 'Media Query', code: '@media (max-width: 768px) {\n  \n}' },
        { prefix: 'var', name: 'CSS 變數', code: ':root {\n  --primary-color: #3b82f6;\n}' },
        { prefix: 'trans', name: '過渡效果', code: 'transition: all 0.3s ease;' },
        { prefix: 'shadow', name: '陰影', code: 'box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);' },
        { prefix: 'grad', name: '漸層', code: 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);' },
        { prefix: 'btn', name: '按鈕樣式', code: 'padding: 0.75rem 1.5rem;\nborder: none;\nborder-radius: 8px;\ncursor: pointer;\ntransition: all 0.2s ease;' },
        { prefix: 'reset', name: 'Reset', code: '*, *::before, *::after {\n  box-sizing: border-box;\n  margin: 0;\n  padding: 0;\n}' }
    ]
};

let currentLang = 'javascript';
let selectedIndex = -1;

function getSuggestions(code, lang) {
    const lines = code.split('\n');
    const lastLine = lines[lines.length - 1].trim();
    if (!lastLine) return [];

    const langSnippets = snippets[lang] || [];
    return langSnippets.filter(s =>
        s.prefix.toLowerCase().startsWith(lastLine.toLowerCase()) ||
        s.name.toLowerCase().includes(lastLine.toLowerCase())
    ).slice(0, 8);
}

function insertSnippet(code, snippet) {
    const textarea = document.getElementById('codeInput');
    const lines = code.split('\n');
    const lastLineIndex = lines.length - 1;
    const lastLine = lines[lastLineIndex];
    const trimmed = lastLine.trim();

    // Replace the trigger text with the snippet
    const indent = lastLine.match(/^\s*/)[0];
    lines[lastLineIndex] = indent + snippet.code.split('\n').map((line, i) => i === 0 ? line : indent + line).join('\n');

    textarea.value = lines.join('\n');
    textarea.focus();
}

function renderSuggestions(suggestions) {
    const container = document.getElementById('suggestionsContainer');
    const list = document.getElementById('suggestionsList');

    if (suggestions.length === 0) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'block';
    list.innerHTML = suggestions.map((s, i) => `
        <div class="suggestion-item ${i === selectedIndex ? 'selected' : ''}" data-index="${i}">
            <span class="suggestion-code">${s.prefix} → ${s.name}</span>
            <span class="suggestion-desc">${s.code.split('\n')[0].substring(0, 30)}...</span>
        </div>
    `).join('');

    list.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
            const idx = parseInt(item.dataset.index);
            insertSnippet(document.getElementById('codeInput').value, suggestions[idx]);
            container.style.display = 'none';
            selectedIndex = -1;
        });
    });
}

function renderSnippets(lang) {
    const grid = document.getElementById('snippetsGrid');
    const langSnippets = snippets[lang] || [];

    grid.innerHTML = langSnippets.map(s => `
        <div class="snippet-card" data-code="${encodeURIComponent(s.code)}">
            <div class="snippet-name">${s.name}</div>
            <span class="snippet-prefix">${s.prefix}</span>
        </div>
    `).join('');

    grid.querySelectorAll('.snippet-card').forEach(card => {
        card.addEventListener('click', () => {
            const code = decodeURIComponent(card.dataset.code);
            const textarea = document.getElementById('codeInput');
            const pos = textarea.selectionStart;
            const before = textarea.value.substring(0, pos);
            const after = textarea.value.substring(pos);
            textarea.value = before + code + after;
            textarea.focus();
        });
    });
}

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    const textarea = document.getElementById('codeInput');
    const langSelect = document.getElementById('langSelect');

    langSelect.addEventListener('change', () => {
        currentLang = langSelect.value;
        renderSnippets(currentLang);
    });

    textarea.addEventListener('input', () => {
        const suggestions = getSuggestions(textarea.value, currentLang);
        selectedIndex = -1;
        renderSuggestions(suggestions);
    });

    textarea.addEventListener('keydown', (e) => {
        const container = document.getElementById('suggestionsContainer');
        if (container.style.display === 'none') return;

        const suggestions = getSuggestions(textarea.value, currentLang);

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, suggestions.length - 1);
            renderSuggestions(suggestions);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, 0);
            renderSuggestions(suggestions);
        } else if (e.key === 'Tab' || e.key === 'Enter') {
            if (selectedIndex >= 0 && suggestions[selectedIndex]) {
                e.preventDefault();
                insertSnippet(textarea.value, suggestions[selectedIndex]);
                container.style.display = 'none';
                selectedIndex = -1;
            } else if (suggestions.length > 0) {
                e.preventDefault();
                insertSnippet(textarea.value, suggestions[0]);
                container.style.display = 'none';
            }
        } else if (e.key === 'Escape') {
            container.style.display = 'none';
            selectedIndex = -1;
        }
    });

    renderSnippets(currentLang);
}
init();
