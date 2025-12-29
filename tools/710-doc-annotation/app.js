/**
 * Document Annotation - Tool #710
 */

document.addEventListener('DOMContentLoaded', () => {
    const langBtns = document.querySelectorAll('.lang-btn');
    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            langBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const lang = btn.dataset.lang;
            document.querySelectorAll('.en').forEach(el => el.style.display = lang === 'en' ? '' : 'none');
            document.querySelectorAll('.zh').forEach(el => el.style.display = lang === 'zh' ? '' : 'none');
        });
    });

    const editor = document.getElementById('editor');
    const annotationsList = document.getElementById('annotationsList');
    const toolBtns = document.querySelectorAll('.tool-btn');
    const exportBtn = document.getElementById('exportBtn');
    const clearAllBtn = document.getElementById('clearAllBtn');

    let annotations = [];

    toolBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            const selection = window.getSelection();

            if (!selection.rangeCount || selection.isCollapsed) {
                if (action !== 'clear') alert('Please select some text first');
                return;
            }

            const range = selection.getRangeAt(0);
            const selectedText = range.toString();

            if (action === 'clear') {
                const parent = range.commonAncestorContainer.parentElement;
                if (parent.classList.contains('highlight-yellow') ||
                    parent.classList.contains('highlight-green') ||
                    parent.classList.contains('highlight-pink') ||
                    parent.classList.contains('highlight-blue') ||
                    parent.classList.contains('comment')) {
                    const text = document.createTextNode(parent.textContent);
                    parent.parentNode.replaceChild(text, parent);
                    updateAnnotationsList();
                }
                return;
            }

            if (action === 'comment') {
                const comment = prompt('Enter your comment:');
                if (!comment) return;

                const span = document.createElement('span');
                span.className = 'comment';
                span.title = comment;
                span.dataset.comment = comment;
                range.surroundContents(span);

                annotations.push({ text: selectedText, comment, type: 'comment' });
                updateAnnotationsList();
            } else {
                const span = document.createElement('span');
                span.className = action;
                range.surroundContents(span);

                annotations.push({ text: selectedText, type: action });
                updateAnnotationsList();
            }

            selection.removeAllRanges();
        });
    });

    function updateAnnotationsList() {
        const comments = editor.querySelectorAll('.comment');
        annotationsList.innerHTML = '';

        comments.forEach((el, index) => {
            const item = document.createElement('div');
            item.className = 'annotation-item';
            item.innerHTML = `
                <span class="annotation-delete" data-index="${index}">✕</span>
                <div class="annotation-text">"${el.textContent}"</div>
                <div class="annotation-comment">💬 ${el.dataset.comment}</div>
            `;
            annotationsList.appendChild(item);
        });

        document.querySelectorAll('.annotation-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                const comments = editor.querySelectorAll('.comment');
                if (comments[index]) {
                    const text = document.createTextNode(comments[index].textContent);
                    comments[index].parentNode.replaceChild(text, comments[index]);
                    updateAnnotationsList();
                }
            });
        });
    }

    exportBtn.addEventListener('click', () => {
        const content = editor.innerHTML;
        const blob = new Blob([`<!DOCTYPE html><html><head><style>
            .highlight-yellow { background: #fff59d; }
            .highlight-green { background: #a5d6a7; }
            .highlight-pink { background: #f8bbd9; }
            .highlight-blue { background: #90caf9; }
            .comment { background: #ffe082; border-bottom: 2px dashed #ff9800; }
        </style></head><body>${content}</body></html>`], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'annotated-document.html';
        a.click();
        URL.revokeObjectURL(url);
    });

    clearAllBtn.addEventListener('click', () => {
        if (confirm('Clear all annotations?')) {
            editor.innerHTML = editor.textContent;
            annotations = [];
            updateAnnotationsList();
        }
    });
});
