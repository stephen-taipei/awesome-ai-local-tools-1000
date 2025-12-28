/**
 * API Doc Generator - Tool #160
 */
let endpoints = [];
let currentFormat = 'markdown';
let endpointId = 0;

function createEndpointCard() {
    const id = endpointId++;
    const card = document.createElement('div');
    card.className = 'endpoint-card';
    card.dataset.id = id;

    card.innerHTML = `
        <div class="endpoint-row">
            <select class="method-select" data-field="method">
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
            </select>
            <input type="text" class="endpoint-path" data-field="path" placeholder="/users/{id}">
            <button class="remove-btn" onclick="removeEndpoint(${id})">移除</button>
        </div>
        <input type="text" class="endpoint-desc" data-field="description" placeholder="端點描述...">
        <details class="params-section">
            <summary>參數 (點擊展開)</summary>
            <div class="params-list"></div>
            <button class="btn btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; margin-top: 0.5rem;" onclick="addParam(${id})">+ 新增參數</button>
        </details>
    `;

    endpoints.push({ id, method: 'GET', path: '', description: '', params: [] });
    return card;
}

function addParam(endpointId) {
    const card = document.querySelector(`.endpoint-card[data-id="${endpointId}"]`);
    const paramsList = card.querySelector('.params-list');
    const paramId = Date.now();

    const row = document.createElement('div');
    row.className = 'param-row';
    row.dataset.paramId = paramId;
    row.innerHTML = `
        <input type="text" class="param-name" placeholder="名稱" data-field="name">
        <select class="param-type" data-field="type">
            <option value="string">string</option>
            <option value="integer">integer</option>
            <option value="boolean">boolean</option>
            <option value="object">object</option>
            <option value="array">array</option>
        </select>
        <input type="text" class="param-desc" placeholder="說明" data-field="desc">
        <button class="remove-btn" onclick="this.parentElement.remove()">×</button>
    `;

    paramsList.appendChild(row);
}

function removeEndpoint(id) {
    const card = document.querySelector(`.endpoint-card[data-id="${id}"]`);
    if (card) card.remove();
    endpoints = endpoints.filter(e => e.id !== id);
}

function collectEndpointData() {
    const cards = document.querySelectorAll('.endpoint-card');
    const data = [];

    cards.forEach(card => {
        const endpoint = {
            method: card.querySelector('[data-field="method"]').value,
            path: card.querySelector('[data-field="path"]').value,
            description: card.querySelector('[data-field="description"]').value,
            params: []
        };

        card.querySelectorAll('.param-row').forEach(row => {
            endpoint.params.push({
                name: row.querySelector('[data-field="name"]').value,
                type: row.querySelector('[data-field="type"]').value,
                desc: row.querySelector('[data-field="desc"]').value
            });
        });

        if (endpoint.path) data.push(endpoint);
    });

    return data;
}

function generateMarkdown(apiName, baseUrl, endpoints) {
    let doc = `# ${apiName || 'API 文件'}\n\n`;
    doc += `**Base URL:** \`${baseUrl || 'https://api.example.com'}\`\n\n`;
    doc += `---\n\n`;

    endpoints.forEach((ep, i) => {
        doc += `## ${i + 1}. ${ep.method} ${ep.path}\n\n`;
        if (ep.description) doc += `${ep.description}\n\n`;

        doc += `**請求方式:** \`${ep.method}\`\n\n`;
        doc += `**端點:** \`${baseUrl}${ep.path}\`\n\n`;

        if (ep.params.length > 0) {
            doc += `### 參數\n\n`;
            doc += `| 名稱 | 類型 | 說明 |\n`;
            doc += `|------|------|------|\n`;
            ep.params.forEach(p => {
                doc += `| ${p.name} | ${p.type} | ${p.desc} |\n`;
            });
            doc += `\n`;
        }

        doc += `### 範例請求\n\n`;
        doc += `\`\`\`bash\ncurl -X ${ep.method} "${baseUrl}${ep.path}"\n\`\`\`\n\n`;
        doc += `---\n\n`;
    });

    return doc;
}

function generateHTML(apiName, baseUrl, endpoints) {
    let doc = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${apiName || 'API 文件'}</title>
    <style>
        body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
        h1 { color: #1e293b; }
        .endpoint { background: #f8fafc; border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        .method { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: bold; color: white; }
        .GET { background: #22c55e; }
        .POST { background: #3b82f6; }
        .PUT { background: #f59e0b; }
        .DELETE { background: #ef4444; }
        .path { font-family: monospace; margin-left: 0.5rem; }
        table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
        th, td { text-align: left; padding: 0.5rem; border-bottom: 1px solid #e2e8f0; }
        code { background: #e2e8f0; padding: 0.125rem 0.25rem; border-radius: 4px; }
    </style>
</head>
<body>
    <h1>${apiName || 'API 文件'}</h1>
    <p><strong>Base URL:</strong> <code>${baseUrl || 'https://api.example.com'}</code></p>
`;

    endpoints.forEach(ep => {
        doc += `
    <div class="endpoint">
        <span class="method ${ep.method}">${ep.method}</span>
        <span class="path">${ep.path}</span>
        ${ep.description ? `<p>${ep.description}</p>` : ''}
        ${ep.params.length > 0 ? `
        <h4>參數</h4>
        <table>
            <tr><th>名稱</th><th>類型</th><th>說明</th></tr>
            ${ep.params.map(p => `<tr><td>${p.name}</td><td>${p.type}</td><td>${p.desc}</td></tr>`).join('')}
        </table>` : ''}
    </div>`;
    });

    doc += `\n</body>\n</html>`;
    return doc;
}

function generateOpenAPI(apiName, baseUrl, endpoints) {
    const spec = {
        openapi: '3.0.0',
        info: {
            title: apiName || 'API',
            version: '1.0.0'
        },
        servers: [{ url: baseUrl || 'https://api.example.com' }],
        paths: {}
    };

    endpoints.forEach(ep => {
        if (!spec.paths[ep.path]) spec.paths[ep.path] = {};

        const operation = {
            summary: ep.description || '',
            responses: { '200': { description: 'Success' } }
        };

        if (ep.params.length > 0) {
            operation.parameters = ep.params.map(p => ({
                name: p.name,
                in: 'query',
                schema: { type: p.type },
                description: p.desc
            }));
        }

        spec.paths[ep.path][ep.method.toLowerCase()] = operation;
    });

    return JSON.stringify(spec, null, 2);
}

function generateDoc() {
    const apiName = document.getElementById('apiName').value;
    const baseUrl = document.getElementById('baseUrl').value;
    const endpointsData = collectEndpointData();

    let doc;
    switch (currentFormat) {
        case 'markdown':
            doc = generateMarkdown(apiName, baseUrl, endpointsData);
            break;
        case 'html':
            doc = generateHTML(apiName, baseUrl, endpointsData);
            break;
        case 'openapi':
            doc = generateOpenAPI(apiName, baseUrl, endpointsData);
            break;
    }

    document.getElementById('resultSection').style.display = 'block';
    document.getElementById('docOutput').textContent = doc;
}

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    // Add initial endpoint
    document.getElementById('endpointsList').appendChild(createEndpointCard());

    // Add endpoint button
    document.getElementById('addEndpointBtn').addEventListener('click', () => {
        document.getElementById('endpointsList').appendChild(createEndpointCard());
    });

    // Format buttons
    document.querySelectorAll('.format-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.format-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFormat = btn.dataset.format;
        });
    });

    // Generate button
    document.getElementById('generateBtn').addEventListener('click', generateDoc);

    // Copy button
    document.getElementById('copyBtn').addEventListener('click', () => {
        const doc = document.getElementById('docOutput').textContent;
        navigator.clipboard.writeText(doc).then(() => {
            document.getElementById('copyBtn').textContent = '已複製!';
            setTimeout(() => document.getElementById('copyBtn').textContent = '複製', 2000);
        });
    });
}
init();
