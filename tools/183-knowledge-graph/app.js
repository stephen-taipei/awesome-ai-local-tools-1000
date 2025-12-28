/**
 * Knowledge Graph - Tool #183
 */
let canvas, ctx;
let nodes = [], edges = [];
let scale = 1, offsetX = 0, offsetY = 0;
let dragging = null, dragStart = { x: 0, y: 0 };

const colors = {
    person: '#f472b6',
    org: '#60a5fa',
    concept: '#a78bfa',
    location: '#34d399'
};

function init() {
    canvas = document.getElementById('graphCanvas');
    ctx = canvas.getContext('2d');

    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    document.getElementById('loadSampleBtn').addEventListener('click', loadSample);
    document.getElementById('analyzeBtn').addEventListener('click', analyze);
    document.getElementById('zoomIn').addEventListener('click', () => { scale *= 1.2; draw(); });
    document.getElementById('zoomOut').addEventListener('click', () => { scale *= 0.8; draw(); });
    document.getElementById('resetBtn').addEventListener('click', resetView);

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
}

function loadSample() {
    document.getElementById('textInput').value = `人工智慧是由約翰·麥卡錫在1956年提出的概念。Google 和 Microsoft 是人工智慧領域的領導者。

深度學習是機器學習的一個分支，由 Geoffrey Hinton 推動發展。OpenAI 開發了 ChatGPT，這是一種大型語言模型。

台北是台灣的首都，擁有許多科技公司。矽谷位於美國加州，是全球科技創新中心。

Elon Musk 創辦了 Tesla 和 SpaceX，並收購了 Twitter。Meta 的創辦人是 Mark Zuckerberg。`;
}

function analyze() {
    const text = document.getElementById('textInput').value.trim();
    if (!text) return;

    const entities = extractEntities(text);
    const relations = extractRelations(text, entities);

    createGraph(entities, relations);
    displayEntities(entities);

    document.getElementById('graphSection').style.display = 'block';
    document.getElementById('entitiesSection').style.display = 'block';
}

function extractEntities(text) {
    const entities = [];
    const patterns = {
        person: /(?:約翰·麥卡錫|Geoffrey Hinton|Elon Musk|Mark Zuckerberg|[A-Z][a-z]+ [A-Z][a-z]+)/g,
        org: /(?:Google|Microsoft|OpenAI|Tesla|SpaceX|Twitter|Meta|Facebook|Apple|Amazon|[A-Z][A-Z]+)/g,
        location: /(?:台北|台灣|矽谷|美國|加州|中國|日本|[A-Z][a-z]+(?:市|省|國))/g,
        concept: /(?:人工智慧|機器學習|深度學習|大型語言模型|ChatGPT|AI|ML|NLP)/g
    };

    for (const [type, pattern] of Object.entries(patterns)) {
        const matches = text.match(pattern) || [];
        matches.forEach(match => {
            if (!entities.find(e => e.name === match)) {
                entities.push({ name: match, type });
            }
        });
    }

    return entities;
}

function extractRelations(text, entities) {
    const relations = [];
    const sentences = text.split(/[。！？\n]+/);

    sentences.forEach(sentence => {
        const found = entities.filter(e => sentence.includes(e.name));
        for (let i = 0; i < found.length; i++) {
            for (let j = i + 1; j < found.length; j++) {
                relations.push({ source: found[i].name, target: found[j].name });
            }
        }
    });

    return relations;
}

function createGraph(entities, relations) {
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    // Create nodes with force-directed positions
    nodes = entities.map((e, i) => ({
        ...e,
        x: width / 2 + (Math.random() - 0.5) * 300,
        y: height / 2 + (Math.random() - 0.5) * 200,
        vx: 0, vy: 0
    }));

    edges = relations.map(r => ({
        source: nodes.find(n => n.name === r.source),
        target: nodes.find(n => n.name === r.target)
    })).filter(e => e.source && e.target);

    // Simple force simulation
    for (let i = 0; i < 100; i++) {
        simulate();
    }

    draw();
}

function simulate() {
    const k = 100; // Spring constant
    const repulsion = 5000;

    // Repulsion between nodes
    nodes.forEach(n1 => {
        nodes.forEach(n2 => {
            if (n1 === n2) return;
            const dx = n1.x - n2.x;
            const dy = n1.y - n2.y;
            const d = Math.sqrt(dx * dx + dy * dy) || 1;
            const f = repulsion / (d * d);
            n1.vx += (dx / d) * f * 0.1;
            n1.vy += (dy / d) * f * 0.1;
        });
    });

    // Attraction along edges
    edges.forEach(e => {
        const dx = e.target.x - e.source.x;
        const dy = e.target.y - e.source.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        const f = (d - k) * 0.01;
        e.source.vx += (dx / d) * f;
        e.source.vy += (dy / d) * f;
        e.target.vx -= (dx / d) * f;
        e.target.vy -= (dy / d) * f;
    });

    // Apply velocities with damping
    nodes.forEach(n => {
        n.x += n.vx * 0.5;
        n.y += n.vy * 0.5;
        n.vx *= 0.8;
        n.vy *= 0.8;
    });
}

function draw() {
    const width = canvas.width / 2;
    const height = canvas.height / 2;

    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    // Draw edges
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    edges.forEach(e => {
        ctx.beginPath();
        ctx.moveTo(e.source.x, e.source.y);
        ctx.lineTo(e.target.x, e.target.y);
        ctx.stroke();
    });

    // Draw nodes
    nodes.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 20, 0, Math.PI * 2);
        ctx.fillStyle = colors[n.type] || '#888';
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const label = n.name.length > 8 ? n.name.slice(0, 8) + '...' : n.name;
        ctx.fillText(label, n.x, n.y);
    });

    ctx.restore();
}

function resetView() {
    scale = 1;
    offsetX = 0;
    offsetY = 0;
    draw();
}

function onMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - offsetX) / scale;
    const y = (e.clientY - rect.top - offsetY) / scale;

    dragging = nodes.find(n => Math.hypot(n.x - x, n.y - y) < 20);
    if (dragging) {
        dragStart = { x, y };
    }
}

function onMouseMove(e) {
    if (!dragging) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - offsetX) / scale;
    const y = (e.clientY - rect.top - offsetY) / scale;

    dragging.x += x - dragStart.x;
    dragging.y += y - dragStart.y;
    dragStart = { x, y };
    draw();
}

function onMouseUp() {
    dragging = null;
}

function displayEntities(entities) {
    document.getElementById('entitiesList').innerHTML = entities.map(e =>
        `<span class="entity-tag ${e.type}">${e.name}</span>`
    ).join('');
}

init();
