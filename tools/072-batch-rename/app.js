/**
 * Tool #072: Batch Rename
 */
document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const imageInput = document.getElementById('imageInput');
    const controls = document.getElementById('controls');
    const fileList = document.getElementById('fileList');
    const renameMode = document.getElementById('renameMode');
    const renameText = document.getElementById('renameText');
    const replaceWith = document.getElementById('replaceWith');
    const startNum = document.getElementById('startNum');
    const downloadBtn = document.getElementById('downloadBtn');

    let files = [];

    renameMode.addEventListener('change', () => {
        replaceWith.style.display = renameMode.value === 'replace' ? 'inline' : 'none';
        startNum.style.display = renameMode.value === 'sequence' ? 'inline' : 'none';
        updatePreview();
    });
    renameText.addEventListener('input', updatePreview);
    replaceWith.addEventListener('input', updatePreview);
    startNum.addEventListener('input', updatePreview);

    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => { e.preventDefault(); dropZone.classList.remove('dragover'); handleFiles(e.dataTransfer.files); });
    imageInput.addEventListener('change', (e) => handleFiles(e.target.files));
    downloadBtn.addEventListener('click', downloadAll);

    function handleFiles(fileList_) {
        files = Array.from(fileList_).filter(f => f.type.startsWith('image/'));
        controls.style.display = 'flex';
        updatePreview();
    }

    function getNewName(originalName, index) {
        const mode = renameMode.value;
        const text = renameText.value;
        const ext = originalName.substring(originalName.lastIndexOf('.'));
        const baseName = originalName.substring(0, originalName.lastIndexOf('.'));

        switch (mode) {
            case 'prefix': return text + baseName + ext;
            case 'suffix': return baseName + text + ext;
            case 'replace': return baseName.replace(new RegExp(text, 'g'), replaceWith.value) + ext;
            case 'sequence': return text + String(parseInt(startNum.value) + index).padStart(3, '0') + ext;
            default: return originalName;
        }
    }

    function updatePreview() {
        fileList.innerHTML = '';
        files.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const newName = getNewName(file.name, index);
                const div = document.createElement('div');
                div.className = 'file-item';
                div.innerHTML = `
                    <img src="${e.target.result}" alt="${file.name}">
                    <div class="original">${file.name}</div>
                    <div class="arrow">→</div>
                    <div class="new">${newName}</div>
                `;
                fileList.appendChild(div);
            };
            reader.readAsDataURL(file);
        });
    }

    async function downloadAll() {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const newName = getNewName(file.name, i);
            const url = URL.createObjectURL(file);
            const link = document.createElement('a');
            link.download = newName;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
            await new Promise(r => setTimeout(r, 200));
        }
    }
});
