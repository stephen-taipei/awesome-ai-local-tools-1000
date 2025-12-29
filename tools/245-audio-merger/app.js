/**
 * Audio Merger - Tool #245
 * Merge multiple audio files
 */

let currentLang = 'zh';
let audioContext = null;
let audioFiles = [];

const texts = {
    zh: {
        title: '音訊合併',
        subtitle: '將多個音訊檔案合併為一個',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '點擊或拖放多個音訊檔案',
        uploadHint: '支援 MP3, WAV, OGG 等格式',
        fileList: '音訊列表',
        fileCount: '{n} 個檔案',
        addMore: '+ 新增更多檔案',
        mergeMode: '合併模式',
        sequence: '順序連接',
        crossfade: '淡入淡出',
        crossfadeDuration: '淡入淡出時長',
        seconds: '秒',
        totalDuration: '總時長',
        merge: '🔗 合併並下載',
        processing: '處理中...',
        complete: '完成！',
        remove: '移除'
    },
    en: {
        title: 'Audio Merger',
        subtitle: 'Merge multiple audio files into one',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Click or drop multiple audio files',
        uploadHint: 'Supports MP3, WAV, OGG formats',
        fileList: 'Audio List',
        fileCount: '{n} files',
        addMore: '+ Add More Files',
        mergeMode: 'Merge Mode',
        sequence: 'Sequential',
        crossfade: 'Crossfade',
        crossfadeDuration: 'Crossfade Duration',
        seconds: 'sec',
        totalDuration: 'Total Duration',
        merge: '🔗 Merge & Download',
        processing: 'Processing...',
        complete: 'Complete!',
        remove: 'Remove'
    }
};

function init() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));

    const uploadArea = document.getElementById('uploadArea');
    const audioInput = document.getElementById('audioInput');

    uploadArea.addEventListener('click', () => audioInput.click());
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
    });
    audioInput.addEventListener('change', (e) => {
        if (e.target.files.length) handleFiles(e.target.files);
    });

    document.getElementById('addMoreBtn').addEventListener('click', () => audioInput.click());

    document.getElementById('mergeMode').addEventListener('change', (e) => {
        document.getElementById('crossfadeOption').style.display =
            e.target.value === 'crossfade' ? 'flex' : 'none';
        updateTotalDuration();
    });

    document.getElementById('crossfadeSlider').addEventListener('input', (e) => {
        document.getElementById('crossfadeValue').textContent = e.target.value + ' ' + texts[currentLang].seconds;
        updateTotalDuration();
    });

    document.getElementById('mergeBtn').addEventListener('click', mergeAndDownload);
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');

    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;

    document.querySelector('.upload-text').textContent = t.upload;
    document.querySelector('.upload-hint').textContent = t.uploadHint;

    document.querySelector('.files-header h3').textContent = t.fileList;
    updateFileCount();

    document.getElementById('addMoreBtn').textContent = t.addMore;

    document.querySelector('.option-group label').textContent = t.mergeMode;
    document.getElementById('mergeMode').options[0].text = t.sequence;
    document.getElementById('mergeMode').options[1].text = t.crossfade;

    document.querySelectorAll('.option-group label')[1].textContent = t.crossfadeDuration;
    document.getElementById('crossfadeValue').textContent =
        document.getElementById('crossfadeSlider').value + ' ' + t.seconds;

    document.querySelector('.info-label').textContent = t.totalDuration;
    document.getElementById('mergeBtn').textContent = t.merge;

    renderFilesList();
}

async function handleFiles(files) {
    for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));

        audioFiles.push({
            name: file.name,
            buffer: buffer,
            duration: buffer.duration
        });
    }

    renderFilesList();
    updateFileCount();
    updateTotalDuration();

    document.getElementById('filesSection').style.display = 'block';
    document.getElementById('optionsSection').style.display = 'block';
}

function renderFilesList() {
    const list = document.getElementById('filesList');
    const t = texts[currentLang];

    list.innerHTML = audioFiles.map((file, index) => `
        <div class="file-item" data-index="${index}">
            <div class="file-handle">☰</div>
            <div class="file-info">
                <span class="file-name">${file.name}</span>
                <span class="file-duration">${formatTime(file.duration)}</span>
            </div>
            <button class="remove-btn" data-index="${index}">${t.remove}</button>
        </div>
    `).join('');

    list.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            audioFiles.splice(index, 1);
            renderFilesList();
            updateFileCount();
            updateTotalDuration();

            if (audioFiles.length === 0) {
                document.getElementById('filesSection').style.display = 'none';
                document.getElementById('optionsSection').style.display = 'none';
            }
        });
    });

    // Make draggable for reordering
    makeSortable(list);
}

function makeSortable(container) {
    let draggedItem = null;

    container.querySelectorAll('.file-item').forEach(item => {
        item.draggable = true;

        item.addEventListener('dragstart', (e) => {
            draggedItem = item;
            item.classList.add('dragging');
        });

        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
            draggedItem = null;
        });

        item.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (draggedItem && draggedItem !== item) {
                const rect = item.getBoundingClientRect();
                const midY = rect.top + rect.height / 2;

                if (e.clientY < midY) {
                    container.insertBefore(draggedItem, item);
                } else {
                    container.insertBefore(draggedItem, item.nextSibling);
                }

                // Update array order
                const newOrder = [];
                container.querySelectorAll('.file-item').forEach(el => {
                    const idx = parseInt(el.dataset.index);
                    newOrder.push(audioFiles[idx]);
                });
                audioFiles = newOrder;

                // Re-render to update indices
                renderFilesList();
            }
        });
    });
}

function updateFileCount() {
    const t = texts[currentLang];
    document.getElementById('fileCount').textContent =
        t.fileCount.replace('{n}', audioFiles.length);
}

function updateTotalDuration() {
    if (audioFiles.length === 0) {
        document.getElementById('totalDuration').textContent = '0:00';
        return;
    }

    let total = audioFiles.reduce((sum, f) => sum + f.duration, 0);

    const mode = document.getElementById('mergeMode').value;
    if (mode === 'crossfade' && audioFiles.length > 1) {
        const crossfade = parseFloat(document.getElementById('crossfadeSlider').value);
        total -= crossfade * (audioFiles.length - 1);
    }

    document.getElementById('totalDuration').textContent = formatTime(Math.max(0, total));
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

async function mergeAndDownload() {
    if (audioFiles.length === 0) return;

    const progressSection = document.getElementById('progressSection');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    progressSection.style.display = 'block';
    progressFill.style.width = '0%';
    progressText.textContent = texts[currentLang].processing;

    const mode = document.getElementById('mergeMode').value;
    const crossfade = mode === 'crossfade' ?
        parseFloat(document.getElementById('crossfadeSlider').value) : 0;

    // Calculate total length
    let totalLength = 0;
    const sampleRate = audioFiles[0].buffer.sampleRate;
    const numChannels = Math.max(...audioFiles.map(f => f.buffer.numberOfChannels));

    if (mode === 'sequence') {
        totalLength = audioFiles.reduce((sum, f) => sum + f.buffer.length, 0);
    } else {
        totalLength = audioFiles.reduce((sum, f) => sum + f.buffer.length, 0);
        totalLength -= Math.floor(crossfade * sampleRate) * (audioFiles.length - 1);
    }

    const mergedBuffer = audioContext.createBuffer(numChannels, totalLength, sampleRate);

    progressFill.style.width = '20%';

    let offset = 0;
    for (let i = 0; i < audioFiles.length; i++) {
        const buffer = audioFiles[i].buffer;

        for (let channel = 0; channel < numChannels; channel++) {
            const outputData = mergedBuffer.getChannelData(channel);
            const inputData = buffer.numberOfChannels > channel ?
                buffer.getChannelData(channel) :
                buffer.getChannelData(0);

            for (let j = 0; j < buffer.length; j++) {
                const outputIndex = offset + j;
                if (outputIndex >= 0 && outputIndex < totalLength) {
                    let sample = inputData[j];

                    // Apply crossfade
                    if (mode === 'crossfade') {
                        const crossfadeSamples = Math.floor(crossfade * sampleRate);

                        // Fade out at end
                        if (i < audioFiles.length - 1 && j >= buffer.length - crossfadeSamples) {
                            const fadePos = (buffer.length - j) / crossfadeSamples;
                            sample *= fadePos;
                        }

                        // Fade in at start
                        if (i > 0 && j < crossfadeSamples) {
                            const fadePos = j / crossfadeSamples;
                            sample *= fadePos;
                        }
                    }

                    outputData[outputIndex] += sample;
                }
            }
        }

        if (mode === 'sequence') {
            offset += buffer.length;
        } else {
            offset += buffer.length - Math.floor(crossfade * sampleRate);
        }

        progressFill.style.width = (20 + 60 * (i + 1) / audioFiles.length) + '%';
    }

    progressFill.style.width = '90%';

    const wavBlob = bufferToWav(mergedBuffer);

    progressFill.style.width = '100%';
    progressText.textContent = texts[currentLang].complete;

    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'merged-audio.wav';
    a.click();
    URL.revokeObjectURL(url);

    setTimeout(() => {
        progressSection.style.display = 'none';
    }, 2000);
}

function bufferToWav(buffer) {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1;
    const bitDepth = 16;

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;

    const samples = buffer.length;
    const dataSize = samples * blockAlign;
    const bufferSize = 44 + dataSize;

    const arrayBuffer = new ArrayBuffer(bufferSize);
    const view = new DataView(arrayBuffer);

    const writeString = (offset, string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, bufferSize - 8, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    const channels = [];
    for (let i = 0; i < numChannels; i++) {
        channels.push(buffer.getChannelData(i));
    }

    let offset = 44;
    for (let i = 0; i < samples; i++) {
        for (let ch = 0; ch < numChannels; ch++) {
            const sample = Math.max(-1, Math.min(1, channels[ch][i]));
            view.setInt16(offset, sample * 32767, true);
            offset += 2;
        }
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
}

init();
