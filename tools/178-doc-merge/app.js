/**
 * Doc Merge - Tool #178
 */
let files = [];
let mergedContent = '';

function init() {
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');

    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    uploadZone.addEventListener('click', () => fileInput.click());
    uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); uploadZone.classList.add('dragover'); });
    uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });
    fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

    document.getElementById('mergeBtn').addEventListener('click', mergeFiles);
    document.getElementById('copyBtn').addEventListener('click', copyResult);
    document.getElementById('downloadBtn').addEventListener('click', downloadResult);
}

function handleFiles(fileList) {
    Array.from(fileList).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            files.push({
                name: file.name,
                size: file.size,
                content: e.target.result
            });
            renderFileList();
        };
        reader.readAsText(file);
    });
}

function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function renderFileList() {
    const container = document.getElementById('fileList');
    document.getElementById('filesSection').style.display = 'block';
    document.getElementById('fileCount').textContent = `${files.length} 個檔案`;

    container.innerHTML = files.map((f, i) => `
        <div class="file-item" draggable="true" data-index="${i}">
            <span class="drag-handle">⋮⋮</span>
            <span class="file-name">${escapeHtml(f.name)}</span>
            <span class="file-size">${formatSize(f.size)}</span>
            <button class="remove-btn" data-index="${i}">×</button>
        </div>
    `).join('');

    // Remove buttons
    container.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            files.splice(parseInt(btn.dataset.index), 1);
            renderFileList();
            if (files.length === 0) {
                document.getElementById('filesSection').style.display = 'none';
            }
        });
    });

    // Drag and drop reordering
    let dragItem = null;
    container.querySelectorAll('.file-item').forEach(item => {
        item.addEventListener('dragstart', (e) => {
            dragItem = item;
            item.classList.add('dragging');
        });
        item.addEventListener('dragend', () => {
            dragItem.classList.remove('dragging');
            dragItem = null;
        });
        item.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (dragItem && dragItem !== item) {
                const rect = item.getBoundingClientRect();
                const midY = rect.top + rect.height / 2;
                if (e.clientY < midY) {
                    container.insertBefore(dragItem, item);
                } else {
                    container.insertBefore(dragItem, item.nextSibling);
                }
                // Update files array
                const newOrder = Array.from(container.querySelectorAll('.file-item')).map(el => parseInt(el.dataset.index));
                files = newOrder.map(i => files.find((f, fi) => fi === i) || files[i]);
                // Update data-index
                container.querySelectorAll('.file-item').forEach((el, i) => {
                    el.dataset.index = i;
                    el.querySelector('.remove-btn').dataset.index = i;
                });
            }
        });
    });
}

function mergeFiles() {
    const addSeparator = document.getElementById('addSeparator').checked;
    const addFilename = document.getElementById('addFilename').checked;

    const parts = files.map(f => {
        let content = '';
        if (addFilename) {
            content += `=== ${f.name} ===\n\n`;
        }
        content += f.content;
        return content;
    });

    const separator = addSeparator ? '\n\n---\n\n' : '\n\n';
    mergedContent = parts.join(separator);

    document.getElementById('preview').textContent = mergedContent;
    document.getElementById('resultSection').style.display = 'block';
}

function copyResult() {
    navigator.clipboard.writeText(mergedContent).then(() => {
        const btn = document.getElementById('copyBtn');
        btn.textContent = '已複製!';
        setTimeout(() => btn.textContent = '複製', 2000);
    });
}

function downloadResult() {
    const blob = new Blob([mergedContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'merged.txt';
    a.click();
    URL.revokeObjectURL(url);
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

init();
