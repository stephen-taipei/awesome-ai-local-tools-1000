/**
 * Image Format Converter
 * Tool #061 - Awesome AI Local Tools
 *
 * Convert images using Canvas API
 */

const translations = {
    'zh-TW': {
        title: '圖片格式轉換',
        subtitle: '在 PNG、JPG、WebP 等格式間轉換，完全本地處理',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        uploadText: '點擊或拖放圖片到這裡',
        uploadHint: '支援多種圖片格式',
        preview: '預覽',
        settings: '轉換設定',
        format: '目標格式',
        quality: '品質',
        convert: '下載轉換後的圖片',
        newImage: '選擇新圖片',
        backToHome: '返回首頁',
        toolNumber: '工具 #061',
        copyright: 'Awesome AI Local Tools © 2024'
    },
    'en': {
        title: 'Image Format Converter',
        subtitle: 'Convert images locally',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        uploadText: 'Click or drag image here',
        uploadHint: 'Supports multiple formats',
        preview: 'Preview',
        settings: 'Settings',
        format: 'Target Format',
        quality: 'Quality',
        convert: 'Download Converted Image',
        newImage: 'New Image',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #061',
        copyright: 'Awesome AI Local Tools © 2024'
    }
};

let currentLang = 'zh-TW';
let originalFile = null;
let originalImage = null;
let targetFormat = 'image/png';
let quality = 0.92;

document.addEventListener('DOMContentLoaded', () => {
    initLanguage();
    initEventListeners();
});

function initLanguage() {
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && translations[savedLang]) {
        currentLang = savedLang;
    }
    updateLanguage();
}

function updateLanguage() {
    const t = translations[currentLang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.textContent = t[key];
    });

    const langZhBtn = document.getElementById('lang-zh');
    const langEnBtn = document.getElementById('lang-en');

    if (currentLang === 'zh-TW') {
        langZhBtn.classList.add('active');
        langEnBtn.classList.remove('active');
    } else {
        langEnBtn.classList.add('active');
        langZhBtn.classList.remove('active');
    }
    localStorage.setItem('preferredLanguage', currentLang);
}

function initEventListeners() {
    document.getElementById('lang-zh').addEventListener('click', () => { currentLang = 'zh-TW'; updateLanguage(); });
    document.getElementById('lang-en').addEventListener('click', () => { currentLang = 'en'; updateLanguage(); });

    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    uploadArea.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) processFile(e.target.files[0]);
    });

    uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('dragover'); });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        if (e.dataTransfer.files.length) processFile(e.dataTransfer.files[0]);
    });

    // Format buttons
    document.querySelectorAll('.format-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.format-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            targetFormat = btn.dataset.format;

            const qualityGroup = document.getElementById('qualityGroup');
            if (targetFormat === 'image/jpeg' || targetFormat === 'image/webp') {
                qualityGroup.style.display = 'block';
            } else {
                qualityGroup.style.display = 'none';
            }
        });
    });

    // Quality slider
    const qualitySlider = document.getElementById('qualitySlider');
    qualitySlider.addEventListener('input', (e) => {
        quality = parseInt(e.target.value) / 100;
        document.getElementById('qualityValue').textContent = `${e.target.value}%`;
    });

    document.getElementById('convertBtn').addEventListener('click', convertAndDownload);
    document.getElementById('newImageBtn').addEventListener('click', () => location.reload());
}

function processFile(file) {
    if (!file.type.startsWith('image/')) return;
    originalFile = file;

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            originalImage = img;
            document.getElementById('previewImage').src = img.src;
            document.getElementById('fileInfo').textContent = `${file.name} (${(file.size/1024).toFixed(1)} KB)`;
            document.getElementById('uploadArea').style.display = 'none';
            document.getElementById('resultArea').style.display = 'block';
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function convertAndDownload() {
    if (!originalImage) return;

    const canvas = document.createElement('canvas');
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    const ctx = canvas.getContext('2d');

    // Fill white background for non-transparent formats
    if (targetFormat === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(originalImage, 0, 0);

    const dataUrl = canvas.toDataURL(targetFormat, quality);

    const extMap = {
        'image/png': 'png',
        'image/jpeg': 'jpg',
        'image/webp': 'webp'
    };

    const link = document.createElement('a');
    const originalName = originalFile.name.substring(0, originalFile.name.lastIndexOf('.')) || originalFile.name;
    link.download = `${originalName}-converted.${extMap[targetFormat]}`;
    link.href = dataUrl;
    link.click();
}
