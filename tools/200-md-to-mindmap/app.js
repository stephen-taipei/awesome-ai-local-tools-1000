/**
 * MD to Mindmap - Tool #200
 */

const canvas = document.getElementById('mindmapCanvas');
const ctx = canvas.getContext('2d');
let scale = 1;
let mindmapData = null;

const colors = ['#a855f7', '#ec4899', '#f59e0b', '#22c55e', '#0ea5e9', '#6366f1'];

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    document.getElementById('loadSampleBtn').addEventListener('click', loadSample);
    document.getElementById('generateBtn').addEventListener('click', generate);
    document.getElementById('zoomInBtn').addEventListener('click', () => zoom(1.2));
    document.getElementById('zoomOutBtn').addEventListener('click', () => zoom(0.8));
    document.getElementById('downloadBtn').addEventListener('click', download);
}

function loadSample() {
    document.getElementById('inputText').value = `# 人工智慧

## 機器學習
### 監督式學習
### 非監督式學習
### 強化學習

## 深度學習
### 卷積神經網路 (CNN)
### 循環神經網路 (RNN)
### 變形金剛 (Transformer)

## 應用領域
### 自然語言處理
### 電腦視覺
### 語音識別

## 未來發展
### AGI 通用人工智慧
### 倫理與法規`;
}

function generate() {
    const text = document.getElementById('inputText').value.trim();
    if (!text) return;

    // Parse markdown headings
    mindmapData = parseMarkdown(text);

    // Calculate layout
    layoutMindmap(mindmapData);

    // Render
    render();

    document.getElementById('resultsSection').style.display = 'block';
}

function parseMarkdown(text) {
    const lines = text.split('\n');
    const root = { title: '', level: 0, children: [], x: 0, y: 0 };
    const stack = [root];

    lines.forEach(line => {
        const match = line.match(/^(#{1,6})\s+(.+)/);
        if (match) {
            const level = match[1].length;
            const title = match[2].trim();

            const node = { title, level, children: [], x: 0, y: 0 };

            // Find parent
            while (stack.length > level) {
                stack.pop();
            }

            const parent = stack[stack.length - 1];
            parent.children.push(node);
            stack.push(node);
        }
    });

    return root.children.length === 1 ? root.children[0] : { title: 'Mind Map', level: 0, children: root.children };
}

function layoutMindmap(node) {
    // Calculate dimensions
    const nodeWidth = 150;
    const nodeHeight = 40;
    const horizontalGap = 80;
    const verticalGap = 20;

    // Count leaves for each subtree
    function countLeaves(n) {
        if (n.children.length === 0) return 1;
        return n.children.reduce((sum, child) => sum + countLeaves(child), 0);
    }

    // Layout recursively
    function layout(n, x, y, level) {
        n.x = x;
        n.y = y;
        n.width = nodeWidth;
        n.height = nodeHeight;
        n.color = colors[level % colors.length];

        if (n.children.length === 0) {
            n.subtreeHeight = nodeHeight;
            return;
        }

        // Layout children
        let childY = y;
        n.children.forEach(child => {
            const leaves = countLeaves(child);
            const childHeight = leaves * (nodeHeight + verticalGap) - verticalGap;

            layout(child, x + nodeWidth + horizontalGap, childY + childHeight / 2 - nodeHeight / 2, level + 1);

            child.subtreeHeight = childHeight;
            childY += childHeight + verticalGap;
        });

        n.subtreeHeight = childY - y - verticalGap;
    }

    const totalLeaves = countLeaves(node);
    const totalHeight = totalLeaves * (nodeHeight + verticalGap) - verticalGap;

    layout(node, 50, 50, 0);

    // Calculate canvas size
    function getMaxX(n) {
        if (n.children.length === 0) return n.x + n.width;
        return Math.max(n.x + n.width, ...n.children.map(getMaxX));
    }

    function getMaxY(n) {
        if (n.children.length === 0) return n.y + n.height;
        return Math.max(n.y + n.height, ...n.children.map(getMaxY));
    }

    const maxX = getMaxX(node);
    const maxY = getMaxY(node);

    canvas.width = (maxX + 100) * scale;
    canvas.height = (maxY + 100) * scale;
}

function render() {
    if (!mindmapData) return;

    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.clearRect(0, 0, canvas.width / scale, canvas.height / scale);

    // Draw connections first
    function drawConnections(node) {
        node.children.forEach(child => {
            ctx.beginPath();
            ctx.moveTo(node.x + node.width, node.y + node.height / 2);

            // Curved line
            const midX = (node.x + node.width + child.x) / 2;
            ctx.bezierCurveTo(
                midX, node.y + node.height / 2,
                midX, child.y + child.height / 2,
                child.x, child.y + child.height / 2
            );

            ctx.strokeStyle = child.color + '80';
            ctx.lineWidth = 2;
            ctx.stroke();

            drawConnections(child);
        });
    }

    // Draw nodes
    function drawNodes(node) {
        // Node background
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.roundRect(node.x, node.y, node.width, node.height, 8);
        ctx.fill();

        // Node text
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Truncate text if too long
        let text = node.title;
        while (ctx.measureText(text).width > node.width - 16 && text.length > 3) {
            text = text.slice(0, -1);
        }
        if (text !== node.title) text += '…';

        ctx.fillText(text, node.x + node.width / 2, node.y + node.height / 2);

        node.children.forEach(drawNodes);
    }

    drawConnections(mindmapData);
    drawNodes(mindmapData);
}

function zoom(factor) {
    scale *= factor;
    scale = Math.max(0.5, Math.min(2, scale));

    if (mindmapData) {
        layoutMindmap(mindmapData);
        render();
    }
}

function download() {
    const link = document.createElement('a');
    link.download = 'mindmap.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

init();
