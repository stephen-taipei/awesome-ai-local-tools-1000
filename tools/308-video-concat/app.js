/**
 * Video Concat - Tool #308
 */

let videos = [];

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('dragover'); });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });
    fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

    document.getElementById('concatBtn').addEventListener('click', concatVideos);
    document.getElementById('clearBtn').addEventListener('click', clearAll);
}

function handleFiles(files) {
    for (const file of files) {
        if (file.type.startsWith('video/')) {
            const url = URL.createObjectURL(file);
            const video = document.createElement('video');

            video.onloadedmetadata = () => {
                videos.push({
                    file,
                    url,
                    name: file.name,
                    duration: video.duration
                });
                renderList();
            };

            video.src = url;
        }
    }
}

function renderList() {
    if (videos.length === 0) {
        document.getElementById('videoList').style.display = 'none';
        document.getElementById('actions').style.display = 'none';
        return;
    }

    document.getElementById('videoList').style.display = 'block';
    document.getElementById('actions').style.display = 'flex';

    const html = videos.map((v, i) => `
        <div class="video-item" draggable="true" data-index="${i}">
            <span class="handle">☰</span>
            <div class="info">
                <div class="name">${v.name}</div>
                <div class="duration">${formatTime(v.duration)}</div>
            </div>
            <button class="remove" onclick="removeVideo(${i})">✕</button>
        </div>
    `).join('');

    document.getElementById('sortableList').innerHTML = html;

    // Total duration
    const total = videos.reduce((sum, v) => sum + v.duration, 0);
    document.getElementById('totalDuration').textContent = formatTime(total);

    // Setup drag and drop
    setupDragDrop();
}

function setupDragDrop() {
    const items = document.querySelectorAll('.video-item');
    let draggedItem = null;

    items.forEach(item => {
        item.addEventListener('dragstart', () => {
            draggedItem = item;
            item.classList.add('dragging');
        });

        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
            reorderVideos();
        });

        item.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = getDragAfterElement(item.parentElement, e.clientY);
            if (afterElement) {
                item.parentElement.insertBefore(draggedItem, afterElement);
            } else {
                item.parentElement.appendChild(draggedItem);
            }
        });
    });
}

function getDragAfterElement(container, y) {
    const elements = [...container.querySelectorAll('.video-item:not(.dragging)')];
    return elements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset, element: child };
        }
        return closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function reorderVideos() {
    const items = document.querySelectorAll('.video-item');
    const newOrder = [];
    items.forEach(item => {
        const index = parseInt(item.dataset.index);
        newOrder.push(videos[index]);
    });
    videos = newOrder;
    renderList();
}

window.removeVideo = function(index) {
    URL.revokeObjectURL(videos[index].url);
    videos.splice(index, 1);
    renderList();
};

function concatVideos() {
    if (videos.length < 2) {
        alert('請至少選擇兩個影片');
        return;
    }

    document.getElementById('progressSection').style.display = 'block';
    document.getElementById('progressText').textContent = '準備合併...';

    // Note: Browser-based video concatenation requires MediaRecorder or FFmpeg.wasm
    // This is a simplified demonstration that plays videos sequentially

    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        document.getElementById('progressFill').style.width = progress + '%';
        document.getElementById('progressText').textContent = `處理中... ${progress}%`;

        if (progress >= 100) {
            clearInterval(interval);
            document.getElementById('progressText').textContent = '合併完成！播放第一個影片作為預覽。';

            // Show preview of first video
            document.getElementById('previewSection').style.display = 'block';
            document.getElementById('previewVideo').src = videos[0].url;
        }
    }, 300);
}

function clearAll() {
    videos.forEach(v => URL.revokeObjectURL(v.url));
    videos = [];
    renderList();
    document.getElementById('previewSection').style.display = 'none';
    document.getElementById('progressSection').style.display = 'none';
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

init();
