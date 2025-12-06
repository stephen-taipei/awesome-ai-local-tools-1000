// AI Code Completion - Tool #1000

document.addEventListener('DOMContentLoaded', () => {
    const codeEditor = document.getElementById('code-editor');
    const completionDropdown = document.getElementById('completion-dropdown');
    const suggestionsPlaceholder = document.getElementById('suggestions-placeholder');
    const suggestionsList = document.getElementById('suggestions-list');
    const templatesList = document.getElementById('templates-list');
    const langBtns = document.querySelectorAll('.lang-btn');
    const sampleBtn = document.getElementById('sample-btn');
    const clearBtn = document.getElementById('clear-btn');

    // Stats elements
    const statCompletions = document.getElementById('stat-completions');
    const statChars = document.getElementById('stat-chars');
    const statLines = document.getElementById('stat-lines');
    const statTime = document.getElementById('stat-time');

    let currentLang = 'javascript';
    let selectedIndex = -1;
    let currentCompletions = [];
    let stats = {
        completions: 0,
        charsSaved: 0
    };

    // Code patterns for completion
    const completionPatterns = {
        javascript: {
            keywords: ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'return', 'class', 'constructor', 'async', 'await', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'import', 'export', 'default', 'from', 'switch', 'case', 'break', 'continue'],
            snippets: {
                'fun': { label: 'function', code: 'function ${1:name}(${2:params}) {\n    ${3}\n}', description: 'Function declaration' },
                'afun': { label: 'async function', code: 'async function ${1:name}(${2:params}) {\n    ${3}\n}', description: 'Async function' },
                'arr': { label: 'arrow function', code: '(${1:params}) => {\n    ${2}\n}', description: 'Arrow function' },
                'arrs': { label: 'arrow (short)', code: '(${1:params}) => ${2:expression}', description: 'Short arrow function' },
                'if': { label: 'if statement', code: 'if (${1:condition}) {\n    ${2}\n}', description: 'If statement' },
                'ife': { label: 'if-else', code: 'if (${1:condition}) {\n    ${2}\n} else {\n    ${3}\n}', description: 'If-else statement' },
                'for': { label: 'for loop', code: 'for (let ${1:i} = 0; ${1:i} < ${2:length}; ${1:i}++) {\n    ${3}\n}', description: 'For loop' },
                'fore': { label: 'forEach', code: '${1:array}.forEach((${2:item}) => {\n    ${3}\n});', description: 'ForEach loop' },
                'map': { label: 'map', code: '${1:array}.map((${2:item}) => {\n    return ${3};\n});', description: 'Array map' },
                'fil': { label: 'filter', code: '${1:array}.filter((${2:item}) => {\n    return ${3};\n});', description: 'Array filter' },
                'red': { label: 'reduce', code: '${1:array}.reduce((${2:acc}, ${3:item}) => {\n    return ${4};\n}, ${5:initial});', description: 'Array reduce' },
                'try': { label: 'try-catch', code: 'try {\n    ${1}\n} catch (${2:error}) {\n    ${3}\n}', description: 'Try-catch block' },
                'tryf': { label: 'try-catch-finally', code: 'try {\n    ${1}\n} catch (${2:error}) {\n    ${3}\n} finally {\n    ${4}\n}', description: 'Try-catch-finally' },
                'class': { label: 'class', code: 'class ${1:Name} {\n    constructor(${2:params}) {\n        ${3}\n    }\n}', description: 'Class declaration' },
                'clog': { label: 'console.log', code: 'console.log(${1});', description: 'Console log' },
                'imp': { label: 'import', code: "import { ${1} } from '${2:module}';", description: 'Import statement' },
                'impd': { label: 'import default', code: "import ${1:name} from '${2:module}';", description: 'Import default' },
                'exp': { label: 'export', code: 'export { ${1} };', description: 'Export statement' },
                'expd': { label: 'export default', code: 'export default ${1};', description: 'Export default' },
                'prom': { label: 'Promise', code: 'new Promise((resolve, reject) => {\n    ${1}\n});', description: 'New Promise' },
                'fetch': { label: 'fetch', code: "fetch('${1:url}')\n    .then(response => response.json())\n    .then(data => {\n        ${2}\n    })\n    .catch(error => console.error(error));", description: 'Fetch API' },
                'afetch': { label: 'async fetch', code: "const response = await fetch('${1:url}');\nconst data = await response.json();", description: 'Async fetch' },
                'ael': { label: 'addEventListener', code: "${1:element}.addEventListener('${2:event}', (${3:e}) => {\n    ${4}\n});", description: 'Event listener' },
                'qs': { label: 'querySelector', code: "document.querySelector('${1:selector}');", description: 'Query selector' },
                'qsa': { label: 'querySelectorAll', code: "document.querySelectorAll('${1:selector}');", description: 'Query selector all' },
                'ce': { label: 'createElement', code: "document.createElement('${1:tag}');", description: 'Create element' },
                'st': { label: 'setTimeout', code: 'setTimeout(() => {\n    ${1}\n}, ${2:1000});', description: 'Set timeout' },
                'si': { label: 'setInterval', code: 'setInterval(() => {\n    ${1}\n}, ${2:1000});', description: 'Set interval' }
            },
            methods: ['log', 'error', 'warn', 'info', 'table', 'push', 'pop', 'shift', 'unshift', 'slice', 'splice', 'map', 'filter', 'reduce', 'forEach', 'find', 'findIndex', 'includes', 'indexOf', 'join', 'split', 'replace', 'trim', 'toLowerCase', 'toUpperCase', 'toString', 'parseInt', 'parseFloat', 'stringify', 'parse', 'addEventListener', 'removeEventListener', 'querySelector', 'querySelectorAll', 'getElementById', 'getElementsByClassName', 'createElement', 'appendChild', 'removeChild', 'setAttribute', 'getAttribute', 'classList', 'style', 'innerHTML', 'textContent', 'value']
        },
        python: {
            keywords: ['def', 'class', 'if', 'elif', 'else', 'for', 'while', 'return', 'import', 'from', 'as', 'try', 'except', 'finally', 'raise', 'with', 'lambda', 'pass', 'break', 'continue', 'yield', 'global', 'nonlocal', 'assert', 'async', 'await', 'True', 'False', 'None', 'and', 'or', 'not', 'in', 'is'],
            snippets: {
                'def': { label: 'function', code: 'def ${1:name}(${2:params}):\n    ${3:pass}', description: 'Function definition' },
                'adef': { label: 'async function', code: 'async def ${1:name}(${2:params}):\n    ${3:pass}', description: 'Async function' },
                'class': { label: 'class', code: 'class ${1:Name}:\n    def __init__(self${2:, params}):\n        ${3:pass}', description: 'Class definition' },
                'if': { label: 'if statement', code: 'if ${1:condition}:\n    ${2:pass}', description: 'If statement' },
                'ife': { label: 'if-else', code: 'if ${1:condition}:\n    ${2:pass}\nelse:\n    ${3:pass}', description: 'If-else statement' },
                'elif': { label: 'elif', code: 'elif ${1:condition}:\n    ${2:pass}', description: 'Elif statement' },
                'for': { label: 'for loop', code: 'for ${1:item} in ${2:iterable}:\n    ${3:pass}', description: 'For loop' },
                'forr': { label: 'for range', code: 'for ${1:i} in range(${2:n}):\n    ${3:pass}', description: 'For range loop' },
                'fore': { label: 'for enumerate', code: 'for ${1:i}, ${2:item} in enumerate(${3:iterable}):\n    ${4:pass}', description: 'For enumerate' },
                'while': { label: 'while loop', code: 'while ${1:condition}:\n    ${2:pass}', description: 'While loop' },
                'try': { label: 'try-except', code: 'try:\n    ${1:pass}\nexcept ${2:Exception} as ${3:e}:\n    ${4:pass}', description: 'Try-except block' },
                'tryf': { label: 'try-except-finally', code: 'try:\n    ${1:pass}\nexcept ${2:Exception} as ${3:e}:\n    ${4:pass}\nfinally:\n    ${5:pass}', description: 'Try-except-finally' },
                'with': { label: 'with statement', code: "with ${1:context} as ${2:var}:\n    ${3:pass}", description: 'With statement' },
                'open': { label: 'open file', code: "with open('${1:filename}', '${2:r}') as ${3:f}:\n    ${4:content} = ${3:f}.read()", description: 'Open file' },
                'lam': { label: 'lambda', code: 'lambda ${1:x}: ${2:expression}', description: 'Lambda function' },
                'lc': { label: 'list comprehension', code: '[${1:x} for ${1:x} in ${2:iterable}]', description: 'List comprehension' },
                'lcf': { label: 'list comp (filter)', code: '[${1:x} for ${1:x} in ${2:iterable} if ${3:condition}]', description: 'List comp with filter' },
                'dc': { label: 'dict comprehension', code: '{${1:k}: ${2:v} for ${1:k}, ${2:v} in ${3:iterable}}', description: 'Dict comprehension' },
                'main': { label: 'main block', code: "if __name__ == '__main__':\n    ${1:main()}", description: 'Main block' },
                'print': { label: 'print', code: 'print(${1})', description: 'Print statement' },
                'pf': { label: 'print f-string', code: "print(f'${1}')", description: 'Print f-string' },
                'imp': { label: 'import', code: 'import ${1:module}', description: 'Import module' },
                'from': { label: 'from import', code: 'from ${1:module} import ${2:name}', description: 'From import' }
            },
            methods: ['print', 'len', 'range', 'str', 'int', 'float', 'list', 'dict', 'set', 'tuple', 'type', 'isinstance', 'append', 'extend', 'insert', 'remove', 'pop', 'clear', 'index', 'count', 'sort', 'reverse', 'copy', 'keys', 'values', 'items', 'get', 'update', 'join', 'split', 'strip', 'replace', 'find', 'lower', 'upper', 'format', 'open', 'read', 'write', 'close', 'map', 'filter', 'reduce', 'zip', 'enumerate', 'sorted', 'reversed', 'sum', 'min', 'max', 'abs', 'round', 'input']
        },
        html: {
            keywords: ['html', 'head', 'body', 'div', 'span', 'p', 'a', 'img', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'form', 'input', 'button', 'label', 'select', 'option', 'textarea', 'header', 'footer', 'nav', 'main', 'section', 'article', 'aside', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'br', 'hr', 'script', 'style', 'link', 'meta', 'title'],
            snippets: {
                '!': { label: 'HTML5 boilerplate', code: '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>${1:Document}</title>\n</head>\n<body>\n    ${2}\n</body>\n</html>', description: 'HTML5 boilerplate' },
                'div': { label: 'div', code: '<div>${1}</div>', description: 'Div element' },
                'divc': { label: 'div.class', code: '<div class="${1}">${2}</div>', description: 'Div with class' },
                'divid': { label: 'div#id', code: '<div id="${1}">${2}</div>', description: 'Div with id' },
                'span': { label: 'span', code: '<span>${1}</span>', description: 'Span element' },
                'p': { label: 'paragraph', code: '<p>${1}</p>', description: 'Paragraph' },
                'a': { label: 'anchor', code: '<a href="${1:#}">${2:Link}</a>', description: 'Anchor link' },
                'img': { label: 'image', code: '<img src="${1}" alt="${2}">', description: 'Image' },
                'ul': { label: 'unordered list', code: '<ul>\n    <li>${1}</li>\n</ul>', description: 'Unordered list' },
                'ol': { label: 'ordered list', code: '<ol>\n    <li>${1}</li>\n</ol>', description: 'Ordered list' },
                'li': { label: 'list item', code: '<li>${1}</li>', description: 'List item' },
                'table': { label: 'table', code: '<table>\n    <thead>\n        <tr>\n            <th>${1}</th>\n        </tr>\n    </thead>\n    <tbody>\n        <tr>\n            <td>${2}</td>\n        </tr>\n    </tbody>\n</table>', description: 'Table' },
                'form': { label: 'form', code: '<form action="${1}" method="${2:post}">\n    ${3}\n</form>', description: 'Form' },
                'input': { label: 'input', code: '<input type="${1:text}" name="${2}" id="${3}">', description: 'Input field' },
                'inputt': { label: 'input text', code: '<input type="text" name="${1}" id="${2}" placeholder="${3}">', description: 'Text input' },
                'btn': { label: 'button', code: '<button type="${1:button}">${2:Click}</button>', description: 'Button' },
                'label': { label: 'label', code: '<label for="${1}">${2}</label>', description: 'Label' },
                'select': { label: 'select', code: '<select name="${1}" id="${2}">\n    <option value="${3}">${4}</option>\n</select>', description: 'Select dropdown' },
                'textarea': { label: 'textarea', code: '<textarea name="${1}" id="${2}" cols="${3:30}" rows="${4:10}">${5}</textarea>', description: 'Textarea' },
                'script': { label: 'script', code: '<script src="${1}"></script>', description: 'Script tag' },
                'scripts': { label: 'script inline', code: '<script>\n    ${1}\n</script>', description: 'Inline script' },
                'link': { label: 'CSS link', code: '<link rel="stylesheet" href="${1}">', description: 'CSS link' },
                'style': { label: 'style', code: '<style>\n    ${1}\n</style>', description: 'Style tag' },
                'meta': { label: 'meta', code: '<meta name="${1}" content="${2}">', description: 'Meta tag' },
                'h1': { label: 'h1', code: '<h1>${1}</h1>', description: 'Heading 1' },
                'h2': { label: 'h2', code: '<h2>${1}</h2>', description: 'Heading 2' },
                'h3': { label: 'h3', code: '<h3>${1}</h3>', description: 'Heading 3' },
                'nav': { label: 'nav', code: '<nav>\n    ${1}\n</nav>', description: 'Navigation' },
                'header': { label: 'header', code: '<header>\n    ${1}\n</header>', description: 'Header' },
                'footer': { label: 'footer', code: '<footer>\n    ${1}\n</footer>', description: 'Footer' },
                'section': { label: 'section', code: '<section>\n    ${1}\n</section>', description: 'Section' },
                'article': { label: 'article', code: '<article>\n    ${1}\n</article>', description: 'Article' }
            },
            methods: []
        },
        css: {
            keywords: ['color', 'background', 'background-color', 'background-image', 'font-family', 'font-size', 'font-weight', 'margin', 'padding', 'border', 'border-radius', 'width', 'height', 'max-width', 'min-width', 'max-height', 'min-height', 'display', 'position', 'top', 'right', 'bottom', 'left', 'flex', 'flex-direction', 'justify-content', 'align-items', 'grid', 'grid-template-columns', 'grid-template-rows', 'gap', 'text-align', 'line-height', 'letter-spacing', 'text-decoration', 'box-shadow', 'transition', 'transform', 'animation', 'opacity', 'z-index', 'overflow', 'cursor', 'visibility'],
            snippets: {
                'bg': { label: 'background', code: 'background: ${1};', description: 'Background shorthand' },
                'bgc': { label: 'background-color', code: 'background-color: ${1:#fff};', description: 'Background color' },
                'bgi': { label: 'background-image', code: "background-image: url('${1}');", description: 'Background image' },
                'c': { label: 'color', code: 'color: ${1:#000};', description: 'Text color' },
                'w': { label: 'width', code: 'width: ${1:100%};', description: 'Width' },
                'h': { label: 'height', code: 'height: ${1:100%};', description: 'Height' },
                'wh': { label: 'width & height', code: 'width: ${1:100px};\nheight: ${2:100px};', description: 'Width and height' },
                'm': { label: 'margin', code: 'margin: ${1:0};', description: 'Margin' },
                'mt': { label: 'margin-top', code: 'margin-top: ${1:0};', description: 'Margin top' },
                'mr': { label: 'margin-right', code: 'margin-right: ${1:0};', description: 'Margin right' },
                'mb': { label: 'margin-bottom', code: 'margin-bottom: ${1:0};', description: 'Margin bottom' },
                'ml': { label: 'margin-left', code: 'margin-left: ${1:0};', description: 'Margin left' },
                'mx': { label: 'margin x-axis', code: 'margin-left: ${1:auto};\nmargin-right: ${1:auto};', description: 'Horizontal margin' },
                'p': { label: 'padding', code: 'padding: ${1:0};', description: 'Padding' },
                'pt': { label: 'padding-top', code: 'padding-top: ${1:0};', description: 'Padding top' },
                'pr': { label: 'padding-right', code: 'padding-right: ${1:0};', description: 'Padding right' },
                'pb': { label: 'padding-bottom', code: 'padding-bottom: ${1:0};', description: 'Padding bottom' },
                'pl': { label: 'padding-left', code: 'padding-left: ${1:0};', description: 'Padding left' },
                'b': { label: 'border', code: 'border: ${1:1px} ${2:solid} ${3:#000};', description: 'Border' },
                'br': { label: 'border-radius', code: 'border-radius: ${1:4px};', description: 'Border radius' },
                'bs': { label: 'box-shadow', code: 'box-shadow: ${1:0} ${2:2px} ${3:4px} ${4:rgba(0,0,0,0.1)};', description: 'Box shadow' },
                'd': { label: 'display', code: 'display: ${1:block};', description: 'Display' },
                'df': { label: 'display flex', code: 'display: flex;', description: 'Display flex' },
                'dg': { label: 'display grid', code: 'display: grid;', description: 'Display grid' },
                'dn': { label: 'display none', code: 'display: none;', description: 'Display none' },
                'flex': { label: 'flexbox', code: 'display: flex;\njustify-content: ${1:center};\nalign-items: ${2:center};', description: 'Flexbox center' },
                'flexc': { label: 'flex column', code: 'display: flex;\nflex-direction: column;', description: 'Flex column' },
                'flexb': { label: 'flex between', code: 'display: flex;\njustify-content: space-between;\nalign-items: center;', description: 'Flex space-between' },
                'grid': { label: 'grid', code: 'display: grid;\ngrid-template-columns: ${1:repeat(3, 1fr)};\ngap: ${2:1rem};', description: 'CSS Grid' },
                'pos': { label: 'position', code: 'position: ${1:relative};', description: 'Position' },
                'posa': { label: 'position absolute', code: 'position: absolute;\ntop: ${1:0};\nleft: ${2:0};', description: 'Position absolute' },
                'posf': { label: 'position fixed', code: 'position: fixed;\ntop: ${1:0};\nleft: ${2:0};', description: 'Position fixed' },
                'center': { label: 'center absolute', code: 'position: absolute;\ntop: 50%;\nleft: 50%;\ntransform: translate(-50%, -50%);', description: 'Center with transform' },
                'tr': { label: 'transition', code: 'transition: ${1:all} ${2:0.3s} ${3:ease};', description: 'Transition' },
                'tf': { label: 'transform', code: 'transform: ${1:translateX(0)};', description: 'Transform' },
                'ff': { label: 'font-family', code: "font-family: ${1:'Helvetica', sans-serif};", description: 'Font family' },
                'fs': { label: 'font-size', code: 'font-size: ${1:16px};', description: 'Font size' },
                'fw': { label: 'font-weight', code: 'font-weight: ${1:bold};', description: 'Font weight' },
                'ta': { label: 'text-align', code: 'text-align: ${1:center};', description: 'Text align' },
                'tdn': { label: 'text-decoration none', code: 'text-decoration: none;', description: 'No text decoration' },
                'lh': { label: 'line-height', code: 'line-height: ${1:1.5};', description: 'Line height' },
                'op': { label: 'opacity', code: 'opacity: ${1:1};', description: 'Opacity' },
                'z': { label: 'z-index', code: 'z-index: ${1:1};', description: 'Z-index' },
                'cur': { label: 'cursor', code: 'cursor: ${1:pointer};', description: 'Cursor' },
                'over': { label: 'overflow', code: 'overflow: ${1:hidden};', description: 'Overflow' },
                'anim': { label: 'animation', code: 'animation: ${1:name} ${2:1s} ${3:ease} ${4:infinite};', description: 'Animation' },
                'keyf': { label: '@keyframes', code: '@keyframes ${1:name} {\n    0% {\n        ${2}\n    }\n    100% {\n        ${3}\n    }\n}', description: 'Keyframes' },
                'media': { label: '@media', code: '@media (max-width: ${1:768px}) {\n    ${2}\n}', description: 'Media query' }
            },
            methods: []
        }
    };

    // Templates for quick insertion
    const templates = {
        javascript: [
            { label: 'Function', code: 'function name() {\n    \n}' },
            { label: 'Arrow Fn', code: 'const name = () => {\n    \n};' },
            { label: 'Class', code: 'class Name {\n    constructor() {\n        \n    }\n}' },
            { label: 'Async/Await', code: 'async function fetchData() {\n    const response = await fetch(url);\n    const data = await response.json();\n    return data;\n}' },
            { label: 'Event Listener', code: "element.addEventListener('click', (e) => {\n    \n});" },
            { label: 'Try/Catch', code: 'try {\n    \n} catch (error) {\n    console.error(error);\n}' }
        ],
        python: [
            { label: 'Function', code: 'def name():\n    pass' },
            { label: 'Class', code: 'class Name:\n    def __init__(self):\n        pass' },
            { label: 'Main', code: "if __name__ == '__main__':\n    main()" },
            { label: 'With Open', code: "with open('file.txt', 'r') as f:\n    content = f.read()" },
            { label: 'Try/Except', code: 'try:\n    pass\nexcept Exception as e:\n    print(e)' },
            { label: 'List Comp', code: '[x for x in items if condition]' }
        ],
        html: [
            { label: 'HTML5', code: '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Document</title>\n</head>\n<body>\n    \n</body>\n</html>' },
            { label: 'Div', code: '<div class=""></div>' },
            { label: 'Link', code: '<a href="#">Link</a>' },
            { label: 'Image', code: '<img src="" alt="">' },
            { label: 'Form', code: '<form action="" method="post">\n    <input type="text" name="">\n    <button type="submit">Submit</button>\n</form>' },
            { label: 'List', code: '<ul>\n    <li></li>\n</ul>' }
        ],
        css: [
            { label: 'Flexbox', code: 'display: flex;\njustify-content: center;\nalign-items: center;' },
            { label: 'Grid', code: 'display: grid;\ngrid-template-columns: repeat(3, 1fr);\ngap: 1rem;' },
            { label: 'Center', code: 'position: absolute;\ntop: 50%;\nleft: 50%;\ntransform: translate(-50%, -50%);' },
            { label: 'Shadow', code: 'box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);' },
            { label: 'Transition', code: 'transition: all 0.3s ease;' },
            { label: 'Media Query', code: '@media (max-width: 768px) {\n    \n}' }
        ]
    };

    // Sample code
    const samples = {
        javascript: `// Sample JavaScript code
function calculateSum(numbers) {
    return numbers.reduce((acc, num) => acc + num, 0);
}

class DataProcessor {
    constructor(data) {
        this.data = data;
    }

    async process() {
        try {
            const result = await this.transform();
            return result;
        } catch (error) {
            console.error('Processing failed:', error);
        }
    }

    transform() {
        return this.data.map(item => item * 2);
    }
}

// Try typing: fun, arr, for, map, clog`,
        python: `# Sample Python code
def calculate_sum(numbers):
    return sum(numbers)

class DataProcessor:
    def __init__(self, data):
        self.data = data

    async def process(self):
        try:
            result = await self.transform()
            return result
        except Exception as e:
            print(f'Processing failed: {e}')

    def transform(self):
        return [item * 2 for item in self.data]

if __name__ == '__main__':
    processor = DataProcessor([1, 2, 3])
    # Try typing: def, for, try, lc, main`,
        html: `<!-- Sample HTML code -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sample Page</title>
</head>
<body>
    <header>
        <nav>
            <a href="#">Home</a>
            <a href="#">About</a>
        </nav>
    </header>
    <main>
        <h1>Welcome</h1>
        <p>Start typing HTML...</p>
    </main>
    <!-- Try typing: div, form, table, nav, ul -->
</body>
</html>`,
        css: `/* Sample CSS code */
.container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
}

.card {
    background: white;
    border-radius: 8px;
    padding: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
}

.card:hover {
    transform: translateY(-4px);
}

/* Try typing: flex, grid, pos, tr, anim */`
    };

    // Initialize
    updateTemplates();
    updateStats();

    // Language selection
    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            langBtns.forEach(b => {
                b.classList.remove('bg-indigo-600', 'text-white');
                b.classList.add('bg-gray-100', 'text-gray-700');
            });
            btn.classList.remove('bg-gray-100', 'text-gray-700');
            btn.classList.add('bg-indigo-600', 'text-white');
            currentLang = btn.dataset.lang;
            updateTemplates();
            hideDropdown();
        });
    });

    // Sample button
    sampleBtn.addEventListener('click', () => {
        codeEditor.value = samples[currentLang];
        updateStats();
    });

    // Clear button
    clearBtn.addEventListener('click', () => {
        codeEditor.value = '';
        hideDropdown();
        hideSuggestions();
        updateStats();
    });

    // Code editor input
    codeEditor.addEventListener('input', (e) => {
        updateStats();
        const cursorPos = codeEditor.selectionStart;
        const text = codeEditor.value;
        const currentWord = getCurrentWord(text, cursorPos);

        if (currentWord && currentWord.length >= 2) {
            showCompletions(currentWord, cursorPos);
        } else {
            hideDropdown();
        }
    });

    // Keyboard navigation
    codeEditor.addEventListener('keydown', (e) => {
        if (!completionDropdown.classList.contains('hidden')) {
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    selectedIndex = Math.min(selectedIndex + 1, currentCompletions.length - 1);
                    updateSelection();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    selectedIndex = Math.max(selectedIndex - 1, 0);
                    updateSelection();
                    break;
                case 'Enter':
                case 'Tab':
                    if (selectedIndex >= 0 && currentCompletions[selectedIndex]) {
                        e.preventDefault();
                        insertCompletion(currentCompletions[selectedIndex]);
                    }
                    break;
                case 'Escape':
                    hideDropdown();
                    break;
            }
        } else if (e.key === ' ' && e.ctrlKey) {
            e.preventDefault();
            const cursorPos = codeEditor.selectionStart;
            const text = codeEditor.value;
            const currentWord = getCurrentWord(text, cursorPos);
            if (currentWord) {
                showCompletions(currentWord, cursorPos);
            } else {
                showAllSnippets(cursorPos);
            }
        }
    });

    // Click outside to close dropdown
    document.addEventListener('click', (e) => {
        if (!completionDropdown.contains(e.target) && e.target !== codeEditor) {
            hideDropdown();
        }
    });

    // Get current word at cursor
    function getCurrentWord(text, cursorPos) {
        const before = text.substring(0, cursorPos);
        const match = before.match(/[\w!@#]+$/);
        return match ? match[0] : '';
    }

    // Show completions
    function showCompletions(word, cursorPos) {
        const patterns = completionPatterns[currentLang];
        const completions = [];
        const wordLower = word.toLowerCase();

        // Check snippets first
        for (const [key, snippet] of Object.entries(patterns.snippets)) {
            if (key.toLowerCase().startsWith(wordLower) || snippet.label.toLowerCase().includes(wordLower)) {
                completions.push({
                    type: 'snippet',
                    trigger: key,
                    label: snippet.label,
                    code: snippet.code,
                    description: snippet.description
                });
            }
        }

        // Check keywords
        patterns.keywords.forEach(keyword => {
            if (keyword.toLowerCase().startsWith(wordLower) && !completions.find(c => c.label === keyword)) {
                completions.push({
                    type: 'keyword',
                    trigger: keyword,
                    label: keyword,
                    code: keyword,
                    description: 'Keyword'
                });
            }
        });

        // Check methods
        patterns.methods.forEach(method => {
            if (method.toLowerCase().startsWith(wordLower) && !completions.find(c => c.label === method)) {
                completions.push({
                    type: 'method',
                    trigger: method,
                    label: method,
                    code: method,
                    description: 'Method'
                });
            }
        });

        if (completions.length > 0) {
            currentCompletions = completions.slice(0, 10);
            selectedIndex = 0;
            renderDropdown(cursorPos);
            updateSuggestions(completions);
        } else {
            hideDropdown();
            hideSuggestions();
        }
    }

    // Show all snippets
    function showAllSnippets(cursorPos) {
        const patterns = completionPatterns[currentLang];
        const completions = [];

        for (const [key, snippet] of Object.entries(patterns.snippets)) {
            completions.push({
                type: 'snippet',
                trigger: key,
                label: snippet.label,
                code: snippet.code,
                description: snippet.description
            });
        }

        if (completions.length > 0) {
            currentCompletions = completions.slice(0, 10);
            selectedIndex = 0;
            renderDropdown(cursorPos);
            updateSuggestions(completions);
        }
    }

    // Render dropdown
    function renderDropdown(cursorPos) {
        const html = currentCompletions.map((item, index) => `
            <div class="completion-item px-3 py-2 cursor-pointer flex items-center gap-2 ${index === selectedIndex ? 'selected' : ''}" data-index="${index}">
                <span class="w-6 h-6 rounded flex items-center justify-center text-xs ${getTypeColor(item.type)}">
                    ${getTypeIcon(item.type)}
                </span>
                <div class="flex-1 min-w-0">
                    <div class="font-medium text-sm text-gray-800">${item.label}</div>
                    <div class="text-xs text-gray-500 truncate">${item.description}</div>
                </div>
                <span class="text-xs text-gray-400">${item.trigger}</span>
            </div>
        `).join('');

        completionDropdown.innerHTML = html;
        completionDropdown.classList.remove('hidden');

        // Position dropdown
        const rect = codeEditor.getBoundingClientRect();
        const lineHeight = 20;
        const text = codeEditor.value.substring(0, cursorPos);
        const lines = text.split('\n');
        const currentLine = lines.length - 1;
        const charPos = lines[lines.length - 1].length;

        completionDropdown.style.left = `${Math.min(charPos * 8, rect.width - 300)}px`;
        completionDropdown.style.top = `${(currentLine + 1) * lineHeight + 16}px`;
        completionDropdown.style.width = '300px';

        // Add click handlers
        completionDropdown.querySelectorAll('.completion-item').forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.index);
                insertCompletion(currentCompletions[index]);
            });
        });
    }

    // Update selection
    function updateSelection() {
        completionDropdown.querySelectorAll('.completion-item').forEach((item, index) => {
            item.classList.toggle('selected', index === selectedIndex);
        });
    }

    // Insert completion
    function insertCompletion(completion) {
        const cursorPos = codeEditor.selectionStart;
        const text = codeEditor.value;
        const before = text.substring(0, cursorPos);
        const after = text.substring(cursorPos);
        const wordMatch = before.match(/[\w!@#]+$/);
        const wordStart = wordMatch ? cursorPos - wordMatch[0].length : cursorPos;

        // Clean up the code (remove placeholders for simple insert)
        let code = completion.code.replace(/\$\{\d+:?([^}]*)\}/g, '$1');

        const newText = text.substring(0, wordStart) + code + after;
        codeEditor.value = newText;

        // Update cursor position
        const newCursorPos = wordStart + code.length;
        codeEditor.setSelectionRange(newCursorPos, newCursorPos);
        codeEditor.focus();

        // Update stats
        const charsSaved = code.length - (wordMatch ? wordMatch[0].length : 0);
        stats.completions++;
        stats.charsSaved += Math.max(0, charsSaved);
        updateStats();

        hideDropdown();
    }

    // Hide dropdown
    function hideDropdown() {
        completionDropdown.classList.add('hidden');
        currentCompletions = [];
        selectedIndex = -1;
    }

    // Update suggestions panel
    function updateSuggestions(completions) {
        suggestionsPlaceholder.classList.add('hidden');
        suggestionsList.classList.remove('hidden');

        const html = completions.slice(0, 6).map(item => `
            <div class="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors suggestion-item" data-code="${escapeHtml(item.code)}">
                <div class="flex items-center gap-2 mb-1">
                    <span class="w-6 h-6 rounded flex items-center justify-center text-xs ${getTypeColor(item.type)}">
                        ${getTypeIcon(item.type)}
                    </span>
                    <span class="font-medium text-gray-800">${item.label}</span>
                    <span class="text-xs text-gray-400 ml-auto">${item.trigger}</span>
                </div>
                <pre class="text-xs text-gray-600 overflow-hidden whitespace-pre-wrap"><code>${escapeHtml(item.code.substring(0, 100))}${item.code.length > 100 ? '...' : ''}</code></pre>
            </div>
        `).join('');

        suggestionsList.innerHTML = html;

        // Add click handlers
        suggestionsList.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const code = item.dataset.code.replace(/\$\{\d+:?([^}]*)\}/g, '$1');
                const cursorPos = codeEditor.selectionStart;
                const text = codeEditor.value;
                codeEditor.value = text.substring(0, cursorPos) + code + text.substring(cursorPos);
                codeEditor.focus();

                stats.completions++;
                stats.charsSaved += code.length;
                updateStats();
            });
        });
    }

    // Hide suggestions
    function hideSuggestions() {
        suggestionsPlaceholder.classList.remove('hidden');
        suggestionsList.classList.add('hidden');
    }

    // Update templates
    function updateTemplates() {
        const langTemplates = templates[currentLang];
        templatesList.innerHTML = langTemplates.map(t => `
            <button class="template-btn px-3 py-1 text-sm bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded transition-colors" data-code="${escapeHtml(t.code)}">
                ${t.label}
            </button>
        `).join('');

        templatesList.querySelectorAll('.template-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const code = btn.dataset.code;
                const cursorPos = codeEditor.selectionStart;
                const text = codeEditor.value;
                codeEditor.value = text.substring(0, cursorPos) + code + text.substring(cursorPos);
                codeEditor.focus();

                stats.completions++;
                stats.charsSaved += code.length;
                updateStats();
            });
        });
    }

    // Update stats
    function updateStats() {
        const lines = codeEditor.value.split('\n').filter(l => l.trim()).length;
        const timeSaved = Math.round(stats.charsSaved / 50); // Assume 50 chars per second typing speed

        statCompletions.textContent = stats.completions;
        statChars.textContent = stats.charsSaved;
        statLines.textContent = lines;
        statTime.textContent = timeSaved + 's';
    }

    // Helper functions
    function getTypeColor(type) {
        switch (type) {
            case 'snippet': return 'bg-purple-100 text-purple-600';
            case 'keyword': return 'bg-blue-100 text-blue-600';
            case 'method': return 'bg-green-100 text-green-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    }

    function getTypeIcon(type) {
        switch (type) {
            case 'snippet': return '<i class="fas fa-code"></i>';
            case 'keyword': return '<i class="fas fa-key"></i>';
            case 'method': return '<i class="fas fa-cube"></i>';
            default: return '<i class="fas fa-circle"></i>';
        }
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});
