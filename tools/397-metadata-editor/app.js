/**
 * Metadata Editor - Tool #397
 * View and export video metadata
 */

let currentLang = 'zh';
let videoFile = null;
let customFields = [];

const texts = {
    zh: {
        title: '影片元資料編輯',
        subtitle: '查看並匯出影片元資料',
        privacy: '100% 本地處理 · 零資料上傳',
        upload: '拖放影片檔案至此或點擊上傳',
        uploadHint: '支援 MP4, WebM, MOV',
        metadataTitle: '元資料',
        basic: '基本資訊',
        technical: '技術資訊',
        custom: '自訂欄位',
        videoTitle: '標題',
        description: '描述',
        author: '作者',
        tags: '標籤',
        addField: '+ 新增欄位',
        exportJson: '📄 匯出 JSON',
        exportXml: '📄 匯出 XML',
        copy: '📋 複製',
        copied: '已複製！',
        fileName: '檔案名稱',
        fileSize: '檔案大小',
        fileType: '檔案類型',
        duration: '時長',
        resolution: '解析度',
        aspectRatio: '寬高比',
        lastModified: '最後修改'
    },
    en: {
        title: 'Metadata Editor',
        subtitle: 'View and export video metadata',
        privacy: '100% Local Processing · No Data Upload',
        upload: 'Drop video file here or click to upload',
        uploadHint: 'Supports MP4, WebM, MOV',
        metadataTitle: 'Metadata',
        basic: 'Basic Info',
        technical: 'Technical Info',
        custom: 'Custom Fields',
        videoTitle: 'Title',
        description: 'Description',
        author: 'Author',
        tags: 'Tags',
        addField: '+ Add Field',
        exportJson: '📄 Export JSON',
        exportXml: '📄 Export XML',
        copy: '📋 Copy',
        copied: 'Copied!',
        fileName: 'File Name',
        fileSize: 'File Size',
        fileType: 'File Type',
        duration: 'Duration',
        resolution: 'Resolution',
        aspectRatio: 'Aspect Ratio',
        lastModified: 'Last Modified'
    }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    setupFileUpload();
    setupTabs();
    setupActions();
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');
    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.getElementById('metadataTitle').textContent = t.metadataTitle;
    document.getElementById('tabBasic').textContent = t.basic;
    document.getElementById('tabTechnical').textContent = t.technical;
    document.getElementById('tabCustom').textContent = t.custom;
    document.getElementById('titleLabel').textContent = t.videoTitle;
    document.getElementById('descLabel').textContent = t.description;
    document.getElementById('authorLabel').textContent = t.author;
    document.getElementById('tagsLabel').textContent = t.tags;
    document.getElementById('addFieldBtn').textContent = t.addField;
    document.getElementById('exportJsonBtn').textContent = t.exportJson;
    document.getElementById('exportXmlBtn').textContent = t.exportXml;
    document.getElementById('copyBtn').textContent = t.copy;

    if (videoFile) {
        updateTechInfo();
    }
}

function setupFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', (e) => e.preventDefault());
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', (e) => { if (e.target.files.length) handleFile(e.target.files[0]); });
}

function setupTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`${btn.dataset.tab}Tab`).classList.add('active');
        });
    });

    document.getElementById('addFieldBtn').addEventListener('click', addCustomField);
}

function setupActions() {
    document.getElementById('exportJsonBtn').addEventListener('click', exportJSON);
    document.getElementById('exportXmlBtn').addEventListener('click', exportXML);
    document.getElementById('copyBtn').addEventListener('click', copyMetadata);
}

function handleFile(file) {
    videoFile = file;
    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('editorContent').style.display = 'block';

    const video = document.getElementById('inputVideo');
    video.src = URL.createObjectURL(file);

    // Set default title from filename
    document.getElementById('metaTitle').value = file.name.replace(/\.[^/.]+$/, '');

    video.onloadedmetadata = () => {
        updateTechInfo();
    };
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDuration(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
}

function updateTechInfo() {
    const t = texts[currentLang];
    const video = document.getElementById('inputVideo');
    const w = video.videoWidth, h = video.videoHeight;
    const d = gcd(w, h);

    const info = [
        { label: t.fileName, value: videoFile.name },
        { label: t.fileSize, value: formatFileSize(videoFile.size) },
        { label: t.fileType, value: videoFile.type || 'unknown' },
        { label: t.duration, value: formatDuration(video.duration) },
        { label: t.resolution, value: `${w}×${h}` },
        { label: t.aspectRatio, value: `${w/d}:${h/d}` },
        { label: t.lastModified, value: new Date(videoFile.lastModified).toLocaleString() }
    ];

    document.getElementById('techInfo').innerHTML = info.map(item => `
        <div class="tech-item">
            <div class="tech-label">${item.label}</div>
            <div class="tech-value">${item.value}</div>
        </div>
    `).join('');
}

function addCustomField() {
    const id = Date.now();
    customFields.push({ id, key: '', value: '' });
    renderCustomFields();
}

function renderCustomFields() {
    const container = document.getElementById('customFields');
    container.innerHTML = customFields.map(field => `
        <div class="custom-field" data-id="${field.id}">
            <input type="text" placeholder="欄位名稱" value="${field.key}" onchange="updateCustomField(${field.id}, 'key', this.value)">
            <input type="text" placeholder="值" value="${field.value}" onchange="updateCustomField(${field.id}, 'value', this.value)">
            <button onclick="removeCustomField(${field.id})">×</button>
        </div>
    `).join('');
}

function updateCustomField(id, prop, value) {
    const field = customFields.find(f => f.id === id);
    if (field) field[prop] = value;
}

function removeCustomField(id) {
    customFields = customFields.filter(f => f.id !== id);
    renderCustomFields();
}

function getMetadataObject() {
    const video = document.getElementById('inputVideo');
    const w = video.videoWidth, h = video.videoHeight;
    const d = gcd(w, h);

    const metadata = {
        title: document.getElementById('metaTitle').value,
        description: document.getElementById('metaDescription').value,
        author: document.getElementById('metaAuthor').value,
        tags: document.getElementById('metaTags').value.split(',').map(t => t.trim()).filter(t => t),
        file: {
            name: videoFile.name,
            size: videoFile.size,
            type: videoFile.type,
            lastModified: new Date(videoFile.lastModified).toISOString()
        },
        video: {
            duration: video.duration,
            width: w,
            height: h,
            aspectRatio: `${w/d}:${h/d}`
        },
        custom: {}
    };

    customFields.forEach(f => {
        if (f.key) metadata.custom[f.key] = f.value;
    });

    return metadata;
}

function exportJSON() {
    const metadata = getMetadataObject();
    const blob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `metadata-${Date.now()}.json`;
    a.click();
}

function exportXML() {
    const metadata = getMetadataObject();

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<metadata>\n';
    xml += `  <title>${escapeXml(metadata.title)}</title>\n`;
    xml += `  <description>${escapeXml(metadata.description)}</description>\n`;
    xml += `  <author>${escapeXml(metadata.author)}</author>\n`;
    xml += '  <tags>\n';
    metadata.tags.forEach(tag => {
        xml += `    <tag>${escapeXml(tag)}</tag>\n`;
    });
    xml += '  </tags>\n';
    xml += '  <file>\n';
    xml += `    <name>${escapeXml(metadata.file.name)}</name>\n`;
    xml += `    <size>${metadata.file.size}</size>\n`;
    xml += `    <type>${escapeXml(metadata.file.type)}</type>\n`;
    xml += `    <lastModified>${metadata.file.lastModified}</lastModified>\n`;
    xml += '  </file>\n';
    xml += '  <video>\n';
    xml += `    <duration>${metadata.video.duration}</duration>\n`;
    xml += `    <width>${metadata.video.width}</width>\n`;
    xml += `    <height>${metadata.video.height}</height>\n`;
    xml += `    <aspectRatio>${metadata.video.aspectRatio}</aspectRatio>\n`;
    xml += '  </video>\n';
    xml += '</metadata>';

    const blob = new Blob([xml], { type: 'application/xml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `metadata-${Date.now()}.xml`;
    a.click();
}

function escapeXml(str) {
    return str.replace(/[<>&'"]/g, c => ({
        '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;'
    }[c]));
}

function copyMetadata() {
    const t = texts[currentLang];
    const metadata = getMetadataObject();
    navigator.clipboard.writeText(JSON.stringify(metadata, null, 2)).then(() => {
        const btn = document.getElementById('copyBtn');
        btn.textContent = t.copied;
        setTimeout(() => btn.textContent = t.copy, 2000);
    });
}

init();
