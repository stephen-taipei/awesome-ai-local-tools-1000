/**
 * Batch Translation - Tool #127
 * Translate multiple documents at once
 */

let currentLang = 'zh-TW';
let files = [];

const i18n = {
    'zh-TW': {
        title: '文件批次翻譯',
        subtitle: '一次翻譯多個文件',
        sourceLang: '來源語言',
        targetLang: '目標語言',
        dropHere: '拖放文件到這裡',
        orClick: '或點擊選擇文件',
        supported: '支援 TXT, MD 文件',
        pending: '待翻譯文件',
        clearAll: '清除全部',
        translateAll: '批次翻譯',
        results: '翻譯結果',
        downloadAll: '下載全部',
        download: '下載'
    },
    'en': {
        title: 'Batch Translation',
        subtitle: 'Translate multiple files at once',
        sourceLang: 'Source',
        targetLang: 'Target',
        dropHere: 'Drop files here',
        orClick: 'or click to select',
        supported: 'Supports TXT, MD files',
        pending: 'Files to translate',
        clearAll: 'Clear all',
        translateAll: 'Translate All',
        results: 'Results',
        downloadAll: 'Download All',
        download: 'Download'
    }
};

// Simple translation dictionary
const translations = {
    zh: {
        en: {
            '你好': 'Hello', '謝謝': 'Thank you', '再見': 'Goodbye',
            '早安': 'Good morning', '晚安': 'Good night',
            '我': 'I', '你': 'You', '是': 'Yes', '不是': 'No'
        }
    },
    en: {
        zh: {
            'hello': '你好', 'thank you': '謝謝', 'goodbye': '再見',
            'good morning': '早安', 'good night': '晚安',
            'i': '我', 'you': '你', 'yes': '是', 'no': '不是'
        }
    }
};

function t(key) {
    return i18n[currentLang][key] || key;
}

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`lang-${lang === 'zh-TW' ? 'zh' : 'en'}`).classList.add('active');
    updateUI();
}

function updateUI() {
    document.querySelector('.header h1').textContent = t('title');
    document.querySelector('.subtitle').textContent = t('subtitle');
    document.querySelector('.upload-area h3').textContent = t('dropHere');
    document.querySelector('.upload-area p').textContent = t('orClick');
    document.querySelector('.upload-hint').textContent = t('supported');
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function translateText(text, sourceLang, targetLang) {
    if (sourceLang === 'auto') {
        sourceLang = /[\u4e00-\u9fff]/.test(text) ? 'zh' : 'en';
    }

    if (sourceLang === targetLang) return text;

    const dict = translations[sourceLang]?.[targetLang] || {};
    let result = text;

    Object.entries(dict).forEach(([source, target]) => {
        const regex = new RegExp(source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        result = result.replace(regex, target);
    });

    return result;
}

function renderFileList() {
    const container = document.getElementById('filesContainer');
    const fileList = document.getElementById('fileList');

    if (files.length === 0) {
        fileList.style.display = 'none';
        return;
    }

    fileList.style.display = 'block';
    container.innerHTML = files.map((file, index) => `
        <div class="file-item" data-index="${index}">
            <div class="file-name">
                <span class="file-icon">📄</span>
                <span>${file.name}</span>
            </div>
            <div>
                <span class="file-size">${formatFileSize(file.size)}</span>
                <button class="remove-btn" onclick="removeFile(${index})">✕</button>
            </div>
        </div>
    `).join('');
}

function removeFile(index) {
    files.splice(index, 1);
    renderFileList();
}

function handleFiles(fileList) {
    for (const file of fileList) {
        if (file.name.endsWith('.txt') || file.name.endsWith('.md')) {
            files.push(file);
        }
    }
    renderFileList();
}

async function translateAllFiles() {
    const sourceLang = document.getElementById('sourceLang').value;
    const targetLang = document.getElementById('targetLang').value;
    const resultsContainer = document.getElementById('resultsContainer');
    const resultsSection = document.getElementById('resultsSection');

    resultsContainer.innerHTML = '';
    const results = [];

    for (const file of files) {
        const text = await file.text();
        const translated = translateText(text, sourceLang, targetLang);
        results.push({
            name: file.name.replace(/\.(txt|md)$/, `_translated.$1`),
            content: translated
        });

        resultsContainer.innerHTML += `
            <div class="result-item">
                <div class="result-header">
                    <span>📄 ${file.name}</span>
                    <button class="link-btn" onclick="downloadResult('${encodeURIComponent(results[results.length - 1].name)}', \`${encodeURIComponent(translated)}\`)">${t('download')}</button>
                </div>
                <div class="result-content">${translated.substring(0, 500)}${translated.length > 500 ? '...' : ''}</div>
            </div>
        `;
    }

    resultsSection.style.display = 'block';
    window.translationResults = results;
}

function downloadResult(name, content) {
    const blob = new Blob([decodeURIComponent(content)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = decodeURIComponent(name);
    a.click();
    URL.revokeObjectURL(url);
}

function downloadAllResults() {
    if (!window.translationResults) return;

    window.translationResults.forEach(result => {
        downloadResult(encodeURIComponent(result.name), encodeURIComponent(result.content));
    });
}

function init() {
    setLanguage(navigator.language.startsWith('zh') ? 'zh-TW' : 'en');

    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    uploadArea.addEventListener('click', () => fileInput.click());

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });

    fileInput.addEventListener('change', () => {
        handleFiles(fileInput.files);
        fileInput.value = '';
    });

    document.getElementById('clearAllBtn').addEventListener('click', () => {
        files = [];
        renderFileList();
        document.getElementById('resultsSection').style.display = 'none';
    });

    document.getElementById('translateAllBtn').addEventListener('click', translateAllFiles);
    document.getElementById('downloadAllBtn').addEventListener('click', downloadAllResults);
}

init();
