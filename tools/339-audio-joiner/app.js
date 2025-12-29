/**
 * Audio Joiner - Tool #339
 * Join multiple audio files into one
 */

let currentLang = 'zh';
let audioContext = null;
let audioFiles = [];
let processedBuffer = null;

const texts = {
    zh: {
        title: '音頻合併',
        subtitle: '將多個音頻檔案合併為一個',
        privacy: '100% 本地處理 · 零資料上傳',
        filesTitle: '已載入檔案',
        addMore: '➕ 添加更多',
        gap: '間隔',
        crossfade: '交叉淡化',
        seconds: '秒',
        process: '🔄 合併音頻',
        download: '⬇️ 下載',
        result: '合併結果',
        totalDuration: '總長度',
        filesCount: '個檔案',
        upload: '拖放多個音頻檔案至此或點擊上傳',
        uploadHint: '支援 MP3, WAV, OGG, M4A',
        processing: '處理中...'
    },
    en: {
        title: 'Audio Joiner',
        subtitle: 'Join multiple audio files into one',
        privacy: '100% Local Processing · No Data Upload',
        filesTitle: 'Loaded Files',
        addMore: '➕ Add More',
        gap: 'Gap',
        crossfade: 'Crossfade',
        seconds: 's',
        process: '🔄 Join Audio',
        download: '⬇️ Download',
        result: 'Result',
        totalDuration: 'Total Duration',
        filesCount: 'files',
        upload: 'Drop multiple audio files here or click to upload',
        uploadHint: 'Supports MP3, WAV, OGG, M4A',
        processing: 'Processing...'
    }
};

function init() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    setupFileUpload();
    setupControls();
    document.getElementById('addMoreBtn').addEventListener('click', () => document.getElementById('fileInput').click());
    document.getElementById('processBtn').addEventListener('click', processAudio);
    document.getElementById('downloadBtn').addEventListener('click', downloadAudio);
}

function setupFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('drag-over'); });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));
    uploadArea.addEventListener('drop', (e) => { e.preventDefault(); uploadArea.classList.remove('drag-over'); handleFiles(e.dataTransfer.files); });
    fileInput.addEventListener('change', (e) => { handleFiles(e.target.files); });
}

function setupControls() {
    document.getElementById('gap').addEventListener('input', (e) => {
        const unit = currentLang === 'zh' ? ' 秒' : ' s';
        document.getElementById('gapValue').textContent = parseFloat(e.target.value).toFixed(1) + unit;
    });
    document.getElementById('crossfade').addEventListener('input', (e) => {
        const unit = currentLang === 'zh' ? ' 秒' : ' s';
        document.getElementById('crossfadeValue').textContent = parseFloat(e.target.value).toFixed(1) + unit;
    });
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');
    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.getElementById('filesTitle').textContent = t.filesTitle;
    document.getElementById('addMoreBtn').textContent = t.addMore;
    document.getElementById('gapLabel').textContent = t.gap;
    document.getElementById('crossfadeLabel').textContent = t.crossfade;
    document.getElementById('processBtn').textContent = t.process;
    document.getElementById('downloadBtn').textContent = t.download;
    document.getElementById('resultTitle').textContent = t.result;
    document.querySelector('.upload-area p').textContent = t.upload;
    document.querySelector('.upload-hint').textContent = t.uploadHint;
    // Update slider values
    const unit = lang === 'zh' ? ' 秒' : ' s';
    document.getElementById('gapValue').textContent = parseFloat(document.getElementById('gap').value).toFixed(1) + unit;
    document.getElementById('crossfadeValue').textContent = parseFloat(document.getElementById('crossfade').value).toFixed(1) + unit;
}

function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

async function handleFiles(files) {
    for (const file of files) {
        if (!file.type.startsWith('audio/')) continue;
        try {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = await audioContext.decodeAudioData(arrayBuffer);
            audioFiles.push({
                name: file.name,
                buffer: buffer,
                duration: buffer.duration
            });
        } catch (e) {
            console.error('Error loading file:', file.name, e);
        }
    }
    updateFilesList();
}

function updateFilesList() {
    const filesList = document.getElementById('filesList');
    filesList.innerHTML = '';

    audioFiles.forEach((file, index) => {
        const item = document.createElement('div');
        item.className = 'file-item';
        item.draggable = true;
        item.dataset.index = index;
        item.innerHTML = `
            <span class="drag-handle">☰</span>
            <span class="file-name">${file.name}</span>
            <span class="file-duration">${formatDuration(file.duration)}</span>
            <button class="remove-btn" data-index="${index}">✕</button>
        `;
        filesList.appendChild(item);
    });

    // Setup drag and drop reordering
    setupDragReorder();

    // Setup remove buttons
    filesList.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(e.target.dataset.index);
            audioFiles.splice(index, 1);
            updateFilesList();
        });
    });

    // Show/hide sections
    if (audioFiles.length > 0) {
        document.getElementById('uploadArea').style.display = 'none';
        document.getElementById('filesLoaded').style.display = 'block';
        document.getElementById('optionsSection').style.display = 'block';
        document.getElementById('actionSection').style.display = 'flex';
    } else {
        document.getElementById('uploadArea').style.display = 'block';
        document.getElementById('filesLoaded').style.display = 'none';
        document.getElementById('optionsSection').style.display = 'none';
        document.getElementById('actionSection').style.display = 'none';
    }
}

function setupDragReorder() {
    const filesList = document.getElementById('filesList');
    let draggedItem = null;

    filesList.querySelectorAll('.file-item').forEach(item => {
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
                    item.parentNode.insertBefore(draggedItem, item);
                } else {
                    item.parentNode.insertBefore(draggedItem, item.nextSibling);
                }
            }
        });

        item.addEventListener('drop', (e) => {
            e.preventDefault();
            // Reorder audioFiles array based on new DOM order
            const newOrder = [];
            filesList.querySelectorAll('.file-item').forEach(el => {
                newOrder.push(audioFiles[parseInt(el.dataset.index)]);
            });
            audioFiles = newOrder;
            updateFilesList();
        });
    });
}

async function processAudio() {
    if (audioFiles.length < 2) return;
    const processBtn = document.getElementById('processBtn');
    const originalText = processBtn.textContent;
    processBtn.textContent = texts[currentLang].processing;
    processBtn.disabled = true;
    await new Promise(resolve => setTimeout(resolve, 10));

    const gap = parseFloat(document.getElementById('gap').value);
    const crossfade = parseFloat(document.getElementById('crossfade').value);

    // Use the sample rate of the first file
    const sampleRate = audioFiles[0].buffer.sampleRate;
    const gapSamples = Math.floor(gap * sampleRate);
    const crossfadeSamples = Math.floor(crossfade * sampleRate);

    // Determine max channels
    const maxChannels = Math.max(...audioFiles.map(f => f.buffer.numberOfChannels));

    // Calculate total length
    let totalLength = 0;
    audioFiles.forEach((file, index) => {
        totalLength += file.buffer.length;
        if (index < audioFiles.length - 1) {
            if (crossfade > 0) {
                totalLength -= crossfadeSamples;
            } else {
                totalLength += gapSamples;
            }
        }
    });

    processedBuffer = audioContext.createBuffer(maxChannels, totalLength, sampleRate);

    let writeOffset = 0;
    audioFiles.forEach((file, fileIndex) => {
        const buffer = file.buffer;

        for (let ch = 0; ch < maxChannels; ch++) {
            const outputData = processedBuffer.getChannelData(ch);
            // Use first channel if file has fewer channels
            const inputData = buffer.getChannelData(Math.min(ch, buffer.numberOfChannels - 1));

            // Resample if needed
            const ratio = buffer.sampleRate / sampleRate;

            for (let i = 0; i < buffer.length; i++) {
                const srcIndex = ratio !== 1 ? Math.floor(i * ratio) : i;
                const destIndex = writeOffset + i;

                if (destIndex >= 0 && destIndex < totalLength) {
                    let sample = inputData[Math.min(srcIndex, inputData.length - 1)];

                    // Apply crossfade
                    if (crossfade > 0 && fileIndex > 0 && i < crossfadeSamples) {
                        const fadeIn = i / crossfadeSamples;
                        sample *= fadeIn;
                        outputData[destIndex] += sample;
                    } else if (crossfade > 0 && fileIndex < audioFiles.length - 1 && i >= buffer.length - crossfadeSamples) {
                        const fadeOut = (buffer.length - i) / crossfadeSamples;
                        sample *= fadeOut;
                        outputData[destIndex] += sample;
                    } else {
                        outputData[destIndex] = sample;
                    }
                }
            }
        }

        writeOffset += buffer.length;
        if (fileIndex < audioFiles.length - 1) {
            if (crossfade > 0) {
                writeOffset -= crossfadeSamples;
            } else {
                writeOffset += gapSamples;
            }
        }
    });

    const t = texts[currentLang];
    document.getElementById('resultInfo').innerHTML =
        `<span>${audioFiles.length}</span> ${t.filesCount} | ${t.totalDuration}: <span>${formatDuration(processedBuffer.duration)}</span>`;

    const blob = bufferToWav(processedBuffer);
    document.getElementById('resultSection').style.display = 'block';
    document.getElementById('processedAudio').src = URL.createObjectURL(blob);
    document.getElementById('downloadBtn').disabled = false;
    processBtn.textContent = originalText;
    processBtn.disabled = false;
}

function downloadAudio() {
    if (!processedBuffer) return;
    const blob = bufferToWav(processedBuffer);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'joined-audio.wav';
    a.click();
}

function bufferToWav(buffer) {
    const numChannels = buffer.numberOfChannels, sampleRate = buffer.sampleRate;
    const bytesPerSample = 2, blockAlign = numChannels * bytesPerSample;
    const dataSize = buffer.length * blockAlign, bufferSize = 44 + dataSize;
    const arrayBuffer = new ArrayBuffer(bufferSize);
    const view = new DataView(arrayBuffer);
    const writeString = (o, s) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); };
    writeString(0, 'RIFF'); view.setUint32(4, bufferSize - 8, true); writeString(8, 'WAVE'); writeString(12, 'fmt ');
    view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true); view.setUint16(34, 16, true); writeString(36, 'data'); view.setUint32(40, dataSize, true);
    const channels = []; for (let i = 0; i < numChannels; i++) channels.push(buffer.getChannelData(i));
    let offset = 44;
    for (let i = 0; i < buffer.length; i++) { for (let ch = 0; ch < numChannels; ch++) { view.setInt16(offset, Math.max(-1, Math.min(1, channels[ch][i])) * 32767, true); offset += 2; } }
    return new Blob([arrayBuffer], { type: 'audio/wav' });
}

init();
